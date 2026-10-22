## Buttons used across steps

setup-continue = Continuar
setup-back = Atrás
setup-cancel = Cancelar
setup-not-now = Ahora no
setup-try-again = Reintentar
setup-restart = Reiniciar
setup-restart-now = Reiniciar ahora
setup-restart-later = Reiniciar más tarde
setup-saving = Guardando…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Instalando Luft
setup-installing-progress = Instalando, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Buscar
setup-picker-no-match = No hay coincidencias

## Welcome step: language, keyboard and time zone

setup-region-title = Te damos la bienvenida a Luft
setup-region-language = Idioma
setup-region-keyboard = Teclado
setup-region-time-zone = Zona horaria
setup-region-intro = Vamos a prepararlo todo. Elige tu idioma, tu teclado y tu zona horaria.
setup-region-intro-guessed-computer = Vamos a prepararlo todo. Hemos deducido estos datos a partir de tu ordenador, así que cambia lo que no sea correcto.
setup-region-intro-guessed = Vamos a prepararlo todo. Hemos deducido { $guesses }, así que cambia lo que no sea correcto.
setup-region-guess-from-computer = tu { $fields } a partir del ordenador
setup-region-guess-from-network = tu { $fields } a partir de la red
setup-region-field-language = idioma
setup-region-field-keyboard = teclado
setup-region-field-time-zone = zona horaria

## Where Luft goes

setup-destination-choose-title = ¿Dónde quieres instalar Luft?
setup-destination-choose-description = Elige cómo encaja Luft en este ordenador. No se cambia nada hasta que lo confirmes.
setup-destination-alongside-title = Hacer sitio junto a Windows
setup-destination-alongside-description = Windows se reduce para dejar espacio a Luft. Tus archivos de Windows se quedan como están.
setup-destination-whole-title = Elegir un disco
setup-destination-whole-description = Luft ocupa el disco entero. Se borra todo lo que contiene.
setup-destination-custom-title = Elegir el espacio para Luft
setup-destination-custom-description = Usa Discos para organizar tus discos a tu manera.
setup-destination-replace-title = Sustituir { $system }
setup-destination-replace-description = Luft ocupa su lugar y conserva lo que es tuyo.
setup-destination-meet-title = Junto a Windows
setup-destination-meet-description = Meet Luft ya ha hecho este sitio, así que Windows se queda tal como está.
setup-destination-meet-drive-title = En { $drive }
setup-destination-meet-drive-description = Meet Luft ya ha hecho este sitio en otro disco, y Luft arranca desde ahí con sus propios archivos de arranque.
setup-destination-looking = Examinando tus discos…

setup-destination-meet-choice = Junto a Windows
setup-destination-meet-choice-description = Usar los { $size } que Meet Luft ha preparado junto a Windows.
setup-destination-meet-drive-choice = En { $drive }
setup-destination-meet-drive-choice-description = Usar los { $size } que Meet Luft ha preparado en { $drive }.
setup-destination-alongside-choice = Junto a { $windows }
setup-destination-alongside-choice-description = Conservar Windows y sus archivos, y dar a Luft parte de su disco.
setup-destination-replace-choice = Sustituir { $system }
setup-destination-replace-choice-description = Conservar tus archivos, tu cuenta y tus ajustes, y que Luft ocupe su lugar.
setup-destination-whole-choice = Usar un disco entero
setup-destination-whole-choice-description = Borrar un disco y dárselo entero a Luft.
setup-destination-try-choice = Solo probar Luft
setup-destination-try-choice-description = Echa un vistazo primero. No se instala nada y tus discos no se tocan.
setup-destination-custom-choice = Personalizado
setup-destination-custom-choice-description = Organizar tú mismo las particiones en Discos.

setup-destination-more-options = Más opciones
setup-destination-starting = Iniciando…
setup-destination-replace = Sustituir
setup-destination-install = Instalar Luft

## Confirming where Luft goes

