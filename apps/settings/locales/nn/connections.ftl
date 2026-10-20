### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Lagre
settings-network-saving = Lagrar …
settings-network-cancel = Avbryt
settings-network-connect = Kople til
settings-network-disconnect = Kople frå
settings-network-optional = Valfritt
settings-network-automatic = Automatisk
settings-network-name = Namn
settings-network-password = Passord
settings-network-password-saved = Lagra passord
settings-network-username = Brukarnamn
settings-network-router = Ruter
settings-network-dns-servers = DNS-tenarar
settings-network-private-key = Privat nøkkel
settings-network-connection-settings = Tilkoplingsinnstillingar
settings-network-connect-failed = Kunne ikkje kople til

## Network: connection states

settings-network-link-connected = Tilkopla
settings-network-link-connecting = Koplar til …
settings-network-link-disconnected = Ikkje tilkopla
settings-network-link-unplugged = Kabelen er kopla frå

## Network: Wi‑Fi security types

settings-network-security-open = Ingen
settings-network-security-owe = Forbetra open
settings-network-security-wep = WEP
settings-network-security-psk = WPA2-Personleg
settings-network-security-sae = WPA3-Personleg
settings-network-security-enterprise = Bedrift

## Network: signal and radio details

settings-network-signal-excellent = Utmerka
settings-network-signal-good = Godt
settings-network-signal-fair = Middels
settings-network-signal-weak = Svakt
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · kanal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Band
settings-network-detail-speed = Tilkoplingsfart
settings-network-detail-access-point = Tilgangspunkt
settings-network-detail-security = Tryggleik
settings-network-detail-ipv4 = IP-adresse
settings-network-detail-ipv6 = IPv6-adresse
settings-network-detail-router = Ruter
settings-network-detail-dns = DNS
settings-network-detail-mac = Maskinvareadresse

## Network panel

settings-network-wifi = Wi-Fi
settings-network-wifi-hardware-off = Slått av med ein maskinvarebrytar
settings-network-wifi-connected = Kopla til { $network }
settings-network-airplane = Flymodus
    .description = Slår av alle trådlause tilkoplingar
settings-network-airplane-hardware = Slått på med ein maskinvarebrytar
settings-network-known = Kjende nettverk
    .description = Nettverk denne datamaskinen har vore kopla til før, anten dei er i nærleiken eller ikkje
settings-network-known-count = { $count ->
        [one] { $count } lagra nettverk
       *[other] { $count } lagra nettverk
    }
settings-network-known-in-range = Innanfor rekkjevidd
settings-network-wired = Kabla
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Tilkopla · { $speed }
settings-network-empty = Ingen nettverkstilkoplingar
    .description = Kople til ein nettverkskabel eller ein Wi-Fi-adapter for å kome på nett
settings-network-proxy = Proxy
    .description = Send nettrafikk gjennom ein annan tenar. Det trengst ofte på jobb- og skulenettverk.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi-Fi-nettverk
settings-network-wifi-saved = Lagra
settings-network-wifi-enterprise = Logg inn med ein jobb- eller skulekonto
settings-network-wifi-connect-failed = Kunne ikkje kople til dette nettverket
settings-network-wifi-saved-password-failed = Det lagra passordet fungerte ikkje. Skriv det inn på nytt.
settings-network-wifi-settings = Nettverksinnstillingar
settings-network-wifi-searching = Leitar etter nettverk …
settings-network-hidden = Kople til eit gøymt nettverk
    .description = Skriv inn namnet på nettverket og kva tryggleik det brukar.
settings-network-hidden-name = Nettverksnamn

## Network: joining a Wi‑Fi network

settings-network-join = Kople til «{ $network }»
settings-network-join-enterprise = Logg inn med jobb- eller skulekontoen din.
settings-network-join-password = Skriv inn passordet til dette nettverket.
settings-network-join-failed = Kunne ikkje kople til dette nettverket.
settings-network-join-sign-in-failed = Kunne ikkje logge inn. Sjekk brukarnamnet og passordet.
settings-network-join-wrong-password = Passordet fungerte ikkje. Sjekk det og prøv igjen.

## Network: connection settings page

settings-network-forget = Gløym dette nettverket
    .description = Fjernar passordet og innstillingane frå denne datamaskinen
    .button = Gløym
