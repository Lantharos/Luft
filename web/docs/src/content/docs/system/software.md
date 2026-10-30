---
title: Installing software
description: Flatpak apps, AppImages, command-line tools in a Toolbox container, and system packages for services and vendors' apps.
sidebar:
  order: 3
---

Luft's system is a sealed image, so apps and tools live next to it, in your account, where updates to the system can't break them and they can't break the system. The few things that have to be part of the system, such as Tailscale, Docker's daemon or a vendor's app like 1Password, are added as system packages. [Schelf](/apps/schelf/) handles all of them.

| Kind | Where it goes | Updates |
| --- | --- | --- |
| Flatpak apps from Flathub | Your account | In Schelf, under Updates, or `schelf update` |
| AppImages | `~/Applications`, with a menu entry and icon | By themselves, a few minutes after you sign in and every six hours |
| Command-line tools from Fedora | A Toolbox container, with their commands in `~/.local/bin` | In Schelf, under Updates, or `schelf update` |
| System packages from Fedora and the software sources you add | The system, for everyone on the computer | With Luft, in [Settings](/system/updates/) |

Apps and tools don't need an administrator's password, in Schelf or in the terminal. System packages do.

## Flatpak

Most desktop apps come from [Flathub](https://flathub.org). Schelf adds Flathub the first time you install something and installs apps for your account. App pages explain each app's permissions in plain words, and opening a `.flatpakref` file installs that app.

The `flatpak` command works too: `flatpak install --user flathub org.example.App`.

### Full access

Flatpak apps and AppImages run in a sandbox: they only see their own files and the ones you pick for them, can't read the clipboard while you're using another app, can't control other apps' windows, and can't read what other apps saved in your keyring. A few apps need more than that to work well, such as password managers that fill and clear the clipboard or AI assistants that work with your files. For those, turn on **Full access** on the app's page in Schelf. With it, the app can:

- read, change and delete all your files
- use every device, such as USB drives, cameras and game controllers
- read what you copy, even while it's in the background
- read the passwords and keys saved in your keyring, other apps' too
- start any program as you, outside a sandbox

Only give full access to apps you trust. Schelf asks you to confirm, and the app gets its new access the next time it opens; if it's open, Schelf offers to restart it. Until then, opening it again, or a link it handles, goes to the copy that's running. Turning it off puts the app back in its sandbox. An AppImage keeps its settings and data in `~/.var/app/` followed by its ID either way, so nothing it saved goes missing when you switch. For a Flatpak that also undoes changes you made to its permissions with other tools, such as Flatseal.

Command-line tools and system packages don't run in a sandbox, so they have full access already. Settings → Apps lists what every sandboxed app was allowed, and takes any of it away.

## AppImages

Open an `.AppImage` file and Schelf offers to install it. It moves it into `~/Applications` and adds it to Start with its own icon, so it opens like any other app. AppImages you set up earlier with other tools, such as Gear Lever, are picked up too.

AppImages run in a sandbox, like Flatpak apps:

- They get the internet, the graphics card, sound, notifications and windows, and keep their settings and data in a folder of their own, `~/.var/app/` followed by the app's ID.
- Your files reach them through the file chooser: what you pick is shared with the app, nothing else. Files you open with the app from Rover are shared the same way.
- Secrets they save, such as an app's sign-in, are theirs. Other sandboxed apps can't read them without you confirming.
- In Settings → Apps you can give one a folder, or USB or serial devices, from the next time it opens.

An AppImage that closes right after it starts, or looks for a USB or serial device, may need more. Luft then tells you, and **Review access** opens Schelf, where you can give it full access. With full access it runs as it would without Luft, and keeps its data where it always did, outside its sandbox's folder, so it starts without the settings it had in its sandbox.

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

Some software only works as part of the system: services that start with the computer, such as Tailscale, Docker or libvirt, udev rules for devices, and apps their vendors only ship as packages for the system, such as 1Password. These are system packages, from Fedora or from [software sources you add](#software-sources):

```sh
schelf install --system tailscale
schelf list --system
schelf remove --system tailscale
```

For virtual machines with [virt-manager](https://flathub.org/apps/org.virt_manager.virt-manager), add libvirt with its default network and `virsh`:

```sh
schelf install --system libvirt-daemon-kvm libvirt-daemon-config-network libvirt-client
```

Luft downloads the packages and what they need, checks the signature on every one against Fedora's keys or those of the source it came from, and adds them to the system without changing Luft itself, so their services start right away and with every start after. Schelf lists them under Installed, System, where they can be removed too.

- **Services start by themselves.** Where Fedora has a say, such as starting Docker only when it's first used, that's what happens. Otherwise the services of the packages you asked for start with the computer, while those of packages that only came along stay off until something needs them. To keep one from starting, run `sudo systemctl mask` with its name.
- **Updates bring them along.** When an update of Luft downloads, the system packages are built again for it, with their newest versions, before you restart. The version before keeps its own copy, so going back to it brings its packages along. If an update starts before they're ready, they're built as soon as the computer is online. Packages that haven't changed aren't downloaded again.
- **Removing one leaves the system as it was.** Its services stop, and what it added goes: its settings in `/etc`, its data in `/var`, and the users and groups it made. Removing libvirt stops and deletes its virtual machines, and removing Docker its images and containers. A service can still leave something it made on its own in a place nobody could tell was its, such as the empty `/etc/cni` Docker's containerd makes, and network changes such as Docker's bridge last until the next restart.
- **Users, groups and helpers work.** Packages that make their own group, such as Docker's `docker` or 1Password's `onepassword`, get it on the computer with the same ID their files use, and helpers that need special permissions, such as 1Password's browser integration, keep them. Apps that install into `/opt` work like on Fedora.
- **The list is yours.** `/var/lib/luft/system-packages/packages` lists the packages you asked for, one per line.

Some packages can't be system packages, and Schelf says why:

- **Drivers.** With Secure Boot, the kernel only loads drivers signed with a key the computer trusts, and they can't be signed on the computer. NVIDIA's driver comes with Luft's [NVIDIA image](/system/nvidia/).
- **SELinux policy that replaces Luft's own.** Packages may add security policy modules, such as the ones Docker CE loads, and they're rebuilt with every update like the rest, but not ones that replace a module Luft has.
- **Packages that would replace part of Luft**, such as a newer version of a library the system has. These work again after the next update of Luft.

Everything else that needs the system to be changed, such as files in `/boot` or the startup image, stays out too.

### Software sources

Vendors that publish Linux apps often keep their own package repository, such as Docker, 1Password, Google, Microsoft or a [COPR](https://copr.fedorainfracloud.org) project. Add one, and its packages install with `--system` like Fedora's and update with Luft:

```sh
schelf repo add https://download.docker.com/linux/fedora/docker-ce.repo
schelf repo add copr:scottames/ghostty
schelf repo add 1password                  # also docker, google-chrome, vscode
schelf install --system docker-ce docker-ce-cli containerd.io
schelf repo list
schelf repo remove docker-ce
```

In Schelf, they're under Installed, System, **Software sources**.

Before a source is added, Schelf shows its name, its address and the key its packages are signed with, and asks you to confirm, then for an administrator's password. A package file that isn't signed by Fedora or by a source you added, and comes without a source of its own, asks you to confirm too, since nobody vouches for it. Only add sources you trust: their packages become part of the system, with full access to the computer. Luft keeps the key it showed you, so packages signed with any other key are refused, and a source has to sign its packages and be reached over HTTPS. That leaves out Stripe's repository, which doesn't sign its packages. The Stripe CLI works as a command-line tool instead: open its `.rpm` file, or run `schelf install ./stripe.rpm`.

Removing a source removes the packages you installed from it, with everything they added. Sources live in `/etc/yum.repos.d` and their keys in `/etc/pki/rpm-gpg`, so `dnf repolist` and `dnf info` see them too.

Opening a desktop app's `.rpm` file, such as 1Password's, Chrome's or ChatGPT's, installs it as a system package. When it comes with its vendor's repository, Schelf shows that repository and its key first, adds it, and installs the app from it, so it keeps getting updates. A desktop app's `.rpm` without a repository is kept and installed again with every update of Luft, but only changes when you install a newer file. `.rpm` files of command-line tools still go into the Toolbox container.

## In the terminal

The `schelf` command, or `sch` for short, does the same as the app:

| Command | Does |
| --- | --- |
| `schelf install ripgrep` | Installs an app or a tool, or several at once (`schelf add` works too) |
| `schelf install ./app.AppImage` | Installs a `.rpm`, `.deb`, `.AppImage`, `.flatpak`, `.flatpakref` or `.flatpakrepo` file |
| `schelf remove ripgrep` | Removes something you installed |
| `schelf search image editor` | Looks on Flathub, in Fedora and your software sources at once, and through your AppImages |
| `schelf update` | Updates apps, AppImages and tools. Luft itself updates in [Settings](/system/updates/) |
| `schelf list` | Shows what you installed, by where it came from, and the system packages |
| `schelf install --system tailscale` | Adds a package to the system, from Fedora or your software sources ([more](#system-packages)) |
| `schelf repo add copr:scottames/ghostty` | Adds a software source for system packages, after showing its key ([more](#software-sources)) |
| `schelf info gimp` | Shows the details from every place that has it |
| `schelf trust 1password` | Gives a Flatpak app or an AppImage [full access](#full-access), after warning you and asking first |
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

Removing and searching work the same way. `dnf copr enable` and `dnf config-manager addrepo --from-repofile` add a [software source](#software-sources) with Schelf. Asking to upgrade the system points to Settings, and read-only commands such as `dnf info`, `dnf list` and `dnf provides` work normally.

## App icons

Any installed app can have an icon of your own. Open the app in Schelf and choose **Change** next to **Icon** to pick a PNG or SVG image. Luft draws the monochrome version that the Tinted and Clear icon styles use from it, or you can choose **Change** next to **Symbolic icon** to give it an SVG of your own. **Reset** puts back the icons the app came with. Your icons are kept in `~/.local/share/luft/app-icons`, and app updates don't replace them.

## Fonts and cursors

- Fonts install from [Magpie](/apps/magpie/) into `~/.local/share/fonts`.
- Cursor themes install from Settings, under Appearance, **Get more cursors**.

## What doesn't work

`dnf install` doesn't change the system itself, by design: the system is the same signed image on every computer, so it can be checked at every start and updated or rolled back as a whole. That's why `dnf install` offers Schelf instead, and why system packages sit beside the image rather than inside it. Drivers and the rest of the system come with Luft's updates.
