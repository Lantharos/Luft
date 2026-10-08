# shellcheck shell=bash

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
tools="$root/kestrel/tools"
build="$root/kestrel/build"
compositor="$root/kestrel/run/mutter-install/lib"
compositor_data="$root/kestrel/run/mutter-install/share"
export KESTREL_CAPTURE_DIR="${KESTREL_CAPTURE_DIR:-$root/kestrel/run/screenshots}"

session_hash() {
  printf '%s' "$1" | sha1sum | cut -c1-"$2"
}

wait_until() {
  local label="$1"
  shift
  for _ in $(seq 200); do
    if "$@" > /dev/null 2>&1; then return 0; fi
    sleep 0.05
  done
  echo "Timed out waiting for $label" >&2
  exit 1
}

system_data_dirs() {
  tr ':' '\n' <<< "${XDG_DATA_DIRS:-/usr/local/share:/usr/share}" | grep -v '^/opt/kestrel' | paste -sd:
}

require_build() {
  if [[ ! -f "$compositor/libmutter-51.so" ]]; then
    echo "Build Kestrel's compositor first: kestrel/compositor/build.sh" >&2
    exit 1
  fi
}

build_helpers() {
  glib-compile-schemas "$build/data"
  cargo build --release --quiet --manifest-path "$root/kestrel/settings/Cargo.toml"
  cargo build --release --quiet --manifest-path "$root/kestrel/keyring/Cargo.toml" -p luft-pinentry
  cargo build --release --quiet --manifest-path "$root/kestrel/openconnect/Cargo.toml"
  cargo build --release --quiet --manifest-path "$root/kestrel/greeter/Cargo.toml"
}

dbus_service() {
  local name="$1"
  shift
  printf '[D-BUS Service]\nName=%s\nExec=%s\n' "$name" "$*" > "$XDG_DATA_HOME/dbus-1/services/$name.service"
}

write_dbus_services() {
  local name
  mkdir -p "$XDG_DATA_HOME/dbus-1/services"
  dbus_service org.freedesktop.portal.Documents "$(command -v gjs)" -m "$tools/fixtures/session/documentPortal.js" "$session/documents"
  for name in com.lantharos.Kestrel.Notifications com.lantharos.Kestrel.Screencast; do
    dbus_service "$name" "$(command -v gjs)" -m "$tools/fixtures/session/shellService.js" "$build/js/dbusServices/$name.src.gresource" "$name"
  done
  dbus_service com.lantharos.Kestrel.HotplugSniffer "$build/src/hotplug-sniffer/kestrel-hotplug-sniffer"
  for name in com.lantharos.Keyring1 org.freedesktop.secrets org.freedesktop.portal.IBus \
    org.gtk.vfs.AfcVolumeMonitor org.gtk.vfs.GPhoto2VolumeMonitor org.gtk.vfs.MTPVolumeMonitor; do
    dbus_service "$name" /usr/bin/false
  done
}

export_build_paths() {
  export LD_LIBRARY_PATH="$build/src:$build/src/st:$compositor:$compositor/mutter-51${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
  export GI_TYPELIB_PATH="$build/src:$build/src/st:$compositor/mutter-51${GI_TYPELIB_PATH:+:$GI_TYPELIB_PATH}"
  export KESTREL_BUILDDIR="$build/src" KESTREL_DATADIR="$build/data" GSETTINGS_SCHEMA_DIR="$build/data:$compositor_data/glib-2.0/schemas"
  export KESTREL_CSS_PATH="$root/kestrel/engine/data/theme/kestrel.css"
  export GVFS_DISABLE_FUSE=1
  unset GSETTINGS_BACKEND GDK_BACKEND
}

prepare_session() {
  session="$1"
  mkdir -p "$session"/{config,data,cache,state}
  dconf dump /org/gnome/desktop/background/ > "$session/background.ini"
  dconf dump /org/gnome/desktop/interface/ > "$session/interface.ini"
  dconf dump /org/gnome/desktop/input-sources/ > "$session/input-sources.ini"
  dconf read /com/lantharos/kestrel/favorite-apps > "$session/favorites.txt"

  export XDG_DATA_DIRS="${XDG_DATA_HOME:-$HOME/.local/share}:$compositor_data:$(system_data_dirs)"
  export XDG_CONFIG_HOME="$session/config" XDG_DATA_HOME="$session/data" XDG_STATE_HOME="$session/state"
  cache_link="${XDG_RUNTIME_DIR:-/tmp}/kestrel-cache-$(session_hash "$session" 12)"
  ln -sfn "$session/cache" "$cache_link"
  export XDG_CACHE_HOME="$cache_link"
  printf 'user-db:user\nfile-db:%s\n' "$build/data/dconf/kestrel" > "$session/dconf-profile"
  export DCONF_PROFILE="$session/dconf-profile"
  export XCURSOR_PATH="$XDG_DATA_HOME/icons:$HOME/.local/share/icons:$HOME/.icons:/usr/share/icons:/usr/share/pixmaps"
  mkdir -p "$session/data/fonts"
  ln -sfn "$build/data/fonts" "$session/data/fonts/luft"
  write_dbus_services
  mkdir -p "$session/data/xdg-desktop-portal/portals" "$session/config/xdg-desktop-portal"
  ln -sfn "$root/kestrel/engine/data/session/kestrel.portal" "$session/data/xdg-desktop-portal/portals/kestrel.portal"
  ln -sfn "$root/kestrel/engine/data/session/kestrel-portals.conf" "$session/config/xdg-desktop-portal/kestrel-portals.conf"
  export_build_paths
}
