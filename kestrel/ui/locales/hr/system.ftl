## Shared

system-cancel = Odustani

## Dictation notifications

dictation-setup-title = Tipkajte govorom
dictation-setup-body = Govorite i ono što kažete upisat će se u bilo kojoj aplikaciji. Govor se obrađuje na ovom računalu, pa je najprije potreban govorni model.
dictation-setup-action = Postavi diktiranje
dictation-unsupported-title = Diktiranje na jeziku { $language } nije dostupno na ovom računalu
dictation-unsupported-body = Procesor ovog računala ne može pokrenuti prepoznavanje govora koje je potrebno za jezik { $language }. Možete diktirati na nekom drugom jeziku.
dictation-settings-action = Postavke diktiranja

## System health notifications

health-gpu-reset-title = Grafički upravljački program prestao je reagirati
health-gpu-reset-body = { $day ->
    [today] Računalo se danas u { $time } samo ponovno pokrenulo. U Postavkama možete vidjeti što može spriječiti da se to ponovi.
   *[other] Računalo se { $date } u { $time } samo ponovno pokrenulo. U Postavkama možete vidjeti što može spriječiti da se to ponovi.
}
health-gpu-reset-details = Pojedinosti

oom-app-closed-title = Aplikacija { $app } zatvorena je radi oslobađanja memorije
oom-container-closed-title = Kontejner je zatvoren radi oslobađanja memorije
oom-closed-body = Računalu je ponestajalo memorije, pa je zatvaranjem oslobođen prostor kako bi sve ostalo i dalje glatko radilo.
oom-closed-body-with-size = Računalu je ponestajalo memorije, pa je zatvaranjem oslobođen prostor kako bi sve ostalo i dalje glatko radilo. Zauzeće memorije bilo je { $size }.
memory-low-title = Luft ostaje bez memorije
memory-low-app-body = Aplikacija { $app } koristi { $size }. Prisilno je zatvorite kako bi sve ostalo i dalje glatko radilo.
memory-low-container-body = Spremnik koristi { $size }. Prisilno ga zatvorite kako bi sve ostalo i dalje glatko radilo.
memory-low-force-quit = Prisilno zatvori

## Input source indicator

input-source-indicator = Izvor unosa: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Način rada u zrakoplovu uključen je hardverskim prekidačem
media-keys-airplane-mode-on = Način rada u zrakoplovu uključen
media-keys-airplane-mode-off = Način rada u zrakoplovu isključen
media-keys-bluetooth-on = Bluetooth uključen
media-keys-bluetooth-off = Bluetooth isključen
media-keys-caps-lock-on = Caps Lock uključen
media-keys-caps-lock-off = Caps Lock isključen
media-keys-num-lock-on = Num Lock uključen
media-keys-num-lock-off = Num Lock isključen

## VPN sign-in

vpn-sign-in-title = Prijava: { $connection }
vpn-connect = Poveži
vpn-signing-in = Prijava…
vpn-finish-in-browser = Dovršite prijavu u pregledniku.
vpn-certificate-untrusted = Poslužitelj { $host } pokazao je certifikat koji nije moguće provjeriti ({ $reason }). Njegov otisak je { $fingerprint }.
vpn-certificate-warning = Netko bi se mogao lažno predstavljati kao ovaj poslužitelj. Povežite se samo ako ste to očekivali.
vpn-certificate-connect = Svejedno poveži

vpn-field-password = Lozinka
vpn-field-certificate-password = Lozinka certifikata
vpn-field-proxy-password = Lozinka proxyja
vpn-field-pre-shared-key = Unaprijed dijeljeni ključ
vpn-field-group-password = Lozinka grupe

## Battery notifications

battery-left = Preostalo je { $percent }.
battery-left-with-time = Preostalo je { $percent }, otprilike { $duration }.
battery-low-title = Baterija je slaba
battery-very-low-title = Baterija je vrlo slaba
battery-almost-empty-title = Baterija je gotovo prazna
battery-ups-low-title = Baterija UPS-a je slaba
battery-ups-very-low-title = Baterija UPS-a je vrlo slaba
battery-ups-almost-empty-title = Baterija UPS-a je gotovo prazna
battery-very-low-body = { $left } Uskoro priključite punjač.
battery-almost-empty-body = { $left } Odmah priključite punjač kako ne biste izgubili nespremljeni rad.

