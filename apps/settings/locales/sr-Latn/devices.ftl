## Displays

settings-display-mirror = Preslikaj ekrane
settings-display-mirror-description = Prikazuje istu sliku na svim ekranima
settings-display-mirrored = Preslikani ekrani
settings-display-display = Ekran
settings-display-apply-failed = Ova podešavanja ne rade. Probajte drugačiji raspored.
settings-display-reset = Vrati
settings-display-apply = Primeni
settings-display-arrangement-main = { $name }, glavni ekran
settings-display-use = Koristi ovaj ekran
settings-display-main = Glavni ekran
settings-display-main-description = Tu se prikazuju traka zadataka i novi prozori
settings-display-resolution-title = Rezolucija
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Učestalost osvežavanja
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Promenljiva učestalost osvežavanja
settings-display-variable-refresh-description = Ekran prati broj sličica u igrama preko celog ekrana, za glatkiji pokret
settings-display-variable-refresh-off = Isključeno
settings-display-variable-refresh-games = U igrama
settings-display-variable-refresh-fullscreen = U svim aplikacijama preko celog ekrana
settings-display-scale = Razmera
settings-display-scale-description = Povećava ili smanjuje tekst, aplikacije i sve ostalo
settings-display-orientation = Orijentacija
settings-display-orientation-landscape = Položeno
settings-display-orientation-portrait-right = Uspravno, udesno
settings-display-orientation-portrait-left = Uspravno, ulevo
settings-display-orientation-landscape-flipped = Položeno, obrnuto

## Display brightness

settings-display-brightness = Osvetljenost
settings-display-brightness-label = Osvetljenost: { $name }
settings-display-brightness-unsupported = Uključite DDC/CI u meniju ekrana da biste je menjali ovde
settings-display-brightness-unresponsive = Trenutno ne odgovara, uskoro sledi novi pokušaj
settings-display-brightness-external = Spoljni ekrani
settings-display-brightness-missing-tool = Instalirajte ddcutil da biste ovde menjali njihovu osvetljenost
settings-display-brightness-needs-restart = Ponovo pokrenite računar da biste dovršili podešavanje njihove osvetljenosti
settings-display-brightness-no-access = Odjavite se i ponovo prijavite da biste ovde menjali njihovu osvetljenost

## Night light

settings-display-night-light = Noćno svetlo
settings-display-night-light-description = Toplije boje uveče, prijatnije za oči
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
settings-sound-balance-left = { $share } levo
settings-sound-balance-right = { $share } desno
settings-sound-louder = Dozvoli jačinu preko 100%
settings-sound-louder-description = Zvuk može da se izobliči pri većoj jačini
settings-sound-input-level = Nivo ulaza
settings-sound-apps = Jačina zvuka aplikacija
settings-sound-apps-playing = { $count ->
    [one] { $count } aplikacija pušta zvuk
    [few] { $count } aplikacije puštaju zvuk
   *[other] { $count } aplikacija pušta zvuk
}
settings-sound-app-output = Izlaz zvuka za { $app }
settings-sound-profiles = Profili uređaja
settings-sound-profiles-row-description = Izaberite kako se koristi svaki zvučni uređaj
settings-sound-profiles-description = Kako se koristi svaki zvučni uređaj, na primer stereo ili suraund
settings-sound-profile-label = Kako se koristi { $device }
settings-sound-profile-off = Isključeno

## System sounds

settings-sound-system = Sistemski zvukovi
settings-sound-system-description = Zvukovi za obaveštenja, uređaje i druge događaje
settings-sound-system-volume = Jačina sistemskih zvukova
settings-sound-kind-notifications = Obaveštenja
    .description = Utišani tokom režima Ne uznemiravaj, igara i deljenja ekrana
    .preview = Pusti zvuk obaveštenja
settings-sound-kind-devices = Uređaji i punjenje
    .description = Povezivanje uređaja ili punjača i slaba baterija
    .preview = Pusti zvuk uređaja
settings-sound-kind-volume = Zvuk pri promeni jačine
    .description = Kratak zvuk kada menjate jačinu zvuka
    .preview = Pusti zvuk jačine
settings-sound-kind-screenshots = Snimci ekrana
    .description = Zvuk zatvarača kada se sačuva snimak ekrana
    .preview = Pusti zvuk zatvarača
