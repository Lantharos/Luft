#!/usr/bin/env bash
set -euo pipefail

out="$1"
release="$2"
work="$(mktemp -d)"
export GNUPGHOME="$work/gnupg"

dnf install -y --quiet rpm-build rpm-sign createrepo_c gnupg2 > /dev/null
mkdir -m 700 "$GNUPGHOME"
gpg --batch --quiet --passphrase '' --quick-gen-key 'Luft check <check@luft.invalid>' rsa2048 sign never

package() {
  local name="$1" made="$2"
  cat > "$work/$name.spec" <<SPEC
Name: $name
Version: 1
Release: 1
Summary: Has its scriptlet make a program that runs with more rights
License: MIT
BuildArch: noarch

%description
Brings only a text file, and makes a program with more rights when it's installed.

%install
mkdir -p %{buildroot}/usr/share/$name
echo plain > %{buildroot}/usr/share/$name/readme

%post
$made

%files
/usr/share/$name
SPEC
  rpmbuild --quiet -bb --define "_topdir $work/build" "$work/$name.spec"
}

app() {
  cat > "$work/luft-check-app.spec" <<SPEC
Name: luft-check-app
Version: 1
Release: 1
Summary: Brings an app with a menu entry
License: MIT
BuildArch: noarch

%description
Brings a menu entry, as desktop apps do.

%install
mkdir -p %{buildroot}/usr/share/applications
printf '[Desktop Entry]\nType=Application\nName=Luft check\nExec=true\nIcon=luft-check-app\n' > %{buildroot}/usr/share/applications/luft-check-app.desktop

%files
/usr/share/applications/luft-check-app.desktop
SPEC
  rpmbuild --quiet -bb --define "_topdir $work/build" "$work/luft-check-app.spec"
}

app
package luft-check-setuid 'install -m 4755 /usr/bin/true /usr/libexec/luft-check-setuid'
package luft-check-capable 'cp /usr/bin/true /usr/libexec/luft-check-capable && setcap cap_net_raw+ep /usr/libexec/luft-check-capable'

mkdir -p "$out/usr/share/luft-check/repo" "$out/usr/share/pki/rpm-gpg" "$out/usr/share/dnf5/repos.d"
rpmsign --quiet --define '_gpg_name Luft check' --addsign "$work"/build/RPMS/noarch/*.rpm
cp "$work"/build/RPMS/noarch/*.rpm "$out/usr/share/luft-check/repo/"
createrepo_c --quiet "$out/usr/share/luft-check/repo"
key="$out/usr/share/pki/rpm-gpg/RPM-GPG-KEY-fedora-$release-luft-check"
gpg --armor --export 'Luft check' > "$key"
printf '[luft-check]\nname=Packages whose scriptlets make programs with more rights\nbaseurl=file:///usr/share/luft-check/repo\ngpgcheck=1\ngpgkey=file:///usr/share/pki/rpm-gpg/%s\n' \
  "${key##*/}" > "$out/usr/share/dnf5/repos.d/luft-check.repo"
rm -rf "$work"
