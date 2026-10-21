## Window title bar buttons (screen-reader labels)

ui-window-minimize = Minimize
ui-window-maximize = Maximize
# Closes the window
ui-window-close = Close

## Text editing context menu

ui-edit-cut = Cut
ui-edit-copy = Copy
ui-edit-paste = Paste
ui-edit-select-all = Select All

## Form controls

# Shown in a dropdown before anything is chosen
ui-select-placeholder = Choose
# Button that reveals the typed password (screen-reader label)
ui-password-show = Show password
ui-password-hide = Hide password
# Button that closes a notification bubble (screen-reader label)
ui-toast-dismiss = Dismiss

## Media playback controls

ui-media-play = Play
ui-media-pause = Pause
ui-media-mute = Mute
ui-media-unmute = Unmute
# Slider label (screen readers)
ui-media-volume = Volume
# Seek bar label (screen readers): the current playback position
ui-media-position = Position

## Pictures in documents

ui-remote-images-hidden = Pictures from the web are hidden
# Button that loads the hidden pictures
ui-remote-images-show = Show

## Splitting a drive between Windows and Luft

# Slider label (screen readers)
ui-split-space = Space for Luft
# $size is how much space Windows keeps, $used how much of it holds files, both like "120 GB"
ui-split-windows-size = { $size }, { $used } used

## Recovery key

# $key is the recovery key itself, read out by screen readers
ui-recovery-key-label = Recovery key { $key }
ui-recovery-key-save = Save to a file
# Button, verb
ui-recovery-key-print = Print
# Button, verb
ui-recovery-key-copy = Copy
# Shown after the key was saved to a file
ui-recovery-key-saved = Saved
ui-recovery-key-printing = Sent to the printer
# Shown after the key was copied to the clipboard
ui-recovery-key-copied = Copied

## Fingerprints
## Each finger has a name used as a title (the message value) and a form used inside
## a sentence (.inline), like "Place your … on the sensor." Adjust the case of .inline
## to fit those sentences.

ui-finger-right-index = Right index finger
    .inline = right index finger
ui-finger-left-index = Left index finger
    .inline = left index finger
ui-finger-right-thumb = Right thumb
    .inline = right thumb
ui-finger-left-thumb = Left thumb
    .inline = left thumb
ui-finger-right-middle = Right middle finger
    .inline = right middle finger
ui-finger-left-middle = Left middle finger
    .inline = left middle finger
ui-finger-right-ring = Right ring finger
    .inline = right ring finger
ui-finger-left-ring = Left ring finger
    .inline = left ring finger
ui-finger-right-little = Right little finger
    .inline = right little finger
ui-finger-left-little = Left little finger
    .inline = left little finger

# $finger is the .inline form of a finger name, like "right index finger"
ui-fingerprint-place = Place your { $finger } on the sensor.
# For readers you swipe across instead of touch. $finger is the .inline form of a finger name
ui-fingerprint-swipe = Swipe your { $finger } across the sensor.
ui-fingerprint-stage-passed = Good. Lift your finger, then place it again.
ui-fingerprint-stage-passed-swipe = Good. Swipe again.
ui-fingerprint-retry = That didn’t read well. Try again.
ui-fingerprint-swipe-too-short = Swipe a little slower.
ui-fingerprint-not-centered = Center your finger on the sensor.
ui-fingerprint-remove-and-retry = Lift your finger and try again.
ui-fingerprint-added = Fingerprint added.
ui-fingerprint-full = The reader has no room left for another fingerprint.
ui-fingerprint-disconnected = The fingerprint reader stopped answering. Try again in a moment.
ui-fingerprint-duplicate = The reader already has this finger saved, probably by Windows or another account. Use a different finger.
ui-fingerprint-failed = Couldn’t add this fingerprint. Try again.

## Sizes and times

# A moment ago, used instead of "0 seconds ago"
ui-time-just-now = just now
# Electrical power. $watts is an already formatted number, like "4.5"
ui-power-watts = { $watts } W

## Dialog buttons

ui-dialog-cancel = Cancel
