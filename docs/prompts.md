# Kestrel prompts

Interfaces that let Luft Keyring and GnuPG ask through Kestrel's own dialogs. Both are exported by `com.lantharos.Kestrel` on the session bus. Secrets never cross the bus: they travel through a file descriptor.

## Keyring prompter

`com.lantharos.Kestrel.KeyringPrompter` at `/com/lantharos/Kestrel/KeyringPrompter`. Only the owner of `org.freedesktop.secrets` may call it.

| Method | Arguments | Returns | Asks |
| --- | --- | --- | --- |
| `Access` | `s` handle, `a{sv}` request | `u` response, `a{sv}` results | Whether an app may use something |
| `Password` | `s` handle, `a{sv}` request, `h` secret | `u` response | A password or PIN, written to the pipe `secret` |
| `Close` | `s` handle | | Closes that prompt |

Request keys:

| Key | Type | Used by | Meaning |
| --- | --- | --- | --- |
| `title`, `body` | `s` | both | Text |
| `app` | `s` | both | Desktop ID whose icon is shown |
| `icon` | `s` | both | Symbolic icon when there is no app |
| `allow`, `deny` | `s` | `Access` | Button labels |
| `remember` | `b` | `Access` | Offers Remember for this app; returned in the results |
| `fingerprint` | `b` | both | A fingerprint decides (`Access`), or is offered as an alternative (`Password`) |
| `label` | `s` | `Password` | Field name |
| `warning` | `s` | `Password` | Shown above the field, such as after a wrong password |
| `numeric` | `b` | `Password` | A PIN |
| `confirm` | `b` | `Password` | Second field that must match |
| `continue` | `s` | `Password` | Button label |

- Responses: 0 allowed or entered, 1 declined, 2 closed (by `Close`, the screen locking, or a newer prompt with the same handle).
- After `Password` returns, the dialog stays open until `Close`; calling `Password` again with the same handle and a `warning` asks again in the same dialog.
- One prompt shows at a time, prompts wait while the screen is locked, and handles are separate per caller.

## Pinentry

`com.lantharos.Kestrel.Pinentry` at `/com/lantharos/Kestrel/Pinentry`, used by `luft-pinentry`.

| Method | Arguments | Returns |
| --- | --- | --- |
| `Password` | `s` handle, `a{sv}` request, `h` channel | `u` response, `a{sv}` results (`remember`) |
| `Confirm` | `s` handle, `a{sv}` request | `u` response |
| `Close` | `s` handle | |

- Password requests can also carry `cancel`, `mismatch` (warning when two entries differ), `remember` (offers Save in your keyring) and `quality` (shows GnuPG's passphrase rating while typing).
- Confirmations can carry `alternative`, a third button answered with 3, and `single`, for a message with one button.
- The channel is a socket: Kestrel writes `Q<length>` and the passphrase so far when it needs a rating and reads the rating back as a line, then writes `P<length>` and the passphrase once entered.
