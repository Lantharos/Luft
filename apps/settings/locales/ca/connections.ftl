### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Desa
settings-network-saving = S’està desant…
settings-network-cancel = Cancel·la
settings-network-connect = Connecta
settings-network-disconnect = Desconnecta
settings-network-optional = Opcional
settings-network-automatic = Automàtic
settings-network-name = Nom
settings-network-password = Contrasenya
settings-network-password-saved = Contrasenya desada
settings-network-username = Nom d’usuari
settings-network-router = Encaminador
settings-network-dns-servers = Servidors DNS
settings-network-private-key = Clau privada
settings-network-connection-settings = Configuració de la connexió
settings-network-connect-failed = No s’ha pogut connectar

## Network: connection states

settings-network-link-connected = Connectat
settings-network-link-connecting = S’està connectant…
settings-network-link-disconnected = No connectat
settings-network-link-unplugged = Cable desconnectat

## Network: Wi‑Fi security types

settings-network-security-open = Cap
settings-network-security-owe = Oberta millorada
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Empresarial

## Network: signal and radio details

settings-network-signal-excellent = Excel·lent
settings-network-signal-good = Bo
settings-network-signal-fair = Acceptable
settings-network-signal-weak = Feble
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Canal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Senyal
settings-network-detail-band = Banda
settings-network-detail-speed = Velocitat de l’enllaç
settings-network-detail-access-point = Punt d’accés
settings-network-detail-security = Seguretat
settings-network-detail-ipv4 = Adreça IP
settings-network-detail-ipv6 = Adreça IPv6
settings-network-detail-router = Encaminador
settings-network-detail-dns = DNS
settings-network-detail-mac = Adreça física

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Desactivat per un interruptor físic
settings-network-wifi-connected = Connectat a { $network }
settings-network-airplane = Mode d’avió
    .description = Desactiva totes les connexions sense fil
settings-network-airplane-hardware = Activat per un interruptor físic
settings-network-known = Xarxes conegudes
    .description = Xarxes a què s’ha connectat abans aquest ordinador, tant si són a prop com si no
settings-network-known-count = { $count ->
        [one] { $count } xarxa desada
       *[other] { $count } xarxes desades
    }
settings-network-known-in-range = A l’abast
settings-network-wired = Amb cable
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Connectat · { $speed }
settings-network-empty = No hi ha connexions de xarxa
    .description = Connecteu un cable de xarxa o un adaptador Wi‑Fi per connectar-vos a internet
settings-network-proxy = Servidor intermediari
    .description = Envia el trànsit web a través d’un altre servidor, sovint necessari a les xarxes de la feina o de l’escola.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Xarxes Wi‑Fi
settings-network-wifi-saved = Desada
settings-network-wifi-enterprise = Inicieu la sessió amb un compte de la feina o de l’escola
settings-network-wifi-connect-failed = No s’ha pogut connectar a aquesta xarxa
settings-network-wifi-saved-password-failed = La contrasenya desada no ha funcionat. Torneu-la a introduir.
settings-network-wifi-settings = Configuració de la xarxa
settings-network-wifi-searching = S’estan cercant xarxes…
settings-network-hidden = Connecta’t a una xarxa oculta
    .description = Introduïu el nom de la xarxa i com està protegida.
settings-network-hidden-name = Nom de la xarxa

## Network: joining a Wi‑Fi network

settings-network-join = Connecta’t a «{ $network }»
settings-network-join-enterprise = Inicieu la sessió amb el compte de la feina o de l’escola.
settings-network-join-password = Introduïu la contrasenya d’aquesta xarxa.
settings-network-join-failed = No s’ha pogut connectar a aquesta xarxa.
settings-network-join-sign-in-failed = No s’ha pogut iniciar la sessió. Comproveu el nom d’usuari i la contrasenya.
settings-network-join-wrong-password = Aquesta contrasenya no ha funcionat. Comproveu-la i torneu-ho a provar.

## Network: connection settings page

settings-network-forget = Oblida aquesta xarxa
    .description = En suprimeix la contrasenya i la configuració d’aquest ordinador
    .button = Oblida
settings-network-remove-vpn = Treu aquesta VPN
settings-network-remove-connection = Treu aquesta connexió
settings-network-remove-description = En suprimeix la configuració d’aquest ordinador
settings-network-remove = Treu

