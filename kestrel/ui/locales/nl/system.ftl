## Shared

system-cancel = Annuleren

## Dictation notifications

dictation-setup-title = Typen door te spreken
dictation-setup-body = Spreek, en wat je zegt wordt getypt, in elke app. Dicteren luistert op deze computer zelf en heeft daarvoor eerst een spraakmodel nodig.
dictation-setup-action = Dicteren instellen
dictation-unsupported-title = { $language } dicteren is niet beschikbaar op deze computer
dictation-unsupported-body = De processor kan de spraakherkenning die nodig is voor { $language } niet uitvoeren. Je kunt wel in een andere taal dicteren.
dictation-settings-action = Instellingen voor dicteren

## System health notifications

health-gpu-reset-title = De grafische driver reageerde niet meer
health-gpu-reset-body = { $day ->
    [today] Je computer is vandaag om { $time } vanzelf opnieuw opgestart. In Instellingen zie je wat kan voorkomen dat dit nog eens gebeurt.
   *[other] Je computer is op { $date } om { $time } vanzelf opnieuw opgestart. In Instellingen zie je wat kan voorkomen dat dit nog eens gebeurt.
}
health-gpu-reset-details = Details

oom-app-closed-title = { $app } is gesloten om geheugen vrij te maken
oom-container-closed-title = Een container is gesloten om geheugen vrij te maken
oom-closed-body = De computer had bijna geen geheugen meer. Daarom is dit gesloten, zodat al het andere vlot blijft reageren.
oom-closed-body-with-size = De computer had bijna geen geheugen meer. Daarom is dit gesloten, zodat al het andere vlot blijft reageren. Het gebruikte { $size }.

## Input source indicator

input-source-indicator = Invoerbron: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Vliegtuigmodus is ingeschakeld met een hardwareschakelaar
media-keys-airplane-mode-on = Vliegtuigmodus aan
media-keys-airplane-mode-off = Vliegtuigmodus uit
media-keys-bluetooth-on = Bluetooth aan
media-keys-bluetooth-off = Bluetooth uit
media-keys-caps-lock-on = Caps Lock aan
media-keys-caps-lock-off = Caps Lock uit
media-keys-num-lock-on = Num Lock aan
media-keys-num-lock-off = Num Lock uit

## VPN sign-in

vpn-sign-in-title = Aanmelden bij { $connection }
vpn-connect = Verbinden
vpn-signing-in = Aanmelden…
vpn-finish-in-browser = Rond het aanmelden af in je browser.
vpn-certificate-untrusted = { $host } gaf een certificaat dat niet kan worden gecontroleerd ({ $reason }). De vingerafdruk is { $fingerprint }.
vpn-certificate-warning = Iemand kan zich voordoen als deze server. Maak alleen verbinding als je dit verwachtte.
vpn-certificate-connect = Toch verbinden

vpn-field-password = Wachtwoord
vpn-field-certificate-password = Certificaatwachtwoord
vpn-field-proxy-password = Proxywachtwoord
vpn-field-pre-shared-key = Vooraf gedeelde sleutel
vpn-field-group-password = Groepswachtwoord

## Battery notifications

battery-left = Nog { $percent }.
battery-left-with-time = Nog { $percent }, ongeveer { $duration }.
battery-low-title = Batterij bijna leeg
battery-very-low-title = Batterij erg leeg
battery-almost-empty-title = Batterij vrijwel leeg
battery-ups-low-title = UPS-batterij bijna leeg
battery-ups-very-low-title = UPS-batterij erg leeg
battery-ups-almost-empty-title = UPS-batterij vrijwel leeg
battery-very-low-body = { $left } Sluit de lader binnenkort aan.
battery-almost-empty-body = { $left } Sluit de lader nu aan, zodat je geen niet-opgeslagen werk verliest.

battery-device-low-title = Batterij van { $device } bijna leeg
battery-device-very-low-title = Batterij van { $device } erg leeg
battery-device-low-body = { $left } Laad het apparaat binnenkort op.
battery-device-very-low-body = { $left } Laad het apparaat nu op, zodat het niet uitschakelt.

