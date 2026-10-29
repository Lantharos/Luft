## Displays

settings-display-mirror = Dublēt displejus
settings-display-mirror-description = Visos displejos rāda vienu un to pašu attēlu
settings-display-mirrored = Dublēti displeji
settings-display-display = Displejs
settings-display-apply-failed = Šie iestatījumi nedarbojās. Izmēģiniet citu konfigurāciju.
settings-display-reset = Atiestatīt
settings-display-apply = Lietot
settings-display-arrangement-main = { $name }, galvenais displejs
settings-display-use = Izmantot šo displeju
settings-display-main = Galvenais displejs
settings-display-main-description = Šeit tiek rādīta uzdevumjosla un jaunie logi
settings-display-resolution-title = Izšķirtspēja
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Atsvaidzes intensitāte
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Mainīga atsvaidzes intensitāte
settings-display-variable-refresh-description = Ļauj displejam sekot pilnekrāna spēļu kadru nomaiņas ātrumam, lai kustība būtu plūdenāka
settings-display-variable-refresh-off = Izslēgta
settings-display-variable-refresh-games = Spēlēs
settings-display-variable-refresh-fullscreen = Visās pilnekrāna lietotnēs
settings-display-scale = Mērogs
settings-display-scale-description = Padara tekstu, lietotnes un visu pārējo lielāku vai mazāku
settings-display-orientation = Orientācija
settings-display-orientation-landscape = Ainava
settings-display-orientation-portrait-right = Portrets pa labi
settings-display-orientation-portrait-left = Portrets pa kreisi
settings-display-orientation-landscape-flipped = Ainava, apgriezta

## Display brightness

settings-display-brightness = Spilgtums
settings-display-brightness-label = Displeja { $name } spilgtums
settings-display-brightness-unsupported = Lai spilgtumu mainītu šeit, ieslēdziet DDC/CI displeja izvēlnē
settings-display-brightness-unresponsive = Pašlaik neatbild, drīz tiks mēģināts vēlreiz
settings-display-brightness-external = Ārējie displeji
settings-display-brightness-missing-tool = Lai to spilgtumu mainītu šeit, instalējiet ddcutil
settings-display-brightness-needs-restart = Restartējiet, lai pabeigtu to spilgtuma iestatīšanu
settings-display-brightness-no-access = Lai to spilgtumu mainītu šeit, izrakstieties un pierakstieties vēlreiz

## Night light

settings-display-night-light = Nakts gaisma
settings-display-night-light-description = Siltākas krāsas vakarā, saudzīgākas acīm
settings-display-night-light-schedule = Grafiks
settings-display-night-light-automatic = No saulrieta līdz saullēktam
settings-display-night-light-custom = Pielāgots
settings-display-night-light-from = Ieslēdzas
settings-display-night-light-to = Izslēdzas
settings-display-night-light-warmth = Siltums

## Sound

settings-sound-output = Izvade
settings-sound-input = Ievade
settings-sound-device = Ierīce
settings-sound-output-device = Izvades ierīce
settings-sound-input-device = Ievades ierīce
settings-sound-connection = Savienojums
settings-sound-output-connection = Izvades savienojums
settings-sound-input-connection = Ievades savienojums
settings-sound-volume = Skaļums
settings-sound-mute = Izslēgt skaņu: { $name }
settings-sound-unmute = Ieslēgt skaņu: { $name }
settings-sound-balance = Balanss
settings-sound-balance-center = Centrā
settings-sound-balance-left = { $share } pa kreisi
settings-sound-balance-right = { $share } pa labi
settings-sound-louder = Atļaut skaļumu virs 100 %
settings-sound-louder-description = Lielā skaļumā skaņa var kropļoties
settings-sound-input-level = Ievades līmenis
settings-sound-apps = Lietotņu skaļums
settings-sound-apps-playing = { $count ->
    [zero] { $count } lietotnes atskaņo skaņu
    [one] { $count } lietotne atskaņo skaņu
   *[other] { $count } lietotnes atskaņo skaņu
}
settings-sound-app-output = Lietotnes { $app } izvade
settings-sound-profiles = Ierīču profili
settings-sound-profiles-row-description = Izvēlieties, kā tiek izmantota katra skaņas ierīce
settings-sound-profiles-description = Kā tiek izmantota katra skaņas ierīce, piemēram, stereo vai telpiskā skaņa
settings-sound-profile-label = Ierīces { $device } lietojums
settings-sound-profile-off = Izslēgta

