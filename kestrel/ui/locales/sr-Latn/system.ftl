## Shared

system-cancel = Otkaži

## Dictation notifications

dictation-setup-title = Kucajte govorom
dictation-setup-body = Govorite i ono što kažete biće otkucano, u bilo kojoj aplikaciji. Sve se obrađuje na ovom računaru, pa je prvo potreban govorni model.
dictation-setup-action = Podesi diktiranje
dictation-unsupported-title = Diktiranje na jeziku { $language } nije dostupno na ovom računaru
dictation-unsupported-body = Procesor ovog računara ne može da pokrene prepoznavanje govora koje je potrebno za jezik { $language }. Možete da diktirate na drugom jeziku.
dictation-settings-action = Podešavanja diktiranja

## System health notifications

health-gpu-reset-title = Grafički drajver je prestao da reaguje
health-gpu-reset-body = { $day ->
    [today] Računar se danas u { $time } sam ponovo pokrenuo. U Podešavanjima možete videti šta može da spreči da se to ponovi.
   *[other] Računar se { $date } u { $time } sam ponovo pokrenuo. U Podešavanjima možete videti šta može da spreči da se to ponovi.
}
health-gpu-reset-details = Detalji

oom-app-closed-title = Aplikacija { $app } je zatvorena da bi se oslobodila memorija
oom-container-closed-title = Kontejner je zatvoren da bi se oslobodila memorija
oom-closed-body = Računaru je ponestajalo memorije, pa je zatvaranje bilo potrebno da bi sve ostalo i dalje brzo reagovalo.
oom-closed-body-with-size = Računaru je ponestajalo memorije, pa je zatvaranje bilo potrebno da bi sve ostalo i dalje brzo reagovalo. Time je oslobođeno { $size }.
memory-low-title = Luft ostaje bez memorije
memory-low-app-body = Aplikacija { $app } koristi { $size }. Prinudno je zatvorite da bi sve ostalo i dalje brzo reagovalo.
memory-low-container-body = Kontejner koristi { $size }. Prinudno ga zatvorite da bi sve ostalo i dalje brzo reagovalo.
memory-low-force-quit = Prinudno zatvori

## Input source indicator

input-source-indicator = Izvor unosa: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Režim rada u avionu je uključen hardverskim prekidačem
media-keys-airplane-mode-on = Režim rada u avionu uključen
media-keys-airplane-mode-off = Režim rada u avionu isključen
media-keys-bluetooth-on = Bluetooth uključen
media-keys-bluetooth-off = Bluetooth isključen
media-keys-caps-lock-on = Caps Lock uključen
media-keys-caps-lock-off = Caps Lock isključen
media-keys-num-lock-on = Num Lock uključen
media-keys-num-lock-off = Num Lock isključen

## VPN sign-in

vpn-sign-in-title = Prijava na { $connection }
vpn-connect = Poveži
vpn-signing-in = Prijavljivanje…
vpn-finish-in-browser = Dovršite prijavu u pregledaču.
vpn-certificate-untrusted = Server { $host } je ponudio sertifikat koji ne može da se proveri ({ $reason }). Njegov otisak je { $fingerprint }.
vpn-certificate-warning = Neko bi mogao da se predstavlja kao ovaj server. Povežite se samo ako ste ovo očekivali.
vpn-certificate-connect = Ipak poveži

vpn-field-password = Lozinka
vpn-field-certificate-password = Lozinka sertifikata
vpn-field-proxy-password = Lozinka proksija
vpn-field-pre-shared-key = Unapred deljeni ključ
vpn-field-group-password = Lozinka grupe

## Battery notifications

battery-left = Preostalo je { $percent }.

battery-device-low-title = Slaba baterija: { $device }
battery-device-very-low-title = Veoma slaba baterija: { $device }
battery-device-low-body = { $left } Uskoro ga napunite.
battery-device-very-low-body = { $left } Napunite ga odmah da se ne bi isključio.

