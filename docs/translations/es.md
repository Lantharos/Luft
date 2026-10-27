# Spanish style guide

How Luft speaks Spanish. The [glossary](../../packages/i18n/glossary/es.tbx) has the agreed terms; Weblate shows them next to every string.

Luft's Spanish is the Spanish of Spain, kept neutral wherever that costs nothing: no vosotros, no regional slang, and words a reader in Mexico or Argentina understands too. Where Spain has its own everyday word, such as ordenador or ratón, use it.

## Address and tone

- Address the reader as **tú**, as Windows and macOS do in Spanish: «Puedes cambiarlo más tarde en Configuración». GNOME and KDE still use usted, but tú is what most people now see on their computers and phones. Never usted, never vosotros.
- When a sentence reads well without a person, leave it out: «No hay notificaciones» for “You have no notifications”, «Las actualizaciones se instalan al reiniciar».
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as «Por favor» in every hint, no marketing words.
- Say what happens, not how it works inside.
- Instructions in running text use the imperative with tú: «Pulsa Super+Tab para ver todas las ventanas», «Vuelve a intentarlo». Use pulsar for keys, hacer clic for the mouse, tocar for touch.
- Prefer the present perfect for what just happened, as people in Spain say it: «No se ha podido guardar», «El lector ha dejado de responder».

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as in Windows, macOS and GNOME: «Guardar», «Abrir», «Reiniciar», «Anclar a la barra de tareas».
- Switches and settings are nouns or short phrases: «Luz nocturna», «Mostrar segundos».
- Headings and page names are nouns: «Notificaciones», «Privacidad».
- Status words agree with what they describe: «Clave guardada», «Copiada» for a key, «Conectado» for a device.
- Keep labels short. Spanish runs about a quarter longer than English; if a button clips, look for a shorter word before abbreviating. «App» is allowed only where «aplicación» truly doesn't fit.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. «Configuración rápida», not «Configuración Rápida». Days, months and languages are lowercase. In running text, Luft's parts are ordinary nouns: «la barra de tareas», «el tablero». Names of apps and of the Inicio menu keep their capital, and so does a label quoted in a sentence, which needs no quotation marks: «activa No molestar».

## Typography

- Quotation marks: «…», and “…” inside them.
- Questions open with ¿. Exclamations aren't used.
- Ellipsis: one character, «…», attached to the word before it: «Cargando…».
- Dashes: avoid them in short interface text. In longer text use the raya «—» for an aside, attached to the words it encloses: «el disco —si está cifrado— pide la clave». Never a hyphen in place of a dash.
- Percent sign and units take a no-break space after the number: «57 %», «4,5 W».
- Key names follow Spanish keyboards: Ctrl, Alt, Mayús, Intro, Esc, Supr, Insert, Inicio, Fin, Re Pág, Av Pág, Impr Pant, Retroceso, Espacio. These come from translatable key names, so translate them where they appear.
- Write «correo electrónico», «internet» (lowercase), «en línea» rather than online.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Configuración, Discos, Instalar Luft.
- The Start menu is **Inicio**, as in Windows: «el menú Inicio», «busca en Inicio».
- App names don't inflect and take no article on their own: «Rover está abierto», «abrir con Magpie». When a sentence needs an article or gender, add the kind of thing: «la aplicación Rover».

## Plurals

Spanish has `one` (1), `many` (exact multiples of a million, like 1 000 000) and `other` (everything else, including 0 and decimals). Write `one` and `other`; `many` is only needed where a million reads differently, which in Luft it never does. Always keep `{ $count }` in every variant, and `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } notificación
   *[other] { $count } notificaciones
}
windows-open = { $count ->
    [one] { $count } ventana abierta
   *[other] { $count } ventanas abiertas
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] No hay notificaciones`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that prepositions and articles still fit: «Última comprobación: { $date }».

## Decisions

| English | Spanish | Instead of | Why |
| --- | --- | --- | --- |
| you | tú | usted | Windows and macOS; usted feels distant on a personal computer |
| Settings | Configuración | Ajustes, Preferencias del sistema | Windows and GNOME; ajustes stays for a set of options |
| Start | Inicio | Start | Windows' word, and it reads naturally in sentences |
| board | tablero | pizarra, lienzo | A board you lay things out on; lienzo is the canvas inside it |
| All windows | Todas las ventanas | Vista de tareas | That's what Luft calls the task view |
| Quick settings | Configuración rápida | Ajustes rápidos | Windows' word, consistent with Configuración |
| snap, snap layout | acoplar, diseño de acoplamiento | ajustar, anclar | Windows' words; anclar is pin |
| tray | bandeja del sistema | área de notificación | The name people know; it holds apps, not notifications |
| workspace | área de trabajo | escritorio virtual | GNOME's word; escritorio is the area behind the windows |
| wallpaper | fondo de pantalla | fondo de escritorio | Windows and macOS |
| accent color | color de énfasis | color de acento | Windows' word |
| suspend, sleep | suspender | dormir, reposo | Windows and GNOME |
| passkey | llave de acceso | clave de acceso | Apple and Google; keeps clave for the recovery key |
| Keyring | Llavero | Depósito de claves | macOS, and the plain word |
| encryption | cifrado | encriptación | The standard Spanish term, Windows' word |
| keyboard shortcut | atajo de teclado | método abreviado | Shorter and what people say |
| app | aplicación | app, programa | Windows and GNOME |
| computer | ordenador | equipo, computadora | Spain's everyday word |
| file | archivo | fichero | Windows, macOS and GNOME |
| remove, delete | quitar, eliminar | borrar | Keeps taking out apart from destroying |
| clear, erase | borrar | quitar, eliminar | Windows' word for clearing notifications and history, and for erasing a disk |
| passphrase | frase de contraseña | contraseña | Microsoft's term; keeps it apart from the account password |
| input source | fuente de entrada | origen de entrada | GNOME's word |
| home folder | carpeta personal | carpeta de inicio | GNOME's word; Inicio is the Start menu |
| metered connection | conexión de uso medido | conexión medida | Windows' word |
| driver | controlador | driver | Windows' word |
| plugged in | enchufado | conectado | Says plainly that it's on mains power |
| banner (notification) | aviso | banner | Plain Spanish; banners stays in the search keywords |
| tether (Bluetooth) | conexión compartida | anclaje | Anclar is pin; Android shares a connection |
| dwell click | clic al detener el puntero | clic por permanencia | Says what happens |
| touchpad | panel táctil | touchpad | Windows' word |
| mouse | ratón | mouse | Spain's word |
| Wi-Fi | Wi-Fi | wifi | How Windows and macOS write it |
