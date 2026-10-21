## Displays

settings-display-mirror = Kijelzők tükrözése
settings-display-mirror-description = Minden kijelzőn ugyanaz a kép látható
settings-display-mirrored = Tükrözött kijelzők
settings-display-display = Kijelző
settings-display-apply-failed = Ezek a beállítások nem működtek. Próbáljon ki egy másik elrendezést.
settings-display-reset = Visszaállítás
settings-display-apply = Alkalmazás
settings-display-arrangement-main = { $name }, fő kijelző
settings-display-use = Kijelző használata
settings-display-main = Fő kijelző
settings-display-main-description = Itt jelenik meg a tálca és az új ablakok
settings-display-resolution-title = Felbontás
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Frissítési gyakoriság
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Változó frissítési gyakoriság
settings-display-variable-refresh-description = A kijelző követi a teljes képernyős játékok képkockasebességét, így a mozgás egyenletesebb
settings-display-variable-refresh-off = Ki
settings-display-variable-refresh-games = Játékokban
settings-display-variable-refresh-fullscreen = Minden teljes képernyős alkalmazásban
settings-display-scale = Méretezés
settings-display-scale-description = Nagyobbra vagy kisebbre állítja a szöveget, az alkalmazásokat és minden mást
settings-display-orientation = Tájolás
settings-display-orientation-landscape = Fekvő
settings-display-orientation-portrait-right = Álló, jobbra
settings-display-orientation-portrait-left = Álló, balra
settings-display-orientation-landscape-flipped = Fekvő, megfordítva

## Display brightness

settings-display-brightness = Fényerő
settings-display-brightness-label = { $name } fényereje
settings-display-brightness-unsupported = Kapcsolja be a DDC/CI funkciót a kijelző menüjében, hogy itt módosíthassa
settings-display-brightness-unresponsive = Most nem válaszol, hamarosan újra próbálkozik
settings-display-brightness-external = Külső kijelzők
settings-display-brightness-missing-tool = Telepítse a ddcutil programot, hogy itt módosíthassa a fényerejüket
settings-display-brightness-needs-restart = A fényerő beállításának befejezéséhez indítsa újra a számítógépet
settings-display-brightness-no-access = Jelentkezzen ki, majd be, hogy itt módosíthassa a fényerejüket

## Night light

settings-display-night-light = Éjszakai fény
settings-display-night-light-description = Esténként melegebb színek, amelyek kímélik a szemet
settings-display-night-light-schedule = Ütemezés
settings-display-night-light-automatic = Napnyugtától napkeltéig
settings-display-night-light-custom = Egyéni
settings-display-night-light-from = Bekapcsolás
settings-display-night-light-to = Kikapcsolás
settings-display-night-light-warmth = Melegség

## Sound

settings-sound-output = Kimenet
settings-sound-input = Bemenet
settings-sound-device = Eszköz
settings-sound-output-device = Kimeneti eszköz
settings-sound-input-device = Bemeneti eszköz
settings-sound-connection = Csatlakozás
settings-sound-output-connection = Kimeneti csatlakozás
settings-sound-input-connection = Bemeneti csatlakozás
settings-sound-volume = Hangerő
settings-sound-mute = Némítás: { $name }
settings-sound-unmute = Némítás feloldása: { $name }
settings-sound-balance = Balansz
settings-sound-balance-center = Középen
settings-sound-balance-left = Bal: { $share }
settings-sound-balance-right = Jobb: { $share }
settings-sound-louder = 100% feletti hangerő engedélyezése
settings-sound-louder-description = Nagyobb hangerőn a hang torzulhat
settings-sound-input-level = Bemeneti szint
settings-sound-apps = Alkalmazások hangereje
settings-sound-apps-playing = { $count ->
    [one] { $count } alkalmazás játszik le hangot
   *[other] { $count } alkalmazás játszik le hangot
}
settings-sound-app-output = { $app } hangkimenete
settings-sound-profiles = Eszközprofilok
settings-sound-profiles-row-description = Az egyes hangeszközök használati módjának kiválasztása
settings-sound-profiles-description = Az egyes hangeszközök használati módja, például sztereó vagy térhatású
settings-sound-profile-label = { $device } használati módja
settings-sound-profile-off = Ki

