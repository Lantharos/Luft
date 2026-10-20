### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Mentés
settings-network-saving = Mentés…
settings-network-cancel = Mégse
settings-network-connect = Csatlakozás
settings-network-disconnect = Leválasztás
settings-network-optional = Nem kötelező
settings-network-automatic = Automatikus
settings-network-name = Név
settings-network-password = Jelszó
settings-network-password-saved = Mentett jelszó
settings-network-username = Felhasználónév
settings-network-router = Útválasztó
settings-network-dns-servers = DNS-kiszolgálók
settings-network-private-key = Titkos kulcs
settings-network-connection-settings = Kapcsolat beállításai
settings-network-connect-failed = Nem sikerült csatlakozni

## Network: connection states

settings-network-link-connected = Csatlakozva
settings-network-link-connecting = Csatlakozás…
settings-network-link-disconnected = Nincs csatlakozva
settings-network-link-unplugged = Kábel kihúzva

## Network: Wi-Fi security types

settings-network-security-open = Nincs
settings-network-security-owe = Továbbfejlesztett nyílt
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Személyes
settings-network-security-sae = WPA3 Személyes
settings-network-security-enterprise = Vállalati

## Network: signal and radio details

settings-network-signal-excellent = Kiváló
settings-network-signal-good = Jó
settings-network-signal-fair = Közepes
settings-network-signal-weak = Gyenge
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · { $channel }. csatorna

## Network: details rows of a connection

settings-network-detail-signal = Jel
settings-network-detail-band = Sáv
settings-network-detail-speed = Kapcsolati sebesség
settings-network-detail-access-point = Hozzáférési pont
settings-network-detail-security = Biztonság
settings-network-detail-ipv4 = IP-cím
settings-network-detail-ipv6 = IPv6-cím
settings-network-detail-router = Útválasztó
settings-network-detail-dns = DNS
settings-network-detail-mac = Hardvercím

## Network panel

settings-network-wifi = Wi-Fi
settings-network-wifi-hardware-off = Hardveres kapcsoló kikapcsolta
settings-network-wifi-connected = Csatlakozva: { $network }
settings-network-airplane = Repülőgép mód
    .description = Minden vezeték nélküli kapcsolatot kikapcsol
settings-network-airplane-hardware = Hardveres kapcsoló bekapcsolta
settings-network-known = Ismert hálózatok
    .description = Hálózatok, amelyekhez ez a számítógép már csatlakozott, akár a közelben vannak, akár nem
settings-network-known-count = { $count ->
        [one] { $count } mentett hálózat
       *[other] { $count } mentett hálózat
    }
settings-network-known-in-range = Hatótávolságon belül
settings-network-wired = Vezetékes
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Csatlakozva · { $speed }
settings-network-empty = Nincsenek hálózati kapcsolatok
    .description = Csatlakoztasson hálózati kábelt vagy Wi-Fi-adaptert az internetkapcsolathoz
settings-network-proxy = Proxy
    .description = A webes forgalom egy másik kiszolgálón keresztül halad. Munkahelyi vagy iskolai hálózatokon gyakran szükséges.

## Network: Wi-Fi networks

settings-network-wifi-networks = Wi-Fi-hálózatok
settings-network-wifi-saved = Mentve
settings-network-wifi-enterprise = Bejelentkezés munkahelyi vagy iskolai fiókkal
settings-network-wifi-connect-failed = Nem sikerült csatlakozni ehhez a hálózathoz
settings-network-wifi-saved-password-failed = A mentett jelszó nem működött. Adja meg újra.
settings-network-wifi-settings = Hálózat beállításai
settings-network-wifi-searching = Hálózatok keresése…
settings-network-hidden = Csatlakozás rejtett hálózathoz
    .description = Adja meg a hálózat nevét és a biztonság típusát.
settings-network-hidden-name = Hálózat neve

## Network: joining a Wi-Fi network

settings-network-join = Csatlakozás: „{ $network }”
settings-network-join-enterprise = Jelentkezzen be munkahelyi vagy iskolai fiókjával.
settings-network-join-password = Adja meg a hálózat jelszavát.
settings-network-join-failed = Nem sikerült csatlakozni ehhez a hálózathoz.
settings-network-join-sign-in-failed = Nem sikerült bejelentkezni. Ellenőrizze a felhasználónevet és a jelszót.
settings-network-join-wrong-password = Ez a jelszó nem működött. Ellenőrizze, és próbálja újra.

## Network: connection settings page

settings-network-forget = Hálózat elfelejtése
    .description = Törli a jelszavát és a beállításait erről a számítógépről
    .button = Elfelejtés
