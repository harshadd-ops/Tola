"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Link2,
  Mic,
  Pause,
  Play,
  Scale,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";
import { ArcLight } from "@/components/brand/ArcLight";
import { TolaMark } from "@/components/brand/TolaMark";
import { PhoneFrame } from "@/components/device/PhoneFrame";
import { GramFigure } from "@/components/ui/GramFigure";
import { HashBadge } from "@/components/ui/HashBadge";
import { Pill } from "@/components/ui/Pill";
import { TickPair } from "@/components/ui/TickPair";
import { MaskHeadline, Reveal, RevealGroup, RevealItem } from "@/motion/primitives";

const TICKER_EVENTS = [
  {
    code: "R5 · ISSUE_GOLD",
    order: "Order #14",
    grams: "40.000 g (916‰)",
    actor: "Suresh → Rafiq",
    sigs: "2 of 2 ✓✓",
    hash: "a3f9bc2188e104d2",
  },
  {
    code: "R6 · RETURN_ORNAMENT",
    order: "Order #14",
    grams: "38.120 g (916‰)",
    actor: "Rafiq → Suresh",
    sigs: "2 of 2 ✓✓",
    hash: "77c0994ab12e3f08",
  },
  {
    code: "R7 · RETURN_SCRAP",
    order: "Order #14",
    grams: "0.500 g (916‰)",
    actor: "Rafiq → Suresh",
    sigs: "2 of 2 ✓✓",
    hash: "81d4502fe993bc10",
  },
  {
    code: "E-14-5 · DISPUTE_OPEN",
    order: "Order #14",
    grams: "+0.380 g variance",
    actor: "Rafiq (Bengali voice)",
    sigs: "Flagged ⚑",
    hash: "e29b60f112ca9d44",
  },
  {
    code: "E-14-6 · DISPUTE_RESOLVE",
    order: "Order #14",
    grams: "+0.130 g allowance",
    actor: "Suresh + Rafiq",
    sigs: "2 of 2 ✓✓",
    hash: "94f2d11038ac7e12",
  },
  {
    code: "E-14-7 · SETTLEMENT_SEAL",
    order: "Week 2026-W42",
    grams: "₹2,870 net · 0.000 g bal",
    actor: "Shetty Fine × Rafiq",
    sigs: "2 of 2 ✓✓",
    hash: "c40178ab55209f33",
  },
] as const;

function FiligreeDivider() {
  return (
    <div
      className="mx-auto my-2 flex max-w-[1152px] items-center justify-center gap-3 px-6"
      aria-hidden="true"
    >
      <div
        style={{ background: "var(--hairline-strong)" }}
        className="h-px flex-1"
      />
      <svg width="84" height="14" viewBox="0 0 84 14" fill="none">
        <path
          d="M2 7C14 7 18 2 28 2C38 2 46 12 56 12C66 12 70 7 82 7"
          stroke="var(--gold-deep)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.65"
        />
        <circle cx="28" cy="7" r="1.75" fill="var(--gold-deep)" />
        <circle cx="42" cy="7" r="2.25" fill="var(--gold)" />
        <circle cx="56" cy="7" r="1.75" fill="var(--gold-deep)" />
      </svg>
      <div
        style={{ background: "var(--hairline-strong)" }}
        className="h-px flex-1"
      />
    </div>
  );
}

