## Shared

system-cancel = Loobu

## Dictation notifications

dictation-setup-title = Kirjuta häälega
dictation-setup-body = Räägi ja öeldu kirjutatakse sinu eest mis tahes rakenduses. Kõnetuvastus töötab selles arvutis, seega on kõigepealt vaja kõnemudelit.
dictation-setup-action = Seadista dikteerimine
dictation-unsupported-title = Dikteerimine keeles { $language } pole selles arvutis saadaval
dictation-unsupported-body = Selle arvuti protsessor ei suuda käitada kõnetuvastajat, mida keel { $language } vajab. Saad dikteerida mõnes teises keeles.
dictation-settings-action = Dikteerimise sätted

## System health notifications

health-gpu-reset-title = Graafikadraiver lakkas vastamast
health-gpu-reset-body =
    { $day ->
        [today] Arvuti taaskäivitus täna kell { $time } iseenesest. Sätetes on näha, mis võib seda edaspidi ära hoida.
       *[other] Arvuti taaskäivitus iseenesest: { $date } kell { $time }. Sätetes on näha, mis võib seda edaspidi ära hoida.
    }
health-gpu-reset-details = Üksikasjad
oom-app-closed-title = Rakendus { $app } suleti mälu vabastamiseks
oom-container-closed-title = Konteiner suleti mälu vabastamiseks
oom-closed-body = Arvutil hakkas mälu otsa saama, seega see suleti, et kõik muu töötaks endiselt sujuvalt.
oom-closed-body-with-size = Arvutil hakkas mälu otsa saama, seega see suleti, et kõik muu töötaks endiselt sujuvalt. Mälu oli kasutusel { $size }.
memory-low-title = Luftil hakkab mälu otsa saama
memory-low-app-body = Rakendus { $app } kasutab { $size }. Sulge see sunniviisiliselt, et kõik muu töötaks endiselt sujuvalt.
memory-low-container-body = Konteiner kasutab { $size }. Sulge see sunniviisiliselt, et kõik muu töötaks endiselt sujuvalt.
memory-low-force-quit = Sule sunniviisiliselt

## Input source indicator

input-source-indicator = Sisendallikas: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Lennukirežiim on riistvaralüliti abil sisse lülitatud
media-keys-airplane-mode-on = Lennukirežiim sees
media-keys-airplane-mode-off = Lennukirežiim väljas
media-keys-bluetooth-on = Bluetooth sees
media-keys-bluetooth-off = Bluetooth väljas
media-keys-caps-lock-on = Caps Lock sees
media-keys-caps-lock-off = Caps Lock väljas
media-keys-num-lock-on = Num Lock sees
media-keys-num-lock-off = Num Lock väljas

## VPN sign-in

vpn-sign-in-title = Logi sisse: { $connection }
vpn-connect = Ühenda
vpn-signing-in = Sisselogimine…
vpn-finish-in-browser = Lõpeta sisselogimine brauseris.
vpn-certificate-untrusted = { $host } esitas sertifikaadi, mida ei saa kontrollida ({ $reason }). Selle sõrmejälg on { $fingerprint }.
vpn-certificate-warning = Keegi võib end selle serverina esitleda. Loo ühendus ainult siis, kui ootasid seda.
vpn-certificate-connect = Ühenda siiski
vpn-field-password = Salasõna
vpn-field-certificate-password = Sertifikaadi salasõna
vpn-field-proxy-password = Puhverserveri salasõna
vpn-field-pre-shared-key = Eeljagatud võti
vpn-field-group-password = Rühma salasõna

## Battery notifications

