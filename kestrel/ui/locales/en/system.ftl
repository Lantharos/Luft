## Shared

# Button that closes a dialog without doing anything
system-cancel = Cancel

## Dictation notifications

dictation-setup-title = Type by speaking
dictation-setup-body = Talk to type what you say, in any app. It listens on this computer, so it needs its speech model first.
# Notification button that opens the dictation settings so the speech model can be installed
dictation-setup-action = Set up dictation
# $language is the name of the spoken language, for example "Japanese". It currently arrives in English from the speech service.
dictation-unsupported-title = Dictation in { $language } isn’t available on this computer
# $language is the name of the spoken language, for example "Japanese". It currently arrives in English from the speech service.
dictation-unsupported-body = Its processor can’t run the speech recognizer { $language } needs. You can dictate in another language.
# Notification button
dictation-settings-action = Dictation settings

## System health notifications

health-gpu-reset-title = The graphics driver stopped responding
# $day is "today" when it happened today, "other" otherwise. $date is a formatted day and month, for example "3 March". $time is a formatted time of day.
health-gpu-reset-body = { $day ->
    [today] Your computer restarted itself today at { $time }. Settings shows what can keep it from happening again.
   *[other] Your computer restarted itself on { $date } at { $time }. Settings shows what can keep it from happening again.
}
# Notification button that opens the About page in Settings
health-gpu-reset-details = Details

# $app is the name of the app that was closed
oom-app-closed-title = { $app } was closed to free memory
oom-container-closed-title = A container was closed to free memory
# "it" is the app or container named in the title
oom-closed-body = The computer was running out of memory, so it was closed to keep everything else responsive.
# "it" is the app or container named in the title. $size is a formatted amount of memory, for example "1.5 GB"
oom-closed-body-with-size = The computer was running out of memory, so it was closed to keep everything else responsive. It was using { $size }.
# Shown while the computer is about to run out of memory
memory-low-title = Luft is low on memory
# $app is the name of the app using the most memory. $size is a formatted amount of memory, for example "6.2 GB"
memory-low-app-body = { $app } is using { $size }. Force quit it to keep everything else responsive.
# $size is a formatted amount of memory, for example "6.2 GB"
memory-low-container-body = A container is using { $size }. Force quit it to keep everything else responsive.
# Notification button that ends the app or container right away, without letting it save
memory-low-force-quit = Force quit

## Input source indicator

# Screen-reader label of the taskbar button that switches keyboard layouts. $source is the name of the current layout or input method.
input-source-indicator = Input source: { $source }

## Hardware keys
# Short notices shown in the middle of the screen when a key is pressed

media-keys-airplane-mode-hardware = Airplane mode is on in hardware
media-keys-airplane-mode-on = Airplane mode on
media-keys-airplane-mode-off = Airplane mode off
media-keys-bluetooth-on = Bluetooth on
media-keys-bluetooth-off = Bluetooth off
# Caps Lock is the name of the key, as printed on keyboards in your language (German: Feststelltaste)
media-keys-caps-lock-on = Caps Lock on
media-keys-caps-lock-off = Caps Lock off
# Num Lock is the name of the key, as printed on keyboards in your language
media-keys-num-lock-on = Num Lock on
media-keys-num-lock-off = Num Lock off

## VPN sign-in

# Dialog title. $connection is the name of the VPN connection.
vpn-sign-in-title = Sign in to { $connection }
# Dialog button
vpn-connect = Connect
vpn-signing-in = Signing in…
vpn-finish-in-browser = Finish signing in with your browser.
# $host is the server address, $reason why the certificate can't be trusted (from the VPN software, may be in English), $fingerprint a long hexadecimal code
vpn-certificate-untrusted = { $host } presented a certificate that can’t be verified ({ $reason }). Its fingerprint is { $fingerprint }.
vpn-certificate-warning = Someone could be pretending to be this server. Only connect if you expected this.
# Button that connects despite the untrusted certificate
vpn-certificate-connect = Connect Anyway

# Field labels in the VPN sign-in dialog
vpn-field-password = Password
vpn-field-certificate-password = Certificate password
vpn-field-proxy-password = Proxy password
vpn-field-pre-shared-key = Pre-shared key
vpn-field-group-password = Group password

