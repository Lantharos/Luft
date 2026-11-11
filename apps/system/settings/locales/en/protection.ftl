# Settings: the Apps, Privacy and Security pages.
#
# Terms used throughout:
# "security chip" is how these pages name the computer's TPM (Trusted Platform Module). Use a plain-language
# phrase for it rather than "TPM", unless "TPM" is what people in your language commonly say.
# "Secure Boot" is the firmware feature's product name and normally stays untranslated.
# "recovery key" is the long code that unlocks an encrypted drive when nothing else can. Use one consistent term.
# "PIN" is a numeric code typed at startup, before the drive unlocks. Keep it as short as the usual term for a bank card PIN.
# "passphrase" is a typed password that unlocks the drive at startup; keep it distinct from the account "password".
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
# $page is the name of the Settings page with the power options
settings-privacy-screen-off-hint = Set in { $page }
# $duration is a length of time, such as "5 minutes"
settings-privacy-screen-off-after = After { $duration }
settings-privacy-screen-off-never = Never
settings-privacy-lock-when-off = Lock the screen when it turns off
settings-privacy-lock-after = Lock after
settings-privacy-lock-after-hint = How long to wait once the screen is off
settings-notifications-show-lock-screen = Show notifications on the lock screen
settings-notifications-content = Show message content
settings-notifications-content-description = When off, only the app name is shown
settings-notifications-content-lock-screen = Show message content on the lock screen
# Lock delay option: lock as soon as the screen turns off
settings-privacy-lock-immediately = Immediately

## Privacy: location, camera and microphone

settings-privacy-app-access = App access
settings-privacy-location-services = Location services
settings-privacy-location-services-hint = Lets apps find where you are, for maps, weather and time zones
settings-privacy-camera-allow = Allow apps to use the camera
settings-privacy-microphone-allow = Allow apps to use the microphone

## Privacy: things looked up online

settings-privacy-online = Online
settings-privacy-lookups = Weather and currency rates
settings-privacy-lookups-hint = Looked up through luft.computer, which is only told roughly which area you’re in, never your exact place
settings-crash-reports = Crash reports
settings-crash-reports-description = When one of Luft’s own programs closes unexpectedly, a report can help fix it. Apps you installed yourself are never reported.
settings-crash-reports-unavailable = This version of Luft doesn’t send crash reports, so nothing leaves your computer.
settings-crash-reports-send = Send reports
settings-crash-reports-ask = Ask each time
settings-crash-reports-always = Send without asking
settings-crash-reports-never = Never send
settings-crash-reports-contents = What’s in a report
settings-crash-reports-contents-hint = Each time you’re asked, you can also see the exact report
settings-crash-reports-show = Show
settings-crash-reports-contents-description = A report holds only what’s needed to find the problem.
settings-crash-reports-holds-program = Which program closed and the version of Luft you have
settings-crash-reports-holds-failure = How it closed, such as the error it ran into
settings-crash-reports-holds-stack = Where in the program’s code it was, by position in its files
settings-crash-reports-holds-system = Who made your graphics card, and whether NVIDIA’s driver runs it
settings-crash-reports-holds-install = A random number for this computer, so the same problem is counted once per computer
settings-crash-reports-never-holds = It never holds your files, what was on the screen, the program’s memory, your name, your computer’s name or anything else that says who you are. Paths in your home folder are taken out.
settings-crash-reports-close = Close
settings-crash-reports-install = Random number for this computer
settings-crash-reports-install-hint = Made when the first report is sent
settings-crash-reports-reset = Reset
settings-crash-reports-reset-title = Reset the random number?
settings-crash-reports-reset-description = The next report sent gets a new one, so it can’t be linked to reports sent before.

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
settings-privacy-delete-screenshots = Delete screenshots automatically
settings-privacy-delete-screenshots-hint = Old screenshots go to the trash first, so you can still get them back
settings-privacy-delete-after = Delete after
settings-privacy-delete-after-hint = How long files stay before they’re removed

## Security: summary at the top of the page

