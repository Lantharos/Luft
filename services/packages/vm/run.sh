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

(cd "$luft" && cargo build --release --quiet -p packager -p kestrel-greeter-service)
start_stage
place 755 "$built/packager" /usr/libexec/packager
place 644 "$data/packager.service" /usr/lib/systemd/system/packager.service
place 644 "$data/com.lantharos.Packages1.conf" /usr/share/dbus-1/system.d/com.lantharos.Packages1.conf
place 644 "$data/com.lantharos.Packages1.service" /usr/share/dbus-1/system-services/com.lantharos.Packages1.service
place 644 "$data/com.lantharos.packages.policy" /usr/share/polkit-1/actions/com.lantharos.packages.policy
place 755 "$built/kestrel-greeter-service" /usr/libexec/kestrel-greeter-service
sed 's|@libexecdir@|/usr/libexec|' "$greeter/kestrel-greeter.service" | install -Dm644 /dev/stdin "$stage/root/usr/lib/systemd/system/kestrel-greeter.service"
sed 's|@libexecdir@|/usr/libexec|' "$greeter/com.lantharos.Greeter1.service" | install -Dm644 /dev/stdin "$stage/root/usr/share/dbus-1/system-services/com.lantharos.Greeter1.service"
place 644 "$greeter/com.lantharos.Greeter1.conf" /usr/share/dbus-1/system.d/com.lantharos.Greeter1.conf
place 755 "$here/check.sh" /usr/libexec/packager-check
place 644 "$here/packager-check.service" /usr/lib/systemd/system/packager-check.service
place 644 "$here/usr.mount" /usr/lib/systemd/system/usr.mount
build_check_image "$image_name:45" "$image_name-packages-check" \
  "install -Dm755 /usr/bin/busctl /usr/lib/sabine/com.lantharos.settings/settings && \
  systemctl enable usr.mount packager-check.service && useradd --create-home --uid 1000 mara"
make_root_drive "$image_name-packages-check"

CPUS=2 MEMORY=3072 boot_root_drive "$serial" 10
expect_in_log "$serial" packager-check "PASS everything"
