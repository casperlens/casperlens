-- Add migration script here
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contract_packages (
    package_hash TEXT PRIMARY KEY,
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    contract_name TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    network TEXT NOT NULL,
    age TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX contracts_unique_hash_network
ON contract_packages (owner_id, package_hash, network);