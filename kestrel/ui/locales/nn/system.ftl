## Shared

system-cancel = Avbryt

## Dictation notifications

dictation-setup-title = Skriv ved å snakke
dictation-setup-body = Snakk, så blir det du seier skrive, i alle appar. Dikteringa lyttar på denne datamaskinen, så ho treng talemodellen sin først.
dictation-setup-action = Set opp diktering
dictation-unsupported-title = Diktering på { $language } er ikkje tilgjengeleg på denne datamaskinen
dictation-unsupported-body = Prosessoren kan ikkje køyre talegjenkjenninga som { $language } treng. Du kan diktere på eit anna språk.
dictation-settings-action = Dikteringsinnstillingar

## System health notifications

health-gpu-reset-title = Grafikkdrivaren slutta å svare
health-gpu-reset-body = { $day ->
    [today] Datamaskinen starta seg sjølv på nytt i dag klokka { $time }. I Innstillingar ser du kva som kan hindre at det skjer igjen.
   *[other] Datamaskinen starta seg sjølv på nytt { $date } klokka { $time }. I Innstillingar ser du kva som kan hindre at det skjer igjen.
}
health-gpu-reset-details = Detaljar

oom-app-closed-title = { $app } vart lukka for å frigjere minne
oom-container-closed-title = Ein container vart lukka for å frigjere minne
oom-closed-body = Datamaskinen var i ferd med å gå tom for minne, så han vart lukka for at alt anna skulle halde fram med å svare.
oom-closed-body-with-size = Datamaskinen var i ferd med å gå tom for minne, så han vart lukka for at alt anna skulle halde fram med å svare. Han brukte { $size }.
memory-low-title = Luft har lite minne att
memory-low-app-body = { $app } brukar { $size }. Tving han til å avslutte, slik at alt anna held fram med å svare.
memory-low-container-body = Ein container brukar { $size }. Tving han til å avslutte, slik at alt anna held fram med å svare.
memory-low-force-quit = Tving avslutting

## Input source indicator

input-source-indicator = Inndatakjelde: { $source }

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
vpn-connect = Kople til
vpn-signing-in = Loggar inn …
vpn-finish-in-browser = Fullfør innlogginga i nettlesaren.
vpn-certificate-untrusted = { $host } viste fram eit sertifikat som ikkje kan stadfestast ({ $reason }). Fingeravtrykket til sertifikatet er { $fingerprint }.
vpn-certificate-warning = Nokon kan utgje seg for å vere denne tenaren. Kople berre til viss du venta dette.
vpn-certificate-connect = Kople til likevel

vpn-field-password = Passord
vpn-field-certificate-password = Sertifikatpassord
vpn-field-proxy-password = Proxy-passord
vpn-field-pre-shared-key = Førehandsdelt nøkkel
vpn-field-group-password = Gruppepassord

## Battery notifications

battery-left = { $percent } att.
battery-left-with-time = { $percent } att, omtrent { $duration }.
battery-low-title = Lågt batteri
battery-very-low-title = Svært lågt batteri
battery-almost-empty-title = Batteriet er nesten tomt
battery-ups-low-title = Lågt UPS-batteri
battery-ups-very-low-title = Svært lågt UPS-batteri
battery-ups-almost-empty-title = UPS-batteriet er nesten tomt
battery-very-low-body = { $left } Kople til straum snart.
battery-almost-empty-body = { $left } Kople til straum no, så du ikkje mistar arbeid som ikkje er lagra.

battery-device-low-title = Lågt batteri i { $device }
battery-device-very-low-title = Svært lågt batteri i { $device }
battery-device-low-body = { $left } Lad opp snart.
battery-device-very-low-body = { $left } Lad opp no, så eininga ikkje slår seg av.

battery-device-mouse = Mus
battery-device-keyboard = Tastatur
battery-device-phone = Telefon
battery-device-tablet = Nettbrett
battery-device-controller = Spelkontroll
battery-device-pen = Penn
battery-device-touchpad = Styreplate
battery-device-headset = Headset
battery-device-speaker = Høgtalar
battery-device-headphones = Hovudtelefonar
battery-device-remote = Fjernkontroll
battery-device-other = Tilkopla eining

## Privacy indicator

privacy-indicator = Brukar { $things }
privacy-thing-camera = kameraet
privacy-thing-microphone = mikrofonen
privacy-thing-screen = skjermen
privacy-thing-location = posisjonen
privacy-thing-windows = vindauga

