## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Atrás
meet-cancel = Cancelar
meet-continue = Continuar
meet-try-again = Reintentar
meet-restart = Reiniciar
meet-remove = Quitar
meet-keep-it = Conservarlo
meet-close = Cerrar
meet-restart-title = ¿Reiniciar ahora?
meet-not-yet = Todavía no
meet-iso-use = Usar una ISO que ya tengo
meet-iso-using = Usando tu ISO de Luft
meet-nightly = Versiones nightly
meet-channel-nightly = Meet Luft usará versiones nightly
meet-channel-latest = Meet Luft volverá a usar las versiones normales
meet-undo = Deshacer
meet-logs-saved = Se han guardado en tu escritorio los registros de la prueba de Luft
meet-logs-show = Mostrar
meet-logs-none = Todavía no hay registros de la prueba de Luft
meet-logs-failed = Meet Luft no ha podido guardar los registros de la prueba de Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft no ha podido terminar de examinar este ordenador.
   *[windows] Meet Luft no ha podido terminar de examinar este PC.
}
problem-room = No se ha podido terminar de hacer sitio para Luft.
problem-room-linux = No se ha podido terminar de preparar Luft.
problem-update = No se ha podido terminar de actualizar Luft.
problem-download = La descarga de Luft se ha detenido. Comprueba que tienes conexión.
problem-pack = No se ha podido terminar de empaquetar tus cosas.
problem-remove = No se ha podido terminar de quitar Luft.
problem-restart = Meet Luft no ha podido preparar el reinicio.
problem-tidy = No se han podido quitar las entradas de arranque antiguas.
problem-firmware = Meet Luft no ha podido abrir la configuración del firmware.
problem-folders = Meet Luft no ha podido revisar tus carpetas.
problem-sticks = Meet Luft no ha podido buscar unidades USB.
problem-stick = No se ha podido terminar de crear la memoria.
problem-offer = Ahora mismo no se puede descargar Luft. Comprueba que tienes conexión o usa una ISO que ya tengas.
problem-luft = Meet Luft no ha podido examinar el disco de Luft.
problem-resize = No se ha podido terminar de cambiar el tamaño de Luft.
problem-cancel = Meet Luft no ha podido cancelar el cambio.
problem-give = Windows no ha podido recuperar el espacio.
problem-declined = { $platform ->
    [linux] Meet Luft necesita tu permiso para trabajar en el disco. Escribe tu contraseña cuando te la pida.
   *[windows] Meet Luft necesita tu permiso para trabajar en el disco. Elige Sí cuando Windows te lo pregunte.
}

## First screen

hello-intro = { $platform ->
    [linux] Prueba Luft desde aquí mismo, sin memoria USB. Si te gusta, Luft puede ocupar el lugar de este sistema y conservar tus archivos.
   *[windows] Luft puede convivir con Windows. Pruébalo primero sin instalar nada y trae tus cosas cuando quieras.
}
hello-check = { $platform ->
    [linux] Revisar este ordenador
   *[windows] Revisar este PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Examinando este ordenador
   *[windows] Examinando este PC
}
check-ready-title = { $platform ->
    [linux] Este ordenador está listo para Luft
   *[windows] Este PC está listo para Luft
}
check-blocked-title = Ya casi está
check-moment = Esto tarda un momento.
check-slow = Windows está calculando cuánto espacio puede ceder. En un disco grande puede tardar unos minutos.
check-blocked-description = Hay que cambiar algo antes de que Luft pueda instalarse. Esto es lo que tienes que hacer.
check-found-description = Esto es lo que ha encontrado Meet Luft.
check-checking = Comprobando el disco, el firmware y el hardware…
check-again = Volver a comprobar
check-action-firmware = Abrir la configuración del firmware
check-action-tidy = Limpiar
check-firmware-title = ¿Reiniciar en la configuración del firmware?
check-firmware-description = Guarda antes lo que estés haciendo. Activa allí Secure Boot y guarda los cambios, y tu ordenador volverá a arrancar como siempre.
check-tidy-title = ¿Quitar las entradas de arranque antiguas?
check-tidy-description = Solo apuntan a sistemas que ya no existen. Windows y todo lo demás arrancan igual que antes.
check-get-ready-title = ¿Preparar Luft?
check-get-ready-file = Meet Luft copia Luft desde tu ISO en una carpeta de este ordenador y le añade una entrada de arranque. No se cambian las particiones.
check-get-ready-download = Meet Luft descarga Luft, unos { $size }, en una carpeta de este ordenador y le añade una entrada de arranque. No se cambian las particiones.
check-get-ready-confirm = Prepararlo

