---
title: Security keys and smart cards
description: How Luft signs people in with FIDO2 security keys and smart cards, keeps what they enrolled, unlocks the keyring with them, and lets the password be turned off without locking anyone out.
sidebar:
  order: 2.7
---

People add keys and cards in Settings and sign in with them on the login and lock screens, as [Security](/system/security/#security-keys-and-smart-cards) describes. This page is how that works.

## The pieces

`luft-sign-in` is a root service, started by D-Bus as `com.lantharos.SignIn1` and by its socket `/run/luft-sign-in/verify`, which only root can open. It does everything that touches a key or a card, so neither greetd nor `kestrel-authenticate` loads a USB or smart card library:

- FIDO2 keys go through libfido2, opened at run time. Each enrolled key holds a credential for the relying party `com.lantharos.sign-in` that isn't stored on the key, made with the `hmac-secret` extension, and signing in always needs user verification: the key's PIN, or its own fingerprint reader.
- Smart cards go through PKCS #11, by way of p11-kit's proxy, so OpenSC's drivers for PIV, CAC and many national and company cards work, and so does a vendor's own module registered with p11-kit. Only removable slots count, which leaves out the system's trusted certificates. pcscd owns the readers; a card reader only counts when it speaks CCID, so readers that type a badge's number as a keyboard never sign anyone in.

`pam_luft_sign_in.so` is a small client of that socket, which has an SELinux type of its own that greetd may connect to. It relays the service's questions, such as `Security key PIN: `, and notices, such as `Touch your security key`, through the PAM conversation, which is how the login and lock screens show them.

## Proving it's the key or card

For a security key, the service first asks every plugged-in key, without a touch, whether it holds one of the person's credentials. On the one that does, it asks for the PIN, then for an assertion over 32 fresh random bytes with user presence and user verification required, and checks the signature itself against the public key kept from enrolment. libfido2 encrypts the PIN and the `hmac-secret` exchange between the computer and the key.

For a card, the service looks for a certificate the person enrolled, logs in to the card with its PIN, has it sign 32 fresh random bytes with the key of that certificate, PKCS #1 v1.5 with SHA-256 for RSA and ECDSA over the SHA-256 digest for P-256 and P-384, and checks the signature against the enrolled certificate. A card that only replays an earlier answer can't pass.

## What's kept

Everything enrolled is in `/var/lib/luft-sign-in/users/UID.json`, which only root can read or change, never in the home folder: each key's credential ID, public key and `hmac-secret` salt, each card's certificate and its keyring wrap, whether the person signs in with their password, and the USB identity of each key or reader. `/var/lib/luft-sign-in/devices` lists those identities for USB protection. A person with nothing enrolled and the password on has no file at all.

## Unlocking Luft Keyring

With a TPM, any sign-in unlocks [Luft Keyring](/security/keyring/) through the key the TPM seals, so a key or card unlocks it as a fingerprint does. Keys and cards also unlock it without a TPM, or with a TPM PIN:

- A key's secret is its `hmac-secret` output for the enrolled salt, after its PIN.
- A card's secret is either 32 random bytes encrypted to the card's RSA key, which only the card decrypts, or, for an elliptic curve key, an ECDH agreement between the card's key and a key made at enrolment, run through HKDF-SHA256. Cards whose key may do neither still sign in, and unlock the keyring through the TPM.

The keyring keeps its master key wrapped by each of these secrets in its vault header, with XChaCha20-Poly1305, next to the password and TPM wraps. After a sign-in, `pam_luft_sign_in.so` leaves the secret as PAM data, and `pam_luft_keyring.so` hands it with its grant to the unlock service, which passes it only to the person's own `luft-keyring`. The keyring adds a wrap the first time a secret arrives while it's open, which enrolment arranges at once, drops wraps of keys and cards that are no longer enrolled, and, when a sign-in couldn't open it, adds the wrap as soon as the password does. The secret never reaches a program of the person's.

## The login and lock screens

`com.lantharos.SignIn1.Ways(uid)` says how an account signs in, best first: security key, smart card, fingerprint, then password. Anyone may ask, and the login screen asks for everyone listed as soon as it shows them, so it opens on the right way without showing the password first. It opens on the way used last unless that was the password, and on the best way otherwise. While fprintd gets the reader ready, the prompt says so in the fingerprint's place.

greetd's rules ask the login screen which way to use through `pam_kestrel_sign_in.so`, then run `pam_luft_sign_in.so`, which signs in with the key or card, turns password sign-in back on with the recovery key, or decides whether the password may be checked. The lock screen asks `kestrel-authenticate` for the `security-key`, `smart-card` or `lock-screen` rules, which do the same.

After a card signs in or unlocks, the service watches its reader through pcscd. Taking the card out, or the reader with it, has logind lock every session of that person at the computer.

## Turning off the password

The password stays allowed unless the person turned it off and a security key, a smart card or a fingerprint in `/var/lib/fprint` can sign them in. This is checked at every sign-in, so removing the last of them, even a fingerprint removed with `fprintd-delete`, brings the password back by itself. Turning it off asks polkit (`com.lantharos.sign-in.password-off`) to confirm it's the person, and is refused while nothing else is enrolled. When the service can't answer, the password stays allowed.

The password still works for polkit, `sudo` and confirmations, which only happen inside a session someone already unlocked, and for text consoles, which only exist with Developer tools on.

A lost key or card has two ways back, both needing what already opens the computer. At the login screen, **Lost your key?** asks for the disk's recovery key, which trustd checks against the disk Luft started from, and turns password sign-in back on. From Rescue, which asks for the recovery key itself, `/usr/libexec/luft-sign-in allow-password NAME` does the same.

## USB protection

While nobody is signed in or the screen is locked, [USB protection](/system/security/#usb-protection) lets in an enrolled key or reader, on any port, when its vendor, product, serial number and the full list of its parts match what was enrolled. It then connects only the part that signs in: the HID part outside the boot protocol for a key, which carries FIDO, or the CCID part for a reader. Other parts wait for the unlock as before. When nobody enrolled anything, nothing more connects while locked. YubiKeys don't report a serial number over USB, so another YubiKey of the same model counts as the same device; it still can't sign anyone in without its own credential.

## Testing

`cargo test -p luft-sign-in -p portguard` covers what's kept, the order of ways and USB matching. `security/vm/sign-in/run.sh` checks the whole path in a VM with SELinux enforcing: a FIDO2 key made in software on `/dev/uhid` with PIN protocol 1 and `hmac-secret`, and QEMU's emulated CCID reader with a CAC card. It enrolls both, turns the password off, signs in through greetd with each, checks that the keyring unlocks without a TPM, that a wrong PIN is refused, that taking the card out locks the session, and that the reader is held back while locked until it's enrolled.
