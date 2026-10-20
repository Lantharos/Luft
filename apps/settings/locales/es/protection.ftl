## Shared buttons

settings-protection-cancel = Cancelar
settings-protection-continue = Continuar
settings-protection-close = Cerrar
settings-protection-done = Listo
settings-protection-restart = Reiniciar
settings-protection-remove = Quitar
settings-protection-turn-on = Activar
settings-protection-set-up = Configurar

## Privacy: screen lock

settings-privacy-screen-lock = Bloqueo de pantalla
settings-privacy-screen-off = La pantalla se apaga
settings-privacy-screen-off-hint = Se ajusta en Energía y batería
settings-privacy-screen-off-after = Tras { $duration }
settings-privacy-screen-off-never = Nunca
settings-privacy-lock-when-off = Bloquear la pantalla cuando se apague
settings-privacy-lock-after = Bloquear tras
settings-privacy-lock-after-hint = Cuánto esperar después de que se apague la pantalla
settings-privacy-lock-immediately = Inmediatamente

## Privacy: location, camera and microphone

settings-privacy-location = Ubicación
settings-privacy-location-services = Servicios de ubicación
settings-privacy-location-services-hint = Permite a las aplicaciones saber dónde estás, para mapas, el tiempo y la zona horaria
settings-privacy-camera = Cámara
settings-privacy-camera-allow = Permitir que las aplicaciones usen la cámara
settings-privacy-microphone = Micrófono
settings-privacy-microphone-allow = Permitir que las aplicaciones usen el micrófono
settings-privacy-apps-asked = Aplicaciones que lo han pedido
settings-privacy-apps-allowed = { $allowed } de { $total } permitidas

## Privacy: file history

settings-privacy-file-history = Historial de archivos
settings-privacy-remember-files = Recordar los archivos usados recientemente
settings-privacy-remember-files-hint = Las aplicaciones pueden mostrar los últimos archivos que has abierto
settings-privacy-keep-history = Conservar el historial durante
settings-privacy-keep-forever = Siempre
settings-privacy-clear-history = Borrar el historial
settings-privacy-clear-history-hint = Olvida ahora mismo todos los archivos de la lista
settings-privacy-clear = Borrar
settings-privacy-clear-title = ¿Borrar el historial de archivos?
settings-privacy-clear-description = Las aplicaciones dejarán de mostrar los archivos que has abierto recientemente. Los archivos se quedan donde están.

## Privacy: trash and temporary files

settings-privacy-cleanup = Papelera y archivos temporales
settings-privacy-empty-trash = Vaciar la papelera automáticamente
settings-privacy-delete-temp = Eliminar archivos temporales automáticamente
settings-privacy-delete-temp-hint = Tus archivos de carpetas temporales que nada ha usado últimamente
settings-privacy-delete-after = Eliminar tras
settings-privacy-delete-after-hint = Cuánto tiempo se guardan los archivos antes de quitarlos

## Security: summary at the top of the page

settings-security-protected = Tu dispositivo está protegido
settings-security-encrypting = Cifrando tu dispositivo
settings-security-encrypting-progress = { $progress }. Puedes seguir trabajando mientras termina.
settings-security-decrypting = Desactivando el cifrado de dispositivo
settings-security-restart-to-encrypt = Reinicia para empezar a cifrar
settings-security-restart-to-encrypt-description = El cifrado empezará la próxima vez que se reinicie este ordenador.
settings-security-encryption-failed = El cifrado no ha empezado
settings-security-encryption-failed-description = Luft se ha iniciado sin él y tus archivos no se han modificado. Vuelve a activarlo para intentarlo otra vez.
settings-security-could-be-safer = Tu dispositivo podría estar más seguro
settings-security-could-be-safer-description = Activa el cifrado de dispositivo para mantener tus archivos a salvo.
settings-security-starts-differently-description = Si has cambiado su configuración de Secure Boot, confírmalo para que el disco vuelva a desbloquearse solo.
settings-security-needed-recovery-key = Tu disco ha necesitado su clave de recuperación
settings-security-needed-recovery-key-description = Vuelve a vincular el chip de seguridad para que se desbloquee solo.
settings-security-firmware-ready-description = Hay actualizaciones de firmware para tu hardware listas en Actualizaciones.
settings-security-encrypted-secure-boot = Tu disco está cifrado y Secure Boot comprueba cómo arranca.
settings-security-encrypted = Tu disco está cifrado.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Solo el software de confianza puede arrancar este ordenador
settings-security-chip = Chip de seguridad
settings-security-chip-description = Protege las claves y comprueba cómo ha arrancado este ordenador
settings-firmware-updates-ready = Hay actualizaciones de firmware listas
settings-firmware-updates-count = { $count ->
    [one] { $count } actualización para tu hardware en Actualizaciones
   *[other] { $count } actualizaciones para tu hardware en Actualizaciones
}

