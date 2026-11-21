## Gust

gust-search-placeholder = Cerca app, file e altro
gust-search-cut = Taglia
gust-search-copy = Copia
gust-search-paste = Incolla
gust-search-select-all = Seleziona tutto
gust-power = Alimentazione e sessione
gust-power-close = Chiudi opzioni di alimentazione
gust-account-settings = Impostazioni account
gust-apps = App
gust-folder-default-name = Cartella
gust-folder-open = Apri cartella
gust-folder-rename = Rinomina
gust-folder-ungroup = Separa app
gust-open = Apri
gust-move-to-apps = Sposta in App

## Gust search results

gust-search-best-match = Risultato migliore
gust-search-group-apps = App
gust-search-group-commands = Azioni delle app
gust-search-group-windows = Finestre aperte
gust-search-group-actions = Azioni
gust-search-group-settings = Impostazioni
gust-search-group-clipboard = Appunti
gust-search-group-emoji = Emoji
gust-search-group-files = File
gust-search-group-contents = Nei file
gust-search-group-web = Web
gust-search-web = Cerca “{ $query }” sul web
gust-search-clipboard-text = Dalla cronologia degli Appunti
gust-search-clipboard-keywords = appunti, copiato, copiati, cronologia degli appunti, incolla, clipboard
gust-search-emoji-insert = Inserisci
gust-search-settings-page = Impostazioni
gust-search-settings-section = Impostazioni: { $page }
gust-search-file-reveal = Mostra in { $fileManager }
gust-search-file-copy-path = Copia percorso
gust-search-conversion = { $amount } { $from } in { $to }
gust-search-calculation = { $expression }, premi Invio per copiare

## Answers in Gust's search to questions about dates and times.
## The answer itself, such as "157 days" or "17:00", is formatted for the language; these describe it.

gust-search-answer-until = Fino al { $date }
gust-search-answer-since = Dal { $date }
gust-search-answer-between = Tra il { $from } e il { $to }
gust-search-answer-time-ahead = { $place }, { $hours ->
    [one] { $hours } ora
   *[other] { $hours } ore
} avanti
gust-search-answer-time-behind = { $place }, { $hours ->
    [one] { $hours } ora
   *[other] { $hours } ore
} indietro
gust-search-answer-time-same = { $place }, stessa ora di qui
gust-search-answer-converted = A { $place } quando a { $from } sono le { $time }
gust-search-answer-converted-here = Qui quando a { $from } sono le { $time }
gust-search-answer-converted-from-here = A { $place } quando qui sono le { $time }

## Gust search actions
## The keyword messages are comma-separated words people might type to find the action.
## They aren't shown. Keep common English terms in the translation when people would type them too.

gust-search-dark-style-on = Passa alla modalità scura
gust-search-dark-style-off = Passa alla modalità chiara
gust-search-dark-style-keywords = modalità scura, stile scuro, tema scuro, modalità chiara, stile chiaro, tema chiaro, dark mode
gust-search-night-light-on = Attiva Luce notturna
gust-search-night-light-off = Disattiva Luce notturna
gust-search-night-light-keywords = luce notturna, luce blu, filtro luce blu, colori caldi, night light, night shift
gust-search-do-not-disturb-on = Attiva Non disturbare
gust-search-do-not-disturb-off = Disattiva Non disturbare
gust-search-do-not-disturb-keywords = non disturbare, concentrazione, silenzio, silenzioso, silenzia notifiche, disattiva notifiche, notifiche mute, dnd
gust-search-wifi-on = Attiva Wi-Fi
gust-search-wifi-off = Disattiva Wi-Fi
gust-search-wifi-keywords = wifi, wi-fi, wireless, senza fili, wlan, rete
gust-search-bluetooth-on = Attiva Bluetooth
gust-search-bluetooth-off = Disattiva Bluetooth
gust-search-bluetooth-keywords = bluetooth
gust-search-airplane-mode-on = Attiva Modalità aereo
gust-search-airplane-mode-off = Disattiva Modalità aereo
gust-search-airplane-mode-keywords = modalità aereo, modalità volo, aereo, offline, radio
gust-search-keep-awake-on = Mantieni attivo
gust-search-keep-awake-off = Non mantenere più attivo
gust-search-keep-awake-keywords = mantieni attivo, resta attivo, schermo acceso, caffeina, impedisci sospensione, non sospendere
gust-search-lock-keywords = blocca schermo, blocca computer, blocco schermo
gust-search-suspend-keywords = sospendi, sospensione, standby, stop
gust-search-log-out-keywords = esci, disconnetti, disconnessione, logout, termina sessione, cambia utente
gust-search-restart-keywords = riavvia, riavvio, riavvia computer, reboot
gust-search-power-off-keywords = spegni, spegnimento, arresta, arresto, spegni computer, shutdown

