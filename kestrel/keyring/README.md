# Luft Keyring

Luft Keyring keeps your passwords, tokens and keys. Apps reach it the same way they reached GNOME Keyring, through the Secret Service on the session bus and the Secret portal for sandboxed apps, so they keep working without changes. Signing in unlocks it, including with a fingerprint, and you are never asked for a second password or PIN when the computer can vouch for you on its own.

| Part | What it is |
| --- | --- |
| `daemon` | `luft-keyring`, the keyring itself, running in your session |
| `unlock` | `luft-keyring-unlock`, a small system service that holds the security chip |
| `pam` | `pam_luft_keyring.so`, which tells the unlock service that a sign-in succeeded |
| `vault` | The encrypted file format, shared by everything that stores data in the keyring |
| `wire` | The messages the three programs exchange |
| `data` | Units, D-Bus and portal files, and the sign-in rules |
| `tools` | Installing, switching over, and the tests |

## How your secrets are protected

Everything lives in one file, `~/.local/share/luft-keyring/vault`. Its contents, including the names of items and which apps use them, are encrypted with XChaCha20-Poly1305 under a random 256-bit master key. The master key itself is never written anywhere in the clear. Instead the file carries it wrapped twice:

- **By your password.** The sign-in password goes through Argon2id (64 MiB, three passes) and the result wraps the master key. This wrap always exists, so your password always opens the keyring, on any machine and whatever happens to the security chip.
- **By the security chip.** On a computer with a TPM 2.0, a second random key wraps the master key too, and that key is sealed inside the chip under a policy tied to PCR 7, which records the Secure Boot state. The chip only releases it while the computer starts the way it did when the key was sealed.

You can add a PIN to the chip's wrap in Settings. The chip then needs the PIN too, and counts wrong guesses with its own dictionary-attack lockout, so a few wrong PINs lock it for a while and the password takes over.

While the keyring is unlocked, the master key sits on a memory page that is locked into RAM, left out of core dumps and wiped on fork, and the daemon can't be traced or dumped by other processes. Locking wipes the key and every secret from memory; only item names stay so apps can still find what they need and ask to unlock it. Locking with the screen is off by default and can be turned on in Settings.

There is also an access history, `~/.local/share/luft-keyring/audit`, with each entry encrypted on its own under a key derived from the master key.

## Unlocking when you sign in

Signing in or unlocking the screen runs the system's normal sign-in rules first, a password, a fingerprint, or whatever else is set up. Only after they succeed does anything touch the keyring:

1. `pam_luft_keyring.so` sits in the `greetd` rules of the login screen and in `kestrel-unlock` and `kestrel-unlock-fingerprint`, the lock screen's rules. It runs as root, keeps the password for a moment if one was typed, and when the sign-in has succeeded (in `pam_setcred`, which only runs after authentication) it tells the unlock service on `/run/luft-keyring/unlock`.
2. The unlock service accepts that only from root. It unseals the chip's key and hands it, together with the password if there was one, to your keyring.
3. It hands it only to your own `luft-keyring`: a process of your account, running the installed root-owned binary, inside your user manager's `luft-keyring.service`, not being traced and not started with preloaded libraries. The check uses the peer's pidfd so a recycled process ID can't be mistaken for it.
4. The keyring opens the master key with what it got. A password sign-in also checks the password wrap and rewraps it when your password changed.

The lock screen asks for the password and listens for a fingerprint at the same time, each in its own conversation, so you never wait for one to type the other. When there's nothing the chip can vouch for, the keyring asks once with a calm prompt instead of staying locked:

- **No usable security chip** (none, TPM 1.2, turned off in the firmware, failing its self-test, or no SHA-256 PCR bank). The keyring works exactly like GNOME Keyring: your password unlocks it at sign-in. After a fingerprint-only sign-in it asks for the password once. Fingerprint unlock and chip-held SSH keys are off, and Settings says why.
- **The startup changed** (a Secure Boot key or revocation list was updated, the chip was cleared, or the chip went away). The chip refuses to unseal, the password wrap opens the keyring, and as soon as it's open the keyring seals a fresh key for the new state. The next fingerprint works again.
- **A PIN is set.** After a fingerprint the keyring asks for the PIN; after too many wrong PINs it asks for the password.

