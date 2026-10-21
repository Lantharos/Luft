### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Shrani
settings-network-saving = Shranjevanje …
settings-network-cancel = Prekliči
settings-network-connect = Poveži
settings-network-disconnect = Prekini povezavo
settings-network-optional = Neobvezno
settings-network-automatic = Samodejno
settings-network-name = Ime
settings-network-password = Geslo
settings-network-password-saved = Shranjeno geslo
settings-network-username = Uporabniško ime
settings-network-router = Usmerjevalnik
settings-network-dns-servers = Strežniki DNS
settings-network-private-key = Zasebni ključ
settings-network-connection-settings = Nastavitve povezave
settings-network-connect-failed = Povezava ni uspela

## Network: connection states

settings-network-link-connected = Povezano
settings-network-link-connecting = Povezovanje …
settings-network-link-disconnected = Ni povezano
settings-network-link-unplugged = Kabel ni priključen

## Network: Wi‑Fi security types

settings-network-security-open = Brez
settings-network-security-owe = Izboljšano odprto
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Podjetniško

## Network: signal and radio details

settings-network-signal-excellent = Odličen
settings-network-signal-good = Dober
settings-network-signal-fair = Zadosten
settings-network-signal-weak = Šibek
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · kanal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Pas
settings-network-detail-speed = Hitrost povezave
settings-network-detail-access-point = Dostopna točka
settings-network-detail-security = Zaščita
settings-network-detail-ipv4 = Naslov IP
settings-network-detail-ipv6 = Naslov IPv6
settings-network-detail-router = Usmerjevalnik
settings-network-detail-dns = DNS
settings-network-detail-mac = Strojni naslov

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Izklopljeno s strojnim stikalom
settings-network-wifi-connected = Povezano z omrežjem { $network }
settings-network-airplane = Način za letalo
    .description = Izklopi vse brezžične povezave
settings-network-airplane-hardware = Vklopljeno s strojnim stikalom
settings-network-known = Znana omrežja
    .description = Omrežja, s katerimi je bil ta računalnik že povezan, v dosegu ali ne
settings-network-known-count = { $count ->
        [one] { $count } shranjeno omrežje
        [two] { $count } shranjeni omrežji
        [few] { $count } shranjena omrežja
       *[other] { $count } shranjenih omrežij
    }
settings-network-known-in-range = V dosegu
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Povezano · { $speed }
settings-network-empty = Ni omrežnih povezav
    .description = Za dostop do interneta priključite omrežni kabel ali vmesnik Wi‑Fi
settings-network-proxy = Posredniški strežnik
    .description = Spletni promet gre prek drugega strežnika, kar je pogosto potrebno v službenih ali šolskih omrežjih.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Omrežja Wi‑Fi
settings-network-wifi-saved = Shranjeno
settings-network-wifi-enterprise = Prijava s službenim ali šolskim računom
settings-network-wifi-connect-failed = Povezava s tem omrežjem ni uspela
settings-network-wifi-saved-password-failed = Shranjeno geslo ni delovalo. Vnesite ga znova.
settings-network-wifi-settings = Nastavitve omrežja
settings-network-wifi-searching = Iskanje omrežij …
settings-network-hidden = Poveži se s skritim omrežjem
    .description = Vnesite ime omrežja in način zaščite.
settings-network-hidden-name = Ime omrežja

## Network: joining a Wi‑Fi network

settings-network-join = Povezava z omrežjem „{ $network }“
settings-network-join-enterprise = Prijavite se s službenim ali šolskim računom.
settings-network-join-password = Vnesite geslo za to omrežje.
settings-network-join-failed = Povezava s tem omrežjem ni uspela.
settings-network-join-sign-in-failed = Prijava ni uspela. Preverite uporabniško ime in geslo.
settings-network-join-wrong-password = Geslo ni pravilno. Preverite ga in poskusite znova.

## Network: connection settings page

settings-network-forget = Pozabi to omrežje
    .description = Odstrani njegovo geslo in nastavitve iz tega računalnika
    .button = Pozabi
settings-network-remove-vpn = Odstrani ta VPN
settings-network-remove-connection = Odstrani to povezavo
settings-network-remove-description = Izbriše nastavitve iz tega računalnika
settings-network-remove = Odstrani

