"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ChartDataPoint,
  ContractData,
  ContractEntryPointDiff,
  ContractNamedKeysDiff,
  ContractVersionData,
  ContractVersionDiff,
  EntryPoint,
  Key,
  ResponseData,
  Transaction
} from "@/lib/types";
import { getUserId } from "@/lib/utils";
import { CircleAlert, Copy, Diff, GitBranch, Link, Lock, Minus, Plus, Sparkle, Sparkles, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Markdown from 'react-markdown';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import remarkGfm from 'remark-gfm';

const formatHash = (hash: string | undefined, start = 5, end = 5) => {
  if (!hash) return "";
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(hash.length - end)}`;
}

const hasVersions = (data: ContractData) => {
  return data.versions && data.versions.length > 0;
}

const versionTab = (v: ContractVersionData, i: number) => {
  return (
    <TabsContent
      key={i}
      value={v.contract_version.toString()}
      className="h-full mt-4 w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
    >
      <Card className="flex flex-col gap-3 justify-between">
        <div>
          <CardHeader className="text-lg text-muted-foreground font-semibold">
            <CardTitle>Version</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 xl:text-lg text-muted-foreground">
            <p>{v.contract_version}</p>
          </CardContent>
        </div>
        <div>
          <CardHeader className="text-lg text-muted-foreground font-semibold">
            <CardTitle>Age</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 xl:text-lg text-muted-foreground">
            <p>{v.age.slice(0, v.age.length - 1)} days</p>
          </CardContent>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 justify-between">
        <div>
          <CardHeader className="text-lg text-muted-foreground font-semibold">
            <CardTitle>Protocol Version</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 xl:text-lg text-muted-foreground">
            <p>{v.protocol_version}</p>
          </CardContent>
        </div>
        <div>
          <CardHeader className="text-lg text-muted-foreground font-semibold">
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 xl:text-lg text-muted-foreground">
            <Badge
              variant={v.disabled ? "destructive" : "secondary"}
              className={`space-x-2 ${v.disabled ? "bg-red-600 text-red-100" : "bg-green-600 text-green-100"}`}
            >
              {v.disabled ? (
                <>
                  <Lock />
                  <p>
                    Disabled
                  </p>
                </>
              ) : (
                <>
                  <Unlock />
                  <p>
                    Enabled
                  </p>
                </>
              )}
            </Badge>
          </CardContent>
        </div>
      </Card>
      {Object.entries(v)
        .filter(([k]) => k.toLowerCase().includes("hash") || k === "user_id")
        .map(([k, val]) => {
          const label = k
            .replace(/_/g, " ")
            .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());

          const stringified =
            val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);

          const displayValue = stringified;

          const showCopy =
            typeof stringified === "string" &&
            stringified.length > 0 &&
            (k.toLowerCase().includes("hash") || k.toLowerCase().includes("id") || stringified.length > 20);

          return (
            <Card key={k} className="flex flex-col gap-2">
              <CardHeader className="text-lg text-muted-foreground font-semibold">
                <CardTitle>
                  {label}
                  {showCopy ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard?.writeText(stringified);
                        toast.success(`${label} copied to clipboard`, {
                          position: "top-right",
                        });
                      }}
                    >
                      <Copy className="text-muted-foreground" />
                    </Button>
                  ) : <></>}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3 xl:text-lg text-muted-foreground text-wrap ">
                <p className="break-all">
                  {displayValue}
                </p>
              </CardContent>
            </Card>
          );
        })}
      <Card className="col-span-full">
        <CardHeader className="text-lg text-muted-foreground font-semibold">
          <CardTitle>Entry Points</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          {v.entry_points && v.entry_points.length > 0 ? v.entry_points.map((ep, idx) => (
            <Badge key={idx} variant="outline" className="px-3 py-1 text-sm">
              {ep}
            </Badge>
          )) : (
            <p className="text-muted-foreground">No entry points available.</p>
          )}
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader className="text-lg text-muted-foreground font-semibold">
          <CardTitle>Named Keys</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {v.named_keys && v.named_keys.length > 0 ? v.named_keys.map((nk, idx) => (
            <Badge key={idx} variant="outline" className="px-3 py-1 text-sm">
              {nk}
            </Badge>
          )) : (
            <p className="text-muted-foreground">No named keys available.</p>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

const formatAccess = (access: any) => {
  if (typeof access === "string") return access;
  if (typeof access === "object" && access !== null) {
    if ("Public" in access) return "Public";
    if ("Groups" in access) return `Groups: ${access.Groups.join(", ")}`;
    if ("Template" in access) return "Template";
  }
  return "Unknown";
};

const KeyValueCard = ({ title, value, highlight = false }: {
  title: string;
  value: Key;
  highlight?: boolean
}) => (
  <div className={`p-3 rounded-lg border transition-all group hover:shadow-sm col-span-full md:col-span-1 ${highlight
    ? "border-primary/60 bg-accent/20"
    : "border-border/30 hover:border-border/50"
    }`}>
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5 group-hover:text-muted-foreground/90 transition-colors">
      {title}
    </p>
    <div className="max-h-32 overflow-y-auto">
      <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed text-[0.75rem] bg-muted/30 p-3 rounded-md border border-border/20">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  </div>
);

const DetailCard = ({ title, value, highlight = false }: {
  title: string;
  value: string;
  highlight?: boolean
}) => (
  <div className={`p-3 rounded-lg border transition-all group hover:shadow-sm hover:border-border/80 ${highlight
    ? "border-primary/60 bg-accent/20"
    : "border-border/30 hover:border-border/50"
    }`}>
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 group-hover:text-muted-foreground/90 transition-colors">
      {title}
    </p>
    <p className={`font-mono font-medium text-sm leading-tight ${highlight ? "text-primary font-semibold" : "text-foreground"
      }`}>
      {value}
    </p>
  </div>
);

const ParameterCard = ({ title, args, highlight = false }: {
  title: string;
  args: Record<string, any>;
  highlight?: boolean
}) => (
  <div className={`p-3 rounded-lg border transition-all group hover:shadow-sm col-span-full md:col-span-2 ${highlight
    ? "border-primary/60 bg-accent/20"
    : "border-border/30 hover:border-border/50"
    }`}>
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5 group-hover:text-muted-foreground/90 transition-colors">
      {title}
    </p>
    {Object.keys(args).length > 0 ? (
      <div className="space-y-1.5 max-h-24 overflow-y-auto">
        {Object.entries(args).map(([key, value]) => (
          <div key={key} className="p-2.5 bg-muted/30 rounded-md border border-border/20 hover:bg-muted/50 transition-colors">
            <span className="font-mono text-xs font-medium text-foreground/90 block mb-1 truncate">{key}:</span>
            <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed text-[0.75rem]">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground italic font-medium py-1">No parameters</p>
    )}
  </div>
);

const EntryPointTab = ({ fetchedDiffData }: { fetchedDiffData: ContractVersionDiff }) => {
  return (
    <ScrollArea className="h-full pr-3">
      {fetchedDiffData.entry_points && fetchedDiffData.entry_points.length > 0 ? (

        <Accordion type="single" className="divide-y divide-border" defaultValue="ep-0" collapsible>
          {fetchedDiffData.entry_points.map((diff: ContractEntryPointDiff, idx) => {
            const type =
              "Added" in diff ? "added"
                : "Removed" in diff ? "removed"
                  : "modified";

            const entryPoint: EntryPoint =
              "Added" in diff ? diff.Added
                : "Removed" in diff ? diff.Removed
                  : diff.Modified.from;

            const entryPointTo = "Modified" in diff ? diff.Modified.to : null;

            return (
              <AccordionItem key={idx} value={`ep-${idx}`}>
                <AccordionTrigger className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-accent/50 transition-all group text-base font-medium leading-tight">
                  <div className="flex items-center gap-2.5 flex-1">
                    <Badge className={`inline-flex gap-1 items-center px-2.5 py-1 rounded-full text-xs font-medium ${type === "added" ? "badge-success"
                      : type === "removed" ? "badge-error"
                        : "badge-warning"
                      }`}>
                      {type === "added" ? <Plus /> : type === "removed" ? <Minus /> : <Diff />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                    <span className="font-mono text-lg font-semibold truncate">
                      {entryPoint.name}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 py-4 bg-background/30">
                  <ScrollArea className="h-56 pr-4">
                    <div className="space-y-5">
                      {/* Original Version */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                          Original Version
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <DetailCard title="Name" value={entryPoint.name} />
                          <DetailCard title="Return Type" value={entryPoint.ret} />
                          <DetailCard title="Access" value={formatAccess(entryPoint.access)} />
                          <DetailCard title="Type" value={entryPoint.entry_point_type} />
                          <ParameterCard title="Parameters" args={entryPoint.args} />
                        </div>
                      </div>

                      {/* Modified To Version */}
                      {type === "modified" && entryPointTo && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1 border-t border-border/50 pt-3">
                            To (v{fetchedDiffData.v2.contract_version})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <DetailCard title="Name" value={entryPointTo.name} highlight />
                            <DetailCard title="Return Type" value={entryPointTo.ret} highlight />
                            <DetailCard title="Access" value={formatAccess(entryPointTo.access)} highlight />
                            <DetailCard title="Type" value={entryPointTo.entry_point_type} highlight />
                            <ParameterCard title="Parameters" args={entryPointTo.args} highlight />
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Diff />
            </EmptyMedia>
            <EmptyTitle>No diff data to display.</EmptyTitle>
            <EmptyDescription>
              Please select two versions and click Compare to see the differences.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </ScrollArea>
  )
}

const NamedKeysTab = ({ fetchedDiffData }: { fetchedDiffData: ContractVersionDiff }) => {
  return (
    <ScrollArea className="h-full pr-3">
      {fetchedDiffData.named_keys && fetchedDiffData.named_keys.length > 0 ? (
        <Accordion type="single" className="divide-y divide-border" defaultValue="nk-0" collapsible>
          {fetchedDiffData.named_keys.map((diff: ContractNamedKeysDiff, idx) => {
            const type =
              "Added" in diff ? "added"
                : "Removed" in diff ? "removed"
                  : "modified";

            const keyName: string =
              "Added" in diff ? diff.Added.key
                : "Removed" in diff ? diff.Removed.key
                  : diff.Modified.key;

            const keyValue: Key =
              "Added" in diff ? diff.Added.value
                : "Removed" in diff ? diff.Removed.value
                  : diff.Modified.from;

            const keyValueTo = "Modified" in diff ? diff.Modified.to : null;

            return (
              <AccordionItem key={idx} value={`nk-${idx}`}>
                <AccordionTrigger className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-accent/50 transition-all group text-base font-medium leading-tight">
                  <div className="flex items-center gap-2.5 flex-1">
                    <Badge className={`inline-flex gap-1 items-center px-2.5 py-1 rounded-full text-xs font-medium ${type === "added" ? "badge-success"
                      : type === "removed" ? "badge-error"
                        : "badge-warning"
                      }`}>
                      {type === "added" ? <Plus /> : type === "removed" ? <Minus /> : <Diff />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                    <span className="font-mono text-lg font-semibold truncate">
                      {keyName}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 py-4 bg-background/30">
                  <ScrollArea className="h-56 pr-4">
                    <div className="space-y-5">
                      {/* Original Version */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                          Original Version
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <DetailCard title="Key Name" value={keyName} />
                          <KeyValueCard title="Value" value={keyValue} />
                        </div>
                      </div>

                      {/* Modified To Version */}
                      {type === "modified" && keyValueTo && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1 border-t border-border/50 pt-3">
                            To (v{fetchedDiffData.v2.contract_version})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <DetailCard title="Key Name" value={keyName} highlight />
                            <KeyValueCard title="Value" value={keyValueTo} highlight />
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Diff />
            </EmptyMedia>
            <EmptyTitle>No diff data to display.</EmptyTitle>
            <EmptyDescription>
              Please select two versions and click Compare to see the differences.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </ScrollArea>
  );
};

const SummaryTab = ({
  fetchedDiffData,
  analysis
}: {
  fetchedDiffData: ContractVersionDiff;
  analysis?: string
}) => {
  const hasAnalysis = analysis && analysis.trim().length > 0;
  const hasDiffData = fetchedDiffData.entry_points?.length > 0 || fetchedDiffData.named_keys?.length > 0;

  return (
    <ScrollArea className="h-full pr-3">
      {hasAnalysis ? (
        <div className="prose prose-sm max-w-none p-5 space-y-4">
          <div className="prose-content">
            <Markdown remarkPlugins={[remarkGfm]}>
              {analysis}
            </Markdown>
          </div>
        </div>
      ) : hasDiffData ? (
        <div className="p-8 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-accent/20 rounded-xl border-2 border-dashed border-accent p-3 mx-auto mb-4">
              <Sparkle className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Analysis Ready</h3>
            <p className="text-sm text-muted-foreground">
              Diff data detected! Analysis summary will appear here once generated.
            </p>
          </div>
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkle />
            </EmptyMedia>
            <EmptyTitle>No analysis data to display.</EmptyTitle>
            <EmptyDescription>
              Please select two versions and click Compare to see the differences.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </ScrollArea>
  );
};

const DiffTab = ({ contractData }: { contractData: ContractData }) => {
  const [v1, setV1] = useState<ContractVersionData | null>(null);
  const [v2, setV2] = useState<ContractVersionData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [fetchedDiffData, setFetchedDiffData] =
    useState<ContractVersionDiff | null>(null);
  const [error, setError] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");

  const { package_hash, versions } = contractData;

  const fetchDiffs = async (v1: number, v2: number) => {
    try {
      const user_id = getUserId();
      if (!user_id) {
        throw new Error("User not authenticated");
      }
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
      fetchAnalysis(json.data);
      return json.data;
    } catch (error) {
      console.error("Error fetching diff data:", error);
      throw error;
    }
  };

  const fetchAnalysis = async (diffData: ContractVersionDiff) => {
    try {
      const user_id = getUserId();
      if (!user_id) {
        throw new Error("User not authenticated");
      }
      const res = await fetch(
        `/api/v1/u/${user_id}/contract-package/diff/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(diffData),
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v1 || !v2) {
      setError("Please select both versions to compare");
      return;
    }
    if (v1.contract_version === v2.contract_version) {
      setError("Please select two different versions to compare");
      return;
    }
    if (v1.contract_version > v2.contract_version) {
      setError("Version 1 must be less than Version 2");
      return;
    }

    setIsLoading(true);
    setError("");
    setFetchedDiffData(null);

    try {
      const data = await fetchDiffs(v1.contract_version, v2.contract_version);
      console.log("Fetched Data:\n", data);
      setFetchedDiffData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch diff data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-3 xl:gap-6 max-h-full">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Compare Versions
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full flex flex-col justify-between">
          <form
            className="h-full flex flex-col justify-between gap-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <Combobox
                items={versions}
                itemToStringLabel={(opt: ContractVersionData) => `Version ${opt.contract_version}`}
                itemToStringValue={(opt: ContractVersionData) => opt.contract_version.toString()}
                onValueChange={(value: ContractVersionData | null, e) => {
                  if (value !== null) setV1(value);
                  setError("");
                }}
              >
                <ComboboxInput placeholder="Select Version 1" aria-invalid={error ? "true" : "false"} />
                <ComboboxContent>
                  <ComboboxEmpty>
                    No versions available
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item: ContractVersionData) => (
                      <ComboboxItem
                        key={item.contract_version}
                        value={item}
                      >
                        Version {item.contract_version}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <Combobox
                items={versions}
                itemToStringLabel={(opt: ContractVersionData) => `Version ${opt.contract_version}`}
                itemToStringValue={(opt: ContractVersionData) => opt.contract_version.toString()}
                onValueChange={(value: ContractVersionData | null, e) => {
                  if (value !== null) setV2(value);
                  setError("");
                }}
              >
                <ComboboxInput placeholder="Select Version 2" aria-invalid={error ? "true" : "false"} />
                <ComboboxContent>
                  <ComboboxEmpty>
                    No versions available
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item: ContractVersionData) => (
                      <ComboboxItem
                        key={item.contract_version}
                        value={item}
                      >
                        Version {item.contract_version}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {error && (
                <Item variant="outline" className="bg-destructive/10 border-destructive">
                  <ItemMedia>
                    <CircleAlert className="text-destructive" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="text-destructive">
                      {error}
                    </ItemTitle>
                  </ItemContent>
                </Item>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  Comparing...
                  <Spinner className="text-sm" />
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Compare
                  <Diff />
                </span>
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
      <Card className="flex flex-1 col-span-3 min-h-full">
        {fetchedDiffData ? (
          <>
            <Tabs defaultValue="entry_point" className="h-full w-full flex flex-col justify-start">
              <CardHeader className="flex flex-col items-start px-6">
                <TabsList className="flex mb-4" variant="default">
                  <TabsTrigger value="entry_point" className="text-lg p-5">
                    <Diff />
                    Entry Point Diffs
                  </TabsTrigger>
                  <TabsTrigger value="named_keys" className="text-lg p-5">
                    <Diff />
                    Named Key Diffs
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="text-lg p-5">
                    <Sparkles />
                    AI Analysis
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="h-full">
                <TabsContent value="entry_point" className="h-full w-full">
                  <EntryPointTab fetchedDiffData={fetchedDiffData} />
                </TabsContent>
                <TabsContent value="named_keys" className="h-full w-full">
                  <NamedKeysTab fetchedDiffData={fetchedDiffData} />
                </TabsContent>
                <TabsContent value="summary" className="max-h-full w-full overflow-clip">
                  <SummaryTab fetchedDiffData={fetchedDiffData} analysis={analysis} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Diff />
              </EmptyMedia>
              <EmptyTitle>
                No diff data to display.
              </EmptyTitle>
              <EmptyDescription>
                Please select two versions and click Compare to see the differences.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Card >
    </div >
  )
}

const TransactionsTab = ({ transactions }: { transactions: Transaction[] }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleAlert />
            </EmptyMedia>
            <EmptyTitle>No transactions found.</EmptyTitle>
            <EmptyDescription>
              There are no transactions associated with this contract.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    );
  }

  const formatHashLocal = (hash: string, start = 6, end = 6) => {
    if (!hash) return "";
    if (hash.length <= start + end + 3) return hash;
    return `${hash.slice(0, start)}...${hash.slice(hash.length - end)}`;
  };

  const formatAmountLocal = (amount: string) => {
    try {
      const val = parseInt(amount);
      if (isNaN(val)) return amount;
      return (val / 1_000_000_000).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 5,
      }) + " CSPR";
    } catch {
      return amount;
    }
  };

  const formatDateLocal = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="h-full border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <span>Transaction History</span>
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {transactions.length} found
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full rounded-md border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="text-muted-foreground">
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Hash</th>
                <th className="p-3 text-left font-medium">Method</th>
                <th className="p-3 text-left font-medium">From</th>
                <th className="p-3 text-left font-medium">Cost</th>
                <th className="p-3 text-left font-medium">Time</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.deploy_hash} className="border-t">
                  <td className="p-3">
                    {tx.status?.toLowerCase() === "executed" || tx.status?.toLowerCase() === "processed" || !tx.error_message ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">
                        Failed
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">
                    <span title={tx.deploy_hash}>{formatHashLocal(tx.deploy_hash)}</span>
                  </td>
                  <td className="p-3">
                    {tx.entry_point_id ? (
                      <Badge variant="secondary" className="font-mono text-xs">
                        ID: {tx.entry_point_id}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Unknown</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">
                    <span title={tx.caller_public_key}>
                      {formatHashLocal(tx.caller_public_key)}
                    </span>
                  </td>
                  <td className="p-3 text-xs">{formatAmountLocal(tx.cost)}</td>
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateLocal(tx.timestamp)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          navigator.clipboard?.writeText(tx.deploy_hash);
                          toast.success("Transaction Hash copied", {
                            position: "top-right",
                          });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        asChild
                      >
                        <a
                          href={`https://testnet.cspr.live/deploy/${tx.deploy_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Link />
                        </a>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Contract details page using shadcn UI components.
 * Full viewport layout: left column with metadata + latest version,
 * right column with tabs (overview / versions / diffs) using Cards and ScrollArea.
 */
export default function ContractPage() {
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [packageHash, setPackageHash] = useState<string>("");
  const [loadingChart, setLoadingChart] = useState<boolean>(true);
  const [granularity, setGranularity] = useState<"hour" | "day" | "week" | "month" | "year">("hour");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastCount, setLastCount] = useState<number>(90); // default: last 90 buckets
  const [pendingGranularity, setPendingGranularity] = useState<"hour" | "day" | "week" | "month" | "year">("hour");
  const [pendingLastCountStr, setPendingLastCountStr] = useState<string>("90");

  useEffect(() => {
    setPendingGranularity(granularity);
    setPendingLastCountStr(lastCount.toString());
  }, [granularity, lastCount]);

  const chartConfig: ChartConfig = {
    transactions: {
      label: "Transactions"
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId =
          typeof window !== "undefined"
            ? localStorage.getItem("user_id")
            : null;
        if (!userId) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const path =
          typeof window !== "undefined" ? window.location.pathname : "";
        const parts = path.split("/").filter(Boolean);
        const pkgId = parts[parts.length - 1] ?? "";

        const res = await fetch(
          `/api/v1/u/${userId}/contract-package/${encodeURIComponent(pkgId)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch contract (${res.status})`);
        }

        const json: ResponseData<ContractData> = await res.json();
        if (json.error) throw new Error(json.error);
        if (!json.data) throw new Error("No contract data returned");

        setContractData(json.data);
        setPackageHash(json.data.package_hash);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTransactionTimestamps = (transactions: Transaction[]) => {
    // Normalize to bucket start for a given granularity (UTC-safe)
    const floorDateToBucket = (d: Date, g: typeof granularity): Date => {
      const date = new Date(d);
      switch (g) {
        case "hour": {
          date.setUTCMinutes(0, 0, 0);
          return date;
        }
        case "day": {
          date.setUTCHours(0, 0, 0, 0);
          return date;
        }
        case "week": {
          // Start of ISO-like week (Monday)
          const day = date.getUTCDay(); // 0 = Sunday
          const diff = (day === 0 ? -6 : 1 - day); // move to Monday
          date.setUTCDate(date.getUTCDate() + diff);
          date.setUTCHours(0, 0, 0, 0);
          return date;
        }
        case "month": {
          date.setUTCDate(1);
          date.setUTCHours(0, 0, 0, 0);
          return date;
        }
        case "year": {
          date.setUTCMonth(0, 1);
          date.setUTCHours(0, 0, 0, 0);
          return date;
        }
      }
    };

    // Convert a bucket date into a stable ISO timestamp string for X axis
    const bucketKey = (d: Date, g: typeof granularity): string => {
      const iso = d.toISOString();
      switch (g) {
        case "hour":
          // yyyy-mm-ddThh:00:00Z
          return iso.slice(0, 13) + ":00:00Z";
        case "day":
        case "week":
          // yyyy-mm-dd
          return iso.split("T")[0];
        case "month":
          // yyyy-mm-01 (full date for stable Date parsing)
          return iso.split("T")[0];
        case "year":
          // yyyy-01-01 (full date for stable Date parsing)
          return iso.split("T")[0];
      }
    };

    // Step bucket date backwards by 'step' units of granularity
    const stepBucket = (d: Date, g: typeof granularity, step: number): Date => {
      const date = new Date(d);
      switch (g) {
        case "hour":
          date.setUTCHours(date.getUTCHours() + step);
          break;
        case "day":
          date.setUTCDate(date.getUTCDate() + step);
          break;
        case "week":
          date.setUTCDate(date.getUTCDate() + step * 7);
          break;
        case "month":
          date.setUTCMonth(date.getUTCMonth() + step);
          break;
        case "year":
          date.setUTCFullYear(date.getUTCFullYear() + step);
          break;
      }
      return floorDateToBucket(date, g);
    };

    // 1) Aggregate counts per bucket from cached transactions
    const aggregated: Record<string, number> = {};
    for (const tx of transactions) {
      const bucketDate = floorDateToBucket(new Date(tx.timestamp), granularity);
      const key = bucketKey(bucketDate, granularity);
      aggregated[key] = (aggregated[key] ?? 0) + 1;
    }

    // 2) Generate placeholder buckets over the last N buckets ending at "now"
    const end = floorDateToBucket(new Date(), granularity);
    const points: ChartDataPoint[] = [];
    const safeLast = Math.max(1, lastCount); // enforce at least 1 bucket
    for (let i = safeLast - 1; i >= 0; i--) {
      const d = stepBucket(end, granularity, -i);
      const key = bucketKey(d, granularity);
      points.push({
        timestamp: key,
        transactions: aggregated[key] ?? 0,
      });
    }

    setChartData(points);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoadingChart(true);
      setError(null);
      try {
        const userId = getUserId();
        if (!userId) throw new Error("User not authenticated");

        const res = await fetch(
          `/api/v1/u/${userId}/contract-package/${packageHash}/transactions`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch transactions (${res.status})`);
        }

        const json = await res.json();
        if (json.success && json.data) {
          setTransactions(json.data);
          formatTransactionTimestamps(json.data);
        } else {
          throw new Error(json.error || "Failed to load transactions");
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoadingChart(false);
      }
    };

    if (packageHash) {
      fetchTransactions();
    }
  }, [packageHash]);

  useEffect(() => {
    formatTransactionTimestamps(transactions);
  }, [granularity, lastCount, transactions]);

  // Loading state (full viewport card)
  if (loading) {
    return (
      <div className="min-h-full bg-app flex items-center justify-center gap-6 text-xl">
        <Spinner className="text-xl xl:text-2xl" />
        <div className="text-xl xl:text-2xl font-medium text-primary">
          Loading contract...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-full bg-app p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent>
              <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!contractData) {
    return null;
  }

  return (
    <div className="h-screen bg-app text-primary p-10">
      <div className="flex flex-col gap-4 flex-1 min-h-full">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold">
              {contractData.contract_name || "Contract Package"}
            </h2>
            <div className="font-mono text-muted-foreground space-x-3 flex items-center">
              <span className="font-semibold">
                Package Hash:
              </span>
              <span>
                {formatHash(contractData.package_hash)}
              </span>
              <Button variant="ghost"
                onClick={() => {
                  navigator.clipboard?.writeText(contractData.package_hash)
                  toast.success("Package hash copied to clipboard", {
                    position: "top-right",
                  })
                }}
              >
                <Copy className="text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          className="flex-1 flex flex-col h-full"
        >
          <TabsList className="flex mb-4" variant="line">
            <TabsTrigger value="overview" className="text-lg">
              Overview
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-lg">
              Versions
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-lg">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="diffs" className="text-lg">
              Diffs
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="h-full w-full grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 lg:grid-rows-2"
          >
            <Card className="lg:col-span-1 flex flex-col h-full gap-4 lg:gap-6 lg:row-span-2">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Package metadata
                </CardTitle>
              </CardHeader>

              <ScrollArea className="h-15/16">
                <CardContent className="">
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex flex-col gap-2 justify-between">
                      <p className="text-lg text-muted-foreground font-semibold inline-flex items-center gap-2">
                        Package Hash
                        <Button variant="ghost" className="rounded-full"
                          onClick={() => {
                            navigator.clipboard?.writeText(contractData.package_hash)
                            toast.success("Package Hash copied to clipboard", {
                              position: "top-right",
                            })
                          }}
                        >
                          <Copy className="text-muted-foreground" />
                        </Button>
                      </p>
                      <div className="flex items-center gap-3 xl:text-md text-muted-foreground">
                        <p className="break-all">
                          {contractData.package_hash}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2 justify-between">
                      <p className="text-lg text-muted-foreground font-semibold inline-flex items-center gap-2">
                        Owner
                        <Button variant="ghost"
                          className="rounded-full"
                          onClick={() => {
                            navigator.clipboard?.writeText(contractData.owner_id)
                            toast.success("Owner ID copied to clipboard", {
                              position: "top-right",
                            })
                          }}
                        >
                          <Copy className="text-muted-foreground" />
                        </Button>
                      </p>
                      <div className="flex items-center gap-3 xl:text-md text-muted-foreground">
                        <p className="break-all">
                          {contractData.owner_id}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3 py-3">
                      <div className="flex flex-col gap-2 xl:flex-row justify-between xl:items-center">
                        <p className="text-lg text-muted-foreground font-semibold">
                          Network
                        </p>
                        <Badge
                          variant={
                            contractData.network === "mainnet"
                              ? "default"
                              : "outline"
                          }
                          className="space-x-2"
                        >
                          <Link data-icon="inline-start" />
                          <p>
                            {contractData.network === "mainnet"
                              ? "Mainnet"
                              : "Testnet"}
                          </p>
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2 xl:flex-row justify-between xl:items-center">
                        <p className="text-lg text-muted-foreground font-semibold">
                          Status
                        </p>
                        <Badge
                          variant={
                            contractData.lock_status
                              ? "destructive"
                              : "secondary"
                          }
                          className={`space-x-2 ${contractData.lock_status ? "bg-red-600 text-red-100" : "bg-green-600 text-green-100"}`}
                        >
                          {contractData.lock_status ? (
                            <>
                              <Lock />
                              <p>
                                Locked
                              </p>
                            </>
                          ) : (
                            <>
                              <Unlock />
                              <p>
                                Unlocked
                              </p>
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-lg text-muted-foreground font-semibold">
                          Age
                        </p>
                        <p className="xl:text-lg">
                          {contractData.age} days
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </div>
                </CardContent>
                <CardHeader className="mt-4">
                  <CardTitle className="text-2xl font-bold flex justify-between">
                    <span>
                      Versions
                    </span>
                    <span className="bg-muted px-3 py-1 rounded-full text-sm font-mono">
                      {hasVersions(contractData) ? contractData.versions.length : 0}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full flex flex-col gap-3 pt-5">
                  {hasVersions(contractData) ? contractData.versions.map((v, i) => (
                    <Badge variant="secondary" className="px-3 py-1 text-sm" key={i}>
                      <GitBranch />
                      Version {v.contract_version}
                    </Badge>
                  )) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia>
                          <GitBranch />
                        </EmptyMedia>
                        <EmptyTitle>
                          No versions found.
                        </EmptyTitle>
                      </EmptyHeader>
                    </Empty>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>

            <div className="lg:col-span-2 xl:col-span-3 lg:row-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    Transaction Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full flex flex-col p-6 transition-all">
                  {loadingChart ? (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Spinner />
                        </EmptyMedia>
                        <EmptyTitle>
                          Loading analytics...
                        </EmptyTitle>
                        <EmptyDescription>
                          Detailed analytics and charts will be available here.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <>
                      <form
                        className="flex flex-wrap items-center gap-3 mb-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          setGranularity(pendingGranularity);
                          const parsed = parseInt(pendingLastCountStr, 10);
                          setLastCount(isNaN(parsed) || parsed < 1 ? 1 : parsed);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Granularity</span>
                          <Select value={pendingGranularity} onValueChange={(v) => setPendingGranularity(v as any)}>
                            <SelectTrigger className="w-[150px]" aria-label="Select granularity">
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="hour" className="rounded-lg">Hour</SelectItem>
                              <SelectItem value="day" className="rounded-lg">Day</SelectItem>
                              <SelectItem value="week" className="rounded-lg">Week</SelectItem>
                              <SelectItem value="month" className="rounded-lg">Month</SelectItem>
                              <SelectItem value="year" className="rounded-lg">Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Last</span>
                          <Input
                            type="text"
                            className="w-[120px] h-9 px-3 py-2 rounded-md border bg-background text-sm"
                            value={pendingLastCountStr}
                            onChange={(e) => {
                              setPendingLastCountStr(e.target.value);
                            }}
                            placeholder="Enter count"
                            aria-label="Enter last count"
                          />
                          <span className="text-sm text-muted-foreground">
                            {pendingGranularity === "hour" ? "hours" :
                              pendingGranularity === "day" ? "days" :
                                pendingGranularity === "week" ? "weeks" :
                                  pendingGranularity === "month" ? "months" : "years"}
                          </span>
                        </div>
                        <div>
                          <Button
                            type="submit"
                            variant="default"
                          >
                            Update
                          </Button>
                        </div>
                      </form>
                      <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-full w-full"
                      >
                        <AreaChart data={chartData}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="timestamp"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                              const d = new Date(value)
                              switch (granularity) {
                                case "hour":
                                  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", hour12: false })
                                case "day":
                                case "week":
                                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                case "month":
                                  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
                                case "year":
                                  return String(d.getUTCFullYear())
                                default:
                                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                              }
                            }}
                          />
                          <YAxis domain={[0, 'dataMax']} allowDecimals={false} />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => {
                                  const d = new Date(value)
                                  switch (granularity) {
                                    case "hour":
                                      return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", hour12: false })
                                    case "day":
                                    case "week":
                                      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                    case "month":
                                      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
                                    case "year":
                                      return String(d.getUTCFullYear())
                                    default:
                                      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                  }
                                }}
                                indicator="dot"
                              />
                            }
                          />
                          <Area
                            dataKey="transactions"
                            type="basis"
                            stroke="var(--color-accent)"
                          />
                        </AreaChart>
                      </ChartContainer>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="versions" className="h-full w-full grid grid-cols-1">
            <div className="h-full col-span-1">
              {hasVersions(contractData) ? (
                <>
                  <Tabs orientation="horizontal" className="h-full lg:h-auto lg:hidden" defaultValue={contractData.versions[0].contract_version.toString()}>
                    <TabsList>
                      {contractData.versions.map((v, i) => (
                        <TabsTrigger key={i} value={v.contract_version.toString()} className="text-lg">
                          Version {v.contract_version}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {contractData.versions.map((v, i) => (
                      versionTab(v, i)
                    ))}
                  </Tabs>
                  <Tabs
                    orientation="vertical"
                    className="h-full hidden lg:grid lg:grid-cols-6 gap-6"
                    defaultValue={contractData.versions[0].contract_version.toString()}
                  >
                    <div className="lg:col-span-1 w-full border-r pr-4">
                      <h2 className="lg:text-lg xl:text-2xl font-bold mb-4">
                        Versions
                      </h2>
                      <TabsList className="flex w-full" variant="default">
                        {contractData.versions.map((v, i) => (
                          <TabsTrigger key={i} value={v.contract_version.toString()} className="text-lg p-3 w-full lg:text-sm xl:text-lg">
                            Version {v.contract_version}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                    <ScrollArea className="lg:col-span-5 h-14/15 pr-5">
                      {contractData.versions.map((v, i) => (
                        versionTab(v, i)
                      ))}
                    </ScrollArea>
                  </Tabs>
                </>
              ) : (
                <Empty className="border h-full">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <GitBranch />
                    </EmptyMedia>
                    <EmptyTitle>
                      No versions found.
                    </EmptyTitle>
                    <EmptyDescription>
                      Detailed version history will be available here.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="h-full w-full grid grid-cols-1">
            <TransactionsTab transactions={transactions} />
          </TabsContent>

          <TabsContent value="diffs" className="h-full w-full grid grid-cols-1">
            <DiffTab contractData={contractData} />
          </TabsContent>
        </Tabs>
      </div >
    </div >
  );
}
