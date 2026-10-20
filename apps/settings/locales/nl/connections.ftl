### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Opslaan
settings-network-saving = Opslaan…
settings-network-cancel = Annuleren
settings-network-connect = Verbinden
settings-network-disconnect = Verbinding verbreken
settings-network-optional = Optioneel
settings-network-automatic = Automatisch
settings-network-name = Naam
settings-network-password = Wachtwoord
settings-network-password-saved = Opgeslagen wachtwoord
settings-network-username = Gebruikersnaam
settings-network-router = Router
settings-network-dns-servers = DNS-servers
settings-network-private-key = Privésleutel
settings-network-connection-settings = Verbindingsinstellingen
settings-network-connect-failed = Kan geen verbinding maken

## Network: connection states

settings-network-link-connected = Verbonden
settings-network-link-connecting = Verbinden…
settings-network-link-disconnected = Niet verbonden
settings-network-link-unplugged = Kabel losgekoppeld

## Network: Wi‑Fi security types

settings-network-security-open = Geen
settings-network-security-owe = Enhanced Open
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Persoonlijk
settings-network-security-sae = WPA3 Persoonlijk
settings-network-security-enterprise = Zakelijk

## Network: signal and radio details

settings-network-signal-excellent = Uitstekend
settings-network-signal-good = Goed
settings-network-signal-fair = Redelijk
settings-network-signal-weak = Zwak
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Kanaal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signaal
settings-network-detail-band = Band
settings-network-detail-speed = Verbindingssnelheid
settings-network-detail-access-point = Toegangspunt
settings-network-detail-security = Beveiliging
settings-network-detail-ipv4 = IP-adres
settings-network-detail-ipv6 = IPv6-adres
settings-network-detail-router = Router
settings-network-detail-dns = DNS
settings-network-detail-mac = Hardwareadres

## Network panel

settings-network-wifi = Wifi
settings-network-wifi-hardware-off = Uitgeschakeld met een hardwareschakelaar
settings-network-wifi-connected = Verbonden met { $network }
settings-network-airplane = Vliegtuigmodus
    .description = Schakelt alle draadloze verbindingen uit
settings-network-airplane-hardware = Ingeschakeld met een hardwareschakelaar
settings-network-known = Bekende netwerken
    .description = Netwerken waarmee deze computer eerder verbonden was, in de buurt of niet
settings-network-known-count = { $count ->
        [one] { $count } opgeslagen netwerk
       *[other] { $count } opgeslagen netwerken
    }
settings-network-known-in-range = Binnen bereik
settings-network-wired = Bekabeld
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Verbonden · { $speed }
settings-network-empty = Geen netwerkverbindingen
    .description = Sluit een netwerkkabel of een wifi-adapter aan om online te gaan
settings-network-proxy = Proxy
    .description = Stuur webverkeer via een andere server, vaak nodig op netwerken van werk of school.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wifi-netwerken
settings-network-wifi-saved = Opgeslagen
settings-network-wifi-enterprise = Aanmelden met een account van werk of school
settings-network-wifi-connect-failed = Kan geen verbinding maken met dit netwerk
settings-network-wifi-saved-password-failed = Het opgeslagen wachtwoord werkte niet. Voer het opnieuw in.
settings-network-wifi-settings = Netwerkinstellingen
settings-network-wifi-searching = Netwerken zoeken…
settings-network-hidden = Verbinden met een verborgen netwerk
    .description = Voer de naam van het netwerk in en hoe het beveiligd is.
settings-network-hidden-name = Netwerknaam

## Network: joining a Wi‑Fi network

settings-network-join = Verbinden met “{ $network }”
settings-network-join-enterprise = Meld je aan met je account van werk of school.
settings-network-join-password = Voer het wachtwoord voor dit netwerk in.
settings-network-join-failed = Kan geen verbinding maken met dit netwerk.
settings-network-join-sign-in-failed = Kan niet aanmelden. Controleer je gebruikersnaam en wachtwoord.
settings-network-join-wrong-password = Dat wachtwoord werkte niet. Controleer het en probeer het opnieuw.

## Network: connection settings page

settings-network-forget = Dit netwerk vergeten
    .description = Verwijdert het wachtwoord en de instellingen van deze computer
    .button = Vergeten
