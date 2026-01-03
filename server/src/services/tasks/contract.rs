use sqlx::PgPool;

use crate::{
    models::schema::contract::ContractVersionSchema,
    services::database::contract::insert_contract_package_versions,
};

pub async fn write_contract_versions(
    pool: &PgPool,
    contract_versions: Vec<ContractVersionSchema>,
) -> Result<(), String> {
    insert_contract_package_versions(&pool, contract_versions)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
