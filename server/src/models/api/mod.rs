use serde::{Deserialize, Serialize};

pub(crate) mod contract;


#[derive(Serialize, Deserialize)]
pub struct ApiResponse<T, E> {
    pub success: bool,
    pub message: String,
    pub error: Option<E>,
    pub data: Option<T> 
}