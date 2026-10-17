#!/usr/bin/env bash
set -euo pipefail

# shellcheck source-path=SCRIPTDIR
source "$(dirname "$0")/session/environment.sh"

usage() {
  cat <<'USAGE'
Usage: kestrel/tools/session.sh [MODE] [OPTIONS]

Modes:
  nested        Run Kestrel in a window on the current desktop (default).
  capture       Run the checks headless and save screenshots.
  performance   Measure startup and Start menu timings headless.
  frames        Measure frame times of animations and gestures headless.
  motion        Record every painted frame of animations headless.
  greeter       Run the login screen checks headless.
  setup         Run the first-run setup checks headless.
  scaling       Check the default scale of laptop panels and monitors headless.

Capture options:
  --only GROUPS   Run only these comma separated groups. An area such as
                  apps runs every group in it, apps:mailman runs one.
  --jobs N        Run up to N sessions side by side (default: one per four
                  processors, fewer when inotify instances run short).
                  --jobs 1 runs every group in one session.
  --list          List the groups and exit.

Environment:
  KESTREL_SESSION_DIR   Where session state goes (default: kestrel/run).
  KESTREL_CAPTURE_DIR   Where screenshots go (default: kestrel/run/screenshots).
  KESTREL_CAPTURE_SIZE  Size of the virtual monitor (default: 1440x900).
  KESTREL_CAPTURE_SECONDARY_SIZE  Adds a second virtual monitor.
  KESTREL_CAPTURE_SCHEME  Starts sessions light or dark (default: as on this desktop).
  KESTREL_CAPTURE_WALLPAPER  Image to use as the wallpaper in both schemes.
  KESTREL_DEV_APPS      Comma separated Luft apps to use from their own build.
  KESTREL_BUILD         Kestrel build to run (default: kestrel/build).
  KESTREL_COMPOSITOR    Mutter install to run on (default: kestrel/run/mutter-install).
  KESTREL_FRAMES_BASELINE  A saved frames report to compare against.
  KESTREL_FRAMES_ONLY   Comma separated words; measures only interactions named with one.
  KESTREL_MOTION_ONLY   Comma separated clip groups to record: surfaces, windows, board, gestures, reduced, snap.
USAGE
}

mode="${1:-nested}"
[[ $# -eq 0 ]] || shift
case "$mode" in
  -h | --help) usage; exit 0 ;;
  nested | performance | frames | motion | greeter)
    [[ $# -eq 0 ]] || { usage >&2; exit 2; }
    require_build
    build_helpers
    if [[ "$mode" == greeter ]]; then exec "$tools/session/greeter.sh"; fi
    exec "$tools/session/desktop.sh" "$mode"
    ;;
  capture) exec "$tools/session/capture.sh" "$@" ;;
  setup | scaling)
    [[ $# -eq 0 ]] || { usage >&2; exit 2; }
    require_build
    build_helpers
    exec "$tools/session/desktop.sh" "$mode"
    ;;
  *) usage >&2; exit 2 ;;
esac
