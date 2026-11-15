-tern = Tern

## Tabs

tern-tabs = Tabs
# A tab whose shell hasn't named its folder or program yet
tern-tab-untitled = Terminal
tern-tab-close = Close tab
tern-tab-new = New tab
tern-preferences = Preferences
# Shown to Luft while commands still run, such as when shutting down
tern-activity-running = Running commands

## Finding text in a terminal

tern-search-find = Find
tern-search-none = No results
# $index is the match shown, out of $count matches
tern-search-position = { $index } of { $count }
tern-search-match-case = Match case
tern-search-regex = Regular expression
tern-search-previous = Previous match
tern-search-next = Next match
tern-search-close = Close

## The menu of a terminal

tern-menu-copy = Copy
tern-menu-paste = Paste
tern-menu-select-all = Select all
tern-menu-find = Find
tern-menu-split-right = Split right
tern-menu-split-down = Split down
tern-menu-clear = Clear scrollback
tern-menu-close = Close

## Closing a terminal that's still running programs

tern-close-title = Close this terminal?
# $programs lists the programs, such as "vim, top"
tern-close-description = { $count ->
    [one] { $programs } is still running and will be stopped.
   *[other] { $programs } are still running and will be stopped.
}
tern-close-cancel = Cancel
tern-close-confirm = Close

## Pasting text that could do harm

tern-paste-title = Paste this text?
tern-paste-control = It contains hidden control characters.
tern-paste-administrator = It asks for administrator rights.
tern-paste-destructive = It can delete or overwrite files.
tern-paste-script = It runs a script downloaded from the internet.
tern-paste-lines = { $count ->
    [one] It has { $count } line, and each one runs as soon as it is pasted.
   *[other] It has { $count } lines, and each one runs as soon as it is pasted.
}
tern-paste-cancel = Cancel
tern-paste-confirm = Paste

## Notifications when a long command ends in a tab you're not looking at

# $duration is how long it ran, such as 2m 5s
tern-finished = Finished in { $duration }
tern-failed = Failed after { $duration }

## Preferences

tern-appearance = Appearance
tern-style = Style
# Follows the light or dark style of the desktop
tern-style-desktop = Desktop
tern-style-light = Light
tern-style-dark = Dark
tern-translucent = See-through background
tern-translucent-pending = Takes effect the next time { -tern } opens.
tern-translucent-description = Lets the desktop show through, softly blurred.
tern-opacity = Background strength
tern-text-size = Text size
# $size is the text size in points
tern-text-size-points = { $size } pt
tern-cursor = Cursor
tern-cursor-shape = Shape
tern-cursor-shape-label = Cursor shape
tern-cursor-block = Block
tern-cursor-bar = Bar
tern-cursor-underline = Underline
# Whether the cursor blinks
tern-cursor-blink = Blink
tern-behavior = Behavior
tern-shell = Shell
tern-shell-description = New tabs and panes start with this shell.
# $shell is the name of the account's shell, such as bash
tern-shell-default = Default ({ $shell })
# How many lines of output a terminal keeps
tern-history = History
tern-history-description = Lines kept to scroll back through.
tern-history-lines = { $count ->
    [one] { $count } line
   *[other] { $count } lines
}
tern-copy-on-select = Copy selected text
tern-clipboard-reads = Let programs read the clipboard
tern-clipboard-reads-description = Including programs on other computers over SSH.
tern-done = Done
