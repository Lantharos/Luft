# Kestrel

Kestrel is Luft's desktop shell. It uses a local Mutter 51 build with native window rounding and owns its panel, launcher, quick settings, notification center, and power menu in TypeScript. The imported engine retains GNOME Shell's C/St integration and the session services required for window management, authentication, screenshots, screencasts, and portals.

## Current checkpoint

- The engine and TypeScript UI compile against the GNOME 51 stack. The session launcher uses the locally built compositor.
- The development launcher supports a visible nested session and isolated captures at 1280×800 and 1440×900.
- The square, transparent 48px panel reserves the bottom edge. Its launcher and favorite/running apps stay centered against the monitor while live network, Bluetooth when a device is connected, volume, battery on portable machines, and right-aligned, stacked date/time indicators sit on the right.
- Start’s default grid excludes apps pinned to the panel. Search includes every installed application, including pinned apps, and lists matches with their descriptions. Names that start with the query rank first, then names with a word starting with it, then app keywords. Settings pages, recently used files, and simple calculations such as `12*4` or `(2+3)^2` appear alongside apps; Enter copies a calculation's result. The top match is highlighted while typing and Enter launches it. Pinning or unpinning refreshes the grid immediately. Down moves from search into the results or app grid; arrows and Tab navigate controls, and focused apps scroll into view.
- Hovering a running taskbar app shows live window previews with activation and close controls. Clicking an app with multiple windows opens the same picker, and Up opens it from a focused taskbar button. Alt-Tab switches between windows with live previews, their titles, and app icons; Alt and the key above Tab limits the switcher to the focused app. Alt-Escape cycles windows, and Ctrl-Alt-Tab includes the Kestrel panel.
- Lock mode hides the panel and dismiss all desktop surfaces immediately. The lock screen shows a large clock and date over the blurred wallpaper, then the account picture, name, and password field once woken. Below the clock, playing media has its controls, and new notifications are grouped by app with up to three of their titles and text. Turning off Show message content on the lock screen in the notification center's context menu reduces them to the app name and a count, except for apps that allow their content individually in Settings. Super and desktop context menus are unavailable while locked or while a system dialog holds focus. System dialogs dismiss open surfaces before taking focus.
- Every display has its own panel with Start, the taskbar, and the clock; network, volume, and other status icons stay on the primary display. Start, Quick Settings, and notifications open on the display whose panel was used, or under the pointer when opened from the keyboard. Each window minimizes into the taskbar on its own display. A panel hides only while the topmost window on its display is fullscreen or covers the whole display and is opaque; minimized windows, windows on other desktops, and translucent windows leave it visible. Panels also step aside for the all-windows view. Desktop context menus stay on the clicked display; outside-click dismissal covers all displays, and monitor changes dismiss surfaces before repositioning them.
- Quick Settings provides network and Bluetooth controls, device selection for audio output and microphone input, brightness, Do Not Disturb, Night Light, Dark Style, Keep Awake, and power profiles. Airplane Mode appears on machines with wireless radios, Keyboard Backlight on laptops that report one, and Auto Rotate on screens that can rotate. Keep Awake stops the screen from dimming and the session from going idle until it is turned off, or for 30 minutes, an hour, or two hours from its options, and shows the same eye as apps that keep the screen awake. Everything is a tile: compact glass controls place icons above their labels, controls that are on turn brighter, and an odd final tile spans the full width. Screenshot, Settings, and Lock are tiles too, showing their keyboard shortcut underneath, and laptops get a Battery tile with the charge level and time remaining. Volume, microphone, and brightness each take a full-width row, and their percentage floats above the handle while the level changes. Controls follow the available hardware and services. Output and input device lists open inline beneath their slider. A tile's arrow expands it to the full width with its options directly underneath, and the other tiles glide aside to make room; its row partner moves below the options, and everything slides back when it closes. Drag a tile to reorder it. Right-click a tile to remove it, and right-click Quick Settings to add removed tiles back or reset the layout; the arrangement is remembered. Places with nothing to offer beyond what a click already does have no context menu. The surface grows to fit available space and scrolls when its content is taller. The microphone control remains available when a microphone is present, even without an active recording.
- The clock opens notifications, when there are any, above a month calendar with today highlighted; the center grows up to the top of the display before its list scrolls. Notifications are grouped by app, newest group first, each group a single rounded card with the app's name and icon above its notifications and a button to clear that app's notifications; groups with more than two show the newest two and a count that expands the rest. Apps that offer inline replies, such as messengers using the `inline-reply` notification action, get a Reply button in the notification center and in banners; it opens a text field, and Enter or the send button delivers the text to the app, which receives it through the `NotificationReplied` signal. When an app is playing media, a card at the top shows the track and artwork with previous, play or pause, and next controls; clicking it raises the player. The calendar follows the locale’s first weekday, pages between months, and returns to today from the month title. The notification center updates individual rows, batches notification bursts, and defers row construction while closed. Signal subscriptions follow the lifetime of their source and owning actor.
- The power button in the Start footer swaps the account row for Lock, Suspend, Log out, Restart, and Power off, delegating to the existing session action backend. Escape or the button returns to the account row.
- Backdrop capture updates only freshly painted regions in a separate cache for each display view. Each cache tracks valid pixels; partial damage schedules another paint only for missing pixels. Unchanged captures can reuse the blurred output without allocating an actor-blur framebuffer, and offscreen capture is clipped to valid pixels. Settled surfaces do not continuously redraw.
- Shell blur includes a rounded mask, a faint top-lit edge, and dimming for bright backdrops in its final shader pass. Menu corners stay clean, surfaces stand apart from the wallpaper, and white text stays legible over light windows, without an extra offscreen pass. Panel and menu blur share the same brightness without a tint overlay. The panel has square corners.
- Start uses six equal app columns with names wrapping to two lines, keyboard search, and a compact account and power footer with the AccountsService avatar when available. Panel hover highlights are inset and rounded, with up to four dots for each app’s open windows. A focused app’s dots stretch into short white bars, independently of pointer presses.
- Main surfaces slide in over 220 ms and out over 160 ms. The Start footer swaps between the account row and power options over 180 ms. Interrupted transitions reverse from their current position.
- The launcher uses the original two-part Luft mark at an optical size of 26px alongside 28px app icons, with its original proportions and a subtle split and opposing tilt on hover, without shrinking the two parts. Taskbar apps slide and fade in and out while their space expands or closes. Windows minimize into and restore from their taskbar button, scaling evenly and fading. New windows rise into place from slightly smaller while fading in, and closing windows shrink a little as they fade, with the same easing as minimizing; dialogs use a shorter version without the rise. Reduced motion keeps only the fades. The Start scrollbar is translucent, brightening on hover and drag. Search has a text-aligned caret that blinks while focused; running dots have a dedicated position beneath app icons. Newly opened surfaces stack above those sliding closed.
- Set `KESTREL_CSS_PATH` to a local stylesheet when launching the shell to reload styles after each saved change.

