"use client";

import dynamic from "next/dynamic";

const DashboardContent = dynamic(
  () => import("@/components/elements/dashboard-content"),
  { ssr: false },
);

export default function Page() {
  return <DashboardContent />;
}
