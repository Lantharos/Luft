# Passkey interfaces

How [Luft Passkeys](../kestrel/passkeys) talks to Settings, Kestrel and Luft Keyring over the session bus.

| Bus name | Object | Interface | For |
| --- | --- | --- | --- |
| `com.lantharos.Passkeys` | `/com/lantharos/Passkeys1` | `com.lantharos.Passkeys1` | Settings: `List`, `Rename`, `Delete`, `Protection` and `Ready` properties, `Changed` signal |
| `com.lantharos.Kestrel.Passkeys` | `/com/lantharos/Kestrel/Passkeys` | `com.lantharos.Kestrel.Passkeys1` | The confirmation prompt, for `luft-passkeys` only |
| `com.lantharos.Keyring1` | `/com/lantharos/Keyring1` | `com.lantharos.Keyring1.Passkeys` | Storage and signing, for `luft-passkeys` only |

Only `luft-passkeys` itself can call `Open(a{sv})` on the prompt interface, and not while the screen is locked. The details name the `purpose` (`register`, `sign-in`, `manage`, `registered` or `choose`), the `accounts`, and optionally the `site`, `site_name`, the `requester`'s process ID and a `fingerprint` hint. It returns the path of a prompt object with `com.lantharos.Kestrel.Passkeys1.Prompt`, which answers only the caller that opened it:

| Method | Does |
| --- | --- |
| `Next() → (s, a{sv})` | Waits for the person's next action: `account` with its `index`, `password` with the `password`, `confirm` or `cancel` |
| `Update(s state, s message)` | Shows `fingerprint-hint` with a message, `fingerprint-unavailable` or `wrong-password` |
| `Close()` | Closes the prompt |
