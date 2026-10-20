# The app's name, used as its window title and when it shows up in notifications and the sound mixer
desktop-app-name = Settings

## Settings storage
desktop-gsettings-none-installed = No settings are installed
# $schema is a technical settings schema name, such as org.gnome.desktop.interface
desktop-gsettings-not-installed = { $schema } is not installed
desktop-gsettings-no-schema = Settings have no schema
desktop-gsettings-watcher-stopped = The settings watcher stopped
## Online accounts
desktop-accounts-not-web-address = That isn't a web address

## Bluetooth
desktop-bluetooth-code-mismatch = The code didn't match
desktop-bluetooth-pairing-canceled = Pairing was canceled
desktop-bluetooth-timed-out = The device took too long to respond
desktop-bluetooth-unreachable = Couldn't reach the device. Make sure it's on and nearby.
desktop-bluetooth-busy = Still working on the last request
desktop-bluetooth-failed = Something went wrong. Try again.
desktop-bluetooth-unknown-device = Unknown device
desktop-bluetooth-no-adapter = There is no Bluetooth adapter
# Shown when bringing over the Bluetooth devices paired in a Windows installation on the same computer fails
desktop-bluetooth-windows-import-failed = Windows' Bluetooth devices weren't brought over

## Keyboard and dictation
# Keys is the name of an app
desktop-keyboard-keys-missing = Keys isn't installed
desktop-dictation-not-web-address = That isn't a web address

