#!/usr/bin/env bash
set -euo pipefail

pw-metadata -m -n default | while read -r line; do
  if [[ "$line" =~ key:\'default\.configured\.(audio\.(sink|source))\'\ value:\'(.*)\'\ type:\'([^\']*)\' ]]; then
    pw-metadata -n default 0 "default.${BASH_REMATCH[1]}" "${BASH_REMATCH[3]}" "${BASH_REMATCH[4]}" > /dev/null
  fi
done