battery-left = { $percent } jäänud.
battery-left-with-time = { $percent } jäänud, umbes { $duration }.
battery-low-title = Aku tase on madal
battery-very-low-title = Aku tase on väga madal
battery-almost-empty-title = Aku on peaaegu tühi
battery-ups-low-title = UPS-i aku tase on madal
battery-ups-very-low-title = UPS-i aku tase on väga madal
battery-ups-almost-empty-title = UPS-i aku on peaaegu tühi
battery-very-low-body = { $left } Ühenda arvuti peagi vooluvõrku.
battery-almost-empty-body = { $left } Ühenda arvuti kohe vooluvõrku, et salvestamata töö ei kaoks.
battery-device-low-title = { $device }: aku tase on madal
battery-device-very-low-title = { $device }: aku tase on väga madal
battery-device-low-body = { $left } Laadi seadet peagi.
battery-device-very-low-body = { $left } Laadi seadet kohe, et see välja ei lülituks.
battery-device-mouse = Hiir
battery-device-keyboard = Klaviatuur
battery-device-phone = Telefon
battery-device-tablet = Tahvelarvuti
battery-device-controller = Mängukontroller
battery-device-pen = Pliiats
battery-device-touchpad = Puuteplaat
battery-device-headset = Peakomplekt
battery-device-speaker = Kõlar
battery-device-headphones = Kõrvaklapid
battery-device-remote = Kaugjuhtimispult
battery-device-other = Ühendatud seade

## Privacy indicator

privacy-indicator = Kasutusel: { $things }
privacy-thing-camera = kaamera
privacy-thing-microphone = mikrofon
privacy-thing-screen = ekraan
privacy-thing-location = asukoht
privacy-thing-windows = aknad
privacy-camera-unknown-app = Üks rakendus kasutab kaamerat
privacy-stop-sharing = Lõpeta ekraani jagamine
privacy-stop-recording = Lõpeta salvestamine
privacy-turn-off-location = Lülita asukohateenused välja
privacy-settings = Privaatsussätted
privacy-camera = Kaamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofon on vaigistatud
privacy-mute-microphone = Vaigista mikrofon
privacy-unmute-microphone = Tühista mikrofoni vaigistus
privacy-close-app = Sulge { $app }
privacy-unknown-app = Rakendus
privacy-windows-seeing-programs =
    { $count ->
        [one] { $count } programm saab sinu aknaid näha
       *[other] { $count } programmi saavad sinu aknaid näha
    }
privacy-windows-using-programs =
    { $count ->
        [one] { $count } programm saab sinu aknaid näha ja kasutada
       *[other] { $count } programmi saavad sinu aknaid näha ja kasutada
    }
privacy-windows-stop = Lõpeta juurdepääs

## Window access prompt

peek-see-request = Kas lubada sinu käivitatud programmil sinu aknaid näha?
peek-see-description = See saab teha pilte kõigist sinu avatud akendest.
peek-use-request = Kas lubad sinu käivitatud programmil sinu aknaid näha ja kasutada?
peek-use-description = See näeb kõiki sinu avatud aknaid ning saab neis klõpsata ja tippida nagu sina ise.
peek-deny = Ära luba
peek-allow-once = Luba üks kord
peek-allow-until-quit = Luba kuni sulgemiseni

## Window access errors

peek-error-declined-until-quit = Selle arvuti kasutaja keeldus. Programm saab pärast sulgemist uuesti küsida.
peek-error-not-allowed = Selle arvuti kasutaja ei lubanud seda
peek-error-sandboxed = Liivakastis töötavad rakendused ei saa teisi aknaid näha ega kasutada
peek-error-unknown-caller = Küsiv programm lõpetas töö või seda ei õnnestunud tuvastada
peek-error-no-caller = Seansisiin ei teatanud, milline programm küsib
peek-error-screen-busy = Ekraan on lukus või on sellel avatud süsteemiviip. Proovi uuesti, kui seda enam pole.
peek-error-input-held = Keegi hoiab klahve või hiirenuppe all. Proovi hetke pärast uuesti.
peek-error-input-dropped = Sisend peatati, sest selle saabumisel oli kursori all midagi muud või oli klaviatuurifookus mujal
peek-error-not-in-front = Akent ei õnnestunud esiplaanile tuua
peek-error-covered = Miski muu katab selle osa aknast
peek-error-outside = { $x }, { $y } jääb akna pildist välja, pildi suurus on { $width } × { $height }
peek-error-nothing-to-capture = Aken ei kuva midagi, mida jäädvustada
peek-error-window-picture-late = Akna pilt ei saanud õigeks ajaks valmis
peek-error-screen-picture-late = Ekraani pilt ei saanud õigeks ajaks valmis
peek-error-no-window-id = Ühelgi aknal pole tunnust { $id }. Avatud aknaid näitab käsk „peek list“.
peek-error-no-window-for-handle = Tunnusega { $handle } käivitatud programmil pole avatud akent
peek-error-ended-before-window = Programm lõpetas töö enne, kui avas akna
peek-error-no-window-in-time = Ühtegi akent ei avanenud { $duration } jooksul
peek-error-launch-not-started-by-peek = Käivitada saab ainult programmi, mille peek run ise käivitas
peek-error-ended-while-starting = Programm lõpetas töö käivitumise ajal
peek-error-launch-failed = systemd ei suutnud käivitada programmi { $program }
peek-error-unknown-handle = Ükski käsuga peek run käivitatud programm ei kasuta tunnust { $handle } või on see töö lõpetanud
peek-error-unknown-key = peek ei tunne klahvi { $key }
peek-error-unknown-modifier = { $modifier } pole muuteklahv. Kasuta ctrl, shift, alt või super.
peek-error-display-owner = See kuvar kuulub teisele programmile
peek-error-display-run = Peidetud kuvaris käivitab programme käsk peek run
peek-error-display-handle = See kuvar käivitati tunnusega { $handle }, mitte { $requested }

