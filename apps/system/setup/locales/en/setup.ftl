## Buttons used across steps

setup-continue = Continue
setup-back = Back
setup-cancel = Cancel
setup-close = Close
# Button that skips the current step
setup-not-now = Not now
setup-try-again = Try again
# Button, verb: restarts the computer
setup-restart = Restart
setup-restart-now = Restart now
setup-restart-later = Restart later
# Button label while the account is being saved
setup-saving = Saving

## Install progress, shown at the bottom of every step while Luft copies

# Screen-reader label of the progress bar
setup-installing-label = Installing Luft
# $progress is a percentage, like "42%"
setup-installing-progress = Installing, { $progress }

## Choosing from a list (language, keyboard, time zone)

# Search field placeholder inside the list
setup-picker-search = Search
setup-picker-no-match = Nothing matches

## Welcome step: language, keyboard and time zone

setup-region-title = Welcome to Luft
setup-region-language = Language
setup-region-keyboard = Keyboard
setup-region-time-zone = Time zone
setup-region-intro-guessed-computer = We guessed these from your computer. Change anything that’s off.
# $guesses lists what was guessed and where from, built from the setup-region-guess-* messages and
# joined like "your keyboard from your computer and your time zone from your network"
setup-region-intro-guessed = We guessed { $guesses }. Change anything that’s off.
# $fields is a list of setup-region-field-* names, like "language and keyboard"
setup-region-guess-from-computer = your { $fields } from your computer
# $fields is a list of setup-region-field-* names, like "language and keyboard"
setup-region-guess-from-network = your { $fields } from your network
setup-region-field-language = language
setup-region-field-keyboard = keyboard
setup-region-field-time-zone = time zone

## Note that Luft is still early, shown after the welcome step

setup-early-title = Luft isn’t finished yet
setup-early-body = Luft is good enough for every day, but things will still change, break or be missing.
setup-early-reports = If something looks or feels wrong, tell us. Nothing is too small, not even an icon that’s off by a pixel.
setup-early-nightly = This is a nightly build, made every day and barely used before it reaches you.
# Shown instead of setup-early-nightly once a stable version is out
setup-early-nightly-stable = This is a nightly build, made every day and barely used before it reaches you. For fewer surprises, switch to the stable version later in Settings.
# github.com/Lantharos/Luft/issues stays as it is
setup-early-report = Report a problem at github.com/Lantharos/Luft/issues

## Where Luft goes

setup-destination-choose-title = Where should Luft go?
setup-destination-choose-description = Nothing changes until you confirm.
setup-destination-alongside-title = Make room next to Windows
setup-destination-alongside-description = Windows gets smaller to make room. Its files stay as they are.
setup-destination-whole-title = Choose a drive
setup-destination-whole-description = Luft takes over the whole drive. Everything on it is erased.
setup-destination-custom-title = Choose the space for Luft
setup-destination-custom-description = Use Disks to arrange your drives your way.
# $system is the name of the Linux system being replaced, like "Fedora Linux 42"
setup-destination-replace-title = Replace { $system }
setup-destination-replace-description = Luft takes its place and keeps what’s yours.
setup-destination-meet-title = Next to Windows
setup-destination-meet-description = Meet Luft already made this room, so Windows stays just as it is.
# $drive is a drive name, like "Samsung SSD 980"
setup-destination-meet-drive-title = On { $drive }
setup-destination-meet-drive-description = Meet Luft already made this room on another drive.
setup-destination-looking = Looking at your drives

setup-destination-meet-choice = Alongside Windows
# $size is a size like "120 GB"
setup-destination-meet-choice-description = Use the { $size } Meet Luft made next to Windows.
# $drive is a drive name, like "Samsung SSD 980"
setup-destination-meet-drive-choice = On { $drive }
# $size is a size like "120 GB", and $drive a drive name
setup-destination-meet-drive-choice-description = Use the { $size } Meet Luft made on { $drive }.
# $windows is the Windows version, like "Windows 11"
setup-destination-alongside-choice = Alongside { $windows }
setup-destination-alongside-choice-description = Keep Windows and its files, and give Luft part of its drive.
# $system is the name of a Linux system on this computer
setup-destination-replace-choice = Replace { $system }
setup-destination-replace-choice-description = Keep your files, account and settings, and let Luft take its place.
setup-destination-whole-choice = Use a whole drive
setup-destination-whole-choice-description = Erase a drive and give all of it to Luft.
# Button that leaves setup and starts the desktop from the USB stick, without installing anything
setup-destination-try-choice = Just try Luft
setup-destination-custom-choice = Custom
setup-destination-custom-choice-description = Arrange partitions yourself in Disks.

