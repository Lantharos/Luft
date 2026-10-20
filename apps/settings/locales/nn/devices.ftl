## Displays

settings-display-mirror = Spegl skjermar
settings-display-mirror-description = Viser same bilete på alle skjermar
settings-display-mirrored = Spegla skjermar
settings-display-display = Skjerm
settings-display-apply-failed = Desse innstillingane fungerte ikkje. Prøv eit anna oppsett.
settings-display-reset = Tilbakestill
settings-display-apply = Bruk
settings-display-arrangement-main = { $name }, hovudskjerm
settings-display-use = Bruk denne skjermen
settings-display-main = Hovudskjerm
settings-display-main-description = Oppgåvelinja og nye vindauge blir viste her
settings-display-resolution-title = Oppløysing
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Oppdateringsfrekvens
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Variabel oppdateringsfrekvens
settings-display-variable-refresh-description = Lèt skjermen følgje biletfrekvensen i spel i fullskjerm, så rørslene blir jamnare
settings-display-variable-refresh-off = Av
settings-display-variable-refresh-games = I spel
settings-display-variable-refresh-fullscreen = I alle appar i fullskjerm
settings-display-scale = Skalering
settings-display-scale-description = Gjer tekst, appar og alt anna større eller mindre
settings-display-orientation = Retning
settings-display-orientation-landscape = Liggjande
settings-display-orientation-portrait-right = Ståande, til høgre
settings-display-orientation-portrait-left = Ståande, til venstre
settings-display-orientation-landscape-flipped = Liggjande, snudd

## Display brightness

settings-display-brightness = Lysstyrke
settings-display-brightness-label = Lysstyrke for { $name }
settings-display-brightness-unsupported = Slå på DDC/CI i menyen på skjermen for å endre lysstyrken her
settings-display-brightness-unresponsive = Svarer ikkje no, prøver igjen om litt
settings-display-brightness-external = Eksterne skjermar
settings-display-brightness-missing-tool = Installer ddcutil for å endre lysstyrken deira her
settings-display-brightness-needs-restart = Start på nytt for å gjere ferdig oppsettet av lysstyrken deira
settings-display-brightness-no-access = Logg ut og inn igjen for å endre lysstyrken deira her

## Night light

settings-display-night-light = Nattlys
settings-display-night-light-description = Varmare fargar om kvelden, skånsamt for auga
settings-display-night-light-schedule = Tidsplan
settings-display-night-light-automatic = Frå solnedgang til soloppgang
settings-display-night-light-custom = Eigendefinert
settings-display-night-light-from = Slår seg på
settings-display-night-light-to = Slår seg av
settings-display-night-light-warmth = Varme

## Sound

settings-sound-output = Utgang
settings-sound-input = Inngang
settings-sound-device = Eining
settings-sound-output-device = Utgangseining
settings-sound-input-device = Inngangseining
settings-sound-connection = Tilkopling
settings-sound-output-connection = Utgangstilkopling
settings-sound-input-connection = Inngangstilkopling
settings-sound-volume = Lydstyrke
settings-sound-mute = Slå av lyden for { $name }
settings-sound-unmute = Slå på lyden for { $name }
settings-sound-balance = Balanse
settings-sound-balance-center = Midten
settings-sound-balance-left = { $share } til venstre
settings-sound-balance-right = { $share } til høgre
settings-sound-louder = Tillat høgare enn 100 %
settings-sound-louder-description = Lyden kan bli forvrengd ved høg lydstyrke
settings-sound-input-level = Inngangsnivå
settings-sound-apps = Lydstyrke for appar
settings-sound-apps-playing = { $count ->
    [one] { $count } app spelar av lyd
   *[other] { $count } appar spelar av lyd
}
settings-sound-app-output = Spel av { $app } på
settings-sound-profiles = Einingsprofilar
settings-sound-profiles-row-description = Vel korleis kvar lydeining blir brukt
settings-sound-profiles-description = Korleis kvar lydeining blir brukt, til dømes stereo eller surround
settings-sound-profile-label = Korleis { $device } blir brukt
settings-sound-profile-off = Av

## System sounds

settings-sound-system = Systemlydar
settings-sound-system-description = Lydar for varslingar, einingar og andre hendingar
settings-sound-system-volume = Lydstyrke for systemlydar
settings-sound-kind-notifications = Varslingar
    .description = Stille under Ikkje forstyrr, spel og skjermdeling
    .preview = Spel av varslingslyden
