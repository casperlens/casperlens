'use client';

import { ContractOverview } from "@/types";
import { Button } from "@base-ui/react";
import { useRouter } from "next/navigation";

export default function ContractPage() {
  const router = useRouter();
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
  }

  return (
    <div className="px-6 py-12">
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contractList.map((contract) => (
            <div
              key={contract.package_hash}
              className="min-w-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-56 border bg-[#0e0e0e] text-gray-300 border-gray-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-gray-300">
                    {contract.contract_name}
                  </h3>
                  <p className="text-xs break-all mb-1 text-gray-400">
                    {contract.package_hash}
                  </p>
                  <p className="text-xs text-gray-500">
                    {contract.owner_id}
                  </p>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full font-medium text-xs whitespace-nowrap ml-2 ${contract.lock_status
                    ? 'bg-red-900 text-red-400'
                    : 'bg-green-900 text-green-400'
                    }`}
                >
                  {contract.lock_status ? "Locked" : "Unlocked"}
                </span>
              </div>
              <div className="grow"></div>
              <div className="flex justify-between items-end">
                <div className="flex gap-3 text-xs">
                  <span className="inline-block px-2 py-1 rounded-full font-medium bg-blue-900 text-blue-400">
                    {contract.network}
                  </span>
                  <span className="text-gray-500">{contract.age}d</span>
                </div>
                <Button className="text-xs border rounded-lg px-2 py-1 text-white hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => handleClick(contract.package_hash)}>
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
