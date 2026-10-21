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
settings-network-connection-settings = Postavke veze
settings-network-connect-failed = Povezivanje nije uspjelo

## Network: connection states

settings-network-link-connected = Povezano
settings-network-link-connecting = Povezivanje…
settings-network-link-disconnected = Nije povezano
settings-network-link-unplugged = Kabl je izvučen

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
settings-network-signal-fair = Srednji
settings-network-signal-weak = Slab
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Kanal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Opseg
settings-network-detail-speed = Brzina veze
settings-network-detail-access-point = Pristupna tačka
settings-network-detail-security = Sigurnost
settings-network-detail-ipv4 = IP adresa
settings-network-detail-ipv6 = IPv6 adresa
settings-network-detail-router = Ruter
settings-network-detail-dns = DNS
settings-network-detail-mac = Hardverska adresa

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Isključeno hardverskim prekidačem
settings-network-wifi-connected = Povezano s mrežom { $network }
settings-network-airplane = Način rada u avionu
    .description = Isključuje sve bežične veze
settings-network-airplane-hardware = Uključeno hardverskim prekidačem
settings-network-known = Poznate mreže
    .description = Mreže na koje se ovaj računar ranije povezivao, u blizini ili ne
settings-network-known-count = { $count ->
        [one] { $count } sačuvana mreža
        [few] { $count } sačuvane mreže
       *[other] { $count } sačuvanih mreža
    }
settings-network-known-in-range = U dometu
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Povezano · { $speed }
settings-network-empty = Nema mrežnih veza
    .description = Priključite mrežni kabl ili Wi‑Fi adapter da biste se povezali na internet
settings-network-proxy = Proxy
    .description = Šalje web saobraćaj preko drugog servera, što je često potrebno na poslovnim ili školskim mrežama.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi‑Fi mreže
settings-network-wifi-saved = Sačuvano
settings-network-wifi-enterprise = Prijava poslovnim ili školskim računom
settings-network-wifi-connect-failed = Povezivanje s ovom mrežom nije uspjelo
settings-network-wifi-saved-password-failed = Sačuvana lozinka nije prihvaćena. Unesite je ponovo.
settings-network-wifi-settings = Postavke mreže
settings-network-wifi-searching = Traženje mreža…
settings-network-hidden = Poveži se sa skrivenom mrežom
    .description = Unesite naziv mreže i način na koji je zaštićena.
settings-network-hidden-name = Naziv mreže

## Network: joining a Wi‑Fi network

settings-network-join = Povezivanje s mrežom „{ $network }“
settings-network-join-enterprise = Prijavite se poslovnim ili školskim računom.
settings-network-join-password = Unesite lozinku za ovu mrežu.
settings-network-join-failed = Povezivanje s ovom mrežom nije uspjelo.
settings-network-join-sign-in-failed = Prijava nije uspjela. Provjerite korisničko ime i lozinku.
settings-network-join-wrong-password = Lozinka nije prihvaćena. Provjerite je i pokušajte ponovo.

## Network: connection settings page

settings-network-forget = Zaboravi ovu mrežu
    .description = Uklanja njenu lozinku i postavke s ovog računara
    .button = Zaboravi
settings-network-remove-vpn = Ukloni ovaj VPN
settings-network-remove-connection = Ukloni ovu vezu
settings-network-remove-description = Briše njene postavke s ovog računara
settings-network-remove = Ukloni

settings-network-general = Općenito
settings-network-autoconnect = Automatski se poveži
settings-network-autoconnect-wifi = Poveži se s ovom mrežom kad god je u dometu
settings-network-autoconnect-wired = Poveži se čim se priključi kabl
settings-network-autoconnect-vpn = Poveži se kad god je ovaj računar na mreži
settings-network-autoconnect-other = Poveži se kad god je dostupna
settings-network-all-users = Dostupno svima
    .description = Svako ko se ovdje prijavi može je koristiti
settings-network-metered = Ograničena veza
    .description = Aplikacije i ažuriranja suzdržavaju se od velikih preuzimanja
settings-network-metered-automatic = Prepoznaj automatski
settings-network-metered-yes = Ograničena
settings-network-metered-no = Neograničena

settings-network-security = Sigurnost
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
    .description = Ostavite prazno osim ako vaša mreža ne traži određenu veličinu
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Metod
    .label = Metod za { $family }
settings-network-ip-dhcp = Automatski, samo adrese
settings-network-ip-manual = Ručno
settings-network-ip-link-local = Samo lokalna veza
settings-network-ip-shared = Dijeljeno s drugim uređajima
settings-network-ip-ignore = Bez upravljanja
settings-network-ip-disabled = Isključeno
settings-network-ip-addresses = Adrese
    .description = Svaka sa svojim prefiksom, npr. { $example }