## System sounds

settings-sound-system = Rendszerhangok
settings-sound-system-description = Hangok értesítésekhez, eszközökhöz és egyéb eseményekhez
settings-sound-system-volume = Rendszerhangok hangereje
settings-sound-kind-notifications = Értesítések
    .description = Ne zavarjanak módban, játék és képernyőmegosztás közben elhallgat
    .preview = Értesítési hang lejátszása
settings-sound-kind-devices = Eszközök és töltés
    .description = Eszköz vagy töltő csatlakoztatása, alacsony akkumulátor-töltöttség
    .preview = Eszközhang lejátszása
settings-sound-kind-volume = Hangerő-visszajelzés
    .description = Kattanás a hangerő módosításakor
    .preview = Hangerő-kattanás lejátszása
settings-sound-kind-screenshots = Képernyőképek
    .description = Zárhang a képernyőkép mentésekor
    .preview = Zárhang lejátszása
settings-sound-kind-recording = Felvétel
    .description = A képernyőfelvétel, a kamera vagy a diktálás indításakor és leállításakor
    .preview = Felvételi hang lejátszása
settings-sound-kind-sign-in = Bejelentkezési hang
    .description = Amikor megjelenik az asztal
    .preview = Bejelentkezési hang lejátszása
settings-sound-kind-keyboard = Billentyűhangok
    .description = A képernyő-billentyűzet minden billentyűjénél
    .preview = Billentyűhang lejátszása

## Power and battery

settings-power-battery = Akkumulátor
settings-power-charging = Töltés
settings-power-charging-at = Töltés { $power } teljesítménnyel
settings-power-charging-until-full = Töltés, a teljes feltöltésig hátralévő idő: { $time }
settings-power-charging-at-until-full = Töltés { $power } teljesítménnyel, a teljes feltöltésig hátralévő idő: { $time }
settings-power-on-battery = Akkumulátorról
settings-power-on-battery-using = Akkumulátorról, fogyasztás: { $power }
settings-power-time-left = Hátralévő idő: kb. { $time }
settings-power-time-left-using = Hátralévő idő: kb. { $time }, fogyasztás: { $power }
settings-power-full = Teljesen feltöltve
settings-power-empty = Lemerült
settings-power-not-charging = Csatlakoztatva, nem tölt
settings-power-health = Akkumulátor állapota
settings-power-capacity = { $full }, újonnan { $design }
settings-power-cycles = { $count ->
    [one] { $cycles } töltési ciklus
   *[other] { $cycles } töltési ciklus
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Százalék megjelenítése
settings-power-show-percentage-description = Az akkumulátor töltöttsége megjelenik az akkumulátor ikonjában

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = kevesebb mint egy perc
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } perc
   *[other] { $minutes } perc
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } óra
   *[other] { $hours } óra
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } óra
   *[other] { $hours } óra
} { $minutes ->
    [one] { $minutes } perc
   *[other] { $minutes } perc
}
settings-power-never = Soha

## Charge limit

settings-power-limit = Töltési korlát
settings-power-limit-failed = Nem sikerült módosítani a korlátot. Próbálja újra.
settings-power-limit-elsewhere-off = Egy másik alkalmazás kikapcsolta, ezért az akkumulátor teljesen feltöltődik
settings-power-limit-elsewhere-changed = Egy másik alkalmazás { $level } értékre módosította a korlátot
settings-power-limit-elsewhere-on = Egy másik alkalmazás { $level } töltöttségnél leállítja a töltést
settings-power-limit-automatic = A számítógép dönti el, mikor álljon le a töltés
settings-power-limit-stops-at = A töltés { $level } töltöttségnél leáll
settings-power-limit-description = A töltés korábban leáll, így az akkumulátor tovább bírja
settings-power-limit-description-at = A töltés { $level } töltöttségnél leáll, így az akkumulátor tovább bírja
settings-power-limit-applied = A töltés { $level } töltöttségnél leáll
settings-power-limit-applied-description = A számítógép egy másik alkalmazása állította be

