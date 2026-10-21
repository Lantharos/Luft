#!/usr/bin/env bash
set -euo pipefail

app="$1"
destdir="$2"
name="$(basename "$app")"
shopt -s nullglob
units=("$app"/data/*.service "$app"/data/*.timer)
portals=("$app"/data/*.portal)
dbus=("$app"/data/dbus/*.service)

((${#portals[@]} == 0)) || install -Dm644 -t "$destdir/usr/share/xdg-desktop-portal/portals" "${portals[@]}"
((${#dbus[@]} == 0)) || install -Dm644 -t "$destdir/usr/share/dbus-1/services" "${dbus[@]}"
((${#units[@]})) || exit 0
install -Dm644 -t "$destdir/usr/lib/systemd/user" "${units[@]}"
grep -l '^\[Install\]' "${units[@]}" | xargs -n1 basename | sed 's/^/enable /' |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/user-preset/40-luft-$name.preset"
