## Notifications from the AppImage sandbox

# Title of a notification; $app is the app's name
sandbox-needs-more = { $app } may need more access
sandbox-closed-body = It closed right after it started, maybe because its sandbox kept it from something it needs.
sandbox-device-body = It tried to use a USB or serial device, which its sandbox keeps from it.
sandbox-display-body = It only works with X11, which lets apps see each other’s windows and typing. You can allow that in Schelf.
sandbox-microphone-body = It tried to use the microphone. You can allow that in Schelf.
sandbox-camera-body = It tried to use a camera. You can allow that in Schelf, then restart it.
# Button on the notification that opens Schelf to give the app more access
sandbox-review = Review access
# Shown when an app can't start because the record of what it may do couldn't be read
sandbox-unreadable = Luft couldn’t read what it’s allowed to do.

## Once you let an app use a drive it looked for

# Title of a notification; $app is the app's name and $drive the drive's name
sandbox-drive-given = { $app } can use { $drive }
# Title of the same notification for a drive without a name
sandbox-drive-given-unnamed = { $app } can use the drive
sandbox-drive-restart-body = It sees the drive once it opens again.
# Button on that notification that closes the app and opens it again
sandbox-restart = Restart
