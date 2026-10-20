## Displays

settings-display-mirror = Zrkadliť obrazovky
settings-display-mirror-description = Na každej obrazovke sa zobrazuje rovnaký obraz
settings-display-mirrored = Zrkadlené obrazovky
settings-display-display = Obrazovka
settings-display-apply-failed = Tieto nastavenia nefungovali. Skúste iné usporiadanie.
settings-display-reset = Obnoviť
settings-display-apply = Použiť
settings-display-arrangement-main = { $name }, hlavná obrazovka
settings-display-use = Používať túto obrazovku
settings-display-main = Hlavná obrazovka
settings-display-main-description = Zobrazuje sa tu panel úloh a nové okná
settings-display-resolution-title = Rozlíšenie
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Obnovovacia frekvencia
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Premenlivá obnovovacia frekvencia
settings-display-variable-refresh-description = Obrazovka sa prispôsobí snímkovej frekvencii hier na celej obrazovke, takže pohyb je plynulejší
settings-display-variable-refresh-off = Vypnutá
settings-display-variable-refresh-games = V hrách
settings-display-variable-refresh-fullscreen = Vo všetkých aplikáciách na celej obrazovke
settings-display-scale = Mierka
settings-display-scale-description = Zväčší alebo zmenší text, aplikácie a všetko ostatné
settings-display-orientation = Orientácia
settings-display-orientation-landscape = Na šírku
settings-display-orientation-portrait-right = Na výšku, otočené doprava
settings-display-orientation-portrait-left = Na výšku, otočené doľava
settings-display-orientation-landscape-flipped = Na šírku, prevrátené

## Display brightness

settings-display-brightness = Jas
settings-display-brightness-label = Jas obrazovky { $name }
settings-display-brightness-unsupported = Ak ho chcete meniť tu, zapnite DDC/CI v ponuke obrazovky
settings-display-brightness-unresponsive = Momentálne neodpovedá, o chvíľu sa to skúsi znova
settings-display-brightness-external = Externé obrazovky
settings-display-brightness-missing-tool = Ak chcete meniť ich jas tu, nainštalujte ddcutil
settings-display-brightness-needs-restart = Reštartujte, aby sa dokončilo nastavenie ich jasu
settings-display-brightness-no-access = Ak chcete meniť ich jas tu, odhláste sa a znova sa prihláste

## Night light

settings-display-night-light = Nočné osvetlenie
settings-display-night-light-description = Teplejšie farby večer, ktoré šetria oči
settings-display-night-light-schedule = Plán
settings-display-night-light-automatic = Od západu do východu slnka
settings-display-night-light-custom = Vlastný
settings-display-night-light-from = Zapnutie
settings-display-night-light-to = Vypnutie
settings-display-night-light-warmth = Teplota farieb

## Sound

settings-sound-output = Výstup
settings-sound-input = Vstup
settings-sound-device = Zariadenie
settings-sound-output-device = Výstupné zariadenie
settings-sound-input-device = Vstupné zariadenie
settings-sound-connection = Pripojenie
settings-sound-output-connection = Výstupné pripojenie
settings-sound-input-connection = Vstupné pripojenie
settings-sound-volume = Hlasitosť
settings-sound-mute = Stlmiť: { $name }
settings-sound-unmute = Zrušiť stlmenie: { $name }
settings-sound-balance = Vyváženie
settings-sound-balance-center = Stred
settings-sound-balance-left = { $share } vľavo
settings-sound-balance-right = { $share } vpravo
settings-sound-louder = Povoliť hlasitosť nad 100 %
settings-sound-louder-description = Pri vyššej hlasitosti môže byť zvuk skreslený
settings-sound-input-level = Úroveň vstupu
settings-sound-apps = Hlasitosť aplikácií
settings-sound-apps-playing = { $count ->
    [one] Zvuk prehráva { $count } aplikácia
    [few] Zvuk prehrávajú { $count } aplikácie
    [many] Zvuk prehráva { $count } aplikácie
   *[other] Zvuk prehráva { $count } aplikácií
}
settings-sound-app-output = Výstup zvuku aplikácie { $app }
settings-sound-profiles = Profily zariadení
settings-sound-profiles-row-description = Vyberte, ako sa má používať každé zvukové zariadenie
settings-sound-profiles-description = Ako sa používa každé zvukové zariadenie, napríklad stereo alebo priestorový zvuk
settings-sound-profile-label = Použitie zariadenia { $device }
settings-sound-profile-off = Vypnuté

