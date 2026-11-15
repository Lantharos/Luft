## Shared

disks-cancel = Cancel
disks-done = Done
disks-back = Back
disks-continue = Continue
disks-save = Save
disks-drives = Drives
disks-no-drives = No drives found.
# The menu button on a row, for the drive, partition or file named in it.
disks-more = More for { $name }
# A part of a drive's bar, for people using a screen reader, such as "Photos, 20 GB".
disks-segment = { $name }, { $size }
    .tooltip = { $name } · { $size }
disks-used = { $size } used
disks-free = { $size } free
# Shown in an empty name field.
disks-untitled = Untitled
disks-name = Name
disks-name-limit = { $limit ->
    [one] Up to { $limit } character for this format
   *[other] Up to { $limit } characters for this format
}
disks-explore = See what’s using space
# The window's title while editing a drive's partitions.
disks-editor-title = Partitions on { $drive }

## Drives and partitions

disks-drive-system = Runs this system
# Makes a removable drive safe to unplug and turns it off.
disks-drive-remove = Safely remove
disks-drive-eject = Eject
disks-partitions = Partitions
disks-no-partitions = No partitions
disks-free-luft-waiting = { $size }, Luft moves in at the next start
# Cancels giving this free space to Luft at the next start.
disks-free-keep = Keep it free
disks-free-give-luft = Give to Luft
# A button that makes a new partition in free space.
disks-new = New
disks-new-partition = New partition
disks-systems = Other systems
# Removes another operating system from this drive.
disks-systems-remove = Remove

# What kind of drive this is, shown in its details.
disks-drive-kind = { $kind ->
    [nvme] NVMe drive
    [ssd] Solid-state drive
    [hdd] Hard drive
    [usb] USB drive
    [card] Memory card
    [optical] Disc drive
   *[image] Disk image
}
# Under a drive's name: its size and kind, such as "512 GB NVMe drive".
disks-drive-summary = { $kind ->
    [nvme] { $size } NVMe drive
    [ssd] { $size } solid-state drive
    [hdd] { $size } hard drive
    [usb] { $size } USB drive
    [card] { $size } memory card
    [optical] { $size } disc drive
   *[image] { $size } disk image
}
disks-free-space = Free space
# A partition with no name or label of its own.
disks-partition-numbered = Partition { $number }
disks-filesystem-unknown = Unknown
disks-filesystem-none = No filesystem
disks-filesystem-swap = Swap
disks-filesystem-encrypted = Encrypted

# What is happening to a partition right now.
disks-job = { $operation ->
    [formatting] Formatting
    [erasing] Erasing
    [creating] Creating
    [deleting] Deleting
    [changing] Changing
    [resizing] Resizing
    [mounting] Mounting
    [unmounting] Unmounting
    [unlocking] Unlocking
    [locking] Locking
    [checking] Checking
    [repairing] Repairing
    [testing] Testing
    [ejecting] Ejecting
    [powering-off] Powering off
   *[other] Working
}
# What is happening to a partition and how far along it is, such as "Formatting 40%".
disks-job-progress = { $operation ->
    [formatting] Formatting { $progress }
    [erasing] Erasing { $progress }
    [creating] Creating { $progress }
    [deleting] Deleting { $progress }
    [changing] Changing { $progress }
    [resizing] Resizing { $progress }
    [mounting] Mounting { $progress }
    [unmounting] Unmounting { $progress }
    [unlocking] Unlocking { $progress }
    [locking] Locking { $progress }
    [checking] Checking { $progress }
    [repairing] Repairing { $progress }
    [testing] Testing { $progress }
    [ejecting] Ejecting { $progress }
    [powering-off] Powering off { $progress }
   *[other] Working { $progress }
}

## Partition types

disks-partition-type-linux-data = Linux data
disks-partition-type-linux-root = Linux root
disks-partition-type-linux-home = Linux home
disks-partition-type-linux-encrypted = Linux encrypted
disks-partition-type-linux-lvm = Linux LVM
disks-partition-type-linux-swap = Linux swap
disks-partition-type-linux-boot = Linux boot
disks-partition-type-efi = EFI system
disks-partition-type-bios-boot = BIOS boot
disks-partition-type-microsoft-data = Microsoft basic data
disks-partition-type-microsoft-reserved = Microsoft reserved
disks-partition-type-windows-recovery = Windows recovery
disks-partition-type-apple-hfs = Apple HFS+
disks-partition-type-apple-apfs = Apple APFS
# The type of a Linux partition in an old-style (MBR) partition table.
disks-partition-type-linux = Linux
disks-partition-type-ntfs-exfat = NTFS or exFAT
# An old-style partition that holds further partitions inside it.
disks-partition-type-extended = Extended

