## An app's page: the header and its buttons

app-from-flathub = From Flathub
app-from-fedora = From Fedora
app-withdrawn = No longer available on { -schelf }
app-remove = Remove
app-update = Update
# Verb: starts the app
app-open = Open
app-install = Install
app-download = Download
# $version is a Luft version, such as 1.4
app-needs-luft = Needs { -luft } { $version } or newer. Update { -luft } in Settings to install it.
# $needs lists what the extension does that its sandbox can't allow, such as "use the camera and record the screen"
app-needs-review = Can be installed once schelf.store approves it to run inside { -luft }, which it needs to { $needs }.
app-newest-needs-luft = Its newest version needs { -luft } { $version } or newer.
app-runs-on-luft = Runs on { -luft } { $version } and newer
# $version is the app's version
app-whats-new = What's new in { $version }

## An app's page: what it can do

app-abilities = What it can do
app-abilities-inside-luft = Runs inside { -luft }, approved by schelf.store
app-abilities-sandboxed = Runs in a sandbox, with only what’s listed
app-full-access = Full access
# $reason is the developer's own explanation, in their words
app-full-access-declared = It asks to run outside a sandbox: “{ $reason }”
app-full-access-unsandboxed = It runs outside a sandbox, like a program you start yourself.

## An app's page: details

app-details = Details
app-version = Version
# $date is when this version came out
app-released = Released { $date }
app-size = Size
# $size is a size such as 84 MB
app-size-on-disk = { $size } on disk
app-size-download = { $size } to download
app-size-download-and-disk = { $download } to download, { $installed } on disk
app-source = Source
app-origin-store = schelf.store
app-origin-flathub = Flathub
app-origin-fedora = Fedora, in the system for everyone
# $source is where it came from, such as Flathub
app-source-for-you = { $source }, for you only
app-source-for-everyone = { $source }, for everyone on this computer
app-commands = Commands
app-commands-description = Run them in Tern
app-services = Services
app-services-description = Start with the computer
app-developer = Developer
app-license = License
app-license-proprietary = Proprietary
app-website = Website
# Verb: opens the website
app-visit = Visit

## An app's page: versions

app-versions = Versions
app-channel = Channel
app-channel-with-luft = Same as { -luft }
app-channel-beta = Previews of the next version. Back up anything important.
app-channel-nightly = Built from the newest code, often daily, and nobody reviews them first. They can break.
# $developer is who made the app
app-channel-invited = Only people { $developer } invited get these.
app-channel-invited-anyone = Only people the developer invited get these.
# $ended is the channel that ended and $channel the one it follows now, such as Beta and Stable
app-channel-ended = { $ended } has ended, so this now follows { $channel }.
# $channel is the channel Luft itself follows
app-channel-luft = { -luft } is on { $channel }, so this is too.
# $channel is a channel's name as the developer wrote it, such as beta
app-channel-newest = Its newest version right now is the { $channel } one.
app-channel-keep-ended = You keep the version you have until a newer one is out on { $channel }.
app-channel-keep-stable = Going back to Stable keeps the version you have until a stable one is newer.

## An app's page: name and icon

app-name-and-icon = Name and icon
app-name = Name
# $name is the name the app comes with
app-name-custom = A name you chose, instead of “{ $name }”
app-name-own = The one the app comes with
app-rename = Rename
app-icon = Icon
app-icon-custom = A picture you chose
app-icon-own = The one the app comes with
# Verb
app-icon-change = Change
app-symbolic-icon = Symbolic icon
app-symbolic-custom = One you chose, for monochrome icon styles
app-symbolic-drawn = Drawn from the icon, for monochrome icon styles
app-icon-reset-title = Use the app's own icon
app-icon-reset-description = Puts back the icon it came with
app-icon-reset = Reset
# $name is the app's current name
app-rename-title = Rename { $name }
# $name is the name the app comes with
app-rename-description = Leave it empty to use “{ $name }” again.
app-rename-cancel = Cancel

## An app's page: notifications

app-notifications = Notifications
app-notifications-allow = Allow notifications
app-notifications-banners = Banners
app-notifications-banners-description = Pop up on screen when they arrive
app-notifications-sound = Sound
app-notifications-sound-description = Automatic stays quiet when the app plays its own sound
app-notifications-sound-automatic = Automatic
app-notifications-sound-luft = { -luft }’s sound
app-notifications-sound-app = The app’s own
app-notifications-sound-none = None
app-notifications-dnd = Allow during Do Not Disturb
app-notifications-dnd-description = Urgent means alarms and calls
app-notifications-dnd-never = Never
app-notifications-dnd-urgent = Urgent only
app-notifications-dnd-always = Always
app-notifications-keep = Keep in the notification list
app-notifications-keep-description = Otherwise they go once their banner closes
app-notifications-lock-screen = Show on the lock screen
app-notifications-lock-screen-hidden = Hidden for every app in Settings, under Privacy
app-notifications-lock-screen-content = Show message content on the lock screen

## An app's page: full access

