"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Award, CheckCircle2, Mic, Package, Volume2 } from "lucide-react";
import { NotificationBanner } from "@/components/device/NotificationBanner";
import { AudioCaption } from "@/components/ui/AudioCaption";
import { GramFigure } from "@/components/ui/GramFigure";
import { TickPair } from "@/components/ui/TickPair";
import { PassportSummary } from "@/features/passport/PassportSummary";
import { ShareSheet } from "@/features/passport/ShareSheet";
import {
  S03_READBACK,
  S06_VOICE_NOTE,
  type StoryStepId,
} from "@/features/story/steps";
import {
  openDispute,
  postVoiceReadback,
  signLedgerEvent,
  type DisputeItem,
  type PassportShareData,
} from "@/lib/api";
import { useTranslations } from "next-intl";
import { useSessionStore } from "@/stores/session";

export type KarigarTab = "orders" | "dispute" | "passport";

export interface KarigarAppProps {
  activeStepId?: StoryStepId;
  order14Issued?: boolean;
  order14KarigarSigned?: boolean;
  order14EventHash?: string;
  disputeOpened?: boolean;
  disputeResolved?: boolean;
  onKarigarConfirmedOrder14?: () => void;
  onDisputeOpened?: (dispute: DisputeItem) => void;
  onPassportShared?: (share: PassportShareData) => void;
}

