## Shared

system-cancel = Avbryt

## Dictation notifications

dictation-setup-title = Skriv ved å snakke
dictation-setup-body = Snakk, så skrives det du sier, i alle apper. Talegjenkjenningen kjører på denne datamaskinen, så den trenger talemodellen først.
dictation-setup-action = Konfigurer diktering
dictation-unsupported-title = Diktering på { $language } er ikke tilgjengelig på denne datamaskinen
dictation-unsupported-body = Prosessoren kan ikke kjøre talegjenkjenningen som trengs for { $language }. Du kan diktere på et annet språk.
dictation-settings-action = Innstillinger for diktering

## System health notifications

health-gpu-reset-title = Grafikkdriveren sluttet å svare
health-gpu-reset-body = { $day ->
    [today] Datamaskinen startet seg selv på nytt i dag kl. { $time }. I Innstillinger ser du hva som kan hindre at det skjer igjen.
   *[other] Datamaskinen startet seg selv på nytt { $date } kl. { $time }. I Innstillinger ser du hva som kan hindre at det skjer igjen.
}
health-gpu-reset-details = Detaljer

oom-app-closed-title = { $app } ble lukket for å frigjøre minne
oom-container-closed-title = En container ble lukket for å frigjøre minne
oom-closed-body = Datamaskinen var i ferd med å gå tom for minne, så den ble lukket slik at alt annet fortsatt svarer.
oom-closed-body-with-size = Datamaskinen var i ferd med å gå tom for minne, så den ble lukket slik at alt annet fortsatt svarer. Den brukte { $size }.
memory-low-title = Luft har lite minne igjen
memory-low-app-body = { $app } bruker { $size }. Tving den til å avslutte, slik at alt annet fortsatt svarer.
memory-low-container-body = En container bruker { $size }. Tving den til å avslutte, slik at alt annet fortsatt svarer.
memory-low-force-quit = Tving avslutning

## Input source indicator

input-source-indicator = Inndatakilde: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Flymodus er slått på i maskinvaren
media-keys-airplane-mode-on = Flymodus på
media-keys-airplane-mode-off = Flymodus av
media-keys-bluetooth-on = Bluetooth på
media-keys-bluetooth-off = Bluetooth av
media-keys-caps-lock-on = Caps Lock på
media-keys-caps-lock-off = Caps Lock av
media-keys-num-lock-on = Num Lock på
media-keys-num-lock-off = Num Lock av

## VPN sign-in

vpn-sign-in-title = Logg inn på { $connection }
vpn-connect = Koble til
vpn-signing-in = Logger inn…
vpn-finish-in-browser = Fullfør påloggingen i nettleseren.
vpn-certificate-untrusted = { $host } la fram et sertifikat som ikke kan bekreftes ({ $reason }). Fingeravtrykket er { $fingerprint }.
vpn-certificate-warning = Noen kan utgi seg for å være denne serveren. Koble bare til hvis du ventet dette.
vpn-certificate-connect = Koble til likevel

vpn-field-password = Passord
vpn-field-certificate-password = Sertifikatpassord
vpn-field-proxy-password = Proxy-passord
vpn-field-pre-shared-key = Forhåndsdelt nøkkel
vpn-field-group-password = Gruppepassord

## Battery notifications

battery-left = { $percent } igjen.
battery-left-with-time = { $percent } igjen, omtrent { $duration }.
battery-low-title = Lavt batterinivå
battery-very-low-title = Svært lavt batterinivå
battery-almost-empty-title = Batteriet er nesten tomt
battery-ups-low-title = Lavt batterinivå i UPS-en
battery-ups-very-low-title = Svært lavt batterinivå i UPS-en
battery-ups-almost-empty-title = UPS-batteriet er nesten tomt
battery-very-low-body = { $left } Koble til strøm snart.
battery-almost-empty-body = { $left } Koble til strøm nå, så du ikke mister ulagret arbeid.

