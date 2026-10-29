## Displays

settings-display-mirror = Zrcaljenje zaslonov
settings-display-mirror-description = Na vseh zaslonih prikaže isto sliko
settings-display-mirrored = Zrcaljeni zasloni
settings-display-display = Zaslon
settings-display-apply-failed = Te nastavitve niso delovale. Poskusite z drugačno postavitvijo.
settings-display-reset = Ponastavi
settings-display-apply = Uporabi
settings-display-arrangement-main = { $name }, glavni zaslon
settings-display-use = Uporabi ta zaslon
settings-display-main = Glavni zaslon
settings-display-main-description = Tu se prikazujejo opravilna vrstica in nova okna
settings-display-resolution-title = Ločljivost
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Hitrost osveževanja
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Spremenljiva hitrost osveževanja
settings-display-variable-refresh-description = Zaslon sledi hitrosti sličic iger v celozaslonskem načinu, zato je gibanje bolj tekoče
settings-display-variable-refresh-off = Izklopljeno
settings-display-variable-refresh-games = V igrah
settings-display-variable-refresh-fullscreen = V vseh celozaslonskih aplikacijah
settings-display-scale = Merilo
settings-display-scale-description = Poveča ali pomanjša besedilo, aplikacije in vse drugo
settings-display-orientation = Usmerjenost
settings-display-orientation-landscape = Ležeče
settings-display-orientation-portrait-right = Pokončno, desno
settings-display-orientation-portrait-left = Pokončno, levo
settings-display-orientation-landscape-flipped = Ležeče, obrnjeno

## Display brightness

settings-display-brightness = Svetlost
settings-display-brightness-label = Svetlost zaslona { $name }
settings-display-brightness-unsupported = Če želite svetlost spreminjati tukaj, v meniju zaslona vklopite DDC/CI
settings-display-brightness-unresponsive = Trenutno se ne odziva, kmalu sledi nov poskus
settings-display-brightness-external = Zunanji zasloni
settings-display-brightness-missing-tool = Če želite njihovo svetlost spreminjati tukaj, namestite ddcutil
settings-display-brightness-needs-restart = Za dokončanje nastavitve svetlosti znova zaženite računalnik
settings-display-brightness-no-access = Če želite njihovo svetlost spreminjati tukaj, se odjavite in znova prijavite

## Night light

settings-display-night-light = Nočna svetloba
settings-display-night-light-description = Toplejše barve zvečer, ki so prijaznejše do oči
settings-display-night-light-schedule = Urnik
settings-display-night-light-automatic = Od sončnega zahoda do vzhoda
settings-display-night-light-custom = Po meri
settings-display-night-light-from = Vklop
settings-display-night-light-to = Izklop
settings-display-night-light-warmth = Toplina

## Sound

settings-sound-output = Izhod
settings-sound-input = Vhod
settings-sound-device = Naprava
settings-sound-output-device = Izhodna naprava
settings-sound-input-device = Vhodna naprava
settings-sound-connection = Priključek
settings-sound-output-connection = Izhodni priključek
settings-sound-input-connection = Vhodni priključek
settings-sound-volume = Glasnost
settings-sound-mute = Izklopi zvok: { $name }
settings-sound-unmute = Vklopi zvok: { $name }
settings-sound-balance = Ravnovesje
settings-sound-balance-center = Sredina
settings-sound-balance-left = { $share } levo
settings-sound-balance-right = { $share } desno
settings-sound-louder = Dovoli glasnost nad 100 %
settings-sound-louder-description = Pri večji glasnosti je zvok lahko popačen
settings-sound-input-level = Raven vhoda
settings-sound-apps = Glasnost aplikacij
settings-sound-apps-playing = { $count ->
    [one] { $count } aplikacija predvaja zvok
    [two] { $count } aplikaciji predvajata zvok
    [few] { $count } aplikacije predvajajo zvok
   *[other] { $count } aplikacij predvaja zvok
}
settings-sound-app-output = Izhod za aplikacijo { $app }
settings-sound-profiles = Profili naprav
settings-sound-profiles-row-description = Izberite, kako se uporablja posamezna zvočna naprava
settings-sound-profiles-description = Kako se uporablja posamezna zvočna naprava, na primer stereo ali prostorski zvok
settings-sound-profile-label = Uporaba naprave { $device }
settings-sound-profile-off = Izklopljeno

