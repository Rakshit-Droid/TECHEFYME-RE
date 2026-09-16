"""Replace the film's misspelled wordmark with a correctly spelled one.

The film reads "TechfyMe"; the company is TechefyMe. Nothing else about the film
changes: the point of light, the orbit, the mark and their timing are the original
frames. Only the wordmark pixels are swapped, the mark keeps occluding them, and
the generator's sparkle watermark is cleared.

  erase  the original wordmark, using a mask of its glyphs across the whole range
         of tracking it animates through, minus the mark and minus the orbit (both
         must survive the cut), with the hole filled from its surroundings
  draw   "TechefyMe" in Inter SemiBold — the site's own face — at the original's
         baseline and cap height, blurred and faded on the original's curve
  shift  every frame left by the half-width the extra glyph adds, so the finished
         lockup sits exactly where the original sat
"""
import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

S = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(S, "..", ".intro-build", "src")
OUT = os.path.join(S, "..", ".intro-build", "out")
FONT = os.path.join(S, "..", "assets", "fonts", "Inter-SemiBold.ttf")

TEXT = "TechefyMe"
L, R, T, B = 498, 943, 322, 413      # original wordmark bounds, measured
BASELINE, CAP = 394, 69              # measured on the final frame
FONT_SIZE = 95                       # Inter SemiBold cap height 69 at this size
SPARKLE = (1124, 564, 1196, 636)     # generator watermark, cleared to black

CUT_FROM = 43                        # the original wordmark is not perceptible before this
FADE_IN, FADE_FULL = 44, 70          # frames: wordmark starts / reaches full
BLUR_MAX = 13.0                      # the original resolves out of a blur


def smoothstep(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def build_text_layer():
    font = ImageFont.truetype(FONT, FONT_SIZE)
    layer = Image.new("L", (1280, 720), 0)
    ImageDraw.Draw(layer).text((L, BASELINE), TEXT, font=font, fill=255, anchor="ls")
    bb = layer.getbbox()
    return layer, bb


BAND = (492, 300, 1035, 432)         # everywhere the wordmark ever reaches


def opening(mask_u8, erode, dilate):
    img = Image.fromarray(mask_u8)
    return np.asarray(img.filter(ImageFilter.MinFilter(erode)).filter(ImageFilter.MaxFilter(dilate)))


def old_wordmark_mask():
    """Every pixel the original wordmark ever occupies.

    It arrives with its tracking opening up — left edge pinned at 498, right edge
    travelling 801 -> 943 — so the mask is the original glyphs unioned across that
    whole range of widths, then grown to swallow the blur it resolves out of.
    """
    font = ImageFont.truetype(FONT, FONT_SIZE)
    base = Image.new("L", (1280, 720), 0)
    ImageDraw.Draw(base).text((L, BASELINE), "TechfyMe", font=font, fill=255, anchor="ls")
    bb = base.getbbox()
    base = base.transform(base.size, Image.AFFINE, ((bb[2] - L) / float(R - L), 0, L * (1 - (bb[2] - L) / float(R - L)), 0, 1, 0))

    acc = np.zeros((720, 1280), np.uint8)
    for k in range(11):
        s = 0.68 + 0.32 * k / 10.0                       # measured tracking range
        step = base.transform(base.size, Image.AFFINE, (1 / s, 0, L * (1 - 1 / s), 0, 1, 0))
        acc = np.maximum(acc, np.asarray(step))
    m = Image.fromarray(acc).filter(ImageFilter.MaxFilter(29))
    return np.asarray(m)


def core_mask(old_mask):
    """The glyphs themselves, without the margin the erase mask carries."""
    return np.asarray(Image.fromarray(old_mask).filter(ImageFilter.MinFilter(21)))


def thin_mask(frame):
    """The orbit: bright, and thinner than any glyph stem. It must survive the cut."""
    g = np.asarray(frame.convert("L")).astype(np.float32)
    bright = ((g > blur_f(g, 45) + 16) * 255).astype(np.uint8)
    thin = np.where(opening(bright, 7, 15) > 0, 0, bright).astype(np.uint8)
    return np.asarray(Image.fromarray(thin).filter(ImageFilter.MaxFilter(7)))


def mark_mask(frame):
    """The mark (disc + dot) only — it must keep occluding whatever sits behind it.

    Taken as the leftmost solid shape in the frame, flood filled: a plain x cutoff
    cannot separate the mark from the wordmark, because the two overlap in x while
    the lockup is still settling.
    """
    a = np.asarray(frame.convert("L"))
    binary = ((a > 120) * 255).astype(np.uint8)
    solid = np.asarray(Image.fromarray(binary).filter(ImageFilter.MinFilter(15)))
    ys, xs = np.nonzero(solid)
    if len(xs) == 0:
        return Image.new("L", frame.size, 0)
    seed_x = xs.min()
    seed_y = int(np.median(ys[xs < seed_x + 6]))
    grown = Image.fromarray(np.asarray(Image.fromarray(solid).filter(ImageFilter.MaxFilter(29))).copy())
    ImageDraw.floodfill(grown, (int(seed_x), seed_y), 128)
    m = ((np.asarray(grown) == 128) * 255).astype(np.uint8)
    # the escaping dot is a separate shape; it sits just off the disc's shoulder
    dot = np.asarray(Image.fromarray(m).filter(ImageFilter.MaxFilter(25)))
    m = np.maximum(m, np.where(dot > 0, solid, 0))
    return Image.fromarray(m).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(2))


