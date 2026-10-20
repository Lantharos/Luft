### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Spremi
settings-network-saving = Spremanje…
settings-network-cancel = Odustani
settings-network-connect = Poveži
settings-network-disconnect = Prekini vezu
settings-network-optional = Neobavezno
settings-network-automatic = Automatski
settings-network-name = Naziv
settings-network-password = Lozinka
settings-network-password-saved = Spremljena lozinka
settings-network-username = Korisničko ime
settings-network-router = Usmjerivač
settings-network-dns-servers = DNS poslužitelji
settings-network-private-key = Privatni ključ
settings-network-connection-settings = Postavke veze
settings-network-connect-failed = Povezivanje nije uspjelo

## Network: connection states

settings-network-link-connected = Povezano
settings-network-link-connecting = Povezivanje…
settings-network-link-disconnected = Nije povezano
settings-network-link-unplugged = Kabel nije priključen

## Network: Wi‑Fi security types

settings-network-security-open = Bez zaštite
settings-network-security-owe = Poboljšana otvorena
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Enterprise

## Network: signal and radio details

settings-network-signal-excellent = Izvrstan
settings-network-signal-good = Dobar
settings-network-signal-fair = Srednji
settings-network-signal-weak = Slab
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · kanal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Pojas
settings-network-detail-speed = Brzina veze
settings-network-detail-access-point = Pristupna točka
settings-network-detail-security = Sigurnost
settings-network-detail-ipv4 = IP adresa
settings-network-detail-ipv6 = IPv6 adresa
settings-network-detail-router = Usmjerivač
settings-network-detail-dns = DNS
settings-network-detail-mac = Hardverska adresa

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Isključeno hardverskim prekidačem
settings-network-wifi-connected = Povezano s mrežom { $network }
settings-network-airplane = Način rada u zrakoplovu
    .description = Isključuje sve bežične veze
settings-network-airplane-hardware = Uključeno hardverskim prekidačem
settings-network-known = Poznate mreže
    .description = Mreže na koje se ovo računalo već spajalo, bile u blizini ili ne
settings-network-known-count = { $count ->
        [one] { $count } spremljena mreža
        [few] { $count } spremljene mreže
       *[other] { $count } spremljenih mreža
    }
settings-network-known-in-range = U dometu
settings-network-wired = Žična mreža
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Povezano · { $speed }
settings-network-empty = Nema mrežnih veza
    .description = Priključite mrežni kabel ili Wi‑Fi adapter da biste se povezali s internetom
settings-network-proxy = Proxy
    .description = Šalje internetski promet preko drugog poslužitelja, što je često potrebno na poslovnim i školskim mrežama.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi‑Fi mreže
settings-network-wifi-saved = Spremljeno
settings-network-wifi-enterprise = Prijavite se poslovnim ili školskim računom
settings-network-wifi-connect-failed = Povezivanje s ovom mrežom nije uspjelo
settings-network-wifi-saved-password-failed = Spremljena lozinka nije prihvaćena. Unesite je ponovno.
settings-network-wifi-settings = Postavke mreže
settings-network-wifi-searching = Traženje mreža…
settings-network-hidden = Poveži se sa skrivenom mrežom
    .description = Unesite naziv mreže i način zaštite.
settings-network-hidden-name = Naziv mreže

## Network: joining a Wi‑Fi network

settings-network-join = Povezivanje s mrežom „{ $network }“
settings-network-join-enterprise = Prijavite se poslovnim ili školskim računom.
settings-network-join-password = Unesite lozinku za ovu mrežu.
settings-network-join-failed = Povezivanje s ovom mrežom nije uspjelo.
settings-network-join-sign-in-failed = Prijava nije uspjela. Provjerite korisničko ime i lozinku.
settings-network-join-wrong-password = Lozinka nije prihvaćena. Provjerite je i pokušajte ponovno.

## Network: connection settings page

settings-network-forget = Zaboravi ovu mrežu
    .description = Uklanja njezinu lozinku i postavke s ovog računala
    .button = Zaboravi
