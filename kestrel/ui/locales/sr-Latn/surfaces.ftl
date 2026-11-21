## Gust

gust-search-placeholder = Pretražite aplikacije, datoteke i drugo
gust-search-cut = Iseci
gust-search-copy = Kopiraj
gust-search-paste = Nalepi
gust-search-select-all = Izaberi sve
gust-power = Napajanje i sesija
gust-power-close = Zatvori opcije napajanja
gust-account-settings = Podešavanja naloga
gust-folder-default-name = Fascikla
gust-folder-open = Otvori fasciklu
gust-folder-rename = Preimenuj
gust-folder-ungroup = Razgrupiši aplikacije
gust-open = Otvori

## Gust search results

gust-search-best-match = Najbolje podudaranje
gust-search-group-apps = Aplikacije
gust-search-group-commands = Radnje aplikacija
gust-search-group-windows = Otvoreni prozori
gust-search-group-actions = Radnje
gust-search-group-settings = Podešavanja
gust-search-group-clipboard = Ostava
gust-search-group-emoji = Emodži
gust-search-group-files = Datoteke
gust-search-group-contents = U datotekama
gust-search-group-web = Veb
gust-search-web = Pretraži „{ $query }“ na vebu
gust-search-clipboard-text = Iz istorije ostave
gust-search-clipboard-keywords = ostava, kopirano, istorija ostave, nalepi, klipbord, clipboard
gust-search-emoji-insert = Umetni
gust-search-settings-page = Podešavanja
gust-search-settings-section = Podešavanja: { $page }
gust-search-file-reveal = Prikaži u aplikaciji { $fileManager }
gust-search-file-copy-path = Kopiraj putanju
gust-search-conversion = { $amount } { $from } u { $to }
gust-search-calculation = { $expression }, pritisnite Enter da biste kopirali

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
gust-search-answer-time-same = { $place }, isto vreme kao ovde
gust-search-answer-converted = { $place }, kad je { $time } u gradu { $from }
gust-search-answer-converted-here = Ovde, kad je { $time } u gradu { $from }
gust-search-answer-converted-from-here = { $place }, kad je ovde { $time }

## Gust search actions
## The keyword messages are comma-separated words people might type to find the action.
## They aren't shown. Keep common English terms in the translation when people would type them too.

gust-search-dark-style-on = Pređi na tamni režim
gust-search-dark-style-off = Pređi na svetli režim
gust-search-dark-style-keywords = tamni režim, tamna tema, tamno, svetli režim, svetla tema, svetlo, dark mode, light mode
gust-search-night-light-on = Uključi noćno svetlo
gust-search-night-light-off = Isključi noćno svetlo
gust-search-night-light-keywords = noćno svetlo, noćni režim, plavo svetlo, tople boje, night light
gust-search-do-not-disturb-on = Uključi Ne uznemiravaj
gust-search-do-not-disturb-off = Isključi Ne uznemiravaj
gust-search-do-not-disturb-keywords = ne uznemiravaj, fokus, tišina, utišaj obaveštenja, isključi obaveštenja, dnd, do not disturb
gust-search-wifi-on = Uključi Wi-Fi
gust-search-wifi-off = Isključi Wi-Fi
gust-search-wifi-keywords = wifi, wi-fi, bežična mreža, bežično, wlan
gust-search-bluetooth-on = Uključi Bluetooth
gust-search-bluetooth-off = Isključi Bluetooth
gust-search-bluetooth-keywords = bluetooth, blutut
gust-search-airplane-mode-on = Uključi režim rada u avionu
gust-search-airplane-mode-off = Isključi režim rada u avionu
gust-search-airplane-mode-keywords = režim rada u avionu, avion, režim leta, radio, airplane mode
gust-search-keep-awake-on = Drži budnim
gust-search-keep-awake-off = Ne drži budnim
gust-search-keep-awake-keywords = drži budnim, ostani budan, bez spavanja, spreči spavanje, kofein, caffeine
gust-search-lock-keywords = zaključaj ekran, zaključavanje, zaključaj računar
gust-search-suspend-keywords = spavanje, stanje spavanja, pripravnost, sleep
gust-search-log-out-keywords = odjava, odjavi se, završi sesiju, log out
gust-search-restart-keywords = ponovo pokreni, restart, ponovo pokreni računar, reboot
gust-search-power-off-keywords = isključi, ugasi, gašenje, isključi računar, shutdown

