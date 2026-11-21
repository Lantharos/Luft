-schelf = Schelf
-luft = Luft

## Help and usage. Command names, options such as --yes and the words in capitals,
## such as NAME, are typed as they are, so they stay in English.

cli-help-about =
    { -schelf } installs apps, command-line tools and system packages, and puts
    your own on schelf.store.
# $usage is how the command is typed, such as schelf install NAME
cli-usage = Usage: { $usage }
cli-help-commands = Commands:
cli-help-options = Options:
cli-help-install = Install apps, tools or a file
cli-help-remove = Remove something you installed
cli-help-search = Look for apps and tools everywhere
cli-help-update = Update apps, AppImages and tools
cli-help-list = Show what you installed
cli-help-info = Show details
cli-help-trust = Give Flatpak apps full access
cli-help-untrust = Put them back in their sandbox
cli-help-give = Let an app use one drive or folder
cli-help-take = Take a drive or folder away again
cli-help-repo = Manage software sources for system packages
cli-help-option-only = Use only this source
cli-help-option-read-only = Give a drive or folder only to read
cli-help-option-yes = Go ahead without asking
cli-help-option-help = Show help, also for a command
cli-help-option-version = Show the version
cli-help-publishing = Publishing on schelf.store:
cli-help-publishing-options =
    Publishing commands also take --json to print the result as JSON and
    --api ORIGIN to talk to another store.
cli-help-exits =
    Exits 0 when done, 1 on failure, 2 for wrong usage, 3 when something isn't
    there or you aren't signed in, 4 while waiting for a person, 5 when declined
    or expired, and 130 when stopped. { -luft } itself updates in Settings, under Updates.

cli-usage-install =
    Installs apps, extensions and command-line tools from schelf.store, a
    tool also by its address, such as alice/notes, apps from Flathub, packages
    from Fedora and your software sources, or a .rpm, .AppImage, .flatpakref or
    {"."}flatpakrepo file. A name schelf.store has comes from there, then from
    Flathub, then from Fedora; when that still leaves a choice, such as an app
    and a tool of the same name on schelf.store, { -schelf } asks. Apps from
    schelf.store show what they can use first, and tools who publishes them.
    You can write add instead of install.

    Packages from Fedora go into the system, for everyone on the computer, and
    update by themselves. Command-line tools install without a password; those
    that bring a service, a driver or anything else that changes the system,
    such as Tailscale, Docker or libvirt, ask for an administrator's. dnf install
    installs only from Fedora and your software sources, several in one go, and
    takes a command's name for its package.
cli-usage-remove =
    Removes apps, extensions and AppImages you installed, and system packages
    with everything they added.
cli-usage-search =
    Looks for apps and extensions on schelf.store, apps on Flathub, packages
    from Fedora and your software sources, and through the AppImages you have.
cli-usage-update =
    Updates apps, AppImages, tools and system packages. { -luft } itself updates
    in Settings, under Updates.
cli-usage-list = Shows what you installed, by where it came from, and the system packages.
cli-usage-info =
    Shows the details of an app, tool or package, from every source that has
    it.
cli-usage-trust =
    Gives Flatpak apps full access: they can see and change all your files,
    read the clipboard in the background, control other apps' windows and
    act like apps installed on the system. Only do this for apps you trust.
    It asks for an administrator's password and takes effect the next time
    the app opens.
cli-usage-untrust = Takes full access away again and puts apps back in their sandbox.
cli-usage-give =
    Lets a Flatpak app or an AppImage use one drive or folder from the next
    time it opens, without giving it full access. Name a drive as { -schelf }
    shows it, such as Games, or by where it's mounted. A drive goes by the
    drive itself, so another one with the same name doesn't get it. Without
    a drive or folder, shows what the app has and the drives you can give it.