settings-network-remove-vpn = Ukloni ovu VPN vezu
settings-network-remove-connection = Ukloni ovu vezu
settings-network-remove-description = Briše njezine postavke s ovog računala
settings-network-remove = Ukloni

settings-network-general = Općenito
settings-network-autoconnect = Automatski se poveži
settings-network-autoconnect-wifi = Spaja se na ovu mrežu kad god je u dometu
settings-network-autoconnect-wired = Povezuje se čim se priključi kabel
settings-network-autoconnect-vpn = Povezuje se kad god je ovo računalo na mreži
settings-network-autoconnect-other = Povezuje se kad god je dostupna
settings-network-all-users = Dostupno svima
    .description = Može je koristiti svatko tko se ovdje prijavi
settings-network-metered = Ograničena veza
    .description = Aplikacije i ažuriranja suzdržavaju se od velikih preuzimanja
settings-network-metered-automatic = Prepoznaj automatski
settings-network-metered-yes = Ograničena
settings-network-metered-no = Neograničena

settings-network-security = Sigurnost
settings-network-security-type = Vrsta zaštite

settings-network-advanced = Napredno
settings-network-private-address = Privatna adresa
    .description = Otežava praćenje ovog računala na ovoj mreži
settings-network-hardware-address = Hardverska adresa
    .description = Adresa koju ovo računalo pokazuje mreži
settings-network-mac-random = Svaki put nova adresa
settings-network-mac-stable = Ista adresa za ovu mrežu
settings-network-mac-private-off = Isključeno
settings-network-mac-builtin = Ugrađena adresa
settings-network-mac-custom = Prilagođena adresa
settings-network-mtu = Najveća veličina paketa (MTU)
    .description = Ostavite prazno, osim ako vaša mreža traži određenu veličinu
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Način
    .label = Način za { $family }
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
settings-network-ip-router = Usmjerivač za { $family }
settings-network-ip-automatic-dns = Automatski DNS
    .description = Koristi DNS poslužitelje koje predlaže ova mreža
settings-network-ip-dns-first = Koriste se prije predloženih
settings-network-ip-dns-separate = Adrese odvojite zarezima
settings-network-ip-dns-servers = DNS poslužitelji za { $family }
settings-network-ip-search-domains = Domene pretraživanja
    .description = Isprobavaju se kad naziv nema domenu, npr. „printer“
    .label = Domene pretraživanja za { $family }
settings-network-ip-automatic-routes = Automatske rute
    .description = Koristi rute koje predlaže ova mreža
settings-network-ip-routes = Rute
    .description = Šalje promet za neke mreže preko drugog usmjerivača
settings-network-ip-add-route = Dodaj rutu
settings-network-route-network = Mreža
settings-network-route-priority = Prioritet
settings-network-route-remove = Ukloni rutu

## Network: work or school (802.1X) sign-in

settings-network-eap = Provjera autentičnosti
settings-network-eap-peap = Zaštićeni EAP (PEAP)
settings-network-eap-ttls = Tunelirani TLS (TTLS)
settings-network-eap-tls = Certifikat (TLS)
settings-network-eap-inner = Unutarnja provjera autentičnosti
settings-network-client-certificate = Vaš certifikat
settings-network-private-key-password = Lozinka privatnog ključa
    .placeholder = Ako je ključ ima
settings-network-anonymous-identity = Anonimni identitet
    .description = Ostavite prazno, osim ako ga vaša mreža traži
settings-network-ca = CA certifikat
    .description = Potvrđuje da se povezujete sa stvarnom mrežom
