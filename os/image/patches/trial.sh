#!/usr/bin/env bash
set -euo pipefail

package="$1"
repository="$2"
patches="$(cd "$(dirname "$0")/$package" && pwd)"
source="$(mktemp -d)"
trap 'rm -rf "$source"' EXIT

git clone --quiet --depth=1 "$repository" "$source"
total=0
applying=0
rows=""
for patch in "$patches"/*.patch; do
  total=$((total + 1))
  if git -C "$source" apply --check "$patch" 2>/dev/null; then
    applying=$((applying + 1))
    rows+="| ${patch##*/} | applies |"$'\n'
  else
    rows+="| ${patch##*/} | conflicts |"$'\n'
  fi
done

printf '## %s %s (%s)\n\n' "$package" "$(git -C "$source" symbolic-ref --short HEAD)" "$(git -C "$source" rev-parse --short=12 HEAD)"
printf '%s of %s patches apply.\n\n' "$applying" "$total"
printf '| Patch | Result |\n| --- | --- |\n%s\n' "$rows"
