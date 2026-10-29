# Schelf

Schelf ([apps/schelf](../../apps/schelf)) installs and updates apps. Besides its window and the `schelf` command, it does some work on its own after you sign in.

## Preinstalled apps and background updates

On Luft, `schelf --preinstall` runs at sign-in and adds each AppImage in `/usr/share/luft/preinstall`, such as Helium, to the account, once, under the app ID its file is named after, such as `net.imput.helium`, so a removed app stays removed. `schelf --update-apps` runs a few minutes after sign-in and every six hours after that, and updates every AppImage with a newer version. `schelf --integrate-apps` runs once the desktop is up after sign-in, whenever Schelf starts and after it installs or updates a Flatpak: it repairs AppImage launchers and turns on Chromium's own fix for touchpad scrolling on Wayland in Chromium-based Flatpaks whose launcher reads a flags file, such as Chrome, Chromium, Brave, Edge, Vivaldi and Discord. Chromium has that fix from version 154; Kestrel scrolls apps built on older Chromium at the fingers' pace itself.

## The AppImage sandbox

The same binary starts AppImages in their sandbox: menu entries run `schelf --sandbox APP-ID`, which `apps/schelf/sandbox` (`luft-sandbox`) implements. The first launch of an app mounts its image with `squashfuse`, starts `xdg-dbus-proxy`, opens a Wayland security context and starts bubblewrap; the sandbox's own server inside then starts the app, and later launches hand it their arguments over a socket in `$XDG_RUNTIME_DIR/luft-sandbox/APP-ID`, so all windows of an app share one sandbox. Its bus goes through a relay in the launcher that answers Flatpak's Spawn portal, which starts the nested sandboxes Chromium and Electron run their helpers in, through Zypak in `/usr/lib/zypak`. What the sandbox holds and why is in [The AppImage sandbox](../security.md#the-appimage-sandbox), and how apps declare what they need in [App sandbox](../app-sandbox.md). `schelf:full-access?APP-ID` opens an installed AppImage's or Flatpak's page with the full access confirmation, which the sandbox's notifications and Settings → Apps link to.
