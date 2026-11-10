#!/usr/bin/env bash
set -uo pipefail

state=/var/lib/luft-firewall-check
name=com.lantharos.Firewall1
path=/com/lantharos/Firewall1
person=checker
RECEIVER=$'import socket, sys\nreceiver = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)\nreceiver.bind(("::", int(sys.argv[1])))\nwhile True:\n    datagram = receiver.recv(64)\n    with open(sys.argv[2], "ab") as received:\n        received.write(datagram)'
read -r approved other program extension system < <(sed -n 's/.*luft\.firewall-check=\([0-9,]*\).*/\1/p' /proc/cmdline | tr , ' ')

say() { echo "luft-firewall-check: $*" > /dev/console; }
fail() {
  say "FAIL $*"
  nft list ruleset > /dev/console
  ss -ltnp > /dev/console
  ls -la "/home/$person" > /dev/console 2>&1
  journalctl -b -u luft-firewall --no-pager -o cat > /dev/console
  journalctl -b "_UID=${uid:-0}" --no-pager -o cat | grep -v "\"GET " | tail -n 60 > /dev/console
  systemctl poweroff
  exit 1
}
firewall() { busctl call "$name" "$path" "$name" "$@"; }
waiting() { busctl get-property "$name" "$path" "$name" Waiting; }

reaches() { curl -s -o /dev/null -m 3 "http://10.0.2.2:$1/"; }
datagram_reaches() {
  local received="/home/$person/received-$1"
  rm -f "$received"
  ip netns exec neighbor bash -c "echo $1 > /dev/udp/192.168.88.1/$1"
  for _ in $(seq 15); do [[ -s "$received" ]] && return 0; sleep 0.2; done
  return 1
}

neighbor() {
  ip netns add neighbor
  ip link add lan8 type veth peer name lan8-peer
  ip link set lan8-peer netns neighbor
  ip -n neighbor addr add 192.168.88.2/24 dev lan8-peer
  ip -n neighbor link set lan8-peer up
  nmcli device set lan8 managed yes
  nmcli connection add type ethernet ifname lan8 con-name neighbor ipv4.method manual ipv4.addresses 192.168.88.1/24 \
    ipv6.method disabled connection.zone home > /dev/null
  nmcli connection up neighbor > /dev/null
  eventually "a second home network connects" sh -c 'nft list set inet luft home4 | grep -q "\"lan8\" . 192.168.88.0/24"'
}
from_peer() { ip netns exec peer curl -s -o /dev/null -m 3 "http://$1/"; }
post_reaches() { ip netns exec neighbor curl -s -o /dev/null -m 3 "http://192.168.88.1:53317/"; }

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
asks_about() { waiting | grep -q "\"$1\" \"$2\" $uid"; }
not_asking() { ! waiting | grep -q "\"$1\" \"$2\""; }

as_person() { runuser -u "$person" -- env XDG_RUNTIME_DIR="/run/user/$uid" "$@"; }

serve_as() {
  local unit="$1" port="$2" bind="${3:-::}"
  as_person systemd-run --user --quiet --collect --unit="$unit" -- python3 -m http.server --bind "$bind" "$port" --directory /usr/share
}

sockets_as() {
  as_person systemd-run --user --quiet --collect --unit="$1" -- python3 /usr/libexec/luft-firewall-check-sockets "$2"
}

samples() {
  local count="$1" kind="$2" id="$3" seen=""
  for _ in $(seq "$count"); do
    if asks_about "$kind" "$id"; then seen+="1"; else seen+="0"; fi
    sleep 0.1
  done
  echo "$seen"
}

browse() {
  local helium=/usr/share/luft/preinstall/net.imput.helium.AppImage
  [[ -x "$helium" ]] || { say "skipped: Helium isn't in this image"; return; }
  as_person sh -c "cd /home/$person && $helium --appimage-extract > /dev/null" || fail "Helium doesn't unpack"
  as_person systemd-run --user --quiet --collect --unit=app-net.imput.helium@check.service \
    --property=StandardOutput="file:/home/$person/helium.log" --property=StandardError="file:/home/$person/helium.log" -- \
    "/home/$person/squashfs-root/opt/helium/helium" --headless=new --no-sandbox --no-first-run --user-data-dir="/home/$person/helium" \
    "data:text/html,<script>setInterval(() => fetch('http://' + Math.random().toString(36).slice(2) + '.example.com/').catch(() => {}), 200)</script>"
  local seen
  seen="$(samples 200 app net.imput.helium)"
  [[ "$seen" != *1* ]] || fail "Helium is asked about while it only browses ($seen)"
  as_person systemctl --user is-active --quiet app-net.imput.helium@check.service || {
    tail -n 20 "/home/$person/helium.log" > /dev/console
    fail "Helium stopped browsing"
  }
  as_person systemctl --user stop app-net.imput.helium@check.service
  say "ok: Helium browsing for 20 seconds is never asked about"
}

