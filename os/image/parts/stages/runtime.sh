#!/usr/bin/env bash
set -euo pipefail

destdir="$1"
languages=(en-US en-GB)
shared_assets=(icudtl.dat resources.pak chrome_100_percent.pak chrome_200_percent.pak)

keep_languages() {
  local pak language
  for pak in "$1"/*.pak; do
    language="$(basename "$pak" .pak)"
    [[ " ${languages[*]} " == *" ${language%%_*} "* ]] || rm "$pak"
  done
}

share_resources() {
  local runtime="$1" asset
  for asset in "${shared_assets[@]}"; do
    ln -f "$runtime/Resources/$asset" "$runtime/Release/$asset"
  done
  rm -r "$runtime/Release/locales"
  cp -al "$runtime/Resources/locales" "$runtime/Release/locales"
}

for runtime in "$destdir"/usr/lib/sabine/runtimes/cef/*/; do
  strip --strip-unneeded "$runtime"/Release/*.so*
  keep_languages "$runtime/Resources/locales"
  share_resources "${runtime%/}"
done
