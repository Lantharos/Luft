### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Sačuvaj
settings-network-saving = Čuvanje…
settings-network-cancel = Otkaži
settings-network-connect = Poveži
settings-network-disconnect = Prekini vezu
settings-network-optional = Neobavezno
settings-network-automatic = Automatski
settings-network-name = Naziv
settings-network-password = Lozinka
settings-network-password-saved = Sačuvana lozinka
settings-network-username = Korisničko ime
settings-network-router = Ruter
settings-network-dns-servers = DNS serveri
settings-network-private-key = Privatni ključ
settings-network-connection-settings = Podešavanja veze
settings-network-connect-failed = Povezivanje nije uspelo

## Network: connection states

settings-network-link-connected = Povezano
settings-network-link-connecting = Povezivanje…
settings-network-link-disconnected = Nije povezano
settings-network-link-unplugged = Kabl nije priključen

## Network: Wi‑Fi security types

settings-network-security-open = Bez zaštite
settings-network-security-owe = Poboljšana otvorena
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Poslovna

## Network: signal and radio details

settings-network-signal-excellent = Odličan
settings-network-signal-good = Dobar
settings-network-signal-fair = Solidan
settings-network-signal-weak = Slab
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · kanal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Opseg
settings-network-detail-speed = Brzina veze
settings-network-detail-access-point = Pristupna tačka
settings-network-detail-security = Bezbednost
settings-network-detail-ipv4 = IP adresa
settings-network-detail-ipv6 = IPv6 adresa
settings-network-detail-router = Ruter
settings-network-detail-dns = DNS
settings-network-detail-mac = Hardverska adresa

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Isključeno hardverskim prekidačem
settings-network-wifi-connected = Povezano na { $network }
settings-network-airplane = Režim rada u avionu
    .description = Isključuje sve bežične veze
settings-network-airplane-hardware = Uključeno hardverskim prekidačem
settings-network-known = Poznate mreže
    .description = Mreže na koje se ovaj računar već povezivao, u dometu ili ne
settings-network-known-count = { $count ->
        [one] { $count } sačuvana mreža
        [few] { $count } sačuvane mreže
       *[other] { $count } sačuvanih mreža
    }
settings-network-known-in-range = U dometu
settings-network-wired = Žična veza
settings-network-ethernet = Eternet
settings-network-ethernet-named = Eternet ({ $name })
settings-network-wired-connected = Povezano · { $speed }
settings-network-empty = Nema mrežnih veza
    .description = Priključite mrežni kabl ili Wi‑Fi adapter da biste se povezali na internet
settings-network-proxy = Proksi
    .description = Šalje veb-saobraćaj preko drugog servera, što je često potrebno na mrežama na poslu ili u školi.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi‑Fi mreže
settings-network-wifi-saved = Sačuvana
settings-network-wifi-enterprise = Prijavite se poslovnim ili školskim nalogom
settings-network-wifi-connect-failed = Povezivanje na ovu mrežu nije uspelo
settings-network-wifi-saved-password-failed = Sačuvana lozinka ne radi. Unesite je ponovo.
settings-network-wifi-settings = Podešavanja mreže
settings-network-wifi-searching = Traženje mreža…
settings-network-hidden = Poveži se na skrivenu mrežu
    .description = Unesite naziv mreže i način na koji je zaštićena.
settings-network-hidden-name = Naziv mreže

## Network: joining a Wi‑Fi network

settings-network-join = Povezivanje na „{ $network }“
settings-network-join-enterprise = Prijavite se poslovnim ili školskim nalogom.
settings-network-join-password = Unesite lozinku za ovu mrežu.
settings-network-join-failed = Povezivanje na ovu mrežu nije uspelo.
settings-network-join-sign-in-failed = Prijava nije uspela. Proverite korisničko ime i lozinku.
settings-network-join-wrong-password = Lozinka ne radi. Proverite je i pokušajte ponovo.

## Network: connection settings page

settings-network-forget = Zaboravi ovu mrežu
    .description = Uklanja njenu lozinku i podešavanja sa ovog računara
    .button = Zaboravi
settings-network-remove-vpn = Ukloni ovaj VPN
settings-network-remove-connection = Ukloni ovu vezu
settings-network-remove-description = Briše njena podešavanja sa ovog računara
settings-network-remove = Ukloni