## Battery notifications

# $percent is a formatted percentage, for example "8%"
battery-left = { $percent } left.
# $percent is a formatted percentage, $duration a formatted time span, for example "25 min"
battery-left-with-time = { $percent } left, about { $duration }.
battery-low-title = Battery low
battery-very-low-title = Battery very low
battery-almost-empty-title = Battery almost empty
battery-ups-low-title = UPS battery low
battery-ups-very-low-title = UPS battery very low
battery-ups-almost-empty-title = UPS battery almost empty
# $left is the battery-left or battery-left-with-time sentence
battery-very-low-body = { $left } Plug in soon.
# $left is the battery-left or battery-left-with-time sentence
battery-almost-empty-body = { $left } Plug in now to avoid losing unsaved work.

# $device is a product name such as "MX Master 3" or one of the battery-device names below
battery-device-low-title = { $device } battery low
battery-device-very-low-title = { $device } battery very low
# $left is the battery-left sentence
battery-device-low-body = { $left } Charge it soon.
# $left is the battery-left sentence
battery-device-very-low-body = { $left } Charge it now so it doesn't turn off.

# Names of accessories with a battery, used in place of a product name
battery-device-mouse = Mouse
battery-device-keyboard = Keyboard
battery-device-phone = Phone
battery-device-tablet = Tablet
battery-device-controller = Controller
battery-device-pen = Pen
battery-device-touchpad = Touchpad
battery-device-headset = Headset
battery-device-speaker = Speaker
battery-device-headphones = Headphones
battery-device-remote = Remote
battery-device-other = Connected device

## Privacy indicator

# Screen-reader label of the taskbar indicator. $things is a list such as "camera, microphone and screen", built from the privacy-thing messages below.
privacy-indicator = Using your { $things }
# The privacy-thing messages are list items for privacy-indicator ("Using your camera, microphone and screen"); write them in the form that fits inside that sentence.
privacy-thing-camera = camera
privacy-thing-microphone = microphone
privacy-thing-screen = screen
privacy-thing-location = location
privacy-thing-windows = windows

privacy-camera-unknown-app = An app is using the camera
privacy-stop-sharing = Stop sharing the screen
privacy-stop-recording = Stop recording
privacy-turn-off-location = Turn off location services
privacy-settings = Privacy settings
# Shown after an app's name in the menu, for example "Firefox · Camera"
privacy-camera = Camera
privacy-microphone = Microphone
privacy-microphone-muted = Microphone muted
privacy-mute-microphone = Mute microphone
privacy-unmute-microphone = Unmute microphone
# Menu item. $app is the name of the app using the camera or microphone.
privacy-close-app = Close { $app }
# Used in place of an app's name when it isn't known
privacy-unknown-app = An app
# Menu items for programs you let see your windows, or see and use them. $count is how many
privacy-windows-seeing-programs = { $count ->
    [one] A program can see your windows
   *[other] { $count } programs can see your windows
}
privacy-windows-using-programs = { $count ->
    [one] A program can see and use your windows
   *[other] { $count } programs can see and use your windows
}
# Menu item that takes away a program's access to your windows
privacy-windows-stop = Stop access

## Window access prompt
# A program (often a coding assistant) asks to see or control the windows on the screen. Kestrel can't tell which program it is, only that it runs outside a sandbox.

peek-see-request = Let a program you started see your windows?
peek-see-description = It will be able to take pictures of any window you have open.
peek-use-request = Let a program you started see and use your windows?
peek-use-description = It will be able to see any window you have open, and click and type in it as if it were you.
peek-deny = Don’t allow
peek-allow-once = Allow once
peek-allow-until-quit = Allow until it quits

## Window access errors
# Shown in a terminal to the person or program that ran the peek command. "peek run" and "peek list" are commands and stay as they are.

