## Gust

gust-search-placeholder = Pretražite aplikacije, datoteke i drugo
gust-search-cut = Izreži
gust-search-copy = Kopiraj
gust-search-paste = Zalijepi
gust-search-select-all = Odaberi sve
gust-power = Napajanje i sesija
gust-power-close = Zatvori mogućnosti napajanja
gust-account-settings = Postavke računa
gust-folder-default-name = Mapa
gust-folder-open = Otvori mapu
gust-folder-rename = Preimenuj
gust-folder-ungroup = Razgrupiraj aplikacije
gust-open = Otvori

## Gust search results

gust-search-best-match = Najbolji rezultat
gust-search-group-apps = Aplikacije
gust-search-group-commands = Radnje aplikacija
gust-search-group-windows = Otvoreni prozori
gust-search-group-actions = Radnje
gust-search-group-settings = Postavke
gust-search-group-clipboard = Međuspremnik
gust-search-group-emoji = Emotikoni
gust-search-group-files = Datoteke
gust-search-group-contents = U datotekama
gust-search-group-web = Web
gust-search-web = Pretraži „{ $query }“ na webu
gust-search-clipboard-text = Iz povijesti međuspremnika
gust-search-clipboard-keywords = međuspremnik, kopirano, povijest međuspremnika, zalijepi, clipboard
gust-search-emoji-insert = Umetni
gust-search-settings-page = Postavke
gust-search-settings-section = Postavke: { $page }
gust-search-file-reveal = Prikaži u aplikaciji { $fileManager }
gust-search-file-copy-path = Kopiraj putanju
gust-search-conversion = { $amount } { $from } u { $to }
gust-search-calculation = { $expression }, pritisnite Enter za kopiranje

## Answers in Gust's search to questions about dates and times.
## The answer itself, such as "157 days" or "17:00", is formatted for the language; these describe it.

gust-search-answer-until = Do { $date }
gust-search-answer-since = Od { $date }
gust-search-answer-between = Od { $from } do { $to }
gust-search-answer-time-ahead = { $place }, { $hours ->
    [one] { $hours } sat
    [few] { $hours } sata
   *[other] { $hours } sati
} ispred
gust-search-answer-time-behind = { $place }, { $hours ->
    [one] { $hours } sat
    [few] { $hours } sata
   *[other] { $hours } sati
} iza
gust-search-answer-time-same = { $place }, isto vrijeme kao ovdje
gust-search-answer-converted = { $place }, kad je { $time } u gradu { $from }
gust-search-answer-converted-here = Ovdje, kad je { $time } u gradu { $from }
gust-search-answer-converted-from-here = { $place }, kad je ovdje { $time }

## Gust search actions
## The keyword messages are comma-separated words people might type to find the action.
## They aren't shown. Keep common English terms in the translation when people would type them too.

gust-search-dark-style-on = Prebaci na tamni način rada
gust-search-dark-style-off = Prebaci na svijetli način rada
gust-search-dark-style-keywords = tamni način rada, tamni način, tamna tema, tamno, svijetli način rada, svijetli način, svijetla tema, svijetlo, dark mode, light mode
gust-search-night-light-on = Uključi noćno svjetlo
gust-search-night-light-off = Isključi noćno svjetlo
gust-search-night-light-keywords = noćno svjetlo, plavo svjetlo, tople boje, toplije boje, night light
gust-search-do-not-disturb-on = Uključi Ne ometaj
gust-search-do-not-disturb-off = Isključi Ne ometaj
gust-search-do-not-disturb-keywords = ne ometaj, dnd, fokus, tišina, tiho, utišaj obavijesti, isključi obavijesti
gust-search-wifi-on = Uključi Wi-Fi
gust-search-wifi-off = Isključi Wi-Fi
gust-search-wifi-keywords = wifi, wi-fi, bežična mreža, bežično, wlan
gust-search-bluetooth-on = Uključi Bluetooth
gust-search-bluetooth-off = Isključi Bluetooth
gust-search-bluetooth-keywords = bluetooth
gust-search-airplane-mode-on = Uključi način rada u zrakoplovu
gust-search-airplane-mode-off = Isključi način rada u zrakoplovu
gust-search-airplane-mode-keywords = način rada u zrakoplovu, zrakoplov, avion, način leta, radio, airplane mode
gust-search-keep-awake-on = Drži budnim
gust-search-keep-awake-off = Prestani držati budnim
gust-search-keep-awake-keywords = drži budnim, budno, ne spavaj, spriječi mirovanje, kofein, caffeine
gust-search-lock-keywords = zaključaj zaslon, zaključaj računalo, zaključavanje
gust-search-suspend-keywords = mirovanje, stanje mirovanja, spavanje, sleep, standby
gust-search-log-out-keywords = odjava, odjavi se, završi sesiju, log out, sign out
gust-search-restart-keywords = ponovno pokretanje, ponovno pokreni računalo, restart, reboot
gust-search-power-off-keywords = isključi, isključi računalo, gašenje, ugasi računalo, shut down

