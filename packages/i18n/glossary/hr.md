# Croatian

What is particular to Croatian, on top of [the rules every language shares](common.md). The agreed terms are in [hr.tbx](hr.tbx).

## Address

Prefer sentences without a person: „Ažuriranja se instaliraju pri sljedećem pokretanju“, „Nema obavijesti“. When the reader has to be addressed, use the plural vi, lowercase, as Windows and GNOME do: „Možete to promijeniti kasnije u Postavkama.“ Never Vi or Vaš with a capital, and never ti.

Use Croatian words and ijekavian forms: datoteka, mapa, računalo, postavke, zaslon, tipkovnica, sustav, obavijest, vrijeme, svjetlo.

## Buttons and labels

- Buttons and menu items take the imperative, second person singular, the usual form for commands in Croatian software: „Spremi“, „Otvori“, „Odustani“, „Ponovno pokreni“, „Prikvači na programsku traku“. The button is a command the reader gives, so this sits fine next to vi.
- Some actions read better as nouns, as in Windows and GNOME: „Prijava“, „Odjava“, „Mirovanje“.
- Instructions in running text use vi: „Pritisnite Super+Tab da biste vidjeli sve prozore.“
- A label named in a sentence keeps its capital and needs no quotation marks: „uključite Ne ometaj“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces: „ – “. The ellipsis takes no space before it.
- Key names stay as printed: Ctrl, Alt, Shift, Super.

## Names

- Settings, Disks and Install Luft are Postavke, Diskovi and Instaliraj Luft.
- Start stays Start, as in Windows; write „izbornik Start“ when it has to decline.
- Don't decline app names; put the kind of thing first: „u aplikaciji Rover“, „aplikacija Tern je zatvorena“. Luft declines when it must (Lufta, Luftu), but prefer sentences where it doesn't.

## Plurals

Three forms: `one` (1, 21, 31, 101, but not 11), `few` (2–4, 22–24, but not 12–14) and `other` (0, 5–20 and the rest). Since `one` covers 21 too, always write `{ $count }`, never the digit 1. Adjectives and verbs agree:

```ftl
minutes-left = { $count ->
    [one] Preostala je { $count } minuta
    [few] Preostale su { $count } minute
   *[other] Preostalo je { $count } minuta
}
```

## Words

| English | Croatian | Not | Why |
| --- | --- | --- | --- |
| board | ploča | tabla | The Croatian word for a board |
| All windows | Svi prozori | Prikaz zadataka | What Luft calls the task view |
| taskbar | programska traka | traka zadataka | Windows' word |
| tray | paleta sustava | područje obavijesti | Windows' word; it holds apps, not notifications |
| pin, unpin | prikvačiti, otkvačiti | dodati na pokretač | Windows' words |
| snap, snap layout | poravnati, raspored prozora | prikvačiti | Prikvačiti is pin |
| lock screen | zaključani zaslon | zaključavanje zaslona | The screen, not the action |
| workspace | radni prostor | radna površina | Radna površina is the desktop |
| wallpaper | pozadina | podloga, tapeta | Windows and GNOME |
| suspend, sleep | stanje mirovanja; the button is Mirovanje | suspendiraj | Windows' word |
| Night light | Noćno svjetlo | Noćno osvjetljenje | Shorter; Windows' word |
| Keyring | skup ključeva | privjesak za ključeve | GNOME's word |
| clipboard | međuspremnik | odlagalište | Windows and GNOME |
| emoji | emotikon | emoji | Declines naturally |
| encryption | šifriranje | enkripcija | Windows' word |
| firmware | firmver | programska oprema | Short and widely used |
| touchpad | dodirna pločica | touchpad | Windows' word |
| computer | računalo | računar | Croatian standard |
