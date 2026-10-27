## Desktop

# Menu shown when right-clicking the desktop.
desktop-menu-wallpaper = Change wallpaper
desktop-menu-display-settings = Display settings
desktop-menu-settings = Settings

## Battery

# Screen-reader label of the battery icon. $percentage is the charge from 0 to 100; write the percent sign the way your language does (e.g. "57 %").
battery-level = { $status ->
    [charging] Battery { $percentage }%, charging
    [full] Battery { $percentage }%, fully charged
    [plugged] Battery { $percentage }%, plugged in
   *[discharging] Battery { $percentage }%
}

## Key names
## Used to build keyboard shortcut labels such as "Ctrl+Alt+T". Use the names printed on keyboards in your language.

keys-super = Super
keys-ctrl = Ctrl
keys-alt = Alt
keys-shift = Shift
keys-meta = Meta
keys-hyper = Hyper
keys-enter = Enter
keys-escape = Esc
keys-space = Space
keys-tab = Tab
keys-backspace = Backspace
keys-delete = Delete
keys-insert = Insert
keys-home = Home
keys-end = End
keys-page-up = Page Up
keys-page-down = Page Down
keys-print-screen = Print Screen

# Shown instead of a time on notifications from the last few minutes
date-just-now = Just now

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

# The taskbar
ctrl-alt-tab-panel = Panel

## System notifications

# Notification shown when a developer tool turns off app sandboxing restrictions
unsafe-mode-title = System was put in unsafe mode
unsafe-mode-body = Apps now have unrestricted access
# Notification button, turns unsafe mode off again
unsafe-mode-undo = Undo
privileged-user-title = Logged in as a privileged user
privileged-user-body = Running a session as a privileged user should be avoided for security reasons. If possible, you should log in as a normal user.

## Starting programs

# Notification title when a program can't be started. $command is the command that failed
spawn-failed = Execution of “{ $command }” failed:

## Text field context menu

entry-menu-copy = Copy
entry-menu-paste = Paste
# Menu item that reveals the characters typed into a password field
entry-menu-show-text = Show Text
# Menu item that hides the characters typed into a password field again
entry-menu-hide-text = Hide Text
# Warning under password fields
entry-caps-lock-on = Caps Lock is on
