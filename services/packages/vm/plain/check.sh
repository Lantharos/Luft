#!/usr/bin/env bash
set -uo pipefail

BUS=(com.lantharos.Packages1 /com/lantharos/Packages1 com.lantharos.Packages1)
RULE=/etc/polkit-1/rules.d/50-luft-system-packages-check.rules
REQUESTED=/var/lib/luft/system-packages/packages
ACCOUNT=luft
MISSING=luft-check-no-such-package

report() { echo "luft-system-packages-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -u packager.service -u 'luft-system-packages-*' --no-pager -n 60 > /dev/ttyS0
  systemctl poweroff --no-block
  exit 1
}
pass() { report "PASS $*"; }

call() { busctl --system --timeout=1800 call "${BUS[@]}" "$@"; }
as_person() { runuser -u "$ACCOUNT" -- busctl --system --timeout=1800 call "${BUS[@]}" "$@"; }
install() { as_person Install as "$#" "$@"; }
remove() { as_person Remove as "$#" "$@"; }
listed() {
  busctl --system --json=short call "${BUS[@]}" List |
    python3 -c "import json, sys; print(eval(sys.argv[1], {'packages': json.loads(json.load(sys.stdin)['data'][0])}))" "$1"
}

allowed() { runuser -u "$ACCOUNT" -- sh -c "exec pkcheck --action-id $1 --process \$\$" > /dev/null 2>&1; }

# Lets the account change plain packages only, or with "change" any, as if it were
# signed in at the computer and, for the second, an administrator had typed a password.
grant() {
  local actions='"com.lantharos.packages.tools"' wanted=no found
  if [[ "${1:-}" == change ]]; then
    actions+=', "com.lantharos.packages.change"'
    wanted=yes
  fi
  printf 'polkit.addRule(function (action, subject) {\n  if (subject.user != "%s" || action.id.indexOf("com.lantharos.packages.") != 0) return polkit.Result.NOT_HANDLED;\n  return [%s].indexOf(action.id) >= 0 ? polkit.Result.YES : polkit.Result.NO;\n});\n' \
    "$ACCOUNT" "$actions" > "$RULE"
  for _ in $(seq 40); do
    found=no
    allowed com.lantharos.packages.change && found=yes
    allowed com.lantharos.packages.tools && [[ "$found" == "$wanted" ]] && return 0
    sleep 0.25
  done
  fail "polkit didn't take the check's rule"
}

refused() {
  local expected="$1" answer
  shift
  answer="$("$@" 2>&1)" && fail "$* was let through"
  [[ "$answer" == *"$expected"* ]] || fail "$* was refused for another reason: $answer"
}

merged() { [[ -e "$1" ]] || fail "$1 isn't there"; }
absent() { [[ ! -e "$1" ]] || fail "$1 is there"; }
requested() { grep -qx "$1" "$REQUESTED" 2>/dev/null; }

implicit() { pkaction --verbose --action-id "$1" | sed -n "s/^ *implicit $2: *//p"; }

defaults() {
  [[ "$(implicit com.lantharos.packages.tools any) $(implicit com.lantharos.packages.tools inactive) $(implicit com.lantharos.packages.tools active)" == "auth_admin auth_admin yes" ]] ||
    fail "the plain action has other defaults: $(pkaction --verbose --action-id com.lantharos.packages.tools)"
  [[ "$(implicit com.lantharos.packages.change active)" == auth_admin_keep ]] ||
    fail "the change action no longer asks for a password"
  pass "only someone signed in at the computer changes plain packages without a password"
}

plain_tool() {
  grant
  install htop > /dev/null || fail "installing htop was refused: $(install htop 2>&1)"
  merged /usr/bin/htop
  [[ "$(listed "[p['plain'] for p in packages['packages'] if p['name'] == 'htop']")" == "[True]" ]] || fail "htop isn't noted as plain"
  [[ "$(listed "[p['commands'] for p in packages['packages'] if p['name'] == 'htop']")" == "[['htop']]" ]] || fail "htop's command isn't noted"
  pass "a plain tool installs without a password"
}

