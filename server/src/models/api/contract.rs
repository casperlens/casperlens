use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct RegisterContractRequest {
    pub(crate) package_hash: String,
    pub(crate) package_name: String,
    pub(crate) network: String
}
