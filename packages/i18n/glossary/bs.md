# Bosnian

What is particular to Bosnian, on top of [the rules every language shares](common.md). The agreed terms are in [bs.tbx](bs.tbx).

## Script and words

Bosnian in Luft is written in Latin script with ijekavian forms: vrijeme, svjetlo, obavještenje, cijeli. Use Bosnian words where they differ from Croatian and Serbian: računar, postavke, fajl, folder, sistem, ekran, tastatura.

## Address

Prefer sentences without a person: „Ažuriranja se instaliraju pri sljedećem pokretanju“, „Nema obavještenja“. When the reader has to be addressed, use the plural vi, lowercase, as Windows does: „Možete to promijeniti kasnije u Postavkama.“ Never Vi or Vaš with a capital, and never ti.

## Buttons and labels

- Buttons and menu items take the imperative, second person singular: „Sačuvaj“, „Otvori“, „Otkaži“, „Ponovo pokreni“, „Zakači na programsku traku“. The button is a command the reader gives, so this sits fine next to vi.
- Some actions read better as nouns, as in Windows and GNOME: „Prijava“, „Odjava“, „Mirovanje“.
- Instructions in running text use vi: „Pritisnite Super+Tab da vidite sve prozore.“
- A label named in a sentence keeps its capital and needs no quotation marks: „uključite Ne uznemiravaj“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them. A full stop goes after the closing mark.
- The dash is an en dash with spaces: „ – “. The ellipsis takes no space before it.
- Key names stay as printed: Ctrl, Alt, Shift, Super.

## Names

- Settings, Disks and Install Luft are Postavke, Diskovi and Instaliraj Luft.
- Start stays Start, as in Windows; write „meni Start“ when it has to decline.
- Don't decline app names; put the kind of thing first: „u aplikaciji Rover“.

## Plurals

Three forms: `one` (1, 21, 31, 101, but not 11), `few` (2–4, 22–24, but not 12–14) and `other` (0, 5–20 and the rest). Since `one` covers 21 too, always write `{ $count }`, never the digit 1. Adjectives and verbs agree:

```ftl
windows-open = { $count ->
    [one] { $count } otvoren prozor
    [few] { $count } otvorena prozora
   *[other] { $count } otvorenih prozora
}
```

## Words

| English | Bosnian | Not | Why |
| --- | --- | --- | --- |
| file, folder | fajl, folder | datoteka, fascikla, direktorij | What Bosnian speakers say; Windows uses fajl too |
| settings | postavke | podešavanja | Windows and GNOME in Bosnian |
| notification | obavještenje | obavijest | Bosnian rather than Croatian |
| board | tabla | ploča | What a board is called in Bosnia |
| All windows | Svi prozori | Prikaz zadataka | What Luft calls the task view |
| taskbar | programska traka | traka zadataka | Windows' word |
| tray | sistemska paleta | traka sistema | Doesn't clash with the taskbar |
| pin, unpin | zakačiti, otkačiti | prikvačiti | Windows' words |
| snap, snap layout | poravnati, raspored prozora | prikaz na dijelu ekrana | Shorter; zakačiti is pin |
| workspace | radni prostor | radni sto | Radna površina is the desktop |
| suspend, sleep | stanje mirovanja; the button is Mirovanje | suspenduj | Plain language |
| Keyring | privjesak ključeva | prsten ključeva | Natural Bosnian |
| clipboard | međuspremnik | klipbord | Windows' word |
| encryption | šifriranje | enkripcija | Windows' word |
| brightness | osvjetljenje | svjetlina | Windows' word |
| touchpad | dodirna podloga | touchpad | Windows' word |
