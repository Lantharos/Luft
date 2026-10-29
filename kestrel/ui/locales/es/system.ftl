## Shared

system-cancel = Cancelar

## Dictation notifications

dictation-setup-title = Escribe hablando
dictation-setup-body = Habla y se escribirá lo que digas, en cualquier aplicación. El reconocimiento se hace en este ordenador, así que antes necesita su modelo de voz.
dictation-setup-action = Configurar dictado
dictation-unsupported-title = El dictado en { $language } no está disponible en este ordenador
dictation-unsupported-body = Su procesador no puede ejecutar el reconocedor de voz que necesita el idioma { $language }. Puedes dictar en otro idioma.
dictation-settings-action = Configuración de dictado

## System health notifications

health-gpu-reset-title = El controlador gráfico ha dejado de responder
health-gpu-reset-body = { $day ->
    [today] El ordenador se ha reiniciado solo hoy a las { $time }. En Configuración puedes ver cómo evitar que vuelva a pasar.
   *[other] El ordenador se reinició solo el { $date } a las { $time }. En Configuración puedes ver cómo evitar que vuelva a pasar.
}
health-gpu-reset-details = Detalles

oom-app-closed-title = Se ha cerrado { $app } para liberar memoria
oom-container-closed-title = Se ha cerrado un contenedor para liberar memoria
oom-closed-body = El ordenador se estaba quedando sin memoria, así que se ha cerrado para que todo lo demás siga respondiendo.
oom-closed-body-with-size = El ordenador se estaba quedando sin memoria, así que se ha cerrado para que todo lo demás siga respondiendo. Estaba usando { $size }.
memory-low-title = A Luft le queda poca memoria
memory-low-app-body = { $app } está usando { $size }. Fuerza su cierre para que todo lo demás siga respondiendo.
memory-low-container-body = Un contenedor está usando { $size }. Fuerza su cierre para que todo lo demás siga respondiendo.
memory-low-force-quit = Forzar cierre

## Input source indicator

input-source-indicator = Fuente de entrada: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = El modo avión está activado en el hardware
media-keys-airplane-mode-on = Modo avión activado
media-keys-airplane-mode-off = Modo avión desactivado
media-keys-bluetooth-on = Bluetooth activado
media-keys-bluetooth-off = Bluetooth desactivado
media-keys-caps-lock-on = Bloq Mayús activado
media-keys-caps-lock-off = Bloq Mayús desactivado
media-keys-num-lock-on = Bloq Num activado
media-keys-num-lock-off = Bloq Num desactivado

## VPN sign-in

vpn-sign-in-title = Iniciar sesión en { $connection }
vpn-connect = Conectar
vpn-signing-in = Iniciando sesión…
vpn-finish-in-browser = Termina de iniciar sesión en el navegador.
vpn-certificate-untrusted = { $host } ha presentado un certificado que no se puede verificar ({ $reason }). Su huella digital es { $fingerprint }.
vpn-certificate-warning = Alguien podría estar haciéndose pasar por este servidor. Conéctate solo si lo esperabas.
vpn-certificate-connect = Conectar de todos modos

vpn-field-password = Contraseña
vpn-field-certificate-password = Contraseña del certificado
vpn-field-proxy-password = Contraseña del proxy
vpn-field-pre-shared-key = Clave precompartida
vpn-field-group-password = Contraseña del grupo

## Battery notifications

battery-left = Queda un { $percent }.

battery-device-low-title = { $device }: batería baja
battery-device-very-low-title = { $device }: batería muy baja
battery-device-low-body = { $left } Cárgalo pronto.
battery-device-very-low-body = { $left } Cárgalo ya para que no se apague.

