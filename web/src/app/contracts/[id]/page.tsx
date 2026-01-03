"use client";

import { ScrollArea, Tabs } from "@base-ui/react";
import type { ContractOverview, Version } from "@/types";

export default function ContractDetailsPage() {
  // Mock contract data
  const contractData: ContractOverview = {
    package_hash: "hash_package_0123456789abcdef",
    contract_name: "MySmartContract",
    owner_id: "owner_0123456789abcdef",
    network: "mainnet",
    lock_status: false,
    age: 45,
  };

  // Mock version data
  const versionData: Version = {
    protocol_major_version: 1,
    contract_version: 2,
    contract_package_hash: "hash_package_0123456789abcdef",
    contract_hash: "hash_contract_0123456789abcdef",
    contract_wasm_hash: "hash_wasm_0123456789abcdef",
    user_id: "user_0123456789abcdef",
    protocol_version: "1.5.0",
    named_keys: ["balance", "allowance", "owner", "total_supply"],
    entry_points: ["transfer", "approve", "mint", "burn", "balance_of"],
    disabled: false,
    age: "45 days",
  };

  // Mock lifecycle data
  const lifecycleData = [
    {
      version: 1,
      timestamp: "2024-01-15T10:30:00Z",
      status: "deployed",
      hash: "hash_v1_0123456789",
    },
    {
      version: 2,
      timestamp: "2024-02-20T14:45:00Z",
      status: "upgraded",
      hash: "hash_v2_0123456789",
    },
  ];

  // Mock diff data
  const diffData = [
    {
      type: "added",
      item: "entry_point: burn",
    },
    {
      type: "added",
      item: "named_key: burn_events",
    },
    {
      type: "removed",
      item: "entry_point: mint_deprecated",
    },
    {
      type: "modified",
      item: "entry_point: transfer (gas optimization)",
    },
  ];

  // Mock metrics data
  const metricsData = [
    {
      label: "Total Deployments",
      value: "2",
    },
    {
      label: "Active Entry Points",
      value: "5",
    },
    {
      label: "Named Keys",
      value: "4",
    },
    {
      label: "Contract Size (KB)",
      value: "245",
    },
    {
      label: "Last Updated",
      value: "2024-02-20",
    },
    {
      label: "Disabled",
      value: "No",
    },
  ];

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
        <div className="flex gap-8 h-[calc(100vh-200px)]">
          {/* Left Pane - Contract Details */}
          <ScrollArea.Root className="w-80 shrink-0 p-3">
            <h2 className="text-xl font-bold mb-6">Package Details</h2>
            <ScrollArea.Viewport className="h-full">
              <ScrollArea.Content>
                {/* Contract Name */}
                <div className="mb-6 pb-6 border-b border-primary">
                  <p className="text-muted text-sm mb-2">Contract Name</p>
                  <p className="font-medium break-all">
                    {contractData.contract_name}
                  </p>
                </div>

                {/* Package Hash */}
                <div className="mb-6 pb-6 border-b border-primary">
                  <p className="text-muted text-sm mb-2">Package Hash</p>
                  <p className="font-mono text-xs break-all">
                    {contractData.package_hash}
                  </p>
                </div>

                {/* Owner ID */}
                <div className="mb-6 pb-6 border-b border-primary">
                  <p className="text-muted text-sm mb-2">Owner ID</p>
                  <p className="font-mono text-xs break-all">
                    {contractData.owner_id}
                  </p>
                </div>

                {/* Network */}
                <div className="mb-6 pb-6 border-b border-primary">
                  <p className="text-muted text-sm mb-2">Network</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${contractData.network === "mainnet" ? "badge-mainnet" : "badge-testnet"}`}
                  >
                    {contractData.network}
                  </span>
                </div>

                {/* Lock Status */}
                <div className="mb-6 pb-6 border-b border-primary">
                  <p className="text-muted text-sm mb-2">Lock Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${contractData.lock_status ? "badge-locked" : "badge-unlocked"}`}
                  >
                    {contractData.lock_status ? "Locked" : "Unlocked"}
                  </span>
                </div>

                {/* Age */}
                <div className="mb-6 pb-6 border-b border-primary">
                  <p className="text-muted text-sm mb-2">Age</p>
                  <p className="font-medium">{contractData.age} days</p>
                </div>

                {/* Current Version */}
                <div className="mb-6">
                  <p className="text-muted text-sm mb-3 font-semibold">
                    Current Version
                  </p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted">Version</p>
                      <p className="font-medium">
                        {versionData.contract_version}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Protocol Version</p>
                      <p className="font-mono text-xs">
                        {versionData.protocol_version}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Disabled</p>
                      <p className="font-medium">
                        {versionData.disabled ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar className="Scrollbar">
              <ScrollArea.Thumb className="Thumb" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

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
              <Tabs.Tab
                value="metric"
                className="px-2 py-1 rounded data-active:bg-gray-850"
              >
                Metrics
              </Tabs.Tab>
            </Tabs.List>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto rounded-b-lg p-6 border border-t-0 bg-card border-primary">
              {/* Lifecycles Tab */}
              <Tabs.Panel value="lifetime">
                <h3 className="text-lg font-bold mb-4">Version Lifecycles</h3>
                <div className="space-y-4">
                  {lifecycleData.map((lifecycle, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border bg-tertiary border-primary"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">
                            Version {lifecycle.version}
                          </p>
                          <p className="text-muted text-sm">
                            {new Date(lifecycle.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${lifecycle.status === "deployed" ? "badge-deployed" : "badge-upgraded"}`}
                        >
                          {lifecycle.status}
                        </span>
                      </div>
                      <p className="text-muted text-sm">
                        Hash:{" "}
                        <span className="font-mono">{lifecycle.hash}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </Tabs.Panel>

              {/* Diff Tab */}
              <Tabs.Panel value="diff">
                <h3 className="text-lg font-bold mb-4">
                  Changes in Latest Version
                </h3>
                <div className="space-y-3">
                  {diffData.map((diff, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border-l-4 flex items-start gap-3 bg-tertiary"
                      style={{
                        borderLeftColor:
                          diff.type === "added"
                            ? "var(--color-success)"
                            : diff.type === "removed"
                              ? "var(--color-error)"
                              : "var(--color-warning)",
                      }}
                    >
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap mt-0.5 ${
                          diff.type === "added"
                            ? "badge-success"
                            : diff.type === "removed"
                              ? "badge-error"
                              : "badge-warning"
                        }`}
                      >
                        {diff.type}
                      </span>
                      <p>{diff.item}</p>
                    </div>
                  ))}
                </div>
              </Tabs.Panel>

              {/* Metrics Tab */}
              <Tabs.Panel value="metric">
                <h3 className="text-lg font-bold mb-4">Contract Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {metricsData.map((metric, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border bg-tertiary border-primary"
                    >
                      <p className="text-muted text-sm mb-2">{metric.label}</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </Tabs.Panel>
            </div>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}
