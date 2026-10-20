### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Salva
settings-network-saving = Salvataggio…
settings-network-cancel = Annulla
settings-network-connect = Connetti
settings-network-disconnect = Disconnetti
settings-network-optional = Facoltativo
settings-network-automatic = Automatico
settings-network-name = Nome
settings-network-password = Password
settings-network-password-saved = Password salvata
settings-network-username = Nome utente
settings-network-router = Router
settings-network-dns-servers = Server DNS
settings-network-private-key = Chiave privata
settings-network-connection-settings = Impostazioni connessione
settings-network-connect-failed = Impossibile connettersi

## Network: connection states

settings-network-link-connected = Connesso
settings-network-link-connecting = Connessione…
settings-network-link-disconnected = Non connesso
settings-network-link-unplugged = Cavo scollegato

## Network: Wi‑Fi security types

settings-network-security-open = Nessuna
settings-network-security-owe = Enhanced Open
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Enterprise

## Network: signal and radio details

settings-network-signal-excellent = Ottimo
settings-network-signal-good = Buono
settings-network-signal-fair = Discreto
settings-network-signal-weak = Debole
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Canale { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Segnale
settings-network-detail-band = Banda
settings-network-detail-speed = Velocità di collegamento
settings-network-detail-access-point = Punto di accesso
settings-network-detail-security = Sicurezza
settings-network-detail-ipv4 = Indirizzo IP
settings-network-detail-ipv6 = Indirizzo IPv6
settings-network-detail-router = Router
settings-network-detail-dns = DNS
settings-network-detail-mac = Indirizzo hardware

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Spenta da un interruttore fisico
settings-network-wifi-connected = Connessa a { $network }
settings-network-airplane = Modalità aereo
    .description = Disattiva tutte le connessioni wireless
settings-network-airplane-hardware = Attivata da un interruttore fisico
settings-network-known = Reti conosciute
    .description = Reti a cui questo computer si è già connesso, vicine o no
settings-network-known-count = { $count ->
        [one] { $count } rete salvata
       *[other] { $count } reti salvate
    }
settings-network-known-in-range = Nelle vicinanze
settings-network-wired = Rete cablata
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Connesso · { $speed }
settings-network-empty = Nessuna connessione di rete
    .description = Collega un cavo di rete o un adattatore Wi‑Fi per andare online
settings-network-proxy = Proxy
    .description = Invia il traffico web attraverso un altro server, spesso necessario sulle reti di lavoro o della scuola.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Reti Wi‑Fi
settings-network-wifi-saved = Salvata
settings-network-wifi-enterprise = Accedi con un account di lavoro o della scuola
settings-network-wifi-connect-failed = Impossibile connettersi a questa rete
settings-network-wifi-saved-password-failed = La password salvata non ha funzionato. Inseriscila di nuovo.
settings-network-wifi-settings = Impostazioni di rete
settings-network-wifi-searching = Ricerca di reti…
settings-network-hidden = Connettiti a una rete nascosta
    .description = Inserisci il nome della rete e il tipo di sicurezza.
settings-network-hidden-name = Nome della rete

## Network: joining a Wi‑Fi network

settings-network-join = Connettiti a “{ $network }”
settings-network-join-enterprise = Accedi con il tuo account di lavoro o della scuola.
settings-network-join-password = Inserisci la password di questa rete.
settings-network-join-failed = Impossibile connettersi a questa rete.
settings-network-join-sign-in-failed = Impossibile accedere. Controlla nome utente e password.
settings-network-join-wrong-password = La password non ha funzionato. Controllala e riprova.

## Network: connection settings page

settings-network-forget = Dimentica questa rete
    .description = Rimuove la password e le impostazioni da questo computer
    .button = Dimentica
settings-network-remove-vpn = Rimuovi questa VPN
settings-network-remove-connection = Rimuovi questa connessione
settings-network-remove-description = Elimina le sue impostazioni da questo computer
settings-network-remove = Rimuovi

settings-network-general = Generali
settings-network-autoconnect = Connetti automaticamente
settings-network-autoconnect-wifi = Si connette a questa rete quando è nelle vicinanze
settings-network-autoconnect-wired = Si connette appena viene collegato un cavo
settings-network-autoconnect-vpn = Si connette quando questo computer è online
settings-network-autoconnect-other = Si connette quando è disponibile
settings-network-all-users = Disponibile per tutti
    .description = Chiunque acceda a questo computer può usarla
settings-network-metered = Connessione a consumo
    .description = App e aggiornamenti limitano i download di grandi dimensioni
settings-network-metered-automatic = Rileva automaticamente
settings-network-metered-yes = A consumo
settings-network-metered-no = Non a consumo

settings-network-security = Sicurezza
settings-network-security-type = Tipo di sicurezza

settings-network-advanced = Avanzate
settings-network-private-address = Indirizzo privato
    .description = Rende questo computer più difficile da tracciare su questa rete
settings-network-hardware-address = Indirizzo hardware
    .description = L’indirizzo che questo computer mostra alla rete
settings-network-mac-random = Nuovo indirizzo ogni volta
settings-network-mac-stable = Stesso indirizzo per questa rete
settings-network-mac-private-off = Disattivato
settings-network-mac-builtin = Indirizzo integrato
settings-network-mac-custom = Indirizzo personalizzato
settings-network-mtu = Dimensione massima dei pacchetti (MTU)
    .description = Lascia vuoto se la tua rete non richiede una dimensione specifica
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Metodo
    .label = Metodo { $family }
settings-network-ip-dhcp = Automatico, solo indirizzi
settings-network-ip-manual = Manuale
settings-network-ip-link-local = Solo link-local
settings-network-ip-shared = Condiviso con altri dispositivi
settings-network-ip-ignore = Non gestito
settings-network-ip-disabled = Disattivato
settings-network-ip-addresses = Indirizzi
    .description = Ognuno con il suo prefisso, ad esempio { $example }
settings-network-ip-address = Indirizzo { $number }
settings-network-ip-remove-address = Rimuovi indirizzo
settings-network-ip-add-address = Aggiungi indirizzo
settings-network-ip-router = Router { $family }
settings-network-ip-automatic-dns = DNS automatico
    .description = Usa i server DNS suggeriti da questa rete
settings-network-ip-dns-first = Usati prima di quelli suggeriti
settings-network-ip-dns-separate = Separa gli indirizzi con una virgola
settings-network-ip-dns-servers = Server DNS { $family }
settings-network-ip-search-domains = Domini di ricerca
    .description = Usati quando un nome non ha un dominio, ad esempio “stampante”
    .label = Domini di ricerca { $family }
settings-network-ip-automatic-routes = Instradamenti automatici
    .description = Usa gli instradamenti suggeriti da questa rete
settings-network-ip-routes = Instradamenti
    .description = Invia il traffico di alcune reti attraverso un altro router
settings-network-ip-add-route = Aggiungi instradamento
settings-network-route-network = Rete
settings-network-route-priority = Priorità
settings-network-route-remove = Rimuovi instradamento

## Network: work or school (802.1X) sign-in

settings-network-eap = Autenticazione
settings-network-eap-peap = EAP protetto (PEAP)
settings-network-eap-ttls = TLS con tunnel (TTLS)
settings-network-eap-tls = Certificato (TLS)
settings-network-eap-inner = Autenticazione interna
settings-network-client-certificate = Il tuo certificato
settings-network-private-key-password = Password della chiave privata
    .placeholder = Se la chiave ne ha una
settings-network-anonymous-identity = Identità anonima
    .description = Lascia vuoto se la tua rete non la richiede
settings-network-ca = Certificato CA
    .description = Conferma che ti stai connettendo alla rete vera
settings-network-ca-system = Usa i certificati di sistema
settings-network-ca-file = Scegli un file…
settings-network-ca-another-file = Scegli un altro file…
settings-network-ca-none = Non verificare
settings-network-choose-file = Scegli…
settings-network-server-domain = Dominio del server
    .description = Si connette solo ai server di questo dominio

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Inserisci un nome
settings-network-error-no-addresses = Aggiungi almeno un indirizzo
settings-network-error-address = Inserisci un indirizzo con il suo prefisso, ad esempio { $example }
settings-network-error-router = Inserisci l’indirizzo di un router, ad esempio { $example }
settings-network-error-dns = “{ $address }” non è un indirizzo valido
settings-network-error-search-domain = “{ $domain }” non è un dominio valido
settings-network-error-route = Inserisci una rete, ad esempio { $example }
settings-network-error-priority = Usa un numero intero per la priorità
settings-network-error-username = Inserisci il tuo nome utente
settings-network-error-domain = Inserisci un dominio, ad esempio example.com
settings-network-error-certificate = Scegli il tuo certificato
settings-network-error-private-key = Scegli la tua chiave privata
settings-network-error-mtu = Usa un numero da { $lowest } a { $highest } o lascia vuoto
settings-network-error-mac = Inserisci un indirizzo come 12:34:56:78:9A:BC
settings-network-error-password = Inserisci la tua password
settings-network-error-password-length = { $count ->
        [one] Usa almeno { $count } carattere
       *[other] Usa almeno { $count } caratteri
    }

## Network: proxy

settings-network-proxy-off = Disattivato
settings-network-proxy-manual = Manuale
settings-network-proxy-url = Indirizzo di configurazione
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Web sicuro (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Server
    .label = Server { $protocol }
settings-network-proxy-port = Porta
    .label = Porta { $protocol }
settings-network-proxy-skip = Non usare il proxy per
settings-network-proxy-error-url = Inserisci un indirizzo web, ad esempio http://example.com/proxy.pac
settings-network-proxy-error-host = Inserisci solo il nome del server, ad esempio proxy.example.com
settings-network-proxy-error-port = Usa una porta da 1 a 65535
settings-network-proxy-save-failed = Impossibile salvare le impostazioni del proxy

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importa da un file
    .description = File di configurazione di WireGuard, OpenVPN e altre VPN
settings-network-vpn-importing = Importazione…
settings-network-wireguard = Configura WireGuard
    .description = Inserisci i dati forniti dal tuo provider VPN o dal tuo server
settings-network-wireguard-dialog = Il tuo provider VPN o il proprietario del server può darti questi dati.
settings-network-wireguard-name-example = VPN di casa
settings-network-wireguard-public-key = Chiave pubblica { $key }
settings-network-wireguard-public-key-pending = Qui comparirà la chiave pubblica da condividere
settings-network-wireguard-copy = Copia chiave pubblica
settings-network-wireguard-copied = Copiata
settings-network-wireguard-generate = Genera una nuova chiave
settings-network-wireguard-addresses = Indirizzi di questo computer nella VPN
settings-network-wireguard-server-key = Chiave pubblica del server
settings-network-wireguard-endpoint = Indirizzo del server
settings-network-wireguard-allowed-ips = IP consentiti
    .description = Il traffico verso questi intervalli passa attraverso la VPN
settings-network-wireguard-preshared-key = Chiave precondivisa
settings-network-wireguard-keepalive = Keepalive
    .description = Aiuta la connessione a restare attiva dietro un router
    .placeholder = Facoltativo, in secondi
settings-network-wireguard-add = Aggiungi
settings-network-wireguard-adding = Aggiunta…
settings-network-wireguard-error-private-key = Inserisci o genera una chiave privata
settings-network-wireguard-error-addresses = Inserisci almeno un indirizzo
settings-network-wireguard-error-server-key = Inserisci la chiave pubblica del server
settings-network-wireguard-error-endpoint = Inserisci l’indirizzo e la porta del server
settings-network-wireguard-error-allowed-ips = Inserisci almeno un intervallo
settings-network-wireguard-error-keepalive = Inserisci un numero di secondi

## Bluetooth panel

settings-bluetooth-hardware-off = Spento da un interruttore fisico
settings-bluetooth-power-on-failed = Impossibile accendere il Bluetooth
settings-bluetooth-power-off-failed = Impossibile spegnere il Bluetooth
settings-bluetooth-visible = Visibile ai dispositivi vicini
    .description = Consente a telefoni e computer di trovare questo computer
settings-bluetooth-visible-as = Visibile come “{ $name }”
settings-bluetooth-visible-duration = Resta visibile
settings-bluetooth-visible-for = { $minutes ->
        [one] Per { $minutes } minuto
       *[other] Per { $minutes } minuti
    }
settings-bluetooth-visible-until-off = Fino alla disattivazione
settings-bluetooth-visible-failed = Impossibile cambiare la visibilità di questo computer
settings-bluetooth-paired = I miei dispositivi
settings-bluetooth-nearby = Dispositivi vicini
settings-bluetooth-searching = Ricerca di dispositivi…
    .description = Metti in modalità di associazione il dispositivo che vuoi aggiungere
settings-bluetooth-blocked = Il Bluetooth è spento da un interruttore fisico
    .description = Usa l’interruttore o il tasto del computer per accenderlo
settings-bluetooth-details = Dettagli dispositivo
settings-bluetooth-connected = Connesso
settings-bluetooth-connected-battery = Connesso · batteria { $battery }
settings-bluetooth-connecting = Connessione…
settings-bluetooth-disconnecting = Disconnessione…
settings-bluetooth-pairing = Associazione…
settings-bluetooth-forget-confirm = Dimenticare “{ $name }”?
    .description = Dovrai associarlo di nuovo per usarlo con questo computer.
settings-bluetooth-forget = Dimentica
settings-bluetooth-cancel = Annulla
settings-bluetooth-connect = Connetti
settings-bluetooth-disconnect = Disconnetti
settings-bluetooth-done = Fine

## Bluetooth: device details

settings-bluetooth-type = Tipo
settings-bluetooth-battery = Batteria
settings-bluetooth-address = Indirizzo
settings-bluetooth-autoconnect = Connetti automaticamente
    .description = Quando è nelle vicinanze
settings-bluetooth-kind-headphones = Cuffie
settings-bluetooth-kind-speaker = Altoparlante
settings-bluetooth-kind-mouse = Mouse
settings-bluetooth-kind-keyboard = Tastiera
settings-bluetooth-kind-gamepad = Controller di gioco
settings-bluetooth-kind-phone = Telefono
settings-bluetooth-kind-computer = Computer
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Schermo
settings-bluetooth-kind-printer = Stampante
settings-bluetooth-kind-camera = Fotocamera
settings-bluetooth-kind-other = Altro dispositivo

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = il dispositivo
settings-bluetooth-request-confirm = Associare { $name }?
    .description = Verifica che { $name } mostri lo stesso codice.
settings-bluetooth-request-authorize = Consentire l’associazione con { $name }?
    .description = Una volta associato, { $name } potrà connettersi a questo computer.
settings-bluetooth-request-pin = Inserisci il PIN per { $name }
    .description = Spesso è 0000 o 1234. Se nessuno dei due funziona, lo trovi nel manuale del dispositivo.
settings-bluetooth-request-passkey = Inserisci il codice che mostra { $name }
    .description = Digita le sei cifre esattamente come appaiono.
settings-bluetooth-request-display = Associazione con { $name }
    .description = Digita questo codice con { $name }, poi premi Invio.
settings-bluetooth-pair = Associa
settings-bluetooth-allow = Consenti

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Porta i tuoi dispositivi da Windows
    .description = { $count ->
        [one] Windows ha già associato { $devices }. Usalo qui senza associarlo di nuovo.
       *[other] Windows ha già associato { $devices }. Usali qui senza associarli di nuovo.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } altro
       *[other] altri { $count }
    }

## Accounts panel

settings-accounts-unavailable = Account non disponibili
    .description = Il servizio degli account non è installato su questo computer
settings-accounts-online = Account online
    .description = Ogni account è una cartella dentro Cloud, nella tua cartella home, che tutte le app possono aprire. I file vengono scaricati quando li apri.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud o WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Accedi di nuovo per continuare a usarlo
settings-accounts-paused-metered = Sincronizzazione in pausa su una connessione a consumo
settings-accounts-paused-battery = Sincronizzazione in pausa con la batteria scarica
settings-accounts-connecting = Connessione…
settings-accounts-offline = Offline
settings-accounts-offline-kept = Offline, i file conservati sono ancora qui
settings-accounts-not-connected = Non connesso
settings-accounts-syncing = { $count ->
        [one] Sincronizzazione di { $count } modifica
       *[other] Sincronizzazione di { $count } modifiche
    }
settings-accounts-name = Nome
settings-accounts-folder = Cartella
settings-accounts-server = Server
settings-accounts-storage = Spazio di archiviazione
settings-accounts-storage-used = { $used } di { $total } in uso
settings-accounts-on-device = Su questo dispositivo
settings-accounts-kept = { $count ->
        [one] { $count } elemento conservato, il resto viene scaricato all’apertura
       *[other] { $count } elementi conservati, il resto viene scaricato all’apertura
    }
settings-accounts-on-demand = I file vengono scaricati quando li apri
settings-accounts-sign-in-again = Accedi di nuovo
settings-accounts-keep = Mantieni
settings-accounts-remove = Rimuovi
settings-accounts-remove-confirm = Rimuovi da questo computer
settings-accounts-removing = Rimozione…
settings-accounts-remove-note = I tuoi file restano su { $provider }. Le modifiche fatte qui vengono caricate prima.

## Accounts: providers

settings-accounts-provider-icloud = Il tuo account Apple, confermato con un codice dal tuo iPhone, iPad o Mac
settings-accounts-provider-onedrive = Un account Microsoft personale, di lavoro o della scuola, nel browser
settings-accounts-provider-dropbox = Un account Dropbox, nel browser
settings-accounts-provider-nextcloud = Il tuo server o quello della tua organizzazione
settings-accounts-provider-webdav = Qualsiasi server che supporta WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Accedi di nuovo a { $account }
settings-accounts-browser = Si apre il browser per accedere con { $provider }. Luft non vede mai la tua password.
settings-accounts-password-for = Inserisci la password per { $user }.
settings-accounts-apple-account = Account Apple
settings-accounts-password = Password
settings-accounts-app-password = Password per app
settings-accounts-user = Nome utente
settings-accounts-apple-note = Usa la password del tuo account Apple: le password specifiche per app qui non funzionano. Apple mostrerà poi un codice sul tuo iPhone, iPad o Mac.
settings-accounts-nextcloud-browser = Si apre il browser per accedere al tuo server e consentire l’accesso a Luft.
settings-accounts-use-app-password = Usa invece una password per app
settings-accounts-error-server = Inserisci l’indirizzo del server
settings-accounts-error-apple-account = Inserisci l’email del tuo account Apple
settings-accounts-error-user = Inserisci il nome utente
settings-accounts-error-password = Inserisci la password
settings-accounts-cancel = Annulla
settings-accounts-back = Indietro
settings-accounts-continue-in-browser = Continua nel browser
settings-accounts-sign-in = Accedi
settings-accounts-try-again = Riprova
settings-accounts-continue = Continua
settings-accounts-working = Comunicazione con { $provider }…
settings-accounts-finish-in-browser = Completa l’accesso con { $provider } nel browser. Luft non vede mai la tua password e questa pagina si aggiorna da sola quando hai finito.
settings-accounts-no-browser = Non si è aperto nessun browser. Copia il link e aprilo in un browser.
settings-accounts-open-again = Apri di nuovo la pagina
settings-accounts-copy-link = Copia il link
settings-accounts-copied = Copiato
settings-accounts-code = Codice di verifica
    .placeholder = Codice di 6 cifre
settings-accounts-text-me = Inviami invece un codice via SMS
settings-accounts-choose-phone = A quale numero deve inviare il codice Apple?
    .description = Invia un SMS
settings-accounts-approve = Il tuo account Apple usa la Protezione avanzata dei dati. Approva la richiesta sul tuo iPhone, iPad o Mac per consentire a questo computer di aprire iCloud Drive.
