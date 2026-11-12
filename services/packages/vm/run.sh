#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_PACKAGES_VM:-$luft/target/vm/packages}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
serial="$vm/serial.log"
data="$luft/services/packages/data"
greeter="$luft/kestrel/greeter/data"
built="$luft/target/release"

(cd "$luft" && cargo build --release --quiet -p luft-packages -p kestrel-greeter-service)
start_stage
place 755 "$built/luft-packages" /usr/libexec/luft-packages
place 644 "$data/luft-packages.service" /usr/lib/systemd/system/luft-packages.service
place 644 "$data/com.lantharos.Packages1.conf" /usr/share/dbus-1/system.d/com.lantharos.Packages1.conf
place 644 "$data/com.lantharos.Packages1.service" /usr/share/dbus-1/system-services/com.lantharos.Packages1.service
place 644 "$data/com.lantharos.packages.policy" /usr/share/polkit-1/actions/com.lantharos.packages.policy
place 755 "$built/kestrel-greeter-service" /usr/libexec/kestrel-greeter-service
sed 's|@libexecdir@|/usr/libexec|' "$greeter/kestrel-greeter.service" | install -Dm644 /dev/stdin "$stage/root/usr/lib/systemd/system/kestrel-greeter.service"
sed 's|@libexecdir@|/usr/libexec|' "$greeter/com.lantharos.Greeter1.service" | install -Dm644 /dev/stdin "$stage/root/usr/share/dbus-1/system-services/com.lantharos.Greeter1.service"
place 644 "$greeter/com.lantharos.Greeter1.conf" /usr/share/dbus-1/system.d/com.lantharos.Greeter1.conf
place 755 "$here/check.sh" /usr/libexec/luft-packages-check
place 644 "$here/luft-packages-check.service" /usr/lib/systemd/system/luft-packages-check.service
place 644 "$here/usr.mount" /usr/lib/systemd/system/usr.mount
build_check_image "$image_name:45" "$image_name-packages-check" \
  "groupadd --system greetd && install -Dm755 /usr/bin/busctl /usr/lib/sabine/com.lantharos.settings/settings && \
  systemctl enable usr.mount luft-packages-check.service && useradd --create-home --uid 1000 mara"
make_root_drive "$image_name-packages-check"

CPUS=2 MEMORY=3072 boot_root_drive "$serial" 10
expect_in_log "$serial" luft-packages-check "PASS everything"
