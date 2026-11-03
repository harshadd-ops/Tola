"""Ed25519 signing and verification using PyNaCl.

Demo keys are deterministically derived from `sha256("tola-demo:v1:" + person_id)`
so both browser (`@noble/ed25519`) and backend (`PyNaCl`) produce byte-identical
keys and signatures for every persona.
"""

from __future__ import annotations

import base64
import hashlib
from dataclasses import dataclass

from nacl.exceptions import BadSignatureError
from nacl.signing import SigningKey, VerifyKey

DEMO_SEED_PREFIX = "tola-demo:v1:"


@dataclass(frozen=True)
class DemoKeypair:
    person_id: str
    seed_hex: str
    pubkey_hex: str
    pubkey_b64url: str
    seed_b64url: str


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _decode_hex_or_b64url(value: str, expected_len: int) -> bytes:
    cleaned = value.strip()
    if len(cleaned) == expected_len * 2:
        try:
            return bytes.fromhex(cleaned)
        except ValueError:
            pass
    padded = cleaned + "=" * ((4 - len(cleaned) % 4) % 4)
    raw = base64.urlsafe_b64decode(padded.encode("ascii"))
    if len(raw) != expected_len:
        raise ValueError(f"Expected {expected_len} bytes, got {len(raw)}")
    return raw


def derive_demo_keypair(person_id: str) -> DemoKeypair:
    """Derive a deterministic Ed25519 keypair for a demo persona."""
    seed = hashlib.sha256(f"{DEMO_SEED_PREFIX}{person_id}".encode()).digest()
    sk = SigningKey(seed)
    pk_bytes = bytes(sk.verify_key)
    return DemoKeypair(
        person_id=person_id,
        seed_hex=seed.hex(),
        pubkey_hex=pk_bytes.hex(),
        pubkey_b64url=_b64url_encode(pk_bytes),
        seed_b64url=_b64url_encode(seed),
    )


def derive_server_keypair(configured_hex: str = "") -> DemoKeypair:
    """Return the server witness keypair (from env hex or deterministic demo default)."""
    if configured_hex and len(configured_hex.strip()) == 64:
        seed = bytes.fromhex(configured_hex.strip())
        sk = SigningKey(seed)
        pk_bytes = bytes(sk.verify_key)
        return DemoKeypair(
            person_id="server-witness",
            seed_hex=seed.hex(),
            pubkey_hex=pk_bytes.hex(),
            pubkey_b64url=_b64url_encode(pk_bytes),
            seed_b64url=_b64url_encode(seed),
        )
    return derive_demo_keypair("server-witness")


def sign_event_hash(seed_hex: str, event_hash_hex: str) -> str:
    """Sign the 32 raw bytes of `event_hash_hex` with Ed25519 and return 128-char hex signature."""
    seed = _decode_hex_or_b64url(seed_hex, 32)
    msg = bytes.fromhex(event_hash_hex)
    if len(msg) != 32:
        raise ValueError("event_hash_hex must be a 32-byte (64-hex-char) SHA-256 digest")
    sk = SigningKey(seed)
    return sk.sign(msg).signature.hex()


def verify_sig(pubkey_hex_or_b64: str, event_hash_hex: str, sig_hex_or_b64: str) -> bool:
    """Verify an Ed25519 signature (hex or base64url) over the 32 raw bytes of `event_hash_hex`."""
    try:
        pk_bytes = _decode_hex_or_b64url(pubkey_hex_or_b64, 32)
        sig_bytes = _decode_hex_or_b64url(sig_hex_or_b64, 64)
        msg = bytes.fromhex(event_hash_hex)
        if len(msg) != 32:
            return False
        vk = VerifyKey(pk_bytes)
        vk.verify(msg, sig_bytes)
        return True
    except (BadSignatureError, ValueError, TypeError):
        return False