## Security: signed startup

settings-security-signed-startup = Arranque firmado
settings-security-signed-startup-on = El menú de arranque y el sistema están firmados para este ordenador
settings-security-signed-startup-purpose = Solo deja arrancar el software firmado para este ordenador
settings-security-signed-startup-restart = Se empezará a usar cuando reinicies
settings-security-signed-startup-missed = La clave no se añadió en el último reinicio
settings-security-signed-startup-pending = Añade la clave en la pantalla azul al reiniciar
settings-security-signed-startup-missed-often = La clave no se ha añadido tras varios reinicios
settings-security-show-steps = Mostrar los pasos
settings-security-try-again = Reintentar

## Security: games with anti-cheat

settings-security-anti-cheat = Juegos con antitrampas
settings-security-anti-cheat-ready = Listo para juegos con antitrampas
settings-security-anti-cheat-removing = Quita las otras claves en la pantalla azul al reiniciar
settings-security-anti-cheat-luft-key = Epic aún tiene que añadir la clave de Luft a su lista
settings-security-anti-cheat-ready-description = Los juegos pueden comprobar cómo ha arrancado este ordenador

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Quita las claves al reiniciar
settings-security-key-steps-add = Añade la clave al reiniciar
settings-security-key-steps-remove-description = Después de reiniciar, una pantalla azul te preguntará si quieres quitar claves. Solo espera 10 segundos, así que pulsa cualquier tecla en cuanto aparezca.
settings-security-key-steps-add-description = Después de reiniciar, una pantalla azul te preguntará por una clave nueva. Solo espera 10 segundos, así que pulsa cualquier tecla en cuanto aparezca.
settings-security-key-step-choose = Elige { $option } y después { $next }.
settings-security-key-step-confirm = Elige { $option }.
settings-security-key-step-code = Escribe el código de abajo y pulsa { $key }.
settings-security-key-step-reboot = Elige { $option }.
settings-security-key-enter = Intro
settings-security-key-code = Código { $code }
settings-security-key-steps-remove-missed = Si se te pasa, el ordenador arrancará como siempre y podrás volver a intentarlo aquí.
settings-security-key-steps-add-missed = Si se te pasa, el ordenador arrancará como siempre y los pasos volverán a aparecer en el siguiente reinicio, con un código nuevo.
settings-security-later = Más tarde
settings-security-restart-now = Reiniciar ahora

## Security: hardware security level

