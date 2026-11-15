## Sidebar and welcome

keys-sidebar-layouts = Layouts
keys-sidebar-methods = Input methods
keys-new-layout = New layout
keys-new-method = New input method
keys-welcome = Type the way you want
keys-welcome-layout = Make a layout
keys-welcome-method = Make an input method

## Shared by both editors

keys-tabs = What to edit
keys-tab-settings = Settings
keys-undo = Undo
keys-redo = Redo
keys-more = More
keys-name = Name
# A layout's or input method's short name, shown in the top bar.
keys-short-name = Short name
keys-language = Language
keys-cancel = Cancel
keys-create = Create
keys-import-file = Import a file
keys-remove = Remove
keys-search = Search
keys-no-matches = No matches
keys-in-sources = In your input sources
keys-add-to-sources = Add to input sources
# Shown after a file was exported.
keys-saved = Saved
keys-delete = { $kind ->
    [layout] Delete layout
   *[method] Delete input method
}
keys-delete-title = { $kind ->
    [layout] Delete this layout?
   *[method] Delete this input method?
}
keys-delete-description = It's removed from your input sources too.
keys-delete-confirm = Delete

## New layout

keys-new-layout-start-from = Start from
keys-new-layout-search = Search layouts
# The name a new layout gets; the variable is the name of the layout it starts from.
keys-new-layout-default-name = { $name } (custom)

## New input method

keys-new-method-placeholder = My input method

## Layout editor

keys-layout-tab-keys = Keys
keys-layout-tab-dead = Dead keys
keys-layout-export-symbols = Export layout file
keys-layout-export-keymap = Export as a complete keymap
keys-layout-export-compose = Export dead keys as a Compose file
keys-layout-export-klc = Export for Windows
# A keyboard shape; the variable is ANSI, ISO or JIS.
keys-shape = { $shape } keyboard
keys-keyboard = Keyboard
keys-layer = Level shown on the keys
keys-layer-all = All
keys-issues = Worth a look
keys-inspector-label = What the key types
# The variable is the name of the dead key on this level.
keys-inspector-edit = Edit { $name }
keys-inspector-edit-dead = Edit dead key
# The variable is the dead key's name.
keys-placing = Pick a key for { $name }
keys-try-layout = Try the layout
keys-try-layout-placeholder = Type to try the layout

## Levels of a key

keys-level-alone = Alone
keys-level-shift = With Shift
keys-level-altgr = With AltGr
keys-level-shift-altgr = With Shift and AltGr
keys-level-short-alone = Alone
keys-level-short-shift = Shift
keys-level-short-altgr = AltGr
keys-level-short-shift-altgr = Shift AltGr
# A level of a key and what it types, such as "With Shift: Latin capital letter A".
keys-level-described = { $level }: { $name }

## Key names

keys-key-ctrl = Ctrl
keys-key-super = Super
keys-key-alt = Alt
keys-key-altgr = AltGr
keys-key-menu = Menu
# Backspace on a small key.
keys-key-back = Back
keys-key-backspace = Backspace
keys-key-tab = Tab
keys-key-enter = Enter
keys-key-caps-lock = Caps Lock
keys-key-shift = Shift
keys-key-space = Space
keys-key-escape = Escape
keys-key-compose = Compose
keys-key-left-alt = Left Alt
keys-key-right-alt = Right Alt
keys-key-right-ctrl = Right Ctrl
keys-key-right-super = Right Super
keys-key-scroll-lock = Scroll Lock
keys-key-print-screen = Print Screen
keys-key-shift-lock = Shift Lock

## What a key types

keys-character-small = Latin small letter { $letter }
keys-character-capital = Latin capital letter { $letter }
keys-character-digit = { $digit ->
    [0] Digit zero
    [1] Digit one
    [2] Digit two
    [3] Digit three
    [4] Digit four
    [5] Digit five
    [6] Digit six
    [7] Digit seven
    [8] Digit eight
   *[9] Digit nine
}
# The variable is the name given to the dead key in this layout.
keys-symbol-dead-own = { $name } dead key
# The variable is a standard dead key's name, such as Acute.
keys-symbol-dead-standard = Dead key, { $name }
keys-symbol-compose = Starts a compose sequence
keys-symbol-nothing = Nothing

## Choosing a character

keys-picker = Choose a character
keys-picker-search = Search characters
keys-picker-own-dead = Your dead keys
keys-picker-standard-dead = Standard dead keys
keys-picker-compose = Compose key
# The variable is a key's name in the keyboard system, such as BackSpace.
keys-picker-named = The { $keysym } key

## Dead keys

