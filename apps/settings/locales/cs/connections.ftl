### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Uložit
settings-network-saving = Ukládání…
settings-network-cancel = Zrušit
settings-network-connect = Připojit
settings-network-disconnect = Odpojit
settings-network-optional = Volitelné
settings-network-automatic = Automaticky
settings-network-name = Název
settings-network-password = Heslo
settings-network-password-saved = Uložené heslo
settings-network-username = Uživatelské jméno
settings-network-router = Směrovač
settings-network-dns-servers = Servery DNS
settings-network-private-key = Soukromý klíč
settings-network-connection-settings = Nastavení připojení
settings-network-connect-failed = Nepodařilo se připojit

## Network: connection states

settings-network-link-connected = Připojeno
settings-network-link-connecting = Připojování…
settings-network-link-disconnected = Nepřipojeno
settings-network-link-unplugged = Kabel je odpojený

## Network: Wi‑Fi security types

settings-network-security-open = Žádné
settings-network-security-owe = Rozšířená otevřená
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Podnikové

## Network: signal and radio details

settings-network-signal-excellent = Výborný
settings-network-signal-good = Dobrý
settings-network-signal-fair = Průměrný
settings-network-signal-weak = Slabý
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · kanál { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signál
settings-network-detail-band = Pásmo
settings-network-detail-speed = Rychlost připojení
settings-network-detail-access-point = Přístupový bod
settings-network-detail-security = Zabezpečení
settings-network-detail-ipv4 = Adresa IP
settings-network-detail-ipv6 = Adresa IPv6
settings-network-detail-router = Směrovač
settings-network-detail-dns = DNS
settings-network-detail-mac = Hardwarová adresa

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Vypnuto hardwarovým vypínačem
settings-network-wifi-connected = Připojeno k síti { $network }
settings-network-airplane = Režim v letadle
    .description = Vypne všechna bezdrátová připojení
settings-network-airplane-hardware = Zapnuto hardwarovým vypínačem
settings-network-known = Známé sítě
    .description = Sítě, ke kterým se tento počítač už připojil, ať jsou poblíž, nebo ne
settings-network-known-count = { $count ->
        [one] { $count } uložená síť
        [few] { $count } uložené sítě
        [many] { $count } uložené sítě
       *[other] { $count } uložených sítí
    }
settings-network-known-in-range = V dosahu
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Připojeno · { $speed }
settings-network-empty = Žádná síťová připojení
    .description = Pro připojení k internetu zapojte síťový kabel nebo adaptér Wi‑Fi
settings-network-proxy = Proxy
    .description = Webový provoz půjde přes jiný server. Často je to potřeba v pracovních nebo školních sítích.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Sítě Wi‑Fi
settings-network-wifi-saved = Uloženo
settings-network-wifi-enterprise = Přihlášení pracovním nebo školním účtem
settings-network-wifi-connect-failed = K této síti se nepodařilo připojit
settings-network-wifi-saved-password-failed = Uložené heslo nefungovalo. Zadejte ho znovu.
settings-network-wifi-settings = Nastavení sítě
settings-network-wifi-searching = Hledání sítí…
settings-network-hidden = Připojit ke skryté síti
    .description = Zadejte název sítě a způsob jejího zabezpečení.
settings-network-hidden-name = Název sítě

## Network: joining a Wi‑Fi network

settings-network-join = Připojit k síti „{ $network }“
settings-network-join-enterprise = Přihlaste se pracovním nebo školním účtem.
settings-network-join-password = Zadejte heslo k této síti.
settings-network-join-failed = K této síti se nepodařilo připojit.
settings-network-join-sign-in-failed = Přihlášení se nezdařilo. Zkontrolujte uživatelské jméno a heslo.
settings-network-join-wrong-password = Heslo nefungovalo. Zkontrolujte ho a zkuste to znovu.

## Network: connection settings page

settings-network-forget = Zapomenout tuto síť
    .description = Odstraní z tohoto počítače její heslo a nastavení
    .button = Zapomenout
settings-network-remove-vpn = Odebrat tuto VPN
settings-network-remove-connection = Odebrat toto připojení
settings-network-remove-description = Odstraní jeho nastavení z tohoto počítače
settings-network-remove = Odebrat

settings-network-general = Obecné
settings-network-autoconnect = Připojovat automaticky
settings-network-autoconnect-wifi = Připojit k této síti, kdykoli je v dosahu
settings-network-autoconnect-wired = Připojit, jakmile se zapojí kabel
settings-network-autoconnect-vpn = Připojit, kdykoli je tento počítač online
settings-network-autoconnect-other = Připojit, kdykoli je k dispozici
settings-network-all-users = Dostupné pro všechny
    .description = Může ho používat každý, kdo se na tomto počítači přihlásí
settings-network-metered = Měřené připojení
    .description = Aplikace a aktualizace omezí velká stahování
settings-network-metered-automatic = Rozpoznat automaticky
settings-network-metered-yes = Měřené
settings-network-metered-no = Neměřené

settings-network-security = Zabezpečení
settings-network-security-type = Typ zabezpečení

settings-network-advanced = Upřesnit
settings-network-private-address = Soukromá adresa
    .description = Ztěžuje sledování tohoto počítače v této síti
settings-network-hardware-address = Hardwarová adresa
    .description = Adresa, kterou tento počítač ukazuje síti
settings-network-mac-random = Pokaždé nová adresa
settings-network-mac-stable = Stejná adresa pro tuto síť
settings-network-mac-private-off = Vypnuto
settings-network-mac-builtin = Vestavěná adresa
settings-network-mac-custom = Vlastní adresa
settings-network-mtu = Největší velikost paketu (MTU)
    .description = Nechte prázdné, pokud vaše síť nepotřebuje konkrétní velikost
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Metoda
    .label = Metoda { $family }
settings-network-ip-dhcp = Automaticky, jen adresy
settings-network-ip-manual = Ručně
settings-network-ip-link-local = Jen místní linka
settings-network-ip-shared = Sdíleno s dalšími zařízeními
settings-network-ip-ignore = Nespravováno
settings-network-ip-disabled = Vypnuto
settings-network-ip-addresses = Adresy
    .description = Každá s předponou, například { $example }
settings-network-ip-address = Adresa { $number }
settings-network-ip-remove-address = Odebrat adresu
settings-network-ip-add-address = Přidat adresu
settings-network-ip-router = Směrovač { $family }
settings-network-ip-automatic-dns = Automatické DNS
    .description = Použít servery DNS, které navrhuje tato síť
settings-network-ip-dns-first = Používají se před navrženými
settings-network-ip-dns-separate = Adresy oddělte čárkami
settings-network-ip-dns-servers = Servery DNS pro { $family }
settings-network-ip-search-domains = Prohledávané domény
    .description = Zkoušejí se, když název nemá doménu, například „tiskarna“
    .label = Prohledávané domény pro { $family }
settings-network-ip-automatic-routes = Automatické trasy
    .description = Použít trasy, které navrhuje tato síť
settings-network-ip-routes = Trasy
    .description = Provoz do některých sítí půjde přes jiný směrovač
settings-network-ip-add-route = Přidat trasu
settings-network-route-network = Síť
settings-network-route-priority = Priorita
settings-network-route-remove = Odebrat trasu

## Network: work or school (802.1X) sign-in

settings-network-eap = Ověřování
settings-network-eap-peap = Chráněný EAP (PEAP)
settings-network-eap-ttls = Tunelované TLS (TTLS)
settings-network-eap-tls = Certifikát (TLS)
settings-network-eap-inner = Vnitřní ověřování
settings-network-client-certificate = Váš certifikát
settings-network-private-key-password = Heslo soukromého klíče
    .placeholder = Pokud ho klíč má
settings-network-anonymous-identity = Anonymní identita
    .description = Nechte prázdné, pokud ji vaše síť nevyžaduje
settings-network-ca = Certifikát CA
    .description = Potvrzuje, že se připojujete ke skutečné síti
settings-network-ca-system = Použít systémové certifikáty
settings-network-ca-file = Vybrat soubor…
settings-network-ca-another-file = Vybrat jiný soubor…
settings-network-ca-none = Nekontrolovat
settings-network-choose-file = Vybrat…
settings-network-server-domain = Doména serveru
    .description = Připojovat se jen k serverům v této doméně

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Zadejte název
settings-network-error-no-addresses = Přidejte alespoň jednu adresu
settings-network-error-address = Zadejte adresu s předponou, například { $example }
settings-network-error-router = Zadejte adresu směrovače, například { $example }
settings-network-error-dns = „{ $address }“ není platná adresa
settings-network-error-search-domain = „{ $domain }“ není platná doména
settings-network-error-route = Zadejte síť, například { $example }
settings-network-error-priority = Jako prioritu použijte celé číslo
settings-network-error-username = Zadejte uživatelské jméno
settings-network-error-domain = Zadejte doménu, například example.com
settings-network-error-certificate = Vyberte svůj certifikát
settings-network-error-private-key = Vyberte svůj soukromý klíč
settings-network-error-mtu = Použijte číslo od { $lowest } do { $highest }, nebo pole nechte prázdné
settings-network-error-mac = Zadejte adresu ve tvaru 12:34:56:78:9A:BC
settings-network-error-password = Zadejte heslo
settings-network-error-password-length = { $count ->
        [one] Heslo musí mít alespoň { $count } znak
        [few] Heslo musí mít alespoň { $count } znaky
        [many] Heslo musí mít alespoň { $count } znaku
       *[other] Heslo musí mít alespoň { $count } znaků
    }

## Network: proxy

settings-network-proxy-off = Vypnuto
settings-network-proxy-manual = Ručně
settings-network-proxy-url = Adresa konfigurace
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Zabezpečený web (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Server
    .label = Server pro { $protocol }
settings-network-proxy-port = Port
    .label = Port pro { $protocol }
settings-network-proxy-skip = Nepoužívat proxy pro
settings-network-proxy-error-url = Zadejte webovou adresu, například http://example.com/proxy.pac
settings-network-proxy-error-host = Zadejte jen název serveru, například proxy.example.com
settings-network-proxy-error-port = Použijte port od 1 do 65535
settings-network-proxy-save-failed = Nastavení proxy se nepodařilo uložit

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importovat ze souboru
    .description = Konfigurační soubory WireGuard, OpenVPN a dalších VPN
settings-network-vpn-importing = Importování…
settings-network-wireguard = Nastavit WireGuard
    .description = Zadejte údaje od poskytovatele VPN nebo ze serveru
settings-network-wireguard-dialog = Tyto údaje vám poskytne poskytovatel VPN nebo správce serveru.
settings-network-wireguard-name-example = Domácí VPN
settings-network-wireguard-public-key = Veřejný klíč { $key }
settings-network-wireguard-public-key-pending = Zde se zobrazí veřejný klíč ke sdílení
settings-network-wireguard-copy = Kopírovat veřejný klíč
settings-network-wireguard-copied = Zkopírováno
settings-network-wireguard-generate = Vygenerovat nový klíč
settings-network-wireguard-addresses = Adresy tohoto počítače ve VPN
settings-network-wireguard-server-key = Veřejný klíč serveru
settings-network-wireguard-endpoint = Adresa serveru
settings-network-wireguard-allowed-ips = Povolené adresy IP
    .description = Provoz do těchto rozsahů půjde přes VPN
settings-network-wireguard-preshared-key = Předsdílený klíč
settings-network-wireguard-keepalive = Udržování spojení
    .description = Pomáhá udržet připojení za směrovačem
    .placeholder = Volitelné, v sekundách
settings-network-wireguard-add = Přidat
settings-network-wireguard-adding = Přidávání…
settings-network-wireguard-error-private-key = Zadejte nebo vygenerujte soukromý klíč
settings-network-wireguard-error-addresses = Zadejte alespoň jednu adresu
settings-network-wireguard-error-server-key = Zadejte veřejný klíč serveru
settings-network-wireguard-error-endpoint = Zadejte adresu a port serveru
settings-network-wireguard-error-allowed-ips = Zadejte alespoň jeden rozsah
settings-network-wireguard-error-keepalive = Zadejte počet sekund

## Bluetooth panel

settings-bluetooth-hardware-off = Vypnuto hardwarovým vypínačem
settings-bluetooth-power-on-failed = Bluetooth se nepodařilo zapnout
settings-bluetooth-power-off-failed = Bluetooth se nepodařilo vypnout
settings-bluetooth-visible = Viditelné pro zařízení v okolí
    .description = Telefony a počítače ho najdou
settings-bluetooth-visible-as = Zobrazuje se jako „{ $name }“
settings-bluetooth-visible-duration = Doba viditelnosti
settings-bluetooth-visible-for = { $minutes ->
        [one] Na { $minutes } minutu
        [few] Na { $minutes } minuty
        [many] Na { $minutes } minuty
       *[other] Na { $minutes } minut
    }
settings-bluetooth-visible-until-off = Dokud se nevypne
settings-bluetooth-visible-failed = Viditelnost tohoto počítače se nepodařilo změnit
settings-bluetooth-paired = Moje zařízení
settings-bluetooth-nearby = Zařízení v okolí
settings-bluetooth-searching = Hledání zařízení…
    .description = Přepněte zařízení, které chcete přidat, do režimu párování
settings-bluetooth-blocked = Bluetooth je vypnutý hardwarovým vypínačem
    .description = Zapněte ho vypínačem nebo klávesou na počítači
settings-bluetooth-details = Podrobnosti o zařízení
settings-bluetooth-connected = Připojeno
settings-bluetooth-connected-battery = Připojeno · baterie { $battery }
settings-bluetooth-connecting = Připojování…
settings-bluetooth-disconnecting = Odpojování…
settings-bluetooth-pairing = Párování…
settings-bluetooth-forget-confirm = Zapomenout zařízení „{ $name }“?
    .description = Abyste ho mohli s tímto počítačem znovu používat, budete ho muset znovu spárovat.
settings-bluetooth-forget = Zapomenout
settings-bluetooth-cancel = Zrušit
settings-bluetooth-connect = Připojit
settings-bluetooth-disconnect = Odpojit
settings-bluetooth-done = Hotovo

## Bluetooth: device details

settings-bluetooth-type = Typ
settings-bluetooth-battery = Baterie
settings-bluetooth-address = Adresa
settings-bluetooth-autoconnect = Připojovat automaticky
    .description = Kdykoli je poblíž
settings-bluetooth-kind-headphones = Sluchátka
settings-bluetooth-kind-speaker = Reproduktor
settings-bluetooth-kind-mouse = Myš
settings-bluetooth-kind-keyboard = Klávesnice
settings-bluetooth-kind-gamepad = Herní ovladač
settings-bluetooth-kind-phone = Telefon
settings-bluetooth-kind-computer = Počítač
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Displej
settings-bluetooth-kind-printer = Tiskárna
settings-bluetooth-kind-camera = Fotoaparát
settings-bluetooth-kind-other = Jiné zařízení

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = bez názvu
settings-bluetooth-request-confirm = Spárovat zařízení { $name }?
    .description = Zkontrolujte, že zařízení { $name } zobrazuje stejný kód.
settings-bluetooth-request-authorize = Povolit spárování zařízení { $name }?
    .description = Zařízení { $name } se bude moct připojit k tomuto počítači.
settings-bluetooth-request-pin = Zadejte PIN pro zařízení { $name }
    .description = Často je to 0000 nebo 1234. Pokud nefunguje ani jeden, najdete ho v návodu k zařízení.
settings-bluetooth-request-passkey = Zadejte kód zobrazený na zařízení { $name }
    .description = Napište šest číslic přesně tak, jak jsou zobrazené.
settings-bluetooth-request-display = Spárovat zařízení { $name }
    .description = Napište tento kód na zařízení { $name } a stiskněte Enter.
settings-bluetooth-pair = Spárovat
settings-bluetooth-allow = Povolit

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Převzít zařízení ze systému Windows
    .description = { $count ->
        [one] V systému Windows je spárované zařízení { $devices }. Můžete ho tu používat bez nového párování.
        [few] V systému Windows jsou spárovaná tato zařízení: { $devices }. Můžete je tu používat bez nového párování.
        [many] V systému Windows jsou spárovaná tato zařízení: { $devices }. Můžete je tu používat bez nového párování.
       *[other] V systému Windows jsou spárovaná tato zařízení: { $devices }. Můžete je tu používat bez nového párování.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } další
        [few] { $count } další
        [many] { $count } dalšího
       *[other] { $count } dalších
    }
