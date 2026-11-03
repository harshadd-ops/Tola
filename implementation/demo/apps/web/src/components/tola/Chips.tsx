"use client";

import { Chip, Tooltip } from "@heroui/react";
import { CircleDashed, Link } from "@gravity-ui/icons";

/** Dashed "Simulated" chip: every mocked surface carries one (DEMO_SPEC SC-7, DESIGN §4.2). */
export function SimChip({ children = "Simulated", testId }: { children?: React.ReactNode; testId?: string }) {
  return (
    <Chip size="sm" variant="tertiary" className="chip--sim" data-testid={testId}>
      <CircleDashed width={12} height={12} />
      <Chip.Label>{children}</Chip.Label>
    </Chip>
  );
}

/** Short hash with the full value on hover (DESIGN §13 HashChip). */
export function HashChip({ hash, label }: { hash: string; label?: string }) {
  const short = `#${hash.slice(0, 4)}…${hash.slice(-3)}`;
  return (
    <Tooltip delay={200}>
      <Tooltip.Trigger>
        <Chip size="sm" variant="secondary" className="font-mono">
          <Link width={12} height={12} />
          <Chip.Label>{label ? `${label} ${short}` : short}</Chip.Label>
        </Chip>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <span className="font-mono text-xs break-all">{hash}</span>
      </Tooltip.Content>
    </Tooltip>
  );
}

/** "cached" / "template" pill for AI and voice surfaces served from the seed (DEMO_SPEC §7). */
export function SourcePill({ source }: { source: "cached" | "live" | "template" }) {
  return (
    <Chip size="sm" variant="tertiary" className="chip--sim font-mono">
      <Chip.Label>{source}</Chip.Label>
    </Chip>
  );
}
