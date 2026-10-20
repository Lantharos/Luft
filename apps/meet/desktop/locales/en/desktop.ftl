## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = 64-bit Intel or AMD processor
check-processor-x64-detail = Luft runs on it.
check-processor-arm = Arm processor
check-processor-arm-detail = Luft only runs on Intel and AMD processors for now.
check-processor-32-bit-windows = 32-bit Windows
check-processor-32-bit-system = 32-bit system
check-processor-32-bit-detail = Luft needs a 64-bit Intel or AMD processor.
check-startup-uefi = Starts with UEFI
check-startup-uefi-windows = Luft starts the same modern way.
# $system is the name of the Linux system already installed, like "Fedora Linux 42"
check-startup-uefi-linux = Luft adds its own start entry, and { $system } keeps starting as it does now.
check-startup-bios = Starts in legacy BIOS mode
# MBR2GPT is the name of a Windows tool
check-startup-bios-windows = Luft needs UEFI. Windows can switch with MBR2GPT, then UEFI can be turned on in the firmware settings.
check-startup-bios-linux = Luft needs UEFI. Turn it on in the firmware settings, along with the system already here, then check again.
check-startup-mbr = The drive uses an old partition table
check-startup-mbr-windows = Luft needs a GPT drive. Windows can convert it with MBR2GPT without losing files.
check-startup-mbr-linux = Luft needs a GPT drive to start from.
check-startup-no-esp = No EFI system partition
check-startup-no-esp-detail = Luft adds its start files next to the ones already on the EFI system partition, and there isn't one.
check-startup-esp-full = The EFI system partition is full
# $size is a number of megabytes
check-startup-esp-full-detail = Luft needs { $size } MB there for its start files. Old kernels or start entries usually take up the space.
check-folder-fine = Nothing gets repartitioned
# $filesystem is the name of a file system, like "btrfs" or "ext4"
check-folder-fine-detail = Luft is kept as a file on your { $filesystem } drive and starts from there.
check-folder-encrypted = Your files are on an encrypted drive
check-folder-encrypted-detail = Luft can't start from an encrypted drive yet. Use a USB stick to try it instead.
check-folder-combined = Your files span more than one partition
check-folder-combined-detail = Luft can't start from LVM or RAID yet. Use a USB stick to try it instead.
# $filesystem is the name of a file system, like "ntfs" or "zfs"
check-folder-filesystem = Luft can't start from { $filesystem }
check-folder-filesystem-detail = It starts from ext4, btrfs and XFS drives. Use a USB stick to try it instead.
# $size is a number of gigabytes
check-space-free = { $size } GB free
# $size is a number of gigabytes
check-space-free-linux = Luft takes about { $size } GB while you try it.
# $size is a number of gigabytes
check-space-up-to = Up to { $size } GB for Luft
check-space-up-to-detail = Windows keeps its files and room to grow.
check-space-short = Not enough free space
# $needed and $missing are numbers of gigabytes
check-space-short-windows = Luft needs about { $needed } GB that Windows can give up. Free up { $missing } GB in Windows, for example with Disk Cleanup, then check again.
# $needed and $missing are numbers of gigabytes
check-space-short-linux = Luft needs about { $needed } GB to start from. Free up { $missing } GB, then check again.
check-system-replaceable = Luft can take its place and keep your files, your account and your settings.
check-system-single = Your files share one partition with the system, so replacing it while keeping them isn't supported yet. Trying and installing Luft work.
check-system-encrypted = It's encrypted, so replacing it while keeping your files isn't supported yet.
check-system-unknown = Its drive is laid out in a way Luft can't replace yet while keeping your files.
check-encryption-off = Windows isn't encrypted
check-encryption-off-detail = Install Luft can read its settings and your Bluetooth devices.
check-encryption-on = Windows is encrypted with BitLocker
check-encryption-on-detail = That's fine. Windows makes the room itself, and Meet Luft brings over what Luft can't read from a locked drive. Keep your recovery key nearby, just in case.
check-encryption-changing = BitLocker is still encrypting or decrypting
# "Device encryption" is the name of the page in Windows Settings; use the name Windows uses in your language
check-encryption-changing-detail = Wait until Windows finishes, then come back. You can see how far it is in Settings, under Device encryption.
# Fast Startup is the name of a Windows setting; use the name Windows uses in your language
check-fast-startup-on = Fast Startup is on
check-fast-startup-on-detail = Windows hibernates instead of shutting down, which keeps its drive locked. Meet Luft offers to turn it off before installing.
check-fast-startup-off = Fast Startup is off
check-fast-startup-off-detail = Windows shuts down fully.
check-secure-boot-on = Secure Boot is on
check-secure-boot-on-detail = It can stay on. Luft asks once, on a blue screen, to add its key.
check-secure-boot-off = Secure Boot is off
# $turningOn is one of the check-secure-boot-restart-into or check-secure-boot-turn-on messages
check-secure-boot-off-detail = Luft works without it, though games with anti-cheat need it. { $turningOn }
# $place is where the setting is in the firmware, one of the check-firmware-place messages
check-secure-boot-restart-into = Meet Luft can restart into the firmware settings, where it's under { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft can restart into the firmware settings, where it's usually under Security or Boot.
# $key is one of the check-firmware-key messages, $maker the computer's brand, like "Lenovo",
# and $place one of the check-firmware-place messages
check-secure-boot-turn-on = To turn it on, restart and press { $key } as the { $maker } logo appears, then go to { $place }.
check-secure-boot-turn-on-anywhere = To turn it on, open the firmware settings while the computer starts and look under Security or Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security, then Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, then Secure Boot
check-firmware-place-security-or-advanced = Security or Advanced, then Secure Boot Configuration
check-firmware-place-security-or-boot = Security or Boot, then Secure Boot
check-firmware-place-boot = Boot, then Secure Boot
check-firmware-place-settings = Settings, then Security, then Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 on a ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 or Delete
# The Delete key, labelled Del on many keyboards
check-firmware-key-delete = Delete
# The volume up button on the side of a tablet
check-firmware-key-volume-up = volume up

