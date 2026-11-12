---
title: Luft Keyring
description: How Luft Keyring encrypts and unlocks your secrets, and which apps it lets use them.
sidebar:
  order: 2.6
---

Luft Keyring keeps passwords, tokens and keys for the Secret Service, the Secret portal, SSH and GnuPG. [Keyring](/files/keyring/) covers using it.

## The vault

Everything is in one file, `~/.local/share/luft-keyring/vault`, encrypted with XChaCha20-Poly1305 under a random master key, item names included. The master key is wrapped twice:

- by your password, with Argon2id at 64 MiB and three passes, which always works
- with a TPM 2.0, by a key sealed to PCR 7 and PCR 15, optionally with a PIN

While unlocked, the master key sits in locked memory that can't be dumped. Locking wipes it and every secret.

## Unlocking

Only after the system's sign-in rules succeed does `pam_luft_keyring.so` tell the unlock service, which hands the TPM key only to your own `luft-keyring`: the installed program, in your user manager's unit, not traced, checked through a pidfd. That's how a fingerprint unlocks the keyring at the login screen and the lock screen alike. Without a TPM, or with a PIN, the keyring asks for the password or PIN once after you sign in.

PCR 7 ties the seal to the Secure Boot state and PCR 15 to this installation: with [device encryption](/security/encryption/), the disk's volume key is measured into PCR 15 at every start, so another system the firmware would start, even a signed one, can't unseal it. Kernel and Luft updates change neither, so they never cost a password prompt; a changed Secure Boot state means typing your password once. Without device encryption, PCR 15 only holds values another system could read off the disk and measure itself, so the seal rests on Secure Boot alone. Rescue and any shell that opens without a password extend PCR 15 first, so the seal stays closed there.

Automatic login never unlocks the keyring, with one exception: the session Install Luft signs you into to finish setting up. Install Luft creates your keyring with the password you chose, wrapped a second time by a random one-time key it leaves in `/var/lib/luft-keyring`, readable only by root. Until setup is finished, the unlock service hands that key to your `luft-keyring`, which seals itself to the TPM as usual. Finishing setup deletes it.

`luft-keyring` is a [shielded helper](/security/identity/): your other programs can't trace it, read its memory or slip libraries into it, and the unlock service only answers a keyring that runs with its group. Before it reads anything, it takes no new privileges, refuses memory that is writable and executable, and installs a seccomp filter that refuses, among others, tracing or reading other processes, new namespaces, network sockets, starting programs and loading anything into the kernel. Landlock isn't used, since a process under it can't look into other processes' sandboxes, which the keyring needs to tell apps apart. It runs with `LimitCORE=0`, so a crash leaves no core dump.

## Which apps get what

The keyring tells apps apart only as [Who an app is](/security/identity/) describes. Programs you run outside a sandbox are all you: they use every item without being asked, including what sandboxed apps saved.

A sandboxed app, a Flatpak or an AppImage in Schelf's sandbox, is known by its app ID. It uses what it saved without being asked, is asked once before it uses one of your items and can be told to remember the answer, and needs your fingerprint or password before it uses an item another sandboxed app saved. Until it may use an item, the item doesn't exist for it: it's missing from lists and from searches without attributes, and its label, attributes and dates read as empty. A search for specific attributes still finds it as locked, which is how the app gets to ask. An app saving an item with the same attributes as one it can't use gets an item of its own instead of replacing it. An app whose sandbox can't be read is asked every time, and its answer is never remembered.

A Flatpak app that may talk to the Secret Service itself doesn't see the Secret portal, so libsecret in it keeps everything in the keyring under its app ID, where both of its ways of saving find it.

Managing the keyring, such as reading the access history or removing an SSH key, works only for programs outside a sandbox, and asks you to confirm it's you first; the same program can then keep managing for five minutes.

Apps can also keep tokens of their own, apart from the items people see, through [`AppSecrets`](/developers/desktop/dbus/#keyring), where a sandboxed app can only name its own app ID.

## Limits

Beyond what [Keyring](/files/keyring/#what-it-protects-against) lists, the keyring can't help when root is compromised on a correctly started computer, when a signed component with a flaw is abused, or when memory is read physically while it's unlocked.
