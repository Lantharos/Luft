### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Salvează
settings-network-saving = Se salvează…
settings-network-cancel = Anulează
settings-network-connect = Conectează
settings-network-disconnect = Deconectează
settings-network-optional = Opțional
settings-network-automatic = Automat
settings-network-name = Nume
settings-network-password = Parolă
settings-network-password-saved = Parolă salvată
settings-network-username = Nume de utilizator
settings-network-router = Router
settings-network-dns-servers = Servere DNS
settings-network-private-key = Cheie privată
settings-network-connection-settings = Setările conexiunii
settings-network-connect-failed = Conectarea nu a reușit

## Network: connection states

settings-network-link-connected = Conectat
settings-network-link-connecting = Se conectează…
settings-network-link-disconnected = Neconectat
settings-network-link-unplugged = Cablu deconectat

## Network: Wi‑Fi security types

settings-network-security-open = Fără
settings-network-security-owe = Deschisă îmbunătățită
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Enterprise

## Network: signal and radio details

settings-network-signal-excellent = Excelent
settings-network-signal-good = Bun
settings-network-signal-fair = Acceptabil
settings-network-signal-weak = Slab
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Canalul { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Semnal
settings-network-detail-band = Bandă
settings-network-detail-speed = Viteza legăturii
settings-network-detail-access-point = Punct de acces
settings-network-detail-security = Securitate
settings-network-detail-ipv4 = Adresă IP
settings-network-detail-ipv6 = Adresă IPv6
settings-network-detail-router = Router
settings-network-detail-dns = DNS
settings-network-detail-mac = Adresă hardware

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Dezactivat de un comutator hardware
settings-network-wifi-connected = Conectat la { $network }
settings-network-airplane = Mod avion
    .description = Dezactivează toate conexiunile fără fir
settings-network-airplane-hardware = Activat de un comutator hardware
settings-network-known = Rețele cunoscute
    .description = Rețelele la care s-a conectat acest computer, aflate în apropiere sau nu
settings-network-known-count = { $count ->
        [one] { $count } rețea salvată
        [few] { $count } rețele salvate
       *[other] { $count } de rețele salvate
    }
settings-network-known-in-range = În raza de acoperire
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Conectat · { $speed }
settings-network-empty = Nicio conexiune la rețea
    .description = Conectați un cablu de rețea sau un adaptor Wi‑Fi pentru a vă conecta la internet
settings-network-proxy = Proxy
    .description = Trimite traficul web printr-un alt server, adesea necesar în rețelele de la serviciu sau de la școală.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Rețele Wi‑Fi
settings-network-wifi-saved = Salvată
settings-network-wifi-enterprise = Conectați-vă cu un cont de la serviciu sau de la școală
settings-network-wifi-connect-failed = Conectarea la această rețea nu a reușit
settings-network-wifi-saved-password-failed = Parola salvată nu a funcționat. Introduceți-o din nou.
settings-network-wifi-settings = Setările rețelei
settings-network-wifi-searching = Se caută rețele…
settings-network-hidden = Conectare la o rețea ascunsă
    .description = Introduceți numele rețelei și tipul de securitate.
settings-network-hidden-name = Numele rețelei

## Network: joining a Wi‑Fi network

settings-network-join = Conectare la „{ $network }”
settings-network-join-enterprise = Conectați-vă cu contul de la serviciu sau de la școală.
settings-network-join-password = Introduceți parola acestei rețele.
settings-network-join-failed = Conectarea la această rețea nu a reușit.
settings-network-join-sign-in-failed = Conectarea nu a reușit. Verificați numele de utilizator și parola.
settings-network-join-wrong-password = Parola nu a funcționat. Verificați-o și încercați din nou.

## Network: connection settings page

settings-network-forget = Elimină această rețea
    .description = Șterge parola și setările ei de pe acest computer
    .button = Elimină
settings-network-remove-vpn = Elimină această rețea VPN
settings-network-remove-connection = Elimină această conexiune
settings-network-remove-description = Șterge setările ei de pe acest computer
settings-network-remove = Elimină

settings-network-general = General
settings-network-autoconnect = Conectare automată
settings-network-autoconnect-wifi = Se conectează la această rețea ori de câte ori este în raza de acoperire
settings-network-autoconnect-wired = Se conectează imediat ce este introdus un cablu
settings-network-autoconnect-vpn = Se conectează ori de câte ori acest computer este online
settings-network-autoconnect-other = Se conectează ori de câte ori este disponibilă
settings-network-all-users = Disponibilă pentru toți
    .description = Oricine se conectează pe acest computer o poate folosi
settings-network-metered = Conexiune contorizată
    .description = Aplicațiile și actualizările amână descărcările mari
settings-network-metered-automatic = Detectează automat
settings-network-metered-yes = Contorizată
settings-network-metered-no = Necontorizată

settings-network-security = Securitate
settings-network-security-type = Tip de securitate

settings-network-advanced = Avansat
settings-network-private-address = Adresă privată
    .description = Face ca acest computer să fie mai greu de urmărit în această rețea
settings-network-hardware-address = Adresă hardware
    .description = Adresa pe care acest computer o arată rețelei
settings-network-mac-random = Adresă nouă de fiecare dată
settings-network-mac-stable = Aceeași adresă pentru această rețea
settings-network-mac-private-off = Dezactivată
settings-network-mac-builtin = Adresa integrată
settings-network-mac-custom = Adresă personalizată
settings-network-mtu = Dimensiunea maximă a pachetului (MTU)
    .description = Lăsați câmpul gol dacă rețeaua nu are nevoie de o anumită dimensiune
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Metodă
    .label = Metodă { $family }
settings-network-ip-dhcp = Automat, doar adrese
settings-network-ip-manual = Manual
settings-network-ip-link-local = Doar link-local
settings-network-ip-shared = Partajată cu alte dispozitive
settings-network-ip-ignore = Negestionată
settings-network-ip-disabled = Dezactivată
settings-network-ip-addresses = Adrese
    .description = Fiecare cu prefixul ei, de exemplu { $example }
settings-network-ip-address = Adresa { $number }
settings-network-ip-remove-address = Elimină adresa
settings-network-ip-add-address = Adaugă o adresă
settings-network-ip-router = Router { $family }
settings-network-ip-automatic-dns = DNS automat
    .description = Folosește serverele DNS sugerate de această rețea
settings-network-ip-dns-first = Folosite înaintea celor sugerate
settings-network-ip-dns-separate = Separați adresele prin virgule
settings-network-ip-dns-servers = Servere DNS { $family }
settings-network-ip-search-domains = Domenii de căutare
    .description = Încercate când un nume nu are domeniu, de exemplu „printer”
    .label = Domenii de căutare { $family }
settings-network-ip-automatic-routes = Rute automate
    .description = Folosește rutele sugerate de această rețea
settings-network-ip-routes = Rute
    .description = Trimite traficul pentru anumite rețele printr-un alt router
settings-network-ip-add-route = Adaugă o rută
settings-network-route-network = Rețea
settings-network-route-priority = Prioritate
settings-network-route-remove = Elimină ruta

## Network: work or school (802.1X) sign-in

settings-network-eap = Autentificare
settings-network-eap-peap = EAP protejat (PEAP)
settings-network-eap-ttls = TLS tunelat (TTLS)
settings-network-eap-tls = Certificat (TLS)
settings-network-eap-inner = Autentificare internă
settings-network-client-certificate = Certificatul personal
settings-network-private-key-password = Parola cheii private
    .placeholder = Dacă cheia are una
settings-network-anonymous-identity = Identitate anonimă
    .description = Lăsați câmpul gol dacă rețeaua nu o cere
settings-network-ca = Certificat CA
    .description = Confirmă că vă conectați la rețeaua reală
settings-network-ca-system = Folosește certificatele sistemului
settings-network-ca-file = Alege un fișier…
settings-network-ca-another-file = Alege alt fișier…
settings-network-ca-none = Nu verifica
settings-network-choose-file = Alege…
settings-network-server-domain = Domeniul serverului
    .description = Conectare doar la servere din acest domeniu

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Introduceți un nume
settings-network-error-no-addresses = Adăugați cel puțin o adresă
settings-network-error-address = Introduceți o adresă cu prefixul ei, de exemplu { $example }
settings-network-error-router = Introduceți adresa unui router, de exemplu { $example }
settings-network-error-dns = „{ $address }” nu este o adresă validă
settings-network-error-search-domain = „{ $domain }” nu este un domeniu valid
settings-network-error-route = Introduceți o rețea, de exemplu { $example }
settings-network-error-priority = Folosiți un număr întreg pentru prioritate
settings-network-error-username = Introduceți numele de utilizator
settings-network-error-domain = Introduceți un domeniu, de exemplu example.com
settings-network-error-certificate = Alegeți certificatul
settings-network-error-private-key = Alegeți cheia privată
settings-network-error-mtu = Folosiți un număr între { $lowest } și { $highest } sau lăsați câmpul gol
settings-network-error-mac = Introduceți o adresă de forma 12:34:56:78:9A:BC
settings-network-error-password = Introduceți parola
settings-network-error-password-length = { $count ->
        [one] Folosiți cel puțin { $count } caracter
        [few] Folosiți cel puțin { $count } caractere
       *[other] Folosiți cel puțin { $count } de caractere
    }

## Network: proxy

settings-network-proxy-off = Dezactivat
settings-network-proxy-manual = Manual
settings-network-proxy-url = Adresa de configurare
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Web securizat (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Server
    .label = Server { $protocol }
settings-network-proxy-port = Port
    .label = Port { $protocol }
settings-network-proxy-skip = Nu folosi proxy pentru
settings-network-proxy-error-url = Introduceți o adresă web, de exemplu http://example.com/proxy.pac
settings-network-proxy-error-host = Introduceți doar numele serverului, de exemplu proxy.example.com
settings-network-proxy-error-port = Folosiți un port între 1 și 65535
settings-network-proxy-save-failed = Setările proxy nu au putut fi salvate

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importă dintr-un fișier
    .description = Fișiere de configurare WireGuard, OpenVPN și alte fișiere VPN
settings-network-vpn-importing = Se importă…
settings-network-wireguard = Configurează WireGuard
    .description = Introduceți datele primite de la furnizorul VPN sau de pe server
settings-network-wireguard-dialog = Aceste date le puteți primi de la furnizorul VPN sau de la administratorul serverului.
settings-network-wireguard-name-example = VPN acasă
settings-network-wireguard-public-key = Cheie publică { $key }
settings-network-wireguard-public-key-pending = Cheia publică pe care o veți partaja apare aici
settings-network-wireguard-copy = Copiază cheia publică
settings-network-wireguard-copied = Copiată
settings-network-wireguard-generate = Generează o cheie nouă
settings-network-wireguard-addresses = Adresele acestui computer în VPN
settings-network-wireguard-server-key = Cheia publică a serverului
settings-network-wireguard-endpoint = Adresa serverului
settings-network-wireguard-allowed-ips = IP-uri permise
    .description = Traficul către aceste intervale trece prin VPN
settings-network-wireguard-preshared-key = Cheie predistribuită
settings-network-wireguard-keepalive = Keepalive
    .description = Ajută conexiunea să rămână activă în spatele unui router
    .placeholder = Opțional, în secunde
settings-network-wireguard-add = Adaugă
settings-network-wireguard-adding = Se adaugă…
settings-network-wireguard-error-private-key = Introduceți sau generați o cheie privată
settings-network-wireguard-error-addresses = Introduceți cel puțin o adresă
settings-network-wireguard-error-server-key = Introduceți cheia publică a serverului
settings-network-wireguard-error-endpoint = Introduceți adresa și portul serverului
settings-network-wireguard-error-allowed-ips = Introduceți cel puțin un interval
settings-network-wireguard-error-keepalive = Introduceți un număr de secunde

## Bluetooth panel

settings-bluetooth-hardware-off = Dezactivat de un comutator hardware
settings-bluetooth-power-on-failed = Bluetooth nu a putut fi activat
settings-bluetooth-power-off-failed = Bluetooth nu a putut fi dezactivat
settings-bluetooth-visible = Vizibil pentru dispozitivele din apropiere
    .description = Telefoanele și computerele îl pot găsi pe acesta
settings-bluetooth-visible-as = Afișat ca „{ $name }”
settings-bluetooth-visible-duration = Rămâne vizibil
settings-bluetooth-visible-for = { $minutes ->
        [one] Timp de { $minutes } minut
        [few] Timp de { $minutes } minute
       *[other] Timp de { $minutes } de minute
    }
settings-bluetooth-visible-until-off = Până la dezactivare
settings-bluetooth-visible-failed = Vizibilitatea acestui computer nu a putut fi schimbată
settings-bluetooth-paired = Dispozitivele mele
settings-bluetooth-nearby = Dispozitive din apropiere
settings-bluetooth-searching = Se caută dispozitive…
    .description = Puneți dispozitivul pe care vreți să-l adăugați în modul de asociere
settings-bluetooth-blocked = Bluetooth este dezactivat de un comutator hardware
    .description = Folosiți comutatorul sau tasta de pe computer pentru a-l activa
settings-bluetooth-details = Detaliile dispozitivului
settings-bluetooth-connected = Conectat
settings-bluetooth-connected-battery = Conectat · baterie { $battery }
settings-bluetooth-connecting = Se conectează…
settings-bluetooth-disconnecting = Se deconectează…
settings-bluetooth-pairing = Se asociază…
settings-bluetooth-forget-confirm = Eliminați „{ $name }”?
    .description = Va trebui să-l asociați din nou pentru a-l folosi cu acest computer.
settings-bluetooth-forget = Elimină
settings-bluetooth-cancel = Anulează
settings-bluetooth-connect = Conectează
settings-bluetooth-disconnect = Deconectează
settings-bluetooth-done = Gata

## Bluetooth: device details

settings-bluetooth-type = Tip
settings-bluetooth-battery = Baterie
settings-bluetooth-address = Adresă
settings-bluetooth-autoconnect = Conectare automată
    .description = Ori de câte ori este în apropiere
settings-bluetooth-kind-headphones = Căști
settings-bluetooth-kind-speaker = Difuzor
settings-bluetooth-kind-mouse = Mouse
settings-bluetooth-kind-keyboard = Tastatură
settings-bluetooth-kind-gamepad = Controller de jocuri
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Computer
settings-bluetooth-kind-tablet = Tabletă
settings-bluetooth-kind-display = Ecran
settings-bluetooth-kind-printer = Imprimantă
settings-bluetooth-kind-camera = Cameră
settings-bluetooth-kind-other = Alt dispozitiv

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = dispozitivul
settings-bluetooth-request-confirm = Asociați cu { $name }?
    .description = Verificați dacă pe { $name } apare același cod.
settings-bluetooth-request-authorize = Permiteți asocierea cu { $name }?
    .description = { $name } se va putea conecta la acest computer.
settings-bluetooth-request-pin = Introduceți PIN-ul pentru { $name }
    .description = De obicei este 0000 sau 1234. Dacă niciunul nu funcționează, îl găsiți în manualul dispozitivului.
settings-bluetooth-request-passkey = Introduceți codul afișat pe { $name }
    .description = Tastați cele șase cifre exact cum apar.
settings-bluetooth-request-display = Asociere cu { $name }
    .description = Tastați acest cod pe { $name }, apoi apăsați Enter.
settings-bluetooth-pair = Asociază
settings-bluetooth-allow = Permite

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Preluați dispozitivele din Windows
    .description = { $count ->
        [one] { $devices } este asociat în Windows. Folosiți-l aici fără a-l asocia din nou.
        [few] { $devices } sunt asociate în Windows. Folosiți-le aici fără a le asocia din nou.
       *[other] { $devices } sunt asociate în Windows. Folosiți-le aici fără a le asocia din nou.
    }
settings-bluetooth-windows-more = { $count ->
        [one] încă { $count }
        [few] încă { $count }
       *[other] încă { $count }
    }
