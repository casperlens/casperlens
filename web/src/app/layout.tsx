import { Provider } from "jotai";
import type { Metadata } from "next";
import { UserSessionInit } from "@/components/UserSessionInit";
import "./globals.css";

export const metadata: Metadata = {
  title: "CasperLens - Blockchain Observability Platform",
  description:
    "Comprehensive observability platform for tracking and monitoring smart contracts on the Casper blockchain network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-black text-white antialiased root">
        <UserSessionInit />
        <Provider>
          {/* Global app container */}
          <div className="min-h-screen">{children}</div>
        </Provider>
      </body>
    </html>
  );
}
