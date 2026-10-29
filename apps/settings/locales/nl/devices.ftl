## Displays

settings-display-mirror = Beeldschermen dupliceren
settings-display-mirror-description = Toont hetzelfde beeld op elk beeldscherm
settings-display-mirrored = Gedupliceerde beeldschermen
settings-display-display = Beeldscherm
settings-display-apply-failed = Deze instellingen werkten niet. Probeer een andere opstelling.
settings-display-reset = Herstellen
settings-display-apply = Toepassen
settings-display-arrangement-main = { $name }, hoofdbeeldscherm
settings-display-use = Dit beeldscherm gebruiken
settings-display-main = Hoofdbeeldscherm
settings-display-main-description = De taakbalk en nieuwe vensters verschijnen hier
settings-display-resolution-title = Resolutie
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Vernieuwingsfrequentie
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Variabele vernieuwingsfrequentie
settings-display-variable-refresh-description = Laat het beeldscherm de framerate van games op volledig scherm volgen, voor vloeiendere beweging
settings-display-variable-refresh-off = Uit
settings-display-variable-refresh-games = In games
settings-display-variable-refresh-fullscreen = In alle apps op volledig scherm
settings-display-scale = Schaal
settings-display-scale-description = Maakt tekst, apps en al het andere groter of kleiner
settings-display-orientation = Stand
settings-display-orientation-landscape = Liggend
settings-display-orientation-portrait-right = Staand, naar rechts
settings-display-orientation-portrait-left = Staand, naar links
settings-display-orientation-landscape-flipped = Liggend, omgedraaid

## Display brightness

settings-display-brightness = Helderheid
settings-display-brightness-label = Helderheid van { $name }
settings-display-brightness-unsupported = Schakel DDC/CI in via het menu van het beeldscherm om de helderheid hier te wijzigen
settings-display-brightness-unresponsive = Reageert nu niet, wordt zo opnieuw geprobeerd
settings-display-brightness-external = Externe beeldschermen
settings-display-brightness-missing-tool = Installeer ddcutil om hun helderheid hier te wijzigen
settings-display-brightness-needs-restart = Start opnieuw op om het instellen van hun helderheid af te ronden
settings-display-brightness-no-access = Meld je af en weer aan om hun helderheid hier te wijzigen

## Night light

settings-display-night-light = Nachtlampje
settings-display-night-light-description = Warmere kleuren in de avond, prettiger voor je ogen
settings-display-night-light-schedule = Planning
settings-display-night-light-automatic = Zonsondergang tot zonsopkomst
settings-display-night-light-custom = Aangepast
settings-display-night-light-from = Gaat aan
settings-display-night-light-to = Gaat uit
settings-display-night-light-warmth = Warmte

## Sound

settings-sound-output = Uitvoer
settings-sound-input = Invoer
settings-sound-device = Apparaat
settings-sound-output-device = Uitvoerapparaat
settings-sound-input-device = Invoerapparaat
settings-sound-connection = Aansluiting
settings-sound-output-connection = Uitvoeraansluiting
settings-sound-input-connection = Invoeraansluiting
settings-sound-volume = Volume
settings-sound-mute = { $name } dempen
settings-sound-unmute = Dempen van { $name } opheffen
settings-sound-balance = Balans
settings-sound-balance-center = Midden
settings-sound-balance-left = { $share } links
settings-sound-balance-right = { $share } rechts
settings-sound-louder = Harder dan 100% toestaan
settings-sound-louder-description = Bij een hoger volume kan het geluid vervormen
settings-sound-input-level = Invoerniveau
settings-sound-apps = Volume per app
settings-sound-apps-playing = { $count ->
    [one] { $count } app speelt geluid af
   *[other] { $count } apps spelen geluid af
}
settings-sound-app-output = { $app } afspelen via
settings-sound-profiles = Apparaatprofielen
settings-sound-profiles-row-description = Kies hoe elk geluidsapparaat wordt gebruikt
settings-sound-profiles-description = Hoe elk geluidsapparaat wordt gebruikt, zoals stereo of surround
settings-sound-profile-label = Gebruik van { $device }
settings-sound-profile-off = Uit

## System sounds

settings-sound-system = Systeemgeluiden
settings-sound-system-description = Geluiden voor meldingen, apparaten en andere gebeurtenissen
settings-sound-system-volume = Volume van systeemgeluiden
settings-sound-kind-notifications = Meldingen
    .description = Stil tijdens Niet storen, games en scherm delen
    .preview = Meldingsgeluid afspelen
