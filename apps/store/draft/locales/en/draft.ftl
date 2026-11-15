## Commands, shown in the command palette and on the welcome screen

draft-command-new-file = New File
draft-command-open-file = Open File…
draft-command-open-folder = Open Folder…
draft-command-close-folder = Close Folder
draft-command-save = Save
draft-command-save-as = Save As…
draft-command-save-all = Save All
draft-command-revert = Revert to Saved
draft-command-close-tab = Close Tab
draft-command-close-other-tabs = Close Other Tabs
draft-command-next-tab = Next Tab
draft-command-previous-tab = Previous Tab
draft-command-go-to-file = Go to File…
draft-command-show-commands = Show All Commands
draft-command-go-to-line = Go to Line…
draft-command-find = Find
# Opens the search bar with the field for replacing found text
draft-command-replace = Replace
draft-command-select-matches = Select All Occurrences
draft-command-cursor-above = Add Cursor Above
draft-command-cursor-below = Add Cursor Below
draft-command-toggle-comment = Toggle Comment
draft-command-trim-whitespace = Trim Trailing Whitespace
draft-command-toggle-sidebar = Toggle Sidebar
draft-command-toggle-wrap = Toggle Word Wrap
draft-command-toggle-preview = Toggle Markdown Preview
draft-command-larger-text = Larger Text
draft-command-smaller-text = Smaller Text
draft-command-reset-text-size = Reset Text Size
# "Language" is the programming or markup language of the file, such as Python or Markdown
draft-command-change-language = Change Language…
draft-command-change-encoding = Change Encoding…
draft-command-change-indentation = Change Indentation…
draft-command-change-default-indentation = Change Default Indentation…
draft-command-change-line-endings = Change Line Endings…
# Also in the menu of a tab and of a file in the sidebar
draft-command-reveal = Reveal in Sidebar
# Also in the menu of a tab and of a file in the sidebar. Rover is Luft's file manager.
draft-command-show-in-rover = Show in Rover
# Also in the menu of a tab and of a file in the sidebar
draft-command-copy-path = Copy Path

## Key names in shortcuts such as Ctrl+Shift+P. Use the names printed on keyboards in your language.

draft-key-ctrl = Ctrl
draft-key-alt = Alt
draft-key-shift = Shift
draft-key-tab = Tab

## Menus of a tab and of a file or folder in the sidebar

draft-menu-close = Close
draft-menu-close-others = Close Others
draft-menu-open = Open
draft-menu-open-as-folder = Open as Folder

## Title bar and tabs

draft-sidebar-hide = Hide sidebar
draft-sidebar-show = Show sidebar
# Shows the Markdown file rendered next to its text
draft-preview = Preview
# Accessible name of the row of tabs
draft-tabs = Open files
# $name is the file's name
draft-tab-close = Close { $name }

## Sidebar

draft-sidebar-go-to-file = Go to file
draft-sidebar-open-folder = Open Folder
draft-sidebar-collapse = Collapse folders

## Status bar

draft-status-cursors = { $count ->
    [one] { $count } cursor
   *[other] { $count } cursors
}
# $count is how many characters are selected
draft-status-selected = { $count ->
    [one] { $count } selected
   *[other] { $count } selected
}
# Where the cursor is: line and column
draft-status-position = Ln { $line }, Col { $column }
draft-status-tabs = Tabs: { $width }
draft-status-spaces = Spaces: { $width }
# $encoding is the name of a text encoding, such as UTF-8. BOM is the byte order mark at the start of the file.
draft-status-encoding-bom = { $encoding } BOM
# The file isn't in any programming or markup language
draft-plain-text = Plain Text

## Editor

# Tooltip on the arrow next to a line number that hides the lines inside it
draft-editor-fold = Fold line
# Tooltip on the arrow next to a line number that shows hidden lines again
draft-editor-unfold = Unfold line
# Tooltip on the mark that stands for hidden lines
draft-editor-unfold-placeholder = unfold
# Accessible name of the mark that stands for hidden lines
draft-editor-folded = folded code
# Tooltip on an invisible character, followed by its name, such as "Control character tab"
draft-editor-control-character = Control character

