use std::sync::Arc;

use crate::{
    config::AppState,
    models::{
        api::{
            ApiResponse,
            contract::{
                ContractData, ContractDiffQuery, ContractOverview, ContractVersionData,
                RegisterContractRequest,
            },
        },
        schema::contract::{ContractPackageSchema, ContractVersionDiff},
    },
    services::{
        contract::{
            diff::{fetch_contract_diff_from_chain, get_contract_version_diff},
            metadata::get_contract_package_metadata,
            package::{get_contract_package_details, get_contract_versions_details},
        },
        database::contract::{
            get_all_contracts, get_contract_package, get_contract_version, get_contract_versions,
            insert_contract_package, insert_contract_package_versions,
        },
        tasks::contract::{write_contract_diff_to_chain, write_contract_diff_versions_to_chain},
    },
};
use axum::{
    extract::{Json, Path, Query, State},
    response::IntoResponse,
};
use chrono::{DateTime, Utc};
use uuid::Uuid;

fn resolve_network(network: &str) -> Option<String> {
    const MAINNET: &str = "mainnet";
    const TESTNET: &str = "testnet";
    match network {
        MAINNET => Some("mainnet".to_string()),
        TESTNET => Some("testnet".to_string()),
        _ => None,
    }
}

fn normalize_hash(input: &str) -> String {
    if input.starts_with("hash-") {
        input.to_string()
    } else {
        format!("hash-{}", input)
    }
}

fn strip_hash_prefix(input: &str) -> String {
    if let Some(stripped) = input.strip_prefix("hash-") {
        stripped.to_string()
    } else {
        input.to_string()
    }
}

#[axum::debug_handler]
pub async fn get_contract_details(
    state: State<Arc<AppState>>,
    Path((user_id, package_hash)): Path<(Uuid, String)>,
) -> impl IntoResponse {
    let package_hash = strip_hash_prefix(&package_hash);

    match get_contract_package(&state.db, &user_id, &package_hash).await {
        Ok(Some(pkg)) => match get_contract_versions(&state.db, &package_hash, &user_id).await {
            Ok(versions) => {
                let versions_data: Vec<ContractVersionData> = versions
                    .into_iter()
                    .map(|v| {
                        let named_keys: Vec<String> =
                            v.named_keys.iter().map(|(k, _)| k.clone()).collect();
                        let entry_points: Vec<String> = v
                            .entry_points
                            .iter()
                            .map(|ep| ep.name().to_string())
                            .collect();

                        ContractVersionData {
                            protocol_major_version: v.protocol_major_version,
                            contract_version: v.contract_version,
                            contract_package_hash: v.contract_package_hash,
                            contract_hash: v.contract_hash,
                            contract_wasm_hash: v.contract_wasm_hash,
                            user_id: v.user_id.to_string(),
                            protocol_version: v.protocol_version,
                            named_keys,
                            entry_points,
                            disabled: v.disabled,
                            age: format!("{}d", (Utc::now() - v.age).num_days()),
                        }
                    })
                    .collect();

                let contract_data = ContractData {
                    package_hash: pkg.package_hash,
                    contract_name: pkg.contract_name,
                    owner_id: pkg.owner_id,
                    network: pkg.network,
                    lock_status: pkg.lock_status,
                    age: (Utc::now() - pkg.age).num_days(),
                    versions: versions_data,
                };

                Json(ApiResponse {
                    success: true,
                    message: "Contract details fetched successfully".to_string(),
                    error: None::<String>,
                    data: Some(contract_data),
                })
                .into_response()
            }
            Err(e) => Json(ApiResponse {
                success: false,
                message: "Failed to fetch contract versions".to_string(),
                error: Some(e.to_string()),
                data: None::<String>,
            })
            .into_response(),
        },
        Ok(None) => Json(ApiResponse {
            success: false,
            message: "Contract package not found".to_string(),
            error: Some("Contract package not found".to_string()),
            data: None::<String>,
        })
        .into_response(),
        Err(e) => Json(ApiResponse {
            success: false,
            message: "Failed to fetch contract package".to_string(),
            error: Some(e.to_string()),
            data: None::<String>,
        })
        .into_response(),
    }
}

