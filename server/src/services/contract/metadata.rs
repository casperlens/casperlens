use crate::constants::headers::CONTRACT_PACKAGE_TESTNET_API_INCLUDES_PARAMS;
use crate::constants::network::{MAINNET_API_ENDPOINT, TESTNET_API_ENDPOINT};
use crate::models::schema::contract::{APIMetaResponse, ContractPackageMeta, ContractVersionMeta};

/// Fetch contract package metadata from cspr.live
pub async fn get_contract_package_metadata(
    network: &str,
    hash: &str,
) -> Result<ContractPackageMeta, String> {
    let endpoint = match network {
        "mainnet" => MAINNET_API_ENDPOINT,
        "testnet" => TESTNET_API_ENDPOINT,
        _ => return Err(format!("Unsupported network: {}", network)),
    };

    // cspr.live expects RAW hash (no `hash-`)
    let raw_hash = hash.strip_prefix("hash-").unwrap_or(hash);

    if raw_hash.len() != 64 || !raw_hash.chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(format!("Invalid contract package hash: {}", raw_hash));
    }

    let url = format!(
        "{}/contract-packages/{}?includes={}",
        endpoint, raw_hash, CONTRACT_PACKAGE_TESTNET_API_INCLUDES_PARAMS
    );

    let client = reqwest::Client::new();
    let resp = client.get(&url).send().await.map_err(|e| e.to_string())?;

    if resp.status().is_success() {
        let json: APIMetaResponse<ContractPackageMeta> =
            resp.json().await.map_err(|e| e.to_string())?;
        return Ok(json.data);
    } else {
        let status = resp.status();
        Err(format!(
            "Error while fetching contract package {}: {}",
            raw_hash, status
        ))
    }
}

pub async fn get_contract_version_metadata(
    network: &str,
    hash: &str,
) -> Result<ContractVersionMeta, String> {
    let endpoint: &str = if network == "mainnet" {
        MAINNET_API_ENDPOINT
    } else {
        TESTNET_API_ENDPOINT
    };

    // cspr.live expects RAW hash (no `hash-`)

    let raw_hash = hash.strip_prefix("hash-").unwrap_or(hash);

    let url = format!("{endpoint}/contracts/{raw_hash}");

    let client = reqwest::Client::new();

    let resp = client.get(&url).send().await.map_err(|e| e.to_string())?;

    if resp.status().is_success() {
        let json: APIMetaResponse<ContractVersionMeta> =
            resp.json().await.map_err(|e| e.to_string())?;
        return Ok(json.data);
    } else {
        if reqwest::StatusCode::NOT_FOUND == resp.status() {
            return Err(format!("Contract {raw_hash} not found"));
        }

        return Err(format!("Error while fetching contract {raw_hash}"));
    }
}
