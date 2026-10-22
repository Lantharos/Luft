# Settings: the Apps, Privacy and Security pages.
#
# Terms used throughout:
# "security chip" is how these pages name the computer's TPM (Trusted Platform Module). Use a plain-language
# phrase for it rather than "TPM", unless "TPM" is what people in your language commonly say.
# "Secure Boot" is the firmware feature's product name and normally stays untranslated.
# "recovery key" is the long code that unlocks an encrypted disk when nothing else can. Use one consistent term.
# "PIN" is a numeric code typed at startup, before the disk unlocks. Keep it as short as the usual term for a bank card PIN.
# "passphrase" is a typed password that unlocks the disk at startup; keep it distinct from the account "password".
# "keyring" is where saved passwords and keys are kept.

## Shared buttons

settings-protection-cancel = Cancel
settings-protection-continue = Continue
settings-protection-close = Close
# Button that restarts the computer
settings-protection-restart = Restart
# Button that removes the item in the row
settings-protection-remove = Remove
# Button that turns a feature on
settings-protection-turn-on = Turn on
# Button that starts setting up a feature
settings-protection-set-up = Set up

## Privacy: screen lock

settings-privacy-screen-lock = Screen lock
settings-privacy-screen-off = Screen turns off
# "Power & Battery" is the name of another Settings page
settings-privacy-screen-off-hint = Set in Power & Battery
# $duration is a length of time, such as "5 minutes"
settings-privacy-screen-off-after = After { $duration }
settings-privacy-screen-off-never = Never
settings-privacy-lock-when-off = Lock the screen when it turns off
settings-privacy-lock-after = Lock after
settings-privacy-lock-after-hint = How long to wait once the screen is off
# Lock delay option: lock as soon as the screen turns off
settings-privacy-lock-immediately = Immediately

## Privacy: location, camera and microphone

settings-privacy-location = Location
settings-privacy-location-services = Location services
settings-privacy-location-services-hint = Lets apps find where you are, for maps, weather and time zones
settings-privacy-camera = Camera
settings-privacy-camera-allow = Allow apps to use the camera
settings-privacy-microphone-allow = Allow apps to use the microphone
# Expandable row listing the apps that asked for location or camera access
settings-privacy-apps-asked = Apps that asked
# $allowed and $total are numbers of apps
settings-privacy-apps-allowed = { $allowed } of { $total } allowed

## Privacy: file history

settings-privacy-file-history = File history
settings-privacy-remember-files = Remember recently used files
settings-privacy-remember-files-hint = Apps can show the files you opened last
settings-privacy-keep-history = Keep history for
# History length option: keep it without a time limit
settings-privacy-keep-forever = Forever
settings-privacy-clear-history = Clear history
settings-privacy-clear-history-hint = Forget every file in the list right now
# Button, verb
settings-privacy-clear = Clear
settings-privacy-clear-title = Clear file history?
settings-privacy-clear-description = Apps will no longer show the files you opened recently. The files stay where they are.

## Privacy: trash and temporary files

settings-privacy-cleanup = Trash and temporary files
settings-privacy-empty-trash = Empty trash automatically
settings-privacy-delete-temp = Delete temporary files automatically
settings-privacy-delete-temp-hint = Your files in temporary folders that nothing has used lately
settings-privacy-delete-after = Delete after
settings-privacy-delete-after-hint = How long files stay before they’re removed

## Security: summary at the top of the page