## Runtime scope

The GNOME overview, its app grid, dash, window picker, and search providers are not part of Kestrel, and neither is the GNOME extension system. The Shell D-Bus requests that opened the overview or app grid open Start instead, and a request to focus an app opens Start searching for it. The run dialog, Looking Glass, the login screen greeter, screen time limits, and parental controls are not part of Kestrel either. The screenshot window picker has its own window layout.

The shell ships Open Runde and registers it for its own UI at startup; applications keep the system fonts. Shell text keeps fractional glyph advances instead of rounding each letter to whole pixels, so spacing matches GTK 4 apps.

Desktop Quick Settings owns only the device controls used by Kestrel. It does not construct a second native Quick Settings menu or duplicate microphone slider. The retained session panel supplies login and lock-screen controls; the desktop does not populate it.

GNOME’s calendar server integration, event list, world clocks, weather integration, GNOME welcome tour, break reminders, and unused status tiles have been removed with their resources. Local AccountsService integration remains for login, unlocking, user switching, and the Start avatar. Authentication, location permission prompts, Thunderbolt authorization, accessibility, screenshots, and screen sharing retain their system backends.

### Performance workload

Run `kestrel/tools/session.sh performance` to measure resident memory and time since launch once the shell is ready, repeated search edits, app-button reuse, an 80-notification burst, row creation while hidden, and settled desktop paints. Search timings cover synchronous update work; they are not end-to-end display latency. The command uses an isolated headless session and exits when finished.

