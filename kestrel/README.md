# Kestrel

Kestrel is Luft's desktop shell. It uses a local Mutter 51 build with native window rounding and owns its panel, launcher, quick settings, notification center, and power menu in TypeScript. The imported engine retains GNOME Shell's C/St integration and the session services required for window management, authentication, screenshots, screencasts, and portals.

## Current checkpoint

- The engine and TypeScript UI compile against the GNOME 51 stack. The session launcher uses the locally built compositor.
- The development launcher supports a visible nested session and isolated captures at 1280×800 and 1440×900.
- The 48px glass taskbar reserves the bottom edge. Its launcher and favorite/running apps stay centered against the monitor while live network, Bluetooth when a device is connected, volume, battery on portable machines, and right-aligned, stacked date/time indicators sit on the right.
- Start’s default grid excludes apps pinned to the panel. Search includes every installed application, including pinned apps, and lists matches with their descriptions. An app or page whose name is exactly the query comes first. After that, names that start with the query rank highest, then names with a word starting with it, then keywords, then names containing it anywhere. Apps and Settings pages you open often and recently rise within that order and can pass a closer match you rarely use; launches from Start and the taskbar count, and older ones fade over a few weeks. The history stays in `~/.local/state/kestrel/launches.json`. Settings pages, recently used files, and simple calculations such as `12*4` or `(2+3)^2` appear alongside apps; Enter copies a calculation's result. The top match is highlighted while typing and Enter launches it. Pinning or unpinning refreshes the grid immediately. Down moves from search into the results or app grid; arrows and Tab navigate controls, and focused apps scroll into view.
- Hovering a running taskbar app shows live window previews with activation and close controls. Clicking an app with multiple windows opens the same picker, and Up opens it from a focused taskbar button. Alt-Tab switches between windows with live previews, their titles, and app icons; Alt and the key above Tab limits the switcher to the focused app. Alt-Escape cycles windows, and Ctrl-Alt-Tab includes the Kestrel panel.
- Lock mode hides the panel and dismiss all desktop surfaces immediately. The lock screen shows a large clock and date over the blurred wallpaper, then the account picture, name, and password field once woken. Below the clock, playing media has its controls, and new notifications are grouped by app with up to three of their titles and text. Turning off Show message content on the lock screen in the notification center's context menu reduces them to the app name and a count, except for apps that allow their content individually in Settings. Super and desktop context menus are unavailable while locked or while a system dialog holds focus. System dialogs dismiss open surfaces before taking focus.
- Every display has its own panel with Start, the taskbar, and the clock; network, volume, and other status icons stay on the primary display. Start, Quick Settings, and notifications open on the display whose panel was used, or under the pointer when opened from the keyboard. Each window minimizes into the taskbar on its own display. A panel hides only while the topmost window on its display is fullscreen or covers the whole display and is opaque; minimized windows, windows on other desktops, and translucent windows leave it visible. Panels also step aside for the all-windows view. Desktop context menus stay on the clicked display; outside-click dismissal covers all displays, and monitor changes dismiss surfaces before repositioning them.
- Quick Settings provides network and Bluetooth controls, device selection for audio output and microphone input, brightness, Do Not Disturb, Night Light, Dark Style, Keep Awake, and power profiles. Airplane Mode appears on machines with wireless radios, Keyboard Backlight on laptops that report one, and Auto Rotate on screens that can rotate. Keep Awake stops the screen from dimming and the session from going idle until it is turned off, or for 30 minutes, an hour, or two hours from its options, and shows the same eye as apps that keep the screen awake. Everything is a tile: compact glass controls place icons above their labels, controls that are on turn brighter, and an odd final tile spans the full width. Screenshot, Settings, and Lock are tiles too, showing their keyboard shortcut underneath, and laptops get a Battery tile with the charge level and time remaining. Volume, microphone, and brightness each take a full-width row, and their percentage floats above the handle while the level changes. Brightness also covers external monitors that accept brightness changes over DDC/CI once `ddcutil` is installed and can reach them; with more than one adjustable display, its arrow opens a slider for each, and the main slider moves them together. Controls follow the available hardware and services. Output and input device lists open inline beneath their slider. A tile's arrow expands it to the full width with its options directly underneath, and the other tiles glide aside to make room; its row partner moves below the options, and everything slides back when it closes. Drag a tile to reorder it. Right-click a tile to remove it, and right-click Quick Settings to add removed tiles back or reset the layout; the arrangement is remembered. Places with nothing to offer beyond what a click already does have no context menu. The surface grows to fit available space and scrolls when its content is taller. The microphone control remains available when a microphone is present, even without an active recording.
- The clock opens notifications, when there are any, above a month calendar with today highlighted; the center grows up to the top of the display before its list scrolls. Notifications are grouped by app, newest group first, each group a single rounded card with the app's name and icon above its notifications and a button to clear that app's notifications; groups with more than two show the newest two and a count that expands the rest. Apps that offer inline replies, such as messengers using the `inline-reply` notification action, get a Reply button in the notification center and in banners; it opens a text field, and Enter or the send button delivers the text to the app, which receives it through the `NotificationReplied` signal. When an app is playing media, a card at the top shows the track and artwork with previous, play or pause, and next controls; clicking it raises the player. The calendar follows the locale’s first weekday, pages between months, and returns to today from the month title. While Do Not Disturb is on, banners and sounds stay off except for urgent notifications; Settings can let an app through always or never, and can make an app's notifications leave the list once their banner closes. The notification center updates individual rows, batches notification bursts, and defers row construction while closed. Signal subscriptions follow the lifetime of their source and owning actor.
- The power button in the Start footer swaps the account row for Lock, Suspend, Log out, Restart, and Power off, delegating to the existing session action backend. Escape or the button returns to the account row.
- Backdrop capture updates only freshly painted regions in a separate cache for each display view. Each cache tracks valid pixels; partial damage schedules another paint only for missing pixels. Unchanged captures can reuse the blurred output without allocating an actor-blur framebuffer, and offscreen capture is clipped to valid pixels. Settled surfaces do not continuously redraw.
- Shell blur includes a rounded mask, a faint top-lit edge, and dimming for bright backdrops in its final shader pass. Menu corners stay clean, surfaces stand apart from the wallpaper, and white text stays legible over light windows, without an extra offscreen pass. Panel and menu blur share the same brightness without a tint overlay. The panel has square corners.
- Start uses six equal app columns with names wrapping to two lines, keyboard search, and a compact account and power footer with the AccountsService avatar when available. Panel hover highlights are inset and rounded, with up to four dots for each app’s open windows. A focused app’s dots stretch into short white bars, independently of pointer presses.
- Main surfaces slide in over 220 ms and out over 160 ms. The Start footer swaps between the account row and power options over 180 ms. Interrupted transitions reverse from their current position.
- The launcher uses the original two-part Luft mark at an optical size of 26px alongside 28px app icons, with its original proportions and a subtle split and opposing tilt on hover, without shrinking the two parts. Taskbar apps slide and fade in and out while their space expands or closes. Windows minimize into and restore from their taskbar button, scaling evenly and fading. New windows rise into place from slightly smaller while fading in, and closing windows shrink a little as they fade, with the same easing as minimizing; dialogs use a shorter version without the rise. Reduced motion keeps only the fades. The Start scrollbar is translucent, brightening on hover and drag. Search has a text-aligned caret that blinks while focused; running dots have a dedicated position beneath app icons. Newly opened surfaces stack above those sliding closed.
- Set `KESTREL_CSS_PATH` to a local stylesheet when launching the shell to reload styles after each saved change.

## Runtime scope

The GNOME overview, its app grid, dash, window picker, and search providers are not part of Kestrel, and neither is the GNOME extension system. The run dialog, Looking Glass, screen time limits, and parental controls are not part of Kestrel either. The screenshot window picker has its own window layout.

### Fonts

Kestrel ships Open Runde and Maple Mono NF and makes them the desktop's default system and monospace fonts. The session starts with a dconf profile of its own, the system's profile followed by Kestrel's defaults, so `org.gnome.desktop.interface` reads `Open Runde 11`, `Open Runde 12` for documents and `Maple Mono NF 11` until you choose otherwise, and resetting a font in Settings brings these back. Other desktops on the same account keep their own defaults. The shell registers both fonts for itself at startup, so its own text never depends on them being installed elsewhere.

The shell's text follows `font-name` as soon as it changes, and every pixel size in its stylesheet follows the text size in Settings (`text-scaling-factor`), as GTK apps do. GTK 3 and 4 apps read the same settings, X11 apps get them through XSETTINGS and X resources, Qt apps through the GTK theme, and Luft apps through the settings portal. `kestrel-settings` also points fontconfig's `sans-serif`, `system-ui` and `monospace` at the chosen fonts in `~/.config/fontconfig/conf.d/50-kestrel-families.conf`, for apps that ask fontconfig for a generic family, such as plain X11 and Qt apps and web pages.

Text is antialiased in grayscale with slight hinting, the defaults of `font-antialiasing` and `font-hinting`, which GTK 4, Chromium and the shell all agree on. Shell text keeps fractional glyph advances instead of rounding each letter to whole pixels, so spacing matches GTK 4 apps, and stays grayscale even when subpixel antialiasing is asked for, because the shell's glyph cache can only blend coverage as plain alpha. The clock, slider values and counts use tabular figures in fonts that have them.

Desktop Quick Settings owns only the device controls used by Kestrel. It does not construct a second native Quick Settings menu or duplicate microphone slider. GNOME's top bar is not part of Kestrel; the login and lock screens have their own controls.

GNOME’s calendar server integration, event list, world clocks, weather integration, GNOME welcome tour, break reminders, and unused status tiles have been removed with their resources. Local AccountsService integration remains for the login screen, unlocking, and the Start avatar. Authentication, location permission prompts, Thunderbolt authorization, accessibility, screenshots, and screen sharing retain their system backends.

Kestrel doesn't use the GNOME Desktop, GNOME Bluetooth or GNOME volume control libraries. Volume, sound devices and the microphone indicator come straight from the sound server, PipeWire or PulseAudio, and update as soon as it reports a change. Keyboard layout names come from libxkbregistry, including the layouts in `~/.config/xkb`, input method language names from iso-codes, Bluetooth straight from BlueZ, and the clock follows the clock settings in `org.gnome.desktop.interface` and catches up right away after the time zone or the system clock changes, including after sleep. Wallpapers are pictures or [videos](#live-wallpapers); GNOME's XML slideshows that change through the day are not supported.

