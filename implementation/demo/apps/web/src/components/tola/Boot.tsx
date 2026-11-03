"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/stores/session";

/** Applies the saved theme and persona once on the client. */
export function Boot() {
  const hydrate = useSessionStore((s) => s.hydrateFromStorage);
  useEffect(() => hydrate(), [hydrate]);
  return null;
}
