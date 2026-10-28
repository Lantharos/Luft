#!/usr/bin/env bash
set -euo pipefail

luft="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
name="${LUFT_CI_CONTAINER:-luft-kestrel-ci}"
image="${LUFT_CI_KESTREL:-ghcr.io/lantharos/luft-ci-kestrel:latest}"
user="$(id -un)"
uid="$(id -u)"
home="$luft/kestrel/run/home"

usage() {
  cat <<'USAGE'
Usage: .github/scripts/kestrel/container.sh run COMMAND...
       .github/scripts/kestrel/container.sh stop

run starts COMMAND as this user in a Fedora container with Kestrel's build
and session dependencies (LUFT_CI_KESTREL, default ghcr.io/lantharos/luft-ci-kestrel),
booted with systemd so the user has a systemd user instance and a session
bus, as in a login session. The repository is mounted at the same path, the
user's home is kestrel/run/home, and variables starting with KESTREL_,
CCACHE_ or CARGO_ are passed on. stop removes the container.
USAGE
}

wait_for() {
  local deadline=$((SECONDS + 60))
  until "$@"; do
    ((SECONDS < deadline)) || { echo "The container didn't get ready: $*" >&2; exit 1; }
    sleep 1
  done
}

system_ready() {
  podman exec "$name" systemctl is-system-running 2>/dev/null | grep -qE '^(running|degraded)$'
}

session_ready() {
  podman exec --user "$user" --env "XDG_RUNTIME_DIR=/run/user/$uid" "$name" systemctl --user is-system-running >/dev/null 2>&1
}

start() {
  mkdir -p "$home"
  podman run --detach --quiet --name "$name" --systemd=always --userns=keep-id --user root \
    --security-opt label=disable --volume "$luft:$luft" "$image" /sbin/init >/dev/null
  wait_for system_ready
  podman exec "$name" loginctl enable-linger "$user"
  wait_for session_ready
}

run() {
  local passed=() variable
  podman container exists "$name" || start
  while IFS= read -r variable; do
    passed+=(--env "$variable")
  done < <(compgen -e | grep -E '^(KESTREL|CCACHE|CARGO)_')
  podman exec --user "$user" --workdir "$PWD" --env "HOME=$home" --env "XDG_RUNTIME_DIR=/run/user/$uid" \
    --env "DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus" "${passed[@]}" "$name" "$@"
}

case "${1:-}" in
  run) shift; (($#)) || { usage >&2; exit 2; }; run "$@" ;;
  stop) podman rm --force --ignore "$name" >/dev/null ;;
  -h | --help) usage ;;
  *) usage >&2; exit 2 ;;
esac
