# Luft Keyring

Luft Keyring ([kestrel/keyring](../../kestrel/keyring)) keeps passwords, tokens and keys for the Secret Service, the Secret portal, SSH and GnuPG. How secrets are encrypted and unlocked is in [Security](../security.md#luft-keyring).

## Files

| Path | Contents |
| --- | --- |
| `~/.local/share/luft-keyring/vault` | All items, encrypted |
| `~/.local/share/luft-keyring/audit` | Access history, encrypted |
| `$XDG_RUNTIME_DIR/luft-keyring/ssh` | SSH agent socket (`SSH_AUTH_SOCK` in Kestrel) |
| `/run/luft-keyring/unlock` | Unlock service socket |

## App access

The keyring tells apps apart only as [Who an app is](../security.md#who-an-app-is) describes. Programs you run outside a sandbox are all you: they use every item without being asked, including what sandboxed apps saved. A sandboxed app, whether a Flatpak or an AppImage in Schelf's sandbox, is known by its app ID: it uses what it saved without being asked, is asked once before it uses one of your items and can be told to remember the answer, and needs you to confirm with your fingerprint or password before it uses an item another sandboxed app saved. Remembered answers live in the permission store's `keyring-items` table, and Settings shows them under Apps. A sandboxed app whose sandbox can't be read is asked every time, and its answer is never remembered. An app saving an item with the same attributes as one it can't use without asking gets an item of its own instead of replacing it, and a search that finds something the app can use leaves out the matches it would have to ask about. Portal secrets and passkeys stay with the app they belong to. A Flatpak app that may talk to the Secret Service itself doesn't see the Secret portal, so libsecret in it keeps everything in the keyring under its app ID, where both of its ways of saving and searching find it ([os/image/patches/xdg-desktop-portal](../../os/image/patches/xdg-desktop-portal/README.md)).

Managing the keyring, such as reading the access history or removing an SSH key, works only for programs outside a sandbox and asks you to confirm it's you first; after that, the same program can keep managing for five minutes.

## App secrets

Apps can keep tokens of their own, on `com.lantharos.Keyring1.AppSecrets` at `/com/lantharos/Keyring1`. Secrets travel through file descriptors, never over the bus.

| Method | Does |
| --- | --- |
| `Store(s app, s name, h secret)` | Keeps up to 1 MiB read from the file descriptor |
| `Load(s app, s name, h output) → b` | Writes the secret to the file descriptor; false when there is none |
| `Delete(s app, s name) → b` | Removes it |
| `List(s app) → as` | Names the app has kept |

`app` is the caller's app ID. A sandboxed app can only name its own; programs outside a sandbox keep each app's secrets apart by the ID they name, which separates them but doesn't keep one from another, since they are all you.

Luft apps use them through `luft-app`, naming their own app ID:

```rust
use luft_app::secrets;

secrets::store(APP_ID, "account-token", token.as_bytes()).await?;
let token: Option<Vec<u8>> = secrets::load(APP_ID, "account-token").await?;
secrets::delete(APP_ID, "account-token").await?;
```

## SSH agent

- Keys added with `ssh-add` are kept in the vault. `ssh-add -c` asks before each use; a fingerprint touch can answer.
- Settings creates Ed25519 keys, or ECDSA P-256 keys that live in the TPM and can't be copied.
- Time-limited keys (`ssh-add -t`) are refused.

## GnuPG

`luft-pinentry` asks for GnuPG passphrases and smart card PINs through Kestrel's prompts. Save in your keyring stores the passphrase under the `org.gnupg.Passphrase` schema. Outside Kestrel it hands over to the system `pinentry`.

A `pinentry-program` line in `~/.gnupg/gpg-agent.conf` overrides it; remove the line and run `gpgconf --reload gpg-agent`.

## Adding data to the keyring

New kinds of data get their own place in the vault's `Contents` and their own module and D-Bus interface in the daemon, next to `ssh` and `manage`, as [Luft Passkeys](../../kestrel/passkeys/README.md) does.
