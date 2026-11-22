---
title: Locking settings with a policy
description: How an organization decides settings on its computers with policy files, which keys there are, which file wins, where each one is enforced and how to check a file.
sidebar:
  order: 12
---

An organization can decide some settings for everyone on its computers: how soon the screen locks, how updates arrive, what the firewall lets through, where software comes from, who can sign in from elsewhere and more. The services that own these settings apply the decided values and refuse calls that would change them, whatever program makes the call, so the `luft` command and scripts are held to the policy as much as Settings. Settings shows such a setting as it is, can't change it, and says the organization manages it. **System › About** says who manages the computer and lists, in plain words, everything the organization decided.

## Policy files

Policy lives in TOML files in two folders:

| Folder | For |
| --- | --- |
| `/usr/share/luft/policy.d` | An image built from Luft's, with the policy baked in. It's part of the signed, read-only image, so nobody on the computer can change it. |
| `/etc/luft/policy.d` | A local administrator's policy for one computer |

Only files ending in `.toml` count. Within each folder they're read in name order, so name them with a number in front, such as `10-updates.toml`. The files in `/etc` are read first and those in `/usr/share` after them, and a value set by a later file replaces the same value from an earlier one, key by key. The image therefore has the last word: a local administrator can decide what the image leaves open, but not undo what it decided.

A file with a mistake, such as a key Luft doesn't know or a value of the wrong kind, is left out as a whole. Check a file before adding it, and see what the computer's policy decides now, with the `luft` command:

```sh
luft policy check 10-updates.toml   # every unknown key and wrong value, by its full key
luft policy                         # each decided value and the file that decides it
```

`luft policy check` exits with 3 when the file would be left out. `luft policy` also lists the files it leaves out and why, and `--json` prints both for scripts. The services name left-out files in the system journal too (`journalctl -b | grep 'Leaving out the policy'`).

Changes count at once. Every service that applies the policy follows both folders while it runs, and the services that only start when needed are started when a policy folder changes, so a new file takes effect within a moment, in running sessions too.

To ship policy in your own image, copy it in from your Containerfile:

```dockerfile
FROM ghcr.io/lantharos/luft:1
COPY policy/*.toml /usr/share/luft/policy.d/
```

## Keys

A key left out stays each person's choice.

```toml
[organization]
name = "Acme"          # shown in Settings as "Managed by Acme"

[screen-lock]
enabled = true         # lock the screen when it turns off
screen-off = 300       # seconds without input before the screen turns off, 0 for never
lock-after = 0         # seconds after the screen turns off before it locks

[updates]
schedule = "daily"     # "daily", "weekly" or "never"
download = true        # download and stage updates found on schedule
channel = "stable"     # "stable" or "nightly"

[firewall]
home-networks = false  # every network counts as public
public-access = false  # nothing is reachable from public networks
open-ports = false     # no ports opened for services without an app

[software]
system-packages = false             # no adding system packages, from Fedora or as .rpm files
package-sources = false             # no adding software sources
app-sources = ["schelf-store", "flathub"]  # where apps may come from: "schelf-store", "flathub", "appimage", "ubuntu"

[developer]
tools = false          # Developer tools stays off, or on with true

[extensions]
unreviewed = false     # extensions nobody reviewed don't run, approved ones included

[encryption]
required = true        # Luft's disk has to be encrypted

[accounts]
add = false            # nobody adds accounts
administrators = false # nobody is made an administrator
automatic-sign-in = false

[remote-login]
allowed = false        # remote login stays off
passwords = false      # remote login only takes keys

[nearby-sharing]
visible-to = "your-devices"  # "no-one", "your-devices" or "everyone"

[crash-reports]
send = "never"         # "always" or "never"
```

Keys that only take something away, such as everything under `firewall`, `accounts` and `remote-login`, `software`'s two switches and `extensions.unreviewed`, are on unless a file turns them off; turning one on again has nothing to lock.

`nearby-sharing.visible-to` decides who can find the computer in [Post](/desktop/post/). Post has no idea of an organization: it knows the devices each person paired, so `"your-devices"` is the closest it comes to keeping sharing inside the organization.

## Where each key is enforced