battery-device-low-title = Lavt batterinivå: { $device }
battery-device-very-low-title = Svært lavt batterinivå: { $device }
battery-device-low-body = { $left } Lad den snart.
battery-device-very-low-body = { $left } Lad den nå, så den ikke slår seg av.

battery-device-mouse = Mus
battery-device-keyboard = Tastatur
battery-device-phone = Telefon
battery-device-tablet = Nettbrett
battery-device-controller = Spillkontroller
battery-device-pen = Penn
battery-device-touchpad = Styreplate
battery-device-headset = Hodesett
battery-device-speaker = Høyttaler
battery-device-headphones = Hodetelefoner
battery-device-remote = Fjernkontroll
battery-device-other = Tilkoblet enhet

## Privacy indicator

privacy-indicator = Bruker { $things }
privacy-thing-camera = kameraet
privacy-thing-microphone = mikrofonen
privacy-thing-screen = skjermen
privacy-thing-location = posisjonen
privacy-thing-windows = vinduene

privacy-camera-unknown-app = En app bruker kameraet
privacy-stop-sharing = Slutt å dele skjermen
privacy-stop-recording = Stopp opptaket
privacy-turn-off-location = Slå av posisjonstjenester
privacy-settings = Personverninnstillinger
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofonen er dempet
privacy-mute-microphone = Demp mikrofonen
privacy-unmute-microphone = Slå på mikrofonen
privacy-close-app = Lukk { $app }
privacy-unknown-app = En app
privacy-reported-app = «{ $name }» (navnet er ikke bekreftet)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program kan se vinduene dine
   *[other] { $count } programmer kan se vinduene dine
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program kan se og bruke vinduene dine
   *[other] { $count } programmer kan se og bruke vinduene dine
}
privacy-windows-stop = Fjern tilgangen

## Window access prompt

peek-see-request = Vil du la et program du har startet, se vinduene dine?
peek-see-description = Den vil kunne ta bilder av alle vinduer du har åpne.
peek-use-request = Vil du la et program du har startet, se og bruke vinduene dine?
peek-use-description = Den vil kunne se alle vinduer du har åpne, og klikke og skrive i dem som om den var deg.
peek-deny = Ikke tillat
peek-allow-once = Tillat én gang
peek-allow-until-quit = Tillat til den avsluttes

## Window access errors

peek-error-declined-until-quit = Personen som bruker denne datamaskinen, avslo dette. Programmet kan spørre igjen etter at det er avsluttet.
peek-error-not-allowed = Personen som bruker denne datamaskinen, tillot det ikke
peek-error-sandboxed = Apper i sandkasse kan ikke se eller bruke andre vinduer
peek-error-unknown-caller = Programmet som spør, ble avsluttet eller kunne ikke gjenkjennes
peek-error-no-caller = Øktbussen oppga ikke hvilket program som spør
peek-error-screen-busy = Skjermen er låst, eller det er åpnet en systemdialog på den. Prøv igjen når den er borte.
peek-error-input-held = Noen holder nede taster eller museknapper. Prøv igjen om et øyeblikk.
peek-error-input-dropped = Inndataene ble stoppet fordi noe annet var under punktet eller hadde tastaturet da de kom fram
peek-error-not-in-front = Vinduet kunne ikke hentes fram
peek-error-covered = Noe annet dekker den delen av vinduet
peek-error-outside = { $x }, { $y } er utenfor vindusbildet, som er { $width } × { $height }
peek-error-nothing-to-capture = Vinduet viser ikke noe som kan tas bilde av
peek-error-window-picture-late = Vindusbildet var ikke klart i tide
peek-error-screen-picture-late = Skjermbildet var ikke klart i tide
peek-error-no-window-id = Ingen vinduer har ID-en { $id }. peek list viser de åpne vinduene.
peek-error-no-window-for-handle = Programmet som ble startet som { $handle }, har ingen åpne vinduer
peek-error-ended-before-window = Programmet ble avsluttet før det åpnet et vindu
peek-error-no-window-in-time = Ingen vinduer ble åpnet innen { $duration }
peek-error-launch-not-started-by-peek = Bare et program som peek run har startet selv, kan startes
peek-error-ended-while-starting = Programmet ble avsluttet mens det startet
peek-error-launch-failed = systemd kunne ikke starte { $program }
peek-error-unknown-handle = Ingenting du har startet med peek run, har håndtaket { $handle }, eller det er allerede avsluttet
peek-error-unknown-key = { $key } er ikke en tast peek kjenner
peek-error-unknown-modifier = { $modifier } er ikke en modifikatortast. Bruk ctrl, shift, alt eller super.
peek-error-display-owner = Denne skjermen tilhører et annet program
peek-error-display-run = Programmer i en skjult skjerm startes av peek run
peek-error-display-handle = Denne skjermen ble startet som { $handle }, ikke { $requested }