settings-sound-kind-devices = Einingar og lading
    .description = Når ei eining eller ein ladar blir kopla til, og når batteriet er lågt
    .preview = Spel av einingslyden
settings-sound-kind-volume = Lydstyrkesignal
    .description = Eit tikk når du endrar lydstyrken
    .preview = Spel av tikket
settings-sound-kind-screenshots = Skjermbilete
    .description = Ein lukkarlyd når eit skjermbilete blir lagra
    .preview = Spel av lukkarlyden
settings-sound-kind-recording = Opptak
    .description = Når skjermopptak, kameraet eller diktering startar og stoppar
    .preview = Spel av opptakslyden
settings-sound-kind-sign-in = Innloggingslyd
    .description = Når skrivebordet ditt kjem fram
    .preview = Spel av innloggingslyden
settings-sound-kind-keyboard = Tastetrykk
    .description = Kvar tast på skjermtastaturet
    .preview = Spel av eit tastetrykk

## Power and battery

settings-power-battery = Batteri
settings-power-charging = Ladar
settings-power-charging-at = Ladar med { $power }
settings-power-charging-until-full = Ladar, fullt om { $time }
settings-power-charging-at-until-full = Ladar med { $power }, fullt om { $time }
settings-power-on-battery = På batteri
settings-power-on-battery-using = På batteri, brukar { $power }
settings-power-time-left = Om lag { $time } att
settings-power-time-left-using = Om lag { $time } att, brukar { $power }
settings-power-full = Fullada
settings-power-empty = Tomt
settings-power-not-charging = Kopla til, ladar ikkje
settings-power-health = Batteritilstand
settings-power-capacity = { $full } av { $design } som ny
settings-power-cycles = { $count ->
    [one] { $cycles } ladesyklus
   *[other] { $cycles } ladesyklusar
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Vis prosent
settings-power-show-percentage-description = Viser batterinivået inne i batteriikonet

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = mindre enn eitt minutt
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minutt
   *[other] { $minutes } minutt
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } time
   *[other] { $hours } timar
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } time
   *[other] { $hours } timar
} { $minutes ->
    [one] { $minutes } minutt
   *[other] { $minutes } minutt
}
settings-power-never = Aldri

## Charge limit

settings-power-limit = Avgrens lading
settings-power-limit-failed = Kunne ikkje endre grensa. Prøv igjen.
settings-power-limit-elsewhere-off = Ein annan app har slått av grensa, så batteriet blir fullada
settings-power-limit-elsewhere-changed = Ein annan app endra grensa til { $level }
settings-power-limit-elsewhere-on = Ein annan app stoppar ladinga ved { $level }
settings-power-limit-automatic = Datamaskinen avgjer når ladinga skal stoppe
settings-power-limit-stops-at = Stoppar ladinga ved { $level }
settings-power-limit-description = Stoppar ladinga tidleg, så batteriet varer lenger
settings-power-limit-description-at = Stoppar ved { $level }, så batteriet varer lenger
settings-power-limit-applied = Ladinga stoppar ved { $level }
settings-power-limit-applied-description = Sett av ein annan app på denne datamaskinen

## Battery-powered devices

settings-power-devices = Einingar
settings-power-device-mouse = Mus
settings-power-device-keyboard = Tastatur
settings-power-device-headphones = Hovudtelefonar
settings-power-device-speaker = Høgtalar
settings-power-device-controller = Spelkontroll
settings-power-device-phone = Telefon
settings-power-device-tablet = Nettbrett
settings-power-device-pen = Penn
settings-power-device-touchpad = Styreplate
settings-power-device-other = Eining

## Power mode

settings-power-mode = Straummodus
settings-power-mode-row = Modus
settings-power-profile-saver = Straumsparing
    .description = Tregare, og brukar mindre straum
settings-power-profile-balanced = Balansert
    .description = Vanleg yting og straumbruk
settings-power-profile-performance = Yting
    .description = Raskare, og brukar meir straum
settings-power-limited = Ytinga er avgrensa no
settings-power-limited-lap = Ytinga er avgrensa fordi datamaskinen ligg på fanget ditt
settings-power-limited-hot = Ytinga er avgrensa fordi datamaskinen er for varm
settings-power-limited-lap-hot = Ytinga er avgrensa fordi datamaskinen ligg på fanget ditt og er for varm
settings-power-saver-low-battery = Straumsparing ved lågt batteri
settings-power-saver-low-battery-description = Byter til straumsparing når batteriet byrjar å bli lågt