#[axum::debug_handler]
pub async fn get_contracts_overview(
    state: State<Arc<AppState>>,
    Path(user_id): Path<Uuid>,
) -> impl IntoResponse {
    match get_all_contracts(&state.db, &user_id).await {
        Ok(contracts) => {
            let overview: Vec<ContractOverview> = contracts
                .into_iter()
                .map(|c| ContractOverview {
                    package_hash: c.package_hash,
                    contract_name: c.contract_name,
                    owner_id: c.owner_id,
                    network: c.network,
                    lock_status: c.lock_status,
                    age: (Utc::now() - c.age).num_days(),
                })
                .collect();

            Json(ApiResponse {
                success: true,
                message: "Contracts fetched successfully".to_string(),
                error: None::<String>,
                data: Some(overview),
            })
            .into_response()
        }
        Err(e) => Json(ApiResponse {
            success: false,
            message: "Failed to fetch contracts".to_string(),
            error: Some(e.to_string()),
            data: None::<String>,
        })
        .into_response(),
    }
}

#[axum::debug_handler]
pub async fn get_contract_diff(
    state: State<Arc<AppState>>,
    Path((user_id, package_hash)): Path<(Uuid, String)>,
    Query(query): Query<ContractDiffQuery>,
) -> impl IntoResponse {
    let package_hash = strip_hash_prefix(&package_hash);

    let v1_db = match get_contract_version(&state.db, &package_hash, query.v1, &user_id).await {
        Ok(Some(v)) => v,
        Ok(None) => {
            return Json(ApiResponse {
                success: false,
                message: "Version 1 not found".to_string(),
                error: Some(format!("Contract version {} not found", query.v1)),
                data: None::<String>,
            })
            .into_response();
        }
        Err(e) => {
            return Json(ApiResponse {
                success: false,
                message: "Database error".to_string(),
                error: Some(e.to_string()),
                data: None::<String>,
            })
            .into_response();
        }
    };

    let v2_db = match get_contract_version(&state.db, &package_hash, query.v2, &user_id).await {
        Ok(Some(v)) => v,
        Ok(None) => {
            return Json(ApiResponse {
                success: false,
                message: "Version 2 not found".to_string(),
                error: Some(format!("Contract version {} not found", query.v2)),
                data: None::<String>,
            })
            .into_response();
        }
        Err(e) => {
            return Json(ApiResponse {
                success: false,
                message: "Database error".to_string(),
                error: Some(e.to_string()),
                data: None::<String>,
            })
            .into_response();
        }
    };

    // Try to fetch from chain first
    let contract_package = get_contract_package(&state.db, &user_id, &package_hash).await;
    let mut resolved_node_address = state.config.mainnet_node_address.clone();
    let mut resolved_network = "mainnet".to_string();

    if let Ok(Some(pkg)) = contract_package {
        resolved_network = pkg.network.clone();
        resolved_node_address = if pkg.network == "testnet" {
            state.config.testnet_node_address.clone()
        } else {
            state.config.mainnet_node_address.clone()
        };

        if let Ok(Some(diff)) = fetch_contract_diff_from_chain(
            &v1_db,
            &v2_db,
            &package_hash,
            &state.config.observability_package_hash,
            &resolved_node_address,
        )
        .await
        {
            return Json(ApiResponse {
                success: true,
                message: "Diff fetched from chain successfully".to_string(),
                error: None::<String>,
                data: Some(diff),
            })
            .into_response();
        }
    }

    match get_contract_version_diff(v1_db.clone(), v2_db.clone()).await {
        Ok(diff) => {
            // Spawn background task to store the calculated diff
            let observability_package_hash = state.config.observability_package_hash.clone();
            let package_hash_clone = package_hash.clone();
            let v1_clone = v1_db.clone();
            let v2_clone = v2_db.clone();
            let diff_clone = diff.clone();

            tokio::spawn(async move {
                match write_contract_diff_to_chain(
                    &package_hash_clone,
                    &v1_clone,
                    &v2_clone,
                    &diff_clone,
                    &resolved_network,
                    &observability_package_hash,
                    &resolved_node_address,
                )
                .await
                {
                    Ok(_) => log::info!(
                        "Successfully stored diff for {} v{} -> v{}",
                        package_hash_clone,
                        v1_clone.contract_version,
                        v2_clone.contract_version
                    ),
                    Err(e) => log::error!(
                        "Failed to store diff for {} v{} -> v{}: {}",
                        package_hash_clone,
                        v1_clone.contract_version,
                        v2_clone.contract_version,
                        e
                    ),
                }
            });

            Json(ApiResponse {
                success: true,
                message: "Diff calculated successfully".to_string(),
                error: None::<String>,
                data: Some(diff),
            })
            .into_response()
        }
        Err(e) => Json(ApiResponse {
            success: false,
            message: "Failed to calculate diff".to_string(),
            error: Some(e),
            data: None::<String>,
        })
        .into_response(),
    }
}

