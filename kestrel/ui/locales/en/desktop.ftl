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
