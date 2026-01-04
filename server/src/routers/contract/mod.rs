use std::sync::Arc;

use crate::{
    config::AppState,
    models::{
        api::{
            ApiResponse,
            contract::{ContractDiffQuery, ContractOverview, RegisterContractRequest},
        },
        schema::contract::{ContractPackageSchema, ContractVersionDiff},
    },
    services::{
        contract::{
            diff::get_contract_version_diff,
            metadata::get_contract_package_metadata,
            package::{
                get_contract_package_details, get_contract_version_details,
                get_contract_versions_details,
            },
        },
        database::contract::{
            get_all_contracts, get_contract_version, insert_contract_package,
            insert_contract_package_versions,
        },
    },
};
use axum::{
    extract::{Json, Path, Query, State},
    response::IntoResponse,
};
use chrono::{DateTime, Utc};
use uuid::Uuid;

fn resolve_network(network: &String) -> Option<String> {
    const MAINNET: &str = "mainnet";
    const TESTNET: &str = "testnet";
    let net: &str = network.as_str();
    match net {
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
    Path((_user_id, package_hash)): Path<(Uuid, String)>,
    Query(query): Query<ContractDiffQuery>,
) -> impl IntoResponse {
    let package_hash = normalize_hash(&package_hash);

    let v1_db = match get_contract_version(&state.db, &package_hash, query.v1, query.v1_maj).await {
        Ok(Some(v)) => v,
        Ok(None) => {
            return Json(ApiResponse {
                success: false,
                message: "Version 1 not found".to_string(),
                error: Some(format!(
                    "Contract version {} (maj {}) not found",
                    query.v1, query.v1_maj
                )),
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

    let v2_db = match get_contract_version(&state.db, &package_hash, query.v2, query.v2_maj).await {
        Ok(Some(v)) => v,
        Ok(None) => {
            return Json(ApiResponse {
                success: false,
                message: "Version 2 not found".to_string(),
                error: Some(format!(
                    "Contract version {} (maj {}) not found",
                    query.v2, query.v2_maj
                )),
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

    let network_row = sqlx::query!(
        "SELECT network FROM contract_packages WHERE package_hash = $1",
        package_hash
    )
    .fetch_optional(&state.db)
    .await;

    let network = match network_row {
        Ok(Some(row)) => row.network,
        Ok(None) => {
            return Json(ApiResponse {
                success: false,
                message: "Contract package not found".to_string(),
                error: Some("Package not found in database".to_string()),
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

    let node_address = if network == "testnet" {
        state.config.testnet_node_address.clone()
    } else {
        state.config.mainnet_node_address.clone()
    };

    let v1_contract =
        match get_contract_version_details(node_address.clone(), v1_db.contract_hash.clone()).await
        {
            Ok(c) => c,
            Err(e) => {
                return Json(ApiResponse {
                    success: false,
                    message: "Failed to fetch version 1 details from chain".to_string(),
                    error: Some(e),
                    data: None::<String>,
                })
                .into_response();
            }
        };

    let v2_contract =
        match get_contract_version_details(node_address, v2_db.contract_hash.clone()).await {
            Ok(c) => c,
            Err(e) => {
                return Json(ApiResponse {
                    success: false,
                    message: "Failed to fetch version 2 details from chain".to_string(),
                    error: Some(e),
                    data: None::<String>,
                })
                .into_response();
            }
        };

    let mut v1 = v1_db;
    v1.entry_points = v1_contract.entry_points().clone().take_entry_points();
    v1.named_keys = v1_contract.named_keys().clone();

    let mut v2 = v2_db;
    v2.entry_points = v2_contract.entry_points().clone().take_entry_points();
    v2.named_keys = v2_contract.named_keys().clone();

    match get_contract_version_diff(v1, v2).await {
        Ok(diff) => Json(ApiResponse {
            success: true,
            message: "Diff calculated successfully".to_string(),
            error: None::<String>,
            data: Some(diff),
        })
        .into_response(),
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
    Path((_user_id, _package_hash)): Path<(Uuid, String)>,
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
            if let Some(idx) = choice.get("0") {
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
        return Json(ApiResponse {
            success: false,
            message: "Request failed".to_string(),
            error: Some(format!(
                "Request failed with status code: {}",
                response.status()
            )),
            data: None::<String>,
        })
        .into_response();
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
            let node_address: String;
            if network == "testnet" {
                node_address = state.config.testnet_node_address.clone();
            } else {
                node_address = state.config.mainnet_node_address.clone();
            }
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
                    let user_id = user_id.clone();
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
                            if let Err(e) =
                                insert_contract_package_versions(&state.db, versions_details).await
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

                            return Json(ApiResponse {
                                success: true,
                                message: "Contract and its versions registered successfully"
                                    .to_string(),
                                error: None::<String>,
                                data: None::<String>,
                            })
                            .into_response();
                        }

                        Err(_) => {
                            return Json(ApiResponse {
                                success: false,
                                message: "Failed to register contract".to_string(),
                                error: Some("Database error".to_string()),
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
