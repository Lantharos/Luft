# Notification after Luft opened Windows' drive read-only, because Windows was hibernated or shut down with Fast Startup
drives-windows-read-only-title = Windows’ drive is read-only
drives-windows-read-only = Windows wasn’t fully shut down. Shut it down fully to write to its drive.

## Battery notifications

# $level is the battery's charge in percent, as a number
battery-left = { $level }% left.
# $level is the battery's charge in percent, $minutes the minutes the battery lasts
battery-left-minutes = { $level }% left, about { $minutes } min.
# $level is the battery's charge in percent; the battery lasts $hours hours and $minutes minutes
battery-left-hours = { $level }% left, about { $hours } h { $minutes } min.
battery-low-title = Battery low
battery-ups-low-title = UPS battery low
battery-critical-title = Battery almost empty
battery-ups-critical-title = UPS battery almost empty
# $left is the battery-left, battery-left-minutes or battery-left-hours sentence
battery-critical-hibernate = { $left } Plug in now, or the computer will hibernate soon.
# $left is the battery-left, battery-left-minutes or battery-left-hours sentence
battery-critical-suspend = { $left } Plug in now, or the computer will go to sleep soon.
# $left is the battery-left, battery-left-minutes or battery-left-hours sentence
battery-critical-power-off = { $left } Plug in now, or the computer will shut down soon.
battery-saver-title = Power saver is on
battery-saver-body = It makes the battery last until you plug in.
# Button on the battery-saver-title notification
battery-saver-turn-off = Turn off

## Asking what kind of network a new network is

# $network is the name of the Wi-Fi or wired network just joined
network-type-title = Is { $network } a home network?
network-type-body = On a home network, your other devices can find this computer. On a public one, like a café’s, nothing can reach it.
# Button on the network-type-title notification
network-type-home = Home
# Button on the network-type-title notification
network-type-public = Public

## Signing in over SSH

# $address is the other device's address, such as 192.168.1.20
remote-login-signed-in-title = Signed in over SSH from { $address }
# $account is the name of the account that signed in
remote-login-signed-in = { $account } signed in. If you don’t know who that is, disconnect them in Settings.
# Button on the remote-login-signed-in-title notification
remote-login-settings = Settings

## Secure Boot notifications
# Setting up Secure Boot means confirming Luft's signing key on a blue screen after a restart, with an eight-digit code.
# Don't call it a "key", so it isn't confused with the disk's recovery key.

# Shown as the source of the notification
secure-boot-source = Device Security
secure-boot-unfinished-title = Finish setting up Secure Boot
secure-boot-missed = The blue screen shows again when you restart, with the same code Settings shows.
secure-boot-waiting = A blue screen asks for a code the next time you restart. Open Settings to see it.
secure-boot-gave-up = It wasn’t finished after a few restarts. You can set it up in Settings whenever you’re ready.
# Button that opens the steps in Settings
secure-boot-show-steps = Show steps

## Before the computer sleeps on its own

idle-sign-out-title = Signing out soon
idle-sign-out = You'll be signed out because the computer isn't being used.
idle-hibernate-title = Hibernating soon
idle-hibernate = The computer will hibernate because it isn't being used.
idle-sleep-title = Going to sleep soon
idle-sleep = The computer will go to sleep because it isn't being used.

## Why the computer waits, shown wherever the system lists what holds it up

inhibit-lock-before-sleep = The screen locks before the computer sleeps
inhibit-lid-displays = An external monitor is connected or the displays just changed
inhibit-power-saver = Making the battery last
inhibit-power-keys = The desktop decides what the power keys do

## Printing notifications

printer-added = Printer added
# The name of the page Settings prints to test a printer
printer-test-page = Test page
printer-not-taken = The printer didn't take the document

## Disk space and trash notifications

# $name is the drive's name, $free how much room is left, such as 4.2 GB; $trash is yes when there is something in the trash
disk-low-named-title = Low disk space on { $name }
disk-low-named = { $trash ->
    [yes] { $name } has only { $free } left. Emptying the trash can free some up.
   *[no] { $name } has only { $free } left.
}
disk-low-title = Low disk space
disk-low = { $trash ->
    [yes] This computer has only { $free } left. Emptying the trash can free some up.
   *[no] This computer has only { $free } left.
}
# Button that opens Disks
disk-low-examine = Examine
disk-low-empty-trash = Empty Trash
trash-empty-title = Empty the trash?
trash-empty = Everything in it will be deleted for good.
trash-empty-delete = Delete for good
trash-empty-keep = Keep

## USB devices plugged in while locked

usb-unlocked-one-title = { $name } is now available
usb-unlocked-one = It was plugged in while the screen was locked.
usb-unlocked-many-title = { $count ->
    [one] { $count } device is now available
   *[other] { $count } devices are now available
}
usb-unlocked-many = They were plugged in while the screen was locked.

## Time zone

timezone-changed-title = Time zone updated
# $city is the time zone's city, such as Berlin
timezone-changed = Clocks now follow { $city } time.
# $offset is the zone's short name and offset, such as CET, UTC+1
timezone-changed-offset = Clocks now follow { $city } time ({ $offset }).

## Shared

# Button on a notification that opens Settings
notification-settings = Settings
