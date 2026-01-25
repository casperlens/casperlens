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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ContractData,
  ResponseData
} from "@/lib/types";
import { ChartLine, Copy, Diff, GitBranch, Link, Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWallet } from "./wallet-context";

const formatHash = (hash: string | undefined, start = 5, end = 5) => {
  if (!hash) return "";
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(hash.length - end)}`;
}

const hasVersions = (data: ContractData) => {
  return data.versions && data.versions.length > 0;
}

export default function ContractContent() {
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "versions" | "diffs">(
    "overview",
  );
  
  const { activeAccount } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = activeAccount;
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
  }, [activeAccount]);

  if (loading) {
    return (
      <div className="h-screen bg-app flex items-center justify-center gap-6 text-xl">
        <Spinner className="text-xl xl:text-2xl" />
        <div className="text-xl xl:text-2xl font-medium text-primary">
          Loading contract...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-app p-6">
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
    <div className="h-screen bg-app text-primary p-8 lg:p-12">
      <div className="lg:col-span-3 flex flex-col gap-4 h-full">
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
                    <CardTitle className="text-2xl font-bold">
                      Package metadata
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-3 text-muted-foreground">
                      <div className="flex flex-col gap-2 xl:flex-row justify-between xl:items-center">
                        <p className="text-lg text-muted-foreground font-semibold">
                          Owner
                        </p>
                        <div className="flex items-center gap-3 xl:text-lg text-muted-foreground">
                          <p>
                            {formatHash(contractData.owner_id)}
                          </p>
                          <Button variant="ghost"
                            onClick={() => {
                              navigator.clipboard?.writeText(contractData.owner_id)
                              toast.success("Owner ID copied to clipboard", {
                                position: "top-right",
                              })
                            }}
                          >
                            <Copy className="text-muted-foreground" />
                          </Button>
                        </div>
                      </div>

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

                      <div className="flex flex-col gap-2 xl:flex-row justify-between xl:items-center">
                        <p className="text-lg text-muted-foreground font-semibold">
                          Age
                        </p>
                        <p className="xl:text-lg">
                          {contractData.age} days
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 xl:flex-row justify-between xl:items-center">
                        <p className="text-lg text-muted-foreground font-semibold">
                          Versions
                        </p>
                        <p className="xl:text-lg">
                          {contractData.versions?.length ?? 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                      Versions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    <ScrollArea className="max-h-full">
                      <Accordion type="single" defaultValue="0" collapsible className="w-full space-y-2">
                        {hasVersions(contractData) ? contractData.versions.map((v, i) => (
                          <AccordionItem key={i} value={i.toString()} className="space-y-2 text-sm">
                            <AccordionTrigger className="text-lg font-medium">
                              <div className="flex gap-3">
                                <span>
                                  Version
                                </span>
                                <span>
                                  {v.contract_version}
                                </span>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent>
                              <div className="flex flex-col gap-2 xl:flex-row justify-between xl:items-center">
                                <p className="text-muted-foreground font-semibold">
                                  Hash
                                </p>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                  <p>
                                    {formatHash(contractData.owner_id)}
                                  </p>
                                  <Button variant="ghost"
                                    onClick={() => {
                                      navigator.clipboard?.writeText(v.contract_wasm_hash)
                                      toast.success("Contract WASH Hash copied to clipboard", {
                                        position: "top-right",
                                      })
                                    }}
                                  >
                                    <Copy className="text-muted-foreground" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="text-muted-foreground font-semibold">
                                  Protocol Version
                                </div>
                                <div>
                                  {v.protocol_version}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
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
                      </Accordion>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardContent className="h-full flex flex-col p-6">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia>
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

            <TabsContent value="versions" className="h-full">
              <ScrollArea className="h-full">
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia>
                      <GitBranch />
                    </EmptyMedia>
                    <EmptyTitle>
                      Versions content coming soon.
                    </EmptyTitle>
                    <EmptyDescription>
                      Detailed version history will be available here.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="diffs" className="h-full">
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia>
                    <Diff />
                  </EmptyMedia>
                  <EmptyTitle>
                    Diffs content coming soon.
                  </EmptyTitle>
                  <EmptyDescription>
                    Code diffs between versions will be available here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div >
  );
}