battery-device-low-title = { $device }: baterija je slaba
battery-device-very-low-title = { $device }: baterija je vrlo slaba
battery-device-low-body = { $left } Uskoro napunite uređaj.
battery-device-very-low-body = { $left } Odmah napunite uređaj kako se ne bi isključio.

battery-device-mouse = Miš
battery-device-keyboard = Tipkovnica
battery-device-phone = Telefon
battery-device-tablet = Tablet
battery-device-controller = Kontroler
battery-device-pen = Olovka
battery-device-touchpad = Dodirna pločica
battery-device-headset = Slušalice s mikrofonom
battery-device-speaker = Zvučnik
battery-device-headphones = Slušalice
battery-device-remote = Daljinski upravljač
battery-device-other = Povezani uređaj

## Privacy indicator

privacy-indicator = Koristi se: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofon
privacy-thing-screen = zaslon
privacy-thing-location = lokacija
privacy-thing-windows = prozori

privacy-camera-unknown-app = Aplikacija koristi kameru
privacy-stop-sharing = Prestani dijeliti zaslon
privacy-stop-recording = Zaustavi snimanje
privacy-turn-off-location = Isključi usluge lokacije
privacy-settings = Postavke privatnosti
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofon je utišan
privacy-mute-microphone = Utišaj mikrofon
privacy-unmute-microphone = Uključi mikrofon
privacy-close-app = Zatvori aplikaciju { $app }
privacy-unknown-app = Aplikacija
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

peek-see-request = Dopustiti programu koji ste pokrenuli da vidi vaše prozore?
peek-see-description = Moći će snimiti sliku bilo kojeg prozora koji imate otvoren.
peek-use-request = Dopustiti programu koji ste pokrenuli da vidi i koristi vaše prozore?
peek-use-description = Moći će vidjeti svaki prozor koji imate otvoren te klikati i tipkati u njemu kao da ste to vi.
peek-deny = Ne dopusti
peek-allow-once = Dopusti jednom
peek-allow-until-quit = Dopusti dok se ne zatvori

## Window access errors

peek-error-declined-until-quit = Osoba koja koristi ovo računalo to je odbila. Program može ponovno pitati nakon što se zatvori.
peek-error-not-allowed = Osoba koja koristi ovo računalo to nije dopustila
peek-error-sandboxed = Aplikacije u izoliranom okruženju ne mogu vidjeti ni koristiti druge prozore
peek-error-unknown-caller = Program koji traži pristup završio je ili ga nije moguće prepoznati
peek-error-no-caller = Sabirnica sesije nije navela koji program traži pristup
peek-error-screen-busy = Zaslon je zaključan ili je na njemu otvoren upit sustava. Pokušajte ponovno kad nestane.
peek-error-input-held = Netko drži pritisnute tipke ili tipke miša. Pokušajte ponovno za trenutak.
peek-error-input-dropped = Unos je zaustavljen jer je u trenutku dolaska nešto drugo bilo ispod te točke ili je imalo fokus tipkovnice
peek-error-not-in-front = Prozor nije bilo moguće dovesti u prvi plan
peek-error-covered = Taj dio prozora prekriva nešto drugo
peek-error-outside = { $x }, { $y } nalazi se izvan slike prozora, koja je veličine { $width } × { $height }
peek-error-nothing-to-capture = Prozor ne prikazuje ništa što bi se moglo snimiti
peek-error-window-picture-late = Slika prozora nije bila spremna na vrijeme
peek-error-screen-picture-late = Slika zaslona nije bila spremna na vrijeme
peek-error-no-window-id = Nijedan prozor nema id { $id }. peek list prikazuje otvorene prozore.
peek-error-no-window-for-handle = Program pokrenut kao { $handle } nema otvoren prozor
peek-error-ended-before-window = Program je završio prije nego što je otvorio prozor
peek-error-no-window-in-time = Nijedan prozor nije se otvorio u roku od { $duration }
peek-error-launch-not-started-by-peek = Može se pokrenuti samo program koji je pokrenuo sam peek run
peek-error-ended-while-starting = Program je završio tijekom pokretanja
peek-error-launch-failed = systemd nije uspio pokrenuti { $program }
peek-error-unknown-handle = Ništa što ste pokrenuli s peek run nema oznaku { $handle } ili je već zatvoreno
peek-error-unknown-key = { $key } nije tipka koju peek poznaje
peek-error-unknown-modifier = { $modifier } nije modifikator. Koristite ctrl, shift, alt ili super.
peek-error-display-owner = Ovaj zaslon pripada drugom programu
peek-error-display-run = Programe na skrivenom zaslonu pokreće peek run
peek-error-display-handle = Ovaj zaslon pokrenut je kao { $handle }, a ne kao { $requested }

