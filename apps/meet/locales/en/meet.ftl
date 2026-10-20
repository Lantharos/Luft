## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Back
meet-cancel = Cancel
meet-continue = Continue
meet-try-again = Try again
# Button, verb: restarts the computer
meet-restart = Restart
# Button, verb
meet-remove = Remove
# Button that keeps Luft instead of removing it
meet-keep-it = Keep it
# Button that closes Meet Luft
meet-close = Close
meet-restart-title = Restart now?
# Button that puts off restarting
meet-not-yet = Not yet
# Button that picks a Luft ISO file instead of downloading Luft
meet-iso-use = Use an ISO I already have
# Shown on the same button once an ISO file is picked
meet-iso-using = Using your Luft ISO
# Title bar text while Meet Luft downloads nightly builds instead of releases
meet-nightly = Nightly builds
meet-channel-nightly = Meet Luft will use nightly builds
meet-channel-latest = Meet Luft will use releases again
# Button in a notice, takes back the last change
meet-undo = Undo
# "Try Luft" is starting Luft for a try without installing it
meet-logs-saved = Saved the logs from Try Luft to your desktop
# Button in a notice that shows the saved file
meet-logs-show = Show
meet-logs-none = There are no logs from Try Luft yet
meet-logs-failed = Meet Luft couldn’t save the logs from Try Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft couldn’t finish looking at this computer.
   *[windows] Meet Luft couldn’t finish looking at this PC.
}
problem-room = Making room for Luft didn’t finish.
problem-room-linux = Getting Luft ready didn’t finish.
problem-update = Updating Luft didn’t finish.
problem-download = Luft’s download stopped. Check that you’re online.
# "Your things" are the files and settings packed to take along to Luft
problem-pack = Packing your things didn’t finish.
problem-remove = Removing Luft didn’t finish.
problem-restart = Meet Luft couldn’t set up the restart.
# Start entries are the systems listed in the computer's firmware boot menu
problem-tidy = The old start entries couldn’t be removed.
problem-firmware = Meet Luft couldn’t open the firmware settings.
problem-folders = Meet Luft couldn’t look through your folders.
problem-sticks = Meet Luft couldn’t look for USB drives.
problem-stick = Making the stick didn’t finish.
problem-offer = Luft can’t be downloaded right now. Check that you’re online, or use an ISO you already have.
# Shown when the permission prompt was turned down
problem-declined = { $platform ->
    [linux] Meet Luft needs your permission to work on the drive. Enter your password when it asks.
   *[windows] Meet Luft needs your permission to work on the drive. Choose Yes when Windows asks.
}

## First screen

hello-intro = { $platform ->
    [linux] Try Luft right from here, without a USB stick. When you like it, Luft can take this system’s place and keep your files.
   *[windows] Luft can live right next to Windows. Try it first without installing anything, and bring your things along when you’re ready.
}
hello-check = { $platform ->
    [linux] Check this computer
   *[windows] Check this PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Looking at this computer
   *[windows] Looking at this PC
}
check-ready-title = { $platform ->
    [linux] This computer is ready for Luft
   *[windows] This PC is ready for Luft
}
check-blocked-title = Almost there
check-moment = This takes a moment.
check-slow = Windows is working out how much room it can spare. On a big drive this can take a few minutes.
check-blocked-description = Something needs to change before Luft can move in. Here’s what to do.
check-found-description = Here’s what Meet Luft found.
check-checking = Checking the drive, the firmware and the hardware…
check-again = Check again
check-action-firmware = Open firmware settings
# Button that removes start entries left behind by systems that are gone
check-action-tidy = Tidy up
check-firmware-title = Restart into the firmware settings?
check-firmware-description = Save anything you’re working on first. Turn on Secure Boot there and save, and your computer starts again as usual.
check-tidy-title = Remove the old start entries?
check-tidy-description = They only point at systems that are already gone. Windows and everything else start just like before.
check-get-ready-title = Get Luft ready?
check-get-ready-file = Meet Luft copies Luft from your ISO into a folder on this computer and adds a start entry for it. Nothing is repartitioned.
# $size is the download size, like "2.1 GB"
check-get-ready-download = Meet Luft downloads Luft, about { $size }, into a folder on this computer and adds a start entry for it. Nothing is repartitioned.
check-get-ready-confirm = Get it ready

## Choosing how much of the Windows drive Luft gets

