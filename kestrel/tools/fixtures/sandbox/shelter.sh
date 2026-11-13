#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: shelter.sh HOME BRANCH" >&2
  echo "Installs org.example.Shelter, which runs gjs on what it's given, for the user of HOME, on GNOME's runtime BRANCH." >&2
  exit 2
fi
home="$1" branch="$2"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
export HOME="$home" FLATPAK_USER_DIR="$home/.local/share/flatpak"
flatpak --user uninstall -y --noninteractive org.example.Shelter > /dev/null 2>&1 || true
flatpak --user remote-delete --force shelter > /dev/null 2>&1 || true
flatpak build-init "$work/app" org.example.Shelter org.gnome.Platform org.gnome.Platform "$branch" > /dev/null
mkdir -p "$work/app/files/bin"
printf '#!/bin/sh\nexec gjs -m "$@"\n' > "$work/app/files/bin/shelter"
chmod +x "$work/app/files/bin/shelter"
flatpak build-finish "$work/app" --command=shelter --socket=wayland > /dev/null
flatpak build-export "$work/repo" "$work/app" stable > /dev/null
flatpak --user remote-add --no-gpg-verify shelter "$work/repo"
flatpak --user install -y --noninteractive --no-deps shelter org.example.Shelter > /dev/null
flatpak --user remote-delete --force shelter
