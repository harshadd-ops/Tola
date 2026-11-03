"use client";

import React, { useEffect, useState } from "react";
import { BrowserFrame } from "@/components/device/BrowserFrame";
import { PhoneFrame } from "@/components/device/PhoneFrame";
import { StageLayout } from "@/components/layout/StageLayout";
import { DisputeThread } from "@/features/dispute/DisputeThread";
import { IssueCard } from "@/features/issue/IssueCard";
import { KarigarApp } from "@/features/karigar/KarigarApp";
import { ChainVerifier } from "@/features/ledger/ChainVerifier";
import { LenderView } from "@/features/passport/LenderView";
import {
  AgentExplanation,
  DEFAULT_RECONCILE_EXPLANATION,
} from "@/features/reconcile/AgentExplanation";
import { RunWeekButton } from "@/features/reconcile/RunWeekButton";
import {
  CANONICAL_RECONCILE_ROWS,
  VarianceTable,
} from "@/features/reconcile/VarianceTable";
import { ReturnIntakeCard } from "@/features/returns/ReturnIntakeCard";
import { ScaleWidget } from "@/features/scale/ScaleWidget";
import { SettlementSheet } from "@/features/settlement/SettlementSheet";
import { Stepper } from "@/features/story/Stepper";
import { StepSpotlight } from "@/features/story/StepSpotlight";
import {
  STORY_STEPS,
  getStepByIndex,
  type StoryStepDef,
} from "@/features/story/steps";
import {
  createLedgerEvent,
  fetchDemoReset,
  postVoiceNote,
  resolveDispute,
  runWeeklyReconcile,
  type ReconcileRow,
} from "@/lib/api";
import { useScaleStore } from "@/stores/scale";
import { useSessionStore } from "@/stores/session";
import { useStoryStore } from "@/stores/story";

type ConsolePanelTab =
  | "issue"
  | "returns"
  | "reconcile"
  | "settlement"
  | "lender"
  | "ledger";

function consoleTabForStep(stepIndex: number): ConsolePanelTab {
  if (stepIndex <= 2) return "issue";
  if (stepIndex === 3) return "returns";
  if (stepIndex >= 4 && stepIndex <= 6) return "reconcile";
  if (stepIndex === 7 || stepIndex === 8 || stepIndex === 11) return "settlement";
  if (stepIndex === 10) return "lender";
  if (stepIndex === 12) return "ledger";
  return "settlement";
}

