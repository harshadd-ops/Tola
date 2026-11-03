import type { Metadata } from "next";
import { SettlementPage } from "@/features/explore/ExplorePages";

export const metadata: Metadata = { title: "Tola · Settlement" };

export default function Page() {
  return <SettlementPage />;
}
