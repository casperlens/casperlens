use sqlx::{query, Error, PgPool};
use crate::models::schema::contract::ContractPackage;

pub async fn insert_contract_package(
    pool: &PgPool,
    contract_package: &ContractPackage,
) -> Result<(), Error> {
    query!(
        r#"
        INSERT INTO contract_packages (package_hash, user_id, contract_name, owner_id, network, lock_status, age)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#,
        contract_package.package_hash,
        contract_package.user_id,
        contract_package.contract_name,
        contract_package.owner_id,
        contract_package.network,
        contract_package.lock_status,
        contract_package.age
    )
    .execute(pool)
    .await?;

    Ok(())
}