"use client";

import { useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Avatar, Button, Checkbox, Chip } from "@heroui/react";
import { ArrowRotateLeft, ArrowUpFromSquare, CircleCheckFill, Clock, Eye, Medal, TriangleExclamationFill } from "@gravity-ui/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Gram } from "@/components/tola/Gram";
import { Ticks } from "@/components/tola/Ticks";
import { ReadbackPlayer, VoiceNoteButton, audioSourceLabel } from "@/components/tola/Voice";
import { useBeat } from "@/features/console/Scene";
import {
  S03_READBACK,
  S04_VOICE_NOTE,
  S06_FLAG_READBACK,
  S06_VOICE_NOTE,
  S07_PROPOSAL,
} from "@/features/story/steps";
import { reducedFade, spring } from "@/lib/springs";
import { eventById, order14, storyApi } from "@/lib/story";
import { STORY_KEY } from "@/features/story/useStory";
import { formatGrams, formatInr } from "@/lib/units";
import { useStageLocal } from "@/stores/stage";

/** Bengali first, English under it (DESIGN §12). Indic strings are drafts pending native review. */
function T({ bn, en, className = "" }: { bn: string; en: string; className?: string }) {
  return (
    <span className={`flex flex-col ${className}`}>
      <span lang="bn">{bn}</span>
      <span className="text-[0.8em] font-normal text-[var(--ink-3)]">{en}</span>
    </span>
  );
}

