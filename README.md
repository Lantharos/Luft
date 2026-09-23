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

To open a visible nested session for interactive testing:

```bash
kestrel/tools/session.sh nested
```

The session opens in Mutter Development Kit. Click inside it to test Kestrel; its launcher button opens Start, and Super opens it when the devkit has keyboard shortcuts captured. Closing the devkit window ends the nested session. The launcher copies the host wallpaper, interface preferences, keyboard layout, and favorite apps into an isolated configuration under `kestrel/run`. The session has its own D-Bus bus and notification history.

To capture the shell surfaces, keyboard search, and a test window:

```bash
kestrel/tools/session.sh capture
```

Captures use a 1440×900 virtual monitor by default. Set `KESTREL_CAPTURE_SIZE=1280x800` for another size. The output includes the panel, Start, search, quick settings, notification center, power menu, available Quick Settings device selectors, a window, Start above a window, and a maximized window. A hover capture reads the rendered framebuffer without repainting the scene; a complete-redraw reference is saved under `kestrel/run/cache` for comparison. The log reports panel geometry, taskbar animation widths, caret blink states, idle frame count after hover with search unfocused, and the maximized work area.

Rover and Sushi retain their own build commands in their READMEs. Their repository histories have been imported into this repository under their new paths.

## Source and licenses

Kestrel's engine was imported from the GNOME Shell 51.0 release and modified here. Its upstream authors and GPL license are retained in `kestrel/engine/COPYING`. Rover and Sushi carry their own MIT license notices. Third party vendored subprojects under the engine keep their upstream notices.
