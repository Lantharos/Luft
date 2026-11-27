#!/usr/bin/env bash
set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo 'direct slow "Unknown" "Printer a check drives page by page"'
  exit 0
fi
control="${DEVICE_URI#slow:}"
cat "${6:-/dev/stdin}" > /dev/null
while :; do
  for said in "$control"/say.*; do
    [[ -e "$said" ]] || continue
    cat "$said" >&2
    rm "$said"
  done
  if [[ -e "$control/finish" ]]; then
    rm "$control/finish"
    exit 0
  fi
  if [[ -e "$control/fail" ]]; then
    rm "$control/fail"
    exit 1
  fi
  sleep 0.1
done