## Partition flags

disks-flag-firmware = Needed by the firmware
    .description = Tools leave it alone, even when it looks unused
disks-flag-legacy-boot = Bootable on older computers
    .description = Marks it for computers that start without UEFI
disks-flag-hidden = Hidden
    .description = File managers don’t show it
disks-flag-no-automount = Don’t mount automatically
    .description = It stays unmounted until someone mounts it
disks-flag-bootable = Bootable
    .description = Marks it as the partition the computer starts from

## Drive health

disks-health-title = { $state ->
    [failing] Failing
    [warning] Wearing out
   *[good] Healthy
}
disks-health-summary = { $state ->
    [failing] Back up your files now
   *[warning] Back up anything important
}
# How long the drive has been powered on over its life, such as "3 months of use".
disks-health-use = { $duration } of use
disks-health-advice-failing = Back up your files now and replace it soon.
disks-health-advice-warning = Back up anything important and keep an eye on it.
disks-health-advice-sectors = { $count ->
    [one] { $count } sector can no longer be read reliably. Back up anything important.
   *[other] { $count } sectors can no longer be read reliably. Back up anything important.
}
disks-selftest-passed = Passed last time
disks-selftest-stopped = Stopped last time
disks-selftest-problems = Found problems last time

## Partition and drive menus

disks-action-open = Open
disks-action-mount = Mount
disks-action-unmount = Unmount
disks-action-unlock = Unlock
disks-action-lock = Lock
disks-action-pause = Pause
disks-action-resume = Resume
disks-action-details = Details
disks-action-rename = Rename…
disks-action-startup = Mount at startup…
disks-action-resize = Resize or move…
disks-action-encryption = Encryption…
disks-action-encrypt = Turn on encryption…
disks-action-passphrase = Change passphrase…
disks-action-forget = Forget saved passphrase
disks-action-save-image = Save as disk image…
disks-action-restore-image = Restore disk image…
disks-action-format = Format…
disks-action-delete = Delete partition…
disks-action-drive-details = Drive details
disks-action-edit = Edit partitions…
disks-action-format-drive = Format drive…
disks-action-move-luft = Move Luft to another drive…

## Details

disks-details-kind = Kind
disks-details-size = Size
# A drive's size, then its exact size in bytes.
disks-details-size-bytes = { $count ->
    [one] { $size } ({ $count } byte)
   *[other] { $size } ({ $count } bytes)
}
disks-details-model = Model
disks-details-serial = Serial number
disks-details-device = Device
disks-details-table = Partition table
disks-details-table-kind = { $table ->
    [gpt] GUID (GPT)
    [dos] Master Boot Record
   *[none] None
}
disks-details-access = Access
disks-details-read-only = Read only
disks-details-format = Format
disks-details-encrypted = { $filesystem }, encrypted
disks-details-locked = Encrypted, locked
disks-details-holds = Holds
disks-details-holds-luft = Luft, your files and your apps
disks-details-mounted-at = Mounted at
disks-details-startup = At startup
disks-details-startup-mounts = Mounts at { $folder }
disks-details-technical = Technical details
disks-details-technical-title = Technical details of { $name }
disks-details-uuid = UUID
disks-details-contents-uuid = Contents UUID
disks-details-partition-type = Partition type
disks-details-partition-name = Partition name
disks-details-partition = Partition
# A partition's number on its drive, such as "2 on /dev/sda".
disks-details-partition-number = { $number } on { $device }

## Drive health dialog

disks-health-dialog-title = { $state ->
    [good] This drive is healthy
   *[other] This drive needs attention
}
disks-health-temperature = Temperature
disks-health-powered-on = Powered on for
disks-health-bad-sectors = Unreadable sectors
disks-health-selftest = Self-test
disks-health-selftest-running = Running
disks-health-selftest-running-progress = Running, { $progress } done
disks-health-selftest-never = Never run
disks-health-stop-test = Stop test
disks-health-quick-test = Quick test
    .tooltip = A couple of minutes, while you keep using it
disks-health-full-test = Full test
    .tooltip = Can take hours, while you keep using it

## Rename and mount at startup

disks-rename-title = Rename “{ $name }”
disks-rename-action = Rename
disks-startup-title = Mount “{ $name }” at startup
disks-startup-enabled = Mount for everyone when the computer starts
disks-startup-folder = Folder
disks-startup-folder-invalid = Use a full folder path, such as /mnt/data
disks-startup-read-only = Read only

## Formatting and new partitions

