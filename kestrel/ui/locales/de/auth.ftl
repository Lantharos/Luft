## Sign-in screen, shown before anyone signs in

greeter-session = Sitzung
greeter-accessibility = Barrierefreiheit
greeter-power = Energie
greeter-larger-text = Größerer Text
greeter-screen-reader = Screenreader
greeter-suspend = Standby
greeter-restart = Neu starten
greeter-power-off = Herunterfahren
greeter-another-account = Anderes Konto

## Lock screen

lock-screen-accessibility = Barrierefreiheit
lock-screen-power = Energie
lock-screen-battery = Akku { $level }
lock-screen-screen-reader = Screenreader
lock-screen-zoom = Bildschirmlupe
lock-screen-on-screen-keyboard = Bildschirmtastatur
lock-screen-high-contrast = Hoher Kontrast
lock-screen-dwell-click = Verweilklick
lock-screen-larger-text = Größerer Text
lock-screen-suspend = Standby
lock-screen-restart = Neu starten …
lock-screen-power-off = Herunterfahren …
lock-inhibit-reason = Kestrel muss den Bildschirm sperren

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Im Schlüsselbund speichern
keyring-remember-for-app = Für diese App merken
keyring-fingerprint-allow = Leg zum Zulassen den Finger auf den Fingerabdrucksensor
keyring-fingerprint-alternative = Oder leg den Finger auf den Fingerabdrucksensor
keyring-confirm = Bestätigen
keyring-allow = Zulassen
keyring-deny = Nicht zulassen
keyring-password = Passwort
keyring-mismatch = Die Eingaben stimmen nicht überein
keyring-unlock = Entsperren
keyring-cancel = Abbrechen

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Passkey für { $site } erstellen?
passkeys-register-account-by-app = { $app } möchte einen Passkey für { $account } speichern. Er bleibt auf diesem Computer.
passkeys-register-account = Eine App möchte einen Passkey für { $account } speichern. Er bleibt auf diesem Computer.
passkeys-register-by-app = { $app } möchte einen Passkey speichern. Er bleibt auf diesem Computer.
passkeys-register = Eine App möchte einen Passkey speichern. Er bleibt auf diesem Computer.
passkeys-sign-in-title = Mit deinem Passkey bei { $site } anmelden?
passkeys-sign-in-choose-by-app = { $app } fragt nach einem Passkey. Wähl das Konto, mit dem du dich anmelden möchtest.
passkeys-sign-in-choose = Eine App fragt nach einem Passkey. Wähl das Konto, mit dem du dich anmelden möchtest.
passkeys-sign-in-by-app = { $app } fragt nach deinem Passkey.
passkeys-sign-in = Eine App fragt nach deinem Passkey.
passkeys-manage-title-by-app = { $app } deine Passkeys verwalten lassen?
passkeys-manage-title = Diese App deine Passkeys verwalten lassen?
passkeys-manage-description = Sie sieht dann, für welche Websites du Passkeys hast, und kann sie entfernen.
passkeys-registered-title = Du hast bereits einen Passkey für { $site }
passkeys-registered-description = Melde dich stattdessen mit dem vorhandenen an.
passkeys-choose-title = Passkeys auf diesem Computer verwenden?
passkeys-choose-by-app = { $app } fragt, wo dein Passkey ist.
passkeys-choose = Eine App fragt, wo dein Passkey ist.
passkeys-use-password = Passwort verwenden
passkeys-password = Passwort
passkeys-cancel = Abbrechen
passkeys-continue = Weiter
passkeys-ok = OK
passkeys-use-this-computer = Diesen Computer verwenden
passkeys-fingerprint-unavailable = Gib dein Passwort ein, um fortzufahren.
passkeys-wrong-password = Das Passwort ist falsch. Versuch es noch einmal.

## Sign-in prompt

auth-prompt-password = Passwort
auth-prompt-username = Benutzername
auth-prompt-back = Zurück
auth-prompt-submit = Senden
auth-prompt-wrong-password = Das Passwort hat nicht funktioniert
auth-prompt-failed = Das hat nicht funktioniert. Versuch es noch einmal.
fingerprint-not-recognized = Fingerabdruck nicht erkannt

## Administrator authentication

polkit-title = Authentifizierung erforderlich
polkit-administrator = Administrator
polkit-password = Passwort
polkit-cancel = Abbrechen
polkit-authenticate = Authentifizieren
polkit-failed = Das hat leider nicht funktioniert. Versuch es noch einmal.

## Log out, power off and restart dialog

end-session-log-out-user = { $userName } abmelden
end-session-log-out-title = Abmelden
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } wird in { $seconds } Sekunde automatisch abgemeldet
   *[other] { $userName } wird in { $seconds } Sekunden automatisch abgemeldet
}
end-session-log-out-countdown = { $seconds ->
    [one] Du wirst in { $seconds } Sekunde automatisch abgemeldet
   *[other] Du wirst in { $seconds } Sekunden automatisch abgemeldet
}
end-session-log-out-button = Abmelden
end-session-power-off-title = Herunterfahren
end-session-power-off-updates-title = Updates installieren und herunterfahren
end-session-power-off-countdown = { $seconds ->
    [one] Das System wird in { $seconds } Sekunde automatisch heruntergefahren
   *[other] Das System wird in { $seconds } Sekunden automatisch heruntergefahren
}
end-session-power-off-button = Herunterfahren
end-session-restart-title = Neu starten
end-session-restart-updates-title = Updates installieren und neu starten
end-session-restart-countdown = { $seconds ->
    [one] Das System wird in { $seconds } Sekunde automatisch neu gestartet
   *[other] Das System wird in { $seconds } Sekunden automatisch neu gestartet
}
end-session-restart-button = Neu starten
end-session-update-restart-title = Neu starten und Updates installieren
end-session-update-restart-countdown = { $seconds ->
    [one] Das System wird in { $seconds } Sekunde automatisch neu gestartet und installiert die Updates
   *[other] Das System wird in { $seconds } Sekunden automatisch neu gestartet und installiert die Updates
}
end-session-update-restart-button = Neu starten und installieren
end-session-install-updates = Ausstehende Softwareupdates installieren
end-session-install-version = Version { $version } installieren
end-session-low-battery = Akku fast leer: Schließ den Computer an, bevor du Updates installierst
end-session-busy-apps = Einige Apps sind beschäftigt oder haben ungespeicherte Änderungen
end-session-other-users = Andere Benutzer sind angemeldet
end-session-cancel = Abbrechen
end-session-boot-options = Startoptionen
end-session-remote-user = { $userName } (entfernt)
end-session-console-user = { $userName } (Konsole)

## Lock screen clock

lock-clock-swipe-up = Wisch nach oben
lock-clock-click-or-press = Klick oder drück eine Taste

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Entsperrfenster
