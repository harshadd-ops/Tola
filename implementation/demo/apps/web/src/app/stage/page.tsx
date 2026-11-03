import type { Metadata } from "next";
import { Stage } from "@/features/story/Stage";

export const metadata: Metadata = { title: "Tola · One week at Shetty Jewellers" };

export default function StagePage() {
  return <Stage />;
}