battery-device-mouse = Ratón
battery-device-keyboard = Teclado
battery-device-phone = Teléfono
battery-device-tablet = Tableta
battery-device-controller = Mando
battery-device-pen = Lápiz
battery-device-touchpad = Panel táctil
battery-device-headset = Auriculares con micrófono
battery-device-speaker = Altavoz
battery-device-headphones = Auriculares
battery-device-remote = Mando a distancia
battery-device-other = Dispositivo conectado

## Privacy indicator

privacy-indicator = En uso: { $things }
privacy-thing-camera = cámara
privacy-thing-microphone = micrófono
privacy-thing-screen = pantalla
privacy-thing-location = ubicación
privacy-thing-windows = ventanas

privacy-camera-unknown-app = Una aplicación está usando la cámara
privacy-stop-sharing = Dejar de compartir la pantalla
privacy-stop-recording = Detener grabación
privacy-turn-off-location = Desactivar servicios de ubicación
privacy-settings = Configuración de privacidad
privacy-camera = Cámara
privacy-microphone = Micrófono
privacy-microphone-muted = Micrófono silenciado
privacy-mute-microphone = Silenciar micrófono
privacy-unmute-microphone = Activar micrófono
privacy-close-app = Cerrar { $app }
privacy-unknown-app = Una aplicación
privacy-reported-app = «{ $name }» (nombre sin verificar)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } programa puede ver tus ventanas
   *[other] { $count } programas pueden ver tus ventanas
}
privacy-windows-using-programs = { $count ->
    [one] { $count } programa puede ver y usar tus ventanas
   *[other] { $count } programas pueden ver y usar tus ventanas
}
privacy-windows-stop = Retirar acceso

## Window access prompt

peek-see-request = ¿Permitir que un programa que has abierto vea tus ventanas?
peek-see-description = Podrá hacer capturas de cualquier ventana que tengas abierta.
peek-use-request = ¿Permitir que un programa que has abierto vea y use tus ventanas?
peek-use-description = Podrá ver cualquier ventana que tengas abierta, y hacer clic y escribir en ella como si fueras tú.
peek-deny = No permitir
peek-allow-once = Permitir una vez
peek-allow-until-quit = Permitir hasta que se cierre

## Window access errors

peek-error-declined-until-quit = La persona que usa este ordenador lo ha rechazado. El programa puede volver a pedirlo cuando se cierre.
peek-error-not-allowed = La persona que usa este ordenador no lo ha permitido
peek-error-sandboxed = Las aplicaciones en un espacio aislado no pueden ver ni usar otras ventanas
peek-error-unknown-caller = El programa que lo pide ha terminado o no se ha podido reconocer
peek-error-no-caller = El bus de sesión no ha indicado qué programa lo pide
peek-error-screen-busy = La pantalla está bloqueada o tiene abierto un aviso del sistema. Vuelve a intentarlo cuando desaparezca.
peek-error-input-held = Alguien está manteniendo pulsadas teclas o botones del ratón. Vuelve a intentarlo en un momento.
peek-error-input-dropped = Se ha detenido la entrada porque, cuando llegó, había otra cosa bajo el punto o con el foco del teclado
peek-error-not-in-front = No se ha podido traer la ventana al frente
peek-error-covered = Hay otra cosa encima de esa parte de la ventana
peek-error-outside = { $x }, { $y } está fuera de la imagen de la ventana, que mide { $width } × { $height }
peek-error-nothing-to-capture = La ventana no muestra nada que capturar
peek-error-window-picture-late = La imagen de la ventana no ha estado lista a tiempo
peek-error-screen-picture-late = La imagen de la pantalla no ha estado lista a tiempo
peek-error-no-window-id = Ninguna ventana tiene el id { $id }. peek list muestra las que están abiertas.
peek-error-no-window-for-handle = El programa iniciado como { $handle } no tiene ninguna ventana abierta
peek-error-ended-before-window = El programa ha terminado antes de abrir una ventana
peek-error-no-window-in-time = No se ha abierto ninguna ventana en { $duration }
peek-error-launch-not-started-by-peek = Solo se puede lanzar un programa que haya iniciado el propio peek run
peek-error-ended-while-starting = El programa ha terminado mientras se iniciaba
peek-error-launch-failed = systemd no ha podido iniciar { $program }
peek-error-unknown-handle = Nada de lo que has iniciado con peek run tiene el identificador { $handle }, o ya se ha cerrado
peek-error-unknown-key = { $key } no es una tecla que peek conozca
peek-error-unknown-modifier = { $modifier } no es un modificador. Usa ctrl, shift, alt o super.
peek-error-display-owner = Esta pantalla pertenece a otro programa
peek-error-display-run = Los programas de una pantalla oculta se inician con peek run
peek-error-display-handle = Esta pantalla se inició como { $handle }, no como { $requested }

