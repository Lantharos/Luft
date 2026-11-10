## Date and time

settings-datetime-automatic = Set the time automatically
settings-datetime-automatic-description = Keeps the clock accurate using the internet
settings-datetime-date-and-time = Date and time
settings-datetime-automatic-zone = Set the time zone automatically
settings-datetime-automatic-zone-description = Follows your location when you travel
settings-datetime-automatic-zone-location-off = Turn on location services in Privacy to use this
settings-datetime-zone = Time zone
# $place is a country, $offset is like UTC+2
settings-datetime-zone-description = { $place } · { $offset }
settings-datetime-clock = Clock
settings-datetime-time-format = Time format
settings-datetime-format-24h = 24-hour
settings-datetime-format-12h = AM/PM
settings-datetime-seconds = Show seconds
settings-datetime-weekday = Show the day of the week
settings-datetime-week-start = Week starts on
settings-datetime-week-start-automatic = Automatic
settings-datetime-week-start-monday = Monday
settings-datetime-week-start-sunday = Sunday
# $day is a weekday name, like Monday
settings-datetime-week-start-regional = { $day }, from your region
settings-datetime-set-title = Set date and time
settings-datetime-previous-month = Previous month
settings-datetime-next-month = Next month
settings-datetime-hour = Hour
settings-datetime-minute = Minute
# Screen-reader label of the AM/PM choice
settings-datetime-day-period = Morning or afternoon
# Screen-reader labels of the arrows of a time field; $label is Hour or Minute
settings-datetime-increase = Increase { $label }
settings-datetime-decrease = Decrease { $label }
settings-datetime-set-failed = The date and time couldn’t be changed.
settings-datetime-cancel = Cancel
# Button, verb: apply the chosen date and time
settings-datetime-set = Set
settings-datetime-zone-search = Search for a city or country
settings-datetime-zones = Time zones
# Shown instead of a country for the UTC time zone
settings-datetime-utc = Coordinated Universal Time
settings-datetime-zone-no-match = No matching places
settings-datetime-zone-failed = The time zone couldn’t be changed.

## Users

settings-users-picture = Change your picture
# Shown over the account picture on hover
settings-users-picture-edit = Edit
settings-users-account = Your account
settings-users-name = Name
settings-users-name-description = Shown when you sign in and on the lock screen
# Button, verb
settings-users-change = Change
settings-users-password = Password
settings-users-password-description = Used to sign in and unlock this computer
settings-users-password-set = Set password
settings-users-administrator = Administrator
settings-users-standard = Standard account
settings-users-others = Other people on this computer
settings-users-name-title = Change your name
settings-users-name-dialog-description = This is how you appear when you sign in.
settings-users-save = Save
settings-users-cancel = Cancel
settings-users-close = Close
settings-users-done = Done
settings-users-try-again = Try again
# Button, verb
settings-users-remove = Remove
settings-users-password-change-title = Change your password
settings-users-password-set-title = Set a password
settings-users-password-dialog-description = You’ll use it to sign in and unlock this computer.
settings-users-password-current = Current password
settings-users-password-new = New password
settings-users-password-new-placeholder = { $count ->
    [one] At least { $count } character
   *[other] At least { $count } characters
}
# Label of the field where the new password is typed a second time
settings-users-password-confirm = Confirm
settings-users-password-confirm-placeholder = Type it again
settings-users-password-change = Change password
settings-users-password-changing = Changing
settings-users-password-wrong = That isn’t your current password
settings-users-password-mismatch = The passwords don’t match
settings-users-password-too-short = This password is too short
settings-users-password-too-similar = This is too similar to your current password
settings-users-password-dictionary-word = This is based on a dictionary word. Try something less common.
settings-users-password-too-simple = This is too simple. Make it longer or mix in more kinds of characters.
settings-users-password-contains-name = This contains your name. Try something others couldn’t guess.
settings-users-password-rejected = This password wasn’t accepted. Try a different one.
settings-users-password-minimum = { $count ->
    [one] Use at least { $count } character
   *[other] Use at least { $count } characters
}
settings-users-password-weak = Weak. Longer passwords with a mix of words are harder to guess.
settings-users-password-fair = Fair. Adding a few more characters makes it stronger.
settings-users-password-strong = Strong
settings-users-fingerprints = Fingerprints
settings-users-fingerprint-add = Add a fingerprint
settings-users-fingerprint-add-description = Sign in and unlock with your finger instead of typing your password
settings-users-fingerprint-choose = Choose which finger to add.
settings-users-finger = Finger
# Button, verb: begin scanning the finger
settings-users-fingerprint-start = Start
settings-users-fingerprint-another = Choose another finger
# Screen-reader label; $finger is a finger name, like Right index finger
settings-users-fingerprint-remove = Remove { $finger }
settings-users-fingerprint-remove-title = Remove this fingerprint?
# $finger is a finger name as used inside a sentence, like "right index finger"
settings-users-fingerprint-remove-description = You won’t be able to use your { $finger } to sign in anymore.

