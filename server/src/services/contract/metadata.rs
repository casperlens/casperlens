use crate::constants::network::{MAINNET_API_ENDPOINT, TESTNET_API_ENDPOINT};
use crate::constants::headers::CONTRACT_PACKAGE_TESTNET_API_INCLUDES_PARAMS;
use crate::models::schema::contract::{ContractPackageMeta, ContractPackageMetaResponse};


pub async fn get_contract_package_metadata(network: &str, hash: &str) -> Result<ContractPackageMeta, String> {
    let endpoint: &str;
    if network == "mainnet" {
        endpoint = MAINNET_API_ENDPOINT;
    } else {
        endpoint = TESTNET_API_ENDPOINT;
    }
    let url = format!("{endpoint}/contract-packages/{hash}?includes={CONTRACT_PACKAGE_TESTNET_API_INCLUDES_PARAMS}");
    let client = reqwest::Client::new();
    let resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if resp.status().is_success() {
        let json: ContractPackageMetaResponse = resp.json().await.map_err(|e| e.to_string())?;
        return Ok(json.data);
    } else {
        if reqwest::StatusCode::NOT_FOUND == resp.status() {
            return Err(format!("Contract package {hash} not found"));
        }
        return Err(format!("Error while fetching contract package {hash}"));
    }
}