### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Gem
settings-network-saving = Gemmer…
settings-network-cancel = Annuller
settings-network-connect = Opret forbindelse
settings-network-disconnect = Afbryd
settings-network-optional = Valgfrit
settings-network-automatic = Automatisk
settings-network-name = Navn
settings-network-password = Adgangskode
settings-network-password-saved = Gemt adgangskode
settings-network-username = Brugernavn
settings-network-router = Router
settings-network-dns-servers = DNS-servere
settings-network-private-key = Privat nøgle
settings-network-connection-settings = Forbindelsesindstillinger
settings-network-connect-failed = Der kunne ikke oprettes forbindelse

## Network: connection states

settings-network-link-connected = Forbundet
settings-network-link-connecting = Opretter forbindelse…
settings-network-link-disconnected = Ikke forbundet
settings-network-link-unplugged = Kablet er ikke tilsluttet

## Network: Wi‑Fi security types

settings-network-security-open = Ingen
settings-network-security-owe = Udvidet åben
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Virksomhed

## Network: signal and radio details

settings-network-signal-excellent = Fremragende
settings-network-signal-good = God
settings-network-signal-fair = Rimelig
settings-network-signal-weak = Svag
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Kanal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Bånd
settings-network-detail-speed = Forbindelseshastighed
settings-network-detail-access-point = Adgangspunkt
settings-network-detail-security = Sikkerhed
settings-network-detail-ipv4 = IP-adresse
settings-network-detail-ipv6 = IPv6-adresse
settings-network-detail-router = Router
settings-network-detail-dns = DNS
settings-network-detail-mac = Hardwareadresse

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Slået fra med en hardwarekontakt
settings-network-wifi-connected = Forbundet til { $network }
settings-network-airplane = Flytilstand
    .description = Slår alle trådløse forbindelser fra
settings-network-airplane-hardware = Slået til med en hardwarekontakt
settings-network-known = Kendte netværk
    .description = Netværk, som denne computer har været forbundet til før, uanset om de er i nærheden
settings-network-known-count = { $count ->
        [one] { $count } gemt netværk
       *[other] { $count } gemte netværk
    }
settings-network-known-in-range = Inden for rækkevidde
settings-network-wired = Kablet
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Forbundet · { $speed }
settings-network-empty = Ingen netværksforbindelser
    .description = Tilslut et netværkskabel eller en Wi‑Fi-adapter for at komme på nettet
settings-network-proxy = Proxy
    .description = Send webtrafik gennem en anden server. Det er ofte nødvendigt på netværk på arbejdet eller skolen.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi‑Fi-netværk
settings-network-wifi-saved = Gemt
settings-network-wifi-enterprise = Log ind med en arbejds- eller skolekonto
settings-network-wifi-connect-failed = Der kunne ikke oprettes forbindelse til dette netværk
settings-network-wifi-saved-password-failed = Den gemte adgangskode virkede ikke. Indtast den igen.
settings-network-wifi-settings = Netværksindstillinger
settings-network-wifi-searching = Søger efter netværk…
settings-network-hidden = Opret forbindelse til et skjult netværk
    .description = Indtast netværkets navn, og angiv, hvordan det er sikret.
settings-network-hidden-name = Netværksnavn

## Network: joining a Wi‑Fi network

settings-network-join = Opret forbindelse til »{ $network }«
settings-network-join-enterprise = Log ind med din arbejds- eller skolekonto.
settings-network-join-password = Indtast adgangskoden til dette netværk.
settings-network-join-failed = Der kunne ikke oprettes forbindelse til dette netværk.
settings-network-join-sign-in-failed = Du kunne ikke logges ind. Kontroller dit brugernavn og din adgangskode.
settings-network-join-wrong-password = Adgangskoden virkede ikke. Kontroller den, og prøv igen.

## Network: connection settings page

settings-network-forget = Glem dette netværk
    .description = Fjerner adgangskoden og indstillingerne fra denne computer
    .button = Glem
settings-network-remove-vpn = Fjern dette VPN
settings-network-remove-connection = Fjern denne forbindelse
settings-network-remove-description = Sletter indstillingerne fra denne computer
settings-network-remove = Fjern