settings-sound-kind-devices = Apparaten en opladen
    .description = Een apparaat of oplader aansluiten, en een bijna lege batterij
    .preview = Apparaatgeluid afspelen
settings-sound-kind-volume = Volumefeedback
    .description = Een tik wanneer je het volume wijzigt
    .preview = Volumetik afspelen
settings-sound-kind-screenshots = Schermafbeeldingen
    .description = Een sluitergeluid wanneer een schermafbeelding wordt opgeslagen
    .preview = Sluitergeluid afspelen
settings-sound-kind-recording = Opnemen
    .description = Wanneer een schermopname, de camera of dicteren start en stopt
    .preview = Opnamegeluid afspelen
settings-sound-kind-sign-in = Aanmeldgeluid
    .description = Wanneer je bureaublad verschijnt
    .preview = Aanmeldgeluid afspelen
settings-sound-kind-keyboard = Toetsaanslagen
    .description = Elke toets op het schermtoetsenbord
    .preview = Toetsaanslag afspelen

## Power and battery

settings-power-battery = Batterij
settings-power-charging = Opladen
settings-power-charging-at = Opladen met { $power }
settings-power-charging-until-full = Opladen, vol over { $time }
settings-power-charging-at-until-full = Opladen met { $power }, vol over { $time }
settings-power-on-battery = Op batterij
settings-power-on-battery-using = Op batterij, verbruik { $power }
settings-power-time-left = Nog ongeveer { $time }
settings-power-time-left-using = Nog ongeveer { $time }, verbruik { $power }
settings-power-full = Volledig opgeladen
settings-power-empty = Leeg
settings-power-not-charging = Aangesloten, laadt niet op
settings-power-health = Batterijconditie
settings-power-capacity = { $full } van { $design } toen hij nieuw was
settings-power-cycles = { $count ->
    [one] { $cycles } laadcyclus
   *[other] { $cycles } laadcycli
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Percentage tonen
settings-power-show-percentage-description = Toont het batterijniveau in het batterijpictogram

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = minder dan een minuut
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minuut
   *[other] { $minutes } minuten
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } uur
   *[other] { $hours } uur
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } uur
   *[other] { $hours } uur
} { $minutes ->
    [one] { $minutes } minuut
   *[other] { $minutes } minuten
}
settings-power-never = Nooit

## Charge limit

settings-power-limit = Opladen beperken
settings-power-limit-failed = De limiet kan niet worden gewijzigd. Probeer het opnieuw.
settings-power-limit-elsewhere-off = Een andere app heeft dit uitgeschakeld, dus de batterij wordt volledig opgeladen
settings-power-limit-elsewhere-changed = Een andere app heeft de limiet gewijzigd in { $level }
settings-power-limit-elsewhere-on = Een andere app stopt het opladen bij { $level }
settings-power-limit-automatic = Je computer bepaalt wanneer het opladen stopt
settings-power-limit-stops-at = Stopt met opladen bij { $level }
settings-power-limit-description = Stopt eerder met opladen, zodat de batterij langer meegaat
settings-power-limit-description-at = Stopt bij { $level }, zodat de batterij langer meegaat
settings-power-limit-applied = Opladen stopt bij { $level }
settings-power-limit-applied-description = Ingesteld door een andere app op deze computer

## Battery-powered devices

settings-power-devices = Apparaten
settings-power-device-mouse = Muis
settings-power-device-keyboard = Toetsenbord
settings-power-device-headphones = Koptelefoon
settings-power-device-speaker = Luidspreker
settings-power-device-controller = Controller
settings-power-device-phone = Telefoon
settings-power-device-tablet = Tablet
settings-power-device-pen = Pen
settings-power-device-touchpad = Touchpad
settings-power-device-other = Apparaat

## Power mode

settings-power-mode = Energiemodus
settings-power-mode-row = Modus
settings-power-profile-saver = Energiebesparing
    .description = Langzamer, en verbruikt minder energie
settings-power-profile-balanced = Gebalanceerd
    .description = Normale prestaties en energieverbruik
settings-power-profile-performance = Prestaties
    .description = Sneller, en verbruikt meer energie
settings-power-limited = De prestaties zijn nu beperkt
settings-power-limited-lap = De prestaties zijn beperkt omdat de computer op je schoot ligt
settings-power-limited-hot = De prestaties zijn beperkt omdat de computer te warm is
settings-power-limited-lap-hot = De prestaties zijn beperkt omdat de computer op je schoot ligt en te warm is
settings-power-saver-low-battery = Energiebesparing bij bijna lege batterij
settings-power-saver-low-battery-description = Schakelt over op energiebesparing wanneer de batterij bijna leeg is
settings-power-saver-level = Batterijniveau voor energiebesparing

