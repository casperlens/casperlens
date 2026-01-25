"use client";

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
  ContractData,
  ContractVersionData,
  ContractVersionDiff,
  ResponseData
} from "@/lib/types";
import { getUserId } from "@/lib/utils";
import { ChartLine, CircleAlert, Copy, Diff, GitBranch, Link, Lock, Sparkle, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-3 xl:gap-6 h-full">
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
            <Tabs defaultValue="entry_point" className="h-full w-full">
              <CardHeader className="h-full flex flex-col items-start px-6">
                <TabsList className="flex mb-4" variant="default">
                  <TabsTrigger value="entry_point" className="text-lg">
                    Entry Point Diffs
                  </TabsTrigger>
                  <TabsTrigger value="named_keys" className="text-lg">
                    Named Key Diffs
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="text-lg">
                    AI Analysis
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="h-full">
                <TabsContent value="entry_point" className="h-full w-full">
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
                </TabsContent>
                <TabsContent value="named_keys" className="h-full w-full">
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
                </TabsContent>
                <TabsContent value="summary" className="h-full w-full">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Sparkle />
                      </EmptyMedia>
                      <EmptyTitle>
                        No analysis data to display.
                      </EmptyTitle>
                      <EmptyDescription>
                        Please select two versions and click Compare to see the differences.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
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
      </Card>
    </div>
  )
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
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          // value={activeTab}
          // onValueChange={(v) => setActiveTab(v as any)}
          className="flex-1 flex flex-col h-full"
        >
          <TabsList className="flex mb-4" variant="line">
            <TabsTrigger value="overview" className="text-lg">
              Overview
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-lg">
              Versions
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
                <CardContent className="h-full flex flex-col p-6">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ChartLine />
                      </EmptyMedia>
                      <EmptyTitle>
                        Overview content coming soon.
                      </EmptyTitle>
                      <EmptyDescription>
                        Detailed analytics and charts will be available here.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
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

          <TabsContent value="diffs" className="h-full w-full grid grid-cols-1">
            <DiffTab contractData={contractData} />
          </TabsContent>
        </Tabs>
      </div >
    </div >
  );
}