## System sounds

settings-sound-system = Sistemski zvoki
settings-sound-system-description = Zvoki za obvestila, naprave in druge dogodke
settings-sound-system-volume = Glasnost sistemskih zvokov
settings-sound-kind-notifications = Obvestila
    .description = Tiho med Ne moti, igrami in deljenjem zaslona
    .preview = Predvajaj zvok obvestila
settings-sound-kind-devices = Naprave in polnjenje
    .description = Priključitev naprave ali polnilnika in skoraj prazna baterija
    .preview = Predvajaj zvok naprave
settings-sound-kind-volume = Odziv glasnosti
    .description = Tik ob spremembi glasnosti
    .preview = Predvajaj tik glasnosti
settings-sound-kind-screenshots = Posnetki zaslona
    .description = Zvok zaklopa ob shranjenem posnetku zaslona
    .preview = Predvajaj zvok zaklopa
settings-sound-kind-recording = Snemanje
    .description = Ob začetku in koncu snemanja zaslona, uporabe kamere ali narekovanja
    .preview = Predvajaj zvok snemanja
settings-sound-kind-sign-in = Zvok prijave
    .description = Ko se prikaže namizje
    .preview = Predvajaj zvok prijave
settings-sound-kind-keyboard = Zvok tipk
    .description = Vsaka tipka na zaslonski tipkovnici
    .preview = Predvajaj zvok tipke

## Power and battery

settings-power-battery = Baterija
settings-power-charging = Polnjenje
settings-power-charging-at = Polnjenje z { $power }
settings-power-charging-until-full = Polnjenje, polna bo čez { $time }
settings-power-charging-at-until-full = Polnjenje z { $power }, polna bo čez { $time }
settings-power-on-battery = Na bateriji
settings-power-on-battery-using = Na bateriji, poraba { $power }
settings-power-time-left = Zdrži še približno { $time }
settings-power-time-left-using = Zdrži še približno { $time }, poraba { $power }
settings-power-full = Popolnoma napolnjena
settings-power-empty = Prazna
settings-power-not-charging = Priključena, se ne polni
settings-power-health = Stanje baterije
settings-power-capacity = { $full } od { $design }, ko je bila nova
settings-power-cycles = { $count ->
    [one] { $cycles } cikel polnjenja
    [two] { $cycles } cikla polnjenja
    [few] { $cycles } cikli polnjenja
   *[other] { $cycles } ciklov polnjenja
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Pokaži odstotek
settings-power-show-percentage-description = Raven baterije prikaže v ikoni baterije

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = manj kot minuto
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minuto
    [two] { $minutes } minuti
    [few] { $minutes } minute
   *[other] { $minutes } minut
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } uro
    [two] { $hours } uri
    [few] { $hours } ure
   *[other] { $hours } ur
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } uro
    [two] { $hours } uri
    [few] { $hours } ure
   *[other] { $hours } ur
} { $minutes ->
    [one] { $minutes } minuto
    [two] { $minutes } minuti
    [few] { $minutes } minute
   *[other] { $minutes } minut
}
settings-power-never = Nikoli

## Charge limit

settings-power-limit = Omejitev polnjenja
settings-power-limit-failed = Omejitve ni bilo mogoče spremeniti. Poskusite znova.
settings-power-limit-elsewhere-off = Druga aplikacija jo je izklopila, zato se baterija napolni do konca
settings-power-limit-elsewhere-changed = Druga aplikacija je omejitev spremenila na { $level }
settings-power-limit-elsewhere-on = Druga aplikacija ustavi polnjenje pri { $level }
settings-power-limit-automatic = Računalnik sam odloči, kdaj ustavi polnjenje
settings-power-limit-stops-at = Polnjenje se ustavi pri { $level }
settings-power-limit-description = Polnjenje se ustavi prej, da baterija dlje zdrži
settings-power-limit-description-at = Ustavi se pri { $level }, da baterija dlje zdrži
settings-power-limit-applied = Polnjenje se ustavi pri { $level }
settings-power-limit-applied-description = Nastavila jo je druga aplikacija v tem računalniku

