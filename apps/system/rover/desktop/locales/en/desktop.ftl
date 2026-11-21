## Files and folders

rover-files-not-folder = Path is not a directory: { $path }
rover-files-missing = Path does not exist: { $path }
rover-files-file-exists = File already exists: { $path }
rover-files-folder-exists = Folder already exists: { $path }
rover-files-rename-root = Cannot rename the root folder
rover-files-name-taken = An item with that name already exists
rover-files-invalid-name = "{ $name }" isn't a valid name
# The variable is a file or folder's name, or its whole path.
rover-files-already-exists = { $name } already exists
rover-files-renaming-root = The root folder can't be renamed
rover-files-same-name = More than one item would be named { $name }
rover-files-invalid-file-name = Invalid file name
rover-files-invalid-source = Invalid source path

## Copying, moving and deleting

rover-operations-cancelled = Operation cancelled
rover-operations-answered = This question was already answered
rover-operations-finished = The operation has already finished
rover-operations-already-here = These items are already in this folder
rover-operations-not-folder = Destination must be a folder
rover-operations-inside-itself = A folder cannot be placed inside itself
rover-operations-contains-it = { $path } can't replace a folder that contains it
# The variables are sizes, such as "1.5 GB".
rover-operations-no-space = Not enough space on { $drive }: need { $needed }, available { $available }
rover-operations-no-space-here = Not enough space on destination: need { $needed }, available { $available }
rover-operations-invalid-destination = Destination path contains an invalid byte
rover-operations-free-space-unknown = Could not read destination free space
# Why the computer is kept from sleeping or shutting down.
rover-operations-keep-awake = Files are still being copied, moved or deleted

## Sizes

rover-size-bytes = { $count ->
    [one] { $count } byte
   *[other] { $count } bytes
}
rover-size-kilobytes = { $size } kB
rover-size-megabytes = { $size } MB
rover-size-gigabytes = { $size } GB
rover-size-terabytes = { $size } TB
rover-size-petabytes = { $size } PB

## Undo and redo
# Shown after a change and as what Undo or Redo just did. A count of exactly 1 names the item instead.

rover-history-created = Created “{ $name }”
rover-history-trashed = { $count ->
    [1] Moved “{ $name }” to the trash
   *[other] Moved { $count } items to the trash
}
rover-history-put-back = { $count ->
    [1] Put back “{ $name }”
   *[other] Put back { $count } items
}
rover-history-restored = { $count ->
    [one] Restored { $count } item
   *[other] Restored { $count } items
}
rover-history-trashed-again = { $count ->
    [one] Moved { $count } item back to the trash
   *[other] Moved { $count } items back to the trash
}
rover-history-renamed = Renamed “{ $from }” to “{ $to }”
rover-history-renamed-back = Renamed “{ $from }” back to “{ $to }”
rover-history-renamed-many = { $count ->
    [one] Renamed { $count } item
   *[other] Renamed { $count } items
}
rover-history-names-restored = { $count ->
    [one] Restored the names of { $count } item
   *[other] Restored the names of { $count } items
}
rover-history-copied = { $count ->
    [1] Copied “{ $name }” to “{ $folder }”
   *[other] Copied { $count } items to “{ $folder }”
}
rover-history-copies-removed = { $count ->
    [1] Removed the copy of “{ $name }”
   *[other] Removed { $count } copies
}
rover-history-moved = { $count ->
    [1] Moved “{ $name }” to “{ $folder }”
   *[other] Moved { $count } items to “{ $folder }”
}
rover-history-moved-back = { $count ->
    [1] Moved “{ $name }” back
   *[other] Moved { $count } items back
}
rover-history-duplicated = { $count ->
    [1] Duplicated “{ $name }”
   *[other] Duplicated { $count } items
}
rover-history-compressed = { $count ->
    [1] Compressed “{ $name }” into “{ $archive }”
   *[other] Compressed { $count } items into “{ $archive }”
}
rover-history-extracted = { $count ->
    [1] Extracted “{ $name }”
   *[other] Extracted { $count } items
}
rover-history-extracted-trashed = Moved the extracted files to the trash

## Trash

rover-trash-cloud = Cloud drives have no trash
rover-trash-unknown-location = Unknown trash location: { $path }
rover-trash-invalid-item = Invalid trash item: { $item }
rover-trash-outside = Trash item is outside known trash locations: { $item }
rover-trash-origin-unknown = Could not find where { $path } came from
rover-trash-home-missing = Could not find the home trash
rover-trash-failed = This item couldn't be moved to the trash
rover-trash-impossible = This item can't be moved to the trash

## Archives

rover-archives-name-needed = Choose a name for the archive
rover-archives-unknown = “{ $name }” isn't an archive Rover can open

## Details and apps

rover-look-unsupported = This drive can’t keep folder icons
rover-look-not-owner = Only the folder’s owner can change its icon
rover-look-read-only = This drive is read-only
rover-apps-missing = This app is no longer installed
rover-apps-converter-missing = Convertible is no longer installed
rover-apps-no-default = This kind of file can't have a default app

## Projects

rover-vcs-no-git = Git executable not found
# The first variable is a folder, the second what went wrong.
rover-vcs-git-failed = Failed to run Git from { $folder }: { $error }
rover-vcs-conflicts = Resolve conflicts before syncing
rover-vcs-uncommitted = Commit or discard changes before syncing
rover-vcs-behind = Remote has changes. Pull first from a terminal.
rover-vcs-no-project = No versioned project found
# The text of a commit.
rover-vcs-message-required = Message is required
rover-vcs-folder-gone = Project folder no longer exists: { $folder }
rover-vcs-untrusted = { $folder } isn't a trusted folder

## Drives

# The name of the drive Luft runs from, in the sidebar.
rover-drives-system = System
rover-drives-not-found = Drive not found: { $folder }
rover-drives-cant-unmount = { $drive } can't be unmounted
# The second variable is what the tools that tried said went wrong.
rover-drives-eject-failed = Could not eject { $drive }: { $error }
# The first variable is a program, the second how it ended.
rover-drives-tool-exited = { $program } exited with { $status }
rover-drives-no-disks = Disks isn't installed
rover-drives-not-drive = That isn't a drive

## Network and devices

rover-network-untrusted = Unlock your iPhone and tap Trust
rover-network-not-folder = This location can't be opened as a folder
rover-network-stopped = The network connection stopped

## Search, terminal and file choosers

rover-search-unsearchable = This folder can't be searched
rover-terminal-no-folder = This folder can't be opened in a terminal
rover-terminal-missing = Terminal isn't installed
rover-terminal-failed = Terminal couldn't start: { $error }
rover-chooser-starting = Rover is still starting
rover-chooser-closed = This file chooser has already closed