## Quick settings tiles

auto-rotate-title = Autorotasjon
dark-style-title = Mørk modus
do-not-disturb-title = Ikke forstyrr
night-light-title = Nattlys
airplane-mode-title = Flymodus

## Power mode

power-profile-title = Strømmodus
power-profile-header = Strømmodus
power-profile-open-menu = Åpne menyen for strømmodus
power-profile-settings = Strøminnstillinger
power-profile-performance = Ytelse
power-profile-balanced = Balansert
power-profile-power-saver = Strømsparing
power-profile-custom = Egendefinert

## Keep awake

caffeine-title = Hold våken
caffeine-open-menu = Åpne menyen for Hold våken
caffeine-until = Til { $time }
caffeine-until-turned-off = Til den slås av
caffeine-30-minutes = 30 minutter
caffeine-1-hour = 1 time
caffeine-2-hours = 2 timer
caffeine-inhibit-reason = Holdt våken fra hurtiginnstillingene

## Brightness

brightness-title = Lysstyrke
brightness-open-menu = Åpne menyen for lysstyrke

## Keyboard backlight

backlight-title = Tastaturbelysning
backlight-open-menu = Åpne menyen for tastaturbelysning
backlight-slider = Tastaturbelysning
backlight-off = Av
backlight-low = Lav
backlight-high = Høy

## Sound

volume-sound-settings = Lydinnstillinger
volume-mute = Demp
volume-unmute = Slå på lyd
volume-output-slider = Volum
volume-output-title = Lydutgang
volume-output-open-menu = Åpne menyen for lydutgang
volume-input-slider = Mikrofon
volume-input-title = Lydinngang
volume-input-open-menu = Åpne menyen for lydinngang

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Åpne Bluetooth-menyen
bluetooth-settings = Bluetooth-innstillinger
bluetooth-connect = Koble til
bluetooth-disconnect = Koble fra
bluetooth-connect-device = Koble til { $deviceName }
bluetooth-disconnect-device = Koble fra { $deviceName }
bluetooth-no-devices = Ingen tilgjengelige eller tilkoblede enheter
bluetooth-turn-on-hint = Slå på Bluetooth for å koble til enheter
bluetooth-connected-count = { $count ->
    [one] { $count } tilkoblet
   *[other] { $count } tilkoblet
}

## Network menus in quick settings

