## Shared buttons and labels

rover-cancel = Cancel
rover-close = Close
# Opens a file or folder.
rover-open = Open
rover-ok = OK
rover-dismiss = Dismiss
rover-new-folder = New folder
rover-new-file = New file
rover-free-up-space = Free up space
rover-empty-trash = Empty trash
rover-history-undo = Undo
rover-history-redo = Redo

## Cloud drives

rover-cloud-mark-online = Online only, downloads when opened
rover-cloud-mark-local = On this device
rover-cloud-mark-syncing = Syncing
rover-cloud-freeing = Sending changes up before freeing space
# The variable is a file's name.
rover-cloud-freed-one = { $name } is online only now
rover-cloud-freed = Freed up space
rover-cloud-link-copied = Share link copied
rover-cloud-sign-in-again = Sign in again in Settings
rover-cloud-offline = Offline
rover-cloud-offline-kept = Offline, showing what’s kept on this device
rover-cloud-connecting = Connecting
rover-cloud-not-connected = Not connected
rover-cloud-paused-metered = Syncing paused on a metered connection
rover-cloud-paused-battery = Syncing paused while the battery is low
rover-cloud-syncing-changes = { $count ->
    [one] Syncing { $count } change
   *[other] Syncing { $count } changes
}
# $used and $total are sizes, such as "4 GB".
rover-cloud-usage = { $used } of { $total } used
# $file and $copy are file names, shown in bold; $provider is a service such as OneDrive.
rover-cloud-conflict = { $file } changed on this computer and in { $provider } at the same time. Both versions are kept; the other one is { $copy }.
# $file and $copy are file names, shown in bold.
rover-cloud-conflict-server = { $file } changed on this computer and in the server at the same time. Both versions are kept; the other one is { $copy }.
# Selects the other version of a file.
rover-cloud-conflict-show = Show

## Drives that belong to another account

# $drive is the drive's name, shown in bold; $command is a terminal command, kept as it is. Terminal is Luft's terminal app.
rover-drive-foreign = The files on { $drive } belong to another account, perhaps from a system that was here before, so you can open them but not change them. To make them yours, run { $command } in Terminal.
rover-drive-foreign-copy = Copy command

## Details pane

rover-details = Details
rover-details-items = { $count ->
    [one] { $count } item
   *[other] { $count } items
}
rover-details-folders = { $folders ->
    [one] { $folders } folder
   *[other] { $folders } folders
}
rover-details-files = { $files ->
    [one] { $files } file
   *[other] { $files } files
}
rover-details-folders-and-files = { $folders ->
    [one] { $folders } folder
   *[other] { $folders } folders
}, { $files ->
    [one] { $files } file
   *[other] { $files } files
}
rover-details-size = Size
# Where a folder is, such as ~/Documents.
rover-details-where = Where
rover-details-free-space = Free space
# $free and $total are sizes, such as "40 GB".
rover-details-free-space-value = { $free } of { $total }
rover-open-with = Open with
# Next to the app that opens the file by default.
rover-open-with-default = Open
rover-open-with-fewer = Show fewer
rover-open-with-more = { $count ->
    [one] { $count } more
   *[other] { $count } more
}

## File list

rover-pane-label = File browser
rover-empty-go-back = Go back
rover-empty-go-home = Go home
rover-empty-denied-title = You can’t open this folder
rover-empty-denied-message = You don’t have permission to see what’s inside.
rover-empty-missing-title = This folder isn’t here anymore
rover-empty-missing-message = It may have been moved, renamed or deleted.
rover-empty-failed-title = This folder couldn’t be opened
rover-empty-no-matches-title = No matches
# The variable is what was typed into the search field.
rover-empty-no-matches-message = Nothing here matches “{ $query }”.
rover-empty-clear-search = Clear search
rover-empty-recent-title = Nothing recent yet
rover-empty-recent-message = Files you open show up here.
rover-empty-folder-title = This folder is empty

## Trash

rover-trash-empty = Trash is empty
rover-trash-location = Trash location
rover-trash-items = { $count ->
    [one] { $count } item
   *[other] { $count } items
}
rover-trash-restore = Restore

## Quick Look and previews

# The variable is a file's name.
rover-quicklook-label = Preview of { $name }
# $kind is the kind of item, such as "Folder"; $position and $count say which of the folder's items this is.
rover-quicklook-folder-subtitle = { $kind } · { $position } of { $count }
# $kind is the kind of file, such as "PNG image"; $size is its size; $position and $count say which of the folder's items this is.
rover-quicklook-file-subtitle = { $kind } · { $size } · { $position } of { $count }
rover-preview-binary = This file can’t be shown as text.

## Choosing files for another app

