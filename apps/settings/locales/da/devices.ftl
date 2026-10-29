## Displays

settings-display-mirror = Spejl skærme
settings-display-mirror-description = Viser det samme billede på alle skærme
settings-display-mirrored = Spejlede skærme
settings-display-display = Skærm
settings-display-apply-failed = Disse indstillinger virkede ikke. Prøv en anden opsætning.
settings-display-reset = Nulstil
settings-display-apply = Anvend
settings-display-arrangement-main = { $name }, hovedskærm
settings-display-use = Brug denne skærm
settings-display-main = Hovedskærm
settings-display-main-description = Proceslinjen og nye vinduer vises her
settings-display-resolution-title = Opløsning
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Opdateringshastighed
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Variabel opdateringshastighed
settings-display-variable-refresh-description = Lader skærmen følge billedhastigheden i spil i fuld skærm, så bevægelser bliver mere glidende
settings-display-variable-refresh-off = Fra
settings-display-variable-refresh-games = I spil
settings-display-variable-refresh-fullscreen = I alle apps i fuld skærm
settings-display-scale = Skalering
settings-display-scale-description = Gør tekst, apps og alt andet større eller mindre
settings-display-orientation = Retning
settings-display-orientation-landscape = Liggende
settings-display-orientation-portrait-right = Stående, højre
settings-display-orientation-portrait-left = Stående, venstre
settings-display-orientation-landscape-flipped = Liggende, vendt

## Display brightness

settings-display-brightness = Lysstyrke
settings-display-brightness-label = Lysstyrke for { $name }
settings-display-brightness-unsupported = Slå DDC/CI til i skærmens menu for at ændre den her
settings-display-brightness-unresponsive = Svarer ikke lige nu, prøver igen om lidt
settings-display-brightness-external = Eksterne skærme
settings-display-brightness-missing-tool = Installer ddcutil for at ændre deres lysstyrke her
settings-display-brightness-needs-restart = Genstart for at gøre opsætningen af deres lysstyrke færdig
settings-display-brightness-no-access = Log ud og ind igen for at ændre deres lysstyrke her

## Night light

settings-display-night-light = Natlys
settings-display-night-light-description = Varmere farver om aftenen, som er mere skånsomme for øjnene
settings-display-night-light-schedule = Tidsplan
settings-display-night-light-automatic = Fra solnedgang til solopgang
settings-display-night-light-custom = Brugerdefineret
settings-display-night-light-from = Slås til
settings-display-night-light-to = Slås fra
settings-display-night-light-warmth = Varme

## Sound

settings-sound-output = Output
settings-sound-input = Input
settings-sound-device = Enhed
settings-sound-output-device = Outputenhed
settings-sound-input-device = Inputenhed
settings-sound-connection = Tilslutning
settings-sound-output-connection = Outputtilslutning
settings-sound-input-connection = Inputtilslutning
settings-sound-volume = Lydstyrke
settings-sound-mute = Slå lyden fra: { $name }
settings-sound-unmute = Slå lyden til: { $name }
settings-sound-balance = Balance
settings-sound-balance-center = Midte
settings-sound-balance-left = { $share } venstre
settings-sound-balance-right = { $share } højre
settings-sound-louder = Tillad højere end 100 %
settings-sound-louder-description = Lyden kan blive forvrænget ved høj lydstyrke
settings-sound-input-level = Inputniveau
settings-sound-apps = Lydstyrke for apps
settings-sound-apps-playing = { $count ->
    [one] { $count } app afspiller lyd
   *[other] { $count } apps afspiller lyd
}
settings-sound-app-output = Afspil { $app } på
settings-sound-profiles = Enhedsprofiler
settings-sound-profiles-row-description = Vælg, hvordan hver lydenhed bruges
settings-sound-profiles-description = Hvordan hver lydenhed bruges, f.eks. stereo eller surround
settings-sound-profile-label = Sådan bruges { $device }
settings-sound-profile-off = Fra

## System sounds

settings-sound-system = Systemlyde
settings-sound-system-description = Lyde for notifikationer, enheder og andre hændelser
settings-sound-system-volume = Lydstyrke for systemlyde
settings-sound-kind-notifications = Notifikationer
    .description = Lydløse under Forstyr ikke, spil og skærmdeling
    .preview = Afspil notifikationslyden
