"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Register } from "@/components/elements/register";
import { Button } from "@/components/ui/button";
import type { ContractOverview, ResponseData } from "@/lib/types";
import { useWallet } from "./wallet-context";

function formatHash(hash: string, start = 6, end = 4) {
  if (!hash) return "";
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(hash.length - end)}`;
}

export default function DashboardContent() {
  const router = useRouter();
  const { activeAccount } = useWallet();
  const [contracts, setContracts] = useState<ContractOverview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/u/${userId}/contract/all`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.status === 404) {
        setContracts([]);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch contracts (${res.status})`);
      }

      const json: ResponseData<ContractOverview[]> = await res.json();
      if (json.error) {
        // Treat backend "not found" type errors as empty state
        if (json.error.toLowerCase().includes("found")) {
           setContracts([]);
           return;
        }
        throw new Error(json.error);
      }
      if (!json.data) {
        setContracts([]);
      } else {
        setContracts(json.data);
      }
    } catch (err) {
      // Swallow errors to avoid UI noise on new users, defaulting to empty state
      // unless it's a critical failure we want to show.
      console.warn("Error fetching contracts:", err);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAccount) {
      fetchContracts(activeAccount);
    } else {
      setLoading(false);
    }
  }, [activeAccount]);

  const handleView = (pkg: string) => {
    router.push(`/contract/${pkg}`);
  };

  const refresh = () => {
    if (activeAccount) fetchContracts(activeAccount);
  };

  return (
    <div className="py-10 bg-app min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary p-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Registered Contracts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of contract packages you have registered.
            </p>
          </div>

          <div className="flex md:items-center gap-3">
            <Register />
            <Button variant="secondary" onClick={refresh}>
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl p-6 animate-pulse flex flex-col h-56 border bg-card/40 border-primary/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 overflow-hidden mr-2">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-1" />
                  </div>
                  <div className="h-6 w-20 bg-muted rounded" />
                </div>
                <div className="grow" />
                <div className="flex justify-between items-end">
                  <div className="h-6 w-20 bg-muted rounded" />
                  <div className="h-9 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : contracts.length === 0 ? (
          <div className="rounded-md border border-primary/20 bg-card p-6 text-sm text-muted-foreground">
            No registered contracts found. Use the Register button to add a contract package.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((contract) => (
              <article key={contract.package_hash} className="rounded-xl p-6 flex flex-col h-56 border bg-card border-primary hover:shadow-md hover:shadow-primary/30 transition-transform duration-200 hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 overflow-hidden mr-2">
                    <h3 className="font-bold text-lg mb-2 text-primary truncate" title={contract.contract_name}>
                      {contract.contract_name || "(unnamed)"}
                    </h3>
                    <p className="text-xs text-subtle mb-1" title={contract.package_hash}>
                      {formatHash(contract.package_hash)}
                    </p>
                    <p className="text-xs text-muted" title={contract.owner_id}>
                      {formatHash(contract.owner_id)}
                    </p>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full font-medium text-xs whitespace-nowrap ${contract.lock_status ? "badge-locked" : "badge-unlocked"}`}>
                    {contract.lock_status ? "Locked" : "Unlocked"}
                  </span>
                </div>
                <div className="grow" />
                <div className="flex justify-between items-end">
                  <div className="flex gap-3 text-xs items-center">
                    <span className={`inline-block px-2 py-1 rounded-full font-medium text-xs ${contract.network === "mainnet" ? "badge-mainnet" : "badge-testnet"}`}>
                      {contract.network}
                    </span>
                    <span className="text-muted px-2 py-1">{contract.age}d</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleView(contract.package_hash)}>
                    View
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}