privacy-camera-unknown-app = Ein app brukar kameraet
privacy-stop-sharing = Slutt å dele skjermen
privacy-stop-recording = Stopp opptaket
privacy-turn-off-location = Slå av posisjonstenester
privacy-settings = Personverninnstillingar
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofonen er dempa
privacy-mute-microphone = Demp mikrofonen
privacy-unmute-microphone = Slå på mikrofonen
privacy-close-app = Lukk { $app }
privacy-unknown-app = Ein app
privacy-reported-app = «{ $name }» (namnet er ikkje stadfesta)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program kan sjå vindauga dine
   *[other] { $count } program kan sjå vindauga dine
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program kan sjå og bruke vindauga dine
   *[other] { $count } program kan sjå og bruke vindauga dine
}
privacy-windows-stop = Fjern tilgangen

## Window access prompt

peek-see-request = Vil du la eit program du har starta, sjå vindauga dine?
peek-see-description = Appen kan då ta bilete av alle vindauga du har opne.
peek-use-request = Vil du la eit program du har starta, sjå og bruke vindauga dine?
peek-use-description = Appen kan då sjå alle vindauga du har opne, og klikke og skrive i dei som om det var deg.
peek-deny = Ikkje tillat
peek-allow-once = Tillat éin gong
peek-allow-until-quit = Tillat til appen blir avslutta

## Window access errors

peek-error-declined-until-quit = Den som brukar denne datamaskinen, avslo dette. Programmet kan spørje igjen når det er avslutta.
peek-error-not-allowed = Den som brukar denne datamaskinen, tillét det ikkje
peek-error-sandboxed = Appar i sandkasse kan ikkje sjå eller bruke andre vindauge
peek-error-unknown-caller = Programmet som spør, er avslutta eller kunne ikkje kjennast att
peek-error-no-caller = Øktbussen sa ikkje kva program som spør
peek-error-screen-busy = Skjermen er låst, eller ein systemdialog er open på han. Prøv igjen når han er borte.
peek-error-input-held = Nokon held nede tastar eller museknappar. Prøv igjen om litt.
peek-error-input-dropped = Inndata vart stoppa fordi noko anna var under peikaren eller hadde tastaturet då dei kom fram
peek-error-not-in-front = Vindauget kunne ikkje hentast fram
peek-error-covered = Noko anna dekkjer den delen av vindauget
peek-error-outside = { $x }, { $y } er utanfor biletet av vindauget, som er { $width } × { $height }
peek-error-nothing-to-capture = Vindauget viser ikkje noko som kan fangast
peek-error-window-picture-late = Biletet av vindauget var ikkje klart i tide
peek-error-screen-picture-late = Biletet av skjermen var ikkje klart i tide
peek-error-no-window-id = Ikkje noko vindauge har ID-en { $id }. peek list viser dei som er opne.
peek-error-no-window-for-handle = Programmet som vart starta som { $handle }, har ikkje noko vindauge ope
peek-error-ended-before-window = Programmet vart avslutta før det opna eit vindauge
peek-error-no-window-in-time = Ikkje noko vindauge opna seg innan { $duration }
peek-error-launch-not-started-by-peek = Berre program som peek run har starta sjølv, kan opnast
peek-error-ended-while-starting = Programmet vart avslutta medan det starta
peek-error-launch-failed = systemd kunne ikkje starte { $program }
peek-error-unknown-handle = Ingenting du har starta med peek run, har handtaket { $handle }, eller det er avslutta
peek-error-unknown-key = { $key } er ikkje ein tast peek kjenner
peek-error-unknown-modifier = { $modifier } er ikkje ein modifikatortast. Bruk ctrl, shift, alt eller super.
peek-error-display-owner = Denne skjermen høyrer til eit anna program
peek-error-display-run = Program på ein gøymd skjerm blir starta av peek run
peek-error-display-handle = Denne skjermen vart starta som { $handle }, ikkje { $requested }

## Quick settings tiles

auto-rotate-title = Autorotering
dark-style-title = Mørk modus
do-not-disturb-title = Ikkje forstyrr
night-light-title = Nattlys
airplane-mode-title = Flymodus

## Power mode

power-profile-title = Straummodus
power-profile-header = Straummodus
power-profile-open-menu = Opne menyen for straummodus
power-profile-settings = Strauminnstillingar
power-profile-performance = Yting
power-profile-balanced = Balansert
power-profile-power-saver = Straumsparing
power-profile-custom = Tilpassa

## Keep awake

caffeine-title = Hald vaken
caffeine-open-menu = Opne menyen for Hald vaken
caffeine-until = Til { $time }
caffeine-until-turned-off = Til du slår det av
caffeine-30-minutes = 30 minutt
caffeine-1-hour = 1 time
caffeine-2-hours = 2 timar
caffeine-inhibit-reason = Halden vaken frå hurtiginnstillingane

## Brightness

brightness-title = Lysstyrke
brightness-open-menu = Opne menyen for lysstyrke

## Keyboard backlight

backlight-title = Tastaturlys
backlight-open-menu = Opne menyen for tastaturlys
backlight-slider = Lysstyrke på tastaturet
backlight-off = Av
backlight-low = Låg
backlight-high = Høg