settings-network-general = Generelt
settings-network-autoconnect = Opret forbindelse automatisk
settings-network-autoconnect-wifi = Opret forbindelse, når netværket er inden for rækkevidde
settings-network-autoconnect-wired = Opret forbindelse, så snart et kabel tilsluttes
settings-network-autoconnect-vpn = Opret forbindelse, når computeren er online
settings-network-autoconnect-other = Opret forbindelse, når den er tilgængelig
settings-network-all-users = Tilgængelig for alle
    .description = Alle, der logger ind her, kan bruge den
settings-network-metered = Forbrugsafregnet forbindelse
    .description = Apps og opdateringer venter med store downloads
settings-network-metered-automatic = Registrer automatisk
settings-network-metered-yes = Forbrugsafregnet
settings-network-metered-no = Ikke forbrugsafregnet

settings-network-security = Sikkerhed
settings-network-security-type = Sikkerhedstype

settings-network-advanced = Avanceret
settings-network-private-address = Privat adresse
    .description = Gør det sværere at spore denne computer på dette netværk
settings-network-hardware-address = Hardwareadresse
    .description = Den adresse, denne computer viser over for netværket
settings-network-mac-random = Ny adresse hver gang
settings-network-mac-stable = Samme adresse til dette netværk
settings-network-mac-private-off = Fra
settings-network-mac-builtin = Indbygget adresse
settings-network-mac-custom = Brugerdefineret adresse
settings-network-mtu = Største pakkestørrelse (MTU)
    .description = Lad feltet være tomt, medmindre dit netværk kræver en bestemt størrelse
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Metode
    .label = { $family }-metode
settings-network-ip-dhcp = Automatisk, kun adresser
settings-network-ip-manual = Manuel
settings-network-ip-link-local = Kun link-lokal
settings-network-ip-shared = Delt med andre enheder
settings-network-ip-ignore = Administreres ikke
settings-network-ip-disabled = Fra
settings-network-ip-addresses = Adresser
    .description = Hver med sit præfiks, f.eks. { $example }
settings-network-ip-address = Adresse { $number }
settings-network-ip-remove-address = Fjern adresse
settings-network-ip-add-address = Tilføj adresse
settings-network-ip-router = { $family }-router
settings-network-ip-automatic-dns = Automatisk DNS
    .description = Brug de DNS-servere, som netværket foreslår
settings-network-ip-dns-first = Bruges før de foreslåede
settings-network-ip-dns-separate = Adskil adresser med kommaer
settings-network-ip-dns-servers = { $family }-DNS-servere
settings-network-ip-search-domains = Søgedomæner
    .description = Prøves, når et navn ikke har et domæne, f.eks. »printer«
    .label = { $family }-søgedomæner
settings-network-ip-automatic-routes = Automatiske ruter
    .description = Brug de ruter, som netværket foreslår
settings-network-ip-routes = Ruter
    .description = Send trafik til bestemte netværk gennem en anden router
settings-network-ip-add-route = Tilføj rute
settings-network-route-network = Netværk
settings-network-route-priority = Prioritet
settings-network-route-remove = Fjern rute

## Network: work or school (802.1X) sign-in

settings-network-eap = Godkendelse
settings-network-eap-peap = Beskyttet EAP (PEAP)
settings-network-eap-ttls = Tunneleret TLS (TTLS)
settings-network-eap-tls = Certifikat (TLS)
settings-network-eap-inner = Indre godkendelse
settings-network-client-certificate = Dit certifikat
settings-network-private-key-password = Adgangskode til privat nøgle
    .placeholder = Hvis nøglen har en
settings-network-anonymous-identity = Anonym identitet
    .description = Lad feltet være tomt, medmindre dit netværk beder om det
settings-network-ca = CA-certifikat
    .description = Bekræfter, at du opretter forbindelse til det rigtige netværk
