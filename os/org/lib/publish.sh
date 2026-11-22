# shellcheck shell=bash

first_generation=101

make_keys() {
  local secrets="$1"
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
  printf 'such as an encrypted drive in a safe. The build server needs them as files, named by:\n\n'
  printf '  %-30s %s\n' LUFT_SECUREBOOT_KEY "$secrets/secure-boot.key" \
    "LUFT_PCR_KEY_$first_generation" "$secrets/pcr-$first_generation.key" \
    LUFT_ORG_SIGNING_KEY "$secrets/signing.private" LUFT_ORG_SIGNING_PASSPHRASE "$secrets/signing.passphrase"
}

published_label() {
  skopeo inspect "${retries[@]}" --format "{{index .Labels \"$2\"}}" "docker://$1" 2>/dev/null || true
}

needed() {
  local variant pilot built source
  source="$(source_hash)"
  for variant in "${variants[@]}"; do
    pilot="$image:$MAJOR-pilot$(suffix_of "$variant")"
    built="$(published_label "$pilot" com.lantharos.organization.base)"
    [[ "${built##*@}" == "${bases[$variant]}" ]] || { echo "$pilot isn't built on the Luft $name follows." >&2; return 0; }
    [[ "$(published_label "$pilot" com.lantharos.organization.source)" == "$source" ]] ||
      { echo "$folder changed since $pilot was built." >&2; return 0; }
  done
  echo "The pilot build is already built from this Luft and this $folder." >&2
  return 1
}

publish() {
  local variant suffix version
  [[ -n "${LUFT_ORG_SIGNING_KEY:-}" ]] || { echo "Set LUFT_ORG_SIGNING_KEY to the organization's signing key." >&2; exit 1; }
  [[ -n "${LUFT_ORG_SIGNING_PASSPHRASE:-}" ]] || { echo "Set LUFT_ORG_SIGNING_PASSPHRASE to the file with its passphrase." >&2; exit 1; }
  for variant in "${variants[@]}"; do
    suffix="$(suffix_of "$variant")"
    version="$(podman image inspect --format '{{index .Labels "org.opencontainers.image.version"}}' "$local_name:$FEDORA$suffix")"
    copy "$anything" "containers-storage:$local_name:$FEDORA$suffix" "docker://$image:$version$suffix" \
      --sign-by-sigstore-private-key "$LUFT_ORG_SIGNING_KEY" --sign-passphrase-file "$LUFT_ORG_SIGNING_PASSPHRASE"
    copy "$(trusting_organization)" "docker://$image:$version$suffix" "docker://$image:$MAJOR-pilot$suffix"
    echo "Published $image:$version$suffix as $image:$MAJOR-pilot$suffix" >&2
  done
}

promote() {
  local variant suffix
  for variant in "${variants[@]}"; do
    suffix="$(suffix_of "$variant")"
    copy "$(trusting_organization)" "docker://$image:$MAJOR-pilot$suffix" "docker://$image:$MAJOR$suffix"
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
