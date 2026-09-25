# Kestrel

Kestrel is Luft's desktop shell. It uses a local Mutter 51 build with native window rounding and owns its panel, launcher, quick settings, notification center, and power menu in TypeScript. The imported engine retains GNOME Shell's C/St integration and the session services required for window management, authentication, screenshots, screencasts, and portals.

## Current checkpoint

- The engine and TypeScript UI compile against the GNOME 51 stack. The session launcher uses the locally built compositor.
- The development launcher supports a visible nested session and isolated captures at 1280×800 and 1440×900.
- The square, transparent 48px panel reserves the bottom edge. Its launcher and favorite/running apps stay centered against the monitor while live network, volume, and right-aligned, stacked date/time indicators sit on the right.
- Start’s default grid excludes apps pinned to the panel. Search includes every installed application, including pinned apps, and lists matches with their descriptions. Names that start with the query rank first, then names with a word starting with it. The top match is highlighted while typing and Enter launches it. Pinning or unpinning refreshes the grid immediately. Down moves from search into the results or app grid; arrows and Tab navigate controls, and focused apps scroll into view.
- Hovering a running taskbar app shows live window previews with activation and close controls. Clicking an app with multiple windows opens the same picker, and Up opens it from a focused taskbar button. Alt-Tab switches between windows with live previews, their titles, and app icons; Alt and the key above Tab limits the switcher to the focused app. Alt-Escape cycles windows, and Ctrl-Alt-Tab includes the Kestrel panel.
- Lock and greeter modes hide the panel and dismiss all desktop surfaces immediately. The lock screen shows a large clock and date over the blurred wallpaper, then the account picture, name, and password field once woken. Super and desktop context menus are unavailable while locked or while a system dialog holds focus. System dialogs dismiss open surfaces before taking focus.
- The panel follows the primary display and hides for fullscreen windows and focused windows covering the entire display. Desktop context menus stay on the clicked display; outside-click dismissal covers all displays, and monitor changes dismiss surfaces before repositioning them.
- Quick Settings provides network and Bluetooth controls, device selection for audio output and microphone input, brightness, Do Not Disturb, Night Light, and power profiles. Compact glass controls place icons above their labels, with separate buttons for device details; controls that are on turn brighter, and an odd final control spans the full width. Volume, microphone, and brightness each take a single row, and their percentage appears while the level changes. Settings and Lock sit along the bottom. Controls follow the available hardware and services. Device selectors open in an adaptive glass detail view with a Back button. The surface grows to fit available space; long lists use page buttons instead of scrollbars. The microphone control remains available when a microphone is present, even without an active recording.
- The clock opens notifications above today’s date and a month calendar. The calendar follows the locale’s first weekday, pages between months, and returns to today from the month title. The notification center updates individual rows, batches notification bursts, and defers row construction while closed. Signal subscriptions follow the lifetime of their source and owning actor.
- The power button in the Start footer swaps the account row for Lock, Suspend, Log out, Restart, and Power off, delegating to the existing session action backend. Escape or the button returns to the account row.
- Backdrop capture updates only freshly painted regions in a separate cache for each display view. Each cache tracks valid pixels; partial damage schedules another paint only for missing pixels. Unchanged captures can reuse the blurred output without allocating an actor-blur framebuffer, and offscreen capture is clipped to valid pixels. Settled surfaces do not continuously redraw.
- Shell blur includes a rounded mask, a faint top-lit edge, and dimming for bright backdrops in its final shader pass. Menu corners stay clean, surfaces stand apart from the wallpaper, and white text stays legible over light windows, without an extra offscreen pass. Panel and menu blur share the same brightness without a tint overlay. The panel has square corners.
- Start uses six equal app columns with names wrapping to two lines, keyboard search, and a compact account and power footer with the AccountsService avatar when available. Panel hover highlights are inset and rounded, with up to four dots for each app’s open windows. A focused app’s dots stretch into short white bars, independently of pointer presses.
- Main surfaces slide in over 220 ms and out over 160 ms. The Start footer swaps between the account row and power options over 180 ms. Interrupted transitions reverse from their current position.
- The launcher uses the original two-part Luft mark at an optical size of 26px alongside 28px app icons, with its original proportions and a subtle split and opposing tilt on hover, without shrinking the two parts. Taskbar apps slide and fade in and out while their space expands or closes. Windows minimize into and restore from their taskbar button, scaling evenly and fading. The Start scrollbar is translucent, brightening on hover and drag. Search has a text-aligned caret that blinks while focused; running dots have a dedicated position beneath app icons. Newly opened surfaces stack above those sliding closed.
- Set `KESTREL_CSS_PATH` to a local stylesheet when launching the shell to reload styles after each saved change.