## Battery-powered devices

settings-power-devices = Eszközök
settings-power-device-mouse = Egér
settings-power-device-keyboard = Billentyűzet
settings-power-device-headphones = Fejhallgató
settings-power-device-speaker = Hangszóró
settings-power-device-controller = Játékvezérlő
settings-power-device-phone = Telefon
settings-power-device-tablet = Táblagép
settings-power-device-pen = Toll
settings-power-device-touchpad = Érintőpad
settings-power-device-other = Eszköz

## Power mode

settings-power-mode = Energiamód
settings-power-mode-row = Mód
settings-power-profile-saver = Energiatakarékos
    .description = Lassabb, és kevesebb energiát fogyaszt
settings-power-profile-balanced = Kiegyensúlyozott
    .description = Átlagos teljesítmény és energiafogyasztás
settings-power-profile-performance = Teljesítmény
    .description = Gyorsabb, és több energiát fogyaszt
settings-power-limited = A teljesítmény most korlátozva van
settings-power-limited-lap = A teljesítmény korlátozva van, mert a számítógép az ölében van
settings-power-limited-hot = A teljesítmény korlátozva van, mert a számítógép túlmelegedett
settings-power-limited-lap-hot = A teljesítmény korlátozva van, mert a számítógép az ölében van, és túlmelegedett
settings-power-saver-low-battery = Energiatakarékos mód alacsony töltöttségnél
settings-power-saver-low-battery-description = Energiatakarékos módra vált, ha az akkumulátor lemerülőben van

## Keyboard backlight

settings-power-keyboard = Billentyűzet
settings-power-backlight = Billentyűzet-háttérvilágítás
settings-power-backlight-off = Ki
settings-power-backlight-low = Alacsony
settings-power-backlight-medium = Közepes
settings-power-backlight-high = Magas

## Screen and sleep

settings-power-screen = Képernyő
settings-power-screen-off = Képernyő kikapcsolása ennyi idő után
settings-power-screen-off-description = Ha egy ideig nem használja a számítógépet
settings-power-dim = Elsötétítés tétlenség esetén
settings-power-dim-description = Csökkenti a fényerőt röviddel a képernyő kikapcsolása előtt
settings-power-sleep = Alvó állapot
settings-power-suspend-plugged-in = Alvó állapot hálózati táplálásnál
settings-power-suspend-inactive = Alvó állapot tétlenség esetén
settings-power-suspend-description = Alvó állapotba helyezi a számítógépet, ha egy ideig nem használja
settings-power-suspend-battery = Alvó állapot akkumulátorról
settings-power-button = Főkapcsoló
settings-power-button-suspend = Alvó állapot
settings-power-button-hibernate = Hibernálás
settings-power-button-ask = Rákérdezés
settings-power-button-nothing = Nincs művelet
settings-power-long-sleep = Leállítás hosszú alvó állapot után
settings-power-long-sleep-description = Ahelyett, hogy alvó állapotban teljesen lemerülne az akkumulátor, a számítógép leáll, ha az akkumulátor töltöttsége alacsony, vagy ha hosszú ideig alszik akkumulátorról. A megnyitott ablakok nem maradnak meg.
settings-power-long-sleep-failed = Ezt nem sikerült módosítani. Próbálja újra.
settings-power-long-sleep-after = Leállítás ennyi idő után
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } óra
   *[other] { $hours } óra
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } nap
   *[other] { $days } nap
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } hét
   *[other] { $weeks } hét
}

## Keyboard

