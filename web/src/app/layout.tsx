import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casperlens",
  description: "Visualize your Casper Network data effortlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
