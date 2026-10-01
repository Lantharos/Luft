#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
luft="$(cd "$root/../.." && pwd)"
vm="$root/vm"
tree="$vm/tree"
build="$vm/kestrel"
prefix="$build/prefix"
greeter_data="$luft/kestrel/greeter/data"

python3 "$luft/kestrel/compositor/patches.py" prepare
if [[ ! -f "$build/compositor/build.ninja" ]]; then
  meson setup "$build/compositor" "$luft/kestrel/run/mutter-source" \
    --prefix="$prefix" --libdir=lib --buildtype=release \
    -Dudev_dir="$prefix/lib/udev" -Dtests=disabled \
    -Dcogl_tests=false -Dclutter_tests=false -Dmutter_tests=false -Dinstalled_tests=false
fi
meson compile -C "$build/compositor"
meson install -C "$build/compositor" --no-rebuild --quiet

(cd "$luft/kestrel/ui" && bun install --frozen-lockfile)
if [[ ! -f "$build/engine/build.ninja" ]]; then
  meson setup "$build/engine" "$luft/kestrel/engine" -Dpkg_config_path="$prefix/lib/pkgconfig" --prefix="$prefix" --buildtype=release
fi
meson compile -C "$build/engine"
meson install -C "$build/engine" --no-rebuild --quiet
glib-compile-schemas "$prefix/share/glib-2.0/schemas"
cargo build --release --manifest-path "$luft/kestrel/greeter/Cargo.toml"
install -Dm755 "$luft/kestrel/greeter/target/release/kestrel-greeter-service" "$prefix/libexec/kestrel-greeter-service"

libraries="$(find "$prefix" -type f \( -name '*.so*' -o -path '*/bin/*' -o -path '*/libexec/*' \) -exec sh -c 'file "$1" | grep -q ELF && ldd "$1"' _ {} \; 2>/dev/null |
  awk '/=> \//{print $3}' | grep -v "^$prefix" | sort -u)"
packages="$(echo "$libraries" | xargs rpm -qf --qf '%{NAME}\n' | sort -u)"
podman run --rm --security-opt label=disable -v "$tree:/installroot" "registry.fedoraproject.org/fedora:45" \
  dnf install -y -q --releasever=45 --installroot=/installroot --use-host-config --setopt=install_weak_deps=False --nodocs \
  $packages libadwaita gcr gnome-desktop4 gnome-bluetooth-libs glycin-libs NetworkManager-libnm libnma-gtk4 polkit-libs \
  librsvg2 libsoup3 upower-libs gstreamer1 ibus-libs geoclue2-libs libgudev at-spi2-core gnome-settings-daemon python3-gobject

stage="$build/system"
rm -rf "$stage"
place() {
  sed -e "s|@libexecdir@|$prefix/libexec|g" -e "s|@bindir@|$prefix/bin|g" "$1" | install -Dm644 /dev/stdin "$stage$2"
}
place "$greeter_data/com.lantharos.Greeter1.conf" /etc/dbus-1/system.d/com.lantharos.Greeter1.conf
place "$greeter_data/com.lantharos.Greeter1.service" /usr/share/dbus-1/system-services/com.lantharos.Greeter1.service
place "$greeter_data/kestrel-greeter.service" /usr/lib/systemd/system/kestrel-greeter.service
place "$greeter_data/com.lantharos.greeter.policy" /usr/share/polkit-1/actions/com.lantharos.greeter.policy
place "$greeter_data/kestrel-greeter.tmpfiles" /usr/lib/tmpfiles.d/kestrel-greeter.conf
place "$greeter_data/greetd.toml" /etc/greetd/config.toml
printf '[Service]\nProtectHome=no\n' | install -Dm644 /dev/stdin "$stage/etc/systemd/system/kestrel-greeter.service.d/home.conf"
for link in share/wayland-sessions/kestrel.desktop share/xdg-desktop-portal/kestrel-portals.conf \
  share/xdg-desktop-portal/portals/kestrel.portal lib/systemd/user/app.slice.d/50-kestrel-oomd.conf \
  $(cd "$prefix" && ls lib/systemd/user/kestrel*); do
  mkdir -p "$stage/usr/local/$(dirname "$link")"
  ln -sfn "$prefix/$link" "$stage/usr/local/$link"
done

podman unshare sh -c "
  mkdir -p '$tree$(dirname "$prefix")'
  rm -rf '$tree$prefix'
  cp -a '$prefix' '$tree$prefix'
  cp -a '$stage/.' '$tree/'
  chown -R 0:0 '$tree$prefix'
"