settings-keyboard-sources = Beviteli források
settings-keyboard-sources-description = Alapértelmezés szerint az első használatos. Gépelés közben válthat közöttük.
settings-keyboard-source-edit = Szerkesztés a Keys alkalmazásban
settings-keyboard-source-up = Mozgatás feljebb
settings-keyboard-source-down = Mozgatás lejjebb
settings-keyboard-source-remove = Eltávolítás
settings-keyboard-add-source-button = Beviteli forrás hozzáadása
settings-keyboard-own = Saját kiosztások és beviteli módok
settings-keyboard-own-layout = Kiosztás készítése
settings-keyboard-own-layout-description = Egy meglévő kiosztásból kiindulva módosíthatja, mit írnak a billentyűk
settings-keyboard-own-method = Beviteli mód készítése
settings-keyboard-own-method-description = A begépelt szöveget ékezetes betűkké, más írásrendszerekké vagy választható szavakká alakítja
settings-keyboard-own-open = Keys megnyitása
settings-keyboard-own-open-description = Az elkészített kiosztások és beviteli módok szerkesztése
settings-keyboard-switch-source = Beviteli forrás váltása
settings-keyboard-add-source = Beviteli forrás hozzáadása
settings-keyboard-add-source-description = Válassza ki a billentyűzetkiosztást vagy beviteli módot, amellyel gépelni szeretne.
settings-keyboard-add-source-search = Nyelvek, kiosztások és beviteli módok keresése
settings-keyboard-input-method = Beviteli mód
settings-keyboard-add-source-no-match = Nincs találat erre: „{ $query }”
settings-keyboard-cancel = Mégse
settings-keyboard-add = Hozzáadás
settings-keyboard-typing = Gépelés
settings-keyboard-repeat = Billentyűismétlés
settings-keyboard-repeat-description = Egy billentyű lenyomva tartásakor a karakter ismétlődik
settings-keyboard-repeat-delay = Késleltetés az ismétlés előtt
settings-keyboard-repeat-delay-shorter = Rövidebb
settings-keyboard-repeat-delay-longer = Hosszabb
settings-keyboard-repeat-speed = Ismétlési sebesség
settings-keyboard-repeat-speed-slower = Lassabb
settings-keyboard-repeat-speed-faster = Gyorsabb
settings-keyboard-caps-lock = Caps Lock billentyű
settings-keyboard-caps-lock-description = Mi történjen a lenyomásakor
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Csere az Esc billentyűvel
settings-keyboard-caps-lock-nothing = Semmi
settings-keyboard-caps-lock-custom = Egyéni
settings-keyboard-lock-notices = Caps Lock és Num Lock jelzése
settings-keyboard-lock-notices-description = Rövid ideig megjelenik a képernyőn, amikor valamelyik be- vagy kikapcsol
settings-keyboard-dictation-on = Be
settings-keyboard-dictation-off = Ki
settings-keyboard-shortcuts-description = Billentyűparancsok megtekintése és módosítása, vagy sajátok hozzáadása

## Copilot key

settings-keyboard-copilot = Copilot billentyű
settings-keyboard-copilot-press = Lenyomás
settings-keyboard-copilot-press-description = Mi történjen a billentyű rövid lenyomásakor
settings-keyboard-copilot-open-start = Start megnyitása
settings-keyboard-copilot-open-app = Alkalmazás megnyitása
settings-keyboard-copilot-nothing = Semmi
settings-keyboard-copilot-app = Alkalmazás
settings-keyboard-copilot-no-app = Még nincs kiválasztott alkalmazás
settings-keyboard-copilot-change = Módosítás
settings-keyboard-copilot-choose = Kiválasztás
settings-keyboard-copilot-hold = Diktálás lenyomva tartással
settings-keyboard-copilot-hold-description = Tartsa lenyomva a billentyűt, és beszéljen: amit mond, begépelődik
settings-keyboard-copilot-hold-off = A diktálás bekapcsolása után működik
settings-keyboard-copilot-choose-app = Alkalmazás kiválasztása
settings-keyboard-copilot-choose-app-description = A Copilot billentyű lenyomása ezt nyitja meg.

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
settings-keys-space = Szóköz
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menü
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Hangerő fel
settings-keys-volume-down = Hangerő le
settings-keys-mute = Némítás
settings-keys-microphone-mute = Mikrofon némítása
settings-keys-play = Lejátszás
settings-keys-media-pause = Szünet
settings-keys-stop = Leállítás
settings-keys-next-track = Következő szám
settings-keys-previous-track = Előző szám
settings-keys-brightness-up = Fényerő fel
settings-keys-brightness-down = Fényerő le
settings-keys-browser = Böngésző
settings-keys-home-page = Kezdőlap
settings-keys-search = Keresés
settings-keys-mail = Levelezés
settings-keys-calculator = Számológép
settings-keys-files = Fájlok
settings-keys-eject = Kiadás
settings-keys-power = Főkapcsoló
settings-keys-lock = Zárolás