settings-sound-kind-devices = Enheder og opladning
    .description = Når en enhed eller oplader tilsluttes, og når batteriet er lavt
    .preview = Afspil enhedslyden
settings-sound-kind-volume = Lydstyrkefeedback
    .description = Et klik, når du ændrer lydstyrken
    .preview = Afspil lydstyrkeklikket
settings-sound-kind-screenshots = Skærmbilleder
    .description = En lukkerlyd, når et skærmbillede gemmes
    .preview = Afspil lukkerlyden
settings-sound-kind-recording = Optagelse
    .description = Når skærmoptagelse, kameraet eller diktering starter og stopper
    .preview = Afspil optagelseslyden
settings-sound-kind-sign-in = Loginlyd
    .description = Når dit skrivebord vises
    .preview = Afspil loginlyden
settings-sound-kind-keyboard = Tastetryk
    .description = Hver tast på skærmtastaturet
    .preview = Afspil et tastetryk

## Power and battery

settings-power-battery = Batteri
settings-power-charging = Oplader
settings-power-charging-at = Oplader med { $power }
settings-power-charging-until-full = Oplader, fuldt opladet om { $time }
settings-power-charging-at-until-full = Oplader med { $power }, fuldt opladet om { $time }
settings-power-on-battery = På batteri
settings-power-on-battery-using = På batteri, bruger { $power }
settings-power-time-left = Ca. { $time } tilbage
settings-power-time-left-using = Ca. { $time } tilbage, bruger { $power }
settings-power-full = Fuldt opladet
settings-power-empty = Tomt
settings-power-not-charging = Tilsluttet, oplader ikke
settings-power-health = Batteritilstand
settings-power-capacity = { $full } af { $design } som ny
settings-power-cycles = { $count ->
    [one] { $cycles } opladningscyklus
   *[other] { $cycles } opladningscyklusser
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Vis procent
settings-power-show-percentage-description = Viser batteriniveauet inde i batteriikonet

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = under et minut
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minutter
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } time
   *[other] { $hours } timer
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } time
   *[other] { $hours } timer
} { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minutter
}
settings-power-never = Aldrig

## Charge limit

settings-power-limit = Begræns opladning
settings-power-limit-failed = Grænsen kunne ikke ændres. Prøv igen.
settings-power-limit-elsewhere-off = En anden app har slået den fra, så batteriet oplades helt
settings-power-limit-elsewhere-changed = En anden app har ændret grænsen til { $level }
settings-power-limit-elsewhere-on = En anden app stopper opladningen ved { $level }
settings-power-limit-automatic = Din computer bestemmer, hvornår opladningen stopper
settings-power-limit-stops-at = Stopper opladningen ved { $level }
settings-power-limit-description = Stopper opladningen tidligt, så batteriet holder længere
settings-power-limit-description-at = Stopper ved { $level }, så batteriet holder længere
settings-power-limit-applied = Opladningen stopper ved { $level }
settings-power-limit-applied-description = Indstillet af en anden app på denne computer

## Battery-powered devices

settings-power-devices = Enheder
settings-power-device-mouse = Mus
settings-power-device-keyboard = Tastatur
settings-power-device-headphones = Hovedtelefoner
settings-power-device-speaker = Højttaler
settings-power-device-controller = Controller
settings-power-device-phone = Telefon
settings-power-device-tablet = Tablet
settings-power-device-pen = Pen
settings-power-device-touchpad = Touchpad
settings-power-device-other = Enhed

## Power mode

settings-power-mode = Strømtilstand
settings-power-mode-row = Tilstand
settings-power-profile-saver = Strømbesparelse
    .description = Langsommere og bruger mindre strøm
settings-power-profile-balanced = Balanceret
    .description = Normal ydeevne og strømforbrug
settings-power-profile-performance = Ydeevne
    .description = Hurtigere og bruger mere strøm
settings-power-limited = Ydeevnen er begrænset lige nu
settings-power-limited-lap = Ydeevnen er begrænset, fordi computeren ligger på dit skød
settings-power-limited-hot = Ydeevnen er begrænset, fordi computeren er for varm
settings-power-limited-lap-hot = Ydeevnen er begrænset, fordi computeren ligger på dit skød og er for varm
settings-power-saver-low-battery = Strømbesparelse ved lavt batteri
settings-power-saver-low-battery-description = Skifter til Strømbesparelse, når batteriniveauet bliver lavt
settings-power-saver-level = Batteriniveau for strømbesparelse

