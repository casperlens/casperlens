use casper_types::contracts::ContractPackage;

use crate::services::contract::get_state_root_hash;


/// Get contract package by obtaining state root hash and querying global state based
pub async fn get_contract_package_details(node_address: String, package_hash: String) -> Result<ContractPackage, String> {
    let state_root_hash = get_state_root_hash(&node_address).await?;
    let package_response = casper_client::cli::query_global_state("", &node_address, 0, "", &state_root_hash, &package_hash, "").await.map_err(|e| e.to_string())?;
    let package_details = package_response.result.stored_value.as_contract_package();
    if let Some(package) = package_details {
        return Ok(package.to_owned());
    } else {
        return Err("The provided hash does not correspond to contract package".to_string());
    }
}