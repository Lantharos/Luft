## Shared

system-cancel = Otkaži

## Dictation notifications

dictation-setup-title = Kucajte govorom
dictation-setup-body = Govorite i ono što kažete upisuje se u bilo kojoj aplikaciji. Sve se obrađuje na ovom računaru, pa je prvo potreban model govora.
dictation-setup-action = Postavi diktiranje
dictation-unsupported-title = Diktiranje na jeziku { $language } nije dostupno na ovom računaru
dictation-unsupported-body = Procesor ovog računara ne može pokretati prepoznavanje govora potrebno za jezik { $language }. Možete diktirati na drugom jeziku.
dictation-settings-action = Postavke diktiranja

## System health notifications

health-gpu-reset-title = Grafički drajver je prestao reagovati
health-gpu-reset-body = { $day ->
    [today] Računar se danas u { $time } sam ponovo pokrenuo. U Postavkama možete vidjeti šta može spriječiti da se to ponovi.
   *[other] Računar se { $date } u { $time } sam ponovo pokrenuo. U Postavkama možete vidjeti šta može spriječiti da se to ponovi.
}
health-gpu-reset-details = Detalji

oom-app-closed-title = Aplikacija { $app } je zatvorena da bi se oslobodila memorija
oom-container-closed-title = Kontejner je zatvoren da bi se oslobodila memorija
oom-closed-body = Računaru je ponestajalo memorije. Ovako sve ostalo i dalje radi bez zastoja.
oom-closed-body-with-size = Računaru je ponestajalo memorije. Ovako sve ostalo i dalje radi bez zastoja. Oslobođeno je { $size }.
memory-low-title = Luft ostaje bez memorije
memory-low-app-body = Aplikacija { $app } koristi { $size }. Prisilno je zatvorite da sve ostalo i dalje radi bez zastoja.
memory-low-container-body = Kontejner koristi { $size }. Prisilno ga zatvorite da sve ostalo i dalje radi bez zastoja.
memory-low-force-quit = Prisilno zatvori

## Input source indicator

input-source-indicator = Izvor unosa: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Način rada u avionu je uključen prekidačem na uređaju
media-keys-airplane-mode-on = Način rada u avionu uključen
media-keys-airplane-mode-off = Način rada u avionu isključen
media-keys-bluetooth-on = Bluetooth uključen
media-keys-bluetooth-off = Bluetooth isključen
media-keys-caps-lock-on = Caps Lock uključen
media-keys-caps-lock-off = Caps Lock isključen
media-keys-num-lock-on = Num Lock uključen
media-keys-num-lock-off = Num Lock isključen

## VPN sign-in

vpn-sign-in-title = Prijava na { $connection }
vpn-connect = Poveži
vpn-signing-in = Prijava…
vpn-finish-in-browser = Završite prijavu u pregledniku.
vpn-certificate-untrusted = { $host } je predočio certifikat koji se ne može provjeriti ({ $reason }). Njegov otisak je { $fingerprint }.
vpn-certificate-warning = Neko se možda lažno predstavlja kao ovaj server. Povežite se samo ako ste ovo očekivali.
vpn-certificate-connect = Ipak poveži

vpn-field-password = Lozinka
vpn-field-certificate-password = Lozinka certifikata
vpn-field-proxy-password = Lozinka proxyja
vpn-field-pre-shared-key = Unaprijed dijeljeni ključ
vpn-field-group-password = Lozinka grupe

## Battery notifications

battery-left = Preostalo je { $percent }.
battery-left-with-time = Preostalo je { $percent }, oko { $duration }.
battery-low-title = Baterija je slaba
battery-very-low-title = Baterija je vrlo slaba
battery-almost-empty-title = Baterija je skoro prazna
battery-ups-low-title = Baterija UPS-a je slaba
battery-ups-very-low-title = Baterija UPS-a je vrlo slaba
battery-ups-almost-empty-title = Baterija UPS-a je skoro prazna
battery-very-low-body = { $left } Uskoro priključite punjač.
battery-almost-empty-body = { $left } Priključite punjač sada da ne izgubite nesačuvani rad.

battery-device-low-title = Slaba baterija: { $device }
battery-device-very-low-title = Vrlo slaba baterija: { $device }
battery-device-low-body = { $left } Uskoro napunite bateriju.
battery-device-very-low-body = { $left } Napunite bateriju sada da se uređaj ne isključi.