cli-usage-take = Takes a drive or folder away from an app again, from the next time it opens.
cli-usage-repo =
    Adds a software source for system packages, such as a vendor's RPM
    repository: the address of its .repo file, a COPR project as
    copr:owner/project, or one { -schelf } knows by name: 1password, docker,
    google-chrome or vscode. { -schelf } shows the key its packages
    are signed with and asks before adding it. Packages from it then install
    into the system and update by themselves. Removing a source removes its packages.

## Mistakes in how a command was typed

# $command is the word that was typed
cli-usage-unknown-command = There's no command called { $command }.
# $program is how the command is called, usually schelf
cli-usage-see-help = Run { $program } --help to see what it can do.
cli-usage-no-command = No command given.
# $command is a command such as install, $option what was typed after it
cli-usage-unknown-option = { $command } doesn't know { $option }.
cli-usage-one-source = Choose one source at a time.
cli-usage-needs-name = { $command } needs a name.
cli-usage-take-needs-place = take needs an app and the drive or folder to take from it.
cli-usage-list-takes-no-names = list doesn't take names.
cli-usage-no-sudo = { -schelf } works in your own account, so run it without sudo.
# $error says why the app couldn't open
cli-open-failed = Couldn't open { -schelf }: { $error }

cli-needs-luft-system = System packages need { -luft }, which this computer doesn't run.
cli-needs-luft-sources = Software sources for system packages need { -luft }, which this computer doesn't run.
cli-needs-luft-full-access = Full access for Flatpak apps and AppImages needs { -luft }, which this computer doesn't run.
cli-needs-luft-places = Giving Flatpak apps and AppImages drives and folders needs { -luft }, which this computer doesn't run.
cli-catalog-needs-flatpak = Apps from Flathub need Flatpak, which isn't installed here.
cli-appimage-no-catalog = AppImages have no catalog to look in. Install one from its file, such as ./App.AppImage.

## Questions

# $question is a question such as "Install Firefox?"
cli-confirm-needs-yes = { $question } Add --yes to go ahead without being asked.
# y and n are typed as they are
cli-prompt-yes-or-no = Answer y or n.
# $count is how many choices there are, and the answer is a number from 1 to it
cli-prompt-which = Which one? [1-{ $count }]
cli-prompt-number = Answer with a number from 1 to { $count }.
# $name is what was asked for, followed by a numbered list of the places it's in
cli-pick-several = { $name } is in more than one place:

## Joining names into a list, such as "Firefox, GIMP and Krita"

cli-list-separator = {", "}
# $rest is every name but the last, joined with cli-list-separator
cli-list-and = { $rest } and { $last }
cli-list-or = { $rest } or { $last }

## Where apps come from

cli-origin-deb = a .deb file
cli-origin-system = System package
cli-catalog-system = your software sources
cli-heading-appimages = AppImages
cli-heading-debs = Apps from .deb files
cli-heading-system = System packages
cli-heading-store = { -schelf }
# One of the choices when a name is in several places; $kind is what it is and $source where it comes from, such as Flathub
cli-candidate = { $name }, { $kind ->
        [desktop] a desktop app
        [command] a command-line tool
        [system] a system package
       *[extension] a { -luft } extension
    } from { $source }
# $id is the app's ID, such as org.gimp.GIMP
cli-candidate-with-id = { $name } ({ $id }), { $kind ->
        [desktop] a desktop app
        [command] a command-line tool
        [system] a system package
       *[extension] a { -luft } extension
    } from { $source }
cli-installed-system = { $name }, a system package
cli-installed-from = { $name }, from { $source }
cli-installed-from-with-id = { $name } ({ $id }), from { $source }
# Under a command-line tool from schelf.store; $publisher is who publishes it
cli-tool-by = By { $publisher }

## Looking things up

# Beside a spinner while it looks; $name is what was asked for
cli-looking-for = Looking for { $name }
cli-not-installed = { $name } isn't installed.

## install

