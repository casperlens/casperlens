use std::sync::Arc;

use crate::{
    config::AppState,
    models::{
        api::{ApiResponse, contract::RegisterContractRequest}, schema::contract::ContractPackageSchema,
    },
    services::{contract::{metadata::get_contract_package_metadata, package::get_contract_package_details}, database::contract::insert_contract_package},
};
use axum::{
    extract::{Json, Path, State},
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
pub async fn register_contract(
    state: State<Arc<AppState>>,
    Path(user_id): Path<Uuid>,
    Json(payload): Json<RegisterContractRequest>,
) -> impl IntoResponse {
    match resolve_network(&payload.network.to_string()) {
        Some(network) => {
            let package_hash = normalize_hash(&payload.package_hash);
            let node_address: String; 
            if network == "testnet" {
                node_address = state.config.testnet_node_address.clone();
            } else {
                node_address = state.config.mainnet_node_address.clone();
            }
            
            let contract_package_details = get_contract_package_details(
                node_address,
                package_hash.clone(),
            )
            .await;
            
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
                        package_hash,
                        user_id,
                        contract_name,
                        owner_id,
                        network,
                        lock_status,
                        age
                    );
                    match insert_contract_package(
                        &state.db,
                        &contract_package                        
                    )
                    .await
                    {
                        Ok(()) => {
                            return Json(ApiResponse {
                                success: true,
                                message: "Contract registered successfully".to_string(),
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