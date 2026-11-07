#!/usr/bin/env bash
set -uo pipefail

state=/var/lib/luft-firewall-check
name=com.lantharos.Firewall1
path=/com/lantharos/Firewall1
ports="$(sed -n 's/.*luft\.firewall-check=\([0-9]*,[0-9]*\).*/\1/p' /proc/cmdline)"
high="${ports%,*}"
low="${ports#*,}"

say() { echo "luft-firewall-check: $*" > /dev/console; }
fail() { say "FAIL $*"; nft list ruleset > /dev/console; systemctl poweroff; exit 1; }
firewall() { busctl call "$name" "$path" "$name" "$@"; }

reaches() { curl -s -o /dev/null -m 3 "http://10.0.2.2:$1/"; }
from_peer() { ip netns exec peer curl -s -o /dev/null -m 3 "http://$1/"; }

expect() {
  local verdict="$1" label="$2"
  shift 2
  if "$@"; then [[ "$verdict" == open ]] || fail "$label is reachable"; else [[ "$verdict" == closed ]] || fail "$label isn't reachable"; fi
  say "ok: $label $verdict"
}

eventually() {
  local label="$1"
  shift
  for _ in $(seq 100); do "$@" && return 0; sleep 0.2; done
  fail "$label"
}

no_denials() {
  local denied
  denied="$(journalctl -b -k --no-pager -o cat -g 'avc: +denied')"
  [[ -z "$denied" ]] || echo "$denied" > /dev/console
  ! grep -qE 'comm="(luft-firewall|nft)"|luft_firewall' <<< "$denied" || fail "SELinux denied the firewall something"
  say "ok: SELinux enforcing, nothing of the firewall's denied"
}

connection() { nmcli -g GENERAL.CONNECTION device show "$device"; }
wired_path() { busctl get-property org.freedesktop.NetworkManager "$(nmcli -g GENERAL.CON-PATH device show "$device")" org.freedesktop.NetworkManager.Connection.Active Connection | cut -d' ' -f2 | tr -d '"'; }
unclassified() { busctl get-property "$name" "$path" "$name" Unclassified; }
is_home() { nft list set inet luft home4 | grep -q "\"$device\" . 10.0.2.0/24"; }
is_public() { ! nft list set inet luft home4 | grep -q "\"$device\""; }

serve() {
  python3 -m http.server 8000 --directory /usr/share > /dev/null 2>&1 &
  python3 -m http.server 80 --directory /usr/share > /dev/null 2>&1 &
  eventually "the test servers listen" sh -c 'curl -s -o /dev/null http://127.0.0.1:8000/ && curl -s -o /dev/null http://127.0.0.1:80/'
}

peer() {
  local interface="$1" address="$2"
  ip link add "$interface" type veth peer name "$interface-peer"
  ip link set "$interface-peer" netns peer
  nmcli device set "$interface" managed no 2>/dev/null
  ip addr add "$address.1/24" dev "$interface"
  ip link set "$interface" up
  ip -n peer addr add "$address.2/24" dev "$interface-peer"
  ip -n peer link set "$interface-peer" up
}

virtual_networks() {
  ip netns add peer
  ip -n peer link set lo up
  peer tailscale0 100.100.0
  peer virbr0 192.168.122
  peer podman0 10.88.0
  peer lan9 192.168.77
  expect open "port 80 over Tailscale" from_peer 100.100.0.1:80
  expect open "port 80 from a virtual machine" from_peer 192.168.122.1:80
  expect open "port 80 from a container" from_peer 10.88.0.1:80
  expect closed "port 8000 from an unknown network" from_peer 192.168.77.1:8000
}

untouched_tables() {
  nft add table ip luft-check-nat
  nft add chain ip luft-check-nat postrouting '{ type nat hook postrouting priority srcnat; }'
  nft add rule ip luft-check-nat postrouting oifname "$device" masquerade
  systemctl restart luft-firewall.service
  eventually "the firewall comes back after a restart" is_home
  nft list chain ip luft-check-nat postrouting | grep -q masquerade || fail "restarting the firewall touched another table"
  expect open "port 8000 right after a restart" reaches "$high"
  say "ok: other software's tables stay"
}

first() {
  eventually "the network is classified as new" sh -c "busctl get-property $name $path $name Unclassified | grep -q '\"'"
  [[ "$(nmcli -g connection.zone connection show "$(connection)")" == "" ]] || fail "the network starts with a type"
  serve
  is_public || fail "a new network isn't public"
  expect closed "port 8000 on a new network" reaches "$high"
  expect closed "port 80 on a new network" reaches "$low"
  firewall SetNetworkType os "$(wired_path)" home || fail "SetNetworkType home"
  eventually "the network becomes a home network" is_home
  [[ "$(unclassified)" == "a(os) 0" ]] || fail "a home network still waits for a type"
  expect open "port 8000 on a home network" reaches "$high"
  expect closed "port 80 on a home network" reaches "$low"
  firewall OpenPort qs 80 tcp || fail "OpenPort 80"
  expect open "port 80 opened in Settings" reaches "$low"
  firewall OpenPort qs 1025 tcp && fail "a port above 1024 counts as closed"
  virtual_networks
  untouched_tables
  mkdir -p "$state"
  no_denials
  say "PASS first"
}

second() {
  eventually "the network connects again" is_home
  [[ "$(nmcli -g connection.zone connection show "$(connection)")" == home ]] || fail "the network forgot it's a home network"
  [[ "$(unclassified)" == "a(os) 0" ]] || fail "a known network waits for a type"
  serve
  expect open "port 8000 on a home network after restarting" reaches "$high"
  expect open "port 80, still open after restarting" reaches "$low"
  firewall ClosePort qs 80 tcp || fail "ClosePort 80"
  expect closed "port 80 once closed again" reaches "$low"
  firewall SetNetworkType os "$(wired_path)" public || fail "SetNetworkType public"
  eventually "the network becomes public" is_public
  expect closed "port 8000 on a public network" reaches "$high"
  no_denials
  say "PASS second"
}

[[ "$(getenforce)" == Enforcing ]] || fail "SELinux isn't enforcing"
eventually "the network card shows up" sh -c "nmcli -t -f DEVICE,TYPE device | grep -q ':ethernet$'"
device="$(nmcli -t -f DEVICE,TYPE device | sed -n 's/:ethernet$//p' | head -n1)"
eventually "$device connects" sh -c "nmcli -g GENERAL.STATE device show $device | grep -q '^100'"
if [[ -d "$state" ]]; then second; else first; fi
systemctl poweroff
