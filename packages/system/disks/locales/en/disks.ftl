## Drives and partitions

# The name of a drive that is a disk image file, when the file's name isn't known
luft-disks-drive-image = Disk image
# A partition or volume named by its label, inside a sentence
luft-disks-volume-label = “{ $label }”
# A partition without a label, named by its number on the drive
luft-disks-volume-number = Partition { $number }
luft-disks-volume-gone = This volume is gone
luft-disks-partition-gone = This partition is gone

## Mounting at startup

luft-disks-mount-full-path = Use a full folder path, such as /mnt/data
luft-disks-mount-system-folder = The system keeps its own files there. Choose another folder, such as /mnt/data
luft-disks-mount-no-identifier = This volume has no identifier to mount it by

## Resizing

luft-disks-resize-unknown-file-system = Disks can only resize partitions that hold a file system it knows
# $kind is the file system's type, such as ext4 or NTFS
luft-disks-resize-cannot-grow = { $kind } file systems can't grow here
# $kind is the file system's type, such as ext4 or NTFS
luft-disks-resize-cannot-shrink = { $kind } file systems can't shrink here
luft-disks-resize-unrepaired = Its file system has problems that couldn't be repaired
luft-disks-resize-in-use = It has to be unmounted to resize, and the system is using it

## Moving Luft to another drive

luft-disks-move-internal-only = Luft only moves to drives inside the computer, which start it more reliably.
# $drive is the drive's name, such as its maker and model
luft-disks-move-read-only = { $drive } can only be read.
# $system is the name of another operating system on the drive, such as Windows 11
luft-disks-move-erase-system = { $system } is on this drive, so Disks won't erase it for Luft. Make room next to it instead.
# $volume is a partition's name or number
luft-disks-move-erase-in-use = { $volume } is in use, so this drive can't be erased right now.
luft-disks-move-drive-gone = That drive isn't there anymore
luft-disks-move-partition-gone = That partition isn't there anymore
luft-disks-move-no-space-after = No space came free after it

## Giving Luft more space

# A partition the computer needs to start, at the start of a sentence
luft-disks-luft-part-start = { $part ->
    [esp] The EFI system partition
    [windows-reserved] Windows' reserved partition
   *[windows-recovery] Windows' recovery partition
}
# A partition the computer needs to start, inside a sentence
luft-disks-luft-part = { $part ->
    [esp] the EFI system partition
    [windows-reserved] Windows' reserved partition
   *[windows-recovery] Windows' recovery partition
}
# Joins two partition names in a list
luft-disks-list-two = { $first } and { $second }
# Puts a partition name before the rest of a list
luft-disks-list-more = { $first }, { $rest }
# $parts lists two or more partitions
luft-disks-luft-between-several = { $parts } sit between Luft and this space. Luft can only grow into free space right next to it, so this space can only become a partition of its own.
# $part is a partition's name; $system is the operating system it belongs to
luft-disks-luft-between-belongs = { $part } sits between Luft and this space, and it belongs to { $system }, which might not start anymore if it moved. Luft can only grow into free space right next to it, so this space can only become a partition of its own.
# $part is a partition's name
luft-disks-luft-between-starts = { $part } sits between Luft and this space, and the computer needs it where it is to start. Luft can only grow into free space right next to it, so this space can only become a partition of its own.
# $part is a partition's name
luft-disks-luft-between-in-use = { $part } sits between Luft and this space, and the running system uses it. Luft can only grow into free space right next to it, so this space can only become a partition of its own.
# $part is a partition's name
luft-disks-luft-between-extended = { $part } sits between Luft and this space, and it sits inside an extended partition. Luft can only grow into free space right next to it, so this space can only become a partition of its own.
# $part is a partition's name; $drive is the drive's name
luft-disks-luft-between-read-only = { $part } sits between Luft and this space, and { $drive } can only be read. Luft can only grow into free space right next to it, so this space can only become a partition of its own.
luft-disks-luft-next-gone = The partition next to Luft is gone
luft-disks-luft-space-gone = This free space is gone

## Other systems

# A copy of Luft that was on this computer before Luft was installed again
luft-disks-system-earlier-luft = Luft’s earlier copy
luft-disks-system-gone = It's already gone
luft-disks-windows-partition-gone = Windows' partition is gone
luft-disks-windows-check-first = Windows wants to check its drive first. Start Windows once, then give it the space.
