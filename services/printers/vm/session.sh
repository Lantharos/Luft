#!/usr/bin/env bash
set -uo pipefail

PRINTING=(--session --dest com.lantharos.Settings --object-path /com/lantharos/Settings/Printing)
printer="$1"

report() { echo "$*"; }

/usr/libexec/kestrel-settings --modules printers &
settings=$!
trap 'kill $settings' EXIT

listed() { gdbus call "${PRINTING[@]}" --method com.lantharos.Settings.Printing.Printers 2>&1; }

for _ in $(seq 60); do
  printers="$(listed)"
  [[ "$printers" == *"'$printer'"* && "$printers" == *"'accepting': <true>"* ]] && break
  sleep 1
done
report "session lists: $printers"
[[ "$printers" == *"'$printer'"* && "$printers" == *"'temporary': <true>"* ]] || { report "FAIL the network printer didn't show up by itself"; exit 1; }
report "PASS the network printer shows up by itself as a temporary queue"

job="$(gdbus call "${PRINTING[@]}" --method com.lantharos.Settings.Printing.PrintTestPage "$printer" 2>&1)"
[[ "$job" =~ ^\(uint32\ ([0-9]+),\)$ ]] || { report "FAIL PrintTestPage: $job"; exit 1; }
report "PASS a test page became job ${BASH_REMATCH[1]}"

gdbus call "${PRINTING[@]}" --method com.lantharos.Settings.Printing.SetDefault "$printer" > /dev/null || { report "FAIL SetDefault"; exit 1; }
grep -qx "Default $printer" "$HOME/.cups/lpoptions" || { report "FAIL the default wasn't kept: $(cat "$HOME/.cups/lpoptions")"; exit 1; }
[[ "$(listed)" == *"'default': <true>"* ]] || { report "FAIL the default isn't listed"; exit 1; }
report "PASS the printer is the default"
