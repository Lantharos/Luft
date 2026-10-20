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

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = «{ $appName }» no responde
close-dialog-description = Puedes esperar un poco a que continúe o forzar el cierre de la aplicación
close-dialog-force-quit = Forzar cierre
close-dialog-wait = Esperar

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Duplicar
switch-monitor-join = Extender
switch-monitor-external-only = Solo externas
switch-monitor-built-in-only = Solo integrada

## Sign-in prompt

auth-prompt-password = Contraseña
auth-prompt-username = Nombre de usuario
auth-prompt-back = Atrás
auth-prompt-submit = Enviar
auth-prompt-wrong-password = La contraseña no es correcta
auth-prompt-failed = No ha funcionado. Vuelve a intentarlo.
fingerprint-not-recognized = Huella no reconocida

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
inhibit-shortcuts-restore = Puedes recuperar los atajos pulsando { $shortcut }
inhibit-shortcuts-deny = Denegar
inhibit-shortcuts-allow = Permitir

## Administrator authentication

polkit-title = Se necesita autenticación
polkit-administrator = Administrador
polkit-password = Contraseña
polkit-cancel = Cancelar
polkit-authenticate = Autenticar
polkit-failed = No ha funcionado. Vuelve a intentarlo.

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

## Log out, power off and restart dialog

end-session-log-out-user = Cerrar la sesión de { $userName }
end-session-log-out-title = Cerrar sesión
end-session-log-out-user-countdown = { $seconds ->
    [one] La sesión de { $userName } se cerrará automáticamente en { $seconds } segundo
   *[other] La sesión de { $userName } se cerrará automáticamente en { $seconds } segundos
}
end-session-log-out-countdown = { $seconds ->
    [one] Tu sesión se cerrará automáticamente en { $seconds } segundo
   *[other] Tu sesión se cerrará automáticamente en { $seconds } segundos
}
end-session-log-out-button = Cerrar sesión
end-session-power-off-title = Apagar
end-session-power-off-updates-title = Instalar actualizaciones y apagar
end-session-power-off-countdown = { $seconds ->
    [one] El ordenador se apagará automáticamente en { $seconds } segundo
   *[other] El ordenador se apagará automáticamente en { $seconds } segundos
}
end-session-power-off-button = Apagar
end-session-restart-title = Reiniciar
end-session-restart-updates-title = Instalar actualizaciones y reiniciar
end-session-restart-countdown = { $seconds ->
    [one] El ordenador se reiniciará automáticamente en { $seconds } segundo
   *[other] El ordenador se reiniciará automáticamente en { $seconds } segundos
}
end-session-restart-button = Reiniciar
end-session-update-restart-title = Reiniciar e instalar actualizaciones
end-session-update-restart-countdown = { $seconds ->
    [one] El ordenador se reiniciará e instalará las actualizaciones automáticamente en { $seconds } segundo
   *[other] El ordenador se reiniciará e instalará las actualizaciones automáticamente en { $seconds } segundos
}
end-session-update-restart-button = Reiniciar e instalar
end-session-install-updates = Instalar las actualizaciones pendientes
end-session-install-version = Instalar la versión { $version }
end-session-low-battery = Batería baja: conecta el cargador antes de instalar actualizaciones
end-session-busy-apps = Algunas aplicaciones están ocupadas o tienen trabajo sin guardar
end-session-other-users = Hay otros usuarios con la sesión iniciada
end-session-cancel = Cancelar
end-session-boot-options = Opciones de arranque
end-session-remote-user = { $userName } (remoto)
end-session-console-user = { $userName } (consola)

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

## Lock screen clock

lock-clock-swipe-up = Desliza hacia arriba
lock-clock-click-or-press = Haz clic o pulsa una tecla

## Notification times

date-just-now = Ahora mismo

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Ventanas
ctrl-alt-tab-panel = Barra de tareas
ctrl-alt-tab-unlock = Ventana de desbloqueo

## System notifications

messages-system-source = Sistema
unsafe-mode-title = El sistema está en modo no seguro
unsafe-mode-body = Las aplicaciones tienen ahora acceso sin restricciones
unsafe-mode-undo = Deshacer
privileged-user-title = Sesión iniciada como usuario con privilegios
privileged-user-body = Por seguridad, no conviene usar una sesión como usuario con privilegios. Si puedes, inicia sesión como usuario normal.

## On-screen keyboard

osk-keyboard-settings = Configuración del teclado
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel necesita bloquear la pantalla

## Notifications

messages-unknown-app = Aplicación desconocida
messages-reply = Responder
messages-reply-placeholder = Escribe una respuesta
messages-reply-send = Enviar

## Media player controls

mpris-unknown-artist = Artista desconocido
mpris-unknown-title = Título desconocido

## Starting programs

spawn-failed = No se ha podido ejecutar «{ $command }»:

## Text field context menu

entry-menu-copy = Copiar
entry-menu-paste = Pegar
entry-menu-show-text = Mostrar texto
entry-menu-hide-text = Ocultar texto
entry-caps-lock-on = Bloq Mayús está activado

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Hacer captura de pantalla
title-bar-menu-hide = Ocultar
title-bar-menu-restore = Restaurar
title-bar-menu-maximize = Maximizar
title-bar-menu-move = Mover
title-bar-menu-resize = Cambiar tamaño
title-bar-menu-always-on-top = Siempre visible
title-bar-menu-always-on-visible-workspace = En todas las áreas de trabajo
title-bar-menu-workspace-left = Mover al área de trabajo de la izquierda
title-bar-menu-workspace-right = Mover al área de trabajo de la derecha
title-bar-menu-workspace-up = Mover al área de trabajo de arriba
title-bar-menu-workspace-down = Mover al área de trabajo de abajo
title-bar-menu-monitor-up = Mover a la pantalla de arriba
title-bar-menu-monitor-down = Mover a la pantalla de abajo
title-bar-menu-monitor-left = Mover a la pantalla de la izquierda
title-bar-menu-monitor-right = Mover a la pantalla de la derecha
title-bar-menu-close = Cerrar

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
