# Catalan

What is particular to Catalan, on top of [the rules every language shares](common.md). The agreed terms are in [ca.tbx](ca.tbx).

Luft's Catalan is the central standard, following Softcatalà's style guide and the terminology of TERMCAT and Softcatalà, which GNOME, KDE, LibreOffice, Mozilla, Microsoft and Apple largely share.

## Address

Address the reader as vós, as Softcatalà, GNOME, KDE, Mozilla and LibreOffice do: «Podeu canviar-ho més endavant a la Configuració.» Windows and macOS moved to tu, but vós is what the free desktops people use alongside Luft speak, and it reads polite without being stiff. Never tu in running text, never vostè. Leave the person out when the sentence reads well without: «No hi ha notificacions».

Instructions take the imperative with vós: «Premeu Super+Tab per veure totes les finestres», «Torneu-ho a provar». Prémer is for keys, fer clic for the mouse, tocar for touch. What just happened takes the perfect: «No s’ha pogut desar».

## Buttons and labels

- Buttons and menu items take the imperative, second person singular, as Softcatalà, GNOME, KDE and Microsoft do: «Desa», «Obre», «Cancel·la», «Fixa a la barra de tasques», «Torna-ho a provar». It's the command the reader gives, so it sits fine next to vós in running text.
- Titles of dialogs and setup steps that ask the reader to do something use vós, like running text: «Trieu un disc», «Afegiu un PIN».
- Status words agree with what they describe: «Desada», «Copiada» for a key, «Connectat» for a device.
- «App» only where «aplicació» really doesn't fit.
- Days, months and languages are lowercase. Names of apps and of the Inici menu keep their capital, and so does a label named in a sentence, which needs no quotation marks: «activeu No molestis».

## Typography

- The apostrophe is always ’: «l’aplicació», «s’ha desat». Apostrophize before a vowel or h as usual, but not before letter names or a stressed i/u sound that isn't a vowel: «el Wi-Fi».
- The geminated l is always l·l with the middle dot U+00B7: «instal·lar», «cancel·la».
- Quotation marks «…», with “…” inside them.
- The ellipsis is attached to the word before it.
- Avoid dashes in short interface text. In longer text an aside takes the em dash, attached to the words it encloses. Never a hyphen in place of a dash.
- Percent signs and units take a no-break space: «57 %», «4,5 W».
- Keys follow Catalan software and Spanish-layout keyboards: Ctrl, Alt, Maj, Retorn, Esc, Supr, Insert, Inici, Fi, Re Pàg, Av Pàg, Impr Pant, Retrocés, Espai.
- Write «correu electrònic», «internet» in lowercase, and «en línia».

## Names

- Settings, Disks and Install Luft are Configuració, Discs and Instal·la Luft.
- Start is Inici, as in Catalan Windows: «el menú Inici», «cerqueu a Inici».
- The wallpaper folder keeps its English name on disk: «la carpeta Wallpapers, dins d’Imatges».
- App names don't inflect and take no article on their own: «Rover és obert», «obre amb Magpie». When a sentence needs an article or gender: «l’aplicació Rover». Luft never takes an article: «instal·lar Luft».

## Plurals

Write `one` and `other`. `many`, for exact millions, never happens in Luft.

```ftl
windows-open = { $count ->
    [one] { $count } finestra oberta
   *[other] { $count } finestres obertes
}
```

## Words

| English | Catalan | Not | Why |
| --- | --- | --- | --- |
| Settings | Configuració | Paràmetres, Arranjament | Windows and Apple; paràmetres stays for a set of options |
| board | tauler | pissarra, llenç | A board you lay things out on; llenç is the canvas inside it |
| All windows | Totes les finestres | Visualització de tasques | What Luft calls the task view |
| Quick settings | Configuració ràpida | Paràmetres ràpids | Windows, and consistent with Configuració |
| snap, snap layout | ajustar, disposició d’ajust | acoblar, ancorar | Windows' verb; fixar is pin |
| tray | safata del sistema | àrea de notificació | The name people know; it holds apps |
| workspace | espai de treball | escriptori virtual | GNOME's word; escriptori is the desktop |
| wallpaper | fons de pantalla | fons d’escriptori | Windows and Apple |
| accent color | color d’èmfasi | color d’accent | Windows' word |
| save | desar | guardar | Softcatalà and every Catalan system; guardar is keep |
| remove, delete | treure, suprimir | eliminar, esborrar | Keeps taking out apart from destroying |
| sign in, sign out | iniciar la sessió, tancar la sessió | entrar, sortir | Softcatalà, Windows and GNOME |
| suspend, sleep | suspendre | dormir, repòs | Softcatalà and GNOME |
| Language & Region | Llengua i regió | Idioma i regió | Softcatalà prefers llengua; idioma is a search word |
| About | Quant a | Informació | Softcatalà, GNOME and KDE |
| passkey | clau d’accés | passkey | Apple and Google |
| Keyring | Clauer | Anell de claus | GNOME and macOS |
| clipboard | porta-retalls | porta-papers | Softcatalà and Windows |
| privacy | privadesa | privacitat | TERMCAT and Windows |
| encryption | xifratge | encriptació | TERMCAT, Softcatalà and Windows |
| firmware | microprogramari | firmware | TERMCAT, GNOME and Windows |
| startup | arrencada | inici | Softcatalà; keeps Inici for the menu |
| file | fitxer | arxiu | Softcatalà and every Catalan system |
| keyboard shortcut | drecera de teclat | tecla de drecera | Windows and GNOME |
| touchpad | ratolí tàctil | touchpad, tauleta tàctil | Windows and GNOME |
| computer | ordinador | equip | The everyday word |
| passphrase | frase de pas | contrasenya de xifratge | Softcatalà and GNOME |
| pair (Bluetooth) | vincular | aparellar, emparellar | GNOME and Android |
| metered connection | connexió amb límit de dades | connexió d’ús mesurat | Says what it means |
| home folder | carpeta personal | inici | GNOME; Inici is the menu |
| dark style | mode fosc | estil fosc | Matches the Quick settings tile |
