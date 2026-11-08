#!/usr/bin/env bash
set -uo pipefail

name=com.lantharos.RemoteLogin1
path=/com/lantharos/RemoteLogin1
person=checker
stranger=stranger
password=remote-login-check
key=/root/check-key
rules=/etc/polkit-1/rules.d/90-remote-login-check.rules
ldconfig_rewrites=/etc/ld.so.cache
phase_file=/var/lib/luft-remote-login-check/phase
read -r forwarded < <(sed -n 's/.*luft\.remote-login-check=\([0-9]*\).*/\1/p' /proc/cmdline)

say() { echo "luft-remote-login-check: $*" > /dev/console; }
fail() {
  say "FAIL $*"
  sshd -T > /dev/console 2>&1
  ls -laZ "/home/$person" "/home/$person/.ssh" > /dev/console 2>&1
  nft list ruleset > /dev/console
  ls -laZ /run/luft-remote-login > /dev/console 2>&1
  journalctl -b -k --no-pager -o cat -g 'avc: +denied' > /dev/console
  journalctl -b -u sshd -u luft-remote-login -u luft-firewall -u luft-remote-login-check --no-pager -o short-monotonic | tail -n 80 > /dev/console
  systemctl poweroff
  exit 1
}

remote_login() { busctl call "$name" "$path" "$name" "$@"; }
as_person() { runuser -u "$person" -- "$@"; }
property() { busctl get-property "$name" "$path" "$name" "$1"; }
firewall() { busctl call com.lantharos.Firewall1 /com/lantharos/Firewall1 com.lantharos.Firewall1 "$@"; }

eventually() {
  local label="$1"
  shift
  for _ in $(seq 100); do "$@" && return 0; sleep 0.2; done
  fail "$label"
}

expect() {
  local verdict="$1" label="$2"
  shift 2
  if "$@"; then [[ "$verdict" == works ]] || fail "$label works"; else [[ "$verdict" == refused ]] || fail "$label is refused"; fi
  say "ok: $label $verdict"
}

ssh_to() {
  local account="$1"
  shift
  ssh -p "$forwarded" -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=4 \
    -o IdentitiesOnly=yes -o IdentityFile="$key" "$account@10.0.2.2" "$@" 2> /dev/null
}

with_key() { [[ "$(ssh_to "$1" whoami)" == "$1" ]]; }

with_password() {
  local askpass
  askpass="$(mktemp)"
  printf '#!/bin/sh\necho %s\n' "$password" > "$askpass"
  chmod 700 "$askpass"
  local answer
  answer="$(SSH_ASKPASS="$askpass" SSH_ASKPASS_REQUIRE=force setsid -w ssh -p "$forwarded" -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null -o ConnectTimeout=4 -o PreferredAuthentications=password -o PubkeyAuthentication=no \
    -o NumberOfPasswordPrompts=1 "$1@10.0.2.2" whoami 2> /dev/null)"
  rm -f "$askpass"
  [[ "$answer" == "$1" ]]
}

accounts() {
  for account in "$person" "$stranger"; do
    useradd -m "$account"
    echo "$account:$password" | chpasswd
  done
  echo "root:$password" | chpasswd
  ssh-keygen -q -t ed25519 -N '' -C "check@luft" -f "$key"
}

home_network() {
  local device connection
  device="$(nmcli -t -f DEVICE,TYPE device | sed -n 's/:ethernet$//p' | head -n1)"
  eventually "$device connects" sh -c "nmcli -g GENERAL.STATE device show $device | grep -q '^100'"
  connection="$(busctl get-property org.freedesktop.NetworkManager "$(nmcli -g GENERAL.CON-PATH device show "$device")" \
    org.freedesktop.NetworkManager.Connection.Active Connection | cut -d' ' -f2 | tr -d '"')"
  wired="$connection"
  firewall SetNetworkType os "$wired" home > /dev/null || fail "SetNetworkType home"
  eventually "the network becomes a home network" sh -c "nft list set inet luft home4 | grep -q '10.0.2.0/24'"
}

