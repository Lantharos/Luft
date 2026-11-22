---
title: Locking settings with a policy
description: Decide settings for everyone on your computers with policy files, with every key, where the files go and which one wins.
sidebar:
  order: 3
asks:
  - group policy
  - lock settings
  - managed by your organization
  - policy file
  - { ask: check policy file, to: policy-files }
  - { ask: disable app installs, to: keys }
---

An organization can decide some settings for everyone on its computers: how soon the screen locks, how updates arrive, what the firewall lets through, where software comes from, who can sign in from elsewhere and more. Luft applies the decided values and refuses every attempt to change them, from Settings, the `luft` command or a script alike. Settings shows such a setting as it is, can't change it, and says the organization manages it. **System › About** says who manages the computer and lists, in plain words, everything the organization decided.

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

To ship policy in [your own Luft](/organizations/your-own-luft/), put the files in your repository's `policy` folder.

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
image = "registry.acme.example/luft/acme:1-pilot"  # the image to follow, in place of the channel

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

## What each key does

| Keys | On the computer |
| --- | --- |
| `organization` | Settings says "Managed by" and the name |
| `screen-lock` | The screen locks and turns off as decided, and people can't change it |
| `updates` | Updates are checked for, downloaded and staged as decided. A computer on another channel, or following another image than `image`, moves to it at its next check, keeping its standard or NVIDIA image. It only moves to an image it already requires a signature for, such as [your own](/organizations/your-own-luft/). |
| `firewall` | With `home-networks` off, no network counts as home. With `public-access` off, what's allowed everywhere only opens on home networks. With `open-ports` off, ports opened for services stay closed. |
| `software` | Adding system packages or software sources is refused, and apps only install from the sources listed. What was added earlier stays. |
| `developer` | Developer tools is on or off, and stays that way |
| `extensions` | Only extensions from the store run |
| `encryption` | Turning encryption off is refused. A computer whose TPM unlocks the disk encrypts itself, with a recovery key an administrator can show in Settings; one without such a TPM needs someone to turn encryption on in Settings. |
| `accounts` | Nobody adds accounts or makes administrators, and the login screen doesn't sign anyone in by itself |
| `remote-login` | Remote login, or signing in to it with a password, is off and stays off |
| `nearby-sharing` | Who can find the computer in Post |
| `crash-reports` | Reports are always or never sent, and nobody is asked |

## What a policy can't stop

Two keys are conveniences rather than locks. AccountsService asks for one permission to add, remove and change other people's accounts, so either `accounts` key denies all three there; and root, which administrators can become, adds accounts with `useradd` regardless. `software.app-sources` is kept by Schelf, the install window and the `schelf` command, but each person can install apps into their own account without them, with `flatpak --user` or by running an AppImage, since nothing in the system stands between a person and their own home folder.

How each service enforces its keys is in [How policy is enforced](/developers/system/policy/).
