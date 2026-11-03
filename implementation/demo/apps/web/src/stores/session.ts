import { create } from "zustand";

export type PersonaId =
  | "p-suresh"
  | "p-lakshmi"
  | "p-rafiq"
  | "p-manju"
  | "p-subrata"
  | "p-meera";

export type Locale = "en" | "bn" | "kn" | "hi";
export type ThemeMode = "light" | "dark" | "system";
export type PersonaRole = "jeweller" | "jeweller_staff" | "karigar" | "lender";

export interface PersonaDef {
  id: PersonaId;
  shortSlug: string;
  personaCode: string;
  name: string;
  role: PersonaRole;
  title: string;
  lang: Locale;
  uiLang: Locale;
  avatar: string;
  chipLabel: string;
  homeRoute: string;
}

export const PERSONAS: readonly PersonaDef[] = [
  {
    id: "p-suresh",
    shortSlug: "suresh",
    personaCode: "P-01",
    name: "Suresh Shetty",
    role: "jeweller",
    title: "Owner, Shetty Jewellers",
    lang: "kn",
    uiLang: "en",
    avatar: "SS",
    chipLabel: "Jeweller · Suresh",
    homeRoute: "/jeweller",
  },
  {
    id: "p-lakshmi",
    shortSlug: "lakshmi",
    personaCode: "P-03",
    name: "Lakshmi",
    role: "jeweller_staff",
    title: "Counter and accounts",
    lang: "kn",
    uiLang: "kn",
    avatar: "L",
    chipLabel: "Counter · Lakshmi",
    homeRoute: "/jeweller/returns",
  },
  {
    id: "p-rafiq",
    shortSlug: "rafiq",
    personaCode: "P-02",
    name: "Rafiq Sheikh",
    role: "karigar",
    title: "Karigar (studded and plain work)",
    lang: "bn",
    uiLang: "bn",
    avatar: "RS",
    chipLabel: "Karigar · Rafiq",
    homeRoute: "/karigar",
  },
  {
    id: "p-manju",
    shortSlug: "manju",
    personaCode: "P-02",
    name: "Manjunath Achar",
    role: "karigar",
    title: "Karigar (chains, kada)",
    lang: "kn",
    uiLang: "kn",
    avatar: "MA",
    chipLabel: "Karigar · Manjunath",
    homeRoute: "/karigar",
  },
  {
    id: "p-subrata",
    shortSlug: "subrata",
    personaCode: "P-05",
    name: "Subrata Pal",
    role: "karigar",
    title: "Head karigar, antique work",
    lang: "bn",
    uiLang: "bn",
    avatar: "SP",
    chipLabel: "Karigar · Subrata",
    homeRoute: "/karigar",
  },
  {
    id: "p-meera",
    shortSlug: "meera",
    personaCode: "P-04",
    name: "Meera Rao",
    role: "lender",
    title: "Credit officer, Sahyadri Co-op (fictional)",
    lang: "en",
    uiLang: "en",
    avatar: "MR",
    chipLabel: "Lender · Meera",
    homeRoute: "/lender/passport/demo-token",
  },
] as const;

const LOCALE_ORDER: readonly Locale[] = ["en", "bn", "kn", "hi"];

export function getPersonaDef(id: PersonaId): PersonaDef {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]!;
}

export function resolvePersonaFromQuery(raw: string | null | undefined): PersonaId {
  if (!raw) return "p-suresh";
  const cleaned = raw.trim().toLowerCase();
  const byId = PERSONAS.find((p) => p.id === cleaned || p.shortSlug === cleaned);
  return byId ? byId.id : "p-suresh";
}

function writeCookieLocale(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.cookie = `tola-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.lang = locale;
}

function applyThemeToDom(theme: ThemeMode): void {
  if (typeof document === "undefined") return;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", Boolean(isDark));
}

export interface SessionState {
  persona: PersonaId;
  personaId: PersonaId;
  localePinned: Locale | null;
  locale: Locale;
  theme: ThemeMode;
  latestPassportToken: string | null;
  latestRunId: string | null;
  latestSettlementId: string | null;
  setPersona: (persona: PersonaId) => void;
  cyclePersona: () => PersonaId;
  setLocalePinned: (locale: Locale | null) => void;
  cycleLocale: () => Locale;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => ThemeMode;
  setLatestPassportToken: (token: string | null) => void;
  setLatestRunId: (id: string | null) => void;
  setLatestSettlementId: (id: string | null) => void;
  hydrateFromStorage: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  persona: "p-suresh",
  personaId: "p-suresh",
  localePinned: null,
  locale: "en",
  theme: "light",
  latestPassportToken: null,
  latestRunId: null,
  latestSettlementId: null,

  setPersona: (persona) => {
    const def = getPersonaDef(persona);
    const pinned = get().localePinned;
    const nextLocale = pinned ?? def.uiLang;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("tola-demo-persona", persona);
      } catch {
        // Ignore storage error
      }
    }
    writeCookieLocale(nextLocale);
    set({ persona, personaId: persona, locale: nextLocale });
  },

  cyclePersona: () => {
    const current = get().persona;
    const idx = PERSONAS.findIndex((p) => p.id === current);
    const next = PERSONAS[(idx + 1) % PERSONAS.length] ?? PERSONAS[0]!;
    get().setPersona(next.id);
    return next.id;
  },

  setLocalePinned: (localePinned) => {
    const def = getPersonaDef(get().persona);
    const nextLocale = localePinned ?? def.uiLang;
    writeCookieLocale(nextLocale);
    set({ localePinned, locale: nextLocale });
  },

  cycleLocale: () => {
    const current = get().locale;
    const idx = LOCALE_ORDER.indexOf(current);
    const next = LOCALE_ORDER[(idx + 1) % LOCALE_ORDER.length] ?? "en";
    writeCookieLocale(next);
    set({ localePinned: next, locale: next });
    return next;
  },

  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("tola-theme", theme);
      } catch {
        // Ignore
      }
    }
    applyThemeToDom(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next: ThemeMode = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
    return next;
  },

  setLatestPassportToken: (latestPassportToken) => set({ latestPassportToken }),
  setLatestRunId: (latestRunId) => set({ latestRunId }),
  setLatestSettlementId: (latestSettlementId) => set({ latestSettlementId }),

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const storedPersona = window.localStorage.getItem("tola-demo-persona");
      const storedTheme = window.localStorage.getItem("tola-theme") as ThemeMode | null;
      const persona = storedPersona ? resolvePersonaFromQuery(storedPersona) : get().persona;
      const theme: ThemeMode =
        storedTheme === "dark" || storedTheme === "light" || storedTheme === "system"
          ? storedTheme
          : "light";
      const def = getPersonaDef(persona);
      const nextLocale = get().localePinned ?? def.uiLang;
      applyThemeToDom(theme);
      writeCookieLocale(nextLocale);
      set({ persona, theme, locale: nextLocale });
    } catch {
      // Ignore storage failure
    }
  },
}));
