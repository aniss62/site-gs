#!/usr/bin/env bash
# Checks all internal href links in HTML files under site/
# Reports broken links (files that don't exist)

set -e

SITE="site"
OUT=".tmp/broken-links.txt"
mkdir -p .tmp

echo "" > "$OUT"
ERRORS=0

while IFS= read -r html_file; do
  # Extract all href values
  grep -oE 'href="[^"#?]+"' "$html_file" | sed 's/href="//;s/"//' | while read -r link; do
    # Skip external links and anchors
    [[ "$link" == http* ]] && continue
    [[ "$link" == mailto* ]] && continue
    [[ -z "$link" ]] && continue

    # Resolve relative to the HTML file's directory
    dir=$(dirname "$html_file")
    target="$dir/$link"

    if [ ! -f "$target" ] && [ ! -d "$target" ]; then
      echo "BROKEN: $html_file → $link" | tee -a "$OUT"
      ERRORS=$((ERRORS + 1))
    fi
  done
done < <(find "$SITE" -name "*.html")

if [ "$ERRORS" -eq 0 ]; then
  echo "All internal links OK."
else
  echo "$ERRORS broken link(s) found. See $OUT"
  exit 1
fi