## Battery-powered devices

settings-power-devices = Naprave
settings-power-device-mouse = Miška
settings-power-device-keyboard = Tipkovnica
settings-power-device-headphones = Slušalke
settings-power-device-speaker = Zvočnik
settings-power-device-controller = Igralni plošček
settings-power-device-phone = Telefon
settings-power-device-tablet = Tablični računalnik
settings-power-device-pen = Pisalo
settings-power-device-touchpad = Sledilna ploščica
settings-power-device-other = Naprava

## Power mode

settings-power-mode = Način napajanja
settings-power-mode-row = Način
settings-power-profile-saver = Varčevanje z energijo
    .description = Počasneje in z manjšo porabo
settings-power-profile-balanced = Uravnoteženo
    .description = Običajna zmogljivost in poraba
settings-power-profile-performance = Zmogljivost
    .description = Hitreje in z večjo porabo
settings-power-limited = Zmogljivost je trenutno omejena
settings-power-limited-lap = Zmogljivost je omejena, ker je računalnik v vašem naročju
settings-power-limited-hot = Zmogljivost je omejena, ker je računalnik prevroč
settings-power-limited-lap-hot = Zmogljivost je omejena, ker je računalnik v vašem naročju in prevroč
settings-power-saver-low-battery = Varčevanje ob skoraj prazni bateriji
settings-power-saver-low-battery-description = Ko je baterija skoraj prazna, preklopi na varčevanje z energijo
settings-power-saver-level = Raven baterije za varčevanje z energijo

## Keyboard backlight

settings-power-keyboard = Tipkovnica
settings-power-backlight = Osvetlitev tipkovnice
settings-power-backlight-off = Izklopljeno
settings-power-backlight-low = Nizka
settings-power-backlight-medium = Srednja
settings-power-backlight-high = Visoka

## Screen and sleep

settings-power-screen = Zaslon
settings-power-screen-off = Izklopi zaslon čez
settings-power-screen-off-description = Ko računalnika nekaj časa ne uporabljate
settings-power-dim = Zatemni ob nedejavnosti
settings-power-dim-description = Tik preden se zaslon izklopi, zmanjša svetlost
settings-power-sleep = Spanje
settings-power-suspend-plugged-in = Spanje, ko je priključen
settings-power-suspend-inactive = Spanje ob nedejavnosti
settings-power-suspend-description = Računalnik po določenem času neuporabe preklopi v stanje spanja
settings-power-suspend-battery = Spanje na bateriji
settings-power-button = Gumb za vklop
settings-power-button-suspend = Spanje
settings-power-button-hibernate = Mirovanje
settings-power-button-ask = Vprašaj, kaj naj naredi
settings-power-button-nothing = Ne naredi ničesar
settings-power-long-sleep = Zaustavitev po dolgem spanju
settings-power-long-sleep-description = Da se baterija med spanjem ne izprazni do konca, se računalnik zaustavi, ko je baterija skoraj prazna ali po dolgem spanju na bateriji. Odprta okna se ne ohranijo.
settings-power-long-sleep-failed = Tega ni bilo mogoče spremeniti. Poskusite znova.
settings-power-long-sleep-after = Zaustavi čez
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } uro
    [two] { $hours } uri
    [few] { $hours } ure
   *[other] { $hours } ur
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dan
    [two] { $days } dneva
    [few] { $days } dni
   *[other] { $days } dni
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } teden
    [two] { $weeks } tedna
    [few] { $weeks } tedne
   *[other] { $weeks } tednov
}

## Keyboard