## Keyboard shortcuts
# Names of actions in the list of keyboard shortcuts. Each describes what pressing the shortcut does.
desktop-shortcut-toggle-message-tray = Show the notification list
desktop-shortcut-toggle-quick-settings = Open the quick settings menu
desktop-shortcut-focus-active-notification = Focus the active notification
desktop-shortcut-clipboard-history = Show clipboard history
desktop-shortcut-emoji-picker = Insert emoji
# Verb: start speaking text instead of typing it
desktop-shortcut-dictate = Dictate
desktop-shortcut-snap-layouts = Show snap layouts for the focused window
# The board is the overview that shows all open windows side by side
desktop-shortcut-board-zoom-in = Zoom in on the board
desktop-shortcut-board-zoom-out = Zoom out of the board
desktop-shortcut-board-enter-window = Enter the focused window on the board
desktop-shortcut-system-monitor = Open the system monitor to see what's running
desktop-shortcut-screen-brightness-up = Increase screen brightness
desktop-shortcut-screen-brightness-down = Decrease screen brightness
# Steps through brightness levels, starting over after the brightest
desktop-shortcut-screen-brightness-cycle = Cycle screen brightness
desktop-shortcut-screen-brightness-up-monitor = Increase brightness of the current display
desktop-shortcut-screen-brightness-down-monitor = Decrease brightness of the current display
desktop-shortcut-screen-brightness-cycle-monitor = Cycle brightness of the current display
# $number is the workspace's position, counting from 1
desktop-shortcut-switch-to-workspace = Switch to workspace { $number }
desktop-shortcut-switch-to-workspace-last = Switch to last workspace
desktop-shortcut-switch-to-workspace-left = Switch to workspace on the left
desktop-shortcut-switch-to-workspace-right = Switch to workspace on the right
# $number is the workspace's position, counting from 1
desktop-shortcut-move-to-workspace = Move window to workspace { $number }
desktop-shortcut-move-to-workspace-last = Move window to last workspace
desktop-shortcut-move-to-workspace-left = Move window one workspace to the left
desktop-shortcut-move-to-workspace-right = Move window one workspace to the right
desktop-shortcut-move-to-monitor-left = Move window one monitor to the left
desktop-shortcut-move-to-monitor-right = Move window one monitor to the right
desktop-shortcut-move-to-monitor-up = Move window one monitor up
desktop-shortcut-move-to-monitor-down = Move window one monitor down
desktop-shortcut-show-screenshot-ui = Take a screenshot interactively
desktop-shortcut-screenshot = Take a screenshot
desktop-shortcut-screenshot-window = Take a screenshot of a window
desktop-shortcut-show-screen-recording-ui = Record a screencast interactively
desktop-shortcut-magnifier = Turn the magnifier on or off
desktop-shortcut-screenreader = Turn the screen reader on or off
desktop-shortcut-on-screen-keyboard = Show or hide the on-screen keyboard
desktop-shortcut-increase-text-size = Make text larger
desktop-shortcut-decrease-text-size = Make text smaller
desktop-shortcut-toggle-contrast = Turn high contrast on or off
desktop-shortcut-magnifier-zoom-in = Zoom the magnifier in
desktop-shortcut-magnifier-zoom-out = Zoom the magnifier out
desktop-shortcut-screensaver = Lock the screen
desktop-shortcut-logout = Log out
# Restart the computer
desktop-shortcut-reboot = Restart
# Turn the computer off
desktop-shortcut-shutdown = Power off
desktop-shortcut-keyboard-brightness-up = Brighten the keyboard
desktop-shortcut-keyboard-brightness-down = Dim the keyboard
desktop-shortcut-keyboard-brightness-toggle = Turn the keyboard light on or off
desktop-shortcut-touchpad-toggle = Turn the touchpad on or off
desktop-shortcut-rotate-video-lock = Lock or unlock the screen rotation
desktop-shortcut-rfkill = Turn airplane mode on or off
desktop-shortcut-www = Open the web browser
desktop-shortcut-email = Open the email app
desktop-shortcut-calculator = Open the calculator
desktop-shortcut-media = Open the music player
desktop-shortcut-home = Open the home folder
# Verb: open search
desktop-shortcut-search = Search
desktop-shortcut-control-center = Open Settings
desktop-shortcut-volume-mute = Mute or unmute the sound
desktop-shortcut-volume-down = Turn the volume down
desktop-shortcut-volume-up = Turn the volume up
desktop-shortcut-mic-mute = Mute or unmute the microphone
desktop-shortcut-play = Play or pause
desktop-shortcut-pause = Pause playback
desktop-shortcut-stop = Stop playback
# Go to the previous song or video
desktop-shortcut-previous = Previous track
# Go to the next song or video
desktop-shortcut-next = Next track
desktop-shortcut-playback-rewind = Skip back in the track
desktop-shortcut-playback-forward = Skip ahead in the track
# Switches repeating the playlist on or off
desktop-shortcut-playback-repeat = Repeat the playlist or not
# Switches shuffling on or off
desktop-shortcut-playback-random = Shuffle or not
desktop-shortcut-eject = Eject the disc
# Shows a switcher of open apps
desktop-shortcut-switch-applications = Switch applications
desktop-shortcut-switch-windows = Switch windows
desktop-shortcut-switch-group = Switch windows of an application
# Moves keyboard focus between the taskbar and other parts of the desktop
desktop-shortcut-switch-panels = Switch system controls
# Like the switchers above, but jumps straight to the next one without showing a switcher
desktop-shortcut-cycle-windows = Switch windows directly
desktop-shortcut-cycle-group = Switch windows of an app directly
desktop-shortcut-cycle-panels = Switch system controls directly
desktop-shortcut-show-desktop = Hide all normal windows
desktop-shortcut-panel-run-dialog = Show the run command prompt
# Gives back the keyboard shortcuts after an app took them over, for example a remote desktop or a game
desktop-shortcut-restore-shortcuts = Restore the keyboard shortcuts
desktop-shortcut-activate-window-menu = Activate the window menu
desktop-shortcut-toggle-fullscreen = Toggle fullscreen mode
desktop-shortcut-toggle-maximized = Maximize or restore the window
desktop-shortcut-maximize = Maximize window
# Return a maximized window to its earlier size
desktop-shortcut-unmaximize = Restore window
desktop-shortcut-close = Close window
desktop-shortcut-minimize = Hide window
desktop-shortcut-begin-move = Move window
desktop-shortcut-begin-resize = Resize window
desktop-shortcut-toggle-on-all-workspaces = Toggle window on all workspaces or one
desktop-shortcut-raise-or-lower = Raise window if covered, otherwise lower it
desktop-shortcut-raise = Raise window above other windows
desktop-shortcut-lower = Lower window below other windows
desktop-shortcut-maximize-vertically = Maximize window vertically
desktop-shortcut-maximize-horizontally = Maximize window horizontally
desktop-shortcut-toggle-tiled-left = Snap the window to the left half
desktop-shortcut-toggle-tiled-right = Snap the window to the right half

## Sound
# Name of the recording stream Settings opens to show the microphone level; other sound apps may list it
desktop-sound-meter-stream = Input level
desktop-sound-unavailable = Sound isn't available right now

## Folders
desktop-no-cache-folder = There is no cache folder
desktop-no-data-folder = There is no data folder
desktop-no-config-folder = There is no config folder