settings-sound-kind-recording = Snimanje
    .description = Kada snimanje ekrana, kamera ili diktiranje počne ili se zaustavi
    .preview = Pusti zvuk snimanja
settings-sound-kind-sign-in = Zvuk prijave
    .description = Kada se pojavi radna površina
    .preview = Pusti zvuk prijave
settings-sound-kind-keyboard = Zvuk tastature
    .description = Svaki taster na tastaturi na ekranu
    .preview = Pusti zvuk tastera

## Power and battery

settings-power-battery = Baterija
settings-power-charging = Punjenje
settings-power-charging-at = Puni se snagom od { $power }
settings-power-charging-until-full = Puni se, biće puna za { $time }
settings-power-charging-at-until-full = Puni se snagom od { $power }, biće puna za { $time }
settings-power-on-battery = Radi na bateriju
settings-power-on-battery-using = Radi na bateriju, troši { $power }
settings-power-time-left = Preostalo još oko { $time }
settings-power-time-left-using = Preostalo još oko { $time }, troši { $power }
settings-power-full = Potpuno napunjena
settings-power-empty = Prazna
settings-power-not-charging = Priključena, ne puni se
settings-power-health = Stanje baterije
settings-power-capacity = { $full } od { $design } kada je bila nova
settings-power-cycles = { $count ->
    [one] { $cycles } ciklus punjenja
    [few] { $cycles } ciklusa punjenja
   *[other] { $cycles } ciklusa punjenja
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Prikaži procenat
settings-power-show-percentage-description = Prikazuje nivo baterije unutar ikone baterije

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = manje od minuta
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minut
    [few] { $minutes } minuta
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
    [one] { $minutes } minut
    [few] { $minutes } minuta
   *[other] { $minutes } minuta
}
settings-power-never = Nikad

## Charge limit

settings-power-limit = Ograniči punjenje
settings-power-limit-failed = Ograničenje nije moglo da se promeni. Pokušajte ponovo.
settings-power-limit-elsewhere-off = Druga aplikacija ga je isključila, pa se baterija puni do kraja
settings-power-limit-elsewhere-changed = Druga aplikacija je promenila ograničenje na { $level }
settings-power-limit-elsewhere-on = Druga aplikacija zaustavlja punjenje na { $level }
settings-power-limit-automatic = Računar sam odlučuje kada da zaustavi punjenje
settings-power-limit-stops-at = Punjenje se zaustavlja na { $level }
settings-power-limit-description = Ranije zaustavlja punjenje da bi baterija duže trajala
settings-power-limit-description-at = Zaustavlja punjenje na { $level } da bi baterija duže trajala
settings-power-limit-applied = Punjenje se zaustavlja na { $level }
settings-power-limit-applied-description = Podesila ga je druga aplikacija na ovom računaru

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
settings-power-device-touchpad = Tačped
settings-power-device-other = Uređaj

## Power mode

settings-power-mode = Režim napajanja
settings-power-mode-row = Režim
settings-power-profile-saver = Ušteda energije
    .description = Sporije, uz manju potrošnju
settings-power-profile-balanced = Uravnoteženo
    .description = Standardne performanse i potrošnja
settings-power-profile-performance = Performanse
    .description = Brže, uz veću potrošnju
settings-power-limited = Performanse su trenutno ograničene
settings-power-limited-lap = Performanse su ograničene jer je računar u krilu
settings-power-limited-hot = Performanse su ograničene jer je računar previše vruć
settings-power-limited-lap-hot = Performanse su ograničene jer je računar u krilu i previše vruć
settings-power-saver-low-battery = Ušteda energije pri slaboj bateriji
settings-power-saver-low-battery-description = Uključuje uštedu energije kada baterija počne da se prazni

## Keyboard backlight

settings-power-keyboard = Tastatura
settings-power-backlight = Pozadinsko osvetljenje tastature
settings-power-backlight-off = Isključeno
settings-power-backlight-low = Slabo
settings-power-backlight-medium = Srednje
settings-power-backlight-high = Jako

## Screen and sleep

