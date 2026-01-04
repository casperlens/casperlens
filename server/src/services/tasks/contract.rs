use sqlx::PgPool;

use crate::{
    models::schema::contract::ContractVersionSchema,
    services::{
        contract::diff::get_contract_version_diff,
        database::contract::insert_contract_package_versions,
    },
};

pub async fn write_contract_diff_versions(
    pool: &PgPool,
    contract_versions: Vec<ContractVersionSchema>,
) -> Result<(), String> {
    insert_contract_package_versions(pool, contract_versions.clone())
        .await
        .map_err(|e| e.to_string())?;
    if contract_versions.len() == 1 {
        return Ok(());
    }
    let mut prev_contract: Option<&ContractVersionSchema> = None;
    for contract_version in &contract_versions {
        match prev_contract {
            Some(val) => {
                let _diff =
                    get_contract_version_diff(val.clone(), contract_version.clone()).await?;
                // TODO: Implement chaincode execution on observability smart contract
            }
            None => {
                prev_contract = Some(contract_version);
                continue;
            }
        }
    }
    Ok(())
}
