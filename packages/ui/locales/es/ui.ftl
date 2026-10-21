## Window title bar buttons (screen-reader labels)

ui-window-minimize = Minimizar
ui-window-maximize = Maximizar
ui-window-close = Cerrar

## Text editing context menu

ui-edit-cut = Cortar
ui-edit-copy = Copiar
ui-edit-paste = Pegar
ui-edit-select-all = Seleccionar todo

## Form controls

ui-select-placeholder = Seleccionar
ui-password-show = Mostrar contraseña
ui-password-hide = Ocultar contraseña
ui-toast-dismiss = Descartar

## Media playback controls

ui-media-play = Reproducir
ui-media-pause = Pausar
ui-media-mute = Silenciar
ui-media-unmute = Activar sonido
ui-media-volume = Volumen
ui-media-position = Posición

## Pictures in documents

ui-remote-images-hidden = Las imágenes de internet están ocultas
ui-remote-images-show = Mostrar

## Splitting a drive between Windows and Luft

ui-split-space = Espacio para Luft
ui-split-windows-size = { $size }, { $used } en uso

## Recovery key

ui-recovery-key-label = Clave de recuperación { $key }
ui-recovery-key-save = Guardar en un archivo
ui-recovery-key-print = Imprimir
ui-recovery-key-copy = Copiar
ui-recovery-key-saved = Guardada
ui-recovery-key-printing = Enviada a la impresora
ui-recovery-key-copied = Copiada
ui-recovery-key-kept = He guardado mi clave de recuperación

## Fingerprints
## Each finger has a name used as a title (the message value) and a form used inside
## a sentence (.inline), like "Place your … on the sensor." Adjust the case of .inline
## to fit those sentences.

ui-finger-right-index = Índice derecho
    .inline = índice derecho
ui-finger-left-index = Índice izquierdo
    .inline = índice izquierdo
ui-finger-right-thumb = Pulgar derecho
    .inline = pulgar derecho
ui-finger-left-thumb = Pulgar izquierdo
    .inline = pulgar izquierdo
ui-finger-right-middle = Dedo corazón derecho
    .inline = dedo corazón derecho
ui-finger-left-middle = Dedo corazón izquierdo
    .inline = dedo corazón izquierdo
ui-finger-right-ring = Anular derecho
    .inline = anular derecho
ui-finger-left-ring = Anular izquierdo
    .inline = anular izquierdo
ui-finger-right-little = Meñique derecho
    .inline = meñique derecho
ui-finger-left-little = Meñique izquierdo
    .inline = meñique izquierdo

ui-fingerprint-place = Coloca el { $finger } en el sensor.
ui-fingerprint-swipe = Desliza el { $finger } por el sensor.
ui-fingerprint-stage-passed = Bien. Levanta el dedo y vuelve a colocarlo.
ui-fingerprint-stage-passed-swipe = Bien. Vuelve a deslizarlo.
ui-fingerprint-retry = No se ha leído bien. Vuelve a intentarlo.
ui-fingerprint-swipe-too-short = Desliza el dedo un poco más despacio.
ui-fingerprint-not-centered = Centra el dedo en el sensor.
ui-fingerprint-remove-and-retry = Levanta el dedo y vuelve a intentarlo.
ui-fingerprint-added = Huella añadida.
ui-fingerprint-full = El lector no tiene espacio para otra huella.
ui-fingerprint-disconnected = El lector de huellas ha dejado de responder. Vuelve a intentarlo en un momento.
ui-fingerprint-duplicate = El lector ya tiene guardado este dedo, probablemente desde Windows u otra cuenta. Usa otro dedo.
ui-fingerprint-failed = No se ha podido añadir esta huella. Vuelve a intentarlo.

## Sizes and times

ui-time-just-now = ahora mismo
ui-power-watts = { $watts } W

## Dialog buttons

ui-dialog-cancel = Cancelar
ui-dialog-close = Cerrar
ui-dialog-back = Atrás
ui-dialog-continue = Continuar
ui-dialog-done = Listo

## Passphrases

ui-passphrase-field = Frase de contraseña
ui-passphrase-confirm = Confirmar
ui-passphrase-type-again = Vuelve a escribirlo
ui-passphrase-length = { $min ->
    [one] Al menos { $min } carácter
   *[other] Al menos { $min } caracteres
}
ui-passphrase-mismatch = Las frases de contraseña no coinciden

## Encryption

ui-encryption-checking = Comprobando…