keys-dead-new = New dead key
keys-dead-empty = No dead keys yet
keys-dead-standard-heading = Standard
keys-dead-has-problems = Has results to look at
keys-dead-edit-details = Edit details
keys-dead-details = Details of { $name }
# The character the dead key shows on its key.
keys-dead-symbol = On the key
# What the dead key types when Space follows it.
keys-dead-spacing = With Space
keys-dead-place = Put on a key
keys-dead-place-again = Put on another key
keys-dead-add-capitals = Add capitals
keys-dead-remove = Remove dead key
keys-dead-copy = Make an editable copy
keys-dead-unplaced = Not on a key yet
# One place a dead key is on. Several are joined into a list, and the first letter of the list is capitalized.
keys-dead-where = { $level ->
    [1] with Shift on the { $key } key
    [2] with AltGr on the { $key } key
    [3] with Shift and AltGr on the { $key } key
   *[0] on the { $key } key
}
# The name a new dead key gets.
keys-dead-default-name = Dead key { $number }
keys-dead-capitals-added = { $count ->
    [one] Added { $count } capital letter
   *[other] Added { $count } capital letters
}
keys-dead-capitals-none = Every letter already has its capital
keys-try-dead = Try { $name }
keys-try-dead-placeholder = Type to try { $name }
# A standard dead key's name; $spelled is the name spelled out from the keyboard system's own name, for dead keys not listed here.
keys-dead-standard = { $keysym ->
    [dead_acute] Acute
    [dead_grave] Grave
    [dead_circumflex] Circumflex
    [dead_tilde] Tilde
    [dead_diaeresis] Diaeresis
    [dead_abovering] Ring above
    [dead_cedilla] Cedilla
    [dead_caron] Caron
    [dead_macron] Macron
    [dead_breve] Breve
    [dead_abovedot] Dot above
    [dead_doubleacute] Double acute
    [dead_ogonek] Ogonek
    [dead_belowdot] Dot below
    [dead_hook] Hook
    [dead_horn] Horn
    [dead_stroke] Stroke
    [dead_belowcomma] Comma below
    [dead_belowmacron] Macron below
    [dead_belowring] Ring below
    [dead_belowcircumflex] Circumflex below
    [dead_belowtilde] Tilde below
    [dead_belowbreve] Breve below
    [dead_belowdiaeresis] Diaeresis below
    [dead_invertedbreve] Inverted breve
    [dead_doublegrave] Double grave
    [dead_abovecomma] Comma above
    [dead_abovereversedcomma] Reversed comma above
    [dead_iota] Iota
    [dead_currency] Currency
    [dead_greek] Greek
    [dead_voiced_sound] Voiced sound
   *[other] { $spelled }
}

## Results of a dead key

# The key typed after the dead key.
keys-pair-key = Key
# What the dead key and that key make together.
keys-pair-makes = Makes
keys-pair-options = Options
keys-pair-search = Search results
keys-pair-add = Add a result
# The variable is another dead key's name.
keys-pair-leads-into = Leads into { $name }
keys-pair-lead-into = Lead into { $name }
keys-pair-make-text = Make text instead
keys-pair-no-key = Type the key that comes after the dead key
keys-pair-one-key = Only one key can follow a dead key
keys-pair-repeated = { $key } already has a result
keys-pair-no-result = Type what it makes
keys-pair-untypeable = No key types { $key }

## Things worth a look

keys-issue-unplaced = { $name } isn't on a key yet
keys-issue-loop = { $name } leads back to itself
keys-issue-pairs = { $count ->
    [one] { $name } has a result to look at
   *[other] { $name } has { $count } results to look at
}
keys-issue-silent = { $count ->
    [one] A key types nothing
   *[other] { $count } keys type nothing
}
# The variable is a character typed by several keys.
keys-issue-repeated = { $character } is on { $count } keys
# The variable is a key's name, such as Right Alt.
keys-issue-shared = AltGr and Compose are both on { $key }

## Layout settings

keys-settings-either-alt = Either Alt
keys-settings-none = None
keys-settings-swap-escape = Swapped with Escape
keys-settings-nothing = Nothing
# Caps Lock is taken by another key's job; the variable is Compose or AltGr.
keys-settings-works-as = Works as { $key }
# The system layout this one was made from.
keys-settings-starts-from = Starts from

## Input method editor

keys-method-tab-rules = Replacements
keys-method-tab-words = Words
keys-method-tab-sequences = Sequences
keys-method-export = Export input method
keys-method-rules-add = Add replacement
keys-method-rules-empty = No replacements yet
keys-method-words-add = Add word
keys-method-words-empty = No words yet
keys-method-sequences-add = Add sequence
keys-method-sequences-empty = No sequences yet
keys-method-sequence-key = Sequence key
keys-method-page-size = Choices shown at once
keys-method-learn = Learn from your choices
keys-entry-keys = You type
keys-entry-text = You get
keys-entry-after = Only after
keys-entry-anywhere = Anywhere
keys-entry-repeated = Same keys as another entry, only the last one is used
keys-try-method = Try the input method
keys-try-method-placeholder = Type to try
keys-try-candidates = Candidates
# Which choices are shown out of all of them, such as 1–9 of 24.
keys-try-candidates-page = { $first }–{ $last } of { $total }

## Viewing a layout

keys-view-edit = Edit
keys-view-copy = Make a copy to edit

## Typing to try

keys-try-clear = Clear
