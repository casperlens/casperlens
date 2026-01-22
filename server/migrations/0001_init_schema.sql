CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Contract Packages Table
CREATE TABLE IF NOT EXISTS contract_packages (
    package_hash TEXT NOT NULL,
    user_id UUID NOT NULL,
    contract_name TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    network TEXT NOT NULL,
    lock_status BOOLEAN NOT NULL DEFAULT TRUE,
    age TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (package_hash, user_id)
);

-- Index to enforce uniqueness of (owner, package, network) PER USER
DROP INDEX IF EXISTS contracts_unique_hash_network;
CREATE UNIQUE INDEX contracts_unique_hash_network ON contract_packages (user_id, owner_id, package_hash, network);

-- Contract Versions Table
CREATE TABLE IF NOT EXISTS contract_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_hash TEXT,
    contract_package_hash TEXT NOT NULL,
    contract_wasm_hash TEXT NOT NULL,
    user_id UUID NOT NULL,
    version INTEGER NOT NULL,
    major_protocol_version INTEGER NOT NULL,
    protocol_version TEXT NOT NULL,
    entry_points JSONB NOT NULL,
    named_keys JSONB NOT NULL,
    disabled BOOLEAN NOT NULL DEFAULT TRUE,
    age TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Composite Foreign Key referencing the composite PK of contract_packages
    FOREIGN KEY (contract_package_hash, user_id) 
        REFERENCES contract_packages (package_hash, user_id) 
        ON DELETE CASCADE,

    -- Unique constraint per user, package, and version
    UNIQUE (contract_package_hash, version, user_id)
);