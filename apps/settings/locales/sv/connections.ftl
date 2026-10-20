### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Spara
settings-network-saving = Sparar …
settings-network-cancel = Avbryt
settings-network-connect = Anslut
settings-network-disconnect = Koppla från
settings-network-optional = Valfritt
settings-network-automatic = Automatiskt
settings-network-name = Namn
settings-network-password = Lösenord
settings-network-password-saved = Sparat lösenord
settings-network-username = Användarnamn
settings-network-router = Router
settings-network-dns-servers = DNS-servrar
settings-network-private-key = Privat nyckel
settings-network-connection-settings = Anslutningsinställningar
settings-network-connect-failed = Det gick inte att ansluta

## Network: connection states

settings-network-link-connected = Ansluten
settings-network-link-connecting = Ansluter …
settings-network-link-disconnected = Inte ansluten
settings-network-link-unplugged = Ingen kabel ansluten

## Network: Wi‑Fi security types

settings-network-security-open = Ingen
settings-network-security-owe = Förbättrat öppet
settings-network-security-wep = WEP
settings-network-security-psk = WPA2-Personal
settings-network-security-sae = WPA3-Personal
settings-network-security-enterprise = Enterprise

## Network: signal and radio details

settings-network-signal-excellent = Utmärkt
settings-network-signal-good = Bra
settings-network-signal-fair = Godtagbar
settings-network-signal-weak = Svag
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Kanal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Band
settings-network-detail-speed = Länkhastighet
settings-network-detail-access-point = Åtkomstpunkt
settings-network-detail-security = Säkerhet
settings-network-detail-ipv4 = IP-adress
settings-network-detail-ipv6 = IPv6-adress
settings-network-detail-router = Router
settings-network-detail-dns = DNS
settings-network-detail-mac = Maskinvaruadress

## Network panel

settings-network-wifi = Wi-Fi
settings-network-wifi-hardware-off = Avstängt med en maskinvaruknapp
settings-network-wifi-connected = Ansluten till { $network }
settings-network-airplane = Flygplansläge
    .description = Stänger av alla trådlösa anslutningar
settings-network-airplane-hardware = Påslaget med en maskinvaruknapp
settings-network-known = Kända nätverk
    .description = Nätverk som den här datorn har anslutit till tidigare, i närheten eller inte
settings-network-known-count = { $count ->
        [one] { $count } sparat nätverk
       *[other] { $count } sparade nätverk
    }
settings-network-known-in-range = Inom räckhåll
settings-network-wired = Trådbundet
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Ansluten · { $speed }
settings-network-empty = Inga nätverksanslutningar
    .description = Anslut en nätverkskabel eller en Wi-Fi-adapter för att komma ut på internet
settings-network-proxy = Proxy
    .description = Skicka webbtrafik via en annan server. Behövs ofta på jobb- och skolnätverk.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi-Fi-nätverk
settings-network-wifi-saved = Sparat
settings-network-wifi-enterprise = Logga in med ett jobb- eller skolkonto
settings-network-wifi-connect-failed = Det gick inte att ansluta till nätverket
settings-network-wifi-saved-password-failed = Det sparade lösenordet fungerade inte. Ange det igen.
settings-network-wifi-settings = Nätverksinställningar
settings-network-wifi-searching = Söker efter nätverk …
settings-network-hidden = Anslut till ett dolt nätverk
    .description = Ange nätverkets namn och hur det är skyddat.
settings-network-hidden-name = Nätverksnamn

## Network: joining a Wi‑Fi network

settings-network-join = Anslut till ”{ $network }”
settings-network-join-enterprise = Logga in med ditt jobb- eller skolkonto.
settings-network-join-password = Ange lösenordet för nätverket.
settings-network-join-failed = Det gick inte att ansluta till nätverket.
settings-network-join-sign-in-failed = Det gick inte att logga in. Kontrollera användarnamn och lösenord.
settings-network-join-wrong-password = Lösenordet fungerade inte. Kontrollera det och försök igen.

## Network: connection settings page

settings-network-forget = Glöm det här nätverket
    .description = Tar bort lösenordet och inställningarna från den här datorn
    .button = Glöm
