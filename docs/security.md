# Security model

What protects a Luft computer, and against what. The services are [trustd and USB protection](../security/README.md) and [Luft Keyring](../kestrel/keyring/README.md); boot and recovery steps are in [boot.md](boot.md).

## Luft Secure Boot key

- Luft's key is held by the Luft project and signs, in CI, everything that starts the computer: SushiBoot, the startup images and NVIDIA's driver. Its certificate ships in every image, at `/usr/share/luft/secure-boot/luft.der`.
- Shim trusts it once someone confirms it in person on shim's key enrollment screen ([boot.md](boot.md#adding-lufts-secure-boot-key)).
- A second key signs the TPM policy for each startup image. Its public half ships at `/usr/share/luft/secure-boot/pcr-policy.pem`. Keeping it apart means a leaked Secure Boot key alone still can't make a startup image the TPM would unlock the disk for.
- Each startup image names the exact system it belongs to by its composefs digest, and the system's files are checked against it with fs-verity, so a signed image never starts a changed system. Nothing is signed or rebuilt on the computer.
- Shipping a Luft shim with the key built in would remove the one-time enrollment screen, but needs Microsoft's shim review and an HSM-backed CA.

## Image signatures

- Every system image is signed in CI when it's pushed to `ghcr.io/lantharos/luft`, by digest, with Luft's image key (a cosign key pair kept as the repository secrets `COSIGN_PRIVATE_KEY` and `COSIGN_PASSWORD`). The signatures sit next to the image in the registry as sigstore attachments, without a transparency-log entry.
- The public key ships at `/usr/share/pki/containers/luft.pub`. `/etc/containers/policy.json` requires a signature by it for every tag of `ghcr.io/lantharos/luft` and keeps Fedora's defaults for everything else; `/etc/containers/registries.d/luft.yaml` tells the container tools where the signatures are. bootc reads both whenever it fetches the system, so updates, `bootc upgrade` and `bootc switch` refuse an image that isn't signed by the key, and Settings says the update isn't signed by Luft. Install Luft installs from the image on the stick, which the ISO workflow checks against the same key before building the stick.
- The policy arrives with the image, so a computer accepts its first signed image from a version without one, and refuses unsigned ones from then on.
- Anyone can check an image by hand with `cosign verify --key luft.pub --insecure-ignore-tlog=true ghcr.io/lantharos/luft:1-nightly`.

### Changing the image key

The old key has to keep working until every computer has an image that trusts the new one:

1. Make the new key pair with `cosign generate-key-pair` and add `luft-next.pub` next to `luft.pub` in `os/image/files/usr/share/pki/containers`. In `policy.json`, replace `keyPath` with `"keyPaths": ["/usr/share/pki/containers/luft.pub", "/usr/share/pki/containers/luft-next.pub"]`. Keep signing with the old key and publish a few nightlies and a release, so computers learn the new key.
2. Replace the `COSIGN_PRIVATE_KEY` and `COSIGN_PASSWORD` secrets with the new pair. Images are signed with the new key from the next build on.
3. Once computers have moved on, make the new key `luft.pub`, drop the old one and go back to a single `keyPath`.

A leaked key needs the same steps, done as fast as possible, plus re-signing or removing the images it signed. A computer that hasn't updated past step 1 trusts only the old key and has to be moved by hand with `bootc switch`.

## Games with anti-cheat

Epic's Easy Anti-Cheat for Linux, and others like it, only let a game run when the computer can show it started the way its maker intended. Luft meets each of Epic's requirements by default:

| Requirement | How Luft meets it |
| --- | --- |
| Signed kernel and drivers | The kernel is in the signed startup image, Fedora signs its drivers and Luft's key signs NVIDIA's |
| TPM 2.0 | Used when the computer has one |
| Secure Boot with well-known keys only | Only Fedora's shim, Luft's key and shim's own key; any other key added to shim counts against it, since shim trusts those for drivers too |
| Measured startup | The firmware measures shim, SushiBoot and the startup image into PCR 4, shim measures the Secure Boot state and its keys into PCR 7, SushiBoot measures `loader.conf` into PCR 5 and any command line it passes into PCR 12 like systemd-boot, and the startup image's stub measures itself into PCR 11 |
| IOMMU on, without passthrough | `intel_iommu=on iommu.passthrough=0`; AMD's is on by itself |
| Kernel lockdown in integrity mode, set at startup | `lockdown=integrity` |
| kexec turned off at startup | `sysctl.kernel.kexec_load_disabled=1` |
| The BPF security module | Part of Fedora's kernel |

