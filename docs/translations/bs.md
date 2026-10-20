# Bosnian style guide

How Luft speaks Bosnian. The [glossary](../../packages/i18n/glossary/bs.csv) has the agreed terms; Weblate shows them next to every string.

## Script and variant

Bosnian in Luft is written in **Latin script** with **ijekavian** forms: vrijeme, svjetlo, obavještenje, cijeli, uslijediti. Use Bosnian vocabulary where it differs from Croatian and Serbian: računar, postavke, fajl, folder, sistem, ekran, tastatura.

## Address and tone

- Prefer sentences without a person at all: „Ažuriranja se instaliraju pri sljedećem pokretanju“, „Nema obavještenja“.
- When the reader has to be addressed, use **vi**, lowercase, as Windows does: „Možete to promijeniti kasnije u Postavkama.“ Never capitalize Vi or Vaš, and never switch to ti.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no marketing words.
- Say what happens, not how it works inside.

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, the usual form for commands in Bosnian software: „Sačuvaj“, „Otvori“, „Otkaži“, „Ponovo pokreni“, „Zakači na programsku traku“. This doesn't contradict addressing the reader with vi: the button is a command the reader gives.
- Some actions read better as nouns, as in Windows and GNOME: „Prijava“, „Odjava“, „Mirovanje“.
- Switches and settings are nouns or follow the English form: „Noćno svjetlo“, „Prikaži sekunde“.
- Headings and page names are nouns: „Obavještenja“, „Privatnost“.
- Instructions in running text use vi: „Pritisnite Super+Tab da vidite sve prozore.“
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Brze postavke“, not „Brze Postavke“. In running text, Luft's parts are ordinary nouns: „programska traka“, „zaključani ekran“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „uključite Ne uznemiravaj“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them. A full stop goes after the closing quotation mark.
- Ellipsis: one character, „…“, with no space before it.
- Dash: the en dash with spaces, „ – “.
- Key names stay as printed on keyboards: Ctrl, Alt, Shift, Super.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Postavke, Diskovi, Instaliraj Luft.
- Start stays Start, as in Windows; say „meni Start“ when it has to decline.
- Avoid declining app names. Put the kind of thing first: „u aplikaciji Rover“, „aplikacija Tern je zatvorena“.

## Plurals

Bosnian has three forms: `one` (1, 21, 31, 101 but not 11), `few` (2–4, 22–24, but not 12–14) and `other` (everything else, including 0 and 5–20). Because `one` also covers 21 and 31, always write `{ $count }` instead of the digit 1. Adjectives and verbs agree too:

```ftl
windows-open = { $count ->
    [one] { $count } otvoren prozor
    [few] { $count } otvorena prozora
   *[other] { $count } otvorenih prozora
}
minutes-left = { $count ->
    [one] Preostala je { $count } minuta
    [few] Preostale su { $count } minute
   *[other] Preostalo je { $count } minuta
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Nema obavještenja`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Posljednja provjera: { $date }“.

## Decisions

| English | Bosnian | Instead of | Why |
| --- | --- | --- | --- |
| you | vi, lowercase, or no person | ti | Windows' Bosnian |
| file, folder | fajl, folder | datoteka, fascikla, direktorij | What Bosnian speakers say; Windows uses fajl too |
| settings | postavke | podešavanja | Windows and GNOME in Bosnian |
| notification | obavještenje | obavijest | Bosnian rather than Croatian |
| board | tabla | ploča | What a board is called in Bosnia |
| All windows | Svi prozori | Prikaz zadataka | That's what Luft calls the task view |
| taskbar | programska traka | traka zadataka | Windows' word |
| tray | sistemska paleta | traka sistema | Doesn't clash with the taskbar |
| pin, unpin | zakačiti, otkačiti | prikvačiti | Windows' words |
| snap, snap layout | poravnati, raspored prozora | prikaz na dijelu ekrana | Shorter; zakačiti is pin |
| workspace | radni prostor | radni sto | Radna površina is the desktop |
| suspend, sleep | stanje mirovanja, button Mirovanje | suspenduj | Plain language |
| passkey | pristupni ključ | passkey | Windows' word |
| Keyring | privjesak ključeva | prsten ključeva | Natural Bosnian |
| clipboard | međuspremnik | klipbord | Windows' word |
| encryption | šifriranje | enkripcija | Windows' word |
| brightness | osvjetljenje | svjetlina | Windows' word |
| touchpad | dodirna podloga | touchpad | Windows' word |