privileged_needs_an_administrator() {
  refused "aren't allowed" install at
  absent /usr/bin/at
  requested at && fail "at was asked for although it was refused"
  merged /usr/bin/htop
  pass "a package with a service and a setuid program isn't installed without an administrator"
}

administrator_installs() {
  grant change
  install at > /dev/null || fail "an administrator couldn't install at: $(install at 2>&1)"
  merged /usr/bin/at
  [[ "$(stat -c %a /usr/bin/at)" == 4755 ]] || fail "at lost its setuid bit"
  systemctl is-active --quiet atd.service || fail "atd didn't start"
  pass "an administrator installs a package with a service and a setuid program"
}

plain_beside_privileged() {
  grant
  install figlet > /dev/null || fail "installing figlet beside at was refused: $(install figlet 2>&1)"
  merged /usr/bin/figlet
  merged /usr/bin/at
  remove figlet > /dev/null || fail "removing figlet was refused: $(remove figlet 2>&1)"
  absent /usr/bin/figlet
  pass "plain tools come and go beside a privileged package without a password"
}

privileged_removal_needs_an_administrator() {
  refused "aren't allowed" remove at
  merged /usr/bin/at
  requested at || fail "at left the list although removing it was refused"
  grant change
  remove at > /dev/null || fail "an administrator couldn't remove at: $(remove at 2>&1)"
  absent /usr/bin/at
  grant
  pass "taking away a privileged package needs an administrator"
}

made_by_scriptlets() {
  for name in luft-check-setuid luft-check-capable; do
    refused "aren't allowed" install "$name"
    absent "/usr/libexec/$name"
    requested "$name" && fail "$name was asked for although it was refused"
  done
  grant change
  install luft-check-setuid > /dev/null || fail "an administrator couldn't install luft-check-setuid: $(install luft-check-setuid 2>&1)"
  [[ "$(stat -c %a /usr/libexec/luft-check-setuid)" == 4755 ]] || fail "the scriptlet's setuid program isn't there"
  grant
  refused "aren't allowed" remove luft-check-setuid
  merged /usr/libexec/luft-check-setuid
  grant change
  remove luft-check-setuid > /dev/null || fail "an administrator couldn't remove luft-check-setuid: $(remove luft-check-setuid 2>&1)"
  absent /usr/libexec/luft-check-setuid
  grant
  pass "a setuid or capable program a scriptlet makes needs an administrator, coming and going"
}

missing_package() {
  refused "no package called $MISSING" install "$MISSING"
  requested "$MISSING" && fail "$MISSING was asked for"
  merged /usr/bin/htop
  pass "a package that doesn't exist fails the install and changes nothing"
}

one_left_out() {
  printf '%s\n' bash "$MISSING" htop > "$REQUESTED"
  call Rebuild > /dev/null || fail "the build with packages that can't be in it failed: $(call Rebuild 2>&1)"
  merged /usr/bin/htop
  [[ "$(listed "sorted(packages['leftOut'])")" == "['bash', '$MISSING']" ]] || fail "what was left out reads $(listed "packages['leftOut']")"
  remove bash "$MISSING" > /dev/null || fail "taking away what was left out was refused: $(remove bash "$MISSING" 2>&1)"
  [[ "$(cat "$REQUESTED")" == htop ]] || fail "the list reads $(cat "$REQUESTED")"
  pass "packages that can't be built are left out without holding back the others"
}

updates() {
  as_person Update > /dev/null || fail "updating the system packages was refused: $(as_person Update 2>&1)"
  merged /usr/bin/htop
  pass "the person at the computer updates the system packages"
}

last_one_goes() {
  remove htop > /dev/null || fail "removing the last plain tool was refused: $(remove htop 2>&1)"
  absent /usr/bin/htop
  pass "the last plain tool goes without a password"
}

nm-online --quiet --timeout=300 || fail "the network didn't come up"
defaults
plain_tool
privileged_needs_an_administrator
administrator_installs
plain_beside_privileged
privileged_removal_needs_an_administrator
made_by_scriptlets
missing_package
one_left_out
updates
last_one_goes
rm -f "$RULE"
pass "everything"
systemctl poweroff --no-block
