#!/usr/bin/env bash
set -uo pipefail

LOADER_INFO=/sys/firmware/efi/efivars/LoaderInfo-4a67b082-0a4c-41cf-b6c7-440b29bb8c4f
SETTLE=15

report() { echo "luft-installer-check: $*" > /dev/ttyS0; }
setup_shell() { pgrep -u ada -x kestrel; }

loader="$(tail -c +5 "$LOADER_INFO" 2> /dev/null | tr -d '\0')"
[[ "$loader" == SushiBoot* ]] || { report "FAIL the installed system didn't start through SushiBoot: $loader"; exit 1; }
until shell="$(setup_shell)"; do sleep 1; done
sleep "$SETTLE"
[[ "$(setup_shell)" == "$shell" ]] || { report "FAIL setup's desktop restarted within $SETTLE seconds"; exit 1; }
report "STARTED through $loader into ada's setup"
