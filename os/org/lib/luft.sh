# shellcheck shell=bash

attachments() {
  local repository="$1" from="$2" to="$3" digest="$4" tag
  for tag in "sha256-${digest#sha256:}" "sha256-${digest#sha256:}.sig"; do
    has_tag "$repository" "$tag" || continue
    copy "$anything" "$from:$tag" "$to:$tag" --all
  done
}

mirror() {
  local which="$1" tag variant suffix digest version release
  [[ "$luft" != "$luft_published" ]] ||
    { echo "$config takes Luft from $luft_published itself. Name your own registry as luft to mirror into it." >&2; exit 1; }
  tag="$(tag_for "$which")"
  for variant in "${variants[@]}"; do
    suffix="$(suffix_of "$variant")"
    release="$(release_of "$luft_published" "$tag$suffix" "$which")"
    read -r digest version <<<"$release"
    if has_tag "$luft" "$version$suffix" &&
      [[ "$(skopeo inspect "${retries[@]}" --format '{{.Digest}}' "docker://$luft:$version$suffix")" == "$digest" ]]; then
      echo "$luft already has Luft $version$suffix" >&2
    else
      copy "$(trusting_luft "$luft_published")" "docker://$luft_published@$digest" "docker://$luft:$version$suffix" ||
        { echo "Not mirroring Luft $version$suffix: Luft didn't sign it." >&2; exit 1; }
      attachments "$luft_published" "docker://$luft_published" "docker://$luft" "$digest"
      echo "Mirrored Luft $version$suffix into $luft" >&2
    fi
    [[ "$tag" == "$version" ]] || copy "$(trusting_luft "$luft")" "docker://$luft@$digest" "docker://$luft:$tag$suffix"
  done
}

export_to() {
  local drive="$1" which="$2" tag variant suffix digest version release
  tag="$(tag_for "$which")"
  mkdir -p "$drive"
  for variant in "${variants[@]}"; do
    suffix="$(suffix_of "$variant")"
    release="$(release_of "$luft_published" "$tag$suffix" "$which")"
    read -r digest version <<<"$release"
    copy "$(trusting_luft "$luft_published")" "docker://$luft_published@$digest" "oci:$drive:$version$suffix" --remove-signatures ||
      { echo "Not exporting Luft $version$suffix: Luft didn't sign it." >&2; exit 1; }
    attachments "$luft_published" "docker://$luft_published" "oci:$drive" "$digest"
    [[ "$tag" == "$version" ]] || copy "$anything" "oci:$drive:$version$suffix" "oci:$drive:$tag$suffix"
    echo "Wrote Luft $version$suffix to $drive" >&2
  done
}

import_from() {
  local drive="$1" signatures images entry
  [[ -f "$drive/index.json" ]] || { echo "$drive holds no Luft exported with org.sh export." >&2; exit 1; }
  signatures="$(drive_refs "$drive" '^sha256-')"
  images="$(drive_refs "$drive" '^(?!sha256-)')"
  for entry in $signatures; do
    copy "$anything" "oci:$drive:${entry#*=}" "docker://$luft:${entry#*=}" --all
  done
  for entry in $images; do
    copy "$anything" "oci:$drive:${entry#*=}" "docker://$luft@${entry%%=*}"
    copy "$(trusting_luft "$luft")" "docker://$luft@${entry%%=*}" "docker://$luft:${entry#*=}" ||
      { echo "${entry#*=} on $drive isn't signed by Luft, so $luft didn't get it." >&2; exit 1; }
    echo "Imported Luft ${entry#*=} into $luft" >&2
  done
}

drive_refs() {
  jq -r --arg refs "$2" '.manifests[] | {digest, ref: .annotations["org.opencontainers.image.ref.name"]}
    | select(.ref and (.ref | test($refs))) | "\(.digest)=\(.ref)"' "$1/index.json"
}

release_key() {
  [[ "$1" =~ ^$MAJOR\.([0-9]+)(-nightly\.([0-9]+))?$ ]]
  echo "${BASH_REMATCH[1]} ${BASH_REMATCH[3]:-999999}"
}

newer() {
  local a b
  read -ra a <<<"$(release_key "$1")"
  read -ra b <<<"$(release_key "$2")"
  ((a[0] > b[0] || (a[0] == b[0] && a[1] > b[1])))
}

title_of() {
  [[ "$1" =~ ^([0-9.]+)(-nightly\.([0-9]+))?$ ]]
  echo "Luft ${BASH_REMATCH[1]}${BASH_REMATCH[3]:+ Nightly ${BASH_REMATCH[3]}}"
}

changes() {
  local from="$1" to="$2" kind='^[0-9]+\.[0-9]+$' version notes
  [[ "$to" != *-nightly.* ]] || kind='-nightly\.[0-9]+$'
  tags_of "$luft" | grep -E "^$MAJOR\.[0-9]+(-nightly\.[0-9]+)?$" | grep -E -- "$kind" | sort -V |
    while read -r version; do
      [[ -z "$from" ]] || newer "$version" "$from" || continue
      newer "$version" "$to" && continue
      [[ -n "$from" || "$version" == "$to" ]] || continue
      notes="$(skopeo inspect "${retries[@]}" --format '{{index .Labels "com.lantharos.release-notes"}}' "docker://$luft:$version")"
      title_of "$version"
      jq -r '.[] | "  \(.title)", (.changes[] | "    \(.)")' <<<"${notes:-[]}"
      echo
    done
}