setup-destination-more-options = More options
setup-destination-starting = Starting
# Button, verb
setup-destination-replace = Replace
setup-destination-install = Install Luft

## Confirming where Luft goes

# $system is the name of the Linux system being replaced
setup-confirm-replace-title = Replace { $system }?
# $drive is a drive name, like "Samsung SSD 980"
setup-confirm-erase-title = Erase { $drive }?
# $size is the size Windows keeps, like "200 GB"
setup-confirm-shrink-title = Shrink Windows to { $size }?
setup-confirm-meet-title = Install Luft next to Windows?
setup-confirm-meet-drive-title = Install Luft on { $drive }?
setup-confirm-free-title = Install Luft in the free space?
setup-confirm-replace-keep-old = Luft starts copying right away. The old system won’t start anymore, and its files stay until you remove them. Luft can’t be encrypted this way, so anyone with the drive could read your files.
setup-confirm-replace-erase-old = Luft starts copying right away. The old system is erased for good, and your files stay where they are.
setup-confirm-erase-description = Everything on this drive is erased for good, including other systems and files.
# $drive is a drive name, like "Samsung SSD 980". The drive has nothing on it
setup-confirm-empty-title = Install Luft on { $drive }?
setup-confirm-empty-description = This drive is empty, so nothing is lost. Luft starts copying right away.
setup-confirm-install-description = Luft starts copying right away.
setup-confirm-erase = Erase and install
# Button, verb
setup-confirm-install = Install

## Encryption

setup-protect-title = Protect your files
setup-protect-tpm = Encrypt this computer so nobody can read your files without signing in, even if it’s lost. It unlocks by itself when it starts.
setup-protect-passphrase = Encrypt this computer so nobody can read your files without your passphrase, even if it’s lost.
setup-protect-passphrase-secure-boot-off = Encrypt this computer so nobody can read your files without your passphrase, even if it’s lost. Turn on Secure Boot in the computer’s startup settings and Luft can unlock by itself.
setup-protect-keep-safe = Keep this recovery key safe, away from this computer. You need it if it ever can’t unlock by itself.
setup-protect-passphrase-label = Passphrase
setup-protect-repeat = Type it again
setup-protect-mismatch = They don’t match
# Read out by screen readers; $key is the recovery key
setup-protect-key-label = Recovery key { $key }
setup-protect-save-usb = Save to a USB drive
setup-protect-print = Print
setup-protect-write = Write it down
setup-protect-usb-plug = Plug in a USB drive to save the key on. Nothing else on it changes.
# Button, verb: saves the recovery key on this USB drive
setup-protect-usb-save = Save
setup-protect-usb-done = Saved
# Button: closes the USB drive dialog once the key is saved
setup-protect-usb-close-saved = Done
# $drive is the name of a USB drive
setup-protect-usb-saved = The key is saved on { $drive }. You can take the drive out now.
setup-protect-printed = Sent to the printer. Keep the page somewhere safe.
setup-protect-written = Written down and checked. Keep the paper somewhere safe.
# Title of a dialog when printing the recovery key failed
setup-protect-print-failed = The key couldn’t be printed
# Button: closes the dialog saying printing failed
setup-protect-close = Close
# Button: installs Luft without encrypting it
setup-protect-skip = Don’t encrypt
# Button, verb: installs Luft encrypted
setup-protect-encrypt = Encrypt

## Making room next to Windows

# $drive is a drive name, like "Samsung SSD 980"
setup-alongside-hint = Drag to share { $drive } between Windows and Luft.
setup-windows-bitlocker = Windows keeps this drive locked with BitLocker, so Luft can’t make room on it. In Windows, turn off device encryption, or shrink the drive in Disk Management and choose the free space under Custom.
setup-windows-hibernated = Windows is asleep or was shut down with Fast Startup, so its drive can’t be changed safely. Start Windows, hold Shift while you choose Shut down, then start Luft again.
setup-windows-dirty = Windows’ drive needs a quick check first. Start Windows, restart it once, then start Luft again.
# $size is how much space to free, like "12 GB"
setup-windows-full = Windows needs almost all of its drive. Free up about { $size } in Windows, then start Luft again.

## Room made by Meet Luft

# $size is the size of the space for Luft, like "120 GB"
setup-meet-room-luft = Luft, { $size }
# $size is a size like "4.2 GB"
setup-meet-room-packed = The things you packed in Windows, { $size }, are unpacked into your new account.

## The moving box packed in Windows with Meet Luft, which opens with the code Meet Luft showed

setup-box-title = Unpack what you brought from Windows?
setup-box-description = Type the code Meet Luft showed you in Windows to unpack them into your new account.
# Label of the field the code is typed into
setup-box-code = Code from Meet Luft
# Button that opens the moving box with the typed code
setup-box-open = Unpack
# Button that leaves the moving box closed and carries on installing
setup-box-skip = Leave them behind

