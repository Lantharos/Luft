### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Lagre
settings-network-saving = Lagrer…
settings-network-cancel = Avbryt
settings-network-connect = Koble til
settings-network-disconnect = Koble fra
settings-network-optional = Valgfritt
settings-network-automatic = Automatisk
settings-network-name = Navn
settings-network-password = Passord
settings-network-password-saved = Lagret passord
settings-network-username = Brukernavn
settings-network-router = Ruter
settings-network-dns-servers = DNS-servere
settings-network-private-key = Privat nøkkel
settings-network-connection-settings = Tilkoblingsinnstillinger
settings-network-connect-failed = Kunne ikke koble til

## Network: connection states

settings-network-link-connected = Tilkoblet
settings-network-link-connecting = Kobler til…
settings-network-link-disconnected = Ikke tilkoblet
settings-network-link-unplugged = Kabelen er koblet fra

## Network: Wi‑Fi security types

settings-network-security-open = Ingen
settings-network-security-owe = Forbedret åpen
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Bedrift

## Network: signal and radio details

settings-network-signal-excellent = Utmerket
settings-network-signal-good = God
settings-network-signal-fair = Middels
settings-network-signal-weak = Svak
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Kanal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Bånd
settings-network-detail-speed = Koblingshastighet
settings-network-detail-access-point = Tilgangspunkt
settings-network-detail-security = Sikkerhet
settings-network-detail-ipv4 = IP-adresse
settings-network-detail-ipv6 = IPv6-adresse
settings-network-detail-router = Ruter
settings-network-detail-dns = DNS
settings-network-detail-mac = Maskinvareadresse

## Network panel

settings-network-wifi = Wi-Fi
settings-network-wifi-hardware-off = Slått av med en maskinvarebryter
settings-network-wifi-connected = Koblet til { $network }
settings-network-airplane = Flymodus
    .description = Slår av alle trådløse tilkoblinger
settings-network-airplane-hardware = Slått på med en maskinvarebryter
settings-network-known = Kjente nettverk
    .description = Nettverk denne datamaskinen har koblet til før, i nærheten eller ikke
settings-network-known-count = { $count ->
        [one] { $count } lagret nettverk
       *[other] { $count } lagrede nettverk
    }
settings-network-known-in-range = Innen rekkevidde
settings-network-wired = Kablet
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Tilkoblet · { $speed }
settings-network-empty = Ingen nettverkstilkoblinger
    .description = Koble til en nettverkskabel eller en Wi-Fi-adapter for å komme på nett
settings-network-proxy = Proxy
    .description = Send nettrafikk gjennom en annen server. Dette trengs ofte på jobb- eller skolenettverk.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi-Fi-nettverk
settings-network-wifi-saved = Lagret
settings-network-wifi-enterprise = Logg inn med en jobb- eller skolekonto
settings-network-wifi-connect-failed = Kunne ikke koble til dette nettverket
settings-network-wifi-saved-password-failed = Det lagrede passordet virket ikke. Skriv det inn på nytt.
settings-network-wifi-settings = Nettverksinnstillinger
settings-network-wifi-searching = Ser etter nettverk…
settings-network-hidden = Koble til et skjult nettverk
    .description = Skriv inn navnet på nettverket og hvordan det er sikret.
settings-network-hidden-name = Nettverksnavn

## Network: joining a Wi‑Fi network

settings-network-join = Koble til «{ $network }»
settings-network-join-enterprise = Logg inn med jobb- eller skolekontoen din.
settings-network-join-password = Skriv inn passordet for dette nettverket.
settings-network-join-failed = Kunne ikke koble til dette nettverket.
settings-network-join-sign-in-failed = Kunne ikke logge inn. Kontroller brukernavnet og passordet.
settings-network-join-wrong-password = Passordet virket ikke. Kontroller det, og prøv igjen.

## Network: connection settings page

settings-network-forget = Glem dette nettverket
    .description = Fjerner passordet og innstillingene fra denne datamaskinen
    .button = Glem
settings-network-remove-vpn = Fjern denne VPN-en
settings-network-remove-connection = Fjern denne tilkoblingen
settings-network-remove-description = Sletter innstillingene fra denne datamaskinen
settings-network-remove = Fjern

