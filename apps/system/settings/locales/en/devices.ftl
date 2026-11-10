## Displays

settings-display-mirror = Mirror displays
settings-display-mirror-description = Shows the same picture on every display
# Section title when every display shows the same picture
settings-display-mirrored = Mirrored displays
# Row and picker for choosing which display the settings below apply to
settings-display-display = Display
settings-display-apply-failed = These settings didn't work. Try a different setup.
# Button: undo the changes that haven't been applied yet
settings-display-reset = Reset
# Button: apply the changed display settings
settings-display-apply = Apply
# Screen-reader label of the main display in the arrangement picture. $name is the display's name.
settings-display-arrangement-main = { $name }, main display
settings-display-use = Use this display
settings-display-main = Main display
settings-display-main-description = The taskbar and new windows show up here
settings-display-resolution-title = Resolution
# A screen resolution, width by height in pixels
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Refresh rate
# $rate is in hertz, for example 59.95 or 144
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-touch-taskbar = Touch taskbar
settings-display-touch-taskbar-description = Shows a taskbar sized for fingers and pens on this screen
settings-display-variable-refresh = Variable refresh rate
settings-display-variable-refresh-description = Lets the display follow the frame rate of fullscreen games for smoother motion
settings-display-variable-refresh-off = Off
settings-display-variable-refresh-games = In games
settings-display-variable-refresh-fullscreen = In all fullscreen apps
settings-display-scale = Scale
settings-display-scale-description = Makes text, apps, and everything else bigger or smaller
settings-display-orientation = Orientation
settings-display-orientation-landscape = Landscape
settings-display-orientation-portrait-right = Portrait right
settings-display-orientation-portrait-left = Portrait left
settings-display-orientation-landscape-flipped = Landscape, flipped

## Display brightness

settings-display-brightness = Brightness
# Slider label. $name is the display's name.
settings-display-brightness-label = { $name } brightness
# Shown under a display whose brightness can't be read
settings-display-brightness-unsupported = To change it here, turn on the setting called DDC/CI in the display’s own menu
settings-display-brightness-unresponsive = Not responding right now, trying again shortly
# Row title when several external displays still need setting up
settings-display-brightness-external = External displays
# "their" refers to the external displays. ddcutil is the name of a program.
settings-display-brightness-missing-tool = Install ddcutil to change their brightness here
settings-display-brightness-needs-restart = Restart to finish setting up their brightness
settings-display-brightness-no-access = Sign out and back in to change their brightness here

## Night light

settings-display-night-light = Night light
settings-display-night-light-description = Warmer colors in the evening, easier on your eyes
settings-display-night-light-schedule = Schedule
settings-display-night-light-automatic = Sunset to sunrise
settings-display-night-light-custom = Custom
# Time of day when night light turns on
settings-display-night-light-from = Turns on
# Time of day when night light turns off
settings-display-night-light-to = Turns off
settings-display-night-light-warmth = Warmth

## Sound

settings-sound-output = Output
settings-sound-input = Input
settings-sound-device = Device
settings-sound-output-device = Output device
settings-sound-input-device = Input device
# The port a sound device uses, such as speakers or headphones
settings-sound-connection = Connection
settings-sound-output-connection = Output connection
settings-sound-input-connection = Input connection
# A jack the computer doesn't sense anything plugged into; people can still pick it
settings-sound-connection-undetected = { $name } (nothing detected)
settings-sound-volume = Volume
# Button label. $name is what the volume belongs to, such as "Volume" or an app's name.
settings-sound-mute = Mute { $name }
# Button label. $name is what the volume belongs to, such as "Volume" or an app's name.
settings-sound-unmute = Unmute { $name }
settings-sound-balance = Balance
# Balance between the left and right speaker
settings-sound-balance-center = Center
# $share is a percentage, already formatted, such as "20%"
settings-sound-balance-left = { $share } left
# $share is a percentage, already formatted, such as "20%"
settings-sound-balance-right = { $share } right
settings-sound-louder = Allow louder than 100%
settings-sound-louder-description = Sound can distort at higher volumes
settings-sound-input-level = Input level
settings-sound-apps = App volumes
settings-sound-apps-playing = { $count ->
    [one] { $count } app is playing sound
   *[other] { $count } apps are playing sound
}
# Picker label. $app is the app's name.
settings-sound-app-output = Play { $app } on
settings-sound-profiles = Device profiles
settings-sound-profiles-row-description = Choose how each sound device is used
settings-sound-profiles-description = How each sound device is used, such as stereo or surround
# Picker label. $device is the sound card's name.
settings-sound-profile-label = How { $device } is used
# Shown when a sound device is turned off
settings-sound-profile-off = Off