export function KarigarApp({
  activeStepId = "S01",
  order14Issued = false,
  order14KarigarSigned = false,
  order14EventHash,
  disputeOpened = false,
  disputeResolved = false,
  onKarigarConfirmedOrder14,
  onDisputeOpened,
  onPassportShared,
}: KarigarAppProps) {
  const t = useTranslations("karigar");
  const personaId = useSessionStore((s) => s.personaId);
  const isLakshmi = personaId === "p-lakshmi";

  const [tab, setTab] = useState<KarigarTab>("orders");
  const [signed, setSigned] = useState(order14KarigarSigned);
  const [signing, setSigning] = useState(false);
  const [disputeSent, setDisputeSent] = useState(disputeOpened);
  const [disputing, setDisputing] = useState(false);

  useEffect(() => {
    setSigned(order14KarigarSigned);
  }, [order14KarigarSigned]);

  useEffect(() => {
    setDisputeSent(disputeOpened);
  }, [disputeOpened]);

  useEffect(() => {
    if (activeStepId === "S06" || activeStepId === "S07") {
      setTab("dispute");
    } else if (
      activeStepId === "S10" ||
      activeStepId === "S11"
    ) {
      setTab("passport");
    } else if (
      activeStepId === "S01" ||
      activeStepId === "S02" ||
      activeStepId === "S03" ||
      activeStepId === "S04"
    ) {
      setTab("orders");
    }
  }, [activeStepId]);

  const handleConfirmOrder14 = async () => {
    setSigning(true);
    try {
      await postVoiceReadback({
        step_id: "S03",
        lang: isLakshmi ? "kn" : "bn",
        order_code: "#14",
        gross_mg: 40_000,
        allowed_mg: 1_000,
      }).catch(() => null);
      await signLedgerEvent({
        event_id: "E-14-1",
        signer_id: "p-rafiq",
        event_hash: order14EventHash,
        role: "karigar",
        readback_played: true,
      });
    } catch {
      // Fallback in demo mode if event already signed or offline
    } finally {
      setSigned(true);
      setSigning(false);
      onKarigarConfirmedOrder14?.();
    }
  };

  const handleOpenVoiceDispute = async () => {
    setDisputing(true);
    try {
      const dispute = await openDispute({
        order_id: "order-14",
        karigar_id: "p-rafiq",
        disputed_variance_mg: 380,
      });
      setDisputeSent(true);
      onDisputeOpened?.(dispute);
    } catch {
      setDisputeSent(true);
      onDisputeOpened?.({
        id: "D-14",
        order_id: "order-14",
        order: "#14",
        karigar_id: "p-rafiq",
        status: "OPEN",
        disputed_variance_mg: 380,
        disputed_variance_fine_mg: 348,
        reason_code: "REWORK_SOLDER_JOINT",
        opened_at: "2026-10-17T18:20:00+05:30",
        messages: [],
      });
    } finally {
      setDisputing(false);
    }
  };

  return (
    <div className="space-y-3" data-testid="karigar-app">
      <div
        style={{
          background: "var(--surface-sunken)",
          borderColor: "var(--hairline)",
        }}
        className="grid grid-cols-3 gap-1 rounded-full border p-1"
        role="tablist"
        aria-label="Karigar companion sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "orders"}
          data-testid="karigar-tab-orders"
          onClick={() => setTab("orders")}
          style={{
            background: tab === "orders" ? "var(--slate)" : "transparent",
            color:
              tab === "orders"
                ? "var(--surface-elevated)"
                : "var(--ink-2)",
          }}
          className="flex min-h-9 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
        >
          <Package className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("tabChallan")}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "dispute"}
          data-testid="karigar-tab-dispute"
          onClick={() => setTab("dispute")}
          style={{
            background: tab === "dispute" ? "var(--slate)" : "transparent",
            color:
              tab === "dispute"
                ? "var(--surface-elevated)"
                : "var(--ink-2)",
          }}
          className="flex min-h-9 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("tabDispute")}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "passport"}
          data-testid="karigar-tab-passport"
          onClick={() => setTab("passport")}
          style={{
            background: tab === "passport" ? "var(--slate)" : "transparent",
            color:
              tab === "passport"
                ? "var(--surface-elevated)"
                : "var(--ink-2)",
          }}
          className="flex min-h-9 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
        >
          <Award className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("tabPassport")}</span>
        </button>
      </div>

      {tab === "orders" ? (
        <div className="space-y-3" data-testid="karigar-orders-panel">
          <NotificationBanner
            visible={order14Issued || activeStepId === "S02" || activeStepId === "S03" || signed}
            title="Order #14 · 40.000 g (22K) · Wastage limit 2.50% (1.000 g)"
            subtitle="Shetty Fine Jewellers · Tap to hear Bengali read-back & co-sign"
          />

          <div
            style={{
              background: "var(--surface-elevated)",
              borderColor: "var(--hairline-strong)",
              boxShadow: "var(--shadow-card)",
            }}
            className="rounded-2xl border p-3.5"
          >
            <div className="mb-2.5 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div
                  style={{ color: "var(--gold-deep)" }}
                  className="font-mono text-[11px] font-semibold tracking-wider uppercase"
                  data-testid="karigar-order14-title"
                >
                  {t("challanTitle")}
                </div>
                <div style={{ color: "var(--ink-2)" }} className="mt-0.5 text-xs">
                  {t("normLabel")}
                </div>
              </div>
              <TickPair
                jewellerSigned={true}
                karigarSigned={signed}
                jewellerLabel="Suresh signed"
                karigarLabel={signed ? "Rafiq signed" : "Rafiq pending"}
              />
            </div>

            <div
              style={{
                background: "var(--surface-sunken)",
                borderColor: "var(--hairline)",
              }}
              className="my-2.5 flex items-baseline justify-between rounded-xl border px-3 py-2.5"
            >
              <span style={{ color: "var(--ink-3)" }} className="text-xs font-medium">
                {t("issuedLabel")}
              </span>
              <GramFigure mg={40_000} fineness={916} showFine size="md" />
            </div>

            <div className="mb-3">
              <div
                style={{ color: "var(--gold-deep)" }}
                className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("listen")} (Sarvam Bulbul v2)</span>
              </div>
              <AudioCaption
                nativeText={S03_READBACK.text}
                nativeLang="bn"
                englishCaption={S03_READBACK.en}
                audioPath={S03_READBACK.cachedAudio}
                sourceMode="cached"
              />
            </div>

            {!signed ? (
              <button
                type="button"
                id="step-s03-haan-btn"
                data-testid="step-s03-haan-btn"
                disabled={signing}
                onClick={handleConfirmOrder14}
                style={{
                  background: "var(--slate)",
                  color: "var(--surface-elevated)",
                  boxShadow: "var(--shadow-sm)",
                }}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-transform active:scale-[0.99] disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="font-bengali text-sm">{t("haan")}</span>
                <span className="opacity-90">· Confirm (40.000 g)</span>
              </button>
            ) : (
              <div
                data-testid="step-s03-confirmed-badge"
                style={{
                  background: "var(--tick-sealed-bg)",
                  borderColor: "var(--tick-sealed)",
                  color: "var(--tick-sealed)",
                }}
                className="flex items-center justify-center gap-2 rounded-full border px-3 py-2.5 font-mono text-xs font-semibold"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{t("sealed")} · Ed25519 Sealed</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {tab === "dispute" ? (
        <div className="space-y-3" data-testid="karigar-dispute-panel">
          <div
            style={{
              background: "var(--surface-elevated)",
              borderColor: "var(--hairline)",
              boxShadow: "var(--shadow-card)",
            }}
            className="rounded-2xl border p-3.5"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span
                style={{ color: "var(--warn)" }}
                className="font-mono text-xs font-semibold"
              >
                ORDER #14 · VARIANCE +0.380 g ABOVE NORM
              </span>
              <span
                style={{ color: "var(--ink-3)" }}
                className="font-mono text-[10px]"
              >
                1.380 g loss vs 1.000 g norm
              </span>
            </div>

            <p style={{ color: "var(--ink-2)" }} className="mb-3 text-xs">
              {t("voiceNotePrompt")}
            </p>

            <AudioCaption
              nativeText={S06_VOICE_NOTE.transcript}
              nativeLang="bn"
              englishCaption={S06_VOICE_NOTE.en}
              audioPath={S06_VOICE_NOTE.cachedAudio}
              sourceMode="cached"
            />

            <div className="mt-3">
              {!disputeSent && !disputeResolved ? (
                <button
                  type="button"
                  id="step-s06-dispute-mic"
                  data-testid="step-s06-dispute-mic"
                  disabled={disputing}
                  onClick={handleOpenVoiceDispute}
                  style={{
                    background: "var(--slate)",
                    color: "var(--surface-elevated)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-transform active:scale-[0.99] disabled:opacity-50"
                >
                  <Mic className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="font-bengali text-sm">আপত্তি জানান</span>
                  <span className="opacity-90">
                    · {disputing ? "Sending voice dispute..." : t("holdToSpeak")}
                  </span>
                </button>
              ) : (
                <div
                  data-testid="karigar-dispute-status-badge"
                  style={{
                    background: "var(--tick-sealed-bg)",
                    borderColor: "var(--tick-sealed)",
                    color: "var(--tick-sealed)",
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border px-3 py-2.5 font-mono text-xs font-semibold"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {disputeResolved
                      ? "Dispute D-14 Resolved · +0.130 g allowance signed"
                      : "Dispute D-14 Opened · E-14-5 appended to chain"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "passport" ? (
        <div className="space-y-3" data-testid="karigar-passport-panel">
          <PassportSummary />
          <ShareSheet onShareCreated={onPassportShared} />
        </div>
      ) : null}
    </div>
  );
}