## Choosing how much of the Windows drive Luft gets

room-title = ¿Cuánto espacio para Luft?
room-description = Windows se reduce para dejar espacio a Luft. Tus archivos de Windows se quedan donde están.
room-live = Windows conserva espacio para crecer. Luft también reserva { $size } para arrancar, que devuelve una vez instalado.
room-make = Hacer sitio
room-confirm-title = ¿Dar { $size } a Luft?
room-confirm-file = Windows reduce su disco y luego Meet Luft copia Luft desde tu ISO. Mantén el PC enchufado.
room-confirm-download = Windows reduce su disco y luego Meet Luft descarga Luft, unos { $size }. Mantén el PC enchufado y con conexión.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = ¿Dónde quieres poner Luft?
room-places-description = Luft puede compartir el disco de Windows o usar espacio que Windows no utiliza.
room-places-label = Ubicaciones para Luft
room-place-windows = Junto a Windows
room-place-windows-detail = Windows se reduce para dejar espacio a Luft
room-place-windows-free = Ya hay { $size } libres
room-place-free = Espacio libre en { $drive }
room-place-free-here = Espacio libre en el disco de Windows
room-place-free-detail = { $size } que no usa nada más
room-place-whole = Todo el disco { $drive }
room-place-whole-detail = Borra este disco de { $size } para Luft
room-live-free = Ya hay { $free } libres, así que Windows cede menos y conserva espacio para crecer. Luft también reserva { $size } para arrancar, que devuelve una vez instalado.
room-live-elsewhere = Luft obtiene ahí { $room } y reserva { $size } más para arrancar, que devuelve una vez instalado.
room-confirm-free-title = ¿Dar a Luft { $size } de espacio libre?
room-confirm-free-file = Meet Luft copia Luft en él desde tu ISO. No cambia nada más en el disco.
room-confirm-free-download = Meet Luft descarga Luft en él, unos { $size }. No cambia nada más en el disco. Mantén el PC con conexión.
room-erase-title = ¿Borrar { $drive }?
room-erase-description = Todo lo que hay en este disco de { $size } se borra de inmediato, antes de que arranque Luft. No se puede deshacer. Ahora contiene:
room-erase-empty = Windows no puede leer nada en este disco de { $size }, pero lo que haya en él se borra de inmediato. No se puede deshacer.
room-erase-unnamed = Partición sin nombre
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Cifrada con BitLocker
room-erase-understood = Sé que una parte está cifrada con BitLocker y no se podrá recuperar
room-erase-confirm = Borrar y hacer sitio

## Luft is ready on Windows

