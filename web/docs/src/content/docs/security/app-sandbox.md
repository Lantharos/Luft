---
title: App sandbox
description: The walls around AppImages and Sabine apps from outside Luft, and how files and links cross them.
sidebar:
  order: 4
---

Apps from outside Luft run in a sandbox. Flatpaks get Flatpak's. AppImages, Sabine apps from schelf.store among them, get Luft's own, built from the same pieces and recognized everywhere as if it were a Flatpak.

| App | Runs |
| --- | --- |
| Luft's own apps, in the image | Outside a sandbox, like the rest of the system |
| Flatpaks | In Flatpak's sandbox |
| AppImages and Sabine apps | In the AppImage sandbox, with what they declare and you allow |
| Anything given full access | Outside a sandbox, as you |

Menu entries start an AppImage with `schelf --sandbox APP-ID`. The first launch sets the sandbox up, and later launches hand their arguments to it over a socket, so all of an app's windows share one sandbox. What an app may ask for, and how Schelf decides, is on [App permissions](/security/app-permissions/).

## Files

Nothing from the AppImage runs before the sandbox is up: `squashfuse` mounts the image read-only from outside, and bubblewrap shows it to the app at `/app`.

- The app sees `/usr` read-only and, from `/etc`, only what programs and their libraries read to work: name lookup, certificates, fonts, the time zone, graphics and sound settings. Who else has an account, which disks and printers exist and how the computer is set up stay outside. Its `/etc/passwd` holds just you and `nobody`.
- Its own folder, `~/.var/app/APP-ID`, appears at the same path inside and out, and the `XDG_*_HOME` variables point into it. Unless the app was given your home folder, that folder also stands in for home.
- It gets your Downloads folder unless you turned that off, the folders and drives it was given, a private `/tmp` shared by its windows, and fresh `/proc` and `/dev`. A drive it was given shows where it's mounted now; each one it wasn't asked about yet has an empty folder there that tells Luft when the app looks inside, as [App permissions](/security/app-permissions/#when-an-app-looks-for-a-drive) describes.
- Landlock holds the app to what bubblewrap mounted, read-only where the mount is, so a folder that reaches it some other way, such as through a file descriptor, stays closed.

## Files you hand an app

A file or folder you pick in a file dialog, drop on a window, paste, open with the app from Rover or send to it reaches the app whatever it declared. Nothing else outside its folders does.

The desktop portal and the sandbox's launcher hand such files over through the document portal, at a path below `$XDG_RUNTIME_DIR/doc` that the sandbox shows the app its own share of. GTK, Qt and Electron apps are set up to use the portal's file chooser.

A drag or a copy from Rover, Luft's other apps or Kestrel also offers the document portal's file transfer, as it does for a Flatpak. GTK 3 and 4, Qt 6.12 and later, and Chromium 151 and later look for it in a sandbox. Only when the app asks does the source register the files with the portal and hand the app a key, which works once and is traded for the files. Files you can change arrive writable. Toolkits that don't look for it get only paths, which they can't open.

Luft's own Sabine apps run outside a sandbox but hold themselves to their declaration, so the portals hand them real paths. Each path the app can't open itself is brought within reach through the document portal: `luft_app::portal::FileChooser` does this for file dialogs, Sabine for drops and for what `app.takeOpenUrls` returns, and `luft_app::Activation::paths_within_reach` for apps that read their command line. A folder always goes through the portal, since nothing shows whether the app may change it.

## Connections

The app reaches the session bus through `xdg-dbus-proxy`, which lets it reach the portals, notifications, the Secret Service, tray icons, the names it declared, and names under its own app ID. The sandbox's `.flatpak-info` lists those names as Flatpak's does, so the Secret portal leaves the app to the Secret Service and its passwords land in Luft Keyring.

Of Kestrel's services the proxy passes only the palette, `Play` on `com.lantharos.Kestrel.Sounds`, and the Send sheet. An app hands the sheet open files rather than paths, and Kestrel holds it to what a person could have asked for: only while one of the app's windows is in front, one sheet at a time, five a minute, at most 32 regular files and 2 GB. The app never learns which devices or apps the person could pick.

Wayland comes through a socket Kestrel tags with the app ID. The app also gets PipeWire and the graphics card.

An app with network access shares the computer's network namespace, where Linux keeps abstract sockets that no mount can hide, so Landlock keeps it from connecting to any abstract socket outside the sandbox, Xwayland's among them.

## X11 only when asked for

X11 apps can see each other's typing and windows, so X11 is only for apps that declared it or were switched to it in Schelf. Such an app gets the session's display as display 99, through a socket the sandbox binds, with the session's cookies rewritten for it, and shares the session's System V memory, which X11's shared-memory drawing needs.

Every other app finds a socket at display 99 that hangs up, which tells the sandbox it looked. If the app then closes within a few seconds, Luft says it only works with X11 and offers to review its access. An app that carries on with Wayland is left alone.

## Sound and cameras

Every sandboxed AppImage can play sound. Recording and cameras are permissions of their own.

PipeWire knows the app by its sandbox, read from the process that connects. A WirePlumber script, `find-schelf-access.lua`, holds it to its own streams: the app can't make links, and WirePlumber links nothing into its streams, from a microphone, a camera, the monitor of what the computer plays or another app, unless the permission store says `yes` under `devices` / `microphone` or `devices` / `camera`. Which of the two a link needs is read from what's being listened to, not from how the app describes its stream, and a link whose kind can't be told is refused. Turning a switch on starts a waiting recording; turning it off cuts a running one.

PulseAudio apps get a PulseAudio server inside the sandbox, which reaches PipeWire as the app, and never the session's socket, where a program can describe itself as it likes.

With the camera allowed, the app also finds `/dev/video*` at its next start, for apps that open cameras directly. Otherwise those are stand-ins. An app given every device is held to the same two switches.

An app without the permission that opens a recording or camera stream records silence, and Luft offers once while it runs to review its access.

## The kernel

The sandbox has no capabilities, its own process and host name namespaces and, unless it uses X11, its own IPC namespace. It can't make user namespaces or signal a process outside it. Its system call filter is Flatpak's: no kernel log, keyrings, `ptrace`, `perf_event_open`, memory placement calls, mounting or new namespaces, no sockets but local, internet and netlink ones, and no typing into the terminal it was started from. `clone3` and the newer mount calls answer as if the kernel lacked them, so programs fall back to calls the filter can inspect.

## Chromium and Electron

Chromium sandboxes its renderers with user namespaces, which the app's sandbox keeps from it. Flatpak solves this with its Spawn portal and Zypak, and Luft does the same: the image ships Zypak, the sandbox starts Chromium and Electron apps through it, and a relay on the app's bus answers `org.freedesktop.portal.Flatpak` while passing everything else to `xdg-dbus-proxy`.

`Spawn` starts the helper in a sandbox that joins the app's user and process namespaces, with the same system call filter and Landlock rules, without network, and with only `/usr` and the app's files unless the request asks for the display, sound or graphics card. A process started that way never gets more than the app has. Renderers then add Chromium's own filter, as in a Flatpak, and no app needs `--no-sandbox`.

Sabine apps installed for every user, below `/usr/lib/sabine`, share one Chromium, which on Luft means only the apps in the image. Every other Sabine app runs its own Chromium inside its sandbox, with the Sabine host and runtime the image ships, so it never shares a browser process with Luft's apps or another app.

## Opening files and links

Whatever an AppImage opens, a download, a link or a folder, goes to the desktop portal, which starts the right app in your own session. Schelf takes the place of `xdg-open` for every AppImage: inside the sandbox at `/usr/bin/xdg-open`, and first on the `PATH` of an app with full access. It hands files to `OpenFile` and links to `OpenURI` with the click's activation token. That keeps the opening app out of the sandbox, and away from the AppImage's own config folders.

The portal only opens files the sandbox shows at the same path as outside: Downloads, folders the app was given, and its own data, config, cache and state folders. That's how Mailman opens an attachment it saved in its cache in your PDF viewer.
