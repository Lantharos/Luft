---
title: App permissions
description: What an app declares, how Schelf decides what it gets, where permissions are kept, and how the store's catalog is trusted.
sidebar:
  order: 4.5
---

A sandbox is only as tight as what the app was given. Luft keeps every permission where no app can write it, gives an app only what a person agreed to, and installs only what schelf.store signed. The walls themselves are on [App sandbox](/security/app-sandbox/).

## What an app declares

A Sabine app says what it needs in `Sabine.toml`, in Flatpak's words:

```toml
[sandbox]
network = true
filesystems = ["xdg-documents", "xdg-download:ro"]
devices = ["usb"]
talk = ["org.mpris.MediaPlayer2.notes"]
x11 = false
microphone = true
camera = false
```

| Key | Default | Means |
| --- | --- | --- |
| `network` | `true` | It can go online |
| `filesystems` | none | Folders besides Downloads: `home`, `xdg-desktop`, `xdg-documents`, `xdg-download`, `xdg-music`, `xdg-pictures`, `xdg-videos`, read-only with `:ro` |
| `devices` | none | `usb`, `serial` or `all`. The graphics card and playing sound need nothing |
| `microphone` | `false` | It records sound, from a microphone or from what the computer plays |
| `camera` | `false` | It uses cameras. An app that only uses the camera portal can leave this out and is asked the first time |
| `x11` | `false` | It draws through X11, which is shown before it installs |
| `talk` | none | Session bus names it calls besides the portals, notifications, the Secret Service, the tray and Kestrel's palette, sounds and Send sheet |

`talk` refuses names that would let an app widen its own sandbox, such as the permission store's, Flatpak's and systemd's, and Kestrel's, whose other services are for Luft's own apps.

An app that can't work in a sandbox says so, with a reason the person reads before allowing it:

```toml
[sandbox]
unsandboxed = true
reason = "It manages the containers Podman runs for you."
```

`sabine bundle` checks the declaration and writes it into every bundle, where a store or the system can read it without starting the app. Sabine's [implementation guide](https://github.com/Lantharos/Sabine/blob/main/docs/implementation-guide.md#app-sandbox) has the reference. An AppImage without a declaration gets the network, Downloads, Wayland, sound playback and the graphics card, and nothing else.

## Schelf decides

Schelf reads the declaration before it installs an AppImage and shows it in plain words, as it does for Flatpaks. What the person installs with is written to the permission store, and the sandbox reads only the store when the app starts, never the app's own files, so an update can't widen what an app was given.

- An update that asks for more waits until the person agrees. Any other update keeps what the app still asks for among what it has, plus folders the person added; what was taken away stays away.
- Removing an app clears everything the store holds for it, so another app that takes the same ID later starts from its own declaration.
- An app that asks to run unsandboxed gets the full access confirmation, with its reason, before it installs. Cancelling installs nothing. `schelf install` installs it in its sandbox instead, and `schelf trust` gives it full access. With full access it starts in your environment from systemd, not in Schelf's, and a Sabine app started that way is told with `SABINE_FULL_ACCESS` not to hold itself to its declaration.
- An app that closes within a few seconds of starting, or opens one of the stand-ins the sandbox puts where USB, HID and serial devices would be, makes Luft offer to review its access, which opens the full access confirmation.

One dialog asks before anything installs with more than a plain sandbox, wherever it comes from. A store app lists what its signed release declares. A Flathub app or Flatpak file that asks for all your files, your home folder, every device or a way out of its sandbox lists that first; one that asks for none of it installs straight away. Packages that run without a sandbox, software sources and packages nobody vouches for explain what that means in the same dialog. Nothing is fetched for a `.flatpakref` file, not even its icon, until the person chooses to install.

## The permission store

Every permission lives in the desktop portal's permission store, one table per kind. Flatpak and the AppImage sandbox keep the store out of every sandbox, even for apps given your home folder, so an app can't give itself anything. You can, and so can any program you run.

