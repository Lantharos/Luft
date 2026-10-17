#!/usr/bin/env bash
set -euo pipefail

app="$1"
destdir="$2"
name="$(basename "$app")"
shopt -s nullglob
units=("$app"/data/*.service "$app"/data/*.timer)

((${#units[@]})) || exit 0
install -Dm644 -t "$destdir/usr/lib/systemd/user" "${units[@]}"
grep -l '^\[Install\]' "${units[@]}" | xargs -n1 basename | sed 's/^/enable /' |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/user-preset/40-luft-$name.preset"