Settings shows "Ready for games with anti-cheat" under Security, or the first thing missing, such as Secure Boot being off in the firmware. Other keys added to shim can be removed from there; shim's blue screen asks to confirm with a one-time code at the next restart. `trustctl anti-cheat` lists every requirement.

Epic's list of well-known keys doesn't include Luft's key, and nothing on the computer changes that; games that check for it start working once Epic adds it.

Secure Boot and the TPM stay optional. With Secure Boot off, SushiBoot starts the kernel without `lockdown=integrity`, so unsigned drivers load and nothing is locked down against the computer's owner; games with anti-cheat just aren't available then. The IOMMU and kexec settings apply either way. Hibernation isn't available while the kernel is locked down; sleep works as usual.

## Disk unlock with the TPM

The TPM releases the disk key only when both match:

| PCR | Measures | Changes when |
| --- | --- | --- |
| 7 | Secure Boot state and the certificates that vouched for what started | Secure Boot is turned off, keys or the forbidden list change, or something else starts |
| 11 | The startup image, through a policy signed by Luft's policy key | Never for a Luft-signed image; the policy only covers the initramfs, so the running system can't release the key |

- Updates to Luft and ordinary firmware updates keep unlocking without a prompt.
- Once the disk is open, its volume key is measured into PCR 15, so anything sealed to the running system later only opens on this disk.
- A new forbidden list or new keys installed while Luft runs, as Settings and fwupd do, are in the firmware before the restart. As the computer shuts down, trustd works out from the TPM's event log what PCR 7 the next start will measure and seals the disk key to that, so the restart unlocks without a prompt. It never does this when the forbidden list lost entries the key was sealed with, since removing revocations is what an attacker would do.
- When PCR 7 changes any other way, Sushi asks for the recovery key once and says why. trustd doesn't follow the change by itself: Settings says the computer starts differently now, and the TPM unlocks by itself again only after an administrator confirms the change there. A TPM with a PIN can't be sealed again without the PIN, so Settings offers to link it again instead.
- An optional PIN of 6 to 20 digits makes the TPM also require something you know, with its own guessing lockout.
- Every encrypted disk has a 64-character recovery key, in groups of eight, from letters that type the same on almost every keyboard. With a TPM, a sealed copy lets Settings show it again after an administrator password.
- Sushi waits for the recovery key, passphrase or PIN for as long as it takes, and a wrong one just asks again. Only a system disk that never shows up ends in the emergency shell.

### Older signed startup images

The policy key's signature over a startup image never expires, so an older Luft image that was signed once still unlocks the disk if someone starts it from the EFI system partition. Rolling back to the version before an update depends on exactly that, so the old image has to keep working for one step back, and only then stop.

What was weighed:

- **systemd-pcrlock** could limit PCR 11 to the images that are installed, keeping the current and the previous one in a policy stored in the TPM. Every update would rewrite that policy before the restart, from a lock file per image, and a policy that doesn't match what starts asks everyone for their recovery key. It also takes over how the TPM token is sealed, so it would replace the signed policy rather than add to it. Too much can go wrong on every update for what it buys.
- **A version counter in the TPM** that images have to be newer than isn't something systemd's TPM token can check, so the startup would need its own unlocking code in place of systemd-cryptsetup's.

The plan instead is to rotate the policy key when an older image has to stop unlocking:

1. A release that fixes something serious is signed with a new policy key, and ships both public halves.
2. Before restarting into it, trustd adds a second TPM token sealed to the new key and keeps the old one, so going back to the version before still unlocks.
3. Once the new version has started and confirmed itself, trustd removes the token for the old key. From then on, images signed with the old key only open the disk with the recovery key.
4. The old private key is destroyed, and its public half leaves the images after the next release.

Until a rotation is needed, every Luft-signed image keeps unlocking the disk.

## Device encryption

