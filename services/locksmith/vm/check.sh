#!/usr/bin/env bash
set -uo pipefail

policy=/etc/luft/policy.d/10-locksmith-check.toml
database=/etc/dconf/db/luft_policy
rules=/run/polkit-1/rules.d/00-luft-policy.rules
published=/run/luft/policy/policy.json
profile=/run/locksmith-check/profile
watched=/run/locksmith-check/watched
greeter_state=/var/lib/kestrel-greeter
accounts=(org.freedesktop.Accounts /org/freedesktop/Accounts org.freedesktop.Accounts)
greeter=(com.lantharos.Greeter1 /com/lantharos/Greeter1 com.lantharos.Greeter1)
trust=(com.lantharos.Trust1 /com/lantharos/Trust1 com.lantharos.Trust1)

say() { echo "locksmith-check: $*" > /dev/console; }
fail() {
  say "FAIL $*"
  cat "$watched" > /dev/console 2>&1
  journalctl -b -k --no-pager -o cat -g 'avc: +denied' > /dev/console
  journalctl -b -u locksmith -u polkit -u trustd -u kestrel-greeter --no-pager -o short-monotonic | tail -n 60 > /dev/console
  systemctl poweroff
  exit 1
}

eventually() {
  local label="$1"
  shift
  for _ in $(seq 100); do "$@" && return 0; sleep 0.2; done
  fail "$label"
}

decide() { install -D -m 644 /dev/stdin "$policy" <<< "$1"; }
as_mara() { runuser -u mara -- env DCONF_PROFILE="$profile" "$@"; }
reads() { [[ "$(as_mara dconf read "$1")" == "$2" ]]; }
heard() { grep -q "^$1\$" "$watched"; }
managed() {
  local answer
  answer="$("$@" 2>&1)"
  grep -q 'organization manages' <<< "$answer" || { say "answered: $answer"; return 1; }
}

at_startup() {
  [[ -f "$database" && -f "$published" ]] || fail "locksmith didn't write $database and $published at startup"
  [[ ! -e "$rules" ]] || fail "locksmith wrote a polkit rule while the policy decides nothing"
  install -d -m 755 "${profile%/*}"
  printf 'user-db:user\nsystem-db:luft_policy\n' > "$profile"
  : > "$watched"
  chown mara "$watched"
  runuser -u mara -- env DCONF_PROFILE="$profile" dbus-run-session -- sh -c "dconf watch / >> $watched" &
  sleep 2
  say "ok: locksmith keeps an empty database while nothing is decided"
}

session_settings() {
  decide $'[screen-lock]\nlock-after = 120\n[nearby-sharing]\nvisible-to = "no-one"'
  eventually "a running session reads the locked lock delay" reads /org/gnome/desktop/screensaver/lock-delay "uint32 120"
  reads /com/lantharos/kestrel/post/visibility "'no-one'" || fail "Post's visibility reads $(as_mara dconf read /com/lantharos/kestrel/post/visibility)"
  eventually "the running session hears the lock delay changed" heard /org/gnome/desktop/screensaver/lock-delay
  heard /com/lantharos/kestrel/post/visibility || fail "the running session didn't hear Post's visibility changed"
  ! as_mara dbus-run-session -- dconf write /org/gnome/desktop/screensaver/lock-delay "uint32 5" 2> /dev/null \
    || fail "the person could change a lock delay the policy decides"
  [[ "$(stat -c %C "$database")" == *:etc_t:* ]] || fail "$database is labelled $(stat -c %C "$database")"
  : > "$watched"
  decide $'[screen-lock]\nlock-after = 300'
  eventually "a running session reads the new lock delay" reads /org/gnome/desktop/screensaver/lock-delay "uint32 300"
  eventually "the running session hears the change again" heard /org/gnome/desktop/screensaver/lock-delay
  [[ -z "$(as_mara dconf read /com/lantharos/kestrel/post/visibility)" ]] || fail "Post's visibility stays locked after the policy let it go"
  grep -q '"lock-after":300' "$published" || fail "$published doesn't say what the policy decides: $(cat "$published")"
  say "ok: a running session reads and hears locked settings as the policy changes, and can't change them"
}

create_user() { runuser -u checker -- busctl call "${accounts[@]}" CreateUser ssi policy-made "Policy made" 0; }

account_changes() {
  decide $'[accounts]\nadd = false'
  eventually "locksmith writes the polkit rule" test -f "$rules"
  [[ "$(stat -c %C "$rules")" == *:policykit_var_run_t:* ]] || fail "$rules is labelled $(stat -c %C "$rules")"
  eventually "polkit refuses adding accounts under the policy" sh -c "! runuser -u checker -- busctl call ${accounts[*]} CreateUser ssi policy-made 'Policy made' 0 2> /dev/null"
  rm "$policy"
  eventually "locksmith takes the polkit rule away" test ! -e "$rules"
  eventually "adding accounts works again once the policy is gone" create_user > /dev/null
  userdel -r policy-made 2> /dev/null
  say "ok: the policy keeps accounts from being added through AccountsService, and only while it says so"
}

greetd_config() { /usr/libexec/kestrel-greeter-service --state-dir "$greeter_state" --write-greetd-config /run/locksmith-check/greetd.toml; }

automatic_sign_in() {
  busctl call "${greeter[@]}" SetAutomaticLogin s mara || fail "SetAutomaticLogin before the policy"
  greetd_config || fail "writing greetd's configuration"
  grep -q 'user = "mara"' /run/locksmith-check/greetd.toml || fail "greetd doesn't sign mara in automatically before the policy"
  decide $'[accounts]\nautomatic-sign-in = false'
  greetd_config || fail "writing greetd's configuration under the policy"
  ! grep -q 'initial_session' /run/locksmith-check/greetd.toml || fail "greetd still signs someone in automatically under the policy"
  [[ "$(busctl get-property "${greeter[@]}" AutomaticLogin)" == 's ""' ]] || fail "AutomaticLogin is $(busctl get-property "${greeter[@]}" AutomaticLogin) under the policy"
  managed busctl call "${greeter[@]}" SetAutomaticLogin s mara || fail "SetAutomaticLogin isn't refused as managed under the policy"
  rm "$policy"
  busctl call "${greeter[@]}" SetAutomaticLogin s "" || fail "SetAutomaticLogin off"
  say "ok: automatic sign-in is refused and left out of greetd while the policy keeps it off"
}

required_encryption() {
  systemctl stop trustd.service
  decide $'[encryption]\nrequired = true'
  eventually "the policy folder starts trustd" systemctl is-active --quiet trustd.service
  managed busctl call "${trust[@]}" CancelSystemDiskEncryption || fail "calling off encryption isn't refused as managed while it's required"
  rm "$policy"
  say "ok: the policy starts trustd when it changes, which refuses calling off required encryption"
}

no_denials() {
  local denied
  denied="$(journalctl -b -k --no-pager -o cat -g 'avc: +denied')"
  [[ -z "$denied" ]] || echo "$denied" > /dev/console
  ! grep -qE 'comm="(locksmith|dconf|polkitd|kestrel-greeter|trustd)"' <<< "$denied" || fail "SELinux denied the policy something"
  say "ok: SELinux enforcing, nothing of the policy's denied"
}

[[ "$(getenforce)" == Enforcing ]] || fail "SELinux isn't enforcing"
at_startup
session_settings
account_changes
automatic_sign_in
required_encryption
no_denials
say "PASS everything"
systemctl poweroff
