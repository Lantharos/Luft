-schelf = Schelf
-luft = Luft

## The heading at the top of each page

title-back = Back
title-discover = Discover
title-installed = Installed
title-updates = Updates
title-extensions = Extensions
title-popular = Popular
title-updated = New and updated
# $query is what was searched for
title-search = Results for “{ $query }”
title-sources = Software sources
# $project is the app being published and $version one of its releases
title-release = { $project } { $version }

## Sidebar

sidebar-search = Search apps
sidebar-discover = Discover
sidebar-installed = Installed
sidebar-updates = Updates
sidebar-extensions = Extensions
sidebar-account = Account

## Pieces shared by several pages

access-title = What it can access
# Under an app's name in a grid of apps
tile-installed = Installed
shelf-see-all = See all
progress-cancel = Cancel
consent-cancel = Cancel
consent-install = Install
consent-flathub-title = Install { $name }?
consent-flathub-description = { $name } runs in a sandbox, but asks for more than most apps need. It can use:

## Categories in the sidebar

category-office = Productivity
category-graphics = Graphics & Photos
category-audiovideo = Audio & Video
category-game = Games
category-development = Developer Tools
category-education = Education
category-science = Science
category-network = Internet
category-utility = Utilities
category-system = System

## Screenshots of an app

# $number counts the screenshots from 1, for a screenshot without a caption
screenshots-numbered = Screenshot { $number }
screenshots-one = Screenshot
screenshots-close = Close
screenshots-previous = Previous screenshot
screenshots-next = Next screenshot

## What an install, update or removal is doing; .named is the same with the app's name, as $name

operation-installing = Installing
    .named = Installing { $name }
operation-removing = Removing
    .named = Removing { $name }
operation-updating = Updating
    .named = Updating { $name }
operation-waiting-install = Waiting to install
    .named = Waiting to install { $name }
operation-waiting-remove = Waiting to remove
    .named = Waiting to remove { $name }
operation-waiting-update = Waiting to update
    .named = Waiting to update { $name }
operation-preparing = Getting ready
    .named = Getting ready { $name }
operation-downloading = Downloading
    .named = Downloading { $name }
# $done and $total are sizes, such as 12 MB of 84 MB
operation-transferred = { $done } of { $total }
# $count is how many more installs, updates or removals wait after this one
operation-more-waiting = { $count ->
    [one] { $count } more waiting
   *[other] { $count } more waiting
}

## Where an installed app came from

source-store = schelf.store
source-store-extension = Extension from schelf.store
source-file = Installed from a file
source-tool = Command-line tool
source-store-tool = Command-line tool from schelf.store
source-ubuntu = Made for Ubuntu
source-system = Part of the system
# $origin is the software source it came from, such as RPM Fusion
source-system-from = Part of the system, from { $origin }
source-flathub = Flathub

## What a Flatpak app can reach, from the permissions it declares

# $count is how many places it reaches: one for a single folder, more for several
permission-files-read-only = { $count ->
    [one] It can look at it but not change it.
   *[other] It can look at them but not change them.
}
permission-files-read-write = { $count ->
    [one] It can read and change it.
   *[other] It can read and change them.
}
permission-all-files = All files on this computer
permission-home = Your home folder
# $folders lists folder names such as "Downloads and Pictures"
permission-folders = { $count ->
    [one] { $folders } folder
   *[other] { $folders } folders
}
permission-folder-downloads = Downloads
permission-folder-documents = Documents
permission-folder-pictures = Pictures
permission-folder-music = Music
permission-folder-videos = Videos
permission-folder-desktop = Desktop
permission-folder-public = Public
permission-folder-templates = Templates
permission-other-folders = Other folders
permission-outside-sandbox = Runs outside its sandbox
permission-outside-sandbox-description = It can start programs or reach services with your full permissions.
permission-internet = Internet
permission-internet-description = It can go online.
permission-all-devices = All devices
permission-all-devices-description = Including cameras, microphones and USB devices.
permission-usb = USB devices
permission-usb-description = It can use the USB devices plugged into this computer.
permission-serial = Serial devices
permission-serial-description = It can talk to boards and other devices on a serial port.
permission-input = Game controllers
permission-input-description = It can read controllers and other input devices.
permission-x11 = Older way of showing windows
permission-x11-description = It can use X11, where apps can see each other’s windows and what you type in them.
permission-microphone = Microphone
permission-microphone-description = It can record sound, from the microphone and from what this computer plays.
permission-camera = Camera
permission-camera-description = It can use the cameras of this computer.
permission-sound = Sound
permission-pulseaudio-description = It can play sound and may be able to record it.
permission-playback-description = It can play sound.
permission-secrets = Saved passwords
permission-secrets-description = It can use the passwords stored on this computer.
permission-keys = Your keys
permission-keys-description = It can use your SSH or GPG keys.
permission-printers = Printers
permission-printers-description = It can print directly.
permission-none = No special access
permission-none-description = It runs separated from your files and other apps.
permission-session-bus = Talks to other apps
permission-session-bus-description = { $count ->
    [one] It can reach { $count } other service on your desktop.
   *[other] It can reach { $count } other services on your desktop.
}