Luft is encrypted while it's installed, never afterwards. Install Luft asks right after choosing where Luft goes, and shows the recovery key there. The installer formats Luft's partition as LUKS2 with `trustctl encryption format`, keyed by the recovery key and, without a TPM, a passphrase of at least eight characters, and installs into it. Replacing a Linux system while keeping its files next to Luft can't be encrypted, since those files stay on the same unencrypted partition.

Before the first start, `trustctl encryption seal` links the TPM with the signed policy for the startup image. PCR 7 isn't sealed to what the live system measured, since the live system started through Fedora's shim and GRUB, but to what it measures once Luft's key is in shim: trustd replays the TPM's event log without the authorities shim measured for the live system's loader and adds Luft's key from `MokListRT`, the same replay `tpm before-restart` uses. The recovery key is also sealed to the TPM in `/var/lib/trustd`, inside the encryption, so Settings can show it again and trustd can open the disk for itself, to move it.

If the prediction misses, for example because the firmware measures something the live system didn't, the first start asks once for the recovery key that was just saved, and trustd seals the disk key to what that start measured. From then on it unlocks without a prompt.

Turning encryption on or off on an installed system isn't possible. Settings shows whether the disk is encrypted, its recovery key, and whether the TPM unlocks it.

### Moving the encrypted system

When Meet Luft asks Luft to change its size and Luft has to move to a new partition, the new partition gets a copy of the system disk's LUKS2 header (see [Meet Luft](meet.md#an-encrypted-luft)). Both containers then use the same volume key and the same keyslots, only while btrfs moves the files across:

- No key leaves Luft: the header copy holds the keyslots as they are, and the copy is opened with the recovery key the TPM keeps for Luft, which never leaves memory.
- Encrypting different data at different places on two devices with one XTS key reveals nothing more than one disk written over time does.
- The old partition's header is wiped, and the partition trimmed, once btrfs no longer uses it. On a drive that doesn't erase trimmed blocks, its old contents stay readable to whoever has the volume key until Windows writes over them, the same as blocks freed inside one encrypted disk.
- Both halves carry a `luft-move` token in their LUKS2 header with the btrfs file system's UUID. The startup only opens partitions on the system disk's drive that have the token, and closes one again unless the file system inside has that UUID. A header someone copied onto another partition only opens to noise, since its contents weren't written with the volume key, and the UUID inside the encryption can't be read without it.
- Nothing about a move is kept in firmware variables, so resetting them halfway can't keep Luft from starting.

## Other drives

Disks can encrypt other drives in place through `trustd`. Partitions the system needs, swap, LVM and RAID are refused.

- Room for the 32 MB header comes from free space right after the partition (any file system), shrinking ext2/3/4 while unmounted, or shrinking btrfs while mounted. Otherwise the drive can only be encrypted by formatting it.
- Encryption runs in the background, can be paused, and continues when the drive is unlocked again.
- Every drive gets a recovery key; a passphrase is optional.
- **Unlock automatically on this computer** keeps a random key next to the drive's record in `/var/lib/trustd/drives`, like BitLocker's automatic unlock. It requires Luft to be encrypted, so the drive's key is protected by the TPM-protected disk. `trustd-drives-generator` turns every such record into a `systemd-cryptsetup@` unit at each start and whenever `trustd` changes one, wanted by the drive's device, so the drive unlocks when it's there at startup or plugged in later. The desktop leaves these drives to systemd instead of asking for their passphrase, and Disks unlocks one that was locked by hand with `Unlock` on `com.lantharos.Trust1.Drives`, which any account at the computer may call.
- Removable drives aren't decrypted in place.

## Luft Keyring

