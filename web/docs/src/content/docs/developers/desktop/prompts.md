---
title: Kestrel's prompts
description: The D-Bus interfaces through which Luft Keyring, GnuPG, the luft command and Schelf ask through Kestrel's own dialogs.
sidebar:
  order: 6.5
---

Luft Keyring, GnuPG's pinentry, the `luft` command and Schelf's app sandboxes never draw their own dialogs. They ask Kestrel, whose prompts never show on the lock screen. Each interface answers exactly one program, judged by the executable it runs rather than its bus name, since whoever calls chooses the dialog's words and gets what's typed. Secrets never cross the bus: they travel through file descriptors. [Who an app is](/security/identity/) explains how Kestrel tells these programs apart from everything else running as you.

## Keyring prompter

`com.lantharos.Kestrel.KeyringPrompter` at `/com/lantharos/Kestrel/KeyringPrompter` answers only `luft-keyring`: the owner of `org.freedesktop.secrets`, running `/usr/libexec/luft-keyring` with the group that program is installed setgid to. A Kestrel started from a build only checks the bus name, so the keyring checks can stand in for the keyring.

| Method | Arguments | Returns | Asks |
| --- | --- | --- | --- |
| `Access` | `s` handle, `a{sv}` request | `u` response, `a{sv}` results | Whether an app may use something |
| `Password` | `s` handle, `a{sv}` request, `h` secret | `u` response | A password or PIN, written to the pipe `secret` |
| `Close` | `s` handle | | Closes that prompt |

| Key | Type | For | Means |
| --- | --- | --- | --- |
| `title`, `body` | `s` | both | Text |
| `app`, `icon` | `s` | both | The desktop ID whose icon is shown, or a symbolic icon when there's no app |
| `fingerprint` | `b` | both | A fingerprint decides (`Access`), or is offered beside the password (`Password`) |
| `allow`, `deny` | `s` | `Access` | Button labels |
| `remember` | `b` | `Access` | Offers Remember for this app; the answer comes back in the results |
| `label`, `continue` | `s` | `Password` | The field's name and the button's label |
| `warning` | `s` | `Password` | Shown above the field, such as after a wrong password |
| `numeric`, `confirm` | `b` | `Password` | A PIN, and a second field that must match |

The response is 0 when allowed or entered, 1 when declined, and 2 when closed by `Close`, the screen locking, or a newer prompt with the same handle. After `Password` returns, the dialog stays open until `Close`, and calling `Password` again with the same handle and a `warning` asks again in the same dialog. Prompts wait while the screen is locked, and handles are separate per caller.

## Pinentry

`com.lantharos.Kestrel.Pinentry` at `/com/lantharos/Kestrel/Pinentry` answers only `/usr/libexec/luft-pinentry` running outside a sandbox. GnuPG uses it for passphrases and smart card PINs; outside Kestrel, `luft-pinentry` hands over to the system's `pinentry`.

| Method | Arguments | Returns |
| --- | --- | --- |
| `Password` | `s` handle, `a{sv}` request, `h` channel | `u` response, `a{sv}` results with `remember` |
| `Confirm` | `s` handle, `a{sv}` request | `u` response |
| `Close` | `s` handle | |

Password requests can carry `cancel`, `mismatch` for when two entries differ, `remember` to offer saving the passphrase in the keyring under the `org.gnupg.Passphrase` schema, and `quality` to show GnuPG's rating while typing. Confirmations can carry `alternative`, a third button answered with 3, and `single`, for a message with one button. The channel is a socket: Kestrel writes `Q<length>` and the passphrase so far when it needs a rating and reads the rating back as a line, then writes `P<length>` and the passphrase once entered.

## Reviewing changes

`com.lantharos.Kestrel.Changes1` at `/com/lantharos/Kestrel/Changes` shows a set of settings the [`luft` command](/system/terminal/) wants to change, and makes them once approved:

```
Review(a(sv) changes) → (b approved, aa{sv} restore, s requester, s error)
```

It answers only `/usr/bin/luft` from the system image, and refuses with `NotLuft`, `Locked`, `Busy` (another review is open) or `TooMany` (more than five a minute). Kestrel checks every value again against the settings catalogue and reads every current value itself. On approval it makes the system settings in one call to `com.lantharos.Changes1.Apply` on the system bus, which answers only Kestrel and asks polkit for an administrator's password, then the rest with GSettings. `restore` holds what undo puts back. [Who an app is](/security/identity/) explains why a review is shaped this way.

## Drives

`com.lantharos.Kestrel.DriveAccess` at `/com/lantharos/Kestrel/DriveAccess` asks whether a sandboxed app may use a drive it looked for, as [App permissions](/security/app-permissions/#drives-and-folders) describes:

```
Ask(h app, s drive) → (b allowed)
```

`app` is a pidfd of a process in the app's sandbox and `drive` a filesystem UUID. Kestrel judges the app by the sandbox that process is in, while the pidfd holds it, and looks the drive up in UDisks itself, so the asker picks neither the name nor the drive's label and size the prompt shows. It answers only Schelf from the system image running outside a sandbox: `schelf --sandbox` for AppImages and `schelf --watch-drives` for Flatpak apps.

| Error | When |
| --- | --- |
| `NotSchelf` | Something other than Schelf asked |
| `NotSandboxed` | The process isn't in a sandbox |
| `NotInFront` | None of the app's windows is in front, or was in the last ten seconds |
| `Locked` | The screen is locked, or the prompt couldn't be shown |
| `Busy` | Another drive is being asked about |
| `TooMany` | The app was asked about three times in the last minute |
| `Unknown` | No mounted filesystem, or more than one, has that UUID |
| `Closed` | The asker left before an answer |

**Don't allow** is what Enter picks. The answer only says what the person chose; the asker keeps it in the permission store.
