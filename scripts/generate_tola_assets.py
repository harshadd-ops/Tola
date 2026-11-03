"""
Generate and post-process all transparent RGBA visual and icon assets
for the Tola Pitch Deck using Nano Banana Pro (gemini-3-pro-image-preview / generate_image)
and the /ai-video-studio style workflow + continuous color-unmixing to_transparent_rgba().
"""

import base64
import concurrent.futures
import glob
import io
import json
import math
import os
import urllib.request
import numpy as np
import scipy.ndimage as ndimage
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PROJECT_ROOT = r"g:\HACKATHON_PROJECTS\TECH4BHARAT_GAVS_TOLA"
ASSETS_DIR = os.path.join(PROJECT_ROOT, "artifacts", "pitch_deck_assets")
QA_DIR = os.path.join(PROJECT_ROOT, "artifacts", "pitch_deck_qa")
BRAIN_DIRS = [
    r"C:\Users\satav\.gemini\antigravity\brain\653ae29f-3ab7-4440-a24d-b6a7927285e0",
    r"C:\Users\satav\.gemini\antigravity\brain\602555d6-f50d-4b72-b205-a351e2e16e83",
]

NANO_BANANA_ICON_SUFFIX = (
    "Minimalist flat 2D vector monoline icon in deep navy indigo (#131758) "
    "and soft royal periwinkle (#5B6EE1) clean precision strokes, isolated on a pure solid flat "
    "#FFFFFF white background extending to all four edges, centered with generous white margin, "
    "strictly zero text, no letters, no numbers, no words, no labels, no watermark, no outer box, no checkerboard."
)


def _find_brain_file(pattern: str) -> str:
    for bdir in BRAIN_DIRS:
        matches = sorted(glob.glob(os.path.join(bdir, pattern)))
        if matches:
            return matches[-1]
    raise FileNotFoundError(f"Missing pregenerated hero matching {pattern} in {BRAIN_DIRS}")