settings-network-remove-vpn = Deze VPN verwijderen
settings-network-remove-connection = Deze verbinding verwijderen
settings-network-remove-description = Verwijdert de instellingen van deze computer
settings-network-remove = Verwijderen

settings-network-general = Algemeen
settings-network-autoconnect = Automatisch verbinden
settings-network-autoconnect-wifi = Verbinden met dit netwerk zodra het binnen bereik is
settings-network-autoconnect-wired = Verbinden zodra er een kabel wordt aangesloten
settings-network-autoconnect-vpn = Verbinden zodra deze computer online is
settings-network-autoconnect-other = Verbinden zodra het beschikbaar is
settings-network-all-users = Beschikbaar voor iedereen
    .description = Iedereen die zich hier aanmeldt, kan het gebruiken
settings-network-metered = Verbinding met datalimiet
    .description = Apps en updates stellen grote downloads uit
settings-network-metered-automatic = Automatisch detecteren
settings-network-metered-yes = Met datalimiet
settings-network-metered-no = Zonder datalimiet

settings-network-security = Beveiliging
settings-network-security-type = Beveiligingstype

settings-network-advanced = Geavanceerd
settings-network-private-address = Privéadres
    .description = Maakt deze computer moeilijker te volgen op dit netwerk
settings-network-hardware-address = Hardwareadres
    .description = Het adres dat deze computer aan het netwerk laat zien
settings-network-mac-random = Elke keer een nieuw adres
settings-network-mac-stable = Hetzelfde adres voor dit netwerk
settings-network-mac-private-off = Uit
settings-network-mac-builtin = Ingebouwd adres
settings-network-mac-custom = Aangepast adres
settings-network-mtu = Maximale pakketgrootte (MTU)
    .description = Laat dit leeg, tenzij je netwerk een bepaalde grootte nodig heeft
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Methode
    .label = { $family }-methode
settings-network-ip-dhcp = Automatisch, alleen adressen
settings-network-ip-manual = Handmatig
settings-network-ip-link-local = Alleen link-local
settings-network-ip-shared = Gedeeld met andere apparaten
settings-network-ip-ignore = Niet beheerd
settings-network-ip-disabled = Uit
settings-network-ip-addresses = Adressen
    .description = Elk met het voorvoegsel, zoals { $example }
settings-network-ip-address = Adres { $number }
settings-network-ip-remove-address = Adres verwijderen
settings-network-ip-add-address = Adres toevoegen
settings-network-ip-router = { $family }-router
settings-network-ip-automatic-dns = Automatische DNS
    .description = De DNS-servers gebruiken die dit netwerk voorstelt
settings-network-ip-dns-first = Gebruikt vóór de voorgestelde servers
settings-network-ip-dns-separate = Scheid adressen met komma’s
settings-network-ip-dns-servers = { $family }-DNS-servers
settings-network-ip-search-domains = Zoekdomeinen
    .description = Geprobeerd als een naam geen domein heeft, zoals “printer”
    .label = { $family }-zoekdomeinen
settings-network-ip-automatic-routes = Automatische routes
    .description = De routes gebruiken die dit netwerk voorstelt
settings-network-ip-routes = Routes
    .description = Verkeer voor sommige netwerken via een andere router sturen
settings-network-ip-add-route = Route toevoegen
settings-network-route-network = Netwerk
settings-network-route-priority = Prioriteit
settings-network-route-remove = Route verwijderen

## Network: work or school (802.1X) sign-in

settings-network-eap = Authenticatie
settings-network-eap-peap = Beveiligde EAP (PEAP)
settings-network-eap-ttls = Getunnelde TLS (TTLS)
settings-network-eap-tls = Certificaat (TLS)
settings-network-eap-inner = Interne authenticatie
settings-network-client-certificate = Je certificaat
settings-network-private-key-password = Wachtwoord van privésleutel
    .placeholder = Als de sleutel er een heeft
settings-network-anonymous-identity = Anonieme identiteit
    .description = Laat dit leeg, tenzij je netwerk erom vraagt
settings-network-ca = CA-certificaat
    .description = Bevestigt dat je verbinding maakt met het echte netwerk
