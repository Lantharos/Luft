---
title: Installing software
description: Flatpak apps, AppImages, and command-line tools in a Toolbox container.
sidebar:
  order: 3
---

Luft's system is a sealed image, so nothing is installed into it. Apps and tools live next to it instead, in your account, where updates to the system can't break them and they can't break the system. [Schelf](/apps/schelf/) handles all three kinds.

| Kind | Where it goes | Updates |
| --- | --- | --- |
| Flatpak apps from Flathub | Your account | In Schelf, under Updates |
| AppImages | `~/Applications`, with a menu entry and icon | By themselves, a few minutes after you sign in and every six hours |
| Command-line tools from Fedora | A Toolbox container, with their commands in `~/.local/bin` | In Schelf, under Updates |

None of these need an administrator's password.

## Flatpak

Most desktop apps come from [Flathub](https://flathub.org). Schelf adds Flathub the first time you install something and installs apps for your account. App pages explain each app's permissions in plain words, and opening a `.flatpakref` file installs that app.

The `flatpak` command works too: `flatpak install --user flathub org.example.App`.

## AppImages

Open an `.AppImage` file and Schelf offers to install it. It moves it into `~/Applications` and adds it to Start with its own icon, so it opens like any other app. AppImages you set up earlier with other tools, such as Gear Lever, are picked up too.

## Command-line tools

Command-line tools come from Fedora and go into a [Toolbox](https://containertoolbx.org) container called `fedora-toolbox-45`. Search for them in Schelf, or open an `.rpm` file. Each command gets a small launcher in `~/.local/bin`, so it runs in [Tern](/apps/tern/) like any other, without entering the container.

You can also work in the container yourself:

```sh
toolbox enter                 # a shell inside it, with your home folder
sudo dnf install gcc make     # inside the container
```

Toolbox containers share your home folder, so files are where you expect them.

## Fonts and cursors

- Fonts install from [Magpie](/apps/magpie/) into `~/.local/share/fonts`.
- Cursor themes install from Settings, under Appearance, **Get more cursors**.

## What doesn't work

`sudo dnf install` on the system itself doesn't work, by design: the system is the same signed image on every computer, so it can be checked at every start and updated or rolled back as a whole. Drivers and system parts come with Luft's updates.