## Login screen

settings-login-unavailable = The login screen can’t be changed on this computer.
settings-login-wallpaper = Wallpaper
settings-login-wallpaper-label = Login screen wallpaper
settings-login-wallpaper-shared-description = Everyone sees the same picture before they sign in
settings-login-wallpaper-own-description = Everyone sees their own wallpaper when they choose their account
# Choice: each person sees their own wallpaper
settings-login-wallpaper-own = Their own
settings-login-wallpaper-shared = Same for everyone
settings-login-picture = Picture
settings-login-picture-description = Shown behind the login screen
# Button, verb
settings-login-picture-change = Change
settings-login-people = People
settings-login-show-people = Show people on the login screen
settings-login-show-people-on = Choose an account from a list to sign in
settings-login-show-people-off = Everyone types their username to sign in
settings-login-person-hidden = Types their username to sign in
# Screen-reader label of a switch; $name is a person's name
settings-login-show-person = Show { $name }
settings-login-signing-in = Signing in
settings-login-session = Default session
settings-login-session-description = Used unless someone picks another
settings-login-session-automatic = Automatic
settings-login-automatic = Automatic login
settings-login-automatic-description = Signs in without a password at startup
# Automatic login is turned off
settings-login-automatic-off = Off

## Updates

settings-updates-checking = Looking for updates
settings-updates-downloading = Downloading updates
settings-updates-rolling-back = Getting the earlier version ready
settings-updates-switching-nvidia = Downloading NVIDIA’s driver
settings-updates-switching-standard = Downloading Luft without NVIDIA’s driver
settings-updates-up-to-date = Your system is up to date
settings-updates-version = Version { $version }
settings-updates-version-new = A new version
# A nightly build of a version that isn't out yet, like "1.2 Nightly 21": $release is the version it leads to, $number counts the nightly builds toward it
settings-version-nightly = { $release } Nightly { $number }
settings-updates-returning = Ready to go back to version { $version }
settings-updates-returning-unversioned = Ready to go back to the earlier version
settings-updates-nvidia-ready = NVIDIA’s driver is ready
settings-updates-standard-ready = Luft without NVIDIA’s driver is ready
settings-updates-version-available = Version { $version } is available
settings-updates-version-available-new = A new version is available
settings-updates-version-staged = Version { $version } is ready to install
settings-updates-version-staged-new = A new version is ready to install
settings-updates-restart-return = Restart to finish going back.
settings-updates-restart-switch = Restart to finish. Your computer is back in a few minutes.
settings-updates-restart-install-it = Restart to install it. Your computer is back in a few minutes.
# $when is a relative time, like 5 minutes ago
settings-updates-last-checked = Last checked { $when }
settings-updates-never-checked = Not checked yet
settings-updates-stop = Stop
settings-updates-check = Check now
settings-updates-checking-button = Checking
settings-updates-app-updates = App updates
settings-updates-apps-count = { $count ->
    [0] Managed in Schelf
    [one] { $count } app has an update in Schelf
   *[other] { $count } apps have updates in Schelf
}
# { $app } is the name of an app the person installed themselves.
settings-updates-sabine-waiting = A Sabine update is waiting for { $app }
settings-updates-sabine-update-ready = An update for { $app } is ready in Schelf
settings-updates-sabine-update-or-remove = Update or remove { $app } in Schelf to get it
settings-updates-automatic = Automatic updates
settings-updates-look = Look for updates
settings-updates-look-description = Even when Settings is closed
settings-updates-schedule-daily = Every day
settings-updates-schedule-weekly = Every week
settings-updates-schedule-never = Only when I check
settings-updates-background = Download in the background
settings-updates-background-label = Download updates in the background
settings-updates-background-description = Updates are ready to install the next time you restart
settings-updates-firmware = Firmware
settings-updates-firmware-description = Updates for the software built into your hardware
settings-updates-firmware-restart = Finishes when you restart
settings-updates-firmware-installing = Installing
# Button, verb
settings-updates-firmware-update = Update
settings-updates-firmware-failed = The firmware couldn’t be updated
# Button, verb
settings-updates-download = Download
# $when is a relative time, like 3 days ago
settings-updates-released = Released { $when }
settings-updates-changes = Changes to { $areas }
settings-updates-improvements = Fixes and improvements across the system
# $size is a download size, like 1.2 GB
settings-updates-download-size = { $size } to download
settings-updates-replaces = Replaces version { $version }, which is waiting to install
settings-updates-replaces-new = Replaces a new version, which is waiting to install
settings-updates-returning-description = The version you had before. Your files and settings stay as they are.
# Button; $version is the installed version
settings-updates-stay = Stay on { $version }
settings-updates-stay-unversioned = Stay on this version
settings-updates-restart = Restart
settings-updates-restart-to-install = Restart to install
settings-updates-see-new = See what’s new
# Button
settings-updates-whats-new = What’s new
settings-updates-go-back-title = Go back to the previous version
settings-updates-previous = Version { $version }. Your files and settings stay as they are.
settings-updates-previous-unversioned = Your files and settings stay as they are.
# Button
settings-updates-go-back = Go back
settings-updates-notes-title = What’s new in version { $version }
settings-updates-notes-title-new = What’s new in the new version
settings-updates-variant-nvidia = Use NVIDIA’s driver
settings-updates-variant-standard = Remove NVIDIA’s driver
settings-updates-variant-nvidia-reason = Full speed from your NVIDIA graphics
settings-updates-variant-standard-reason = Smaller, as this computer has no NVIDIA graphics
# Button, verb
settings-updates-switch = Switch
settings-updates-done = Done

