"use client";

import { Chip, Spinner } from "@heroui/react";
import { ArrowLeft, CircleDashed } from "@gravity-ui/icons";
import { Gram } from "@/components/tola/Gram";
import { HashChip } from "@/components/tola/Chips";
import { LinkButton } from "@/components/tola/LinkButton";
import { Ticks } from "@/components/tola/Ticks";
import { GstScene, LedgerScene, LenderScene } from "@/features/console/ProofScenes";
import { SettleScene } from "@/features/console/SettleScene";
import { useStoryState } from "@/features/story/useStory";

function Shell({ children, back = "/jeweller" }: { children: React.ReactNode; back?: string }) {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
      <LinkButton href={back} variant="ghost" size="sm" className="-ml-3 mb-4">
        <ArrowLeft />
        Back
      </LinkButton>
      {children}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-80 items-center justify-center">
      <Spinner />
    </div>
  );
}

function NotYet({ what, step }: { what: string; step: string }) {
  return (
    <div className="rounded-[var(--r-lg)] border border-dashed border-[var(--hairline-strong)] p-8">
      <p className="t-card">{what}</p>
      <p className="mt-2 text-sm text-[var(--ink-3)]">It happens at {step} in the story. Play the week up to there, or jump straight to it.</p>
      <LinkButton href={`/stage?step=${step}`} className="mt-4">
        Go to {step}
      </LinkButton>
    </div>
  );
}

/** /ledger: Rafiq's chain, verifiable here at any point in the week (F-03). */
export function LedgerPage() {
  const { data } = useStoryState();
  return <Shell>{data ? <LedgerScene standalone /> : <Loading />}</Shell>;
}

/** /lender/passport/[token]: Meera's mocked view. 404 before the share, 410 once revoked (EC-8). */
export function LenderPage({ token }: { token: string }) {
  const { data } = useStoryState(true);
  if (!data) return <Shell back="/">{<Loading />}</Shell>;
  const p = data.passport;
  if (!p || p.token !== token) {
    return (
      <Shell back="/">
        <NotYet what="Rafiq has not shared this passport yet." step="S10" />
      </Shell>
    );
  }
  if (p.revoked) {
    return (
      <Shell back="/">
        <div className="rounded-[var(--r-lg)] border border-dashed border-[var(--hairline-strong)] p-8" data-testid="lender-revoked">
          <p className="t-label">Mocked lender view · 410</p>
          <p className="t-section mt-2">Revoked by the karigar.</p>
          <p className="mt-2 text-sm text-[var(--ink-3)]">
            Rafiq took his Work Passport back from his phone. This link no longer opens, and nothing was kept here.
          </p>
        </div>
      </Shell>
    );
  }
  return (
    <Shell back="/">
      <LenderScene standalone />
    </Shell>
  );
}

/** /settlements/[id]: the statement, the approvals, the UPI intent and the GST draft (F-07, F-09). */
export function SettlementPage() {
  const { data } = useStoryState(true);
  if (!data) return <Shell>{<Loading />}</Shell>;
  if (!data.settlement) {
    return (
      <Shell>
        <NotYet what="The week-42 statement has not been drafted yet." step="S08" />
      </Shell>
    );
  }
  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <SettleScene />
        <GstScene standalone />
      </div>
    </Shell>
  );
}

const TYPE: Record<string, string> = {
  ISSUE: "Issued",
  RETURN: "Returned",
  SCRAP_RETURN: "Scrap returned",
  DUST_CREDIT: "Dust credit",
  DISPUTE_OPEN: "Dispute opened",
  ADJUSTMENT: "Rework allowance",
  DISPUTE_RESOLVE: "Dispute resolved",
  SETTLEMENT: "Settled",
};

/** /orders/[code]: one order's facts and its signed events, nothing overwritten (F-06, F-10 light). */
export function OrderPage({ code }: { code: string }) {
  const { data } = useStoryState(true);
  if (!data) return <Shell>{<Loading />}</Shell>;
  const tag = `#${code.replace(/^#/, "").padStart(2, "0")}`;
  const order = data.orders.find((o) => o.code === tag);
  if (!order) {
    return (
      <Shell>
        <p className="t-section">No order {tag} in this story.</p>
      </Shell>
    );
  }
  const events = data.events.filter((e) => e.order === tag);
  return (
    <Shell>
      <p className="t-label">Order {order.code} · {order.title}</p>
      <h1 className="t-section mt-2">{order.title}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ["Issued", order.issued_mg],
          ["Returned", order.returned_total_mg],
          ["Agreed wastage", order.allowed_mg],
          ["Loss", order.loss_mg],
        ].map(([label, mg]) => (
          <div key={label as string} className="rounded-[var(--r-md)] border border-[var(--hairline-strong)] bg-[var(--card)] p-4">
            <p className="text-xs text-[var(--ink-3)]">{label}</p>
            {mg === null ? <p className="mt-1 text-sm text-[var(--ink-3)]">Not yet</p> : <Gram mg={mg as number} size="md" />}
          </div>
        ))}
      </div>
      <h2 className="t-card mt-10">Signed events</h2>
      {events.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-[var(--ink-3)]">
          <CircleDashed width={14} height={14} />
          {order.code === "#14" ? "Nothing signed yet in this story." : "This order's events live on its karigar's own chain."}
        </p>
      ) : (
        <ol className="mt-3 flex flex-col rounded-[var(--r-lg)] border border-[var(--hairline-strong)] bg-[var(--card)] px-5">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] py-3 last:border-0">
              <span className="flex items-center gap-3">
                <span className="w-10 font-mono text-sm font-medium">{e.id}</span>
                <span className="text-sm">{TYPE[e.type] ?? e.type}</span>
              </span>
              <span className="flex items-center gap-3">
                {e.weight_mg !== null && <Gram mg={e.weight_mg} size="sm" />}
                <Ticks count={(Number(e.jeweller_signed) + Number(e.karigar_signed)) as 0 | 1 | 2} />
                <HashChip hash={e.hash} />
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        <Chip size="sm" variant="secondary">
          <Chip.Label>Status: {order.status.toLowerCase().replace("_", " ")}</Chip.Label>
        </Chip>
        <Chip size="sm" variant="secondary">
          <Chip.Label>
            {order.fineness} declared · norm {order.norm_bp / 100}%
          </Chip.Label>
        </Chip>
      </div>
    </Shell>
  );
}