## Quick settings

quick-settings-lock = Blocca
quick-settings-suspend = Sospendi
quick-settings-log-out = Esci
quick-settings-restart = Riavvia
quick-settings-power-off = Spegni
quick-settings-screenshot = Screenshot
quick-settings-settings = Impostazioni
quick-settings-battery = Batteria
quick-settings-battery-level = { $percent }
quick-settings-battery-charging = In carica
quick-settings-battery-until-full = { $duration } alla carica completa
quick-settings-battery-left = { $duration } rimanenti
quick-settings-battery-discharging = A batteria
quick-settings-battery-full = Carica completa
quick-settings-battery-plugged-in = Collegato alla corrente
quick-settings-on = Attivato
quick-settings-off = Disattivato
quick-settings-show-options = Mostra opzioni
quick-settings-slider-value = { $percent }
quick-settings-tile-settings = Impostazioni
quick-settings-tile-remove = Rimuovi
quick-settings-add = Aggiungi
quick-settings-reset = Ripristina

## Notifications

notifications-title = Notifiche
notifications-clear-all = Cancella tutto
notifications-clear-everything = Cancella tutte le notifiche
notifications-lock-screen-content = Mostra il contenuto dei messaggi nella schermata di blocco
notifications-settings = Impostazioni notifiche
notifications-clear-app = Cancella le notifiche di { $app }
notifications-more = { $count ->
    [one] { $count } in più
   *[other] { $count } in più
}
notifications-show-less = Mostra meno
notifications-dismiss-notification = Ignora notifica
notifications-open = Apri
notifications-dismiss = Ignora
notifications-send-reply = Invia risposta
notifications-media-previous = Traccia precedente
notifications-media-next = Traccia successiva
notifications-media-play = Riproduci
notifications-media-pause = Pausa
messages-unknown-app = App sconosciuta
messages-reply = Rispondi
messages-reply-placeholder = Scrivi una risposta
messages-reply-send = Invia

## Calendar

calendar-previous-month = Mese precedente
calendar-next-month = Mese successivo
calendar-month-week = { $month }, settimana { $week }

## Clipboard history

clipboard-clear-all = Cancella tutto
clipboard-image = Immagine, { $width } × { $height }
clipboard-paste = Incolla
clipboard-copy = Copia
clipboard-remove = Rimuovi

## Emoji picker

emoji-search = Cerca
emoji-no-results = Nessun risultato
emoji-recently-used = Usate di recente
emoji-smileys = Faccine ed emozioni
emoji-people = Persone e corpo
emoji-nature = Animali e natura
emoji-food = Cibo e bevande
emoji-activities = Attività
emoji-travel = Viaggi e luoghi
emoji-objects = Oggetti
emoji-symbols = Simboli
emoji-flags = Bandiere
emoji-kaomoji = Kaomoji
emoji-skin-tone = Tonalità della pelle
emoji-skin-tone-default = Tonalità predefinita
emoji-skin-tone-light = Tonalità chiara
emoji-skin-tone-medium-light = Tonalità medio-chiara
emoji-skin-tone-medium = Tonalità media
emoji-skin-tone-medium-dark = Tonalità medio-scura
emoji-skin-tone-dark = Tonalità scura

## System notifications

messages-system-source = Sistema

## On-screen keyboard

osk-keyboard-settings = Impostazioni tastiera
osk-letters-key = ABC

## Media player controls

mpris-unknown-artist = Artista sconosciuto
mpris-unknown-title = Titolo sconosciuto