## System sounds

settings-sound-system = System sounds
settings-sound-system-description = Sounds for notifications, devices and other events
settings-sound-system-volume = System sounds volume
# .preview is the label of a button that plays the sound
settings-sound-kind-notifications = Notifications
    .description = Quiet during Do Not Disturb, games and screen sharing
    .preview = Play the notification sound
settings-sound-kind-devices = Devices and charging
    .description = Connecting a device or charger, and low battery
    .preview = Play the device sound
settings-sound-kind-volume = Volume feedback
    .description = A tick when you change the volume
    .preview = Play the volume tick
settings-sound-kind-screenshots = Screenshots
    .description = A shutter when a screenshot is saved
    .preview = Play the shutter
settings-sound-kind-recording = Recording
    .description = When screen recording, the camera or dictation starts and stops
    .preview = Play the recording sound
settings-sound-kind-sign-in = Sign-in sound
    .description = When your desktop appears
    .preview = Play the sign-in sound
settings-sound-kind-keyboard = Keyboard taps
    .description = Each key on the on-screen keyboard
    .preview = Play a keyboard tap
settings-sound-custom = Your own sounds
settings-sound-custom-description = Use your own audio files for any sound
settings-sound-custom-count = { $count ->
    [one] { $count } sound replaced
   *[other] { $count } sounds replaced
}
settings-sound-kind-feedback = Everyday sounds
settings-sound-kind-alerts = Alerts
settings-sound-set = Sound set
settings-sound-set-folder = Use a folder of sounds
settings-sound-set-folder-description = Files named after a sound replace it, such as message-new-instant.ogg. Every other sound goes back to Luft's.
# Button that opens a folder picker
settings-sound-set-choose = Choose folder
settings-sound-set-used = { $count ->
    [one] Using { $count } sound from the folder.
   *[other] Using { $count } sounds from the folder.
}
# $files is a comma-separated list of file names
settings-sound-set-skipped = Couldn't use { $files }.
# Button that goes back to the sounds Luft comes with
settings-sound-reset-all = Reset all
# Shown below a sound's name when it plays the sound Luft comes with
settings-sound-default = Luft's sound
# Button that opens a file picker
settings-sound-choose = Choose
# Labels of the buttons on a sound's row. $sound is the sound's name, such as Notification.
settings-sound-choose-label = Choose a file for { $sound }
settings-sound-play = Play { $sound }
settings-sound-reset = Go back to Luft's sound for { $sound }
settings-sound-name-notification = Notification
settings-sound-name-quiet-notification = Quiet notification
settings-sound-name-new-mail = New mail
settings-sound-name-device-added = Device connected
settings-sound-name-device-removed = Device disconnected
settings-sound-name-charger = Charger plugged in
settings-sound-name-low-battery = Low battery
settings-sound-name-volume = Volume change
settings-sound-name-screenshot = Screenshot
settings-sound-name-sign-in = Sign-in
settings-sound-name-mail-sent = Mail sent
settings-sound-name-recording-started = Recording started
settings-sound-name-recording-stopped = Recording stopped
settings-sound-name-error = Error
settings-sound-name-warning = Warning
settings-sound-name-question = Question
settings-sound-name-key = Key
settings-sound-name-delete-key = Delete key
settings-sound-name-space-key = Space bar

## Power and battery

