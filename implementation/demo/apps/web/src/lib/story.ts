/**
 * Story-mode client: one snapshot of the week (`GET /v1/demo/state`) and one action per step
 * (`POST /v1/demo/steps/{id}/perform`). The server owns every number; the UI only renders it.
 */
import { API_BASE } from "./api";

/** Same-origin in the browser: Next proxies /v1 to the API, so a phone on the LAN works too (DEMO_SPEC §6). */
const BASE = typeof window === "undefined" ? API_BASE : "";

export type StepId =
  | "S01" | "S02" | "S03" | "S04" | "S05" | "S06" | "S07"
  | "S08" | "S09" | "S10" | "S11" | "S12" | "S13";

export interface StoryEvent {
  id: string;
  seq: number;
  type: string;
  order: string | null;
  timestamp: string;
  weight_mg: number | null;
  jeweller_signed: boolean;
  karigar_signed: boolean;
  sealed: boolean;
  prev_hash: string;
  hash: string;
  signer: string;
}

export interface StoryOrder {
  id: string;
  code: string;
  title: string;
  karigar_id: string;
  type: string;
  fineness: number;
  norm_bp: number;
  issued_mg: number;
  issued_fine_mg: number;
  allowed_mg: number;
  piece_mg: number | null;
  scrap_mg: number | null;
  dust_mg: number | null;
  returned_total_mg: number | null;
  loss_mg: number | null;
  labour_paise: number;
  issued_on: string;
  due_date: string;
  returned_on: string | null;
  status: string;
}

export interface ReconcileRowData {
  order: string;
  karigar_id: string;
  issued_mg: number;
  returned_mg: number;
  piece_mg: number;
  scrap_mg: number;
  dust_mg: number;
  loss_mg: number;
  norm_bp: number;
  allowed_mg: number;
  variance_mg: number;
  variance_fine_mg: number;
  variance_inr: number;
  flag: boolean;
}

export interface DisputeMessage {
  id: string;
  author_id: string;
  kind: "voice" | "text";
  transcript: string | null;
  text: string;
  created_at: string;
}

export interface SettlementSummaryData {
  opening_gold_with_karigar_mg: number;
  issued_mg: number;
  returned_net_gold_mg: number;
  scrap_mg: number;
  dust_credit_mg: number;
  allowed_wastage_mg: number;
  approved_adjustment_mg: number;
  carried_shortfall_mg: number;
  carried_shortfall_fine_mg: number;
  open_orders_mg: number;
  closing_gold_with_karigar_mg: number;
  closing_fine_mg: number;
  labour_paise: number;
  gst_rate_bp: number;
  gst_paise: number;
  payable_paise: number;
}

export interface PassportSummary {
  window: string;
  orders: number;
  grams_handled_mg: number;
  grams_handled_fine_mg: number;
  returned: number;
  on_time: number;
  on_time_pct_str: string;
  allowed_wastage_mg: number;
  actual_wastage_mg: number;
  approved_adjustment_mg: number;
  net_variance_mg: number;
  allowance_used_bps: number;
  allowance_used_pct_str: string;
  disputes_opened: number;
  disputes_resolved: number;
  dispute_resolution_minutes: number;
  jewellers_on_tola: number;
  jewellers_total_declared: number;
}

export interface KarigarBalance {
  id: string;
  name: string;
  native_name: string | null;
  orders_this_week: number;
  open_orders: string[];
  open_mg: number;
  carried_mg: number;
  flagged: string[];
}