setup-confirm-replace-title = ¿Sustituir { $system }?
setup-confirm-erase-title = ¿Borrar { $drive }?
setup-confirm-shrink-title = ¿Reducir Windows a { $size }?
setup-confirm-meet-title = ¿Instalar Luft junto a Windows?
setup-confirm-meet-drive-title = ¿Instalar Luft en { $drive }?
setup-confirm-free-title = ¿Instalar Luft en el espacio libre?
setup-confirm-replace-keep-old = Luft empieza a copiarse en seguida. El sistema anterior ya no arrancará, y sus archivos se conservan hasta que los quites.
setup-confirm-replace-erase-old = Luft empieza a copiarse en seguida. El sistema anterior se borra definitivamente, y tus archivos se quedan donde están.
setup-confirm-erase-description = Se borra definitivamente todo lo que hay en este disco, incluidos otros sistemas y archivos.
setup-confirm-install-description = Luft empieza a copiarse en seguida. Mientras tanto, puedes configurar tu cuenta.
setup-confirm-erase = Borrar e instalar
setup-confirm-install = Instalar

## Making room next to Windows

setup-alongside-hint = Arrastra para repartir { $drive } entre Windows y Luft. Windows conserva todos sus archivos y algo de espacio para crecer.
setup-windows-bitlocker = Windows mantiene este disco bloqueado con BitLocker, así que Luft no puede hacer sitio en él. En Windows, desactiva el cifrado de dispositivo, o reduce el disco en Administración de discos y elige el espacio libre en Personalizado.
setup-windows-hibernated = Windows está suspendido o se apagó con Inicio rápido, así que no se puede modificar su disco de forma segura. Inicia Windows, mantén pulsada Mayús mientras eliges Apagar y vuelve a iniciar Luft.
setup-windows-dirty = Primero hay que hacer una comprobación rápida del disco de Windows. Inicia Windows, reinícialo una vez y vuelve a iniciar Luft.
setup-windows-full = Windows necesita casi todo su disco. Libera unos { $size } en Windows y vuelve a iniciar Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Lo que guardaste en Windows, { $size }, se desempaqueta en tu nueva cuenta.

## Windows options

setup-windows-fast-startup = Desactivar Inicio rápido en Windows
setup-windows-fast-startup-description = Así Windows se apaga del todo, el sonido, el Wi-Fi y Bluetooth arrancan desde cero en Luft, y su disco queda accesible.
setup-windows-clock = Mantener la hora correcta en ambos
setup-windows-clock-description = Windows lee el reloj del ordenador igual que Luft, así que la hora ya no salta al cambiar de uno a otro.
setup-windows-bluetooth = Traer tus dispositivos Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } dispositivo emparejado en Windows funcionará en Luft sin volver a emparejarlo.
   *[other] { $count } dispositivos emparejados en Windows funcionarán en Luft sin volver a emparejarlos.
}

## Choosing a drive

setup-drives-label = Discos
setup-drives-none = No hay ningún disco que Luft pueda usar. Conecta uno y vuelve a buscar.
setup-drive-has-windows = Tiene { $windows }
setup-drive-empty = Vacío
setup-drive-partitions = { $count ->
    [one] Tiene { $count } partición
   *[other] Tiene { $count } particiones
}

## Custom space

setup-custom-open-disks = Abrir Discos
setup-custom-looking = Buscando…
setup-custom-look-again = Volver a buscar
setup-custom-free-label = Espacio libre
setup-custom-free-space = { $size } de espacio libre
setup-custom-on-drive = En { $drive }
setup-custom-none = Deja al menos { $size } de espacio libre en Discos y vuelve a buscar. Luft se instala en el espacio que dejes libre.

## Replacing a Linux system

