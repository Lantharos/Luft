---
title: How organization images work
description: How an organization's own Luft is built on Luft's, which signatures each step checks, how mirrors keep Luft's signatures, and how the disk stays unlocked when a computer joins.
sidebar:
  order: 9.5
---

[Building and rolling out your own Luft](/organizations/your-own-luft/) is the walkthrough for IT departments. This page is how it works. The tools are `os/org`: `org.sh` with its parts in `os/org/lib`, the `Containerfile` in `os/org/image` that adds the organization's keys, and the template. The image ships them, with `os/versions.env`, `os/image/seal.sh` and `os/image/startup`, in `/usr/share/luft/organization`, laid out as in the repository, so any Luft computer can hand an organization the tools for its own version.

## Luft's signature on the base

The key the tools check Luft with is the one Luft computers trust, `os/image/files/usr/share/pki/containers/luft.pub`, and the repository it signs for is the one `os/image/files/etc/containers/policy.json` requires it for. Every copy of Luft's image, whether a mirror, an export, an import or the build's download, goes through `skopeo copy` with a policy that only has a `sigstoreSigned` rule for that key and rejects everything else, so nothing unsigned or signed by anyone else is written anywhere.

Luft signs each image as `ghcr.io/lantharos/luft`. A mirror keeps those signatures as they are, so the policy for a mirror maps its name back with `remapIdentity`, and the build always pulls the base by digest. Pulling by digest also means a tag moved in the mirror can't change what a build gets: the build checks the digest it was given, and `luft.lock` holds that digest for a pinned version.

Mirroring copies the image with `--preserve-digests` and sigstore attachments on both sides, then the `sha256-<digest>.sig` tag and the `sha256-<digest>` tag that holds cosign's keyless bundle as a referrer, so the mirror can be checked with `cosign verify` the same way as Luft's registry. Channel tags, such as `:1-nightly`, are moved in the mirror with a second checked copy, which uploads nothing. An OCI layout can't hold sigstore attachments, so an export writes the two signature tags beside the image; an import uploads them, uploads the image by digest without a tag, and only tags it after a checked copy accepts it.

The version a release has is its `org.opencontainers.image.version` label, and its changes are its `com.lantharos.release-notes` label, so `base` lists the changes between two versions from the registry it builds from, mirror or not.

## What a build makes

The organization's `Containerfile` runs on the checked base. `os/org/image/Containerfile` then adds the Secure Boot certificate as `/usr/share/luft/secure-boot/organization.der`, replaces `/usr/lib/luft/pcr-keys` with the organization's TPM policy keys, and adds a `sigstoreSigned` rule for `image` to `/etc/containers/policy.json`. `seal.sh`, the same script Luft's own build uses, makes and signs the startup image with the organization's keys, using the kernel from the base's startup image.

The result carries labels that decide whether the next run builds again:

| Label | Holds |
| --- | --- |
| `com.lantharos.organization.base` | The base it's built on, by digest |
| `com.lantharos.organization.source` | A hash of everything the build reads from the organization's repository: the build context without what `.containerignore` leaves out, `organization.toml`, `luft.lock` and `keys` |
| `com.lantharos.organization.revision` | The repository's commit, when it's a Git repository |

`update` compares the first two on each published `:1-pilot` image with what the repository follows now, so edits to a README or a CI example don't rebuild, and a moved channel tag or a new pin does.

## How trust works

Each step only trusts what the step before it checked:

- **The download.** The organization's `/etc/containers/policy.json` requires its signing key for `image`, so updates are refused when anyone else signed them, Luft included. The first download, by `trustctl organization join`, runs bootc in a mount namespace with a policy requiring the key in the description, which only an administrator can hand to the computer.
- **The startup.** Shim starts Luft's boot menu, signed with Luft's key, and the menu starts the organization's startup image, signed with its key. Both keys are in shim's list, and a key only gets there when someone at the computer types the code on the blue screen. `join` asks for the organization's key in the same request as Luft's, the way [the first start](/developers/system/boot/) does.
- **The system.** The startup image names the exact system by its composefs digest, so a changed file is never read.
- **The disk.** The TPM releases the disk key only for startup images whose policy the organization's TPM policy key signed. Luft's own startup images still start, as do older ones, but they never unlock the disk without its recovery key.
- **Going back.** The updater never installs an image older than the version running, and `join` removes the staged image when it's older. Builds carry the version of Luft they're built on, so a rebuild of the same version replaces the one before it.

Luft's key stays trusted because it signs the boot menu and NVIDIA's driver, which the image takes from Luft unchanged. Settings lists both keys as the computer's own.

## Unlocking the disk after joining

When the disk is sealed to the TPM without a PIN, `join` links it for the organization's startup images before the restart. trustd replays the TPM event log with the organization's certificate added to Luft's, which predicts PCR 7 once shim trusts the new key, and adds a token for that value and each of the organization's policy key generations, next to the existing ones, so going back still unlocks. With a PIN, the first start asks for the recovery key once and trustd seals again. Generations of the organization's TPM policy keys start at 101 and work like [Luft's](/security/encryption/#older-signed-startup-images).
