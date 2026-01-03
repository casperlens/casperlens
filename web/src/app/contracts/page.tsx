"use client";

import { Button } from "@base-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContractRegisterForm } from "@/components/ContractRegisterForm";
import type { ContractOverview } from "@/types";

export default function ContractPage() {
  const router = useRouter();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const contractList: ContractOverview[] = [
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

  const handleClick = (packageHash: string) => {
    console.log(`View details for contract with package hash: ${packageHash}`);
    router.push(`/contracts/${packageHash}`);
  };

  return (
    <div className="px-6 py-12 bg-app">
      <div className="mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-300">
            Contract Packages
          </h1>
          <Button
            onClick={() => setShowRegisterModal(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Register Contract
          </Button>
        </div>

        {showRegisterModal && (
          <ContractRegisterForm onClose={() => setShowRegisterModal(false)} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contractList.map((contract) => (
            <div
              key={contract.package_hash}
              className="min-w-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-56 border bg-card border-primary"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-primary">
                    {contract.contract_name}
                  </h3>
                  <p className="text-xs break-all mb-1 text-subtle">
                    {contract.package_hash}
                  </p>
                  <p className="text-xs text-muted">{contract.owner_id}</p>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full font-medium text-xs whitespace-nowrap ml-2 ${
                    contract.lock_status ? "badge-locked" : "badge-unlocked"
                  }`}
                >
                  {contract.lock_status ? "Locked" : "Unlocked"}
                </span>
              </div>
              <div className="grow"></div>
              <div className="flex justify-between items-end">
                <div className="flex gap-3 text-xs">
                  <span
                    className={`inline-block px-2 py-1 rounded-full font-medium ${contract.network === "mainnet" ? "badge-mainnet" : "badge-testnet"}`}
                  >
                    {contract.network}
                  </span>
                  <span className="text-muted">{contract.age}d</span>
                </div>
                <Button
                  className="text-xs border rounded-lg px-2 py-1 text-white hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => handleClick(contract.package_hash)}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