settings-network-ca-system = Brug systemets certifikater
settings-network-ca-file = Vælg en fil…
settings-network-ca-another-file = Vælg en anden fil…
settings-network-ca-none = Kontroller ikke
settings-network-choose-file = Vælg…
settings-network-server-domain = Serverdomæne
    .description = Opret kun forbindelse til servere i dette domæne

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Indtast et navn
settings-network-error-no-addresses = Tilføj mindst én adresse
settings-network-error-address = Indtast en adresse med præfiks, f.eks. { $example }
settings-network-error-router = Indtast en routeradresse, f.eks. { $example }
settings-network-error-dns = »{ $address }« er ikke en gyldig adresse
settings-network-error-search-domain = »{ $domain }« er ikke et gyldigt domæne
settings-network-error-route = Indtast et netværk, f.eks. { $example }
settings-network-error-priority = Brug et helt tal som prioritet
settings-network-error-username = Indtast dit brugernavn
settings-network-error-domain = Indtast et domæne, f.eks. example.com
settings-network-error-certificate = Vælg dit certifikat
settings-network-error-private-key = Vælg din private nøgle
settings-network-error-mtu = Brug et tal fra { $lowest } til { $highest }, eller lad feltet være tomt
settings-network-error-mac = Indtast en adresse som 12:34:56:78:9A:BC
settings-network-error-password = Indtast din adgangskode
settings-network-error-password-length = { $count ->
        [one] Brug mindst { $count } tegn
       *[other] Brug mindst { $count } tegn
    }

## Network: proxy

