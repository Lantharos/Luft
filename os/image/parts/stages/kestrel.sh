#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../../.." && pwd)"
kestrel="$luft/kestrel"
destdir="$1"
out="$2"
work="${LUFT_BUILD:-/var/tmp/luft-build}/kestrel"
prefix=/usr
libexec=/usr/libexec
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-$work/cargo}"
release="$CARGO_TARGET_DIR/release"
compositor_extras=(
  bin/mutter share/GConf/gsettings/mutter-schemas.convert share/man/man1/gdctl.1
  share/man/man1/gnome-service-client.1 share/man/man1/mutter.1
)

greeter_files() {
  echo "com.lantharos.Greeter1.conf /usr/share/dbus-1/system.d/com.lantharos.Greeter1.conf"
  echo "com.lantharos.Greeter1.service /usr/share/dbus-1/system-services/com.lantharos.Greeter1.service"
  echo "kestrel-greeter.service /usr/lib/systemd/system/kestrel-greeter.service"
  echo "com.lantharos.greeter.policy /usr/share/polkit-1/actions/com.lantharos.greeter.policy"
  echo "kestrel-greeter.tmpfiles /usr/lib/tmpfiles.d/kestrel-greeter.conf"
  echo "greetd.toml /usr/lib/kestrel-greeter/greetd.toml"
  echo "greetd.service.conf /usr/lib/systemd/system/greetd.service.d/kestrel-greeter.conf"
  echo "luft-greeter.cil /usr/share/selinux/packages/luft-greeter.cil"
}

keyring_files() {
  echo "system/luft-keyring.sysusers /usr/lib/sysusers.d/luft-keyring.conf"
  echo "system/luft-keyring-unlock.socket /usr/lib/systemd/system/luft-keyring-unlock.socket"
  echo "system/luft-keyring-unlock.service /usr/lib/systemd/system/luft-keyring-unlock.service"
  echo "user/luft-keyring.service /usr/lib/systemd/user/luft-keyring.service"
  echo "user/luft-keyring.socket /usr/lib/systemd/user/luft-keyring.socket"
  echo "dbus/org.freedesktop.secrets.service /usr/share/dbus-1/services/org.freedesktop.secrets.service"
  echo "dbus/com.lantharos.Keyring1.service /usr/share/dbus-1/services/com.lantharos.Keyring1.service"
  echo "dbus/luft-keyring.portal /usr/share/xdg-desktop-portal/portals/luft-keyring.portal"
  echo "pam/kestrel-unlock /usr/lib/pam.d/kestrel-unlock"
  echo "pam/kestrel-unlock-fingerprint /usr/lib/pam.d/kestrel-unlock-fingerprint"
  echo "pam/greetd /usr/lib/pam.d/greetd"
}

watchdog_files() {
  echo "com.lantharos.Kestrel.Watchdog1.conf /usr/share/dbus-1/system.d/com.lantharos.Kestrel.Watchdog1.conf"
  echo "com.lantharos.Kestrel.Watchdog1.service /usr/share/dbus-1/system-services/com.lantharos.Kestrel.Watchdog1.service"
  echo "kestrel-watchdog.service /usr/lib/systemd/system/kestrel-watchdog.service"
  echo "kestrel-incident.service /usr/lib/systemd/system/kestrel-incident.service"
  echo "70-kestrel-power-buttons.rules /usr/lib/udev/rules.d/70-kestrel-power-buttons.rules"
}

passkeys_files() {
  echo "luft-passkeys-relay.socket /usr/lib/systemd/system/luft-passkeys-relay.socket"
  echo "luft-passkeys-relay@.service /usr/lib/systemd/system/luft-passkeys-relay@.service"
  echo "luft-passkeys.service /usr/lib/systemd/user/luft-passkeys.service"
  echo "com.lantharos.Passkeys.service /usr/share/dbus-1/services/com.lantharos.Passkeys.service"
}

