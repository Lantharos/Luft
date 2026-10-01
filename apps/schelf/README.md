# Schelf

Schelf is where you get apps on Luft. It finds, installs, updates and removes apps from Flathub, from your system's software sources and as AppImages, all in one place. Updates to the system itself, such as the kernel, drivers and libraries, live in Settings instead, so Schelf only ever shows you apps. It is built with Sabine and SvelteKit and lives at `apps/schelf`; run the commands below from that directory unless noted otherwise.

## What it does

- Discover shows what's trending, popular and newly updated on Flathub, along with apps from Fedora's own repositories. Categories in the sidebar list every app in that area, from either source, and scroll smoothly however long the list gets
- Search looks through the apps you have, Flathub and Fedora at once
- Each app has its own page with screenshots, a description, what's new in the latest release, its size, version, license, developer and where it comes from. When the same app is available from both Flathub and Fedora, you can switch between them before installing
- Flatpak apps list what they can reach in plain words, such as your home folder, the internet or all devices, with anything that gives an app broad access shown first
- Installed lists every app on the computer, whichever way it got there, with its size and source. It can be filtered by kind, and apps can be opened, updated or removed from the list. Removing a system app tells you if other software goes with it
- Updates lists app updates with their versions and download size, and updates everything at once in as few steps as possible. The shared runtimes Flatpak apps are built on are listed separately as app platforms
- Downloads and installs show their progress on the app itself and at the bottom of the sidebar, can be cancelled, and wait their turn when several are started
- Catalog pages are kept on disk, so Discover, categories and app pages still work without a connection, and installed apps never need one

## AppImages

AppImages are treated like any other app. Open a downloaded `.AppImage` with Schelf, or use Add AppImage on the Installed page, and Schelf moves it into the Applications folder in your home folder, gives it a place in your app menu with its own icon, and makes it executable. Apps built with Electron are started without Chromium's sandbox, which otherwise refuses to start from an AppImage.

The Applications folder is the place the AppImage tools and documentation have long agreed on, it is easy to find and back up, and the files stay visible so you can still run or copy one by hand. The app menu entries and icons go where your desktop looks for them, in `~/.local/share/applications` and `~/.local/share/icons`.

AppImages that carry update information are kept up to date: Schelf reads the address from the file, checks whether the newest release differs from the one you have, downloads it, checks it against the published checksum and replaces the old file. AppImages you integrated earlier with another tool, including Gear Lever, show up in Installed as well and can be updated and removed the same way.

## Opening files

Schelf opens `.flatpakref`, `.flatpakrepo`, `.rpm` and `.AppImage` files. Each one gets a page explaining what it is before anything is installed. Flatpak apps and sources are added for your account. Packages from a file need an administrator's permission, since your software sources haven't checked them.

`schelf:updates` and `schelf:installed` open those pages directly, which is how Settings sends you to your app updates. `schelf:search?` followed by what to look for opens a search, which is how the desktop helps you find an app for a file nothing installed can open.

## Where apps go

Flathub apps are installed for your account, so installing one never asks for a password; Flathub is added for your account the first time it's needed. Apps from your system's software sources are installed through PackageKit, which asks for permission the way the system is set up to. Updates to apps installed for everyone on the computer still apply.

An app from the system's software sources counts as an app when its package puts a visible entry in the app menu. Everything else those sources provide is part of the system and is updated from Settings. Settings and Schelf use the same rule, so nothing shows up in both places and nothing is left out.

## Development

Schelf shares its controls, styles and window setup with the other Luft apps through `packages/ui` and `packages/app`, and its software handling with Settings through `packages/software`. Install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run dev              # the interface in a browser, with sample apps and Flathub's real catalog
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

In the browser, `?scheme=light` shows the light style, `?file=/path` shows the page for an opened file and `?page=schelf:updates` opens Updates.

## Install

```bash
sabine install --bundle .
```

This also makes Schelf the app for Flatpak references, Flatpak sources, RPM packages and AppImages.