settings-keyboard-sources = Viri vnosa
settings-keyboard-sources-description = Prvi se uporablja privzeto. Med tipkanjem lahko preklapljate med njimi.
settings-keyboard-source-edit = Uredi v aplikaciji Keys
settings-keyboard-source-up = Premakni gor
settings-keyboard-source-down = Premakni dol
settings-keyboard-source-remove = Odstrani
settings-keyboard-add-source-button = Dodaj vir vnosa
settings-keyboard-own = Lastne razporeditve in načini vnosa
settings-keyboard-own-layout = Ustvari razporeditev
settings-keyboard-own-layout-description = Začnite z obstoječo razporeditvijo in spremenite, kaj vnašajo tipke
settings-keyboard-own-method = Ustvari način vnosa
settings-keyboard-own-method-description = Vneseno besedilo spremenite v naglašene črke, druge pisave ali besede, med katerimi izbirate
settings-keyboard-own-open = Odpri Keys
settings-keyboard-own-open-description = Urejajte razporeditve in načine vnosa, ki ste jih ustvarili
settings-keyboard-switch-source = Preklopi vir vnosa
settings-keyboard-add-source = Dodajanje vira vnosa
settings-keyboard-add-source-description = Izberite razporeditev tipkovnice ali način vnosa, s katerim želite tipkati.
settings-keyboard-add-source-search = Iskanje jezikov, razporeditev in načinov vnosa
settings-keyboard-input-method = Način vnosa
settings-keyboard-add-source-no-match = Ni zadetkov za „{ $query }“
settings-keyboard-cancel = Prekliči
settings-keyboard-add = Dodaj
settings-keyboard-typing = Tipkanje
settings-keyboard-repeat = Ponavljanje tipk
settings-keyboard-repeat-description = Ko držite tipko, se znak vnaša znova in znova
settings-keyboard-repeat-delay = Zakasnitev pred ponavljanjem
settings-keyboard-repeat-delay-shorter = Krajša
settings-keyboard-repeat-delay-longer = Daljša
settings-keyboard-repeat-speed = Hitrost ponavljanja
settings-keyboard-repeat-speed-slower = Počasneje
settings-keyboard-repeat-speed-faster = Hitreje
settings-keyboard-caps-lock = Tipka Caps Lock
settings-keyboard-caps-lock-description = Kaj se zgodi, ko jo pritisnete
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Zamenjaj z Esc
settings-keyboard-caps-lock-nothing = Nič
settings-keyboard-caps-lock-custom = Po meri
settings-keyboard-lock-notices = Pokaži Caps Lock in Num Lock
settings-keyboard-lock-notices-description = Ob vklopu ali izklopu katere koli od njiju se za kratek čas prikaže na zaslonu
settings-keyboard-dictation-on = Vklopljeno
settings-keyboard-dictation-off = Izklopljeno
settings-keyboard-shortcuts-description = Oglejte si in spremenite bližnjice ali dodajte svoje

## Copilot key

settings-keyboard-copilot = Tipka Copilot
settings-keyboard-copilot-press = Pritisk
settings-keyboard-copilot-press-description = Kaj naredi kratek pritisk tipke
settings-keyboard-copilot-open-start = Odpri meni Start
settings-keyboard-copilot-open-app = Odpri aplikacijo
settings-keyboard-copilot-nothing = Nič
settings-keyboard-copilot-app = Aplikacija
settings-keyboard-copilot-no-app = Aplikacija še ni izbrana
settings-keyboard-copilot-change = Spremeni
settings-keyboard-copilot-choose = Izberi
settings-keyboard-copilot-hold = Pridržanje za narekovanje
settings-keyboard-copilot-hold-description = Pridržite tipko in govorite, da se izgovorjeno vnese kot besedilo
settings-keyboard-copilot-hold-off = Deluje, ko je narekovanje vklopljeno
settings-keyboard-copilot-choose-app = Izbira aplikacije
settings-keyboard-copilot-choose-app-description = Ob pritisku tipke Copilot se odpre izbrana aplikacija.

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
settings-keys-space = Preslednica
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Meni
settings-keys-keypad = Številčnica { $key }
settings-keys-volume-up = Glasneje
settings-keys-volume-down = Tiše
settings-keys-mute = Izklop zvoka
settings-keys-microphone-mute = Izklop mikrofona
settings-keys-play = Predvajaj
settings-keys-media-pause = Premor
settings-keys-stop = Ustavi
settings-keys-next-track = Naslednja skladba
settings-keys-previous-track = Prejšnja skladba
settings-keys-brightness-up = Svetleje
settings-keys-brightness-down = Temneje
settings-keys-browser = Brskalnik
settings-keys-home-page = Domača stran
settings-keys-search = Iskanje
settings-keys-mail = Pošta
settings-keys-calculator = Kalkulator
settings-keys-files = Datoteke
settings-keys-eject = Izvrzi
settings-keys-power = Vklop
settings-keys-lock = Zaklep