## What an extension can do once installed, shown as a list and, through .needs, inside a sentence such as "which it needs to play sounds and type into other apps"

extension-access-wallpaper = Draw over the wallpaper
    .needs = draw over the wallpaper
extension-access-quick-settings = Add tiles to quick settings
    .needs = add tiles to quick settings
extension-access-taskbar = Add buttons to the taskbar
    .needs = add buttons to the taskbar
extension-access-search = Add results to search
    .needs = add results to search
extension-access-notifications = Send notifications
    .needs = send notifications
extension-access-weather = See the weather where you are
    .needs = see the weather where you are
extension-access-location = See roughly where you are
    .needs = see roughly where you are
extension-access-media = See and control what's playing
    .needs = see and control what's playing
extension-access-popups = Show panels and small windows
    .needs = show panels and small windows
extension-access-typing = Type into other apps
    .needs = type into other apps
extension-access-sounds = Play sounds
    .needs = play sounds
extension-access-audio-levels = Follow the beat of what's playing
    .needs = follow the beat of what's playing
extension-access-calls = Know when you're in a call
    .needs = know when you're in a call
extension-access-locked-sounds = Keep playing sounds while the screen is locked
    .needs = keep playing sounds while the screen is locked
extension-access-input-sounds = Play a sound when you type and click, without seeing your keys
    .needs = play a sound when you type and click, without seeing your keys
extension-access-do-not-disturb = Hold back notifications for a while
    .needs = hold back notifications for a while
extension-access-screen-effects = Draw over and change how your windows and the whole screen look
    .needs = draw over and change how your windows and the whole screen look
extension-access-clipboard = Copy to your clipboard
    .needs = copy to your clipboard
extension-access-file-actions = Add to the menu of files and folders in Rover
    .needs = add to the menu of files and folders in Rover
# $hosts lists the websites it connects to
extension-access-network = Connect to { $hosts }
# $ports lists the network ports it listens on
extension-access-listen = { $count ->
    [one] Take connections from devices on your network, on port { $ports }
   *[other] Take connections from devices on your network, on ports { $ports }
}
    .needs = take connections from devices on your network
extension-access-helper = Runs its own program
extension-access-basics = Nothing beyond the basics
extension-inside-luft-input = See what you type and what's on the screen
extension-inside-luft-anything = Do anything { -luft } itself can

## What an app with full access can do, listed before giving it

full-access-files = Read, change and delete all your files
full-access-devices = Use every device, such as USB drives, cameras and game controllers
full-access-clipboard = Read what you copy, even while it's in the background
full-access-keyring = Read the passwords and keys saved in your keyring, other apps' too
full-access-programs = Start any program as you, outside a sandbox

## Who checked who made an app, under its name

# $name is the website or account Flathub verified, such as gimp.org
verified-as = Verified as { $name }
verified-flathub = Verified as Flathub
verified-store = Verified by schelf.store

## Removing an app

remove-title = Remove { $name }?
remove-extension = { $name } will be removed from your desktop.
# $folder is the folder the app's file is kept in
remove-appimage = { $name } and its file in { $folder } will be deleted, with everything you allowed it.
remove-tool = { $name } and its commands will be removed. Your files stay.
remove-app = { $name } will be removed from this computer. Your files and settings stay.
remove-system = { $name } is removed for everyone, settings and data included.
remove-flatpak = { $name } will be removed from this computer and loses the drives and folders you gave it. Your files and settings stay.
remove-cancel = Cancel
remove-confirm = Remove

