# shellcheck shell=bash disable=SC2154

watchdog_root="$root/kestrel/watchdog"

watchdog_files() {
  echo "com.lantharos.Kestrel.Watchdog1.conf /etc/dbus-1/system.d/com.lantharos.Kestrel.Watchdog1.conf"
  echo "com.lantharos.Kestrel.Watchdog1.service /usr/local/share/dbus-1/system-services/com.lantharos.Kestrel.Watchdog1.service"
  echo "kestrel-watchdog.service /usr/local/lib/systemd/system/kestrel-watchdog.service"
  echo "kestrel-incident.service /usr/local/lib/systemd/system/kestrel-incident.service"
}

install_watchdog() {
  cargo build --release --manifest-path "$watchdog_root/Cargo.toml"
  sudo install -DZ -m755 "$watchdog_root/target/release/kestrel-watchdog" "$prefix/libexec/kestrel-watchdog"
  watchdog_files | while read -r source target; do
    sed "s|@libexecdir@|$prefix/libexec|g" "$watchdog_root/data/$source" | sudo install -DZ -m644 /dev/stdin "$target"
  done
  sudo systemctl daemon-reload
  sudo systemctl enable kestrel-incident.service
  sudo systemctl reload dbus-broker.service
}

remove_watchdog() {
  sudo systemctl disable kestrel-incident.service || true
  watchdog_files | while read -r _ target; do sudo rm -f "$target"; done
  sudo systemctl daemon-reload
  sudo systemctl reload dbus-broker.service
}