settings-power-battery = Battery
settings-power-charging = Charging
# $power is already formatted, such as "45 W"
settings-power-charging-at = Charging at { $power }
# $time is a duration, already formatted, such as "1 hour 5 minutes"
settings-power-charging-until-full = Charging, full in { $time }
# $power is already formatted, such as "45 W". $time is a duration, such as "1 hour 5 minutes".
settings-power-charging-at-until-full = Charging at { $power }, full in { $time }
settings-power-on-battery = On battery
# $power is already formatted, such as "8 W"
settings-power-on-battery-using = On battery, using { $power }
# $time is a duration, already formatted, such as "3 hours 20 minutes"
settings-power-time-left = About { $time } left
# $time is a duration, such as "3 hours 20 minutes". $power is already formatted, such as "8 W".
settings-power-time-left-using = About { $time } left, using { $power }
settings-power-full = Fully charged
settings-power-empty = Empty
settings-power-not-charging = Plugged in, not charging
settings-power-health = Battery health
# $full and $design are energy amounts, already formatted, such as "48.5 Wh"
settings-power-capacity = { $full } of { $design } when new
# $cycles is one number or a list of numbers (one per battery), already formatted. $count is the last of them.
settings-power-cycles = { $count ->
    [one] { $cycles } charge cycle
   *[other] { $cycles } charge cycles
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Show percentage
settings-power-show-percentage-description = Shows the battery level inside the battery icon

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = less than a minute
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minute
   *[other] { $minutes } minutes
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } hour
   *[other] { $hours } hours
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } hour
   *[other] { $hours } hours
} { $minutes ->
    [one] { $minutes } minute
   *[other] { $minutes } minutes
}
# Picker option: never turn off or sleep
settings-power-never = Never

## Charge limit

settings-power-limit = Limit charging
settings-power-limit-failed = The limit couldn't be changed. Try again.
settings-power-limit-elsewhere-off = Another app turned it off, so the battery charges fully
# $level is a percentage, already formatted, such as "80%"
settings-power-limit-elsewhere-changed = Another app changed the limit to { $level }
# $level is a percentage, already formatted, such as "80%"
settings-power-limit-elsewhere-on = Another app stops charging at { $level }
settings-power-limit-automatic = Your computer decides when to stop charging
# $level is a percentage, already formatted, such as "80%"
settings-power-limit-stops-at = Stops charging at { $level }
settings-power-limit-description = Stops charging early to help the battery last longer
# $level is a percentage, already formatted, such as "80%"
settings-power-limit-description-at = Stops at { $level } to help the battery last longer
# $level is a percentage, already formatted, such as "80%"
settings-power-limit-applied = Charging stops at { $level }
settings-power-limit-applied-description = Set by another app on this computer

## Battery-powered devices

settings-power-devices = Devices
settings-power-device-mouse = Mouse
settings-power-device-keyboard = Keyboard
settings-power-device-headphones = Headphones
settings-power-device-speaker = Speaker
# A game controller
settings-power-device-controller = Controller
settings-power-device-phone = Phone
settings-power-device-tablet = Tablet
settings-power-device-pen = Pen
settings-power-device-touchpad = Touchpad
settings-power-device-other = Device

## Power mode

settings-power-mode = Power mode
settings-power-mode-row = Mode
settings-power-profile-saver = Power saver
    .description = Slower, and uses less power
settings-power-profile-balanced = Balanced
    .description = Standard performance and power use
settings-power-profile-performance = Performance
    .description = Faster, and uses more power
settings-power-limited = Performance is limited right now
settings-power-limited-lap = Performance is limited because the computer is on your lap
settings-power-limited-hot = Performance is limited because the computer is too hot
settings-power-limited-lap-hot = Performance is limited because the computer is on your lap and too hot
settings-power-saver-low-battery = Power saver on low battery
settings-power-saver-low-battery-description = Switches to power saver when the battery runs low
settings-power-saver-level = Battery level for power saver

## Keyboard backlight

settings-power-keyboard = Keyboard
settings-power-backlight = Keyboard backlight
settings-power-backlight-off = Off
settings-power-backlight-low = Low
settings-power-backlight-medium = Medium
settings-power-backlight-high = High

## Screen and sleep

settings-power-screen = Screen
settings-power-screen-off = Turn off the screen after
settings-power-screen-off-description = When you haven't used the computer for a while
settings-power-dim = Dim when inactive
settings-power-dim-description = Lowers the brightness shortly before the screen turns off
settings-power-sleep = Sleep
settings-power-suspend-plugged-in = Sleep when plugged in
# Shown on computers without a battery
settings-power-suspend-inactive = Sleep when inactive
settings-power-suspend-description = Puts the computer to sleep after a while without use
settings-power-suspend-battery = Sleep on battery
settings-power-button = Power button
# What pressing the power button does
settings-power-button-suspend = Sleep
settings-power-button-hibernate = Hibernate
settings-power-button-ask = Ask what to do
settings-power-button-nothing = Do nothing
settings-power-long-sleep = Shut down after a long sleep
settings-power-long-sleep-description = After this long asleep on battery, the computer shuts down and open windows aren’t kept. It always shuts down before the battery runs flat.
settings-power-long-sleep-failed = This couldn't be changed. Try again.
settings-power-long-sleep-after = Shut down after
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } hour
   *[other] { $hours } hours
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } day
   *[other] { $days } days
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } week
   *[other] { $weeks } weeks
}