disks-create-title = New partition
disks-create-size = Size
disks-create-action = Create
disks-create-working = Creating
disks-format-partition-title = Format partition
disks-format-drive-title = Format drive
disks-format-partition-loss = Everything on “{ $name }” on { $drive } will be erased.
disks-format-drive-loss = Every partition and everything on { $drive } ({ $size }) will be erased.
disks-format-action = Erase and format
disks-format-working = Formatting
disks-format-purpose = Use with
disks-format-purpose-everywhere = All computers
disks-format-purpose-linux = Linux only
disks-format-purpose-other = Other
disks-format-hint-everywhere = exFAT · Windows, Mac, Linux, cameras and TVs
disks-format-hint-linux = ext4 · Fastest on Linux, can be encrypted
disks-format-filesystem = Format
# A format this computer can't make yet; $missing names the software it needs.
disks-format-needs = { $filesystem } (needs { $missing })
disks-format-needs-software = { $filesystem } (needs extra software)
disks-format-encrypt = Encrypt with a passphrase
    .tooltip = Nobody can read it without the passphrase
disks-format-overwrite = Overwrite old data
    .tooltip = So it can’t be recovered. Takes much longer.
disks-passphrase = Passphrase
disks-passphrase-confirm = Confirm passphrase
disks-passphrase-mismatch = The passphrases don’t match
disks-remember = Remember in my keyring
# The size of a new partition, typed in gigabytes; $label is the field's name.
disks-size-gigabytes = { $label } in gigabytes
disks-size-gigabytes-unit = GB
disks-typed-name = This drive is built into the computer. To erase it, type its name: { $name }
disks-typed-name-label = Name of the drive

## Deleting, discarding and closing

disks-delete-title = Delete “{ $name }”?
disks-delete-description = The partition and all { $size } on it will be removed from { $drive }. This can't be undone.
disks-delete-action = Delete partition
disks-discard-title = Discard the planned changes?
disks-discard-description = Nothing on the drive has changed yet.
disks-discard-action = Discard
disks-still-working = Disks is still working
disks-still-working-description = { $work ->
    [writing] A disk image is still being written. Stopping now leaves the drive partly written, and the image has to be written again.
    [saving] A disk image is still being saved. Stopping now leaves it unfinished.
   *[other] It can close once this is finished. Stopping partway could leave the drive unreadable.
}
disks-still-working-stop = Stop
disks-still-working-keep = Keep going

## Freeing up space

disks-trash-title = Move “{ $name }” to the trash?
disks-trash-description = { $kind ->
    [folder] It and everything in it take up { $size }, freed once the trash is emptied.
   *[file] It takes up { $size }, freed once the trash is emptied.
}
disks-trash-action = Move to trash
disks-clean-trash = Empty the trash?
disks-clean-trash-description = Everything in it, { $size }, will be deleted for good.
disks-clean-trash-action = Empty trash
disks-clean-downloads = Move old downloads to the trash?
disks-clean-downloads-description = { $count ->
    [one] { $count } item in Downloads hasn’t changed in over 30 days. It takes up { $size }, freed once the trash is emptied.
   *[other] { $count } items in Downloads haven’t changed in over 30 days. They take up { $size }, freed once the trash is emptied.
}
disks-clean-downloads-action = Move to trash
disks-clean-caches = Clear app caches?
disks-clean-caches-description = This frees up to { $size }. Some apps may open slower the next time.
disks-clean-caches-action = Clear caches

## Disk images

disks-image-progress = { $direction ->
    [writing] { $finished ->
        [yes] Disk image written
       *[no] Writing disk image
    }
   *[saving] { $finished ->
        [yes] Disk image saved
       *[no] Saving disk image
    }
}
disks-image-copied = { $size } copied
disks-image-progress-total = { $copied } of { $total }
# $rate is how much is copied each second, such as "40 MB".
disks-image-progress-rate = { $copied } of { $total } · { $rate }/s
disks-image-save-title = Save as disk image
disks-image-file = File name
disks-image-folder = Folder
disks-image-change-folder = Change…
disks-image-write-title = Write “{ $name }” to a drive
disks-image-write-none = Plug in a drive of at least { $size }.
disks-image-write-confirm = Write “{ $name }” to { $drive }?
disks-image-write-loss = Everything on { $drive } ({ $size }) will be erased and replaced by this { $image } image. This can't be undone.
disks-restore-title = Write “{ $name }”?
disks-restore-drive = Everything on { $drive } ({ $size }) will be replaced by the { $image } image. This can't be undone.
disks-restore-partition = Everything on “{ $name }” on { $drive } will be replaced by the { $image } image. This can't be undone.
disks-restore-action = Erase and write

## Encryption

