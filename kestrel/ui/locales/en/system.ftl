## Shared

# Button that closes a dialog without doing anything
system-cancel = Cancel

## Dictation notifications

dictation-setup-title = Type by speaking
dictation-setup-body = Works in any app, and what you say never leaves this computer. It needs its speech model first.
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
oom-closed-body = This kept everything else responsive.
# "it" is the app or container named in the title. $size is a formatted amount of memory, for example "1.5 GB"
oom-closed-body-with-size = It was using { $size }. Closing it kept everything else responsive.
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

media-keys-airplane-mode-hardware = Airplane mode is on (hardware switch)
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
vpn-signing-in = Signing in
vpn-finish-in-browser = Finish signing in with your browser.
# $host is the server address, $reason why the certificate can't be trusted (from the VPN software, may be in English), $fingerprint a long hexadecimal code
vpn-certificate-untrusted = { $host } presented a certificate that can’t be verified ({ $reason }). Its fingerprint is { $fingerprint }.
vpn-certificate-warning = Someone could be pretending to be this server. Only connect if you expected this.
# Button that connects despite the untrusted certificate
vpn-certificate-connect = Connect anyway

# Field labels in the VPN sign-in dialog
vpn-field-password = Password
vpn-field-certificate-password = Certificate password
vpn-field-proxy-password = Proxy password
vpn-field-pre-shared-key = Pre-shared key
vpn-field-group-password = Group password

## Battery notifications

# $percent is a formatted percentage, for example "8%"
battery-left = { $percent } left.

# $device is a product name such as "MX Master 3" or one of the battery-device names below
battery-device-low-title = { $device } battery low
battery-device-very-low-title = { $device } battery very low
# $left is the battery-left sentence
battery-device-low-body = { $left } Charge it soon.
# $left is the battery-left sentence
battery-device-very-low-body = { $left } Charge it now so it doesn’t turn off.

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
privacy-thing-typing = keyboard

privacy-camera-unknown-app = An app is using the camera
privacy-stop-sharing = Stop sharing the screen
privacy-stop-recording = Stop recording
privacy-turn-off-location = Turn off location services
# An extension typed text into an app a moment ago. Opens the extension in Settings.
privacy-extension-typed = { $name } typed for you
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
# $name is the name an app gave itself, which Kestrel couldn't check, such as for apps that use sound through PulseAudio
privacy-reported-app = “{ $name }” (name not verified)
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

## Send sheet
# Opens when an app sends files it holds, to a device nearby or another app

# Dialog title. $name is the file name.
send-sheet-title-one = Send “{ $name }”
send-sheet-title = Send { $count ->
    [one] { $count } file
   *[other] { $count } files
}
send-sheet-description = { $count ->
    [one] Choose where it goes.
   *[other] Choose where they go.
}
# Heading above the apps that can open the files
send-sheet-apps = Apps

## Post
# Post sends files and text to phones and computers nearby and takes what they send, with the free LocalSend app on the other devices. Its name is like a postal service.

post = Post
# A menu entry in Rover and the heading of the devices in the Send sheet
post-send-to-device = Send to device
post-devices-nearby = Devices nearby
post-looking = Looking for devices
post-nobody = No devices nearby
post-nobody-hint = Open LocalSend on a device on the same network.
post-look-again = Look again
post-public-network = On a public network, devices nearby can’t find this computer.
post-port-taken = Another app is using LocalSend’s port, so devices can’t send here.
post-back = Back
post-gone = That device isn’t nearby anymore
post-send-files = Send files
post-send-folder = Send a folder
# Label of the field for text to send
post-message = Text to send
post-message-placeholder = Text or a link
post-send-text = Send text
# Title of the file chooser; $device is where the files go
post-choose-for = Send to { $device }
# $name is what other devices call this computer, such as “Mara's Laptop”
post-who-finds = Who can find { $name }
post-visibility-no-one = No one
post-visibility-your-devices = Your devices
post-visibility-everyone = Everyone
post-settings = Post settings
# $count is how many files, $device the device's name
post-sending = { $count ->
    [one] Sending a file to { $device }
   *[other] Sending { $count } files to { $device }
}
post-sending-text = Sending text to { $device }
post-receiving = { $count ->
    [one] Receiving a file from { $device }
   *[other] Receiving { $count } files from { $device }
}
# $done and $size are amounts such as “4.2 MB”
post-progress = { $done } of { $size }
post-waiting-for = Waiting for { $device } to accept
post-asks-for-pin = { $device } asks for a PIN
post-cancel = Cancel