function Card({ children, tone, testId }: { children: React.ReactNode; tone?: "flag"; testId?: string }) {
  return (
    <div
      className={`rounded-[22px] border bg-[var(--card)] p-4 ${
        tone === "flag" ? "border-[var(--variance-flag)]" : "border-[var(--hairline-strong)]"
      }`}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

/** Haan / Na: 64 px, full width (DESIGN §8). Na never blocks: the event simply waits (EC-1). */
function HaanNa({ onHaan, cue, testId, pending }: { onHaan: () => void; cue: boolean; testId: string; pending: boolean }) {
  const [said, setSaid] = useState<"na" | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <Button
        fullWidth
        size="lg"
        onPress={onHaan}
        isDisabled={pending}
        className={`h-16 text-lg ${cue ? "cue" : ""}`}
        data-testid={testId}
      >
        <CircleCheckFill />
        <span lang="bn">হ্যাঁ, ঠিক আছে</span>
        <span className="text-sm font-normal opacity-70">· Haan</span>
      </Button>
      <Button fullWidth size="lg" variant="outline" className="h-14" onPress={() => setSaid("na")}>
        <span lang="bn">না, ভুল আছে</span>
        <span className="text-sm font-normal opacity-70">· Na</span>
      </Button>
      {said === "na" && (
        <p className="text-center text-xs text-[var(--ink-3)]">
          Left waiting for Rafiq. Nothing is recorded until he says haan.
        </p>
      )}
    </div>
  );
}

export function KarigarPhone({ followServer = false }: { followServer?: boolean }) {
  const { state, step, done, cue, perform, pending } = useBeat(followServer);
  const local = useStageLocal();
  const reduced = useReducedMotion();
  const audioReady = state?.audio_source !== "placeholder";
  const audioLabel = audioSourceLabel(state?.audio_source);
  const o14 = order14(state);
  const o09 = state?.orders.find((o) => o.code === "#09");
  const flag14 = state?.reconcile?.rows.find((r) => r.order === "#14");
  const r5 = eventById(state, "R5");

  const screen = (() => {
    const at = step.index;
    if (at >= 9) return "passport";
    if (at >= 7) return "settle";
    if (at >= 4) return "week";
    if (at === 3) return "return";
    return "issue";
  })();

  return (
    <div className="flex min-h-full flex-col bg-[var(--bg)]" data-testid="karigar-phone">
      <header className="flex items-center justify-between gap-2 px-5 pt-2 pb-3">
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <Avatar.Fallback>RS</Avatar.Fallback>
          </Avatar>
          <div>
            <p lang="bn" className="text-[15px] leading-tight font-semibold text-[var(--ink)]">
              রফিক শেখ
            </p>
            <p className="text-[11px] text-[var(--ink-3)]">Tola · Shetty Jewellers</p>
          </div>
        </div>
        <Chip size="sm" variant="secondary">
          <Chip.Label lang="bn">বাংলা</Chip.Label>
        </Chip>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={screen}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={reduced ? reducedFade : spring.default}
          className="flex flex-1 flex-col gap-3 px-4 pb-4"
        >
          {screen === "issue" && (
            <>
              {!r5 ? (
                <Card>
                  <T bn="নতুন কোনো চালান নেই" en="No new challans" className="text-base font-medium text-[var(--ink)]" />
                  <p className="mt-3 text-xs text-[var(--ink-3)]">Open with you: order #09, chain</p>
                  <Gram mg={o09?.issued_mg ?? 0} size="md" />
                </Card>
              ) : (
                <Card testId="phone-issue">
                  <div className="flex items-center justify-between">
                    <T bn="নতুন চালান · অর্ডার 14" en="New challan · order #14" className="text-sm font-semibold text-[var(--ink)]" />
                    <Ticks count={r5.sealed ? 2 : 1} showLabel={false} />
                  </div>
                  <div className="mt-3">
                    <Gram mg={o14?.issued_mg ?? 40000} size="phone" fine={916} />
                  </div>
                  <p className="mt-2 text-xs text-[var(--ink-3)]">22K · wastage limit 2.50% = {formatGrams(o14?.allowed_mg ?? 1000)}</p>
                </Card>
              )}
              {r5 && !r5.sealed && (
                <>
                  <ReadbackPlayer
                    audioReady={audioReady}
                    audioLabel={audioLabel}
                    text={S03_READBACK.text}
                    en={S03_READBACK.en}
                    audioFile={S03_READBACK.audio}
                    cue={cue("S03") && !local.readbackHeard}
                    onEnded={() => local.set({ readbackHeard: true })}
                  />
                  <HaanNa
                    testId="phone-haan-issue"
                    cue={cue("S03") && local.readbackHeard}
                    pending={pending}
                    onHaan={() => void perform("S03")}
                  />
                </>
              )}
              {r5?.sealed && (
                <Card testId="phone-issue-sealed">
                  <div className="flex items-center gap-2 text-[var(--indigo-700)]">
                    <Ticks count={2} showLabel={false} />
                    <T bn="দুজনেই সই করেছেন" en="Both signed. It can't be changed now." className="text-sm font-semibold" />
                  </div>
                </Card>
              )}
            </>
          )}

          {screen === "return" && (
            <>
              <Card>
                <T bn="অর্ডার 14 জমা দিন" en="Hand in order #14" className="text-base font-semibold text-[var(--ink)]" />
                <p className="mt-2 text-xs text-[var(--ink-3)]">Issued Monday</p>
                <Gram mg={o14?.issued_mg ?? 0} size="md" />
              </Card>
              {done("S04") ? (
                <Card testId="phone-return-sealed">
                  <T bn="জমা নেওয়া হয়েছে" en="Return recorded" className="text-sm font-semibold text-[var(--ink)]" />
                  <div className="mt-2 flex items-end justify-between">
                    <Gram mg={o14?.returned_total_mg ?? 0} size="lg" />
                    <Ticks count={2} showLabel={false} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--ink-3)]">
                    {formatGrams(o14?.piece_mg ?? 0)} piece + {formatGrams(o14?.scrap_mg ?? 0)} scrap, from the scale
                  </p>
                </Card>
              ) : local.returnVoiceSent ? (
                <Card>
                  <p className="text-xs text-[var(--ink-3)]">Your voice note</p>
                  <p lang="bn" className="mt-1 leading-relaxed text-[var(--ink)]">{S04_VOICE_NOTE.transcript}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--ink-3)]">
                    <Clock width={12} height={12} /> Lakshmi is weighing it now
                  </p>
                </Card>
              ) : (
                <VoiceNoteButton
                  audioReady={audioReady}
                  label="ভয়েস নোট পাঠান · Send voice note"
                  audioFile={S04_VOICE_NOTE.audio}
                  cue={cue("S04")}
                  onSent={() => local.set({ returnVoiceSent: true })}
                  testId="phone-voice-return"
                />
              )}
            </>
          )}

          {screen === "week" && (
            <>
              {!state?.reconcile ? (
                <Card>
                  <T bn="এই সপ্তাহের হিসাব শনিবার" en="This week's check runs on Saturday" className="text-sm font-medium text-[var(--ink)]" />
                </Card>
              ) : (
                <Card tone={state.dispute?.status === "RESOLVED" ? undefined : "flag"} testId="phone-flag">
                  <div className="flex items-center gap-2 text-[var(--variance-flag)]">
                    <TriangleExclamationFill width={16} height={16} />
                    <T bn="অর্ডার 14: সীমার চেয়ে বেশি ঘাটতি" en="Order #14: more wastage than agreed" className="text-sm font-semibold" />
                  </div>
                  <div className="mt-2">
                    <Gram mg={flag14?.variance_mg ?? 0} signed size="lg" tone="flag" strike={state.dispute?.status === "RESOLVED"} />
                  </div>
                </Card>
              )}
              {state?.reconcile && !state.dispute && (
                <>
                  <ReadbackPlayer audioReady={audioReady} audioLabel={audioLabel} text={S06_FLAG_READBACK.text} en={S06_FLAG_READBACK.en} audioFile="S06_flag_bn.mp3" />
                  <VoiceNoteButton
                  audioReady={audioReady}
                    label="ভয়েসে উত্তর দিন · Reply by voice"
                    audioFile={S06_VOICE_NOTE.audio}
                    cue={cue("S06")}
                    onSent={() => void perform("S06")}
                    testId="phone-voice-dispute"
                  />
                </>
              )}
              {state?.dispute && state.dispute.status !== "RESOLVED" && (
                <>
                  <Card>
                    <p className="text-xs text-[var(--ink-3)]">You said</p>
                    <p lang="bn" className="mt-1 leading-relaxed text-[var(--ink)]">{S06_VOICE_NOTE.transcript}</p>
                  </Card>
                  {local.proposalSent ? (
                    <>
                      <ReadbackPlayer audioReady={audioReady} audioLabel={audioLabel} text={S07_PROPOSAL.text} en={S07_PROPOSAL.en} audioFile="S07_proposal_bn.mp3" />
                      <HaanNa testId="phone-haan-proposal" cue={cue("S07")} pending={pending} onHaan={() => void perform("S07")} />
                    </>
                  ) : (
                    <p className="flex items-center gap-1.5 px-1 text-xs text-[var(--ink-3)]">
                      <Clock width={12} height={12} /> Waiting for Suresh&apos;s reply
                    </p>
                  )}
                </>
              )}
              {state?.dispute?.status === "RESOLVED" && (
                <Card testId="phone-resolved">
                  <T bn="মীমাংসা হয়েছে" en="Agreed by both" className="text-sm font-semibold text-[var(--ink)]" />
                  <p className="mt-2 text-xs text-[var(--ink-3)]">Stays on your account</p>
                  <Gram mg={state.dispute.resolved_mg ?? 0} size="lg" fine={916} />
                  <div className="mt-2">
                    <Ticks count={2} />
                  </div>
                </Card>
              )}
            </>
          )}

          {screen === "settle" && (
            <>
              <Card testId="phone-statement">
                <T bn="সপ্তাহ 42 · হিসাব" en="Week 42 statement" className="text-sm font-semibold text-[var(--ink)]" />
                {state?.settlement ? (
                  <>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-xs text-[var(--ink-3)]">Labour + GST</span>
                      <span className="t-metric text-[1.75rem]">{formatInr(state.settlement.summary.payable_paise)}</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-xs text-[var(--ink-3)]">Gold on your account</span>
                      <Gram mg={state.settlement.summary.carried_shortfall_mg} size="sm" />
                    </div>
                    <div className="mt-3">
                      <Ticks
                        count={(Number(state.settlement.jeweller_approved) + Number(state.settlement.karigar_approved)) as 0 | 1 | 2}
                        waitingFor={state.settlement.jeweller_approved && !state.settlement.karigar_approved ? "you" : undefined}
                      />
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-[var(--ink-3)]">Being prepared</p>
                )}
              </Card>
              {state?.settlement && !state.settlement.karigar_approved && (
                <Button
                  fullWidth
                  size="lg"
                  className={`h-16 text-lg ${cue("S08") && state.settlement.jeweller_approved ? "cue" : ""}`}
                  isDisabled={pending}
                  onPress={() => void perform("S08", "karigar")}
                  data-testid="phone-approve"
                >
                  <CircleCheckFill />
                  <span lang="bn">অনুমোদন</span>
                  <span className="text-sm font-normal opacity-70">· Approve</span>
                </Button>
              )}
              {state?.payment && (
                <Card testId="phone-paid">
                  <T bn="টাকা এসেছে (নমুনা)" en="Payment received (simulated)" className="text-sm font-semibold text-[var(--ink)]" />
                  <p className="t-metric mt-2 text-[1.75rem]">{formatInr(state.payment.amount_paise)}</p>
                  <p className="mt-1 text-[11px] text-[var(--ink-3)]">Simulated: no money moves in this demo</p>
                </Card>
              )}
            </>
          )}

          {screen === "passport" && <PassportPhone followServer={followServer} />}
        </m.div>
      </AnimatePresence>
    </div>
  );
}