## Keyboard backlight

settings-power-keyboard = Tastatur
settings-power-backlight = Tastaturlys
settings-power-backlight-off = Av
settings-power-backlight-low = Lågt
settings-power-backlight-medium = Middels
settings-power-backlight-high = Høgt

## Screen and sleep

settings-power-screen = Skjerm
settings-power-screen-off = Slå av skjermen etter
settings-power-screen-off-description = Når du ikkje har brukt datamaskinen på ei stund
settings-power-dim = Demp ved inaktivitet
settings-power-dim-description = Senkar lysstyrken litt før skjermen blir slått av
settings-power-sleep = Kvilemodus
settings-power-suspend-plugged-in = Kvilemodus når kopla til straum
settings-power-suspend-inactive = Kvilemodus ved inaktivitet
settings-power-suspend-description = Set datamaskinen i kvilemodus etter ei stund utan bruk
settings-power-suspend-battery = Kvilemodus på batteri
settings-power-button = Av/på-knapp
settings-power-button-suspend = Kvilemodus
settings-power-button-hibernate = Dvalemodus
settings-power-button-ask = Spør kva som skal skje
settings-power-button-nothing = Ikkje gjer noko
settings-power-long-sleep = Slå av etter lang kvile
settings-power-long-sleep-description = I staden for å la batteriet gå tomt i kvilemodus slår datamaskinen seg av når batteriet blir lågt, eller etter lang kvile på batteri. Opne vindauge blir ikkje tekne vare på.
settings-power-long-sleep-failed = Kunne ikkje endre dette. Prøv igjen.
settings-power-long-sleep-after = Slå av etter
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } time
   *[other] { $hours } timar
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dag
   *[other] { $days } dagar
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } veke
   *[other] { $weeks } veker
}

## Keyboard

settings-keyboard-sources = Inndatakjelder
settings-keyboard-sources-description = Den første blir brukt som standard. Byt mellom dei medan du skriv.
settings-keyboard-source-edit = Rediger i Keys
settings-keyboard-source-up = Flytt opp
settings-keyboard-source-down = Flytt ned
settings-keyboard-source-remove = Fjern
settings-keyboard-add-source-button = Legg til inndatakjelde
settings-keyboard-own = Eigne oppsett og inndatametodar
settings-keyboard-own-layout = Lag eit oppsett
settings-keyboard-own-layout-description = Ta utgangspunkt i eit oppsett og endre kva tastane skriv
settings-keyboard-own-method = Lag ein inndatametode
settings-keyboard-own-method-description = Gjer det du skriv om til aksentar, andre skriftsystem eller ord du kan velje mellom
settings-keyboard-own-open = Opne Keys
settings-keyboard-own-open-description = Rediger oppsetta og inndatametodane du har laga
settings-keyboard-switch-source = Byt inndatakjelde
settings-keyboard-add-source = Legg til ei inndatakjelde
settings-keyboard-add-source-description = Vel tastaturoppsettet eller inndatametoden du vil skrive med.
settings-keyboard-add-source-search = Søk etter språk, oppsett og inndatametodar
settings-keyboard-input-method = Inndatametode
settings-keyboard-add-source-no-match = Ingenting passar til «{ $query }»
settings-keyboard-cancel = Avbryt
settings-keyboard-add = Legg til
settings-keyboard-typing = Skriving
settings-keyboard-repeat = Gjenta tastar
settings-keyboard-repeat-description = Når du held ein tast inne, blir han skriven gong på gong
settings-keyboard-repeat-delay = Forseinking før gjentaking
settings-keyboard-repeat-delay-shorter = Kortare
settings-keyboard-repeat-delay-longer = Lengre
settings-keyboard-repeat-speed = Gjentakingsfart
settings-keyboard-repeat-speed-slower = Saktare
settings-keyboard-repeat-speed-faster = Raskare
settings-keyboard-caps-lock = Caps Lock-tasten
settings-keyboard-caps-lock-description = Kva som skjer når du trykkjer på han
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Byt med Esc
settings-keyboard-caps-lock-nothing = Ingenting
settings-keyboard-caps-lock-custom = Eigendefinert
settings-keyboard-lock-notices = Vis Caps Lock og Num Lock
settings-keyboard-lock-notices-description = Blir vist kort på skjermen når ein av dei blir slått på eller av
settings-keyboard-dictation-on = På
settings-keyboard-dictation-off = Av
settings-keyboard-shortcuts-description = Sjå og endre snarvegar, eller legg til dine eigne

