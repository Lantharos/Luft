---
title: Locking settings with a policy
description: How an organization decides settings on its computers with policy files, which keys there are, which file wins, and where each one is enforced.
sidebar:
  order: 12
---

An organization can decide some settings for everyone on its computers: how soon the screen locks, how updates arrive, what the firewall lets through, what can be added to the system and whether Developer tools is on. The services that own these settings apply the decided values and refuse calls that would change them, whatever program makes the call, so the `luft` command and scripts are held to the policy as much as Settings. Settings shows such a setting as it is, can't change it, and says the organization manages it.

## Policy files

Policy lives in TOML files in two folders:

| Folder | For |
| --- | --- |
| `/usr/share/luft/policy.d` | An image built from Luft's, with the policy baked in. It's part of the signed, read-only image, so nobody on the computer can change it. |
| `/etc/luft/policy.d` | A local administrator's policy for one computer |

Only files ending in `.toml` count. Within each folder they're read in name order, so name them with a number in front, such as `10-updates.toml`. The files in `/etc` are read first and those in `/usr/share` after them, and a value set by a later file replaces the same value from an earlier one, key by key. The image therefore has the last word: a local administrator can decide what the image leaves open, but not undo what it decided.

A file with a mistake, such as a key Luft doesn't know or a value of the wrong kind, is left out as a whole, and the services name it in the system journal (`journalctl -b | grep 'Leaving out the policy'`), so check the journal after adding one.

To ship policy in your own image, copy it in from your Containerfile:

```dockerfile
FROM ghcr.io/lantharos/luft:1
COPY policy/*.toml /usr/share/luft/policy.d/
```

## Keys

A key left out stays each person's choice.

```toml
[screen-lock]
enabled = true      # lock the screen when it turns off
screen-off = 300    # seconds without input before the screen turns off, 0 for never
lock-after = 0      # seconds after the screen turns off before it locks

[updates]
schedule = "daily"  # "daily", "weekly" or "never"
download = true     # download and stage updates found on schedule
channel = "stable"  # "stable" or "nightly"

[firewall]
home-networks = false  # every network counts as public
public-access = false  # nothing is reachable from public networks
open-ports = false     # no ports opened for services without an app

[software]
system-packages = false  # no adding system packages, from Fedora or as .rpm files
package-sources = false  # no adding software sources

[developer]
tools = false  # Developer tools stays off, or on with true
```

The `firewall` and `software` keys only take something away: they're on unless a file turns them off, and turning one on again has nothing to lock.

## Where each key is enforced

| Keys | Enforced by |
| --- | --- |
| `screen-lock` | `locksmith`, below |
| `updates` | `updater`: `Schedule` and `DownloadAutomatically` report the policy's values and the scheduled check follows them. A system on another channel than the policy's moves to it the way [a channel switch](/developers/system/updates/#the-updater) does, waiting until that channel has caught up. |
| `firewall` | `shield`: with `home-networks` off, no network is home and none waits to be chosen; with `public-access` off, apps and ports allowed anywhere only open on home networks; with `open-ports` off, the ports opened for services stay closed. |
| `software` | `packager` refuses `Install` and `InstallFile`, or `AddRepository`. Packages and sources added earlier stay. |
| `developer` | The greeter service's `DeveloperTools`, which everything that depends on Developer tools reads |

A refused call fails with the service's `Managed` error, such as `com.lantharos.Updater1.Error.Managed`. The services read the policy each time they act, so a change to `/etc/luft/policy.d` counts from their next call; `shield` reads it whenever the networks or listening apps change, or when it restarts.

### Screen lock

The screen lock is a desktop setting each person keeps in their own dconf database, so a service can't refuse changes to it. Instead, `locksmith.service` compiles the decided values into the dconf database `/run/luft/policy/dconf` at startup, with each key locked, and `locksmith.path` compiles it again when `/etc/luft/policy.d` changes. Kestrel's session puts that database right after each person's own, so its values are the ones read and the person's own can't be written. A change reaches a session at the next sign-in.

## In code

`luft-policy` in `packages/policy` reads and merges the files into a typed `Policy`. `Policy::load()` reads this computer's, and `Policy::from_folders` any folders, which is what its tests use. Settings gets the same `Policy` from its `policy` command and passes `locked` to the shared `Row` from `@luft/ui`.
