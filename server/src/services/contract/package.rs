use casper_types::contracts::ContractPackage;
use crate::services::contract::get_state_root_hash;

/// Get contract package by obtaining state root hash and querying global state based
pub async fn get_contract_package_details(
    node_address: String,
    package_hash: String,
) -> Result<ContractPackage, String> {
    let raw_package_hash = package_hash
        .strip_prefix("hash-")
        .unwrap_or(&package_hash);
    
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
    
    let response = casper_client::cli::query_global_state(
        "",
        &node_address,
        0,
        "",
        &state_root_hash,
        &package_hash,
        "",
    )
    .await
    .map_err(|e| format!("Casper node query failed: {}", e))?;
    
    match response.result.stored_value.as_contract_package() {
        Some(pkg) => Ok(pkg.to_owned()),
        None => Err(
            "The provided hash does not correspond to a ContractPackage".to_string(),
        ),
    }
}