settings-security-hardware = Seguridad del hardware
settings-security-hardware-level-0 = Tu hardware tiene pocas de las protecciones que podría tener
settings-security-hardware-level-1 = Tu hardware tiene las protecciones básicas
settings-security-hardware-level-2 = Tu hardware tiene las protecciones importantes
settings-security-hardware-level-3 = Tu hardware está bien protegido
settings-security-hardware-level-4 = Tu hardware se protege a sí mismo mientras funciona
settings-security-hardware-level-5 = Tu hardware se protege a sí mismo y puede demostrarlo
settings-security-hardware-description = { $summary }, nivel { $level } de { $highest }.
settings-security-hardware-next = Para el siguiente nivel
settings-security-hardware-highest = Este es el nivel más alto que existe.
settings-security-hardware-inactive = Inactivas ahora mismo
settings-security-hardware-fix-maker = { $count ->
    [one] Solo el fabricante de tu ordenador puede añadir esta protección, normalmente con una actualización de firmware:
   *[other] Solo el fabricante de tu ordenador puede añadir estas protecciones, normalmente con una actualización de firmware:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Esta protección se puede activar en la configuración del firmware de tu ordenador:
   *[other] Estas protecciones se pueden activar en la configuración del firmware de tu ordenador:
}
settings-security-hardware-fix-system = { $count ->
    [one] Esta protección depende de cómo esté configurado el sistema:
   *[other] Estas protecciones dependen de cómo esté configurado el sistema:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Esta protección no está disponible en este ordenador:
   *[other] Estas protecciones no están disponibles en este ordenador:
}

## Security: USB protection

settings-usb-hold-back = Retener los dispositivos USB nuevos
settings-usb-hold-back-description = Los que se conecten con la sesión bloqueada esperan hasta que desbloquees

## Device encryption

settings-encryption = Cifrado de dispositivo
settings-encryption-encrypting = Cifrando este dispositivo
settings-encryption-decrypting = Desactivando el cifrado de dispositivo
settings-encryption-starting = Empezará la próxima vez que reinicies
settings-encryption-failed = No empezó en el último reinicio; tus archivos no se han modificado
settings-encryption-off = Mantiene tus archivos a salvo si pierdes este ordenador
settings-encryption-progress = { $percent } completado
settings-encryption-progress-seconds = { $percent } completado, queda menos de un minuto
settings-encryption-progress-minutes = { $minutes ->
    [one] { $percent } completado, queda { $minutes } minuto aproximadamente
   *[other] { $percent } completado, quedan unos { $minutes } minutos
}
settings-encryption-progress-hours = { $hours ->
    [one] { $percent } completado, queda { $hours } hora aproximadamente
   *[other] { $percent } completado, quedan unas { $hours } horas
}
settings-encryption-unlocks-chip-pin = Se desbloquea con el chip de seguridad y tu PIN
settings-encryption-unlocks-chip = Se desbloquea solo con el chip de seguridad
settings-encryption-unlocks-passphrase = Pide tu frase de contraseña al arrancar
settings-encryption-unlocks-security-key = Se desbloquea con tu llave de seguridad al arrancar
settings-encryption-unlocks-recovery-key = Pide tu clave de recuperación al arrancar

## Device encryption: other drives

settings-encryption-drives = Otras unidades
settings-encryption-drives-hint = Cifra otras unidades y memorias USB en Discos
settings-encryption-drives-open = Abrir Discos
settings-encryption-drive-encrypting = Cifrando una unidad, { $percent } completado
settings-encryption-drive-encrypting-paused = Cifrando una unidad, en pausa al { $percent }
settings-encryption-drive-decrypting = Descifrando una unidad, { $percent } completado
settings-encryption-drive-decrypting-paused = Descifrando una unidad, en pausa al { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } unidad cifrada se desbloquea con este ordenador
   *[other] { $count } unidades cifradas se desbloquean con este ordenador
}

## Device encryption: turning it on