### Performance workload

Run `kestrel/tools/session.sh performance` to measure resident memory and time since launch once the shell is ready, the emoji panel opening before and after its index is built and its search edits, repeated search edits, app-button reuse, an 80-notification burst, row creation while hidden, and settled desktop paints. Search timings cover synchronous update work; they are not end-to-end display latency. The command uses an isolated headless session and exits when finished.

## Install as a login session

`kestrel/tools/install.sh install` builds Kestrel, its Mutter, and its settings service into `/opt/kestrel` and links a Kestrel entry for the login screen, its systemd user units, and its portal preferences into `/usr/local`. It also installs the login screen's settings service with its D-Bus and polkit files and the `/var/lib/kestrel-greeter` directory, and the graphics watchdog described below with its D-Bus policy and the units that start it. Nothing from the system GNOME installation is replaced. Reinstalling removes files an earlier install put in the prefix that Kestrel no longer builds. Pass a prefix as the second argument to install elsewhere; session entries are only linked for prefixes under `/opt` or `/usr`. `kestrel/tools/install.sh remove` removes the prefix and the links.

### Memory pressure

The shell runs with the lowest OOM score and inside the session slice, which Fedora's resource daemon protects from reclaim, so a runaway app cannot push Kestrel out of memory. The installer also links a policy for the user's app slice: when apps spend half their time waiting on memory for ten seconds, or swap is nine-tenths full, systemd-oomd closes the app responsible before the kernel has to step in. The policy applies to every session of the user, including GNOME. Every app Kestrel starts runs in its own `app-kestrel-<app>-<pid>.scope` in that slice. When an app is closed this way, or by the kernel, Kestrel shows a notification naming the app and how much memory it had used.

The busy pointer after launching an app clears as soon as the app's first window appears, instead of waiting out the launch timeout for apps that never report their startup.

Apps that stop answering get the Not Responding dialog after the usual few seconds. Games, recognized by being fullscreen or by the game detection below, get a minute before it appears, since they often stall while loading.

### Variable refresh

On displays with variable refresh turned on, the refresh rate follows fullscreen games and stays at the display's fixed rate for everything else. Video players and browsers show video at frame rates that don't line up with the display, and following them makes the brightness of many panels, VA panels in particular, flicker. A window counts as a game when its app says it shows a game through the Wayland content type protocol, when it runs as a Steam, Lutris or Heroic game, inside gamescope, or when its app belongs to the Game category. Apps that say they show video or photos never get variable refresh. Settings → Displays can let the refresh rate follow every fullscreen app instead, which is the `variable-refresh` key in `com.lantharos.kestrel`.

### When the graphics card stops responding

Apps may freeze; the desktop shouldn't. Kestrel deals with graphics trouble at three levels.

When the driver resets the GPU and tells Kestrel that its drawing context was lost, Kestrel creates a new one and redraws everything it owns: windows, wallpapers, icons, text, blur, the cursor, tray icons and clipboard thumbnails. Apps keep running and their windows come back with their current contents. This covers the resets the driver recovers from on its own, such as an NVIDIA channel reset after a timeout or a bad memory access. It can't help when the whole GPU stops, for example when the NVIDIA driver logs "GPU is probably locked", an Xid 79 ("fallen off the bus"), or a failed TLB invalidation; those need a restart.

For that case, `kestrel-settings` asks Kestrel every three seconds whether it is still answering and how long its last frame has waited to reach the screen. It doesn't ask while the session is in the background or for half a minute after waking from sleep. If Kestrel hasn't answered for six seconds, or a frame has waited ten, the power button stops going to Kestrel and goes back to the computer, so a press shuts down cleanly instead of needing a hard power-off; it returns to Kestrel as soon as Kestrel answers again. After fifteen seconds `kestrel-settings` tells the system watchdog, `kestrel-watchdog`, which only acts when the kernel agrees that the graphics hardware is in trouble: either the kernel logged a GPU failure (an NVIDIA Xid, a locked GPU, a failed TLB invalidation, a page flip that timed out, or an AMD or Intel GPU hang) since shortly before the freeze began, or one of Kestrel's threads has been stuck inside the graphics driver for ten seconds. A slow frame, a busy app, a game that is loading, a debugger attached to Kestrel, a screen that is off, or a session that just woke up never triggers it.

When it does act, the watchdog writes what it saw to `/var/lib/kestrel-watchdog/incidents`: the time, how long Kestrel was stuck, the graphics cards and drivers, the kernel's graphics messages, and `nvidia-smi -q` if it still answers within five seconds. If the disk can't be written, a short version goes into an EFI variable instead and is moved to the disk at the next start. Then it restarts the computer through logind, which gives apps the usual chance to save. If that restart is still stuck a minute and a half later, the watchdog forces it, and if even that hangs for another minute, it syncs, remounts the disks read-only and resets the machine through the kernel. The full kernel log of the stuck session stays in the journal, so `sudo nvidia-bug-report.sh` after the restart collects it for a driver bug report.

At the next start, before the login screen, Sushi explains what happened and when, with suggestions that fit the computer: turning on Above 4G Decoding and Resizable BAR when the graphics card supports it but the processor can only reach 256 MB of its memory, installing a newer NVIDIA driver when one is waiting, or checking the card's seating and power when the kernel lost contact with it. When the firmware supports it, pressing F restarts straight into the firmware settings. The screen continues by itself after twenty seconds or on Enter, and appears once per incident. After signing in, a notification links to Recent problems under About in Settings, which keeps the details of the last ten incidents.

#### NVIDIA graphics cards

With Resizable BAR off in the firmware, the processor can only map 256 MB of an NVIDIA card's memory at a time, and every app that uploads video frames or textures through that window shares it. Browsers playing video full screen can fill it, and when an allocation in it fails the driver can stop responding. Turning on Above 4G Decoding and Resizable BAR in the firmware settings lets the window cover the whole card. The driver can also resize the window itself when the firmware leaves room for it, with `options nvidia NVreg_EnableResizableBar=1` in a file under `/etc/modprobe.d`; rebuild the initramfs afterwards with `sudo dracut --force` so the setting applies from the start, which also keeps Sushi's initramfs module in place. A full shutdown, rather than a restart, may be needed before the new size applies. `nvidia-smi -q -d MEMORY` shows the size of the window under BAR1 Memory Usage.

Kestrel itself maps very little of that window. Measured on an RTX 3060 at 3440×1440, the desktop with its blur, previews, screenshots and clipboard images took 2 to 5 MB of it and between 130 and 210 MB of graphics memory, and a live wallpaper about 4 MB and 480 MB, less while it's covered.

### Session

The login screen starts `kestrel-session`, which hands the user's environment to systemd and starts `kestrel-session.target`; logging out stops the target and ends the session. Kestrel's own session manager takes the place of gnome-session. It runs as a small process that starts before the shell, keeps track of apps that ask to keep the screen awake or to hold off logging out, marks the session idle after the configured delay so the screen dims and locks, and asks for confirmation before logging out, restarting, or powering off. Before ending the session it asks running apps whether they are ready and moves on as soon as they answer. Apps that talk to GNOME's session manager work unchanged.