## Copilot key

settings-keyboard-copilot = Copilot-tasten
settings-keyboard-copilot-press = Trykk
settings-keyboard-copilot-press-description = Kva eit kort trykk på tasten gjer
settings-keyboard-copilot-open-start = Opne Start
settings-keyboard-copilot-open-app = Opne ein app
settings-keyboard-copilot-nothing = Ingenting
settings-keyboard-copilot-app = App
settings-keyboard-copilot-no-app = Ingen app er vald enno
settings-keyboard-copilot-change = Endre
settings-keyboard-copilot-choose = Vel
settings-keyboard-copilot-hold = Hald inne for å diktere
settings-keyboard-copilot-hold-description = Hald inne tasten og snakk for å skrive det du seier
settings-keyboard-copilot-hold-off = Fungerer når diktering er slått på
settings-keyboard-copilot-choose-app = Vel ein app
settings-keyboard-copilot-choose-app-description = Copilot-tasten opnar appen du vel.

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
settings-keys-space = Mellomrom
settings-keys-enter = Enter
settings-keys-backspace = Tilbaketast
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Meny
settings-keys-keypad = Talltastatur { $key }
settings-keys-volume-up = Lydstyrke opp
settings-keys-volume-down = Lydstyrke ned
settings-keys-mute = Demp
settings-keys-microphone-mute = Demp mikrofon
settings-keys-play = Spel av
settings-keys-media-pause = Pause
settings-keys-stop = Stopp
settings-keys-next-track = Neste spor
settings-keys-previous-track = Førre spor
settings-keys-brightness-up = Lysstyrke opp
settings-keys-brightness-down = Lysstyrke ned
settings-keys-browser = Nettlesar
settings-keys-home-page = Heimeside
settings-keys-search = Søk
settings-keys-mail = E-post
settings-keys-calculator = Kalkulator
settings-keys-files = Filer
settings-keys-eject = Løys ut
settings-keys-power = Av/på
settings-keys-lock = Lås

## Keyboard shortcuts

settings-shortcuts-title = Snarvegar
settings-shortcuts-search = Søk i snarvegar
settings-shortcuts-category-system = System
settings-shortcuts-category-windows = Vindauge
settings-shortcuts-category-workspaces = Arbeidsområde
settings-shortcuts-category-screenshots = Skjermbilete
settings-shortcuts-category-media = Media
settings-shortcuts-reset = Tilbakestill til standard
settings-shortcuts-apps = Appsnarvegar
settings-shortcuts-apps-description = Snarvegar som appar har bede om, og som fungerer sjølv når appen ikkje er i framgrunnen
settings-shortcuts-no-match = Ingen snarvegar passar til «{ $query }»
settings-shortcuts-change = Endre snarvegen for { $name }
settings-shortcuts-or = eller
settings-shortcuts-not-set = Ikkje sett
settings-shortcuts-press-keys = Trykk tastane du vil bruke
settings-shortcuts-needs-modifier = Legg til Ctrl, Alt eller Super, så snarvegen ikkje kjem i vegen når du skriv.
settings-shortcuts-record-description = Trykk den nye snarvegen. Tilbaketast slår han av, Esc avbryt.
settings-shortcuts-record-taken = Denne snarvegen blir alt brukt til «{ $name }». Byter du han ut, blir han slått av der.
settings-shortcuts-try-another = Prøv ein annan
settings-shortcuts-replace = Byt ut
settings-shortcuts-cancel = Avbryt
settings-shortcuts-custom = Eigne snarvegar
settings-shortcuts-custom-description = Køyr ein kommando eller opne ein app med ein tastekombinasjon
settings-shortcuts-untitled = Utan namn
settings-shortcuts-add = Legg til snarveg
settings-shortcuts-edit = Rediger snarveg
settings-shortcuts-custom-name = Namn
settings-shortcuts-custom-command = Kommando
settings-shortcuts-custom-shortcut = Snarveg
settings-shortcuts-custom-taken = Blir alt brukt til «{ $name }». Når du lagrar, blir han slått av der.
settings-shortcuts-remove = Fjern
settings-shortcuts-save = Lagre
settings-shortcuts-add-button = Legg til

## Dictation

