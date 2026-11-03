import { CircleDashed } from "@gravity-ui/icons";

/**
 * Rafiq's phone on stage (DESIGN §14.2): 390 × 844 logical, scaled to fit the stage height.
 * The screen is a real component tree, not a picture. Labelled "Simulated phone" (DEMO_SPEC §7).
 */
export function PhoneFrame({
  time,
  children,
  caption = "Simulated phone",
  height = "min(780px, max(540px, calc(100dvh - 180px)))",
}: {
  time: string;
  children: React.ReactNode;
  caption?: string;
  height?: string;
}) {
  return (
    <figure className="m-0 flex flex-col items-center gap-3">
      <div
        className="relative rounded-[48px] bg-[#111114] p-[10px] shadow-[var(--shadow-device)]"
        style={{ height, aspectRatio: "390 / 844" }}
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[38px] bg-[var(--bg)]">
          <div className="flex h-11 shrink-0 items-center justify-between px-[8%] pt-1 text-[13px] font-semibold text-[var(--ink)]">
            <span className="font-mono">{time}</span>
            <span className="absolute top-2.5 left-1/2 h-[24px] w-[27%] -translate-x-1/2 rounded-full bg-[#111114]" />
            <span className="flex items-center gap-1 font-mono text-[11px] text-[var(--ink-2)]">
              4G
              <span className="ml-0.5 inline-flex items-end gap-[2px]" aria-hidden="true">
                {[4, 6, 8, 10].map((h) => (
                  <span key={h} className="w-[3px] rounded-[1px] bg-current" style={{ height: h }} />
                ))}
              </span>
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          <div className="flex h-6 shrink-0 items-center justify-center">
            <span className="h-[5px] w-32 rounded-full bg-[var(--ink)] opacity-80" />
          </div>
        </div>
      </div>
      <figcaption className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-[var(--ink-3)] uppercase">
        <CircleDashed width={12} height={12} />
        {caption}
      </figcaption>
    </figure>
  );
}

/** A plain browser chrome for the mocked lender page (DEMO_SPEC S11). */
export function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[var(--r-lg)] border border-[var(--hairline-strong)] bg-[var(--card)]">
      <div className="flex items-center gap-3 border-b border-[var(--hairline)] bg-[var(--bg-2)] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-[var(--hairline-strong)]" />
          ))}
        </span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-[var(--card)] px-3 py-1 font-mono text-xs text-[var(--ink-3)]">
          {url}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}