## System sounds

settings-sound-system = Systémové zvuky
settings-sound-system-description = Zvuky oznámení, zariadení a iných udalostí
settings-sound-system-volume = Hlasitosť systémových zvukov
settings-sound-kind-notifications = Oznámenia
    .description = Stíšené pri zapnutom Nerušiť, v hrách a pri zdieľaní obrazovky
    .preview = Prehrať zvuk oznámenia
settings-sound-kind-devices = Zariadenia a nabíjanie
    .description = Pripojenie zariadenia alebo nabíjačky a slabá batéria
    .preview = Prehrať zvuk zariadenia
settings-sound-kind-volume = Odozva hlasitosti
    .description = Cvaknutie pri zmene hlasitosti
    .preview = Prehrať cvaknutie hlasitosti
settings-sound-kind-screenshots = Snímky obrazovky
    .description = Zvuk spúšte pri uložení snímky obrazovky
    .preview = Prehrať zvuk spúšte
settings-sound-kind-recording = Nahrávanie
    .description = Keď sa spustí alebo zastaví záznam obrazovky, kamera alebo diktovanie
    .preview = Prehrať zvuk nahrávania
settings-sound-kind-sign-in = Zvuk prihlásenia
    .description = Keď sa zobrazí pracovná plocha
    .preview = Prehrať zvuk prihlásenia
settings-sound-kind-keyboard = Ťuknutia klávesnice
    .description = Každý kláves na klávesnici na obrazovke
    .preview = Prehrať ťuknutie klávesnice

## Power and battery

settings-power-battery = Batéria
settings-power-charging = Nabíja sa
settings-power-charging-at = Nabíja sa výkonom { $power }
settings-power-charging-until-full = Nabíja sa, do úplného nabitia zostáva { $time }
settings-power-charging-at-until-full = Nabíja sa výkonom { $power }, do úplného nabitia zostáva { $time }
settings-power-on-battery = Napájanie z batérie
settings-power-on-battery-using = Napájanie z batérie, spotreba { $power }
settings-power-time-left = Zostáva približne { $time }
settings-power-time-left-using = Zostáva približne { $time }, spotreba { $power }
settings-power-full = Úplne nabitá
settings-power-empty = Vybitá
settings-power-not-charging = Pripojené, nenabíja sa
settings-power-health = Stav batérie
settings-power-capacity = { $full } z pôvodných { $design }
settings-power-cycles = { $count ->
    [one] { $cycles } nabíjací cyklus
    [few] { $cycles } nabíjacie cykly
    [many] { $cycles } nabíjacieho cyklu
   *[other] { $cycles } nabíjacích cyklov
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Zobrazovať percentá
settings-power-show-percentage-description = Zobrazí úroveň nabitia v ikone batérie

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = menej ako minúta
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minúta
    [few] { $minutes } minúty
    [many] { $minutes } minúty
   *[other] { $minutes } minút
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } hodina
    [few] { $hours } hodiny
    [many] { $hours } hodiny
   *[other] { $hours } hodín
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } hodina
    [few] { $hours } hodiny
    [many] { $hours } hodiny
   *[other] { $hours } hodín
} { $minutes ->
    [one] { $minutes } minúta
    [few] { $minutes } minúty
    [many] { $minutes } minúty
   *[other] { $minutes } minút
}
settings-power-never = Nikdy

## Charge limit

