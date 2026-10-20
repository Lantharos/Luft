## Displays

settings-display-mirror = Preslikaj ekrane
settings-display-mirror-description = Prikazuje istu sliku na svim ekranima
settings-display-mirrored = Preslikani ekrani
settings-display-display = Ekran
settings-display-apply-failed = Ove postavke nisu uspjele. Pokušajte s drugim rasporedom.
settings-display-reset = Vrati
settings-display-apply = Primijeni
settings-display-arrangement-main = { $name }, glavni ekran
settings-display-use = Koristi ovaj ekran
settings-display-main = Glavni ekran
settings-display-main-description = Ovdje se pojavljuju programska traka i novi prozori
settings-display-resolution-title = Rezolucija
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Frekvencija osvježavanja
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Promjenjiva frekvencija osvježavanja
settings-display-variable-refresh-description = Ekran prati broj sličica igara preko cijelog ekrana za glađe kretanje
settings-display-variable-refresh-off = Isključeno
settings-display-variable-refresh-games = U igrama
settings-display-variable-refresh-fullscreen = U svim aplikacijama preko cijelog ekrana
settings-display-scale = Skaliranje
settings-display-scale-description = Povećava ili smanjuje tekst, aplikacije i sve ostalo
settings-display-orientation = Orijentacija
settings-display-orientation-landscape = Položeno
settings-display-orientation-portrait-right = Uspravno, desno
settings-display-orientation-portrait-left = Uspravno, lijevo
settings-display-orientation-landscape-flipped = Položeno, okrenuto

## Display brightness

settings-display-brightness = Osvjetljenje
settings-display-brightness-label = Osvjetljenje: { $name }
settings-display-brightness-unsupported = Uključite DDC/CI u meniju ekrana da biste ga ovdje mijenjali
settings-display-brightness-unresponsive = Trenutno ne odgovara, uskoro novi pokušaj
settings-display-brightness-external = Vanjski ekrani
settings-display-brightness-missing-tool = Instalirajte ddcutil da biste ovdje mijenjali njihovo osvjetljenje
settings-display-brightness-needs-restart = Ponovo pokrenite računar da biste završili postavljanje njihovog osvjetljenja
settings-display-brightness-no-access = Odjavite se i ponovo prijavite da biste ovdje mijenjali njihovo osvjetljenje

## Night light

settings-display-night-light = Noćno svjetlo
settings-display-night-light-description = Toplije boje uveče, ugodnije za oči
settings-display-night-light-schedule = Raspored
settings-display-night-light-automatic = Od zalaska do izlaska sunca
settings-display-night-light-custom = Prilagođeno
settings-display-night-light-from = Uključuje se
settings-display-night-light-to = Isključuje se
settings-display-night-light-warmth = Toplina

## Sound

settings-sound-output = Izlaz
settings-sound-input = Ulaz
settings-sound-device = Uređaj
settings-sound-output-device = Izlazni uređaj
settings-sound-input-device = Ulazni uređaj
settings-sound-connection = Priključak
settings-sound-output-connection = Izlazni priključak
settings-sound-input-connection = Ulazni priključak
settings-sound-volume = Jačina zvuka
settings-sound-mute = Isključi zvuk: { $name }
settings-sound-unmute = Uključi zvuk: { $name }
settings-sound-balance = Balans
settings-sound-balance-center = Sredina
settings-sound-balance-left = { $share } lijevo
settings-sound-balance-right = { $share } desno
settings-sound-louder = Dozvoli glasnije od 100%
settings-sound-louder-description = Na većoj jačini zvuk se može izobličiti
settings-sound-input-level = Nivo ulaza
settings-sound-apps = Jačina zvuka aplikacija
settings-sound-apps-playing = { $count ->
    [one] { $count } aplikacija reprodukuje zvuk
    [few] { $count } aplikacije reprodukuju zvuk
   *[other] { $count } aplikacija reprodukuje zvuk
}
settings-sound-app-output = Izlaz zvuka: { $app }
settings-sound-profiles = Profili uređaja
settings-sound-profiles-row-description = Odaberite kako se koristi svaki zvučni uređaj
settings-sound-profiles-description = Kako se koristi svaki zvučni uređaj, npr. stereo ili surround
settings-sound-profile-label = Način korištenja: { $device }
settings-sound-profile-off = Isključeno

