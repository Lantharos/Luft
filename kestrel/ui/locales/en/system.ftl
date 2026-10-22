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
# Shown after a program's name in the menu, for example "Terminal · Using your windows"
privacy-windows-using = Using your windows
privacy-windows-seeing = Seeing your windows
# Menu item that takes away a program's access to your windows
privacy-windows-stop = Stop access

## Window access prompt
# A program (often a coding assistant) asks to see or control the windows on the screen. $app is its name.

peek-see-title = { $app } wants to see your windows
peek-see-description = It will be able to take pictures of any window you have open.
peek-use-title = { $app } wants to see and use your windows
peek-use-description = It will be able to see any window you have open, and click and type in it as if it were you.
peek-deny = Don’t allow
peek-allow-once = Allow once
peek-allow-until-quit = Allow until it quits

## Window access errors
# Shown in a terminal to the person or program that ran the peek command. "peek run" and "peek list" are commands and stay as they are.

# $app is the program that asked
peek-error-declined = The person using this computer declined this. { $app } can ask again after it quits.
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
