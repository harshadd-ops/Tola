/**
 * Typed API client + Zod boundary schemas for the Tola demo API.
 * Every gram value is validated as an integer (`Mg = z.number().int()`).
 */
import { z } from "zod";
import { signEventHashForPersona } from "./crypto";

export const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")
    : "http://127.0.0.1:8000";

export const API_BASE_URL = API_BASE;

export const Mg = z.number().int().nonnegative();
export const SignedMg = z.number().int();
export const Paise = z.number().int().nonnegative();

export const PersonaSchema = z.object({
  id: z.string(),
  persona: z.string(),
  code: z.string(),
  name: z.string(),
  native_name: z.string(),
  role: z.string(),
  title: z.string(),
  chip_label: z.string(),
  avatar: z.string(),
  shop_id: z.string().nullable().optional(),
  lang: z.string(),
  ui_lang: z.string(),
  script: z.string(),
  city: z.string(),
  origin: z.string().nullable().optional(),
  device: z.string(),
  literacy: z.string(),
  org: z.string().nullable().optional(),
  pubkey_hex: z.string(),
  craft: z.string().nullable().optional(),
  experience_years: z.number().int().nullable().optional(),
  rate_paise_per_gram: Paise.nullable().optional(),
  vishwakarma_id: z.string().nullable().optional(),
  upi_vpa_demo: z.string().nullable().optional(),
  gstin: z.string().nullable().optional(),
});
export type Persona = z.infer<typeof PersonaSchema>;

export const LedgerEventSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  seq: z.number().int(),
  karigar_id: z.string(),
  order_id: z.string().nullable().optional(),
  order: z.string().nullable().optional(),
  event_type: z.string(),
  type: z.string().optional(),
  timestamp: z.string(),
  actor_id: z.string(),
  jeweller_signer_id: z.string(),
  payload: z.record(z.string(), z.unknown()),
  canonical_b64: z.string().optional(),
  prev_hash: z.string(),
  event_hash: z.string(),
  hash: z.string().optional(),
  jeweller_sig: z.string().nullable().optional(),
  karigar_sig: z.string().nullable().optional(),
  server_sig: z.string().nullable().optional(),
  status: z.string(),
  sealed: z.boolean().optional(),
  tampered_in_sandbox: z.boolean().optional(),
});
export type LedgerEventItem = z.infer<typeof LedgerEventSchema>;

export const ChainStatusSchema = z.object({
  valid: z.boolean(),
  checked: z.number().int(),
  length: z.number().int(),
  head_hash: z.string(),
  broken_at_id: z.string().nullable().optional(),
  broken_at: z.string().nullable().optional(),
  broken_at_seq: z.number().int().nullable().optional(),
  reason: z.string().nullable().optional(),
  sandbox: z.string().nullable().optional(),
});
export type ChainStatus = z.infer<typeof ChainStatusSchema>;

export const LedgerResponseSchema = z.object({
  shop_id: z.string().nullable().optional(),
  karigar_id: z.string(),
  events: z.array(LedgerEventSchema),
  total_chain_events: z.number().int().optional(),
  chain: ChainStatusSchema,
});
export type LedgerResponse = z.infer<typeof LedgerResponseSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  code: z.string(),
  shop_id: z.string(),
  karigar_id: z.string(),
  karigar_name: z.string(),
  karigar_native_name: z.string().optional(),
  title: z.string(),
  order_type: z.string(),
  type: z.string().optional(),
  fineness: z.number().int(),
  norm_bp: z.number().int(),
  target_gross_mg: Mg,
  issued_gold_mg: Mg.optional(),
  issued_fine_mg: Mg.optional(),
  stone_mg: Mg,
  allowed_wastage_mg: Mg.optional(),
  labour_paise: Paise,
  labour_inr: z.number().int().optional(),
  issued_on: z.string(),
  due_date: z.string(),
  returned_on: z.string().nullable().optional(),
  return_gross_mg: Mg.nullable().optional(),
  return_net_gold_mg: Mg.nullable().optional(),
  return_scrap_mg: Mg.nullable().optional(),
  return_dust_mg: Mg.nullable().optional(),
  returned_total_mg: Mg.nullable().optional(),
  actual_loss_mg: SignedMg.nullable().optional(),
  variance_mg: SignedMg.nullable().optional(),
  occasion: z.string().nullable().optional(),
  status: z.string(),
  is_history: z.boolean().optional(),
  photo_url: z.string().nullable().optional(),
  dispute_id: z.string().nullable().optional(),
});
export type OrderItem = z.infer<typeof OrderSchema>;

