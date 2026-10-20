### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Guardar
settings-network-saving = Guardando…
settings-network-cancel = Cancelar
settings-network-connect = Conectar
settings-network-disconnect = Desconectar
settings-network-optional = Opcional
settings-network-automatic = Automático
settings-network-name = Nombre
settings-network-password = Contraseña
settings-network-password-saved = Contraseña guardada
settings-network-username = Nombre de usuario
settings-network-router = Router
settings-network-dns-servers = Servidores DNS
settings-network-private-key = Clave privada
settings-network-connection-settings = Configuración de la conexión
settings-network-connect-failed = No se ha podido conectar

## Network: connection states

settings-network-link-connected = Conectado
settings-network-link-connecting = Conectando…
settings-network-link-disconnected = Sin conexión
settings-network-link-unplugged = Cable desconectado

## Network: Wi‑Fi security types

settings-network-security-open = Ninguna
settings-network-security-owe = Abierta mejorada
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Empresarial

## Network: signal and radio details

settings-network-signal-excellent = Excelente
settings-network-signal-good = Buena
settings-network-signal-fair = Aceptable
settings-network-signal-weak = Débil
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Canal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Señal
settings-network-detail-band = Banda
settings-network-detail-speed = Velocidad de conexión
settings-network-detail-access-point = Punto de acceso
settings-network-detail-security = Seguridad
settings-network-detail-ipv4 = Dirección IP
settings-network-detail-ipv6 = Dirección IPv6
settings-network-detail-router = Router
settings-network-detail-dns = DNS
settings-network-detail-mac = Dirección física

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Desactivado con un interruptor físico
settings-network-wifi-connected = Conectado a { $network }
settings-network-airplane = Modo avión
    .description = Desactiva todas las conexiones inalámbricas
settings-network-airplane-hardware = Activado con un interruptor físico
settings-network-known = Redes conocidas
    .description = Redes a las que este ordenador se ha conectado antes, estén cerca o no
settings-network-known-count = { $count ->
        [one] { $count } red guardada
       *[other] { $count } redes guardadas
    }
settings-network-known-in-range = Al alcance
settings-network-wired = Por cable
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Conectado · { $speed }
settings-network-empty = No hay conexiones de red
    .description = Conecta un cable de red o un adaptador Wi‑Fi para conectarte a internet
settings-network-proxy = Proxy
    .description = Envía el tráfico web a través de otro servidor; suele hacer falta en redes de empresas o centros educativos.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Redes Wi‑Fi
settings-network-wifi-saved = Guardada
settings-network-wifi-enterprise = Iniciar sesión con una cuenta del trabajo o del centro educativo
settings-network-wifi-connect-failed = No se ha podido conectar a esta red
settings-network-wifi-saved-password-failed = La contraseña guardada no ha funcionado. Vuelve a escribirla.
settings-network-wifi-settings = Configuración de la red
settings-network-wifi-searching = Buscando redes…
settings-network-hidden = Conectarse a una red oculta
    .description = Escribe el nombre de la red y su tipo de seguridad.
settings-network-hidden-name = Nombre de la red

## Network: joining a Wi‑Fi network

settings-network-join = Conectarse a «{ $network }»
settings-network-join-enterprise = Inicia sesión con tu cuenta del trabajo o del centro educativo.
settings-network-join-password = Escribe la contraseña de esta red.
settings-network-join-failed = No se ha podido conectar a esta red.
settings-network-join-sign-in-failed = No se ha podido iniciar sesión. Comprueba el nombre de usuario y la contraseña.
settings-network-join-wrong-password = La contraseña no es correcta. Revísala y vuelve a intentarlo.

## Network: connection settings page

settings-network-forget = Olvidar esta red
    .description = Quita su contraseña y su configuración de este ordenador
    .button = Olvidar
settings-network-remove-vpn = Quitar esta VPN
settings-network-remove-connection = Quitar esta conexión
settings-network-remove-description = Elimina su configuración de este ordenador
settings-network-remove = Quitar

