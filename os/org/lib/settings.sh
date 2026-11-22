# shellcheck shell=bash

setting() {
  [[ -f "$1" ]] || return 0
  sed -n "s/^$2 *= *\"\(.*\)\"\$/\1/p" "$1"
}

is_version() {
  [[ "$1" =~ ^$MAJOR\.[0-9]+(-nightly\.[0-9]+)?$ ]]
}

check_which() {
  [[ "$1" == stable || "$1" == nightly ]] || is_version "$1" ||
    { echo "Follow stable, nightly or a Luft $MAJOR version such as $MAJOR.2 or $MAJOR.3-nightly.4, not \"$1\"." >&2; exit 1; }
}

tag_for() {
  case "$1" in
    stable) echo "$MAJOR" ;;
    nightly) echo "$MAJOR-nightly" ;;
    *) echo "$1" ;;
  esac
}

load() {
  folder="$(cd "$1" && pwd)"
  config="$folder/organization.toml"
  lock="$folder/luft.lock"
  name="$(setting "$config" name)"
  image="$(setting "$config" image)"
  luft="$(setting "$config" luft)"
  follow="$(setting "$config" follow)"
  follow="${follow:-stable}"
  [[ -n "$name" && -n "$image" && -n "$luft" ]] ||
    { echo "$config needs a name, an image and the luft it's built on." >&2; exit 1; }
  [[ "${luft##*/}" != *[:@]* ]] || { echo "luft in $config names a repository, without a tag, since follow picks the version." >&2; exit 1; }
  check_which "$follow"
  variants=(default)
  [[ "$(sed -n 's/^nvidia *= *\(true\|false\)$/\1/p' "$config")" == false ]] || variants+=(nvidia)
  certificate="$folder/keys/secure-boot.crt"
  signing_key="$folder/keys/signing.pub"
}

suffix_of() {
  [[ "$1" == default ]] || echo "-$1"
}

work_folder() {
  work="$(mktemp -d "${TMPDIR:-/var/tmp}/luft-org.XXXXXX")"
  trap 'podman unshare rm -rf "$work"' EXIT
  registries
  echo '{"default": [{"type": "insecureAcceptAnything"}]}' >"$work/anything.json"
  anything="$work/anything.json"
}

set_follow() {
  if grep -q '^follow *=' "$config"; then
    sed -i "s/^follow *= *\".*\"\$/follow = \"$1\"/" "$config"
  else
    printf 'follow = "%s"\n' "$1" >>"$config"
  fi
  follow="$1"
  if is_version "$1"; then
    {
      printf 'version = "%s"\n' "$1"
      for variant in "${variants[@]}"; do
        printf '%s = "%s"\n' "$variant" "${bases[$variant]}"
      done
    } >"$lock"
  else
    rm -f "$lock"
  fi
}

source_hash() {
  local same=(--sort=name --mtime=@0 --owner=0 --group=0 --numeric-owner --mode=go-w) used=(organization.toml keys)
  [[ ! -f "$lock" ]] || used+=(luft.lock)
  {
    (cd "$folder" && shopt -s dotglob && tar "${same[@]}" --anchored --exclude-from=.containerignore -cf - -- *)
    tar -C "$folder" "${same[@]}" -cf - "${used[@]}"
  } | sha256sum | cut -d ' ' -f 1
}

revision() {
  git -C "$folder" rev-parse HEAD 2>/dev/null || true
}
