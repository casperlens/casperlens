use casperlens_contract::observability::Observability;
use odra::host::{Deployer, NoArgs};

#[test]
fn test_init() {
    let env = odra_test::env();
    let contract = Observability::deploy(&env, NoArgs);

    // Verify initial state is empty
    assert_eq!(contract.get_latest_version(), "");
    assert_eq!(contract.get_diff("any_version".to_string()), None);
}

#[test]
fn test_storage_and_retrieval() {
    let env = odra_test::env();
    let mut contract = Observability::deploy(&env, NoArgs);

    // Store diff
    let version = "v1".to_string();
    let diff = "{\"change\": \"init\"}".to_string();
    contract.store_diff(version.clone(), diff.clone());

    // Verify storage
    assert_eq!(contract.get_latest_version(), version);
    assert_eq!(contract.get_diff(version), Some(diff));
}

#[test]
fn test_multiple_versions() {
    let env = odra_test::env();
    let mut contract = Observability::deploy(&env, NoArgs);

    // Store v1
    contract.store_diff("v1".to_string(), "diff1".to_string());
    assert_eq!(contract.get_latest_version(), "v1");

    // Store v2
    contract.store_diff("v2".to_string(), "diff2".to_string());
    assert_eq!(contract.get_latest_version(), "v2");

    // Store v3
    contract.store_diff("v3".to_string(), "diff3".to_string());
    assert_eq!(contract.get_latest_version(), "v3");

    // Verify all can be retrieved
    assert_eq!(contract.get_diff("v1".to_string()), Some("diff1".to_string()));
    assert_eq!(contract.get_diff("v2".to_string()), Some("diff2".to_string()));
    assert_eq!(contract.get_diff("v3".to_string()), Some("diff3".to_string()));
}

#[test]
fn test_get_non_existent() {
    let env = odra_test::env();
    let mut contract = Observability::deploy(&env, NoArgs);

    contract.store_diff("v1".to_string(), "diff1".to_string());

    // Verify non-existent keys return None
    assert_eq!(contract.get_diff("v2".to_string()), None);
    assert_eq!(contract.get_diff("random".to_string()), None);
}

#[test]
#[should_panic]
fn test_append_only() {
    let env = odra_test::env();
    let mut contract = Observability::deploy(&env, NoArgs);

    contract.store_diff("v1".to_string(), "data".to_string());
    // Should panic
    contract.store_diff("v1".to_string(), "new data".to_string());
}

#[test]
#[should_panic]
fn test_access_control() {
    let env = odra_test::env();
    let mut contract = Observability::deploy(&env, NoArgs);

    // Deployer is owner (account 0)
    
    // Switch to another account (account 1)
    env.set_caller(env.get_account(1));
    
    // Should panic
    contract.store_diff("v2".to_string(), "hacker".to_string());
}
