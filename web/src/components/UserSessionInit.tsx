"use client";

import { useEffect } from "react";

export function UserSessionInit() {
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      const newUserId = crypto.randomUUID();
      localStorage.setItem("user_id", newUserId);
    }
  }, []);

  return null;
}
