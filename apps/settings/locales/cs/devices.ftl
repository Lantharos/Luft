## Displays

settings-display-mirror = Zrcadlit displeje
settings-display-mirror-description = Na všech displejích se zobrazuje stejný obraz
settings-display-mirrored = Zrcadlené displeje
settings-display-display = Displej
settings-display-apply-failed = Toto nastavení nefungovalo. Zkuste jiné uspořádání.
settings-display-reset = Obnovit
settings-display-apply = Použít
settings-display-arrangement-main = { $name }, hlavní displej
settings-display-use = Používat tento displej
settings-display-main = Hlavní displej
settings-display-main-description = Zobrazuje se tu hlavní panel a nová okna
settings-display-resolution-title = Rozlišení
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Obnovovací frekvence
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Proměnlivá obnovovací frekvence
settings-display-variable-refresh-description = Displej se přizpůsobí snímkové frekvenci her na celé obrazovce, takže pohyb je plynulejší
settings-display-variable-refresh-off = Vypnuto
settings-display-variable-refresh-games = Ve hrách
settings-display-variable-refresh-fullscreen = Ve všech aplikacích na celé obrazovce
settings-display-scale = Měřítko
settings-display-scale-description = Zvětší nebo zmenší text, aplikace a vše ostatní
settings-display-orientation = Orientace
settings-display-orientation-landscape = Na šířku
settings-display-orientation-portrait-right = Na výšku, doprava
settings-display-orientation-portrait-left = Na výšku, doleva
settings-display-orientation-landscape-flipped = Na šířku, otočeno

## Display brightness

settings-display-brightness = Jas
settings-display-brightness-label = Jas displeje { $name }
settings-display-brightness-unsupported = Pokud ho chcete měnit tady, zapněte DDC/CI v nabídce displeje
settings-display-brightness-unresponsive = Momentálně nereaguje, brzy se to zkusí znovu
settings-display-brightness-external = Externí displeje
settings-display-brightness-missing-tool = Pokud chcete měnit jejich jas tady, nainstalujte ddcutil
settings-display-brightness-needs-restart = Nastavení jejich jasu dokončíte restartováním
settings-display-brightness-no-access = Pokud chcete měnit jejich jas tady, odhlaste se a znovu se přihlaste

## Night light

settings-display-night-light = Noční světlo
settings-display-night-light-description = Večer teplejší barvy, které šetří oči
settings-display-night-light-schedule = Plán
settings-display-night-light-automatic = Od západu do východu slunce
settings-display-night-light-custom = Vlastní
settings-display-night-light-from = Zapnutí
settings-display-night-light-to = Vypnutí
settings-display-night-light-warmth = Teplota barev

## Sound

settings-sound-output = Výstup
settings-sound-input = Vstup
settings-sound-device = Zařízení
settings-sound-output-device = Výstupní zařízení
settings-sound-input-device = Vstupní zařízení
settings-sound-connection = Připojení
settings-sound-output-connection = Výstupní připojení
settings-sound-input-connection = Vstupní připojení
settings-sound-volume = Hlasitost
settings-sound-mute = Ztlumit: { $name }
settings-sound-unmute = Zrušit ztlumení: { $name }
settings-sound-balance = Vyvážení
settings-sound-balance-center = Uprostřed
settings-sound-balance-left = { $share } vlevo
settings-sound-balance-right = { $share } vpravo
settings-sound-louder = Povolit hlasitost nad 100 %
settings-sound-louder-description = Při vyšší hlasitosti může být zvuk zkreslený
settings-sound-input-level = Úroveň vstupu
settings-sound-apps = Hlasitost aplikací
settings-sound-apps-playing = { $count ->
    [one] Zvuk přehrává { $count } aplikace
    [few] Zvuk přehrávají { $count } aplikace
    [many] Zvuk přehrává { $count } aplikace
   *[other] Zvuk přehrává { $count } aplikací
}
settings-sound-app-output = Výstup pro { $app }
settings-sound-profiles = Profily zařízení
settings-sound-profiles-row-description = Zvolte, jak se má každé zvukové zařízení používat
settings-sound-profiles-description = Jak se každé zvukové zařízení používá, například stereo nebo prostorový zvuk
settings-sound-profile-label = Použití zařízení { $device }
settings-sound-profile-off = Vypnuto

