"use client";

import dynamic from "next/dynamic";

const ContractContent = dynamic(
  () => import("@/components/elements/contract-content"),
  { ssr: false }
);

export default function Page() {
  return <ContractContent />;
}
