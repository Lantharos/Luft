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
