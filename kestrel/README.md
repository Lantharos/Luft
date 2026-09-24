# Kestrel

Kestrel is Luft's desktop shell. It uses a local Mutter 51 build with native window rounding and owns its panel, launcher, quick settings, notification center, and power menu in TypeScript. The imported engine retains GNOME Shell's C/St integration and the session services required for window management, authentication, screenshots, screencasts, and portals.

## Current checkpoint

- The engine and TypeScript UI compile against the GNOME 51 stack. The session launcher uses the locally built compositor.
- The development launcher supports a visible nested session and isolated captures at 1280×800 and 1440×900.
- The square, transparent 48px panel reserves the bottom edge. Its launcher and favorite/running apps stay centered against the monitor while live network, volume, and right-aligned, stacked date/time indicators sit on the right.
- Start’s default grid excludes apps pinned to the panel. Search includes every installed application, including pinned apps, and launches the selected result. Pinning or unpinning refreshes the grid immediately. Down moves from search into the app grid; arrows and Tab navigate controls, and focused apps scroll into view.
- Hovering a running taskbar app shows live window previews with activation and close controls. Clicking an app with multiple windows opens the same picker, and Up opens it from a focused taskbar button. Alt-Tab retains application switching, Alt-Escape cycles windows, and Ctrl-Alt-Tab includes the Kestrel panel.
- Lock and greeter modes hide the panel and dismiss all desktop surfaces immediately. Super and desktop context menus are unavailable while locked or while a system dialog holds focus. System dialogs dismiss open surfaces before taking focus.
- The panel follows the primary display and hides for fullscreen windows and focused windows covering the entire display. Desktop context menus stay on the clicked display; outside-click dismissal covers all displays, and monitor changes dismiss surfaces before repositioning them.
- Quick Settings provides network and Bluetooth controls, device selection for audio output and microphone input, brightness, Do Not Disturb, Night Light, power profiles, a Lock action, and a Settings shortcut. Compact glass controls place icons above their labels, with separate buttons for device details. Controls follow the available hardware and services. Device selectors open in an adaptive glass detail view with a Back button. The surface grows to fit available space; long lists use page buttons instead of scrollbars. The microphone control remains available when a microphone is present, even without an active recording.
- The notification center updates individual rows, batches notification bursts, and defers row construction while closed. Signal subscriptions follow the lifetime of their source and owning actor.
- The power menu fits its rows with an even 8px inset, opens above the Start footer, keeps Start visible, and delegates lock, suspend, log out, restart, and power off to the existing session action backend.
- Backdrop capture updates only freshly painted regions in a separate cache for each display view. Each cache tracks valid pixels; partial damage schedules another paint only for missing pixels. Unchanged captures can reuse the blurred output without allocating an actor-blur framebuffer, and offscreen capture is clipped to valid pixels. Settled surfaces do not continuously redraw.
- Shell blur includes a rounded mask in its final shader pass, keeping menu corners clean without an extra offscreen pass. Panel and menu blur share the same brightness without a tint overlay. The panel has square corners.
- Start uses six equal app columns, keyboard search, and a compact account and power footer with the AccountsService avatar when available. Panel hover highlights are inset and rounded, with up to four dots for each app’s open windows. A focused app keeps white dots independently of pointer presses.
- Main surfaces slide in over 300 ms and out over 230 ms. Power options reveal from the Start footer button over 200 ms and retract over 160 ms. Interrupted transitions reverse from their current position.
- The launcher uses the original two-part Luft mark at an optical size of 26px alongside 28px app icons, with its original proportions and a subtle split and opposing tilt on hover, without shrinking the two parts. Taskbar apps slide and fade in and out while their space expands or closes. The Start scrollbar is translucent, brightening on hover and drag. Search has a text-aligned caret that blinks while focused; running dots have a dedicated position beneath app icons. Newly opened surfaces stack above those sliding closed.
- Set `KESTREL_CSS_PATH` to a local stylesheet when launching the shell to reload styles after each saved change.

## Runtime scope

Desktop Quick Settings owns only the device controls used by Kestrel. It does not construct a second native Quick Settings menu or duplicate microphone slider. The retained session panel supplies login and lock-screen controls; the desktop does not populate it.

The legacy calendar, event list, world clocks, weather integration, GNOME welcome tour, break reminders, and unused status tiles have been removed with their resources. Local AccountsService integration remains for login, unlocking, user switching, and the Start avatar. Authentication, parental session restrictions, location permission prompts, Thunderbolt authorization, accessibility, screenshots, and screen sharing retain their system backends.

### Performance workload

Run `kestrel/tools/session.sh performance` to measure repeated search edits, app-button reuse, an 80-notification burst, row creation while hidden, and settled desktop paints. Search timings cover synchronous update work; they are not end-to-end display latency. The command uses an isolated headless session and exits when finished.