app-full-access-on = It runs outside its sandbox, like a program you start yourself.
# $reason is the developer's own explanation, in their words
app-full-access-asks = It asks to run without its sandbox: “{ $reason }” Only turn this on if you trust it.
app-full-access-off = Takes away its sandbox. For one drive or folder, give it just that instead.
# $name is the app's name
app-restart-title = { $name } is open
app-restart-description = Changes apply once it opens again.
app-restart = Restart
app-full-access-consent-title = Give { $name } full access?
app-full-access-consent-description = From the next time it opens, { $name } can do all of this without asking.
app-full-access-consent-confirm = Give full access

## An app's page: what a sandboxed app can use

app-sandbox-change-title = Change what it can use
app-sandbox-change-description = Microphone, camera, Downloads and X11. More in Settings, under Apps.
# Verb: opens the dialog to change it
app-sandbox-change = Change
# $name is the app's name
app-sandbox-title = What { $name } can use
app-sandbox-microphone = Microphone
app-sandbox-microphone-description = Records the microphone and what this computer plays. Applies right away.
app-sandbox-camera = Camera
app-sandbox-camera-description = Some apps only find it the next time they open.
app-sandbox-downloads = Downloads folder
app-sandbox-downloads-description = It can read and change the files there, from the next time it opens. Files you pick always reach it.
app-sandbox-x11 = Older way of showing windows
app-sandbox-x11-description = For older apps that need X11, where apps can see each other’s windows and typing. Applies the next time it opens.
# $name is the app's name
app-restart-named = Restart { $name }
app-done = Done

## An app's page: drives and folders

app-places = Drives and folders
app-places-none = A drive or a folder, without full access.
# A drive with no name of its own; $size is its size, such as 64 GB
app-places-drive-unnamed = { $size } drive
# $name is the app's name
app-places-title = Drives and folders { $name } can use
app-places-drives = Drives
app-places-drives-description = It can use everything on these drives, from the next time it opens.
app-places-give-drive = Give a drive
app-places-unplugged = Not plugged in
app-places-read-only = Read only
# $place is a drive's name or a folder's path
app-places-stop-sharing = Stop sharing { $place }
app-places-remove = Remove
app-places-folders = Folders
app-places-folders-description = It can read and change everything in these folders, from the next time it opens.
app-places-add-folder = Add folder
app-places-give-title = Give { $name } a drive
app-places-read-only-switch = Only let it read
app-places-no-drives = No other drives are plugged in
app-places-cancel = Cancel

## An app's page: where it comes from

app-provenance = Where it comes from
app-provenance-built = Built on GitHub Actions
app-provenance-built-description = By the developer's workflow. Checked by schelf.store.
# $repository is a GitHub repository such as owner/app
app-provenance-built-repository = From { $repository }, by the developer's workflow. Checked by schelf.store.
# $commit is a short commit hash such as 1a2b3c4
app-provenance-built-commit = From { $repository } at { $commit }, by the developer's workflow. Checked by schelf.store.
app-provenance-run = See the build
app-provenance-uploaded = Uploaded by the developer
app-provenance-uploaded-description = Only the developer knows how it was made. Checked by schelf.store.
app-provenance-source = Source code

## An app's page: notices from schelf.store

# $name is the app's name
app-pulled = schelf.store pulled { $name }
app-warning = schelf.store has a warning about this version of { $name }
# After schelf.store's reason for pulling it, in $reason
app-pulled-description = { $reason } It can't start any more. Your files stay until you remove it.
app-replaced = Replaced by { $name }
app-replaced-open = Open { $name }

## Asking before installing from schelf.store

# $name is the app's name
app-consent-inside-title = Let { $name } run inside { -luft }?
app-consent-inside-description = schelf.store approved { $name } to run inside { -luft } instead of in its sandbox. There it can:
app-consent-inside-confirm = Run inside { -luft }
app-consent-install-title = Install { $name }?
app-consent-update-title = Update { $name }?
app-consent-update-description = This version of { $name } asks for more than before. It can use:
app-consent-approved = schelf.store approved { $name } to run inside { -luft }. It can:
app-consent-extension-sandboxed = { $name } runs in a sandbox. It can only:
app-consent-sandboxed = { $name } runs in a sandbox. It can use:
app-consent-install-full-title = Install { $name } with full access?
app-consent-update-full-title = Update { $name } with full access?
# $reason is the developer's own explanation, in their words
app-consent-full-declared = { $name } asks to run outside a sandbox: “{ $reason }” There it can do all of this without asking.
app-consent-full-unsandboxed = { $name } doesn't run in a sandbox, so it can do all of this without asking.
app-consent-full-declared-file = { $name } asks to run outside a sandbox: “{ $reason }” There it can do all of this without asking. You can take full access away on its page later.
app-consent-full-unsandboxed-file = { $name } doesn't run in a sandbox, so it can do all of this without asking. You can take full access away on its page later.
app-consent-install = Install
app-consent-update = Update
app-consent-install-full = Install with full access
app-consent-update-full = Update with full access
# $size is a size such as 84 MB
app-consent-size = { $size } to download

## Extensions and other lists of apps

browse-try-again = Try again
browse-no-extensions = There are no extensions yet.
browse-extensions = Extensions add to your desktop, from the wallpaper to quick settings and the taskbar.

