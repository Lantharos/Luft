# System packages

How Fedora packages get into Luft's sealed system without changing it. What people see is in [Installing software](https://docs.luft.computer/system/software/#system-packages); the code is `luft-updater` in [packages/software/updater](../packages/software/updater), and Schelf's `--system` in [apps/schelf](../apps/schelf/README.md).

## The idea

The system stays the signed image it always is. The packages someone asks for become one [systemd system extension](https://www.freedesktop.org/software/systemd/man/latest/systemd-sysext.html), an EROFS image that systemd lays over `/usr` after the system has started. Each version of Luft on the computer gets its own build of it, made against exactly that version, so an update or going back never meets packages built for something else.

| Path | Holds |
| --- | --- |
| `/var/lib/luft/system-packages/packages` | The packages asked for, one per line |
| `/var/lib/luft/system-packages/builds/DIGEST/` | `luft-system-packages.raw` and `build.json`, for the version whose composefs digest is `DIGEST` |
| `/var/lib/luft/system-packages/footprint.json` | What the packages created in `/etc` and `/var`, and the users and groups, that wasn't there before |
| `/var/cache/luft/system-packages` | dnf's metadata and downloads |
| `/run/extensions/luft-system-packages.raw` | A link to this version's build, made at every start |

When the list becomes empty, all of these go.

## Building

`luft-updater` builds on a thread of its own in a private mount namespace, so nothing it mounts is seen elsewhere:

1. Mount the version's system read-only from the composefs repository with `bootc internals cfs mount`, which checks every file against the digest like the startup image does, and put a writable overlay over it.
2. `dnf --installroot download --resolve` against that version's own package database and Fedora's repositories in `/usr/share/dnf5/repos.d`, without weak dependencies.
3. Refuse what can't be a system package (below).
4. Import Fedora's keys from `/usr/share/pki/rpm-gpg` and install with `rpm --install --noscripts --notriggers` and `_pkgverify_level all`, so every package must carry a valid Fedora signature.
5. Copy out only the files the packages own. A file that would differ from one in the system is refused; one that's identical is left out, so the extension never hides part of Luft. Folders that already exist get the system's owner and mode, since the topmost layer decides them.
6. Files under `/etc` and `/var` go to `/usr/share/factory` in the extension, with their owner and mode noted in `build.json`.
7. Turn services on with `systemctl preset` in the build root. Fedora's presets decide for packages they mention (Docker's socket, CUPS); the services of requested packages they don't mention, such as tailscaled, are turned on, while dependencies they don't mention, such as containerd, stay off until something starts them. The links go into the extension's `/usr/lib/systemd/system`, so they leave with it.
8. Label everything with that version's SELinux `file_contexts` and make the EROFS image, which keeps the labels.

Scriptlets don't run. What they used to do is declarative in Fedora now and is done when the extension is merged.

## Merging and settling

`extension-release.luft-system-packages` has `ID=luft`, `VERSION_ID` and `EXTENSION_RELOAD_MANAGER=1`. `ID` and `VERSION_ID` are only a safety net: what really ties a build to its version is the link made at every start.

| Unit | When | Does |
| --- | --- | --- |
| `luft-system-packages-link.service` | Before `systemd-sysext.service` | Links the build for the running version's digest (from `composefs=`), if it was made for the current list; otherwise asks for a rebuild |
| `luft-system-packages-settle.service` | After `systemd-sysext.service`, before `systemd-tmpfiles-setup.service` | Notes what's missing, then runs `systemd-sysusers`, copies `/etc` and `/var` defaults that aren't there, runs `ldconfig` and reloads udev rules when the packages bring them, and queues the services that are turned on |
| `luft-system-packages-rebuild.service` | Once online, when asked | Builds for the running version and merges it |

The services are queued by hand because systemd merges extensions after the start's targets are queued, so links merged then don't pull anything in by themselves. `Upholds=` would, but it also restarts a service someone stopped.

Installing and removing at runtime build, link, run `systemd-sysext refresh`, settle and start or stop the services that changed.

## Removing

Before a build is merged, `footprint.json` notes every path it declares that doesn't exist yet: package files in `/etc` and `/var`, tmpfiles.d entries, `StateDirectory=` and the like, and the folders daemons conventionally make for themselves, named after a package or unit (`/var/lib/containerd`). Users and groups from sysusers.d are noted the same way. Whatever is noted and no longer declared is deleted, with `userdel` and `groupdel` for users and groups. Paths that existed before are never touched.

Installing tailscale and Docker, running a container and removing both leaves `/etc`, `/var`, users and groups as before, except for what a daemon makes on its own where nothing names it: Docker's containerd leaves an empty `/etc/cni/net.d`. Deleting such paths by guesswork, such as every path a package's programs mention, would sooner or later delete something another program put there (containerd also mentions `/etc/cdi`, where NVIDIA's container toolkit keeps its files), so they stay. Network state such as Docker's bridge and firewall rules lasts until the next restart.

## Updates and going back

When `luft-updater` finishes downloading an update or a switch to the other image, it builds the system packages for the staged version before reporting the download finished, so Settings shows it as still finishing. Applying the update doesn't wait for that: a restart in the middle stops the build, and the version builds its packages once it's online. Builds for versions that aren't booted, staged or the rollback are removed.

Going back needs nothing: the previous version keeps its build. If the list changed since then, the link at the next start doesn't match and the build is made once the computer is online, and the same happens when an update was staged some other way, such as `bootc upgrade` in a terminal.

## What's refused

- **Kernel modules.** Luft starts with Secure Boot and `lockdown=integrity`, so the kernel enforces module signatures (`module.sig_enforce` is on). Modules would have to be signed with a key enrolled in shim, and the only enrolled key is Luft's, whose private half isn't on the computer. Enrolling a local key isn't supported yet.
- **SELinux policy modules.** `semodule` rebuilds the binary policy from the module store in `/var/lib/selinux`, which on a bootc system is only written when it's installed, while policy updates arrive precompiled in the image's `/etc/selinux`. Adding a module would rebuild an outdated policy, and the locally changed files would then win bootc's three-way merge of `/etc` at every update, so the image's policy updates would stop arriving. This rules out libvirt for now: its QEMU driver needs swtpm, which needs `swtpm-selinux`.
- **Packages Luft already has, or newer versions of them.** The extension would hide part of the system. dnf's resolution against the version's own package database leaves these out unless something needs a newer version, which usually works after the next update.
- **Files outside `/usr`, `/opt`, `/etc`, `/var` and `/run`**, such as `/boot`.

## Security

The extensions aren't signed. They're built on the computer, as root, from packages whose Fedora signatures were checked, into a folder only root can write. Signing them with a key kept on the computer would protect nothing more: anyone who could replace the image could also sign a new one, or change `/etc` instead. `systemd-sysext` merges unsigned images from `/var/lib/extensions` and `/run/extensions` by default; Luft only ever links its own build.

Measured startup and the TPM don't change. Extensions on the running system are merged after the initramfs has unlocked the disk, and nothing is measured for them: PCRs 7, 11, 13 and 15 read the same with and without system packages. The disk unlocks with the TPM as before.
