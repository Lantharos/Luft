# shellcheck shell=bash

luft_key="$os/image/files/usr/share/pki/containers/luft.pub"
luft_published="$(jq -r '.transports.docker | to_entries[]
  | select(any(.value[]; .keyPath == "/usr/share/pki/containers/luft.pub")) | .key' "$os/image/files/etc/containers/policy.json")"
retries=(--retry-times 3)

registries() {
  local repository
  mkdir -p "$work/registries.d"
  for repository in "$luft_published" "$luft" "$image"; do
    printf 'docker:\n  %s:\n    use-sigstore-attachments: true\n' "$repository" >"$work/registries.d/$(tr / _ <<<"$repository").yaml"
  done
}

trusting() {
  local repository="$1" key="$2" identity="$3" policy
  policy="$work/policy-$(sha256sum <<<"$*" | cut -c 1-16).json"
  jq -n --arg repository "$repository" --arg key "$key" --argjson identity "$identity" '{
    default: [{type: "reject"}],
    transports: {
      docker: {($repository): [{type: "sigstoreSigned", keyPath: $key, signedIdentity: $identity}]},
      "containers-storage": {"": [{type: "insecureAcceptAnything"}]}
    }
  }' >"$policy"
  echo "$policy"
}

trusting_luft() {
  local identity='{"type": "matchRepository"}'
  [[ "$1" == "$luft_published" ]] ||
    identity="$(jq -nc --arg prefix "$1" --arg signed "$luft_published" '{type: "remapIdentity", prefix: $prefix, signedPrefix: $signed}')"
  trusting "$1" "$luft_key" "$identity"
}

trusting_organization() {
  trusting "$image" "$signing_key" '{"type": "matchRepository"}'
}

copy() {
  local policy="$1" from="$2" to="$3"
  shift 3
  [[ "$from$to" == *containers-storage:* ]] || set -- --preserve-digests "$@"
  skopeo copy "${retries[@]}" --quiet --policy "$policy" --registries.d "$work/registries.d" "$@" "$from" "$to"
}

tags_of() {
  local list
  list="$work/tags-$(tr / _ <<<"$1")"
  [[ -f "$list" ]] || { skopeo list-tags "${retries[@]}" "docker://$1" || echo '{}'; } | jq -r '.Tags[]?' >"$list"
  cat "$list"
}

has_tag() {
  tags_of "$1" | grep -qxF "$2"
}

require_tag() {
  local repository="$1" tag="$2" which="$3"
  has_tag "$repository" "$tag" && return
  if [[ "$which" == stable && "$repository" == "$luft_published" ]]; then
    echo "Luft $MAJOR has no stable release yet, so there is none to follow. Follow nightly or a nightly version until there is." >&2
  elif [[ "$which" == stable ]]; then
    echo "$repository has no stable Luft $MAJOR: Luft hasn't released one yet, or it isn't mirrored. Follow nightly or a nightly version until it is." >&2
  elif [[ "$repository" == "$luft_published" ]]; then
    echo "Luft has no $tag." >&2
  else
    echo "$repository has no $tag. Mirror it first with org.sh mirror $folder $which." >&2
  fi
  exit 1
}

release_of() {
  require_tag "$1" "$2" "$3"
  skopeo inspect "${retries[@]}" --format '{{.Digest}} {{index .Labels "org.opencontainers.image.version"}}' "docker://$1:$2"
}
