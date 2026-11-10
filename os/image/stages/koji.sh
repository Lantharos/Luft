#!/usr/bin/env bash

koji_signed() {
  local package="$1" version="$2" release="$3" arch="$4" fedora key
  fedora="$(rpm -E %fedora)"
  rpmkeys --import "/usr/share/pki/rpm-gpg/RPM-GPG-KEY-fedora-$fedora-$(rpm -E %_arch)"
  key="$(rpmkeys --list | awk -v name="Fedora ($fedora)" 'index($0, name) {print substr($1, length($1) - 7)}')"
  echo "https://kojipkgs.fedoraproject.org/packages/$package/$version/$release/data/signed/$key/$arch"
}

require_fedora_signature() {
  rpmkeys --checksig --define '_pkgverify_level all' "$@"
}
