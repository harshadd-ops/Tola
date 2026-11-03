import type { PersonaId } from "@/stores/session";
import type { StepId } from "@/lib/story";

export type StoryStepId = StepId;

export type Chapter = "issue" | "return" | "check" | "settle" | "proof";

export interface StoryStepDef {
  id: StoryStepId;
  index: number;
  chapter: Chapter;
  day: "Mon" | "Thu" | "Sat" | "Sun";
  timeLabel: string;
  clock: string;
  persona: PersonaId;
  /** Which surface the audience should look at. */
  focus: "console" | "phone";
  title: string;
  /** What to click, shown on stage (DEMO_SPEC §10 "Exact clicks"). */
  cue: string;
  /** The presenter's line for this beat (DEMO_SPEC §10). */
  line: string;
  /** Move on by itself once this beat is done: only when the next beat continues on the same surface. */
  autoNext?: boolean;
}

export const CHAPTERS: ReadonlyArray<{ id: Chapter; day: string; label: string }> = [
  { id: "issue", day: "Mon 12 Oct", label: "Issue" },
  { id: "return", day: "Thu 15 Oct", label: "Return" },
  { id: "check", day: "Sat 17 Oct", label: "Weekly check" },
  { id: "settle", day: "Sun 18 Oct", label: "Settle" },
  { id: "proof", day: "Sun 18 Oct", label: "Passport & proof" },
];

export const STORY_STEPS: readonly StoryStepDef[] = [
  {
    autoNext: true, id: "S01", index: 0, chapter: "issue", day: "Mon", timeLabel: "10:02",
    clock: "2026-10-12T10:02:00+05:30", persona: "p-suresh", focus: "console",
    title: "The scale reads the gold",
    cue: "Place the bar, wait for Stable, then Capture.",
    line: "The weight comes from the scale. Nobody types it.",
  },
  {
    autoNext: true, id: "S02", index: 1, chapter: "issue", day: "Mon", timeLabel: "10:02",
    clock: "2026-10-12T10:02:30+05:30", persona: "p-suresh", focus: "console",
    title: "Suresh issues 40.000 g to Rafiq",
    cue: "Sign as Suresh.",
    line: "Forty grams, plain bangles, 2.5% wastage agreed before work starts. Suresh signs.",
  },
  {
    id: "S03", index: 2, chapter: "issue", day: "Mon", timeLabel: "10:03",
    clock: "2026-10-12T10:03:00+05:30", persona: "p-rafiq", focus: "phone",
    title: "Rafiq hears it in Bengali and says haan",
    cue: "Play the read-back on the phone, then tap হ্যাঁ.",
    line: "Rafiq hears it in Bengali and says haan. Two signatures, chained. Neither of them can change it now.",
  },
  {
    id: "S04", index: 3, chapter: "return", day: "Thu", timeLabel: "16:10",
    clock: "2026-10-15T16:10:00+05:30", persona: "p-lakshmi", focus: "console",
    title: "The bangles come back",
    cue: "Send Rafiq's voice note, weigh the piece and the scrap, then sign the return.",
    line: "A voice note and the scale become one structured return. The scale wins if they disagree.",
  },
  {
    autoNext: true, id: "S05", index: 4, chapter: "check", day: "Sat", timeLabel: "18:00",
    clock: "2026-10-17T18:00:00+05:30", persona: "p-suresh", focus: "console",
    title: "Saturday: run the week",
    cue: "Run the week.",
    line: "The agent runs the week, and the maths is code, not AI. Order 14 is 0.38 grams over: about ₹5,188. Caught this week, not at month end.",
  },
  {
    autoNext: true, id: "S06", index: 5, chapter: "check", day: "Sat", timeLabel: "18:20",
    clock: "2026-10-17T18:20:00+05:30", persona: "p-rafiq", focus: "phone",
    title: "Rafiq disputes, by voice",
    cue: "Tap the mic on the phone.",
    line: "Rafiq disagrees, by voice: the solder joint cracked and he redid it. The line stays open and visible.",
  },
  {
    id: "S07", index: 6, chapter: "check", day: "Sat", timeLabel: "19:05",
    clock: "2026-10-17T19:05:00+05:30", persona: "p-suresh", focus: "console",
    title: "They agree on 0.130 g",
    cue: "Propose 0.130 g as Suresh, then tap হ্যাঁ on the phone.",
    line: "They agree on 0.13 grams of rework. 0.25 grams stays on his account. Both sign. Nothing is overwritten.",
  },
  {
    autoNext: true, id: "S08", index: 7, chapter: "settle", day: "Sun", timeLabel: "11:00",
    clock: "2026-10-18T11:00:00+05:30", persona: "p-suresh", focus: "console",
    title: "One statement, two approvals",
    cue: "Approve as Suresh, then approve on the phone.",
    line: "Sunday: one statement to both. Two ticks, and payment opens.",
  },
  {
    id: "S09", index: 8, chapter: "settle", day: "Sun", timeLabel: "11:02",
    clock: "2026-10-18T11:02:00+05:30", persona: "p-suresh", focus: "console",
    title: "₹5,040 by UPI",
    cue: "Pay by UPI. It is simulated: no money moves.",
    line: "₹5,040 by UPI. Simulated today: no money moves in this demo.",
  },
  {
    autoNext: true, id: "S10", index: 9, chapter: "proof", day: "Sun", timeLabel: "11:10",
    clock: "2026-10-18T11:10:00+05:30", persona: "p-rafiq", focus: "phone",
    title: "Rafiq shares his Work Passport",
    cue: "On the phone: Share with Meera for 7 days.",
    line: "This is the part no ERP gives him. Rafiq's own record: 194 grams handled, 93% on time, inside his wastage norm. He chooses who sees it.",
  },
  {
    id: "S11", index: 10, chapter: "proof", day: "Sun", timeLabel: "11:12",
    clock: "2026-10-18T11:12:00+05:30", persona: "p-meera", focus: "console",
    title: "Meera opens the link",
    cue: "Verify the signature.",
    line: "The lender sees raw figures signed by Tola's key. No score, no decision: that stays with her.",
  },
  {
    id: "S12", index: 11, chapter: "proof", day: "Sun", timeLabel: "11:15",
    clock: "2026-10-18T11:15:00+05:30", persona: "p-suresh", focus: "console",
    title: "GST job-work draft for the CA",
    cue: "Open the draft PDF.",
    line: "The challan and the labour invoice are drafted for his CA. Tola never files.",
  },
  {
    id: "S13", index: 12, chapter: "proof", day: "Sun", timeLabel: "11:16",
    clock: "2026-10-18T11:16:00+05:30", persona: "p-suresh", focus: "console",
    title: "Change one byte, the chain breaks",
    cue: "Verify the chain, then Tamper.",
    line: "Change one byte and the chain breaks. That is why both sides can trust it.",
  },
] as const;