export const ReconcileRowSchema = z.object({
  order: z.string(),
  karigar_id: z.string(),
  issued_mg: Mg,
  returned_mg: Mg,
  scrap_mg: Mg,
  dust_mg: Mg,
  loss_mg: SignedMg,
  allowed_mg: Mg,
  variance_mg: SignedMg,
  variance_fine_mg: SignedMg.optional(),
  variance_inr_est: z.number().int().optional(),
  flagged: z.boolean(),
});
export type ReconcileRow = z.infer<typeof ReconcileRowSchema>;

export const ReconcileRunSchema = z.object({
  id: z.string(),
  shop_id: z.string(),
  week: z.string(),
  ran_at: z.string(),
  orders_checked: z.number().int(),
  flags_count: z.number().int(),
  rows: z.array(ReconcileRowSchema),
  explanation: z.string(),
  statistical_context: z
    .object({
      karigar_id: z.string(),
      history_orders_count: z.number().int(),
      robust_z_x100: z.number().int(),
      summary: z.string(),
    })
    .optional(),
  source: z.string().optional(),
  cached: z.boolean().optional(),
});
export type ReconcileRun = z.infer<typeof ReconcileRunSchema>;

export const DisputeMessageSchema = z.object({
  id: z.string(),
  dispute_id: z.string(),
  author_id: z.string(),
  kind: z.string(),
  text: z.string().nullable().optional(),
  transcript: z.string().nullable().optional(),
  voice_note_id: z.string().nullable().optional(),
  created_at: z.string(),
});

export const DisputeSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  order: z.string().optional(),
  karigar_id: z.string(),
  status: z.string(),
  disputed_variance_mg: SignedMg,
  disputed_variance_fine_mg: SignedMg.optional(),
  reason_code: z.string(),
  allowance_mg: Mg.nullable().optional(),
  allowance_fine_mg: Mg.nullable().optional(),
  resolved_variance_mg: SignedMg.nullable().optional(),
  resolved_variance_fine_mg: SignedMg.nullable().optional(),
  open_event_id: z.string().nullable().optional(),
  adjustment_event_id: z.string().nullable().optional(),
  resolve_event_id: z.string().nullable().optional(),
  opened_at: z.string(),
  resolved_at: z.string().nullable().optional(),
  messages: z.array(DisputeMessageSchema),
});
export type DisputeItem = z.infer<typeof DisputeSchema>;

export const SettlementSummarySchema = z.object({
  opening_gold_with_karigar_mg: Mg,
  issued_mg: Mg,
  returned_net_gold_mg: Mg,
  scrap_mg: Mg,
  dust_credit_mg: Mg,
  allowed_wastage_mg: Mg,
  approved_adjustment_mg: Mg,
  carried_shortfall_mg: SignedMg,
  carried_shortfall_fine_mg: SignedMg,
  closing_gold_with_karigar_mg: Mg,
  closing_fine_mg: Mg,
  labour_paise: Paise,
  gst_paise: Paise,
  payable_paise: Paise,
});
export type SettlementSummary = z.infer<typeof SettlementSummarySchema>;

export const PaymentIntentSchema = z.object({
  id: z.string(),
  settlement_id: z.string().optional(),
  amount_paise: Paise,
  amount_inr: z.string().optional(),
  upi_uri: z.string(),
  uri: z.string().optional(),
  status: z.string(),
  label: z.string().optional(),
});
export type PaymentIntentItem = z.infer<typeof PaymentIntentSchema>;

