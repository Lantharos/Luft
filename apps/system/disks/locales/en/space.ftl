## What's using space

disks-space-folders = Folders
disks-space-refresh = Measure again
disks-space-empty = This folder is empty.
disks-space-list = What's in this folder
disks-space-map = Sizes of what's in this folder
disks-space-measuring = { $count ->
    [one] Measuring { $count } item
   *[other] Measuring { $count } items
}
# The size of the folder shown and how many items it holds.
disks-space-total = { $count ->
    [one] { $size } in { $count } item
   *[other] { $size } in { $count } items
}
disks-space-unreadable = { $count ->
    [one] { $count } folder couldn't be read
   *[other] { $count } folders couldn't be read
}
disks-space-items = { $count ->
    [one] { $count } item
   *[other] { $count } items
}
# Files too small to show one by one, taken together.
disks-space-small-files = { $count ->
    [one] { $count } small file
   *[other] { $count } small files
}
disks-space-smaller-items = { $count ->
    [one] { $count } smaller item
   *[other] { $count } smaller items
}
disks-space-show = Show in Rover
disks-space-trash = Move to trash…

## What's using space: the parts of Luft's drive

disks-space-part-files = Your files
    .description = Home folders
disks-space-part-apps = Apps
    .description = Installed apps and what they keep outside home folders
disks-space-part-luft = This version of Luft
    .description = The version running now
disks-space-part-older-luft = Older versions of Luft
    .description = Kept so you can go back
disks-space-part-update = Downloaded update
    .description = Installs at the next restart
disks-space-part-other = System files
    .description = Logs, caches and system settings
disks-space-measuring-part = Measuring…
# A version of Luft kept on the drive, such as "Luft 1.4".
disks-space-version = Luft { $version }
# A nightly build of Luft kept on the drive, such as "Luft 1.4 Nightly 25".
disks-space-version-nightly = Luft { $version } Nightly { $number }

## What's using space: freeing up space

disks-reclaim = Free up space
disks-reclaim-trash = Trash
    .description = Things you deleted, kept until the trash is emptied
disks-reclaim-trash-action = Empty
disks-reclaim-downloads = Downloads older than 30 days
    .description = { $count ->
        [one] { $count } item that hasn’t changed in a month
       *[other] { $count } items that haven’t changed in a month
    }
disks-reclaim-downloads-none = Nothing in Downloads is that old
disks-reclaim-downloads-action = Move to trash
disks-reclaim-caches = App caches
    .description = Copies apps keep to open faster and make again when needed
disks-reclaim-caches-action = Clear
disks-reclaim-largest = Largest files
disks-reclaim-largest-trash = Move to trash
