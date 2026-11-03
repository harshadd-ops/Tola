"""
Build the 12-slide native editable PowerPoint pitch deck (TOLA_Pitch_Deck.pptx)
modeled directly on the design sense, minimalism, and geometry of CHANAKYA (1).pdf.
Uses /war-room-council positioning and /ai-video-studio + Nano Banana Pro transparent RGBA assets.
"""

import io
import os
import shutil
import zipfile
from pathlib import Path
from lxml import etree
from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

PROJECT_ROOT = r"g:\HACKATHON_PROJECTS\TECH4BHARAT_GAVS_TOLA"
ASSETS_DIR = os.path.join(PROJECT_ROOT, "artifacts", "pitch_deck_assets")
QA_DIR = Path(PROJECT_ROOT) / "artifacts" / "pitch_deck_qa"
PPTX_PATH = os.path.join(PROJECT_ROOT, "TOLA_Pitch_Deck.pptx")
DOCS_PPTX_PATH = os.path.join(PROJECT_ROOT, "docs", "00-overview", "TOLA_Pitch_Deck.pptx")
OUT_ROOT = Path(PPTX_PATH)
OUT_DOCS = Path(DOCS_PPTX_PATH)
REF_PDF_PATH = r"C:\Users\satav\Downloads\CHANAKYA (1).pdf"

SLIDE_W = Pt(1440)  # 20.00 in
SLIDE_H = Pt(810)   # 11.25 in

FONT_HEAD = "Century Gothic"
FONT_BODY = "Century Gothic"
FONT_UI = "Segoe UI"
FONT_INDIC = "Nirmala UI"

C_WHITE = RGBColor(0xFF, 0xFF, 0xFF)
C_INK = RGBColor(0x11, 0x11, 0x11)
C_BLACK = RGBColor(0x00, 0x00, 0x00)
C_INDIGO = RGBColor(0x13, 0x17, 0x58)
C_ROYAL = RGBColor(0x18, 0x00, 0xAD)
C_SLATE = RGBColor(0x33, 0x41, 0x55)
C_MUTED = RGBColor(0x47, 0x55, 0x69)
C_BORDER_LIGHT = RGBColor(0xDD, 0xE3, 0xF2)
C_OUTCOME_BG = RGBColor(0xF4, 0xF7, 0xFD)
C_SCENARIO_BG = RGBColor(0xFA, 0xFA, 0xFA)
C_NEUTRAL_BG = C_SCENARIO_BG
C_GOLD = RGBColor(0xB4, 0x53, 0x09)
C_AMBER = C_GOLD
C_AMBER_BG = RGBColor(0xFE, 0xF3, 0xC7)
C_EMERALD = RGBColor(0x04, 0x78, 0x57)
C_GREEN = C_EMERALD
C_GREEN_BG = RGBColor(0xDC, 0xFC, 0xE7)
C_TABLE_HEAD = RGBColor(0xED, 0xF8, 0xFF)
C_TABLE_BODY = RGBColor(0xFB, 0xF9, 0xFF)

GRADIENTS = {
    "corpus_fill": [(0, "7C90F9", 88000), (55000, "C3C0EE", 92000), (100000, "E9E8F9", 96000)],
    "corpus_border": [(0, "1A1A66", 85000), (50000, "7E8BEF", 70000), (100000, "C3C0EE", 60000)],
    "tech_fill": [(0, "FFFFFF", 100000), (100000, "F7F8FC", 100000)],
    "tech_border": [(0, "131758", 100000), (50000, "242F73", 100000), (100000, "7C90F9", 100000)],
    "arch_fill": [(0, "F4F6FC", 100000), (100000, "FFFFFF", 100000)],
    "arch_border": [(0, "131758", 100000), (100000, "8A99F4", 100000)],
    "core_fill": [(0, "E8EEFF", 100000), (100000, "F8FAFF", 100000)],
}


def set_gradient_fill(shape, stops, angle_deg=90):
    spPr = shape._element.spPr
    for tag in ("a:noFill", "a:solidFill", "a:gradFill", "a:blipFill", "a:pattFill"):
        for child in spPr.findall(qn(tag)):
            spPr.remove(child)
    gradFill = etree.Element(qn("a:gradFill"), flip="none", rotWithShape="1")
    gsLst = etree.SubElement(gradFill, qn("a:gsLst"))
    for stop in stops:
        gs = etree.SubElement(gsLst, qn("a:gs"), pos=str(stop[0]))
        srgb = etree.SubElement(gs, qn("a:srgbClr"), val=stop[1].lstrip("#").upper())
        if len(stop) > 2 and stop[2] is not None:
            etree.SubElement(srgb, qn("a:alpha"), val=str(stop[2]))
    etree.SubElement(gradFill, qn("a:lin"), ang=str(int(angle_deg * 60000)), scaled="1")
    ln = spPr.find(qn("a:ln"))
    if ln is not None:
        ln.addprevious(gradFill)
    else:
        spPr.append(gradFill)


def set_gradient_border(shape, stops, width_pt=2.25, angle_deg=45):
    spPr = shape._element.spPr
    for child in spPr.findall(qn("a:ln")):
        spPr.remove(child)
    ln = etree.SubElement(spPr, qn("a:ln"), w=str(int(width_pt * 12700)), cmpd="sng")
    gradFill = etree.SubElement(ln, qn("a:gradFill"), flip="none", rotWithShape="1")
    gsLst = etree.SubElement(gradFill, qn("a:gsLst"))
    for stop in stops:
        gs = etree.SubElement(gsLst, qn("a:gs"), pos=str(stop[0]))
        srgb = etree.SubElement(gs, qn("a:srgbClr"), val=stop[1].lstrip("#").upper())
        if len(stop) > 2 and stop[2] is not None:
            etree.SubElement(srgb, qn("a:alpha"), val=str(stop[2]))
    etree.SubElement(gradFill, qn("a:lin"), ang=str(int(angle_deg * 60000)), scaled="1")
    etree.SubElement(ln, qn("a:prstDash"), val="solid")


def set_soft_edge(shape, radius_pt=40.0):
    spPr = shape._element.spPr
    for child in spPr.findall(qn("a:effectLst")):
        spPr.remove(child)
    effectLst = etree.SubElement(spPr, qn("a:effectLst"))
    etree.SubElement(effectLst, qn("a:softEdge"), rad=str(int(radius_pt * 12700)))


def set_round_radius(shape, adj=0.04):
    try:
        shape.adjustments[0] = adj
    except Exception:
        pass


def init_chanakya_slide_background(slide):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Pt(0), Pt(0), SLIDE_W, SLIDE_H)
    bg.fill.solid()
    bg.fill.fore_color.rgb = C_WHITE
    bg.line.fill.background()

    tl = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(-160), Pt(-190), Pt(640), Pt(500))
    tl.line.fill.background()
    set_gradient_fill(tl, [(0, "E3F3FF", 65000), (55000, "EFF8FF", 32000), (100000, "FFFFFF", 0)], angle_deg=45)
    set_soft_edge(tl, radius_pt=38.0)

    br = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(820), Pt(430), Pt(760), Pt(520))
    br.line.fill.background()
    set_gradient_fill(br, [(0, "FFFFFF", 0), (45000, "EDF0FF", 35000), (100000, "E2E7FE", 70000)], angle_deg=45)
    set_soft_edge(br, radius_pt=38.0)

    glow_path = os.path.join(ASSETS_DIR, "slide_bg_corner_glows.png")
    if os.path.exists(glow_path):
        slide.shapes.add_picture(glow_path, Pt(0), Pt(0), width=SLIDE_W, height=SLIDE_H)


def add_text_box(
    slide, x_pt, y_pt, w_pt, h_pt, text="", font_name=FONT_BODY, font_size=18,
    bold=False, italic=False, color=C_INK, align=PP_ALIGN.LEFT, v_anchor=MSO_ANCHOR.TOP, line_spacing=1.15
):
    tb = slide.shapes.add_textbox(Pt(x_pt), Pt(y_pt), Pt(w_pt), Pt(h_pt))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = v_anchor
    tf.margin_left = Pt(4)
    tf.margin_right = Pt(4)
    tf.margin_top = Pt(2)
    tf.margin_bottom = Pt(2)
    p = tf.paragraphs[0]
    p.alignment = align
    p.line_spacing = line_spacing
    if text:
        r = p.add_run()
        r.text = text
        r.font.name = font_name
        r.font.size = Pt(font_size)
        r.font.bold = bold
        r.font.italic = italic
        r.font.color.rgb = color
    return tb


def add_styled_card(
    slide, x_pt, y_pt, w_pt, h_pt, fill_key="tech_fill", border_key="tech_border",
    border_w=2.0, fill_angle=90, border_angle=45, radius_adj=0.04, solid_fill=None, solid_border=None
):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Pt(x_pt), Pt(y_pt), Pt(w_pt), Pt(h_pt))
    set_round_radius(card, radius_adj)
    if solid_fill is not None:
        card.fill.solid()
        card.fill.fore_color.rgb = solid_fill
    else:
        set_gradient_fill(card, GRADIENTS[fill_key], angle_deg=fill_angle)
    if solid_border is not None:
        card.line.color.rgb = solid_border
        card.line.width = Pt(border_w)
    elif border_key:
        set_gradient_border(card, GRADIENTS[border_key], width_pt=border_w, angle_deg=border_angle)
    else:
        card.line.fill.background()
    return card


