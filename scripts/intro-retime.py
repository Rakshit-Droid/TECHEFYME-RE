"""Re-allocate the film's frames across the full four seconds.

As delivered, the animation finishes at 2.67s and the remaining 1.34s is a dead
hold. Here the same frames are redistributed in proportion: the animation gets
3.40s and the finished lockup holds for 0.60s, so nothing is cut and nothing is
dead. Output is 30fps, so the stretch lands between source frames — those are
blended rather than duplicated, which keeps the orbit smooth instead of juddering.
"""
import os
import numpy as np
from PIL import Image

S = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(S, "..", ".intro-build", "out")
DST = os.path.join(S, "..", ".intro-build", "final")

FPS = 30
TOTAL = 4.0
MOTION_END_FRAME = 65          # source frame where the animation settles (2.67s)
MOTION_SECONDS = 3.40          # what it gets instead
SRC_COUNT = 96

os.makedirs(DST, exist_ok=True)
cache = {}


def src(i):
    i = min(SRC_COUNT, max(1, i))
    if i not in cache:
        cache[i] = np.asarray(Image.open(os.path.join(SRC, f"{i:03d}.png")).convert("RGB")).astype(np.float32)
        if len(cache) > 8:
            cache.pop(next(iter(cache)))
    return cache[i]


n_out = int(round(TOTAL * FPS))
for k in range(n_out):
    t = k / float(FPS)
    if t <= MOTION_SECONDS:
        pos = 1 + (MOTION_END_FRAME - 1) * (t / MOTION_SECONDS)
    else:
        pos = MOTION_END_FRAME + (SRC_COUNT - MOTION_END_FRAME) * ((t - MOTION_SECONDS) / (TOTAL - MOTION_SECONDS))
    lo = int(np.floor(pos))
    f = pos - lo
    a = src(lo) if f < 0.02 else src(lo) * (1 - f) + src(lo + 1) * f
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(DST, f"{k + 1:04d}.png"))

print("wrote", n_out, "frames at", FPS, "fps")
