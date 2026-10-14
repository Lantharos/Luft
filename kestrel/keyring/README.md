# Luft Keyring

Luft Keyring keeps your passwords, tokens and keys. Apps use it through the Secret Service and the Secret portal, so they work without changes. Signing in, with a password or a fingerprint, unlocks it. It is also your SSH agent and GnuPG's pinentry.

How secrets are encrypted, unlocked and what that protects against is in [docs/security.md](../../docs/security.md#luft-keyring).

| Part | What it is |
| --- | --- |
| `daemon` | `luft-keyring`, the keyring itself, running in your session |
| `unlock` | `luft-keyring-unlock`, a system service that holds the security chip (TPM) |
| `pam` | `pam_luft_keyring.so`, which tells the unlock service that a sign-in succeeded |
| `vault` | The encrypted file format |
| `wire` | Messages exchanged between the three programs above |
| `pinentry` | `luft-pinentry`, GnuPG's passphrase and PIN prompt |
| `data` | Units, D-Bus, portal, PAM and SELinux files |
| `tools` | Install script and tests |

## Install

Luft's image carries the keyring. On a regular Fedora system it's installed with Kestrel by `kestrel/tools/install.sh install` (building needs `tpm2-tss-devel`), which adds:

- `luft-keyring`, `luft-keyring-unlock` and `luft-pinentry` in `/opt/kestrel/libexec`, and `pam_luft_keyring.so` in `/usr/local/lib64/security`
- the unlock service, and the keyring's user units, D-Bus activation files and portal under `/usr/local`
- the PAM rules `kestrel-unlock`, `kestrel-unlock-fingerprint` and `greetd`, and `authselect`'s `with-fingerprint` feature
- `/etc/gnupg/gpg-agent.conf` pointing at `luft-pinentry`, unless it exists, and a small SELinux module for the login screen

Sign out and in once with your password afterwards; that sets up the keyring and seals it to the TPM. `kestrel/tools/install.sh remove` leaves your data in `~/.local/share/luft-keyring`.

## Files

| Path | Contents |
| --- | --- |
| `~/.local/share/luft-keyring/vault` | All items, encrypted |
| `~/.local/share/luft-keyring/audit` | Access history, encrypted |
| `$XDG_RUNTIME_DIR/luft-keyring/ssh` | SSH agent socket (`SSH_AUTH_SOCK` in Kestrel) |
| `/run/luft-keyring/unlock` | Unlock service socket |

## App access

- Each request is tied to the app that made it: Flatpak ID, `com.lantharos.*` ID, the Sabine app behind a Sabine host, launcher entry, or program path (version numbers in folder names ignored).
- An app can always use what it saved. Anything else asks first ("Allow Firefox to use “github.com”?"), and remembered choices can be revoked in Settings.
- Keyring tools such as `secret-tool` and Seahorse are asked like any other app and never take over items.
- Encrypted drive passphrases are shared between Kestrel's unlock dialog and Disks (GVfs's `gvfs-luks-uuid` attribute).
- Settings shows which app read, saved, deleted or was refused what, and when.

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

secrets::store("account-token", token.as_bytes())?;
let token = secrets::load("account-token")?;
```

`secrets::register(window)` adds `secrets_store`, `secrets_load` and `secrets_delete` commands for the app's page.

## SSH agent

- Keys added with `ssh-add` are kept in the vault. `ssh-add -c` asks before each use; a fingerprint touch can answer.
- Settings creates Ed25519 keys, or ECDSA P-256 keys that live in the TPM and can't be copied.
- Time-limited keys (`ssh-add -t`) are refused.

## GnuPG

`luft-pinentry` asks for GnuPG passphrases and smart card PINs through Kestrel's prompts. Save in your keyring stores the passphrase under the `org.gnupg.Passphrase` schema. Outside Kestrel it hands over to the system `pinentry`.

A `pinentry-program` line in `~/.gnupg/gpg-agent.conf` overrides it; remove the line and run `gpgconf --reload gpg-agent`.

## Testing

Run from `kestrel/keyring`:

| Command | Covers |
| --- | --- |
| `cargo test` | Vault format, and TPM sealing, PIN lockout and chip-held keys against `swtpm` |
| `dbus-run-session -- python3 tools/session/session.py target/debug/luft-keyring` | The daemon on a private bus with a scratch home: items, app access, portal, SSH agent |
| `tools/vm/build.sh`, then `tools/vm/run.sh tpm`, `gone` or `none` | Sign-in, lock screen, `sudo`, Secure Boot changes and PINs in a Fedora VM with SELinux enforcing, with a software TPM, after the TPM is removed, and without one |

## Adding data to the keyring

New kinds of data get their own place in the vault's `Contents` and their own module and D-Bus interface in the daemon, next to `ssh` and `manage`, as [Luft Passkeys](../passkeys/README.md) does. Modules use `Daemon::ensure_unlocked`, `Keyring::edit` and `Keyring::record`, `identity`, `prompter`, and `unlocking::authenticate` and `unlocking::link`.