## Quick settings tiles

auto-rotate-title = Automatsko okretanje
dark-style-title = Tamni način
do-not-disturb-title = Ne ometaj
night-light-title = Noćno svjetlo
airplane-mode-title = Način rada u zrakoplovu

## Power mode

power-profile-title = Način napajanja
power-profile-header = Način napajanja
power-profile-open-menu = Otvori izbornik načina napajanja
power-profile-settings = Postavke napajanja
power-profile-performance = Performanse
power-profile-balanced = Uravnoteženo
power-profile-power-saver = Štednja energije
power-profile-custom = Prilagođeno

## Keep awake

caffeine-title = Drži budnim
caffeine-open-menu = Otvori izbornik Drži budnim
caffeine-until = Do { $time }
caffeine-until-turned-off = Dok se ne isključi
caffeine-30-minutes = 30 minuta
caffeine-1-hour = 1 sat
caffeine-2-hours = 2 sata
caffeine-inhibit-reason = Budno iz brzih postavki

## Brightness

brightness-title = Svjetlina
brightness-open-menu = Otvori izbornik svjetline

## Keyboard backlight

backlight-title = Osvjetljenje tipkovnice
backlight-open-menu = Otvori izbornik svjetline tipkovnice
backlight-slider = Svjetlina tipkovnice
backlight-off = Isključeno
backlight-low = Slabo
backlight-high = Jako

## Sound

volume-sound-settings = Postavke zvuka
volume-mute = Isključi zvuk
volume-unmute = Uključi zvuk
volume-output-slider = Glasnoća
volume-output-title = Izlaz zvuka
volume-output-open-menu = Otvori izbornik izlaza zvuka
volume-input-slider = Mikrofon
volume-input-title = Ulaz zvuka
volume-input-open-menu = Otvori izbornik ulaza zvuka

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Otvori izbornik Bluetootha
bluetooth-settings = Postavke Bluetootha
bluetooth-connect = Poveži
bluetooth-disconnect = Prekini vezu
bluetooth-connect-device = Poveži s uređajem { $deviceName }
bluetooth-disconnect-device = Prekini vezu s uređajem { $deviceName }
bluetooth-no-devices = Nema dostupnih ni povezanih uređaja
bluetooth-turn-on-hint = Uključite Bluetooth da biste se povezali s uređajima
bluetooth-connected-count = { $count ->
    [one] { $count } povezan
    [few] { $count } povezana
   *[other] { $count } povezanih
}

## Network menus in quick settings