# $places are the catalogs it looked in, such as schelf.store, Flathub or Fedora
cli-install-nothing-called = There's nothing called { $name } on { $places }.
cli-install-close-matches = Close matches:
# $example is the ID of one of the choices
cli-install-name-by-id = Name the one you want by its ID or address, such as { $example }.
cli-install-pick-source = Pick one with --store or --flathub, or install the package from Fedora with dnf install.
cli-install-already = { $name } is already installed.
cli-install-already-from = { $name } is already installed from { $source }.
cli-install-own-source = { $name } gets its updates from a software source of its own:
# $error says why it couldn't look
cli-install-look-failed = Couldn't look for { $name }. { $error }
cli-install-comes-with-luft = { $name } comes with { -luft }.
cli-install-run-as = Run it as { $command }.
# $commands is a list of the commands a tool brings
cli-install-commands = Its commands are { $commands }.
# $count is how many more commands it brings than are named
cli-install-commands-and-more = Its commands are { $commands }, and { $count } more.
cli-install-open-or-run = Open it from Gust, or run { $command }.
cli-install-open = Open it from Gust.
cli-install-system-file-updates = It's part of the system now, and updates with { -luft }.
cli-install-system-file = It's part of the system now. It doesn't get updates of its own, so remove it and install a newer file when one comes out.
# $names is a list of what's about to be installed
cli-install-confirm = Install { $names }?

## Files

# $path is what was typed
cli-file-missing = There's no file at { $path }.
cli-file-needs-flatpak = Flatpak files need Flatpak, which isn't installed here.
cli-file-needs-luft = Package files install through { -luft }, which this computer doesn't run; use its own package manager for them.
# $command installs the same app from Flathub
cli-file-deb-on-flathub = { $name } is on Flathub too, where it's sandboxed and keeps itself up to date: { $command } installs that instead.
# $reason is the app's own explanation, a full sentence
cli-file-appimage-unsandboxed = { $name } asks to run outside its sandbox: { $reason } It installs in its sandbox, and schelf trust gives it full access if you trust it.
# $error says why the software source can't be used
cli-file-source-unusable = It brings a software source { -luft } can't use, so it's installed by itself and won't get updates. { $error }

## Command-line tools from schelf.store

cli-tool-verified = { $name } is published by { $publisher }, a verified publisher. It runs with everything you can do.
cli-tool-unverified = { $name } is published by { $publisher }, a publisher schelf.store hasn't verified. It runs with everything you can do, so only install it if you trust them.

## Apps from schelf.store, before they're installed

cli-store-extension-inside-luft = schelf.store approved { $name } to run inside { -luft }. It can:
cli-store-extension-sandboxed = { $name } runs in a sandbox. It can:
cli-store-no-sandbox = This computer has no sandbox for apps from schelf.store, so { $name } runs with everything you can do.
cli-store-can-use = { $name } can use:
cli-store-unsandboxed = { $name } runs outside a sandbox, with everything you can do.
# $reason is the app's own explanation, a full sentence
cli-store-unsandboxed-because = { $name } runs outside a sandbox, with everything you can do. It says: { $reason }
cli-store-asks-unsandboxed = { $name } asks to run outside a sandbox, with everything you can do.
cli-store-asks-unsandboxed-because = { $name } asks to run outside a sandbox, with everything you can do. It says: { $reason }
cli-store-installs-sandboxed = It installs in its sandbox. schelf trust gives it full access if you trust it.
cli-store-confirm-full-access = Give it full access?
# $channel is a release channel such as beta
cli-store-no-channel-version = { $name } has no { $channel } version for this computer.

## What an app or extension from schelf.store may use, one line each