room-title = How much room for Luft?
room-description = Windows makes itself smaller to give Luft space. Your files in Windows stay exactly where they are.
# $size is the space Luft starts from, like "3.2 GB"
room-live = Windows keeps room to grow. Luft also sets aside { $size } to start from, which it gives back once it’s installed.
# Button, verb
room-make = Make room
# $size is the space chosen for Luft, like "120 GB"
room-confirm-title = Give Luft { $size }?
room-confirm-file = Windows shrinks its drive, then Meet Luft copies Luft from your ISO. Keep the PC plugged in.
# $size is the download size, like "2.1 GB"
room-confirm-download = Windows shrinks its drive, then Meet Luft downloads Luft, about { $size }. Keep the PC plugged in and online.

## Luft is ready on Windows

ready-title = Luft is ready
ready-description = Choose how you’d like to meet it. Windows starts as usual afterwards, unless you install Luft and choose it.
ready-update-title = Get the newest Luft
ready-update-description = A newer build is out. It replaces this one and keeps the room and anything you packed.
ready-try-title = Try Luft
ready-try-description = Restart into Luft without installing anything. Windows starts as usual next time.
ready-box-description = Pack documents, photos, Wi-Fi networks and more for Luft to unpack when it’s installed.
# $size is how much was packed, like "12 GB"
ready-box-packed = Packed, { $size }
ready-install-title = Install Luft
# $size is the space waiting for Luft, like "120 GB"
ready-install-description = Restart into the installer. The { $size } next to Windows is already waiting for it.
ready-stick-description = Put Luft on a stick to start it on any computer.
ready-remove = Remove Luft from this PC
ready-restart-try = Save anything you’re working on first. Luft opens in a minute or so, and the next restart brings you back to Windows.
ready-restart-install = Save anything you’re working on first. The installer opens in a minute or so, and nothing changes until you confirm there.
ready-fast-startup-title = Turn off Fast Startup in Windows
ready-fast-startup-description = Windows then shuts down fully, so sound, Wi-Fi and Bluetooth start fresh in Luft.
# Makes Windows and Luft read the hardware clock the same way
ready-clock-title = Keep the clock right in both
ready-clock-description = Windows reads the computer’s clock the way Luft does, so the time no longer jumps when you switch.
ready-remove-title = Remove Luft from this PC?
# The moving box holds the things packed to take along to Luft
ready-remove-description = Meet Luft deletes everything it added, including the moving box, and gives Windows all of its space back.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Choose how you’d like to meet it. { $system } keeps starting as usual until you decide otherwise.
# Stands in for $system when Meet Luft can't tell which system is installed
linux-ready-this-system = this system
linux-ready-update-description = A newer build is out. It replaces the one Meet Luft keeps and keeps the logs from trying it.
linux-ready-try-description = Restart into Luft without changing anything. { $system } starts as usual next time.
linux-ready-replace-title = Replace { $system }
linux-ready-replace-description = Luft takes its place and keeps your files, your account, Wi-Fi networks and other drives. The old system stays until you remove it.
linux-ready-install-description = Restart into the installer to put Luft on another drive or in free space.
linux-ready-remove = Remove Luft from this computer
linux-ready-restart-try = Save anything you’re working on first. Luft opens in a minute or so, and the next restart brings you back to { $system }.
linux-ready-restart-replace = Save anything you’re working on first. The installer opens with { $system } chosen to replace, and shows what stays before anything changes.
linux-ready-remove-title = Remove Luft from this computer?
linux-ready-remove-description = Meet Luft deletes Luft’s files, its start files and its start entry. Everything else stays as it is.

## Packing things to take along to Luft (the moving box)

box-title = Bring your things
box-description = Choose what to take along. Luft unpacks it into your new account when it’s installed, and nothing is removed from Windows.
box-looking = Looking through your folders…
box-folder-desktop = Desktop
box-folder-documents = Documents
box-folder-downloads = Downloads
box-folder-music = Music
box-folder-pictures = Pictures
box-folder-videos = Videos
# $size is the folder's size, like "4.2 GB"
box-folder-size = { $size }, { $files ->
    [one] { $files } file
   *[other] { $files } files
}
box-wifi-title = Wi-Fi networks
box-wifi-description = With their passwords, so Luft is online right away
box-bluetooth-title = Bluetooth devices
box-bluetooth-description = { $devices ->
    [one] { $devices } device, ready without pairing again
   *[other] { $devices } devices, ready without pairing again
}
box-wallpaper-title = Wallpaper
box-wallpaper-description = The picture on your Windows desktop
box-account-title = Your name and picture
# $size is the total of everything chosen, like "38 GB"
box-total-slow = { $size }, which takes about { $minutes ->
    [one] { $minutes } minute
   *[other] { $minutes } minutes
} to pack
# Button, verb
box-pack = Pack

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = Making room
    .description = Windows is moving its files to make space. This can take a few minutes.
