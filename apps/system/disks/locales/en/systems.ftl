## Shared by moving Luft and removing other systems

disks-close = Close
disks-later = Later
disks-not-now = Not now
disks-restart = Restart now
disks-try-again = Try again
disks-make-partition = Make a partition
disks-keep-on = Keep the computer on until this is done.
disks-admin-needed = Administrator rights are needed to continue.

## Other systems

# A Windows or Linux partition with its own name, such as "Windows, “Data”".
disks-system-part-labelled = { $system }, “{ $label }”
disks-system-part-reserved = Reserved for Windows
disks-system-part-recovery = Windows recovery
disks-system-part-meet-try = Try Luft, from Meet Luft
disks-system-part-meet-box = Moving box, from Meet Luft
disks-system-part-meet-startup = Meet Luft’s startup
disks-system-part-earlier-startup = Its startup partition
disks-system-part-earlier-luft = Luft’s earlier copy, with its files
# $name is a startup entry, such as "Windows Boot Manager".
disks-system-startup-files = { $name } and its startup files
disks-system-files = { $name }’s files
disks-system-summary-old = Kept when Luft replaced it · { $size }
disks-system-summary-earlier-luft = Left here when Luft moved to another drive · { $size }
disks-system-summary-startup-only = Only its startup files are left
disks-system-summary-bitlocker = Encrypted with BitLocker · { $size }
disks-system-summary-leftovers = Only its reserved and recovery partitions are left · { $size }
disks-system-summary-partitions = { $count ->
    [one] { $size } on { $count } partition
   *[other] { $size } on { $count } partitions
}

## Removing another system

disks-remove-title = { $phase ->
    [confirm] Remove { $name }?
    [done] { $name } is gone
    [failed] { $name } wasn’t fully removed
   *[working] Removing { $name }
}
disks-remove-deleted-files = These are deleted for good, along with everything on them:
disks-remove-deleted = This is deleted for good:
disks-remove-bitlocker = Windows is locked with BitLocker, so Luft can’t read its files. They’re gone once it’s removed.
disks-remove-copy-first = Copy anything you want to keep before you remove it.
disks-remove-open = Open in Rover
disks-remove-action = Remove { $name }
disks-remove-working = Removing
disks-system-step-startup = Taking it out of the startup list
disks-system-step-delete = Deleting { $name }
disks-system-step-delete-reserved = Deleting Windows’ reserved partition
disks-system-step-delete-recovery = Deleting Windows’ recovery partition
disks-system-step-delete-files = Deleting { $name }’s files
disks-system-step-grow = Giving Luft the space
disks-remove-grown = Luft grew by { $size }.
disks-remove-key = The space right after Luft is free. Enter the disk’s passphrase or recovery key to give it to Luft.
disks-remove-grow = Give Luft the space
disks-remove-given-back = Windows has its { $size } back.
disks-remove-free-windows = { $size } is free right after Windows. Give it back to Windows, or make it a partition for your files.
disks-remove-free = { $size } is free on { $drive }.
disks-remove-free-unnamed = { $size } is free on the drive.
disks-remove-free-luft = Give it to Luft, or make it a partition for your files.
disks-remove-free-partition = You can make it a partition for your files.
disks-remove-give-back = Give to Windows

## Giving free space to Luft

disks-give-title = Give Luft { $size }?
disks-give-loading = Looking at the space next to Luft
disks-give-refused = Luft can’t take this space
disks-give-failed = Luft didn’t get the space
disks-give-grown = Luft grew by { $size }
disks-give-has = It has { $size } now.
disks-give-at-start = Luft grows at the next start
# $name is the partition between Luft and the free space.
disks-give-move-first = First { $name } moves to the other side of the free space, which copies its { $size }.
disks-give-move-first-keep-on = Keep the computer on and the drive connected until that’s done, or what’s on { $name } can be lost.
disks-give-now = Luft grows into the space right away, while you keep using the computer.
disks-give-moves-then-fills = Luft moves into the space in front of it the next time the computer starts, then grows to fill it.
disks-give-moves-then-grows = Luft moves into the space in front of it the next time the computer starts, then grows over the { $size } free right after it.
disks-give-copies = Moving copies all of Luft’s files, which can take an hour or more on a full drive.
disks-give-copies-size = Moving copies all of Luft’s files, about { $size }, which can take an hour or more on a full drive.
disks-give-plugged-in = Keep the computer plugged in; if it turns off partway, Luft carries on at the next start.
disks-give-moving = Moving the partition next to Luft
disks-give-copied = { $copied } of { $total } copied. Keep the computer on until this is done.
disks-give-key = Enter the disk’s passphrase or recovery key to give the space to Luft.
disks-give-working = Giving
disks-give-working-moving = Moving