off_at_first() {
  ! systemctl is-active --quiet sshd.service || fail "sshd runs before anyone turned remote login on"
  ! systemctl is-enabled --quiet sshd.service || fail "sshd starts with the computer before anyone turned remote login on"
  [[ -z "$(systemctl list-units --all --plain --no-legend 'sshd*.socket' | grep -v 'not-found')" ]] \
    || fail "sshd is socket activated: $(systemctl list-units --all --plain --no-legend 'sshd*.socket')"
  ! ss -Hltn | grep -q ':22 ' || fail "something listens on port 22"
  [[ "$(property Enabled)" == "b false" ]] || fail "Enabled is $(property Enabled)"
  say "ok: off at first, with nothing listening or waiting for connections"
}

turn_on() {
  as_person busctl call "$name" "$path" "$name" SetEnabled b true 2> /dev/null && fail "an account that isn't an administrator turned remote login on"
  cat > "$rules" <<'RULES'
polkit.addRule(function(action, subject) {
  if (action.id == "com.lantharos.remote-login.configure" && subject.user == "checker") return polkit.Result.YES;
});
RULES
  eventually "polkit reads the check's rule" as_person busctl call "$name" "$path" "$name" SetEnabled b true
  [[ "$(property Enabled)" == "b true" ]] || fail "Enabled is $(property Enabled) after turning it on"
  [[ "$(property Accounts)" == "as 1 \"$person\"" ]] || fail "turning it on let in $(property Accounts), not only $person"
  systemctl is-active --quiet sshd.service || fail "sshd doesn't run"
  systemctl is-enabled --quiet sshd.service || fail "sshd doesn't start with the computer"
  [[ -z "$(find /etc/systemd/system /etc/ssh/sshd_config.d -newer "$rules" \! -type d)" ]] \
    || fail "turning it on wrote to /etc: $(find /etc/systemd/system /etc/ssh/sshd_config.d -newer "$rules" \! -type d)"
  firewall_ports | grep -q '22 "tcp" "home"' || fail "port 22 isn't open on home networks: $(firewall_ports)"
  local listed fingerprint
  listed="$(property HostKeys)"
  fingerprint="$(ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub | cut -d' ' -f2)"
  grep -q "\"ssh-ed25519\" \"$fingerprint\"" <<< "$listed" || fail "HostKeys $listed doesn't name $fingerprint"
  say "ok: an administrator turns it on for themselves, with the host keys to check"
}

firewall_ports() { busctl get-property com.lantharos.Firewall1 /com/lantharos/Firewall1 com.lantharos.Firewall1 OpenPorts; }

effective() {
  local settings
  settings="$(sshd -T)"
  for line in "permitrootlogin no" "passwordauthentication no" "kbdinteractiveauthentication no" "maxauthtries 4" \
    "allowusers $person" "x11forwarding no" "logingracetime 30"; do
    grep -qix "$line" <<< "$settings" || fail "sshd -T doesn't say $line: $(grep -i "^${line%% *} " <<< "$settings")"
  done
  grep -qi "^persourcepenalties .*authfail:30\.0* .*max:3600" <<< "$settings" || fail "per-source penalties aren't on: $(grep -i '^persourcepenalties' <<< "$settings")"
  say "ok: sshd follows Luft's defaults"
}

keys() {
  as_person busctl call "$name" "$path" "$name" AddAuthorizedKey s "not a key" 2> /dev/null && fail "a line that isn't a key was added"
  as_person busctl call "$name" "$path" "$name" AddAuthorizedKey s "$(cat "$key.pub")" > /dev/null || fail "AddAuthorizedKey"
  as_person busctl call "$name" "$path" "$name" AddAuthorizedKey s "$(cat "$key.pub")" 2> /dev/null && fail "the same key was added twice"
  local folder="/home/$person/.ssh"
  [[ "$(stat -c '%a %U' "$folder")" == "700 $person" ]] || fail ".ssh is $(stat -c '%a %U' "$folder")"
  [[ "$(stat -c '%a %U' "$folder/authorized_keys")" == "600 $person" ]] || fail "authorized_keys is $(stat -c '%a %U' "$folder/authorized_keys")"
  [[ "$(stat -c %C "$folder")" == *:ssh_home_t:* && "$(stat -c %C "$folder/authorized_keys")" == *:ssh_home_t:* ]] \
    || fail "the keys aren't labelled ssh_home_t: $(stat -c %C "$folder" "$folder/authorized_keys")"
  as_person busctl call "$name" "$path" "$name" AuthorizedKeys | grep -q '"ssh-ed25519" "check@luft" "SHA256:' \
    || fail "AuthorizedKeys doesn't list the key: $(as_person busctl call "$name" "$path" "$name" AuthorizedKeys)"
  say "ok: a key added over D-Bus lands in the account's own authorized_keys, labelled for sshd"
}

