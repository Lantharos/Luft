# Luft

Luft is the workspace for the Kestrel desktop, its apps, and the Sushi boot stack.

| Directory | Purpose |
| --- | --- |
| `kestrel/engine` | GNOME Shell 51.0 fork using Kestrel’s local Mutter 51 build |
| `kestrel/compositor` | Mutter patch series, window corners, and window icons |
| `kestrel/ui` | Kestrel's TypeScript shell actors and build pipeline |
| `kestrel/passkeys` | Passkeys kept in Luft Keyring and confirmed through Kestrel, offered to every browser as a security key |
| `kestrel/openconnect` | Signs in to OpenConnect VPNs for Kestrel's VPN dialog |
| `apps/barometer` | Barometer system monitor and task manager |
| `apps/disks` | Disks, for drives, partitions, encryption, drive health, disk images and what's using space |
| `apps/draft` | Draft text and code editor |
| `apps/keys` | Keys, for your own keyboard layouts and input methods |
| `apps/magpie` | Magpie viewer for photos, videos, music and PDFs |
| `apps/mailman` | Mailman mail client for IMAP, SMTP and JMAP accounts |
| `apps/rover` | Rover file manager and file chooser portal backend |
| `apps/schelf` | Schelf app store for Flathub, Fedora and AppImages |
| `apps/settings` | System settings app |
| `apps/signin` | Network Sign-In, for Wi-Fi networks that ask you to sign in first |
| `apps/tern` | Tern terminal |
| `packages/ui` | Styles, window chrome, and controls shared by the apps |
| `packages/app` | Native window, accent, and D-Bus setup shared by the apps |
| `packages/software` | Apps, system updates, Flatpak, AppImages and offline updates shared by Schelf and Settings |
| `boot/sushi` | Sushi splash, initramfs integration, and SushiBoot, the boot menu Luft starts through |
| `security` | Device trust (Secure Boot signing, TPM disk unlock, device encryption) and USB protection while locked |
| `docs/screenshots` | Captures from an isolated virtual Kestrel monitor |

Kestrel has its own bottom panel, Start menu, quick settings, notification center and calendar, and power options. Those surfaces use compositor blur on shell actors and animated entry and exit. App windows are not blurred by Kestrel's UI effect. It runs its own session with its own session manager, settings service, keyring and portal backend, and its own login screen on greetd. What is left before it is a distributable desktop session is tracked in [Kestrel's roadmap](kestrel/README.md#work-before-a-luft-session).

## Build and capture Kestrel

The engine targets Mutter 51.0, which Kestrel builds itself from its pinned source and patches; the host compositor is not replaced. Install [Bun](https://bun.sh) and, on Fedora, the compositor's and engine's build dependencies plus the Rust toolchain for the settings service, keyring, login screen service and VPN helper:

```bash
sudo dnf builddep mutter
sudo dnf install meson ninja-build sassc gjs-devel gtk4-devel at-spi2-atk-devel gsettings-desktop-schemas-devel \
  json-glib-devel librsvg2-devel glycin-devel libxkbcommon-devel NetworkManager-libnm-devel libsecret-devel \
  pipewire-devel pulseaudio-libs-devel alsa-lib-devel gstreamer1-devel polkit-devel libxml2-devel \
  cargo pam-devel tpm2-tss-devel
```

Build output stays inside `kestrel/build`, `kestrel/run`, and the chosen installation prefix.

```bash
cd kestrel/ui
bun install --frozen-lockfile
bun run check
cd ../..
kestrel/compositor/build.sh
meson setup kestrel/build kestrel/engine -Dpkg_config_path="$PWD/kestrel/run/mutter-install/lib/pkgconfig" --prefix="$PWD/kestrel/install"
meson compile -C kestrel/build
```

For an existing build, rerun Meson setup with `--reconfigure --clearcache` and the same `pkg_config_path` before compiling.

To open a visible nested session for interactive testing:

```bash
kestrel/tools/session.sh nested
```

The session opens in Mutter Development Kit. Workspaces grow with open windows, keeping one empty workspace up to ten total. Super+1 through Super+9 selects a workspace and Super+0 selects the tenth; Super+scroll or scrolling over the panel moves between adjacent workspaces with a slide transition. Click inside it to test Kestrel; its launcher button opens Start, and Super opens it when the devkit has keyboard shortcuts captured. Closing the devkit window ends the nested session. The launcher copies the host wallpaper, interface preferences, keyboard layout, and favorite apps into an isolated configuration under `kestrel/run`. The session has its own D-Bus bus and notification history.

To capture the shell surfaces, keyboard search, and a test window:

```bash
kestrel/tools/session.sh capture
```

Captures use a 1440×900 virtual monitor by default. Set `KESTREL_CAPTURE_SIZE=1280x800` for another size, `KESTREL_CAPTURE_SECONDARY_SIZE=1280x720` to include a second display, or `KESTREL_CAPTURE_DIR` to choose the output directory. The output includes the panel, Start, search, quick settings, notification center, Start power options, available Quick Settings device selectors, a window, Start above a window, and a maximized window. A hover capture reads the rendered framebuffer without repainting the scene; a complete-redraw reference is saved under `kestrel/run/cache` for comparison. Context-menu captures cover Start and panel apps; the log checks keyboard opening, dismissal, isolated unpinning, surface stacking, and running-dot separation. Additional captures exercise real audio-selection and encrypted-volume password dialogs, live taskbar previews, and Alt-Tab. Session checks cover keyboard navigation, lock-mode visibility and shortcut blocking, modal dismissal, and Ctrl-Alt-Tab; with a second display, they also check context-menu placement. Authentication through polkit, and unlocking with a real password, still need a dedicated login session. The same command then runs the login screen checks described in the Kestrel README. The log also reports panel geometry, placeholder positions during opening, taskbar animation widths, caret blink states, Do Not Disturb pointer toggling and restoration, idle frame count after hover with search unfocused, and the maximized work area.

Run `kestrel/tools/session.sh performance` for the isolated startup memory, search, notification-burst, actor-reuse, and idle-paint workload. See [Kestrel’s runtime scope](kestrel/README.md#runtime-scope) for retained services and removed UI.

Barometer, Disks, Draft, Keys, Magpie, Mailman, Rover, Schelf, Settings, Tern, Sushi and the security services keep their own build commands in their READMEs. The apps and packages form one Bun workspace, so run `bun install` at the repository root before working on either app. Rover's and Sushi's repository histories have been imported into this repository under their new paths.

## Source and licenses

Kestrel's engine was imported from the GNOME Shell 51.0 release and modified here. Its upstream authors and GPL license are retained in `kestrel/engine/COPYING`. Rover and Sushi carry their own MIT license notices. Third party vendored subprojects under the engine keep their upstream notices.
