## Displays

settings-display-mirror = Bildschirme spiegeln
settings-display-mirror-description = Zeigt auf jedem Bildschirm dasselbe Bild
settings-display-mirrored = Gespiegelte Bildschirme
settings-display-display = Bildschirm
settings-display-apply-failed = Diese Einstellungen haben nicht funktioniert. Versuch eine andere Anordnung.
settings-display-reset = Zurücksetzen
settings-display-apply = Übernehmen
settings-display-arrangement-main = { $name }, Hauptbildschirm
settings-display-use = Diesen Bildschirm verwenden
settings-display-main = Hauptbildschirm
settings-display-main-description = Die Taskleiste und neue Fenster erscheinen hier
settings-display-resolution-title = Auflösung
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Bildwiederholrate
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Variable Bildwiederholrate
settings-display-variable-refresh-description = Lässt den Bildschirm der Bildrate von Spielen im Vollbild folgen, für flüssigere Bewegungen
settings-display-variable-refresh-off = Aus
settings-display-variable-refresh-games = In Spielen
settings-display-variable-refresh-fullscreen = In allen Apps im Vollbild
settings-display-scale = Skalierung
settings-display-scale-description = Macht Text, Apps und alles andere größer oder kleiner
settings-display-orientation = Ausrichtung
settings-display-orientation-landscape = Querformat
settings-display-orientation-portrait-right = Hochformat rechts
settings-display-orientation-portrait-left = Hochformat links
settings-display-orientation-landscape-flipped = Querformat, gedreht

## Display brightness

settings-display-brightness = Helligkeit
settings-display-brightness-label = Helligkeit von { $name }
settings-display-brightness-unsupported = Schalt DDC/CI im Menü des Bildschirms ein, um sie hier zu ändern
settings-display-brightness-unresponsive = Reagiert gerade nicht, wird gleich erneut versucht
settings-display-brightness-external = Externe Bildschirme
settings-display-brightness-missing-tool = Installier ddcutil, um ihre Helligkeit hier zu ändern
settings-display-brightness-needs-restart = Starte neu, um die Einrichtung ihrer Helligkeit abzuschließen
settings-display-brightness-no-access = Melde dich ab und wieder an, um ihre Helligkeit hier zu ändern

## Night light

settings-display-night-light = Nachtmodus
settings-display-night-light-description = Wärmere Farben am Abend, angenehmer für die Augen
settings-display-night-light-schedule = Zeitplan
settings-display-night-light-automatic = Sonnenuntergang bis Sonnenaufgang
settings-display-night-light-custom = Benutzerdefiniert
settings-display-night-light-from = Ein um
settings-display-night-light-to = Aus um
settings-display-night-light-warmth = Wärme

## Sound

settings-sound-output = Ausgabe
settings-sound-input = Eingabe
settings-sound-device = Gerät
settings-sound-output-device = Ausgabegerät
settings-sound-input-device = Eingabegerät
settings-sound-connection = Anschluss
settings-sound-output-connection = Ausgabeanschluss
settings-sound-input-connection = Eingabeanschluss
settings-sound-volume = Lautstärke
settings-sound-mute = { $name } stummschalten
settings-sound-unmute = Stummschaltung von { $name } aufheben
settings-sound-balance = Balance
settings-sound-balance-center = Mitte
settings-sound-balance-left = { $share } links
settings-sound-balance-right = { $share } rechts
settings-sound-louder = Lauter als 100 % zulassen
settings-sound-louder-description = Bei höherer Lautstärke kann der Sound verzerren
settings-sound-input-level = Eingangspegel
settings-sound-apps = App-Lautstärke
settings-sound-apps-playing = { $count ->
    [one] { $count } App gibt Sound wieder
   *[other] { $count } Apps geben Sound wieder
}
settings-sound-app-output = { $app } wiedergeben über
settings-sound-profiles = Geräteprofile
settings-sound-profiles-row-description = Wähl, wie jedes Audiogerät verwendet wird
settings-sound-profiles-description = Wie jedes Audiogerät verwendet wird, etwa Stereo oder Surround
settings-sound-profile-label = Verwendung von { $device }
settings-sound-profile-off = Aus