## System sounds

settings-sound-system = Sistemski zvukovi
settings-sound-system-description = Zvukovi za obavještenja, uređaje i druge događaje
settings-sound-system-volume = Jačina sistemskih zvukova
settings-sound-kind-notifications = Obavještenja
    .description = Utišani tokom Ne uznemiravaj, igara i dijeljenja ekrana
    .preview = Pusti zvuk obavještenja
settings-sound-kind-devices = Uređaji i punjenje
    .description = Priključivanje uređaja ili punjača i slaba baterija
    .preview = Pusti zvuk uređaja
settings-sound-kind-volume = Povratni zvuk jačine
    .description = Kratak zvuk kada mijenjate jačinu zvuka
    .preview = Pusti zvuk jačine
settings-sound-kind-screenshots = Snimci ekrana
    .description = Zvuk zatvarača kada se sačuva snimak ekrana
    .preview = Pusti zvuk zatvarača
settings-sound-kind-recording = Snimanje
    .description = Kada snimanje ekrana, kamera ili diktiranje počne i završi
    .preview = Pusti zvuk snimanja
settings-sound-kind-sign-in = Zvuk prijave
    .description = Kada se pojavi vaša radna površina
    .preview = Pusti zvuk prijave
settings-sound-kind-keyboard = Zvuk tipki
    .description = Svaka tipka na tastaturi na ekranu
    .preview = Pusti zvuk tipke

## Power and battery

settings-power-battery = Baterija
settings-power-charging = Punjenje
settings-power-charging-at = Punjenje snagom { $power }
settings-power-charging-until-full = Punjenje, još { $time } do pune baterije
settings-power-charging-at-until-full = Punjenje snagom { $power }, još { $time } do pune baterije
settings-power-on-battery = Na bateriji
settings-power-on-battery-using = Na bateriji, potrošnja { $power }
settings-power-time-left = Još otprilike { $time }
settings-power-time-left-using = Još otprilike { $time }, potrošnja { $power }
settings-power-full = Potpuno napunjena
settings-power-empty = Prazna
settings-power-not-charging = Priključeno, ne puni se
settings-power-health = Stanje baterije
settings-power-capacity = { $full } od { $design } kad je bila nova
settings-power-cycles = { $count ->
    [one] { $cycles } ciklus punjenja
    [few] { $cycles } ciklusa punjenja
   *[other] { $cycles } ciklusa punjenja
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Prikaži postotak
settings-power-show-percentage-description = Prikazuje nivo baterije unutar ikone baterije

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = manje od minute
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minuta
    [few] { $minutes } minute
   *[other] { $minutes } minuta
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } sat
    [few] { $hours } sata
   *[other] { $hours } sati
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } sat
    [few] { $hours } sata
   *[other] { $hours } sati
} { $minutes ->
    [one] { $minutes } minuta
    [few] { $minutes } minute
   *[other] { $minutes } minuta
}
settings-power-never = Nikad

## Charge limit

settings-power-limit = Ograniči punjenje
settings-power-limit-failed = Ograničenje nije moguće promijeniti. Pokušajte ponovo.
settings-power-limit-elsewhere-off = Druga aplikacija ga je isključila, pa se baterija puni do kraja
settings-power-limit-elsewhere-changed = Druga aplikacija je promijenila ograničenje na { $level }
settings-power-limit-elsewhere-on = Druga aplikacija zaustavlja punjenje na { $level }
settings-power-limit-automatic = Računar sam odlučuje kada zaustaviti punjenje
settings-power-limit-stops-at = Punjenje se zaustavlja na { $level }
settings-power-limit-description = Ranije zaustavlja punjenje kako bi baterija duže trajala
settings-power-limit-description-at = Zaustavlja se na { $level } kako bi baterija duže trajala
settings-power-limit-applied = Punjenje se zaustavlja na { $level }
settings-power-limit-applied-description = Postavila druga aplikacija na ovom računaru