battery-device-mouse = Miš
battery-device-keyboard = Tastatura
battery-device-phone = Telefon
battery-device-tablet = Tablet
battery-device-controller = Kontroler
battery-device-pen = Olovka
battery-device-touchpad = Dodirna podloga
battery-device-headset = Slušalice s mikrofonom
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
privacy-stop-sharing = Zaustavi dijeljenje ekrana
privacy-stop-recording = Zaustavi snimanje
privacy-turn-off-location = Isključi usluge lokacije
privacy-settings = Postavke privatnosti
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofon je utišan
privacy-mute-microphone = Utišaj mikrofon
privacy-unmute-microphone = Uključi zvuk mikrofona
privacy-close-app = Zatvori { $app }
privacy-unknown-app = Neka aplikacija
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program može vidjeti vaše prozore
    [few] { $count } programa mogu vidjeti vaše prozore
   *[other] { $count } programa može vidjeti vaše prozore
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program može vidjeti i koristiti vaše prozore
    [few] { $count } programa mogu vidjeti i koristiti vaše prozore
   *[other] { $count } programa može vidjeti i koristiti vaše prozore
}
privacy-windows-stop = Ukini pristup

## Window access prompt

peek-see-request = Dozvoliti programu koji ste pokrenuli da vidi vaše prozore?
peek-see-description = Moći će snimati sliku bilo kojeg otvorenog prozora.
peek-use-request = Dozvoliti programu koji ste pokrenuli da vidi i koristi vaše prozore?
peek-use-description = Moći će vidjeti bilo koji otvoreni prozor te klikati i kucati u njemu kao da ste to vi.
peek-deny = Ne dozvoli
peek-allow-once = Dozvoli jednom
peek-allow-until-quit = Dozvoli dok se ne zatvori

## Window access errors

peek-error-declined-until-quit = Osoba koja koristi ovaj računar je ovo odbila. Program može ponovo pitati nakon što se zatvori.
peek-error-not-allowed = Osoba koja koristi ovaj računar to nije dozvolila
peek-error-sandboxed = Aplikacije u izolovanom okruženju ne mogu vidjeti ni koristiti druge prozore
peek-error-unknown-caller = Program koji pita je završio ili se ne može prepoznati
peek-error-no-caller = Sesijska sabirnica nije javila koji program pita
peek-error-screen-busy = Ekran je zaključan ili je na njemu otvoren sistemski upit. Pokušajte ponovo kada nestane.
peek-error-input-held = Neko drži pritisnute tipke ili dugmad miša. Pokušajte ponovo za trenutak.
peek-error-input-dropped = Unos je zaustavljen jer je u trenutku dolaska nešto drugo bilo ispod pokazivača ili imalo fokus tastature
peek-error-not-in-front = Prozor se nije mogao dovesti u prvi plan
peek-error-covered = Taj dio prozora prekriva nešto drugo
peek-error-outside = { $x }, { $y } je izvan slike prozora, koja ima { $width } × { $height }
peek-error-nothing-to-capture = Prozor ne prikazuje ništa što bi se moglo snimiti
peek-error-window-picture-late = Slika prozora nije bila spremna na vrijeme
peek-error-screen-picture-late = Slika ekrana nije bila spremna na vrijeme
peek-error-no-window-id = Nijedan prozor nema id { $id }. peek list prikazuje otvorene prozore.
peek-error-no-window-for-handle = Program pokrenut kao { $handle } nema otvoren prozor
peek-error-ended-before-window = Program je završio prije nego što je otvorio prozor
peek-error-no-window-in-time = Nijedan prozor se nije otvorio u roku od { $duration }
peek-error-launch-not-started-by-peek = Pokrenuti se može samo program koji je peek run sam pokrenuo
peek-error-ended-while-starting = Program je završio dok se pokretao
peek-error-launch-failed = systemd nije mogao pokrenuti { $program }
peek-error-unknown-handle = Ništa što ste pokrenuli s peek run nema oznaku { $handle } ili je već zatvoreno
peek-error-unknown-key = { $key } nije tipka koju peek poznaje
peek-error-unknown-modifier = { $modifier } nije modifikator. Koristite ctrl, shift, alt ili super.
peek-error-display-owner = Ovaj ekran pripada drugom programu
peek-error-display-run = Programe na skrivenom ekranu pokreće peek run
peek-error-display-handle = Ovaj ekran je pokrenut kao { $handle }, a ne { $requested }

## Quick settings tiles

auto-rotate-title = Automatska rotacija
dark-style-title = Tamni način rada
do-not-disturb-title = Ne uznemiravaj
night-light-title = Noćno svjetlo
airplane-mode-title = Način rada u avionu

## Power mode

power-profile-title = Način napajanja
power-profile-header = Način napajanja
power-profile-open-menu = Otvori meni načina napajanja
power-profile-settings = Postavke napajanja
power-profile-performance = Performanse
power-profile-balanced = Uravnoteženo
power-profile-power-saver = Ušteda energije
power-profile-custom = Prilagođeno

## Keep awake