settings-network-remove-vpn = VPN eltávolítása
settings-network-remove-connection = Kapcsolat eltávolítása
settings-network-remove-description = Törli a beállításait erről a számítógépről
settings-network-remove = Eltávolítás

settings-network-general = Általános
settings-network-autoconnect = Automatikus csatlakozás
settings-network-autoconnect-wifi = Csatlakozás, valahányszor hatótávolságon belül van
settings-network-autoconnect-wired = Csatlakozás, amint kábel csatlakozik
settings-network-autoconnect-vpn = Csatlakozás, valahányszor a számítógép online
settings-network-autoconnect-other = Csatlakozás, valahányszor elérhető
settings-network-all-users = Elérhető mindenki számára
    .description = Bárki használhatja, aki itt bejelentkezik
settings-network-metered = Forgalomkorlátos kapcsolat
    .description = Az alkalmazások és a frissítések visszafogják a nagy letöltéseket
settings-network-metered-automatic = Automatikus észlelés
settings-network-metered-yes = Forgalomkorlátos
settings-network-metered-no = Nem forgalomkorlátos

settings-network-security = Biztonság
settings-network-security-type = Biztonság típusa

settings-network-advanced = Speciális
settings-network-private-address = Privát cím
    .description = Megnehezíti a számítógép nyomon követését ezen a hálózaton
settings-network-hardware-address = Hardvercím
    .description = A cím, amelyet ez a számítógép a hálózat felé mutat
settings-network-mac-random = Minden alkalommal új cím
settings-network-mac-stable = Állandó cím ehhez a hálózathoz
settings-network-mac-private-off = Ki
settings-network-mac-builtin = Beépített cím
settings-network-mac-custom = Egyéni cím
settings-network-mtu = Legnagyobb csomagméret (MTU)
    .description = Hagyja üresen, hacsak a hálózata nem igényel adott méretet
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Módszer
    .label = Módszer ({ $family })
settings-network-ip-dhcp = Automatikus, csak címek
settings-network-ip-manual = Kézi
settings-network-ip-link-local = Csak helyi kapcsolat
settings-network-ip-shared = Megosztva más eszközökkel
settings-network-ip-ignore = Nincs kezelve
settings-network-ip-disabled = Ki
settings-network-ip-addresses = Címek
    .description = Mindegyik az előtagjával, például: { $example }
settings-network-ip-address = { $number }. cím
settings-network-ip-remove-address = Cím eltávolítása
settings-network-ip-add-address = Cím hozzáadása
settings-network-ip-router = Útválasztó ({ $family })
settings-network-ip-automatic-dns = Automatikus DNS
    .description = A hálózat által javasolt DNS-kiszolgálók használata
settings-network-ip-dns-first = A javasoltak előtt használva
settings-network-ip-dns-separate = A címeket vesszővel válassza el
settings-network-ip-dns-servers = DNS-kiszolgálók ({ $family })
settings-network-ip-search-domains = Keresési tartományok
    .description = Akkor használja a rendszer, ha egy névben nincs tartomány, például „nyomtató”
    .label = Keresési tartományok ({ $family })
settings-network-ip-automatic-routes = Automatikus útvonalak
    .description = A hálózat által javasolt útvonalak használata
settings-network-ip-routes = Útvonalak
    .description = Egyes hálózatok forgalma egy másik útválasztón keresztül halad
settings-network-ip-add-route = Útvonal hozzáadása
settings-network-route-network = Hálózat
settings-network-route-priority = Prioritás
settings-network-route-remove = Útvonal eltávolítása

## Network: work or school (802.1X) sign-in

settings-network-eap = Hitelesítés
settings-network-eap-peap = Védett EAP (PEAP)
settings-network-eap-ttls = Alagutas TLS (TTLS)
settings-network-eap-tls = Tanúsítvány (TLS)
settings-network-eap-inner = Belső hitelesítés
settings-network-client-certificate = Saját tanúsítvány
settings-network-private-key-password = Titkos kulcs jelszava
    .placeholder = Ha a kulcsnak van ilyen
settings-network-anonymous-identity = Névtelen identitás
    .description = Hagyja üresen, hacsak a hálózata nem kéri
settings-network-ca = CA-tanúsítvány
    .description = Igazolja, hogy a valódi hálózathoz csatlakozik
