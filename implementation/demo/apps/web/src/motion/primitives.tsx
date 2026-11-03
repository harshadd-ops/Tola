"use client";

/**
 * Scroll reveals for the landing only (DESIGN §10.3), ported from Vakyam's motion primitives.
 * App screens never reveal on scroll: data must be visible immediately.
 * Under reduced motion, MotionConfig reducedMotion="user" drops the transforms and keeps the fade.
 */
import React from "react";
import { m, type Variants } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

/** Fades and lifts its children once they scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <m.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ delay }}
    >
      {children}
    </m.div>
  );
}

/** Staggers its RevealItem children as the group enters the viewport. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </m.div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <m.div className={className} variants={fadeUp}>
      {children}
    </m.div>
  );
}

/** Word-by-word masked rise for display headlines. Screen readers get the whole sentence once. */
export function MaskHeadline({
  text,
  className,
  as = "h2",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2";
  delay?: number;
}) {
  const Tag = as === "h1" ? m.h1 : m.h2;
  const words = text.split(" ");
  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: delay } } }}
    >
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span aria-hidden="true" className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
            <m.span
              className="inline-block"
              variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 0.85, ease: EASE_OUT } } }}
            >
              {word}
            </m.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  );
}
