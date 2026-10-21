## Start

start-search-placeholder = Pretražite aplikacije, datoteke i drugo
start-search-cut = Iseci
start-search-copy = Kopiraj
start-search-paste = Nalepi
start-search-select-all = Izaberi sve
start-power = Napajanje i sesija
start-power-close = Zatvori opcije napajanja
start-account-settings = Podešavanja naloga
start-apps = Aplikacije
start-folder-default-name = Fascikla
start-folder-open = Otvori fasciklu
start-folder-rename = Preimenuj
start-folder-ungroup = Razgrupiši aplikacije
start-open = Otvori
start-move-to-apps = Premesti u Aplikacije

## Start search results

start-search-best-match = Najbolje podudaranje
start-search-group-apps = Aplikacije
start-search-group-commands = Radnje aplikacija
start-search-group-windows = Otvoreni prozori
start-search-group-actions = Radnje
start-search-group-settings = Podešavanja
start-search-group-clipboard = Ostava
start-search-group-emoji = Emodži
start-search-group-files = Datoteke
start-search-group-contents = U datotekama
start-search-group-web = Veb
start-search-web = Pretraži „{ $query }“ na vebu
start-search-clipboard-text = Iz istorije ostave
start-search-clipboard-keywords = ostava, kopirano, istorija ostave, nalepi, klipbord, clipboard
start-search-emoji-insert = Umetni
start-search-settings-page = Podešavanja
start-search-settings-section = Podešavanja: { $page }
start-search-file-reveal = Prikaži u aplikaciji { $fileManager }
start-search-file-copy-path = Kopiraj putanju
start-search-conversion = { $amount } { $from } u { $to }
start-search-calculation = { $expression }, pritisnite Enter da biste kopirali

## Answers in Start's search to questions about dates and times.
## The answer itself, such as "157 days" or "17:00", is formatted for the language; these describe it.

start-search-answer-until = Do { $date }
start-search-answer-since = Od { $date }
start-search-answer-between = Od { $from } do { $to }
start-search-answer-time-ahead = { $place }, { $hours ->
    [one] { $hours } sat
    [few] { $hours } sata
   *[other] { $hours } sati
} ispred
start-search-answer-time-behind = { $place }, { $hours ->
    [one] { $hours } sat
    [few] { $hours } sata
   *[other] { $hours } sati
} iza
start-search-answer-time-same = { $place }, isto vreme kao ovde
start-search-answer-converted = { $place }, kad je { $time } u gradu { $from }
start-search-answer-converted-here = Ovde, kad je { $time } u gradu { $from }
start-search-answer-converted-from-here = { $place }, kad je ovde { $time }

## Start search actions
## The keyword messages are comma-separated words people might type to find the action.
## They aren't shown. Keep common English terms in the translation when people would type them too.

start-search-dark-style-on = Pređi na tamni režim
start-search-dark-style-off = Pređi na svetli režim
start-search-dark-style-keywords = tamni režim, tamna tema, tamno, svetli režim, svetla tema, svetlo, dark mode, light mode
start-search-night-light-on = Uključi noćno svetlo
start-search-night-light-off = Isključi noćno svetlo
start-search-night-light-keywords = noćno svetlo, noćni režim, plavo svetlo, tople boje, night light
start-search-do-not-disturb-on = Uključi Ne uznemiravaj
start-search-do-not-disturb-off = Isključi Ne uznemiravaj
start-search-do-not-disturb-keywords = ne uznemiravaj, fokus, tišina, utišaj obaveštenja, isključi obaveštenja, dnd, do not disturb
start-search-wifi-on = Uključi Wi-Fi
start-search-wifi-off = Isključi Wi-Fi
start-search-wifi-keywords = wifi, wi-fi, bežična mreža, bežično, wlan
start-search-bluetooth-on = Uključi Bluetooth
start-search-bluetooth-off = Isključi Bluetooth
start-search-bluetooth-keywords = bluetooth, blutut
start-search-airplane-mode-on = Uključi režim rada u avionu
start-search-airplane-mode-off = Isključi režim rada u avionu
start-search-airplane-mode-keywords = režim rada u avionu, avion, režim leta, radio, airplane mode
start-search-keep-awake-on = Drži budnim
start-search-keep-awake-off = Ne drži budnim
start-search-keep-awake-keywords = drži budnim, ostani budan, bez spavanja, spreči spavanje, kofein, caffeine
start-search-lock-keywords = zaključaj ekran, zaključavanje, zaključaj računar
start-search-suspend-keywords = spavanje, stanje spavanja, pripravnost, sleep
start-search-log-out-keywords = odjava, odjavi se, završi sesiju, log out
start-search-restart-keywords = ponovo pokreni, restart, ponovo pokreni računar, reboot
start-search-power-off-keywords = isključi, ugasi, gašenje, isključi računar, shutdown

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
