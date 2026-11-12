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
x11 = false
microphone = true
camera = false
```

| Key | Default | Means |
| --- | --- | --- |
| `network` | `true` | It can go online |
| `filesystems` | none | Folders besides your Downloads folder, which every sandboxed app starts with, is listed with before you install it, and loses when you turn it off on the app's page in Schelf or in Settings → Apps: `home`, `xdg-desktop`, `xdg-documents`, `xdg-download`, `xdg-music`, `xdg-pictures` or `xdg-videos`, read-only with `:ro`. Files you pick in a file dialog, drop on it, paste into it or open with it always reach it. An app's own files are in `~/.var/app/APP-ID` |
| `devices` | none | `usb`, `serial` or `all`. The graphics card and playing sound need nothing; recording and cameras are `microphone` and `camera`, with `all` too |
| `microphone` | `false` | It records sound: from a microphone, or what the computer plays |
| `camera` | `false` | It uses cameras. An app that only asks through the camera portal can leave this out and is asked about the first time |
| `x11` | `false` | It draws through X11 instead of Wayland. X11 apps can see each other's windows and typing, so this is shown before you install it |
| `talk` | none | Session bus names it calls besides the portals, notifications, the Secret Service, the tray, Kestrel's palette, its Send sheet and playing a sound of the sound theme. Names that would let it widen its own sandbox, such as the permission store, Flatpak's and systemd's, are refused, and so is Kestrel's, whose other services are only for Luft's own apps |

An app that can't work in a sandbox at all says so, with a reason you'll read before allowing it:

```toml
[sandbox]
unsandboxed = true
reason = "It manages the containers Podman runs for you."
```

`sabine bundle` checks the declaration and writes it into the app's manifest, which every bundle carries where a store or the system can read it without starting the app: `usr/lib/sabine/APP-ID/resources/Sabine.toml` in AppImages, deb and rpm packages and tarballs, `Contents/Resources/Sabine.toml` in a macOS app, and `resources/Sabine.toml` next to the program on Windows. Sabine's [implementation guide](https://github.com/Lantharos/Sabine/blob/main/docs/implementation-guide.md#app-sandbox) has the reference.

## Schelf decides

Schelf reads the declaration from the AppImage before it installs it and shows it in plain words, as it does for Flatpaks. What you install with is written to the permission store, and the sandbox reads only the store when the app starts, never the app's own files, so an update can't widen what an app was given. An update that asks for more waits until you agree to it. Any other update opens nothing new: the app keeps what it still asks for among what it has, and the folders you added yourself, and what you took away in Settings → Apps stays away. Removing an app clears everything the store holds for it, and installing an AppImage from a file starts from what that file declares, so another app that takes the same ID later gets nothing the first one had.

| Store entry | Holds |
| --- | --- |
| `sandbox` / `folders` | Folders it can read and change |
| `sandbox` / `read-only-folders` | Folders it can only read |
| `sandbox` / `devices` | `usb`, `serial` or `all` |
| `sandbox` / `network` | `no` when it stays offline |
| `sandbox` / `downloads` | `no` when it doesn't get your Downloads folder |
| `sandbox` / `bus` | The extra session bus names it can call |
| `sandbox` / `x11` | `yes` when it gets the session's X11 display |
| `devices` / `microphone` | `yes` when it may record sound |
| `devices` / `camera` | `yes` when it may use cameras; the camera portal asks about and keeps the same entry |
| `full-access` / `full-access` | It runs outside the sandbox |

An app that asks to run unsandboxed gets Schelf's full access confirmation, with its reason, before it installs; cancelling installs nothing. `schelf install` installs it in its sandbox and says what it asked for, and `schelf trust` gives it full access. With full access it starts in your own environment, the one your systemd keeps, like any other program of yours, not in Schelf's. Its page in Schelf keeps the full access switch with its reason, and Settings → Apps lists everything in the store, its folders, network, devices and bus names included, so anything can be taken back later. An AppImage without a declaration gets the sandbox every AppImage gets: the network, your Downloads folder, Wayland, playing sound and the graphics card, and no other folders, devices or bus names, no microphone and no camera. The app's page in Schelf has switches for the microphone, cameras, the Downloads folder and X11, and so does Settings → Apps.

## X11 only when asked for

Apps draw through Wayland. An app that wasn't given X11 still finds a socket where display 99 would be, which hangs up on it and tells the sandbox it looked. If the app then closes within a few seconds, Luft says it only works with X11 and offers to review its access, which opens the switches on its page in Schelf; an app that carries on with Wayland is left alone. With X11 on, the app also shares the session's System V memory and message queues, which X11's shared-memory drawing needs; without it the sandbox has its own.

## Microphone and cameras

Every sandboxed AppImage can play sound. Recording it, and using a camera, are permissions of their own, off until the app declared them and you installed it, or you turned them on.

The app reaches the session's PipeWire as its sandbox, which PipeWire reads from the process that connects, so nothing the app says about itself changes who it is. A WirePlumber script shipped with Luft, `client/find-schelf-access.lua`, then holds it to streams of its own: it can't make links itself, and WirePlumber links nothing into a stream or node of the app unless the permission store says `yes`, under `devices` / `microphone` for sound and `devices` / `camera` for video. Which of the two a link needs is read from the device or stream being listened to, not from how the app describes its own stream, and a link whose kind can't be told is refused. That covers microphones, the monitor of what the computer plays, and other apps' streams alike. The answer applies right away in both directions: a waiting recording starts when you turn the switch on, and a running one is cut when you turn it off.

Apps that speak PulseAudio get a PulseAudio server of their own inside the sandbox, started when they first connect, which reaches PipeWire as the app. They never get the session's PulseAudio socket, where a program can describe itself as it likes.

With the camera allowed, the app also finds the computer's `/dev/video*` devices the next time it starts, for apps that open cameras directly; without it they are stand-ins, as USB devices are. An app given `all` devices is held to the same switches: it finds the cameras as stand-ins and no sound cards under `/dev/snd` until they are on, and it keeps a shared memory folder of its own.

When an app without the permission opens a recording stream, a camera stream or a camera stand-in, Luft says so once while it runs and offers to review its access, which opens the switches on its page in Schelf. Until then the app records silence, as it would with no microphone plugged in.

## What every sandbox is made of

An app's own folder, `~/.var/app/APP-ID`, shows in the sandbox at that same path, and `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_CACHE_HOME` and `XDG_STATE_HOME` point into it, so what an app keeps in them has one path inside the sandbox and outside. Unless the app was given your home folder, its folder also stands in for your home, for programs that write there directly. Besides its own files, an app sees `/usr`, and from `/etc` only what programs and their libraries read to work: how names are looked up, certificates, fonts, time zone, graphics and sound settings. Its `/etc/passwd` and `/etc/group` hold just you and `nobody`, so it can't list who else has an account. It has its own process, host name and, unless it uses X11, IPC namespaces.

The system call filter is Flatpak's: no kernel log, accounting, kernel keyrings, memory placement, `ptrace`, `perf_event_open`, mounting or namespaces of its own (`clone3` and the newer mount calls answer as if the kernel lacked them, so programs fall back to the calls the filter can inspect), no `personality` other than Linux's, no typing into the terminal, and only local, internet and netlink sockets. Its launcher keeps only the name, description, categories, file types and actions from the AppImage's own desktop entry, so an AppImage can't mark itself as something else there. Outside a sandbox, a Sabine app holds itself to its declaration with Landlock; Schelf starts an app you gave full access with `SABINE_FULL_ACCESS` set, so it doesn't.

## Files you hand an app

A file or folder you pick in a file dialog, drop on an app's window, paste into it, open with the app from Rover or send to it reaches the app whatever it declared, and nothing else outside its folders does. For an app in a sandbox, the desktop portal and the sandbox's launcher hand it the file through the document portal, at a path below `$XDG_RUNTIME_DIR/doc`, which the sandbox shows the app's own share of.

Files you drag or copy from Rover, Luft's other apps or Kestrel reach a sandboxed app as they reach a Flatpak: besides the files' paths, the drag or copy offers the document portal's file transfer, which GTK 3 and 4, Qt 6.12 and later, and Chromium 151 and later look for when they run in a sandbox. Only when the app asks does the source register the files with the portal, on a thread of its own, and hand the app a key, which the app trades for the files below `$XDG_RUNTIME_DIR/doc`. Each key works once, and files you can change reach the app writable. Schelf turns the same lookup on for Electron 41 to 43, whose Chromium has it switched off. Apps whose toolkit doesn't look for it, such as older Electron and Qt apps, still get only the paths, which they can't open.

An app that holds itself to its declaration, such as one of Luft's own apps started from the image, gets real paths, since the portals and launchers take it for an unsandboxed app. It brings each one it can't open itself within reach through the document portal and uses the path below `$XDG_RUNTIME_DIR/doc` instead:

| Handed over | Who asks the document portal |
| --- | --- |
| Picked in a file dialog, including a new file to save or a folder to save into | `luft_app::portal::FileChooser` |
| Dropped on a window | Sabine, before the page sees the drop |
| Opened with the app, or sent to it from the Send sheet | Sabine for what `app.takeOpenUrls` returns, and `luft_app::Activation::paths_within_reach` for an app that reads its command line |

Paths the app can already use stay as they are, so an app keeps real paths to what's in its own folders. A folder always goes through the portal, since nothing shows whether the app may change it.

## One Chromium for Luft, one each for everyone else

Sabine apps installed for every user, below `/usr/lib/sabine`, share one Chromium, which on Luft means only the apps in the image. Every other Sabine app gets a Chromium of its own: Sabine adds the app ID to the key of the runtime it asks for, so it never shares a browser process with Luft's apps or with another app. Inside a sandbox, a Sabine app always runs its own Chromium in the sandbox, with the Sabine host and CEF runtime the image ships, so an app built with a newer Sabine than the image waits for the next Luft update. schelf.store lists the Sabine version each release needs.

## Chromium's own sandbox, inside ours

Chromium sandboxes its renderers with user namespaces, which the AppImage sandbox keeps from apps. Flatpak solves the same problem with its Spawn portal, which starts a process in a new, smaller sandbox, and Zypak, which makes Chromium and Electron start their helpers through it. Luft does the same:

- The image ships Zypak. The sandbox starts Chromium and Electron apps through it, and tells Sabine where it is, which starts its own Chromium through it.
- The sandbox serves `org.freedesktop.portal.Flatpak` itself. The app's bus goes through a relay that answers that one name and passes everything else to `xdg-dbus-proxy` unchanged.
- `Spawn` starts the process in a sandbox that joins the app's user and process namespaces, so it can't create namespaces either, with the same system call filter, and confined by Landlock to its own mounts as the app is. It never gets more than the app: with the sandbox flag it gets only `/usr`, the app's files and what the caller exposes read-only, without home, devices, display, sound or bus unless asked for, and `NoNetwork` takes the network away. `SpawnSignal`, `SpawnStarted`, `SpawnExited` and the bus watch work as in Flatpak.

Renderers then run in their own namespaces with Chromium's system call filter, as in a Flatpak, and the apps no longer need `--no-sandbox`.

## Opening files and links

Whatever an AppImage opens, a download, a link or a folder, goes to the desktop portal, which starts your app for it in your own session. Schelf stands in for `xdg-open` for every AppImage: inside the sandbox it takes the place of `/usr/bin/xdg-open`, and an app you gave full access finds it first on its `PATH`, with `GIO_USE_PORTALS` set for GLib apps. It hands files to the portal's `OpenFile` and links to `OpenURI`, with the activation token of the click, so the app that opens comes to the front. That keeps the app for it out of the sandbox, and away from the folders the AppImage keeps its own files in: an app with full access runs with `XDG_CONFIG_HOME` and `XDG_DATA_HOME` pointing at its folder, which Schelf or Draft would otherwise take for yours.

The portal only opens files the sandbox shows at the path they have outside it: your Downloads folder, the folders you gave the app, and the app's own data, config, cache and state folders below `~/.var/app/APP-ID`. That's how Mailman opens an attachment it saved in its cache in your PDF viewer. A file an app writes straight into its stand-in home folder, outside those four, has another path outside the sandbox and doesn't open this way.

The relay follows the bus authentication of every client, including ones that send their commands without waiting for each answer, as zbus does.

## Sending files

An app sends a file it holds, such as a scan it just saved, through Kestrel's Send sheet, where people choose a device nearby or another app for it. The app never learns which devices or apps there are, and nothing goes anywhere until someone picks it in the sheet. `luft_app::share::send(paths)` is all an app calls.

`com.lantharos.Kestrel` exports `com.lantharos.Kestrel.Share` at `/com/lantharos/Kestrel/Share` on the session bus, with one method:

| Method | Does |
| --- | --- |
| `Send(a(sh) files)` | Opens the Send sheet for these files, each a name and an open file, and returns once it closes |

The app hands over open files rather than paths, so it works from a sandbox that can't see where they are, and the bus proxy of the AppImage sandbox lets this call through. Of Kestrel's other services it passes only the palette and `Play` on `com.lantharos.Kestrel.Sounds`, which plays a sound of the sound theme by name, as Mailman does when a message is sent. Kestrel holds the call to what a person could have asked for:

- It opens only while one of the caller's windows is in front: by the sandbox's app ID, or outside a sandbox by the process behind the window, or for Luft's own apps, whose windows Sabine's shared browser draws, by the program the window's app runs.
- One sheet is open at a time, and an app opens at most five a minute.
- Each file has to be a regular file with a plain name, at most 32 of them and 2 GB together. Pipes, sockets and devices are refused, and a file that grows while it's read is dropped.
- Kestrel copies the files into `~/.cache/kestrel/sent`, readable only by you, and keeps the copies for a day, so a device that's slow to accept still gets them.

The sheet lists the devices nearby that [Post](components/kestrel.md#post) finds, with the same flow as from Rover, and the apps that say they open every one of the files, apart from the app they come from. Files people drop on Post in the taskbar, or on a bare part of the taskbar, open the same sheet, without copies, since they're the person's own. An app opens its copy as if you'd opened it from Rover, so a sandboxed one gets it through the document portal.

## Secrets

The sandbox's `.flatpak-info` lists the names its bus proxy allows, as Flatpak's does. Since it names `org.freedesktop.secrets`, Luft's xdg-desktop-portal patch tells libsecret the Secret portal isn't there, and libsecret keeps passwords in Luft Keyring through the Secret Service, so Luft no longer rebuilds libsecret.

## Windows and macOS

The declaration travels with every bundle, so a store can show it and judge an app on any system. Neither system enforces it yet. The plan is AppContainer on Windows, with `network` as the internet client capability and `filesystems` as the library capabilities, and the App Sandbox on macOS, with entitlements written from the same keys when the bundle is signed. Chromium's renderers are sandboxed there already.