held_back() {
  for _ in $(seq 8); do
    with_key "$stranger" && fail "an account nobody let in signed in"
    with_key "$person" || return 0
  done
  return 1
}

who_signs_in() {
  install -d -m 700 /root/.ssh "/home/$stranger/.ssh"
  cp "$key.pub" /root/.ssh/authorized_keys
  cp "$key.pub" "/home/$stranger/.ssh/authorized_keys"
  chown -R "$stranger:" "/home/$stranger/.ssh"
  restorecon -R /root/.ssh "/home/$stranger/.ssh"
  expect works "signing in with an added key" with_key "$person"
  expect refused "an account nobody let in, even with a key" with_key "$stranger"
  held_back || fail "the right key still works after many refused attempts from the same address"
  journalctl -b -u sshd --no-pager -o cat | grep -q "10.0.2.2/32: activating ipv4 penalty" || fail "sshd didn't say it held back the address"
  say "ok: sshd holds back an address after repeated refused attempts, even for the right key"
  echo "PerSourcePenaltyExemptList 10.0.2.2" > /etc/ssh/sshd_config.d/05-check.conf
  systemctl reload sshd.service
  expect refused "signing in with a password" with_password "$person"
  expect refused "root signing in, even with a key" with_key root
  remote_login SetPasswordLogin b true || fail "SetPasswordLogin true"
  expect works "signing in with a password once allowed" with_password "$person"
  expect refused "root signing in with its password" with_password root
  remote_login SetPasswordLogin b false || fail "SetPasswordLogin false"
  expect refused "signing in with a password once it's off again" with_password "$person"
}

networks() {
  firewall SetNetworkType os "$wired" public > /dev/null || fail "SetNetworkType public"
  eventually "the network becomes public" sh -c "! nft list set inet luft home4 | grep -q '10.0.2.0/24'"
  expect refused "signing in from a public network" with_key "$person"
  remote_login SetPublicNetworks b true || fail "SetPublicNetworks true"
  firewall_ports | grep -q '22 "tcp" "anywhere"' || fail "port 22 isn't open everywhere: $(firewall_ports)"
  expect works "signing in from a public network once allowed" with_key "$person"
  remote_login SetPublicNetworks b false || fail "SetPublicNetworks false"
  expect refused "signing in from a public network once that's off again" with_key "$person"
  firewall SetNetworkType os "$wired" home > /dev/null || fail "SetNetworkType home"
  eventually "the network is a home network again" sh -c "nft list set inet luft home4 | grep -q '10.0.2.0/24'"
}

has_ssh_session() { [[ -n "$(ssh_session)" ]]; }

ssh_session() {
  loginctl list-sessions --no-legend | while read -r id _; do
    [[ "$(loginctl show-session "$id" -p Service --value)" == sshd && "$(loginctl show-session "$id" -p State --value)" != closing ]] && echo "$id"
  done | head -n1
}

ended() { ! kill -0 "$1" 2> /dev/null; }

sessions() {
  ssh_to "$person" sleep 600 &
  local connection=$!
  eventually "the SSH session shows up in logind" has_ssh_session
  local id
  id="$(ssh_session)"
  [[ "$(loginctl show-session "$id" -p RemoteHost --value)" == 10.0.2.2 ]] || fail "the session's address is $(loginctl show-session "$id" -p RemoteHost --value)"
  [[ "$(loginctl show-session "$id" -p Name --value)" == "$person" ]] || fail "the session's account is $(loginctl show-session "$id" -p Name --value)"
  busctl call org.freedesktop.login1 /org/freedesktop/login1 org.freedesktop.login1.Manager TerminateSession s "$id" || fail "TerminateSession"
  eventually "disconnecting ends the connection" ended "$connection"
  say "ok: SSH sessions are listed with their address and account, and disconnect"
  ssh_to "$person" sleep 600 &
  connection=$!
  eventually "a second SSH session shows up" has_ssh_session
  remote_login SetEnabled b false || fail "SetEnabled false"
  eventually "turning it off ends every SSH session" ended "$connection"
}

