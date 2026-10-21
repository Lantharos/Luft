#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../../.." && pwd)"
destdir="$1"
out="$2"
work="${LUFT_BUILD:-/var/tmp/luft-build}/kestrel"

# shellcheck source=../../../../kestrel/tools/install.sh
source "$luft/kestrel/tools/install.sh"
prefix=/usr
keyring_pam=/usr/lib64/security
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-$work/cargo}"
release="$CARGO_TARGET_DIR/release"

image_path() {
  case "$1" in
    /usr/local/*) echo "/usr/${1#/usr/local/}" ;;
    /etc/dbus-1/*) echo "/usr/share/dbus-1/${1#/etc/dbus-1/}" ;;
    *) echo "$1" ;;
  esac
}

place() {
  install -Dm"$2" /dev/stdin "$destdir$(image_path "$1")"
}

keep_sources_in_work() {
  mkdir -p "$work/run"
  ln -sfn "$work/run" "$luft/kestrel/run"
}

build_compositor() {
  "$luft/kestrel/compositor/build.sh" "$work/compositor" "$prefix"
  DESTDIR="$destdir" meson install -C "$work/compositor" --no-rebuild --quiet
  compositor_extras | while read -r file; do rm -f "$destdir$prefix/$file"; done
}

build_engine() {
  local setup=()
  [[ -f "$work/engine/build.ninja" ]] && setup+=(--reconfigure)
  (cd "$luft" && bun install --frozen-lockfile --filter @luft/kestrel-ui)
  export NODE_PATH="$luft/kestrel/ui/node_modules"
  meson setup "${setup[@]}" "$work/engine" "$luft/kestrel/engine" \
    -Dpkg_config_path="$prefix/lib/pkgconfig" --prefix="$prefix" --buildtype=release
  meson compile -C "$work/engine"
  DESTDIR="$destdir" meson install -C "$work/engine" --no-rebuild --quiet
}

build_services() {
  local project
  for project in settings search openconnect peek greeter keyring watchdog; do
    cargo build --release --locked --manifest-path "$luft/kestrel/$project/Cargo.toml"
  done
  install -Dm755 "$release/kestrel-settings" "$destdir/usr/libexec/kestrel-settings"
  install -Dm755 "$release/kestrel-search" "$destdir/usr/libexec/kestrel-search"
  install -Dm755 "$release/kestrel-openconnect" "$destdir/usr/libexec/kestrel-openconnect"
  install -Dm755 "$release/peek" "$destdir/usr/bin/peek"
  install -Dm755 "$release/kestrel-greeter-service" "$destdir/usr/libexec/kestrel-greeter-service"
  install -Dm755 "$release/kestrel-watchdog" "$destdir/usr/libexec/kestrel-watchdog"
  for program in luft-keyring luft-keyring-unlock luft-pinentry; do
    install -Dm755 "$release/$program" "$destdir/usr/libexec/$program"
  done
  install -Dm755 "$release/libpam_luft_keyring.so" "$destdir$keyring_pam/pam_luft_keyring.so"
}

stage_service_files() {
  local source target
  greeter_files | while read -r source target; do
    sed -e "s|@libexecdir@|$prefix/libexec|g" -e "s|@bindir@|$prefix/bin|g" "$greeter_data/$source" | place "$target" 644
  done
  sed "s|@bindir@|$prefix/bin|g" "$greeter_data/greetd.toml" | place /etc/greetd/config.toml 644
  { keyring_system_files; keyring_user_files; } | while read -r source target; do
    keyring_fill "$source" | place "$target" 644
  done
  place /usr/share/selinux/packages/luft-keyring.cil 644 < "$keyring_data/selinux/luft-keyring.cil"
  echo "pinentry-program $prefix/libexec/luft-pinentry" | place /etc/gnupg/gpg-agent.conf 644
  watchdog_files | while read -r source target; do
    sed "s|@libexecdir@|$prefix/libexec|g" "$watchdog_root/data/$source" | place "$target" 644
  done
  install -d "$destdir/usr/share/fonts"
  ln -sfn ../kestrel/fonts "$destdir/usr/share/fonts/luft"
}

stage_presets() {
  {
    echo "enable greetd.service"
    authenticator_units | grep -v '@' | sed 's/^/enable /'
    echo "enable luft-keyring-unlock.socket"
    echo "enable kestrel-incident.service"
  } | place /usr/lib/systemd/system-preset/40-luft-kestrel.preset 644
  printf 'enable %s\n' luft-keyring.socket luft-keyring.service |
    place /usr/lib/systemd/user-preset/40-luft-keyring.preset 644
}

list_typelibs() {
  grep -rhoE "gi://[A-Za-z0-9]+" "$luft/kestrel/engine/js" "$luft/kestrel/ui/src" | cut -d/ -f3 | sort -u
}

keep_sources_in_work
build_compositor
build_engine
build_services
stage_service_files
stage_presets
mkdir -p "$out"
list_typelibs > "$out/typelibs.txt"
