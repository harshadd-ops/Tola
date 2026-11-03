"use client";

import { useSyncExternalStore } from "react";
import { PhoneFrame } from "@/components/tola/Devices";
import { LinkButton } from "@/components/tola/LinkButton";
import { KarigarPhone } from "@/features/karigar/KarigarPhone";
import { getStepByIndex } from "@/features/story/steps";
import { useStoryState } from "@/features/story/useStory";

const PHONE_QUERY = "(max-width: 639px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * /karigar: Rafiq's phone outside the stage. On a real phone it fills the screen; on a laptop it sits in the
 * frame. It follows the server, so a phone on the same Wi-Fi mirrors the stage within a second (DEMO_SPEC §6).
 */
export function KarigarMirror() {
  const { data } = useStoryState(true);
  const onPhone = useSyncExternalStore(subscribe, () => window.matchMedia(PHONE_QUERY).matches, () => false);
  const step = getStepByIndex(Math.min(data?.done.length ?? 0, 12));
  if (onPhone) return data ? <KarigarPhone followServer /> : null;
  return (
    <>
      <div className="mx-auto flex max-w-[1240px] items-center gap-16 px-6 py-14">
        <div className="max-w-sm">
          <p className="t-label">Rafiq Sheikh · karigar</p>
          <h1 className="t-section mt-2">His copy of the record, in Bengali.</h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink-3)]">
            Every number is read back to him and nothing is recorded until he says haan. Open this page on a real Android
            phone on the same Wi-Fi to mirror the stage live.
          </p>
          <p className="mt-4 font-mono text-xs text-[var(--ink-3)]">
            Next on the ledger: {step.id} · {step.title}
          </p>
          <LinkButton href="/stage" className="mt-6">
            Play the week
          </LinkButton>
        </div>
        <PhoneFrame time={step.timeLabel}>{data ? <KarigarPhone followServer /> : null}</PhoneFrame>
      </div>
    </>
  );
}
