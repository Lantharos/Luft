#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
state="${MEET_VM:-$here/state}"
stage="$state/stage"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"

usage() {
  cat <<'USAGE'
Usage: apps/meet/vm/iso.sh

Builds a Luft ISO with this checkout's installer, Install Luft, trustd, live start-up
and Toolbox builder on top of localhost/luft-system:45 and :45-nvidia (made by
os/image/build.sh, and named after LUFT_IMAGE_NAME like it), so Meet Luft and
Install Luft can be tried against them without building the whole image. It
carries the QEMU guest agent, so os/vm/control.py can run commands in the live
session and in what it installs. Writes apps/meet/vm/state/luft-meet.iso with a
.sha256 (MEET_VM picks another folder), signed with the keys os/image/build.sh
signs with.
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"

stage_changes() {
  rm -rf "$stage"
  mkdir -p "$stage/root"
  bun "$luft/os/image/parts/components/install.ts" "$stage/root" apps/setup/installer security
  (cd "$luft" && bun install --frozen-lockfile)
  sabine install --bundle --system-wide --root "$stage/root" "$luft/apps/setup"
  install -Dm755 "$luft/os/image/files/usr/libexec/luft-carried-tools" "$stage/root/usr/libexec/luft-carried-tools"
  install -Dm644 -t "$stage/root/usr/lib/systemd/user" "$luft/os/image/files/usr/lib/systemd/user/luft-carried-tools.service"
  cat >"$stage/Containerfile" <<'CONTAINERFILE'
ARG BASE
FROM ${BASE}
COPY root/ /
RUN systemctl --global enable luft-carried-tools.service && \
    systemctl enable luft-installer-expire-setup.service trustd-system-disk.service && \
    dnf install -y qemu-guest-agent && dnf clean all && \
    echo '(typepermissive virt_qemu_ga_t)' >/tmp/guest-agent.cil && semodule -i /tmp/guest-agent.cil && rm /tmp/guest-agent.cil
CONTAINERFILE
}

overlay() {
  local suffix="$1" system="$image_name-meet-system:45$1"
  podman build --quiet --no-hosts --no-hostname --build-arg "BASE=$image_name-system:45$suffix" --tag "$system" "$stage" > /dev/null
  "$luft/os/image/seal.sh" "$system" "$image_name-meet:45$suffix"
}

use_signing_keys
require_signed_by_keys "$image_name-system:45"
require_signed_by_keys "$image_name-system:45-nvidia"
stage_changes
overlay ""
overlay "-nvidia"
rm -rf "$state/iso"
LUFT_ISO="$state/iso" "$luft/os/iso/build.sh" "$image_name-meet:45"
built="$(echo "$state"/iso/luft-*.iso)"
mv "$built" "$state/luft-meet.iso"
sed "s|$(basename "$built")|luft-meet.iso|" "$built.sha256" >"$state/luft-meet.iso.sha256"
rm "$built.sha256"
echo "$state/luft-meet.iso"
