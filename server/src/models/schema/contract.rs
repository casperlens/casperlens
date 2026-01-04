use casper_types::{Key, NamedKeys, contracts::EntryPoint};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct ContractPackageSchema {
    pub package_hash: String,
    pub user_id: Uuid,
    pub contract_name: String,
    pub owner_id: String,
    pub network: String,
    pub lock_status: bool,
    pub age: DateTime<Utc>,
}

impl ContractPackageSchema {
    pub fn new(
        package_hash: String,
        user_id: Uuid,
        contract_name: String,
        owner_id: String,
        network: String,
        lock_status: bool,
        age: DateTime<Utc>,
    ) -> Self {
        ContractPackageSchema {
            package_hash,
            user_id,
            contract_name,
            owner_id,
            network,
            lock_status,
            age,
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
pub struct APIMetaResponse<T> {
    pub data: T,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ContractVersionSchema {
    pub protocol_major_version: u32,
    pub contract_version: u32,
    pub contract_package_hash: String,
    pub contract_hash: String,
    pub contract_wasm_hash: String,
    pub user_id: Uuid,
    pub protocol_version: String,
    pub entry_points: Vec<EntryPoint>,
    pub named_keys: NamedKeys,
    pub disabled: bool,
    pub age: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ContractVersionMeta {
    pub contract_hash: String,
    pub contract_package_hash: String,
    #[serde(skip)]
    pub deploy_hash: String,
    #[serde(skip)]
    pub block_height: u64,
    #[serde(skip)]
    pub contract_type_id: Option<serde_json::Value>,
    pub timestamp: DateTime<Utc>,
    pub contract_version: u32,
    pub is_disabled: bool,

    #[serde(skip)]
    pub contract_package: Option<serde_json::Value>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ContractVersionDiff {
    pub v1: ContractVersionDiffMeta,
    pub v2: ContractVersionDiffMeta,
    pub contract_package_hash: String,
    pub entry_points: Vec<ContractEntryPointDiff>,
    pub named_keys: Vec<ContractNamedKeysDiff>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ContractVersionDiffMeta {
    pub contract_hash: String,
    pub timestamp: DateTime<Utc>,
    pub contract_version: u32,
    pub is_disabled: bool,
    pub wasm_hash: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ContractEntryPointDiff {
    Added(EntryPoint),
    Removed(EntryPoint),
    Modified { from: EntryPoint, to: EntryPoint },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ContractNamedKeysDiff {
    Added { key: String, value: Key },
    Removed { key: String, value: Key },
    Modified { key: String, from: Key, to: Key },
}
