use serde::Deserialize;

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
