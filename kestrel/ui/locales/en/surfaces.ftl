## Gust
## Gust is the name of what Super opens: a panel next to the taskbar or a search bar. Keep it as is.

# Placeholder of the search field at the top of Gust
gust-search-placeholder = Search apps, files and more
# Context menu of the Gust search field
gust-search-cut = Cut
gust-search-copy = Copy
gust-search-paste = Paste
gust-search-select-all = Select all
# Screen-reader label of the button that shows the power and session actions
gust-power = Power and session
# Screen-reader label of the same button while the power actions are shown
gust-power-close = Close power options
# Context menu of the account name at the bottom of Gust
gust-account-settings = Account settings
# Button that leads from an app folder back to the pinned apps, and screen-reader label of the button that leads from all apps back to them
gust-pinned = Pinned
# Screen-reader label and hint of the button next to the search field that lists every app
gust-all-apps = All apps
# Shown in place of the pinned apps when none are pinned
gust-no-pins = No pinned apps
# Context menu of an app in Gust
gust-pin = Pin to Gust
gust-unpin = Unpin from Gust
# Name given to a new folder made by dropping one app onto another
gust-folder-default-name = Folder
# Context menu of an app folder; "Open" is a verb
gust-folder-open = Open folder
gust-folder-rename = Rename
gust-folder-ungroup = Ungroup apps
# Context menu entry; "Open" is a verb
gust-open = Open
# Context menu of an app inside a folder: moves it back to the pinned apps
gust-move-out-of-folder = Move out of folder

## Categories of apps in the palette look of Gust

gust-category-all = All
# Lists the open windows
gust-category-open = Open
gust-category-office = Productivity
gust-category-graphics = Graphics & Photos
gust-category-audiovideo = Audio & Video
gust-category-game = Games
gust-category-development = Developer Tools
gust-category-education = Education
gust-category-science = Science
gust-category-network = Internet
gust-category-utility = Utilities
gust-category-system = System

## Gust search results

gust-search-best-match = Best match
gust-search-group-apps = Apps
# Actions an app offers in its menu, such as "New private window"
gust-search-group-commands = App actions
gust-search-group-windows = Open windows
gust-search-group-actions = Actions
gust-search-group-settings = Settings
gust-search-group-clipboard = Clipboard
gust-search-group-emoji = Emoji
gust-search-group-files = Files
# Files whose contents mention the search text
gust-search-group-contents = Inside files
gust-search-group-web = Web
# $query is what was typed
gust-search-web = Search the web for “{ $query }”
# Description of something copied earlier, found in the clipboard history
gust-search-clipboard-text = From the clipboard history
# Comma-separated words people might type to list what they copied. They aren't shown
gust-search-clipboard-keywords = clipboard, copied, clipboard history, paste
# Context menu of an emoji: puts it where you're typing
gust-search-emoji-insert = Insert
# Description of a Settings page in search results
gust-search-settings-page = Settings
# Description of a section inside a Settings page; $page is the page title, such as "Appearance"
gust-search-settings-section = { $page } settings
# Context menu of a file; $fileManager is the name of the file manager app
gust-search-file-reveal = Show in { $fileManager }
gust-search-file-copy-path = Copy path
# Description of a unit conversion; $amount and $from are what was typed, $to is the target unit symbol
gust-search-conversion = { $amount } { $from } in { $to }
# Description of a calculation result; $expression is what was typed
gust-search-calculation = { $expression }, press Enter to copy

## Answers in Gust's search to questions about dates and times.
## The answer itself, such as "157 days" or "17:00", is formatted for the language; these describe it.

# $date is a date, such as "27 March 2027"
gust-search-answer-until = Until { $date }
gust-search-answer-since = Since { $date }
gust-search-answer-between = Between { $from } and { $to }
# The time somewhere else compared with here; $place is a city as typed, such as "Tokyo"
gust-search-answer-time-ahead = { $place }, { $hours ->
    [one] { $hours } hour
   *[other] { $hours } hours
} ahead
gust-search-answer-time-behind = { $place }, { $hours ->
    [one] { $hours } hour
   *[other] { $hours } hours
} behind
gust-search-answer-time-same = { $place }, the same time as here
# Describes a converted time: the answer is the time in $place when it's $time in $from, such as "In New York when it's 22:00 in London"
gust-search-answer-converted = In { $place } when it’s { $time } in { $from }
gust-search-answer-converted-here = Here when it’s { $time } in { $from }
gust-search-answer-converted-from-here = In { $place } when it’s { $time } here

## Gust search actions
## The keyword messages are comma-separated words people might type to find the action.
## They aren't shown. Keep common English terms in the translation when people would type them too.