settings-network-remove-vpn = Fjern dette VPN-et
settings-network-remove-connection = Fjern denne tilkoplinga
settings-network-remove-description = Slettar innstillingane frå denne datamaskinen
settings-network-remove = Fjern

settings-network-general = Generelt
settings-network-autoconnect = Kople til automatisk
settings-network-autoconnect-wifi = Kople til dette nettverket kvar gong det er innanfor rekkjevidd
settings-network-autoconnect-wired = Kople til så snart ein kabel blir kopla til
settings-network-autoconnect-vpn = Kople til kvar gong denne datamaskinen er på nett
settings-network-autoconnect-other = Kople til kvar gong tilkoplinga er tilgjengeleg
settings-network-all-users = Tilgjengeleg for alle
    .description = Alle som loggar inn her, kan bruke tilkoplinga
settings-network-metered = Forbruksmålt tilkopling
    .description = Appar og oppdateringar ventar med store nedlastingar
settings-network-metered-automatic = Oppdag automatisk
settings-network-metered-yes = Forbruksmålt
settings-network-metered-no = Ikkje forbruksmålt

settings-network-security = Tryggleik
settings-network-security-type = Tryggleikstype

settings-network-advanced = Avansert
settings-network-private-address = Privat adresse
    .description = Gjer det vanskelegare å spore denne datamaskinen på dette nettverket
settings-network-hardware-address = Maskinvareadresse
    .description = Adressa denne datamaskinen viser til nettverket
settings-network-mac-random = Ny adresse kvar gong
settings-network-mac-stable = Same adresse for dette nettverket
settings-network-mac-private-off = Av
settings-network-mac-builtin = Innebygd adresse
settings-network-mac-custom = Eigendefinert adresse
settings-network-mtu = Største pakkestorleik (MTU)
    .description = La feltet stå tomt om ikkje nettverket ditt treng ein bestemt storleik
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Metode
    .label = { $family }-metode
settings-network-ip-dhcp = Automatisk, berre adresser
settings-network-ip-manual = Manuell
settings-network-ip-link-local = Berre lenkjelokal
settings-network-ip-shared = Delt med andre einingar
settings-network-ip-ignore = Ikkje handsama
settings-network-ip-disabled = Av
settings-network-ip-addresses = Adresser
    .description = Kvar med prefikset sitt, til dømes { $example }
settings-network-ip-address = Adresse { $number }
settings-network-ip-remove-address = Fjern adresse
settings-network-ip-add-address = Legg til adresse
settings-network-ip-router = { $family }-ruter
settings-network-ip-automatic-dns = Automatisk DNS
    .description = Bruk DNS-tenarane dette nettverket føreslår
settings-network-ip-dns-first = Blir brukte før dei føreslåtte
settings-network-ip-dns-separate = Skil adressene med komma
settings-network-ip-dns-servers = DNS-tenarar for { $family }
settings-network-ip-search-domains = Søkjedomene
    .description = Blir prøvde når eit namn ikkje har domene, til dømes «skrivar»
    .label = Søkjedomene for { $family }
settings-network-ip-automatic-routes = Automatiske ruter
    .description = Bruk rutene dette nettverket føreslår
settings-network-ip-routes = Ruter
    .description = Send trafikk til somme nettverk gjennom ein annan ruter
settings-network-ip-add-route = Legg til rute
settings-network-route-network = Nettverk
settings-network-route-priority = Prioritet
settings-network-route-remove = Fjern rute

## Network: work or school (802.1X) sign-in

settings-network-eap = Autentisering
settings-network-eap-peap = Verna EAP (PEAP)
settings-network-eap-ttls = Tunnelert TLS (TTLS)
settings-network-eap-tls = Sertifikat (TLS)
settings-network-eap-inner = Indre autentisering
settings-network-client-certificate = Sertifikatet ditt
settings-network-private-key-password = Passord for den private nøkkelen
    .placeholder = Om nøkkelen har eit
settings-network-anonymous-identity = Anonym identitet
    .description = La feltet stå tomt om ikkje nettverket ditt ber om det
settings-network-ca = CA-sertifikat
    .description = Stadfestar at du koplar til det ekte nettverket
