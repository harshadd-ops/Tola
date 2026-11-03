import React from "react";

export function Section({
  title,
  eyebrow,
  rightSlot,
  children,
  className = "",
}: {
  title?: string;
  eyebrow?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-8 ${className}`}>
      {(title || eyebrow || rightSlot) && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            {eyebrow && (
              <p
                style={{
                  color: "var(--ink-3)",
                  letterSpacing: "var(--track-label)",
                }}
                className="text-xs font-semibold uppercase"
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                }}
                className="mt-1 text-2xl font-normal tracking-tight sm:text-3xl"
              >
                {title}
              </h1>
            )}
          </div>
          {rightSlot && <div>{rightSlot}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
