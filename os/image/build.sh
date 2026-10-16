#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../.." && pwd)"
image="$luft/os/image"
state="${LUFT_IMAGE_STATE:-$image/state}"
cache="${LUFT_IMAGE_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/luft-image}"
registry="${LUFT_PARTS:-localhost/luft-parts}"
fedora=45
signed_parts=(boot nvidia)
retries=(--retry 6 --retry-delay 20s)

usage() {
  cat <<'USAGE'
Usage: os/image/build.sh [luft | luft-nvidia] [PODMAN BUILD OPTIONS...]
       os/image/build.sh plan [luft | luft-nvidia]
       os/image/build.sh part NAME [PODMAN BUILD OPTIONS...]
       os/image/build.sh base

Builds the Luft image with Podman and seals it as localhost/luft:45 or
localhost/luft:45-nvidia, with localhost/luft-system:45(-nvidia) as the system
before sealing.

The image is put together from parts: Kestrel, the boot services, the patched
bootc, the web runtime, Helium, the system services, each app and NVIDIA's
driver. Each part is an image named after a hash of everything it's built from,
in LUFT_PARTS (default localhost/luft-parts), so a build only makes the parts
that changed. LUFT_REBUILD=1 makes every part again. Compilers keep their caches in
LUFT_IMAGE_CACHE (default ~/.cache/luft-image), shared by every checkout.

plan lists each part with its image and whether it's missing, part builds one
part, and base prints the Fedora image the parts are built on (LUFT_BASE, by
digest).

Signs with the keys named by LUFT_SECUREBOOT_KEY, LUFT_SECUREBOOT_CERT (PEM)
and LUFT_PCR_KEY, or with throwaway keys kept in os/image/state/keys, which
Secure Boot only accepts once they're enrolled.
USAGE
}

throwaway_keys() {
  local keys="$state/keys"
  mkdir -p "$keys"
  chmod 700 "$keys"
  [[ -f "$keys/secureboot.key" ]] || openssl req -quiet -x509 -newkey rsa:2048 -nodes -days 3650 \
    -subj "/CN=Luft throwaway Secure Boot key/" -keyout "$keys/secureboot.key" -out "$keys/secureboot.crt"
  [[ -f "$keys/pcr.key" ]] || openssl genpkey -quiet -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$keys/pcr.key"
  export LUFT_SECUREBOOT_KEY="$keys/secureboot.key" LUFT_SECUREBOOT_CERT="$keys/secureboot.crt" LUFT_PCR_KEY="$keys/pcr.key"
  echo "Signing with the throwaway keys in $keys." >&2
}

keys_set() {
  local name
  for name; do
    [[ -n "${!name:-}" ]] || return 1
  done
}

require_keys() {
  keys_set "$@" && return
  if [[ -n "${LUFT_SECUREBOOT_KEY:-}${LUFT_SECUREBOOT_CERT:-}${LUFT_PCR_KEY:-}" ]]; then
    echo "Set $*, or none of the LUFT_ keys to sign with throwaway ones." >&2
    exit 1
  fi
  throwaway_keys
}

signed_by() {
  require_keys LUFT_SECUREBOOT_CERT
  openssl x509 -in "$LUFT_SECUREBOOT_CERT" -noout -fingerprint -sha256 | tr ' ' _
}

resolve_base() {
  local base="${LUFT_BASE:-quay.io/fedora/fedora-bootc:$fedora}" digest
  if [[ "$base" == *@sha256:* ]]; then
    echo "$base"
    return
  fi
  digest="$(skopeo inspect --retry-times 3 --format '{{.Digest}}' "docker://$base")"
  echo "${base%:*}@$digest"
}

sabine_tag() {
  sed -n 's|^sabine = { git = "https://github.com/Lantharos/Sabine", tag = "\([^"]*\)" }$|\1|p' "$luft/packages/app/Cargo.toml"
}

is_signed() {
  [[ " ${signed_parts[*]} " == *" $1 "* ]]
}

