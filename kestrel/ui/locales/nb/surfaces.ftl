## Gust

gust-search-placeholder = Søk i apper, filer og mer
gust-search-cut = Klipp ut
gust-search-copy = Kopier
gust-search-paste = Lim inn
gust-search-select-all = Merk alt
gust-power = Strøm og økt
gust-power-close = Lukk strømalternativer
gust-account-settings = Kontoinnstillinger
gust-folder-default-name = Mappe
gust-folder-open = Åpne mappen
gust-folder-rename = Gi nytt navn
gust-folder-ungroup = Løs opp mappen
gust-open = Åpne

## Gust search results

gust-search-best-match = Beste treff
gust-search-group-apps = Apper
gust-search-group-commands = Apphandlinger
gust-search-group-windows = Åpne vinduer
gust-search-group-actions = Handlinger
gust-search-group-settings = Innstillinger
gust-search-group-clipboard = Utklippstavle
gust-search-group-emoji = Emoji
gust-search-group-files = Filer
gust-search-group-contents = Innhold i filer
gust-search-group-web = Nett
gust-search-web = Søk på nettet etter «{ $query }»
gust-search-clipboard-text = Fra utklippstavleloggen
gust-search-clipboard-keywords = utklippstavle, kopiert, kopier, utklippstavlelogg, lim inn, clipboard
gust-search-emoji-insert = Sett inn
gust-search-settings-page = Innstillinger
gust-search-settings-section = Innstillinger: { $page }
gust-search-file-reveal = Vis i { $fileManager }
gust-search-file-copy-path = Kopier bane
gust-search-conversion = { $amount } { $from } i { $to }
gust-search-calculation = { $expression }, trykk på Enter for å kopiere

## Answers in Gust's search to questions about dates and times.
## The answer itself, such as "157 days" or "17:00", is formatted for the language; these describe it.

gust-search-answer-until = Til { $date }
gust-search-answer-since = Siden { $date }
gust-search-answer-between = Mellom { $from } og { $to }
gust-search-answer-time-ahead = { $place }, { $hours ->
    [one] { $hours } time
   *[other] { $hours } timer
} foran
gust-search-answer-time-behind = { $place }, { $hours ->
    [one] { $hours } time
   *[other] { $hours } timer
} bak
gust-search-answer-time-same = { $place }, samme tid som her
gust-search-answer-converted = I { $place } når klokken er { $time } i { $from }
gust-search-answer-converted-here = Her når klokken er { $time } i { $from }
gust-search-answer-converted-from-here = I { $place } når klokken er { $time } her

## Gust search actions
## The keyword messages are comma-separated words people might type to find the action.
## They aren't shown. Keep common English terms in the translation when people would type them too.

gust-search-dark-style-on = Bytt til mørk modus
gust-search-dark-style-off = Bytt til lys modus
gust-search-dark-style-keywords = mørk modus, mørk stil, mørkt tema, lys modus, lys stil, lyst tema, dark mode, nattmodus
gust-search-night-light-on = Slå på nattlys
gust-search-night-light-off = Slå av nattlys
gust-search-night-light-keywords = nattlys, night light, night shift, blått lys, blålys, varme farger, blålysfilter
gust-search-do-not-disturb-on = Slå på Ikke forstyrr
gust-search-do-not-disturb-off = Slå av Ikke forstyrr
gust-search-do-not-disturb-keywords = ikke forstyrr, dnd, fokus, stille, demp varsler, skru av varsler, lydløs
gust-search-wifi-on = Slå på Wi-Fi
gust-search-wifi-off = Slå av Wi-Fi
gust-search-wifi-keywords = wifi, wi-fi, trådløst, trådløst nettverk, wlan, nettverk
gust-search-bluetooth-on = Slå på Bluetooth
gust-search-bluetooth-off = Slå av Bluetooth
gust-search-bluetooth-keywords = bluetooth, blåtann
gust-search-airplane-mode-on = Slå på flymodus
gust-search-airplane-mode-off = Slå av flymodus
gust-search-airplane-mode-keywords = flymodus, flightmodus, airplane mode, radioer, trådløst
gust-search-keep-awake-on = Hold våken
gust-search-keep-awake-off = Slutt å holde våken
gust-search-keep-awake-keywords = hold våken, holde våken, koffein, caffeine, hindre hvilemodus, ikke sov
gust-search-lock-keywords = lås skjermen, låseskjerm, lås datamaskinen, lås
gust-search-suspend-keywords = hvilemodus, hvile, dvale, standby, sov
gust-search-log-out-keywords = logg ut, logge ut, logg av, avslutt økten, log out, sign out
gust-search-restart-keywords = start på nytt, omstart, restart, reboot, start datamaskinen på nytt
gust-search-power-off-keywords = slå av, avslutt, skru av, slå av datamaskinen, shut down, shutdown

