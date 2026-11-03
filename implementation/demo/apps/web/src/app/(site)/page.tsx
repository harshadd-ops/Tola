import { Chip } from "@heroui/react";
import { ArrowRight, Microphone, Pencil, ScalesBalanced } from "@gravity-ui/icons";
import { LinkButton } from "@/components/tola/LinkButton";
import { HeroDevices } from "@/features/landing/HeroDevices";
import { LedgerTicker } from "@/features/landing/LedgerTicker";
import { MaskHeadline, Reveal, RevealGroup, RevealItem } from "@/motion/primitives";

const STEPS = [
  {
    n: "01",
    icon: ScalesBalanced,
    title: "Weighed by the scale",
    body: "The balance sends the figure in milligrams. Nobody types a weight, and the wastage norm is agreed before the gold leaves the counter.",
  },
  {
    n: "02",
    icon: Microphone,
    title: "Heard in his language",
    body: "Rafiq hears the challan read back in Bengali and says haan. His signature joins the jeweller's on the same line.",
  },
  {
    n: "03",
    icon: Pencil,
    title: "Settled by both",
    body: "Every Saturday the week is checked in code, not by AI. A flag is a question, not an accusation. Two ticks, then UPI.",
  },
];

const STATS = [
  { figure: "₹4–5 lakh", label: "of a jeweller's gold a karigar typically holds, against a notebook entry" },
  { figure: "1 g ≈ ₹14,900", label: "the cost of a one-gram argument at today's 24K rate" },
  { figure: "Month-end", label: "when wastage is usually argued over, long after anyone remembers" },
];

/** Landing (DESIGN §14.1): Sarvam's rhythm. Eyebrow → two-line headline → three sentences → two CTAs. */
export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="arc-light" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div>
            <Chip variant="secondary" className="bg-[var(--card)]">
              <Chip.Label className="font-mono text-[11px] tracking-wide uppercase">
                Gold job-work ledger · Jeweltech PS 2.2
              </Chip.Label>
            </Chip>
            <MaskHeadline as="h1" text="Two signatures on every gram." className="t-hero mt-6 max-w-[12ch] text-[var(--ink)]" />
            <Reveal delay={0.25}>
              <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-[var(--ink-2)]">
                Weighed by the scale. Heard in his language. Signed by both. Tola replaces the paper chit between a
                jeweller and the karigar he trusts with gold.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LinkButton href="/stage" size="lg" testId="hero-play">
                  Play the week
                  <ArrowRight />
                </LinkButton>
                <LinkButton href="/jeweller" size="lg" variant="secondary">
                  Explore as Suresh
                </LinkButton>
              </div>
              <p className="mt-6 text-xs text-[var(--ink-3)]">
                No login. Synthetic data. 3 minutes, 13 beats, one order.
              </p>
            </Reveal>
          </div>
          <HeroDevices />
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-24 sm:px-6">
        <p className="t-label">The problem · Avenue Road to Bowbazar</p>
        <MaskHeadline text="A gram of argument costs ₹14,900." className="t-section mt-3 max-w-2xl" />
        <Reveal>
          <p className="mt-4 max-w-2xl text-[var(--ink-2)]">
            Wastage is agreed by word of mouth and settled at month end. When the numbers disagree, the karigar, the weaker
            party, usually pays. No jewellery software gives him his own copy of the record.
          </p>
        </Reveal>
        <RevealGroup className="mt-10 grid gap-4 md:grid-cols-3">
          {STATS.map((s) => (
            <RevealItem key={s.figure} className="rounded-[var(--r-lg)] border border-[var(--hairline-strong)] bg-[var(--card)] p-6">
              <p className="t-metric text-[2rem] text-[var(--ink)]">{s.figure}</p>
              <p className="mt-3 text-sm text-[var(--ink-3)]">{s.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="border-y border-[var(--hairline)] bg-[var(--bg-2)]">
        <div className="mx-auto max-w-[1240px] px-4 py-24 sm:px-6">
          <p className="t-label">How it works</p>
          <MaskHeadline text="Three steps. Two people. One record." className="t-section mt-3" />
          <RevealGroup className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map(({ n, icon: Icon, title, body }) => (
              <RevealItem key={n} className="flex flex-col rounded-[var(--r-lg)] border border-[var(--hairline-strong)] bg-[var(--card)] p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-[var(--ink-3)]">{n}</span>
                  <Icon width={20} height={20} className="text-[var(--ink-2)]" />
                </div>
                <h3 className="t-card mt-10 text-[var(--ink)]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-3)]">{body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="t-label">The live ledger</p>
            <MaskHeadline text="Every line, signed twice, chained." className="t-section mt-3" />
          </div>
          <LinkButton href="/ledger" variant="secondary">
            Verify it yourself
            <ArrowRight />
          </LinkButton>
        </div>
        <Reveal className="mt-8">
          <LedgerTicker />
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-24 sm:px-6">
        <p className="t-label">Two sides of the same gram</p>
        <MaskHeadline text="Dispute insurance for the jeweller. A credit file for the karigar." className="t-section mt-3 max-w-3xl" />
        <RevealGroup className="mt-10 grid gap-4 md:grid-cols-2">
          <RevealItem className="rounded-[var(--r-lg)] border border-[var(--hairline-strong)] bg-[var(--card)] p-7">
            <p className="t-label">Suresh Shetty · jeweller</p>
            <h3 className="t-card mt-3">Nothing to argue about on Saturday evening.</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-3)]">
              Every issue and return is on one signed line. The week is checked against the norm you both agreed, the flag
              arrives the same week, and the GST job-work drafts are ready for your CA.
            </p>
            <LinkButton href="/jeweller" variant="ghost" className="mt-5 -ml-3">
              Open Suresh&apos;s console
              <ArrowRight />
            </LinkButton>
          </RevealItem>
          <RevealItem className="rounded-[var(--r-lg)] border border-[var(--gold-line)] bg-[var(--card)] p-7">
            <p className="t-label">Rafiq Sheikh · karigar</p>
            <h3 className="t-card mt-3">An honest record he can take to a lender.</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-3)]">
              194.000 g handled in 180 days, 13 of 14 orders on time, inside his wastage norm. He decides who sees it and for
              how long. Tola does not score or lend.
            </p>
            <LinkButton href="/karigar" variant="ghost" className="mt-5 -ml-3">
              Open Rafiq&apos;s phone
              <ArrowRight />
            </LinkButton>
          </RevealItem>
        </RevealGroup>
        <p className="mt-10 text-sm text-[var(--ink-3)]">
          Built with Lyzr agents (Manager → Intake, Reconcile, Settle) · Voice by Sarvam AI (Saaras, Bulbul) · Ed25519 and
          SHA-256 · HeroUI
        </p>
      </section>

      <section className="relative overflow-hidden border-t border-[var(--hairline)]">
        <div className="arc-light" style={{ top: "10%" }} aria-hidden="true" />
        <div className="relative mx-auto flex max-w-[1240px] flex-col items-start gap-6 px-4 py-24 sm:px-6">
          <MaskHeadline text="One week at Shetty Jewellers, in three minutes." className="t-section max-w-2xl" />
          <LinkButton href="/stage" size="lg">
            Play the week
            <ArrowRight />
          </LinkButton>
        </div>
      </section>
    </>
  );
}
