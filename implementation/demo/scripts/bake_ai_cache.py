#!/usr/bin/env python3
"""Pre-bake deterministic AI cache files in seed/ai-cache/ from seed/story.json.

Used by offline/cached mode (`AI_FALLBACK_MODE=cached`) so every agent call,
TTS readback, and STT voice intake in the 13-step demo story resolves in < 5ms
without touching the network.
"""

from __future__ import annotations

import json
from pathlib import Path

DEMO_ROOT = Path(__file__).resolve().parent.parent
STORY_PATH = DEMO_ROOT / "seed" / "story.json"
CACHE_DIR = DEMO_ROOT / "seed" / "ai-cache"


def main() -> int:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    story = json.loads(STORY_PATH.read_text(encoding="utf-8"))
    steps = {s["id"]: s for s in story["steps"]}

    # S03: Bengali readback of Order #14 issue (R5)
    s03 = steps["S03"]["readback"]
    caches = {
        "S03_readback_bn.json": {
            "step_id": "S03",
            "lang": "bn",
            "text": s03["text"],
            "translit": s03["translit"],
            "en": s03["en"],
            "audio_url": "/v1/demo/audio/S03_readback_bn.mp3",
            "duration_ms": 4800,
            "model": "bulbul:v3",
            "source": "cached",
            "cached": True,
        },
        "S04_intake_bn.json": {
            "step_id": "S04",
            "lang": "bn",
            "transcript": steps["S04"]["voice_note"]["transcript"],
            "en": steps["S04"]["voice_note"]["en"],
            "confidence": 0.94,
            "extracted": {
                "order": "#14",
                "order_code": "#14",
                "order_id": "order-14",
                "piece_gross_mg": 38120,
                "stone_mg": 0,
                "net_gold_mg": 38120,
                "scrap_mg": 500,
                "dust_mg": 0,
                "total_returned_mg": 38620,
                "note_tag": "REWORK_SOLDER",
                "narration_en": steps["S04"]["voice_note"]["en"],
                "scale_matches_voice": True,
            },
            "model": "saaras:v3+intake-agent",
            "source": "cached",
            "cached": True,
        },
        "S05_reconcile_en.json": {
            "step_id": "S05",
            "lang": "en",
            "explanation": steps["S05"]["agent_explanation_en"],
            "explanation_by_lang": {
                "en": steps["S05"]["agent_explanation_en"],
                "bn": "অর্ডার #১৪-এ অনুমোদিত ১.০০০ গ্রামের বিপরীতে ১.৩৮০ গ্রাম ঘাটতি হয়েছে (সীমার উপরে ০.৩৮০ গ্রাম বা ০.৩৪৮ গ্রাম খাঁটি সোনা, আনুমানিক ₹৫,১৮৮)। রফিকের রিটার্ন নোটে ঝালাইয়ের জোড় মেরামতের উল্লেখ আছে।",
                "kn": "ಆರ್ಡರ್ #14 ರಲ್ಲಿ ಒಪ್ಪಿದ 1.000 g ಮಿತಿಗೆ ವಿರುದ್ಧವಾಗಿ 1.380 g ನಷ್ಟವಾಗಿದೆ (+0.380 g ಹೆಚ್ಚುವರಿ, 0.348 g ಶುದ್ಧ ಚಿನ್ನ, ಸುಮಾರು ₹5,188). ರಫೀಕ್ ಅವರ ಟಿಪ್ಪಣಿಯಲ್ಲಿ ಬೆಸುಗೆ ಮರುಕೆಲಸದ ಉಲ್ಲೇಖವಿದೆ.",
                "hi": "ऑर्डर #14 में तय 1.000 ग्राम की तुलना में 1.380 ग्राम की कमी हुई (+0.380 ग्राम अधिक, 0.348 ग्राम शुद्ध सोना, लगभग ₹5,188)। रफ़ीक के रिटर्न नोट में जोड़ की दोबारा मरम्मत का ज़िक्र है।",
            },
            "model": "lyzr:reconcile-agent",
            "source": "cached",
            "cached": True,
        },
        "S06_dispute_bn.json": {
            "step_id": "S06",
            "lang": "bn",
            "transcript": steps["S06"]["voice_note"]["transcript"],
            "en": steps["S06"]["voice_note"]["en"],
            "confidence": 0.93,
            "reason_code": "REWORK",
            "disputed_variance_mg": 380,
            "audio_url": "/v1/demo/audio/S06_flag_bn.mp3",
            "model": "saaras:v3",
            "source": "cached",
            "cached": True,
        },
        "S07_resolve_bn.json": {
            "step_id": "S07",
            "lang": "bn",
            "text": "অর্ডার চোদ্দোর সমাধান প্রস্তাব: শূন্য দশমিক এক তিন শূন্য গ্রাম ঝালাইয়ের ছাড়। বাকি শূন্য দশমিক দুই পাঁচ শূন্য গ্রাম (শূন্য দশমিক দুই দুই নয় গ্রাম খাঁটি সোনা) আপনার খাতায় থাকবে।",
            "en": steps["S07"]["resolution"]["note_en"],
            "audio_url": "/v1/demo/audio/S07_proposal_bn.mp3",
            "duration_ms": 4600,
            "model": "bulbul:v3",
            "source": "cached",
            "cached": True,
        },
        "S08_settle_en.json": {
            "step_id": "S08",
            "lang": "en",
            "narrative": {
                "en": "Week 42 settlement for Rafiq Sheikh: Order #14 closed with 40.000 g issued, 38.620 g returned (piece + scrap), 1.000 g agreed wastage, and 0.130 g rework adjustment. Net 0.250 g (0.229 g fine) carries forward with open Order #09 (18.000 g) for a closing balance of 18.250 g (16.717 g fine). Labour payable: ₹4,800 + ₹240 GST (5%) = ₹5,040.",
                "bn": "রফিক শেখের সপ্তাহ ৪২-এর হিসাব: অর্ডার #১৪ সম্পন্ন। ৪০.০০০ গ্রাম জমা, ৩৮.৬২০ গ্রাম ফেরত, ১.০০০ গ্রাম অনুমোদিত ঘাটতি এবং ০.১৩০ গ্রাম ঝালাই ছাড়। বাকি ০.২৫০ গ্রাম (০.২২৯ গ্রাম খাঁটি সোনা) এবং চালু অর্ডার #০৯ (১৮.০০০ গ্রাম) মিলিয়ে মোট ব্যালেন্স ১৮.২৫০ গ্রাম (১৬.৭১৭ গ্রাম খাঁটি)। মজুরি: ₹৪,৮০০ + ₹২৪০ জিএসটি (৫%) = ₹৫,০৪০।",
                "kn": "ರಫೀಕ್ ಶೇಖ್ ಅವರ ವಾರ 42 ರ ಸೆಟಲ್ಮೆಂಟ್: ಆರ್ಡರ್ #14 ಮುಕ್ತಾಯಗೊಂಡಿದೆ. 0.250 g (0.229 g ಶುದ್ಧ) ಬಾಕಿ ಮುಂದುವರಿಯುತ್ತದೆ; ಒಟ್ಟು ಬಾಕಿ 18.250 g (16.717 g ಶುದ್ಧ). ಕೂಲಿ ಪಾವತಿ: ₹4,800 + ₹240 ಜಿಎಸ್‌ಟಿ = ₹5,040.",
                "hi": "रफ़ीक शेख का सप्ताह 42 निपटान: ऑर्डर #14 पूर्ण। 0.250 ग्राम (0.229 ग्राम शुद्ध) आगे ले जाया गया; कुल शेष 18.250 ग्राम (16.717 ग्राम शुद्ध)। मज़दूरी देय: ₹4,800 + ₹240 जीएसटी = ₹5,040।",
            },
            "model": "lyzr:settle-agent",
            "source": "cached",
            "cached": True,
        },
    }

    for filename, payload in caches.items():
        out = CACHE_DIR / filename
        out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {out.relative_to(DEMO_ROOT)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
