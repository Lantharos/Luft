# Slovenian style guide

How Luft speaks Slovenian. The [glossary](../../packages/i18n/glossary/sl.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: „Posodobitve se namestijo ob naslednjem zagonu“, „Ni obvestil“.
- When the reader has to be addressed, use **vi**, lowercase, as Windows, macOS, GNOME and KDE do in Slovenian: „To lahko pozneje spremenite v Nastavitvah.“ Never capitalize Vi or Vaš, and never switch to ti.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as „Prosimo“ at the start of every hint, no marketing words.
- Say what happens, not how it works inside. „Posodobitve se namestijo ob vnovičnem zagonu“, not „Slika sistema se zamenja med zagonom“.
- Slovenian vocabulary over borrowed words where the borrowed word isn't what people say: datoteka, mapa, računalnik, nastavitve, zaslon, tipkovnica, obvestilo, posodobitev.

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, as Windows and GNOME do: „Shrani“, „Odpri“, „Prekliči“, „Znova zaženi“, „Pripni v opravilno vrstico“. This doesn't contradict addressing the reader with vi: the button is a command the reader gives.
- Some actions read better as nouns, as in Windows: „Prijava“, „Odjava“, „Spanje“, „Mirovanje“, „Zaustavitev sistema“, „Vnovični zagon“. The power menu uses these nouns.
- Placeholders that ask for a choice speak to the reader: „Izberite“.
- Switches and settings are nouns or follow the English form: „Nočna svetloba“, „Pokaži sekunde“.
- Headings and page names are nouns: „Obvestila“, „Zasebnost“.
- Instructions in running text use vi: „Pritisnite Super+Tab, da vidite vsa okna.“
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Hitre nastavitve“, not „Hitre Nastavitve“. In running text Luft's parts are ordinary nouns: „opravilna vrstica“, „zaklenjen zaslon“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „vklopite Ne moti“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Apostrophe: ’.
- Ellipsis: one character, „…“. No space before it when something is left out of a word, a space otherwise: „Nalaganje …“.
- Dash: the en dash with spaces, „ – “. No em dashes.
- No space before ! ? : ;. A space between a number and its unit or the percent sign: „57 %“, „4,5 W“.
- Key names stay as printed on keyboards sold in Slovenia: Ctrl, Alt, Shift, Enter, Esc, Delete. Only the space bar is translated: Preslednica.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Nastavitve, Diski, Namesti Luft.
- Start stays Start, as in Windows; say „meni Start“ when it has to decline („v meniju Start“).
- Avoid declining app names. Put the kind of thing first: „v aplikaciji Rover“, „aplikacija Tern je zaprta“. Luft itself is masculine and declines normally when needed (Lufta, Luftu), but prefer sentences where it doesn't have to.
- Bluetooth and other names used as modifiers follow the noun: „vmesnik Bluetooth“, „ključek USB“, „naslov IP“.

## Plurals

Slovenian has four forms, decided by the last two digits of the number:

- `one`: 1, 101, 201 … (not 11, 21)
- `two`: 2, 102, 202 …
- `few`: 3, 4, 103, 104 …
- `other`: everything else, including 0, 5–100 and 21

Because `one` also covers 101, always write `{ $count }` instead of the digit 1. Adjectives and verbs agree too, and the dual matters: two windows are „odprti okni“, and the verb takes the dual form.

```ftl
windows-open = { $count ->
    [one] { $count } odprto okno
    [two] { $count } odprti okni
    [few] { $count } odprta okna
   *[other] { $count } odprtih oken
}
minutes-left = { $count ->
    [one] Preostala je še { $count } minuta
    [two] Preostali sta še { $count } minuti
    [few] Preostale so še { $count } minute
   *[other] Preostalo je še { $count } minut
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Ni obvestil`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Zadnje preverjanje: { $date }“.

## Decisions

| English | Slovenian | Instead of | Why |
| --- | --- | --- | --- |
| you | vi, lowercase, or no person | ti | Windows, GNOME and KDE |
| app | aplikacija | program | What Windows and app stores say |
| board | tabla | plošča, platno | A board you lay things out on; plošča is a panel or disc |
| All windows | Vsa okna | Pogled opravil | That's what Luft calls the task view |
| taskbar | opravilna vrstica | vrstica opravil | Windows' word |
| tray | sistemska vrstica | območje za obvestila | KDE's word; it holds apps, not notifications |
| pin, unpin | pripeti, odpeti | pritrditi | Windows' words |
| snap, snap layout | zaskočiti, postavitev oken | pripeti | Pripeti is pin |
| workspace | delovna površina | namizje | GNOME's word; namizje is the desktop |
| wallpaper | ozadje | slika ozadja | Windows and GNOME |
| suspend, sleep | spanje | pripravljenost | Windows' word |
| hibernate | mirovanje | hibernacija | Windows' word |
| Night light | Nočna svetloba | Nočna lučka | GNOME's word, and lučka sounds like a lamp |
| passkey | ključ za dostop | passkey, geslo za dostop | Windows and Google in Slovenian |
| Keyring | zbirka ključev | obesek za ključe | GNOME's word |
| clipboard | odložišče | odlagališče | Windows and GNOME |
| emoji | emodži | čustvenček, emoji | Standard Slovenian spelling; čustvenček is an emoticon |
| firmware | vdelana programska oprema | strojna programska oprema, firmware | Windows' word |
| touchpad | sledilna ploščica | touchpad, sledilna tablica | Windows' word |
| About | O sistemu | Vizitka | GNOME; Vizitka reads as a business card outside Windows |
| keyboard shortcut | bližnjica na tipkovnici | tipkovna bližnjica | Windows' word; bližnjica alone in context |
| USB stick | ključek USB | USB-ključ | Standard word order for names used as modifiers |
| passphrase | šifrirno geslo | geslo za šifriranje | Short, and it stays distinct from the account password |
| PIN | PIN; koda PIN where it has to decline | PIN-koda, PIN-a | PIN itself declines awkwardly |
| input source | vir vnosa | vhodni vir | GNOME's word |
| metered connection | merjena povezava | omejena povezava | Omejena reads as limited, not counted |
| Desktop 1, 2 … in the task view | Delovna površina 1, 2 … | Namizje 1 | They are workspaces |
| inactive | nedejavnost | neaktivnost | Slovenian word over the borrowed one |
| Wallpapers folder | mapa Wallpapers | mapa Ozadja | The folder on disk keeps its English name |