rover-chooser-save-as = Save as
rover-chooser-files = { $count ->
    [one] { $count } file
   *[other] { $count } files
}
rover-chooser-selected = { $count ->
    [one] { $count } selected
   *[other] { $count } selected
}
rover-chooser-pick-folder = Select a folder
rover-chooser-pick-file = Select a file
rover-chooser-save = Save
# Picks the folder the files are saved in.
rover-chooser-select = Select
rover-chooser-filter = Kind of file
rover-chooser-name = Name
# The name a new file gets until one is typed.
rover-chooser-untitled = Untitled
rover-chooser-file-name = File name
# Shown on the New folder button in a folder the person can’t change.
rover-chooser-no-new-folder = You can’t make folders here
# Shown on the Save button in a folder the person can’t change.
rover-chooser-no-save = You can’t save here
# Asked before saving over files that are already there. $name is the file's name when there's one.
rover-chooser-replace-title = { $count ->
    [one] Replace “{ $name }”?
   *[other] Replace { $count } files?
}
# $names lists the files' names.
rover-chooser-replace-description = { $count ->
    [one] A file with this name is already here.
   *[other] { $names } are already here.
}
rover-chooser-replace = Replace
# Shown when a name typed with slashes points into a folder that isn't there.
rover-chooser-missing-folder = There’s no folder at { $path }

## Right-click menu

# Goes back to the rest of the menu.
rover-menu-back = Back
rover-menu-quick-look = Quick Look
rover-menu-view-project-changes = View project changes
rover-menu-view-changes = View changes
rover-menu-commit-changes = Commit changes
rover-menu-commit-file = Commit this file
rover-menu-open-in-tab = Open in tab
rover-menu-remove-from-sidebar = Remove from sidebar
rover-menu-add-to-sidebar = Add to sidebar
rover-menu-change-icon = Change icon…
rover-menu-keep-on-device = Keep on this device
rover-menu-copy-share-link = Copy share link
rover-menu-open-in-browser = Open in browser
rover-menu-cut = Cut
rover-menu-copy = Copy
rover-menu-duplicate = Duplicate
rover-menu-copy-paths = { $count ->
    [1] Copy path
   *[other] Copy paths
}
rover-menu-rename = Rename
# Opens a window for renaming several items at once.
rover-menu-rename-several = Rename…
rover-menu-compress = Compress…
rover-menu-extract-here = Extract here
rover-menu-convert = Convert…
rover-menu-print = Print…
rover-menu-open-in-terminal = Open in terminal
rover-menu-explore-space = See what’s using space
rover-menu-properties = Properties
rover-menu-delete-permanently = Delete permanently…
rover-menu-move-to-trash = Move to trash
rover-menu-paste = Paste
rover-menu-search-here = Search in this folder
rover-menu-terminal-here = Open terminal here
rover-menu-sync-project = Sync project
rover-menu-show-git-status = Show Git status…

## Copying, moving and deleting

# The name of a progress card; the variable is its title, such as "Copying to Documents".
rover-operation-label = { $title } operation
rover-operation-safe-to-eject = Safe to eject
rover-operation-done = { $operation ->
    [copy] Copied
    [move] Moved
    [trash] Moved to trash
    [delete] Deleted
    [compress] Compressed
   *[extract] Extracted
}
rover-operation-running = { $operation ->
    [copy] Copying
    [move] Moving
    [trash] Moving to trash
    [delete] Deleting
    [compress] Compressing
   *[extract] Extracting
}
# The variable is the folder or drive the items go to.
rover-operation-running-to = { $operation ->
    [copy] Copying to { $destination }
   *[move] Moving to { $destination }
}
rover-operation-finalizing = Finalizing writes
# The variable is the drive the items go to.
rover-operation-finalizing-to = Finalizing writes to { $destination }
rover-operation-finalizing-unplug = Finalizing writes. Do not unplug yet.
rover-operation-preparing = Preparing
rover-operation-failed = Failed
rover-operation-finished-short = Done
rover-operation-cancelled = Cancelled
rover-operation-do-not-unplug = Do not unplug yet
rover-operation-finishing-writes = Finishing writes
rover-operation-moved-safely = Moved successfully
rover-operation-copied-safely = Copied successfully
rover-operation-finished = { $count ->
    [1] Finished
    [one] { $count } item finished
   *[other] { $count } items finished
}
rover-operation-items = { $count ->
    [one] { $done } of { $count } item
   *[other] { $done } of { $count } items
}
# $done and $total are sizes, such as "1.2 GB".
rover-operation-bytes = { $done } of { $total }
# $rate is a size, so this reads like "1.2 GB of 4 GB · 80 MB/s".
rover-operation-bytes-rate = { $done } of { $total } · { $rate }/s
# $left is a duration, such as "2 min".
rover-operation-bytes-left = { $done } of { $total } · { $rate }/s · { $left } left
rover-operation-percent = { $percent }%
rover-operation-pause = Pause
rover-operation-resume = Resume