## Install as a login session

`kestrel/tools/install.sh install` builds Kestrel and its Mutter into `/opt/kestrel` and links a Kestrel entry for the login screen, its systemd user units, and its portal preferences into `/usr/local`. Nothing from the system GNOME installation is replaced. Pass a prefix as the second argument to install elsewhere; session entries are only linked for prefixes under `/opt` or `/usr`. `kestrel/tools/install.sh remove` removes the prefix and the links.

### Memory pressure

The shell runs with the lowest OOM score and inside the session slice, which Fedora's resource daemon protects from reclaim, so a runaway app cannot push Kestrel out of memory. The installer also links a policy for the user's app slice: when apps spend half their time waiting on memory for ten seconds, or swap is nine-tenths full, systemd-oomd closes the app responsible before the kernel has to step in. The policy applies to every session of the user, including GNOME. When an app is closed this way, or by the kernel, Kestrel shows a notification naming the app and how much memory it had used.

The busy pointer after launching an app clears as soon as the app's first window appears, instead of waiting out the launch timeout for apps that never report their startup.

Apps that stop answering get the Not Responding dialog after the usual few seconds. Games, recognized by being fullscreen, belonging to the Game category, or running as a Steam game, get a minute before it appears, since they often stall while loading.

### Session

The login screen starts `kestrel-session`, which hands the user's environment to systemd and starts `kestrel-session.target`; logging out stops the target and ends the session. Kestrel's own session manager takes the place of gnome-session. It runs as a small process that starts before the shell, keeps track of apps that ask to keep the screen awake or to hold off logging out, marks the session idle after the configured delay so the screen dims and locks, and asks for confirmation before logging out, restarting, or powering off. Before ending the session it asks running apps whether they are ready and moves on as soon as they answer. Apps that talk to GNOME's session manager work unchanged.

The target starts only the settings services Kestrel relies on: accessibility, display color and night light, automatic time zone, housekeeping, keyboard, media keys, power, printer notifications, airplane mode, screen saver requests from apps, and sound. The service for X11 app settings runs while Xwayland does. IBus provides input methods, and XDG autostart entries start with the session. Kestrel's own settings live under `dev.lantharos.kestrel`, separate from GNOME Shell's, so both desktops can be used on the same account.

Kestrel's portal handles screenshots, color picking, permission prompts, and appearance, so apps follow Kestrel's light or dark style and pick up its accent color. File dialogs open in Rover, and screen sharing and the remaining portals use GNOME's backend for now. The session identifies as `Kestrel;GNOME`, so apps that look for GNOME, for example to pick the system keyring, behave as they do there.

## Work before a Luft session

1. Log into the Kestrel session on real hardware and qualify it end to end. The TypeScript UI is loaded by a reduced upstream `main.js` path.
2. Qualify monitor hotplug and mixed display scaling on hardware, and complete notification actions and persistent preferences.
3. Replace GNOME's portal backend for screen sharing and global shortcuts, then exercise the portal calls from client apps.
4. Verify polkit, keyring, network credentials, lock and unlock, OSD, accessibility, and GDM handoff under a real login session.
5. Package Kestrel with a pinned Mutter ABI for Luft, review runtime dependencies, and test on a disposable machine before making it a selectable default session.

The virtual session checks the build, JS startup, and captured rendering. It does not validate a physical display, login manager, suspend, or portal permission dialogs.

### Start folders and app order

Drag an app onto the center of another app to create a folder, or onto an existing folder to add it. Drop beside an icon to rearrange apps or folders; insertion marks show the position. The grid scrolls when a dragged icon approaches its top or bottom edge.

Open a folder to launch or rearrange its apps. Edit its name in the header. Drag an app onto the Apps breadcrumb to move it back out, or use its context menu. Right-click a folder to rename it or ungroup its apps. Empty folders disappear. Escape returns to Apps before closing Start.

App buttons are reused across searches, folders, and reordering. Search names are indexed when the installed app catalog changes.