settings-network-ca-system = Rendszertanúsítványok használata
settings-network-ca-file = Fájl kiválasztása…
settings-network-ca-another-file = Másik fájl kiválasztása…
settings-network-ca-none = Nincs ellenőrzés
settings-network-choose-file = Kiválasztás…
settings-network-server-domain = Kiszolgáló tartománya
    .description = Csak az ebben a tartományban lévő kiszolgálókhoz csatlakozik

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Adjon meg egy nevet
settings-network-error-no-addresses = Adjon hozzá legalább egy címet
settings-network-error-address = Adjon meg egy címet az előtagjával, például: { $example }
settings-network-error-router = Adja meg az útválasztó címét, például: { $example }
settings-network-error-dns = „{ $address }” nem érvényes cím
settings-network-error-search-domain = „{ $domain }” nem érvényes tartomány
settings-network-error-route = Adjon meg egy hálózatot, például: { $example }
settings-network-error-priority = A prioritás legyen egész szám
settings-network-error-username = Adja meg a felhasználónevét
settings-network-error-domain = Adjon meg egy tartományt, például: example.com
settings-network-error-certificate = Válassza ki a tanúsítványát
settings-network-error-private-key = Válassza ki a titkos kulcsát
settings-network-error-mtu = Adjon meg egy számot { $lowest } és { $highest } között, vagy hagyja üresen
settings-network-error-mac = Adjon meg egy ilyen címet: 12:34:56:78:9A:BC
settings-network-error-password = Adja meg a jelszavát
settings-network-error-password-length = { $count ->
        [one] Legalább { $count } karaktert használjon
       *[other] Legalább { $count } karaktert használjon
    }

## Network: proxy

