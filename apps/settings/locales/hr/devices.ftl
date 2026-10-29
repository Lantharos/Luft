## Displays

settings-display-mirror = Zrcaljenje zaslona
settings-display-mirror-description = Prikazuje istu sliku na svim zaslonima
settings-display-mirrored = Zrcaljeni zasloni
settings-display-display = Zaslon
settings-display-apply-failed = Ove postavke ne rade. Pokušajte s drugačijim rasporedom.
settings-display-reset = Vrati
settings-display-apply = Primijeni
settings-display-arrangement-main = { $name }, glavni zaslon
settings-display-use = Koristi ovaj zaslon
settings-display-main = Glavni zaslon
settings-display-main-description = Ovdje se prikazuju programska traka i novi prozori
settings-display-resolution-title = Razlučivost
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Frekvencija osvježavanja
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Promjenjiva frekvencija osvježavanja
settings-display-variable-refresh-description = Zaslon prati broj sličica u igrama preko cijelog zaslona za glađe kretanje
settings-display-variable-refresh-off = Isključeno
settings-display-variable-refresh-games = U igrama
settings-display-variable-refresh-fullscreen = U svim aplikacijama preko cijelog zaslona
settings-display-scale = Skaliranje
settings-display-scale-description = Povećava ili smanjuje tekst, aplikacije i sve ostalo
settings-display-orientation = Usmjerenje
settings-display-orientation-landscape = Položeno
settings-display-orientation-portrait-right = Uspravno, udesno
settings-display-orientation-portrait-left = Uspravno, ulijevo
settings-display-orientation-landscape-flipped = Položeno, okrenuto

## Display brightness

settings-display-brightness = Svjetlina
settings-display-brightness-label = Svjetlina: { $name }
settings-display-brightness-unsupported = Uključite DDC/CI u izborniku zaslona da biste je mijenjali ovdje
settings-display-brightness-unresponsive = Trenutačno ne odgovara, uskoro novi pokušaj
settings-display-brightness-external = Vanjski zasloni
settings-display-brightness-missing-tool = Instalirajte ddcutil da biste ovdje mijenjali njihovu svjetlinu
settings-display-brightness-needs-restart = Ponovno pokrenite računalo da biste dovršili postavljanje njihove svjetline
settings-display-brightness-no-access = Odjavite se i ponovno prijavite da biste ovdje mijenjali njihovu svjetlinu

## Night light

settings-display-night-light = Noćno svjetlo
settings-display-night-light-description = Toplije boje navečer, ugodnije za oči
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
settings-sound-volume = Glasnoća
settings-sound-mute = Isključi zvuk: { $name }
settings-sound-unmute = Uključi zvuk: { $name }
settings-sound-balance = Ravnoteža
settings-sound-balance-center = Sredina
settings-sound-balance-left = { $share } lijevo
settings-sound-balance-right = { $share } desno
settings-sound-louder = Dopusti glasnoću iznad 100 %
settings-sound-louder-description = Zvuk se pri većoj glasnoći može izobličiti
settings-sound-input-level = Razina ulaza
settings-sound-apps = Glasnoća aplikacija
settings-sound-apps-playing = { $count ->
    [one] { $count } aplikacija reproducira zvuk
    [few] { $count } aplikacije reproduciraju zvuk
   *[other] { $count } aplikacija reproducira zvuk
}
settings-sound-app-output = Reprodukcija za { $app }
settings-sound-profiles = Profili uređaja
settings-sound-profiles-row-description = Odaberite kako se koristi svaki zvučni uređaj
settings-sound-profiles-description = Kako se koristi svaki zvučni uređaj, npr. stereo ili surround
settings-sound-profile-label = Način korištenja: { $device }
settings-sound-profile-off = Isključeno

## System sounds

settings-sound-system = Zvukovi sustava
settings-sound-system-description = Zvukovi za obavijesti, uređaje i druge događaje
settings-sound-system-volume = Glasnoća zvukova sustava
settings-sound-kind-notifications = Obavijesti
    .description = Utišani tijekom načina Ne ometaj, igara i dijeljenja zaslona
    .preview = Reproduciraj zvuk obavijesti
settings-sound-kind-devices = Uređaji i punjenje
    .description = Priključivanje uređaja ili punjača i slaba baterija
    .preview = Reproduciraj zvuk uređaja