export interface StoryState {
  last_done: string;
  /** "placeholder" until real read-backs are baked (seed/audio/SOURCE). Captions always carry the meaning. */
  audio_source: string;
  karigars: KarigarBalance[];
  done: StepId[];
  scale_readings: Record<string, number>;
  orders: StoryOrder[];
  events: StoryEvent[];
  chain: { valid: boolean; length: number; head_hash: string; broken_at: string | null };
  voice_notes: Record<
    string,
    { transcript: string; extracted: Record<string, unknown>; confidence: number; cached: boolean }
  >;
  reconcile: {
    id: string;
    week: string;
    ran_at: string;
    rows: ReconcileRowData[];
    explanation: string;
    cached: boolean;
  } | null;
  dispute: {
    id: string;
    status: "OPEN" | "PROPOSED" | "RESOLVED";
    disputed_mg: number;
    allowance_mg: number | null;
    resolved_mg: number | null;
    resolved_fine_mg: number | null;
    messages: DisputeMessage[];
    opened_at: string;
    resolved_at: string | null;
  } | null;
  settlement: {
    id: string;
    status: "DRAFT" | "APPROVED" | "PAID";
    jeweller_approved: boolean;
    karigar_approved: boolean;
    sealed: boolean;
    event_id: string | null;
    summary: SettlementSummaryData;
    narrative: string;
  } | null;
  payment: { id: string; amount_paise: number; upi_uri: string; status: string } | null;
  /** Rafiq's passport figures, computed from his chain whether or not he has shared it yet. */
  passport_preview: PassportSummary;
  passport: {
    token: string;
    recipient: string;
    recipient_org: string | null;
    scope: string[];
    summary: PassportSummary;
    created_at: string;
    expires_at: string;
    revoked: boolean;
    views: number;
  } | null;
}

export interface LedgerRow {
  id: string;
  seq: number;
  karigar_id: string;
  event_type: string;
  timestamp: string;
  jeweller_signer_id: string;
  payload: Record<string, unknown>;
  prev_hash: string;
  event_hash: string;
  jeweller_sig: string | null;
  karigar_sig: string | null;
  tampered_in_sandbox: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
    signal: init?.signal ?? AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new ApiError(`${res.status} on ${path}`, res.status);
  return (await res.json()) as T;
}

export const storyApi = {
  state: (signal?: AbortSignal) => call<StoryState>("/v1/demo/state", { signal }),
  perform: (step: StepId, party?: "jeweller" | "karigar") =>
    call<StoryState>(`/v1/demo/steps/${step}/perform`, {
      method: "POST",
      body: JSON.stringify(party ? { party } : {}),
    }),
  /** Fast-forward the seed so that every step up to and including `through` is done. */
  reset: (through: StepId | null) =>
    call<{ status: string }>("/v1/demo/reset", {
      method: "POST",
      body: JSON.stringify(through ? { to_step: through } : {}),
    }),
  ledger: (sandboxTamper?: string) =>
    call<{
      events: LedgerRow[];
      total_chain_events: number;
      chain: { valid: boolean; checked: number; broken_at: string | null; reason: string | null };
    }>(
      `/v1/ledger?karigarId=p-rafiq&includeHistory=true${sandboxTamper ? `&sandbox=tamper:${sandboxTamper}` : ""}`,
    ),
  passport: (token: string) =>
    call<{
      verification: { summary_hash: string; server_pubkey_hex: string; server_sig_hex: string };
    }>(`/v1/passport/${token}`),
  /** The karigar takes his Work Passport back: the lender link answers 410 from now on (EC-8). */
  revokeShare: (token: string) => call<{ token: string; revoked: boolean }>(`/v1/passport/shares/${token}`, { method: "DELETE" }),
  /** Share again after a revoke: the same token opens for the lender again. */
  reshare: () => call<{ token: string }>("/v1/passport/shares", { method: "POST", body: "{}" }),
  gstPdfUrl: (settlementId: string) => `${BASE}/v1/settlements/${settlementId}/gst-draft.pdf`,
  audioUrl: (file: string) => `${BASE}/v1/demo/audio/${file}`,
};

export const isDone = (s: StoryState | undefined, step: StepId) => !!s?.done.includes(step);
export const order14 = (s: StoryState | undefined) => s?.orders.find((o) => o.code === "#14");
export const eventById = (s: StoryState | undefined, id: string) => s?.events.find((e) => e.id === id);
