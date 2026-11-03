"use client";

import { Button, Modal } from "@heroui/react";
import { ArrowRotateLeft } from "@gravity-ui/icons";
import { TolaMark } from "@/components/tola/TolaMark";
import { useStoryStore } from "@/stores/story";
import { useStoryNav } from "./useStory";

/** The last line of the pitch (DEMO_SPEC §10, 2:55–3:00). */
export function Closing() {
  const open = useStoryStore((s) => s.showClosing);
  const setOpen = useStoryStore((s) => s.setShowClosing);
  const nav = useStoryNav();
  return (
    <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
      <Modal.Container size="lg" placement="center">
        <Modal.Dialog className="text-center" data-testid="closing">
          <Modal.Body className="flex flex-col items-center gap-5 px-6 py-10">
            <TolaMark size={40} />
            <Modal.Heading className="t-section max-w-md">
              Dispute insurance for the jeweller. A credit file for the karigar.
            </Modal.Heading>
            <p className="max-w-sm text-sm text-[var(--ink-3)]">
              One week, one order: 40.000 g out, 38.620 g back, 0.380 g flagged, 0.130 g agreed, ₹5,040 paid. Every line
              signed by both.
            </p>
            <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Tola
            </p>
            <Button
              variant="secondary"
              onPress={() => {
                setOpen(false);
                void nav.resetWeek();
              }}
            >
              <ArrowRotateLeft />
              Play the week again
            </Button>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
