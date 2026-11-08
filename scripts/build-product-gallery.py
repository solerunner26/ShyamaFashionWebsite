#!/usr/bin/env python3
"""
Builds uniform 768x1024 (3:4 vertical portrait) 5-angle studio galleries
for all 25 Shyama Fashion womenswear products in public/products/p01..p25/.
Also supports rebuilding from custom local/cloth-to-model images later.
"""
import os
import subprocess
import glob

OUT_W, OUT_H = 768, 1024
IM_LIMITS = ["-limit", "memory", "1GiB", "-limit", "map", "2GiB"]

FILES = sorted(glob.glob("image-search/*.jpg"))

def idx_file(n: int) -> str:
    return FILES[n]

def run_convert(args):
    subprocess.run(["convert"] + IM_LIMITS + args, check=True)

def make_full_portrait(src: str, dst: str, gravity: str = "center"):
    run_convert([
        src,
        "-auto-orient",
        "-resize", f"{OUT_W}x{OUT_H}^",
        "-gravity", gravity,
        "-extent", f"{OUT_W}x{OUT_H}",
        "-strip",
        "-sampling-factor", "4:2:0",
        "-quality", "82",
        dst,
    ])

def make_zoom_crop(src: str, dst: str, zoom: float, y_bias: float, sharpen: bool = False):
    """
    Crops a specific vertical band (y_bias 0.0=top .. 1.0=bottom) at `zoom` magnification
    while strictly preserving the 3:4 aspect ratio (no stretching ever).
    """
    out = subprocess.check_output(["identify", "-format", "%w %h", src]).decode().strip().split()
    w, h = int(out[0]), int(out[1])
    # First compute largest 3:4 box inside w x h
    target_ratio = OUT_W / OUT_H
    if w / h > target_ratio:
        base_h = h
        base_w = int(h * target_ratio)
    else:
        base_w = w
        base_h = int(w / target_ratio)

    crop_w = max(240, int(base_w / zoom))
    crop_h = max(320, int(base_h / zoom))
    x_off = max(0, (w - crop_w) // 2)
    y_off = int((h - crop_h) * max(0.0, min(1.0, y_bias)))

    extra = ["-unsharp", "0x0.9+0.8+0.02"] if sharpen else []
    run_convert([
        src,
        "-auto-orient",
        "-crop", f"{crop_w}x{crop_h}+{x_off}+{y_off}",
        "+repage",
        "-resize", f"{OUT_W}x{OUT_H}!",
    ] + extra + [
        "-strip",
        "-sampling-factor", "4:2:0",
        "-quality", "82",
        dst,
    ])

def make_neon_editorial(src: str, dst: str, zoom: float = 1.12, y_bias: float = 0.35):
    """
    Creates an editorial twilight-neon studio lookbook framing with subtle magenta-cyan rim glow.
    """
    out = subprocess.check_output(["identify", "-format", "%w %h", src]).decode().strip().split()
    w, h = int(out[0]), int(out[1])
    target_ratio = OUT_W / OUT_H
    if w / h > target_ratio:
        base_h = h
        base_w = int(h * target_ratio)
    else:
        base_w = w
        base_h = int(w / target_ratio)
    crop_w = max(240, int(base_w / zoom))
    crop_h = max(320, int(base_h / zoom))
    x_off = max(0, (w - crop_w) // 2)
    y_off = int((h - crop_h) * max(0.0, min(1.0, y_bias)))

    run_convert([
        src,
        "-auto-orient",
        "-crop", f"{crop_w}x{crop_h}+{x_off}+{y_off}",
        "+repage",
        "-resize", f"{OUT_W}x{OUT_H}!",
        "-modulate", "102,114,100",
        "(",
        "-size", f"{OUT_W}x{OUT_H}",
        "gradient:#FF2E93-#00F0FF",
        "-alpha", "set",
        "-channel", "A",
        "-evaluate", "set", "12%",
        "+channel",
        ")",
        "-compose", "softlight",
        "-composite",
        "-strip",
        "-sampling-factor", "4:2:0",
        "-quality", "82",
        dst,
    ])

def build_5_angles(pid: str, shots: list, lower_focus: bool = True):
    """
    Given 1..5 real studio shots of a product, builds angle-1..5.jpg in public/products/{pid}/.
    """
    pdir = os.path.join("public", "products", pid)
    os.makedirs(pdir, exist_ok=True)

    primary = shots[0]
    # Angle 1: Full Front Studio Look
    make_full_portrait(primary, os.path.join(pdir, "angle-1.jpg"), gravity="north" if not lower_focus else "center")

    # Angle 2: Second camera pose if available, otherwise silhouette mid-to-floor framing
    if len(shots) >= 2:
        make_full_portrait(shots[1], os.path.join(pdir, "angle-2.jpg"), gravity="center")
    else:
        make_zoom_crop(primary, os.path.join(pdir, "angle-2.jpg"), zoom=1.24, y_bias=0.72 if lower_focus else 0.42)

    # Angle 3: Third camera pose if available, otherwise High-Rise Waistband & Hip Fit Focus
    if len(shots) >= 3:
        make_full_portrait(shots[2], os.path.join(pdir, "angle-3.jpg"), gravity="center")
    else:
        src3 = shots[-1]
        make_zoom_crop(src3, os.path.join(pdir, "angle-3.jpg"), zoom=1.55, y_bias=0.55 if lower_focus else 0.30)

    # Angle 4: Fourth camera pose if available, otherwise Fabric Weave, Pleat & Hem Close-up
    if len(shots) >= 4:
        make_full_portrait(shots[3], os.path.join(pdir, "angle-4.jpg"), gravity="center")
    else:
        make_zoom_crop(primary, os.path.join(pdir, "angle-4.jpg"), zoom=1.85, y_bias=0.84 if lower_focus else 0.48, sharpen=True)

    # Angle 5: Fifth camera pose if available, otherwise Neon Studio Editorial Lookbook shot
    if len(shots) >= 5:
        make_full_portrait(shots[4], os.path.join(pdir, "angle-5.jpg"), gravity="center")
    else:
        src5 = shots[1] if len(shots) >= 2 else primary
        make_neon_editorial(src5, os.path.join(pdir, "angle-5.jpg"), zoom=1.14, y_bias=0.45)


def main():
    # p01 already has 5 genuine AI-generated angles in public/products/p01/angle-1-front..angle-5-styled.jpg
    p01_sources = [
        "public/products/p01/angle-1-front.jpg",
        "public/products/p01/angle-2-side.jpg",
        "public/products/p01/angle-3-back.jpg",
        "public/products/p01/angle-4-detail.jpg",
        "public/products/p01/angle-5-styled.jpg",
    ]
    build_5_angles("p01", p01_sources, lower_focus=True)

    # p02 uses our AI-generated Emerald Mirror-Trim Flared Palazzo base
    build_5_angles("p02", ["public/products/p02/angle-1-front.jpg"], lower_focus=True)

    # Curated verified female-only open-license studio shoots (p03..p25)
    catalog_sources = {
        # PALAZZOS
        "p03": ([idx_file(0), idx_file(4)], True),             # Ivory Cloud Linen Wide Palazzo (2 studio poses)
        "p04": ([idx_file(1), idx_file(100), idx_file(102)], True),  # Midnight Bloom Printed Wide Palazzo
        "p05": ([idx_file(87)], True),                         # Sage Olive High-Waist Resort Palazzo (4K Unsplash)

        # PAJAMAS
        "p06": ([idx_file(109), idx_file(107)], True),         # Rose-Blush Pure Silk Lounge Pajama
        "p07": ([idx_file(105)], True),                        # Lavender Mist Contrast-Piped Satin Pajama
        "p08": ([idx_file(55), idx_file(59)], True),           # Noir White-Piped Luxe Satin Pajama
        "p09": ([idx_file(70), idx_file(73)], True),           # Sky-Blue Cloud Cotton Lounge Pajama
        "p10": ([idx_file(108), idx_file(106)], True),         # Cream Ribbed Modal Lounge Pajama

        # WOMEN'S PANTS (Cargo, Parachute, Cigarette, Flare)
        "p11": ([idx_file(45)], True),                         # Cyber Olive Street Utility Cargo Pant
        "p12": ([idx_file(47), idx_file(88)], True),           # Obsidian Shadow Wide Cargo Pant
        "p13": ([idx_file(49)], True),                         # Urban Khaki Pocket Cargo Pant
        "p14": ([idx_file(57), idx_file(8)], True),            # Oatmeal Tailored Cigarette Ankle Pant
        "p15": ([idx_file(76), idx_file(79)], True),           # Electric Plum Ribbed Flare Pant

        # LEGGINGS
        "p16": ([idx_file(40), idx_file(44)], True),           # Jet Side-Stripe High-Rise Sculpt Legging
        "p17": ([idx_file(41)], True),                         # Pink-Glow Studio Compression Legging
        "p18": ([idx_file(43), idx_file(42)], True),           # Cyber Berry High-Waist Active Legging

        # WOMEN'S TROUSERS
        "p19": ([idx_file(85)], True),                         # Hot Fuchsia Tailored Wide Power Trouser (4K)
        "p20": ([idx_file(7), idx_file(64), idx_file(5)], True),     # Sandstone Korean-Fit Pleated Wide Trouser (3 angles!)
        "p21": ([idx_file(89), idx_file(62)], True),           # Crimson Editorial Tailored Straight Trouser

        # KURTIS & DRESSES
        "p22": ([idx_file(30), idx_file(31), idx_file(33)], False),  # Powder-Blue Threadwork Straight Kurti Set
        "p23": ([idx_file(36), idx_file(38), idx_file(39)], False),  # Lucknowi Ivory Chikankari Mulmul Kurti
        "p24": ([idx_file(50), idx_file(51), idx_file(52), idx_file(54)], False), # Scarlet Ruched Side-Slit Satin Midi Dress (4 real angles!)
        "p25": ([idx_file(32), idx_file(34)], False),          # Crimson Mirror-Thread Kurti & Cigarette Pant Set
    }

    for pid, (shots, lower_focus) in catalog_sources.items():
        build_5_angles(pid, shots, lower_focus=lower_focus)
        print(f"Built 5 angles for {pid}")

    # Remove old temporary p01/p02 named files so only angle-1..5.jpg remain cleanly
    for extra in glob.glob("public/products/p0[12]/angle-*-*.jpg"):
        os.remove(extra)

if __name__ == "__main__":
    main()
