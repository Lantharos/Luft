## Displays

settings-display-mirror = Duplica schermi
settings-display-mirror-description = Mostra la stessa immagine su ogni schermo
settings-display-mirrored = Schermi duplicati
settings-display-display = Schermo
settings-display-apply-failed = Queste impostazioni non hanno funzionato. Prova una configurazione diversa.
settings-display-reset = Ripristina
settings-display-apply = Applica
settings-display-arrangement-main = { $name }, schermo principale
settings-display-use = Usa questo schermo
settings-display-main = Schermo principale
settings-display-main-description = La barra delle applicazioni e le nuove finestre compaiono qui
settings-display-resolution-title = Risoluzione
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Frequenza di aggiornamento
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Frequenza di aggiornamento variabile
settings-display-variable-refresh-description = Lo schermo segue la frequenza dei fotogrammi dei giochi a schermo intero per movimenti più fluidi
settings-display-variable-refresh-off = Disattivata
settings-display-variable-refresh-games = Nei giochi
settings-display-variable-refresh-fullscreen = In tutte le app a schermo intero
settings-display-scale = Scala
settings-display-scale-description = Ingrandisce o rimpicciolisce testo, app e tutto il resto
settings-display-orientation = Orientamento
settings-display-orientation-landscape = Orizzontale
settings-display-orientation-portrait-right = Verticale a destra
settings-display-orientation-portrait-left = Verticale a sinistra
settings-display-orientation-landscape-flipped = Orizzontale, capovolto

## Display brightness

settings-display-brightness = Luminosità
settings-display-brightness-label = Luminosità di { $name }
settings-display-brightness-unsupported = Attiva DDC/CI nel menu dello schermo per regolarla da qui
settings-display-brightness-unresponsive = Non risponde al momento, nuovo tentativo a breve
settings-display-brightness-external = Schermi esterni
settings-display-brightness-missing-tool = Installa ddcutil per regolarne la luminosità da qui
settings-display-brightness-needs-restart = Riavvia per completare la configurazione della luminosità
settings-display-brightness-no-access = Esci e accedi di nuovo per regolarne la luminosità da qui

## Night light

settings-display-night-light = Luce notturna
settings-display-night-light-description = Colori più caldi la sera, più riposanti per gli occhi
settings-display-night-light-schedule = Pianificazione
settings-display-night-light-automatic = Dal tramonto all’alba
settings-display-night-light-custom = Personalizzata
settings-display-night-light-from = Si attiva
settings-display-night-light-to = Si disattiva
settings-display-night-light-warmth = Intensità

## Sound

settings-sound-output = Uscita
settings-sound-input = Ingresso
settings-sound-device = Dispositivo
settings-sound-output-device = Dispositivo di uscita
settings-sound-input-device = Dispositivo di ingresso
settings-sound-connection = Connessione
settings-sound-output-connection = Connessione di uscita
settings-sound-input-connection = Connessione di ingresso
settings-sound-volume = Volume
settings-sound-mute = Disattiva audio: { $name }
settings-sound-unmute = Riattiva audio: { $name }
settings-sound-balance = Bilanciamento
settings-sound-balance-center = Centro
settings-sound-balance-left = { $share } a sinistra
settings-sound-balance-right = { $share } a destra
settings-sound-louder = Consenti oltre il 100%
settings-sound-louder-description = L’audio può distorcersi a volumi più alti
settings-sound-input-level = Livello di ingresso
settings-sound-apps = Volume delle app
settings-sound-apps-playing = { $count ->
    [one] { $count } app sta riproducendo audio
   *[other] { $count } app stanno riproducendo audio
}
settings-sound-app-output = Riproduci { $app } su
settings-sound-profiles = Profili dei dispositivi
settings-sound-profiles-row-description = Scegli come viene usato ogni dispositivo audio
settings-sound-profiles-description = Come viene usato ogni dispositivo audio, ad esempio stereo o surround
settings-sound-profile-label = Uso di { $device }
settings-sound-profile-off = Disattivato

## System sounds

settings-sound-system = Suoni di sistema
settings-sound-system-description = Suoni per notifiche, dispositivi e altri eventi
settings-sound-system-volume = Volume dei suoni di sistema
settings-sound-kind-notifications = Notifiche
    .description = Silenziosi con Non disturbare, durante i giochi e la condivisione dello schermo
    .preview = Riproduci il suono di notifica
settings-sound-kind-devices = Dispositivi e ricarica
    .description = Collegamento di un dispositivo o di un caricabatterie, e batteria scarica
    .preview = Riproduci il suono dei dispositivi
