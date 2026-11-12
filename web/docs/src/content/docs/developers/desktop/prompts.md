---
title: Kestrel's prompts
description: The D-Bus interfaces through which Luft Keyring, GnuPG, Luft Passkeys and the luft command ask through Kestrel's own dialogs.
sidebar:
  order: 6.5
---

Luft Keyring, GnuPG's pinentry, Luft Passkeys and the `luft` command never draw their own dialogs. They ask Kestrel, whose prompts never show on the lock screen. Each interface answers exactly one program, judged by the executable it runs rather than its bus name, since whoever calls chooses the dialog's words and gets what's typed. Secrets never cross the bus: they travel through file descriptors. [Who an app is](/security/identity/) explains how Kestrel tells these programs apart from everything else running as you.

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

## Passkeys

| Bus name | Object | Interface | For |
| --- | --- | --- | --- |
| `com.lantharos.Passkeys` | `/com/lantharos/Passkeys1` | `com.lantharos.Passkeys1` | Settings: `List`, `Rename` and `Delete` for programs outside a sandbox, the `Protection` and `Ready` properties, and `Changed` |
| `com.lantharos.Kestrel.Passkeys` | `/com/lantharos/Kestrel/Passkeys` | `com.lantharos.Kestrel.Passkeys1` | The confirmation prompt, for `luft-passkeys` only |
| `com.lantharos.Keyring1` | `/com/lantharos/Keyring1` | `com.lantharos.Keyring1.Passkeys` | Storage and signing, for `luft-passkeys` only |

`Open(a{sv})` on the prompt interface answers only the owner of `com.lantharos.Passkeys` running `/usr/libexec/luft-passkeys` with its setgid group, and not while the screen is locked. The details name the `purpose` (`register`, `sign-in`, `manage`, `registered` or `choose`) and the `accounts`, and can name the `site`, its `site_name`, the `requester`'s process ID and a `fingerprint` hint. It returns a prompt object with `com.lantharos.Kestrel.Passkeys1.Prompt`, which answers only the caller that opened it:

| Method | Does |
| --- | --- |
| `Next() → (s, a{sv})` | Waits for the person's next action: `account` with its `index`, `password` with the `password`, `confirm` or `cancel` |
| `Update(s state, s message)` | Shows `fingerprint-hint` with a message, `fingerprint-unavailable` or `wrong-password` |
| `Close()` | Closes the prompt |

## Reviewing changes

`com.lantharos.Kestrel.Changes1` at `/com/lantharos/Kestrel/Changes` shows a set of settings the [`luft` command](/system/terminal/) wants to change, and makes them once approved:

```
Review(a(sv) changes) → (b approved, aa{sv} restore, s requester, s error)
```

It answers only `/usr/bin/luft` from the system image, and refuses with `NotLuft`, `Locked`, `Busy` (another review is open) or `TooMany` (more than five a minute). Kestrel checks every value again against the settings catalogue and reads every current value itself. On approval it makes the system settings in one call to `com.lantharos.Changes1.Apply` on the system bus, which answers only Kestrel and asks polkit for an administrator's password, then the rest with GSettings. `restore` holds what undo puts back. [Who an app is](/security/identity/) explains why a review is shaped this way.
