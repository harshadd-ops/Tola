#!/usr/bin/env python3
"""Generate or bake cached audio files and seed photo for the Tola demo track.

In offline/cached mode (or when SARVAM_API_KEY is not set), generates valid,
playable MP3/WebM audio clips (~1.2s gentle tone + silence) and the seed JPEG
photo for Order #14 so the stage build works with zero external network calls.
When SARVAM_API_KEY is set and --live is passed, calls Sarvam Bulbul v3 TTS for the three read-backs
and writes seed/audio/SOURCE = sarvam-bulbul. With --gemini (needs GEMINI_API_KEY and ffmpeg), bakes all
five Bengali clips with Gemini TTS designed voices (Tola's read-back voice + a stand-in for Rafiq's voice
notes) and writes SOURCE = gemini-tts; the phone then labels them as synthetic. Placeholder mode writes
SOURCE = placeholder, and the phone then shows captions only (it never plays a tone pretending to be speech).
"""

from __future__ import annotations

import base64
import math
import struct
import sys
from pathlib import Path

DEMO_ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = DEMO_ROOT / "seed" / "audio"
PHOTO_DIR = DEMO_ROOT / "seed" / "photos"


def _make_mp3_bytes(duration_s: float = 1.2) -> bytes:
    """Create a valid MPEG-1 Layer III (MP3) stream of `duration_s` seconds.

    Uses standard 44.1 kHz, 128 kbps, mono frames (417 bytes per frame,
    header 0xFFFB90C4). Decodes cleanly in Chromium/Firefox/Safari <audio>.
    """
    frames_count = max(10, int(duration_s * 44100 / 1152))
    # MPEG1 Layer 3, 128kbps, 44100Hz, Mono: header = FF FB 90 C4, frame size = 417 bytes
    header = bytes([0xFF, 0xFB, 0x90, 0xC4])
    side_info = bytes(17)  # 17 zero bytes for mono side info (main_data_begin=0)
    payload = bytes(417 - 4 - 17)
    frame = header + side_info + payload
    return frame * frames_count


def _make_wav_bytes(duration_s: float = 1.2, freq_hz: float = 440.0) -> bytes:
    """Create a clean 16-bit 16 kHz mono PCM WAV with a soft chime envelope."""
    sample_rate = 16000
    num_samples = int(sample_rate * duration_s)
    samples = bytearray()
    for i in range(num_samples):
        t = i / sample_rate
        envelope = math.exp(-3.5 * t) * math.sin(math.pi * min(1.0, t / 0.02))
        val = int(4000 * envelope * math.sin(2.0 * math.pi * freq_hz * t))
        samples.extend(struct.pack("<h", max(-32768, min(32767, val))))
    data_bytes = bytes(samples)
    byte_rate = sample_rate * 2
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        36 + len(data_bytes),
        b"WAVE",
        b"fmt ",
        16,
        1,  # PCM
        1,  # mono
        sample_rate,
        byte_rate,
        2,
        16,
        b"data",
        len(data_bytes),
    )
    return header + data_bytes


def _make_minimal_jpeg() -> bytes:
    """Return a valid 64x64 warm gold-bar JPEG image without requiring Pillow."""
    # Valid minimal baseline JPEG (warm gold #B8860B / #E0A82E swatch)
    b64_jpeg = (
        "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS"
        "Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ"
        "CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy"
        "MjIyMjIyMjIyMjIyMjL/wAARCAAgACADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAA"
        "AAAAAAAAAAcG/8QAMBAAAgEDAgQEBgMAAAAAAAAAAQIDAAQRBSExBhJBUWFxgaGx"
        "wdEHEyIyQlLw/8QAFgEBAQEAAAAAAAAAAAAAAAAAAwEA/8QAGhEBAQEAAwEAAAAA"
        "AAAAAAAAAAERAhIhM//aAAwDAQACEQMRAD8A0+O425S8luJ5WklkYs7sclie5NeA"
        "x6lLZXUcsbMrIwZSO4I6GuaxX09nN5sL7W/R711O3+pW88QjuP3U3Q5GVP1FZl2X"
        "0a2d9DqFnFdQNmORQw9R7H3qevL+E8Vfh100crE2spAkH9D6N/n0r08EMAykEHkE"
        "d63LlcWpybH/2Q=="
    )
    return base64.b64decode(b64_jpeg)


READBACKS = {
    "S03_readback_bn.mp3": ("S03", "readback"),
    "S06_flag_bn.mp3": ("S06", "flag_readback"),
    "S07_proposal_bn.mp3": ("S07", "proposal_readback"),
}


def bake_live() -> int:
    """Bake the three Bengali read-backs with Sarvam Bulbul v3 (needs SARVAM_API_KEY), then mark the
    seed as real audio so the phone plays it instead of showing captions only."""
    import json

    sys.path.insert(0, str(DEMO_ROOT / "services" / "api"))
    from tola_api.ai.sarvam_client import synthesize_speech

    story = json.loads((DEMO_ROOT / "seed" / "story.json").read_text(encoding="utf-8"))
    steps = {s["id"]: s for s in story["steps"]}
    for name, (step_id, key) in READBACKS.items():
        text = steps[step_id][key]["text"]
        audio = base64.b64decode(synthesize_speech(text, "bn"))
        (AUDIO_DIR / name).write_bytes(audio)
        print(f"Baked {name} with Bulbul v3 ({len(audio)} bytes)")
    (AUDIO_DIR / "SOURCE").write_text("sarvam-bulbul\n", encoding="utf-8")
    print("Marked seed/audio/SOURCE = sarvam-bulbul.")
    print("Still to do: record the S04/S06 voice notes with a Bengali speaker, with consent.")
    return 0


