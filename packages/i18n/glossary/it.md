# Italian

What is particular to Italian, on top of [the rules every language shares](common.md). The agreed terms are in [it.tbx](it.tbx).

## Address

Address the reader as tu, as Windows and macOS do: “Puoi cambiarlo più tardi nelle Impostazioni.” Never Lei or voi. Instructions take the imperative with tu: “Premi Super+Tab per vedere tutte le finestre.”

## Buttons and labels

- Buttons and menu items take the imperative singular: “Salva”, “Apri”, “Annulla”, “Riavvia”, “Aggiungi alla barra delle applicazioni”.
- Status messages use a past participle that agrees: “Copiata” for the recovery key, “Impronta aggiunta”.
- “Couldn’t …” becomes “Impossibile …”: “Impossibile aggiungere questa impronta.”
- Appunti and Cestino keep their capital in sentences too, as in Windows. A label named in a sentence keeps its capital: “attiva Non disturbare”.

## Typography

- Quotation marks “…”, with ‘…’ inside them. No caporali.
- The apostrophe is always ’, also in elisions: “l’app”, “un’emoji”.
- Accented letters are always accented letters, never an apostrophe: “è”, not “e'”, and È for the capital.
- The dash is an en dash with spaces. The percent sign takes no space: “57%”.
- Keys follow Italian keyboards and Windows: Ctrl, Alt, Maiusc, Invio, Canc, Ins, Home, Fine, Pag su, Pag giù, Stamp, Esc, Tab, Backspace, Spazio, Bloc Maiusc, Bloc Num.

## Names

- Settings, Disks and Install Luft are Impostazioni, Dischi and Installa Luft.
- Names take no article and are masculine when something agrees: “Luft è aggiornato”, “Rover è aperto”. When the gender sounds odd or an article is needed: “l’app Rover”, “nell’app Tern”.
- Start is masculine with no article: “in Start”; write “il menu Start” when one is needed.
- English loanwords (app, file, account, password, emoji, touchpad, firmware) don't change in the plural: “le app”, “i file”. Their gender is in the glossary.

## Plurals

`one` and `other`; `many`, for exact millions, never happens in Luft. Adjectives and participles agree in both: “{ $count } file eliminato”, “{ $count } file eliminati”.

```ftl
notifications-count = { $count ->
    [one] { $count } notifica
   *[other] { $count } notifiche
}
```

## Words

| English | Italian | Not | Why |
| --- | --- | --- | --- |
| board | lavagna | board, tela | An Italian word people know; tela is the canvas inside it |
| All windows | Tutte le finestre | Visualizzazione attività | What Luft calls the task view |
| snap, snap layout | ancorare, layout di ancoraggio | agganciare | Windows' words |
| taskbar | barra delle applicazioni | barra di sistema | Windows' word |
| tray | vassoio di sistema | area di notifica | KDE's word; keeps it apart from notifications |
| notification center | centro notifiche | centro di notifica | Windows' word |
| workspace | spazio di lavoro | desktop virtuale | GNOME's word; desktop is the area behind the windows |
| wallpaper | sfondo | carta da parati | Windows, macOS and GNOME |
| accent color | colore principale | colore d’accento | Windows' word |
| Power mode, Power saver | Modalità energia, Risparmio energia | Modalità di alimentazione | Shorter; Windows' word |
| sign out | uscire; the button is Esci | disconnettersi | Disconnetti is for networks and devices |
| shut down | spegnere | arrestare | GNOME and macOS; shorter |
| clipboard | Appunti | clipboard | Windows' word |
| screenshot, take a screenshot | screenshot, acquisire uno screenshot | schermata, catturare | What people say; Windows' verb |
| Keyring | Portachiavi | Keyring | macOS and GNOME |
| passkey | passkey | chiave d’accesso | Apple, Google and websites |
| encryption | crittografia | cifratura | Windows' word |
| keyboard shortcut | scorciatoia da tastiera | tasto di scelta rapida | GNOME and KDE; shorter |
| pin, unpin | aggiungere, rimuovere | fissare, bloccare | Windows' words |
| forget | dimenticare | annullare memorizzazione | macOS; shorter |
| USB stick | chiavetta USB | penna USB | What people say |
| sound | audio | suono | Windows' settings page |
| dark style, light style | modalità scura, modalità chiara | stile scuro | Matches the Quick settings tile; Stile stays the Appearance heading |
| input source | sorgente di input | metodo di input | GNOME's word; an input method is one kind of source |
| passphrase | passphrase (f) | frase segreta | Apart from password |
| security key | chiave di sicurezza | token | Windows' word |
| graphics card | scheda video | scheda grafica | Windows' word; shorter |
| track (music) | traccia | brano | Matches the media key names |
| home folder | cartella home | cartella personale | GNOME's word |
| route (network) | instradamento | rotta | GNOME's word |