## Work before a Luft session

1. Make Kestrel the actual shell entry point and rename the build/session identifiers that still say GNOME Shell. The TypeScript UI is loaded by a reduced upstream `main.js` path. The retained overview coordinator is disabled; its app grid and window overview actors are not constructed.
2. Qualify monitor hotplug and mixed display scaling on hardware, and complete notification actions and persistent preferences.
3. Supply Luft session and portal configuration, including screenshot, screencast, file chooser, settings, and secret handling, then exercise the portal calls from client apps.
4. Verify polkit, keyring, network credentials, lock and unlock, OSD, accessibility, and GDM handoff under a real login session.
5. Package Kestrel with a pinned Mutter ABI for Luft, review runtime dependencies, and test on a disposable machine before making it a selectable default session.

The virtual session checks the build, JS startup, and captured rendering. It does not validate a physical display, login manager, suspend, or portal permission dialogs.

### Start folders and app order

Drag an app onto the center of another app to create a folder, or onto an existing folder to add it. Drop beside an icon to rearrange apps or folders; insertion marks show the position. The grid scrolls when a dragged icon approaches its top or bottom edge.

Open a folder to launch or rearrange its apps. Edit its name in the header. Drag an app onto the Apps breadcrumb to move it back out, or use its context menu. Right-click a folder to rename it or ungroup its apps. Empty folders disappear. Escape returns to Apps before closing Start.

App buttons are reused across searches, folders, and reordering. Search names are indexed when the installed app catalog changes.

Folder contents, names, and ordering are saved across sessions. Apps pinned to the panel stay hidden in the default grid and folder views, while search finds individual apps regardless of their folder or pin status.

### Context menus

Right-click an app in Start or the panel for launch actions, open windows, pinning, window sizing, minimizing, and closing. The panel, clock, status area, desktop background, account area, Quick Settings controls, notifications, and search field offer relevant shortcuts. Menus also open with the Menu key or Shift+F10 on a focused control; Escape closes the menu and restores focus. Long app menus scroll within the screen.

### Workspaces

Kestrel keeps one empty workspace alongside occupied workspaces, up to ten total. Empty workspaces are removed as windows close or move. Super+1 through Super+9 selects a workspace and Super+0 selects the tenth; Super+scroll or scrolling over the panel moves between adjacent workspaces. Transitions use the compositor’s workspace slide animation. These bindings replace the retained overview application shortcuts.

### System dialogs

The retained session components provide polkit authentication, keyring prompts, NetworkManager Wi-Fi and VPN credentials, and removable-volume prompts. The shell also exposes device-access permission dialogs, audio-device selection, mount password and question dialogs, logout and shutdown confirmation, screenshot and screencast selection, and accessibility prompts. Authentication and lock-screen verification continue to use the existing system backends.

Retained dialogs, native menus, switchers, notification banners, volume and brightness OSDs, screenshot controls, keyboard and input-method popups, lock notifications, and developer panels share Kestrel’s transparent blur treatment. Native menu arrows are removed. Context menus fit their labels, and closing surfaces retain their selection highlight through the animation. Quick Settings, notifications, and window previews use compact content-based sizing.

The capture command exercises audio selection and encrypted-volume password requests through D-Bus and cancels them without submitting credentials. It also checks keyboard navigation, lock-mode visibility, blocked Super activation, live window previews, Alt-Tab with real client windows, workspace shortcuts and scrolling, fullscreen panel visibility, volume OSDs, and screenshot controls. Lock-mode checks do not authenticate through GDM. A nested session shares the host login session, so its polkit agent cannot register alongside the host agent; polkit authentication, keyring unlock, network credential submission, and password unlock still require qualification in a dedicated Kestrel login session.

The development launcher loads resources, typelibs, libraries, and schemas from the build directory, without depending on an installed temporary prefix.

### Window corners and blur

Application windows use 12px rounded corners, including maximized and tiled windows. Fullscreen content stays edge-to-edge, retaining the compositor’s direct-scanout eligibility. Desktop backgrounds, docks, and drag icons keep their own shapes. Existing client transparency and shadows are preserved.

The corner mask runs in the surface’s existing draw pass. Window interiors retain opaque rendering and occlusion culling; only corner areas require blending. Wayland subsurfaces share their parent window’s corner geometry, and pointer hit regions follow the visible corners.

Shell glass uses separable Gaussian blur, with horizontal and vertical passes, adaptive downscaling, and paired texture taps through GPU linear sampling. It does not use Dual Kawase. The backdrop cache tracks damaged regions per display, and shell text is drawn separately from the blurred background.

Build the compositor with `kestrel/compositor/build.sh` before launching a development session. Source, build files, and installed libraries stay under `kestrel/run`; no host compositor packages are replaced. See [the compositor notes](compositor/README.md) for the patch boundary.
