# Luft

Luft is the workspace for the Kestrel desktop, its apps, and the Sushi boot stack.

| Directory | Purpose |
| --- | --- |
| `kestrel/engine` | GNOME Shell 51.0 fork using the installed Mutter 51 compositor library |
| `kestrel/ui` | Kestrel's TypeScript shell actors and build pipeline |
| `apps/rover` | Rover file manager and file chooser portal backend |
| `boot/sushi` | Sushi splash, initramfs integration, and UEFI boot tools |
| `docs/screenshots` | Captures from an isolated virtual Kestrel monitor |

Kestrel currently boots on a virtual Wayland monitor with its own bottom panel, Start menu, quick settings, notification center, and power menu. Those surfaces use compositor blur on shell actors and animated entry and exit. App windows are not blurred by Kestrel's UI effect. The shell still uses GNOME's session plumbing and several upstream JS services, so this is a working integration checkpoint rather than a distributable desktop session. The remaining work is tracked in [Kestrel's roadmap](kestrel/README.md).

## Build and capture Kestrel

The engine currently targets Mutter and GNOME Shell 51.0. Install the matching distribution build dependencies, Meson, Ninja, GJS, and Bun. On Fedora, `dnf builddep gnome-shell` supplies the engine dependencies. The build only writes inside `kestrel/build` and the chosen installation prefix.

```bash
cd kestrel/ui
bun install --frozen-lockfile
bun run check
cd ../..
meson setup kestrel/build kestrel/engine --prefix="$PWD/kestrel/install" -Dtests=false -Dextensions_tool=false -Dman=false
meson compile -C kestrel/build
```

To capture the current virtual desktop:

```bash
mkdir -p docs/screenshots
GSETTINGS_BACKEND=memory KESTREL_CAPTURE_DIR="$PWD/docs/screenshots" \
  KESTREL_WINDOW_SCRIPT="$PWD/kestrel/tools/window.js" \
  meson devenv -C kestrel/build \
  dbus-run-session "$PWD/kestrel/build/src/gnome-shell" \
  --headless --virtual-monitor 1280x800 \
  --automation-script "$PWD/kestrel/tools/capture.js"
```

This uses a private D-Bus session but can still load local notification history. The capture script does not save the notification view.

Rover and Sushi retain their own build commands in their READMEs. Their repository histories have been imported into this repository under their new paths.

## Source and licenses

Kestrel's engine was imported from the GNOME Shell 51.0 release and modified here. Its upstream authors and GPL license are retained in `kestrel/engine/COPYING`. Rover and Sushi carry their own MIT license notices. Third party vendored subprojects under the engine keep their upstream notices.
