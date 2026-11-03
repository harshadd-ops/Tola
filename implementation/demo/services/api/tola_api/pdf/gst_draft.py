"""Generate the 2-page A4 GST job-work draft for the CA.

Page 1 is the Rule 55 delivery challan for the gold movement, page 2 the karigar's labour invoice
(SAC 9988, 5%). Both pages carry a diagonal "DRAFT, for your CA. Not filed." watermark; tax codes are
printed as "CA to confirm" because Tola drafts and never files (DEMO_SPEC §3.1 S12)."""

from __future__ import annotations

import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

INK = colors.HexColor("#1c1714")
INK_3 = colors.HexColor("#7a716b")
HAIRLINE = colors.HexColor("#e4ddd5")
FLAG = colors.HexColor("#99332a")
MARGIN = 56


def _grams(mg: int) -> str:
    return f"{mg // 1000}.{mg % 1000:03d} g"


def _inr(paise: int) -> str:
    rupees, p = divmod(paise, 100)
    return f"INR {rupees:,}.{p:02d}"


def _frame(c: canvas.Canvas, page: int, title: str, subtitle: str) -> float:
    """Watermark, header and footer for one page; returns the y where content starts."""
    width, height = A4
    c.saveState()
    c.setFillColor(FLAG)
    c.setFillAlpha(0.08)
    c.setFont("Helvetica-Bold", 54)
    c.translate(width / 2, height / 2)
    c.rotate(35)
    c.drawCentredString(0, 0, "DRAFT, for your CA. Not filed.")
    c.restoreState()

    c.setFillColor(FLAG)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN, height - 48, "DRAFT, FOR YOUR CA. NOT FILED.")
    c.setFillColor(INK_3)
    c.setFont("Helvetica", 9)
    c.drawRightString(width - MARGIN, height - 48, f"Page {page} of 2")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 17)
    c.drawString(MARGIN, height - 80, title)
    c.setFillColor(INK_3)
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN, height - 98, subtitle)
    c.setStrokeColor(HAIRLINE)
    c.line(MARGIN, height - 112, width - MARGIN, height - 112)

    c.setFont("Helvetica-Oblique", 8.5)
    c.drawString(
        MARGIN,
        40,
        "Drafted by Tola from the dual-signed ledger. Not an e-invoice, not a GSTN filing. "
        "Codes and rates are for the CA to confirm.",
    )
    return height - 140


def _rows(c: canvas.Canvas, y: float, rows: list[tuple[str, str]], bold_last: bool = False) -> float:
    width, _ = A4
    for i, (label, value) in enumerate(rows):
        last = bold_last and i == len(rows) - 1
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold" if last else "Helvetica", 10.5)
        c.drawString(MARGIN, y, label)
        c.drawRightString(width - MARGIN, y, value)
        c.setStrokeColor(HAIRLINE)
        c.line(MARGIN, y - 8, width - MARGIN, y - 8)
        y -= 26
    return y


def _parties(
    c: canvas.Canvas, y: float, shop_name: str, jeweller_name: str, karigar_name: str, ref: str
) -> float:
    c.setFillColor(INK_3)
    c.setFont("Helvetica", 9)
    c.drawString(MARGIN, y, "PRINCIPAL (JEWELLER)")
    c.drawString(MARGIN + 260, y, "JOB WORKER (KARIGAR)")
    c.setFillColor(INK)
    c.setFont("Helvetica", 10.5)
    c.drawString(MARGIN, y - 16, shop_name)
    c.drawString(MARGIN, y - 30, jeweller_name)
    c.drawString(MARGIN + 260, y - 16, karigar_name)
    c.drawString(MARGIN + 260, y - 30, "GST-registered in this story")
    c.setFillColor(INK_3)
    c.setFont("Helvetica", 9)
    c.drawString(MARGIN, y - 52, ref)
    return y - 84


def render_gst_draft_pdf(
    *,
    settlement_id: str,
    order_code: str,
    shop_name: str,
    jeweller_name: str,
    karigar_name: str,
    issued_gross_mg: int,
    returned_gross_mg: int,
    purity_karat: int,
    purity_fineness: int,
    carry_forward_mg: int,
    carry_forward_fine_mg: int,
    labour_amount_paise: int,
    gst_paise: int,
    total_invoice_paise: int,
    payment_intent_id: str,
) -> bytes:
    """Render the Rule 55 challan (page 1) and the SAC 9988 labour invoice (page 2) as one PDF."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4, pageCompression=0)
    c.setTitle(f"Tola GST job-work draft - {order_code} ({settlement_id})")
    ref = f"Order {order_code}  ·  Settlement {settlement_id}"

    # Page 1: the gold movement under Rule 55.
    subtitle = "CGST Rules, rule 55: gold sent to the job worker and received back"
    y = _frame(c, 1, "Delivery challan for job work", subtitle)
    y = _parties(c, y, shop_name, jeweller_name, karigar_name, ref)
    y = _rows(
        c,
        y,
        [
            ("Goods", "Gold for a plain bangle pair"),
            ("HSN (CA to confirm)", "7113"),
            ("Purity declared", f"{purity_karat}K ({purity_fineness})"),
            ("Issued to the job worker, Mon 12 Oct (from the scale)", _grams(issued_gross_mg)),
            ("Received back, Thu 15 Oct: piece + scrap (from the scale)", _grams(returned_gross_mg)),
            (
                "Wastage agreed by both, incl. rework",
                _grams(issued_gross_mg - returned_gross_mg - carry_forward_mg),
            ),
            (
                "Carried on the job worker's account",
                f"{_grams(carry_forward_mg)} ({_grams(carry_forward_fine_mg)} fine)",
            ),
        ],
    )
    c.setFillColor(INK_3)
    c.setFont("Helvetica", 9)
    c.drawString(MARGIN, y - 6, "Every figure above is a line both parties signed on the Tola ledger.")
    c.showPage()

    # Page 2: the karigar's labour invoice.
    y = _frame(c, 2, "Labour invoice for job work", "Making charges for the job work on page 1, SAC 9988")
    y = _parties(c, y, shop_name, jeweller_name, karigar_name, ref)
    cgst = gst_paise // 2
    y = _rows(
        c,
        y,
        [
            ("SAC (CA to confirm)", "9988"),
            (f"Making charges, order {order_code} (taxable value)", _inr(labour_amount_paise)),
            ("CGST 2.5%", _inr(cgst)),
            ("SGST 2.5%", _inr(gst_paise - cgst)),
            ("Total payable to the job worker", _inr(total_invoice_paise)),
        ],
        bold_last=True,
    )
    c.setFillColor(INK_3)
    c.setFont("Helvetica", 9)
    c.drawString(
        MARGIN, y - 6, f"Payment: UPI intent {payment_intent_id}, simulated in this demo. No money moved."
    )
    c.showPage()
    c.save()
    return buf.getvalue()
