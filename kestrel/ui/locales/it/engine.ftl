## Quick settings tiles

auto-rotate-title = Rotazione automatica
dark-style-title = Modalità scura
do-not-disturb-title = Non disturbare
night-light-title = Luce notturna
airplane-mode-title = Modalità aereo

## Power mode

power-profile-title = Modalità energia
power-profile-header = Modalità energia
power-profile-open-menu = Apri il menu della modalità energia
power-profile-settings = Impostazioni alimentazione
power-profile-performance = Prestazioni
power-profile-balanced = Bilanciata
power-profile-power-saver = Risparmio energia
power-profile-custom = Personalizzata

## Keep awake

caffeine-title = Mantieni attivo
caffeine-open-menu = Apri il menu Mantieni attivo
caffeine-until = Fino alle { $time }
caffeine-until-turned-off = Finché non lo disattivi
caffeine-30-minutes = 30 minuti
caffeine-1-hour = 1 ora
caffeine-2-hours = 2 ore
caffeine-inhibit-reason = Mantenuto attivo dalle impostazioni rapide

## Brightness

brightness-title = Luminosità
brightness-open-menu = Apri il menu della luminosità

## Keyboard backlight

backlight-title = Retroilluminazione tastiera
backlight-open-menu = Apri il menu della luminosità della tastiera
backlight-slider = Luminosità tastiera
backlight-off = Spenta
backlight-low = Bassa
backlight-high = Alta

## Sound

volume-sound-settings = Impostazioni audio
volume-mute = Disattiva audio
volume-unmute = Riattiva audio
volume-output-slider = Volume
volume-output-title = Uscita audio
volume-output-open-menu = Apri il menu dell’uscita audio
volume-input-slider = Microfono
volume-input-title = Ingresso audio
volume-input-open-menu = Apri il menu dell’ingresso audio

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Apri il menu Bluetooth
bluetooth-settings = Impostazioni Bluetooth
bluetooth-connect = Connetti
bluetooth-disconnect = Disconnetti
bluetooth-connect-device = Connetti a { $deviceName }
bluetooth-disconnect-device = Disconnetti { $deviceName }
bluetooth-no-devices = Nessun dispositivo disponibile o connesso
bluetooth-turn-on-hint = Attiva il Bluetooth per connetterti ai dispositivi
bluetooth-connected-count = { $count ->
    [one] { $count } connesso
   *[other] { $count } connessi
}

## Network menus in quick settings