settings-sound-kind-volume = Segnale del volume
    .description = Un clic quando cambi il volume
    .preview = Riproduci il clic del volume
settings-sound-kind-screenshots = Screenshot
    .description = Uno scatto quando viene salvato uno screenshot
    .preview = Riproduci lo scatto
settings-sound-kind-recording = Registrazione
    .description = Quando la registrazione dello schermo, la fotocamera o la dettatura si avviano e si fermano
    .preview = Riproduci il suono di registrazione
settings-sound-kind-sign-in = Suono di accesso
    .description = Quando compare il desktop
    .preview = Riproduci il suono di accesso
settings-sound-kind-keyboard = Tocchi della tastiera
    .description = Ogni tasto della tastiera su schermo
    .preview = Riproduci un tocco della tastiera

## Power and battery

settings-power-battery = Batteria
settings-power-charging = In carica
settings-power-charging-at = In carica a { $power }
settings-power-charging-until-full = In carica, completa tra { $time }
settings-power-charging-at-until-full = In carica a { $power }, completa tra { $time }
settings-power-on-battery = A batteria
settings-power-on-battery-using = A batteria, consumo { $power }
settings-power-time-left = Ancora circa { $time }
settings-power-time-left-using = Ancora circa { $time }, consumo { $power }
settings-power-full = Carica completa
settings-power-empty = Scarica
settings-power-not-charging = Collegato alla corrente, non in carica
settings-power-health = Stato della batteria
settings-power-capacity = { $full } su { $design } da nuova
settings-power-cycles = { $count ->
    [one] { $cycles } ciclo di carica
   *[other] { $cycles } cicli di carica
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Mostra percentuale
settings-power-show-percentage-description = Mostra il livello della batteria dentro la sua icona

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = meno di un minuto
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minuto
   *[other] { $minutes } minuti
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } ora
   *[other] { $hours } ore
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } ora
   *[other] { $hours } ore
} { $minutes ->
    [one] { $minutes } minuto
   *[other] { $minutes } minuti
}
settings-power-never = Mai

## Charge limit

settings-power-limit = Limita la ricarica
settings-power-limit-failed = Impossibile cambiare il limite. Riprova.
settings-power-limit-elsewhere-off = Un’altra app l’ha disattivato, quindi la batteria si carica completamente
settings-power-limit-elsewhere-changed = Un’altra app ha cambiato il limite a { $level }
settings-power-limit-elsewhere-on = Un’altra app ferma la ricarica a { $level }
settings-power-limit-automatic = Il computer decide quando fermare la ricarica
settings-power-limit-stops-at = Ferma la ricarica a { $level }
settings-power-limit-description = Ferma la ricarica prima per far durare più a lungo la batteria
settings-power-limit-description-at = Si ferma a { $level } per far durare più a lungo la batteria
settings-power-limit-applied = La ricarica si ferma a { $level }
settings-power-limit-applied-description = Impostato da un’altra app su questo computer

## Battery-powered devices

settings-power-devices = Dispositivi
settings-power-device-mouse = Mouse
settings-power-device-keyboard = Tastiera
settings-power-device-headphones = Cuffie
settings-power-device-speaker = Altoparlante
settings-power-device-controller = Controller
settings-power-device-phone = Telefono
settings-power-device-tablet = Tablet
settings-power-device-pen = Penna
settings-power-device-touchpad = Touchpad
settings-power-device-other = Dispositivo

## Power mode

settings-power-mode = Modalità energia
settings-power-mode-row = Modalità
settings-power-profile-saver = Risparmio energia
    .description = Più lenta, consuma meno energia
settings-power-profile-balanced = Bilanciata
    .description = Prestazioni e consumi standard
settings-power-profile-performance = Prestazioni
    .description = Più veloce, consuma più energia
settings-power-limited = Le prestazioni sono limitate al momento
settings-power-limited-lap = Le prestazioni sono limitate perché il computer è sulle tue gambe
settings-power-limited-hot = Le prestazioni sono limitate perché il computer è troppo caldo
settings-power-limited-lap-hot = Le prestazioni sono limitate perché il computer è sulle tue gambe ed è troppo caldo
settings-power-saver-low-battery = Risparmio energia con batteria scarica
settings-power-saver-low-battery-description = Passa a Risparmio energia quando la batteria si sta esaurendo
settings-power-saver-level = Livello della batteria per il risparmio energia

## Keyboard backlight

