---
title: Who an app is
description: How Kestrel and Luft's services tell sandboxed apps, your own programs and Luft's programs apart.
sidebar:
  order: 3
---

Luft tells apps apart only where something the app can't fake vouches for it. Every other program running as you is treated as you.

## Three kinds of caller

- A sandboxed app is its sandbox's app ID. Flatpak and the [AppImage sandbox](/security/app-sandbox/) give every process they start a `.flatpak-info` file at the root of its view of the files, which the process can't change or remove, and the app ID in it is the app.
- A program outside a sandbox is you. It can read your files, change another program's settings, start it with a library slipped in, or name itself after any app, so no name, path, systemd scope or launcher entry tells such programs apart. Programs from system packages and Toolbox containers are you too.
- A sandboxed app with full access is also you. Schelf gives it that with a Flatpak override or by starting the AppImage without its sandbox.

Every service judges a caller the same way: from the kernel's view of the D-Bus connection or socket, with a pidfd pinning the process while it's looked at. A process without `.flatpak-info` is you. One that hides its root from others counts as you only when its mount table, which anyone may read, has nothing at `/.flatpak-info`; otherwise, and when it quits while being looked at, it's an unknown sandbox. Sandboxed apps reach the session bus only through a filtering proxy that carries the same marker, so services see the app behind every message, and reach Wayland only through a socket Kestrel tags with the app ID.

The Rust services share these rules through the `luft-identity` crate, and the compositor applies the same rules to Wayland clients with `meta_context_identify_sender()`. Both are checked against the cases in `packages/identity/sandbox-cases.ini`.

A program running as you can build a sandbox that names any app, so it can pass as a sandboxed app. A sandboxed app can never pass as you.

## What a sandbox keeps an app from

