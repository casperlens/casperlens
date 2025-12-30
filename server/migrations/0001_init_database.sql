CREATE TABLE contract_packages (
    package_hash TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    contract_name TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    network TEXT NOT NULL,
    age TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX contracts_unique_hash_network
ON contract_packages (owner_id, package_hash, network);