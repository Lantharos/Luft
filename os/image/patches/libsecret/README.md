# libsecret patches

The image build rebuilds Fedora's libsecret package with these patches ([`parts/stages/rebuild.sh`](../../parts/stages/rebuild.sh)), from the source of the exact version in the base image.

| Patch | Why |
| --- | --- |
| `secret-backend-override.patch` | `SECRET_BACKEND` chooses where libsecret keeps passwords even in a sandbox. Without it, any process with a `/.flatpak-info` keeps them in a file of its own, locked with the Secret portal, while the Secret Service API still searches the Secret Service. Chromium and Electron save their encryption key one way and look it up the other, so they made a new key on every start and couldn't read what they had encrypted before. Schelf's AppImage sandbox sets `SECRET_BACKEND=service`, so both go to Luft Keyring, which knows the app by its sandbox |

The patch is against libsecret 0.21.8.2, the version Fedora 45 ships.

## Upstream

Upstream libsecret still prefers the file backend over `SECRET_BACKEND` in Flatpak and Snap sandboxes, so Flatpak apps built on Chromium that can reach the Secret Service have the same problem on every desktop ([flathub/com.vscodium.codium#239](https://github.com/flathub/com.vscodium.codium/issues/239)). Flatpak apps bring their own libsecret, which this patch doesn't change.