settings-encryption-turn-on-title = Activar el cifrado de dispositivo
settings-encryption-turn-on-description = Tus archivos siguen a salvo si pierdes este ordenador o te lo roban. Sin la clave correcta, nadie puede leer el disco.
settings-encryption-blocked-title = Aún no se puede activar el cifrado de dispositivo
settings-encryption-blocked-description = Resuelve lo que aparece marcado abajo y vuelve a intentarlo.
settings-encryption-checking = Comprobando tu ordenador…
settings-encryption-backup = Antes de empezar, asegúrate de tener una copia de seguridad de tus archivos importantes.
settings-encryption-key-title = Guarda tu clave de recuperación
settings-encryption-key-description = Si alguna vez el disco no puede desbloquearse solo, por ejemplo después de una reparación, esta clave te permite volver a entrar. Guárdala en un lugar que no sea este ordenador.
settings-encryption-unlock-title = Desbloqueo al arrancar
settings-encryption-unlock-description = El chip de seguridad desbloquea el disco solo al arrancar, así que el inicio de sesión no cambia.
settings-encryption-passphrase-title = Elige una frase de contraseña
settings-encryption-passphrase-description = Este ordenador no puede desbloquear el disco solo, así que te pedirá esta frase de contraseña cada vez que arranque.
settings-encryption-summary-title = Listo para cifrar
settings-encryption-summary-description = Esto es lo que pasará a continuación.
settings-encryption-step-restart = Tu ordenador se reiniciará una vez.
settings-encryption-step-screen = Mientras arranca, aparecerá brevemente una pantalla «Cifrando tu dispositivo».
settings-encryption-step-background = El resto ocurre en segundo plano mientras sigues trabajando.
settings-encryption-step-plugged-in = Mantén el ordenador enchufado hasta que termine.
settings-encryption-ask-pin = Pedir también un PIN
settings-encryption-ask-pin-description = Mantiene el disco bloqueado aunque alguien se lleve el ordenador. Se te pedirá cuando termine el cifrado.
settings-encryption-back = Atrás
settings-encryption-starting-button = Iniciando…
settings-encryption-restart-and-encrypt = Reiniciar y cifrar

## Device encryption: turning it off

settings-encryption-turn-off-title = ¿Desactivar el cifrado de dispositivo?
settings-encryption-turn-off-description = Tus archivos se descifran en segundo plano mientras trabajas. Después, cualquiera que saque el disco podrá leerlo.
settings-encryption-keep = Mantener el cifrado
settings-encryption-turning-off = Desactivando…
settings-encryption-turn-off = Desactivar

## Device encryption: unlocking the disk

settings-encryption-unlocking = Desbloqueo del disco
settings-encryption-starts-differently = Este ordenador ahora arranca de otra forma
settings-encryption-starts-differently-description = Su configuración de Secure Boot ha cambiado, así que el disco ha pedido su clave de recuperación. Si has hecho tú el cambio, confírmalo para que vuelva a desbloquearse solo
settings-encryption-confirm = Confirmar
settings-encryption-asked-recovery-key = Tu disco ha pedido su clave de recuperación
settings-encryption-relink-description = Vuelve a vincular el chip de seguridad para que se desbloquee solo
settings-encryption-relink = Volver a vincular
settings-encryption-chip-unlock = Desbloquear con el chip de seguridad
settings-encryption-chip-unlock-on = Mientras nada cambie la forma en que arranca este ordenador
settings-encryption-chip-unlock-off = Para no tener que escribir una frase de contraseña al arrancar
settings-encryption-pin = PIN al arrancar
settings-encryption-pin-description = Lo escribes antes de que se desbloquee el disco
settings-encryption-change = Cambiar
settings-encryption-add-pin-row = Añadir un PIN al arrancar
settings-encryption-add-pin-row-description = Mantiene el disco bloqueado aunque alguien se lleve el ordenador
settings-encryption-add-pin = Añadir PIN
settings-encryption-new-key-description = Tu disco aún no tenía clave de recuperación. Guarda esta en un lugar que no sea este ordenador.
settings-encryption-stop-chip-title = ¿Dejar de desbloquear con el chip de seguridad?
settings-encryption-stop-chip-passphrase = Tu ordenador te pedirá la frase de contraseña cada vez que arranque.
settings-encryption-stop-chip-recovery-key = Tu ordenador te pedirá la clave de recuperación cada vez que arranque, así que tenla a mano.
settings-encryption-stop-chip = Dejar de desbloquear
settings-encryption-remove-pin-title = ¿Quitar tu PIN?
settings-encryption-remove-pin-description = El disco volverá a desbloquearse solo al arrancar el ordenador.
settings-encryption-remove-pin = Quitar PIN
settings-encryption-unlock-disk-title = Desbloquea tu disco
settings-encryption-unlock-disk-description = Para este cambio se necesita tu clave de recuperación o la frase de contraseña que escribes al arrancar el ordenador.
settings-encryption-unlock-disk-field = Clave de recuperación o frase de contraseña

