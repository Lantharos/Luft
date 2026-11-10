# Errors from Luft's services

How a Luft D-Bus service says that a call failed, so apps can show it in the person's language.

## The convention

- An error is named `<interface>.Error.<Kind>`, such as `com.lantharos.Accounts1.Error.Unsynced`. The kind is part of the interface: apps decide what to show by it, so it doesn't change once shipped.
- `NotAuthorized` (polkit said no) and `Failed` (anything without a kind of its own) exist on every service. A service adds a kind whenever an app needs to tell that failure apart: to translate it, to offer a way out, or to ask the person something.
- The message is one plain English sentence the service wrote itself. It's what an app shows when it has no translation for the kind, and it never carries what a tool printed, a system error or a path the person didn't name. Those go to the journal.

## In a service

`luft_dbus::errors!` declares the service's `Error` with its kinds:

```rust
luft_dbus::errors!("com.lantharos.Windows1.Error" {
    DriveOpen,
    NotShutDown,
});
```

Code that returns `anyhow::Result` names a failure by returning the error itself, `Err(Error::DriveOpen("…".to_owned()).into())`, and it keeps its kind on the way out. Any other `anyhow` error becomes `Failed`: with the words of its outermost `context`, `bail!` or `anyhow!` when the service wrote those, and "Something went wrong. Try again." when it's a raw error from a tool or the system. The whole chain is printed to the journal either way. So put what the person should read in `.context("…")` and leave the cause underneath.

`luft_dbus::polkit::authorize(connection, &header, ACTION).await?` answers `NotAuthorized` when polkit refuses.

## In an app

`luft_dbus::error::kind(&error)` gives the kind of a failed call, and `luft_dbus::explain(&error)` its message. Map the kinds the page cares about to translated strings and fall back to the message for the rest.

| Service | Kinds besides `NotAuthorized` and `Failed` |
| --- | --- |
| `com.lantharos.Accounts1` | `Gone`, `Offline`, `Unreadable`, `Unsynced` |
| `com.lantharos.Handwriting1` | `NotInstalled`, `Paused` |
| `com.lantharos.Language1` | `NotInstalled`, `Paused`, `Unreadable` |
| `com.lantharos.Password1` | `InvalidArgs`, `WrongPassword`, `TooWeak` |
| `com.lantharos.Speech1` | `NotInstalled`, `Unsupported`, `NotAllowed`, `UnknownModel` |
| `com.lantharos.Transcription1` | `NotInstalled`, `Unsupported`, `Paused` |
| `com.lantharos.Windows1` | `DriveOpen`, `NotShutDown`, `Gone`, `UnknownChange` |

`NotInstalled` carries the model's id as its message, for the app to offer the download. `TooWeak` carries which rule the new password broke.
