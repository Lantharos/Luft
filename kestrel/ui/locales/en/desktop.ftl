## Taskbar

# Screen-reader label of the Start button on the taskbar.
taskbar-start = Start
# Screen-reader label of the status area button that opens quick settings.
taskbar-quick-settings = Quick settings
# Screen-reader label of the clock button that opens notifications and the calendar.
taskbar-notifications-and-date = Notifications and date
# Taskbar right-click menu item and screen-reader label of the corner area that minimizes all windows. "Show" is a verb.
taskbar-show-desktop = Show desktop
# Taskbar right-click menu item that opens the system monitor app.
taskbar-system-monitor = System monitor
taskbar-settings = Taskbar settings
# Menu of the keyboard layout indicator. "Show" is a verb.
taskbar-show-keyboard-layout = Show keyboard layout
taskbar-keyboard-settings = Keyboard settings
# Right-click menu of the quick settings button.
taskbar-network-settings = Network settings
taskbar-sound-settings = Sound settings
# Right-click menu of the clock.
taskbar-date-time-settings = Date and time settings
# Screen-reader label of the thin strip shown in tablet mode instead of the taskbar.
taskbar-show-taskbar = Show taskbar

## App menu (right-click on a taskbar app)

# "Open" is a verb: opens or brings up the app.
window-menu-open = Open
window-menu-new-window = New window
# Verb: restores a minimized window.
window-menu-restore = Restore
window-menu-minimize = Minimize
window-menu-maximize = Maximize
window-menu-unmaximize = Unmaximize
window-menu-pin = Pin to taskbar
window-menu-unpin = Unpin from taskbar
# $count is the number of open windows of the app that this closes.
window-menu-close = { $count ->
    [one] Close window
   *[other] Close all windows
}

## Context menus

# Row at the top of a submenu that goes back to the parent menu.
context-menu-back = Back

## Window previews (hovering a taskbar app)

# Screen-reader label of the close button on a window preview. $title is the window title.
previews-close-window = Close { $title }

## Tray

# Screen-reader label of the taskbar button that lists the background apps' tray icons.
tray-apps = Tray apps
# First item in a tray app's menu. $appName is the app's name. "Open" is a verb.
tray-open-app = Open { $appName }

## Board (tablet window layout)

# Screen-reader label of the corner button that opens Start.
board-open-start = Open Start
# Screen-reader label of the corner button that shows every open window.
board-show-all-windows = Show all windows
# Screen-reader label of the corner pill with the clock and battery.
board-quick-settings = Quick settings

## Task view

# Screen-reader label of the close button on a window card.
task-view-close-window = Close window
# Name of a virtual desktop (workspace). $number counts from 1.
task-view-desktop = Desktop { $number }

## Snap layouts

# Screen-reader label of one area in the snap layouts popup. $width and $height are the percentage of the screen (0 to 100) the window would take; place the percent sign the way your language does.
snap-zone = Snap to { $width }% by { $height }% area

## Window title bars

# Screen-reader labels of the title bar buttons Kestrel draws for apps that don't draw their own.
title-bar-minimize = Minimize
title-bar-maximize = Maximize
title-bar-close = Close

## Window resizing

# Size of a window while it's resized, in pixels
window-resize-size = { $width } × { $height }

## App not responding

# $appName is the name of the app that stopped responding
close-dialog-title = “{ $appName }” isn’t responding
close-dialog-description = You may choose to wait a short while for it to continue or force the app to quit entirely
# Button
close-dialog-force-quit = Force Quit
# Button
close-dialog-wait = Wait

## Display mode switcher, keep each label under about 15 characters

# Show the same picture on every display
switch-monitor-mirror = Mirror
# Spread the desktop across all displays
switch-monitor-join = Join Displays
# Use only the external displays
switch-monitor-external-only = External Only
# Use only the laptop's own display
switch-monitor-built-in-only = Built-in Only

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Windows

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Take Screenshot
# Minimizes the window
title-bar-menu-hide = Hide
# Returns a maximized window to its previous size
title-bar-menu-restore = Restore
title-bar-menu-maximize = Maximize
# Verb: starts moving the window with the keyboard or mouse
title-bar-menu-move = Move
# Verb: starts resizing the window with the keyboard or mouse
title-bar-menu-resize = Resize
title-bar-menu-always-on-top = Always on Top
title-bar-menu-see-through = See-Through
# Keeps the window on every workspace
title-bar-menu-always-on-visible-workspace = Always on Visible Workspace
title-bar-menu-workspace-left = Move to Workspace Left
title-bar-menu-workspace-right = Move to Workspace Right
title-bar-menu-workspace-up = Move to Workspace Up
title-bar-menu-workspace-down = Move to Workspace Down
title-bar-menu-monitor-up = Move to Monitor Up
title-bar-menu-monitor-down = Move to Monitor Down
title-bar-menu-monitor-left = Move to Monitor Left
title-bar-menu-monitor-right = Move to Monitor Right
title-bar-menu-close = Close

## Rain

# Quick settings tile title and menu header, keep short
rain-title = Rain
# Screen-reader label of the arrow button next to the rain tile
rain-open-menu = Open rain menu
# How hard it rains, also shown under the tile title
rain-drizzle = Drizzle
rain-rain = Rain
rain-storm = Storm
# Menu item: whether rain falls over the wallpaper
rain-show = Show on the desktop
# Menu item: whether the sound of rain plays
rain-sound = Sound
# Screen-reader label of the rain volume slider
rain-volume = Rain volume
rain-settings = Rain Settings