settings-network-remove-vpn = Ta bort den här VPN-anslutningen
settings-network-remove-connection = Ta bort den här anslutningen
settings-network-remove-description = Raderar inställningarna från den här datorn
settings-network-remove = Ta bort

settings-network-general = Allmänt
settings-network-autoconnect = Anslut automatiskt
settings-network-autoconnect-wifi = Anslut till nätverket när det är inom räckhåll
settings-network-autoconnect-wired = Anslut så snart en kabel kopplas in
settings-network-autoconnect-vpn = Anslut när datorn är online
settings-network-autoconnect-other = Anslut när den är tillgänglig
settings-network-all-users = Tillgänglig för alla
    .description = Alla som loggar in här kan använda den
settings-network-metered = Anslutning med datapriser
    .description = Appar och uppdateringar håller igen på stora hämtningar
settings-network-metered-automatic = Identifiera automatiskt
settings-network-metered-yes = Med datapriser
settings-network-metered-no = Utan datapriser

settings-network-security = Säkerhet
settings-network-security-type = Säkerhetstyp

settings-network-advanced = Avancerat
settings-network-private-address = Privat adress
    .description = Gör datorn svårare att spåra på det här nätverket
settings-network-hardware-address = Maskinvaruadress
    .description = Adressen som datorn visar för nätverket
settings-network-mac-random = Ny adress varje gång
settings-network-mac-stable = Samma adress för det här nätverket
settings-network-mac-private-off = Av
settings-network-mac-builtin = Inbyggd adress
settings-network-mac-custom = Anpassad adress
settings-network-mtu = Största paketstorlek (MTU)
    .description = Lämna tomt om inte nätverket kräver en viss storlek
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Metod
    .label = { $family }-metod
settings-network-ip-dhcp = Automatiskt, endast adresser
settings-network-ip-manual = Manuellt
settings-network-ip-link-local = Endast länklokal
settings-network-ip-shared = Delas med andra enheter
settings-network-ip-ignore = Hanteras inte
settings-network-ip-disabled = Av
settings-network-ip-addresses = Adresser
    .description = Var och en med sitt prefix, till exempel { $example }
settings-network-ip-address = Adress { $number }
settings-network-ip-remove-address = Ta bort adress
settings-network-ip-add-address = Lägg till adress
settings-network-ip-router = { $family }-router
settings-network-ip-automatic-dns = Automatisk DNS
    .description = Använd de DNS-servrar som nätverket föreslår
settings-network-ip-dns-first = Används före de föreslagna
settings-network-ip-dns-separate = Skilj adresserna åt med kommatecken
settings-network-ip-dns-servers = DNS-servrar för { $family }
settings-network-ip-search-domains = Sökdomäner
    .description = Används när ett namn saknar domän, till exempel ”skrivare”
    .label = Sökdomäner för { $family }
settings-network-ip-automatic-routes = Automatiska vägar
    .description = Använd de vägar som nätverket föreslår
settings-network-ip-routes = Vägar
    .description = Skicka trafik till vissa nätverk via en annan router
settings-network-ip-add-route = Lägg till väg
settings-network-route-network = Nätverk
settings-network-route-priority = Prioritet
settings-network-route-remove = Ta bort väg

## Network: work or school (802.1X) sign-in

settings-network-eap = Autentisering
settings-network-eap-peap = Skyddad EAP (PEAP)
settings-network-eap-ttls = Tunnlad TLS (TTLS)
settings-network-eap-tls = Certifikat (TLS)
settings-network-eap-inner = Inre autentisering
settings-network-client-certificate = Ditt certifikat
settings-network-private-key-password = Lösenord för privat nyckel
    .placeholder = Om nyckeln har ett
settings-network-anonymous-identity = Anonym identitet
    .description = Lämna tomt om inte nätverket kräver det
settings-network-ca = CA-certifikat
    .description = Bekräftar att du ansluter till det riktiga nätverket