# A device offers files; $count is how many, $size their total, such as “12 MB”
post-offers = { $count ->
    [one] Wants to send you a file, { $size }
   *[other] Wants to send you { $count } files, { $size }
}
# Under the sender's name once the files are on their way
post-files-size = { $count ->
    [one] One file, { $size }
   *[other] { $count } files, { $size }
}
post-and-more = { $count ->
    [one] and one more
   *[other] and { $count } more
}
# A switch that makes the sender one of your devices, which send without asking
post-always-accept = Always accept from { $device }
post-decline = Decline
post-accept = Accept
# $folder is a folder's name, such as “Downloads”
post-saved-in = Saved in { $folder }
post-show-folder = Show in folder
# Opens a received file
post-open = Open
post-received = { $count ->
    [one] A file from { $device }
   *[other] { $count } files from { $device }
}
post-stopped-by = { $device } stopped the transfer
post-you-stopped = You stopped the transfer
post-some-arrived = { $count ->
    [one] Only one file arrived
   *[other] Only { $count } files arrived
}
post-nothing-arrived = The transfer from { $device } didn’t finish

# Text someone sent
post-sent-text = { $device } sent you text
post-text-copied = Copied text from { $device }
post-copy = Copy
post-open-link = Open link

# Sending
post-pin-title = Enter the PIN { $device } shows
post-pin-wrong = That PIN wasn’t right. Try again.
post-pin = PIN
post-send = Send
post-sent-text-to = Sent text to { $device }
post-sent = { $count ->
    [one] Sent a file to { $device }
   *[other] Sent { $count } files to { $device }
}
post-declined = { $device } declined
post-busy = { $device } is busy with another transfer
post-unreachable = Couldn’t reach { $device }
post-send-failed = Sending to { $device } didn’t finish

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
peek-error-not-allowed = The person using this computer didn’t allow it
peek-error-sandboxed = Sandboxed apps can’t see or use other windows
peek-error-unknown-caller = The program asking ended or couldn’t be recognized
peek-error-developer-tools-off = Developer tools are off. Turn them on in Settings → Security to let programs see and use windows
peek-error-no-caller = Couldn’t tell which program is asking
peek-error-screen-busy = The screen is locked, or a system prompt is open on it. Try again once it is gone.
peek-error-input-held = Someone is holding down keys or mouse buttons. Try again in a moment.
peek-error-input-dropped = The input was stopped because something else was under the point or had the keyboard when it arrived
peek-error-not-in-front = The window couldn’t be brought to the front
peek-error-covered = Something else covers that part of the window
# $x and $y are the coordinates the person typed, $width and $height the size of the window's picture in pixels, all as plain digits
peek-error-outside = { $x }, { $y } is outside the window’s picture, which is { $width } × { $height }
peek-error-nothing-to-capture = The window isn’t showing anything to capture
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
peek-error-launch-failed = { $program } couldn’t be started
# $handle is a short code that names a started program
peek-error-unknown-handle = Nothing you started with peek run has the handle { $handle }, or it has quit
# $key is what the person typed
peek-error-unknown-key = { $key } isn’t a key peek knows
# $modifier is what the person typed. ctrl, shift, alt and super are typed as they are.
peek-error-unknown-modifier = { $modifier } isn’t a modifier. Use ctrl, shift, alt or super.
peek-error-display-owner = This display belongs to another program
peek-error-display-run = Programs in a hidden display are started by peek run
# $handle and $requested are short codes that name started programs
peek-error-display-handle = This display was started as { $handle }, not { $requested }

## Quick settings tiles

# Quick settings tile title, keep short
auto-rotate-title = Auto-rotate
# Quick settings tile title, keep short
dark-style-title = Dark style
# Quick settings tile title, keep short
do-not-disturb-title = Do Not Disturb
# Quick settings tile title, keep short
night-light-title = Night light
# Quick settings tile title, keep short
airplane-mode-title = Airplane mode

## Power mode

# Quick settings tile title
power-profile-title = Power mode
# Header of the power mode menu in quick settings
power-profile-header = Power mode
# Screen-reader label of the arrow button next to the power mode tile
power-profile-open-menu = Open power mode menu
power-profile-settings = Power settings
# Power profile name, also shown under the tile title
power-profile-performance = Performance
# Power profile name, also shown under the tile title
power-profile-balanced = Balanced
# Power profile name, also shown under the tile title
power-profile-power-saver = Power saver
# Shown under the tile title when the system uses a profile Kestrel doesn't know
power-profile-custom = Custom

