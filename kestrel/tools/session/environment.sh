# shellcheck shell=bash

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
tools="$root/kestrel/tools"
build="${KESTREL_BUILD:-$root/kestrel/build}"
compositor_prefix="${KESTREL_COMPOSITOR:-$root/kestrel/run/mutter-install}"
compositor="$compositor_prefix/lib"
compositor_data="$compositor_prefix/share"
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

require_build() {
  if [[ ! -f "$compositor/libmutter-51.so" ]]; then
    echo "Build Kestrel's compositor first: kestrel/compositor/build.sh" >&2
    exit 1
  fi
}

build_helpers() {
  glib-compile-schemas "$build/data"
  (cd "$root" && cargo build --release --quiet -p kestrel-settings -p kestrel-search -p luft-pinentry \
    -p kestrel-openconnect -p kestrel-greeter-service -p peek -p luft-accounts-service -p luft-speech-service)
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
  for name in com.lantharos.Keyring1 org.freedesktop.secrets org.freedesktop.portal.IBus org.freedesktop.portal.Desktop \
    org.gtk.vfs.AfcVolumeMonitor org.gtk.vfs.GPhoto2VolumeMonitor org.gtk.vfs.MTPVolumeMonitor; do
    dbus_service "$name" /usr/bin/false
  done
}

mask_host_apps() {
  local fixture="$1" dir entry data_dirs
  IFS=: read -ra data_dirs <<< "$XDG_DATA_DIRS"
  for dir in "${data_dirs[@]}"; do
    [[ "$dir" != "$compositor_data" && -d "$dir/applications" ]] || continue
    while read -r entry; do
      mkdir -p "$fixture/applications/$(dirname "$entry")"
      printf '[Desktop Entry]\nHidden=true\n' > "$fixture/applications/$entry"
    done < <(cd "$dir/applications" && find . -name '*.desktop' -printf '%P\n')
  done
}

use_fixture_desktop() {
  local fixture="$session/fixture" drives="$1"
  rm -rf "$fixture"
  mkdir -p "$fixture/applications" "$drives/TRAVEL"
  mask_host_apps "$fixture"
  python3 "$tools/session/appEntries.py" "$root" "$fixture"
  cp "$tools/fixtures/apps/"*.desktop "$fixture/applications/"
  update-desktop-database "$fixture/applications"
  export XDG_DATA_DIRS="$fixture:$XDG_DATA_DIRS"
  printf '%s\n' "['com.lantharos.rover.desktop', 'com.lantharos.draft.desktop', 'com.lantharos.mailman.desktop', 'com.lantharos.tern.desktop', 'com.lantharos.schelf.desktop', 'com.lantharos.settings.desktop']" > "$session/favorites.txt"
  printf '/dev/luft/system / btrfs rw 0 0\n/dev/luft/travel %s exfat rw 0 0\n' "$drives/TRAVEL" > "$fixture/mounts"
  mkdir -p "$fixture/flatpak"
  export LUFT_MOUNTS="$fixture/mounts" LUFT_SAMPLE_SYSTEM=1 FLATPAK_SYSTEM_DIR="$fixture/flatpak"
}

export_build_paths() {
  export LD_LIBRARY_PATH="$build/src:$build/src/st:$compositor:$compositor/mutter-51${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
  export GI_TYPELIB_PATH="$build/src:$build/src/st:$compositor/mutter-51${GI_TYPELIB_PATH:+:$GI_TYPELIB_PATH}"
  export KESTREL_BUILDDIR="$build/src" KESTREL_DATADIR="$build/data" GSETTINGS_SCHEMA_DIR="$build/data:$compositor_data/glib-2.0/schemas"
  export KESTREL_THEME_DIR="$build/data/theme"
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

  export XDG_DATA_DIRS="${XDG_DATA_HOME:-$HOME/.local/share}:$compositor_data:${XDG_DATA_DIRS:-/usr/local/share:/usr/share}"
  export XDG_CONFIG_HOME="$session/config" XDG_DATA_HOME="$session/data" XDG_STATE_HOME="$session/state"
  cache_link="${XDG_RUNTIME_DIR:-/tmp}/kestrel-cache-$(session_hash "$session" 12)"
  ln -sfn "$session/cache" "$cache_link"
  export XDG_CACHE_HOME="$cache_link"
  printf 'user-db:user\nfile-db:%s\n' "$build/data/dconf/kestrel" > "$session/dconf-profile"
  export DCONF_PROFILE="$session/dconf-profile"
  export XCURSOR_PATH="$XDG_DATA_HOME/icons:$HOME/.local/share/icons:$HOME/.icons:/usr/share/icons:/usr/share/pixmaps"
  mkdir -p "$session/data/fonts"
  ln -sfn "$build/data/fonts" "$session/data/fonts/luft"
  mkdir -p "$session/data/sounds"
  ln -sfn "$root/kestrel/engine/data/sounds/luft" "$session/data/sounds/luft"
  write_dbus_services
  mkdir -p "$session/data/xdg-desktop-portal/portals" "$session/config/xdg-desktop-portal"
  ln -sfn "$root/kestrel/engine/data/session/kestrel.portal" "$session/data/xdg-desktop-portal/portals/kestrel.portal"
  ln -sfn "$root/kestrel/engine/data/session/kestrel-portals.conf" "$session/config/xdg-desktop-portal/kestrel-portals.conf"
  export_build_paths
}