peek-error-declined-until-quit = The person using this computer declined this. The program can ask again after it quits.
peek-error-not-allowed = The person using this computer didn't allow it
peek-error-sandboxed = Sandboxed apps cannot see or use other windows
peek-error-unknown-caller = The program asking ended or could not be recognized
peek-error-no-caller = The session bus did not say which program is asking
peek-error-screen-busy = The screen is locked, or a system prompt is open on it. Try again once it is gone.
peek-error-input-held = Someone is holding down keys or mouse buttons. Try again in a moment.
peek-error-input-dropped = The input was stopped because something else was under the point or had the keyboard when it arrived
peek-error-not-in-front = The window couldn't be brought to the front
peek-error-covered = Something else covers that part of the window
# $x and $y are the coordinates the person typed, $width and $height the size of the window's picture in pixels, all as plain digits
peek-error-outside = { $x }, { $y } is outside the window's picture, which is { $width } × { $height }
peek-error-nothing-to-capture = The window isn't showing anything to capture
peek-error-window-picture-late = The window’s picture wasn’t ready in time
peek-error-screen-picture-late = The screen’s picture wasn’t ready in time
# $id is a window number as peek list prints it
peek-error-no-window-id = No window has the id { $id }. peek list shows the open ones.
# $handle is a short code that names a started program
peek-error-no-window-for-handle = The program started as { $handle } has no window open
peek-error-ended-before-window = The program ended before it opened a window
# $duration is a formatted number of seconds, for example "5 sec"
peek-error-no-window-in-time = No window opened within { $duration }
peek-error-launch-not-started-by-peek = Only a program that peek run started itself can be launched
peek-error-ended-while-starting = The program ended while it was starting
# $program is a technical program name
peek-error-launch-failed = systemd couldn't start { $program }
# $handle is a short code that names a started program
peek-error-unknown-handle = Nothing you started with peek run has the handle { $handle }, or it has quit
# $key is what the person typed
peek-error-unknown-key = { $key } isn't a key peek knows
# $modifier is what the person typed. ctrl, shift, alt and super are typed as they are.
peek-error-unknown-modifier = { $modifier } isn't a modifier. Use ctrl, shift, alt or super.
peek-error-display-owner = This display belongs to another program
peek-error-display-run = Programs in a hidden display are started by peek run
# $handle and $requested are short codes that name started programs
peek-error-display-handle = This display was started as { $handle }, not { $requested }

## Quick settings tiles

# Quick settings tile title, keep short
auto-rotate-title = Auto Rotate
# Quick settings tile title, keep short
dark-style-title = Dark Style
# Quick settings tile title, keep short
do-not-disturb-title = Do Not Disturb
# Quick settings tile title, keep short
night-light-title = Night Light
# Quick settings tile title, keep short
airplane-mode-title = Airplane Mode

## Power mode

# Quick settings tile title
power-profile-title = Power Mode
# Header of the power mode menu in quick settings
power-profile-header = Power Mode
# Screen-reader label of the arrow button next to the power mode tile
power-profile-open-menu = Open power profiles menu
power-profile-settings = Power Settings
# Power profile name, also shown under the tile title
power-profile-performance = Performance
# Power profile name, also shown under the tile title
power-profile-balanced = Balanced
# Power profile name, also shown under the tile title
power-profile-power-saver = Power Saver
# Shown under the tile title when the system uses a profile Kestrel doesn't know
power-profile-custom = Custom

## Keep awake

# Quick settings tile title and menu header: keeps the screen from turning off
caffeine-title = Keep Awake
# Screen-reader label of the arrow button next to the Keep Awake tile
caffeine-open-menu = Open keep awake menu
# Shown under the tile title. $time is a clock time, like 14:30
caffeine-until = Until { $time }
# Menu item: keep awake with no time limit
caffeine-until-turned-off = Until Turned Off
caffeine-30-minutes = 30 Minutes
caffeine-1-hour = 1 Hour
caffeine-2-hours = 2 Hours
# Reason given to the session manager, shown where the system lists what keeps it awake
caffeine-inhibit-reason = Kept awake from quick settings

## Brightness

# Header of the brightness menu and screen-reader label of the brightness slider
brightness-title = Brightness
# Screen-reader label of the arrow button next to the brightness slider
brightness-open-menu = Open brightness menu

## Keyboard backlight