settings-power-keyboard = Tastiera
settings-power-backlight = Retroilluminazione della tastiera
settings-power-backlight-off = Disattivata
settings-power-backlight-low = Bassa
settings-power-backlight-medium = Media
settings-power-backlight-high = Alta

## Screen and sleep

settings-power-screen = Schermo
settings-power-screen-off = Spegni lo schermo dopo
settings-power-screen-off-description = Quando non usi il computer per un po’
settings-power-dim = Riduci la luminosità se inattivo
settings-power-dim-description = Abbassa la luminosità poco prima che lo schermo si spenga
settings-power-sleep = Sospensione
settings-power-suspend-plugged-in = Sospendi se collegato alla corrente
settings-power-suspend-inactive = Sospendi se inattivo
settings-power-suspend-description = Sospende il computer dopo un periodo di inattività
settings-power-suspend-battery = Sospendi se a batteria
settings-power-button = Pulsante di accensione
settings-power-button-suspend = Sospendi
settings-power-button-hibernate = Iberna
settings-power-button-ask = Chiedi cosa fare
settings-power-button-nothing = Non fare nulla
settings-power-long-sleep = Spegni dopo una lunga sospensione
settings-power-long-sleep-description = Invece di lasciar scaricare la batteria durante la sospensione, il computer si spegne quando la batteria è scarica o dopo una lunga sospensione a batteria. Le finestre aperte non vengono mantenute.
settings-power-long-sleep-failed = Impossibile cambiare questa impostazione. Riprova.
settings-power-long-sleep-after = Spegni dopo
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } ora
   *[other] { $hours } ore
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } giorno
   *[other] { $days } giorni
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } settimana
   *[other] { $weeks } settimane
}

## Keyboard

settings-keyboard-sources = Sorgenti di input
settings-keyboard-sources-description = La prima è quella predefinita. Passa dall’una all’altra mentre scrivi.
settings-keyboard-source-edit = Modifica in Keys
settings-keyboard-source-up = Sposta su
settings-keyboard-source-down = Sposta giù
settings-keyboard-source-remove = Rimuovi
settings-keyboard-add-source-button = Aggiungi sorgente di input
settings-keyboard-own = I tuoi layout e metodi di input
settings-keyboard-own-layout = Crea un layout
settings-keyboard-own-layout-description = Parti da un layout e cambia cosa scrivono i suoi tasti
settings-keyboard-own-method = Crea un metodo di input
settings-keyboard-own-method-description = Trasforma ciò che scrivi in lettere accentate, altri alfabeti o parole da scegliere
settings-keyboard-own-open = Apri Keys
settings-keyboard-own-open-description = Modifica i layout e i metodi di input che hai creato
settings-keyboard-switch-source = Cambia sorgente di input
settings-keyboard-add-source = Aggiungi una sorgente di input
settings-keyboard-add-source-description = Scegli il layout di tastiera o il metodo di input con cui vuoi scrivere.
settings-keyboard-add-source-search = Cerca lingue, layout e metodi di input
settings-keyboard-input-method = Metodo di input
settings-keyboard-add-source-no-match = Nessun risultato per “{ $query }”
settings-keyboard-cancel = Annulla
settings-keyboard-add = Aggiungi
settings-keyboard-typing = Digitazione
settings-keyboard-repeat = Ripetizione dei tasti
settings-keyboard-repeat-description = Tenendo premuto un tasto, il carattere viene ripetuto
settings-keyboard-repeat-delay = Ritardo prima della ripetizione
settings-keyboard-repeat-delay-shorter = Più breve
settings-keyboard-repeat-delay-longer = Più lungo
settings-keyboard-repeat-speed = Velocità di ripetizione
settings-keyboard-repeat-speed-slower = Più lenta
settings-keyboard-repeat-speed-faster = Più veloce
settings-keyboard-caps-lock = Tasto Bloc Maiusc
settings-keyboard-caps-lock-description = Cosa succede quando lo premi
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Scambia con Esc
settings-keyboard-caps-lock-nothing = Niente
settings-keyboard-caps-lock-custom = Personalizzato
settings-keyboard-lock-notices = Mostra Bloc Maiusc e Bloc Num
settings-keyboard-lock-notices-description = Compare per un attimo sullo schermo quando uno dei due si attiva o si disattiva
settings-keyboard-dictation-on = Attivata
settings-keyboard-dictation-off = Disattivata
settings-keyboard-shortcuts-description = Visualizza e cambia le scorciatoie o aggiungine di tue

## Copilot key

