---
title: D-Bus interfaces
description: How Luft's services name their errors, and the interfaces Kestrel, Post, the keyring and the password service offer to apps.
sidebar:
  order: 6
---

Luft's services talk to apps over D-Bus, each under a `com.lantharos` name, and the checks hold every copy of an interface to one [source of truth](/developers/testing-vms/#d-bus-interfaces). The interfaces only Luft's own helpers may call are in [Kestrel's prompts](/developers/desktop/prompts/).

## Errors

A failed call says what went wrong in a way apps can show in the person's language.

- An error is named `<interface>.Error.<Kind>`, such as `com.lantharos.Accounts1.Error.Unsynced`. Apps decide what to show by the kind, so a kind doesn't change once shipped.
- `NotAuthorized`, when polkit said no, and `Failed`, for anything without a kind of its own, exist on every service. A service adds a kind whenever an app needs to tell that failure apart: to translate it, to offer a way out, or to ask the person something. `NotInstalled` carries the missing model's id, so the app can offer the download.
- The message is one plain English sentence the service wrote itself, which an app shows when it has no translation for the kind. It never carries what a tool printed, a system error or a path the person didn't name; those go to the journal.

In a service, `luft_dbus::errors!` declares the kinds:

```rust
luft_dbus::errors!("com.lantharos.Windows1.Error" {
    DriveOpen,
    NotShutDown,
});
```

Code that returns `anyhow::Result` names a failure by returning the error itself, `Err(Error::DriveOpen("…".to_owned()).into())`, and it keeps its kind on the way out. Any other error becomes `Failed`, with the words of its outermost `context`, `bail!` or `anyhow!` when the service wrote those, and "Something went wrong. Try again." when it's a raw error from a tool or the system. So put what the person should read in `.context("…")` and leave the cause underneath. `luft_dbus::polkit::authorize` answers `NotAuthorized` by itself.

In an app, `luft_dbus::error::kind(&error)` gives the kind of a failed call and `luft_dbus::explain(&error)` its message. Map the kinds the page cares about to translated strings, and fall back to the message for the rest.

## Kestrel

These are on `com.lantharos.Kestrel` on the session bus. Sandboxed apps may only read `Appearance`, which [Colours and motion](/developers/desktop/colours-and-motion/#reading-the-palette) describes, and make the two calls marked below.

| Interface and path | Does |
| --- | --- |
| `com.lantharos.Kestrel.OpenWindows`, `/com/lantharos/Kestrel/OpenWindows` | `List` returns each app's desktop file ID with the process IDs of its windows; `Changed` follows. Barometer uses it to show apps running in the background |
| `com.lantharos.Kestrel.Share`, `/com/lantharos/Kestrel/Share` | `Send(a(sh) files)` opens the Send sheet for files handed over as names and open file descriptors, where people pick a device nearby or an app. Only the app whose window is in front may call it, sandboxed or not, and at most five sheets a minute |
| `com.lantharos.Kestrel.Sounds`, `/com/lantharos/Kestrel/Sounds` | `Play(s name)` plays a sound of the theme, following the sound switches, at most four a second per caller; sandboxed apps may call it. `Preview` plays regardless of the switches and `Check` says whether a file can be a custom sound, both for Settings |
| `com.lantharos.Kestrel.DriveAccess`, `/com/lantharos/Kestrel/DriveAccess` | `Ask(h app, s drive) → b` asks whether a sandboxed app may use a drive. Only Schelf may call it; [Kestrel's prompts](/developers/desktop/prompts/#drives) has the rules |
| `com.lantharos.Kestrel.Sharing`, `/com/lantharos/Kestrel/Sharing` | `List` returns who sees the screen or sends input now and who may again, `Revoke(s id)` ends one, and `Changed` follows. Settings uses it under Privacy; sandboxed apps can't call it |
| `com.lantharos.Kestrel.Pens`, `/com/lantharos/Kestrel/Pens` | The `Devices` property lists the seat's pens and drawing tablets, each with the `VVVV:PPPP` ID GNOME's tablet settings use, its name, and whether it's a pen on a screen or a separate tablet |

`luft_app::share::send` calls `Share` for a Luft app, handing over the files it holds, so it works from a sandbox.

## Post

`kestrel-post` speaks LocalSend's protocol for [Post](/desktop/post/). D-Bus starts it as `com.lantharos.Kestrel.Post` the first time Kestrel calls it. `/com/lantharos/Kestrel/Post` has the devices nearby, whether it's looking, its name and the folder files go to as properties, and methods to send files or text, answer offers and PINs, cancel, and pair. Kestrel calls `Configure` with what people chose in `com.lantharos.kestrel.post` whenever that changes and whenever `kestrel-post` starts again, and Settings calls `StartPairing` and `StopPairing`. The rest of `kestrel-post` knows nothing of LocalSend, whose parts live in `src/localsend`, so another protocol could sit beside it. [Network](/security/network/) covers who it answers.

## Keyring

`com.lantharos.Keyring1.AppSecrets` at `/com/lantharos/Keyring1` keeps tokens of an app's own, without prompts. Secrets travel through file descriptors, never in the message.

| Method | Does |
| --- | --- |
| `Store(s app, s name, h secret)` | Keeps up to 1 MiB read from the file descriptor |
| `Load(s app, s name, h output) → b` | Writes the secret to the file descriptor; false when there is none |
| `Delete(s app, s name) → b` | Removes it |
| `List(s app) → as` | The names the app has kept |

`app` is the caller's app ID. A sandboxed app can only name its own, so no other sandboxed app reads its secrets. Programs outside a sandbox all run as you, so naming an ID keeps their secrets apart without keeping them from each other ([Who an app is](/security/identity/)). Luft apps use it through `luft_app::secrets`:

```rust
use luft_app::secrets;

secrets::store(APP_ID, "account-token", token.as_bytes()).await?;
let token: Option<Vec<u8>> = secrets::load(APP_ID, "account-token").await?;
secrets::delete(APP_ID, "account-token").await?;
```

A new kind of data for the keyring gets its own place in the vault's `Contents`, and its own module and interface in the daemon next to `ssh` and `manage`.

## Changing a password

`com.lantharos.Password1` at `/com/lantharos/Password1` on the system bus changes the caller's own password, for people in an active session at the computer: `ChangePassword(h current, h new)`, both through file descriptors. It checks the new password against the system's rules, then runs the `kestrel-password` PAM rules, which need the current password and lock Luft Keyring with the new one in the same step. It answers `WrongPassword`, `TooWeak` with the broken rule as its message (`too-short`, `too-similar`, `dictionary-word`, `contains-name`, `too-simple` or `rejected`), or `Failed`.

It runs as `kestrel-password.service`, which D-Bus starts for the call and which quits half a minute later, so the login screen's own settings service has no way to write `/etc`.