settings-security-protections = Protections
settings-security-protected = Your device is protected
settings-security-could-be-safer = Your device could be safer
settings-security-not-encrypted-description = Its drive isn’t encrypted, so anyone who takes it out can read your files.
settings-security-starts-differently-description = If you changed its Secure Boot settings, confirm it so the drive unlocks by itself again.
settings-security-needed-recovery-key = Your drive needed its recovery key
settings-security-needed-recovery-key-description = Link the security chip again so it unlocks by itself.
# "Updates" is the name of another Settings page
settings-security-firmware-ready-description = Firmware updates for your hardware are ready in Updates.
settings-security-encrypted-secure-boot = Your drive is encrypted and Secure Boot checks how it starts.
settings-security-encrypted = Your drive is encrypted.
settings-security-secure-boot-unfinished = Secure Boot isn’t set up for Luft yet

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
settings-security-signed-startup-finish = Finish setting up Secure Boot on the blue screen when you restart
settings-security-signed-startup-retry = The blue screen was missed. It shows again when you restart
settings-security-signed-startup-gave-up = Secure Boot wasn’t set up after a few restarts
settings-security-try-again = Try again

## Security: games with anti-cheat

settings-security-anti-cheat = Games with anti-cheat
settings-security-anti-cheat-ready = Ready for games with anti-cheat
settings-security-anti-cheat-removing = Remove the other keys on the blue screen when you restart
# Epic is the company behind Easy Anti-Cheat; Luft is the operating system
settings-security-anti-cheat-luft-key = Epic still has to add Luft’s key to its list
settings-security-anti-cheat-ready-description = Games can check how this computer started

## Security: setting up Secure Boot for Luft
# Setting up Secure Boot means adding Luft's signing key to the computer on a blue firmware screen (shim's MokManager)
# after a restart, with an eight-digit code. Don't call it a "key" here, so it isn't confused with the recovery key.

settings-secure-boot-not-set-up = Not set up for Luft yet
settings-secure-boot-off = Secure Boot is off
settings-secure-boot-off-description = It can be turned on in your computer’s firmware settings
settings-secure-boot-ready = Set up for Luft
settings-secure-boot-pending-title = Finish setting up Secure Boot
settings-secure-boot-pending-description = Restart, then follow the steps below on the blue screen that appears
settings-secure-boot-missed-description = The blue screen was missed last time. Restart and try again with the same code
settings-secure-boot-none-title = Set up Secure Boot for Luft
settings-secure-boot-none-description = It takes one restart and a code you type on a blue screen
settings-secure-boot-gave-up-description = It wasn’t finished after a few restarts. Try again whenever you’re ready
settings-secure-boot-without-key = Until it’s set up, Luft starts without its boot menu, and the drive may ask for its recovery key after updates.
settings-secure-boot-without-key-unencrypted = Until it’s set up, Luft starts without its boot menu.
settings-secure-boot-steps = On the blue screen
settings-secure-boot-steps-description = The blue screen is always in English. Use the arrow keys and Enter there.
settings-secure-boot-code-hidden = You need the code on the blue screen.
# Button that shows the eight-digit code for the blue screen
settings-secure-boot-show-code = Show code
settings-secure-boot-code-hint = Type all eight digits, without a space.
settings-secure-boot-missed-note = If you miss it, Luft still starts, though the drive may ask for its recovery key once. The code stays the same, so you can try again.

## Security: steps on the blue startup screen
# The blue screen (MokManager) is always in English. Its words are passed in as $screen, $option, $question, $yes,
# $no, $prompt, $error and $ok and shown in bold, so keep each placeable exactly once.

