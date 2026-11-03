import { describe, expect, it } from "vitest";
import fixture from "./fixtures/demo_pubkeys.json";
import {
  deriveDemoKeypair,
  signEventHashForPersona,
  verifyEventSignature,
} from "../crypto";

describe("crypto.ts", () => {
  it("derives the exact same Ed25519 public key and signature as PyNaCl for p-rafiq and all personas", () => {
    for (const [personId, expected] of Object.entries(fixture.personas)) {
      const derived = deriveDemoKeypair(personId);
      expect(derived.seedHex).toBe(expected.seed_hex);
      expect(derived.pubkeyHex).toBe(expected.pubkey_hex);
      expect(derived.pubkeyB64Url).toBe(expected.pubkey_b64url);

      const sigHex = signEventHashForPersona(personId, fixture.sample_hash);
      expect(sigHex).toBe(expected.sample_sig_hex);

      expect(
        verifyEventSignature(expected.pubkey_hex, fixture.sample_hash, sigHex)
      ).toBe(true);
      expect(
        verifyEventSignature(expected.pubkey_b64url, fixture.sample_hash, sigHex)
      ).toBe(true);
    }
  });

  it("never verifies a signature made by p-rafiq under p-suresh's public key", () => {
    const rafiqSig = signEventHashForPersona("p-rafiq", fixture.sample_hash);
    const sureshPub = fixture.personas["p-suresh"].pubkey_hex;
    expect(verifyEventSignature(sureshPub, fixture.sample_hash, rafiqSig)).toBe(
      false
    );
  });
});