settings-network-general = Splošno
settings-network-autoconnect = Samodejno poveži
settings-network-autoconnect-wifi = Poveži se s tem omrežjem, ko je v dosegu
settings-network-autoconnect-wired = Poveži, takoj ko je priključen kabel
settings-network-autoconnect-vpn = Poveži, kadar je ta računalnik v spletu
settings-network-autoconnect-other = Poveži, kadar je na voljo
settings-network-all-users = Na voljo vsem
    .description = Vsakomur, ki se prijavi v ta računalnik
settings-network-metered = Merjena povezava
    .description = Aplikacije in posodobitve omejijo velike prenose
settings-network-metered-automatic = Samodejno zaznaj
settings-network-metered-yes = Merjena
settings-network-metered-no = Nemerjena

settings-network-security = Zaščita
settings-network-security-type = Vrsta zaščite

settings-network-advanced = Napredno
settings-network-private-address = Zasebni naslov
    .description = Oteži sledenje temu računalniku v tem omrežju
settings-network-hardware-address = Strojni naslov
    .description = Naslov, ki ga ta računalnik pokaže omrežju
settings-network-mac-random = Vsakič nov naslov
settings-network-mac-stable = Isti naslov za to omrežje
settings-network-mac-private-off = Izklopljeno
settings-network-mac-builtin = Vgrajeni naslov
settings-network-mac-custom = Naslov po meri
settings-network-mtu = Največja velikost paketa (MTU)
    .description = Pustite prazno, razen če omrežje zahteva določeno velikost
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Način
    .label = Način { $family }
settings-network-ip-dhcp = Samodejno, samo naslovi
settings-network-ip-manual = Ročno
settings-network-ip-link-local = Samo lokalna povezava
settings-network-ip-shared = V skupni rabi z drugimi napravami
settings-network-ip-ignore = Ni upravljano
settings-network-ip-disabled = Izklopljeno
settings-network-ip-addresses = Naslovi
    .description = Vsak s svojo predpono, na primer { $example }
settings-network-ip-address = Naslov { $number }
settings-network-ip-remove-address = Odstrani naslov
settings-network-ip-add-address = Dodaj naslov
settings-network-ip-router = Usmerjevalnik { $family }
settings-network-ip-automatic-dns = Samodejni DNS
    .description = Uporabi strežnike DNS, ki jih predlaga to omrežje
settings-network-ip-dns-first = Uporabijo se pred predlaganimi
settings-network-ip-dns-separate = Naslove ločite z vejicami
settings-network-ip-dns-servers = Strežniki DNS { $family }
settings-network-ip-search-domains = Iskalne domene
    .description = Uporabijo se, ko ime nima domene, na primer „tiskalnik“
    .label = Iskalne domene { $family }
settings-network-ip-automatic-routes = Samodejne poti
    .description = Uporabi poti, ki jih predlaga to omrežje
settings-network-ip-routes = Poti
    .description = Promet za nekatera omrežja gre prek drugega usmerjevalnika
settings-network-ip-add-route = Dodaj pot
settings-network-route-network = Omrežje
settings-network-route-priority = Prednost
settings-network-route-remove = Odstrani pot

## Network: work or school (802.1X) sign-in

settings-network-eap = Preverjanje pristnosti
settings-network-eap-peap = Zaščiteni EAP (PEAP)
settings-network-eap-ttls = Tunelirani TLS (TTLS)
settings-network-eap-tls = Potrdilo (TLS)
settings-network-eap-inner = Notranje preverjanje pristnosti
settings-network-client-certificate = Vaše potrdilo
settings-network-private-key-password = Geslo zasebnega ključa
    .placeholder = Če ga ključ ima
settings-network-anonymous-identity = Anonimna identiteta
    .description = Pustite prazno, razen če omrežje to zahteva
settings-network-ca = Potrdilo overitelja (CA)
    .description = Potrdi, da se povezujete s pravim omrežjem