# $screen is the sentence the blue screen shows while it waits for a key press
settings-secure-boot-step-press = When the blue screen says { $screen }, press any key. It waits a minute.
settings-secure-boot-step-choose = Choose { $option }.
settings-secure-boot-step-confirm = At { $question }, choose { $yes }. { $no } is selected first.
# $key is the name of the Enter key
settings-secure-boot-step-password = At { $prompt }, type the code and press { $key }. Nothing shows while you type.
settings-secure-boot-wrong-code = If it says { $error }, choose { $ok } and type the code again.
settings-security-key-steps-remove = Remove the keys when you restart
settings-security-key-steps-remove-description = After you restart, a blue screen asks about removing keys.
# Name of the Enter key on the keyboard
settings-security-key-enter = Enter
# Screen reader label for the code shown in large digits
settings-security-key-code = Code { $code }
settings-security-key-steps-remove-missed = If you miss it, your computer starts as usual and you can try again here.
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
settings-encryption-not-encrypted = Off
settings-encryption-not-encrypted-reinstall = Off, and this computer can only be encrypted by installing Luft again
# Button that opens the steps to encrypt this computer
settings-encryption-turn-on = Turn on
settings-encryption-after-restart = Starts encrypting when you restart
settings-encryption-encrypting = Encrypting, { $percent } done
settings-encryption-encrypting-paused = Encrypting, paused at { $percent } until the computer is plugged in
# Button that takes back the request to encrypt before the computer restarts
settings-encryption-dont-encrypt = Don’t encrypt
settings-encryption-turn-on-title = Encrypt this computer
settings-encryption-turn-on-blocked = This computer can’t be encrypted right now
settings-encryption-turn-on-description = Your files stay where they are.
settings-encryption-check-in-place = Luft can encrypt its partition where it is.
settings-encryption-check-not-in-place = Luft’s partition can’t be encrypted where it is. Install Luft again to encrypt it.
settings-encryption-check-plugged-in = The computer is plugged in.
settings-encryption-check-on-battery = Plug the computer in. Encrypting takes a while and shouldn’t run out of power partway.
settings-encryption-save-key-title = Save the recovery key
settings-encryption-save-key-description = Keep it somewhere other than this computer.
settings-encryption-unlock-title = How it unlocks
settings-encryption-unlock-chip = The security chip unlocks it by itself when the computer starts, as long as nothing changes how it starts.
settings-encryption-unlock-passphrase = Choose a passphrase to type each time the computer starts.
settings-encryption-ready-title = Ready to encrypt
settings-encryption-summary-room = Luft makes room on its partition now, and starts encrypting when you restart.
settings-encryption-summary-background = It then encrypts in the background while you use the computer. Keep it plugged in. An interruption only pauses it.
settings-encryption-summary-chip = Until it’s done, the security chip keeps the recovery key, so restarting doesn’t ask for anything.
settings-encryption-summary-recovery-key = Until it’s done, it asks for the recovery key at startup instead of your passphrase.
# Button, verb: starts encrypting this computer
settings-encryption-encrypt = Encrypt
settings-encryption-making-room = Making room
settings-encryption-unlocks-chip-pin = Unlocks with the security chip and your PIN
settings-encryption-unlocks-chip = Unlocks by itself with the security chip
settings-encryption-unlocks-without-secure-boot = May ask for its recovery key until Secure Boot is set up
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

## Device encryption: unlocking the drive

settings-encryption-unlocking = Unlocking your drive
settings-encryption-starts-differently = This computer starts differently now
settings-encryption-starts-differently-description = Its Secure Boot settings changed, so the drive asked for its recovery key. If you made the change, confirm it to unlock by itself again
# Button, verb
settings-encryption-confirm = Confirm
settings-encryption-asked-recovery-key = Your drive asked for its recovery key
settings-encryption-relink-description = Link the security chip again so it unlocks by itself
settings-encryption-relink = Link again
settings-encryption-chip-unlock = Unlock with the security chip
settings-encryption-chip-unlock-on = As long as nothing changes how this computer starts
settings-encryption-chip-unlock-off = So you don’t type a passphrase at startup
settings-encryption-pin = PIN at startup
settings-encryption-pin-description = You type it before the drive unlocks
# Button, verb
settings-encryption-change = Change
settings-encryption-add-pin-row = Add a PIN at startup
settings-encryption-add-pin-row-description = Keeps the drive locked even if the computer is taken
settings-encryption-add-pin = Add PIN
settings-encryption-new-key-description = Your drive didn’t have a recovery key yet. Keep this one somewhere other than this computer.
settings-encryption-stop-chip-title = Stop unlocking with the security chip?
settings-encryption-stop-chip-passphrase = Your computer will ask for your passphrase every time it starts.
settings-encryption-stop-chip-recovery-key = Your computer will ask for your recovery key every time it starts, so keep it close.
settings-encryption-stop-chip = Stop unlocking
settings-encryption-remove-pin-title = Remove your PIN?
settings-encryption-remove-pin-description = The drive will unlock by itself again when the computer starts.
settings-encryption-remove-pin = Remove PIN
settings-encryption-unlock-disk-title = Unlock your drive
settings-encryption-unlock-disk-description = This change needs your recovery key, or the passphrase you type when the computer starts.
settings-encryption-unlock-disk-field = Recovery key or passphrase

## Device encryption: security chip and PIN