export const SettlementSchema = z.object({
  id: z.string(),
  shop_id: z.string(),
  karigar_id: z.string(),
  period_start: z.string(),
  period_end: z.string(),
  summary: SettlementSummarySchema,
  narrative: z.string(),
  jeweller_approved: z.boolean(),
  karigar_approved: z.boolean(),
  sealed: z.boolean(),
  event_id: z.string().nullable().optional(),
  status: z.string(),
  source: z.string().optional(),
  payment_intent: PaymentIntentSchema.nullable().optional(),
});
export type SettlementItem = z.infer<typeof SettlementSchema>;

export const PassportSummarySchema = z.object({
  window: z.string(),
  orders: z.number().int(),
  grams_handled_mg: Mg,
  grams_handled_fine_mg: Mg,
  returned: z.number().int(),
  on_time: z.number().int(),
  on_time_bps: z.number().int().optional(),
  on_time_pct_x10: z.number().int().optional(),
  on_time_pct_str: z.string().optional(),
  allowed_wastage_mg: Mg,
  actual_wastage_mg: Mg,
  approved_adjustment_mg: Mg,
  net_variance_mg: SignedMg,
  allowance_used_bps: z.number().int().optional(),
  allowance_used_pct_x10: z.number().int().optional(),
  allowance_used_pct_str: z.string().optional(),
  disputes_opened: z.number().int(),
  disputes_resolved: z.number().int(),
  dispute_resolution_minutes: z.number().int(),
  jewellers_on_tola: z.number().int(),
  jewellers_total_declared: z.number().int(),
});
export type PassportSummaryData = z.infer<typeof PassportSummarySchema>;