## Battery-powered devices

settings-power-devices = Uređaji
settings-power-device-mouse = Miš
settings-power-device-keyboard = Tastatura
settings-power-device-headphones = Slušalice
settings-power-device-speaker = Zvučnik
settings-power-device-controller = Kontroler
settings-power-device-phone = Telefon
settings-power-device-tablet = Tablet
settings-power-device-pen = Olovka
settings-power-device-touchpad = Dodirna podloga
settings-power-device-other = Uređaj

## Power mode

settings-power-mode = Način napajanja
settings-power-mode-row = Način
settings-power-profile-saver = Ušteda energije
    .description = Sporije, uz manju potrošnju
settings-power-profile-balanced = Uravnoteženo
    .description = Uobičajene performanse i potrošnja
settings-power-profile-performance = Performanse
    .description = Brže, uz veću potrošnju
settings-power-limited = Performanse su trenutno ograničene
settings-power-limited-lap = Performanse su ograničene jer je računar u vašem krilu
settings-power-limited-hot = Performanse su ograničene jer je računar previše vruć
settings-power-limited-lap-hot = Performanse su ograničene jer je računar u vašem krilu i previše je vruć
settings-power-saver-low-battery = Ušteda energije pri slaboj bateriji
settings-power-saver-low-battery-description = Prelazi na uštedu energije kada se baterija isprazni

## Keyboard backlight

settings-power-keyboard = Tastatura
settings-power-backlight = Pozadinsko osvjetljenje tastature
settings-power-backlight-off = Isključeno
settings-power-backlight-low = Slabo
settings-power-backlight-medium = Srednje
settings-power-backlight-high = Jako

## Screen and sleep

settings-power-screen = Ekran
settings-power-screen-off = Isključi ekran nakon
settings-power-screen-off-description = Kada neko vrijeme ne koristite računar
settings-power-dim = Zatamni kada je neaktivan
settings-power-dim-description = Smanjuje osvjetljenje malo prije nego što se ekran isključi
settings-power-sleep = Mirovanje
settings-power-suspend-plugged-in = Mirovanje kada je priključen
settings-power-suspend-inactive = Mirovanje kada je neaktivan
settings-power-suspend-description = Prebacuje računar u stanje mirovanja nakon nekog vremena bez korištenja
settings-power-suspend-battery = Mirovanje na bateriji
settings-power-button = Dugme za napajanje
settings-power-button-suspend = Mirovanje
settings-power-button-hibernate = Hibernacija
settings-power-button-ask = Pitaj šta uraditi
settings-power-button-nothing = Ne radi ništa
settings-power-long-sleep = Isključi nakon dugog mirovanja
settings-power-long-sleep-description = Umjesto da se baterija potpuno isprazni tokom mirovanja, računar se isključuje kada baterija postane slaba ili nakon dugog mirovanja na bateriji. Otvoreni prozori se ne čuvaju.
settings-power-long-sleep-failed = Ovo nije moguće promijeniti. Pokušajte ponovo.
settings-power-long-sleep-after = Isključi nakon
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } sat
    [few] { $hours } sata
   *[other] { $hours } sati
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dan
    [few] { $days } dana
   *[other] { $days } dana
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } sedmica
    [few] { $weeks } sedmice
   *[other] { $weeks } sedmica
}

## Keyboard

