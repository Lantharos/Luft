---
title: Building and rolling out your own Luft
description: Build your own Luft on top of Luft's on your own build server, sign it with your keys, publish it to your registry and move your computers onto it.
sidebar:
  order: 2
asks:
  - custom luft image
  - build our own luft
  - company image
  - golden image
  - { ask: mirror luft, to: mirroring-luft }
  - { ask: luft without internet, to: networks-without-internet }
  - { ask: air gapped, to: networks-without-internet }
  - { ask: pin luft version, to: 3-choose-the-luft-you-build-on }
  - { ask: pilot computers, to: 5-test-on-the-pilot-computers }
  - { ask: join organization, to: computers-that-already-run-luft }
---

Your own Luft is Luft's image with your apps, certificates, settings and policy on top, signed with your keys and published to your registry. Your computers then update from you instead of from Luft: first the pilot computers you test on, then everyone.

Everything runs on machines you own. You need:

- A Linux build server with Podman, Skopeo, OpenSSL, jq, objcopy, and room for a few copies of Luft's image, about 5 GB each.
- An OCI registry, such as Harbor, Quay, GitLab's or Nexus's registry, or a plain `registry` container.
- Luft's tools, which every Luft computer carries in `/usr/share/luft/organization`. Copy that folder to the build server, such as to `/srv/luft/tools`, and put `/srv/luft/tools/org` on your `PATH`. Copy it again from a computer on the new version when you move to a new Luft.

You keep three keys. They never leave your hands, and Luft never sees them:

| Key | Signs |
| --- | --- |
| Secure Boot key | The startup image: kernel, initramfs and the command line that names your exact system |
| TPM policy key | What lets the TPM unlock the disk for your startup images and no others |
| Signing key | The image in your registry, which computers check before they download an update |

## 1. Start your repository

Copy `/srv/luft/tools/org/template` into a new repository on your own Git server and fill in `organization.toml`:

```toml
name = "Acme"
image = "registry.acme.example/luft/acme"
luft = "registry.acme.example/luft/luft"
follow = "stable"
nvidia = true
```

`image` is where your builds go, and `luft` is where the build takes Luft from: your mirror of it, or `ghcr.io/lantharos/luft` to take it straight from Luft. Neither has a tag. Leave out the NVIDIA image with `nvidia = false` when none of your computers have NVIDIA graphics.

| Path | Holds |
| --- | --- |
| `Containerfile` | Your changes, as `RUN` and `COPY` lines after the ones that are there, such as `RUN dnf install -y freeipa-client` |
| `certificates` | Certificate authorities every computer trusts, as `.crt` or `.pem` files |
| `policy` | [Policy files](/organizations/policy/), which go to `/usr/share/luft/policy.d` |
| `files` | Files copied onto the system as they are, such as `files/etc/sssd/sssd.conf` |
| `keys` | The public halves of your keys, made in the next step |
| `ci` | Example jobs for running the build on a schedule |

## 2. Make your keys

On a computer you trust:

```sh
org.sh keys ~/acme-luft ~/acme-keys
```

It writes the public halves into `~/acme-luft/keys`, which you commit, and the private ones into `~/acme-keys`. Put each private file on the build server, or into your CI's secrets, under the name it prints: `LUFT_SECUREBOOT_KEY`, `LUFT_PCR_KEY_101`, `LUFT_ORG_SIGNING_KEY` and `LUFT_ORG_SIGNING_PASSPHRASE`. Then move `~/acme-keys` to an encrypted drive kept somewhere safe. Anyone with all three can make startup images your computers start and unlock their disks for, so treat them like the keys to your building.

## 3. Choose the Luft you build on

`follow` decides which Luft your builds are on:

| `follow` | Builds on |
| --- | --- |
| `"stable"` | Each stable release of Luft, as it comes out. Suits most organizations. |
| `"nightly"` | Each nightly, to see changes early |
| A version, such as `"1.2"` | Exactly that version, until you move it |

Before it builds on anything, the build checks Luft's signature with the same key Luft computers trust, and refuses an image anyone else signed or nobody signed. While Luft has no stable release yet, following `"stable"` stops with a message saying so; follow `"nightly"` or a nightly version until there is one.

A version is pinned by its digest in `luft.lock`, next to `organization.toml`, so the image under it can't change. Move to another version, or back to following a channel, with `base`:

```sh
org.sh base . 1.3
```

It lists what changed in Luft since the version your pilot computers run, builds on the new version, and writes `organization.toml` and `luft.lock`, which you commit. Computers never go back to an older version, so `base` refuses one.

### Mirroring Luft

With `luft` naming your own registry, `mirror` copies the Luft you follow into it, with both images and Luft's signatures, after checking them:

```sh
org.sh mirror .           # what organization.toml follows
org.sh mirror . 1.3       # a version, before moving to it with base
```

From then on, builds and computers only talk to your registry.

### Networks without internet

Carry Luft over on a drive: export it on a computer with internet, then import it on the build server.

```sh
org.sh export . /run/media/acme/drive/luft       # with internet
org.sh import . /run/media/acme/drive/luft       # on the build server
```

