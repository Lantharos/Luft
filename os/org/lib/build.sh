# shellcheck shell=bash

local_name=localhost/organization
declare -A bases

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

followed_bases() {
  local variant suffix tag release
  if is_version "$follow"; then
    [[ "$(setting "$lock" version)" == "$follow" ]] ||
      { echo "luft.lock doesn't pin Luft $follow. Pin it with org.sh base $folder $follow." >&2; exit 1; }
    for variant in "${variants[@]}"; do
      bases[$variant]="$(setting "$lock" "$variant")"
      [[ -n "${bases[$variant]}" ]] || { echo "luft.lock has no $variant image. Pin it again with org.sh base $folder $follow." >&2; exit 1; }
    done
    return
  fi
  tag="$(tag_for "$follow")"
  for variant in "${variants[@]}"; do
    suffix="$(suffix_of "$variant")"
    release="$(release_of "$luft" "$tag$suffix" "$follow")"
    read -r bases[$variant] _ <<<"$release"
  done
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

pull_bases() {
  local variant suffix
  for variant in "${variants[@]}"; do
    suffix="$(suffix_of "$variant")"
    echo "Checking Luft's signature on $luft@${bases[$variant]}" >&2
    copy "$(trusting_luft "$luft")" "docker://$luft@${bases[$variant]}" "containers-storage:$local_name-luft:$FEDORA$suffix" ||
      { echo "Not building on $luft@${bases[$variant]}: Luft didn't sign it." >&2; exit 1; }
  done
}

build_variant() {
  local variant="$1" suffix base context
  suffix="$(suffix_of "$variant")"
  base="$luft@${bases[$variant]}"
  echo "Building $name's image on $base" >&2
  podman build --layers --build-arg "LUFT=$local_name-luft:$FEDORA$suffix" \
    --tag "$local_name-own:$FEDORA$suffix" --file "$folder/Containerfile" "$folder"
  context="$(keys_context)"
  with_policy "$local_name-own:$FEDORA$suffix" "$context"
  podman build --layers --build-arg "SYSTEM=$local_name-own:$FEDORA$suffix" --build-arg "NAME=$name" \
    --build-arg "BASE=$base" --build-arg "SOURCE=$(source_hash)" --build-arg "REVISION=$(revision)" \
    --tag "$local_name-system:$FEDORA$suffix" --file "$tools/image/Containerfile" "$context"
  kernel_of "$local_name-luft:$FEDORA$suffix"
  LUFT_IMAGE_NAME="$local_name" "$os/image/seal.sh" "$local_name-system:$FEDORA$suffix" "$local_name:$FEDORA$suffix"
  podman rmi "$local_name-own:$FEDORA$suffix" "$local_name-system:$FEDORA$suffix" >/dev/null
}

build() {
  local variant
  check_keys
  pull_bases
  for variant in "${variants[@]}"; do
    build_variant "$variant"
  done
}

move_base() {
  local which="$1" tag variant suffix version from release
  tag="$(tag_for "$which")"
  for variant in "${variants[@]}"; do
    suffix="$(suffix_of "$variant")"
    release="$(release_of "$luft" "$tag$suffix" "$which")"
    read -r bases[$variant] version <<<"$release"
  done
  from="$(published_label "$image:$MAJOR-pilot" org.opencontainers.image.version)"
  if [[ -n "$from" ]] && newer "$from" "$version"; then
    echo "$(title_of "$version") is older than $(title_of "$from"), which your pilot computers run, and computers never go back." >&2
    exit 1
  fi
  [[ -z "$from" ]] || printf '%s to %s\n\n' "$(title_of "$from")" "$(title_of "$version")"
  changes "$from" "$version"
  check_keys
  pull_bases
  set_follow "$which"
  for variant in "${variants[@]}"; do
    build_variant "$variant"
  done
  if is_version "$which"; then
    echo "$name is pinned to $(title_of "$version"). Commit organization.toml and luft.lock." >&2
  else
    echo "$name follows Luft's $which releases, now $(title_of "$version"). Commit organization.toml." >&2
  fi
}
