import type { Metadata } from "next";
import { KarigarMirror } from "@/features/explore/KarigarMirror";

export const metadata: Metadata = { title: "Tola · Rafiq's phone" };

export default function KarigarPage() {
  return <KarigarMirror />;
}