settings-sound-kind-volume = Povratni zvuk glasnoće
    .description = Klik pri promjeni glasnoće
    .preview = Reproduciraj klik glasnoće
settings-sound-kind-screenshots = Snimke zaslona
    .description = Zvuk zatvarača kad se spremi snimka zaslona
    .preview = Reproduciraj zvuk zatvarača
settings-sound-kind-recording = Snimanje
    .description = Kad snimanje zaslona, kamera ili diktiranje započne i završi
    .preview = Reproduciraj zvuk snimanja
settings-sound-kind-sign-in = Zvuk prijave
    .description = Kad se pojavi radna površina
    .preview = Reproduciraj zvuk prijave
settings-sound-kind-keyboard = Zvuk tipkanja
    .description = Svaka tipka na zaslonskoj tipkovnici
    .preview = Reproduciraj zvuk tipke

## Power and battery

settings-power-battery = Baterija
settings-power-charging = Punjenje
settings-power-charging-at = Punjenje snagom { $power }
settings-power-charging-until-full = Punjenje, do kraja još { $time }
settings-power-charging-at-until-full = Punjenje snagom { $power }, do kraja još { $time }
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
settings-power-show-percentage-description = Prikazuje razinu baterije unutar ikone baterije

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
settings-power-limit-failed = Ograničenje nije promijenjeno. Pokušajte ponovno.
settings-power-limit-elsewhere-off = Druga ga je aplikacija isključila pa se baterija puni do kraja
settings-power-limit-elsewhere-changed = Druga je aplikacija promijenila ograničenje na { $level }
settings-power-limit-elsewhere-on = Druga aplikacija zaustavlja punjenje na { $level }
settings-power-limit-automatic = Računalo samo odlučuje kad prestati s punjenjem
settings-power-limit-stops-at = Punjenje se zaustavlja na { $level }
settings-power-limit-description = Ranije zaustavlja punjenje kako bi baterija dulje trajala
settings-power-limit-description-at = Zaustavlja se na { $level } kako bi baterija dulje trajala
settings-power-limit-applied = Punjenje se zaustavlja na { $level }
settings-power-limit-applied-description = Postavila druga aplikacija na ovom računalu

## Battery-powered devices

settings-power-devices = Uređaji
settings-power-device-mouse = Miš
settings-power-device-keyboard = Tipkovnica
settings-power-device-headphones = Slušalice
settings-power-device-speaker = Zvučnik
settings-power-device-controller = Kontroler
settings-power-device-phone = Telefon
settings-power-device-tablet = Tablet
settings-power-device-pen = Olovka
settings-power-device-touchpad = Dodirna pločica
settings-power-device-other = Uređaj

## Power mode

settings-power-mode = Način napajanja
settings-power-mode-row = Način
settings-power-profile-saver = Štednja energije
    .description = Sporije, uz manju potrošnju
settings-power-profile-balanced = Uravnoteženo
    .description = Uobičajene performanse i potrošnja
settings-power-profile-performance = Performanse
    .description = Brže, uz veću potrošnju
settings-power-limited = Performanse su trenutačno ograničene
settings-power-limited-lap = Performanse su ograničene jer je računalo u vašem krilu
settings-power-limited-hot = Performanse su ograničene jer je računalo prevruće
settings-power-limited-lap-hot = Performanse su ograničene jer je računalo u vašem krilu i prevruće je
settings-power-saver-low-battery = Štednja energije pri slaboj bateriji
settings-power-saver-low-battery-description = Prelazi na štednju energije kad je baterija pri kraju
settings-power-saver-level = Razina baterije za štednju energije

## Keyboard backlight

settings-power-keyboard = Tipkovnica
settings-power-backlight = Pozadinsko osvjetljenje tipkovnice
settings-power-backlight-off = Isključeno
settings-power-backlight-low = Slabo
settings-power-backlight-medium = Srednje
settings-power-backlight-high = Jako

## Screen and sleep

