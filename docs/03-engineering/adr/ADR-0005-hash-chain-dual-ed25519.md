# ADR-0005: SHA-256 hash chain + dual Ed25519 signatures instead of a blockchain
> Project: Tola · Owner: Back end + crypto lead · Status: Accepted · Last updated: 2026-10-20
> Related: [Architecture §9](../ARCHITECTURE.md#9-hash-chain-and-signature-specification) · [Data model E-06, E-07, E-17](../DATA_MODEL.md) · [Project brief §12 non-goals](../../00-overview/PROJECT_BRIEF.md) · [Threat model](../../06-security-compliance/THREAT_MODEL.md)

## Context and problem statement
The core promise is "two signatures on every gram". Jeweller and karigar must both be able to prove what was agreed, and the karigar must be protected against the jeweller (or Tola) rewriting history. Do we need a blockchain?

## Decision drivers
- Tamper evidence that a CA and a karigar can understand.
- Works offline and on cheap phones; no gas fees, no tokens, no wallet.
- No regulatory baggage (crypto-asset perception).
- Supports keys on devices, passkeys later, and WhatsApp/IVR users without smartphones.

## Considered options
1. **A per-pair SHA-256 hash chain + Ed25519 signatures by both parties + a server witness signature + signed daily checkpoints (E-17) and settlement checkpoints.**
2. A public or permissioned blockchain (e.g. Polygon, Hyperledger Fabric).
3. A server-side audit log only (no party signatures).
4. A transparency log (Merkle tree, Trillian-style) from day one.

## Decision outcome
Chosen option: **1**.
- Parties sign `"tola:v1:body:" ‖ pair_id ‖ 0x00 ‖ SHA-256(JCS(body)) ‖ readback_sha256`, so the content, the consent and the audio heard are all bound.
- The chain hash binds order and completeness.
- The server signs a witness per event and a daily checkpoint per pair. Both parties sign the chain head in every settlement.
- E-07 records `alg` (`ed25519`; `es256` for WebAuthn passkeys in v1.1, and verification accepts both) and `assurance_tier` (`device_key`, `channel_whatsapp_ivr` via a custodial KMS key, or `witnessed_in_person`).

### Consequences
- Good: zero cost per event; offline-capable (parties sign the body, the server orders it later); verifiable in the browser; easy to explain ("each page is stapled to the last, and both of you sign each page").
- Bad: no third-party consensus. A colluding server could withhold events. Mitigation: the karigar's device holds the signed checkpoints; settlements carry the head hash under both signatures; v2 may publish daily roots to an external transparency log.
- Bad: custodial keys for WhatsApp/IVR users are weaker. Mitigation: they are a visible assurance tier, there is a 14-day dispute window, and PIN + verified number are required.

### Confirmation
Golden vectors (`chain_v1.json`) cover tamper cases (`BODY_TAMPERED`, `CHAIN_BROKEN`, `BAD_SIGNATURE`, `CHECKPOINT_MISMATCH`). The browser verifier checks 10k events in < 1 s on a mid-range Android. Review in Mar 2027.
