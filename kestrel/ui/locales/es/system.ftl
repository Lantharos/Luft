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
battery-left-with-time = Queda un { $percent }, aproximadamente { $duration }.
battery-low-title = Batería baja
battery-very-low-title = Batería muy baja
battery-almost-empty-title = Batería casi agotada
battery-ups-low-title = Batería del SAI baja
battery-ups-very-low-title = Batería del SAI muy baja
battery-ups-almost-empty-title = Batería del SAI casi agotada
battery-very-low-body = { $left } Conecta el cargador pronto.
battery-almost-empty-body = { $left } Conecta el cargador ya para no perder el trabajo sin guardar.

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
privacy-windows-using = Usa tus ventanas
privacy-windows-seeing = Ve tus ventanas
privacy-windows-stop = Retirar acceso

## Window access prompt

peek-see-title = { $app } quiere ver tus ventanas
peek-see-description = Podrá hacer capturas de cualquier ventana que tengas abierta.
peek-use-title = { $app } quiere ver y usar tus ventanas
peek-use-description = Podrá ver cualquier ventana que tengas abierta, y hacer clic y escribir en ella como si fueras tú.
peek-deny = No permitir
peek-allow-once = Permitir una vez
peek-allow-until-quit = Permitir hasta que se cierre

## Window access errors

peek-error-declined = La persona que usa este ordenador lo ha rechazado. { $app } puede volver a pedirlo cuando se cierre.
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
