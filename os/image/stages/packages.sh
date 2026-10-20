#!/usr/bin/env bash
set -euo pipefail

image="$(cd "$(dirname "$0")/.." && pwd)"
needed="$1"
source "$image/stages/rpmfusion.sh"

mapfile -t runtime < <(cat "$image/packages/runtime.txt" "$image/packages/fonts.txt" "$needed" | sort -u)
dnf install -y --setopt=install_weak_deps=False --setopt=tsflags=nodocs "${runtime[@]}"

use_rpmfusion
mapfile -t codecs <"$image/packages/codecs.txt"
dnf install -y --setopt=install_weak_deps=False --setopt=tsflags=nodocs --allowerasing "${codecs[@]}"
forget_rpmfusion

mapfile -t unwanted < <(cat "$image/packages/replaced.txt" "$image/packages/unused.txt")
mapfile -t removed < <(rpm -qa --qf '%{NAME}\n' "${unwanted[@]}")
((${#removed[@]} == 0)) || dnf remove -y "${removed[@]}"
dnf autoremove -y
dnf clean all

leave_out_documentation() {
  rm -rf /usr/share/man /usr/share/info
  find /usr/share/doc -type f -not -path '/usr/share/doc/bootc/*' \
    -not -iregex '.*/\(copying\|copyright\|licen[cs]e\|notice\)[^/]*' -delete
  find /usr/share/doc -type d -empty -not -path '/usr/share/doc/bootc/*' -delete
}

leave_out_unused_data() {
  rm -f /usr/share/ibus/dicts/emoji-*.dict
}

leave_out_documentation
leave_out_unused_data
