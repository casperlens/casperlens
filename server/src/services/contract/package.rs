use casper_types::contracts::ContractPackage;
use casper_client::JsonRpcId;
use rand::Rng;


/// Get contract package by obtaining state root hash and querying global state based
pub async fn get_contract_package_details(node_address: String, package_hash: String) -> Result<ContractPackage, String> {
    let rpc_id = JsonRpcId::from(rand::rng().random::<i64>());
    let state_root = casper_client::get_state_root_hash(rpc_id, &node_address, casper_client::Verbosity::Low, None).await.map_err(|e| "Failed to get state root digest".to_string())?;
    let state_root_hash = state_root.result.state_root_hash;
    if let None = state_root_hash {
        return Err("Failed to obtain state root dig".to_string());
    }
    let state_root_hash: String = state_root_hash.unwrap().to_string();
    let package_response = casper_client::cli::query_global_state("", &node_address, 0, "", &state_root_hash, &package_hash, "").await.map_err(|e| e.to_string())?;
    let package_details = package_response.result.stored_value.as_contract_package();
    if let Some(package) = package_details {
        return Ok(package.to_owned());
    } else {
        return Err("The provided hash does not correspond to contract package".to_string());
    }
}