## System sounds

settings-sound-system = Systémové zvuky
settings-sound-system-description = Zvuky oznámení, zařízení a dalších událostí
settings-sound-system-volume = Hlasitost systémových zvuků
settings-sound-kind-notifications = Oznámení
    .description = Ztlumeno při režimu Nerušit, hraní her a sdílení obrazovky
    .preview = Přehrát zvuk oznámení
settings-sound-kind-devices = Zařízení a nabíjení
    .description = Připojení zařízení nebo nabíječky a slabá baterie
    .preview = Přehrát zvuk zařízení
settings-sound-kind-volume = Odezva hlasitosti
    .description = Cvaknutí při změně hlasitosti
    .preview = Přehrát cvaknutí hlasitosti
settings-sound-kind-screenshots = Snímky obrazovky
    .description = Zvuk závěrky při uložení snímku obrazovky
    .preview = Přehrát zvuk závěrky
settings-sound-kind-recording = Nahrávání
    .description = Při spuštění a zastavení záznamu obrazovky, kamery nebo diktování
    .preview = Přehrát zvuk nahrávání
settings-sound-kind-sign-in = Zvuk přihlášení
    .description = Když se zobrazí vaše plocha
    .preview = Přehrát zvuk přihlášení
settings-sound-kind-keyboard = Zvuk kláves
    .description = Každá klávesa na klávesnici na obrazovce
    .preview = Přehrát zvuk klávesy

## Power and battery

settings-power-battery = Baterie
settings-power-charging = Nabíjení
settings-power-charging-at = Nabíjení: { $power }
settings-power-charging-until-full = Nabíjení, do plného nabití zbývá { $time }
settings-power-charging-at-until-full = Nabíjení: { $power }, do plného nabití zbývá { $time }
settings-power-on-battery = Na baterii
settings-power-on-battery-using = Na baterii, odběr { $power }
settings-power-time-left = Zbývá asi { $time }
settings-power-time-left-using = Zbývá asi { $time }, odběr { $power }
settings-power-full = Plně nabito
settings-power-empty = Vybito
settings-power-not-charging = Připojeno, nenabíjí se
settings-power-health = Stav baterie
settings-power-capacity = { $full } z { $design } v novém stavu
settings-power-cycles = { $count ->
    [one] { $cycles } nabíjecí cyklus
    [few] { $cycles } nabíjecí cykly
    [many] { $cycles } nabíjecího cyklu
   *[other] { $cycles } nabíjecích cyklů
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Zobrazovat procenta
settings-power-show-percentage-description = Zobrazí úroveň nabití uvnitř ikony baterie

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = méně než minuta
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minuta
    [few] { $minutes } minuty
    [many] { $minutes } minuty
   *[other] { $minutes } minut
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } hodina
    [few] { $hours } hodiny
    [many] { $hours } hodiny
   *[other] { $hours } hodin
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } hodina
    [few] { $hours } hodiny
    [many] { $hours } hodiny
   *[other] { $hours } hodin
} { $minutes ->
    [one] { $minutes } minuta
    [few] { $minutes } minuty
    [many] { $minutes } minuty
   *[other] { $minutes } minut
}
settings-power-never = Nikdy

## Charge limit