settings-network-ca-system = Koristi certifikate sustava
settings-network-ca-file = Odaberi datoteku…
settings-network-ca-another-file = Odaberi drugu datoteku…
settings-network-ca-none = Ne provjeravaj
settings-network-choose-file = Odaberi…
settings-network-server-domain = Domena poslužitelja
    .description = Povezuje se samo s poslužiteljima u ovoj domeni

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Unesite naziv
settings-network-error-no-addresses = Dodajte barem jednu adresu
settings-network-error-address = Unesite adresu s prefiksom, npr. { $example }
settings-network-error-router = Unesite adresu usmjerivača, npr. { $example }
settings-network-error-dns = „{ $address }“ nije valjana adresa
settings-network-error-search-domain = „{ $domain }“ nije valjana domena
settings-network-error-route = Unesite mrežu, npr. { $example }
settings-network-error-priority = Za prioritet unesite cijeli broj
settings-network-error-username = Unesite korisničko ime
settings-network-error-domain = Unesite domenu, npr. example.com
settings-network-error-certificate = Odaberite svoj certifikat
settings-network-error-private-key = Odaberite svoj privatni ključ
settings-network-error-mtu = Unesite broj od { $lowest } do { $highest } ili ostavite prazno
settings-network-error-mac = Unesite adresu poput 12:34:56:78:9A:BC
settings-network-error-password = Unesite lozinku
settings-network-error-password-length = { $count ->
        [one] Unesite barem { $count } znak
        [few] Unesite barem { $count } znaka
       *[other] Unesite barem { $count } znakova
    }

## Network: proxy