cli-access-internet = The internet
cli-access-folder-home = your home folder
cli-access-folder-desktop = Desktop
cli-access-folder-documents = Documents
cli-access-folder-downloads = Downloads
cli-access-folder-music = Music
cli-access-folder-pictures = Pictures
cli-access-folder-videos = Videos
# $folders is a list of folders, such as Documents and Pictures
cli-access-files = Your files in { $folders }
cli-access-files-read-only = Your files in { $folders }, to look at but not change
cli-access-usb = USB devices
cli-access-serial = Devices on a serial port
cli-access-devices = Every device you plug in
# $apps are the D-Bus names of the apps it talks to
cli-access-other-apps = Other apps: { $apps }
cli-access-nothing = Nothing beyond its own files
# $hosts are website addresses
cli-access-connect = Connect to { $hosts }
# $ports is a list of port numbers, and $count how many there are
cli-access-listen = { $count ->
        [one] Take connections from devices on your network, on port { $ports }
       *[other] Take connections from devices on your network, on port { $ports }
    }
cli-access-helper = Runs its own program
cli-access-basics = Nothing beyond the basics

## remove

cli-remove-pick-source = Pick one with --flathub or --appimage, or remove the system package with dnf remove.
# $names is a list of what's about to be removed
cli-remove-confirm = Remove { $names }?
cli-remove-confirm-places = Remove { $names }? Drives and folders you gave it have to be given again if you install it later.
# $count is how many of them are system packages
cli-remove-confirm-system = { $count ->
        [one] Remove { $names }? What it added to /etc and /var goes too.
       *[other] Remove { $names }? What they added to /etc and /var goes too.
    }

## list

cli-list-for-everyone = for everyone
# $source is the name of the Flatpak remote it came from
cli-list-from = from { $source }
# $services are the names of the services it runs
cli-list-runs = runs { $services }
cli-list-being-set-up = being set up
cli-list-no-appimages = No AppImages are installed.
cli-list-no-system-packages = There are no system packages.
cli-list-nothing-from = Nothing from { $source } is installed.
cli-list-nothing = Nothing is installed yet.

## search

# Beside a spinner while it searches
cli-search-searching = Searching for { $query }
# $source is a catalog such as Flathub, and $error says why
cli-search-failed = { $source } can't be searched right now. { $error }
cli-search-nothing = Nothing matches { $query } anywhere.
cli-search-nothing-on = Nothing matches { $query } on { $source }.
# Beside a search result that's installed
cli-search-installed = installed
# $count is how many results aren't shown, and $flag the option that shows them all, such as --flathub
# $command is an option such as --flathub, or dnf search
cli-search-more = { $count ->
        [one] { $count } more. See them all with { $command }.
       *[other] { $count } more. See them all with { $command }.
    }

## info

cli-info-source = Source
cli-info-id = ID
cli-info-version = Version
cli-info-installed = Installed
cli-info-yes = yes
cli-info-no = no
cli-info-download = Download
cli-info-size = Size
cli-info-license = License
cli-info-developer = Developer
cli-info-website = Website
cli-info-commands = Commands
cli-info-file = File
cli-info-updates = Updates
cli-info-updates-automatic = automatic
cli-info-updates-none = none offered
cli-info-channel = Channel
cli-info-built = Built
cli-info-runs = Runs
cli-info-can-use = Can use
cli-info-address = Address
cli-info-publisher = Publisher
cli-info-source-code = Source code
cli-info-runs-with = Runs with
cli-info-source-flathub = Flathub, { $kind ->
        [desktop] desktop app
        [command] command-line tool
        [system] system package
       *[extension] { -luft } extension
    }
cli-info-source-fedora = Fedora, { $kind ->
        [desktop] a desktop app
        [command] a command-line tool
        [system] a system package
       *[extension] a { -luft } extension
    } in the system for everyone
cli-info-source-store = schelf.store, { $kind ->
        [desktop] desktop app
        [command] command-line tool
        [system] system package
       *[extension] { -luft } extension
    }
