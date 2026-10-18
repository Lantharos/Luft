#!/usr/bin/env bash
set -euo pipefail

image="$(cd "$(dirname "$0")/.." && pwd)"
needed="$1"
source "$image/stages/rpmfusion.sh"

mapfile -t runtime < <(cat "$image/packages/runtime.txt" "$image/packages/fonts.txt" "$needed" | sort -u)
dnf install -y --setopt=install_weak_deps=False "${runtime[@]}"

use_rpmfusion
mapfile -t codecs <"$image/packages/codecs.txt"
dnf install -y --setopt=install_weak_deps=False --allowerasing "${codecs[@]}"
forget_rpmfusion

mapfile -t unwanted < <(cat "$image/packages/replaced.txt" "$image/packages/unused.txt")
mapfile -t removed < <(rpm -qa --qf '%{NAME}\n' "${unwanted[@]}")
((${#removed[@]} == 0)) || dnf remove -y "${removed[@]}"
dnf autoremove -y
rm -rf /usr/share/unicode/cldr/common/annotationsDerived
dnf clean all
