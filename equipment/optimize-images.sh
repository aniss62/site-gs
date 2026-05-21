#!/usr/bin/env bash
# Compresses and converts images in site/assets/images/
# Requires: imagemagick (brew install imagemagick)

set -e

SRC="site/assets/images"
OUT=".tmp/images-optimized"

mkdir -p "$OUT"

find "$SRC" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r img; do
  rel="${img#$SRC/}"
  dir=$(dirname "$OUT/$rel")
  mkdir -p "$dir"

  base="${img%.*}"
  out_webp="$OUT/${rel%.*}.webp"
  out_opt="$OUT/$rel"

  echo "Optimizing: $img"
  convert "$img" -quality 82 -strip "$out_opt"
  convert "$img" -quality 80 "$out_webp"
done

echo "Done. Optimized images in $OUT/"