network-menu-unknown-network = <ukjent>
network-menu-connect = Koble til
network-menu-disconnect = Koble fra
network-menu-connect-to = Koble til { $name }
network-menu-disconnect-from = Koble fra { $name }
network-menu-turn-off = Slå av
network-menu-wifi-network = { $secure ->
    [yes] { $name }, sikret, signalstyrke { $strength } %
   *[no] { $name }, ikke sikret, signalstyrke { $strength } %
}
network-menu-hotspot = Trådløssone på { $name }
network-menu-connected-count = { $count ->
    [one] { $count } tilkoblet
   *[other] { $count } tilkoblet
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Åpne VPN-menyen
network-menu-vpn-settings = VPN-innstillinger
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Åpne Wi-Fi-menyen
network-menu-wifi-settings = Alle nettverk
network-menu-wired = Kablede tilkoblinger
network-menu-wired-open-menu = Åpne menyen for kablede tilkoblinger
network-menu-wired-settings = Innstillinger for kablet nettverk
network-menu-tethers = Internettdeling via Bluetooth
network-menu-tethers-open-menu = Åpne menyen for internettdeling via Bluetooth
network-menu-tether = Internettdeling
network-menu-tether-settings = Bluetooth-innstillinger
network-menu-mobile-connections = Mobiltilkoblinger
network-menu-mobile-open-menu = Åpne menyen for mobiltilkoblinger
network-menu-mobile-settings = Innstillinger for mobilt bredbånd
network-menu-mobile = Mobil
network-device-wired = Kablet
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Logg inn på nettverket
network-menu-failed-title = Tilkoblingen mislyktes
network-menu-failed-body = Kunne ikke aktivere nettverkstilkoblingen

## Location access dialog

location-dialog-title = Tillat tilgang til posisjon
location-dialog-description = Appen { $appName } vil ha tilgang til posisjonen din
location-dialog-info = Du kan når som helst endre tilgangen til posisjon i personverninnstillingene
location-dialog-deny = Avslå tilgang
location-dialog-grant = Gi tilgang

## Thunderbolt notifications

thunderbolt-unknown-title = Ukjent Thunderbolt-enhet
thunderbolt-unknown-body = En ny enhet ble koblet til mens du var borte. Koble den fra og til igjen for å ta den i bruk.
thunderbolt-unauthorized-title = Ikke godkjent Thunderbolt-enhet
thunderbolt-unauthorized-body = En ny enhet ble koblet til og må godkjennes av en administrator
thunderbolt-error-title = Feil ved godkjenning av Thunderbolt-enhet
thunderbolt-error-body = Kunne ikke godkjenne Thunderbolt-enheten: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Avslå
access-dialog-allow = Tillat

## Display change confirmation

display-change-title = Beholde skjerminnstillingene?
display-change-countdown = { $seconds ->
    [one] Endringene tilbakestilles om { $seconds } sekund
   *[other] Endringene tilbakestilles om { $seconds } sekunder
}
display-change-revert = Tilbakestill
display-change-keep = Behold endringene

## Drive connected notification

autorun-connected = «{ $driveName }» er koblet til
autorun-ready = Disken kan nå brukes
autorun-open-with = Åpne med { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Trege taster er slått på
kbd-a11y-slow-keys-off = Trege taster er slått av
kbd-a11y-slow-keys-description = Du holdt nettopp nede Skift-tasten i 8 sekunder. Det er hurtigtasten for trege taster, som endrer hvordan tastaturet virker.
kbd-a11y-sticky-keys-on = Låsetaster er slått på
kbd-a11y-sticky-keys-off = Låsetaster er slått av
kbd-a11y-sticky-keys-on-description = Du trykket nettopp på Skift-tasten 5 ganger på rad. Det er hurtigtasten for låsetaster, som endrer hvordan tastaturet virker.
kbd-a11y-sticky-keys-off-description = Du trykket nettopp på to taster samtidig, eller på Skift-tasten 5 ganger på rad. Det slår av låsetaster, som endrer hvordan tastaturet virker.
kbd-a11y-leave-on = La være på
kbd-a11y-turn-on = Slå på
kbd-a11y-turn-off = Slå av
kbd-a11y-leave-off = La være av

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Velg lydenhet
audio-device-cancel = Avbryt
audio-device-sound-settings = Lydinnstillinger
audio-device-headphones = Hodetelefoner
audio-device-headset = Hodesett
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Tillat at hurtigtaster overstyres
inhibit-shortcuts-app = Appen { $appName } vil overstyre systemets hurtigtaster
inhibit-shortcuts-unknown-app = En app vil overstyre systemets hurtigtaster
inhibit-shortcuts-titled-app = En app med vinduet «{ $title }» vil overstyre systemets hurtigtaster
inhibit-shortcuts-restore = Du kan få hurtigtastene tilbake ved å trykke på { $shortcut }
inhibit-shortcuts-deny = Avslå
inhibit-shortcuts-allow = Tillat

## Unlocking encrypted drives

mount-hidden-volume = Skjult volum
mount-windows-system-volume = Windows-systemvolum
mount-uses-keyfiles = Bruker nøkkelfiler
mount-keyfiles-use-app = Bruk <i>{ $appName }</i> for å låse opp et volum som bruker nøkkelfiler
mount-keyfiles-need-app = Du trenger et eksternt verktøy som <i>Disker</i> for å låse opp et volum som bruker nøkkelfiler
mount-pim-number = PIM-nummer
mount-pim-invalid = PIM må være et tall eller stå tomt
mount-password = Passord
mount-remember-password = Husk passordet
mount-cancel = Avbryt
mount-unlock = Lås opp
mount-open-app = Åpne { $appName }
mount-wrong-password = Det virket ikke. Prøv igjen.
mount-unlock-failed = Kunne ikke låse opp volumet
mount-pim-unsupported = Den installerte versjonen av udisks støtter ikke PIM-innstillingen

## Network passwords, asked when connecting needs one

network-agent-auth-required = Godkjenning kreves
network-agent-wifi-rejected = Det lagrede passordet for «{ $networkName }» virket ikke. Skriv det inn på nytt.
network-agent-wifi-secrets = Det trådløse nettverket «{ $networkName }» krever passord eller krypteringsnøkkel
network-agent-wps-hint = Du kan også koble til ved å trykke på WPS-knappen på ruteren
network-agent-wired-title = 802.1X-godkjenning for kablet nettverk
network-agent-dsl-title = DSL-godkjenning
network-agent-pin-title = PIN-kode kreves
network-agent-pin-body = Enheten for mobilt bredbånd trenger en PIN-kode
network-agent-vpn-title = VPN-passord
network-agent-password-required = Det kreves et passord for å koble til «{ $networkName }»
network-agent-connect = Koble til
network-agent-cancel = Avbryt
network-agent-password = Passord
network-agent-username = Brukernavn
network-agent-key = Nøkkel
network-agent-private-key-password = Passord for privat nøkkel
network-agent-identity = Identitet
network-agent-service = Tjeneste
network-agent-network-name = Nettverksnavn
network-agent-pin = PIN-kode

## Screenshots and screen recording

screenshot-source = Skjermbilder og opptak
screenshot-area = Merk område
screenshot-screen = Hele skjermen
screenshot-window = Vindu
screenshot-take = Ta skjermbilde
screenshot-record = Ta opp skjermen
screenshot-show-pointer = Vis pekeren
screenshot-capture = Ta bilde
screenshot-close = Lukk
screenshot-screencasts-folder = Skjermopptak
screenshot-screencast-file = Skjermopptak { $date } { $time }
screenshot-screenshots-folder = Skjermbilder
screenshot-file = Skjermbilde { $timestamp }
screenshot-screencast-recorded = Skjermopptaket er lagret
screenshot-screencast-start-failed = Kunne ikke starte skjermopptaket
screenshot-screencast-out-of-space = Skjermopptaket mislyktes: Ikke nok diskplass
screenshot-screencast-try-again = Skjermopptaket mislyktes. Prøv igjen.
screenshot-screencast-failed = Skjermopptaket mislyktes
screenshot-screencast-view = Klikk her for å se videoen
screenshot-show-in-rover = Vis i Rover
screenshot-captured = Skjermbilde tatt
screenshot-captured-body = Du kan lime inn bildet fra utklippstavlen

## System updates
updates-available-title = Systemoppdateringer er tilgjengelige
updates-available-body = Åpne Innstillinger for å laste dem ned og installere dem.
updates-ready-title = Oppdateringene er klare til å installeres
updates-ready-body = Start på nytt når det passer deg, så installeres de.