settings-network-general = Generelt
settings-network-autoconnect = Koble til automatisk
settings-network-autoconnect-wifi = Koble til dette nettverket når det er innen rekkevidde
settings-network-autoconnect-wired = Koble til så snart en kabel kobles til
settings-network-autoconnect-vpn = Koble til når denne datamaskinen er på nett
settings-network-autoconnect-other = Koble til når den er tilgjengelig
settings-network-all-users = Tilgjengelig for alle
    .description = Alle som logger inn her, kan bruke den
settings-network-metered = Forbruksmålt tilkobling
    .description = Apper og oppdateringer venter med store nedlastinger
settings-network-metered-automatic = Oppdag automatisk
settings-network-metered-yes = Forbruksmålt
settings-network-metered-no = Ikke forbruksmålt

settings-network-security = Sikkerhet
settings-network-security-type = Sikkerhetstype

settings-network-advanced = Avansert
settings-network-private-address = Privat adresse
    .description = Gjør det vanskeligere å spore denne datamaskinen på dette nettverket
settings-network-hardware-address = Maskinvareadresse
    .description = Adressen denne datamaskinen viser til nettverket
settings-network-mac-random = Ny adresse hver gang
settings-network-mac-stable = Samme adresse for dette nettverket
settings-network-mac-private-off = Av
settings-network-mac-builtin = Innebygd adresse
settings-network-mac-custom = Egendefinert adresse
settings-network-mtu = Største pakkestørrelse (MTU)
    .description = La feltet stå tomt med mindre nettverket ditt krever en bestemt størrelse
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Metode
    .label = { $family }-metode
settings-network-ip-dhcp = Automatisk, bare adresser
settings-network-ip-manual = Manuelt
settings-network-ip-link-local = Bare lokal lenke (link-local)
settings-network-ip-shared = Delt med andre enheter
settings-network-ip-ignore = Ikke administrert
settings-network-ip-disabled = Av
settings-network-ip-addresses = Adresser
    .description = Hver med prefiks, for eksempel { $example }
settings-network-ip-address = Adresse { $number }
settings-network-ip-remove-address = Fjern adresse
settings-network-ip-add-address = Legg til adresse
settings-network-ip-router = { $family }-ruter
settings-network-ip-automatic-dns = Automatisk DNS
    .description = Bruk DNS-serverne dette nettverket foreslår
settings-network-ip-dns-first = Brukes før de foreslåtte
settings-network-ip-dns-separate = Skill adressene med komma
settings-network-ip-dns-servers = { $family }-DNS-servere
settings-network-ip-search-domains = Søkedomener
    .description = Prøves når et navn ikke har noe domene, for eksempel «skriver»
    .label = { $family }-søkedomener
settings-network-ip-automatic-routes = Automatiske ruter
    .description = Bruk rutene dette nettverket foreslår
settings-network-ip-routes = Ruter
    .description = Send trafikk til enkelte nettverk gjennom en annen ruter
settings-network-ip-add-route = Legg til rute
settings-network-route-network = Nettverk
settings-network-route-priority = Prioritet
settings-network-route-remove = Fjern rute

## Network: work or school (802.1X) sign-in

settings-network-eap = Autentisering
settings-network-eap-peap = Beskyttet EAP (PEAP)
settings-network-eap-ttls = Tunnelert TLS (TTLS)
settings-network-eap-tls = Sertifikat (TLS)
settings-network-eap-inner = Indre autentisering
settings-network-client-certificate = Ditt sertifikat
settings-network-private-key-password = Passord for privat nøkkel
    .placeholder = Hvis nøkkelen har et
settings-network-anonymous-identity = Anonym identitet
    .description = La feltet stå tomt med mindre nettverket ber om det
settings-network-ca = CA-sertifikat
    .description = Bekrefter at du kobler til det ekte nettverket