settings-network-ca-system = Bruk systemsertifikat
settings-network-ca-file = Vel ei fil…
settings-network-ca-another-file = Vel ei anna fil…
settings-network-ca-none = Ikkje sjekk
settings-network-choose-file = Vel…
settings-network-server-domain = Tenardomene
    .description = Kople berre til tenarar i dette domenet

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Skriv inn eit namn
settings-network-error-no-addresses = Legg til minst éi adresse
settings-network-error-address = Skriv inn ei adresse med prefiks, til dømes { $example }
settings-network-error-router = Skriv inn ei ruteradresse, til dømes { $example }
settings-network-error-dns = «{ $address }» er ikkje ei gyldig adresse
settings-network-error-search-domain = «{ $domain }» er ikkje eit gyldig domene
settings-network-error-route = Skriv inn eit nettverk, til dømes { $example }
settings-network-error-priority = Bruk eit heiltal for prioriteten
settings-network-error-username = Skriv inn brukarnamnet ditt
settings-network-error-domain = Skriv inn eit domene, til dømes example.com
settings-network-error-certificate = Vel sertifikatet ditt
settings-network-error-private-key = Vel den private nøkkelen din
settings-network-error-mtu = Bruk eit tal frå { $lowest } til { $highest }, eller la feltet stå tomt
settings-network-error-mac = Skriv inn ei adresse som 12:34:56:78:9A:BC
settings-network-error-password = Skriv inn passordet ditt
settings-network-error-password-length = { $count ->
        [one] Bruk minst { $count } teikn
       *[other] Bruk minst { $count } teikn
    }

## Network: proxy

