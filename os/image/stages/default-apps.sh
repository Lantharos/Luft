#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

applications="$1"
preinstall=/usr/share/luft/preinstall
browser_types=(x-scheme-handler/http x-scheme-handler/https text/html application/xhtml+xml)

types_of() {
  sed -n 's/^MimeType=//p' | tr ';' '\n' | sed "/^$/d; s/$/=$1;/"
}

claimed_types() {
  local entry archive
  for entry in "$applications"/com.lantharos.*.desktop; do
    types_of "${entry##*/}" <"$entry"
  done
  for archive in "$preinstall"/*.tar.gz; do
    tar --list --gzip --file "$archive" --wildcards '*/usr/share/applications/com.lantharos.*.desktop' | while read -r entry; do
      tar --extract --gzip --to-stdout --file "$archive" "$entry" | types_of "${entry##*/}"
    done
  done
  printf '%s=net.imput.helium.desktop;\n' "${browser_types[@]}"
}

{
  echo '[Default Applications]'
  claimed_types | awk -F= '{apps[$1] = apps[$1] $2} END {for (kind in apps) print kind "=" apps[kind]}' | LC_ALL=C sort -t= -k1,1
} >"$applications/kestrel-mimeapps.list"