settings-security-protected = Your device is protected
settings-security-encrypting = Encrypting your device
# $progress is how far encryption got, such as "40% done, about 5 minutes left"
settings-security-encrypting-progress = { $progress }. Keep working while it finishes.
settings-security-decrypting = Turning off device encryption
settings-security-restart-to-encrypt = Restart to start encrypting
settings-security-restart-to-encrypt-description = Encryption starts the next time this computer restarts.
settings-security-encryption-failed = Encryption didn’t start
settings-security-encryption-failed-description = Luft started without it and your files weren’t changed. Turn it on again to try once more.
settings-security-encryption-refused-description = Luft finished changing its size, but encryption couldn’t start afterwards. Your files weren’t changed. Turn it on again to try once more.
settings-security-waiting-to-encrypt = Encryption is waiting
settings-security-waiting-to-encrypt-description = Luft is still changing its size. Once that’s done, encryption starts at the next restart.
settings-security-could-be-safer = Your device could be safer
settings-security-could-be-safer-description = Turn on device encryption to keep your files private.
settings-security-starts-differently-description = If you changed its Secure Boot settings, confirm it so the disk unlocks by itself again.
settings-security-needed-recovery-key = Your disk needed its recovery key
settings-security-needed-recovery-key-description = Link the security chip again so it unlocks by itself.
# "Updates" is the name of another Settings page
settings-security-firmware-ready-description = Firmware updates for your hardware are ready in Updates.
settings-security-encrypted-secure-boot = Your disk is encrypted and Secure Boot checks how it starts.
settings-security-encrypted = Your disk is encrypted.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Only trusted software can start this computer
settings-security-chip = Security chip
settings-security-chip-description = Keeps keys safe and checks how this computer started
settings-firmware-updates-ready = Firmware updates are ready
# "Updates" is the name of another Settings page
settings-firmware-updates-count = { $count ->
    [one] { $count } update for your hardware in Updates
   *[other] { $count } updates for your hardware in Updates
}

## Security: signed startup
# Signed startup means the boot menu and system are signed with a key made for this computer.
# Adding that key happens on a blue firmware screen (MokManager) after a restart.

settings-security-signed-startup = Signed startup
settings-security-signed-startup-on = The boot menu and system are signed for this computer
settings-security-signed-startup-purpose = Only lets software signed for this computer start it
settings-security-signed-startup-restart = Starts being used after you restart
settings-security-signed-startup-missed = The key wasn’t added at the last restart
settings-security-signed-startup-pending = Add the key on the blue screen when you restart
settings-security-signed-startup-missed-often = The key wasn’t added after a few restarts
# Button that shows the steps for adding the key again
settings-security-show-steps = Show steps
settings-security-try-again = Try again

## Security: games with anti-cheat

settings-security-anti-cheat = Games with anti-cheat
settings-security-anti-cheat-ready = Ready for games with anti-cheat
settings-security-anti-cheat-removing = Remove the other keys on the blue screen when you restart
# Epic is the company behind Easy Anti-Cheat; Luft is the operating system
settings-security-anti-cheat-luft-key = Epic still has to add Luft’s key to its list
settings-security-anti-cheat-ready-description = Games can check how this computer started

## Security: steps on the blue startup screen
# The blue screen (MokManager) is always in English. Its option names are passed in as $option, $next and $key
# and shown in bold, so keep each placeable exactly once.

settings-security-key-steps-remove = Remove the keys when you restart
settings-security-key-steps-add = Add the key when you restart
settings-security-key-steps-remove-description = After you restart, a blue screen asks about removing keys. It only waits 10 seconds, so press any key as soon as it appears.
settings-security-key-steps-add-description = After you restart, a blue screen asks about a new key. It only waits 10 seconds, so press any key as soon as it appears.
settings-security-key-step-choose = Choose { $option }, then { $next }.
settings-security-key-step-confirm = Choose { $option }.
settings-security-key-step-code = Type the code below and press { $key }.
settings-security-key-step-reboot = Choose { $option }.
# Name of the Enter key on the keyboard
settings-security-key-enter = Enter
# Screen reader label for the code shown in large digits
settings-security-key-code = Code { $code }
settings-security-key-steps-remove-missed = If you miss it, your computer starts as usual and you can try again here.
settings-security-key-steps-add-missed = If you miss it, your computer starts as usual and the steps show again at the next restart, with a new code.
# Button: close the dialog and restart another time
settings-security-later = Later
settings-security-restart-now = Restart now

## Security: hardware security level
# The level comes from the firmware's Host Security ID (HSI), from 0 up to the highest level this computer supports.