setup-replace-stays = Lo que se conserva
setup-replace-changes = Lo que cambia
setup-replace-keeps-account = Tus archivos y tu cuenta { $account }
setup-replace-keeps-account-password = Tus archivos y tu cuenta { $account } con su contraseña
setup-replace-keeps-accounts = { $count ->
    [one] La otra cuenta que contiene, con sus archivos
   *[other] Las otras { $count } cuentas que contiene, con sus archivos
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } conexión de red, con su contraseña Wi-Fi
   *[other] { $count } conexiones de red, con sus contraseñas Wi-Fi
}
setup-replace-keeps-drives = { $drives }, montados al arrancar como antes
setup-replace-keeps-hostname = El nombre del ordenador, { $hostname }, y sus claves SSH
setup-replace-keeps-tools = { $count ->
    [one] { $count } herramienta de línea de comandos que instalaste, en un Toolbox al iniciar sesión
   *[other] { $count } herramientas de línea de comandos que instalaste, en un Toolbox al iniciar sesión
}
setup-replace-keeps-old = { $system } deja de arrancar. Sus archivos de sistema se conservan como old-system hasta que los quites en Discos o en Configuración.
setup-replace-erases-system = Se borra la partición del sistema de { $system }. Tus archivos están en su propia partición y se quedan como están.
setup-replace-clears-boot = Se vacía su partición /boot para guardar los archivos de arranque de Luft.
setup-replace-apps = Las aplicaciones instaladas en él no se traen. Vuelve a instalarlas desde Schelf.

setup-replace-blocked-encrypted = Está cifrado, así que todavía no se puede sustituir conservando tus archivos.
setup-replace-blocked-single = Tus archivos comparten partición con el sistema, así que todavía no se puede sustituir conservándolos.
setup-replace-blocked-layout = Su disco está organizado de una forma que Luft todavía no puede sustituir.
setup-replace-blocked-startup = Su partición del sistema EFI es demasiado pequeña para Luft y no hay ninguna partición /boot que usar en su lugar.
setup-replace-blocked-no-account = No tiene ninguna cuenta que traer.
setup-replace-blocked-running = Luft se está ejecutando desde él ahora mismo. Inicia Luft desde una memoria USB para sustituirlo.
setup-replace-blocked-read-only = Su disco es de solo lectura.

## Connecting to the internet

setup-network-title = Conectarse a internet
setup-network-description = Es opcional. Con conexión, Luft puede ajustar el reloj y la zona horaria, y puedes usar internet mientras se instala.
setup-network-unavailable = Las redes no están disponibles ahora mismo. Puedes conectarte más tarde desde la barra de tareas.
setup-network-looking = Buscando redes…
setup-network-cable = Conectado por cable
setup-network-show-all = Mostrar todas las redes
setup-network-skip = Omitir
setup-network-failed = No se ha podido conectar
setup-network-wrong-password = Contraseña incorrecta
setup-network-connected = Conectado
setup-network-connecting = Conectando…
setup-network-saved = Guardada
setup-network-password = Contraseña
setup-network-join = Conectar

## Account

setup-account-title = ¿Quién usa este ordenador?
setup-account-description = Es la cuenta con la que inicias sesión. Puedes añadir a más personas más tarde en Configuración.
setup-account-full-name = Tu nombre
setup-account-full-name-example = Clara Campoamor
setup-account-user-name = Nombre de usuario
setup-account-password = Contraseña
setup-account-repeat = Vuelve a escribirla
setup-account-user-name-invalid = Usa letras minúsculas, números, - y _
setup-account-full-name-invalid = No uses comas ni dos puntos
setup-account-mismatch = Las contraseñas no coinciden

## Installing

