# Extensions

Extensions add to Kestrel: layers over the wallpaper, shaders on windows and the whole screen, quick settings tiles, taskbar buttons, pop-up panels and small windows, keyboard shortcuts, search results, notifications, sounds, and pages in Settings. They can follow calls, hold notifications back for a while, connect to the hosts they name, keep secrets in the keyring and ask each other to do things. Extensions are written against a versioned API object Kestrel hands each one, never against Kestrel's own code. Only trusted extensions run inside Kestrel's process: those schelf.store approved to run there, and, while Developer tools is on, ones the person chose to run there themselves ([extensions nobody reviewed](#extensions-nobody-reviewed)). Anything else, such as an extension copied into your own folder, runs in a sandbox of its own, a separate process that reaches nothing but the parts of the API that can be served across it ([where extensions come from](#where-extensions-come-from), [extensions in a sandbox](#extensions-in-a-sandbox)). What Luft does for everyone, such as the emoji picker, clipboard history and dictation, stays built into Kestrel; extensions are for what's optional. How to write one is in [the developer docs](https://docs.luft.computer/extensions/getting-started/); this page is how it works inside Luft.

| Where | What |
| --- | --- |
| `kestrel/ui/src/extensions/runtime` | Finding, loading, enabling and switching off extensions, their stored settings and crash guard |
| `kestrel/ui/src/extensions/sandbox` | Running extensions from your own folder in a sandbox: `host` is the program inside it, `shell` the side in Kestrel that starts it and serves the API to it |
| `kestrel/engine/src/shell-sandbox.c` | The system call filter sandboxes run under |
| `kestrel/ui/src/extensions/api/v1` | API version 1. `types.ts` and the files in `types` are the contract; everything else implements it |
| `kestrel/ui/src/extensions/service.ts` | The D-Bus interface below |
| `kestrel/engine/src/sound` | `ShellSoundMix`, which plays an extension's sounds, and `ShellAudioMonitor`, which measures what the computer plays |
| `packages/extension-api` | `@luft/extension-api`, the types for extension authors, written from that contract by `bun kestrel/ui/extensionApi.ts`. `bun run check` in `kestrel/ui` fails when it's out of date |
| `extensions` | Lantharos's own extensions, such as Seasons, Strays, Playthings, Keystrokes, Focus, Reminders, Phosphor, Tailor and Pult. Each has a `build.sh` that makes its folder, which `extensions/pack.sh` packs for schelf.store |
| `apps/system/settings/src/lib/panels/personalization/extensions` | Settings → Extensions, each extension's page, and its rows on other pages |

## On disk

```
<folder>/<id>/                             one folder per extension, in one of the folders below
  extension.toml                           the manifest
  extension.js                             one ES module whose default export is enable(extension)
  locales/<language>/*.ftl                 translations, English in locales/en
  ...                                      anything else it ships, such as a helper program
```

What an extension keeps for itself lives outside its folder, so updates keep it: files in `~/.local/share/luft/extension-data/<id>/` and stored values in `~/.local/state/luft/extension-storage/<id>.json`. Removing the extension deletes both. `writeText` writes a file there through GIO on a worker thread, to a temporary file that's synced and renamed over the old one, so a crash leaves the old contents or the new ones, and the compositor never waits for the disk.

### Where extensions come from

Extensions come from Schelf; Luft itself doesn't ship any. Kestrel looks in these folders, in this order, and each folder in them is an extension whose name must be the manifest's `id`:

| Folder | Comes from | Runs |
| --- | --- | --- |
| `/var/lib/luft/extensions/<uid>` | schelf.store, for that account only | Inside Kestrel |
| `/var/lib/luft/unreviewed-extensions/<uid>` | Copies the person installed from their own folder, nobody reviewed them | Inside Kestrel while Developer tools is on, otherwise like one from the own folder |
| `~/.local/share/luft/extensions` | Anything else, such as an extension someone unpacked themselves | In a sandbox of its own, or not at all when it asks for a part of the API only Kestrel's process has, listed as `store-only`. One whose folder the person approved runs inside Kestrel while Developer tools is on |

Kestrel decides by the folder alone, never by anything inside the extension. An extension only counts as coming from the store when the folder it's in, and every folder above it, belongs to root and nobody else can write to it; otherwise it's treated like one from your own folder. Only the system packages service (`com.lantharos.Packages1`) writes there, after it checked the release itself against schelf.store's signature ([Schelf](components/schelf.md#extensions)). A copy in your own folder of an extension the store's folder has is ignored and listed in `ignored`; its settings, stored values and data are keyed by id, so the one that runs keeps them.

An extension runs unless it's turned off. Removing a store extension asks the system packages service to delete it.

A development build of Kestrel, started from its build folder and not the installed one, also honours `KESTREL_STORE_EXTENSIONS`, a folder that stands in for the account's store folder without being owned by root, `KESTREL_UNREVIEWED_EXTENSIONS`, which stands in for the account's folder of unreviewed copies and its approved folders the same way, and `KESTREL_DEVELOPMENT_EXTENSIONS`, a folder after them whose extensions run inside Kestrel like store ones, for working on Kestrel and Lantharos's own extensions. Headless sessions use all three, with a stand-in packages service that writes the second. The installed Kestrel ignores them.

### Extensions nobody reviewed

Someone who trusts an extension that isn't on schelf.store, or who is writing one and wants to try what only works inside Kestrel, can run it there while Developer tools is on. Both ways start on the extension's page in Settings, from a modal that says what it means, and both are recorded by the system packages service, never by anything in the home folder:

- **Install a copy** hands the service the extension's folder as an open file descriptor with `InstallUnreviewedExtension`. The service reads it beneath that descriptor alone, refusing links, other mounts, anything that isn't a file or a folder and anything that doesn't belong to the caller, within the same limits as a store archive, and puts the copy in `/var/lib/luft/unreviewed-extensions/<uid>/<id>` owned by root, in place of an earlier copy. What runs can't change afterwards; updating is installing a copy again. The folder it came from is listed in `ignored`.
- **Run from its folder** records the extension's folder in the account's own folder with `AllowExtensionFolder`, in `/var/lib/luft/unreviewed-extensions/<uid>/.folders.json`, owned by root. Kestrel then runs the extension from that exact folder inside Kestrel, so an edit runs on `Reload`. Anything that can write the folder can then run code in the compositor, which the modal says.

Both calls are refused while Developer tools is off, which the service reads from `com.lantharos.Greeter1` itself, and to every program but Luft's Settings, and polkit asks for an administrator's password every time (`com.lantharos.packages.unreviewed-extensions`, `auth_admin`, nothing kept). `RemoveUnreviewedExtension` takes a copy and an approval away for the caller without asking, since that only makes things safer; Settings offers it on the page, and removing such an extension calls it too.

Kestrel reads the copies and the approvals only when their folder and every one above it belong to root and nobody else can write them, and the switch from `com.lantharos.Greeter1`, waiting with these extensions until it knows. `List` gives their `origin` as `copy` or `folder`. While Developer tools is off they run like any other extension of the own folder, in a sandbox or not at all; turning the switch either way restarts them on the right side at once. Settings marks them "Not reviewed" with how they run, on their page, in the list and in their rows on other pages.

### The version of Luft an extension needs

```toml
[luft]
minimum = "1.2"   # or a nightly, such as "1.2-nightly.21"
```

An extension says the oldest version of Luft it runs on in its manifest, and schelf.store copies it into the release's `requires.luft` in its signed index. Versions are ordered the way Luft releases them: every nightly comes before the release it leads to, so `1.2-nightly.21` is older than `1.2` and newer than `1.1`. The running version is the image's own, which Kestrel asks the update service for each time it starts. It keeps the answer in `~/.local/state/kestrel/luft-version` with the system's startup image it came from, so the next start on that image can use it at once; an image that's only renamed, as a nightly promoted to a release is, keeps the older name there until the answer arrives, which can only hold an extension back, never let one through early. An extension whose minimum is newer isn't loaded, whichever folder it's in, and is listed as `needs-newer-luft`; it loads by itself once an update makes the version new enough. While Kestrel doesn't know the version, extensions that name one wait. Schelf refuses to install or update to a release that needs a newer Luft before it downloads anything, offers the newest release this Luft can run when the index lists one, and says on the store page which version the newest needs. `extensions/pack.sh` refuses to pack an extension without it.

## Manifest

```toml
id = "com.example.Clock"          # reverse DNS, the same as the folder
name = "Clock"                    # English; a message extension-name translates it
description = "A clock on the wallpaper."
version = "1.2.0"
api = 1                           # the extension API version it targets
permissions = ["wallpaper", "quick-settings"]

[helper]                          # optional native program, started through the API
path = "clock-helper"
turned-off = ["restore"]          # optional arguments it runs with once when people turn the extension off or remove it

[network]                         # optional hosts it connects to, over HTTPS
hosts = ["api.example.com"]
listen = [{ port = 4242, protocol = "udp" }]  # and ports its helper takes connections on

[[settings]]                      # switch, choice, choices, slider or color
key = "seconds"
type = "switch"
label = "seconds"                 # a message id; its .description attribute is the line under it
default = false
page = "appearance"               # also shown on this page of Settings, if a permission allows

[[settings]]
key = "format"
type = "choice"
label = "format"
default = "digital"
options = [{ value = "digital", label = "digital" }, { value = "dial", label = "dial" }]

[[settings]]
key = "hands"
type = "switch"
label = "hands"
default = true
depends = "format"                # shows only while another setting, declared before it, shows
when = ["dial"]                   # and has one of these values

[[shortcuts]]                     # changed in Settings → Keyboard
key = "show"
label = "shortcut-show"
default = "<Super><Alt>c"
```

The full reference, with every setting type, is [the manifest reference](https://docs.luft.computer/extensions/manifest/). Kestrel refuses a manifest that targets an API version it doesn't run, asks for a permission it doesn't know, or declares settings that don't fit together.

Permissions say what an extension uses, and decide which parts of the API object it's handed. They aren't a sandbox ([what permissions are](#what-permissions-are-and-arent)). With the words Settings and the store show for them:

| Permission | Shown as |
| --- | --- |
| `wallpaper` | Draw over the wallpaper |
| `quick-settings` | Add tiles to quick settings |
| `taskbar` | Add buttons to the taskbar |
| `search` | Add results to search |
| `notifications` | Send notifications |
| `weather` | See the weather where you are |
| `location` | See roughly where you are |
| `media` | See and control what's playing |
| `popups` | Show panels and small windows |
| `typing` | Type into other apps |
| `sounds` | Play sounds |
| `audio-levels` | Follow the beat of what's playing |
| `calls` | Know when you're in a call |
| `locked-sounds` | Keep playing sounds while the screen is locked |
| `input-sounds` | Play a sound when you type and click, without seeing your keys |
| `do-not-disturb` | Hold back notifications for a while |
| `screen-effects` | Draw over and change how your windows and the whole screen look |
| `clipboard` | Copy to your clipboard |
| `file-actions` | Add to the menu of files and folders in Rover |

`locked-sounds` and `input-sounds` need `sounds` too, and `input-sounds` can't go with `audio-levels`, which could hear the presses in the sound. A `[helper]` table isn't a permission, but the store shows that the extension runs a program of its own. `[network]` isn't one either, but Settings and the store show the hosts it names as "Connect to api.example.com", and Settings shows the ports under `listen` as "Take connections from devices on your network, on port 4242". `List` reports them too. Kestrel hands the ports of running extensions to Luft's firewall, which lets devices on networks marked as home reach them on Kestrel's helpers, and nowhere else ([details](security.md#extensions)). `[[shortcuts]]` shows in Settings → Keyboard.

A setting's `depends` hides it until another setting allows it. Without `when` that's a switch being on. With `when` it's any of a list of values, of a `switch` (`[false]` shows it while the switch is off), `choice`, `slider` or `color`, any of the options of a `choices` setting being picked, or a part of a slider's range, such as `{ min = 0.5 }`. A setting hides with the one it depends on, whatever that one's value, so they chain. Hiding changes nothing about a value: it stays stored and keeps its meaning to the extension. Kestrel refuses a `depends` on a setting not declared before it, and a `when` with values that setting can't have.

A setting with `hidden = true` never shows. The extension sets it itself, with `settings.set`, and other settings can depend on it, which is how one can show only for what it found on the computer.

A setting's `page` puts it on another page of Settings too, under the extension's name, while the extension runs: `appearance` needs `wallpaper`, `taskbar` needs `taskbar`, `sound` needs `sounds` or `audio-levels`, and `input` needs `typing` or `input-sounds`.

## D-Bus

Kestrel serves `com.lantharos.Kestrel.Extensions` at `/com/lantharos/Kestrel/Extensions` on its session bus name `com.lantharos.Kestrel`. Sandboxed apps are refused.

| Member | Does |
| --- | --- |
| `List() → aa{sv}` | Every installed extension, see below |
| `Enable(s id)` | Turns it on, forgetting why Kestrel turned it off |
| `Disable(s id)` | Turns it off |
| `Reload(s id)` | Reads its folder again: a new or updated extension starts, a removed one stops. A new version of an extension Kestrel turned off runs again |
| `Remove(s id)` | Stops it and deletes it with its settings |
| `SetSetting(s id, s key, v value)` | Changes one of its declared settings; a value that doesn't fit is refused |
| `SetShortcut(s id, s key, as accelerators)` | Sets one of its declared shortcuts |
| `ResetShortcut(s id, s key)` | Puts a shortcut back to its default |
| `Page(s id) → s` | The page it describes for Settings, as JSON, or an empty string. Kestrel builds it only when asked |
| `Act(s id, s control, v value)` | Runs the callback behind a control of the page Kestrel last built, by the `action` id the JSON gives it |
| `ApiVersions` (property, `au`) | The extension API versions this Kestrel runs |
| `ExtensionsChanged` (signal) | Something in `List` changed |
| `PageChanged(s id)` (signal) | The extension's page should be built again: it asked, or a setting changed |

Each entry of `List` has `id`, `name` and `description` (translated), `version`, `api`, `path`, `origin` (`store`, `copy`, `development`, `folder` or `own`), `ignored` (`as`, copies of it elsewhere that are left alone), `luft` (the oldest version of Luft it runs on), `permissions`, `helper`, `network` (the hosts it connects to), `listen` (`a(qs)`, each port its helper listens on with `tcp` or `udp`), `enabled`, `state` (`running`, `off`, `failed`, `crashed`, `invalid`, `needs-newer-luft` or `store-only`) and `problem` (why it isn't running), `settings`: for each setting its `key`, `type`, translated `label` and `description`, `value`, `default`, `depends`, `when` (`av`, the values it shows for) or `when-min` and `when-max` (the part of a slider it shows for), `page`, and `options` or `swatches` as `a(ss)` of value and label, with `min` the fewest options a `choices` setting keeps, `images` with the full path of each option's picture, or `min`, `max`, `step` and `unit`; `shortcuts`: for each its `key`, translated `label`, the `accelerators` it's bound to, its `default` and whether it `changed`; and `page`, whether it describes a page of its own.

## Settings pages

An extension's page in Settings lists its declared settings. One that calls `settingsPage.describe` gets a page of its own instead: Kestrel calls its builder when Settings asks with `Page`, turns the sections into JSON, checks every image against the extension's folders, and replaces each callback with an `action` id. A `sprite` row plays frames of a sprite sheet in a loop beside its title, with Settings doing the animating, which stops with reduced motion. Settings draws the page with its own controls and sends `Act` with that id and the new value. A declared setting follows its `depends` there as everywhere else, in the extension's rows on other pages and in quick settings menus too, and a section whose settings all hide goes with them. Nothing an extension describes runs in Settings, so it can't break Settings or reach into it. While the extension is off, the page lists its declared settings.

## Shortcuts

While an extension runs, Kestrel grabs its shortcuts from the compositor: what the person chose in `extension-shortcuts`, or else the manifest's default. A default is left unset when it's taken by Luft's own shortcuts, an app's, or one the person chose for another extension, or when it's something people type by accident; one the compositor refuses at grab time, because something else holds it, is reported unbound in `List`. Settings → Keyboard lists them under Extensions and catches conflicts when the person records one.

## Pop-ups

Pop-ups are drawn by Kestrel from a tree of its own controls, not by the extension, so they look and move like the rest of Luft and an extension needs nothing of Kestrel's internals to show one. A panel takes the keyboard and closes when it loses it; a window floats above windows and leaves the keyboard alone until clicked. Updates keep each control that stayed in place, so drags and typing carry on, and a panel keeps the keyboard when the control that had it is replaced, such as a Start button that becomes Pause and End. Pop-ups are for the desktop: they all close the moment the screen locks, and one opened while it's locked or nobody is signed in never shows; it comes back closed and its `onClosed` runs, so an extension that wants to be seen then sends a notification.

## Taskbar elements

An extension's `taskbar.addElement` puts an element in `taskbarElements` (`kestrel/ui/src/desktop/panel/elements/extensionElements.ts`), the contract between extensions and the taskbar's islands. The arrangement in `com.lantharos.kestrel taskbar-arrangement` decides where every element goes, by its `id` (`extension-id/key`, kept across versions): an island of its own, or inside another island next to Start, the dock, the tray, the status or the clock, on any edge. The extension never places itself. The first time an element appears it goes in front of the tray, and its place is kept while the extension is off.

| Member | Is |
| --- | --- |
| `id`, `label` | What the arrangement is kept by, and the element's name where people arrange the taskbar |
| `create(layout)` | Makes an actor for it on one display's taskbar. `layout` has `vertical`, `thickness` (the room across the island it sits in), `button` (a taskbar button's size) and `icon` (the size of the taskbar's own symbolic icons) |
| `watch(changed)` | Its label changed |

The actor's `relayout(layout)` follows its island to another edge or size, and `destroy()` takes it away. The actor sizes itself: its natural size along the taskbar animates as it grows under the pointer, shrinks, and shows or hides, so the islands just allocate natural sizes, and a hidden element takes no room. It has the padding of the taskbar's own buttons at each taskbar size, so an icon in an element sits as far from its neighbours as the tray and status icons do.

Where an element sits is the person's choice, never the extension's. They drag it while editing the taskbar, and on a taskbar that's one bar (edge to edge, or floating) the extension's Settings page also offers a place through a `taskbar-place` page item: before or after the apps, next to the tray, or at the start or end of the bar. Settings writes that choice into the arrangement with `placeElement` from `@luft/ui/taskbar`.

`ExtensionHost.taskbarIslands(monitor)` is the one place that says where the taskbar is on a display: the bar, or each separate island, with its edge and corner radius in stage coordinates, following islands as they move and hide. `taskbar(monitor)` is the box around the parts along the dock's edge, which layers get as `display.taskbar`. Pop-ups opened from a taskbar item open beside the island that holds it.

## Typing

`typing.type` commits text through the input method into the focused field, or pastes it where nothing takes typed text, after any held modifiers are released. It only works within ten seconds of the person using the extension; Kestrel counts its shortcut, its pop-ups, taskbar items, quick settings tiles, notifications and search results. The privacy indicator shows a keyboard for a few seconds after an extension typed, and its menu names it.

## Clipboard and files

`clipboard` puts text, a picture in its own type, or files as a `text/uri-list` on the clipboard through `St.Clipboard` (`api/v1/desktop/clipboard.ts`). Clipboard history sees it like any other copy.

`chooseFiles` asks the file chooser portal for files or a folder and returns their paths where they are, for what an extension hands its helper; `pickFiles` copies what was picked into the data folder instead. Both only work right after the person used the extension. The clipboard only takes pictures and files in the extension's folders and what the person chose while it runs.

## File actions

`fileActions.add` puts an action in `fileActions` (`kestrel/ui/src/extensions/fileActions/actions.ts`), where Kestrel's own Send to device for [Post](components/kestrel.md#post) is too, and which Kestrel serves to Rover as `com.lantharos.Kestrel.FileActions` at `/com/lantharos/Kestrel/FileActions` on `com.lantharos.Kestrel`. Rover asks for the list once, keeps it, and asks again on `Changed`, so its menu opens without a call to Kestrel; it decides which actions fit what was right-clicked and draws them with its own menu items.

| Member | Does |
| --- | --- |
| `List() → aa{sv}` | Every action that shows: `id` (`extension-id/key`, or `kestrel/post` for Post's), `label`, `icon` (the SVG it draws from), `kind` (`files`, `folders` or `any`), `types`, `extensions`, `multiple`, and `items` when it has a menu of its own, each with `key`, `label`, `icon`, `disabled`, `stays` (the menu stays open) and `separator` |
| `Opened(s id)` | Rover opened the action's own menu |
| `Activate(s id, s choice, as paths)` | People chose the action, or one of its entries by `key`, on these paths |
| `Changed` (signal) | An action came, went or changed, or asked to show its entries again |

Only Rover may call it. An action runs on the paths it's handed, so a sandboxed app that could call `Activate` could make Post send any file to a phone. Kestrel checks that the caller's program is Rover's, installed in `/usr/lib/sabine/com.lantharos.rover` or built in a test session's apps folder, and refuses everything else.

## Dropping files on the taskbar

A taskbar element with `onDrop` takes files dragged from apps. Kestrel can't read a drag that isn't over a window by itself, so patch 69 of the compositor adds `meta_dnd_set_shell_target()`. While a drag that carries `text/uri-list` moves, `XdndHandler` looks for an actor whose delegate has a `fileDrop` target under the pointer, lights it up and tells Mutter. Mutter then tells the app the drop would copy, and when the drag is let go there it reads the URI list from the app and emits `dnd-drop` with it, after `dnd-leave`, which `XdndHandler` hands to the target that was lit last. A target is asked about the actor actually under the pointer, so the taskbar itself, which opens the Send sheet for files dropped on a bare part of it, leaves drops on its buttons alone. Post's button takes files the same way. Drags from X11 apps aren't covered.

## Wallpaper layers

A layer draws one actor for each rectangle of its `area`, so what it leaves out costs nothing: the Visualizer has a band for each edge that's on. `below-windows` layers and sprites sit in a group of their own right above the wallpaper: over a picture inside the wallpaper's background group, and over a live wallpaper in the window group right above the wallpaper's windows, where it's put back after every restack, since Mutter lowers windows past any other actor in the window group whenever it restacks them. Each frame, a layer gets the windows on each display, topmost first, and the taskbar as outlines: their rectangles with the radius of every rounded corner, which Mutter reports through `meta_window_get_rounded_corners()` and the taskbar takes from its own shape, so a taskbar in islands is one outline for each island, with the edge it sits on. A layer can name picture atlases; `setPictures` packs up to eight pictures, and the frames of animated GIF and WebP pictures, into one texture of 128-pixel cells, which the shader samples. Pictures people pick come through the file chooser portal with `pickFiles`, which only works right after the person used the extension and keeps copies in its data folder. It also takes `calendars`, and `saveFile` asks where to save a text file the same way. Picking a `folder` copies the files directly inside it, up to 32 of up to 8 MB each, into a new folder there, and `readText` reads text files back.

## Sprites

A shader layer suits what fills the screen. `wallpaper.addSprites` is for a few small things instead, such as Strays' creatures: each sprite is one small actor between the wallpaper and the windows, so windows cover it by themselves, rounded corners and all, and moving it damages only its own few pixels. There's no shader, no frame clock and no timeline; a sprite that isn't told to change costs nothing, and `place` only touches what differs from the last call.

`loadSheet` cuts a picture into frames, each kept twice as a texture, as drawn and mirrored, with what shows of it. A sprite shows a whole number of screen pixels for each pixel of its sheet, the nearest to the `height` asked for, and snaps to screen pixels, so pixel art stays crisp at any display scale. Actors are filtered with nearest neighbour.

A sprite takes clicks only on what shows of its current frame, through a `vfunc_pick` around those pixels, so the desktop keeps every other pixel. A press takes the stage's grab; past a few pixels of movement the sprite is picked up, moves above the windows and follows the pointer, and it goes back below them when it's let go. A press that doesn't move is a click. Sprites hide while the wallpaper doesn't show, such as in the task view and on the lock screen.

`place` with `on` stands a sprite on a window, with `x` and `y` counted from that window's corner. The sprite moves right in front of the window actor in the window group, so it shows over the windows below and under those above, and `wallpaper/ride.ts` moves it itself: on `position-changed` and `size-changed`, which run before the frame that shows the move, on changes to the actor's translation and scale, which tiling and the second half of a size change use, and with the picture that stands in for a window while it changes size. Its distance from the window's corner stays one number, so there's nothing to round differently from one frame to the next, and the extension doesn't run at all while a window carries a sprite along. It stays a sibling of the window actor rather than a child: an X11 window's paint volume leaves children out, a child at the top of the actor would stop a window from being scanned out directly, and hiding the actor for a size change would hide it too.

A sprite can also be `smooth`, for painted art rather than pixel art: it shows at exactly its height, filtered and with mipmaps, and `place` can turn, fade and stretch it around a `pivot`. Smooth sprites belong to one display and share one group actor there, clipped to it, so they stack in the order they were added, windows pass a single actor rather than each sprite, and a glow reaching past the edge of a display doesn't show or repaint on the next one. `sprites.lift` takes the groups above the windows and back. They move by translation, which never queues a layout, so a moving sprite only damages itself. Their sheets keep one texture per frame, since they flip by scaling. A sprite at opacity 0 hides, and costs nothing to paint.

What shows of a frame is a box around each of eight bands across it, so an open shape keeps the desktop's clicks in its corners and between its parts.

`sprites.onFrame` runs a step before each frame on one `Clutter.Timeline`, which exists only while a step wants frames and stops when the last one returns false. It's for what moves right now. Anything ongoing belongs on a slow timer, which is how Playthings keeps ambient motion at 12 steps a second and runs the frame step only for what the pointer just touched.

`wallpaper.surfaces` reads windows and the taskbar on demand, each with an id that lasts as long as it does, the display's scale, a stable `id` of its own for keeping things per display, its `workArea` and whether something runs full screen. `onSurfacesChanged` connects to each window, workspace switches, displays and the taskbar's layout, only while an extension listens, and calls listeners once before the next frame, so nothing runs while nothing moves.

## Following the pointer

`wallpaper.followPointer` tells an extension about the mouse and fingers on the bare desktop and on its own `pressable` sprites, inside the areas it names and nowhere else. `DesktopPointers` (`wallpaper/pointers.ts`) stands behind it, one for all extensions, connected only while something follows.

It listens on each display's `Meta.BackgroundActor` and on pressable sprites, because Clutter only delivers events to reactive actors, so it hears nothing while a window, the taskbar or a surface is under the pointer. That's what keeps windows in front: a sprite behind a window can't react through it, and nothing runs per motion while the pointer is over a window. Over the bare desktop, each motion costs one look through the extension's areas, and only motion inside them reaches its code. When a window opens under the pointer, the pointer leaves the areas or the desktop, or something takes a finger over, such as the menu a long press opens, the extension hears `gone`.

Following only listens. A press on the bare desktop stays the desktop's, so the right-click menu and long press work as they always do, while the extension sees `down` and `up` beside them. A press with the primary button or a finger on a pressable sprite does belong to that sprite: its `down`, `move` and `up` carry the sprite and go on outside the areas, through Clutter's implicit grab, until it's let go. Each finger has its own `id` from its touch slot, 0 being the mouse, so several can hold several sprites. A press that began on the desktop and wandered over a window is the other case Clutter keeps delivering; for those, each motion picks what's under it and reports `gone` over a window. Right-clicks pass through a pressable sprite to the desktop's own menu, given to it with `bindDesktopMenu`.

Seasons follows the pointer without simulating anything. A motion only notes where the pointer went, and the frame that runs anyway eases each touch's position and strength and passes them to the shader as uniforms. `parted` in `effects/parted.ts` then says which part of the sky shows at a position, as a function of that position alone: it shifts sideways and never along the fall, so nothing is multiplied by time and however the pointer moves, drops keep their speed and can't race. How far a touch trails behind the pointer stands in for its speed, which widens the reach a little. Seasons starts following on the first frame that shows an effect that parts, over the displays that frame shows on, and stops when the setting, reduced motion, the power saver, a covered desktop or another effect rule it out. While a window is under the pointer the follow stays connected to the wallpaper, which hears nothing, so no code runs.

## Screen effects

`screen-effects` lets an extension run shaders on what's on the screen, in `api/v1/visuals/screenEffects`. Phosphor is built on it. Five kinds of effect cover what people ask for, each at the lowest cost that can do it:

| Effect | Goes on | Costs |
| --- | --- | --- |
| `addWindowOverlay` | A child actor of the window actor, above its surfaces | A few rectangles of shader, no offscreen target. A border draws and damages only its strips |
| `addWindowShader` | An offscreen effect on the actor holding the window's surfaces | One texture per window, redrawn when the window commits, drawn once otherwise |
| `addWindowTransition` | An offscreen effect on the window actor, while it opens or closes | Nothing between those moments |
| `addDesktopFilter` | A `ClutterViewFilter` on each stage view | One pass over the display on each frame, none while nothing changes |
| `addDesktopFilter` with `scope: 'desktop'` | A `ShellDesktopFilterEffect` on the wallpaper and each part of the taskbar | A copy of a kept picture while nothing under it changes, one pass over that picture when it does |
| `addSurfaceOverlay` | A `Clutter.Effect` on the taskbar's islands and Kestrel's panels, which adds one pipeline after the actor | One rectangle each time the surface draws, no offscreen target and no change to layout |

Rounded corners, the outline and shadows stay as they are, since a window shader runs on the surfaces, whose corners are already cut, under the shadow and outline, which `MetaWindowActor` draws. A shader that keeps alpha keeps the corners. Overlays read each corner's radius from `meta_window_get_rounded_corners()` as they paint, since Mutter settles corners while it paints a window and doesn't say when they change: with the setting, on maximizing or tiling, or when a neighbour moves. They draw a signed distance to that shape, in stage coordinates, so they stay sharp at any display scale, and a window that's see-through stays see-through under them. Clients that round their own corners follow the compositor's: Wayland apps are told they're tiled while corners are square, and X11 apps the same through `_GTK_EDGE_CONSTRAINTS`.

`match` decides per window from the app's id, the window's kind and whether it's focused, maximized or fullscreen. Titles aren't offered, so an extension can't read what's in a window from its effect rules.

### Whole-screen filters

A filter over the whole screen could be an offscreen effect on the stage, but that one texture would span every display at one scale, paint everything again for any damage, and lose culling. Patch 65 gives each `ClutterStageView` a chain of fragment shaders instead. The view paints into the offscreen texture it already uses for rotated and color managed output, so only what changed is painted, and a frame nothing changed in isn't drawn. Then the shaders run over the whole view and the onscreen buffer is swapped whole, since a pixel of bloom or curvature can depend on any other. Earlier passes draw into textures of their own at a part of the display's size, so bloom runs on half and quarter sized textures. A filter that moves queues frames with `queue_filter_frame`, which run the shaders and paint nothing. A view without a filter has no offscreen target and takes exactly the paths it took before, and `set_filter(null)` frees everything.

Chromatic aberration shows how a filter stays the same across scales: it samples red and blue a few pixels apart along the line from the middle of the display, further towards the edges, and `filter_scale` makes that the same distance on the display at 100% and 200%. It's part of the same one shader as the other filters, so it adds three texture reads, and as a still filter it draws only when something changes. In a window it's a window shader of its own, with its own texture, so a window with both it and the CRT holds two.

A filter can also go on the desktop alone, the wallpaper and the taskbar with windows left as they are. A filter on the finished picture can't do that: it can't take a window's shadow or see-through parts apart from the wallpaper behind them. So `ShellDesktopFilterEffect` sits on the actors themselves. Each paints into a texture covering its part of the display, which the chain of a `ClutterViewFilter` runs over, and a frame then only copies the result where the actor would have drawn. Windows paint over the wallpaper's result as they always did, so their corners, shadows and blur show it with no seam, and the taskbar's blur stays outside its effect and reads what's behind it. `filter_uv`, `filter_size` and everything else stay those of the whole display, so the pieces read as one picture, at any scale and on any edge. Colours reach these shaders unpremultiplied, since a piece can be see-through.

The texture stays while nothing in the actor changes, so a window moving over the wallpaper costs one textured rectangle in what it damaged. When something does change, `reach` grows the redraw clip by as far as the filter carries a pixel, through a redraw clip filter. A filter that moves repaints what's left of the desktop: `meta_compositor_get_uncovered_region()` keeps the region the compositor culled with, and `clutter_stage_view_queue_redraw_region()` repaints it with no actor marked as changed, so opaque windows aren't drawn again for a tick, and behind a fullscreen window nothing is drawn at all.

The wallpaper and what's drawn on it share one actor, `desktopLayer` in the layout manager. Pieces that aren't in it, a live wallpaper's windows with the layers and sprites over them and the frozen wallpaper behind a see-through window, get an effect of their own. The taskbar's blur can't follow a bend, so it's held off while one is on. For the same reason a bent desktop doesn't use the software pointer: over the desktop a stand-in actor is drawn where `shownAt` says the picture shows the pointer's position, and over windows the real pointer stays, on its hardware plane.

Filters run before rotation and the output color transform, in the view's blending color space, so they see what the desktop drew. Each logical display is one filter, except a tiled monitor made of two views, which bends each half on its own.

A filter that bends the picture asks for a software pointer with `meta_backend_inhibit_hw_cursor`, so the pointer bends with it and stays on what it points at. It costs a filter pass for each pointer movement. Filters that don't bend leave the hardware cursor alone, so the pointer stays free and isn't filtered.

### Fullscreen and scanout

By default an effect comes off a fullscreen window, and a filter comes off a display with one on it, so games and videos scan out directly and pay nothing. `fullscreen: true` keeps it on: a filter refuses direct scanout on its view by itself, and a window effect on a fullscreen window calls `meta_compositor_disable_unredirect()` while it's there.

### What moves

Effects don't follow the display's refresh. Each that moves says how many frames a second it wants, 30 by default, and shares a timer with others at that rate. The timers stop on the lock screen, while the display is off, in power saving, with reduced motion, and 30 seconds after the last input, through the same idle monitor Kestrel dims with. Nothing else makes a frame: a still filter over a still screen draws nothing.

### When something goes wrong

Cogl compiles a pipeline the first time it draws, and used to only log what the driver said. `cogl_context_take_shader_error()` keeps the message, so `compileError` draws one pixel with the real snippet on a real pipeline and asks. An effect that fails this never goes on the screen. The extension keeps running, its `onProblem` is called, and a notification names the effect.

While anything is attached, `FrameWatch` waits for the GPU right after a paint, every two seconds and only when something paints. Three frames in a row of 250 ms or more, or one of 1.5 seconds, turn off the most expensive effect attached, with a notification, and the watch goes on. `cogl_framebuffer_finish` holds the frame for as long as the GPU needs to finish it, which is the work it was doing anyway.

`<Control><Alt>Escape`, `screen-effects-off` in `com.lantharos.kestrel.keybindings`, is Kestrel's own shortcut rather than an extension's, so it works whatever an extension does, in every mode. It detaches everything at once, without running extension code, and sets `screen-effects-off` in `com.lantharos.kestrel`, which lasts across restarts, so an unreadable filter doesn't come back at the next sign-in. A notification and the extension's page bring effects back.

Kestrel notes in `~/.local/state/kestrel/effects-starting` that effects are about to go on, and removes the note when the GPU finished a frame with them. A note left at the next start means the computer or the desktop went down before that, such as a shader that hangs the GPU, which a crash count wouldn't see after a restart of the computer: Kestrel then starts with effects off and says so. Crashes after that are the [crash guard](#safety)'s: two in a row and the extension stays off.

Filters stay off on the lock screen, so it can always be read. Window and surface effects go too, since they run for the desktop and the lock screen covers it.

### Screenshots, recording and accessibility

Window effects and surface overlays are part of the scene, so screenshots and recordings show them. Filters aren't: captures paint the stage into their own framebuffers, which is why they miss night light too, and that's what a filter does unless it sets `captured`. Then `clutter_stage_paint_to_framebuffer` also paints each filtered view it touches into a texture and runs the filter over that. It costs a repaint of the whole view for each captured frame, so it's a setting. A recording of a filter that moves by itself only updates when something else on the screen does.

The magnifier clones the stage inside the scene, so filters apply over what it shows, and its own brightness, contrast and color effects stay on its actors, untouched.

### What they cost

`session.sh frames` measures Phosphor with 12 extra windows open while a window slides across the screen. On an NVIDIA GPU with a 60 Hz virtual display, the median time the GPU took for a whole frame after the paint, in milliseconds:

| Effect | 1440×900 | 3840×2160 |
| --- | --- | --- |
| Nothing on | 0.9 | 1.3 |
| Border on every window | 0.5 | 0.7 |
| Scanline overlay on every window | 0.7 | 0.6 |
| CRT in every window | 0.4 | 1.5 |
| Screen CRT | 0.8 | 2.2 |
| Screen CRT with curvature | 1.0 | 2.2 |
| Screen colour grade and shadow boost | 1.0 | 1.3 |
| Screen bloom | 0.4 | 3.9 |
| Screen chromatic aberration | not measured | 1.1 |
| Chromatic aberration in every window | not measured | 0.8 |
| Everything on the screen at once | 1.3 | 5.1 |

These are one run on a busy computer, so differences under a millisecond say little. An integrated GPU takes several times as long. A filter on a 4K display also holds about 33 MB for the view's texture, and bloom about 12 MB more; each window with a shader holds a texture of its own size.

### Luft's apps

Part of an app's pixels are the app's, and Kestrel doesn't touch them. `setAppLines` sets `app-lines` in `com.lantharos.kestrel`, which reaches every Luft app through `luft-app` as an `appearance.lines` event and a `data-lines` attribute, the way square corners do, and `base.css` in `@luft/ui` draws the lines over the page with a pseudo element. It goes when the extension does. Other apps have no shared theme to go through, so what can reach them is a window overlay.

## Sound

Each extension that plays sounds gets one `ShellSoundMix`: a PipeWire playback stream named after it, made when it first plays, with sounds decoded once into memory, mixed with per-sound volume and fades and gapless loops, and silenced while the session isn't active. One with `locked-sounds` can keep its stream going while the screen is locked by holding `lockedSounds.keep()`, which Soundscapes does while its sleep timer runs; letting go, or the extension being turned off, silences it again. `ShellAudioMonitor` listens to the default output's monitor with a passive capture stream, but only while some extension holds a listener and `ShellMixer:playing` says an app plays; reading it runs an FFT of the latest samples on demand. Kestrel's own capture doesn't count as recording for the privacy indicator.

## Sounds for keys and clicks

`input-sounds` is what lets an extension sound like a keyboard without learning anything about typing. `typing` isn't involved: that one types into apps, and has nothing to do with reading the keyboard.

The extension only ever hands over files and levels. `ShellKeySounds` (`kestrel/engine/src/sound/shell-key-sounds.c`) decodes them ahead into memory and then does everything else in the compositor: while a level is above 0 it has a Clutter event filter, ahead of Mutter's own, that sorts a press and plays a sound for it. No JavaScript runs for a press, nothing reaches the extension, and there's no signal, callback or value it could read one from. `sounds.onEnded` and the like don't apply, because these sounds never pass through `sounds.play`.

Exactly what's looked at for each press:

| Press | Sorted as |
| --- | --- |
| Space | `space` |
| Enter, on either side | `enter` |
| Backspace | `backspace` |
| The volume keys and the power key | Nothing, and it doesn't sound |
| Any other key up to `KEY_COMPOSE`, by its Linux key code | `key`, the same for all of them |
| Any mouse button | `click` |

That sorting stays inside Kestrel too: the extension doesn't see the kind, only which of its files get played. Held keys don't repeat, and events the input method sends again, synthetic ones and pointer events made from touch don't count.

Nothing plays at all:

- while the desktop isn't active: the screen is locked or locking, or the session is on another seat. `active-changed` of the screen shield sets this as the lock starts, not when it finishes.
- while the keyboard is in a `ClutterText` with a password character, checked at each press, so it covers every Kestrel prompt, whatever its input purpose.
- while an app's field says it's hidden. `InputMethod.hidesTyping` is on from the moment a field with the password purpose, or the `SENSITIVE_DATA` or `HIDDEN_TEXT` hints, has input method focus, until it loses it. This goes for Wayland apps through `text-input-v3`.

That last one depends on what apps say. A field that never says it's a password can't be told from any other: a terminal asking for a password, and X11 apps, which don't use `text-input-v3`. People hear keys there, so Keystrokes says so on its page and in the store, and the extension still learns nothing.

Because a sound is played from the file the extension picked, an extension that could also hear the computer's output could count presses, so the manifest refuses `input-sounds` with `audio-levels`.

Playback goes through a lane of the extension's `ShellSoundMix`, `shell-sound-strikes.c`, made for following a press at once. It has its own stream with `PW_STREAM_FLAG_RT_PROCESS` and a 128-frame quantum, about 2.7 ms at 48 kHz. A press goes from the compositor's main thread into a lock-free ring, without a syscall, and the stream's realtime thread takes it at the start of its next cycle, so neither thread ever waits for the other and the compositor can't stall on audio. Each press picks a file at random, never the same one twice in a row, with a little over ±1 dB of level and ±3% of pitch, which the mixer applies by interpolating at a fixed-point rate.

Nothing allocates while it plays: voices come from a fixed set of eight. At most six sound at once, and the oldest of them fades out over 2 ms for the next, so fast typing can't pile up. A soft knee above 0.75 keeps the sum below full scale. A press older than 250 ms when the stream gets to it is dropped rather than played late, such as while the output wakes up.

The stream stays running for 2 to 4 seconds after the last press, so the first key of the next word isn't late, and then stops, along with its timer; a pack that was replaced is let go then, once no voice can be playing it. At rest it has no wakeups at all. `desktop:keystrokes` measures how long a press takes, along with what typing costs. On a USB sound card, the output adds 4 ms, so a press while typing is heard about 7 ms later. Waking the stopped stream adds 2 to 3 ms. After 5 seconds or more of silence the sound server has suspended the card as well, and waking it takes 10 to 16 ms, so that first key lands at around 15 to 20 ms, a little past the target, and Bluetooth outputs are slower still.

`get_latest_latency` on `ShellKeySounds` is how checks measure it: microseconds from the press to the sound leaving the computer, as far as PipeWire can tell. It's not part of the extension API.

## Media

`media` builds on Kestrel's MPRIS client: every player, its album, length, position and seeking, and artwork as a local file. Art a player gives as a web address is downloaded once into `~/.cache/kestrel/media-art`, which keeps the last 64 pictures, and views may show files from there. Any app can be a player, so Kestrel only fetches art from hosts on the internet: an address on this computer or the local network is refused, also when a redirect leads there, and a picture over 16 MB is dropped. `media.output` sets the output's volume and device through `ShellMixer`.

To try an extension while working on Kestrel, unpack it into the development folder of a development build ([where extensions come from](#where-extensions-come-from)) and call `Reload(id)`; to update, replace the folder and call `Reload(id)` again.

## Weather

`weather` asks Luft's own site, `https://luft.computer/api/weather`, which passes the question on to Open-Meteo, so the weather service never sees the computer. Kestrel sends the position GeoClue gives it, rounded to a tenth of a degree (about ten kilometres), and nothing else: no cookies, no language, no identifier. The site shares one answer between everyone in the same square and keeps no record of who asked. Nothing is asked while location services are off or while no extension wants the weather, a report is kept for half an hour, and an answer that's over 4 KB or holds values no weather has is dropped.

Start's currency conversions get the day's rates the same way, from `https://luft.computer/api/rates`, which takes no parameters. Both go through `shared/network/luftSite.ts`. Turning off **Weather and currency rates** in Settings, under Privacy, sets `online-lookups` in `com.lantharos.kestrel` to false, and then neither is asked for: conversions keep using the last rates saved, and extensions get no weather.

## Settings

Kestrel keeps what the person decided in `com.lantharos.kestrel`: `disabled-extensions`, `extension-settings` (values by id and key, only those changed from the default), `extension-shortcuts` (shortcuts the person set, by id and key) and `extension-problems`. Settings changes them only through the D-Bus interface, so every value is checked against the manifest.

## What permissions are, and aren't

What the permission list does, for every extension:

- **It decides what the API object has.** `createApi` (`api/v1/core/create.ts`) builds the object from the basics plus one part for each permission, the helper, shortcuts and network hosts the manifest names. An extension that didn't ask for `taskbar` has no `taskbar`. The parts hold to their own rules: `network.fetch` refuses hosts the manifest doesn't name, `typing.type` only works right after the person used the extension, and so on.
- **It's what people are shown.** Schelf lists the permissions, the hosts and whether there's a helper before installing, and Settings lists them on the extension's page. Schelf records what the person agreed to, and an update that asks for more waits until they agree again.
- **It's what schelf.store checks and reviews.** The store reads the list from the release itself, refuses permissions the API doesn't have, and sends a release that adds a permission, a host or a helper to review.

What else holds depends on where the extension comes from ([where extensions come from](#where-extensions-come-from)).

**Extensions that schelf.store approved run inside Kestrel.** They're JavaScript Kestrel imports into its own realm, the one the compositor and the shell run in, which is what lets them draw in the same scene as everything else. There the permissions describe the API, which is all these extensions use, and are not a wall: code in Kestrel's realm could `import` from `gi://` like Kestrel's own modules do. So only extensions someone vouched for get there: a store extension only lands in its folder when schelf.store's signed index says its publisher is verified and that exact release was approved to run inside Luft, which the system packages service checks itself before it unpacks anything. A program running as the person can't change that folder, so it can't swap in code that runs inside the compositor. A helper of these extensions is a program running as the person, started outside any sandbox, with their files and network, including when it's run to undo its changes as the extension is turned off.

**Extensions nobody reviewed run inside Kestrel only while Developer tools is on**, and only once the person approved them in Settings with an administrator's password ([extensions nobody reviewed](#extensions-nobody-reviewed)). There they have the same reach as store extensions, without anyone having vouched for them.

**Anything else runs in a sandbox, holding to exactly what's listed**: a copy in your own folder can't reach more than the API it's handed, because that's all its process can reach. Its helper runs in the same sandbox ([extensions in a sandbox](#extensions-in-a-sandbox)).

What Kestrel checks for every extension, whatever its folder:

- **Files stay in the extension's folders.** Every path an extension hands the API, to read or write a file, play a sound, show a picture or icon or copy to the clipboard, is resolved with every link on the way followed, and refused unless it ends inside the extension's own folder, its data folder or something the person chose with `chooseFiles`. A link planted in the data folder can't lead anywhere else.
- **`open` only opens what's safe to open.** `https:` links, `mailto:` addresses, `schelf:` pages, and files and folders in those same folders, never a program, a script or a launcher such as a `.desktop` file.
- **The version of Luft it needs**, see [above](#the-version-of-luft-an-extension-needs).

What stands between people and a bad extension:

- **schelf.store.** Extensions go through the same checks and review as apps: a publisher with a proven namespace, the automatic checks, native helpers scanned like any program, and a person's review where the store's rules call for one. Running inside Luft also needs the owner's approval of each release.
- **Signatures.** Schelf only installs a release named in the store's signed index, and throws away a download whose size or SHA-256 differs from the signed entry ([Schelf](components/schelf.md)). The system packages service checks the same signature again before it installs an extension.
- **Being asked.** The permission list shown before installing, and again when an update widens it.
- **Pulling a release.** When schelf.store pulls an extension, Schelf turns it off on the computers that have it.
- **The guards below**, which are about mistakes, not malice: they keep a broken extension from taking the desktop down with it.

## Extensions in a sandbox

An extension from your own folder never runs inside Kestrel. Once the desktop has prepared its surfaces after signing in, Kestrel starts one host for each such extension that's on: `gjs` running `kestrel-extension-host.js` (`sandbox/host`), which loads the extension's module and hands it the same version 1 API object, built as a proxy to Kestrel. Turning the extension off, removing it, or Kestrel turning it off for a problem ends the host, and Kestrel takes away everything the extension made, as it does for one inside it.

The host runs under bubblewrap with every namespace of its own, user namespaces included and further ones refused, so it has no network but its own loopback, sees no other process, and reaches no socket outside it. It sees `/usr` read-only, its own folder read-only and its data folder writable, each at the path it has outside, a fresh `/tmp`, and nothing of the home folder, `/run` or `/etc`: no session bus, display, sound server or keyring. Its environment is emptied. `prlimit` caps its memory at 512 MB, and when Kestrel runs under the systemd user manager, the host also gets a scope of its own in `app.slice` with 768 MB of memory, no swap, 64 tasks and a low CPU weight; the extension's code only runs once that scope exists. Every process in the sandbox runs under the system call filter `Shell.sandbox_filter()` writes, which refuses other processes' memory, mounts and namespaces, the kernel's keyrings, modules and logs, BPF, `io_uring`, `userfaultfd`, `perf_event_open` and faking input on a terminal. A helper the manifest names runs inside the same sandbox, as does the program it runs with `turned-off`.

Kestrel and the host talk over the host's standard input and output, one JSON message a line, never a name on the session bus. Kestrel treats every message as hostile: a line is at most 2 MB, a host gets 400 messages and 8 MB at once and 200 messages and 2 MB a second after that, every argument is rebuilt from what each call takes (`sandbox/shell/shapes.ts`), with lengths, numbers and sizes held to ranges, views to 24 levels and a budget of parts, and only the calls in `sandbox/shell/served.ts` exist. A host holds at most 512 things that last, such as tiles and pop-ups, and its 64 latest notifications. Callbacks Kestrel calls in the host, such as a button in a pop-up, run while Kestrel goes on: an answer that takes more than 10 seconds, a host that sends more than it may, a message Kestrel can't read and a host that exits all turn the extension off, with the reason on its page in Settings, and nothing in Kestrel ever waits on a host. What the API reads without asking, such as `session.active`, the appearance, settings and stored values, is kept in the host and updated from Kestrel when it changes, so reading it costs nothing.

What a sandboxed extension gets, by part of the API:

| Part | In a sandbox |
| --- | --- |
| Basics: settings, storage, `t`, timers and `onClockChanged`, session, desktop, power, appearance, peers, secrets, `open`, `openSettings`, `pickFiles`, `saveFile`, `readText`, `writeText`, `deleteFile`, `onDisable`, the Settings page | Yes. Files are read and written in the sandbox itself, timers run there |
| `chooseFiles` | No: it hands back files where they are, which the sandbox can't reach. `pickFiles` copies them into the data folder instead |
| `quick-settings`, `taskbar`, `popups`, `notifications`, `search` | Yes, drawn by Kestrel from what the extension describes. A taskbar element's views are asked for once per layout and kept until the extension refreshes them; `onDrop` isn't offered, as it hands over paths of your files |
| `sounds`, `locked-sounds`, `input-sounds`, `calls`, `media`, `do-not-disturb`, `weather`, `location`, `network`, `clipboard`, `shortcuts`, `helper` | Yes |
| `wallpaper`, `screen-effects` | No: they put actors and shaders into Kestrel's scene, which only an extension inside it can |
| `audio-levels` | No: a reading is taken for each frame something draws, which only extensions inside Kestrel do |
| `typing` | No: typing into other apps stays with extensions schelf.store reviewed |
| `file-actions` | No: it hands over the paths of your files |
| `[network] listen` | No: the sandbox has no network to listen on |

An extension from your own folder that asks for a part it can't have isn't started, and is listed as `store-only` with what it asked for as its problem. A call that refuses something an extension asked, such as a path outside its folders, rejects the promise it returned; when the call returns nothing, which a host can't wait on, Kestrel writes the refusal to its log and the extension carries on. A message that doesn't fit what a call takes turns the extension off.

`session.sh capture --only extensions:host` starts a sandboxed extension seven times and prints the time from `Enable` to it running, the memory the host holds and the memory and longest pause it cost Kestrel. In a headless session on a desktop computer, the extension's taskbar item showed about 120 ms after `Enable`, the host held 8.4 MB of its own, Kestrel about 0.5 to 0.8 MB more, and Kestrel's main loop paused for at most about 26 ms meanwhile, against 10 ms while idle. Hosts start after the desktop is up, from the same low-priority queue that prepares its surfaces, so they add nothing to the time until the desktop shows, and an extension that's off has no host.

## Safety

- Every call into an extension's code is timed and guarded. An extension that throws while it turns on, or from anything Kestrel calls in it later, is turned off, everything it made is taken away, and a notification says so.
- Kestrel writes which extensions run to `~/.local/state/kestrel/extensions-running.json`. When `kestrel-wrapper` starts it again after a crash, each extension that was running gets a crash counted; at two in a row it stays off, with a notification. A start that isn't after a crash forgets the counts.
- The API object only has what the manifest asked for, which keeps an extension from using a part by accident. Inside Kestrel it's not a security boundary ([what permissions are](#what-permissions-are-and-arent)).
- A turned off extension costs nothing: its module is never loaded. A wallpaper layer has no actors while it's inactive and stops its frame clock while nothing shows, and its shader only runs over the area it asks for.
- Modules load once per path in GJS, so Kestrel copies `extension.js` to a temporary file for each load. That's what lets `Reload` run new code without restarting Kestrel.

## Calls

`calls` follows what the privacy indicator follows: `ShellMixer:recording` for apps recording from the microphone, and the camera monitor for apps filming. Kestrel's own dictation and level meters don't count. A call starts as soon as either is taken and ends three seconds after both are let go, so it doesn't end while an app switches devices. Soundscapes waits during calls, and Seasons quiets its rain.

## Holding notifications back

`doNotDisturb.hold()` holds back other apps' banners and sounds the way Do Not Disturb does: urgent notifications, apps people let through Do Not Disturb and the extension's own notifications still show, and everything held stays in the notification center. `surfaces/notifications/tray/holds.ts` keeps the holds, and the message tray asks them before it shows a banner or plays a sound. A hold counts what it held by app, while those notifications are still there, and never shows the extension what they say. `release()` ends it and hands those counts to the extension to sum up itself, as Focus does at the end of a session; when a hold ends any other way, including the extension being turned off, Kestrel sums it up with a notification of its own.

An extension that only wants to know, because something of its own should wait until it can be seen, doesn't need `do-not-disturb`: `notifications.heldBack` says whether banners are held back, for any reason, and `onHeldBackChanged` tells when that changes.

## The clock

Timers run on the monotonic clock, which stops while the computer sleeps, so a timer can't wait for a time of day by itself. `timers.onClockChanged` says when the time jumped: `wake` from logind's `PrepareForSleep`, `clock` from a `timerfd` armed with `TFD_TIMER_CANCEL_ON_SET`, which only fires when the wall clock is set, and `time-zone` from a file monitor on `/etc/localtime`, after clearing GJS's cached time zone so `Date` follows. `api/v1/clock.ts` watches these only while an extension listens, and none of them wake anything in between.

## Reminders

Reminders has exactly one timer, however many reminders there are. `Reminders.refresh` moves repeating reminders on, rings what's due and sets that timer for the earliest thing still to come: a reminder ringing, one coming back, a goal's nudge, a heads-up, or midnight, when the lists change. It runs again when something changes, when the clock jumps, when a hold ends and when the screen unlocks, and at no other time. Nothing is polled, so 400 reminders cost the same as none.

Times are kept as they read on the wall, a day and an hour with no time zone, and turned into an instant only when they're needed. That is what makes daylight saving and travel work: 09:00 stays 09:00. A time the clocks skip lands just after them and a time they repeat rings for the first one, which is what `new Date(year, month, day, hours, minutes)` does. Calendar arithmetic goes through UTC days, never through adding 24 hours. How long a snooze lasts or when something comes back is counted in real time instead.

What was due while it couldn't ring takes care of itself: a reminder remembers whether it rang for its current occurrence, so whatever's past due and hasn't rung rings at the next `refresh`, once, and a repeat moves to its latest occurrence first. While banners are held nothing rings and nothing's marked, so it all arrives when the hold ends. While the screen is locked, new reminders still go out, but ones coming back wait.

Reminders live in `reminders.json` in the extension's data folder, written with `writeText` after every change. Each has an `id` that never changes, which is its `UID` in calendar files, and an `updatedAt`, which is what syncing would need to match copies up. There's no sync today, and nothing leaves the computer. Quick add reads English: `parse/parse.ts` takes the phrases it understands out of the text one at a time, and what's left is the title.

## Pult

Pult asks `app.pult.sh` what's waiting with one timer, set again after each answer: a minute later, three minutes on battery, and twice as long after each failure in a row, up to 15 minutes. It only runs while someone is signed in to Pult and at the desktop, so not while the screen is locked, and not while the power saver is on. Unlocking, waking from sleep and opening its panel ask right away, and the panel offers Try again when Pult can't be reached. The API has no way to tell that the person stepped away without locking, so until the screen locks it keeps its pace.

## Network

`network.fetch` talks HTTPS to the hosts the manifest names under `[network]`, through one Soup session, and refuses every other host; plain HTTP is only allowed to `localhost` and `127.0.0.1`. Redirects are followed up to 20 times and held to the same rule at every hop, so a named host can't send an extension on to one the manifest doesn't name; an `Authorization` header isn't passed on to a different host. A response is read whole, up to 4 MB, and a request is cancelled after its timeout or when the extension is turned off.

## Secrets

`secrets` keeps values such as sign-in tokens in the keyring through libsecret, under the schema `com.lantharos.Kestrel.ExtensionSecret` with the extension's id and the value's key as attributes. Removing the extension deletes them.

## Requests between extensions

`peers.handle(name, answer)` answers requests from other extensions, and `peers.request(id, name, value)` asks one, with values copied as JSON. Both run in each extension's own guard, so an extension that fails while answering is turned off like any other. Soundscapes answers `play`, saying whether it was already playing, and `pause`; Focus uses them to play the mix during a session and stop it after, only if it started it.

## Wanted

What extensions need that the API doesn't offer yet:

- **Whether other apps play sound.** `audioLevels.playing` counts the extension's own sounds too, so an extension that plays sounds can't tell when another app starts. Soundscapes pauses for media players instead, which misses apps without one, such as games.

## Adding an API version

Version 1 grows in place while there are no extensions outside Luft's own: add to it, never take away or change what's there. When a change can't keep old extensions working, copy `api/v1` to `api/v2`, change the copy, add it to `API_VERSIONS` in `api/versions.ts` and to `extensionApi.ts`, and keep `v1` working. Extensions keep targeting the version they were written for.

## Tailor

Tailor dresses apps that have no theme files of their own. Each app is a folder in `extensions/tailor/themes` with a small module, and what it needs at run time beside it. The module implements `Theme` from `themes/mod.rs`: `detect`, `apply`, `refresh` for a new look, `restore`, and `watched`, the folders to sleep on. Adding an app means adding its folder, a line in `themes::all`, a switch in the manifest and its messages.

The extension sends the helper one line of JSON whenever the desktop's look or a switch changes, and the helper answers with which apps it found and how each is doing. Those it found go in the `found` setting, which is hidden and which every app's switch depends on, so Settings only ever shows apps that are there. A Flatpak being installed or removed shows up by itself. The helper has one thread on standard input and one on inotify, and both block, so it wakes only when there's something to do. Natively and as a Flatpak, each app is found by its folders.

Turning an app off runs its `restore`, and turning the extension off or removing it runs `tailor restore`, which does that for all of them. What's needed to undo a change stays next to the change, so nothing depends on the extension's data folder, which removing it deletes.

### Spotify

Spotify is restyled through whichever Spicetify is already there, wherever it's installed: Kestrel doesn't get the PATH of a terminal, so the helper looks in `~/.spicetify` and the other usual folders first, and asks Spicetify with `-c` where its config is. It fills in `spotify_path` and `prefs_path` when they're empty or point at something that's gone, as Spicetify can't find a Flatpak's prefs by itself. The helper puts the `Luft` theme in Spicetify's themes folder, selects it, remembers what was selected before in `previous-theme` next to it, and applies it without restarting Spotify, so the look shows the next time Spotify starts. If that fails, what Spicetify said is matched to something people can do, and its own words show under the status in Settings. A Spotify installed for everyone, as a system-wide Flatpak or a package, belongs to root, so Spicetify can't change it. Tailor never asks people to loosen those files' permissions: when the person also has a Spotify of their own, a Flatpak installed for their account, the helper points Spicetify at that one, and otherwise Settings says to replace it with one from Schelf, which installs Flatpaks for the account, and offers to open Spotify's page there. A finished `apply` only counts when the theme's script is in Spotify. When Flatpak swaps in a new Spotify, or a package puts back the `xpui.spa` Spicetify took apart, the helper sees it and applies the theme again.

Spotify's sandbox can't reach the session bus or `~/.config/kestrel`, and its Chromium doesn't follow the desktop's light and dark styles. So the helper passes the look on as server-sent events on `127.0.0.1:47291`, only to Spotify's origin. The theme's script remembers the last look, so Spotify opens in it before the stream connects.

Spotify's `…` button is native and always white, so the theme puts a dark pill behind it in the light style.

### Vesktop

Vesktop gets `luft.theme.css` in its `themes` folder, under `~/.var/app/dev.vencord.Vesktop/config/vesktop` for the Flatpak and `~/.config/vesktop` natively. It overrides Discord's own variables for surfaces, text, icons, controls and fonts on every theme class, so it looks the same whichever theme Discord is set to. Discord's window can't load fonts from that folder, as Vencord's protocol doesn't allow it for fonts, so `build.sh` puts Open Runde inside the theme as `fonts.css`. With square corners, the helper adds `square.css`: Discord shapes avatars, server icons and status dots with SVG masks on `foreignObject`, `rect` and `image`, and CSS masks on avatar classes, not corners, so it turns those off along with every radius, and closes the black circles masks use to cut the avatar out of a profile's banner. It's part of the same rewrite that reloads the theme. Vencord watches that folder, so a new look only means rewriting the file, and Vesktop reloads it while it's open.

Turning the theme on means adding it to `enabledThemes` in `settings/settings.json`, and there's no way to do that while Vesktop runs: it holds the file in memory, writes it whole on any change and never reads it again. So the helper only changes that file while Vesktop is closed, which it knows from `SingletonLock` being there and something answering on `SingletonSocket`, as a crash leaves the lock behind. Until then it sleeps on the folder, and Settings asks people to quit Vesktop once. The list is replaced where it stands in the file, written the way Vencord writes it, so the rest keeps its bytes and taking the entry out gives back the file it found. Turning the theme off while Vesktop is open removes the theme file, so the look goes at once, and the helper stays behind to take the entry out when Vesktop closes.

### Steam

Steam doesn't read a custom stylesheet by itself, and it has no setting or launch option for one. Every window it opens loads `steamui/css/library.css`, though, and the folder is writable, under `~/.var/app/com.valvesoftware.Steam/.local/share/Steam` for the Flatpak and `~/.local/share/Steam` natively. So the helper hard-links that file to `library.original.css` and renames a stand-in over it, which imports the original, `steamui/tailor/look.css` with the colors, `steam.css` and `recolored.css` from the same folder. Steam's startup check compares file sizes, so the stand-in is padded to the size of the file it replaces. Restoring renames the original back, with its bytes and its date.

Steam's stylesheets have almost no colour variables: they write about 45,000 colours out by hand on class names generated at build time, so a list of selectors can't keep up. The helper reads them instead. `recolor.rs` goes through every stylesheet in `steamui/css` and writes `steamui/tailor/recolored.css`, with each rule that draws with a colour again, and that colour replaced by a role of Luft's palette from `palette.rs`. Greys and Valve's dark blues step through the surfaces by lightness, or through the inks when they're text, Valve's blues become the accent, and text on the accent becomes the colour made for it. Green for Play, red and the like mean something, so they stay, and so do black shadows and the white behind a QR code. Roles are CSS variables, so a new look only rewrites `look.css`.

Each rule gets an id-weight `:not()`, which outranks Steam's own rules wherever they load, as `sp.css` loads after `library.css`, while leaving colours Steam's code sets on an element, such as a game's art, alone. Shorthands only set the part that's a colour, and plain colours in a rule come along so one that switches something off keeps working. Rules for the Big Picture interface stay out. The file is about 2 MB and takes under 100 ms to make, which happens when Tailor turns on and when Steam's stylesheets change.

`steam.css` only holds the roles, the fonts and a few shapes on the plain class names Steam keeps. With square corners, `look.css` also takes every radius out of the desktop interface. Steam's Chromium loads stylesheets once and can't be told to load them again without a debugging port or code running inside Steam, neither of which Tailor wants, so a new look shows the next time Steam opens. Store and community pages are websites, and stay as they are.

A Steam update rewrites its stylesheets. The helper sleeps on `steamui` and `steamui/css`, and when one changes it keeps a new `library.css` as the original, puts the stand-in back and recolors again.
