#!/usr/bin/env bash
set -euo pipefail

patches="$(cd "$(dirname "$0")/../../patches/bootc" && pwd)"
version="$1"
out="$2"
top=/var/tmp/bootc-rpm
spec="$top/SPECS/bootc.spec"

mkdir -p "$top"
dnf install -y --setopt=keepcache=True rpm-build
dnf download --source --destdir "$top" "bootc-$version"
rpm --define "_topdir $top" -i "$top"/bootc-*.src.rpm
cp "$patches"/*.patch "$top/SOURCES/"
sed -i -e 's/^Release:\(\s*\)%{autorelease}$/Release:\1%{autorelease -e luft}/' "$spec"
grep -q '^Release:.*-e luft' "$spec"
for patch in "$patches"/*.patch; do
  sed -i "/^Source1:/a Patch: ${patch##*/}" "$spec"
done
dnf builddep -y --setopt=keepcache=True "$spec"
env -u CARGO_TARGET_DIR CARGO_PROFILE_RELEASE_LTO=off rpmbuild --define "_topdir $top" \
  --define "rustflags_codegen_units 16" --define "rustflags_debuginfo 0" --without check -bb "$spec"
mkdir -p "$out"
cp "$top"/RPMS/*/bootc-[0-9]*.rpm "$out/"
rm -rf "$top"
