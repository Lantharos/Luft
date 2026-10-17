#!/usr/bin/env bash
set -euo pipefail

app="$1"
destdir="$2"
name="$(basename "$app")"
shopt -s nullglob
units=("$app"/data/*.service)

((${#units[@]})) || exit 0
install -Dm644 -t "$destdir/usr/lib/systemd/user" "${units[@]}"
printf 'enable %s\n' "${units[@]##*/}" |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/user-preset/40-luft-$name.preset"