setup-finishing-failed-title = No se ha podido instalar Luft
setup-finishing-failed-description = Algo ha fallado durante la instalación.
setup-finishing-failed-stick = Tu ordenador sigue arrancando como antes. Puedes seguir usando Luft desde la memoria USB, o reiniciar y volver a intentarlo.
setup-finishing-failed-trying = Tu ordenador sigue arrancando como antes. Puedes seguir usando Luft tal como está ahora, o reiniciar y volver a intentarlo.
setup-finishing-use-stick = Usar Luft desde la memoria USB
setup-finishing-keep-trying = Seguir probando Luft
setup-finishing-installed-title = Luft está instalado
setup-finishing-trust-stick = Retira la memoria USB cuando la pantalla se quede en negro. Después, una pantalla azul te pedirá que confíes en Luft. Usa el teclado en ella.
setup-finishing-trust = Justo después de reiniciar, una pantalla azul te pedirá que confíes en Luft. Usa el teclado en ella.
setup-finishing-restart-stick = Reinicia para empezar a usarlo. Retira la memoria USB cuando la pantalla se quede en negro.
setup-finishing-restart = Reinicia para empezar a usarlo.
setup-finishing-title = Ya casi está
setup-finishing-description = Luft se está copiando en tu ordenador. Tardará unos minutos.
setup-finishing-plug-in = Mantén el ordenador enchufado hasta que termine.
setup-stage-idle = Preparando
setup-stage-preparing = Haciendo sitio para Luft
setup-stage-copying = Copiando Luft
setup-stage-waiting = Terminando
setup-stage-configuring = Configurando tu cuenta
setup-stage-finished = Listo

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Pulsa una tecla antes de 10 segundos
setup-enroll-choose-enroll = Elige Enroll MOK y luego Continue
setup-enroll-choose-yes = Elige Yes
setup-enroll-type-code = Escribe el código y elige Reboot
setup-enroll-digits = { $count ->
    [one] { $count } dígito
   *[other] { $count } dígitos
}
setup-secure-boot-title = Tu ordenador todavía no confía en Luft
setup-secure-boot-code = Justo después del próximo reinicio, una pantalla azul te pedirá que confíes en Luft. Usa el teclado en ella con este código.
setup-secure-boot-skipped = Se ha saltado la pantalla azul. Obtén un código nuevo y reinicia; después usa el teclado en ella.
setup-secure-boot-getting = Obteniendo tu código…
setup-secure-boot-new-code = Obtener un código nuevo

## Encryption

setup-protect-title = Protege tus archivos
setup-protect-tpm = Cifra este ordenador para que nadie pueda leer tus archivos sin iniciar sesión, aunque lo pierdas. Se desbloquea solo al arrancar.
setup-protect-passphrase = Cifra este ordenador para que nadie pueda leer tus archivos sin tu frase de contraseña, aunque lo pierdas.
setup-protect-keep-safe = Guarda esta clave de recuperación en un lugar seguro, lejos de este ordenador. La necesitarás si algún día el ordenador no puede desbloquearse solo.
setup-protect-passphrase-label = Frase de contraseña
setup-protect-repeat = Vuelve a escribirla
setup-protect-mismatch = No coinciden
setup-protect-kept = He guardado mi clave de recuperación
setup-protect-only-now = El cifrado solo se puede activar ahora, mientras se instala Luft.
setup-protect-skip = No cifrar
setup-protect-encrypt = Cifrar

## Fingerprint

setup-fingerprint-title = Inicia sesión con el dedo
setup-fingerprint-description = Desbloquea Luft con un toque en lugar de escribir la contraseña. Puedes añadir más dedos más tarde en Configuración.
setup-fingerprint-which = ¿Qué dedo?
setup-fingerprint-another = ¿Añadir otro dedo?
setup-fingerprint-finger = Dedo
setup-fingerprint-no-reader = El lector de huellas no responde. Puedes añadir una huella más tarde en Configuración.
setup-fingerprint-add = Añadir huella
setup-fingerprint-choose-another = Elegir otro dedo

## Done

setup-ready-title = Todo listo
setup-ready-trust = Reinicia una vez más para terminar. Justo después de reiniciar, una pantalla azul te pedirá que confíes en Luft. Usa el teclado en ella con este código.
setup-ready-done = Tu escritorio está listo. Disfruta de Luft.
setup-ready-start = Empezar a usar Luft