settings-network-ca-system = Systeemcertificaten gebruiken
settings-network-ca-file = Bestand kiezen…
settings-network-ca-another-file = Ander bestand kiezen…
settings-network-ca-none = Niet controleren
settings-network-choose-file = Kiezen…
settings-network-server-domain = Serverdomein
    .description = Alleen verbinden met servers in dit domein

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Voer een naam in
settings-network-error-no-addresses = Voeg minstens één adres toe
settings-network-error-address = Voer een adres met voorvoegsel in, zoals { $example }
settings-network-error-router = Voer een routeradres in, zoals { $example }
settings-network-error-dns = “{ $address }” is geen geldig adres
settings-network-error-search-domain = “{ $domain }” is geen geldig domein
settings-network-error-route = Voer een netwerk in, zoals { $example }
settings-network-error-priority = Gebruik een geheel getal voor de prioriteit
settings-network-error-username = Voer je gebruikersnaam in
settings-network-error-domain = Voer een domein in, zoals example.com
settings-network-error-certificate = Kies je certificaat
settings-network-error-private-key = Kies je privésleutel
settings-network-error-mtu = Gebruik een getal van { $lowest } tot { $highest }, of laat het leeg
settings-network-error-mac = Voer een adres in zoals 12:34:56:78:9A:BC
settings-network-error-password = Voer je wachtwoord in
settings-network-error-password-length = { $count ->
        [one] Gebruik minstens { $count } teken
       *[other] Gebruik minstens { $count } tekens
    }

## Network: proxy