settings-keyboard-copilot = Tasto Copilot
settings-keyboard-copilot-press = Pressione
settings-keyboard-copilot-press-description = Cosa fa una breve pressione del tasto
settings-keyboard-copilot-open-start = Apri Start
settings-keyboard-copilot-open-app = Apri un’app
settings-keyboard-copilot-nothing = Niente
settings-keyboard-copilot-app = App
settings-keyboard-copilot-no-app = Nessuna app scelta
settings-keyboard-copilot-change = Cambia
settings-keyboard-copilot-choose = Scegli
settings-keyboard-copilot-hold = Tieni premuto per dettare
settings-keyboard-copilot-hold-description = Tieni premuto il tasto e parla per scrivere ciò che dici
settings-keyboard-copilot-hold-off = Funziona quando la dettatura è attiva
settings-keyboard-copilot-choose-app = Scegli un’app
settings-keyboard-copilot-choose-app-description = Si apre quando premi il tasto Copilot.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Maiusc
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Stamp
settings-keys-page-up = Pag su
settings-keys-page-down = Pag giù
settings-keys-home = Home
settings-keys-end = Fine
settings-keys-insert = Ins
settings-keys-delete = Canc
settings-keys-tab = Tab
settings-keys-space = Spazio
settings-keys-enter = Invio
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pausa
settings-keys-scroll-lock = Bloc Scorr
settings-keys-caps-lock = Bloc Maiusc
settings-keys-menu = Menu
settings-keys-keypad = Tastierino { $key }
settings-keys-volume-up = Volume su
settings-keys-volume-down = Volume giù
settings-keys-mute = Disattiva audio
settings-keys-microphone-mute = Disattiva microfono
settings-keys-play = Riproduci
settings-keys-media-pause = Pausa
settings-keys-stop = Stop
settings-keys-next-track = Traccia successiva
settings-keys-previous-track = Traccia precedente
settings-keys-brightness-up = Luminosità su
settings-keys-brightness-down = Luminosità giù
settings-keys-browser = Browser
settings-keys-home-page = Pagina iniziale
settings-keys-search = Cerca
settings-keys-mail = Posta
settings-keys-calculator = Calcolatrice
settings-keys-files = File
settings-keys-eject = Espelli
settings-keys-power = Accensione
settings-keys-lock = Blocca

## Keyboard shortcuts

settings-shortcuts-title = Scorciatoie da tastiera
settings-shortcuts-search = Cerca scorciatoie
settings-shortcuts-category-system = Sistema
settings-shortcuts-category-windows = Finestre
settings-shortcuts-category-tiling = Affiancamento
settings-shortcuts-category-workspaces = Spazi di lavoro
settings-shortcuts-category-screenshots = Screenshot
settings-shortcuts-category-media = Multimedia
settings-shortcuts-reset = Ripristina predefinita
settings-shortcuts-apps = Scorciatoie delle app
settings-shortcuts-apps-description = Quelle richieste dalle app, che funzionano anche quando l’app non è in primo piano
settings-shortcuts-no-match = Nessuna scorciatoia corrisponde a “{ $query }”
settings-shortcuts-change = Cambia la scorciatoia per { $name }
settings-shortcuts-or = o
settings-shortcuts-not-set = Non impostata
settings-shortcuts-press-keys = Premi i tasti che vuoi
settings-shortcuts-needs-modifier = Aggiungi Ctrl, Alt o Super, così la scorciatoia non interferisce con la digitazione.
settings-shortcuts-record-description = Premi la nuova scorciatoia. Backspace la disattiva, Esc annulla.
settings-shortcuts-record-taken = Questa scorciatoia è già usata per “{ $name }”. Se la sostituisci, lì verrà disattivata.
settings-shortcuts-try-another = Provane un’altra
settings-shortcuts-replace = Sostituisci
settings-shortcuts-cancel = Annulla
settings-shortcuts-custom = Scorciatoie personalizzate
settings-shortcuts-custom-description = Esegui un comando o apri un’app con una combinazione di tasti
settings-shortcuts-untitled = Senza nome
settings-shortcuts-add = Aggiungi scorciatoia
settings-shortcuts-edit = Modifica scorciatoia
settings-shortcuts-custom-name = Nome
settings-shortcuts-custom-command = Comando
settings-shortcuts-custom-shortcut = Scorciatoia
settings-shortcuts-custom-taken = Già usata per “{ $name }”. Se salvi, lì verrà disattivata.
settings-shortcuts-remove = Rimuovi
settings-shortcuts-save = Salva
settings-shortcuts-add-button = Aggiungi

## Dictation