export default function StagePage() {
  const stepIndex = useStoryStore((s) => s.stepIndex);
  const clock = useStoryStore((s) => s.clock);
  const markStepDone = useStoryStore((s) => s.markStepDone);
  const nextStep = useStoryStore((s) => s.nextStep);
  const setPersona = useSessionStore((s) => s.setPersona);
  const resetScale = useScaleStore((s) => s.reset);
  const setStableReading = useScaleStore((s) => s.setStableReading);

  const currentStep = getStepByIndex(stepIndex);

  const [consoleTab, setConsoleTab] = useState<ConsolePanelTab>(() =>
    consoleTabForStep(stepIndex),
  );
  const [issueSigs, setIssueSigs] = useState<number>(0);
  const [order14Hash, setOrder14Hash] = useState<string | undefined>(undefined);
  const [returnVoiceDone, setReturnVoiceDone] = useState(false);
  const [returnSigs, setReturnSigs] = useState<number>(0);
  const [reconcileRan, setReconcileRan] = useState(false);
  const [reconcileRows, setReconcileRows] = useState<readonly ReconcileRow[]>(
    CANONICAL_RECONCILE_ROWS,
  );
  const [reconcileExplanation, setReconcileExplanation] = useState<string>(
    DEFAULT_RECONCILE_EXPLANATION,
  );
  const [disputeStatus, setDisputeStatus] = useState<
    "none" | "open" | "proposed" | "resolved"
  >("none");
  const [proposedAllowanceMg, setProposedAllowanceMg] = useState<number | null>(
    null,
  );

  // Sync console tab and derived flags whenever stepIndex changes
  useEffect(() => {
    setConsoleTab(consoleTabForStep(stepIndex));
    setPersona(STORY_STEPS[stepIndex]?.persona ?? "p-suresh");

    if (stepIndex >= 1) {
      setStableReading(40_000, "simulated");
    }
    if (stepIndex === 1) {
      setIssueSigs((prev) => Math.max(prev, 0));
    } else if (stepIndex === 2) {
      setIssueSigs((prev) => Math.max(prev, 1));
    } else if (stepIndex >= 3) {
      setIssueSigs(2);
    }

    if (stepIndex >= 4) {
      setReturnVoiceDone(true);
      setReturnSigs(2);
    }
    if (stepIndex >= 5) {
      setReconcileRan(true);
    }
    if (stepIndex === 6) {
      setDisputeStatus((prev) => (prev === "resolved" ? "resolved" : "open"));
    } else if (stepIndex >= 7) {
      setDisputeStatus("resolved");
      setProposedAllowanceMg(130);
    }
  }, [stepIndex, setPersona, setStableReading]);

  const handleStepChange = (step: StoryStepDef) => {
    setConsoleTab(consoleTabForStep(step.index));
    void fetchDemoReset(step.id).catch(() => null);
  };

  const handleResetDemo = () => {
    resetScale();
    setIssueSigs(0);
    setOrder14Hash(undefined);
    setReturnVoiceDone(false);
    setReturnSigs(0);
    setReconcileRan(false);
    setDisputeStatus("none");
    setProposedAllowanceMg(null);
    setConsoleTab("issue");
    void fetchDemoReset().catch(() => null);
  };

  const handleScaleCaptured = () => {
    markStepDone("S01");
    if (stepIndex === 0) {
      nextStep();
    }
  };

  const handleJewellerSignIssue = async () => {
    try {
      const ev = await createLedgerEvent({
        event_type: "ISSUE_GOLD",
        karigar_id: "p-rafiq",
        order_id: "order-14",
        actor_id: "p-suresh",
        gold_mg: 40_000,
        stone_mg: 0,
        net_gold_mg: 40_000,
        fineness: 916,
        norm_bp: 250,
        timestamp: "2026-10-12T10:02:30+05:30",
        auto_sign_karigar: false,
      });
      setOrder14Hash(ev.event_hash);
    } catch {
      // Fallback
    }
    setIssueSigs(1);
    markStepDone("S02");
    if (stepIndex === 1) {
      nextStep();
    }
  };

  const handleKarigarConfirmOrder14 = () => {
    setIssueSigs(2);
    markStepDone("S03");
    if (stepIndex === 2) {
      nextStep();
    }
  };

  const handleReturnVoiceIntake = async () => {
    await postVoiceNote({
      step_id: "S04",
      lang: "bn",
      piece_gross_mg: 38_120,
      scrap_mg: 500,
      dust_mg: 0,
    }).catch(() => null);
    setReturnVoiceDone(true);
  };

  const handleSignReturn = async () => {
    try {
      await createLedgerEvent({
        event_type: "RETURN_ORNAMENT",
        karigar_id: "p-rafiq",
        order_id: "order-14",
        actor_id: "p-rafiq",
        gold_mg: 38_120,
        stone_mg: 200,
        net_gold_mg: 37_920,
        fineness: 916,
        timestamp: "2026-10-15T16:10:00+05:30",
        auto_sign_karigar: true,
      });
      await createLedgerEvent({
        event_type: "RETURN_SCRAP",
        karigar_id: "p-rafiq",
        order_id: "order-14",
        actor_id: "p-rafiq",
        gold_mg: 500,
        stone_mg: 0,
        net_gold_mg: 500,
        fineness: 916,
        timestamp: "2026-10-15T16:10:15+05:30",
        auto_sign_karigar: true,
      });
    } catch {
      // Fallback
    }
    setReturnVoiceDone(true);
    setReturnSigs(2);
    markStepDone("S04");
    if (stepIndex === 3) {
      nextStep();
    }
  };

  const handleRunWeek = async () => {
    try {
      const run = await runWeeklyReconcile();
      if (run.rows?.length) setReconcileRows(run.rows);
      if (run.explanation) setReconcileExplanation(run.explanation);
    } catch {
      // Keep canonical rows
    }
    setReconcileRan(true);
    markStepDone("S05");
    if (stepIndex === 4) {
      nextStep();
    }
  };

  const handleDisputeOpened = () => {
    setDisputeStatus("open");
    markStepDone("S06");
    if (stepIndex === 5) {
      nextStep();
    }
  };

  const handleProposeResolution = async (allowanceMg: number) => {
    setProposedAllowanceMg(allowanceMg);
    try {
      await resolveDispute("D-14", allowanceMg);
    } catch {
      // Fallback
    }
    setDisputeStatus("resolved");
    markStepDone("S07");
    if (stepIndex === 6) {
      nextStep();
    }
  };

  const handlePerformCurrentStep = async (stepId: string) => {
    switch (stepId) {
      case "S01":
        setStableReading(40_000, "simulated");
        handleScaleCaptured();
        break;
      case "S02":
        await handleJewellerSignIssue();
        break;
      case "S03":
        handleKarigarConfirmOrder14();
        break;
      case "S04":
        await handleReturnVoiceIntake();
        await handleSignReturn();
        break;
      case "S05":
        await handleRunWeek();
        break;
      case "S06":
        handleDisputeOpened();
        break;
      case "S07":
        await handleProposeResolution(130);
        break;
      default:
        break;
    }
  };

  const consoleNavTabs: Array<{ id: ConsolePanelTab; label: string; steps: string }> = [
    { id: "issue", label: "1. Issue", steps: "S01–03" },
    { id: "returns", label: "2. Return", steps: "S04" },
    { id: "reconcile", label: "3. Reconcile", steps: "S05–07" },
    { id: "settlement", label: "4. Settlement", steps: "S08–12" },
    { id: "lender", label: "5. Lender", steps: "S11" },
    { id: "ledger", label: "6. Ledger", steps: "S13" },
  ];

  const consolePane = (
    <div className="space-y-4">
      <div
        style={{
          background: "var(--surface-elevated)",
          borderColor: "var(--hairline)",
          boxShadow: "var(--shadow-sm)",
        }}
        className="no-scrollbar flex items-center justify-between gap-1 overflow-x-auto rounded-full border p-1.5"
        role="tablist"
        aria-label="Jeweller console views"
      >
        {consoleNavTabs.map((t) => {
          const active = consoleTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`stage-console-tab-${t.id}`}
              onClick={() => setConsoleTab(t.id)}
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "var(--accent-foreground)" : "var(--ink-2)",
              }}
              className="inline-flex min-h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all"
            >
              <span className={active ? "font-semibold" : ""}>{t.label}</span>
              <span
                style={{
                  color: active ? "var(--accent-foreground)" : "var(--ink-3)",
                }}
                className="font-mono text-[10px] tabular-nums"
              >
                {t.steps}
              </span>
            </button>
          );
        })}
      </div>

      {consoleTab === "issue" ? (
        <div className="space-y-4" data-testid="stage-issue-section">
          <ScaleWidget
            targetMg={40_000}
            orderId="order-14"
            onCaptured={handleScaleCaptured}
          />
          <IssueCard
            goldMg={40_000}
            sigCount={issueSigs}
            onSignJeweller={handleJewellerSignIssue}
          />
        </div>
      ) : null}

      {consoleTab === "returns" ? (
        <div className="space-y-4" data-testid="stage-returns-section">
          <ReturnIntakeCard
            voiceCaptured={returnVoiceDone}
            sigCount={returnSigs}
            onTriggerVoiceIntake={handleReturnVoiceIntake}
            onSignReturn={handleSignReturn}
          />
        </div>
      ) : null}

      {consoleTab === "reconcile" ? (
        <div className="space-y-4" data-testid="stage-reconcile-section">
          <div
            style={{
              background: "var(--surface-elevated)",
              borderColor: "var(--hairline)",
              boxShadow: "var(--shadow-card)",
            }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border p-5"
          >
            <div>
              <p
                style={{
                  color: "var(--ink-3)",
                  letterSpacing: "var(--track-label)",
                }}
                className="text-xs font-semibold uppercase"
              >
                F-05 · Saturday Weekly Reconciliation
              </p>
              <h2
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                className="mt-0.5 text-xl font-normal"
              >
                Saturday Weekly Reconciliation · Week 2026-W42
              </h2>
              <p style={{ color: "var(--ink-2)" }} className="mt-0.5 text-xs">
                Orders #12, #13, and #14 checked in integer milligrams · Fine gold (999) + ₹
                estimate
              </p>
            </div>
            <RunWeekButton ran={reconcileRan} onRun={handleRunWeek} />
          </div>

          {reconcileRan || stepIndex >= 4 ? (
            <>
              <AgentExplanation
                explanation={reconcileExplanation}
                sourceMode="cached"
              />
              <div
                style={{
                  background: "var(--surface-elevated)",
                  borderColor: "var(--hairline)",
                  boxShadow: "var(--shadow-card)",
                }}
                className="rounded-3xl border p-5"
              >
                <VarianceTable
                  rows={reconcileRows}
                  disputeStatus={
                    disputeStatus === "resolved"
                      ? "resolved"
                      : disputeStatus === "open"
                        ? "open"
                        : "none"
                  }
                />
              </div>
              <DisputeThread
                status={disputeStatus}
                proposedAllowanceMg={proposedAllowanceMg}
                resolved={disputeStatus === "resolved"}
                onPropose={handleProposeResolution}
              />
            </>
          ) : null}
        </div>
      ) : null}

      {consoleTab === "settlement" ? (
        <SettlementSheet
          settlementId="SET-2026-W42-RAFIQ"
          showUpiCard={true}
          showGstDraft={true}
          onSealed={() => {
            markStepDone("S08");
            if (stepIndex === 7) nextStep();
          }}
          onPaid={() => {
            markStepDone("S09");
            if (stepIndex === 8) nextStep();
          }}
          onGstViewed={() => {
            markStepDone("S12");
            if (stepIndex === 11) nextStep();
          }}
        />
      ) : null}

      {consoleTab === "lender" ? (
        <BrowserFrame url="https://verify.pragati-mfi.demo/passport/ps-rafiq-w42-demo0001a">
          <LenderView
            token="ps-rafiq-w42-demo0001a"
            onInspected={() => {
              markStepDone("S11");
              if (stepIndex === 10) nextStep();
            }}
          />
        </BrowserFrame>
      ) : null}

      {consoleTab === "ledger" ? (
        <ChainVerifier
          karigarId="p-rafiq"
          onVerified={() => {
            markStepDone("S13");
          }}
        />
      ) : null}
    </div>
  );

  const phonePane = (
    <PhoneFrame clock={clock} personaName="Rafiq Sheikh" langTag="বাংলা · BN">
      <KarigarApp
        activeStepId={currentStep.id}
        order14Issued={issueSigs >= 1 || stepIndex >= 1}
        order14KarigarSigned={issueSigs >= 2 || stepIndex >= 3}
        order14EventHash={order14Hash}
        disputeOpened={disputeStatus === "open" || disputeStatus === "resolved"}
        disputeResolved={disputeStatus === "resolved"}
        onKarigarConfirmedOrder14={handleKarigarConfirmOrder14}
        onDisputeOpened={handleDisputeOpened}
        onPassportShared={() => {
          markStepDone("S10");
          if (stepIndex === 9) nextStep();
        }}
      />
    </PhoneFrame>
  );

  return (
    <StageLayout
      headerSlot={<StepSpotlight onPerformStep={handlePerformCurrentStep} />}
      consolePane={consolePane}
      phonePane={phonePane}
      stepperBar={
        <Stepper
          onStepChange={handleStepChange}
          onResetDemo={handleResetDemo}
        />
      }
    />
  );
}
