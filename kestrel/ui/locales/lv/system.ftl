## Shared

system-cancel = Atcelt

## Dictation notifications

dictation-setup-title = Rakstiet, runājot
dictation-setup-body = Runājiet, un sacītais tiks ierakstīts jebkurā lietotnē. Runa tiek apstrādāta šajā datorā, tāpēc vispirms ir vajadzīgs runas modelis.
dictation-setup-action = Iestatīt diktēšanu
dictation-unsupported-title = Diktēšana valodā { $language } šajā datorā nav pieejama
dictation-unsupported-body = Šī datora procesors nevar darbināt runas atpazinēju, kas vajadzīgs valodai { $language }. Varat diktēt citā valodā.
dictation-settings-action = Diktēšanas iestatījumi

## System health notifications

health-gpu-reset-title = Grafikas draiveris pārstāja reaģēt
health-gpu-reset-body = { $day ->
    [today] Dators šodien plkst. { $time } restartējās pats. Iestatījumos redzams, kā to turpmāk novērst.
   *[other] Dators restartējās pats: { $date }, { $time }. Iestatījumos redzams, kā to turpmāk novērst.
}
health-gpu-reset-details = Detaļas

oom-app-closed-title = Lietotne { $app } tika aizvērta, lai atbrīvotu atmiņu
oom-container-closed-title = Konteiners tika aizvērts, lai atbrīvotu atmiņu
oom-closed-body = Datoram sāka pietrūkt atmiņas, tāpēc to aizvēra, lai viss pārējais turpinātu ātri reaģēt.
oom-closed-body-with-size = Datoram sāka pietrūkt atmiņas, tāpēc to aizvēra, lai viss pārējais turpinātu ātri reaģēt. Izmantotā atmiņa: { $size }.
memory-low-title = Sistēmai Luft pietrūkst atmiņas
memory-low-app-body = Lietotne { $app } izmanto { $size }. Piespiedu kārtā aizveriet to, lai viss pārējais turpinātu ātri reaģēt.
memory-low-container-body = Konteiners izmanto { $size }. Piespiedu kārtā aizveriet to, lai viss pārējais turpinātu ātri reaģēt.
memory-low-force-quit = Piespiedu kārtā aizvērt

## Input source indicator

input-source-indicator = Ievades avots: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Lidojuma režīms ieslēgts aparatūrā
media-keys-airplane-mode-on = Lidojuma režīms ieslēgts
media-keys-airplane-mode-off = Lidojuma režīms izslēgts
media-keys-bluetooth-on = Bluetooth ieslēgts
media-keys-bluetooth-off = Bluetooth izslēgts
media-keys-caps-lock-on = Caps Lock ieslēgts
media-keys-caps-lock-off = Caps Lock izslēgts
media-keys-num-lock-on = Num Lock ieslēgts
media-keys-num-lock-off = Num Lock izslēgts

## VPN sign-in

vpn-sign-in-title = Pierakstīties: { $connection }
vpn-connect = Izveidot savienojumu
vpn-signing-in = Notiek pierakstīšanās…
vpn-finish-in-browser = Pabeidziet pierakstīšanos pārlūkprogrammā.
vpn-certificate-untrusted = Serveris { $host } uzrādīja sertifikātu, ko nevar pārbaudīt ({ $reason }). Tā nospiedums: { $fingerprint }.
vpn-certificate-warning = Kāds var uzdoties par šo serveri. Izveidojiet savienojumu tikai tad, ja to gaidījāt.
vpn-certificate-connect = Tomēr izveidot savienojumu

vpn-field-password = Parole
vpn-field-certificate-password = Sertifikāta parole
vpn-field-proxy-password = Starpniekservera parole
vpn-field-pre-shared-key = Iepriekš koplietota atslēga
vpn-field-group-password = Grupas parole

## Battery notifications

battery-left = Atlikuši { $percent }.
battery-left-with-time = Atlikuši { $percent }, aptuveni { $duration }.
battery-low-title = Zems akumulatora līmenis
battery-very-low-title = Ļoti zems akumulatora līmenis
battery-almost-empty-title = Akumulators gandrīz tukšs
battery-ups-low-title = Zems UPS akumulatora līmenis
battery-ups-very-low-title = Ļoti zems UPS akumulatora līmenis
battery-ups-almost-empty-title = UPS akumulators gandrīz tukšs
battery-very-low-body = { $left } Drīz pievienojiet lādētāju.
battery-almost-empty-body = { $left } Pievienojiet lādētāju tūlīt, lai nezaudētu nesaglabāto darbu.

battery-device-low-title = { $device }: zems akumulatora līmenis
battery-device-very-low-title = { $device }: ļoti zems akumulatora līmenis
battery-device-low-body = { $left } Drīz uzlādējiet.
battery-device-very-low-body = { $left } Uzlādējiet tūlīt, lai ierīce neizslēgtos.

