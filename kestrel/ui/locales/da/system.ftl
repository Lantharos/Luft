## Shared

system-cancel = Annuller

## Dictation notifications

dictation-setup-title = Skriv ved at tale
dictation-setup-body = Tal for at skrive det, du siger, i enhver app. Det sker her på computeren, så talemodellen skal installeres først.
dictation-setup-action = Konfigurer diktering
dictation-unsupported-title = Diktering på { $language } er ikke tilgængelig på denne computer
dictation-unsupported-body = Computerens processor kan ikke køre den talegenkendelse, som { $language } kræver. Du kan diktere på et andet sprog.
dictation-settings-action = Indstillinger for diktering

## System health notifications

health-gpu-reset-title = Grafikdriveren holdt op med at svare
health-gpu-reset-body = { $day ->
    [today] Din computer genstartede af sig selv i dag kl. { $time }. I Indstillinger kan du se, hvad der kan forhindre, at det sker igen.
   *[other] Din computer genstartede af sig selv { $date } kl. { $time }. I Indstillinger kan du se, hvad der kan forhindre, at det sker igen.
}
health-gpu-reset-details = Detaljer

oom-app-closed-title = { $app } blev lukket for at frigøre hukommelse
oom-container-closed-title = En container blev lukket for at frigøre hukommelse
oom-closed-body = Computeren var ved at løbe tør for hukommelse, så den blev lukket, for at alt andet kunne blive ved med at reagere.
oom-closed-body-with-size = Computeren var ved at løbe tør for hukommelse, så den blev lukket, for at alt andet kunne blive ved med at reagere. Den brugte { $size }.
memory-low-title = Luft er ved at løbe tør for hukommelse
memory-low-app-body = { $app } bruger { $size }. Tving den til at lukke, så alt andet bliver ved med at reagere.
memory-low-container-body = En container bruger { $size }. Tving den til at lukke, så alt andet bliver ved med at reagere.
memory-low-force-quit = Tving til at lukke

## Input source indicator

input-source-indicator = Inputkilde: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Flytilstand er slået til på hardwaren
media-keys-airplane-mode-on = Flytilstand til
media-keys-airplane-mode-off = Flytilstand fra
media-keys-bluetooth-on = Bluetooth til
media-keys-bluetooth-off = Bluetooth fra
media-keys-caps-lock-on = Caps Lock til
media-keys-caps-lock-off = Caps Lock fra
media-keys-num-lock-on = Num Lock til
media-keys-num-lock-off = Num Lock fra

## VPN sign-in

vpn-sign-in-title = Log ind på { $connection }
vpn-connect = Opret forbindelse
vpn-signing-in = Logger ind…
vpn-finish-in-browser = Gør login færdigt i din browser.
vpn-certificate-untrusted = { $host } viste et certifikat, der ikke kan bekræftes ({ $reason }). Dets fingeraftryk er { $fingerprint }.
vpn-certificate-warning = Nogen kan udgive sig for at være denne server. Opret kun forbindelse, hvis du forventede dette.
vpn-certificate-connect = Opret forbindelse alligevel

vpn-field-password = Adgangskode
vpn-field-certificate-password = Adgangskode til certifikat
vpn-field-proxy-password = Adgangskode til proxy
vpn-field-pre-shared-key = Delt nøgle
vpn-field-group-password = Gruppeadgangskode

## Battery notifications

battery-left = { $percent } tilbage.

battery-device-low-title = Lavt batteriniveau: { $device }
battery-device-very-low-title = Meget lavt batteriniveau: { $device }
battery-device-low-body = { $left } Oplad den snart.
battery-device-very-low-body = { $left } Oplad den nu, så den ikke slukker.