disks-encryption-title = “{ $name }” is encrypted
disks-encryption-title-encrypting = Encrypting “{ $name }”
disks-encryption-title-decrypting = Decrypting “{ $name }”
disks-encryption-unavailable = Encrypting drives isn’t available on this computer.
disks-encryption-auto-unlock = Unlock automatically
    .hint = { $drive ->
        [removable] Opens without asking when you plug it in
       *[built-in] Opens without asking when this computer starts
    }
disks-encryption-recovery-key = Recovery key
    .hint = Opens it when nothing else does
disks-encryption-recovery-key-show = Show…
disks-encryption-recovery-key-new = New key…
disks-encryption-passphrase = Passphrase
    .hint = Unlocks it here and on other computers
disks-encryption-passphrase-change = Change…
disks-encryption-saved = Saved in your keyring
    .hint = Unlocking it here needs no typing
disks-encryption-forget = Forget
disks-encryption-turn-off-more = Turn off encryption…
disks-encryption-turn-off-title = Turn off encryption for “{ $name }”?
disks-encryption-turn-off-description = Afterwards, anyone who has the drive can read what’s on it.
disks-encryption-turn-off = Turn off encryption
disks-encryption-key-prompt = Passphrase or recovery key
disks-encryption-wrong-key = That passphrase or recovery key doesn’t unlock it
# On a partition's row while it's encrypted or decrypted, such as "Encrypting… 40%".
disks-encryption-row-running = { $change ->
    [decrypt] Decrypting… { $progress }
   *[encrypt] Encrypting… { $progress }
}
disks-encryption-row-paused = { $change ->
    [decrypt] Decrypting paused
   *[encrypt] Encrypting paused
}
# Encrypting or decrypting waits until the drive is connected and unlocked.
disks-encryption-row-waiting = { $change ->
    [decrypt] Decrypting waits
   *[encrypt] Encrypting waits
}
disks-encryption-paused = Paused at { $progress }. It continues when you resume it.
disks-encryption-waiting = { $progress } done. It continues once the drive is connected and unlocked.
disks-encryption-progress = { $progress } done
disks-encryption-progress-seconds = { $progress } done, less than a minute left
disks-encryption-progress-minutes = { $count ->
    [one] { $progress } done, about { $count } minute left
   *[other] { $progress } done, about { $count } minutes left
}
disks-encryption-progress-hours = { $count ->
    [one] { $progress } done, about { $count } hour left
   *[other] { $progress } done, about { $count } hours left
}
disks-recovery-key-title = Recovery key for “{ $name }”
disks-recovery-key-description = Keep a copy somewhere other than this drive and computer.

## Turning on encryption

disks-encrypt-title = Encrypt “{ $name }”
disks-encrypt-blocked = “{ $name }” can’t be encrypted
disks-encrypt-reformat = “{ $name }” can only be encrypted by formatting it
disks-encrypt-description = Your files stay where they are.
disks-encrypt-reformat-description = This erases everything on it. Copy anything you want to keep first.
disks-encrypt-key = Save the recovery key
disks-encrypt-key-description = Keep it somewhere other than this drive and computer.
disks-encrypt-unlock = How it unlocks
disks-encrypt-use-passphrase = Use a passphrase
    .hint = { $drive ->
        [removable] To open it on other computers
       *[built-in] Asked for when it doesn’t unlock by itself
    }
disks-encrypt-choose = Choose at least one.
disks-encrypt-ready = Ready to encrypt
disks-encrypt-ready-reformat = Ready to erase and encrypt
disks-encrypt-summary-erased = Everything on “{ $name }” is erased.
disks-encrypt-summary-formatted = It’s formatted as ext4 and encrypted.
disks-encrypt-summary-auto = { $drive ->
    [removable] It unlocks by itself when you plug it in here.
   *[built-in] It unlocks by itself when this computer starts.
}
disks-encrypt-summary-background = It’s unavailable for a few seconds, then encrypts in the background while you use it.
disks-encrypt-summary-until-done = Until it’s done, it opens with the recovery key instead of the passphrase.
disks-encrypt-summary-keep-on = { $drive ->
    [removable] Keep the computer plugged in and the drive connected. An interruption only pauses it.
   *[built-in] Keep the computer plugged in. An interruption only pauses it.
}
disks-encrypt-finish = Encrypt
disks-encrypt-finish-reformat = Erase and encrypt
disks-encrypt-starting = Starting

## Unlocking and passphrases

disks-unlock-title = Unlock “{ $name }”
disks-unlock-wrong = That passphrase isn’t right
disks-unlock-working = Unlocking
disks-passphrase-change-title = Change passphrase for “{ $name }”
disks-passphrase-current = Current passphrase
disks-passphrase-current-wrong = The current passphrase isn’t right
disks-passphrase-new = New passphrase
disks-passphrase-new-confirm = Confirm new passphrase
disks-passphrase-change-action = Change
