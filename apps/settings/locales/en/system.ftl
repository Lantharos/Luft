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
# Placeholder of the app list when no default app is chosen
settings-apps-choose = Choose
settings-apps-startup = Startup
settings-apps-startup-description = These apps open when you sign in
# Screen-reader label of a switch; $app is an app name
settings-apps-startup-app = Open { $app } when you sign in
settings-apps-startup-add = Add app
settings-apps-startup-add-title = Add a startup app
settings-apps-startup-add-description = Choose an app to open every time you sign in.
settings-apps-search = Search apps
settings-apps-no-match = No apps match your search
settings-apps-cancel = Cancel

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
settings-datetime-calendar = Calendar
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
settings-users-account-type = Account type
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
settings-users-password-changing = Changing…
settings-users-password-wrong = That isn’t your current password
settings-users-password-mismatch = The passwords don’t match
settings-users-password-too-short = This password is too short
settings-users-password-too-similar = This is too similar to your current password
settings-users-password-dictionary-word = This is based on a dictionary word. Try something less common.
settings-users-password-too-simple = This is too simple. Make it longer or mix in more kinds of characters.
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

settings-updates-checking = Looking for updates…
settings-updates-downloading = Downloading updates…
settings-updates-rolling-back = Getting the earlier version ready…
settings-updates-switching-nvidia = Downloading NVIDIA’s driver…
settings-updates-switching-standard = Downloading the standard image…
# $app is the app that is changing software, like Schelf
settings-updates-elsewhere-refresh-by = { $app } is looking for updates
settings-updates-elsewhere-download-by = Updates are being downloaded by { $app }
settings-updates-elsewhere-update-by = Updates are being installed by { $app }
settings-updates-elsewhere-update = Updates are being installed
settings-updates-elsewhere-install-by = Software is being installed by { $app }
settings-updates-elsewhere-install = Software is being installed
settings-updates-elsewhere-remove-by = Software is being removed by { $app }
settings-updates-elsewhere-remove = Software is being removed
settings-updates-elsewhere-change-by = Software is being changed by { $app }
settings-updates-elsewhere-change = Software is being changed
settings-updates-elsewhere-wait = You can look for updates again when it’s done
settings-updates-ready = Updates are ready to install
settings-updates-available = { $count ->
    [one] { $count } update is available
   *[other] { $count } updates are available
}
settings-updates-up-to-date = Your system is up to date
settings-updates-version = Version { $version }
settings-updates-version-new = A new version
settings-updates-returning = Ready to go back to version { $version }
settings-updates-returning-unversioned = Ready to go back to the earlier version
settings-updates-nvidia-ready = NVIDIA’s driver is ready
settings-updates-standard-ready = The standard image is ready
settings-updates-version-available = Version { $version } is available
settings-updates-version-available-new = A new version is available
settings-updates-version-staged = Version { $version } is ready to install
settings-updates-version-staged-new = A new version is ready to install
settings-updates-restart-install-them = Restart to install them. Your computer is back in a few minutes.
settings-updates-restart-return = Restart to finish going back.
settings-updates-restart-switch = Restart to finish. Your computer is back in a few minutes.
settings-updates-restart-install-it = Restart to install it. Your computer is back in a few minutes.
# $when is a relative time, like 5 minutes ago
settings-updates-last-checked = Last checked { $when }
settings-updates-never-checked = Not checked yet
# $when is a relative time, like yesterday
settings-updates-installed-when = Updates installed { $when }
settings-updates-stop = Stop
settings-updates-check = Check now
settings-updates-checking-button = Checking…
settings-updates-apps = Apps
settings-updates-app-updates = App updates
settings-updates-apps-checking = Looking for updates to your apps…
settings-updates-apps-count = { $count ->
    [0] Managed in Schelf
    [one] { $count } app has an update in Schelf
   *[other] { $count } apps have updates in Schelf
}
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
settings-updates-firmware-installing = Installing…
# Button, verb
settings-updates-firmware-update = Update
settings-updates-firmware-failed = The firmware couldn’t be updated
settings-updates-failed = The last updates couldn’t be installed
settings-updates-failed-description = Your system was left as it was
# $parts says what the updates contain: security fixes, a new Linux kernel and updated drivers, joined by "-"
settings-updates-includes = { $parts ->
    [security] Includes security fixes
    [kernel] Includes a new Linux kernel
    [drivers] Includes updated drivers
    [security-kernel] Includes security fixes and a new Linux kernel
    [security-drivers] Includes security fixes and updated drivers
    [kernel-drivers] Includes a new Linux kernel and updated drivers
    [security-kernel-drivers] Includes security fixes, a new Linux kernel and updated drivers
   *[other] Fixes and improvements across the system
}
# $size is a download size, like 120 MB
settings-updates-count-size = { $count ->
    [one] { $count } update · { $size }
   *[other] { $count } updates · { $size }
}
settings-updates-restart-and-install = Restart and install
# Button, verb
settings-updates-download = Download
settings-updates-see-included = See what’s included
settings-updates-included = What’s included
settings-updates-included-description = { $count ->
    [one] { $count } update for the system, its drivers and its libraries
   *[other] { $count } updates for the system, its drivers and its libraries
}
settings-updates-security-fix = Security fix
settings-updates-done = Done
settings-updates-area-kernel = Linux kernel
settings-updates-area-drivers = Drivers and firmware
settings-updates-area-desktop = Desktop
settings-updates-area-core = Core system
settings-updates-area-other = Libraries and tools
# $when is a relative time, like 3 days ago
settings-updates-released = Released { $when }
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
settings-updates-this-computer = This computer
settings-updates-installed-version = Installed version
settings-updates-unknown = Unknown
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
settings-updates-variant-standard = Switch to the standard image
settings-updates-variant-nvidia-reason = Full speed from your NVIDIA graphics
settings-updates-variant-standard-reason = Smaller, as this computer has no NVIDIA graphics
# Button, verb
settings-updates-switch = Switch

## About

settings-about-device-name = Device name
settings-about-device-name-description = How other devices see this computer
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
# $size is a size, like 120 GB
settings-about-old-system = Kept when Luft replaced it · { $size }
settings-about-other-system = Remove it to give its { $size } to Luft
# Button, verb
settings-about-remove = Remove
settings-about-software = Software
# The operating system
settings-about-system = System
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
# nvidia-bug-report.sh is a command name, keep it as is
settings-about-problem-log = The full kernel log of that session stays in the system journal. Running nvidia-bug-report.sh as an administrator collects it for a driver bug report.
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
