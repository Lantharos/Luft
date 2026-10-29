# Where state lives

Luft is a bootc system, and that decides where its services keep what they write. Every version of the system on the computer has its own copy of `/etc`: an update takes the running version's `/etc`, merges in what the new image changed, and gives the result to the new version, while going back starts the older version with the `/etc` it had. `/var` is one folder that every version shares.

Anything a service writes to `/etc` therefore belongs to one version only. Going back to an earlier one loses it, and updating from there carries that loss forward for good. A software source added to `/etc/yum.repos.d` would vanish after going back, while the list of packages from it in `/var` stayed, so the packages could no longer be built; a drive set to unlock by itself through `/etc/crypttab` would stop doing so.

## The rule

- What a Luft service writes lives in `/var/lib/<service>`, so it's the same for every version.
- Defaults live in `/usr`, in the image.
- When a stock tool only reads its configuration from `/etc`, it gets its view at runtime: from a file in `/run`, from a generator in `/usr/lib/systemd/system-generators` that reads the state in `/var`, or from a drop-in in `/usr` that points it at `/var`.
- `/etc` is for configuration an administrator chooses for this computer, through the system's own tools: the host name, the time zone, network connections, users and groups. Those are meant to be merged into each new version like any administrator's change.

| Service | State | How stock tools see it |
| --- | --- | --- |
| Kestrel's login screen | `/var/lib/kestrel-greeter` | Defaults in `/usr`, the display configuration in `/run` |
| `luft-packages` | `/var/lib/luft/system-packages`, with the software sources in `repositories` and their keys in `keys` | dnf builds with `reposdir` pointing at the build root's copy, and `/usr/share/dnf5/libdnf.conf.d/50-luft-system-packages.conf` adds the folder to `dnf` on the computer |
| `trustd` | `/var/lib/trustd`, with the keys of drives that unlock by themselves next to their records in `drives` | `trustd-drives-generator` makes their `systemd-cryptsetup@` units; drives being decrypted are recognised from `/var/lib/trustd/decrypting` by its udev rules |
| `luft-sleep` | `/var/lib/luft-sleep/sleep.conf` | |
| `luft-updater` | `/var/lib/luft-updater/schedule.json` | `luft-updater-check.timer` asks the updater, which decides |

The one place Luft writes into `/etc` itself is settling system packages: the configuration files packages bring are copied there when they're missing, like installing them would, and the library cache is made again. Both happen at every start from the merged packages, so a version that lacks them gets them back.

## Users and groups

`/etc/passwd` and `/etc/group` belong to the computer, and systemd-sysusers gives a new system group the next free ID there, counting down from 999. The image is built with its own copy, so a group the image adds can end up with one ID in the image and another on a computer installed earlier. Image files owned by a group carry its ID, not its name, so every user and group Luft defines in sysusers.d has a fixed ID from 290 to 299, the bottom of the range Fedora hands out from the top. The image build stops when one of them comes out with a different ID.

| Name | ID | Owns |
| --- | --- | --- |
| `luft-keyring` group | 290 | `/usr/libexec/luft-keyring`, setgid |

A computer that made the group before it had a fixed ID keeps its old entry in `/etc/group`. Nothing there checks the group by name, so it works as before; the keyring program's group is just shown as 290.

## The check

The Checks workflow runs `.github/scripts/etc/index.ts`, which looks for `/etc` paths in Luft's code, leaving out tests, VMs, development tools and the image build. Every path it finds has to be listed in `.github/scripts/etc/allowed.json` with the reason it's fine: the code only reads it, or it's configuration an administrator chooses. A new path fails the check until it's listed, and a listed path that's gone from the code fails too, so the list stays true.
