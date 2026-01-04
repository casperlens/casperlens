export interface ContractRegister {
  package_hash: string;
  package_name: string;
  network: "mainnet" | "testnet";
}

export interface ContractRegisterRes {
  success: boolean;
  message: string;
  error: string | null;
  data: null;
}

export interface ResponseData<T> {
  success: boolean;
  message: string;
  error?: string | null;
  data?: T;
}

export interface ContractOverview {
  package_hash: string;
  contract_name: string;
  owner_id: string;
  network: "mainnet" | "testnet";
  lock_status: boolean;
  age: number;
}

export interface ContractData {
  package_hash: string;
  contract_name: string;
  owner_id: string;
  network: "mainnet" | "testnet";
  lock_status: boolean;
  age: number;
  versions: ContractVersionData[];
}

export interface ContractVersionData {
  protocol_major_version: number;
  contract_version: number;
  contract_package_hash: string;
  contract_hash: string;
  contract_wasm_hash: string;
  user_id: string;
  protocol_version: string;
  named_keys: string[];
  entry_points: string[];
  disabled: boolean;
  age: string;
}

export interface ContractVersionDiffMeta {
  contract_hash: string;
  timestamp: string;
  contract_version: number;
  is_disabled: boolean;
  wasm_hash: string;
}

export interface ContractVersionDiff {
  v1: ContractVersionDiffMeta;
  v2: ContractVersionDiffMeta;
  contract_package_hash: string;
  entry_points: ContractEntryPointDiff[];
  named_keys: ContractNamedKeysDiff[];
}

export type ContractEntryPointDiff =
  | { Added: EntryPoint }
  | { Removed: EntryPoint }
  | { Modified: { from: EntryPoint; to: EntryPoint } };

export type ContractNamedKeysDiff =
  | { Added: { key: string; value: Key } }
  | { Removed: { key: string; value: Key } }
  | { Modified: { key: string; from: Key; to: Key } };

export interface EntryPoint {
  name: string;
  args: Parameters;
  ret: string;
  access: EntryPointAccess;
  entry_point_type: EntryPointType;
}

export type EntryPointAccess =
  | { Public: {} }
  | { Groups: string[] }
  | { Template: {} }
  | string;

export type EntryPointType = "Caller" | "Called" | "Factory"

export interface Parameters {
  [key: string]: any;
}

export interface Key {
  [key: string]: any;
}
