"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { WalletProvider } from "./wallet-context";

const AuthHandler = dynamic(
  () => import("./auth-handler").then((mod) => mod.AuthHandler),
  { ssr: false },
);

const AppSidebar = dynamic(
  () => import("./sidebar").then((mod) => mod.AppSidebar),
  { ssr: false },
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <AuthHandler />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SidebarProvider>
          <AppSidebar />
          <Toaster />
          <main className="min-h-screen bg-background w-full">{children}</main>
        </SidebarProvider>
      </ThemeProvider>
    </WalletProvider>
  );
}
