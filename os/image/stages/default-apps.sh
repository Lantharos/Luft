#!/usr/bin/env bash
set -euo pipefail

applications="$1"
browser_types=(x-scheme-handler/http x-scheme-handler/https text/html application/xhtml+xml)

claimed_types() {
  local entry
  for entry in "$applications"/com.lantharos.*.desktop; do
    sed -n 's/^MimeType=//p' "$entry" | tr ';' '\n' | sed "/^$/d; s/$/=${entry##*/};/"
  done
  printf '%s=helium.desktop;\n' "${browser_types[@]}"
}

{
  echo '[Default Applications]'
  claimed_types | awk -F= '{apps[$1] = apps[$1] $2} END {for (kind in apps) print kind "=" apps[kind]}' | LC_ALL=C sort -t= -k1,1
} >"$applications/kestrel-mimeapps.list"
