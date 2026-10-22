# Images and downloads

What CI publishes from [os](../os/README.md): the system images and the USB sticks made from them.

## Images

| Image | For |
| --- | --- |
| `ghcr.io/lantharos/luft:1` | Any computer |
| `ghcr.io/lantharos/luft:1-nvidia` | NVIDIA graphics, with the driver built for the image's kernel and signed with Luft's key |

Luft's versions start at 1, whatever Fedora release the image is built on. CI builds `:1-nightly` and `:1-nightly-nvidia` every night `main` changed, each also tagged with its version such as `:1.20261020.57`, and the USB stick with them. A release is a nightly that was tested: pushing the tag `v1.20261020.57` moves `:1` and `:1-nvidia` to exactly those images, by digest, without building them again, and makes the release's stick from them. Every image is signed with Luft's key, and the signatures belong to the digest, so they carry over.

## USB sticks

The stick starts through Fedora's signed shim and GRUB, carries its images so installing needs no network, and runs the regular desktop when you choose to just try Luft. It also starts as a DVD and from [Ventoy](https://www.ventoy.net).

| Published at get.luft.computer | Holds |
| --- | --- |
| `nightly/luft-VERSION.iso` | The newest few nightly sticks, such as `luft-1.20261020.57.iso` |
| `1/luft-VERSION.iso` | Releases, from the first one on |
| `…/latest.json` | The newest stick in that folder: its `name`, `version`, `size` and `sha256` |
| `nightly/notes/VERSION.json` | What changed in that nightly since the one before it |
| `1/notes/VERSION.json` | What changed in that release since the one before it: every nightly in between |
| `meet/` | Meet Luft for Windows and Linux |

Each notes file holds the `version`, the `previous` one in its folder and the `notes`, one change per line. When Settings offers an update, it follows `previous` from the offered version back to the installed one and shows everything in between, or the notes in the image's `com.lantharos.release-notes` label when it can't reach get.luft.computer.

Every stick and Meet Luft download has a `.sha256` next to it, and each stick's checksum is signed with minisign in a `.sha256.minisig`, with the stick's file name as the trusted comment. The public key is `RWRz9rCK/H8Drrze/f851hxNNOH/D42kpyTMpXV7DT7QoUdCZySZwRWA`.
