"use client";

import ContractDetailsPane from "@/components/ContractDetailsPane";
import ContractDetailsTab from "@/components/ContractDetailsTab";
import type { ContractData, ContractVersionDiff, ContractVersionDiffMeta, ResponseData } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ContractDetailsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [contractPkgId, setContractPkgId] = useState("");
  const [contractData, setContractData] = useState<ContractData | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      router.push("/");
    } else {
      setUserId(storedUserId);
      const pkgId = window.location.pathname.split("/")[2];
      setContractPkgId(pkgId);
      fetchContractData();
    }
  }, []);

  const fetchContractData = async () => {
    try {
      const res = await fetch(`/api/v1/u/${userId}/contract-package/${contractPkgId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json: ResponseData<ContractData> = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }
      if (!json.data) {
        throw new Error("No contract data found");
      }
      setContractData(json.data);
    } catch (error) {
      console.error("Error fetching contract data:", error);
      setContractData(dummyContractData);
      return null;
    }
  };

  const dummyContractData: ContractData = {
    package_hash: "hash-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    contract_name: "MySmartContract",
    owner_id: "account-hash-abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    network: "testnet",
    lock_status: false,
    age: 45,
    versions: [
      {
        protocol_major_version: 1,
        contract_version: 2,
        contract_package_hash: "hash-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        contract_hash: "hash-fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
        contract_wasm_hash: "hash-wasm1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
        user_id: "account-hash-abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        protocol_version: "1.5.2",
        named_keys: ["balance_key", "total_supply", "allowances"],
        entry_points: ["transfer", "approve", "mint", "burn"],
        disabled: false,
        age: "5 days",
      },
      {
        protocol_major_version: 1,
        contract_version: 1,
        contract_package_hash: "hash-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        contract_hash: "hash-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        contract_wasm_hash: "hash-wasm0987654321fedcba0987654321fedcba0987654321fedcba0987654321fe",
        user_id: "account-hash-abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        protocol_version: "1.5.1",
        named_keys: ["balance_key", "total_supply"],
        entry_points: ["transfer", "approve"],
        disabled: false,
        age: "45 days",
      },
    ],
  };

  const dummyVersionMetaData: ContractVersionDiffMeta[] = [
    {
      contract_hash: "hash-fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      contract_version: 2,
      is_disabled: false,
      wasm_hash: "hash-wasm1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    },
    {
      contract_hash: "hash-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      contract_version: 1,
      is_disabled: false,
      wasm_hash: "hash-wasm0987654321fedcba0987654321fedcba0987654321fedcba0987654321fe",
    },
  ];

  const dummyVersionDiffData: ContractVersionDiff = {
    v1: {
      contract_hash: "hash-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      contract_version: 1,
      is_disabled: false,
      wasm_hash: "hash-wasm0987654321fedcba0987654321fedcba0987654321fedcba0987654321fe",
    },
    v2: {
      contract_hash: "hash-fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      contract_version: 2,
      is_disabled: false,
      wasm_hash: "hash-wasm1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    },
    contract_package_hash: "hash-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    entry_points: [
      { Added: { name: "mint", access: "Public" } },
      { Added: { name: "burn", access: "Public" } },
    ],
    named_keys: [
      { Added: { key: "allowances", value: {} } },
    ],
  };

  if (!contractData) {
    return (
      <div className="min-h-screen p-8 bg-app text-primary flex items-center justify-center">
        <p className="text-lg">Loading contract data...</p>
      </div>
    );
  }

  const currentVersion = contractData.versions[0];

  return (
    <div className="min-h-screen p-8 bg-app text-primary">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {contractData.contract_name}
          </h1>
          <p className="text-tertiary">Contract Details & Versions</p>
        </div>

        {/* Two-pane layout */}
        <div className="flex gap-3 h-[calc(100vh-200px)]">
          {/* Left Pane - Contract Details */}
          <ContractDetailsPane contractData={contractData} versionData={currentVersion} />

          {/* Right Pane - Tabs Content */}
          <ContractDetailsTab lifecycleData={dummyVersionMetaData} diffData={dummyVersionDiffData} />
        </div>
      </div>
    </div>
  );
}
