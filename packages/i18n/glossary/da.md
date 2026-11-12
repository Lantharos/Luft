# Danish

What is particular to Danish, on top of [the rules every language shares](common.md). The agreed terms are in [da.tbx](da.tbx).

## Address

Address the reader as du, lowercase, as macOS, Windows, GNOME and KDE do: »Du kan ændre det senere i Indstillinger.« Never De or I. Prefer an active sentence with du to a stiff impersonal one: »Du kan ændre det senere«, not »Det er muligt at ændre det senere«. Short -s passives are fine for status: »Gemmes automatisk«.

## Buttons and labels

- Buttons and menu items take the imperative: »Gem«, »Åbn«, »Luk«, »Genstart«, »Fastgør til proceslinjen«. Verbs in -ere take no accent, as Windows and macOS write them: »Kopier«, »Installer«, »Annuller«.
- Instructions take the imperative: »Tryk på Super+Tab for at se alle vinduer.« A comma before a second main clause after og only when it helps: »Løft fingeren, og prøv igen.«
- Compounds are one word, never split: »skærmindstillinger«, »tastaturgenvej«.
- Days, months, languages and nationalities are lowercase. A label named in a sentence keeps its capital and needs no quotation marks: »slå Forstyr ikke til«.

## Typography

- Quotation marks »…«, with ›…‹ inside them.
- The apostrophe ’ only marks the genitive of names ending in s, x or z: »Keys’ layouts«.
- The dash is an en dash with spaces. No em dashes.
- Percent signs and units take a no-break space: »57 %«, »4,5 W«.
- Compounds with names, abbreviations or digits take a hyphen: »Bluetooth-adapter«, »USB-stik«, »Rover-vindue«.
- Keys follow Danish keyboards and Windows: Ctrl, Alt, Skift, Enter, Esc, Tab, Mellemrum, Tilbage, Delete.
- Write »e-mail«, »online«, and »wi-fi« in running text but »Wi-Fi« as a label.

## Names

- Settings, Disks and Install Luft are Indstillinger, Diske and Installer Luft.
- Start stays Start; »menuen Start« when it needs a definite form.
- Names never take the definite ending, so never »Roveren». When a sentence needs one: »appen Rover«, »i appen Tern«. The genitive is a plain -s: »Rovers vindue«, »Lufts opdateringer«.

## Plurals

Two forms, `one` and `other`. Adjectives agree in the plural:

```ftl
windows-open = { $count ->
    [one] { $count } åbent vindue
   *[other] { $count } åbne vinduer
}
```

## Words

| English | Danish | Not | Why |
| --- | --- | --- | --- |
| app | app, en | program, applikation | What Windows, phones and app stores say |
| board | tavle, en | board, lærred | A plain Danish word; lærred is the canvas inside it |
| All windows | Alle vinduer | Opgavevisning | What Luft calls the task view |
| notification, notification center | notifikation, notifikationscenter | meddelelse | macOS, iOS and Android; meddelelse also means a message |
| pin, unpin | fastgøre, frigøre | knappe fast | Windows' words |
| snap, snap layout | docke, docklayout | fastgøre | Fastgøre is pin |
| tray | systembakke | meddelelsesområde | Widely known; it holds apps |
| workspace | arbejdsområde | skrivebord | GNOME's word; skrivebord is the desktop |
| wallpaper | baggrundsbillede | baggrund | Baggrund is ambiguous next to colours |
| sign in, sign out | log ind, log ud | log på, log af | macOS, GNOME and nearly every website |
| suspend, sleep | Slumre, slumretilstand | Pause, Hvile | Windows' word |
| shut down | Sluk | Luk computeren | Shorter; GNOME and KDE |
| Power saver | Strømbesparelse | Bedste energieffektivitet | Short, and matches Strømtilstand |
| recovery key | genoprettelsesnøgle | gendannelsesnøgle | BitLocker's word, which people meet first |
| Keyring | Nøglering | Nøglebundt | GNOME and macOS |
| security chip | sikkerhedschip | TPM-chip | Luft avoids the abbreviation |
| privacy | privatliv | beskyttelse af personlige oplysninger | Short enough for a page name; GNOME's word |
| password | adgangskode | kodeord, password | Windows and macOS |
| keyboard shortcut | tastaturgenvej | genvejstast | Windows' word |
| USB stick | USB-stik | USB-nøgle | Common speech; nøgle is for keys |
| passphrase | adgangsfrase | adgangssætning | Apart from adgangskode; GNOME's word |
| PIN | pinkode | PIN | What people say about cards and phones |
| Sticky, Slow, Bounce keys | Klæbende taster, Langsomme taster, Afvisningstaster | Træge taster | GNOME's names; Windows' Træge taster means Sticky keys |
| system image | udgave | aftryk | Aftryk is jargon; people choose between editions |
| metered connection | forbrugsafregnet forbindelse | begrænset forbindelse | Windows' word |