settings-network-general = General
settings-network-autoconnect = Connecta automàticament
settings-network-autoconnect-wifi = Connecta’t a aquesta xarxa sempre que sigui a l’abast
settings-network-autoconnect-wired = Connecta’t tan bon punt s’endolli un cable
settings-network-autoconnect-vpn = Connecta’t sempre que aquest ordinador estigui en línia
settings-network-autoconnect-other = Connecta’t sempre que estigui disponible
settings-network-all-users = Disponible per a tothom
    .description = Qualsevol persona que iniciï la sessió aquí la pot fer servir
settings-network-metered = Connexió amb límit de dades
    .description = Les aplicacions i les actualitzacions eviten les baixades grans
settings-network-metered-automatic = Detecta-ho automàticament
settings-network-metered-yes = Amb límit
settings-network-metered-no = Sense límit

settings-network-security = Seguretat
settings-network-security-type = Tipus de seguretat

settings-network-advanced = Avançat
settings-network-private-address = Adreça privada
    .description = Fa que sigui més difícil seguir aquest ordinador en aquesta xarxa
settings-network-hardware-address = Adreça física
    .description = L’adreça que aquest ordinador mostra a la xarxa
settings-network-mac-random = Una adreça nova cada vegada
settings-network-mac-stable = La mateixa adreça per a aquesta xarxa
settings-network-mac-private-off = Desactivada
settings-network-mac-builtin = Adreça integrada
settings-network-mac-custom = Adreça personalitzada
settings-network-mtu = Mida màxima de paquet (MTU)
    .description = Deixeu-ho buit tret que la xarxa necessiti una mida concreta
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Mètode
    .label = Mètode { $family }
settings-network-ip-dhcp = Automàtic, només adreces
settings-network-ip-manual = Manual
settings-network-ip-link-local = Només enllaç local
settings-network-ip-shared = Compartit amb altres dispositius
settings-network-ip-ignore = No gestionat
settings-network-ip-disabled = Desactivat
settings-network-ip-addresses = Adreces
    .description = Cadascuna amb el seu prefix, com ara { $example }
settings-network-ip-address = Adreça { $number }
settings-network-ip-remove-address = Treu l’adreça
settings-network-ip-add-address = Afegeix una adreça
settings-network-ip-router = Encaminador { $family }
settings-network-ip-automatic-dns = DNS automàtic
    .description = Fa servir els servidors DNS que proposa aquesta xarxa
settings-network-ip-dns-first = Es fan servir abans dels proposats
settings-network-ip-dns-separate = Separeu les adreces amb comes
settings-network-ip-dns-servers = Servidors DNS { $family }
settings-network-ip-search-domains = Dominis de cerca
    .description = S’hi prova quan un nom no té domini, com ara «impressora»
    .label = Dominis de cerca { $family }
settings-network-ip-automatic-routes = Rutes automàtiques
    .description = Fa servir les rutes que proposa aquesta xarxa
settings-network-ip-routes = Rutes
    .description = Envia el trànsit d’algunes xarxes a través d’un altre encaminador
settings-network-ip-add-route = Afegeix una ruta
settings-network-route-network = Xarxa
settings-network-route-priority = Prioritat
settings-network-route-remove = Treu la ruta

## Network: work or school (802.1X) sign-in

settings-network-eap = Autenticació
settings-network-eap-peap = EAP protegit (PEAP)
settings-network-eap-ttls = TLS amb túnel (TTLS)
settings-network-eap-tls = Certificat (TLS)
settings-network-eap-inner = Autenticació interna
settings-network-client-certificate = El vostre certificat
settings-network-private-key-password = Contrasenya de la clau privada
    .placeholder = Si la clau en té
settings-network-anonymous-identity = Identitat anònima
    .description = Deixeu-ho buit tret que la xarxa ho demani
settings-network-ca = Certificat de la CA
    .description = Confirma que us connecteu a la xarxa real
