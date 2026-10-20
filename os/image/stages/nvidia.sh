#!/usr/bin/env bash
set -euo pipefail

driver="$1"
source "$(dirname "$0")/rpmfusion.sh"

use_rpmfusion
dnf install -y --setopt=tsflags=nodocs "$driver"/*.rpm libva-nvidia-driver
forget_rpmfusion
dnf clean all

printf 'kargs = ["rd.driver.blacklist=nouveau", "modprobe.blacklist=nouveau", "nvidia-drm.modeset=1"]\n' |
  install -Dm644 /dev/stdin /usr/lib/bootc/kargs.d/20-nvidia.toml
sed -i 's/^IMAGE_ID=.*/IMAGE_ID=luft-nvidia/' /usr/lib/os-release
sed -i 's/$/-nvidia/' /usr/share/luft/image-reference
rm -rf /run/dnf /var/log/dnf5.log* /var/lib/dnf /var/cache/ldconfig