Just before the shell, the target starts `kestrel-settings`, Kestrel's settings service. It keeps apps' accessibility support switched on while the screen reader, magnifier, or on-screen keyboard is in use and starts Orca with the screen reader setting, and it gives a new account the computer's keyboard layout. Whenever Xwayland starts, the shell hands it to the service, which gives X11 apps their theme, icons, fonts, cursor, input method, and the other desktop settings through XSETTINGS and X resources. It loads `/etc/X11/Xresources` and your `~/.Xresources` into Xwayland as well, including the `#include`, `#define`, and `#ifdef` lines that `xrdb` understands, and runs the scripts in `Xwayland-session.d`. GTK apps also read the font timestamp, GTK modules, and the animation setting from the service on `org.gtk.Settings`, and the service keeps fontconfig's generic families on the chosen fonts, as described under [Fonts](#fonts). Apps that keep the screen awake through `org.freedesktop.ScreenSaver` reach the session manager directly.

The service also runs the night light. It warms the display from sunset to sunrise or between set hours and eases each change in over a few seconds. Sunset and sunrise come from the location services when they are on, and from the time zone's main city otherwise. The compositor applies the color temperature the service publishes on `com.lantharos.Settings.NightLight`, and the settings live under `com.lantharos.kestrel.night-light`. With the time zone set automatically, the service looks up the time zone at the current location after signing in and after waking from sleep, using time zone borders built into it, so the location never leaves the computer. It changes the time zone without asking for a password and shows a notification with the new one. The time zone borders come from the timezone-boundary-builder project, © OpenStreetMap contributors, under the Open Database License.

Housekeeping happens there too: thumbnails past the age and size limits are removed, trash older than the chosen age is emptied when Privacy settings ask for it, and so are your own temporary files that haven't been opened or changed for that long. Once a day, and a couple of minutes after signing in, the service goes through `/tmp`, `/var/tmp`, and `$TMPDIR` without following links or crossing into other disks, removes old files, links, and folders that belong to you, and leaves alone sockets and any folder an app holds a lock on. A notification also warns when a disk is almost full, with buttons to look through it in Disks or empty the trash. When the sound theme changes, the service drops its cached event sounds so the new ones play.

USB devices plugged in while the screen is locked wait until it is unlocked, while keyboards, mice, and security keys work right away so you can still sign in. Once you unlock, the service shows a notification naming what has just become available, with a button that opens the security settings. When Luft's Secure Boot key was meant to be added at the last restart and wasn't, a notification after signing in says so: either the steps will show again at the next restart, or, after a few tries, that it can be tried again from Settings.

Power management lives in the service as well. After half the screen blank delay without use the screen and keyboard light dim, and once the screen locks it turns off after half a minute. After the chosen time without use, the computer suspends, hibernates, logs out, or powers off, with a notification shortly before, unless an app keeps the session awake. Plugging the charger in or out plays a short sound, and plugging it in keeps a dimmed screen awake for a moment. The service holds off sleep until the screen is locked, keeps the computer awake with the lid closed while an external monitor is connected, decides what the power keys do while Kestrel is answering, switches to the power saver mode when the battery runs low, and follows the light sensor with the screen brightness when there is one. The keyboard light is adjusted through `com.lantharos.Settings.KeyboardLight`, and these settings live under `com.lantharos.kestrel.power`.

Airplane mode comes from the service too, on `com.lantharos.Settings.Rfkill`: it switches every radio, or only Bluetooth, through the kernel's radio switches and turns mobile broadband off with them. While the session is active, the radio keys go to the desktop instead of the kernel. For printing, the service lists the printers with what each one can do and sends documents to them on `com.lantharos.Settings.Printing`, asks the printing service for updates, and shows when your documents print, finish, stop, or fail, when a printer you print to needs paper, toner, or attention or can't be reached, and when a printer is added to the computer.

The shell handles the media and hardware keys itself, under `com.lantharos.kestrel.media-keys`: volume and microphone keys with their on-screen levels and a short sound, playback keys for the app that plays media, keyboard light, touchpad, rotation lock, airplane mode, battery, eject, app launchers, Lock, Log out and the power keys, accessibility toggles, and your own shortcuts, which Settings adds under the same schema. The rotation lock lives under `com.lantharos.kestrel.touchscreen`, where the compositor reads it too. A headset plugged into a combined jack asks what it is.

The test sessions run the service against a stand-in for the system services, so its power handling is checked without the real computer suspending. IBus provides input methods, and XDG autostart entries start with the session. Kestrel's own settings live under `com.lantharos.kestrel`, separate from GNOME Shell's, so both desktops can be used on the same account. Kestrel doesn't need gnome-settings-daemon or any of its settings.

Kestrel answers apps' portal requests itself, as described under [Portals](#portals). The session identifies as `Kestrel;GNOME`. Portal preferences are found under the first name, `kestrel-portals.conf`, and the second keeps apps that only know a list of desktops working as they do on GNOME:

- Electron apps such as Discord and Claude keep their saved sign-ins in the keyring only on desktops they recognize. On any other desktop they fall back to a fixed key, can no longer read what they saved before, and sign you out.
- Qt apps without a platform theme of their own use the GTK theme, with its fonts, dark style and file dialogs, only on desktops they recognize, and plain Fusion everywhere else.
- Java apps that follow the system look use the GTK one only on GNOME.
- Autostart entries limited to GNOME, such as file indexing and the Mozc input method helper, keep starting, and GeoClue's demo agent, which is hidden on GNOME, stays out of the way of Kestrel's own location prompt.

### Keyring

[Luft Keyring](keyring/README.md) is the session's keyring: it answers apps that store passwords through the Secret Service and the Secret portal, is the session's SSH agent, and opens when you sign in or unlock the screen, with your password or a fingerprint. `kestrel/tools/install.sh install` builds and installs it alongside Kestrel; its README lists what that sets up.

## Login screen

Kestrel is also the login screen. It runs on [greetd](https://git.sr.ht/~kennylevinsen/greetd), a small login daemon that leaves the look entirely to the greeter, so it can start any Wayland session installed on the computer, Kestrel or another desktop. greetd runs `kestrel-greeter`, which starts Kestrel in its login mode: the compositor with the login screen and nothing else, so no panel, apps, notifications, or session services.

It looks and moves like the lock screen and shares its code. It opens on the large clock and date over the blurred wallpaper. A click, a key, or a swipe brings up the people on this computer at the bottom left with their account pictures, and the key that wakes it is never typed into the field. The person who signed in most recently is already chosen, so typing starts their password right away. Choosing someone else crossfades to their wallpaper and accent color. Accounts hidden in Settings, and accounts the computer doesn't list, sign in with Another account, which asks for a username first; Back returns to it.

Sign-in follows whatever the computer's sign-in rules ask for: a password, a verification code or other second step, a fingerprint, and any notes along the way, which appear under the field, with warnings in brighter text. A second step shows Back to start over. A wrong password shakes the field and says so, and the field is ready for another try. Caps Lock shows a warning while typing a password. After two minutes without input the screen returns to the clock.

At the bottom right are the session, the keyboard layout when there is more than one, accessibility, and power. The session picker lists every installed Wayland session and starts with the one each person used last. Accessibility turns on larger text and, when Orca is installed, the screen reader. Power offers Suspend, Restart, and Power off.

### From boot to desktop

The login screen and the desktop hand the screen to each other without it going black or showing text. When the computer starts with [Sushi](../boot/sushi/README.md), the login screen's first frame shows the firmware logo exactly where Sushi left it, and the clock and wallpaper fade in over it once the wallpaper has loaded, so nothing else is ever shown in its place. Signing in fades the login screen down to the blurred wallpaper, and the desktop starts from that same blurred wallpaper before it settles into place, so the two read as one motion. That first frame holds only the blurred wallpaper; the panel, Start, Quick Settings and the rest of the desktop are built right after it is on screen, before they zoom in. Signing out fades the desktop to black, and the login screen comes up from black. Restarting or shutting down, from the desktop or the login screen, fades to black the same way and hides the pointer. Whenever Kestrel exits, its last frame stays on the display, so the login screen, the desktop or Sushi's shutdown splash replaces it without the monitor switching off and losing its signal.

The login screen starts in the same display mode as the desktop: Kestrel copies your display arrangement to the login screen whenever you change it, so the monitor doesn't switch modes when you sign in. Num Lock starts the way your last session left it, and on for a computer nobody has signed in to yet. Whatever the login screen and the sessions it starts print goes to the journal, never to the screen.

### Wallpaper and settings

Each person's own wallpaper appears when they are chosen. Kestrel keeps a copy for the login screen up to date whenever the wallpaper or the light and dark style changes; for live wallpapers it is the still frame. The login screen takes its accent color from the wallpaper the same way the desktop does. Its text is always in Luft's own fonts: the screen is shared by everyone, and fonts people install for themselves live in their home folders, out of its reach. Settings can instead show one picture for everyone. Without a picture, such as for Another account, the login screen is black, and so is anything behind a wallpaper on the desktop and lock screen.

The Login Screen page in Settings chooses between everyone's own wallpaper and one picture for everyone, whether people are listed and who is left out, the session that starts by default, and which account signs in automatically when the computer starts.

The settings are kept by `kestrel-greeter-service`, which answers on the system bus as `com.lantharos.Greeter1`. It starts when it is needed and quits after a minute without requests. Everyone can update their own login wallpaper, the display arrangement and Num Lock without a password while signed in at the computer; everything else asks for an administrator. Wallpapers arrive as open files, never as paths, and are stored as pictures of at most 3840 pixels on the long side in `/var/lib/kestrel-greeter`, which the login screen reads directly. Display arrangements arrive the same way and are kept as `/var/lib/kestrel-greeter/display/monitors.xml`. Automatic login is written as the `initial_session` in greetd's `/etc/greetd/config.toml`, which greetd runs once after each boot. The last session each person used is remembered in AccountsService.

### Lock screen

The lock screen checks passwords itself through `kestrel-authenticate`, a small system service that speaks greetd's protocol, so the lock screen and login screen share the same prompt. `kestrel-authenticate.socket` listens on `/run/kestrel/authenticate` and starts a separate copy of `kestrel-authenticate@.service` for each connection. Each copy asks who connected and only checks that person's own account, using Kestrel's own sign-in rules: `kestrel-unlock` for passwords and `kestrel-unlock-fingerprint` for fingerprints. It runs with the same restrictions as polkit's helper: it can reach other programs through local sockets, but nothing on the network, and it can't change anything on disk. When the lock screen moves on, for example after a password works, the copy that was still waiting for a finger ends right away and lets go of the fingerprint reader.

When fingers are enrolled, the fingerprint reader listens while the password field is shown. Its instructions appear as a quiet line under the field, a finger it doesn't recognize says so, and a recognized finger unlocks the session just like the right password. Typing a password never waits for the reader, and a wrong password leaves the reader listening. Without a reader or enrolled fingers, the lock screen doesn't mention fingerprints at all.

Like the login screen, the lock screen shows its controls at the bottom right once you wake it: the battery on portable computers, the keyboard layout when there is more than one, accessibility, and power. Accessibility turns the screen reader, zoom, the on-screen keyboard, high contrast, dwell click, and larger text on or off. Power offers Suspend, and Restart and Power off when the computer allows them while locked; those ask first, as they do on the desktop.

greetd runs one session at a time, so the lock screen has no Switch User.

### Setting up the login screen

A fresh Fedora install starts GDM. Install greetd and Kestrel, give greetd Kestrel's configuration, and start greetd in GDM's place. The login screen runs on the seventh virtual terminal, so it never shares one with the text console:

```bash
sudo dnf install greetd
kestrel/tools/install.sh install
sudo cp /opt/kestrel/share/kestrel/greetd.toml /etc/greetd/config.toml
sudo systemctl disable gdm && sudo systemctl enable greetd
systemctl reboot
```

If the login screen doesn't appear, press Ctrl+Alt+F3 for a text console, sign in there, and check `journalctl -b -u greetd` for what went wrong.

### Testing the login screen

`kestrel/tools/session.sh greeter` runs the login screen in a headless session against a stand-in for greetd with scripted sign-ins (a correct password, a wrong one, notes and warnings along the way, and a second step), stand-ins for the account, login and locale services, and the settings service itself running as a normal user. It checks the people list, password entry, wrong passwords, typed usernames, switching people with their wallpapers and accent colors, the session picker, keyboard layouts, that its text is in Open Runde and grows with larger text, and power, then signs in and confirms the chosen session starts and is remembered. It saves `login-clock.png`, `login-users.png`, `login-password.png`, `login-wrong-password.png`, `login-switch-user.png`, `login-session-picker.png`, `login-power-menu.png`, and `login-second-factor.png`, and reports the login screen's resident memory and processor use while idle. `kestrel/tools/session.sh capture` runs it after the desktop checks.

`kestrel/tools/session.sh capture` also opens each Luft app (Rover, Settings, Disks, Draft, Tern, Magpie, Barometer and Schelf) once on a teal test wallpaper. It waits past Sabine's loading screen for the app's first page frame, then checks from the window's pixels that it settles on the palette's dark surface, turns pure black along with the desktop, and follows it into the light style, and that Rover and Magpie draw the accent color in both. It saves `rover-dark.png` and `rover-light.png` and the same pair for every other app, then opens every other Settings page from its `kestrel-settings:` link, such as `kestrel-settings:security`, and saves it in both styles as `settings-security-dark.png` and `settings-security-light.png`. The apps get a home folder of sample documents and pictures inside the session folder, a Sabine service of their own, and the stand-in system bus, which also stands in for device security, USB protection and the firmware updater's hardware security report, so they never list your files or reach your system services. They run from `~/.local/share/sabine/apps`; to check your own changes instead, run `bun run desktop:build` in the app's folder and list it in `KESTREL_DEV_APPS`, for example `KESTREL_DEV_APPS=rover,settings`. Disks then works through a stand-in UDisks on that bus, with an NVMe system drive, an encrypted hard drive, a failing hard drive and a USB stick: it unmounts and mounts, saves a partition as a disk image and compares it byte for byte, formats, safely removes the stick, unlocks the encrypted partition, fills free space with a new partition, starts a self-test, and writes an image back after opening it from a file, checking each step against the calls UDisks received. When `rclone` is on the `PATH`, Rover connects to a local WebDAV server with a self-signed certificate and an FTP server, both serving a folder in the session cache, through a GVfs daemon of the session's own that keeps its FUSE folder in the apps' runtime folder. It confirms the certificate, signs in and remembers the password in a stand-in keyring, connects to FTP by typing its address after `Ctrl+L`, and reconnects to WebDAV by typing an address after clicking the path bar, which checks that the location is selected so typing replaces it.

The same run changes the system and monospace fonts and checks that the shell's clock, a GTK 4 app, a GTK 3 app under Xwayland, Settings and Tern all follow right away, that resetting them brings back Open Runde and draws the Luft apps exactly as before, and that larger text reaches the shell and the Luft apps. It saves four times enlarged crops of each, such as `fonts/gtk4-default.png` and `fonts/gtk4-changed.png`, for judging the rendering by eye.

Test sessions keep their settings, caches and app data in `kestrel/run` by default. Set `KESTREL_SESSION_DIR` to a folder of its own to start from a clean profile or to run several sessions side by side, and `KESTREL_CAPTURE_DIR` to keep their screenshots out of `docs/screenshots`.

## Work before a Luft session

1. Log into the Kestrel session on real hardware and qualify it end to end. The TypeScript UI is loaded by a reduced upstream `main.js` path.
2. Qualify monitor hotplug and mixed display scaling on hardware, and complete notification actions and persistent preferences.
3. Verify polkit, keyring, network credentials, lock and unlock, OSD, accessibility, and the greetd handoff under a real login session.
4. Package Kestrel with a pinned Mutter ABI for Luft, review runtime dependencies, and test on a disposable machine before making it a selectable default session.

The virtual session checks the build, JS startup, and captured rendering. It does not validate a physical display, login manager, or suspend.

### Start folders and app order

Drag an app onto the center of another app to create a folder, or onto an existing folder to add it. Drop beside an icon to rearrange apps or folders; insertion marks show the position. The grid scrolls when a dragged icon approaches its top or bottom edge.

Open a folder to launch or rearrange its apps. Edit its name in the header. Drag an app onto the Apps breadcrumb to move it back out, or use its context menu. Right-click a folder to rename it or ungroup its apps. Empty folders disappear. Escape returns to Apps before closing Start.

App buttons are reused across searches, folders, and reordering. Search names are indexed when the installed app catalog changes.

Taskbar buttons show what apps report through the launcher entry D-Bus interface used by Discord, Telegram, Firefox, and other apps: an unread count in a small red pill at the top right and a progress bar beneath the icon in the accent color. Apps whose windows ask for attention, or that mark themselves urgent, flash an orange highlight three times and keep it until they are focused, instead of posting an "is ready" notification. While an app reports progress, the bar replaces its window dots beneath the icon. Counts and progress clear when the app exits.

Resting the pointer on the far right edge of the panel fades every window on the current desktop away to show the desktop, and moving off brings them back. Clicking the edge minimizes those windows; clicking again restores them.

Drag an app from Start onto the panel to pin it where it is dropped, or drag pinned apps to reorder them. Running apps that are not pinned always follow the pinned ones and cannot be dragged.

### Taskbar options

Taskbar under Appearance in Settings, which Taskbar settings in the taskbar's context menu also opens, changes these keys in `com.lantharos.kestrel`. Every change applies at once; moving Start and the apps, changing the size and switching between edge to edge and floating animate.

| Key | Values | |
| --- | --- | --- |
| `taskbar-alignment` | `center`, `left` | Where Start and the apps sit |
| `taskbar-look` | `glass`, `solid`, `transparent`, `accent` | Blurred glass, the palette's dark surface, nothing behind the icons, or glass tinted with the accent. Only glass and accent blur what is behind them, and with Pure black glass turns black. Transparent gives icons, text and window dots a soft shadow so they stay readable on light wallpapers |
| `taskbar-style` | `bar`, `floating` | Along the whole bottom edge, or 8px away from the bottom and sides with rounded ends |
| `taskbar-size` | `compact`, `normal`, `large` | 40px with 22px icons, 48px with 28px icons, or 56px with 34px icons |
| `taskbar-auto-hide` | `never`, `always`, `windows` | Whether the taskbar slides away, either always or only while a window touches it. It comes back when the pointer reaches the bottom edge, when Start or another surface opens from it, or when it takes keyboard focus, and stays while a menu or window preview is open. While it hides itself it reserves no space, so maximized windows fill the screen |
| `taskbar-show-pinned` | `true`, `false` | When off, the taskbar lists only running apps, Start lists pinned apps with the rest, and pinning leaves the menus |
| `taskbar-displays` | `all`, `primary` | Whether other displays get a taskbar too |
| `taskbar-windows-per-display` | `true`, `false` | Each taskbar lists pinned apps and the apps with windows on its own display; dots, previews, clicks and the context menu use only those windows |
| `taskbar-windows-per-workspace` | `true`, `false` | The taskbar lists pinned apps and the apps with windows on the current workspace, and updates as you switch workspaces or move windows between them; dots, counts, previews, attention and progress, clicks and the context menu use only those windows. Opening an app whose windows are all on other workspaces opens a new window on this one, or switches to its window when the app keeps a single window. With `taskbar-windows-per-display`, each taskbar lists only windows on both its display and the current workspace. Alt+Tab follows `current-workspace-only` in `com.lantharos.kestrel.window-switcher`, which is on by default |

The space a taskbar reserves is the bar plus its floating margin, so maximized and snapped windows, Start, Quick Settings, notifications, window previews and volume and brightness popups all stay clear of it. Fullscreen windows still hide it as before.

Folder contents, names, and ordering are saved across sessions. Apps pinned to the panel stay hidden in the default grid and folder views, while search finds individual apps regardless of their folder or pin status.

### Context menus

Right-click an app in Start or the panel for launch actions, open windows, pinning, window sizing, minimizing, and closing. The panel offers Show desktop, a system monitor when one is installed, and Taskbar settings; the clock, status area, desktop background, account area, Quick Settings tiles, notifications, and search field offer relevant shortcuts. Submenus slide in from the side and Back slides them out; a menu that grows resizes before its content slides, and one that shrinks slides first. Menus also open with the Menu key or Shift+F10 on a focused control; Escape closes the menu and returns focus to where it was before the menu opened. Long app menus scroll within the screen. Ctrl+Shift+Esc opens the system monitor, Barometer when it is installed, from anywhere.

### All windows

Super+Tab, or Show all windows in the panel's context menu, hides the panel and lays out every window on the current desktop over the blurred desktop, most recently used first, in rows that keep their proportions. Each window shows its app icon and title, with a close button on hover or focus; the middle button or Delete closes a window, and clicking one or pressing Enter focuses it. A strip along the bottom shows each desktop with its wallpaper and windows. Clicking a desktop switches to it without closing the view, and dragging a window onto a desktop moves it there. Escape, Super+Tab again, or clicking empty space closes the view. Alt+Tab remains the window switcher.

### Workspaces

Kestrel keeps one empty workspace alongside occupied workspaces, up to ten total. Empty workspaces are removed as windows close or move. Super+1 through Super+9 selects a workspace and Super+0 selects the tenth; Super+scroll, scrolling over the panel, or swiping sideways with three fingers moves between adjacent workspaces. Transitions use the compositor’s workspace slide animation. These bindings replace GNOME's overview application shortcuts.

### Board mode

Any desktop can be turned into a board: an endless canvas where windows lie side by side instead of on top of each other. Swipe up with four fingers or press Super twice quickly to turn the current desktop into a board, and swipe down with four fingers or press Super twice again to go back. Each desktop keeps its own choice, and switching between them with a four-finger sideways swipe slides boards and ordinary desktops alike. A single press of Super still opens Start right away.

On a board the taskbar steps aside and a small pill in the corner shows the time, battery and status icons; clicking it opens Quick Settings. The canvas sits on a blurred, dimmed copy of the wallpaper with a dot grid that moves and scales with it.

- Pan with three fingers, by dragging empty canvas with the left or middle button, by scrolling over empty canvas, or with Super and the arrow keys while no window is entered. A three-finger flick keeps gliding for a moment.
- Zoom by pinching, with Ctrl and the scroll wheel over empty canvas, with Super and the scroll wheel anywhere, or with Super+= and Super+-. Zooming goes from an overview of the whole board up to 100%. Super+0 fits the whole board, and so does double-clicking empty canvas.
- Move windows by their title bar, by dragging with Super held, or by tapping with three fingers and then swiping. A window dropped onto others pushes them aside, and edges snap flush so windows can sit edge to edge. Windows never overlap.
- New windows open in the middle of the current view, in the nearest free spot. Activating a window that is mostly out of view pans the board to it.

#### Working in a window

Enter a window to work in it: the board glides until the window fills the screen with a small margin, at 100% when it fits, and the window takes the keyboard. The other windows dim a little, and a small grid button appears next to the corner pill.

- Enter a window by clicking it while the board shows windows below 60%, by spreading three fingers over it, with Super+Enter on the focused window, with Alt+Tab, or by maximizing it, for example by double-clicking its title bar. While windows are shown that small, a click picks the window instead of reaching the app, dragging moves it from anywhere, and two-finger pinches and scrolling act on the board. From 60% up, the pointer goes straight to the app.
- Move to the nearest window in a direction with Super and the arrow keys, or by swiping left or right with three fingers, which slides the next window in the way the fingers move. The board travels there with a slight camera arc and focuses the window.
- Step back out with Super+Escape, by pinching in, with Super and scrolling down, by swiping down with three fingers, or with the grid button. The board returns to the view you entered from, or fits the whole board if there was none. When an app holds the desktop's shortcuts, Super+Escape gives them back first.
- The view follows an entered window when it grows, shrinks or moves on its own, and settles again after you move or resize it. A window that opens while you work in another opens beside it, any window that takes focus is entered in turn, and closing the entered window steps back out.
- Panning or zooming yourself leaves the window without moving the view.

Three fingers stay on the board and four fingers leave it: a three-finger swipe down steps back out of a window, and a four-finger swipe down leaves the board, even from inside a window.

Leaving a board puts the windows you can see back on the ordinary desktop where they were on screen, at their normal size, and minimizes the ones out of view. An entered window, or one the board was zoomed to fit, is maximized. Turning the board on again brings back every window, the view, and the entered window exactly as they were. Reduced motion turns the board's animations and gliding off.

`kestrel/tools/session.sh capture` turns a desktop with four test windows into a board by pressing Super twice, checks that no windows overlap and that the next desktop stays ordinary, pans and pinches through the same handlers the touchpad uses, moves windows with a three-finger tap and swipe and with Super held, then lays the windows out in a grid and enters them: by clicking one in the overview and typing into it, with Super and each arrow key to the expected neighbor, Super+Escape and a pinch back to the exact overview, Super+Enter, a three-finger spread, three-finger swipes sideways and down, and Alt+Tab. It checks that the view follows an entered window as it grows and moves, that a new window opens beside it, and that a four-finger swipe still leaves the board from inside a window, maximizing it. It then returns to the board and checks where every window ends up. It saves `board.png`, `board-entered.png`, `board-exit.png` and `board-exit-maximized.png`.

### System dialogs

The retained session components provide polkit authentication, NetworkManager Wi-Fi credentials, and removable-volume prompts. The shell also exposes device-access permission dialogs, audio-device selection, mount password and question dialogs, logout and shutdown confirmation, screenshot and screencast selection, and accessibility prompts. Polkit authentication continues to use the system's backend, and the lock screen checks passwords as described under [Lock screen](#lock-screen).

Luft's keyring asks through Kestrel's own prompts, which look like the other password dialogs. On the session bus, `com.lantharos.Kestrel` exports `com.lantharos.Kestrel.KeyringPrompter` at `/com/lantharos/Kestrel/KeyringPrompter`, and only the program that owns `org.freedesktop.secrets` may use it:

| Method | Arguments | Returns | Asks |
| --- | --- | --- | --- |
| `Access` | `s` handle, `a{sv}` request | `u` response, `a{sv}` results | Whether an app may use something. The request can carry `title`, `body`, `app` (a desktop ID, whose icon is shown), `icon` (a symbolic icon when there is no app), `allow` and `deny` (button labels), `remember` (`b`, offers Remember for this app, checked to begin with) and `fingerprint` (`b`, a touch on the reader decides, so the prompt only offers to deny). The results hold `remember`. |
| `Password` | `s` handle, `a{sv}` request, `h` secret | `u` response | A password or PIN. Besides `title`, `body`, `app` and `icon`, the request can carry `label` (the field's name), `warning`, `numeric` (`b`, a PIN), `confirm` (`b`, a second field that must match, for a new PIN), `fingerprint` (`b`, mentions the reader as an alternative) and `continue` (the button label). What the person types is written to the secret, the write end of a pipe, which is then closed; it never travels over the bus. |
| `Close` | `s` handle | | Closes the prompt with that handle, open or still waiting. |

A response of 0 means allowed or entered, 1 means the person declined, and 2 means the prompt was closed by `Close`, by the screen locking, or by a newer prompt with the same handle. After a password is entered, its prompt stays open and waits: `Close` ends it once the keyring has checked the password, and another `Password` call with the same handle, usually with a `warning`, asks again in the same dialog. One prompt shows at a time and the rest wait their turn; prompts also wait while the screen is locked, and locking the screen closes an open one. Handles are kept apart per caller, so one program can't close or answer another's prompt.

GnuPG asks for passphrases and PINs through `luft-pinentry`, a pinentry that shows the same prompts. `com.lantharos.Kestrel.Pinentry` at `/com/lantharos/Kestrel/Pinentry` takes `Password` (`s` handle, `a{sv}` request, `h` channel, returning `u` response and `a{sv}` results with `remember`), `Confirm` (`s` handle, `a{sv}` request, returning `u` response) and `Close`. A password request can also carry `cancel` (the button label), `mismatch` (the warning when the two entries differ), `remember` (`b`, offers Save in your keyring) and `quality` (`b`, shows a bar that fills as GnuPG rates the passphrase while it's typed); a confirmation can carry `alternative`, a third button answered with 3, and `single`, for a message with only one button. The channel is one end of a socket: Kestrel writes `Q<length>` and the passphrase typed so far whenever it needs a rating and reads the rating back as a line, then writes `P<length>` and the passphrase once it's entered, so neither ever crosses the bus. Without a Kestrel session, `luft-pinentry` hands over to the system's `pinentry`, which picks GNOME's, the terminal's, or another one as before.

When a VPN needs a password or a one-time code, Kestrel asks in its own dialog. Plugins whose sign-in helper can describe what it needs, such as OpenVPN, Libreswan and vpnc, are asked for that description and only Kestrel's dialog appears. For plugins without one, or when the helper isn't installed, Kestrel asks for the secrets the connection marks as not saved or saved by you, and for whatever the plugin asks about while connecting. OpenConnect VPNs sign in through `kestrel-openconnect`, which talks to the gateway with OpenConnect's library: each of the gateway's forms, its reasons when a sign-in is refused, and a certificate it can't vouch for appear in the same dialog, and a gateway that signs in through the web opens your browser. The session cookie, the gateway and its certificate then go to NetworkManager, and accepted certificates and form entries other than passwords are remembered with the connection.

When a Wi-Fi network wants you to sign in first, as in hotels and airports, a notification offers to, and Network Sign-In opens the network's page in a window of its own. It starts from an empty profile each time, shows the page's address and whether the connection to it is private, asks NetworkManager to check the connection after every page, and closes itself as soon as NetworkManager reports full connectivity. Without Network Sign-In installed, the page opens in your browser.

When an app asks to receive the desktop's own keyboard shortcuts, for example to record one, Kestrel asks first and remembers the answer. Luft's apps are trusted without asking. The app only receives the shortcuts while its window is focused, and Super+Escape returns them to the desktop.

Retained dialogs, native menus, switchers, notification banners, volume and brightness OSDs, screenshot controls, keyboard and input-method popups, lock notifications, and developer panels share Kestrel’s transparent blur treatment. Native menu arrows are removed. Volume and brightness OSDs are a slim pill-shaped bar, and volume boosted past 100% continues in red. Context menus fit their labels, and closing surfaces retain their selection highlight through the animation. Quick Settings, notifications, and window previews use compact content-based sizing.

The screenshot tool is a single pill-shaped glass bar above the panel: area, screen, and window modes grouped in one pill, the photo and video switch in another, the pointer toggle, a compact capture button, and close, with a tooltip on each. Selection handles are small dots on the selection outline. Apps that ask the desktop to select an area get the same white outline.

Single-row surfaces and controls are pills: the volume and brightness OSD, the workspace switcher, tooltips, text fields, dialog and notification buttons, and session actions. Larger popups use rounder corners: 24px for Start, Quick Settings, notifications, and dialogs, and 18px for menus.

Modal dialogs rise in as they open and use a symbolic icon for their purpose above stable, left-aligned headings, with shared action buttons where the default action stands out. Authentication shows a small account row above the password field. Wi-Fi, VPN, keyring, and encrypted-drive forms keep their field labels visible while typing; inputs share the Start menu's glass treatment, caret, selection, and focus styling. Password visibility controls and accessible labels remain available. Audio-device choices use full-width rows. Session warnings and permission dialogs use the same typography and list styling.

The capture command exercises audio selection, encrypted-volume password, and log out confirmation requests through D-Bus and cancels them without submitting credentials. It records a notification banner, media controls driven by a test player, a tray icon and its menu from a test app, the all-windows view with windows moved between desktops, grouped notifications and an inline reply, per-app Do Not Disturb and notification list rules, snapped windows returning together, taskbar counts, progress, and attention with desktop peek, every taskbar option with its alignment, margins, looks, sizes, reserved space, hiding and coming back, saved as `taskbar-bar-glass-dark.png`, `taskbar-floating-transparent-light.png` and the other looks and shapes in both styles, the taskbar listing only the current workspace's windows as workspaces switch and windows move between them, and, when the capture runs with `KESTREL_CAPTURE_SECONDARY_SIZE` such as `1280x800`, a taskbar on the main display only and each display listing its own windows, also together with the current workspace, the privacy button and its menu during a screen share, the keep-awake eye, Keep Awake, Dark Style, Airplane Mode, and Keyboard Backlight tiles against stand-in system services, global shortcuts from registration through the shortcut dialog, the wallpaper palette and its contrast, colors for other apps written next to existing styles and removed again, a cursor theme and size reaching the pointer and an X11 app running under Xwayland, including its X resources, and following later changes, app icons in each style on two wallpapers in light and dark, Start in Pure black, a custom dark style schedule, a live wallpaper that pauses under a maximized window, keeps the panel in front of it on an empty desktop, follows the light and dark style with a video of its own for each, and ends when a picture is chosen, the blurred wallpaper of the lock screen shown at once from its stored copy, matching the live blur pixel for pixel and following a new wallpaper, clipboard history opening at the text cursor of a GTK field and pasting into it, a copied screenshot listed with its preview and pasted back into a GTK app with the same bytes and format, an oversized picture left out, and the oldest picture leaving history and storage once more are copied, the emoji panel opening from its shortcut at the text cursor, searching, inserting into a GTK field while staying open, recording recent picks and a skin tone, and pasting into an X11 app without losing the clipboard, a keyboard layout made in Keys from an existing one, typed with in a GTK app and an X11 app and changed while in use, Show keyboard layout in the input source menu opening Keys on the layout in use, an input method brought into Keys offering its words in the candidate popup and typing the one picked by its number, keyring prompts asking to allow an app, for a password and again after a wrong one, for a new PIN, and for a finger, and the lock screen and unlock prompt, unlocked once with a password and once with a finger. It saves those prompts as `keyring-access.png`, `keyring-password-warning.png`, `keyring-fingerprint.png`, and `unlock-fingerprint.png`, and Keys as `keys-layout-dark.png`, `keys-layout-light.png`, `keys-view-dark.png`, `keys-view-light.png`, `keys-method-dark.png`, `keys-method-light.png` and `keys-candidates.png`. It also checks keyboard navigation, lock-mode visibility, blocked Super activation, live window previews, Alt-Tab with real client windows, the window menu from Alt+Space, a password field's context menu, workspace shortcuts and scrolling, fullscreen panel visibility, volume OSDs, and screenshot controls. Test sessions unlock against a stand-in for `kestrel-authenticate` that accepts a scripted password and a pretend finger, so they never reach the computer's sign-in rules, and the checks stand in for the keyring themselves. A nested session shares the host login session, so its polkit agent cannot register alongside the host agent; polkit authentication, network credential submission, and unlocking with the computer's own sign-in rules still require qualification in a dedicated Kestrel login session.

The capture also runs GnuPG against a scratch home of its own, never yours, with `luft-pinentry` and a stand-in keyring: it makes a key while checking a mismatched confirmation, signs after a wrong passphrase and saves the right one, signs again without being asked, rates a new passphrase, and answers a confirmation, saving `pinentry-new-passphrase.png`, `pinentry-unlock.png`, `pinentry-quality.png` and `pinentry-confirm.png`. VPN secrets are asked for a plugin with a stand-in sign-in helper, for one without, and for OpenConnect against a stand-in gateway on the computer itself, through a certificate it can't vouch for, a refused sign-in and a successful one, saving `vpn-secrets.png`, `vpn-certificate.png` and `vpn-openconnect.png`; none of it reaches NetworkManager. Network Sign-In opens a stand-in hotel page, in `signin-dark.png` and `signin-light.png`, asks a stand-in NetworkManager on the test system bus to check the connection, and closes once it reports full connectivity.

The development launcher loads resources, typelibs, libraries, and schemas from the build directory, without depending on an installed temporary prefix.

### Wallpaper and accent color

Wallpapers are decoded once and kept at the size of the largest display instead of their original resolution, so large photos do not hold full-resolution copies in memory. Centered and tiled wallpapers keep their original size. Only the wallpapers on screen and the current light and dark wallpapers stay in memory, so switching between light and dark is immediate; earlier wallpapers are let go and come back from the stored copy described below.

Kestrel also keeps that copy on disk, together with the blurred wallpaper behind the lock screen, the login screen and the first moment after signing in, in `~/.cache/kestrel/backgrounds`. Both are written whenever the wallpaper or the display arrangement changes, so signing in, locking the screen and the login screen show the wallpaper straight away instead of decoding the picture and blurring it again. The stored copies are exactly what would be drawn otherwise. Pictures with more than 8 bits per channel or their own color description are decoded as before.

Kestrel takes its accent color from the wallpaper's most vivid dominant hue. When hardly any of the wallpaper has color, such as a black and white photo, the accent is white instead of a washed-out grey. Choosing White under Appearance in Settings (`accent` in `com.lantharos.kestrel`) keeps it white whatever the wallpaper.

The accent fills toggles that are on, slider fills, switches, check boxes, the focused app's taskbar indicator, today's date in the calendar and the default action in system dialogs, and tints focus rings and selected text. Text and icons on the accent are dark or white, whichever reads better, so with a white accent the quick settings toggles that are on turn white with dark text. Apps that read the `accent-color` portal setting get the exact color. GTK and libadwaita apps that only know GNOME's named accents follow the closest one, which Kestrel sets in `org.gnome.desktop.interface accent-color`; for white that is slate, unless other apps are matched to the wallpaper.

### Wallpaper palette

From the accent's hue and colorfulness Kestrel builds a full set of colors for light and for dark, recalculated whenever the wallpaper, the style, or Pure black changes. Every role sits at a fixed tone, measured as perceived lightness from 0 (black) to 100 (white), so the same role always has the same contrast whatever the wallpaper:

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `primary`, `secondary`, `tertiary`, `error` | 40 | 80 | Filled controls, links, highlights. Secondary is a quieter version of the accent, tertiary turns its hue by 60°, error is a fixed red |
| `onPrimary`, `onSecondary`, `onTertiary`, `onError` | 100 | 20 | Text and icons on the color above |
| `primaryContainer` and the other `…Container` roles | 90 | 30 | Softer fills, such as selected rows |
| `onPrimaryContainer` and the other `on…Container` roles | 10 | 90 | Text and icons on a container |
| `surface` | 98 | 6 | Window background |
| `surfaceDim`, `surfaceBright` | 87, 98 | 6, 24 | Backgrounds that sit lower or higher than `surface` |
| `surfaceContainerLowest` … `surfaceContainerHighest` | 100, 96, 94, 92, 90 | 4, 10, 12, 17, 22 | Cards, sidebars, popovers and fields from lowest to highest |
| `onSurface` | 10 | 90 | Main text |
| `surfaceVariant`, `onSurfaceVariant` | 90, 30 | 30, 80 | Secondary surfaces and secondary text |
| `outline` | 50 | 60 | Borders that need to be seen, such as field outlines |
| `outlineVariant` | 80 | 30 | Decorative dividers |
| `inverseSurface`, `inverseOnSurface`, `inversePrimary` | 20, 95, 80 | 90, 20, 40 | Tooltips and snackbars that stand out from the window |

Surfaces carry a faint tint of the accent. A white accent makes the whole palette black and white: surfaces are plain greys, and the accent roles flip between the styles so they stay readable, with `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer` and `inversePrimary` at 10, 100, 25, 100 and 100 in light and at 100, 10, 85, 0 and 10 in dark. With Pure black on, the dark `surface`, `surfaceDim` and `surfaceContainerLowest` are `#000000` and the other containers step up from there (`surfaceContainerLow` 4, `surfaceContainer` 8, `surfaceContainerHigh` 12, `surfaceContainerHighest` 17, `surfaceBright` 18).

Contrast is guaranteed by the tones: `onSurface`, `onSurfaceVariant`, `primary`, `secondary`, `tertiary` and `error` reach at least 4.5:1 against every surface and container of their scheme, every `on…` role reaches at least 4.5:1 against its color, and `outline` reaches at least 3:1 against every surface. `outlineVariant` is decorative and has no contrast guarantee.

Terminals get their own sixteen colors: the usual red, green, yellow, blue, magenta and cyan, each nudged up to 15° toward the accent's hue unless the accent is white, plus black and white from the tinted neutrals. Against the terminal background, the foreground and colors 1 to 6, 8 and 9 to 14 reach at least 4.5:1 in both schemes, and so do 7 and 15 in dark. Color 0 is meant for backgrounds, and 7 and 15 are light greys in the light scheme. The cursor uses `primary` with `onPrimary` text, and selections use `primaryContainer` with `onPrimaryContainer` text.

#### Reading the palette

On the session bus, `com.lantharos.Kestrel` exports `com.lantharos.Kestrel.Appearance` at `/com/lantharos/Kestrel/Appearance` with these read-only properties, and emits `PropertiesChanged` when they change:

| Property | Type | Value |
| --- | --- | --- |
| `AccentColor` | `s` | The accent, `#rrggbb` |
| `WallpaperAccentColor` | `s` | The accent the wallpaper gives, also while White is chosen |
| `Dark` | `b` | Whether the dark style is on |
| `PureBlack` | `b` | Whether Pure black is on |
| `Colors` | `a{ss}` | Every role above for the current style, by name |
| `TerminalColors` | `a{ss}` | Terminal colors for the current style |
| `LightColors`, `DarkColors` | `a{ss}` | Roles for each style, whichever is on |
| `LightTerminalColors`, `DarkTerminalColors` | `a{ss}` | Terminal colors for each style |
| `AppIcons` | `a{ss}` | The app icon style and its colors, described under App icons |

Terminal colors are keyed `foreground`, `background`, `cursor`, `cursorText`, `selectionBackground`, `selectionForeground` and `color0` to `color15`. All values are `#rrggbb`.

`~/.config/kestrel/appearance.json` holds the same data for apps that would rather read a file, and is rewritten shortly after each change:

```json
{
  "accentColor": "#6f9bf2",
  "accentName": "blue",
  "dark": true,
  "pureBlack": false,
  "colors": { "primary": "#a9c7ff", "onPrimary": "#07305f", "surface": "#10141a", "…": "…" },
  "terminal": { "foreground": "#e0e2ea", "background": "#10141a", "color0": "#2d3138", "…": "…" },
  "schemes": {
    "light": { "colors": { "…": "…" }, "terminal": { "…": "…" } },
    "dark": { "colors": { "…": "…" }, "terminal": { "…": "…" } }
  }
}
```

`colors` and `terminal` follow the current style. Terminal apps can read `terminal` from this file, or `TerminalColors` over D-Bus to follow changes live. `~/.config/kestrel/appearance.css` defines `--kestrel-accent` and every role as a kebab-case custom property, such as `--kestrel-primary` and `--kestrel-on-surface-variant`, with the dark values inside `@media (prefers-color-scheme: dark)`, for web views.

### Matching other apps

Match other apps to the wallpaper in Settings (`theme-apps` in `com.lantharos.kestrel`) generates colors for apps that Kestrel does not draw, and updates them shortly after the palette changes. Kestrel only writes inside a block that starts with a `Kestrel wallpaper colors` comment, or files named Kestrel, so anything else in these files is left alone. Turning it off removes the blocks and files again.

- GTK 4 and libadwaita: a block at the top of `~/.config/gtk-4.0/gtk.css` sets the accent, window, view, header bar, sidebar, card, dialog and popover colors for both styles. Apps pick it up when they next start and switch between light and dark on their own.
- GTK 3: a block at the top of `~/.config/gtk-3.0/gtk.css` defines the same named colors for the current style, which themes such as adw-gtk3 use.
- Qt: `~/.config/qt6ct/colors/Kestrel.conf` is a palette for qt6ct, and `~/.local/share/color-schemes/Kestrel.colors` is a KDE color scheme. Choose Kestrel in qt6ct, with `QT_QPA_PLATFORMTHEME=qt6ct`, or in KDE's color settings. Both follow the current style.
- Ghostty, when it is installed: `Kestrel Light` and `Kestrel Dark` themes in `~/.config/ghostty/themes`, and a block at the top of the Ghostty config that selects them with `theme = light:Kestrel Light,dark:Kestrel Dark`. Colors set further down the config still win. Running Ghostty windows reload when the colors change (Ghostty 1.2 or newer).

### Dark style schedule

Settings can switch the dark style on and off by itself (`dark-schedule` in `com.lantharos.kestrel`): `sunset` goes dark at sunset and light at sunrise, and `custom` uses `dark-schedule-from` and `dark-schedule-to`, in hours of local time. For sunset and sunrise Kestrel asks for the city-level location once when the schedule starts and after each resume, when location services are on; until then, or without them, it uses the main city of the time zone, and falls back to the custom hours when neither is known. Kestrel sets a single timer for the next change instead of checking the time, catches up on changes it slept through after a resume, and leaves a style you picked yourself in place until the next change.

### Pure black

Pure black (`pure-black` in `com.lantharos.kestrel`) is for OLED displays. Kestrel's panel, Start, Quick Settings, notifications, menus, dialogs, and other glass surfaces turn solid black and stop blurring what is behind them; surfaces inside other surfaces, such as notifications in the notification center, are a very dark grey so they stay apart. Luft apps turn their dark backgrounds black, and the generated dark colors for other apps use black surfaces.

### App icons

App icons can keep their own colors or take on the wallpaper (`app-icon-style` in `com.lantharos.kestrel`, under Appearance in Settings):

- Default shows every app's own icon.
- Tinted draws each app as a single-color glyph on a plain rounded plate: a near-black plate with a light accent glyph in the dark style, and a near-white plate with a dark accent glyph in the light style. The glyph sits at tone 82 on a tone 12 plate in dark and at tone 38 on a tone 95 plate in light, so it always reaches at least 4.5:1. `app-icon-tint` replaces the accent with a color of your choice, such as `#3584e4`.
- Clear draws a near-white glyph on a faint white plate with the same bright top edge as Kestrel's glass, over whatever surface the icon sits on.

The style covers the taskbar, Start and its search results and folders, Alt+Tab, Ctrl+Alt+Tab, the all-windows view, window previews, notification groups and banners, the media card, the camera and microphone menu, and the apps listed when logging out or unmounting a drive. Other apps' own windows keep their icons.

Each glyph comes from the first of these that exists:

1. A symbolic icon named after the app, `<desktop id>-symbolic` or the app's `Icon` name followed by `-symbolic`, from the icon theme or the app itself. Luft's own apps have one.
2. A glyph drawn for Kestrel for common apps: 1Password, Blender, Chrome and Chromium, Claude, Discord, Figma, Firefox, Ghostty, GIMP, Helium, OBS Studio, Raffi, Spotify, Steam, Telegram, Thunderbird, VS Code and VSCodium, and Zed, whether installed as packages, Flatpaks or Snaps.
3. The app's own icon turned into two tones. When the icon sits on a solid plate of one color, the plate is dropped so only the symbol remains; the rest of the icon keeps its light and dark parts, mapped from a darker to a lighter shade of the glyph color.

Every icon is drawn once per size, style and color on a background thread and kept as a texture, so showing icons costs the same as with the apps' own colors. Changing the wallpaper, style, tint or light and dark style redraws the icons on screen first and the hidden ones a few at a time while the desktop is idle.

Luft apps draw other apps' icons in the same style. Kestrel keeps a two-tone glyph for every installed app in `~/.cache/kestrel/app-glyphs`, named after the desktop ID, with the glyph's lightness in the color channels and its coverage in alpha. `AppIcons` on the Appearance interface holds `style`, the `glyphs` folder, and `plate`, `ink`, `shade` and `rim` for `tinted` and `clear`, keyed as `tinted-plate`, `clear-rim` and so on; colors are `#rrggbbaa`, and `rim` is the strength of the top edge from 0 to 1.

### Live wallpapers

A video can be the wallpaper. Set `live-wallpaper` in `com.lantharos.kestrel` to its URI for the light style, or `live-wallpaper-dark` for the dark style, or pick a video under Appearance in Settings. Kestrel starts `kestrel-wallpaper`, a small GTK and GStreamer player, which opens one borderless window per display. Kestrel marks those windows as desktop windows, sizes each to its display, and keeps them below every app window, out of the taskbar, Alt+Tab, the all-windows view, window previews, and window screenshots. They never take keyboard focus, clicks pass through them to the desktop, so the desktop menu keeps working, and they are never scanned out directly, so the panel stays on screen in front of them on an empty desktop. Playing a video needs GStreamer's GTK 4 video sink, `gstreamer1-plugin-gtk4` on Fedora; without it the still frame stays in place.

Videos are decoded by the GPU (VA-API, or NVDEC on NVIDIA) and handed to GTK as GL textures, so frames never pass through the CPU or the processor's window into graphics memory. The video loops without a gap and without sound, and follows the Fit setting. Playback pauses, holding the current frame, while a maximized or fullscreen window covers its display, while the all-windows view is open, while the screen is locked or off, on battery power unless Play videos on battery is on under Appearance in Settings (`live-wallpaper-on-battery`), and in power saver mode, and resumes where it left off. After ten seconds paused, the player closes its decoder and lets go of its frame buffers, about 110 MB of graphics memory for a 3440×1440 video, and opens them again when playback resumes; the held frame stays on screen until the next one is ready. If the player stops unexpectedly, Kestrel starts it again after a short wait, up to three times in a row; after that, the still frame stays until another wallpaper is chosen or the session restarts.

The light and dark styles each keep their own wallpaper. When a video is chosen, Kestrel saves its first frame to `~/.local/share/kestrel/wallpapers` and sets the matching `org.gnome.desktop.background` key to it, `picture-uri` for light and `picture-uri-dark` for dark. The lock screen, the all-windows view, and the accent color use that still, and it shows until the video's first frame is ready. Switching the style switches the wallpaper with it, starting or stopping the video and moving the accent color to the new wallpaper. Choosing a picture for a style, from Settings or any other app, ends that style's live wallpaper. Glass surfaces such as the panel blur the video itself, so what shows through them always matches the desktop behind them.

### Cursors

The cursor follows `cursor-theme` and `cursor-size` in `org.gnome.desktop.interface`, chosen under Appearance in Settings. Kestrel draws scalable cursors from a theme's `cursors_scalable` folder and falls back to the theme's classic Xcursor images when it has none, so the themes people share online work as they are. A theme with neither gets Adwaita. Themes are looked up in `~/.local/share/icons`, `~/.icons`, and `/usr/share/icons`, or along `XCURSOR_PATH` when it is set.

X11 apps get the same theme and size from the X11 settings service, which starts with Xwayland. It publishes them as X settings for GTK apps and as `Xcursor.theme` and `Xcursor.size` X resources for everything else, such as Chromium and Electron apps and Steam, and updates both when the settings change. Sizes are multiplied by Xwayland's scale, so X11 apps on scaled displays match Wayland apps.

### Window snapping

Dragging a window to the top edge maximizes it, dragging it to the left or right edge fills that half of the display, and dragging it into a corner fills that quarter. Super and the arrow keys snap to halves and maximize. A glass preview inset from the target area shows where the window will land. Super+Z opens snap layouts for the focused window with halves, two-thirds splits, thirds, quarters, and mixed layouts; choosing an area places the window there. Dragging a window out of a quarter or layout area restores its earlier size. Windows snapped side by side on the same desktop and display form a group: choosing one from the taskbar, its window previews, its context menu, or the all-windows view brings the others back with it, restoring any that were minimized. Alt+Tab still switches single windows.

### Window corners and blur

Application windows use 15px rounded corners, matching libadwaita's own window radius, including tiled windows. Maximized and fullscreen content stays edge-to-edge, retaining the compositor’s direct-scanout eligibility. Desktop backgrounds, docks, and drag icons keep their own shapes. Existing client transparency and shadows are preserved.

The corner mask runs in the surface’s existing draw pass. Window interiors retain opaque rendering and occlusion culling; only corner areas require blending. Wayland subsurfaces share their parent window’s corner geometry, and pointer hit regions follow the visible corners.

Shell glass uses separable Gaussian blur, with horizontal and vertical passes, adaptive downscaling, and paired texture taps through GPU linear sampling. It does not use Dual Kawase. The backdrop cache tracks damaged regions per display, and shell text is drawn separately from the blurred background.

Build the compositor with `kestrel/compositor/build.sh` before launching a development session. Source, build files, and installed libraries stay under `kestrel/run`; no host compositor packages are replaced. See [the compositor notes](compositor/README.md) for the patch boundary.

### Window icons

Kestrel supports `xdg-toplevel-icon-v1` theme names and shared-memory images. Window-backed panel entries, window previews, and the window switcher update when the client supplies an icon. Installed application groups retain their desktop-entry icons. Clients must implement the protocol; app-ID and desktop-entry matching still determine grouping.

Mutter changes are maintained as an ordered Git patch series with a pinned upstream commit. See the [compositor workflow](compositor/README.md) for editing, replay checks, and rebasing onto new releases.

### Tray icons

Apps that use StatusNotifierItem, such as Discord, Steam, Nextcloud, and 1Password, collect in a single tray button beside the status icons on the primary display. The button previews up to four tray icons in their own colors: one icon fills it, two sit side by side, and three or four share a small grid. Clicking it opens a panel listing each app by icon and name. Choosing an app opens its actions in place: Open for apps that have a window to show, followed by the app's own menu with checkmarks, radio choices, icons, and submenus that open with a Back row. Apps without a menu open directly. Icons follow the app's status: passive items stay hidden and attention icons replace the regular icon. Apps that registered before Kestrel started are found at startup, the tray disappears when no apps use it, and each icon leaves with its app.

### Privacy and keep awake

When an app uses the camera or microphone, shares the screen, or reads your location, an orange button appears beside the tray with an icon for each. Clicking it lists what is in use: apps using the camera or microphone appear by name with options to mute the microphone or close the app, and there are entries to stop screen sharing or a screen recording and to turn off location services. The button leaves once nothing is in use. An eye beside the network icon means an app, such as a video player or a presentation, or Keep Awake in Quick Settings, is keeping the screen from sleeping. An airplane appears beside it while Airplane Mode is on.

### Devices and battery

Bluetooth devices that were connected when the adapter turned off, at login, or before the computer went to sleep reconnect once Bluetooth is back, as long as they are paired and trusted. Kestrel waits a moment, then tries each device a few more times with growing pauses over about three minutes before leaving it alone. Disconnecting a device, from Quick Settings or anywhere else, takes it off the list.

Kestrel warns when the laptop battery, or a UPS powering the computer, reaches 20%, 10%, and 5%, and when a mouse, keyboard, headset, controller, or other connected device reaches 20% and 10%, naming the device. Each warning shows once per discharge and clears when charging starts. These replace the low battery notifications from the power service; its final notice before the computer hibernates or powers off, and the UPS power notice, stay as they are.

### Input sources

With more than one keyboard layout or input method, the current one shows beside the status icons on the primary display, such as EN or DE. Input methods with modes, such as Mozc, show the current mode instead, for example あ for Hiragana or A for direct input, and the label also appears for a single input method that has options. Clicking or right-clicking it lists the input sources with the current one checked, then the input method's own options, such as Mozc's input mode and tools, then Show keyboard layout, which opens Keys on the layout you're typing with (for an input method, the layout underneath it) when Keys is installed, and Keyboard settings. Scrolling over it moves to the next or previous input source. Super+Space switches with a popup showing each source's label and name, and the panel follows every switch and mode change as it happens.

Layouts of your own, such as the ones Keys makes, live in `~/.config/xkb`: a symbols file under `symbols` and an entry in `rules/evdev.xml`. Kestrel's compositor reads that folder before the system's, and Kestrel watches it, so a new or changed layout can be used right away and one that's in use is reloaded the moment its file changes, in X11 apps under Xwayland too. Input methods that an app registers with IBus while the session runs, such as the ones made in Keys, are listed as soon as they appear and named without a language when they aren't for one.

### Global shortcuts

Apps that register shortcuts through the global shortcuts portal, such as Discord and OBS, get their preferred keys right away, without a confirmation prompt, as long as nothing else uses them. A key stays unassigned when the shell, the window manager, or media keys already use it, when another app holds it, or when it would type a character. Apps keep their shortcuts across restarts, and hear about a shortcut both when it's pressed and when it's released, so push to talk works. When an app asks to change them, a dialog lists each shortcut; choose one and press the new keys, or Backspace to clear it.

### Portals

Kestrel is the portal backend for its session, so apps reach Kestrel's own dialogs and services through xdg-desktop-portal and the GNOME and GTK portal backends aren't needed. `kestrel-portals.conf` sends everything to Kestrel except file dialogs, which open in Rover, and stored secrets, which come from [Luft Keyring](keyring/README.md). What apps can ask for:

- Appearance: the light or dark style, high contrast, reduced motion and Kestrel's exact accent color. Sandboxed apps read the same interface, font, cursor, mouse, sound, input source, window button and accessibility settings as the rest of the desktop, and reload their fonts when fonts are added or removed.
- Screenshots of the whole screen, an area, or the active window, the screenshot tool itself when the app wants you to choose, and the color under the pointer. Permission prompts, such as the one before an app's first screenshot, only appear for the app you're using.
- Opening a file or link in another app: the list starts with your last choice and refreshes when an app is installed while it's open. Clicking the selected app again opens it, and Find an App searches Schelf.
- Your name and picture, after you choose to share them.
- USB devices, where you can leave out any device before allowing the rest.
- A new wallpaper, previewed first when the app asks for that. The picture is copied to `~/.local/share/backgrounds` and used for both styles.
- Adding an app or website to Start under a name you can change. Schelf can add them without asking.
- Writing an email in your mail app, with recipients, subject, text and attachments filled in.
- Notifications, which join the notification center; clicking one opens the app.
- Global shortcuts, described above.
- Sharing the screen: the picker lists screens and windows, most recently shared first, with a small live preview of each window, and offers a new virtual screen when the app asks for one. Apps that want to remember the choice can skip the picker next time; screens are recognized by the monitor and windows by their app and title. A share shows in the privacy indicator, whose Stop ends it for the app.
- Remote control, which asks which of the keyboard, pointer and touchscreen the app may use and which screens it sees, and can share the clipboard both ways.
- Input capture, for apps that share one keyboard and mouse between computers, which asks first and hands over the pointer when it crosses the screen edges the app chose.
- Printing, with a choice of printer, copies, pages, paper, orientation, two-sided printing and color, showing only what the chosen printer can do. Apps that set up the job before rendering it, such as GTK apps, print right away once you confirm, and the dialog says so when no printer is set up.
- Keeping the session from going idle, suspending or ending, and following whether the session is ending or the screen is locked. Sandboxed apps may keep running in the background, and the portal knows which of them still have windows open.

Printing, saving files, opening other apps, location, the camera, the microphone and sound can be turned off for apps under `org.gnome.desktop.lockdown`, `org.gnome.desktop.privacy` and `org.gnome.system.location`.

The capture drives every portal the way xdg-desktop-portal does and saves the dialogs as `portal-*.png`. Test sessions run their own PipeWire, with a pair of speakers and a microphone, and a print server with an office and a label printer, so sound, screen sharing and printing never reach the real ones.

### Clipboard history

Super+V opens the text and pictures copied during the session, newest first, just below the text cursor of the field you are typing in, or above it when there is no room underneath. Apps that do not share their text cursor get the list in the middle of the focused window, and with no window focused it opens at the pointer. Choosing an entry pastes it into the focused window, using Ctrl+Shift+V in terminals; the context menu can also copy or remove it, and Delete removes the focused entry. Notifications open with Super+N.

Pictures, such as screenshots or images copied from a browser, show a preview and paste back exactly as they were copied, in their original format. History keeps the eight most recent pictures; pictures larger than 16 MB or 40 megapixels, and copies that cannot be shown as a picture, are left out. When an app copies text and a picture together, the text is kept.

History lasts for the session and is never written to disk: text stays in memory, and pictures are kept in the session's temporary folder, which is emptied when you log out. A picture is deleted as soon as it leaves history, is removed, or Clear all is chosen. Copies that password managers mark as sensitive are left out.

### Emoji

Super+. or Super+; opens the emoji panel just below the text cursor, placed the same way as clipboard history, and the search field is ready for typing. The panel covers emoji, symbols, letters, and kaomoji, so it stands in for a separate character map.

Without a search, what you picked most recently comes first, followed by the emoji groups (smileys and emotion, people and body, animals and nature, food and drink, activities, travel and places, objects, symbols, and flags), then common symbols (signs, marks, numbers, units, and keyboard keys), arrows, math, currency, punctuation (dashes, quotes, brackets, and spaces and invisible characters, shown by name), Latin letters with accents and phonetic letters, Greek, shapes and box drawing, other symbols (miscellaneous symbols, dingbats, technical symbols, letterlike symbols, enclosed numbers, and Braille), and kaomoji. The tabs jump to each group and follow along as you scroll; the tab row scrolls sideways with the mouse wheel and keeps the current tab in view. Emoji are drawn as color images, while symbols and letters use the interface font, falling back to other installed fonts for characters it lacks, and always in their text style.

Search matches the start of any word in a name, an alias, or a keyword, and results mix emoji and symbols. Emoji use their Unicode CLDR names and keywords, in your language when the annotations cover it and in English otherwise, so both "party" and "tada" find 🎉. Symbols and letters use their Unicode character names together with Unicode's abbreviations and any CLDR names and keywords, so "degree", "copyright", "em dash", "euro", "alpha", "e acute", "arrow right", and "nbsp" all find what you would expect. Exact names come first, then names that start with the search, then whole-word matches, with shorter names ahead.

The hand next to the search field chooses a skin tone for people and hands, and the choice is remembered. Arrow keys, Page Up, Page Down, Home, and End move through the grid, Tab moves between the search field, the skin tone, the tabs, and the grid, Enter inserts, and Escape closes. The bottom of the panel names the item selected with the keyboard, or the one under the pointer once the pointer moves, and adds the code point for symbols and letters, such as "Degree sign · U+00B0". Typing or pressing a key hands it back to the keyboard selection, so results that land under a resting pointer never hide what Enter inserts. Every cell has an accessible name, and the selected cell and current tab are reported to screen readers.

In apps that support text input, which covers GTK, Qt, and most Wayland apps, the app keeps its keyboard focus while the panel is open and each emoji or symbol goes in at the cursor through the input method. The panel stays open so you can pick several in a row, and a search starts over after each pick. Apps without text input, such as X11 apps, get the pick pasted instead: the panel closes, it is pasted with Ctrl+V, or Ctrl+Shift+V in terminals, and the clipboard gets its previous content back half a second later. These pastes are not added to clipboard history. The last nine picks and the skin tone are kept in `emoji-recent` and `emoji-skin-tone` in `com.lantharos.kestrel`.

Kestrel's shortcuts take precedence over the input method, so Super+. no longer starts IBus's emoji typing mode, while IBus keeps its Ctrl+Shift+U Unicode entry.

The emoji list in `engine/data/emoji.json`, which the on-screen keyboard shares, comes from Unicode's `emoji-test.txt`; `bun kestrel/tools/unicode/emojiData.ts` regenerates it for a new Unicode release. The symbol and letter groups and their names live in `engine/data/characters.json`, which `bun kestrel/tools/unicode/characterData.ts` builds from the Unicode Character Database (`UnicodeData.txt`, `NameAliases.txt`, and `emoji-data.txt`) using the groups in `kestrel/tools/unicode/characterGroups.ts`. It reads the latest release from unicode.org, or a local copy of the database given as the first argument, such as `/usr/share/unicode/ucd`. The table covers about 4,400 characters rather than all of Unicode and stores names as references into a shared word list, which keeps it to about 80 KB, and it loads in about 4 ms. Characters that are emoji by default are left to the emoji groups. The table and the CLDR annotations of the `cldr-emoji-annotation` package are read once, a few seconds after the shell starts or on the first open if that comes sooner, the search index is then built in small steps while the shell is idle, and only the cells in view have actors. While you keep typing, a search only looks again at the matches of the previous one. The panel draws emoji, symbols, and letters with HarfBuzz (13 or newer) into small images and keeps the last 512 of each kind, because laying out color emoji as text keeps a recording of every glyph ever shown, which grows the shell by hundreds of megabytes after scrolling through the whole list, and laying out symbols as text on every search costs several times more than reusing an image. Symbols are looked up in the interface font first and then in the installed fonts that fontconfig ranks after it, skipping color fonts, and sit on the font's baseline so superscripts, subscripts, and low marks keep their place.

### Notifications and keyboard interaction

New notifications slide up above the clock at the bottom right and fade away after a few seconds. Hovering a banner keeps it open and reveals its actions. Banners wait while the notification center is open.

Notifications are ordered by their latest update across applications. Rows open the notification, expose its actions, and offer a dismiss button and Delete shortcut. Resident actions keep the center open. Text wraps, keyboard focus follows dismissal, and offscreen controls scroll into view. Opening Start, Quick Settings, notifications, clipboard history, snap layouts, or the all-windows view does not highlight any control; Tab or the arrow keys move into the surface, and Start keeps its search field ready for typing. Empty lists disable Clear all. Cards are reused during updates, created only when the center opens, and frozen during the closing animation.

Escape in Start clears the current search, then leaves a folder, then closes the menu. The search caret follows the desktop blink preference and timeout. Up on a running panel app opens its window previews with the window action focused. Preview proportions follow window resizing; closing releases the clones after a short fade, while session dismissal removes them immediately.
