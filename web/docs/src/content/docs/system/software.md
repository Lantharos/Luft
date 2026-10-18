---
title: Installing software
description: Flatpak apps, AppImages, and command-line tools in a Toolbox container.
sidebar:
  order: 3
---

Luft's system is a sealed image, so nothing is installed into it. Apps and tools live next to it instead, in your account, where updates to the system can't break them and they can't break the system. [Schelf](/apps/schelf/) handles all three kinds.

| Kind | Where it goes | Updates |
| --- | --- | --- |
| Flatpak apps from Flathub | Your account | In Schelf, under Updates, or `schelf update` |
| AppImages | `~/Applications`, with a menu entry and icon | By themselves, a few minutes after you sign in and every six hours |
| Command-line tools from Fedora | A Toolbox container, with their commands in `~/.local/bin` | In Schelf, under Updates, or `schelf update` |

None of these need an administrator's password, in Schelf or in the terminal.

## Flatpak

Most desktop apps come from [Flathub](https://flathub.org). Schelf adds Flathub the first time you install something and installs apps for your account. App pages explain each app's permissions in plain words, and opening a `.flatpakref` file installs that app.

The `flatpak` command works too: `flatpak install --user flathub org.example.App`.

## AppImages

Open an `.AppImage` file and Schelf offers to install it. It moves it into `~/Applications` and adds it to Start with its own icon, so it opens like any other app. AppImages you set up earlier with other tools, such as Gear Lever, are picked up too.

## Command-line tools

Command-line tools come from Fedora and go into a [Toolbox](https://containertoolbx.org) container called `fedora-toolbox-45`. Search for them in Schelf, or open an `.rpm` file. Each command gets a small launcher in `~/.local/bin`, so it runs in [Tern](/apps/tern/) like any other, without entering the container.

Libraries and `-devel` packages go into the container too, so building against them happens inside it. You can work in the container yourself:

```sh
toolbox enter                 # a shell inside it, with your home folder
sudo dnf install gcc make     # inside the container
```

Toolbox containers share your home folder, so files are where you expect them.

## In the terminal

The `schelf` command, or `sch` for short, does the same as the app:

| Command | Does |
| --- | --- |
| `schelf install ripgrep` | Installs an app or a tool, or several at once |
| `schelf install ./app.AppImage` | Installs a `.rpm`, `.AppImage`, `.flatpakref` or `.flatpakrepo` file |
| `schelf remove ripgrep` | Removes something you installed |
| `schelf search image editor` | Looks on Flathub and in Fedora at once, and through your AppImages |
| `schelf update` | Updates apps, AppImages and tools. Luft itself updates in [Settings](/system/updates/) |
| `schelf list` | Shows what you installed, by where it came from |
| `schelf info gimp` | Shows the details from every place that has it |

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

Removing and searching work the same way. Asking to upgrade the system points to Settings, and read-only commands such as `dnf info`, `dnf list` and `dnf provides` work as they always do.

## Fonts and cursors

- Fonts install from [Magpie](/apps/magpie/) into `~/.local/share/fonts`.
- Cursor themes install from Settings, under Appearance, **Get more cursors**.

## What doesn't work

Nothing installs into the system itself, by design: the system is the same signed image on every computer, so it can be checked at every start and updated or rolled back as a whole. That's why `dnf install` offers Schelf instead. Drivers and system parts come with Luft's updates.