export default function HomePage() {
  const [tickerPaused, setTickerPaused] = useState(false);
  const t = useTranslations("landing");

  return (
    <div
      style={{ background: "var(--bg)", color: "var(--ink)" }}
      className="relative min-h-screen overflow-x-hidden"
      data-testid="landing-page"
    >
      {/* Top Announcement Bar */}
      <div
        style={{
          background: "var(--surface-sunken)",
          borderBottomColor: "var(--hairline)",
        }}
        className="border-b px-4 py-2 text-center"
      >
        <div className="mx-auto flex max-w-[1152px] flex-wrap items-center justify-center gap-2 text-xs">
          <span
            style={{
              background: "var(--gold-tint)",
              borderColor: "var(--gold-hairline)",
              color: "var(--gold-deep)",
            }}
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          >
            <span className="live-dot" aria-hidden="true" />
            Tech4Bharat · GAVS 2026
          </span>
          <span style={{ color: "var(--ink-2)" }} className="font-medium">
            Theme 2 Jeweltech · Problem Statement 2.2 — Unorganized Accounting &amp; Karigar Ledger Management
          </span>
          <Link
            href="/stage"
            style={{ color: "var(--indigo-800)" }}
            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold underline decoration-1 underline-offset-4"
          >
            <span>Jump to 13-step interactive stage</span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
        <ArcLight />

        <div className="relative z-10 mx-auto max-w-[1152px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Editorial Column */}
            <div className="lg:col-span-7">
              <Reveal>
                <div className="eyebrow-pill mb-5">
                  <Sparkles
                    style={{ color: "var(--gold-deep)" }}
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  <span>{t("eyebrow")}</span>
                </div>
              </Reveal>

              <MaskHeadline
                text={t("headline")}
                as="h1"
                className="font-display text-4xl font-normal tracking-tight sm:text-6xl lg:text-[4.15rem] lg:leading-[1.03]"
              />

              <Reveal delay={0.12}>
                <p
                  style={{ color: "var(--ink-2)" }}
                  className="mt-5 max-w-[36rem] text-lg leading-relaxed sm:text-xl"
                >
                  {t("subheadline")}
                </p>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <Link
                    href="/stage"
                    data-testid="landing-cta-stage"
                    style={{
                      background: "var(--slate)",
                      color: "var(--surface-elevated)",
                      boxShadow: "var(--shadow-card)",
                    }}
                    className="inline-flex min-h-12 items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold transition-transform active:scale-[0.98]"
                  >
                    <span>{t("ctaPlay")}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>

                  <Link
                    href="/jeweller"
                    data-testid="landing-cta-jeweller"
                    style={{
                      background: "var(--surface-elevated)",
                      borderColor: "var(--hairline-strong)",
                      color: "var(--ink)",
                    }}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors"
                  >
                    <span>{t("ctaJeweller")}</span>
                  </Link>

                  <Link
                    href="/ledger"
                    style={{ color: "var(--ink-2)" }}
                    className="inline-flex min-h-12 items-center gap-1.5 px-3 py-2 font-mono text-xs font-semibold underline decoration-1 underline-offset-4"
                  >
                    <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t("ctaLedger")}</span>
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.28}>
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <Pill tone="gold">Scale-captured (integer mg)</Pill>
                  <Pill tone="neutral">বাংলা · हिंदी · ಕನ್ನಡ</Pill>
                  <Pill tone="sealed">Signed twice (Ed25519)</Pill>
                  <Pill tone="neutral">Weekly AI check (Lyzr)</Pill>
                </div>
              </Reveal>
            </div>

            {/* Right Dual Fanned Phone Preview */}
            <div className="relative lg:col-span-5">
              <Reveal delay={0.18}>
                <div className="relative mx-auto flex max-w-[440px] flex-col items-center gap-4 sm:block sm:h-[600px]">
                  {/* Back Card: Jeweller Console Summary */}
                  <div
                    style={{
                      background: "var(--surface-elevated)",
                      borderColor: "var(--hairline-strong)",
                      boxShadow: "var(--shadow-device)",
                    }}
                    className="w-full rounded-[28px] border p-4 sm:absolute sm:top-4 sm:-left-6 sm:w-[270px] sm:-rotate-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b pb-2.5" style={{ borderBottomColor: "var(--hairline)" }}>
                      <div>
                        <p
                          style={{ color: "var(--ink-3)" }}
                          className="font-mono text-[10px] font-semibold uppercase"
                        >
                          Suresh Shetty · Jeweller
                        </p>
                        <p className="text-xs font-semibold">
                          Order #14 · Issue Draft
                        </p>
                      </div>
                      <Pill tone="gold">22K · 916‰</Pill>
                    </div>
                    <div
                      style={{
                        background: "var(--surface-sunken)",
                        borderColor: "var(--hairline)",
                      }}
                      className="mt-3 rounded-2xl border p-3"
                    >
                      <p style={{ color: "var(--ink-3)" }} className="text-[11px]">
                        Scale Reading (Stable 800 ms)
                      </p>
                      <div className="mt-1">
                        <GramFigure mg={40_000} fineness={916} showFine size="md" />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span style={{ color: "var(--ink-3)" }}>Wastage norm</span>
                      <span className="font-mono font-semibold">2.50% (1.000 g)</span>
                    </div>
                  </div>

                  {/* Front Phone: Rafiq Karigar Companion */}
                  <div className="w-full sm:absolute sm:top-10 sm:right-0 sm:w-[310px] sm:rotate-2">
                    <PhoneFrame
                      clock="Mon · 10:03 AM"
                      personaName="Rafiq Sheikh"
                      langTag="বাংলা · BN"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            style={{ color: "var(--gold-deep)" }}
                            className="font-mono text-[10px] font-semibold uppercase"
                          >
                            ORDER #14 · CHALLAN R5
                          </span>
                          <TickPair count={2} />
                        </div>

                        <div
                          style={{
                            background: "var(--surface-sunken)",
                            borderColor: "var(--hairline)",
                          }}
                          className="flex items-baseline justify-between rounded-xl border px-3 py-2"
                        >
                          <span style={{ color: "var(--ink-3)" }} className="text-xs">
                            Issued (22K)
                          </span>
                          <GramFigure mg={40_000} fineness={916} size="md" />
                        </div>

                        <div
                          style={{
                            background: "var(--gold-tint)",
                            borderColor: "var(--gold-hairline)",
                          }}
                          className="rounded-xl border p-2.5"
                        >
                          <div
                            style={{ color: "var(--gold-deep)" }}
                            className="flex items-center gap-1.5 text-[11px] font-semibold"
                          >
                            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Sarvam Bulbul v2 · Bengali</span>
                          </div>
                          <p className="mt-1 font-bengali text-xs leading-relaxed">
                            “অর্ডার চোদ্দ · চল্লিশ দশমিক শূন্য শূন্য গ্রাম বাইশ ক্যারেট সোনা।”
                          </p>
                        </div>

                        <div
                          style={{
                            background: "var(--tick-sealed-bg)",
                            borderColor: "var(--tick-sealed)",
                            color: "var(--tick-sealed)",
                          }}
                          className="flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 font-mono text-[11px] font-semibold"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>হ্যাঁ · Both signed · sha256:a3f9…d2</span>
                        </div>
                      </div>
                    </PhoneFrame>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* At a Glance 4-Column Hairline Strip */}
          <Reveal delay={0.32}>
            <div
              style={{
                background: "var(--surface-elevated)",
                borderColor: "var(--hairline-strong)",
                boxShadow: "var(--shadow-sm)",
              }}
              className="mt-14 grid gap-4 rounded-3xl border p-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="sm:border-r sm:pr-4" style={{ borderColor: "var(--hairline)" }}>
                <p
                  style={{ color: "var(--ink-3)" }}
                  className="font-mono text-[11px] uppercase"
                >
                  Problem Statement
                </p>
                <p className="mt-1 text-sm font-semibold">
                  PS 2.2 · Karigar Ledger &amp; Job-Work
                </p>
              </div>
              <div className="lg:border-r lg:pr-4" style={{ borderColor: "var(--hairline)" }}>
                <p
                  style={{ color: "var(--ink-3)" }}
                  className="font-mono text-[11px] uppercase"
                >
                  Voice &amp; Indic Speech
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Sarvam AI (Saarika v2.5 + Bulbul v2)
                </p>
              </div>
              <div className="sm:border-r sm:pr-4" style={{ borderColor: "var(--hairline)" }}>
                <p
                  style={{ color: "var(--ink-3)" }}
                  className="font-mono text-[11px] uppercase"
                >
                  Agentic Workflows
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Lyzr Studio (Intake · Reconcile · Settle)
                </p>
              </div>
              <div>
                <p
                  style={{ color: "var(--ink-3)" }}
                  className="font-mono text-[11px] uppercase"
                >
                  Honest Boundaries
                </p>
                <p style={{ color: "var(--ink-2)" }} className="mt-1 text-xs">
                  Prototype · UPI simulated · Not a legal metrology instrument
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <FiligreeDivider />

      {/* Section 1: The Problem */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1152px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p
              style={{
                color: "var(--gold-deep)",
                letterSpacing: "var(--track-label)",
              }}
              className="font-mono text-xs font-semibold uppercase"
            >
              THE PROBLEM · ZAVERI BAZAAR TO BOWBAZAR
            </p>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-2 max-w-[38rem] text-3xl font-normal tracking-tight sm:text-5xl"
            >
              A gram of argument costs ₹14,900.
            </h2>
            <p
              style={{ color: "var(--ink-2)" }}
              className="mt-3 max-w-[40rem] text-base leading-relaxed"
            >
              Small jewellers issue raw 22K gold bars on paper slips and WhatsApp
              photos. Wastage norms are argued after the piece returns, leaving
              the jeweller exposed to unhedged metal loss and the karigar without
              formal proof of income.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-3">
            <RevealItem>
              <div className="surface-card h-full p-6">
                <p
                  style={{ color: "var(--ink-3)" }}
                  className="font-mono text-xs uppercase"
                >
                  Custody Exposure
                </p>
                <p
                  style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
                  className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  ₹4–5 lakh
                </p>
                <p
                  style={{ color: "var(--ink-2)" }}
                  className="mt-2 text-sm leading-relaxed"
                >
                  Working 22K gold a single karigar holds at any time across 2–3
                  active bangle or filigree orders, tracked only in a physical{" "}
                  <em>kaccha khata</em>.
                </p>
              </div>
            </RevealItem>

            <RevealItem>
              <div className="surface-card h-full p-6">
                <p
                  style={{ color: "var(--ink-3)" }}
                  className="font-mono text-xs uppercase"
                >
                  Price of One Disputed Gram
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--gold-deep)",
                  }}
                  className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  1 g ≈ ₹14,900
                </p>
                <p
                  style={{ color: "var(--ink-2)" }}
                  className="mt-2 text-sm leading-relaxed"
                >
                  At ₹1.49 lakh per 10 g, a 0.380 g solder-rework disagreement
                  wipes out an artisan&apos;s entire day of labour charges.
                </p>
              </div>
            </RevealItem>

            <RevealItem>
              <div className="surface-card h-full p-6">
                <p
                  style={{ color: "var(--ink-3)" }}
                  className="font-mono text-xs uppercase"
                >
                  Reconciliation Lag
                </p>
                <p
                  style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
                  className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  Month-end
                </p>
                <p
                  style={{ color: "var(--ink-2)" }}
                  className="mt-2 text-sm leading-relaxed"
                >
                  When paper chits are finally totalled, memories have faded,
                  filings are swept, and neither side can prove what was agreed.
                </p>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section
        style={{
          background: "var(--surface-sunken)",
          borderTopColor: "var(--hairline)",
          borderBottomColor: "var(--hairline)",
        }}
        className="border-y py-16 sm:py-24"
      >
        <div className="mx-auto max-w-[1152px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p
              style={{
                color: "var(--gold-deep)",
                letterSpacing: "var(--track-label)",
              }}
              className="font-mono text-xs font-semibold uppercase"
            >
              HOW IT WORKS · ZERO-TYPING MILLIGRAM WORKFLOW
            </p>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-2 text-3xl font-normal tracking-tight sm:text-5xl"
            >
              Three steps. Two people. One record.
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-6 lg:grid-cols-3">
            <RevealItem>
              <div className="surface-card flex h-full flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        background: "var(--gold-tint)",
                        borderColor: "var(--gold-hairline)",
                        color: "var(--gold-deep)",
                      }}
                      className="rounded-full border px-3 py-1 font-mono text-xs font-bold"
                    >
                      01 · WEIGH
                    </span>
                    <Scale
                      style={{ color: "var(--ink-3)" }}
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <h3
                    style={{ fontFamily: "var(--font-display)" }}
                    className="mt-4 text-2xl font-normal"
                  >
                    Scale reads it. Never typed.
                  </h3>
                  <p
                    style={{ color: "var(--ink-2)" }}
                    className="mt-2 text-sm leading-relaxed"
                  >
                    The analytical balance streams integer milligrams over Web
                    Serial (with deterministic simulation on stage). Wastage norm
                    is locked up front before a single gram leaves the counter.
                  </p>
                </div>
                <div
                  style={{
                    background: "var(--surface-sunken)",
                    borderColor: "var(--hairline)",
                  }}
                  className="mt-6 flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 font-mono text-xs"
                >
                  <span style={{ color: "var(--ink-3)" }}>EC-4 Rule</span>
                  <span className="font-semibold">Scale beats voice on weights</span>
                </div>
              </div>
            </RevealItem>

            <RevealItem>
              <div className="surface-card flex h-full flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        background: "var(--gold-tint)",
                        borderColor: "var(--gold-hairline)",
                        color: "var(--gold-deep)",
                      }}
                      className="rounded-full border px-3 py-1 font-mono text-xs font-bold"
                    >
                      02 · HEAR &amp; SIGN
                    </span>
                    <Mic
                      style={{ color: "var(--ink-3)" }}
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <h3
                    style={{ fontFamily: "var(--font-display)" }}
                    className="mt-4 text-2xl font-normal"
                  >
                    Read back in Bengali; &ldquo;haan&rdquo; signs it.
                  </h3>
                  <p
                    style={{ color: "var(--ink-2)" }}
                    className="mt-2 text-sm leading-relaxed"
                  >
                    Rafiq hears the exact gram weight and wastage norm spoken in
                    Bengali via Sarvam Bulbul v2. One tap on{" "}
                    <span className="font-bengali font-semibold">হ্যাঁ</span>{" "}
                    adds his Ed25519 signature and seals the hash link.
                  </p>
                </div>
                <div
                  style={{
                    background: "var(--surface-sunken)",
                    borderColor: "var(--hairline)",
                  }}
                  className="mt-6 flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 font-mono text-xs"
                >
                  <span style={{ color: "var(--ink-3)" }}>Dual Custody</span>
                  <TickPair count={2} />
                </div>
              </div>
            </RevealItem>

            <RevealItem>
              <div className="surface-card flex h-full flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        background: "var(--gold-tint)",
                        borderColor: "var(--gold-hairline)",
                        color: "var(--gold-deep)",
                      }}
                      className="rounded-full border px-3 py-1 font-mono text-xs font-bold"
                    >
                      03 · SETTLE TOGETHER
                    </span>
                    <ShieldCheck
                      style={{ color: "var(--ink-3)" }}
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <h3
                    style={{ fontFamily: "var(--font-display)" }}
                    className="mt-4 text-2xl font-normal"
                  >
                    Weekly check, two ticks, UPI opens.
                  </h3>
                  <p
                    style={{ color: "var(--ink-2)" }}
                    className="mt-2 text-sm leading-relaxed"
                  >
                    Every Saturday, Tola&apos;s reconciliation engine checks all
                    orders in integer milligrams, surfaces any variance for
                    bilingual voice resolution, and generates a GST ITC-04 draft.
                  </p>
                </div>
                <div
                  style={{
                    background: "var(--surface-sunken)",
                    borderColor: "var(--hairline)",
                  }}
                  className="mt-6 flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 font-mono text-xs"
                >
                  <span style={{ color: "var(--ink-3)" }}>Week 2026-W42</span>
                  <span style={{ color: "var(--tick-sealed)" }} className="font-semibold">
                    ₹2,870 net · 0.000 g bal
                  </span>
                </div>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Section 3: Live Ledger Ticker */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1152px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p
                style={{
                  color: "var(--gold-deep)",
                  letterSpacing: "var(--track-label)",
                }}
                className="font-mono text-xs font-semibold uppercase"
              >
                LIVE CRYPTOGRAPHIC LEDGER
              </p>
              <h2
                style={{ fontFamily: "var(--font-display)" }}
                className="mt-1.5 text-3xl font-normal tracking-tight sm:text-4xl"
              >
                Every line, signed twice, chained.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Pill tone="sealed">Chain verified · 13 events</Pill>
              <button
                type="button"
                aria-pressed={tickerPaused}
                onClick={() => setTickerPaused((p) => !p)}
                style={{
                  background: "var(--surface-elevated)",
                  borderColor: "var(--hairline-strong)",
                  color: "var(--ink-2)",
                }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs font-medium"
              >
                {tickerPaused ? (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Resume ticker</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Pause ticker</span>
                  </>
                )}
              </button>
              <Link
                href="/ledger"
                style={{
                  background: "var(--gold-tint)",
                  borderColor: "var(--gold-hairline)",
                  color: "var(--gold-deep)",
                }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs font-semibold"
              >
                <span>Verify the chain yourself</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div
            data-paused={tickerPaused ? "true" : "false"}
            style={{
              background: "var(--surface-sunken)",
              borderColor: "var(--hairline)",
            }}
            className="ticker mt-6 rounded-3xl border py-4"
          >
            <div className="ticker-track">
              {[...TICKER_EVENTS, ...TICKER_EVENTS].map((ev, idx) => (
                <div
                  key={`${ev.code}-${idx}`}
                  aria-hidden={idx >= TICKER_EVENTS.length ? "true" : undefined}
                  style={{
                    background: "var(--surface-elevated)",
                    borderColor: "var(--hairline-strong)",
                  }}
                  className="flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-2.5"
                >
                  <span
                    style={{ color: "var(--gold-deep)" }}
                    className="font-mono text-xs font-bold"
                  >
                    {ev.code}
                  </span>
                  <span style={{ color: "var(--ink-3)" }} className="text-xs">
                    {ev.order} · {ev.actor}
                  </span>
                  <span className="font-mono text-xs font-semibold">
                    {ev.grams}
                  </span>
                  <HashBadge hash={ev.hash} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Two Sides of the Same Gram */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-[1152px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p
              style={{
                color: "var(--gold-deep)",
                letterSpacing: "var(--track-label)",
              }}
              className="font-mono text-xs font-semibold uppercase"
            >
              TWO SIDES OF THE SAME GRAM
            </p>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-2 max-w-[44rem] text-3xl font-normal tracking-tight sm:text-5xl"
            >
              For the jeweller: dispute insurance. For the karigar: a credit file he owns.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="surface-card flex h-full flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Pill tone="gold">Jeweller Console · Suresh Shetty</Pill>
                    <span
                      style={{ color: "var(--ink-3)" }}
                      className="font-mono text-xs"
                    >
                      Shetty Fine Jewellers
                    </span>
                  </div>
                  <h3
                    style={{ fontFamily: "var(--font-display)" }}
                    className="mt-4 text-2xl font-normal sm:text-3xl"
                  >
                    Zero unhedged custody surprises on Saturday evening.
                  </h3>
                  <p
                    style={{ color: "var(--ink-2)" }}
                    className="mt-3 text-sm leading-relaxed"
                  >
                    Every bar issue, ornament return, KDM scrap filing, and
                    solder-rework allowance is reconciled in integer milligrams
                    with an instant Section 143 / GST ITC-04 job-work register
                    draft.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderTopColor: "var(--hairline)" }}>
                  <div className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                    3 active orders · 115.000 g issued
                  </div>
                  <Link
                    href="/jeweller"
                    style={{ color: "var(--indigo-800)" }}
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold"
                  >
                    <span>Open Jeweller Khata</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface-card flex h-full flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Pill tone="sealed">Karigar Credit Passport · Rafiq Sheikh</Pill>
                    <Award
                      style={{ color: "var(--gold-deep)" }}
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <h3
                    style={{ fontFamily: "var(--font-display)" }}
                    className="mt-4 text-2xl font-normal sm:text-3xl"
                  >
                    Turn 24 weeks of honest craft into formal MFI credit.
                  </h3>
                  <p
                    style={{ color: "var(--ink-2)" }}
                    className="mt-3 text-sm leading-relaxed"
                  >
                    Instead of borrowing from informal moneylenders at 36–60% APR,
                    Rafiq shares a revocable, cryptographically signed work-history
                    token with Pragati Mahila MFI showing 1.842 kg handled and
                    99.1% norm adherence.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderTopColor: "var(--hairline)" }}>
                  <div className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                    1,842.500 g fine · 95.8% on-time
                  </div>
                  <Link
                    href="/lender/passport/ps-rafiq-w42-demo0001a"
                    style={{ color: "var(--indigo-800)" }}
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold"
                  >
                    <span>Inspect Lender Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Section 5: Built With Plain-Text Credits & Closing CTA */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <ArcLight stage />
        <div className="relative z-10 mx-auto max-w-[1152px] px-4 sm:px-6 lg:px-8">
          <div
            style={{
              background: "var(--surface-elevated)",
              borderColor: "var(--gold-hairline)",
              boxShadow: "var(--shadow-surface)",
            }}
            className="rounded-[32px] border p-8 text-center sm:p-12"
          >
            <div className="mx-auto inline-flex items-center gap-2">
              <TolaMark size={28} />
              <span
                style={{ fontFamily: "var(--font-display)" }}
                className="text-xl font-medium"
              >
                Tola · तोला · তোলা
              </span>
            </div>

            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="mx-auto mt-4 max-w-[34rem] text-3xl font-normal tracking-tight sm:text-5xl"
            >
              Start the story. One week in 3 minutes.
            </h2>

            <p
              style={{ color: "var(--ink-2)" }}
              className="mx-auto mt-3 max-w-[34rem] text-base"
            >
              Step through Monday&apos;s 40.000 g gold bar issue, Thursday&apos;s
              bangle return, Saturday&apos;s Bengali voice dispute resolution, and
              the live SHA-256 tamper sandbox.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/stage"
                style={{
                  background: "var(--slate)",
                  color: "var(--surface-elevated)",
                }}
                className="inline-flex min-h-12 items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-transform active:scale-[0.98]"
              >
                <span>Start the story (S01 → S13)</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/karigar"
                style={{
                  background: "var(--surface-sunken)",
                  borderColor: "var(--hairline-strong)",
                  color: "var(--ink)",
                }}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold"
              >
                <span>Open Karigar Companion</span>
              </Link>
            </div>

            <p
              style={{ color: "var(--ink-3)" }}
              className="mt-8 font-mono text-xs"
            >
              Built with: Lyzr agents (Manager → Intake · Reconcile · Settle) ·
              Voice by Sarvam AI (Saarika + Bulbul + Mayura) · Ed25519 + SHA-256
              hash chain · HeroUI v3
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTopColor: "var(--hairline)",
          background: "var(--surface-sunken)",
          color: "var(--ink-3)",
        }}
        className="border-t py-8 text-xs"
      >
        <div className="mx-auto flex max-w-[1152px] flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <TolaMark size={20} />
            <span>
              Tola Prototype · UPI simulated · Lender view mocked · Not a
              verified legal metrology weighing instrument.
            </span>
          </div>
          <div className="font-mono text-[11px]">
            Tech4Bharat · GAVS 2026 · Theme 2 Jeweltech · PS 2.2
          </div>
        </div>
      </footer>
    </div>
  );
}
