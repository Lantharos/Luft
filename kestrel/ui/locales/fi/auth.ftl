## Sign-in screen, shown before anyone signs in

greeter-session = Istunto
greeter-accessibility = Helppokäyttöisyys
greeter-power = Virta
greeter-larger-text = Suurempi teksti
greeter-screen-reader = Näytönlukuohjelma
greeter-suspend = Lepotila
greeter-restart = Käynnistä uudelleen
greeter-power-off = Sammuta
greeter-another-account = Toinen tili

## Lock screen

lock-screen-accessibility = Helppokäyttöisyys
lock-screen-power = Virta
lock-screen-battery = Akku { $level }
lock-screen-screen-reader = Näytönlukuohjelma
lock-screen-zoom = Suurennus
lock-screen-on-screen-keyboard = Näyttönäppäimistö
lock-screen-high-contrast = Suuri kontrasti
lock-screen-dwell-click = Viivenapsautus
lock-screen-larger-text = Suurempi teksti
lock-screen-suspend = Lepotila
lock-screen-restart = Käynnistä uudelleen…
lock-screen-power-off = Sammuta…
lock-inhibit-reason = Kestrelin täytyy lukita näyttö

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Tallenna avainnippuun
keyring-remember-for-app = Muista tälle sovellukselle
keyring-fingerprint-allow = Salli koskettamalla sormenjälkilukijaa
keyring-fingerprint-alternative = Tai kosketa sormenjälkilukijaa
keyring-confirm = Vahvista
keyring-allow = Salli
keyring-deny = Älä salli
keyring-password = Salasana
keyring-mismatch = Kirjoitetut salasanat eivät täsmää
keyring-unlock = Avaa lukitus
keyring-cancel = Peruuta

## Sign-in prompt

auth-prompt-password = Salasana
auth-prompt-username = Käyttäjänimi
auth-prompt-back = Takaisin
auth-prompt-submit = Lähetä
auth-prompt-wrong-password = Salasana ei kelvannut
auth-prompt-failed = Se ei onnistunut. Yritä uudelleen.
fingerprint-not-recognized = Sormenjälkeä ei tunnistettu
fingerprint-scanning = Kosketa sormenjälkilukijaa
fingerprint-retry-scan = Skannaa sormesi uudelleen
fingerprint-swipe-too-short = Pyyhkäisy oli liian lyhyt, yritä uudelleen
fingerprint-finger-not-centered = Aseta sormi keskelle ja yritä uudelleen
fingerprint-remove-and-retry = Nosta sormi ja yritä uudelleen
fingerprint-unavailable = Sormenjälki ei ole käytettävissä, anna salasana
auth-prompt-use-password = Käytä salasanaa
auth-prompt-try-fingerprint = Yritä sormenjälkeä uudelleen
auth-prompt-use-fingerprint = Käytä sormenjälkeä
auth-prompt-show-password = Näytä salasana

## Administrator authentication

polkit-title = Tunnistautuminen vaaditaan
polkit-administrator = Järjestelmänvalvoja
polkit-password = Salasana
polkit-cancel = Peruuta
polkit-authenticate = Tunnistaudu
polkit-failed = Se ei onnistunut. Yritä uudelleen.

## Log out, power off and restart dialog

end-session-log-out-user = Kirjaa { $userName } ulos
end-session-log-out-title = Kirjaudu ulos
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } kirjataan ulos automaattisesti { $seconds } sekunnin kuluttua
   *[other] { $userName } kirjataan ulos automaattisesti { $seconds } sekunnin kuluttua
}
end-session-log-out-countdown = { $seconds ->
    [one] Sinut kirjataan ulos automaattisesti { $seconds } sekunnin kuluttua
   *[other] Sinut kirjataan ulos automaattisesti { $seconds } sekunnin kuluttua
}
end-session-log-out-button = Kirjaudu ulos
end-session-power-off-title = Sammuta
end-session-power-off-updates-title = Asenna päivitykset ja sammuta
end-session-power-off-countdown = { $seconds ->
    [one] Järjestelmä sammuu automaattisesti { $seconds } sekunnin kuluttua
   *[other] Järjestelmä sammuu automaattisesti { $seconds } sekunnin kuluttua
}
end-session-power-off-button = Sammuta
end-session-restart-title = Käynnistä uudelleen
end-session-restart-updates-title = Asenna päivitykset ja käynnistä uudelleen
end-session-restart-countdown = { $seconds ->
    [one] Järjestelmä käynnistyy uudelleen automaattisesti { $seconds } sekunnin kuluttua
   *[other] Järjestelmä käynnistyy uudelleen automaattisesti { $seconds } sekunnin kuluttua
}
end-session-restart-button = Käynnistä uudelleen
end-session-update-restart-title = Käynnistä uudelleen ja asenna päivitykset
end-session-update-restart-countdown = { $seconds ->
    [one] Järjestelmä käynnistyy uudelleen ja asentaa päivitykset automaattisesti { $seconds } sekunnin kuluttua
   *[other] Järjestelmä käynnistyy uudelleen ja asentaa päivitykset automaattisesti { $seconds } sekunnin kuluttua
}
end-session-update-restart-button = Käynnistä ja asenna
end-session-install-updates = Asenna odottavat päivitykset
end-session-install-version = Asenna versio { $version }
end-session-version-nightly = { $release } yökäännös { $number }
end-session-low-battery = Akun varaus on vähissä: kytke laturi ennen päivitysten asentamista
end-session-busy-apps = Jotkin sovellukset ovat kesken tai niissä on tallentamatonta työtä
end-session-other-users = Muita käyttäjiä on kirjautuneena
end-session-cancel = Peruuta
end-session-boot-options = Käynnistysvalinnat
end-session-remote-user = { $userName } (etä)
end-session-console-user = { $userName } (konsoli)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Lukituksen avaus
