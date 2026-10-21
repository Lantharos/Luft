#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: services/speech/mirror/mirror.sh MODELS_JSON OUT" >&2
  echo "Puts every model file in models.json into OUT/<model>/, downloading it from its pinned source," >&2
  echo "or quantizing it from the source files it names, and checks it against its size and SHA-256." >&2
  exit 2
fi
here="$(cd "$(dirname "$0")" && pwd)"
manifest="$1"
out="$2"
sources="$(mktemp -d)"
trap 'rm -rf "$sources"' EXIT

verify() {
  local path="$1" size="$2" sha256="$3"
  [[ "$(stat -c %s "$path")" == "$size" ]] || { echo "$path is $(stat -c %s "$path") bytes, not $size" >&2; return 1; }
  echo "$sha256  $path" | sha256sum --check --quiet
}

jq -c '.models[] | {id, source, files: .files[]}' "$manifest" | while read -r entry; do
  id="$(jq -r .id <<<"$entry")"
  source="$(jq -r .source <<<"$entry")"
  name="$(jq -r .files.name <<<"$entry")"
  size="$(jq -r .files.size <<<"$entry")"
  sha256="$(jq -r .files.sha256 <<<"$entry")"
  target="$out/$id/$name"
  mkdir -p "$out/$id"
  mapfile -t inputs < <(jq -r '.files.quantizedFrom // [] | .[]' <<<"$entry")
  if ((${#inputs[@]})); then
    mkdir -p "$sources/$id"
    for input in "${inputs[@]}"; do
      curl --fail --location --silent --show-error --output "$sources/$id/$input" "$source/$input"
    done
    python3 "$here/quantize.py" "$sources/$id/${inputs[0]}" "$target"
    rm -rf "${sources:?}/$id"
  else
    curl --fail --location --silent --show-error --output "$target" "$source/$name"
  fi
  verify "$target" "$size" "$sha256"
  echo "$id/$name"
done
