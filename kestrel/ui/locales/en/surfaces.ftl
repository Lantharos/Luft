## Start

# Placeholder of the search field at the top of Start
start-search-placeholder = Search apps, settings and files
# Context menu of the Start search field
start-search-cut = Cut
start-search-copy = Copy
start-search-paste = Paste
start-search-select-all = Select all
# Screen-reader label of the button that shows the power and session actions
start-power = Power and session
# Screen-reader label of the same button while the power actions are shown
start-power-close = Close power options
# Context menu of the account name at the bottom of Start
start-account-settings = Account settings
# Button that leads from an app folder back to all apps
start-apps = Apps
# Name given to a new folder made by dropping one app onto another
start-folder-default-name = Folder
# Context menu of an app folder; "Open" is a verb
start-folder-open = Open folder
start-folder-rename = Rename
start-folder-ungroup = Ungroup apps
# Context menu entry; "Open" is a verb
start-open = Open
# Context menu of an app inside a folder: moves it back to the main grid
start-move-to-apps = Move to Apps

## Start search results

start-search-best-match = Best match
start-search-no-results = No results
start-search-group-apps = Apps
start-search-group-actions = Actions
start-search-group-settings = Settings
start-search-group-files = Files
# Files whose contents mention the search text
start-search-group-contents = Inside files
# Description of a Settings page in search results
start-search-settings-page = Settings
# Description of a section inside a Settings page; $page is the page title, such as "Appearance"
start-search-settings-section = { $page } settings
# Context menu of a file; $fileManager is the name of the file manager app
start-search-file-reveal = Show in { $fileManager }
start-search-file-copy-path = Copy path
# Description of a unit conversion; $amount and $from are what was typed, $to is the target unit symbol
start-search-conversion = { $amount } { $from } in { $to }
# Description of a calculation result; $expression is what was typed
start-search-calculation = { $expression }, press Enter to copy

## Start search actions
## The keyword messages are comma-separated words people might type to find the action.
## They aren't shown. Keep common English terms in the translation when people would type them too.

start-search-dark-style-on = Switch to dark style
start-search-dark-style-off = Switch to light style
start-search-dark-style-keywords = dark style, dark mode, dark theme, light style, light mode, light theme
start-search-night-light-on = Turn on night light
start-search-night-light-off = Turn off night light
start-search-night-light-keywords = night light, night shift, blue light, warm colors
start-search-do-not-disturb-on = Turn on Do Not Disturb
start-search-do-not-disturb-off = Turn off Do Not Disturb
start-search-do-not-disturb-keywords = do not disturb, dnd, focus, quiet, silence notifications, mute notifications
start-search-wifi-on = Turn on Wi-Fi
start-search-wifi-off = Turn off Wi-Fi
start-search-wifi-keywords = wifi, wi-fi, wireless, wlan
start-search-bluetooth-on = Turn on Bluetooth
start-search-bluetooth-off = Turn off Bluetooth
start-search-bluetooth-keywords = bluetooth
start-search-airplane-mode-on = Turn on airplane mode
start-search-airplane-mode-off = Turn off airplane mode
start-search-airplane-mode-keywords = airplane mode, flight mode, aeroplane mode, radios
start-search-keep-awake-on = Keep awake
start-search-keep-awake-off = Stop keeping awake
start-search-keep-awake-keywords = keep awake, stay awake, caffeine, prevent sleep
start-search-lock-keywords = lock screen, lock computer
start-search-suspend-keywords = sleep, standby
start-search-log-out-keywords = log out, logout, sign out, sign off, end session
start-search-restart-keywords = reboot, restart computer
start-search-power-off-keywords = shut down, shutdown, turn off computer, power down

## Quick settings

# Session actions, shown as buttons in Start and as search results; "Lock" is a verb
quick-settings-lock = Lock
quick-settings-suspend = Suspend
quick-settings-log-out = Log out
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
