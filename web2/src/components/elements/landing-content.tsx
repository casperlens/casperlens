"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "./wallet-context";
import React from "react";

export default function LandingContent() {
  const { connect, activeAccount } = useWallet();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            CasperLens
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced contract monitoring and observability for the Casper
            Network. Track, analyze, and manage your smart contracts with ease.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="p-6 border rounded-xl bg-card/50 space-y-4 w-full max-w-sm">
            <h3 className="font-semibold text-lg">Get Started</h3>
            <p className="text-sm text-muted-foreground">
              Create a temporary session to access the dashboard.
            </p>
            <Button size="lg" className="w-full" onClick={() => connect()}>
              Start Session
            </Button>

            {activeAccount && (
              <div className="text-[10px] text-muted-foreground/50 font-mono">
                User ID: {activeAccount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
