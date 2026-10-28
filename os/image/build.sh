#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
image="$luft/os/image"
state="${LUFT_IMAGE_STATE:-$image/state}"
cache="${LUFT_IMAGE_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/luft-image}"
registry="${LUFT_PARTS:-localhost/luft-parts}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
fedora=45
signed_parts=(boot nvidia)
bootc_minimum=1.17.1-1.fc45
chunkah=quay.io/coreos/chunkah:v0.7.1
bun="docker.io/oven/bun:$(sed -n 's/^ARG BUN_VERSION=//p' "$image/parts/Containerfile")-distroless"
retries=(--retry 6 --retry-delay 20s)

# shellcheck source=os/image/throwaway-keys.sh
source "$image/throwaway-keys.sh"

usage() {
  cat <<'USAGE'
Usage: os/image/build.sh [luft] [luft-nvidia] [PODMAN BUILD OPTIONS...]
       os/image/build.sh plan [luft | luft-nvidia]
       os/image/build.sh part NAME [PODMAN BUILD OPTIONS...]
       os/image/build.sh stage NAME FOLDER
       os/image/build.sh base
       os/image/build.sh cef
       os/image/build.sh updates IMAGE

Builds the Luft images with Podman and seals them as localhost/luft:45 and
localhost/luft:45-nvidia, with localhost/luft-system:45(-nvidia) as the systems
before sealing (LUFT_IMAGE_NAME names them something other than localhost/luft).
The default system is split into layers by content with chunkah, so a layer
only changes when what's in it does, and the NVIDIA system is that system plus
the driver, so the two images share every layer below it. The kernel only
ships inside the startup image, so it moves out of the systems into
localhost/luft-kernel:45, where os/image/seal.sh takes it from.

The image is put together from parts: Kestrel, the boot services, the patched
bootc, libsecret and xdg-desktop-portal, the web runtime, Helium, the system
services, each app and NVIDIA's driver. Each part is an image named after a hash of everything it's built from,
the Fedora image's digest and the CEF build included, in LUFT_PARTS (default localhost/luft-parts),
so a build only makes the parts that changed. LUFT_REBUILD=1 makes every part again. Compilers keep their caches in
LUFT_IMAGE_CACHE (default ~/.cache/luft-image), shared by every checkout.

plan lists each part with its image and whether it's missing, part builds one
part, stage copies the files one part puts into the image to FOLDER, building
the part when it's missing, and base prints the Fedora image the parts are built on (LUFT_BASE, by
digest). cef prints the CEF build the web runtime ships, the newest one Sabine
would install (LUFT_CEF), so a new CEF build makes the runtime part again. updates lists the packages IMAGE adds to that Fedora image which have
updates, and exits with 100 when there are some, like dnf check-upgrade.

Signs with the keys named by LUFT_SECUREBOOT_KEY, LUFT_SECUREBOOT_CERT (PEM)
and LUFT_PCR_KEY, or with throwaway keys kept in ~/.local/state/luft/throwaway-keys
(LUFT_THROWAWAY_KEYS), shared by every checkout and the VMs, which Secure Boot
only accepts once they're enrolled.
USAGE
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
  echo "Signing with the throwaway keys in $(dirname "$LUFT_SECUREBOOT_KEY")." >&2
}

signed_by() {
  require_keys LUFT_SECUREBOOT_CERT
  openssl x509 -in "$LUFT_SECUREBOOT_CERT" -noout -fingerprint -sha256 | tr ' ' _
}

resolve_cef() {
  if [[ -n "${LUFT_CEF:-}" ]]; then
    echo "$LUFT_CEF"
    return
  fi
  podman run "${retries[@]}" --quiet --rm --security-opt label=disable --volume "$image/parts:/parts:ro" \
    "$bun" /parts/cef.ts
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
  sed -n 's|^sabine = { git = "https://github.com/Lantharos/Sabine", tag = "\([^"]*\)" }$|\1|p' "$luft/Cargo.toml"
}

is_signed() {
  [[ " ${signed_parts[*]} " == *" $1 "* ]]
}

