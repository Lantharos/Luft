## Appearance: style

settings-appearance-style = Style
# Row title for choosing between the light and dark style
settings-appearance-style-title = Appearance
settings-appearance-style-description = Apps that follow the system switch with it
settings-appearance-style-light = Light
settings-appearance-style-dark = Dark
settings-appearance-schedule = Switch to dark automatically
# Choice for the dark style schedule: never switch automatically
settings-appearance-schedule-off = Off
settings-appearance-schedule-sunset = Sunset to sunrise
settings-appearance-schedule-custom = Custom
settings-appearance-schedule-sunset-description = Follows sunset and sunrise where you are
settings-appearance-schedule-custom-description = Picking a style lasts until the next switch
# Followed by a time picker
settings-appearance-dark-from = Dark from
# Followed by a time picker
settings-appearance-light-from = Light from
settings-appearance-pure-black = Pure black
settings-appearance-pure-black-description = Fully black dark backgrounds, which save power on OLED
settings-appearance-accent = Accent color
# Accent color taken from the wallpaper
settings-appearance-accent-wallpaper = Wallpaper
settings-appearance-accent-white = White
settings-appearance-accent-white-description = White in the dark style, black in the light style
settings-appearance-accent-wallpaper-description = Picked from your wallpaper
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

settings-appearance-taskbar = Taskbar
settings-appearance-text-and-motion = Text and motion
settings-appearance-text-size = Text size
settings-appearance-text-size-description = Makes text larger or smaller across apps
settings-appearance-animations = Animations
settings-appearance-animations-description = Windows and menus move instead of appearing instantly

## Taskbar

settings-taskbar-title = Taskbar
# Back button to the Appearance page
settings-taskbar-back = Appearance
# Screen-reader label of the taskbar preview picture
settings-taskbar-preview = Taskbar preview
settings-taskbar-alignment = Alignment
settings-taskbar-align-center = Center
settings-taskbar-align-left = Left
# How the taskbar background looks
settings-taskbar-look = Look
settings-taskbar-look-glass = Glass
settings-taskbar-look-solid = Solid
settings-taskbar-look-transparent = Transparent
settings-taskbar-look-accent = Accent
settings-taskbar-shape = Shape
settings-taskbar-shape-bar = Edge to edge
settings-taskbar-shape-floating = Floating
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
settings-fonts-back = Appearance
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
settings-cursors-back = Appearance
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

## Notifications

settings-notifications-dnd = Do not disturb
settings-notifications-dnd-description = Banners and sounds stay off, except for apps you allow
settings-notifications-lock-screen = Lock screen
settings-notifications-show-lock-screen = Show notifications on the lock screen
settings-notifications-content = Show message content
settings-notifications-content-description = When off, only the app name is shown
settings-notifications-content-lock-screen = Show message content on the lock screen
settings-notifications-apps = App notifications
settings-notifications-apps-description = Choose how each app notifies you
# Back button to the Notifications page
settings-notifications-back = Notifications
settings-notifications-search = Search apps
settings-notifications-no-match = No apps match your search
# Screen-reader label of a switch; $app is an app name
settings-notifications-from = Notifications from { $app }
# Summary under an app's name: how its notifications show up
settings-notifications-summary-both = Banners and lock screen
settings-notifications-summary-banners = Banners
settings-notifications-summary-lock-screen = Lock screen
settings-notifications-summary-list = Notification list only
settings-notifications-allow = Allow notifications
settings-notifications-banners = Banners
settings-notifications-banners-description = Pop up on screen when they arrive
settings-notifications-sound = Play a sound
settings-notifications-dnd-allow = Allow during Do Not Disturb
settings-notifications-dnd-allow-description = Urgent means alarms and calls
settings-notifications-dnd-never = Never
settings-notifications-dnd-urgent = Urgent only
settings-notifications-dnd-always = Always
settings-notifications-keep = Keep in the notification list
settings-notifications-keep-description = Otherwise they go once their banner closes
settings-notifications-app-lock-screen = Show on the lock screen
settings-notifications-done = Done

## Accessibility

settings-accessibility-seeing = Seeing
settings-accessibility-screen-reader = Screen reader
settings-accessibility-zoom = Zoom
settings-accessibility-zoom-level = Zoom level
# Magnification factor, like 2×
settings-accessibility-zoom-factor = { NUMBER($factor, maximumFractionDigits: 2) }×
settings-accessibility-large-text = Large text
settings-accessibility-high-contrast = High contrast
settings-accessibility-reduce-motion = Reduce motion
settings-accessibility-reduce-motion-description = Fade instead of sliding and zooming
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
