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
privacy-windows-seeing-programs = { $count ->
    [zero] { $count } programmas var redzēt jūsu logus
    [one] { $count } programma var redzēt jūsu logus
   *[other] { $count } programmas var redzēt jūsu logus
}
privacy-windows-using-programs = { $count ->
    [zero] { $count } programmas var redzēt un izmantot jūsu logus
    [one] { $count } programma var redzēt un izmantot jūsu logus
   *[other] { $count } programmas var redzēt un izmantot jūsu logus
}
privacy-windows-stop = Pārtraukt piekļuvi

## Window access prompt

peek-see-request = Atļaut jūsu palaistai programmai redzēt jūsu logus?
peek-see-description = Tā varēs uzņemt attēlus no jebkura atvērtā loga.
peek-use-request = Atļaut jūsu palaistai programmai redzēt un izmantot jūsu logus?
peek-use-description = Tā varēs redzēt jebkuru atvērto logu un tajā klikšķināt un rakstīt jūsu vietā.
peek-deny = Neatļaut
peek-allow-once = Atļaut vienreiz
peek-allow-until-quit = Atļaut līdz aizvēršanai

## Window access errors

peek-error-declined-until-quit = Šī datora lietotājs to noraidīja. Programma var jautāt vēlreiz pēc tam, kad būs aizvērta.
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

## Quick settings tiles

auto-rotate-title = Automātiska pagriešana
dark-style-title = Tumšais režīms
do-not-disturb-title = Netraucēt
night-light-title = Nakts gaisma
airplane-mode-title = Lidojuma režīms

## Power mode

power-profile-title = Enerģijas režīms
power-profile-header = Enerģijas režīms
power-profile-open-menu = Atvērt enerģijas režīmu izvēlni
power-profile-settings = Barošanas iestatījumi
power-profile-performance = Veiktspēja
power-profile-balanced = Līdzsvarots
power-profile-power-saver = Enerģijas taupīšana
power-profile-custom = Pielāgots

## Keep awake

caffeine-title = Neaizmigt
caffeine-open-menu = Atvērt izvēlni Neaizmigt
caffeine-until = Līdz { $time }
caffeine-until-turned-off = Līdz izslēgšanai
caffeine-30-minutes = 30 minūtes
caffeine-1-hour = 1 stunda
caffeine-2-hours = 2 stundas
caffeine-inhibit-reason = Ieslēgts Neaizmigt ātrajos iestatījumos

## Brightness

brightness-title = Spilgtums
brightness-open-menu = Atvērt spilgtuma izvēlni

## Keyboard backlight

backlight-title = Tastatūras apgaismojums
backlight-open-menu = Atvērt tastatūras spilgtuma izvēlni
backlight-slider = Tastatūras spilgtums
backlight-off = Izslēgts
backlight-low = Vājš
backlight-high = Spēcīgs

## Sound

volume-sound-settings = Skaņas iestatījumi
volume-mute = Izslēgt skaņu
volume-unmute = Ieslēgt skaņu
volume-output-slider = Skaļums
volume-output-title = Skaņas izvade
volume-output-open-menu = Atvērt skaņas izvades izvēlni
volume-input-slider = Mikrofons
volume-input-title = Skaņas ievade
volume-input-open-menu = Atvērt skaņas ievades izvēlni

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Atvērt Bluetooth izvēlni
bluetooth-settings = Bluetooth iestatījumi
bluetooth-connect = Izveidot savienojumu
bluetooth-disconnect = Atvienot
bluetooth-connect-device = Izveidot savienojumu: { $deviceName }
bluetooth-disconnect-device = Atvienot: { $deviceName }
bluetooth-no-devices = Nav pieejamu vai pievienotu ierīču
bluetooth-turn-on-hint = Ieslēdziet Bluetooth, lai pievienotu ierīces
bluetooth-connected-count = { $count ->
    [zero] { $count } pievienotas
    [one] { $count } pievienota
   *[other] { $count } pievienotas
}

## Network menus in quick settings