part_names() {
  local app
  printf '%s\n' kestrel boot bootc libsecret portal
  [[ "$1" != luft-nvidia ]] || echo nvidia
  printf '%s\n' runtime helium services
  for app in "$luft"/apps/*/; do
    app="$(basename "$app")"
    [[ "$app" == meet ]] || echo "app-$app"
  done
}

pull_base() {
  podman image exists "$base" || podman pull "${retries[@]}" --quiet "$base" >/dev/null
}

base_version() {
  pull_base
  podman run --rm --network none "$base" rpm -q --qf '%{VERSION}-%{RELEASE}' "$1"
}

repo_version() {
  pull_base
  podman run --rm "$base" dnf repoquery --quiet --latest-limit 1 --arch "$(uname -m)" --qf '%{VERSION}-%{RELEASE}' "$1"
}

bootc_version() {
  { base_version bootc; echo; echo "$bootc_minimum"; } | sort -V | tail -1
}

part_target() {
  case "$1" in
    app-keys) echo "app APP=keys APP_SOURCES=keys-sources" ;;
    app-*) echo "app APP=${1#app-}" ;;
    bootc) echo "bootc BOOTC=$(bootc_version)" ;;
    libsecret) echo "libsecret LIBSECRET=$(base_version libsecret)" ;;
    portal) echo "portal PORTAL=$(repo_version xdg-desktop-portal)" ;;
    runtime) echo "runtime CEF=$cef" ;;
    boot | nvidia) echo "$1 SIGNED_BY=$(signed_by)" ;;
    *) echo "$1" ;;
  esac
}

working_tree() {
  local index
  index="$(mktemp)"
  cp "$(git -C "$luft" rev-parse --path-format=absolute --git-path index)" "$index"
  GIT_INDEX_FILE="$index" git -C "$luft" add --all
  GIT_INDEX_FILE="$index" git -C "$luft" write-tree
  rm "$index"
}

part_refs() {
  local name tree globals=(BASE="$base" SABINE="$(sabine_tag)")
  tree="$(mktemp)"
  git -C "$luft" ls-tree -r -t -z "$(working_tree)" >"$tree"
  for name in "$@"; do
    echo "$name $(part_target "$name")"
  done | podman run "${retries[@]}" --quiet --rm --interactive --network none --security-opt label=disable \
    --volume "$luft:/luft:ro" --volume "$tree:/tree:ro" \
    "$bun" /luft/os/image/parts/key.ts /luft/os/image/parts/Containerfile /tree /luft "${globals[@]}" |
    while read -r name key; do echo "$name $registry:$name-$key"; done
  rm "$tree"
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

build_system() {
  local target="$1" tag="$2"
  shift 2
  podman build "${retries[@]}" --layers --no-hosts --no-hostname --security-opt label=disable --target "$target" --file "$image/Containerfile" \
    --build-context "parts=$state/parts" --build-arg "BASE=$base" --build-arg "CEF=$cef" "$@" \
    "${podman_options[@]}" --tag "$tag" "$luft"
}

rechunk() {
  local system="$1" work id
  work="$(mktemp -d "${TMPDIR:-/var/tmp}/luft-rechunk.XXXXXX")"
  CHUNKAH_CONFIG_STR="$(podman image inspect "$system")" podman run "${retries[@]}" --rm --security-opt label=disable \
    --mount "type=image,source=$system,destination=/chunkah" --volume "$work:/out" --env CHUNKAH_CONFIG_STR \
    "$chunkah" build --rootfs /chunkah --max-layers 128 --prune /sysroot/ --prune /kernel \
    --label ostree.commit- --label ostree.final-diffid- --label rpmostree.inputhash- --output oci:/out/system
  id="$(podman pull --quiet "oci:$work/system")"
  podman tag "$id" "$system"
  podman unshare rm -rf "$work"
}

build_images() {
  local variant parts=luft system="$image_name-system:$fedora" refs name ref names
  [[ " $* " != *" luft-nvidia "* ]] || parts="luft-nvidia"
  require_keys LUFT_SECUREBOOT_KEY LUFT_SECUREBOOT_CERT LUFT_PCR_KEY
  mapfile -t names < <(part_names "$parts")
  refs="$(part_refs "${names[@]}")"
  while read -r name ref; do
    [[ -z "${LUFT_REBUILD:-}" ]] && part_exists "$ref" || echo "$name $ref"
  done <<<"$refs" | build_parts
  gather_parts <<<"$refs"
  build_system luft-kernel "$image_name-kernel:$fedora"
  build_system luft-split "$system"
  rechunk "$system"
  for variant; do
    case "$variant" in
      luft) "$image/seal.sh" "$system" "$image_name:$fedora" ;;
      luft-nvidia)
        build_system luft-nvidia "$system-nvidia" --build-arg "SYSTEM=$(podman image inspect --format '{{.Id}}' "$system")"
        "$image/seal.sh" "$system-nvidia" "$image_name:$fedora-nvidia"
        ;;
    esac
  done
}

stage_part() {
  local name ref container
  read -r name ref <<<"$(part_refs "$1")"
  part_exists "$ref" || build_part "$name" "$ref"
  podman image exists "$ref" || podman pull "${retries[@]}" --quiet "$ref" >/dev/null
  mkdir -p "$2"
  container="$(podman create "$ref" /part)"
  podman export "$container" | tar -x -p -C "$2" --strip-components=1 stage
  podman rm "$container" >/dev/null
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

updates() {
  local built="$1" packages='%{NAME}.%{ARCH} %{EPOCHNUM}:%{VERSION}-%{RELEASE}\n'
  pull_base
  podman pull "${retries[@]}" --quiet "$built" >/dev/null
  podman run --rm --network none "$base" rpm -qa --qf "$packages" |
    podman run --rm --interactive --security-opt label=disable --volume "$image/stages:/run/luft/stages:ro" "$built" \
      bash -c 'source /run/luft/stages/rpmfusion.sh
        cat >/tmp/base-packages
        mapfile -t added < <(rpm -qa --qf "$1" | grep -vxF -f /tmp/base-packages | grep -v "^gpg-pubkey\." | cut -d" " -f1)
        use_rpmfusion &>/dev/null
        dnf check-upgrade --quiet "${added[@]}"' updates "$packages"
}

[[ "${BASH_SOURCE[0]}" == "$0" ]] || return 0

case "${1:-luft}" in
  -h | --help) usage ;;
  base) resolve_base ;;
  cef) resolve_cef ;;
  plan) base="$(resolve_base)"; cef="$(resolve_cef)"; plan "${@:2}" ;;
  updates)
    (($# == 2)) || { usage >&2; exit 2; }
    base="$(resolve_base)"
    updates "$2"
    ;;
  part)
    (($# >= 2)) || { usage >&2; exit 2; }
    base="$(resolve_base)"
    [[ "$2" != runtime ]] || cef="$(resolve_cef)"
    podman_options=("${@:3}")
    ! is_signed "$2" || require_keys LUFT_SECUREBOOT_KEY LUFT_SECUREBOOT_CERT
    read -r name ref <<<"$(part_refs "$2")"
    build_part "$name" "$ref"
    ;;
  stage)
    (($# == 3)) || { usage >&2; exit 2; }
    base="$(resolve_base)"
    [[ "$2" != runtime ]] || cef="$(resolve_cef)"
    podman_options=()
    ! is_signed "$2" || require_keys LUFT_SECUREBOOT_KEY LUFT_SECUREBOOT_CERT
    stage_part "$2" "$3"
    ;;
  luft | luft-nvidia)
    base="$(resolve_base)"
    cef="$(resolve_cef)"
    variants=()
    while [[ "${1:-}" == luft || "${1:-}" == luft-nvidia ]]; do
      variants+=("$1")
      shift
    done
    podman_options=("$@")
    build_images "${variants[@]:-luft}"
    ;;
  *) usage >&2; exit 2 ;;
esac
