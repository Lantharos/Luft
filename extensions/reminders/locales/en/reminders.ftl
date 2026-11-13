# The name of the extension in Settings and the store
extension-name = Reminders
extension-description = Birthdays, to-dos and goals in the taskbar, with notifications that come back until you answer them
# Screen-reader name of the taskbar element and the pop-up, and the heading in Start's search
reminders = Reminders
shortcut-open = Open Reminders

# Settings
section-reminding = Reminding you
section-birthdays = Birthdays and anniversaries
section-goals = Goals
section-taskbar = Taskbar
section-calendars = Calendars
section-calendars-note = Your reminders stay on this computer unless you export them
morning = Time for things with no time
    .description = When a birthday or anything else with only a date rings
morning-7 = 7:00
morning-8 = 8:00
morning-9 = 9:00
morning-10 = 10:00
morning-12 = Noon
snooze = Snooze for
minutes-5 = 5 minutes
minutes-10 = 10 minutes
minutes-15 = 15 minutes
minutes-30 = 30 minutes
minutes-60 = 1 hour
come-back = Come back until answered
    .description = Dismissing a reminder doesn't count as an answer
come-back-every = Come back every
birthday-heads-up = Heads-up
    .description = How long before a birthday or anniversary to tell you
heads-up-0 = None
heads-up-1 = 1 day before
heads-up-3 = 3 days before
heads-up-7 = 1 week before
heads-up-14 = 2 weeks before
goal-nudges = Nudge me about overdue goals
    .description = A gentle note in the morning once a goal has passed its date
goal-nudge-every = How often
nudge-1-day = Every day
nudge-3-days = Every 3 days
nudge-7-days = Every week
goal-humour = A bit of humour
taskbar-shows = Show in the taskbar
    .description = How many are due always comes first
taskbar-shows-next = What's next
taskbar-shows-due = How many are due
taskbar-shows-icon = Only the icon
taskbar-next-within = How far ahead
taskbar-next-today = Only today
taskbar-next-week = The coming week
import = Import
import-note = Past events are left out, and importing a file twice changes nothing
import-button = Import .ics
import-title = Import a calendar
# $count is how many were added or updated, $skipped how many were left out
import-done = { $count ->
    [one] One reminder imported
   *[other] { $count } reminders imported
}{ $skipped ->
    [0] {""}
    [one] , one left out
   *[other] , { $skipped } left out
}
export = Export
export-note = Every open reminder, as a file calendar apps can read
export-button = Export .ics
export-title = Export reminders
export-done = Your reminders were saved

# The pop-up
add = Add a reminder
add-placeholder = dentist tuesday 3pm
add-button = Add
preview-untitled = What's it about?
preview-no-date = No date, kept as a to-do
preview-goal = A goal: shows how overdue it gets
# $days is how many days before it's due
preview-heads-up = { $days ->
    [one] A heads-up the day before
   *[other] A heads-up { $days } days before
}
overdue = Overdue
today = Today
tomorrow = Tomorrow
yesterday = Yesterday
upcoming = Upcoming
no-date-section = To do
no-date = No date
empty = Nothing to remember. Enjoy it.
# $count is how many more there are to show
show-more = Show { $count } more
# $title is the reminder; for screen readers on the circle in front of it
mark-done = Mark { $title } as done
undo = Undo
done-note = { $title } is done
deleted-note = { $title } was deleted
edit = Edit
delete = Delete
# On a small button; $minutes is the length of a snooze
snooze-short = { $minutes } min
snooze-hour = 1 hour
snooze-tomorrow = Tomorrow
# $time is when a snoozed reminder returns, such as "Today at 15:10"
snoozed-until = Snoozed until { $time }
# $day is a day such as Tuesday, $time a time of day
day-at = { $day } at { $time }
# In the taskbar under the pointer; $count is how many are due
more-due = { $count } due

# How often something repeats
repeat-days = { $every ->
    [one] Every day
   *[other] Every { $every } days
}
repeat-weeks = { $every ->
    [one] Every week
   *[other] Every { $every } weeks
}
repeat-months = { $every ->
    [one] Every month
   *[other] Every { $every } months
}
repeat-years = { $every ->
    [one] Every year
   *[other] Every { $every } years
}
repeat-working-days = Every weekday
# $days lists weekdays, such as "Monday and Thursday"
repeat-on = Every { $days }
repeat-weeks-on = Every { $every } weeks on { $days }
# $date is a day of the month, shown as 1st, 2nd and so on
repeat-month-date = Every month on the { NUMBER($date, type: "ordinal") ->
    [one] { $date }st
    [two] { $date }nd
    [few] { $date }rd
   *[other] { $date }th
}
# $date is a date such as 14 March
repeat-year-date = Every year on { $date }
# $nth is 1 to 4, $day a weekday
repeat-nth-weekday = The { NUMBER($nth, type: "ordinal") ->
    [one] { $nth }st
    [two] { $nth }nd
    [few] { $nth }rd
   *[other] { $nth }th
} { $day } of every month
repeat-last-weekday = The last { $day } of every month

# Editing a reminder
edit-title = What
edit-when = When
edit-when-placeholder = tuesday 3pm
kind-reminder = Reminder
kind-birthday = Birthday
kind-goal = Goal
repeat-none = Once
repeat-daily = Daily
repeat-weekly = Weekly
repeat-monthly = Monthly
repeat-yearly = Yearly
repeat-custom = Custom
repeat-custom-placeholder = every 2 weeks
heads-up-how-soon = Heads-up
nudge-how-often = Nudge me
never = Never
# $days is a number of days
every-days = { $days ->
    [one] Daily
   *[other] { $days } days
}
days-before = { $days ->
    [one] 1 day
   *[other] { $days } days
}
come-back-switch = Come back until answered
cancel = Cancel
save = Save

# Notifications
done = Done
open = Open
not-today = Not today
snooze-for = { $minutes ->
    [one] Snooze 1 minute
   *[other] Snooze { $minutes } minutes
}
# $title is the reminder that came back
notice-again = Still waiting: { $title }
# $when is when it was due, $count how many times it has rung
notice-again-body = { $when } · reminded { $count ->
    [one] once
   *[other] { $count } times
} so far
# $title is the reminder a heads-up is about
notice-coming = Coming up: { $title }
# For a reminder that was missed while the computer was off or asleep; $when is when it was due
notice-missed = Missed: { $when }
notice-birthday = Today's the day
notice-deadline = Today's the date you set
notice-many = { $count } reminders are waiting
# $titles lists the first few, $more how many others there are
notice-many-body = { $more ->
    [one] { $titles } and one more
   *[other] { $titles } and { $more } more
}
# How long a goal is past its date; $days is a number of days
goal-over = { $days ->
    [one] 1 day overdue
   *[other] { $days } days overdue
}
nudge-1 = It's still here, and so are you, which is a good start
nudge-2 = Five minutes on it counts
nudge-3 = Deadlines are only a suggestion from past you
nudge-4 = No rush. Well, a small rush
nudge-5 = Past you had big plans. Present you can have a snack first
nudge-6 = Moving the date is allowed, and nobody will know

# Start's search; $title is what would be added
search-add = Add reminder: { $title }

expand-on-hover = Show more on hover
    .description = Shows what's next
