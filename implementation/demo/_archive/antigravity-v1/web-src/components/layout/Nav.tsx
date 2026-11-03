"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { TolaMark } from "@/components/brand/TolaMark";
import { PersonaBar } from "./PersonaBar";
import {
  resolvePersonaFromQuery,
  useSessionStore,
} from "@/stores/session";

function QueryPersonaSync() {
  const searchParams = useSearchParams();
  const setPersona = useSessionStore((s) => s.setPersona);
  const asParam = searchParams?.get("as");

  useEffect(() => {
    if (asParam) {
      setPersona(resolvePersonaFromQuery(asParam));
    }
  }, [asParam, setPersona]);

  return null;
}

export function Nav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const hydrate = useSessionStore((s) => s.hydrateFromStorage);
  const locale = useSessionStore((s) => s.locale);
  const cycleLocale = useSessionStore((s) => s.cycleLocale);
  const theme = useSessionStore((s) => s.theme);
  const toggleTheme = useSessionStore((s) => s.toggleTheme);
  const [hydrated, setHydrated] = React.useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  const links = [
    { href: "/", label: t("overview") },
    { href: "/stage", label: t("stage") },
    { href: "/jeweller", label: t("jeweller") },
    { href: "/karigar", label: t("karigar") },
    { href: "/ledger", label: t("ledger") },
  ];

  const isLanding = pathname === "/";

  return (
    <header
      data-testid="top-nav"
      data-hydrated={hydrated ? "true" : "false"}
      style={{
        background: "var(--nav)",
        borderBottomColor: "var(--hairline)",
      }}
      className="material-nav sticky top-0 z-40 border-b"
    >
      <Suspense fallback={null}>
        <QueryPersonaSync />
      </Suspense>
      <div className="mx-auto flex max-w-[1520px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2.5 font-semibold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            <span
              style={{
                background: "var(--gold-tint)",
                borderColor: "var(--gold-line)",
                color: "var(--ink)",
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border"
            >
              <TolaMark size={18} />
            </span>
            <span
              style={{ fontFamily: "var(--font-display)" }}
              className="text-xl font-semibold tracking-tight"
              data-testid="nav-brand-title"
            >
              {t("brand")}
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            style={{
              background: "var(--surface-sunken)",
              borderColor: "var(--hairline-strong)",
            }}
            className="hidden md:inline-flex items-center gap-0.5 rounded-full border p-1"
          >
            {links.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: active ? "var(--ink)" : "var(--ink-2)",
                    background: active ? "var(--surface)" : "transparent",
                    boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}
                  className="inline-flex min-h-[36px] items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isLanding ? (
            <Link
              href="/stage"
              style={{
                background: "var(--accent)",
                color: "var(--accent-foreground)",
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-xs transition-transform active:scale-97"
            >
              <span>{t("openLiveStage")}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <PersonaBar />
          )}

          <button
            type="button"
            data-testid="nav-locale-btn"
            onClick={() => cycleLocale()}
            aria-label={`Switch UI language (current: ${locale.toUpperCase()})`}
            style={{
              background: "var(--surface)",
              borderColor: "var(--hairline-strong)",
              color: "var(--ink)",
              fontFamily: "var(--font-mono)",
            }}
            className="inline-flex min-h-[44px] items-center rounded-full border px-3 text-xs font-semibold uppercase"
          >
            {locale}
          </button>

          <button
            type="button"
            data-testid="nav-theme-btn"
            onClick={() => toggleTheme()}
            aria-label={`Toggle colour theme (current: ${theme})`}
            style={{
              background: "var(--surface)",
              borderColor: "var(--hairline-strong)",
              color: "var(--ink)",
            }}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-3 text-xs font-medium"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </header>
  );
}

