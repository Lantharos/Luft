## Displays

settings-display-mirror = Speil skjermer
settings-display-mirror-description = Viser det samme bildet på alle skjermer
settings-display-mirrored = Speilede skjermer
settings-display-display = Skjerm
settings-display-apply-failed = Disse innstillingene virket ikke. Prøv et annet oppsett.
settings-display-reset = Tilbakestill
settings-display-apply = Bruk
settings-display-arrangement-main = { $name }, hovedskjerm
settings-display-use = Bruk denne skjermen
settings-display-main = Hovedskjerm
settings-display-main-description = Oppgavelinjen og nye vinduer vises her
settings-display-resolution-title = Oppløsning
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Oppdateringsfrekvens
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Variabel oppdateringsfrekvens
settings-display-variable-refresh-description = Lar skjermen følge bildefrekvensen i spill i fullskjerm for jevnere bevegelser
settings-display-variable-refresh-off = Av
settings-display-variable-refresh-games = I spill
settings-display-variable-refresh-fullscreen = I alle apper i fullskjerm
settings-display-scale = Skalering
settings-display-scale-description = Gjør tekst, apper og alt annet større eller mindre
settings-display-orientation = Retning
settings-display-orientation-landscape = Liggende
settings-display-orientation-portrait-right = Stående, høyre
settings-display-orientation-portrait-left = Stående, venstre
settings-display-orientation-landscape-flipped = Liggende, opp ned

## Display brightness

settings-display-brightness = Lysstyrke
settings-display-brightness-label = Lysstyrke for { $name }
settings-display-brightness-unsupported = Slå på DDC/CI i skjermens meny for å endre den her
settings-display-brightness-unresponsive = Svarer ikke akkurat nå, prøver igjen om litt
settings-display-brightness-external = Eksterne skjermer
settings-display-brightness-missing-tool = Installer ddcutil for å endre lysstyrken deres her
settings-display-brightness-needs-restart = Start på nytt for å fullføre oppsettet av lysstyrken deres
settings-display-brightness-no-access = Logg ut og inn igjen for å endre lysstyrken deres her

## Night light

settings-display-night-light = Nattlys
settings-display-night-light-description = Varmere farger om kvelden, skånsomt for øynene
settings-display-night-light-schedule = Tidsplan
settings-display-night-light-automatic = Solnedgang til soloppgang
settings-display-night-light-custom = Egendefinert
settings-display-night-light-from = Slås på
settings-display-night-light-to = Slås av
settings-display-night-light-warmth = Varme

## Sound

settings-sound-output = Utgang
settings-sound-input = Inngang
settings-sound-device = Enhet
settings-sound-output-device = Utgangsenhet
settings-sound-input-device = Inngangsenhet
settings-sound-connection = Tilkobling
settings-sound-output-connection = Utgangstilkobling
settings-sound-input-connection = Inngangstilkobling
settings-sound-volume = Volum
settings-sound-mute = Demp { $name }
settings-sound-unmute = Slå på lyd for { $name }
settings-sound-balance = Balanse
settings-sound-balance-center = Midten
settings-sound-balance-left = { $share } venstre
settings-sound-balance-right = { $share } høyre
settings-sound-louder = Tillat høyere enn 100 %
settings-sound-louder-description = Lyden kan bli forvrengt ved høyt volum
settings-sound-input-level = Inngangsnivå
settings-sound-apps = Appvolum
settings-sound-apps-playing = { $count ->
    [one] { $count } app spiller av lyd
   *[other] { $count } apper spiller av lyd
}
settings-sound-app-output = Spill av { $app } på
settings-sound-profiles = Enhetsprofiler
settings-sound-profiles-row-description = Velg hvordan hver lydenhet brukes
settings-sound-profiles-description = Hvordan hver lydenhet brukes, for eksempel stereo eller surround
settings-sound-profile-label = Hvordan { $device } brukes
settings-sound-profile-off = Av

## System sounds

settings-sound-system = Systemlyder
settings-sound-system-description = Lyder for varsler, enheter og andre hendelser
settings-sound-system-volume = Volum for systemlyder
settings-sound-kind-notifications = Varsler
    .description = Stille under Ikke forstyrr, spill og skjermdeling
    .preview = Spill av varsellyden
settings-sound-kind-devices = Enheter og lading
    .description = Når en enhet eller lader kobles til, og ved lavt batterinivå
    .preview = Spill av enhetslyden
