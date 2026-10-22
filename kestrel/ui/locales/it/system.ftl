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
battery-left-with-time = { $percent } rimanente, circa { $duration }.
battery-low-title = Batteria scarica
battery-very-low-title = Batteria molto scarica
battery-almost-empty-title = Batteria quasi esaurita
battery-ups-low-title = Batteria dell’UPS scarica
battery-ups-very-low-title = Batteria dell’UPS molto scarica
battery-ups-almost-empty-title = Batteria dell’UPS quasi esaurita
battery-very-low-body = { $left } Collega presto l’alimentatore.
battery-almost-empty-body = { $left } Collega subito l’alimentatore per non perdere il lavoro non salvato.

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
privacy-windows-using = Usa le tue finestre
privacy-windows-seeing = Vede le tue finestre
privacy-windows-stop = Revoca accesso

## Window access prompt

peek-see-title = { $app } vuole vedere le tue finestre
peek-see-description = Potrà acquisire immagini di qualsiasi finestra aperta.
peek-use-title = { $app } vuole vedere e usare le tue finestre
peek-use-description = Potrà vedere qualsiasi finestra aperta e farci clic e scriverci come se fossi tu.
peek-deny = Non consentire
peek-allow-once = Consenti una volta
peek-allow-until-quit = Consenti finché non si chiude

## Window access errors

peek-error-declined = Chi usa questo computer ha rifiutato. { $app } potrà chiederlo di nuovo dopo essersi chiuso.
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
