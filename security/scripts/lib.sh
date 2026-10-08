# shellcheck shell=bash

fail() {
  echo "$*" >&2
  exit 1
}

ask() {
  local answer
  read -r -p "$1 " answer
  printf '%s' "$answer"
}
