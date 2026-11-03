"use client";

import { m, useReducedMotion } from "motion/react";
import { CircleCheckFill, VolumeFill } from "@gravity-ui/icons";
import { Gram } from "@/components/tola/Gram";
import { Ticks } from "@/components/tola/Ticks";
import { S03_READBACK } from "@/features/story/steps";
import { spring } from "@/lib/springs";

/**
 * Hero composition (DESIGN §14.1): the jeweller's console card and the karigar's phone, fanned in front of the
 * light arc. Both show the same gram, the moment it is signed twice. Built from the real components.
 */
export function HeroDevices() {
  const reduced = useReducedMotion();
  return (
    <div className="relative mx-auto h-[540px] w-full max-w-[540px]" aria-hidden="true">
      <m.div
        className="absolute top-16 left-0 hidden w-[290px] rounded-[28px] sm:block border border-[var(--hairline-strong)] bg-[var(--card)] p-5 shadow-[var(--shadow-surface)]"
        initial={reduced ? false : { opacity: 0, x: -24, rotate: -6 }}
        animate={{ opacity: 1, x: 0, rotate: -4 }}
        transition={spring.gentle}
      >
        <p className="t-label">Shetty Jewellers · Issue</p>
        <p className="mt-1 text-sm font-semibold text-[var(--ink)]">Order #14 · Rafiq Sheikh</p>
        <div className="mt-4 rounded-2xl bg-[var(--bg-2)] p-4">
          <p className="text-xs text-[var(--ink-3)]">From the scale</p>
          <Gram mg={40000} size="lg" fine={916} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[var(--ink-3)]">Wastage agreed 2.50%</span>
          <Ticks count={2} />
        </div>
      </m.div>

      <m.div
        className="absolute top-0 right-1/2 h-[540px] w-[268px] translate-x-1/2 rounded-[44px] sm:right-0 sm:translate-x-0 bg-[#111114] p-[9px] shadow-[var(--shadow-device)]"
        initial={reduced ? false : { opacity: 0, y: 24, rotate: 4 }}
        animate={{ opacity: 1, y: 0, rotate: 3 }}
        transition={{ ...spring.gentle, delay: 0.08 }}
      >
        <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[36px] bg-[var(--bg)] px-4 pt-10">
          <span className="absolute top-[18px] left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-[#111114]" />
          <p lang="bn" className="text-sm font-semibold text-[var(--ink)]">
            রফিক শেখ
          </p>
          <div className="rounded-[18px] border border-[var(--hairline-strong)] bg-[var(--card)] p-3.5">
            <p lang="bn" className="text-xs font-semibold text-[var(--ink)]">
              নতুন চালান · অর্ডার 14
            </p>
            <div className="mt-2">
              <Gram mg={40000} size="lg" />
            </div>
          </div>
          <div className="rounded-[18px] bg-[var(--bg-2)] p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--indigo-700)]">
              <VolumeFill width={12} height={12} /> Read back in Bengali
            </p>
            <p lang="bn" className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-[var(--ink)]">
              {S03_READBACK.text}
            </p>
          </div>
          <div className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--slate)] text-sm font-medium text-[var(--accent-foreground)]">
            <CircleCheckFill width={16} height={16} />
            <span lang="bn">হ্যাঁ, ঠিক আছে</span>
          </div>
          <div className="flex items-center justify-center pt-1">
            <Ticks count={2} />
          </div>
        </div>
      </m.div>
    </div>
  );
}