## Discover

discover-offline = schelf.store can't be reached right now. The apps you have are still here.
discover-try-again = Try again
discover-empty = There are no apps here yet. Check back soon.

## Installed

installed-show = Show
installed-all = All
installed-apps = Apps
installed-tools = Command-line tools
installed-system = System add-ons
installed-extensions = Extensions
installed-kind = Kind of app
installed-kind-any = Every kind
installed-kind-store = From schelf.store
installed-sources = Software sources
installed-empty = No apps here yet.
installed-empty-tools = Command-line tools you install from search show up here.
installed-empty-system = Drivers and services you add to the system show up here.
# How many are shown, under the filter that's picked
installed-count-apps = { $count ->
    [one] { $count } app
   *[other] { $count } apps
}
installed-count-tools = { $count ->
    [one] { $count } tool
   *[other] { $count } tools
}
installed-count-system = { $count ->
    [one] { $count } add-on
   *[other] { $count } add-ons
}
installed-count-extensions = { $count ->
    [one] { $count } extension
   *[other] { $count } extensions
}
# $size is how much room they take together, such as 2.4 GB
installed-count-apps-size = { $count ->
    [one] { $count } app · { $size }
   *[other] { $count } apps · { $size }
}
installed-count-tools-size = { $count ->
    [one] { $count } tool · { $size }
   *[other] { $count } tools · { $size }
}
installed-count-system-size = { $count ->
    [one] { $count } add-on · { $size }
   *[other] { $count } add-ons · { $size }
}
installed-count-extensions-size = { $count ->
    [one] { $count } extension · { $size }
   *[other] { $count } extensions · { $size }
}
# $services lists the services an installed package runs
installed-runs = Runs { $services }
installed-update = Update
# Verb: starts the app
installed-open = Open
# $name is the app's name
installed-more = More for { $name }
installed-details = Details
installed-remove = Remove

## Search

search-on-computer = On this computer
search-extensions = Extensions
search-apps = Apps
# $error says what went wrong
search-apps-failed = Apps can't be searched right now. { $error }
# $query is what was typed into search
search-nothing = Nothing matches “{ $query }”.
search-tools = Command-line tools
search-tools-description = Installed for you only. You run them in Tern.
search-tools-failed = Command-line tools can't be searched right now. { $error }
search-system = System add-ons
search-system-description = From your software sources. They become part of the system and update with { -luft }.
search-system-failed = Your software sources can't be searched right now. { $error }
search-installed = Installed
search-install = Install
# $name is a package's name
search-system-title = Install { $name } for the whole computer?
search-system-dialog = { $name } brings a service or driver that only works as part of the system.
search-system-everyone = Installs for everyone on this computer
search-system-starts = Starts with the computer
search-system-updates = Updates with { -luft }

## Software sources

sources-intro = Software from companies like Docker or 1Password, which becomes part of the system and updates with { -luft }.
sources-add-title = Add a source
sources-add-description = Type 1password, docker, google-chrome or vscode, or paste the address its maker gives you.
sources-source = Source
sources-checking = Checking
sources-add = Add
sources-other = Other kinds of address
sources-other-description = For sources that give you a file address or a project name.
# Verb: opens a dialog that explains them
sources-show = Show
# $name is the source's name
sources-already-added = { $name } is already a software source.
sources-added = Added
# $packages lists what was installed from the source
sources-installed-from = Installed from it: { $packages }
sources-remove = Remove
sources-remove-title = Remove { $name }?
sources-remove-nothing = Nothing installed comes from it.
# $packages lists what gets removed along with the source
sources-remove-packages = { $count ->
    [one] This also removes { $packages } from the system, with everything it added.
   *[other] This also removes { $packages } from the system, with everything they added.
}
sources-cancel = Cancel
sources-repo-file = A .repo file
sources-repo-file-description = Its full https:// address, from the maker's install instructions.
sources-copr = A COPR project
sources-copr-description = Community builds for Fedora, typed like copr:owner/project.
sources-done = Done

## Updates

updates-checking = Checking for updates
updates-title = Updates
updates-none-found = No updates found
updates-up-to-date = Your apps are up to date
updates-available = { $count ->
    [one] { $count } update available
   *[other] { $count } updates available
}
# The name a batch of updates shows while it runs
updates-batch = { $count ->
    [one] { $count } app
   *[other] { $count } apps
}
updates-looking = Looking at schelf.store, Flathub, your AppImages and your tools
# $when says how long ago, such as 5 minutes ago
updates-checked = Checked { $when }
# $size is how much the updates download, such as 120 MB
updates-checked-size = { $size } to download · Checked { $when }
updates-check-now = Check now
updates-update-all = Update all
updates-apps = Apps
updates-tools = Command-line tools
updates-platforms = App platforms
updates-platforms-description = Shared parts that Flatpak apps are built on
updates-moves-inside = Approved to run inside { -luft }
updates-moves-out = No longer approved to run inside { -luft }
updates-widens = Asks for more access
# Verb: opens the app's page to look at what changed
updates-review = Review
updates-update = Update
