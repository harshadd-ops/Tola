import { SiteFooter, SiteNav } from "@/components/tola/SiteNav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main id="main-content" className="relative">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
