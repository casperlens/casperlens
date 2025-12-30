-- Contract version tracker
CREATE TABLE contract_versions (
    id UUID PRIMARY KEY,
    contract_package_hash TEXT NOT NULL REFERENCES contract_packages(package_hash) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES contract_packages(user_id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    major_protocol_version INTEGER NOT NULL,
    contract_hash TEXT,
    entry_points JSONB NOT NULL,
    disabled BOOLEAN NOT NULL DEFAULT TRUE,
    age TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contract_package_hash, version)
);