## Keyboard backlight

settings-power-keyboard = Toetsenbord
settings-power-backlight = Toetsenbordverlichting
settings-power-backlight-off = Uit
settings-power-backlight-low = Laag
settings-power-backlight-medium = Gemiddeld
settings-power-backlight-high = Hoog

## Screen and sleep

settings-power-screen = Scherm
settings-power-screen-off = Scherm uitschakelen na
settings-power-screen-off-description = Wanneer je de computer een tijdje niet hebt gebruikt
settings-power-dim = Dimmen bij inactiviteit
settings-power-dim-description = Verlaagt de helderheid kort voordat het scherm uitgaat
settings-power-sleep = Slaapstand
settings-power-suspend-plugged-in = Slaapstand wanneer aangesloten
settings-power-suspend-inactive = Slaapstand bij inactiviteit
settings-power-suspend-description = Zet de computer in de slaapstand als hij een tijdje niet wordt gebruikt
settings-power-suspend-battery = Slaapstand op batterij
settings-power-button = Aan/uit-knop
settings-power-button-suspend = Slaapstand
settings-power-button-hibernate = Sluimerstand
settings-power-button-ask = Vragen wat er moet gebeuren
settings-power-button-nothing = Niets doen
settings-power-long-sleep = Afsluiten na lange slaapstand
settings-power-long-sleep-description = In plaats van de batterij leeg te laten lopen in de slaapstand, sluit de computer af wanneer de batterij bijna leeg is of na een lange slaapstand op batterij. Geopende vensters blijven niet bewaard.
settings-power-long-sleep-failed = Dit kan niet worden gewijzigd. Probeer het opnieuw.
settings-power-long-sleep-after = Afsluiten na
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } uur
   *[other] { $hours } uur
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dag
   *[other] { $days } dagen
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } week
   *[other] { $weeks } weken
}

## Keyboard

settings-keyboard-sources = Invoerbronnen
settings-keyboard-sources-description = De eerste wordt standaard gebruikt. Wissel ertussen terwijl je typt.
settings-keyboard-source-edit = Bewerken in Keys
settings-keyboard-source-up = Omhoog
settings-keyboard-source-down = Omlaag
settings-keyboard-source-remove = Verwijderen
settings-keyboard-add-source-button = Invoerbron toevoegen
settings-keyboard-own = Eigen indelingen en invoermethoden
settings-keyboard-own-layout = Indeling maken
settings-keyboard-own-layout-description = Begin met een bestaande indeling en wijzig wat de toetsen typen
settings-keyboard-own-method = Invoermethode maken
settings-keyboard-own-method-description = Zet wat je typt om in accenten, andere schriften of woorden om uit te kiezen
settings-keyboard-own-open = Keys openen
settings-keyboard-own-open-description = Bewerk de indelingen en invoermethoden die je hebt gemaakt
settings-keyboard-switch-source = Invoerbron wisselen
settings-keyboard-add-source = Invoerbron toevoegen
settings-keyboard-add-source-description = Kies de toetsenbordindeling of invoermethode waarmee je wilt typen.
settings-keyboard-add-source-search = Talen, indelingen en invoermethoden zoeken
settings-keyboard-input-method = Invoermethode
settings-keyboard-add-source-no-match = Niets gevonden voor “{ $query }”
settings-keyboard-cancel = Annuleren
settings-keyboard-add = Toevoegen
settings-keyboard-typing = Typen
settings-keyboard-repeat = Toetsherhaling
settings-keyboard-repeat-description = Als je een toets ingedrukt houdt, wordt die steeds opnieuw getypt
settings-keyboard-repeat-delay = Vertraging vóór herhalen
settings-keyboard-repeat-delay-shorter = Korter
settings-keyboard-repeat-delay-longer = Langer
settings-keyboard-repeat-speed = Herhaalsnelheid
settings-keyboard-repeat-speed-slower = Langzamer
settings-keyboard-repeat-speed-faster = Sneller
settings-keyboard-caps-lock = Caps Lock-toets
settings-keyboard-caps-lock-description = Wat er gebeurt als je erop drukt
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Omwisselen met Esc
settings-keyboard-caps-lock-nothing = Niets
settings-keyboard-caps-lock-custom = Aangepast
settings-keyboard-lock-notices = Caps Lock en Num Lock tonen
settings-keyboard-lock-notices-description = Toont kort op het scherm wanneer een van beide aan- of uitgaat
settings-keyboard-dictation-on = Aan
settings-keyboard-dictation-off = Uit
settings-keyboard-shortcuts-description = Sneltoetsen bekijken en wijzigen, of je eigen toevoegen