settings-network-ca-system = Använd systemets certifikat
settings-network-ca-file = Välj en fil …
settings-network-ca-another-file = Välj en annan fil …
settings-network-ca-none = Kontrollera inte
settings-network-choose-file = Välj …
settings-network-server-domain = Serverdomän
    .description = Anslut bara till servrar i den här domänen

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Ange ett namn
settings-network-error-no-addresses = Lägg till minst en adress
settings-network-error-address = Ange en adress med prefix, till exempel { $example }
settings-network-error-router = Ange en routeradress, till exempel { $example }
settings-network-error-dns = ”{ $address }” är inte en giltig adress
settings-network-error-search-domain = ”{ $domain }” är inte en giltig domän
settings-network-error-route = Ange ett nätverk, till exempel { $example }
settings-network-error-priority = Ange prioriteten som ett heltal
settings-network-error-username = Ange ditt användarnamn
settings-network-error-domain = Ange en domän, till exempel example.com
settings-network-error-certificate = Välj ditt certifikat
settings-network-error-private-key = Välj din privata nyckel
settings-network-error-mtu = Ange ett tal från { $lowest } till { $highest } eller lämna tomt
settings-network-error-mac = Ange en adress som 12:34:56:78:9A:BC
settings-network-error-password = Ange ditt lösenord
settings-network-error-password-length = { $count ->
        [one] Använd minst { $count } tecken
       *[other] Använd minst { $count } tecken
    }

## Network: proxy

