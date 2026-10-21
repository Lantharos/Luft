## Displays

settings-display-mirror = Duplicar pantallas
settings-display-mirror-description = Muestra la misma imagen en todas las pantallas
settings-display-mirrored = Pantallas duplicadas
settings-display-display = Pantalla
settings-display-apply-failed = Esta configuración no ha funcionado. Prueba con otra.
settings-display-reset = Restablecer
settings-display-apply = Aplicar
settings-display-arrangement-main = { $name }, pantalla principal
settings-display-use = Usar esta pantalla
settings-display-main = Pantalla principal
settings-display-main-description = Aquí aparecen la barra de tareas y las ventanas nuevas
settings-display-resolution-title = Resolución
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Frecuencia de actualización
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Frecuencia de actualización variable
settings-display-variable-refresh-description = Permite que la pantalla siga la velocidad de fotogramas de los juegos a pantalla completa para un movimiento más fluido
settings-display-variable-refresh-off = Desactivada
settings-display-variable-refresh-games = En juegos
settings-display-variable-refresh-fullscreen = En todas las aplicaciones a pantalla completa
settings-display-scale = Escala
settings-display-scale-description = Agranda o reduce el texto, las aplicaciones y todo lo demás
settings-display-orientation = Orientación
settings-display-orientation-landscape = Horizontal
settings-display-orientation-portrait-right = Vertical a la derecha
settings-display-orientation-portrait-left = Vertical a la izquierda
settings-display-orientation-landscape-flipped = Horizontal, invertida

## Display brightness

settings-display-brightness = Brillo
settings-display-brightness-label = Brillo de { $name }
settings-display-brightness-unsupported = Activa DDC/CI en el menú de la pantalla para cambiarlo aquí
settings-display-brightness-unresponsive = No responde ahora mismo; se volverá a intentar en breve
settings-display-brightness-external = Pantallas externas
settings-display-brightness-missing-tool = Instala ddcutil para cambiar su brillo aquí
settings-display-brightness-needs-restart = Reinicia para terminar de configurar su brillo
settings-display-brightness-no-access = Cierra sesión y vuelve a iniciarla para cambiar su brillo aquí

## Night light

settings-display-night-light = Luz nocturna
settings-display-night-light-description = Colores más cálidos por la noche, más agradables para la vista
settings-display-night-light-schedule = Programación
settings-display-night-light-automatic = Del atardecer al amanecer
settings-display-night-light-custom = Personalizada
settings-display-night-light-from = Se activa
settings-display-night-light-to = Se desactiva
settings-display-night-light-warmth = Calidez

## Sound

settings-sound-output = Salida
settings-sound-input = Entrada
settings-sound-device = Dispositivo
settings-sound-output-device = Dispositivo de salida
settings-sound-input-device = Dispositivo de entrada
settings-sound-connection = Conexión
settings-sound-output-connection = Conexión de salida
settings-sound-input-connection = Conexión de entrada
settings-sound-volume = Volumen
settings-sound-mute = Silenciar { $name }
settings-sound-unmute = Activar sonido de { $name }
settings-sound-balance = Balance
settings-sound-balance-center = Centro
settings-sound-balance-left = { $share } a la izquierda
settings-sound-balance-right = { $share } a la derecha
settings-sound-louder = Permitir volumen por encima del 100 %
settings-sound-louder-description = El sonido puede distorsionarse a volúmenes altos
settings-sound-input-level = Nivel de entrada
settings-sound-apps = Volumen de las aplicaciones
settings-sound-apps-playing = { $count ->
    [one] { $count } aplicación está reproduciendo sonido
   *[other] { $count } aplicaciones están reproduciendo sonido
}
settings-sound-app-output = Reproducir { $app } en
settings-sound-profiles = Perfiles de dispositivo
settings-sound-profiles-row-description = Elige cómo se usa cada dispositivo de sonido
settings-sound-profiles-description = Cómo se usa cada dispositivo de sonido, por ejemplo en estéreo o envolvente
settings-sound-profile-label = Cómo se usa { $device }
settings-sound-profile-off = Desactivado

## System sounds

settings-sound-system = Sonidos del sistema
settings-sound-system-description = Sonidos de notificaciones, dispositivos y otros eventos
settings-sound-system-volume = Volumen de los sonidos del sistema
settings-sound-kind-notifications = Notificaciones
    .description = Silenciados con No molestar, en juegos y al compartir pantalla
    .preview = Reproducir el sonido de notificación
