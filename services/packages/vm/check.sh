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

authorized() {
  for _ in $(seq 40); do
    runuser -u mara -- sh -c 'exec pkcheck --action-id com.lantharos.packages.unreviewed-extensions --process $$' 2>/dev/null && return 0
    sleep 0.25
  done
  return 1
}

extension() {
  runuser -u mara -- sh -c "mkdir -p '$FOLDER/locales/en' && printf 'id = \"$ID\"\n' > '$FOLDER/extension.toml' && \
    printf 'export default () => {};\n' > '$FOLDER/extension.js' && printf 'extension-name = Clock\n' > '$FOLDER/locales/en/clock.ftl'"
}

asks_every_time() {
  developer_tools true
  refused "aren't allowed" copy
  refused "aren't allowed" allow
  [[ -e "$UNREVIEWED/$ID" || -e "$UNREVIEWED/.folders.json" ]] && fail "something was recorded without authentication"
  pass "Settings without authentication is refused"
}

copies_beyond_reach() {
  printf 'polkit.addRule(function (action, subject) {\n  if (action.id == "com.lantharos.packages.unreviewed-extensions" && subject.user == "mara") return polkit.Result.YES;\n});\n' > "$RULE"
  authorized || fail "polkit didn't take the check's rule"
  copy > /dev/null || fail "an authenticated copy from Settings was refused: $(copy 2>&1)"
  for file in extension.toml extension.js locales/en/clock.ftl; do
    cmp -s "$FOLDER/$file" "$UNREVIEWED/$ID/$file" || fail "$file wasn't copied as it was"
    [[ "$(stat -c '%U %a' "$UNREVIEWED/$ID/$file")" == "root 644" ]] || fail "$file is $(stat -c '%U %a' "$UNREVIEWED/$ID/$file")"
  done
  [[ "$(stat -c '%U %a' "$UNREVIEWED/$ID")" == "root 755" ]] || fail "the copy's folder is $(stat -c '%U %a' "$UNREVIEWED/$ID")"
  runuser -u mara -- sh -c "echo changed > '$UNREVIEWED/$ID/extension.js'" 2>/dev/null && fail "mara could change the copy"
  pass "a copy lands whole, owned by root, beyond the reach of the account's programs"
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
asks_every_time
copies_beyond_reach
records_the_folder
anyone_takes_it_back
pass "everything"
systemctl poweroff --no-block
