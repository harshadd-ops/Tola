"use client";

import React, { useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../../messages/en.json";
import bnMessages from "../../messages/bn.json";
import knMessages from "../../messages/kn.json";
import hiMessages from "../../messages/hi.json";
import { useSessionStore, type Locale } from "@/stores/session";

const MESSAGES_BY_LOCALE: Record<Locale, typeof enMessages> = {
  en: enMessages,
  bn: bnMessages,
  kn: knMessages,
  hi: hiMessages,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSessionStore((s) => s.locale);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={MESSAGES_BY_LOCALE[locale] ?? enMessages}
      timeZone="Asia/Kolkata"
    >
      {children}
    </NextIntlClientProvider>
  );
}
