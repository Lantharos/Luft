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
privacy-windows-using = Koristi vaše prozore
privacy-windows-seeing = Vidi vaše prozore
privacy-windows-stop = Ukini pristup

## Window access prompt

peek-see-title = { $app } želi vidjeti vaše prozore
peek-see-description = Moći će snimiti sliku bilo kojeg prozora koji imate otvoren.
peek-use-title = { $app } želi vidjeti i koristiti vaše prozore
peek-use-description = Moći će vidjeti svaki prozor koji imate otvoren te klikati i tipkati u njemu kao da ste to vi.
peek-deny = Ne dopusti
peek-allow-once = Dopusti jednom
peek-allow-until-quit = Dopusti dok se ne zatvori

## Window access errors

peek-error-declined = Osoba koja koristi ovo računalo to je odbila. { $app } može ponovno pitati nakon što se zatvori.
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
