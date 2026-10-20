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
privacy-windows-using = Bruker vinduene dine
privacy-windows-seeing = Ser vinduene dine
privacy-windows-stop = Fjern tilgangen

## Window access prompt

peek-see-title = { $app } vil se vinduene dine
peek-see-description = Den vil kunne ta bilder av alle vinduer du har åpne.
peek-use-title = { $app } vil se og bruke vinduene dine
peek-use-description = Den vil kunne se alle vinduer du har åpne, og klikke og skrive i dem som om den var deg.
peek-deny = Ikke tillat
peek-allow-once = Tillat én gang
peek-allow-until-quit = Tillat til den avsluttes

## Window access errors

peek-error-declined = Personen som bruker denne datamaskinen, avslo dette. { $app } kan spørre igjen etter at den er avsluttet.
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
