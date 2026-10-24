#!/usr/bin/env bash
# Leaves the CEF build $1 as the only runtime in Sabine's runtimes folder $2,
# downloading it when the folder doesn't have it yet, so Sabine stages exactly
# that build for every user.
set -euo pipefail
shopt -s nullglob

cef="$1"
runtimes="$2"
name="$cef-minimal"
url="https://cef-builds.spotifycdn.com/cef_binary_${cef//+/%2B}_linux64_minimal.tar.bz2"

mkdir -p "$runtimes"
for runtime in "$runtimes"/*/; do
  [[ "$(basename "$runtime")" == "$name" ]] || rm -rf "$runtime"
done

if [[ ! -f "$runtimes/$name/.sabine-version" ]]; then
  work="$(mktemp -d /var/tmp/cef.XXXXXX)"
  curl -fsSL --retry 5 -o "$work/cef.tar.bz2" "$url"
  [[ "$(sha1sum "$work/cef.tar.bz2" | cut -d' ' -f1)" == "$(curl -fsSL --retry 5 "$url.sha1")" ]] || {
    echo "CEF $cef doesn't match its published checksum" >&2
    exit 1
  }
  python3 -I - "$work/cef.tar.bz2" "$work/runtime" <<'PYTHON'
import sys
import tarfile

with tarfile.open(sys.argv[1], "r:bz2") as archive:
    for member in archive.getmembers():
        member.name = member.name.partition("/")[2]
    archive.extractall(sys.argv[2], members=[m for m in archive.getmembers() if m.name], filter="data")
PYTHON
  echo "$cef" >"$work/runtime/.sabine-version"
  mv "$work/runtime" "$runtimes/$name"
  rm -rf "$work"
fi
