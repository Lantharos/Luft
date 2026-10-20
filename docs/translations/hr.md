# Croatian style guide

How Luft speaks Croatian. The [glossary](../../packages/i18n/glossary/hr.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: „Ažuriranja se instaliraju pri sljedećem pokretanju“, „Nema obavijesti“.
- When the reader has to be addressed, use the formal plural **vi**, lowercase, as most operating systems do in Croatian, Windows and GNOME among them: „Možete to promijeniti kasnije u Postavkama.“ Never capitalize Vi or Vaš, and never switch to ti.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no marketing words.
- Say what happens, not how it works inside.
- Croatian vocabulary and ijekavian forms: datoteka, mapa, računalo, postavke, zaslon, tipkovnica, sustav, obavijest, vrijeme, svjetlo.

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, the usual form for commands in Croatian software: „Spremi“, „Otvori“, „Odustani“, „Ponovno pokreni“, „Prikvači na programsku traku“. This doesn't contradict addressing the reader with vi: the button is a command the reader gives.
- Some actions read better as nouns, as in Windows and GNOME: „Prijava“, „Odjava“, „Mirovanje“.
- Switches and settings are nouns or follow the English form: „Noćno svjetlo“, „Prikaži sekunde“.
- Headings and page names are nouns: „Obavijesti“, „Privatnost“.
- Instructions in running text use vi: „Pritisnite Super+Tab da biste vidjeli sve prozore.“
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Brze postavke“, not „Brze Postavke“. In running text, Luft's parts are ordinary nouns: „programska traka“, „zaključani zaslon“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „uključite Ne ometaj“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Ellipsis: one character, „…“, with no space before it.
- Dash: the en dash with spaces, „ – “.
- Key names stay as printed on keyboards: Ctrl, Alt, Shift, Super.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Postavke, Diskovi, Instaliraj Luft.
- Start stays Start, as in Windows; say „izbornik Start“ when it has to decline.
- Avoid declining app names. Put the kind of thing first: „u aplikaciji Rover“, „aplikacija Tern je zatvorena“. Luft itself declines normally when needed (Lufta, Luftu), but prefer sentences where it doesn't have to.

## Plurals

Croatian has three forms: `one` (1, 21, 31, 101 but not 11), `few` (2–4, 22–24, but not 12–14) and `other` (everything else, including 0 and 5–20). Because `one` also covers 21 and 31, always write `{ $count }` instead of the digit 1. Adjectives and verbs agree too:

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

When English has an exact `[0]` variant, keep it and translate it: `[0] Nema obavijesti`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Zadnja provjera: { $date }“.

## Decisions

| English | Croatian | Instead of | Why |
| --- | --- | --- | --- |
| you | vi, lowercase, or no person | ti | Windows and GNOME |
| board | ploča | tabla | Croatian word for a board |
| All windows | Svi prozori | Prikaz zadataka | That's what Luft calls the task view |
| taskbar | programska traka | traka zadataka | Windows' word |
| tray | paleta sustava | područje obavijesti | Windows' word; it holds apps, not notifications |
| pin, unpin | prikvačiti, otkvačiti | dodati na pokretač | Windows' words |
| snap, snap layout | poravnati, raspored prozora | prikvačiti | Prikvačiti is pin |
| lock screen | zaključani zaslon | zaključavanje zaslona | The screen, not the action |
| workspace | radni prostor | radna površina | Radna površina is the desktop |
| wallpaper | pozadina | podloga, tapeta | Windows and GNOME |
| suspend, sleep | stanje mirovanja, button Mirovanje | suspendiraj | Windows' word |
| Night light | Noćno svjetlo | Noćno osvjetljenje | Shorter; Windows' word |
| passkey | pristupni ključ | passkey | Windows and Apple in Croatian |
| Keyring | skup ključeva | privjesak za ključeve | GNOME's word |
| clipboard | međuspremnik | odlagalište | Windows and GNOME |
| emoji | emotikon | emoji | Declines naturally |
| encryption | šifriranje | enkripcija | Windows' word |
| firmware | firmver | programska oprema | Short and widely used |
| touchpad | dodirna pločica | touchpad | Windows' word |
| computer | računalo | računar | Croatian standard |