settings-power-screen = Zaslon
settings-power-screen-off = Isključi zaslon nakon
settings-power-screen-off-description = Kad računalo neko vrijeme ne koristite
settings-power-dim = Zatamni pri neaktivnosti
settings-power-dim-description = Smanjuje svjetlinu malo prije nego što se zaslon isključi
settings-power-sleep = Stanje mirovanja
settings-power-suspend-plugged-in = Mirovanje kad je priključeno
settings-power-suspend-inactive = Mirovanje pri neaktivnosti
settings-power-suspend-description = Stavlja računalo u stanje mirovanja nakon nekog vremena nekorištenja
settings-power-suspend-battery = Mirovanje na bateriji
settings-power-button = Gumb za uključivanje
settings-power-button-suspend = Mirovanje
settings-power-button-hibernate = Hibernacija
settings-power-button-ask = Pitaj što učiniti
settings-power-button-nothing = Ne čini ništa
settings-power-long-sleep = Isključi nakon dugog mirovanja
settings-power-long-sleep-description = Umjesto da se baterija isprazni tijekom mirovanja, računalo se isključi kad je baterija pri kraju ili nakon dugog mirovanja na bateriji. Otvoreni prozori se ne čuvaju.
settings-power-long-sleep-failed = Promjena nije uspjela. Pokušajte ponovno.
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
    [one] { $weeks } tjedan
    [few] { $weeks } tjedna
   *[other] { $weeks } tjedana
}

## Keyboard

settings-keyboard-sources = Izvori unosa
settings-keyboard-sources-description = Prvi se koristi kao zadani. Između njih možete prebacivati dok tipkate.
settings-keyboard-source-edit = Uredi u aplikaciji Keys
settings-keyboard-source-up = Pomakni gore
settings-keyboard-source-down = Pomakni dolje
settings-keyboard-source-remove = Ukloni
settings-keyboard-add-source-button = Dodaj izvor unosa
settings-keyboard-own = Vlastiti rasporedi i načini unosa
settings-keyboard-own-layout = Izradi raspored
settings-keyboard-own-layout-description = Krenite od postojećeg rasporeda i promijenite što njegove tipke upisuju
settings-keyboard-own-method = Izradi način unosa
settings-keyboard-own-method-description = Pretvara ono što tipkate u naglaske, druga pisma ili riječi za odabir
settings-keyboard-own-open = Otvori Keys
settings-keyboard-own-open-description = Uredite rasporede i načine unosa koje ste izradili
settings-keyboard-switch-source = Promijeni izvor unosa
settings-keyboard-add-source = Dodavanje izvora unosa
settings-keyboard-add-source-description = Odaberite raspored tipkovnice ili način unosa kojim želite tipkati.
settings-keyboard-add-source-search = Pretraži jezike, rasporede i načine unosa
settings-keyboard-input-method = Način unosa
settings-keyboard-add-source-no-match = Ništa ne odgovara upitu „{ $query }“
settings-keyboard-cancel = Odustani
settings-keyboard-add = Dodaj
settings-keyboard-typing = Tipkanje
settings-keyboard-repeat = Ponavljanje tipki
settings-keyboard-repeat-description = Držanjem tipke ona se upisuje iznova i iznova
settings-keyboard-repeat-delay = Odgoda prije ponavljanja
settings-keyboard-repeat-delay-shorter = Kraće
settings-keyboard-repeat-delay-longer = Dulje
settings-keyboard-repeat-speed = Brzina ponavljanja
settings-keyboard-repeat-speed-slower = Sporije
settings-keyboard-repeat-speed-faster = Brže
settings-keyboard-caps-lock = Tipka Caps Lock
settings-keyboard-caps-lock-description = Što se događa kad je pritisnete
settings-keyboard-caps-lock-escape = Escape
settings-keyboard-caps-lock-swap-escape = Zamijeni s tipkom Escape
settings-keyboard-caps-lock-nothing = Ništa
settings-keyboard-caps-lock-custom = Prilagođeno
settings-keyboard-lock-notices = Prikaži Caps Lock i Num Lock
settings-keyboard-lock-notices-description = Nakratko se prikazuje na zaslonu kad se bilo koja uključi ili isključi
settings-keyboard-dictation-on = Uključeno
settings-keyboard-dictation-off = Isključeno
settings-keyboard-shortcuts-description = Pregledajte i promijenite prečace ili dodajte vlastite

## Copilot key