settings-security-hardware = Hardware security
settings-security-hardware-level-0 = Your hardware has few of the protections it could have
settings-security-hardware-level-1 = Your hardware has the basic protections
settings-security-hardware-level-2 = Your hardware has the important protections
settings-security-hardware-level-3 = Your hardware is well protected
settings-security-hardware-level-4 = Your hardware guards itself while it runs
settings-security-hardware-level-5 = Your hardware guards itself and can prove it
# $summary is one of the sentences above
settings-security-hardware-description = { $summary }, level { $level } of { $highest }.
settings-security-hardware-next = For the next level
settings-security-hardware-highest = This is the highest level there is.
# Heading for protections the hardware has but that aren't running
settings-security-hardware-inactive = Not active right now
# Shown above a list of $count protections
settings-security-hardware-fix-maker = { $count ->
    [one] Only the maker of your computer can add this, usually with a firmware update:
   *[other] Only the maker of your computer can add these, usually with a firmware update:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] This can be turned on in your computer’s firmware settings:
   *[other] These can be turned on in your computer’s firmware settings:
}
settings-security-hardware-fix-system = { $count ->
    [one] This depends on how the system is set up:
   *[other] These depend on how the system is set up:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] This isn’t available on this computer:
   *[other] These aren’t available on this computer:
}

## Security: USB protection

settings-usb-hold-back = Hold back new USB devices
settings-usb-hold-back-description = Ones plugged in while locked wait until you unlock

## Device encryption

settings-encryption = Device encryption
settings-encryption-encrypting = Encrypting this device
settings-encryption-decrypting = Turning off device encryption
settings-encryption-starting = Starts the next time you restart
settings-encryption-failed = Didn’t start at the last restart, your files weren’t changed
settings-encryption-waiting = Waits for Luft to finish changing its size, then starts at the next restart
settings-encryption-refused = Couldn’t start after Luft changed its size, your files weren’t changed
settings-encryption-off = Keeps your files private if this computer is lost
# $percent is already formatted, such as "40%"
settings-encryption-progress = { $percent } done
settings-encryption-progress-seconds = { $percent } done, less than a minute left
settings-encryption-progress-minutes = { $minutes ->
    [one] { $percent } done, about { $minutes } minute left
   *[other] { $percent } done, about { $minutes } minutes left
}
settings-encryption-progress-hours = { $hours ->
    [one] { $percent } done, about { $hours } hour left
   *[other] { $percent } done, about { $hours } hours left
}
settings-encryption-unlocks-chip-pin = Unlocks with the security chip and your PIN
settings-encryption-unlocks-chip = Unlocks by itself with the security chip
settings-encryption-unlocks-passphrase = Asks for your passphrase at startup
# A security key is a USB or NFC hardware key, such as a YubiKey
settings-encryption-unlocks-security-key = Unlocks with your security key at startup
settings-encryption-unlocks-recovery-key = Asks for your recovery key at startup

## Device encryption: other drives
# "Disks" is the name of an app

settings-encryption-drives = Other drives
settings-encryption-drives-hint = Encrypt other drives and USB sticks in Disks
settings-encryption-drives-open = Open Disks
# $percent is already formatted, such as "40%"
settings-encryption-drive-encrypting = Encrypting a drive, { $percent } done
settings-encryption-drive-encrypting-paused = Encrypting a drive, paused at { $percent }
settings-encryption-drive-decrypting = Decrypting a drive, { $percent } done
settings-encryption-drive-decrypting-paused = Decrypting a drive, paused at { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } encrypted drive unlocks with this computer
   *[other] { $count } encrypted drives unlock with this computer
}

## Device encryption: turning it on

settings-encryption-turn-on-title = Turn on device encryption
settings-encryption-turn-on-description = Your files stay private if this computer is lost or stolen. Without the right key, nobody can read the disk.
settings-encryption-blocked-title = Device encryption can’t be turned on yet
settings-encryption-blocked-description = Take care of what’s marked below, then try again.
settings-encryption-backup = Before you start, make sure your important files are backed up.
settings-encryption-key-title = Save your recovery key
settings-encryption-key-description = If the disk ever can’t unlock by itself, such as after a repair, this key gets you back in. Keep it somewhere other than this computer.
settings-encryption-unlock-title = Unlocking at startup
settings-encryption-unlock-description = The security chip unlocks the disk by itself at startup, so signing in stays the same.
settings-encryption-passphrase-title = Choose a passphrase
settings-encryption-passphrase-description = This computer can’t unlock the disk by itself, so it asks for this passphrase every time it starts.
settings-encryption-summary-title = Ready to encrypt
settings-encryption-summary-description = Here’s what happens next.
settings-encryption-step-restart = Your computer restarts once.
# The quoted text is the title of the screen shown while the computer starts
settings-encryption-step-screen = While it starts, a short “Encrypting your device” screen appears.
settings-encryption-step-background = The rest happens in the background while you keep working.
settings-encryption-step-plugged-in = Keep the computer plugged in until it’s done.
settings-encryption-ask-pin = Also ask for a PIN
settings-encryption-ask-pin-description = Keeps the disk locked even if someone takes the computer. It’s asked once encryption finishes.
settings-encryption-starting-button = Starting…
settings-encryption-restart-and-encrypt = Restart and encrypt