settings-sound-kind-devices = Dispositivos y carga
    .description = Al conectar un dispositivo o un cargador, y con batería baja
    .preview = Reproducir el sonido de dispositivo
settings-sound-kind-volume = Cambios de volumen
    .description = Un clic al cambiar el volumen
    .preview = Reproducir el clic del volumen
settings-sound-kind-screenshots = Capturas de pantalla
    .description = Un obturador al guardar una captura de pantalla
    .preview = Reproducir el obturador
settings-sound-kind-recording = Grabación
    .description = Al empezar y terminar una grabación de pantalla, la cámara o el dictado
    .preview = Reproducir el sonido de grabación
settings-sound-kind-sign-in = Sonido de inicio de sesión
    .description = Cuando aparece tu escritorio
    .preview = Reproducir el sonido de inicio de sesión
settings-sound-kind-keyboard = Pulsaciones de teclado
    .description = Cada tecla del teclado en pantalla
    .preview = Reproducir una pulsación

## Power and battery

settings-power-battery = Batería
settings-power-charging = Cargando
settings-power-charging-at = Cargando a { $power }
settings-power-charging-until-full = Cargando, completa en { $time }
settings-power-charging-at-until-full = Cargando a { $power }, completa en { $time }
settings-power-on-battery = Con batería
settings-power-on-battery-using = Con batería, consumo de { $power }
settings-power-time-left = Quedan unos { $time }
settings-power-time-left-using = Quedan unos { $time }, consumo de { $power }
settings-power-full = Carga completa
settings-power-empty = Vacía
settings-power-not-charging = Enchufado, no se está cargando
settings-power-health = Estado de la batería
settings-power-capacity = { $full } de { $design } cuando era nueva
settings-power-cycles = { $count ->
    [one] { $cycles } ciclo de carga
   *[other] { $cycles } ciclos de carga
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Mostrar porcentaje
settings-power-show-percentage-description = Muestra el nivel de batería dentro del icono de la batería

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = menos de un minuto
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minuto
   *[other] { $minutes } minutos
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } hora
   *[other] { $hours } horas
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } hora
   *[other] { $hours } horas
} { $minutes ->
    [one] { $minutes } minuto
   *[other] { $minutes } minutos
}
settings-power-never = Nunca

## Charge limit

settings-power-limit = Limitar la carga
settings-power-limit-failed = No se ha podido cambiar el límite. Vuelve a intentarlo.
settings-power-limit-elsewhere-off = Otra aplicación lo ha desactivado, así que la batería se carga por completo
settings-power-limit-elsewhere-changed = Otra aplicación ha cambiado el límite a { $level }
settings-power-limit-elsewhere-on = Otra aplicación detiene la carga al { $level }
settings-power-limit-automatic = El ordenador decide cuándo detener la carga
settings-power-limit-stops-at = Detiene la carga al { $level }
settings-power-limit-description = Detiene la carga antes de tiempo para alargar la vida de la batería
settings-power-limit-description-at = Se detiene al { $level } para alargar la vida de la batería
settings-power-limit-applied = La carga se detiene al { $level }
settings-power-limit-applied-description = Establecido por otra aplicación de este ordenador

## Battery-powered devices

settings-power-devices = Dispositivos
settings-power-device-mouse = Ratón
settings-power-device-keyboard = Teclado
settings-power-device-headphones = Auriculares
settings-power-device-speaker = Altavoz
settings-power-device-controller = Mando
settings-power-device-phone = Teléfono
settings-power-device-tablet = Tableta
settings-power-device-pen = Lápiz
settings-power-device-touchpad = Panel táctil
settings-power-device-other = Dispositivo

## Power mode

settings-power-mode = Modo de energía
settings-power-mode-row = Modo
settings-power-profile-saver = Ahorro de energía
    .description = Más lento, y consume menos
settings-power-profile-balanced = Equilibrado
    .description = Rendimiento y consumo estándar
settings-power-profile-performance = Rendimiento
    .description = Más rápido, y consume más
settings-power-limited = El rendimiento está limitado en este momento
settings-power-limited-lap = El rendimiento está limitado porque el ordenador está sobre tus piernas
settings-power-limited-hot = El rendimiento está limitado porque el ordenador está demasiado caliente
settings-power-limited-lap-hot = El rendimiento está limitado porque el ordenador está sobre tus piernas y demasiado caliente
settings-power-saver-low-battery = Ahorro de energía con batería baja
settings-power-saver-low-battery-description = Cambia a Ahorro de energía cuando queda poca batería

## Keyboard backlight

