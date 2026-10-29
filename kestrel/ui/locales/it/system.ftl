## Shared

system-cancel = Annulla

## Dictation notifications

dictation-setup-title = Scrivi parlando
dictation-setup-body = Parla per scrivere ciò che dici, in qualsiasi app. Il riconoscimento avviene su questo computer, quindi serve prima il modello vocale.
dictation-setup-action = Configura la dettatura
dictation-unsupported-title = La dettatura in { $language } non è disponibile su questo computer
dictation-unsupported-body = Il processore non può eseguire il riconoscimento vocale necessario per la lingua { $language }. Puoi dettare in un’altra lingua.
dictation-settings-action = Impostazioni dettatura

## System health notifications

health-gpu-reset-title = Il driver grafico ha smesso di rispondere
health-gpu-reset-body = { $day ->
    [today] Il computer si è riavviato da solo oggi alle { $time }. Nelle Impostazioni trovi come evitare che succeda di nuovo.
   *[other] Il computer si è riavviato da solo il giorno { $date } alle { $time }. Nelle Impostazioni trovi come evitare che succeda di nuovo.
}
health-gpu-reset-details = Dettagli

oom-app-closed-title = { $app } è stato chiuso per liberare memoria
oom-container-closed-title = Un container è stato chiuso per liberare memoria
oom-closed-body = La memoria del computer stava per esaurirsi, quindi è stato chiuso per mantenere reattivo tutto il resto.
oom-closed-body-with-size = La memoria del computer stava per esaurirsi, quindi è stato chiuso per mantenere reattivo tutto il resto. Usava { $size }.
memory-low-title = Luft sta esaurendo la memoria
memory-low-app-body = { $app } sta usando { $size }. Forzane l’uscita per mantenere reattivo tutto il resto.
memory-low-container-body = Un container sta usando { $size }. Forzane l’uscita per mantenere reattivo tutto il resto.
memory-low-force-quit = Forza uscita

## Input source indicator

input-source-indicator = Sorgente di input: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Modalità aereo attivata dall’interruttore
media-keys-airplane-mode-on = Modalità aereo attivata
media-keys-airplane-mode-off = Modalità aereo disattivata
media-keys-bluetooth-on = Bluetooth attivato
media-keys-bluetooth-off = Bluetooth disattivato
media-keys-caps-lock-on = Bloc Maiusc attivato
media-keys-caps-lock-off = Bloc Maiusc disattivato
media-keys-num-lock-on = Bloc Num attivato
media-keys-num-lock-off = Bloc Num disattivato

## VPN sign-in

vpn-sign-in-title = Accedi a { $connection }
vpn-connect = Connetti
vpn-signing-in = Accesso in corso…
vpn-finish-in-browser = Completa l’accesso nel browser.
vpn-certificate-untrusted = { $host } ha presentato un certificato che non può essere verificato ({ $reason }). La sua impronta digitale è { $fingerprint }.
vpn-certificate-warning = Qualcuno potrebbe fingersi questo server. Connettiti solo se te lo aspettavi.
vpn-certificate-connect = Connetti comunque

vpn-field-password = Password
vpn-field-certificate-password = Password del certificato
vpn-field-proxy-password = Password del proxy
vpn-field-pre-shared-key = Chiave precondivisa
vpn-field-group-password = Password del gruppo

## Battery notifications

battery-left = { $percent } rimanente.

battery-device-low-title = Batteria scarica: { $device }
battery-device-very-low-title = Batteria molto scarica: { $device }
battery-device-low-body = { $left } Ricaricalo presto.
battery-device-very-low-body = { $left } Ricaricalo subito, prima che si spenga.

battery-device-mouse = Mouse
battery-device-keyboard = Tastiera
battery-device-phone = Telefono
battery-device-tablet = Tablet
battery-device-controller = Controller
battery-device-pen = Penna
battery-device-touchpad = Touchpad
battery-device-headset = Cuffie con microfono
battery-device-speaker = Altoparlante
battery-device-headphones = Cuffie
battery-device-remote = Telecomando
battery-device-other = Dispositivo collegato

## Privacy indicator

privacy-indicator = In uso: { $things }
privacy-thing-camera = fotocamera
privacy-thing-microphone = microfono
privacy-thing-screen = schermo
privacy-thing-location = posizione
privacy-thing-windows = finestre