Automatic login never unlocks the keyring, because nobody signed in. The first app that needs a secret brings up the prompt.

### Why PCR 7 alone

The keyring isn't your disk: when the chip refuses, the cost is typing your password once, not a recovery key. PCR 7 changes only when Secure Boot itself changes, so kernel and boot loader updates don't cost even that, while booting another distribution's chain, turning Secure Boot off, or enrolling new keys does. Binding PCR 4, 8, 9 or 11 as well would break on every kernel update on a computer that boots through GRUB. Signed PCR 11 policies and `systemd-pcrlock` avoid that, but they need unified kernel images and a measured-boot setup that this kind of system doesn't have yet. When the disk itself is unlocked with a `systemd-pcrlock` policy, binding the keyring to the same policy is the natural next step.

## What this protects against, and what it doesn't

It protects you when:

- **Someone has your disk, or a copy of it.** The vault is encrypted with a key they can only get from your password, guessed slowly through Argon2id, or from this computer's chip.
- **Someone has the whole powered-off computer and tries an offline attack.** The chip only unseals in the Secure Boot state it was sealed in, and only to root after a successful sign-in; booting another system or changing the Secure Boot setup leaves the chip's key locked.
- **The boot chain is tampered with in a way Secure Boot sees.** Unsigned loaders, disabled Secure Boot, or new keys change PCR 7, and the chip refuses.
- **Another account on the computer is curious.** The unlock service only hands your key to your own keyring, and only after you signed in.
- **An app you didn't allow wants your saved passwords.** It is asked about first, and sandboxed apps can't pretend to be anyone else.

It doesn't protect you when:

- **Someone can sign in as you.** If they know your password, or have your finger, or the computer is unlocked in front of them, they have what you have. That is the point of signing in.
- **Something already runs as you.** Programs outside a sandbox share your account. The keyring checks who is asking, but an app running as you can impersonate another one of your apps, show a fake prompt, or read what you type into it. Treat per-app access for unsandboxed apps as a guard against mistakes and nosy apps, not against malware.
- **Root is compromised on a correctly started computer.** Root can talk to the chip, so it can unseal your key.
- **The Secure Boot chain itself is trusted but abused.** A signed boot loader that lets someone edit the kernel command line, or a signed but vulnerable component, starts with the same PCR 7 value. A boot loader password and a sealed disk close that gap; the keyring alone doesn't.
- **Someone reads memory physically** while the keyring is unlocked, for example with a cold-boot attack. Lock with the screen narrows that window.

## Apps and access

Every request is tied to the app that made it:

- **Sandboxed apps** are recognized by their Flatpak ID, which the sandbox guarantees.
- **Luft apps** are recognized by their `com.lantharos.*` ID.
- **Other apps** are recognized by their launcher entry. Discord started from `discord.desktop` is Discord, whichever folder its updater put the program in this week. The entry has to start that program, either by its path or by its name, the way `/usr/bin/discord` starts `~/.config/discord/app-1.0.160/Discord`, so commands run in a terminal stay themselves instead of becoming the terminal. Apps started some other way are matched to the entry named after their program.
- **Programs without an entry** are recognized by their path, with version numbers in folder names left out, so `app-1.0.160` and `app-1.0.161` are the same app. An AppImage is recognized by the AppImage file rather than the temporary folder it runs from, and a script by its interpreter and the script.

When an app is recognized better than before, for example after it gets a launcher entry, what it saved and the choices you made for it move along without asking.

An app may always use what it saved itself. Anything else needs your permission: the keyring reports those items as locked to that app, and when it asks to unlock them, Kestrel shows "Allow Firefox to use “github.com”?" with the choice to remember it. Choices you remember are kept in the vault, listed in Settings under Apps with access, and can be taken back there.