settings-power-limit = Obmedziť nabíjanie
settings-power-limit-failed = Limit sa nepodarilo zmeniť. Skúste to znova.
settings-power-limit-elsewhere-off = Iná aplikácia ho vypla, takže sa batéria nabíja úplne
settings-power-limit-elsewhere-changed = Iná aplikácia zmenila limit na { $level }
settings-power-limit-elsewhere-on = Iná aplikácia zastaví nabíjanie na { $level }
settings-power-limit-automatic = Počítač sám rozhoduje, kedy zastaviť nabíjanie
settings-power-limit-stops-at = Zastaví nabíjanie na { $level }
settings-power-limit-description = Zastaví nabíjanie skôr, aby batéria vydržala dlhšie
settings-power-limit-description-at = Zastaví na { $level }, aby batéria vydržala dlhšie
settings-power-limit-applied = Nabíjanie sa zastaví na { $level }
settings-power-limit-applied-description = Nastavené inou aplikáciou v tomto počítači

## Battery-powered devices

settings-power-devices = Zariadenia
settings-power-device-mouse = Myš
settings-power-device-keyboard = Klávesnica
settings-power-device-headphones = Slúchadlá
settings-power-device-speaker = Reproduktor
settings-power-device-controller = Ovládač
settings-power-device-phone = Telefón
settings-power-device-tablet = Tablet
settings-power-device-pen = Pero
settings-power-device-touchpad = Touchpad
settings-power-device-other = Zariadenie

## Power mode

settings-power-mode = Režim napájania
settings-power-mode-row = Režim
settings-power-profile-saver = Šetrenie energie
    .description = Pomalší, spotrebuje menej energie
settings-power-profile-balanced = Vyvážený
    .description = Štandardný výkon a spotreba
settings-power-profile-performance = Výkon
    .description = Rýchlejší, spotrebuje viac energie
settings-power-limited = Výkon je momentálne obmedzený
settings-power-limited-lap = Výkon je obmedzený, pretože počítač máte na kolenách
settings-power-limited-hot = Výkon je obmedzený, pretože počítač je príliš horúci
settings-power-limited-lap-hot = Výkon je obmedzený, pretože počítač máte na kolenách a je príliš horúci
settings-power-saver-low-battery = Šetrenie energie pri slabej batérii
settings-power-saver-low-battery-description = Keď sa batéria vybíja, prepne na šetrenie energie

## Keyboard backlight

settings-power-keyboard = Klávesnica
settings-power-backlight = Podsvietenie klávesnice
settings-power-backlight-off = Vypnuté
settings-power-backlight-low = Slabé
settings-power-backlight-medium = Stredné
settings-power-backlight-high = Silné

## Screen and sleep

settings-power-screen = Obrazovka
settings-power-screen-off = Vypnutie obrazovky
settings-power-screen-off-description = Keď počítač chvíľu nepoužívate
settings-power-dim = Stmaviť pri nečinnosti
settings-power-dim-description = Krátko pred vypnutím obrazovky zníži jas
settings-power-sleep = Spánok
settings-power-suspend-plugged-in = Uspať pri pripojení k napájaniu
settings-power-suspend-inactive = Uspať pri nečinnosti
settings-power-suspend-description = Uspí počítač, keď sa chvíľu nepoužíva
settings-power-suspend-battery = Uspať pri napájaní z batérie
settings-power-button = Tlačidlo napájania
settings-power-button-suspend = Uspať
settings-power-button-hibernate = Dlhodobý spánok
settings-power-button-ask = Opýtať sa
settings-power-button-nothing = Nerobiť nič
settings-power-long-sleep = Vypnúť po dlhom spánku
settings-power-long-sleep-description = Namiesto toho, aby sa batéria počas spánku úplne vybila, sa počítač vypne, keď je batéria slabá alebo po dlhom spánku na batérii. Otvorené okná sa nezachovajú.
settings-power-long-sleep-failed = Toto sa nepodarilo zmeniť. Skúste to znova.
settings-power-long-sleep-after = Čas do vypnutia
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } hodina
    [few] { $hours } hodiny
    [many] { $hours } hodiny
   *[other] { $hours } hodín
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } deň
    [few] { $days } dni
    [many] { $days } dňa
   *[other] { $days } dní
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } týždeň
    [few] { $weeks } týždne
    [many] { $weeks } týždňa
   *[other] { $weeks } týždňov
}

## Keyboard

