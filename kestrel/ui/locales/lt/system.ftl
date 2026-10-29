## Shared

system-cancel = Atšaukti

## Dictation notifications

dictation-setup-title = Rašykite kalbėdami
dictation-setup-body = Kalbėkite, ir jūsų žodžiai bus įrašyti bet kurioje programoje. Kalba atpažįstama šiame kompiuteryje, todėl pirmiausia reikia kalbos modelio.
dictation-setup-action = Nustatyti diktavimą
dictation-unsupported-title = Diktavimas kalba { $language } šiame kompiuteryje negalimas
dictation-unsupported-body = Šio kompiuterio procesorius negali paleisti kalbos atpažinimo, kurio reikia kalbai { $language }. Galite diktuoti kita kalba.
dictation-settings-action = Diktavimo nustatymai

## System health notifications

health-gpu-reset-title = Grafikos tvarkyklė nustojo atsakyti
health-gpu-reset-body = { $day ->
    [today] Šiandien { $time } kompiuteris pats pasileido iš naujo. Nustatymuose rasite, kaip to išvengti ateityje.
   *[other] { $date } { $time } kompiuteris pats pasileido iš naujo. Nustatymuose rasite, kaip to išvengti ateityje.
}
health-gpu-reset-details = Išsamiau

oom-app-closed-title = Programa { $app } uždaryta, kad atsilaisvintų atminties
oom-container-closed-title = Konteineris uždarytas, kad atsilaisvintų atminties
oom-closed-body = Uždaryta, nes kompiuteriui ėmė trūkti atminties. Taip visa kita toliau veikia sklandžiai.
oom-closed-body-with-size = Uždaryta, nes kompiuteriui ėmė trūkti atminties. Taip visa kita toliau veikia sklandžiai. Buvo naudojama { $size }.
memory-low-title = Luft sistemai trūksta atminties
memory-low-app-body = Programa { $app } naudoja { $size }. Priverstinai ją uždarykite, kad visa kita toliau veiktų sklandžiai.
memory-low-container-body = Konteineris naudoja { $size }. Priverstinai jį uždarykite, kad visa kita toliau veiktų sklandžiai.
memory-low-force-quit = Priverstinai uždaryti

## Input source indicator

input-source-indicator = Įvesties šaltinis: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Lėktuvo režimas įjungtas aparatiniu jungikliu
media-keys-airplane-mode-on = Lėktuvo režimas įjungtas
media-keys-airplane-mode-off = Lėktuvo režimas išjungtas
media-keys-bluetooth-on = Bluetooth įjungtas
media-keys-bluetooth-off = Bluetooth išjungtas
media-keys-caps-lock-on = Caps Lock įjungtas
media-keys-caps-lock-off = Caps Lock išjungtas
media-keys-num-lock-on = Num Lock įjungtas
media-keys-num-lock-off = Num Lock išjungtas

## VPN sign-in

vpn-sign-in-title = Prisijungti prie VPN { $connection }
vpn-connect = Prisijungti
vpn-signing-in = Jungiamasi…
vpn-finish-in-browser = Baikite prisijungti naršyklėje.
vpn-certificate-untrusted = Serveris { $host } pateikė sertifikatą, kurio nepavyksta patikrinti ({ $reason }). Jo kontrolinis kodas: { $fingerprint }.
vpn-certificate-warning = Kažkas gali apsimesti šiuo serveriu. Junkitės tik tada, jei to tikėjotės.
vpn-certificate-connect = Vis tiek prisijungti

vpn-field-password = Slaptažodis
vpn-field-certificate-password = Sertifikato slaptažodis
vpn-field-proxy-password = Tarpinio serverio slaptažodis
vpn-field-pre-shared-key = Iš anksto bendrinamas raktas
vpn-field-group-password = Grupės slaptažodis

## Battery notifications

battery-left = Liko { $percent }.

battery-device-low-title = { $device }: akumuliatorius senka
battery-device-very-low-title = { $device }: akumuliatorius beveik išsikrovęs
battery-device-low-body = { $left } Netrukus įkraukite.
battery-device-very-low-body = { $left } Įkraukite dabar, kad įrenginys neišsijungtų.

