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
        ON CONFLICT (package_hash) DO NOTHING
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
    if contract_versions.is_empty() {
        return Ok(());
    }

    for contract_version in contract_versions {
        query!(
            r#"
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
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (contract_package_hash, version) DO NOTHING
            "#,
            contract_version.contract_hash,
            contract_version.contract_package_hash,
            contract_version.contract_wasm_hash,
            contract_version.user_id,
            contract_version.contract_version as i32,
            contract_version.protocol_major_version as i32,
            contract_version.protocol_version,
            serde_json::to_value(&contract_version.entry_points).unwrap(),
            serde_json::to_value(&contract_version.named_keys).unwrap(),
            contract_version.disabled,
            contract_version.age
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}

pub async fn get_contract_version(
    pool: &PgPool,
    contract_package_hash: &str,
    version: u32,
    major_protocol_version: u32,
) -> Result<Option<ContractVersionSchema>, Error> {
    let row = query!(
        r#"
        SELECT 
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
        FROM contract_versions
        WHERE contract_package_hash = $1 AND version = $2 AND major_protocol_version = $3
        "#,
        contract_package_hash,
        version as i32,
        major_protocol_version as i32
    )
    .fetch_optional(pool)
    .await?;

    match row {
        Some(r) => {
            let entry_points: Vec<casper_types::contracts::EntryPoint> =
                serde_json::from_value(r.entry_points).map_err(|e| Error::Decode(Box::new(e)))?;
            let named_keys: casper_types::NamedKeys =
                serde_json::from_value(r.named_keys).map_err(|e| Error::Decode(Box::new(e)))?;

            Ok(Some(ContractVersionSchema {
                contract_hash: r.contract_hash.unwrap_or_default(), // Should likely be not null based on schema but using unwrap_or_default to be safe or maybe handle nulls if schema changed. Schema says contract_hash TEXT, nullable? Schema: contract_hash TEXT (no NOT NULL). Wait.
                // Let's check schema again. `contract_hash TEXT`. It is nullable. But ContractVersionSchema struct expects String.
                // If it is nullable in DB, I should handle it. But usually a version has a hash.
                // If it is null, maybe usage is different.
                // However, ContractVersionSchema has `pub contract_hash: String`. So I must provide a string.
                // If DB has NULL, I might return error or empty string.
                contract_package_hash: r.contract_package_hash,
                contract_wasm_hash: r.contract_wasm_hash,
                user_id: r.user_id,
                contract_version: r.version as u32,
                protocol_major_version: r.major_protocol_version as u32,
                protocol_version: r.protocol_version,
                entry_points,
                named_keys,
                disabled: r.disabled,
                age: r.age,
            }))
        }
        None => Ok(None),
    }
}