# $source is where the package comes from, such as your software sources
cli-info-source-system = System package, from { $source }
cli-info-gone = It isn't available any more.
cli-info-gone-from-store = It isn't on schelf.store any more.
cli-info-access-everything = Everything you can, outside a sandbox
# $needs is what the extension needs, such as "read your notifications"
cli-info-runs-after-review = Not yet: it needs to { $needs }, which only runs inside { -luft } once schelf.store approves it
cli-info-runs-inside-luft = Inside { -luft }, approved by schelf.store
cli-info-runs-sandboxed = In a sandbox
# $repository is a GitHub repository and $commit the first characters of its commit
cli-info-built-from = on GitHub Actions, from { $repository } at { $commit }
cli-info-built-on-actions = on GitHub Actions
cli-info-built-by-developer = uploaded by the developer
cli-info-publisher-verified = { $publisher }, verified
cli-info-publisher-unverified = { $publisher }, not verified by schelf.store
cli-info-runs-with-everything = Everything you can do
cli-info-look-failed = Couldn't look in { $source }. { $error }
cli-info-nothing-called = There's nothing called { $name }.
cli-info-details-failed = Couldn't get the details of { $name }. { $error }

## update

# Beside a spinner while it checks
cli-update-checking = Checking for updates
cli-update-up-to-date = { $name } is up to date.
cli-update-all-up-to-date = Everything is up to date.
# Above the list of updates; $count is how many apps have one
cli-update-heading = { $count ->
        [one] { $count } update
       *[other] { $count } updates
    }
# $runtimes is how many runtimes, the parts apps run on, have an update too
cli-update-heading-with-runtimes = { $count ->
        [one] { $count } update
       *[other] { $count } updates
    }, and { $runtimes ->
        [one] { $runtimes } runtime
       *[other] { $runtimes } runtimes
    } that apps run on
cli-update-waits-inside-luft = { $name } was approved to run inside { -luft }, so it waits until you look at it in { -schelf }.
cli-update-waits-more-access = { $name } asks for more access than you agreed to, so it waits until you look at it in { -schelf }.
# The name of several updates done together; $count is how many
cli-update-flatpaks = { $count ->
        [one] { $count } Flatpak app
       *[other] { $count } Flatpak apps
    }
cli-update-flatpaks-and-runtimes = { $count } Flatpak apps and runtimes
cli-update-flatpaks-for-everyone = { $count ->
        [one] { $count } Flatpak app for everyone
       *[other] { $count } Flatpak apps for everyone
    }
cli-update-flatpaks-and-runtimes-for-everyone = { $count } Flatpak apps and runtimes for everyone
cli-update-system = { $count ->
        [one] { $count } system package
       *[other] { $count } system packages
    }
cli-update-debs = { $count ->
        [one] { $count } app from .deb files
       *[other] { $count } apps from .deb files
    }

## System packages

# $command is what was asked for and $package the package that brings it
cli-system-comes-from = { $command } comes from { $package }.
cli-system-already = { $name } is already a system package.
# Where system packages are installed from
cli-system-from-fedora = Fedora into the system
cli-system-from-fedora-and-sources = Fedora and your software sources into the system
# $count is how many packages were installed
cli-system-installed-note = { $count ->
        [one] It updates by itself, and its services start with the computer.
       *[other] They update by themselves, and their services start with the computer.
    }

## trust and untrust

cli-trust-not-sandboxed = { $name } isn't in a sandbox, so it has full access already.
cli-trust-name-by-id = Name it by its app ID instead.
cli-trust-abilities = With full access, { $name } can:
cli-trust-ability-files = read, change and delete all your files
cli-trust-ability-devices = use every device, such as USB drives, cameras and game controllers
cli-trust-ability-clipboard = read what you copy, even while it's in the background
cli-trust-ability-keyring = read the passwords and keys saved in your keyring, other apps' too
cli-trust-ability-programs = start any program as you, outside a sandbox
cli-trust-warning = Only give full access to apps you trust. It takes effect the next time the app opens.
# $command is the command that gives the app one drive or folder
cli-trust-give-instead = To let it use one drive or folder, give it just that: { $command }
cli-trust-confirm = Give { $name } full access?
cli-trust-already = { $name } has full access already.
cli-trust-not-trusted = { $name } doesn't have full access.
cli-trust-given = { $name } has full access from the next time it opens.
cli-trust-taken = { $name } is back in its sandbox from the next time it opens.
cli-trust-only-sandboxed = Only Flatpak apps and AppImages run in a sandbox.

