## Appearance: style

settings-appearance-style = Style
# Row title for choosing between the light and dark style
settings-appearance-style-light = Light
settings-appearance-style-dark = Dark
settings-appearance-style-auto = Auto
settings-appearance-schedule = Switch to dark automatically
# Choice for the dark style schedule: never switch automatically
settings-appearance-schedule-sunset = Sunset to sunrise
settings-appearance-schedule-custom = Custom
# Followed by a time picker
settings-appearance-dark-from = Dark from
# Followed by a time picker
settings-appearance-light-from = Light from
settings-appearance-corners = Corners
settings-appearance-corners-rounded = Rounded
settings-appearance-corners-square = Square
settings-appearance-text = Text and fonts
settings-appearance-pure-black = Pure black
settings-appearance-accent = Accent color
# Accent color taken from the wallpaper
settings-appearance-accent-wallpaper = Wallpaper
settings-appearance-accent-white = White
settings-appearance-accent-custom = Custom
settings-appearance-theme-apps = Match other apps to the wallpaper
settings-appearance-theme-apps-description = Other apps and terminals take on the same colors

## Appearance: wallpaper

settings-appearance-wallpaper = Wallpaper
settings-appearance-wallpaper-light-description = Shown while the light style is on
settings-appearance-wallpaper-dark-description = Shown while the dark style is on
# Screen-reader label of the wallpaper preview when it can be moved
settings-appearance-wallpaper-position = Wallpaper position. Drag or use the arrow keys to show another part
settings-appearance-wallpaper-drag = Drag to reposition
# Screen-reader label of a video wallpaper; $name is the file name
settings-appearance-wallpaper-video = { $name }, video
settings-appearance-wallpaper-current = Current wallpaper
settings-appearance-wallpaper-empty = Images and videos in the Wallpapers folder in your Pictures show up here.
settings-appearance-wallpaper-add = Add wallpapers
# How many wallpapers a folder of wallpapers holds
settings-appearance-wallpaper-count = { $count ->
    [one] { $count } wallpaper
   *[other] { $count } wallpapers
}
settings-appearance-wallpaper-folder = Wallpapers folder
# Where the folder is; use the names your language gives the Pictures folder
settings-appearance-wallpaper-folder-description = Pictures › Wallpapers
# Row title: how a wallpaper fits the display
settings-appearance-wallpaper-fit-title = Fit
settings-appearance-wallpaper-fit-description = For wallpapers that don’t match the display’s shape
settings-appearance-wallpaper-fill = Fill
# Fit option: show the whole picture
settings-appearance-wallpaper-fit = Fit
settings-appearance-wallpaper-center = Center
settings-appearance-wallpaper-stretch = Stretch
# Fit option: repeat the picture like tiles
settings-appearance-wallpaper-tile = Tile
settings-appearance-wallpaper-span = Span displays
settings-appearance-wallpaper-battery = Play videos on battery
settings-appearance-wallpaper-battery-description = Otherwise video wallpapers pause until you plug in

## Appearance: app icons

settings-appearance-icons = App icons
settings-appearance-icons-original = Original
settings-appearance-icons-tinted = Tinted
settings-appearance-icons-clear = Clear
settings-appearance-tint = Tint
settings-appearance-tint-description = The first color follows your accent color
settings-appearance-tint-blue = Blue
settings-appearance-tint-teal = Teal
settings-appearance-tint-green = Green
settings-appearance-tint-yellow = Yellow
settings-appearance-tint-orange = Orange
settings-appearance-tint-red = Red
settings-appearance-tint-pink = Pink
settings-appearance-tint-purple = Purple
settings-appearance-tint-slate = Slate

## Appearance: text and motion

settings-appearance-text-size = Text size

## Taskbar