| Keys | Enforced by |
| --- | --- |
| `organization` | Nothing to enforce; Settings shows the name |
| `screen-lock`, `nearby-sharing` | `locksmith`, below, which locks the desktop settings |
| `updates` | `updater`: `Schedule` and `DownloadAutomatically` report the policy's values and the scheduled check follows them. A system on another channel than the policy's moves to it the way [a channel switch](/developers/system/updates/#the-updater) does, waiting until that channel has caught up. |
| `firewall` | `shield`: with `home-networks` off, no network is home and none waits to be chosen; with `public-access` off, apps and ports allowed anywhere only open on home networks; with `open-ports` off, the ports opened for services stay closed. |
| `software.system-packages`, `software.package-sources` | `packager` refuses `Install` and `InstallFile`, or `AddRepository`. Schelf and the `schelf` command show and refuse them before asking. Packages and sources added earlier stay. |
| `software.app-sources` | Schelf, its install window for files and the `schelf` command refuse to install from other sources and show those apps as managed. Apps installed earlier keep updating and can be removed. |
| `developer` | The greeter service's `DeveloperTools`, which everything that depends on Developer tools reads |
| `extensions` | `packager` refuses `InstallUnreviewedExtension` and `AllowExtensionFolder`, and Kestrel stops every extension that isn't from the store, copies and approved folders included |
| `encryption` | `trustd` refuses `CancelSystemDiskEncryption`. On a computer whose TPM unlocks the disk, it asks for encryption itself when it starts and when the policy changes, with a recovery key it keeps sealed to the TPM, which an administrator can show in Settings; the disk is encrypted from the next restart. Without such a TPM, someone has to turn encryption on in Settings, with a passphrase. |
| `accounts.add`, `accounts.administrators` | `locksmith` writes a polkit rule that denies AccountsService's `org.freedesktop.accounts.user-administration` to everyone but root |
| `accounts.automatic-sign-in` | The greeter service refuses `SetAutomaticLogin` for a person, and the login screen doesn't sign anyone in by itself |
| `remote-login` | `remoted`: `Enabled` and `PasswordLogin` report what the policy leaves, turning remote login or passwords on fails, and a running SSH server is stopped, or loses passwords, as soon as the policy changes. At startup, `sshd` only starts when the policy allows it. |
| `crash-reports` | The crash reports service in each session: its `Choice` is the policy's, `SetChoice` fails, and with `"never"` nothing waiting or queued is sent |

A refused call fails with the service's `Managed` error, such as `com.lantharos.Updater1.Error.Managed`.

### Limits

Two keys are conveniences rather than locks. AccountsService asks for one permission to add, remove and change other people's accounts, so either `accounts` key denies all three there; and root, which administrators can become, adds accounts with `useradd` regardless. `software.app-sources` is kept by Schelf, the install window and the `schelf` command, but each person can install apps into their own account without them, with `flatpak --user` or by running an AppImage, since nothing in the system stands between a person and their own home folder.

### Desktop settings, accounts and Kestrel

The screen lock and Post's visibility are desktop settings each person keeps in their own dconf database, so a service can't refuse changes to them. Instead, `locksmith.service` compiles the decided values into the dconf system database `/etc/dconf/db/luft-policy`, with each key locked, and Kestrel's session puts that database right after each person's own, so its values are the ones read and the person's own can't be written. `locksmith.path` runs it again whenever a policy folder changes; it marks the old database as replaced and tells running sessions over the system bus, the way `dconf update` does, so the new values reach them at once.

The same run writes the polkit rule for `accounts` to `/run/polkit-1/rules.d/00-luft-policy.rules`, which polkit reads as soon as it changes, and publishes the whole policy as JSON in `/run/luft/policy/policy.json`, which Kestrel follows for `extensions`.

## In code

`luft-policy` in `packages/policy` reads and merges the files into a typed `Policy`. `Policy::load()` reads this computer's, `Policy::from_folders` any folders, `Policy::explain()` which file decides each value, and `luft_policy::check` reads one file's text or names every problem in it. With the `follow` feature, `Follow` watches both folders, including ones that don't exist yet, and `changed()` waits until the policy really changes and gives the new one; long-running services wait on it next to their other work. Services that exit when idle follow the policy while they run, and `remoted-policy.path` and `trustd-policy.path` start them when a folder changes. Settings and Schelf get the same `Policy` from their `policy` commands and a `policy.changed` or `schelf.policy` event, and pass `locked` to the shared `Row` from `@luft/ui`.