battery-device-mouse = Pelė
battery-device-keyboard = Klaviatūra
battery-device-phone = Telefonas
battery-device-tablet = Planšetinis kompiuteris
battery-device-controller = Žaidimų valdiklis
battery-device-pen = Rašiklis
battery-device-touchpad = Jutiklinis kilimėlis
battery-device-headset = Ausinės su mikrofonu
battery-device-speaker = Garsiakalbis
battery-device-headphones = Ausinės
battery-device-remote = Nuotolinio valdymo pultas
battery-device-other = Prijungtas įrenginys

## Privacy indicator

privacy-indicator = Naudojama: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofonas
privacy-thing-screen = ekranas
privacy-thing-location = buvimo vieta
privacy-thing-windows = langai

privacy-camera-unknown-app = Programa naudoja kamerą
privacy-stop-sharing = Nebebendrinti ekrano
privacy-stop-recording = Stabdyti įrašymą
privacy-turn-off-location = Išjungti vietos nustatymo paslaugas
privacy-settings = Privatumo nustatymai
privacy-camera = Kamera
privacy-microphone = Mikrofonas
privacy-microphone-muted = Mikrofonas nutildytas
privacy-mute-microphone = Nutildyti mikrofoną
privacy-unmute-microphone = Įjungti mikrofoną
privacy-close-app = Uždaryti programą { $app }
privacy-unknown-app = Programa
privacy-reported-app = „{ $name }“ (pavadinimas nepatikrintas)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } programa gali matyti jūsų langus
    [few] { $count } programos gali matyti jūsų langus
    [many] { $count } programos gali matyti jūsų langus
   *[other] { $count } programų gali matyti jūsų langus
}
privacy-windows-using-programs = { $count ->
    [one] { $count } programa gali matyti ir naudoti jūsų langus
    [few] { $count } programos gali matyti ir naudoti jūsų langus
    [many] { $count } programos gali matyti ir naudoti jūsų langus
   *[other] { $count } programų gali matyti ir naudoti jūsų langus
}
privacy-windows-stop = Atimti prieigą

## Window access prompt

peek-see-request = Leisti jūsų paleistai programai matyti jūsų langus?
peek-see-description = Galės daryti bet kurio atidaryto lango nuotraukas.
peek-use-request = Leisti jūsų paleistai programai matyti ir naudoti jūsų langus?
peek-use-description = Galės matyti bet kurį atidarytą langą, spustelėti jame ir rašyti, tarsi tai būtumėte jūs.
peek-deny = Neleisti
peek-allow-once = Leisti vieną kartą
peek-allow-until-quit = Leisti, kol neužsidarys

## Window access errors

peek-error-declined-until-quit = Šio kompiuterio naudotojas tai atmetė. Programa galės paprašyti dar kartą, kai baigs darbą.
peek-error-not-allowed = Šio kompiuterio naudotojas to neleido
peek-error-sandboxed = Programos smėlio dėžėje negali matyti ar naudoti kitų langų
peek-error-unknown-caller = Prašanti programa baigė darbą arba nepavyko jos atpažinti
peek-error-no-caller = Seanso magistralė nenurodė, kuri programa prašo
peek-error-screen-busy = Ekranas užrakintas arba jame atvertas sistemos dialogas. Bandykite dar kartą, kai jo nebeliks.
peek-error-input-held = Kažkas laiko nuspaudęs klavišus ar pelės mygtukus. Po akimirkos bandykite dar kartą.
peek-error-input-dropped = Įvestis sustabdyta, nes jai atkeliavus po žymikliu buvo kas kita arba klaviatūrą valdė kas kita
peek-error-not-in-front = Nepavyko iškelti lango į priekį
peek-error-covered = Tą lango dalį dengia kažkas kita
peek-error-outside = { $x }, { $y } yra už lango vaizdo ribų, o jo dydis { $width } × { $height }
peek-error-nothing-to-capture = Lange nerodoma nieko, ką būtų galima užfiksuoti
peek-error-window-picture-late = Lango vaizdas nebuvo paruoštas laiku
peek-error-screen-picture-late = Ekrano vaizdas nebuvo paruoštas laiku
peek-error-no-window-id = Lango su ID { $id } nėra. Atidarytus langus parodo peek list.
peek-error-no-window-for-handle = Programa, paleista kaip { $handle }, neturi atidaryto lango
peek-error-ended-before-window = Programa baigė darbą neatidariusi lango
peek-error-no-window-in-time = Per { $duration } neatsidarė joks langas
peek-error-launch-not-started-by-peek = Paleisti galima tik tą programą, kurią paleido pati peek run
peek-error-ended-while-starting = Programa baigė darbą dar nepasileidusi
peek-error-launch-failed = systemd nepavyko paleisti programos { $program }
peek-error-unknown-handle = Su peek run paleistos programos su žyma { $handle } nėra arba ji jau baigė darbą
peek-error-unknown-key = peek nežino klavišo { $key }
peek-error-unknown-modifier = { $modifier } nėra modifikavimo klavišas. Naudokite ctrl, shift, alt arba super.
peek-error-display-owner = Šis ekranas priklauso kitai programai
peek-error-display-run = Programas paslėptame ekrane paleidžia peek run
peek-error-display-handle = Šis ekranas paleistas kaip { $handle }, o ne { $requested }