# Quick settings tile title and menu header
backlight-title = Keyboard Backlight
# Screen-reader label of the arrow button next to the keyboard backlight tile
backlight-open-menu = Open keyboard brightness menu
# Screen-reader label of the keyboard brightness slider
backlight-slider = Keyboard Brightness
# Keyboard backlight level, shown under its button
backlight-off = Off
# Keyboard backlight level, shown under its button
backlight-low = Low
# Keyboard backlight level, shown under its button
backlight-high = High

## Sound

volume-sound-settings = Sound Settings
# Screen-reader label of the speaker button on the volume slider (a verb)
volume-mute = Mute
# Screen-reader label of the speaker button on the volume slider (a verb)
volume-unmute = Unmute
# Screen-reader label of the output volume slider
volume-output-slider = Volume
# Header of the sound output menu
volume-output-title = Sound Output
# Screen-reader label of the arrow button next to the volume slider
volume-output-open-menu = Open sound output menu
# Screen-reader label of the microphone volume slider
volume-input-slider = Microphone
# Header of the sound input menu
volume-input-title = Sound Input
# Screen-reader label of the arrow button next to the microphone slider
volume-input-open-menu = Open sound input menu

## Bluetooth

# Quick settings tile title and menu header
bluetooth-title = Bluetooth
# Screen-reader label of the arrow button next to the Bluetooth tile
bluetooth-open-menu = Open Bluetooth menu
bluetooth-settings = Bluetooth Settings
# Shown next to a paired device in the Bluetooth menu, an action (verb)
bluetooth-connect = Connect
# Shown next to a connected device in the Bluetooth menu, an action (verb)
bluetooth-disconnect = Disconnect
# Screen-reader label of a device in the Bluetooth menu. $deviceName is a name like "MyPhone"
bluetooth-connect-device = Connect to { $deviceName }
# Screen-reader label of a device in the Bluetooth menu. $deviceName is a name like "MyPhone"
bluetooth-disconnect-device = Disconnect { $deviceName }
bluetooth-no-devices = No available or connected devices
bluetooth-turn-on-hint = Turn on Bluetooth to connect to devices
# Shown under the tile title when several devices are connected
bluetooth-connected-count = { $count ->
    [one] { $count } connected
   *[other] { $count } connected
}

## Network menus in quick settings

# Name shown for a Wi-Fi network whose name can't be read
network-menu-unknown-network = <unknown>
# Shown next to a saved connection, an action (verb)
network-menu-connect = Connect
# Shown next to an active connection, an action (verb)
network-menu-disconnect = Disconnect
# Screen-reader label of a connection. $name is a connection or device name like "MyPhone"
network-menu-connect-to = Connect to { $name }
# Screen-reader label of an active connection. $name is a connection or device name like "MyPhone"
network-menu-disconnect-from = Disconnect { $name }
# Menu item that turns off a network device
network-menu-turn-off = Turn Off
# Screen-reader label of a Wi-Fi network. $name is the network name, $strength the signal strength from 0 to 100 (a percentage)
network-menu-wifi-network = { $secure ->
    [yes] { $name }, Secure, Signal strength { $strength }%
   *[no] { $name }, Not secure, Signal strength { $strength }%
}
# $name is the name of the Wi-Fi device sharing its connection
network-menu-hotspot = { $name } Hotspot
# Shown under a network tile title when several connections are active
network-menu-connected-count = { $count ->
    [one] { $count } connected
   *[other] { $count } connected
}
# Quick settings tile title and menu header
network-menu-vpn = VPN
network-menu-vpn-open-menu = Open VPN menu
network-menu-vpn-settings = VPN Settings
# Menu header of the Wi-Fi tile
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Open Wi-Fi menu
# Link to the network settings from the Wi-Fi menu
network-menu-wifi-settings = All Networks
network-menu-wired = Wired Connections
network-menu-wired-open-menu = Open wired connections menu
network-menu-wired-settings = Wired Settings
# Menu header for internet shared from a phone over Bluetooth
network-menu-tethers = Bluetooth Tethers
network-menu-tethers-open-menu = Open Bluetooth tethers menu
# Quick settings tile title, "Tether" as in "Bluetooth Tether"
network-menu-tether = Tether
network-menu-tether-settings = Bluetooth Settings
network-menu-mobile-connections = Mobile Connections
network-menu-mobile-open-menu = Open mobile connections menu
network-menu-mobile-settings = Mobile Broadband Settings
# Quick settings tile title, "Mobile" as in "Mobile Broadband"
network-menu-mobile = Mobile
# Quick settings tile title and menu item for a wired network adapter
network-device-wired = Wired
# A network adapter when there are several of the same kind. $kind is its kind, such as Wired; $name is its interface name, such as enp3s0
network-device-named = { $kind } ({ $name })
# Notification title shown when a network needs signing in on a web page
network-menu-sign-in = Sign in to Network
network-menu-failed-title = Connection failed
network-menu-failed-body = Activation of network connection failed

