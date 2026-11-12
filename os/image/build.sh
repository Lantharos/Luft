#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
image="$luft/os/image"
state="${LUFT_IMAGE_STATE:-$image/state}"
cache="${LUFT_IMAGE_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/luft-image}"
registry="${LUFT_PARTS:-localhost/luft-parts}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
signed_parts=(boot nvidia)
retries=(--retry 6 --retry-delay 20s)
signer_issuer=https://token.actions.githubusercontent.com

# shellcheck source=os/versions.env
source "$luft/os/versions.env"
bootc_minimum="1.17.4-1.fc$FEDORA"

# shellcheck source=os/image/throwaway-keys.sh
source "$image/throwaway-keys.sh"

bun_arguments=(--build-arg "BUN_VERSION=$BUN_VERSION" --build-arg "BUN_SHA256=$BUN_SHA256")

usage() {
  cat <<USAGE
Usage: os/image/build.sh [luft] [luft-nvidia] [PODMAN BUILD OPTIONS...]
       os/image/build.sh plan [luft | luft-nvidia]
       os/image/build.sh part NAME [PODMAN BUILD OPTIONS...]
       os/image/build.sh stage NAME FOLDER
       os/image/build.sh base
       os/image/build.sh cef
       os/image/build.sh store
       os/image/build.sh updates IMAGE

Builds the Luft images with Podman and seals them as localhost/luft:$FEDORA and
localhost/luft:$FEDORA-nvidia, with localhost/luft-system:$FEDORA(-nvidia) as the systems
before sealing (LUFT_IMAGE_NAME names them something other than localhost/luft).
The default system is split into layers by content with chunkah, so a layer
only changes when what's in it does, and the NVIDIA system is that system plus
the driver, so the two images share every layer below it. The kernel only
ships inside the startup image, so it moves out of the systems into
localhost/luft-kernel:$FEDORA, where os/image/seal.sh takes it from.

The image is put together from parts: Kestrel, the boot services, the patched
bootc and xdg-desktop-portal, the web runtime, Helium, Zypak, the system
services, each app, the schelf.store releases it preinstalls and NVIDIA's driver. Each part is an image named after a hash of everything it's built from,
the Fedora image's digest and the CEF build included, in LUFT_PARTS (default localhost/luft-parts),
so a build only makes the parts that changed. LUFT_REBUILD=1 makes every part again. Parts in a registry are
signed without a key as they're pushed, as LUFT_PARTS_SIGNER (the workflow that builds them), and a part
that isn't signed by it counts as missing. Compilers keep their caches in
LUFT_IMAGE_CACHE (default ~/.cache/luft-image), shared by every checkout.

plan lists each part with its image and whether it's missing, part builds one
part, stage copies the files one part puts into the image to FOLDER, building
the part when it's missing, and base prints the Fedora image the parts are built on (LUFT_BASE, by
digest). cef prints the CEF build the web runtime ships, pinned with its checksum in
os/image/parts/cef.lock, which the CEF workflow moves to the newest one Sabine would install. store
prints the newest schelf.store release that's out, on any channel, of each app in
os/image/parts/store/apps.toml as ID=VERSION=PART (LUFT_STORE, or empty for none);
those apps ship from the store instead of being built into the image. updates lists the packages IMAGE adds to that Fedora image which have
updates, and exits with 100 when there are some, like dnf check-upgrade.

The image says Luft is still early when os/versions.env sets EARLY=1, and that a
stable version is out when LUFT_STABLE_RELEASED=1, which the nightly sets once
there's a v$MAJOR.N tag; both land in /usr/share/luft/release.

Signs with the keys named by LUFT_SECUREBOOT_KEY, LUFT_SECUREBOOT_CERT (PEM)
and, for the TPM policy, LUFT_PCR_KEY_1, LUFT_PCR_KEY_2 and so on, one for each
generation in os/versions.env that the image should unlock a disk for. Without
any of them it signs with throwaway keys kept in ~/.local/state/luft/throwaway-keys
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
  if [[ -n "${LUFT_SECUREBOOT_KEY:-}${LUFT_SECUREBOOT_CERT:-}$(pcr_keys)" ]]; then
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
  cut -d' ' -f1 "$image/parts/cef.lock"
}