## Keyboard shortcuts

settings-shortcuts-title = Bližnjice na tipkovnici
settings-shortcuts-search = Iskanje bližnjic
settings-shortcuts-category-system = Sistem
settings-shortcuts-category-windows = Okna
settings-shortcuts-category-tiling = Tlakovanje
settings-shortcuts-category-workspaces = Delovne površine
settings-shortcuts-category-screenshots = Posnetki zaslona
settings-shortcuts-category-media = Predstavnost
settings-shortcuts-reset = Ponastavi na privzeto
settings-shortcuts-apps = Bližnjice aplikacij
settings-shortcuts-apps-description = Bližnjice, ki so jih zahtevale aplikacije in delujejo, tudi ko aplikacija ni v ospredju
settings-shortcuts-no-match = Nobena bližnjica se ne ujema z „{ $query }“
settings-shortcuts-change = Spremeni bližnjico za { $name }
settings-shortcuts-or = ali
settings-shortcuts-not-set = Ni nastavljeno
settings-shortcuts-press-keys = Pritisnite želene tipke
settings-shortcuts-needs-modifier = Dodajte Ctrl, Alt ali Super, da bližnjica ne bo motila tipkanja.
settings-shortcuts-record-description = Pritisnite novo bližnjico. Backspace jo izklopi, Esc prekliče.
settings-shortcuts-record-taken = Ta bližnjica je že uporabljena za „{ $name }“. Če jo zamenjate, se tam izklopi.
settings-shortcuts-try-another = Poskusi drugo
settings-shortcuts-replace = Zamenjaj
settings-shortcuts-cancel = Prekliči
settings-shortcuts-custom = Bližnjice po meri
settings-shortcuts-custom-description = Zaženite ukaz ali odprite aplikacijo s kombinacijo tipk
settings-shortcuts-untitled = Neimenovana
settings-shortcuts-add = Dodaj bližnjico
settings-shortcuts-edit = Uredi bližnjico
settings-shortcuts-custom-name = Ime
settings-shortcuts-custom-command = Ukaz
settings-shortcuts-custom-shortcut = Bližnjica
settings-shortcuts-custom-taken = Že uporabljena za „{ $name }“. Ob shranjevanju se tam izklopi.
settings-shortcuts-remove = Odstrani
settings-shortcuts-save = Shrani
settings-shortcuts-add-button = Dodaj

## Dictation

