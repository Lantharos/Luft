#!/usr/bin/env bash
set -euo pipefail

package="$1"
version="$2"
out="$3"
patches="$(cd "$(dirname "$0")/../../patches/$package" && pwd)"
top="/var/tmp/$package-rpm"
spec="$top/SPECS/$package.spec"

mkdir -p "$top"
dnf install -y --setopt=keepcache=True rpm-build
curl -fsSL --retry 5 --output "$top/$package-$version.src.rpm" \
  "https://kojipkgs.fedoraproject.org/packages/$package/${version%-*}/${version##*-}/src/$package-$version.src.rpm"
rpm --define "_topdir $top" -i "$top/$package"-*.src.rpm
cp "$patches"/*.patch "$top/SOURCES/"
sed -i -e 's/^Release:\(\s*\)%{\?autorelease}\?$/Release:\1%{autorelease -e luft}/' "$spec"
grep -q '^Release:.*-e luft' "$spec"
for patch in "$patches"/*.patch; do
  sed -i "/^Source0\?:/a Patch: ${patch##*/}" "$spec"
done
dnf builddep -y --setopt=keepcache=True "$spec"
env -u CARGO_TARGET_DIR CARGO_PROFILE_RELEASE_LTO=off rpmbuild --define "_topdir $top" \
  --define "rustflags_codegen_units 16" --define "rustflags_debuginfo 0" --define "debug_package %{nil}" --without check -bb "$spec"
mkdir -p "$out"
cp "$top/RPMS"/*/"$package"-[0-9]*.rpm "$out/"
rm -rf "$top"