## About

settings-about-device-name = Device name
# Button, verb
settings-about-rename = Rename
settings-about-rename-title = Rename this device
settings-about-rename-description = Other devices nearby see this name.
settings-about-cancel = Cancel
settings-about-hardware = Hardware
settings-about-processor = Processor
settings-about-graphics = Graphics
# Shown when there are several graphics adapters
settings-about-graphics-numbered = Graphics { $number }
settings-about-memory = Memory
settings-about-storage = Storage
# $free and $total are sizes, like 120 GB
settings-about-storage-free = { $free } free of { $total }
settings-about-manage-drives = Manage drives
settings-about-mount-internal = Mount internal drives when you sign in
# $size is a size, like 120 GB
settings-about-old-system = Kept when Luft replaced it · { $size }
settings-about-earlier-luft = Left on the drive Luft moved from · { $size }
settings-about-other-system = Remove it to give its { $size } to Luft
# Button, verb
settings-about-remove = Remove
settings-about-software = Software
# The operating system
settings-about-system = System
# $system is Luft's name and $version its version, like "Luft Alizé" and "1.2 Nightly 21"
settings-about-version = { $system } { $version }
# $date is the day the installed version was built, like "27 October"
settings-about-built = Built { $date }
settings-about-desktop = Desktop
settings-about-kernel = Kernel
settings-about-hostname = Hostname
settings-about-problems = Recent problems
settings-about-problem-gpu = The graphics driver stopped responding
# $when is a date and time
settings-about-problem-summary = { $when } · The computer restarted itself
# $when is a date and time
settings-about-problem-graceful = { $when }. Apps were asked to save their work before the computer restarted.
settings-about-problem-forced = { $when }. Some apps didn’t close in time and were stopped before the computer restarted.
settings-about-problem-emergency = { $when }. The computer had to restart without waiting for apps.
settings-about-problem-help = What can help
settings-about-problem-what = What happened
settings-about-problem-log = Luft keeps the full log of that session, in case you report the problem to NVIDIA.
settings-about-problem-firmware = Restart into firmware settings
settings-about-done = Done

## Language & Region

settings-region-language = Language
settings-region-language-description = Kestrel and Luft’s apps use it right away
settings-region-language-next-sign-in = Apps that are already open switch after they restart, the login screen after you sign out
# Choice in the Formats list that follows the chosen language
settings-region-formats-language = Same as the language
settings-region-formats = Formats
settings-region-formats-description = Dates, times, numbers and measurements
settings-region-formats-next-sign-in = { $sample }, from the next sign-in