- One file, `~/.local/share/luft-keyring/vault`, encrypted with XChaCha20-Poly1305 under a random master key, including item names.
- The master key is wrapped by your password (Argon2id, 64 MiB, three passes), which always works, and, with a TPM 2.0, by a key sealed to PCR 7 and PCR 15. An optional PIN can be added to the TPM wrap.
- Only after the system's sign-in rules succeed does `pam_luft_keyring.so` tell the unlock service, which hands the TPM key only to your own `luft-keyring` (checked by pidfd, installed binary, your user manager's unit, not traced).
- `luft-keyring` is installed setgid to its own `luft-keyring` group. Starting with that group makes the kernel shield it from the first instruction: your other programs can't trace it, read its memory or slip libraries into it, even through a changed unit. The unlock service only answers a keyring that is running with the group, so one started under a debugger or with no new privileges gets no key. systemd gives a user service no new privileges whenever its unit filters system calls or restricts namespaces, address families or memory, so the keyring's unit sets none of those and the keyring locks itself down once it has its group instead.
- Before it reads anything, `luft-keyring` takes no new privileges, refuses memory that is writable and executable or becomes executable later, and installs a seccomp filter for itself. The filter refuses other architectures' system calls, new namespaces, every socket but local ones, realtime scheduling, personality changes, changing its user or group IDs, tracing or reading other processes (`ptrace`, `process_vm_readv`, `pidfd_getfd`, `kcmp`), the kernel keyrings, `bpf`, `perf_event_open`, `userfaultfd`, `io_uring`, mounting, swap, modules, `kexec`, the clock, the host name and rebooting. `/proc/<pid>/status` of a running keyring shows `NoNewPrivs: 1`, `Seccomp: 2` and three filters. Landlock isn't used: a process under Landlock can't look into other processes' sandboxes, which the keyring needs to tell apps apart.
- PCR 7 ties the seal to the Secure Boot state, and PCR 15 to this installation: with device encryption the disk's volume key is measured into it at every start, so another system the firmware would start, even a signed one, can't unseal it. Kernel and Luft updates change neither, so they never cost a password prompt. A changed Secure Boot state means typing your password once.
- Without device encryption, PCR 15 only holds values another system could read off the disk and measure itself, so the seal then rests on Secure Boot alone. Only an encrypted Luft binds it to this computer's own installation.
- While unlocked, the master key sits in locked, non-dumpable memory; locking wipes it and every secret.
- Signing in with a fingerprint unlocks it through the TPM, at the login screen as on the lock screen. Without a TPM, or with a PIN, the keyring asks for the password or PIN once after you sign in.
- Automatic login never unlocks the keyring, with one exception: the session Install Luft signs you into to finish setting up. Install Luft creates your keyring with the password you chose, wrapped a second time by a random one-time key it leaves in `/var/lib/luft-keyring`, readable only by root. Until setup is finished, the unlock service hands that key to your own `luft-keyring` whenever it starts, and the keyring seals itself to the TPM as usual. Finishing setup deletes the key, and a keyring without a TPM then drops that wrap. While it's there, the key is protected like the rest of the disk, by device encryption when it's on.

It protects you when:

- someone has your disk, a copy of it, or the powered-off computer
- the boot chain is changed in a way Secure Boot sees
- another account on the computer, or a sandboxed app you didn't allow, wants your secrets

It doesn't protect you when:

- someone can sign in as you, or uses the computer while it's unlocked
- malware already runs as you (apps outside a sandbox are you; see [Who an app is](#who-an-app-is))
- root is compromised on a correctly started computer
- a trusted but vulnerable signed component is abused
- memory is read physically while unlocked

## Who an app is

Luft only tells apps apart where something an app can't fake vouches for them.

- **Apps in a sandbox are isolated.** Flatpak gives each app's sandbox its app ID, which no app inside a sandbox can change or borrow from another. Kestrel and Luft's services hold sandboxed apps to their sandbox: no background clipboard, no windows kept above others or out of the taskbar, no screen recording or display changes without the portal, none of the shell's private services, and only their own secrets in the keyring.
- **Apps outside a sandbox are you.** Every program you run outside a sandbox has your rights: it can read your files, change another program's settings, start it with a library slipped in, or name itself after any app. So Luft treats all of them as one caller, you, and never trusts a name, path, systemd scope or launcher entry to tell them apart. Secrets you saved are open to them without prompts, the same as your files are, and so are the secrets of sandboxed apps. Programs from system packages and from your Toolbox containers are you too.
- **Sandboxed apps with full access are you too.** Schelf opens a Flatpak's sandbox with a Flatpak override, and Kestrel and Luft's services treat it like an app installed on the system.

Every service judges its callers the same way, from the kernel's view of the D-Bus connection or socket and a pidfd that pins the process while it's looked at. A sandbox marks every process it starts with a `.flatpak-info` file at the root of the process's view of the files, which the process can't remove or change; the app ID in it is the app. A process without one is you. A process that keeps others out of its memory hides its root, so it is you when its mount table, which anyone may read, has nothing mounted at `/.flatpak-info`, and counts as an unknown sandbox otherwise, as does a process that quits while it's looked at. Sandboxed apps reach the session bus only through a filtering proxy that runs in a sandbox of its own with the same marker, so services see the app behind every message, and Wayland only through a socket the compositor tags with the app's ID.

The Rust services, Kestrel's session manager among them, share these rules through the `luft-identity` crate, and Kestrel's compositor applies them to Wayland clients and answers the shell's D-Bus services with `meta_context_identify_sender()`. Both are checked against the same cases in `packages/identity/sandbox-cases.ini`, and read `.flatpak-info` the way GLib reads key files, as Flatpak does.

A program running as you can make a sandbox of its own that names any app, so it can pass as a sandboxed app, but never the other way round: a sandboxed app can't make itself look like you.

## The AppImage sandbox

Schelf starts every AppImage it installs in a sandbox, through `schelf --sandbox APP-ID`, unless you gave it full access.

- **Its files.** Nothing from the AppImage runs before the sandbox is up: `squashfuse` from the system mounts the image read-only from outside, and bubblewrap shows it to the app at `/app`. The app gets `/usr` and `/etc` read-only, a private `/tmp` shared by its own windows, a fresh `/proc` and `/dev`, and its own folder, `~/.var/app/APP-ID`, in place of your home folder. Other files reach it only through the document portal: what you pick in the file chooser, which GTK, Qt and Electron apps are made to use, and the files it was opened with.
- **Its connections.** It talks to the session bus through `xdg-dbus-proxy`, which only lets it reach the desktop portal, notifications, the Secret Service and tray icons, the names it declared, and own names under its app ID. The sandbox's `.flatpak-info` lists those names as Flatpak's does, so the Secret portal leaves the app to the Secret Service and libsecret keeps its passwords in Luft Keyring, not in a file locked with the Secret portal: Chromium and Electron look their encryption key up in the Secret Service whichever way they saved it. Wayland comes through a socket Kestrel tags with the app ID, and the app also gets X11, PipeWire and the graphics card. X11 apps can see each other's input and windows, so an app that uses X11 is only as isolated as X11 allows.
- **Its identity.** The app ID is the name Schelf gave its menu entry, which Schelf only gives an AppImage when no other installed app uses it. The sandbox and the bus proxy carry it in a `.flatpak-info`, as Flatpak's do, so the desktop portal, Kestrel and Luft's services treat it like a Flatpak with that ID. Its secrets, permissions and data stay the same from one launch to the next.
- **The kernel.** The sandbox has no capabilities, can't make user namespaces of its own, and a seccomp filter refuses the kernel keyrings, `ptrace`, `perf_event_open`, memory placement calls and typing into the terminal it was started from.
- **Chromium and Electron.** Chromium's own sandbox needs user namespaces, which the app's sandbox keeps from it, so Luft starts these apps through Zypak, as Flathub does, and the sandbox answers Flatpak's Spawn portal itself. Its renderers and other helpers then start in a sandbox nested in the app's: in the app's user and process namespaces, with the same system call filter, without network, and with only the system and the app's own files unless the request asks for the display, sound or graphics card. Chromium adds its own system call filter on top. A process started that way never gets more than the app has.
- **More access.** When an app closes within a few seconds of starting, or opens one of the stand-ins the sandbox puts where your USB, HID and serial devices would be, Luft offers to review its access, which opens Schelf's full access confirmation. Settings → Apps can also give it a folder or USB or serial devices, kept in the permission store's `sandbox` table, and take back anything it has.
- **What an app declares.** A Sabine app lists what it needs in its manifest, and Schelf gives it that when you install it, or, for an app that asks to run unsandboxed, full access once you allow it. See [App sandbox](app-sandbox.md).

## Confirming it's you

Some things are sensitive no matter which of your programs asks, because they would show your secrets, cross into a Flatpak app's, or weaken a protection. For those, Luft asks the person at the screen instead of trusting the caller: Kestrel shows a prompt, and your fingerprint or password is checked by `kestrel-authenticate` against the computer's sign-in rules, the same as for passkeys.

- Managing Luft Keyring in Settings: the access history, apps' own secrets, removing SSH keys or their confirmation, changing the PIN or locking with the screen. Once confirmed, Settings can keep managing for five minutes.
- A sandboxed app reading an item another sandboxed app saved. An app reading your items is asked about once, and can be told to remember the answer.

Peek, which lets programs see and use your windows, isn't open to sandboxed apps at all. For programs of yours it asks before they first touch a window you opened yourself, and the answer lasts until that program quits. That keeps an agent from working in your windows without you noticing; it isn't a boundary between your programs, which are all you.

Things that aren't sensitive never ask: using what you saved, adding keys, locking the keyring, or making something stricter.

These prompts can't stop malware that already runs as you, which could act on the screen as you do. They stop a program from doing these things quietly, and stop someone at your unlocked computer from opening your passwords.

Two services act on what you ask without a prompt, because there would be nothing to gain from one:

- trustd remembers that a version of Luft started once the login screen or the desktop has been shown for a moment. polkit accepts this from anyone in the session at the screen. The most a program could do with it is keep a broken update from being rolled back automatically, and the previous version stays in the startup menu.
- `kestrel-watchdog` restarts the computer only when the kernel shows the GPU failed or Kestrel's threads stuck in the graphics driver. It accepts reports from you, about your own Kestrel, while your session is on screen; anyone at the screen can restart the computer anyway.

## App permissions

What apps were allowed is kept in one place, the desktop portal's permission store, one table per kind of permission. Flatpak and the AppImage sandbox keep the store out of every sandbox, even for apps allowed into your home folder, so an app can't give itself anything; you can, as can any program you run.

| Table | Holds |
| --- | --- |
| `full-access` | Sandboxed apps that count as you; an AppImage given full access runs without its sandbox |
| `background-clipboard` | Sandboxed apps that may read and set the clipboard while in the background. Kestrel answers yes for 1Password, KeePassXC and Bitwarden whenever they have no answer |
| `keyring-items` | Which saved items a sandboxed app may use, one entry per item |
| `sandbox` | Folders an AppImage's sandbox opens (`folders`, and `read-only-folders`), its devices (`devices`), extra session bus names (`bus`), and `no` under `network` when it stays offline |
| `location`, `devices`, `background`, `notifications` and the portal's others | What apps asked for through the desktop portal |

Kestrel reads the store and tells the compositor which apps have full access and the background clipboard; a change applies to new connections, so the next time the app starts. Settings shows every table under Apps, where any permission can be taken away.

## Passkeys

[Luft Passkeys](../kestrel/passkeys/README.md) makes each private key inside the TPM when there is one, so it never leaves the chip; otherwise the keyring holds it and makes the signature itself. Passkeys never leave the computer and are never marked as backed up. The keyring's Passkeys collection and Kestrel's passkey prompt only answer the program that holds Luft Passkeys' bus name, `com.lantharos.Passkeys`. That keeps Flatpak apps out; a program running as you could take the name while Luft Passkeys isn't running, like it could anything else of yours.

## USB protection while locked

While the screen is locked, and at the login screen, new USB devices wait until you unlock. Devices already connected keep working.

- Keyboards, mice and security keys (HID) and hubs connect right away. For a device with several parts, only those parts connect; storage, network, serial, audio and vendor-specific parts wait. This stops a gadget that poses as a keyboard and a network adapter at once.
- At unlock everything that waited connects, and Kestrel names it in a notification.
- It uses the kernel's `authorized_default` and `interface_authorized_default` switches per bus, follows logind's lock state, and costs nothing while unlocked. It is not meant to run alongside USBGuard.
- On by default; turning it off in Settings needs an administrator. The choice is kept in `/var/lib/luft-usb-protection`.

## Service sandboxing

Each of Luft's services runs with only what it needs: a read-only view of the system with write access to its own folders, no network, devices or capabilities it doesn't use, and a filter on the system calls it may make. Services that hand their sandbox on to apps they start, such as cloud drives and Kestrel's settings, or that start containers, keep fewer of these limits so those apps keep working.

`systemd-analyze security` scores how exposed each service is, and `.github/scripts/units/exposure.json` records that score for every service in the repository. The checks fail when a service scores worse than recorded, when a new one has no score yet, or when systemd doesn't understand one of its settings. After hardening a service or adding one, record the new scores with `bun .github/scripts/units/index.ts --update`. The scores depend on the systemd version, so the check runs on Fedora 45, like Luft.