battery-device-mouse = Mus
battery-device-keyboard = Tastatur
battery-device-phone = Telefon
battery-device-tablet = Tablet
battery-device-controller = Controller
battery-device-pen = Pen
battery-device-touchpad = Touchpad
battery-device-headset = Headset
battery-device-speaker = Højttaler
battery-device-headphones = Hovedtelefoner
battery-device-remote = Fjernbetjening
battery-device-other = Tilsluttet enhed

## Privacy indicator

privacy-indicator = Bruger { $things }
privacy-thing-camera = kameraet
privacy-thing-microphone = mikrofonen
privacy-thing-screen = skærmen
privacy-thing-location = din placering
privacy-thing-windows = dine vinduer

privacy-camera-unknown-app = En app bruger kameraet
privacy-stop-sharing = Stop deling af skærmen
privacy-stop-recording = Stop optagelse
privacy-turn-off-location = Slå placeringstjenester fra
privacy-settings = Indstillinger for privatliv
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofonen er slået fra
privacy-mute-microphone = Slå mikrofonen fra
privacy-unmute-microphone = Slå mikrofonen til
privacy-close-app = Luk { $app }
privacy-unknown-app = En app
privacy-reported-app = »{ $name }« (navnet er ikke bekræftet)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program kan se dine vinduer
   *[other] { $count } programmer kan se dine vinduer
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program kan se og bruge dine vinduer
   *[other] { $count } programmer kan se og bruge dine vinduer
}
privacy-windows-stop = Fjern adgang

## Window access prompt

peek-see-request = Vil du lade et program, du har startet, se dine vinduer?
peek-see-description = Den vil kunne tage billeder af alle de vinduer, du har åbne.
peek-use-request = Vil du lade et program, du har startet, se og bruge dine vinduer?
peek-use-description = Den vil kunne se alle de vinduer, du har åbne, og klikke og skrive i dem, som om det var dig.
peek-deny = Tillad ikke
peek-allow-once = Tillad én gang
peek-allow-until-quit = Tillad, indtil den afsluttes

## Window access errors

peek-error-declined-until-quit = Personen, der bruger denne computer, afviste det. Programmet kan spørge igen, når det er afsluttet.
peek-error-not-allowed = Personen, der bruger denne computer, tillod det ikke
peek-error-sandboxed = Apps i en sandkasse kan ikke se eller bruge andre vinduer
peek-error-unknown-caller = Programmet, der spørger, er afsluttet eller kunne ikke genkendes
peek-error-no-caller = Sessionsbussen oplyste ikke, hvilket program der spørger
peek-error-screen-busy = Skærmen er låst, eller der er en systemdialog åben på den. Prøv igen, når den er væk.
peek-error-input-held = Nogen holder taster eller museknapper nede. Prøv igen om lidt.
peek-error-input-dropped = Inputtet blev stoppet, fordi noget andet var under markøren eller havde tastaturet, da det kom frem
peek-error-not-in-front = Vinduet kunne ikke bringes forrest
peek-error-covered = Noget andet dækker den del af vinduet
peek-error-outside = { $x }, { $y } ligger uden for vinduets billede, som er { $width } × { $height }
peek-error-nothing-to-capture = Vinduet viser ikke noget, der kan optages
peek-error-window-picture-late = Vinduets billede blev ikke klar i tide
peek-error-screen-picture-late = Skærmens billede blev ikke klar i tide
peek-error-no-window-id = Der er intet vindue med id { $id }. peek list viser de åbne vinduer.
peek-error-no-window-for-handle = Programmet, der blev startet som { $handle }, har intet vindue åbent
peek-error-ended-before-window = Programmet blev afsluttet, før det åbnede et vindue
peek-error-no-window-in-time = Intet vindue blev åbnet inden for { $duration }
peek-error-launch-not-started-by-peek = Kun et program, som peek run selv har startet, kan åbnes
peek-error-ended-while-starting = Programmet blev afsluttet, mens det startede
peek-error-launch-failed = systemd kunne ikke starte { $program }
peek-error-unknown-handle = Intet, du har startet med peek run, har håndtaget { $handle }, eller det er afsluttet
peek-error-unknown-key = { $key } er ikke en tast, peek kender
peek-error-unknown-modifier = { $modifier } er ikke en modifikationstast. Brug ctrl, shift, alt eller super.
peek-error-display-owner = Denne skærm tilhører et andet program
peek-error-display-run = Programmer på en skjult skærm startes af peek run
peek-error-display-handle = Denne skærm blev startet som { $handle }, ikke { $requested }

