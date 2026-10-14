#!/usr/bin/env bash

use_rpmfusion() {
  local fedora
  fedora="$(rpm -E %fedora)"
  dnf install -y \
    "https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$fedora.noarch.rpm" \
    "https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$fedora.noarch.rpm"
}

forget_rpmfusion() {
  rpm -e rpmfusion-free-release rpmfusion-nonfree-release
}
