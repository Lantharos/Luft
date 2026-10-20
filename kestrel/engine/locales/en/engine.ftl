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

## Window resizing

# Size of a window while it's resized, in pixels
window-resize-size = { $width } × { $height }

## App not responding

# $appName is the name of the app that stopped responding
close-dialog-title = “{ $appName }” isn’t responding
close-dialog-description = You may choose to wait a short while for it to continue or force the app to quit entirely
# Button
close-dialog-force-quit = Force Quit
# Button
close-dialog-wait = Wait

## Display mode switcher, keep each label under about 15 characters

# Show the same picture on every display
switch-monitor-mirror = Mirror
# Spread the desktop across all displays
switch-monitor-join = Join Displays
# Use only the external displays
switch-monitor-external-only = External Only
# Use only the laptop's own display
switch-monitor-built-in-only = Built-in Only

## Sign-in prompt

# Placeholder of the password field
auth-prompt-password = Password
# Placeholder of the user name field
auth-prompt-username = Username
# Screen-reader label of the back arrow button
auth-prompt-back = Back
# Screen-reader label of the button that submits the password
auth-prompt-submit = Submit
auth-prompt-wrong-password = That password didn’t work
auth-prompt-failed = That didn’t work. Try again.
fingerprint-not-recognized = Fingerprint not recognized

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

## Administrator authentication

polkit-title = Authentication Required
# Shown instead of the user name "root"
polkit-administrator = Administrator
polkit-password = Password
polkit-cancel = Cancel
# Button
polkit-authenticate = Authenticate
# Shown when the password or other authentication was wrong
polkit-failed = Sorry, that didn’t work. Please try again.

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

## Log out, power off and restart dialog

# Dialog title. $userName is the person's full name
end-session-log-out-user = Log Out { $userName }
# Dialog title
end-session-log-out-title = Log Out
# $userName is the person's full name
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } will be logged out automatically in { $seconds } second
   *[other] { $userName } will be logged out automatically in { $seconds } seconds
}
end-session-log-out-countdown = { $seconds ->
    [one] You will be logged out automatically in { $seconds } second
   *[other] You will be logged out automatically in { $seconds } seconds
}
# Button
end-session-log-out-button = Log Out
# Dialog title
end-session-power-off-title = Power Off
# Dialog title when updates are installed before powering off
end-session-power-off-updates-title = Install Updates & Power Off
end-session-power-off-countdown = { $seconds ->
    [one] The system will power off automatically in { $seconds } second
   *[other] The system will power off automatically in { $seconds } seconds
}
# Button
end-session-power-off-button = Power Off
# Dialog title
end-session-restart-title = Restart
# Dialog title when updates are installed before restarting
end-session-restart-updates-title = Install Updates & Restart
end-session-restart-countdown = { $seconds ->
    [one] The system will restart automatically in { $seconds } second
   *[other] The system will restart automatically in { $seconds } seconds
}
# Button
end-session-restart-button = Restart
# Dialog title
end-session-update-restart-title = Restart & Install Updates
end-session-update-restart-countdown = { $seconds ->
    [one] The system will automatically restart and install updates in { $seconds } second
   *[other] The system will automatically restart and install updates in { $seconds } seconds
}
# Button
end-session-update-restart-button = Restart & Install
# Checkbox
end-session-install-updates = Install pending software updates
# Checkbox. $version is the system version the update installs
end-session-install-version = Install version { $version }
end-session-low-battery = Low battery power: please plug in before installing updates
end-session-busy-apps = Some applications are busy or have unsaved work
end-session-other-users = Other users are logged in
end-session-cancel = Cancel
# Button shown in place of Restart while Alt is held; restarts into the boot menu
end-session-boot-options = Boot Options
# A user signed in from another computer, for example over SSH. $userName is their name
end-session-remote-user = { $userName } (remote)
# A user signed in on a text console. $userName is their name
end-session-console-user = { $userName } (console)

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

## Lock screen clock

# Hint under the lock screen clock on touch screens
lock-clock-swipe-up = Swipe up
# Hint under the lock screen clock with a mouse or keyboard
lock-clock-click-or-press = Click or press a key

## Notification times

# Shown instead of a time on notifications from the last few minutes
date-just-now = Just now

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Windows
# The taskbar
ctrl-alt-tab-panel = Panel
# The lock screen's sign-in prompt
ctrl-alt-tab-unlock = Unlock Window

## System notifications

# Name shown on notifications that come from the system itself
messages-system-source = System
# Notification shown when a developer tool turns off app sandboxing restrictions
unsafe-mode-title = System was put in unsafe mode
unsafe-mode-body = Apps now have unrestricted access
# Notification button, turns unsafe mode off again
unsafe-mode-undo = Undo
privileged-user-title = Logged in as a privileged user
privileged-user-body = Running a session as a privileged user should be avoided for security reasons. If possible, you should log in as a normal user.

## On-screen keyboard

osk-keyboard-settings = Keyboard Settings
# Key on the emoji page of the on-screen keyboard that goes back to the letters, keep very short
osk-letters-key = ABC

## Lock screen

# Reason given to the system for delaying sleep until the screen is locked, shown by tools that list what delays sleep
lock-inhibit-reason = Kestrel needs to lock the screen

## Notifications

# Shown in a notification's header when the app that sent it has no name
messages-unknown-app = Unknown App
# Button that opens the reply field on a notification
messages-reply = Reply
# Placeholder of the reply field on a notification
messages-reply-placeholder = Write a reply
# Screen-reader label of the button that sends a reply from a notification
messages-reply-send = Send

## Media player controls

mpris-unknown-artist = Unknown artist
mpris-unknown-title = Unknown title

## Starting programs

# Notification title when a program can't be started. $command is the command that failed
spawn-failed = Execution of “{ $command }” failed:

## Text field context menu

entry-menu-copy = Copy
entry-menu-paste = Paste
# Menu item that reveals the characters typed into a password field
entry-menu-show-text = Show Text
# Menu item that hides the characters typed into a password field again
entry-menu-hide-text = Hide Text
# Warning under password fields
entry-caps-lock-on = Caps Lock is on

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Take Screenshot
# Minimizes the window
title-bar-menu-hide = Hide
# Returns a maximized window to its previous size
title-bar-menu-restore = Restore
title-bar-menu-maximize = Maximize
# Verb: starts moving the window with the keyboard or mouse
title-bar-menu-move = Move
# Verb: starts resizing the window with the keyboard or mouse
title-bar-menu-resize = Resize
title-bar-menu-always-on-top = Always on Top
# Keeps the window on every workspace
title-bar-menu-always-on-visible-workspace = Always on Visible Workspace
title-bar-menu-workspace-left = Move to Workspace Left
title-bar-menu-workspace-right = Move to Workspace Right
title-bar-menu-workspace-up = Move to Workspace Up
title-bar-menu-workspace-down = Move to Workspace Down
title-bar-menu-monitor-up = Move to Monitor Up
title-bar-menu-monitor-down = Move to Monitor Down
title-bar-menu-monitor-left = Move to Monitor Left
title-bar-menu-monitor-right = Move to Monitor Right
title-bar-menu-close = Close

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