settings-power-keyboard = Teclado
settings-power-backlight = Retroiluminación del teclado
settings-power-backlight-off = Desactivada
settings-power-backlight-low = Baja
settings-power-backlight-medium = Media
settings-power-backlight-high = Alta

## Screen and sleep

settings-power-screen = Pantalla
settings-power-screen-off = Apagar la pantalla tras
settings-power-screen-off-description = Cuando no has usado el ordenador durante un rato
settings-power-dim = Atenuar si está inactivo
settings-power-dim-description = Baja el brillo poco antes de que se apague la pantalla
settings-power-sleep = Suspensión
settings-power-suspend-plugged-in = Suspender si está enchufado
settings-power-suspend-inactive = Suspender si está inactivo
settings-power-suspend-description = Suspende el ordenador tras un rato sin usarlo
settings-power-suspend-battery = Suspender con batería
settings-power-button = Botón de encendido
settings-power-button-suspend = Suspender
settings-power-button-hibernate = Hibernar
settings-power-button-ask = Preguntar qué hacer
settings-power-button-nothing = No hacer nada
settings-power-long-sleep = Apagar tras una suspensión larga
settings-power-long-sleep-description = En vez de dejar que la batería se agote mientras está suspendido, el ordenador se apaga cuando la batería baja o tras una suspensión larga con batería. Las ventanas abiertas no se conservan.
settings-power-long-sleep-failed = No se ha podido cambiar. Vuelve a intentarlo.
settings-power-long-sleep-after = Apagar tras
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } hora
   *[other] { $hours } horas
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } día
   *[other] { $days } días
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } semana
   *[other] { $weeks } semanas
}

## Keyboard

settings-keyboard-sources = Fuentes de entrada
settings-keyboard-sources-description = La primera se usa de forma predeterminada. Cambia entre ellas mientras escribes.
settings-keyboard-source-edit = Editar en Keys
settings-keyboard-source-up = Subir
settings-keyboard-source-down = Bajar
settings-keyboard-source-remove = Quitar
settings-keyboard-add-source-button = Añadir fuente de entrada
settings-keyboard-own = Tus propias distribuciones y métodos de entrada
settings-keyboard-own-layout = Crear una distribución
settings-keyboard-own-layout-description = Parte de una distribución y cambia lo que escriben sus teclas
settings-keyboard-own-method = Crear un método de entrada
settings-keyboard-own-method-description = Convierte lo que escribes en acentos, otros alfabetos o palabras entre las que elegir
settings-keyboard-own-open = Abrir Keys
settings-keyboard-own-open-description = Edita las distribuciones y los métodos de entrada que has creado
settings-keyboard-switch-source = Cambiar fuente de entrada
settings-keyboard-add-source = Añadir una fuente de entrada
settings-keyboard-add-source-description = Elige la distribución de teclado o el método de entrada con el que quieres escribir.
settings-keyboard-add-source-search = Buscar idiomas, distribuciones y métodos de entrada
settings-keyboard-input-method = Método de entrada
settings-keyboard-add-source-no-match = Nada coincide con «{ $query }»
settings-keyboard-cancel = Cancelar
settings-keyboard-add = Añadir
settings-keyboard-typing = Escritura
settings-keyboard-repeat = Repetición de teclas
settings-keyboard-repeat-description = Al mantener pulsada una tecla, se escribe una y otra vez
settings-keyboard-repeat-delay = Retardo antes de repetir
settings-keyboard-repeat-delay-shorter = Más corto
settings-keyboard-repeat-delay-longer = Más largo
settings-keyboard-repeat-speed = Velocidad de repetición
settings-keyboard-repeat-speed-slower = Más lenta
settings-keyboard-repeat-speed-faster = Más rápida
settings-keyboard-caps-lock = Tecla Bloq Mayús
settings-keyboard-caps-lock-description = Qué ocurre al pulsarla
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Intercambiar con Esc
settings-keyboard-caps-lock-nothing = Nada
settings-keyboard-caps-lock-custom = Personalizado
settings-keyboard-lock-notices = Mostrar Bloq Mayús y Bloq Num
settings-keyboard-lock-notices-description = Lo indica brevemente en pantalla al activar o desactivar cualquiera de los dos
settings-keyboard-dictation-on = Activado
settings-keyboard-dictation-off = Desactivado
settings-keyboard-shortcuts-description = Consulta y cambia los atajos, o añade los tuyos

## Copilot key

