# The name of the extension in Settings and the store
extension-name = Focus
extension-description = A timer in the taskbar for work sessions, with notifications held back until you're done
# Screen-reader name of the taskbar element and the pop-up
focus = Focus

length = Session length
    .description = What a new session starts with. You can pick another before starting
length-15 = 15 minutes
length-25 = 25 minutes
length-45 = 45 minutes
length-60 = 1 hour
length-90 = 1 hour 30 minutes
# Short names of the lengths, on buttons side by side
length-short-15 = 15 min
length-short-25 = 25 min
length-short-45 = 45 min
length-short-60 = 1 h
length-short-90 = 1½ h
hold-notifications = Hold notifications back
    .description = They wait in the notification center until the session ends. Urgent ones still show
soundscapes = Play Soundscapes
    .description = Starts the mix you last chose while a session runs, if Soundscapes is installed
shortcut-toggle = Start or end a session
session = Session
taskbar = Taskbar

start = Start
pause = Pause
resume = Resume
end = End
# Under the timer; $time is a time of day such as 10:45
until = Until { $time }
paused = Paused
# Under the length buttons before a session starts
before-held = Notifications wait until you're done
before-soundscapes = Soundscapes plays while you work
# $count is how many notifications wait so far
waiting = { $count ->
    [one] One notification waiting
   *[other] { $count } notifications waiting
}
# The taskbar while a session runs; $minutes is how many minutes are left
minutes-left = { $minutes } min
# The summary at the end of a session; $minutes is how long it lasted
done-title = { $minutes ->
    [0] Less than a minute of focus
    [one] One minute of focus
   *[other] { $minutes } minutes of focus
}
# $count is how many notifications came in, $apps lists the apps they came from, such as "Mailman and Chat"
done-held = { $count ->
    [one] One notification from { $apps }
   *[other] { $count } notifications from { $apps }
}
done-quiet = No notifications came in
again = Another session