working-partitioning = Setting up Luft’s space
    .description = Preparing the partitions Luft starts from.
working-downloading = Bringing Luft over
    .description = Luft is copied straight into its own space and checked on the way.
working-packing = Packing your things
    .description = Copying everything you chose into the moving box. Big folders take a while.
working-removing = Removing Luft
    .description = Giving the space back to Windows.
working-removing-linux = Removing Luft
    .description = Taking out its files and its start entry.
working-writing = Making the stick
    .description = Luft is written onto the whole stick. Keep it plugged in.
working-copying = Adding Luft to Ventoy
    .description = Luft is copied next to the other ISOs on the stick. Keep it plugged in.
working-verifying = Checking the stick
    .description = Reading it all back to make sure it starts.
working-stick-downloading = Downloading Luft
    .description = It’s checked on the way and kept, so the next stick is quicker.
# $done and $total are sizes, like "1.2 GB of 2.1 GB"
working-progress = { $done } of { $total }
working-keep-open = Please keep this window open.

## After Luft was removed

removed-title = All back to how it was
removed-description = { $platform ->
    [linux] Luft’s files and its start entry are gone, and your computer starts just like before. Come back any time.
   *[windows] Luft’s partitions and its start entry are gone, and Windows has all of its space again. Come back any time.
}

## Making a USB stick

stick-title = Make a USB stick
stick-description = Luft starts from it on any computer, to try it or to install it.
stick-looking = Looking for USB drives…
# $size is the smallest stick that fits, like "4 GB"
stick-none = Plug in a USB stick of { $size } or more. It shows up here.
# Screen-reader label of the list of sticks
stick-drives-label = USB drives
# $name is the Luft build, like "Luft 12", and $size its size, like "2.1 GB"
stick-offer = { $name }, { $size }
# Button, verb
stick-make = Make the stick
# Shown for a stick with nothing on it
stick-drive-empty = Empty
# $size is the stick's size, like "32 GB", and $contents what's on it, like "Photos, FAT"
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Too small for Luft
# Ventoy is a tool that puts many ISO files on one stick
stick-ventoy-title = This stick uses Ventoy
stick-ventoy-description = Add Luft to it, or erase the whole stick and make it a Luft stick?
stick-erase-it = Erase it
stick-add = Add Luft
stick-replace-title = Replace the Luft on it?
# $names lists the Luft builds already on the stick, like "Luft 11 and Luft 12", and $count says how many there are
stick-replace-description = { $count ->
    [one] { $names } is already on this stick. The new Luft can take its place.
   *[other] { $names } are already on this stick. The new Luft can take their place.
}
# Keeps the Luft builds already on the stick next to the new one. $count is how many are already there.
stick-keep = { $count ->
    [one] Keep both
   *[other] Keep all
}
# Button, verb
stick-replace = Replace
stick-full-title = There isn’t room for Luft
# $needed and $free are sizes, like "2.1 GB"
stick-full-description = Luft needs { $needed }, and { $free } is free on this stick. Make room on it, or erase it and make it a Luft stick.
# $name is the stick's name, like "SanDisk Ultra"
stick-erase-title = Erase { $name }?
# $size is the stick's size, like "32 GB"
stick-erase-description = Everything on this { $size } stick is erased and replaced with Luft. This can’t be undone.
stick-erase-confirm = Erase and make the stick
stick-done-title = Your Luft stick is ready
stick-done-ventoy-title = Luft is on your Ventoy stick
stick-done-take-out = You can take it out now.
stick-done-eject = Eject it before you take it out.
stick-done-start = To start from it, plug it in and choose it in the computer’s start menu, which opens with a key like F12, F8 or Esc right after switching on.
stick-done-ventoy-key = With Secure Boot on, Ventoy asks once to enroll its own key the first time it starts.
stick-done = Done
# Button that makes one more stick
stick-done-another = Make another