## Keyboard

settings-keyboard-sources = Input sources
settings-keyboard-sources-description = The first one is used by default. Switch between them while you type.
# Button label. Keys is the name of an app.
settings-keyboard-source-edit = Edit in Keys
settings-keyboard-source-up = Move up
settings-keyboard-source-down = Move down
settings-keyboard-source-remove = Remove
settings-keyboard-add-source-button = Add input source
settings-keyboard-own = Your own layouts and input methods
settings-keyboard-own-layout = Make a layout
settings-keyboard-own-layout-description = Start from a layout and change what its keys type
settings-keyboard-own-method = Make an input method
settings-keyboard-own-method-description = Turn what you type into accents, other scripts or words to choose from
# Keys is the name of an app
settings-keyboard-own-open = Open Keys
settings-keyboard-own-open-description = Edit the layouts and input methods you've made
settings-keyboard-switch-source = Switch input source
settings-keyboard-add-source = Add an input source
settings-keyboard-add-source-description = Pick the keyboard layout or input method you want to type with.
settings-keyboard-add-source-search = Search languages, layouts and input methods
# Tag next to an input source that is an input method rather than a layout
settings-keyboard-input-method = Input method
settings-keyboard-add-source-no-match = Nothing matches “{ $query }”
settings-keyboard-cancel = Cancel
# Button: add the chosen input source
settings-keyboard-add = Add
settings-keyboard-typing = Typing
settings-keyboard-repeat = Repeat keys
settings-keyboard-repeat-description = Holding a key down types it again and again
settings-keyboard-repeat-delay = Delay before repeating
settings-keyboard-repeat-delay-shorter = Shorter
settings-keyboard-repeat-delay-longer = Longer
settings-keyboard-repeat-speed = Repeat speed
settings-keyboard-repeat-speed-slower = Slower
settings-keyboard-repeat-speed-faster = Faster
settings-keyboard-caps-lock = Caps Lock key
settings-keyboard-caps-lock-description = What happens when you press it
# What the Caps Lock key does: acts as the Escape key
settings-keyboard-caps-lock-escape = Escape
settings-keyboard-caps-lock-swap-escape = Swap with Escape
settings-keyboard-caps-lock-nothing = Nothing
# Shown when Caps Lock was set up some other way
settings-keyboard-caps-lock-custom = Custom
settings-keyboard-lock-notices = Show Caps Lock and Num Lock
settings-keyboard-lock-notices-description = Briefly shows on screen when either turns on or off
# Whether dictation is turned on
settings-keyboard-dictation-on = On
settings-keyboard-dictation-off = Off
settings-keyboard-shortcuts-description = See and change shortcuts, or add your own

## Copilot key

settings-keyboard-copilot = Copilot key
# What a quick press does (noun)
settings-keyboard-copilot-press = Press
settings-keyboard-copilot-press-description = What a quick press of the key does
settings-keyboard-copilot-open-start = Open Start
settings-keyboard-copilot-open-app = Open an app
settings-keyboard-copilot-nothing = Nothing
settings-keyboard-copilot-app = App
settings-keyboard-copilot-no-app = No app chosen yet
# Button: pick a different app
settings-keyboard-copilot-change = Change
# Button: pick an app
settings-keyboard-copilot-choose = Choose
settings-keyboard-copilot-hold = Hold to dictate
settings-keyboard-copilot-hold-description = Hold the key and talk to type what you say
settings-keyboard-copilot-hold-off = Works once dictation is on
settings-keyboard-copilot-choose-app = Choose an app
settings-keyboard-copilot-choose-app-description = Pressing the Copilot key opens it.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Shift
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Print Screen
settings-keys-page-up = Page Up
settings-keys-page-down = Page Down
settings-keys-home = Home
settings-keys-end = End
settings-keys-insert = Insert
settings-keys-delete = Delete
settings-keys-tab = Tab
settings-keys-space = Space
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
# The Pause key on a keyboard
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
# The context menu key
settings-keys-menu = Menu
# A key on the number pad. $key is the key's own name, such as "5" or "Enter".
settings-keys-keypad = Keypad { $key }
settings-keys-volume-up = Volume Up
settings-keys-volume-down = Volume Down
settings-keys-mute = Mute
settings-keys-microphone-mute = Microphone Mute
settings-keys-play = Play
# The media key that pauses playback
settings-keys-media-pause = Pause
settings-keys-stop = Stop
settings-keys-next-track = Next Track
settings-keys-previous-track = Previous Track
settings-keys-brightness-up = Brightness Up
settings-keys-brightness-down = Brightness Down
settings-keys-browser = Browser
settings-keys-home-page = Home Page
settings-keys-search = Search
settings-keys-mail = Mail
settings-keys-calculator = Calculator
settings-keys-files = Files
settings-keys-eject = Eject
settings-keys-power = Power
# The key that locks the screen
settings-keys-lock = Lock

