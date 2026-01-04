"use client";

import { ContractRegisterForm } from "@/components/ContractRegisterForm";
import { dummyContracts } from "@/store/dummy";
import type { ContractOverview, ResponseData } from "@/types";
import { Button } from "@base-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ContractPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ContractOverview[]>([]);

  const fetchContracts = async (user_id: string) => {
    try {
      const res = await fetch(`/api/v1/u/${user_id}/contract/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch contracts");
      }

      const json: ResponseData<ContractOverview[]> = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }
      if (!json.data) {
        throw new Error("No contract data found");
      }
      setContracts(json.data);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts(dummyContracts);
    }
  };

  const handleClick = (packageHash: string) => {
    console.log(`View details for contract with package hash: ${packageHash}`);
    router.push(`/contracts/${packageHash}`);
  };

  const formatHash = (hash: string) => {
    if (!hash) return "";
    if (hash.length < 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
  };

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetchContracts(userId);
    }
  }, []);

  return (
    <div className="py-12 bg-app max-w-7xl mx-auto min-h-screen border-x border-gray-800">
      <div className="">
        <div className="px-6 py-4 mb-8 flex justify-between items-center border-b border-primary">
          <h1 className="text-2xl font-bold text-gray-300">
            Contract Packages
          </h1>
          <ContractRegisterForm />
        </div>

        <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <div
              key={contract.package_hash}
              className="rounded-xl p-6 hover:shadow-md hover:shadow-text-primary transition-all duration-300 flex flex-col h-56 border bg-card border-primary hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 overflow-hidden mr-2">
                  <h3 className="font-bold text-lg mb-2 text-primary truncate" title={contract.contract_name}>
                    {contract.contract_name}
                  </h3>
                  <p className="text-xs text-subtle mb-1" title={contract.package_hash}>
                    {formatHash(contract.package_hash)}
                  </p>
                  <p className="text-xs text-muted" title={contract.owner_id}>
                    {formatHash(contract.owner_id)}
                  </p>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full font-medium text-xs whitespace-nowrap ${contract.lock_status ? "badge-locked" : "badge-unlocked"
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
                  <span className="text-muted px-2 py-1">{contract.age}d</span>
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
