## Sign-in screen, shown before anyone signs in

greeter-session = Sessie
greeter-accessibility = Toegankelijkheid
greeter-power = Energie
greeter-larger-text = Grotere tekst
greeter-screen-reader = Schermlezer
greeter-suspend = Slaapstand
greeter-restart = Opnieuw opstarten
greeter-power-off = Afsluiten
greeter-another-account = Ander account

## Lock screen

lock-screen-accessibility = Toegankelijkheid
lock-screen-power = Energie
lock-screen-battery = Batterij { $level }
lock-screen-screen-reader = Schermlezer
lock-screen-zoom = Zoomen
lock-screen-on-screen-keyboard = Schermtoetsenbord
lock-screen-high-contrast = Hoog contrast
lock-screen-dwell-click = Klikken door stil te houden
lock-screen-larger-text = Grotere tekst
lock-screen-suspend = Slaapstand
lock-screen-restart = Opnieuw opstarten…
lock-screen-power-off = Afsluiten…
lock-inhibit-reason = Kestrel moet het scherm vergrendelen

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Opslaan in je sleutelbos
keyring-remember-for-app = Onthouden voor deze app
keyring-fingerprint-allow = Raak de vingerafdruklezer aan om toe te staan
keyring-fingerprint-alternative = Of raak de vingerafdruklezer aan
keyring-confirm = Bevestigen
keyring-allow = Toestaan
keyring-deny = Niet toestaan
keyring-password = Wachtwoord
keyring-mismatch = De invoer komt niet overeen
keyring-unlock = Ontgrendelen
keyring-cancel = Annuleren

## Sign-in prompt

auth-prompt-password = Wachtwoord
auth-prompt-username = Gebruikersnaam
auth-prompt-back = Terug
auth-prompt-submit = Versturen
auth-prompt-wrong-password = Dat wachtwoord werkte niet
auth-prompt-failed = Dat werkte niet. Probeer het opnieuw.
fingerprint-not-recognized = Vingerafdruk niet herkend
fingerprint-scanning = Raak de vingerafdruklezer aan
fingerprint-retry-scan = Scan je vinger opnieuw
fingerprint-swipe-too-short = Te korte veegbeweging, probeer het opnieuw
fingerprint-finger-not-centered = Leg je vinger in het midden en probeer het opnieuw
fingerprint-remove-and-retry = Til je vinger op en probeer het opnieuw
fingerprint-unavailable = Vingerafdruk is niet beschikbaar, voer je wachtwoord in
auth-prompt-use-password = Wachtwoord gebruiken
auth-prompt-try-fingerprint = Vingerafdruk opnieuw proberen
auth-prompt-use-fingerprint = Vingerafdruk gebruiken
auth-prompt-show-password = Wachtwoord tonen

## Administrator authentication

polkit-title = Verificatie vereist
polkit-administrator = Beheerder
polkit-password = Wachtwoord
polkit-cancel = Annuleren
polkit-authenticate = Verifiëren
polkit-failed = Dat werkte niet. Probeer het opnieuw.

## Log out, power off and restart dialog

end-session-log-out-user = { $userName } afmelden
end-session-log-out-title = Afmelden
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } wordt over { $seconds } seconde automatisch afgemeld
   *[other] { $userName } wordt over { $seconds } seconden automatisch afgemeld
}
end-session-log-out-countdown = { $seconds ->
    [one] Je wordt over { $seconds } seconde automatisch afgemeld
   *[other] Je wordt over { $seconds } seconden automatisch afgemeld
}
end-session-log-out-button = Afmelden
end-session-power-off-title = Afsluiten
end-session-power-off-updates-title = Updates installeren en afsluiten
end-session-power-off-countdown = { $seconds ->
    [one] De computer wordt over { $seconds } seconde automatisch afgesloten
   *[other] De computer wordt over { $seconds } seconden automatisch afgesloten
}
end-session-power-off-button = Afsluiten
end-session-restart-title = Opnieuw opstarten
end-session-restart-updates-title = Updates installeren en opnieuw opstarten
end-session-restart-countdown = { $seconds ->
    [one] De computer wordt over { $seconds } seconde automatisch opnieuw opgestart
   *[other] De computer wordt over { $seconds } seconden automatisch opnieuw opgestart
}
end-session-restart-button = Opnieuw opstarten
end-session-update-restart-title = Opnieuw opstarten en updates installeren
end-session-update-restart-countdown = { $seconds ->
    [one] De computer wordt over { $seconds } seconde automatisch opnieuw opgestart om updates te installeren
   *[other] De computer wordt over { $seconds } seconden automatisch opnieuw opgestart om updates te installeren
}
end-session-update-restart-button = Opnieuw opstarten en installeren
end-session-install-updates = Openstaande software-updates installeren
end-session-install-version = Versie { $version } installeren
end-session-version-nightly = { $release } Nightly { $number }
end-session-low-battery = Batterij bijna leeg: sluit de lader aan voordat je updates installeert
end-session-busy-apps = Sommige apps zijn bezig of hebben niet-opgeslagen werk
end-session-other-users = Er zijn andere gebruikers aangemeld
end-session-cancel = Annuleren
end-session-boot-options = Opstartopties
end-session-remote-user = { $userName } (op afstand)
end-session-console-user = { $userName } (console)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Ontgrendelvenster