settings-keyboard-copilot = Tecla Copilot
settings-keyboard-copilot-press = Pulsación
settings-keyboard-copilot-press-description = Lo que hace una pulsación breve de la tecla
settings-keyboard-copilot-open-start = Abrir Inicio
settings-keyboard-copilot-open-app = Abrir una aplicación
settings-keyboard-copilot-nothing = Nada
settings-keyboard-copilot-app = Aplicación
settings-keyboard-copilot-no-app = Aún no se ha elegido ninguna aplicación
settings-keyboard-copilot-change = Cambiar
settings-keyboard-copilot-choose = Elegir
settings-keyboard-copilot-hold = Mantener pulsada para dictar
settings-keyboard-copilot-hold-description = Mantén pulsada la tecla y habla para escribir lo que dices
settings-keyboard-copilot-hold-off = Funciona cuando el dictado está activado
settings-keyboard-copilot-choose-app = Elegir una aplicación
settings-keyboard-copilot-choose-app-description = Se abrirá al pulsar la tecla Copilot.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Mayús
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Impr Pant
settings-keys-page-up = Re Pág
settings-keys-page-down = Av Pág
settings-keys-home = Inicio
settings-keys-end = Fin
settings-keys-insert = Insert
settings-keys-delete = Supr
settings-keys-tab = Tab
settings-keys-space = Espacio
settings-keys-enter = Intro
settings-keys-backspace = Retroceso
settings-keys-escape = Esc
settings-keys-pause = Pausa
settings-keys-scroll-lock = Bloq Despl
settings-keys-caps-lock = Bloq Mayús
settings-keys-menu = Menú
settings-keys-keypad = { $key } del teclado numérico
settings-keys-volume-up = Subir volumen
settings-keys-volume-down = Bajar volumen
settings-keys-mute = Silenciar
settings-keys-microphone-mute = Silenciar micrófono
settings-keys-play = Reproducir
settings-keys-media-pause = Pausa
settings-keys-stop = Detener
settings-keys-next-track = Pista siguiente
settings-keys-previous-track = Pista anterior
settings-keys-brightness-up = Subir brillo
settings-keys-brightness-down = Bajar brillo
settings-keys-browser = Navegador
settings-keys-home-page = Página de inicio
settings-keys-search = Buscar
settings-keys-mail = Correo
settings-keys-calculator = Calculadora
settings-keys-files = Archivos
settings-keys-eject = Expulsar
settings-keys-power = Encendido
settings-keys-lock = Bloquear

## Keyboard shortcuts

settings-shortcuts-title = Atajos de teclado
settings-shortcuts-search = Buscar atajos
settings-shortcuts-category-system = Sistema
settings-shortcuts-category-windows = Ventanas
settings-shortcuts-category-tiling = Mosaico
settings-shortcuts-category-workspaces = Áreas de trabajo
settings-shortcuts-category-screenshots = Capturas de pantalla
settings-shortcuts-category-media = Multimedia
settings-shortcuts-reset = Restablecer valores predeterminados
settings-shortcuts-apps = Atajos de aplicaciones
settings-shortcuts-apps-description = Los que han pedido las aplicaciones, que funcionan aunque la aplicación no esté en primer plano
settings-shortcuts-no-match = Ningún atajo coincide con «{ $query }»
settings-shortcuts-change = Cambiar el atajo de { $name }
settings-shortcuts-or = o
settings-shortcuts-not-set = Sin asignar
settings-shortcuts-press-keys = Pulsa las teclas que quieras
settings-shortcuts-needs-modifier = Añade Ctrl, Alt o Super para que el atajo no interfiera al escribir.
settings-shortcuts-record-description = Pulsa el nuevo atajo. Retroceso lo desactiva y Esc cancela.
settings-shortcuts-record-taken = Este atajo ya se usa para «{ $name }». Si lo reemplazas, se desactivará allí.
settings-shortcuts-try-another = Probar otro
settings-shortcuts-replace = Reemplazar
settings-shortcuts-cancel = Cancelar
settings-shortcuts-custom = Atajos personalizados
settings-shortcuts-custom-description = Ejecuta un comando o abre una aplicación con una combinación de teclas
settings-shortcuts-untitled = Sin nombre
settings-shortcuts-add = Añadir atajo
settings-shortcuts-edit = Editar atajo
settings-shortcuts-custom-name = Nombre
settings-shortcuts-custom-command = Comando
settings-shortcuts-custom-shortcut = Atajo
settings-shortcuts-custom-taken = Ya se usa para «{ $name }». Si lo guardas, se desactivará allí.
settings-shortcuts-remove = Quitar
settings-shortcuts-save = Guardar
settings-shortcuts-add-button = Añadir

## Dictation