settings-network-general = General
settings-network-autoconnect = Conectar automáticamente
settings-network-autoconnect-wifi = Conectarse a esta red siempre que esté al alcance
settings-network-autoconnect-wired = Conectarse en cuanto se enchufe un cable
settings-network-autoconnect-vpn = Conectarse siempre que este ordenador esté en línea
settings-network-autoconnect-other = Conectarse siempre que esté disponible
settings-network-all-users = Disponible para todos
    .description = Cualquiera que inicie sesión aquí puede usarla
settings-network-metered = Conexión de uso medido
    .description = Las aplicaciones y las actualizaciones evitan las descargas grandes
settings-network-metered-automatic = Detectar automáticamente
settings-network-metered-yes = De uso medido
settings-network-metered-no = Sin uso medido

settings-network-security = Seguridad
settings-network-security-type = Tipo de seguridad

settings-network-advanced = Opciones avanzadas
settings-network-private-address = Dirección privada
    .description = Dificulta el seguimiento de este ordenador en esta red
settings-network-hardware-address = Dirección física
    .description = La dirección que este ordenador muestra a la red
settings-network-mac-random = Una dirección nueva cada vez
settings-network-mac-stable = La misma dirección para esta red
settings-network-mac-private-off = Desactivada
settings-network-mac-builtin = Dirección integrada
settings-network-mac-custom = Dirección personalizada
settings-network-mtu = Tamaño máximo de paquete (MTU)
    .description = Déjalo vacío salvo que tu red necesite un tamaño concreto
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Método
    .label = Método { $family }
settings-network-ip-dhcp = Automático, solo direcciones
settings-network-ip-manual = Manual
settings-network-ip-link-local = Solo enlace local
settings-network-ip-shared = Compartido con otros dispositivos
settings-network-ip-ignore = Sin gestionar
settings-network-ip-disabled = Desactivado
settings-network-ip-addresses = Direcciones
    .description = Cada una con su prefijo, como { $example }
settings-network-ip-address = Dirección { $number }
settings-network-ip-remove-address = Quitar dirección
settings-network-ip-add-address = Añadir dirección
settings-network-ip-router = Router { $family }
settings-network-ip-automatic-dns = DNS automático
    .description = Usar los servidores DNS que propone esta red
settings-network-ip-dns-first = Se usan antes que los propuestos
settings-network-ip-dns-separate = Separa las direcciones con comas
settings-network-ip-dns-servers = Servidores DNS { $family }
settings-network-ip-search-domains = Dominios de búsqueda
    .description = Se prueban cuando un nombre no tiene dominio, como «impresora»
    .label = Dominios de búsqueda { $family }
settings-network-ip-automatic-routes = Rutas automáticas
    .description = Usar las rutas que propone esta red
settings-network-ip-routes = Rutas
    .description = Envía el tráfico de algunas redes a través de otro router
settings-network-ip-add-route = Añadir ruta
settings-network-route-network = Red
settings-network-route-priority = Prioridad
settings-network-route-remove = Quitar ruta

## Network: work or school (802.1X) sign-in

settings-network-eap = Autenticación
settings-network-eap-peap = EAP protegido (PEAP)
settings-network-eap-ttls = TLS con túnel (TTLS)
settings-network-eap-tls = Certificado (TLS)
settings-network-eap-inner = Autenticación interna
settings-network-client-certificate = Tu certificado
settings-network-private-key-password = Contraseña de la clave privada
    .placeholder = Si la clave tiene una
settings-network-anonymous-identity = Identidad anónima
    .description = Déjala vacía salvo que tu red la pida
settings-network-ca = Certificado de CA
    .description = Confirma que te conectas a la red auténtica