settings-keyboard-sources = Zdroje vstupu
settings-keyboard-sources-description = Prvý sa používa predvolene. Počas písania medzi nimi môžete prepínať.
settings-keyboard-source-edit = Upraviť v aplikácii Keys
settings-keyboard-source-up = Posunúť nahor
settings-keyboard-source-down = Posunúť nadol
settings-keyboard-source-remove = Odstrániť
settings-keyboard-add-source-button = Pridať zdroj vstupu
settings-keyboard-own = Vlastné rozloženia a metódy vstupu
settings-keyboard-own-layout = Vytvoriť rozloženie
settings-keyboard-own-layout-description = Začnite z existujúceho rozloženia a zmeňte, čo píšu jeho klávesy
settings-keyboard-own-method = Vytvoriť metódu vstupu
settings-keyboard-own-method-description = Premení, čo píšete, na diakritiku, iné písma alebo slová na výber
settings-keyboard-own-open = Otvoriť Keys
settings-keyboard-own-open-description = Upravte rozloženia a metódy vstupu, ktoré ste vytvorili
settings-keyboard-switch-source = Prepnúť zdroj vstupu
settings-keyboard-add-source = Pridať zdroj vstupu
settings-keyboard-add-source-description = Vyberte rozloženie klávesnice alebo metódu vstupu, ktorou chcete písať.
settings-keyboard-add-source-search = Hľadať jazyky, rozloženia a metódy vstupu
settings-keyboard-input-method = Metóda vstupu
settings-keyboard-add-source-no-match = Nič nezodpovedá výrazu „{ $query }“
settings-keyboard-cancel = Zrušiť
settings-keyboard-add = Pridať
settings-keyboard-typing = Písanie
settings-keyboard-repeat = Opakovanie klávesov
settings-keyboard-repeat-description = Podržaný kláves sa píše stále znova
settings-keyboard-repeat-delay = Oneskorenie pred opakovaním
settings-keyboard-repeat-delay-shorter = Kratšie
settings-keyboard-repeat-delay-longer = Dlhšie
settings-keyboard-repeat-speed = Rýchlosť opakovania
settings-keyboard-repeat-speed-slower = Pomalšie
settings-keyboard-repeat-speed-faster = Rýchlejšie
settings-keyboard-caps-lock = Kláves Caps Lock
settings-keyboard-caps-lock-description = Čo sa stane, keď ho stlačíte
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Vymeniť s klávesom Esc
settings-keyboard-caps-lock-nothing = Nič
settings-keyboard-caps-lock-custom = Vlastné
settings-keyboard-lock-notices = Zobrazovať Caps Lock a Num Lock
settings-keyboard-lock-notices-description = Keď sa niektorý zapne alebo vypne, krátko sa to zobrazí na obrazovke
settings-keyboard-dictation-on = Zapnuté
settings-keyboard-dictation-off = Vypnuté
settings-keyboard-shortcuts-description = Zobrazte a zmeňte skratky alebo pridajte vlastné

## Copilot key

settings-keyboard-copilot = Kláves Copilot
settings-keyboard-copilot-press = Stlačenie
settings-keyboard-copilot-press-description = Čo urobí krátke stlačenie klávesu
settings-keyboard-copilot-open-start = Otvoriť ponuku Start
settings-keyboard-copilot-open-app = Otvoriť aplikáciu
settings-keyboard-copilot-nothing = Nič
settings-keyboard-copilot-app = Aplikácia
settings-keyboard-copilot-no-app = Zatiaľ nie je vybratá žiadna aplikácia
settings-keyboard-copilot-change = Zmeniť
settings-keyboard-copilot-choose = Vybrať
settings-keyboard-copilot-hold = Podržaním diktovať
settings-keyboard-copilot-hold-description = Podržte kláves a hovorte, napíše sa, čo poviete
settings-keyboard-copilot-hold-off = Funguje, keď je diktovanie zapnuté
settings-keyboard-copilot-choose-app = Vybrať aplikáciu
settings-keyboard-copilot-choose-app-description = Stlačením klávesu Copilot sa otvorí.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Shift
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Print Screen
settings-keys-page-up = Page Up
settings-keys-page-down = Page Down
settings-keys-home = Home
settings-keys-end = End
settings-keys-insert = Insert
settings-keys-delete = Delete
settings-keys-tab = Tab
settings-keys-space = Medzerník
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menu
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Zvýšiť hlasitosť
settings-keys-volume-down = Znížiť hlasitosť
settings-keys-mute = Stlmiť
settings-keys-microphone-mute = Stlmiť mikrofón
settings-keys-play = Prehrať
settings-keys-media-pause = Pozastaviť
settings-keys-stop = Zastaviť
settings-keys-next-track = Ďalšia skladba
settings-keys-previous-track = Predchádzajúca skladba
settings-keys-brightness-up = Zvýšiť jas
settings-keys-brightness-down = Znížiť jas
settings-keys-browser = Prehliadač
settings-keys-home-page = Domovská stránka
settings-keys-search = Hľadať
settings-keys-mail = Pošta
settings-keys-calculator = Kalkulačka
settings-keys-files = Súbory
settings-keys-eject = Vysunúť
settings-keys-power = Napájanie
settings-keys-lock = Zamknúť

