# ADR-0007: Lyzr agents for language tasks + Sarvam for speech, with a cached fallback
> Project: Tola · Owner: AI/voice lead · Status: Accepted · Last updated: 2026-10-20
> Related: [AI models](../../04-ai/MODELS.md) · [Prompts](../../04-ai/PROMPTS.md) · [Integrations §2–3](../INTEGRATIONS.md) · [Architecture §11](../ARCHITECTURE.md) · [ADR-0006](ADR-0006-integer-mg-deterministic-ledger-core.md)

## Context and problem statement
PS 2.2 sits in the Agentic AI track, and Lyzr is the hackathon's named AI Partner. Karigars speak Bengali, Hindi, Kannada and other languages and may not read well. A network or credit failure on stage would be fatal (R-07). Which AI services do we use, and how do we survive their failure?

## Decision drivers
- Visible, governed use of the sponsor's agent platform (Lyzr), with traces.
- High-quality Indic STT/TTS at low cost.
- Stage resilience: the demo must run with no internet.
- AI never does arithmetic and never signs.

## Considered options
1. **Lyzr Agent Studio (`lyzr-adk` 0.1.12, provider gpt-4o-mini) for Manager/Intake/Reconcile/Settle; Sarvam (`sarvamai` 0.1.37) for STT `saaras:v3` (demo) / `saaras:v4` (scalable) and TTS Bulbul v3; `AI_FALLBACK_MODE = live | cached | off`.**
2. Raw OpenAI/Gemini SDK calls and Google STT/TTS.
3. Bhashini for speech.
4. Lyzr voice for speech.

## Decision outcome
Chosen option: **1**.
- **Speech stays outside Lyzr.** Lyzr receives text only, which avoids voice minutes and keeps Indic quality with Sarvam.
- **Fallbacks:**
  - `cached` serves seeded agent outputs and pre-generated audio, keyed by input hash.
  - `off` uses deterministic templates.
  - Live calls time out at 8 s (Lyzr) and 2.5 s (TTS) and fall back automatically.
- **Traces:** every call writes an E-19 `AiTrace`.
- **Bhashini** is recorded as the sovereign v1 option. Its APIs are for proof-of-concept use only without a paid plan.

### Consequences
- Good: sponsor alignment; best Indic speech per rupee (STT ₹30/hr; ₹100 free credits); the stage demo survives any outage.
- Bad: two external vendors, and data leaves our boundary. Mitigation: pseudonymised text only to Lyzr, no audio to Lyzr, 90-day audio retention, and a DPDP consent record (E-15) for `voice_processing`.
- Bad: the hackathon Lyzr credit amount is unknown. Mitigation: free build tier + cached mode; ask at the AMA.

### Confirmation
A chaos test in CI kills the network: story mode completes with `AI_FALLBACK_MODE=cached` in < 3 min. Evals in [AI_EVALS](../../04-ai/AI_EVALS.md) gate the prompt versions. Review on 15 Nov 2026 (model pins: `bulbul:v4-flash` evaluation).