#[axum::debug_handler]
pub async fn get_diff_analysis(
    state: State<Arc<AppState>>,
    Path(_user_id): Path<Uuid>,
    Json(payload): Json<ContractVersionDiff>,
) -> impl IntoResponse {
    let hf_token = state.config.huggingface_token.clone();
    let content = format!(
        "There are 2 smart contract deployment for same package on Casper Network. This is the diff between them:\n{:#?}\nwhere v1 contains metadata on previous version and v2 on new version, entry points and named keys show the changes from v1 to v2. Explain what it means for smart contract and how it affects development and security",
        payload
    );
    let body = serde_json::json!({
        "messages": [
            {
                "role": "user",
                "content": content
            }
        ],
        "model": "meta-llama/Llama-3.1-8B-Instruct:cerebras",
        "stream": false
    });
    let client = reqwest::Client::new();

    let response = client
        .post("https://router.huggingface.co/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", hf_token))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await;
    if let Err(err) = &response {
        return Json(ApiResponse {
            success: false,
            message: "Failed to get completions for diff".to_string(),
            error: Some(format!("Failed to get completions for diff: {}", err)),
            data: None::<String>,
        })
        .into_response();
    }
    let response = response.unwrap();
    if response.status().is_success() {
        let response_body = response.json::<serde_json::Value>().await;
        if let Err(e) = response_body {
            return Json(ApiResponse {
                success: false,
                message: "Failed to parse response to JSON".to_string(),
                error: Some(format!("Failed to parse response to JSON: {}", e)),
                data: None::<String>,
            })
            .into_response();
        }
        let response_body = response_body.unwrap();
        if let Some(choice) = response_body.get("choices") {
            if let Some(idx) = choice.get(0) {
                if let Some(message) = idx.get("message") {
                    if let Some(content) = message.get("content") {
                        return Json(ApiResponse {
                            success: true,
                            message: "Successfully retrieved response".to_string(),
                            error: None::<String>,
                            data: Some(content.as_str().to_owned()),
                        })
                        .into_response();
                    }
                }
            }
        }
        return Json(ApiResponse {
            success: false,
            message: "Failed to get data from response by parsing".to_string(),
            error: Some("Failed to get data from response by parsing".to_string()),
            data: None::<String>,
        })
        .into_response();
    } else {
        Json(ApiResponse {
            success: false,
            message: "Request failed".to_string(),
            error: Some(format!(
                "Request failed with status code: {}",
                response.status()
            )),
            data: None::<String>,
        })
        .into_response()
    }
}

#[axum::debug_handler]

