# Passkeys

Luft keeps passkeys on the computer itself, in Luft Keyring, and every browser and app can use them. When a site offers to create a passkey, Kestrel asks first, names the site and the app asking, and you confirm with your fingerprint or your password. Signing in later works the same way.

## How it works

Browsers on Linux already know how to talk to USB security keys, so Luft Passkeys appears to them as one, named Luft Passkeys. That way Chrome, Chromium-based browsers like Helium, Electron apps, the Luft apps on Sabine, and Firefox all work without extensions or changes.

| Part | Runs as | Does |
| --- | --- | --- |
| `luft-passkeys-relay` | root, one copy per connection, no capabilities | Creates the security key the browser sees, only while its owner is the person at the screen, and passes its messages along |
| `luft-passkeys` | you, in your session | Understands what the browser asks (CTAP 2.1), asks Kestrel for your confirmation, and keeps the passkeys in Luft Keyring |
| Luft Keyring | you, in your session | Stores the passkeys in its Passkeys collection and makes every signature |
| Kestrel | you, the desktop | Shows the confirmation prompt; `kestrel-authenticate` checks your fingerprint or password |

The relay starts when `luft-passkeys` connects to `/run/luft-passkeys/relay` and stops when it disconnects. It can only create a device that describes itself as a security key, so it can't be used to type keystrokes or move the pointer. When another person takes over the screen, the device goes away until you're back. Each request names the app that sent it in the prompt; Luft Passkeys finds it by looking at which program has the security key open.

### Where the keys live

With a TPM 2.0 security chip, each passkey's private key is made inside the chip and never leaves it. The keyring keeps only the copy the chip wraps for itself, plus a random secret the chip asks for before it signs, and the chip signs every sign-in. That copy is useless on any other computer, or after the chip is cleared. A missing or disabled chip, a TPM 1.2, or one that fails its self-test counts as no chip.

Without a usable chip, the private key is kept inside the keyring instead, which is encrypted at rest with a key derived from your password, the same way your other saved passwords are. The keyring makes the signature itself, so the key never travels to `luft-passkeys` or the browser. Settings says which of the two protects your passkeys.

In both cases the passkey's details (the site, your account name, when you last used it) are stored inside the encrypted keyring, and only `luft-passkeys` may use the Passkeys collection. Other apps asking the keyring for those items are refused without a prompt.

Passkeys are bound to this computer. They're never marked as backed up or eligible for backup, and each one counts its signatures so a site can notice a copy. The stored record leaves room for syncing through your Luft account later.

### Confirming

Creating a passkey, signing in with one, and letting an app manage them each need you to confirm. When fingers are enrolled, the reader listens as soon as the prompt opens, and "Use password" switches to the password field; without a reader, the prompt asks for your password right away. Both go through `kestrel-authenticate`, the same service the lock screen uses, which only checks the account of whoever asked. If the keyring is locked, the keyring asks to be unlocked first.

When a site has more than one account, you pick it in the same prompt. Silent checks a browser makes before showing anything, like whether a passkey exists, never open a prompt, and never reveal passkeys a site marked as needing verification.

## Browsers

Passkeys support: discoverable credentials, ES256 keys, built-in user verification, `credProtect`, `hmac-secret` (which browsers offer to sites as PRF), and credential management for browsers that can do it with your fingerprint or password.

| | Create | Sign in | Choose an account | PRF | Manage from the browser | Autofill suggestions |
| --- | --- | --- | --- | --- | --- | --- |
| Chrome, Chromium, Helium, Electron, Sabine | Yes | Yes | Yes | Yes | No, Chrome asks for a PIN | No |
| Firefox | Yes | Yes | Yes | Yes | Yes, in `about:webauthn` | No |

Browsers call it a security key, because to them it is one. Linux has no standard way yet for a desktop to offer passkeys the way Windows Hello does: the [Credentials portal](https://github.com/flatpak/xdg-desktop-portal/pull/1889) and [credentialsd](https://github.com/linux-credentials/credentialsd) are still experimental, aren't packaged for Fedora, and don't yet let a desktop plug in its own passkey store. Once they do, the same core can answer there too and browsers will show passkeys as the computer's own, including in autofill.

## Settings

Settings, under Security, lists your passkeys by site with the account and when each was last used. You can rename them, for example to tell two accounts apart, and remove them. It also says whether the security chip or your password protects them.

## Installing

Passkeys need Luft Keyring and Kestrel installed. Build and install them first, then:

```bash
kestrel/passkeys/install.sh install            # build, install into /opt/kestrel, turn on
kestrel/passkeys/install.sh remove             # turn off and take the files away again
```

The script asks for `sudo` to install the relay's systemd socket and service, the session service, and its D-Bus activation file under `/usr/local`, and the two programs into Kestrel's `libexec`. It turns on `luft-passkeys-relay.socket` and the session service for everyone. Removing them leaves your saved passkeys in the keyring, so installing again brings them back.

The relay needs no SELinux policy of its own. systemd runs it like any other system service, and its unit takes away every capability, the network, the home folders, and every device except `/dev/uhid`.

## Development

```bash
cd kestrel/passkeys
cargo test          # the CTAP core, including the CTAP 2.0 specification's example requests
cargo clippy --all-targets -- -D warnings
```

`tools/check` runs real browsers against Luft Passkeys in the Sushi virtual machine, with or without a TPM, against a local page that creates a passkey, signs in with it, and checks the signature with the browser's own crypto. The VM has no fingerprint reader, so a stand-in answers for one.

```bash
export SUSHI_VM=~/.cache/luft-passkeys-vm
boot/sushi/scripts/vm/tree.sh && boot/sushi/scripts/vm/kestrel.sh
kestrel/passkeys/tools/check/prepare.sh && boot/sushi/scripts/vm/disk.sh
kestrel/passkeys/tools/check/run.py --shots docs/screenshots/passkeys            # with a TPM, fingerprint
kestrel/passkeys/tools/check/run.py --no-tpm --password                          # without one, password
```

### Interfaces

| Bus name | Object | Interface | For |
| --- | --- | --- | --- |
| `com.lantharos.Passkeys` | `/com/lantharos/Passkeys1` | `com.lantharos.Passkeys1` | Settings: `List`, `Rename`, `Delete`, the `Protection` and `Ready` properties, and a `Changed` signal |
| `com.lantharos.Kestrel.Passkeys` | `/com/lantharos/Kestrel/Passkeys` | `com.lantharos.Kestrel.Passkeys1` | The confirmation prompt; only `luft-passkeys` may open one |
| `com.lantharos.Keyring1` | `/com/lantharos/Keyring1` | `com.lantharos.Keyring1.Passkeys` | Storage and signing; only `luft-passkeys` may call it |

A prompt opened with `Open(a{sv})` returns its own object. `Next()` waits for what the person does next (`account`, `password`, `confirm` or `cancel`) and replies only to the caller that opened it, so a typed password never crosses the bus as a signal. `Update(s, s)` shows a fingerprint hint, a wrong password, or that the reader stopped, and `Close()` ends it.