## Keyboard shortcuts

settings-shortcuts-title = Billentyűparancsok
settings-shortcuts-search = Billentyűparancsok keresése
settings-shortcuts-category-system = Rendszer
settings-shortcuts-category-windows = Ablakok
settings-shortcuts-category-tiling = Csempézés
settings-shortcuts-category-workspaces = Munkaterületek
settings-shortcuts-category-screenshots = Képernyőképek
settings-shortcuts-category-media = Média
settings-shortcuts-reset = Alapértelmezés visszaállítása
settings-shortcuts-apps = Alkalmazások billentyűparancsai
settings-shortcuts-apps-description = Alkalmazások által kért billentyűparancsok, amelyek akkor is működnek, ha az alkalmazás nincs előtérben
settings-shortcuts-no-match = Nincs billentyűparancs erre: „{ $query }”
settings-shortcuts-change = Billentyűparancs módosítása: { $name }
settings-shortcuts-or = vagy
settings-shortcuts-not-set = Nincs beállítva
settings-shortcuts-press-keys = Nyomja le a kívánt billentyűket
settings-shortcuts-needs-modifier = Adja hozzá a Ctrl, az Alt vagy a Super billentyűt, hogy a billentyűparancs ne zavarja a gépelést.
settings-shortcuts-record-description = Nyomja le az új billentyűparancsot. A Backspace kikapcsolja, az Esc megszakítja.
settings-shortcuts-record-taken = Ezt a billentyűparancsot már ez használja: „{ $name }”. Ha lecseréli, ott kikapcsol.
settings-shortcuts-try-another = Másik kipróbálása
settings-shortcuts-replace = Csere
settings-shortcuts-cancel = Mégse
settings-shortcuts-custom = Egyéni billentyűparancsok
settings-shortcuts-custom-description = Parancs futtatása vagy alkalmazás megnyitása billentyűkombinációval
settings-shortcuts-untitled = Névtelen
settings-shortcuts-add = Billentyűparancs hozzáadása
settings-shortcuts-edit = Billentyűparancs szerkesztése
settings-shortcuts-custom-name = Név
settings-shortcuts-custom-command = Parancs
settings-shortcuts-custom-shortcut = Billentyűparancs
settings-shortcuts-custom-taken = Már ez használja: „{ $name }”. Mentéskor ott kikapcsol.
settings-shortcuts-remove = Eltávolítás
settings-shortcuts-save = Mentés
settings-shortcuts-add-button = Hozzáadás

## Dictation

