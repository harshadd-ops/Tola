"use client";

import { useEffect, useRef } from "react";
import NextLink from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Button, Chip, Spinner } from "@heroui/react";
import { CircleInfo, Xmark } from "@gravity-ui/icons";
import { PhoneFrame } from "@/components/tola/Devices";
import { LinkButton } from "@/components/tola/LinkButton";
import { ThemeToggle } from "@/components/tola/ThemeToggle";
import { TolaWordmark } from "@/components/tola/TolaMark";
import { IssueScene } from "@/features/console/IssueScene";
import { GstScene, LedgerScene, LenderScene, PassportScene } from "@/features/console/ProofScenes";
import { ReturnScene } from "@/features/console/ReturnScene";
import { SettleScene } from "@/features/console/SettleScene";
import { WeekScene } from "@/features/console/WeekScene";
import { KarigarPhone } from "@/features/karigar/KarigarPhone";
import { reducedFade, spring } from "@/lib/springs";
import { useStoryStore } from "@/stores/story";
import { Closing } from "./Closing";
import { RealVsMocked } from "./RealVsMocked";
import { CHAPTERS, STORY_STEPS, getStepByIndex, type StoryStepDef } from "./steps";
import { StoryRail } from "./StoryRail";
import { useAutoAdvance, useStoryNav, useStoryState } from "./useStory";
import { useStoryKeys } from "./useStoryKeys";

function sceneFor(step: StoryStepDef) {
  switch (step.id) {
    case "S01":
    case "S02":
    case "S03":
      return { key: "issue", node: <IssueScene /> };
    case "S04":
      return { key: "return", node: <ReturnScene /> };
    case "S05":
    case "S06":
    case "S07":
      return { key: "week", node: <WeekScene /> };
    case "S08":
    case "S09":
      return { key: "settle", node: <SettleScene /> };
    case "S10":
      return { key: "passport", node: <PassportScene /> };
    case "S11":
      return { key: "lender", node: <LenderScene /> };
    case "S12":
      return { key: "gst", node: <GstScene /> };
    default:
      return { key: "ledger", node: <LedgerScene /> };
  }
}

/**
 * /stage: the 3-minute story (DEMO_SPEC §3, §10). Console on the left, Rafiq's phone on the right,
 * the story rail at the bottom. No login; every number comes from the API.
 */
export function Stage() {
  const stepIndex = useStoryStore((s) => s.stepIndex);
  const hydrate = useStoryStore((s) => s.hydrate);
  const setShowRealVsMocked = useStoryStore((s) => s.setShowRealVsMocked);
  const { data: state, isError, refetch } = useStoryState(true);
  const reduced = useReducedMotion();
  const step = getStepByIndex(stepIndex);
  const scene = sceneFor(step);
  const chapter = CHAPTERS.find((c) => c.id === step.chapter)!;
  const nav = useStoryNav();
  const synced = useRef(false);
  const ready = useStoryStore((s) => s.ready);
  const setReady = useStoryStore((s) => s.setReady);
  useStoryKeys();
  useAutoAdvance(state);

  useEffect(() => hydrate(), [hydrate]);

  // A new surface starts at the top (spatial consistency: the scene slides in whole).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [scene.key, reduced]);

  // On load, line the server up with the beat on screen (?step=S05 wins, else the remembered beat).
  // Reload after a crash keeps server progress when it already matches (DEMO_SPEC §9).
  useEffect(() => {
    if (synced.current || !state) return;
    synced.current = true;
    const param = new URLSearchParams(window.location.search).get("step");
    const fromUrl = param ? STORY_STEPS.findIndex((s) => s.id === param.toUpperCase()) : -1;
    const target = fromUrl >= 0 ? fromUrl : useStoryStore.getState().stepIndex;
    const doneCount = state.done.length;
    if (fromUrl >= 0 || (doneCount !== target && doneCount !== target + 1)) {
      void nav.goTo(target).finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [nav, state, setReady]);

  useEffect(() => () => setReady(false), [setReady]);

  return (
    <div className="relative min-h-dvh overflow-x-clip pb-40">
      <div className="arc-light arc-light--stage" aria-hidden="true" />

      <header className="material-nav sticky top-0 z-30 border-b border-[var(--hairline)]">
        <div className="mx-auto flex h-16 max-w-[1520px] items-center gap-4 px-5 lg:px-8">
          <NextLink href="/" aria-label="Tola home">
            <TolaWordmark compact />
          </NextLink>
          <span className="hidden h-5 w-px bg-[var(--hairline-strong)] md:block" />
          <div className="hidden min-w-0 md:block">
            <p className="font-mono text-[11px] tracking-wide text-[var(--ink-3)] uppercase">
              {chapter.day} · {step.timeLabel} · {chapter.label}
            </p>
            <p className="truncate text-sm text-[var(--ink-2)]" data-testid="stage-cue">
              {step.cue}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Chip size="sm" variant="secondary" className="hidden sm:inline-flex">
              <Chip.Label>No login · demo keys</Chip.Label>
            </Chip>
            <Button variant="ghost" size="sm" onPress={() => setShowRealVsMocked(true)} data-testid="open-real-vs-mocked">
              <CircleInfo />
              Real vs simulated
            </Button>
            <ThemeToggle />
            <LinkButton href="/jeweller" variant="ghost" size="sm" className="hidden lg:inline-flex">
              <Xmark />
              Explore freely
            </LinkButton>
          </div>
        </div>
      </header>

      <main id="main-content" className="relative z-10 mx-auto max-w-[1520px] px-5 pt-6 lg:px-8">
        {isError && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--hairline-strong)] bg-[var(--card)] px-4 py-3 text-sm">
            <span>Reconnecting to the Tola API on port 8000…</span>
            <Button size="sm" variant="secondary" onPress={() => void refetch()}>
              Retry
            </Button>
          </div>
        )}
        <div className="grid items-start gap-8 min-[1180px]:grid-cols-[minmax(0,1fr)_auto]">
          <div
            className="min-w-0 transition-opacity duration-300"
            style={{ opacity: step.focus === "phone" ? 0.62 : 1 }}
            data-testid="stage-console"
          >
            {!state || !ready ? (
              <div className="flex h-80 items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={scene.key}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -32 }}
                  transition={reduced ? reducedFade : spring.default}
                >
                  {scene.node}
                </m.div>
              </AnimatePresence>
            )}
          </div>
          <div className="flex justify-center min-[1180px]:sticky min-[1180px]:top-24" data-testid="stage-phone">
            <PhoneFrame time={step.timeLabel}>{state && ready ? <KarigarPhone /> : null}</PhoneFrame>
          </div>
        </div>
      </main>

      <StoryRail />
      <RealVsMocked />
      <Closing />
    </div>
  );
}