network-menu-unknown-network = <nezināms>
network-menu-connect = Izveidot savienojumu
network-menu-disconnect = Atvienot
network-menu-connect-to = Izveidot savienojumu: { $name }
network-menu-disconnect-from = Atvienot: { $name }
network-menu-turn-off = Izslēgt
network-menu-wifi-network = { $secure ->
    [yes] { $name }, drošs, signāla stiprums { $strength } %
   *[no] { $name }, nav drošs, signāla stiprums { $strength } %
}
network-menu-hotspot = Tīklājs { $name }
network-menu-connected-count = { $count ->
    [zero] { $count } savienoti
    [one] { $count } savienots
   *[other] { $count } savienoti
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Atvērt VPN izvēlni
network-menu-vpn-settings = VPN iestatījumi
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Atvērt Wi-Fi izvēlni
network-menu-wifi-settings = Visi tīkli
network-menu-wired = Vadu savienojumi
network-menu-wired-open-menu = Atvērt vadu savienojumu izvēlni
network-menu-wired-settings = Vadu tīkla iestatījumi
network-menu-tethers = Bluetooth tīklāji
network-menu-tethers-open-menu = Atvērt Bluetooth tīklāju izvēlni
network-menu-tether = Tīklājs
network-menu-tether-settings = Bluetooth iestatījumi
network-menu-mobile-connections = Mobilie savienojumi
network-menu-mobile-open-menu = Atvērt mobilo savienojumu izvēlni
network-menu-mobile-settings = Mobilā platjoslas tīkla iestatījumi
network-menu-mobile = Mobilais
network-device-wired = Vadu
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Pierakstīties tīklā
network-menu-failed-title = Savienojums neizdevās
network-menu-failed-body = Neizdevās aktivizēt tīkla savienojumu

## Location access dialog

location-dialog-title = Atļaut piekļuvi atrašanās vietai
location-dialog-description = Lietotne { $appName } vēlas piekļūt jūsu atrašanās vietai
location-dialog-info = Piekļuvi atrašanās vietai jebkurā brīdī var mainīt privātuma iestatījumos
location-dialog-deny = Liegt piekļuvi
location-dialog-grant = Atļaut piekļuvi

## Thunderbolt notifications

thunderbolt-unknown-title = Nezināma Thunderbolt ierīce
thunderbolt-unknown-body = Jūsu prombūtnes laikā tika pievienota jauna ierīce. Lai to izmantotu, atvienojiet un pievienojiet to vēlreiz.
thunderbolt-unauthorized-title = Neautorizēta Thunderbolt ierīce
thunderbolt-unauthorized-body = Tika pievienota jauna ierīce, kurai vajadzīgs administratora apstiprinājums
thunderbolt-error-title = Thunderbolt autorizācijas kļūda
thunderbolt-error-body = Neizdevās autorizēt Thunderbolt ierīci: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Liegt
access-dialog-allow = Atļaut

## Display change confirmation

display-change-title = Vai paturēt šos iestatījumus?
display-change-countdown = { $seconds ->
    [zero] Izmaiņas tiks atsauktas pēc { $seconds } sekundēm
    [one] Izmaiņas tiks atsauktas pēc { $seconds } sekundes
   *[other] Izmaiņas tiks atsauktas pēc { $seconds } sekundēm
}
display-change-revert = Atsaukt
display-change-keep = Paturēt izmaiņas

## Drive connected notification

autorun-connected = „{ $driveName }“ pievienots
autorun-ready = Disku tagad var izmantot
autorun-open-with = Atvērt ar lietotni { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Lēnie taustiņi ieslēgti
kbd-a11y-slow-keys-off = Lēnie taustiņi izslēgti
kbd-a11y-slow-keys-description = Jūs tikko 8 sekundes turējāt nospiestu taustiņu Shift. Tas ir lēno taustiņu īsinājumtaustiņš, un lēnie taustiņi maina tastatūras darbību.
kbd-a11y-sticky-keys-on = Taustiņu fiksācija ieslēgta
kbd-a11y-sticky-keys-off = Taustiņu fiksācija izslēgta
kbd-a11y-sticky-keys-on-description = Jūs tikko 5 reizes pēc kārtas nospiedāt taustiņu Shift. Tas ir taustiņu fiksācijas īsinājumtaustiņš, un taustiņu fiksācija maina tastatūras darbību.
kbd-a11y-sticky-keys-off-description = Jūs tikko vienlaikus nospiedāt divus taustiņus vai 5 reizes pēc kārtas nospiedāt taustiņu Shift. Tādējādi tiek izslēgta taustiņu fiksācija, kas maina tastatūras darbību.
kbd-a11y-leave-on = Atstāt ieslēgtu
kbd-a11y-turn-on = Ieslēgt
kbd-a11y-turn-off = Izslēgt
kbd-a11y-leave-off = Atstāt izslēgtu

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Izvēlieties audio ierīci
audio-device-cancel = Atcelt
audio-device-sound-settings = Skaņas iestatījumi
audio-device-headphones = Austiņas
audio-device-headset = Austiņas ar mikrofonu
audio-device-microphone = Mikrofons

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Atļaut īsinājumtaustiņu pārtveršanu
inhibit-shortcuts-app = Lietotne { $appName } vēlas pārtvert īsinājumtaustiņus
inhibit-shortcuts-unknown-app = Kāda lietotne vēlas pārtvert īsinājumtaustiņus
inhibit-shortcuts-restore = Īsinājumtaustiņus var atjaunot, nospiežot { $shortcut }
inhibit-shortcuts-deny = Liegt
inhibit-shortcuts-allow = Atļaut

## Unlocking encrypted drives

mount-hidden-volume = Slēpts sējums
mount-windows-system-volume = Windows sistēmas sējums
mount-uses-keyfiles = Izmanto atslēgu failus
mount-keyfiles-use-app = Lai atbloķētu sējumu, kas izmanto atslēgu failus, izmantojiet utilītu <i>{ $appName }</i>
mount-keyfiles-need-app = Lai atbloķētu sējumu, kas izmanto atslēgu failus, vajadzīga ārēja utilīta, piemēram, <i>Diski</i>
mount-pim-number = PIM skaitlis
mount-pim-invalid = PIM jābūt skaitlim vai tukšam
mount-password = Parole
mount-remember-password = Atcerēties paroli
mount-cancel = Atcelt
mount-unlock = Atbloķēt
mount-open-app = Atvērt lietotni { $appName }
mount-wrong-password = Neizdevās. Mēģiniet vēlreiz.
mount-unlock-failed = Neizdevās atbloķēt sējumu
mount-pim-unsupported = Instalētā udisks versija neatbalsta PIM iestatījumu

## Network passwords, asked when connecting needs one

network-agent-auth-required = Nepieciešama autentifikācija
network-agent-wifi-rejected = Saglabātā tīkla „{ $networkName }“ parole neder. Ievadiet to vēlreiz.
network-agent-wifi-secrets = Lai piekļūtu bezvadu tīklam „{ $networkName }“, vajadzīgas paroles vai šifrēšanas atslēgas
network-agent-wps-hint = Varat arī izveidot savienojumu, nospiežot maršrutētāja pogu „WPS“
network-agent-wired-title = Vadu tīkla 802.1X autentifikācija
network-agent-dsl-title = DSL autentifikācija
network-agent-pin-title = Nepieciešams PIN kods
network-agent-pin-body = Mobilā platjoslas tīkla ierīcei vajadzīgs PIN kods
network-agent-vpn-title = VPN parole
network-agent-password-required = Lai izveidotu savienojumu ar „{ $networkName }“, vajadzīga parole
network-agent-connect = Izveidot savienojumu
network-agent-cancel = Atcelt
network-agent-password = Parole
network-agent-username = Lietotājvārds
network-agent-key = Atslēga
network-agent-private-key-password = Privātās atslēgas parole
network-agent-identity = Identitāte
network-agent-service = Pakalpojums
network-agent-network-name = Tīkla nosaukums
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Ekrāna uzņemšana
screenshot-area = Apgabala atlase
screenshot-screen = Ekrāna atlase
screenshot-window = Loga atlase
screenshot-take = Uzņemt ekrānuzņēmumu
screenshot-record = Ierakstīt ekrānu
screenshot-show-pointer = Rādīt rādītāju
screenshot-capture = Uzņemt
screenshot-close = Aizvērt
screenshot-screencasts-folder = Ekrāna ieraksti
screenshot-screencast-file = Ekrāna ieraksts { $date } { $time }
screenshot-screenshots-folder = Ekrānuzņēmumi
screenshot-file = Ekrānuzņēmums { $timestamp }
screenshot-screencast-recorded = Ekrāna ieraksts saglabāts
screenshot-screencast-start-failed = Neizdevās sākt ekrāna ierakstu
screenshot-screencast-out-of-space = Ekrāna ieraksts neizdevās: diskā nav vietas
screenshot-screencast-try-again = Ekrāna ieraksts neizdevās. Mēģiniet vēlreiz
screenshot-screencast-failed = Ekrāna ieraksts neizdevās
screenshot-screencast-view = Noklikšķiniet, lai skatītu video
screenshot-show-in-rover = Rādīt lietotnē Rover
screenshot-captured = Ekrānuzņēmums uzņemts
screenshot-captured-body = Attēlu var ielīmēt no starpliktuves

## System updates
updates-available-title = Ir pieejami sistēmas atjauninājumi
updates-available-body = Atveriet Iestatījumus, lai tos lejupielādētu un instalētu.
updates-ready-title = Atjauninājumi ir gatavi instalēšanai
updates-ready-body = Lai tos instalētu, restartējiet datoru, kad jums ērti.
