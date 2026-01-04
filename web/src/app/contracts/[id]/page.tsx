"use client";

import ContractDetailsPane from "@/components/ContractDetailsPane";
import ContractDetailsTab from "@/components/ContractDetailsTab";
import {
  dummyContractData,
  dummyVersionDiffData,
  dummyVersionMetaData,
} from "@/store/dummy";
import type { ContractData, ResponseData } from "@/types";
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
      const res = await fetch(
        `/api/v1/u/${userId}/contract-package/${contractPkgId}`,
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
          <ContractDetailsTab
            lifecycleData={dummyVersionMetaData}
            diffData={dummyVersionDiffData}
          />
        </div>
      </div>
    </div>
  );
}
