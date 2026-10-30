#!/usr/bin/env bash
set -euo pipefail

image="$(cd "$(dirname "$0")/.." && pwd)"
needed="$1"
source "$image/stages/rpmfusion.sh"

mapfile -t runtime < <(cat "$image/packages/runtime.txt" "$image/packages/fonts.txt" "$needed" | sort -u)
dnf install -y --setopt=install_weak_deps=False --setopt=tsflags=nodocs "${runtime[@]}"

use_rpmfusion
mapfile -t codecs <"$image/packages/codecs.txt"
dnf install -y --setopt=install_weak_deps=False --setopt=tsflags=nodocs --allowerasing \
  --enablerepo=updates-testing --setopt=updates-testing.includepkgs='mesa-*' "${codecs[@]}"
forget_rpmfusion

mapfile -t unwanted < <(cat "$image/packages/replaced.txt" "$image/packages/unused.txt")
mapfile -t removed < <(rpm -qa --qf '%{NAME}\n' "${unwanted[@]}")
((${#removed[@]} == 0)) || dnf remove -y --setopt=protected_packages= "${removed[@]}"
dnf autoremove -y
dnf clean all

leave_out_documentation() {
  rm -rf /usr/share/man /usr/share/info
  find /usr/share/doc -not -type d -not -path '/usr/share/doc/bootc/*' \
    -not -iregex '.*/\(copying\|copyright\|licen[cs]e\|notice\)[^/]*' -delete
  find /usr/share/doc -type d -empty -not -path '/usr/share/doc/bootc/*' -delete
}

leave_out_unused_data() {
  rm -f /usr/share/ibus/dicts/emoji-*.dict
  rm -rf /usr/lib/sysimage/rpm-ostree-base-db /usr/share/rpm-ostree /usr/libexec/bootc-base-imagectl
}

leave_out_arm_firmware() {
  local firmware=/usr/lib/firmware
  rm -rf "$firmware"/{amlogic,amphion,arm,cnm,dpaa2,meson,powervr} "$firmware"/s5p-mfc* \
    "$firmware"/nvidia/{gk20a,gm20b,gp10b,tegra*}
}

leave_out_documentation
leave_out_unused_data
leave_out_arm_firmware