export const PassportShareSchema = z.object({
  token: z.string(),
  url_path: z.string(),
  karigar: z.object({
    id: z.string(),
    name: z.string(),
    native_name: z.string(),
    city: z.string(),
    origin: z.string(),
    craft: z.string(),
    experience_years: z.number().int(),
    vishwakarma_id: z.string(),
    pubkey_hex: z.string(),
  }),
  recipient: z.object({
    id: z.string(),
    name: z.string(),
    org: z.string(),
  }),
  scope: z.array(z.string()),
  summary: PassportSummarySchema,
  verification: z.object({
    summary_hash: z.string(),
    server_pubkey_hex: z.string(),
    server_sig_hex: z.string(),
    verified: z.boolean(),
  }),
  created_at: z.string(),
  expires_at: z.string(),
  revoked: z.boolean(),
  views: z.number().int(),
  lender_banner: z.string(),
});
export type PassportShareData = z.infer<typeof PassportShareSchema>;

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  schema?: z.ZodType<T>,
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    signal:
      init?.signal ??
      (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
        ? AbortSignal.timeout(4000)
        : undefined),
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let errText = res.statusText;
    try {
      const body = await res.json();
      errText = JSON.stringify(body);
    } catch {
      // ignore
    }
    const err = new Error(`API ${res.status} on ${path}: ${errText}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  const data = (await res.json()) as unknown;
  return schema ? schema.parse(data) : (data as T);
}

export async function fetchDemoReset(toStep?: string | null) {
  return apiFetch<{
    status: string;
    current_step: string;
    events_count: number;
    chains: Record<string, string>;
  }>("/v1/demo/reset", {
    method: "POST",
    body: JSON.stringify(toStep ? { to_step: toStep } : {}),
  });
}

export async function fetchPersonas() {
  return apiFetch<{
    shop: { id: string; name: string; city: string; address: string; gstin: string } | null;
    personas: Persona[];
  }>("/v1/demo/personas");
}

export async function fetchShopOverview(shopId = "shop-shetty") {
  return apiFetch<{
    shop: { id: string; name: string; city: string; address: string; gstin: string };
    metrics: {
      active_orders_count: number;
      flagged_orders_count: number;
      total_issued_mg: number;
      total_issued_fine_mg: number;
    };
  }>(`/v1/shops/${shopId}/overview`);
}

export async function fetchKarigars(shopId = "shop-shetty") {
  return apiFetch<{
    shop_id: string;
    karigars: Array<{
      id: string;
      code: string;
      name: string;
      native_name: string;
      lang: string;
      script: string;
      origin: string;
      pubkey_hex: string;
      craft: string;
      experience_years: number;
      rate_paise_per_gram: number;
      vishwakarma_id: string | null;
      upi_vpa_demo: string;
      open_gold_mg: number;
      open_fine_mg: number;
      active_orders_count: number;
      norms_bp: Record<string, number>;
    }>;
  }>(`/v1/shops/${shopId}/karigars`);
}

export async function fetchOrders(karigarId?: string, includeHistory = false) {
  const params = new URLSearchParams();
  if (karigarId) params.set("karigarId", karigarId);
  if (includeHistory) params.set("includeHistory", "true");
  const qs = params.toString();
  const res = await apiFetch(
    `/v1/orders${qs ? `?${qs}` : ""}`,
    undefined,
    z.object({ orders: z.array(OrderSchema) }),
  );
  return res.orders;
}

export async function fetchOrderDetail(orderIdOrCode: string) {
  const encoded = encodeURIComponent(orderIdOrCode);
  return apiFetch<OrderItem & { events: Array<Record<string, unknown>>; dispute_id: string | null }>(
    `/v1/orders/${encoded}`,
  );
}

export async function postScaleReading(params: {
  weight_mg: number;
  source?: "simulated" | "serial" | "manual_dual";
  device_id?: string;
  order_id?: string;
  occurred_at?: string;
  stability_window_ms?: number;
}) {
  return apiFetch<{
    id: string;
    weight_mg: number;
    stable: boolean;
    source: string;
    device_id: string;
    captured_at: string;
  }>("/v1/scale/readings", {
    method: "POST",
    body: JSON.stringify({
      weight_mg: params.weight_mg,
      source: params.source ?? "simulated",
      device_id: params.device_id ?? "SIM-KERN-01",
      order_id: params.order_id ?? "order-14",
      stable: true,
      stability_window_ms: params.stability_window_ms ?? 1600,
      occurred_at: params.occurred_at ?? "2026-10-12T10:02:00+05:30",
    }),
  });
}

export async function createLedgerEvent(params: {
  event_type: string;
  karigar_id?: string;
  order_id?: string;
  actor_id?: string;
  gold_mg?: number;
  stone_mg?: number;
  net_gold_mg?: number;
  fineness?: number;
  norm_bp?: number;
  timestamp?: string;
  auto_sign_karigar?: boolean;
}) {
  return apiFetch(
    "/v1/events",
    {
      method: "POST",
      body: JSON.stringify(params),
    },
    LedgerEventSchema,
  );
}

export async function signLedgerEvent(params: {
  event_id: string;
  signer_id: string;
  event_hash?: string;
  role?: "jeweller" | "karigar";
  readback_played?: boolean;
}) {
  const sigHex = params.event_hash
    ? signEventHashForPersona(params.signer_id, params.event_hash)
    : undefined;
  return apiFetch(
    `/v1/events/${encodeURIComponent(params.event_id)}/signatures`,
    {
      method: "POST",
      body: JSON.stringify({
        signer_id: params.signer_id,
        role: params.role,
        sig_hex: sigHex,
        readback_played: params.readback_played ?? true,
      }),
    },
    LedgerEventSchema,
  );
}

export async function fetchLedger(params?: {
  karigarId?: string;
  includeHistory?: boolean;
  sandbox?: string | null;
}) {
  const qs = new URLSearchParams();
  qs.set("karigarId", params?.karigarId ?? "p-rafiq");
  if (params?.includeHistory) qs.set("includeHistory", "true");
  if (params?.sandbox) qs.set("sandbox", params.sandbox);
  return apiFetch(`/v1/ledger?${qs.toString()}`, undefined, LedgerResponseSchema);
}

export async function postVoiceReadback(params: {
  step_id?: string;
  lang?: string;
  order_code?: string;
  gross_mg?: number;
  allowed_mg?: number;
}) {
  return apiFetch<{
    lang: string;
    text_bn: string;
    caption_en: string;
    audio_url: string;
    source: string;
    cached: boolean;
  }>("/v1/voice/readback", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function postVoiceNote(params?: {
  step_id?: string;
  lang?: string;
  piece_gross_mg?: number;
  scrap_mg?: number;
  dust_mg?: number;
}) {
  return apiFetch<{
    lang: string;
    transcript: string;
    caption_en: string;
    extracted: {
      order_code: string;
      piece_gross_mg: number;
      stone_mg: number;
      net_gold_mg: number;
      scrap_mg: number;
      dust_mg: number;
      rework_note: string;
      tags: string[];
      scale_matches_voice: boolean;
    };
    audio_url: string;
    source: string;
    cached: boolean;
  }>("/v1/voice/notes", {
    method: "POST",
    body: JSON.stringify(params ?? { step_id: "S04", lang: "bn" }),
  });
}

export async function runWeeklyReconcile() {
  return apiFetch(
    "/v1/reconciliation/runs",
    {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop-shetty", week: "2026-W42" }),
    },
    ReconcileRunSchema,
  );
}

export async function fetchReconcileRun(runId = "RUN-2026-W42") {
  return apiFetch(`/v1/reconciliation/runs/${encodeURIComponent(runId)}`, undefined, ReconcileRunSchema);
}

export async function openDispute(params?: {
  order_id?: string;
  karigar_id?: string;
  disputed_variance_mg?: number;
}) {
  return apiFetch(
    "/v1/disputes",
    {
      method: "POST",
      body: JSON.stringify(params ?? { order_id: "order-14", karigar_id: "p-rafiq", disputed_variance_mg: 380 }),
    },
    DisputeSchema,
  );
}

export async function resolveDispute(disputeId = "D-14", allowanceMg = 130) {
  return apiFetch(
    `/v1/disputes/${encodeURIComponent(disputeId)}/resolve`,
    {
      method: "POST",
      body: JSON.stringify({
        allowance_mg: allowanceMg,
        resolved_variance_mg: 380 - allowanceMg,
      }),
    },
    DisputeSchema,
  );
}

export async function fetchDisputes() {
  const res = await apiFetch("/v1/disputes", undefined, z.object({ disputes: z.array(DisputeSchema) }));
  return res.disputes;
}

export async function createOrFetchSettlement(settlementId = "SET-2026-W42-RAFIQ") {
  return apiFetch(`/v1/settlements/${encodeURIComponent(settlementId)}`, undefined, SettlementSchema);
}

export async function approveSettlement(settlementId: string, signerId: string, role: "jeweller" | "karigar") {
  return apiFetch(
    `/v1/settlements/${encodeURIComponent(settlementId)}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ signer_id: signerId, role }),
    },
    SettlementSchema,
  );
}

export async function createPaymentIntent(settlementId = "SET-2026-W42-RAFIQ") {
  return apiFetch(
    `/v1/settlements/${encodeURIComponent(settlementId)}/payment-intent`,
    { method: "POST" },
    PaymentIntentSchema,
  );
}

export async function createPassportShare() {
  return apiFetch(
    "/v1/passport/shares",
    {
      method: "POST",
      body: JSON.stringify({
        karigar_id: "p-rafiq",
        recipient_id: "p-meera",
        expires_in_days: 7,
      }),
    },
    PassportShareSchema,
  );
}

export async function fetchPassportByToken(token = "ps-rafiq-w42-demo0001a") {
  return apiFetch(`/v1/passport/${encodeURIComponent(token)}`, undefined, PassportShareSchema);
}

export async function revokePassportShare(token = "ps-rafiq-w42-demo0001a") {
  return apiFetch<{ token: string; revoked: boolean }>(`/v1/passport/shares/${encodeURIComponent(token)}`, {
    method: "DELETE",
  });
}

export function getGstDraftPdfUrl(settlementId = "SET-2026-W42-RAFIQ"): string {
  return `${API_BASE}/v1/settlements/${encodeURIComponent(settlementId)}/gst-draft`;
}
