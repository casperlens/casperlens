interface ContractRegister {
  package_hash: string;
  package_name: string;
  network: 'mainnet' | 'testnet';
}

interface ContractRegisterRes {
  success: true;
  message: string;
  error: string | null;
  data: null;
}

interface ContractSchema {
  package_hash: string;
  contract_name: string;
  owner_id: string;
  network: 'mainnet' | 'testnet';
  lock_status: boolean;
  age: number;
}

interface Contract {
  package_hash: string;
  contract_name: string;
  owner_id: string;
  network: 'mainnet' | 'testnet';
  lock_status: boolean;
  age: number;
  versions: Version[];
}

interface Version {
  protocol_major_version: number,
  contract_version: number,
  contract_package_hash: string,
  contract_hash: string,
  contract_wasm_hash: string,
  user_id: string,
  protocol_version: string,
  named_keys: string[],
  entry_points: string[],
  disabled: boolean,
  age: string,
}