settings-network-ca-system = Uporabi sistemska potrdila
settings-network-ca-file = Izberi datoteko …
settings-network-ca-another-file = Izberi drugo datoteko …
settings-network-ca-none = Ne preverjaj
settings-network-choose-file = Izberi …
settings-network-server-domain = Domena strežnika
    .description = Poveži se samo s strežniki v tej domeni

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Vnesite ime
settings-network-error-no-addresses = Dodajte vsaj en naslov
settings-network-error-address = Vnesite naslov s predpono, na primer { $example }
settings-network-error-router = Vnesite naslov usmerjevalnika, na primer { $example }
settings-network-error-dns = „{ $address }“ ni veljaven naslov
settings-network-error-search-domain = „{ $domain }“ ni veljavna domena
settings-network-error-route = Vnesite omrežje, na primer { $example }
settings-network-error-priority = Za prednost uporabite celo število
settings-network-error-username = Vnesite uporabniško ime
settings-network-error-domain = Vnesite domeno, na primer example.com
settings-network-error-certificate = Izberite svoje potrdilo
settings-network-error-private-key = Izberite svoj zasebni ključ
settings-network-error-mtu = Uporabite število od { $lowest } do { $highest } ali pustite prazno
settings-network-error-mac = Vnesite naslov, na primer 12:34:56:78:9A:BC
settings-network-error-password = Vnesite geslo
settings-network-error-password-length = { $count ->
        [one] Uporabite vsaj { $count } znak
        [two] Uporabite vsaj { $count } znaka
        [few] Uporabite vsaj { $count } znake
       *[other] Uporabite vsaj { $count } znakov
    }

## Network: proxy

