"use client";
import { SidebarTrigger } from "../ui/sidebar";

export function Topbar() {
  return (
    <>
      <div className="md:hidden p-3 border-b border-primary w-full flex justify-between">
        <div>
          <SidebarTrigger size={"lg"} />
        </div>
        <div>{/* Custom account menu can go here */}</div>
      </div>
    </>
  );
}
