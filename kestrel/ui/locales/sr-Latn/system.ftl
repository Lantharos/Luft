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
battery-left-with-time = Preostalo je { $percent }, otprilike { $duration }.
battery-low-title = Baterija je slaba
battery-very-low-title = Baterija je veoma slaba
battery-almost-empty-title = Baterija je skoro prazna
battery-ups-low-title = Baterija UPS-a je slaba
battery-ups-very-low-title = Baterija UPS-a je veoma slaba
battery-ups-almost-empty-title = Baterija UPS-a je skoro prazna
battery-very-low-body = { $left } Uskoro priključite punjač.
battery-almost-empty-body = { $left } Priključite punjač odmah da ne biste izgubili nesačuvani rad.

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
privacy-windows-using = Koristi vaše prozore
privacy-windows-seeing = Vidi vaše prozore
privacy-windows-stop = Ukini pristup

## Window access prompt

peek-see-title = { $app } želi da vidi vaše prozore
peek-see-description = Moći će da snima slike svakog prozora koji imate otvoren.
peek-use-title = { $app } želi da vidi i koristi vaše prozore
peek-use-description = Moći će da vidi svaki prozor koji imate otvoren i da u njemu klikće i kuca kao da ste to vi.
peek-deny = Ne dozvoli
peek-allow-once = Dozvoli jednom
peek-allow-until-quit = Dozvoli dok se ne zatvori

## Window access errors

peek-error-declined = Osoba koja koristi ovaj računar je ovo odbila. { $app } može ponovo da pita kada se zatvori.
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