settings-network-proxy-off = Av
settings-network-proxy-manual = Manuell
settings-network-proxy-url = Konfigurasjonsadresse
settings-network-proxy-http = Nettsider (HTTP)
settings-network-proxy-https = Trygge nettsider (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Tenar
    .label = Tenar for { $protocol }
settings-network-proxy-port = Port
    .label = Port for { $protocol }
settings-network-proxy-skip = Ikkje bruk proxy for
settings-network-proxy-error-url = Skriv inn ei nettadresse, til dømes http://example.com/proxy.pac
settings-network-proxy-error-host = Skriv berre inn namnet på tenaren, til dømes proxy.example.com
settings-network-proxy-error-port = Bruk ein port frå 1 til 65535
settings-network-proxy-save-failed = Kunne ikkje lagre proxyinnstillingane

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importer frå ei fil
    .description = Konfigurasjonsfiler for WireGuard, OpenVPN og andre VPN-ar
settings-network-vpn-importing = Importerer …
settings-network-wireguard = Set opp WireGuard
    .description = Skriv inn opplysningane frå VPN-leverandøren eller tenaren din
settings-network-wireguard-dialog = VPN-leverandøren eller eigaren av tenaren kan gje deg desse opplysningane.
settings-network-wireguard-name-example = VPN heime
settings-network-wireguard-public-key = Offentleg nøkkel { $key }
settings-network-wireguard-public-key-pending = Den offentlege nøkkelen blir vist her, klar til å delast
settings-network-wireguard-copy = Kopier offentleg nøkkel
settings-network-wireguard-copied = Kopiert
settings-network-wireguard-generate = Lag ein ny nøkkel
settings-network-wireguard-addresses = Adressene til denne datamaskinen i VPN-et
settings-network-wireguard-server-key = Offentleg nøkkel for tenaren
settings-network-wireguard-endpoint = Tenaradresse
settings-network-wireguard-allowed-ips = Tillatne IP-adresser
    .description = Trafikk til desse områda går gjennom VPN-et
settings-network-wireguard-preshared-key = Førehandsdelt nøkkel
settings-network-wireguard-keepalive = Keepalive
    .description = Hjelper tilkoplinga med å halde seg oppe bak ein ruter
    .placeholder = Valfritt, i sekund
settings-network-wireguard-add = Legg til
settings-network-wireguard-adding = Leggjer til …
settings-network-wireguard-error-private-key = Skriv inn eller lag ein privat nøkkel
settings-network-wireguard-error-addresses = Skriv inn minst éi adresse
settings-network-wireguard-error-server-key = Skriv inn den offentlege nøkkelen til tenaren
settings-network-wireguard-error-endpoint = Skriv inn adressa og porten til tenaren
settings-network-wireguard-error-allowed-ips = Skriv inn minst eitt område
settings-network-wireguard-error-keepalive = Skriv inn eit tal sekund

## Bluetooth panel

settings-bluetooth-hardware-off = Slått av med ein maskinvarebrytar
settings-bluetooth-power-on-failed = Kunne ikkje slå på Bluetooth
settings-bluetooth-power-off-failed = Kunne ikkje slå av Bluetooth
settings-bluetooth-visible = Synleg for einingar i nærleiken
    .description = Lèt telefonar og datamaskinar finne denne datamaskinen
settings-bluetooth-visible-as = Vist som «{ $name }»
settings-bluetooth-visible-duration = Synleg i
settings-bluetooth-visible-for = { $minutes ->
        [one] I { $minutes } minutt
       *[other] I { $minutes } minutt
    }
settings-bluetooth-visible-until-off = Til Bluetooth blir slått av
settings-bluetooth-visible-failed = Kunne ikkje endre om denne datamaskinen er synleg
settings-bluetooth-paired = Einingane mine
settings-bluetooth-nearby = Einingar i nærleiken
settings-bluetooth-searching = Leitar etter einingar …
    .description = Set eininga du vil leggje til, i paringsmodus
settings-bluetooth-blocked = Bluetooth er slått av med ein maskinvarebrytar
    .description = Bruk brytaren eller tasten på datamaskinen for å slå det på
settings-bluetooth-details = Einingsdetaljar
settings-bluetooth-connected = Tilkopla
settings-bluetooth-connected-battery = Tilkopla · batteri { $battery }
settings-bluetooth-connecting = Koplar til …
settings-bluetooth-disconnecting = Koplar frå …
settings-bluetooth-pairing = Parar …
settings-bluetooth-forget-confirm = Gløyme «{ $name }»?
    .description = Du må pare eininga på nytt før du kan bruke ho med denne datamaskinen.
settings-bluetooth-forget = Gløym
settings-bluetooth-cancel = Avbryt
settings-bluetooth-connect = Kople til
settings-bluetooth-disconnect = Kople frå
settings-bluetooth-done = Ferdig

## Bluetooth: device details

settings-bluetooth-type = Type
settings-bluetooth-battery = Batteri
settings-bluetooth-address = Adresse
settings-bluetooth-autoconnect = Kople til automatisk
    .description = Kvar gong eininga er i nærleiken
settings-bluetooth-kind-headphones = Hovudtelefonar
settings-bluetooth-kind-speaker = Høgtalar
settings-bluetooth-kind-mouse = Mus
settings-bluetooth-kind-keyboard = Tastatur
settings-bluetooth-kind-gamepad = Spelkontroll
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Datamaskin
settings-bluetooth-kind-tablet = Nettbrett
settings-bluetooth-kind-display = Skjerm
settings-bluetooth-kind-printer = Skrivar
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Anna eining

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = eininga
settings-bluetooth-request-confirm = Vil du pare med { $name }?
    .description = Sjå til at same kode blir vist på { $name }.
settings-bluetooth-request-authorize = Tillate paring med { $name }?
    .description = Då kan { $name } kople til denne datamaskinen.
settings-bluetooth-request-pin = Skriv inn PIN-koden for { $name }
    .description = Han er ofte 0000 eller 1234. Viss ingen av dei fungerer, står han i brukarrettleiinga til eininga.
settings-bluetooth-request-passkey = Skriv inn koden som blir vist på { $name }
    .description = Skriv dei seks sifra nøyaktig slik dei står.
settings-bluetooth-request-display = Pare med { $name }
    .description = Skriv denne koden på { $name }, og trykk deretter Enter.
settings-bluetooth-pair = Par
settings-bluetooth-allow = Tillat

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Ta med einingane frå Windows
    .description = { $count ->
        [one] { $devices } er para i Windows. Bruk eininga her utan å pare på nytt.
       *[other] { $devices } er para i Windows. Bruk dei her utan å pare på nytt.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } til
       *[other] { $count } til
    }

## Accounts panel

settings-accounts-unavailable = Kontoar er ikkje tilgjengelege
    .description = Kontotenesta er ikkje installert på denne datamaskinen
settings-accounts-online = Nettkontoar
    .description = Kvar konto er ei mappe i Cloud, i heimemappa di, som alle appar kan opne. Filer blir lasta ned når du opnar dei.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud eller WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Logg inn på nytt for å bruke kontoen vidare
