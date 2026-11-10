#!/usr/bin/env bash
set -euo pipefail

cldr_layouts=https://www.unicode.org/Public/cldr/43/keyboards.zip
cldr_sha256=35112b0c0c604b3aba8366bdcfb3603c5aa89fb8624cb9eaa259557dfd9277b3
workdir=.osk-layout-workbench
layouts=osk-layouts
gresource=kestrel-osk-layouts.gresource.xml
pending=".$gresource.tmp"

cd "$(dirname "$0")"

rm -rf "$workdir"
mkdir -p "$workdir" "$layouts"
curl -fsSL -o "$workdir/keyboards.zip" "$cldr_layouts"
echo "$cldr_sha256  $workdir/keyboards.zip" | sha256sum --check --quiet
unzip -q "$workdir/keyboards.zip" -d "$workdir"

cldr2json/cldr2json.py "$workdir/keyboards/android" "$layouts"

{
  cat <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/com/lantharos/kestrel/osk-layouts">
EOF
  for layout in "$layouts"/*.json; do
    echo "    <file>$(basename "$layout")</file>"
  done
  cat <<'EOF'
    <file>emoji.json</file>
  </gresource>
</gresources>
EOF
} > "$pending"

mv "$pending" "$gresource"