## Untitled files

draft-untitled = Untitled
# $number counts the untitled files open, from 2 up
draft-untitled-numbered = Untitled { $number }

## Closing files with unsaved changes

draft-close-title = Save changes to “{ $name }”?
draft-close-title-files = { $count ->
    [one] Save changes to { $count } file?
   *[other] Save changes to { $count } files?
}
draft-close-description = Your changes will be lost if you don’t save them.
draft-close-discard = Don’t save
draft-close-cancel = Cancel
draft-close-save = Save

## Bar above a file that changed on disk

draft-disk-changed = This file changed on disk while you were editing it.
draft-disk-keep = Keep mine
draft-disk-reload = Reload
draft-disk-deleted = This file was deleted or moved.
draft-disk-save-again = Save it again

## Find and replace

# Placeholder and accessible name of the search field
draft-search-find = Find
# Placeholder and accessible name of the field for the replacement text
draft-search-replacement = Replace
# Button that replaces the next match
draft-search-replace = Replace
draft-search-replace-all = Replace all
draft-search-show-replace = Show replace
draft-search-hide-replace = Hide replace
draft-search-match-case = Match case
draft-search-whole-word = Whole word
draft-search-regex = Regular expression
draft-search-previous = Previous match
draft-search-next = Next match
draft-search-close = Close
# The search text isn't a valid regular expression
draft-search-invalid = Invalid pattern
draft-search-none = No results
# $current is the number of the selected match, $total how many there are
draft-search-current = { $current } of { $total }
# Shown while counting the matches takes too long; $count is how many were found so far
draft-search-at-least = { $count }+

## Command palette

draft-palette-placeholder = Go to a file
draft-palette-empty = No matching files
draft-palette-nothing = Nothing matches
draft-line-prompt = Type a line number from 1 to { $lines }
draft-line-go = Go to line { $line }
draft-line-go-column = Go to line { $line }, column { $column }
# Shown next to "Go to line"; $lines is how many lines the file has
draft-line-of = of { $lines }

## Choosing the language, encoding, line endings and indentation

draft-pick-language = Choose a language
draft-pick-encoding = Choose an encoding
draft-pick-line-endings = Choose line endings
draft-pick-indentation = Choose indentation
draft-pick-default-indentation = Choose indentation for new files
# $encoding is the name of a text encoding, such as UTF-8
draft-encoding-save = Save as { $encoding }
draft-encoding-save-bom = Save as UTF-8 with BOM
draft-encoding-reopen = Reopen as { $encoding }
# Where LF line endings are used
draft-line-endings-lf = Linux and macOS
# Where CRLF line endings are used
draft-line-endings-crlf = Windows
# $width is how many columns wide a tab is
draft-indentation-tabs = { $width ->
    [one] Tabs, { $width } wide
   *[other] Tabs, { $width } wide
}
draft-indentation-spaces = { $count ->
    [one] { $count } space
   *[other] { $count } spaces
}
draft-indentation-detect = Detect from content

## Text encodings. $code is the encoding's own name, such as Windows 1252.

draft-encoding-western = Western ({ $code })
draft-encoding-central-european = Central European ({ $code })
draft-encoding-cyrillic = Cyrillic ({ $code })
draft-encoding-greek = Greek ({ $code })
draft-encoding-turkish = Turkish ({ $code })
draft-encoding-hebrew = Hebrew ({ $code })
draft-encoding-arabic = Arabic ({ $code })
draft-encoding-baltic = Baltic ({ $code })
draft-encoding-vietnamese = Vietnamese ({ $code })
draft-encoding-japanese = Japanese ({ $code })
draft-encoding-chinese-simplified = Chinese Simplified ({ $code })
draft-encoding-chinese-traditional = Chinese Traditional ({ $code })
draft-encoding-korean = Korean ({ $code })

## Problems opening files

# $path is where the file is
draft-error-read = Couldn't read { $path }
draft-error-not-text = This file doesn’t contain text
