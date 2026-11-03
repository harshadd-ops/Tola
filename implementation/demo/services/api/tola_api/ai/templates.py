"""Deterministic template fallbacks when `AI_FALLBACK_MODE=off` or live+cache miss."""

from __future__ import annotations

from typing import Any


def template_readback_text(lang: str, vars_dict: dict[str, Any]) -> str:
    order_code = str(vars_dict.get("order", "#14"))
    gold_g = f"{int(vars_dict.get('gold_mg', 40000)) / 1000:.3f}"
    fine_g = f"{int(vars_dict.get('fine_mg', 36640)) / 1000:.3f}"
    allowed_g = f"{int(vars_dict.get('allowed_mg', 1000)) / 1000:.3f}"
    if lang.startswith("bn"):
        return (
            f"রফিক ভাই, অর্ডার নম্বর ১৪। সুরেশ শেট্টি আপনাকে {gold_g} গ্রাম ২২ ক্যারেট সোনা দিচ্ছেন — "
            f"খাঁটি সোনা {fine_g} গ্রাম। অনুমোদিত ছট ২.৫ শতাংশ, মানে ১.০০০ গ্রাম। ঠিক থাকলে হ্যাঁ চাপুন।"
        )
    if lang.startswith("kn"):
        return (
            f"ರಫೀಕ್ ಅವರೇ, ಆರ್ಡರ್ {order_code}: {gold_g} ಗ್ರಾಂ 22K ಚಿನ್ನ ನೀಡಲಾಗಿದೆ "
            f"(ಶುದ್ಧ ಚಿನ್ನ {fine_g} ಗ್ರಾಂ, ಸಮ್ಮತಿಸಿದ ನಷ್ಟ {allowed_g} ಗ್ರಾಂ). ಸಮ್ಮತಿಸಲು ಹೌದು ಒತ್ತಿರಿ."
        )
    if lang.startswith("hi"):
        return (
            f"रफ़ीक़ भाई, ऑर्डर {order_code}: आपको {gold_g} ग्राम 22 कैरेट सोना दिया जा रहा है "
            f"(शुद्ध सोना {fine_g} ग्राम, अनुमत छीजत {allowed_g} ग्राम)। सही हो तो हाँ दबाएँ।"
        )
    return (
        f"Rafiq bhai, Order {order_code}. Suresh Shetty is issuing {gold_g} g of 22K gold — "
        f"{fine_g} g fine gold. Agreed wastage is 2.5% ({allowed_g} g). Tap Yes to sign."
    )


def template_intake_extract(
    order_code: str = "#14",
    piece_gross_mg: int = 38120,
    scrap_mg: int = 500,
    dust_mg: int = 0,
) -> dict[str, Any]:
    return {
        "order": order_code,
        "piece_gross_mg": piece_gross_mg,
        "stone_mg": 0,
        "net_gold_mg": piece_gross_mg,
        "scrap_mg": scrap_mg,
        "dust_mg": dust_mg,
        "note": "Clasp soldered twice; scrap in packet; dust still in tray.",
        "tags": ["clasp_rework", "scrap_returned"],
        "confidence": 94,
    }


def template_reconcile_explanation() -> str:
    return (
        "Order #14 (Rafiq · 22K floral necklace): 40.000 g issued, 38.120 g ornament + "
        "0.500 g scrap returned, 0.000 g dust credited. Total loss 1.380 g vs 1.000 g "
        "agreed 2.50% norm — +0.380 g (+0.348 g fine, ~₹5,188) over allowance. "
        "Note on return: 'clasp soldered twice; dust still in tray'. Recommend checking "
        "whether dust credit is pending or a rework allowance applies. "
        "(First over-norm order in Rafiq's last 15 completed orders.)"
    )


def template_settlement_narrative() -> dict[str, str]:
    return {
        "narrative_en": (
            "Week 42 settlement for Rafiq Sheikh: Order #14 closed with 40.000 g issued, "
            "38.620 g returned (piece + scrap), 1.000 g agreed wastage, and 0.130 g rework "
            "adjustment. Net 0.250 g (0.229 g fine) carries forward with open Order #09 "
            "(18.000 g) for a closing balance of 18.250 g (16.717 g fine). "
            "Labour payable: ₹4,800 + ₹240 GST (5%) = ₹5,040."
        ),
        "narrative_bn": (
            "রফিক ভাই, অর্ডার ১৪-এর কাজটির মজুরি ৪,৮০০ টাকা, তার সাথে ৫% জিএসটি ২৪০ টাকা — "
            "মোট ৫,০৪০ টাকা আপনাকে ইউপিআই-তে পাঠানো হচ্ছে। আপনার কাছে অর্ডার ৯-এর ১৮ গ্রাম "
            "এবং অর্ডার ১৪-এর ০.২৫০ গ্রাম মিলিয়ে মোট ১৮.২৫০ গ্রাম সোনা হিসাব বইতে রইল।"
        ),
    }
