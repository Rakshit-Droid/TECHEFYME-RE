#!/usr/bin/env bash
# Builds the hero's scroll-scrubbed frame sequences.
#
# One continuous sequence, two films:
#   1. hands   raw-assets/Arms_forming_expanding_black_hole-clip-1_20260914214956.mp4
#              1280x720 Veo export whose real picture is 1080x720 with 100px black bars
#              (the watermark sits in the right bar): crop=1080:720:100:0. Cut at 7.25s,
#              a quarter second after the black hole has swallowed the frame.
#   2. logo    raw-assets/logo-film.mp4
#              2560x1440, starts on the same black. The wordmark is fully white at 3.5s;
#              the sequence stops at 3.75s on the settled lockup. From there the page
#              takes over: a still of that lockup (public/hero/lockup.*.webp, cut here
#              from the same moment) flies into the header logo under the scroll.
#
# Numbering is continuous across both, so the page just maps scroll to an index.
# Whenever a film or a cut point changes, update FRAMES and the cue times in
# lib/hero-gate.ts to match the counts this prints.
set -euo pipefail

HANDS="${1:-raw-assets/Arms_forming_expanding_black_hole-clip-1_20260914214956.mp4}"
LOGO="${2:-raw-assets/logo-film.mp4}"
HANDS_END=7.25
LOGO_VF="trim=0:3.75,setpts=PTS-STARTPTS"
WEBP=(-c:v libwebp -f image2)

build() {
  local dir=$1 fps=$2 hands_scale=$3 logo_scale=$4 q=$5
  rm -rf "$dir"
  mkdir -p "$dir"
  ffmpeg -v error -y -i "$HANDS" -an \
    -vf "crop=1080:720:100:0,trim=0:$HANDS_END,setpts=PTS-STARTPTS,fps=$fps$hands_scale" \
    "${WEBP[@]}" -q:v "$q" "$dir/%03d.webp"
  local n
  n=$(ls "$dir" | wc -l)
  ffmpeg -v error -y -i "$LOGO" -an \
    -vf "$LOGO_VF,fps=$fps,scale=$logo_scale:flags=lanczos" \
    "${WEBP[@]}" -q:v "$q" -start_number $((n + 1)) "$dir/%03d.webp"
  echo "$dir: hands $n + logo $(( $(ls "$dir" | wc -l) - n )) = $(ls "$dir" | wc -l) frames, $(du -sh "$dir" | cut -f1)"
}

# Desktop: every frame. The logo is drawn at 1920 because its wordmark is the one
# thing in the sequence that has to stay crisp on a large display.
build public/hero/frames/d 24 "" "1920:1080" 72

# Phones: half the frames, smaller pictures.
build public/hero/frames/m 12 ",scale=720:480" "960:540" 66

# The lockup still: the last logo frame (3.7083s), cropped to the lockup with a 32px
# margin, white with luma as alpha so it composites over the nav as well as the film.
# Its crop box is LOCKUP in lib/hero-gate.ts.
mkdir -p .hero-build
ffmpeg -v error -y -ss 3.7083 -i "$LOGO" -frames:v 1 .hero-build/lockup.png
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
print(f"lockup -> public/hero/lockup.{h}.webp ({os.path.getsize(f'public/hero/lockup.{h}.webp')} bytes)")
EOF