## Copilot key

settings-keyboard-copilot = Copilot-toets
settings-keyboard-copilot-press = Indrukken
settings-keyboard-copilot-press-description = Wat er gebeurt als je de toets kort indrukt
settings-keyboard-copilot-open-start = Start openen
settings-keyboard-copilot-open-app = Een app openen
settings-keyboard-copilot-nothing = Niets
settings-keyboard-copilot-app = App
settings-keyboard-copilot-no-app = Nog geen app gekozen
settings-keyboard-copilot-change = Wijzigen
settings-keyboard-copilot-choose = Kiezen
settings-keyboard-copilot-hold = Vasthouden om te dicteren
settings-keyboard-copilot-hold-description = Houd de toets ingedrukt en praat om te typen wat je zegt
settings-keyboard-copilot-hold-off = Werkt zodra dicteren aan staat
settings-keyboard-copilot-choose-app = Een app kiezen
settings-keyboard-copilot-choose-app-description = Als je op de Copilot-toets drukt, wordt deze app geopend.

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
settings-keys-space = Spatie
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menu
settings-keys-keypad = Numeriek { $key }
settings-keys-volume-up = Volume omhoog
settings-keys-volume-down = Volume omlaag
settings-keys-mute = Dempen
settings-keys-microphone-mute = Microfoon dempen
settings-keys-play = Afspelen
settings-keys-media-pause = Pauzeren
settings-keys-stop = Stoppen
settings-keys-next-track = Volgend nummer
settings-keys-previous-track = Vorig nummer
settings-keys-brightness-up = Helderheid omhoog
settings-keys-brightness-down = Helderheid omlaag
settings-keys-browser = Browser
settings-keys-home-page = Startpagina
settings-keys-search = Zoeken
settings-keys-mail = E-mail
settings-keys-calculator = Rekenmachine
settings-keys-files = Bestanden
settings-keys-eject = Uitwerpen
settings-keys-power = Aan/uit
settings-keys-lock = Vergrendelen

## Keyboard shortcuts

settings-shortcuts-title = Sneltoetsen
settings-shortcuts-search = Sneltoetsen zoeken
settings-shortcuts-category-system = Systeem
settings-shortcuts-category-windows = Vensters
settings-shortcuts-category-tiling = Tegelen
settings-shortcuts-category-workspaces = Werkbladen
settings-shortcuts-category-screenshots = Schermafbeeldingen
settings-shortcuts-category-media = Media
settings-shortcuts-reset = Standaard herstellen
settings-shortcuts-apps = Sneltoetsen van apps
settings-shortcuts-apps-description = Aangevraagd door apps, en werken ook als de app niet op de voorgrond staat
settings-shortcuts-no-match = Geen sneltoetsen gevonden voor “{ $query }”
settings-shortcuts-change = Sneltoets voor { $name } wijzigen
settings-shortcuts-or = of
settings-shortcuts-not-set = Niet ingesteld
settings-shortcuts-press-keys = Druk op de toetsen die je wilt gebruiken
settings-shortcuts-needs-modifier = Voeg Ctrl, Alt of Super toe, zodat de sneltoets het typen niet hindert.
settings-shortcuts-record-description = Druk op de nieuwe sneltoets. Backspace schakelt hem uit, Esc annuleert.
settings-shortcuts-record-taken = Deze sneltoets wordt al gebruikt voor “{ $name }”. Als je hem vervangt, wordt hij daar uitgeschakeld.
settings-shortcuts-try-another = Andere proberen
settings-shortcuts-replace = Vervangen
settings-shortcuts-cancel = Annuleren
settings-shortcuts-custom = Eigen sneltoetsen
settings-shortcuts-custom-description = Voer een opdracht uit of open een app met een sneltoets
settings-shortcuts-untitled = Naamloos
settings-shortcuts-add = Sneltoets toevoegen
settings-shortcuts-edit = Sneltoets bewerken
settings-shortcuts-custom-name = Naam
settings-shortcuts-custom-command = Opdracht
settings-shortcuts-custom-shortcut = Sneltoets
settings-shortcuts-custom-taken = Al gebruikt voor “{ $name }”. Als je opslaat, wordt hij daar uitgeschakeld.
settings-shortcuts-remove = Verwijderen
settings-shortcuts-save = Opslaan
settings-shortcuts-add-button = Toevoegen

## Dictation

