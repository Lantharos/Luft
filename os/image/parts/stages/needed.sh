#!/usr/bin/env bash
set -euo pipefail

destdir="$1"
out="$2"
provided="$out/provided.txt"
needed="$out/needed.txt"

elf_files() {
  find "$destdir" -type f \( -perm -u+x -o -name '*.so' -o -name '*.so.*' \) -print0 |
    xargs -0 file -N --mime-type | awk -F': ' '$2 ~ /application\/x-(pie-)?(executable|sharedlib)/ {print $1}'
}

mkdir -p "$out"
find "$destdir" \( -type f -o -type l \) -name '*.so*' -printf '%f\n' | sort -u > "$provided"
mapfile -t files < <(elf_files)
: > "$needed"
((${#files[@]})) || exit 0
readelf -d "${files[@]}" 2>/dev/null |
  sed -n 's/.*(NEEDED).*\[\(.*\)\]/\1/p' | sort -u |
  { grep -vxF -f "$provided" || true; } > "$needed"
