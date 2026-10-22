## Errors shown in Install Luft and first-run setup

installer-not-allowed = No tienes permiso para hacer esto.
installer-stopped = El instalador se ha detenido de forma inesperada.
installer-request-invalid = La solicitud no es válida: { $error }
installer-settings-invalid = Los ajustes no son válidos: { $error }
installer-busy = Luft ya se está instalando.
installer-account-exists = La cuenta ya se había creado.

## Choosing what to install

installer-no-image = No hay ninguna imagen { $variant } que instalar.
installer-write-failed = No se ha podido escribir { $path }

## Checking the destination

installer-drive-gone = Ese disco ya no está conectado.
installer-drive-unusable = Luft no se puede instalar en ese disco.
installer-system-gone = Ese sistema ya no está.
installer-system-unreplaceable = Luft todavía no puede sustituir { $system }.
installer-drive-running = Luft se está ejecutando desde ese disco ahora mismo, así que no se puede borrar.
installer-windows-unshrinkable = No se puede reducir el Windows de ese disco.
installer-size-wont-fit = Ese tamaño no cabe junto a Windows.
installer-space-gone = Ese espacio libre ya no está.
installer-space-too-small = Ese espacio libre es demasiado pequeño para Luft.

## Account and regional settings

installer-user-name-invalid = Ese nombre de usuario no se puede usar.
installer-full-name-invalid = Un nombre no puede contener dos puntos, comas ni saltos de línea.
installer-password-missing = Elige una contraseña.
installer-account-not-saved = No se ha guardado la cuenta nueva
installer-account-missing = Falta la cuenta nueva
installer-regional-invalid = Esos ajustes regionales no son válidos.
installer-unknown-zone = El sistema nuevo no conoce la zona horaria { $zone }.

## Installing

installer-esp-partition-failed = No se ha podido crear la partición del sistema EFI
installer-startup-partition-failed = No se ha podido crear la partición para los archivos de arranque de Luft
installer-root-partition-failed = No se ha podido crear la partición para Luft
installer-shrink-failed = No se ha podido reducir Windows
installer-no-esp = El disco no tiene partición del sistema EFI
installer-no-root = No se ha creado ninguna partición para Luft
installer-copy-failed = No se ha podido copiar Luft
installer-no-deployment = El sistema nuevo no tiene ningún despliegue
installer-deployment-unnamed = El despliegue del sistema nuevo no tiene nombre
installer-deployment-unopened = No se ha podido abrir el sistema nuevo
installer-boot-menu-failed = No se ha podido poner el menú de arranque de Luft en la partición del sistema EFI
installer-key-queue-failed = No se ha podido preparar la clave de Secure Boot de Luft para el próximo reinicio

## Replacing a Linux system

installer-leftovers-failed = No se ha podido limpiar lo que dejó un intento anterior
installer-default-failed = No se ha podido hacer que Luft sea el sistema que arranca
installer-relabel-failed = No se han podido etiquetar tus archivos para Luft
installer-set-aside-failed = No se ha podido apartar el sistema anterior

## Things packed with Meet Luft

installer-box-unopened = No se ha podido abrir la caja de mudanza
installer-box-no-list = La caja de mudanza no tiene una lista de lo que contiene
installer-unpack-failed = No se ha podido desempaquetar { $path }
installer-wallpaper-unnamed = El fondo de pantalla no tiene nombre
