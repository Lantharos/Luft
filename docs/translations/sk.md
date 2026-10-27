# Slovak style guide

How Luft speaks Slovak. The [glossary](../../packages/i18n/glossary/sk.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: „Aktualizácie sa nainštalujú pri ďalšom reštarte“, „Žiadne oznámenia“.
- When the reader has to be addressed, use **vy**, lowercase, as Windows, macOS, GNOME and KDE all do in Slovak: „Môžete to neskôr zmeniť v Nastaveniach.“ Never capitalize Vy or Váš, and never switch to ty.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as „prosím“ at the start of every hint, no marketing words.
- Say what happens, not how it works inside.
- Instructions in running text use the imperative plural: „Stlačte Super+Tab, aby ste videli všetky okná.“, „Vyberte“, „Kliknite“, „Skúste to znova“.

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as in Windows, macOS and GNOME: „Uložiť“, „Otvoriť“, „Zrušiť“, „Reštartovať“, „Pripnúť na panel úloh“.
- A few power menu items are nouns, as in Windows: „Režim spánku“, „Dlhodobý spánok“.
- Switches and settings are nouns or short phrases: „Nočné osvetlenie“, „Zobrazovať sekundy“.
- Headings and page names are nouns: „Oznámenia“, „Súkromie“.
- Short status messages use the neuter past participle without a verb: „Uložené“, „Skopírované“.
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Rýchle nastavenia“, not „Rýchle Nastavenia“. In running text, Luft's parts are ordinary nouns: „panel úloh“, „uzamknutá obrazovka“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „zapnite Nerušiť“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Apostrophes are rare in Slovak; where a foreign name needs one, use ’.
- Ellipsis: one character, „…“, with no space before it.
- Dash: the en dash with spaces, „ – “.
- Percent sign and units are separated from the number by a non-breaking space: „57 %“, „4,5 W“.
- Key names stay as printed on Slovak keyboards, which use the English names: Ctrl, Alt, Shift, Enter, Delete. The space bar is „Medzerník“.
- Always use the diacritics (ä, ô, ľ, ĺ, ŕ, ď, ť, ň, ...); never replace them with plain letters.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Nastavenia, Disky, Inštalovať Luft.
- Start stays Start; say „ponuka Start“ when it has to inflect: „v ponuke Start“.
- Avoid inflecting app names. Put the kind of thing first: „v aplikácii Rover“, „aplikácia Tern je zatvorená“. Luft and Kestrel inflect like inanimate masculine nouns when a sentence needs it („do Luftu“, „v Kestreli“), but prefer sentences where they don't have to.
- Trademarks come after the noun they describe: „adaptér Bluetooth“, „sieť Wi-Fi“.

## Plurals

Slovak has four forms: `one` (exactly 1), `few` (2, 3, 4), `many` (decimal numbers such as 1,5) and `other` (0 and 5 and up). `many` takes the genitive singular. Always write all four, keep `{ $count }` in each instead of a digit, and keep `*[other]` as the default. Adjectives and verbs agree too:

```ftl
windows-open = { $count ->
    [one] { $count } otvorené okno
    [few] { $count } otvorené okná
    [many] { $count } otvoreného okna
   *[other] { $count } otvorených okien
}
minutes-left = { $count ->
    [one] Zostáva { $count } minúta
    [few] Zostávajú { $count } minúty
    [many] Zostáva { $count } minúty
   *[other] Zostáva { $count } minút
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Žiadne oznámenia`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Naposledy skontrolované: { $date }“.

## Decisions

| English | Slovak | Instead of | Why |
| --- | --- | --- | --- |
| you | vy, lowercase, or no person | ty | Windows, macOS, GNOME and KDE |
| account | účet | konto | GNOME, KDE, Google and Apple; Windows' „konto“ is less common in speech |
| board | tabuľa | plátno, doska | A board you lay things out on; „plátno“ is the canvas inside it |
| All windows | Všetky okná | Zobrazenie úloh | That's what Luft calls the task view |
| taskbar | panel úloh | hlavný panel | Windows' word |
| tray | systémová lišta | oblasť oznámení | KDE's word; it holds apps, not notifications |
| pin, unpin | pripnúť, odopnúť | pridať na panel | Windows' words |
| snap | prichytiť | pripnúť | Windows' word; „pripnúť“ is pin |
| snap layout | rozloženie okien | rozloženie prichytenia | Says what it is; Windows' phrase is little known |
| notification | oznámenie | upozornenie, hlásenie | Windows' word; „upozornenie“ is an alert sound |
| workspace | pracovný priestor | pracovná plocha | GNOME's word; „pracovná plocha“ is the desktop |
| wallpaper | pozadie | tapeta | Windows and GNOME |
| remove, delete | odstrániť, vymazať | odstrániť for both | Keeps taking off a list apart from destroying data |
| suspend, sleep | uspať, menu item Režim spánku | suspendovať | Windows' words |
| hibernate | Dlhodobý spánok | hibernácia | Windows' word |
| restart | reštartovať | znova spustiť | Windows and what people say |
| Power saver | Šetrenie energie | Šetrič batérie | GNOME's word; Windows' battery saver is a different feature |
| Keep awake | Nezaspávať | Udržať prebudené | Short and natural for a tile |
| security | zabezpečenie | bezpečnosť | Windows' settings page |
| privacy | súkromie | ochrana osobných údajov | Short; GNOME and macOS |
| Keyring | zväzok kľúčov | kľúčenka | GNOME's word |
| passkey | prístupový kľúč | passkey | Windows and Apple in Slovak |
| firmware | firmvér | firmware | Slovak spelling, used by Windows |
| USB stick | USB kľúč | jednotka USB flash | What people say |
| touchpad | touchpad | dotyková plocha | Windows' word and what people say |
| Start | Start | Štart | Luft keeps the name as it is |
| passphrase | prístupová fráza | heslo | Keeps the disk's phrase apart from the account password |
| PIN | PIN in labels and buttons, kód PIN in sentences | PIN kód | Windows' usage |
| input source | zdroj vstupu | metóda vstupu | GNOME's word; „metóda vstupu“ is input method |
| workspace name in the task view | Pracovný priestor 1 | Plocha 1 | Same word as everywhere else for workspaces |
| driver | ovládač | driver | Windows' word |
| metered connection | merané pripojenie | obmedzené pripojenie | GNOME's word |
| sticky, slow, bounce keys | Lepiace klávesy, Pomalé klávesy, Filtrovanie opakovaných stlačení | | Windows and GNOME |
| dwell click | kliknutie zotrvaním | kliknutie pri ukázaní | GNOME's word |
| home folder, Pictures | domovský priečinok (Domov), Obrázky | | The folder names Slovak systems show; Wallpapers keeps its English name |