turned_off() {
  ! systemctl is-active --quiet sshd.service || fail "sshd still runs after turning remote login off"
  ! systemctl is-enabled --quiet sshd.service || fail "sshd still starts with the computer"
  ! ss -Hltn | grep -q ':22 ' || fail "something still listens on port 22"
  ! firewall_ports | grep -q '22 "tcp"' || fail "port 22 is still open: $(firewall_ports)"
  expect refused "signing in once it's off" with_key "$person"
}

no_denials() {
  local denied
  denied="$(journalctl -b -k --no-pager -o cat -g 'avc: +denied' | grep -v "path=\"$ldconfig_rewrites\"")"
  [[ -z "$denied" ]] || echo "$denied" > /dev/console
  ! grep -qE 'comm="(sshd|sshd-session|sshd-auth|luft-remote-log|restorecon|systemctl)"' <<< "$denied" || fail "SELinux denied remote login something"
  say "ok: SELinux enforcing, nothing of remote login's denied"
}

older_etc() {
  install -d /etc/systemd/system/multi-user.target.wants /etc/systemd/system/sockets.target.wants
  ln -sf /usr/lib/systemd/system/sshd.service /etc/systemd/system/multi-user.target.wants/sshd.service
  ln -sf /usr/lib/systemd/system/sshd.socket /etc/systemd/system/sockets.target.wants/sshd.socket
  printf '%s\n' "AllowUsers $person" "PasswordAuthentication yes" > /etc/ssh/sshd_config.d/10-luft-remote-login.conf
  say "ok: /etc is now one from a version that had remote login and passwords on"
}

stays_off() {
  ! systemctl is-active --quiet sshd.service || fail "sshd runs after going back to an /etc that had it on"
  ! systemctl is-active --quiet sshd.socket || fail "sshd.socket listens after going back to an /etc that had it on"
  ! ss -Hltn | grep -q ':22 ' || fail "something listens on port 22 after going back"
  [[ "$(property Enabled)" == "b false" ]] || fail "Enabled is $(property Enabled) after going back"
  ! firewall_ports | grep -q '22 "tcp"' || fail "port 22 is open after going back: $(firewall_ports)"
  expect refused "signing in after going back to an /etc that had it on" with_key "$person"
}

passwords_stay_off() {
  as_person busctl call "$name" "$path" "$name" SetEnabled b true || fail "SetEnabled true after going back"
  [[ "$(property Accounts)" == "as 1 \"$person\"" ]] || fail "the accounts are $(property Accounts) after going back"
  [[ "$(property PasswordLogin)" == "b false" ]] || fail "PasswordLogin is $(property PasswordLogin) after going back"
  effective
  expect works "signing in with a key once it's on again" with_key "$person"
  expect refused "signing in with a password that an older /etc allowed" with_password "$person"
}

on_at_start() {
  eventually "sshd starts with the computer" systemctl is-active --quiet sshd.service
  [[ "$(property Enabled)" == "b true" ]] || fail "Enabled is $(property Enabled) after starting with it on"
  effective
  expect works "signing in with a key after starting with it on" with_key "$person"
  expect refused "signing in with a password after starting with it on" with_password "$person"
  remote_login SetEnabled b false || fail "SetEnabled false"
}

[[ "$(getenforce)" == Enforcing ]] || fail "SELinux isn't enforcing"
[[ -n "$forwarded" ]] || fail "no forwarded port on the command line"
phase="$(cat "$phase_file" 2> /dev/null || echo first)"
case "$phase" in
  first)
    accounts
    home_network
    off_at_first
    turn_on
    effective
    keys
    who_signs_in
    networks
    sessions
    turned_off
    no_denials
    older_etc
    next=went-back
    ;;
  went-back)
    home_network
    stays_off
    passwords_stay_off
    no_denials
    next=on-at-start
    ;;
  on-at-start)
    home_network
    on_at_start
    turned_off
    no_denials
    next=done
    ;;
esac
install -D /dev/stdin "$phase_file" <<< "$next"
say "PASS $phase"
systemctl poweroff