caffeine-title = Drži budnim
caffeine-open-menu = Otvori meni Drži budnim
caffeine-until = Do { $time }
caffeine-until-turned-off = Dok se ne isključi
caffeine-30-minutes = 30 minuta
caffeine-1-hour = 1 sat
caffeine-2-hours = 2 sata
caffeine-inhibit-reason = Držano budnim iz brzih postavki

## Brightness

brightness-title = Osvjetljenje
brightness-open-menu = Otvori meni osvjetljenja

## Keyboard backlight

backlight-title = Osvjetljenje tastature
backlight-open-menu = Otvori meni osvjetljenja tastature
backlight-slider = Osvjetljenje tastature
backlight-off = Isključeno
backlight-low = Slabo
backlight-high = Jako

## Sound

volume-sound-settings = Postavke zvuka
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
bluetooth-open-menu = Otvori meni Bluetootha
bluetooth-settings = Postavke Bluetootha
bluetooth-connect = Poveži
bluetooth-disconnect = Prekini vezu
bluetooth-connect-device = Poveži s uređajem { $deviceName }
bluetooth-disconnect-device = Prekini vezu s uređajem { $deviceName }
bluetooth-no-devices = Nema dostupnih ni povezanih uređaja
bluetooth-turn-on-hint = Uključite Bluetooth da se povežete s uređajima
bluetooth-connected-count = { $count ->
    [one] { $count } povezan
    [few] { $count } povezana
   *[other] { $count } povezanih
}

## Network menus in quick settings

