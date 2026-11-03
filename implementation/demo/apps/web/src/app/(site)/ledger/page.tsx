import type { Metadata } from "next";
import { LedgerPage } from "@/features/explore/ExplorePages";

export const metadata: Metadata = { title: "Tola · Rafiq's chain" };

export default function Page() {
  return <LedgerPage />;
}
