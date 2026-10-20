### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Zapisz
settings-network-saving = Zapisywanie…
settings-network-cancel = Anuluj
settings-network-connect = Połącz
settings-network-disconnect = Rozłącz
settings-network-optional = Opcjonalnie
settings-network-automatic = Automatycznie
settings-network-name = Nazwa
settings-network-password = Hasło
settings-network-password-saved = Zapisane hasło
settings-network-username = Nazwa użytkownika
settings-network-router = Router
settings-network-dns-servers = Serwery DNS
settings-network-private-key = Klucz prywatny
settings-network-connection-settings = Ustawienia połączenia
settings-network-connect-failed = Nie udało się połączyć

## Network: connection states

settings-network-link-connected = Połączono
settings-network-link-connecting = Łączenie…
settings-network-link-disconnected = Brak połączenia
settings-network-link-unplugged = Kabel odłączony

## Network: Wi‑Fi security types

settings-network-security-open = Brak
settings-network-security-owe = Rozszerzona otwarta
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Enterprise

## Network: signal and radio details

settings-network-signal-excellent = Doskonały
settings-network-signal-good = Dobry
settings-network-signal-fair = Średni
settings-network-signal-weak = Słaby
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Kanał { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Sygnał
settings-network-detail-band = Pasmo
settings-network-detail-speed = Szybkość łącza
settings-network-detail-access-point = Punkt dostępu
settings-network-detail-security = Zabezpieczenia
settings-network-detail-ipv4 = Adres IP
settings-network-detail-ipv6 = Adres IPv6
settings-network-detail-router = Router
settings-network-detail-dns = DNS
settings-network-detail-mac = Adres sprzętowy

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Wyłączono przełącznikiem sprzętowym
settings-network-wifi-connected = Połączono z siecią { $network }
settings-network-airplane = Tryb samolotowy
    .description = Wyłącza wszystkie połączenia bezprzewodowe
settings-network-airplane-hardware = Włączono przełącznikiem sprzętowym
settings-network-known = Znane sieci
    .description = Sieci, z którymi ten komputer już się łączył, w pobliżu i nie tylko
settings-network-known-count = { $count ->
        [one] { $count } zapisana sieć
        [few] { $count } zapisane sieci
        [many] { $count } zapisanych sieci
       *[other] { $count } zapisanej sieci
    }
settings-network-known-in-range = W zasięgu
settings-network-wired = Przewodowe
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Połączono · { $speed }
settings-network-empty = Brak połączeń sieciowych
    .description = Podłącz kabel sieciowy lub kartę Wi‑Fi, aby połączyć się z internetem
settings-network-proxy = Serwer proxy
    .description = Przesyłaj ruch internetowy przez inny serwer. Często jest to wymagane w sieciach firmowych i szkolnych.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Sieci Wi‑Fi
settings-network-wifi-saved = Zapisana
settings-network-wifi-enterprise = Zaloguj się kontem służbowym lub szkolnym
settings-network-wifi-connect-failed = Nie udało się połączyć z tą siecią
settings-network-wifi-saved-password-failed = Zapisane hasło nie zadziałało. Wpisz je ponownie.
settings-network-wifi-settings = Ustawienia sieci
settings-network-wifi-searching = Wyszukiwanie sieci…
settings-network-hidden = Połącz z ukrytą siecią
    .description = Wpisz nazwę sieci i wybierz sposób jej zabezpieczenia.
settings-network-hidden-name = Nazwa sieci

## Network: joining a Wi‑Fi network

settings-network-join = Połącz z siecią „{ $network }”
settings-network-join-enterprise = Zaloguj się kontem służbowym lub szkolnym.
settings-network-join-password = Wpisz hasło do tej sieci.
settings-network-join-failed = Nie udało się połączyć z tą siecią.
settings-network-join-sign-in-failed = Nie udało się zalogować. Sprawdź nazwę użytkownika i hasło.
settings-network-join-wrong-password = To hasło nie zadziałało. Sprawdź je i spróbuj ponownie.

## Network: connection settings page

settings-network-forget = Zapomnij tę sieć
    .description = Usuwa jej hasło i ustawienia z tego komputera
    .button = Zapomnij
settings-network-remove-vpn = Usuń tę sieć VPN
settings-network-remove-connection = Usuń to połączenie
settings-network-remove-description = Usuwa jego ustawienia z tego komputera
settings-network-remove = Usuń

settings-network-general = Ogólne
settings-network-autoconnect = Łącz automatycznie
settings-network-autoconnect-wifi = Łącz z tą siecią zawsze, gdy jest w zasięgu
settings-network-autoconnect-wired = Łącz od razu po podłączeniu kabla
settings-network-autoconnect-vpn = Łącz zawsze, gdy ten komputer jest online
settings-network-autoconnect-other = Łącz zawsze, gdy jest dostępne
settings-network-all-users = Dostępne dla wszystkich
    .description = Może z niego korzystać każdy, kto się tu zaloguje
settings-network-metered = Połączenie taryfowe
    .description = Aplikacje i aktualizacje wstrzymują duże pobierania
settings-network-metered-automatic = Wykrywaj automatycznie
settings-network-metered-yes = Taryfowe
settings-network-metered-no = Nietaryfowe

settings-network-security = Zabezpieczenia
settings-network-security-type = Typ zabezpieczeń

settings-network-advanced = Zaawansowane
settings-network-private-address = Prywatny adres
    .description = Utrudnia śledzenie tego komputera w tej sieci
settings-network-hardware-address = Adres sprzętowy
    .description = Adres, którym ten komputer przedstawia się w sieci
settings-network-mac-random = Nowy adres za każdym razem
settings-network-mac-stable = Ten sam adres dla tej sieci
settings-network-mac-private-off = Wyłączony
settings-network-mac-builtin = Wbudowany adres
settings-network-mac-custom = Własny adres
settings-network-mtu = Maksymalny rozmiar pakietu (MTU)
    .description = Pozostaw puste, chyba że sieć wymaga określonego rozmiaru
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Metoda
    .label = Metoda { $family }
settings-network-ip-dhcp = Automatycznie, tylko adresy
settings-network-ip-manual = Ręcznie
settings-network-ip-link-local = Tylko adres lokalny łącza
settings-network-ip-shared = Udostępniane innym urządzeniom
settings-network-ip-ignore = Niezarządzane
settings-network-ip-disabled = Wyłączone
settings-network-ip-addresses = Adresy
    .description = Każdy z prefiksem, na przykład { $example }
settings-network-ip-address = Adres { $number }
settings-network-ip-remove-address = Usuń adres
settings-network-ip-add-address = Dodaj adres
settings-network-ip-router = Router { $family }
settings-network-ip-automatic-dns = Automatyczny DNS
    .description = Używaj serwerów DNS proponowanych przez tę sieć
settings-network-ip-dns-first = Używane przed proponowanymi
settings-network-ip-dns-separate = Oddziel adresy przecinkami
settings-network-ip-dns-servers = Serwery DNS { $family }
settings-network-ip-search-domains = Domeny wyszukiwania
    .description = Używane, gdy nazwa nie ma domeny, na przykład „drukarka”
    .label = Domeny wyszukiwania { $family }
settings-network-ip-automatic-routes = Automatyczne trasy
    .description = Używaj tras proponowanych przez tę sieć
settings-network-ip-routes = Trasy
    .description = Kieruj ruch do niektórych sieci przez inny router
settings-network-ip-add-route = Dodaj trasę
settings-network-route-network = Sieć
settings-network-route-priority = Priorytet
settings-network-route-remove = Usuń trasę

## Network: work or school (802.1X) sign-in

settings-network-eap = Uwierzytelnianie
settings-network-eap-peap = Chroniony EAP (PEAP)
settings-network-eap-ttls = Tunelowany TLS (TTLS)
settings-network-eap-tls = Certyfikat (TLS)
settings-network-eap-inner = Uwierzytelnianie wewnętrzne
settings-network-client-certificate = Twój certyfikat
settings-network-private-key-password = Hasło klucza prywatnego
    .placeholder = Jeśli klucz je ma
settings-network-anonymous-identity = Anonimowa tożsamość
    .description = Pozostaw puste, chyba że sieć jej wymaga
settings-network-ca = Certyfikat CA
    .description = Potwierdza, że łączysz się z właściwą siecią
settings-network-ca-system = Użyj certyfikatów systemowych
settings-network-ca-file = Wybierz plik…
settings-network-ca-another-file = Wybierz inny plik…
settings-network-ca-none = Nie sprawdzaj
settings-network-choose-file = Wybierz…
settings-network-server-domain = Domena serwera
    .description = Łącz tylko z serwerami w tej domenie

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Wpisz nazwę
settings-network-error-no-addresses = Dodaj co najmniej jeden adres
settings-network-error-address = Wpisz adres z prefiksem, na przykład { $example }
settings-network-error-router = Wpisz adres routera, na przykład { $example }
settings-network-error-dns = „{ $address }” nie jest prawidłowym adresem
settings-network-error-search-domain = „{ $domain }” nie jest prawidłową domeną
settings-network-error-route = Wpisz sieć, na przykład { $example }
settings-network-error-priority = Priorytet musi być liczbą całkowitą
settings-network-error-username = Wpisz nazwę użytkownika
settings-network-error-domain = Wpisz domenę, na przykład example.com
settings-network-error-certificate = Wybierz swój certyfikat
settings-network-error-private-key = Wybierz swój klucz prywatny
settings-network-error-mtu = Użyj liczby od { $lowest } do { $highest } lub pozostaw puste
settings-network-error-mac = Wpisz adres w postaci 12:34:56:78:9A:BC
settings-network-error-password = Wpisz hasło
settings-network-error-password-length = { $count ->
        [one] Hasło musi mieć co najmniej { $count } znak
        [few] Hasło musi mieć co najmniej { $count } znaki
        [many] Hasło musi mieć co najmniej { $count } znaków
       *[other] Hasło musi mieć co najmniej { $count } znaku
    }

## Network: proxy

settings-network-proxy-off = Wyłączony
settings-network-proxy-manual = Ręcznie
settings-network-proxy-url = Adres konfiguracji
settings-network-proxy-http = Sieć (HTTP)
settings-network-proxy-https = Bezpieczna sieć (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Serwer
    .label = Serwer { $protocol }
settings-network-proxy-port = Port
    .label = Port { $protocol }
settings-network-proxy-skip = Nie używaj serwera proxy dla
settings-network-proxy-error-url = Wpisz adres internetowy, na przykład http://example.com/proxy.pac
settings-network-proxy-error-host = Wpisz samą nazwę serwera, na przykład proxy.example.com
settings-network-proxy-error-port = Użyj portu od 1 do 65535
settings-network-proxy-save-failed = Nie udało się zapisać ustawień serwera proxy

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importuj z pliku
    .description = Pliki konfiguracyjne WireGuard, OpenVPN i innych sieci VPN
settings-network-vpn-importing = Importowanie…
settings-network-wireguard = Skonfiguruj WireGuard
    .description = Wpisz dane od dostawcy VPN lub z serwera
settings-network-wireguard-dialog = Te dane może ci przekazać dostawca VPN lub właściciel serwera.
settings-network-wireguard-name-example = Domowa sieć VPN
settings-network-wireguard-public-key = Klucz publiczny { $key }
settings-network-wireguard-public-key-pending = Tu pojawi się klucz publiczny do udostępnienia
settings-network-wireguard-copy = Kopiuj klucz publiczny
settings-network-wireguard-copied = Skopiowano
settings-network-wireguard-generate = Wygeneruj nowy klucz
settings-network-wireguard-addresses = Adresy tego komputera w sieci VPN
settings-network-wireguard-server-key = Klucz publiczny serwera
settings-network-wireguard-endpoint = Adres serwera
settings-network-wireguard-allowed-ips = Dozwolone adresy IP
    .description = Ruch do tych zakresów idzie przez VPN
settings-network-wireguard-preshared-key = Klucz współdzielony
settings-network-wireguard-keepalive = Keepalive
    .description = Pomaga utrzymać połączenie za routerem
    .placeholder = Opcjonalnie, w sekundach
settings-network-wireguard-add = Dodaj
settings-network-wireguard-adding = Dodawanie…
settings-network-wireguard-error-private-key = Wpisz lub wygeneruj klucz prywatny
settings-network-wireguard-error-addresses = Wpisz co najmniej jeden adres
settings-network-wireguard-error-server-key = Wpisz klucz publiczny serwera
settings-network-wireguard-error-endpoint = Wpisz adres i port serwera
settings-network-wireguard-error-allowed-ips = Wpisz co najmniej jeden zakres
settings-network-wireguard-error-keepalive = Wpisz liczbę sekund

## Bluetooth panel

settings-bluetooth-hardware-off = Wyłączono przełącznikiem sprzętowym
settings-bluetooth-power-on-failed = Nie udało się włączyć Bluetooth
settings-bluetooth-power-off-failed = Nie udało się wyłączyć Bluetooth
settings-bluetooth-visible = Widoczny dla urządzeń w pobliżu
    .description = Telefony i komputery mogą znaleźć ten komputer
settings-bluetooth-visible-as = Widoczny jako „{ $name }”
settings-bluetooth-visible-duration = Czas widoczności
settings-bluetooth-visible-for = { $minutes ->
        [one] Przez { $minutes } minutę
        [few] Przez { $minutes } minuty
        [many] Przez { $minutes } minut
       *[other] Przez { $minutes } minuty
    }
settings-bluetooth-visible-until-off = Do wyłączenia
settings-bluetooth-visible-failed = Nie udało się zmienić widoczności tego komputera
settings-bluetooth-paired = Moje urządzenia
settings-bluetooth-nearby = Urządzenia w pobliżu
settings-bluetooth-searching = Wyszukiwanie urządzeń…
    .description = Przełącz urządzenie, które chcesz dodać, w tryb parowania
settings-bluetooth-blocked = Bluetooth jest wyłączony przełącznikiem sprzętowym
    .description = Włącz go przełącznikiem lub klawiszem na komputerze
settings-bluetooth-details = Szczegóły urządzenia
settings-bluetooth-connected = Połączono
settings-bluetooth-connected-battery = Połączono · bateria { $battery }
settings-bluetooth-connecting = Łączenie…
settings-bluetooth-disconnecting = Rozłączanie…
settings-bluetooth-pairing = Parowanie…
settings-bluetooth-forget-confirm = Zapomnieć urządzenie „{ $name }”?
    .description = Aby używać go z tym komputerem, trzeba będzie sparować je ponownie.
settings-bluetooth-forget = Zapomnij
settings-bluetooth-cancel = Anuluj
settings-bluetooth-connect = Połącz
settings-bluetooth-disconnect = Rozłącz
settings-bluetooth-done = Gotowe

## Bluetooth: device details

settings-bluetooth-type = Typ
settings-bluetooth-battery = Bateria
settings-bluetooth-address = Adres
settings-bluetooth-autoconnect = Łącz automatycznie
    .description = Zawsze, gdy jest w pobliżu
settings-bluetooth-kind-headphones = Słuchawki
settings-bluetooth-kind-speaker = Głośnik
settings-bluetooth-kind-mouse = Mysz
settings-bluetooth-kind-keyboard = Klawiatura
settings-bluetooth-kind-gamepad = Kontroler gier
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Komputer
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Ekran
settings-bluetooth-kind-printer = Drukarka
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Inne urządzenie

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = urządzenie
settings-bluetooth-request-confirm = Sparować z: { $name }?
    .description = Upewnij się, że urządzenie pokazuje ten sam kod.
settings-bluetooth-request-authorize = Zezwolić na parowanie: { $name }?
    .description = Urządzenie będzie mogło łączyć się z tym komputerem.
settings-bluetooth-request-pin = Wpisz kod PIN dla: { $name }
    .description = Często jest to 0000 lub 1234. Jeśli żaden nie działa, sprawdź instrukcję urządzenia.
settings-bluetooth-request-passkey = Wpisz kod widoczny na: { $name }
    .description = Wpisz sześć cyfr dokładnie tak, jak są wyświetlone.
settings-bluetooth-request-display = Parowanie z: { $name }
    .description = Wpisz ten kod na urządzeniu, a następnie naciśnij Enter.
settings-bluetooth-pair = Sparuj
settings-bluetooth-allow = Zezwól

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Przenieś urządzenia z systemu Windows
    .description = { $count ->
        [one] Sparowano w systemie Windows: { $devices }. Używaj go tutaj bez ponownego parowania.
        [few] Sparowano w systemie Windows: { $devices }. Używaj ich tutaj bez ponownego parowania.
        [many] Sparowano w systemie Windows: { $devices }. Używaj ich tutaj bez ponownego parowania.
       *[other] Sparowano w systemie Windows: { $devices }. Używaj ich tutaj bez ponownego parowania.
    }
settings-bluetooth-windows-more = { $count ->
        [one] jeszcze { $count }
        [few] jeszcze { $count }
        [many] jeszcze { $count }
       *[other] jeszcze { $count }
    }

## Accounts panel

settings-accounts-unavailable = Konta są niedostępne
    .description = Usługa kont nie jest zainstalowana na tym komputerze
settings-accounts-online = Konta online
    .description = Każde konto ma swój folder w folderze Cloud w folderze domowym i każda aplikacja może go otworzyć. Pliki pobierają się, gdy je otwierasz.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud lub WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Zaloguj się ponownie, aby dalej z niego korzystać
settings-accounts-paused-metered = Synchronizacja wstrzymana przy połączeniu taryfowym
settings-accounts-paused-battery = Synchronizacja wstrzymana z powodu niskiego poziomu baterii
settings-accounts-connecting = Łączenie…
settings-accounts-offline = Offline
settings-accounts-offline-kept = Offline, zachowane pliki są nadal dostępne
settings-accounts-not-connected = Brak połączenia
settings-accounts-syncing = { $count ->
        [one] Synchronizowanie { $count } zmiany
        [few] Synchronizowanie { $count } zmian
        [many] Synchronizowanie { $count } zmian
       *[other] Synchronizowanie { $count } zmiany
    }
settings-accounts-name = Nazwa
settings-accounts-folder = Folder
settings-accounts-server = Serwer
settings-accounts-storage = Miejsce
settings-accounts-storage-used = Zajęte: { $used } z { $total }
settings-accounts-on-device = Na tym urządzeniu
settings-accounts-kept = { $count ->
        [one] Zachowano { $count } element, reszta pobiera się po otwarciu
        [few] Zachowano { $count } elementy, reszta pobiera się po otwarciu
        [many] Zachowano { $count } elementów, reszta pobiera się po otwarciu
       *[other] Zachowano { $count } elementu, reszta pobiera się po otwarciu
    }
settings-accounts-on-demand = Pliki pobierają się, gdy je otwierasz
settings-accounts-sign-in-again = Zaloguj się ponownie
settings-accounts-keep = Zachowaj
settings-accounts-remove = Usuń
settings-accounts-remove-confirm = Usuń z tego komputera
settings-accounts-removing = Usuwanie…
settings-accounts-remove-note = Twoje pliki pozostaną w usłudze { $provider }. Zmiany wprowadzone tutaj zostaną najpierw wysłane.

## Accounts: providers

settings-accounts-provider-icloud = Twoje konto Apple, potwierdzone kodem z iPhone’a, iPada lub Maca
settings-accounts-provider-onedrive = Osobiste, służbowe lub szkolne konto Microsoft, w przeglądarce
settings-accounts-provider-dropbox = Konto Dropbox, w przeglądarce
settings-accounts-provider-nextcloud = Twój własny serwer lub serwer twojej organizacji
settings-accounts-provider-webdav = Dowolny serwer obsługujący WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Zaloguj się ponownie: { $account }
settings-accounts-browser = Otworzy się przeglądarka, w której zalogujesz się w usłudze { $provider }. Luft nigdy nie widzi twojego hasła.
settings-accounts-password-for = Wpisz hasło dla { $user }.
settings-accounts-apple-account = Konto Apple
settings-accounts-password = Hasło
settings-accounts-app-password = Hasło aplikacji
settings-accounts-user = Nazwa użytkownika
settings-accounts-apple-note = Użyj hasła do konta Apple; hasła do aplikacji tu nie działają. Apple wyświetli potem kod na iPhonie, iPadzie lub Macu.
settings-accounts-nextcloud-browser = Otworzy się przeglądarka, w której zalogujesz się na swój serwer i zezwolisz na dostęp dla Luft.
settings-accounts-use-app-password = Użyj zamiast tego hasła aplikacji
settings-accounts-error-server = Wpisz adres serwera
settings-accounts-error-apple-account = Wpisz adres e-mail konta Apple
settings-accounts-error-user = Wpisz nazwę użytkownika
settings-accounts-error-password = Wpisz hasło
settings-accounts-cancel = Anuluj
settings-accounts-back = Wstecz
settings-accounts-continue-in-browser = Kontynuuj w przeglądarce
settings-accounts-sign-in = Zaloguj się
settings-accounts-try-again = Spróbuj ponownie
settings-accounts-continue = Kontynuuj
settings-accounts-working = Łączenie z usługą { $provider }…
settings-accounts-finish-in-browser = Dokończ logowanie w usłudze { $provider } w przeglądarce. Luft nigdy nie widzi twojego hasła, a ten widok odświeży się sam, gdy skończysz.
settings-accounts-no-browser = Nie otworzyła się żadna przeglądarka. Skopiuj link i otwórz go w przeglądarce.
settings-accounts-open-again = Otwórz stronę ponownie
settings-accounts-copy-link = Kopiuj link
settings-accounts-copied = Skopiowano
settings-accounts-code = Kod weryfikacyjny
    .placeholder = Kod 6-cyfrowy
settings-accounts-text-me = Wyślij mi kod SMS-em
settings-accounts-choose-phone = Na który numer Apple ma wysłać kod?
    .description = Wyślij SMS
settings-accounts-approve = Twoje konto Apple używa zaawansowanej ochrony danych. Zatwierdź prośbę na iPhonie, iPadzie lub Macu, aby ten komputer mógł otworzyć iCloud Drive.