## Keyboard backlight

settings-power-keyboard = Tastatur
settings-power-backlight = Tastaturbelysning
settings-power-backlight-off = Fra
settings-power-backlight-low = Lav
settings-power-backlight-medium = Middel
settings-power-backlight-high = Høj

## Screen and sleep

settings-power-screen = Skærm
settings-power-screen-off = Sluk skærmen efter
settings-power-screen-off-description = Når du ikke har brugt computeren i et stykke tid
settings-power-dim = Dæmp, når inaktiv
settings-power-dim-description = Sænker lysstyrken kort før skærmen slukkes
settings-power-sleep = Slumre
settings-power-suspend-plugged-in = Slumre, når den er tilsluttet strøm
settings-power-suspend-inactive = Slumre, når den er inaktiv
settings-power-suspend-description = Sætter computeren i slumretilstand efter et stykke tid uden brug
settings-power-suspend-battery = Slumre på batteri
settings-power-button = Tænd/sluk-knap
settings-power-button-suspend = Slumre
settings-power-button-hibernate = Dvale
settings-power-button-ask = Spørg, hvad der skal ske
settings-power-button-nothing = Gør intet
settings-power-long-sleep = Sluk efter lang slumretilstand
settings-power-long-sleep-description = I stedet for at lade batteriet løbe tørt i slumretilstand slukker computeren, når batteriet bliver lavt, eller efter lang tid i slumretilstand på batteri. Åbne vinduer bevares ikke.
settings-power-long-sleep-failed = Det kunne ikke ændres. Prøv igen.
settings-power-long-sleep-after = Sluk efter
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } time
   *[other] { $hours } timer
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dag
   *[other] { $days } dage
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } uge
   *[other] { $weeks } uger
}

## Keyboard

settings-keyboard-sources = Inputkilder
settings-keyboard-sources-description = Den første bruges som standard. Skift mellem dem, mens du skriver.
settings-keyboard-source-edit = Rediger i Keys
settings-keyboard-source-up = Flyt op
settings-keyboard-source-down = Flyt ned
settings-keyboard-source-remove = Fjern
settings-keyboard-add-source-button = Tilføj inputkilde
settings-keyboard-own = Dine egne layouts og inputmetoder
settings-keyboard-own-layout = Lav et layout
settings-keyboard-own-layout-description = Tag udgangspunkt i et layout, og skift det, tasterne skriver
settings-keyboard-own-method = Lav en inputmetode
settings-keyboard-own-method-description = Gør det, du skriver, til accenter, andre skriftsystemer eller ord, du kan vælge imellem
settings-keyboard-own-open = Åbn Keys
settings-keyboard-own-open-description = Rediger de layouts og inputmetoder, du har lavet
settings-keyboard-switch-source = Skift inputkilde
settings-keyboard-add-source = Tilføj en inputkilde
settings-keyboard-add-source-description = Vælg det tastaturlayout eller den inputmetode, du vil skrive med.
settings-keyboard-add-source-search = Søg efter sprog, layouts og inputmetoder
settings-keyboard-input-method = Inputmetode
settings-keyboard-add-source-no-match = Intet matcher »{ $query }«
settings-keyboard-cancel = Annuller
settings-keyboard-add = Tilføj
settings-keyboard-typing = Skrivning
settings-keyboard-repeat = Gentag taster
settings-keyboard-repeat-description = Når du holder en tast nede, skrives den igen og igen
settings-keyboard-repeat-delay = Forsinkelse før gentagelse
settings-keyboard-repeat-delay-shorter = Kortere
settings-keyboard-repeat-delay-longer = Længere
settings-keyboard-repeat-speed = Gentagelseshastighed
settings-keyboard-repeat-speed-slower = Langsommere
settings-keyboard-repeat-speed-faster = Hurtigere
settings-keyboard-caps-lock = Caps Lock-tasten
settings-keyboard-caps-lock-description = Hvad der sker, når du trykker på den
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Byt med Esc
settings-keyboard-caps-lock-nothing = Intet
settings-keyboard-caps-lock-custom = Brugerdefineret
settings-keyboard-lock-notices = Vis Caps Lock og Num Lock
settings-keyboard-lock-notices-description = Vises kort på skærmen, når en af dem slås til eller fra
settings-keyboard-dictation-on = Til
settings-keyboard-dictation-off = Fra
settings-keyboard-shortcuts-description = Se og skift genveje, eller tilføj dine egne