settings-network-ca-system = Usar los certificados del sistema
settings-network-ca-file = Elegir un archivo…
settings-network-ca-another-file = Elegir otro archivo…
settings-network-ca-none = No comprobar
settings-network-choose-file = Elegir…
settings-network-server-domain = Dominio del servidor
    .description = Conectarse solo a servidores de este dominio

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Escribe un nombre
settings-network-error-no-addresses = Añade al menos una dirección
settings-network-error-address = Escribe una dirección con su prefijo, como { $example }
settings-network-error-router = Escribe la dirección de un router, como { $example }
settings-network-error-dns = «{ $address }» no es una dirección válida
settings-network-error-search-domain = «{ $domain }» no es un dominio válido
settings-network-error-route = Escribe una red, como { $example }
settings-network-error-priority = Usa un número entero para la prioridad
settings-network-error-username = Escribe tu nombre de usuario
settings-network-error-domain = Escribe un dominio, como example.com
settings-network-error-certificate = Elige tu certificado
settings-network-error-private-key = Elige tu clave privada
settings-network-error-mtu = Usa un número entre { $lowest } y { $highest }, o déjalo vacío
settings-network-error-mac = Escribe una dirección como 12:34:56:78:9A:BC
settings-network-error-password = Escribe tu contraseña
settings-network-error-password-length = { $count ->
        [one] Usa al menos { $count } carácter
       *[other] Usa al menos { $count } caracteres
    }

## Network: proxy

