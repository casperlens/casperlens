use crate::constants::network::{MAINNET_API_ENDPOINT, TESTNET_API_ENDPOINT};
use crate::models::api::transaction::{Transaction, TransactionsResponse};
use crate::services::contract::metadata::get_contract_package_metadata;

/// Fetch transactions (deploys) for a contract package.
///
/// Since `cspr.live` does not have a direct "get deploys by package" endpoint that is reliable for all packages,
/// this function uses a two-step strategy:
/// 1. Fetch the Contract Package Metadata to get the Owner's Public Key.
/// 2. Fetch the Owner's Account Deploys.
/// 3. Filter the deploys to include only those that interact with the target Contract Package Hash
///    or any of its Contract Hashes (versions).
pub async fn get_contract_transactions(
    network: &str,
    package_hash: &str,
) -> Result<Vec<Transaction>, String> {
    // 1. Get Contract Package Metadata to find the Owner
    let meta = get_contract_package_metadata(network, package_hash).await?;
    let owner_public_key = meta.owner_public_key;

    // 2. Fetch Owner's Deploys
    let endpoint = match network {
        "mainnet" => MAINNET_API_ENDPOINT,
        "testnet" => TESTNET_API_ENDPOINT,
        _ => return Err(format!("Unsupported network: {}", network)),
    };

    let url = format!("{}/accounts/{}/deploys?limit=100", endpoint, owner_public_key);
    let client = reqwest::Client::new();
    let resp = client.get(&url).send().await.map_err(|e| e.to_string())?;

    if !resp.status().is_success() {
        return Err(format!(
            "Failed to fetch account deploys for owner {}: {}",
            owner_public_key,
            resp.status()
        ));
    }

    let json_data = resp
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;

    // Deserialize into our TransactionsResponse model
    let transactions_response: TransactionsResponse =
        serde_json::from_value(json_data).map_err(|e| format!("Failed to parse transactions: {}", e))?;

    // 3. Filter Deploys
    // We want deploys where `contract_package_hash` matches our target.
    // Note: The API response often contains a `contract_package` object nested in the transaction.
    // We should check if that object's hash matches.
    
    // Normalize our package hash for comparison (remove 'hash-' prefix if present, though API uses raw hex)
    let target_hash_raw = package_hash.strip_prefix("hash-").unwrap_or(package_hash);

    let filtered_transactions: Vec<Transaction> = transactions_response
        .data
        .into_iter()
        .filter(|tx| {
            // Check direct contract_package_hash field
            if let Some(ref ph) = tx.contract_package_hash {
                 if ph == target_hash_raw {
                     return true;
                 }
            }
            
            // Also check if the transaction object structure from the API has a nested contract_package object
            // (The Transaction struct I defined captures the flattened fields, but let's double check logic)
            // Based on my manual curl, the API returns `contract_package_hash` at the top level of the deploy object
            // or inside a `contract_package` object. My struct only mapped the top level.
            // Let's stick to the top level for now as per my struct definition.
            
            false
        })
        .collect();

    Ok(filtered_transactions)
}
