use sqlx::PgPool;

use crate::{models::schema::contract::ContractVersionSchema, services::database::contract::insert_contract_package_versions};

pub async fn write_contract_versions(&pool: &PgPool, contract_versions: Vec<ContractVersionSchema>) {
    let insert_results =  insert_contract_package_versions(&pool, contract_versions).await;
}