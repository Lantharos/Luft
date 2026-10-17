# Luft OS

How Luft becomes an installable system: a [bootc](https://bootc-dev.github.io/bootc/) image built on `quay.io/fedora/fedora-bootc:45`, the USB stick that installs it, and VMs to try both. [How Luft fits together](https://docs.luft.computer/developers/architecture/) explains the design, and [docs/boot.md](../docs/boot.md) how a computer starts from it.

| Image | For |
| --- | --- |
| `ghcr.io/lantharos/luft:45` | Any computer |
| `ghcr.io/lantharos/luft:45-nvidia` | NVIDIA graphics, with the driver built for the image's kernel and signed with Luft's key |

CI builds `:45-nightly` and `:45-nightly-nvidia` every night `main` changed, and the USB sticks with them. Pushing a tag such as `v45.20261014` builds and publishes a release as `:45` and `:45-nvidia`.

## Build the image

Podman builds it without root:

```sh
os/image/build.sh                    # localhost/luft:45
os/image/build.sh luft-nvidia        # localhost/luft:45-nvidia
os/image/build.sh luft luft-nvidia   # both
```

The image is put together from parts (Kestrel, the boot and security services, the apps, NVIDIA's driver and so on), each cached by a hash of its sources, so later builds only remake what changed. `LUFT_REBUILD=1` makes them all again. The first build takes about an hour.

Builds sign SushiBoot, the startup image and NVIDIA's driver with the keys in `LUFT_SECUREBOOT_KEY`, `LUFT_SECUREBOOT_CERT` and `LUFT_PCR_KEY` (PEM). Without them they make throwaway keys that every local build and test VM shares. The public halves of the real keys are in `image/keys`.

| Path | Holds |
| --- | --- |
| `image/Containerfile` | The image, put together from the parts |
| `image/parts` | Building the parts |
| `image/stages` | The scripts that put the image together |
| `image/packages` | Fedora packages for building, those added to the image, and the ones left out |
| `image/patches` | Changes to Fedora packages the image rebuilds, such as [bootc](image/patches/bootc/README.md) |
| `image/files` | Files copied into the image as they are |
| `image/startup` | Building and signing the startup image |
| `image/keys` | Luft's public Secure Boot certificate and TPM policy key |

## Build the USB stick

```sh
os/iso/build.sh                                         # from localhost/luft:45 and :45-nvidia
os/iso/build.sh ghcr.io/lantharos/luft:45               # from the published images
os/iso/build.sh localhost/luft:45 standard nvidia       # one image per stick
```

It writes `os/iso/state/luft-VERSION.iso` and its `.sha256`, in a few minutes and without root. The stick starts through Fedora's signed shim and GRUB, carries its images so installing needs no network, and runs the regular desktop when you choose to just try Luft. It also starts as a DVD and from [Ventoy](https://www.ventoy.net).

| Published at [get.luft.computer](https://get.luft.computer/luft-nightly.iso) | Carries |
| --- | --- |
| `luft-nightly.iso`, `luft-latest.iso` | Both images, for any computer |
| `luft-nightly-standard.iso`, `luft-latest-standard.iso` | The image for computers without NVIDIA graphics |
| `luft-nightly-nvidia.iso`, `luft-latest-nvidia.iso` | The NVIDIA image |

The `latest` files appear with the first release. Each version is also published under its own name.

## Try it in a VM

```sh
os/vm/disk.sh                   # install localhost/luft-system:45 (made by build.sh) onto os/vm/state/disk.qcow2
SECURE_BOOT=1 os/vm/run.sh      # start it with Secure Boot and a TPM (HEADLESS=1 for no window)
```

The VM's account is `luft` with the password `luft-vm`. While it runs, `os/vm/control.py` takes screenshots, presses keys and runs commands:

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

[docs/hardware-testing.md](../docs/hardware-testing.md) lists what to check on a real computer.