def _box(a, r):
    if r < 1:
        return a
    pad = np.pad(a, ((r + 1, r), (0, 0)), mode="edge")
    c = np.cumsum(pad, axis=0)
    a = (c[2 * r + 1 :] - c[: -(2 * r + 1)]) / (2 * r + 1)
    pad = np.pad(a, ((0, 0), (r + 1, r)), mode="edge")
    c = np.cumsum(pad, axis=1)
    return (c[:, 2 * r + 1 :] - c[:, : -(2 * r + 1)]) / (2 * r + 1)


def blur_f(a, r):
    """Three box passes: close enough to a Gaussian, and PIL cannot blur float images."""
    b = max(1, int(round(r * 0.55)))
    return _box(_box(_box(a.astype(np.float32), b), b), b)


def inpaint(frame, cut, block=None):
    """Fill the cut region from its surroundings.

    The wordmark sits inside the film's ambient glow, so flat black would leave a
    glyph-shaped hole in it. Normalised convolution rebuilds the low-frequency glow
    across the hole: a wide pass carries colour into the middle of thick strokes,
    a tighter pass keeps the edges honest.
    """
    a = np.asarray(frame).astype(np.float32)
    m = np.asarray(cut).astype(np.float32) / 255.0
    # The mark, the orbit and the wordmark's own halo sit right against the hole;
    # left as sources they would bleed their brightness into it.
    w = 1.0 - (m if block is None else np.maximum(m, np.asarray(block).astype(np.float32) / 255.0))
    src = Image.fromarray(np.asarray(frame))
    floor = np.stack(
        [blur_f(np.asarray(ch.filter(ImageFilter.MinFilter(25))).astype(np.float32), 25) + 3 for ch in src.split()],
        axis=2,
    )
    out = a.copy()
    for c in range(3):
        near_n, near_d = blur_f(a[:, :, c] * w, 18), blur_f(w, 18)
        far_n, far_d = blur_f(a[:, :, c] * w, 70), blur_f(w, 70)
        near = near_n / np.maximum(near_d, 1e-4)
        far = far_n / np.maximum(far_d, 1e-4)
        t = np.clip(near_d / 0.12, 0, 1)                    # trust the tight pass only where it has data
        fill = near * t + far * (1 - t)
        # Against the mark there is no unblocked pixel nearby and the wide pass
        # returns a grey average, which shows as a smudge on black. Cap the fill at
        # the darkest level the neighbourhood actually reaches.
        fill = np.minimum(fill, floor[:, :, c])
        out[:, :, c] = a[:, :, c] * (1 - m) + fill * m
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def compose(i, text_layer, old_mask, core):
    frame = Image.open(os.path.join(SRC, f"{i:03d}.png")).convert("RGB")
    mark = mark_mask(frame)
    keep = Image.eval(mark, lambda v: 255 - v)              # everywhere the mark is not

    # 1. erase the original wordmark: not through the mark, not through the orbit
    if i >= CUT_FROM:
        # The orbit is spared, except where it crosses a glyph: there the original
        # occluded it anyway, and sparing it would leave a piece of the old letter.
        thin = np.minimum(thin_mask(frame), 255 - core)
        cut = np.minimum(old_mask, np.asarray(keep))
        cut = np.minimum(cut, 255 - thin)
        cut = Image.fromarray(cut).filter(ImageFilter.GaussianBlur(2))
        halo = np.asarray(Image.fromarray(old_mask).filter(ImageFilter.MaxFilter(25)))
        block = np.maximum(np.maximum(np.asarray(mark), thin), halo)
        frame = inpaint(frame, cut, block)

    # 2. draw the corrected wordmark on the original's fade/blur curve
    p = smoothstep((i - FADE_IN) / float(FADE_FULL - FADE_IN))
    if p > 0.004:
        layer = text_layer
        blur = BLUR_MAX * (1 - p) ** 1.6
        if blur > 0.4:
            layer = layer.filter(ImageFilter.GaussianBlur(blur))
        alpha = Image.eval(layer, lambda v: int(v * p))
        alpha = Image.fromarray(np.minimum(np.asarray(alpha), np.asarray(keep)))
        frame = Image.composite(Image.new("RGB", frame.size, (255, 255, 255)), frame, alpha)

    # 3. clear the generator's sparkle
    ImageDraw.Draw(frame).rectangle(SPARKLE, fill=(0, 0, 0))
    return frame


def main():
    preview = "--preview" in sys.argv
    text_layer, bb = build_text_layer()
    shift = (bb[2] - R - 1) // 2                            # re-centre the wider lockup
    print("text bbox", bb, "-> shift", -shift, "px")
    old_mask = old_wordmark_mask()
    core = core_mask(old_mask)
    os.makedirs(OUT, exist_ok=True)
    frames = [45, 50, 55, 60, 65, 75, 85, 96] if preview else range(1, 97)
    for i in frames:
        f = compose(i, text_layer, old_mask, core)
        f = f.transform(f.size, Image.AFFINE, (1, 0, shift, 0, 1, 0), fillcolor=(0, 0, 0))
        f.save(os.path.join(OUT, f"{i:03d}.png"))
    if preview:
        sheet = Image.new("RGB", (700, 150 * len(frames)))
        for k, i in enumerate(frames):
            sheet.paste(Image.open(os.path.join(OUT, f"{i:03d}.png")).crop((250, 280, 1050, 440)).resize((700, 140)), (0, 150 * k))
        sheet.save(os.path.join(S, "preview.png"))
        print("wrote preview.png")
    else:
        print("wrote", len(list(frames)), "frames")


main()