resolve_store() {
  if [[ -n "${LUFT_STORE+set}" ]]; then
    printf '%s' "$LUFT_STORE"
    return
  fi
  podman run "${retries[@]}" --quiet --rm --security-opt label=disable --volume "$image/parts/store:/store:ro" \
    "$BUN_IMAGE" /store/releases.ts resolve
}

store_entries() {
  tr ' ' '\n' <<<"$store" | sed '/^$/d'
}

store_replaces() {
  store_entries | awk -F= 'NF == 3 {print $3}'
}

store_versions() {
  store_entries | cut -d= -f1,2 | paste -sd,
}

resolve_base() {
  local base="${LUFT_BASE:-quay.io/fedora/fedora-bootc:$FEDORA}" digest
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
  local components
  components="$(in_bun /luft/os/image/parts/components/parts.ts /tree /luft names | { grep -vxF -f <(store_replaces) || true; })"
  grep -v '^app-' <<<"$components"
  printf '%s\n' bootc portal
  [[ "$1" != luft-nvidia ]] || echo nvidia
  printf '%s\n' runtime helium cursors zypak
  [[ -z "$store" ]] || echo store
  grep '^app-' <<<"$components"
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

app_folder() {
  (cd "$luft" && compgen -G "apps/*/$1")
}

part_target() {
  case "$1" in
    app-*) echo "app APP=${1#app-} FOLDER=$(app_folder "${1#app-}")" ;;
    bootc) echo "bootc BOOTC=$(bootc_version)" ;;
    portal) echo "portal PORTAL=$(repo_version xdg-desktop-portal)" ;;
    runtime) echo "runtime CEF=$cef" ;;
    store) echo "store STORE=$(store_versions)" ;;
    boot | nvidia) echo "$1 SIGNED_BY=$(signed_by)" ;;
    *) echo "$1" ;;
  esac
}

snapshot_tree() {
  local index
  index="$(mktemp)"
  cp "$(git -C "$luft" rev-parse --path-format=absolute --git-path index)" "$index"
  GIT_INDEX_FILE="$index" git -C "$luft" add --all
  tree="$(GIT_INDEX_FILE="$index" git -C "$luft" write-tree)"
  rm "$index"
  tree_listing="$(mktemp)"
  trap 'rm -f "$tree_listing"' EXIT
  git -C "$luft" ls-tree -r -t -z "$tree" >"$tree_listing"
}

in_bun() {
  podman run "${retries[@]}" --quiet --rm --interactive --network none --security-opt label=disable \
    --volume "$luft:/luft:ro" --volume "$tree_listing:/tree:ro" "$BUN_IMAGE" "$@"
}

part_refs() {
  local name globals=(BASE="$base" SABINE="$(sabine_tag)" BUN_VERSION="$BUN_VERSION" BUN_SHA256="$BUN_SHA256")
  for name in "$@"; do
    echo "$name $(part_target "$name")"
  done | in_bun /luft/os/image/parts/key.ts /luft/os/image/parts/Containerfile /tree /luft "${globals[@]}" |
    while read -r name key; do echo "$name $registry:$name-$key"; done
}

