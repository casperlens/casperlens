use core::net;

use crate::{
    config::AppState,
    models::{
        api::{ApiResponse, contract::RegisterContractRequest},
        schema::contract::{ContractPackage, Network},
    },
    services::contract::register::get_contract_package_details,
};
use axum::{
    Router,
    extract::{Json, Path},
    http::StatusCode,
    response::IntoResponse,
};
use sqlx::PgPool;
use uuid::Uuid;

fn resolve_network(network: &String) -> Option<String> {
    const MAINNET: &str = "mainnet";
    const TESTNET: &str = "testnet";
    const LOCALNET: &str = "localnet";
    let net: &str = network.as_str();
    match net {
        MAINNET => Some("mainnet".to_string()),
        TESTNET => Some("testnet".to_string()),
        LOCALNET => Some("localnet".to_string()),
        _ => None,
    }
}

async fn register_contract_handler(
    state: axum::extract::State<AppState>,
    Json(payload): Json<RegisterContractRequest>,
    Path(user_id): Path<Uuid>
) -> impl IntoResponse {
    match resolve_network(&payload.network.to_string()) {
        Some(network) => {
            let contract_package_details = get_contract_package_details(
                state.config.node_address,
                payload.package_hash.clone(),
            )
            .await;
            match contract_package_details {
                Ok(data) => {
                    let user_id = user_id.clone();
                    let package_hash = payload.package_hash.clone();
                    let contract_name = payload.package_name.clone();
                    let contract_package = ContractPackage::new(
                        
                    );
                    match insert_contract_package(
                        &state.db,
                        user_id,
                        payload.package_hash,
                        payload.package_name,
                        network,
                    )
                    .await
                    {
                        Ok(()) => {
                            return Json(ApiResponse {
                                success: true,
                                message: "Contract registered successfully".to_string(),
                                error: None,
                                data: None,
                            })
                            .into_response();
                        }
                        Err(_) => {
                            return Json(ApiResponse {
                                success: false,
                                message: "Failed to register contract".to_string(),
                                error: Some("Database error".to_string()),
                                data: None,
                            })
                            .into_response();
                        }
                    }
                }
                Err(error) => Json(ApiResponse {
                    success: false,
                    message: "Failed to register contract".to_string(),
                    error: Some("Database error.".to_string()),
                    data: None,
                })
                .into_response(),
            }
        }
        None => Json(ApiResponse {
            success: false,
            message: "Invalid network provided".to_string(),
            error: Some("Network must be one of: mainnet, testnet, localnet".to_string()),
            data: None,
        })
        .into_response(),
    }
}
