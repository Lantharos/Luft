#!/usr/bin/env bash
set -euo pipefail

dev="$(cd "$(dirname "$0")" && pwd)"

usage() {
  cat <<'USAGE'
Usage: os/dev/dependencies.sh [-y]

Installs what building and testing Luft needs as system packages, in one go:
os/image/packages/build.txt, os/dev/packages.txt and what Fedora builds Mutter
with. -y goes ahead without asking.
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

mutter_needs() {
  dnf5 repoquery --quiet --disablerepo='*' --enablerepo=fedora-source --enablerepo=updates-source \
    --latest-limit=1 --requires mutter | sed 's/ .*//' | paste -sd,
}

providers() {
  dnf5 repoquery --quiet --latest-limit=1 --arch="noarch,$(uname -m)" --queryformat '%{name}\n' --whatprovides "$1"
}

mapfile -t packages < <(
  {
    cat "$dev/../image/packages/build.txt" "$dev/packages.txt"
    providers "$(mutter_needs)"
  } | sort -u
)
exec dnf install "$@" "${packages[@]}"
