use casper_client::{
    JsonRpcId,
    cli::{TransactionBuilderParams, TransactionStrParams},
};
use casper_types::PackageHash;
use chrono::Utc;
use rand::Rng;

use crate::{
    models::schema::contract::{ContractVersionDiff, ContractVersionSchema},
    services::contract::diff::get_contract_version_diff,
};

pub async fn write_contract_diff_to_chain(
    target_package_hash: &str,
    v1: &ContractVersionSchema,
    v2: &ContractVersionSchema,
    diff: &ContractVersionDiff,
    network: &str,
    observability_package_hash: &str,
    rpc_address: &str,
) -> Result<(), String> {
    let chain_name = if network == "mainnet" {
        "casper"
    } else {
        // MUST match chainspec_name exactly
        "casper-test"
    };

    let diff_str = serde_json::to_string(diff).map_err(|_| "Failed to serialize diff")?;

    if diff_str.len() > 32_000 {
        return Err("Diff too large to store on-chain".to_string());
    }

    // 2️⃣ RPC metadata
    let rpc_id = JsonRpcId::from(rand::rng().random::<i64>());
    let rpc_id_str = rpc_id.to_string();
    let entry_point = "store_diff";
    let timestamp = Utc::now().to_rfc3339();

    // 3️⃣ Normalize PACKAGE hash
    let pkg_hash_str = if observability_package_hash.starts_with("package-") {
        observability_package_hash.to_string()
    } else if observability_package_hash.starts_with("hash-") {
        observability_package_hash.replace("hash-", "package-")
    } else {
        format!("package-{}", observability_package_hash)
    };

    let package_hash = PackageHash::from_formatted_str(&pkg_hash_str)
        .map_err(|e| format!("Invalid package hash: {e}"))?;

    // 4️⃣ Transaction target (stored contract)
    let builder_params = TransactionBuilderParams::Package {
        package_hash,
        maybe_entity_version: None,
        entry_point,
        runtime: casper_types::TransactionRuntimeParams::VmCasperV1,
    };

    // 5️⃣ Session args (JSON form — REQUIRED)
    let target_pkg_hash_str = if target_package_hash.starts_with("package-") {
        target_package_hash.to_string()
    } else if target_package_hash.starts_with("hash-") {
        target_package_hash.replace("hash-", "package-")
    } else {
        format!("package-{}", target_package_hash)
    };

    let version_id = format!(
        "{}-{}-{}",
        target_pkg_hash_str, v2.contract_version, v1.contract_version
    );

    let session_args = serde_json::json!([
        { "name": "version_id", "type": "String", "value": version_id },
        { "name": "diff", "type": "String", "value": diff_str }
    ]);

    let session_args_str = serde_json::to_string_pretty(&session_args)
        .map_err(|_| "Failed to serialize session args")?;

    // 6️⃣ Transaction params (THIS FIXES pricing_mode ERRORS)
    let tx_params = TransactionStrParams {
        secret_key: "./secret-key.pem",
        timestamp: &timestamp,
        ttl: "30min",
        chain_name,
        initiator_addr: String::new(),

        session_args_simple: vec![],
        session_args_json: &session_args_str,
        session_entry_point: Some(entry_point),
        pricing_mode: "classic",
        standard_payment: "true",
        payment_amount: "50000000000",
        transferred_value: "0",

        gas_price_tolerance: "1",
        additional_computation_factor: "0",

        receipt: "",
        output_path: "",
        chunked_args: None,
        min_bid_override: false,
    };

    // 7️⃣ Submit transaction
    let result =
        casper_client::cli::put_transaction(&rpc_id_str, rpc_address, 0, builder_params, tx_params)
            .await;

    match result {
        Ok(resp) => {
            log::info!("✅ Casper tx submitted: {:?}", resp);
            Ok(())
        }
        Err(err) => {
            log::error!("❌ Casper tx failed: {:?}", err);
            Err(format!("Casper tx failed: {:?}", err))
        }
    }
}

