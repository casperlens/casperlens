import { dummyVersionDiffData } from "@/store/dummy";
import { ContractVersionData, ContractVersionDiff, ResponseData } from "@/types";
import { Accordion, AccordionRootChangeEventDetails, AccordionValue, Button, Combobox } from "@base-ui/react";
import { useState } from "react";

interface VersionOption {
  value: number;
  label: string;
}

export default function ContractDiff({
  user_id,
  package_hash,
  versions,
}: {
  user_id: string;
  package_hash: string;
  versions: ContractVersionData[];
}) {
  const [v1, setV1] = useState<VersionOption | null>(null);
  const [v2, setV2] = useState<VersionOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedDiffData, setFetchedDiffData] =
    useState<ContractVersionDiff | null>(null);
  const [error, setError] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");

  const versionOptions: VersionOption[] = versions.map((v) => {
    return ({
      value: v.contract_version,
      label: `Version ${v.contract_version}`,
    });
  });

  const getAvailableV1Options = (): VersionOption[] => {
    if (v2) {
      return versionOptions.filter((opt) => opt.value !== v2.value);
    }
    return versionOptions;
  };

  const getAvailableV2Options = (): VersionOption[] => {
    if (v1) {
      return versionOptions.filter((opt) => opt.value !== v1.value);
    }
    return versionOptions;
  };

  const fetchDiffs = async (v1: number, v2: number) => {
    try {
      const res = await fetch(
        `/api/v1/u/${user_id}/contract-package/${package_hash}/diff?v1=${v1}&v2=${v2}`,
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

      const json: ResponseData<ContractVersionDiff> = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }
      if (!json.data) {
        throw new Error("No diff data found");
      }
      return json.data;
    } catch (error) {
      console.error("Error fetching diff data:", error);
      setFetchedDiffData(dummyVersionDiffData);
      throw error;
    }
  };

  const fetchAnalysis = async (diffData: ContractVersionDiff) => {
    try {
      const res = await fetch(
        `/api/v1/u/${user_id}/contract-package/diff/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: versions }),
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json: ResponseData<string> = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }
      if (!json.data) {
        throw new Error("No analysis data found");
      }
      setAnalysis(json.data);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setAnalysis("Failed to fetch analysis.");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v1 || !v2) {
      setError("Please select both versions to compare");
      return;
    }

    setIsLoading(true);
    setError("");
    setFetchedDiffData(null);

    try {
      const data = await fetchDiffs(v1.value, v2.value);
      setFetchedDiffData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch diff data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (value: AccordionValue, event: AccordionRootChangeEventDetails) => {
    if (!analysis && fetchedDiffData) {
      fetchAnalysis(fetchedDiffData);
    }
  }

  return (
    <>
      {/* Form for selecting versions to compare */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 rounded-lg border bg-tertiary border-primary"
      >
        <div className="flex flex-row gap-4 items-end">
          {/* Version 1 Combobox */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-secondary mb-2">
              Version 1
            </label>
            <Combobox.Root
              value={v1}
              onValueChange={(value) => setV1(value)}
              items={getAvailableV1Options()}
              itemToStringLabel={(item) => (item ? item.label : "")}
            >
              <Combobox.Trigger className="min-w-full px-3 py-2 bg-card border border-primary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all cursor-pointer flex items-center justify-between">
                <Combobox.Value>
                  {(value) =>
                    value ? (value as VersionOption).label : "Select version 1"
                  }
                </Combobox.Value>
                <Combobox.Icon className="ml-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Combobox.Icon>
              </Combobox.Trigger>
              <Combobox.Portal>
                <Combobox.Positioner className="z-50">
                  <Combobox.Popup className="min-w-xl bg-tertiary border border-primary rounded-lg shadow-lg overflow-hidden transition-all duration-150 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95">
                    <Combobox.List className="py-1 max-h-60 overflow-auto">
                      {(item: VersionOption) => (
                        <Combobox.Item
                          key={item.value}
                          value={item}
                          className="px-3 py-2 cursor-pointer hover:bg-primary-dark transition-colors flex items-center justify-between data-highlighted:bg-primary-dark"
                        >
                          <span className="text-primary">{item.label}</span>
                          <Combobox.ItemIndicator>
                            <svg
                              className="w-4 h-4 text-success"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </Combobox.ItemIndicator>
                        </Combobox.Item>
                      )}
                    </Combobox.List>
                  </Combobox.Popup>
                </Combobox.Positioner>
              </Combobox.Portal>
            </Combobox.Root>
          </div>

          {/* Version 2 Combobox */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-secondary mb-2">
              Version 2
            </label>
            <Combobox.Root
              value={v2}
              onValueChange={(value) => setV2(value)}
              items={getAvailableV2Options()}
              itemToStringLabel={(item) => (item ? item.label : "")}
            >
              <Combobox.Trigger className="w-full px-3 py-2 bg-card border border-primary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all cursor-pointer flex items-center justify-between">
                <Combobox.Value>
                  {(value) =>
                    value ? (value as VersionOption).label : "Select version 2"
                  }
                </Combobox.Value>
                <Combobox.Icon className="ml-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Combobox.Icon>
              </Combobox.Trigger>
              <Combobox.Portal>
                <Combobox.Positioner className="z-50">
                  <Combobox.Popup className="min-w-lg bg-tertiary border border-primary rounded-lg shadow-lg overflow-hidden transition-all duration-150 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95">
                    <Combobox.List className="py-1 max-h-60 overflow-auto">
                      {(item: VersionOption) => (
                        <Combobox.Item
                          key={item.value}
                          value={item}
                          className="px-3 py-2 cursor-pointer hover:bg-primary-dark transition-colors flex items-center justify-between data-highlighted:bg-primary-dark"
                        >
                          <span className="text-primary">{item.label}</span>
                          <Combobox.ItemIndicator>
                            <svg
                              className="w-4 h-4 text-success"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </Combobox.ItemIndicator>
                        </Combobox.Item>
                      )}
                    </Combobox.List>
                  </Combobox.Popup>
                </Combobox.Positioner>
              </Combobox.Portal>
            </Combobox.Root>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !v1 || !v2}
            className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {isLoading ? "Loading..." : "Compare"}
          </Button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 badge-error border border-error rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Display diff results */}
      {fetchedDiffData && (
        <>
          {/* Comparison */}
          <h4 className="text-md font-semibold mb-3">
            Comparing Version {fetchedDiffData.v1.contract_version} → Version{" "}
            {fetchedDiffData.v2.contract_version}
          </h4>

          {/* AI Analysis */}
          <div className="mb-6">
            <Accordion.Root onValueChange={handleValueChange}>
              <Accordion.Item value="info" className="border border-primary rounded-lg bg-tertiary overflow-hidden">
                <Accordion.Header>
                  <Accordion.Trigger className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-card transition-colors group">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-primary transition-transform duration-200 group-data-panel-open:rotate-90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <span className="font-semibold text-primary">AI Analysis</span>
                    </div>
                    <span className="text-xs text-muted bg-card px-2 py-1 rounded">
                      Click to expand
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="px-4 py-3 text-sm text-secondary border-t border-primary bg-card">
                  {analysis ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{analysis}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing changes...</span>
                    </div>
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion.Root>
          </div>

          <div className="space-y-3">
            {fetchedDiffData.entry_points?.map((diff, idx) => {
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
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap mt-0.5 ${type === "added"
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
            {fetchedDiffData.named_keys?.map((diff, idx) => {
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
                        ? "var(--color-success)"
                        : type === "removed"
                          ? "var(--color-error)"
                          : "var(--color-warning)",
                  }}
                >
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap mt-0.5 ${type === "added"
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
        </>
      )}
    </>
  );
}