## give and take

# A drive without a name; $size is how big it is, such as 500 GB
cli-places-unnamed-drive = the { $size } drive
# Beside a drive or folder an app has
cli-places-can-change = can read and change it
cli-places-can-read = can read it
cli-places-only-sandbox = { $name } has only its sandbox.
cli-places-drives-to-give = Drives you can give it:
cli-places-nothing-called = There's no drive or folder called { $name }.
# $drive is the drive's name and $name the app's
cli-places-unplugged = { $drive } isn't plugged in. Plug it in to give it to { $name }.
# $place is a drive or folder
cli-places-given = { $name } can use { $place } from the next time it opens.
cli-places-given-read-only = { $name } can read { $place } from the next time it opens.
cli-places-taken = { $name } can't use { $place } any more from the next time it opens.
cli-places-one-at-a-time = Name one drive or folder at a time.

## repo

cli-repo-signed-with = Its packages are signed with:
cli-repo-warning = Packages from it become part of the system, with full access to the computer, and update with { -luft }. Only add sources you trust.
cli-repo-confirm = Add { $name }?
# Beside a spinner while it downloads the source; $source is what was typed
cli-repo-fetching = Fetching { $source }
cli-repo-already = { $name } is already a software source.
cli-repo-added = Added { $name }. Install its packages with { $command }.
cli-repo-nothing-called = There's no software source called { $name }.
# $packages is a list of packages that came from the source
cli-repo-remove-confirm = Removing { $name } also removes { $packages } from the system. Go ahead?
cli-repo-none = No software sources were added. Add one with { $command }.

## Installing, updating and removing, one line each while it goes.
## <done>, <failed> and <b> mark the words shown in green, red and bold; keep them around the same words.

# $verb is what's being done and $name to what
cli-row-waiting = { $verb ->
        [add] Waiting to add { $name }
        [remove] Waiting to remove { $name }
        [update] Waiting to update { $name }
       *[install] Waiting to install { $name }
    }
cli-row-queued = { $verb ->
        [add] Waiting for { -schelf } to add { $name }
        [remove] Waiting for { -schelf } to remove { $name }
        [update] Waiting for { -schelf } to update { $name }
       *[install] Waiting for { -schelf } to install { $name }
    }
cli-row-waiting-for-other = { $verb ->
        [add] Waiting to add { $name } until another change to software finishes
        [remove] Waiting to remove { $name } until another change to software finishes
        [update] Waiting to update { $name } until another change to software finishes
       *[install] Waiting to install { $name } until another change to software finishes
    }
cli-row-preparing = Getting { $name } ready
cli-row-downloading = Downloading { $name }
# $size is how big the download is, such as 84.2 MB
cli-row-downloading-size = Downloading { $name }, { $size }
cli-row-working = { $verb ->
        [add] Adding { $name }
        [remove] Removing { $name }
        [update] Updating { $name }
       *[install] Installing { $name }
    }
cli-row-removing = Removing { $name }
cli-row-finishing = Finishing { $name }
# How fast it downloads; $speed is an amount such as 4.2 MB
cli-row-speed = { $speed }/s
# How far along it is; $percent is a whole number from 0 to 100
cli-row-percent = { $percent }%
cli-row-done = { $verb ->
        [add] <done>Added</done> <b>{ $name }</b>
        [remove] <done>Removed</done> <b>{ $name }</b>
        [update] <done>Updated</done> <b>{ $name }</b>
       *[install] <done>Installed</done> <b>{ $name }</b>
    }