## Keep awake

# Quick settings tile title and menu header: keeps the screen from turning off
caffeine-title = Keep awake
# Screen-reader label of the arrow button next to the Keep Awake tile
caffeine-open-menu = Open keep awake menu
# Shown under the tile title. $time is a clock time, like 14:30
caffeine-until = Until { $time }
# Menu item: keep awake with no time limit
caffeine-until-turned-off = Until turned off
caffeine-30-minutes = 30 minutes
caffeine-1-hour = 1 hour
caffeine-2-hours = 2 hours
# Reason given to the session manager, shown where the system lists what keeps it awake
caffeine-inhibit-reason = Kept awake from quick settings

## Brightness

# Header of the brightness menu and screen-reader label of the brightness slider
brightness-title = Brightness
# Screen-reader label of the arrow button next to the brightness slider
brightness-open-menu = Open brightness menu

## Keyboard backlight

# Quick settings tile title and menu header
backlight-title = Keyboard backlight
# Screen-reader label of the arrow button next to the keyboard backlight tile
backlight-open-menu = Open keyboard brightness menu
# Screen-reader label of the keyboard brightness slider
backlight-slider = Keyboard brightness
# Keyboard backlight level, shown under its button
backlight-off = Off
# Keyboard backlight level, shown under its button
backlight-low = Low
# Keyboard backlight level, shown under its button
backlight-high = High

## Sound

volume-sound-settings = Sound settings
# Screen-reader label of the speaker button on the volume slider (a verb)
volume-mute = Mute
# Screen-reader label of the speaker button on the volume slider (a verb)
volume-unmute = Unmute
# Screen-reader label of the output volume slider
volume-output-slider = Volume
# Header of the sound output menu
volume-output-title = Sound output
# Screen-reader label of the arrow button next to the volume slider
volume-output-open-menu = Open sound output menu
# Screen-reader label of the microphone volume slider
volume-input-slider = Microphone
# Header of the sound input menu
volume-input-title = Sound input
# Screen-reader label of the arrow button next to the microphone slider
volume-input-open-menu = Open sound input menu

## Bluetooth

# Quick settings tile title and menu header
bluetooth-title = Bluetooth
# Screen-reader label of the arrow button next to the Bluetooth tile
bluetooth-open-menu = Open Bluetooth menu
bluetooth-settings = Bluetooth settings
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
network-menu-turn-off = Turn off
# Screen-reader label of a Wi-Fi network. $name is the network name, $strength the signal strength from 0 to 100 (a percentage)
network-menu-wifi-network = { $secure ->
    [yes] { $name }, secure, signal strength { $strength }%
   *[no] { $name }, not secure, signal strength { $strength }%
}
# $name is the name of the Wi-Fi device sharing its connection
network-menu-hotspot = { $name } hotspot
# Shown under a network tile title when several connections are active
network-menu-connected-count = { $count ->
    [one] { $count } connected
   *[other] { $count } connected
}
# Quick settings tile title and menu header
network-menu-vpn = VPN
network-menu-vpn-open-menu = Open VPN menu
network-menu-vpn-settings = VPN settings
# Menu header of the Wi-Fi tile
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Open Wi-Fi menu
# Link to the network settings from the Wi-Fi menu
network-menu-wifi-settings = All networks
network-menu-wired = Wired connections
network-menu-wired-open-menu = Open wired connections menu
network-menu-wired-settings = Wired settings
# Menu header for internet shared from a phone over Bluetooth
network-menu-tethers = Bluetooth tethering
network-menu-tethers-open-menu = Open Bluetooth tethering menu
# Quick settings tile title, "Tether" as in "Bluetooth Tether"
network-menu-tether = Tether
network-menu-tether-settings = Bluetooth settings
network-menu-mobile-connections = Mobile connections
network-menu-mobile-open-menu = Open mobile connections menu
network-menu-mobile-settings = Mobile network settings
# Quick settings tile title, "Mobile" as in "Mobile Broadband"
network-menu-mobile = Mobile
# Quick settings tile title and menu item for a wired network adapter
network-device-wired = Wired
# A network adapter when there are several of the same kind. $kind is its kind, such as Wired; $name is its interface name, such as enp3s0
network-device-named = { $kind } ({ $name })
# Notification title shown when a network needs signing in on a web page
network-menu-sign-in = Sign in to the network
network-menu-failed-title = Connection failed
network-menu-failed-body = Try again.