settings-network-general = Opšte
settings-network-autoconnect = Automatsko povezivanje
settings-network-autoconnect-wifi = Povezuje se na ovu mrežu kad god je u dometu
settings-network-autoconnect-wired = Povezuje se čim se priključi kabl
settings-network-autoconnect-vpn = Povezuje se kad god je ovaj računar na mreži
settings-network-autoconnect-other = Povezuje se kad god je dostupna
settings-network-all-users = Dostupno svima
    .description = Može da je koristi svako ko se prijavi na ovom računaru
settings-network-metered = Ograničena veza
    .description = Aplikacije i ažuriranja se uzdržavaju od velikih preuzimanja
settings-network-metered-automatic = Prepoznaj automatski
settings-network-metered-yes = Ograničena
settings-network-metered-no = Neograničena

settings-network-security = Bezbednost
settings-network-security-type = Vrsta zaštite

settings-network-advanced = Napredno
settings-network-private-address = Privatna adresa
    .description = Otežava praćenje ovog računara na ovoj mreži
settings-network-hardware-address = Hardverska adresa
    .description = Adresa koju ovaj računar pokazuje mreži
settings-network-mac-random = Nova adresa svaki put
settings-network-mac-stable = Ista adresa za ovu mrežu
settings-network-mac-private-off = Isključeno
settings-network-mac-builtin = Ugrađena adresa
settings-network-mac-custom = Prilagođena adresa
settings-network-mtu = Najveća veličina paketa (MTU)
    .description = Ostavite prazno, osim ako mreža zahteva određenu veličinu
    .label = MTU

## Network: IPv4 and IPv6 settings

settings-network-ip-method = Metod
    .label = { $family } metod
settings-network-ip-dhcp = Automatski, samo adrese
settings-network-ip-manual = Ručno
settings-network-ip-link-local = Samo lokalna veza
settings-network-ip-shared = Deljeno sa drugim uređajima
settings-network-ip-ignore = Bez upravljanja
settings-network-ip-disabled = Isključeno
settings-network-ip-addresses = Adrese
    .description = Svaka sa svojim prefiksom, npr. { $example }
settings-network-ip-address = Adresa { $number }
settings-network-ip-remove-address = Ukloni adresu
settings-network-ip-add-address = Dodaj adresu
settings-network-ip-router = { $family } ruter
settings-network-ip-automatic-dns = Automatski DNS
    .description = Koristi DNS servere koje predlaže ova mreža
settings-network-ip-dns-first = Koriste se pre predloženih
settings-network-ip-dns-separate = Razdvojite adrese zarezima
settings-network-ip-dns-servers = { $family } DNS serveri
settings-network-ip-search-domains = Domeni za pretragu
    .description = Koriste se kad naziv nema domen, npr. „printer“
    .label = { $family } domeni za pretragu
settings-network-ip-automatic-routes = Automatske rute
    .description = Koristi rute koje predlaže ova mreža
settings-network-ip-routes = Rute
    .description = Šalje saobraćaj za neke mreže preko drugog rutera
settings-network-ip-add-route = Dodaj rutu
settings-network-route-network = Mreža
settings-network-route-priority = Prioritet
settings-network-route-remove = Ukloni rutu

## Network: work or school (802.1X) sign-in

settings-network-eap = Potvrda identiteta
settings-network-eap-peap = Zaštićeni EAP (PEAP)
settings-network-eap-ttls = Tunelovani TLS (TTLS)
settings-network-eap-tls = Sertifikat (TLS)
settings-network-eap-inner = Unutrašnja potvrda identiteta
settings-network-client-certificate = Vaš sertifikat
settings-network-private-key-password = Lozinka privatnog ključa
    .placeholder = Ako ključ ima lozinku
settings-network-anonymous-identity = Anonimni identitet
    .description = Ostavite prazno, osim ako mreža to zahteva
settings-network-ca = CA sertifikat
    .description = Potvrđuje da se povezujete na pravu mrežu
settings-network-ca-system = Koristi sistemske sertifikate
settings-network-ca-file = Izaberi datoteku…
settings-network-ca-another-file = Izaberi drugu datoteku…
settings-network-ca-none = Ne proveravaj
settings-network-choose-file = Izaberi…
settings-network-server-domain = Domen servera
    .description = Povezuje se samo na servere u ovom domenu

## Network: form errors