## Device encryption: turning it off

settings-encryption-turn-off-title = Turn off device encryption?
settings-encryption-turn-off-description = Your files are decrypted in the background while you work. Afterwards, anyone who takes out the disk can read it.
settings-encryption-keep = Keep encryption
settings-encryption-turning-off = Turning off…
# Button, verb
settings-encryption-turn-off = Turn off

## Device encryption: unlocking the disk

settings-encryption-unlocking = Unlocking your disk
settings-encryption-starts-differently = This computer starts differently now
settings-encryption-starts-differently-description = Its Secure Boot settings changed, so the disk asked for its recovery key. If you made the change, confirm it to unlock by itself again
# Button, verb
settings-encryption-confirm = Confirm
settings-encryption-asked-recovery-key = Your disk asked for its recovery key
settings-encryption-relink-description = Link the security chip again so it unlocks by itself
settings-encryption-relink = Link again
settings-encryption-chip-unlock = Unlock with the security chip
settings-encryption-chip-unlock-on = As long as nothing changes how this computer starts
settings-encryption-chip-unlock-off = So you don’t type a passphrase at startup
settings-encryption-pin = PIN at startup
settings-encryption-pin-description = You type it before the disk unlocks
# Button, verb
settings-encryption-change = Change
settings-encryption-add-pin-row = Add a PIN at startup
settings-encryption-add-pin-row-description = Keeps the disk locked even if the computer is taken
settings-encryption-add-pin = Add PIN
settings-encryption-new-key-description = Your disk didn’t have a recovery key yet. Keep this one somewhere other than this computer.
settings-encryption-stop-chip-title = Stop unlocking with the security chip?
settings-encryption-stop-chip-passphrase = Your computer will ask for your passphrase every time it starts.
settings-encryption-stop-chip-recovery-key = Your computer will ask for your recovery key every time it starts, so keep it close.
settings-encryption-stop-chip = Stop unlocking
settings-encryption-remove-pin-title = Remove your PIN?
settings-encryption-remove-pin-description = The disk will unlock by itself again when the computer starts.
settings-encryption-remove-pin = Remove PIN
settings-encryption-unlock-disk-title = Unlock your disk
settings-encryption-unlock-disk-description = This change needs your recovery key, or the passphrase you type when the computer starts.
settings-encryption-unlock-disk-field = Recovery key or passphrase

## Device encryption: security chip and PIN

settings-encryption-chip-setup-description = The security chip in your computer unlocks the disk by itself at startup, so you no longer type a passphrase first.
settings-encryption-add-pin-title = Add a PIN
settings-encryption-add-pin-description = You’ll type it each time the computer starts. Without it, the disk stays locked, even if someone takes the whole computer.
settings-encryption-change-pin-title = Change your PIN
settings-encryption-change-pin-description = You’ll type the new PIN each time the computer starts.
settings-encryption-change-pin = Change PIN
settings-encryption-relink-title = Link the security chip again
settings-encryption-relink-pin-description = Type the PIN you’d like to use at startup.
settings-encryption-ask-pin-step = Adds a step at startup.
settings-encryption-pin-field = PIN
settings-encryption-new-pin-field = New PIN
# Placeholder of the PIN field
settings-encryption-pin-length = { $min } to { $max } digits
settings-encryption-pin-digits-only = Use digits only
settings-encryption-pin-too-short = { $min ->
    [one] Use at least { $min } digit
   *[other] Use at least { $min } digits
}
settings-encryption-pin-too-long = { $max ->
    [one] Use at most { $max } digit
   *[other] Use at most { $max } digits
}
settings-encryption-pins-differ = The PINs don’t match
# Label of the field where the PIN or passphrase is typed a second time
settings-encryption-confirm-field = Confirm
settings-encryption-type-again = Type it again

