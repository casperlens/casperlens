import { ContractVersionDiff, ContractVersionDiffMeta } from "@/types";
import { Tabs } from "@base-ui/react";

export default function ContractDetailsTab({
  lifecycleData,
  diffData,
}: {
  lifecycleData: ContractVersionDiffMeta[];
  diffData: ContractVersionDiff;
}) {
  return (
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
            {lifecycleData.map((lifecycle, idx) => (
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
                      {new Date(lifecycle.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${lifecycle.is_disabled ? "badge-error" : "badge-deployed"}`}
                  >
                    {lifecycle.is_disabled ? "disabled" : "active"}
                  </span>
                </div>
                <p className="text-muted text-sm">
                  Hash:{" "}
                  <span className="font-mono">{lifecycle.contract_hash}</span>
                </p>
              </div>
            ))}
          </div>
        </Tabs.Panel>

        {/* Diff Tab */}
        <Tabs.Panel value="diff">
          <h3 className="text-lg font-bold mb-4">Changes in Latest Version</h3>
          <div className="space-y-3">
            {diffData.entry_points?.map((diff, idx) => {
              const type =
                "Added" in diff
                  ? "added"
                  : "Removed" in diff
                    ? "removed"
                    : "modified";
              const item =
                "Added" in diff
                  ? JSON.stringify(diff.Added)
                  : "Removed" in diff
                    ? JSON.stringify(diff.Removed)
                    : `${JSON.stringify(diff.Modified.from)} → ${JSON.stringify(diff.Modified.to)}`;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-lg border-l-4 flex items-start gap-3 bg-tertiary"
                  style={{
                    borderLeftColor:
                      type === "added"
                        ? "var(--color-success)"
                        : type === "removed"
                          ? "var(--color-error)"
                          : "var(--color-warning)",
                  }}
                >
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap mt-0.5 ${
                      type === "added"
                        ? "badge-success"
                        : type === "removed"
                          ? "badge-error"
                          : "badge-warning"
                    }`}
                  >
                    {type}
                  </span>
                  <p>{item}</p>
                </div>
              );
            })}
            {diffData.named_keys?.map((diff, idx) => {
              const type =
                "Added" in diff
                  ? "added"
                  : "Removed" in diff
                    ? "removed"
                    : "modified";
              const item =
                "Added" in diff
                  ? `${diff.Added.key}: ${JSON.stringify(diff.Added.value)}`
                  : "Removed" in diff
                    ? `${diff.Removed.key}: ${JSON.stringify(diff.Removed.value)}`
                    : `${diff.Modified.key}: ${JSON.stringify(diff.Modified.from)} → ${JSON.stringify(diff.Modified.to)}`;

              return (
                <div
                  key={`nk-${idx}`}
                  className="p-4 rounded-lg border-l-4 flex items-start gap-3 bg-tertiary"
                  style={{
                    borderLeftColor:
                      type === "added"
                        ? "badge-success"
                        : type === "removed"
                          ? "badge-error"
                          : "badge-warning",
                  }}
                >
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap mt-0.5 ${
                      type === "added"
                        ? "badge-success"
                        : type === "removed"
                          ? "badge-error"
                          : "badge-warning"
                    }`}
                  >
                    {type}
                  </span>
                  <p>{item}</p>
                </div>
              );
            })}
          </div>
        </Tabs.Panel>
      </div>
    </Tabs.Root>
  );
}
