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
