# Danish style guide

How Luft speaks Danish. The [glossary](../../packages/i18n/glossary/da.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Address the reader as **du**, lowercase, as macOS, Windows, GNOME and KDE all do in Danish: »Du kan ændre det senere i Indstillinger.« Never »De« or »I«.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no »venligst« in front of every hint, no marketing words.
- Say what happens, not how it works inside. »Opdateringerne installeres, næste gang du genstarter«, not »Systemaftrykket udskiftes ved opstart«.
- When English uses »you« only out of habit, Danish may leave it out: »Ingen notifikationer« for »You have no notifications«.
- Prefer active sentences with du over stiff impersonal ones: »Du kan ændre det senere«, not »Det er muligt at ændre det senere«. Short passive forms with -s are fine for status: »Gemmes automatisk«.

## Buttons, menus and labels

- Buttons and menu items use the **imperative**: »Gem«, »Åbn«, »Luk«, »Genstart«, »Fastgør til proceslinjen«.
- Write -ere verbs in the imperative without an accent, as Windows and macOS do: »Kopier«, »Installer«, »Annuller«, »Marker«.
- Switches and settings are nouns or short phrases: »Natlys«, »Vis sekunder«.
- Headings and page names are nouns: »Notifikationer«, »Privatliv«.
- Instructions in running text use the imperative with du implied: »Tryk på Super+Tab for at se alle vinduer.«
- Use a comma before a second main clause after »og« in instructions only when it helps reading: »Løft fingeren, og prøv igen.«
- Keep labels short. Danish compounds are written as one word (»skærmindstillinger«, »tastaturgenvej«), never split into two.

## Capitalization

Sentence case: only the first word and names take a capital letter. »Hurtige indstillinger«, not »Hurtige Indstillinger«. Days, months, languages and nationalities are lowercase, as always in Danish. In running text, Luft's parts are ordinary nouns: »proceslinjen«, »låseskærmen«, »tavlen«. A label referred to in a sentence keeps its capital letter and needs no quotation marks: »slå Forstyr ikke til«.

## Typography

- Quotation marks: »…«, and ›…‹ inside them.
- Apostrophe: ’, used only for the genitive of names ending in s, x or z: »Keys’ layouts«.
- Ellipsis: one character, »…«, with no space before it: »Indlæser…«.
- Dash: the en dash with spaces, » – «. No em dashes.
- Percent sign and units take a space, a no-break space so they never wrap away from the number: »57 %«, »4,5 W«.
- Compounds with names, abbreviations or digits take a hyphen: »Bluetooth-adapter«, »USB-stik«, »PDF-fil«, »Rover-vindue«.
- Key names follow what Danish keyboards print and what Windows writes in Danish: Ctrl, Alt, Skift, Enter, Esc, Tab, Mellemrum, Tilbage, Delete, Insert, Home, End, Page Up, Page Down, Print Screen.
- Write »e-mail«, »online« and »wi-fi« in running text, »Wi-Fi« as a label.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Indstillinger, Diske, Installer Luft.
- Start stays Start; say »menuen Start« when it needs a definite form.
- Names never take the definite ending: never »Roveren«. When a sentence needs gender or a definite form, put the kind of thing first: »appen Rover«, »i appen Tern«. The genitive takes a plain -s: »Rovers vindue«, »Lufts opdateringer«.

## Plurals

Danish has two forms, `one` (1) and `other` (everything else, including 0). Always keep `{ $count }` in both, and keep `*[other]` as the default. Adjectives agree in the plural:

```ftl
windows-open = { $count ->
    [one] { $count } åbent vindue
   *[other] { $count } åbne vinduer
}
notifications-count = { $count ->
    [one] { $count } notifikation
   *[other] { $count } notifikationer
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Ingen notifikationer`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it: »Sidst kontrolleret: { $date }«.

## Decisions

| English | Danish | Instead of | Why |
| --- | --- | --- | --- |
| app | app, en | program, applikation | What Windows, phones and app stores say |
| board | tavle, en | board, lærred | A plain Danish word; »lærred« is the canvas inside it |
| All windows | Alle vinduer | Opgavevisning | That's what Luft calls the task view |
| notification | notifikation | meddelelse, påmindelse | macOS, iOS and Android; »meddelelse« also means a message |
| notification center | notifikationscenter | meddelelsescenter | Follows notifikation; macOS' word |
| pin, unpin | fastgøre, frigøre | knappe fast | Windows' words |
| snap, snap layout | docke, docklayout | fastgøre | »Fastgøre« is already pin |
| tray | systembakke | meddelelsesområde | Widely known; it holds apps, not notifications |
| workspace | arbejdsområde | skrivebord | GNOME's word; »skrivebord« is the area behind the windows |
| wallpaper | baggrundsbillede | baggrund | »Baggrund« is ambiguous next to colors |
| sign in, sign out | log ind, log ud | log på, log af | macOS, GNOME and nearly every website |
| suspend, sleep | Slumre, slumretilstand | Pause, Hvile | Windows' word |
| shut down | Sluk | Luk computeren | Shorter; GNOME and KDE |
| Power saver | Strømbesparelse | Bedste energieffektivitet | Short and matches Strømtilstand |
| passkey | adgangsnøgle | passkey | Apple and Google in Danish |
| recovery key | genoprettelsesnøgle | gendannelsesnøgle | BitLocker's word, which people meet first |
| Keyring | Nøglering | Nøglebundt | GNOME and macOS |
| security chip | sikkerhedschip | TPM-chip | Luft avoids the abbreviation in the interface |
| privacy | privatliv | beskyttelse af personlige oplysninger | Short enough for a page name; GNOME's word |
| password | adgangskode | kodeord, password | Windows and macOS |
| keyboard shortcut | tastaturgenvej | genvejstast | Windows' word |
| Wi-Fi | Wi-Fi | wifi, WLAN | Windows' label; wifi in running text |
| USB stick | USB-stik | USB-nøgle, USB-flashdrev | Common speech, and »nøgle« is used for keys |
| passphrase | adgangsfrase | adgangssætning, adgangsudtryk | Stays apart from adgangskode; GNOME's word |
| PIN | pinkode | PIN | What people say about bank cards and phones |
| Sticky, Slow, Bounce keys | Klæbende taster, Langsomme taster, Afvisningstaster | Træge taster, Filtertaster | GNOME's names; Windows' »Træge taster« means Sticky Keys |
| system image | udgave | aftryk | »Aftryk« is jargon; people choose between editions |
| metered connection | forbrugsafregnet forbindelse | begrænset forbindelse | Windows' word |