# Screen-reader label of the taskbar preview picture
settings-taskbar-preview = Taskbar preview
settings-start-section = Start
# How Start looks: the menu, or Gust, a search bar
settings-start-style = Style
settings-start-style-menu = Menu
# Gust is the name of Start's search bar style, keep it as is
settings-start-style-palette = Gust
settings-start-style-menu-description = Search, apps and folders next to the taskbar
settings-start-style-palette-description = A search bar in the middle of the screen for apps, windows, files and answers
settings-start-button = Show the Start button
settings-start-button-description = Super opens Start either way
# Followed by a list of search engines
settings-start-web = Search the web with
settings-taskbar-shown = Show the taskbar
settings-taskbar-hidden = Hidden
settings-taskbar-hidden-description = The clock and status icons stay in a corner, and Super opens Start
# How the taskbar background looks
settings-taskbar-look = Look
# Caption above one-click arrangements of the taskbar's parts.
settings-taskbar-presets = Layouts
# Start and the apps at the left of a bar along the bottom, status and clock at the right.
settings-taskbar-preset-classic = Classic
settings-taskbar-preset-centered = Centered dock
# Apps in a dock at the bottom, the status icons and clock at the top right, as on a Mac.
settings-taskbar-preset-mac = macOS-like
settings-taskbar-preset-side = Side dock
# Opens a mode on the desktop for moving the taskbar's parts around the screen.
settings-taskbar-edit = Edit on the desktop
settings-taskbar-edit-description = Drag the taskbar's islands and their parts to any edge of the screen
# Screen-reader label of a group of taskbar parts in the preview. $parts lists them, such as "Start, Apps".
settings-taskbar-island = Island with { $parts }
settings-taskbar-island-move = Drag to move this island
settings-taskbar-element-start = Start
# The part of the taskbar with pinned and running apps.
settings-taskbar-element-dock = Apps
# The part of the taskbar with icons of apps running in the background.
settings-taskbar-element-tray = Tray
settings-taskbar-element-status = Network, sound and battery
settings-taskbar-element-clock = Clock and notifications
settings-taskbar-look-glass = Glass
settings-taskbar-look-solid = Solid
settings-taskbar-look-transparent = Transparent
settings-taskbar-look-accent = Accent
settings-taskbar-shape = Shape
settings-taskbar-shape-bar = Edge to edge
settings-taskbar-shape-floating = Floating
settings-taskbar-shape-separate = Separate
settings-taskbar-size = Size
settings-taskbar-size-small = Small
settings-taskbar-size-medium = Medium
settings-taskbar-size-large = Large
settings-taskbar-auto-hide = Hide automatically
settings-taskbar-hide-never = Never
settings-taskbar-hide-always = Always
settings-taskbar-hide-windows = When a window touches it
settings-taskbar-more = More options
settings-taskbar-show-pinned = Show pinned apps
settings-taskbar-per-workspace = Only list windows on the current workspace
settings-taskbar-every-display = Show on every display
settings-taskbar-per-display = Only list windows on the same display

## Fonts

settings-fonts = Fonts
# The font used for the interface
settings-fonts-interface = Interface
settings-fonts-interface-description = Menus, buttons and text across the desktop and apps
settings-fonts-interface-label = Interface font
settings-fonts-monospace = Monospace
settings-fonts-monospace-description = Terminals, code and anything that lines up in columns
settings-fonts-monospace-label = Monospace font
settings-fonts-all = All fonts
settings-fonts-all-description = Preview the fonts on this computer, use one or remove ones you added
# Back button to the Appearance page
settings-fonts-search = Search fonts
settings-fonts-no-match = No font is called that
# Shown next to the font the system uses by default
settings-fonts-default = Default
# A sentence that shows off each font. Pick a short pangram (a sentence that uses every letter) in your language.
settings-fonts-sample = The quick brown fox jumps over the lazy dog
# Tooltip; $family is a font name
settings-fonts-open = Open { $family }
settings-fonts-styles = { $count ->
    [one] { $count } style
   *[other] { $count } styles
}
# Screen-reader label of a font's menu button; $family is a font name
settings-fonts-more-for = More for { $family }
# Tooltip of a font's menu button
settings-fonts-more = More
settings-fonts-use-interface = Use as system font
settings-fonts-use-monospace = Use as monospace font
# Menu item, verb
settings-fonts-remove = Remove

## Cursors