## System sounds

settings-sound-system = Systemklänge
settings-sound-system-description = Klänge für Benachrichtigungen, Geräte und andere Ereignisse
settings-sound-system-volume = Lautstärke der Systemklänge
settings-sound-kind-notifications = Benachrichtigungen
    .description = Stumm bei „Nicht stören“, in Spielen und beim Teilen des Bildschirms
    .preview = Benachrichtigungsklang abspielen
settings-sound-kind-devices = Geräte und Laden
    .description = Beim Anschließen eines Geräts oder Ladegeräts und bei niedrigem Akkustand
    .preview = Geräteklang abspielen
settings-sound-kind-volume = Lautstärke-Feedback
    .description = Ein Klicken, wenn du die Lautstärke änderst
    .preview = Lautstärkeklicken abspielen
settings-sound-kind-screenshots = Bildschirmfotos
    .description = Ein Auslöser, wenn ein Bildschirmfoto gespeichert wird
    .preview = Auslöser abspielen
settings-sound-kind-recording = Aufnahme
    .description = Wenn Bildschirmaufnahme, Kamera oder Diktieren startet und endet
    .preview = Aufnahmeklang abspielen
settings-sound-kind-sign-in = Anmeldeklang
    .description = Wenn dein Desktop erscheint
    .preview = Anmeldeklang abspielen
settings-sound-kind-keyboard = Tastenklicks
    .description = Jede Taste der Bildschirmtastatur
    .preview = Tastenklick abspielen

## Power and battery

settings-power-battery = Akku
settings-power-charging = Wird geladen
settings-power-charging-at = Wird mit { $power } geladen
settings-power-charging-until-full = Wird geladen, noch { $time } bis voll
settings-power-charging-at-until-full = Wird mit { $power } geladen, noch { $time } bis voll
settings-power-on-battery = Akkubetrieb
settings-power-on-battery-using = Akkubetrieb, { $power } Verbrauch
settings-power-time-left = Noch etwa { $time }
settings-power-time-left-using = Noch etwa { $time }, { $power } Verbrauch
settings-power-full = Vollständig geladen
settings-power-empty = Leer
settings-power-not-charging = Angeschlossen, wird nicht geladen
settings-power-health = Akkuzustand
settings-power-capacity = { $full } von { $design } im Neuzustand
settings-power-cycles = { $count ->
    [one] { $cycles } Ladezyklus
   *[other] { $cycles } Ladezyklen
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Prozent anzeigen
settings-power-show-percentage-description = Zeigt den Akkustand im Akkusymbol an

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = weniger als eine Minute
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } Minute
   *[other] { $minutes } Minuten
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } Stunde
   *[other] { $hours } Stunden
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } Stunde
   *[other] { $hours } Stunden
} { $minutes ->
    [one] { $minutes } Minute
   *[other] { $minutes } Minuten
}
settings-power-never = Nie

## Charge limit

settings-power-limit = Laden begrenzen
settings-power-limit-failed = Die Grenze konnte nicht geändert werden. Versuch es noch einmal.
settings-power-limit-elsewhere-off = Eine andere App hat sie ausgeschaltet, daher wird der Akku voll geladen
settings-power-limit-elsewhere-changed = Eine andere App hat die Grenze auf { $level } geändert
settings-power-limit-elsewhere-on = Eine andere App beendet das Laden bei { $level }
settings-power-limit-automatic = Dein Computer entscheidet, wann das Laden endet
settings-power-limit-stops-at = Laden endet bei { $level }
settings-power-limit-description = Beendet das Laden früher, damit der Akku länger hält
settings-power-limit-description-at = Endet bei { $level }, damit der Akku länger hält
settings-power-limit-applied = Laden endet bei { $level }
settings-power-limit-applied-description = Von einer anderen App auf diesem Computer festgelegt

## Battery-powered devices

