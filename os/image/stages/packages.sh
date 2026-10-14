#!/usr/bin/env bash
set -euo pipefail

image="$(cd "$(dirname "$0")/.." && pwd)"
needed="$1"
source "$image/stages/rpmfusion.sh"

mapfile -t runtime < <(cat "$image/packages/runtime.txt" "$needed" | sort -u)
dnf install -y --setopt=install_weak_deps=False "${runtime[@]}"

use_rpmfusion
mapfile -t codecs <"$image/packages/codecs.txt"
dnf install -y --setopt=install_weak_deps=False --allowerasing "${codecs[@]}"
forget_rpmfusion

mapfile -t replaced < <(rpm -q --qf '%{NAME}\n' $(cat "$image/packages/replaced.txt") 2>/dev/null | grep -v ' is not installed$' || true)
((${#replaced[@]} == 0)) || dnf remove -y "${replaced[@]}"
dnf clean all