def add_knockout_pill(slide, x_pt, y_pt, w_pt, h_pt, text, font_size=15, border_color=C_INK, text_color=C_INDIGO):
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Pt(x_pt), Pt(y_pt), Pt(w_pt), Pt(h_pt))
    set_round_radius(pill, 0.25)
    pill.fill.solid()
    pill.fill.fore_color.rgb = C_WHITE
    pill.line.color.rgb = border_color
    pill.line.width = Pt(1.75)
    tf = pill.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = Pt(6)
    tf.margin_top = tf.margin_bottom = Pt(2)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = text
    r.font.name = FONT_HEAD
    r.font.size = Pt(font_size)
    r.font.bold = True
    r.font.color.rgb = text_color
    return pill


def add_slide_title(slide, title_text, y_pt=16, font_size=44, align=PP_ALIGN.CENTER, x_pt=50, w_pt=1340):
    return add_text_box(
        slide, x_pt, y_pt, w_pt, 62, text=title_text, font_name=FONT_HEAD,
        font_size=font_size, bold=True, color=C_INK, align=align
    )


def add_pic_fit(slide, asset_name, x_pt, y_pt, w_pt, h_pt):
    path = os.path.join(ASSETS_DIR, asset_name)
    im = Image.open(path)
    iw, ih = im.size
    scale = min(w_pt / iw, h_pt / ih)
    nw, nh = iw * scale, ih * scale
    nx = x_pt + (w_pt - nw) / 2.0
    ny = y_pt + (h_pt - nh) / 2.0
    return slide.shapes.add_picture(path, Pt(nx), Pt(ny), width=Pt(nw), height=Pt(nh))


def build_slide_01_cover(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)

    add_text_box(
        slide, 150, 48, 1140, 38,
        text="THEME 2 - JewelTech: Agentic Trust from Workshop Scale to Settlement",
        font_name=FONT_BODY, font_size=22, italic=True, color=C_INK, align=PP_ALIGN.CENTER
    )

    add_pic_fit(slide, "slide01_tola_emblem.png", 385, 225, 225, 225)

    tb_title = add_text_box(
        slide, 625, 238, 520, 150, text="TOLA",
        font_name=FONT_HEAD, font_size=102, bold=True, color=C_INK, align=PP_ALIGN.LEFT
    )
    p_dev = tb_title.text_frame.add_paragraph()
    r_dev = p_dev.add_run()
    r_dev.text = "तोला  ·  WEIGH. HEAR. SIGN."
    r_dev.font.name = FONT_INDIC
    r_dev.font.size = Pt(22)
    r_dev.font.bold = True
    r_dev.font.color.rgb = C_INDIGO

    add_text_box(
        slide, 220, 478, 1000, 56,
        text="India's Two-Sided Gold Job-Work Ledger",
        font_name=FONT_BODY, font_size=38, bold=False, color=C_INK, align=PP_ALIGN.CENTER
    )
    add_text_box(
        slide, 260, 540, 920, 38,
        text="Two Signatures on Every Gram  ·  Zero-Float Deterministic Core  ·  Indic Voice Read-Back",
        font_name=FONT_BODY, font_size=19, italic=True, color=C_SLATE, align=PP_ALIGN.CENTER
    )

    add_text_box(
        slide, 82, 692, 165, 40, text="Prepared for",
        font_name=FONT_BODY, font_size=20, italic=True, color=C_INK, align=PP_ALIGN.LEFT
    )
    if os.path.exists(os.path.join(ASSETS_DIR, "slide01_partner_janai.png")):
        add_pic_fit(slide, "slide01_partner_janai.png", 252, 684, 52, 52)
    tb_p1 = add_text_box(slide, 312, 682, 265, 58)
    p1 = tb_p1.text_frame.paragraphs[0]
    r1 = p1.add_run()
    r1.text = "JanAI\n"
    r1.font.name = FONT_HEAD
    r1.font.size = Pt(22)
    r1.font.bold = True
    r1.font.color.rgb = C_INK
    r1s = p1.add_run()
    r1s.text = "MASS ENTREPRENEURSHIP CHALLENGE"
    r1s.font.name = FONT_UI
    r1s.font.size = Pt(9.5)
    r1s.font.bold = True
    r1s.font.color.rgb = C_SLATE

    tb_p2 = add_text_box(slide, 610, 682, 320, 58)
    p2 = tb_p2.text_frame.paragraphs[0]
    r2 = p2.add_run()
    r2.text = "TECH4BHARAT\n"
    r2.font.name = FONT_HEAD
    r2.font.size = Pt(22)
    r2.font.bold = True
    r2.font.color.rgb = C_ROYAL
    r2s = p2.add_run()
    r2s.text = "GAVS HACKATHON 2026  ·  JEWELTECH"
    r2s.font.name = FONT_UI
    r2s.font.size = Pt(9.5)
    r2s.font.bold = True
    r2s.font.color.rgb = C_SLATE


