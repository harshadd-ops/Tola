"use client";

import { Button, Chip } from "@heroui/react";
import { CircleCheckFill, Microphone, Pencil } from "@gravity-ui/icons";
import { AgentNote } from "@/components/tola/AgentNote";
import { Gram } from "@/components/tola/Gram";
import { HashChip } from "@/components/tola/Chips";
import { Ticks } from "@/components/tola/Ticks";
import { S04_VOICE_NOTE } from "@/features/story/steps";
import { eventById } from "@/lib/story";
import { useStageLocal } from "@/stores/stage";
import { Line, Scene, useBeat } from "./Scene";
import { ScalePanel } from "./ScalePanel";

/**
 * Thursday: S04 return intake (F-04). The voice note fills order, note and tag; the weights come from the
 * scale. "The scale wins if they disagree" (EC-4).
 */
export function ReturnScene() {
  const { state, done, cue, perform, pending } = useBeat();
  const local = useStageLocal();
  const sealed = done("S04");
  const voiceIn = sealed || local.returnVoiceSent;
  const pieceMg = sealed ? 38120 : local.pieceMg;
  const scrapMg = sealed ? 500 : local.scrapMg;
  const r6 = eventById(state, "R6");
  const ready = voiceIn && pieceMg !== null && scrapMg !== null;

  return (
    <Scene
      eyebrow="Thu 15 Oct · Return at the counter · Lakshmi"
      title="Order #14 comes back"
      aside={<Ticks count={sealed ? 2 : 0} />}
      testId="scene-return"
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-4">
          {pieceMg === null ? (
            <ScalePanel
              key="piece"
              targetMg={38120}
              what="bangle pair"
              capturedMg={null}
              cue={cue("S04") && voiceIn}
              onCapture={(mg) => local.set({ pieceMg: mg })}
              testId="scale-piece"
            />
          ) : scrapMg === null ? (
            <ScalePanel
              key="scrap"
              targetMg={500}
              what="scrap"
              capturedMg={null}
              cue={cue("S04")}
              onCapture={(mg) => local.set({ scrapMg: mg })}
              testId="scale-scrap"
            />
          ) : (
            <div className="rounded-[20px] bg-[var(--bg-2)] p-5">
              <p className="t-label">Weighed on the scale</p>
              <Line label="Finished piece" hint="Bangle pair, no stones">
                <Gram mg={pieceMg} />
              </Line>
              <Line label="Scrap returned">
                <Gram mg={scrapMg} />
              </Line>
              <Line label="Dust credit">
                <Gram mg={0} tone="muted" />
              </Line>
              <Line label="Returned in all" strong testId="return-total">
                <Gram mg={pieceMg + scrapMg} size="lg" />
              </Line>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {voiceIn ? (
            <>
              <div className="rounded-[20px] border border-[var(--hairline-strong)] p-5">
                <p className="t-label flex items-center gap-2">
                  <Microphone width={14} height={14} /> Rafiq&apos;s voice note · Bengali
                </p>
                <p lang="bn" className="mt-2 text-[1.0625rem] leading-relaxed text-[var(--ink)]">
                  {S04_VOICE_NOTE.transcript}
                </p>
                <p className="mt-2 text-sm text-[var(--ink-3)]">{S04_VOICE_NOTE.en}</p>
              </div>
              <AgentNote agent="Intake">
                Order <b>#14</b>, note <b>“solder joint cracked, redone”</b>, tag <span className="font-mono">REWORK_SOLDER</span>. Weights are
                taken from the scale, not from the voice note.
              </AgentNote>
              {pieceMg !== null && (
                <Chip color="success" variant="soft" className="self-start" data-testid="scale-matches-voice">
                  <CircleCheckFill width={14} height={14} />
                  <Chip.Label>Scale matches voice: 38.120 g</Chip.Label>
                </Chip>
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-start justify-center gap-2 rounded-[20px] border border-dashed border-[var(--hairline-strong)] p-6">
              <Microphone width={20} height={20} className="text-[var(--ink-3)]" />
              <p className="text-sm font-medium text-[var(--ink)]">Waiting for Rafiq&apos;s voice note</p>
              <p className="text-sm text-[var(--ink-3)]">He sends it from his phone as he hands the piece over.</p>
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
            {sealed ? (
              <>
                <p className="text-sm text-[var(--ink-2)]">Return and scrap recorded, both signed.</p>
                {r6 && <HashChip hash={r6.hash} label="R6" />}
              </>
            ) : (
              <Button
                size="lg"
                isDisabled={!ready || pending}
                onPress={() => void perform("S04")}
                className={cue("S04") && ready ? "cue" : ""}
                data-testid="sign-return"
              >
                <Pencil />
                Sign return as Lakshmi
              </Button>
            )}
          </div>
        </div>
      </div>
    </Scene>
  );
}