settings-sound-kind-volume = Volumtilbakemelding
    .description = Et klikk når du endrer volumet
    .preview = Spill av volumklikket
settings-sound-kind-screenshots = Skjermbilder
    .description = En lukkerlyd når et skjermbilde lagres
    .preview = Spill av lukkerlyden
settings-sound-kind-recording = Opptak
    .description = Når skjermopptak, kameraet eller diktering starter og stopper
    .preview = Spill av opptakslyden
settings-sound-kind-sign-in = Påloggingslyd
    .description = Når skrivebordet ditt vises
    .preview = Spill av påloggingslyden
settings-sound-kind-keyboard = Tastetrykk
    .description = Hver tast på skjermtastaturet
    .preview = Spill av et tastetrykk

## Power and battery

settings-power-battery = Batteri
settings-power-charging = Lader
settings-power-charging-at = Lader med { $power }
settings-power-charging-until-full = Lader, fulladet om { $time }
settings-power-charging-at-until-full = Lader med { $power }, fulladet om { $time }
settings-power-on-battery = På batteri
settings-power-on-battery-using = På batteri, bruker { $power }
settings-power-time-left = Omtrent { $time } igjen
settings-power-time-left-using = Omtrent { $time } igjen, bruker { $power }
settings-power-full = Fulladet
settings-power-empty = Tomt
settings-power-not-charging = Koblet til, lader ikke
settings-power-health = Batteritilstand
settings-power-capacity = { $full } av { $design } som ny
settings-power-cycles = { $count ->
    [one] { $cycles } ladesyklus
   *[other] { $cycles } ladesykluser
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Vis prosent
settings-power-show-percentage-description = Viser batterinivået inne i batteriikonet

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = under ett minutt
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minutt
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
    [one] { $minutes } minutt
   *[other] { $minutes } minutter
}
settings-power-never = Aldri

## Charge limit

settings-power-limit = Begrens lading
settings-power-limit-failed = Grensen kunne ikke endres. Prøv igjen.
settings-power-limit-elsewhere-off = En annen app slo den av, så batteriet lades helt opp
settings-power-limit-elsewhere-changed = En annen app endret grensen til { $level }
settings-power-limit-elsewhere-on = En annen app stopper ladingen ved { $level }
settings-power-limit-automatic = Datamaskinen bestemmer når ladingen stopper
settings-power-limit-stops-at = Stopper ladingen ved { $level }
settings-power-limit-description = Stopper ladingen tidlig, slik at batteriet varer lenger
settings-power-limit-description-at = Stopper ved { $level }, slik at batteriet varer lenger
settings-power-limit-applied = Ladingen stopper ved { $level }
settings-power-limit-applied-description = Angitt av en annen app på denne datamaskinen

## Battery-powered devices

settings-power-devices = Enheter
settings-power-device-mouse = Mus
settings-power-device-keyboard = Tastatur
settings-power-device-headphones = Hodetelefoner
settings-power-device-speaker = Høyttaler
settings-power-device-controller = Spillkontroller
settings-power-device-phone = Telefon
settings-power-device-tablet = Nettbrett
settings-power-device-pen = Penn
settings-power-device-touchpad = Styreplate
settings-power-device-other = Enhet

## Power mode

settings-power-mode = Strømmodus
settings-power-mode-row = Modus
settings-power-profile-saver = Strømsparing
    .description = Tregere, og bruker mindre strøm
settings-power-profile-balanced = Balansert
    .description = Vanlig ytelse og strømforbruk
settings-power-profile-performance = Ytelse
    .description = Raskere, og bruker mer strøm
settings-power-limited = Ytelsen er begrenset akkurat nå
settings-power-limited-lap = Ytelsen er begrenset fordi datamaskinen ligger på fanget ditt
settings-power-limited-hot = Ytelsen er begrenset fordi datamaskinen er for varm
settings-power-limited-lap-hot = Ytelsen er begrenset fordi datamaskinen ligger på fanget ditt og er for varm
settings-power-saver-low-battery = Strømsparing ved lavt batterinivå
settings-power-saver-low-battery-description = Bytter til strømsparing når batteriet begynner å bli tomt

## Keyboard backlight

settings-power-keyboard = Tastatur
settings-power-backlight = Tastaturbelysning
settings-power-backlight-off = Av
settings-power-backlight-low = Lav
settings-power-backlight-medium = Middels
settings-power-backlight-high = Høy