settings-cursors = Cursor
# Title of the window that lists every installed cursor theme
settings-cursors-all = All cursors
settings-cursors-size = Size
settings-cursors-size-label = Cursor size
settings-cursors-size-default = Default
settings-cursors-size-medium = Medium
settings-cursors-size-large = Large
settings-cursors-size-larger = Larger
settings-cursors-size-largest = Largest
settings-cursors-get-more = Get more cursors
settings-cursors-get-more-description = Browse themes shared on GNOME-Look
settings-cursors-folder = Cursors folder
settings-cursors-folder-description = Themes you put in Home › .local › share › icons show up here
# Dialog title; $theme is a cursor theme name
settings-cursors-remove-title = Remove { $theme }?
settings-cursors-remove-description = The theme is deleted from your icons folder.
settings-cursors-cancel = Cancel
# Button and tooltip, verb
settings-cursors-remove = Remove
# Screen-reader label; $theme is a cursor theme name
settings-cursors-remove-theme = Remove { $theme }
settings-cursors-store = Get cursors
# Back button to the Appearance page
settings-cursors-search = Search cursors
# Label of the sort order choice
settings-cursors-order = Order
settings-cursors-order-popular = Popular
settings-cursors-order-rating = Top rated
settings-cursors-order-newest = New
settings-cursors-load-failed = Cursors can’t be loaded
settings-cursors-try-again = Try again
settings-cursors-no-match = Nothing matches “{ $query }”
settings-cursors-empty = No cursors here yet
settings-cursors-no-match-description = Try a shorter search or another word
settings-cursors-store-description = Themes shared by the GNOME-Look community
settings-cursors-previous = Previous
settings-cursors-next = Next
settings-cursors-page = Page { $page } of { $pages }
# $downloads is $count already shortened, like 1.2K
settings-cursors-downloads = { $count ->
    [one] { $downloads } download
   *[other] { $downloads } downloads
}
# Screen-reader label of the progress bar; $name is a cursor theme name
settings-cursors-installing = Installing { $name }
settings-cursors-in-use = In use
# Button, verb: switch to this installed theme
settings-cursors-use = Use
# Button, verb: download and install this theme
settings-cursors-get = Get
settings-cursors-choose-download = Choose a download for { $name }
settings-cursors-view-online = View online

## Window tiling

settings-tiling-mode = Arrange windows
settings-tiling-mode-off = Off
settings-tiling-mode-tiling = Tiling
settings-tiling-mode-scrolling = Scrolling
settings-tiling-mode-off-description = Windows float where you put them and snap to edges and corners
settings-tiling-mode-tiling-description = New windows share the screen with the others, so nothing overlaps
settings-tiling-mode-scrolling-description = Each window opens as a column on a strip that scrolls sideways
settings-tiling-layout = Layout
settings-tiling-layout-dwindle = Spiral
settings-tiling-layout-master = Main and stack
settings-tiling-gaps = Gaps
settings-tiling-gaps-none = None
settings-tiling-gaps-small = Small
settings-tiling-gaps-medium = Medium
settings-tiling-gaps-large = Large
settings-tiling-new-windows = New windows open
settings-tiling-new-beside = Next to the focused window
settings-tiling-new-at-end = At the end
settings-tiling-shortcuts = Tiling shortcuts
settings-tiling-shortcuts-description = Focus, move and resize tiled windows from the keyboard
settings-board = Board
settings-board-description = Press Super twice or swipe up with four fingers to lay out a workspace's windows side by side
settings-see-through = See-through windows
settings-see-through-description = Let the desktop show through these apps’ windows.
settings-see-through-app = See-through { $app }
settings-see-through-add = Add an app
settings-see-through-add-title = Make an app see-through
settings-see-through-shows = Show through
settings-see-through-shows-everything = Everything behind
settings-see-through-shows-wallpaper = Only the wallpaper
settings-see-through-amount = How see-through
settings-see-through-blur = Blur what's behind
settings-see-through-text = Keep text solid
settings-see-through-text-description = Only the window's background turns see-through

## Accessibility

