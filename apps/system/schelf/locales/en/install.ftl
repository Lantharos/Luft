## The small window that opens when you open an app file

install-window-title = Parcel

# Under the app's name; $publisher is who made it, $version the file's version
install-byline = { $publisher } · { $version }
install-version = Version { $version }

install-close = Close
install-open = Open
install-install = Install
# For a file that adds a source of Flatpak apps
install-add-source = Add source
install-update = Update
install-reinstall = Reinstall
install-remove = Remove
install-try-again = Try again
install-details = Details
install-from-store = Install from schelf.store
install-from-flathub = Install from Flathub
# Installs the opened file instead of the same app from schelf.store or Flathub
install-file = Install file

## One line each about what installing does

install-installed = Already installed
install-installed-same = This version is already installed
# $version is the installed version, older than the file's
install-installed-older = Version { $version } is installed
# $version is the installed version, newer than the file's
install-installed-newer = A newer version, { $version }, is installed
install-signed = Signed with a key this computer trusts
install-unsigned = Not signed by Fedora or a software source you added
# $source is the name of the software source the package comes with
install-from-source = Keeps getting updates from { $source }
install-adds-source = Adds { $source } to your software sources
install-source-unusable = Brings a software source Luft can’t use
install-for-everyone = Installs for everyone on this computer
install-for-you = Installs for you only
install-ubuntu = Runs in an Ubuntu space that can read and change your files
install-wrong-computer = Made for a different kind of computer
install-sandboxed = Runs in a sandbox
install-asks-full-access = Asks to run outside a sandbox
# $count is how many kinds of sensitive access it declared, such as the camera or a folder
install-sensitive = { $count ->
    [one] Asks for one kind of sensitive access
   *[other] Asks for { $count } kinds of sensitive access
}
install-asks-more = Runs in a sandbox, but asks for more than most apps
# $host is the website it updates from, such as dl.flathub.org
install-updates-from = Updates from { $host }
install-updates-by-file = Updates when you open a newer file
install-installs-from = Installs from { $host }
install-adds-flatpak-source = Adds { $host } as a source of apps
# $file is the file's name and $size its size, such as 84 MB
install-file-size = { $file }, { $size }

## When the same app is on schelf.store or Flathub

install-source-store = schelf.store
install-source-flathub = Flathub
# $source is schelf.store or Flathub
install-listed = Also on { $source }, which keeps it up to date
install-listed-same = { $source } has this version and keeps it up to date
# $version is the version there, newer than the file's
install-listed-newer = { $source } has { $version } and keeps it up to date
# $version is the version there, older than the file's
install-listed-older = { $source } only has an older version, { $version }
install-listed-installed = Already installed from { $source }

## Once it's done

# $app is the app's name
install-done = { $app } is installed
install-done-source = The source is added
# $app is the app's name; the reason follows on the next line
install-failed = { $app } couldn’t be installed
install-remove-failed = { $app } couldn’t be removed

file-add-and-install = Add and install
file-full-access-title = Give { $name } full access?
file-full-access-description = { $name } asks to run outside a sandbox: “{ $reason }” There it can do all of this without asking. You can take full access away on its page later.
file-full-access-confirm = Install with full access
file-unverified-title = Install { $name } without checking it?
file-unverified-description = It isn't signed by Fedora or a software source you added. Only install it if you trust whoever gave it to you.
file-unverified-fact = Not verified
file-for-everyone-fact = Installs for everyone on this computer
file-administrator-fact = Can run as administrator while it installs
file-no-updates-fact = Won't get updates
file-install-anyway = Install anyway