ready-title = Luft está listo
ready-description = Elige cómo quieres conocerlo. Después, Windows arranca como siempre, salvo que instales Luft y lo elijas.
ready-update-title = Obtener el Luft más reciente
ready-update-description = Hay una versión más nueva. Sustituye a esta y conserva el espacio y todo lo que hayas empaquetado.
ready-try-title = Probar Luft
ready-try-description = Reinicia en Luft sin instalar nada. La próxima vez, Windows arranca como siempre.
ready-box-description = Empaqueta documentos, fotos, redes Wi-Fi y más, para que Luft los desempaquete al instalarse.
ready-box-packed = Empaquetado, { $size }
ready-install-title = Instalar Luft
ready-install-description = Reinicia en el instalador. Los { $size } junto a Windows ya lo están esperando.
ready-install-drive-description = Reinicia en el instalador. Los { $size } de { $drive } ya lo están esperando.
ready-stick-description = Pon Luft en una memoria USB para arrancarlo en cualquier ordenador.
ready-remove = Quitar Luft de este PC
ready-restart-try = Guarda antes lo que estés haciendo. Luft se abre en un minuto más o menos, y el siguiente reinicio te devuelve a Windows.
ready-restart-install = Guarda antes lo que estés haciendo. El instalador se abre en un minuto más o menos, y no cambia nada hasta que lo confirmes allí.
ready-fast-startup-title = Desactivar Inicio rápido en Windows
ready-fast-startup-description = Así Windows se apaga del todo, y el sonido, el Wi-Fi y Bluetooth arrancan desde cero en Luft.
ready-clock-title = Mantener la hora correcta en ambos
ready-clock-description = Windows lee el reloj del ordenador igual que Luft, así que la hora ya no salta al cambiar de uno a otro.
ready-remove-title = ¿Quitar Luft de este PC?
ready-remove-description = Meet Luft elimina todo lo que ha añadido, incluida la caja de mudanza, y devuelve a Windows todo su espacio.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Elige cómo quieres conocerlo. { $system } sigue arrancando como siempre hasta que decidas otra cosa.
linux-ready-this-system = este sistema
linux-ready-update-description = Hay una versión más nueva. Sustituye a la que guarda Meet Luft y conserva los registros de las pruebas.
linux-ready-try-description = Reinicia en Luft sin cambiar nada. La próxima vez, { $system } arranca como siempre.
linux-ready-replace-title = Sustituir { $system }
linux-ready-replace-description = Luft ocupa su lugar y conserva tus archivos, tu cuenta, las redes Wi-Fi y los demás discos. El sistema anterior se queda hasta que lo quites.
linux-ready-install-description = Reinicia en el instalador para poner Luft en otro disco o en el espacio libre.
linux-ready-remove = Quitar Luft de este ordenador
linux-ready-restart-try = Guarda antes lo que estés haciendo. Luft se abre en un minuto más o menos, y el siguiente reinicio te devuelve a { $system }.
linux-ready-restart-replace = Guarda antes lo que estés haciendo. El instalador se abre con { $system } elegido para sustituirlo, y te muestra lo que se conserva antes de cambiar nada.
linux-ready-remove-title = ¿Quitar Luft de este ordenador?
linux-ready-remove-description = Meet Luft elimina los archivos de Luft, sus archivos de arranque y su entrada de arranque. Todo lo demás se queda como está.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Tu Luft
luft-looking = Meet Luft ha encontrado Luft en este PC.
luft-checking = Examinando el disco de Luft…
luft-description-beside = Luft está instalado junto a Windows en este PC.
luft-description-drive = Luft está instalado en { $drive }.
luft-bar-used = { $size }, { $used } en uso
luft-resize-title = Cambiar el espacio de Luft
luft-resize-description = Da a Luft más espacio de Windows o devuelve una parte a Windows.
luft-resize-drive-description = Da a Luft más del espacio libre de { $drive } o deja una parte libre.
luft-resize-reencrypting = Luft todavía está cifrando o descifrando su disco. Cuando termine, podrás cambiar su tamaño.
luft-resize-passphrase = El disco de Luft solo se abre con una frase de contraseña, y Luft no puede escribirla por sí mismo mientras se traslada.
luft-resize-start-first = Arranca Luft una vez para que pueda decirle a Meet Luft lo lleno que está y después vuelve aquí.
luft-resize-apart = Hay otra partición entre Windows y Luft, así que no pueden compartir su espacio.
luft-pending-grow = Luft crecerá la próxima vez que arranque
luft-pending-grow-description = Reinicia en Luft y déjalo encendido unos minutos mientras se instala en el nuevo espacio. Mientras tanto puedes seguir usándolo.
luft-pending-shrink = Luft hará sitio la próxima vez que arranque
luft-pending-shrink-description = Reinicia en Luft y déjalo encendido unos minutos mientras mueve sus archivos. Después vuelve a abrir Meet Luft en Windows para darle el espacio a Windows.
luft-pending-trim = Luft se reducirá la próxima vez que arranque
luft-pending-trim-description = Reinicia en Luft y se reducirá en un minuto más o menos.
luft-windows-free-title = Dar el espacio libre a Windows
luft-windows-free-description = Justo después de Windows hay { $size } que no usa nada. Windows puede recuperarlos.
luft-leftovers-title = Limpiar lo que quedó al probar Luft
luft-leftovers-description = Las particiones que Meet Luft creó para arrancar Luft siguen aquí. Luft ya no las necesita.
luft-start = Reiniciar en Luft
luft-cancel = Cancelar el cambio
luft-restart = Guarda antes lo que estés haciendo. Luft arranca en un minuto más o menos, y el siguiente reinicio te devuelve a Windows.
luft-restart-pending = Guarda antes lo que estés haciendo. Luft arranca en un minuto más o menos y mueve sus archivos por sí solo, lo que tarda unos minutos. Mientras tanto puedes usarlo.
luft-remove = Quitar Luft de este PC
luft-remove-title = ¿Quitar Luft de este PC?
luft-remove-description = Se elimina Luft con todo lo que contiene, { $size } en total, y Windows recupera el espacio. El PC arranca Windows como antes. No se puede deshacer.
luft-remove-drive-description = Se elimina Luft de { $drive } con todo lo que contiene, { $size } en total. El PC arranca Windows como antes. No se puede deshacer.
luft-remove-confirm = Quitar Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = ¿Cuánto espacio para Luft?
resize-description = Arrastra para repartir el disco entre Windows y Luft. Luft hace el cambio por sí mismo la próxima vez que arranque.
resize-measuring = Windows está calculando cuánto espacio puede ceder. En un disco grande puede tardar unos minutos.
resize-full = Luft está demasiado lleno para moverlo y Windows no puede ceder suficiente espacio. Haz antes algo de sitio en Luft o en Windows.
resize-drive-description = Arrastra para elegir qué parte de { $drive } ocupa Luft. Luft hace el cambio por sí mismo la próxima vez que arranque.
resize-drive-free = { $size } libres en { $drive }
resize-used = Los archivos de Luft ocupan { $size }.
resize-least = Cambia el tamaño en al menos { $size }.
resize-apply = Cambiar
resize-grow-title = ¿Dar { $size } más a Luft?
resize-grow-description = Windows se reduce de inmediato. Luft se instala en el nuevo espacio la próxima vez que arranque, lo que tarda unos minutos. Mantén el PC enchufado.
resize-grow-drive-description = Luft ocupará el espacio libre de { $drive } la próxima vez que arranque, lo que tarda un momento.
resize-trim-title = ¿Reducir Luft en { $size }?
resize-trim-description = Luft se reduce la próxima vez que arranque y el espacio de { $drive } queda libre.
resize-shrink-title = ¿Devolver { $size } a Windows?
resize-shrink-description = Luft mueve sus archivos la próxima vez que arranque, lo que tarda unos minutos. Después vuelve a abrir Meet Luft y Windows recuperará el espacio. Mantén el PC enchufado.