settings-network-proxy-off = Desactivado
settings-network-proxy-manual = Manual
settings-network-proxy-url = Dirección de configuración
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Web segura (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Servidor
    .label = Servidor { $protocol }
settings-network-proxy-port = Puerto
    .label = Puerto { $protocol }
settings-network-proxy-skip = No usar el proxy para
settings-network-proxy-error-url = Escribe una dirección web, como http://example.com/proxy.pac
settings-network-proxy-error-host = Escribe solo el nombre del servidor, como proxy.example.com
settings-network-proxy-error-port = Usa un puerto entre 1 y 65535
settings-network-proxy-save-failed = No se ha podido guardar la configuración del proxy

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importar desde un archivo
    .description = Archivos de configuración de WireGuard, OpenVPN y otras VPN
settings-network-vpn-importing = Importando…
settings-network-wireguard = Configurar WireGuard
    .description = Escribe los datos de tu proveedor de VPN o de tu servidor
settings-network-wireguard-dialog = Tu proveedor de VPN o quien gestione el servidor puede darte estos datos.
settings-network-wireguard-name-example = VPN de casa
settings-network-wireguard-public-key = Clave pública { $key }
settings-network-wireguard-public-key-pending = Aquí aparecerá su clave pública para compartirla
settings-network-wireguard-copy = Copiar clave pública
settings-network-wireguard-copied = Copiada
settings-network-wireguard-generate = Generar una clave nueva
settings-network-wireguard-addresses = Direcciones de este ordenador dentro de la VPN
settings-network-wireguard-server-key = Clave pública del servidor
settings-network-wireguard-endpoint = Dirección del servidor
settings-network-wireguard-allowed-ips = IP permitidas
    .description = El tráfico hacia estos rangos pasa por la VPN
settings-network-wireguard-preshared-key = Clave precompartida
settings-network-wireguard-keepalive = Keepalive
    .description = Ayuda a mantener la conexión detrás de un router
    .placeholder = Opcional, en segundos
settings-network-wireguard-add = Añadir
settings-network-wireguard-adding = Añadiendo…
settings-network-wireguard-error-private-key = Escribe o genera una clave privada
settings-network-wireguard-error-addresses = Escribe al menos una dirección
settings-network-wireguard-error-server-key = Escribe la clave pública del servidor
settings-network-wireguard-error-endpoint = Escribe la dirección y el puerto del servidor
settings-network-wireguard-error-allowed-ips = Escribe al menos un rango
settings-network-wireguard-error-keepalive = Escribe un número de segundos

## Bluetooth panel

settings-bluetooth-hardware-off = Desactivado con un interruptor físico
settings-bluetooth-power-on-failed = No se ha podido activar el Bluetooth
settings-bluetooth-power-off-failed = No se ha podido desactivar el Bluetooth
settings-bluetooth-visible = Visible para dispositivos cercanos
    .description = Permite que teléfonos y ordenadores encuentren este ordenador
settings-bluetooth-visible-as = Se muestra como «{ $name }»
settings-bluetooth-visible-duration = Mantener visible
settings-bluetooth-visible-for = { $minutes ->
        [one] Durante { $minutes } minuto
       *[other] Durante { $minutes } minutos
    }
settings-bluetooth-visible-until-off = Hasta que se desactive
settings-bluetooth-visible-failed = No se ha podido cambiar la visibilidad de este ordenador
settings-bluetooth-paired = Mis dispositivos
settings-bluetooth-nearby = Dispositivos cercanos
settings-bluetooth-searching = Buscando dispositivos…
    .description = Pon en modo de emparejamiento el dispositivo que quieres añadir
settings-bluetooth-blocked = El Bluetooth está desactivado con un interruptor físico
    .description = Usa el interruptor o la tecla del ordenador para activarlo
settings-bluetooth-details = Detalles del dispositivo
settings-bluetooth-connected = Conectado
settings-bluetooth-connected-battery = Conectado · { $battery } de batería
settings-bluetooth-connecting = Conectando…
settings-bluetooth-disconnecting = Desconectando…
settings-bluetooth-pairing = Emparejando…
settings-bluetooth-forget-confirm = ¿Olvidar «{ $name }»?
    .description = Tendrás que volver a emparejarlo para usarlo con este ordenador.
settings-bluetooth-forget = Olvidar
settings-bluetooth-cancel = Cancelar
settings-bluetooth-connect = Conectar
settings-bluetooth-disconnect = Desconectar
settings-bluetooth-done = Listo

## Bluetooth: device details

settings-bluetooth-type = Tipo
settings-bluetooth-battery = Batería
settings-bluetooth-address = Dirección
settings-bluetooth-autoconnect = Conectar automáticamente
    .description = Siempre que esté cerca
settings-bluetooth-kind-headphones = Auriculares
settings-bluetooth-kind-speaker = Altavoz
settings-bluetooth-kind-mouse = Ratón
settings-bluetooth-kind-keyboard = Teclado
settings-bluetooth-kind-gamepad = Mando de juegos
settings-bluetooth-kind-phone = Teléfono
settings-bluetooth-kind-computer = Ordenador
settings-bluetooth-kind-tablet = Tableta
settings-bluetooth-kind-display = Pantalla
settings-bluetooth-kind-printer = Impresora
settings-bluetooth-kind-camera = Cámara
settings-bluetooth-kind-other = Otro dispositivo

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = el dispositivo
settings-bluetooth-request-confirm = ¿Emparejar con { $name }?
    .description = Comprueba que { $name } muestra el mismo código.
settings-bluetooth-request-authorize = ¿Permitir que { $name } se empareje?
    .description = { $name } podrá conectarse a este ordenador.
settings-bluetooth-request-pin = Escribe el PIN para { $name }
    .description = Suele ser 0000 o 1234. Si ninguno funciona, lo encontrarás en el manual del dispositivo.
settings-bluetooth-request-passkey = Escribe el código que aparece en { $name }
    .description = Escribe los seis dígitos tal como aparecen.
settings-bluetooth-request-display = Emparejar con { $name }
    .description = Escribe este código en { $name } y pulsa Intro.
settings-bluetooth-pair = Emparejar
settings-bluetooth-allow = Permitir

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Trae tus dispositivos de Windows
    .description = { $count ->
        [one] { $devices } está emparejado en Windows. Úsalo aquí sin volver a emparejarlo.
       *[other] { $devices } están emparejados en Windows. Úsalos aquí sin volver a emparejarlos.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } más
       *[other] { $count } más
    }

## Accounts panel

settings-accounts-unavailable = Las cuentas no están disponibles
    .description = El servicio de cuentas no está instalado en este ordenador
settings-accounts-online = Cuentas en línea
    .description = Cada cuenta es una carpeta dentro de Cloud, en tu carpeta personal, que cualquier aplicación puede abrir. Los archivos se descargan al abrirlos.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud o WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Vuelve a iniciar sesión para seguir usándola
