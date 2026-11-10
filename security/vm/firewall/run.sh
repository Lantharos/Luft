#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_FIREWALL_VM:-$luft/target/vm/firewall}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
serial="$vm/serial.log"
first=$((20000 + RANDOM % 20000))
hosts=()
forwards=()
for guest in 8000 8001 8002 8003 80; do
  host=$((first + ${#hosts[@]}))
  hosts+=("$host")
  forwards+=("hostfwd=tcp:127.0.0.1:$host-:$guest")
done
forwarded="$(IFS=,; echo "${forwards[*]}")"

start_stage
bun "$luft/os/image/parts/components/install.ts" "$stage/root" security
place 755 "$here/check.sh" /usr/libexec/luft-firewall-check
place 644 "$here/sockets.py" /usr/libexec/luft-firewall-check-sockets
place 644 "$here/luft-firewall-check.service" /usr/lib/systemd/system/luft-firewall-check.service
place 644 "$here/kestrel-post.service" /etc/systemd/user/kestrel-post.service
build_check_image "${LUFT_FIREWALL_BASE:-$image_name:45}" "$image_name-firewall-check" \
  "systemctl enable luft-firewall.service luft-firewall-check.service"
make_root_drive "$image_name-firewall-check"
relabel_root_drive "$serial.relabel"

for boot in first second; do
  CPUS=2 MEMORY=3072 SELINUX="selinux=1 enforcing=1" APPEND="luft.firewall-check=$(IFS=,; echo "${hosts[*]}")" \
    boot_root_drive "$serial.$boot" 10 -nic "user,model=virtio-net-pci,$forwarded"
  expect_in_log "$serial.$boot" luft-firewall-check "PASS $boot"
done