## Packing things to take along to Luft (the moving box)

box-title = Trae tus cosas
box-description = Elige lo que quieres llevarte. Luft lo desempaqueta en tu nueva cuenta al instalarse, y no se quita nada de Windows.
box-looking = Revisando tus carpetas…
box-folder-desktop = Escritorio
box-folder-documents = Documentos
box-folder-downloads = Descargas
box-folder-music = Música
box-folder-pictures = Imágenes
box-folder-videos = Vídeos
box-folder-size = { $size }, { $files ->
    [one] { $files } archivo
   *[other] { $files } archivos
}
box-wifi-title = Redes Wi-Fi
box-wifi-description = Con sus contraseñas, para que Luft tenga conexión desde el principio
box-bluetooth-title = Dispositivos Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } dispositivo, listo sin volver a emparejarlo
   *[other] { $devices } dispositivos, listos sin volver a emparejarlos
}
box-wallpaper-title = Fondo de pantalla
box-wallpaper-description = La imagen de tu escritorio de Windows
box-account-title = Tu nombre y tu imagen
box-total-slow = { $size }, que se empaqueta en unos { $minutes ->
    [one] { $minutes } minuto
   *[other] { $minutes } minutos
}
box-pack = Empaquetar

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = Haciendo sitio
    .description = Windows está moviendo sus archivos para dejar espacio. Puede tardar unos minutos.
