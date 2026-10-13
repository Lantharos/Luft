# Luft OS

Luft ships as a [bootc](https://bootc-dev.github.io/bootc/) image built on `quay.io/fedora/fedora-bootc:45`. Every build compiles Kestrel, Luft Keyring and Passkeys, trustd, Sushi and the apps from this repository; the apps and their web runtime are installed for every user, so none of them prepares anything on first launch.

| Image | For |
| --- | --- |
| `ghcr.io/lantharos/luft:45` | Any computer |
| `ghcr.io/lantharos/luft:45-nvidia` | NVIDIA graphics, with the driver built for the image's kernel and signed with the Luft key |

Each build is also tagged with its version, such as `45.20261013.12`.

## Build

```sh
os/image/build.sh               # localhost/luft:45
os/image/build.sh luft-nvidia   # localhost/luft:45-nvidia
```

The NVIDIA image signs its driver with the PEM key and certificate named by `LUFT_SECUREBOOT_KEY` and `LUFT_SECUREBOOT_CERT`, or with a throwaway key when they're not set. The first build downloads Fedora packages, Mutter's source and the web runtime and takes about an hour; later builds reuse what they can.

| Path | Holds |
| --- | --- |
| `image/Containerfile` | The build: one stage each for Kestrel, the boot and security services, and the apps, then the image |
| `image/stages` | The scripts each stage runs |
| `image/packages` | Fedora packages for building, those added to the image, and the GNOME parts Kestrel replaces |
| `image/files` | Files copied into the image as they are |
| `vm` | Trying the image in a virtual machine |

## Try it in a VM

```sh
os/vm/disk.sh      # install localhost/luft:45 onto os/vm/state/disk.qcow2
os/vm/run.sh       # start it in a window (HEADLESS=1 for none)
```

`disk.sh` needs no root: it boots a helper VM from the image, which installs it with `bootc install to-disk` like on a real drive. It adds the account `luft` with the password `luft-vm`, which is also root's. While the VM runs, `os/vm/control.py` takes screenshots, presses keys and runs commands on its serial console:

```sh
os/vm/control.py screenshot login.png
os/vm/control.py shell 'bootc status'
```

With root, Fedora's [bootc-image-builder](https://github.com/osbuild/bootc-image-builder) makes disk images too.

## Install

On a computer already running a bootc system, such as Fedora Atomic:

```sh
sudo bootc switch ghcr.io/lantharos/luft:45
```

Updates arrive with `bootc upgrade`, and `bootc rollback` returns to the previous version.
