#!/usr/bin/env bash
# Builds the intro film's web renditions from the generated source.
#
# The source as delivered has three problems: its wordmark reads "TechfyMe", the
# generator leaves a sparkle watermark near (1158, 598), and its animation ends at
# 2.67s with 1.34s of dead hold. The two Python steps fix all three — the wordmark
# is replaced glyph for glyph and the frames are re-allocated across the full four
# seconds — and this script only encodes what they produce.
#
# Requires: python with numpy + pillow, ffmpeg with libx264 and libsvtav1.
# Update lib/intro.ts with the hashed filenames this prints.
set -euo pipefail

SRC="${1:-raw-assets/intro-source.mp4}"
BUILD=".intro-build"

mkdir -p "$BUILD/src"
rm -f "$BUILD/src"/*.png
ffmpeg -v error -y -i "$SRC" -fps_mode passthrough "$BUILD/src/%03d.png"

python scripts/intro-wordmark.py     # replaces the wordmark, clears the watermark
python scripts/intro-retime.py       # 120 frames at 30fps across the full 4.0s

COMMON=(-an -movflags +faststart)

ffmpeg -v error -y -framerate 30 -i "$BUILD/final/%04d.png" \
  -c:v libx264 -crf 18 -preset slow -aq-mode 3 -profile:v high -level 4.0 -pix_fmt yuv420p \
  -g 60 -keyint_min 60 -sc_threshold 0 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  "${COMMON[@]}" "$BUILD/h264.mp4"

# 10-bit AV1: the film is one long near-black gradient, which bands in 8 bits.
ffmpeg -v error -y -framerate 30 -i "$BUILD/final/%04d.png" \
  -c:v libsvtav1 -crf 24 -preset 4 -pix_fmt yuv420p10le "${COMMON[@]}" "$BUILD/av1.mp4"

mkdir -p public/intro
rm -f public/intro/*
for f in av1.mp4 h264.mp4; do
  hash=$(sha256sum "$BUILD/$f" | cut -c1-8)
  cp "$BUILD/$f" "public/intro/intro.$hash.$f"
  echo "$f -> public/intro/intro.$hash.$f ($(stat -c %s "$BUILD/$f") bytes)"
done
