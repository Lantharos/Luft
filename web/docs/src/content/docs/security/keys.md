---
title: Keys, signatures and the build
description: Which keys sign what in Luft, what the build trusts, and how downloads are checked.
sidebar:
  order: 1
---

Everything that runs on a Luft computer before the desktop, and the system itself, is signed when it's built and never on the computer. Two keys and one signing identity cover it, each kept apart so that losing one doesn't give away what the others protect.

## The Secure Boot key

Luft's Secure Boot key signs SushiBoot, every startup image and NVIDIA's kernel modules. Its certificate ships in every image as `/usr/share/luft/secure-boot/luft.der`. Shim trusts it once someone at the computer confirms it on shim's key enrollment screen, [the blue screen](/start/first-start/#the-blue-screen) of the first start. Until then the computer starts through Fedora's GRUB, as [Boot and recovery](/developers/system/boot/) describes.

A startup image holds the kernel, the initramfs and the command line in one signed file. The command line names the exact system it belongs to by its composefs digest, and every file of that system is checked against the digest with fs-verity as it's read. A signed startup image therefore never starts a changed system, and there is nothing to sign again when Luft updates: a new version comes with its own startup image.

## The TPM policy key

A second key signs the TPM policy of each startup image, which is what lets the TPM unlock the disk for that image and no other. Keeping it apart from the Secure Boot key means a leaked Secure Boot key alone can't make a startup image the TPM would unlock the disk for. The policy key comes in generations, so older images can be cut off without cutting off the version an update would go back to; [Disk encryption and the TPM](/security/encryption/#older-signed-startup-images) explains how. Each image ships the public half of every generation it's signed with in `/usr/lib/luft/pcr-keys`.

## System images

Every image pushed to `ghcr.io/lantharos/luft` is signed twice, by digest:

- With Luft's image key, a cosign key pair. The public half ships as `/usr/share/pki/containers/luft.pub`, and `/etc/containers/policy.json` requires a signature by it for every tag of `ghcr.io/lantharos/luft`. bootc reads the policy whenever it fetches the system, so updates, `bootc upgrade` and `bootc switch` refuse an image that isn't signed by it, and Settings says the update isn't signed by Luft.
- Without a key, through sigstore: cosign gets a short-lived certificate naming the workflow that built the image, `image.yml` for a nightly or `release.yml` for a release, on `main`, and the signature is recorded in sigstore's public transparency log. Computers don't check this one. It makes every image the workflows ever signed visible to anyone, and an image signed with a stolen image key outside those workflows has no entry.

The policy arrives with the image, so a computer accepts its first signed image from a version that had none, and refuses unsigned ones from then on. Install Luft installs from the image on the USB stick, which is checked against the same key before the stick is built.

To check an image yourself, against the key and against the log:

```sh
cosign verify --insecure-ignore-tlog=true ghcr.io/lantharos/luft:1-nightly \
  --key https://raw.githubusercontent.com/Lantharos/Luft/main/os/image/files/usr/share/pki/containers/luft.pub

cosign verify ghcr.io/lantharos/luft:1-nightly \
  --certificate-identity https://github.com/Lantharos/Luft/.github/workflows/image.yml@refs/heads/main \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

For a release, the identity names `release.yml` instead.

## What the build trusts

- **Fedora.** Each build resolves `quay.io/fedora/fedora-bootc` to a digest once and copies its x86-64 image, unchanged, to `ghcr.io/lantharos/luft-cache`. Every part is built on exactly that copy by digest, so a build run again still finds it after Fedora has dropped it, and the image's `org.opencontainers.image.base.name` label records it. Fedora doesn't sign the base image, so committing the digest would prove nothing more. Packages come from Fedora's and RPM Fusion's repositories with their signatures checked. The two packages Luft patches and rebuilds, bootc and xdg-desktop-portal, come from Koji's signed copies and are checked against Fedora's key before they're unpacked.
- **Tools and downloads.** `os/versions.env` pins Bun by version and checksum, and the images the build runs in by digest. CEF is pinned in `os/image/parts/cef.lock` by version and SHA-256. Helium is checked against its publisher's signature, the cursors against a committed checksum, Zypak is fetched at a commit and Sabine at a tag.
- **Parts.** Each part pushed to `ghcr.io/lantharos/luft-parts` is signed without a key by the workflow that built it. A build only reuses a part whose signature names that workflow, and pulls it by the digest it checked. Anything else under the same tag counts as missing and is built again.
- **The Secure Boot key** is only mounted into build steps without network access: one signs SushiBoot, one the startup image and one NVIDIA's modules. The modules are built first, without any key, in a stage that downloads and runs NVIDIA's code. A second, clean stage that holds only Fedora's kernel headers signs what the first produced.

Signing only happens in builds from `main`. Builds anywhere else, including your own, make throwaway keys.

## Downloads

USB sticks and their descriptions are published on get.luft.computer:

| Path | Holds |
| --- | --- |
| `nightly/luft-VERSION.iso` | The three newest nightly sticks, such as `luft-1.1-nightly.21.iso` |
| `1/luft-VERSION.iso` | Stable releases |
| `…/latest.json` | The newest stick in that folder: its `name`, `version`, `size` and `sha256` |
| `…/notes/VERSION.json` | That version's changelog |

Every stick has a `.sha256` next to it, signed with [minisign](https://jedisct1.github.io/minisign/) in a `.sha256.minisig` whose trusted comment is the stick's file name. The key's public half is:

```
RWRz9rCK/H8Drrze/f851hxNNOH/D42kpyTMpXV7DT7QoUdCZySZwRWA
```

Meet Luft has it built in. It only accepts a checksum signed for the exact file it downloads, so an older or different stick can't be passed off as the one it asked for, and it refuses a download without a signature. A stick picked with **Use an ISO I already have** is the person's own choice and isn't checked.

Each `latest.json` is signed with a second key, in `latest.json.minisig`, whose trusted comment names the folder and file, such as `nightly/latest.json`, so a nightly can't be offered as a release. Meet Luft refuses a description without that signature, and remembers the newest version each folder offered, so it also refuses one naming an older build than it has seen.

A notes file holds the `version`, the `previous` one in its folder, the changelog in `notes` as sections with an `area` (`desktop`, `apps`, `system` or `installing`), a `title` and their `changes`, and for a release the `nightly` it came from. The image carries its changelog in its `com.lantharos.release-notes` label too, for when Settings can't reach get.luft.computer.

Meet Luft's own downloads are listed with their checksums in schelf.store's `SHA256SUMS`.
