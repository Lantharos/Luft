---
title: How system packages work
description: How packages from Fedora and added software sources become a system extension built for each version of Luft, without changing the sealed image.
sidebar:
  order: 10
---

The packages someone asks for become one [systemd system extension](https://www.freedesktop.org/software/systemd/man/latest/systemd-sysext.html), an EROFS image that systemd lays over `/usr` and `/opt` after the system has started. Each version of Luft on the computer gets its own build, made against exactly that version, so an update or going back never meets packages built for something else. Using them is covered in [System packages](/system/system-packages/); the service is `luft-packages` in `services/packages`.

## Who does what

Building runs packages' scriptlets and talks to the network, so it's kept apart from what changes the running system.

- `luft-packages.service` (`com.lantharos.Packages1`, started on demand) builds, and keeps the list, package files and software sources under `/var/lib/luft/system-packages`. It sees the system read-only, can write only its state and cache folders, has no devices, and holds only the capabilities building needs.
- `luft-system-packages-activate@.service`, one instance per request on a socket only root can open, brings a finished build into the running system or takes the packages away. It reads nothing from the build service but the word asking for one of the two.

Everything lives in `/var`, so going back to an earlier version keeps the list and the sources. A drop-in for dnf adds the sources folder to its `reposdir`, so `dnf repolist` on the computer sees them too.

## Building

`luft-packages` builds in a private mount namespace, so nothing it mounts outlives the build.

1. Mount the version's system read-only from the composefs repository, checked file by file against its digest as the startup image does, with a writable overlay on top.
2. Resolve with `dnf --installroot` against that version's own package database, using only Fedora's repositories and the added sources, with weak dependencies as on any Fedora. Only what the transaction adds brings its recommendations, so Luft's own set stays as small as it was built.
3. Refuse what can't be a system package ([below](#whats-refused)).
4. Check every package against the keys of where it came from and no others: Fedora's against Fedora's keys, each source's against the keys it was added with. One source's key can't vouch for a package from Fedora or from another source. Package files installed by themselves are checked against their digests, as `dnf install ./file.rpm` does.
5. Install with `rpm` inside a bubblewrap sandbox whose whole file system is the build root: no network, its own namespaces, a fresh `/tmp` and `/run`, only harmless devices, no `/proc` or `/sys`, and only the capabilities that write files, with the bounding set narrowed so a file capability a scriptlet sets can't hand more back.
6. Copy out only the files the packages own, plus what scriptlets made in `/usr` and `/opt` that's new to the system, such as the `/usr/bin` links Electron apps make to their programs in `/opt`. A file that would differ from one in the system is refused, and one that's identical is left out, so the extension never hides part of Luft.
7. Move files under `/etc` and `/var` to `/usr/share/factory` in the extension, with their owner and mode noted. Repository files and keys a package brings are left out: sources are only added with a confirmation.
8. Declare the users and groups the packages made in a sysusers.d file that comes first, with the IDs they have on the computer.
9. Turn services on with `systemctl preset`. Fedora's presets decide for the packages they mention; services of requested packages they don't mention are turned on, and those of dependencies they don't mention stay off until something starts them.
10. Label everything with the build root's SELinux file contexts and make the EROFS image, which keeps the labels.

Extensions are merged without `nosuid`, so setuid and setgid helpers such as Chromium's sandbox or 1Password's work.

## Merging and settling

The build carries `ID=luft` and the version, but what really ties a build to its version is a link made at every start. Before `systemd-sysext.service`, `luft-system-packages-link.service` links the build for the running version's composefs digest into `/run/extensions`, or queues a rebuild when there's none for the current list. After the merge, `luft-system-packages-settle.service` runs `systemd-sysusers`, copies `/etc` and `/var` defaults that aren't there, runs `ldconfig` and reloads udev rules when needed, and starts the services that are turned on. They're started by hand because systemd merges extensions after the start's targets are queued, so merged links pull nothing in by themselves. `Upholds=` would, but it also restarts a service someone stopped.

Installing at runtime builds, then has the activation service link the build, run `systemd-sysext refresh`, settle, and start or stop what changed. Merging puts a new `/usr` in place, and programs already watching `/usr/share/applications`, such as Kestrel's app list, keep watching the old one. So settling links the packages' menu entries into `/run/luft-system-packages/share/applications`, which the session adds to `XDG_DATA_DIRS`, and a new app turns up in Start as soon as it's in. When anything after the build fails, the previous build, or none, is put back. A service that can't start yet, such as PostgreSQL's before its database is set up, is the exception: that's logged and the packages stay.

## Removing

Before a build is merged, `footprint.json` notes every path it declares that doesn't exist yet: package files in `/etc` and `/var`, tmpfiles.d entries, `StateDirectory=` and the folders daemons conventionally make for themselves, named after a package or unit. Users and groups are noted the same way. When a package leaves the list, whatever is noted and no longer declared is deleted, after ending what still runs as those users. Paths that existed before are never touched, and what fails to go stays noted, so removing again finishes the job.

Nothing is deleted at any other time, not even when an update's build stops declaring a folder. What a daemon makes where nothing names it, such as the empty `/etc/cni/net.d` Docker's containerd leaves, also stays: deleting by guesswork, such as every path a program mentions, would sooner or later delete another program's files.

## SELinux policy

The policy's module store is in `/etc/selinux/targeted/active`, part of the image. Running `semodule` on the computer would rebuild the policy in `/etc`, and those changed files would then win bootc's three-way merge at every update, so the image's policy would stop being updated.

Instead, scriptlets see SELinux as on in the sandbox, so `semodule -i`, as in Docker CE's scriptlet, writes into the build root's copy of that version's store, with the computer's own `*.local` customisations copied in first. When modules were added, `semodule -B` builds the binary policy into the extension, and settling loads it into the kernel. Nothing in `/etc` changes, and each version's build comes from that version's store, so the image's policy updates keep arriving with the modules on top. A module added by hand, or a later `setsebool -P`, reloads `/etc`'s policy without the packages' modules until the next start.

## Software sources

Schelf fetches a source as the user, from a `.repo` file's address, `copr:owner/project` or a vendor it knows by name, with every key `gpgkey` names over HTTPS. `DescribeRepository` checks it without changing anything, so Schelf shows the result before anyone is asked for a password.

- Only enabled sections are kept. Each must have `gpgcheck` on, name a key and reach its server over HTTPS.
- `priority` and `cost` are dropped, so a source can't put itself ahead of Fedora or another source. Between sources, the newest version of a package wins.
- Each key is imported into a throwaway rpm database, so one rpm wouldn't accept, such as a key bound with SHA-1, is refused now rather than at the next build.
- A section ID another source already uses is refused.

`AddRepository`, which needs an administrator, checks the same file and keys again and writes it back with only the settings that choose where packages come from, pointing at the keys as they were shown. A source can't change its key later. `RemoveRepository` rebuilds without the source and the packages that came from it, and only then deletes its file and keys.

A package file opened in Schelf becomes a system package when it has a menu entry or brings a repository: a `.repo` file among its files, or one its scriptlets write with `cat > FILE <<EOF`, as 1Password's and Chrome's do. Schelf shows that source like any other, adds it and installs the package by name from it, so later builds take the source's newest version. A desktop app without a source goes in by itself through `InstallFile`, which takes the file as a descriptor and keeps a copy only root can read.

## Updates

When `luft-updater` finishes downloading an update or a switch to the other image, it calls `Rebuild`, and the system packages are built for the staged version before the download reports finished. A restart in the middle stops the build, and the new version builds its packages once it's online. Builds for versions that aren't booted, staged or the rollback are removed.

When the updater checks on its schedule and downloads nothing, it calls `Update`: for every version on the computer, the list is resolved again and rebuilt only when a version changed. The running version's new build goes in the way an install does, restarting services whose package changed, with the build before put back on failure. So fixes from Fedora and added sources arrive as often as Luft looks for updates.

## What's refused

[System packages](/system/system-packages/) lists what can't be one. Kernel modules are the hard limit: Luft starts with Secure Boot and `lockdown=integrity`, so the kernel enforces module signatures, the only key shim trusts is Luft's, whose private half isn't on the computer, and Luft has no way to enroll a local key. SELinux modules that replace or remove one of Luft's are refused at any priority, and so are packages Luft already has, or newer versions of them, since the extension would hide part of the system.

## Security

The extensions aren't signed. They're built on the computer, as root, from packages whose signatures were checked against Fedora's keys or a key an administrator saw and accepted, into a folder only root can write. Signing them with a key kept on the computer would protect nothing more: anyone who could replace the build could sign a new one, or change `/etc` instead. `systemd-sysext` would merge unsigned images from `/var/lib/extensions` and `/run/extensions`; Luft only ever links its own build.

System packages leave measured startup alone. They're merged after the startup image has unlocked the disk, and nothing is measured for them, so PCRs 7, 11, 13 and 15 read the same with and without them, and the TPM unlocks the disk either way.