def _load_font(size: int, bold: bool = False, italic: bool = False):
    candidates = []
    if bold and italic:
        candidates = [r"C:\Windows\Fonts\segoeuiz.ttf", r"C:\Windows\Fonts\arialbi.ttf"]
    elif bold:
        candidates = [r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf"]
    elif italic:
        candidates = [r"C:\Windows\Fonts\segoeuii.ttf", r"C:\Windows\Fonts\ariali.ttf"]
    else:
        candidates = [r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\arial.ttf"]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def to_transparent_rgba(
    img: Image.Image,
    mode: str = "line_art_on_white",
    bg_tol: float = 18.0,
    feather_ramp: float = 55.0,
    trim_and_pad: bool = True,
    pad_fraction: float = 0.10,
) -> Image.Image:
    """Convert opaque RGB image on solid white background to RGBA PNG with alpha==0 corners & unmixed edges."""
    rgb = np.array(img.convert("RGB"), dtype=np.float32)
    h, w, _ = rgb.shape
    corners = np.concatenate(
        [
            rgb[:8, :8].reshape(-1, 3),
            rgb[:8, -8:].reshape(-1, 3),
            rgb[-8:, :8].reshape(-1, 3),
            rgb[-8:, -8:].reshape(-1, 3),
        ],
        axis=0,
    )
    bg_color = np.median(corners, axis=0)
    dist = np.linalg.norm(rgb - bg_color[None, None, :], axis=2)

    if mode == "line_art_on_white":
        alpha = np.clip((dist - bg_tol) / max(feather_ramp, 1.0), 0.0, 1.0)
    else:  # 'object_on_white': edge-seeded flood fill preserving internal light details
        is_bg = dist < (bg_tol + feather_ramp * 0.45)
        labeled, _ = ndimage.label(is_bg)
        border_labels = set(
            np.unique(
                np.concatenate(
                    [labeled[0, :], labeled[-1, :], labeled[:, 0], labeled[:, -1]]
                )
            )
        ) - {0}
        ext_bg = np.isin(labeled, list(border_labels))
        rim = ndimage.binary_dilation(ext_bg, iterations=2)
        alpha = np.ones((h, w), dtype=np.float32)
        ramp = np.clip((dist - bg_tol) / max(feather_ramp, 1.0), 0.0, 1.0)
        alpha[rim] = ramp[rim]
        alpha[ext_bg & (dist <= bg_tol)] = 0.0

    safe_alpha = np.maximum(alpha[:, :, None], 0.05)
    unmixed = np.clip(
        (rgb - (1.0 - alpha[:, :, None]) * bg_color[None, None, :]) / safe_alpha,
        0.0,
        255.0,
    )
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = unmixed.astype(np.uint8)
    rgba[:, :, 3] = (alpha * 255.0).astype(np.uint8)

    if trim_and_pad:
        ys, xs = np.where(rgba[:, :, 3] > 16)
        if len(xs) > 10 and len(ys) > 10:
            x0, x1 = max(0, int(xs.min()) - 2), min(w, int(xs.max()) + 3)
            y0, y1 = max(0, int(ys.min()) - 2), min(h, int(ys.max()) + 3)
            cropped = rgba[y0:y1, x0:x1]
            ch, cw, _ = cropped.shape
            pad_x = max(8, int(cw * pad_fraction))
            pad_y = max(8, int(ch * pad_fraction))
            padded = np.zeros((ch + 2 * pad_y, cw + 2 * pad_x, 4), dtype=np.uint8)
            padded[pad_y : pad_y + ch, pad_x : pad_x + cw] = cropped
            rgba = padded

    # Guarantee 4 corners are strictly alpha == 0
    rgba[:3, :3, 3] = 0
    rgba[:3, -3:, 3] = 0
    rgba[-3:, :3, 3] = 0
    rgba[-3:, -3:, 3] = 0
    return Image.fromarray(rgba, mode="RGBA")


def build_master_corner_glow_asset():
    """
    Extract and unmix the exact pastel blue/lavender/pink top-left and bottom-right
    corner mesh glows from chanakya_ref_01.png + chanakya_ref_02.png into a 1920x1080
    32-bit RGBA PNG with alpha == 0 across the white center and at the 4 corner pixels.
    """
    ref1_path = os.path.join(QA_DIR, "chanakya_ref_01.png")
    ref2_path = os.path.join(QA_DIR, "chanakya_ref_02.png")
    im1 = np.array(Image.open(ref1_path).convert("RGB"), dtype=np.float32)
    im2 = np.array(Image.open(ref2_path).convert("RGB"), dtype=np.float32)
    h, w, _ = im1.shape

    # Patch the top title strip of ref1 with ref2 where ref2 is pure white/glow
    clean_rgb = im1.copy()
    clean_rgb[40:120, 380:650] = im2[40:120, 380:650]

    # Mask strictly to top-left corner wash and bottom-right corner wash
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    tl_dist = np.sqrt((xx / 620.0) ** 2 + (yy / 490.0) ** 2)
    br_dist = np.sqrt(((w - 1 - xx) / 680.0) ** 2 + ((h - 1 - yy) / 520.0) ** 2)
    corner_weight = np.clip(1.0 - np.minimum(tl_dist, br_dist), 0.0, 1.0)
    corner_mask = np.where(np.minimum(tl_dist, br_dist) < 1.05, 1.0, 0.0)
    corner_mask = ndimage.gaussian_filter(corner_mask, sigma=18.0)

    # Blend towards pure white outside corner zones
    bg_rgb = clean_rgb * corner_mask[:, :, None] + 255.0 * (1.0 - corner_mask[:, :, None])
    bg_rgb = ndimage.gaussian_filter(bg_rgb, sigma=(6.0, 6.0, 0.0))

    # Exact color unmixing against #FFFFFF:
    # bg_rgb = alpha * unmixed_rgb + (1 - alpha) * 255
    max_drop = np.max(255.0 - bg_rgb, axis=2)
    alpha = np.clip((max_drop - 0.5) / 52.0, 0.0, 1.0)
    safe_a = np.maximum(alpha[:, :, None], 1e-3)
    unmixed = np.clip(255.0 - (255.0 - bg_rgb) / safe_a, 0.0, 255.0)

    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = unmixed.astype(np.uint8)
    rgba[:, :, 3] = (alpha * 255.0).astype(np.uint8)

    # Guarantee 4 extreme corner 3x3 pixels have alpha == 0 for strict RGBA asset compliance
    rgba[:3, :3, 3] = 0
    rgba[:3, -3:, 3] = 0
    rgba[-3:, :3, 3] = 0
    rgba[-3:, -3:, 3] = 0

    out_path = os.path.join(ASSETS_DIR, "slide_bg_corner_glows.png")
    Image.fromarray(rgba, mode="RGBA").save(out_path, format="PNG")
    print(f"[Corner Glow RGBA] slide_bg_corner_glows.png ({w}x{h})")


def build_emblem_and_partner_badges():
    """Build slide01_tola_emblem.png and partner marks for Slide 1."""
    src_path = _find_brain_file("slide01_tola_emblem_v2_raw_*.png")
    raw = Image.open(src_path)
    emblem = to_transparent_rgba(raw, mode="line_art_on_white", trim_and_pad=True, pad_fraction=0.06)
    emblem_path = os.path.join(ASSETS_DIR, "slide01_tola_emblem.png")
    emblem.save(emblem_path, format="PNG")
    print(f"[Hero RGBA] slide01_tola_emblem.png <- {os.path.basename(src_path)} ({emblem.size})")

    # Partner mark 1: GAVS / Tech4Bharat circular geometric globe-lotus emblem (matching GFF style)
    sz = 240
    im1 = Image.new("RGBA", (sz, sz), (0, 0, 0, 0))
    d1 = ImageDraw.Draw(im1)
    navy = (19, 23, 88, 255)
    royal = (24, 0, 173, 255)
    d1.ellipse([18, 18, sz - 18, sz - 18], outline=navy, width=9)
    for r_off in [-48, -24, 0, 24, 48]:
        y_line = sz // 2 + r_off
        chord = int(math.sqrt(max(0, (sz // 2 - 22) ** 2 - r_off ** 2)))
        d1.line([sz // 2 - chord, y_line, sz // 2 + chord, y_line], fill=royal, width=6)
    d1.ellipse([sz // 2 - 42, 18, sz // 2 + 42, sz - 18], outline=navy, width=7)
    im1.save(os.path.join(ASSETS_DIR, "slide01_partner_janai.png"), format="PNG")


def build_slide02_radial_network():
    """
    Build a crisp 2400x680 RGBA radial network matching chanakya_ref_02.png 1:1:
    delicate grey radial lines fanning left and right from a central white circular badge
    with a soft shadow and the minimalist TOLA mark inside.
    """
    w, h = 2400, 680
    cx, cy = w // 2, h // 2
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    rng = np.random.default_rng(42)
    nodes = []
    # Left and right fan angles matching chanakya_ref_02.png
    left_angles = np.linspace(-0.42, 0.42, 19)
    right_angles = np.linspace(math.pi - 0.42, math.pi + 0.42, 19)

    for ang_set, side in [(left_angles, -1), (right_angles, 1)]:
        for idx, base_ang in enumerate(ang_set):
            for ring_i, (r_min, r_max) in enumerate([(210, 440), (460, 760), (790, 1120)]):
                if (idx + ring_i) % 2 == 1 and ring_i == 2:
                    continue
                r = rng.uniform(r_min, r_max)
                ang = base_ang + rng.uniform(-0.025, 0.025)
                nx = cx + math.cos(ang) * r
                ny = cy + math.sin(ang) * (r * 0.34)
                if 24 <= nx <= w - 24 and 24 <= ny <= h - 24:
                    nodes.append((nx, ny, ring_i))

    # Draw delicate radial lines from center and cross-links between nearby nodes
    for nx, ny, ring_i in nodes:
        line_alpha = 155 if ring_i < 2 else 110
        draw.line([cx, cy, nx, ny], fill=(185, 192, 204, line_alpha), width=2)

    for i in range(len(nodes)):
        x1, y1, r1 = nodes[i]
        for j in range(i + 1, len(nodes)):
            x2, y2, r2 = nodes[j]
            if (x1 - cx) * (x2 - cx) > 0:
                dist = math.hypot(x2 - x1, y2 - y1)
                if 85 < dist < 195 and (i + j) % 3 == 0:
                    draw.line([x1, y1, x2, y2], fill=(200, 206, 216, 105), width=2)

    # Draw crisp small circular nodes matching chanakya_ref_02.png
    for idx, (nx, ny, ring_i) in enumerate(nodes):
        rad = 8 if idx % 3 != 0 else 7
        if idx % 5 == 0:
            fill_c = (130, 138, 152, 255)
        else:
            fill_c = (52, 58, 68, 255)
        draw.ellipse([nx - rad, ny - rad, nx + rad, ny + rad], fill=fill_c)

    # Center soft shadow + white circular badge (radius 108)
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse([cx - 114, cy - 110, cx + 114, cy + 118], fill=(140, 150, 175, 55))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=12))
    im = Image.alpha_composite(im, shadow)
    draw = ImageDraw.Draw(im)

    draw.ellipse([cx - 108, cy - 108, cx + 108, cy + 108], fill=(255, 255, 255, 255), outline=(222, 226, 236, 255), width=3)

    # Composite sleek TOLA emblem + bold TOLA inside center white circle
    emblem = Image.open(os.path.join(ASSETS_DIR, "slide01_tola_emblem.png")).convert("RGBA")
    emblem_sm = emblem.resize((92, 92), Image.Resampling.LANCZOS)
    im.alpha_composite(emblem_sm, (cx - 46, cy - 68))

    f_bold = _load_font(34, bold=True)
    bbox = draw.textbbox((0, 0), "TOLA", font=f_bold)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw // 2, cy + 30), "TOLA", font=f_bold, fill=(19, 23, 88, 255))

    arr = np.array(im)
    arr[:3, :3, 3] = arr[:3, -3:, 3] = arr[-3:, :3, 3] = arr[-3:, -3:, 3] = 0
    out_path = os.path.join(ASSETS_DIR, "slide02_radial_network.png")
    Image.fromarray(arr, mode="RGBA").save(out_path, format="PNG")
    print(f"[Hero RGBA] slide02_radial_network.png ({w}x{h})")


def build_slide03_prism_and_doc_assets():
    """
    Build slide03_tola_prism.png matching chanakya_ref_03.png 1:1:
    - Left incoming light-grey beam
    - 3D triangular prism with soft sky-blue (#BCE3FA) left triangle face + emblem inside,
      pale ice-blue (#D8F0FF) right slanted parallelogram face + angled 'TOLA' in bold #131758
      along the right face + inner bracket lines
    - 7 colored rays extending from the right slanted edge of the prism ALL THE WAY to the
      exact (x, y) coordinates of the 7 circular badges on Slide 3!
    """
    # Canvas maps to Slide 3 rectangle x=290..1080 pt, y=110..690 pt (790x580 pt -> 1580x1160 px at 2x)
    scale = 2.0
    box_x, box_y = 290.0, 110.0
    w, h = int(790 * scale), int(580 * scale)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    def pt(x_slide, y_slide):
        return ((x_slide - box_x) * scale, (y_slide - box_y) * scale)

    # Prism vertices in slide points matching chanakya_ref_03.png
    L_bot = pt(390, 552)
    Apex = pt(550, 276)
    M_bot = pt(710, 552)
    R_top = pt(742, 276)
    R_bot = pt(902, 552)

    # Incoming grey beam with soft white glow
    beam_start = pt(312, 362)
    beam_end = pt(474, 408)
    draw.line([beam_start, beam_end], fill=(225, 230, 242, 180), width=18)
    draw.line([beam_start, beam_end], fill=(196, 202, 214, 255), width=6)

    # 7 Ray target circle centers in slide points (where the 7 circular badges sit on Slide 3)
    ray_specs = [
        (0.16, (998, 172), (239, 68, 68, 255)),     # 1 Red
        (0.28, (1012, 258), (249, 115, 22, 255)),   # 2 Orange
        (0.42, (1062, 338), (245, 196, 42, 255)),   # 3 Amber-Yellow
        (0.54, (1012, 418), (16, 185, 129, 255)),   # 4 Emerald Green
        (0.66, (1068, 498), (56, 189, 248, 255)),   # 5 Sky Blue
        (0.78, (1022, 578), (29, 36, 117, 255)),    # 6 Deep Indigo
        (0.91, (992, 654), (109, 40, 217, 255)),    # 7 Royal Purple
    ]
    for t_edge, (tx, ty), col in ray_specs:
        sx = 742 + t_edge * (902 - 742)
        sy = 276 + t_edge * (552 - 276)
        p_start = pt(sx, sy)
        p_end = pt(tx - 26, ty)  # Touches left rim of the 56pt circular icon badge
        draw.line([p_start, p_end], fill=col, width=7)

    # Left triangle face of prism
    draw.polygon([L_bot, Apex, M_bot], fill=(192, 230, 252, 255))
    # Subtle lighter diagonal sheen strips on left face
    s1 = [pt(452, 552), pt(566, 304), pt(594, 352), pt(488, 552)]
    draw.polygon(s1, fill=(224, 244, 255, 255))

    # Right slanted parallelogram face of prism
    draw.polygon([Apex, R_top, R_bot, M_bot], fill=(214, 238, 254, 255))
    s2 = [pt(610, 276), pt(652, 276), pt(812, 552), pt(770, 552)]
    draw.polygon(s2, fill=(235, 248, 255, 255))

    # Inner black bracket lines on left and right faces matching chanakya_ref_03.png
    ink = (22, 24, 29, 255)
    draw.line([pt(456, 480), pt(544, 326)], fill=ink, width=10)
    draw.line([pt(732, 296), pt(584, 296), pt(648, 406)], fill=ink, width=10, joint="curve")
    draw.line([pt(814, 530), pt(866, 530), pt(844, 492)], fill=ink, width=10, joint="curve")

    # Outer prism dark frame lines
    draw.polygon([L_bot, Apex, M_bot], outline=ink, width=11)
    draw.polygon([Apex, R_top, R_bot, M_bot], outline=ink, width=11)

    # Place minimalist Tola emblem inside the left triangle face
    emblem = Image.open(os.path.join(ASSETS_DIR, "slide01_tola_emblem.png")).convert("RGBA")
    emblem_p = emblem.resize((164, 164), Image.Resampling.LANCZOS)
    ex, ey = pt(514, 412)
    im.alpha_composite(emblem_p, (int(ex), int(ey)))

    # Render bold 'TOLA' angled along the right face (~60 deg clockwise) matching 'CHANAKYA' in ref_03
    txt_img = Image.new("RGBA", (520, 160), (0, 0, 0, 0))
    td = ImageDraw.Draw(txt_img)
    f_prism = _load_font(84, bold=True)
    td.text((30, 24), "T O L A", font=f_prism, fill=(19, 23, 88, 255))
    rot_txt = txt_img.rotate(-60, resample=Image.Resampling.BICUBIC, expand=True)
    rx, ry = pt(636, 305)
    im.alpha_composite(rot_txt, (int(rx), int(ry)))

    arr = np.array(im)
    arr[:3, :3, 3] = arr[:3, -3:, 3] = arr[-3:, :3, 3] = arr[-3:, -3:, 3] = 0
    out_path = os.path.join(ASSETS_DIR, "slide03_tola_prism.png")
    Image.fromarray(arr, mode="RGBA").save(out_path, format="PNG")
    print(f"[Hero RGBA] slide03_tola_prism.png ({w}x{h})")

    # Also build slide03_sig_stamp.png (handwritten signature + circular workshop stamp for the left card)
    st_im = Image.new("RGBA", (360, 120), (0, 0, 0, 0))
    sd = ImageDraw.Draw(st_im)
    # Stylized cursive signature on left
    sig_pts = [(18, 86), (42, 34), (54, 82), (76, 46), (92, 74), (118, 52), (140, 68)]
    sd.line(sig_pts, fill=(30, 35, 45, 240), width=4, joint="curve")
    sd.line([(22, 92), (132, 68)], fill=(30, 35, 45, 210), width=3)
    # Circular navy stamp seal on right
    cx_s, cy_s = 285, 60
    sd.ellipse([cx_s - 38, cy_s - 38, cx_s + 38, cy_s + 38], fill=(19, 23, 88, 255))
    sd.ellipse([cx_s - 31, cy_s - 31, cx_s + 31, cy_s + 31], outline=(255, 255, 255, 230), width=2)
    arr_s = np.array(st_im)
    arr_s[:3, :3, 3] = arr_s[:3, -3:, 3] = arr_s[-3:, :3, 3] = arr_s[-3:, -3:, 3] = 0
    Image.fromarray(arr_s, mode="RGBA").save(os.path.join(ASSETS_DIR, "slide03_sig_stamp.png"), format="PNG")


def build_slide05_central_orb():
    """
    Build slide05_central_orb.png from slide05_central_orb_v2_raw with the two delicate
    orbital ellipses (-35 deg solid navy and +35 deg dashed sky-blue) composited BEHIND
    the watercolor sphere, matching chanakya_ref_05.png 1:1.
    """
    src_path = _find_brain_file("slide05_central_orb_v2_raw_*.png")
    raw = Image.open(src_path).convert("RGB")
    sphere_rgba = to_transparent_rgba(
        raw, mode="line_art_on_white", bg_tol=4.0, feather_ramp=32.0, trim_and_pad=True, pad_fraction=0.14
    ).resize((760, 760), Image.Resampling.LANCZOS)

    w, h = 760, 760
    bg_rings = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    # Solid navy tilted orbital ellipse (-38 deg)
    e1 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d1 = ImageDraw.Draw(e1)
    d1.ellipse([105, 225, w - 105, h - 225], outline=(19, 23, 88, 235), width=4)
    e1 = e1.rotate(38, resample=Image.Resampling.BICUBIC)
    bg_rings = Image.alpha_composite(bg_rings, e1)

    # Dashed sky-blue tilted orbital ellipse (+32 deg)
    e2 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d2 = ImageDraw.Draw(e2)
    rx, ry = (w - 190) / 2.0, (h - 460) / 2.0
    cx, cy = w / 2.0, h / 2.0
    for deg in range(0, 360, 8):
        a1 = math.radians(deg)
        a2 = math.radians(deg + 4)
        p1 = (cx + rx * math.cos(a1), cy + ry * math.sin(a1))
        p2 = (cx + rx * math.cos(a2), cy + ry * math.sin(a2))
        d2.line([p1, p2], fill=(74, 144, 226, 220), width=4)
    e2 = e2.rotate(-28, resample=Image.Resampling.BICUBIC)
    bg_rings = Image.alpha_composite(bg_rings, e2)

    # Composite the luminous sphere ON TOP OF the background orbital rings so zero lines cross the text!
    final_orb = Image.alpha_composite(bg_rings, sphere_rgba)
    arr = np.array(final_orb)
    arr[:3, :3, 3] = arr[:3, -3:, 3] = arr[-3:, :3, 3] = arr[-3:, -3:, 3] = 0
    out_path = os.path.join(ASSETS_DIR, "slide05_central_orb.png")
    Image.fromarray(arr, mode="RGBA").save(out_path, format="PNG")
    print(f"[Hero RGBA] slide05_central_orb.png <- {os.path.basename(src_path)} ({final_orb.size})")


def process_pregenerated_heroes():
    """Process all hero/diagram images and custom composite graphics."""
    os.makedirs(ASSETS_DIR, exist_ok=True)
    build_master_corner_glow_asset()
    build_emblem_and_partner_badges()
    build_slide02_radial_network()
    build_slide03_prism_and_doc_assets()
    build_slide05_central_orb()

    other_heroes = [
        ("slide06_brain_dag_raw_*.png", "slide06_brain_dag.png", "object_on_white", 0.05),
        ("slide08_ui_1_raw_*.png", "slide08_ui_1.png", "object_on_white", 0.08),
        ("slide08_ui_2_raw_*.png", "slide08_ui_2.png", "line_art_on_white", 0.06),
        ("slide08_ui_3_raw_*.png", "slide08_ui_3.png", "object_on_white", 0.04),
        ("slide08_ui_4_raw_*.png", "slide08_ui_4.png", "object_on_white", 0.05),
        ("slide12_proof_1_raw_*.png", "slide12_proof_1.png", "object_on_white", 0.05),
        ("slide12_proof_2_raw_*.png", "slide12_proof_2.png", "object_on_white", 0.05),
    ]
    for pattern, out_name, mode, pad_frac in other_heroes:
        src_path = _find_brain_file(pattern)
        out_path = os.path.join(ASSETS_DIR, out_name)
        img = Image.open(src_path)
        rgba = to_transparent_rgba(img, mode=mode, trim_and_pad=True, pad_fraction=pad_frac)
        rgba.save(out_path, format="PNG")
        print(f"[Hero RGBA] {out_name} <- {os.path.basename(src_path)} ({rgba.size})")


ICON_SPECS = [
    # Slide 3: 7 circular output line icons matching the 7 rainbow rays of Page 3
    ("slide03_icon_1.png", "Circular badge with thin coral-red (#EF4444) ring outline and dark navy (#111111) monoline digital weighing scale pan icon inside"),
    ("slide03_icon_2.png", "Circular badge with thin orange (#F97316) ring outline and dark navy (#111111) monoline acoustic soundwave speaker icon inside"),
    ("slide03_icon_3.png", "Circular badge with thin amber-gold (#EAB308) ring outline and dark navy (#111111) monoline two interlocking signature rings icon inside"),
    ("slide03_icon_4.png", "Circular badge with thin emerald-green (#10B981) ring outline and dark navy (#111111) monoline connected cryptographic chain links icon inside"),
    ("slide03_icon_5.png", "Circular badge with thin sky-blue (#0EA5E9) ring outline and dark navy (#111111) monoline balance variance radar magnifier icon inside"),
    ("slide03_icon_6.png", "Circular badge with thin royal-indigo (#3B82F6) ring outline and dark navy (#111111) monoline official tax challan document with checkmark icon inside"),
    ("slide03_icon_7.png", "Circular badge with thin purple-violet (#8B5CF6) ring outline and dark navy (#111111) monoline verified artisan passport shield icon inside"),

    # Slide 4: 5 Foundation pillar minimalist dark navy line icons
    ("slide04_icon_1.png", "Minimalist dark navy (#111111) monoline precision digital weighing scale icon"),
    ("slide04_icon_2.png", "Minimalist dark navy (#111111) monoline voice soundwave inside a speech bubble icon"),
    ("slide04_icon_3.png", "Minimalist dark navy (#111111) monoline dual crossed cryptographic keys and seal icon"),
    ("slide04_icon_4.png", "Minimalist dark navy (#111111) monoline deterministic grid abacus calculation icon"),
    ("slide04_icon_5.png", "Minimalist dark navy (#111111) monoline verifiable passbook document with shield checkmark icon"),

    # Slide 5: 8 circular navy-outlined orbital node icons matching Page 5 of Chanakya
    ("slide05_node_1.png", "Circular badge with crisp dark navy (#131758) ring outline and minimalist dark navy precision goldsmith balance scale icon inside"),
    ("slide05_node_2.png", "Circular badge with crisp dark navy (#131758) ring outline and minimalist dark navy acoustic audio waveform icon inside"),
    ("slide05_node_3.png", "Circular badge with crisp dark navy (#131758) ring outline and minimalist dark navy two interlocked chain links icon inside"),
    ("slide05_node_4.png", "Circular badge with crisp dark navy (#131758) ring outline and minimalist dark navy microphone transforming into structured nodes icon inside"),
    ("slide05_node_5.png", "Circular badge with crisp dark navy (#131758) ring outline and minimalist dark navy inspection eye / magnifier check icon inside"),
    ("slide05_node_6.png", "Circular badge with crisp dark navy (#131758) ring outline and minimalist dark navy balanced handshake / dual key resolution icon inside"),
    ("slide05_node_7.png", "Circular badge with crisp dark navy (#131758) ring outline and minimalist dark navy instant payment transfer arrow and document icon inside"),
    ("slide05_node_8.png", "Circular badge with crisp dark navy (#131758) ring outline and minimalist dark navy verified credential clipboard with checkmark icon inside"),

    # Slide 6: 6 left-margin architecture layer category icons
    ("slide06_layer_1.png", "Minimalist dark navy (#111111) monoline multiple input documents and scale sensor icon"),
    ("slide06_layer_2.png", "Minimalist dark navy (#111111) monoline microchip processor with audio wave pins icon"),
    ("slide06_layer_3.png", "Minimalist dark navy (#131758) monoline hexagonal cryptographic ledger node network icon"),
    ("slide06_layer_4.png", "Minimalist dark navy (#111111) monoline stacked intelligence layers diamond icon"),
    ("slide06_layer_5.png", "Minimalist dark navy (#111111) monoline security shield with checkmark inside icon"),
    ("slide06_layer_6.png", "Minimalist dark navy (#111111) monoline three connected user group silhouettes icon"),

    # Slide 7: 6 Tech Stack category icons
    ("slide07_cat_1.png", "Minimalist dark navy (#131758) and royal blue (#5B6EE1) monoline microphone and camera lens vision icon"),
    ("slide07_cat_2.png", "Minimalist dark navy (#131758) and royal blue (#5B6EE1) monoline multi-agent connected neural nodes icon"),
    ("slide07_cat_3.png", "Minimalist dark navy (#131758) and royal blue (#5B6EE1) monoline database cylinders with lock icon"),
    ("slide07_cat_4.png", "Minimalist dark navy (#131758) and royal blue (#5B6EE1) monoline responsive mobile phone and desktop browser icon"),
    ("slide07_cat_5.png", "Minimalist dark navy (#131758) and royal blue (#5B6EE1) monoline bluetooth wave and precision scale hardware icon"),
    ("slide07_cat_6.png", "Minimalist dark navy (#131758) and emerald (#10B981) monoline cryptographic shield keyhole and signature icon"),

    # Slide 9: 4 artifact icons for Card 4
    ("slide09_art_1.png", "Minimalist dark navy (#131758) monoline interlocked cryptographic hash chain badge icon"),
    ("slide09_art_2.png", "Minimalist dark navy (#131758) and emerald (#10B981) monoline fast-forward instant payment arrow icon"),
    ("slide09_art_3.png", "Minimalist dark navy (#131758) monoline official tax challan scroll with stamp seal icon"),
    ("slide09_art_4.png", "Minimalist dark navy (#131758) and royal blue (#5B6EE1) monoline artisan work passport card with shield checkmark icon"),

    # Slide 10: 4 readiness matrix header/badge icons
    ("slide10_col_1.png", "Minimalist dark navy (#131758) monoline precision bench scale and mobile phone icon"),
    ("slide10_col_2.png", "Minimalist dark navy (#131758) monoline dual cryptographic keys and shield lock icon"),
    ("slide10_col_3.png", "Minimalist dark navy (#131758) monoline classical compliance pillar with checkmark shield icon"),
    ("slide10_col_4.png", "Minimalist dark navy (#131758) monoline balanced coin stack and upward chart arrow icon"),

    # Slide 11: 5 roadmap phase circular icons matching Page 11 of Chanakya
    ("slide11_stage_1.png", "Minimalist dark navy (#131758) monoline trophy cup with diamond star inside a soft pale blue circle"),
    ("slide11_stage_2.png", "Minimalist dark navy (#131758) monoline two hands shaking in partnership inside a soft pale blue circle"),
    ("slide11_stage_3.png", "Minimalist dark navy (#131758) monoline four interlocking puzzle pieces inside a soft pale blue circle"),
    ("slide11_stage_4.png", "Minimalist dark navy (#131758) monoline modern enterprise bank building towers inside a soft pale blue circle"),
    ("slide11_stage_5.png", "Minimalist dark navy (#131758) monoline global latitude-longitude wireframe sphere inside a soft pale blue circle"),
]


def generate_single_icon(spec):
    filename, prompt_desc = spec
    out_path = os.path.join(ASSETS_DIR, filename)
    if os.path.exists(out_path):
        try:
            im = Image.open(out_path)
            w, h = im.size
            if im.mode == "RGBA" and all(
                im.getpixel(c)[3] == 0 for c in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
            ):
                return filename, "CACHED"
        except Exception:
            pass

    api_key = os.environ.get("GEMINI_API_KEY", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key={api_key}"
    full_prompt = f"{prompt_desc}. {NANO_BANANA_ICON_SUFFIX}"
    body = json.dumps(
        {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"]},
        }
    ).encode("utf-8")

    for attempt in range(3):
        try:
            req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            for cand in data.get("candidates", []):
                for part in cand.get("content", {}).get("parts", []):
                    if "inlineData" in part:
                        raw_img = Image.open(io.BytesIO(base64.b64decode(part["inlineData"]["data"])))
                        mode = "object_on_white" if "stage_" in filename else "line_art_on_white"
                        rgba_img = to_transparent_rgba(raw_img, mode=mode, trim_and_pad=True, pad_fraction=0.10)
                        rgba_img = rgba_img.resize((256, 256), Image.Resampling.LANCZOS)
                        arr = np.array(rgba_img)
                        arr[:3, :3, 3] = arr[:3, -3:, 3] = arr[-3:, :3, 3] = arr[-3:, -3:, 3] = 0
                        rgba_img = Image.fromarray(arr, mode="RGBA")
                        rgba_img.save(out_path, format="PNG")
                        return filename, "GENERATED"
        except Exception as e:
            last_err = str(e)
    raise RuntimeError(f"Failed to generate {filename}: {last_err}")


def verify_all_assets():
    pngs = sorted(glob.glob(os.path.join(ASSETS_DIR, "*.png")))
    print(f"\nVerifying {len(pngs)} assets in {ASSETS_DIR}...")
    all_ok = True
    for p in pngs:
        im = Image.open(p)
        w, h = im.size
        corners_ok = all(
            im.getpixel(c)[3] == 0 for c in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
        )
        alpha_arr = np.array(im)[:, :, 3]
        trans_ratio = float(np.mean(alpha_arr == 0))
        ok = im.mode == "RGBA" and corners_ok and trans_ratio >= 0.15
        if not ok:
            print(f"  [FAIL] {os.path.basename(p)}: mode={im.mode}, corners_ok={corners_ok}, trans={trans_ratio:.2%}")
            all_ok = False
    print(f"Asset verification complete: {len(pngs)} files, all_ok={all_ok}")
    return all_ok


if __name__ == "__main__":
    process_pregenerated_heroes()
    print(f"Checking/generating {len(ICON_SPECS)} icons in {ASSETS_DIR}...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(generate_single_icon, spec) for spec in ICON_SPECS]
        for fut in concurrent.futures.as_completed(futures):
            fname, status = fut.result()
            print(f"  [{status}] {fname}")
    verify_all_assets()