## Screen and sleep

settings-power-screen = Skjerm
settings-power-screen-off = Slå av skjermen etter
settings-power-screen-off-description = Når du ikke har brukt datamaskinen på en stund
settings-power-dim = Demp ved inaktivitet
settings-power-dim-description = Senker lysstyrken litt før skjermen slås av
settings-power-sleep = Hvilemodus
settings-power-suspend-plugged-in = Hvilemodus når den er koblet til strøm
settings-power-suspend-inactive = Hvilemodus ved inaktivitet
settings-power-suspend-description = Setter datamaskinen i hvilemodus når den ikke har vært i bruk på en stund
settings-power-suspend-battery = Hvilemodus på batteri
settings-power-button = Av/på-knapp
settings-power-button-suspend = Hvilemodus
settings-power-button-hibernate = Dvalemodus
settings-power-button-ask = Spør hva som skal gjøres
settings-power-button-nothing = Ikke gjør noe
settings-power-long-sleep = Slå av etter lang tid i hvilemodus
settings-power-long-sleep-description = I stedet for at batteriet går tomt i hvilemodus, slås datamaskinen av når batterinivået blir lavt eller etter lang tid i hvilemodus på batteri. Åpne vinduer blir ikke tatt vare på.
settings-power-long-sleep-failed = Dette kunne ikke endres. Prøv igjen.
settings-power-long-sleep-after = Slå av etter
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } time
   *[other] { $hours } timer
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dag
   *[other] { $days } dager
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } uke
   *[other] { $weeks } uker
}

## Keyboard

settings-keyboard-sources = Inndatakilder
settings-keyboard-sources-description = Den første brukes som standard. Bytt mellom dem mens du skriver.
settings-keyboard-source-edit = Rediger i Keys
settings-keyboard-source-up = Flytt opp
settings-keyboard-source-down = Flytt ned
settings-keyboard-source-remove = Fjern
settings-keyboard-add-source-button = Legg til inndatakilde
settings-keyboard-own = Egne tastaturoppsett og inndatametoder
settings-keyboard-own-layout = Lag et tastaturoppsett
settings-keyboard-own-layout-description = Ta utgangspunkt i et oppsett, og endre hva tastene skriver
settings-keyboard-own-method = Lag en inndatametode
settings-keyboard-own-method-description = Gjør det du skriver om til aksenter, andre skriftsystemer eller ord å velge mellom
settings-keyboard-own-open = Åpne Keys
settings-keyboard-own-open-description = Rediger tastaturoppsettene og inndatametodene du har laget
settings-keyboard-switch-source = Bytt inndatakilde
settings-keyboard-add-source = Legg til en inndatakilde
settings-keyboard-add-source-description = Velg tastaturoppsettet eller inndatametoden du vil skrive med.
settings-keyboard-add-source-search = Søk etter språk, tastaturoppsett og inndatametoder
settings-keyboard-input-method = Inndatametode
settings-keyboard-add-source-no-match = Ingenting samsvarer med «{ $query }»
settings-keyboard-cancel = Avbryt
settings-keyboard-add = Legg til
settings-keyboard-typing = Skriving
settings-keyboard-repeat = Gjenta taster
settings-keyboard-repeat-description = Når du holder inne en tast, skrives den igjen og igjen
settings-keyboard-repeat-delay = Forsinkelse før gjentakelse
settings-keyboard-repeat-delay-shorter = Kortere
settings-keyboard-repeat-delay-longer = Lengre
settings-keyboard-repeat-speed = Gjentakelseshastighet
settings-keyboard-repeat-speed-slower = Tregere
settings-keyboard-repeat-speed-faster = Raskere
settings-keyboard-caps-lock = Caps Lock-tasten
settings-keyboard-caps-lock-description = Hva som skjer når du trykker på den
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Bytt med Esc
settings-keyboard-caps-lock-nothing = Ingenting
settings-keyboard-caps-lock-custom = Egendefinert
settings-keyboard-lock-notices = Vis Caps Lock og Num Lock
settings-keyboard-lock-notices-description = Vises kort på skjermen når en av dem slås på eller av
settings-keyboard-dictation-on = På
settings-keyboard-dictation-off = Av
settings-keyboard-shortcuts-description = Se og endre hurtigtaster, eller legg til dine egne

