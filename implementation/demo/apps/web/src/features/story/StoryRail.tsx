"use client";

import { Button, Dropdown, Kbd, Label, Tooltip } from "@heroui/react";
import { ArrowLeft, ArrowRight, ArrowRotateLeft, CircleInfo, Ellipsis, TextAlignLeft } from "@gravity-ui/icons";
import { m } from "motion/react";
import { spring } from "@/lib/springs";
import { useStoryStore } from "@/stores/story";
import { CHAPTERS, STORY_STEPS, getStepByIndex } from "./steps";
import { useStoryNav, useStoryState } from "./useStory";

/**
 * The story rail (DESIGN §14.2, DEMO_SPEC §6): a floating translucent bar at the bottom of /stage.
 * Back · progress grouped by day · Next. Next performs the current beat if it has not happened yet.
 */
export function StoryRail() {
  const stepIndex = useStoryStore((s) => s.stepIndex);
  const showLine = useStoryStore((s) => s.showLine);
  const toggleLine = useStoryStore((s) => s.toggleLine);
  const setShowRealVsMocked = useStoryStore((s) => s.setShowRealVsMocked);
  const setShowClosing = useStoryStore((s) => s.setShowClosing);
  const { data: state } = useStoryState();
  const nav = useStoryNav();
  const ready = useStoryStore((s) => s.ready);
  const step = getStepByIndex(stepIndex);
  const last = stepIndex === STORY_STEPS.length - 1;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
      data-testid="story-rail"
      data-ready={ready}
    >
      <div className="material-nav pointer-events-auto flex w-full max-w-[1180px] flex-col gap-2 rounded-[28px] border border-[var(--hairline-strong)] px-3 py-2.5 shadow-[var(--shadow-surface)]">
        {showLine && (
          <p className="px-3 pt-0.5 text-[13px] text-[var(--ink-2)]" data-testid="presenter-line">
            <span className="mr-2 font-mono text-[10px] tracking-wide text-[var(--ink-3)] uppercase">Say</span>
            {step.line}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Tooltip delay={300}>
            <Button isIconOnly variant="secondary" aria-label="Back" onPress={() => void nav.back()} isDisabled={stepIndex === 0} data-testid="rail-back">
              <ArrowLeft />
            </Button>
            <Tooltip.Content>
              Back <Kbd>←</Kbd>
            </Tooltip.Content>
          </Tooltip>

          <nav aria-label="Story progress" className="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
            <ol className="flex flex-1 items-center gap-2.5">
              {CHAPTERS.map((ch) => {
                const steps = STORY_STEPS.filter((s) => s.chapter === ch.id);
                const active = step.chapter === ch.id;
                return (
                  <li key={ch.id} className={`flex min-w-0 flex-col gap-1 ${active ? "flex-[1.6]" : "flex-1"}`}>
                    <span
                      className={`truncate font-mono text-[10px] tracking-wide uppercase ${
                        active ? "text-[var(--ink)]" : "text-[var(--ink-3)]"
                      }`}
                    >
                      {ch.label}
                    </span>
                    <span className="flex gap-1">
                      {steps.map((s) => {
                        const isDone = !!state?.done.includes(s.id);
                        const isHere = s.index === stepIndex;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => void nav.goTo(s.index)}
                            aria-label={`${s.id}: ${s.title}`}
                            aria-current={isHere ? "step" : undefined}
                            data-testid={`rail-step-${s.id}`}
                            className="group relative h-6 flex-1 cursor-pointer"
                          >
                            <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-[var(--hairline-strong)] transition-[height] group-hover:h-2">
                              <m.span
                                className="absolute inset-y-0 left-0 rounded-full bg-[var(--ink)]"
                                initial={false}
                                animate={{ width: isDone ? "100%" : isHere ? "35%" : "0%" }}
                                transition={spring.default}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex min-w-0 flex-1 flex-col sm:hidden lg:flex lg:w-[300px] lg:flex-none">
            <span className="truncate font-mono text-[11px] text-[var(--ink-3)]" data-testid="rail-step-id">
              {step.id} · {step.day} {step.timeLabel}
            </span>
            <span className="truncate text-sm font-medium text-[var(--ink)]" data-testid="rail-step-title">
              {step.title}
            </span>
          </div>

          <Dropdown>
            <Button isIconOnly variant="ghost" aria-label="More story controls" data-testid="rail-more">
              <Ellipsis />
            </Button>
            <Dropdown.Popover placement="top end">
              <Dropdown.Menu
                aria-label="Story controls"
                onAction={(key) => {
                  if (key === "replay") void nav.replay();
                  if (key === "reset") void nav.resetWeek();
                  if (key === "line") toggleLine();
                  if (key === "real") setShowRealVsMocked(true);
                }}
              >
                <Dropdown.Item id="replay" textValue="Replay this beat">
                  <ArrowRotateLeft />
                  <Label>Replay this beat</Label>
                  <Kbd slot="keyboard">R</Kbd>
                </Dropdown.Item>
                <Dropdown.Item id="reset" textValue="Reset the week">
                  <ArrowRotateLeft />
                  <Label>Reset the week</Label>
                  <Kbd slot="keyboard">⇧R</Kbd>
                </Dropdown.Item>
                <Dropdown.Item id="line" textValue="Presenter line">
                  <TextAlignLeft />
                  <Label>{showLine ? "Hide" : "Show"} presenter line</Label>
                  <Kbd slot="keyboard">N</Kbd>
                </Dropdown.Item>
                <Dropdown.Item id="real" textValue="What is real, what is simulated">
                  <CircleInfo />
                  <Label>What is real, what is simulated</Label>
                  <Kbd slot="keyboard">?</Kbd>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          <Button
            size="lg"
            onPress={() => void nav.next().then(() => last && setShowClosing(true))}
            isDisabled={!ready}
            data-testid="rail-next"
          >
            {last ? "Finish" : "Next"}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