battery-device-mouse = Miš
battery-device-keyboard = Tastatura
battery-device-phone = Telefon
battery-device-tablet = Tablet
battery-device-controller = Kontroler
battery-device-pen = Olovka
battery-device-touchpad = Tačped
battery-device-headset = Slušalice sa mikrofonom
battery-device-speaker = Zvučnik
battery-device-headphones = Slušalice
battery-device-remote = Daljinski upravljač
battery-device-other = Povezani uređaj

## Privacy indicator

privacy-indicator = U upotrebi: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofon
privacy-thing-screen = ekran
privacy-thing-location = lokacija
privacy-thing-windows = prozori

privacy-camera-unknown-app = Neka aplikacija koristi kameru
privacy-stop-sharing = Zaustavi deljenje ekrana
privacy-stop-recording = Zaustavi snimanje
privacy-turn-off-location = Isključi usluge lokacije
privacy-settings = Podešavanja privatnosti
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofon je isključen
privacy-mute-microphone = Isključi mikrofon
privacy-unmute-microphone = Uključi mikrofon
privacy-close-app = Zatvori { $app }
privacy-unknown-app = Aplikacija
privacy-reported-app = „{ $name }“ (naziv nije proveren)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program može da vidi vaše prozore
    [few] { $count } programa mogu da vide vaše prozore
   *[other] { $count } programa može da vidi vaše prozore
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program može da vidi i koristi vaše prozore
    [few] { $count } programa mogu da vide i koriste vaše prozore
   *[other] { $count } programa može da vidi i koristi vaše prozore
}
privacy-windows-stop = Ukini pristup

## Window access prompt

peek-see-request = Dozvoliti programu koji ste pokrenuli da vidi vaše prozore?
peek-see-description = Moći će da snima slike svakog prozora koji imate otvoren.
peek-use-request = Dozvoliti programu koji ste pokrenuli da vidi i koristi vaše prozore?
peek-use-description = Moći će da vidi svaki prozor koji imate otvoren i da u njemu klikće i kuca kao da ste to vi.
peek-deny = Ne dozvoli
peek-allow-once = Dozvoli jednom
peek-allow-until-quit = Dozvoli dok se ne zatvori

## Window access errors

peek-error-declined-until-quit = Osoba koja koristi ovaj računar je ovo odbila. Program može ponovo da pita kada se zatvori.
peek-error-not-allowed = Osoba koja koristi ovaj računar to nije dozvolila
peek-error-sandboxed = Aplikacije u izolovanom okruženju ne mogu da vide niti da koriste druge prozore
peek-error-unknown-caller = Program koji pita se završio ili nije mogao da se prepozna
peek-error-no-caller = Magistrala sesije nije navela koji program pita
peek-error-screen-busy = Ekran je zaključan ili je na njemu otvoren sistemski upit. Pokušajte ponovo kada nestane.
peek-error-input-held = Neko drži pritisnute tastere ili dugmad miša. Pokušajte ponovo za trenutak.
peek-error-input-dropped = Unos je zaustavljen jer se, kada je stigao, nešto drugo nalazilo na toj tački ili je imalo fokus tastature
peek-error-not-in-front = Prozor nije mogao da se dovede u prvi plan
peek-error-covered = Nešto drugo prekriva taj deo prozora
peek-error-outside = { $x }, { $y } je izvan slike prozora, koja ima { $width } × { $height }
peek-error-nothing-to-capture = Prozor ne prikazuje ništa što bi moglo da se snimi
peek-error-window-picture-late = Slika prozora nije bila spremna na vreme
peek-error-screen-picture-late = Slika ekrana nije bila spremna na vreme
peek-error-no-window-id = Nijedan prozor nema ID { $id }. peek list prikazuje otvorene prozore.
peek-error-no-window-for-handle = Program pokrenut kao { $handle } nema otvoren prozor
peek-error-ended-before-window = Program se završio pre nego što je otvorio prozor
peek-error-no-window-in-time = Nijedan prozor se nije otvorio u roku od { $duration }
peek-error-launch-not-started-by-peek = Može da se pokrene samo program koji je peek run sam pokrenuo
peek-error-ended-while-starting = Program se završio dok se pokretao
peek-error-launch-failed = systemd nije mogao da pokrene { $program }
peek-error-unknown-handle = Ništa što ste pokrenuli pomoću peek run nema oznaku { $handle }, ili se već zatvorilo
peek-error-unknown-key = { $key } nije taster koji peek poznaje
peek-error-unknown-modifier = { $modifier } nije modifikator. Koristite ctrl, shift, alt ili super.
peek-error-display-owner = Ovaj ekran pripada drugom programu
peek-error-display-run = Programe na skrivenom ekranu pokreće peek run
peek-error-display-handle = Ovaj ekran je pokrenut kao { $handle }, a ne kao { $requested }

