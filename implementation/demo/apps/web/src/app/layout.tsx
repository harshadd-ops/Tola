import type { Metadata, Viewport } from "next";
import "@/styles/fonts";
import "@/styles/index.css";
import { Boot } from "@/components/tola/Boot";
import { MotionProvider } from "@/motion/MotionProvider";
import { QueryProvider } from "@/motion/QueryProvider";

export const metadata: Metadata = {
  title: "Tola · Two signatures on every gram",
  description:
    "A gold job-work ledger the jeweller and the karigar both sign. Weighed by the scale, heard in his language, signed by both.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-[var(--bg)] text-[var(--ink)] antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <QueryProvider>
          <MotionProvider>
            <Boot />
            {children}
          </MotionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
