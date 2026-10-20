# Catalan style guide

How Luft speaks Catalan. The [glossary](../../packages/i18n/glossary/ca.csv) has the agreed terms; Weblate shows them next to every string.

Luft's Catalan is the central standard, following Softcatalà's style guide and the terminology of TERMCAT and Softcatalà, which GNOME, KDE, LibreOffice, Mozilla, Microsoft and Apple largely share.

## Address and tone

- Address the reader as **vós**, the second person plural, as Softcatalà, GNOME, KDE, Mozilla and LibreOffice do: «Podeu canviar-ho més endavant a la Configuració.» Windows and macOS in Catalan have moved to tu, but vós is what the free desktops people use alongside Luft speak, and it reads polite without being stiff. Never tu in running text, never vostè.
- When a sentence reads well without a person, leave it out: «No hi ha notificacions» for “You have no notifications”, «Les actualitzacions s’instal·len en reiniciar».
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as «Si us plau» in every hint, no marketing words.
- Say what happens, not how it works inside.
- Instructions in running text use the imperative with vós: «Premeu Super+Tab per veure totes les finestres», «Torneu-ho a provar». Use prémer for keys, fer clic for the mouse, tocar for touch.
- For what just happened use the perfect: «No s’ha pogut desar», «El lector ha deixat de respondre».

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, as Softcatalà, GNOME, KDE and Microsoft do: «Desa», «Obre», «Cancel·la», «Reinicia», «Fixa a la barra de tasques», «Torna-ho a provar». This is the command the reader gives, so it doesn’t clash with vós in running text.
- Titles of dialogs and setup steps that ask the reader to do something use vós, like running text: «Trieu un disc», «Afegiu un PIN».
- Switches and settings are nouns or short phrases: «Llum nocturna», «Mostra els segons».
- Headings and page names are nouns: «Notificacions», «Privadesa».
- Status words agree with what they describe: «Desada», «Copiada» for a key, «Connectat» for a device.
- Keep labels short. Catalan runs about a quarter longer than English; if a button clips, look for a shorter word before abbreviating. «App» is allowed only where «aplicació» truly doesn’t fit.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. «Configuració ràpida», not «Configuració Ràpida». Days, months and languages are lowercase. In running text, Luft’s parts are ordinary nouns: «la barra de tasques», «el tauler». Names of apps and of the Inici menu keep their capital, and so does a label quoted in a sentence, which needs no quotation marks: «activeu No molestis».

## Typography

- Apostrophe: always the typographic ’, never ': «l’aplicació», «d’energia», «s’ha desat». Apostrophize the article and de before a vowel or h as usual, but not before the names of letters or before words starting with a stressed i/u sound that isn’t a vowel (el Wi-Fi).
- Geminated l: always l·l with the middle dot U+00B7, never l.l or a bullet: «instal·lar», «cancel·la», «col·locar».
- Quotation marks: «…», and “…” inside them.
- Ellipsis: one character, «…», attached to the word before it: «S’està carregant…».
- Dashes: avoid them in short interface text. In longer text use the em dash «—» for an aside, attached to the words it encloses. Never a hyphen in place of a dash.
- Percent sign and units take a no-break space after the number: «57 %», «4,5 W».
- Key names follow Catalan software and Spanish-layout keyboards: Ctrl, Alt, Maj, Retorn, Esc, Supr, Insert, Inici, Fi, Re Pàg, Av Pàg, Impr Pant, Retrocés, Espai. These come from translatable key names, so translate them where they appear.
- Write «correu electrònic», «internet» (lowercase), «en línia» rather than online.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Configuració, Discs, Instal·la Luft.
- The Start menu is **Inici**, as in Catalan Windows: «el menú Inici», «cerqueu a Inici».
- The wallpaper folder keeps its English name on disk: «la carpeta Wallpapers, dins d’Imatges».
- App names don’t inflect and take no article on their own: «Rover és obert», «obre amb Magpie». When a sentence needs an article or gender, add the kind of thing: «l’aplicació Rover». Luft itself never takes an article: «instal·lar Luft», «espai per a Luft».