## Copilot key

settings-keyboard-copilot = Copilot-tast
settings-keyboard-copilot-press = Tryk
settings-keyboard-copilot-press-description = Hvad et kort tryk på tasten gør
settings-keyboard-copilot-open-start = Åbn Start
settings-keyboard-copilot-open-app = Åbn en app
settings-keyboard-copilot-nothing = Intet
settings-keyboard-copilot-app = App
settings-keyboard-copilot-no-app = Ingen app valgt endnu
settings-keyboard-copilot-change = Skift
settings-keyboard-copilot-choose = Vælg
settings-keyboard-copilot-hold = Hold nede for at diktere
settings-keyboard-copilot-hold-description = Hold tasten nede, og tal for at skrive det, du siger
settings-keyboard-copilot-hold-off = Virker, når diktering er slået til
settings-keyboard-copilot-choose-app = Vælg en app
settings-keyboard-copilot-choose-app-description = Den åbnes, når du trykker på Copilot-tasten.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Skift
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
settings-keys-space = Mellemrum
settings-keys-enter = Enter
settings-keys-backspace = Tilbage
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menu
settings-keys-keypad = Numerisk { $key }
settings-keys-volume-up = Lydstyrke op
settings-keys-volume-down = Lydstyrke ned
settings-keys-mute = Lyd fra
settings-keys-microphone-mute = Mikrofon fra
settings-keys-play = Afspil
settings-keys-media-pause = Pause
settings-keys-stop = Stop
settings-keys-next-track = Næste nummer
settings-keys-previous-track = Forrige nummer
settings-keys-brightness-up = Lysstyrke op
settings-keys-brightness-down = Lysstyrke ned
settings-keys-browser = Browser
settings-keys-home-page = Startside
settings-keys-search = Søg
settings-keys-mail = Mail
settings-keys-calculator = Lommeregner
settings-keys-files = Filer
settings-keys-eject = Skub ud
settings-keys-power = Tænd/sluk
settings-keys-lock = Lås

## Keyboard shortcuts

settings-shortcuts-title = Tastaturgenveje
settings-shortcuts-search = Søg i genveje
settings-shortcuts-category-system = System
settings-shortcuts-category-windows = Vinduer
settings-shortcuts-category-tiling = Fliser
settings-shortcuts-category-workspaces = Arbejdsområder
settings-shortcuts-category-screenshots = Skærmbilleder
settings-shortcuts-category-media = Medier
settings-shortcuts-reset = Nulstil til standard
settings-shortcuts-apps = Appgenveje
settings-shortcuts-apps-description = Genveje, som apps har bedt om, og som virker, selv når appen ikke er forrest
settings-shortcuts-no-match = Ingen genveje matcher »{ $query }«
settings-shortcuts-change = Skift genvej til { $name }
settings-shortcuts-or = eller
settings-shortcuts-not-set = Ikke angivet
settings-shortcuts-press-keys = Tryk på de taster, du vil bruge
settings-shortcuts-needs-modifier = Tilføj Ctrl, Alt eller Super, så genvejen ikke kommer i vejen, når du skriver.
settings-shortcuts-record-description = Tryk på den nye genvej. Tilbage slår den fra, Esc annullerer.
settings-shortcuts-record-taken = Denne genvej bruges allerede til »{ $name }«. Hvis du erstatter den, slås den fra dér.
settings-shortcuts-try-another = Prøv en anden
settings-shortcuts-replace = Erstat
settings-shortcuts-cancel = Annuller
settings-shortcuts-custom = Brugerdefinerede genveje
settings-shortcuts-custom-description = Kør en kommando eller åbn en app med en tastekombination
settings-shortcuts-untitled = Unavngivet
settings-shortcuts-add = Tilføj genvej
settings-shortcuts-edit = Rediger genvej
settings-shortcuts-custom-name = Navn
settings-shortcuts-custom-command = Kommando
settings-shortcuts-custom-shortcut = Genvej
settings-shortcuts-custom-taken = Bruges allerede til »{ $name }«. Når du gemmer, slås den fra dér.
settings-shortcuts-remove = Fjern
settings-shortcuts-save = Gem
settings-shortcuts-add-button = Tilføj

## Dictation

