"""Sarvam AI client wrapper for Bulbul v3 TTS and Saaras v3 STT."""

from __future__ import annotations

import io

from tola_api.config import settings

SPEAKER_BY_LANG: dict[str, str] = {
    "bn": "anushka",
    "bn-IN": "anushka",
    "kn": "anushka",
    "kn-IN": "anushka",
    "hi": "anushka",
    "hi-IN": "anushka",
    "en": "anushka",
    "en-IN": "anushka",
}

LANG_CODE_MAP: dict[str, str] = {
    "bn": "bn-IN",
    "kn": "kn-IN",
    "hi": "hi-IN",
    "en": "en-IN",
}


def synthesize_speech(text: str, lang: str = "bn") -> str:
    if not settings.sarvam_api_key:
        raise RuntimeError("SARVAM_API_KEY not configured")

    from sarvamai import SarvamAI  # type: ignore[import-untyped]

    lang_code = LANG_CODE_MAP.get(lang, lang if "-" in lang else "bn-IN")
    speaker = SPEAKER_BY_LANG.get(lang, "anushka")
    client = SarvamAI(api_subscription_key=settings.sarvam_api_key)
    tts = client.text_to_speech.convert(
        text=text,
        target_language_code=lang_code,
        model="bulbul:v3",
        speaker=speaker,
    )
    return str(tts.audios[0])


def transcribe_speech(audio_bytes: bytes, lang: str = "bn") -> str:
    if not settings.sarvam_api_key:
        raise RuntimeError("SARVAM_API_KEY not configured")

    from sarvamai import SarvamAI  # type: ignore[import-untyped]

    lang_code = LANG_CODE_MAP.get(lang, lang if "-" in lang else "bn-IN")
    client = SarvamAI(api_subscription_key=settings.sarvam_api_key)
    stt = client.speech_to_text.transcribe(
        file=io.BytesIO(audio_bytes),
        model="saaras:v3",
        language_code=lang_code,
    )
    return str(stt.transcript)