## Keyboard shortcuts

settings-shortcuts-title = Keyboard shortcuts
settings-shortcuts-search = Search shortcuts
settings-shortcuts-category-system = System
settings-shortcuts-category-windows = Windows
settings-shortcuts-category-tiling = Tiling
settings-shortcuts-category-workspaces = Workspaces
settings-shortcuts-category-screenshots = Screenshots
settings-shortcuts-category-media = Media
settings-shortcuts-reset = Reset to default
settings-shortcuts-apps = App shortcuts
settings-shortcuts-apps-description = Ones apps asked for, which work even when the app isn’t in front
settings-shortcuts-extensions = Extensions
settings-shortcuts-no-match = No shortcuts match “{ $query }”
# Button label for screen readers. $name is the shortcut's name.
settings-shortcuts-change = Change shortcut for { $name }
# Placed between two shortcuts that do the same thing
settings-shortcuts-or = or
settings-shortcuts-not-set = Not set
settings-shortcuts-press-keys = Press the keys you want
settings-shortcuts-needs-modifier = Add Ctrl, Alt, or Super so the shortcut doesn’t get in the way of typing.
settings-shortcuts-record-description = Press the new shortcut. Backspace turns it off, Escape cancels.
# $name is the name of the shortcut that already uses these keys
settings-shortcuts-record-taken = This shortcut is already used for “{ $name }”. Replacing it turns it off there.
settings-shortcuts-try-another = Try another
settings-shortcuts-replace = Replace
settings-shortcuts-cancel = Cancel
settings-shortcuts-custom = Custom shortcuts
settings-shortcuts-custom-description = Run a command or open an app with a key combination
# Name shown for a custom shortcut that has no name yet
settings-shortcuts-untitled = Untitled
# Dialog title and button label
settings-shortcuts-add = Add shortcut
settings-shortcuts-edit = Edit shortcut
settings-shortcuts-custom-name = Name
# The command the shortcut runs
settings-shortcuts-custom-command = Command
settings-shortcuts-custom-shortcut = Shortcut
# $name is the name of the shortcut that already uses these keys
settings-shortcuts-custom-taken = Already used for “{ $name }”. Saving turns it off there.
settings-shortcuts-remove = Remove
settings-shortcuts-save = Save
# Button: add the new custom shortcut
settings-shortcuts-add-button = Add

## Dictation

settings-dictation-title = Dictation
# $keys is one or more shortcuts or keys, already joined, such as "Super+Alt or the Copilot key"
settings-dictation-not-installed = Dictation isn’t installed on this computer
# $keys is one or more shortcuts or keys, already joined, such as "Super+Alt or the Copilot key"
settings-dictation-hold = Hold { $keys } to dictate
settings-dictation-needs-shortcut = Off until it has a shortcut
# Used inside "Hold { $keys } to dictate"
settings-dictation-copilot-key = the Copilot key
settings-dictation-shortcut = Shortcut
settings-dictation-shortcut-description = Hold it to talk, or press it to listen until you press it again or stop talking
settings-dictation-shortcut-own = My own shortcut
settings-dictation-shortcut-another = Another shortcut…
settings-dictation-shortcut-off = Off
settings-dictation-keys = Keys
# Button: record a different shortcut
settings-dictation-change = Change
settings-dictation-language = Language
settings-dictation-language-automatic = Automatic
# $language is the language picked automatically, such as "English"
settings-dictation-language-automatic-current = Automatic ({ $language })
settings-dictation-language-description = Automatic follows the keyboard layout you type with
# $language is a language name, such as "English"
settings-dictation-language-unavailable = { $language } isn’t available on this computer
settings-dictation-engine = Speech recognizer
settings-dictation-engine-automatic = Automatic
# $engine is a speech recognizer's name (Parakeet, Whisper). $language is a language name.
settings-dictation-engine-description = { $engine } recognizes { $language }
# $engine is a speech recognizer's name (Whisper). $language is a language name.
settings-dictation-engine-graphics-card = { $engine } recognizes { $language } on the graphics card
settings-dictation-models = Speech models
settings-dictation-models-description = Models are downloaded once and kept on this computer.
settings-dictation-credits = Credits
# $credit names who made the model. $licence is a licence name, such as "Apache 2.0".
settings-dictation-credit = { $credit }. Licensed under { $licence }.
settings-dictation-learn-more = Learn more

