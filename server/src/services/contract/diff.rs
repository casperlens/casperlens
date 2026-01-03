use casper_types::contracts::EntryPoints;

use crate::models::schema::contract::{ContractEntryPointDiff, ContractNamedKeysDiff, ContractVersionDiff, ContractVersionDiffMeta, ContractVersionSchema};


/// Get the diff for v1 to v2 transition, with v1 being the older version and v2 being newer version
pub async fn get_contract_version_diff(v1: ContractVersionSchema, v2: ContractVersionSchema) -> Result<ContractVersionDiff, String> {
    // Contract validation
    let v1_package_hash = &v1.contract_package_hash;
    let v2_package_hash = &v2.contract_package_hash;
    if v1_package_hash != v2_package_hash {
        return Err("Contracts do not belong to same package".to_string());
    }
    if &v1.contract_version > &v2.contract_version {
        return Err(format!("Contract {} is older than contract {}", &v1.contract_version, &v2.contract_hash));
    }
    if &v1.contract_version == &v2.contract_version {
        return Err(format!("Contract {} is same as contract {}", &v1.contract_version, &v2.contract_hash));
    }

    // Compute diff in v1 and v2
    let v1_entry_points_vec = &v1.entry_points;
    let mut v1_entry_points: EntryPoints = EntryPoints::new();
    for v1_entry_point in v1_entry_points_vec {
        v1_entry_points.add_entry_point(v1_entry_point.clone());
    }
    let v2_entry_points_vec = &v2.entry_points;
    let mut v2_entry_points: EntryPoints = EntryPoints::new();
    for v2_entry_point in v2_entry_points_vec {
        v2_entry_points.add_entry_point(v2_entry_point.clone());
    }

    let mut entry_point_diffs = vec![];
    for key in v1_entry_points.keys() {
        let v1_ep = v1_entry_points.get(key).expect("key from keys()");
        match v2_entry_points.get(key) {
            None => entry_point_diffs.push(ContractEntryPointDiff::Removed(v1_ep.clone())),
            Some(v2_ep) if v1_ep != v2_ep => {
                entry_point_diffs.push(ContractEntryPointDiff::Modified {
                    from: v1_ep.clone(),
                    to: v2_ep.clone(),
                });
            }
            _ => {}
        }
    }

    for key in v2_entry_points.keys() {
        if v1_entry_points.get(key).is_none() {
            let v2_ep = v2_entry_points.get(key).expect("key from keys()");
            entry_point_diffs.push(ContractEntryPointDiff::Added(v2_ep.clone()));
        }
    }

    let mut named_keys_diff = vec![];

    for key in v1.named_keys.names() {
        let v1_val = v1.named_keys.get(&key.to_string()).expect("key from keys()");
        match v2.named_keys.get(&key.to_string()) {
            None => named_keys_diff.push(ContractNamedKeysDiff::Removed{key: key.to_string(), value: v1_val.clone()}),
            Some(v2_val) if v1_val != v2_val => {
                named_keys_diff.push(ContractNamedKeysDiff::Modified {
                    key: key.to_string(),
                    from: v1_val.clone(),
                    to: v2_val.clone(),
                });
            }
            _ => {}
        }
    }

    for key in v2.named_keys.names() {
        if v1.named_keys.get(key).is_none() {
            let v2_val = v2.named_keys.get(key).expect("key from keys()");
            named_keys_diff.push(ContractNamedKeysDiff::Added{key: key.to_string(), value: v2_val.clone()});
        }
    }
    let v1_diff_meta = ContractVersionDiffMeta {
        contract_hash: v1.contract_hash.clone(),
        wasm_hash: v1.contract_wasm_hash.clone(),
        timestamp: v1.age,
        contract_version: v1.contract_version,
        is_disabled: v1.disabled
    };

    let v2_diff_meta = ContractVersionDiffMeta {
        contract_hash: v2.contract_hash.clone(),
        wasm_hash: v2.contract_wasm_hash.clone(),
        timestamp: v2.age,
        contract_version: v2.contract_version,
        is_disabled: v2.disabled
    };

    let contract_version_diff = ContractVersionDiff {
        v1: v1_diff_meta,
        v2: v2_diff_meta,
        contract_package_hash: v1_package_hash.to_string(),
        entry_points: entry_point_diffs,
        named_keys: named_keys_diff,       
    };
    Ok(contract_version_diff)
}