## Copilot key

settings-keyboard-copilot = Copilot-tasten
settings-keyboard-copilot-press = Trykk
settings-keyboard-copilot-press-description = Hva et kort trykk på tasten gjør
settings-keyboard-copilot-open-start = Åpne Start
settings-keyboard-copilot-open-app = Åpne en app
settings-keyboard-copilot-nothing = Ingenting
settings-keyboard-copilot-app = App
settings-keyboard-copilot-no-app = Ingen app er valgt ennå
settings-keyboard-copilot-change = Endre
settings-keyboard-copilot-choose = Velg
settings-keyboard-copilot-hold = Hold inne for å diktere
settings-keyboard-copilot-hold-description = Hold inne tasten og snakk for å skrive det du sier
settings-keyboard-copilot-hold-off = Virker når diktering er slått på
settings-keyboard-copilot-choose-app = Velg en app
settings-keyboard-copilot-choose-app-description = Copilot-tasten åpner den.

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
settings-keys-backspace = Tilbake
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Meny
settings-keys-keypad = Talltastatur { $key }
settings-keys-volume-up = Volum opp
settings-keys-volume-down = Volum ned
settings-keys-mute = Demp
settings-keys-microphone-mute = Demp mikrofon
settings-keys-play = Spill av
settings-keys-media-pause = Pause
settings-keys-stop = Stopp
settings-keys-next-track = Neste spor
settings-keys-previous-track = Forrige spor
settings-keys-brightness-up = Lysstyrke opp
settings-keys-brightness-down = Lysstyrke ned
settings-keys-browser = Nettleser
settings-keys-home-page = Startside
settings-keys-search = Søk
settings-keys-mail = E-post
settings-keys-calculator = Kalkulator
settings-keys-files = Filer
settings-keys-eject = Løs ut
settings-keys-power = Av/på
settings-keys-lock = Lås

## Keyboard shortcuts

settings-shortcuts-title = Hurtigtaster
settings-shortcuts-search = Søk i hurtigtaster
settings-shortcuts-category-system = System
settings-shortcuts-category-windows = Vinduer
settings-shortcuts-category-tiling = Fliser
settings-shortcuts-category-workspaces = Arbeidsområder
settings-shortcuts-category-screenshots = Skjermbilder
settings-shortcuts-category-media = Medier
settings-shortcuts-reset = Tilbakestill til standard
settings-shortcuts-apps = Apphurtigtaster
settings-shortcuts-apps-description = Hurtigtaster som apper har bedt om, og som virker selv når appen ikke er i forgrunnen
settings-shortcuts-no-match = Ingen hurtigtaster samsvarer med «{ $query }»
settings-shortcuts-change = Endre hurtigtast for { $name }
settings-shortcuts-or = eller
settings-shortcuts-not-set = Ikke angitt
settings-shortcuts-press-keys = Trykk på tastene du vil bruke
settings-shortcuts-needs-modifier = Legg til Ctrl, Alt eller Super, så hurtigtasten ikke kommer i veien når du skriver.
settings-shortcuts-record-description = Trykk på den nye hurtigtasten. Tilbake slår den av, Esc avbryter.
settings-shortcuts-record-taken = Denne hurtigtasten brukes allerede for «{ $name }». Hvis du erstatter den, slås den av der.
settings-shortcuts-try-another = Prøv en annen
settings-shortcuts-replace = Erstatt
settings-shortcuts-cancel = Avbryt
settings-shortcuts-custom = Egendefinerte hurtigtaster
settings-shortcuts-custom-description = Kjør en kommando eller åpne en app med en tastekombinasjon
settings-shortcuts-untitled = Uten navn
settings-shortcuts-add = Legg til hurtigtast
settings-shortcuts-edit = Rediger hurtigtast
settings-shortcuts-custom-name = Navn
settings-shortcuts-custom-command = Kommando
settings-shortcuts-custom-shortcut = Hurtigtast
settings-shortcuts-custom-taken = Brukes allerede for «{ $name }». Hvis du lagrer, slås den av der.
settings-shortcuts-remove = Fjern
settings-shortcuts-save = Lagre
settings-shortcuts-add-button = Legg til

## Dictation

