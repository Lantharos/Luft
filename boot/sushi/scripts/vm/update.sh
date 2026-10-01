#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
tree="${SUSHI_VM:-$root/vm}/tree"
packages=(vim-enhanced tree which nano)

podman run --rm --security-opt label=disable --rootfs "$tree" sh -c "
  dnf5 offline clean
  dnf5 install -y --offline --setopt=install_weak_deps=False --nodocs ${packages[*]}
"