battery-device-mouse = Pele
battery-device-keyboard = Tastatūra
battery-device-phone = Tālrunis
battery-device-tablet = Planšetdators
battery-device-controller = Spēļu kontrolieris
battery-device-pen = Pildspalva
battery-device-touchpad = Skārienpaliktnis
battery-device-headset = Austiņas ar mikrofonu
battery-device-speaker = Skaļrunis
battery-device-headphones = Austiņas
battery-device-remote = Tālvadības pults
battery-device-other = Pievienotā ierīce

## Privacy indicator

privacy-indicator = Tiek izmantots: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofons
privacy-thing-screen = ekrāns
privacy-thing-location = atrašanās vieta
privacy-thing-windows = logi

privacy-camera-unknown-app = Kāda lietotne izmanto kameru
privacy-stop-sharing = Pārtraukt ekrāna kopīgošanu
privacy-stop-recording = Pārtraukt ierakstīšanu
privacy-turn-off-location = Izslēgt atrašanās vietas pakalpojumus
privacy-settings = Privātuma iestatījumi
privacy-camera = Kamera
privacy-microphone = Mikrofons
privacy-microphone-muted = Mikrofons izslēgts
privacy-mute-microphone = Izslēgt mikrofonu
privacy-unmute-microphone = Ieslēgt mikrofonu
privacy-close-app = Aizvērt lietotni { $app }
privacy-unknown-app = Kāda lietotne
privacy-windows-using = Izmanto jūsu logus
privacy-windows-seeing = Redz jūsu logus
privacy-windows-stop = Pārtraukt piekļuvi

## Window access prompt

peek-see-title = { $app } vēlas redzēt jūsu logus
peek-see-description = Tā varēs uzņemt attēlus no jebkura atvērtā loga.
peek-use-title = { $app } vēlas redzēt un izmantot jūsu logus
peek-use-description = Tā varēs redzēt jebkuru atvērto logu un tajā klikšķināt un rakstīt jūsu vietā.
peek-deny = Neatļaut
peek-allow-once = Atļaut vienreiz
peek-allow-until-quit = Atļaut līdz aizvēršanai

## Window access errors

peek-error-declined = Šī datora lietotājs to noraidīja. { $app } var jautāt vēlreiz pēc tam, kad būs aizvērta.
peek-error-not-allowed = Šī datora lietotājs to neatļāva
peek-error-sandboxed = Lietotnes smilškastē nevar redzēt un izmantot citus logus
peek-error-unknown-caller = Programma, kas jautā, beidza darbu vai netika atpazīta
peek-error-no-caller = Sesijas kopne nenorādīja, kura programma jautā
peek-error-screen-busy = Ekrāns ir bloķēts vai tajā ir atvērts sistēmas uzaicinājums. Mēģiniet vēlreiz, kad tā vairs nebūs.
peek-error-input-held = Kāds tur nospiestus taustiņus vai peles pogas. Pēc brīža mēģiniet vēlreiz.
peek-error-input-dropped = Ievade tika apturēta, jo tās brīdī zem rādītāja bija kas cits vai tastatūra bija citam logam
peek-error-not-in-front = Logu neizdevās pārvietot priekšplānā
peek-error-covered = Šo loga daļu aizsedz kas cits
peek-error-outside = { $x }, { $y } ir ārpus loga attēla, kura izmērs ir { $width } × { $height }
peek-error-nothing-to-capture = Logs nerāda neko, ko varētu uzņemt
peek-error-window-picture-late = Loga attēls netika sagatavots laikā
peek-error-screen-picture-late = Ekrāna attēls netika sagatavots laikā
peek-error-no-window-id = Nav loga ar ID { $id }. Atvērtos logus parāda peek list.
peek-error-no-window-for-handle = Programmai, kas palaista kā { $handle }, nav atvērta loga
peek-error-ended-before-window = Programma beidza darbu, pirms atvēra logu
peek-error-no-window-in-time = Neviens logs netika atvērts { $duration } laikā
peek-error-launch-not-started-by-peek = Palaist var tikai programmu, ko pati palaida peek run
peek-error-ended-while-starting = Programma beidza darbu palaišanas laikā
peek-error-launch-failed = systemd neizdevās palaist { $program }
peek-error-unknown-handle = Nekam, kas palaists ar peek run, nav identifikatora { $handle }, vai tas jau ir beidzis darbu
peek-error-unknown-key = { $key } nav peek zināms taustiņš
peek-error-unknown-modifier = { $modifier } nav modifikatortaustiņš. Izmantojiet ctrl, shift, alt vai super.
peek-error-display-owner = Šis displejs pieder citai programmai
peek-error-display-run = Programmas slēptā displejā palaiž peek run
peek-error-display-handle = Šis displejs tika palaists kā { $handle }, nevis { $requested }
