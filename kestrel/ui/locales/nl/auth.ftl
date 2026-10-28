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

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Toegangssleutel maken voor { $site }?
passkeys-register-account-by-app = { $app } wil een toegangssleutel opslaan voor { $account }. Die blijft op deze computer.
passkeys-register-account = Een app wil een toegangssleutel opslaan voor { $account }. Die blijft op deze computer.
passkeys-register-by-app = { $app } wil een toegangssleutel opslaan. Die blijft op deze computer.
passkeys-register = Een app wil een toegangssleutel opslaan. Die blijft op deze computer.
passkeys-sign-in-title = Aanmelden bij { $site } met je toegangssleutel?
passkeys-sign-in-choose-by-app = { $app } vraagt om een toegangssleutel. Kies het account waarmee je je aanmeldt.
passkeys-sign-in-choose = Een app vraagt om een toegangssleutel. Kies het account waarmee je je aanmeldt.
passkeys-sign-in-by-app = { $app } vraagt om je toegangssleutel.
passkeys-sign-in = Een app vraagt om je toegangssleutel.
passkeys-manage-title-by-app = { $app } je toegangssleutels laten beheren?
passkeys-manage-title = Deze app je toegangssleutels laten beheren?
passkeys-manage-description = De app ziet voor welke sites je toegangssleutels hebt en kan ze verwijderen.
passkeys-registered-title = Je hebt al een toegangssleutel voor { $site }
passkeys-registered-description = Meld je aan met de sleutel die je al hebt.
passkeys-choose-title = De toegangssleutels op deze computer gebruiken?
passkeys-choose-by-app = { $app } vraagt waar je toegangssleutel staat.
passkeys-choose = Een app vraagt waar je toegangssleutel staat.
passkeys-use-password = Wachtwoord gebruiken
passkeys-password = Wachtwoord
passkeys-cancel = Annuleren
passkeys-continue = Doorgaan
passkeys-ok = OK
passkeys-use-this-computer = Deze computer gebruiken
passkeys-fingerprint-unavailable = Gebruik je wachtwoord om door te gaan.
passkeys-wrong-password = Dat wachtwoord klopt niet. Probeer het opnieuw.

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