## Quick settings tiles

auto-rotate-title = Girar automáticamente
dark-style-title = Modo oscuro
do-not-disturb-title = No molestar
night-light-title = Luz nocturna
airplane-mode-title = Modo avión

## Power mode

power-profile-title = Modo de energía
power-profile-header = Modo de energía
power-profile-open-menu = Abrir menú de modos de energía
power-profile-settings = Configuración de energía
power-profile-performance = Rendimiento
power-profile-balanced = Equilibrado
power-profile-power-saver = Ahorro de energía
power-profile-custom = Personalizado

## Keep awake

caffeine-title = Mantener activo
caffeine-open-menu = Abrir menú de Mantener activo
caffeine-until = Hasta las { $time }
caffeine-until-turned-off = Hasta que se desactive
caffeine-30-minutes = 30 minutos
caffeine-1-hour = 1 hora
caffeine-2-hours = 2 horas
caffeine-inhibit-reason = Mantenido activo desde Configuración rápida

## Brightness

brightness-title = Brillo
brightness-open-menu = Abrir menú de brillo

## Keyboard backlight

backlight-title = Retroiluminación del teclado
backlight-open-menu = Abrir menú de brillo del teclado
backlight-slider = Brillo del teclado
backlight-off = Desactivada
backlight-low = Baja
backlight-high = Alta

## Sound

volume-sound-settings = Configuración de sonido
volume-mute = Silenciar
volume-unmute = Activar sonido
volume-output-slider = Volumen
volume-output-title = Salida de sonido
volume-output-open-menu = Abrir menú de salida de sonido
volume-input-slider = Micrófono
volume-input-title = Entrada de sonido
volume-input-open-menu = Abrir menú de entrada de sonido

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Abrir menú de Bluetooth
bluetooth-settings = Configuración de Bluetooth
bluetooth-connect = Conectar
bluetooth-disconnect = Desconectar
bluetooth-connect-device = Conectar con { $deviceName }
bluetooth-disconnect-device = Desconectar { $deviceName }
bluetooth-no-devices = No hay dispositivos disponibles ni conectados
bluetooth-turn-on-hint = Activa Bluetooth para conectar dispositivos
bluetooth-connected-count = { $count ->
    [one] { $count } conectado
   *[other] { $count } conectados
}

## Network menus in quick settings

