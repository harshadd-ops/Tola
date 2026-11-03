"use client";

import { useEffect } from "react";
import { Button, Chip } from "@heroui/react";
import { CircleCheckFill, PlugConnection, ScalesBalanced } from "@gravity-ui/icons";
import { Gram } from "@/components/tola/Gram";
import { SimChip } from "@/components/tola/Chips";
import { useSimulatedScale } from "@/features/scale/useSimulatedScale";
import { useWebSerialScale } from "@/features/scale/useWebSerialScale";
import { useScaleStore } from "@/stores/scale";

/**
 * F-01 Precision balance capture. The figure comes from the scale and is never typed (EC-2: three readings
 * within 10 mg over 1.5 s before Capture unlocks). Simulated by default; a USB balance works through Web Serial.
 */
export function ScalePanel({
  targetMg,
  what,
  capturedMg,
  onCapture,
  cue,
  testId = "scale",
}: {
  targetMg: number;
  /** What sits on the pan, e.g. "40.000 g 22K bar". */
  what: string;
  /** Set once this reading is part of the record (from the server, or from this beat). */
  capturedMg: number | null;
  onCapture: (mg: number) => void;
  cue: boolean;
  testId?: string;
}) {
  const { currentMg, stable, source, resetScale } = useScaleStore();
  const { dropOnPan, running } = useSimulatedScale(targetMg);
  const serial = useWebSerialScale();

  useEffect(() => {
    resetScale();
  }, [resetScale, targetMg]);

  const locked = capturedMg !== null;
  const shownMg = locked ? capturedMg : currentMg;
  const onPan = shownMg > 0;
  const status = locked ? "Captured" : !onPan ? "Pan empty" : stable ? "Stable" : "Settling";

  return (
    <div className="rounded-[20px] bg-[var(--bg-2)] p-5" data-testid={testId}>
      <div className="flex items-center justify-between gap-3">
        <span className="t-label">Live reading</span>
        <div className="flex items-center gap-2">
          {source === "serial" ? (
            <Chip size="sm" color="success" variant="soft">
              <Chip.Label>Serial balance</Chip.Label>
            </Chip>
          ) : (
            <SimChip>Simulated scale</SimChip>
          )}
          <Chip
            size="sm"
            variant={stable || locked ? "soft" : "secondary"}
            color={locked || stable ? "success" : "default"}
            data-testid={`${testId}-status`}
          >
            {locked && <CircleCheckFill width={12} height={12} />}
            <Chip.Label>{status}</Chip.Label>
          </Chip>
        </div>
      </div>

      <div className="mt-5 flex min-h-[72px] items-end justify-between gap-4">
        <div className={onPan && !stable && !locked ? "opacity-60" : ""} data-testid={`${testId}-readout`}>
          <Gram mg={shownMg} size="xl" fine={onPan ? 916 : undefined} />
        </div>
        <ScalesBalanced width={40} height={40} className="mb-1 shrink-0 text-[var(--hairline-strong)]" />
      </div>
      {locked || stable ? (
        <div className="mt-3 h-px w-full bg-[var(--gold-line)]" aria-hidden="true" />
      ) : (
        <div className="mt-3 h-px w-full bg-[var(--hairline-strong)]" aria-hidden="true" />
      )}

      {!locked && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onPress={() => dropOnPan(targetMg)}
            isDisabled={running}
            className={cue && !onPan ? "cue" : ""}
            data-testid={`${testId}-place`}
          >
            Place {what}
          </Button>
          <Button
            variant="primary"
            isDisabled={!stable}
            onPress={() => onCapture(currentMg)}
            className={cue && stable ? "cue" : ""}
            data-testid={`${testId}-capture`}
          >
            Capture
          </Button>
          <Button variant="ghost" size="sm" onPress={() => void serial.connectSerial()} className="ml-auto">
            <PlugConnection />
            USB balance
          </Button>
        </div>
      )}
      {serial.error && <p className="mt-2 text-xs text-[var(--ink-3)]">{serial.error}</p>}
    </div>
  );
}