## More of the computer's hardware

check-tpm-detail = An encrypted Luft can unlock by itself when the computer starts.
check-tpm-missing = No TPM 2.0
check-tpm-missing-detail = If you encrypt Luft, it asks for a passphrase each time it starts.
# Title used when the graphics chip has no name
check-graphics = Graphics
check-graphics-detail = Works out of the box.
check-graphics-nvidia = Luft installs with NVIDIA's own driver.
check-wifi-missing = No Wi-Fi
check-wifi-missing-detail = Use a network cable in Luft, or nothing at all.
check-wifi-detail = Works in Luft.
check-wifi-broadcom = Some Broadcom Wi-Fi chips need a driver Luft doesn't include. Keep a network cable or a phone for USB tethering nearby.
# Start entries are the systems listed in the computer's firmware boot menu
check-start-entries = { $count ->
    [one] An old start entry
   *[other] { $count } old start entries
}
# $names lists the start entries' names, separated by commas
check-start-entries-detail = { $count ->
    [one] { $names } points at a system that isn't on this PC anymore. It can be tidied away.
   *[other] { $names } point at systems that aren't on this PC anymore. They can be tidied away.
}
check-download-unavailable = Luft can't be downloaded right now
check-download-unavailable-detail = Meet Luft downloads about 3 GB. Check that you’re online and check again, or use a Luft ISO you already have.

## Choosing a Luft ISO file

iso-dialog-title = Choose a Luft ISO
# Name of the file type shown in the file picker
iso-dialog-filter = Luft ISO

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

