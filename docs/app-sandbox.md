# App sandbox

How apps from outside Luft are kept to what they need, and how they ask for more. The sandbox itself is described in [The AppImage sandbox](security.md#the-appimage-sandbox); this is the design around it.

| App | Runs |
| --- | --- |
| Luft's own apps, in the image | Outside a sandbox, like the rest of the system, sharing one Chromium |
| Flatpaks | In Flatpak's sandbox |
| AppImages, Sabine apps among them | In the AppImage sandbox, with what they declare and you allow |
| Anything you gave full access | Outside a sandbox, as you |

## What an app declares

A Sabine app says what it needs in `Sabine.toml`, in the same words Flatpak uses:

```toml
[sandbox]
network = true
filesystems = ["xdg-documents", "xdg-download:ro"]
devices = ["usb"]
talk = ["org.mpris.MediaPlayer2.notes"]
```

| Key | Default | Means |
| --- | --- | --- |
| `network` | `true` | It can go online |
| `filesystems` | none | `home`, `xdg-desktop`, `xdg-documents`, `xdg-download`, `xdg-music`, `xdg-pictures` or `xdg-videos`, read-only with `:ro`. Files you pick in a file dialog always reach it. An app given your home folder still keeps its own files in `~/.var/app/APP-ID` |
| `devices` | none | `usb`, `serial` or `all`. The graphics card, sound and the camera through the portal need nothing |
| `talk` | none | Session bus names it calls besides the portals, notifications, the Secret Service and the tray. Names that would let it widen its own sandbox, such as the permission store, Flatpak's and systemd's, are refused |

An app that can't work in a sandbox at all says so, with a reason you'll read before allowing it:

```toml
[sandbox]
unsandboxed = true
reason = "It manages the containers Podman runs for you."
```

`sabine bundle` checks the declaration and writes it into the app's manifest, which every bundle carries where a store or the system can read it without starting the app: `usr/lib/sabine/APP-ID/resources/Sabine.toml` in AppImages, deb and rpm packages and tarballs, `Contents/Resources/Sabine.toml` in a macOS app, and `resources/Sabine.toml` next to the program on Windows. Sabine's [implementation guide](https://github.com/Lantharos/Sabine/blob/main/docs/implementation-guide.md#app-sandbox) has the reference.

## Schelf decides

Schelf reads the declaration from the AppImage before it installs it and shows it in plain words, as it does for Flatpaks. What you install with is written to the permission store, and the sandbox reads only the store when the app starts, never the app's own files, so an update can't widen what an app was given.

| Store entry | Holds |
| --- | --- |
| `sandbox` / `folders` | Folders it can read and change |
| `sandbox` / `read-only-folders` | Folders it can only read |
| `sandbox` / `devices` | `usb`, `serial` or `all` |
| `sandbox` / `network` | `no` when it stays offline |
| `sandbox` / `bus` | The extra session bus names it can call |
| `full-access` / `full-access` | It runs outside the sandbox |

An app that asks to run unsandboxed gets Schelf's full access confirmation, with its reason, before it installs; cancelling installs nothing. `schelf install` installs it in its sandbox and says what it asked for, and `schelf trust` gives it full access. Its page in Schelf keeps the full access switch with its reason, and Settings → Apps lists everything in the store, its folders, network, devices and bus names included, so anything can be taken back later. An AppImage without a declaration gets the sandbox every AppImage gets, with network and nothing else. Outside a sandbox, a Sabine app holds itself to its declaration with Landlock; Schelf starts an app you gave full access with `SABINE_FULL_ACCESS` set, so it doesn't.

## One Chromium for Luft, one each for everyone else

Sabine apps installed for every user, below `/usr/lib/sabine`, share one Chromium, which on Luft means only the apps in the image. Every other Sabine app gets a Chromium of its own: Sabine adds the app ID to the key of the runtime it asks for, so it never shares a browser process with Luft's apps or with another app. Inside a sandbox, a Sabine app always runs its own Chromium in the sandbox, with the Sabine host and CEF runtime the image ships, so an app built with a newer Sabine than the image waits for the next Luft update. schelf.store lists the Sabine version each release needs.

## Chromium's own sandbox, inside ours

Chromium sandboxes its renderers with user namespaces, which the AppImage sandbox keeps from apps. Flatpak solves the same problem with its Spawn portal, which starts a process in a new, smaller sandbox, and Zypak, which makes Chromium and Electron start their helpers through it. Luft does the same:

- The image ships Zypak. The sandbox starts Chromium and Electron apps through it, and tells Sabine where it is, which starts its own Chromium through it.
- The sandbox serves `org.freedesktop.portal.Flatpak` itself. The app's bus goes through a relay that answers that one name and passes everything else to `xdg-dbus-proxy` unchanged.
- `Spawn` starts the process in a sandbox that joins the app's user and process namespaces, so it can't create namespaces either, with the same system call filter, and confined by Landlock to its own mounts as the app is. It never gets more than the app: with the sandbox flag it gets only `/usr`, the app's files and what the caller exposes read-only, without home, devices, display, sound or bus unless asked for, and `NoNetwork` takes the network away. `SpawnSignal`, `SpawnStarted`, `SpawnExited` and the bus watch work as in Flatpak.

Renderers then run in their own namespaces with Chromium's system call filter, as in a Flatpak, and the apps no longer need `--no-sandbox`.

## Secrets

The sandbox's `.flatpak-info` lists the names its bus proxy allows, as Flatpak's does. Since it names `org.freedesktop.secrets`, Luft's xdg-desktop-portal patch tells libsecret the Secret portal isn't there, and libsecret keeps passwords in Luft Keyring through the Secret Service, so Luft no longer rebuilds libsecret.

## Windows and macOS

The declaration travels with every bundle, so a store can show it and judge an app on any system. Neither system enforces it yet. The plan is AppContainer on Windows, with `network` as the internet client capability and `filesystems` as the library capabilities, and the App Sandbox on macOS, with entitlements written from the same keys when the bundle is signed. Chromium's renderers are sandboxed there already.