## Device encryption: security chip and PIN

settings-encryption-chip-setup-description = El chip de seguridad de tu ordenador desbloquea el disco solo al arrancar, así que ya no tienes que escribir antes una frase de contraseña.
settings-encryption-add-pin-title = Añadir un PIN
settings-encryption-add-pin-description = Lo escribirás cada vez que arranque el ordenador. Sin él, el disco sigue bloqueado aunque alguien se lleve el ordenador entero.
settings-encryption-change-pin-title = Cambiar tu PIN
settings-encryption-change-pin-description = Escribirás el PIN nuevo cada vez que arranque el ordenador.
settings-encryption-change-pin = Cambiar PIN
settings-encryption-relink-title = Volver a vincular el chip de seguridad
settings-encryption-relink-pin-description = Escribe el PIN que quieres usar al arrancar.
settings-encryption-ask-pin-step = Añade un paso al arrancar.
settings-encryption-pin-field = PIN
settings-encryption-new-pin-field = PIN nuevo
settings-encryption-pin-length = De { $min } a { $max } dígitos
settings-encryption-pin-digits-only = Usa solo dígitos
settings-encryption-pin-too-short = { $min ->
    [one] Usa al menos { $min } dígito
   *[other] Usa al menos { $min } dígitos
}
settings-encryption-pin-too-long = { $max ->
    [one] Usa como máximo { $max } dígito
   *[other] Usa como máximo { $max } dígitos
}
settings-encryption-pins-differ = Los PIN no coinciden
settings-encryption-confirm-field = Confirmar
settings-encryption-type-again = Vuelve a escribirlo
settings-encryption-passphrase-field = Frase de contraseña
settings-encryption-passphrase-length = { $min ->
    [one] Al menos { $min } carácter
   *[other] Al menos { $min } caracteres
}
settings-encryption-passphrases-differ = Las frases de contraseña no coinciden

## Recovery key

settings-recovery-title = Clave de recuperación
settings-recovery-description = Te permite entrar si el disco no puede desbloquearse solo
settings-recovery-show = Mostrar
settings-recovery-replace = Sustituir
settings-recovery-replace-title = ¿Sustituir tu clave de recuperación?
settings-recovery-replace-description = Tu clave actual dejará de funcionar y recibirás una nueva para guardarla.
settings-recovery-replace-key = Sustituir clave
settings-recovery-shown-title = Tu clave de recuperación
settings-recovery-shown-description = Escríbela si alguna vez tu ordenador te pide una clave de recuperación al arrancar. Guarda una copia en un lugar que no sea este ordenador.
settings-recovery-fresh-title = Guarda tu nueva clave de recuperación
settings-recovery-fresh-description = Tu clave anterior ya no funciona. Guarda esta en papel o en un gestor de contraseñas.
settings-recovery-saved = He guardado mi clave de recuperación

## Passwords and keys (the keyring)