settings-network-proxy-off = Av
settings-network-proxy-manual = Manuellt
settings-network-proxy-url = Konfigurationsadress
settings-network-proxy-http = Webb (HTTP)
settings-network-proxy-https = Säker webb (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Server
    .label = Server för { $protocol }
settings-network-proxy-port = Port
    .label = Port för { $protocol }
settings-network-proxy-skip = Använd inte proxyn för
settings-network-proxy-error-url = Ange en webbadress, till exempel http://example.com/proxy.pac
settings-network-proxy-error-host = Ange bara servernamnet, till exempel proxy.example.com
settings-network-proxy-error-port = Ange en port från 1 till 65535
settings-network-proxy-save-failed = Det gick inte att spara proxyinställningarna

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importera från en fil
    .description = WireGuard, OpenVPN och andra VPN-konfigurationsfiler
settings-network-vpn-importing = Importerar …
settings-network-wireguard = Konfigurera WireGuard
    .description = Ange uppgifterna från din VPN-leverantör eller server
settings-network-wireguard-dialog = Du får uppgifterna från din VPN-leverantör eller av den som äger servern.
settings-network-wireguard-name-example = Hemma-VPN
settings-network-wireguard-public-key = Offentlig nyckel { $key }
settings-network-wireguard-public-key-pending = Den offentliga nyckeln att dela visas här
settings-network-wireguard-copy = Kopiera offentlig nyckel
settings-network-wireguard-copied = Kopierad
settings-network-wireguard-generate = Skapa en ny nyckel
settings-network-wireguard-addresses = Datorns adresser i VPN-nätverket
settings-network-wireguard-server-key = Serverns offentliga nyckel
settings-network-wireguard-endpoint = Serveradress
settings-network-wireguard-allowed-ips = Tillåtna IP-adresser
    .description = Trafik till de här intervallen går genom VPN-nätverket
settings-network-wireguard-preshared-key = I förväg delad nyckel
settings-network-wireguard-keepalive = Keepalive
    .description = Hjälper anslutningen att hållas uppe bakom en router
    .placeholder = Valfritt, i sekunder
settings-network-wireguard-add = Lägg till
settings-network-wireguard-adding = Lägger till …
settings-network-wireguard-error-private-key = Ange eller skapa en privat nyckel
settings-network-wireguard-error-addresses = Ange minst en adress
settings-network-wireguard-error-server-key = Ange serverns offentliga nyckel
settings-network-wireguard-error-endpoint = Ange serverns adress och port
settings-network-wireguard-error-allowed-ips = Ange minst ett intervall
settings-network-wireguard-error-keepalive = Ange ett antal sekunder

## Bluetooth panel

settings-bluetooth-hardware-off = Avstängt med en maskinvaruknapp
settings-bluetooth-power-on-failed = Det gick inte att slå på Bluetooth
settings-bluetooth-power-off-failed = Det gick inte att stänga av Bluetooth
settings-bluetooth-visible = Synlig för enheter i närheten
    .description = Låter telefoner och datorer hitta den här datorn
settings-bluetooth-visible-as = Visas som ”{ $name }”
settings-bluetooth-visible-duration = Förbli synlig
settings-bluetooth-visible-for = { $minutes ->
        [one] I { $minutes } minut
       *[other] I { $minutes } minuter
    }
settings-bluetooth-visible-until-off = Tills den stängs av
settings-bluetooth-visible-failed = Det gick inte att ändra om datorn är synlig
settings-bluetooth-paired = Mina enheter
settings-bluetooth-nearby = Enheter i närheten
settings-bluetooth-searching = Söker efter enheter …
    .description = Försätt enheten du vill lägga till i parkopplingsläge
settings-bluetooth-blocked = Bluetooth är avstängt med en maskinvaruknapp
    .description = Slå på det med knappen eller tangenten på datorn
settings-bluetooth-details = Enhetsinformation
settings-bluetooth-connected = Ansluten
settings-bluetooth-connected-battery = Ansluten · batteri { $battery }
settings-bluetooth-connecting = Ansluter …
settings-bluetooth-disconnecting = Kopplar från …
settings-bluetooth-pairing = Parkopplar …
settings-bluetooth-forget-confirm = Vill du glömma ”{ $name }”?
    .description = Du måste parkoppla den igen för att använda den med den här datorn.
settings-bluetooth-forget = Glöm
settings-bluetooth-cancel = Avbryt
settings-bluetooth-connect = Anslut
settings-bluetooth-disconnect = Koppla från
settings-bluetooth-done = Klar

## Bluetooth: device details

settings-bluetooth-type = Typ
settings-bluetooth-battery = Batteri
settings-bluetooth-address = Adress
settings-bluetooth-autoconnect = Anslut automatiskt
    .description = När den är i närheten
settings-bluetooth-kind-headphones = Hörlurar
settings-bluetooth-kind-speaker = Högtalare
settings-bluetooth-kind-mouse = Mus
settings-bluetooth-kind-keyboard = Tangentbord
settings-bluetooth-kind-gamepad = Spelkontroll
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Dator
settings-bluetooth-kind-tablet = Surfplatta
settings-bluetooth-kind-display = Skärm
settings-bluetooth-kind-printer = Skrivare
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Annan enhet

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = enheten
settings-bluetooth-request-confirm = Vill du parkoppla med { $name }?
    .description = Kontrollera att { $name } visar samma kod.
settings-bluetooth-request-authorize = Vill du tillåta { $name } att parkoppla?
    .description = { $name } kommer att kunna ansluta till den här datorn.
settings-bluetooth-request-pin = Ange PIN-koden för { $name }
    .description = Den är ofta 0000 eller 1234. Om ingen av dem fungerar står den i enhetens handbok.
settings-bluetooth-request-passkey = Ange koden som visas på { $name }
    .description = Skriv de sex siffrorna exakt som de visas.
settings-bluetooth-request-display = Parkoppla med { $name }
    .description = Skriv den här koden på { $name } och tryck sedan på Enter.
settings-bluetooth-pair = Parkoppla
settings-bluetooth-allow = Tillåt

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Ta med dina enheter från Windows
    .description = { $count ->
        [one] { $devices } är parkopplad i Windows. Använd den här utan att parkoppla igen.
       *[other] { $devices } är parkopplade i Windows. Använd dem här utan att parkoppla igen.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } till
       *[other] { $count } till
    }

## Accounts panel

settings-accounts-unavailable = Konton är inte tillgängliga
    .description = Kontotjänsten är inte installerad på den här datorn
settings-accounts-online = Onlinekonton
    .description = Varje konto är en mapp i Cloud i din hemmapp, som alla appar kan öppna. Filerna hämtas när du öppnar dem.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud eller WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Logga in igen för att fortsätta använda det