## Dictation models. Sizes are already formatted, such as "600 MB".

# $reason is the error, in the system's words
settings-dictation-model-failed = Couldn’t download: { $reason }
settings-dictation-model-downloading = { $received } of { $total }
settings-dictation-model-installed = { $size } on this computer
settings-dictation-model-partial = { $received } of { $total } downloaded
settings-dictation-model-size = { $size } to download
settings-dictation-model-retry = Try again
settings-dictation-model-cancel = Cancel
settings-dictation-model-resume = Resume
settings-dictation-model-download = Download
settings-dictation-model-remove = Remove

## Mouse and touchpad

settings-mouse-mouse = Mouse
settings-mouse-primary-button = Primary button
settings-mouse-primary-button-description = The button you click to select things
settings-mouse-primary-button-left = Left
settings-mouse-primary-button-right = Right
settings-mouse-speed = Pointer speed
settings-mouse-slower = Slower
settings-mouse-faster = Faster
settings-mouse-acceleration = Mouse acceleration
settings-mouse-acceleration-description = The pointer travels farther when you move the mouse quickly
settings-mouse-natural-scrolling = Natural scrolling
settings-mouse-natural-scrolling-description = Scrolling moves the content instead of the view
settings-mouse-touchpad = Touchpad
settings-mouse-touchpad-speed = Touchpad pointer speed
settings-mouse-touchpad-scroll-speed = Scrolling speed
settings-mouse-touchpad-scroll-speed-label = Touchpad scrolling speed
settings-mouse-touchpad-tap = Tap to click
settings-mouse-touchpad-tap-description = Tap the touchpad instead of pressing it down
settings-mouse-touchpad-natural-scrolling = Touchpad natural scrolling
settings-mouse-touchpad-natural-scrolling-description = Content moves in the same direction as your fingers
settings-mouse-touchpad-scroll-with = Scroll with
settings-mouse-touchpad-two-fingers = Two fingers
# Scrolling by sliding a finger along the touchpad's edge
settings-mouse-touchpad-scroll-edge = Edge
settings-mouse-touchpad-secondary-click = Secondary click
settings-mouse-touchpad-secondary-click-description = How to right-click without a separate button
# Right-clicking by pressing the touchpad's bottom right corner
settings-mouse-touchpad-click-corner = Corner
settings-mouse-touchpad-disable-typing = Disable while typing
settings-mouse-touchpad-disable-typing-description = So the pointer doesn’t jump while you type

## Pen

settings-pen-hand = Writing hand
settings-pen-hand-description = Touches from the side of your hand resting on the screen are ignored for a moment after you lift the pen
settings-pen-hand-left = Left
settings-pen-hand-right = Right
settings-pen-tip-feel = Tip feel
settings-pen-tip-feel-description = How hard you need to press for a full stroke
settings-pen-eraser-feel = Eraser feel
settings-pen-feel-soft = Soft
settings-pen-feel-firm = Firm
settings-pen-buttons = Buttons
settings-pen-upper-button = Upper side button
settings-pen-upper-button-description = The side button farther from the tip
settings-pen-lower-button = Lower side button
settings-pen-lower-button-description = The side button closest to the tip
settings-pen-eraser = Eraser
settings-pen-eraser-description = The pen’s other end, or its eraser button
settings-pen-eraser-erases = Erases
settings-pen-action-description = What happens while you hold it down
settings-pen-action-right = Right click
settings-pen-action-middle = Middle click
settings-pen-action-eraser = Erase
settings-pen-action-screenshot = Take a screenshot
settings-pen-action-notes = Open Heft
settings-pen-action-start = Open Start
settings-pen-action-back = Back
settings-pen-action-forward = Forward
settings-pen-action-switch-monitor = Switch display
settings-pen-action-keys = Press keys
settings-pen-action-nothing = Nothing
settings-pen-action-keys-unset = Keys not chosen
settings-pen-keys-description = Press the keys the button should press. Escape goes back.
settings-pen-back = Back
settings-pen-cancel = Cancel
settings-pen-battery = Battery
settings-pen-battery-pen = Pen
settings-pen-battery-charging = Charging
settings-pen-tablets = Drawing tablets
settings-pen-tablet-description = The display the tablet draws on
settings-pen-tablet-all-displays = All displays
settings-pen-tablet-proportions = Keep proportions
settings-pen-tablet-proportions-description = Leaves part of the tablet unused so circles stay round on the display
# $name is the drawing tablet's name
settings-pen-tablet-choose = { $name }
settings-pen-tablet-choose-description = Choose the display this tablet draws on