settings-power-screen = Ekran
settings-power-screen-off = Isključi ekran posle
settings-power-screen-off-description = Kada neko vreme ne koristite računar
settings-power-dim = Zatamni pri neaktivnosti
settings-power-dim-description = Smanjuje osvetljenost malo pre nego što se ekran isključi
settings-power-sleep = Spavanje
settings-power-suspend-plugged-in = Stanje spavanja kada je priključen
settings-power-suspend-inactive = Stanje spavanja pri neaktivnosti
settings-power-suspend-description = Prebacuje računar u stanje spavanja kad se neko vreme ne koristi
settings-power-suspend-battery = Stanje spavanja na bateriji
settings-power-button = Dugme za napajanje
settings-power-button-suspend = Spavanje
settings-power-button-hibernate = Hibernacija
settings-power-button-ask = Pitaj šta da radi
settings-power-button-nothing = Ne radi ništa
settings-power-long-sleep = Isključi posle dugog spavanja
settings-power-long-sleep-description = Umesto da se baterija potpuno isprazni tokom spavanja, računar se isključuje kada baterija oslabi ili posle dugog spavanja na bateriji. Otvoreni prozori se ne čuvaju.
settings-power-long-sleep-failed = Ovo nije moglo da se promeni. Pokušajte ponovo.
settings-power-long-sleep-after = Isključi posle
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
    [one] { $weeks } nedelja
    [few] { $weeks } nedelje
   *[other] { $weeks } nedelja
}

## Keyboard

settings-keyboard-sources = Izvori unosa
settings-keyboard-sources-description = Prvi se koristi podrazumevano. Menjajte ih dok kucate.
settings-keyboard-source-edit = Uredi u aplikaciji Keys
settings-keyboard-source-up = Pomeri nagore
settings-keyboard-source-down = Pomeri nadole
settings-keyboard-source-remove = Ukloni
settings-keyboard-add-source-button = Dodaj izvor unosa
settings-keyboard-own = Vaši rasporedi i metodi unosa
settings-keyboard-own-layout = Napravi raspored
settings-keyboard-own-layout-description = Počnite od postojećeg rasporeda i promenite šta njegovi tasteri kucaju
settings-keyboard-own-method = Napravi metod unosa
settings-keyboard-own-method-description = Pretvara ono što kucate u akcente, druga pisma ili reči za izbor
settings-keyboard-own-open = Otvori Keys
settings-keyboard-own-open-description = Uredite rasporede i metode unosa koje ste napravili
settings-keyboard-switch-source = Promeni izvor unosa
settings-keyboard-add-source = Dodavanje izvora unosa
settings-keyboard-add-source-description = Izaberite raspored tastature ili metod unosa kojim želite da kucate.
settings-keyboard-add-source-search = Pretraži jezike, rasporede i metode unosa
settings-keyboard-input-method = Metod unosa
settings-keyboard-add-source-no-match = Ništa se ne poklapa sa „{ $query }“
settings-keyboard-cancel = Otkaži
settings-keyboard-add = Dodaj
settings-keyboard-typing = Kucanje
settings-keyboard-repeat = Ponavljanje tastera
settings-keyboard-repeat-description = Držanje tastera ga kuca iznova i iznova
settings-keyboard-repeat-delay = Pauza pre ponavljanja
settings-keyboard-repeat-delay-shorter = Kraća
settings-keyboard-repeat-delay-longer = Duža
settings-keyboard-repeat-speed = Brzina ponavljanja
settings-keyboard-repeat-speed-slower = Sporije
settings-keyboard-repeat-speed-faster = Brže
settings-keyboard-caps-lock = Taster Caps Lock
settings-keyboard-caps-lock-description = Šta se dešava kada ga pritisnete
settings-keyboard-caps-lock-escape = Escape
settings-keyboard-caps-lock-swap-escape = Zameni sa Escape
settings-keyboard-caps-lock-nothing = Ništa
settings-keyboard-caps-lock-custom = Prilagođeno
settings-keyboard-lock-notices = Prikaži Caps Lock i Num Lock
settings-keyboard-lock-notices-description = Nakratko prikazuje na ekranu kada se neki od njih uključi ili isključi
settings-keyboard-dictation-on = Uključeno
settings-keyboard-dictation-off = Isključeno
settings-keyboard-shortcuts-description = Pregledajte i menjajte prečice ili dodajte svoje

