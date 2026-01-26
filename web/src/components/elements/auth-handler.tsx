"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useWallet } from "./wallet-context";

export function AuthHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeAccount, isLoading } = useWallet();

  useEffect(() => {
    if (isLoading) return;

    if (activeAccount) {
      if (pathname === "/") {
        router.push("/dashboard");
      }
    } else {
      if (
        pathname?.startsWith("/dashboard") ||
        pathname?.startsWith("/contract")
      ) {
        router.push("/");
      }
    }
  }, [activeAccount, isLoading, router, pathname]);

  return null;
}
