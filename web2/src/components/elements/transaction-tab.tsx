"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/lib/types";
import { getUserId } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

const formatHash = (hash: string, start = 6, end = 6) => {
  if (!hash) return "";
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(hash.length - end)}`;
};

const formatAmount = (amount: string) => {
  try {
    const val = parseInt(amount);
    if (isNaN(val)) return amount;
    return (
      (val / 1_000_000_000).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 5,
      }) + " CSPR"
    );
  } catch {
    return amount;
  }
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
};

export function TransactionsTab({ packageHash }: { packageHash: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = getUserId();
        if (!userId) throw new Error("User not authenticated");

        const res = await fetch(
          `/api/v1/u/${userId}/contract-package/${packageHash}/transactions`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch transactions (${res.status})`);
        }

        const json = await res.json();
        if (json.success && json.data) {
          setTransactions(json.data);
        } else {
          throw new Error(json.error || "Failed to load transactions");
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (packageHash) {
      fetchTransactions();
    }
  }, [packageHash]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="animate-spin" />
        Loading transactions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-destructive gap-2">
        <AlertCircle />
        {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
        <Clock className="w-10 h-10 opacity-20" />
        <p>No transactions found for this contract package.</p>
      </div>
    );
  }

  return (
    <Card className="h-full border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <span>Transaction History</span>
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {transactions.length} found
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 h-full">
        <ScrollArea className="h-[600px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.deploy_hash}>
                  <TableCell>
                    {tx.status?.toLowerCase() === "executed" ||
                    tx.status?.toLowerCase() === "processed" ||
                    !tx.error_message ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Success
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <span title={tx.deploy_hash}>
                      {formatHash(tx.deploy_hash)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {tx.entry_point_id ? (
                      <Badge variant="secondary" className="font-mono text-xs">
                        ID: {tx.entry_point_id}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">
                        Unknown
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <span title={tx.caller_public_key}>
                      {formatHash(tx.caller_public_key)}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatAmount(tx.cost)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(tx.timestamp)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          navigator.clipboard?.writeText(tx.deploy_hash);
                          toast.success("Hash copied", {
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
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
