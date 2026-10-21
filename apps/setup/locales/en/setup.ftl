## Buttons used across steps

setup-continue = Continue
setup-back = Back
setup-cancel = Cancel
# Button that skips the current step
setup-not-now = Not now
setup-try-again = Try again
# Button, verb: restarts the computer
setup-restart = Restart
setup-restart-now = Restart now
setup-restart-later = Restart later
# Button label while the account is being saved
setup-saving = Saving…

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
setup-region-intro = Let’s get you set up. Choose your language, keyboard and time zone.
setup-region-intro-guessed-computer = Let’s get you set up. We guessed these from your computer, so change anything that’s off.
# $guesses lists what was guessed and where from, built from the setup-region-guess-* messages and
# joined like "your keyboard from your computer and your time zone from your network"
setup-region-intro-guessed = Let’s get you set up. We guessed { $guesses }, so change anything that’s off.
# $fields is a list of setup-region-field-* names, like "language and keyboard"
setup-region-guess-from-computer = your { $fields } from your computer
# $fields is a list of setup-region-field-* names, like "language and keyboard"
setup-region-guess-from-network = your { $fields } from your network
setup-region-field-language = language
setup-region-field-keyboard = keyboard
setup-region-field-time-zone = time zone

## Where Luft goes

setup-destination-choose-title = Where should Luft go?
setup-destination-choose-description = Pick how Luft fits on this computer. Nothing changes until you confirm.
setup-destination-alongside-title = Make room next to Windows
setup-destination-alongside-description = Windows gets smaller to make space for Luft. Your files in Windows stay as they are.
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
setup-destination-meet-drive-description = Meet Luft already made this room on another drive, and Luft starts from there with start files of its own.
setup-destination-looking = Looking at your drives…

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
setup-destination-replace-choice-description = Keep your files, your account and your settings, and let Luft take its place.
setup-destination-whole-choice = Use a whole drive
setup-destination-whole-choice-description = Erase a drive and give all of it to Luft.
setup-destination-try-choice = Just try Luft
setup-destination-try-choice-description = Look around first. Nothing is installed and your drives stay untouched.
setup-destination-custom-choice = Custom
setup-destination-custom-choice-description = Arrange partitions yourself in Disks.

setup-destination-more-options = More options
setup-destination-starting = Starting…
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
setup-confirm-replace-keep-old = Luft starts copying right away. The old system won’t start anymore, and its files stay until you remove them.
setup-confirm-replace-erase-old = Luft starts copying right away. The old system is erased for good, and your files stay where they are.
setup-confirm-erase-description = Everything on this drive is erased for good, including other systems and files.
setup-confirm-install-description = Luft starts copying right away. You can set up your account while it works.
setup-confirm-erase = Erase and install
# Button, verb
setup-confirm-install = Install

## Making room next to Windows

# $drive is a drive name, like "Samsung SSD 980"
setup-alongside-hint = Drag to share { $drive } between Windows and Luft. Windows keeps all of its files and some room to grow.
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

## Windows options

