use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json;


#[derive(Debug, Deserialize, Serialize)]
pub enum Network {
    #[serde(rename = "mainnet")]
    Mainnet,
    
    #[serde(rename = "testnet")]
    Testnet,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContractPackage {
    pub package_hash: String,
    pub user_id: Uuid,
    pub contract_name: String,
    pub owner_id: String,
    pub network: String,
    pub lock_status: bool,
    pub age: DateTime<Utc>,
}

impl ContractPackage {
    pub fn new(package_hash: String, user_id: Uuid, contract_name: String, owner_id: String, network: String, lock_status: bool, age: DateTime<Utc>) -> Self {
        ContractPackage {
            package_hash,
            user_id,
            contract_name,
            owner_id,
            network,
            lock_status: lock_status,
            age: age,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct ContractPackageMeta {
    pub account_info: Option<serde_json::Value>,
    centralized_account_info: Option<serde_json::Value>,
    coingecko_data: Option<serde_json::Value>,
    coingecko_id: Option<String>,
    contract_package_hash: String,
    cspr_name: Option<String>,
    csprtrade_data: Option<serde_json::Value>,
    description: Option<String>,
    has_ces_events: bool,
    icon_url: Option<String>,
    is_contract_info_approved: bool,
    latest_version_contract_hash: Option<String>,
    latest_version_contract_type_id: Option<String>,
    metadata: serde_json::Value,
    name: Option<String>,
    owner_hash: String,
    pub owner_public_key: String,
    pub timestamp: String,
    website_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ContractPackageMetaResponse {
    pub data: ContractPackageMeta,
}