## Windows options

setup-windows-fast-startup = Turn off Fast Startup in Windows
setup-windows-fast-startup-description = Windows then shuts down fully, so its drive stays open and devices start fresh in Luft.
setup-windows-clock = Keep the clock right in both
setup-windows-bluetooth = Bring your Bluetooth devices
setup-windows-bluetooth-description = { $count ->
    [one] { $count } device paired in Windows
   *[other] { $count } devices paired in Windows
}

## Choosing a drive

# Screen-reader label of the list of drives
setup-drives-label = Drives
setup-drives-none = There’s no drive Luft can use. Connect one and look again.
# $windows is the Windows version, like "Windows 11"
setup-drive-has-windows = Has { $windows }
# A drive with no partitions
setup-drive-empty = Empty
setup-drive-partitions = { $count ->
    [one] Has { $count } partition
   *[other] Has { $count } partitions
}

## Custom space

setup-custom-open-disks = Open Disks
setup-custom-looking = Looking
setup-custom-look-again = Look again
# Screen-reader label of the list of free spaces
setup-custom-free-label = Free space
# $size is a size like "120 GB"
setup-custom-free-space = { $size } of free space
# $drive is a drive name, like "Samsung SSD 980"
setup-custom-on-drive = On { $drive }
# $size is a size like "20 GB"
setup-custom-none = Make at least { $size } of free space in Disks, then look again.

## Replacing a Linux system

setup-replace-stays = What stays
setup-replace-changes = What changes
# $account is a user name, like "ada"
setup-replace-keeps-account = Your files, and your account { $account }
# $account is a user name, like "ada"
setup-replace-keeps-account-password = Your files, and your account { $account } with its password
setup-replace-keeps-accounts = { $count ->
    [one] The other account on it, with its files
   *[other] The other { $count } accounts on it, with their files
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } network connection, with its Wi-Fi password
   *[other] { $count } network connections, with Wi-Fi passwords
}
# $drives is a list of drive names
setup-replace-keeps-drives = { $drives }, mounted at startup as before
# $hostname is the computer's network name
setup-replace-keeps-hostname = The computer’s name, { $hostname }, and its SSH keys
setup-replace-keeps-tools = { $count ->
    [one] { $count } command-line tool you installed, in a Toolbox after you sign in
   *[other] { $count } command-line tools you installed, in a Toolbox after you sign in
}
# $system is the name of the Linux system being replaced. "old-system" is a folder name, keep it as it is
setup-replace-keeps-old = { $system } stops starting. Its system files are kept as old-system until you remove them in Disks or Settings.
# $system is the name of the Linux system being replaced
setup-replace-erases-system = The system partition of { $system } is erased. Your files are on their own partition and stay as they are.
setup-replace-clears-boot = Its /boot partition is cleared to hold Luft’s startup files.
setup-replace-apps = Apps installed in it don’t come along. Get them again from Schelf.

setup-replace-blocked-encrypted = It’s encrypted, so replacing it while keeping your files isn’t supported yet.
setup-replace-blocked-single = Your files share one partition with the system, so replacing it while keeping them isn’t supported yet.
setup-replace-blocked-layout = Its drive is laid out in a way Luft can’t replace yet.
setup-replace-blocked-startup = Its EFI system partition is too small for Luft, and there’s no /boot partition to use instead.
setup-replace-blocked-no-account = It has no account to bring over.
setup-replace-blocked-running = Luft is starting from it right now. Start Luft from a USB stick to replace it.
setup-replace-blocked-read-only = Its drive is read-only.

## Connecting to the internet

setup-network-title = Connect to the internet
setup-network-intro = Optional. It lets Luft set your clock and time zone, and keeps you connected once Luft is installed.
setup-network-unavailable = Networks aren’t available right now. You can connect later from the panel.
setup-network-looking = Looking for networks
setup-network-cable = Connected with a cable
setup-network-show-all = Show all networks
# Button that moves on without connecting
setup-network-skip = Skip
setup-network-failed = Couldn’t connect
setup-network-wrong-password = Wrong password
setup-network-connected = Connected
setup-network-connecting = Connecting
# A network this computer knows the password of
setup-network-saved = Saved
setup-network-password = Password
# Button, verb: joins the Wi-Fi network
setup-network-join = Join

## Account