settings-passwords-title = Contraseñas y claves
settings-passwords-not-running = Tu llavero no está en marcha
settings-passwords-not-running-description = Tus contraseñas y claves aparecerán aquí en cuanto se inicie
settings-passwords-locked = Bloqueado
settings-passwords-contents = { $count ->
    [0] Aún no hay nada guardado
    [one] { $count } contraseña o clave
   *[other] { $count } contraseñas y claves
}
settings-passwords-protected-chip = Protegido con tu contraseña y el chip de seguridad
settings-passwords-protected = Protegido con tu contraseña
settings-passwords-unlock = Desbloquear
settings-passwords-lock = Bloquear
settings-passwords-seal-title = Sellar con el chip de seguridad
settings-passwords-seal-description = Sus copias no se podrán abrir en otro ordenador
settings-passwords-seal = Sellar
settings-passwords-fingerprint-on = Se desbloquea con tu huella
settings-passwords-fingerprint-on-description = Al iniciar sesión con ella también se desbloquean tus contraseñas
settings-passwords-fingerprint = Desbloquear con tu huella
settings-passwords-fingerprint-description = Primero añade una huella en Usuarios
settings-passwords-pin = Pedir un PIN después de la huella
settings-passwords-pin-locked = Desbloquea tu llavero para cambiar esto
settings-passwords-pin-description = Así una huella sola no puede desbloquearlas
settings-passwords-lock-with-screen = Bloquear con la pantalla
settings-passwords-lock-with-screen-description = Se bloquean y desbloquean junto con la pantalla
settings-passwords-apps = Aplicaciones con acceso
settings-passwords-apps-locked = Desbloquea tu llavero para verlas
settings-passwords-apps-asked = { $count ->
    [0] Ninguna aplicación las ha pedido todavía
    [one] { $count } aplicación las ha pedido
   *[other] { $count } aplicaciones las han pedido
}

## Passwords and keys: apps with access

settings-passwords-access-back = Seguridad
settings-passwords-access-description = Si quitas una, la aplicación volverá a pedir permiso la próxima vez.
settings-passwords-access-not-allowed = No permitido
settings-passwords-access-none = Ninguna aplicación ha pedido tus contraseñas todavía
settings-passwords-access-revoke = Impedir que { $app } use { $item }
settings-passwords-access-reset = Dejar que { $app } vuelva a pedir { $item }
settings-passwords-stores = Inicios de sesión de aplicaciones
settings-passwords-stores-description = Inicios de sesión que algunas aplicaciones guardan aquí y que solo esa aplicación puede leer.
settings-passwords-stores-count = { $count ->
    [one] { $count } inicio de sesión guardado
   *[other] { $count } inicios de sesión guardados
}
settings-passwords-forget = Olvidar
settings-passwords-forget-title = ¿Olvidar lo que ha guardado { $app }?
settings-passwords-forget-description = { $app } perderá los inicios de sesión que guardaba aquí, así que puede que tengas que volver a iniciar sesión en ella.

## Passwords and keys: recent access

settings-passwords-history = Accesos recientes
settings-passwords-history-read = { $app } ha usado «{ $item }»
settings-passwords-history-read-unnamed = { $app } ha usado una contraseña guardada
settings-passwords-history-saved = { $app } ha guardado «{ $item }»
settings-passwords-history-saved-unnamed = { $app } ha guardado una contraseña
settings-passwords-history-deleted = { $app } ha eliminado «{ $item }»
settings-passwords-history-deleted-unnamed = { $app } ha eliminado una contraseña guardada
settings-passwords-history-denied = { $app } no ha tenido permiso para usar «{ $item }»
settings-passwords-history-denied-unnamed = { $app } no ha tenido permiso para usar una contraseña guardada
settings-passwords-history-signed = { $app } ha firmado con «{ $item }»
settings-passwords-history-signed-unnamed = { $app } ha firmado con una contraseña guardada
settings-passwords-history-fewer = Mostrar menos
settings-passwords-history-all = { $count ->
    [one] Mostrar { $count }
   *[other] Mostrar los { $count }
}
settings-passwords-history-clear = Borrar el historial
settings-passwords-history-clear-description = Olvida qué aplicaciones han usado tu llavero y cuándo
settings-passwords-history-clear-button = Borrar
settings-passwords-history-clear-title = ¿Borrar los accesos recientes?
settings-passwords-history-clear-confirm = Se borrará la lista de qué aplicaciones han usado tu llavero y cuándo. Tus contraseñas y claves guardadas no cambian.

## Passwords and keys: SSH keys