settings-power-devices = Geräte
settings-power-device-mouse = Maus
settings-power-device-keyboard = Tastatur
settings-power-device-headphones = Kopfhörer
settings-power-device-speaker = Lautsprecher
settings-power-device-controller = Controller
settings-power-device-phone = Smartphone
settings-power-device-tablet = Tablet
settings-power-device-pen = Stift
settings-power-device-touchpad = Touchpad
settings-power-device-other = Gerät

## Power mode

settings-power-mode = Energiemodus
settings-power-mode-row = Modus
settings-power-profile-saver = Energie sparen
    .description = Langsamer, verbraucht weniger Energie
settings-power-profile-balanced = Ausgewogen
    .description = Normale Leistung und normaler Verbrauch
settings-power-profile-performance = Leistung
    .description = Schneller, verbraucht mehr Energie
settings-power-limited = Die Leistung ist gerade eingeschränkt
settings-power-limited-lap = Die Leistung ist eingeschränkt, weil der Computer auf deinem Schoß liegt
settings-power-limited-hot = Die Leistung ist eingeschränkt, weil der Computer zu heiß ist
settings-power-limited-lap-hot = Die Leistung ist eingeschränkt, weil der Computer auf deinem Schoß liegt und zu heiß ist
settings-power-saver-low-battery = Energie sparen bei niedrigem Akkustand
settings-power-saver-low-battery-description = Wechselt zu „Energie sparen“, wenn der Akku fast leer ist

## Keyboard backlight

settings-power-keyboard = Tastatur
settings-power-backlight = Tastaturbeleuchtung
settings-power-backlight-off = Aus
settings-power-backlight-low = Niedrig
settings-power-backlight-medium = Mittel
settings-power-backlight-high = Hoch

## Screen and sleep

settings-power-screen = Bildschirm
settings-power-screen-off = Bildschirm ausschalten nach
settings-power-screen-off-description = Wenn du den Computer eine Weile nicht benutzt hast
settings-power-dim = Bei Inaktivität abdunkeln
settings-power-dim-description = Verringert die Helligkeit kurz bevor sich der Bildschirm ausschaltet
settings-power-sleep = Standby
settings-power-suspend-plugged-in = Standby im Netzbetrieb
settings-power-suspend-inactive = Standby bei Inaktivität
settings-power-suspend-description = Versetzt den Computer nach einer Weile ohne Nutzung in den Standbymodus
settings-power-suspend-battery = Standby im Akkubetrieb
settings-power-button = Ein-/Aus-Taste
settings-power-button-suspend = Standby
settings-power-button-hibernate = Ruhezustand
settings-power-button-ask = Nachfragen
settings-power-button-nothing = Nichts tun
settings-power-long-sleep = Nach langem Standby herunterfahren
settings-power-long-sleep-description = Statt den Akku im Standby ganz zu leeren, fährt der Computer herunter, wenn der Akku schwach wird oder er lange im Akkubetrieb im Standby war. Geöffnete Fenster bleiben nicht erhalten.
settings-power-long-sleep-failed = Das konnte nicht geändert werden. Versuch es noch einmal.
settings-power-long-sleep-after = Herunterfahren nach
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } Stunde
   *[other] { $hours } Stunden
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } Tag
   *[other] { $days } Tage
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } Woche
   *[other] { $weeks } Wochen
}

## Keyboard