pub async fn register_contract(
    state: State<Arc<AppState>>,
    Path(user_id): Path<Uuid>,
    Json(payload): Json<RegisterContractRequest>,
) -> impl IntoResponse {
    match resolve_network(&payload.network.to_string()) {
        Some(network) => {
            let package_hash_norm = normalize_hash(&payload.package_hash);
            let node_address: String = if network == "testnet" {
                state.config.testnet_node_address.clone()
            } else {
                state.config.mainnet_node_address.clone()
            };
            let contract_package_details =
                get_contract_package_details(node_address.clone(), package_hash_norm.clone()).await;

            match contract_package_details {
                Ok(data) => {
                    let mut package_hash: String = payload.package_hash.clone();

                    if let Some(stripped) = package_hash.strip_prefix("hash-") {
                        package_hash = stripped.to_string();
                    }

                    let package_meta = get_contract_package_metadata(&network, &package_hash).await;

                    if let Err(e) = package_meta {
                        return Json(ApiResponse {
                            success: false,
                            message: "Failed to register contract".to_string(),
                            error: Some(format!("Failed to get contract package metadata: {}", e)),
                            data: None::<String>,
                        })
                        .into_response();
                    }

                    let package_meta = package_meta.unwrap();
                    let package_hash = package_hash.clone();
                    let contract_name = payload.package_name.clone();
                    let owner_id = package_meta.owner_public_key.clone();
                    let lock_status = data.is_locked();
                    let age = package_meta.timestamp.clone().parse::<DateTime<Utc>>();

                    if let Err(e) = age {
                        return Json(ApiResponse {
                            success: false,
                            message: "Failed to register contract".to_string(),
                            error: Some(format!("Failed to parse date: {}", e)),
                            data: None::<String>,
                        })
                        .into_response();
                    }

                    let age = age.unwrap();

                    let contract_package = ContractPackageSchema::new(
                        package_hash.clone(),
                        user_id,
                        contract_name,
                        owner_id,
                        network.clone(),
                        lock_status,
                        age,
                    );

                    let versions_details = match get_contract_versions_details(
                        &node_address,
                        &network,
                        user_id,
                        data.versions(),
                    )
                    .await
                    {
                        Ok(v) => v,

                        Err(e) => {
                            return Json(ApiResponse {
                                success: false,
                                message: "Failed to fetch contract versions".to_string(),
                                error: Some(e),
                                data: None::<String>,
                            })
                            .into_response();
                        }
                    };

                    match insert_contract_package(&state.db, &contract_package).await {
                        Ok(()) => {
                            if let Err(e) = insert_contract_package_versions(
                                &state.db,
                                versions_details.clone(),
                            )
                            .await
                            {
                                return Json(ApiResponse {
                                    success: false,
                                    message: "Contract registered but failed to store versions"
                                        .to_string(),
                                    error: Some(e.to_string()),
                                    data: None::<String>,
                                })
                                .into_response();
                            }

                            let _ = write_contract_diff_versions_to_chain(
                                &package_hash,
                                versions_details,
                                &network,
                                &state.config.observability_package_hash,
                                &node_address,
                            )
                            .await;

                            Json(ApiResponse {
                                success: true,
                                message: "Contract and its versions registered successfully"
                                    .to_string(),
                                error: None::<String>,
                                data: None::<String>,
                            })
                            .into_response()
                        }

                        Err(e) => {
                            return Json(ApiResponse {
                                success: false,
                                message: "Failed to register contract".to_string(),
                                error: Some(format!("Database error: {}", e)),
                                data: None::<String>,
                            })
                            .into_response();
                        }
                    }
                }

                Err(error) => Json(ApiResponse {
                    success: false,
                    message: "Failed to register contract".to_string(),
                    error: Some(format!("Contract package query error: {error}")),
                    data: None::<String>,
                })
                .into_response(),
            }
        }

        None => Json(ApiResponse {
            success: false,
            message: "Invalid network provided".to_string(),
            error: Some("Network must be one of: mainnet, testnet, localnet".to_string()),
            data: None::<String>,
        })
        .into_response(),
    }
}
