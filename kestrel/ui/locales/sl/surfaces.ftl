## Start

start-search-placeholder = Iščite aplikacije, datoteke in drugo
start-search-cut = Izreži
start-search-copy = Kopiraj
start-search-paste = Prilepi
start-search-select-all = Izberi vse
start-power = Napajanje in seja
start-power-close = Zapri možnosti napajanja
start-account-settings = Nastavitve računa
start-apps = Aplikacije
start-folder-default-name = Mapa
start-folder-open = Odpri mapo
start-folder-rename = Preimenuj
start-folder-ungroup = Razdruži aplikacije
start-open = Odpri
start-move-to-apps = Premakni med aplikacije

## Start search results

start-search-best-match = Najboljše ujemanje
start-search-group-apps = Aplikacije
start-search-group-commands = Dejanja aplikacij
start-search-group-windows = Odprta okna
start-search-group-actions = Dejanja
start-search-group-settings = Nastavitve
start-search-group-clipboard = Odložišče
start-search-group-emoji = Emodžiji
start-search-group-files = Datoteke
start-search-group-contents = V datotekah
start-search-group-web = Splet
start-search-web = Išči „{ $query }“ v spletu
start-search-clipboard-text = Iz zgodovine odložišča
start-search-clipboard-keywords = odložišče, kopirano, zgodovina odložišča, prilepi, lepljenje, clipboard
start-search-emoji-insert = Vstavi
start-search-settings-page = Nastavitve
start-search-settings-section = Nastavitve – { $page }
start-search-file-reveal = Pokaži v aplikaciji { $fileManager }
start-search-file-copy-path = Kopiraj pot
start-search-conversion = { $amount } { $from } v { $to }
start-search-calculation = { $expression }, pritisnite Enter za kopiranje

## Answers in Start's search to questions about dates and times.
## The answer itself, such as "157 days" or "17:00", is formatted for the language; these describe it.

start-search-answer-until = Do datuma { $date }
start-search-answer-since = Od datuma { $date }
start-search-answer-between = Med datumoma { $from } in { $to }
start-search-answer-time-ahead = { $place }, { $hours ->
    [one] { $hours } ura naprej
    [two] { $hours } uri naprej
    [few] { $hours } ure naprej
   *[other] { $hours } ur naprej
}
start-search-answer-time-behind = { $place }, { $hours ->
    [one] { $hours } ura zadaj
    [two] { $hours } uri zadaj
    [few] { $hours } ure zadaj
   *[other] { $hours } ur zadaj
}
start-search-answer-time-same = { $place }, enak čas kot tukaj
start-search-answer-converted = { $place }, ko je { $time } ({ $from })
start-search-answer-converted-here = Tukaj, ko je { $time } ({ $from })
start-search-answer-converted-from-here = { $place }, ko je tukaj { $time }

## Start search actions
## The keyword messages are comma-separated words people might type to find the action.
## They aren't shown. Keep common English terms in the translation when people would type them too.

start-search-dark-style-on = Preklopi na temni način
start-search-dark-style-off = Preklopi na svetli način
start-search-dark-style-keywords = temni način, temna tema, temno, svetli način, svetla tema, svetlo, dark mode, dark theme, light mode
start-search-night-light-on = Vklopi nočno svetlobo
start-search-night-light-off = Izklopi nočno svetlobo
start-search-night-light-keywords = nočna svetloba, nočni način, modra svetloba, tople barve, night light
start-search-do-not-disturb-on = Vklopi Ne moti
start-search-do-not-disturb-off = Izklopi Ne moti
start-search-do-not-disturb-keywords = ne moti, osredotočenost, tiho, utišaj obvestila, izklopi obvestila, do not disturb, dnd
start-search-wifi-on = Vklopi Wi-Fi
start-search-wifi-off = Izklopi Wi-Fi
start-search-wifi-keywords = wifi, wi-fi, brezžično omrežje, brezžično, wlan
start-search-bluetooth-on = Vklopi Bluetooth
start-search-bluetooth-off = Izklopi Bluetooth
start-search-bluetooth-keywords = bluetooth
start-search-airplane-mode-on = Vklopi način za letalo
start-search-airplane-mode-off = Izklopi način za letalo
start-search-airplane-mode-keywords = način za letalo, letalski način, letalo, radijski oddajniki, airplane mode
start-search-keep-awake-on = Ohrani budnost
start-search-keep-awake-off = Izklopi ohranjanje budnosti
start-search-keep-awake-keywords = ohrani budnost, budnost, prepreči spanje, ne zaspi, kofein, caffeine
start-search-lock-keywords = zakleni zaslon, zaklepanje, zakleni računalnik
start-search-suspend-keywords = spanje, stanje spanja, pripravljenost, sleep
start-search-log-out-keywords = odjava, odjavi se, končaj sejo, izpis, log out, sign out
start-search-restart-keywords = vnovični zagon, znova zaženi, ponovni zagon, restart, reboot
start-search-power-off-keywords = zaustavitev sistema, izklop, izklopi računalnik, ugasni, shut down