## Accounts panel

settings-accounts-unavailable = Accounts aren’t available
    .description = The accounts service isn’t installed on this computer
settings-accounts-online = Online accounts
    .description = Each account becomes a folder in Cloud, and files download when you open them.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud or WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Sign in again to keep using it
settings-accounts-paused-metered = Syncing paused on a metered connection
settings-accounts-paused-battery = Syncing paused while the battery is low
settings-accounts-connecting = Connecting
settings-accounts-offline = Offline
settings-accounts-offline-kept = Offline, kept files are still here
settings-accounts-not-connected = Not connected
settings-accounts-syncing = { $count ->
        [one] Syncing { $count } change
       *[other] Syncing { $count } changes
    }
settings-accounts-name = Name
settings-accounts-folder = Folder
settings-accounts-server = Server
settings-accounts-storage = Storage
# $used and $total are sizes, like "2 GB"
settings-accounts-storage-used = { $used } of { $total } used
settings-accounts-on-device = On this device
settings-accounts-kept = { $count ->
        [one] { $count } item kept, the rest downloads when opened
       *[other] { $count } items kept, the rest downloads when opened
    }
settings-accounts-on-demand = Files download when you open them
# Button
settings-accounts-sign-in-again = Sign in again
# Button that cancels removing an account
settings-accounts-keep = Keep
settings-accounts-unsynced-title = Remove anyway?
# $name is the account's name
settings-accounts-unsynced-description = Files kept on this computer may not have reached { $name } yet. Removing the account now deletes them from this computer.
settings-accounts-unsynced-remove = Remove anyway
# Button
settings-accounts-remove = Remove
# Button that confirms removing an account
settings-accounts-remove-confirm = Remove from this computer
settings-accounts-removing = Removing
# $provider is the service's name, like "OneDrive"
settings-accounts-remove-note = Your files stay in { $provider }. Changes made here are sent up first.

## Accounts: providers

settings-accounts-provider-icloud = Your Apple Account, confirmed with a code from your iPhone, iPad or Mac
settings-accounts-provider-onedrive = A personal, work or school Microsoft account, in your browser
settings-accounts-provider-dropbox = A Dropbox account, in your browser
settings-accounts-provider-nextcloud = Your own or your organization’s server
settings-accounts-provider-webdav = Any server that speaks WebDAV

## Accounts: signing in

# Dialog title; $account is the account's name
settings-accounts-sign-in-again-title = Sign in to { $account } again
# $provider is Microsoft or Dropbox
settings-accounts-browser = Your browser opens so you can sign in with { $provider }. Luft never sees your password.
# $user is the account's email address
settings-accounts-password-for = Enter the password for { $user }.
settings-accounts-apple-account = Apple Account
settings-accounts-password = Password
settings-accounts-app-password = App password
settings-accounts-user = User name
settings-accounts-apple-note = Use your Apple Account password; app-specific passwords don’t work here. Apple then shows a code on your iPhone, iPad or Mac.
settings-accounts-nextcloud-browser = Your browser opens so you can sign in to your server and allow Luft in.
settings-accounts-use-app-password = Use an app password instead
settings-accounts-error-server = Enter the server address
settings-accounts-error-apple-account = Enter your Apple Account email
settings-accounts-error-user = Enter the user name
settings-accounts-error-password = Enter the password
# Button
settings-accounts-cancel = Cancel
# Button
settings-accounts-back = Back
# Button
settings-accounts-continue-in-browser = Continue in browser
# Button
settings-accounts-sign-in = Sign in
# Button
settings-accounts-try-again = Try again
# Button
settings-accounts-continue = Continue
# $provider is the service's name, like "iCloud Drive"
settings-accounts-working = Talking to { $provider }
# $provider is the service's name, like "OneDrive"
settings-accounts-finish-in-browser = Finish signing in with { $provider } in your browser. Luft never sees your password, and this updates on its own once you’re done.
settings-accounts-no-browser = No browser opened. Copy the link and open it in a browser.
settings-accounts-open-again = Open the page again
settings-accounts-copy-link = Copy the link
settings-accounts-copied = Copied
settings-accounts-code = Verification code
    .placeholder = 6-digit code
