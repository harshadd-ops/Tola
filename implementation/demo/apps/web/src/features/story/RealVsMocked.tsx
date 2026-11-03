"use client";

import { Modal } from "@heroui/react";
import { CircleCheckFill, CircleDashed } from "@gravity-ui/icons";
import { useStoryStore } from "@/stores/story";

/** DEMO_SPEC §7, shown on stage with "?" so a judge can see exactly what is real. */
const ROWS: ReadonlyArray<{ surface: string; real: boolean; note: string }> = [
  { surface: "Gram arithmetic, fine gold, variance, balances", real: true, note: "ledger-core, integer milligrams" },
  { surface: "SHA-256 hash chain, Ed25519 signatures, verification", real: true, note: "Demo keys derived per persona" },
  { surface: "Tamper detection", real: true, note: "On an in-memory sandbox copy" },
  { surface: "Scale", real: false, note: "Simulated; a USB balance works through Web Serial" },
  { surface: "Bengali read-back (Sarvam Bulbul in the product)", real: false, note: "Cached clip, captions always on; see the label under each read-back" },
  { surface: "Voice notes (Sarvam Saaras in the product)", real: false, note: "A synthetic stand-in for Rafiq's voice, with its transcript" },
  { surface: "WhatsApp and IVR", real: false, note: "The simulated phone stands in for both" },
  { surface: "Lyzr agents: intake, reconcile, settle", real: false, note: "Cached replies; they never compute grams" },
  { surface: "UPI intent and QR", real: false, note: "Real URI format, no PSP, no money moves" },
  { surface: "Work Passport link", real: true, note: "Real token, expiry and server signature" },
  { surface: "Lender view", real: false, note: "Mocked page. Tola does not score or lend." },
  { surface: "GST PDF", real: true, note: "Real PDF, draft only, never filed" },
  { surface: "History before 12 Oct", real: false, note: "Synthetic orders on a real chain" },
];

export function RealVsMocked() {
  const open = useStoryStore((s) => s.showRealVsMocked);
  const setOpen = useStoryStore((s) => s.setShowRealVsMocked);
  return (
    <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
      <Modal.Container size="lg">
        <Modal.Dialog data-testid="real-vs-mocked">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>What is real, what is simulated</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <ul className="flex flex-col">
              {ROWS.map((r) => (
                <li key={r.surface} className="flex items-start gap-3 border-b border-[var(--hairline)] py-2.5 last:border-0">
                  {r.real ? (
                    <CircleCheckFill width={16} height={16} className="mt-0.5 shrink-0 text-[var(--variance-ok)]" />
                  ) : (
                    <CircleDashed width={16} height={16} className="mt-0.5 shrink-0 text-[var(--ink-3)]" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[var(--ink)]">
                      {r.surface} <span className="font-normal text-[var(--ink-3)]">· {r.real ? "real" : "simulated"}</span>
                    </p>
                    <p className="text-xs text-[var(--ink-3)]">{r.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