settings-dictation-title = Narekovanje
settings-dictation-description = Pridržite { $keys } in govorite, da se izgovorjeno vnese kot besedilo v kateri koli aplikaciji. Ko spustite, je konec, z Esc pa prekličete. Vse poteka v tem računalniku: vaš glas ga nikoli ne zapusti in se ne shrani.
settings-dictation-description-no-shortcut = Za narekovanje spodaj izberite bližnjico. Vse poteka v tem računalniku: vaš glas ga nikoli ne zapusti in se ne shrani.
settings-dictation-not-installed = Narekovanje v tem računalniku ni nameščeno
settings-dictation-hold = Za narekovanje pridržite { $keys }
settings-dictation-needs-shortcut = Izklopljeno, dokler nima bližnjice
settings-dictation-copilot-key = tipko Copilot
settings-dictation-shortcut = Bližnjica
settings-dictation-shortcut-description = Pridržite jo in govorite ali jo pritisnite, da posluša, dokler je ne pritisnete znova ali ne nehate govoriti
settings-dictation-shortcut-own = Lastna bližnjica
settings-dictation-shortcut-another = Druga bližnjica …
settings-dictation-shortcut-off = Izklopljeno
settings-dictation-keys = Tipke
settings-dictation-change = Spremeni
settings-dictation-language = Jezik
settings-dictation-language-automatic = Samodejno
settings-dictation-language-automatic-current = Samodejno ({ $language })
settings-dictation-language-description = Samodejno sledi razporeditvi tipkovnice, s katero tipkate
settings-dictation-language-unavailable = Jezik { $language } v tem računalniku ni na voljo
settings-dictation-engine = Prepoznavalnik govora
settings-dictation-engine-automatic = Samodejno
settings-dictation-engine-description = { $engine } prepoznava jezik { $language }
settings-dictation-engine-graphics-card = { $engine } prepoznava jezik { $language } z grafično kartico
settings-dictation-models = Govorni modeli
settings-dictation-models-description = Modeli se prenesejo enkrat in ostanejo v tem računalniku.
settings-dictation-credits = Zasluge
settings-dictation-credit = { $credit }. Licenca: { $licence }.
settings-dictation-learn-more = Več o tem

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Prenos ni uspel: { $reason }
settings-dictation-model-downloading = { $received } od { $total }
settings-dictation-model-installed = { $size } v tem računalniku
settings-dictation-model-partial = Preneseno { $received } od { $total }
settings-dictation-model-size = Za prenos: { $size }
settings-dictation-model-retry = Poskusi znova
settings-dictation-model-cancel = Prekliči
settings-dictation-model-resume = Nadaljuj
settings-dictation-model-download = Prenesi
settings-dictation-model-remove = Odstrani

## Mouse and touchpad

settings-mouse-mouse = Miška
settings-mouse-primary-button = Primarni gumb
settings-mouse-primary-button-description = Gumb, s katerim kliknete za izbiranje
settings-mouse-primary-button-left = Levi
settings-mouse-primary-button-right = Desni
settings-mouse-speed = Hitrost kazalca
settings-mouse-slower = Počasneje
settings-mouse-faster = Hitreje
settings-mouse-acceleration = Pospešek miške
settings-mouse-acceleration-description = Kazalec se premakne dlje, ko miško premaknete hitro
settings-mouse-natural-scrolling = Naravno drsenje
settings-mouse-natural-scrolling-description = Drsenje premika vsebino namesto pogleda
settings-mouse-touchpad = Sledilna ploščica
settings-mouse-touchpad-speed = Hitrost kazalca sledilne ploščice
settings-mouse-touchpad-scroll-speed = Hitrost drsenja
settings-mouse-touchpad-scroll-speed-label = Hitrost drsenja s sledilno ploščico
settings-mouse-touchpad-tap = Tapni za klik
settings-mouse-touchpad-tap-description = Tapnite sledilno ploščico, namesto da jo pritisnete
settings-mouse-touchpad-natural-scrolling = Naravno drsenje s sledilno ploščico
settings-mouse-touchpad-natural-scrolling-description = Vsebina se premika v isto smer kot prsti
settings-mouse-touchpad-scroll-with = Drsenje z
settings-mouse-touchpad-two-fingers = Dvema prstoma
settings-mouse-touchpad-scroll-edge = Robom
settings-mouse-touchpad-secondary-click = Sekundarni klik
settings-mouse-touchpad-secondary-click-description = Kako desno klikniti brez ločenega gumba
settings-mouse-touchpad-click-corner = Kotom
settings-mouse-touchpad-disable-typing = Onemogoči med tipkanjem
settings-mouse-touchpad-disable-typing-description = Da kazalec med tipkanjem ne skače