settings-dictation-title = Diktálás
settings-dictation-description = Bármely alkalmazásban gépelhet beszéddel, ha beszéd közben lenyomva tartja ezt: { $keys }. A befejezéshez engedje fel, a megszakításhoz nyomja meg az Esc billentyűt. Minden ezen a számítógépen történik: a hangja nem hagyja el, és nem is tárolódik.
settings-dictation-description-no-shortcut = A diktáláshoz válasszon alább egy billentyűparancsot. Minden ezen a számítógépen történik: a hangja nem hagyja el, és nem is tárolódik.
settings-dictation-not-installed = A diktálás nincs telepítve ezen a számítógépen
settings-dictation-hold = Diktáláshoz tartsa lenyomva: { $keys }
settings-dictation-needs-shortcut = Ki, amíg nincs billentyűparancsa
settings-dictation-copilot-key = Copilot billentyű
settings-dictation-shortcut = Billentyűparancs
settings-dictation-shortcut-description = Tartsa lenyomva beszéd közben, vagy nyomja meg egyszer, és a diktálás addig tart, amíg újra meg nem nyomja, vagy abba nem hagyja a beszédet
settings-dictation-shortcut-own = Saját billentyűparancs
settings-dictation-shortcut-another = Másik billentyűparancs…
settings-dictation-shortcut-off = Ki
settings-dictation-keys = Billentyűk
settings-dictation-change = Módosítás
settings-dictation-language = Nyelv
settings-dictation-language-automatic = Automatikus
settings-dictation-language-automatic-current = Automatikus ({ $language })
settings-dictation-language-description = Az automatikus beállítás a használt billentyűzetkiosztást követi
settings-dictation-language-unavailable = Ez a nyelv nem érhető el ezen a számítógépen: { $language }
settings-dictation-engine = Beszédfelismerő
settings-dictation-engine-automatic = Automatikus
settings-dictation-engine-description = Felismerő: { $engine }, nyelv: { $language }
settings-dictation-engine-graphics-card = Felismerő: { $engine }, nyelv: { $language }, a videokártyán
settings-dictation-models = Beszédmodellek
settings-dictation-models-description = A modellek egyszer töltődnek le, és ezen a számítógépen maradnak.
settings-dictation-credits = Köszönetnyilvánítás
settings-dictation-credit = { $credit }. Licenc: { $licence }.
settings-dictation-learn-more = További információ

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Nem sikerült letölteni: { $reason }
settings-dictation-model-downloading = { $received } / { $total }
settings-dictation-model-installed = { $size } ezen a számítógépen
settings-dictation-model-partial = { $received } / { $total } letöltve
settings-dictation-model-size = Letöltési méret: { $size }
settings-dictation-model-retry = Újra
settings-dictation-model-cancel = Mégse
settings-dictation-model-resume = Folytatás
settings-dictation-model-download = Letöltés
settings-dictation-model-remove = Eltávolítás

## Mouse and touchpad

settings-mouse-mouse = Egér
settings-mouse-primary-button = Elsődleges gomb
settings-mouse-primary-button-description = A gomb, amellyel kijelöl
settings-mouse-primary-button-left = Bal
settings-mouse-primary-button-right = Jobb
settings-mouse-speed = Mutató sebessége
settings-mouse-slower = Lassabb
settings-mouse-faster = Gyorsabb
settings-mouse-acceleration = Egérgyorsítás
settings-mouse-acceleration-description = Az egér gyors mozgatásakor a mutató nagyobb távolságot tesz meg
settings-mouse-natural-scrolling = Természetes görgetés
settings-mouse-natural-scrolling-description = A görgetés a tartalmat mozgatja, nem a nézetet
settings-mouse-touchpad = Érintőpad
settings-mouse-touchpad-speed = Mutató sebessége az érintőpadon
settings-mouse-touchpad-scroll-speed = Görgetési sebesség
settings-mouse-touchpad-scroll-speed-label = Görgetési sebesség az érintőpadon
settings-mouse-touchpad-tap = Koppintás kattintáshoz
settings-mouse-touchpad-tap-description = Lenyomás helyett koppintson az érintőpadra
settings-mouse-touchpad-natural-scrolling = Természetes görgetés az érintőpadon
settings-mouse-touchpad-natural-scrolling-description = A tartalom az ujjaival azonos irányba mozog
settings-mouse-touchpad-scroll-with = Görgetés ezzel
settings-mouse-touchpad-two-fingers = Két ujj
settings-mouse-touchpad-scroll-edge = Szél
settings-mouse-touchpad-secondary-click = Másodlagos kattintás
settings-mouse-touchpad-secondary-click-description = Jobb kattintás külön gomb nélkül
settings-mouse-touchpad-click-corner = Sarok
settings-mouse-touchpad-disable-typing = Letiltás gépelés közben
settings-mouse-touchpad-disable-typing-description = Így a mutató nem ugrik el gépelés közben
