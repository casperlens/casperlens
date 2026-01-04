import { ContractOverview, ContractVersionData } from "@/types";
import { ScrollArea } from "@base-ui/react";

export default function ContractDetailsPane({ contractData, versionData }: { contractData: ContractOverview; versionData: ContractVersionData }) {
  return (
    <ScrollArea.Root className="w-80 shrink-0">
      <h2 className="text-xl font-bold mb-6">Package Details</h2>
      <ScrollArea.Viewport className="h-full">
        <ScrollArea.Content className="pr-12">
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
  )
}
