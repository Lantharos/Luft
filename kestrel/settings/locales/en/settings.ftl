# Notification after Luft opened Windows' drive read-only, because Windows was hibernated or shut down with Fast Startup
drives-windows-read-only-title = Windows’ drive is read-only
drives-windows-read-only = Windows wasn’t fully shut down, so its drive is read-only. Shut Windows down fully to write to it.

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
battery-critical-suspend = { $left } Plug in now, or the computer will suspend soon.
# $left is the battery-left, battery-left-minutes or battery-left-hours sentence
battery-critical-power-off = { $left } Plug in now, or the computer will shut down soon.
battery-saver-title = Power saver is on
battery-saver-body = It makes the battery last until you plug in.
# Button on the battery-saver-title notification
battery-saver-turn-off = Turn off