settings-network-ip-address = Adresa { $number }
settings-network-ip-remove-address = Ukloni adresu
settings-network-ip-add-address = Dodaj adresu
settings-network-ip-router = Ruter za { $family }
settings-network-ip-automatic-dns = Automatski DNS
    .description = Koristi DNS servere koje predlaže ova mreža
settings-network-ip-dns-first = Koriste se prije predloženih
settings-network-ip-dns-separate = Adrese odvojite zarezima
settings-network-ip-dns-servers = DNS serveri za { $family }
settings-network-ip-search-domains = Domene pretrage
    .description = Koriste se kada naziv nema domenu, npr. „printer“
    .label = Domene pretrage za { $family }
settings-network-ip-automatic-routes = Automatske rute
    .description = Koristi rute koje predlaže ova mreža
settings-network-ip-routes = Rute
    .description = Šalje saobraćaj za neke mreže preko drugog rutera
settings-network-ip-add-route = Dodaj rutu
settings-network-route-network = Mreža
settings-network-route-priority = Prioritet
settings-network-route-remove = Ukloni rutu

## Network: work or school (802.1X) sign-in

settings-network-eap = Autentifikacija
settings-network-eap-peap = Zaštićeni EAP (PEAP)
settings-network-eap-ttls = Tunelirani TLS (TTLS)
settings-network-eap-tls = Certifikat (TLS)
settings-network-eap-inner = Unutrašnja autentifikacija
settings-network-client-certificate = Vaš certifikat
settings-network-private-key-password = Lozinka privatnog ključa
    .placeholder = Ako je ključ ima
settings-network-anonymous-identity = Anonimni identitet
    .description = Ostavite prazno osim ako ga vaša mreža ne traži
settings-network-ca = CA certifikat
    .description = Potvrđuje da se povezujete na pravu mrežu
settings-network-ca-system = Koristi sistemske certifikate
settings-network-ca-file = Odaberi fajl…
settings-network-ca-another-file = Odaberi drugi fajl…
settings-network-ca-none = Ne provjeravaj
settings-network-choose-file = Odaberi…
settings-network-server-domain = Domena servera
    .description = Poveži se samo sa serverima u ovoj domeni

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Unesite naziv
settings-network-error-no-addresses = Dodajte barem jednu adresu
settings-network-error-address = Unesite adresu s prefiksom, npr. { $example }
settings-network-error-router = Unesite adresu rutera, npr. { $example }
settings-network-error-dns = „{ $address }“ nije ispravna adresa
settings-network-error-search-domain = „{ $domain }“ nije ispravna domena
settings-network-error-route = Unesite mrežu, npr. { $example }
settings-network-error-priority = Prioritet mora biti cijeli broj
settings-network-error-username = Unesite korisničko ime
settings-network-error-domain = Unesite domenu, npr. example.com
settings-network-error-certificate = Odaberite svoj certifikat
settings-network-error-private-key = Odaberite svoj privatni ključ
settings-network-error-mtu = Unesite broj od { $lowest } do { $highest } ili ostavite prazno
settings-network-error-mac = Unesite adresu poput 12:34:56:78:9A:BC
settings-network-error-password = Unesite lozinku
settings-network-error-password-length = { $count ->
        [one] Koristite najmanje { $count } znak
        [few] Koristite najmanje { $count } znaka
       *[other] Koristite najmanje { $count } znakova
    }

## Network: proxy

