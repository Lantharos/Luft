#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
action="${1:-install}"
prefix="${2:-/opt/kestrel}"
build="$root/kestrel/run/install-build"

greeter_data="$root/kestrel/greeter/data"

greeter_files() {
  echo "com.lantharos.Greeter1.conf /etc/dbus-1/system.d/com.lantharos.Greeter1.conf"
  echo "com.lantharos.Greeter1.service /usr/local/share/dbus-1/system-services/com.lantharos.Greeter1.service"
  echo "kestrel-greeter.service /usr/local/lib/systemd/system/kestrel-greeter.service"
  echo "com.lantharos.greeter.policy /usr/share/polkit-1/actions/com.lantharos.greeter.policy"
  echo "kestrel-greeter.tmpfiles /usr/local/lib/tmpfiles.d/kestrel-greeter.conf"
}

install_greeter() {
  cargo build --release --manifest-path "$root/kestrel/greeter/Cargo.toml"
  sudo install -D -m755 "$root/kestrel/greeter/target/release/kestrel-greeter-service" "$prefix/libexec/kestrel-greeter-service"
  greeter_files | while read -r source target; do
    sed -e "s|@libexecdir@|$prefix/libexec|g" -e "s|@bindir@|$prefix/bin|g" "$greeter_data/$source" \
      | sudo install -D -m644 /dev/stdin "$target"
  done
  sed "s|@bindir@|$prefix/bin|g" "$greeter_data/greetd.toml" | sudo install -D -m644 /dev/stdin "$prefix/share/kestrel/greetd.toml"
  sudo systemd-tmpfiles --create kestrel-greeter.conf
  sudo systemctl daemon-reload
  sudo systemctl reload dbus-broker.service
}

remove_greeter() {
  greeter_files | while read -r _ target; do sudo rm -f "$target"; done
  sudo systemctl daemon-reload
  sudo systemctl reload dbus-broker.service
}

installed_links() {
  echo "share/wayland-sessions/kestrel.desktop"
  echo "share/xdg-desktop-portal/kestrel-portals.conf"
  echo "share/xdg-desktop-portal/portals/kestrel.portal"
  echo "lib/systemd/user/app.slice.d/50-kestrel-oomd.conf"
  for unit in "$prefix"/lib/systemd/user/kestrel*; do
    echo "lib/systemd/user/$(basename "$unit")"
  done
}

check_runtime() {
  if ! gst-inspect-1.0 gtk4paintablesink >/dev/null 2>&1; then
    echo "Live wallpapers need the GStreamer GTK 4 video sink. On Fedora: sudo dnf install gstreamer1-plugin-gtk4" >&2
  fi
  if ! command -v greetd >/dev/null 2>&1; then
    echo "The login screen runs on greetd. On Fedora: sudo dnf install greetd" >&2
  fi
}

as_owner() {
  if [[ -w "$(dirname "$1")" ]]; then "${@:2}"; else sudo "${@:2}"; fi
}

case "$action" in
  install)
    rm -rf "$build"
    mkdir -p "$build"
    python3 "$root/kestrel/compositor/patches.py" prepare
    meson setup "$build/compositor" "$root/kestrel/run/mutter-source" \
      --prefix="$prefix" --libdir=lib --buildtype=release \
      -Dudev_dir="$prefix/lib/udev" -Dtests=disabled \
      -Dcogl_tests=false -Dclutter_tests=false -Dmutter_tests=false -Dinstalled_tests=false
    meson compile -C "$build/compositor"
    as_owner "$prefix" meson install -C "$build/compositor" --no-rebuild

    (cd "$root/kestrel/ui" && bun install --frozen-lockfile)
    meson setup "$build/engine" "$root/kestrel/engine" \
      -Dpkg_config_path="$prefix/lib/pkgconfig" --prefix="$prefix" --buildtype=release
    meson compile -C "$build/engine"
    as_owner "$prefix" meson install -C "$build/engine" --no-rebuild
    as_owner "$prefix" glib-compile-schemas "$prefix/share/glib-2.0/schemas"

    if [[ "$prefix" == /opt/* || "$prefix" == /usr/* ]]; then
      installed_links | while read -r link; do
        sudo mkdir -p "/usr/local/$(dirname "$link")"
        sudo ln -sfn "$prefix/$link" "/usr/local/$link"
      done
      install_greeter
      systemctl --user daemon-reload
      echo "Kestrel is installed in $prefix and appears as a session on the login screen."
      echo "The Kestrel login screen is ready to use with greetd; see Login screen in kestrel/README.md to switch to it."
      check_runtime
    else
      echo "Kestrel is installed in $prefix. Session entries are only linked for system prefixes."
    fi
    ;;
  remove)
    installed_links | while read -r link; do
      [[ -L "/usr/local/$link" ]] && sudo rm "/usr/local/$link"
    done
    remove_greeter
    as_owner "$prefix" rm -rf "$prefix"
    echo "Kestrel was removed from $prefix."
    ;;
  *)
    echo "Usage: kestrel/tools/install.sh [install|remove] [prefix]" >&2
    exit 2
    ;;
esac
