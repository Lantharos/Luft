# How Luft installs

The parts behind installing: the [Install Luft](../apps/setup/README.md) app, its `luft-installer` service and Kestrel's setup mode. The steps people go through are in [Install from a USB stick](https://docs.luft.computer/start/usb-stick/).

## The drive layout

| Partition | Size | Holds |
| --- | --- | --- |
| EFI system partition | 1 GB | Shim, SushiBoot and a signed startup image for each version of Luft. A drive that already has one, such as Windows', shares it when it has 1 GB or more |
| Luft startup | 2 GB, FAT | The signed startup images, when the drive's EFI system partition is smaller than 1 GB, as Windows' usually is. Shim and SushiBoot still go on the EFI system partition, next to Windows' boot files |
| Luft | The rest, btrfs | The system and your files |

Luft starts with UEFI only.

The system is a bootc image from `ghcr.io/lantharos/luft`, or the `-nvidia` variant when the computer has an NVIDIA graphics card. It updates from there.

## The replaced system

Install Luft notes the old system in `/var/lib/luft-installer/old-system.json`, which Disks and Settings use to remove it:

```json
{
  "name": "Fedora Linux 45 (Workstation Edition)",
  "size": 9876543210,
  "subvolume": "old-system",
  "partitions": [],
  "startups": ["EFI/fedora"]
}
```

`subvolume` is the kept system's path from the top of Luft's btrfs, or `null` when nothing was kept; `startups` are its folders on the EFI system partition, which the first sign-in removes with their start entries. Removing deletes the subvolume and anything nested in it.

## Graphics on the stick

The stick runs on the open-source drivers, including nouveau on NVIDIA graphics cards. Nouveau drives cards up to the GeForce RTX 50 series through NVIDIA's own GSP firmware, which the stick carries, so setup looks the same as anywhere else. Installing picks the image with NVIDIA's driver when there's an NVIDIA card. A card newer than the stick's kernel falls back to the firmware's screen, which is slower but enough for setup; the basic graphics mode in the Esc menu does the same on purpose.

## Building the stick's installer

`/usr/lib/luft-installer/install.toml` says what to install:

```toml
# smallest-system = 34359738368       # bytes; drives or spaces below it aren't offered

[images.default]
source = "containers-storage:ghcr.io/lantharos/luft:1"    # where the stick has the image
target = "ghcr.io/lantharos/luft:1"                       # where the installed system gets updates
size = 5286520084                                         # bytes installed, for the progress bar
```

The image ships only the settings above the `[images]` tables. The stick's build adds a table for each image it carries, with the size Podman reports for it. `[images.nvidia]` is used on computers with an NVIDIA graphics card. A stick with a single table installs that image on any computer. Each table's `target` is where the installed system gets its updates: `ghcr.io/lantharos/luft:1` on a release's stick, `:1-nightly` on a nightly's, with `-nvidia` for the NVIDIA image. The image itself doesn't know its channel, so a release can be the same image as the nightly it was tested as.

- The stick ([os/iso](../os/iso)) keeps both images in a read-only image store on the stick, which the session there adds to Podman's storage, so `containers-storage:` sources install without a network. While bootc installs, the installer puts `/var/tmp` on the new drive, where bootc keeps each layer it reads from the store until it's unpacked, so installing needs no room in memory, which is where the live session keeps its changes.
- Its kernel command line has `rd.live.image`, which tells the installer it's on the stick. greetd signs the passwordless `live` account in with `kestrel-session --setup` as its `initial_session`, and polkit allows that account everything, installing included. Install Luft is listed in Start only there.
- Kernel arguments come from the image (`/usr/lib/bootc/kargs.d`), sealed into its startup image.
- The survey hands setup the language, formats, time zone and keyboard layouts Meet Luft noted in `meet.json`, or else those of a Windows on the computer it can read. Setup's first screen starts from them, and from the time zone Fedora's GeoIP service gives once it's online, and only says it guessed what one of them told it.
- Setup switches to the language picked or guessed on its first screen right away: the live account's language changes through AccountsService, so Kestrel follows, and `UseLanguage` makes the installer answer in it too. The installer keeps that choice in `/run/luft-installer/language` across its idle restarts.
- Started from Meet Luft's partition, the live session saves its journal, crashes and hardware details on that partition ([Logs from Try Luft](meet.md#logs-from-try-luft)).
- When the drive's EFI system partition is smaller than 1 GB, the installer adds a 2 GB XBOOTLDR partition (type `bc13c2ff-59e6-4262-a352-b275fd6f7172`, FAT) in front of Luft's, and bootc keeps the startup images and boot entries there. Luft's image carries a bootc with that change ([os/image/patches/bootc](../os/image/patches/bootc)).
- After copying, the installer puts shim and SushiBoot on the EFI system partition with `trustctl startup install`, and, when Secure Boot is on and shim doesn't trust Luft's key yet, queues the key for shim and publishes the code as `SecureBootCode`. A key that's already queued keeps its code when trustd knows it, and is queued again with a new code when it doesn't. First-run setup skips its Secure Boot screen when the key is trusted or queued.
- After copying, the installer writes the locale, keyboard, time zone, host name and the account into the new system, plus `/var/lib/luft-installer/first-boot` with the account's name. It also gives greetd an `initial_session` for the account, so every start until setup is finished goes straight back into setup. While setup is pending, Install Luft enrolls Luft's Secure Boot key and adds fingerprints through the installer rather than asking trustd and fprintd itself, so the account isn't asked for the password it just chose. The installer only does this for the account setup is pending for, signed in at the computer, and only for its programs outside a sandbox. `FinishFirstBoot` takes the `initial_session` out again and removes that file, and only that account may call it. The next start shows the login screen.
- Setup doesn't stay open forever. `luft-installer-expire-setup.service` counts every start while setup is pending, and once the computer has started more than five times or a day has passed since installing, it finishes setup the way `FinishFirstBoot` does, before the login screen appears. The installer stops doing setup's work at the same limits.
- The Wi-Fi networks joined on the stick come along, from `/etc/NetworkManager/system-connections` and `/run/NetworkManager/system-connections`, so the new system connects at its first start. Before the account is made, Install Luft moves passwords that the session's keyring held into NetworkManager itself; the copies are readable by root alone and belong to everyone on the computer.

`kestrel-session --setup` runs Kestrel in setup mode until Install Luft finishes, then starts the normal session. `kestrel-session` does the same on its own when `/var/lib/luft-installer/first-boot` names the person signing in. Setup mode shows the firmware logo while Sushi hands over, fades in the blurred wallpaper with the window, and ends on that same wallpaper, so the desktop takes over without a flash. It runs as `kestrel-setup.target`, which starts the graphical session like the desktop does, so the file chooser and printing work in setup too. Setup mode serves the portal's appearance settings, Luft's palette and the print dialog, so apps in setup look and print like they do on the desktop, and hands the wallpaper to the login screen like the desktop does. The login screen shows Fog when it has no wallpaper for the person. Services that only belong on the desktop, such as notices about the computer, wait for `kestrel-session.target`.