working-erasing = Borrando el disco
    .description = Windows lo vacía para que Luft pueda usarlo entero.
working-partitioning = Preparando el espacio de Luft
    .description = Preparando las particiones desde las que arranca Luft.
working-downloading = Trayendo Luft
    .description = Luft se copia directamente en su propio espacio y se comprueba por el camino.
working-packing = Empaquetando tus cosas
    .description = Copiando todo lo que has elegido en la caja de mudanza. Las carpetas grandes tardan un rato.
working-removing = Quitando Luft
    .description = Devolviendo el espacio a Windows.
working-removing-linux = Quitando Luft
    .description = Eliminando sus archivos y su entrada de arranque.
working-writing = Creando la memoria USB
    .description = Luft se graba en toda la memoria. Mantenla conectada.
working-copying = Añadiendo Luft a Ventoy
    .description = Luft se copia junto a las demás ISO de la memoria. Mantenla conectada.
working-verifying = Comprobando la memoria USB
    .description = Leyéndola entera para asegurarse de que arranca.
working-stick-downloading = Descargando Luft
    .description = Se comprueba por el camino y se guarda, para que la próxima memoria sea más rápida.
working-progress = { $done } de { $total }
working-keep-open = Mantén esta ventana abierta.

## After Luft was removed

removed-title = Todo vuelve a estar como antes
removed-description = { $platform ->
    [linux] Los archivos de Luft y su entrada de arranque ya no están, y tu ordenador arranca igual que antes. Vuelve cuando quieras.
   *[windows] Las particiones de Luft y su entrada de arranque ya no están, y Windows vuelve a tener todo su espacio. Vuelve cuando quieras.
}

## Making a USB stick

stick-title = Crear una memoria USB
stick-description = Luft arranca desde ella en cualquier ordenador, para probarlo o instalarlo.
stick-looking = Buscando unidades USB…
stick-none = Conecta una memoria USB de { $size } o más. Aparecerá aquí.
stick-drives-label = Unidades USB
stick-offer = { $name }, { $size }
stick-make = Crear la memoria
stick-drive-empty = Vacía
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Demasiado pequeña para Luft
stick-ventoy-title = Esta memoria usa Ventoy
stick-ventoy-description = ¿Añadir Luft a ella, o borrar toda la memoria y convertirla en una memoria de Luft?
stick-erase-it = Borrarla
stick-add = Añadir Luft
stick-replace-title = ¿Sustituir el Luft que contiene?
stick-replace-description = { $count ->
    [one] { $names } ya está en esta memoria. El nuevo Luft puede ocupar su lugar.
   *[other] { $names } ya están en esta memoria. El nuevo Luft puede ocupar su lugar.
}
stick-keep = { $count ->
    [one] Conservar ambos
   *[other] Conservar todos
}
stick-replace = Sustituir
stick-full-title = No hay sitio para Luft
stick-full-description = Luft necesita { $needed } y en esta memoria hay { $free } libres. Haz sitio en ella, o bórrala y conviértela en una memoria de Luft.
stick-erase-title = ¿Borrar { $name }?
stick-erase-description = Todo lo que hay en esta memoria de { $size } se borra y se sustituye por Luft. No se puede deshacer.
stick-erase-confirm = Borrar y crear la memoria
stick-done-title = Tu memoria USB de Luft está lista
stick-done-ventoy-title = Luft está en tu memoria Ventoy
stick-done-take-out = Ya puedes retirarla.
stick-done-eject = Expúlsala antes de retirarla.
stick-done-start = Para arrancar desde ella, conéctala y elígela en el menú de arranque del ordenador, que se abre con una tecla como F12, F8 o Esc justo después de encenderlo.
stick-done-ventoy-key = Con Secure Boot activado, Ventoy pide una vez registrar su propia clave la primera vez que arranca.
stick-done = Listo
stick-done-another = Crear otra
