#!/usr/bin/env bash
set -euo pipefail

tools="$(cd "$(dirname "$0")" && pwd)"
os="$(cd "$tools/.." && pwd)"
# shellcheck source=os/versions.env
source "$os/versions.env"
for part in settings trust luft build publish; do
  # shellcheck source=/dev/null
  source "$tools/lib/$part.sh"
done

usage() {
  cat <<USAGE
Usage: org.sh keys FOLDER SECRETS
       org.sh mirror FOLDER [WHICH]
       org.sh export FOLDER DRIVE [WHICH]
       org.sh import FOLDER DRIVE
       org.sh base FOLDER WHICH
       org.sh update FOLDER
       org.sh build FOLDER
       org.sh publish FOLDER
       org.sh promote FOLDER
       org.sh join FOLDER [pilot]

Builds an organization's own Luft from FOLDER, a copy of the template folder:
Luft's image with the organization's Containerfile on top, its startup images
signed with the organization's Secure Boot and TPM policy keys, and the image
signed with its signing key. WHICH is stable, nightly or a version such as
$MAJOR.2, and defaults to what organization.toml follows.

keys makes the organization's keys: the public halves go into FOLDER/keys,
the private ones into SECRETS, which must not exist yet.
mirror copies a Luft release from $luft_published into the registry
organization.toml takes Luft from, with Luft's signatures, after checking them.
export writes it to the folder DRIVE instead, for networks without internet,
and import copies it from there into the registry, checking it again.
base moves FOLDER to WHICH: it shows what changed, builds on it and writes
organization.toml and, for a version, the digests it pins into luft.lock.
update builds and publishes when Luft or FOLDER changed since the pilot build.
build makes $local_name:$FEDORA and, unless organization.toml says
nvidia = false, $local_name:$FEDORA-nvidia, on Luft's images after checking
Luft's signature, with LUFT_SECUREBOOT_KEY and LUFT_PCR_KEY_<generation>
naming the private keys.
publish pushes them as VERSION and $MAJOR-pilot, signed with the key in
LUFT_ORG_SIGNING_KEY and the passphrase in LUFT_ORG_SIGNING_PASSPHRASE.
promote moves $MAJOR to the build $MAJOR-pilot names, for every computer.
join prints the description that trustctl organization join switches a
computer with, to the builds for everyone or to the pilot ones.
USAGE
}

arguments() {
  local least="$1" most="$2"
  shift 2
  (($# >= least && $# <= most)) || { usage >&2; exit 2; }
}

command="${1:-}"
shift || true
case "$command" in
  -h | --help) usage; exit ;;
  keys) arguments 2 2 "$@"; load "$1"; make_keys "$2"; exit ;;
  join) arguments 1 2 "$@"; load "$1"; join "${2:-}"; exit ;;
  mirror) arguments 1 2 "$@" ;;
  export) arguments 2 3 "$@" ;;
  base | import) arguments 2 2 "$@" ;;
  update | build | publish | promote) arguments 1 1 "$@" ;;
  *) usage >&2; exit 2 ;;
esac
load "$1"
work_folder
case "$command" in
  mirror) which="${2:-$follow}"; check_which "$which"; mirror "$which" ;;
  export) which="${3:-$follow}"; check_which "$which"; export_to "$(realpath -m "$2")" "$which" ;;
  import) import_from "$(realpath "$2")" ;;
  base) check_which "$2"; move_base "$2" ;;
  update) followed_bases; if needed; then build; publish; fi ;;
  build) followed_bases; build ;;
  publish) publish ;;
  promote) promote ;;
esac
