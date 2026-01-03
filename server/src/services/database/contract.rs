use crate::models::schema::contract::{ContractPackageSchema, ContractVersionSchema};
use sqlx::{Error, PgPool, query};

pub async fn insert_contract_package(
    pool: &PgPool,
    contract_package: &ContractPackageSchema,
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

pub async fn insert_contract_package_versions(
    pool: &PgPool,
    contract_versions: Vec<ContractVersionSchema>,
) -> Result<(), Error> {
    let query_str = r#"
        INSERT INTO contract_versions (
            contract_hash, 
            contract_package_hash, 
            contract_wasm_hash, 
            user_id, 
            version, 
            major_protocol_version, 
            protocol_version, 
            entry_points,
            named_keys,
            disabled, 
            age
        ) VALUES 
    "#;

    let mut query = query(query_str);

    for contract_version in contract_versions {
        let entry_points_json =
            serde_json::to_string(&contract_version.entry_points).map_err(|_| {
                Error::InvalidArgument("Failed to serialize entry points to JSON".to_string())
            })?;
        let named_keys_json =
            serde_json::to_string(&contract_version.named_keys).map_err(|_| {
                Error::InvalidArgument("Failed to serialize named keys to JSON".to_string())
            })?;

        query = query
            .bind(contract_version.contract_hash)
            .bind(contract_version.contract_package_hash)
            .bind(contract_version.contract_wasm_hash)
            .bind(contract_version.user_id)
            .bind(contract_version.contract_version as i32)
            .bind(contract_version.protocol_major_version as i32)
            .bind(contract_version.protocol_version)
            .bind(entry_points_json)
            .bind(named_keys_json)
            .bind(contract_version.disabled)
            .bind(contract_version.age);
    }

    query.execute(pool).await?;

    Ok(())
}