Items brought in from GNOME Keyring or oo7 don't know who saved them, so they go to the first app that uses them, with two exceptions:

- **Items that name their app** go only to that app. Chromium-based browsers and Electron apps keep their key with an `application` attribute such as `chrome`, `discord` or `slack`, and only an app with that name, by launcher entry, Flatpak ID or program, takes it. Browsers built from Chromium that keep its default name for the key, like Helium, use `chromium`, so any Chromium-based browser can take those. Every other app is asked.
- **Keyring tools never take items.** `secret-tool`, Seahorse and scripts run from a terminal are asked like any other app, so looking around in your keyring doesn't take items away from the apps they belong to. When a keyring tool holds an item that names another app, the keyring hands it back as soon as it opens.

Secrets that sandboxed apps keep through the Secret portal are never shown to other apps. A Flatpak gets the same portal secret it got from GNOME Keyring or oo7, because those items are brought in unchanged and looked up the same way, by the app's ID.

Settings shows which app read, saved, deleted or was refused what, and when.

## Secrets an app keeps for itself

Apps can keep tokens, API keys and account sign-ins that only they can read back, on `com.lantharos.Keyring1.AppSecrets` at `/com/lantharos/Keyring1`:

| Method | Does |
| --- | --- |
| `Store(s name, h secret)` | Reads up to 1 MiB from the file descriptor and keeps it under the name |
| `Load(s name, h output) → b` | Writes the secret to the file descriptor; false when there is none |
| `Delete(s name) → b` | Removes it |
| `List() → as` | The names the app has kept |

Secrets travel through file descriptors so they never appear on the bus. They are filed under the caller's identity and no other app can see them, not even with your permission: a different app is simply told there is nothing there. They're encrypted with everything else, so the security chip protects them whenever it protects the keyring.

Luft apps use them through `luft-app`:

```rust
use luft_app::secrets;

secrets::store("account-token", token.as_bytes())?;
let token = secrets::load("account-token")?;
```

`secrets::register(window)` also gives the app's page `secrets_store`, `secrets_load` and `secrets_delete` bridge commands for text secrets.

## SSH agent

The keyring is an SSH agent on `$XDG_RUNTIME_DIR/luft-keyring/ssh`, and Kestrel points `SSH_AUTH_SOCK` there. Keys added with `ssh-add` are kept in the vault and are there again after you sign in; `ssh-add -c` makes a key ask before each use. Settings can make Ed25519 keys, or ECDSA keys that live inside the security chip and can never be copied off it. A key that asks first shows a Kestrel prompt naming the app, "Allow ssh in Tern to use your SSH key “Laptop”?", and when you have a fingerprint enrolled, touching the reader is the answer. Ed25519 and ECDSA P-256 keys are supported; time-limited keys (`ssh-add -t`) are refused.

## Building on the keyring

The vault crate holds the file format and the data every part of the keyring shares, in `Contents`: Secret Service collections and items, app access rules, apps' own secrets, SSH keys and preferences. A new kind of data gets its own place there and its own module and D-Bus interface in the daemon, next to `ssh` and `manage`. Passkeys work this way: they live in a collection only Luft Passkeys may use, with the `passkeys` module answering it. The daemon offers what such a module needs:

- `Daemon::ensure_unlocked` unlocks the keyring, prompting when needed.
- `Keyring::edit` changes the contents and saves the vault, and `Keyring::record` adds to the access history.
- `identity` tells which app is asking.
- `prompter` shows Kestrel's prompts, and `unlocking::authenticate` asks for a fingerprint through the lock screen's sign-in rules, so the check is made by root, not by the keyring.
- `unlocking::link` creates and uses keys that live in the security chip.

## Bringing in GNOME Keyring and oo7