settings-power-limit = Omezit nabíjení
settings-power-limit-failed = Limit se nepodařilo změnit. Zkuste to znovu.
settings-power-limit-elsewhere-off = Jiná aplikace ho vypnula, takže se baterie nabíjí naplno
settings-power-limit-elsewhere-changed = Jiná aplikace změnila limit na { $level }
settings-power-limit-elsewhere-on = Jiná aplikace zastavuje nabíjení na { $level }
settings-power-limit-automatic = Kdy přestat nabíjet, rozhoduje počítač
settings-power-limit-stops-at = Nabíjení se zastaví na { $level }
settings-power-limit-description = Ukončí nabíjení dřív, aby baterie vydržela déle
settings-power-limit-description-at = Zastaví se na { $level }, aby baterie vydržela déle
settings-power-limit-applied = Nabíjení se zastaví na { $level }
settings-power-limit-applied-description = Nastaveno jinou aplikací v tomto počítači

## Battery-powered devices

settings-power-devices = Zařízení
settings-power-device-mouse = Myš
settings-power-device-keyboard = Klávesnice
settings-power-device-headphones = Sluchátka
settings-power-device-speaker = Reproduktor
settings-power-device-controller = Ovladač
settings-power-device-phone = Telefon
settings-power-device-tablet = Tablet
settings-power-device-pen = Pero
settings-power-device-touchpad = Touchpad
settings-power-device-other = Zařízení

## Power mode

settings-power-mode = Režim napájení
settings-power-mode-row = Režim
settings-power-profile-saver = Úspora energie
    .description = Pomalejší a s nižší spotřebou
settings-power-profile-balanced = Vyvážený
    .description = Běžný výkon a spotřeba
settings-power-profile-performance = Výkon
    .description = Rychlejší a s vyšší spotřebou
settings-power-limited = Výkon je momentálně omezený
settings-power-limited-lap = Výkon je omezený, protože máte počítač na klíně
settings-power-limited-hot = Výkon je omezený, protože je počítač příliš horký
settings-power-limited-lap-hot = Výkon je omezený, protože máte počítač na klíně a je příliš horký
settings-power-saver-low-battery = Úspora energie při slabé baterii
settings-power-saver-low-battery-description = Při slabé baterii přepne na úsporu energie

## Keyboard backlight

settings-power-keyboard = Klávesnice
settings-power-backlight = Podsvícení klávesnice
settings-power-backlight-off = Vypnuto
settings-power-backlight-low = Nízké
settings-power-backlight-medium = Střední
settings-power-backlight-high = Vysoké

## Screen and sleep

settings-power-screen = Obrazovka
settings-power-screen-off = Vypnout obrazovku po nečinnosti
settings-power-screen-off-description = Když počítač chvíli nepoužíváte
settings-power-dim = Ztlumit při nečinnosti
settings-power-dim-description = Krátce před vypnutím obrazovky sníží jas
settings-power-sleep = Režim spánku
settings-power-suspend-plugged-in = Uspat při napájení ze sítě
settings-power-suspend-inactive = Uspat při nečinnosti
settings-power-suspend-description = Po chvíli nečinnosti uspí počítač
settings-power-suspend-battery = Uspat na baterii
settings-power-button = Tlačítko napájení
settings-power-button-suspend = Uspat
settings-power-button-hibernate = Hibernovat
settings-power-button-ask = Zeptat se
settings-power-button-nothing = Nedělat nic
settings-power-long-sleep = Vypnout po dlouhém spánku
settings-power-long-sleep-description = Aby se baterie ve spánku úplně nevybila, počítač se vypne, když je baterie slabá nebo když dlouho spí na baterii. Otevřená okna se nezachovají.
settings-power-long-sleep-failed = Nastavení se nepodařilo změnit. Zkuste to znovu.
settings-power-long-sleep-after = Doba do vypnutí
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } hodina
    [few] { $hours } hodiny
    [many] { $hours } hodiny
   *[other] { $hours } hodin
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } den
    [few] { $days } dny
    [many] { $days } dne
   *[other] { $days } dní
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } týden
    [few] { $weeks } týdny
    [many] { $weeks } týdne
   *[other] { $weeks } týdnů
}

## Keyboard

