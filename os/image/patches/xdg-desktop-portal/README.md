# xdg-desktop-portal patches

The image build rebuilds Fedora's xdg-desktop-portal package with these patches ([`parts/stages/rebuild.sh`](../../parts/stages/rebuild.sh)), from the source of the newest version in Fedora's repositories.

| Patch | Why |
| --- | --- |
| `secret-service-apps.patch` | The Secret portal tells a Flatpak app that can reach the Secret Service itself, through `--talk-name=org.freedesktop.secrets` or the whole session bus, that it isn't there. libsecret keeps passwords in a file locked with the Secret portal whenever the portal answers, while its Secret Service API still searches the Secret Service, so Chromium and Electron apps such as Obsidian, VS Code and Slack saved their encryption key in the file, didn't find it in the Secret Service and made a new one on every start. Without the portal those apps keep everything in Luft Keyring, which knows them by their app ID. Apps without that permission, such as Vesktop and Discord, keep using the portal |

The patch is against xdg-desktop-portal 1.22.1, the version Fedora 45 ships.