## Quick settings tiles

auto-rotate-title = Automatinis pasukimas
dark-style-title = Tamsusis režimas
do-not-disturb-title = Netrukdyti
night-light-title = Naktinė šviesa
airplane-mode-title = Lėktuvo režimas

## Power mode

power-profile-title = Maitinimo režimas
power-profile-header = Maitinimo režimas
power-profile-open-menu = Atidaryti maitinimo režimų meniu
power-profile-settings = Maitinimo nustatymai
power-profile-performance = Našumas
power-profile-balanced = Subalansuotas
power-profile-power-saver = Energijos taupymas
power-profile-custom = Pasirinktinis

## Keep awake

caffeine-title = Neužmigti
caffeine-open-menu = Atidaryti meniu Neužmigti
caffeine-until = Iki { $time }
caffeine-until-turned-off = Kol išjungsite
caffeine-30-minutes = 30 minučių
caffeine-1-hour = 1 valandą
caffeine-2-hours = 2 valandas
caffeine-inhibit-reason = Neužmigti įjungta sparčiuosiuose nustatymuose

## Brightness

brightness-title = Šviesumas
brightness-open-menu = Atidaryti šviesumo meniu

## Keyboard backlight

backlight-title = Klaviatūros apšvietimas
backlight-open-menu = Atidaryti klaviatūros šviesumo meniu
backlight-slider = Klaviatūros šviesumas
backlight-off = Išjungta
backlight-low = Silpnas
backlight-high = Stiprus

## Sound

volume-sound-settings = Garso nustatymai
volume-mute = Nutildyti
volume-unmute = Įjungti garsą
volume-output-slider = Garsumas
volume-output-title = Garso išvestis
volume-output-open-menu = Atidaryti garso išvesties meniu
volume-input-slider = Mikrofonas
volume-input-title = Garso įvestis
volume-input-open-menu = Atidaryti garso įvesties meniu

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Atidaryti Bluetooth meniu
bluetooth-settings = Bluetooth nustatymai
bluetooth-connect = Prijungti
bluetooth-disconnect = Atjungti
bluetooth-connect-device = Prijungti įrenginį { $deviceName }
bluetooth-disconnect-device = Atjungti įrenginį { $deviceName }
bluetooth-no-devices = Nėra pasiekiamų ar prijungtų įrenginių
bluetooth-turn-on-hint = Įjunkite Bluetooth, kad galėtumėte prijungti įrenginius
bluetooth-connected-count = { $count ->
    [one] { $count } prijungtas
    [few] { $count } prijungti
    [many] { $count } prijungto
   *[other] { $count } prijungtų
}

## Network menus in quick settings

