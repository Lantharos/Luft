## Sign-in screen, shown before anyone signs in

greeter-session = Økt
greeter-accessibility = Tilgjenge
greeter-power = Straum
greeter-larger-text = Større tekst
greeter-screen-reader = Skjermlesar
greeter-suspend = Kvilemodus
greeter-restart = Start på nytt
greeter-power-off = Slå av
greeter-another-account = Ein annan konto

## Lock screen

lock-screen-accessibility = Tilgjenge
lock-screen-power = Straum
lock-screen-battery = Batteri { $level }
lock-screen-screen-reader = Skjermlesar
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = Skjermtastatur
lock-screen-high-contrast = Høg kontrast
lock-screen-dwell-click = Kvileklikk
lock-screen-larger-text = Større tekst
lock-screen-suspend = Kvilemodus
lock-screen-restart = Start på nytt…
lock-screen-power-off = Slå av…
lock-inhibit-reason = Kestrel må låse skjermen

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Lagre i nøkkelringen
keyring-remember-for-app = Hugs for denne appen
keyring-fingerprint-allow = Rør ved fingeravtrykklesaren for å tillate
keyring-fingerprint-alternative = Eller rør ved fingeravtrykklesaren
keyring-confirm = Stadfest
keyring-allow = Tillat
keyring-deny = Ikkje tillat
keyring-password = Passord
keyring-mismatch = Oppføringane er ikkje like
keyring-unlock = Lås opp
keyring-cancel = Avbryt

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Vil du opprette ein tilgangsnøkkel for { $site }?
passkeys-register-account-by-app = { $app } vil lagre ein tilgangsnøkkel for { $account }. Nøkkelen blir verande på denne datamaskinen.
passkeys-register-account = Ein app vil lagre ein tilgangsnøkkel for { $account }. Nøkkelen blir verande på denne datamaskinen.
passkeys-register-by-app = { $app } vil lagre ein tilgangsnøkkel. Nøkkelen blir verande på denne datamaskinen.
passkeys-register = Ein app vil lagre ein tilgangsnøkkel. Nøkkelen blir verande på denne datamaskinen.
passkeys-sign-in-title = Vil du logge inn på { $site } med tilgangsnøkkelen din?
passkeys-sign-in-choose-by-app = { $app } ber om ein tilgangsnøkkel. Vel kontoen du vil logge inn med.
passkeys-sign-in-choose = Ein app ber om ein tilgangsnøkkel. Vel kontoen du vil logge inn med.
passkeys-sign-in-by-app = { $app } ber om tilgangsnøkkelen din.
passkeys-sign-in = Ein app ber om tilgangsnøkkelen din.
passkeys-manage-title-by-app = Vil du la { $app } handtere tilgangsnøklane dine?
passkeys-manage-title = Vil du la denne appen handtere tilgangsnøklane dine?
passkeys-manage-description = Appen får sjå kva nettstader du har tilgangsnøklar for, og kan fjerne dei.
passkeys-registered-title = Du har alt ein tilgangsnøkkel for { $site }
passkeys-registered-description = Logg inn med den du har, i staden.
passkeys-choose-title = Vil du bruke tilgangsnøklane på denne datamaskinen?
passkeys-choose-by-app = { $app } spør kvar tilgangsnøkkelen din er.
passkeys-choose = Ein app spør kvar tilgangsnøkkelen din er.
passkeys-use-password = Bruk passord
passkeys-password = Passord
passkeys-cancel = Avbryt
passkeys-continue = Hald fram
passkeys-ok = OK
passkeys-use-this-computer = Bruk denne datamaskinen
passkeys-fingerprint-unavailable = Bruk passordet ditt for å halde fram.
passkeys-wrong-password = Passordet er feil. Prøv igjen.

## Sign-in prompt

auth-prompt-password = Passord
auth-prompt-username = Brukarnamn
auth-prompt-back = Tilbake
auth-prompt-submit = Send
auth-prompt-wrong-password = Passordet fungerte ikkje
auth-prompt-failed = Det fungerte ikkje. Prøv igjen.
fingerprint-not-recognized = Fingeravtrykket vart ikkje kjent att

## Administrator authentication

polkit-title = Godkjenning krevst
polkit-administrator = Administrator
polkit-password = Passord
polkit-cancel = Avbryt
polkit-authenticate = Godkjenn
polkit-failed = Det fungerte ikkje. Prøv igjen.

## Log out, power off and restart dialog

end-session-log-out-user = Logg ut { $userName }
end-session-log-out-title = Logg ut
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } blir logga ut automatisk om { $seconds } sekund
   *[other] { $userName } blir logga ut automatisk om { $seconds } sekund
}
end-session-log-out-countdown = { $seconds ->
    [one] Du blir logga ut automatisk om { $seconds } sekund
   *[other] Du blir logga ut automatisk om { $seconds } sekund
}
end-session-log-out-button = Logg ut
end-session-power-off-title = Slå av
end-session-power-off-updates-title = Installer oppdateringar og slå av
end-session-power-off-countdown = { $seconds ->
    [one] Systemet blir slått av automatisk om { $seconds } sekund
   *[other] Systemet blir slått av automatisk om { $seconds } sekund
}
end-session-power-off-button = Slå av
end-session-restart-title = Start på nytt
end-session-restart-updates-title = Installer oppdateringar og start på nytt
end-session-restart-countdown = { $seconds ->
    [one] Systemet startar på nytt automatisk om { $seconds } sekund
   *[other] Systemet startar på nytt automatisk om { $seconds } sekund
}
end-session-restart-button = Start på nytt
end-session-update-restart-title = Start på nytt og installer oppdateringar
end-session-update-restart-countdown = { $seconds ->
    [one] Systemet startar automatisk på nytt og installerer oppdateringar om { $seconds } sekund
   *[other] Systemet startar automatisk på nytt og installerer oppdateringar om { $seconds } sekund
}
end-session-update-restart-button = Start på nytt og installer
end-session-install-updates = Installer ventande programvareoppdateringar
end-session-install-version = Installer versjon { $version }
end-session-version-nightly = { $release } nattleg bygg { $number }
end-session-low-battery = Lite straum på batteriet: kople til straum før du installerer oppdateringar
end-session-busy-apps = Nokre appar er opptekne eller har ulagra arbeid
end-session-other-users = Andre brukarar er logga inn
end-session-cancel = Avbryt
end-session-boot-options = Oppstartsval
end-session-remote-user = { $userName } (eksternt)
end-session-console-user = { $userName } (konsoll)

## Lock screen clock

lock-clock-swipe-up = Sveip opp
lock-clock-click-or-press = Klikk eller trykk på ein tast

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Opplåsingsvindauge
