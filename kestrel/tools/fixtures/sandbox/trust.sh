#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: trust.sh FOLDER" >&2
  echo "Builds a Flatpak installed in FOLDER/flatpak and two package files in FOLDER for Schelf's trust dialogs." >&2
  exit 2
fi
out="$1"
work="$out/work"
rm -rf "$out"
mkdir -p "$work/runtime/files" "$work/runtime/usr" "$work/rpm"
export FLATPAK_USER_DIR="$out/flatpak"

printf '[Runtime]\nname=org.example.Platform\nruntime=org.example.Platform/x86_64/stable\nsdk=org.example.Platform/x86_64/stable\n' \
  > "$work/runtime/metadata"
flatpak build-export --runtime "$work/repo" "$work/runtime" stable > /dev/null
flatpak build-update-repo "$work/repo" > /dev/null
flatpak --user remote-add --no-gpg-verify checks "$work/repo"
flatpak --user install --noninteractive checks org.example.Platform > /dev/null
flatpak build-init "$work/app" org.example.Notes org.example.Platform org.example.Platform stable > /dev/null
mkdir -p "$work/app/files/bin" "$work/app/files/share/applications"
printf '#!/bin/sh\n' > "$work/app/files/bin/notes"
chmod +x "$work/app/files/bin/notes"
printf '[Desktop Entry]\nType=Application\nName=Notes\nComment=Write things down\nExec=notes\nIcon=org.example.Notes\n' \
  > "$work/app/files/share/applications/org.example.Notes.desktop"
flatpak build-finish "$work/app" --command=notes --share=network --filesystem=xdg-documents > /dev/null
flatpak build-export "$work/repo" "$work/app" stable > /dev/null
flatpak build-update-repo "$work/repo" > /dev/null
flatpak --user install --noninteractive checks org.example.Notes > /dev/null

package() {
  local name="$1" summary="$2" install="$3"
  cat > "$work/rpm/$name.spec" <<SPEC
Name: $name
Version: 1.0
Release: 1
Summary: $summary
License: MIT
BuildArch: noarch

%description
$summary.

%install
$install

%files
/usr/share/$name
$( [[ "$name" == *release* ]] && echo /etc/yum.repos.d/$name.repo || echo /usr/share/applications/$name.desktop )
SPEC
  rpmbuild --quiet -bb --define 'source_date_epoch_from_changelog 0' --define "_topdir $work/rpm/build" --define "_rpmdir $out" --define '_build_name_fmt %%{NAME}.rpm' \
    "$work/rpm/$name.spec"
}

package lantern-notes "A notebook for lighthouse keepers" 'mkdir -p %{buildroot}/usr/share/lantern-notes %{buildroot}/usr/share/applications && echo notes > %{buildroot}/usr/share/lantern-notes/README && printf "[Desktop Entry]\nType=Application\nName=Lantern Notes\nExec=lantern-notes\n" > %{buildroot}/usr/share/applications/lantern-notes.desktop'
package vscode-release "Visual Studio Code's software source" 'mkdir -p %{buildroot}/usr/share/vscode-release %{buildroot}/etc/yum.repos.d && echo source > %{buildroot}/usr/share/vscode-release/README && repo=%{buildroot}/etc/yum.repos.d/vscode-release.repo && echo "[code]" > $repo && echo "name=Visual Studio Code" >> $repo && echo "baseurl=https://packages.microsoft.com/yumrepos/vscode" >> $repo && echo "enabled=1" >> $repo && echo "gpgcheck=1" >> $repo && echo "gpgkey=https://packages.microsoft.com/keys/microsoft.asc" >> $repo'
rm -rf "$work/rpm"