settings-network-ca-system = Fes servir els certificats del sistema
settings-network-ca-file = Trieu un fitxer…
settings-network-ca-another-file = Trieu un altre fitxer…
settings-network-ca-none = No ho comprovis
settings-network-choose-file = Tria…
settings-network-server-domain = Domini del servidor
    .description = Només es connecta a servidors d’aquest domini

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Introduïu un nom
settings-network-error-no-addresses = Afegiu com a mínim una adreça
settings-network-error-address = Introduïu una adreça amb el seu prefix, com ara { $example }
settings-network-error-router = Introduïu l’adreça d’un encaminador, com ara { $example }
settings-network-error-dns = «{ $address }» no és una adreça vàlida
settings-network-error-search-domain = «{ $domain }» no és un domini vàlid
settings-network-error-route = Introduïu una xarxa, com ara { $example }
settings-network-error-priority = La prioritat ha de ser un nombre enter
settings-network-error-username = Introduïu el nom d’usuari
settings-network-error-domain = Introduïu un domini, com ara example.com
settings-network-error-certificate = Trieu el vostre certificat
settings-network-error-private-key = Trieu la vostra clau privada
settings-network-error-mtu = Feu servir un nombre entre { $lowest } i { $highest }, o deixeu-ho buit
settings-network-error-mac = Introduïu una adreça com ara 12:34:56:78:9A:BC
settings-network-error-password = Introduïu la contrasenya
settings-network-error-password-length = { $count ->
        [one] Feu servir com a mínim { $count } caràcter
       *[other] Feu servir com a mínim { $count } caràcters
    }

## Network: proxy