## Quick settings

quick-settings-lock = Zakleni
quick-settings-suspend = Spanje
quick-settings-log-out = Odjava
quick-settings-restart = Vnovični zagon
quick-settings-power-off = Zaustavitev sistema
quick-settings-screenshot = Posnetek zaslona
quick-settings-settings = Nastavitve
quick-settings-battery = Baterija
quick-settings-battery-level = { $percent }
quick-settings-battery-charging = Polnjenje
quick-settings-battery-until-full = { $duration } do napolnjenosti
quick-settings-battery-left = Preostalo še { $duration }
quick-settings-battery-discharging = Na bateriji
quick-settings-battery-full = Popolnoma napolnjena
quick-settings-battery-plugged-in = Priključeno na napajanje
quick-settings-on = Vklopljeno
quick-settings-off = Izklopljeno
quick-settings-show-options = Pokaži možnosti
quick-settings-slider-value = { $percent }
quick-settings-tile-settings = Nastavitve
quick-settings-tile-remove = Odstrani
quick-settings-add = Dodaj
quick-settings-reset = Ponastavi

## Notifications

notifications-title = Obvestila
notifications-clear-all = Počisti vse
notifications-clear-everything = Počisti vsa obvestila
notifications-lock-screen-content = Pokaži vsebino sporočil na zaklenjenem zaslonu
notifications-settings = Nastavitve obvestil
notifications-clear-app = Počisti obvestila aplikacije { $app }
notifications-more = { $count ->
    [one] Še { $count }
    [two] Še { $count }
    [few] Še { $count }
   *[other] Še { $count }
}
notifications-show-less = Pokaži manj
notifications-dismiss-notification = Opusti obvestilo
notifications-open = Odpri
notifications-dismiss = Opusti
notifications-send-reply = Pošlji odgovor
notifications-media-previous = Prejšnja skladba
notifications-media-next = Naslednja skladba
notifications-media-play = Predvajaj
notifications-media-pause = Začasno ustavi
messages-unknown-app = Neznana aplikacija
messages-reply = Odgovori
messages-reply-placeholder = Napišite odgovor
messages-reply-send = Pošlji

## Calendar

calendar-previous-month = Prejšnji mesec
calendar-next-month = Naslednji mesec
calendar-month-week = { $month }, teden { $week }

## Clipboard history

clipboard-clear-all = Počisti vse
clipboard-image = Slika, { $width } × { $height }
clipboard-paste = Prilepi
clipboard-copy = Kopiraj
clipboard-remove = Odstrani

## Emoji picker

emoji-search = Iskanje
emoji-no-results = Ni zadetkov
emoji-recently-used = Nedavno uporabljeni
emoji-smileys = Smeški in čustva
emoji-people = Ljudje in telo
emoji-nature = Živali in narava
emoji-food = Hrana in pijača
emoji-activities = Dejavnosti
emoji-travel = Potovanja in kraji
emoji-objects = Predmeti
emoji-symbols = Simboli
emoji-flags = Zastave
emoji-kaomoji = Kaomoji
emoji-skin-tone = Barva kože
emoji-skin-tone-default = Privzeta barva kože
emoji-skin-tone-light = Svetla barva kože
emoji-skin-tone-medium-light = Srednje svetla barva kože
emoji-skin-tone-medium = Srednja barva kože
emoji-skin-tone-medium-dark = Srednje temna barva kože
emoji-skin-tone-dark = Temna barva kože

## System notifications

messages-system-source = Sistem

## On-screen keyboard

osk-keyboard-settings = Nastavitve tipkovnice
osk-letters-key = ABC

## Media player controls

mpris-unknown-artist = Neznan izvajalec
mpris-unknown-title = Neznan naslov
