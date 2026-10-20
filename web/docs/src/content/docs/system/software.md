---
title: Installing software
description: Flatpak apps, AppImages, command-line tools in a Toolbox container, and system packages for services.
sidebar:
  order: 3
---

Luft's system is a sealed image, so apps and tools live next to it, in your account, where updates to the system can't break them and they can't break the system. The few things that have to be part of the system, such as Tailscale or Docker's daemon, are added as system packages. [Schelf](/apps/schelf/) handles all of them.

| Kind | Where it goes | Updates |
| --- | --- | --- |
| Flatpak apps from Flathub | Your account | In Schelf, under Updates, or `schelf update` |
| AppImages | `~/Applications`, with a menu entry and icon | By themselves, a few minutes after you sign in and every six hours |
| Command-line tools from Fedora | A Toolbox container, with their commands in `~/.local/bin` | In Schelf, under Updates, or `schelf update` |
| System packages from Fedora | The system, for everyone on the computer | With Luft, in [Settings](/system/updates/) |

Apps and tools don't need an administrator's password, in Schelf or in the terminal. System packages do.

## Flatpak

Most desktop apps come from [Flathub](https://flathub.org). Schelf adds Flathub the first time you install something and installs apps for your account. App pages explain each app's permissions in plain words, and opening a `.flatpakref` file installs that app.

The `flatpak` command works too: `flatpak install --user flathub org.example.App`.

### Full access

Flatpak apps run in a sandbox: they only see the files and devices they ask for, can't read the clipboard while you're using another app, and can't control other apps' windows. A few apps need more than that to work well, such as password managers that fill and clear the clipboard or AI assistants that work with your files. For those, turn on **Full access** on the app's page in Schelf. With it, the app can:

- see and change all your files
- read the clipboard in the background
- control other apps' windows
- act like an app installed on the system, including use your devices and talk to other apps

Only give full access to apps you trust. Schelf asks you to confirm, then for an administrator's password, and the app gets its new access the next time it opens. Turning it off puts the app back in its sandbox as it shipped, which also undoes changes you made to its permissions with other tools, such as Flatseal.

AppImages, command-line tools and system packages don't run in a sandbox, so they have full access already.

## AppImages

Open an `.AppImage` file and Schelf offers to install it. It moves it into `~/Applications` and adds it to Start with its own icon, so it opens like any other app. AppImages you set up earlier with other tools, such as Gear Lever, are picked up too.

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

Some software only works as part of the system: services that start with the computer, such as Tailscale, Docker or libvirt, and udev rules for devices. These come from Fedora as system packages:

```sh
schelf install --system tailscale
schelf list --system
schelf remove --system tailscale
```

For virtual machines with [virt-manager](https://flathub.org/apps/org.virt_manager.virt-manager), add libvirt with its default network and `virsh`:

```sh
schelf install --system libvirt-daemon-kvm libvirt-daemon-config-network libvirt-client
```

Luft downloads the packages and what they need from Fedora, checks Fedora's signature on every one, and adds them to the system without changing Luft itself, so their services start right away and with every start after. Schelf lists them under Installed, System, where they can be removed too.

- **Services start by themselves.** Where Fedora has a say, such as starting Docker only when it's first used, that's what happens. Otherwise the services of the packages you asked for start with the computer, while those of packages that only came along stay off until something needs them. To keep one from starting, run `sudo systemctl mask` with its name.
- **Updates bring them along.** When an update of Luft downloads, the system packages are built again for it, with their newest versions, before you restart. The version before keeps its own copy, so going back to it brings its packages along. If an update starts before they're ready, they're built as soon as the computer is online.
- **Removing one leaves the system as it was.** Its services stop, and what it added goes: its settings in `/etc`, its data in `/var`, and the users and groups it made. Removing libvirt stops and deletes its virtual machines, and removing Docker its images and containers. A service can still leave something it made on its own in a place nobody could tell was its, such as the empty `/etc/cni` Docker's containerd makes, and network changes such as Docker's bridge last until the next restart.
- **The list is yours.** `/var/lib/luft/system-packages/packages` lists the packages you asked for, one per line.

Some packages can't be system packages, and Schelf says why:

- **Drivers.** With Secure Boot, the kernel only loads drivers signed with a key the computer trusts, and they can't be signed on the computer. NVIDIA's driver comes with Luft's [NVIDIA image](/system/nvidia/).
- **SELinux policy.** Changing the security policy on the computer would keep Luft's own policy from being updated. Luft carries the policies common services need, such as swtpm's for the virtual TPMs of libvirt's machines.
- **Packages that would replace part of Luft**, such as a newer version of a library the system has. These work again after the next update of Luft.

Everything else that needs the system to be changed, such as files in `/boot` or the startup image, stays out too.

## In the terminal

The `schelf` command, or `sch` for short, does the same as the app:

| Command | Does |
| --- | --- |
| `schelf install ripgrep` | Installs an app or a tool, or several at once (`schelf add` works too) |
| `schelf install ./app.AppImage` | Installs a `.rpm`, `.AppImage`, `.flatpakref` or `.flatpakrepo` file |
| `schelf remove ripgrep` | Removes something you installed |
| `schelf search image editor` | Looks on Flathub and in Fedora at once, and through your AppImages |
| `schelf update` | Updates apps, AppImages and tools. Luft itself updates in [Settings](/system/updates/) |
| `schelf list` | Shows what you installed, by where it came from, and the system packages |
| `schelf install --system tailscale` | Adds a Fedora package to the system ([more](#system-packages)) |
| `schelf info gimp` | Shows the details from every place that has it |
| `schelf trust 1password` | Gives a Flatpak app [full access](#full-access), after warning you and asking first |
| `schelf untrust 1password` | Puts it back in its sandbox |

When a name is both on Flathub and in Fedora, a desktop app comes from Flathub and a command-line tool from Fedora. If that still leaves a choice, Schelf asks which one you mean. `--flathub` or `--fedora` picks the place yourself, `-y` goes ahead without asking, and `schelf --help` lists everything.

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

Removing and searching work the same way. Asking to upgrade the system points to Settings, and read-only commands such as `dnf info`, `dnf list` and `dnf provides` work normally.

## Fonts and cursors

- Fonts install from [Magpie](/apps/magpie/) into `~/.local/share/fonts`.
- Cursor themes install from Settings, under Appearance, **Get more cursors**.

## What doesn't work

`dnf install` doesn't change the system itself, by design: the system is the same signed image on every computer, so it can be checked at every start and updated or rolled back as a whole. That's why `dnf install` offers Schelf instead, and why system packages sit beside the image rather than inside it. Drivers and the rest of the system come with Luft's updates.