## Runtime scope

The GNOME overview, its app grid, dash, window picker, and search providers are not part of Kestrel, and neither is the GNOME extension system. The Shell D-Bus requests that opened the overview or app grid open Start instead, and a request to focus an app opens Start searching for it. Looking Glass loads the first time it is opened. The screenshot window picker has its own window layout.

The shell ships Open Runde and registers it for its own UI at startup; applications keep the system fonts.

Desktop Quick Settings owns only the device controls used by Kestrel. It does not construct a second native Quick Settings menu or duplicate microphone slider. The retained session panel supplies login and lock-screen controls; the desktop does not populate it.

GNOME’s calendar server integration, event list, world clocks, weather integration, GNOME welcome tour, break reminders, and unused status tiles have been removed with their resources. Local AccountsService integration remains for login, unlocking, user switching, and the Start avatar. Authentication, parental session restrictions, location permission prompts, Thunderbolt authorization, accessibility, screenshots, and screen sharing retain their system backends.

### Performance workload

Run `kestrel/tools/session.sh performance` to measure resident memory and time since launch once the shell is ready, repeated search edits, app-button reuse, an 80-notification burst, row creation while hidden, and settled desktop paints. Search timings cover synchronous update work; they are not end-to-end display latency. The command uses an isolated headless session and exits when finished.

## Work before a Luft session

1. Make Kestrel the actual shell entry point and rename the build/session identifiers that still say GNOME Shell. The TypeScript UI is loaded by a reduced upstream `main.js` path.
2. Qualify monitor hotplug and mixed display scaling on hardware, and complete notification actions and persistent preferences.
3. Supply Luft session and portal configuration, including screenshot, screencast, file chooser, settings, and secret handling, then exercise the portal calls from client apps.
4. Verify polkit, keyring, network credentials, lock and unlock, OSD, accessibility, and GDM handoff under a real login session.
5. Package Kestrel with a pinned Mutter ABI for Luft, review runtime dependencies, and test on a disposable machine before making it a selectable default session.

The virtual session checks the build, JS startup, and captured rendering. It does not validate a physical display, login manager, suspend, or portal permission dialogs.

### Start folders and app order

Drag an app onto the center of another app to create a folder, or onto an existing folder to add it. Drop beside an icon to rearrange apps or folders; insertion marks show the position. The grid scrolls when a dragged icon approaches its top or bottom edge.

Open a folder to launch or rearrange its apps. Edit its name in the header. Drag an app onto the Apps breadcrumb to move it back out, or use its context menu. Right-click a folder to rename it or ungroup its apps. Empty folders disappear. Escape returns to Apps before closing Start.

App buttons are reused across searches, folders, and reordering. Search names are indexed when the installed app catalog changes.

Drag an app from Start onto the panel to pin it where it is dropped, or drag panel apps to reorder them; running apps dropped among pinned apps are pinned in place.

Folder contents, names, and ordering are saved across sessions. Apps pinned to the panel stay hidden in the default grid and folder views, while search finds individual apps regardless of their folder or pin status.

### Context menus

Right-click an app in Start or the panel for launch actions, open windows, pinning, window sizing, minimizing, and closing. The panel, clock, status area, desktop background, account area, Quick Settings controls, notifications, and search field offer relevant shortcuts. Menus also open with the Menu key or Shift+F10 on a focused control; Escape closes the menu and restores focus. Long app menus scroll within the screen.

### Workspaces

Kestrel keeps one empty workspace alongside occupied workspaces, up to ten total. Empty workspaces are removed as windows close or move. Super+1 through Super+9 selects a workspace and Super+0 selects the tenth; Super+scroll or scrolling over the panel moves between adjacent workspaces. Transitions use the compositor’s workspace slide animation. These bindings replace GNOME's overview application shortcuts.

