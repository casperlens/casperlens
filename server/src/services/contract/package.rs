use casper_types::{
    Contract,
    contracts::{ContractPackage, ContractVersions},
};
use uuid::Uuid;

use crate::{
    models::schema::contract::ContractVersionSchema,
    services::contract::{get_state_root_hash, metadata::get_contract_version_metadata},
};

/// Get contract package by obtaining state root hash and querying global state based
pub async fn get_contract_package_details(
    node_address: String,
    package_hash: String,
) -> Result<ContractPackage, String> {
    let raw_package_hash = package_hash.strip_prefix("hash-").unwrap_or(&package_hash);

    if raw_package_hash.len() != 64 || !raw_package_hash.chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(format!(
            "Invalid contract package hash format: {}",
            package_hash
        ));
    }

    let package_hash = format!("hash-{}", raw_package_hash);
    let state_root_hash = get_state_root_hash(&node_address).await?;

    if state_root_hash.len() != 64 || !state_root_hash.chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(format!(
            "Invalid state root hash returned by node: {}",
            state_root_hash
        ));
    }

    let package_response = casper_client::cli::query_global_state(
        "",
        &node_address,
        0,
        "",
        &state_root_hash,
        &package_hash,
        "",
    )
    .await
    .map_err(|e| e.to_string())?;
    let package_details = package_response.result.stored_value.as_contract_package();
    if let Some(package) = package_details {
        return Ok(package.to_owned());
    }
    Err("The provided hash does not correspond to contract package".to_string())
}

pub async fn get_contract_versions_details(
    node_address: &String,
    network: &String,
    user_id: Uuid,
    versions: &ContractVersions,
) -> Result<Vec<ContractVersionSchema>, String> {
    let state_root_hash = get_state_root_hash(node_address).await?;
    let mut contract_versions_data: Vec<ContractVersionSchema> = vec![];
    for (cv_key, cv_value) in versions {
        let protocol_major_version = cv_key.protocol_version_major();
        let contract_version = cv_key.contract_version();
        let mut contract_hash = cv_value.to_formatted_string();
        let mut contract_hash_value: String = "".to_string();
        if let Some(stripped) = contract_hash.clone().strip_prefix("contract-") {
            contract_hash = format!("hash-{}", stripped.to_owned());
            contract_hash_value = format!("hash-{}", stripped.to_owned());
        }
        let contract_version_response = casper_client::cli::query_global_state(
            "",
            node_address,
            0,
            "",
            &state_root_hash,
            &contract_hash,
            "",
        )
        .await
        .map_err(|e| e.to_string())?;
        let contract_version_details = contract_version_response.result.stored_value.as_contract();
        if let Some(contract) = contract_version_details {
            let contract_version_meta =
                get_contract_version_metadata(network, &contract_hash_value).await?;
            let contract_package_hash = contract.contract_package_hash().to_string();
            let contract_wasm_hash = contract.contract_wasm_hash().to_string();
            let contract_protocol_version = contract.protocol_version().to_string();
            let entry_points = contract.entry_points().clone().take_entry_points();
            let named_keys = contract.named_keys().clone();
            let disabled = contract_version_meta.is_disabled;
            let age = contract_version_meta.timestamp;
            let contract_version_data = ContractVersionSchema {
                contract_version,
                protocol_major_version,
                protocol_version: contract_protocol_version,
                contract_package_hash,
                contract_hash: contract_hash_value,
                contract_wasm_hash,
                entry_points,
                named_keys,
                disabled,
                user_id,
                age,
            };
            contract_versions_data.push(contract_version_data);
        } else {
            return Err("The provided hash does not correspond to contract version".to_string());
        }
    }
    Ok(contract_versions_data)
}

/// Get contract version details
pub async fn get_contract_version_details(
    node_address: String,
    contract_hash: String,
) -> Result<Contract, String> {
    let state_root_hash = get_state_root_hash(&node_address).await?;
    let contract_response = casper_client::cli::query_global_state(
        "",
        &node_address,
        0,
        "",
        &state_root_hash,
        &contract_hash,
        "",
    )
    .await
    .map_err(|e| e.to_string())?;
    let contract_details = contract_response.result.stored_value.as_contract();
    if let Some(contract) = contract_details {
        return Ok(contract.to_owned());
    }
    Err("The provided hash does not correspond to contract version".to_string())
}