settings-network-proxy-off = Uit
settings-network-proxy-manual = Handmatig
settings-network-proxy-url = Configuratieadres
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Beveiligd web (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Server
    .label = Server voor { $protocol }
settings-network-proxy-port = Poort
    .label = Poort voor { $protocol }
settings-network-proxy-skip = Proxy niet gebruiken voor
settings-network-proxy-error-url = Voer een webadres in, zoals http://example.com/proxy.pac
settings-network-proxy-error-host = Voer alleen de servernaam in, zoals proxy.example.com
settings-network-proxy-error-port = Gebruik een poort van 1 tot 65535
settings-network-proxy-save-failed = Kan de proxy-instellingen niet opslaan

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importeren uit een bestand
    .description = Configuratiebestanden van WireGuard, OpenVPN en andere VPN’s
settings-network-vpn-importing = Importeren…
settings-network-wireguard = WireGuard instellen
    .description = Voer de gegevens van je VPN-aanbieder of server in
settings-network-wireguard-dialog = Je VPN-aanbieder of de eigenaar van de server kan je deze gegevens geven.
settings-network-wireguard-name-example = VPN thuis
settings-network-wireguard-public-key = Openbare sleutel { $key }
settings-network-wireguard-public-key-pending = Hier verschijnt de openbare sleutel, zodat je die kunt delen
settings-network-wireguard-copy = Openbare sleutel kopiëren
settings-network-wireguard-copied = Gekopieerd
settings-network-wireguard-generate = Nieuwe sleutel genereren
settings-network-wireguard-addresses = Adressen van deze computer binnen de VPN
settings-network-wireguard-server-key = Openbare sleutel van server
settings-network-wireguard-endpoint = Serveradres
settings-network-wireguard-allowed-ips = Toegestane IP’s
    .description = Verkeer naar deze bereiken gaat via de VPN
settings-network-wireguard-preshared-key = Vooraf gedeelde sleutel
settings-network-wireguard-keepalive = Keepalive
    .description = Helpt de verbinding actief te houden achter een router
    .placeholder = Optioneel, in seconden
settings-network-wireguard-add = Toevoegen
settings-network-wireguard-adding = Toevoegen…
settings-network-wireguard-error-private-key = Voer een privésleutel in of genereer er een
settings-network-wireguard-error-addresses = Voer minstens één adres in
settings-network-wireguard-error-server-key = Voer de openbare sleutel van de server in
settings-network-wireguard-error-endpoint = Voer het adres en de poort van de server in
settings-network-wireguard-error-allowed-ips = Voer minstens één bereik in
settings-network-wireguard-error-keepalive = Voer een aantal seconden in

## Bluetooth panel

settings-bluetooth-hardware-off = Uitgeschakeld met een hardwareschakelaar
settings-bluetooth-power-on-failed = Kan Bluetooth niet inschakelen
settings-bluetooth-power-off-failed = Kan Bluetooth niet uitschakelen
settings-bluetooth-visible = Zichtbaar voor apparaten in de buurt
    .description = Telefoons en computers kunnen deze computer vinden
settings-bluetooth-visible-as = Zichtbaar als “{ $name }”
settings-bluetooth-visible-duration = Zichtbaar blijven
settings-bluetooth-visible-for = { $minutes ->
        [one] { $minutes } minuut
       *[other] { $minutes } minuten
    }
settings-bluetooth-visible-until-off = Tot uitgeschakeld
settings-bluetooth-visible-failed = Kan niet wijzigen of deze computer zichtbaar is
settings-bluetooth-paired = Mijn apparaten
settings-bluetooth-nearby = Apparaten in de buurt
settings-bluetooth-searching = Apparaten zoeken…
    .description = Zet het apparaat dat je wilt toevoegen in de koppelmodus
settings-bluetooth-blocked = Bluetooth is uitgeschakeld met een hardwareschakelaar
    .description = Gebruik de schakelaar of toets op je computer om het in te schakelen
settings-bluetooth-details = Apparaatgegevens
settings-bluetooth-connected = Verbonden
settings-bluetooth-connected-battery = Verbonden · batterij { $battery }
settings-bluetooth-connecting = Verbinden…
settings-bluetooth-disconnecting = Verbinding verbreken…
settings-bluetooth-pairing = Koppelen…
settings-bluetooth-forget-confirm = “{ $name }” vergeten?
    .description = Je moet het opnieuw koppelen om het met deze computer te gebruiken.
settings-bluetooth-forget = Vergeten
settings-bluetooth-cancel = Annuleren
settings-bluetooth-connect = Verbinden
settings-bluetooth-disconnect = Verbinding verbreken
settings-bluetooth-done = Klaar

## Bluetooth: device details

settings-bluetooth-type = Type
settings-bluetooth-battery = Batterij
settings-bluetooth-address = Adres
settings-bluetooth-autoconnect = Automatisch verbinden
    .description = Zodra het in de buurt is
settings-bluetooth-kind-headphones = Koptelefoon
settings-bluetooth-kind-speaker = Luidspreker
settings-bluetooth-kind-mouse = Muis
settings-bluetooth-kind-keyboard = Toetsenbord
settings-bluetooth-kind-gamepad = Gamecontroller
settings-bluetooth-kind-phone = Telefoon
settings-bluetooth-kind-computer = Computer
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Beeldscherm
settings-bluetooth-kind-printer = Printer
settings-bluetooth-kind-camera = Camera
settings-bluetooth-kind-other = Ander apparaat

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = het apparaat
settings-bluetooth-request-confirm = Koppelen met { $name }?
    .description = Controleer of { $name } dezelfde code toont.
settings-bluetooth-request-authorize = Koppelen met { $name } toestaan?
    .description = Daarna kan { $name } verbinding maken met deze computer.
settings-bluetooth-request-pin = Voer de pincode voor { $name } in
    .description = Vaak is dat 0000 of 1234. Werkt geen van beide, dan staat de code in de handleiding van het apparaat.
settings-bluetooth-request-passkey = Voer de code in die op { $name } wordt getoond
    .description = Typ de zes cijfers precies zoals ze worden weergegeven.
settings-bluetooth-request-display = Koppelen met { $name }
    .description = Typ deze code op { $name } en druk dan op Enter.
settings-bluetooth-pair = Koppelen
settings-bluetooth-allow = Toestaan

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Je apparaten uit Windows meenemen
    .description = { $count ->
        [one] { $devices } is gekoppeld in Windows. Gebruik het hier zonder opnieuw te koppelen.
       *[other] { $devices } zijn gekoppeld in Windows. Gebruik ze hier zonder opnieuw te koppelen.
    }
settings-bluetooth-windows-more = { $count ->
        [one] nog { $count }
       *[other] nog { $count }
    }

## Accounts panel

settings-accounts-unavailable = Accounts zijn niet beschikbaar
    .description = De accountservice is niet geïnstalleerd op deze computer
settings-accounts-online = Onlineaccounts
    .description = Elk account is een map in Cloud, in je persoonlijke map, die elke app kan openen. Bestanden worden gedownload wanneer je ze opent.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud of WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Meld je opnieuw aan om het te blijven gebruiken
settings-accounts-paused-metered = Synchronisatie gepauzeerd op een verbinding met datalimiet
settings-accounts-paused-battery = Synchronisatie gepauzeerd zolang de batterij bijna leeg is
settings-accounts-connecting = Verbinden…
settings-accounts-offline = Offline
settings-accounts-offline-kept = Offline, bewaarde bestanden zijn nog beschikbaar
settings-accounts-not-connected = Niet verbonden
settings-accounts-syncing = { $count ->
        [one] { $count } wijziging synchroniseren
       *[other] { $count } wijzigingen synchroniseren
    }
settings-accounts-name = Naam
settings-accounts-folder = Map
settings-accounts-server = Server
settings-accounts-storage = Opslag
settings-accounts-storage-used = { $used } van { $total } gebruikt
settings-accounts-on-device = Op dit apparaat
settings-accounts-kept = { $count ->
        [one] { $count } item bewaard, de rest wordt gedownload bij het openen
       *[other] { $count } items bewaard, de rest wordt gedownload bij het openen
    }
settings-accounts-on-demand = Bestanden worden gedownload wanneer je ze opent
settings-accounts-sign-in-again = Opnieuw aanmelden
settings-accounts-keep = Behouden
settings-accounts-remove = Verwijderen
settings-accounts-remove-confirm = Verwijderen van deze computer
settings-accounts-removing = Verwijderen…
settings-accounts-remove-note = Je bestanden blijven in { $provider }. Wijzigingen die je hier hebt gemaakt, worden eerst geüpload.

## Accounts: providers

settings-accounts-provider-icloud = Je Apple Account, bevestigd met een code van je iPhone, iPad of Mac
settings-accounts-provider-onedrive = Een persoonlijk Microsoft-account of een account van werk of school, in je browser
settings-accounts-provider-dropbox = Een Dropbox-account, in je browser
settings-accounts-provider-nextcloud = Je eigen server of die van je organisatie
settings-accounts-provider-webdav = Elke server die WebDAV ondersteunt

## Accounts: signing in

settings-accounts-sign-in-again-title = Opnieuw aanmelden bij { $account }
settings-accounts-browser = Je browser wordt geopend, zodat je je kunt aanmelden bij { $provider }. Luft ziet je wachtwoord nooit.
settings-accounts-password-for = Voer het wachtwoord voor { $user } in.
settings-accounts-apple-account = Apple Account
settings-accounts-password = Wachtwoord
settings-accounts-app-password = App-wachtwoord
settings-accounts-user = Gebruikersnaam
settings-accounts-apple-note = Gebruik het wachtwoord van je Apple Account; app-specifieke wachtwoorden werken hier niet. Apple toont daarna een code op je iPhone, iPad of Mac.
settings-accounts-nextcloud-browser = Je browser wordt geopend, zodat je je kunt aanmelden bij je server en Luft toegang kunt geven.
settings-accounts-use-app-password = Liever een app-wachtwoord gebruiken
settings-accounts-error-server = Voer het serveradres in
settings-accounts-error-apple-account = Voer het e-mailadres van je Apple Account in
settings-accounts-error-user = Voer de gebruikersnaam in
settings-accounts-error-password = Voer het wachtwoord in
settings-accounts-cancel = Annuleren
settings-accounts-back = Terug
settings-accounts-continue-in-browser = Doorgaan in browser
settings-accounts-sign-in = Aanmelden
settings-accounts-try-again = Opnieuw proberen
settings-accounts-continue = Doorgaan
settings-accounts-working = Verbinden met { $provider }…
settings-accounts-finish-in-browser = Rond het aanmelden bij { $provider } af in je browser. Luft ziet je wachtwoord nooit, en dit wordt vanzelf bijgewerkt zodra je klaar bent.
settings-accounts-no-browser = Er is geen browser geopend. Kopieer de link en open die in een browser.
settings-accounts-open-again = Pagina opnieuw openen
settings-accounts-copy-link = Link kopiëren
settings-accounts-copied = Gekopieerd
settings-accounts-code = Verificatiecode
    .placeholder = Code van 6 cijfers
settings-accounts-text-me = Stuur me liever een code per sms
settings-accounts-choose-phone = Naar welk nummer moet Apple de code sturen?
    .description = Sms sturen
settings-accounts-approve = Je Apple Account gebruikt Geavanceerde gegevensbescherming. Keur het verzoek goed op je iPhone, iPad of Mac zodat deze computer iCloud Drive kan openen.
