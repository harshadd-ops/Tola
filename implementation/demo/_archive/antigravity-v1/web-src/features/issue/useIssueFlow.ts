"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  createLedgerEvent,
  postVoiceReadback,
  signLedgerEvent,
  type LedgerEventItem,
} from "@/lib/api";
import { vibrateOnSeal } from "@/lib/a11y";

export function useIssueFlow() {
  const queryClient = useQueryClient();
  const [draftEvent, setDraftEvent] = useState<LedgerEventItem | null>(null);
  const [sigCount, setSigCount] = useState<0 | 1 | 2>(0);
  const [loading, setLoading] = useState(false);

  const signAsJeweller = useCallback(
    async (goldMg = 40000, occurredAt = "2026-10-12T10:02:30+05:30") => {
      setLoading(true);
      try {
        const created = await createLedgerEvent({
          event_type: "ISSUE",
          karigar_id: "p-rafiq",
          order_id: "order-14",
          actor_id: "p-suresh",
          gold_mg: goldMg,
          stone_mg: 0,
          net_gold_mg: goldMg,
          fineness: 916,
          norm_bp: 250,
          timestamp: occurredAt,
          auto_sign_karigar: false,
        });
        const signed = await signLedgerEvent({
          event_id: created.id,
          signer_id: "p-suresh",
          event_hash: created.event_hash,
          role: "jeweller",
        });
        await postVoiceReadback({
          step_id: "S03",
          lang: "bn",
          order_code: "#14",
          gross_mg: goldMg,
          allowed_mg: 1000,
        }).catch(() => null);

        setDraftEvent(signed);
        setSigCount(1);
        await queryClient.invalidateQueries({ queryKey: ["ledger"] });
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        return signed;
      } finally {
        setLoading(false);
      }
    },
    [queryClient]
  );

  const signAsKarigar = useCallback(
    async (eventId?: string, eventHash?: string) => {
      setLoading(true);
      try {
        const targetId = eventId ?? draftEvent?.id ?? "R5";
        const signed = await signLedgerEvent({
          event_id: targetId,
          signer_id: "p-rafiq",
          event_hash: eventHash ?? draftEvent?.event_hash,
          role: "karigar",
          readback_played: true,
        });
        setDraftEvent(signed);
        setSigCount(2);
        vibrateOnSeal();
        await queryClient.invalidateQueries({ queryKey: ["ledger"] });
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        return signed;
      } finally {
        setLoading(false);
      }
    },
    [draftEvent, queryClient]
  );

  return {
    draftEvent,
    sigCount,
    setSigCount,
    loading,
    signAsJeweller,
    signAsKarigar,
  };
}