part_names() {
  local app
  printf '%s\n' kestrel boot bootc
  [[ "$1" != luft-nvidia ]] || echo nvidia
  printf '%s\n' runtime helium services
  for app in "$luft"/apps/*/; do
    app="$(basename "$app")"
    [[ "$app" == meet ]] || echo "app-$app"
  done
}

base_bootc() {
  podman image exists "$base" || podman pull "${retries[@]}" --quiet "$base" >/dev/null
  podman run --rm --network none "$base" rpm -q --qf '%{VERSION}-%{RELEASE}' bootc
}

part_target() {
  case "$1" in
    app-*) echo "app APP=${1#app-}" ;;
    bootc) echo "bootc BOOTC=$(base_bootc)" ;;
    boot | nvidia) echo "$1 SIGNED_BY=$(signed_by)" ;;
    *) echo "$1" ;;
  esac
}

part_refs() {
  local name globals=(BASE="$base" SABINE="$(sabine_tag)")
  for name in "$@"; do
    echo "$name $(part_target "$name")"
  done | (cd "$luft" && bun "$image/parts/key.ts" "$image/parts/Containerfile" "${globals[@]}") |
    while read -r name key; do echo "$name $registry:$name-$key"; done
}

part_exists() {
  if [[ "$1" == localhost/* ]]; then
    podman image exists "$1"
  else
    skopeo inspect --raw "docker://$1" >/dev/null 2>&1
  fi
}

cache_dirs() {
  mkdir -p "$cache"/{cargo,sccache,ccache,bun,sabine} "$@"
}

build_part() {
  local name="$1" ref="$2" target rest argument work options=() arguments=()
  read -r target rest <<<"$(part_target "$name")"
  read -ra arguments <<<"$rest"
  work="$name"
  [[ "$target" != app ]] || work=apps
  for argument in "${arguments[@]}"; do
    options+=(--build-arg "$argument")
  done
  if is_signed "$name"; then
    require_keys LUFT_SECUREBOOT_KEY LUFT_SECUREBOOT_CERT
    options+=(--secret "id=secureboot-key,src=$LUFT_SECUREBOOT_KEY" --secret "id=secureboot-cert,src=$LUFT_SECUREBOOT_CERT")
  fi
  [[ "$ref" == localhost/* ]] || options+=(--label org.opencontainers.image.source=https://github.com/Lantharos/Luft)
  cache_dirs "$cache/work/$work"
  podman build "${retries[@]}" --layers --security-opt label=disable --file "$image/parts/Containerfile" --target "$target" \
    --build-context "cache=$cache" --build-context "work=$cache/work/$work" \
    --build-arg "BASE=$base" --build-arg "SABINE=$(sabine_tag)" "${options[@]}" "${podman_options[@]}" \
    --tag "$ref" "$luft"
  [[ "$ref" == localhost/* ]] || podman push "${retries[@]}" --quiet "$ref"
}

build_in_turn() {
  local entry
  for entry; do
    build_part "${entry%%=*}" "${entry#*=}" 2>&1 | sed -u "s/^/[${entry%%=*}] /"
  done
}

build_parts() {
  local name ref job running=0 failed=0
  local -a jobs=() apps=() entries
  while read -r name ref; do
    if [[ "$name" == app-* ]]; then apps+=("$name=$ref"); else jobs+=("$name=$ref"); fi
  done
  ((${#apps[@]} == 0)) || jobs+=("${apps[*]}")
  ((${#jobs[@]})) || return 0
  cache_dirs
  podman build "${retries[@]}" --layers --file "$image/parts/Containerfile" --target builder --build-arg "BASE=$base" \
    "${podman_options[@]}" "$luft"
  if printf '%s\n' "${jobs[@]}" | grep -qE '(^| )(runtime|app-)'; then
    podman build "${retries[@]}" --layers --security-opt label=disable --file "$image/parts/Containerfile" --target sabine \
      --build-context "cache=$cache" --build-arg "BASE=$base" --build-arg "SABINE=$(sabine_tag)" \
      "${podman_options[@]}" "$luft"
  fi
  for job in "${jobs[@]}"; do
    if ((running >= 3)); then
      wait -n || failed=1
      running=$((running - 1))
    fi
    read -ra entries <<<"$job"
    build_in_turn "${entries[@]}" &
    running=$((running + 1))
  done
  while ((running > 0)); do
    wait -n || failed=1
    running=$((running - 1))
  done
  ((failed == 0))
}

extract_part() {
  local name="$1" ref="$2" dir="$state/parts/$1" stamp="$state/part-ids/$1" id container
  id="$(podman image inspect --format '{{.Id}}' "$ref")"
  [[ "$(cat "$stamp" 2>/dev/null)" != "$id" ]] || return 0
  [[ ! -d "$dir" ]] || { chmod -R u+w "$dir"; rm -rf "$dir"; }
  mkdir -p "$dir" "$(dirname "$stamp")"
  container="$(podman create "$ref" /part)"
  podman export "$container" | tar -x -p -C "$dir"
  podman rm "$container" >/dev/null
  echo "$id" > "$stamp"
}

part_files() {
  local file="$1" name
  shift
  for name; do
    [[ ! -f "$state/parts/$name/$file" ]] || cat "$state/parts/$name/$file"
  done
}

gather_parts() {
  local parts="$state/parts" name ref i
  local -a names=() refs=()
  while read -r name ref; do
    names+=("$name")
    refs+=("$ref")
  done
  for ref in "${refs[@]}"; do
    podman image exists "$ref" || echo "$ref"
  done | xargs --no-run-if-empty --max-procs 6 --max-args 1 podman pull "${retries[@]}" --quiet >/dev/null
  for i in "${!names[@]}"; do
    extract_part "${names[$i]}" "${refs[$i]}"
  done
  [[ ! -d "$parts/apps" ]] || { chmod -R u+w "$parts/apps"; rm -rf "$parts/apps"; }
  mkdir -p "$parts/apps"
  for name in "${names[@]}"; do
    [[ "$name" != services && "$name" != app-* ]] || cp -alf "$parts/$name/stage/." "$parts/apps/"
  done
  part_files needed.txt "${names[@]}" | sort -u | { grep -vxF -f <(part_files provided.txt "${names[@]}") || true; } |
    sed 's/$/()(64bit)/' > "$parts/needed.txt"
  mkdir -p "$parts/keys"
  openssl x509 -in "$LUFT_SECUREBOOT_CERT" -outform DER -out "$parts/keys/luft-secureboot.der"
  openssl pkey -in "$LUFT_PCR_KEY" -pubout -out "$parts/keys/luft-pcr-policy.pub.pem"
}

build_image() {
  local variant="$1" suffix="" system refs name ref names
  [[ "$variant" == luft ]] || suffix="-nvidia"
  require_keys LUFT_SECUREBOOT_KEY LUFT_SECUREBOOT_CERT LUFT_PCR_KEY
  mapfile -t names < <(part_names "$variant")
  refs="$(part_refs "${names[@]}")"
  while read -r name ref; do
    [[ -z "${LUFT_REBUILD:-}" ]] && part_exists "$ref" || echo "$name $ref"
  done <<<"$refs" | build_parts
  gather_parts <<<"$refs"
  system="localhost/luft-system:$fedora$suffix"
  podman build "${retries[@]}" --layers --target "$variant" --file "$image/Containerfile" \
    --build-context "parts=$state/parts" --build-arg "BASE=$base" \
    --build-arg "VERSION=$fedora.$(date -u +%Y%m%d).dev" "${podman_options[@]}" --tag "$system" "$luft"
  "$image/seal.sh" "$system" "localhost/luft:$fedora$suffix"
}

plan() {
  local name ref presence signing names
  require_keys LUFT_SECUREBOOT_CERT
  mapfile -t names < <(part_names "${1:-luft-nvidia}")
  while read -r name ref; do
    if [[ -z "${LUFT_REBUILD:-}" ]] && part_exists "$ref"; then presence=present; else presence=missing; fi
    if is_signed "$name"; then signing=signed; else signing=unsigned; fi
    printf '%s\t%s\t%s\t%s\n' "$name" "$ref" "$presence" "$signing"
  done < <(part_refs "${names[@]}")
}

case "${1:-luft}" in
  -h | --help) usage ;;
  base) resolve_base ;;
  plan) base="$(resolve_base)"; plan "${@:2}" ;;
  part)
    (($# >= 2)) || { usage >&2; exit 2; }
    base="$(resolve_base)"
    podman_options=("${@:3}")
    ! is_signed "$2" || require_keys LUFT_SECUREBOOT_KEY LUFT_SECUREBOOT_CERT
    read -r name ref <<<"$(part_refs "$2")"
    build_part "$name" "$ref"
    ;;
  luft | luft-nvidia)
    base="$(resolve_base)"
    podman_options=("${@:2}")
    build_image "${1:-luft}"
    ;;
  *) usage >&2; exit 2 ;;
esac