settings-keyboard-copilot = Tipka Copilot
settings-keyboard-copilot-press = Pritisak
settings-keyboard-copilot-press-description = Što čini kratak pritisak tipke
settings-keyboard-copilot-open-start = Otvori Start
settings-keyboard-copilot-open-app = Otvori aplikaciju
settings-keyboard-copilot-nothing = Ništa
settings-keyboard-copilot-app = Aplikacija
settings-keyboard-copilot-no-app = Aplikacija još nije odabrana
settings-keyboard-copilot-change = Promijeni
settings-keyboard-copilot-choose = Odaberi
settings-keyboard-copilot-hold = Držanje za diktiranje
settings-keyboard-copilot-hold-description = Držite tipku i govorite da biste upisali ono što kažete
settings-keyboard-copilot-hold-off = Radi kad je diktiranje uključeno
settings-keyboard-copilot-choose-app = Odaberite aplikaciju
settings-keyboard-copilot-choose-app-description = Pritiskom tipke Copilot otvara se ova aplikacija.

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
settings-keys-menu = Izbornik
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Pojačaj glasnoću
settings-keys-volume-down = Smanji glasnoću
settings-keys-mute = Isključi zvuk
settings-keys-microphone-mute = Isključi mikrofon
settings-keys-play = Reproduciraj
settings-keys-media-pause = Pauza
settings-keys-stop = Zaustavi
settings-keys-next-track = Sljedeća pjesma
settings-keys-previous-track = Prethodna pjesma
settings-keys-brightness-up = Povećaj svjetlinu
settings-keys-brightness-down = Smanji svjetlinu
settings-keys-browser = Preglednik
settings-keys-home-page = Početna stranica
settings-keys-search = Pretraživanje
settings-keys-mail = Pošta
settings-keys-calculator = Kalkulator
settings-keys-files = Datoteke
settings-keys-eject = Izbaci
settings-keys-power = Uključivanje
settings-keys-lock = Zaključaj

## Keyboard shortcuts

settings-shortcuts-title = Tipkovnički prečaci
settings-shortcuts-search = Pretraži prečace
settings-shortcuts-category-system = Sustav
settings-shortcuts-category-windows = Prozori
settings-shortcuts-category-tiling = Popločavanje
settings-shortcuts-category-workspaces = Radni prostori
settings-shortcuts-category-screenshots = Snimke zaslona
settings-shortcuts-category-media = Mediji
settings-shortcuts-reset = Vrati zadano
settings-shortcuts-apps = Prečaci aplikacija
settings-shortcuts-apps-description = Prečaci koje su zatražile aplikacije, a rade i kad aplikacija nije u prvom planu
settings-shortcuts-no-match = Nijedan prečac ne odgovara upitu „{ $query }“
settings-shortcuts-change = Promijeni prečac za { $name }
settings-shortcuts-or = ili
settings-shortcuts-not-set = Nije postavljeno
settings-shortcuts-press-keys = Pritisnite željene tipke
settings-shortcuts-needs-modifier = Dodajte Ctrl, Alt ili Super kako prečac ne bi smetao pri tipkanju.
settings-shortcuts-record-description = Pritisnite novi prečac. Backspace ga isključuje, Escape odustaje.
settings-shortcuts-record-taken = Ovaj se prečac već koristi za „{ $name }“. Zamjenom će se tamo isključiti.
settings-shortcuts-try-another = Pokušaj drugi
settings-shortcuts-replace = Zamijeni
settings-shortcuts-cancel = Odustani
settings-shortcuts-custom = Prilagođeni prečaci
settings-shortcuts-custom-description = Pokrenite naredbu ili otvorite aplikaciju kombinacijom tipki
settings-shortcuts-untitled = Bez naziva
settings-shortcuts-add = Dodaj prečac
settings-shortcuts-edit = Uredi prečac
settings-shortcuts-custom-name = Naziv
settings-shortcuts-custom-command = Naredba
settings-shortcuts-custom-shortcut = Prečac
settings-shortcuts-custom-taken = Već se koristi za „{ $name }“. Spremanjem će se tamo isključiti.
settings-shortcuts-remove = Ukloni
settings-shortcuts-save = Spremi
settings-shortcuts-add-button = Dodaj

## Dictation