## Keyboard shortcuts

settings-shortcuts-title = Klávesové skratky
settings-shortcuts-search = Hľadať skratky
settings-shortcuts-category-system = Systém
settings-shortcuts-category-windows = Okná
settings-shortcuts-category-workspaces = Pracovné priestory
settings-shortcuts-category-screenshots = Snímky obrazovky
settings-shortcuts-category-media = Médiá
settings-shortcuts-reset = Obnoviť predvolené
settings-shortcuts-apps = Skratky aplikácií
settings-shortcuts-apps-description = Skratky, ktoré si vyžiadali aplikácie a ktoré fungujú, aj keď aplikácia nie je v popredí
settings-shortcuts-no-match = Výrazu „{ $query }“ nezodpovedajú žiadne skratky
settings-shortcuts-change = Zmeniť skratku pre { $name }
settings-shortcuts-or = alebo
settings-shortcuts-not-set = Nenastavené
settings-shortcuts-press-keys = Stlačte požadované klávesy
settings-shortcuts-needs-modifier = Pridajte Ctrl, Alt alebo Super, aby skratka neprekážala pri písaní.
settings-shortcuts-record-description = Stlačte novú skratku. Backspace ju vypne, Esc zruší zmenu.
settings-shortcuts-record-taken = Táto skratka sa už používa pre „{ $name }“. Ak ju nahradíte, tam sa vypne.
settings-shortcuts-try-another = Skúsiť inú
settings-shortcuts-replace = Nahradiť
settings-shortcuts-cancel = Zrušiť
settings-shortcuts-custom = Vlastné skratky
settings-shortcuts-custom-description = Spustenie príkazu alebo otvorenie aplikácie kombináciou klávesov
settings-shortcuts-untitled = Bez názvu
settings-shortcuts-add = Pridať skratku
settings-shortcuts-edit = Upraviť skratku
settings-shortcuts-custom-name = Názov
settings-shortcuts-custom-command = Príkaz
settings-shortcuts-custom-shortcut = Skratka
settings-shortcuts-custom-taken = Už sa používa pre „{ $name }“. Uložením sa tam vypne.
settings-shortcuts-remove = Odstrániť
settings-shortcuts-save = Uložiť
settings-shortcuts-add-button = Pridať

## Dictation