settings-accounts-paused-metered = Synkroniseringa er sett på pause på ei forbruksmålt tilkopling
settings-accounts-paused-battery = Synkroniseringa er sett på pause medan batteriet er lågt
settings-accounts-connecting = Koplar til …
settings-accounts-offline = Fråkopla
settings-accounts-offline-kept = Fråkopla, lokale filer er framleis tilgjengelege
settings-accounts-not-connected = Ikkje tilkopla
settings-accounts-syncing = { $count ->
        [one] Synkroniserer { $count } endring
       *[other] Synkroniserer { $count } endringar
    }
settings-accounts-name = Namn
settings-accounts-folder = Mappe
settings-accounts-server = Tenar
settings-accounts-storage = Lagring
settings-accounts-storage-used = { $used } av { $total } brukt
settings-accounts-on-device = På denne eininga
settings-accounts-kept = { $count ->
        [one] { $count } element er lagra her, resten blir lasta ned når du opnar det
       *[other] { $count } element er lagra her, resten blir lasta ned når du opnar det
    }
settings-accounts-on-demand = Filer blir lasta ned når du opnar dei
settings-accounts-sign-in-again = Logg inn på nytt
settings-accounts-keep = Behald
settings-accounts-remove = Fjern
settings-accounts-remove-confirm = Fjern frå denne datamaskinen
settings-accounts-removing = Fjernar …
settings-accounts-remove-note = Filene dine blir verande i { $provider }. Endringar du har gjort her, blir sende opp først.

## Accounts: providers

settings-accounts-provider-icloud = Apple-kontoen din, stadfesta med ein kode frå iPhone, iPad eller Mac
settings-accounts-provider-onedrive = Ein personleg Microsoft-konto eller ein jobb- eller skulekonto, i nettlesaren
settings-accounts-provider-dropbox = Ein Dropbox-konto, i nettlesaren
settings-accounts-provider-nextcloud = Din eigen tenar eller tenaren til organisasjonen din
settings-accounts-provider-webdav = Alle tenarar som støttar WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Logg inn på { $account } på nytt
settings-accounts-browser = Nettlesaren blir opna så du kan logge inn hos { $provider }. Luft ser aldri passordet ditt.
settings-accounts-password-for = Skriv inn passordet for { $user }.
settings-accounts-apple-account = Apple-konto
settings-accounts-password = Passord
settings-accounts-app-password = App-passord
settings-accounts-user = Brukarnamn
settings-accounts-apple-note = Bruk passordet til Apple-kontoen din. Appspesifikke passord fungerer ikkje her. Apple viser deretter ein kode på iPhone, iPad eller Mac.
settings-accounts-nextcloud-browser = Nettlesaren blir opna så du kan logge inn på tenaren og gje Luft tilgang.
settings-accounts-use-app-password = Bruk eit app-passord i staden
settings-accounts-error-server = Skriv inn tenaradressa
settings-accounts-error-apple-account = Skriv inn e-postadressa til Apple-kontoen din
settings-accounts-error-user = Skriv inn brukarnamnet
settings-accounts-error-password = Skriv inn passordet
settings-accounts-cancel = Avbryt
settings-accounts-back = Tilbake
settings-accounts-continue-in-browser = Hald fram i nettlesaren
settings-accounts-sign-in = Logg inn
settings-accounts-try-again = Prøv igjen
settings-accounts-continue = Hald fram
settings-accounts-working = Kontaktar { $provider } …
settings-accounts-finish-in-browser = Fullfør innlogginga hos { $provider } i nettlesaren. Luft ser aldri passordet ditt, og denne sida blir oppdatert av seg sjølv når du er ferdig.
settings-accounts-no-browser = Ingen nettlesar vart opna. Kopier lenkja og opne ho i ein nettlesar.
settings-accounts-open-again = Opne sida på nytt
settings-accounts-copy-link = Kopier lenkja
settings-accounts-copied = Kopiert
settings-accounts-code = Stadfestingskode
    .placeholder = 6-sifra kode
settings-accounts-text-me = Send meg ein kode på SMS i staden
settings-accounts-choose-phone = Kva nummer skal Apple sende koden til?
    .description = Send ein SMS
settings-accounts-approve = Apple-kontoen din brukar avansert datavern. Godkjenn førespurnaden på iPhone, iPad eller Mac for å la denne datamaskinen opne iCloud Drive.
