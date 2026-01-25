"use client";
import {
  CONTENT_MODE,
  type CsprClickInitOptions,
} from "@make-software/csprclick-core-types";
import dynamic from "next/dynamic";

// Load CSPR.click ONLY on this page
const CSPRWrapper = dynamic(
  () =>
    import("@make-software/csprclick-ui").then((mod) => ({
      default: ({ children }: { children: React.ReactNode }) => {
        const clickOptions: CsprClickInitOptions = {
          appName: "Casper dApp",
          appId: "csprclick-template",
          contentMode: CONTENT_MODE.IFRAME,
          providers: ["casper-wallet"],
        };
        return (
          <mod.ClickProvider options={clickOptions}>
            {children}
          </mod.ClickProvider>
        );
      },
    })),
  { ssr: false, loading: (children) => <>{children}</> },
);

export default CSPRWrapper;
