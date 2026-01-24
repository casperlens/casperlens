"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ContractData,
  ContractVersionData,
  ResponseData,
} from "@/lib/types";

function formatHash(hash: string | undefined, start = 8, end = 6) {
  if (!hash) return "";
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(hash.length - end)}`;
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
  const [activeTab, setActiveTab] = useState<"overview" | "versions" | "diffs">(
    "overview",
  );

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
      <div className="h-screen bg-app flex items-center justify-center p-6">
        <Card className="max-w-3xl w-full">
          <CardContent className="flex items-center gap-4 justify-center py-8">
            <Spinner />
            <div className="text-lg font-medium text-primary">
              Loading contract...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-screen bg-app p-6">
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

  const latest = contractData.versions?.[0] as ContractVersionData | undefined;

  return (
    <div className="h-screen bg-app text-primary p-8 lg:p-12">
      <div className="lg:col-span-3 flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Details</h2>
            <p className="text-sm text-muted-foreground">
              Explore versions and diffs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                navigator.clipboard?.writeText(contractData.package_hash)
              }
            >
              Copy Hash
            </Button>
            <Button variant="ghost" onClick={() => setActiveTab("diffs")}>
              Compare
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="flex-1 flex flex-col"
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

          <div className="flex-1 overflow-hidden">
            <TabsContent
              value="overview"
              className="h-full w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
            >
              <div className="lg:col-span-1 flex flex-col h-full gap-4 lg:gap-6">
                <Card className="flex flex-col h-full lg:h-auto">
                  <CardHeader>
                    <CardTitle>
                      <div className="text-lg font-semibold">
                        {contractData.contract_name || "Contract Package"}
                      </div>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Package metadata
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-4 text-sm text-muted-foreground">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Package Hash
                        </div>
                        <div className="font-mono break-words">
                          {formatHash(contractData.package_hash)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">
                          Owner
                        </div>
                        <div>{formatHash(contractData.owner_id)}</div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground">
                          Network
                        </div>
                        <Badge
                          variant={
                            contractData.network === "mainnet"
                              ? "default"
                              : "outline"
                          }
                        >
                          {contractData.network}
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground">
                          Status
                        </div>
                        <Badge
                          variant={
                            contractData.lock_status
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {contractData.lock_status ? "Locked" : "Unlocked"}
                        </Badge>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">Age</div>
                        <div>{contractData.age} days</div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">
                          Versions
                        </div>
                        <div>{contractData.versions?.length ?? 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {latest && (
                  <Card className="flex-1 lg:flex-auto">
                    <CardHeader>
                      <CardTitle>Latest Version</CardTitle>
                      <CardDescription>Most recent deployment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Version
                          </div>
                          <div className="font-semibold">
                            {latest.contract_version}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            Hash
                          </div>
                          <div className="font-mono break-words">
                            {latest.contract_hash}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            Protocol
                          </div>
                          <div>{latest.protocol_version}</div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            WASM
                          </div>
                          <div className="font-mono break-words">
                            {latest.contract_wasm_hash}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardContent className="h-full flex flex-col p-6">
                    {/* Graph gonna come here */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="versions" className="h-full">
              <ScrollArea className="h-full"></ScrollArea>
            </TabsContent>

            <TabsContent value="diffs" className="h-full">
              <ScrollArea className="h-full"></ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