settings-network-proxy-off = Desactivat
settings-network-proxy-manual = Manual
settings-network-proxy-url = Adreça de configuració
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Web segur (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Servidor
    .label = Servidor { $protocol }
settings-network-proxy-port = Port
    .label = Port { $protocol }
settings-network-proxy-skip = No facis servir el servidor intermediari per a
settings-network-proxy-error-url = Introduïu una adreça web, com ara http://example.com/proxy.pac
settings-network-proxy-error-host = Introduïu només el nom del servidor, com ara proxy.example.com
settings-network-proxy-error-port = Feu servir un port entre 1 i 65535
settings-network-proxy-save-failed = No s’ha pogut desar la configuració del servidor intermediari

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importa des d’un fitxer
    .description = Fitxers de configuració de WireGuard, OpenVPN i altres VPN
settings-network-vpn-importing = S’està important…
settings-network-wireguard = Configura WireGuard
    .description = Introduïu les dades del vostre proveïdor de VPN o del servidor
settings-network-wireguard-dialog = El vostre proveïdor de VPN o el propietari del servidor us poden donar aquestes dades.
settings-network-wireguard-name-example = VPN de casa
settings-network-wireguard-public-key = Clau pública { $key }
settings-network-wireguard-public-key-pending = La clau pública per compartir apareixerà aquí
settings-network-wireguard-copy = Copia la clau pública
settings-network-wireguard-copied = Copiada
settings-network-wireguard-generate = Genera una clau nova
settings-network-wireguard-addresses = Adreces d’aquest ordinador dins la VPN
settings-network-wireguard-server-key = Clau pública del servidor
settings-network-wireguard-endpoint = Adreça del servidor
settings-network-wireguard-allowed-ips = IP permeses
    .description = El trànsit cap a aquests intervals passa per la VPN
settings-network-wireguard-preshared-key = Clau precompartida
settings-network-wireguard-keepalive = Manteniment de la connexió
    .description = Ajuda a mantenir la connexió activa darrere d’un encaminador
    .placeholder = Opcional, en segons
settings-network-wireguard-add = Afegeix
settings-network-wireguard-adding = S’està afegint…
settings-network-wireguard-error-private-key = Introduïu o genereu una clau privada
settings-network-wireguard-error-addresses = Introduïu com a mínim una adreça
settings-network-wireguard-error-server-key = Introduïu la clau pública del servidor
settings-network-wireguard-error-endpoint = Introduïu l’adreça i el port del servidor
settings-network-wireguard-error-allowed-ips = Introduïu com a mínim un interval
settings-network-wireguard-error-keepalive = Introduïu un nombre de segons

## Bluetooth panel

settings-bluetooth-hardware-off = Desactivat per un interruptor físic
settings-bluetooth-power-on-failed = No s’ha pogut activar el Bluetooth
settings-bluetooth-power-off-failed = No s’ha pogut desactivar el Bluetooth
settings-bluetooth-visible = Visible per als dispositius propers
    .description = Permet que els telèfons i els ordinadors trobin aquest ordinador
settings-bluetooth-visible-as = Es mostra com a «{ $name }»
settings-bluetooth-visible-duration = Temps visible
settings-bluetooth-visible-for = { $minutes ->
        [one] Durant { $minutes } minut
       *[other] Durant { $minutes } minuts
    }
settings-bluetooth-visible-until-off = Fins que es desactivi
settings-bluetooth-visible-failed = No s’ha pogut canviar si aquest ordinador és visible
settings-bluetooth-paired = Els meus dispositius
settings-bluetooth-nearby = Dispositius propers
settings-bluetooth-searching = S’estan cercant dispositius…
    .description = Poseu el dispositiu que voleu afegir en mode de vinculació
settings-bluetooth-blocked = Un interruptor físic ha desactivat el Bluetooth
    .description = Feu servir l’interruptor o la tecla de l’ordinador per activar-lo
settings-bluetooth-details = Detalls del dispositiu
settings-bluetooth-connected = Connectat
settings-bluetooth-connected-battery = Connectat · Bateria: { $battery }
settings-bluetooth-connecting = S’està connectant…
settings-bluetooth-disconnecting = S’està desconnectant…
settings-bluetooth-pairing = S’està vinculant…
settings-bluetooth-forget-confirm = Voleu oblidar «{ $name }»?
    .description = L’haureu de tornar a vincular per fer-lo servir amb aquest ordinador.
settings-bluetooth-forget = Oblida
settings-bluetooth-cancel = Cancel·la
settings-bluetooth-connect = Connecta
settings-bluetooth-disconnect = Desconnecta
settings-bluetooth-done = Fet

## Bluetooth: device details

settings-bluetooth-type = Tipus
settings-bluetooth-battery = Bateria
settings-bluetooth-address = Adreça
settings-bluetooth-autoconnect = Connecta automàticament
    .description = Sempre que sigui a prop
settings-bluetooth-kind-headphones = Auriculars
settings-bluetooth-kind-speaker = Altaveu
settings-bluetooth-kind-mouse = Ratolí
settings-bluetooth-kind-keyboard = Teclat
settings-bluetooth-kind-gamepad = Comandament de joc
settings-bluetooth-kind-phone = Telèfon
settings-bluetooth-kind-computer = Ordinador
settings-bluetooth-kind-tablet = Tauleta
settings-bluetooth-kind-display = Pantalla
settings-bluetooth-kind-printer = Impressora
settings-bluetooth-kind-camera = Càmera
settings-bluetooth-kind-other = Un altre dispositiu

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = el dispositiu
settings-bluetooth-request-confirm = Voleu vincular { $name }?
    .description = Comproveu que { $name } mostri el mateix codi.
settings-bluetooth-request-authorize = Voleu permetre que { $name } es vinculi?
    .description = Si ho permeteu, { $name } es podrà connectar a aquest ordinador.
settings-bluetooth-request-pin = Introduïu el PIN que demana { $name }
    .description = Sovint és 0000 o 1234. Si cap dels dos funciona, el trobareu al manual del dispositiu.
settings-bluetooth-request-passkey = Introduïu el codi que mostra { $name }
    .description = Escriviu els sis dígits tal com apareixen.
settings-bluetooth-request-display = Vincula amb { $name }
    .description = Escriviu aquest codi amb { $name } i premeu Retorn.
settings-bluetooth-pair = Vincula
settings-bluetooth-allow = Permet

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Porteu els dispositius de Windows
    .description = { $count ->
        [one] { $devices } està vinculat a Windows. Feu-lo servir aquí sense tornar-lo a vincular.
       *[other] { $devices } estan vinculats a Windows. Feu-los servir aquí sense tornar-los a vincular.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } més
       *[other] { $count } més
    }

## Accounts panel

settings-accounts-unavailable = Els comptes no estan disponibles
    .description = El servei de comptes no està instal·lat en aquest ordinador
settings-accounts-online = Comptes en línia
    .description = Cada compte és una carpeta dins de Cloud, a la vostra carpeta personal, que qualsevol aplicació pot obrir. Els fitxers es baixen quan els obriu.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud o WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Torneu a iniciar la sessió per continuar fent-lo servir