The first time the keyring is opened with your password it reads every keyring in `~/.local/share/keyrings`, GNOME Keyring's own files and oo7's `v1` files, and copies their items in with their labels, attributes and dates. When two files hold the same item, the most recently changed file wins. A keyring that was locked with a different password is listed in Settings, where you can bring it in with its own password. The old files are only read, never changed or removed.

## Installing and switching over

`kestrel/tools/install.sh install` builds the keyring with Kestrel (it needs `tpm2-tss-devel` to build) and installs:

- `luft-keyring` and `luft-keyring-unlock` in `/opt/kestrel/libexec`
- `pam_luft_keyring.so` in `/usr/local/lib64/security`
- the unlock service's socket and unit in `/usr/local/lib/systemd/system`
- the lock screen's `kestrel-unlock` and `kestrel-unlock-fingerprint` sign-in rules in `/etc/pam.d`

At that point nothing has changed yet. To make Luft Keyring your keyring, read through `kestrel/keyring/tools/switch.sh` and run:

```bash
kestrel/keyring/tools/switch.sh on
```

It asks for your password through `sudo` and then:

1. Installs the keyring's user units, its D-Bus activation files and its portal.
2. Keeps GNOME Keyring's autostart entries out of Kestrel sessions.
3. Puts the login screen's `greetd` sign-in rules in `/etc/pam.d/greetd`, which replace the packaged ones in `/usr/lib/pam.d/greetd` without `pam_gnome_keyring` and `pam_oo7`, keeping any earlier `/etc/pam.d/greetd` as `/etc/pam.d/greetd.before-luft-keyring`.
4. Adds a small SELinux module that lets the login screen reach the unlock service's socket and nothing more.
5. Turns on fingerprint sign-in through `authselect enable-feature with-fingerprint`, which makes `sudo`, polkit and the login screen offer a fingerprint whenever one is enrolled; the password always stays available.
6. Starts the unlock service.

Sign out and sign in with your password once; that brings in your old keyrings and seals the keyring to the security chip. From then on a fingerprint unlocks everything. When you're happy with it, the oo7 and GNOME Keyring sign-in pieces can go:

```bash
sudo dnf remove pam_oo7 oo7-portal oo7-daemon gnome-keyring-pam
```

`gnome-keyring` itself stays installed but idle in Kestrel. `security/scripts/remove-grub-and-gnome.sh` removes it together with the other GNOME services Kestrel replaces; `NetworkManager-vpnc-gnome` goes with it, and niri loses its keyring.

To go back, `kestrel/keyring/tools/switch.sh off` restores the previous login rules, removes the keyring's activation files and SELinux module, and stops the unlock service. GNOME Keyring takes over again after you sign out and back in, with its own files exactly as they were. Your Luft Keyring stays in `~/.local/share/luft-keyring`.

## Testing

- `cargo test` covers the vault format and, against a throwaway `swtpm`, sealing, PIN lockout, Secure Boot changes and chip-held signing keys.
- `dbus-run-session -- python3 tools/session/session.py target/debug/luft-keyring` runs the keyring on a private session bus with a scratch home and a stand-in for Kestrel's prompts. It runs in its own user and mount namespace where `/run` holds nothing but your runtime folder, so the keyring under test never reaches the computer's unlock service, sign-in checks or fingerprint reader. It brings in keyrings made by real GNOME Keyring and oo7, then checks `secret-tool`, per-app access, locking, apps' own secrets, the portal and the SSH agent with `ssh-add` and `ssh-keygen -Y sign`, and that apps keep their items when they update, move or run as AppImages. Apps started from a launcher entry run in scopes of your user manager through `systemd-run --user`.
- `tools/vm/build.sh` builds a small Fedora machine with the keyring, the lock screen's authentication service and a stand-in fingerprint reader. `tools/vm/run.sh tpm` then signs in through greetd with a password and with a fingerprint against a software TPM, unlocks through the lock screen's socket, uses `sudo`, changes the Secure Boot state, and sets and uses a PIN. `run.sh gone` boots the same disk without the chip and `run.sh none` starts fresh without one. SELinux is enforcing throughout and every denial fails the run.