setup-account-title = Who’s using this computer?
setup-account-description = You can add more people later in Settings.
setup-account-full-name = Your name
# Example name shown in the empty name field. Use a well-known name that fits your language
setup-account-full-name-example = Ada Lovelace
setup-account-user-name = User name
setup-account-password = Password
setup-account-repeat = Type it again
setup-account-user-name-invalid = Use lowercase letters, numbers, - and _
# The name other computers on the network see, like "ada-laptop"
setup-account-computer-name = Computer name
setup-account-computer-name-invalid = Use lowercase letters, numbers and -, without a - at either end
setup-account-full-name-invalid = Leave out commas and colons
setup-account-mismatch = The passwords don’t match

## Installing

setup-finishing-failed-title = Luft couldn’t be installed
setup-finishing-failed-stick = Your computer still starts the way it did before. Try again, or keep using Luft from the USB stick.
setup-finishing-failed-trying = Your computer still starts the way it did before. Try again, or keep using Luft as it is now.
setup-finishing-try-again = Try again
setup-finishing-details = Details
setup-finishing-details-title = What went wrong
setup-finishing-use-stick = Use Luft from the stick
setup-finishing-keep-trying = Keep trying Luft
setup-finishing-installed-title = Luft is installed
setup-finishing-secure-boot-stick = After the restart, a blue screen asks for this code to finish setting up Secure Boot. Take out the USB stick once Luft has started.
setup-finishing-secure-boot = After the restart, a blue screen asks for this code to finish setting up Secure Boot.
setup-finishing-restart-started-stick = Restart to start using it. Take out the USB stick once Luft has started.
setup-finishing-restart = Restart to start using it.
setup-finishing-installing-title = Installing Luft
setup-finishing-description = This takes a few minutes.
setup-finishing-plug-in = Keep your computer plugged in until it’s done.
setup-stage-idle = Getting ready
setup-stage-preparing = Making room for Luft
setup-stage-copying = Copying Luft
setup-stage-waiting = Finishing up
setup-stage-configuring = Setting up your account
setup-stage-finished = Done

## What kind of network the computer is on, asked on the first start

setup-network-type-title = What kind of network is this?
# $network is the name of the network, or a list of names when the computer joined several
setup-network-type-description = You’re connected to { $network }.
setup-network-type-home = Home
    .detail = At home or at work. Casting, games and sharing files just work
setup-network-type-public = Public
    .detail = In a café, hotel or airport. Nothing on the network can reach this computer

## Finishing Secure Boot at startup (adding Luft's key on shim's blue screen)
## The blue screen is always in English, so $option, $question and $prompt are its
## own words, which stay in English and in quotes.

setup-enroll-press-any-key = Press any key. It waits a minute.
setup-enroll-choose = Choose “{ $option }”
setup-enroll-confirm = At “{ $question }”, choose “{ $option }”
setup-enroll-type = At “{ $prompt }”, type the code and press Enter, then choose “{ $option }”
# Read out by screen readers; $code is the eight-digit code
setup-enroll-code-label = Code { $code }
setup-enroll-code-hint = Type all eight digits, without a space. Nothing shows while you type.
setup-enroll-missed = If the blue screen goes by, Luft starts anyway and you can try again.
setup-secure-boot-finish-title = Finish setting up Secure Boot
setup-secure-boot-pending = After the next restart, a blue screen asks for this code to finish setting up Secure Boot.
setup-secure-boot-not-set-up = Secure Boot isn’t set up for Luft yet, so Luft starts without its boot menu. Get a code, restart, and use the keyboard on the blue screen.
setup-secure-boot-getting = Getting your code
setup-secure-boot-get-code = Get a code

## Fingerprint

setup-fingerprint-title = Sign in with your finger
setup-fingerprint-description = Unlock Luft with a touch instead of your password.
setup-fingerprint-which = Which finger?
setup-fingerprint-another = Add another finger?
# Label of the finger dropdown (screen readers)
setup-fingerprint-finger = Finger
setup-fingerprint-no-reader = The fingerprint reader isn’t answering. You can add a fingerprint later in Settings.
setup-fingerprint-add = Add fingerprint
setup-fingerprint-choose-another = Choose another finger

## Done

setup-ready-title = You’re all set
setup-ready-secure-boot = Restart once more to finish setting up Secure Boot. A blue screen then asks for this code.
setup-ready-done = Your desktop is ready. Have fun with Luft.
setup-ready-start-title = Start
setup-ready-start-detail = Your apps, files and search, from the taskbar or the Super key.
setup-ready-schelf-title = Schelf
setup-ready-schelf-detail = Get more apps and keep them up to date.
setup-ready-settings-title = Settings
setup-ready-settings-detail = Wi-Fi, accounts, wallpaper and everything else.
setup-ready-settings-secure-boot = Finish setting up Secure Boot whenever you’re ready, under Security.
setup-ready-start = Start using Luft