Taskbar buttons show what apps report through the launcher entry D-Bus interface used by Discord, Telegram, Firefox, and other apps: an unread count in a small red pill at the top right and a progress bar beneath the icon in the accent color. Apps whose windows ask for attention, or that mark themselves urgent, flash an orange highlight three times and keep it until they are focused, instead of posting an "is ready" notification. While an app reports progress, the bar replaces its window dots beneath the icon. Counts and progress clear when the app exits.

Resting the pointer on the far right edge of the panel fades every window on the current desktop away to show the desktop, and moving off brings them back. Clicking the edge minimizes those windows; clicking again restores them.

Drag an app from Start onto the panel to pin it where it is dropped, or drag pinned apps to reorder them. Running apps that are not pinned always follow the pinned ones and cannot be dragged.

Folder contents, names, and ordering are saved across sessions. Apps pinned to the panel stay hidden in the default grid and folder views, while search finds individual apps regardless of their folder or pin status.

### Context menus

Right-click an app in Start or the panel for launch actions, open windows, pinning, window sizing, minimizing, and closing. The panel offers Show desktop, a system monitor when one is installed, and Settings; the clock, status area, desktop background, account area, Quick Settings tiles, notifications, and search field offer relevant shortcuts. Submenus slide in from the side and Back slides them out; a menu that grows resizes before its content slides, and one that shrinks slides first. Menus also open with the Menu key or Shift+F10 on a focused control; Escape closes the menu and returns focus to where it was before the menu opened. Long app menus scroll within the screen.

### All windows

Super+Tab, or Show all windows in the panel's context menu, hides the panel and lays out every window on the current desktop over the blurred desktop, most recently used first, in rows that keep their proportions. Each window shows its app icon and title, with a close button on hover or focus; the middle button or Delete closes a window, and clicking one or pressing Enter focuses it. A strip along the bottom shows each desktop with its wallpaper and windows. Clicking a desktop switches to it without closing the view, and dragging a window onto a desktop moves it there. Escape, Super+Tab again, or clicking empty space closes the view. Alt+Tab remains the window switcher.

### Workspaces

Kestrel keeps one empty workspace alongside occupied workspaces, up to ten total. Empty workspaces are removed as windows close or move. Super+1 through Super+9 selects a workspace and Super+0 selects the tenth; Super+scroll or scrolling over the panel moves between adjacent workspaces. Transitions use the compositor’s workspace slide animation. These bindings replace GNOME's overview application shortcuts.

### System dialogs

The retained session components provide polkit authentication, keyring prompts, NetworkManager Wi-Fi and VPN credentials, and removable-volume prompts. The shell also exposes device-access permission dialogs, audio-device selection, mount password and question dialogs, logout and shutdown confirmation, screenshot and screencast selection, and accessibility prompts. Authentication and lock-screen verification continue to use the existing system backends.

Retained dialogs, native menus, switchers, notification banners, volume and brightness OSDs, screenshot controls, keyboard and input-method popups, lock notifications, and developer panels share Kestrel’s transparent blur treatment. Native menu arrows are removed. Volume and brightness OSDs are a slim pill-shaped bar. Context menus fit their labels, and closing surfaces retain their selection highlight through the animation. Quick Settings, notifications, and window previews use compact content-based sizing.

The screenshot tool is a single pill-shaped glass bar above the panel: area, screen, and window modes grouped in one pill, the photo and video switch in another, the pointer toggle, a compact capture button, and close, with a tooltip on each. Selection handles are small dots on the selection outline.

Single-row surfaces and controls are pills: the volume and brightness OSD, the workspace switcher, monitor labels, tooltips, text fields, dialog and notification buttons, and session actions. Larger popups use rounder corners: 24px for Start, Quick Settings, notifications, and dialogs, and 18px for menus.

Modal dialogs rise in as they open and use a symbolic icon for their purpose above stable, left-aligned headings, with shared action buttons where the default action stands out. Authentication shows a small account row above the password field. Wi-Fi, VPN, keyring, and encrypted-drive forms keep their field labels visible while typing; inputs share the Start menu's glass treatment, caret, selection, and focus styling. Password visibility controls and accessible labels remain available. Audio-device choices use full-width rows. Session warnings and permission dialogs use the same typography and list styling.