short_lived() {
  sockets_as app-com.example.Resolving@check.service resolve
  sockets_as app-com.example.Flapping@check.service flap
  sockets_as app-com.example.Settling@check.service settle
  local resolving="" flapping="" settling=""
  for _ in $(seq 100); do
    local now
    now="$(waiting)"
    if grep -q '"com.example.Resolving"' <<< "$now"; then resolving+="1"; else resolving+="0"; fi
    if grep -q '"com.example.Flapping"' <<< "$now"; then flapping+="1"; else flapping+="0"; fi
    if grep -q "\"app\" \"com.example.Settling\" $uid" <<< "$now"; then settling+="1"; else settling+="0"; fi
    sleep 0.1
  done
  [[ "$resolving" != *1* ]] || fail "an app is asked about for the sockets it looks up names with ($resolving)"
  [[ "$flapping" != *1* ]] || fail "an app is asked about for listeners that close at once ($flapping)"
  [[ "$settling" =~ ^0+1+$ ]] || fail "an app that stopped listening for a while isn't asked about once and for good ($settling)"
  say "ok: asked once about an app that listens, stops and listens again, never about short-lived sockets"
  firewall SetAppAccess sss app com.example.Settling blocked || fail "SetAppAccess blocked for the settling app"
  as_person systemctl --user stop app-com.example.Settling@check.service
  sockets_as app-com.example.Settling@again.service settle
  [[ "$(samples 50 app com.example.Settling)" != *1* ]] || fail "an app that wasn't allowed is asked about again"
  say "ok: an app that wasn't allowed isn't asked about again"
  browse
}

receive_as() {
  local unit="$1" port="$2"
  as_person systemd-run --user --quiet --collect --unit="$unit" -- python3 -c "$RECEIVER" "$port" "/home/$person/received-$port"
}

serve() {
  python3 -m http.server 80 --directory /usr/share > /dev/null 2>&1 &
  serve_as app-com.example.Approved@check.service 8000
  as_person systemd-run --user --quiet --scope --unit=app-flatpak-com.example.Other-41.scope -- \
    python3 -m http.server 8001 --directory /usr/share > /dev/null 2>&1 &
  serve_as dev-server.service 8002
  serve_as app-com.example.Local@check.service 8004 127.0.0.1
  as_person systemd-run --user --quiet --collect --unit=extensions-check.service --slice=session.slice -- sh -c \
    "busctl call $name $path $name SetExtensionPorts 'a(qs)' 1 8003 tcp; exec python3 -m http.server 8003 --directory /usr/share"
  as_person systemctl --user start kestrel-post.service
  receive_as app-com.example.Approved@udp.service 9000
  receive_as app-com.example.Other@udp.service 9001
  eventually "the test receivers listen" sh -c 'ss -lun | grep -q ":9000 " && ss -lun | grep -q ":9001 "'
  eventually "the test servers listen" sh -c 'for port in 80 8000 8001 8002 8003 8004 53317; do curl -s -o /dev/null http://localhost:$port/ || exit 1; done'
}