## Recovery key

settings-recovery-title = Recovery key
settings-recovery-description = Gets you in if the disk can’t unlock by itself
# Button, verb
settings-recovery-show = Show
# Button, verb
settings-recovery-replace = Replace
settings-recovery-replace-title = Replace your recovery key?
settings-recovery-replace-description = Your current key stops working, and you’ll get a new one to save.
settings-recovery-replace-key = Replace key
settings-recovery-shown-title = Your recovery key
settings-recovery-shown-description = Type it if your computer ever asks for a recovery key at startup. Keep a copy somewhere other than this computer.
settings-recovery-fresh-title = Save your new recovery key
settings-recovery-fresh-description = Your previous key no longer works. Keep this one on paper or in a password manager.

## Passwords and keys (the keyring)

settings-passwords-title = Passwords and keys
settings-passwords-not-running = Your keyring isn’t running
settings-passwords-not-running-description = Your passwords and keys show up here once it starts
settings-passwords-locked = Locked
settings-passwords-contents = { $count ->
    [0] Nothing saved yet
    [one] { $count } password or key
   *[other] { $count } passwords and keys
}
settings-passwords-protected-chip = Protected by your password and the security chip
settings-passwords-protected = Protected by your password
# Button, verb
settings-passwords-unlock = Unlock
# Button, verb
settings-passwords-lock = Lock
settings-passwords-seal-title = Seal with the security chip
settings-passwords-seal-description = Copies of them can’t be opened on another computer
# Button, verb
settings-passwords-seal = Seal
settings-passwords-fingerprint-on = Unlocks with your fingerprint
settings-passwords-fingerprint-on-description = Signing in with it unlocks your passwords too
settings-passwords-fingerprint = Unlock with your fingerprint
# "Users" is the name of another Settings page
settings-passwords-fingerprint-description = Add a fingerprint in Users first
settings-passwords-pin = Ask for a PIN after the fingerprint
settings-passwords-pin-locked = Unlock your keyring to change this
settings-passwords-pin-description = So a fingerprint alone can’t unlock them
settings-passwords-lock-with-screen = Lock with the screen
settings-passwords-lock-with-screen-description = They lock and unlock along with the screen
settings-passwords-apps = Apps with access
settings-passwords-apps-locked = Unlock your keyring to see them
settings-passwords-apps-asked = { $count ->
    [0] No apps have asked for them yet
    [one] { $count } app has asked for them
   *[other] { $count } apps have asked for them
}

## Passwords and keys: apps with access

settings-passwords-access-description = Removing one makes the app ask again next time.
settings-passwords-access-not-allowed = Not allowed
settings-passwords-access-none = No apps have asked for your passwords yet
# Screen reader label of a remove button. $app is an app name, $item the name of a saved password
settings-passwords-access-revoke = Stop { $app } from using { $item }
settings-passwords-access-reset = Let { $app } ask for { $item } again
settings-passwords-stores = App sign-ins
settings-passwords-stores-description = Sign-ins some apps keep here, where only that app can read them.
settings-passwords-stores-count = { $count ->
    [one] { $count } saved sign-in
   *[other] { $count } saved sign-ins
}
# Button, verb
settings-passwords-forget = Forget
settings-passwords-forget-title = Forget what { $app } saved?
settings-passwords-forget-description = { $app } loses the sign-ins it kept here, so you may need to sign in to it again.

## Passwords and keys: recent access
# $app is an app name, $item the name of a saved password or key

settings-passwords-history = Recent access
settings-passwords-history-read = { $app } used “{ $item }”
settings-passwords-history-read-unnamed = { $app } used a saved password
settings-passwords-history-saved = { $app } saved “{ $item }”
settings-passwords-history-saved-unnamed = { $app } saved a password
settings-passwords-history-deleted = { $app } deleted “{ $item }”
settings-passwords-history-deleted-unnamed = { $app } deleted a saved password
settings-passwords-history-denied = { $app } wasn’t allowed to use “{ $item }”
settings-passwords-history-denied-unnamed = { $app } wasn’t allowed to use a saved password
settings-passwords-history-signed = { $app } signed with “{ $item }”
settings-passwords-history-signed-unnamed = { $app } signed with a saved password
settings-passwords-history-fewer = Show fewer
settings-passwords-history-all = { $count ->
    [one] Show all { $count }
   *[other] Show all { $count }
}
settings-passwords-history-clear = Clear history
settings-passwords-history-clear-description = Forget which apps used your keyring and when
# Button, verb
settings-passwords-history-clear-button = Clear
settings-passwords-history-clear-title = Clear recent access?
settings-passwords-history-clear-confirm = The list of which apps used your keyring and when is erased. Your saved passwords and keys stay as they are.