settings-keyboard-sources = Eingabequellen
settings-keyboard-sources-description = Die erste wird standardmäßig verwendet. Beim Tippen kannst du zwischen ihnen wechseln.
settings-keyboard-source-edit = In Keys bearbeiten
settings-keyboard-source-up = Nach oben
settings-keyboard-source-down = Nach unten
settings-keyboard-source-remove = Entfernen
settings-keyboard-add-source-button = Eingabequelle hinzufügen
settings-keyboard-own = Eigene Layouts und Eingabemethoden
settings-keyboard-own-layout = Layout erstellen
settings-keyboard-own-layout-description = Geh von einem Layout aus und ändere, was seine Tasten tippen
settings-keyboard-own-method = Eingabemethode erstellen
settings-keyboard-own-method-description = Mach aus dem Getippten Akzente, andere Schriften oder Wörter zur Auswahl
settings-keyboard-own-open = Keys öffnen
settings-keyboard-own-open-description = Deine eigenen Layouts und Eingabemethoden bearbeiten
settings-keyboard-switch-source = Eingabequelle wechseln
settings-keyboard-add-source = Eingabequelle hinzufügen
settings-keyboard-add-source-description = Wähl das Tastaturlayout oder die Eingabemethode, mit der du tippen willst.
settings-keyboard-add-source-search = Sprachen, Layouts und Eingabemethoden durchsuchen
settings-keyboard-input-method = Eingabemethode
settings-keyboard-add-source-no-match = Keine Treffer für „{ $query }“
settings-keyboard-cancel = Abbrechen
settings-keyboard-add = Hinzufügen
settings-keyboard-typing = Tippen
settings-keyboard-repeat = Tastenwiederholung
settings-keyboard-repeat-description = Eine gedrückt gehaltene Taste wird immer wieder getippt
settings-keyboard-repeat-delay = Verzögerung vor der Wiederholung
settings-keyboard-repeat-delay-shorter = Kürzer
settings-keyboard-repeat-delay-longer = Länger
settings-keyboard-repeat-speed = Wiederholrate
settings-keyboard-repeat-speed-slower = Langsamer
settings-keyboard-repeat-speed-faster = Schneller
settings-keyboard-caps-lock = Feststelltaste
settings-keyboard-caps-lock-description = Was passiert, wenn du sie drückst
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Mit Esc tauschen
settings-keyboard-caps-lock-nothing = Nichts
settings-keyboard-caps-lock-custom = Benutzerdefiniert
settings-keyboard-lock-notices = Feststell- und Num-Taste anzeigen
settings-keyboard-lock-notices-description = Wird kurz eingeblendet, wenn eine davon ein- oder ausgeschaltet wird
settings-keyboard-dictation-on = Ein
settings-keyboard-dictation-off = Aus
settings-keyboard-shortcuts-description = Tastenkürzel ansehen und ändern oder eigene hinzufügen

## Copilot key

settings-keyboard-copilot = Copilot-Taste
settings-keyboard-copilot-press = Drücken
settings-keyboard-copilot-press-description = Was ein kurzes Drücken der Taste bewirkt
settings-keyboard-copilot-open-start = Start öffnen
settings-keyboard-copilot-open-app = App öffnen
settings-keyboard-copilot-nothing = Nichts
settings-keyboard-copilot-app = App
settings-keyboard-copilot-no-app = Noch keine App ausgewählt
settings-keyboard-copilot-change = Ändern
settings-keyboard-copilot-choose = Auswählen
settings-keyboard-copilot-hold = Zum Diktieren gedrückt halten
settings-keyboard-copilot-hold-description = Halt die Taste gedrückt und sprich, um zu tippen, was du sagst
settings-keyboard-copilot-hold-off = Funktioniert, sobald Diktieren eingeschaltet ist
settings-keyboard-copilot-choose-app = App auswählen
settings-keyboard-copilot-choose-app-description = Die Copilot-Taste öffnet sie.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Strg
settings-keys-alt = Alt
settings-keys-shift = Umschalt
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Druck
settings-keys-page-up = Bild auf
settings-keys-page-down = Bild ab
settings-keys-home = Pos1
settings-keys-end = Ende
settings-keys-insert = Einfg
settings-keys-delete = Entf
settings-keys-tab = Tab
settings-keys-space = Leertaste
settings-keys-enter = Eingabe
settings-keys-backspace = Rücktaste
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Rollen
settings-keys-caps-lock = Feststelltaste
settings-keys-menu = Menü
settings-keys-keypad = Ziffernblock { $key }
settings-keys-volume-up = Lauter
settings-keys-volume-down = Leiser
settings-keys-mute = Stumm
settings-keys-microphone-mute = Mikrofon stumm
settings-keys-play = Wiedergabe
settings-keys-media-pause = Pause
settings-keys-stop = Stopp
settings-keys-next-track = Nächster Titel
settings-keys-previous-track = Vorheriger Titel
settings-keys-brightness-up = Heller
settings-keys-brightness-down = Dunkler
settings-keys-browser = Browser
settings-keys-home-page = Startseite
settings-keys-search = Suche
settings-keys-mail = E-Mail
settings-keys-calculator = Rechner
settings-keys-files = Dateien
settings-keys-eject = Auswerfen
settings-keys-power = Ein/Aus
settings-keys-lock = Sperren