## Moving Luft to another drive

disks-move-title = Move Luft to another drive
disks-move-to = Move Luft to { $drive }
disks-move-loading = Looking at your drives
disks-move-needs = Luft needs { $size } on the other drive.
disks-move-copies = Your files, apps and settings come along, about { $size } in all.
disks-move-no-drives = There’s no other drive in this computer to move Luft to.
disks-move-note-shrink = Room can be made on { $name }
disks-move-note-erase = Can be erased for Luft
disks-move-note-small = Too small. Luft needs { $size }
disks-move-where = Where on { $drive }
disks-move-place-free = Use the free space
disks-move-place-free-note = { $free } free, room for Luft to have up to { $room }
disks-move-place-shrink = Make room on { $name }
disks-move-place-shrink-note = It shrinks to make room, keeping its files. Luft can have up to { $room }
disks-move-place-shrink-small = It can only make { $room } of room
disks-move-place-erase = Erase { $drive }
disks-move-place-erase-note = Everything on it is deleted, and Luft gets the whole drive
disks-move-space = Space for Luft
disks-move-shrink-first = First, { $name } shrinks to { $size }.
disks-move-shrink-files = Its files stay as they are.
disks-move-confirm-moves = Luft moves to { $drive } the next time the computer starts, with { $size } of space.
disks-move-confirm-copying = Copying your files, apps and settings, about { $size }, takes from a few minutes to an hour on a full drive.
disks-move-confirm-keep-on = Keep the computer on and plugged in until Luft starts from { $drive }.
disks-move-confirm-encrypted = The new copy is encrypted the same way and opens with the same recovery key.
# $here is the drive Luft runs from now, $drive the one it moves to.
disks-move-confirm-old-copy = The copy on { $here } keeps working until Luft has started from { $drive }.
disks-move-confirm-old-copy-here = The copy on this drive keeps working until Luft has started from { $drive }.
disks-move-confirm-remove = Then you can remove it here.
disks-move-action = Move Luft
disks-move-preparing = Preparing
disks-move-erase-title = Erase { $name } for Luft?
disks-move-erase-unreadable = Nothing on it can be read now, and whatever is still on it is gone for good once it’s erased.
disks-move-erase-then = Luft then gets all { $size } of it, and moves there the next time the computer starts.
disks-move-erase-action = Erase and move Luft
disks-move-waiting-title = Luft moves at the next start
disks-move-waiting = Luft moves to { $drive } the next time the computer starts.
disks-move-waiting-keep-on = The startup shows how far it is; keep the computer on and plugged in until Luft starts from there.
disks-move-waiting-partway = If it turns off partway, Luft carries on where it left off at the next start.
# Cancels a move that waits for the next start.
disks-move-call-off = Call off
disks-move-refused-title = Luft can’t move right now
disks-move-failed-title = Luft didn’t move to { $drive }
disks-move-failed = Luft stayed where it was, and took back what it had made on { $drive }.

## Finishing an interrupted move

disks-finish-move-title = Finish moving “{ $name }”?
disks-finish-move-description = Moving it on { $drive } was interrupted. Nothing is lost, but it can’t be opened, and the drive can’t be changed, until the move is finished.
disks-finish-move-description-unnamed = Moving it on the drive was interrupted. Nothing is lost, but it can’t be opened, and the drive can’t be changed, until the move is finished.
disks-finish-move-moving = Moving
disks-finish-move-action = Finish moving
