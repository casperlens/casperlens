-- Contract version tracker
CREATE TABLE contract_versions (
    contract_hash TEXT PRIMARY KEY,
    contract_package_hash TEXT NOT NULL REFERENCES contract_packages(package_hash) ON DELETE CASCADE,
    contract_wasm_hash TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES contract_packages(user_id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    major_protocol_version INTEGER NOT NULL,
    protocol_version TEXT NOT NULL,
    entry_points JSONB NOT NULL,
    named_keys JSONB NOT NULL,
    disabled BOOLEAN NOT NULL DEFAULT TRUE,
    age TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contract_package_hash, version)
);