settings-accounts-paused-metered = Sincronització en pausa en una connexió amb límit de dades
settings-accounts-paused-battery = Sincronització en pausa mentre la bateria és baixa
settings-accounts-connecting = S’està connectant…
settings-accounts-offline = Fora de línia
settings-accounts-offline-kept = Fora de línia, els fitxers conservats continuen aquí
settings-accounts-not-connected = No connectat
settings-accounts-syncing = { $count ->
        [one] S’està sincronitzant { $count } canvi
       *[other] S’estan sincronitzant { $count } canvis
    }
settings-accounts-name = Nom
settings-accounts-folder = Carpeta
settings-accounts-server = Servidor
settings-accounts-storage = Emmagatzematge
settings-accounts-storage-used = { $used } de { $total } en ús
settings-accounts-on-device = En aquest dispositiu
settings-accounts-kept = { $count ->
        [one] { $count } element conservat, la resta es baixa quan s’obre
       *[other] { $count } elements conservats, la resta es baixa quan s’obre
    }
settings-accounts-on-demand = Els fitxers es baixen quan els obriu
settings-accounts-sign-in-again = Torna a iniciar la sessió
settings-accounts-keep = Conserva
settings-accounts-remove = Treu
settings-accounts-remove-confirm = Treu d’aquest ordinador
settings-accounts-removing = S’està traient…
settings-accounts-remove-note = Els fitxers es queden a { $provider }. Abans s’hi envien els canvis fets aquí.

## Accounts: providers

settings-accounts-provider-icloud = El vostre compte d’Apple, confirmat amb un codi de l’iPhone, l’iPad o el Mac
settings-accounts-provider-onedrive = Un compte de Microsoft personal, de la feina o de l’escola, al navegador
settings-accounts-provider-dropbox = Un compte de Dropbox, al navegador
settings-accounts-provider-nextcloud = Un servidor propi o de la vostra organització
settings-accounts-provider-webdav = Qualsevol servidor compatible amb WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Torneu a iniciar la sessió a { $account }
settings-accounts-browser = S’obrirà el navegador perquè inicieu la sessió amb { $provider }. Luft no veu mai la vostra contrasenya.
settings-accounts-password-for = Introduïu la contrasenya de { $user }.
settings-accounts-apple-account = Compte d’Apple
settings-accounts-password = Contrasenya
settings-accounts-app-password = Contrasenya d’aplicació
settings-accounts-user = Nom d’usuari
settings-accounts-apple-note = Feu servir la contrasenya del compte d’Apple; aquí no funcionen les contrasenyes específiques d’aplicació. Després, Apple mostrarà un codi a l’iPhone, l’iPad o el Mac.
settings-accounts-nextcloud-browser = S’obrirà el navegador perquè inicieu la sessió al servidor i hi doneu accés a Luft.
settings-accounts-use-app-password = Fes servir una contrasenya d’aplicació
settings-accounts-error-server = Introduïu l’adreça del servidor
settings-accounts-error-apple-account = Introduïu l’adreça electrònica del compte d’Apple
settings-accounts-error-user = Introduïu el nom d’usuari
settings-accounts-error-password = Introduïu la contrasenya
settings-accounts-cancel = Cancel·la
settings-accounts-back = Enrere
settings-accounts-continue-in-browser = Continua al navegador
settings-accounts-sign-in = Inicia la sessió
settings-accounts-try-again = Torna-ho a provar
settings-accounts-continue = Continua
settings-accounts-working = S’està connectant amb { $provider }…
settings-accounts-finish-in-browser = Acabeu d’iniciar la sessió amb { $provider } al navegador. Luft no veu mai la vostra contrasenya, i això s’actualitzarà sol quan hàgiu acabat.
settings-accounts-no-browser = No s’ha obert cap navegador. Copieu l’enllaç i obriu-lo en un navegador.
settings-accounts-open-again = Torna a obrir la pàgina
settings-accounts-copy-link = Copia l’enllaç
settings-accounts-copied = Copiat
settings-accounts-code = Codi de verificació
    .placeholder = Codi de 6 dígits
settings-accounts-text-me = Envia’m un codi per SMS
settings-accounts-choose-phone = A quin número ha d’enviar Apple el codi?
    .description = Envia un SMS
settings-accounts-approve = El vostre compte d’Apple fa servir la protecció de dades avançada. Aproveu la sol·licitud a l’iPhone, l’iPad o el Mac perquè aquest ordinador pugui obrir l’iCloud Drive.