settings-accounts-text-me = Text me a code instead
settings-accounts-choose-phone = Which number should Apple text the code to?
    .description = Send a text message
settings-accounts-approve = Your Apple Account uses Advanced Data Protection. Approve the request on your iPhone, iPad or Mac to let this computer open iCloud Drive.

## Apps

settings-apps-defaults = Default apps
settings-apps-defaults-description = Used when you open links, files, and folders
settings-apps-browser = Web browser
settings-apps-email = Email
settings-apps-calendar = Calendar
settings-apps-music = Music
settings-apps-videos = Videos
settings-apps-photos = Photos
settings-apps-text-editor = Text editor
settings-apps-files = Files
settings-apps-archives = Archives
# Placeholder of the app list when no default app is chosen
settings-apps-choose = Choose
settings-apps-startup = Startup
settings-apps-startup-description = These apps open when you sign in
# Screen-reader label of a switch; $app is an app name
settings-apps-startup-app = Open { $app } when you sign in
settings-apps-startup-remove = Remove { $app } from startup
settings-apps-startup-add = Add app
settings-apps-startup-add-title = Add a startup app
settings-apps-startup-add-description = Choose an app to open every time you sign in.
settings-apps-search = Search apps
settings-apps-no-match = No apps match your search
settings-apps-cancel = Cancel
settings-apps-permissions = Permissions
settings-apps-location = Location
settings-apps-camera = Camera
settings-apps-clipboard = Clipboard in the background
settings-apps-full-access = Full access
settings-apps-full-access-hint = It runs outside its sandbox, with everything a program you start yourself can do. Removing it takes effect the next time it opens.
# Button, verb
settings-apps-full-access-remove = Remove
# Screen reader label of the remove button; $app is an app name
settings-apps-full-access-remove-app = Remove full access from { $app }
settings-apps-passwords = Saved passwords
# Button, verb
settings-apps-passwords-forget = Forget
# Screen reader label of the forget button; $app is an app name
settings-apps-passwords-forget-app = Let { $app } ask again
# $allowed and $total are numbers of apps, or of saved passwords
settings-apps-permissions-allowed = { $allowed } of { $total } allowed
settings-apps-permissions-description = Apps in a sandbox get their own files and only what you allow here.
settings-apps-sandbox-only = Nothing beyond its sandbox
settings-apps-folders = Folders
settings-apps-folders-hint = It can read and change everything in these folders, from the next time it opens.
# $count is a number of folders an app may use
settings-apps-folders-count = { $count ->
    [one] { $count } folder
   *[other] { $count } folders
}
settings-apps-folder-add = Add folder
# Button, verb
settings-apps-folder-remove = Remove
# Screen reader label of the remove button; $folder is a folder path
settings-apps-folder-remove-app = Stop sharing { $folder }
settings-apps-usb = USB devices
settings-apps-usb-hint = Such as security keys, phones and microcontrollers
settings-apps-serial = Serial devices
settings-apps-serial-hint = Such as 3D printers and boards connected over USB
# Shown under a folder an app may only read
settings-apps-folder-read-only = Read only
settings-apps-microphone = Microphone
settings-apps-microphone-hint = It can record sound, from the microphone and from what this computer plays. Applies right away.
settings-apps-camera-hint = It can use the cameras of this computer. Some apps only find them the next time they open.
settings-apps-downloads = Downloads folder
settings-apps-downloads-hint = It can save files to your Downloads folder and open the ones there, from the next time it opens.
settings-apps-internet = Internet
settings-apps-internet-hint = It can go online, from the next time it opens.
settings-apps-x11 = Older way of showing windows (X11)
settings-apps-x11-hint = For apps that don’t open without it. Apps using it can see what you type in other apps that use it too.
# Under the name of a D-Bus service an app may call
settings-apps-service-hint = A service on your desktop it can talk to
# Button, verb
settings-apps-service-remove = Remove
# Screen reader label of the remove button; $service is a D-Bus service name
settings-apps-service-remove-app = Stop letting it talk to { $service }
# $count is a number of desktop services an app may call
settings-apps-services-count = { $count ->
    [one] { $count } service
   *[other] { $count } services
}
settings-apps-full-access-off = It runs in a sandbox. Full access takes the sandbox away.
# Button that opens Schelf to confirm giving the app full access
settings-apps-full-access-give = Give full access
