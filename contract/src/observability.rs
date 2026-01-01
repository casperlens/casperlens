use odra::prelude::*;

#[odra::module]
pub struct Observability {
    diffs: Mapping<String, String>,
    latest_version: Var<String>,
    owner: Var<Address>,
}

#[odra::module]
impl Observability {
    #[odra(init)]
    pub fn init(&mut self) {
        self.latest_version.set(String::new());
        self.owner.set(self.env().caller());
    }

    pub fn store_diff(&mut self, version_id: String, diff: String) {
        // Access Control
        if self.env().caller() != self.owner.get().unwrap() {
            panic!("Not authorized");
        }

        // Append-only check
        if self.diffs.get(&version_id).is_some() {
            panic!("Version already exists");
        }

        self.diffs.set(&version_id, diff);
        self.latest_version.set(version_id);
    }

    pub fn get_diff(&self, version_id: String) -> Option<String> {
        self.diffs.get(&version_id)
    }

    pub fn get_latest_version(&self) -> String {
        self.latest_version.get_or_default()
    }
}