## System sounds

settings-sound-system = Sistēmas skaņas
settings-sound-system-description = Skaņas paziņojumiem, ierīcēm un citiem notikumiem
settings-sound-system-volume = Sistēmas skaņu skaļums
settings-sound-kind-notifications = Paziņojumi
    .description = Klusē režīmā Netraucēt, spēļu un ekrāna kopīgošanas laikā
    .preview = Atskaņot paziņojuma skaņu
settings-sound-kind-devices = Ierīces un uzlāde
    .description = Ierīces vai lādētāja pievienošana un zems akumulatora uzlādes līmenis
    .preview = Atskaņot ierīces skaņu
settings-sound-kind-volume = Skaļuma maiņas skaņa
    .description = Klikšķis, kad maināt skaļumu
    .preview = Atskaņot skaļuma klikšķi
settings-sound-kind-screenshots = Ekrānuzņēmumi
    .description = Slēdža skaņa, kad tiek saglabāts ekrānuzņēmums
    .preview = Atskaņot slēdža skaņu
settings-sound-kind-recording = Ierakstīšana
    .description = Kad sākas un beidzas ekrāna ierakstīšana, kameras izmantošana vai diktēšana
    .preview = Atskaņot ierakstīšanas skaņu
settings-sound-kind-sign-in = Pierakstīšanās skaņa
    .description = Kad parādās jūsu darbvirsma
    .preview = Atskaņot pierakstīšanās skaņu
settings-sound-kind-keyboard = Taustiņu skaņas
    .description = Katrs ekrāntastatūras taustiņš
    .preview = Atskaņot taustiņa skaņu

## Power and battery

