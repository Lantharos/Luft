#!/usr/bin/env bash
set -euo pipefail

tools="$(cd "$(dirname "$0")" && pwd)"
os="$(cd "$tools/.." && pwd)"
# shellcheck source=os/versions.env
source "$os/versions.env"
luft_key="$os/image/files/usr/share/pki/containers/luft.pub"
local_name=localhost/organization
first_generation=101
retries=(--retry-times 3)

usage() {
  cat <<USAGE
Usage: os/org/org.sh keys FOLDER SECRETS
       os/org/org.sh needed FOLDER
       os/org/org.sh build FOLDER
       os/org/org.sh publish FOLDER
       os/org/org.sh promote FOLDER
       os/org/org.sh join FOLDER [pilot]

Builds an organization's own Luft from FOLDER, a copy of os/org/template:
Luft's image with the organization's Containerfile on top, its startup images
signed with the organization's Secure Boot and TPM policy keys, and the image
signed with its signing key.

keys makes the organization's keys: the public halves go into FOLDER/keys,
the private ones into SECRETS, which must not exist yet.
needed exits with 0 when the image should be built again, because Luft or
FOLDER changed since the pilot build that's published.
build makes $local_name:$FEDORA and, unless organization.toml says
nvidia = false, $local_name:$FEDORA-nvidia, with
LUFT_SECUREBOOT_KEY and LUFT_PCR_KEY_<generation> naming the private keys.
publish pushes them as VERSION and $MAJOR-pilot, signed with the key in
LUFT_ORG_SIGNING_KEY and the passphrase in LUFT_ORG_SIGNING_PASSPHRASE.
promote moves $MAJOR to the build $MAJOR-pilot names, for every computer.
join prints the description that trustctl organization join switches a
computer with, to the builds for everyone or to the pilot ones.
USAGE
}

setting() {
  sed -n "s/^$2 *= *\"\(.*\)\"\$/\1/p" "$1/organization.toml"
}

load() {
  folder="$(cd "$1" && pwd)"
  name="$(setting "$folder" name)"
  image="$(setting "$folder" image)"
  luft="$(setting "$folder" luft)"
  [[ -n "$name" && -n "$image" && -n "$luft" ]] ||
    { echo "$folder/organization.toml needs a name, an image and the luft it's built on." >&2; exit 1; }
  variants=(default)
  [[ "$(sed -n 's/^nvidia *= *\(true\|false\)$/\1/p' "$folder/organization.toml")" == false ]] || variants+=(nvidia)
  certificate="$folder/keys/secure-boot.crt"
  signing_key="$folder/keys/signing.pub"
}

work_folder() {
  work="$(mktemp -d "${TMPDIR:-/var/tmp}/luft-org.XXXXXX")"
  trap 'podman unshare rm -rf "$work"' EXIT
}

suffix_of() {
  [[ "$1" == default ]] || echo "-$1"
}

registries() {
  mkdir -p "$work/registries.d"
  printf 'docker:\n  %s:\n    use-sigstore-attachments: true\n  %s:\n    use-sigstore-attachments: true\n' \
    "${luft%:*}" "$image" >"$work/registries.d/luft.yaml"
}

trusting() {
  local repository="$1" key="$2"
  jq -n --arg repository "$repository" --arg key "$key" '{
    default: [{type: "reject"}],
    transports: {
      docker: {($repository): [{type: "sigstoreSigned", keyPath: $key, signedIdentity: {type: "matchRepository"}}]},
      "containers-storage": {"": [{type: "insecureAcceptAnything"}]}
    }
  }' >"$work/policy-$(basename "$key")"
  echo "$work/policy-$(basename "$key")"
}

make_keys() {
  local secrets="$2"
  load "$1"
  [[ ! -e "$secrets" ]] || { echo "$secrets already exists, and keys are only made once." >&2; exit 1; }
  [[ ! -e "$certificate" ]] || { echo "$folder already has keys." >&2; exit 1; }
  mkdir -p "$folder/keys/pcr"
  (umask 077 && mkdir -p "$secrets")
  openssl req -quiet -x509 -newkey rsa:2048 -nodes -days 7300 -subj "/CN=$name Secure Boot/O=$name/" \
    -keyout "$secrets/secure-boot.key" -out "$certificate"
  openssl genpkey -quiet -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$secrets/pcr-$first_generation.key"
  openssl pkey -in "$secrets/pcr-$first_generation.key" -pubout -out "$folder/keys/pcr/$first_generation.pem"
  openssl rand -base64 32 | tr -d '\n' >"$secrets/signing.passphrase"
  skopeo generate-sigstore-key --output-prefix "$secrets/signing" --passphrase-file "$secrets/signing.passphrase" >/dev/null
  mv "$secrets/signing.pub" "$signing_key"
  printf "Made %s's keys. Commit %s/keys, and keep %s somewhere offline,\n" "$name" "$folder" "$secrets"
  printf 'such as an encrypted drive in a safe. Your builds need them as secrets:\n\n'
  printf '  %-30s %s\n' LUFT_ORG_SECURE_BOOT_KEY "$secrets/secure-boot.key" \
    "LUFT_ORG_PCR_KEY_$first_generation" "$secrets/pcr-$first_generation.key" \
    LUFT_ORG_SIGNING_KEY "$secrets/signing.private" LUFT_ORG_SIGNING_PASSPHRASE "$secrets/signing.passphrase"
}

