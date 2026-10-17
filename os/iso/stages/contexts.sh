#!/usr/bin/env bash
set -euo pipefail

contexts="$1"
layer='/overlay/[0-9a-f]{64}/diff'

printf '/.*\tsystem_u:object_r:container_ro_file_t:s0\n'
awk -v layer="$layer" '/^\// { $1 = ($1 == "/" ? layer : layer $1) } { print }' "$contexts"
