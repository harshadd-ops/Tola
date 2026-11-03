"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  PERSONAS,
  useSessionStore,
  type PersonaDef,
  type PersonaRole,
} from "@/stores/session";
import { SimLabel } from "@/components/ui/SimLabel";

function RoleGlyph({ role }: { role: PersonaRole }) {
  if (role === "jeweller" || role === "jeweller_staff") {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 2v10M3 5h10M3 5 1.5 9h3L3 5ZM13 5l-1.5 4h3L13 5ZM5.5 13.5h5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (role === "karigar") {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m9.5 3.5 3 3-1.5 1.5-3-3 1.5-1.5ZM8.5 6.5 3 12l1 1 5.5-5.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 6.5 8 3l5.5 3.5M4 6.5v5M8 6.5v5M12 6.5v5M2.5 13h11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PersonaBar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const persona = useSessionStore((s) => s.persona);
  const setPersona = useSessionStore((s) => s.setPersona);
  const latestPassportToken = useSessionStore((s) => s.latestPassportToken);

  const handleSelect = (def: PersonaDef) => {
    setPersona(def.id);
    if (pathname?.startsWith("/stage")) {
      const targetId =
        def.role === "karigar"
          ? "stage-phone-pane"
          : "stage-console-pane";
      const el = document.getElementById(targetId);
      el?.focus();
      return;
    }
    if (def.role === "lender") {
      const token = latestPassportToken ?? "demo-token";
      router.push(`/lender/passport/${token}?as=${def.shortSlug}`);
      return;
    }
    router.push(`${def.homeRoute}?as=${def.shortSlug}`);
  };

  return (
    <div
      role="group"
      aria-label="Persona switcher"
      className={`flex flex-wrap items-center gap-1 ${className}`}
    >
      {PERSONAS.map((def, idx) => {
        const active = persona === def.id;
        const prev = idx > 0 ? PERSONAS[idx - 1] : null;
        const showDivider =
          prev &&
          ((prev.role === "jeweller_staff" && def.role === "karigar") ||
            (prev.role === "karigar" && def.role === "lender"));

        return (
          <React.Fragment key={def.id}>
            {showDivider && (
              <span
                aria-hidden="true"
                style={{ background: "var(--hairline-strong)" }}
                className="mx-0.5 hidden h-4 w-px sm:inline-block"
              />
            )}
            <button
              type="button"
              onClick={() => handleSelect(def)}
              aria-pressed={active}
              title={`${def.name} — ${def.title}`}
              style={{
                background: active
                  ? "var(--surface)"
                  : "transparent",
                borderColor: active
                  ? "var(--focus)"
                  : "var(--hairline-strong)",
                color: active ? "var(--ink)" : "var(--ink-2)",
                boxShadow: active
                  ? "0 0 0 1.5px var(--focus), 0 1px 2px rgba(0,0,0,0.04)"
                  : "none",
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all active:scale-97"
            >
              <span
                style={{
                  background: active ? "var(--accent)" : "var(--surface-sunken)",
                  color: active ? "var(--accent-foreground)" : "var(--ink-2)",
                }}
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              >
                {def.avatar}
              </span>
              <RoleGlyph role={def.role} />
              <span className="font-medium">{def.name.split(" ")[0]}</span>
            </button>
          </React.Fragment>
        );
      })}
      <SimLabel
        label="Demo keys"
        className="ml-0.5 hidden xl:inline-flex"
        tooltip="In the demo, each persona's key is derived from a public string. In production, keys live on the person's own phone."
      />
    </div>
  );
}