## Keyboard shortcuts

settings-shortcuts-title = Tastenkürzel
settings-shortcuts-search = Tastenkürzel durchsuchen
settings-shortcuts-category-system = System
settings-shortcuts-category-windows = Fenster
settings-shortcuts-category-tiling = Kacheln
settings-shortcuts-category-workspaces = Arbeitsflächen
settings-shortcuts-category-screenshots = Bildschirmfotos
settings-shortcuts-category-media = Medien
settings-shortcuts-reset = Auf Standard zurücksetzen
settings-shortcuts-apps = App-Tastenkürzel
settings-shortcuts-apps-description = Von Apps angefordert, funktionieren auch, wenn die App nicht im Vordergrund ist
settings-shortcuts-no-match = Keine Tastenkürzel für „{ $query }“
settings-shortcuts-change = Tastenkürzel für { $name } ändern
settings-shortcuts-or = oder
settings-shortcuts-not-set = Nicht festgelegt
settings-shortcuts-press-keys = Drück die gewünschten Tasten
settings-shortcuts-needs-modifier = Nimm Strg, Alt oder Super dazu, damit das Tastenkürzel beim Tippen nicht stört.
settings-shortcuts-record-description = Drück das neue Tastenkürzel. Rücktaste schaltet es aus, Esc bricht ab.
settings-shortcuts-record-taken = Dieses Tastenkürzel wird schon für „{ $name }“ verwendet. Beim Ersetzen wird es dort ausgeschaltet.
settings-shortcuts-try-another = Anderes versuchen
settings-shortcuts-replace = Ersetzen
settings-shortcuts-cancel = Abbrechen
settings-shortcuts-custom = Eigene Tastenkürzel
settings-shortcuts-custom-description = Mit einer Tastenkombination einen Befehl ausführen oder eine App öffnen
settings-shortcuts-untitled = Unbenannt
settings-shortcuts-add = Tastenkürzel hinzufügen
settings-shortcuts-edit = Tastenkürzel bearbeiten
settings-shortcuts-custom-name = Name
settings-shortcuts-custom-command = Befehl
settings-shortcuts-custom-shortcut = Tastenkürzel
settings-shortcuts-custom-taken = Wird schon für „{ $name }“ verwendet. Beim Speichern wird es dort ausgeschaltet.
settings-shortcuts-remove = Entfernen
settings-shortcuts-save = Speichern
settings-shortcuts-add-button = Hinzufügen

## Dictation

