# Slovak

What is particular to Slovak, on top of [the rules every language shares](common.md). The agreed terms are in [sk.tbx](sk.tbx).

## Address

Prefer sentences without a person: „Aktualizácie sa nainštalujú pri ďalšom reštarte“, „Žiadne oznámenia“. When the reader has to be addressed, use vy, lowercase, as Windows, macOS, GNOME and KDE do: „Môžete to neskôr zmeniť v Nastaveniach.“ Never Vy or Váš with a capital, and never ty. Instructions take the imperative plural: „Stlačte Super+Tab, aby ste videli všetky okná.“, „Skúste to znova“.

## Buttons and labels

- Buttons and menu items take the infinitive: „Uložiť“, „Otvoriť“, „Zrušiť“, „Pripnúť na panel úloh“.
- A few power menu items are nouns, as in Windows: „Režim spánku“, „Dlhodobý spánok“.
- Short status messages use the neuter past participle: „Uložené“, „Skopírované“.
- A label named in a sentence keeps its capital and needs no quotation marks: „zapnite Nerušiť“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces: „ – “.
- Percent signs and units take a non-breaking space: „57 %“, „4,5 W“.
- Keys use the English names printed on Slovak keyboards: Ctrl, Alt, Shift, Enter, Delete. The space bar is „Medzerník“.
- Always write the diacritics: ä, ô, ľ, ĺ, ŕ, ď, ť, ň.

## Names

- Settings, Disks and Install Luft are Nastavenia, Disky and Inštalovať Luft.
- Start stays Start; write „ponuka Start“ when it has to inflect: „v ponuke Start“.
- Don't inflect app names; put the kind of thing first: „v aplikácii Rover“. Luft and Kestrel inflect as inanimate masculine nouns when they must („do Luftu“, „v Kestreli“).
- Trademarks follow the noun they describe: „adaptér Bluetooth“, „sieť Wi-Fi“.

## Plurals

Four forms: `one` (1), `few` (2–4), `many` (decimals such as 1,5, with the genitive singular) and `other` (0 and 5 up). Write all four. Adjectives and verbs agree:

```ftl
minutes-left = { $count ->
    [one] Zostáva { $count } minúta
    [few] Zostávajú { $count } minúty
    [many] Zostáva { $count } minúty
   *[other] Zostáva { $count } minút
}
```

## Words

| English | Slovak | Not | Why |
| --- | --- | --- | --- |
| account | účet | konto | GNOME, KDE, Google and Apple |
| board | tabuľa | plátno, doska | A board you lay things out on; plátno is the canvas inside it |
| All windows | Všetky okná | Zobrazenie úloh | What Luft calls the task view |
| taskbar | panel úloh | hlavný panel | Windows' word |
| tray | systémová lišta | oblasť oznámení | KDE's word; it holds apps, not notifications |
| pin, unpin | pripnúť, odopnúť | pridať na panel | Windows' words |
| snap, snap layout | prichytiť, rozloženie okien | pripnúť | Pripnúť is pin; the layout name says what it is |
| notification | oznámenie | upozornenie | Windows' word; upozornenie is an alert sound |
| workspace | pracovný priestor | pracovná plocha | GNOME's word; plocha is the desktop |
| wallpaper | pozadie | tapeta | Windows and GNOME |
| remove, delete | odstrániť, vymazať | odstrániť for both | Keeps taking off a list apart from destroying data |
| suspend, sleep | uspať; the menu item is Režim spánku | suspendovať | Windows' words |
| hibernate | Dlhodobý spánok | hibernácia | Windows' word |
| Power saver | Šetrenie energie | Šetrič batérie | GNOME's word; battery saver is another Windows feature |
| Keep awake | Nezaspávať | Udržať prebudené | Short and natural for a tile |
| security | zabezpečenie | bezpečnosť | Windows' settings page |
| privacy | súkromie | ochrana osobných údajov | Short; GNOME and macOS |
| Keyring | zväzok kľúčov | kľúčenka | GNOME's word |
| passkey | prístupový kľúč | passkey | Windows and Apple |
| firmware | firmvér | firmware | Slovak spelling, used by Windows |
| USB stick | USB kľúč | jednotka USB flash | What people say |
| passphrase | prístupová fráza | heslo | Apart from the account password |
| PIN | PIN on labels, kód PIN in sentences | PIN kód | Windows' usage |
| input source | zdroj vstupu | metóda vstupu | GNOME's word; metóda vstupu is input method |
| driver | ovládač | driver | Windows' word |
| metered connection | merané pripojenie | obmedzené pripojenie | GNOME's word |
| dwell click | kliknutie zotrvaním | kliknutie pri ukázaní | GNOME's word |
| home folder, Pictures | domovský priečinok (Domov), Obrázky | | What Slovak systems show; Wallpapers keeps its English name |
