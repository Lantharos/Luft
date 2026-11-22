#!/usr/bin/env bash
set -euo pipefail

parts="$(cd "$(dirname "$0")/../twemoji" && pwd)"
destdir="$1"
work=/var/tmp/twemoji
read -r version sha256 <"$parts/release"

fetch() {
  mkdir -p "$work/svg"
  curl -fsSL --retry 5 --retry-all-errors -o "$work/twemoji.tar.gz" \
    "https://github.com/jdecked/twemoji/archive/refs/tags/v$version.tar.gz"
  echo "$sha256  $work/twemoji.tar.gz" | sha256sum -c -
  tar -xzf "$work/twemoji.tar.gz" -C "$work"
}

name_by_sequence() {
  local svg sequence
  for svg in "$work/twemoji-$version"/assets/svg/*.svg; do
    sequence="$(basename "$svg" .svg)"
    sequence="${sequence//-fe0f/}"
    cp "$svg" "$work/svg/emoji_u${sequence//-/_}.svg"
  done
}

build() {
  python3.14 -m venv "$work/nanoemoji"
  "$work/nanoemoji/bin/pip" install --quiet --require-hashes --only-binary :all: -r "$parts/requirements.txt"
  (cd "$work" && PATH="$work/nanoemoji/bin:$PATH" SOURCE_DATE_EPOCH="$(stat -c %Y "$work/twemoji-$version/LICENSE-GRAPHICS")" \
    nanoemoji --family Twemoji --output_file Twemoji.ttf --color_format glyf_colr_1 --build_dir "$work/build" "$work"/svg/*.svg)
}

fetch
name_by_sequence
build
install -Dm644 "$work/build/Twemoji.ttf" "$destdir/usr/share/fonts/twemoji/Twemoji.ttf"
install -Dm644 "$work/twemoji-$version/LICENSE-GRAPHICS" "$destdir/usr/share/licenses/twemoji/LICENSE-GRAPHICS"
install -Dm644 "$parts/CREDITS" "$destdir/usr/share/licenses/twemoji/CREDITS"
rm -rf "$work"
