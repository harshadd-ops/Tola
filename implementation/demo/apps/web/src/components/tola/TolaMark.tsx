/** The Tola mark: a balance beam whose two pans are two ticks (DESIGN §2.3). */
export function TolaMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3.5v3" />
      <path d="M3.5 7h17" />
      <path d="M6 7l-2.2 5.5M6 7l2.2 5.5M18 7l-2.2 5.5M18 7l2.2 5.5" opacity={0.55} />
      <path d="M3.2 15.2l1.6 1.6 2.9-3.3" />
      <path d="M15.8 15.2l1.6 1.6 2.9-3.3" />
      <path d="M9 20.5h6" />
    </svg>
  );
}

export function TolaWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-[var(--ink)]">
      <TolaMark size={22} />
      <span
        className="text-[1.375rem] leading-none font-semibold"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
      >
        Tola
      </span>
      {!compact && (
        <span className="hidden text-xs text-[var(--ink-3)] sm:inline" lang="hi">
          तोला · <span lang="bn">তোলা</span>
        </span>
      )}
    </span>
  );
}