settings-dictation-title = Dictado
settings-dictation-description = Pulsa y mantén { $keys } mientras hablas para escribir lo que dices, en cualquier aplicación. Suelta para terminar o pulsa Esc para cancelar. Todo ocurre en este ordenador: tu voz nunca sale de él y no se guarda.
settings-dictation-description-no-shortcut = Elige un atajo abajo para dictar. Todo ocurre en este ordenador: tu voz nunca sale de él y no se guarda.
settings-dictation-not-installed = El dictado no está instalado en este ordenador
settings-dictation-hold = Pulsa y mantén { $keys } para dictar
settings-dictation-needs-shortcut = Desactivado hasta que tenga un atajo
settings-dictation-copilot-key = la tecla Copilot
settings-dictation-shortcut = Atajo
settings-dictation-shortcut-description = Mantenlo pulsado para hablar, o púlsalo para que escuche hasta que lo vuelvas a pulsar o dejes de hablar
settings-dictation-shortcut-own = Mi propio atajo
settings-dictation-shortcut-another = Otro atajo…
settings-dictation-shortcut-off = Desactivado
settings-dictation-keys = Teclas
settings-dictation-change = Cambiar
settings-dictation-language = Idioma
settings-dictation-language-automatic = Automático
settings-dictation-language-automatic-current = Automático ({ $language })
settings-dictation-language-description = Automático sigue la distribución de teclado con la que escribes
settings-dictation-language-unavailable = El idioma { $language } no está disponible en este ordenador
settings-dictation-engine = Reconocedor de voz
settings-dictation-engine-automatic = Automático
settings-dictation-engine-description = { $engine } reconoce el idioma { $language }
settings-dictation-engine-graphics-card = { $engine } reconoce el idioma { $language } en la tarjeta gráfica
settings-dictation-models = Modelos de voz
settings-dictation-models-description = Los modelos se descargan una vez y se guardan en este ordenador.
settings-dictation-credits = Créditos
settings-dictation-credit = { $credit }. Con licencia { $licence }.
settings-dictation-learn-more = Más información

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = No se ha podido descargar: { $reason }
settings-dictation-model-downloading = { $received } de { $total }
settings-dictation-model-installed = { $size } en este ordenador
settings-dictation-model-partial = { $received } de { $total } descargados
settings-dictation-model-size = { $size } por descargar
settings-dictation-model-retry = Reintentar
settings-dictation-model-cancel = Cancelar
settings-dictation-model-resume = Reanudar
settings-dictation-model-download = Descargar
settings-dictation-model-remove = Quitar

## Mouse and touchpad

settings-mouse-mouse = Ratón
settings-mouse-primary-button = Botón principal
settings-mouse-primary-button-description = El botón con el que haces clic para seleccionar
settings-mouse-primary-button-left = Izquierdo
settings-mouse-primary-button-right = Derecho
settings-mouse-speed = Velocidad del puntero
settings-mouse-slower = Más lenta
settings-mouse-faster = Más rápida
settings-mouse-acceleration = Aceleración del ratón
settings-mouse-acceleration-description = El puntero recorre más distancia cuando mueves el ratón rápido
settings-mouse-natural-scrolling = Desplazamiento natural
settings-mouse-natural-scrolling-description = Al desplazarte se mueve el contenido en lugar de la vista
settings-mouse-touchpad = Panel táctil
settings-mouse-touchpad-speed = Velocidad del puntero del panel táctil
settings-mouse-touchpad-scroll-speed = Velocidad de desplazamiento
settings-mouse-touchpad-scroll-speed-label = Velocidad de desplazamiento del panel táctil
settings-mouse-touchpad-tap = Tocar para hacer clic
settings-mouse-touchpad-tap-description = Toca el panel táctil en lugar de presionarlo
settings-mouse-touchpad-natural-scrolling = Desplazamiento natural del panel táctil
settings-mouse-touchpad-natural-scrolling-description = El contenido se mueve en la misma dirección que los dedos
settings-mouse-touchpad-scroll-with = Desplazarse con
settings-mouse-touchpad-two-fingers = Dos dedos
settings-mouse-touchpad-scroll-edge = Borde
settings-mouse-touchpad-secondary-click = Clic secundario
settings-mouse-touchpad-secondary-click-description = Cómo hacer clic derecho sin un botón aparte
settings-mouse-touchpad-click-corner = Esquina
settings-mouse-touchpad-disable-typing = Desactivar al escribir
settings-mouse-touchpad-disable-typing-description = Para que el puntero no salte mientras escribes
