"use client";

import React, { useEffect, useState } from "react";
import * as m from "motion/react-m";
import { GramFigure } from "@/components/ui/GramFigure";
import { Pill } from "@/components/ui/Pill";
import { SimLabel } from "@/components/ui/SimLabel";
import { useReducedMotion } from "@/lib/a11y";
import { postScaleReading } from "@/lib/api";
import { pick } from "@/lib/springs";
import { parseGramsToMg } from "@/lib/units";
import { useScaleStore } from "@/stores/scale";
import { useSimulatedScale } from "./useSimulatedScale";
import { useWebSerialScale } from "./useWebSerialScale";

export function ScaleWidget({
  targetMg = 40000,
  orderId = "order-14",
  occurredAt = "2026-10-12T10:02:00+05:30",
  itemLabel = "40.000 g 22K gold bar",
  onCaptured,
}: {
  targetMg?: number;
  orderId?: string;
  occurredAt?: string;
  itemLabel?: string;
  onCaptured?: (mg: number) => void;
}) {
  const reduced = useReducedMotion();
  const source = useScaleStore((s) => s.source);
  const currentMg = useScaleStore((s) => s.currentMg);
  const stable = useScaleStore((s) => s.stable);
  const capturedMg = useScaleStore((s) => s.capturedMg);
  const setSource = useScaleStore((s) => s.setSource);
  const captureCurrent = useScaleStore((s) => s.captureCurrent);
  const setManualDualReading = useScaleStore((s) => s.setManualDualReading);

  const { running, dropOnPan } = useSimulatedScale(targetMg);
  const { connectSerial, error: serialError } = useWebSerialScale();

  const [hydrated, setHydrated] = useState(false);
  const [jewellerInput, setJewellerInput] = useState("40.000");
  const [karigarInput, setKarigarInput] = useState("40.000");
  const [dualError, setDualError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleCapture = async () => {
    const mg = captureCurrent();
    if (mg === null) return;
    setSaving(true);
    try {
      await postScaleReading({
        weight_mg: mg,
        source,
        order_id: orderId,
        occurred_at: occurredAt,
      });
    } catch {
      // Allow offline / optimistic continuation
    } finally {
      setSaving(false);
      onCaptured?.(mg);
    }
  };

  const handleManualDualApply = () => {
    setDualError(null);
    try {
      const jMg = parseGramsToMg(jewellerInput);
      const kMg = parseGramsToMg(karigarInput);
      if (!setManualDualReading(jMg, kMg)) {
        setDualError("Both entries must match to the milligram.");
      }
    } catch {
      setDualError("Enter valid 3-decimal gram weights (e.g. 40.000).");
    }
  };

  return (
    <div
      id="step-s01-scale"
      data-testid="scale-widget"
      data-hydrated={hydrated ? "true" : "false"}
      style={{
        background: "var(--surface)",
        borderColor: "var(--hairline)",
        boxShadow: "var(--shadow-card)",
      }}
      className="rounded-3xl border p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p
            style={{
              color: "var(--ink-3)",
              letterSpacing: "var(--track-label)",
            }}
            className="text-xs font-semibold uppercase"
          >
            F-01 · Precision Balance Capture
          </p>
          <h2
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            className="mt-0.5 text-xl font-normal"
          >
            Weigh on pan — never typed
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2" data-testid="scale-status-pill">
          <SimLabel
            label={
              source === "serial"
                ? "Serial balance"
                : source === "manual_dual"
                  ? "Manual dual-entry fallback"
                  : "Simulated scale"
            }
          />
          {stable ? (
            <Pill tone="sealed">Stable</Pill>
          ) : running || currentMg > 0 ? (
            <Pill tone="pending">Settling…</Pill>
          ) : (
            <Pill tone="neutral">Pan empty</Pill>
          )}
        </div>
      </div>

      {/* Balance display + pan */}
      <div
        style={{
          background: "var(--surface-sunken)",
          borderColor: "var(--hairline-strong)",
        }}
        className="mt-4 flex flex-col items-center justify-between gap-4 rounded-2xl border p-5 sm:flex-row"
      >
        <div className="flex items-center gap-4">
          <m.button
            type="button"
            data-testid="scale-place-bar-btn"
            whileTap={reduced ? undefined : { scale: 0.97 }}
            transition={pick("press", reduced)}
            onClick={() => dropOnPan(targetMg)}
            aria-label={`Place ${itemLabel} on scale`}
            style={{
              background: "var(--gold-tint)",
              borderColor: "var(--gold-line)",
              color: "var(--gold-deep)",
            }}
            className="inline-flex min-h-[48px] items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-xs font-semibold shadow-xs"
          >
            <span
              aria-hidden="true"
              style={{ background: "var(--gold)" }}
              className="inline-block h-4 w-6 rounded-sm"
            />
            <span>Place {itemLabel}</span>
          </m.button>
        </div>

        <div className="text-right" data-testid="scale-readout-mg">
          <p style={{ color: "var(--ink-3)" }} className="text-[11px] uppercase">
            Live readout (EC-2: 3 readings ≤ 10 mg / 1.5 s)
          </p>
          <m.div
            key={currentMg}
            initial={reduced ? false : { opacity: 0.85 }}
            animate={{ opacity: 1 }}
            transition={pick("counter", reduced)}
            className="mt-0.5"
          >
            <GramFigure mg={currentMg} fineness={916} size="xl" />
          </m.div>
        </div>
      </div>

      {/* Source selector + Manual Dual fallback */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSource("simulated")}
            style={{
              background:
                source === "simulated" ? "var(--surface-raised)" : "transparent",
              borderColor: "var(--hairline)",
              color: "var(--ink-2)",
            }}
            className="min-h-[44px] rounded-full border px-3 py-1 font-medium"
          >
            Simulated
          </button>
          <button
            type="button"
            onClick={() => void connectSerial()}
            style={{
              background:
                source === "serial" ? "var(--surface-raised)" : "transparent",
              borderColor: "var(--hairline)",
              color: "var(--ink-2)",
            }}
            className="min-h-[44px] rounded-full border px-3 py-1 font-medium"
          >
            Web Serial
          </button>
          <button
            type="button"
            onClick={() => setSource("manual_dual")}
            style={{
              background:
                source === "manual_dual" ? "var(--surface-raised)" : "transparent",
              borderColor: "var(--hairline)",
              color: "var(--ink-2)",
            }}
            className="min-h-[44px] rounded-full border px-3 py-1 font-medium"
          >
            Dual-entry fallback
          </button>
        </div>

        <m.button
          type="button"
          data-testid="scale-capture-btn"
          disabled={!stable || saving}
          whileTap={reduced || !stable ? undefined : { scale: 0.97 }}
          transition={pick("press", reduced)}
          onClick={() => void handleCapture()}
          style={{
            background: stable ? "var(--accent)" : "var(--surface-sunken)",
            color: stable ? "var(--accent-foreground)" : "var(--ink-3)",
          }}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{capturedMg ? "Captured ✓" : "Capture"}</span>
        </m.button>
      </div>

      {serialError && (
        <p style={{ color: "var(--ink-3)" }} className="mt-2 text-xs">
          {serialError}
        </p>
      )}

      {source === "manual_dual" && (
        <div
          style={{
            background: "var(--surface-sunken)",
            borderColor: "var(--hairline)",
          }}
          className="mt-3 grid gap-3 rounded-2xl border p-3.5 sm:grid-cols-3"
        >
          <label className="text-xs">
            <span style={{ color: "var(--ink-2)" }} className="block font-medium">
              Suresh enters (g)
            </span>
            <input
              type="text"
              value={jewellerInput}
              onChange={(e) => setJewellerInput(e.target.value)}
              style={{
                background: "var(--surface)",
                borderColor: "var(--hairline-strong)",
                fontFamily: "var(--font-mono)",
              }}
              className="mt-1 min-h-[44px] w-full rounded-xl border px-3 text-sm"
            />
          </label>
          <label className="text-xs">
            <span style={{ color: "var(--ink-2)" }} className="block font-medium">
              Rafiq enters (g)
            </span>
            <input
              type="text"
              value={karigarInput}
              onChange={(e) => setKarigarInput(e.target.value)}
              style={{
                background: "var(--surface)",
                borderColor: "var(--hairline-strong)",
                fontFamily: "var(--font-mono)",
              }}
              className="mt-1 min-h-[44px] w-full rounded-xl border px-3 text-sm"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleManualDualApply}
              style={{
                background: "var(--accent)",
                color: "var(--accent-foreground)",
              }}
              className="min-h-[44px] w-full rounded-xl px-3 text-xs font-semibold"
            >
              Match both
            </button>
          </div>
          {dualError && (
            <p
              style={{ color: "var(--variance-flag)" }}
              className="text-xs sm:col-span-3"
            >
              {dualError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
