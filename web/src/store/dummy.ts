import {
  ContractData,
  ContractOverview,
  ContractVersionDiff,
  ContractVersionDiffMeta,
} from "@/types";

export const dummyContracts: ContractOverview[] = [
  {
    package_hash: "hash1",
    contract_name: "Contract One",
    owner_id: "owner1",
    network: "mainnet",
    lock_status: false,
    age: 120,
  },
  {
    package_hash: "hash2",
    contract_name: "Contract Two",
    owner_id: "owner2",
    network: "testnet",
    lock_status: true,
    age: 60,
  },
  {
    package_hash: "hash3",
    contract_name: "Contract Three",
    owner_id: "owner3",
    network: "mainnet",
    lock_status: false,
    age: 30,
  },
  {
    package_hash: "hash4",
    contract_name: "Contract Four",
    owner_id: "owner4",
    network: "mainnet",
    lock_status: true,
    age: 45,
  },
  {
    package_hash: "hash5",
    contract_name: "Contract Five",
    owner_id: "owner5",
    network: "testnet",
    lock_status: false,
    age: 90,
  },
  {
    package_hash: "hash6",
    contract_name: "Contract Six",
    owner_id: "owner6",
    network: "mainnet",
    lock_status: false,
    age: 15,
  },
];

export const dummyContractData: ContractData = {
  package_hash:
    "hash-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  contract_name: "MySmartContract",
  owner_id:
    "account-hash-abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  network: "testnet",
  lock_status: false,
  age: 45,
  versions: [
    {
      protocol_major_version: 1,
      contract_version: 2,
      contract_package_hash:
        "hash-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      contract_hash:
        "hash-fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      contract_wasm_hash:
        "hash-wasm1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      user_id:
        "account-hash-abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      protocol_version: "1.5.2",
      named_keys: ["balance_key", "total_supply", "allowances"],
      entry_points: ["transfer", "approve", "mint", "burn"],
      disabled: false,
      age: "5 days",
    },
    {
      protocol_major_version: 1,
      contract_version: 1,
      contract_package_hash:
        "hash-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      contract_hash:
        "hash-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      contract_wasm_hash:
        "hash-wasm0987654321fedcba0987654321fedcba0987654321fedcba0987654321fe",
      user_id:
        "account-hash-abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      protocol_version: "1.5.1",
      named_keys: ["balance_key", "total_supply"],
      entry_points: ["transfer", "approve"],
      disabled: false,
      age: "45 days",
    },
  ],
};

export const dummyVersionMetaData: ContractVersionDiffMeta[] = [
  {
    contract_hash:
      "hash-fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    contract_version: 2,
    is_disabled: false,
    wasm_hash:
      "hash-wasm1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
  },
  {
    contract_hash:
      "hash-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    contract_version: 1,
    is_disabled: false,
    wasm_hash:
      "hash-wasm0987654321fedcba0987654321fedcba0987654321fedcba0987654321fe",
  },
];

export const dummyVersionDiffData: ContractVersionDiff = {
  v1: {
    contract_hash:
      "hash-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    contract_version: 1,
    is_disabled: false,
    wasm_hash:
      "hash-wasm0987654321fedcba0987654321fedcba0987654321fedcba0987654321fe",
  },
  v2: {
    contract_hash:
      "hash-fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    contract_version: 2,
    is_disabled: false,
    wasm_hash:
      "hash-wasm1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
  },
  contract_package_hash:
    "hash-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  entry_points: [
    { Added: { name: "mint", access: "Public" } },
    { Added: { name: "burn", access: "Public" } },
  ],
  named_keys: [{ Added: { key: "allowances", value: {} } }],
};