settings-network-proxy-off = Isključeno
settings-network-proxy-manual = Ručno
settings-network-proxy-url = Adresa konfiguracije
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Sigurni web (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Poslužitelj
    .label = Poslužitelj: { $protocol }
settings-network-proxy-port = Priključak
    .label = Priključak: { $protocol }
settings-network-proxy-skip = Ne koristi proxy za
settings-network-proxy-error-url = Unesite web-adresu, npr. http://example.com/proxy.pac
settings-network-proxy-error-host = Unesite samo naziv poslužitelja, npr. proxy.example.com
settings-network-proxy-error-port = Unesite priključak od 1 do 65535
settings-network-proxy-save-failed = Spremanje postavki proxyja nije uspjelo

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Uvezi iz datoteke
    .description = WireGuard, OpenVPN i druge konfiguracijske datoteke za VPN
settings-network-vpn-importing = Uvoz…
settings-network-wireguard = Postavi WireGuard
    .description = Unesite podatke od svojeg pružatelja VPN-a ili poslužitelja
settings-network-wireguard-dialog = Ove podatke može vam dati pružatelj VPN-a ili vlasnik poslužitelja.
settings-network-wireguard-name-example = Kućni VPN
settings-network-wireguard-public-key = Javni ključ { $key }
settings-network-wireguard-public-key-pending = Ovdje će se prikazati javni ključ za dijeljenje
settings-network-wireguard-copy = Kopiraj javni ključ
settings-network-wireguard-copied = Kopirano
settings-network-wireguard-generate = Generiraj novi ključ
settings-network-wireguard-addresses = Adrese ovog računala unutar VPN-a
settings-network-wireguard-server-key = Javni ključ poslužitelja
settings-network-wireguard-endpoint = Adresa poslužitelja
settings-network-wireguard-allowed-ips = Dopuštene IP adrese
    .description = Promet prema ovim rasponima ide kroz VPN
settings-network-wireguard-preshared-key = Unaprijed dijeljeni ključ
settings-network-wireguard-keepalive = Održavanje veze
    .description = Pomaže da veza ostane aktivna iza usmjerivača
    .placeholder = Neobavezno, u sekundama
settings-network-wireguard-add = Dodaj
settings-network-wireguard-adding = Dodavanje…
settings-network-wireguard-error-private-key = Unesite ili generirajte privatni ključ
settings-network-wireguard-error-addresses = Unesite barem jednu adresu
settings-network-wireguard-error-server-key = Unesite javni ključ poslužitelja
settings-network-wireguard-error-endpoint = Unesite adresu i priključak poslužitelja
settings-network-wireguard-error-allowed-ips = Unesite barem jedan raspon
settings-network-wireguard-error-keepalive = Unesite broj sekundi

## Bluetooth panel

settings-bluetooth-hardware-off = Isključeno hardverskim prekidačem
settings-bluetooth-power-on-failed = Uključivanje Bluetootha nije uspjelo
settings-bluetooth-power-off-failed = Isključivanje Bluetootha nije uspjelo
settings-bluetooth-visible = Vidljivo uređajima u blizini
    .description = Telefoni i računala mogu pronaći ovo računalo
settings-bluetooth-visible-as = Prikazuje se kao „{ $name }“
settings-bluetooth-visible-duration = Trajanje vidljivosti
settings-bluetooth-visible-for = { $minutes ->
        [one] Na { $minutes } minutu
        [few] Na { $minutes } minute
       *[other] Na { $minutes } minuta
    }
settings-bluetooth-visible-until-off = Dok se ne isključi
settings-bluetooth-visible-failed = Promjena vidljivosti ovog računala nije uspjela
settings-bluetooth-paired = Moji uređaji
settings-bluetooth-nearby = Uređaji u blizini
settings-bluetooth-searching = Traženje uređaja…
    .description = Stavite uređaj koji želite dodati u način uparivanja
settings-bluetooth-blocked = Bluetooth je isključen hardverskim prekidačem
    .description = Uključite ga prekidačem ili tipkom na računalu
settings-bluetooth-details = Pojedinosti o uređaju
settings-bluetooth-connected = Povezano
settings-bluetooth-connected-battery = Povezano · baterija { $battery }
settings-bluetooth-connecting = Povezivanje…
settings-bluetooth-disconnecting = Prekidanje veze…
settings-bluetooth-pairing = Uparivanje…
settings-bluetooth-forget-confirm = Zaboraviti „{ $name }“?
    .description = Morat ćete ga ponovno upariti da biste ga koristili s ovim računalom.
settings-bluetooth-forget = Zaboravi
settings-bluetooth-cancel = Odustani
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
settings-bluetooth-kind-keyboard = Tipkovnica
settings-bluetooth-kind-gamepad = Kontroler za igre
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Računalo
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Zaslon
settings-bluetooth-kind-printer = Pisač
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Drugi uređaj

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = uređaj
settings-bluetooth-request-confirm = Upariti { $name }?
    .description = Provjerite prikazuje li { $name } isti kod.
settings-bluetooth-request-authorize = Dopustiti da se { $name } upari?
    .description = Nakon toga { $name } moći će se povezati s ovim računalom.
settings-bluetooth-request-pin = Unesite PIN za { $name }
    .description = Često je 0000 ili 1234. Ako nijedan ne radi, potražite ga u priručniku uređaja.
settings-bluetooth-request-passkey = Unesite kod koji prikazuje { $name }
    .description = Upišite šest znamenki točno kako su prikazane.
settings-bluetooth-request-display = Uparite { $name }
    .description = Upišite ovaj kod na uređaju koji uparujete ({ $name }), a zatim pritisnite Enter.
settings-bluetooth-pair = Upari
settings-bluetooth-allow = Dopusti

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Prenesite uređaje iz sustava Windows
    .description = { $count ->
        [one] U sustavu Windows uparen je uređaj { $devices }. Koristite ga ovdje bez ponovnog uparivanja.
        [few] U sustavu Windows upareni su uređaji { $devices }. Koristite ih ovdje bez ponovnog uparivanja.
       *[other] U sustavu Windows upareni su uređaji { $devices }. Koristite ih ovdje bez ponovnog uparivanja.
    }
settings-bluetooth-windows-more = { $count ->
        [one] još { $count }
        [few] još { $count }
       *[other] još { $count }
    }

## Accounts panel

settings-accounts-unavailable = Računi nisu dostupni
    .description = Usluga računa nije instalirana na ovom računalu
settings-accounts-online = Mrežni računi
    .description = Svaki račun je mapa u mapi Cloud u vašoj osobnoj mapi, koju može otvoriti svaka aplikacija. Datoteke se preuzimaju kad ih otvorite.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud ili WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Ponovno se prijavite da biste ga nastavili koristiti
settings-accounts-paused-metered = Sinkronizacija je pauzirana na ograničenoj vezi
settings-accounts-paused-battery = Sinkronizacija je pauzirana dok je baterija pri kraju
settings-accounts-connecting = Povezivanje…
settings-accounts-offline = Izvan mreže
settings-accounts-offline-kept = Izvan mreže, zadržane datoteke i dalje su dostupne
settings-accounts-not-connected = Nije povezano
settings-accounts-syncing = { $count ->
        [one] Sinkronizira se { $count } promjena
        [few] Sinkroniziraju se { $count } promjene
       *[other] Sinkronizira se { $count } promjena
    }
settings-accounts-name = Naziv
settings-accounts-folder = Mapa
settings-accounts-server = Poslužitelj
settings-accounts-storage = Pohrana
settings-accounts-storage-used = Iskorišteno { $used } od { $total }
settings-accounts-on-device = Na ovom uređaju
settings-accounts-kept = { $count ->
        [one] Zadržana je { $count } stavka, ostalo se preuzima pri otvaranju
        [few] Zadržane su { $count } stavke, ostalo se preuzima pri otvaranju
       *[other] Zadržano je { $count } stavki, ostalo se preuzima pri otvaranju
    }
settings-accounts-on-demand = Datoteke se preuzimaju kad ih otvorite
settings-accounts-sign-in-again = Ponovno se prijavi
settings-accounts-keep = Zadrži
settings-accounts-remove = Ukloni
settings-accounts-remove-confirm = Ukloni s ovog računala
settings-accounts-removing = Uklanjanje…
settings-accounts-remove-note = Vaše datoteke ostaju u usluzi { $provider }. Promjene napravljene ovdje najprije se šalju onamo.

## Accounts: providers

settings-accounts-provider-icloud = Vaš Apple račun, potvrđen kodom s iPhonea, iPada ili Maca
settings-accounts-provider-onedrive = Osobni, poslovni ili školski Microsoftov račun, u pregledniku
settings-accounts-provider-dropbox = Dropbox račun, u pregledniku
settings-accounts-provider-nextcloud = Vaš vlastiti poslužitelj ili poslužitelj vaše organizacije
settings-accounts-provider-webdav = Bilo koji poslužitelj koji podržava WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Ponovna prijava: { $account }
settings-accounts-browser = Otvorit će se preglednik da biste se prijavili putem usluge { $provider }. Luft nikad ne vidi vašu lozinku.
settings-accounts-password-for = Unesite lozinku za { $user }.
settings-accounts-apple-account = Apple račun
settings-accounts-password = Lozinka
settings-accounts-app-password = Lozinka aplikacije
settings-accounts-user = Korisničko ime
settings-accounts-apple-note = Upotrijebite lozinku Apple računa; lozinke za određene aplikacije ovdje ne rade. Apple će zatim prikazati kod na vašem iPhoneu, iPadu ili Macu.
settings-accounts-nextcloud-browser = Otvorit će se preglednik da biste se prijavili na svoj poslužitelj i dopustili pristup Luftu.
settings-accounts-use-app-password = Upotrijebi lozinku aplikacije
settings-accounts-error-server = Unesite adresu poslužitelja
settings-accounts-error-apple-account = Unesite e-adresu Apple računa
settings-accounts-error-user = Unesite korisničko ime
settings-accounts-error-password = Unesite lozinku
settings-accounts-cancel = Odustani
settings-accounts-back = Natrag
settings-accounts-continue-in-browser = Nastavi u pregledniku
settings-accounts-sign-in = Prijava
settings-accounts-try-again = Pokušaj ponovno
settings-accounts-continue = Nastavi
settings-accounts-working = Povezivanje s uslugom { $provider }…
settings-accounts-finish-in-browser = Dovršite prijavu putem usluge { $provider } u pregledniku. Luft nikad ne vidi vašu lozinku, a ovo će se samo ažurirati kad završite.
settings-accounts-no-browser = Preglednik se nije otvorio. Kopirajte poveznicu i otvorite je u pregledniku.
settings-accounts-open-again = Ponovno otvori stranicu
settings-accounts-copy-link = Kopiraj poveznicu
settings-accounts-copied = Kopirano
settings-accounts-code = Kod za potvrdu
    .placeholder = Šesteroznamenkasti kod
settings-accounts-text-me = Pošalji mi kod SMS-om
settings-accounts-choose-phone = Na koji broj Apple treba poslati kod?
    .description = Pošalji SMS
settings-accounts-approve = Vaš Apple račun koristi naprednu zaštitu podataka. Odobrite zahtjev na iPhoneu, iPadu ili Macu kako bi ovo računalo moglo otvoriti iCloud Drive.