| Table | Holds |
| --- | --- |
| `full-access` | Sandboxed apps that count as you; an AppImage given full access runs without its sandbox |
| `background-clipboard` | Apps that may use the clipboard in the background. 1Password, KeePassXC and Bitwarden get yes unless answered no |
| `keyring-items` | Which saved items a sandboxed app may use, one entry per item |
| `sandbox` | An AppImage's `folders`, `read-only-folders`, `devices`, extra `bus` names, and `network`, `downloads` and `x11` switches |
| `devices` | `microphone` and `camera`, which the camera portal shares |
| `location`, `background`, `notifications` and others | What apps asked for through the desktop portal |

Kestrel reads `full-access` and `background-clipboard` before it starts, follows every change, and hands the compositor the apps each covers with `meta_context_set_permitted_apps()`. An app with full access counts as unsandboxed in the Wayland protocols kept from sandboxes, in screen recording and display services, and in the shell's D-Bus services. Connections already made keep how they were sorted, so a change applies the next time the app starts.

Settings, under Apps, shows every table and takes any permission away. An app the portal allowed to start at sign-in gets an entry in `~/.config/autostart` named after its app ID, listed with the other startup apps.

## Trusting the catalog

Schelf reads one catalog from schelf.store: the store's apps, then mirrors of Flathub and Fedora, as the store's [client contract](https://github.com/Lantharos/schelf-store/blob/main/docs/clients.md) describes. Every file is checked before it's read:

- Its `.sig` must be made by a store key listed in `trust/v1/store-keys.json`, which the root key built into Schelf must have signed.
- It carries the `path` it was signed for, so one signed file can't be served in place of another.
- Its `serial` only grows. Schelf keeps the last serial for each path in `~/.local/share/com.lantharos.schelf/serials` and never takes a lower one, so an old signed copy can't replace a newer one.
- It `expires`, and Schelf never uses an expired file, on disk or freshly sent, so a copy can't be kept alive forever. When the store can't be reached and the copy on disk has expired, Schelf says it's out of date.

A store app's own file decides what installs, and a download whose size or SHA-256 differs from the signed entry is thrown away. AppImages install with the permissions in the signed release. Flathub apps' details still come from Flathub's API, and Fedora apps' from Fedora's repositories. Extensions go through the system instead; [How extensions run](/extensions/how-extensions-run/) covers what's checked before one runs inside the desktop.

### Invited channels

Someone signed in to schelf.store in Schelf has a session the store gave through its device sign-in, kept only in [Luft Keyring](/security/keyring/). For an app they're invited to, Schelf reads `invited/index/v1/apps/<id>/<channel>.json`, which holds the public releases and that channel's, and downloads files under `invited/` with the session. Nothing else gets the session. The listing goes through every check above, with its own `path` and serial, and the system only installs an extension from it when it's signed for one of that extension's paths. When the store turns the session down, Schelf asks whether the sign-in still holds: if it does, the invitation was taken back, so it forgets that channel and goes back to the public listing; if not, it signs out on this computer and keeps the channel for the next sign-in.

### Pulled apps

Shortly after sign-in and every hour after, `luft-app-revocations.timer` runs `schelf --check-revocations`, and Schelf checks too while it's open. It accepts `trust/v1/revocations.json` only when it's signed, unexpired and its serial isn't lower than the last one, and writes the pulled store apps to `~/.local/share/luft/blocked-appimages.json`. Their sandbox then refuses to start them and opens their page in Schelf, which explains why and offers to remove them.

### Preinstalled apps

The image keeps apps to add in `/usr/share/luft/preinstall`, and `schelf --preinstall` adds each to the account once, so a removed app stays removed. A store app there comes as its listing holding only the release the image ships, next to that release's file, and installs as a download from schelf.store would, without going online. A file whose size or SHA-256 differs from its listing isn't installed. From then on Schelf updates it like any store app.
