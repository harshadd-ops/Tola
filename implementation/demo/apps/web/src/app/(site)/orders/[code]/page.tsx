import type { Metadata } from "next";
import { OrderPage } from "@/features/explore/ExplorePages";

export const metadata: Metadata = { title: "Tola · Order" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <OrderPage code={code} />;
}
