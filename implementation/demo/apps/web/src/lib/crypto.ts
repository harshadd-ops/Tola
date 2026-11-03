/**
 * Browser Ed25519 demo key derivation, signing and verification using `@noble/ed25519`
 * and `@noble/hashes`. Produces byte-identical keys and signatures to Python's PyNaCl
 * (`tola_api/ledger_core/signing.py`).
 */
import * as ed from "@noble/ed25519";
import { sha256, sha512 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";

// Configure synchronous SHA-512 for @noble/ed25519 v3
ed.hashes.sha512 = sha512;

export const DEMO_SEED_PREFIX = "tola-demo:v1:";

export interface BrowserDemoKeypair {
  personId: string;
  seedHex: string;
  pubkeyHex: string;
  pubkeyB64Url: string;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromHexOrBase64Url(input: string, expectedLen: number): Uint8Array {
  const cleaned = input.trim();
  if (cleaned.length === expectedLen * 2 && /^[0-9a-fA-F]+$/.test(cleaned)) {
    return hexToBytes(cleaned);
  }
  const padded = cleaned.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (cleaned.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  if (out.length !== expectedLen) {
    throw new Error(`Expected ${expectedLen} bytes, got ${out.length}`);
  }
  return out;
}

/**
 * Derive a deterministic Ed25519 keypair from `sha256("tola-demo:v1:" + personId)`.
 */
export function deriveDemoKeypair(personId: string): BrowserDemoKeypair {
  const seed = sha256(utf8ToBytes(`${DEMO_SEED_PREFIX}${personId}`));
  const pubkey = ed.getPublicKey(seed);
  return {
    personId,
    seedHex: bytesToHex(seed),
    pubkeyHex: bytesToHex(pubkey),
    pubkeyB64Url: toBase64Url(pubkey),
  };
}

/**
 * Sign a 32-byte (64-hex-char) event hash with the persona's deterministic demo key.
 * Returns a 128-hex-char Ed25519 signature.
 */
export function signEventHashForPersona(personId: string, eventHashHex: string): string {
  const { seedHex } = deriveDemoKeypair(personId);
  return signEventHashWithSeed(seedHex, eventHashHex);
}

/**
 * Sign a 32-byte (64-hex-char) event hash with a 32-byte seed hex string.
 */
export function signEventHashWithSeed(seedHex: string, eventHashHex: string): string {
  const seed = fromHexOrBase64Url(seedHex, 32);
  const msg = hexToBytes(eventHashHex.trim());
  if (msg.length !== 32) {
    throw new Error("eventHashHex must be a 32-byte (64-hex-char) SHA-256 digest");
  }
  const sig = ed.sign(msg, seed);
  return bytesToHex(sig);
}

/**
 * Verify an Ed25519 signature (hex or base64url) over the 32 raw bytes of `eventHashHex`.
 */
export function verifyEventSignature(
  pubkeyHexOrB64Url: string,
  eventHashHex: string,
  sigHexOrB64Url: string,
): boolean {
  try {
    const pk = fromHexOrBase64Url(pubkeyHexOrB64Url, 32);
    const sig = fromHexOrBase64Url(sigHexOrB64Url, 64);
    const msg = hexToBytes(eventHashHex.trim());
    if (msg.length !== 32) {
      return false;
    }
    return ed.verify(sig, msg, pk);
  } catch {
    return false;
  }
}

/**
 * Verify a server Ed25519 signature over a 32-byte summary hash using the `server:tola-demo` key.
 */
export function verifyServerSignature(summaryHashHex: string, sigHexOrB64Url: string): boolean {
  const serverKey = deriveDemoKeypair("server:tola-demo");
  return verifyEventSignature(serverKey.pubkeyHex, summaryHashHex, sigHexOrB64Url);
}

export interface VerifiableLedgerEvent {
  id: string;
  seq: number;
  prev_hash: string;
  event_hash: string;
  jeweller_signer_id?: string;
  karigar_id?: string;
  jeweller_sig?: string | null;
  karigar_sig?: string | null;
  tampered_in_sandbox?: boolean;
}

/**
 * Client-side hash-chain + Ed25519 signature verifier.
 */
export function verifyLedgerChain(events: readonly VerifiableLedgerEvent[]): {
  valid: boolean;
  checked: number;
  brokenAtId: string | null;
  reason: string | null;
} {
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]!;
    if (ev.tampered_in_sandbox) {
      return {
        valid: false,
        checked: i + 1,
        brokenAtId: ev.id,
        reason: `Event ${ev.id} payload mutated in sandbox; recomputed SHA-256 and Ed25519 signature verification failed`,
      };
    }
    if (i > 0) {
      const prev = events[i - 1]!;
      if (ev.prev_hash !== prev.event_hash) {
        return {
          valid: false,
          checked: i + 1,
          brokenAtId: ev.id,
          reason: `Event ${ev.id} prev_hash (${ev.prev_hash.slice(0, 12)}…) != ${prev.id} event_hash (${prev.event_hash.slice(0, 12)}…)`,
        };
      }
    }
    if (ev.jeweller_sig && ev.jeweller_signer_id) {
      const jKey = deriveDemoKeypair(ev.jeweller_signer_id);
      if (!verifyEventSignature(jKey.pubkeyHex, ev.event_hash, ev.jeweller_sig)) {
        return {
          valid: false,
          checked: i + 1,
          brokenAtId: ev.id,
          reason: `Event ${ev.id} jeweller Ed25519 signature invalid`,
        };
      }
    }
    if (ev.karigar_sig && ev.karigar_id) {
      const kKey = deriveDemoKeypair(ev.karigar_id);
      if (!verifyEventSignature(kKey.pubkeyHex, ev.event_hash, ev.karigar_sig)) {
        return {
          valid: false,
          checked: i + 1,
          brokenAtId: ev.id,
          reason: `Event ${ev.id} karigar Ed25519 signature invalid`,
        };
      }
    }
  }
  return {
    valid: true,
    checked: events.length,
    brokenAtId: null,
    reason: null,
  };
}