## Printers

settings-printers-none = No printers yet
settings-printers-none-description = Printers on your network and printers plugged in by USB show up here by themselves
settings-printers-add = Add a printer
settings-printers-add-description = Choose one that didn't show up by itself, or type its address
settings-printers-available = On this network
settings-printers-available-description = This network isn’t marked as home, so printers on it are only added when you choose to
settings-printers-default = Default
# $count is the number of documents waiting to print
settings-printers-waiting = { $count ->
    [one] 1 document waiting
   *[other] { $count } documents waiting
}

settings-printers-status = Status
settings-printers-status-ready = Ready
settings-printers-status-printing = Printing
settings-printers-status-paused = Paused
settings-printers-status-offline = Not connected
settings-printers-status-no-paper = Out of paper
settings-printers-status-low-paper = Low on paper
settings-printers-status-jam = Paper jam
settings-printers-status-no-ink = Out of ink
settings-printers-status-low-ink = Low on ink
settings-printers-status-no-toner = Out of toner
settings-printers-status-low-toner = Low on toner
settings-printers-status-cover-open = A cover is open
settings-printers-status-cant-print = Can't print what it's sent
settings-printers-model = Model
settings-printers-location = Location
settings-printers-by-usb = Connected by USB
settings-printers-on-network = On your network
settings-printers-found-nearby = Found on your network, set up by itself

settings-printers-supplies = Ink and toner
settings-printers-queue = Waiting to print
settings-printers-queue-empty = Nothing is waiting
settings-printers-job-untitled = Untitled document
settings-printers-job-printing = Printing
settings-printers-job-waiting = Waiting
settings-printers-job-held = Held
settings-printers-job-cancel = Cancel printing

settings-printers-options = Printing defaults
settings-printers-paper = Paper size
settings-printers-sides = Two-sided
settings-printers-sides-off = Off
settings-printers-sides-long = Long edge
settings-printers-sides-short = Short edge
settings-printers-color = Color
settings-printers-color-color = Color
settings-printers-color-gray = Black and white

settings-printers-make-default = Make default
settings-printers-make-default-description = Apps pick this printer first
settings-printers-test-page = Print a test page
settings-printers-test-page-description = Checks that the printer is working
settings-printers-test-page-sent = The test page is on its way
settings-printers-remove = Remove printer
settings-printers-remove-description = It shows up again by itself if it's on your network
# $name is the printer's name
settings-printers-remove-confirm = Remove { $name }?
settings-printers-remove-confirm-description = Documents waiting for it are canceled. You can add it again later.

settings-printers-add-dialog-description = Printers found by USB and on your network
settings-printers-searching = Looking for printers…
settings-printers-none-found = No other printers were found. Check that the printer is on and connected, or type its address.
settings-printers-by-address = Type an address
settings-printers-by-address-detail = For a printer on another network, or one that can't be found
settings-printers-address = Address
settings-printers-address-description = The printer's IP address or host name, or a full ipp:// address. It needs to print without a driver, which most printers made since 2012 do.
settings-printers-add-button = Add
settings-printers-adding = Setting up the printer…
# $name is the printer's name
settings-printers-driver-title = Choose a driver for { $name }
settings-printers-driver-description = This printer needs a driver to print over USB
settings-printers-finding-drivers = Finding drivers…
settings-printers-driver-best = Recommended
settings-printers-driver-search = Search other drivers
settings-printers-no-drivers = No driver for this printer is installed. Drivers can be added as system packages.
settings-printers-back = Back
settings-printers-cancel = Cancel