settings-network-proxy-off = Isključeno
settings-network-proxy-manual = Ručno
settings-network-proxy-url = Adresa konfiguracije
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Sigurni web (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Server
    .label = Server za { $protocol }
settings-network-proxy-port = Port
    .label = Port za { $protocol }
settings-network-proxy-skip = Ne koristi proxy za
settings-network-proxy-error-url = Unesite web adresu, npr. http://example.com/proxy.pac
settings-network-proxy-error-host = Unesite samo naziv servera, npr. proxy.example.com
settings-network-proxy-error-port = Unesite port od 1 do 65535
settings-network-proxy-save-failed = Postavke proxyja nije moguće sačuvati

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Uvezi iz fajla
    .description = WireGuard, OpenVPN i drugi fajlovi s VPN konfiguracijom
settings-network-vpn-importing = Uvoz…
settings-network-wireguard = Postavi WireGuard
    .description = Unesite podatke od svog VPN pružaoca ili servera
settings-network-wireguard-dialog = Ove podatke vam može dati vaš VPN pružalac ili vlasnik servera.
settings-network-wireguard-name-example = Kućni VPN
settings-network-wireguard-public-key = Javni ključ { $key }
settings-network-wireguard-public-key-pending = Ovdje će se pojaviti javni ključ koji možete podijeliti
settings-network-wireguard-copy = Kopiraj javni ključ
settings-network-wireguard-copied = Kopirano
settings-network-wireguard-generate = Generiši novi ključ
settings-network-wireguard-addresses = Adrese ovog računara unutar VPN-a
settings-network-wireguard-server-key = Javni ključ servera
settings-network-wireguard-endpoint = Adresa servera
settings-network-wireguard-allowed-ips = Dozvoljene IP adrese
    .description = Saobraćaj prema ovim rasponima ide kroz VPN
settings-network-wireguard-preshared-key = Unaprijed dijeljeni ključ
settings-network-wireguard-keepalive = Održavanje veze
    .description = Pomaže da veza ostane aktivna iza rutera
    .placeholder = Neobavezno, u sekundama
settings-network-wireguard-add = Dodaj
settings-network-wireguard-adding = Dodavanje…
settings-network-wireguard-error-private-key = Unesite ili generišite privatni ključ
settings-network-wireguard-error-addresses = Unesite barem jednu adresu
settings-network-wireguard-error-server-key = Unesite javni ključ servera
settings-network-wireguard-error-endpoint = Unesite adresu i port servera
settings-network-wireguard-error-allowed-ips = Unesite barem jedan raspon
settings-network-wireguard-error-keepalive = Unesite broj sekundi

## Bluetooth panel

settings-bluetooth-hardware-off = Isključeno hardverskim prekidačem
settings-bluetooth-power-on-failed = Bluetooth nije moguće uključiti
settings-bluetooth-power-off-failed = Bluetooth nije moguće isključiti
settings-bluetooth-visible = Vidljivo uređajima u blizini
    .description = Telefoni i računari mogu pronaći ovaj računar
settings-bluetooth-visible-as = Prikazuje se kao „{ $name }“
settings-bluetooth-visible-duration = Trajanje vidljivosti
settings-bluetooth-visible-for = { $minutes ->
        [one] Na { $minutes } minutu
        [few] Na { $minutes } minute
       *[other] Na { $minutes } minuta
    }
settings-bluetooth-visible-until-off = Dok se ne isključi
settings-bluetooth-visible-failed = Vidljivost ovog računara nije moguće promijeniti
settings-bluetooth-paired = Moji uređaji
settings-bluetooth-nearby = Uređaji u blizini
settings-bluetooth-searching = Traženje uređaja…
    .description = Stavite uređaj koji želite dodati u način uparivanja
settings-bluetooth-blocked = Bluetooth je isključen hardverskim prekidačem
    .description = Uključite ga prekidačem ili tipkom na računaru
settings-bluetooth-details = Detalji uređaja
settings-bluetooth-connected = Povezano
settings-bluetooth-connected-battery = Povezano · baterija { $battery }
settings-bluetooth-connecting = Povezivanje…
settings-bluetooth-disconnecting = Prekidanje veze…
settings-bluetooth-pairing = Uparivanje…
settings-bluetooth-forget-confirm = Zaboraviti „{ $name }“?
    .description = Morat ćete ga ponovo upariti da biste ga koristili s ovim računarom.
settings-bluetooth-forget = Zaboravi
settings-bluetooth-cancel = Otkaži
settings-bluetooth-connect = Poveži
settings-bluetooth-disconnect = Prekini vezu
settings-bluetooth-done = Gotovo

## Bluetooth: device details

settings-bluetooth-type = Vrsta
settings-bluetooth-battery = Baterija
settings-bluetooth-address = Adresa
settings-bluetooth-autoconnect = Automatski se poveži
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
settings-bluetooth-kind-printer = Printer
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Drugi uređaj

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = uređaj
settings-bluetooth-request-confirm = Upariti { $name }?
    .description = Provjerite prikazuje li { $name } isti kôd.
settings-bluetooth-request-authorize = Dozvoliti da se { $name } upari?
    .description = Nakon toga se { $name } može povezati s ovim računarom.
settings-bluetooth-request-pin = Unesite PIN za { $name }
    .description = Često je 0000 ili 1234. Ako nijedan ne radi, potražite ga u uputstvu za uređaj.
settings-bluetooth-request-passkey = Unesite kôd koji prikazuje { $name }
    .description = Upišite šest cifara tačno onako kako su prikazane.
settings-bluetooth-request-display = Upari { $name }
    .description = Upišite ovaj kôd u { $name }, a zatim pritisnite Enter.
settings-bluetooth-pair = Upari
settings-bluetooth-allow = Dozvoli

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Prenesite uređaje iz Windowsa
    .description = { $count ->
        [one] Uređaj { $devices } je uparen u Windowsu. Koristite ga ovdje bez ponovnog uparivanja.
        [few] Uređaji { $devices } su upareni u Windowsu. Koristite ih ovdje bez ponovnog uparivanja.
       *[other] Uređaji { $devices } su upareni u Windowsu. Koristite ih ovdje bez ponovnog uparivanja.
    }
settings-bluetooth-windows-more = { $count ->
        [one] još { $count }
        [few] još { $count }
       *[other] još { $count }
    }