export const S01_JITTER_MG: readonly number[] = [
  40130, 39960, 40020, 39990, 40000, 40000, 40000,
] as const;

export const S03_READBACK = {
  lang: "bn" as const,
  text: "অর্ডার চোদ্দো। চল্লিশ দশমিক শূন্য শূন্য শূন্য গ্রাম সোনা, বাইশ ক্যারেট, জমা হলো। ঘাটতির সীমা দুই দশমিক পাঁচ শতাংশ, মানে এক গ্রাম।",
  en: "Order 14. 40.000 grams of gold, 22 carat, received. Wastage limit 2.5 percent, that is 1 gram.",
  audio: "S03_readback_bn.mp3",
};

export const S04_VOICE_NOTE = {
  lang: "bn" as const,
  transcript:
    "চোদ্দো নম্বর অর্ডার জমা দিলাম। বালা আটত্রিশ দশমিক এক দুই শূন্য গ্রাম, স্ক্র্যাপ শূন্য দশমিক পাঁচ। ঝালাইয়ের জোড় ফেটে গেছিল, আবার করেছি।",
  en: "Handing in order number 14. Bangles 38.120 grams, scrap 0.5. The solder joint cracked, I redid it.",
  audio: "S04_return_note_bn.webm",
};

export const S06_FLAG_READBACK = {
  text: "অর্ডার চোদ্দো: ঠিক করা আড়াই শতাংশের চেয়ে শূন্য দশমিক তিন আট শূন্য গ্রাম বেশি ঘাটতি।",
  en: "Order 14: 0.380 g more wastage than the agreed 2.5%.",
};

export const S06_VOICE_NOTE = {
  lang: "bn" as const,
  transcript:
    "ঝালাইয়ের জোড় ফেটে গেছিল, পুরো জোড় আবার করতে হয়েছে। ওতে সোনা গেছে, আমি পুরোটা দেব না।",
  en: "The solder joint cracked, I had to redo the whole joint. Gold went in that, I won't pay all of it.",
  audio: "S06_dispute_bn.webm",
};

export const S07_PROPOSAL = {
  text: "সুরেশ প্রস্তাব দিয়েছেন: শূন্য দশমিক এক তিন শূন্য গ্রাম মেরামতের ঘাটতি হিসেবে মানা হবে। বাকি শূন্য দশমিক দুই পাঁচ শূন্য গ্রাম আপনার খাতায় থাকবে।",
  en: "Suresh proposes: 0.130 g accepted as rework wastage. The remaining 0.250 g stays on your account.",
};

export function getStepByIndex(index: number): StoryStepDef {
  const clamped = Math.max(0, Math.min(STORY_STEPS.length - 1, index));
  return STORY_STEPS[clamped] ?? STORY_STEPS[0]!;
}

export function getStepById(id: string): StoryStepDef {
  return STORY_STEPS.find((s) => s.id === id) ?? STORY_STEPS[0]!;
}

/** DEMO_SPEC §6: 1–9, 0 (=S10), - (=S11), = (=S12), \ (=S13). */
export function mapKeyToStepIndex(key: string): number | null {
  const map: Record<string, number> = {
    "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7, "9": 8,
    "0": 9, "-": 10, "=": 11, "\\": 12,
  };
  return key in map ? map[key]! : null;
}