## Quick settings tiles

auto-rotate-title = Autorotation
dark-style-title = Mørk tilstand
do-not-disturb-title = Forstyr ikke
night-light-title = Natlys
airplane-mode-title = Flytilstand

## Power mode

power-profile-title = Strømtilstand
power-profile-header = Strømtilstand
power-profile-open-menu = Åbn menuen for strømtilstand
power-profile-settings = Strømindstillinger
power-profile-performance = Ydeevne
power-profile-balanced = Balanceret
power-profile-power-saver = Strømbesparelse
power-profile-custom = Brugerdefineret

## Keep awake

caffeine-title = Hold vågen
caffeine-open-menu = Åbn menuen for Hold vågen
caffeine-until = Indtil { $time }
caffeine-until-turned-off = Indtil det slås fra
caffeine-30-minutes = 30 minutter
caffeine-1-hour = 1 time
caffeine-2-hours = 2 timer
caffeine-inhibit-reason = Holdt vågen fra de hurtige indstillinger

## Brightness

brightness-title = Lysstyrke
brightness-open-menu = Åbn menuen for lysstyrke

## Keyboard backlight

backlight-title = Tastaturbelysning
backlight-open-menu = Åbn menuen for tastaturets lysstyrke
backlight-slider = Tastaturets lysstyrke
backlight-off = Fra
backlight-low = Lav
backlight-high = Høj

## Sound

volume-sound-settings = Lydindstillinger
volume-mute = Slå lyden fra
volume-unmute = Slå lyden til
volume-output-slider = Lydstyrke
volume-output-title = Lydudgang
volume-output-open-menu = Åbn menuen for lydudgang
volume-input-slider = Mikrofon
volume-input-title = Lydindgang
volume-input-open-menu = Åbn menuen for lydindgang

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Åbn Bluetooth-menuen
bluetooth-settings = Bluetooth-indstillinger
bluetooth-connect = Opret forbindelse
bluetooth-disconnect = Afbryd
bluetooth-connect-device = Opret forbindelse til { $deviceName }
bluetooth-disconnect-device = Afbryd { $deviceName }
bluetooth-no-devices = Ingen tilgængelige eller tilsluttede enheder
bluetooth-turn-on-hint = Slå Bluetooth til for at oprette forbindelse til enheder
bluetooth-connected-count = { $count ->
    [one] { $count } forbundet
   *[other] { $count } forbundet
}

## Network menus in quick settings

