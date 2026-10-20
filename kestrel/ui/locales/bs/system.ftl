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
privacy-windows-using = Koristi vaše prozore
privacy-windows-seeing = Vidi vaše prozore
privacy-windows-stop = Ukini pristup

## Window access prompt

peek-see-title = { $app } želi vidjeti vaše prozore
peek-see-description = Moći će snimati sliku bilo kojeg otvorenog prozora.
peek-use-title = { $app } želi vidjeti i koristiti vaše prozore
peek-use-description = Moći će vidjeti bilo koji otvoreni prozor te klikati i kucati u njemu kao da ste to vi.
peek-deny = Ne dozvoli
peek-allow-once = Dozvoli jednom
peek-allow-until-quit = Dozvoli dok se ne zatvori

## Window access errors

peek-error-declined = Osoba koja koristi ovaj računar je ovo odbila. { $app } može ponovo pitati nakon što se zatvori.
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
