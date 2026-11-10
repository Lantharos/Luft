#!/usr/bin/env bash

use_rpmfusion() {
  local fedora keys=/usr/share/distribution-gpg-keys/rpmfusion
  fedora="$(rpm -E %fedora)"
  dnf install -y distribution-gpg-keys
  rpmkeys --import "$keys/RPM-GPG-KEY-rpmfusion-free-fedora-$fedora" "$keys/RPM-GPG-KEY-rpmfusion-nonfree-fedora-$fedora"
  dnf install -y --setopt=localpkg_gpgcheck=1 \
    "https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$fedora.noarch.rpm" \
    "https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$fedora.noarch.rpm"
}

forget_rpmfusion() {
  rpm -e rpmfusion-free-release rpmfusion-nonfree-release distribution-gpg-keys
}