settings-dictation-title = Diktiranje
settings-dictation-description = Držite { $keys } i govorite da biste upisali ono što kažete, u bilo kojoj aplikaciji. Pustite za završetak ili pritisnite Escape za odustajanje. Sve se odvija na ovom računalu: vaš glas ga nikad ne napušta i ne sprema se.
settings-dictation-description-no-shortcut = Odaberite prečac u nastavku za diktiranje. Sve se odvija na ovom računalu: vaš glas ga nikad ne napušta i ne sprema se.
settings-dictation-not-installed = Diktiranje nije instalirano na ovom računalu
settings-dictation-hold = Držite { $keys } za diktiranje
settings-dictation-needs-shortcut = Isključeno dok nema prečac
settings-dictation-copilot-key = tipku Copilot
settings-dictation-shortcut = Prečac
settings-dictation-shortcut-description = Držite ga dok govorite ili ga pritisnite i slušanje traje dok ga ponovno ne pritisnete ili ne prestanete govoriti
settings-dictation-shortcut-own = Vlastiti prečac
settings-dictation-shortcut-another = Drugi prečac…
settings-dictation-shortcut-off = Isključeno
settings-dictation-keys = Tipke
settings-dictation-change = Promijeni
settings-dictation-language = Jezik
settings-dictation-language-automatic = Automatski
settings-dictation-language-automatic-current = Automatski ({ $language })
settings-dictation-language-description = Automatski odabir prati raspored tipkovnice kojim tipkate
settings-dictation-language-unavailable = Jezik { $language } nije dostupan na ovom računalu
settings-dictation-engine = Prepoznavanje govora
settings-dictation-engine-automatic = Automatski
settings-dictation-engine-description = { $engine } prepoznaje jezik: { $language }
settings-dictation-engine-graphics-card = { $engine } prepoznaje jezik: { $language }, na grafičkoj kartici
settings-dictation-models = Govorni modeli
settings-dictation-models-description = Modeli se preuzimaju jednom i čuvaju na ovom računalu.
settings-dictation-credits = Zasluge
settings-dictation-credit = { $credit }. Licenca: { $licence }.
settings-dictation-learn-more = Saznajte više

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Preuzimanje nije uspjelo: { $reason }
settings-dictation-model-downloading = { $received } od { $total }
settings-dictation-model-installed = { $size } na ovom računalu
settings-dictation-model-partial = Preuzeto { $received } od { $total }
settings-dictation-model-size = { $size } za preuzimanje
settings-dictation-model-retry = Pokušaj ponovno
settings-dictation-model-cancel = Odustani
settings-dictation-model-resume = Nastavi
settings-dictation-model-download = Preuzmi
settings-dictation-model-remove = Ukloni

## Mouse and touchpad

settings-mouse-mouse = Miš
settings-mouse-primary-button = Primarna tipka
settings-mouse-primary-button-description = Tipka kojom kliknete da biste nešto odabrali
settings-mouse-primary-button-left = Lijeva
settings-mouse-primary-button-right = Desna
settings-mouse-speed = Brzina pokazivača
settings-mouse-slower = Sporije
settings-mouse-faster = Brže
settings-mouse-acceleration = Ubrzanje miša
settings-mouse-acceleration-description = Pokazivač prelazi veću udaljenost kad brzo pomičete miš
settings-mouse-natural-scrolling = Prirodno pomicanje
settings-mouse-natural-scrolling-description = Pomicanjem se pomiče sadržaj, a ne prikaz
settings-mouse-touchpad = Dodirna pločica
settings-mouse-touchpad-speed = Brzina pokazivača dodirne pločice
settings-mouse-touchpad-scroll-speed = Brzina pomicanja
settings-mouse-touchpad-scroll-speed-label = Brzina pomicanja dodirne pločice
settings-mouse-touchpad-tap = Dodir za klik
settings-mouse-touchpad-tap-description = Dodirnite pločicu umjesto da je pritisnete
settings-mouse-touchpad-natural-scrolling = Prirodno pomicanje na dodirnoj pločici
settings-mouse-touchpad-natural-scrolling-description = Sadržaj se pomiče u istom smjeru kao i prsti
settings-mouse-touchpad-scroll-with = Pomicanje
settings-mouse-touchpad-two-fingers = Dva prsta
settings-mouse-touchpad-scroll-edge = Rub
settings-mouse-touchpad-secondary-click = Sekundarni klik
settings-mouse-touchpad-secondary-click-description = Kako kliknuti desnom tipkom bez zasebne tipke
settings-mouse-touchpad-click-corner = Kut
settings-mouse-touchpad-disable-typing = Onemogući tijekom tipkanja
settings-mouse-touchpad-disable-typing-description = Da pokazivač ne bi skakao dok tipkate