network-menu-unknown-network = <nepoznato>
network-menu-connect = Poveži
network-menu-disconnect = Prekini vezu
network-menu-connect-to = Poveži s { $name }
network-menu-disconnect-from = Prekini vezu s { $name }
network-menu-turn-off = Isključi
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zaštićena, jačina signala { $strength } %
   *[no] { $name }, nije zaštićena, jačina signala { $strength } %
}
network-menu-hotspot = Pristupna točka { $name }
network-menu-connected-count = { $count ->
    [one] { $count } povezana
    [few] { $count } povezane
   *[other] { $count } povezanih
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otvori izbornik VPN-a
network-menu-vpn-settings = Postavke VPN-a
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otvori izbornik Wi-Fi mreže
network-menu-wifi-settings = Sve mreže
network-menu-wired = Žične veze
network-menu-wired-open-menu = Otvori izbornik žičnih veza
network-menu-wired-settings = Postavke žične mreže
network-menu-tethers = Dijeljenje veze putem Bluetootha
network-menu-tethers-open-menu = Otvori izbornik dijeljenja veze putem Bluetootha
network-menu-tether = Dijeljenje veze
network-menu-tether-settings = Postavke Bluetootha
network-menu-mobile-connections = Mobilne veze
network-menu-mobile-open-menu = Otvori izbornik mobilnih veza
network-menu-mobile-settings = Postavke mobilne mreže
network-menu-mobile = Mobilna mreža
network-device-wired = Žična mreža
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prijava na mrežu
network-menu-failed-title = Povezivanje nije uspjelo
network-menu-failed-body = Aktiviranje mrežne veze nije uspjelo

## Location access dialog

location-dialog-title = Dopusti pristup lokaciji
location-dialog-description = Aplikacija { $appName } želi pristupiti vašoj lokaciji
location-dialog-info = Pristup lokaciji možete bilo kada promijeniti u postavkama privatnosti
location-dialog-deny = Odbij pristup
location-dialog-grant = Dopusti pristup

## Thunderbolt notifications

thunderbolt-unknown-title = Nepoznati Thunderbolt uređaj
thunderbolt-unknown-body = Dok niste bili tu, otkriven je novi uređaj. Odspojite ga i ponovno spojite da biste ga počeli koristiti.
thunderbolt-unauthorized-title = Neovlašteni Thunderbolt uređaj
thunderbolt-unauthorized-body = Otkriven je novi uređaj koji mora odobriti administrator
thunderbolt-error-title = Pogreška pri odobravanju Thunderbolt uređaja
thunderbolt-error-body = Thunderbolt uređaj nije moguće odobriti: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Odbij
access-dialog-allow = Dopusti

## Display change confirmation

display-change-title = Zadržati ove postavke zaslona?
display-change-countdown = { $seconds ->
    [one] Promjene će se poništiti za { $seconds } sekundu
    [few] Promjene će se poništiti za { $seconds } sekunde
   *[other] Promjene će se poništiti za { $seconds } sekundi
}
display-change-revert = Vrati postavke
display-change-keep = Zadrži promjene

## Drive connected notification

autorun-connected = „{ $driveName }“ je spojen
autorun-ready = Disk se sada može koristiti
autorun-open-with = Otvori u aplikaciji { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Spore tipke su uključene
kbd-a11y-slow-keys-off = Spore tipke su isključene
kbd-a11y-slow-keys-description = Upravo ste držali tipku Shift 8 sekundi. To je prečac za Spore tipke, koje mijenjaju način rada tipkovnice.
kbd-a11y-sticky-keys-on = Ljepljive tipke su uključene
kbd-a11y-sticky-keys-off = Ljepljive tipke su isključene
kbd-a11y-sticky-keys-on-description = Upravo ste pritisnuli tipku Shift 5 puta zaredom. To je prečac za Ljepljive tipke, koje mijenjaju način rada tipkovnice.
kbd-a11y-sticky-keys-off-description = Upravo ste pritisnuli dvije tipke odjednom ili tipku Shift 5 puta zaredom. Time se isključuju Ljepljive tipke, koje mijenjaju način rada tipkovnice.
kbd-a11y-leave-on = Ostavi uključeno
kbd-a11y-turn-on = Uključi
kbd-a11y-turn-off = Isključi
kbd-a11y-leave-off = Ostavi isključeno

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Odaberite audiouređaj
audio-device-cancel = Odustani
audio-device-sound-settings = Postavke zvuka
audio-device-headphones = Slušalice
audio-device-headset = Slušalice s mikrofonom
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Dopusti blokiranje prečaca
inhibit-shortcuts-app = Aplikacija { $appName } želi blokirati prečace
inhibit-shortcuts-unknown-app = Aplikacija želi blokirati prečace
inhibit-shortcuts-restore = Prečace možete vratiti pritiskom na { $shortcut }
inhibit-shortcuts-deny = Odbij
inhibit-shortcuts-allow = Dopusti

## Unlocking encrypted drives

mount-hidden-volume = Skriveni volumen
mount-windows-system-volume = Sistemski volumen sustava Windows
mount-uses-keyfiles = Koristi datoteke s ključem
mount-keyfiles-use-app = Za otključavanje volumena koji koristi datoteke s ključem upotrijebite alat <i>{ $appName }</i>
mount-keyfiles-need-app = Za otključavanje volumena koji koristi datoteke s ključem potreban je vanjski alat poput <i>Diskova</i>
mount-pim-number = PIM broj
mount-pim-invalid = PIM mora biti broj ili prazan
mount-password = Lozinka
mount-remember-password = Zapamti lozinku
mount-cancel = Odustani
mount-unlock = Otključaj
mount-open-app = Otvori { $appName }
mount-wrong-password = Nažalost, to nije uspjelo. Pokušajte ponovno.
mount-unlock-failed = Volumen nije moguće otključati
mount-pim-unsupported = Instalirana verzija udisksa ne podržava postavku PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Potrebna je provjera autentičnosti
network-agent-wifi-rejected = Spremljena lozinka za „{ $networkName }“ nije uspjela. Unesite je ponovno.
network-agent-wifi-secrets = Za pristup bežičnoj mreži „{ $networkName }“ potrebne su lozinke ili ključevi za šifriranje
network-agent-wps-hint = Možete se povezati i pritiskom na tipku „WPS“ na usmjerivaču
network-agent-wired-title = Provjera autentičnosti 802.1X za žičnu mrežu
network-agent-dsl-title = Provjera autentičnosti za DSL
network-agent-pin-title = Potreban je PIN
network-agent-pin-body = Uređaj za mobilni širokopojasni pristup traži PIN
network-agent-vpn-title = Lozinka za VPN
network-agent-password-required = Za povezivanje s mrežom „{ $networkName }“ potrebna je lozinka
network-agent-connect = Poveži
network-agent-cancel = Odustani
network-agent-password = Lozinka
network-agent-username = Korisničko ime
network-agent-key = Ključ
network-agent-private-key-password = Lozinka privatnog ključa
network-agent-identity = Identitet
network-agent-service = Usluga
network-agent-network-name = Naziv mreže
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Snimanje zaslona
screenshot-area = Odabir područja
screenshot-screen = Odabir zaslona
screenshot-window = Odabir prozora
screenshot-take = Snimi zaslon
screenshot-record = Snimaj zaslon
screenshot-show-pointer = Prikaži pokazivač
screenshot-capture = Snimi
screenshot-close = Zatvori
screenshot-screencasts-folder = Videosnimke zaslona
screenshot-screencast-file = Videosnimka zaslona { $date } { $time }
screenshot-screenshots-folder = Snimke zaslona
screenshot-file = Snimka zaslona { $timestamp }
screenshot-screencast-recorded = Videosnimka zaslona je snimljena
screenshot-screencast-start-failed = Snimanje zaslona nije se moglo pokrenuti
screenshot-screencast-out-of-space = Snimanje zaslona nije uspjelo: nema dovoljno prostora na disku
screenshot-screencast-try-again = Snimanje zaslona nije uspjelo, pokušajte ponovno
screenshot-screencast-failed = Snimanje zaslona nije uspjelo
screenshot-screencast-view = Kliknite ovdje za prikaz videozapisa
screenshot-show-in-rover = Prikaži u aplikaciji Rover
screenshot-captured = Snimka zaslona je snimljena
screenshot-captured-body = Sliku možete zalijepiti iz međuspremnika

## System updates
updates-available-title = Dostupna su ažuriranja sustava
updates-available-body = Otvorite Postavke da biste ih preuzeli i instalirali.
updates-ready-title = Ažuriranja su spremna za instalaciju
updates-ready-body = Ponovno pokrenite računalo kad vam odgovara da biste ih instalirali.