settings-network-proxy-off = Fra
settings-network-proxy-manual = Manuel
settings-network-proxy-url = Konfigurationsadresse
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Sikker web (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Server
    .label = Server til { $protocol }
settings-network-proxy-port = Port
    .label = Port til { $protocol }
settings-network-proxy-skip = Brug ikke proxyen til
settings-network-proxy-error-url = Indtast en webadresse, f.eks. http://example.com/proxy.pac
settings-network-proxy-error-host = Indtast kun servernavnet, f.eks. proxy.example.com
settings-network-proxy-error-port = Brug en port fra 1 til 65535
settings-network-proxy-save-failed = Proxyindstillingerne kunne ikke gemmes

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importer fra en fil
    .description = WireGuard-, OpenVPN- og andre VPN-konfigurationsfiler
settings-network-vpn-importing = Importerer…
settings-network-wireguard = Konfigurer WireGuard
    .description = Indtast oplysningerne fra din VPN-udbyder eller server
settings-network-wireguard-dialog = Din VPN-udbyder eller serverens ejer kan give dig disse oplysninger.
settings-network-wireguard-name-example = VPN derhjemme
settings-network-wireguard-public-key = Offentlig nøgle { $key }
settings-network-wireguard-public-key-pending = Den offentlige nøgle vises her, så du kan dele den
settings-network-wireguard-copy = Kopier offentlig nøgle
settings-network-wireguard-copied = Kopieret
settings-network-wireguard-generate = Generer en ny nøgle
settings-network-wireguard-addresses = Denne computers adresser i VPN-forbindelsen
settings-network-wireguard-server-key = Serverens offentlige nøgle
settings-network-wireguard-endpoint = Serveradresse
settings-network-wireguard-allowed-ips = Tilladte IP-adresser
    .description = Trafik til disse intervaller går gennem VPN-forbindelsen
settings-network-wireguard-preshared-key = Foruddelt nøgle
settings-network-wireguard-keepalive = Keepalive
    .description = Hjælper forbindelsen med at holde sig oppe bag en router
    .placeholder = Valgfrit, i sekunder
settings-network-wireguard-add = Tilføj
settings-network-wireguard-adding = Tilføjer…
settings-network-wireguard-error-private-key = Indtast eller generer en privat nøgle
settings-network-wireguard-error-addresses = Indtast mindst én adresse
settings-network-wireguard-error-server-key = Indtast serverens offentlige nøgle
settings-network-wireguard-error-endpoint = Indtast serverens adresse og port
settings-network-wireguard-error-allowed-ips = Indtast mindst ét interval
settings-network-wireguard-error-keepalive = Indtast et antal sekunder

## Bluetooth panel

settings-bluetooth-hardware-off = Slået fra med en hardwarekontakt
settings-bluetooth-power-on-failed = Bluetooth kunne ikke slås til
settings-bluetooth-power-off-failed = Bluetooth kunne ikke slås fra
settings-bluetooth-visible = Synlig for enheder i nærheden
    .description = Lader telefoner og computere finde denne computer
settings-bluetooth-visible-as = Vises som »{ $name }«
settings-bluetooth-visible-duration = Forbliv synlig
settings-bluetooth-visible-for = { $minutes ->
        [one] I { $minutes } minut
       *[other] I { $minutes } minutter
    }
settings-bluetooth-visible-until-off = Indtil det slås fra
settings-bluetooth-visible-failed = Det kunne ikke ændres, om denne computer er synlig
settings-bluetooth-paired = Mine enheder
settings-bluetooth-nearby = Enheder i nærheden
settings-bluetooth-searching = Søger efter enheder…
    .description = Sæt den enhed, du vil tilføje, i parringstilstand
settings-bluetooth-blocked = Bluetooth er slået fra med en hardwarekontakt
    .description = Brug kontakten eller tasten på din computer til at slå det til
settings-bluetooth-details = Enhedsoplysninger
settings-bluetooth-connected = Forbundet
settings-bluetooth-connected-battery = Forbundet · batteri { $battery }
settings-bluetooth-connecting = Opretter forbindelse…
settings-bluetooth-disconnecting = Afbryder…
settings-bluetooth-pairing = Parrer…
settings-bluetooth-forget-confirm = Vil du glemme »{ $name }«?
    .description = Du skal parre den igen for at bruge den med denne computer.
settings-bluetooth-forget = Glem
settings-bluetooth-cancel = Annuller
settings-bluetooth-connect = Opret forbindelse
settings-bluetooth-disconnect = Afbryd
settings-bluetooth-done = Udført

## Bluetooth: device details

settings-bluetooth-type = Type
settings-bluetooth-battery = Batteri
settings-bluetooth-address = Adresse
settings-bluetooth-autoconnect = Opret forbindelse automatisk
    .description = Når den er i nærheden
settings-bluetooth-kind-headphones = Hovedtelefoner
settings-bluetooth-kind-speaker = Højttaler
settings-bluetooth-kind-mouse = Mus
settings-bluetooth-kind-keyboard = Tastatur
settings-bluetooth-kind-gamepad = Spillecontroller
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Computer
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Skærm
settings-bluetooth-kind-printer = Printer
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Anden enhed

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = enheden
settings-bluetooth-request-confirm = Vil du parre med { $name }?
    .description = Kontroller, at { $name } viser den samme kode.
settings-bluetooth-request-authorize = Vil du tillade, at { $name } parres?
    .description = { $name } vil kunne oprette forbindelse til denne computer.
settings-bluetooth-request-pin = Indtast pinkoden til { $name }
    .description = Den er ofte 0000 eller 1234. Hvis ingen af dem virker, står den i enhedens vejledning.
settings-bluetooth-request-passkey = Indtast koden, der vises på { $name }
    .description = Skriv de seks cifre præcis, som de vises.
settings-bluetooth-request-display = Par med { $name }
    .description = Skriv denne kode på { $name }, og tryk derefter på Enter.
settings-bluetooth-pair = Par
settings-bluetooth-allow = Tillad

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Hent dine enheder fra Windows
    .description = { $count ->
        [one] { $devices } er parret i Windows. Brug den her uden at parre igen.
       *[other] { $devices } er parret i Windows. Brug dem her uden at parre igen.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } mere
       *[other] { $count } mere
    }

## Accounts panel

settings-accounts-unavailable = Konti er ikke tilgængelige
    .description = Kontotjenesten er ikke installeret på denne computer
settings-accounts-online = Onlinekonti
    .description = Hver konto er en mappe i Cloud i din hjemmemappe, som alle apps kan åbne. Filer hentes, når du åbner dem.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud eller WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Log ind igen for at blive ved med at bruge den