## Location access dialog

location-dialog-title = Allow location access
# $appName is the name of the app asking for the location
location-dialog-description = The app { $appName } wants to access your location
location-dialog-info = Location access can be changed at any time from the privacy settings
# Button
location-dialog-deny = Deny Access
# Button
location-dialog-grant = Grant Access

## Thunderbolt notifications

thunderbolt-unknown-title = Unknown Thunderbolt device
thunderbolt-unknown-body = A new device was connected while you were away. Unplug it and plug it in again to start using it.
thunderbolt-unauthorized-title = Unauthorized Thunderbolt device
thunderbolt-unauthorized-body = A new device was connected and needs an administrator’s approval
thunderbolt-error-title = Thunderbolt authorization error
# $reason is the system's error message, usually in English
thunderbolt-error-body = Could not authorize the Thunderbolt device: { $reason }

## App permission dialog, used when an app asks for access to something

# Default button label when the app doesn't name its own
access-dialog-deny = Deny
# Default button label when the app doesn't name its own
access-dialog-allow = Allow

## Display change confirmation

# Dialog title, keep it shorter than 30 characters
display-change-title = Keep these display settings?
display-change-countdown = { $seconds ->
    [one] Settings changes will revert in { $seconds } second
   *[other] Settings changes will revert in { $seconds } seconds
}
# Button, keep short so it isn't cut off
display-change-revert = Revert Settings
# Button, keep short so it isn't cut off
display-change-keep = Keep Changes

## Drive connected notification