network-menu-unknown-network = <sconosciuta>
network-menu-connect = Connetti
network-menu-disconnect = Disconnetti
network-menu-connect-to = Connetti a { $name }
network-menu-disconnect-from = Disconnetti { $name }
network-menu-turn-off = Disattiva
network-menu-wifi-network = { $secure ->
    [yes] { $name }, protetta, intensità del segnale { $strength }%
   *[no] { $name }, non protetta, intensità del segnale { $strength }%
}
network-menu-hotspot = Hotspot di { $name }
network-menu-connected-count = { $count ->
    [one] { $count } connessa
   *[other] { $count } connesse
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Apri il menu VPN
network-menu-vpn-settings = Impostazioni VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Apri il menu Wi-Fi
network-menu-wifi-settings = Tutte le reti
network-menu-wired = Connessioni cablate
network-menu-wired-open-menu = Apri il menu delle connessioni cablate
network-menu-wired-settings = Impostazioni rete cablata
network-menu-tethers = Tethering Bluetooth
network-menu-tethers-open-menu = Apri il menu del tethering Bluetooth
network-menu-tether = Tethering
network-menu-tether-settings = Impostazioni Bluetooth
network-menu-mobile-connections = Connessioni mobili
network-menu-mobile-open-menu = Apri il menu delle connessioni mobili
network-menu-mobile-settings = Impostazioni banda larga mobile
network-menu-mobile = Rete mobile
network-device-wired = Rete cablata
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Accedi alla rete
network-menu-failed-title = Connessione non riuscita
network-menu-failed-body = Impossibile attivare la connessione di rete

## Location access dialog

location-dialog-title = Consenti l’accesso alla posizione
location-dialog-description = L’app { $appName } vuole accedere alla tua posizione
location-dialog-info = Puoi cambiare l’accesso alla posizione in qualsiasi momento nelle impostazioni della privacy
location-dialog-deny = Nega accesso
location-dialog-grant = Consenti accesso

## Thunderbolt notifications

thunderbolt-unknown-title = Dispositivo Thunderbolt sconosciuto
thunderbolt-unknown-body = È stato collegato un nuovo dispositivo mentre eri via. Scollegalo e ricollegalo per iniziare a usarlo.
thunderbolt-unauthorized-title = Dispositivo Thunderbolt non autorizzato
thunderbolt-unauthorized-body = È stato collegato un nuovo dispositivo che deve essere approvato da un amministratore
thunderbolt-error-title = Errore di autorizzazione Thunderbolt
thunderbolt-error-body = Impossibile autorizzare il dispositivo Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Nega
access-dialog-allow = Consenti

## Display change confirmation

display-change-title = Mantenere queste impostazioni?
display-change-countdown = { $seconds ->
    [one] Le modifiche verranno annullate tra { $seconds } secondo
   *[other] Le modifiche verranno annullate tra { $seconds } secondi
}
display-change-revert = Ripristina
display-change-keep = Mantieni

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = “{ $appName }” non risponde
close-dialog-description = Puoi attendere un po’ che riprenda o forzare la chiusura dell’app
close-dialog-force-quit = Forza chiusura
close-dialog-wait = Attendi

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Duplica
switch-monitor-join = Estendi
switch-monitor-external-only = Solo esterno
switch-monitor-built-in-only = Solo integrato

## Sign-in prompt

auth-prompt-password = Password
auth-prompt-username = Nome utente
auth-prompt-back = Indietro
auth-prompt-submit = Invia
auth-prompt-wrong-password = Password non corretta
auth-prompt-failed = Non ha funzionato. Riprova.
fingerprint-not-recognized = Impronta non riconosciuta

## Drive connected notification

autorun-connected = “{ $driveName }” collegato
autorun-ready = Il disco è pronto per l’uso
autorun-open-with = Apri con { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Tasti lenti attivati
kbd-a11y-slow-keys-off = Tasti lenti disattivati
kbd-a11y-slow-keys-description = Hai tenuto premuto il tasto Maiusc per 8 secondi. È la scorciatoia per Tasti lenti, che cambia il modo in cui funziona la tastiera.
kbd-a11y-sticky-keys-on = Tasti permanenti attivati
kbd-a11y-sticky-keys-off = Tasti permanenti disattivati
kbd-a11y-sticky-keys-on-description = Hai premuto il tasto Maiusc 5 volte di seguito. È la scorciatoia per Tasti permanenti, che cambia il modo in cui funziona la tastiera.
kbd-a11y-sticky-keys-off-description = Hai premuto due tasti insieme, oppure il tasto Maiusc 5 volte di seguito. Questo disattiva Tasti permanenti, che cambia il modo in cui funziona la tastiera.
kbd-a11y-leave-on = Lascia attivi
kbd-a11y-turn-on = Attiva
kbd-a11y-turn-off = Disattiva
kbd-a11y-leave-off = Lascia disattivati

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Scegli il dispositivo audio
audio-device-cancel = Annulla
audio-device-sound-settings = Impostazioni audio
audio-device-headphones = Cuffie
audio-device-headset = Cuffie con microfono
audio-device-microphone = Microfono

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Consenti il blocco delle scorciatoie
inhibit-shortcuts-app = L’app { $appName } vuole bloccare le scorciatoie
inhibit-shortcuts-unknown-app = Un’app vuole bloccare le scorciatoie
inhibit-shortcuts-restore = Puoi ripristinare le scorciatoie premendo { $shortcut }
inhibit-shortcuts-deny = Nega
inhibit-shortcuts-allow = Consenti

## Administrator authentication

polkit-title = Autenticazione richiesta
polkit-administrator = Amministratore
polkit-password = Password
polkit-cancel = Annulla
polkit-authenticate = Autentica
polkit-failed = Non ha funzionato. Riprova.

## Unlocking encrypted drives

mount-hidden-volume = Volume nascosto
mount-windows-system-volume = Volume di sistema Windows
mount-uses-keyfiles = Usa file chiave
mount-keyfiles-use-app = Per sbloccare un volume che usa file chiave, usa invece l’utilità <i>{ $appName }</i>
mount-keyfiles-need-app = Per sbloccare un volume che usa file chiave serve un’utilità esterna come <i>Dischi</i>
mount-pim-number = Numero PIM
mount-pim-invalid = Il PIM deve essere un numero o restare vuoto
mount-password = Password
mount-remember-password = Ricorda password
mount-cancel = Annulla
mount-unlock = Sblocca
mount-open-app = Apri { $appName }
mount-wrong-password = Non ha funzionato. Riprova.
mount-unlock-failed = Impossibile sbloccare il volume
mount-pim-unsupported = La versione di udisks installata non supporta l’impostazione PIM

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

## Network passwords, asked when connecting needs one

network-agent-auth-required = Autenticazione richiesta
network-agent-wifi-rejected = La password salvata per “{ $networkName }” non ha funzionato. Inseriscila di nuovo.
network-agent-wifi-secrets = Per accedere alla rete wireless “{ $networkName }” servono password o chiavi di crittografia
network-agent-wps-hint = In alternativa puoi connetterti premendo il pulsante “WPS” sul router
network-agent-wired-title = Autenticazione 802.1X cablata
network-agent-dsl-title = Autenticazione DSL
network-agent-pin-title = Codice PIN richiesto
network-agent-pin-body = Il dispositivo a banda larga mobile richiede un codice PIN
network-agent-vpn-title = Password VPN
network-agent-password-required = Per connetterti a “{ $networkName }” serve una password
network-agent-connect = Connetti
network-agent-cancel = Annulla
network-agent-password = Password
network-agent-username = Nome utente
network-agent-key = Chiave
network-agent-private-key-password = Password della chiave privata
network-agent-identity = Identità
network-agent-service = Servizio
network-agent-network-name = Nome della rete
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Scorri verso l’alto
lock-clock-click-or-press = Fai clic o premi un tasto

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Finestre
ctrl-alt-tab-panel = Barra delle applicazioni
ctrl-alt-tab-unlock = Finestra di sblocco

## System notifications

messages-system-source = Sistema
unsafe-mode-title = Il sistema è in modalità non sicura
unsafe-mode-body = Le app ora hanno accesso senza restrizioni
unsafe-mode-undo = Annulla
privileged-user-title = Accesso eseguito come utente con privilegi
privileged-user-body = Per motivi di sicurezza è meglio non usare una sessione come utente con privilegi. Se possibile, accedi come utente normale.

## On-screen keyboard

osk-keyboard-settings = Impostazioni tastiera
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel deve bloccare lo schermo

## Notifications

messages-unknown-app = App sconosciuta
messages-reply = Rispondi
messages-reply-placeholder = Scrivi una risposta
messages-reply-send = Invia

## Media player controls

mpris-unknown-artist = Artista sconosciuto
mpris-unknown-title = Titolo sconosciuto

## Starting programs

spawn-failed = Impossibile eseguire “{ $command }”:

## Text field context menu

entry-menu-copy = Copia
entry-menu-paste = Incolla
entry-menu-show-text = Mostra testo
entry-menu-hide-text = Nascondi testo
entry-caps-lock-on = Bloc Maiusc è attivo

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Acquisisci screenshot
title-bar-menu-hide = Riduci a icona
title-bar-menu-restore = Ripristina
title-bar-menu-maximize = Ingrandisci
title-bar-menu-move = Sposta
title-bar-menu-resize = Ridimensiona
title-bar-menu-always-on-top = Sempre in primo piano
title-bar-menu-always-on-visible-workspace = Su tutti gli spazi di lavoro
title-bar-menu-workspace-left = Sposta nello spazio di lavoro a sinistra
title-bar-menu-workspace-right = Sposta nello spazio di lavoro a destra
title-bar-menu-workspace-up = Sposta nello spazio di lavoro sopra
title-bar-menu-workspace-down = Sposta nello spazio di lavoro sotto
title-bar-menu-monitor-up = Sposta sullo schermo sopra
title-bar-menu-monitor-down = Sposta sullo schermo sotto
title-bar-menu-monitor-left = Sposta sullo schermo a sinistra
title-bar-menu-monitor-right = Sposta sullo schermo a destra
title-bar-menu-close = Chiudi

## Screenshots and screen recording

screenshot-source = Acquisizione schermo
screenshot-area = Selezione area
screenshot-screen = Selezione schermo
screenshot-window = Selezione finestra
screenshot-take = Acquisisci screenshot
screenshot-record = Registra schermo
screenshot-show-pointer = Mostra puntatore
screenshot-capture = Acquisisci
screenshot-close = Chiudi
screenshot-screencasts-folder = Registrazioni schermo
screenshot-screencast-file = Registrazione schermo { $date } { $time }
screenshot-screenshots-folder = Screenshot
screenshot-file = Screenshot { $timestamp }
screenshot-screencast-recorded = Registrazione dello schermo salvata
screenshot-screencast-start-failed = Impossibile avviare la registrazione dello schermo
screenshot-screencast-out-of-space = Registrazione dello schermo non riuscita: spazio su disco esaurito
screenshot-screencast-try-again = Registrazione dello schermo non riuscita. Riprova.
screenshot-screencast-failed = Registrazione dello schermo non riuscita
screenshot-screencast-view = Fai clic qui per vedere il video
screenshot-show-in-rover = Mostra in Rover
screenshot-captured = Screenshot acquisito
screenshot-captured-body = Puoi incollare l’immagine dagli Appunti