## Copilot key

settings-keyboard-copilot = Taster Copilot
settings-keyboard-copilot-press = Pritisak
settings-keyboard-copilot-press-description = Šta radi kratak pritisak tastera
settings-keyboard-copilot-open-start = Otvori Start
settings-keyboard-copilot-open-app = Otvori aplikaciju
settings-keyboard-copilot-nothing = Ništa
settings-keyboard-copilot-app = Aplikacija
settings-keyboard-copilot-no-app = Aplikacija još nije izabrana
settings-keyboard-copilot-change = Promeni
settings-keyboard-copilot-choose = Izaberi
settings-keyboard-copilot-hold = Drži za diktiranje
settings-keyboard-copilot-hold-description = Držite taster i govorite da biste otkucali ono što kažete
settings-keyboard-copilot-hold-off = Radi kada je diktiranje uključeno
settings-keyboard-copilot-choose-app = Izaberite aplikaciju
settings-keyboard-copilot-choose-app-description = Otvara se pritiskom na taster Copilot.

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
settings-keys-space = Razmak
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Meni
settings-keys-keypad = Numerički { $key }
settings-keys-volume-up = Pojačaj zvuk
settings-keys-volume-down = Utišaj zvuk
settings-keys-mute = Isključi zvuk
settings-keys-microphone-mute = Isključi mikrofon
settings-keys-play = Pusti
settings-keys-media-pause = Pauza
settings-keys-stop = Zaustavi
settings-keys-next-track = Sledeća numera
settings-keys-previous-track = Prethodna numera
settings-keys-brightness-up = Pojačaj osvetljenost
settings-keys-brightness-down = Smanji osvetljenost
settings-keys-browser = Pregledač
settings-keys-home-page = Početna stranica
settings-keys-search = Pretraga
settings-keys-mail = Pošta
settings-keys-calculator = Kalkulator
settings-keys-files = Datoteke
settings-keys-eject = Izbaci
settings-keys-power = Napajanje
settings-keys-lock = Zaključaj

## Keyboard shortcuts

settings-shortcuts-title = Tasterske prečice
settings-shortcuts-search = Pretraži prečice
settings-shortcuts-category-system = Sistem
settings-shortcuts-category-windows = Prozori
settings-shortcuts-category-tiling = Popločavanje
settings-shortcuts-category-workspaces = Radni prostori
settings-shortcuts-category-screenshots = Snimci ekrana
settings-shortcuts-category-media = Mediji
settings-shortcuts-reset = Vrati podrazumevano
settings-shortcuts-apps = Prečice aplikacija
settings-shortcuts-apps-description = Prečice koje su aplikacije zatražile, a rade i kada aplikacija nije u prvom planu
settings-shortcuts-no-match = Nijedna prečica se ne poklapa sa „{ $query }“
settings-shortcuts-change = Promeni prečicu za { $name }
settings-shortcuts-or = ili
settings-shortcuts-not-set = Nije podešeno
settings-shortcuts-press-keys = Pritisnite željene tastere
settings-shortcuts-needs-modifier = Dodajte Ctrl, Alt ili Super da prečica ne bi smetala pri kucanju.
settings-shortcuts-record-description = Pritisnite novu prečicu. Backspace je isključuje, Escape otkazuje.
settings-shortcuts-record-taken = Ova prečica se već koristi za „{ $name }“. Ako je zamenite, tamo će biti isključena.
settings-shortcuts-try-another = Probaj drugu
settings-shortcuts-replace = Zameni
settings-shortcuts-cancel = Otkaži
settings-shortcuts-custom = Prilagođene prečice
settings-shortcuts-custom-description = Pokrenite komandu ili otvorite aplikaciju kombinacijom tastera
settings-shortcuts-untitled = Bez naziva
settings-shortcuts-add = Dodaj prečicu
settings-shortcuts-edit = Uredi prečicu
settings-shortcuts-custom-name = Naziv
settings-shortcuts-custom-command = Komanda
settings-shortcuts-custom-shortcut = Prečica
settings-shortcuts-custom-taken = Već se koristi za „{ $name }“. Čuvanjem će tamo biti isključena.
settings-shortcuts-remove = Ukloni
settings-shortcuts-save = Sačuvaj
settings-shortcuts-add-button = Dodaj

