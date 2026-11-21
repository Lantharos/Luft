-terminal = Terminal

## Tabs

terminal-tabs = Tabs
# A tab whose shell hasn't named its folder or program yet
terminal-tab-untitled = Terminal
terminal-tab-close = Close tab
terminal-tab-new = New tab
terminal-preferences = Preferences
# Shown to Luft while commands still run, such as when shutting down
terminal-activity-running = Running commands

## Finding text in a terminal

terminal-search-find = Find
terminal-search-none = No results
# $index is the match shown, out of $count matches
terminal-search-position = { $index } of { $count }
terminal-search-match-case = Match case
terminal-search-regex = Regular expression
terminal-search-previous = Previous match
terminal-search-next = Next match
terminal-search-close = Close

## The menu of a terminal

terminal-menu-copy = Copy
terminal-menu-paste = Paste
terminal-menu-select-all = Select all
terminal-menu-find = Find
terminal-menu-split-right = Split right
terminal-menu-split-down = Split down
terminal-menu-clear = Clear scrollback
terminal-menu-close = Close

## Closing a terminal that's still running programs

terminal-close-title = Close this terminal?
# $programs lists the programs, such as "vim, top"
terminal-close-description = { $count ->
    [one] { $programs } is still running and will be stopped.
   *[other] { $programs } are still running and will be stopped.
}
terminal-close-cancel = Cancel
terminal-close-confirm = Close

## Pasting text that could do harm

terminal-paste-title = Paste this text?
terminal-paste-control = It contains hidden control characters.
terminal-paste-administrator = It asks for administrator rights.
terminal-paste-destructive = It can delete or overwrite files.
terminal-paste-script = It runs a script downloaded from the internet.
terminal-paste-lines = { $count ->
    [one] It has { $count } line, and each one runs as soon as it is pasted.
   *[other] It has { $count } lines, and each one runs as soon as it is pasted.
}
terminal-paste-cancel = Cancel
terminal-paste-confirm = Paste

## Notifications when a long command ends in a tab you're not looking at

# $duration is how long it ran, such as 2m 5s
terminal-finished = Finished in { $duration }
terminal-failed = Failed after { $duration }

## Preferences

terminal-appearance = Appearance
terminal-style = Style
# Follows the light or dark style of the desktop
terminal-style-desktop = Desktop
terminal-style-light = Light
terminal-style-dark = Dark
terminal-translucent = See-through background
terminal-translucent-pending = Takes effect the next time { -terminal } opens.
terminal-translucent-description = Lets the desktop show through, softly blurred.
terminal-opacity = Background strength
terminal-text-size = Text size
# $size is the text size in points
terminal-text-size-points = { $size } pt
terminal-cursor = Cursor
terminal-cursor-shape = Shape
terminal-cursor-shape-label = Cursor shape
terminal-cursor-block = Block
terminal-cursor-bar = Bar
terminal-cursor-underline = Underline
# Whether the cursor blinks
terminal-cursor-blink = Blink
terminal-behavior = Behavior
terminal-shell = Shell
terminal-shell-description = New tabs and panes start with this shell.
# $shell is the name of the account's shell, such as bash
terminal-shell-default = Default ({ $shell })
# How many lines of output a terminal keeps
terminal-history = History
terminal-history-description = Lines kept to scroll back through.
terminal-history-lines = { $count ->
    [one] { $count } line
   *[other] { $count } lines
}
terminal-copy-on-select = Copy selected text
terminal-clipboard-reads = Let programs read the clipboard
terminal-clipboard-reads-description = Including programs on other computers over SSH.
terminal-done = Done
