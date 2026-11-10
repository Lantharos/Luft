#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat >&2 <<'USAGE'
Usage: kestrel/tools/session/postNetwork.sh start DIR
       kestrel/tools/session/postNetwork.sh run DIR this|nearby COMMAND...

Gives Post a network of its own in a check session, so it never announces
itself on the real one or meets the real Post on LocalSend's port.

  start  Makes two network namespaces joined by a cable: this computer,
         10.53.17.1, and a device nearby, 10.53.17.2.
  run    Runs a command in one of them.
USAGE
  exit 2
}

[[ $# -ge 2 ]] || usage
command="$1"
dir="$2"
shift 2

case "$command" in
  start)
    mkdir -p "$dir"
    rm -f "$dir/this.pid" "$dir/nearby.pid"
    # shellcheck disable=SC2016
    exec unshare --net --map-current-user --keep-caps bash -c '
      set -euo pipefail
      dir="$1"
      ip link set lo up
      unshare --net sleep infinity &
      nearby=$!
      trap "kill $nearby 2> /dev/null" EXIT
      trap "exit 0" TERM
      ip link add post0 type veth peer name post1
      ip link set post1 netns "$nearby"
      ip addr add 10.53.17.1/24 dev post0
      ip link set post0 multicast on up
      ip route add 224.0.0.0/4 dev post0
      nsenter --target "$nearby" --net --preserve-credentials bash -c "
        ip link set lo up
        ip addr add 10.53.17.2/24 dev post1
        ip link set post1 multicast on up
        ip route add 224.0.0.0/4 dev post1"
      echo "$nearby" > "$dir/nearby.pid"
      echo $$ > "$dir/this.pid"
      wait "$nearby"
    ' post-network "$dir"
    ;;
  run)
    side="$1"
    shift
    for _ in $(seq 200); do
      [[ -s "$dir/$side.pid" ]] && break
      sleep 0.05
    done
    exec nsenter --target "$(cat "$dir/$side.pid")" --user --net --preserve-credentials -- "$@"
    ;;
  *) usage ;;
esac
