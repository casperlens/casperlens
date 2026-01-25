pub mod contract;
pub mod transaction;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ApiResponse<T, E> {
    pub success: bool,
    pub message: String,
    pub error: Option<E>,
    pub data: Option<T>,
}