### System dialogs

The retained session components provide polkit authentication, keyring prompts, NetworkManager Wi-Fi and VPN credentials, and removable-volume prompts. The shell also exposes device-access permission dialogs, audio-device selection, mount password and question dialogs, logout and shutdown confirmation, screenshot and screencast selection, and accessibility prompts. Authentication and lock-screen verification continue to use the existing system backends.

Retained dialogs, native menus, switchers, notification banners, volume and brightness OSDs, screenshot controls, keyboard and input-method popups, lock notifications, and developer panels share Kestrel’s transparent blur treatment. Native menu arrows are removed. Volume and brightness OSDs are a slim bar with the level’s percentage. Context menus fit their labels, and closing surfaces retain their selection highlight through the animation. Quick Settings, notifications, and window previews use compact content-based sizing.

Modal dialogs rise in as they open and use a symbolic icon for their purpose above stable, left-aligned headings, with shared action buttons where the default action stands out. Authentication shows a small account row above the password field. Wi-Fi, VPN, keyring, and encrypted-drive forms keep their field labels visible while typing; inputs share the Start menu's glass treatment, caret, selection, and focus styling. Password visibility controls and accessible labels remain available. Audio-device choices use full-width rows. Session warnings and permission dialogs use the same typography and list styling.

The capture command exercises audio selection, encrypted-volume password, and log out confirmation requests through D-Bus and cancels them without submitting credentials. It also checks keyboard navigation, lock-mode visibility, blocked Super activation, live window previews, Alt-Tab with real client windows, workspace shortcuts and scrolling, fullscreen panel visibility, volume OSDs, and screenshot controls. Lock-mode checks do not authenticate through GDM. A nested session shares the host login session, so its polkit agent cannot register alongside the host agent; polkit authentication, keyring unlock, network credential submission, and password unlock still require qualification in a dedicated Kestrel login session.

The development launcher loads resources, typelibs, libraries, and schemas from the build directory, without depending on an installed temporary prefix.

### Window corners and blur

Application windows use 12px rounded corners, including tiled windows. Maximized and fullscreen content stays edge-to-edge, retaining the compositor’s direct-scanout eligibility. Desktop backgrounds, docks, and drag icons keep their own shapes. Existing client transparency and shadows are preserved.

The corner mask runs in the surface’s existing draw pass. Window interiors retain opaque rendering and occlusion culling; only corner areas require blending. Wayland subsurfaces share their parent window’s corner geometry, and pointer hit regions follow the visible corners.

Shell glass uses separable Gaussian blur, with horizontal and vertical passes, adaptive downscaling, and paired texture taps through GPU linear sampling. It does not use Dual Kawase. The backdrop cache tracks damaged regions per display, and shell text is drawn separately from the blurred background.

Build the compositor with `kestrel/compositor/build.sh` before launching a development session. Source, build files, and installed libraries stay under `kestrel/run`; no host compositor packages are replaced. See [the compositor notes](compositor/README.md) for the patch boundary.

### Window icons

Kestrel supports `xdg-toplevel-icon-v1` theme names and shared-memory images. Window-backed panel entries, window previews, and the window switcher update when the client supplies an icon. Installed application groups retain their desktop-entry icons. Clients must implement the protocol; app-ID and desktop-entry matching still determine grouping.

Mutter changes are maintained as an ordered Git patch series with a pinned upstream commit. See the [compositor workflow](compositor/README.md) for editing, replay checks, and rebasing onto new releases.

### Notifications and keyboard interaction

New notifications slide up above the clock at the bottom right and fade away after a few seconds. Hovering a banner keeps it open and reveals its actions. Banners wait while the notification center is open.

Notifications are ordered by their latest update across applications. Cards open the notification, expose its actions, and offer a dismiss button and Delete shortcut. Resident actions keep the center open. Text wraps, keyboard focus follows dismissal, and offscreen controls scroll into view. Empty lists disable Clear all. Cards are reused during updates, created only when the center opens, and frozen during the closing animation.

Escape in Start clears the current search, then leaves a folder, then closes the menu. The search caret follows the desktop blink preference and timeout. Up on a running panel app opens its window previews with the window action focused. Preview proportions follow window resizing; closing releases the clones after a short fade, while session dismissal removes them immediately.
