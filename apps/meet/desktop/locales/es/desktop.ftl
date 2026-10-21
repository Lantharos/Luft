## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = Procesador Intel o AMD de 64 bits
check-processor-x64-detail = Luft funciona en él.
check-processor-arm = Procesador Arm
check-processor-arm-detail = Por ahora, Luft solo funciona en procesadores Intel y AMD.
check-processor-32-bit-windows = Windows de 32 bits
check-processor-32-bit-system = Sistema de 32 bits
check-processor-32-bit-detail = Luft necesita un procesador Intel o AMD de 64 bits.
check-startup-uefi = Arranca con UEFI
check-startup-uefi-windows = Luft arranca de la misma forma moderna.
check-startup-uefi-linux = Luft añade su propia entrada de arranque, y { $system } sigue arrancando como ahora.
check-startup-bios = Arranca en modo BIOS heredado
check-startup-bios-windows = Luft necesita UEFI. Windows puede cambiar con MBR2GPT, y después se puede activar UEFI en la configuración del firmware.
check-startup-bios-linux = Luft necesita UEFI. Actívalo en la configuración del firmware, también para el sistema que ya tienes, y vuelve a comprobarlo.
check-startup-mbr = El disco usa una tabla de particiones antigua
check-startup-mbr-windows = Luft necesita un disco GPT. Windows puede convertirlo con MBR2GPT sin perder archivos.
check-startup-mbr-linux = Luft necesita un disco GPT para arrancar.
check-startup-no-esp = No hay partición del sistema EFI
check-startup-no-esp-detail = Luft pone sus archivos de arranque junto a los que ya hay en la partición del sistema EFI, y no hay ninguna.
check-startup-esp-full = La partición del sistema EFI está llena
check-startup-esp-full-detail = Luft necesita { $size } MB en ella para sus archivos de arranque. Normalmente, el espacio lo ocupan núcleos o entradas de arranque antiguos.
check-folder-fine = No se cambian las particiones
check-folder-fine-detail = Luft se guarda como un archivo en tu disco { $filesystem } y arranca desde ahí.
check-folder-encrypted = Tus archivos están en un disco cifrado
check-folder-encrypted-detail = Luft todavía no puede arrancar desde un disco cifrado. Usa una memoria USB para probarlo.
check-folder-combined = Tus archivos ocupan más de una partición
check-folder-combined-detail = Luft todavía no puede arrancar desde LVM ni RAID. Usa una memoria USB para probarlo.
check-folder-filesystem = Luft no puede arrancar desde { $filesystem }
check-folder-filesystem-detail = Arranca desde discos ext4, btrfs y XFS. Usa una memoria USB para probarlo.
check-space-free = { $size } GB libres
check-space-free-linux = Luft ocupa unos { $size } GB mientras lo pruebas.
check-space-up-to = Hasta { $size } GB para Luft
check-space-up-to-detail = Windows conserva sus archivos y espacio para crecer.
check-space-free-already = Ya hay { $size } GB libres, así que Windows cede menos.
check-space-other-drive = Hay sitio para Luft en { $drive }.
check-space-erase-drive = Hay sitio para Luft en { $drive }, una vez borrado ese disco.
check-space-short = No hay suficiente espacio libre
check-space-short-windows = Luft necesita unos { $needed } GB que Windows pueda ceder. Libera { $missing } GB en Windows, por ejemplo con Liberador de espacio en disco, y vuelve a comprobarlo.
check-space-short-linux = Luft necesita unos { $needed } GB para arrancar. Libera { $missing } GB y vuelve a comprobarlo.
check-system-replaceable = Luft puede ocupar su lugar y conservar tus archivos, tu cuenta y tus ajustes.
check-system-single = Tus archivos comparten partición con el sistema, así que todavía no se puede sustituir conservándolos. Sí puedes probar e instalar Luft.
check-system-encrypted = Está cifrado, así que todavía no se puede sustituir conservando tus archivos.
check-system-unknown = Su disco está organizado de una forma que Luft todavía no puede sustituir conservando tus archivos.
check-encryption-off = Windows no está cifrado
check-encryption-off-detail = Instalar Luft puede leer sus ajustes y tus dispositivos Bluetooth.
check-encryption-on = Windows está cifrado con BitLocker
check-encryption-on-detail = No pasa nada. Windows hace el sitio por sí mismo, y Meet Luft trae lo que Luft no puede leer de un disco bloqueado. Ten a mano tu clave de recuperación, por si acaso.
check-encryption-changing = BitLocker todavía está cifrando o descifrando
check-encryption-changing-detail = Espera a que Windows termine y vuelve después. Puedes ver cuánto le falta en Configuración, en Cifrado de dispositivo.
check-fast-startup-on = Inicio rápido está activado
check-fast-startup-on-detail = Windows hiberna en lugar de apagarse, y eso mantiene su disco bloqueado. Meet Luft se ofrece a desactivarlo antes de instalar.
check-fast-startup-off = Inicio rápido está desactivado
check-fast-startup-off-detail = Windows se apaga del todo.
check-secure-boot-on = Secure Boot está activado
check-secure-boot-on-detail = Puede seguir activado. Luft pide una vez, en una pantalla azul, añadir su clave.
check-secure-boot-off = Secure Boot está desactivado
check-secure-boot-off-detail = Luft funciona sin él, aunque los juegos con antitrampas lo necesitan. { $turningOn }
check-secure-boot-restart-into = Meet Luft puede reiniciar en la configuración del firmware, donde está en { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft puede reiniciar en la configuración del firmware, donde suele estar en Security o Boot.
check-secure-boot-turn-on = Para activarlo, reinicia y pulsa { $key } cuando aparezca el logotipo de { $maker }, y luego ve a { $place }.
check-secure-boot-turn-on-anywhere = Para activarlo, abre la configuración del firmware mientras arranca el ordenador y busca en Security o Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security y luego Secure Boot
check-firmware-place-boot-configuration = Boot Configuration y luego Secure Boot
check-firmware-place-security-or-advanced = Security o Advanced, y luego Secure Boot Configuration
check-firmware-place-security-or-boot = Security o Boot, y luego Secure Boot
check-firmware-place-boot = Boot y luego Secure Boot
check-firmware-place-settings = Settings, luego Security y luego Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 en un ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 o Supr
check-firmware-key-delete = Supr
check-firmware-key-volume-up = subir volumen

## More of the computer's hardware

check-tpm-detail = Un Luft cifrado puede desbloquearse solo al arrancar el ordenador.
check-tpm-missing = Sin TPM 2.0
check-tpm-missing-detail = Si cifras Luft, te pedirá una frase de contraseña cada vez que arranque.
check-graphics = Gráfica
check-graphics-detail = Funciona sin hacer nada.
check-graphics-nvidia = Luft se instala con el controlador propio de NVIDIA.
check-wifi-missing = Sin Wi-Fi
check-wifi-missing-detail = Usa un cable de red en Luft, o ninguna conexión.
check-wifi-detail = Funciona en Luft.
check-wifi-broadcom = Algunos chips Wi-Fi de Broadcom necesitan un controlador que Luft no incluye. Ten a mano un cable de red o un móvil para compartir conexión por USB.
check-start-entries = { $count ->
    [one] Una entrada de arranque antigua
   *[other] { $count } entradas de arranque antiguas
}
check-start-entries-detail = { $count ->
    [one] { $names } apunta a un sistema que ya no está en este PC. Se puede quitar.
   *[other] { $names } apuntan a sistemas que ya no están en este PC. Se pueden quitar.
}
check-download-unavailable = Ahora mismo no se puede descargar Luft
check-download-unavailable-detail = Meet Luft descarga unos 3 GB. Comprueba que tienes conexión y vuelve a comprobarlo, o usa una ISO de Luft que ya tengas.

## Choosing a Luft ISO file

iso-dialog-title = Elegir una ISO de Luft
iso-dialog-filter = ISO de Luft

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Registros de Luft { $name }
logs-no-desktop = Meet Luft no ha encontrado tu escritorio
logs-not-saved = Meet Luft no ha podido guardar los registros de la prueba de Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = El asistente de Meet Luft no se ha iniciado: { $error }
helper-not-allowed = Meet Luft no ha recibido permiso para trabajar en el disco
helper-stopped = El asistente de Meet Luft se ha detenido
helper-stopped-because = El asistente de Meet Luft se ha detenido: { $error }
helper-pipe-failed = Meet Luft no ha podido comunicarse con su asistente: { $error }
helper-pipe-hijacked = Algo que no es el asistente de Meet Luft ha abierto { $pipe }
helper-record-not-saved = Meet Luft no ha podido anotar lo que ha creado: { $error }
helper-no-room-yet = Primero haz sitio para Luft.
helper-not-ready-linux = Primero prepara Luft.
helper-not-ready-to-start-windows = Luft todavía no está listo para arrancar. Primero hazle sitio.
helper-not-ready-to-start-linux = Luft todavía no está listo para arrancar. Primero prepáralo.
helper-update-unfinished = No se ha podido terminar de actualizar Luft. Primero vuelve a actualizarlo.
helper-room-too-small = Luft necesita más espacio.
helper-room-shortfall = Windows puede ceder { $available } GB y Luft necesita { $needed } GB.
helper-gap-shortfall = Ese espacio tiene { $available } GB y Luft necesita { $needed } GB.
helper-place-gone = Ese espacio ya no está libre. Vuelve a comprobarlo para ver dónde cabe Luft.
helper-box-shortfall = Windows puede ceder { $available } GB más y lo elegido necesita { $needed } GB.
helper-box-room-shortfall = El espacio de Luft puede ceder { $available } GB y lo elegido necesita { $needed } GB.
helper-bluetooth-unreadable = No se han podido abrir los ajustes de Bluetooth de Windows
helper-registry-not-opened = No se ha podido abrir { $key }: { $error }
helper-registry-not-changed = No se ha podido cambiar { $value }: { $error }
helper-registry-not-saved = No se ha podido guardar { $file }: { $error }
helper-restart-failed = El ordenador no se ha reiniciado
helper-windows-restart-failed = Windows no se ha reiniciado: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Este PC no arranca con UEFI
firmware-variable-unreadable = No se ha podido leer { $name } del firmware: { $error }
firmware-variable-not-saved = No se ha podido guardar { $name } en el firmware: { $error }
firmware-entries-full = El firmware no tiene sitio para otra entrada de arranque
firmware-entry-kept = Windows ha conservado la entrada de arranque { $entry }

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = No se han podido enumerar los discos: { $error }
drive-of-path-unknown = No se ha podido saber qué disco contiene { $path }
drive-windows-folder-missing = No se ha encontrado la carpeta de Windows
drive-windows-drive-missing = No se ha encontrado el disco de Windows
drive-windows-drive-missing-because = No se ha encontrado el disco de Windows: { $error }
drive-windows-partition-missing = No se ha encontrado la partición de Windows
drive-volume-missing = No se ha encontrado el volumen { $path }
drive-storage-error = { $what } (error de almacenamiento de Windows { $code })
drive-shrink-size-unknown = Windows no ha podido saber cuánto puede reducirse su partición
drive-resize-failed = Windows no ha podido cambiar el tamaño de su partición
drive-create-failed = Windows no ha podido crear una partición para Luft
drive-hide-failed = Windows no ha podido ocultar la nueva partición en el Explorador de archivos
drive-format-failed = Windows no ha podido formatear la nueva partición
drive-remove-failed = Windows no ha podido quitar una de las particiones de Luft
drive-new-partition-missing = No se ha encontrado la nueva partición
drive-new-partition-no-volume = La nueva partición no tiene volumen
drive-start-no-guid = La partición de arranque no tiene GUID
drive-live-no-guid = La partición de Luft no tiene GUID
drive-box-no-guid = La caja de mudanza no tiene GUID
drive-guid-unreadable = No se puede leer el GUID de la partición
drive-not-gpt = La tabla de particiones del disco no es GPT
drive-start-no-volume = La partición de arranque no tiene volumen
drive-live-no-volume = La partición de Luft no tiene volumen
drive-new-live-no-volume = La nueva partición de Luft no tiene volumen
drive-partitions-not-noted = Las particiones de Luft no figuran en las notas de Meet Luft
drive-partitions-gone = Las particiones de Luft han desaparecido
drive-partition-gone = Ha desaparecido una partición
drive-gone = Ha desaparecido un disco
drive-erase-failed = Windows no ha podido borrar el disco
drive-erased-no-room = El disco borrado no tiene sitio para Luft
drive-start-partition-foreign = La partición de arranque de Luft no la ha creado Meet Luft
drive-start-partition-gone = La partición de arranque de Luft ya no está
drive-start-partition-not-listed = La partición de arranque de Luft no está en la tabla de particiones
drive-no-esp = Este ordenador no tiene partición del sistema EFI
drive-esp-full = La partición del sistema EFI está demasiado llena para los archivos de arranque de Luft.
drive-esp-not-opened = No se ha podido abrir la partición del sistema EFI
drive-esp-file-unreadable = No se puede leer { $file } de la partición del sistema EFI
drive-esp-no-drive = La partición del sistema EFI no tiene disco
drive-esp-no-guid = La partición del sistema EFI no tiene GUID
drive-no-uuid = El disco donde se guarda Luft no tiene UUID
drive-folder-unreadable = Luft no puede arrancar desde el disco donde están tus archivos.
drive-folder-not-startable = No se puede arrancar desde { $folder }

## Errors while changing Luft once it's installed

luft-gone = Luft ya no está en este PC
luft-not-resizable = Ahora mismo no se puede cambiar el tamaño de Luft desde Windows
luft-size-not-allowed = Luft no puede tener ese tamaño
luft-space-promised = Ese espacio está reservado para Luft. Cancela antes el cambio.
luft-no-start-entry = No se ha encontrado la entrada de arranque de Luft

## Errors while getting Luft

live-no-home-folder = No hay ninguna carpeta personal donde guardar Luft
live-no-app-data-folder = No hay ninguna carpeta local de datos de aplicaciones donde guardar Luft
live-pointer-unreadable = No se puede leer cuál es el Luft más reciente
live-not-published = Luft no está publicado ahí
live-checksum-unreadable = No se puede leer el archivo de suma de comprobación
live-checksum-not-read = No se ha podido leer la suma de comprobación de Luft: { $error }
live-download-damaged = La descarga se ha dañado por el camino. Vuelve a intentarlo.
live-download-incomplete = Al Luft descargado le falta { $file }
live-download-not-resumable = El servidor no puede continuar la descarga
live-not-signed = { $iso } no está firmado
live-signature-unreadable = No se puede leer la firma de { $iso }
live-signature-wrong-key = { $iso } no está firmado por Lantharos
live-signature-other-iso = La firma es de { $signed }, no de { $iso }
live-iso-out-of-order = Los archivos de la ISO no están en un orden que Meet Luft pueda leer
live-iso-not-iso = Esto no es una imagen ISO
live-iso-no-root = La ISO no tiene carpeta raíz
live-iso-no-joliet = La ISO no tiene nombres Joliet
live-not-removed = No se ha podido quitar { $path }: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = La memoria ya no está. Vuelve a conectarla y elígela otra vez.
stick-too-small = Luft no cabe en esta memoria. Usa una de 4 GB o más.
stick-damaged = La ISO no coincide con su suma de comprobación. Puede que se haya dañado por el camino.
stick-read-back-differs = Lo leído de la memoria no coincide con lo que se ha grabado. Puede estar desgastada, así que prueba con otra.
stick-download-unavailable = Ahora mismo no se puede descargar Luft: { $error }
stick-download-failed = No se ha podido descargar Luft: { $error }
stick-checksum-unreadable = No se puede leer la suma de comprobación de la ISO: { $error }
stick-file-unreadable = No se puede leer { $path }: { $error }
stick-iso-unreadable = No se puede leer la ISO: { $error }
stick-iso-no-name = La ISO no tiene nombre
stick-iso-ended-early = La ISO se ha terminado antes de tiempo
stick-iso-already-there = { $name } ya está en la memoria.
stick-no-room = No hay sitio para Luft en la memoria. Primero libera { $size } MB en ella.
stick-older-not-removed = No se ha podido quitar el Luft anterior: { $error }
stick-copy-stopped = La copia de Luft en la memoria se ha detenido: { $error }
stick-not-opened = No se ha podido abrir la memoria: { $error }
stick-write-stopped = La grabación en la memoria se ha detenido: { $error }
stick-not-synced = La memoria no ha guardado todo: { $error }
stick-read-back-failed = No se ha podido volver a leer la memoria: { $error }
stick-in-use = La memoria todavía está en uso: { $error }
stick-device-in-use = { $device } todavía está en uso: { $error }
stick-volume-not-opened = No se ha podido abrir el volumen de la memoria: { $error }
stick-volume-in-use = La memoria todavía está en uso. Cierra lo que tenga archivos abiertos en ella y vuelve a intentarlo ({ $error })
stick-not-dismounted = Windows no ha podido soltar la memoria: { $error }
stick-not-cleared = Windows no ha podido vaciar la memoria: { $error }
stick-not-refreshed = Windows no ha podido volver a examinar la memoria: { $error }
stick-not-ventoy = Esta memoria ya no usa Ventoy.
stick-ventoy-not-opened = No se ha podido abrir la partición de Ventoy: { $error }
stick-ventoy-not-opened-windows = Windows no puede abrir la partición de Ventoy
stick-udisks-missing = Meet Luft necesita UDisks para usar la memoria: { $error }