settings-encryption-ask-pin = Also ask for a PIN
settings-encryption-chip-setup-description = The security chip in your computer unlocks the drive by itself at startup, so you no longer type a passphrase first.
settings-encryption-add-pin-title = Add a PIN
settings-encryption-add-pin-description = You’ll type it each time the computer starts. Without it, the drive stays locked, even if someone takes the whole computer.
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
settings-recovery-description = Gets you in if the drive can’t unlock by itself
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
settings-passwords-not-running = Your saved passwords and keys aren’t available right now
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
settings-passwords-pin-locked = Unlock your passwords and keys to change this
settings-passwords-pin-description = So a fingerprint alone can’t unlock them
settings-passwords-lock-with-screen = Lock with the screen
settings-passwords-lock-with-screen-description = They lock and unlock along with the screen
settings-passwords-apps = App sign-ins and activity
settings-passwords-apps-locked = Unlock your passwords and keys to see them
settings-passwords-apps-description = What apps keep here and when they used it
settings-passwords-apps-allowed = Which apps can use your passwords
# "Apps" is the name of another Settings page
settings-passwords-apps-allowed-hint = Set in Apps

## Passwords and keys: apps with access

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
settings-passwords-history-clear = Clear history
settings-passwords-history-clear-description = Forget which apps used your passwords and keys, and when
# Button, verb
settings-passwords-history-clear-button = Clear
settings-passwords-history-clear-title = Clear recent access?
settings-passwords-history-clear-confirm = The list of which apps used your passwords and keys, and when, is erased. Your saved passwords and keys stay as they are.

## Passwords and keys: SSH keys
# SSH is a protocol name and stays untranslated.

settings-passwords-ssh = SSH keys
settings-passwords-ssh-description = Keys for signing in to servers, kept safe with your passwords.
settings-passwords-ssh-unnamed = Unnamed key
settings-passwords-ssh-in-chip = Kept in the security chip
# A key that is saved but not offered to programs until it is loaded again
settings-passwords-ssh-put-away = Put away
# Button: makes a put-away key usable again
settings-passwords-ssh-load = Load
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

## Remote login: signing in to this computer from another device over SSH

settings-remote-login = Remote login
    .description = Sign in to this computer from another device with SSH, to use its terminal and files from there.
settings-remote-login-off = Off
settings-remote-login-on-home = On for devices on home networks
settings-remote-login-on-everywhere = On for devices on every network
settings-remote-login-turn-on-title = Turn on remote login?
settings-remote-login-turn-on-description = Anyone with a key you add can then control this computer from another device, as you: open your files, run programs and change what you can change. At first only your account can sign in, and only with a key. Turning it on needs an administrator.
settings-remote-login-connect = Connect
    .description = From a terminal on a device on the same network:
# { $text } is a command such as ssh anna@laptop.local
settings-remote-login-copy = Copy { $text }
settings-remote-login-addresses = Addresses
settings-remote-login-host-keys = This computer’s keys
settings-remote-login-host-keys-description = Check them the first time a device connects
settings-remote-login-host-keys-explained = The first time a device connects, SSH shows a fingerprint and asks whether to trust it. It should be one of these. If it isn’t, something between the two devices is pretending to be this computer, so don’t go on.
settings-remote-login-keys = Keys that can sign in
    .description = Each device signs in as { $account } with a key of its own. Add the public key, the .pub file, of every device you’ll connect from.
settings-remote-login-key-unnamed = Key without a name
# { $kind } is the kind of key, such as Ed25519
settings-remote-login-kind-security-key = { $kind } on a security key
settings-remote-login-key-remove = Remove { $name }
settings-remote-login-key-remove-title = Remove “{ $name }”?
settings-remote-login-key-remove-description = The device with this key can’t sign in anymore. Anyone signed in with it stays connected until they disconnect.
settings-remote-login-key-add = Add a key
settings-remote-login-key-add-title = Add a key
settings-remote-login-key-add-description = Paste the public key of the device that will connect, or choose its .pub file. A device without one can make it with ssh-keygen.
settings-remote-login-key = Public key
settings-remote-login-key-choose = Choose a file…
settings-remote-login-key-add-button = Add key
settings-remote-login-accounts = Accounts
    .description = Accounts that can sign in over SSH. Each one signs in with its own keys, added while signed in to it.