# File name of the saved logs. $name is the original file name, like "2026-10-21 14.02.zip"
logs-file-name = Luft logs { $name }
logs-no-desktop = Meet Luft couldn't find your desktop
logs-not-saved = Meet Luft couldn't save Try Luft's logs: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = Meet Luft's helper didn't start: { $error }
helper-not-allowed = Meet Luft wasn't allowed to work on the drive
helper-stopped = Meet Luft's helper stopped
helper-stopped-because = Meet Luft's helper stopped: { $error }
helper-pipe-failed = Meet Luft couldn't talk to its helper: { $error }
# $pipe is the technical name of the connection between Meet Luft and its helper
helper-pipe-hijacked = Something other than Meet Luft's helper opened { $pipe }
helper-record-not-saved = Meet Luft couldn't note what it made: { $error }
helper-no-room-yet = Make room for Luft first.
helper-not-ready-linux = Get Luft ready first.
helper-not-ready-to-start-windows = Luft isn't ready to start yet. Make room for it first.
helper-not-ready-to-start-linux = Luft isn't ready to start yet. Get it ready first.
helper-update-unfinished = Updating Luft didn't finish. Update it again first.
helper-room-too-small = Luft needs more room than that.
# $available and $needed are numbers of gigabytes
helper-room-shortfall = Windows can give up { $available } GB, and Luft needs { $needed } GB.
# $available and $needed are numbers of gigabytes. "These" are the things chosen to pack.
helper-box-shortfall = Windows can give up { $available } GB more, and these need { $needed } GB.
helper-bluetooth-unreadable = Windows' Bluetooth settings couldn't be opened
# $key is a place in the Windows registry
helper-registry-not-opened = Couldn't open { $key }: { $error }
# $value is the name of a Windows registry setting
helper-registry-not-changed = Couldn't change { $value }: { $error }
# $file is the path of a file
helper-registry-not-saved = Couldn't save { $file }: { $error }
helper-restart-failed = The computer didn't restart
helper-windows-restart-failed = Windows didn't restart: { $error }

## Errors about the computer's firmware

firmware-not-uefi = This PC doesn't start with UEFI
# $name is the technical name of a firmware setting, like "BootOrder"
firmware-variable-unreadable = Couldn't read { $name } from the firmware: { $error }
# $name is the technical name of a firmware setting, like "BootOrder"
firmware-variable-not-saved = Couldn't save { $name } in the firmware: { $error }
firmware-entries-full = The firmware has no room for another start entry
# $entry is the start entry's technical name
firmware-entry-kept = Windows kept the start entry { $entry }

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = The drives couldn't be listed: { $error }
# $path is a folder
drive-of-path-unknown = Couldn't tell which drive holds { $path }
drive-windows-folder-missing = Windows' folder wasn't found
drive-windows-drive-missing = Windows' drive wasn't found
drive-windows-drive-missing-because = Windows' drive wasn't found: { $error }
drive-windows-partition-missing = Windows' partition wasn't found
# $path is the technical name of a volume
drive-volume-missing = The volume { $path } wasn't found
# $what is one of the messages below, $code a number
drive-storage-error = { $what } (Windows storage error { $code })
drive-shrink-size-unknown = Windows couldn't tell how small its partition can get
drive-grow-size-unknown = Windows couldn't tell how large its partition can get
drive-resize-failed = Windows couldn't change the size of its partition
drive-create-failed = Windows couldn't make a partition for Luft
drive-hide-failed = Windows couldn't keep the new partition out of Explorer
drive-format-failed = Windows couldn't format the new partition
drive-remove-failed = Windows couldn't remove one of Luft's partitions
drive-new-partition-missing = The new partition wasn't found
drive-new-partition-no-volume = The new partition has no volume
drive-start-no-guid = The start partition has no GUID
drive-live-no-guid = The live partition has no GUID
drive-box-no-guid = The moving box has no GUID
drive-guid-unreadable = The partition's GUID isn't readable
drive-not-gpt = The drive's partition table isn't GPT
drive-start-no-volume = The start partition has no volume
drive-live-no-volume = Luft's partition has no volume
drive-new-live-no-volume = Luft's new partition has no volume
drive-partitions-not-noted = Luft's partitions are missing from Meet Luft's notes
drive-partitions-gone = Luft's partitions disappeared
drive-partition-gone = A partition disappeared
drive-start-partition-foreign = Luft's start partition isn't one Meet Luft made
drive-start-partition-gone = Luft's start partition is gone
drive-start-partition-not-listed = Luft's start partition isn't in the partition table
drive-no-esp = This computer has no EFI system partition
drive-esp-full = The EFI system partition is too full for Luft's start files.
drive-esp-not-opened = The EFI system partition couldn't be opened
# $file is a technical file name
drive-esp-file-unreadable = The EFI system partition's { $file } isn't readable
drive-esp-no-drive = The EFI system partition has no drive
drive-esp-no-guid = The EFI system partition has no GUID
drive-no-uuid = The drive Luft is kept on has no UUID
drive-folder-unreadable = Luft can't start from the drive your files are on.
# $folder is a folder's path
drive-folder-not-startable = { $folder } can't be started from