settings-power-battery = Akumulators
settings-power-charging = Notiek uzlāde
settings-power-charging-at = Notiek uzlāde, { $power }
settings-power-charging-until-full = Notiek uzlāde, līdz pilnai uzlādei: { $time }
settings-power-charging-at-until-full = Notiek uzlāde, { $power }, līdz pilnai uzlādei: { $time }
settings-power-on-battery = Darbojas ar akumulatoru
settings-power-on-battery-using = Darbojas ar akumulatoru, patēriņš { $power }
settings-power-time-left = Atlikušais laiks: aptuveni { $time }
settings-power-time-left-using = Atlikušais laiks: aptuveni { $time }, patēriņš { $power }
settings-power-full = Pilnībā uzlādēts
settings-power-empty = Izlādējies
settings-power-not-charging = Pievienots barošanai, netiek uzlādēts
settings-power-health = Akumulatora stāvoklis
settings-power-capacity = { $full } no sākotnējās ietilpības { $design }
settings-power-cycles = { $count ->
    [zero] { $cycles } uzlādes cikli
    [one] { $cycles } uzlādes cikls
   *[other] { $cycles } uzlādes cikli
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Rādīt procentus
settings-power-show-percentage-description = Rāda akumulatora uzlādes līmeni akumulatora ikonā

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = mazāk nekā minūte
settings-power-duration-minutes = { $minutes ->
    [zero] { $minutes } minūtes
    [one] { $minutes } minūte
   *[other] { $minutes } minūtes
}
settings-power-duration-hours = { $hours ->
    [zero] { $hours } stundas
    [one] { $hours } stunda
   *[other] { $hours } stundas
}
settings-power-duration-hours-minutes = { $hours ->
    [zero] { $hours } stundas
    [one] { $hours } stunda
   *[other] { $hours } stundas
} { $minutes ->
    [zero] { $minutes } minūtes
    [one] { $minutes } minūte
   *[other] { $minutes } minūtes
}
settings-power-never = Nekad

## Charge limit

settings-power-limit = Ierobežot uzlādi
settings-power-limit-failed = Ierobežojumu neizdevās mainīt. Mēģiniet vēlreiz.
settings-power-limit-elsewhere-off = Cita lietotne to izslēdza, tāpēc akumulators tiek uzlādēts pilnībā
settings-power-limit-elsewhere-changed = Cita lietotne mainīja ierobežojumu uz { $level }
settings-power-limit-elsewhere-on = Cita lietotne aptur uzlādi pie { $level }
settings-power-limit-automatic = Dators pats izlemj, kad apturēt uzlādi
settings-power-limit-stops-at = Uzlāde tiek apturēta pie { $level }
settings-power-limit-description = Aptur uzlādi agrāk, lai akumulators kalpotu ilgāk
settings-power-limit-description-at = Aptur pie { $level }, lai akumulators kalpotu ilgāk
settings-power-limit-applied = Uzlāde tiek apturēta pie { $level }
settings-power-limit-applied-description = Iestatījusi cita lietotne šajā datorā

## Battery-powered devices

settings-power-devices = Ierīces
settings-power-device-mouse = Pele
settings-power-device-keyboard = Tastatūra
settings-power-device-headphones = Austiņas
settings-power-device-speaker = Skaļrunis
settings-power-device-controller = Kontrolieris
settings-power-device-phone = Tālrunis
settings-power-device-tablet = Planšetdators
settings-power-device-pen = Pildspalva
settings-power-device-touchpad = Skārienpaliktnis
settings-power-device-other = Ierīce

## Power mode

settings-power-mode = Enerģijas režīms
settings-power-mode-row = Režīms
settings-power-profile-saver = Enerģijas taupīšana
    .description = Lēnāk, mazāks enerģijas patēriņš
settings-power-profile-balanced = Līdzsvarots
    .description = Standarta veiktspēja un enerģijas patēriņš
settings-power-profile-performance = Veiktspēja
    .description = Ātrāk, lielāks enerģijas patēriņš
settings-power-limited = Veiktspēja pašlaik ir ierobežota
settings-power-limited-lap = Veiktspēja ir ierobežota, jo dators atrodas uz jūsu ceļgaliem
settings-power-limited-hot = Veiktspēja ir ierobežota, jo dators ir pārāk karsts
settings-power-limited-lap-hot = Veiktspēja ir ierobežota, jo dators atrodas uz jūsu ceļgaliem un ir pārāk karsts
settings-power-saver-low-battery = Enerģijas taupīšana, kad akumulators ir gandrīz tukšs
settings-power-saver-low-battery-description = Ieslēdz enerģijas taupīšanu, kad akumulatora uzlādes līmenis kļūst zems
settings-power-saver-level = Akumulatora līmenis enerģijas taupīšanai

## Keyboard backlight

settings-power-keyboard = Tastatūra
settings-power-backlight = Tastatūras apgaismojums
settings-power-backlight-off = Izslēgts
settings-power-backlight-low = Vājš
settings-power-backlight-medium = Vidējs
settings-power-backlight-high = Spēcīgs

## Screen and sleep

settings-power-screen = Ekrāns
settings-power-screen-off = Izslēgt ekrānu pēc
settings-power-screen-off-description = Kad datoru kādu laiku neizmantojat
settings-power-dim = Aptumšot neaktivitātes laikā
settings-power-dim-description = Samazina spilgtumu neilgi pirms ekrāna izslēgšanās
settings-power-sleep = Miega režīms
settings-power-suspend-plugged-in = Miega režīms, kad pievienots barošanai
settings-power-suspend-inactive = Miega režīms neaktivitātes laikā
settings-power-suspend-description = Pārslēdz datoru miega režīmā, ja tas kādu laiku netiek izmantots
settings-power-suspend-battery = Miega režīms, darbojoties ar akumulatoru
settings-power-button = Barošanas poga
settings-power-button-suspend = Miega režīms
settings-power-button-hibernate = Hibernēt
settings-power-button-ask = Jautāt, ko darīt
settings-power-button-nothing = Neko nedarīt
settings-power-long-sleep = Izslēgt pēc ilga miega
settings-power-long-sleep-description = Lai miega režīmā akumulators neizlādētos pilnībā, dators izslēdzas, kad akumulatora uzlādes līmenis kļūst zems vai pēc ilga miega, darbojoties ar akumulatoru. Atvērtie logi netiek saglabāti.
settings-power-long-sleep-failed = To neizdevās mainīt. Mēģiniet vēlreiz.
settings-power-long-sleep-after = Izslēgt pēc
settings-power-long-sleep-hours = { $hours ->
    [zero] { $hours } stundas
    [one] { $hours } stunda
   *[other] { $hours } stundas
}
settings-power-long-sleep-days = { $days ->
    [zero] { $days } dienas
    [one] { $days } diena
   *[other] { $days } dienas
}
settings-power-long-sleep-weeks = { $weeks ->
    [zero] { $weeks } nedēļas
    [one] { $weeks } nedēļa
   *[other] { $weeks } nedēļas
}

## Keyboard

settings-keyboard-sources = Ievades avoti
settings-keyboard-sources-description = Pirmais tiek izmantots pēc noklusējuma. Rakstot varat pārslēgties starp tiem.
settings-keyboard-source-edit = Rediģēt lietotnē Keys
settings-keyboard-source-up = Pārvietot augšup
settings-keyboard-source-down = Pārvietot lejup
settings-keyboard-source-remove = Noņemt
settings-keyboard-add-source-button = Pievienot ievades avotu
settings-keyboard-own = Jūsu izkārtojumi un ievades metodes
settings-keyboard-own-layout = Izveidot izkārtojumu
settings-keyboard-own-layout-description = Sāciet no esoša izkārtojuma un mainiet, ko raksta tā taustiņi
settings-keyboard-own-method = Izveidot ievades metodi
settings-keyboard-own-method-description = Pārvērtiet rakstīto par burtiem ar diakritiskajām zīmēm, citu rakstību vai vārdiem, no kuriem izvēlēties
settings-keyboard-own-open = Atvērt Keys
settings-keyboard-own-open-description = Rediģēt jūsu izveidotos izkārtojumus un ievades metodes
settings-keyboard-switch-source = Pārslēgt ievades avotu
settings-keyboard-add-source = Pievienot ievades avotu
settings-keyboard-add-source-description = Izvēlieties tastatūras izkārtojumu vai ievades metodi, ar ko rakstīt.
settings-keyboard-add-source-search = Meklēt valodas, izkārtojumus un ievades metodes
settings-keyboard-input-method = Ievades metode
settings-keyboard-add-source-no-match = Nekas neatbilst vaicājumam „{ $query }“
settings-keyboard-cancel = Atcelt
settings-keyboard-add = Pievienot
settings-keyboard-typing = Rakstīšana
settings-keyboard-repeat = Taustiņu atkārtošana
settings-keyboard-repeat-description = Turot taustiņu nospiestu, tas tiek rakstīts atkal un atkal
settings-keyboard-repeat-delay = Aizture pirms atkārtošanas
settings-keyboard-repeat-delay-shorter = Īsāka
settings-keyboard-repeat-delay-longer = Garāka
settings-keyboard-repeat-speed = Atkārtošanas ātrums
settings-keyboard-repeat-speed-slower = Lēnāk
settings-keyboard-repeat-speed-faster = Ātrāk
settings-keyboard-caps-lock = Caps Lock taustiņš
settings-keyboard-caps-lock-description = Kas notiek, to nospiežot
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Apmainīt ar Esc
settings-keyboard-caps-lock-nothing = Nekas
settings-keyboard-caps-lock-custom = Pielāgots
settings-keyboard-lock-notices = Rādīt Caps Lock un Num Lock
settings-keyboard-lock-notices-description = Uz brīdi parāda ekrānā, kad kāds no tiem tiek ieslēgts vai izslēgts
settings-keyboard-dictation-on = Ieslēgta
settings-keyboard-dictation-off = Izslēgta
settings-keyboard-shortcuts-description = Skatiet un mainiet īsinājumtaustiņus vai pievienojiet savus

## Copilot key

settings-keyboard-copilot = Copilot taustiņš
settings-keyboard-copilot-press = Nospiešana
settings-keyboard-copilot-press-description = Ko dara īss taustiņa nospiediens
settings-keyboard-copilot-open-start = Atvērt Start
settings-keyboard-copilot-open-app = Atvērt lietotni
settings-keyboard-copilot-nothing = Neko nedarīt
settings-keyboard-copilot-app = Lietotne
settings-keyboard-copilot-no-app = Lietotne vēl nav izvēlēta
settings-keyboard-copilot-change = Mainīt
settings-keyboard-copilot-choose = Izvēlēties
settings-keyboard-copilot-hold = Turēt, lai diktētu
settings-keyboard-copilot-hold-description = Turiet taustiņu nospiestu un runājiet, lai rakstītu sacīto
settings-keyboard-copilot-hold-off = Darbojas, kad ir ieslēgta diktēšana
settings-keyboard-copilot-choose-app = Izvēlēties lietotni
settings-keyboard-copilot-choose-app-description = Nospiežot Copilot taustiņu, tā tiks atvērta.

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
settings-keys-space = Atstarpe
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Izvēlne
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Skaļāk
settings-keys-volume-down = Klusāk
settings-keys-mute = Izslēgt skaņu
settings-keys-microphone-mute = Izslēgt mikrofonu
settings-keys-play = Atskaņot
settings-keys-media-pause = Pauze
settings-keys-stop = Apturēt
settings-keys-next-track = Nākamais ieraksts
settings-keys-previous-track = Iepriekšējais ieraksts
settings-keys-brightness-up = Spilgtāk
settings-keys-brightness-down = Tumšāk
settings-keys-browser = Pārlūks
settings-keys-home-page = Sākumlapa
settings-keys-search = Meklēt
settings-keys-mail = Pasts
settings-keys-calculator = Kalkulators
settings-keys-files = Faili
settings-keys-eject = Izstumt
settings-keys-power = Barošana
settings-keys-lock = Bloķēt

## Keyboard shortcuts

settings-shortcuts-title = Īsinājumtaustiņi
settings-shortcuts-search = Meklēt īsinājumtaustiņus
settings-shortcuts-category-system = Sistēma
settings-shortcuts-category-windows = Logi
settings-shortcuts-category-tiling = Flīzes
settings-shortcuts-category-workspaces = Darbvietas
settings-shortcuts-category-screenshots = Ekrānuzņēmumi
settings-shortcuts-category-media = Multivide
settings-shortcuts-reset = Atjaunot noklusējumu
settings-shortcuts-apps = Lietotņu īsinājumtaustiņi
settings-shortcuts-apps-description = Tie, ko pieprasījušas lietotnes. Tie darbojas arī tad, ja lietotne nav priekšplānā
settings-shortcuts-no-match = Neviens īsinājumtaustiņš neatbilst vaicājumam „{ $query }“
settings-shortcuts-change = Mainīt īsinājumtaustiņu: { $name }
settings-shortcuts-or = vai
settings-shortcuts-not-set = Nav iestatīts
settings-shortcuts-press-keys = Nospiediet vajadzīgos taustiņus
settings-shortcuts-needs-modifier = Pievienojiet Ctrl, Alt vai Super, lai īsinājumtaustiņš netraucētu rakstīšanai.
settings-shortcuts-record-description = Nospiediet jauno īsinājumtaustiņu. Backspace to izslēdz, Esc atceļ.
settings-shortcuts-record-taken = Šis īsinājumtaustiņš jau tiek izmantots darbībai „{ $name }“. Ja to aizstāsit, tur tas tiks izslēgts.
settings-shortcuts-try-another = Mēģināt citu
settings-shortcuts-replace = Aizstāt
settings-shortcuts-cancel = Atcelt
settings-shortcuts-custom = Pielāgoti īsinājumtaustiņi
settings-shortcuts-custom-description = Palaidiet komandu vai atveriet lietotni ar taustiņu kombināciju
settings-shortcuts-untitled = Bez nosaukuma
settings-shortcuts-add = Pievienot īsinājumtaustiņu
settings-shortcuts-edit = Rediģēt īsinājumtaustiņu
settings-shortcuts-custom-name = Nosaukums
settings-shortcuts-custom-command = Komanda
settings-shortcuts-custom-shortcut = Īsinājumtaustiņš
settings-shortcuts-custom-taken = Jau tiek izmantots darbībai „{ $name }“. Saglabājot to, tur tas tiks izslēgts.
settings-shortcuts-remove = Noņemt
settings-shortcuts-save = Saglabāt
settings-shortcuts-add-button = Pievienot

## Dictation

settings-dictation-title = Diktēšana
settings-dictation-description = Turiet nospiestu { $keys } un runājiet, lai jebkurā lietotnē rakstītu sacīto. Atlaidiet, lai pabeigtu, vai nospiediet Esc, lai atceltu. Viss notiek šajā datorā: jūsu balss to nekad nepamet un netiek saglabāta.
settings-dictation-description-no-shortcut = Lai diktētu, zemāk izvēlieties īsinājumtaustiņu. Viss notiek šajā datorā: jūsu balss to nekad nepamet un netiek saglabāta.
settings-dictation-not-installed = Diktēšana šajā datorā nav instalēta
settings-dictation-hold = Lai diktētu, turiet nospiestu { $keys }
settings-dictation-needs-shortcut = Izslēgta, līdz tiks iestatīts īsinājumtaustiņš
settings-dictation-copilot-key = Copilot taustiņu
settings-dictation-shortcut = Īsinājumtaustiņš
settings-dictation-shortcut-description = Turiet nospiestu, lai runātu, vai nospiediet, lai tiktu klausīts, līdz nospiedīsit vēlreiz vai beigsit runāt
settings-dictation-shortcut-own = Mans īsinājumtaustiņš
settings-dictation-shortcut-another = Cits īsinājumtaustiņš…
settings-dictation-shortcut-off = Izslēgts
settings-dictation-keys = Taustiņi
settings-dictation-change = Mainīt
settings-dictation-language = Valoda
settings-dictation-language-automatic = Automātiski
settings-dictation-language-automatic-current = Automātiski ({ $language })
settings-dictation-language-description = Automātiskais režīms seko tastatūras izkārtojumam, ar kuru rakstāt
settings-dictation-language-unavailable = Šī valoda šajā datorā nav pieejama: { $language }
settings-dictation-engine = Runas atpazinējs
settings-dictation-engine-automatic = Automātiski
settings-dictation-engine-description = { $engine } atpazīst šo valodu: { $language }
settings-dictation-engine-graphics-card = { $engine } atpazīst šo valodu, izmantojot videokarti: { $language }
settings-dictation-models = Runas modeļi
settings-dictation-models-description = Modeļi tiek lejupielādēti vienreiz un glabāti šajā datorā.
settings-dictation-credits = Autori
settings-dictation-credit = { $credit }. Licence: { $licence }.
settings-dictation-learn-more = Uzzināt vairāk

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Neizdevās lejupielādēt: { $reason }
settings-dictation-model-downloading = { $received } no { $total }
settings-dictation-model-installed = Šajā datorā: { $size }
settings-dictation-model-partial = Lejupielādēti { $received } no { $total }
settings-dictation-model-size = Lejupielādējamais apjoms: { $size }
settings-dictation-model-retry = Mēģināt vēlreiz
settings-dictation-model-cancel = Atcelt
settings-dictation-model-resume = Turpināt
settings-dictation-model-download = Lejupielādēt
settings-dictation-model-remove = Noņemt

## Mouse and touchpad

settings-mouse-mouse = Pele
settings-mouse-primary-button = Primārā poga
settings-mouse-primary-button-description = Poga, ar kuru noklikšķināt, lai atlasītu
settings-mouse-primary-button-left = Kreisā
settings-mouse-primary-button-right = Labā
settings-mouse-speed = Rādītāja ātrums
settings-mouse-slower = Lēnāk
settings-mouse-faster = Ātrāk
settings-mouse-acceleration = Peles paātrinājums
settings-mouse-acceleration-description = Ātri kustinot peli, rādītājs pārvietojas tālāk
settings-mouse-natural-scrolling = Dabiskā ritināšana
settings-mouse-natural-scrolling-description = Ritinot pārvietojas saturs, nevis skats
settings-mouse-touchpad = Skārienpaliktnis
settings-mouse-touchpad-speed = Skārienpaliktņa rādītāja ātrums
settings-mouse-touchpad-scroll-speed = Ritināšanas ātrums
settings-mouse-touchpad-scroll-speed-label = Skārienpaliktņa ritināšanas ātrums
settings-mouse-touchpad-tap = Pieskarties, lai noklikšķinātu
settings-mouse-touchpad-tap-description = Pieskarieties skārienpaliktnim, nevis spiediet to
settings-mouse-touchpad-natural-scrolling = Skārienpaliktņa dabiskā ritināšana
settings-mouse-touchpad-natural-scrolling-description = Saturs pārvietojas tajā pašā virzienā, kurā pirksti
settings-mouse-touchpad-scroll-with = Ritināšana
settings-mouse-touchpad-two-fingers = Ar diviem pirkstiem
settings-mouse-touchpad-scroll-edge = Gar malu
settings-mouse-touchpad-secondary-click = Sekundārais klikšķis
settings-mouse-touchpad-secondary-click-description = Kā noklikšķināt ar labo pogu bez atsevišķas pogas
settings-mouse-touchpad-click-corner = Stūris
settings-mouse-touchpad-disable-typing = Atspējot rakstīšanas laikā
settings-mouse-touchpad-disable-typing-description = Lai rādītājs nelēkātu, kamēr rakstāt