## Plurals

Catalan has `one` (1), `many` (exact multiples of a million, like 1 000 000) and `other` (everything else, including 0 and decimals). Write `one` and `other`; `many` is only needed where a million reads differently, which in Luft it never does. Always keep `{ $count }` in every variant, and `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } notificació
   *[other] { $count } notificacions
}
windows-open = { $count ->
    [one] { $count } finestra oberta
   *[other] { $count } finestres obertes
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] No hi ha notificacions`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that prepositions and contractions still fit: «Darrera comprovació: { $date }».

## Decisions

| English | Catalan | Instead of | Why |
| --- | --- | --- | --- |
| you | vós | tu, vostè | Softcatalà, GNOME, KDE, Mozilla and LibreOffice |
| button verbs | imperative, tu: Desa | infinitive: Desar | Softcatalà, GNOME, KDE and Microsoft |
| Settings | Configuració | Paràmetres, Arranjament | Windows and Apple; paràmetres stays for a set of options |
| Start | Inici | Start | Catalan Windows says menú Inici, and it reads naturally in sentences |
| board | tauler | pissarra, llenç | A board you lay things out on; llenç is the canvas inside it |
| All windows | Totes les finestres | Visualització de tasques | That’s what Luft calls the task view |
| Quick settings | Configuració ràpida | Paràmetres ràpids | Windows’ word, consistent with Configuració |
| snap, snap layout | ajustar, disposició d’ajust | acoblar, ancorar | Windows’ verb; fixar is pin |
| tray | safata del sistema | àrea de notificació | The name people know; it holds apps, not notifications |
| workspace | espai de treball | escriptori virtual | GNOME’s word; escriptori is the area behind the windows |
| wallpaper | fons de pantalla | fons d’escriptori | Windows and Apple |
| accent color | color d’èmfasi | color d’accent | Windows’ word |
| save | desar | guardar | Softcatalà and every Catalan OS; guardar is keep |
| remove, delete | treure, suprimir | eliminar, esborrar | Keeps taking out apart from destroying |
| sign in, sign out | iniciar la sessió, tancar la sessió | entrar, sortir | Softcatalà, Windows and GNOME |
| suspend, sleep | suspendre | dormir, repòs | Softcatalà and GNOME |
| Language & Region | Llengua i regió | Idioma i regió | Softcatalà prefers llengua; idioma is in the search words |
| About | Quant a | Informació | Softcatalà, GNOME and KDE |
| passkey | clau d’accés | passkey | Apple and Google in Catalan |
| Keyring | Clauer | Anell de claus | GNOME and macOS |
| clipboard | porta-retalls | porta-papers | Softcatalà and Windows |
| privacy | privadesa | privacitat | TERMCAT and Windows |
| encryption | xifratge | encriptació | TERMCAT, Softcatalà and Windows |
| firmware | microprogramari | firmware | TERMCAT, GNOME and Windows |
| startup | arrencada | inici | Softcatalà; keeps Inici for the menu |
| file | fitxer | arxiu | Softcatalà and every Catalan OS |
| keyboard shortcut | drecera de teclat | tecla de drecera | Windows and GNOME |
| touchpad | ratolí tàctil | touchpad, tauleta tàctil | Windows and GNOME |
| computer | ordinador | equip | The everyday word |
| Wi-Fi | Wi-Fi | wifi | How Windows writes it; wifi is in the search words |
| passphrase | frase de pas | contrasenya de xifratge | Softcatalà and GNOME |
| pair (Bluetooth) | vincular | aparellar, emparellar | GNOME and Android |
| metered connection | connexió amb límit de dades | connexió d’ús mesurat | Says what it means |
| home folder | carpeta personal | inici | GNOME; Inici is the menu |
| dark style | mode fosc | estil fosc | Matches the Quick settings tile |
