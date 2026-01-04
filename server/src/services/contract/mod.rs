use casper_client::JsonRpcId;
use rand::Rng;

pub(crate) mod diff;
pub(crate) mod metadata;
pub(crate) mod package;

pub async fn get_state_root_hash(node_address: &String) -> Result<String, String> {
    let rpc_id = JsonRpcId::from(rand::rng().random::<i64>());

    let state_root = casper_client::get_state_root_hash(
        rpc_id,
        node_address,
        casper_client::Verbosity::Low,
        None,
    )
    .await
    .map_err(|e| format!("Failed to get state root digest: {:?}", e.to_string()))?;

    let state_root_hash = state_root.result.state_root_hash;
    if state_root_hash.is_none() {
        return Err("Failed to obtain state root digest".to_string());
    }

    let state_root_hash_raw = state_root_hash.unwrap();

    let hash_str = format!("{:?}", state_root_hash_raw);
    let hex_chars: String = hash_str.chars().filter(|c| c.is_ascii_hexdigit()).collect();

    if hex_chars.len() == 64 {
        Ok(hex_chars)
    } else {
        Err(format!(
            "Unable to extract full 64-character hex hash from: {}. Raw value: {:?}",
            hash_str, hash_str
        ))
    }
}
