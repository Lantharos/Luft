# Images and downloads

What CI publishes from [os](../os/README.md): the system images and the USB sticks made from them.

## Images

| Image | For |
| --- | --- |
| `ghcr.io/lantharos/luft:1` | Any computer |
| `ghcr.io/lantharos/luft:1-nvidia` | NVIDIA graphics, with the driver built for the image's kernel and signed with Luft's key |

Luft's versions start at 1, whatever Fedora release the image is built on. CI builds `:1-nightly` and `:1-nightly-nvidia` every night `main` changed, each also tagged with its version such as `:1.20261020.57-nightly`, and the USB stick with them. Pushing a tag such as `v1.20261101` builds and publishes a release as `:1` and `:1-nvidia`. Every image is signed with Luft's key.

## USB sticks

The stick starts through Fedora's signed shim and GRUB, carries its images so installing needs no network, and runs the regular desktop when you choose to just try Luft. It also starts as a DVD and from [Ventoy](https://www.ventoy.net).

| Published at get.luft.computer | Holds |
| --- | --- |
| `nightly/luft-VERSION.iso` | The newest few nightly sticks, such as `luft-1.20261020.57-nightly.iso` |
| `1/luft-VERSION.iso` | Releases, from the first one on |
| `…/latest.json` | The newest stick in that folder: its `name`, `version`, `size` and `sha256` |
| `meet/` | Meet Luft for Windows and Linux |

Every file has a `.sha256` next to it, and each stick's checksum is signed with minisign in a `.sha256.minisig`, with the stick's file name as the trusted comment. The public key is `RWRz9rCK/H8Drrze/f851hxNNOH/D42kpyTMpXV7DT7QoUdCZySZwRWA`.