settings-dictation-title = Diktering
settings-dictation-description = Hold inne { $keys } og snakk for å skrive det du sier, i alle apper. Slipp for å fullføre, eller trykk på Esc for å avbryte. Alt skjer på denne datamaskinen: Stemmen din forlater den aldri og blir ikke lagret.
settings-dictation-description-no-shortcut = Velg en hurtigtast nedenfor for å diktere. Alt skjer på denne datamaskinen: Stemmen din forlater den aldri og blir ikke lagret.
settings-dictation-not-installed = Diktering er ikke installert på denne datamaskinen
settings-dictation-hold = Hold inne { $keys } for å diktere
settings-dictation-needs-shortcut = Av til den har en hurtigtast
settings-dictation-copilot-key = Copilot-tasten
settings-dictation-shortcut = Hurtigtast
settings-dictation-shortcut-description = Hold den inne for å snakke, eller trykk på den for å lytte til du trykker igjen eller slutter å snakke
settings-dictation-shortcut-own = Min egen hurtigtast
settings-dictation-shortcut-another = En annen hurtigtast…
settings-dictation-shortcut-off = Av
settings-dictation-keys = Taster
settings-dictation-change = Endre
settings-dictation-language = Språk
settings-dictation-language-automatic = Automatisk
settings-dictation-language-automatic-current = Automatisk ({ $language })
settings-dictation-language-description = Automatisk følger tastaturoppsettet du skriver med
settings-dictation-language-unavailable = { $language } er ikke tilgjengelig på denne datamaskinen
settings-dictation-engine = Talegjenkjenning
settings-dictation-engine-automatic = Automatisk
settings-dictation-engine-description = { $engine } gjenkjenner { $language }
settings-dictation-engine-graphics-card = { $engine } gjenkjenner { $language } på skjermkortet
settings-dictation-models = Talemodeller
settings-dictation-models-description = Modellene lastes ned én gang og beholdes på denne datamaskinen.
settings-dictation-credits = Kreditering
settings-dictation-credit = { $credit }. Lisensiert under { $licence }.
settings-dictation-learn-more = Finn ut mer

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Kunne ikke laste ned: { $reason }
settings-dictation-model-downloading = { $received } av { $total }
settings-dictation-model-installed = { $size } på denne datamaskinen
settings-dictation-model-partial = { $received } av { $total } lastet ned
settings-dictation-model-size = { $size } å laste ned
settings-dictation-model-retry = Prøv igjen
settings-dictation-model-cancel = Avbryt
settings-dictation-model-resume = Fortsett
settings-dictation-model-download = Last ned
settings-dictation-model-remove = Fjern

## Mouse and touchpad

settings-mouse-mouse = Mus
settings-mouse-primary-button = Primærknapp
settings-mouse-primary-button-description = Knappen du klikker med for å merke ting
settings-mouse-primary-button-left = Venstre
settings-mouse-primary-button-right = Høyre
settings-mouse-speed = Pekerhastighet
settings-mouse-slower = Tregere
settings-mouse-faster = Raskere
settings-mouse-acceleration = Museakselerasjon
settings-mouse-acceleration-description = Pekeren flytter seg lenger når du beveger musen raskt
settings-mouse-natural-scrolling = Naturlig rulling
settings-mouse-natural-scrolling-description = Rulling flytter innholdet i stedet for visningen
settings-mouse-touchpad = Styreplate
settings-mouse-touchpad-speed = Pekerhastighet for styreplaten
settings-mouse-touchpad-scroll-speed = Rullehastighet
settings-mouse-touchpad-scroll-speed-label = Rullehastighet for styreplaten
settings-mouse-touchpad-tap = Trykk for å klikke
settings-mouse-touchpad-tap-description = Trykk lett på styreplaten i stedet for å trykke den ned
settings-mouse-touchpad-natural-scrolling = Naturlig rulling på styreplaten
settings-mouse-touchpad-natural-scrolling-description = Innholdet beveger seg i samme retning som fingrene
settings-mouse-touchpad-scroll-with = Rull med
settings-mouse-touchpad-two-fingers = To fingre
settings-mouse-touchpad-scroll-edge = Kanten
settings-mouse-touchpad-secondary-click = Sekundærklikk
settings-mouse-touchpad-secondary-click-description = Slik høyreklikker du uten en egen knapp
settings-mouse-touchpad-click-corner = Hjørnet
settings-mouse-touchpad-disable-typing = Slå av mens du skriver
settings-mouse-touchpad-disable-typing-description = Slik at pekeren ikke hopper mens du skriver