settings-network-proxy-off = Izklopljeno
settings-network-proxy-manual = Ročno
settings-network-proxy-url = Naslov nastavitvene datoteke
settings-network-proxy-http = Splet (HTTP)
settings-network-proxy-https = Varni splet (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Strežnik
    .label = Strežnik za { $protocol }
settings-network-proxy-port = Vrata
    .label = Vrata za { $protocol }
settings-network-proxy-skip = Ne uporabljaj posredniškega strežnika za
settings-network-proxy-error-url = Vnesite spletni naslov, na primer http://example.com/proxy.pac
settings-network-proxy-error-host = Vnesite samo ime strežnika, na primer proxy.example.com
settings-network-proxy-error-port = Uporabite vrata od 1 do 65535
settings-network-proxy-save-failed = Nastavitev posredniškega strežnika ni bilo mogoče shraniti

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Uvozi iz datoteke
    .description = Datoteke z nastavitvami za WireGuard, OpenVPN in druge VPN-je
settings-network-vpn-importing = Uvažanje …
settings-network-wireguard = Nastavi WireGuard
    .description = Vnesite podatke ponudnika VPN-ja ali strežnika
settings-network-wireguard-dialog = Te podatke vam lahko da ponudnik VPN-ja ali lastnik strežnika.
settings-network-wireguard-name-example = Domači VPN
settings-network-wireguard-public-key = Javni ključ { $key }
settings-network-wireguard-public-key-pending = Tu se bo prikazal javni ključ, ki ga lahko delite
settings-network-wireguard-copy = Kopiraj javni ključ
settings-network-wireguard-copied = Kopirano
settings-network-wireguard-generate = Ustvari nov ključ
settings-network-wireguard-addresses = Naslovi tega računalnika v VPN-ju
settings-network-wireguard-server-key = Javni ključ strežnika
settings-network-wireguard-endpoint = Naslov strežnika
settings-network-wireguard-allowed-ips = Dovoljeni naslovi IP
    .description = Promet v te obsege gre prek VPN-ja
settings-network-wireguard-preshared-key = Vnaprej deljeni ključ
settings-network-wireguard-keepalive = Ohranjanje povezave
    .description = Pomaga ohraniti povezavo za usmerjevalnikom
    .placeholder = Neobvezno, v sekundah
settings-network-wireguard-add = Dodaj
settings-network-wireguard-adding = Dodajanje …
settings-network-wireguard-error-private-key = Vnesite ali ustvarite zasebni ključ
settings-network-wireguard-error-addresses = Vnesite vsaj en naslov
settings-network-wireguard-error-server-key = Vnesite javni ključ strežnika
settings-network-wireguard-error-endpoint = Vnesite naslov in vrata strežnika
settings-network-wireguard-error-allowed-ips = Vnesite vsaj en obseg
settings-network-wireguard-error-keepalive = Vnesite število sekund

## Bluetooth panel

settings-bluetooth-hardware-off = Izklopljeno s strojnim stikalom
settings-bluetooth-power-on-failed = Vmesnika Bluetooth ni bilo mogoče vklopiti
settings-bluetooth-power-off-failed = Vmesnika Bluetooth ni bilo mogoče izklopiti
settings-bluetooth-visible = Vidno napravam v bližini
    .description = Telefoni in računalniki lahko najdejo ta računalnik
settings-bluetooth-visible-as = Prikazano kot „{ $name }“
settings-bluetooth-visible-duration = Trajanje vidnosti
settings-bluetooth-visible-for = { $minutes ->
        [one] Za { $minutes } minuto
        [two] Za { $minutes } minuti
        [few] Za { $minutes } minute
       *[other] Za { $minutes } minut
    }
settings-bluetooth-visible-until-off = Do izklopa
settings-bluetooth-visible-failed = Vidnosti tega računalnika ni bilo mogoče spremeniti
settings-bluetooth-paired = Moje naprave
settings-bluetooth-nearby = Naprave v bližini
settings-bluetooth-searching = Iskanje naprav …
    .description = Napravo, ki jo želite dodati, preklopite v način seznanjanja
settings-bluetooth-blocked = Bluetooth je izklopljen s strojnim stikalom
    .description = Vklopite ga s stikalom ali tipko na računalniku
settings-bluetooth-details = Podrobnosti naprave
settings-bluetooth-connected = Povezano
settings-bluetooth-connected-battery = Povezano · baterija { $battery }
settings-bluetooth-connecting = Povezovanje …
settings-bluetooth-disconnecting = Prekinjanje povezave …
settings-bluetooth-pairing = Seznanjanje …
settings-bluetooth-forget-confirm = Želite pozabiti napravo „{ $name }“?
    .description = Če jo boste želeli uporabljati s tem računalnikom, jo boste morali znova seznaniti.
settings-bluetooth-forget = Pozabi
settings-bluetooth-cancel = Prekliči
settings-bluetooth-connect = Poveži
settings-bluetooth-disconnect = Prekini povezavo
settings-bluetooth-done = Končano

## Bluetooth: device details

settings-bluetooth-type = Vrsta
settings-bluetooth-battery = Baterija
settings-bluetooth-address = Naslov
settings-bluetooth-autoconnect = Samodejno poveži
    .description = Kadar je v bližini
settings-bluetooth-kind-headphones = Slušalke
settings-bluetooth-kind-speaker = Zvočnik
settings-bluetooth-kind-mouse = Miška
settings-bluetooth-kind-keyboard = Tipkovnica
settings-bluetooth-kind-gamepad = Igralni plošček
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Računalnik
settings-bluetooth-kind-tablet = Tablični računalnik
settings-bluetooth-kind-display = Zaslon
settings-bluetooth-kind-printer = Tiskalnik
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Druga naprava

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = naprava
settings-bluetooth-request-confirm = Ali naj se { $name } seznani s tem računalnikom?
    .description = Preverite, ali { $name } prikazuje enako kodo.
settings-bluetooth-request-authorize = Ali dovolite, da se { $name } seznani?
    .description = Naprava se bo lahko povezala s tem računalnikom.
settings-bluetooth-request-pin = Vnesite PIN, ki ga zahteva { $name }
    .description = Pogosto je 0000 ali 1234. Če nobena ne deluje, ga poiščite v priročniku naprave.
settings-bluetooth-request-passkey = Vnesite kodo, ki jo prikazuje { $name }
    .description = Vnesite šest števk natanko tako, kot so prikazane.
settings-bluetooth-request-display = Seznanjanje: { $name }
    .description = To kodo vnesite na napravi in pritisnite Enter.
settings-bluetooth-pair = Seznani
settings-bluetooth-allow = Dovoli

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Prenesite naprave iz sistema Windows
    .description = { $count ->
        [one] Naprava { $devices } je seznanjena v sistemu Windows. Tukaj jo lahko uporabljate brez vnovičnega seznanjanja.
        [two] Napravi { $devices } sta seznanjeni v sistemu Windows. Tukaj ju lahko uporabljate brez vnovičnega seznanjanja.
        [few] Naprave { $devices } so seznanjene v sistemu Windows. Tukaj jih lahko uporabljate brez vnovičnega seznanjanja.
       *[other] Naprave { $devices } so seznanjene v sistemu Windows. Tukaj jih lahko uporabljate brez vnovičnega seznanjanja.
    }
settings-bluetooth-windows-more = { $count ->
        [one] še { $count }
        [two] še { $count }
        [few] še { $count }
       *[other] še { $count }
    }