settings-dictation-title = Diktering
settings-dictation-description = Hold { $keys } nede, og tal for at skrive det, du siger, i enhver app. Slip for at afslutte, eller tryk på Esc for at annullere. Det hele sker på denne computer: Din stemme forlader den aldrig og gemmes ikke.
settings-dictation-description-no-shortcut = Vælg en genvej nedenfor for at diktere. Det hele sker på denne computer: Din stemme forlader den aldrig og gemmes ikke.
settings-dictation-not-installed = Diktering er ikke installeret på denne computer
settings-dictation-hold = Hold { $keys } nede for at diktere
settings-dictation-needs-shortcut = Fra, indtil der er valgt en genvej
settings-dictation-copilot-key = Copilot-tasten
settings-dictation-shortcut = Genvej
settings-dictation-shortcut-description = Hold den nede for at tale, eller tryk på den for at lytte, indtil du trykker igen eller holder op med at tale
settings-dictation-shortcut-own = Min egen genvej
settings-dictation-shortcut-another = En anden genvej…
settings-dictation-shortcut-off = Fra
settings-dictation-keys = Taster
settings-dictation-change = Skift
settings-dictation-language = Sprog
settings-dictation-language-automatic = Automatisk
settings-dictation-language-automatic-current = Automatisk ({ $language })
settings-dictation-language-description = Automatisk følger det tastaturlayout, du skriver med
settings-dictation-language-unavailable = { $language } er ikke tilgængeligt på denne computer
settings-dictation-engine = Talegenkendelse
settings-dictation-engine-automatic = Automatisk
settings-dictation-engine-description = { $engine } genkender { $language }
settings-dictation-engine-graphics-card = { $engine } genkender { $language } på grafikkortet
settings-dictation-models = Talemodeller
settings-dictation-models-description = Modellerne hentes én gang og gemmes på denne computer.
settings-dictation-credits = Tak til
settings-dictation-credit = { $credit }. Licenseret under { $licence }.
settings-dictation-learn-more = Få mere at vide

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Kunne ikke hentes: { $reason }
settings-dictation-model-downloading = { $received } af { $total }
settings-dictation-model-installed = { $size } på denne computer
settings-dictation-model-partial = { $received } af { $total } hentet
settings-dictation-model-size = { $size } skal hentes
settings-dictation-model-retry = Prøv igen
settings-dictation-model-cancel = Annuller
settings-dictation-model-resume = Genoptag
settings-dictation-model-download = Hent
settings-dictation-model-remove = Fjern

## Mouse and touchpad

settings-mouse-mouse = Mus
settings-mouse-primary-button = Primær knap
settings-mouse-primary-button-description = Den knap, du klikker på for at vælge ting
settings-mouse-primary-button-left = Venstre
settings-mouse-primary-button-right = Højre
settings-mouse-speed = Markørhastighed
settings-mouse-slower = Langsommere
settings-mouse-faster = Hurtigere
settings-mouse-acceleration = Museacceleration
settings-mouse-acceleration-description = Markøren flytter sig længere, når du bevæger musen hurtigt
settings-mouse-natural-scrolling = Naturlig rulning
settings-mouse-natural-scrolling-description = Rulning flytter indholdet i stedet for visningen
settings-mouse-touchpad = Touchpad
settings-mouse-touchpad-speed = Markørhastighed for touchpad
settings-mouse-touchpad-scroll-speed = Rullehastighed
settings-mouse-touchpad-scroll-speed-label = Rullehastighed for touchpad
settings-mouse-touchpad-tap = Tryk for at klikke
settings-mouse-touchpad-tap-description = Tryk let på overfladen i stedet for at trykke den ned
settings-mouse-touchpad-natural-scrolling = Naturlig rulning på touchpad
settings-mouse-touchpad-natural-scrolling-description = Indholdet bevæger sig i samme retning som dine fingre
settings-mouse-touchpad-scroll-with = Rul med
settings-mouse-touchpad-two-fingers = To fingre
settings-mouse-touchpad-scroll-edge = Kant
settings-mouse-touchpad-secondary-click = Sekundært klik
settings-mouse-touchpad-secondary-click-description = Sådan højreklikker du uden en separat knap
settings-mouse-touchpad-click-corner = Hjørne
settings-mouse-touchpad-disable-typing = Deaktiver under skrivning
settings-mouse-touchpad-disable-typing-description = Så markøren ikke hopper, mens du skriver