settings-dictation-title = Dettatura
settings-dictation-description = Tieni premuto { $keys } e parla per scrivere ciò che dici, in qualsiasi app. Rilascia per finire o premi Esc per annullare. Tutto avviene su questo computer: la tua voce non lo lascia mai e non viene salvata.
settings-dictation-description-no-shortcut = Scegli una scorciatoia qui sotto per dettare. Tutto avviene su questo computer: la tua voce non lo lascia mai e non viene salvata.
settings-dictation-not-installed = La dettatura non è installata su questo computer
settings-dictation-hold = Tieni premuto { $keys } per dettare
settings-dictation-needs-shortcut = Disattivata finché non ha una scorciatoia
settings-dictation-copilot-key = il tasto Copilot
settings-dictation-shortcut = Scorciatoia
settings-dictation-shortcut-description = Tienila premuta per parlare, oppure premila per far ascoltare finché non la premi di nuovo o smetti di parlare
settings-dictation-shortcut-own = La mia scorciatoia
settings-dictation-shortcut-another = Un’altra scorciatoia…
settings-dictation-shortcut-off = Disattivata
settings-dictation-keys = Tasti
settings-dictation-change = Cambia
settings-dictation-language = Lingua
settings-dictation-language-automatic = Automatica
settings-dictation-language-automatic-current = Automatica ({ $language })
settings-dictation-language-description = Automatica segue il layout di tastiera con cui scrivi
settings-dictation-language-unavailable = La dettatura in { $language } non è disponibile su questo computer
settings-dictation-engine = Riconoscimento vocale
settings-dictation-engine-automatic = Automatico
settings-dictation-engine-description = { $engine } riconosce il parlato in { $language }
settings-dictation-engine-graphics-card = { $engine } riconosce il parlato in { $language } usando la scheda video
settings-dictation-models = Modelli vocali
settings-dictation-models-description = I modelli vengono scaricati una volta e conservati su questo computer.
settings-dictation-credits = Riconoscimenti
settings-dictation-credit = { $credit }. Distribuito con licenza { $licence }.
settings-dictation-learn-more = Scopri di più

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Impossibile scaricare: { $reason }
settings-dictation-model-downloading = { $received } di { $total }
settings-dictation-model-installed = { $size } su questo computer
settings-dictation-model-partial = { $received } di { $total } scaricati
settings-dictation-model-size = { $size } da scaricare
settings-dictation-model-retry = Riprova
settings-dictation-model-cancel = Annulla
settings-dictation-model-resume = Riprendi
settings-dictation-model-download = Scarica
settings-dictation-model-remove = Rimuovi

## Mouse and touchpad

settings-mouse-mouse = Mouse
settings-mouse-primary-button = Pulsante principale
settings-mouse-primary-button-description = Il pulsante che premi per selezionare
settings-mouse-primary-button-left = Sinistro
settings-mouse-primary-button-right = Destro
settings-mouse-speed = Velocità del puntatore
settings-mouse-slower = Più lenta
settings-mouse-faster = Più veloce
settings-mouse-acceleration = Accelerazione del mouse
settings-mouse-acceleration-description = Il puntatore si sposta di più quando muovi velocemente il mouse
settings-mouse-natural-scrolling = Scorrimento naturale
settings-mouse-natural-scrolling-description = Lo scorrimento sposta il contenuto invece della visuale
settings-mouse-touchpad = Touchpad
settings-mouse-touchpad-speed = Velocità del puntatore del touchpad
settings-mouse-touchpad-scroll-speed = Velocità di scorrimento
settings-mouse-touchpad-scroll-speed-label = Velocità di scorrimento del touchpad
settings-mouse-touchpad-tap = Tocca per fare clic
settings-mouse-touchpad-tap-description = Tocca il touchpad invece di premerlo
settings-mouse-touchpad-natural-scrolling = Scorrimento naturale del touchpad
settings-mouse-touchpad-natural-scrolling-description = Il contenuto si muove nella stessa direzione delle dita
settings-mouse-touchpad-scroll-with = Scorri con
settings-mouse-touchpad-two-fingers = Due dita
settings-mouse-touchpad-scroll-edge = Bordo
settings-mouse-touchpad-secondary-click = Clic secondario
settings-mouse-touchpad-secondary-click-description = Come fare clic destro senza un pulsante separato
settings-mouse-touchpad-click-corner = Angolo
settings-mouse-touchpad-disable-typing = Disattiva durante la digitazione
settings-mouse-touchpad-disable-typing-description = Così il puntatore non salta mentre scrivi
