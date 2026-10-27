## Sign-in screen, shown before anyone signs in

greeter-session = Økt
greeter-accessibility = Tilgjengelighet
greeter-power = Strøm
greeter-larger-text = Større tekst
greeter-screen-reader = Skjermleser
greeter-suspend = Hvilemodus
greeter-restart = Start på nytt
greeter-power-off = Slå av
greeter-another-account = En annen konto

## Lock screen

lock-screen-accessibility = Tilgjengelighet
lock-screen-power = Strøm
lock-screen-battery = Batteri { $level }
lock-screen-screen-reader = Skjermleser
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = Skjermtastatur
lock-screen-high-contrast = Høy kontrast
lock-screen-dwell-click = Hvileklikk
lock-screen-larger-text = Større tekst
lock-screen-suspend = Hvilemodus
lock-screen-restart = Start på nytt…
lock-screen-power-off = Slå av…
lock-inhibit-reason = Kestrel må låse skjermen

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Lagre i nøkkelringen
keyring-remember-for-app = Husk for denne appen
keyring-fingerprint-allow = Berør fingeravtrykkleseren for å tillate
keyring-fingerprint-alternative = Eller berør fingeravtrykkleseren
keyring-confirm = Bekreft
keyring-allow = Tillat
keyring-deny = Ikke tillat
keyring-password = Passord
keyring-mismatch = Oppføringene er ikke like
keyring-unlock = Lås opp
keyring-cancel = Avbryt

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Vil du opprette en tilgangsnøkkel for { $site }?
passkeys-register-account-by-app = { $app } vil lagre en tilgangsnøkkel for { $account }. Den blir på denne datamaskinen.
passkeys-register-account = En app vil lagre en tilgangsnøkkel for { $account }. Den blir på denne datamaskinen.
passkeys-register-by-app = { $app } vil lagre en tilgangsnøkkel. Den blir på denne datamaskinen.
passkeys-register = En app vil lagre en tilgangsnøkkel. Den blir på denne datamaskinen.
passkeys-sign-in-title = Vil du logge inn på { $site } med tilgangsnøkkelen?
passkeys-sign-in-choose-by-app = { $app } ber om en tilgangsnøkkel. Velg kontoen du vil logge inn med.
passkeys-sign-in-choose = En app ber om en tilgangsnøkkel. Velg kontoen du vil logge inn med.
passkeys-sign-in-by-app = { $app } ber om tilgangsnøkkelen din.
passkeys-sign-in = En app ber om tilgangsnøkkelen din.
passkeys-manage-title-by-app = Vil du la { $app } administrere tilgangsnøklene dine?
passkeys-manage-title = Vil du la denne appen administrere tilgangsnøklene dine?
passkeys-manage-description = Den vil se hvilke nettsteder du har tilgangsnøkler for, og kan fjerne dem.
passkeys-registered-title = Du har allerede en tilgangsnøkkel for { $site }
passkeys-registered-description = Logg inn med den du har i stedet.
passkeys-choose-title = Vil du bruke tilgangsnøklene på denne datamaskinen?
passkeys-choose-by-app = { $app } spør hvor tilgangsnøkkelen din er.
passkeys-choose = En app spør hvor tilgangsnøkkelen din er.
passkeys-use-password = Bruk passord
passkeys-password = Passord
passkeys-cancel = Avbryt
passkeys-continue = Fortsett
passkeys-ok = OK
passkeys-use-this-computer = Bruk denne datamaskinen
passkeys-fingerprint-unavailable = Bruk passordet ditt for å fortsette.
passkeys-wrong-password = Feil passord. Prøv igjen.

## Sign-in prompt

auth-prompt-password = Passord
auth-prompt-username = Brukernavn
auth-prompt-back = Tilbake
auth-prompt-submit = Send
auth-prompt-wrong-password = Feil passord
auth-prompt-failed = Det virket ikke. Prøv igjen.
fingerprint-not-recognized = Fingeravtrykket ble ikke gjenkjent

## Administrator authentication

polkit-title = Godkjenning kreves
polkit-administrator = Administrator
polkit-password = Passord
polkit-cancel = Avbryt
polkit-authenticate = Godkjenn
polkit-failed = Det virket ikke. Prøv igjen.

## Log out, power off and restart dialog

end-session-log-out-user = Logg ut { $userName }
end-session-log-out-title = Logg ut
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } logges ut automatisk om { $seconds } sekund
   *[other] { $userName } logges ut automatisk om { $seconds } sekunder
}
end-session-log-out-countdown = { $seconds ->
    [one] Du logges ut automatisk om { $seconds } sekund
   *[other] Du logges ut automatisk om { $seconds } sekunder
}
end-session-log-out-button = Logg ut
end-session-power-off-title = Slå av
end-session-power-off-updates-title = Installer oppdateringer og slå av
end-session-power-off-countdown = { $seconds ->
    [one] Datamaskinen slås av automatisk om { $seconds } sekund
   *[other] Datamaskinen slås av automatisk om { $seconds } sekunder
}
end-session-power-off-button = Slå av
end-session-restart-title = Start på nytt
end-session-restart-updates-title = Installer oppdateringer og start på nytt
end-session-restart-countdown = { $seconds ->
    [one] Datamaskinen starter på nytt automatisk om { $seconds } sekund
   *[other] Datamaskinen starter på nytt automatisk om { $seconds } sekunder
}
end-session-restart-button = Start på nytt
end-session-update-restart-title = Start på nytt og installer oppdateringer
end-session-update-restart-countdown = { $seconds ->
    [one] Datamaskinen starter på nytt og installerer oppdateringer automatisk om { $seconds } sekund
   *[other] Datamaskinen starter på nytt og installerer oppdateringer automatisk om { $seconds } sekunder
}
end-session-update-restart-button = Start på nytt og installer
end-session-install-updates = Installer ventende oppdateringer
end-session-install-version = Installer versjon { $version }
end-session-low-battery = Lavt batterinivå. Koble til strøm før du installerer oppdateringer.
end-session-busy-apps = Noen apper er opptatt eller har ulagret arbeid
end-session-other-users = Andre brukere er logget inn
end-session-cancel = Avbryt
end-session-boot-options = Oppstartsalternativer
end-session-remote-user = { $userName } (eksternt)
end-session-console-user = { $userName } (konsoll)

## Lock screen clock

lock-clock-swipe-up = Sveip opp
lock-clock-click-or-press = Klikk eller trykk på en tast

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Opplåsing
