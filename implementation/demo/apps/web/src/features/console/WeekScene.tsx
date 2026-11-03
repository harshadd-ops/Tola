"use client";

import { Button, Chip, Meter, Table } from "@heroui/react";
import { CircleCheckFill, Clock, Flag, Microphone, Play, TriangleExclamationFill } from "@gravity-ui/icons";
import { m } from "motion/react";
import { AgentNote } from "@/components/tola/AgentNote";
import { Gram } from "@/components/tola/Gram";
import { Ticks } from "@/components/tola/Ticks";
import { spring } from "@/lib/springs";
import type { ReconcileRowData } from "@/lib/story";
import { formatGrams } from "@/lib/units";
import { useStageLocal } from "@/stores/stage";
import { RevealAnchor, Scene, useBeat } from "./Scene";

const KARIGAR: Record<string, string> = {
  "p-rafiq": "Rafiq Sheikh",
  "p-manju": "Manjunath Achar",
  "p-subrata": "Subrata Pal",
};

const pct = (bp: number) => `${Math.floor(bp / 100)}.${String(bp % 100).padStart(2, "0")}%`;

function VarianceRow({ row, disputed, resolved }: { row: ReconcileRowData; disputed: boolean; resolved: boolean }) {
  const used = Math.round((row.loss_mg * 100) / row.allowed_mg);
  return (
    <div className="flex flex-col gap-1.5">
      <Meter
        value={Math.min(used, 100)}
        aria-label={`Wastage used for ${row.order}: ${used}% of the agreed norm`}
        color={row.flag ? "danger" : "success"}
        size="sm"
      >
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
      <span className="font-mono text-[11px] text-[var(--ink-3)]">
        {formatGrams(row.loss_mg)} of {formatGrams(row.allowed_mg)} ({used}%)
        {resolved ? " · resolved" : disputed ? " · disputed" : ""}
      </span>
    </div>
  );
}

