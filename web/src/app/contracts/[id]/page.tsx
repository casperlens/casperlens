"use client";

import ContractDetailsPane from "@/components/ContractDetailsPane";
import ContractDiff from "@/components/ContractDiff";
import { dummyContractData } from "@/store/dummy";
import type { ContractData, ResponseData } from "@/types";
import { Tabs } from "@base-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ContractDetailsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [contractData, setContractData] = useState<ContractData | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      router.push("/");
    } else {
      setUserId(storedUserId);
      const pkgId = window.location.pathname.split("/")[2];
      fetchContractData(storedUserId, pkgId);
    }
  }, []);

  const fetchContractData = async (uid: string, pid: string) => {
    try {
      const res = await fetch(
        `/api/v1/u/${uid}/contract-package/${pid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );


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
          <ContractDetailsPane
            contractData={contractData}
            versionData={currentVersion}
          />

          {/* Right Pane - Tabs Content */}
          <Tabs.Root className="flex-1 flex flex-col gap-3 border-2 border-primary">
            {/* Tab Navigation */}
            <Tabs.List className="flex gap-3 p-4 border-b-2 border-primary">
              <Tabs.Tab
                value="lifetime"
                className="px-2 py-1 rounded data-active:bg-gray-850"
              >
                Lifecycles
              </Tabs.Tab>
              <Tabs.Tab
                value="diff"
                className="px-2 py-1 rounded data-active:bg-gray-850"
              >
                Diff
              </Tabs.Tab>
            </Tabs.List>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto rounded-b-lg p-6 border border-t-0 bg-card border-primary">
              {/* Lifecycles Tab */}
              <Tabs.Panel value="lifetime">
                <h3 className="text-lg font-bold mb-4">Version Lifecycles</h3>
                <div className="space-y-4">
                  {contractData.versions.map((lifecycle, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border bg-tertiary border-primary"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">
                            Version {lifecycle.contract_version}
                          </p>
                          <p className="text-muted text-sm">
                            Age: {lifecycle.age}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${lifecycle.disabled ? "badge-error" : "badge-deployed"}`}
                        >
                          {lifecycle.disabled ? "disabled" : "active"}
                        </span>
                      </div>
                      <p className="text-muted text-sm">
                        Hash:{" "}
                        <span className="font-mono">
                          {lifecycle.contract_hash}
                        </span>
                      </p>
                      <p className="text-muted text-sm mt-1">
                        Protocol: {lifecycle.protocol_version}
                      </p>
                    </div>
                  ))}
                </div>
              </Tabs.Panel>

              {/* Diff Tab */}

              <Tabs.Panel value="diff">
                <ContractDiff
                  user_id={userId}
                  package_hash={contractData.package_hash}
                  versions={contractData.versions}
                />
              </Tabs.Panel>
            </div>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}
