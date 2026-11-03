import type { Metadata } from "next";
import { JewellerDashboard } from "@/features/explore/JewellerDashboard";

export const metadata: Metadata = { title: "Tola · Suresh's console" };

export default function JewellerPage() {
  return <JewellerDashboard />;
}
