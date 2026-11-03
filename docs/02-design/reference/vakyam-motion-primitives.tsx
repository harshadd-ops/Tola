import React from 'react';
import { m, type Variants } from 'motion/react';

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

/** Fades and lifts its children once they scroll into view. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'header';
}> = ({ children, className, delay = 0, as = 'div' }) => {
  const Comp = m[as];
  return (
    <Comp
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ delay }}
    >
      {children}
    </Comp>
  );
};

/** Parent that staggers any `RevealItem` children as the group enters the viewport. */
export const RevealGroup: React.FC<{ children: React.ReactNode; className?: string; stagger?: number }> = ({
  children,
  className,
  stagger = 0.08,
}) => (
  <m.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
  >
    {children}
  </m.div>
);

export const RevealItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <m.div className={className} variants={fadeUp}>
    {children}
  </m.div>
);

/** Word-by-word masked rise for display headlines (mask-reveal-up pattern). */
export const MaskHeadline: React.FC<{
  text: string;
  className?: string;
  id?: string;
  as?: 'h1' | 'h2';
  delay?: number;
}> = ({ text, className, id, as = 'h2', delay = 0 }) => {
  const Tag = m[as];
  const words = text.split(' ');
  return (
    <Tag
      key={text}
      id={id}
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
              variants={{
                hidden: { y: '110%' },
                show: { y: '0%', transition: { duration: 0.85, ease: EASE_OUT } },
              }}
            >
              {word}
            </m.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </Tag>
  );
};
