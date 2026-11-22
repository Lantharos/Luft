---
title: Running Luft in your organization
description: Build your own image on top of Luft, sign it with your own keys, publish it to your registry and move your computers onto it.
sidebar:
  order: 9.5
---

An organization can run its own Luft: Luft's image with your apps, certificates, settings and policy on top, signed with your keys and published to your registry. Your computers then update from you instead of from Luft, first the pilot computers your IT department tests on, then everyone.

You keep three keys. Nothing leaves your hands, and Luft never sees them:

| Key | Signs | Kept |
| --- | --- | --- |
| Secure Boot key | The startup image: kernel, initramfs and the command line that names your exact system | CI secret, offline copy |
| TPM policy key | What lets the TPM unlock the disk for your startup images and no others | CI secret, offline copy |
| Signing key | The image in your registry, which computers check before they download an update | CI secret, offline copy |

## 1. Start your repository

Copy [`os/org/template`](https://github.com/Lantharos/Luft/tree/main/os/org/template) into a new repository and fill in `organization.toml`:

```toml
name = "Acme"
image = "ghcr.io/acme/luft"
luft = "ghcr.io/lantharos/luft:1"
nvidia = true
```

`image` is where your builds go, without a tag. Leave out the NVIDIA image with `nvidia = false` when none of your computers have NVIDIA graphics. `luft` is the Luft you build on: `:1` for Luft's stable releases, which suits most organizations, or `:1-nightly` to see changes earlier.

| Path | Holds |
| --- | --- |
| `Containerfile` | Your changes, as `RUN` and `COPY` lines after the ones that are there, such as `RUN dnf install -y freeipa-client` |
| `certificates` | Certificate authorities every computer trusts, as `.crt` or `.pem` files |
| `policy` | Policy files, which go to `/usr/share/luft/policy.d` |
| `files` | Files copied onto the system as they are, such as `files/etc/sssd/sssd.conf` |
| `keys` | The public halves of your keys, made in the next step |
| `.github/workflows/luft.yml` | The build, for GitHub Actions |

## 2. Make your keys

With a checkout of Luft, on a computer you trust:

```sh
os/org/org.sh keys ~/acme-luft ~/acme-keys
```

It writes the public halves into `~/acme-luft/keys`, which you commit, and the private ones into `~/acme-keys`. Put each private file into your CI's secrets under the name it prints (`LUFT_ORG_SECURE_BOOT_KEY`, `LUFT_ORG_PCR_KEY_101`, `LUFT_ORG_SIGNING_KEY` and `LUFT_ORG_SIGNING_PASSPHRASE`), then move `~/acme-keys` to an encrypted drive kept somewhere safe. Anyone with all three can make startup images your computers start and unlock their disks for, so treat them like the keys to your building.

On GitHub, keep the secrets in an environment called `signing` that only `main` may use, so a pull request never gets near them.

## 3. Build and publish

The workflow runs every morning and after each push to `main`. It builds when Luft published a new version or your repository changed, and does nothing otherwise:

1. It downloads Luft's image and checks Luft's signature on it.
2. It builds your `Containerfile` on it, then adds your certificate, your TPM policy key and a rule requiring your signing key for `image`.
3. It makes a new startup image for the result, signed with your Secure Boot and TPM policy keys, using the same scripts Luft's own build uses.
4. It pushes the image, signed with your signing key, as its version, such as `ghcr.io/acme/luft:1.4`, and moves `:1-pilot` to it. The NVIDIA image gets `-nvidia` after each tag.

For other CI systems, run the same commands the workflow does, with the private keys as files:

```sh
LUFT_SECUREBOOT_KEY=secure-boot.key LUFT_PCR_KEY_101=pcr-101.key os/org/org.sh build .
LUFT_ORG_SIGNING_KEY=signing.private LUFT_ORG_SIGNING_PASSPHRASE=signing.passphrase os/org/org.sh publish .
```

Use the checkout of Luft the base image was built from, named by its `org.opencontainers.image.revision` label, as the workflow does. The build needs Podman, Skopeo, OpenSSL, jq and objcopy.

## 4. Test on the pilot computers

Pilot computers follow `:1-pilot`, so they get each build as soon as it's published. Which tag a computer follows can be decided with a [policy file](/developers/system/policy/) in `/etc/luft/policy.d`, which your configuration management can hand out:

```toml
[updates]
image = "ghcr.io/acme/luft:1-pilot"
```

The updater moves the computer to that tag at its next check, keeping its standard or NVIDIA image, and Settings no longer offers to change it. It only moves to an image the computer already requires your signature for, so a policy file can't send a computer to anyone else's image. Leave `image` out of the policy in your image itself, since the image's policy wins over the computer's, and every computer would follow the same tag. When you're happy with it, run the workflow by hand with **Give every computer the pilot build** ticked, or `os/org/org.sh promote .`. That points `:1` at exactly the pilot build, so nothing is built or signed again.

## 5. Move computers onto your image

### New computers

Build a USB stick from your image, and Install Luft installs it with your keys from the start:

```sh
os/iso/build.sh ghcr.io/acme/luft:1 ghcr.io/acme/luft:1
```

The first argument is the image on the stick, the second the one installed computers follow. Use `:1-pilot` for both to make a stick for pilot computers. At the first start, someone at the computer confirms your key and Luft's on shim's blue screen, as with [any Luft](/start/first-start/#the-blue-screen).

### Computers that already run Luft

Write a description of your image for them, and hand it to each computer:

```sh
os/org/org.sh join . > acme.toml          # for everyone
os/org/org.sh join . pilot > acme.toml    # for pilot computers
```

On the computer, as an administrator:

```sh
sudo trustctl organization join acme.toml
```

It downloads your image, checked with the signing key in `acme.toml`, and asks shim to trust your Secure Boot key at the next restart. It prints an eight-digit code: restart, choose **Enroll MOK** on the blue screen and type the code. When the disk is linked to the TPM without a PIN, trustd links it for your startup images before the restart too, so the disk opens by itself. With a PIN, it asks for the recovery key once.

If nobody confirms the key, the computer starts its current version again and stays on it. Run the command again to try once more. Running it on a computer that already uses your image only changes which tag it follows, so it also moves a computer between `:1-pilot` and `:1`.

## How trust works

Each step only trusts what the step before it checked:

- **The download.** Your image's `/etc/containers/policy.json` requires your signing key for `image`, so updates are refused when anyone else signed them, Luft included. The very first download, by `trustctl organization join`, is checked against the key in your description, which only an administrator can hand to the computer.
- **The startup.** Shim starts Luft's boot menu, signed with Luft's key, and the menu starts your startup image, signed with yours. Both keys are in shim's list, and a key only gets there when someone at the computer types the code on the blue screen. A startup image signed by anyone else doesn't start.
- **The system.** Your startup image names your exact system by its composefs digest, so a changed file is never read.
- **The disk.** The TPM releases the disk key only for startup images whose policy your TPM policy key signed. Luft's own startup images still start on your computers, as do your older ones, but they never unlock the disk without its recovery key.
- **Going back.** The updater never installs an image older than the version running. Your builds carry the version of Luft they're built on, so a rebuild of the same version replaces the one before it.

Luft's key stays trusted because it signs the boot menu and NVIDIA's driver, which your image takes from Luft unchanged. Settings lists your key and Luft's as the computer's own.

## Changing keys

A new TPM policy key works like Luft's [generations](/security/encryption/#older-signed-startup-images): add `keys/pcr/102.pem`, sign with both keys for one release, then with the new one only. Your generations start at 101 so they never meet Luft's.

A new Secure Boot key has to be confirmed at every computer on the blue screen, as the first one was.
