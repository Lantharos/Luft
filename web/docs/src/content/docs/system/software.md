---
title: Installing software
description: Apps from schelf.store and Flathub, AppImages, command-line tools in a Toolbox container, and system packages for services and vendors' apps.
sidebar:
  order: 3
asks:
  - { ask: flatpak install, to: flatpak }
  - { ask: app can't see my files, to: full-access }
  - { ask: give app full access, to: full-access }
  - { ask: flatseal, to: full-access }
  - { ask: install appimage, to: appimages }
  - { ask: gear lever, to: appimages }
  - { ask: install deb, to: apps-from-deb-files }
  - { ask: ubuntu app, to: apps-from-deb-files }
  - { ask: install command line tool, to: command-line-tools }
  - { ask: toolbox, to: command-line-tools }
  - { ask: gcc, to: command-line-tools }
  - { ask: install rpm, to: command-line-tools, shared: true }
  - { ask: install an app, shared: true }
  - { ask: schelf command, to: in-the-terminal }
  - { ask: uninstall an app, to: in-the-terminal }
  - { ask: apt install, to: dnf-and-other-package-managers }
  - { ask: dnf install, to: dnf-and-other-package-managers, shared: true }
  - { ask: pacman, to: dnf-and-other-package-managers }
  - { ask: rename an app, to: app-names-and-icons }
  - { ask: change an app's icon, to: app-names-and-icons }
  - { ask: read only file system, to: what-doesnt-work }
  - { ask: why can't i change system files, to: what-doesnt-work }
---

Luft's system is a sealed image, so apps and tools live next to it, in your account, where updates to the system can't break them and they can't break the system. The few things that have to be part of the system, such as Tailscale, Docker's daemon or a vendor's app like 1Password, are added as system packages. [Schelf](/apps/schelf/) handles all of them.

| Kind | Where it goes | Updates |
| --- | --- | --- |
| Apps and extensions from schelf.store | Your account: AppImages in their sandbox, apps built with Sabine next to Luft's own, extensions on your desktop | By themselves, a few minutes after you sign in and every six hours |
| Flatpak apps from Flathub | Your account | In Schelf, under Updates, or `schelf update` |
| AppImages | Your account, with a menu entry and icon | By themselves, a few minutes after you sign in and every six hours |
| Command-line tools from Fedora | A Toolbox container, with their commands in `~/.local/bin` | In Schelf, under Updates, or `schelf update` |
| Fedora's desktop apps, and system packages from Fedora and the software sources you add | The system, for everyone on the computer | With Luft, in [Settings](/system/updates/) |

Apps and tools don't need an administrator's password, in Schelf or in the terminal. System packages do.

## Flatpak

Most desktop apps come from [Flathub](https://flathub.org), and Schelf lists them next to the apps published on [schelf.store](https://schelf.store). Schelf adds Flathub the first time you install something from it and installs apps for your account. App pages explain each app's permissions in plain words, and opening a `.flatpakref` file installs that app.

The `flatpak` command works too: `flatpak install --user flathub org.example.App`.

### Full access

Flatpak apps and AppImages run in a sandbox: they only see their own files and the ones you pick for them, can't read the clipboard while you're using another app, can't control other apps' windows, and can't read what other apps saved in your keyring. A few apps need more than that to work well, such as password managers that fill and clear the clipboard or AI assistants that work with your files. For those, turn on **Full access** on the app's page in Schelf. With it, the app can:

- read, change and delete all your files
- use every device, such as USB drives, cameras and game controllers
- read what you copy, even while it's in the background
- read the passwords and keys saved in your keyring, other apps' too
- start any program as you, outside a sandbox

Apps that keep their whole home in their own folder, such as Steam, get everything except your home folder, since seeing it would confuse them. Only give full access to apps you trust. Schelf asks you to confirm, and the app gets its new access the next time it opens; if it's open, Schelf offers to restart it. Until then, opening it again, or a link it handles, goes to the copy that's running. Turning it off puts the app back in its sandbox. An AppImage keeps its settings and data in `~/.var/app/` followed by its ID either way, so nothing it saved goes missing when you switch. For a Flatpak that also undoes changes you made to its permissions with other tools, such as Flatseal.

Command-line tools and system packages don't run in a sandbox, so they have full access already. Settings → Apps lists what every sandboxed app was allowed, and takes any of it away.

## AppImages

Open an `.AppImage` file and Schelf offers to install it. It keeps it out of your folders, in `~/.local/share/luft/appimages`, and adds it to Start with its own icon, so it opens like any other app. AppImages you set up earlier with other tools, such as Gear Lever, are picked up too.

AppImages run in a sandbox, like Flatpak apps:

- They get the internet, your Downloads folder, the graphics card, sound, notifications and windows, and keep their settings and data in a folder of their own, `~/.var/app/` followed by the app's ID.
- Your files reach them through the file chooser: what you pick is shared with the app, nothing else. Files you open with the app from Rover, drag onto it or copy and paste into it are shared the same way, in apps made with GTK, Qt 6.12 or later, Chromium or Electron 41 or later.
- Secrets they save, such as an app's sign-in, are theirs. Other sandboxed apps can't read them without you confirming.
- In Settings → Apps you can give one a folder, or USB or serial devices, or take away its Downloads folder or the internet, from the next time it opens.

An AppImage that closes right after it starts, or looks for a USB or serial device, may need more. Luft then tells you, and **Review access** opens Schelf, where you can give it full access. With full access it runs as it would without Luft, with the same settings and data it had in its sandbox.

## Apps from .deb files

Some apps only come as a `.deb` file, made for Debian and Ubuntu. Open one and Schelf first looks for the same app on Flathub: when it's there, **Install from Flathub** is the better way, sandboxed and keeping itself up to date.

Otherwise, **Install the .deb anyway** puts it in a [Toolbox](https://containertoolbx.org) container with Ubuntu 26.04, called `luft-ubuntu`, along with the Ubuntu software it needs. The first one downloads Ubuntu itself, a few hundred megabytes. The app gets a place in Start with its own icon and opens like any other, and links it opens go to your browser.

- It isn't sandboxed: it can read and change everything in your home folder, as it would on Ubuntu.
- Packages that add their maker's software source when installed, as many do, get updates in Schelf. Others stay at their version until you open a newer file.
- Apps that need drivers or system services of their own don't work this way.

## Command-line tools

Command-line tools come from Fedora and go into a [Toolbox](https://containertoolbx.org) container called `fedora-toolbox-45`. Search for them in Schelf, or open an `.rpm` file. Each command gets a small launcher in `~/.local/bin`, so it runs in [Tern](/apps/tern/) like any other, without entering the container.

Tools that already come with Luft, such as `fastfetch`, run on the system itself, so Schelf says they're installed instead of adding a second copy. If a later version of Luft starts including a tool you installed this way, its launcher steps aside for Luft's.

Libraries and `-devel` packages go into the container too, so building against them happens inside it. You can work in the container yourself:

```sh
toolbox enter                 # a shell inside it, with your home folder
sudo dnf install gcc make     # inside the container
```

Toolbox containers share your home folder, so files are where you expect them.

## System packages

Services that start with the computer, device rules and vendors' apps that only ship as system packages, such as Tailscale, Docker or 1Password, go into the system as [system packages](/system/system-packages/), from Fedora or a software source you add.

## In the terminal

The `schelf` command, or `sch` for short, does the same as the app:

| Command | Does |
| --- | --- |
| `schelf install ripgrep` | Installs an app or a tool, or several at once (`schelf add` works too) |
| `schelf install ./app.AppImage` | Installs a `.rpm`, `.deb`, `.AppImage`, `.flatpak`, `.flatpakref` or `.flatpakrepo` file |
| `schelf remove ripgrep` | Removes something you installed |
| `schelf search image editor` | Looks on schelf.store, Flathub, in Fedora and your software sources at once, and through your AppImages |
| `schelf update` | Updates apps, AppImages and tools. Luft itself updates in [Settings](/system/updates/) |
| `schelf list` | Shows what you installed, by where it came from, and the system packages |
| `schelf install --system tailscale` | Adds a package to the system, from Fedora or your software sources ([more](/system/system-packages/)) |
| `schelf repo add copr:scottames/ghostty` | Adds a software source for system packages, after showing its key ([more](/system/system-packages/#software-sources)) |
| `schelf info gimp` | Shows the details from every place that has it |
| `schelf trust 1password` | Gives a Flatpak app or an AppImage [full access](#full-access), after warning you and asking first |
| `schelf untrust 1password` | Puts it back in its sandbox |

A name schelf.store has comes from there. Otherwise, when it's both on Flathub and in Fedora, a desktop app comes from Flathub and a command-line tool from Fedora. If that still leaves a choice, Schelf asks which one you mean. `--store`, `--flathub` or `--fedora` picks the place yourself, `-y` goes ahead without asking, and `schelf --help` lists everything. Before an app from schelf.store installs, the command shows what it can use and asks.

While the Schelf app is open, the command hands its work to the app, so both show the same progress and the app's queue runs one thing at a time. Otherwise the command does the work itself, and waits if the app or another terminal is already changing your software.

When its output goes to another program instead of a terminal, `search` and `list` print one line per entry with the fields separated by tabs, and nothing is coloured. `NO_COLOR` turns colours off in a terminal too.

| Exit code | Means |
| --- | --- |
| 0 | Done, or nothing needed doing |
| 1 | Something couldn't be installed, removed or updated |
| 2 | The command was wrong, or Schelf needed an answer it couldn't ask for |
| 3 | Nothing by that name was found or installed |
| 4 | You said no when asked |
| 130 | Stopped with Ctrl+C |

### dnf and other package managers

Typing `dnf install`, `apt install`, `pacman -S` or `zypper in` asks whether to install it with Schelf instead, and does so if you agree:

```
$ dnf install ripgrep
Luft installs this with Schelf, into your account. Install ripgrep? [Y/n]
```

Removing and searching work the same way. `dnf copr enable` and `dnf config-manager addrepo --from-repofile` add a [software source](/system/system-packages/#software-sources) with Schelf. Asking to upgrade the system points to Settings, and read-only commands such as `dnf info`, `dnf list` and `dnf provides` work normally.

## App names and icons

Any installed app can have a name and an icon of your own. Open the app in Schelf and choose **Rename** next to **Name**; the new name shows in Start, search, the taskbar and the Luft apps, and an empty name brings back the app's own.

Choose **Change** next to **Icon** to pick a PNG or SVG image. Luft draws the monochrome version that the Tinted and Clear icon styles use from it, or you can choose **Change** next to **Symbolic icon** to give it an SVG of your own. **Reset** puts back the icons the app came with. App updates don't replace any of this: names are kept in `~/.local/share/luft/app-names`, icons in `~/.local/share/luft/app-icons` and symbolic icons in `~/.local/share/icons/hicolor/symbolic/apps`.

## Fonts and cursors

- Fonts install from [Magpie](/apps/magpie/) into `~/.local/share/fonts`.
- Cursor themes install from Settings, under Appearance, **Get more cursors**.

## What doesn't work

`dnf install` doesn't change the system itself, by design: the system is the same signed image on every computer, so it can be checked at every start and updated or rolled back as a whole. That's why `dnf install` offers Schelf instead, and why system packages sit beside the image rather than inside it. Drivers and the rest of the system come with Luft's updates.