## Location access dialog

location-dialog-title = Allow location access?
# $appName is the name of the app asking for the location
location-dialog-description = { $appName } wants to know where you are.
location-dialog-info = You can change this anytime in Settings, under Privacy.
# Button
location-dialog-deny = Don’t allow
# Button
location-dialog-grant = Allow

## Thunderbolt notifications

thunderbolt-unknown-title = Unknown Thunderbolt device
thunderbolt-unknown-body = It was connected while you were away. Plug it in again to use it.
thunderbolt-unauthorized-title = Thunderbolt device needs approval
thunderbolt-unauthorized-body = An administrator has to approve it first.
thunderbolt-error-title = The Thunderbolt device couldn’t be approved
# $reason is the system's error message, usually in English
thunderbolt-error-body = Unplug it and plug it in again to retry. Details: { $reason }

## App permission dialog, used when an app asks for access to something

# Default button label when the app doesn't name its own
access-dialog-deny = Don’t allow
# Default button label when the app doesn't name its own
access-dialog-allow = Allow

## Firewall question when an app starts listening for connections from other devices

# Dialog title. $app is the app's name, or a program's name such as python3
firewall-app-title = { $app } wants to accept connections from other devices
firewall-app-body = Devices on your home networks, VPNs and virtual machines could connect to it. If you’re not sure, don’t allow it: { $app } keeps working on this computer.
firewall-app-deny = Don’t allow
firewall-app-allow = Allow

## Display change confirmation

# Dialog title, keep it shorter than 30 characters
display-change-title = Keep these display settings?
display-change-countdown = { $seconds ->
    [one] Your changes will be undone in { $seconds } second
   *[other] Your changes will be undone in { $seconds } seconds
}
# Button, keep short so it isn't cut off
display-change-revert = Revert settings
# Button, keep short so it isn't cut off
display-change-keep = Keep changes

## Drive connected notification