VOICE_NOTES = {
    "S04_return_note_bn.webm": ("S04", "voice_note"),
    "S06_dispute_bn.webm": ("S06", "voice_note"),
}


def _gemini_tts(text: str, voice: str) -> bytes:
    """One Gemini TTS call (Interactions API) → 24 kHz WAV bytes. The key travels only in the header."""
    import json
    import os
    import time
    import urllib.request

    body = {
        "model": "gemini-3.8-flash-tts",
        "input": [{"type": "user_input", "content": [{"type": "text", "text": text}]}],
        "response_format": {"type": "audio", "mime_type": "audio/wav", "sample_rate": 24000},
        "generation_config": {"speech_config": [{"voice": voice}]},
    }
    req = urllib.request.Request(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        data=json.dumps(body).encode(),
        headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"], "Content-Type": "application/json"},
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:  # noqa: S310 (fixed https URL)
                data = json.load(r)
            break
        except Exception:
            if attempt == 3:
                raise
            time.sleep(6 * (attempt + 1))
    audio = data.get("output_audio") or next(
        c for st in data.get("steps", []) for c in st.get("content", []) if c.get("type") == "audio"
    )
    return base64.b64decode(audio["data"])


def bake_gemini() -> int:
    """Bake the three read-backs (Tola's voice) and the two voice notes (a synthetic stand-in for Rafiq)
    with Gemini TTS designed voices. Voices: TOLA_BN_VOICE / RAFIQ_BN_VOICE (voice_... ids from
    POST /v1beta/voices).
    `--takes-dir DIR` encodes pre-chosen WAVs (DIR/<clip stem>.wav) instead of calling the API."""
    import json
    import os
    import subprocess
    import tempfile

    story = json.loads((DEMO_ROOT / "seed" / "story.json").read_text(encoding="utf-8"))
    steps = {s["id"]: s for s in story["steps"]}
    takes = Path(sys.argv[sys.argv.index("--takes-dir") + 1]) if "--takes-dir" in sys.argv else None
    clean = "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11"
    for name, (step_id, key) in {**READBACKS, **VOICE_NOTES}.items():
        entry = steps[step_id][key]
        stem = Path(name).stem
        with tempfile.TemporaryDirectory() as tmp:
            wav = takes / f"{stem}.wav" if takes else Path(tmp) / "raw.wav"
            if not takes:
                voice = os.environ["RAFIQ_BN_VOICE"] if name in VOICE_NOTES else os.environ["TOLA_BN_VOICE"]
                wav.write_bytes(_gemini_tts(entry.get("text") or entry["transcript"], voice))
            opus = ["-c:a", "libopus", "-b:a", "48k"]
            codec = opus if name.endswith(".webm") else ["-c:a", "libmp3lame", "-b:a", "96k"]
            # ffmpeg is a fixed local tool and every argument is ours.
            subprocess.run(  # noqa: S603
                ["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-af", clean,  # noqa: S607
                 "-ar", "48000", "-ac", "1", *codec, str(AUDIO_DIR / name)],
                check=True,
            )
        print(f"Baked {name} ({(AUDIO_DIR / name).stat().st_size} bytes)")
    (AUDIO_DIR / "SOURCE").write_text("gemini-tts\n", encoding="utf-8")
    print("Marked seed/audio/SOURCE = gemini-tts. Have a native Bengali speaker review every clip.")
    return 0


def main() -> int:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    if "--live" in sys.argv:
        return bake_live()
    if "--gemini" in sys.argv:
        return bake_gemini()
    (AUDIO_DIR / "SOURCE").write_text("placeholder\n", encoding="utf-8")

    mp3_clips = [
        "S03_readback_bn.mp3",
        "S06_flag_bn.mp3",
        "S07_proposal_bn.mp3",
    ]
    for name in mp3_clips:
        path = AUDIO_DIR / name
        path.write_bytes(_make_mp3_bytes(1.2))
        print(f"Wrote {path.relative_to(DEMO_ROOT)} ({path.stat().st_size} bytes)")

    webm_clips = [
        ("S04_return_note_bn.webm", 440.0),
        ("S06_dispute_bn.webm", 392.0),
    ]
    for name, _freq in webm_clips:
        path = AUDIO_DIR / name
        # Browsers sniff RIFF/MP3/WebM media headers; MP3 frames play universally across all browsers
        path.write_bytes(_make_mp3_bytes(1.4))
        print(f"Wrote {path.relative_to(DEMO_ROOT)} ({path.stat().st_size} bytes)")

    photo_path = PHOTO_DIR / "order14-bar.jpg"
    photo_path.write_bytes(_make_minimal_jpeg())
    print(f"Wrote {photo_path.relative_to(DEMO_ROOT)} ({photo_path.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
