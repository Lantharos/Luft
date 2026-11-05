## The sidebar: boards, and the file menu of a board

boards-title = Boards
board-new = New board
board-default-name = New board
board-rename = Rename
board-export = Export board…
board-import = Import a board…
board-remove = Delete board
board-remove-title = Delete { $name }?
board-remove-detail = { $count ->
    [one] Its { $count } sound goes with it.
   *[other] Its { $count } sounds go with it.
}
board-name = Board name
board-file-kind = Soundboard board
board-exported = Board exported
board-imported = Board imported

## The bar above the tiles

sounds-search = Search sounds
sounds-add = Add sounds
sounds-stop-all = Stop all
sounds-file-kind = Audio files
sounds-choose-title = Choose sounds

## The empty board and search

empty-title = Drop sounds here
empty-detail = Or add them from a folder. They're copied, so they keep working if the originals move.
empty-search = Nothing matches { $search }

## Messages

add-failed = { $count ->
    [one] { $name } couldn't be read as sound
   *[other] { $count } files couldn't be read as sound
}
added = { $count ->
    [one] Added { $count } sound
   *[other] Added { $count } sounds
}

## The Microphone and Hearing panel at the bottom of the sidebar

status-off = The sound server isn't running
status-nobody = Pick Soundboard as the microphone in a game or call
status-listening = { $count ->
    [one] { $count } app is listening
   *[other] { $count } apps are listening
}
mic-title = Your microphone
mic-default = System default
mic-level = Microphone level
mic-mute = Mute microphone
mic-unmute = Unmute microphone
monitor-title = Hear sounds yourself
monitor-level = Hearing level
default-input = Use as default input
keep-running = Keep running with the window closed

## A tile and its menu

tile-edit = Edit…
tile-remove = Delete

## Editing a sound

editor-title = Edit sound
editor-name = Name
editor-look = Look
editor-look-none = Colour only
editor-look-emoji = Emoji
editor-look-icon = Icon
editor-look-picture = Picture
editor-emoji = Emoji
editor-picture-choose = Choose picture…
editor-picture-kind = Pictures
editor-color = Colour
editor-level = Level
editor-trim = Trim
editor-trim-start = Start of the sound
editor-trim-end = End of the sound
editor-preview = Listen
editor-loop = Loop
editor-loop-detail = Plays until you press it again
editor-stop-others = Stop other sounds
editor-stop-others-detail = Cuts off whatever is playing
editor-trigger = Hotkey plays
editor-trigger-press = On press
editor-trigger-hold = While held
editor-hotkey = Hotkey
editor-hotkey-none = Not set
editor-hotkey-change = Change…
editor-hotkey-unavailable = This desktop has no global hotkeys
editor-save = Save
editor-cancel = Cancel
