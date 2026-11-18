-schelf = Schelf
-luft = Luft

## Joining names into a list, such as "play sounds, send notifications and type into other apps"

core-list-separator = {", "}
# $rest is every item but the last, joined with core-list-separator
core-list-and = { $rest } and { $last }

## What an extension can do once installed; the -needs forms go inside a sentence such as "which it needs to play sounds and type into other apps"

core-access-wallpaper = Draw over the wallpaper
core-access-wallpaper-needs = draw over the wallpaper
core-access-quick-settings = Add tiles to quick settings
core-access-quick-settings-needs = add tiles to quick settings
core-access-taskbar = Add buttons to the taskbar
core-access-taskbar-needs = add buttons to the taskbar
core-access-search = Add results to search
core-access-search-needs = add results to search
core-access-notifications = Send notifications
core-access-notifications-needs = send notifications
core-access-weather = See the weather where you are
core-access-weather-needs = see the weather where you are
core-access-location = See roughly where you are
core-access-location-needs = see roughly where you are
core-access-media = See and control what's playing
core-access-media-needs = see and control what's playing
core-access-popups = Show panels and small windows
core-access-popups-needs = show panels and small windows
core-access-typing = Type into other apps
core-access-typing-needs = type into other apps
core-access-sounds = Play sounds
core-access-sounds-needs = play sounds
core-access-audio-levels = Follow the beat of what's playing
core-access-audio-levels-needs = follow the beat of what's playing
core-access-calls = Know when you're in a call
core-access-calls-needs = know when you're in a call
core-access-locked-sounds = Keep playing sounds while the screen is locked
core-access-locked-sounds-needs = keep playing sounds while the screen is locked
core-access-input-sounds = Play a sound when you type and click, without seeing your keys
core-access-input-sounds-needs = play a sound when you type and click, without seeing your keys
core-access-do-not-disturb = Hold back notifications for a while
core-access-do-not-disturb-needs = hold back notifications for a while
core-access-screen-effects = Draw over and change how your windows and the whole screen look
core-access-screen-effects-needs = draw over and change how your windows and the whole screen look
core-access-clipboard = Copy to your clipboard
core-access-clipboard-needs = copy to your clipboard
core-access-file-actions = Add to the menu of files and folders in Rover
core-access-file-actions-needs = add to the menu of files and folders in Rover
core-access-listen-needs = take connections from devices on your network

## Opening an app file

core-file-no-app = This file doesn't name an app.
core-file-no-source = This file doesn't name a source.
core-file-damaged-flatpak = This Flatpak file is damaged or isn't a Flatpak app.
core-file-runtime = This Flatpak file holds a runtime, not an app. Apps that need it install it themselves.
core-file-damaged-package = This package file is damaged or isn't meant for this computer.
core-file-unknown = { -schelf } can't install this kind of file.
# $error is why installing the file failed and $reason why Flathub couldn't be added
core-bundle-no-flathub = { $error }. Flathub, where its runtime would come from, couldn't be added: { $reason }

## Apps from schelf.store

core-store-no-access = schelf.store no longer lets you in.
core-store-signed-out = Your schelf.store sign-in ended.
# $name is the app
core-store-access-lost = You no longer have access to this version of { $name }.
# $document is the path of a list schelf.store publishes, such as index/v1/catalog.json
core-store-no-copy = { -schelf } has no copy of { $document } from schelf.store.
core-store-older = schelf.store sent an older copy of its list than the one { -schelf } has.
core-store-other-listing = schelf.store sent another app's listing.
core-store-extension-needs-luft = { $name } is an extension for { -luft }, so it needs { -luft }.
# $version is a Luft version, such as 1.4
core-store-needs-luft = { $name } needs { -luft } { $version } or newer.
core-store-unavailable = { $name } isn't available for this computer.
# $needs lists what the extension does that its sandbox can't allow, such as "use the camera and record the screen"
core-store-needs-review = { $name } can be installed once schelf.store approves it to run inside { -luft }, which it needs to { $needs }.
core-store-no-file = { $name } came without a file for this computer.
core-store-needs-sabine = Sabine apps need Sabine, from github.com/Lantharos/Sabine.
core-store-app-needs-sabine = { $name } needs Sabine, from github.com/Lantharos/Sabine.
# $reason is schelf.store's note on why it took the app back
core-store-pulled = schelf.store pulled { $name }: { $reason }
core-store-changed = { $name } changed since you looked at it. Look at it again before installing.
# $channel is the name of a version an app is offered in, such as beta
core-channel-unknown = { -schelf } doesn't offer the { $channel } channel.
core-download-changed = The download didn't match what schelf.store published, so it wasn't installed.
# $path is where the downloaded file is
core-download-not-published = { $path } isn't the file schelf.store published.
core-not-installed = It isn't installed any more.
core-full-access-kinds = Full access is for Flatpak apps and AppImages.

## Command-line tools from schelf.store

# "schelf" is the command, written as it's typed
core-tool-comes-with-luft = { -luft } comes with schelf, and updates it with the system.
core-tool-gone = schelf.store doesn't have it any more.
core-tool-no-version = There's no version of it for this computer.
# $path is the place the tool would go
core-tool-taken = { $path } is there already, and { -schelf } didn't put it there.
# $tool is the tool's address on schelf.store and $channel the version asked for, such as beta
core-tool-no-channel = { $tool } has no { $channel } version for this computer.
core-tool-pulled = schelf.store pulled { $tool } { $version }: { $reason }
core-tool-several-programs = The download holds more than one program, so it wasn't installed.
core-tool-no-program = The download holds no program, so it wasn't installed.
# $kind is how the tool is packed, such as a tarball
core-tool-unknown-kind = { -schelf } can't install a tool that comes as a { $kind } here.
# $publisher is who published the tool
core-tool-by = By { $publisher }

## Looking for updates

# $reason is why it couldn't check
core-updates-check-failed = { $source ->
    [flathub] Couldn't check your Flathub apps. { $reason }
    [system] Couldn't check your system packages. { $reason }
    [ubuntu] Couldn't check your Ubuntu apps. { $reason }
    [store] Couldn't check your schelf.store apps. { $reason }
   *[store-tools] Couldn't check your tools from schelf.store. { $reason }
}

## Fedora's packages

core-fedora-unreachable = Fedora's software sources can't be reached right now.
