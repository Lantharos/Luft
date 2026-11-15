# The app's name, used as its window title and when it keeps the computer from sleeping
disks-app-name = Disks

## Keeping the computer awake while Disks works

# Why the computer can't sleep or log out right now
disks-hold-changing = Changing partitions
disks-hold-formatting = Formatting a drive
disks-hold-removing = Removing another system
disks-hold-saving-image = Saving a disk image
disks-hold-writing-image = Writing a disk image

## Drives and partitions

disks-drive-gone = This drive is gone
disks-drive-no-selftest = This drive can't test itself
disks-partition-gone = This partition is gone
disks-partition-no-table = This partition has no table
disks-volume-no-identifier = This volume has no identifier
disks-plan-no-file-system = There's no file system to name
disks-move-start-mismatch = The start of the moved partition didn't read back the same

## Checks before changing a drive

disks-guard-space-taken = The drive has changed since this was planned, so that space is no longer free
# $drive is the drive's name, such as its maker and model
disks-guard-read-only = { $drive } can only be read
# $drive is the drive's name, such as its maker and model
disks-guard-move-interrupted = A move on { $drive } was interrupted and has to finish first
# $drive is the drive's name, such as its maker and model
disks-guard-system-drive = The running system uses “{ $drive }”, so it can't be erased while it runs
# $volume is a partition's label or device name
disks-guard-no-longer-fits = The drive has changed since this was planned, so “{ $volume }” no longer fits there
# $volume is a partition's label or device name
disks-guard-system-volume = The running system uses “{ $volume }”, so it can't be changed while it runs
# $volume is a partition's label or device name
disks-guard-extended-move = “{ $volume }” sits inside an extended partition, so it can't be moved
# $volume is a partition's label or device name
disks-guard-extended-resize = “{ $volume }” sits inside an extended partition, so it can't be resized
# $volume is a partition's label or device name
disks-guard-encrypted-resize = “{ $volume }” is encrypted, so it can't be resized

## Encryption passphrases

disks-passphrase-not-saved = The passphrase couldn't be saved in your keyring
# The name of the passphrase in the keyring; $volume is the volume's label or device name
disks-passphrase-keyring-label = Encryption passphrase for { $volume }

## Encrypting drives

disks-trust-needs-device-encryption = Only a computer whose own disk is encrypted can unlock this drive by itself, since the key that unlocks it is kept on that disk.
disks-trust-unknown-method = Disks can't tell how to encrypt this drive

## Recovery keys

# Who a saved or printed recovery key is for; $drive is the drive's name and $computer the computer's name
disks-recovery-sheet-name = { $drive } on { $computer }
# The suggested name of a saved recovery key file; $drive is the drive's name
disks-recovery-file-name = Recovery key for { $drive }.txt
# Printed below a recovery key, keeping each line as its own printed line
disks-recovery-explanation =
    If this drive asks for a recovery key, type this key to unlock it.
    Keep it somewhere other than the drive and this computer,
    such as on paper or in a password manager.

## Disk images

disks-image-exists = A file with that name is already there
# Title of the dialog for picking where to save a disk image
disks-image-choose-folder = Choose a folder
# The kind of files the file dialog shows
disks-image-filter = Disk images
# Title of the dialog for picking a disk image to write
disks-image-choose = Choose a disk image
disks-image-not-local = Disk images can only be opened from local folders
disks-image-too-big = This image is bigger than the space it would be written to
disks-image-busy = Another disk image is still being copied

## Space

disks-space-not-measuring = Nothing is being measured
disks-space-folders-only = Only folders can be measured
# The file or folder someone picked has been moved or deleted
disks-space-gone = It's no longer there
disks-space-nothing-to-move = Nothing to move
disks-space-still-measuring = Wait until this folder has been measured
disks-space-nothing-to-clean = Nothing here can be cleaned up
