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
battery-left-with-time = { $percent } tilbage, cirka { $duration }.
battery-low-title = Lavt batteriniveau
battery-very-low-title = Meget lavt batteriniveau
battery-almost-empty-title = Batteriet er næsten tomt
battery-ups-low-title = Lavt batteriniveau i UPS
battery-ups-very-low-title = Meget lavt batteriniveau i UPS
battery-ups-almost-empty-title = UPS-batteriet er næsten tomt
battery-very-low-body = { $left } Tilslut strøm snart.
battery-almost-empty-body = { $left } Tilslut strøm nu, så du ikke mister arbejde, der ikke er gemt.

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
privacy-windows-using = Bruger dine vinduer
privacy-windows-seeing = Ser dine vinduer
privacy-windows-stop = Fjern adgang

## Window access prompt

peek-see-title = { $app } vil se dine vinduer
peek-see-description = Den vil kunne tage billeder af alle de vinduer, du har åbne.
peek-use-title = { $app } vil se og bruge dine vinduer
peek-use-description = Den vil kunne se alle de vinduer, du har åbne, og klikke og skrive i dem, som om det var dig.
peek-deny = Tillad ikke
peek-allow-once = Tillad én gang
peek-allow-until-quit = Tillad, indtil den afsluttes

## Window access errors

peek-error-declined = Personen, der bruger denne computer, afviste det. { $app } kan spørge igen, når den er afsluttet.
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
