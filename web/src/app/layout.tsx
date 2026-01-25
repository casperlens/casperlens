import { ClientProviders } from "@/components/elements/client-providers";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const font = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "CasperLens",
  description: "Advanced contract monitoring for Casper Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.variable} antialiased`}>
        <div id="app">
          <div id="csprclick-ui"></div>
        </div>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
