---
title: How policy is enforced
description: Where each policy key is enforced, how changes reach running services and sessions, and the code that reads policy.
sidebar:
  order: 12
---

The services that own a setting apply what the [policy](/organizations/policy/) decides and refuse calls that would change it, whatever program makes the call, so the `luft` command and scripts are held to it as much as Settings. The files, their folders, which one wins and every key are in [Locking settings with a policy](/organizations/policy/).

## Where each key is enforced

| Keys | Enforced by |
| --- | --- |
| `organization` | Nothing to enforce; Settings shows the name |
| `screen-lock`, `nearby-sharing` | `locksmith`, below, which locks the desktop settings |
| `updates` | `updater`: `Schedule` and `DownloadAutomatically` report the policy's values and the scheduled check follows them. A system on another channel than the policy's moves to it the way [a channel switch](/developers/system/updates/#the-updater) does, waiting until that channel has caught up. A system following another image than `image` moves to it the same way, keeping its standard or NVIDIA image, but only to an image `/etc/containers/policy.json` requires a signature for, such as [an organization's own](/organizations/your-own-luft/). |
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

### Desktop settings, accounts and Kestrel

The screen lock and Post's visibility are desktop settings each person keeps in their own dconf database, so a service can't refuse changes to them. Instead, `locksmith.service` compiles the decided values into the dconf system database `/etc/dconf/db/luft_policy`, with each key locked, and Kestrel's session puts that database right after each person's own, so its values are the ones read and the person's own can't be written. `locksmith.path` runs it again whenever a policy folder changes; it marks the old database as replaced and tells running sessions over the system bus, the way `dconf update` does, so the new values reach them at once.

The same run writes the polkit rule for `accounts` to `/run/polkit-1/rules.d/00-luft-policy.rules`, which polkit reads as soon as it changes, and publishes the whole policy as JSON in `/run/luft/policy/policy.json`, which Kestrel follows for `extensions`.

## In code

`luft-policy` in `packages/policy` reads and merges the files into a typed `Policy`. `Policy::load()` reads this computer's, `Policy::from_folders` any folders, `Policy::explain()` which file decides each value, and `luft_policy::check` reads one file's text or names every problem in it. With the `follow` feature, `Follow` watches both folders, including ones that don't exist yet, and `changed()` waits until the policy really changes and gives the new one; long-running services wait on it next to their other work. Services that exit when idle follow the policy while they run, and `remoted-policy.path` and `trustd-policy.path` start them when a folder changes. Settings and Schelf get the same `Policy` from their `policy` commands and a `policy.changed` or `schelf.policy` event, and pass `locked` to the shared `Row` from `@luft/ui`.
