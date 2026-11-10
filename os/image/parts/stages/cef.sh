#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

runtimes="$1"
read -r cef sha256 <"$(dirname "$0")/../cef.lock"
name="$cef-minimal"
url="https://cef-builds.spotifycdn.com/cef_binary_${cef//+/%2B}_linux64_minimal.tar.bz2"

leave_only_this_build() {
  local runtime
  mkdir -p "$runtimes"
  for runtime in "$runtimes"/*/; do
    [[ "$(basename "$runtime")" == "$name" ]] || rm -rf "$runtime"
  done
}

unpack_without_top_folder() {
  python3 -I - "$1" "$2" <<'PYTHON'
import sys
import tarfile

with tarfile.open(sys.argv[1], "r:bz2") as archive:
    for member in archive.getmembers():
        member.name = member.name.partition("/")[2]
    archive.extractall(sys.argv[2], members=[m for m in archive.getmembers() if m.name], filter="data")
PYTHON
}

download() {
  local work
  work="$(mktemp -d /var/tmp/cef.XXXXXX)"
  curl -fsSL --retry 5 -o "$work/cef.tar.bz2" "$url"
  echo "$sha256  $work/cef.tar.bz2" | sha256sum --check --quiet
  unpack_without_top_folder "$work/cef.tar.bz2" "$work/runtime"
  echo "$cef" >"$work/runtime/.sabine-version"
  mv "$work/runtime" "$runtimes/$name"
  rm -rf "$work"
}

leave_only_this_build
[[ -f "$runtimes/$name/.sabine-version" ]] || download