# $driveName is the name of a partition on an external drive
autorun-connected = “{ $driveName }” connected
autorun-ready = Disk can now be used
# Notification button. $appName is the name of an app
autorun-open-with = Open with { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Slow Keys Turned On
kbd-a11y-slow-keys-off = Slow Keys Turned Off
kbd-a11y-slow-keys-description = You just held down the Shift key for 8 seconds. This is the shortcut for the Slow Keys feature, which affects the way your keyboard works.
kbd-a11y-sticky-keys-on = Sticky Keys Turned On
kbd-a11y-sticky-keys-off = Sticky Keys Turned Off
kbd-a11y-sticky-keys-on-description = You just pressed the Shift key 5 times in a row. This is the shortcut for the Sticky Keys feature, which affects the way your keyboard works.
kbd-a11y-sticky-keys-off-description = You just pressed two keys at once, or pressed the Shift key 5 times in a row. This turns off the Sticky Keys feature, which affects the way your keyboard works.
# Button that keeps the feature that was just turned on
kbd-a11y-leave-on = Leave On
# Button that turns the feature back on after it was just turned off
kbd-a11y-turn-on = Turn On
# Button that turns the feature back off after it was just turned on
kbd-a11y-turn-off = Turn Off
# Button that keeps the feature that was just turned off
kbd-a11y-leave-off = Leave Off

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Select Audio Device
audio-device-cancel = Cancel
audio-device-sound-settings = Sound Settings
audio-device-headphones = Headphones
audio-device-headset = Headset
audio-device-microphone = Microphone

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Allow inhibiting shortcuts
# $appName is an app name like "Settings"
inhibit-shortcuts-app = The app { $appName } wants to inhibit shortcuts
inhibit-shortcuts-unknown-app = An app wants to inhibit shortcuts
# $shortcut is a keyboard shortcut like "Super+Escape"
inhibit-shortcuts-restore = You can restore shortcuts by pressing { $shortcut }
inhibit-shortcuts-deny = Deny
inhibit-shortcuts-allow = Allow

## Unlocking encrypted drives

# Checkbox for VeraCrypt volumes
mount-hidden-volume = Hidden Volume
# Checkbox for VeraCrypt volumes
mount-windows-system-volume = Windows System Volume
# Checkbox for VeraCrypt volumes that are unlocked with key files
mount-uses-keyfiles = Uses Keyfiles
# Keep the <i> tags around the app name. $appName is the disk utility's name
mount-keyfiles-use-app = To unlock a volume that uses keyfiles, use the <i>{ $appName }</i> utility instead
# Keep the <i> tags around the app name
mount-keyfiles-need-app = You need an external utility like <i>Disks</i> to unlock a volume that uses keyfiles
# Field label: the personal iterations multiplier of a VeraCrypt volume
mount-pim-number = PIM Number
mount-pim-invalid = The PIM must be a number or empty
mount-password = Password
mount-remember-password = Remember Password
mount-cancel = Cancel
mount-unlock = Unlock
# Button. $appName is the disk utility's name
mount-open-app = Open { $appName }
mount-wrong-password = Sorry, that didn’t work. Please try again.
mount-unlock-failed = Unable to unlock volume
mount-pim-unsupported = The installed udisks version does not support the PIM setting

## Network passwords, asked when connecting needs one

network-agent-auth-required = Authentication required
# $networkName is a Wi-Fi network name
network-agent-wifi-rejected = The saved password for “{ $networkName }” didn’t work. Enter it again.
# $networkName is a Wi-Fi network name
network-agent-wifi-secrets = Passwords or encryption keys are required to access the wireless network “{ $networkName }”
network-agent-wps-hint = Alternatively you can connect by pushing the “WPS” button on your router
network-agent-wired-title = Wired 802.1X authentication
network-agent-dsl-title = DSL authentication
network-agent-pin-title = PIN code required
network-agent-pin-body = PIN code is needed for the mobile broadband device
network-agent-vpn-title = VPN password
# $networkName is the name of a network connection
network-agent-password-required = A password is required to connect to “{ $networkName }”
# Button
network-agent-connect = Connect
network-agent-cancel = Cancel
network-agent-password = Password
network-agent-username = Username
# Field label: a WEP encryption key
network-agent-key = Key
network-agent-private-key-password = Private key password
# Field label: the user identity of an enterprise network
network-agent-identity = Identity
# Field label: the DSL service name
network-agent-service = Service
network-agent-network-name = Network name
# Field label: the SIM card PIN
network-agent-pin = PIN

## Screenshots and screen recording

# Name shown on screenshot and recording notifications
screenshot-source = Screen Capture
# Tooltip and screen-reader label: capture part of the screen
screenshot-area = Area Selection
# Tooltip and screen-reader label: capture a whole display
screenshot-screen = Screen Selection
# Tooltip and screen-reader label: capture one window
screenshot-window = Window Selection
# Tooltip
screenshot-take = Take Screenshot
# Tooltip
screenshot-record = Record Screen
# Tooltip: include the mouse pointer in the capture
screenshot-show-pointer = Show Pointer
# Tooltip of the shutter button, a verb
screenshot-capture = Capture
# Screen-reader label of the button that closes the screenshot tool
screenshot-close = Close
# Name of the folder in the home folder where screen recordings are saved
screenshot-screencasts-folder = Screencasts
# File name of a screen recording. $date and $time are filled in when recording starts, like "2013-07-17" and "10-00-46"
screenshot-screencast-file = Screencast From { $date } { $time }
# Name of the folder in Pictures where screenshots are saved
screenshot-screenshots-folder = Screenshots
# File name of a screenshot. $timestamp is like "2017-05-21 12-24-03"
screenshot-file = Screenshot From { $timestamp }
screenshot-screencast-recorded = Screencast Recorded
screenshot-screencast-start-failed = Screencast Failed to Start
screenshot-screencast-out-of-space = Screencast Failed: Out of Disk Space
screenshot-screencast-try-again = Screencast Failed, Please Try Again
screenshot-screencast-failed = Screencast Failed
screenshot-screencast-view = Click here to view the video
# Notification button that opens the file manager at the saved file
screenshot-show-in-rover = Show in Rover
screenshot-captured = Screenshot Captured
screenshot-captured-body = You can paste the image from the clipboard