## Passwords and keys: SSH keys
# SSH is a protocol name and stays untranslated.

settings-passwords-ssh = SSH keys
settings-passwords-ssh-description = Keys for signing in to servers, kept safe in your keyring.
settings-passwords-ssh-unnamed = Unnamed key
settings-passwords-ssh-in-chip = Kept in the security chip
# $when is a relative time, such as "3 days ago"
settings-passwords-ssh-added = Added { $when }
# Screen reader labels. $name is the name of the key
settings-passwords-ssh-copy = Copy the public key of { $name }
settings-passwords-ssh-remove = Remove { $name }
settings-passwords-ssh-confirm = Ask before each use
settings-passwords-ssh-confirm-label = Ask before each use of { $name }
settings-passwords-ssh-add-row = Add a key
settings-passwords-ssh-use = Use these keys with SSH
settings-passwords-ssh-use-description = Copy the line that points SSH at them
# Screen reader label. $line is a shell command line, such as "SSH_AUTH_SOCK=/run/user/1000/ssh"
settings-passwords-ssh-copy-line = Copy { $line }
settings-passwords-ssh-remove-title = Remove “{ $name }”?
settings-passwords-ssh-remove-chip = It only exists in this computer’s security chip, so it’s gone for good. Servers that only accept this key won’t let you in with it anymore.
settings-passwords-ssh-remove-description = Servers that only accept this key won’t let you in with it anymore. This can’t be undone.
settings-passwords-ssh-add-title = Add an SSH key
settings-passwords-ssh-add-description = A new key is made on this computer. Copy its public key to the servers you want to sign in to.
settings-passwords-ssh-name = Name
settings-passwords-ssh-name-placeholder = For example, work laptop
settings-passwords-ssh-chip = Keep it in the security chip
settings-passwords-ssh-chip-description = It can never be copied off this computer, not even by you
settings-passwords-ssh-chip-unsupported = This computer’s security chip can’t hold SSH keys
settings-passwords-ssh-add = Add key

## Passkeys

settings-passkeys-title = Passkeys
settings-passkeys-unavailable = Unlock your keyring to see your passkeys.
settings-passkeys-chip-fingerprint = Sealed by this computer’s security chip. Each sign-in asks for your fingerprint or password.
settings-passkeys-chip-password = Sealed by this computer’s security chip. Each sign-in asks for your password.
settings-passkeys-password-fingerprint = Encrypted with your password. Each sign-in asks for your fingerprint or password.
settings-passkeys-password = Encrypted with your password. Each sign-in asks for your password.
# $when is a relative time, such as "3 days ago"
settings-passkeys-last-used = Last used { $when }
settings-passkeys-never-used = Never used
settings-passkeys-password-only = Protected by your password
settings-passkeys-unreachable = Browsers can’t reach your passkeys
settings-passkeys-unreachable-description = They’re back once the passkey service is running
# Screen reader labels. $site is a website name
settings-passkeys-rename-label = Rename passkey for { $site }
settings-passkeys-remove-label = Remove passkey for { $site }
settings-passkeys-empty = No passkeys yet
settings-passkeys-empty-description = Ones that sites create are saved here for every browser
settings-passkeys-remove-title = Remove this passkey?
settings-passkeys-remove-description = You won’t be able to sign in to { $site } with it anymore, so make sure you have another way in.
settings-passkeys-rename-title = Rename passkey
settings-passkeys-rename-description = Give your passkey for { $site } a name you’ll recognize.
settings-passkeys-name = Name
settings-passkeys-save = Save

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
settings-apps-startup-add = Add app
settings-apps-startup-add-title = Add a startup app
settings-apps-startup-add-description = Choose an app to open every time you sign in.
settings-apps-search = Search apps
settings-apps-no-match = No apps match your search
settings-apps-cancel = Cancel