network-menu-unknown-network = <nežinomas>
network-menu-connect = Prisijungti
network-menu-disconnect = Atsijungti
network-menu-connect-to = Prisijungti prie tinklo { $name }
network-menu-disconnect-from = Atsijungti nuo tinklo { $name }
network-menu-turn-off = Išjungti
network-menu-wifi-network = { $secure ->
    [yes] { $name }, saugus, signalo stiprumas { $strength } %
   *[no] { $name }, nesaugus, signalo stiprumas { $strength } %
}
network-menu-hotspot = Prieigos taškas { $name }
network-menu-connected-count = { $count ->
    [one] { $count } prijungtas
    [few] { $count } prijungti
    [many] { $count } prijungto
   *[other] { $count } prijungtų
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Atidaryti VPN meniu
network-menu-vpn-settings = VPN nustatymai
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Atidaryti Wi-Fi meniu
network-menu-wifi-settings = Visi tinklai
network-menu-wired = Laidiniai ryšiai
network-menu-wired-open-menu = Atidaryti laidinių ryšių meniu
network-menu-wired-settings = Laidinio ryšio nustatymai
network-menu-tethers = Bluetooth modemai
network-menu-tethers-open-menu = Atidaryti Bluetooth modemų meniu
network-menu-tether = Modemas
network-menu-tether-settings = Bluetooth nustatymai
network-menu-mobile-connections = Mobilieji ryšiai
network-menu-mobile-open-menu = Atidaryti mobiliųjų ryšių meniu
network-menu-mobile-settings = Mobiliojo interneto nustatymai
network-menu-mobile = Mobilusis
network-device-wired = Laidinis
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prisijungti prie tinklo
network-menu-failed-title = Nepavyko prisijungti
network-menu-failed-body = Nepavyko suaktyvinti tinklo ryšio

## Location access dialog

location-dialog-title = Leisti pasiekti buvimo vietą
location-dialog-description = Programa { $appName } nori pasiekti jūsų buvimo vietą
location-dialog-info = Buvimo vietos prieigą bet kada galite pakeisti Nustatymų skiltyje Privatumas
location-dialog-deny = Neleisti
location-dialog-grant = Leisti

## Thunderbolt notifications

thunderbolt-unknown-title = Nežinomas Thunderbolt įrenginys
thunderbolt-unknown-body = Kol jūsų nebuvo, prijungtas naujas įrenginys. Atjunkite jį ir vėl prijunkite, kad galėtumėte naudoti.
thunderbolt-unauthorized-title = Nepatvirtintas Thunderbolt įrenginys
thunderbolt-unauthorized-body = Prijungtas naujas įrenginys, kurį turi patvirtinti administratorius
thunderbolt-error-title = Thunderbolt patvirtinimo klaida
thunderbolt-error-body = Nepavyko patvirtinti Thunderbolt įrenginio: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Neleisti
access-dialog-allow = Leisti

## Display change confirmation

display-change-title = Palikti šiuos nustatymus?
display-change-countdown = { $seconds ->
    [one] Nustatymai bus atkurti po { $seconds } sekundės
    [few] Nustatymai bus atkurti po { $seconds } sekundžių
    [many] Nustatymai bus atkurti po { $seconds } sekundės
   *[other] Nustatymai bus atkurti po { $seconds } sekundžių
}
display-change-revert = Atkurti
display-change-keep = Palikti

## Drive connected notification

autorun-connected = Prijungtas „{ $driveName }“
autorun-ready = Diską jau galima naudoti
autorun-open-with = Atidaryti programoje { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Lėtieji klavišai įjungti
kbd-a11y-slow-keys-off = Lėtieji klavišai išjungti
kbd-a11y-slow-keys-description = Ką tik 8 sekundes laikėte nuspaudę klavišą Shift. Taip įjungiami lėtieji klavišai, kurie keičia klaviatūros veikimą.
kbd-a11y-sticky-keys-on = Lipnieji klavišai įjungti
kbd-a11y-sticky-keys-off = Lipnieji klavišai išjungti
kbd-a11y-sticky-keys-on-description = Ką tik 5 kartus iš eilės paspaudėte klavišą Shift. Taip įjungiami lipnieji klavišai, kurie keičia klaviatūros veikimą.
kbd-a11y-sticky-keys-off-description = Ką tik paspaudėte du klavišus vienu metu arba 5 kartus iš eilės paspaudėte klavišą Shift. Taip išjungiami lipnieji klavišai, kurie keičia klaviatūros veikimą.
kbd-a11y-leave-on = Palikti įjungtus
kbd-a11y-turn-on = Įjungti
kbd-a11y-turn-off = Išjungti
kbd-a11y-leave-off = Palikti išjungtus

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Pasirinkite garso įrenginį
audio-device-cancel = Atšaukti
audio-device-sound-settings = Garso nustatymai
audio-device-headphones = Ausinės
audio-device-headset = Ausinės su mikrofonu
audio-device-microphone = Mikrofonas

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Leisti perimti sparčiuosius klavišus
inhibit-shortcuts-app = Programa { $appName } nori perimti sparčiuosius klavišus
inhibit-shortcuts-unknown-app = Programa nori perimti sparčiuosius klavišus
inhibit-shortcuts-titled-app = Programa su langu „{ $title }“ nori perimti sparčiuosius klavišus
inhibit-shortcuts-restore = Sparčiuosius klavišus galite grąžinti paspaudę { $shortcut }
inhibit-shortcuts-deny = Neleisti
inhibit-shortcuts-allow = Leisti

## Unlocking encrypted drives

mount-hidden-volume = Paslėptas tomas
mount-windows-system-volume = Windows sistemos tomas
mount-uses-keyfiles = Naudoja raktų failus
mount-keyfiles-use-app = Norėdami atrakinti tomą, kuriam naudojami raktų failai, naudokite programą <i>{ $appName }</i>
mount-keyfiles-need-app = Norint atrakinti tomą, kuriam naudojami raktų failai, reikia išorinės programos, pavyzdžiui, <i>Diskai</i>
mount-pim-number = PIM numeris
mount-pim-invalid = PIM turi būti skaičius arba tuščias
mount-password = Slaptažodis
mount-remember-password = Įsiminti slaptažodį
mount-cancel = Atšaukti
mount-unlock = Atrakinti
mount-open-app = Atidaryti programą { $appName }
mount-wrong-password = Nepavyko. Bandykite dar kartą.
mount-unlock-failed = Nepavyko atrakinti tomo
mount-pim-unsupported = Įdiegta udisks versija nepalaiko PIM nustatymo

## Network passwords, asked when connecting needs one

network-agent-auth-required = Reikia patvirtinti tapatybę
network-agent-wifi-rejected = Įrašytas tinklo „{ $networkName }“ slaptažodis netiko. Įveskite jį dar kartą.
network-agent-wifi-secrets = Norint prisijungti prie belaidžio tinklo „{ $networkName }“, reikia slaptažodžių arba šifravimo raktų
network-agent-wps-hint = Taip pat galite prisijungti paspaudę maršruto parinktuvo mygtuką „WPS“
network-agent-wired-title = Laidinio 802.1X ryšio tapatybės patvirtinimas
network-agent-dsl-title = DSL tapatybės patvirtinimas
network-agent-pin-title = Reikia PIN kodo
network-agent-pin-body = Mobiliojo interneto įrenginiui reikia PIN kodo
network-agent-vpn-title = VPN slaptažodis
network-agent-password-required = Norint prisijungti prie „{ $networkName }“, reikia slaptažodžio
network-agent-connect = Prisijungti
network-agent-cancel = Atšaukti
network-agent-password = Slaptažodis
network-agent-username = Naudotojo vardas
network-agent-key = Raktas
network-agent-private-key-password = Privačiojo rakto slaptažodis
network-agent-identity = Tapatybė
network-agent-service = Paslauga
network-agent-network-name = Tinklo pavadinimas
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Ekrano fiksavimas
screenshot-area = Srities pasirinkimas
screenshot-screen = Ekrano pasirinkimas
screenshot-window = Lango pasirinkimas
screenshot-take = Padaryti ekrano kopiją
screenshot-record = Įrašyti ekraną
screenshot-show-pointer = Rodyti žymiklį
screenshot-capture = Fiksuoti
screenshot-close = Uždaryti
screenshot-screencasts-folder = Ekrano įrašai
screenshot-screencast-file = Ekrano įrašas { $date } { $time }
screenshot-screenshots-folder = Ekrano kopijos
screenshot-file = Ekrano kopija { $timestamp }
screenshot-screencast-recorded = Ekrano įrašas paruoštas
screenshot-screencast-start-failed = Nepavyko pradėti įrašyti ekrano
screenshot-screencast-out-of-space = Nepavyko įrašyti ekrano: diske trūksta vietos
screenshot-screencast-try-again = Nepavyko įrašyti ekrano. Bandykite dar kartą.
screenshot-screencast-failed = Nepavyko įrašyti ekrano
screenshot-screencast-view = Spustelėkite, kad peržiūrėtumėte vaizdo įrašą
screenshot-show-in-rover = Rodyti programoje Rover
screenshot-captured = Ekrano kopija padaryta
screenshot-captured-body = Paveikslėlį galite įklijuoti iš iškarpinės

## System updates
updates-available-title = Yra sistemos naujinimų
updates-available-body = Atidarykite Nustatymus, kad juos atsisiųstumėte ir įdiegtumėte.
updates-ready-title = Naujinimai paruošti įdiegti
updates-ready-body = Kad juos įdiegtumėte, paleiskite iš naujo, kai jums patogu.
