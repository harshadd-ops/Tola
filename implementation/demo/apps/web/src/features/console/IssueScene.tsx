"use client";

import { Avatar, Button, Chip } from "@heroui/react";
import { Clock, Pencil } from "@gravity-ui/icons";
import { Gram } from "@/components/tola/Gram";
import { HashChip } from "@/components/tola/Chips";
import { Ticks } from "@/components/tola/Ticks";
import { eventById, order14 } from "@/lib/story";
import { Line, Scene, useBeat } from "./Scene";
import { ScalePanel } from "./ScalePanel";

/** Monday: S01 scale capture, S02 Suresh signs the issue, S03 waits for Rafiq's haan (F-01, F-02, F-03). */
export function IssueScene() {
  const { state, done, cue, perform, pending } = useBeat();
  const order = order14(state);
  const r5 = eventById(state, "R5");
  const sigs = (r5 ? Number(r5.jeweller_signed) + Number(r5.karigar_signed) : 0) as 0 | 1 | 2;
  const capturedMg = done("S01") ? (state?.scale_readings["SR-S01"] ?? 40000) : null;

  return (
    <Scene
      eyebrow="Mon 12 Oct · Issue to karigar"
      title="Issue gold for Order #14"
      aside={<Ticks count={sigs} waitingFor={sigs === 1 ? "Rafiq" : undefined} />}
      testId="scene-issue"
    >
      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <ScalePanel
          targetMg={40000}
          what="40 g bar"
          capturedMg={capturedMg}
          cue={cue("S01")}
          onCapture={() => void perform("S01")}
        />

        <div className="flex flex-col rounded-[20px] border border-[var(--hairline-strong)] p-5" data-testid="issue-card">
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <Avatar.Fallback>RS</Avatar.Fallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--ink)]">
                Rafiq Sheikh <span lang="bn" className="font-normal text-[var(--ink-3)]">· রফিক শেখ</span>
              </p>
              <p className="text-xs text-[var(--ink-3)]">Karigar · plain and studded work · hears read-backs in Bengali</p>
            </div>
          </div>

          <div className="mt-4">
            <Line label="Order #14" hint={order?.title ?? "Bangle pair, plain"}>
              <Chip size="sm" variant="secondary">
                <Chip.Label>916 (22K) declared</Chip.Label>
              </Chip>
            </Line>
            <Line label="Gross issued" hint="From the scale, never typed">
              {capturedMg !== null ? <Gram mg={capturedMg} fine={916} /> : <span className="text-sm text-[var(--ink-3)]">Waiting for scale</span>}
            </Line>
            <Line label="Agreed wastage" hint="Plain work, 2.50% of gross, agreed before work starts">
              <Gram mg={order?.allowed_mg ?? 1000} />
            </Line>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
            {sigs === 0 ? (
              <Button
                size="lg"
                isDisabled={!done("S01") || pending}
                onPress={() => void perform("S02")}
                className={cue("S02") ? "cue" : ""}
                data-testid="sign-issue"
              >
                <Pencil />
                Sign as Suresh
              </Button>
            ) : sigs === 1 ? (
              <Chip color="warning" variant="soft" data-testid="issue-waiting">
                <Clock width={14} height={14} />
                <Chip.Label>Sent to Rafiq&apos;s phone · waiting for his yes</Chip.Label>
              </Chip>
            ) : (
              <p className="text-sm text-[var(--ink-2)]" data-testid="issue-sealed">
                Both signed. This line can&apos;t be changed now.
              </p>
            )}
            {r5 && sigs === 2 && <HashChip hash={r5.hash} label="R5" />}
          </div>
        </div>
      </div>
    </Scene>
  );
}
