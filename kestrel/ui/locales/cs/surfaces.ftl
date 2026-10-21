## Start

start-search-placeholder = Hledat aplikace, soubory a další
start-search-cut = Vyjmout
start-search-copy = Kopírovat
start-search-paste = Vložit
start-search-select-all = Vybrat vše
start-power = Napájení a relace
start-power-close = Zavřít možnosti napájení
start-account-settings = Nastavení účtu
start-apps = Aplikace
start-folder-default-name = Složka
start-folder-open = Otevřít složku
start-folder-rename = Přejmenovat
start-folder-ungroup = Zrušit seskupení
start-open = Otevřít
start-move-to-apps = Přesunout do aplikací

## Start search results

start-search-best-match = Nejlepší shoda
start-search-group-apps = Aplikace
start-search-group-commands = Akce aplikací
start-search-group-windows = Otevřená okna
start-search-group-actions = Akce
start-search-group-settings = Nastavení
start-search-group-clipboard = Schránka
start-search-group-emoji = Emoji
start-search-group-files = Soubory
start-search-group-contents = Obsah souborů
start-search-group-web = Web
start-search-web = Hledat na webu „{ $query }“
start-search-clipboard-text = Z historie schránky
start-search-clipboard-keywords = schránka, zkopírováno, zkopírované, historie schránky, vložit, clipboard
start-search-emoji-insert = Vložit
start-search-settings-page = Nastavení
start-search-settings-section = Nastavení: { $page }
start-search-file-reveal = Zobrazit v aplikaci { $fileManager }
start-search-file-copy-path = Kopírovat cestu
start-search-conversion = { $amount } { $from } na { $to }
start-search-calculation = { $expression }, zkopírujete klávesou Enter

## Answers in Start's search to questions about dates and times.
## The answer itself, such as "157 days" or "17:00", is formatted for the language; these describe it.

start-search-answer-until = Do { $date }
start-search-answer-since = Od { $date }
start-search-answer-between = Od { $from } do { $to }
start-search-answer-time-ahead = { $place }, { $hours ->
    [one] o { $hours } hodinu napřed
    [few] o { $hours } hodiny napřed
    [many] o { $hours } hodiny napřed
   *[other] o { $hours } hodin napřed
}
start-search-answer-time-behind = { $place }, { $hours ->
    [one] o { $hours } hodinu pozadu
    [few] o { $hours } hodiny pozadu
    [many] o { $hours } hodiny pozadu
   *[other] o { $hours } hodin pozadu
}
start-search-answer-time-same = { $place }, stejný čas jako tady
start-search-answer-converted = { $place }, když je { $time } ({ $from })
start-search-answer-converted-here = Tady, když je { $time } ({ $from })
start-search-answer-converted-from-here = { $place }, když je tady { $time }

## Start search actions
## The keyword messages are comma-separated words people might type to find the action.
## They aren't shown. Keep common English terms in the translation when people would type them too.

start-search-dark-style-on = Přepnout na tmavý režim
start-search-dark-style-off = Přepnout na světlý režim
start-search-dark-style-keywords = tmavý režim, tmavý motiv, světlý režim, světlý motiv, noční režim, dark mode, light mode
start-search-night-light-on = Zapnout noční světlo
start-search-night-light-off = Vypnout noční světlo
start-search-night-light-keywords = noční světlo, modré světlo, teplé barvy, filtr modrého světla, night light
start-search-do-not-disturb-on = Zapnout Nerušit
start-search-do-not-disturb-off = Vypnout Nerušit
start-search-do-not-disturb-keywords = nerušit, ticho, soustředění, ztlumit oznámení, vypnout oznámení, do not disturb, dnd
start-search-wifi-on = Zapnout Wi-Fi
start-search-wifi-off = Vypnout Wi-Fi
start-search-wifi-keywords = wifi, wi-fi, bezdrátová síť, wlan
start-search-bluetooth-on = Zapnout Bluetooth
start-search-bluetooth-off = Vypnout Bluetooth
start-search-bluetooth-keywords = bluetooth
start-search-airplane-mode-on = Zapnout režim v letadle
start-search-airplane-mode-off = Vypnout režim v letadle
start-search-airplane-mode-keywords = režim v letadle, letadlo, letový režim, bezdrátové připojení, airplane mode
start-search-keep-awake-on = Nevypínat obrazovku
start-search-keep-awake-off = Povolit vypínání obrazovky
start-search-keep-awake-keywords = nevypínat obrazovku, nevypínat, zabránit spánku, nespát, kofein, caffeine
start-search-lock-keywords = zamknout obrazovku, zamknout počítač, zamykací obrazovka, zámek
start-search-suspend-keywords = režim spánku, spánek, uspat, pohotovostní režim, sleep, standby
start-search-log-out-keywords = odhlásit se, odhlášení, ukončit relaci, log out, logout, sign out
start-search-restart-keywords = restartovat, restart, restartovat počítač, reboot
start-search-power-off-keywords = vypnout, vypnout počítač, vypnutí, shut down, shutdown