setup-windows-fast-startup = Turn off Fast Startup in Windows
setup-windows-fast-startup-description = Windows then shuts down fully, so sound, Wi-Fi and Bluetooth start fresh in Luft and its drive stays open.
setup-windows-clock = Keep the clock right in both
setup-windows-clock-description = Windows reads the computer’s clock the way Luft does, so the time no longer jumps when you switch.
setup-windows-bluetooth = Bring your Bluetooth devices
setup-windows-bluetooth-description = { $count ->
    [one] { $count } device paired in Windows will work in Luft without pairing again.
   *[other] { $count } devices paired in Windows will work in Luft without pairing again.
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
setup-custom-looking = Looking…
setup-custom-look-again = Look again
# Screen-reader label of the list of free spaces
setup-custom-free-label = Free space
# $size is a size like "120 GB"
setup-custom-free-space = { $size } of free space
# $drive is a drive name, like "Samsung SSD 980"
setup-custom-on-drive = On { $drive }
# $size is a size like "20 GB"
setup-custom-none = Make at least { $size } of free space in Disks, then look again. Luft goes into the space you leave free.

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
setup-network-description = This is optional. Being online lets Luft set your clock and time zone, and you can use the internet while Luft installs.
setup-network-unavailable = Networks aren’t available right now. You can connect later from the panel.
setup-network-looking = Looking for networks…
setup-network-cable = Connected with a cable
setup-network-show-all = Show all networks
# Button that moves on without connecting
setup-network-skip = Skip
setup-network-failed = Couldn’t connect
setup-network-wrong-password = Wrong password
setup-network-connected = Connected
setup-network-connecting = Connecting…
# A network this computer knows the password of
setup-network-saved = Saved
setup-network-password = Password
# Button, verb: joins the Wi-Fi network
setup-network-join = Join

## Account

setup-account-title = Who’s using this computer?
setup-account-description = This is the account you sign in with. You can add more people later in Settings.
setup-account-full-name = Your name
# Example name shown in the empty name field. Use a well-known name that fits your language
setup-account-full-name-example = Ada Lovelace
setup-account-user-name = User name
setup-account-password = Password
setup-account-repeat = Type it again
setup-account-user-name-invalid = Use lowercase letters, numbers, - and _
setup-account-full-name-invalid = Leave out commas and colons
setup-account-mismatch = The passwords don’t match

## Installing

setup-finishing-failed-title = Luft couldn’t be installed
setup-finishing-failed-description = Something went wrong while installing.
setup-finishing-failed-stick = Your computer still starts the way it did before. You can keep using Luft from the USB stick, or restart and try again.
setup-finishing-failed-trying = Your computer still starts the way it did before. You can keep using Luft as it is now, or restart and try again.
setup-finishing-use-stick = Use Luft from the stick
setup-finishing-keep-trying = Keep trying Luft
setup-finishing-installed-title = Luft is installed
setup-finishing-trust-stick = Take out the USB stick once the screen goes dark. A blue screen then asks to trust Luft. Use the keyboard there.
setup-finishing-trust = Right after the restart, a blue screen asks to trust Luft. Use the keyboard there.
setup-finishing-restart-stick = Restart to start using it. Take out the USB stick once the screen goes dark.
setup-finishing-restart = Restart to start using it.
setup-finishing-title = Almost there
setup-finishing-description = Luft is being copied to your computer. This takes a few minutes.
setup-finishing-plug-in = Keep your computer plugged in until it’s done.
setup-stage-idle = Getting ready
setup-stage-preparing = Making room for Luft
setup-stage-copying = Copying Luft
setup-stage-waiting = Finishing up
setup-stage-configuring = Setting up your account
setup-stage-finished = Done

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Press a key within 10 seconds
setup-enroll-choose-enroll = Choose Enroll MOK, then Continue
setup-enroll-choose-yes = Choose Yes
setup-enroll-type-code = Type the code, then choose Reboot
# Under the code to type. $count is how many digits it has
setup-enroll-digits = { $count ->
    [one] { $count } digit
   *[other] { $count } digits
}
setup-secure-boot-title = Your computer doesn’t trust Luft yet
setup-secure-boot-code = Right after the next restart, a blue screen asks to trust Luft. Use the keyboard there with this code.
setup-secure-boot-skipped = The blue screen was skipped. Get a new code and restart, then use the keyboard there.
setup-secure-boot-getting = Getting your code…
setup-secure-boot-new-code = Get a new code

## Encryption

setup-protect-title = Protect your files
setup-protect-tpm = Encrypt this computer so nobody can read your files without signing in, even if it’s lost. It unlocks by itself when it starts.
setup-protect-passphrase = Encrypt this computer so nobody can read your files without your passphrase, even if it’s lost.
setup-protect-staged-title = Your files will be encrypted
setup-protect-staged-description = Encrypting starts by itself after the restart at the end of setup, and you can keep using your computer while it works.
setup-protect-keep-safe = Keep this recovery key somewhere safe, away from this computer. You need it if the computer ever can’t unlock by itself.
setup-protect-passphrase-label = Passphrase
setup-protect-repeat = Type it again
setup-protect-mismatch = They don’t match
setup-protect-kept = I’ve kept my recovery key
setup-protect-background = Encrypting happens in the background after the next restart, and you can keep using your computer meanwhile.
# Button, verb
setup-protect-encrypt = Encrypt
setup-protect-checking = Checking…
setup-protect-start = Encrypt my files

## Fingerprint

setup-fingerprint-title = Sign in with your finger
setup-fingerprint-description = Unlock Luft with a touch instead of typing your password. You can add more fingers later in Settings.
setup-fingerprint-which = Which finger?
setup-fingerprint-another = Add another finger?
# Label of the finger dropdown (screen readers)
setup-fingerprint-finger = Finger
setup-fingerprint-no-reader = The fingerprint reader isn’t answering. You can add a fingerprint later in Settings.
setup-fingerprint-add = Add fingerprint
setup-fingerprint-choose-another = Choose another finger

## Done

setup-ready-title = You’re all set
setup-ready-trust = Restart once more to finish. Right after the restart, a blue screen asks to trust Luft. Use the keyboard there with this code.
setup-ready-restart = Restart once more to finish, then sign in with your password.
setup-ready-done = Your desktop is ready. Have fun with Luft.
setup-ready-start = Start using Luft