settings-accessibility-seeing = Seeing
settings-accessibility-screen-reader = Screen reader
settings-accessibility-zoom = Zoom
settings-accessibility-zoom-level = Zoom level
# Magnification factor, like 2×
settings-accessibility-zoom-factor = { NUMBER($factor, maximumFractionDigits: 2) }×
settings-accessibility-large-text = Large text
settings-accessibility-high-contrast = High contrast
settings-accessibility-motion = Motion
settings-accessibility-motion-description = Reduced fades instead of sliding and zooming. Off makes windows and menus appear instantly
settings-accessibility-motion-full = Full
settings-accessibility-motion-reduced = Reduced
settings-accessibility-motion-off = Off
settings-accessibility-cursor-size = Cursor size
settings-accessibility-typing = Typing
settings-accessibility-osk = On-screen keyboard
settings-accessibility-typing-assist = Typing assist
# How many typing assists are on
settings-accessibility-typing-assist-count = { $count ->
    [0] Off
    [one] { $count } on
   *[other] { $count } on
}
settings-accessibility-sticky-keys = Sticky keys
settings-accessibility-slow-keys = Slow keys
settings-accessibility-slow-keys-delay = Slow keys delay
settings-accessibility-bounce-keys = Bounce keys
settings-accessibility-bounce-keys-delay = Bounce keys delay
settings-accessibility-pointing = Pointing
settings-accessibility-mouse-keys = Mouse keys
settings-accessibility-dwell = Click by resting the pointer
# Followed by a duration slider
settings-accessibility-dwell-time = Rest for
settings-accessibility-hold = Hold to right-click
# Followed by a duration slider
settings-accessibility-hold-time = Hold for
# Ctrl is the key name; use the one printed on keyboards in your language
settings-accessibility-locate-pointer = Press Ctrl to find the pointer
settings-accessibility-hearing = Hearing
settings-accessibility-flash = Flash for alert sounds
# What flashes for alert sounds
settings-accessibility-flash-type = Flash
settings-accessibility-flash-window = Window
settings-accessibility-flash-screen = Screen

## Extensions