settings-network-ca-system = Bruk systemsertifikater
settings-network-ca-file = Velg en fil…
settings-network-ca-another-file = Velg en annen fil…
settings-network-ca-none = Ikke kontroller
settings-network-choose-file = Velg…
settings-network-server-domain = Serverdomene
    .description = Koble bare til servere i dette domenet

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Skriv inn et navn
settings-network-error-no-addresses = Legg til minst én adresse
settings-network-error-address = Skriv inn en adresse med prefiks, for eksempel { $example }
settings-network-error-router = Skriv inn en ruteradresse, for eksempel { $example }
settings-network-error-dns = «{ $address }» er ikke en gyldig adresse
settings-network-error-search-domain = «{ $domain }» er ikke et gyldig domene
settings-network-error-route = Skriv inn et nettverk, for eksempel { $example }
settings-network-error-priority = Bruk et heltall som prioritet
settings-network-error-username = Skriv inn brukernavnet ditt
settings-network-error-domain = Skriv inn et domene, for eksempel example.com
settings-network-error-certificate = Velg sertifikatet ditt
settings-network-error-private-key = Velg den private nøkkelen din
settings-network-error-mtu = Bruk et tall fra { $lowest } til { $highest }, eller la feltet stå tomt
settings-network-error-mac = Skriv inn en adresse som 12:34:56:78:9A:BC
settings-network-error-password = Skriv inn passordet ditt
settings-network-error-password-length = { $count ->
        [one] Bruk minst { $count } tegn
       *[other] Bruk minst { $count } tegn
    }

## Network: proxy