battery-device-mouse = Muis
battery-device-keyboard = Toetsenbord
battery-device-phone = Telefoon
battery-device-tablet = Tablet
battery-device-controller = Controller
battery-device-pen = Pen
battery-device-touchpad = Touchpad
battery-device-headset = Headset
battery-device-speaker = Speaker
battery-device-headphones = Koptelefoon
battery-device-remote = Afstandsbediening
battery-device-other = Verbonden apparaat

## Privacy indicator

privacy-indicator = Gebruikt je { $things }
privacy-thing-camera = camera
privacy-thing-microphone = microfoon
privacy-thing-screen = scherm
privacy-thing-location = locatie
privacy-thing-windows = vensters

privacy-camera-unknown-app = Een app gebruikt de camera
privacy-stop-sharing = Scherm niet meer delen
privacy-stop-recording = Opname stoppen
privacy-turn-off-location = Locatievoorzieningen uitschakelen
privacy-settings = Privacyinstellingen
privacy-camera = Camera
privacy-microphone = Microfoon
privacy-microphone-muted = Microfoon gedempt
privacy-mute-microphone = Microfoon dempen
privacy-unmute-microphone = Microfoon niet meer dempen
privacy-close-app = { $app } sluiten
privacy-unknown-app = Een app
privacy-windows-using = Gebruikt je vensters
privacy-windows-seeing = Ziet je vensters
privacy-windows-stop = Toegang intrekken

## Window access prompt

peek-see-title = { $app } wil je vensters zien
peek-see-description = Het kan dan van elk geopend venster een afbeelding maken.
peek-use-title = { $app } wil je vensters zien en gebruiken
peek-use-description = Het kan dan elk geopend venster zien en erin klikken en typen alsof jij het bent.
peek-deny = Niet toestaan
peek-allow-once = Eenmalig toestaan
peek-allow-until-quit = Toestaan tot het stopt

## Window access errors

peek-error-declined = Degene die deze computer gebruikt heeft dit geweigerd. { $app } kan het opnieuw vragen nadat het is gestopt.
peek-error-not-allowed = Degene die deze computer gebruikt heeft dit niet toegestaan
peek-error-sandboxed = Apps in een sandbox kunnen andere vensters niet zien of gebruiken
peek-error-unknown-caller = Het programma dat het vraagt is gestopt of kon niet worden herkend
peek-error-no-caller = De sessiebus gaf niet aan welk programma het vraagt
peek-error-screen-busy = Het scherm is vergrendeld of er staat een systeemvenster op. Probeer het opnieuw zodra dat weg is.
peek-error-input-held = Iemand houdt toetsen of muisknoppen ingedrukt. Probeer het zo opnieuw.
peek-error-input-dropped = De invoer is gestopt omdat er iets anders onder de aanwijzer lag of het toetsenbord had toen de invoer aankwam
peek-error-not-in-front = Het venster kon niet naar voren worden gehaald
peek-error-covered = Er ligt iets anders over dat deel van het venster
peek-error-outside = { $x }, { $y } valt buiten de afbeelding van het venster, die { $width } × { $height } is
peek-error-nothing-to-capture = Het venster toont niets om vast te leggen
peek-error-window-picture-late = De afbeelding van het venster was niet op tijd klaar
peek-error-screen-picture-late = De afbeelding van het scherm was niet op tijd klaar
peek-error-no-window-id = Er is geen venster met id { $id }. peek list toont de geopende vensters.
peek-error-no-window-for-handle = Het programma dat is gestart als { $handle } heeft geen venster geopend
peek-error-ended-before-window = Het programma stopte voordat het een venster opende
peek-error-no-window-in-time = Er is binnen { $duration } geen venster geopend
peek-error-launch-not-started-by-peek = Alleen een programma dat peek run zelf heeft gestart, kan worden gestart
peek-error-ended-while-starting = Het programma stopte tijdens het starten
peek-error-launch-failed = systemd kon { $program } niet starten
peek-error-unknown-handle = Niets dat je met peek run hebt gestart heeft de handle { $handle }, of het is al gestopt
peek-error-unknown-key = { $key } is geen toets die peek kent
peek-error-unknown-modifier = { $modifier } is geen modificatietoets. Gebruik ctrl, shift, alt of super.
peek-error-display-owner = Dit beeldscherm is van een ander programma
peek-error-display-run = Programma’s in een verborgen beeldscherm worden gestart door peek run
peek-error-display-handle = Dit beeldscherm is gestart als { $handle }, niet als { $requested }
