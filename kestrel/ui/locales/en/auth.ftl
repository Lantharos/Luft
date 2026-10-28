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
# Reason given to the system for delaying sleep until the screen is locked, shown by tools that list what delays sleep
lock-inhibit-reason = Kestrel needs to lock the screen

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

## Sign-in prompt

# Placeholder of the password field
auth-prompt-password = Password
# Placeholder of the user name field
auth-prompt-username = Username
# Screen-reader label of the back arrow button
auth-prompt-back = Back
# Screen-reader label of the button that submits the password
auth-prompt-submit = Submit
auth-prompt-wrong-password = That password didn’t work
auth-prompt-failed = That didn’t work. Try again.
fingerprint-not-recognized = Fingerprint not recognized
# Shown while the fingerprint reader waits for a finger
fingerprint-scanning = Touch the fingerprint reader
fingerprint-retry-scan = Scan your finger again
fingerprint-swipe-too-short = Swipe was too short, try again
fingerprint-finger-not-centered = Center your finger and try again
fingerprint-remove-and-retry = Lift your finger and try again
# Shown above the password field when the fingerprint stops working
fingerprint-unavailable = Fingerprint isn’t available, enter your password
# Link button that swaps the fingerprint request for the password field
auth-prompt-use-password = Use password instead
# Link button that starts the fingerprint reader again
auth-prompt-try-fingerprint = Try fingerprint again
# Link button that swaps the password field for the fingerprint
auth-prompt-use-fingerprint = Use fingerprint
# Screen-reader label of the button that shows the typed password
auth-prompt-show-password = Show password

## Administrator authentication

polkit-title = Authentication Required
# Shown instead of the user name "root"
polkit-administrator = Administrator
polkit-password = Password
polkit-cancel = Cancel
# Button
polkit-authenticate = Authenticate
# Shown when the password or other authentication was wrong
polkit-failed = Sorry, that didn’t work. Please try again.

## Log out, power off and restart dialog

# Dialog title. $userName is the person's full name
end-session-log-out-user = Log Out { $userName }
# Dialog title
end-session-log-out-title = Log Out
# $userName is the person's full name
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } will be logged out automatically in { $seconds } second
   *[other] { $userName } will be logged out automatically in { $seconds } seconds
}
end-session-log-out-countdown = { $seconds ->
    [one] You will be logged out automatically in { $seconds } second
   *[other] You will be logged out automatically in { $seconds } seconds
}
# Button
end-session-log-out-button = Log Out
# Dialog title
end-session-power-off-title = Power Off
# Dialog title when updates are installed before powering off
end-session-power-off-updates-title = Install Updates & Power Off
end-session-power-off-countdown = { $seconds ->
    [one] The system will power off automatically in { $seconds } second
   *[other] The system will power off automatically in { $seconds } seconds
}
# Button
end-session-power-off-button = Power Off
# Dialog title
end-session-restart-title = Restart
# Dialog title when updates are installed before restarting
end-session-restart-updates-title = Install Updates & Restart
end-session-restart-countdown = { $seconds ->
    [one] The system will restart automatically in { $seconds } second
   *[other] The system will restart automatically in { $seconds } seconds
}
# Button
end-session-restart-button = Restart
# Dialog title
end-session-update-restart-title = Restart & Install Updates
end-session-update-restart-countdown = { $seconds ->
    [one] The system will automatically restart and install updates in { $seconds } second
   *[other] The system will automatically restart and install updates in { $seconds } seconds
}
# Button
end-session-update-restart-button = Restart & Install
# Checkbox
end-session-install-updates = Install pending software updates
# Checkbox. $version is the system version the update installs
end-session-install-version = Install version { $version }
# A nightly build of a version that isn't out yet, like "1.2 Nightly 21": $release is the version it leads to, $number counts the nightly builds toward it
end-session-version-nightly = { $release } Nightly { $number }
end-session-low-battery = Low battery power: please plug in before installing updates
end-session-busy-apps = Some applications are busy or have unsaved work
end-session-other-users = Other users are logged in
end-session-cancel = Cancel
# Button shown in place of Restart while Alt is held; restarts into the boot menu
end-session-boot-options = Boot Options
# A user signed in from another computer, for example over SSH. $userName is their name
end-session-remote-user = { $userName } (remote)
# A user signed in on a text console. $userName is their name
end-session-console-user = { $userName } (console)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

# The lock screen's sign-in prompt
ctrl-alt-tab-unlock = Unlock Window
