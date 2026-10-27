## Shared by the dialogs apps open through the desktop portal

# Dialog button
portal-cancel = Cancel
# Dialog button that grants what the app asked for
portal-allow = Allow
# Dialog button (verb)
portal-share = Share

# Stands in for the app's name at the start of a sentence when the asking app can't be identified.
portal-unknown-app-subject = The app
# Stands in for the app's name inside a sentence when the asking app can't be identified, as in "Let the app use this device?".
portal-unknown-app-object = the app

## Choosing an app to open a file or link

# Dialog title. $name is the file name.
portal-app-chooser-open-title = Open “{ $name }”
portal-app-chooser-open-description = Choose an app to open it.
# $kind is the file type as the system describes it, for example "PNG image" or "PDF document".
portal-app-chooser-open-kind = Choose an app to open it ({ $kind }).
portal-app-chooser-title = Choose an app
portal-app-chooser-description = Choose an app to continue.
# $kind is the file type as the system describes it, for example "PNG image" or "PDF document".
portal-app-chooser-kind = Choose an app for this kind of file ({ $kind }).
portal-app-chooser-nothing-installed = No installed app can open this
# Button that opens the app store to search for a suitable app
portal-app-chooser-find = Find an App
# Button (verb): opens the file with the chosen app
portal-app-chooser-open = Open

## Adding a website or app to Start

portal-launcher-website-title = Add this website to your apps?
# $site is a host name such as example.com.
portal-launcher-website-description = { $site } will open in its own window from Start.
portal-launcher-title = Add this to your apps?
portal-launcher-description = { $appName } wants to add an app to Start.
# Label of the field holding the new app's name
portal-launcher-name = Name
# Button (verb)
portal-launcher-add = Add

## Screenshots taken for apps

# File name of a screenshot, without the extension. $date looks like 2026-10-20 14-05-09 and stays as is.
portal-screenshot-file-name = Screenshot { $date }

## Account details

portal-account-title = Share your name and picture with { $appName }?
portal-account-description = { $appName } will see the name and picture of your account.

## Wallpaper

portal-wallpaper-title = Set as your wallpaper?
portal-wallpaper-description = { $appName } wants to change your wallpaper. It's used in light and dark style and on the lock screen.
# Button
portal-wallpaper-set = Set Wallpaper

## USB devices

usb-title = { $count ->
    [one] Let { $appName } use this device?
   *[other] Let { $appName } use these devices?
}
usb-description = { $count ->
    [one] { $appName } will be able to talk to the device directly while it's plugged in.
   *[other] { $appName } will be able to talk to the devices directly while they're plugged in.
}
# Shown in place of the manufacturer's name when the device doesn't report one
usb-unknown-maker = Unknown maker
usb-unknown-device = Unknown device

## Screen sharing, remote control and input capture

screen-share-title = Share your screen with { $appName }?
screen-share-description = { $appName } will be able to see what you choose.
# Section heading above the list of displays
screen-share-screens = Screens
# Section heading above the list of open windows
screen-share-windows = Windows
# Added after a display's resolution to mark the main display
screen-share-main-screen = Main screen
# Name of a display that exists only for sharing, not a physical one
screen-share-virtual-screen = Virtual screen
screen-share-new-virtual-screen = New virtual screen
screen-share-new-virtual-screen-description = An extra screen just for sharing
screen-share-nothing-to-share = There are no open windows to share.
screen-share-remember = Remember my choice
screen-share-remember-description = { $appName } won't have to ask again
screen-share-clipboard = Share the clipboard
screen-share-clipboard-description = Copy and paste in both directions

screen-share-remote-desktop-title = Let { $appName } control your computer?
screen-share-remote-desktop-with-screen = { $appName } will be able to see what you choose and use the devices you allow.
screen-share-remote-desktop-description = { $appName } will be able to use the devices you allow.
# Section heading above the input devices the app may use
screen-share-devices = Devices
screen-share-device-keyboard = Keyboard
screen-share-device-pointer = Mouse and touchpad
screen-share-device-touchscreen = Touchscreen

screen-share-input-capture-title = Let { $appName } take over your keyboard and mouse?
screen-share-input-capture-description = When your pointer reaches the edge of the screen, { $appName } can take over your keyboard and mouse, for example to control another computer.

## Keyboard shortcuts apps register for the whole session

shortcuts-consent-title = Let { $appName } use keyboard shortcuts?
shortcuts-consent-description = These shortcuts reach { $appName } even while you use other apps.
shortcuts-record-title = Shortcuts for { $appName }
# Backspace is the key's name as printed on keyboards.
shortcuts-record-description = Choose a shortcut, then press the keys you want. Backspace clears it.
# Shown in place of a shortcut when none is assigned
shortcuts-not-set = Not set
# Shown on the shortcut button while it waits for a key combination
shortcuts-press-keys = Press keys
# $shortcut is a key combination such as Ctrl+Alt+K.
shortcuts-unusable = { $shortcut } can’t be used
# $shortcut is a key combination such as Ctrl+Alt+K.
shortcuts-taken = { $shortcut } is taken
# Button (verb)
shortcuts-save = Save

## Printing

print-title = Print
print-title-from-app = Print from { $appName }
# Default label of the button that starts printing
print-accept = Print
print-no-printers = No printers are set up.

# Picker heading and field label
print-printer = Printer
print-printer-not-accepting = Not taking documents right now
print-printer-paused = Paused
# Button that leaves a picker and returns to the print options
print-back = Back

# Field label for the number of copies
print-copies = Copies
# Screen-reader label of the minus button next to the number of copies
print-copies-fewer = Fewer copies
# Screen-reader label of the plus button next to the number of copies
print-copies-more = More copies

# Field label: which pages to print
print-pages = Pages
print-pages-all = All
# The page the document is showing right now
print-pages-current = Current
# The pages selected in the document
print-pages-selection = Selection
# Pages typed in by hand, such as 1-3, 5
print-pages-range = Range
# Placeholder. Page ranges are typed with digits, "-" and ",".
print-pages-range-hint = For example 1-3, 5

# Field label and picker heading
print-paper = Paper
# $width and $height are numbers; $height already carries the unit, as in 210 × 297 mm.
print-paper-dimensions = { $width } × { $height }
print-paper-letter = Letter
print-paper-legal = Legal
print-paper-executive = Executive
print-paper-tabloid = Tabloid
print-paper-statement = Statement
# $size is the envelope's standard size code: C5, C6, DL, #10 or Monarch.
print-paper-envelope = Envelope { $size }

print-orientation = Orientation
print-orientation-portrait = Portrait
print-orientation-landscape = Landscape

# Field label for double-sided printing
print-two-sided = Two-sided
# Two-sided printing turned off
print-two-sided-off = Off
# Pages flip along the long edge, like a book
print-two-sided-long-edge = Long edge
# Pages flip along the short edge, like a notepad
print-two-sided-short-edge = Short edge

# Field label
print-color = Color
print-color-mode-color = Color
print-color-mode-monochrome = Black & white
