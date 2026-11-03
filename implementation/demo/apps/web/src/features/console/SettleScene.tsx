"use client";

import { Avatar, Button, Chip } from "@heroui/react";
import { CircleCheckFill, Clock, Pencil, QrCode } from "@gravity-ui/icons";
import { QRCodeSVG } from "qrcode.react";
import { AgentNote } from "@/components/tola/AgentNote";
import { Gram } from "@/components/tola/Gram";
import { HashChip, SimChip } from "@/components/tola/Chips";
import { Ticks } from "@/components/tola/Ticks";
import { eventById } from "@/lib/story";
import { formatInr } from "@/lib/units";
import { Line, RevealAnchor, Scene, useBeat } from "./Scene";

function Approver({ initials, name, approved }: { initials: string; name: string; approved: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar size="sm">
        <Avatar.Fallback>{initials}</Avatar.Fallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">{name}</p>
        <p className={`flex items-center gap-1 text-xs ${approved ? "text-[var(--indigo-700)]" : "text-[var(--ink-3)]"}`}>
          {approved ? <CircleCheckFill width={12} height={12} /> : <Clock width={12} height={12} />}
          {approved ? "Approved" : "Not yet"}
        </p>
      </div>
    </div>
  );
}

/** Sunday: S08 one statement, two approvals (F-07); S09 UPI intent, simulated. Gold is settled in grams. */
export function SettleScene() {
  const { state, cue, perform, pending } = useBeat();
  const stl = state?.settlement;
  const pay = state?.payment;
  const sum = stl?.summary;
  const r11 = eventById(state, "R11");
  const sigs = ((stl ? Number(stl.jeweller_approved) + Number(stl.karigar_approved) : 0) as 0 | 1 | 2);

  if (!stl || !sum) {
    return (
      <Scene eyebrow="Sun 18 Oct · Settlement" title="Week 42 statement for Rafiq" testId="scene-settle">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-dashed border-[var(--hairline-strong)] p-6">
          <p className="max-w-md text-sm text-[var(--ink-3)]">
            The Settle agent drafts one statement from the signed lines. Both sides see the same numbers before anyone approves.
          </p>
          <Button size="lg" onPress={() => void perform("S08")} isDisabled={pending} className={cue("S08") ? "cue" : ""} data-testid="draft-settlement">
            Draft the statement
          </Button>
        </div>
      </Scene>
    );
  }

  return (
    <Scene
      eyebrow="Sun 18 Oct · Settlement"
      title="Week 42 statement for Rafiq"
      aside={<Ticks count={sigs} waitingFor={sigs === 1 ? (stl.jeweller_approved ? "Rafiq" : "Suresh") : undefined} />}
      testId="scene-settle"
    >
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <div className="rounded-[20px] border border-[var(--hairline-strong)] p-5" data-testid="statement">
          <p className="t-label">Gold, in grams</p>
          <Line label="With Rafiq before this week" hint="Order #09, open, due 24 Oct">
            <Gram mg={sum.opening_gold_with_karigar_mg} size="sm" />
          </Line>
          <Line label="Issued, order #14">
            <Gram mg={sum.issued_mg} size="sm" />
          </Line>
          <Line label="Returned: piece + scrap">
            <Gram mg={-(sum.returned_net_gold_mg + sum.scrap_mg)} signed size="sm" />
          </Line>
          <Line label="Agreed wastage (2.50%)">
            <Gram mg={-sum.allowed_wastage_mg} signed size="sm" />
          </Line>
          <Line label="Rework allowance, agreed Saturday">
            <Gram mg={-sum.approved_adjustment_mg} signed size="sm" />
          </Line>
          <Line
            label="Carried on Rafiq's account"
            hint="Settled in grams. Never netted against rupees."
            testId="settlement-carried"
          >
            <Gram mg={sum.carried_shortfall_mg} fine={916} />
          </Line>
          <Line label="Gold with Rafiq now" strong>
            <Gram mg={sum.closing_gold_with_karigar_mg} />
          </Line>

          <p className="t-label mt-5">Labour, in rupees</p>
          <Line label="Labour, order #14">
            <span className="t-metric text-sm">{formatInr(sum.labour_paise)}</span>
          </Line>
          <Line label="GST 5% on job work" hint="Rafiq is GST-registered in this story">
            <span className="t-metric text-sm">{formatInr(sum.gst_paise)}</span>
          </Line>
          <Line label="Payable to Rafiq" strong testId="settlement-payable">
            <span className="t-metric text-[1.75rem]">{formatInr(sum.payable_paise)}</span>
          </Line>
        </div>

        <div className="flex flex-col gap-4">
          <AgentNote agent="Settle">{stl.narrative}</AgentNote>

          <div className="rounded-[20px] bg-[var(--bg-2)] p-5">
            <p className="t-label">Approvals</p>
            <div className="mt-3 flex flex-wrap justify-between gap-4">
              <Approver initials="SS" name="Suresh Shetty" approved={stl.jeweller_approved} />
              <Approver initials="RS" name="Rafiq Sheikh" approved={stl.karigar_approved} />
            </div>
            {!stl.jeweller_approved && (
              <Button
                size="lg"
                fullWidth
                className={`mt-4 ${cue("S08") ? "cue" : ""}`}
                onPress={() => void perform("S08", "jeweller")}
                isDisabled={pending}
                data-testid="approve-jeweller"
              >
                <Pencil />
                Approve as Suresh
              </Button>
            )}
            {stl.jeweller_approved && !stl.karigar_approved && (
              <p className="mt-4 text-sm text-[var(--ink-2)]">Rafiq approves on his phone. Payment opens only after both.</p>
            )}
            {stl.sealed && r11 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-[var(--ink-2)]">Sealed as</span>
                <HashChip hash={r11.hash} label="R11" />
              </div>
            )}
          </div>

          {stl.sealed && pay === null && (
            <Button size="lg" onPress={() => void perform("S09")} isDisabled={pending} className={cue("S09") ? "cue" : ""} data-testid="open-upi">
              <QrCode />
              Pay {formatInr(sum.payable_paise)} by UPI
            </Button>
          )}
          {pay && <UpiCard uri={pay.upi_uri} amountPaise={pay.amount_paise} />}
          <RevealAnchor when={`${sigs}-${!!pay}`} />
        </div>
      </div>
    </Scene>
  );
}

function UpiCard({ uri, amountPaise }: { uri: string; amountPaise: number }) {
  return (
    <div className="rounded-[20px] border border-[var(--hairline-strong)] p-5" data-testid="upi-card">
      <div className="flex items-center justify-between gap-2">
        <p className="t-label">UPI intent</p>
        <SimChip testId="upi-simulated">Simulated, no money moves</SimChip>
      </div>
      <div className="mt-4 flex items-center gap-5">
        <div className="rounded-xl bg-white p-2.5">
          <QRCodeSVG value={uri} size={116} level="M" title={`UPI QR for ${formatInr(amountPaise)}, simulated`} />
        </div>
        <div className="min-w-0">
          <p className="t-metric text-[1.75rem]">{formatInr(amountPaise)}</p>
          <Chip size="sm" color="success" variant="soft" className="mt-2">
            <CircleCheckFill width={12} height={12} />
            <Chip.Label>Marked paid (simulated)</Chip.Label>
          </Chip>
          <p className="mt-2 font-mono text-[10px] leading-snug break-all text-[var(--ink-3)]">{uri}</p>
        </div>
      </div>
    </div>
  );
}
