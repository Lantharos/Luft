# Slovenian

What is particular to Slovenian, on top of [the rules every language shares](common.md). The agreed terms are in [sl.tbx](sl.tbx).

## Address

Prefer sentences without a person: „Posodobitve se namestijo ob naslednjem zagonu“, „Ni obvestil“. When the reader has to be addressed, use vi, lowercase, as Windows, macOS, GNOME and KDE do: „To lahko pozneje spremenite v Nastavitvah.“ Never Vi or Vaš with a capital, and never ti. Prefer Slovenian words where the borrowed one isn't what people say: datoteka, mapa, računalnik, zaslon, obvestilo, posodobitev.

## Buttons and labels

- Buttons and menu items take the imperative singular, as Windows and GNOME do: „Shrani“, „Odpri“, „Prekliči“, „Znova zaženi“, „Pripni v opravilno vrstico“. The button is a command the reader gives, so this sits fine next to vi.
- Some actions are nouns, as in Windows, and the power menu uses them: „Prijava“, „Odjava“, „Spanje“, „Mirovanje“, „Zaustavitev sistema“, „Vnovični zagon“.
- Placeholders that ask for a choice speak to the reader: „Izberite“. Instructions use vi: „Pritisnite Super+Tab, da vidite vsa okna.“
- A label named in a sentence keeps its capital and needs no quotation marks: „vklopite Ne moti“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces: „ – “. No em dashes.
- The ellipsis takes no space before it when it cuts a word short, and a space otherwise.
- No space before ! ? : ;. Units and the percent sign take a space: „57 %“, „4,5 W“.
- Keys use the names printed on Slovenian keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. Only the space bar is translated: Preslednica.

## Names

- Settings, Disks and Install Luft are Nastavitve, Diski and Namesti Luft.
- Start stays Start; write „meni Start“ when it has to decline („v meniju Start“).
- Don't decline app names; put the kind of thing first: „v aplikaciji Rover“. Luft is masculine and declines when it must (Lufta, Luftu).
- Names used as modifiers follow the noun: „vmesnik Bluetooth“, „ključek USB“, „naslov IP“.

## Plurals

Four forms, decided by the last two digits: `one` (1, 101, 201, not 11 or 21), `two` (2, 102), `few` (3, 4, 103, 104) and `other` (0, 5–100, 21 and the rest). Since `one` covers 101 too, always write `{ $count }`. The dual matters for adjectives and verbs:

```ftl
minutes-left = { $count ->
    [one] Preostala je še { $count } minuta
    [two] Preostali sta še { $count } minuti
    [few] Preostale so še { $count } minute
   *[other] Preostalo je še { $count } minut
}
```

## Words

| English | Slovenian | Not | Why |
| --- | --- | --- | --- |
| app | aplikacija | program | What Windows and app stores say |
| board | tabla | plošča, platno | A board you lay things out on; plošča is a panel or disc |
| All windows | Vsa okna | Pogled opravil | What Luft calls the task view |
| taskbar | opravilna vrstica | vrstica opravil | Windows' word |
| tray | sistemska vrstica | območje za obvestila | KDE's word; it holds apps, not notifications |
| pin, unpin | pripeti, odpeti | pritrditi | Windows' words |
| snap, snap layout | zaskočiti, postavitev oken | pripeti | Pripeti is pin |
| workspace | delovna površina | namizje | GNOME's word; namizje is the desktop, also in the task view |
| wallpaper | ozadje | slika ozadja | Windows and GNOME |
| suspend, sleep | spanje | pripravljenost | Windows' word |
| hibernate | mirovanje | hibernacija | Windows' word |
| Night light | Nočna svetloba | Nočna lučka | GNOME's word; lučka sounds like a lamp |
| passkey | ključ za dostop | passkey, geslo za dostop | Windows and Google |
| Keyring | zbirka ključev | obesek za ključe | GNOME's word |
| clipboard | odložišče | odlagališče | Windows and GNOME |
| emoji | emodži | čustvenček, emoji | Standard spelling; čustvenček is an emoticon |
| firmware | vdelana programska oprema | firmware | Windows' word |
| touchpad | sledilna ploščica | touchpad | Windows' word |
| About | O sistemu | Vizitka | GNOME; Vizitka reads as a business card |
| keyboard shortcut | bližnjica na tipkovnici | tipkovna bližnjica | Windows' word |
| passphrase | šifrirno geslo | geslo za šifriranje | Short, and apart from the account password |
| PIN | PIN; koda PIN where it has to decline | PIN-koda | PIN itself declines awkwardly |
| input source | vir vnosa | vhodni vir | GNOME's word |
| metered connection | merjena povezava | omejena povezava | Omejena reads as limited, not counted |
| inactive | nedejavnost | neaktivnost | The Slovenian word |
| Wallpapers folder | mapa Wallpapers | mapa Ozadja | The folder keeps its English name |