Kestrel and Luft's services hold a sandboxed app to its sandbox: no clipboard in the background, no windows kept above others or out of the taskbar, no screen recording or display changes except through the portal, none of the shell's private services, and only its own secrets in the keyring. [App sandbox](/security/app-sandbox/) has the walls, and [App permissions](/security/app-permissions/#the-permission-store) what an app can be given beyond them.

A bus proxy opens a whole connection once one of its names is allowed, so Kestrel owns `org.gtk.Notifications` and the tray's `org.kde.StatusNotifierWatcher`, which sandboxes commonly allow, each on a connection of its own. An app that may show a notification reaches nothing else Kestrel offers.

## Luft's own programs

Kestrel, its helpers, Luft's services and the apps that come with the system are in the read-only image. Two things keep your other programs from passing as one of them.

### A clean start

Your environment, from `~/.config/environment.d`, `systemctl --user set-environment` or your shell's profile, can point a program at libraries and modules of anyone's choosing: `LD_PRELOAD`, `GTK_MODULES`, `GIO_EXTRA_MODULES`, `GI_TYPELIB_PATH`, `GJS_PATH`, `PYTHONPATH` and many more. Luft's own programs don't start in it.

- Kestrel's units take out every variable in `kestrel/engine/src/environment/unsafe.list`. A drop-in for every user unit named `kestrel-*` or `luft-*` takes out the same list, and systemd applies it last, so nothing your systemd holds reaches them.
- Kestrel's helpers and Luft's user services then start through `luft-launch`, which keeps only the variables in `allowed.list` next to it and sets `PATH` to `/usr/local/bin:/usr/bin`. Helpers D-Bus starts on demand, such as notifications and Rover's file chooser for other apps, run as units of their own for this.
- Kestrel starts Luft's apps with the same short list. An app is Luft's when its entry is named `com.lantharos.` or its program is under `/usr/lib/sabine/com.lantharos.`.
- Every other app gets your whole environment, and so do programs Luft's apps start for you, such as a shell in Tern, which take it from your systemd.
- The login screen's Kestrel starts from greetd, whose environment only system configuration sets.

A development build started from `KESTREL_BUILDDIR` also passes the variables in `development.list` to the apps it starts, so test sessions can point them at stand-ins. An installed Kestrel ignores that list, and ignores `KESTREL_BUILDDIR`, `KESTREL_DATADIR` and the other variables that point a build at its own files unless the program running is the `kestrel` inside `KESTREL_BUILDDIR`.

This doesn't cover unit files and drop-ins in `~/.config/systemd/user`, which can give a Luft service or Kestrel any environment or command, or Vulkan layers listed in `~/.local/share/vulkan`. Only the [shielded helpers](#shielded-helpers) are out of their reach.

### Telling them apart

A few calls are for one of Luft's programs alone. Before answering one, the service gets a pidfd for the caller and, while it pins the process, checks that:

- the program file is in the image under `/usr`, owned by root, writable by nobody else, and still the file at that path;
- it is the one program the call is for;
- no file from outside the image that still exists is mapped in as code, its starting environment holds none of the unsafe variables, and a Sabine app wasn't started with switches that open its browser to others, such as `--remote-debugging-port`.

Code a program makes for itself, as graphics drivers and JIT compilers do from memory or from a file they delete at once, isn't held against it: the check tells those apart from a library by whether the mapped file is still at its path, by inode.

| Service | Calls | Only from |
| --- | --- | --- |
| `com.lantharos.Accounts1` | Online accounts and their sign-in | Settings |
| `com.lantharos.Accounts1.Files` | Cloud drives, keeping and freeing files, share links | Settings and Rover |
| `com.lantharos.Packages1` | `InstallUnreviewedExtension`, `AllowExtensionFolder` | Settings |
| `com.lantharos.UsbProtection1` | `SetLocked` | Kestrel |
| `com.lantharos.Firewall1` | `SetExtensionPorts` | Kestrel |
| `com.lantharos.Firewall1` | `SetPostOpen` | Post |
| `com.lantharos.Changes1` | `Apply` | Kestrel |

`luft-identity` has this as `caller::luft_program`. The calls from Kestrel and Post also check, as `caller::session_unit`, that the caller runs in the right unit of `session.slice` in its own systemd: `kestrel.service` or `kestrel-post.service`. None of them gives more than your own programs could get anyway: one port on home networks, the ports you agreed to for an extension, devices you plugged in, settings an administrator approved.

`/usr/bin/luft` is one of Luft's programs, but it is on none of these lists, so it is never taken for Settings, Kestrel or Post. [Confirming it's you](/security/confirming/#changes-from-the-command-line) covers what it does instead.

This stops a renamed or copied program, one that takes a Luft program's bus name or unit, and a Luft program started with your library slipped in. It doesn't stop a program that takes over one of Luft's programs while it runs: `kernel.yama.ptrace_scope=1` keeps programs from tracing ones they didn't start, but a program can start one of Luft's apps itself and trace it or steer it through the accessibility bus. The session bus runs as you, so a bus started through your own drop-in could hand over any process; the system bus, where USB protection and the firewall listen, runs as its own account.

### Shielded helpers

Luft Keyring holds what your other programs mustn't reach, even though it runs as you: your unlocked secrets and the key the TPM releases for it. It is installed setgid to a group of its own, `luft-keyring`, with no account in it.

- Starting a setgid program counts as a change of identity to the kernel. The loader ignores `LD_PRELOAD` and its kind, and from the first instruction nothing without `CAP_SYS_PTRACE` can trace the process or read its memory, environment, maps or open files. The helper then keeps itself out of core dumps and locks itself down with a system call filter that also stops it starting other programs, so the group can't be handed on.
- The kernel only grants the group when nothing traces the start and no-new-privileges isn't set, so the group proves a clean start. Whatever acts for a helper checks for it: the TPM unlock service and Kestrel's keyring prompts. A program that takes the helper's bus name while it isn't running gets nothing.
- systemd sets no-new-privileges for any user unit that filters system calls or restricts namespaces, so a helper's unit sets none of that and the helper locks itself down. `systemd-analyze security` can't see that and scores it as exposed.

A program of yours can still restart the keyring or start it with an environment of its choosing, but the keyring asks for consent itself, so that gains nothing. Root reaches it as it reaches everything. Cloud drive sign-ins, VPN passwords and GnuPG passphrases end up with rclone, NetworkManager or `gpg-agent`, which hand them to your programs anyway, so the helpers in between aren't shielded. [Luft Keyring](/security/keyring/) covers the keyring itself.

Extensions are judged by where they're installed rather than by who calls; [How extensions run](/extensions/how-extensions-run/) covers that.