person() {
  id "$person" > /dev/null 2>&1 || useradd -m "$person"
  uid="$(id -u "$person")"
  loginctl enable-linger "$person"
  eventually "$person's session manager starts" test -S "/run/user/$uid/bus"
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
  expect closed "an allowed app from an unknown network" from_peer 192.168.77.1:8000
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

untouched_tables() {
  nft add table ip luft-check-nat
  nft add chain ip luft-check-nat postrouting '{ type nat hook postrouting priority srcnat; }'
  nft add rule ip luft-check-nat postrouting oifname "$device" masquerade
  systemctl restart luft-firewall.service
  eventually "the firewall comes back after a restart" is_home
  nft list chain ip luft-check-nat postrouting | grep -q masquerade || fail "restarting the firewall touched another table"
  expect open "an allowed app right after a restart" reaches "$approved"
  say "ok: other software's tables stay"
}

apps_on_home() {
  eventually "an app listening on a home network waits for an answer" asks_about app com.example.Approved
  asks_about app com.example.Other || fail "a Flatpak listening on a home network isn't asked about"
  asks_about program python3 || fail "a program outside an app isn't asked about by its name"
  not_asking app com.example.Local || fail "an app listening only on this computer is asked about"
  expect closed "an app nobody decided about" reaches "$approved"
  firewall SetAppAccess sss app com.example.Approved home || fail "SetAppAccess home"
  expect open "an app allowed on home networks" reaches "$approved"
  expect closed "an app nobody allowed" reaches "$other"
  firewall SetAppAccess sss app com.example.Other blocked || fail "SetAppAccess blocked"
  expect closed "an app that isn't allowed" reaches "$other"
  not_asking app com.example.Other || fail "an app that was answered is still asked about"
  neighbor
  expect open "UDP to an app allowed on home networks" datagram_reaches 9000
  expect closed "UDP to an app that isn't allowed" datagram_reaches 9001
  expect closed "a program nobody allowed" reaches "$program"
  firewall SetAppAccess sss program python3 home || fail "SetAppAccess for a program"
  expect open "a program allowed on home networks" reaches "$program"
  expect open "a port Kestrel's extensions listen on" reaches "$extension"
  as_person systemd-run --user --quiet --wait --pipe --unit=app-com.example.Sneaky@check.service -- \
    busctl call "$name" "$path" "$name" SetExtensionPorts 'a(qs)' 1 8001 tcp 2> /dev/null && fail "an app opened ports as if it were Kestrel"
  say "ok: only Kestrel declares extension ports"
  expect open "Post while someone may find the computer" post_reaches
  as_person systemd-run --user --quiet --wait --pipe --unit=app-com.example.Sneaky@post.service -- \
    busctl call "$name" "$path" "$name" SetPostOpen b true 2> /dev/null && fail "an app opened Post's port"
  touch "/home/$person/post-closed"
  eventually "Post's port closes once no one may find the computer" sh -c '! ip netns exec neighbor curl -s -o /dev/null -m 1 http://192.168.88.1:53317/'
  say "ok: Post's port follows who may find the computer"
}

first() {
  eventually "the network is classified as new" sh -c "busctl get-property $name $path $name Unclassified | grep -q '\"'"
  [[ "$(nmcli -g connection.zone connection show "$(connection)")" == "" ]] || fail "the network starts with a type"
  person
  serve
  is_public || fail "a new network isn't public"
  [[ "$(waiting)" == "a(ssu) 0" ]] || fail "apps are asked about on a public network"
  expect closed "an app on a new network" reaches "$approved"
  expect closed "port 80 on a new network" reaches "$system"
  firewall SetNetworkType os "$(wired_path)" home || fail "SetNetworkType home"
  eventually "the network becomes a home network" is_home
  [[ "$(unclassified)" == "a(os) 0" ]] || fail "a home network still waits for a type"
  apps_on_home
  short_lived
  expect closed "port 80 of a system service on a home network" reaches "$system"
  firewall OpenPort qss 80 tcp home || fail "OpenPort 80"
  expect open "port 80 opened in Settings" reaches "$system"
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
  person
  serve
  expect open "an allowed app after restarting" reaches "$approved"
  not_asking app com.example.Approved || fail "an allowed app is asked about again"
  expect closed "a blocked app after restarting" reaches "$other"
  expect open "port 80, still open after restarting" reaches "$system"
  firewall ClosePort qs 80 tcp || fail "ClosePort 80"
  expect closed "port 80 once closed again" reaches "$system"
  firewall SetNetworkType os "$(wired_path)" public || fail "SetNetworkType public"
  eventually "the network becomes public" is_public
  expect closed "an app allowed on home networks, on a public network" reaches "$approved"
  expect closed "Kestrel's extensions on a public network" reaches "$extension"
  firewall SetAppAccess sss app com.example.Approved anywhere || fail "SetAppAccess anywhere"
  expect open "an app allowed on public networks too" reaches "$approved"
  expect closed "a program allowed only on home networks, on a public network" reaches "$program"
  no_denials
  say "PASS second"
}

[[ "$(getenforce)" == Enforcing ]] || fail "SELinux isn't enforcing"
eventually "the network card shows up" sh -c "nmcli -t -f DEVICE,TYPE device | grep -q ':ethernet$'"
device="$(nmcli -t -f DEVICE,TYPE device | sed -n 's/:ethernet$//p' | head -n1)"
eventually "$device connects" sh -c "nmcli -g GENERAL.STATE device show $device | grep -q '^100'"
if [[ -d "$state" ]]; then second; else first; fi
systemctl poweroff
