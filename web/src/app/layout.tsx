import { Provider } from "jotai";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CasperLens - Blockchain Observability Platform",
  description: "Comprehensive observability platform for tracking and monitoring smart contracts on the Casper blockchain network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-black text-white antialiased root">
        <Provider>
          <main className="p-5">
            {children}
          </main>
        </Provider>
      </body>
    </html>
  );
}