## Quick settings

quick-settings-lock = Zamknout
quick-settings-suspend = Režim spánku
quick-settings-log-out = Odhlásit se
quick-settings-restart = Restartovat
quick-settings-power-off = Vypnout
quick-settings-screenshot = Snímek obrazovky
quick-settings-settings = Nastavení
quick-settings-battery = Baterie
quick-settings-battery-level = { $percent }
quick-settings-battery-charging = Nabíjí se
quick-settings-battery-until-full = Do nabití { $duration }
quick-settings-battery-left = Zbývá { $duration }
quick-settings-battery-discharging = Na baterii
quick-settings-battery-full = Plně nabito
quick-settings-battery-plugged-in = Připojeno k napájení
quick-settings-on = Zapnuto
quick-settings-off = Vypnuto
quick-settings-show-options = Zobrazit možnosti
quick-settings-slider-value = { $percent }
quick-settings-tile-settings = Nastavení
quick-settings-tile-remove = Odebrat
quick-settings-add = Přidat
quick-settings-reset = Obnovit výchozí

## Notifications

notifications-title = Oznámení
notifications-clear-all = Vymazat vše
notifications-clear-everything = Vymazat všechna oznámení
notifications-lock-screen-content = Zobrazovat obsah zpráv na zamykací obrazovce
notifications-settings = Nastavení oznámení
notifications-clear-app = Vymazat oznámení z aplikace { $app }
notifications-more = { $count ->
    [one] { $count } další
    [few] { $count } další
    [many] { $count } dalšího
   *[other] { $count } dalších
}
notifications-show-less = Zobrazit méně
notifications-dismiss-notification = Zavřít oznámení
notifications-open = Otevřít
notifications-dismiss = Zavřít
notifications-send-reply = Odeslat odpověď
notifications-media-previous = Předchozí skladba
notifications-media-next = Další skladba
notifications-media-play = Přehrát
notifications-media-pause = Pozastavit

## Calendar

calendar-previous-month = Předchozí měsíc
calendar-next-month = Další měsíc
calendar-month-week = { $month }, { $week }. týden

## Clipboard history

clipboard-clear-all = Vymazat vše
clipboard-image = Obrázek, { $width } × { $height }
clipboard-paste = Vložit
clipboard-copy = Kopírovat
clipboard-remove = Odebrat

## Emoji picker

emoji-search = Hledat
emoji-no-results = Žádné výsledky
emoji-recently-used = Naposledy použité
emoji-smileys = Smajlíci a emoce
emoji-people = Lidé a tělo
emoji-nature = Zvířata a příroda
emoji-food = Jídlo a pití
emoji-activities = Aktivity
emoji-travel = Cestování a místa
emoji-objects = Předměty
emoji-symbols = Symboly
emoji-flags = Vlajky
emoji-kaomoji = Kaomoji
emoji-skin-tone = Odstín pleti
emoji-skin-tone-default = Výchozí odstín pleti
emoji-skin-tone-light = Světlý odstín pleti
emoji-skin-tone-medium-light = Středně světlý odstín pleti
emoji-skin-tone-medium = Střední odstín pleti
emoji-skin-tone-medium-dark = Středně tmavý odstín pleti
emoji-skin-tone-dark = Tmavý odstín pleti