settings-dictation-title = Diktovanie
settings-dictation-description = Podržte { $keys } a hovorte, napíše sa, čo poviete, v ľubovoľnej aplikácii. Pustením diktovanie dokončíte, klávesom Esc ho zrušíte. Všetko prebieha v tomto počítači: váš hlas ho nikdy neopustí a neukladá sa.
settings-dictation-description-no-shortcut = Na diktovanie vyberte nižšie skratku. Všetko prebieha v tomto počítači: váš hlas ho nikdy neopustí a neukladá sa.
settings-dictation-not-installed = Diktovanie nie je v tomto počítači nainštalované
settings-dictation-hold = Na diktovanie podržte { $keys }
settings-dictation-needs-shortcut = Vypnuté, kým nemá skratku
settings-dictation-copilot-key = kláves Copilot
settings-dictation-shortcut = Skratka
settings-dictation-shortcut-description = Podržte ju a hovorte, alebo ju stlačte a diktovanie bude počúvať, kým ju nestlačíte znova alebo neprestanete hovoriť
settings-dictation-shortcut-own = Vlastná skratka
settings-dictation-shortcut-another = Iná skratka…
settings-dictation-shortcut-off = Vypnuté
settings-dictation-keys = Klávesy
settings-dictation-change = Zmeniť
settings-dictation-language = Jazyk
settings-dictation-language-automatic = Automaticky
settings-dictation-language-automatic-current = Automaticky ({ $language })
settings-dictation-language-description = Automaticky sa riadi rozložením klávesnice, ktorým píšete
settings-dictation-language-unavailable = Jazyk { $language } nie je v tomto počítači k dispozícii
settings-dictation-engine = Rozpoznávanie reči
settings-dictation-engine-automatic = Automaticky
settings-dictation-engine-description = { $engine } rozpoznáva jazyk { $language }
settings-dictation-engine-graphics-card = { $engine } rozpoznáva jazyk { $language } na grafickej karte
settings-dictation-models = Rečové modely
settings-dictation-models-description = Modely sa stiahnu raz a zostanú v tomto počítači.
settings-dictation-credits = Autori
settings-dictation-credit = { $credit }. Licencia: { $licence }.
settings-dictation-learn-more = Ďalšie informácie

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Nepodarilo sa stiahnuť: { $reason }
settings-dictation-model-downloading = { $received } z { $total }
settings-dictation-model-installed = V tomto počítači: { $size }
settings-dictation-model-partial = Stiahnuté { $received } z { $total }
settings-dictation-model-size = Na stiahnutie: { $size }
settings-dictation-model-retry = Skúsiť znova
settings-dictation-model-cancel = Zrušiť
settings-dictation-model-resume = Pokračovať
settings-dictation-model-download = Stiahnuť
settings-dictation-model-remove = Odstrániť

## Mouse and touchpad

settings-mouse-mouse = Myš
settings-mouse-primary-button = Hlavné tlačidlo
settings-mouse-primary-button-description = Tlačidlo, ktorým vyberáte položky
settings-mouse-primary-button-left = Ľavé
settings-mouse-primary-button-right = Pravé
settings-mouse-speed = Rýchlosť ukazovateľa
settings-mouse-slower = Pomalšie
settings-mouse-faster = Rýchlejšie
settings-mouse-acceleration = Zrýchlenie myši
settings-mouse-acceleration-description = Pri rýchlom pohybe myšou sa ukazovateľ posunie ďalej
settings-mouse-natural-scrolling = Prirodzené posúvanie
settings-mouse-natural-scrolling-description = Posúvanie hýbe obsahom, nie zobrazením
settings-mouse-touchpad = Touchpad
settings-mouse-touchpad-speed = Rýchlosť ukazovateľa touchpadu
settings-mouse-touchpad-scroll-speed = Rýchlosť posúvania
settings-mouse-touchpad-scroll-speed-label = Rýchlosť posúvania touchpadu
settings-mouse-touchpad-tap = Ťuknutie na kliknutie
settings-mouse-touchpad-tap-description = Ťuknite na touchpad namiesto toho, aby ste ho stláčali
settings-mouse-touchpad-natural-scrolling = Prirodzené posúvanie touchpadu
settings-mouse-touchpad-natural-scrolling-description = Obsah sa posúva rovnakým smerom ako vaše prsty
settings-mouse-touchpad-scroll-with = Posúvanie
settings-mouse-touchpad-two-fingers = Dvoma prstami
settings-mouse-touchpad-scroll-edge = Okrajom
settings-mouse-touchpad-secondary-click = Sekundárne kliknutie
settings-mouse-touchpad-secondary-click-description = Ako kliknúť pravým tlačidlom bez samostatného tlačidla
settings-mouse-touchpad-click-corner = Rohom
settings-mouse-touchpad-disable-typing = Vypnúť počas písania
settings-mouse-touchpad-disable-typing-description = Aby ukazovateľ počas písania neskákal
