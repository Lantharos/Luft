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
- Until shim trusts Luft's key, the computer starts through Fedora's GRUB ([Adding Luft's Secure Boot key](boot.md#adding-lufts-secure-boot-key)), which has no signed startup image for PCR 11. The first such start asks for the recovery key, and trustd then adds a second TPM token sealed to PCR 4, 7, 8 and 9 as that start measured them: shim, GRUB, the Secure Boot state, every GRUB command with the kernel's command line, and every file GRUB read, so a changed GRUB configuration, command line, kernel or initramfs never unlocks. It's only added when GRUB measured into PCR 8 and 9, never with a TPM PIN, and it's removed once the key is in.
- An optional PIN of 6 to 20 digits makes the TPM also require something you know, with its own guessing lockout.
- Every encrypted disk has a recovery key of 12 words from the [BIP39 English list](../packages/system/recovery-key/README.md): 128 random bits from the kernel's random source plus a 4-bit checksum. The list is English in every language, since the key may be typed before the right keyboard layout is loaded, and plain a to z. The disk's keyslot passphrase is the 12 words in lower case with single spaces. Every word is unique in its first four letters, so four letters are enough and the fields complete the rest, and the checksum catches a wrong word before anything tries the disk. Keys made before the words, 64 letters in groups of eight, keep working everywhere a recovery key is typed, with or without their dashes and in either case. With a TPM, a sealed copy lets Settings show it again after an administrator password.
- Sushi waits for the recovery key, passphrase or PIN for as long as it takes, and a wrong one just asks again. Where only a recovery key opens the disk, Sushi shows 12 numbered slots: four letters complete a word, Space or Tab moves on, Backspace goes back into the previous word, and a whole phrase can be pasted. It says which word isn't on the list, or that one of them isn't right when the checksum doesn't hold, and sends the key only once all 12 words check out. An older key of letters shows in its groups instead, and is sent once all 64 are there. Only a system disk that never shows up ends in the emergency shell.

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

Luft can be encrypted while it's installed, or later from Settings. Install Luft asks right after choosing where Luft goes, and shows the recovery key there. The installer formats Luft's partition as LUKS2 with `trustctl encryption format`, keyed by the recovery key and, without a TPM, a passphrase of at least eight characters, and installs into it. Replacing a Linux system while keeping its files next to Luft can't be encrypted while installing, since those files stay on the same unencrypted partition.

Before the first start, `trustctl encryption seal` links the TPM with the signed policy for the startup image. PCR 7 isn't sealed to what the live system measured, since the live system started through Fedora's shim and GRUB, but to what it measures once Luft's key is in shim: trustd replays the TPM's event log without the authorities shim measured for the live system's loader and adds Luft's key from `MokListRT`, the same replay `tpm before-restart` uses. The recovery key is also sealed to the TPM in `/var/lib/trustd`, inside the encryption, so Settings can show it again and trustd can open the disk for itself, to move it.

If the prediction misses, for example because the firmware measures something the live system didn't, the first start asks once for the recovery key that was just saved, and trustd seals the disk key to what that start measured. From then on it unlocks without a prompt.

Wherever a new recovery key is shown, in Install Luft, Settings and Disks, the next step waits until the key was kept: saved to a USB drive or a file, printed (the print dialog said so), or written down and checked by typing three words the app asks for by number, picked at random.

Settings shows whether the disk is encrypted, its recovery key, and whether the TPM unlocks it. Turning encryption off isn't offered.

### Encrypting an installed Luft

Settings, under **Device encryption**, encrypts an unencrypted Luft in place, with `EncryptSystemDisk`. It needs Luft's own btrfs partition (the Luft root partition type), the computer plugged in, a recovery key and, without a TPM that can unlock it, a passphrase of at least eight characters.

- **Before the restart.** trustd shrinks the btrfs by the 32 MB the LUKS2 header needs, while it's mounted. It keeps the recovery key and passphrase as systemd credentials in `luft-encrypting` at the top of the btrfs, sealed to the TPM when there is one, and marks the request in the EFI variable `EncryptingSystemDisk`, which holds the partition's PARTUUID. With a TPM, `EncryptingSystemDiskKey` holds another copy of the recovery key, sealed to PCR 7. Until the restart, **Don't encrypt** takes all of it back and grows the btrfs again.
- **At the restart.** `trustd-encrypt.service` runs in the startup image only while `EncryptingSystemDisk` exists. While the partition is still plain, it reads the request, starts the encryption with `cryptsetup reencrypt --encrypt --init-only --reduce-device-size 32M`, and opens the partition as `root` through `systemd-cryptsetup`, so the volume key is measured into PCR 15 as at every later start. The startup then mounts Luft from the opened partition as usual.
- **While it encrypts.** trustd carries on with `cryptsetup reencrypt --resume-only` in the background, at the lowest priority, the same way Disks encrypts other drives, and pauses while the computer is on battery. Settings shows how far it is. LUKS2 allows no new keyslots or tokens until it's done, so the recovery key is the only key. With a TPM, `trustd-encrypt.service` opens the partition at each restart with the copy in `EncryptingSystemDiskKey`; without one, the startup asks for the recovery key. Moving or resizing Luft waits until it's done.
- **Once it's done.** trustd deletes `EncryptingSystemDiskKey` first, so the copy sealed to PCR 7 alone never outlives the encrypting. It then adds the recovery key's token and the passphrase, keeps the recovery key sealed to the TPM in `/var/lib/trustd` and links the TPM with the signed policy, as after installing, and deletes the request and `EncryptingSystemDisk`. The first restart measures the volume key into PCR 15 for the first time, so Luft Keyring asks for your password once.

The old blocks are encrypted where they are. A drive that keeps copies of blocks after they're rewritten, as SSDs can, may still hold earlier unencrypted data, as with any encryption that starts after the data is written.

### Moving the encrypted system

When Meet Luft asks Luft to change its size and Luft has to move to a new partition, the new partition gets a copy of the system disk's LUKS2 header (see [Meet Luft](meet.md#an-encrypted-luft)). Both containers then use the same volume key and the same keyslots, only while btrfs moves the files across:

- No key leaves Luft: the header copy holds the keyslots as they are, and the copy is opened with the recovery key the TPM keeps for Luft, which never leaves memory.
- Encrypting different data at different places on two devices with one XTS key reveals nothing more than one disk written over time does.
- The old partition's header is wiped, and the partition trimmed, once btrfs no longer uses it. On a drive that doesn't erase trimmed blocks, its old contents stay readable to whoever has the volume key until Windows writes over them, the same as blocks freed inside one encrypted disk.
- Both halves carry a `luft-move` token in their LUKS2 header with the btrfs file system's UUID. The startup only opens partitions on the system disk's drive that have the token, and closes one again unless the file system inside has that UUID. A header someone copied onto another partition only opens to noise, since its contents weren't written with the volume key, and the UUID inside the encryption can't be read without it.
- Nothing about a move is kept in firmware variables, so resetting them halfway can't keep Luft from starting.

Moving Luft to another drive ([Boot](boot.md#moving-to-another-drive)) copies the LUKS2 header the same way, but keeps its LUKS UUID, so both drives open with the same keys and the volume key and UUID measured into PCR 15 stay the same. The recovery key, a passphrase, the TPM token and its PIN therefore keep working on the new drive, Luft Keyring keeps unlocking through the TPM, and no new recovery key is made. The TPM token is sealed to the signed startup images and the Secure Boot state, not to the drive. The two copies hold mostly the same files in different places, which reveals no more than one disk written over time, and the old copy's header is erased, and its blocks trimmed, when it's removed. Until then, whoever has the recovery key opens either.

## Other drives

Disks can encrypt other drives in place through `trustd`. Luft's own partition, partitions the system needs, swap, LVM and RAID are refused, also for decrypting and for changing how a drive unlocks.

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

- **Its files.** Nothing from the AppImage runs before the sandbox is up: `squashfuse` from the system mounts the image read-only from outside, and bubblewrap shows it to the app at `/app`. The app gets `/usr` and `/etc` read-only, a private `/tmp` shared by its own windows, a fresh `/proc` and `/dev`, and its own folder, `~/.var/app/APP-ID`, in place of your home folder, with your Downloads folder inside it unless you turned that off in Settings → Apps. Other files reach it only through the document portal: what you pick in the file chooser, which GTK, Qt and Electron apps are made to use, and the files it was opened with. Landlock holds the app to what bubblewrap mounted, read-only where the mount is, so a folder that reaches it some other way, such as through a file descriptor, stays closed.
- **Its connections.** It talks to the session bus through `xdg-dbus-proxy`, which only lets it reach the desktop portal, notifications, the Secret Service and tray icons, the names it declared, and own names under its app ID. The sandbox's `.flatpak-info` lists those names as Flatpak's does, so the Secret portal leaves the app to the Secret Service and libsecret keeps its passwords in Luft Keyring, not in a file locked with the Secret portal: Chromium and Electron look their encryption key up in the Secret Service whichever way they saved it. Wayland comes through a socket Kestrel tags with the app ID, and the app also gets X11, PipeWire and the graphics card. An app with network access shares the computer's network namespace, where Linux keeps abstract sockets, which no mount can hide, so Landlock keeps it from connecting to any abstract socket outside the sandbox, Xwayland's among them. It gets X11 as display 99 instead, through the socket file the sandbox binds and the session's cookies rewritten for that display. X11 apps can see each other's input and windows, so an app that uses X11 is only as isolated as X11 allows.
- **Its identity.** The app ID is the name Schelf gave its menu entry, always a reverse-DNS ID that the bus, Wayland and the portals accept and never one under `com.lantharos`, which Schelf only gives an AppImage when no other installed app uses it. An AppImage whose own desktop entry has no such name, as many don't, gets `org.appimage.<name>`. The sandbox and the bus proxy carry it in a `.flatpak-info`, as Flatpak's do, so the desktop portal, Kestrel and Luft's services treat it like a Flatpak with that ID. Its secrets, permissions and data stay the same from one launch to the next.
- **The kernel.** The sandbox has no capabilities, can't make user namespaces of its own, can't signal a process outside it, and a seccomp filter refuses the kernel keyrings, `ptrace`, `perf_event_open`, memory placement calls and typing into the terminal it was started from.
- **Chromium and Electron.** Chromium's own sandbox needs user namespaces, which the app's sandbox keeps from it, so Luft starts these apps through Zypak, as Flathub does, and the sandbox answers Flatpak's Spawn portal itself. Its renderers and other helpers then start in a sandbox nested in the app's: in the app's user and process namespaces, with the same system call filter and Landlock rules, without network, and with only the system and the app's own files unless the request asks for the display, sound or graphics card. Chromium adds its own system call filter on top. A process started that way never gets more than the app has.
- **More access.** When an app closes within a few seconds of starting, or opens one of the stand-ins the sandbox puts where your USB, HID and serial devices would be, Luft offers to review its access, which opens Schelf's full access confirmation. Settings → Apps can also give it a folder or USB or serial devices, kept in the permission store's `sandbox` table, and take back anything it has.
- **What an app declares.** A Sabine app lists what it needs in its manifest, and Schelf gives it that when you install it, or, for an app that asks to run unsandboxed, full access once you allow it. See [App sandbox](app-sandbox.md).

## Confirming it's you

Some things are sensitive no matter which of your programs asks, because they would show your secrets, cross into a Flatpak app's, or weaken a protection. For those, Luft asks the person at the screen instead of trusting the caller: Kestrel shows a prompt, and your fingerprint or password is checked by `kestrel-authenticate` against the computer's sign-in rules, the same as for passkeys. Like every system prompt in Kestrel, from the firewall's question and polkit's password to the portal's requests, it stays until one of its buttons is picked: clicking elsewhere, Escape and typing don't close it, and for 0.75 seconds after it shows it ignores keys, clicks and taps, so a key held or pressed for something else can't answer it. Tab still reaches the buttons, and Enter or Space picks one after that.

- Managing Luft Keyring in Settings: the access history, apps' own secrets, removing SSH keys or their confirmation, changing the PIN or locking with the screen. Once confirmed, Settings can keep managing for five minutes.
- A sandboxed app reading an item another sandboxed app saved. An app reading your items is asked about once, and can be told to remember the answer. A sandboxed app that reaches the SSH agent is asked about before it signs with any of your keys, also ones added without `ssh-add -c`, and can't lock the keyring, rename its collections, change which one is the default, or add to or delete your passkeys through the Secret Service.

Peek, which lets programs see and use your windows, isn't open to sandboxed apps at all. For programs of yours it asks before they first touch a window you opened yourself, and the answer lasts until that program quits. That keeps an agent from working in your windows without you noticing; it isn't a boundary between your programs, which are all you.

An app that wants to take over the keyboard shortcuts asks too, unless it's one of Luft's own apps: a Wayland window from a program outside a sandbox that runs from where Luft installs its apps, `/usr/lib/sabine/com.lantharos.*`. An app ID, desktop entry or X11 window class never counts, and neither does any X11 window, since every X11 app reaches Kestrel through Xwayland's one connection and can name itself anything. Kestrel remembers the answer for a sandboxed app by its sandbox's app ID and for a Wayland program outside a sandbox by its app, but asks an X11 window every time. Like Peek's prompt, this keeps apps from taking the keyboard unnoticed rather than telling your programs apart.

Kestrel's prompts name an app only by what it can check: a sandboxed app by its sandbox's app ID and that app's name, a program outside a sandbox by the program it runs, or the app whose launcher starts that program. A name, app ID or window class the app chose itself never shows. When nothing can be checked, the prompt says "An app" with the window's title in quotes.

The privacy indicator shows every program that records, whatever it calls itself, with two exceptions it recognizes by the process the sound server saw connect: the dictation Kestrel started itself, run by the process that owns the dictation service's bus name or a program it started, and Settings' input level meter, run by Settings outside a sandbox from `/usr/lib/sabine/com.lantharos.settings`. Its menu names programs that talk to PipeWire directly the same way the prompts do. Programs that use sound through the PulseAudio protocol all reach PipeWire through `pipewire-pulse`, so nothing vouches for them: the indicator always shows them, under the name they gave themselves, marked as not verified, and offers to mute them but not to close them.

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
| `sandbox` | Folders an AppImage's sandbox opens (`folders`, and `read-only-folders`), its devices (`devices`), extra session bus names (`bus`), `no` under `network` when it stays offline, and `no` under `downloads` when it doesn't get your Downloads folder |
| `location`, `devices`, `background`, `notifications` and the portal's others | What apps asked for through the desktop portal |

Kestrel reads the store and tells the compositor which apps have full access and the background clipboard; a change applies to new connections, so the next time the app starts. Settings shows every table under Apps, where any permission can be taken away.

## Passkeys

[Luft Passkeys](../kestrel/passkeys/README.md) makes each private key inside the TPM when there is one, so it never leaves the chip; otherwise the keyring holds it and makes the signature itself. Passkeys never leave the computer and are never marked as backed up. The keyring's Passkeys collection and Kestrel's passkey prompt only answer the program that holds Luft Passkeys' bus name, `com.lantharos.Passkeys`. That keeps Flatpak apps out; a program running as you could take the name while Luft Passkeys isn't running, like it could anything else of yours.

## USB protection while locked

While the screen is locked, and at the login screen, new USB devices wait until you unlock. Devices already connected keep working.

- Keyboards, mice and security keys (HID) and hubs connect right away. For a device with several parts, only those parts connect; storage, network, serial, audio and vendor-specific parts wait. This stops a gadget that poses as a keyboard and a network adapter at once.
- At unlock everything that waited connects, and Kestrel names it in a notification. Each device is then announced again as if just plugged in, so what sets devices up, such as printer setup and `ipp-usb`, sees it connected.
- It uses the kernel's `authorized_default` and `interface_authorized_default` switches per bus, follows logind's lock state, and costs nothing while unlocked. It is not meant to run alongside USBGuard.
- When the service stops, or fails, it lets everything that waited connect, and after a failure systemd starts it again a second later, however often that happens.
- On by default; turning it off in Settings needs an administrator. The choice is kept in `/var/lib/luft-usb-protection`.

## On the network

Luft doesn't answer LLMNR, the old Windows way of looking up names on a local network: anyone on the same network could answer a lookup and pose as another computer to catch sign-ins. Devices on the network are still found by name through mDNS (`name.local`), which Avahi answers.

### Firewall

Every Wi-Fi and wired network is home or public, kept with the network's NetworkManager profile as its `connection.zone` (`home` or `public`), so it moves with the profile. A network nobody chose for counts as public. Install Luft asks about the network the computer is on at the first start, with Home picked, and after that `kestrel-settings` asks in a notification whenever the computer joins a network nobody chose for. Settings → Network → Firewall shows and changes each network.

`luft-firewall` keeps one nftables table, `inet luft`, with an input chain that drops what it doesn't allow. It loads the table before the network comes up, then follows NetworkManager over D-Bus and replaces the whole table in one transaction whenever a network connects, gets new addresses or changes type, so nothing slips through while it changes. It allows:

- On every network: replies to the computer's own connections, loopback, the ICMP and ICMPv6 messages IPv4 and IPv6 need (neighbor discovery, router advertisements, multicast listener queries, packet too big and the other errors), and DHCP and DHCPv6 replies.
- Everything from Tailscale (`tailscale0`) and from the virtual networks the computer hosts: libvirt (`virbr*`), Podman and toolbox (`podman*`, `cni-podman*`), Waydroid (`waydroid*`) and Docker (`docker0`), plus networks NetworkManager shares itself, such as a hotspot.
- On home networks, from addresses inside that network's own ranges only: ping, mDNS, SSDP and WS-Discovery (UDP 5353, 1900 and 3702, and replies sent from those ports to the ports programs send from, 32768 to 60999), which printers, scanners, AirPlay, Chromecast and media servers use to be found, the apps allowed there, Post's port while someone may find the computer, the ports Kestrel's extensions listen on, and the ports opened in Settings for services that run without an app. A connection from outside the network, forwarded by the router, isn't a device on the network and only reaches the apps allowed on public networks too.
- On public networks: only the apps allowed there, and the ports opened on every network.

Public networks get no ping and no mDNS, SSDP or WS-Discovery: answering them would tell everyone in a café or on a hotel network this computer's name and what it offers, and finding printers or casting is something people do at home. When one is needed somewhere else, marking that network as home is the way.

#### Apps

The firewall knows which app every listening socket belongs to. Every app runs in its own systemd unit under the person's `app.slice`: Flatpaks in `app-flatpak-ID-N.scope`, apps Kestrel starts in `app-kestrel-ID-PID.scope`, and other launchers' apps in units named the same way. An app's identity is its Flatpak or desktop app id, taken from that unit's name. A process in any other unit there, such as a shell Tern opened (Tern starts every shell in its own `tern-shell-PID.scope`), a `systemd-run` command or a user service, is a program, known by its name (the first word of its command line, so `python3` or `node`). Luft's own session services in `session.slice`, system services and login sessions are never asked about.

Seven cgroup BPF programs, attached to the root of the cgroup tree, tell the firewall the moment a socket starts listening, without it ever looking: `bind4` and `bind6` note a TCP or UDP socket being bound to a fixed port on an address other than loopback, `post_bind4` and `post_bind6` report it once the bind worked, and `sock_release` reports it closing. `connect4` and `connect6` report a bound socket that connects somewhere as no longer listening, since it only talks to that one address from then on. Browsers pick a random port for each name they look up, so Helium binds a UDP socket on `0.0.0.0` and connects it to the DNS server for every lookup, and closes it a few milliseconds later. Binds to port 0, which the kernel fills in for outgoing connections, and to loopback addresses never count. They only run when a socket is bound, connected or closed, never for a packet. The firewall then reads the binding process's cgroup and command line from `/proc`.

Packets are matched in the kernel against two sets of `socket cgroupv2 level 5 . meta l4proto . th dport`: the cgroup of the app's unit (level 5 is `user.slice/user-UID.slice/user@UID.service/app.slice/UNIT`), the protocol and the port it listens on. nftables looks up the socket a packet is for on the input hook, for TCP listeners and UDP sockets alike, and compares that socket's cgroup at level 5 with the set. `apps_home` holds the sockets of apps allowed on home networks and is checked from the home chain, `apps_anywhere` those allowed on every network. Only the ports an allowed app listens on are in the sets, so another program in the same unit, such as a second server in the same shell, stays out until it is allowed too. The sets hold cgroup paths, which nftables turns into cgroup ids as it loads them, so the firewall reloads them whenever what allowed apps listen on changes, keeping the id of a unit that started again current. Units that are gone are left out before each load.

Once an app has listened for two seconds while a home network is connected, the firewall lists it under `Waiting`, and Kestrel asks the person running it: "App wants to accept connections from other devices on this network", with Don't allow picked. Sockets that close sooner, such as a program checking whether a port is free, never ask. The question is about the app, not a socket: it stays listed when the app stops listening and starts again, until someone answers it or the app quits, and the answer holds for every socket the app opens later, so an app that wasn't allowed is never asked again. The answer is kept in `/var/lib/luft-firewall/apps` for the app id or program name, for every person on the computer. Allow lets devices on home networks connect. Letting devices on public networks connect as well is only offered in Settings → Network → Firewall, and needs an administrator; choosing Home networks or Not allowed there, or answering the question, doesn't. Nothing is asked while only public networks are connected, since allowing an app wouldn't change anything there; the question comes once a home network is. Apps that listen for discovery only, on UDP 5353, 1900 or 3702, aren't asked about either, since those are open on home networks anyway. Scanning apps are among them: SANE's airscan driver listens on 3702 to find scanners that announce themselves with WS-Discovery.

What the firewall knows is listening is kept in `/run/luft-firewall/listeners`, so restarting the service keeps allowed apps reachable; the sockets it learned about before are handed back to the BPF programs, which report them closing as before. Identities come from unit names and command lines, which a program running as the person could imitate: the firewall keeps devices on the network from reaching what nobody chose to share, but it isn't a sandbox for programs already running on the computer. Flatpaks can't change what the firewall allows, since they have no access to the system bus.

#### Post

Post, Kestrel's way of sending files to devices nearby, listens on LocalSend's port 53317 over TCP and hears announcements on it over UDP. The port is part of the firewall's own rules: it opens on home networks while `kestrel-post`, from a unit in Luft's `session.slice`, says with `SetPostOpen` that someone may find the computer, and closes when every person's Post says no one may or its unit is gone. Post never opens on public networks, and Settings → Post says so on one, with a button to mark the network as home. Who gets an answer once a device reaches the port is Post's choice, see [Kestrel](components/kestrel.md#post).

#### Extensions

Extensions that listen for connections name their ports under `[network] listen` in `extension.toml`, and people agree to that when they install the extension. Their helpers run inside Kestrel, so Kestrel hands the firewall the ports of the extensions that are running with `SetExtensionPorts`, whenever that changes and whenever the firewall starts. The firewall only takes these from a caller in a unit of Luft's own `session.slice`, and opens the ports for that unit alone, on home networks only.

#### Ports for services

Services that run without an app, such as a web server or SSH, are system services and never asked about. Settings opens a port for them on home networks; opening or closing one needs an administrator, while the person at the computer can choose a network's type and which apps are allowed. Only Wi-Fi and wired profiles take a type, and a profile kept for certain people only from one of them. A port can also be open on every network, which only [remote login](#remote-login) asks for and which needs an administrator each time. Ports are kept in `/var/lib/luft-firewall/ports`, one per line, followed by `anywhere` when it's open on every network.

The forward and NAT chains other software keeps, such as libvirt's, Podman's and NetworkManager's for sharing, are left alone. Stopping the service leaves the last rules in place. `com.lantharos.Firewall1` serves the networks waiting for a type, the apps waiting for an answer, every app's choice and the open ports to Settings, Install Luft, Kestrel and `kestrel-settings`.

## Remote login

Settings → Security → Remote login lets people sign in to the computer from another device over SSH. It's off on a new computer: `sshd.service` isn't running or wanted at startup, `sshd.socket` isn't either, and the image turns off `systemd-ssh-generator`, which would otherwise make sshd reachable over AF_VSOCK in virtual machines and through `/run/ssh-unix-local/socket`. Off means nothing on the computer waits for SSH connections at all.

`luft-remote-login` owns `com.lantharos.RemoteLogin1`, starts when Settings first asks for it and quits after a minute without calls. It keeps whether remote login is on, the accounts that may sign in and whether passwords are allowed in `/var/lib/luft-remote-login/choices`, one per line (`enabled`, `password-login`, `account NAME`), so every version of the system on the computer sees the same choices and going back to an earlier one can't turn SSH or passwords back on. The firewall keeps the port, and logind the sessions.

- **Whether sshd runs** is decided at every start, and whenever the choices change, by `luft-remote-login-generator`. When remote login is on, it makes `multi-user.target` want `sshd.service`; when it's off, or the choices can't be read, it masks `sshd.service` from `/run/systemd/generator.early`, which comes before `/etc`, so sshd can't start even when an older `/etc` still asks for it. It always masks `sshd.socket` and `sshd@.service`, so sshd only ever runs as `sshd.service`. Nothing about remote login is written to `/etc`.
- **Turning it on** needs an administrator, after a dialog says plainly that anyone with an allowed key can control the computer as that account. It lets the account that turned it on sign in, unless some account already may, opens port 22 on home networks, saves the choice, has systemd run the generator again and starts `sshd.service` with the host keys `sshd-keygen` makes the first time. **Turning it off** saves the choice, has the generator mask sshd, stops it, ends every SSH session through logind and closes the port, going on to the next step even when one fails; the person at the computer may do that without a password.
- **Luft's defaults** are in `/etc/ssh/sshd_config.d/05-luft.conf`, which comes with the image. Fedora's `sshd_config` includes `sshd_config.d/*.conf` first, in order, and sshd keeps the first value it reads for each option, so Luft's file comes before Fedora's `40-redhat-crypto-policies.conf` and `50-redhat.conf` and wins over them, while the crypto policy still decides the algorithms. It allows only keys (no passwords, keyboard-interactive or GSSAPI), refuses RSA keys shorter than 2048 bits, refuses root, allows 4 tries per connection and 30 seconds to sign in, starts turning away new connections once 10 are still signing in, turns off X11 forwarding and ends connections that stopped answering after 3 minutes. OpenSSH's per-source penalties hold back an address that misbehaves: each failed sign-in adds 30 seconds, an account that can't sign in 5 and a connection that never tries 10, and once an address has 15 seconds of penalties sshd refuses it, even with the right key, until they run out, an hour at most.
- **Who can sign in** reaches sshd through `/run/luft-remote-login/sshd.conf`, which `05-luft.conf` includes before its defaults: `AllowUsers` with the accounts allowed, or `DenyUsers *` when there are none, and `PasswordAuthentication yes` once passwords are allowed. `luft-remote-login --write-sshd-config` makes it from the choices each time `sshd.service` starts, through a drop-in in `/usr`, and `luft-remote-login` writes it again and reloads sshd after every change while sshd runs; sessions already running carry on. The image's SELinux module `luft-remote-login.cil` labels the folder `sshd_var_run_t`, since sshd may not read files in `/run` with the default label. Letting an account in needs an administrator; taking it out doesn't. Root and system accounts can't be chosen.
- **Passwords** are a separate switch with a warning of its own and need an administrator every time; keys stay allowed.
- **Public networks** are a separate switch too, with its own warning and an administrator every time: it opens port 22 on every network in the firewall instead of on home networks only.
- **Keys** are each account's own `~/.ssh/authorized_keys`, which needs no administrator. Settings lists the keys there with their type, comment and SHA256 fingerprint, adds one pasted or read from a `.pub` file and removes one by its fingerprint, keeping other lines, such as keys with options added by hand, as they are. Only plain public keys are taken (Ed25519, ECDSA, RSA and their security-key forms), checked by decoding them, and a private key is refused with a hint to add the `.pub` file instead, as is an RSA key shorter than 2048 bits. `luft-remote-login` does this on a thread that has switched to the caller's user and groups, so it can't touch anything in the home folder the account couldn't. `~/.ssh` is made with mode 700 and `authorized_keys` written with mode 600 by replacing it, then both are labelled with `restorecon`, which gives them `ssh_home_t` so sshd may read them with SELinux enforcing.
- **Connecting** shows `ssh account@hostname.local`, which Avahi answers, the computer's current addresses, and its host keys' SHA256 fingerprints for checking the first connection.
- **Signed in now** lists the sessions logind has for the `sshd` service, with the account, the other device's address and when it signed in. Disconnect ends one through logind's `TerminateSession`, which needs no password for the person's own sessions and an administrator for anyone else's.
- **Every sign-in is announced.** `kestrel-settings` follows logind's `SessionNew` and, for each session of the `sshd` service, shows "Signed in over SSH from 192.168.1.20" with the account, in every signed-in person's session. It's urgent, so Do Not Disturb lets it through, and it shows on the lock screen too; its button opens the page.

The unit runs `luft-remote-login` as root with only `CAP_SETUID` and `CAP_SETGID`, writing only to `/var/lib/luft-remote-login`, `/run/luft-remote-login` and `/var/home`, without network access. sshd itself stays Fedora's.

## Service sandboxing

Each of Luft's services runs with only what it needs: a read-only view of the system with write access to its own folders, no network, devices or capabilities it doesn't use, and a filter on the system calls it may make. Services that hand their sandbox on to apps they start, such as cloud drives and Kestrel's settings, or that start containers, keep fewer of these limits so those apps keep working.

`systemd-analyze security` scores how exposed each service is, and `.github/scripts/units/exposure.json` records that score for every service in the repository. The checks fail when a service scores worse than recorded, when a new one has no score yet, or when systemd doesn't understand one of its settings. After hardening a service or adding one, record the new scores with `bun .github/scripts/units/index.ts --update`. The scores depend on the systemd version, so the check runs on Fedora 45, like Luft.
