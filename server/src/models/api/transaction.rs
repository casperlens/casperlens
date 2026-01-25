use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Transaction {
    pub deploy_hash: String,
    pub block_hash: Option<String>,
    pub block_height: Option<u64>,
    pub caller_public_key: String,
    pub execution_type_id: Option<u64>,
    pub contract_package_hash: Option<String>,
    pub contract_hash: Option<String>,
    pub entry_point_id: Option<u64>,
    pub args: Option<serde_json::Value>,
    pub payment_amount: String,
    pub cost: String,
    pub status: String,
    pub timestamp: String,
    pub error_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionsResponse {
    pub item_count: u64,
    pub page_count: u64,
    pub data: Vec<Transaction>,
}
