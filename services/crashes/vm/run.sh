#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_CRASHES_VM:-$luft/target/vm/crashes}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
serial="$vm/serial.log"
data="$luft/services/crashes/data"
built="$luft/target/release"

(cd "$luft" && cargo build --release --quiet -p luft-crash-collector -p luft-crash-reports -p luft-crash-fixture)
start_stage
place 755 "$built/luft-crash-collector" /usr/libexec/luft-crash-collector
place 755 "$built/luft-crash-reports" /usr/libexec/luft-crash-reports
place 755 "$built/luft-crash-fixture" /usr/libexec/luft-crash-fixture
place 755 "$built/luft-crash-fixture" /usr/bin/crash-fixture
for unit in luft-crash-collector.service luft-crash-collector.socket luft-crash-collector-poke.service; do
  place 644 "$data/$unit" "/usr/lib/systemd/system/$unit"
done
place 644 "$data/systemd-coredump.conf" /usr/lib/systemd/system/systemd-coredump@.service.d/luft-crash-reports.conf
place 644 "$data/luft-crash-reports.sysusers" /usr/lib/sysusers.d/luft-crash-reports.conf
place 644 "$data/com.lantharos.CrashCollector1.conf" /usr/share/dbus-1/system.d/com.lantharos.CrashCollector1.conf
place 644 "$data/com.lantharos.CrashCollector1.service" /usr/share/dbus-1/system-services/com.lantharos.CrashCollector1.service
place 755 "$here/check.sh" /usr/libexec/luft-crashes-check
place 644 "$here/luft-crashes-check.service" /usr/lib/systemd/system/luft-crashes-check.service
build_check_image "$image_name:45" "$image_name-crashes-check" \
  "systemctl enable luft-crash-collector.socket luft-crashes-check.service && useradd --create-home --uid 1000 mara"
make_root_drive "$image_name-crashes-check"

CPUS=2 MEMORY=3072 boot_root_drive "$serial" 10
expect_in_log "$serial" luft-crashes-check "PASS everything"
