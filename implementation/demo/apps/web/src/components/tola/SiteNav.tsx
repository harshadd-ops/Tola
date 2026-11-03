"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "@gravity-ui/icons";
import { LinkButton } from "./LinkButton";
import { ThemeToggle } from "./ThemeToggle";
import { TolaWordmark } from "./TolaMark";

const LINKS = [
  { href: "/jeweller", label: "Jeweller" },
  { href: "/karigar", label: "Karigar" },
  { href: "/ledger", label: "Ledger" },
  { href: "/lender/passport/ps-rafiq-w42-demo0001a", label: "Lender view", match: "/lender" },
];

/** Translucent nav (DESIGN §9 layer 2): content scrolls underneath. No login, ever. */
export function SiteNav() {
  const path = usePathname();
  return (
    <header className="material-nav sticky top-0 z-40 border-b border-[var(--hairline)]">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-4 sm:px-6">
        <NextLink href="/" aria-label="Tola home">
          <TolaWordmark />
        </NextLink>
        <nav aria-label="Explore" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = path.startsWith(l.match ?? l.href);
            return (
              <NextLink
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  active ? "bg-[var(--bg-3)] font-medium text-[var(--ink)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                }`}
              >
                {l.label}
              </NextLink>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <LinkButton href="/stage" testId="nav-play">
            Play the week
            <ArrowRight />
          </LinkButton>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--hairline)]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-8 text-xs text-[var(--ink-3)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Prototype. UPI simulated. Lender view mocked. Not a verified weighing instrument. Synthetic data only.
        </p>
        <p>Tech4Bharat · GAVS 2026 · Theme 2 Jeweltech · PS 2.2</p>
      </div>
    </footer>
  );
}