## Quick settings

quick-settings-lock = Zaključaj
quick-settings-suspend = Mirovanje
quick-settings-log-out = Odjava
quick-settings-restart = Ponovno pokreni
quick-settings-power-off = Isključi
quick-settings-screenshot = Snimka zaslona
quick-settings-settings = Postavke
quick-settings-battery = Baterija
quick-settings-battery-level = { $percent }
quick-settings-battery-charging = Puni se
quick-settings-battery-until-full = { $duration } do punog kapaciteta
quick-settings-battery-left = Preostalo { $duration }
quick-settings-battery-discharging = Na bateriji
quick-settings-battery-full = Potpuno napunjena
quick-settings-battery-plugged-in = Priključeno napajanje
quick-settings-on = Uključeno
quick-settings-off = Isključeno
quick-settings-show-options = Prikaži mogućnosti
quick-settings-slider-value = { $percent }
quick-settings-tile-settings = Postavke
quick-settings-tile-remove = Ukloni
quick-settings-add = Dodaj
quick-settings-reset = Vrati zadano

## Notifications

notifications-title = Obavijesti
notifications-clear-all = Očisti sve
notifications-clear-everything = Očisti sve obavijesti
notifications-lock-screen-content = Prikaži sadržaj poruka na zaključanom zaslonu
notifications-settings = Postavke obavijesti
notifications-clear-app = Očisti obavijesti aplikacije { $app }
notifications-more = { $count ->
    [one] Još { $count }
    [few] Još { $count }
   *[other] Još { $count }
}
notifications-show-less = Prikaži manje
notifications-dismiss-notification = Odbaci obavijest
notifications-open = Otvori
notifications-dismiss = Odbaci
notifications-send-reply = Pošalji odgovor
notifications-media-previous = Prethodna pjesma
notifications-media-next = Sljedeća pjesma
notifications-media-play = Reproduciraj
notifications-media-pause = Pauziraj
messages-unknown-app = Nepoznata aplikacija
messages-reply = Odgovori
messages-reply-placeholder = Napišite odgovor
messages-reply-send = Pošalji

## Calendar

calendar-previous-month = Prethodni mjesec
calendar-next-month = Sljedeći mjesec
calendar-month-week = { $month }, { $week }. tjedan

## Clipboard history

clipboard-clear-all = Očisti sve
clipboard-image = Slika, { $width } × { $height }
clipboard-paste = Zalijepi
clipboard-copy = Kopiraj
clipboard-remove = Ukloni

## Emoji picker

emoji-search = Pretraži
emoji-no-results = Nema rezultata
emoji-recently-used = Nedavno korišteno
emoji-smileys = Smajlići i emocije
emoji-people = Ljudi i tijelo
emoji-nature = Životinje i priroda
emoji-food = Hrana i piće
emoji-activities = Aktivnosti
emoji-travel = Putovanja i mjesta
emoji-objects = Predmeti
emoji-symbols = Simboli
emoji-flags = Zastave
emoji-kaomoji = Kaomoji
emoji-skin-tone = Boja kože
emoji-skin-tone-default = Zadana boja kože
emoji-skin-tone-light = Svijetla boja kože
emoji-skin-tone-medium-light = Srednje svijetla boja kože
emoji-skin-tone-medium = Srednja boja kože
emoji-skin-tone-medium-dark = Srednje tamna boja kože
emoji-skin-tone-dark = Tamna boja kože

## System notifications

messages-system-source = Sustav

## On-screen keyboard

osk-keyboard-settings = Postavke tipkovnice
osk-letters-key = ABC

## Media player controls

mpris-unknown-artist = Nepoznati izvođač
mpris-unknown-title = Nepoznat naslov
