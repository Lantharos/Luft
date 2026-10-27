## Sign-in screen, shown before anyone signs in

greeter-session = Session
greeter-accessibility = Tilgængelighed
greeter-power = Strøm
greeter-larger-text = Større tekst
greeter-screen-reader = Skærmlæser
greeter-suspend = Slumre
greeter-restart = Genstart
greeter-power-off = Sluk
greeter-another-account = En anden konto

## Lock screen

lock-screen-accessibility = Tilgængelighed
lock-screen-power = Strøm
lock-screen-battery = Batteri { $level }
lock-screen-screen-reader = Skærmlæser
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = Skærmtastatur
lock-screen-high-contrast = Høj kontrast
lock-screen-dwell-click = Dvæleklik
lock-screen-larger-text = Større tekst
lock-screen-suspend = Slumre
lock-screen-restart = Genstart…
lock-screen-power-off = Sluk…
lock-inhibit-reason = Kestrel skal låse skærmen

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Gem i din nøglering
keyring-remember-for-app = Husk for denne app
keyring-fingerprint-allow = Rør ved fingeraftrykslæseren for at tillade
keyring-fingerprint-alternative = Eller rør ved fingeraftrykslæseren
keyring-confirm = Bekræft
keyring-allow = Tillad
keyring-deny = Tillad ikke
keyring-password = Adgangskode
keyring-mismatch = Indtastningerne er ikke ens
keyring-unlock = Lås op
keyring-cancel = Annuller

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Vil du oprette en adgangsnøgle til { $site }?
passkeys-register-account-by-app = { $app } vil gemme en adgangsnøgle til { $account }. Den bliver på denne computer.
passkeys-register-account = En app vil gemme en adgangsnøgle til { $account }. Den bliver på denne computer.
passkeys-register-by-app = { $app } vil gemme en adgangsnøgle. Den bliver på denne computer.
passkeys-register = En app vil gemme en adgangsnøgle. Den bliver på denne computer.
passkeys-sign-in-title = Vil du logge ind på { $site } med din adgangsnøgle?
passkeys-sign-in-choose-by-app = { $app } beder om en adgangsnøgle. Vælg den konto, du vil logge ind med.
passkeys-sign-in-choose = En app beder om en adgangsnøgle. Vælg den konto, du vil logge ind med.
passkeys-sign-in-by-app = { $app } beder om din adgangsnøgle.
passkeys-sign-in = En app beder om din adgangsnøgle.
passkeys-manage-title-by-app = Vil du lade { $app } administrere dine adgangsnøgler?
passkeys-manage-title = Vil du lade denne app administrere dine adgangsnøgler?
passkeys-manage-description = Den kan se, hvilke websteder du har adgangsnøgler til, og fjerne dem.
passkeys-registered-title = Du har allerede en adgangsnøgle til { $site }
passkeys-registered-description = Log ind med den, du har, i stedet.
passkeys-choose-title = Vil du bruge adgangsnøglerne på denne computer?
passkeys-choose-by-app = { $app } spørger, hvor din adgangsnøgle er.
passkeys-choose = En app spørger, hvor din adgangsnøgle er.
passkeys-use-password = Brug adgangskode
passkeys-password = Adgangskode
passkeys-cancel = Annuller
passkeys-continue = Fortsæt
passkeys-ok = OK
passkeys-use-this-computer = Brug denne computer
passkeys-fingerprint-unavailable = Brug din adgangskode for at fortsætte.
passkeys-wrong-password = Adgangskoden er forkert. Prøv igen.

## Sign-in prompt

auth-prompt-password = Adgangskode
auth-prompt-username = Brugernavn
auth-prompt-back = Tilbage
auth-prompt-submit = Send
auth-prompt-wrong-password = Adgangskoden virkede ikke
auth-prompt-failed = Det virkede ikke. Prøv igen.
fingerprint-not-recognized = Fingeraftrykket blev ikke genkendt

## Administrator authentication

polkit-title = Godkendelse påkrævet
polkit-administrator = Administrator
polkit-password = Adgangskode
polkit-cancel = Annuller
polkit-authenticate = Godkend
polkit-failed = Det virkede ikke. Prøv igen.

## Log out, power off and restart dialog

end-session-log-out-user = Log { $userName } ud
end-session-log-out-title = Log ud
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } logges automatisk ud om { $seconds } sekund
   *[other] { $userName } logges automatisk ud om { $seconds } sekunder
}
end-session-log-out-countdown = { $seconds ->
    [one] Du logges automatisk ud om { $seconds } sekund
   *[other] Du logges automatisk ud om { $seconds } sekunder
}
end-session-log-out-button = Log ud
end-session-power-off-title = Sluk
end-session-power-off-updates-title = Installer opdateringer og sluk
end-session-power-off-countdown = { $seconds ->
    [one] Computeren slukker automatisk om { $seconds } sekund
   *[other] Computeren slukker automatisk om { $seconds } sekunder
}
end-session-power-off-button = Sluk
end-session-restart-title = Genstart
end-session-restart-updates-title = Installer opdateringer og genstart
end-session-restart-countdown = { $seconds ->
    [one] Computeren genstarter automatisk om { $seconds } sekund
   *[other] Computeren genstarter automatisk om { $seconds } sekunder
}
end-session-restart-button = Genstart
end-session-update-restart-title = Genstart og installer opdateringer
end-session-update-restart-countdown = { $seconds ->
    [one] Computeren genstarter automatisk og installerer opdateringer om { $seconds } sekund
   *[other] Computeren genstarter automatisk og installerer opdateringer om { $seconds } sekunder
}
end-session-update-restart-button = Genstart og installer
end-session-install-updates = Installer ventende softwareopdateringer
end-session-install-version = Installer version { $version }
end-session-version-nightly = { $release } natlig build { $number }
end-session-low-battery = Lavt batteriniveau: Tilslut strøm, før du installerer opdateringer
end-session-busy-apps = Nogle apps er optaget eller har arbejde, der ikke er gemt
end-session-other-users = Andre brugere er logget ind
end-session-cancel = Annuller
end-session-boot-options = Opstartsindstillinger
end-session-remote-user = { $userName } (ekstern)
end-session-console-user = { $userName } (konsol)

## Lock screen clock

lock-clock-swipe-up = Stryg opad
lock-clock-click-or-press = Klik, eller tryk på en tast

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Oplåsning
