"use client";

import { useState } from "react";
import { Button, Chip } from "@heroui/react";
import { Link as LinkIcon, Pause, Play } from "@gravity-ui/icons";
import { Gram } from "@/components/tola/Gram";
import { Ticks } from "@/components/tola/Ticks";
import { useStoryState } from "@/features/story/useStory";

const LABEL: Record<string, string> = {
  ISSUE: "Issue",
  RETURN: "Return",
  SCRAP_RETURN: "Scrap",
  DUST_CREDIT: "Dust",
  DISPUTE_OPEN: "Dispute",
  ADJUSTMENT: "Allowance",
  DISPUTE_RESOLVE: "Resolved",
  SETTLEMENT: "Settlement",
};

/** The real chain, scrolling (Vakyam .ticker), with a pause control and a reduced-motion wrap. */
export function LedgerTicker() {
  const { data } = useStoryState();
  const [paused, setPaused] = useState(false);
  const events = data?.events ?? [];
  if (!events.length) return null;
  const items = [...events, ...events];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip size="sm" color={data?.chain.valid ? "success" : "danger"} variant="soft">
          <LinkIcon width={12} height={12} />
          <Chip.Label>
            {data?.chain.valid ? "Chain verified" : "Chain broken"} · {data?.chain.length} events
          </Chip.Label>
        </Chip>
        <Button size="sm" variant="ghost" onPress={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? <Play /> : <Pause />}
          {paused ? "Play" : "Pause"}
        </Button>
      </div>
      <div className="ticker" data-paused={paused}>
        <ul className="ticker-track">
          {items.map((e, i) => (
            <li
              key={`${e.id}-${i}`}
              aria-hidden={i >= events.length}
              className="flex shrink-0 items-center gap-3 rounded-full border border-[var(--hairline-strong)] bg-[var(--card)] py-2 pr-3 pl-4"
            >
              <span className="font-mono text-xs font-medium text-[var(--ink)]">{e.id}</span>
              <span className="text-xs text-[var(--ink-3)]">
                {LABEL[e.type] ?? e.type} {e.order}
              </span>
              {e.weight_mg !== null && <Gram mg={e.weight_mg} size="sm" />}
              <Ticks count={(Number(e.jeweller_signed) + Number(e.karigar_signed)) as 0 | 1 | 2} showLabel={false} size={13} />
              <span className="font-mono text-[11px] text-[var(--ink-3)]">#{e.hash.slice(0, 6)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
