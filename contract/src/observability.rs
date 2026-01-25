use odra::casper_types::Key;
use odra::prelude::*;

#[odra::module]
pub struct Observability {
    diffs: Mapping<String, String>, // Changed from ContractVersionDiff to String
    latest_version: Var<String>,
    owner: Var<Address>,
}

#[odra::odra_error]
pub enum Error {
    NotAuthorized = 1,
    VersionAlreadyExists = 2,
}

#[odra::odra_type]
pub struct ContractVersionDiff {
    pub v1: ContractVersionDiffMeta,
    pub v2: ContractVersionDiffMeta,
    pub contract_package_hash: String,
    pub entry_points: Vec<ContractEntryPointDiff>,
    pub named_keys: Vec<ContractNamedKeysDiff>,
}

#[odra::odra_type]
pub struct ContractVersionDiffMeta {
    pub contract_hash: String,
    pub timestamp: String,
    pub contract_version: u32,
    pub is_disabled: bool,
    pub wasm_hash: String,
}

#[odra::odra_type]
pub enum ContractEntryPointDiff {
    Added(String),
    Removed(String),
    Modified { from: String, to: String },
}

#[odra::odra_type]
pub enum ContractNamedKeysDiff {
    Added { key: String, value: Key },
    Removed { key: String, value: Key },
    Modified { key: String, from: Key, to: Key },
}

#[odra::module]
impl Observability {
    #[odra(init)]
    pub fn init(&mut self) {
        // Initialize the contract state
        // Sets the latest version to empty and owner to the deployer
        self.latest_version.set(String::new());
        self.owner.set(self.env().caller());
    }

    pub fn store_diff(&mut self, version_id: String, diff: String) {
        // Changed input type to String
        // Access Control
        if self.env().caller() != self.owner.get().unwrap() {
            self.env().revert(Error::NotAuthorized);
        }

        // Removed Append-only check to allow overwriting (Upsert behavior)

        self.diffs.set(&version_id, diff);
        self.latest_version.set(version_id);
    }

    pub fn get_diff(&self, version_id: String) -> Option<String> {
        // Changed return type to Option<String>
        self.diffs.get(&version_id)
    }

    pub fn get_latest_version(&self) -> String {
        self.latest_version.get_or_default()
    }

    pub fn ping(&self) {
        // Dummy function for testing diffs
    }
}
