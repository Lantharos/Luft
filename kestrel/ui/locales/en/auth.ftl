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
greeter-suspend = Sleep
greeter-restart = Restart
greeter-power-off = Power off
# Last entry of the account list, for signing in to an account that isn't listed
greeter-another-account = Another account
# Shown on the login screen while it rests, before the sign-in prompt comes up
greeter-wake-hint = Press any key or click to sign in

## Lock screen

# Screen-reader label of the accessibility menu button
lock-screen-accessibility = Accessibility
# Shown on the lock screen while it rests, before the password prompt comes up
lock-screen-wake-hint = Press any key or click to unlock
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
lock-screen-suspend = Sleep
# Power menu item; asks for confirmation before restarting
lock-screen-restart = Restart…
# Power menu item; asks for confirmation before turning the computer off
lock-screen-power-off = Power off…
# Reason given to the system for delaying sleep until the screen is locked, shown by tools that list what delays sleep
lock-inhibit-reason = Kestrel needs to lock the screen
# Shown when USB protection couldn't confirm that the desktop unlocking it is Kestrel itself, so new USB devices keep waiting
usb-protection-refused-title = New USB devices are waiting
usb-protection-refused-body = Luft couldn’t confirm it was your desktop that unlocked. Keyboards and mice still work.
usb-protection-refused-settings = Settings

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
keyring-deny = Don’t allow
# Label of the password field
keyring-password = Password
keyring-mismatch = The entries don’t match
# Button that unlocks the keyring with the typed password
keyring-unlock = Unlock
keyring-cancel = Cancel

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

polkit-title = Password needed
# Shown instead of the user name "root"
polkit-administrator = Administrator
polkit-password = Password
polkit-cancel = Cancel
# Button
polkit-authenticate = Continue
# Shown when the password or other authentication was wrong
polkit-failed = That didn’t work. Try again.

## Sign out, power off and restart dialog

# Dialog title. $userName is the person's full name
end-session-log-out-user = Sign out { $userName }?
# Dialog title
end-session-log-out-title = Sign out?
# $userName is the person's full name
end-session-log-out-user-countdown = { $seconds ->
    [one] In { $seconds } second, open apps close and { $userName } goes back to the login screen.
   *[other] In { $seconds } seconds, open apps close and { $userName } goes back to the login screen.
}
end-session-log-out-countdown = { $seconds ->
    [one] In { $seconds } second, open apps close and you go back to the login screen.
   *[other] In { $seconds } seconds, open apps close and you go back to the login screen.
}
# Button
end-session-log-out-button = Sign out
# Why the screen stays on while the dialog counts down
end-session-awake-reason = Counting down to power off, restart or sign out
# Dialog title
end-session-power-off-title = Turn off the computer?
# Dialog title when updates are installed before powering off
end-session-power-off-updates-title = Install the update and turn off the computer?
end-session-power-off-countdown = { $seconds ->
    [one] In { $seconds } second, open apps close and the computer turns off.
   *[other] In { $seconds } seconds, open apps close and the computer turns off.
}
# Button
end-session-power-off-button = Power off
# Dialog title
end-session-restart-title = Restart the computer?
# Dialog title when updates are installed before restarting
end-session-restart-updates-title = Install the update and restart?
end-session-restart-countdown = { $seconds ->
    [one] In { $seconds } second, open apps close and the computer restarts.
   *[other] In { $seconds } seconds, open apps close and the computer restarts.
}
# Button
end-session-restart-button = Restart
# Dialog title
end-session-update-restart-title = Restart and install the update?
end-session-update-restart-countdown = { $seconds ->
    [one] In { $seconds } second, open apps close and the computer restarts to install the update.
   *[other] In { $seconds } seconds, open apps close and the computer restarts to install the update.
}
# Button
end-session-update-restart-button = Restart and install
# Checkbox
end-session-power-options-title = What should the computer do?
end-session-power-options-description = You pressed the power button.
end-session-suspend-button = Sleep

end-session-install-updates = Install the update that’s ready
# Checkbox. $version is the system version the update installs
end-session-install-version = Install version { $version }
# A nightly build of a version that isn't out yet, like "1.2 Nightly 21": $release is the version it leads to, $number counts the nightly builds toward it
end-session-version-nightly = { $release } Nightly { $number }
end-session-low-battery = The battery is low. Plug in before installing updates.
end-session-busy-apps = Some apps are busy or have unsaved work
end-session-other-users = Other people are signed in
end-session-cancel = Cancel
# Button shown in place of Restart while Alt is held; restarts into the boot menu
end-session-boot-options = Startup options
# A user signed in from another computer, for example over SSH. $userName is their name
end-session-remote-user = { $userName } (remote)
# A user signed in on a text console. $userName is their name
end-session-console-user = { $userName } (console)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

# The lock screen's sign-in prompt
ctrl-alt-tab-unlock = Unlock window
