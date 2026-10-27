# Italian style guide

How Luft speaks Italian. The [glossary](../../packages/i18n/glossary/it.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Address the reader as **tu**, as Windows and macOS do in Italian: “Puoi cambiarlo più tardi nelle Impostazioni.” GNOME and KDE mostly avoid a person; Luft uses tu wherever someone is addressed. Never “Lei” or “voi”.
- When English uses “you” only out of habit, leave the person out: “Nessuna notifica” for “You have no notifications”.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no “per favore” in front of every hint, no marketing words.
- Say what happens, not how it works inside: “Gli aggiornamenti vengono installati al prossimo riavvio.”
- Instructions in running text use the imperative with tu: “Premi Super+Tab per vedere tutte le finestre.”

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, as Windows, macOS and GNOME do: “Salva”, “Apri”, “Annulla”, “Riavvia”, “Aggiungi alla barra delle applicazioni”.
- Switches and settings are nouns or short phrases: “Luce notturna”, “Mostra i secondi”.
- Headings and page names are nouns: “Notifiche”, “Privacy”, “Alimentazione e batteria”.
- Status messages use a past participle that agrees with what it describes: “Copiata” for the recovery key (la chiave), “Impronta aggiunta”.
- Errors start with “Impossibile …” when English says “Couldn’t …”: “Impossibile aggiungere questa impronta.”
- Keep labels short. Italian runs about a fifth longer than English; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. “Impostazioni rapide”, not “Impostazioni Rapide”. In running text Luft's parts are ordinary nouns: “la barra delle applicazioni”, “la schermata di blocco”. Two exceptions follow Windows: Appunti and Cestino keep their capital letter, also in sentences. A label referred to in a sentence keeps its capital letter: “attiva Non disturbare”.

## Typography

- Quotation marks: “…”, and ‘…’ inside them. No caporali (« »).
- Apostrophe: the typographic ’, also in elisions: “l’app”, “un’emoji”, “c’è”.
- Accents: è, é, à, ì, ò, ù always as accented letters, never with an apostrophe (“è”, not “e'”). Capital È is written È.
- Ellipsis: one character, “…”, with no space before it.
- Dash: the en dash with spaces, “ – ”.
- No space before punctuation. Percent sign without a space: “57%”.
- Key names follow Italian keyboards and Windows: Ctrl, Alt, Maiusc, Invio, Canc, Ins, Home, Fine, Pag su, Pag giù, Stamp, Esc, Tab, Backspace, Spazio, Bloc Maiusc, Bloc Num, Bloc Scorr.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Impostazioni, Dischi, Installa Luft.
- Names take no article and are masculine when something has to agree: “Luft è aggiornato”, “Rover è aperto”. When the gender would sound odd or the sentence needs an article, add the kind of thing: “l’app Rover”, “nell’app Tern”.
- Start is masculine and takes no article: “in Start”, “aggiungi a Start”; say “il menu Start” when an article is needed.
- English loanwords (app, file, account, password, emoji, touchpad, firmware) are invariable: “le app”, “i file”, “le password”. Their gender is in the glossary.

## Plurals

Italian has `one` (exactly 1) and `other` (0, 2, 3 …). CLDR also lists `many` for exact multiples of a million (“1 milione di file”); Luft never counts that high in one place, so leave it out. Always keep `{ $count }` in both forms, and keep `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } notifica
   *[other] { $count } notifiche
}
```

Adjectives and participles agree in both forms: “{ $count } file eliminato”, “{ $count } file eliminati”. When English has an exact `[0]` variant, keep it and translate it: `[0] Nessuna notifica`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so the placeable never needs an article or preposition merged into it: “Ultimo controllo: { $date }”.

## Decisions

| English | Italian | Instead of | Why |
| --- | --- | --- | --- |
| you | tu | Lei, voi | Windows and macOS |
| board | lavagna | board, tela | An Italian word people know; “tela” would be the canvas inside it |
| All windows | Tutte le finestre | Visualizzazione attività | That's what Luft calls the task view |
| snap, snap layout | ancorare, layout di ancoraggio | agganciare | Windows' words |
| taskbar | barra delle applicazioni | barra di sistema | Windows' word |
| tray | vassoio di sistema | area di notifica | KDE's word; area di notifica would mix it up with notifications |
| notification center | centro notifiche | centro di notifica | Windows' word |
| workspace | spazio di lavoro | area di lavoro, desktop virtuale | GNOME's word; desktop is the area behind the windows |
| wallpaper | sfondo | carta da parati | Windows, macOS and GNOME |
| accent color | colore principale | colore d’accento | Windows' word |
| Power mode | Modalità energia | Modalità di alimentazione | Shorter, and fits next to Risparmio energia |
| Power saver | Risparmio energia | Risparmio batteria | Windows' word |
| sign out | uscire, button Esci | disconnettersi | Disconnetti is already used for networks and devices |
| shut down | spegnere | arrestare | GNOME and macOS; shorter on the power menu |
| clipboard | Appunti | clipboard | Windows' word |
| screenshot | screenshot | schermata, istantanea | What people say; Windows uses it too |
| Keyring | Portachiavi | Keyring | macOS and GNOME |
| passkey | passkey | chiave d’accesso | Apple, Google and websites |
| encryption | crittografia | cifratura | Windows' word |
| keyboard shortcut | scorciatoia da tastiera | tasto di scelta rapida | GNOME and KDE; shorter |
| pin, unpin | aggiungere, rimuovere | fissare, bloccare | Windows' words |
| forget | dimenticare | annullare memorizzazione | macOS; shorter |
| USB stick | chiavetta USB | penna USB, unità flash | What people say |
| sound | audio | suono | Windows' settings page |
| dark style, light style | modalità scura, modalità chiara | stile scuro | Matches the Quick settings tile; Stile stays as the Appearance heading |
| input source | sorgente di input | metodo di input | GNOME's word; a metodo di input is only one kind of source |
| passphrase | passphrase (f) | frase segreta | Keeps it distinct from password |
| security key | chiave di sicurezza | token | Windows' word |
| take a screenshot | acquisire uno screenshot | catturare | Windows' word |
| graphics card | scheda video | scheda grafica | Windows' word; shorter |
| track (music) | traccia | brano | Matches the media key names |
| home folder | cartella home | cartella personale | GNOME's word |
| route (network) | instradamento | rotta | GNOME's word |