## Quick settings tiles

auto-rotate-title = Automatska rotacija
dark-style-title = Tamni režim
do-not-disturb-title = Ne uznemiravaj
night-light-title = Noćno svetlo
airplane-mode-title = Režim rada u avionu

## Power mode

power-profile-title = Režim napajanja
power-profile-header = Režim napajanja
power-profile-open-menu = Otvori meni režima napajanja
power-profile-settings = Podešavanja napajanja
power-profile-performance = Performanse
power-profile-balanced = Uravnoteženo
power-profile-power-saver = Ušteda energije
power-profile-custom = Prilagođeno

## Keep awake

caffeine-title = Drži budnim
caffeine-open-menu = Otvori meni za držanje budnim
caffeine-until = Do { $time }
caffeine-until-turned-off = Dok se ne isključi
caffeine-30-minutes = 30 minuta
caffeine-1-hour = 1 sat
caffeine-2-hours = 2 sata
caffeine-inhibit-reason = Drži budnim iz brzih podešavanja

## Brightness

brightness-title = Osvetljenost
brightness-open-menu = Otvori meni osvetljenosti

## Keyboard backlight

backlight-title = Osvetljenje tastature
backlight-open-menu = Otvori meni osvetljenja tastature
backlight-slider = Osvetljenje tastature
backlight-off = Isključeno
backlight-low = Slabo
backlight-high = Jako

## Sound

volume-sound-settings = Podešavanja zvuka
volume-mute = Isključi zvuk
volume-unmute = Uključi zvuk
volume-output-slider = Jačina zvuka
volume-output-title = Izlaz zvuka
volume-output-open-menu = Otvori meni izlaza zvuka
volume-input-slider = Mikrofon
volume-input-title = Ulaz zvuka
volume-input-open-menu = Otvori meni ulaza zvuka

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Otvori meni za Bluetooth
bluetooth-settings = Podešavanja za Bluetooth
bluetooth-connect = Poveži
bluetooth-disconnect = Prekini vezu
bluetooth-connect-device = Poveži se sa uređajem { $deviceName }
bluetooth-disconnect-device = Prekini vezu sa uređajem { $deviceName }
bluetooth-no-devices = Nema dostupnih ni povezanih uređaja
bluetooth-turn-on-hint = Uključite Bluetooth da biste povezali uređaje
bluetooth-connected-count = { $count ->
    [one] { $count } povezan
    [few] { $count } povezana
   *[other] { $count } povezano
}

## Network menus in quick settings

