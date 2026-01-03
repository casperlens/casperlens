use rand::Rng;
use casper_client::JsonRpcId;

pub(crate) mod package;
pub(crate) mod metadata;
pub(crate) mod diff;

pub async fn get_state_root_hash(node_address: &String) -> Result<String, String> {
    let rpc_id = JsonRpcId::from(rand::rng().random::<i64>());
    let state_root = casper_client::get_state_root_hash(rpc_id, &node_address, casper_client::Verbosity::Low, None).await.map_err(|_e| "Failed to get state root digest".to_string())?;
    let state_root_hash = state_root.result.state_root_hash;
    if let None = state_root_hash {
        return Err("Failed to obtain state root dig".to_string());
    }
    let state_root_hash: String = state_root_hash.unwrap().to_string();
    Ok(state_root_hash)
}