## When an app didn't start

open-failed-title = { $name } didn't start
# What the app needs that's missing; $name is the library, program or module, such as libgtk-3.so.0
open-failed-need = { $kind ->
    [library] the library { $name }
    [program] the program { $name }
    [perlModule] the Perl module { $name }
    [pythonModule] the Python module { $name }
   *[typelib] the GObject bindings of { $name }
}
# $needed is what it needs, from open-failed-need; $package is the package that has it
open-failed-missing-package = It needs { $needed }, which isn't on this computer. The { $package } package has it.
open-failed-missing = It needs { $needed }, which isn't on this computer, and none of the packages { -luft } can add has it.
open-failed-crashed = It crashed right after it started.
open-failed-closed = It closed right after it started.
open-failed-output = The last it wrote before closing:
open-failed-cancel = Cancel
# $name is the package to add
open-failed-add = Add { $name }
open-failed-close = Close

## Asking before adding a software source

source-trust-add = Add source
# $name is the software source, such as RPM Fusion
source-trust-title = Trust { $name }?
source-trust-description = Whoever runs it can change software on this computer: its packages install for everyone and can run as administrator. Only add sources you trust.
source-trust-keys = { $count ->
    [one] Its packages are checked against this key:
   *[other] Its packages are checked against these keys:
}

## Asking before installing an opened file

file-add-and-install = Add and install
file-full-access-title = Give { $name } full access?
# $reason is the app's own words for why it needs full access
file-full-access-description = { $name } asks to run outside a sandbox: “{ $reason }” There it can do all of this without asking. You can take full access away on its page later.
file-full-access-confirm = Install with full access
# $name is the package's name
file-unverified-title = Install { $name } without checking it?
file-unverified-description = It isn't signed by Fedora or a software source you added. Only install it if you trust whoever gave it to you.
file-unverified-fact = Not verified
file-for-everyone-fact = Installs for everyone on this computer
file-administrator-fact = Can run as administrator while it installs
file-for-you-fact = Installs for you only, but can read and change your files
file-no-updates-fact = Won't get updates
file-install-anyway = Install anyway

## Details of an opened file

file-details = Details
file-made-by = Made by
file-version = Version
file-size = Size
file-license = License
# Where a Flatpak file installs from
file-source = Source
# The runtime a Flatpak app needs
file-needs = Needs
file-needs-description = Installed from Flathub along with it.
file-updates-from = Updates from
file-updates = Updates
file-updates-bundle = Install a newer file when one comes out.
file-updates-deb = From its maker's software source if it adds one. Otherwise, install a newer file.
file-installs-to = Installs to
file-installs-to-ubuntu = A separate space with Ubuntu's software that can read and change your files. The first one downloads Ubuntu, a few hundred megabytes.
file-installs-to-appimage = Kept up to date when { -schelf } can.
file-installs-to-system = For everyone on this computer, updated with { -luft }.
file-installs-to-tool = For you only. Its commands run in Tern.
file-your-account = Your account
# Installs for the whole computer, as opposed to your account
file-system = System
file-file = File
# $name is the package and $source the software source it comes with
file-source-updates = { $name } installs from { $source }, so it keeps getting updates.
file-source-added = It's one of your software sources already.
file-source-adds = Installing adds it to your software sources.
file-source-unusable = It brings a software source { -luft } can't use, so it installs by itself and won't get updates.

## Signing in to schelf.store

account-sign-in-title = Sign in to schelf.store
account-sign-in-description = Get the apps and versions you were invited to try.
account-approve-title = Approve in your browser
account-approve-description = Check that the page shows this code, then approve it.
account-declined = The sign-in was declined in the browser.
account-expired = The code ran out before it was approved.
account-no-invitations = You aren't invited to anything yet.
account-sign-in = Sign in
account-try-again = Try again
account-sign-out = Sign out
account-done = Done
account-cancel = Cancel
account-open-page = Open the page again
account-ended = Your schelf.store sign-in ended
account-ended-description = Sign in again to keep getting what you were invited to.
account-lost-several = You no longer have access to some apps
# $channel is the name of the version, such as Beta; $name is the app
account-lost = You no longer have access to the { $channel } version of { $name }
account-lost-description = What you installed stays and gets the public versions from now on.
account-ok = OK
account-not-now = Not now
