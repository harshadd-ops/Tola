import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const SUPPORTED_LOCALES = ["en", "bn", "kn", "hi"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(val: string | undefined): val is SupportedLocale {
  return Boolean(val && (SUPPORTED_LOCALES as readonly string[]).includes(val));
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get("tola-locale")?.value;
  const locale: SupportedLocale = isSupportedLocale(raw) ? raw : "en";

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return {
    locale,
    messages,
  };
});
