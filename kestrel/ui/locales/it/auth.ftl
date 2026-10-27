## Sign-in screen, shown before anyone signs in

greeter-session = Sessione
greeter-accessibility = Accessibilità
greeter-power = Alimentazione
greeter-larger-text = Testo più grande
greeter-screen-reader = Lettore dello schermo
greeter-suspend = Sospendi
greeter-restart = Riavvia
greeter-power-off = Spegni
greeter-another-account = Altro account

## Lock screen

lock-screen-accessibility = Accessibilità
lock-screen-power = Alimentazione
lock-screen-battery = Batteria { $level }
lock-screen-screen-reader = Lettore dello schermo
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = Tastiera su schermo
lock-screen-high-contrast = Contrasto elevato
lock-screen-dwell-click = Fai clic fermando il puntatore
lock-screen-larger-text = Testo più grande
lock-screen-suspend = Sospendi
lock-screen-restart = Riavvia…
lock-screen-power-off = Spegni…
lock-inhibit-reason = Kestrel deve bloccare lo schermo

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Salva nel Portachiavi
keyring-remember-for-app = Ricorda per questa app
keyring-fingerprint-allow = Tocca il lettore di impronte per consentire
keyring-fingerprint-alternative = Oppure tocca il lettore di impronte
keyring-confirm = Conferma
keyring-allow = Consenti
keyring-deny = Non consentire
keyring-password = Password
keyring-mismatch = Le password non corrispondono
keyring-unlock = Sblocca
keyring-cancel = Annulla

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Creare una passkey per { $site }?
passkeys-register-account-by-app = { $app } vuole salvare una passkey per { $account }. Resta su questo computer.
passkeys-register-account = Un’app vuole salvare una passkey per { $account }. Resta su questo computer.
passkeys-register-by-app = { $app } vuole salvare una passkey. Resta su questo computer.
passkeys-register = Un’app vuole salvare una passkey. Resta su questo computer.
passkeys-sign-in-title = Accedere a { $site } con la tua passkey?
passkeys-sign-in-choose-by-app = { $app } chiede una passkey. Scegli l’account con cui accedere.
passkeys-sign-in-choose = Un’app chiede una passkey. Scegli l’account con cui accedere.
passkeys-sign-in-by-app = { $app } chiede la tua passkey.
passkeys-sign-in = Un’app chiede la tua passkey.
passkeys-manage-title-by-app = Consentire a { $app } di gestire le tue passkey?
passkeys-manage-title = Consentire a questa app di gestire le tue passkey?
passkeys-manage-description = Vedrà per quali siti hai una passkey e potrà rimuoverle.
passkeys-registered-title = Hai già una passkey per { $site }
passkeys-registered-description = Accedi con quella che hai già.
passkeys-choose-title = Usare le passkey di questo computer?
passkeys-choose-by-app = { $app } chiede dove si trova la tua passkey.
passkeys-choose = Un’app chiede dove si trova la tua passkey.
passkeys-use-password = Usa la password
passkeys-password = Password
passkeys-cancel = Annulla
passkeys-continue = Continua
passkeys-ok = OK
passkeys-use-this-computer = Usa questo computer
passkeys-fingerprint-unavailable = Usa la password per continuare.
passkeys-wrong-password = La password non è corretta. Riprova.

## Sign-in prompt

auth-prompt-password = Password
auth-prompt-username = Nome utente
auth-prompt-back = Indietro
auth-prompt-submit = Invia
auth-prompt-wrong-password = Password non corretta
auth-prompt-failed = Non ha funzionato. Riprova.
fingerprint-not-recognized = Impronta non riconosciuta

## Administrator authentication

polkit-title = Autenticazione richiesta
polkit-administrator = Amministratore
polkit-password = Password
polkit-cancel = Annulla
polkit-authenticate = Autentica
polkit-failed = Non ha funzionato. Riprova.

## Log out, power off and restart dialog

end-session-log-out-user = Esci: { $userName }
end-session-log-out-title = Esci
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } uscirà automaticamente tra { $seconds } secondo
   *[other] { $userName } uscirà automaticamente tra { $seconds } secondi
}
end-session-log-out-countdown = { $seconds ->
    [one] Uscirai automaticamente tra { $seconds } secondo
   *[other] Uscirai automaticamente tra { $seconds } secondi
}
end-session-log-out-button = Esci
end-session-power-off-title = Spegni
end-session-power-off-updates-title = Installa aggiornamenti e spegni
end-session-power-off-countdown = { $seconds ->
    [one] Il sistema si spegnerà automaticamente tra { $seconds } secondo
   *[other] Il sistema si spegnerà automaticamente tra { $seconds } secondi
}
end-session-power-off-button = Spegni
end-session-restart-title = Riavvia
end-session-restart-updates-title = Installa aggiornamenti e riavvia
end-session-restart-countdown = { $seconds ->
    [one] Il sistema si riavvierà automaticamente tra { $seconds } secondo
   *[other] Il sistema si riavvierà automaticamente tra { $seconds } secondi
}
end-session-restart-button = Riavvia
end-session-update-restart-title = Riavvia e installa aggiornamenti
end-session-update-restart-countdown = { $seconds ->
    [one] Il sistema si riavvierà e installerà gli aggiornamenti automaticamente tra { $seconds } secondo
   *[other] Il sistema si riavvierà e installerà gli aggiornamenti automaticamente tra { $seconds } secondi
}
end-session-update-restart-button = Riavvia e installa
end-session-install-updates = Installa gli aggiornamenti in sospeso
end-session-install-version = Installa la versione { $version }
end-session-low-battery = Batteria scarica: collega l’alimentatore prima di installare gli aggiornamenti
end-session-busy-apps = Alcune app sono occupate o hanno lavoro non salvato
end-session-other-users = Altri utenti hanno eseguito l’accesso
end-session-cancel = Annulla
end-session-boot-options = Opzioni di avvio
end-session-remote-user = { $userName } (remoto)
end-session-console-user = { $userName } (console)

## Lock screen clock

lock-clock-swipe-up = Scorri verso l’alto
lock-clock-click-or-press = Fai clic o premi un tasto

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Finestra di sblocco
