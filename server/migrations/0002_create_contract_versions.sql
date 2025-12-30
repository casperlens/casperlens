-- Contract version tracker
CREATE TABLE contract_versions (
    id UUID PRIMARY KEY,
    contract_package_hash UUID NOT NULL REFERENCES contract_packages(package_hash) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    major_protocol_version INTEGER NOT NULL,
    contract_hash TEXT NOT NULL,
    entry_points JSONB NOT NULL,
    age TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contract_package_hash, version)
);