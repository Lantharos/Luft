# Schelf

Schelf ([apps/schelf](../../apps/schelf)) installs and updates apps. Besides its window and the `schelf` command, it does some work on its own after you sign in.

## Preinstalled apps and background updates

On Luft, `schelf --preinstall` runs at sign-in and adds each AppImage in `/usr/share/luft/preinstall`, such as Helium, to the account, once, so a removed app stays removed. `schelf --update-apps` runs a few minutes after sign-in and every six hours after that, and updates every AppImage with a newer version. `schelf --integrate-apps` runs once the desktop is up after sign-in, whenever Schelf starts and after it installs or updates a Flatpak: it repairs AppImage launchers and turns on Chromium's own fix for touchpad scrolling on Wayland in Chromium-based Flatpaks whose launcher reads a flags file, such as Chrome, Chromium, Brave, Edge, Vivaldi and Discord. Chromium has that fix from version 154; Kestrel scrolls apps built on older Chromium at the fingers' pace itself.
