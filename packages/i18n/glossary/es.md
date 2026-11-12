# Spanish

What is particular to Spanish, on top of [the rules every language shares](common.md). The agreed terms are in [es.tbx](es.tbx).

Luft's Spanish is the Spanish of Spain, kept neutral wherever that costs nothing: no vosotros, no regional slang, words a reader in Mexico or Argentina understands too. Where Spain has its own everyday word, such as ordenador or ratón, use it.

## Address

Address the reader as tú, as Windows and macOS do: «Puedes cambiarlo más tarde en Configuración». Never usted or vosotros. Instructions take the imperative with tú: «Pulsa Super+Tab para ver todas las ventanas». Pulsar is for keys, hacer clic for the mouse, tocar for touch. What just happened takes the present perfect: «No se ha podido guardar».

## Buttons and labels

- Buttons and menu items take the infinitive: «Guardar», «Abrir», «Reiniciar», «Anclar a la barra de tareas».
- Status words agree with what they describe: «Clave guardada», «Conectado» for a device.
- «App» only where «aplicación» really doesn't fit.
- Days, months and languages are lowercase. A label named in a sentence keeps its capital and needs no quotation marks: «activa No molestar».

## Typography

- Quotation marks «…», with “…” inside them. Questions open with ¿.
- The ellipsis is attached to the word before it.
- Avoid dashes in short interface text. In longer text, an aside takes the raya «—» attached to the words it encloses: «el disco —si está cifrado— pide la clave».
- Percent signs and units take a no-break space: «57 %», «4,5 W».
- Keys follow Spanish keyboards: Ctrl, Alt, Mayús, Intro, Esc, Supr, Insert, Inicio, Fin, Re Pág, Av Pág, Impr Pant, Retroceso, Espacio.
- Write «correo electrónico», «internet» in lowercase, and «en línea».

## Names

- Settings, Disks and Install Luft are Configuración, Discos and Instalar Luft.
- Start is Inicio, as in Windows: «el menú Inicio», «busca en Inicio».
- App names don't inflect and take no article on their own: «Rover está abierto». When a sentence needs an article, add the kind of thing: «la aplicación Rover».

## Plurals

Write `one` and `other`. `many`, for exact millions, never happens in Luft.

```ftl
windows-open = { $count ->
    [one] { $count } ventana abierta
   *[other] { $count } ventanas abiertas
}
```

## Words

| English | Spanish | Not | Why |
| --- | --- | --- | --- |
| you | tú | usted | Windows and macOS; usted feels distant on a personal computer |
| Settings | Configuración | Ajustes | Windows and GNOME; ajustes stays for a set of options |
| board | tablero | pizarra, lienzo | A board you lay things out on; lienzo is the canvas inside it |
| All windows | Todas las ventanas | Vista de tareas | What Luft calls the task view |
| Quick settings | Configuración rápida | Ajustes rápidos | Windows, and consistent with Configuración |
| snap, snap layout | acoplar, diseño de acoplamiento | ajustar, anclar | Windows' words; anclar is pin |
| tray | bandeja del sistema | área de notificación | The name people know; it holds apps |
| workspace | área de trabajo | escritorio virtual | GNOME's word; escritorio is the desktop |
| wallpaper | fondo de pantalla | fondo de escritorio | Windows and macOS |
| accent color | color de énfasis | color de acento | Windows' word |
| suspend, sleep | suspender | dormir, reposo | Windows and GNOME |
| Keyring | Llavero | Depósito de claves | macOS, and the plain word |
| encryption | cifrado | encriptación | The standard term; Windows' word |
| keyboard shortcut | atajo de teclado | método abreviado | Shorter and what people say |
| computer | ordenador | equipo, computadora | Spain's everyday word |
| file | archivo | fichero | Windows, macOS and GNOME |
| remove, delete | quitar, eliminar | borrar | Keeps taking out apart from destroying |
| clear, erase | borrar | quitar, eliminar | Windows' word for clearing history and erasing a disk |
| passphrase | frase de contraseña | contraseña | Microsoft's term; apart from the account password |
| input source | fuente de entrada | origen de entrada | GNOME's word |
| home folder | carpeta personal | carpeta de inicio | GNOME's word; Inicio is the Start menu |
| metered connection | conexión de uso medido | conexión medida | Windows' word |
| driver | controlador | driver | Windows' word |
| plugged in | enchufado | conectado | Says plainly that it's on mains power |
| banner (notification) | aviso | banner | Plain Spanish; banners stays a search word |
| tether (Bluetooth) | conexión compartida | anclaje | Anclar is pin |
| dwell click | clic al detener el puntero | clic por permanencia | Says what happens |
| touchpad, mouse | panel táctil, ratón | touchpad, mouse | Windows' word; Spain's word |
