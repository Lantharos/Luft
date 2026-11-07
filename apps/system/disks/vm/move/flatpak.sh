#!/usr/bin/env bash
set -euo pipefail

work=/var/tmp/luft-move-flatpak
app=com.lantharos.MoveCheck
platform=$app.Platform

rm -rf "$work"
mkdir -p "$work/platform/files" "$work/platform/usr" "$work/app/files/bin"
printf '[Runtime]\nname=%s\nruntime=%s/x86_64/1\nsdk=%s/x86_64/1\n' "$platform" "$platform" "$platform" > "$work/platform/metadata"
printf '[Application]\nname=%s\nruntime=%s/x86_64/1\nsdk=%s/x86_64/1\ncommand=hello\n' "$app" "$platform" "$platform" > "$work/app/metadata"
printf '#!/bin/sh\necho moved\n' > "$work/app/files/bin/hello"
chmod 755 "$work/app/files/bin/hello"
flatpak build-export --runtime "$work/repo" "$work/platform" 1 > /dev/null
flatpak build-finish "$work/app" > /dev/null
flatpak build-export "$work/repo" "$work/app" stable > /dev/null
flatpak remote-add --system --if-not-exists --no-gpg-verify luft-move-check "$work/repo"
flatpak install --system --noninteractive --assumeyes luft-move-check "$app"
flatpak remote-delete --system --force luft-move-check
rm -rf "$work"
flatpak info --system "$app" > /dev/null
