#!/usr/bin/env bash
set -euo pipefail

cldr_layouts=http://www.unicode.org/Public/cldr/latest/keyboards.zip
workdir=.osk-layout-workbench
layouts=osk-layouts
gresource=kestrel-osk-layouts.gresource.xml
pending=".$gresource.tmp"

cd "$(dirname "$0")"

rm -rf "$workdir"
mkdir -p "$workdir" "$layouts"
(cd "$workdir" && gio copy "$cldr_layouts" . && unzip keyboards.zip)

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
