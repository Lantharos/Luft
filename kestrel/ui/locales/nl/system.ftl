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
memory-low-title = Luft heeft bijna geen geheugen meer
memory-low-app-body = { $app } gebruikt { $size }. Forceer het stoppen, zodat al het andere vlot blijft reageren.
memory-low-container-body = Een container gebruikt { $size }. Forceer het stoppen, zodat al het andere vlot blijft reageren.
memory-low-force-quit = Geforceerd stoppen

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
privacy-windows-seeing-programs = { $count ->
    [one] { $count } programma kan je vensters zien
   *[other] { $count } programma’s kunnen je vensters zien
}
privacy-windows-using-programs = { $count ->
    [one] { $count } programma kan je vensters zien en gebruiken
   *[other] { $count } programma’s kunnen je vensters zien en gebruiken
}
privacy-windows-stop = Toegang intrekken

## Window access prompt

peek-see-request = Toestaan dat een programma dat je hebt gestart je vensters ziet?
peek-see-description = Het kan dan van elk geopend venster een afbeelding maken.
peek-use-request = Toestaan dat een programma dat je hebt gestart je vensters ziet en gebruikt?
peek-use-description = Het kan dan elk geopend venster zien en erin klikken en typen alsof jij het bent.
peek-deny = Niet toestaan
peek-allow-once = Eenmalig toestaan
peek-allow-until-quit = Toestaan tot het stopt

## Window access errors

peek-error-declined-until-quit = Degene die deze computer gebruikt heeft dit geweigerd. Het programma kan het opnieuw vragen nadat het is gestopt.
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

## Quick settings tiles

auto-rotate-title = Automatisch draaien
dark-style-title = Donkere modus
do-not-disturb-title = Niet storen
night-light-title = Nachtlampje
airplane-mode-title = Vliegtuigmodus

## Power mode

power-profile-title = Energiemodus
power-profile-header = Energiemodus
power-profile-open-menu = Menu energiemodus openen
power-profile-settings = Energie-instellingen
power-profile-performance = Prestaties
power-profile-balanced = Gebalanceerd
power-profile-power-saver = Energiebesparing
power-profile-custom = Aangepast

## Keep awake

caffeine-title = Wakker houden
caffeine-open-menu = Menu wakker houden openen
caffeine-until = Tot { $time }
caffeine-until-turned-off = Tot ik het uitschakel
caffeine-30-minutes = 30 minuten
caffeine-1-hour = 1 uur
caffeine-2-hours = 2 uur
caffeine-inhibit-reason = Wakker gehouden via snelle instellingen

## Brightness

brightness-title = Helderheid
brightness-open-menu = Menu helderheid openen

## Keyboard backlight

backlight-title = Toetsenbordverlichting
backlight-open-menu = Menu toetsenbordhelderheid openen
backlight-slider = Toetsenbordhelderheid
backlight-off = Uit
backlight-low = Laag
backlight-high = Hoog

## Sound

volume-sound-settings = Geluidsinstellingen
volume-mute = Dempen
volume-unmute = Dempen opheffen
volume-output-slider = Volume
volume-output-title = Geluidsuitvoer
volume-output-open-menu = Menu geluidsuitvoer openen
volume-input-slider = Microfoon
volume-input-title = Geluidsinvoer
volume-input-open-menu = Menu geluidsinvoer openen

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Bluetooth-menu openen
bluetooth-settings = Bluetooth-instellingen
bluetooth-connect = Verbinden
bluetooth-disconnect = Verbreken
bluetooth-connect-device = Verbinden met { $deviceName }
bluetooth-disconnect-device = Verbinding met { $deviceName } verbreken
bluetooth-no-devices = Geen beschikbare of verbonden apparaten
bluetooth-turn-on-hint = Schakel Bluetooth in om verbinding te maken met apparaten
bluetooth-connected-count = { $count ->
    [one] { $count } verbonden
   *[other] { $count } verbonden
}

## Network menus in quick settings