privacy-camera-unknown-app = Un’app sta usando la fotocamera
privacy-stop-sharing = Interrompi la condivisione dello schermo
privacy-stop-recording = Interrompi la registrazione
privacy-turn-off-location = Disattiva i servizi di localizzazione
privacy-settings = Impostazioni privacy
privacy-camera = Fotocamera
privacy-microphone = Microfono
privacy-microphone-muted = Microfono disattivato
privacy-mute-microphone = Disattiva microfono
privacy-unmute-microphone = Riattiva microfono
privacy-close-app = Chiudi { $app }
privacy-unknown-app = Un’app
privacy-reported-app = “{ $name }” (nome non verificato)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } programma può vedere le tue finestre
   *[other] { $count } programmi possono vedere le tue finestre
}
privacy-windows-using-programs = { $count ->
    [one] { $count } programma può vedere e usare le tue finestre
   *[other] { $count } programmi possono vedere e usare le tue finestre
}
privacy-windows-stop = Revoca accesso

## Window access prompt

peek-see-request = Consentire a un programma che hai avviato di vedere le tue finestre?
peek-see-description = Potrà acquisire immagini di qualsiasi finestra aperta.
peek-use-request = Consentire a un programma che hai avviato di vedere e usare le tue finestre?
peek-use-description = Potrà vedere qualsiasi finestra aperta e farci clic e scriverci come se fossi tu.
peek-deny = Non consentire
peek-allow-once = Consenti una volta
peek-allow-until-quit = Consenti finché non si chiude

## Window access errors

peek-error-declined-until-quit = Chi usa questo computer ha rifiutato. Il programma potrà chiederlo di nuovo dopo essersi chiuso.
peek-error-not-allowed = Chi usa questo computer non l’ha consentito
peek-error-sandboxed = Le app in sandbox non possono vedere né usare altre finestre
peek-error-unknown-caller = Il programma che ha fatto la richiesta è terminato o non è stato riconosciuto
peek-error-no-caller = Il bus di sessione non ha indicato quale programma fa la richiesta
peek-error-screen-busy = Lo schermo è bloccato o mostra una richiesta di sistema. Riprova quando non c’è più.
peek-error-input-held = Qualcuno sta tenendo premuti dei tasti o dei pulsanti del mouse. Riprova tra un momento.
peek-error-input-dropped = L’input è stato interrotto perché, al suo arrivo, sotto il punto c’era altro o la tastiera era in uso da altro
peek-error-not-in-front = Impossibile portare la finestra in primo piano
peek-error-covered = Quella parte della finestra è coperta da qualcos’altro
peek-error-outside = { $x }, { $y } è fuori dall’immagine della finestra, che misura { $width } × { $height }
peek-error-nothing-to-capture = La finestra non mostra nulla da acquisire
peek-error-window-picture-late = L’immagine della finestra non è stata pronta in tempo
peek-error-screen-picture-late = L’immagine dello schermo non è stata pronta in tempo
peek-error-no-window-id = Nessuna finestra ha l’id { $id }. peek list mostra quelle aperte.
peek-error-no-window-for-handle = Il programma avviato come { $handle } non ha finestre aperte
peek-error-ended-before-window = Il programma è terminato prima di aprire una finestra
peek-error-no-window-in-time = Nessuna finestra si è aperta entro { $duration }
peek-error-launch-not-started-by-peek = Si può avviare solo un programma che peek run ha avviato da sé
peek-error-ended-while-starting = Il programma è terminato durante l’avvio
peek-error-launch-failed = systemd non è riuscito ad avviare { $program }
peek-error-unknown-handle = Nessun programma avviato con peek run ha l’handle { $handle }, oppure è stato chiuso
peek-error-unknown-key = { $key } non è un tasto che peek conosce
peek-error-unknown-modifier = { $modifier } non è un modificatore. Usa ctrl, shift, alt o super.
peek-error-display-owner = Questo display appartiene a un altro programma
peek-error-display-run = I programmi in un display nascosto vengono avviati da peek run
peek-error-display-handle = Questo display è stato avviato come { $handle }, non come { $requested }

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
inhibit-shortcuts-titled-app = Un’app con la finestra “{ $title }” vuole bloccare le scorciatoie
inhibit-shortcuts-restore = Puoi ripristinare le scorciatoie premendo { $shortcut }
inhibit-shortcuts-deny = Nega
inhibit-shortcuts-allow = Consenti

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

## System updates
updates-available-title = Sono disponibili aggiornamenti di sistema
updates-available-body = Apri Impostazioni per scaricarli e installarli.
updates-ready-title = Gli aggiornamenti sono pronti per l’installazione
updates-ready-body = Riavvia quando ti è comodo per installarli.