network-menu-unknown-network = <nepoznato>
network-menu-connect = Poveži
network-menu-disconnect = Prekini vezu
network-menu-connect-to = Poveži: { $name }
network-menu-disconnect-from = Prekini vezu: { $name }
network-menu-turn-off = Isključi
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zaštićena, jačina signala { $strength }%
   *[no] { $name }, nije zaštićena, jačina signala { $strength }%
}
network-menu-hotspot = Pristupna tačka { $name }
network-menu-connected-count = { $count ->
    [one] { $count } povezana
    [few] { $count } povezane
   *[other] { $count } povezanih
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otvori meni VPN-a
network-menu-vpn-settings = Postavke VPN-a
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otvori meni Wi-Fi mreže
network-menu-wifi-settings = Sve mreže
network-menu-wired = Žične veze
network-menu-wired-open-menu = Otvori meni žičnih veza
network-menu-wired-settings = Postavke žične mreže
network-menu-tethers = Bluetooth dijeljenje veze
network-menu-tethers-open-menu = Otvori meni Bluetooth dijeljenja veze
network-menu-tether = Dijeljenje veze
network-menu-tether-settings = Postavke Bluetootha
network-menu-mobile-connections = Mobilne veze
network-menu-mobile-open-menu = Otvori meni mobilnih veza
network-menu-mobile-settings = Postavke mobilnog interneta
network-menu-mobile = Mobilni internet
network-device-wired = Žična mreža
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prijava na mrežu
network-menu-failed-title = Povezivanje nije uspjelo
network-menu-failed-body = Aktiviranje mrežne veze nije uspjelo

## Location access dialog

location-dialog-title = Dozvoliti pristup lokaciji
location-dialog-description = Aplikacija { $appName } želi pristupiti vašoj lokaciji
location-dialog-info = Pristup lokaciji možete bilo kada promijeniti u postavkama privatnosti
location-dialog-deny = Odbij pristup
location-dialog-grant = Dozvoli pristup

## Thunderbolt notifications

thunderbolt-unknown-title = Nepoznat Thunderbolt uređaj
thunderbolt-unknown-body = Dok niste bili tu, otkriven je novi uređaj. Isključite ga i ponovo priključite da ga počnete koristiti.
thunderbolt-unauthorized-title = Neodobren Thunderbolt uređaj
thunderbolt-unauthorized-body = Otkriven je novi uređaj koji mora odobriti administrator
thunderbolt-error-title = Greška pri odobravanju Thunderbolt uređaja
thunderbolt-error-body = Thunderbolt uređaj nije bilo moguće odobriti: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Odbij
access-dialog-allow = Dozvoli

## Display change confirmation

display-change-title = Zadržati ove postavke ekrana?
display-change-countdown = { $seconds ->
    [one] Promjene postavki se poništavaju za { $seconds } sekundu
    [few] Promjene postavki se poništavaju za { $seconds } sekunde
   *[other] Promjene postavki se poništavaju za { $seconds } sekundi
}
display-change-revert = Vrati postavke
display-change-keep = Zadrži promjene

## Drive connected notification

autorun-connected = „{ $driveName }“ je priključen
autorun-ready = Disk se sada može koristiti
autorun-open-with = Otvori u aplikaciji { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Spore tipke su uključene
kbd-a11y-slow-keys-off = Spore tipke su isključene
kbd-a11y-slow-keys-description = Upravo ste držali tipku Shift 8 sekundi. To je prečica za Spore tipke, funkciju koja mijenja način rada tastature.
kbd-a11y-sticky-keys-on = Ljepljive tipke su uključene
kbd-a11y-sticky-keys-off = Ljepljive tipke su isključene
kbd-a11y-sticky-keys-on-description = Upravo ste pritisnuli tipku Shift 5 puta zaredom. To je prečica za Ljepljive tipke, funkciju koja mijenja način rada tastature.
kbd-a11y-sticky-keys-off-description = Upravo ste pritisnuli dvije tipke odjednom ili tipku Shift 5 puta zaredom. Time se isključuju Ljepljive tipke, funkcija koja mijenja način rada tastature.
kbd-a11y-leave-on = Ostavi uključeno
kbd-a11y-turn-on = Uključi
kbd-a11y-turn-off = Isključi
kbd-a11y-leave-off = Ostavi isključeno

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Odaberite audio uređaj
audio-device-cancel = Otkaži
audio-device-sound-settings = Postavke zvuka
audio-device-headphones = Slušalice
audio-device-headset = Slušalice s mikrofonom
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Dozvoliti blokiranje prečica
inhibit-shortcuts-app = Aplikacija { $appName } želi blokirati prečice
inhibit-shortcuts-unknown-app = Jedna aplikacija želi blokirati prečice
inhibit-shortcuts-restore = Prečice možete vratiti pritiskom na { $shortcut }
inhibit-shortcuts-deny = Odbij
inhibit-shortcuts-allow = Dozvoli

## Unlocking encrypted drives

mount-hidden-volume = Skriveni volumen
mount-windows-system-volume = Sistemski volumen Windowsa
mount-uses-keyfiles = Koristi fajlove ključeva
mount-keyfiles-use-app = Da otključate volumen koji koristi fajlove ključeva, koristite alat <i>{ $appName }</i>
mount-keyfiles-need-app = Za otključavanje volumena koji koristi fajlove ključeva potreban je vanjski alat, kao što su <i>Diskovi</i>
mount-pim-number = PIM broj
mount-pim-invalid = PIM mora biti broj ili prazan
mount-password = Lozinka
mount-remember-password = Zapamti lozinku
mount-cancel = Otkaži
mount-unlock = Otključaj
mount-open-app = Otvori { $appName }
mount-wrong-password = Nažalost, nije uspjelo. Pokušajte ponovo.
mount-unlock-failed = Volumen nije moguće otključati
mount-pim-unsupported = Instalirana verzija udisksa ne podržava postavku PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Potrebna je autentifikacija
network-agent-wifi-rejected = Sačuvana lozinka za „{ $networkName }“ nije ispravna. Unesite je ponovo.
network-agent-wifi-secrets = Za pristup bežičnoj mreži „{ $networkName }“ potrebne su lozinke ili ključevi za šifriranje
network-agent-wps-hint = Možete se povezati i pritiskom na dugme „WPS“ na ruteru
network-agent-wired-title = Žična 802.1X autentifikacija
network-agent-dsl-title = DSL autentifikacija
network-agent-pin-title = Potreban je PIN kôd
network-agent-pin-body = Uređaju za mobilni internet potreban je PIN kôd
network-agent-vpn-title = VPN lozinka
network-agent-password-required = Za povezivanje s „{ $networkName }“ potrebna je lozinka
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
screenshot-area = Odabir područja
screenshot-screen = Odabir ekrana
screenshot-window = Odabir prozora
screenshot-take = Napravi snimak ekrana
screenshot-record = Snimaj ekran
screenshot-show-pointer = Prikaži pokazivač
screenshot-capture = Snimi
screenshot-close = Zatvori
screenshot-screencasts-folder = Videosnimci ekrana
screenshot-screencast-file = Videosnimak ekrana { $date } { $time }
screenshot-screenshots-folder = Snimci ekrana
screenshot-file = Snimak ekrana { $timestamp }
screenshot-screencast-recorded = Videosnimak ekrana je snimljen
screenshot-screencast-start-failed = Snimanje ekrana nije pokrenuto
screenshot-screencast-out-of-space = Snimanje ekrana nije uspjelo: nema prostora na disku
screenshot-screencast-try-again = Snimanje ekrana nije uspjelo. Pokušajte ponovo.
screenshot-screencast-failed = Snimanje ekrana nije uspjelo
screenshot-screencast-view = Kliknite ovdje da pogledate video
screenshot-show-in-rover = Prikaži u aplikaciji Rover
screenshot-captured = Snimak ekrana je napravljen
screenshot-captured-body = Sliku možete zalijepiti iz međuspremnika