settings-accounts-paused-metered = Synkroniseringen är pausad på en anslutning med datapriser
settings-accounts-paused-battery = Synkroniseringen är pausad medan batterinivån är låg
settings-accounts-connecting = Ansluter …
settings-accounts-offline = Offline
settings-accounts-offline-kept = Offline, sparade filer finns kvar
settings-accounts-not-connected = Inte anslutet
settings-accounts-syncing = { $count ->
        [one] Synkroniserar { $count } ändring
       *[other] Synkroniserar { $count } ändringar
    }
settings-accounts-name = Namn
settings-accounts-folder = Mapp
settings-accounts-server = Server
settings-accounts-storage = Lagring
settings-accounts-storage-used = { $used } av { $total } används
settings-accounts-on-device = På den här enheten
settings-accounts-kept = { $count ->
        [one] { $count } objekt sparat, resten hämtas när det öppnas
       *[other] { $count } objekt sparade, resten hämtas när det öppnas
    }
settings-accounts-on-demand = Filerna hämtas när du öppnar dem
settings-accounts-sign-in-again = Logga in igen
settings-accounts-keep = Behåll
settings-accounts-remove = Ta bort
settings-accounts-remove-confirm = Ta bort från den här datorn
settings-accounts-removing = Tar bort …
settings-accounts-remove-note = Dina filer finns kvar i { $provider }. Ändringar som gjorts här skickas upp först.

## Accounts: providers

settings-accounts-provider-icloud = Ditt Apple-konto, bekräftat med en kod från din iPhone, iPad eller Mac
settings-accounts-provider-onedrive = Ett personligt Microsoft-konto eller ett jobb- eller skolkonto, i webbläsaren
settings-accounts-provider-dropbox = Ett Dropbox-konto, i webbläsaren
settings-accounts-provider-nextcloud = Din egen eller din organisations server
settings-accounts-provider-webdav = Alla servrar som använder WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Logga in på { $account } igen
settings-accounts-browser = Webbläsaren öppnas så att du kan logga in med { $provider }. Luft ser aldrig ditt lösenord.
settings-accounts-password-for = Ange lösenordet för { $user }.
settings-accounts-apple-account = Apple-konto
settings-accounts-password = Lösenord
settings-accounts-app-password = Applösenord
settings-accounts-user = Användarnamn
settings-accounts-apple-note = Använd lösenordet för ditt Apple-konto, appspecifika lösenord fungerar inte här. Apple visar sedan en kod på din iPhone, iPad eller Mac.
settings-accounts-nextcloud-browser = Webbläsaren öppnas så att du kan logga in på din server och ge Luft åtkomst.
settings-accounts-use-app-password = Använd ett applösenord i stället
settings-accounts-error-server = Ange serveradressen
settings-accounts-error-apple-account = Ange e-postadressen för ditt Apple-konto
settings-accounts-error-user = Ange användarnamnet
settings-accounts-error-password = Ange lösenordet
settings-accounts-cancel = Avbryt
settings-accounts-back = Tillbaka
settings-accounts-continue-in-browser = Fortsätt i webbläsaren
settings-accounts-sign-in = Logga in
settings-accounts-try-again = Försök igen
settings-accounts-continue = Fortsätt
settings-accounts-working = Kontaktar { $provider } …
settings-accounts-finish-in-browser = Slutför inloggningen med { $provider } i webbläsaren. Luft ser aldrig ditt lösenord, och det här uppdateras av sig självt när du är klar.
settings-accounts-no-browser = Ingen webbläsare öppnades. Kopiera länken och öppna den i en webbläsare.
settings-accounts-open-again = Öppna sidan igen
settings-accounts-copy-link = Kopiera länken
settings-accounts-copied = Kopierad
settings-accounts-code = Verifieringskod
    .placeholder = 6-siffrig kod
settings-accounts-text-me = Skicka en kod via sms i stället
settings-accounts-choose-phone = Till vilket nummer ska Apple skicka koden?
    .description = Skicka ett sms
settings-accounts-approve = Ditt Apple-konto använder Avancerat dataskydd. Godkänn begäran på din iPhone, iPad eller Mac så att den här datorn kan öppna iCloud Drive.