settings-keyboard-sources = Vstupní zdroje
settings-keyboard-sources-description = Ve výchozím stavu se používá první z nich. Při psaní mezi nimi můžete přepínat.
settings-keyboard-source-edit = Upravit v aplikaci Keys
settings-keyboard-source-up = Posunout nahoru
settings-keyboard-source-down = Posunout dolů
settings-keyboard-source-remove = Odebrat
settings-keyboard-add-source-button = Přidat vstupní zdroj
settings-keyboard-own = Vlastní rozložení a metody zadávání
settings-keyboard-own-layout = Vytvořit rozložení
settings-keyboard-own-layout-description = Začněte od existujícího rozložení a změňte, co jednotlivé klávesy píšou
settings-keyboard-own-method = Vytvořit metodu zadávání
settings-keyboard-own-method-description = Změní napsaný text na znaky s diakritikou, jiná písma nebo slova na výběr
settings-keyboard-own-open = Otevřít Keys
settings-keyboard-own-open-description = Upravte rozložení a metody zadávání, které jste vytvořili
settings-keyboard-switch-source = Přepnout vstupní zdroj
settings-keyboard-add-source = Přidat vstupní zdroj
settings-keyboard-add-source-description = Vyberte rozložení klávesnice nebo metodu zadávání, kterou chcete používat.
settings-keyboard-add-source-search = Hledat jazyky, rozložení a metody zadávání
settings-keyboard-input-method = Metoda zadávání
settings-keyboard-add-source-no-match = Výrazu „{ $query }“ nic neodpovídá
settings-keyboard-cancel = Zrušit
settings-keyboard-add = Přidat
settings-keyboard-typing = Psaní
settings-keyboard-repeat = Opakování kláves
settings-keyboard-repeat-description = Podržená klávesa se píše znovu a znovu
settings-keyboard-repeat-delay = Prodleva před opakováním
settings-keyboard-repeat-delay-shorter = Kratší
settings-keyboard-repeat-delay-longer = Delší
settings-keyboard-repeat-speed = Rychlost opakování
settings-keyboard-repeat-speed-slower = Pomalejší
settings-keyboard-repeat-speed-faster = Rychlejší
settings-keyboard-caps-lock = Klávesa Caps Lock
settings-keyboard-caps-lock-description = Co se stane, když ji stisknete
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Prohodit s Esc
settings-keyboard-caps-lock-nothing = Nic
settings-keyboard-caps-lock-custom = Vlastní
settings-keyboard-lock-notices = Zobrazovat Caps Lock a Num Lock
settings-keyboard-lock-notices-description = Při zapnutí nebo vypnutí se krátce zobrazí na obrazovce
settings-keyboard-dictation-on = Zapnuto
settings-keyboard-dictation-off = Vypnuto
settings-keyboard-shortcuts-description = Zobrazit a změnit zkratky nebo přidat vlastní

## Copilot key

settings-keyboard-copilot = Klávesa Copilot
settings-keyboard-copilot-press = Stisk
settings-keyboard-copilot-press-description = Co udělá krátké stisknutí klávesy
settings-keyboard-copilot-open-start = Otevřít Start
settings-keyboard-copilot-open-app = Otevřít aplikaci
settings-keyboard-copilot-nothing = Nic
settings-keyboard-copilot-app = Aplikace
settings-keyboard-copilot-no-app = Zatím není vybraná žádná aplikace
settings-keyboard-copilot-change = Změnit
settings-keyboard-copilot-choose = Vybrat
settings-keyboard-copilot-hold = Podržením diktovat
settings-keyboard-copilot-hold-description = Podržte klávesu a mluvte, napíše se to, co řeknete
settings-keyboard-copilot-hold-off = Funguje, když je zapnuté diktování
settings-keyboard-copilot-choose-app = Vyberte aplikaci
settings-keyboard-copilot-choose-app-description = Stisknutím klávesy Copilot se otevře.

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
settings-keys-space = Mezerník
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menu
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Zesílit hlasitost
settings-keys-volume-down = Zeslabit hlasitost
settings-keys-mute = Ztlumit
settings-keys-microphone-mute = Ztlumit mikrofon
settings-keys-play = Přehrát
settings-keys-media-pause = Pozastavit
settings-keys-stop = Zastavit
settings-keys-next-track = Další skladba
settings-keys-previous-track = Předchozí skladba
settings-keys-brightness-up = Zvýšit jas
settings-keys-brightness-down = Snížit jas
settings-keys-browser = Prohlížeč
settings-keys-home-page = Domovská stránka
settings-keys-search = Hledat
settings-keys-mail = Pošta
settings-keys-calculator = Kalkulačka
settings-keys-files = Soubory
settings-keys-eject = Vysunout
settings-keys-power = Napájení
settings-keys-lock = Zamknout