def build_slide_02_hidden_truth(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_slide_title(slide, "THE HIDDEN TRUTH")

    add_pic_fit(slide, "slide02_radial_network.png", 105, 92, 1230, 355)

    cols = [
        (95, "Every\nJeweller", "ISSUES ₹4–5L GOLD", "on paper slips and verbal\nwastage norms (2–3% plain,\n20–30% studded)"),
        (535, "Every\nKarigar", "RISKS A MONTH'S PAY", "on a single 1-gram dispute\n(₹13,650–₹15,000 vs ₹15k wage)\nwith zero signed proof"),
        (985, "Every\nJewellery ERP", "RECORDS ONE SIDE", "keeping mutable owner books\nwith no karigar login, voice,\nor portable work history"),
    ]
    for x_pos, l1, verb, l3 in cols:
        tb = add_text_box(slide, x_pos, 470, 365, 290)
        tf = tb.text_frame
        p0 = tf.paragraphs[0]
        p0.line_spacing = 1.12
        r0 = p0.add_run()
        r0.text = l1 + "\n"
        r0.font.name = FONT_BODY
        r0.font.size = Pt(30)
        r0.font.color.rgb = C_INK

        rv = p0.add_run()
        rv.text = verb + "\n"
        rv.font.name = FONT_HEAD
        rv.font.size = Pt(31)
        rv.font.bold = True
        rv.font.color.rgb = C_INDIGO

        r3 = p0.add_run()
        r3.text = l3
        r3.font.name = FONT_BODY
        r3.font.size = Pt(22)
        r3.font.color.rgb = C_SLATE


def build_slide_03_missing_layer(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_slide_title(slide, "THE MISSING LAYER")

    src_card = add_styled_card(slide, 58, 165, 255, 275, fill_key="tech_fill", border_key="tech_border", border_w=2.0)
    add_pic_fit(slide, "slide01_tola_emblem.png", 143, 182, 80, 80)
    add_text_box(
        slide, 70, 272, 230, 120,
        text="PAPER BAHI-KHATA\n\nOne-Sided Slip & Verbal Norm\n40.00 g Issued · '2.5% Ghaat'\nNo Karigar Copy · No Signature",
        font_name=FONT_BODY, font_size=13.5, bold=False, color=C_INK, align=PP_ALIGN.CENTER
    )
    if os.path.exists(os.path.join(ASSETS_DIR, "slide03_sig_stamp.png")):
        add_pic_fit(slide, "slide03_sig_stamp.png", 190, 392, 95, 36)

    add_text_box(
        slide, 58, 465, 265, 34, text="WORKSHOP FAILURE MODES",
        font_name=FONT_HEAD, font_size=16, bold=True, color=C_INDIGO
    )
    failures = (
        "• Unilateral owner-side edits\n"
        "• Month-end memory disputes\n"
        "• Unrecorded scrap & dust loss\n"
        "• Zero collateral for karigar credit"
    )
    add_text_box(slide, 58, 505, 280, 220, text=failures, font_name=FONT_BODY, font_size=16, color=C_INK, line_spacing=1.35)

    add_pic_fit(slide, "slide03_tola_prism.png", 345, 185, 535, 435)

    outputs = [
        ("slide03_icon_1.png", "SCALE-LOCKED WEIGHTS", "Integer mg · USB/BLE & OCR"),
        ("slide03_icon_2.png", "VOICE READ-BACK", "Sarvam Bulbul v3 in Bengali/Hindi"),
        ("slide03_icon_3.png", "DUAL SIGNATURES", "Jeweller + Karigar Ed25519"),
        ("slide03_icon_4.png", "HASH-CHAIN LEDGER", "Append-only SHA-256 lineage"),
        ("slide03_icon_5.png", "VARIANCE FLAGS", "Deterministic M-05 rule engine"),
        ("slide03_icon_6.png", "SETTLEMENT & GST", "Direct UPI intent + Rule 55 PDF"),
        ("slide03_icon_7.png", "WORK PASSPORT", "Consented 7-day credit proof"),
    ]
    y_starts = [115, 205, 295, 385, 475, 565, 655]
    x_offsets = [905, 925, 955, 935, 965, 925, 895]
    for idx, (ic_name, title, sub) in enumerate(outputs):
        xp = x_offsets[idx]
        yp = y_starts[idx]
        add_pic_fit(slide, ic_name, xp, yp, 60, 60)
        tb = add_text_box(slide, xp + 74, yp + 4, 395, 52, v_anchor=MSO_ANCHOR.MIDDLE)
        p = tb.text_frame.paragraphs[0]
        r1 = p.add_run()
        r1.text = f"{title}\n"
        r1.font.name = FONT_HEAD
        r1.font.size = Pt(18)
        r1.font.bold = True
        r1.font.color.rgb = C_INK
        r2 = p.add_run()
        r2.text = sub
        r2.font.name = FONT_BODY
        r2.font.size = Pt(13.5)
        r2.font.color.rgb = C_SLATE


def build_slide_04_wedge(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_slide_title(slide, "GOLD JOB-WORK WEDGE")

    headers = [(55, 390, "TODAY"), (480, 480, "TOMORROW"), (995, 390, "FOUNDATION")]
    for hx, hw, htxt in headers:
        add_text_box(slide, hx, 108, hw, 42, text=htxt, font_name=FONT_BODY, font_size=32, color=C_INK, align=PP_ALIGN.CENTER)

    # Card 1: TODAY
    add_styled_card(slide, 55, 168, 390, 520, fill_key="corpus_fill", border_key=None, radius_adj=0.04)
    add_text_box(slide, 75, 195, 350, 32, text="INITIAL CUSTOMER", font_name=FONT_BODY, font_size=20, color=C_INK, align=PP_ALIGN.CENTER)
    add_text_box(
        slide, 75, 240, 350, 62,
        text="22K PLAIN GOLD BENCH\nCLUSTERS (BENGALURU)",
        font_name=FONT_HEAD, font_size=21, bold=True, color=C_INK, align=PP_ALIGN.CENTER
    )
    bullets = (
        "• Avenue Road, Chickpet &\n  Raja Market (250+ workshops)\n"
        "• 5–30 karigars per shop;\n  15–30s counter handoff limit\n"
        "• ₹79/karigar/mo entry SaaS\n  (15 yrs < one 1-gram dispute)\n"
        "• Deployed via JanAI Cafe Doots\n  & KAVMS Jeweller Association"
    )
    add_text_box(slide, 82, 325, 336, 255, text=bullets, font_name=FONT_BODY, font_size=18, color=C_INK, line_spacing=1.22)
    add_text_box(
        slide, 75, 595, 350, 75,
        text="The ideal high-trust wedge into\nIndia's ₹4–5L/karigar gold economy.",
        font_name=FONT_BODY, font_size=17.5, italic=True, color=C_INK, align=PP_ALIGN.CENTER
    )

    # Card 2: TOMORROW
    add_styled_card(slide, 480, 168, 480, 520, fill_key="corpus_fill", border_key=None, radius_adj=0.04)
    steps = [
        "Bengaluru Plain Gold Clusters", "↓",
        "Kolkata Bowbazar & Singur Hubs", "↓",
        "Mumbai Zaveri Bazaar (2.2L Karigars)", "↓",
        "Coimbatore, Rajkot & Thrissur", "↓",
        "Studded, Kundan & Silver Job-Work", "↓",
        "India's 6.1M Artisan Craft Economy",
    ]
    tb2 = add_text_box(slide, 495, 178, 450, 500)
    tf2 = tb2.text_frame
    tf2.vertical_anchor = MSO_ANCHOR.MIDDLE
    for idx, st in enumerate(steps):
        p = tf2.paragraphs[0] if idx == 0 else tf2.add_paragraph()
        p.alignment = PP_ALIGN.CENTER
        p.line_spacing = 1.32
        p.space_after = Pt(4)
        r = p.add_run()
        r.text = st
        r.font.name = FONT_HEAD if st != "↓" else FONT_UI
        r.font.size = Pt(21 if st != "↓" else 19)
        r.font.bold = (st != "↓")
        r.font.color.rgb = C_INK

    # Card 3: FOUNDATION
    add_styled_card(slide, 995, 168, 390, 520, fill_key="corpus_fill", border_key=None, radius_adj=0.04)
    foundations = [
        ("slide04_icon_1.png", "CGST Section 143 & Rule 55\nJob-Work Challan (PRIMARY)"),
        ("slide04_icon_2.png", "BIS IS 1417 & HUID 2026\nAutomated Scale Direction"),
        ("slide04_icon_3.png", "IIMA & XLRI Gold Wastage\nBenchmarks (2–3% / 20–30%)"),
        ("slide04_icon_4.png", "DPDP Act 2023 Spoken Consent\n& CICRA 2005 Safe Boundary"),
        ("slide04_icon_5.png", "RFC 8032 Ed25519 + RFC 8785\nCanonical JSON Hash Chain"),
    ]
    for idx, (doc_ic, ftxt) in enumerate(foundations):
        ry = 195 + idx * 94
        add_pic_fit(slide, doc_ic, 1016, ry + 4, 42, 42)
        add_text_box(
            slide, 1068, ry, 302, 72, text=ftxt,
            font_name=FONT_BODY, font_size=17.5, italic=True, color=C_INK, line_spacing=1.12
        )

    add_text_box(
        slide, 60, 722, 1320, 44,
        text="10 mg Scale Capture  →  Indic Voice Read-Back  →  Dual Ed25519 Signatures  →  Weekly Reconcile  →  Work Passport",
        font_name=FONT_BODY, font_size=22, color=C_INK, align=PP_ALIGN.CENTER
    )


def build_slide_05_meet_tola(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_slide_title(slide, "MEET TOLA")

    orbit = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(245), Pt(170), Pt(950), Pt(510))
    orbit.fill.background()
    orbit.line.color.rgb = C_INDIGO
    orbit.line.width = Pt(1.5)
    ln = orbit._element.spPr.find(qn("a:ln"))
    if ln is not None:
        etree.SubElement(ln, qn("a:prstDash"), val="sysDot")

    add_pic_fit(slide, "slide05_central_orb.png", 520, 235, 400, 365)
    add_text_box(
        slide, 575, 438, 290, 115,
        text="WEIGH.\nHEAR.\nSIGN.",
        font_name=FONT_HEAD, font_size=22, bold=True, color=C_INK, align=PP_ALIGN.CENTER, line_spacing=1.12
    )

    tb_top = add_text_box(
        slide, 560, 132, 320, 92,
        text="Verbal Gold Issue  →\nTwo-Sided Cryptographic\nTruth",
        font_name=FONT_BODY, font_size=21, italic=True, color=C_INK, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE
    )
    tb_top.fill.solid()
    tb_top.fill.fore_color.rgb = C_WHITE

    tb_bot = add_text_box(
        slide, 560, 642, 320, 72,
        text="One Append-Only Ledger\nof Workshop Truth",
        font_name=FONT_BODY, font_size=21, italic=True, color=C_INK, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE
    )
    tb_bot.fill.solid()
    tb_bot.fill.fore_color.rgb = C_WHITE

    nodes = [
        ("slide05_node_1.png", 442, 180, 195, 112, "WEIGHS", "Captures 10 mg scale reads\nvia USB, BLE, or photo OCR."),
        ("slide05_node_2.png", 268, 265, 38, 250, "SPEAKS", "Reads back weight & wastage\nin Bengali, Hindi, or Kannada."),
        ("slide05_node_3.png", 268, 468, 38, 465, "CO-SIGNS", "Locks Jeweller + Karigar\nEd25519 keys on every row."),
        ("slide05_node_4.png", 442, 565, 195, 602, "RECONCILES", "Flags over-norm variance &\nrecords voice rework notes."),
        ("slide05_node_5.png", 922, 180, 1022, 112, "TRANSLATES", "Converts colloquial ratti/ana\nand Bengali voice into JSON."),
        ("slide05_node_6.png", 1096, 265, 1190, 250, "CHAINS", "Links ISSUE, RETURN, SCRAP &\nDUST in a SHA-256 hash chain."),
        ("slide05_node_7.png", 1096, 468, 1190, 465, "SETTLES", "Triggers direct UPI labour pay\n& Rule 55 GST challan PDF."),
        ("slide05_node_8.png", 922, 565, 1022, 602, "UNLOCKS CREDIT", "Exports a consented 7-day\nKarigar Work Passport."),
    ]
    for ic_file, nx, ny, tx, ty, nhead, nbody in nodes:
        ring = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(nx), Pt(ny), Pt(76), Pt(76))
        ring.fill.solid()
        ring.fill.fore_color.rgb = C_WHITE
        ring.line.color.rgb = C_INDIGO
        ring.line.width = Pt(2.25)
        add_pic_fit(slide, ic_file, nx + 13, ny + 13, 50, 50)

        tb = add_text_box(slide, tx, ty, 225, 105)
        tf = tb.text_frame
        p0 = tf.paragraphs[0]
        r0 = p0.add_run()
        r0.text = nhead + "\n"
        r0.font.name = FONT_HEAD
        r0.font.size = Pt(18)
        r0.font.bold = True
        r0.font.color.rgb = C_INK
        r1 = p0.add_run()
        r1.text = nbody
        r1.font.name = FONT_BODY
        r1.font.size = Pt(14.5)
        r1.font.color.rgb = C_SLATE


def build_slide_06_architecture(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_slide_title(slide, "SYSTEM ARCHITECTURE", y_pt=12, font_size=40)

    # Outer soft container
    outer = add_styled_card(slide, 22, 74, 1396, 712, fill_key="tech_fill", border_key=None, solid_border=C_BORDER_LIGHT, border_w=1.25, radius_adj=0.02)

    layers = [
        (84, 88, "slide06_layer_1.png", "BENCH & INPUT\nSOURCES", "arch_fill", 1.5),
        (182, 88, "slide06_layer_2.png", "CAPTURE & VOICE\nPIPELINE", "arch_fill", 1.5),
        (280, 152, "slide06_layer_3.png", "THE BRAIN\nLEDGER-CORE DAG", "core_fill", 2.25),
        (442, 114, "slide06_layer_4.png", "LYZR AGENTIC\nSERVICES", "arch_fill", 1.5),
        (566, 76, "slide06_layer_5.png", "GOVERNANCE &\nTRUST", "arch_fill", 1.5),
        (652, 120, "slide06_layer_6.png", "ROLE EXPERIENCE\n& RAILS", "arch_fill", 1.5),
    ]
    for ly, lh, lic, ltitle, fkey, bw in layers:
        add_styled_card(slide, 36, ly, 1368, lh, fill_key=fkey, border_key="arch_border", border_w=bw, fill_angle=0, radius_adj=0.03)
        add_pic_fit(slide, lic, 50, ly + (lh - 46) / 2, 46, 46)
        add_text_box(slide, 104, ly + 8, 210, lh - 16, text=ltitle, font_name=FONT_HEAD, font_size=15.5, bold=True, color=C_INK, v_anchor=MSO_ANCHOR.MIDDLE)

    # Layer 1 pills
    l1_pills = [
        "USB-OTG Scale (10 mg)", "BLE GATT Scale (0x181D)", "Scale Display OCR",
        "Bengali / Hindi Voice", "Scrap & Dust Pouches", "Job-Work Order Norms", "Offline PWA / IVR Queue"
    ]
    for i, ptxt in enumerate(l1_pills):
        px = 325 + i * 152
        pill = add_styled_card(slide, px, 96, 144, 48, solid_fill=C_WHITE, solid_border=C_BORDER_LIGHT, border_w=1.25, radius_adj=0.18)
        add_text_box(slide, px + 4, 98, 136, 44, text=ptxt, font_name=FONT_UI, font_size=11.5, bold=True, color=C_INK, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)
    add_text_box(slide, 325, 146, 1060, 22, text="Physical Workshop Counter & Feature-Phone Edge Inputs", font_name=FONT_UI, font_size=11, italic=True, color=C_SLATE, align=PP_ALIGN.CENTER)

    # Layer 2 pastel flow pills
    l2_steps = [
        ("Scale / OCR Parser", RGBColor(0xDC, 0xEA, 0xFE)),
        ("Sarvam Saaras v3 STT", RGBColor(0xE0, 0xF2, 0xFE)),
        ("Deterministic Numeral Parser", RGBColor(0xDC, 0xFC, 0xE7)),
        ("Spoken-vs-Scale Check", RGBColor(0xFE, 0xF3, 0xC7)),
        ("Sarvam Bulbul v3 TTS", RGBColor(0xFF, 0xED, 0xD5)),
        ("Dual Ed25519 Sign Request", RGBColor(0xF3, 0xE8, 0xFF)),
    ]
    for i, (stxt, scol) in enumerate(l2_steps):
        px = 325 + i * 178
        add_styled_card(slide, px, 194, 158, 44, solid_fill=scol, solid_border=C_INDIGO, border_w=1.0, radius_adj=0.18)
        add_text_box(slide, px + 4, 196, 150, 40, text=stxt, font_name=FONT_UI, font_size=11.5, bold=True, color=C_INK, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)
        if i < 5:
            add_text_box(slide, px + 158, 198, 20, 36, text="→", font_name=FONT_HEAD, font_size=15, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)
    add_text_box(slide, 325, 242, 1060, 22, text="Transforms raw scale frames and code-mixed speech into human-confirmed signed events (≤ 20 seconds).", font_name=FONT_UI, font_size=11, italic=True, color=C_SLATE, align=PP_ALIGN.CENTER)

    # Layer 3: THE BRAIN
    left_pills = ["Integer Milligram Math (Zero Float)", "916 / 750 Fineness Conversion (ppt)", "Wastage Norm Engine (bps)"]
    right_pills = ["M-05 Variance Rules (OVER_NORM)", "RFC 8785 Canonical JSON + SHA-256", "Dual Ed25519 Signature Verifier"]
    for i, ltxt in enumerate(left_pills):
        py = 292 + i * 44
        add_styled_card(slide, 325, py, 255, 36, solid_fill=C_WHITE, solid_border=C_INDIGO, border_w=1.25, radius_adj=0.25)
        add_text_box(slide, 330, py + 2, 245, 32, text=ltxt, font_name=FONT_UI, font_size=11.5, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)

    dag_box = add_styled_card(slide, 594, 290, 516, 98, solid_fill=C_WHITE, solid_border=C_BORDER_LIGHT, border_w=1.25, radius_adj=0.06)
    dag_nodes_top = [
        (606, 298, 112, 34, "JobOrder #14", RGBColor(0xDC, 0xEA, 0xFE)),
        (734, 298, 112, 34, "ISSUE 40.00g", RGBColor(0xE0, 0xF2, 0xFE)),
        (862, 298, 116, 34, "RETURN 38.12g", RGBColor(0xDC, 0xFC, 0xE7)),
        (994, 298, 106, 34, "SCRAP 0.50g", RGBColor(0xFE, 0xF3, 0xC7)),
    ]
    for dx, dy, dw, dh, dtxt, dcol in dag_nodes_top:
        add_styled_card(slide, dx, dy, dw, dh, solid_fill=dcol, solid_border=C_INDIGO, border_w=1.0, radius_adj=0.2)
        add_text_box(slide, dx + 3, dy + 2, dw - 6, dh - 4, text=dtxt, font_name=FONT_UI, font_size=10.5, bold=True, color=C_INK, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)
    for ax in (718, 846, 978):
        add_text_box(slide, ax, 300, 16, 30, text="→", font_name=FONT_HEAD, font_size=12, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)

    dag_nodes_bot = [
        (606, 344, 152, 34, "M-05 Flag (+380mg)", RGBColor(0xFF, 0xED, 0xD5)),
        (776, 344, 156, 34, "Co-Signed Adjust", RGBColor(0xF3, 0xE8, 0xFF)),
        (950, 344, 150, 34, "SHA-256 Settlement", RGBColor(0xDC, 0xFC, 0xE7)),
    ]
    for dx, dy, dw, dh, dtxt, dcol in dag_nodes_bot:
        add_styled_card(slide, dx, dy, dw, dh, solid_fill=dcol, solid_border=C_INDIGO, border_w=1.0, radius_adj=0.2)
        add_text_box(slide, dx + 3, dy + 2, dw - 6, dh - 4, text=dtxt, font_name=FONT_UI, font_size=10.5, bold=True, color=C_INK, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)
    for ax in (758, 932):
        add_text_box(slide, ax, 346, 18, 30, text="→", font_name=FONT_HEAD, font_size=12, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)

    add_text_box(slide, 590, 394, 525, 30, text="ISSUE  →  RETURN / SCRAP / DUST  →  DISPUTE_OPEN  →  ADJUSTMENT  →  SETTLEMENT", font_name=FONT_HEAD, font_size=11.5, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER)
    for i, rtxt in enumerate(right_pills):
        py = 292 + i * 44
        add_styled_card(slide, 1125, py, 260, 36, solid_fill=C_WHITE, solid_border=C_INDIGO, border_w=1.25, radius_adj=0.25)
        add_text_box(slide, 1130, py + 2, 250, 32, text=rtxt, font_name=FONT_UI, font_size=11.5, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)

    # Layer 4: 5 Agentic Service cards
    agents = [
        ("ManagerAgent", "Off-hot-path router &\nprompt-injection guard.", RGBColor(0xDC, 0xEA, 0xFE)),
        ("IntakeAgent", "Extracts structured slip &\nrework JSON from speech.", RGBColor(0xDC, 0xFC, 0xE7)),
        ("ReconcileAgent", "Renders slot-locked neutral\nbilingual flag summaries.", RGBColor(0xFE, 0xF3, 0xC7)),
        ("SettleAgent", "Drafts settlement pack &\nRule 55 GST challan.", RGBColor(0xFF, 0xED, 0xD5)),
        ("Output Validator", "Enforces zero-new-digit &\nblame-lexicon gates.", RGBColor(0xF3, 0xE8, 0xFF)),
    ]
    for i, (atitle, abody, acol) in enumerate(agents):
        ax = 325 + i * 214
        add_styled_card(slide, ax, 454, 202, 90, solid_fill=acol, solid_border=C_INDIGO, border_w=1.25, radius_adj=0.12)
        add_text_box(slide, ax + 8, 460, 186, 26, text=atitle, font_name=FONT_HEAD, font_size=13.5, bold=True, color=C_INK)
        add_text_box(slide, ax + 8, 488, 186, 50, text=abody, font_name=FONT_UI, font_size=11.5, color=C_SLATE)

    # Layer 5: 6 Governance badges
    govs = ["✓ Zero AI Math Invariant", "✓ Append-Only DB Triggers", "✓ DPDP Voice Consent Log", "✓ Tenant RLS Isolation", "✓ 500-Event CI Eval Gate", "✓ ₹38/mo AI Cost Cap"]
    for i, gtxt in enumerate(govs):
        gx = 325 + i * 178
        add_styled_card(slide, gx, 582, 168, 44, solid_fill=C_WHITE, solid_border=C_BORDER_LIGHT, border_w=1.25, radius_adj=0.2)
        add_text_box(slide, gx + 4, 584, 160, 40, text=gtxt, font_name=FONT_UI, font_size=11.5, bold=True, color=C_INK, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)

    # Layer 6: 4 Role consoles + protocol bar
    roles = ["Jeweller Bench Console", "Karigar Voice PWA + IVR", "Lender Work Passport View", "Rule 55 GST Challan PDF"]
    for i, rtxt in enumerate(roles):
        rx = 325 + i * 268
        add_styled_card(slide, rx, 664, 254, 46, solid_fill=C_WHITE, solid_border=C_INDIGO, border_w=1.25, radius_adj=0.18)
        add_text_box(slide, rx + 8, 666, 238, 42, text=rtxt, font_name=FONT_HEAD, font_size=13, bold=True, color=C_INK, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)
    add_styled_card(slide, 325, 720, 1060, 38, solid_fill=C_OUTCOME_BG, solid_border=C_BORDER_LIGHT, border_w=1.0, radius_adj=0.2)
    add_text_box(
        slide, 335, 722, 1040, 34,
        text="FastAPI 0.115   |   PostgreSQL 16 (Append-Only)   |   Web Serial & Web Bluetooth   |   NPCI UPI Intent   |   Cloud Run (asia-south1)",
        font_name=FONT_HEAD, font_size=12.5, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE
    )

def build_slide_07_tech_stack(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_slide_title(slide, "TECHNOLOGY STACK", y_pt=14, font_size=44)

    cards = [
        (36, 98, "slide07_cat_1.png", "Indic Voice & Vision AI", [
            ("Speech-to-Text:", "Sarvam Saaras v3 (Bengali, Hindi, Kannada)"),
            ("Text-to-Speech:", "Sarvam Bulbul v3 (warm read-back)"),
            ("Fallback STT:", "Self-hosted IndicConformer 600M"),
            ("Scale Vision:", "Gemini 2.5 Flash-Lite 7-segment OCR"),
            ("Numeral Parser:", "Deterministic ratti/ana/tola/mg"),
        ]),
        (492, 98, "slide07_cat_2.png", "Governed Agentic Layer", [
            ("Orchestration:", "Lyzr Studio (Manager + 3 agents)"),
            ("IntakeAgent:", "Slip & rework JSON extraction"),
            ("ReconcileAgent:", "Slot-locked bilingual flag cards"),
            ("SettleAgent:", "Settlement + Rule 55 challan"),
            ("Guardrails:", "Zero-new-digit & blame filter"),
        ]),
        (948, 98, "slide07_cat_3.png", "Backend & Ledger Core", [
            ("API Runtime:", "Python 3.12 + FastAPI 0.115"),
            ("Ledger Engine:", "Pure-Python integer mg (0 float)"),
            ("Database:", "PostgreSQL 16 + append-only triggers"),
            ("Cache / Queue:", "Upstash Redis + Cloudflare R2"),
            ("Isolation:", "Row-Level Security (tenant_id)"),
        ]),
        (36, 444, "slide07_cat_4.png", "Frontend & Workshop UX", [
            ("Bench & Phone:", "Next.js 15 + React 19 + TypeScript"),
            ("Offline Queue:", "IndexedDB + Service Worker PWA"),
            ("Styling & UI:", "Tailwind CSS 4 + HeroUI / shadcn"),
            ("Typography:", "Noto Sans Bengali / Devanagari + Mono"),
            ("Live Stream:", "Server-Sent Events (SSE) timeline"),
        ]),
        (492, 444, "slide07_cat_5.png", "Hardware, Telecom & DPI Rails", [
            ("Wired Scale:", "Web Serial API (USB-OTG RS-232)"),
            ("Wireless Scale:", "Web Bluetooth GATT (0x181D)"),
            ("Feature Phone:", "Exotel / Twilio Missed-Call IVR"),
            ("Labour Payout:", "NPCI UPI Deep-Link + Setu AA"),
            ("Compliance:", "CGST Sec 143 / Rule 55 Challan PDF"),
        ]),
        (948, 444, "slide07_cat_6.png", "Cryptography, Security & Ops", [
            ("Signatures:", "Ed25519 (RFC 8032) via PyNaCl"),
            ("Hash Chain:", "RFC 8785 JCS + SHA-256"),
            ("Device Keys:", "WebCrypto + Cloud KMS envelope"),
            ("Deploy & CI:", "Cloud Run (asia-south1) + GitHub CI"),
            ("Observability:", "OpenTelemetry + 500-event eval"),
        ]),
    ]
    for cx, cy, cic, ctitle, rows in cards:
        add_styled_card(slide, cx, cy, 438, 326, fill_key="tech_fill", border_key="tech_border", border_w=2.25, radius_adj=0.04)
        add_pic_fit(slide, cic, cx + 18, cy + 16, 48, 48)
        add_text_box(slide, cx + 76, cy + 18, 346, 44, text=ctitle, font_name=FONT_HEAD, font_size=21, bold=True, color=C_INK, v_anchor=MSO_ANCHOR.MIDDLE)
        div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Pt(cx + 20), Pt(cy + 72), Pt(398), Pt(1.2))
        div.fill.solid()
        div.fill.fore_color.rgb = C_BORDER_LIGHT
        div.line.fill.background()

        tb = add_text_box(slide, cx + 20, cy + 82, 398, 232)
        tf = tb.text_frame
        for idx, (rk, rv) in enumerate(rows):
            p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
            p.line_spacing = 1.25
            r0 = p.add_run()
            r0.text = rk + " "
            r0.font.name = FONT_HEAD
            r0.font.size = Pt(14.5)
            r0.font.bold = True
            r0.font.color.rgb = C_INK
            r1 = p.add_run()
            r1.text = rv
            r1.font.name = FONT_BODY
            r1.font.size = Pt(14.0)
            r1.font.color.rgb = C_SLATE


def build_slide_08_ux_prototype(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_text_box(slide, 36, 14, 920, 56, text="USER EXPERIENCE - PROTOTYPE", font_name=FONT_HEAD, font_size=40, bold=True, color=C_INK)

    for lx, ltxt in [(1010, "GITHUB REPO"), (1215, "LIVE STAGE DEMO")]:
        tb = add_text_box(slide, lx, 22, 195, 36)
        p = tb.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.RIGHT
        r = p.add_run()
        r.text = ltxt
        r.font.name = FONT_HEAD
        r.font.size = Pt(17)
        r.font.bold = True
        r.font.underline = True
        r.font.color.rgb = C_ROYAL

    panels = [
        (36, 92, "1. JEWELLER BENCH — SCALE CAPTURE & ISSUE", "slide08_ui_1.png", [
            ("LIVE SCALE READ (USB / BLE)", "40.000 g   (40,000 mg)", C_ROYAL),
            ("DECLARED FINENESS & PURE GOLD", "22K (916 ppt)  →  36,640 mg fine", C_INK),
            ("AGREED WASTAGE NORM (2.50%)", "250 bps  →  1,000 mg allowance", C_GREEN),
            ("BENCH ACTION", "Jeweller signs ISSUE (Ed25519)", C_INDIGO),
        ]),
        (732, 92, "2. KARIGAR PHONE — BENGALI VOICE READ-BACK & SIGN", "slide08_ui_2.png", [
            ("BULBUL v3 VOICE READ-BACK (BENGALI)", "“আপনি ৪০ গ্রাম ২২ ক্যারেট সোনা নিচ্ছেন...”", C_INDIGO),
            ("KARIGAR SPOKEN CONFIRMATION", "Confirmed on phone / IVR press 1", C_GREEN),
            ("CRYPTOGRAPHIC CO-SIGNATURE", "Karigar Ed25519 key locked on row", C_ROYAL),
            ("TOTAL BENCH TIME", "18 seconds · Zero typing", C_INK),
        ]),
        (36, 434, "3. WEEKLY RECONCILE — +380 MG FLAG & VOICE DISPUTE", "slide08_ui_3.png", [
            ("RETURN + SCRAP vs EXPECTED", "38,120 mg + 500 mg  (Loss: 1,380 mg)", C_INK),
            ("DETERMINISTIC M-05 FLAG", "+380 mg OVER_NORM_v1 (Neutral)", C_AMBER),
            ("VOICE REWORK EVIDENCE", "Solder joint cracked twice (+130 mg)", C_INDIGO),
            ("SETTLEMENT + UPI LABOUR PAY", "₹5,040 paid · Rule 55 PDF ready", C_GREEN),
        ]),
        (732, 434, "4. KARIGAR WORK PASSPORT & CHAIN VERIFIER", "slide08_ui_4.png", [
            ("VERIFIED VOLUME & ORDERS", "15 Co-Signed Orders · 194.000 g 22K", C_ROYAL),
            ("DISPUTE-FREE TRACK RECORD", "93.3% Clean · +0.18% vs Norm", C_GREEN),
            ("HASH-CHAIN AUDIT STATUS", "8/8 SHA-256 & 16/16 Ed25519 PASS", C_INDIGO),
            ("NBFC / SHG CREDIT EXPORT", "7-Day Consented PDF + QR Token", C_INK),
        ]),
    ]
    for px, py, ptitle, pimg, pmetrics in panels:
        add_styled_card(slide, px, py, 672, 312, solid_fill=C_NEUTRAL_BG, border_key="tech_border", border_w=2.25, radius_adj=0.04)
        add_knockout_pill(slide, px + 24, py - 18, 624, 34, ptitle, font_size=13.5)
        add_pic_fit(slide, pimg, px + 14, py + 26, 265, 272)

        for midx, (mlabel, mval, mcol) in enumerate(pmetrics):
            my = py + 28 + midx * 68
            add_styled_card(slide, px + 290, my, 366, 60, solid_fill=C_WHITE, solid_border=C_BORDER_LIGHT, border_w=1.0, radius_adj=0.12)
            add_text_box(slide, px + 300, my + 4, 346, 20, text=mlabel, font_name=FONT_UI, font_size=10.5, bold=True, color=C_SLATE)
            add_text_box(slide, px + 300, my + 24, 346, 30, text=mval, font_name=FONT_UI, font_size=13.5, bold=True, color=mcol)

    add_styled_card(slide, 36, 756, 1368, 38, solid_fill=C_OUTCOME_BG, solid_border=C_INDIGO, border_w=1.25, radius_adj=0.2)
    add_text_box(
        slide, 46, 758, 1348, 34,
        text="WEIGH.  HEAR.  SIGN.   —   18-Second Bench Capture   ·   Zero Typing   ·   Live in Browser & Feature-Phone IVR",
        font_name=FONT_HEAD, font_size=14, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE
    )


def build_slide_09_live_scenario(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_slide_title(slide, "LIVE JOB-WORK SCENARIO", y_pt=10, font_size=40)
    add_text_box(
        slide, 60, 62, 1320, 28,
        text="Order #14: Shetty Jewellers (Bengaluru)  ↔  Rafiq Sheikh (Karigar)  ·  4 Plain 22K Bangles",
        font_name=FONT_BODY, font_size=18, bold=True, color=C_ROYAL, align=PP_ALIGN.CENTER
    )

    # Card 1: Top-Left
    add_styled_card(slide, 36, 114, 672, 316, solid_fill=C_NEUTRAL_BG, border_key="tech_border", border_w=3.0, radius_adj=0.04)
    add_knockout_pill(slide, 76, 95, 592, 36, "SCALE CAPTURE & RETURN DIFFERENCE", font_size=15)

    add_styled_card(slide, 54, 144, 310, 185, solid_fill=C_WHITE, solid_border=C_BORDER_LIGHT, border_w=1.25, radius_adj=0.06)
    add_text_box(slide, 66, 152, 286, 26, text="MONDAY ISSUE (CO-SIGNED)", font_name=FONT_HEAD, font_size=13.5, bold=True, color=C_ROYAL)
    add_text_box(
        slide, 66, 182, 286, 138,
        text="• Gross 22K (916): 40,000 mg\n• Fine Gold: 36,640 mg\n• Agreed Norm: 2.50% (250 bps)\n• Allowed Loss: 1,000 mg\n• Signed: Shetty + Rafiq",
        font_name=FONT_BODY, font_size=13.5, color=C_INK, line_spacing=1.22
    )

    add_styled_card(slide, 380, 144, 310, 185, solid_fill=C_WHITE, solid_border=C_BORDER_LIGHT, border_w=1.25, radius_adj=0.06)
    add_text_box(slide, 392, 152, 286, 26, text="THURSDAY RETURN (MEASURED)", font_name=FONT_HEAD, font_size=13.5, bold=True, color=C_AMBER)
    add_text_box(
        slide, 392, 182, 286, 138,
        text="• Finished Bangles: 38,120 mg\n• Katran (Scrap) Return: 500 mg\n• Total Accounted: 38,620 mg\n• Actual Loss: 1,380 mg (3.45%)\n• Over-Norm Delta: +380 mg",
        font_name=FONT_BODY, font_size=13.5, color=C_INK, line_spacing=1.22
    )

    add_styled_card(slide, 54, 340, 636, 74, solid_fill=C_OUTCOME_BG, solid_border=C_INDIGO, border_w=1.0, radius_adj=0.1)
    add_text_box(
        slide, 66, 344, 612, 66,
        text="Karigar Bengali Voice Note (Saaras v3 STT):\n“বাবু, দ্বিতীয় চুড়ির জোড় দুইবার ফেটে গেছে, দুবার রাঙ ঝালাই করতে হয়েছে।”\n(“Babu, the second bangle joint cracked twice; had to solder-rework it twice.”)",
        font_name=FONT_UI, font_size=12, bold=True, color=C_INDIGO, line_spacing=1.15
    )

    # Card 2: Top-Right
    add_styled_card(slide, 732, 114, 672, 316, solid_fill=C_NEUTRAL_BG, border_key="tech_border", border_w=3.0, radius_adj=0.04)
    add_knockout_pill(slide, 772, 95, 592, 36, "GOVERNED AGENT FLAG & DUAL RESOLUTION", font_size=15)

    res_rows = [
        ("1. M-05 Variance Engine", "Actual loss 1,380 mg vs 1,000 mg norm → +380 mg (+95 bps).", "FLAGGED", C_AMBER_BG, C_AMBER),
        ("2. ReconcileAgent Card", "Slot-locked Bengali + English card; zero blame words.", "OPENED", RGBColor(0xDC, 0xEA, 0xFE), C_ROYAL),
        ("3. Co-Signed Adjustment", "130 mg solder rework accepted; 250 mg balance settled.", "RESOLVED", C_GREEN_BG, C_GREEN),
    ]
    for ridx, (rtitle, rdesc, rbadge, rbg, rfg) in enumerate(res_rows):
        ry = 146 + ridx * 88
        add_styled_card(slide, 750, ry, 636, 76, solid_fill=C_WHITE, solid_border=C_BORDER_LIGHT, border_w=1.25, radius_adj=0.1)
        add_text_box(slide, 764, ry + 8, 465, 26, text=rtitle, font_name=FONT_HEAD, font_size=15, bold=True, color=C_INK)
        add_text_box(slide, 764, ry + 36, 465, 34, text=rdesc, font_name=FONT_BODY, font_size=13.5, color=C_SLATE)
        add_styled_card(slide, 1242, ry + 18, 128, 40, solid_fill=rbg, solid_border=rfg, border_w=1.5, radius_adj=0.25)
        add_text_box(slide, 1246, ry + 20, 120, 36, text=rbadge, font_name=FONT_HEAD, font_size=13, bold=True, color=rfg, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)

    # Card 3: Bottom-Left
    add_styled_card(slide, 36, 462, 672, 316, solid_fill=C_NEUTRAL_BG, border_key="tech_border", border_w=3.0, radius_adj=0.04)
    add_knockout_pill(slide, 116, 443, 512, 36, "ORDER #14 IMPACT METRICS", font_size=15)

    kpis = [
        (54, 492, "40.000 g", "22K Issue Co-Signed\n(36,640 mg Fine Gold)", C_ROYAL),
        (380, 492, "+380 mg", "Over-Norm Variance\nCaught Deterministically", C_AMBER),
        (54, 632, "130 mg", "Rework Allowance\nCo-Signed Without Fight", C_INDIGO),
        (380, 632, "₹5,040", "UPI Labour Settled\nin 45 Seconds vs 40 Min", C_GREEN),
    ]
    for kx, ky, kval, ksub, kcol in kpis:
        add_styled_card(slide, kx, ky, 310, 126, solid_fill=C_WHITE, solid_border=C_BORDER_LIGHT, border_w=1.25, radius_adj=0.08)
        add_text_box(slide, kx + 12, ky + 10, 286, 54, text=kval, font_name=FONT_HEAD, font_size=34, bold=True, color=kcol, align=PP_ALIGN.CENTER)
        add_text_box(slide, kx + 12, ky + 66, 286, 52, text=ksub, font_name=FONT_BODY, font_size=13.5, bold=True, color=C_INK, align=PP_ALIGN.CENTER)

    # Card 4: Bottom-Right
    add_styled_card(slide, 732, 462, 672, 316, solid_fill=C_NEUTRAL_BG, border_key="tech_border", border_w=3.0, radius_adj=0.04)
    add_knockout_pill(slide, 792, 443, 552, 36, "GENERATED AUDIT & CREDIT PACK", font_size=15)

    arts = [
        ("slide09_art_1.png", "CGST Rule 55 Job-Work Challan PDF", "Auto-filled HSN 7113, 40,000 mg issue, 38,620 mg return & signatures."),
        ("slide09_art_2.png", "8-Event SHA-256 Hash-Chain Receipt", "Cryptographic proof: 8/8 hashes valid & 16/16 Ed25519 signatures verified."),
        ("slide09_art_3.png", "Bilingual Settlement Summary + UPI", "Bengali & English receipt with UTR reference for ₹5,040 labour payout."),
        ("slide09_art_4.png", "Updated Karigar Work Passport", "Order #14 appended: 15 verified orders, 194.000 g volume, QR token."),
    ]
    for aidx, (aimg, atitle, adesc) in enumerate(arts):
        ay = 492 + aidx * 66
        add_styled_card(slide, 750, ay, 636, 58, solid_fill=C_WHITE, solid_border=C_BORDER_LIGHT, border_w=1.25, radius_adj=0.12)
        add_pic_fit(slide, aimg, 762, ay + 7, 44, 44)
        add_text_box(slide, 816, ay + 4, 556, 24, text=atitle, font_name=FONT_HEAD, font_size=14.5, bold=True, color=C_INK)
        add_text_box(slide, 816, ay + 28, 556, 26, text=adesc, font_name=FONT_BODY, font_size=12.5, color=C_SLATE)


def _set_cell_border_and_fill(cell, fill_rgb, border_rgb=C_BLACK, border_pt=1.5):
    tcPr = cell._tc.get_or_add_tcPr()
    for child in list(tcPr):
        tcPr.remove(child)
    w_emu = str(int(border_pt * 12700))
    hex_col = f"{border_rgb[0]:02X}{border_rgb[1]:02X}{border_rgb[2]:02X}"
    for edge in ("a:lnL", "a:lnR", "a:lnT", "a:lnB"):
        ln = etree.SubElement(tcPr, qn(edge), w=w_emu, cap="flat", cmpd="sng", algn="ctr")
        sf = etree.SubElement(ln, qn("a:solidFill"))
        etree.SubElement(sf, qn("a:srgbClr"), val=hex_col)
    cell.fill.solid()
    cell.fill.fore_color.rgb = fill_rgb


def build_slide_10_readiness_matrix(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_slide_title(slide, "BHARAT DEPLOYMENT READINESS", y_pt=14, font_size=44)
    add_text_box(
        slide, 100, 74, 1240, 32,
        text="Bench-ready.     Karigar-ready.     Audit-ready.",
        font_name=FONT_BODY, font_size=22, color=C_INK, align=PP_ALIGN.CENTER
    )

    tbl_shape = slide.shapes.add_table(5, 4, Pt(48), Pt(124), Pt(1344), Pt(636))
    tbl = tbl_shape.table
    headers = [
        ("slide10_col_1.png", "BENCH & CHANNELS"),
        ("slide10_col_2.png", "TRUST & CRYPTO"),
        ("slide10_col_3.png", "COMPLIANCE & DPI"),
        ("slide10_col_4.png", "UNIT ECONOMICS"),
    ]
    rows_data = [
        [
            ("USB, BLE & Camera Scale", "Works with ₹1,500–₹8,000 10 mg workshop scales."),
            ("Dual Ed25519 Co-Sign", "Every row requires Jeweller + Karigar keys."),
            ("CGST Sec 143 / Rule 55", "One-tap statutory job-work challan PDF."),
            ("₹38 / Month AI Cost", "Per active bench across 120 monthly events."),
        ],
        [
            ("Bengali, Hindi, Kannada", "Code-mixed ratti/ana/tola & rework speech."),
            ("RFC 8785 + SHA-256 Chain", "Tamper-evident hash chain with DB triggers."),
            ("DPDP Act 2023 Consent", "Spoken language notice & signed consent hash."),
            ("₹79 / Month Entry Plan", "52% gross margin even on starter tier."),
        ],
        [
            ("Offline IndexedDB Queue", "Zero bench downtime during power/net cuts."),
            ("Zero-AI-Math Invariant", "100% deterministic integer milligram arithmetic."),
            ("BIS HUID 2026 Alignment", "Ready for automated scale-to-portal rules."),
            ("₹249 / Month Gaddi Pro", "85% gross margin with GST Challan & UPI."),
        ],
        [
            ("Feature-Phone IVR Fallback", "Missed-call + Bulbul v3 callback + press 1."),
            ("Neutral Bilingual Flags", "Zero blame words; 500-event CI eval gate."),
            ("NBFC Work Passport", "Consented 7-day credential outside CICRA."),
            ("JanAI Doot Distribution", "Zero-CAC rollout via Bullion & Karigar sanghs."),
        ],
    ]

    for c in range(4):
        tbl.columns[c].width = Pt(336)
        cell = tbl.cell(0, c)
        _set_cell_border_and_fill(cell, RGBColor(0xEA, 0xF4, 0xFF), C_BLACK, 1.5)
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        cell.margin_left = Pt(54)
        cell.margin_right = Pt(10)
        tf = cell.text_frame
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = headers[c][1]
        r.font.name = FONT_HEAD
        r.font.size = Pt(18)
        r.font.bold = True
        r.font.color.rgb = C_INDIGO

    tbl.rows[0].height = Pt(96)
    for c in range(4):
        add_pic_fit(slide, headers[c][0], 48 + c * 336 + 18, 124 + 27, 42, 42)

    for r_idx in range(4):
        tbl.rows[r_idx + 1].height = Pt(135)
        for c_idx in range(4):
            cell = tbl.cell(r_idx + 1, c_idx)
            cell_bg = RGBColor(0xE8, 0xEE, 0xFF) if (r_idx == 2 and c_idx == 3) else C_TABLE_BODY
            _set_cell_border_and_fill(cell, cell_bg, C_BLACK, 1.5)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.margin_left = Pt(14)
            cell.margin_right = Pt(14)
            tf = cell.text_frame
            head_txt, sub_txt = rows_data[r_idx][c_idx]
            p0 = tf.paragraphs[0]
            p0.alignment = PP_ALIGN.CENTER
            p0.line_spacing = 1.15
            r0 = p0.add_run()
            r0.text = head_txt + "\n"
            r0.font.name = FONT_HEAD
            r0.font.size = Pt(17)
            r0.font.bold = True
            r0.font.color.rgb = C_INK
            r1 = p0.add_run()
            r1.text = sub_txt
            r1.font.name = FONT_BODY
            r1.font.size = Pt(14.0)
            r1.font.color.rgb = C_SLATE


def build_slide_11_roadmap(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_slide_title(slide, "ROADMAP", y_pt=14, font_size=46)

    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Pt(168), Pt(108), Pt(1104), Pt(3.5))
    bar.fill.solid()
    bar.fill.fore_color.rgb = C_INDIGO
    bar.line.fill.background()

    stages = [
        ("1", "slide11_stage_1.png", "VALIDATE", "DAYS 1–15", [
            "Core integer-mg ledger & DAG",
            "Ed25519 + RFC 8785 hash chain",
            "Sarvam Bengali/Hindi voice flow",
            "Lyzr 4-agent governed pipeline",
            "500-event deterministic eval",
        ], "Working Dual-Track Prototype\n(Built Today)"),
        ("2", "slide11_stage_2.png", "STREET PILOT", "DAYS 16–30", [
            "25 workshops in Raja Market",
            "& Chickpet (Bengaluru cluster)",
            "USB-OTG & BLE scale kits live",
            "Weekly Friday hisab on Tola",
            "Karigar Sangha co-sign audits",
        ], "25 Benches · 150 Karigars\n(Days 16–30)"),
        ("3", "slide11_stage_3.png", "CLUSTER LOOP", "DAYS 31–60", [
            "Expand to Bowbazar (Kolkata)",
            "& Zaveri Bazaar (Mumbai)",
            "Feature-phone IVR callback live",
            "Rule 55 GST challan automation",
            "JanAI Doot Sangh distribution",
        ], "250 Workshops · 1,500 Karigars\n(Days 31–60)"),
        ("4", "slide11_stage_4.png", "CREDIT & DPI RAILS", "DAYS 61–90", [
            "NBFC & Co-op Bank pilots on",
            "Karigar Work Passport tokens",
            "NPCI UPI Autopay & Setu AA",
            "Tamil, Gujarati, Marathi packs",
            "Self-hosted IndicConformer",
        ], "1,000 Workshops · 1st Loans\n(Days 61–90)"),
        ("5", "slide11_stage_5.png", "NATIONAL GOLD LEDGER", "MONTH 6+", [
            "BIS Hallmarking / HUID 2026",
            "automated scale integration",
            "Pan-India cluster coverage",
            "Formal credit for 1M+ karigars",
            "Standard trust layer for gold",
        ], "50,000+ Workshops Nationally\n(Month 6+)"),
    ]

    for idx, (snum, sic, stitle, stime, sbullets, soutcome) in enumerate(stages):
        cx = 36 + idx * 278
        ccenter = cx + 128

        if idx < 4:
            add_text_box(slide, ccenter + 118, 92, 36, 32, text=">", font_name=FONT_HEAD, font_size=22, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)

        circ = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(ccenter - 23), Pt(86), Pt(46), Pt(46))
        circ.fill.solid()
        circ.fill.fore_color.rgb = C_INDIGO
        circ.line.color.rgb = C_WHITE
        circ.line.width = Pt(2.0)
        add_text_box(slide, ccenter - 23, 88, 46, 42, text=snum, font_name=FONT_HEAD, font_size=20, bold=True, color=C_WHITE, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)

        add_styled_card(slide, cx, 146, 256, 624, solid_fill=C_WHITE, solid_border=C_BORDER_LIGHT, border_w=1.5, radius_adj=0.04)
        add_pic_fit(slide, sic, ccenter - 26, 160, 50, 50)
        add_text_box(slide, cx + 10, 214, 236, 32, text=stitle, font_name=FONT_HEAD, font_size=17.5, bold=True, color=C_INK, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)
        add_text_box(slide, cx + 10, 244, 236, 22, text=stime, font_name=FONT_HEAD, font_size=12, bold=True, color=C_ROYAL, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)

        div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Pt(cx + 18), Pt(270), Pt(220), Pt(1.2))
        div.fill.solid()
        div.fill.fore_color.rgb = C_BORDER_LIGHT
        div.line.fill.background()

        tb = add_text_box(slide, cx + 14, 282, 228, 330)
        tf = tb.text_frame
        for b_i, btxt in enumerate(sbullets):
            p = tf.paragraphs[0] if b_i == 0 else tf.add_paragraph()
            p.alignment = PP_ALIGN.CENTER
            p.line_spacing = 1.25
            r = p.add_run()
            r.text = btxt
            r.font.name = FONT_BODY
            r.font.size = Pt(14.0)
            r.font.color.rgb = C_SLATE

        div2 = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Pt(cx + 18), Pt(636), Pt(220), Pt(1.2))
        div2.fill.solid()
        div2.fill.fore_color.rgb = C_BORDER_LIGHT
        div2.line.fill.background()

        add_styled_card(slide, cx + 12, 648, 232, 108, solid_fill=C_OUTCOME_BG, solid_border=C_BORDER_LIGHT, border_w=1.0, radius_adj=0.08)
        add_text_box(slide, cx + 18, 654, 220, 24, text="OUTCOME", font_name=FONT_HEAD, font_size=13.5, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER)
        add_text_box(slide, cx + 16, 682, 224, 66, text=soutcome, font_name=FONT_BODY, font_size=13.5, bold=True, color=C_INK, align=PP_ALIGN.CENTER)


def build_slide_12_why_ready(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    init_chanakya_slide_background(slide)
    add_slide_title(slide, "WHY WE ARE READY?", y_pt=16, font_size=46)

    bullets = [
        ("Built on Real Goldsmith Workshop Economics & Norms:",
         "Every rule in Tola is anchored in how Indian gaddis actually work — 22K (916) and 18K (750) fineness, item-specific wastage norms (2.5% plain bangles to 5.5% filigree), katran scrap and nyara dust recovery, and CGST Section 143 / Rule 55 job-work challans."),
        ("Working Dual-Track Codebase & Zero-Float Determinism:",
         "We didn't build a slideware wrapper. Our shared ledger-core enforces integer-milligram conservation, RFC 8785 canonical JSON + SHA-256 hash chaining, dual Ed25519 co-signatures, and a 4-agent Lyzr pipeline where AI never computes or rounds a single milligram."),
        ("Unit Economics & JanAI Doot Distribution That Scale:",
         "At ₹38/month in AI + telecom cost per active bench against ₹79–₹249/month SaaS tiers, Tola is gross-margin positive from Day 1 — and spreads cluster-by-cluster through Bullion Associations and Bengali Karigar Sanghas at near-zero CAC."),
    ]
    for idx, (bhead, bbody) in enumerate(bullets):
        by = 118 + idx * 182
        dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(58), Pt(by + 16), Pt(12), Pt(12))
        dot.fill.solid()
        dot.fill.fore_color.rgb = C_INK
        dot.line.fill.background()
        tb = add_text_box(slide, 84, by + 6, 715, 160, line_spacing=1.22)
        p = tb.text_frame.paragraphs[0]
        r0 = p.add_run()
        r0.text = bhead + " "
        r0.font.name = FONT_HEAD
        r0.font.size = Pt(20)
        r0.font.bold = True
        r0.font.color.rgb = C_INK
        r1 = p.add_run()
        r1.text = bbody
        r1.font.name = FONT_BODY
        r1.font.size = Pt(17.5)
        r1.font.color.rgb = C_SLATE

    proofs = [
        (112, "slide12_proof_1.png", "Live Dual-Role Bench + Karigar Voice Prototype (Order #14 Verified)"),
        (394, "slide12_proof_2.png", "8/8 SHA-256 Hash-Chain & 16/16 Ed25519 Co-Signature Audit Pass"),
    ]
    for py, pimg, pcap in proofs:
        add_styled_card(slide, 836, py, 556, 266, solid_fill=C_WHITE, border_key="tech_border", border_w=2.0, radius_adj=0.04)
        add_pic_fit(slide, pimg, 852, py + 12, 524, 206)
        add_text_box(slide, 852, py + 222, 524, 36, text=pcap, font_name=FONT_HEAD, font_size=13.5, bold=True, color=C_INDIGO, align=PP_ALIGN.CENTER, v_anchor=MSO_ANCHOR.MIDDLE)

    add_text_box(slide, 100, 684, 1240, 64, text="THANK YOU", font_name=FONT_HEAD, font_size=52, bold=True, color=C_INK, align=PP_ALIGN.CENTER)
    add_text_box(
        slide, 100, 748, 1240, 36,
        text="TOLA  ·  Two Signatures on Every Gram  ·  Weigh. Hear. Sign.",
        font_name=FONT_BODY, font_size=18, bold=True, color=C_ROYAL, align=PP_ALIGN.CENTER
    )


def export_pptx_to_pngs(pptx_path: Path, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = out_dir / "TOLA_Pitch_Deck_render.pdf"
    norm_path = out_dir / "TOLA_Pitch_Deck_norm.pptx"
    import win32com.client
    import fitz

    powerpoint = win32com.client.DispatchEx("PowerPoint.Application")
    try:
        deck = powerpoint.Presentations.Open(str(pptx_path.resolve()), WithWindow=False)
        deck.SaveAs(str(norm_path.resolve()), 24)  # 24 = ppSaveAsOpenXMLPresentation (native PowerPoint serializer)
        deck.SaveAs(str(pdf_path.resolve()), 32)  # 32 = ppSaveAsPDF
        deck.Close()
    finally:
        powerpoint.Quit()

    shutil.copy2(str(norm_path), str(pptx_path))
    shutil.copy2(str(norm_path), str(OUT_DOCS))
    if norm_path.exists():
        norm_path.unlink()

    doc = fitz.open(str(pdf_path))
    for idx, page in enumerate(doc):
        pix = page.get_pixmap(dpi=144, alpha=False)
        out_png = out_dir / f"tola_slide_{idx + 1:02d}.png"
        pix.save(str(out_png))
    doc.close()
    print(f"Exported 12 slide PNGs to {out_dir}")


def verify_pptx_compliance(pptx_path: Path):
    import zipfile
    import numpy as np
    from PIL import Image
    import io

    prs = Presentation(str(pptx_path))
    assert len(prs.slides) == 12, f"Expected 12 slides, got {len(prs.slides)}"
    assert prs.slide_width == Inches(20.0), f"Unexpected width: {prs.slide_width}"
    assert prs.slide_height == Inches(11.25), f"Unexpected height: {prs.slide_height}"

    slide_counts = []
    for idx, s in enumerate(prs.slides):
        text_shapes = [sh for sh in s.shapes if sh.has_text_frame and sh.text_frame.text.strip()]
        tables = [sh for sh in s.shapes if sh.has_table]
        assert len(s.shapes) >= 6, f"Slide {idx+1} has too few shapes ({len(s.shapes)})"
        assert len(text_shapes) >= 3 or len(tables) >= 1, f"Slide {idx+1} missing native text"
        slide_counts.append((idx + 1, len(s.shapes), len(text_shapes), len(tables)))

    # Check Slide 10 native 5x4 table
    s10_tables = [sh.table for sh in prs.slides[9].shapes if sh.has_table]
    assert len(s10_tables) == 1 and len(s10_tables[0].rows) == 5 and len(s10_tables[0].columns) == 4

    # Check OOXML gradients and softEdge in slide XMLs and RGBA transparency in ppt/media/
    grad_count = 0
    soft_edge_count = 0
    media_count = 0
    with zipfile.ZipFile(pptx_path, "r") as zf:
        for name in zf.namelist():
            if name.startswith("ppt/slides/slide") and name.endswith(".xml"):
                xml_bytes = zf.read(name)
                grad_count += xml_bytes.count(b"a:gradFill")
                soft_edge_count += xml_bytes.count(b"a:softEdge")
            elif name.startswith("ppt/media/") and name.endswith(".png"):
                media_count += 1
                im = Image.open(io.BytesIO(zf.read(name)))
                assert im.mode == "RGBA", f"{name} is {im.mode}, expected RGBA"
                arr = np.array(im)
                alpha = arr[:, :, 3]
                corners = [int(alpha[0, 0]), int(alpha[0, -1]), int(alpha[-1, 0]), int(alpha[-1, -1])]
                center_a = int(alpha[alpha.shape[0] // 2, alpha.shape[1] // 2])
                assert min(corners + [center_a]) == 0, f"{name} has no transparent anchor: corners={corners}, center={center_a}"
                trans_ratio = float((alpha < 16).sum()) / float(alpha.size)
                assert trans_ratio >= 0.04, f"{name} transparent ratio too low: {trans_ratio:.2%}"

    print(f"COMPLIANCE PASS: 12 slides, {media_count} RGBA media files, {grad_count} OOXML gradFills, {soft_edge_count} softEdges.")
    for sc in slide_counts:
        print(f"  Slide {sc[0]:02d}: shapes={sc[1]}, text_frames={sc[2]}, tables={sc[3]}")
    return True


def main():
    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H
    sldSz = prs._element.find(qn("p:sldSz"))
    if sldSz is not None and "type" in sldSz.attrib:
        del sldSz.attrib["type"]

    build_slide_01_cover(prs)
    build_slide_02_hidden_truth(prs)
    build_slide_03_missing_layer(prs)
    build_slide_04_wedge(prs)
    build_slide_05_meet_tola(prs)
    build_slide_06_architecture(prs)
    build_slide_07_tech_stack(prs)
    build_slide_08_ux_prototype(prs)
    build_slide_09_live_scenario(prs)
    build_slide_10_readiness_matrix(prs)
    build_slide_11_roadmap(prs)
    build_slide_12_why_ready(prs)

    OUT_DOCS.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(OUT_ROOT))
    export_pptx_to_pngs(OUT_ROOT, QA_DIR)
    verify_pptx_compliance(OUT_ROOT)
    print(f"Saved PowerPoint-normalized {OUT_ROOT} and copied to {OUT_DOCS}")


if __name__ == "__main__":
    main()