The capture command exercises audio selection, encrypted-volume password, and log out confirmation requests through D-Bus and cancels them without submitting credentials. It records a notification banner, media controls driven by a test player, a tray icon and its menu from a test app, the all-windows view with windows moved between desktops, grouped notifications and an inline reply, snapped windows returning together, taskbar counts, progress, and attention with desktop peek, the privacy button and its menu during a screen share, the keep-awake eye, Keep Awake, Dark Style, Airplane Mode, and Keyboard Backlight tiles against stand-in system services, global shortcuts from registration through the shortcut dialog, and the lock screen and unlock prompt. It also checks keyboard navigation, lock-mode visibility, blocked Super activation, live window previews, Alt-Tab with real client windows, workspace shortcuts and scrolling, fullscreen panel visibility, volume OSDs, and screenshot controls. Lock-mode checks do not authenticate through GDM. A nested session shares the host login session, so its polkit agent cannot register alongside the host agent; polkit authentication, keyring unlock, network credential submission, and password unlock still require qualification in a dedicated Kestrel login session.

The development launcher loads resources, typelibs, libraries, and schemas from the build directory, without depending on an installed temporary prefix.

### Wallpaper and accent color

Wallpapers are decoded once and kept at the size of the largest display instead of their original resolution, so large photos do not hold full-resolution copies in memory. Centered and tiled wallpapers keep their original size.

Kestrel takes its accent color from the wallpaper's most vivid dominant hue and uses it for toggles that are on, slider fills, the focused app's taskbar indicator, today's date in the calendar, and the default action in system dialogs. Other apps can follow the same color:

- GTK and libadwaita apps follow the closest named GNOME accent color, which Kestrel sets in `org.gnome.desktop.interface accent-color`.
- The exact color is available on the session bus as the `AccentColor` property of `dev.lantharos.Kestrel.Appearance` at `/dev/lantharos/Kestrel/Appearance` on `dev.lantharos.Kestrel`, with a `PropertiesChanged` signal when it changes.
- `~/.config/kestrel/appearance.json` holds `accentColor`, a darker `accentStrongColor` for filled controls with white text, and `accentName`. `~/.config/kestrel/appearance.css` defines `--kestrel-accent` and `--kestrel-accent-strong` for web views.

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

### Global shortcuts

Apps that register shortcuts through the global shortcuts portal, such as Discord and OBS, get their preferred keys right away, without a confirmation prompt, as long as nothing else uses them. A key stays unassigned when the shell, the window manager, or media keys already use it, when another app holds it, or when it would type a character. Apps keep their shortcuts across restarts. When an app asks to change them, a dialog lists each shortcut; choose one and press the new keys, or Backspace to clear it.

### Clipboard history

Super+V opens the text copied during the session, newest first. Choosing an entry pastes it into the focused window, using Ctrl+Shift+V in terminals; the context menu can also copy or remove it, and Delete removes the focused entry. History stays in memory and is not written to disk, and copies that password managers mark as sensitive are left out. Notifications open with Super+N.

### Notifications and keyboard interaction

New notifications slide up above the clock at the bottom right and fade away after a few seconds. Hovering a banner keeps it open and reveals its actions. Banners wait while the notification center is open.

Notifications are ordered by their latest update across applications. Rows open the notification, expose its actions, and offer a dismiss button and Delete shortcut. Resident actions keep the center open. Text wraps, keyboard focus follows dismissal, and offscreen controls scroll into view. Opening Start, Quick Settings, notifications, clipboard history, snap layouts, or the all-windows view does not highlight any control; Tab or the arrow keys move into the surface, and Start keeps its search field ready for typing. Empty lists disable Clear all. Cards are reused during updates, created only when the center opens, and frozen during the closing animation.

Escape in Start clears the current search, then leaves a folder, then closes the menu. The search caret follows the desktop blink preference and timeout. Up on a running panel app opens its window previews with the window action focused. Preview proportions follow window resizing; closing releases the clones after a short fade, while session dismissal removes them immediately.