## Keyboard shortcuts

settings-shortcuts-title = Klávesové zkratky
settings-shortcuts-search = Hledat zkratky
settings-shortcuts-category-system = Systém
settings-shortcuts-category-windows = Okna
settings-shortcuts-category-workspaces = Pracovní prostory
settings-shortcuts-category-screenshots = Snímky obrazovky
settings-shortcuts-category-media = Média
settings-shortcuts-reset = Obnovit výchozí
settings-shortcuts-apps = Zkratky aplikací
settings-shortcuts-apps-description = Zkratky, o které aplikace požádaly a které fungují, i když aplikace není v popředí
settings-shortcuts-no-match = Výrazu „{ $query }“ neodpovídá žádná zkratka
settings-shortcuts-change = Změnit zkratku pro { $name }
settings-shortcuts-or = nebo
settings-shortcuts-not-set = Nenastaveno
settings-shortcuts-press-keys = Stiskněte požadované klávesy
settings-shortcuts-needs-modifier = Přidejte Ctrl, Alt nebo Super, aby zkratka nepřekážela při psaní.
settings-shortcuts-record-description = Stiskněte novou zkratku. Backspace ji vypne, Esc zruší změnu.
settings-shortcuts-record-taken = Tato zkratka se už používá pro „{ $name }“. Nahrazením se tam vypne.
settings-shortcuts-try-another = Zkusit jinou
settings-shortcuts-replace = Nahradit
settings-shortcuts-cancel = Zrušit
settings-shortcuts-custom = Vlastní zkratky
settings-shortcuts-custom-description = Spuštění příkazu nebo otevření aplikace kombinací kláves
settings-shortcuts-untitled = Bez názvu
settings-shortcuts-add = Přidat zkratku
settings-shortcuts-edit = Upravit zkratku
settings-shortcuts-custom-name = Název
settings-shortcuts-custom-command = Příkaz
settings-shortcuts-custom-shortcut = Zkratka
settings-shortcuts-custom-taken = Už se používá pro „{ $name }“. Uložením se tam vypne.
settings-shortcuts-remove = Odebrat
settings-shortcuts-save = Uložit
settings-shortcuts-add-button = Přidat

## Dictation