## Sound

volume-sound-settings = Lydinnstillingar
volume-mute = Slå av lyden
volume-unmute = Slå på lyden
volume-output-slider = Lydstyrke
volume-output-title = Lydutgang
volume-output-open-menu = Opne menyen for lydutgang
volume-input-slider = Mikrofon
volume-input-title = Lydinngang
volume-input-open-menu = Opne menyen for lydinngang

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Opne Bluetooth-menyen
bluetooth-settings = Bluetooth-innstillingar
bluetooth-connect = Kople til
bluetooth-disconnect = Kople frå
bluetooth-connect-device = Kople til { $deviceName }
bluetooth-disconnect-device = Kople frå { $deviceName }
bluetooth-no-devices = Ingen tilgjengelege eller tilkopla einingar
bluetooth-turn-on-hint = Slå på Bluetooth for å kople til einingar
bluetooth-connected-count = { $count ->
    [one] { $count } tilkopla
   *[other] { $count } tilkopla
}

## Network menus in quick settings

network-menu-unknown-network = <ukjend>
network-menu-connect = Kople til
network-menu-disconnect = Kople frå
network-menu-connect-to = Kople til { $name }
network-menu-disconnect-from = Kople frå { $name }
network-menu-turn-off = Slå av
network-menu-wifi-network = { $secure ->
    [yes] { $name }, sikra, signalstyrke { $strength } %
   *[no] { $name }, ikkje sikra, signalstyrke { $strength } %
}
network-menu-hotspot = Tilgangspunkt på { $name }
network-menu-connected-count = { $count ->
    [one] { $count } tilkopla
   *[other] { $count } tilkopla
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Opne VPN-menyen
network-menu-vpn-settings = VPN-innstillingar
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Opne Wi-Fi-menyen
network-menu-wifi-settings = Alle nettverk
network-menu-wired = Kabeltilkoplingar
network-menu-wired-open-menu = Opne menyen for kabeltilkoplingar
network-menu-wired-settings = Innstillingar for kabelnett
network-menu-tethers = Deling over Bluetooth
network-menu-tethers-open-menu = Opne menyen for deling over Bluetooth
network-menu-tether = Deling
network-menu-tether-settings = Bluetooth-innstillingar
network-menu-mobile-connections = Mobiltilkoplingar
network-menu-mobile-open-menu = Opne menyen for mobiltilkoplingar
network-menu-mobile-settings = Innstillingar for mobilt breiband
network-menu-mobile = Mobilnett
network-device-wired = Kabla
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Logg inn på nettverket
network-menu-failed-title = Tilkoplinga mislukkast
network-menu-failed-body = Kunne ikkje aktivere nettverkstilkoplinga

## Location access dialog

location-dialog-title = Tillat tilgang til posisjonen
location-dialog-description = Appen { $appName } vil ha tilgang til posisjonen din
location-dialog-info = Du kan endre tilgangen til posisjonen når som helst i personverninnstillingane
location-dialog-deny = Nekt tilgang
location-dialog-grant = Gje tilgang

## Thunderbolt notifications

thunderbolt-unknown-title = Ukjend Thunderbolt-eining
thunderbolt-unknown-body = Ei ny eining vart kopla til medan du var borte. Kople eininga frå og til igjen for å ta ho i bruk.
thunderbolt-unauthorized-title = Thunderbolt-eining utan godkjenning
thunderbolt-unauthorized-body = Ei ny eining vart kopla til og må godkjennast av ein administrator
thunderbolt-error-title = Feil ved godkjenning av Thunderbolt-eining
thunderbolt-error-body = Kunne ikkje godkjenne Thunderbolt-eininga: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Nekt
access-dialog-allow = Tillat

## Display change confirmation

display-change-title = Behalde skjerminnstillingane?
display-change-countdown = { $seconds ->
    [one] Endringane blir tilbakestilte om { $seconds } sekund
   *[other] Endringane blir tilbakestilte om { $seconds } sekund
}
display-change-revert = Tilbakestill
display-change-keep = Behald endringane

## Drive connected notification

autorun-connected = «{ $driveName }» er kopla til
autorun-ready = Disken kan no brukast
autorun-open-with = Opne med { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Trege tastar er slått på
kbd-a11y-slow-keys-off = Trege tastar er slått av
kbd-a11y-slow-keys-description = Du heldt nettopp Skift-tasten nede i 8 sekund. Det er snarvegen for Trege tastar, som endrar korleis tastaturet verkar.
kbd-a11y-sticky-keys-on = Klebrige tastar er slått på
kbd-a11y-sticky-keys-off = Klebrige tastar er slått av
kbd-a11y-sticky-keys-on-description = Du trykte nettopp på Skift-tasten 5 gonger på rad. Det er snarvegen for Klebrige tastar, som endrar korleis tastaturet verkar.
kbd-a11y-sticky-keys-off-description = Du trykte nettopp på to tastar samtidig, eller på Skift-tasten 5 gonger på rad. Det slår av Klebrige tastar, som endrar korleis tastaturet verkar.
kbd-a11y-leave-on = La vere på
kbd-a11y-turn-on = Slå på
kbd-a11y-turn-off = Slå av
kbd-a11y-leave-off = La vere av

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Vel lydeining
audio-device-cancel = Avbryt
audio-device-sound-settings = Lydinnstillingar
audio-device-headphones = Hovudtelefonar
audio-device-headset = Headset
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Tillat å blokkere snarvegar
inhibit-shortcuts-app = Appen { $appName } vil blokkere snarvegar
inhibit-shortcuts-unknown-app = Ein app vil blokkere snarvegar
inhibit-shortcuts-titled-app = Ein app med vindauget «{ $title }» vil blokkere snarvegar
inhibit-shortcuts-restore = Du kan få snarvegane tilbake ved å trykkje { $shortcut }
inhibit-shortcuts-deny = Nekt
inhibit-shortcuts-allow = Tillat

## Unlocking encrypted drives

mount-hidden-volume = Gøymt volum
mount-windows-system-volume = Windows-systemvolum
mount-uses-keyfiles = Brukar nøkkelfiler
mount-keyfiles-use-app = Bruk <i>{ $appName }</i> for å låse opp eit volum som brukar nøkkelfiler
mount-keyfiles-need-app = Du treng eit eige verktøy som <i>Diskar</i> for å låse opp eit volum som brukar nøkkelfiler
mount-pim-number = PIM-nummer
mount-pim-invalid = PIM må vere eit tal eller stå tomt
mount-password = Passord
mount-remember-password = Hugs passordet
mount-cancel = Avbryt
mount-unlock = Lås opp
mount-open-app = Opne { $appName }
mount-wrong-password = Det fungerte ikkje. Prøv igjen.
mount-unlock-failed = Kunne ikkje låse opp volumet
mount-pim-unsupported = Den installerte versjonen av udisks støttar ikkje PIM-innstillinga

## Network passwords, asked when connecting needs one

network-agent-auth-required = Godkjenning krevst
network-agent-wifi-rejected = Det lagra passordet for «{ $networkName }» fungerte ikkje. Skriv det inn igjen.
network-agent-wifi-secrets = Du treng passord eller krypteringsnøklar for å kople til det trådlause nettverket «{ $networkName }»
network-agent-wps-hint = Du kan òg kople til ved å trykkje på WPS-knappen på ruteren
network-agent-wired-title = 802.1X-godkjenning for kabelnett
network-agent-dsl-title = DSL-godkjenning
network-agent-pin-title = PIN-kode krevst
network-agent-pin-body = Eininga for mobilt breiband treng ein PIN-kode
network-agent-vpn-title = VPN-passord
network-agent-password-required = Du treng eit passord for å kople til «{ $networkName }»
network-agent-connect = Kople til
network-agent-cancel = Avbryt
network-agent-password = Passord
network-agent-username = Brukarnamn
network-agent-key = Nøkkel
network-agent-private-key-password = Passord for privat nøkkel
network-agent-identity = Identitet
network-agent-service = Teneste
network-agent-network-name = Nettverksnamn
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Skjermfangst
screenshot-area = Vel område
screenshot-screen = Vel skjerm
screenshot-window = Vel vindauge
screenshot-take = Ta skjermbilete
screenshot-record = Ta opp skjermen
screenshot-show-pointer = Vis peikaren
screenshot-capture = Ta bilete
screenshot-close = Lukk
screenshot-screencasts-folder = Skjermopptak
screenshot-screencast-file = Skjermopptak frå { $date } { $time }
screenshot-screenshots-folder = Skjermbilete
screenshot-file = Skjermbilete frå { $timestamp }
screenshot-screencast-recorded = Skjermopptaket er lagra
screenshot-screencast-start-failed = Skjermopptaket kunne ikkje starte
screenshot-screencast-out-of-space = Skjermopptaket stoppa: Disken er full
screenshot-screencast-try-again = Skjermopptaket mislukkast. Prøv igjen.
screenshot-screencast-failed = Skjermopptaket mislukkast
screenshot-screencast-view = Klikk her for å sjå videoen
screenshot-show-in-rover = Vis i Rover
screenshot-captured = Skjermbilete teke
screenshot-captured-body = Du kan lime inn biletet frå utklippstavla

## System updates
updates-available-title = Systemoppdateringar er tilgjengelege
updates-available-body = Opne Innstillingar for å laste dei ned og installere dei.
updates-ready-title = Oppdateringane er klare til å installerast
updates-ready-body = Start på nytt når det passar deg, så blir dei installerte.
