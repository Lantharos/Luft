## Partition editor

disks-editor-keep-editing = Keep editing
disks-editor-undo = Undo
disks-editor-apply = Apply
# The button that shows the planned changes.
disks-editor-changes = { $count ->
    [one] { $count } change
   *[other] { $count } changes
}
disks-editor-planned = Planned changes
disks-editor-layout = Partitions and free space
disks-editor-no-filesystem = No file system
# The name of a partition the plan creates, until it's given one.
disks-editor-new-partition = New partition
disks-editor-new-partition-button = New partition
disks-editor-table-full = This drive’s partition table has no room for another partition.
disks-editor-mbr-full = An MBR partition table holds at most four partitions.

## Partition editor: the selected partition

# Shown next to a partition the plan creates.
disks-editor-new = New
disks-editor-locked = Locked
disks-editor-delete = Delete
disks-editor-size = Size
# Opens a dialog to type sizes to the mebibyte.
disks-editor-exact = Exact…
    .tooltip = Exact sizes and space around it, in MiB
disks-editor-exact-title = Exact size of { $name }
disks-editor-free-before = Free before
disks-editor-free-before-label = Free space before
disks-editor-free-after = Free after
disks-editor-free-after-label = Free space after
# A size field's name when the size is typed in mebibytes.
disks-editor-size-exact = { $label } in MiB
# Mebibytes, after a size typed to the mebibyte.
disks-editor-size-unit = MiB
disks-editor-size-fixed = Stays { $size }
disks-editor-size-range = { $min } to { $max }
disks-editor-format = Format
disks-editor-keep = Keep what’s on it
disks-editor-erase-as = Erase as { $filesystem }
disks-editor-name = Name
disks-editor-name-limit = { $limit ->
    [one] Up to { $limit } character
   *[other] Up to { $limit } characters
}
disks-editor-settings = Partition settings
disks-editor-settings-type = Type
disks-editor-settings-type-label = Partition type
disks-editor-settings-name = Name in the table
disks-editor-settings-name-label = Partition name
# Shown in an empty partition name field.
disks-editor-settings-name-none = None

## Partition editor: why a partition can or can't change

disks-editor-note-system-moves = The running system uses this partition. It grows or shrinks at its end right away, and moves into the free space in front of it the next time the computer starts.
disks-editor-note-system-in-place = The running system uses this partition, so it can only grow or shrink in place.
disks-editor-note-system-fixed = The running system uses this partition, so it can’t be changed while it runs.
disks-editor-note-logical = It sits inside an extended partition, so it stays where it is.
disks-editor-note-encrypted = Encrypted partitions keep their size. Moving one keeps it encrypted.
disks-editor-note-mount = Mount it to see how far it can shrink.
disks-editor-note-unknown-contents = Disks can’t resize what’s on it, only move it.
disks-editor-note-unmounts = It’s unmounted while it changes, if it has to be.

## Partition editor: the plan, one sentence per change

disks-plan-move-system = Move “{ $name }” into the { $room } in front of it the next time the computer starts
disks-plan-move-system-grow = Move “{ $name }” into the { $room } in front of it the next time the computer starts, then grow it over the { $rest } after it
disks-plan-grow = Grow “{ $name }” by { $change }
disks-plan-shrink = Shrink “{ $name }” by { $change }
# $distance is how far the partition moves, $change how much it grows or shrinks.
disks-plan-move = { $direction ->
    [left] { $sizing ->
        [grow] Move “{ $name }” { $distance } left and grow it by { $change }
        [shrink] Move “{ $name }” { $distance } left and shrink it by { $change }
       *[none] Move “{ $name }” { $distance } left
    }
   *[right] { $sizing ->
        [grow] Move “{ $name }” { $distance } right and grow it by { $change }
        [shrink] Move “{ $name }” { $distance } right and shrink it by { $change }
       *[none] Move “{ $name }” { $distance } right
    }
}
# Such as "Create a 20 GB ext4 partition".
disks-plan-create = Create a { $size } { $filesystem } partition
disks-plan-create-named = Create a { $size } { $filesystem } partition named “{ $name }”
disks-plan-create-empty = Create a { $size } partition without a file system
disks-plan-create-empty-named = Create a { $size } partition without a file system named “{ $name }”
disks-plan-delete = Delete “{ $name }” ({ $size })
disks-plan-format = Format “{ $name }” as { $filesystem }
disks-plan-format-named = Format “{ $name }” as { $filesystem } named “{ $label }”
# $changes is a list of the changes below, such as "rename it to “Photos”, change its flags".
disks-plan-change = For “{ $name }”, { $changes }
disks-plan-change-label = rename it to “{ $label }”
disks-plan-change-label-remove = remove its name
disks-plan-change-name = set its partition name to “{ $name }”
disks-plan-change-name-clear = clear its partition name
disks-plan-change-type = set its type to { $type }
disks-plan-change-flags = change its flags
disks-plan-loss-erased = Everything on “{ $name }” ({ $size }) is erased.
disks-plan-loss-moving = Moving “{ $name }” copies all of its { $size }. Keep the computer on and the drive connected until it’s done, or what’s on it can be lost.

## Partition editor: applying the plan

disks-editor-outcome = { $state ->
    [running] Applying changes
    [failed] Some changes weren’t made
   *[done] All changes were made
}
# $name is the drive's name.
disks-apply-title = { $count ->
    [one] Apply this change to { $name }?
   *[other] Apply { $count } changes to { $name }?
}
disks-apply-final = This can’t be undone once it starts.
disks-apply-final-unmounts = Partitions in use are unmounted first. This can’t be undone once it starts.
