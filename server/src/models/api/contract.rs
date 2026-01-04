use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct RegisterContractRequest {
    pub(crate) package_hash: String,
    pub(crate) package_name: String,
    pub(crate) network: String,
}

#[derive(Debug, Deserialize)]
pub struct ContractDiffQuery {
    pub v1: u32,
    pub v1_maj: u32,
    pub v2: u32,
    pub v2_maj: u32,
}

#[derive(Debug, Serialize)]
pub struct ContractOverview {
    pub package_hash: String,
    pub contract_name: String,
    pub owner_id: String,
    pub network: String,
    pub lock_status: bool,
    pub age: i64,
}