settings-passwords-ssh = Claves SSH
settings-passwords-ssh-description = Claves para iniciar sesión en servidores, guardadas de forma segura en tu llavero.
settings-passwords-ssh-unnamed = Clave sin nombre
settings-passwords-ssh-in-chip = Guardada en el chip de seguridad
settings-passwords-ssh-added = Añadida { $when }
settings-passwords-ssh-copy = Copiar la clave pública de { $name }
settings-passwords-ssh-remove = Quitar { $name }
settings-passwords-ssh-confirm = Preguntar antes de cada uso
settings-passwords-ssh-confirm-label = Preguntar antes de cada uso de { $name }
settings-passwords-ssh-add-row = Añadir una clave
settings-passwords-ssh-use = Usar estas claves con SSH
settings-passwords-ssh-use-description = Copia la línea que indica a SSH dónde están
settings-passwords-ssh-copy-line = Copiar { $line }
settings-passwords-ssh-remove-title = ¿Quitar «{ $name }»?
settings-passwords-ssh-remove-chip = Solo existe en el chip de seguridad de este ordenador, así que se perderá para siempre. Los servidores que solo aceptan esta clave dejarán de permitirte entrar con ella.
settings-passwords-ssh-remove-description = Los servidores que solo aceptan esta clave dejarán de permitirte entrar con ella. No se puede deshacer.
settings-passwords-ssh-add-title = Añadir una clave SSH
settings-passwords-ssh-add-description = Se crea una clave nueva en este ordenador. Copia su clave pública en los servidores en los que quieras iniciar sesión.
settings-passwords-ssh-name = Nombre
settings-passwords-ssh-name-placeholder = Por ejemplo, portátil del trabajo
settings-passwords-ssh-chip = Guardarla en el chip de seguridad
settings-passwords-ssh-chip-description = Nunca se podrá copiar fuera de este ordenador, ni siquiera por ti
settings-passwords-ssh-chip-unsupported = El chip de seguridad de este ordenador no puede guardar claves SSH
settings-passwords-ssh-add = Añadir clave

## Passkeys

settings-passkeys-title = Llaves de acceso
settings-passkeys-unavailable = Desbloquea tu llavero para ver tus llaves de acceso.
settings-passkeys-chip-fingerprint = Selladas por el chip de seguridad de este ordenador. Cada inicio de sesión pide tu huella o tu contraseña.
settings-passkeys-chip-password = Selladas por el chip de seguridad de este ordenador. Cada inicio de sesión pide tu contraseña.
settings-passkeys-password-fingerprint = Cifradas con tu contraseña. Cada inicio de sesión pide tu huella o tu contraseña.
settings-passkeys-password = Cifradas con tu contraseña. Cada inicio de sesión pide tu contraseña.
settings-passkeys-last-used = Último uso: { $when }
settings-passkeys-never-used = Nunca se ha usado
settings-passkeys-password-only = Protegida con tu contraseña
settings-passkeys-unreachable = Los navegadores no pueden acceder a tus llaves de acceso
settings-passkeys-unreachable-description = Volverán a estar disponibles cuando el servicio de llaves de acceso esté en marcha
settings-passkeys-rename-label = Cambiar el nombre de la llave de acceso de { $site }
settings-passkeys-remove-label = Quitar la llave de acceso de { $site }
settings-passkeys-empty = Aún no hay llaves de acceso
settings-passkeys-empty-description = Las que creen los sitios web se guardan aquí para todos los navegadores
settings-passkeys-remove-title = ¿Quitar esta llave de acceso?
settings-passkeys-remove-description = Ya no podrás iniciar sesión en { $site } con ella, así que asegúrate de tener otra forma de entrar.
settings-passkeys-rename-title = Cambiar el nombre de la llave de acceso
settings-passkeys-rename-description = Pon a tu llave de acceso de { $site } un nombre que reconozcas.
settings-passkeys-name = Nombre
settings-passkeys-save = Guardar