## Quick settings tiles

auto-rotate-title = Automaatne pööramine
dark-style-title = Tume režiim
do-not-disturb-title = Ära sega
night-light-title = Öövalgus
airplane-mode-title = Lennukirežiim

## Power mode

power-profile-title = Toiterežiim
power-profile-header = Toiterežiim
power-profile-open-menu = Ava toiterežiimide menüü
power-profile-settings = Toitesätted
power-profile-performance = Jõudlus
power-profile-balanced = Tasakaalustatud
power-profile-power-saver = Energiasääst
power-profile-custom = Kohandatud

## Keep awake

caffeine-title = Hoia ärkvel
caffeine-open-menu = Ava ärkvel hoidmise menüü
caffeine-until = Kuni { $time }
caffeine-until-turned-off = Kuni väljalülitamiseni
caffeine-30-minutes = 30 minutit
caffeine-1-hour = 1 tund
caffeine-2-hours = 2 tundi
caffeine-inhibit-reason = Ärkvel hoitud kiirsätete kaudu

## Brightness

brightness-title = Heledus
brightness-open-menu = Ava heleduse menüü

## Keyboard backlight

backlight-title = Klaviatuuri taustvalgustus
backlight-open-menu = Ava klaviatuuri heleduse menüü
backlight-slider = Klaviatuuri heledus
backlight-off = Väljas
backlight-low = Madal
backlight-high = Kõrge

## Sound

volume-sound-settings = Helisätted
volume-mute = Vaigista
volume-unmute = Tühista vaigistus
volume-output-slider = Helitugevus
volume-output-title = Heliväljund
volume-output-open-menu = Ava heliväljundi menüü
volume-input-slider = Mikrofon
volume-input-title = Helisisend
volume-input-open-menu = Ava helisisendi menüü

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Ava Bluetoothi menüü
bluetooth-settings = Bluetoothi sätted
bluetooth-connect = Ühenda
bluetooth-disconnect = Katkesta ühendus
bluetooth-connect-device = Ühenda seadmega { $deviceName }
bluetooth-disconnect-device = Katkesta ühendus seadmega { $deviceName }
bluetooth-no-devices = Saadaolevaid ega ühendatud seadmeid pole
bluetooth-turn-on-hint = Seadmetega ühenduse loomiseks lülita Bluetooth sisse
bluetooth-connected-count =
    { $count ->
        [one] { $count } ühendatud
       *[other] { $count } ühendatud
    }

## Network menus in quick settings

network-menu-unknown-network = <tundmatu>
network-menu-connect = Ühenda
network-menu-disconnect = Katkesta ühendus
network-menu-connect-to = Ühenda: { $name }
network-menu-disconnect-from = Katkesta ühendus: { $name }
network-menu-turn-off = Lülita välja
network-menu-wifi-network =
    { $secure ->
        [yes] { $name }, turvaline, signaali tugevus { $strength }%
       *[no] { $name }, turvamata, signaali tugevus { $strength }%
    }
network-menu-hotspot = Kuumkoht { $name }
network-menu-connected-count =
    { $count ->
        [one] { $count } ühendatud
       *[other] { $count } ühendatud
    }