settings-dictation-title = Dicteren
settings-dictation-description = Houd { $keys } ingedrukt en praat om te typen wat je zegt, in elke app. Laat los om af te ronden, of druk op Esc om te annuleren. Alles gebeurt op deze computer: je stem verlaat hem nooit en wordt niet bewaard.
settings-dictation-description-no-shortcut = Kies hieronder een sneltoets om te dicteren. Alles gebeurt op deze computer: je stem verlaat hem nooit en wordt niet bewaard.
settings-dictation-not-installed = Dicteren is niet geïnstalleerd op deze computer
settings-dictation-hold = Houd { $keys } ingedrukt om te dicteren
settings-dictation-needs-shortcut = Uit totdat er een sneltoets is ingesteld
settings-dictation-copilot-key = de Copilot-toets
settings-dictation-shortcut = Sneltoets
settings-dictation-shortcut-description = Houd hem ingedrukt om te praten, of druk erop om te luisteren tot je er opnieuw op drukt of stopt met praten
settings-dictation-shortcut-own = Eigen sneltoets
settings-dictation-shortcut-another = Andere sneltoets…
settings-dictation-shortcut-off = Uit
settings-dictation-keys = Toetsen
settings-dictation-change = Wijzigen
settings-dictation-language = Taal
settings-dictation-language-automatic = Automatisch
settings-dictation-language-automatic-current = Automatisch ({ $language })
settings-dictation-language-description = Automatisch volgt de toetsenbordindeling waarmee je typt
settings-dictation-language-unavailable = { $language } is niet beschikbaar op deze computer
settings-dictation-engine = Spraakherkenning
settings-dictation-engine-automatic = Automatisch
settings-dictation-engine-description = { $engine } herkent { $language }
settings-dictation-engine-graphics-card = { $engine } herkent { $language } op de grafische kaart
settings-dictation-models = Spraakmodellen
settings-dictation-models-description = Modellen worden één keer gedownload en op deze computer bewaard.
settings-dictation-credits = Bronvermelding
settings-dictation-credit = { $credit }. Licentie: { $licence }.
settings-dictation-learn-more = Meer informatie

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Kan niet downloaden: { $reason }
settings-dictation-model-downloading = { $received } van { $total }
settings-dictation-model-installed = { $size } op deze computer
settings-dictation-model-partial = { $received } van { $total } gedownload
settings-dictation-model-size = { $size } te downloaden
settings-dictation-model-retry = Opnieuw proberen
settings-dictation-model-cancel = Annuleren
settings-dictation-model-resume = Hervatten
settings-dictation-model-download = Downloaden
settings-dictation-model-remove = Verwijderen

## Mouse and touchpad

settings-mouse-mouse = Muis
settings-mouse-primary-button = Primaire knop
settings-mouse-primary-button-description = De knop waarmee je klikt om iets te selecteren
settings-mouse-primary-button-left = Links
settings-mouse-primary-button-right = Rechts
settings-mouse-speed = Aanwijzersnelheid
settings-mouse-slower = Langzamer
settings-mouse-faster = Sneller
settings-mouse-acceleration = Muisversnelling
settings-mouse-acceleration-description = De aanwijzer gaat verder als je de muis snel beweegt
settings-mouse-natural-scrolling = Natuurlijk scrollen
settings-mouse-natural-scrolling-description = Scrollen verplaatst de inhoud in plaats van de weergave
settings-mouse-touchpad = Touchpad
settings-mouse-touchpad-speed = Aanwijzersnelheid van touchpad
settings-mouse-touchpad-scroll-speed = Scrollsnelheid
settings-mouse-touchpad-scroll-speed-label = Scrollsnelheid van touchpad
settings-mouse-touchpad-tap = Tikken om te klikken
settings-mouse-touchpad-tap-description = Tik op de touchpad in plaats van hem in te drukken
settings-mouse-touchpad-natural-scrolling = Natuurlijk scrollen op touchpad
settings-mouse-touchpad-natural-scrolling-description = De inhoud beweegt in dezelfde richting als je vingers
settings-mouse-touchpad-scroll-with = Scrollen met
settings-mouse-touchpad-two-fingers = Twee vingers
settings-mouse-touchpad-scroll-edge = Rand
settings-mouse-touchpad-secondary-click = Secundaire klik
settings-mouse-touchpad-secondary-click-description = Rechtsklikken zonder aparte knop
settings-mouse-touchpad-click-corner = Hoek
settings-mouse-touchpad-disable-typing = Uitschakelen tijdens typen
settings-mouse-touchpad-disable-typing-description = Zodat de aanwijzer niet verspringt terwijl je typt
