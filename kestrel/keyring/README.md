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

Luft's image carries the keyring. On a regular Fedora install, `kestrel/tools/install.sh install` installs it with Kestrel (building needs `tpm2-tss-devel`), along with its PAM rules, units, its `luft-keyring` group and a small SELinux module. Sign out and in once with your password afterwards to set up the keyring and seal it to the TPM. `kestrel/tools/install.sh remove` leaves your data in place.

## Testing

Run from `kestrel/keyring`:

| Command | Covers |
| --- | --- |
| `cargo test` | Vault format, and TPM sealing, PIN lockout and chip-held keys against `swtpm` |
| `dbus-run-session -- python3 tools/session/session.py target/debug/luft-keyring` | The daemon on a private bus with a scratch home: items, app access (including AppImages and Flatpaks across launches), portal, SSH agent |
| `tools/vm/build.sh`, then `tools/vm/run.sh tpm`, `gone` or `none` | Sign-in, lock screen, `sudo`, Secure Boot changes and PINs in a Fedora VM with SELinux enforcing, with a software TPM, after the TPM is removed, and without one |

Where it keeps its files, how apps are given access, app secrets, the SSH agent and GnuPG are in [the keyring reference](../../docs/components/keyring.md).