settings-keyboard-sources = Izvori unosa
settings-keyboard-sources-description = Prvi se koristi kao zadani. Prebacujte se između njih dok kucate.
settings-keyboard-source-edit = Uredi u aplikaciji Keys
settings-keyboard-source-up = Pomakni gore
settings-keyboard-source-down = Pomakni dolje
settings-keyboard-source-remove = Ukloni
settings-keyboard-add-source-button = Dodaj izvor unosa
settings-keyboard-own = Vaši rasporedi i metodi unosa
settings-keyboard-own-layout = Napravi raspored
settings-keyboard-own-layout-description = Krenite od postojećeg rasporeda i promijenite šta njegove tipke kucaju
settings-keyboard-own-method = Napravi metod unosa
settings-keyboard-own-method-description = Pretvara ono što kucate u akcente, druga pisma ili riječi za odabir
settings-keyboard-own-open = Otvori Keys
settings-keyboard-own-open-description = Uredite rasporede i metode unosa koje ste napravili
settings-keyboard-switch-source = Promijeni izvor unosa
settings-keyboard-add-source = Dodavanje izvora unosa
settings-keyboard-add-source-description = Odaberite raspored tastature ili metod unosa kojim želite kucati.
settings-keyboard-add-source-search = Pretraži jezike, rasporede i metode unosa
settings-keyboard-input-method = Metod unosa
settings-keyboard-add-source-no-match = Ništa ne odgovara pojmu „{ $query }“
settings-keyboard-cancel = Otkaži
settings-keyboard-add = Dodaj
settings-keyboard-typing = Kucanje
settings-keyboard-repeat = Ponavljanje tipki
settings-keyboard-repeat-description = Dok držite tipku, ona se kuca iznova i iznova
settings-keyboard-repeat-delay = Kašnjenje prije ponavljanja
settings-keyboard-repeat-delay-shorter = Kraće
settings-keyboard-repeat-delay-longer = Duže
settings-keyboard-repeat-speed = Brzina ponavljanja
settings-keyboard-repeat-speed-slower = Sporije
settings-keyboard-repeat-speed-faster = Brže
settings-keyboard-caps-lock = Tipka Caps Lock
settings-keyboard-caps-lock-description = Šta se dešava kada je pritisnete
settings-keyboard-caps-lock-escape = Escape
settings-keyboard-caps-lock-swap-escape = Zamijeni s tipkom Escape
settings-keyboard-caps-lock-nothing = Ništa
settings-keyboard-caps-lock-custom = Prilagođeno
settings-keyboard-lock-notices = Prikaži Caps Lock i Num Lock
settings-keyboard-lock-notices-description = Nakratko se prikazuje na ekranu kada se jedna od njih uključi ili isključi
settings-keyboard-dictation-on = Uključeno
settings-keyboard-dictation-off = Isključeno
settings-keyboard-shortcuts-description = Pregledajte i promijenite prečice ili dodajte svoje

## Copilot key

settings-keyboard-copilot = Tipka Copilot
settings-keyboard-copilot-press = Pritisak
settings-keyboard-copilot-press-description = Šta radi kratki pritisak tipke
settings-keyboard-copilot-open-start = Otvori meni Start
settings-keyboard-copilot-open-app = Otvori aplikaciju
settings-keyboard-copilot-nothing = Ništa
settings-keyboard-copilot-app = Aplikacija
settings-keyboard-copilot-no-app = Aplikacija još nije odabrana
settings-keyboard-copilot-change = Promijeni
settings-keyboard-copilot-choose = Odaberi
settings-keyboard-copilot-hold = Držanje za diktiranje
settings-keyboard-copilot-hold-description = Držite tipku i govorite da biste upisali ono što kažete
settings-keyboard-copilot-hold-off = Radi kada je diktiranje uključeno
settings-keyboard-copilot-choose-app = Odaberite aplikaciju
settings-keyboard-copilot-choose-app-description = Pritiskom na tipku Copilot otvara se ova aplikacija.

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
settings-keys-space = Razmaknica
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Meni
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Pojačaj zvuk
settings-keys-volume-down = Utišaj zvuk
settings-keys-mute = Isključi zvuk
settings-keys-microphone-mute = Isključi mikrofon
settings-keys-play = Reprodukuj
settings-keys-media-pause = Pauza
settings-keys-stop = Zaustavi
settings-keys-next-track = Sljedeća pjesma
settings-keys-previous-track = Prethodna pjesma
settings-keys-brightness-up = Pojačaj osvjetljenje
settings-keys-brightness-down = Smanji osvjetljenje
settings-keys-browser = Preglednik
settings-keys-home-page = Početna stranica
settings-keys-search = Pretraga
settings-keys-mail = Pošta
settings-keys-calculator = Kalkulator
settings-keys-files = Fajlovi
settings-keys-eject = Izbaci
settings-keys-power = Napajanje
settings-keys-lock = Zaključaj

