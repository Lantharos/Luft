# System packages

How packages from Fedora, from software sources people add and from package files get into Luft's sealed system without changing it. What people see is in [Installing software](https://docs.luft.computer/system/software/#system-packages); the code is `luft-updater` in [packages/software/updater](../packages/software/updater), and Schelf's `--system` and `repo` in [apps/schelf](../apps/schelf/README.md).

## The idea

The system stays the signed image it always is. The packages someone asks for become one [systemd system extension](https://www.freedesktop.org/software/systemd/man/latest/systemd-sysext.html), an EROFS image that systemd lays over `/usr` after the system has started. Each version of Luft on the computer gets its own build of it, made against exactly that version, so an update or going back never meets packages built for something else.

| Path | Holds |
| --- | --- |
| `/var/lib/luft/system-packages/packages` | The packages asked for, one per line |
| `/var/lib/luft/system-packages/files/NAME.rpm` | Package files installed by themselves |
| `/var/lib/luft/system-packages/builds/DIGEST/` | `luft-system-packages.raw` and `build.json`, for the version whose composefs digest is `DIGEST` |
| `/var/lib/luft/system-packages/footprint.json` | What the packages created in `/etc` and `/var`, and the users and groups, that wasn't there before |
| `/var/cache/luft/system-packages` | dnf's metadata and downloads |
| `/run/extensions/luft-system-packages.raw` | A link to this version's build, made at every start |

When the list becomes empty, all of these go. Software sources stay:

| Path | Holds |
| --- | --- |
| `/etc/yum.repos.d/FILE.repo` | A software source that was added |
| `/etc/pki/rpm-gpg/FILE-N.asc` | The keys its packages must be signed with |

Luft's image leaves both folders empty, so everything in them was added this way.

## Building

`luft-updater` builds on a thread of its own in a private mount namespace, so nothing it mounts is seen elsewhere:

1. Mount the version's system read-only from the composefs repository with `bootc internals cfs mount`, which checks every file against the digest like the startup image does, and put a writable overlay over it.
2. Copy the software sources and their keys into the build root, and `dnf --installroot install --downloadonly` against that version's own package database, Fedora's repositories in `/usr/share/dnf5/repos.d` and the added ones, without weak dependencies. Package files installed by themselves are named by their path, so dnf brings what they need. The downloads are collected from dnf's cache, whose folders name the repository each package came from, which `build.json` keeps.
3. Refuse what can't be a system package (below).
4. Give the build root the computer's users and groups from `/etc/passwd` and `/etc/group`, without passwords, so what scriptlets add gets IDs that are free on the computer. Those an earlier build made are renamed, keeping their IDs taken, so the packages make them again and the build learns they're still wanted.
5. Import Fedora's keys from `/usr/share/pki/rpm-gpg` and the added sources' keys, and install with `rpm --install` and `_pkgverify_level all`, so every package must carry a valid signature from one of them. Package files installed by themselves follow in a second transaction with `_pkgverify_level digest`, like dnf treats a local file. `rpm` runs in a bubblewrap sandbox whose whole filesystem is the build root, so its scriptlets can't reach anything else: no network, their own process, IPC and host name namespaces, a fresh `/tmp` and `/run`, a `/dev` with only the harmless devices, no `/proc` or `/sys`, and only the capabilities that write files (owners, modes, file capabilities, switching users), with the bounding set narrowed to those so a file capability they set can't hand more back.
6. Copy out only the files the packages own. A file that would differ from one in the system is refused; one that's identical is left out, so the extension never hides part of Luft. Folders that already exist get the system's owner and mode, since the topmost layer decides them.
7. Files under `/etc` and `/var` go to `/usr/share/factory` in the extension, with their owner and mode noted in `build.json`. That includes the ghost files a package declares and its scriptlets make, such as libvirt's default network. Repository files and keys a package brings are left out: sources are only added with a confirmation.
8. Take along what scriptlets made in `/usr` and `/opt` that's new to the system, such as the `/usr/bin` links Electron apps and 1Password make to their programs in `/opt`, and the polkit policy 1Password fills in. Scriptlets' changes to what the packages own, such as `chmod 4755` on Chromium's sandbox or 1Password's setgid helper, are kept since files are copied from the build root. Everything else scriptlets change stays in the build root.
9. Declare the users and groups the packages made, by sysusers.d or a scriptlet's `useradd` and `groupadd`, in the extension's `/usr/lib/sysusers.d/00-luft-system-packages.conf`, with the IDs they have on the computer, and move the extension's files to those IDs where the build root gave others. Being first, these lines decide over the packages' own sysusers.d entries.
10. Turn services on with `systemctl preset` in the build root. Fedora's presets decide for packages they mention (Docker's socket, libvirt's sockets, CUPS); the services of requested packages they don't mention, such as tailscaled, are turned on, while dependencies they don't mention, such as containerd, stay off until something starts them. The links go into the extension's `/usr/lib/systemd/system`, so they leave with it.
11. Label everything with that version's SELinux `file_contexts` and make the EROFS image, which keeps the labels.

`/opt` is part of Luft's image, an empty folder, and `systemd-sysext` merges `/usr` and `/opt`, so apps that install into `/opt`, such as 1Password, Chrome and Electron apps, are part of the extension like everything in `/usr`. Extensions are merged without `nosuid`, so setuid and setgid programs work.

What scriptlets would otherwise do on the computer itself, such as making users and copying defaults into `/etc`, is declarative in Fedora, or made so by the steps above, and is done when the extension is merged.

## Merging and settling

`extension-release.luft-system-packages` has `ID=luft`, `VERSION_ID` and `EXTENSION_RELOAD_MANAGER=1`. `ID` and `VERSION_ID` are only a safety net: what really ties a build to its version is the link made at every start.

| Unit | When | Does |
| --- | --- | --- |
| `luft-system-packages-link.service` | Before `systemd-sysext.service` | Links the build for the running version's digest (from `composefs=`), if it was made for the current list; otherwise queues a rebuild |
| `luft-system-packages-settle.service` | After `systemd-sysext.service`, before `systemd-tmpfiles-setup.service` | Notes what's missing, then runs `systemd-sysusers`, copies `/etc` and `/var` defaults that aren't there, runs `ldconfig` and reloads udev rules when the packages bring them, and queues the services that are turned on |
| `luft-system-packages-rebuild.service` | Once online, when the link queues it | Builds for the running version and merges it |

The services are queued by hand because systemd merges extensions after the start's targets are queued, so links merged then don't pull anything in by themselves. `Upholds=` would, but it also restarts a service someone stopped.

Installing and removing at runtime build, link, run `systemd-sysext refresh`, settle and start or stop the services that changed. Units that refuse to be started or stopped by hand, such as iSCSI's start-up unit, and templates are left to systemd. When anything after the build fails, the previous build, or none, is put back and what the new one added is taken away again.

## Removing

Before a build is merged, `footprint.json` notes every path it declares that doesn't exist yet: package files in `/etc` and `/var`, tmpfiles.d entries, `StateDirectory=` and the like, and the folders daemons conventionally make for themselves, named after a package or unit (`/var/lib/containerd`). Users and groups from sysusers.d are noted the same way. Whatever is noted and no longer declared is deleted, with `userdel` and `groupdel` for users and groups, after ending what still runs as those users: libvirt's virtual machines and its network's dnsmasq outlive the services that started them. Paths that existed before are never touched. The library cache is kept as it was before the first package with libraries and put back after the last one. Every step is tried, and what fails stays noted, so removing again finishes the job.

Installing libvirt, running a virtual machine with an emulated TPM on its default network and removing it leaves `/etc`, `/var`, users and groups exactly as before. Installing tailscale and Docker, running a container and removing both leaves `/etc`, `/var`, users and groups as before, except for what a daemon makes on its own where nothing names it: Docker's containerd leaves an empty `/etc/cni/net.d`. Deleting such paths by guesswork, such as every path a package's programs mention, would sooner or later delete something another program put there (containerd also mentions `/etc/cdi`, where NVIDIA's container toolkit keeps its files), so they stay. Network state such as Docker's bridge and firewall rules lasts until the next restart.

## Software sources

Schelf fetches a source as the user, from the address of a `.repo` file, `copr:owner/project` (the COPR's file for this Fedora release) or a vendor it knows by name, along with every key `gpgkey` names over HTTPS. `DescribeRepository` checks it without changing anything, and Schelf shows the result before anyone is asked for a password:

- Only sections that are turned on are kept. Each must have `gpgcheck` on, name a key and reach its server over HTTPS. `repo_gpgcheck` is kept as the vendor set it.
- Each key is imported into a throwaway rpm database, so a key rpm wouldn't accept, such as one bound with SHA-1, is refused now rather than at the next build. The fingerprints and names rpm reads are what Schelf shows.
- A section ID another source already uses is refused.

`AddRepository` checks the same file and keys again and writes the file back with only the settings that choose where packages come from, `gpgcheck=1`, and `gpgkey` pointing at the keys as they were shown, kept in `/etc/pki/rpm-gpg`. A source can't change its key later; packages signed with any other key fail at step 5. Both need `com.lantharos.updater.software-sources`.

`RemoveRepository` rebuilds without the source and without the requested packages the merged build says came from it, the same way removing packages does, and only then deletes the file and its keys. A build is current only while every source its packages came from is still there, so the other versions on the computer are built again without it too.

A package file someone opens in Schelf becomes a system package when it has a menu entry in `/usr/share/applications` or brings a repository: a `.repo` file in `/etc/yum.repos.d` among its files, as ChatGPT's does, or one its scriptlets write with `cat > FILE <<EOF`, as 1Password's and Chrome's do, read with the script's own variables filled in. Keys the package carries are read from its payload, the others fetched. Schelf shows the source like any other, adds it and installs the package by name from it, so it keeps updating. A desktop app without a source goes in by itself with `InstallFile`, which takes the file as a descriptor and keeps a copy. Command-line packages without a source keep going to the Toolbox container.

## Updates and going back

When `luft-updater` finishes downloading an update or a switch to the other image, it builds the system packages for the staged version before reporting the download finished, so Settings shows it as still finishing. Applying the update doesn't wait for that: a restart in the middle stops the build, and the version builds its packages once it's online. Builds for versions that aren't booted, staged or the rollback are removed.

Going back needs nothing: the previous version keeps its build. If the list changed since then, the link at the next start doesn't match and the build is made once the computer is online, and the same happens when an update was staged some other way, such as `bootc upgrade` in a terminal.

## What's refused

- **Kernel modules.** Luft starts with Secure Boot and `lockdown=integrity`, so the kernel enforces module signatures (`module.sig_enforce` is on). Modules would have to be signed with a key enrolled in shim, and the only enrolled key is Luft's, whose private half isn't on the computer. Luft has no way to enroll a local key.
- **SELinux policy modules.** `semodule` rebuilds the binary policy from the module store in `/var/lib/selinux`, which on a bootc system is only written when it's installed, while policy updates arrive precompiled in the image's `/etc/selinux`. Adding a module would rebuild an outdated policy, and the locally changed files would then win bootc's three-way merge of `/etc` at every update, so the image's policy updates would stop arriving. Luft's image carries swtpm and `swtpm-selinux` for that reason, since libvirt's QEMU driver needs swtpm, and with it the policy.
- **Packages Luft already has, or newer versions of them.** The extension would hide part of the system. dnf's resolution against the version's own package database leaves these out unless something needs a newer version, which usually works after the next update.
- **Files outside `/usr`, `/opt`, `/etc`, `/var` and `/run`**, such as `/boot`.
- **Sources that don't sign their packages**, such as Stripe's, whose `.repo` file turns `gpgcheck` off and whose packages carry no signature.
- **SELinux modules a scriptlet loads.** Docker CE's scriptlet loads two modules that deny containers some socket families; `semodule` can't reach the policy from the sandbox, the scriptlet carries on, and Docker works without them.

## Security

The extensions aren't signed. They're built on the computer, as root, from packages whose signatures were checked against Fedora's keys or those of a source an administrator added after seeing its key, into a folder only root can write. Package files installed by themselves are only checked against their digests, like `dnf install ./file.rpm` does. Signing them with a key kept on the computer would protect nothing more: anyone who could replace the image could also sign a new one, or change `/etc` instead. `systemd-sysext` merges unsigned images from `/var/lib/extensions` and `/run/extensions` by default; Luft only ever links its own build.

System packages leave measured startup and the TPM alone. Extensions on the running system are merged after the initramfs has unlocked the disk, and nothing is measured for them: PCRs 7, 11, 13 and 15 read the same with and without system packages, so the disk unlocks with the TPM either way.