# $source is where it came from, such as Flathub, a file's name, or Fedora into the system
cli-row-done-from = { $verb ->
        [add] <done>Added</done> <b>{ $name }</b> from { $source }
        [remove] <done>Removed</done> <b>{ $name }</b> from { $source }
        [update] <done>Updated</done> <b>{ $name }</b> from { $source }
       *[install] <done>Installed</done> <b>{ $name }</b> from { $source }
    }
# $error says what went wrong
cli-row-failed = { $verb ->
        [add] <failed>Couldn't add</failed> <b>{ $name }</b>: { $error }
        [remove] <failed>Couldn't remove</failed> <b>{ $name }</b>: { $error }
        [update] <failed>Couldn't update</failed> <b>{ $name }</b>: { $error }
       *[install] <failed>Couldn't install</failed> <b>{ $name }</b>: { $error }
    }
cli-row-stopped = { $verb ->
        [add] Stopped adding { $name }.
        [remove] Stopped removing { $name }.
        [update] Stopped updating { $name }.
       *[install] Stopped installing { $name }.
    }
# Below the lines when there are more than fit on the screen
cli-board-more = { $count ->
        [one] And { $count } more
       *[other] And { $count } more
    }
# When there's no room to draw lines; $names is a list of what's being done
cli-board-starting = { $verb ->
        [add] Adding { $names }
        [remove] Removing { $names }
        [update] Updating { $names }
       *[install] Installing { $names }
    }
cli-perform-in-app = { -schelf } is open, so it does this and shows it there.
cli-perform-app-closed = { -schelf } closed before it finished.

## How the whole set went

# $count is how many things were done
cli-summary-all = { $verb ->
        [add] <done>Added</done> all { $count }.
        [remove] <done>Removed</done> all { $count }.
        [update] <done>Updated</done> all { $count }.
       *[install] <done>Installed</done> all { $count }.
    }
# $names is a list of what was done
cli-summary-done = { $verb ->
        [add] Added { $names }.
        [remove] Removed { $names }.
        [update] Updated { $names }.
       *[install] Installed { $names }.
    }
cli-summary-failed = { $verb ->
        [add] <failed>Couldn't add</failed> { $names }.
        [remove] <failed>Couldn't remove</failed> { $names }.
        [update] <failed>Couldn't update</failed> { $names }.
       *[install] <failed>Couldn't install</failed> { $names }.
    }
cli-summary-stopped = { $verb ->
        [add] Stopped before adding { $names }.
        [remove] Stopped before removing { $names }.
        [update] Stopped before updating { $names }.
       *[install] Stopped before installing { $names }.
    }

## Sizes

# $count is a number of bytes below 1000
cli-size-bytes = { $count ->
        [one] { $count } byte
       *[other] { $count } bytes
    }
# $amount is a number with one decimal, such as 84.2
cli-size-kb = { $amount } kB
cli-size-mb = { $amount } MB
cli-size-gb = { $amount } GB
cli-size-tb = { $amount } TB

## Answering as dnf, apt, pacman and zypper

# $manager is the package manager that was run, such as apt
cli-manager-not-dnf = Luft is based on Fedora, so it uses dnf instead of { $manager }.
cli-manager-read-only = The system is read-only, so software comes from Schelf instead:
# $command is schelf install …
cli-manager-schelf = { $command } installs apps from Flathub and tools from Fedora,
# $command is dnf install …
cli-manager-dnf = { $command } adds any package from Fedora to the system, such as Tailscale.
cli-manager-updates = Luft updates itself. Updates are in Settings, under Updates.
# $command is schelf update
cli-manager-updates-schelf = Apps, AppImages and system packages update with { $command }.
# $names is a list of packages or files
cli-manager-install = Luft installs this with Schelf. Install { $names }?
cli-manager-remove = Luft removes this with Schelf. Remove { $names }?
cli-manager-search = Luft finds software with Schelf. Search for { $names }?
cli-manager-sources = Luft adds software sources for system packages with Schelf.
