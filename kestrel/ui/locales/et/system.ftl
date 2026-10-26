## Shared

system-cancel = Loobu

## Dictation notifications

dictation-setup-title = Kirjutage häälega
dictation-setup-body = Räägi ja öeldu kirjutatakse sinu eest mis tahes rakenduses. Kõnetuvastus töötab selles arvutis, seega on kõigepealt vaja kõnemudelit.
dictation-setup-action = Seadista dikteerimine
dictation-unsupported-title = Dikteerimine keeles { $language } pole selles arvutis saadaval
dictation-unsupported-body = Selle arvuti protsessor ei suuda käitada kõnetuvastajat, mida keel { $language } vajab. Saate dikteerida mõnes teises keeles.
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
memory-low-app-body = Rakendus { $app } kasutab { $size }. Sulgege see sunniviisiliselt, et kõik muu töötaks endiselt sujuvalt.
memory-low-container-body = Konteiner kasutab { $size }. Sulgege see sunniviisiliselt, et kõik muu töötaks endiselt sujuvalt.
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
vpn-finish-in-browser = Lõpetage sisselogimine brauseris.
vpn-certificate-untrusted = { $host } esitas sertifikaadi, mida ei saa kontrollida ({ $reason }). Selle sõrmejälg on { $fingerprint }.
vpn-certificate-warning = Keegi võib end selle serverina esitleda. Looge ühendus ainult siis, kui ootasite seda.
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
battery-very-low-body = { $left } Ühendage arvuti peagi vooluvõrku.
battery-almost-empty-body = { $left } Ühendage arvuti kohe vooluvõrku, et salvestamata töö ei kaoks.
battery-device-low-title = { $device }: aku tase on madal
battery-device-very-low-title = { $device }: aku tase on väga madal
battery-device-low-body = { $left } Laadige seadet peagi.
battery-device-very-low-body = { $left } Laadige seadet kohe, et see välja ei lülituks.
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
peek-use-description = See näeb kõiki teie avatud aknaid ning saab neis klõpsata ja tippida, nagu oleksite see teie.
peek-deny = Ära luba
peek-allow-once = Luba üks kord
peek-allow-until-quit = Luba kuni sulgemiseni

## Window access errors

peek-error-declined-until-quit = Selle arvuti kasutaja keeldus. Programm saab pärast sulgemist uuesti küsida.
peek-error-not-allowed = Selle arvuti kasutaja ei lubanud seda
peek-error-sandboxed = Liivakastis töötavad rakendused ei saa teisi aknaid näha ega kasutada
peek-error-unknown-caller = Küsiv programm lõpetas töö või seda ei õnnestunud tuvastada
peek-error-no-caller = Seansisiin ei teatanud, milline programm küsib
peek-error-screen-busy = Ekraan on lukus või on sellel avatud süsteemiviip. Proovige uuesti, kui seda enam pole.
peek-error-input-held = Keegi hoiab klahve või hiirenuppe all. Proovige hetke pärast uuesti.
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
peek-error-unknown-modifier = { $modifier } pole muuteklahv. Kasutage ctrl, shift, alt või super.
peek-error-display-owner = See kuvar kuulub teisele programmile
peek-error-display-run = Peidetud kuvaris käivitab programme käsk peek run
peek-error-display-handle = See kuvar käivitati tunnusega { $handle }, mitte { $requested }