settings-network-proxy-off = Av
settings-network-proxy-manual = Manuelt
settings-network-proxy-url = Konfigurasjonsadresse
settings-network-proxy-http = Nett (HTTP)
settings-network-proxy-https = Sikkert nett (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Server
    .label = { $protocol }-server
settings-network-proxy-port = Port
    .label = { $protocol }-port
settings-network-proxy-skip = Ikke bruk proxy for
settings-network-proxy-error-url = Skriv inn en nettadresse, for eksempel http://example.com/proxy.pac
settings-network-proxy-error-host = Skriv bare inn servernavnet, for eksempel proxy.example.com
settings-network-proxy-error-port = Bruk en port fra 1 til 65535
settings-network-proxy-save-failed = Kunne ikke lagre proxyinnstillingene

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importer fra en fil
    .description = Konfigurasjonsfiler for WireGuard, OpenVPN og andre VPN-er
settings-network-vpn-importing = Importerer…
settings-network-wireguard = Konfigurer WireGuard
    .description = Skriv inn opplysningene fra VPN-leverandøren eller serveren din
settings-network-wireguard-dialog = Du får disse opplysningene fra VPN-leverandøren din eller fra eieren av serveren.
settings-network-wireguard-name-example = Hjemme-VPN
settings-network-wireguard-public-key = Offentlig nøkkel { $key }
settings-network-wireguard-public-key-pending = Den offentlige nøkkelen vises her, klar til å deles
settings-network-wireguard-copy = Kopier offentlig nøkkel
settings-network-wireguard-copied = Kopiert
settings-network-wireguard-generate = Generer en ny nøkkel
settings-network-wireguard-addresses = Denne datamaskinens adresser i VPN-en
settings-network-wireguard-server-key = Serverens offentlige nøkkel
settings-network-wireguard-endpoint = Serveradresse
settings-network-wireguard-allowed-ips = Tillatte IP-adresser
    .description = Trafikk til disse områdene går gjennom VPN-en
settings-network-wireguard-preshared-key = Forhåndsdelt nøkkel
settings-network-wireguard-keepalive = Keepalive
    .description = Hjelper tilkoblingen med å holde seg oppe bak en ruter
    .placeholder = Valgfritt, i sekunder
settings-network-wireguard-add = Legg til
settings-network-wireguard-adding = Legger til…
settings-network-wireguard-error-private-key = Skriv inn eller generer en privat nøkkel
settings-network-wireguard-error-addresses = Skriv inn minst én adresse
settings-network-wireguard-error-server-key = Skriv inn serverens offentlige nøkkel
settings-network-wireguard-error-endpoint = Skriv inn serverens adresse og port
settings-network-wireguard-error-allowed-ips = Skriv inn minst ett område
settings-network-wireguard-error-keepalive = Skriv inn et antall sekunder

## Bluetooth panel

settings-bluetooth-hardware-off = Slått av med en maskinvarebryter
settings-bluetooth-power-on-failed = Kunne ikke slå på Bluetooth
settings-bluetooth-power-off-failed = Kunne ikke slå av Bluetooth
settings-bluetooth-visible = Synlig for enheter i nærheten
    .description = Lar telefoner og datamaskiner finne denne
settings-bluetooth-visible-as = Vises som «{ $name }»
settings-bluetooth-visible-duration = Forbli synlig
settings-bluetooth-visible-for = { $minutes ->
        [one] I { $minutes } minutt
       *[other] I { $minutes } minutter
    }
settings-bluetooth-visible-until-off = Til den slås av
settings-bluetooth-visible-failed = Kunne ikke endre om denne datamaskinen er synlig
settings-bluetooth-paired = Mine enheter
settings-bluetooth-nearby = Enheter i nærheten
settings-bluetooth-searching = Ser etter enheter…
    .description = Sett enheten du vil legge til, i sammenkoblingsmodus
settings-bluetooth-blocked = Bluetooth er slått av med en maskinvarebryter
    .description = Bruk bryteren eller tasten på datamaskinen for å slå det på
settings-bluetooth-details = Enhetsdetaljer
settings-bluetooth-connected = Tilkoblet
settings-bluetooth-connected-battery = Tilkoblet · batteri { $battery }
settings-bluetooth-connecting = Kobler til…
settings-bluetooth-disconnecting = Kobler fra…
settings-bluetooth-pairing = Kobler sammen…
settings-bluetooth-forget-confirm = Vil du glemme «{ $name }»?
    .description = Du må koble den sammen igjen for å bruke den med denne datamaskinen.
settings-bluetooth-forget = Glem
settings-bluetooth-cancel = Avbryt
settings-bluetooth-connect = Koble til
settings-bluetooth-disconnect = Koble fra
settings-bluetooth-done = Ferdig

## Bluetooth: device details

settings-bluetooth-type = Type
settings-bluetooth-battery = Batteri
settings-bluetooth-address = Adresse
settings-bluetooth-autoconnect = Koble til automatisk
    .description = Når den er i nærheten
settings-bluetooth-kind-headphones = Hodetelefoner
settings-bluetooth-kind-speaker = Høyttaler
settings-bluetooth-kind-mouse = Mus
settings-bluetooth-kind-keyboard = Tastatur
settings-bluetooth-kind-gamepad = Spillkontroller
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Datamaskin
settings-bluetooth-kind-tablet = Nettbrett
settings-bluetooth-kind-display = Skjerm
settings-bluetooth-kind-printer = Skriver
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Annen enhet

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = enheten
settings-bluetooth-request-confirm = Vil du koble sammen med { $name }?
    .description = Kontroller at { $name } viser den samme koden.
settings-bluetooth-request-authorize = Vil du tillate sammenkobling med { $name }?
    .description = Da kan { $name } koble til denne datamaskinen.
settings-bluetooth-request-pin = Skriv inn PIN-koden for { $name }
    .description = Den er ofte 0000 eller 1234. Hvis ingen av dem virker, står den i håndboken til enheten.
settings-bluetooth-request-passkey = Skriv inn koden som vises på { $name }
    .description = Skriv inn de seks sifrene nøyaktig slik de vises.
settings-bluetooth-request-display = Koble sammen med { $name }
    .description = Skriv inn denne koden på { $name }, og trykk deretter på Enter.
settings-bluetooth-pair = Koble sammen
settings-bluetooth-allow = Tillat

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Ta med enhetene dine fra Windows
    .description = { $count ->
        [one] { $devices } er sammenkoblet i Windows. Bruk den her uten å koble sammen på nytt.
       *[other] { $devices } er sammenkoblet i Windows. Bruk dem her uten å koble sammen på nytt.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } til
       *[other] { $count } til
    }

## Accounts panel

settings-accounts-unavailable = Kontoer er ikke tilgjengelige
    .description = Kontotjenesten er ikke installert på denne datamaskinen
settings-accounts-online = Nettkontoer
    .description = Hver konto er en mappe i Cloud i hjemmemappen din, og alle apper kan åpne den. Filene lastes ned når du åpner dem.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud eller WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Logg inn igjen for å fortsette å bruke den
