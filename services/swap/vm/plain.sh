#!/usr/bin/env bash
set -uo pipefail

report() { echo "luft-swap-check: $*" > /dev/ttyS0; }

while systemctl is-active --quiet luft-swap.service; do sleep 1; done
if [[ -n "$(swapon --noheadings --show)" ]]; then
  report "FAIL something swaps to a drive that isn't encrypted: $(swapon --noheadings --show)"
elif [[ -e /var/swap ]]; then
  report "FAIL /var/swap was made on a drive that isn't encrypted"
elif ! journalctl -b -u luft-swap.service -o cat | grep -q "isn't encrypted"; then
  report "FAIL luft-swap didn't say why it doesn't swap: $(journalctl -b -u luft-swap.service -o cat | tail -3)"
else
  report "PASS no swap on a drive without encryption"
fi
systemctl poweroff --no-block