settings-dictation-title = Diktieren
settings-dictation-description = Halt { $keys } gedrückt und sprich, um in jeder App zu tippen, was du sagst. Lass los, um fertig zu werden, oder drück Esc zum Abbrechen. Alles passiert auf diesem Computer: Deine Stimme verlässt ihn nie und wird nicht gespeichert.
settings-dictation-description-no-shortcut = Wähl unten ein Tastenkürzel zum Diktieren. Alles passiert auf diesem Computer: Deine Stimme verlässt ihn nie und wird nicht gespeichert.
settings-dictation-not-installed = Diktieren ist auf diesem Computer nicht installiert
settings-dictation-hold = Zum Diktieren { $keys } gedrückt halten
settings-dictation-needs-shortcut = Aus, bis ein Tastenkürzel festgelegt ist
settings-dictation-copilot-key = die Copilot-Taste
settings-dictation-shortcut = Tastenkürzel
settings-dictation-shortcut-description = Gedrückt halten und sprechen oder einmal drücken, um zuzuhören, bis du es wieder drückst oder aufhörst zu sprechen
settings-dictation-shortcut-own = Eigenes Tastenkürzel
settings-dictation-shortcut-another = Anderes Tastenkürzel …
settings-dictation-shortcut-off = Aus
settings-dictation-keys = Tasten
settings-dictation-change = Ändern
settings-dictation-language = Sprache
settings-dictation-language-automatic = Automatisch
settings-dictation-language-automatic-current = Automatisch ({ $language })
settings-dictation-language-description = „Automatisch“ richtet sich nach dem Tastaturlayout, mit dem du tippst
settings-dictation-language-unavailable = { $language } ist auf diesem Computer nicht verfügbar
settings-dictation-engine = Spracherkennung
settings-dictation-engine-automatic = Automatisch
settings-dictation-engine-description = { $engine } erkennt { $language }
settings-dictation-engine-graphics-card = { $engine } erkennt { $language } auf der Grafikkarte
settings-dictation-models = Sprachmodelle
settings-dictation-models-description = Modelle werden einmal heruntergeladen und auf diesem Computer behalten.
settings-dictation-credits = Danksagungen
settings-dictation-credit = { $credit }. Lizenziert unter { $licence }.
settings-dictation-learn-more = Mehr erfahren

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Download fehlgeschlagen: { $reason }
settings-dictation-model-downloading = { $received } von { $total }
settings-dictation-model-installed = { $size } auf diesem Computer
settings-dictation-model-partial = { $received } von { $total } heruntergeladen
settings-dictation-model-size = { $size } zum Herunterladen
settings-dictation-model-retry = Erneut versuchen
settings-dictation-model-cancel = Abbrechen
settings-dictation-model-resume = Fortsetzen
settings-dictation-model-download = Herunterladen
settings-dictation-model-remove = Entfernen

## Mouse and touchpad

settings-mouse-mouse = Maus
settings-mouse-primary-button = Primäre Taste
settings-mouse-primary-button-description = Die Taste, mit der du etwas auswählst
settings-mouse-primary-button-left = Links
settings-mouse-primary-button-right = Rechts
settings-mouse-speed = Zeigergeschwindigkeit
settings-mouse-slower = Langsamer
settings-mouse-faster = Schneller
settings-mouse-acceleration = Mausbeschleunigung
settings-mouse-acceleration-description = Der Zeiger bewegt sich weiter, wenn du die Maus schnell bewegst
settings-mouse-natural-scrolling = Natürliches Scrollen
settings-mouse-natural-scrolling-description = Beim Scrollen bewegt sich der Inhalt statt der Ansicht
settings-mouse-touchpad = Touchpad
settings-mouse-touchpad-speed = Zeigergeschwindigkeit des Touchpads
settings-mouse-touchpad-scroll-speed = Scrollgeschwindigkeit
settings-mouse-touchpad-scroll-speed-label = Scrollgeschwindigkeit des Touchpads
settings-mouse-touchpad-tap = Tippen zum Klicken
settings-mouse-touchpad-tap-description = Tipp auf das Touchpad, statt es herunterzudrücken
settings-mouse-touchpad-natural-scrolling = Natürliches Scrollen auf dem Touchpad
settings-mouse-touchpad-natural-scrolling-description = Der Inhalt bewegt sich in dieselbe Richtung wie deine Finger
settings-mouse-touchpad-scroll-with = Scrollen mit
settings-mouse-touchpad-two-fingers = Zwei Finger
settings-mouse-touchpad-scroll-edge = Rand
settings-mouse-touchpad-secondary-click = Sekundärklick
settings-mouse-touchpad-secondary-click-description = Wie du ohne eigene Taste einen Rechtsklick machst
settings-mouse-touchpad-click-corner = Ecke
settings-mouse-touchpad-disable-typing = Beim Tippen deaktivieren
settings-mouse-touchpad-disable-typing-description = Damit der Zeiger beim Tippen nicht springt