network-menu-unknown-network = <onbekend>
network-menu-connect = Verbinden
network-menu-disconnect = Verbreken
network-menu-connect-to = Verbinden met { $name }
network-menu-disconnect-from = Verbinding met { $name } verbreken
network-menu-turn-off = Uitschakelen
network-menu-wifi-network = { $secure ->
    [yes] { $name }, beveiligd, signaalsterkte { $strength }%
   *[no] { $name }, niet beveiligd, signaalsterkte { $strength }%
}
network-menu-hotspot = Hotspot van { $name }
network-menu-connected-count = { $count ->
    [one] { $count } verbonden
   *[other] { $count } verbonden
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = VPN-menu openen
network-menu-vpn-settings = VPN-instellingen
network-menu-wifi = Wifi
network-menu-wifi-open-menu = Wifi-menu openen
network-menu-wifi-settings = Alle netwerken
network-menu-wired = Bekabelde verbindingen
network-menu-wired-open-menu = Menu bekabelde verbindingen openen
network-menu-wired-settings = Instellingen voor bekabeld netwerk
network-menu-tethers = Bluetooth-tethering
network-menu-tethers-open-menu = Menu Bluetooth-tethering openen
network-menu-tether = Tethering
network-menu-tether-settings = Bluetooth-instellingen
network-menu-mobile-connections = Mobiele verbindingen
network-menu-mobile-open-menu = Menu mobiele verbindingen openen
network-menu-mobile-settings = Instellingen voor mobiel breedband
network-menu-mobile = Mobiel
network-device-wired = Bekabeld
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Aanmelden bij netwerk
network-menu-failed-title = Verbinding mislukt
network-menu-failed-body = De netwerkverbinding kon niet worden geactiveerd

## Location access dialog

location-dialog-title = Locatietoegang toestaan
location-dialog-description = De app { $appName } wil toegang tot je locatie
location-dialog-info = Je kunt locatietoegang altijd wijzigen in de privacyinstellingen
location-dialog-deny = Weigeren
location-dialog-grant = Toegang geven

## Thunderbolt notifications

thunderbolt-unknown-title = Onbekend Thunderbolt-apparaat
thunderbolt-unknown-body = Er is een nieuw apparaat aangesloten terwijl je weg was. Koppel het los en sluit het opnieuw aan om het te gebruiken.
thunderbolt-unauthorized-title = Niet-goedgekeurd Thunderbolt-apparaat
thunderbolt-unauthorized-body = Er is een nieuw apparaat aangesloten dat goedkeuring van een beheerder nodig heeft
thunderbolt-error-title = Fout bij goedkeuren van Thunderbolt-apparaat
thunderbolt-error-body = Kan het Thunderbolt-apparaat niet goedkeuren: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Weigeren
access-dialog-allow = Toestaan

## Display change confirmation

display-change-title = Deze beeldinstellingen houden?
display-change-countdown = { $seconds ->
    [one] De wijzigingen worden over { $seconds } seconde teruggedraaid
   *[other] De wijzigingen worden over { $seconds } seconden teruggedraaid
}
display-change-revert = Terugdraaien
display-change-keep = Behouden

## Drive connected notification

autorun-connected = “{ $driveName }” aangesloten
autorun-ready = De schijf kan nu worden gebruikt
autorun-open-with = Openen met { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Langzame toetsen ingeschakeld
kbd-a11y-slow-keys-off = Langzame toetsen uitgeschakeld
kbd-a11y-slow-keys-description = Je hebt de Shift-toets 8 seconden ingedrukt gehouden. Dat is de sneltoets voor Langzame toetsen, een functie die de werking van je toetsenbord verandert.
kbd-a11y-sticky-keys-on = Plaktoetsen ingeschakeld
kbd-a11y-sticky-keys-off = Plaktoetsen uitgeschakeld
kbd-a11y-sticky-keys-on-description = Je hebt 5 keer achter elkaar op de Shift-toets gedrukt. Dat is de sneltoets voor Plaktoetsen, een functie die de werking van je toetsenbord verandert.
kbd-a11y-sticky-keys-off-description = Je hebt twee toetsen tegelijk ingedrukt of 5 keer achter elkaar op de Shift-toets gedrukt. Daarmee schakel je Plaktoetsen uit, een functie die de werking van je toetsenbord verandert.
kbd-a11y-leave-on = Aan laten
kbd-a11y-turn-on = Inschakelen
kbd-a11y-turn-off = Uitschakelen
kbd-a11y-leave-off = Uit laten

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Audioapparaat kiezen
audio-device-cancel = Annuleren
audio-device-sound-settings = Geluidsinstellingen
audio-device-headphones = Koptelefoon
audio-device-headset = Headset
audio-device-microphone = Microfoon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Sneltoetsen laten blokkeren
inhibit-shortcuts-app = De app { $appName } wil de systeemsneltoetsen blokkeren
inhibit-shortcuts-unknown-app = Een app wil de systeemsneltoetsen blokkeren
inhibit-shortcuts-restore = Je kunt de sneltoetsen herstellen door op { $shortcut } te drukken
inhibit-shortcuts-deny = Weigeren
inhibit-shortcuts-allow = Toestaan

## Unlocking encrypted drives

mount-hidden-volume = Verborgen volume
mount-windows-system-volume = Windows-systeemvolume
mount-uses-keyfiles = Gebruikt sleutelbestanden
mount-keyfiles-use-app = Gebruik het hulpprogramma <i>{ $appName }</i> om een volume met sleutelbestanden te ontgrendelen
mount-keyfiles-need-app = Je hebt een extern hulpprogramma zoals <i>Schijven</i> nodig om een volume met sleutelbestanden te ontgrendelen
mount-pim-number = PIM-nummer
mount-pim-invalid = De PIM moet een getal zijn of leeg blijven
mount-password = Wachtwoord
mount-remember-password = Wachtwoord onthouden
mount-cancel = Annuleren
mount-unlock = Ontgrendelen
mount-open-app = { $appName } openen
mount-wrong-password = Dat werkte niet. Probeer het opnieuw.
mount-unlock-failed = Kan het volume niet ontgrendelen
mount-pim-unsupported = De geïnstalleerde versie van udisks ondersteunt de PIM-instelling niet

## Network passwords, asked when connecting needs one

network-agent-auth-required = Verificatie vereist
network-agent-wifi-rejected = Het opgeslagen wachtwoord voor “{ $networkName }” werkte niet. Voer het opnieuw in.
network-agent-wifi-secrets = Er zijn wachtwoorden of versleutelingssleutels nodig voor het draadloze netwerk “{ $networkName }”
network-agent-wps-hint = Je kunt ook verbinding maken door op de WPS-knop van je router te drukken
network-agent-wired-title = Bekabelde 802.1X-verificatie
network-agent-dsl-title = DSL-verificatie
network-agent-pin-title = Pincode vereist
network-agent-pin-body = Het apparaat voor mobiel breedband heeft een pincode nodig
network-agent-vpn-title = VPN-wachtwoord
network-agent-password-required = Er is een wachtwoord nodig om verbinding te maken met “{ $networkName }”
network-agent-connect = Verbinden
network-agent-cancel = Annuleren
network-agent-password = Wachtwoord
network-agent-username = Gebruikersnaam
network-agent-key = Sleutel
network-agent-private-key-password = Wachtwoord van privésleutel
network-agent-identity = Identiteit
network-agent-service = Service
network-agent-network-name = Netwerknaam
network-agent-pin = Pincode

## Screenshots and screen recording

screenshot-source = Schermopname
screenshot-area = Gebied selecteren
screenshot-screen = Scherm selecteren
screenshot-window = Venster selecteren
screenshot-take = Schermafbeelding maken
screenshot-record = Scherm opnemen
screenshot-show-pointer = Aanwijzer tonen
screenshot-capture = Vastleggen
screenshot-close = Sluiten
screenshot-screencasts-folder = Schermopnamen
screenshot-screencast-file = Schermopname van { $date } { $time }
screenshot-screenshots-folder = Schermafbeeldingen
screenshot-file = Schermafbeelding van { $timestamp }
screenshot-screencast-recorded = Schermopname gemaakt
screenshot-screencast-start-failed = Schermopname kon niet starten
screenshot-screencast-out-of-space = Schermopname mislukt: schijf is vol
screenshot-screencast-try-again = Schermopname mislukt, probeer het opnieuw
screenshot-screencast-failed = Schermopname mislukt
screenshot-screencast-view = Klik hier om de video te bekijken
screenshot-show-in-rover = Tonen in Rover
screenshot-captured = Schermafbeelding gemaakt
screenshot-captured-body = Je kunt de afbeelding plakken vanaf het klembord

## System updates
updates-available-title = Er zijn systeemupdates beschikbaar
updates-available-body = Open Instellingen om ze te downloaden en te installeren.
updates-ready-title = Updates zijn klaar om te installeren
updates-ready-body = Start opnieuw op wanneer het je uitkomt om ze te installeren.
