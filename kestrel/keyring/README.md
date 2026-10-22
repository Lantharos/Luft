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
| `tools` | Tests |

## Testing

Run from `kestrel/keyring`:

| Command | Covers |
| --- | --- |
| `cargo test -p luft-keyring -p luft-keyring-vault -p luft-keyring-unlock` | Vault format, and TPM sealing, PIN lockout and chip-held keys against `swtpm` |
| `python3 tools/session/session.py ../../target/debug/luft-keyring` | The daemon installed as on Luft, setgid to a group of its own, in a user namespace with a private bus and a scratch home: items, app access from sandboxed apps and from programs of yours, portal, SSH agent |
| `tools/vm/build.sh`, then `tools/vm/run.sh tpm`, `gone` or `none` | Sign-in, lock screen, `sudo`, Secure Boot changes and PINs in a Fedora VM with SELinux enforcing, with a software TPM, after the TPM is removed, and without one |

Where it keeps its files, how apps are given access, app secrets, the SSH agent and GnuPG are in [the keyring reference](../../docs/components/keyring.md).
