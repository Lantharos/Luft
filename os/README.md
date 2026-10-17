# Luft OS

Luft ships as a [bootc](https://bootc-dev.github.io/bootc/) image built on `quay.io/fedora/fedora-bootc:45`. Every build compiles Kestrel, Luft Keyring and Passkeys, trustd, Sushi and the apps from this repository; the apps and their web runtime are installed for every user, so none of them prepares anything on first launch.

| Image | For |
| --- | --- |
| `ghcr.io/lantharos/luft:45` | Any computer |
| `ghcr.io/lantharos/luft:45-nvidia` | NVIDIA graphics, with the driver built for the image's kernel and signed with the Luft key |

Both play every common audio and video format, including H.264, HEVC and AV1, decoded in hardware on Intel, AMD and NVIDIA graphics. The full FFmpeg, GStreamer's freeworld and ugly plugins and Mesa's freeworld video drivers come from [RPM Fusion](https://rpmfusion.org) while the image is built, as does NVIDIA's driver; installed systems don't use RPM Fusion's repositories and get new versions with each update.

[Helium](https://helium.computer) is the browser: each image carries its AppImage, checked against Helium's signing key, in `/usr/share/luft/preinstall`, and Schelf installs it into each account at the first sign-in, even offline. From then on it's an ordinary app that updates itself from Helium's releases every few hours and can be removed. `image/parts/helium/version` names the release the image carries; a daily workflow moves it to Helium's newest release.

Releases come from tags: pushing `v45.20261014` builds and publishes that version as `:45` and `:45-nvidia`, which installed systems update from, then builds the ISO. Every night, if main changed, CI builds `:45-nightly` and `:45-nightly-nvidia` for testing; switch a test machine with `bootc switch ghcr.io/lantharos/luft:45-nightly`, or install it from the nightly ISO. Each build is also tagged with its version.

## Build

```sh
os/image/build.sh                    # localhost/luft:45
os/image/build.sh luft-nvidia        # localhost/luft:45-nvidia
os/image/build.sh luft luft-nvidia   # both
```

[chunkah](https://github.com/coreos/chunkah) splits the default system into layers by package, so an update only downloads the layers whose packages changed. The NVIDIA image is that system plus the driver, so the two share every layer below it.

Each image is sealed: `image/seal.sh` adds a startup image (kernel, initramfs and command line in one file) that names the image's exact root file system by its composefs digest, signs it for Secure Boot and signs its TPM policy. Builds sign SushiBoot, the startup image and NVIDIA's driver with the keys named by `LUFT_SECUREBOOT_KEY`, `LUFT_SECUREBOOT_CERT` and `LUFT_PCR_KEY` (PEM), and ship the public halves. Without them they make throwaway keys in `os/image/state/keys`. CI signs with the real keys, whose public halves are in `image/keys`. How the computer starts from there is in [docs/boot.md](../docs/boot.md).

The image is put together from parts: Kestrel, the boot and security services, the patched bootc, the web runtime, Helium, the system services, each app and NVIDIA's driver. Each part is an image named after a hash of everything it's built from, so a build only makes the parts whose sources changed; `LUFT_REBUILD=1` makes them all again. The first build downloads Fedora packages, Mutter's source and the web runtime and takes about an hour. Compilers keep their caches in `~/.cache/luft-image`, shared by every checkout, so later builds recompile only what differs.

CI builds each changed part in its own job, all at once, keeps it at `ghcr.io/lantharos/luft-parts` and carries the compiler caches over to the next run. A last job puts both images together, one on top of the other, seals and publishes them. Releases make every part again, as does running the Image workflow by hand with *rebuild*.

| Path | Holds |
| --- | --- |
| `image/Containerfile` | The image, put together from the parts |
| `image/parts` | Building the parts, and the scripts each one runs |
| `image/stages` | The scripts that put the image together |
| `image/packages` | Fedora packages for building, those added to the image, the codecs from RPM Fusion, the GNOME parts Kestrel replaces and the base packages Luft leaves out |
| `image/patches` | Changes to Fedora packages the image rebuilds, such as bootc |
| `image/files` | Files copied into the image as they are |
| `image/startup` | Building and signing the startup image |
| `image/keys` | Luft's public Secure Boot certificate and TPM policy key |
| `iso` | The USB stick |
| `vm` | Trying the image and the stick in a virtual machine |

## USB stick

```sh
os/iso/build.sh                                         # from localhost/luft:45 and :45-nvidia
os/iso/build.sh ghcr.io/lantharos/luft:45               # from the published images
os/iso/build.sh localhost/luft:45 standard nvidia       # the sticks with one image each
```

It writes `os/iso/state/luft-VERSION.iso` and a `.sha256` next to it, in a few minutes and without root. Write it to a stick of 4 GB or more with Fedora Media Writer, or with `sudo dd if=luft-VERSION.iso of=/dev/sdX bs=4M oflag=direct status=progress`; it also starts as a DVD. [docs/hardware-testing.md](../docs/hardware-testing.md) lists what to check on a real computer.

The universal stick carries both images; `standard` and `nvidia` carry one each and come out as `luft-VERSION-standard.iso` and `luft-VERSION-nvidia.iso`. The images share every layer below NVIDIA's driver, and the stick keeps each layer once. CI publishes all three at https://get.luft.lanth.me with a `.sha256` next to each:

| File | Carries |
| --- | --- |
| `luft-latest.iso`, `luft-VERSION.iso` | Both images, for any computer |
| `luft-latest-standard.iso`, `luft-VERSION-standard.iso` | The image for computers without NVIDIA graphics |
| `luft-latest-nvidia.iso`, `luft-VERSION-nvidia.iso` | The NVIDIA image |
| `luft-nightly.iso`, `luft-nightly-standard.iso`, `luft-nightly-nvidia.iso` | The same from the newest nightly image; installs keep following the nightly images |
| `luft-nightly.version` | The nightly build's version |

The stick starts Install Luft through Fedora's signed shim and GRUB; holding Esc shows GRUB's menu. It carries its images, so installing needs no network, and the session on the stick runs the regular image, so choosing *Just try Luft* gives the normal desktop with Install Luft in the launcher.

| Path | Holds |
| --- | --- |
| `iso/live` | What the session on the stick adds to the image: the `live` account, signing it in to setup, and the startup step that builds its root from the stick |
| `iso/stages` | Packing the images and making the ISO |
| `iso/loader` | The boot loader on the stick |

## Try it in a VM

```sh
os/vm/disk.sh                   # install localhost/luft-system:45 onto os/vm/state/disk.qcow2
SECURE_BOOT=1 os/vm/run.sh      # start it with Secure Boot (HEADLESS=1 for no window)
```

`disk.sh` needs no root: it seals the image with a VM account and serial console, then boots a helper VM from it, which installs it with `bootc install to-disk` like on a real drive and puts shim and SushiBoot on the EFI system partition. The account is `luft` with the password `luft-vm`, which is also root's. The VM has a TPM, kept in `os/vm/state/tpm`. While it runs, `os/vm/control.py` takes screenshots, presses keys and runs commands on its serial console:

```sh
os/vm/control.py screenshot login.png
os/vm/control.py shell 'bootc status'
os/vm/control.py enroll-from-disk     # add Luft's key on shim's blue screen at the first start
```

To start the stick instead, with an empty `os/vm/state/target.qcow2` to install onto:

```sh
ISO=os/iso/state/luft-VERSION.iso os/vm/run.sh                 # as a USB stick
ISO=... MEDIA=cd SECURE_BOOT=1 NETWORK=0 os/vm/run.sh          # as a DVD, Secure Boot on, offline
DISK=os/vm/state/target.qcow2 os/vm/run.sh                     # the installed drive afterwards
```

## Install

Luft installs from the USB stick, which formats the system with bootc's composefs backend. Switching an existing ostree-based system, such as Fedora Atomic, with `bootc switch` isn't supported: the sealed startup images need the composefs backend.

Updates arrive with `bootc upgrade` (Settings does it for you), and `bootc rollback` or the Previous versions menu at startup return to the version before.