gust-search-dark-style-on = Switch to dark style
gust-search-dark-style-off = Switch to light style
gust-search-dark-style-keywords = dark style, dark mode, dark theme, light style, light mode, light theme
gust-search-night-light-on = Turn on night light
gust-search-night-light-off = Turn off night light
gust-search-night-light-keywords = night light, night shift, blue light, warm colors
gust-search-do-not-disturb-on = Turn on Do Not Disturb
gust-search-do-not-disturb-off = Turn off Do Not Disturb
gust-search-do-not-disturb-keywords = do not disturb, dnd, focus, quiet, silence notifications, mute notifications
gust-search-wifi-on = Turn on Wi-Fi
gust-search-wifi-off = Turn off Wi-Fi
gust-search-wifi-keywords = wifi, wi-fi, wireless, wlan
gust-search-bluetooth-on = Turn on Bluetooth
gust-search-bluetooth-off = Turn off Bluetooth
gust-search-bluetooth-keywords = bluetooth
gust-search-airplane-mode-on = Turn on airplane mode
gust-search-airplane-mode-off = Turn off airplane mode
gust-search-airplane-mode-keywords = airplane mode, flight mode, aeroplane mode, radios
gust-search-keep-awake-on = Keep awake
gust-search-keep-awake-off = Stop keeping awake
gust-search-keep-awake-keywords = keep awake, stay awake, caffeine, prevent sleep
gust-search-lock-keywords = lock screen, lock computer
gust-search-suspend-keywords = sleep, suspend, standby
gust-search-log-out-keywords = log out, logout, sign out, sign off, end session
gust-search-restart-keywords = reboot, restart computer
gust-search-power-off-keywords = shut down, shutdown, turn off computer, power down

## Quick settings

# Session actions, shown as buttons in Gust and as search results; "Lock" is a verb
quick-settings-lock = Lock
quick-settings-suspend = Sleep
quick-settings-log-out = Sign out
quick-settings-restart = Restart
quick-settings-power-off = Power off
quick-settings-screenshot = Screenshot
quick-settings-settings = Settings
quick-settings-battery = Battery
# Battery level shown as the title of the battery tile; $percent is already formatted as a percentage, such as "57%"
quick-settings-battery-level = { $percent }
quick-settings-battery-charging = Charging
# $duration is a short time span, such as "1 h 20 min"
quick-settings-battery-until-full = { $duration } until full
quick-settings-battery-left = { $duration } left
quick-settings-battery-discharging = On battery
quick-settings-battery-full = Fully charged
quick-settings-battery-plugged-in = Plugged in
# Subtitle of a toggle tile without its own status
quick-settings-on = On
quick-settings-off = Off
# Screen-reader label of the arrow on a tile that opens its options
quick-settings-show-options = Show options
# Value shown above a slider while it moves; $percent is already formatted as a percentage, such as "40%"
quick-settings-slider-value = { $percent }
# Context menu of a tile
quick-settings-tile-settings = Settings
quick-settings-tile-remove = Remove
# Context menu of the quick settings panel: "Add" opens a list of removed tiles
quick-settings-add = Add
quick-settings-reset = Reset

## Notifications

notifications-title = Notifications
notifications-clear-all = Clear all
# Context menu of the notification center
notifications-clear-everything = Clear all notifications
notifications-lock-screen-content = Show message content on the lock screen
notifications-settings = Notification settings
# Screen-reader label; $app is the name of the app that sent the notifications
notifications-clear-app = Clear notifications from { $app }
# Button that expands a group of notifications; $count is how many are hidden
notifications-more = { $count ->
    [one] { $count } more
   *[other] { $count } more
}
notifications-show-less = Show less
# Screen-reader label of the close button on a notification
notifications-dismiss-notification = Dismiss notification
# Context menu of a notification; "Open" is a verb
notifications-open = Open
notifications-dismiss = Dismiss
# Screen-reader label of the button that sends a typed reply
notifications-send-reply = Send reply
# Screen-reader labels of the media player controls
notifications-media-previous = Previous track
notifications-media-next = Next track
notifications-media-play = Play
notifications-media-pause = Pause
# Shown in a notification's header when the app that sent it has no name
messages-unknown-app = Unknown app
# Button that opens the reply field on a notification
messages-reply = Reply
# Placeholder of the reply field on a notification
messages-reply-placeholder = Write a reply
# Screen-reader label of the button that sends a reply from a notification
messages-reply-send = Send

## Calendar

# Screen-reader labels of the arrows next to the month
calendar-previous-month = Previous month
calendar-next-month = Next month
# $month is the month and year, such as "March 2026"; $week is the week number of the year
calendar-month-week = { $month }, week { $week }

## Clipboard history

clipboard-clear-all = Clear all
# Screen-reader label of an image in the clipboard history; $width and $height are in pixels
clipboard-image = Image, { $width } × { $height }
# Context menu of a clipboard entry; "Copy" puts the entry back on the clipboard
clipboard-paste = Paste
clipboard-copy = Copy
clipboard-remove = Remove

## Emoji picker

emoji-search = Search
emoji-no-results = No results
emoji-recently-used = Recently used
# Emoji categories, shown as tab tooltips and section headings
emoji-smileys = Smileys and emotion
emoji-people = People and body
emoji-nature = Animals and nature
emoji-food = Food and drink
emoji-activities = Activities
emoji-travel = Travel and places
emoji-objects = Objects
emoji-symbols = Symbols
emoji-flags = Flags
# Japanese-style text faces, such as ¯\_(ツ)_/¯
emoji-kaomoji = Kaomoji
emoji-skin-tone = Skin tone
emoji-skin-tone-default = Default skin tone
emoji-skin-tone-light = Light skin tone
emoji-skin-tone-medium-light = Medium-light skin tone
emoji-skin-tone-medium = Medium skin tone
emoji-skin-tone-medium-dark = Medium-dark skin tone
emoji-skin-tone-dark = Dark skin tone

## System notifications

# Name shown on notifications that come from the system itself
messages-system-source = System

## On-screen keyboard

osk-keyboard-settings = Keyboard settings
# Key on the emoji page of the on-screen keyboard that goes back to the letters, keep very short
osk-letters-key = ABC

## Media player controls

mpris-unknown-artist = Unknown artist
mpris-unknown-title = Unknown title