/** Saturday: S05 run the week (F-05), S06 Rafiq disputes (F-06), S07 resolve with two signatures. */
export function WeekScene() {
  const { state, cue, perform, pending } = useBeat();
  const local = useStageLocal();
  const run = state?.reconcile;
  const dispute = state?.dispute;
  const resolved = dispute?.status === "RESOLVED";

  return (
    <Scene
      eyebrow="Sat 17 Oct · Weekly check · Week 42"
      title="Run the week, before month end"
      aside={
        !run ? (
          <Button
            size="lg"
            onPress={() => void perform("S05")}
            isDisabled={pending}
            className={cue("S05") ? "cue" : ""}
            data-testid="run-week"
          >
            <Play />
            Run the week
          </Button>
        ) : (
          <Chip variant="soft" color={resolved ? "success" : "danger"}>
            {resolved ? <CircleCheckFill width={14} height={14} /> : <TriangleExclamationFill width={14} height={14} />}
            <Chip.Label>{resolved ? "All lines agreed" : "1 of 3 orders flagged"}</Chip.Label>
          </Chip>
        )
      }
      testId="scene-week"
    >
      {!run ? (
        <div className="rounded-[20px] border border-dashed border-[var(--hairline-strong)] p-6 text-sm text-[var(--ink-3)]">
          Three orders came back this week: #12 (Manjunath), #13 (Subrata) and #14 (Rafiq). ledger-core checks each against
          its agreed wastage in integer milligrams; the agent only explains the result.
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Week 42 reconciliation" data-testid="variance-table">
                <Table.Header>
                  <Table.Column isRowHeader>Order</Table.Column>
                  <Table.Column>Issued</Table.Column>
                  <Table.Column>Returned</Table.Column>
                  <Table.Column>Wastage vs norm</Table.Column>
                  <Table.Column>Over norm</Table.Column>
                </Table.Header>
                <Table.Body>
                  {run.rows.map((row) => (
                    <Table.Row key={row.order} id={row.order}>
                      <Table.Cell>
                        <p className="font-semibold text-[var(--ink)]">{row.order}</p>
                        <p className="text-xs text-[var(--ink-3)]">
                          {KARIGAR[row.karigar_id] ?? row.karigar_id} · norm {pct(row.norm_bp)}
                        </p>
                      </Table.Cell>
                      <Table.Cell>
                        <Gram mg={row.issued_mg} size="sm" />
                      </Table.Cell>
                      <Table.Cell>
                        <Gram mg={row.returned_mg} size="sm" />
                      </Table.Cell>
                      <Table.Cell className="min-w-[180px]">
                        <VarianceRow row={row} disputed={row.flag && !!dispute} resolved={row.flag && resolved} />
                      </Table.Cell>
                      <Table.Cell>
                        {row.flag ? (
                          <m.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={spring.default}
                            className="inline-flex flex-col"
                          >
                            <span className="inline-flex items-center gap-1 text-[var(--variance-flag)]">
                              <TriangleExclamationFill width={14} height={14} />
                              <Gram mg={row.variance_mg} signed size="sm" tone="flag" strike={resolved} />
                            </span>
                            <span className="font-mono text-[11px] text-[var(--ink-3)]">
                              {resolved && dispute?.resolved_mg != null
                                ? `${formatGrams(dispute.resolved_mg)} carried after ${formatGrams(dispute.allowance_mg ?? 0)} rework`
                                : `≈ ₹${row.variance_inr.toLocaleString("en-IN")} at today's rate`}
                            </span>
                          </m.span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[var(--variance-ok)]">
                            <CircleCheckFill width={14} height={14} />
                            <span className="text-xs">Within norm</span>
                          </span>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>

          <AgentNote agent="Reconcile" source={run.cached ? "cached" : "live"}>
            {run.explanation}
          </AgentNote>

          {renderDispute()}
          <RevealAnchor when={`${!!dispute}-${local.proposalSent}-${resolved}`} />
        </div>
      )}
    </Scene>
  );

  function renderDispute() {
    if (!dispute) {
      return (
        <div className="flex items-center gap-3 rounded-[20px] border border-dashed border-[var(--hairline-strong)] p-5 text-sm text-[var(--ink-3)]">
          <Flag width={16} height={16} />
          The flag has gone to Rafiq&apos;s phone in Bengali. He can agree, or reply by voice.
        </div>
      );
    }
    const voice = dispute.messages.find((msg) => msg.kind === "voice");
    const proposed = resolved || local.proposalSent;
    return (
      <div className="rounded-[20px] border border-[var(--hairline-strong)] p-5" data-testid="dispute-thread">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="t-label flex items-center gap-2">
            <Flag width={14} height={14} /> Dispute on order #14
          </p>
          <Chip size="sm" variant={resolved ? "soft" : "tertiary"} color={resolved ? "success" : "danger"} className={resolved ? "" : "border border-[var(--danger)]"}>
            <Chip.Label>{resolved ? "Resolved · stays on record" : "Open"}</Chip.Label>
          </Chip>
        </div>

        {voice && (
          <div className="mt-4 rounded-2xl bg-[var(--bg-2)] p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-[var(--ink-3)]">
              <Microphone width={12} height={12} /> Rafiq · Sat 18:20 · voice, Bengali
            </p>
            <p lang="bn" className="mt-1.5 leading-relaxed text-[var(--ink)]">
              {voice.transcript}
            </p>
            <p className="mt-1 text-sm text-[var(--ink-3)]">{voice.text}</p>
          </div>
        )}

        {!proposed ? (
          <div className="mt-4">
            <p className="mb-2 text-sm text-[var(--ink-2)]">Suresh replies with a proposal. Rafiq hears it read back before he agrees.</p>
            <div className="flex flex-wrap gap-2">
              <Button
                onPress={() => local.set({ proposalSent: true })}
                className={cue("S07") ? "cue" : ""}
                data-testid="propose-130"
              >
                Accept 0.130 g as rework
              </Button>
              {["Accept all 0.380 g", "Ask for the scrap again"].map((label) => (
                <Button key={label} variant="outline" isDisabled>
                  {label}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--ink-3)]">The other replies are shown for context; this story takes the first.</p>
          </div>
        ) : !resolved ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-[var(--ink-2)]" data-testid="proposal-waiting">
            <Clock width={14} height={14} />
            Proposal sent: accept 0.130 g as rework wastage. Waiting for Rafiq&apos;s হ্যাঁ on his phone.
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-[var(--bg-2)] p-4" data-testid="dispute-resolution">
            <p className="text-xs font-medium text-[var(--ink-3)]">Suresh · Sat 19:05 · agreed by both</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-[var(--ink-3)]">Disputed</p>
                <Gram mg={dispute.disputed_mg} signed tone="flag" strike />
              </div>
              <div>
                <p className="text-xs text-[var(--ink-3)]">Rework allowance</p>
                <Gram mg={dispute.allowance_mg ?? 0} />
              </div>
              <div data-testid="carried-shortfall">
                <p className="text-xs text-[var(--ink-3)]">Stays on Rafiq&apos;s account</p>
                <Gram mg={dispute.resolved_mg ?? 0} fine={916} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Ticks count={2} />
              <span className="text-xs text-[var(--ink-3)]">ADJUSTMENT R9 and DISPUTE_RESOLVE R10. The disputed line is kept, never overwritten.</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
