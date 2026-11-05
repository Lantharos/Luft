## Errors shown in Install Luft and first-run setup

installer-not-allowed = You aren't allowed to do this.
installer-stopped = The installer stopped unexpectedly.
# $error is a technical description of what was wrong
installer-request-invalid = The request isn't valid: { $error }
# $error is a technical description of what was wrong
installer-settings-invalid = The settings aren't valid: { $error }
installer-busy = Luft is already being installed.
installer-account-exists = The account was already made.

## Choosing what to install

# $variant is the name of a system image variant, like "nvidia"
installer-no-image = There's no { $variant } image to install.
# $path is a file path
installer-write-failed = Couldn't write { $path }

## Checking the destination

installer-drive-gone = That drive isn't connected anymore.
installer-drive-unusable = Luft can't be installed on that drive.
installer-system-gone = That system isn't there anymore.
# $system is the name of a Linux system, like "Fedora Linux 42"
installer-system-unreplaceable = Luft can't replace { $system } yet.
installer-drive-running = Luft is starting from that drive right now, so it can't be erased.
installer-windows-unshrinkable = Windows on that drive can't be made smaller.
installer-size-wont-fit = That size doesn't fit next to Windows.
installer-space-gone = That free space isn't there anymore.
installer-space-too-small = That free space is too small for Luft.

## Account and regional settings

installer-user-name-invalid = That user name can't be used.
installer-full-name-invalid = A name can't contain colons, commas or line breaks.
installer-password-missing = Choose a password.
installer-account-not-saved = The new account wasn't saved
installer-account-missing = The new account is missing
installer-regional-invalid = Those regional settings aren't valid.
# $zone is a time zone name, like "Europe/Berlin"
installer-unknown-zone = The new system doesn't know the time zone { $zone }.

## Installing

installer-esp-partition-failed = Couldn't make the EFI system partition
installer-startup-partition-failed = Couldn't make the partition for Luft's startup files
installer-root-partition-failed = Couldn't make the partition for Luft
installer-encryption-failed = Luft's partition couldn't be encrypted
installer-shrink-failed = Windows couldn't be made smaller
installer-no-esp = The drive has no EFI system partition
installer-no-root = No partition for Luft was made
installer-copy-failed = Luft couldn't be copied
installer-no-deployment = The new system has no deployment
installer-deployment-unnamed = The new system's deployment has no name
installer-deployment-unopened = The new system couldn't be opened
installer-boot-menu-failed = Luft's boot menu couldn't be put on the EFI system partition
installer-key-queue-failed = Luft's Secure Boot key couldn't be queued for the next restart

## Replacing a Linux system

installer-encryption-keeps-old = Luft can't be encrypted when it keeps the old system's files next to it.
installer-leftovers-failed = What an earlier attempt left couldn't be cleared
installer-default-failed = Luft couldn't be made the system that starts
installer-relabel-failed = Your files couldn't be labelled for Luft
installer-set-aside-failed = The old system couldn't be set aside

## Things packed with Meet Luft

# The moving box holds the files someone packed in Windows to bring into Luft
installer-box-unopened = The moving box couldn't be opened
installer-box-no-list = The moving box has no list of what's in it
# $path is a file path
installer-unpack-failed = Couldn't unpack { $path }
installer-wallpaper-unnamed = The wallpaper has no name
