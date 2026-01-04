use casper_client::{
    JsonRpcId,
    cli::{TransactionBuilderParams, TransactionStrParams},
};
use casper_types::PackageHash;
use chrono::Utc;
use rand::Rng;

use crate::{
    models::schema::contract::ContractVersionSchema,
    services::contract::diff::get_contract_version_diff,
};

pub async fn write_contract_diff_versions_to_chain(
    package_hash: &str,
    contract_versions: Vec<ContractVersionSchema>,
    network: &str,
    rpc_address: &String,
) -> Result<(), String> {
    if contract_versions.len() == 1 {
        return Ok(());
    }
    let mut prev_contract: Option<&ContractVersionSchema> = None;
    for contract_version in &contract_versions {
        match prev_contract {
            Some(val) => {
                let diff = get_contract_version_diff(val.clone(), contract_version.clone()).await?;
                let diff_str =
                    serde_json::to_string(&diff).map_err(|e| "Failed to serialize diff")?;
                let rpc_id = JsonRpcId::from(rand::rng().random::<i64>());
                let rpc_id_str = &rpc_id.to_string();
                let entry_point = "store_diff";
                let secret_key_path = "./secret-key.pem";
                let chain_name = match network {
                    "testnet" => "casper-test",
                    "mainnet" => "casper",
                    _ => "",
                };
                let ttl = "30min";
                let current_time = Utc::now().to_rfc3339();
                let builder_params = TransactionBuilderParams::Package {
                    package_hash: PackageHash::from_formatted_str(package_hash).unwrap(),
                    maybe_entity_version: None,
                    entry_point,
                    runtime: casper_types::TransactionRuntimeParams::VmCasperV2 {
                        transferred_value: 2500000000,
                        seed: None,
                    },
                };
                let version_id = format!(
                    "{}-{}-{}",
                    package_hash, contract_version.contract_version, val.contract_version
                );
                let session_args = serde_json::json!({
                    "args": [
                        {"name": "version_id", "type": "string", "value": version_id},
                        {"name": "diff", "type": "string", "value": diff_str},
                    ]
                });
                let session_args_str = serde_json::to_string_pretty(&session_args).unwrap();
                let transaction_params = TransactionStrParams {
                    secret_key: secret_key_path,
                    timestamp: &current_time,
                    ttl,
                    chain_name,
                    initiator_addr: String::new(),
                    session_args_simple: vec![],
                    session_args_json: &session_args_str,
                    pricing_mode: "fixed",
                    additional_computation_factor: "0",
                    output_path: "",
                    payment_amount: "2500000000",
                    gas_price_tolerance: "1",
                    receipt: "",
                    standard_payment: "true",
                    transferred_value: "2500000000",
                    session_entry_point: Some(entry_point),
                    chunked_args: None,
                    min_bid_override: false,
                };
                let result = casper_client::cli::put_transaction(
                    rpc_id_str,
                    rpc_address,
                    0,
                    builder_params,
                    transaction_params,
                )
                .await;
                log::info!("{:?}", result);
            }
            None => {
                prev_contract = Some(contract_version);
                continue;
            }
        }
    }
    Ok(())
}