settings-accounts-paused-metered = Sincronización en pausa en una conexión de uso medido
settings-accounts-paused-battery = Sincronización en pausa por batería baja
settings-accounts-connecting = Conectando…
settings-accounts-offline = Sin conexión
settings-accounts-offline-kept = Sin conexión, los archivos guardados siguen aquí
settings-accounts-not-connected = No conectada
settings-accounts-syncing = { $count ->
        [one] Sincronizando { $count } cambio
       *[other] Sincronizando { $count } cambios
    }
settings-accounts-name = Nombre
settings-accounts-folder = Carpeta
settings-accounts-server = Servidor
settings-accounts-storage = Almacenamiento
settings-accounts-storage-used = { $used } de { $total } en uso
settings-accounts-on-device = En este dispositivo
settings-accounts-kept = { $count ->
        [one] { $count } elemento guardado, el resto se descarga al abrirlo
       *[other] { $count } elementos guardados, el resto se descarga al abrirlo
    }
settings-accounts-on-demand = Los archivos se descargan al abrirlos
settings-accounts-sign-in-again = Volver a iniciar sesión
settings-accounts-keep = Conservar
settings-accounts-remove = Quitar
settings-accounts-remove-confirm = Quitar de este ordenador
settings-accounts-removing = Quitando…
settings-accounts-remove-note = Tus archivos se quedan en { $provider }. Los cambios hechos aquí se suben antes.

## Accounts: providers

settings-accounts-provider-icloud = Tu cuenta de Apple, confirmada con un código de tu iPhone, iPad o Mac
settings-accounts-provider-onedrive = Una cuenta Microsoft personal, del trabajo o del centro educativo, en el navegador
settings-accounts-provider-dropbox = Una cuenta de Dropbox, en el navegador
settings-accounts-provider-nextcloud = Tu propio servidor o el de tu organización
settings-accounts-provider-webdav = Cualquier servidor compatible con WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Volver a iniciar sesión en { $account }
settings-accounts-browser = Se abrirá el navegador para que inicies sesión con { $provider }. Luft nunca ve tu contraseña.
settings-accounts-password-for = Escribe la contraseña de { $user }.
settings-accounts-apple-account = Cuenta de Apple
settings-accounts-password = Contraseña
settings-accounts-app-password = Contraseña de aplicación
settings-accounts-user = Nombre de usuario
settings-accounts-apple-note = Usa la contraseña de tu cuenta de Apple; las contraseñas específicas de aplicación no sirven aquí. Después, Apple mostrará un código en tu iPhone, iPad o Mac.
settings-accounts-nextcloud-browser = Se abrirá el navegador para que inicies sesión en tu servidor y le des acceso a Luft.
settings-accounts-use-app-password = Usar una contraseña de aplicación
settings-accounts-error-server = Escribe la dirección del servidor
settings-accounts-error-apple-account = Escribe el correo electrónico de tu cuenta de Apple
settings-accounts-error-user = Escribe el nombre de usuario
settings-accounts-error-password = Escribe la contraseña
settings-accounts-cancel = Cancelar
settings-accounts-back = Atrás
settings-accounts-continue-in-browser = Continuar en el navegador
settings-accounts-sign-in = Iniciar sesión
settings-accounts-try-again = Reintentar
settings-accounts-continue = Continuar
settings-accounts-working = Conectando con { $provider }…
settings-accounts-finish-in-browser = Termina de iniciar sesión con { $provider } en el navegador. Luft nunca ve tu contraseña, y esto se actualizará solo cuando acabes.
settings-accounts-no-browser = No se ha abierto ningún navegador. Copia el enlace y ábrelo en un navegador.
settings-accounts-open-again = Volver a abrir la página
settings-accounts-copy-link = Copiar el enlace
settings-accounts-copied = Copiado
settings-accounts-code = Código de verificación
    .placeholder = Código de 6 dígitos
settings-accounts-text-me = Recibir el código por SMS
settings-accounts-choose-phone = ¿A qué número debe enviar Apple el código?
    .description = Enviar un SMS
settings-accounts-approve = Tu cuenta de Apple usa la Protección de datos avanzada. Aprueba la solicitud en tu iPhone, iPad o Mac para que este ordenador pueda abrir iCloud Drive.