part_sources() {
  local dir="$1" paths
  mapfile -t paths < <(in_bun /luft/os/image/parts/components/parts.ts /tree /luft sources "$2")
  ((${#paths[@]})) || return 0
  git -C "$luft" archive --format=tar "$tree" -- "${paths[@]}" | tar -x -C "$dir"
}

signed_digest() {
  local digest
  digest="$(skopeo inspect --retry-times 3 --format '{{.Digest}}' "docker://$1" 2>/dev/null)" || return
  cosign verify --certificate-identity "${LUFT_PARTS_SIGNER:?}" --certificate-oidc-issuer "$signer_issuer" \
    "${1%:*}@$digest" >/dev/null 2>&1 || return
  echo "$digest"
}

part_exists() {
  if [[ "$1" == localhost/* ]]; then
    podman image exists "$1"
  else
    signed_digest "$1" >/dev/null
  fi
}

publish_part() {
  local digest
  digest="$(mktemp)"
  podman push "${retries[@]}" --quiet --digestfile "$digest" "$1"
  cosign sign --yes "${1%:*}@$(<"$digest")"
  rm "$digest"
}

pull_part() {
  local digest
  podman image exists "$1" && return
  [[ "$1" != localhost/* ]] || { echo "$1 isn't built yet" >&2; return 1; }
  digest="$(signed_digest "$1")" || { echo "$1 isn't signed by $LUFT_PARTS_SIGNER" >&2; return 1; }
  podman pull "${retries[@]}" --quiet "${1%:*}@$digest" >/dev/null
  podman tag "${1%:*}@$digest" "$1"
}

cache_dirs() {
  mkdir -p "$cache"/{cargo,sccache,ccache,bun,sabine} "$@"
}

build_part() {
  local name="$1" ref="$2" target rest argument work sources status=0 options=() arguments=()
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
  sources="$(mktemp -d "${TMPDIR:-/var/tmp}/luft-sources.XXXXXX")"
  part_sources "$sources" "$name"
  podman build "${retries[@]}" --layers --security-opt label=disable --file "$image/parts/Containerfile" --target "$target" \
    --build-context "cache=$cache" --build-context "work=$cache/work/$work" --build-context "sources=$sources" \
    --build-arg "BASE=$base" --build-arg "SABINE=$(sabine_tag)" "${bun_arguments[@]}" "${options[@]}" "${podman_options[@]}" \
    --tag "$ref" "$luft" || status=$?
  rm -rf "$sources"
  ((status == 0)) || return "$status"
  [[ "$ref" == localhost/* ]] || publish_part "$ref"
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
    "${bun_arguments[@]}" "${podman_options[@]}" "$luft"
  if printf '%s\n' "${jobs[@]}" | grep -qE '(^| )(runtime|app-)'; then
    podman build "${retries[@]}" --layers --security-opt label=disable --file "$image/parts/Containerfile" --target sabine \
      --build-context "cache=$cache" --build-arg "BASE=$base" --build-arg "SABINE=$(sabine_tag)" \
      "${bun_arguments[@]}" "${podman_options[@]}" "$luft"
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

pull_parts() {
  local ref running=0 failed=0
  for ref; do
    if ((running >= 6)); then
      wait -n || failed=1
      running=$((running - 1))
    fi
    pull_part "$ref" &
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
  local parts="$state/parts" name ref i generation key
  local -a names=() refs=()
  while read -r name ref; do
    names+=("$name")
    refs+=("$ref")
  done
  pull_parts "${refs[@]}"
  for i in "${!names[@]}"; do
    extract_part "${names[$i]}" "${refs[$i]}"
  done
  [[ ! -d "$parts/apps" ]] || { chmod -R u+w "$parts/apps"; rm -rf "$parts/apps"; }
  mkdir -p "$parts/apps"
  for name in "${names[@]}"; do
    [[ "$name" != services && "$name" != store && "$name" != app-* ]] || cp -alf "$parts/$name/stage/." "$parts/apps/"
  done
  part_files needed.txt "${names[@]}" | sort -u | { grep -vxF -f <(part_files provided.txt "${names[@]}") || true; } |
    sed 's/$/()(64bit)/' > "$parts/needed.txt"
  rm -rf "$parts/keys"
  mkdir -p "$parts/keys/pcr-keys"
  openssl x509 -in "$LUFT_SECUREBOOT_CERT" -outform DER -out "$parts/keys/luft-secureboot.der"
  while read -r generation key; do
    openssl pkey -in "$key" -pubout -out "$parts/keys/pcr-keys/$generation.pem"
    echo "$generation" > "$parts/keys/pcr-keys/current"
  done < <(pcr_keys)
}

build_system() {
  local target="$1" tag="$2"
  shift 2
  podman build "${retries[@]}" --layers --no-hosts --no-hostname --security-opt label=disable --target "$target" --file "$image/Containerfile" \
    --build-context "parts=$state/parts" --build-arg "BASE=$base" --build-arg "MAJOR=$MAJOR" --build-arg "CEF=$cef" \
    --build-arg "STORE=$store" --build-arg "EARLY=${EARLY:-}" --build-arg "STABLE_RELEASED=${LUFT_STABLE_RELEASED:-}" "$@" \
    "${podman_options[@]}" --tag "$tag" "$luft"
}

rechunk() {
  local system="$1" work id
  work="$(mktemp -d "${TMPDIR:-/var/tmp}/luft-rechunk.XXXXXX")"
  CHUNKAH_CONFIG_STR="$(podman image inspect "$system")" podman run "${retries[@]}" --rm --security-opt label=disable \
    --mount "type=image,source=$system,destination=/chunkah" --volume "$work:/out" --env CHUNKAH_CONFIG_STR \
    "$CHUNKAH_IMAGE" build --rootfs /chunkah --max-layers 128 --prune /sysroot/ --prune /kernel \
    --label ostree.commit- --label ostree.final-diffid- --label rpmostree.inputhash- --output oci:/out/system
  id="$(podman pull --quiet "oci:$work/system")"
  podman tag "$id" "$system"
  podman unshare rm -rf "$work"
}

build_images() {
  local variant parts=luft system="$image_name-system:$FEDORA" refs name ref names
  [[ " $* " != *" luft-nvidia "* ]] || parts="luft-nvidia"
  require_keys LUFT_SECUREBOOT_KEY LUFT_SECUREBOOT_CERT
  [[ -n "$(pcr_keys)" ]] || { echo "Set LUFT_PCR_KEY_1, or the key of another generation in os/versions.env." >&2; exit 1; }
  mapfile -t names < <(part_names "$parts")
  refs="$(part_refs "${names[@]}")"
  while read -r name ref; do
    [[ -z "${LUFT_REBUILD:-}" ]] && part_exists "$ref" || echo "$name $ref"
  done <<<"$refs" | build_parts
  gather_parts <<<"$refs"
  build_system luft-kernel "$image_name-kernel:$FEDORA" --build-arg "SYSTEM=$system"
  build_system luft-split "$system" --build-arg "SYSTEM=$system"
  rechunk "$system"
  for variant; do
    case "$variant" in
      luft) "$image/seal.sh" "$system" "$image_name:$FEDORA" ;;
      luft-nvidia)
        build_system luft-nvidia "$system-nvidia" --build-arg "SYSTEM=$(podman image inspect --format '{{.Id}}' "$system")"
        "$image/seal.sh" "$system-nvidia" "$image_name:$FEDORA-nvidia"
        ;;
    esac
  done
}

stage_part() {
  local name ref container
  read -r name ref <<<"$(part_refs "$1")"
  part_exists "$ref" || build_part "$name" "$ref"
  pull_part "$ref"
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
  store) resolve_store ;;
  plan) base="$(resolve_base)"; cef="$(resolve_cef)"; store="$(resolve_store)"; snapshot_tree; plan "${@:2}" ;;
  updates)
    (($# == 2)) || { usage >&2; exit 2; }
    base="$(resolve_base)"
    updates "$2"
    ;;
  part)
    (($# >= 2)) || { usage >&2; exit 2; }
    base="$(resolve_base)"
    [[ "$2" != runtime ]] || cef="$(resolve_cef)"
    [[ "$2" != store ]] || store="$(resolve_store)"
    podman_options=("${@:3}")
    ! is_signed "$2" || require_keys LUFT_SECUREBOOT_KEY LUFT_SECUREBOOT_CERT
    snapshot_tree
    read -r name ref <<<"$(part_refs "$2")"
    build_part "$name" "$ref"
    ;;
  stage)
    (($# == 3)) || { usage >&2; exit 2; }
    base="$(resolve_base)"
    [[ "$2" != runtime ]] || cef="$(resolve_cef)"
    [[ "$2" != store ]] || store="$(resolve_store)"
    podman_options=()
    ! is_signed "$2" || require_keys LUFT_SECUREBOOT_KEY LUFT_SECUREBOOT_CERT
    snapshot_tree
    stage_part "$2" "$3"
    ;;
  luft | luft-nvidia)
    base="$(resolve_base)"
    cef="$(resolve_cef)"
    store="$(resolve_store)"
    variants=()
    while [[ "${1:-}" == luft || "${1:-}" == luft-nvidia ]]; do
      variants+=("$1")
      shift
    done
    podman_options=("$@")
    snapshot_tree
    build_images "${variants[@]:-luft}"
    ;;
  *) usage >&2; exit 2 ;;
esac