settings-network-error-name = Unesite naziv
settings-network-error-no-addresses = Dodajte bar jednu adresu
settings-network-error-address = Unesite adresu sa prefiksom, npr. { $example }
settings-network-error-router = Unesite adresu rutera, npr. { $example }
settings-network-error-dns = „{ $address }“ nije ispravna adresa
settings-network-error-search-domain = „{ $domain }“ nije ispravan domen
settings-network-error-route = Unesite mrežu, npr. { $example }
settings-network-error-priority = Prioritet mora biti ceo broj
settings-network-error-username = Unesite korisničko ime
settings-network-error-domain = Unesite domen, npr. example.com
settings-network-error-certificate = Izaberite svoj sertifikat
settings-network-error-private-key = Izaberite svoj privatni ključ
settings-network-error-mtu = Unesite broj od { $lowest } do { $highest } ili ostavite prazno
settings-network-error-mac = Unesite adresu kao što je 12:34:56:78:9A:BC
settings-network-error-password = Unesite lozinku
settings-network-error-password-length = { $count ->
        [one] Unesite bar { $count } znak
        [few] Unesite bar { $count } znaka
       *[other] Unesite bar { $count } znakova
    }

## Network: proxy

settings-network-proxy-off = Isključeno
settings-network-proxy-manual = Ručno
settings-network-proxy-url = Adresa konfiguracije
settings-network-proxy-http = Veb (HTTP)
settings-network-proxy-https = Bezbedni veb (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Server
    .label = { $protocol } – server
settings-network-proxy-port = Port
    .label = { $protocol } – port
settings-network-proxy-skip = Ne koristi proksi za
settings-network-proxy-error-url = Unesite veb-adresu, npr. http://example.com/proxy.pac
settings-network-proxy-error-host = Unesite samo naziv servera, npr. proxy.example.com
settings-network-proxy-error-port = Port mora biti od 1 do 65535
settings-network-proxy-save-failed = Čuvanje podešavanja proksija nije uspelo

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Uvezi iz datoteke
    .description = WireGuard, OpenVPN i druge datoteke sa VPN konfiguracijom
settings-network-vpn-importing = Uvoženje…
settings-network-wireguard = Podesi WireGuard
    .description = Unesite podatke koje ste dobili od VPN provajdera ili sa servera
settings-network-wireguard-dialog = Ove podatke možete dobiti od VPN provajdera ili vlasnika servera.
settings-network-wireguard-name-example = Kućni VPN
settings-network-wireguard-public-key = Javni ključ { $key }
settings-network-wireguard-public-key-pending = Ovde će se pojaviti javni ključ koji treba da podelite
settings-network-wireguard-copy = Kopiraj javni ključ
settings-network-wireguard-copied = Kopirano
settings-network-wireguard-generate = Napravi novi ključ
settings-network-wireguard-addresses = Adrese ovog računara unutar VPN mreže
settings-network-wireguard-server-key = Javni ključ servera
settings-network-wireguard-endpoint = Adresa servera
settings-network-wireguard-allowed-ips = Dozvoljene IP adrese
    .description = Saobraćaj ka ovim opsezima ide kroz VPN
settings-network-wireguard-preshared-key = Unapred deljeni ključ
settings-network-wireguard-keepalive = Održavanje veze
    .description = Pomaže da veza ostane aktivna iza rutera
    .placeholder = Neobavezno, u sekundama
settings-network-wireguard-add = Dodaj
settings-network-wireguard-adding = Dodavanje…
settings-network-wireguard-error-private-key = Unesite ili napravite privatni ključ
settings-network-wireguard-error-addresses = Unesite bar jednu adresu
settings-network-wireguard-error-server-key = Unesite javni ključ servera
settings-network-wireguard-error-endpoint = Unesite adresu i port servera
settings-network-wireguard-error-allowed-ips = Unesite bar jedan opseg
settings-network-wireguard-error-keepalive = Unesite broj sekundi

## Bluetooth panel

settings-bluetooth-hardware-off = Isključeno hardverskim prekidačem
settings-bluetooth-power-on-failed = Bluetooth nije mogao da se uključi
settings-bluetooth-power-off-failed = Bluetooth nije mogao da se isključi
settings-bluetooth-visible = Vidljivo uređajima u blizini
    .description = Omogućava telefonima i računarima da pronađu ovaj računar
settings-bluetooth-visible-as = Prikazuje se kao „{ $name }“
settings-bluetooth-visible-duration = Ostani vidljiv
settings-bluetooth-visible-for = { $minutes ->
        [one] { $minutes } minut
        [few] { $minutes } minuta
       *[other] { $minutes } minuta
    }
settings-bluetooth-visible-until-off = Dok se ne isključi
settings-bluetooth-visible-failed = Promena vidljivosti ovog računara nije uspela
settings-bluetooth-paired = Moji uređaji
settings-bluetooth-nearby = Uređaji u blizini
settings-bluetooth-searching = Traženje uređaja…
    .description = Stavite uređaj koji želite da dodate u režim uparivanja
settings-bluetooth-blocked = Bluetooth je isključen hardverskim prekidačem
    .description = Uključite ga prekidačem ili tasterom na računaru
settings-bluetooth-details = Detalji uređaja
settings-bluetooth-connected = Povezano
settings-bluetooth-connected-battery = Povezano · baterija { $battery }
settings-bluetooth-connecting = Povezivanje…
settings-bluetooth-disconnecting = Prekidanje veze…
settings-bluetooth-pairing = Uparivanje…
settings-bluetooth-forget-confirm = Zaboraviti „{ $name }“?
    .description = Moraćete ponovo da ga uparite da biste ga koristili sa ovim računarom.
settings-bluetooth-forget = Zaboravi
settings-bluetooth-cancel = Otkaži
settings-bluetooth-connect = Poveži
settings-bluetooth-disconnect = Prekini vezu
settings-bluetooth-done = Gotovo

## Bluetooth: device details

settings-bluetooth-type = Vrsta
settings-bluetooth-battery = Baterija
settings-bluetooth-address = Adresa
settings-bluetooth-autoconnect = Automatsko povezivanje
    .description = Kad god je u blizini
settings-bluetooth-kind-headphones = Slušalice
settings-bluetooth-kind-speaker = Zvučnik
settings-bluetooth-kind-mouse = Miš
settings-bluetooth-kind-keyboard = Tastatura
settings-bluetooth-kind-gamepad = Kontroler za igre
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Računar
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Ekran
settings-bluetooth-kind-printer = Štampač
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Drugi uređaj

## Bluetooth: pairing requests

settings-bluetooth-request-unnamed = uređaj
settings-bluetooth-request-confirm = Upariti { $name }?
    .description = Proverite da li { $name } prikazuje isti kod.
settings-bluetooth-request-authorize = Dozvoliti uparivanje za { $name }?
    .description = Nakon toga će { $name } moći da se poveže sa ovim računarom.
settings-bluetooth-request-pin = Unesite PIN za { $name }
    .description = Često je 0000 ili 1234. Ako nijedan ne radi, potražite ga u uputstvu uređaja.
settings-bluetooth-request-passkey = Unesite kod koji prikazuje { $name }
    .description = Otkucajte šest cifara tačno onako kako su prikazane.
settings-bluetooth-request-display = Uparivanje: { $name }
    .description = Otkucajte ovaj kod za { $name }, pa pritisnite Enter.
settings-bluetooth-pair = Upari
settings-bluetooth-allow = Dozvoli

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Prenesite uređaje iz sistema Windows
    .description = { $count ->
        [one] Uređaj { $devices } je uparen u sistemu Windows. Koristite ga ovde bez ponovnog uparivanja.
        [few] Uređaji { $devices } su upareni u sistemu Windows. Koristite ih ovde bez ponovnog uparivanja.
       *[other] Uređaji { $devices } su upareni u sistemu Windows. Koristite ih ovde bez ponovnog uparivanja.
    }
settings-bluetooth-windows-more = { $count ->
        [one] još { $count }
        [few] još { $count }
       *[other] još { $count }
    }

## Accounts panel

settings-accounts-unavailable = Nalozi nisu dostupni
    .description = Usluga za naloge nije instalirana na ovom računaru
settings-accounts-online = Onlajn nalozi
    .description = Svaki nalog je fascikla u fascikli Cloud u vašoj ličnoj fascikli, koju svaka aplikacija može da otvori. Datoteke se preuzimaju kada ih otvorite.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud ili WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Prijavite se ponovo da biste nastavili da ga koristite
settings-accounts-paused-metered = Sinhronizacija je pauzirana na ograničenoj vezi
settings-accounts-paused-battery = Sinhronizacija je pauzirana dok je baterija pri kraju
settings-accounts-connecting = Povezivanje…
settings-accounts-offline = Van mreže
settings-accounts-offline-kept = Van mreže, zadržane datoteke su i dalje tu
settings-accounts-not-connected = Nije povezano
settings-accounts-syncing = { $count ->
        [one] Sinhronizuje se { $count } promena
        [few] Sinhronizuju se { $count } promene
       *[other] Sinhronizuje se { $count } promena
    }
settings-accounts-name = Naziv
settings-accounts-folder = Fascikla
settings-accounts-server = Server
settings-accounts-storage = Prostor
settings-accounts-storage-used = Iskorišćeno: { $used } od { $total }
settings-accounts-on-device = Na ovom uređaju
settings-accounts-kept = { $count ->
        [one] { $count } stavka je zadržana, ostalo se preuzima pri otvaranju
        [few] { $count } stavke su zadržane, ostalo se preuzima pri otvaranju
       *[other] { $count } stavki je zadržano, ostalo se preuzima pri otvaranju
    }
settings-accounts-on-demand = Datoteke se preuzimaju kada ih otvorite
settings-accounts-sign-in-again = Prijavi se ponovo
settings-accounts-keep = Zadrži
settings-accounts-remove = Ukloni
settings-accounts-remove-confirm = Ukloni sa ovog računara
settings-accounts-removing = Uklanjanje…
settings-accounts-remove-note = Vaše datoteke ostaju u usluzi { $provider }. Izmene napravljene ovde prvo se otpremaju.

## Accounts: providers

settings-accounts-provider-icloud = Vaš Apple nalog, potvrđen kodom sa uređaja iPhone, iPad ili Mac
settings-accounts-provider-onedrive = Lični, poslovni ili školski Microsoft nalog, u pregledaču
settings-accounts-provider-dropbox = Dropbox nalog, u pregledaču
settings-accounts-provider-nextcloud = Vaš server ili server vaše organizacije
settings-accounts-provider-webdav = Bilo koji server koji podržava WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Ponovna prijava: { $account }
settings-accounts-browser = Otvoriće se pregledač da biste se prijavili preko usluge { $provider }. Luft nikada ne vidi vašu lozinku.
settings-accounts-password-for = Unesite lozinku za { $user }.
settings-accounts-apple-account = Apple nalog
settings-accounts-password = Lozinka
settings-accounts-app-password = Lozinka aplikacije
settings-accounts-user = Korisničko ime
settings-accounts-apple-note = Koristite lozinku Apple naloga, lozinke za određene aplikacije ovde ne rade. Apple će zatim prikazati kod na vašem uređaju iPhone, iPad ili Mac.
settings-accounts-nextcloud-browser = Otvoriće se pregledač da biste se prijavili na server i dozvolili pristup sistemu Luft.
settings-accounts-use-app-password = Koristi lozinku aplikacije
settings-accounts-error-server = Unesite adresu servera
settings-accounts-error-apple-account = Unesite imejl adresu Apple naloga
settings-accounts-error-user = Unesite korisničko ime
settings-accounts-error-password = Unesite lozinku
settings-accounts-cancel = Otkaži
settings-accounts-back = Nazad
settings-accounts-continue-in-browser = Nastavi u pregledaču
settings-accounts-sign-in = Prijava
settings-accounts-try-again = Pokušaj ponovo
settings-accounts-continue = Nastavi
settings-accounts-working = Povezivanje sa uslugom { $provider }…
settings-accounts-finish-in-browser = Završite prijavu preko usluge { $provider } u pregledaču. Luft nikada ne vidi vašu lozinku, a ovo će se samo ažurirati kada završite.
settings-accounts-no-browser = Pregledač se nije otvorio. Kopirajte vezu i otvorite je u pregledaču.
settings-accounts-open-again = Ponovo otvori stranicu
settings-accounts-copy-link = Kopiraj vezu
settings-accounts-copied = Kopirano
settings-accounts-code = Verifikacioni kod
    .placeholder = Kod od 6 cifara
settings-accounts-text-me = Pošalji mi kod u SMS poruci
settings-accounts-choose-phone = Na koji broj Apple treba da pošalje kod?
    .description = Pošalji SMS poruku
settings-accounts-approve = Vaš Apple nalog koristi naprednu zaštitu podataka. Odobrite zahtev na uređaju iPhone, iPad ili Mac da bi ovaj računar mogao da otvori iCloud Drive.