# $driveName is the name of a partition on an external drive
autorun-connected = “{ $driveName }” connected
autorun-ready = The drive is ready to use
# Notification button. $appName is the name of an app
autorun-open-with = Open with { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Slow keys turned on
kbd-a11y-slow-keys-off = Slow keys turned off
kbd-a11y-slow-keys-description = Holding Shift for 8 seconds is the shortcut for slow keys.
kbd-a11y-sticky-keys-on = Sticky keys turned on
kbd-a11y-sticky-keys-off = Sticky keys turned off
kbd-a11y-sticky-keys-on-description = Pressing Shift 5 times in a row is the shortcut for sticky keys.
kbd-a11y-sticky-keys-off-description = Pressing two keys at once, or Shift 5 times in a row, turns off sticky keys.
# Button that keeps the feature that was just turned on
kbd-a11y-leave-on = Leave on
# Button that turns the feature back on after it was just turned off
kbd-a11y-turn-on = Turn on
# Button that turns the feature back off after it was just turned on
kbd-a11y-turn-off = Turn off
# Button that keeps the feature that was just turned off
kbd-a11y-leave-off = Leave off

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = What did you plug in?
audio-device-cancel = Cancel
audio-device-sound-settings = Sound settings
audio-device-headphones = Headphones
audio-device-headset = Headset
audio-device-microphone = Microphone

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Send all keyboard shortcuts to this app?
# $appName is an app name like "Settings"
inhibit-shortcuts-app = Luft’s own shortcuts won’t work while { $appName } has them.
inhibit-shortcuts-unknown-app = Luft’s own shortcuts won’t work while the app has them.
# $title is the title an app gave its window
inhibit-shortcuts-titled-app = Luft’s own shortcuts won’t work while the app showing “{ $title }” has them.
# $shortcut is a keyboard shortcut like "Super+Escape"
inhibit-shortcuts-restore = Press { $shortcut } to get your shortcuts back.
inhibit-shortcuts-deny = Don’t allow
inhibit-shortcuts-allow = Allow

## Unlocking encrypted drives

# Checkbox for VeraCrypt volumes
mount-hidden-volume = Hidden volume
# Checkbox for VeraCrypt volumes
mount-windows-system-volume = Windows system volume
# Checkbox for VeraCrypt volumes that are unlocked with key files
mount-uses-keyfiles = Uses key files
# Keep the <i> tags around the app name. $appName is the disk utility's name
mount-keyfiles-use-app = To unlock a volume that uses key files, use <i>{ $appName }</i> instead
# Keep the <i> tags around the app name
mount-keyfiles-need-app = You need an app like <i>Disks</i> to unlock a volume that uses key files
# Field label: the personal iterations multiplier of a VeraCrypt volume
mount-pim-number = PIM (only if you set one)
mount-pim-invalid = The PIM is a number. Leave it empty if you didn’t set one.
mount-password = Password
mount-remember-password = Remember password
mount-cancel = Cancel
mount-unlock = Unlock
# Button. $appName is the disk utility's name
mount-open-app = Open { $appName }
mount-wrong-password = That didn’t work. Try again.
mount-unlock-failed = Couldn’t unlock the volume
mount-pim-unsupported = This version of Luft can’t unlock volumes that use a PIM.

## Network passwords, asked when connecting needs one

network-agent-auth-required = Password needed
# $networkName is a Wi-Fi network name
network-agent-wifi-rejected = The saved password for “{ $networkName }” didn’t work. Enter it again.
# $networkName is a Wi-Fi network name
network-agent-wifi-secrets = Enter the password for the Wi-Fi network “{ $networkName }”.
network-agent-wps-hint = You can also press the WPS button on your router.
network-agent-wired-title = Sign in to the wired network
network-agent-dsl-title = Sign in to your DSL connection
network-agent-pin-title = SIM PIN needed
network-agent-pin-body = Enter the PIN of your SIM card to use mobile data.
network-agent-vpn-title = VPN password
# $networkName is the name of a network connection
network-agent-password-required = Enter the password to connect to “{ $networkName }”.
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
screenshot-source = Screen capture
# Tooltip and screen-reader label: capture part of the screen
screenshot-area = Select an area
# Tooltip and screen-reader label: capture a whole display
screenshot-screen = Select a display
# Tooltip and screen-reader label: capture one window
screenshot-window = Select a window
# Tooltip
screenshot-take = Take screenshot
# Tooltip
screenshot-record = Record screen
# Tooltip: include the mouse pointer in the capture
screenshot-show-pointer = Show pointer
# Tooltip: after capturing, draw on the screenshot before it's saved
screenshot-draw = Draw on screenshot
# Tooltip of the shutter button, a verb
screenshot-capture = Capture
# Tooltips and screen-reader labels of the tools for drawing on a screenshot
screenshot-markup-pen = Pen
screenshot-markup-highlighter = Highlighter
screenshot-markup-eraser = Eraser
screenshot-markup-crop = Crop
screenshot-markup-undo = Undo
# Tooltip: copy the drawn-on screenshot and save it to Screenshots
screenshot-markup-save = Copy and save
# Screen-reader label of the button that closes the screenshot tool
screenshot-close = Close
# Name of the folder in the home folder where screen recordings are saved
screenshot-screencasts-folder = Screencasts
# File name of a screen recording. $date and $time are filled in when recording starts, like "2013-07-17" and "10-00-46"
screenshot-screencast-file = Screen recording from { $date } { $time }
# Name of the folder in Pictures where screenshots are saved
screenshot-screenshots-folder = Screenshots
# File name of a screenshot. $timestamp is like "2017-05-21 12-24-03"
screenshot-file = Screenshot from { $timestamp }
screenshot-screencast-recorded = Screen recording saved
screenshot-screencast-start-failed = The screen recording couldn’t start
screenshot-screencast-out-of-space = The screen recording stopped because the disk is full
screenshot-screencast-try-again = The screen recording failed. Try again.
screenshot-screencast-failed = The screen recording failed
screenshot-screencast-stopped = The screen recording stopped
# Body of the notification shown when a recording stops because its video was deleted or moved
screenshot-screencast-file-removed = Its video was deleted or moved while recording.
# Body of a failed recording whose video can’t be written to disk
screenshot-screencast-write-failed = The video couldn’t be saved.
screenshot-screencast-view = Click to watch it
# Notification button that opens the file manager at the saved file
screenshot-show-in-rover = Show in Rover
screenshot-captured = Screenshot taken
screenshot-captured-body = Copied to the clipboard

## System updates
# Notification shown when the system found updates by itself
updates-available-title = System updates are available
updates-available-body = Open Settings to download and install them.
# Notification shown when the system downloaded updates by itself and they wait for a restart
updates-ready-title = Updates are ready to install
updates-ready-body = Restart when it suits you to install them.

## Crash reports
# Title when the desktop itself closed and started again
crash-reports-title-desktop = The desktop closed unexpectedly
# Title when one of Luft's apps or named services closed; $app is its name
crash-reports-title-app = { $app } closed unexpectedly
# Names of Luft's background services and helpers, put into crash-reports-title-app at the start of the sentence
crash-reports-name-post = Post
crash-reports-name-search = Search
crash-reports-name-desktop-settings = The desktop’s settings service
crash-reports-name-watchdog = The graphics watchdog
crash-reports-name-accounts = Online accounts
crash-reports-name-firewall = The firewall
crash-reports-name-handwriting = Handwriting recognition
crash-reports-name-keyring = Luft Keyring
crash-reports-name-printers = Printing
crash-reports-name-remote-login = Remote login
crash-reports-name-dictation = Dictation
crash-reports-name-thumbnails = Thumbnails
crash-reports-name-updates = Updates
crash-reports-name-usb-protection = USB protection
crash-reports-name-peek = Peek
crash-reports-name-encryption = Device encryption
# Title when one of Luft's background services or helpers closed and it has no name of its own
crash-reports-title-part = A part of Luft closed unexpectedly
crash-reports-body = A report can help fix this. It never includes your files, what was on the screen, or anything that says who you are.
# Check box: sending now means always sending, not sending means never asking again
crash-reports-remember = Do the same next time without asking
# Button that shows the report itself
crash-reports-contents = What’s in it
crash-reports-dont-send = Don’t send
crash-reports-send = Send
# Title of the window that shows the report
crash-reports-contents-title = What the report says
crash-reports-contents-body = This is exactly what would be sent.
crash-reports-close = Close

## Extensions
# Menu item of an extension's quick settings tile or taskbar button; $name is the extension's name
extension-menu-settings = { $name } settings
# Button that closes a small window an extension opened
extension-popup-close = Close
# Notification title when Kestrel switched an extension off by itself; $name is the extension's name
extension-turned-off-title = { $name } was turned off
extension-turned-off-error = It stopped working. You can turn it on again in Settings.
extension-turned-off-crash = The desktop restarted twice while it was running. You can turn it on again in Settings.
# Notification title when Kestrel took one effect of an extension off the screen by itself; $effect is the effect's name
screen-effect-off-title = { $effect } was turned off
# The effect's shader doesn't work on this computer; $name is the extension's name
screen-effect-off-shader = It doesn’t work with this computer’s graphics. { $name } keeps running without it.
# The effect made the desktop very slow; $name is the extension's name
screen-effect-off-slow = It made the desktop very slow. { $name } keeps running without it.
# Notification after the shortcut turned off everything extensions draw over windows and the screen
screen-effects-off-title = Screen effects are off
screen-effects-off-body = They stay off until you turn them back on.
# Button on that notification
screen-effects-off-action = Turn back on
# Notification after an extension stopped holding notifications back, such as at the end of a work session; $name is the extension's name
extension-held-title = While { $name } held notifications back
# $count is how many notifications came in, $apps lists the apps they came from, such as "Mailman and Chat"
extension-held-body = { $count ->
    [one] One came in from { $apps }
   *[other] { $count } came in from { $apps }
}

## Reviewing changes luft was asked to make, often by an AI agent working for you

# { $count } is how many settings would change
changes-title = { $count ->
    [one] Change this setting?
   *[other] Change these { $count } settings?
}
# { $requester } is the app or program that asked, such as a terminal or an AI agent; { $count } is how many settings would change
changes-asked-by = { $count ->
    [one] { $requester } wants to change this setting.
   *[other] { $requester } wants to change these settings.
}
# { $count } is how many settings would change
changes-asked = { $count ->
    [one] A program wants to change this setting.
   *[other] A program wants to change these settings.
}
changes-administrator = Approving asks for an administrator’s password next.
# A setting with the page of Settings it is on, as Settings' search shows it, such as "Taskbar and Start · Size"
changes-setting = { $page } · { $setting }
# A setting going from its current value to the new one, such as "Off → On"
changes-from-to = { $from } → { $to }
changes-on = On
changes-off = Off
changes-unknown = Not known
changes-decline = Don’t change
changes-approve = Change
