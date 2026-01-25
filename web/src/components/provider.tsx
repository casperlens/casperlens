"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";
import { useEffect } from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      const newUserId = crypto.randomUUID();
      localStorage.setItem("user_id", newUserId);
    }
  }, []);
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
