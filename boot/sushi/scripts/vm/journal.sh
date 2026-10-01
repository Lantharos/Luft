#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
disk="$root/vm/root.img"
out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT

machine="$(debugfs -R "ls /var/log/journal" "$disk" 2>/dev/null | grep -oE '[0-9a-f]{32}' | head -1)"
debugfs -R "rdump /var/log/journal/$machine $out" "$disk" >/dev/null 2>&1
journalctl --directory="$out/$machine" -o short-monotonic --no-pager "$@"