settings-accounts-paused-metered = Synkroniseringen er satt på pause på en forbruksmålt tilkobling
settings-accounts-paused-battery = Synkroniseringen er satt på pause mens batterinivået er lavt
settings-accounts-connecting = Kobler til…
settings-accounts-offline = Frakoblet
settings-accounts-offline-kept = Frakoblet, beholdte filer er fortsatt her
settings-accounts-not-connected = Ikke tilkoblet
settings-accounts-syncing = { $count ->
        [one] Synkroniserer { $count } endring
       *[other] Synkroniserer { $count } endringer
    }
settings-accounts-name = Navn
settings-accounts-folder = Mappe
settings-accounts-server = Server
settings-accounts-storage = Lagring
settings-accounts-storage-used = { $used } av { $total } brukt
settings-accounts-on-device = På denne enheten
settings-accounts-kept = { $count ->
        [one] { $count } element beholdt, resten lastes ned når det åpnes
       *[other] { $count } elementer beholdt, resten lastes ned når det åpnes
    }
settings-accounts-on-demand = Filene lastes ned når du åpner dem
settings-accounts-sign-in-again = Logg inn igjen
settings-accounts-keep = Behold
settings-accounts-remove = Fjern
settings-accounts-remove-confirm = Fjern fra denne datamaskinen
settings-accounts-removing = Fjerner…
settings-accounts-remove-note = Filene dine blir værende i { $provider }. Endringer du har gjort her, lastes opp først.

## Accounts: providers

settings-accounts-provider-icloud = Apple-kontoen din, bekreftet med en kode fra iPhone, iPad eller Mac
settings-accounts-provider-onedrive = En personlig Microsoft-konto eller en jobb- eller skolekonto, i nettleseren
settings-accounts-provider-dropbox = En Dropbox-konto, i nettleseren
settings-accounts-provider-nextcloud = Din egen server eller organisasjonens server
settings-accounts-provider-webdav = En hvilken som helst server som støtter WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Logg inn på { $account } igjen
settings-accounts-browser = Nettleseren åpnes slik at du kan logge inn med { $provider }. Luft ser aldri passordet ditt.
settings-accounts-password-for = Skriv inn passordet for { $user }.
settings-accounts-apple-account = Apple-konto
settings-accounts-password = Passord
settings-accounts-app-password = App-passord
settings-accounts-user = Brukernavn
settings-accounts-apple-note = Bruk passordet til Apple-kontoen din. Appspesifikke passord virker ikke her. Apple viser deretter en kode på iPhone, iPad eller Mac.
settings-accounts-nextcloud-browser = Nettleseren åpnes slik at du kan logge inn på serveren din og gi Luft tilgang.
settings-accounts-use-app-password = Bruk et app-passord i stedet
settings-accounts-error-server = Skriv inn serveradressen
settings-accounts-error-apple-account = Skriv inn e-postadressen til Apple-kontoen din
settings-accounts-error-user = Skriv inn brukernavnet
settings-accounts-error-password = Skriv inn passordet
settings-accounts-cancel = Avbryt
settings-accounts-back = Tilbake
settings-accounts-continue-in-browser = Fortsett i nettleseren
settings-accounts-sign-in = Logg inn
settings-accounts-try-again = Prøv igjen
settings-accounts-continue = Fortsett
settings-accounts-working = Kontakter { $provider }…
settings-accounts-finish-in-browser = Fullfør påloggingen med { $provider } i nettleseren. Luft ser aldri passordet ditt, og dette oppdateres av seg selv når du er ferdig.
settings-accounts-no-browser = Ingen nettleser ble åpnet. Kopier lenken, og åpne den i en nettleser.
settings-accounts-open-again = Åpne siden igjen
settings-accounts-copy-link = Kopier lenken
settings-accounts-copied = Kopiert
settings-accounts-code = Bekreftelseskode
    .placeholder = Sekssifret kode
settings-accounts-text-me = Send meg en kode på SMS i stedet
settings-accounts-choose-phone = Hvilket nummer skal Apple sende koden til?
    .description = Send en SMS
settings-accounts-approve = Apple-kontoen din bruker avansert databeskyttelse. Godkjenn forespørselen på iPhone, iPad eller Mac for at denne datamaskinen skal kunne åpne iCloud Drive.
