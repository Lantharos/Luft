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

Each request is tied to the app that made it, by its Flatpak or app ID, launcher entry or program path. Luft apps are known by their system-wide install in `/usr/lib/sabine`; a copy in your own Sabine folder counts as any other app. An AppImage counts as the image file it runs from, whichever folder it is mounted at. An app can always use what it saved; anything else asks first, and Settings shows and revokes those choices along with the access history. Tools such as `secret-tool` and Seahorse are asked like any other app. A program that can't be identified is asked every time, and its answer is never remembered.

Only Settings manages the keyring. A debug build of the keyring also lets a Settings build do so when `LUFT_KEYRING_DEVELOPMENT_SETTINGS` names that build's program.

## App secrets

Apps can keep tokens that only they can read back, on `com.lantharos.Keyring1.AppSecrets` at `/com/lantharos/Keyring1`. Secrets travel through file descriptors, never over the bus.

| Method | Does |
| --- | --- |
| `Store(s name, h secret)` | Keeps up to 1 MiB read from the file descriptor |
| `Load(s name, h output) → b` | Writes the secret to the file descriptor; false when there is none |
| `Delete(s name) → b` | Removes it |
| `List() → as` | Names the app has kept |

Luft apps use them through `luft-app`:

```rust
use luft_app::secrets;

secrets::store("account-token", token.as_bytes()).await?;
let token: Option<Vec<u8>> = secrets::load("account-token").await?;
secrets::delete("account-token").await?;
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