network-menu-unknown-network = <nepoznata>
network-menu-connect = Poveži
network-menu-disconnect = Prekini vezu
network-menu-connect-to = Poveži se sa { $name }
network-menu-disconnect-from = Prekini vezu sa { $name }
network-menu-turn-off = Isključi
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zaštićena, jačina signala { $strength }%
   *[no] { $name }, nije zaštićena, jačina signala { $strength }%
}
network-menu-hotspot = Pristupna tačka: { $name }
network-menu-connected-count = { $count ->
    [one] { $count } povezana
    [few] { $count } povezane
   *[other] { $count } povezanih
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otvori meni za VPN
network-menu-vpn-settings = Podešavanja za VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otvori meni za Wi-Fi
network-menu-wifi-settings = Sve mreže
network-menu-wired = Žične veze
network-menu-wired-open-menu = Otvori meni žičnih veza
network-menu-wired-settings = Podešavanja žične mreže
network-menu-tethers = Deljenje veze preko telefona
network-menu-tethers-open-menu = Otvori meni deljenja veze
network-menu-tether = Deljenje veze
network-menu-tether-settings = Podešavanja za Bluetooth
network-menu-mobile-connections = Mobilne veze
network-menu-mobile-open-menu = Otvori meni mobilnih veza
network-menu-mobile-settings = Podešavanja mobilnog interneta
network-menu-mobile = Mobilni internet
network-device-wired = Žična veza
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prijava na mrežu
network-menu-failed-title = Povezivanje nije uspelo
network-menu-failed-body = Mrežna veza nije mogla da se aktivira

## Location access dialog

location-dialog-title = Dozvoliti pristup lokaciji?
location-dialog-description = Aplikacija { $appName } želi da pristupi vašoj lokaciji
location-dialog-info = Pristup lokaciji možete bilo kada da promenite u podešavanjima privatnosti
location-dialog-deny = Zabrani pristup
location-dialog-grant = Dozvoli pristup

## Thunderbolt notifications

thunderbolt-unknown-title = Nepoznat Thunderbolt uređaj
thunderbolt-unknown-body = Dok ste bili odsutni, otkriven je novi uređaj. Isključite ga i ponovo priključite da biste počeli da ga koristite.
thunderbolt-unauthorized-title = Neodobren Thunderbolt uređaj
thunderbolt-unauthorized-body = Otkriven je novi uređaj koji administrator mora da odobri
thunderbolt-error-title = Greška pri odobravanju Thunderbolt uređaja
thunderbolt-error-body = Thunderbolt uređaj nije mogao da se odobri: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Zabrani
access-dialog-allow = Dozvoli

## Display change confirmation

display-change-title = Zadržati ova podešavanja ekrana?
display-change-countdown = { $seconds ->
    [one] Promene će biti vraćene za { $seconds } sekundu
    [few] Promene će biti vraćene za { $seconds } sekunde
   *[other] Promene će biti vraćene za { $seconds } sekundi
}
display-change-revert = Vrati
display-change-keep = Zadrži promene

## Drive connected notification

autorun-connected = Povezan je disk „{ $driveName }“
autorun-ready = Disk je spreman za korišćenje
autorun-open-with = Otvori u aplikaciji { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Spori tasteri su uključeni
kbd-a11y-slow-keys-off = Spori tasteri su isključeni
kbd-a11y-slow-keys-description = Upravo ste držali taster Shift 8 sekundi. To je prečica za Spore tastere, koji menjaju način na koji tastatura radi.
kbd-a11y-sticky-keys-on = Lepljivi tasteri su uključeni
kbd-a11y-sticky-keys-off = Lepljivi tasteri su isključeni
kbd-a11y-sticky-keys-on-description = Upravo ste pritisnuli taster Shift 5 puta zaredom. To je prečica za Lepljive tastere, koji menjaju način na koji tastatura radi.
kbd-a11y-sticky-keys-off-description = Upravo ste pritisnuli dva tastera odjednom ili taster Shift 5 puta zaredom. Time se isključuju Lepljivi tasteri, koji menjaju način na koji tastatura radi.
kbd-a11y-leave-on = Ostavi uključeno
kbd-a11y-turn-on = Uključi
kbd-a11y-turn-off = Isključi
kbd-a11y-leave-off = Ostavi isključeno

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Izaberite audio-uređaj
audio-device-cancel = Otkaži
audio-device-sound-settings = Podešavanja zvuka
audio-device-headphones = Slušalice
audio-device-headset = Slušalice sa mikrofonom
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Dozvoliti zaobilaženje prečica?
inhibit-shortcuts-app = Aplikacija { $appName } želi da zaobiđe sistemske prečice
inhibit-shortcuts-unknown-app = Jedna aplikacija želi da zaobiđe sistemske prečice
inhibit-shortcuts-titled-app = Aplikacija sa prozorom „{ $title }“ želi da zaobiđe sistemske prečice
inhibit-shortcuts-restore = Prečice možete da vratite pritiskom na { $shortcut }
inhibit-shortcuts-deny = Zabrani
inhibit-shortcuts-allow = Dozvoli

## Unlocking encrypted drives

mount-hidden-volume = Skriveni volumen
mount-windows-system-volume = Sistemski volumen za Windows
mount-uses-keyfiles = Koristi datoteke ključeva
mount-keyfiles-use-app = Da biste otključali volumen koji koristi datoteke ključeva, koristite aplikaciju <i>{ $appName }</i>
mount-keyfiles-need-app = Za otključavanje volumena koji koristi datoteke ključeva potrebna je posebna aplikacija, na primer <i>Diskovi</i>
mount-pim-number = PIM broj
mount-pim-invalid = PIM mora da bude broj ili da ostane prazan
mount-password = Lozinka
mount-remember-password = Zapamti lozinku
mount-cancel = Otkaži
mount-unlock = Otključaj
mount-open-app = Otvori aplikaciju { $appName }
mount-wrong-password = Nije uspelo. Pokušajte ponovo.
mount-unlock-failed = Volumen nije mogao da se otključa
mount-pim-unsupported = Instalirana verzija udisks ne podržava PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Potrebna je potvrda identiteta
network-agent-wifi-rejected = Sačuvana lozinka za „{ $networkName }“ nije uspela. Unesite je ponovo.
network-agent-wifi-secrets = Za pristup bežičnoj mreži „{ $networkName }“ potrebne su lozinke ili ključevi za šifrovanje
network-agent-wps-hint = Možete se povezati i pritiskom na dugme „WPS“ na ruteru
network-agent-wired-title = Potvrda identiteta za žičnu mrežu 802.1X
network-agent-dsl-title = Potvrda identiteta za DSL
network-agent-pin-title = Potreban je PIN
network-agent-pin-body = Uređaju za mobilni internet je potreban PIN
network-agent-vpn-title = Lozinka za VPN
network-agent-password-required = Za povezivanje sa „{ $networkName }“ potrebna je lozinka
network-agent-connect = Poveži
network-agent-cancel = Otkaži
network-agent-password = Lozinka
network-agent-username = Korisničko ime
network-agent-key = Ključ
network-agent-private-key-password = Lozinka privatnog ključa
network-agent-identity = Identitet
network-agent-service = Usluga
network-agent-network-name = Naziv mreže
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Snimanje ekrana
screenshot-area = Izbor oblasti
screenshot-screen = Izbor ekrana
screenshot-window = Izbor prozora
screenshot-take = Napravi snimak ekrana
screenshot-record = Snimi ekran
screenshot-show-pointer = Prikaži pokazivač
screenshot-capture = Snimi
screenshot-close = Zatvori
screenshot-screencasts-folder = Video-snimci ekrana
screenshot-screencast-file = Video-snimak ekrana { $date } { $time }
screenshot-screenshots-folder = Snimci ekrana
screenshot-file = Snimak ekrana { $timestamp }
screenshot-screencast-recorded = Ekran je snimljen
screenshot-screencast-start-failed = Snimanje ekrana nije moglo da počne
screenshot-screencast-out-of-space = Snimanje ekrana nije uspelo: nema mesta na disku
screenshot-screencast-try-again = Snimanje ekrana nije uspelo, pokušajte ponovo
screenshot-screencast-failed = Snimanje ekrana nije uspelo
screenshot-screencast-view = Kliknite ovde da biste pogledali video
screenshot-show-in-rover = Prikaži u aplikaciji Rover
screenshot-captured = Snimak ekrana je napravljen
screenshot-captured-body = Sliku možete da nalepite iz ostave

## System updates
updates-available-title = Dostupna su ažuriranja sistema
updates-available-body = Otvorite Podešavanja da biste ih preuzeli i instalirali.
updates-ready-title = Ažuriranja su spremna za instalaciju
updates-ready-body = Ponovo pokrenite računar kada vam odgovara da biste ih instalirali.
