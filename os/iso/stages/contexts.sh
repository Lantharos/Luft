#!/usr/bin/env bash
# SELinux contexts that label each layer of a containers-storage tree as if it were the root.
# Files under /sysroot/ostree/repo/objects are hard links to system files, and an inode takes
# the label of whichever path mkfs.erofs meets first, so they get the system path's label too.
set -euo pipefail

store="$1"
contexts="$2"
layer='/overlay/[0-9a-f]{64}/diff'

prefixed_contexts() {
  printf '/.*\tsystem_u:object_r:container_ro_file_t:s0\n'
  awk -v layer="$layer" '/^\// { $1 = ($1 == "/" ? layer : layer $1) } { print }' "$contexts"
}

object_links() {
  find "$store"/overlay/*/diff -type f -links +1 -printf '%i\t%p\n' | sort -n -s -k1,1 | awk -F'\t' '
    function flush() { if (system_path != "") for (i = 1; i <= count; i++) print objects[i] "\t" system_path }
    $1 != inode { flush(); inode = $1; count = 0; system_path = "" }
    { path = $2; sub(/^.*\/overlay\/[0-9a-f]+\/diff/, "", path) }
    path ~ /^\/sysroot\/ostree\/repo\/objects\// { objects[++count] = substr($2, length(store) + 1); next }
    system_path == "" { system_path = path }
    END { flush() }
  ' store="$store"
}

object_contexts() {
  local links
  links="$(mktemp)"
  object_links >"$links"
  paste <(cut -f1 "$links" | sed 's/[.+]/\\&/g') \
    <(cut -f2 "$links" | xargs --delimiter='\n' --no-run-if-empty matchpathcon -n -m file -f "$contexts") |
    sed 's/\t/\t--\t/'
  rm "$links"
}

prefixed_contexts
object_contexts
