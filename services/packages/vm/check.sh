#!/usr/bin/env bash
set -uo pipefail

BUS=(com.lantharos.Packages1 /com/lantharos/Packages1 com.lantharos.Packages1)
SETTINGS=/usr/lib/sabine/com.lantharos.settings/settings
CONFIG=/var/lib/kestrel-greeter/config.json
ID=com.example.Clock
FOLDER=/home/mara/.local/share/luft/extensions/$ID
UNREVIEWED=/var/lib/luft/unreviewed-extensions/1000
RULE=/etc/polkit-1/rules.d/50-luft-packages-check.rules

report() { echo "luft-packages-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -u luft-packages.service -u kestrel-greeter.service -u polkit.service --no-pager -n 40 > /dev/ttyS0
  systemctl poweroff --no-block
  exit 1
}
pass() { report "PASS $*"; }

developer_tools() {
  systemctl stop kestrel-greeter.service
  install -Dm644 /dev/stdin "$CONFIG" <<< "{\"developerTools\": $1}"
}

as_settings() { runuser -u mara -- "$SETTINGS" --system call "${BUS[@]}" "$@"; }
as_mara() { runuser -u mara -- busctl --system call "${BUS[@]}" "$@"; }
with_folder() { runuser -u mara -- sh -c "exec $1 --system call ${BUS[*]} InstallUnreviewedExtension sh $ID 3 3<'$FOLDER'"; }
copy() { with_folder "$SETTINGS"; }
allow() { as_settings AllowExtensionFolder ss "$ID" "$FOLDER"; }

refused() {
  local expected="$1" answer
  shift
  answer="$("$@" 2>&1)" && fail "$* was let through"
  [[ "$answer" == *"$expected"* ]] || fail "$* was refused for another reason: $answer"
}

extension() {
  runuser -u mara -- sh -c "mkdir -p '$FOLDER/locales/en' && printf 'id = \"$ID\"\n' > '$FOLDER/extension.toml' && \
    printf 'export default () => {};\n' > '$FOLDER/extension.js' && printf 'extension-name = Clock\n' > '$FOLDER/locales/en/clock.ftl'"
}

off_refuses_everyone() {
  developer_tools false
  refused "Developer tools" copy
  refused "Developer tools" allow
  pass "with Developer tools off, even Settings is refused"
}

only_settings() {
  developer_tools true
  refused "Only Luft's Settings" with_folder busctl
  refused "Only Luft's Settings" as_mara AllowExtensionFolder ss "$ID" "$FOLDER"
  pass "any program but Settings is refused"
}

asks_every_time() {
  local defaults
  defaults="$(pkaction --verbose --action-id com.lantharos.packages.unreviewed-extensions | grep -c 'implicit.*: *auth_admin$')"
  [[ "$defaults" == 3 ]] || fail "polkit doesn't ask for an administrator every time: $(pkaction --verbose --action-id com.lantharos.packages.unreviewed-extensions)"
  refused "aren't allowed" copy
  refused "aren't allowed" allow
  [[ -e "$UNREVIEWED/$ID" || -e "$UNREVIEWED/.folders.json" ]] && fail "something was recorded without authentication"
  pass "Settings without authentication is refused, and polkit asks an administrator each time"
}

copies_beyond_reach() {
  printf 'polkit.addRule(function (action, subject) {\n  if (action.id == "com.lantharos.packages.unreviewed-extensions" && subject.user == "mara") return polkit.Result.YES;\n});\n' > "$RULE"
  sleep 2
  copy > /dev/null || fail "an authenticated copy from Settings was refused: $(copy 2>&1)"
  for file in extension.toml extension.js locales/en/clock.ftl; do
    cmp -s "$FOLDER/$file" "$UNREVIEWED/$ID/$file" || fail "$file wasn't copied as it was"
    [[ "$(stat -c '%U %a' "$UNREVIEWED/$ID/$file")" == "root 644" ]] || fail "$file is $(stat -c '%U %a' "$UNREVIEWED/$ID/$file")"
  done
  [[ "$(stat -c '%U %a' "$UNREVIEWED/$ID")" == "root 755" ]] || fail "the copy's folder is $(stat -c '%U %a' "$UNREVIEWED/$ID")"
  runuser -u mara -- sh -c "echo changed > '$UNREVIEWED/$ID/extension.js'" 2>/dev/null && fail "mara could change the copy"
  pass "a copy lands whole, owned by root, beyond the reach of the account's programs"
}

refuses_links() {
  runuser -u mara -- ln -s /etc/shadow "$FOLDER/locales/en/shadow.ftl"
  refused "is a link" copy
  rm "$FOLDER/locales/en/shadow.ftl"
  [[ -e "$UNREVIEWED/$ID/locales/en/shadow.ftl" ]] && fail "the link was copied"
  cmp -s "$FOLDER/extension.js" "$UNREVIEWED/$ID/extension.js" || fail "the earlier copy didn't stay"
  pass "a folder with a link out is refused, and the earlier copy stays"
}

records_the_folder() {
  allow > /dev/null || fail "an authenticated approval from Settings was refused: $(allow 2>&1)"
  [[ "$(cat "$UNREVIEWED/.folders.json")" == "{\"$ID\":\"$FOLDER\"}" ]] || fail "the approval reads $(cat "$UNREVIEWED/.folders.json")"
  [[ "$(stat -c '%U %a' "$UNREVIEWED/.folders.json")" == "root 644" ]] || fail "the approval is $(stat -c '%U %a' "$UNREVIEWED/.folders.json")"
  pass "an approved folder is recorded where only root can change it"
}

anyone_takes_it_back() {
  as_mara RemoveUnreviewedExtension s "$ID" > /dev/null || fail "mara couldn't take it back: $(as_mara RemoveUnreviewedExtension s "$ID" 2>&1)"
  [[ -e "$UNREVIEWED/$ID" ]] && fail "the copy stayed"
  [[ "$(cat "$UNREVIEWED/.folders.json")" == "{}" ]] || fail "the approval stayed: $(cat "$UNREVIEWED/.folders.json")"
  pass "taking a copy and an approval back needs no password"
}

extension
off_refuses_everyone
only_settings
asks_every_time
copies_beyond_reach
refuses_links
records_the_folder
anyone_takes_it_back
pass "everything"
systemctl poweroff --no-block