network-menu-unknown-network = <ukendt>
network-menu-connect = Opret forbindelse
network-menu-disconnect = Afbryd
network-menu-connect-to = Opret forbindelse til { $name }
network-menu-disconnect-from = Afbryd { $name }
network-menu-turn-off = Slå fra
network-menu-wifi-network = { $secure ->
    [yes] { $name }, sikret, signalstyrke { $strength } %
   *[no] { $name }, ikke sikret, signalstyrke { $strength } %
}
network-menu-hotspot = Hotspot på { $name }
network-menu-connected-count = { $count ->
    [one] { $count } forbundet
   *[other] { $count } forbundet
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Åbn VPN-menuen
network-menu-vpn-settings = VPN-indstillinger
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Åbn Wi-Fi-menuen
network-menu-wifi-settings = Alle netværk
network-menu-wired = Kablede forbindelser
network-menu-wired-open-menu = Åbn menuen for kablede forbindelser
network-menu-wired-settings = Indstillinger for kablet netværk
network-menu-tethers = Bluetooth-tethering
network-menu-tethers-open-menu = Åbn menuen for Bluetooth-tethering
network-menu-tether = Tethering
network-menu-tether-settings = Bluetooth-indstillinger
network-menu-mobile-connections = Mobilforbindelser
network-menu-mobile-open-menu = Åbn menuen for mobilforbindelser
network-menu-mobile-settings = Indstillinger for mobilt bredbånd
network-menu-mobile = Mobil
network-device-wired = Kablet
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Log ind på netværket
network-menu-failed-title = Forbindelsen mislykkedes
network-menu-failed-body = Netværksforbindelsen kunne ikke aktiveres

## Location access dialog

location-dialog-title = Tillad adgang til placering
location-dialog-description = Appen { $appName } vil have adgang til din placering
location-dialog-info = Du kan altid ændre adgangen til din placering i indstillingerne for privatliv
location-dialog-deny = Afvis adgang
location-dialog-grant = Giv adgang

## Thunderbolt notifications

thunderbolt-unknown-title = Ukendt Thunderbolt-enhed
thunderbolt-unknown-body = En ny enhed blev tilsluttet, mens du var væk. Tag den ud, og sæt den i igen for at bruge den.
thunderbolt-unauthorized-title = Ikke-godkendt Thunderbolt-enhed
thunderbolt-unauthorized-body = En ny enhed blev tilsluttet og skal godkendes af en administrator
thunderbolt-error-title = Thunderbolt-enheden kunne ikke godkendes
thunderbolt-error-body = Thunderbolt-enheden kunne ikke godkendes: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Afvis
access-dialog-allow = Tillad

## Display change confirmation

display-change-title = Behold skærmindstillingerne?
display-change-countdown = { $seconds ->
    [one] Ændringerne fortrydes om { $seconds } sekund
   *[other] Ændringerne fortrydes om { $seconds } sekunder
}
display-change-revert = Fortryd
display-change-keep = Behold ændringer

## Drive connected notification

autorun-connected = »{ $driveName }« er tilsluttet
autorun-ready = Disken kan nu bruges
autorun-open-with = Åbn med { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Langsomme taster er slået til
kbd-a11y-slow-keys-off = Langsomme taster er slået fra
kbd-a11y-slow-keys-description = Du har lige holdt Skift nede i 8 sekunder. Det er genvejen til Langsomme taster, som ændrer, hvordan dit tastatur fungerer.
kbd-a11y-sticky-keys-on = Klæbende taster er slået til
kbd-a11y-sticky-keys-off = Klæbende taster er slået fra
kbd-a11y-sticky-keys-on-description = Du har lige trykket på Skift 5 gange i træk. Det er genvejen til Klæbende taster, som ændrer, hvordan dit tastatur fungerer.
kbd-a11y-sticky-keys-off-description = Du har lige trykket på to taster på én gang eller på Skift 5 gange i træk. Det slår Klæbende taster fra, som ændrer, hvordan dit tastatur fungerer.
kbd-a11y-leave-on = Lad være slået til
kbd-a11y-turn-on = Slå til
kbd-a11y-turn-off = Slå fra
kbd-a11y-leave-off = Lad være slået fra

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Vælg lydenhed
audio-device-cancel = Annuller
audio-device-sound-settings = Lydindstillinger
audio-device-headphones = Hovedtelefoner
audio-device-headset = Headset
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Tillad overtagelse af genveje
inhibit-shortcuts-app = Appen { $appName } vil overtage systemets tastaturgenveje
inhibit-shortcuts-unknown-app = En app vil overtage systemets tastaturgenveje
inhibit-shortcuts-titled-app = En app med vinduet »{ $title }« vil overtage systemets tastaturgenveje
inhibit-shortcuts-restore = Du kan få genvejene tilbage ved at trykke på { $shortcut }
inhibit-shortcuts-deny = Afvis
inhibit-shortcuts-allow = Tillad

## Unlocking encrypted drives

mount-hidden-volume = Skjult diskenhed
mount-windows-system-volume = Windows-systemdiskenhed
mount-uses-keyfiles = Bruger nøglefiler
mount-keyfiles-use-app = Brug <i>{ $appName }</i> til at låse en diskenhed op, der bruger nøglefiler
mount-keyfiles-need-app = Du skal bruge et eksternt værktøj som <i>Diske</i> for at låse en diskenhed op, der bruger nøglefiler
mount-pim-number = PIM-nummer
mount-pim-invalid = PIM skal være et tal eller tomt
mount-password = Adgangskode
mount-remember-password = Husk adgangskode
mount-cancel = Annuller
mount-unlock = Lås op
mount-open-app = Åbn { $appName }
mount-wrong-password = Det virkede ikke. Prøv igen.
mount-unlock-failed = Diskenheden kunne ikke låses op
mount-pim-unsupported = Den installerede version af udisks understøtter ikke PIM-indstillingen

## Network passwords, asked when connecting needs one

network-agent-auth-required = Godkendelse påkrævet
network-agent-wifi-rejected = Den gemte adgangskode til »{ $networkName }« virkede ikke. Indtast den igen.
network-agent-wifi-secrets = Der kræves adgangskoder eller krypteringsnøgler for at få adgang til det trådløse netværk »{ $networkName }«
network-agent-wps-hint = Du kan også oprette forbindelse ved at trykke på WPS-knappen på din router
network-agent-wired-title = Kablet 802.1X-godkendelse
network-agent-dsl-title = DSL-godkendelse
network-agent-pin-title = Pinkode påkrævet
network-agent-pin-body = Enheden til mobilt bredbånd kræver en pinkode
network-agent-vpn-title = VPN-adgangskode
network-agent-password-required = Der kræves en adgangskode for at oprette forbindelse til »{ $networkName }«
network-agent-connect = Opret forbindelse
network-agent-cancel = Annuller
network-agent-password = Adgangskode
network-agent-username = Brugernavn
network-agent-key = Nøgle
network-agent-private-key-password = Adgangskode til privat nøgle
network-agent-identity = Identitet
network-agent-service = Tjeneste
network-agent-network-name = Netværksnavn
network-agent-pin = Pinkode

## Screenshots and screen recording

screenshot-source = Skærmbilleder
screenshot-area = Vælg område
screenshot-screen = Vælg skærm
screenshot-window = Vælg vindue
screenshot-take = Tag skærmbillede
screenshot-record = Optag skærmen
screenshot-show-pointer = Vis markør
screenshot-capture = Tag
screenshot-close = Luk
screenshot-screencasts-folder = Skærmoptagelser
screenshot-screencast-file = Skærmoptagelse fra { $date } { $time }
screenshot-screenshots-folder = Skærmbilleder
screenshot-file = Skærmbillede fra { $timestamp }
screenshot-screencast-recorded = Skærmoptagelse gemt
screenshot-screencast-start-failed = Skærmoptagelsen kunne ikke starte
screenshot-screencast-out-of-space = Skærmoptagelsen mislykkedes: Der er ikke mere plads på disken
screenshot-screencast-try-again = Skærmoptagelsen mislykkedes. Prøv igen.
screenshot-screencast-failed = Skærmoptagelsen mislykkedes
screenshot-screencast-view = Klik her for at se videoen
screenshot-show-in-rover = Vis i Rover
screenshot-captured = Skærmbillede taget
screenshot-captured-body = Du kan indsætte billedet fra udklipsholderen

## System updates
updates-available-title = Der er nye systemopdateringer
updates-available-body = Åbn Indstillinger for at hente og installere dem.
updates-ready-title = Opdateringerne er klar til at blive installeret
updates-ready-body = Genstart, når det passer dig, for at installere dem.