network-menu-unknown-network = <desconocida>
network-menu-connect = Conectar
network-menu-disconnect = Desconectar
network-menu-connect-to = Conectar a { $name }
network-menu-disconnect-from = Desconectar { $name }
network-menu-turn-off = Desactivar
network-menu-wifi-network = { $secure ->
    [yes] { $name }, segura, intensidad de la señal { $strength } %
   *[no] { $name }, no segura, intensidad de la señal { $strength } %
}
network-menu-hotspot = Punto de acceso de { $name }
network-menu-connected-count = { $count ->
    [one] { $count } conectada
   *[other] { $count } conectadas
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Abrir menú de VPN
network-menu-vpn-settings = Configuración de VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Abrir menú de Wi-Fi
network-menu-wifi-settings = Todas las redes
network-menu-wired = Conexiones por cable
network-menu-wired-open-menu = Abrir menú de conexiones por cable
network-menu-wired-settings = Configuración de red por cable
network-menu-tethers = Conexiones compartidas por Bluetooth
network-menu-tethers-open-menu = Abrir menú de conexiones compartidas por Bluetooth
network-menu-tether = Conexión compartida
network-menu-tether-settings = Configuración de Bluetooth
network-menu-mobile-connections = Conexiones móviles
network-menu-mobile-open-menu = Abrir menú de conexiones móviles
network-menu-mobile-settings = Configuración de banda ancha móvil
network-menu-mobile = Móvil
network-device-wired = Por cable
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Iniciar sesión en la red
network-menu-failed-title = Error de conexión
network-menu-failed-body = No se ha podido activar la conexión de red

## Location access dialog

location-dialog-title = Permitir acceso a la ubicación
location-dialog-description = La aplicación { $appName } quiere acceder a tu ubicación
location-dialog-info = Puedes cambiar el acceso a la ubicación en cualquier momento en la configuración de privacidad
location-dialog-deny = Denegar acceso
location-dialog-grant = Permitir acceso

## Thunderbolt notifications

thunderbolt-unknown-title = Dispositivo Thunderbolt desconocido
thunderbolt-unknown-body = Se ha conectado un dispositivo nuevo mientras no estabas. Desconéctalo y vuelve a conectarlo para empezar a usarlo.
thunderbolt-unauthorized-title = Dispositivo Thunderbolt no autorizado
thunderbolt-unauthorized-body = Se ha conectado un dispositivo nuevo que necesita la aprobación de un administrador
thunderbolt-error-title = Error de autorización de Thunderbolt
thunderbolt-error-body = No se ha podido autorizar el dispositivo Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Denegar
access-dialog-allow = Permitir

## Display change confirmation

display-change-title = ¿Mantener esta configuración?
display-change-countdown = { $seconds ->
    [one] Los cambios se desharán en { $seconds } segundo
   *[other] Los cambios se desharán en { $seconds } segundos
}
display-change-revert = Revertir
display-change-keep = Mantener cambios

## Drive connected notification

autorun-connected = «{ $driveName }» conectado
autorun-ready = El disco ya se puede usar
autorun-open-with = Abrir con { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Teclas lentas activadas
kbd-a11y-slow-keys-off = Teclas lentas desactivadas
kbd-a11y-slow-keys-description = Has mantenido pulsada la tecla Mayús durante 8 segundos. Es el atajo de Teclas lentas, que cambia cómo funciona el teclado.
kbd-a11y-sticky-keys-on = Teclas persistentes activadas
kbd-a11y-sticky-keys-off = Teclas persistentes desactivadas
kbd-a11y-sticky-keys-on-description = Has pulsado la tecla Mayús 5 veces seguidas. Es el atajo de Teclas persistentes, que cambia cómo funciona el teclado.
kbd-a11y-sticky-keys-off-description = Has pulsado dos teclas a la vez o la tecla Mayús 5 veces seguidas. Esto desactiva Teclas persistentes, que cambia cómo funciona el teclado.
kbd-a11y-leave-on = Dejar activadas
kbd-a11y-turn-on = Activar
kbd-a11y-turn-off = Desactivar
kbd-a11y-leave-off = Dejar desactivadas

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Elegir dispositivo de audio
audio-device-cancel = Cancelar
audio-device-sound-settings = Configuración de sonido
audio-device-headphones = Auriculares
audio-device-headset = Auriculares con micrófono
audio-device-microphone = Micrófono

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Permitir bloquear atajos
inhibit-shortcuts-app = La aplicación { $appName } quiere bloquear los atajos del sistema
inhibit-shortcuts-unknown-app = Una aplicación quiere bloquear los atajos del sistema
inhibit-shortcuts-titled-app = Una aplicación con la ventana «{ $title }» quiere bloquear los atajos del sistema
inhibit-shortcuts-restore = Puedes recuperar los atajos pulsando { $shortcut }
inhibit-shortcuts-deny = Denegar
inhibit-shortcuts-allow = Permitir

## Unlocking encrypted drives

mount-hidden-volume = Volumen oculto
mount-windows-system-volume = Volumen del sistema de Windows
mount-uses-keyfiles = Usa archivos de clave
mount-keyfiles-use-app = Para desbloquear un volumen que usa archivos de clave, usa la utilidad <i>{ $appName }</i>
mount-keyfiles-need-app = Para desbloquear un volumen que usa archivos de clave necesitas una utilidad externa como <i>Discos</i>
mount-pim-number = Número PIM
mount-pim-invalid = El PIM debe ser un número o quedar vacío
mount-password = Contraseña
mount-remember-password = Recordar contraseña
mount-cancel = Cancelar
mount-unlock = Desbloquear
mount-open-app = Abrir { $appName }
mount-wrong-password = No ha funcionado. Vuelve a intentarlo.
mount-unlock-failed = No se ha podido desbloquear el volumen
mount-pim-unsupported = La versión de udisks instalada no admite el ajuste PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Se necesita autenticación
network-agent-wifi-rejected = La contraseña guardada de «{ $networkName }» no ha funcionado. Vuelve a escribirla.
network-agent-wifi-secrets = Se necesitan contraseñas o claves de cifrado para acceder a la red inalámbrica «{ $networkName }»
network-agent-wps-hint = También puedes conectarte pulsando el botón «WPS» del router
network-agent-wired-title = Autenticación 802.1X por cable
network-agent-dsl-title = Autenticación DSL
network-agent-pin-title = Se necesita el código PIN
network-agent-pin-body = El dispositivo de banda ancha móvil necesita el código PIN
network-agent-vpn-title = Contraseña de VPN
network-agent-password-required = Se necesita una contraseña para conectarse a «{ $networkName }»
network-agent-connect = Conectar
network-agent-cancel = Cancelar
network-agent-password = Contraseña
network-agent-username = Nombre de usuario
network-agent-key = Clave
network-agent-private-key-password = Contraseña de la clave privada
network-agent-identity = Identidad
network-agent-service = Servicio
network-agent-network-name = Nombre de la red
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Captura de pantalla
screenshot-area = Seleccionar área
screenshot-screen = Seleccionar pantalla
screenshot-window = Seleccionar ventana
screenshot-take = Hacer captura de pantalla
screenshot-record = Grabar pantalla
screenshot-show-pointer = Mostrar puntero
screenshot-capture = Capturar
screenshot-close = Cerrar
screenshot-screencasts-folder = Grabaciones de pantalla
screenshot-screencast-file = Grabación de pantalla { $date } { $time }
screenshot-screenshots-folder = Capturas de pantalla
screenshot-file = Captura de pantalla { $timestamp }
screenshot-screencast-recorded = Grabación de pantalla guardada
screenshot-screencast-start-failed = No se ha podido iniciar la grabación de pantalla
screenshot-screencast-out-of-space = No se ha podido grabar la pantalla: no queda espacio en el disco
screenshot-screencast-try-again = No se ha podido grabar la pantalla. Vuelve a intentarlo.
screenshot-screencast-failed = No se ha podido grabar la pantalla
screenshot-screencast-view = Haz clic aquí para ver el vídeo
screenshot-show-in-rover = Mostrar en Rover
screenshot-captured = Captura de pantalla hecha
screenshot-captured-body = Puedes pegar la imagen desde el portapapeles

## System updates
updates-available-title = Hay actualizaciones del sistema disponibles
updates-available-body = Abre Configuración para descargarlas e instalarlas.
updates-ready-title = Las actualizaciones están listas para instalarse
updates-ready-body = Reinicia cuando te venga bien para instalarlas.