## Quick settings

quick-settings-lock = Lås
quick-settings-suspend = Hvilemodus
quick-settings-log-out = Logg ut
quick-settings-restart = Start på nytt
quick-settings-power-off = Slå av
quick-settings-screenshot = Skjermbilde
quick-settings-settings = Innstillinger
quick-settings-battery = Batteri
quick-settings-battery-level = { $percent }
quick-settings-battery-charging = Lader
quick-settings-battery-until-full = { $duration } til fulladet
quick-settings-battery-left = { $duration } igjen
quick-settings-battery-discharging = På batteri
quick-settings-battery-full = Fulladet
quick-settings-battery-plugged-in = Koblet til strøm
quick-settings-on = På
quick-settings-off = Av
quick-settings-show-options = Vis alternativer
quick-settings-slider-value = { $percent }
quick-settings-tile-settings = Innstillinger
quick-settings-tile-remove = Fjern
quick-settings-add = Legg til
quick-settings-reset = Tilbakestill

## Notifications

notifications-title = Varsler
notifications-clear-all = Fjern alle
notifications-clear-everything = Fjern alle varsler
notifications-lock-screen-content = Vis innholdet i varsler på låseskjermen
notifications-settings = Varslingsinnstillinger
notifications-clear-app = Fjern varsler fra { $app }
notifications-more = { $count ->
    [one] { $count } til
   *[other] { $count } til
}
notifications-show-less = Vis mindre
notifications-dismiss-notification = Lukk varselet
notifications-open = Åpne
notifications-dismiss = Lukk
notifications-send-reply = Send svar
notifications-media-previous = Forrige spor
notifications-media-next = Neste spor
notifications-media-play = Spill av
notifications-media-pause = Pause
messages-unknown-app = Ukjent app
messages-reply = Svar
messages-reply-placeholder = Skriv et svar
messages-reply-send = Send

## Calendar

calendar-previous-month = Forrige måned
calendar-next-month = Neste måned
calendar-month-week = { $month }, uke { $week }

## Clipboard history

clipboard-clear-all = Fjern alle
clipboard-image = Bilde, { $width } × { $height }
clipboard-paste = Lim inn
clipboard-copy = Kopier
clipboard-remove = Fjern

## Emoji picker

emoji-search = Søk
emoji-no-results = Ingen treff
emoji-recently-used = Nylig brukt
emoji-smileys = Smilefjes og følelser
emoji-people = Mennesker og kropp
emoji-nature = Dyr og natur
emoji-food = Mat og drikke
emoji-activities = Aktiviteter
emoji-travel = Reise og steder
emoji-objects = Gjenstander
emoji-symbols = Symboler
emoji-flags = Flagg
emoji-kaomoji = Kaomoji
emoji-skin-tone = Hudfarge
emoji-skin-tone-default = Standard hudfarge
emoji-skin-tone-light = Lys hudfarge
emoji-skin-tone-medium-light = Middels lys hudfarge
emoji-skin-tone-medium = Middels hudfarge
emoji-skin-tone-medium-dark = Middels mørk hudfarge
emoji-skin-tone-dark = Mørk hudfarge

## System notifications

messages-system-source = System

## On-screen keyboard

osk-keyboard-settings = Tastaturinnstillinger
osk-letters-key = ABC

## Media player controls

mpris-unknown-artist = Ukjent artist
mpris-unknown-title = Ukjent tittel