## Keyboard shortcuts

settings-shortcuts-title = Prečice na tastaturi
settings-shortcuts-search = Pretraži prečice
settings-shortcuts-category-system = Sistem
settings-shortcuts-category-windows = Prozori
settings-shortcuts-category-workspaces = Radni prostori
settings-shortcuts-category-screenshots = Snimci ekrana
settings-shortcuts-category-media = Mediji
settings-shortcuts-reset = Vrati na zadano
settings-shortcuts-apps = Prečice aplikacija
settings-shortcuts-apps-description = Prečice koje su aplikacije zatražile, a rade i kada aplikacija nije u prvom planu
settings-shortcuts-no-match = Nijedna prečica ne odgovara pojmu „{ $query }“
settings-shortcuts-change = Promijeni prečicu: { $name }
settings-shortcuts-or = ili
settings-shortcuts-not-set = Nije postavljeno
settings-shortcuts-press-keys = Pritisnite željene tipke
settings-shortcuts-needs-modifier = Dodajte Ctrl, Alt ili Super da prečica ne smeta pri kucanju.
settings-shortcuts-record-description = Pritisnite novu prečicu. Backspace je isključuje, Escape otkazuje.
settings-shortcuts-record-taken = Ova prečica se već koristi za „{ $name }“. Ako je zamijenite, tamo će se isključiti.
settings-shortcuts-try-another = Pokušaj drugu
settings-shortcuts-replace = Zamijeni
settings-shortcuts-cancel = Otkaži
settings-shortcuts-custom = Prilagođene prečice
settings-shortcuts-custom-description = Pokrenite naredbu ili otvorite aplikaciju kombinacijom tipki
settings-shortcuts-untitled = Bez naziva
settings-shortcuts-add = Dodaj prečicu
settings-shortcuts-edit = Uredi prečicu
settings-shortcuts-custom-name = Naziv
settings-shortcuts-custom-command = Naredba
settings-shortcuts-custom-shortcut = Prečica
settings-shortcuts-custom-taken = Već se koristi za „{ $name }“. Ako sačuvate, tamo će se isključiti.
settings-shortcuts-remove = Ukloni
settings-shortcuts-save = Sačuvaj
settings-shortcuts-add-button = Dodaj

## Dictation