## Status bar

rover-status-items = { $count ->
    [one] { $count } item
   *[other] { $count } items
}
rover-status-selected = { $count ->
    [one] { $selected } of { $count } item selected
   *[other] { $selected } of { $count } items selected
}
# $size is the selected files' total size.
rover-status-selected-size = { $count ->
    [one] { $selected } of { $count } item selected · { $size }
   *[other] { $selected } of { $count } items selected · { $size }
}
# $size is the free space on the drive.
rover-status-free = { $size } free

## Sidebar

rover-sidebar-search = Search current folder
rover-sidebar-places = Places
rover-place-home = Home
# Recently opened files.
rover-place-recent = Recent
rover-place-trash = Trash
rover-place-open-in-new-tab = Open in new tab
# The variable is the name of a folder hidden from the sidebar, such as "Music".
rover-place-show = Show { $name }
# The variable is the name of a file or folder.
rover-sidebar-remove-named = Remove { $name } from the sidebar
rover-sidebar-drop = Drop to add to the sidebar
rover-cloud-heading = Cloud
rover-cloud-add-account = Add a cloud account
rover-cloud-add-account-short = Add an account
rover-cloud-sidebar-paused-metered = Paused on a metered connection
rover-cloud-sidebar-paused-battery = Paused while the battery is low
# $free and $total are sizes, such as "40 GB".
rover-drive-summary = { $free } free of { $total }
rover-drive-eject = Eject
rover-drive-unmount = Unmount
# The variable is a drive's name.
rover-drive-eject-named = Eject { $name }
# The variable is a drive's name.
rover-drive-unmount-named = Unmount { $name }
# The variable is a drive's name.
rover-drive-ejecting = { $name } · Ejecting
# The variable is a drive's name.
rover-drive-unmounting = { $name } · Unmounting
rover-drive-manage = Manage drive…
rover-network-disconnect = Disconnect
# The variable is a server's name.
rover-network-disconnect-named = Disconnect { $name }
rover-windows-asleep-title = Windows is still asleep
rover-windows-asleep-description = It was hibernated or shut down with Fast Startup, so its drive opens read-only. To change files on it, start Windows and hold Shift while you choose Shut down.
rover-windows-open-read-only = Open read-only
# The variable is a drive's name.
rover-windows-failed = { $name } couldn’t be opened

## Toolbar

rover-toolbar-back = Back
rover-toolbar-forward = Forward
rover-toolbar-parent = Parent folder
rover-path-location = Location
rover-path-matching = Matching folders
rover-path-edit = Edit location
# The whole file system, shown as the first part of a path outside home and drives.
rover-place-computer = Computer
rover-view = View
rover-view-list = List
rover-view-grid = Grid
rover-view-columns = Columns
rover-sort = Sort
rover-sort-name = Name
# When the item was last changed.
rover-sort-modified = Modified
rover-sort-size = Size
rover-sort-kind = Kind
rover-sort-ascending = Ascending
rover-sort-descending = Descending
rover-sort-group-none = Don’t group
rover-sort-group-kind = Group by kind
rover-sort-group-date = Group by date
# A menu for making new folders and files.
rover-new = New
rover-new-tab = New tab
rover-tabs = Tabs
rover-tabs-close = Close tab
rover-more = More
rover-more-show-hidden = Show hidden files
rover-more-icon-size = Icon size
rover-more-smaller-icons = Smaller icons
rover-more-larger-icons = Larger icons
# The variable is the name of a folder hidden from the sidebar, such as "Music".
rover-more-show-place = Show { $name } in sidebar
rover-more-go-to-location = Go to location
rover-connect-to-server = Connect to server…
rover-more-refresh = Refresh

## Key names, used to build shortcut labels such as "Ctrl+Shift+N". Use the names printed on keyboards in your language.

rover-key-ctrl = Ctrl
rover-key-alt = Alt
rover-key-shift = Shift

## Version control

