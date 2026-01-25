"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "./wallet-context";

export function AppSidebar() {
  const router = useRouter();
  const { activeAccount, disconnect } = useWallet();

  const displayName = "Session User";
  const initials = "SU";

  return (
    <Sidebar>
      <SidebarHeader className="p-5">
        <div className="text-xl font-bold">CasperLens</div>
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Dashboard"
                className="text-lg"
                onClick={() => {
                  router.push("/dashboard");
                }}
              >
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {activeAccount ? (
          <div className="flex flex-col gap-2">
            <div className="bg-card text-card-foreground flex items-center gap-3 rounded-lg border p-2 shadow-sm">
              <div className="bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase">
                {initials}
              </div>
              <div className="flex min-w-0 flex-col grow">
                <span className="text-sm font-medium leading-tight">
                  {displayName}
                </span>
                <span
                  className="text-xs text-muted-foreground leading-tight truncate max-w-40"
                  title={activeAccount}
                >
                  {activeAccount}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={disconnect}
                title="End Session"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2 text-center text-sm text-muted-foreground border rounded-lg bg-muted/20">
            No Session
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