settings-dictation-title = Diktiranje
settings-dictation-description = Držite { $keys } i govorite da biste upisali ono što kažete, u bilo kojoj aplikaciji. Pustite da završite ili pritisnite Escape da otkažete. Sve se dešava na ovom računaru: vaš glas ga nikada ne napušta i ne čuva se.
settings-dictation-description-no-shortcut = Odaberite prečicu ispod da biste diktirali. Sve se dešava na ovom računaru: vaš glas ga nikada ne napušta i ne čuva se.
settings-dictation-not-installed = Diktiranje nije instalirano na ovom računaru
settings-dictation-hold = Držite { $keys } za diktiranje
settings-dictation-needs-shortcut = Isključeno dok nema prečicu
settings-dictation-copilot-key = tipku Copilot
settings-dictation-shortcut = Prečica
settings-dictation-shortcut-description = Držite je dok govorite ili je pritisnite da sluša dok je ponovo ne pritisnete ili ne prestanete govoriti
settings-dictation-shortcut-own = Moja prečica
settings-dictation-shortcut-another = Druga prečica…
settings-dictation-shortcut-off = Isključeno
settings-dictation-keys = Tipke
settings-dictation-change = Promijeni
settings-dictation-language = Jezik
settings-dictation-language-automatic = Automatski
settings-dictation-language-automatic-current = Automatski ({ $language })
settings-dictation-language-description = Automatski prati raspored tastature kojim kucate
settings-dictation-language-unavailable = Jezik { $language } nije dostupan na ovom računaru
settings-dictation-engine = Prepoznavanje govora
settings-dictation-engine-automatic = Automatski
settings-dictation-engine-description = { $engine } prepoznaje jezik { $language }
settings-dictation-engine-graphics-card = { $engine } prepoznaje jezik { $language } na grafičkoj kartici
settings-dictation-models = Modeli govora
settings-dictation-models-description = Modeli se preuzimaju jednom i čuvaju na ovom računaru.
settings-dictation-credits = Zasluge
settings-dictation-credit = { $credit }. Licenca: { $licence }.
settings-dictation-learn-more = Saznajte više

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Preuzimanje nije uspjelo: { $reason }
settings-dictation-model-downloading = { $received } od { $total }
settings-dictation-model-installed = { $size } na ovom računaru
settings-dictation-model-partial = Preuzeto { $received } od { $total }
settings-dictation-model-size = { $size } za preuzimanje
settings-dictation-model-retry = Pokušaj ponovo
settings-dictation-model-cancel = Otkaži
settings-dictation-model-resume = Nastavi
settings-dictation-model-download = Preuzmi
settings-dictation-model-remove = Ukloni

## Mouse and touchpad

settings-mouse-mouse = Miš
settings-mouse-primary-button = Primarno dugme
settings-mouse-primary-button-description = Dugme kojim klikate da biste nešto odabrali
settings-mouse-primary-button-left = Lijevo
settings-mouse-primary-button-right = Desno
settings-mouse-speed = Brzina pokazivača
settings-mouse-slower = Sporije
settings-mouse-faster = Brže
settings-mouse-acceleration = Ubrzanje miša
settings-mouse-acceleration-description = Pokazivač prelazi veću udaljenost kada brzo pomjerate miš
settings-mouse-natural-scrolling = Prirodno skrolanje
settings-mouse-natural-scrolling-description = Skrolanje pomjera sadržaj umjesto prikaza
settings-mouse-touchpad = Dodirna podloga
settings-mouse-touchpad-speed = Brzina pokazivača na dodirnoj podlozi
settings-mouse-touchpad-scroll-speed = Brzina skrolanja
settings-mouse-touchpad-scroll-speed-label = Brzina skrolanja na dodirnoj podlozi
settings-mouse-touchpad-tap = Dodir za klik
settings-mouse-touchpad-tap-description = Dodirnite podlogu umjesto da je pritisnete
settings-mouse-touchpad-natural-scrolling = Prirodno skrolanje na dodirnoj podlozi
settings-mouse-touchpad-natural-scrolling-description = Sadržaj se pomjera u istom smjeru kao vaši prsti
settings-mouse-touchpad-scroll-with = Skrolanje
settings-mouse-touchpad-two-fingers = Dva prsta
settings-mouse-touchpad-scroll-edge = Rub
settings-mouse-touchpad-secondary-click = Sekundarni klik
settings-mouse-touchpad-secondary-click-description = Kako napraviti desni klik bez posebnog dugmeta
settings-mouse-touchpad-click-corner = Ugao
settings-mouse-touchpad-disable-typing = Isključi tokom kucanja
settings-mouse-touchpad-disable-typing-description = Da pokazivač ne skače dok kucate
