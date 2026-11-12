#!/bin/sh
while read -r line; do
  printf '%s %s\n' "$line" "$(ls /proc | grep -c '^[0-9]')"
done