## Quick settings

quick-settings-lock = Zaključaj
quick-settings-suspend = Spavanje
quick-settings-log-out = Odjava
quick-settings-restart = Ponovo pokreni
quick-settings-power-off = Isključi
quick-settings-screenshot = Snimak ekrana
quick-settings-settings = Podešavanja
quick-settings-battery = Baterija
quick-settings-battery-level = { $percent }
quick-settings-battery-charging = Puni se
quick-settings-battery-until-full = { $duration } do kraja punjenja
quick-settings-battery-left = Preostalo { $duration }
quick-settings-battery-discharging = Na bateriji
quick-settings-battery-full = Potpuno napunjena
quick-settings-battery-plugged-in = Priključena na napajanje
quick-settings-on = Uključeno
quick-settings-off = Isključeno
quick-settings-show-options = Prikaži opcije
quick-settings-slider-value = { $percent }
quick-settings-tile-settings = Podešavanja
quick-settings-tile-remove = Ukloni
quick-settings-add = Dodaj
quick-settings-reset = Vrati na početno

## Notifications

notifications-title = Obaveštenja
notifications-clear-all = Obriši sve
notifications-clear-everything = Obriši sva obaveštenja
notifications-lock-screen-content = Prikaži sadržaj poruka na zaključanom ekranu
notifications-settings = Podešavanja obaveštenja
notifications-clear-app = Obriši obaveštenja aplikacije { $app }
notifications-more = { $count ->
    [one] Još { $count }
    [few] Još { $count }
   *[other] Još { $count }
}
notifications-show-less = Prikaži manje
notifications-dismiss-notification = Odbaci obaveštenje
notifications-open = Otvori
notifications-dismiss = Odbaci
notifications-send-reply = Pošalji odgovor
notifications-media-previous = Prethodna numera
notifications-media-next = Sledeća numera
notifications-media-play = Pusti
notifications-media-pause = Pauziraj
messages-unknown-app = Nepoznata aplikacija
messages-reply = Odgovori
messages-reply-placeholder = Napišite odgovor
messages-reply-send = Pošalji

## Calendar

calendar-previous-month = Prethodni mesec
calendar-next-month = Sledeći mesec
calendar-month-week = { $month }, { $week }. nedelja

## Clipboard history

clipboard-clear-all = Obriši sve
clipboard-image = Slika, { $width } × { $height }
clipboard-paste = Nalepi
clipboard-copy = Kopiraj
clipboard-remove = Ukloni

## Emoji picker

emoji-search = Pretraga
emoji-no-results = Nema rezultata
emoji-recently-used = Nedavno korišćeno
emoji-smileys = Smajliji i emocije
emoji-people = Ljudi i telo
emoji-nature = Životinje i priroda
emoji-food = Hrana i piće
emoji-activities = Aktivnosti
emoji-travel = Putovanja i mesta
emoji-objects = Predmeti
emoji-symbols = Simboli
emoji-flags = Zastave
emoji-kaomoji = Kaomodži
emoji-skin-tone = Boja kože
emoji-skin-tone-default = Podrazumevana boja kože
emoji-skin-tone-light = Svetla boja kože
emoji-skin-tone-medium-light = Srednje svetla boja kože
emoji-skin-tone-medium = Srednja boja kože
emoji-skin-tone-medium-dark = Srednje tamna boja kože
emoji-skin-tone-dark = Tamna boja kože

## System notifications

messages-system-source = Sistem

## On-screen keyboard

osk-keyboard-settings = Podešavanja tastature
osk-letters-key = ABV

## Media player controls

mpris-unknown-artist = Nepoznat izvođač
mpris-unknown-title = Nepoznat naslov