settings-remote-login-account-label = Let { $account } sign in over SSH
settings-remote-login-safety = Who can connect
settings-remote-login-passwords = Allow passwords
settings-remote-login-passwords-description = Keys are much harder to guess or steal than passwords
settings-remote-login-passwords-title = Allow signing in with a password?
settings-remote-login-passwords-warning = Anyone who knows or guesses the password of an account above can then sign in from another device. Luft slows down repeated guesses, but a key can’t be guessed at all. Only allow this for a device that can’t use a key.
settings-remote-login-passwords-allow = Allow passwords
settings-remote-login-public = Also on public networks
settings-remote-login-public-description = Otherwise only devices on home networks can connect
settings-remote-login-public-title = Allow connections on public networks?
settings-remote-login-public-warning = Devices on public networks, like in a café, hotel or airport, can then see that this computer takes SSH connections and try to sign in. Only the keys you added get in.
settings-remote-login-public-allow = Allow
settings-remote-login-sessions = Signed in now
# { $address } is the address of the other device, such as 192.168.1.20
settings-remote-login-session = { $account } from { $address }
# { $when } is a time such as "5 minutes ago"
settings-remote-login-session-since = Signed in { $when }
settings-remote-login-disconnect = Disconnect
settings-remote-login-disconnect-title = Disconnect { $account } at { $address }?
settings-remote-login-disconnect-description = Their connection ends right away, along with anything running in it. They can sign in again with their key.

## Passkeys

settings-passkeys-title = Passkeys
settings-passkeys-unavailable = Unlock your passwords and keys to see your passkeys.
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

## Screen and input sharing

settings-sharing = Screen and input sharing
settings-sharing-description = Apps that may see your screen or use your mouse and keyboard
settings-sharing-apps = Apps with access
settings-sharing-empty = No app may see your screen or use your mouse and keyboard. Apps ask the first time they need to.
settings-sharing-can-screen = Can see your screen
settings-sharing-can-control = Can see your screen and use your mouse and keyboard
settings-sharing-can-input = Can use your mouse and keyboard
settings-sharing-can-windows-see = Can see your open windows
settings-sharing-can-windows-use = Can see and move your open windows
settings-sharing-active = Sharing right now
# $when is a relative time, like "2 days ago"
settings-sharing-allowed-since = Allowed { $when }
settings-sharing-unknown-app = An app without a name
# Shown for access held by Luft's developer tools
settings-sharing-developer-tools = Developer tools
# Button, verb
settings-sharing-revoke = Stop access
# $app is the app's name
settings-sharing-revoke-title = Stop access for { $app }?
settings-sharing-revoke-description = It has to ask again before it can do this.
settings-sharing-revoke-active = It stops sharing right away, and has to ask again before it can do this.

## Developer tools

settings-developer-tools = Developer tools
settings-developer-tools-description = Lets developer tools control apps and the screen, and opens text consoles
settings-developer-tools-title = Turn on developer tools?
settings-developer-tools-warning = Programs you run can then see your screen and use your mouse and keyboard without asking. Text consoles open too, on Ctrl+Alt+F3 and the keys next to it, where anyone at the computer can sign in with an account’s password without going through the login screen. Leave this off unless you build apps for Luft. Turning it on asks for an administrator’s password.

## Checking the recovery key

settings-recovery-check-row = Check that your recovery key works
settings-recovery-check-row-description = Type the copy you kept to make sure it still unlocks this computer
# Button, verb
settings-recovery-check = Check
settings-recovery-check-title = Check your recovery key
settings-recovery-check-description = Type the recovery key from the copy you kept. Nothing changes on this computer.
settings-recovery-check-description-stored = Type the recovery key from the copy you kept, or leave the field empty to check the copy this computer keeps. Nothing changes on this computer.
settings-recovery-check-field = Recovery key
settings-recovery-check-works = This key unlocks your drive. Keep it where you found it.
settings-recovery-check-fails = This key doesn’t unlock your drive. Check for typing mistakes, or replace it with a new key and save that one.

## Turning protections off

settings-usb-turn-off-title = Stop holding back USB devices?
settings-usb-turn-off-warning = Anything plugged in while your computer is locked, such as a device that pretends to be a keyboard, then works right away.
settings-usb-turn-off = Stop holding back
settings-security-secure-boot-off-description = Your drive is encrypted, but Secure Boot is off, so nothing checks what starts before Luft. Turn it on in your computer’s firmware settings.

## Unlocking by itself while Secure Boot is off

settings-encryption-chip-needs-secure-boot = Turn on Secure Boot in your computer’s firmware settings to let this computer unlock by itself