## Errors while getting Luft

live-no-home-folder = There's no home folder to keep Luft in
live-no-app-data-folder = There's no local app data folder to keep Luft in
live-pointer-unreadable = The newest Luft isn't readable
live-not-published = Luft isn't published there
live-checksum-unreadable = The checksum file isn't readable
live-checksum-not-read = Luft's checksum couldn't be read: { $error }
live-download-damaged = The download was damaged on the way. Try again.
# $file is the path of a file inside Luft's ISO
live-download-incomplete = The downloaded Luft is missing { $file }
live-download-not-resumable = The server can't continue the download
# $iso is a file name, like "luft-nightly.iso"
live-not-signed = { $iso } isn't signed
# $iso is a file name, like "luft-nightly.iso"
live-signature-unreadable = The signature of { $iso } isn't readable
# $iso is a file name, like "luft-nightly.iso". Lantharos makes Luft.
live-signature-wrong-key = { $iso } isn't signed by Lantharos
# $signed and $iso are file names, like "luft-nightly.iso"
live-signature-other-iso = The signature is for { $signed }, not { $iso }
live-iso-out-of-order = The ISO's files aren't in an order Meet Luft can read
live-iso-not-iso = This isn't an ISO image
live-iso-no-root = The ISO has no root folder
# Joliet is the name of a part of the ISO format
live-iso-no-joliet = The ISO has no Joliet names
# $path is a folder's path
live-not-removed = { $path } couldn't be removed: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = The stick isn't there anymore. Plug it back in and choose it again.
stick-too-small = Luft doesn't fit on this stick. Use one of 4 GB or more.
stick-damaged = The ISO doesn't match its checksum. It may have been damaged on the way.
stick-read-back-differs = The stick didn't read back what was written to it. It may be worn out, so try another one.
stick-download-unavailable = Luft can't be downloaded right now: { $error }
stick-download-failed = Luft couldn't be downloaded: { $error }
stick-checksum-unreadable = The ISO's checksum can't be read: { $error }
# $path is the ISO file's path
stick-file-unreadable = { $path } can't be read: { $error }
stick-iso-unreadable = The ISO can't be read: { $error }
stick-iso-no-name = The ISO has no name
stick-iso-ended-early = The ISO ended early
# $name is the ISO file's name
stick-iso-already-there = { $name } is already on the stick.
# $size is a number of megabytes
stick-no-room = There isn't room for Luft on the stick. Free up { $size } MB on it first.
stick-older-not-removed = The older Luft couldn't be removed: { $error }
stick-copy-stopped = Copying Luft to the stick stopped: { $error }
stick-not-opened = The stick couldn't be opened: { $error }
stick-write-stopped = Writing to the stick stopped: { $error }
# The stick didn't confirm that everything written to it was saved
stick-not-synced = The stick didn't take everything: { $error }
stick-read-back-failed = The stick couldn't be read back: { $error }
stick-in-use = The stick is still in use: { $error }
# $device is the stick's technical name, like "/dev/sdb1"
stick-device-in-use = { $device } is still in use: { $error }
stick-volume-not-opened = The stick's volume couldn't be opened: { $error }
stick-volume-in-use = The stick is still in use. Close what has files open on it and try again ({ $error })
stick-not-dismounted = Windows couldn't let go of the stick: { $error }
stick-not-cleared = Windows couldn't clear the stick: { $error }
stick-not-refreshed = Windows couldn't look at the stick again: { $error }
stick-not-ventoy = This stick doesn't use Ventoy anymore.
stick-ventoy-not-opened = Ventoy's partition couldn't be opened: { $error }
stick-ventoy-not-opened-windows = Windows can't open Ventoy's partition
# UDisks is the name of a Linux service
stick-udisks-missing = Meet Luft needs UDisks to use the stick: { $error }
