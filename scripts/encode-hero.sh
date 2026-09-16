#!/usr/bin/env bash
# Builds the hero's scroll-scrubbed films.
#
# Two clips, played back to back under the scroll, then a still:
#   1. hands   raw-assets/Arms_forming_expanding_black_hole-clip-1_20260914214956.mp4
#              1280x720 Veo export whose real picture is 1080x720 with 100px black bars
#              (the watermark sits in the right bar): crop=1080:720:100:0. Cut at 7.25s,
#              a quarter second after the black hole has swallowed the frame.
#   2. logo    raw-assets/logo-film.mp4
#              2560x1440, starts on the same black. Cut at 3.75s on the settled lockup.
#   3. still   public/hero/lockup.*.webp, the lockup from the logo film's last frame,
#              which the page flies into the header logo.
#
# Encoded for scrubbing, not playback (the scroll-craft method): a keyframe every 8
# frames on desktop and every 4 on phones, so any seek decodes at most a handful of
# frames in the hardware decoder. A normal web encode keyframes every few seconds
# and feels like mud under the wheel. The source is only 720p, so the desktop hands
# clip is upscaled to 1080 lines with lanczos and a light unsharp pass, and aq-mode 3
# keeps the black hole's dark gradient from breaking into blocks.
#
# Update CLIPS and LOCKUP in lib/hero-gate.ts with the names this prints.
set -euo pipefail

HANDS="${1:-raw-assets/Arms_forming_expanding_black_hole-clip-1_20260914214956.mp4}"
LOGO="${2:-raw-assets/logo-film.mp4}"
BUILD=.hero-build
mkdir -p "$BUILD" public/hero

X264=(-an -c:v libx264 -profile:v high -preset slow -aq-mode 3 -sc_threshold 0 -pix_fmt yuv420p
  -movflags +faststart -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv)
HANDS_VF="crop=1080:720:100:0,trim=0:7.25,setpts=PTS-STARTPTS"
LOGO_VF="trim=0:3.75,setpts=PTS-STARTPTS"

ffmpeg -v error -y -i "$HANDS" -vf "$HANDS_VF,scale=1620:1080:flags=lanczos,unsharp=5:5:0.45:5:5:0" \
  "${X264[@]}" -crf 17 -g 8 -keyint_min 8 "$BUILD/hands.d.mp4"
ffmpeg -v error -y -i "$HANDS" -vf "$HANDS_VF" "${X264[@]}" -crf 23 -g 4 -keyint_min 4 "$BUILD/hands.m.mp4"
ffmpeg -v error -y -i "$LOGO" -vf "$LOGO_VF,scale=1920:1080:flags=lanczos" "${X264[@]}" -crf 18 -g 8 -keyint_min 8 "$BUILD/logo.d.mp4"
ffmpeg -v error -y -i "$LOGO" -vf "$LOGO_VF,scale=1280:720:flags=lanczos" "${X264[@]}" -crf 23 -g 4 -keyint_min 4 "$BUILD/logo.m.mp4"

rm -f public/hero/hands.*.mp4 public/hero/logo.*.mp4
for f in hands.d hands.m logo.d logo.m; do
  hash=$(sha256sum "$BUILD/$f.mp4" | cut -c1-8)
  name="${f%%.*}.$hash.${f#*.}.mp4"
  cp "$BUILD/$f.mp4" "public/hero/$name"
  echo "$f -> /hero/$name ($(stat -c %s "$BUILD/$f.mp4") bytes)"
done

# The lockup still: the logo film's last frame (3.7083s), cropped to the lockup with a
# 32px margin, white with luma as alpha so it composites over the nav as well as the
# film. Its crop box is LOCKUP in lib/hero-gate.ts.
ffmpeg -v error -y -ss 3.7083 -i "$LOGO" -frames:v 1 "$BUILD/lockup.png"
python - <<'EOF'
import hashlib, glob, os
import numpy as np
from PIL import Image
g = np.asarray(Image.open(".hero-build/lockup.png").convert("L"))[524:912, 329:2232]
rgba = np.dstack([np.full(g.shape, 255, np.uint8)] * 3 + [g])
Image.fromarray(rgba, "RGBA").save(".hero-build/lockup.webp", quality=92, method=6)
for old in glob.glob("public/hero/lockup.*.webp"):
    os.remove(old)
h = hashlib.sha256(open(".hero-build/lockup.webp", "rb").read()).hexdigest()[:8]
os.replace(".hero-build/lockup.webp", f"public/hero/lockup.{h}.webp")
print(f"lockup -> /hero/lockup.{h}.webp ({os.path.getsize(f'public/hero/lockup.{h}.webp')} bytes)")
EOF