settings-network-proxy-off = Ki
settings-network-proxy-manual = Kézi
settings-network-proxy-url = Konfigurációs cím
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Biztonságos web (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Kiszolgáló
    .label = Kiszolgáló ({ $protocol })
settings-network-proxy-port = Port
    .label = Port ({ $protocol })
settings-network-proxy-skip = Proxy mellőzése ezeknél
settings-network-proxy-error-url = Adjon meg egy webcímet, például: http://example.com/proxy.pac
settings-network-proxy-error-host = Csak a kiszolgáló nevét adja meg, például: proxy.example.com
settings-network-proxy-error-port = 1 és 65535 közötti portot adjon meg
settings-network-proxy-save-failed = Nem sikerült menteni a proxybeállításokat

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importálás fájlból
    .description = WireGuard-, OpenVPN- és egyéb VPN-konfigurációs fájlok
settings-network-vpn-importing = Importálás…
settings-network-wireguard = WireGuard beállítása
    .description = Adja meg a VPN-szolgáltatótól vagy a kiszolgálóról kapott adatokat
settings-network-wireguard-dialog = Ezeket az adatokat a VPN-szolgáltatótól vagy a kiszolgáló tulajdonosától kaphatja meg.
settings-network-wireguard-name-example = Otthoni VPN
settings-network-wireguard-public-key = Nyilvános kulcs: { $key }
settings-network-wireguard-public-key-pending = A nyilvános kulcs itt jelenik meg, hogy megoszthassa
settings-network-wireguard-copy = Nyilvános kulcs másolása
settings-network-wireguard-copied = Másolva
settings-network-wireguard-generate = Új kulcs létrehozása
settings-network-wireguard-addresses = A számítógép címei a VPN-en belül
settings-network-wireguard-server-key = Kiszolgáló nyilvános kulcsa
settings-network-wireguard-endpoint = Kiszolgáló címe
settings-network-wireguard-allowed-ips = Engedélyezett IP-címek
    .description = Az ezekbe a tartományokba irányuló forgalom a VPN-en keresztül halad
settings-network-wireguard-preshared-key = Előre megosztott kulcs
settings-network-wireguard-keepalive = Életben tartás
    .description = Segít fenntartani a kapcsolatot útválasztó mögött
    .placeholder = Nem kötelező, másodpercben
settings-network-wireguard-add = Hozzáadás
settings-network-wireguard-adding = Hozzáadás…
settings-network-wireguard-error-private-key = Adjon meg vagy hozzon létre egy titkos kulcsot
settings-network-wireguard-error-addresses = Adjon meg legalább egy címet
settings-network-wireguard-error-server-key = Adja meg a kiszolgáló nyilvános kulcsát
settings-network-wireguard-error-endpoint = Adja meg a kiszolgáló címét és portját
settings-network-wireguard-error-allowed-ips = Adjon meg legalább egy tartományt
settings-network-wireguard-error-keepalive = Adja meg a másodpercek számát

## Bluetooth panel

settings-bluetooth-hardware-off = Hardveres kapcsoló kikapcsolta
settings-bluetooth-power-on-failed = Nem sikerült bekapcsolni a Bluetootht
settings-bluetooth-power-off-failed = Nem sikerült kikapcsolni a Bluetootht
settings-bluetooth-visible = Látható a közeli eszközök számára
    .description = A telefonok és számítógépek megtalálhatják ezt a számítógépet
settings-bluetooth-visible-as = Megjelenő név: „{ $name }”
settings-bluetooth-visible-duration = Láthatóság időtartama
settings-bluetooth-visible-for = { $minutes ->
        [one] { $minutes } percig
       *[other] { $minutes } percig
    }
settings-bluetooth-visible-until-off = Kikapcsolásig
settings-bluetooth-visible-failed = Nem sikerült módosítani a számítógép láthatóságát
settings-bluetooth-paired = Saját eszközök
settings-bluetooth-nearby = Közeli eszközök
settings-bluetooth-searching = Eszközök keresése…
    .description = Állítsa párosítási módba a hozzáadni kívánt eszközt
settings-bluetooth-blocked = A Bluetootht hardveres kapcsoló kikapcsolta
    .description = A bekapcsoláshoz használja a számítógép kapcsolóját vagy billentyűjét
settings-bluetooth-details = Eszköz adatai
settings-bluetooth-connected = Csatlakozva
settings-bluetooth-connected-battery = Csatlakozva · akkumulátor: { $battery }
settings-bluetooth-connecting = Csatlakozás…
settings-bluetooth-disconnecting = Leválasztás…
settings-bluetooth-pairing = Párosítás…
settings-bluetooth-forget-confirm = Elfelejti ezt az eszközt: „{ $name }”?
    .description = Ahhoz, hogy újra használja ezzel a számítógéppel, ismét párosítania kell.
settings-bluetooth-forget = Elfelejtés
settings-bluetooth-cancel = Mégse
settings-bluetooth-connect = Csatlakozás
settings-bluetooth-disconnect = Leválasztás
settings-bluetooth-done = Kész

## Bluetooth: device details

settings-bluetooth-type = Típus
settings-bluetooth-battery = Akkumulátor
settings-bluetooth-address = Cím
settings-bluetooth-autoconnect = Automatikus csatlakozás
    .description = Valahányszor a közelben van
settings-bluetooth-kind-headphones = Fejhallgató
settings-bluetooth-kind-speaker = Hangszóró
settings-bluetooth-kind-mouse = Egér
settings-bluetooth-kind-keyboard = Billentyűzet
settings-bluetooth-kind-gamepad = Játékvezérlő
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Számítógép
settings-bluetooth-kind-tablet = Táblagép
settings-bluetooth-kind-display = Kijelző
settings-bluetooth-kind-printer = Nyomtató
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Egyéb eszköz

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = névtelen eszköz
settings-bluetooth-request-confirm = Párosítás ezzel: { $name }?
    .description = Ellenőrizze, hogy ugyanez a kód látható ezen az eszközön: { $name }.
settings-bluetooth-request-authorize = Engedélyezi a párosítást ezzel: { $name }?
    .description = Ez az eszköz csatlakozhat majd a számítógéphez: { $name }.
settings-bluetooth-request-pin = PIN-kód megadása ehhez: { $name }
    .description = Gyakran 0000 vagy 1234. Ha egyik sem működik, az eszköz kézikönyvében megtalálja.
settings-bluetooth-request-passkey = Adja meg az eszközön látható kódot: { $name }
    .description = Írja be a hat számjegyet pontosan úgy, ahogy megjelennek.
settings-bluetooth-request-display = Párosítás ezzel: { $name }
    .description = Írja be ezt a kódot ezen az eszközön: { $name }, majd nyomja meg az Enter billentyűt.
settings-bluetooth-pair = Párosítás
settings-bluetooth-allow = Engedélyezés

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Eszközök átvétele a Windowsból
    .description = { $count ->
        [one] A Windowsban párosított eszköz: { $devices }. Itt is használhatja újbóli párosítás nélkül.
       *[other] A Windowsban párosított eszközök: { $devices }. Itt is használhatja őket újbóli párosítás nélkül.
    }
settings-bluetooth-windows-more = { $count ->
        [one] még { $count }
       *[other] még { $count }
    }

## Accounts panel

settings-accounts-unavailable = A fiókok nem érhetők el
    .description = A fiókszolgáltatás nincs telepítve ezen a számítógépen
settings-accounts-online = Online fiókok
    .description = Minden fiók egy mappa a Saját mappában lévő Cloud mappán belül, amelyet bármely alkalmazás megnyithat. A fájlok megnyitáskor töltődnek le.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud vagy WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = A további használathoz jelentkezzen be újra
settings-accounts-paused-metered = A szinkronizálás szünetel forgalomkorlátos kapcsolaton
settings-accounts-paused-battery = A szinkronizálás szünetel, amíg alacsony az akkumulátor töltöttsége
settings-accounts-connecting = Csatlakozás…
settings-accounts-offline = Offline
settings-accounts-offline-kept = Offline, a megtartott fájlok továbbra is elérhetők
settings-accounts-not-connected = Nincs csatlakozva
settings-accounts-syncing = { $count ->
        [one] { $count } módosítás szinkronizálása
       *[other] { $count } módosítás szinkronizálása
    }
settings-accounts-name = Név
settings-accounts-folder = Mappa
settings-accounts-server = Kiszolgáló
settings-accounts-storage = Tárhely
settings-accounts-storage-used = Foglalt: { $used } / { $total }
settings-accounts-on-device = Ezen az eszközön
settings-accounts-kept = { $count ->
        [one] { $count } elem megtartva, a többi megnyitáskor töltődik le
       *[other] { $count } elem megtartva, a többi megnyitáskor töltődik le
    }
settings-accounts-on-demand = A fájlok megnyitáskor töltődnek le
settings-accounts-sign-in-again = Újbóli bejelentkezés
settings-accounts-keep = Megtartás
settings-accounts-remove = Eltávolítás
settings-accounts-remove-confirm = Eltávolítás erről a számítógépről
settings-accounts-removing = Eltávolítás…
settings-accounts-remove-note = A fájlok megmaradnak itt: { $provider }. Az itt végzett módosítások előbb feltöltődnek.

## Accounts: providers

settings-accounts-provider-icloud = Apple-fiókja, iPhone-on, iPaden vagy Macen kapott kóddal megerősítve
settings-accounts-provider-onedrive = Személyes, munkahelyi vagy iskolai Microsoft-fiók, a böngészőben
settings-accounts-provider-dropbox = Dropbox-fiók, a böngészőben
settings-accounts-provider-nextcloud = Saját vagy a szervezete kiszolgálója
settings-accounts-provider-webdav = Bármely WebDAV-kiszolgáló

## Accounts: signing in

settings-accounts-sign-in-again-title = Újbóli bejelentkezés: { $account }
settings-accounts-browser = Megnyílik a böngésző, ahol bejelentkezhet { $provider } fiókjával. A Luft sosem látja a jelszavát.
settings-accounts-password-for = Adja meg a jelszót ehhez: { $user }.
settings-accounts-apple-account = Apple-fiók
settings-accounts-password = Jelszó
settings-accounts-app-password = Alkalmazásjelszó
settings-accounts-user = Felhasználónév
settings-accounts-apple-note = Apple-fiókja jelszavát használja; az alkalmazásspecifikus jelszavak itt nem működnek. Ezután az Apple egy kódot jelenít meg iPhone-ján, iPadjén vagy Macjén.
settings-accounts-nextcloud-browser = Megnyílik a böngésző, ahol bejelentkezhet a kiszolgálójára, és hozzáférést adhat a Luftnak.
settings-accounts-use-app-password = Inkább alkalmazásjelszó használata
settings-accounts-error-server = Adja meg a kiszolgáló címét
settings-accounts-error-apple-account = Adja meg Apple-fiókja e-mail-címét
settings-accounts-error-user = Adja meg a felhasználónevet
settings-accounts-error-password = Adja meg a jelszót
settings-accounts-cancel = Mégse
settings-accounts-back = Vissza
settings-accounts-continue-in-browser = Folytatás a böngészőben
settings-accounts-sign-in = Bejelentkezés
settings-accounts-try-again = Újra
settings-accounts-continue = Tovább
settings-accounts-working = Kapcsolódás ehhez: { $provider }…
settings-accounts-finish-in-browser = Fejezze be a bejelentkezést { $provider } fiókjával a böngészőben. A Luft sosem látja a jelszavát, és ez az oldal magától frissül, amint végzett.
settings-accounts-no-browser = Nem nyílt meg böngésző. Másolja ki a hivatkozást, és nyissa meg egy böngészőben.
settings-accounts-open-again = Oldal újbóli megnyitása
settings-accounts-copy-link = Hivatkozás másolása
settings-accounts-copied = Másolva
settings-accounts-code = Ellenőrző kód
    .placeholder = 6 számjegyű kód
settings-accounts-text-me = Inkább SMS-ben kérem a kódot
settings-accounts-choose-phone = Melyik telefonszámra küldje az Apple a kódot?
    .description = SMS küldése
settings-accounts-approve = Apple-fiókjában be van kapcsolva a Speciális adatvédelem. Hagyja jóvá a kérést iPhone-ján, iPadjén vagy Macjén, hogy ez a számítógép megnyithassa az iCloud Drive-ot.