/** S10 on the phone: Rafiq's own record and the share sheet (F-08). */
function PassportPhone({ followServer }: { followServer: boolean }) {
  const { state, cue, perform, pending } = useBeat(followServer);
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const queryClient = useQueryClient();
  const toggleShare = async (token: string, revoked: boolean) => {
    setRevoking(true);
    try {
      await (revoked ? storyApi.reshare() : storyApi.revokeShare(token));
      await queryClient.invalidateQueries({ queryKey: STORY_KEY });
    } finally {
      setRevoking(false);
    }
  };
  const p = state?.passport;
  const pv = p?.summary ?? state?.passport_preview;
  return (
    <div className="relative flex flex-1 flex-col gap-3">
      <Card testId="phone-passport">
        <div className="flex items-center gap-2">
          <Medal width={18} height={18} className="text-[var(--gold-deep,#7a5300)]" />
          <T bn="আমার কাজের পাসপোর্ট" en="My Work Passport" className="text-sm font-semibold text-[var(--ink)]" />
        </div>
        <p className="mt-3 text-xs text-[var(--ink-3)]">Gold handled, 180 days</p>
        <Gram mg={pv?.grams_handled_mg ?? 0} size="lg" />
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-[var(--bg-2)] p-2.5">
            <p className="text-[var(--ink-3)]">On time</p>
            <p className="t-metric text-base">
              {pv?.on_time} of {pv?.returned}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-2)] p-2.5">
            <p className="text-[var(--ink-3)]">Wastage used</p>
            <p className="t-metric text-base">{pv?.allowance_used_pct_str}</p>
          </div>
        </div>
      </Card>

      {p ? (
        <Card testId="phone-shared">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <CircleCheckFill width={16} height={16} className="text-[var(--indigo-700)]" />
            Shared with {p.recipient}
          </div>
          {p.revoked ? (
            <p className="mt-1 text-xs text-[var(--ink-3)]" data-testid="phone-share-revoked">
              Taken back. Meera&apos;s link no longer opens.
            </p>
          ) : (
            <p className="mt-1 text-xs text-[var(--ink-3)]">Until 25 Oct · you can take it back any time</p>
          )}
          {p.views > 0 && !p.revoked && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--ink-2)]">
              <Eye width={12} height={12} /> Opened {p.views} time{p.views > 1 ? "s" : ""}
            </p>
          )}
          {/* Rafiq can take it back once Meera has looked (after S11), so the story's lender beat stays intact. */}
          {(p.views > 0 || p.revoked) && (
            <Button
              size="sm"
              variant={p.revoked ? "secondary" : "ghost"}
              className="mt-3 -ml-2"
              isDisabled={revoking}
              onPress={() => void toggleShare(p.token, p.revoked)}
              data-testid={p.revoked ? "phone-share-again" : "phone-share-revoke"}
            >
              {p.revoked ? <ArrowUpFromSquare /> : <ArrowRotateLeft />}
              <span lang="bn">{p.revoked ? "আবার শেয়ার" : "ফিরিয়ে নিন"}</span>
              <span className="font-normal opacity-70">· {p.revoked ? "Share again" : "Take it back"}</span>
            </Button>
          )}
        </Card>
      ) : (
        <Button
          fullWidth
          size="lg"
          className={`h-14 ${cue("S10") && !sheet ? "cue" : ""}`}
          onPress={() => setSheet(true)}
          data-testid="phone-share-open"
        >
          <ArrowUpFromSquare />
          <span lang="bn">শেয়ার করুন</span>
          <span className="text-sm font-normal opacity-70">· Share</span>
        </Button>
      )}

      <AnimatePresence>
        {sheet && !p && (
          <>
            <m.div
              className="absolute -inset-x-4 -top-24 bottom-[-1rem] bg-[var(--scrim)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheet(false)}
            />
            <m.div
              role="dialog"
              aria-label="Share your Work Passport"
              className="absolute -inset-x-4 bottom-[-1rem] rounded-t-[26px] bg-[var(--card)] p-5 shadow-[var(--shadow-sheet)]"
              initial={reduced ? { opacity: 0 } : { y: "100%" }}
              animate={reduced ? { opacity: 1 } : { y: 0 }}
              exit={reduced ? { opacity: 0 } : { y: "100%" }}
              transition={reduced ? reducedFade : spring.default}
              data-testid="share-sheet"
            >
              <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[var(--hairline-strong)]" />
              <p className="text-sm font-semibold text-[var(--ink)]">Share with</p>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[var(--indigo-700)] p-3">
                <Avatar size="sm">
                  <Avatar.Fallback>MR</Avatar.Fallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--ink)]">Meera Rao</p>
                  <p className="truncate text-[11px] text-[var(--ink-3)]">Sahyadri Co-op Credit Society (fictional)</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--ink)]">What she can see</p>
              <div className="mt-2 flex flex-col gap-2">
                {["Gold handled", "On-time returns", "Wastage vs norm", "Disputes"].map((s) => (
                  <Checkbox key={s} defaultSelected isReadOnly variant="secondary">
                    <Checkbox.Content className="text-sm text-[var(--ink)]">
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      {s}
                    </Checkbox.Content>
                  </Checkbox>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--ink-3)]">For 7 days. You can revoke it any time.</p>
              <Button
                fullWidth
                size="lg"
                className={`mt-3 h-14 ${cue("S10") ? "cue" : ""}`}
                isDisabled={pending}
                onPress={() => void perform("S10").then(() => setSheet(false))}
                data-testid="phone-share-confirm"
              >
                Share for 7 days
              </Button>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
