"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface WalletContextType {
  activeAccount: string | null;
  connect: () => void;
  disconnect: () => void;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

// Helper to generate a random ID
function generateUserId() {
  return uuidv4();
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const connect = () => {
    // In this model, "connect" just ensures a session ID exists
    let userId = localStorage.getItem("user_id");
    if (!userId) {
      userId = generateUserId();
      localStorage.setItem("user_id", userId);
      toast.success("New session created");
    } else {
      toast.success("Session restored");
    }
    setActiveAccount(userId);
  };

  const disconnect = () => {
    // Optional: Clear the session
    localStorage.removeItem("user_id");
    setActiveAccount(null);
    toast.info("Session cleared");
  };

  useEffect(() => {
    // Check for existing session on load
    const userId = localStorage.getItem("user_id");
    if (userId) {
      setActiveAccount(userId);
    }
    setIsLoading(false);
  }, []);

  return (
    <WalletContext.Provider value={{ activeAccount, connect, disconnect, isLoading }}>
      {children}
    </WalletContext.Provider>
  );
}