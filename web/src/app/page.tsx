"use client";

import dynamic from "next/dynamic";

const LandingContent = dynamic(
  () => import("@/components/elements/landing-content"),
  { ssr: false },
);

export default function Home() {
  return <LandingContent />;
}
