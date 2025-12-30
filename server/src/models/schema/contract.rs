use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};


#[derive(Debug, Deserialize, Serialize)]
pub enum Network {
    #[serde(rename = "mainnet")]
    Mainnet,
    
    #[serde(rename = "testnet")]
    Testnet,
    
    #[serde(rename = "casper-net-1")]
    CasperNet1,
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
    pub fn new(package_hash: String, user_id: Uuid, contract_name: String, owner_id: String, network: String, lock_status: bool) -> Self {
        ContractPackage {
            package_hash,
            user_id,
            contract_name,
            owner_id,
            network,
            lock_status: lock_status,
            age: Utc::now(),
        }
    }
}