network-menu-vpn = VPN
network-menu-vpn-open-menu = Ava VPN-i menüü
network-menu-vpn-settings = VPN-i sätted
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Ava Wi-Fi menüü
network-menu-wifi-settings = Kõik võrgud
network-menu-wired = Juhtmega ühendused
network-menu-wired-open-menu = Ava juhtmega ühenduste menüü
network-menu-wired-settings = Juhtmega võrgu sätted
network-menu-tethers = Bluetoothi ühiskasutus
network-menu-tethers-open-menu = Ava Bluetoothi ühiskasutuse menüü
network-menu-tether = Ühiskasutus
network-menu-tether-settings = Bluetoothi sätted
network-menu-mobile-connections = Mobiilsideühendused
network-menu-mobile-open-menu = Ava mobiilsideühenduste menüü
network-menu-mobile-settings = Mobiilse lairibaühenduse sätted
network-menu-mobile = Mobiilside
network-device-wired = Juhtmega
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Logi võrku sisse
network-menu-failed-title = Ühendamine ebaõnnestus
network-menu-failed-body = Võrguühendust ei õnnestunud aktiveerida

## Location access dialog

location-dialog-title = Juurdepääs asukohale
location-dialog-description = Rakendus { $appName } soovib juurdepääsu sinu asukohale
location-dialog-info = Asukohale juurdepääsu saab igal ajal muuta privaatsussätetes
location-dialog-deny = Keela juurdepääs
location-dialog-grant = Luba juurdepääs

## Thunderbolt notifications

thunderbolt-unknown-title = Tundmatu Thunderbolti seade
thunderbolt-unknown-body = Sinu äraolekul ühendati uus seade. Selle kasutamiseks eemalda see ja ühenda uuesti.
thunderbolt-unauthorized-title = Volitamata Thunderbolti seade
thunderbolt-unauthorized-body = Ühendati uus seade, mis vajab administraatori heakskiitu
thunderbolt-error-title = Thunderbolti volitamise viga
thunderbolt-error-body = Thunderbolti seadet ei õnnestunud volitada: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Keela
access-dialog-allow = Luba

## Display change confirmation

display-change-title = Kas jätta need kuvasätted?
display-change-countdown =
    { $seconds ->
        [one] Sätted taastatakse { $seconds } sekundi pärast
       *[other] Sätted taastatakse { $seconds } sekundi pärast
    }
display-change-revert = Taasta sätted
display-change-keep = Jäta muudatused

## Drive connected notification

