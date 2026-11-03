import type { Metadata } from "next";
import { LenderPage } from "@/features/explore/ExplorePages";

export const metadata: Metadata = { title: "Tola · Mocked lender view" };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <LenderPage token={token} />;
}