settings-accounts-paused-metered = Synkronisering sat på pause på en forbrugsafregnet forbindelse
settings-accounts-paused-battery = Synkronisering sat på pause, mens batteriet er lavt
settings-accounts-connecting = Opretter forbindelse…
settings-accounts-offline = Offline
settings-accounts-offline-kept = Offline, gemte filer er her stadig
settings-accounts-not-connected = Ikke forbundet
settings-accounts-syncing = { $count ->
        [one] Synkroniserer { $count } ændring
       *[other] Synkroniserer { $count } ændringer
    }
settings-accounts-name = Navn
settings-accounts-folder = Mappe
settings-accounts-server = Server
settings-accounts-storage = Lagerplads
settings-accounts-storage-used = { $used } af { $total } brugt
settings-accounts-on-device = På denne enhed
settings-accounts-kept = { $count ->
        [one] { $count } element gemt lokalt, resten hentes ved åbning
       *[other] { $count } elementer gemt lokalt, resten hentes ved åbning
    }
settings-accounts-on-demand = Filer hentes, når du åbner dem
settings-accounts-sign-in-again = Log ind igen
settings-accounts-keep = Behold
settings-accounts-remove = Fjern
settings-accounts-remove-confirm = Fjern fra denne computer
settings-accounts-removing = Fjerner…
settings-accounts-remove-note = Dine filer bliver i { $provider }. Ændringer foretaget her sendes op først.

## Accounts: providers

settings-accounts-provider-icloud = Din Apple-konto, bekræftet med en kode fra din iPhone, iPad eller Mac
settings-accounts-provider-onedrive = En personlig Microsoft-konto eller en arbejds- eller skolekonto, i din browser
settings-accounts-provider-dropbox = En Dropbox-konto, i din browser
settings-accounts-provider-nextcloud = Din egen eller din organisations server
settings-accounts-provider-webdav = Enhver server, der understøtter WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Log ind på { $account } igen
settings-accounts-browser = Din browser åbnes, så du kan logge ind hos { $provider }. Luft ser aldrig din adgangskode.
settings-accounts-password-for = Indtast adgangskoden til { $user }.
settings-accounts-apple-account = Apple-konto
settings-accounts-password = Adgangskode
settings-accounts-app-password = Appadgangskode
settings-accounts-user = Brugernavn
settings-accounts-apple-note = Brug adgangskoden til din Apple-konto. Appspecifikke adgangskoder virker ikke her. Apple viser derefter en kode på din iPhone, iPad eller Mac.
settings-accounts-nextcloud-browser = Din browser åbnes, så du kan logge ind på din server og give Luft adgang.
settings-accounts-use-app-password = Brug en appadgangskode i stedet
settings-accounts-error-server = Indtast serveradressen
settings-accounts-error-apple-account = Indtast e-mailadressen til din Apple-konto
settings-accounts-error-user = Indtast brugernavnet
settings-accounts-error-password = Indtast adgangskoden
settings-accounts-cancel = Annuller
settings-accounts-back = Tilbage
settings-accounts-continue-in-browser = Fortsæt i browseren
settings-accounts-sign-in = Log ind
settings-accounts-try-again = Prøv igen
settings-accounts-continue = Fortsæt
settings-accounts-working = Kontakter { $provider }…
settings-accounts-finish-in-browser = Afslut login hos { $provider } i din browser. Luft ser aldrig din adgangskode, og dette opdateres af sig selv, når du er færdig.
settings-accounts-no-browser = Der blev ikke åbnet nogen browser. Kopier linket, og åbn det i en browser.
settings-accounts-open-again = Åbn siden igen
settings-accounts-copy-link = Kopier linket
settings-accounts-copied = Kopieret
settings-accounts-code = Bekræftelseskode
    .placeholder = 6-cifret kode
settings-accounts-text-me = Send mig en kode via sms i stedet
settings-accounts-choose-phone = Hvilket nummer skal Apple sende koden til?
    .description = Send en sms
settings-accounts-approve = Din Apple-konto bruger Avanceret databeskyttelse. Godkend anmodningen på din iPhone, iPad eller Mac for at give denne computer adgang til iCloud Drive.