pub async fn write_contract_diff_versions_to_chain(
    target_package_hash: &str,
    contract_versions: Vec<ContractVersionSchema>,
    network: &str,
    observability_package_hash: &str,
    rpc_address: &str,
) -> Result<(), String> {
    if contract_versions.len() <= 1 {
        return Ok(());
    }

    let chain_name = if network == "mainnet" {
        "casper"
    } else {
        // MUST match chainspec_name exactly
        "casper-test"
    };

    let mut prev_contract: Option<&ContractVersionSchema> = None;

    for contract_version in &contract_versions {
        let Some(prev) = prev_contract else {
            prev_contract = Some(contract_version);
            continue;
        };

        // 1️⃣ Compute diff
        let diff = get_contract_version_diff(prev.clone(), contract_version.clone()).await?;
        let diff_str = serde_json::to_string(&diff).map_err(|_| "Failed to serialize diff")?;

        if diff_str.len() > 32_000 {
            return Err("Diff too large to store on-chain".to_string());
        }

        // 2️⃣ RPC metadata
        let rpc_id = JsonRpcId::from(rand::rng().random::<i64>());
        let rpc_id_str = rpc_id.to_string();
        let entry_point = "store_diff";
        let timestamp = Utc::now().to_rfc3339();

        // 3️⃣ Normalize PACKAGE hash
        let pkg_hash_str = if observability_package_hash.starts_with("package-") {
            observability_package_hash.to_string()
        } else if observability_package_hash.starts_with("hash-") {
            observability_package_hash.replace("hash-", "package-")
        } else {
            format!("package-{}", observability_package_hash)
        };

        let package_hash = PackageHash::from_formatted_str(&pkg_hash_str)
            .map_err(|e| format!("Invalid package hash: {e}"))?;

        // 4️⃣ Transaction target (stored contract)
        let builder_params = TransactionBuilderParams::Package {
            package_hash,
            maybe_entity_version: None,
            entry_point,
            runtime: casper_types::TransactionRuntimeParams::VmCasperV1,
        };

        // 5️⃣ Session args (JSON form — REQUIRED)
        let target_pkg_hash_str = if target_package_hash.starts_with("package-") {
            target_package_hash.to_string()
        } else if target_package_hash.starts_with("hash-") {
            target_package_hash.replace("hash-", "package-")
        } else {
            format!("package-{}", target_package_hash)
        };

        let version_id = format!(
            "{}-{}-{}",
            target_pkg_hash_str, contract_version.contract_version, prev.contract_version
        );

        let session_args = serde_json::json!([
            { "name": "version_id", "type": "String", "value": version_id },
            { "name": "diff", "type": "String", "value": diff_str }
        ]);

        let session_args_str = serde_json::to_string_pretty(&session_args)
            .map_err(|_| "Failed to serialize session args")?;

        // 6️⃣ Transaction params (THIS FIXES pricing_mode ERRORS)
        let tx_params = TransactionStrParams {
            secret_key: "./secret-key.pem",
            timestamp: &timestamp,
            ttl: "30min",
            chain_name,
            initiator_addr: String::new(),

            session_args_simple: vec![],
            session_args_json: &session_args_str,
            session_entry_point: Some(entry_point),
            pricing_mode: "classic",
            standard_payment: "true",
            payment_amount: "50000000000",
            transferred_value: "0",

            gas_price_tolerance: "1",
            additional_computation_factor: "0",

            receipt: "",
            output_path: "",
            chunked_args: None,
            min_bid_override: false,
        };

        // 7️⃣ Submit transaction
        let result = casper_client::cli::put_transaction(
            &rpc_id_str,
            rpc_address,
            0,
            builder_params,
            tx_params,
        )
        .await;

        match result {
            Ok(resp) => log::info!("✅ Casper tx submitted: {:?}", resp),
            Err(err) => {
                log::error!("❌ Casper tx failed: {:?}", err);
                return Err(format!("Casper tx failed: {:?}", err));
            }
        }

        prev_contract = Some(contract_version);
    }

    Ok(())
}