autorun-connected = „{ $driveName }“ on ühendatud
autorun-ready = Ketast saab nüüd kasutada
autorun-open-with = Ava rakendusega { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Aeglased klahvid on sisse lülitatud
kbd-a11y-slow-keys-off = Aeglased klahvid on välja lülitatud
kbd-a11y-slow-keys-description = Hoidsid Shift-klahvi 8 sekundit all. See on aeglaste klahvide kiirklahv. Aeglased klahvid muudavad klaviatuuri tööviisi.
kbd-a11y-sticky-keys-on = Kleepklahvid on sisse lülitatud
kbd-a11y-sticky-keys-off = Kleepklahvid on välja lülitatud
kbd-a11y-sticky-keys-on-description = Vajutasid Shift-klahvi 5 korda järjest. See on kleepklahvide kiirklahv. Kleepklahvid muudavad klaviatuuri tööviisi.
kbd-a11y-sticky-keys-off-description = Vajutasid kaht klahvi korraga või Shift-klahvi 5 korda järjest. See lülitab kleepklahvid välja. Kleepklahvid muudavad klaviatuuri tööviisi.
kbd-a11y-leave-on = Jäta sisse
kbd-a11y-turn-on = Lülita sisse
kbd-a11y-turn-off = Lülita välja
kbd-a11y-leave-off = Jäta välja

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Vali heliseade
audio-device-cancel = Loobu
audio-device-sound-settings = Helisätted
audio-device-headphones = Kõrvaklapid
audio-device-headset = Peakomplekt
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Kiirklahvide blokeerimine
inhibit-shortcuts-app = Rakendus { $appName } soovib süsteemi kiirklahvid blokeerida
inhibit-shortcuts-unknown-app = Üks rakendus soovib süsteemi kiirklahvid blokeerida
inhibit-shortcuts-restore = Kiirklahvid saad taastada, kui vajutad { $shortcut }
inhibit-shortcuts-deny = Keela
inhibit-shortcuts-allow = Luba

## Unlocking encrypted drives

mount-hidden-volume = Peidetud köide
mount-windows-system-volume = Windowsi süsteemiköide
mount-uses-keyfiles = Kasutab võtmefaile
mount-keyfiles-use-app = Võtmefaile kasutava köite avamiseks kasuta rakendust <i>{ $appName }</i>
mount-keyfiles-need-app = Võtmefaile kasutava köite avamiseks on vaja eraldi tööriista, näiteks rakendust <i>Kettad</i>
mount-pim-number = PIM-number
mount-pim-invalid = PIM peab olema number või tühi
mount-password = Salasõna
mount-remember-password = Jäta salasõna meelde
mount-cancel = Loobu
mount-unlock = Ava
mount-open-app = Ava { $appName }
mount-wrong-password = Vabandust, see ei õnnestunud. Proovi uuesti.
mount-unlock-failed = Köidet ei õnnestunud avada
mount-pim-unsupported = Installitud udisksi versioon ei toeta PIM-sätet

## Network passwords, asked when connecting needs one

network-agent-auth-required = Vajalik on autentimine
network-agent-wifi-rejected = Võrgu „{ $networkName }“ salvestatud salasõna ei sobinud. Sisesta see uuesti.
network-agent-wifi-secrets = Traadita võrguga „{ $networkName }“ ühendamiseks on vaja salasõnu või krüptovõtmeid
network-agent-wps-hint = Ühenduse saad luua ka ruuteri nupuga „WPS“
network-agent-wired-title = Juhtmega võrgu 802.1X-autentimine
network-agent-dsl-title = DSL-autentimine
network-agent-pin-title = Vajalik on PIN-kood
network-agent-pin-body = Mobiilse lairibaseadme jaoks on vaja PIN-koodi
network-agent-vpn-title = VPN-i salasõna
network-agent-password-required = Ühenduse „{ $networkName }“ loomiseks on vaja salasõna
network-agent-connect = Ühenda
network-agent-cancel = Loobu
network-agent-password = Salasõna
network-agent-username = Kasutajanimi
network-agent-key = Võti
network-agent-private-key-password = Privaatvõtme salasõna
network-agent-identity = Identiteet
network-agent-service = Teenus
network-agent-network-name = Võrgu nimi
network-agent-pin = PIN-kood

## Screenshots and screen recording

screenshot-source = Ekraanijäädvustus
screenshot-area = Ala valimine
screenshot-screen = Ekraani valimine
screenshot-window = Akna valimine
screenshot-take = Tee kuvatõmmis
screenshot-record = Salvesta ekraanivideo
screenshot-show-pointer = Kuva kursor
screenshot-capture = Jäädvusta
screenshot-close = Sulge
screenshot-screencasts-folder = Ekraanisalvestused
screenshot-screencast-file = Ekraanisalvestus { $date } { $time }
screenshot-screenshots-folder = Kuvatõmmised
screenshot-file = Kuvatõmmis { $timestamp }
screenshot-screencast-recorded = Ekraanisalvestus on valmis
screenshot-screencast-start-failed = Ekraanisalvestust ei õnnestunud alustada
screenshot-screencast-out-of-space = Ekraanisalvestus ebaõnnestus: kettaruum on otsas
screenshot-screencast-try-again = Ekraanisalvestus ebaõnnestus. Proovi uuesti
screenshot-screencast-failed = Ekraanisalvestus ebaõnnestus
screenshot-screencast-view = Klõpsa video vaatamiseks
screenshot-show-in-rover = Kuva rakenduses Rover
screenshot-captured = Kuvatõmmis on tehtud
screenshot-captured-body = Pildi saad kleepida lõikelaualt

## System updates
updates-available-title = Saadaval on süsteemivärskendused
updates-available-body = Nende allalaadimiseks ja installimiseks ava Sätted.
updates-ready-title = Värskendused on installimiseks valmis
updates-ready-body = Nende installimiseks taaskäivita arvuti, kui sulle sobib.