check_keys() {
  local public generation name
  [[ -n "${LUFT_SECUREBOOT_KEY:-}" ]] || { echo "Set LUFT_SECUREBOOT_KEY to the organization's Secure Boot key." >&2; exit 1; }
  cmp --silent <(openssl x509 -in "$certificate" -noout -pubkey) <(openssl pkey -in "$LUFT_SECUREBOOT_KEY" -pubout) ||
    { echo "LUFT_SECUREBOOT_KEY isn't the key of $certificate" >&2; exit 1; }
  export LUFT_SECUREBOOT_CERT="$certificate"
  for public in "$folder"/keys/pcr/*.pem; do
    generation="$(basename "$public" .pem)"
    name="LUFT_PCR_KEY_$generation"
    [[ -n "${!name:-}" ]] || { echo "Set $name to the organization's TPM policy key $generation." >&2; exit 1; }
    cmp --silent "$public" <(openssl pkey -in "${!name}" -pubout) ||
      { echo "$name isn't the key of $public" >&2; exit 1; }
  done
  for name in ${!LUFT_PCR_KEY_@}; do
    [[ -f "$folder/keys/pcr/${name#LUFT_PCR_KEY_}.pem" ]] || unset "$name"
  done
}

base_digest() {
  if [[ "$1" == localhost/* ]]; then
    podman image inspect --format '{{.Digest}}' "$1"
  else
    skopeo inspect "${retries[@]}" --format '{{.Digest}}' "docker://$1"
  fi
}

pull_luft() {
  local base="$1" local="$2" digest
  digest="$(base_digest "$base")"
  if [[ "$base" == localhost/* ]]; then
    podman tag "$base" "$local"
    echo "$digest"
    return
  fi
  skopeo copy "${retries[@]}" --quiet --policy "$(trusting "${base%:*}" "$luft_key")" --registries.d "$work/registries.d" \
    "docker://${base%:*}@$digest" "containers-storage:$local"
  echo "$digest"
}

keys_context() {
  local context="$work/keys" public generation
  mkdir -p "$context/pcr-keys"
  openssl x509 -in "$certificate" -outform DER -out "$context/organization.der"
  for public in "$folder"/keys/pcr/*.pem; do
    generation="$(basename "$public" .pem)"
    cp "$public" "$context/pcr-keys/"
  done
  echo "$generation" >"$context/pcr-keys/current"
  cp "$signing_key" "$context/organization.pub"
  printf 'docker:\n  %s:\n    use-sigstore-attachments: true\n' "$image" >"$context/organization.yaml"
  echo "$context"
}

with_policy() {
  podman run --rm --network none "$1" cat /etc/containers/policy.json |
    jq --arg repository "$image" '.transports.docker[$repository] = [{
      type: "sigstoreSigned",
      keyPath: "/usr/share/pki/containers/organization.pub",
      signedIdentity: {type: "matchRepository"}
    }]' >"$2/policy.json"
}

kernel_of() {
  local base="$1" container version
  version="$(podman run --rm --network none "$base" ls /usr/lib/modules)"
  container="$(podman create "$base")"
  podman cp "$container:/boot/EFI/Linux/luft.efi" "$work/luft.efi"
  podman rm "$container" >/dev/null
  mkdir -p "$work/kernel/$version"
  objcopy -O binary --only-section=.linux "$work/luft.efi" "$work/kernel/$version/vmlinuz"
  printf 'FROM scratch\nCOPY %s/vmlinuz /%s/vmlinuz\n' "$version" "$version" >"$work/kernel/Containerfile"
  podman build --quiet --tag "$local_name-kernel:$FEDORA" "$work/kernel" >/dev/null
}

revision() {
  git -C "$folder" rev-parse HEAD 2>/dev/null || true
}

build_variant() {
  local variant="$1" suffix base digest context
  suffix="$(suffix_of "$variant")"
  base="$luft$suffix"
  echo "Building $name's image on $base" >&2
  digest="$(pull_luft "$base" "$local_name-luft:$FEDORA$suffix")"
  podman build --layers --build-arg "LUFT=$local_name-luft:$FEDORA$suffix" \
    --tag "$local_name-own:$FEDORA$suffix" --file "$folder/Containerfile" "$folder"
  context="$(keys_context)"
  with_policy "$local_name-own:$FEDORA$suffix" "$context"
  podman build --layers --build-arg "SYSTEM=$local_name-own:$FEDORA$suffix" --build-arg "NAME=$name" \
    --build-arg "BASE=${base%:*}@$digest" --build-arg "REVISION=$(revision)" \
    --tag "$local_name-system:$FEDORA$suffix" --file "$tools/image/Containerfile" "$context"
  kernel_of "$local_name-luft:$FEDORA$suffix"
  LUFT_IMAGE_NAME="$local_name" "$os/image/seal.sh" "$local_name-system:$FEDORA$suffix" "$local_name:$FEDORA$suffix"
  podman rmi "$local_name-own:$FEDORA$suffix" "$local_name-system:$FEDORA$suffix" >/dev/null
}

label_of() {
  podman image inspect --format "{{index .Labels \"$2\"}}" "$1"
}

published_label() {
  skopeo inspect "${retries[@]}" --format "{{index .Labels \"$2\"}}" "docker://$1" 2>/dev/null
}

needed() {
  local pilot="$image:$MAJOR-pilot"
  [[ "$(published_label "$pilot" com.lantharos.organization.base)" == "${luft%:*}@$(base_digest "$luft")" ]] || return 0
  [[ "$(published_label "$pilot" com.lantharos.organization.revision)" == "$(revision)" ]] || return 0
  echo "$pilot is already built from $luft and this revision of $folder." >&2
  return 1
}

publish() {
  local variant suffix version
  [[ -n "${LUFT_ORG_SIGNING_KEY:-}" ]] || { echo "Set LUFT_ORG_SIGNING_KEY to the organization's signing key." >&2; exit 1; }
  [[ -n "${LUFT_ORG_SIGNING_PASSPHRASE:-}" ]] || { echo "Set LUFT_ORG_SIGNING_PASSPHRASE to the file with its passphrase." >&2; exit 1; }
  for variant in "${variants[@]}"; do
    suffix="$(suffix_of "$variant")"
    version="$(label_of "$local_name:$FEDORA$suffix" org.opencontainers.image.version)"
    skopeo copy "${retries[@]}" --quiet --registries.d "$work/registries.d" \
      --sign-by-sigstore-private-key "$LUFT_ORG_SIGNING_KEY" --sign-passphrase-file "$LUFT_ORG_SIGNING_PASSPHRASE" \
      "containers-storage:$local_name:$FEDORA$suffix" "docker://$image:$version$suffix"
    move_tag "$image:$version$suffix" "$image:$MAJOR-pilot$suffix"
    echo "Published $image:$version$suffix as $image:$MAJOR-pilot$suffix" >&2
  done
}

move_tag() {
  skopeo copy "${retries[@]}" --quiet --preserve-digests --registries.d "$work/registries.d" \
    --policy "$(trusting "$image" "$signing_key")" "docker://$1" "docker://$2"
}

promote() {
  local variant suffix
  for variant in "${variants[@]}"; do
    suffix="$(suffix_of "$variant")"
    move_tag "$image:$MAJOR-pilot$suffix" "$image:$MAJOR$suffix"
    echo "Every computer on $image:$MAJOR$suffix now gets the pilot build" >&2
  done
}

pem_value() {
  printf '"""\n%s\n"""\n' "$(cat "$1")"
}

join() {
  local tag="$MAJOR" public
  [[ "${1:-}" != pilot ]] || tag="$MAJOR-pilot"
  printf 'name = "%s"\nimage = "%s:%s"\n' "$name" "$image" "$tag"
  printf 'signing-key = '
  pem_value "$signing_key"
  printf 'secure-boot-certificate = '
  pem_value "$certificate"
  printf '\n[tpm-policy-keys]\n'
  for public in "$folder"/keys/pcr/*.pem; do
    printf '%s = ' "$(basename "$public" .pem)"
    pem_value "$public"
  done
}

case "${1:-}" in
  -h | --help) usage ;;
  keys) (($# == 3)) || { usage >&2; exit 2; }; make_keys "$2" "$3" ;;
  needed) (($# == 2)) || { usage >&2; exit 2; }; load "$2"; needed ;;
  build)
    (($# == 2)) || { usage >&2; exit 2; }
    load "$2"
    check_keys
    work_folder
    registries
    for variant in "${variants[@]}"; do
      build_variant "$variant"
    done
    ;;
  publish) (($# == 2)) || { usage >&2; exit 2; }; load "$2"; work_folder; registries; publish ;;
  promote) (($# == 2)) || { usage >&2; exit 2; }; load "$2"; work_folder; registries; promote ;;
  join) (($# >= 2)) || { usage >&2; exit 2; }; load "$2"; join "${3:-}" ;;
  *) usage >&2; exit 2 ;;
esac