settings-dictation-title = Diktering
settings-dictation-description = Hald inne { $keys } og snakk for å skrive det du seier, i alle appar. Slepp for å avslutte, eller trykk Esc for å avbryte. Alt skjer på denne datamaskinen: stemma di forlèt han aldri og blir ikkje lagra.
settings-dictation-description-no-shortcut = Vel ein snarveg nedanfor for å diktere. Alt skjer på denne datamaskinen: stemma di forlèt han aldri og blir ikkje lagra.
settings-dictation-not-installed = Diktering er ikkje installert på denne datamaskinen
settings-dictation-hold = Hald inne { $keys } for å diktere
settings-dictation-needs-shortcut = Av til diktering har ein snarveg
settings-dictation-copilot-key = Copilot-tasten
settings-dictation-shortcut = Snarveg
settings-dictation-shortcut-description = Hald han inne for å snakke, eller trykk for å lytte til du trykkjer igjen eller sluttar å snakke
settings-dictation-shortcut-own = Min eigen snarveg
settings-dictation-shortcut-another = Ein annan snarveg…
settings-dictation-shortcut-off = Av
settings-dictation-keys = Tastar
settings-dictation-change = Endre
settings-dictation-language = Språk
settings-dictation-language-automatic = Automatisk
settings-dictation-language-automatic-current = Automatisk ({ $language })
settings-dictation-language-description = Automatisk følgjer tastaturoppsettet du skriv med
settings-dictation-language-unavailable = { $language } er ikkje tilgjengeleg på denne datamaskinen
settings-dictation-engine = Talegjenkjenning
settings-dictation-engine-automatic = Automatisk
settings-dictation-engine-description = { $engine } kjenner att { $language }
settings-dictation-engine-graphics-card = { $engine } kjenner att { $language } på grafikkortet
settings-dictation-models = Talemodellar
settings-dictation-models-description = Modellane blir lasta ned éin gong og lagra på denne datamaskinen.
settings-dictation-credits = Opphav
settings-dictation-credit = { $credit }. Lisensiert under { $licence }.
settings-dictation-learn-more = Les meir

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Kunne ikkje laste ned: { $reason }
settings-dictation-model-downloading = { $received } av { $total }
settings-dictation-model-installed = { $size } på denne datamaskinen
settings-dictation-model-partial = { $received } av { $total } lasta ned
settings-dictation-model-size = { $size } å laste ned
settings-dictation-model-retry = Prøv igjen
settings-dictation-model-cancel = Avbryt
settings-dictation-model-resume = Hald fram
settings-dictation-model-download = Last ned
settings-dictation-model-remove = Fjern

## Mouse and touchpad

settings-mouse-mouse = Mus
settings-mouse-primary-button = Primærknapp
settings-mouse-primary-button-description = Knappen du klikkar med for å velje ting
settings-mouse-primary-button-left = Venstre
settings-mouse-primary-button-right = Høgre
settings-mouse-speed = Peikarfart
settings-mouse-slower = Saktare
settings-mouse-faster = Raskare
settings-mouse-acceleration = Museakselerasjon
settings-mouse-acceleration-description = Peikaren flyttar seg lenger når du flyttar musa raskt
settings-mouse-natural-scrolling = Naturleg rulling
settings-mouse-natural-scrolling-description = Rulling flyttar innhaldet i staden for visinga
settings-mouse-touchpad = Styreplate
settings-mouse-touchpad-speed = Peikarfart for styreplata
settings-mouse-touchpad-scroll-speed = Rullefart
settings-mouse-touchpad-scroll-speed-label = Rullefart for styreplata
settings-mouse-touchpad-tap = Trykk lett for å klikke
settings-mouse-touchpad-tap-description = Trykk lett på styreplata i staden for å trykkje ho ned
settings-mouse-touchpad-natural-scrolling = Naturleg rulling på styreplata
settings-mouse-touchpad-natural-scrolling-description = Innhaldet flyttar seg same veg som fingrane
settings-mouse-touchpad-scroll-with = Rull med
settings-mouse-touchpad-two-fingers = To fingrar
settings-mouse-touchpad-scroll-edge = Kanten
settings-mouse-touchpad-secondary-click = Sekundærklikk
settings-mouse-touchpad-secondary-click-description = Korleis du høgreklikkar utan ein eigen knapp
settings-mouse-touchpad-click-corner = Hjørnet
settings-mouse-touchpad-disable-typing = Slå av medan du skriv
settings-mouse-touchpad-disable-typing-description = Så peikaren ikkje hoppar medan du skriv
