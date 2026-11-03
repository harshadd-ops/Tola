"use client";

import NextLink from "next/link";
import { Avatar, Chip, Spinner, Table } from "@heroui/react";
import { ArrowRight, CircleCheckFill, Clock, TriangleExclamationFill } from "@gravity-ui/icons";
import { Gram } from "@/components/tola/Gram";
import { LinkButton } from "@/components/tola/LinkButton";
import { useStoryState } from "@/features/story/useStory";
import type { StoryOrder } from "@/lib/story";
import { formatGrams, formatInr } from "@/lib/units";

const STATUS: Record<string, { label: string; tone: "default" | "warning" | "danger" | "success" | "accent" }> = {
  ISSUED: { label: "Waiting for karigar's yes", tone: "warning" },
  IN_PROGRESS: { label: "With karigar", tone: "default" },
  RETURNED: { label: "Returned", tone: "accent" },
  FLAGGED: { label: "Over norm", tone: "danger" },
  DISPUTED: { label: "Open dispute", tone: "danger" },
  RECONCILED: { label: "Agreed", tone: "success" },
  SETTLED: { label: "Settled", tone: "success" },
  DRAFT: { label: "Draft", tone: "default" },
};

const KARIGAR_NAME: Record<string, string> = {
  "p-rafiq": "Rafiq Sheikh",
  "p-manju": "Manjunath Achar",
  "p-subrata": "Subrata Pal",
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: "default" as const };
  return (
    <Chip size="sm" variant="soft" color={s.tone}>
      {s.tone === "danger" ? <TriangleExclamationFill width={12} height={12} /> : s.tone === "success" ? <CircleCheckFill width={12} height={12} /> : s.tone === "warning" ? <Clock width={12} height={12} /> : null}
      <Chip.Label>{s.label}</Chip.Label>
    </Chip>
  );
}

const pct = (bp: number) => `${Math.floor(bp / 100)}.${String(bp % 100).padStart(2, "0")}%`;

/** /jeweller (F-13): Suresh's console. Fine-gold balance per karigar, this week's orders, the open flags. */
export function JewellerDashboard() {
  const { data: s } = useStoryState(true);
  if (!s) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  const flags = s.karigars.flatMap((k) => k.flagged);
  const orders = s.orders.filter((o) => o.code !== "#11");

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="t-label">Suresh Shetty · Shetty Jewellers, Avenue Road</p>
          <h1 className="t-section mt-2">Week 42 at the counter</h1>
          <p className="mt-2 text-sm text-[var(--ink-3)]">
            Live from the ledger. Story progress: {s.done.length} of 13 beats.
          </p>
        </div>
        <LinkButton href="/ledger" variant="secondary">
          Verify the chain
          <ArrowRight />
        </LinkButton>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {s.karigars.map((k) => (
          <div key={k.id} className={`rounded-[var(--r-lg)] border bg-[var(--card)] p-5 ${k.flagged.length ? "border-[var(--gold-line)]" : "border-[var(--hairline-strong)]"}`}>
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <Avatar.Fallback>{k.name.split(" ").map((w) => w[0]).join("")}</Avatar.Fallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--ink)]">{k.name}</p>
                <p className="text-xs text-[var(--ink-3)]">{k.orders_this_week} {k.orders_this_week === 1 ? "order" : "orders"} on the ledger</p>
              </div>
            </div>
            <p className="mt-5 text-xs text-[var(--ink-3)]">Gold with him on open orders</p>
            <Gram mg={k.open_mg} size="lg" fine={916} />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {k.open_orders.map((c) => (
                <Chip key={c} size="sm" variant="secondary">
                  <Chip.Label>{c}</Chip.Label>
                </Chip>
              ))}
              {k.carried_mg > 0 && (
                <Chip size="sm" variant="soft" color="warning">
                  <Chip.Label>+ {formatGrams(k.carried_mg)} carried</Chip.Label>
                </Chip>
              )}
              {k.flagged.length > 0 && (
                <Chip size="sm" variant="soft" color="danger">
                  <Chip.Label>Flag on {k.flagged.join(", ")}</Chip.Label>
                </Chip>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-end justify-between gap-3">
        <h2 className="t-card">Orders</h2>
        <span className="text-xs text-[var(--ink-3)]">{flags.length ? `${flags.length} flagged` : "No open flags"}</span>
      </div>
      <Table className="mt-3">
        <Table.ScrollContainer>
          <Table.Content aria-label="Orders this week">
            <Table.Header>
              <Table.Column isRowHeader>Order</Table.Column>
              <Table.Column>Karigar</Table.Column>
              <Table.Column>Issued</Table.Column>
              <Table.Column>Returned</Table.Column>
              <Table.Column>Norm</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>
                <span className="sr-only">Open</span>
              </Table.Column>
            </Table.Header>
            <Table.Body>
              {orders.map((o: StoryOrder) => (
                <Table.Row key={o.id} id={o.id}>
                  <Table.Cell>
                    <p className="font-semibold text-[var(--ink)]">{o.code}</p>
                    <p className="text-xs text-[var(--ink-3)]">{o.title}</p>
                  </Table.Cell>
                  <Table.Cell>{KARIGAR_NAME[o.karigar_id] ?? o.karigar_id}</Table.Cell>
                  <Table.Cell>
                    <Gram mg={o.issued_mg} size="sm" />
                  </Table.Cell>
                  <Table.Cell>
                    {o.returned_total_mg !== null ? <Gram mg={o.returned_total_mg} size="sm" /> : <span className="text-xs text-[var(--ink-3)]">Due {o.due_date.slice(8)} Oct</span>}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-mono text-xs">{pct(o.norm_bp)}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusChip status={o.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <NextLink href={`/orders/${o.code.slice(1)}`} className="text-sm font-medium text-[var(--link)] hover:underline">
                      Open
                    </NextLink>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {s.settlement && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[var(--r-lg)] border border-[var(--hairline-strong)] bg-[var(--card)] p-5">
          <div>
            <p className="t-label">Week 42 settlement · Rafiq</p>
            <p className="mt-1 text-sm text-[var(--ink-2)]">
              Payable {formatInr(s.settlement.summary.payable_paise)} · {s.settlement.sealed ? "both approved" : "waiting for approvals"}
            </p>
          </div>
          <LinkButton href={`/settlements/${s.settlement.id}`} variant="secondary">
            Open statement
            <ArrowRight />
          </LinkButton>
        </div>
      )}
    </div>
  );
}