rover-vcs-panel = Version Control
rover-vcs-changes = Changes
rover-vcs-collapse = Collapse version control
rover-vcs-repository = Git repository
# The variable is the name of a Git branch.
rover-vcs-branch = Branch: { $branch }
rover-vcs-changed-files = { $count ->
    [one] { $count } changed file
   *[other] { $count } changed files
}
rover-vcs-changed-files-counts = { $count ->
    [one] { $count } changed file
   *[other] { $count } changed files
} · { $added } added · { $modified } modified · { $deleted } deleted
# Commits on this computer that aren't on the server yet.
rover-vcs-ahead = Ahead { $count }
# Commits on the server that aren't on this computer yet.
rover-vcs-behind = Behind { $count }
rover-vcs-ahead-behind = Ahead { $ahead } · Behind { $behind }
# Short parts of the status line, such as "Git · main · 3 changed · ahead 1".
rover-vcs-summary-changed = { $count } changed
rover-vcs-summary-ahead = ahead { $count }
rover-vcs-summary-behind = behind { $count }
# A button that saves the selected changes as a commit.
rover-vcs-commit = Commit
rover-vcs-sync = Sync
rover-vcs-refresh = Refresh VCS status
rover-vcs-changed-files-label = Changed files
rover-vcs-no-changes = No local changes
rover-vcs-diff = Diff preview
rover-vcs-diff-loading = Loading the changes
rover-vcs-diff-empty = Select a file to preview changes
rover-vcs-message = Message
rover-vcs-message-placeholder = Describe your changes
rover-vcs-files = Files
rover-vcs-syncing = Syncing
rover-vcs-committing = Committing
rover-vcs-committed = Committed
rover-vcs-synced = Synced
rover-vcs-attention = Version control needs attention
rover-vcs-status-conflicted = Conflicted
rover-vcs-status-deleted = Deleted
rover-vcs-status-added = Added
rover-vcs-status-untracked = Untracked
rover-vcs-status-renamed = Renamed
rover-vcs-status-modified = Modified
rover-vcs-status-ignored = Ignored
# The variable is a folder's name.
rover-vcs-trust-title = Show Git status for “{ $folder }”?
rover-vcs-trust-description = Git follows this folder’s own settings, which can run programs. Only do this for folders that came from someone you trust.
rover-vcs-trust-confirm = Show status

## Views

rover-view-files = Files
rover-view-folder-columns = Folder columns
rover-name-field-folder = Folder name
# The name a new folder gets.
rover-default-folder-name = New folder
# The name a new text file gets, before its extension.
rover-default-file-name = New file
rover-list-items = { $count ->
    [one] { $count } item
   *[other] { $count } items
}
rover-list-reset-columns = Reset columns
# The variable is a column's name, such as "Size".
rover-list-resize = Resize { $column }
# A column in Recent that shows where each file is.
rover-list-location = Location
rover-cloud-unreachable = Connect to the internet to open files that aren’t kept on this device

## Details of one item

# For a folder: how many items it holds.
rover-details-contains = Contains
rover-details-duration = Duration
rover-details-dimensions = { $width } × { $height }
rover-vcs-status-unchanged = Unchanged
# $state is a Git status such as "Modified"; $branch is the name of a Git branch.
rover-details-git-branch = { $state } on { $branch }

## Grouping the file list

rover-group-folder = Folders
rover-group-document = Documents
rover-group-image = Images
rover-group-video = Videos
rover-group-audio = Audio
rover-group-code = Text and code
rover-group-archive = Archives
rover-group-package = Apps and packages
rover-group-file = Other
rover-group-today = Today
rover-group-yesterday = Yesterday
rover-group-week = Previous 7 days
rover-group-month = Previous 30 days
rover-group-no-date = No date

## Kinds of files

rover-kind-folder = Folder
rover-kind-txt = Plain text
rover-kind-pdf = PDF document
rover-kind-rs = Rust source
rover-kind-py = Python script
rover-kind-sh = Shell script
rover-kind-html = Web page
rover-kind-css = Stylesheet
rover-kind-svelte = Svelte component
rover-kind-svg = SVG image
# $extension is a file's extension in capitals, such as "PNG".
rover-kind-extension = { $kind ->
    [image] { $extension } image
    [video] { $extension } video
    [audio] { $extension } audio
    [archive] { $extension } archive
    [document] { $extension } document
    [package] { $extension } package
   *[file] { $extension } file
}
rover-kind = { $kind ->
    [image] Image
    [video] Video
    [audio] Audio
    [archive] Archive
    [document] Document
    [package] Package
   *[file] File
}

## Kinds of servers

rover-protocol-sftp = SFTP
rover-protocol-smb = Windows file sharing (SMB)
rover-protocol-ftp = FTP
rover-protocol-ftps = FTP with encryption
rover-protocol-dav = WebDAV
rover-protocol-davs = WebDAV with encryption
rover-protocol-nfs = NFS
rover-protocol-afp = Apple file sharing
rover-protocol-mtp = Phone or camera
rover-protocol-gphoto2 = Camera
rover-protocol-afc = iPhone or iPad
# The name of a shared folder on a server; $folder is the folder, $host the server's address.
rover-address-name = { $folder } on { $host }
rover-connect-invalid-address = That doesn’t look like a server address