## Cursor themes downloaded from GNOME-Look
desktop-cursors-store-unreachable = GNOME-Look can't be reached right now. Check your connection and try again.
# $reason is the message GNOME-Look sent back, usually in English
desktop-cursors-store-failed = GNOME-Look couldn't answer: { $reason }
desktop-cursors-theme-gone = This theme is no longer available
desktop-cursors-download-gone = This download is no longer available
desktop-cursors-download-refused = GNOME-Look couldn't send this download. Try again later.
desktop-cursors-download-too-large = This download is larger than a cursor theme should be
desktop-cursors-download-interrupted = The download stopped before it finished. Try again.
desktop-cursors-unpacks-too-large = This download unpacks to more than a cursor theme should need
desktop-cursors-archive-damaged = This download is damaged or isn't an archive Settings can open
desktop-cursors-not-an-archive = This download isn't an archive Settings can open
desktop-cursors-no-linux-theme = This download doesn't include a cursor theme for Linux
desktop-cursors-theme-unnamed = This theme has no name
desktop-cursors-not-removable = This theme can't be removed
# $name is the folder name the theme would get
desktop-cursors-no-free-name = There's no free name for “{ $name }” in the icons folder
desktop-cursors-nothing-to-preview = This theme has no cursors to show

## Fonts
# Magpie is the name of the font viewer app
desktop-fonts-magpie-missing = Magpie isn't installed

## Wallpaper
desktop-wallpaper-no-pictures-folder = There is no Pictures folder
desktop-wallpaper-unopenable = This file can't be opened
# Title of the file chooser for adding wallpapers
desktop-wallpaper-add-title = Add Wallpapers
# File type filter in the file chooser
desktop-wallpaper-add-filter = Images and videos
desktop-wallpaper-video-no-picture = This video has no picture

## Keyring
desktop-keyring-not-running = Your keyring isn’t running
desktop-keyring-denied = Only the installed Settings app can change this
desktop-keyring-unsupported = Your keyring can’t do this yet
desktop-keyring-reseal-failed = The security chip couldn’t protect your keyring right now

## Passkeys
desktop-passkeys-missing = That passkey doesn't exist

## Device security
# Suggested file name when saving the disk recovery key
desktop-security-recovery-file-name = Recovery key.txt
desktop-security-unavailable = Device security isn't available on this computer
desktop-security-wrong-key = That key didn't unlock the disk
desktop-security-usb-unavailable = USB protection isn't available on this computer

## Shared
desktop-admin-required = Administrator rights are needed to change this

## About
# Disks is the name of an app
desktop-about-disks-missing = Disks isn't installed

## Apps
desktop-apps-kind-not-choosable = This kind of app can't be chosen
desktop-apps-uninstalled = This app is no longer installed
desktop-apps-no-longer-starts = This app no longer starts automatically
desktop-apps-cannot-autostart = This app can't start automatically

## Login screen
# $property is a technical property name the login screen should have reported
desktop-login-missing-property = The login screen left out { $property }

## Picture chooser for the login screen wallpaper and account pictures
# Title of the file chooser
desktop-picture-choose-title = Choose a Picture
# File type filter in the file chooser
desktop-picture-filter = Images
desktop-picture-unopenable = This picture can't be opened

## Users
# $reason is a system error message
desktop-users-password-failed = Couldn't change your password: { $reason }
# passwd is the name of the program that changes passwords
desktop-users-password-timed-out = passwd stopped responding

## Updates
# Notification shown when updates were found in the background
desktop-updates-available-summary = System updates are available
desktop-updates-available-body = Open Settings to download and install them.
# Notification shown when downloaded updates wait for a restart
desktop-updates-ready-summary = Updates are ready to install
desktop-updates-ready-body = Restart when it suits you to install them.
# Notification shown once when an NVIDIA graphics card could use NVIDIA's driver
desktop-updates-nvidia-summary = Get the most out of your NVIDIA graphics
desktop-updates-nvidia-body = Switch to NVIDIA's own driver in Settings.
# Button on the update notifications (verb)
desktop-updates-notification-open = Open
desktop-updates-already-downloading = Something is already being downloaded.
desktop-updates-system-busy = Something else is changing the system right now.
desktop-updates-already-installing = Something is already being installed.
desktop-updates-no-rollback = This system can't go back to an earlier version.
# Shown in place of a program's name when an unknown program is changing the system's software; the Updates page puts it inside sentences such as "Updates are being installed by another app"
desktop-updates-another-app = another app
# Name for a device's firmware when the device has no name
desktop-updates-firmware-unnamed = Device firmware
desktop-updates-firmware-current = This device is already up to date.
desktop-updates-firmware-no-download = This update can't be downloaded.
