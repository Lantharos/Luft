## Sign-in screen, shown before anyone signs in

# Screen-reader label of the button that picks the desktop session to start
greeter-session = Session
# Screen-reader label of the accessibility menu button
greeter-accessibility = Accessibility
# Screen-reader label of the power menu button
greeter-power = Power
greeter-larger-text = Larger text
greeter-screen-reader = Screen reader
# Power menu item, puts the computer to sleep
greeter-suspend = Suspend
greeter-restart = Restart
greeter-power-off = Power off
# Last entry of the account list, for signing in to an account that isn't listed
greeter-another-account = Another account

## Lock screen

# Screen-reader label of the accessibility menu button
lock-screen-accessibility = Accessibility
# Screen-reader label of the power menu button
lock-screen-power = Power
# Screen-reader label of the battery status. $level is the charge, already formatted as a percentage
lock-screen-battery = Battery { $level }
lock-screen-screen-reader = Screen reader
# Screen magnifier
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = On-screen keyboard
lock-screen-high-contrast = High contrast
# Clicks when the pointer rests in place for a moment
lock-screen-dwell-click = Dwell click
lock-screen-larger-text = Larger text
# Power menu item, puts the computer to sleep
lock-screen-suspend = Suspend
# Power menu item; asks for confirmation before restarting
lock-screen-restart = Restart…
# Power menu item; asks for confirmation before turning the computer off
lock-screen-power-off = Power off…

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

# Checkbox in a password prompt
keyring-save = Save in your keyring
# Checkbox when an app asks to use a saved secret
keyring-remember-for-app = Remember for this app
keyring-fingerprint-allow = Touch the fingerprint reader to allow
# Shown under the password field when a fingerprint works too
keyring-fingerprint-alternative = Or touch the fingerprint reader
# Label of the field where the password is typed a second time
keyring-confirm = Confirm
# Button
keyring-allow = Allow
# Button
keyring-deny = Don’t Allow
# Label of the password field
keyring-password = Password
keyring-mismatch = The entries don’t match
# Button that unlocks the keyring with the typed password
keyring-unlock = Unlock
keyring-cancel = Cancel

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Create a passkey for { $site }?
passkeys-register-account-by-app = { $app } wants to save a passkey for { $account }. It stays on this computer.
passkeys-register-account = An app wants to save a passkey for { $account }. It stays on this computer.
passkeys-register-by-app = { $app } wants to save a passkey. It stays on this computer.
passkeys-register = An app wants to save a passkey. It stays on this computer.
passkeys-sign-in-title = Sign in to { $site } with your passkey?
passkeys-sign-in-choose-by-app = { $app } is asking for a passkey. Choose the account to sign in with.
passkeys-sign-in-choose = An app is asking for a passkey. Choose the account to sign in with.
passkeys-sign-in-by-app = { $app } is asking for your passkey.
passkeys-sign-in = An app is asking for your passkey.
passkeys-manage-title-by-app = Let { $app } manage your passkeys?
passkeys-manage-title = Let this app manage your passkeys?
passkeys-manage-description = It will see which sites you have passkeys for and can remove them.
passkeys-registered-title = You already have a passkey for { $site }
passkeys-registered-description = Sign in with the one you have instead.
passkeys-choose-title = Use the passkeys on this computer?
passkeys-choose-by-app = { $app } is asking where your passkey is.
passkeys-choose = An app is asking where your passkey is.
# Link button that swaps the fingerprint request for a password field
passkeys-use-password = Use password
# Placeholder of the password field
passkeys-password = Password
passkeys-cancel = Cancel
passkeys-continue = Continue
passkeys-ok = OK
# Button that confirms using the passkeys stored on this computer
passkeys-use-this-computer = Use this computer
passkeys-fingerprint-unavailable = Use your password to continue.
passkeys-wrong-password = That password isn’t right. Try again.