## Dictation

settings-dictation-title = Diktiranje
settings-dictation-description = Držite { $keys } i govorite da biste otkucali ono što kažete, u bilo kojoj aplikaciji. Pustite da biste završili ili pritisnite Escape da biste otkazali. Sve se dešava na ovom računaru: vaš glas ga nikada ne napušta i ne čuva se.
settings-dictation-description-no-shortcut = Izaberite prečicu ispod da biste diktirali. Sve se dešava na ovom računaru: vaš glas ga nikada ne napušta i ne čuva se.
settings-dictation-not-installed = Diktiranje nije instalirano na ovom računaru
settings-dictation-hold = Držite { $keys } za diktiranje
settings-dictation-needs-shortcut = Isključeno dok nema prečicu
settings-dictation-copilot-key = taster Copilot
settings-dictation-shortcut = Prečica
settings-dictation-shortcut-description = Držite je dok govorite ili je pritisnite da sluša dok je ponovo ne pritisnete ili ne prestanete da govorite
settings-dictation-shortcut-own = Moja prečica
settings-dictation-shortcut-another = Druga prečica…
settings-dictation-shortcut-off = Isključeno
settings-dictation-keys = Tasteri
settings-dictation-change = Promeni
settings-dictation-language = Jezik
settings-dictation-language-automatic = Automatski
settings-dictation-language-automatic-current = Automatski ({ $language })
settings-dictation-language-description = Automatski izbor prati raspored tastature kojim kucate
settings-dictation-language-unavailable = Jezik { $language } nije dostupan na ovom računaru
settings-dictation-engine = Prepoznavanje govora
settings-dictation-engine-automatic = Automatski
settings-dictation-engine-description = { $engine } prepoznaje jezik { $language }
settings-dictation-engine-graphics-card = { $engine } prepoznaje jezik { $language } na grafičkoj kartici
settings-dictation-models = Govorni modeli
settings-dictation-models-description = Modeli se preuzimaju jednom i čuvaju na ovom računaru.
settings-dictation-credits = Zasluge
settings-dictation-credit = { $credit }. Licenca: { $licence }.
settings-dictation-learn-more = Saznajte više

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Preuzimanje nije uspelo: { $reason }
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
settings-mouse-primary-button-description = Dugme kojim klikćete da biste nešto izabrali
settings-mouse-primary-button-left = Levo
settings-mouse-primary-button-right = Desno
settings-mouse-speed = Brzina pokazivača
settings-mouse-slower = Sporije
settings-mouse-faster = Brže
settings-mouse-acceleration = Ubrzanje miša
settings-mouse-acceleration-description = Pokazivač prelazi veći put kada brzo pomerite miš
settings-mouse-natural-scrolling = Prirodno pomeranje
settings-mouse-natural-scrolling-description = Pomeranje pomera sadržaj umesto prikaza
settings-mouse-touchpad = Tačped
settings-mouse-touchpad-speed = Brzina pokazivača na tačpedu
settings-mouse-touchpad-scroll-speed = Brzina pomeranja
settings-mouse-touchpad-scroll-speed-label = Brzina pomeranja na tačpedu
settings-mouse-touchpad-tap = Dodir za klik
settings-mouse-touchpad-tap-description = Dodirnite tačped umesto da ga pritiskate
settings-mouse-touchpad-natural-scrolling = Prirodno pomeranje na tačpedu
settings-mouse-touchpad-natural-scrolling-description = Sadržaj se pomera u istom smeru kao prsti
settings-mouse-touchpad-scroll-with = Pomeranje pomoću
settings-mouse-touchpad-two-fingers = Dva prsta
settings-mouse-touchpad-scroll-edge = Ivica
settings-mouse-touchpad-secondary-click = Sekundarni klik
settings-mouse-touchpad-secondary-click-description = Kako da kliknete desnim tasterom bez posebnog dugmeta
settings-mouse-touchpad-click-corner = Ugao
settings-mouse-touchpad-disable-typing = Isključi tokom kucanja
settings-mouse-touchpad-disable-typing-description = Da pokazivač ne bi skakao dok kucate