place() {
  install -Dm"$2" /dev/stdin "$destdir$1"
}

fill() {
  sed -e "s|@libexecdir@|$libexec|g" -e "s|@bindir@|$prefix/bin|g" -e "s|@pamdir@|/usr/lib64/security|g" "$1"
}

stage_files() {
  local data="$1" source target
  while read -r source target; do
    fill "$data/$source" | place "$target" 644
  done
}

keep_sources_in_work() {
  mkdir -p "$work/run"
  ln -sfn "$work/run" "$kestrel/run"
}

build_compositor() {
  local extra
  "$kestrel/compositor/build.sh" "$work/compositor" "$prefix"
  DESTDIR="$destdir" meson install -C "$work/compositor" --no-rebuild --quiet
  for extra in "${compositor_extras[@]}"; do rm -f "$destdir$prefix/$extra"; done
}

build_engine() {
  local setup=()
  [[ -f "$work/engine/build.ninja" ]] && setup+=(--reconfigure)
  (cd "$luft" && bun install --frozen-lockfile --filter @luft/kestrel-ui --filter @luft/kestrel-types)
  export NODE_PATH="$kestrel/ui/node_modules"
  meson setup "${setup[@]}" "$work/engine" "$kestrel/engine" \
    -Dpkg_config_path="$prefix/lib/pkgconfig" --prefix="$prefix" --buildtype=release
  meson compile -C "$work/engine"
  DESTDIR="$destdir" meson install -C "$work/engine" --no-rebuild --quiet
}

check_types() {
  bun "$kestrel/types/generate.ts" --check --build "$work/engine" --compositor "$prefix"
}

build_services() {
  local program
  cargo build --release --locked --manifest-path "$luft/Cargo.toml"
  install -Dm755 "$release/peek" "$destdir/usr/bin/peek"
  for program in kestrel-session-manager kestrel-settings kestrel-search kestrel-portal kestrel-openconnect kestrel-greeter-service kestrel-watchdog \
    luft-keyring luft-keyring-unlock luft-pinentry luft-passkeys luft-passkeys-relay; do
    install -Dm755 "$release/$program" "$destdir$libexec/$program"
  done
  install -Dm755 "$release/libpam_luft_keyring.so" "$destdir/usr/lib64/security/pam_luft_keyring.so"
}

stage_service_files() {
  greeter_files | stage_files "$kestrel/greeter/data"
  keyring_files | stage_files "$kestrel/keyring/data"
  watchdog_files | stage_files "$kestrel/watchdog/data"
  passkeys_files | stage_files "$kestrel/passkeys/data"
  place /usr/share/selinux/packages/luft-keyring.cil 644 < "$kestrel/keyring/data/selinux/luft-keyring.cil"
  echo "pinentry-program $libexec/luft-pinentry" | place /etc/gnupg/gpg-agent.conf 644
  install -d "$destdir/usr/share/fonts"
  ln -sfn ../kestrel/fonts "$destdir/usr/share/fonts/luft"
}

stage_presets() {
  printf 'enable %s\n' greetd.service kestrel-authenticate.socket luft-keyring-unlock.socket kestrel-incident.service \
    luft-passkeys-relay.socket | place /usr/lib/systemd/system-preset/40-luft-kestrel.preset 644
  printf 'enable %s\n' luft-keyring.socket luft-keyring.service |
    place /usr/lib/systemd/user-preset/40-luft-keyring.preset 644
  printf 'enable luft-passkeys.service\n' | place /usr/lib/systemd/user-preset/40-luft-passkeys.preset 644
}

list_typelibs() {
  grep -rhoE "gi://[A-Za-z0-9]+" "$kestrel/ui/src" | cut -d/ -f3 | sort -u
}

keep_sources_in_work
build_compositor
build_engine
check_types
build_services
stage_service_files
stage_presets
mkdir -p "$out"
list_typelibs > "$out/typelibs.txt"
