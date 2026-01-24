"use client";

import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const router = useRouter();
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
          <SidebarGroupLabel className="text-md my-3">
            Contracts
          </SidebarGroupLabel>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="bg-card text-card-foreground flex items-center gap-3 rounded-lg border p-2 shadow-sm">
          <div className="bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase">
            UN
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium leading-tight">User Name</span>
            <span className="text-xs text-muted-foreground leading-tight truncate max-w-40">
              user-id-1234567890abcdef
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