settings-dictation-title = Diktování
settings-dictation-description = Podržte { $keys } a mluvte, v libovolné aplikaci se napíše, co řeknete. Puštěním diktování dokončíte, klávesou Esc ho zrušíte. Vše probíhá v tomto počítači: váš hlas ho nikdy neopustí a neukládá se.
settings-dictation-description-no-shortcut = Pro diktování vyberte níže zkratku. Vše probíhá v tomto počítači: váš hlas ho nikdy neopustí a neukládá se.
settings-dictation-not-installed = Diktování není v tomto počítači nainstalované
settings-dictation-hold = Pro diktování podržte { $keys }
settings-dictation-needs-shortcut = Vypnuto, dokud nemá zkratku
settings-dictation-copilot-key = klávesu Copilot
settings-dictation-shortcut = Zkratka
settings-dictation-shortcut-description = Podržte ji a mluvte, nebo ji stiskněte a diktování poběží, dokud ji nestisknete znovu nebo nepřestanete mluvit
settings-dictation-shortcut-own = Vlastní zkratka
settings-dictation-shortcut-another = Jiná zkratka…
settings-dictation-shortcut-off = Vypnuto
settings-dictation-keys = Klávesy
settings-dictation-change = Změnit
settings-dictation-language = Jazyk
settings-dictation-language-automatic = Automaticky
settings-dictation-language-automatic-current = Automaticky ({ $language })
settings-dictation-language-description = Automatický jazyk se řídí rozložením klávesnice, kterým píšete
settings-dictation-language-unavailable = Jazyk { $language } není v tomto počítači k dispozici
settings-dictation-engine = Rozpoznávání řeči
settings-dictation-engine-automatic = Automaticky
settings-dictation-engine-description = { $engine } rozpoznává jazyk { $language }
settings-dictation-engine-graphics-card = { $engine } rozpoznává jazyk { $language } na grafické kartě
settings-dictation-models = Řečové modely
settings-dictation-models-description = Modely se stáhnou jednou a zůstanou v tomto počítači.
settings-dictation-credits = Autoři
settings-dictation-credit = { $credit }. Licence: { $licence }.
settings-dictation-learn-more = Další informace

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Stažení se nezdařilo: { $reason }
settings-dictation-model-downloading = { $received } z { $total }
settings-dictation-model-installed = V tomto počítači: { $size }
settings-dictation-model-partial = Staženo { $received } z { $total }
settings-dictation-model-size = Ke stažení: { $size }
settings-dictation-model-retry = Zkusit znovu
settings-dictation-model-cancel = Zrušit
settings-dictation-model-resume = Pokračovat
settings-dictation-model-download = Stáhnout
settings-dictation-model-remove = Odebrat

## Mouse and touchpad

settings-mouse-mouse = Myš
settings-mouse-primary-button = Primární tlačítko
settings-mouse-primary-button-description = Tlačítko, kterým klikáním vybíráte
settings-mouse-primary-button-left = Levé
settings-mouse-primary-button-right = Pravé
settings-mouse-speed = Rychlost ukazatele
settings-mouse-slower = Pomalejší
settings-mouse-faster = Rychlejší
settings-mouse-acceleration = Akcelerace myši
settings-mouse-acceleration-description = Při rychlém pohybu myší se ukazatel posune dál
settings-mouse-natural-scrolling = Přirozené posouvání
settings-mouse-natural-scrolling-description = Posouváním se pohybuje obsah místo zobrazení
settings-mouse-touchpad = Touchpad
settings-mouse-touchpad-speed = Rychlost ukazatele touchpadu
settings-mouse-touchpad-scroll-speed = Rychlost posouvání
settings-mouse-touchpad-scroll-speed-label = Rychlost posouvání touchpadem
settings-mouse-touchpad-tap = Klepnutí jako kliknutí
settings-mouse-touchpad-tap-description = Stačí na touchpad klepnout, není nutné ho promáčknout
settings-mouse-touchpad-natural-scrolling = Přirozené posouvání touchpadem
settings-mouse-touchpad-natural-scrolling-description = Obsah se pohybuje stejným směrem jako prsty
settings-mouse-touchpad-scroll-with = Posouvat
settings-mouse-touchpad-two-fingers = Dvěma prsty
settings-mouse-touchpad-scroll-edge = Okrajem
settings-mouse-touchpad-secondary-click = Sekundární kliknutí
settings-mouse-touchpad-secondary-click-description = Jak kliknout pravým tlačítkem bez samostatného tlačítka
settings-mouse-touchpad-click-corner = Rohem
settings-mouse-touchpad-disable-typing = Vypnout při psaní
settings-mouse-touchpad-disable-typing-description = Aby ukazatel při psaní neposkakoval