The export checks Luft's signature before it writes anything, and the import checks it again before your registry gets the images. Your `Containerfile`'s `dnf install` lines, and the build itself, which installs Fedora's `systemd-ukify` and `sbsigntools` to sign startup images, need a Fedora mirror inside the network: point the image at it with a file in `files/etc/yum.repos.d`.

## 4. Build and publish

Sign the build server in to your registry once with `podman login`, then run, with the private keys as files:

```sh
export LUFT_SECUREBOOT_KEY=/srv/luft/keys/secure-boot.key LUFT_PCR_KEY_101=/srv/luft/keys/pcr-101.key
export LUFT_ORG_SIGNING_KEY=/srv/luft/keys/signing.private LUFT_ORG_SIGNING_PASSPHRASE=/srv/luft/keys/signing.passphrase
org.sh mirror .
org.sh update .
```

`update` builds only when the Luft you follow or your repository changed since the last build, and does nothing otherwise, so it's safe to run every hour. A build:

1. Downloads Luft's image and checks Luft's signature on it.
2. Builds your `Containerfile` on it, then adds your Secure Boot certificate, your TPM policy key and a rule requiring your signing key for `image`.
3. Makes a new startup image for the result, signed with your Secure Boot and TPM policy keys.
4. Pushes the image, signed with your signing key, as its version, such as `registry.acme.example/luft/acme:1.4`, and moves `:1-pilot` to it. The NVIDIA image gets `-nvidia` after each tag.

`org.sh build .` and `org.sh publish .` do the two halves on their own.

The `ci` folder has the same job for several systems. Copy the one you use into place:

| File | For |
| --- | --- |
| `ci/systemd/luft-build.service` and `.timer` | A build server on its own: pulls your repository and runs the build every hour |
| `ci/gitlab-ci.yml` | GitLab CI, as `.gitlab-ci.yml`, with the keys as protected File variables and a pipeline schedule |
| `ci/forgejo.yml` | Forgejo or Gitea Actions, in `.forgejo/workflows` |
| `ci/Jenkinsfile` | Jenkins, with the keys as file credentials |
| `ci/github.yml` | GitHub Actions, in `.github/workflows` |

Each runs on a runner labelled `luft` on your build server, with `LUFT_TOOLS` set to the tools folder. Keep the keys where only builds of your main branch can use them, such as protected variables or an environment only `main` may use, so a merge request never gets near them.

## 5. Test on the pilot computers

Pilot computers follow `:1-pilot`, so they get each build as soon as it's published. Which tag a computer follows can be decided with a [policy file](/organizations/policy/) in `/etc/luft/policy.d`, which your configuration management hands out:

```toml
[updates]
image = "registry.acme.example/luft/acme:1-pilot"
```

The computer moves to that tag at its next check for updates, keeping its standard or NVIDIA image, and Settings no longer offers to change it. It only moves to an image it already requires your signature for, so a policy file can't send a computer to anyone else's image. Leave `image` out of the policy in your image itself, since that policy wins over the computer's and every computer would follow the same tag.

When you're happy with a build, give it to everyone:

```sh
org.sh promote .
```

That points `:1` at exactly the pilot build, so nothing is built or signed again. The CI examples run it when you start the job by hand with promote chosen.

## 6. Move computers onto your image

### New computers

Build a USB stick from your image, with a checkout of Luft's source:

```sh
os/iso/build.sh registry.acme.example/luft/acme:1 registry.acme.example/luft/acme:1
```

The first argument is the image on the stick, the second the one installed computers follow. Use `:1-pilot` for both to make a stick for pilot computers. Install Luft installs your image with your keys from the start. At the first start, someone at the computer confirms your key and Luft's on shim's blue screen, as with [any Luft](/start/first-start/#the-blue-screen).

### Computers that already run Luft

Write a description of your image for them:

```sh
org.sh join . > acme.toml          # for everyone
org.sh join . pilot > acme.toml    # for pilot computers
```

Hand it to each computer and run, as an administrator:

```sh
sudo trustctl organization join acme.toml
```

It downloads your image, checked with the signing key in `acme.toml`, and asks shim to trust your Secure Boot key at the next restart. It prints an eight-digit code: restart, choose **Enroll MOK** on the blue screen and type the code. When the disk is unlocked by the TPM without a PIN, it stays that way for your startup images. With a PIN, the computer asks for the recovery key once.

If nobody confirms the key, the computer starts its current version again and stays on it; run the command again to try once more. On a computer that already runs your image, the command only changes which tag it follows, so it also moves a computer between `:1-pilot` and `:1`.

## Changing keys

A new TPM policy key comes in generations: add `keys/pcr/102.pem` and its private key as `LUFT_PCR_KEY_102`, build with both for one release, then with the new one only. Your generations start at 101 so they never meet Luft's.

A new Secure Boot key has to be confirmed at every computer on the blue screen, as the first one was.

How the signatures and the TPM fit together is in [How organization images work](/developers/system/organization-images/). Questions, or something you need that's missing? Write to [hello@lantharos.com](mailto:hello@lantharos.com).
