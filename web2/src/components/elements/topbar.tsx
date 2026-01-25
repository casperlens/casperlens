"use client";
import {
  ClickUI,
  ViewAccountOnExplorerMenuItem,
} from "@make-software/csprclick-ui";
import { SidebarTrigger } from "../ui/sidebar";

const topBarSettings = {
  accountMenuItems: [<ViewAccountOnExplorerMenuItem key="0" />],
};

export function Topbar() {
  return (
    <>
      <div className="md:hidden p-3 border-b border-primary w-full flex justify-between">
        <div>
          <SidebarTrigger size={"lg"} />
        </div>
        <div>
          <ClickUI topBarSettings={topBarSettings} />
        </div>
      </div>
    </>
  );
}
