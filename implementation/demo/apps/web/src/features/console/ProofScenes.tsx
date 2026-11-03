"use client";

import { useState } from "react";
import { Button, Chip, Meter, Separator } from "@heroui/react";
import {
  ArrowUpRightFromSquare,
  CircleCheckFill,
  CircleXmarkFill,
  FileText,
  Link as LinkIcon,
  LinkSlash,
  ShieldCheck,
} from "@gravity-ui/icons";
import { BrowserFrame } from "@/components/tola/Devices";
import { Gram } from "@/components/tola/Gram";
import { HashChip, SimChip } from "@/components/tola/Chips";
import { Ticks } from "@/components/tola/Ticks";
import { verifyEventSignature, verifyLedgerChain } from "@/lib/crypto";
import { storyApi, type PassportSummary } from "@/lib/story";
import { formatGrams } from "@/lib/units";
import { RevealAnchor, Scene, useBeat } from "./Scene";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-10-15T16:10:00+05:30" → "15 Oct 16:10" (IST as stored; no timezone maths in the browser). */
const shortDate = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(11, 16)}`;

const TYPE_LABEL: Record<string, string> = {
  ISSUE: "Issue",
  RETURN: "Return",
  SCRAP_RETURN: "Scrap return",
  DUST_CREDIT: "Dust credit",
  DISPUTE_OPEN: "Dispute opened",
  ADJUSTMENT: "Rework allowance",
  DISPUTE_RESOLVE: "Dispute resolved",
  SETTLEMENT: "Settlement",
};

/** The passport figures, as raw numbers. No score and no approve/decline wording (R-06). */
export function PassportFigures({ s }: { s: PassportSummary }) {
  const used = Math.round(s.allowance_used_bps / 100);
  return (
    <div className="grid gap-3 sm:grid-cols-2" data-testid="passport-figures">
      <div className="rounded-2xl bg-[var(--bg-2)] p-4">
        <p className="text-xs text-[var(--ink-3)]">Gold handled, 180 days</p>
        <Gram mg={s.grams_handled_mg} size="lg" />
        <p className="mt-1 text-xs text-[var(--ink-3)]">{s.orders} orders · {formatGrams(s.grams_handled_fine_mg)} fine</p>
      </div>
      <div className="rounded-2xl bg-[var(--bg-2)] p-4">
        <p className="text-xs text-[var(--ink-3)]">Returned on time</p>
        <p className="t-metric text-[1.75rem]">{s.on_time} of {s.returned}</p>
        <p className="mt-1 text-xs text-[var(--ink-3)]">{s.on_time_pct_str}</p>
      </div>
      <div className="rounded-2xl bg-[var(--bg-2)] p-4">
        <p className="text-xs text-[var(--ink-3)]">Wastage against agreed norms</p>
        <p className="t-metric text-[1.75rem]">{s.allowance_used_pct_str}</p>
        <Meter value={used} aria-label={`${s.allowance_used_pct_str} of the agreed wastage used`} color="success" size="sm" className="mt-2">
          <Meter.Track>
            <Meter.Fill />
          </Meter.Track>
        </Meter>
        <p className="mt-1.5 text-xs text-[var(--ink-3)]">
          {formatGrams(s.actual_wastage_mg - s.approved_adjustment_mg)} of {formatGrams(s.allowed_wastage_mg)} agreed ·{" "}
          {formatGrams(s.approved_adjustment_mg)} agreed rework not counted
        </p>
      </div>
      <div className="rounded-2xl bg-[var(--bg-2)] p-4">
        <p className="text-xs text-[var(--ink-3)]">Disputes</p>
        <p className="t-metric text-[1.75rem]">{s.disputes_resolved} of {s.disputes_opened} resolved</p>
        <p className="mt-1 text-xs text-[var(--ink-3)]">
          in {s.dispute_resolution_minutes} min · {s.jewellers_on_tola} of {s.jewellers_total_declared} jewellers on Tola
        </p>
      </div>
    </div>
  );
}

/** S10 on the console: what Rafiq is sharing, and with whom. The action happens on his phone. */
export function PassportScene() {
  const { state } = useBeat();
  const p = state?.passport;
  return (
    <Scene
      eyebrow="Sun 18 Oct · Work Passport · Rafiq's own record"
      title="A credit file the karigar owns"
      aside={
        p ? (
          <Chip color="success" variant="soft">
            <CircleCheckFill width={14} height={14} />
            <Chip.Label>Shared with {p.recipient} · 7 days</Chip.Label>
          </Chip>
        ) : (
          <Chip variant="secondary">
            <Chip.Label>Rafiq decides who sees it</Chip.Label>
          </Chip>
        )
      }
      testId="scene-passport"
    >
      <p className="mb-4 max-w-2xl text-sm text-[var(--ink-2)]">
        Computed from Rafiq&apos;s signed chain: every issue, return and dispute from the last 180 days. No score, just the
        record. He shares it from his phone, picks who sees it and for how long, and can take it back.
      </p>
      {state && <PassportFigures s={p?.summary ?? state.passport_preview} />}
    </Scene>
  );
}

/** S11: Meera's mocked lender view, opened from Rafiq's link. Signed by Tola's server key; she can verify it. */
export function LenderScene({ standalone = false }: { standalone?: boolean }) {
  const { state, cue, perform, pending } = useBeat(standalone);
  const p = state?.passport;
  const [verified, setVerified] = useState<boolean | null>(null);

  const verify = async () => {
    if (!p) return;
    const r = await storyApi.passport(p.token);
    const ok = verifyEventSignature(r.verification.server_pubkey_hex, r.verification.summary_hash, r.verification.server_sig_hex);
    setVerified(ok);
    if (ok && !standalone) await perform("S11");
  };

  return (
    <Scene
      eyebrow="Sun 18 Oct · Meera Rao, credit officer"
      title="What the lender sees"
      aside={<SimChip testId="lender-mocked">Mocked lender view</SimChip>}
      testId="scene-lender"
    >
      {!p ? (
        <p className="text-sm text-[var(--ink-3)]">Rafiq has not shared his passport yet.</p>
      ) : (
        <BrowserFrame url={`verify.sahyadri-credit.demo/passport/${p.token}`}>
          <div className="p-6">
            <div className="rounded-xl bg-[var(--bg-2)] px-4 py-2.5 text-sm text-[var(--ink-2)]">
              Mocked lender view. Tola does not score or lend.
            </div>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="t-label">{p.recipient_org ?? "Sahyadri Co-operative Credit Society (fictional)"}</p>
                <p className="mt-1 text-xl font-semibold text-[var(--ink)]">
                  Rafiq Sheikh <span lang="bn" className="font-normal text-[var(--ink-3)]">· রফিক শেখ</span>
                </p>
                <p className="text-sm text-[var(--ink-3)]">
                  Shared by the karigar · window {p.summary.window.replace("/", " to ")} · expires 25 Oct
                </p>
              </div>
              {verified === null ? (
                <Button onPress={() => void verify()} isDisabled={pending} className={cue("S11") ? "cue" : ""} data-testid="verify-passport">
                  <ShieldCheck />
                  Verify signature
                </Button>
              ) : verified ? (
                <Chip color="success" variant="soft" data-testid="passport-verified">
                  <CircleCheckFill width={14} height={14} />
                  <Chip.Label>Signature valid · checked in this browser</Chip.Label>
                </Chip>
              ) : (
                <Chip color="danger" variant="soft">
                  <CircleXmarkFill width={14} height={14} />
                  <Chip.Label>Signature does not match</Chip.Label>
                </Chip>
              )}
            </div>
            <Separator className="my-5" />
            <PassportFigures s={p.summary} />
            <p className="mt-4 text-xs text-[var(--ink-3)]">
              Raw figures from a dual-signed ledger, signed with Tola&apos;s server key (Ed25519). Seeded history before 12 Oct.
            </p>
          </div>
        </BrowserFrame>
      )}
    </Scene>
  );
}

/** S12: the GST job-work draft for the CA (F-09). Draft only, never filed. */
export function GstScene({ standalone = false }: { standalone?: boolean }) {
  const { state, cue, perform, pending } = useBeat(standalone);
  const [open, setOpen] = useState(false);
  const id = state?.settlement?.id;
  return (
    <Scene
      eyebrow="Sun 18 Oct · For the CA"
      title="GST job-work draft"
      aside={<SimChip>Draft, not filed</SimChip>}
      testId="scene-gst"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm text-[var(--ink-2)]">
          Page 1: the Rule 55 delivery challan for the 40.000 g issue and the 38.620 g return. Page 2: Rafiq&apos;s labour
          invoice, taxable ₹4,800 and GST 5% ₹240. Both carry the watermark “DRAFT, for your CA. Not filed.” HSN and SAC
          codes are marked for the CA to confirm.
        </p>
        {id && !open && (
          <Button
            size="lg"
            isDisabled={pending}
            onPress={() => {
              setOpen(true);
              if (!standalone) void perform("S12");
            }}
            className={cue("S12") ? "cue" : ""}
            data-testid="open-gst"
          >
            <FileText />
            Open the draft
          </Button>
        )}
        {id && open && (
          <Button variant="secondary" onPress={() => window.open(storyApi.gstPdfUrl(id), "_blank", "noopener")}>
            <ArrowUpRightFromSquare />
            Open in a new tab
          </Button>
        )}
      </div>
      {id && open && (
        <iframe
          title="GST job-work draft PDF"
          src={storyApi.gstPdfUrl(id)}
          className="mt-5 h-[58vh] w-full rounded-[20px] border border-[var(--hairline-strong)] bg-white"
          data-testid="gst-pdf"
        />
      )}
    </Scene>
  );
}

type ChainResult = { valid: boolean; serverChecked: number; sigs: number; brokenAt: string | null };

/** S13: verify Rafiq's chain on the server (SHA-256 recomputed) and in the browser (Ed25519), then tamper in a sandbox. */
export function LedgerScene({ standalone = false }: { standalone?: boolean }) {
  const { state, cue, perform, pending } = useBeat(standalone);
  const [result, setResult] = useState<ChainResult | null>(null);
  const [tampered, setTampered] = useState(false);
  const events = state?.events ?? [];

  const run = async (tamper: boolean) => {
    const r = await storyApi.ledger(tamper ? "R6" : undefined);
    const client = verifyLedgerChain(
      r.events.map((e) => ({ ...e, karigar_id: e.karigar_id })),
    );
    const sigs = r.events.reduce((n, e) => n + (e.jeweller_sig ? 1 : 0) + (e.karigar_sig ? 1 : 0), 0);
    setTampered(tamper);
    setResult({
      valid: r.chain.valid && client.valid,
      serverChecked: r.chain.checked,
      sigs,
      brokenAt: r.chain.broken_at ?? client.brokenAtId,
    });
    if (!tamper && !standalone) await perform("S13");
  };

  return (
    <Scene
      eyebrow="Rafiq's chain with Shetty Jewellers"
      title="Every line, signed twice, chained"
      aside={
        result ? (
          result.valid ? (
            <Chip color="success" variant="soft" data-testid="chain-valid">
              <LinkIcon width={14} height={14} />
              <Chip.Label>Chain valid · {events.length} lines this week · {result.serverChecked} in all</Chip.Label>
            </Chip>
          ) : (
            <Chip color="danger" variant="soft" data-testid="chain-broken">
              <LinkSlash width={14} height={14} />
              <Chip.Label>Broken at {result.brokenAt}</Chip.Label>
            </Chip>
          )
        ) : null
      }
      testId="scene-ledger"
    >
      <ol className="flex flex-col" data-testid="chain-list">
        {events.map((e, i) => {
          const broken = result && !result.valid && tampered && e.id === result.brokenAt;
          const after = result && !result.valid && tampered && events.findIndex((x) => x.id === result.brokenAt) < i;
          return (
            <li
              key={e.id}
              className={`grid grid-cols-[3.25rem_1fr_auto] items-center gap-3 border-b border-[var(--hairline)] py-2.5 last:border-0 ${
                broken ? "rounded-xl bg-[var(--chain-broken-bg)] px-2" : ""
              } ${after ? "opacity-45" : ""}`}
            >
              <span className="font-mono text-sm font-medium text-[var(--ink)]">{e.id}</span>
              <span className="min-w-0">
                <span className="text-sm text-[var(--ink)]">{TYPE_LABEL[e.type] ?? e.type}</span>
                <span className="ml-2 text-xs text-[var(--ink-3)]">
                  {e.order ?? ""} · {shortDate(e.timestamp)}
                </span>
                {broken && <span className="ml-2 text-xs font-medium text-[var(--chain-broken)]">one byte changed here</span>}
              </span>
              <span className="flex items-center gap-3">
                {e.weight_mg !== null && <Gram mg={e.weight_mg} size="sm" />}
                <Ticks count={(Number(e.jeweller_signed) + Number(e.karigar_signed)) as 0 | 1 | 2} showLabel={false} size={14} />
                <span className="hidden lg:inline">
                  <HashChip hash={e.hash} />
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button size="lg" onPress={() => void run(false)} isDisabled={pending} className={cue("S13") ? "cue" : ""} data-testid="verify-chain">
          <ShieldCheck />
          Verify the chain
        </Button>
        <Button size="lg" variant="danger-soft" onPress={() => void run(true)} isDisabled={!result} data-testid="tamper">
          Tamper: change one byte of R6
        </Button>
        <SimChip>Sandbox copy, the real ledger is untouched</SimChip>
      </div>
      {result && (
        <p className="mt-3 text-xs text-[var(--ink-3)]" data-testid="chain-detail">
          Server recomputed SHA-256 over {result.serverChecked} events (including seeded history). This browser checked{" "}
          {result.sigs} Ed25519 signatures and every prev-hash link.
          {!result.valid && " The changed event no longer matches its hash, so everything after it is untrusted."}
        </p>
      )}
      <RevealAnchor when={result ? `${result.valid}-${tampered}` : "none"} />
    </Scene>
  );
}