settings-extensions-none = No extensions are installed
settings-extensions-unavailable = Extensions can't be shown while the desktop isn't running.
# Screen-reader label of the switch that turns an extension on; $name is the extension's name
settings-extensions-on = Turn on { $name }
# Title of the switch that turns an extension on, on its own page
settings-extensions-enabled = Turned on
settings-extensions-failed = Turned off because it stopped working
settings-extensions-crashed = Turned off because the desktop restarted twice while it ran
settings-extensions-invalid = Can't run on this version of Luft
# $version is the version of Luft the extension needs, such as "1.2"
settings-extensions-needs-newer-luft = Needs Luft { $version } or newer. It turns on by itself once Luft is updated.
settings-extensions-store-only = Only runs once schelf.store approved it to run inside Luft
settings-extensions-from-store = From schelf.store, approved to run inside Luft
settings-extensions-from-store-sandboxed = From schelf.store. It runs in a sandbox and can only do what's listed
settings-extensions-from-development = From a development folder, running inside this build of Luft
settings-extensions-from-own = From your own folder. It runs in a sandbox and can only do what's listed
settings-extensions-from-copy = A copy you installed from your own folder. Nobody reviewed it
settings-extensions-from-folder = From your own folder, approved to run inside Luft. Nobody reviewed it
settings-extensions-store-only-unreviewed = Only runs inside Luft, which needs Developer tools to be on
settings-extensions-unreviewed-copy = Not reviewed, runs inside Luft as a copy
settings-extensions-unreviewed-copy-sandboxed = Not reviewed, a copy that runs in a sandbox while Developer tools is off
settings-extensions-unreviewed-folder = Not reviewed, runs inside Luft from its folder
settings-extensions-unreviewed-folder-sandboxed = Not reviewed, runs in a sandbox while Developer tools is off
# $note says the extension wasn't reviewed and how it runs, $rest is its description or what's wrong with it
settings-extensions-unreviewed-summary = { $note } · { $rest }
settings-extensions-inside = Inside Luft
settings-extensions-inside-description = Developer tools is on, so you can run this extension inside Luft even though nobody reviewed it.
settings-extensions-copy = Install a copy
settings-extensions-copy-description = For an extension you trust. The copy keeps running as it is now
settings-extensions-folder = Run from its folder
settings-extensions-folder-description = For an extension you're making. Your changes run when you reload it
settings-extensions-copy-title = Install a copy of { $name }?
settings-extensions-folder-title = Run { $name } from its folder?
settings-extensions-unreviewed-warning = Nobody has reviewed { $name }. Inside Luft it can see everything you type, read what's on your screen and do anything you can do.
settings-extensions-copy-explained = Luft keeps a copy of it as it is now, where no program can change it.
settings-extensions-folder-explained = It runs from this folder, so your changes run each time you reload it:
settings-extensions-folder-only-yours = Any program that can change this folder can then run inside Luft too. Only do this for an extension you're making yourself.
settings-extensions-reload = Run your latest changes
settings-extensions-reload-description = Starts it again with what's in its folder now
settings-extensions-reload-action = Reload
settings-extensions-stop-inside = Stop running inside Luft
settings-extensions-stop-copy-description = Removes the copy. The extension in your own folder runs in its sandbox again
settings-extensions-stop-folder-description = It goes back to running in its sandbox
settings-extensions-stop = Stop
settings-extensions-forget = Take back the approval
settings-extensions-forget-description = It stays in its sandbox when Developer tools is on again
settings-extensions-forget-action = Take back
# $count is how many other copies of the extension there are
settings-extensions-ignored = { $count ->
    [one] A copy in your own folder is ignored
   *[other] Copies in your own folder are ignored
}
settings-extensions-problem = What went wrong
settings-extensions-settings = Settings
settings-extensions-permissions = What it can do
settings-extensions-permission-wallpaper = Draw over the wallpaper
settings-extensions-permission-quick-settings = Add tiles to quick settings
settings-extensions-permission-taskbar = Add buttons to the taskbar
settings-extensions-permission-search = Add results to search
settings-extensions-permission-notifications = Send notifications
settings-extensions-permission-weather = See the weather where you are
settings-extensions-permission-location = See roughly where you are
settings-extensions-permission-media = See and control what's playing
settings-extensions-permission-popups = Show panels and small windows
settings-extensions-permission-typing = Type into other apps
settings-extensions-permission-sounds = Play sounds
settings-extensions-permission-audio-levels = Follow the beat of what's playing
settings-extensions-permission-calls = Know when you're in a call
settings-extensions-permission-locked-sounds = Keep playing sounds while the screen is locked
settings-extensions-permission-input-sounds = Play a sound when you type and click, without seeing your keys
settings-extensions-permission-do-not-disturb = Hold back notifications for a while
settings-extensions-permission-screen-effects = Draw over and change how your windows and the whole screen look
settings-extensions-permission-clipboard = Copy to your clipboard
settings-extensions-permission-file-actions = Add to the menu of files and folders in Rover
# $hosts lists the web addresses the extension connects to, such as "app.pult.sh"
settings-extensions-permission-network = Connect to { $hosts }
# $ports lists port numbers, such as "53317"; $count is how many there are
settings-extensions-permission-listen = { $count ->
    [one] Take connections from devices on your network, on port { $ports }
   *[other] Take connections from devices on your network, on ports { $ports }
}
settings-extensions-remove = Remove
# $version is the extension's version
settings-extensions-installed = Version { $version }
# $name is the extension's name
settings-extensions-remove-title = Remove { $name }?
settings-extensions-remove-description = It's removed for good, along with its settings.
settings-extensions-custom-color = Custom
settings-extensions-place = Place on the taskbar
settings-extensions-place-islands = With separate islands, you move it yourself while editing the taskbar
settings-extensions-place-edit = Edit taskbar
settings-extensions-place-before-apps = Left of the apps
settings-extensions-place-after-apps = Right of the apps
settings-extensions-place-beside-tray = Next to the tray
settings-extensions-place-start = At the start of the taskbar
settings-extensions-place-end = At the end of the taskbar
# Shown when the element sits somewhere else, where it was put while editing the taskbar.
settings-extensions-place-elsewhere = Elsewhere
