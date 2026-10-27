# Hungarian style guide

How Luft speaks Hungarian. The [glossary](../../packages/i18n/glossary/hu.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: „A frissítések a következő újraindításkor települnek”, „Nincsenek értesítések”.
- When the reader has to be addressed, use the **formal verb forms** (magázás), as Windows, macOS, GNOME and KDE all do in Hungarian: „Ezt később a Beállításokban módosíthatja.” Leave out the pronoun Ön; the verb already says who is meant. Never switch to tegezés.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as „Kérjük” at the start of every hint, no marketing words.
- Say what happens, not how it works inside.
- Instructions in running text use the formal imperative: „Nyomja meg a Super+Tab billentyűparancsot az összes ablak megjelenítéséhez.” „Próbálja újra.”

## Buttons, menus and labels

- Buttons and menu items use the **action noun** ending in -ás/-és, as Windows, macOS and GNOME do: „Mentés”, „Megnyitás”, „Újraindítás”, „Rögzítés a tálcán”. A few fixed words are not nouns: „Mégse”, „Tovább”, „Kész”, „Újra”.
- Never use the imperative on a button („Mentse”) or the infinitive („Menteni”).
- Switches and settings are nouns or short phrases: „Éjszakai fény”, „Másodpercek megjelenítése”.
- Headings and page names are nouns: „Értesítések”, „Adatvédelem”.
- States shown after an action use the past participle: „Mentve”, „Másolva”, „Ujjlenyomat hozzáadva.”
- Keep labels short. Hungarian compounds get long fast; if a label clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Gyorsbeállítások”, „Bejelentkezési képernyő”. In running text, Luft's parts are ordinary nouns: „a tálca”, „a zárolási képernyő”. Lomtár and Start are names and keep their capital. A label quoted in a sentence keeps its capital letter and needs no quotation marks: „kapcsolja be a Ne zavarjanak funkciót”.

## Typography

- Quotation marks: „…”, and »…« inside them.
- Apostrophe: ’, rarely needed in Hungarian.
- Ellipsis: one character, „…”, with no space before it: „Betöltés…”.
- Dash: the en dash with spaces, „ – ”. No em dashes.
- No space before punctuation.
- Percent sign directly after the number, with no space: „57%”. Units take a space: „4,5 W”, „120 GB”.
- Suffixes on numbers, abbreviations and foreign words that end in a silent or unusual letter take a hyphen: „57%-on”, „USB-n”, „pendrive-ot”. Compounds with names or abbreviations take one too: „Bluetooth-eszköz”, „Wi-Fi-hálózat”, „PDF-fájl”.
- Key names follow what Hungarian keyboards print, which is mostly English: Ctrl, Alt, Shift, Enter, Esc, Tab, Backspace, Delete, Home, End, Page Up, Page Down, Print Screen. Only the space bar is translated: Szóköz.
- Write „e-mail” and „online”.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Beállítások, Lemezek, Luft telepítése.
- The article follows pronunciation: „a Luft”, „a Rover”, „a Magpie”. Never write „a(z)”; before a placeable whose first sound isn't known, rewrite the sentence so it needs no article.
- Suffixes on names are the usual source of trouble. Luft and Kestrel take suffixes normally: „a Luftban”, „a Kestrelben”. For the apps, put the kind of thing next to the name and inflect that: „a Rover alkalmazásban”, „a Tern alkalmazást”. Start becomes „Start menü” when it needs a suffix: „a Start menüben”.
- Never attach a suffix to a placeable such as `{ $name }` or `{ $app }`: vowel harmony and the article depend on the value, which the translation can't know. Use a colon („Megnyitva: { $name }”) or let a following noun take the suffix: „{ $app } alkalmazásban”, „{ $name } nevű fájlt”.

## Plurals

Hungarian has two forms, `one` (1) and `other` (everything else, including 0). Nouns stay singular after a number, so both variants often read the same. Keep both anyway, and always keep `{ $count }` in both and `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } értesítés
   *[other] { $count } értesítés
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Nincsenek értesítések`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it so it needs no suffix: „Utolsó ellenőrzés: { $date }”.

## Decisions

| English | Hungarian | Instead of | Why |
| --- | --- | --- | --- |
| you | formal verb forms, or no person | tegezés | Windows, macOS, GNOME and KDE |
| buttons | action noun: Mentés | imperative: Mentse | Every Hungarian desktop does this |
| app | alkalmazás | app, program | Windows' word |
| board | tábla | vászon | Short; vászon is the canvas inside it |
| All windows | Összes ablak | Feladatnézet | That's what Luft calls the task view |
| snap, snap layout | illeszt, illesztési elrendezés | dokkol, rögzít | Windows' words; rögzít is pin |
| tray | rendszertálca | értesítési terület | Best known; it holds apps, not notifications |
| lock screen | zárolási képernyő | lezárási képernyő | Windows' word |
| workspace | munkaterület | asztal | GNOME's word; asztal is the desktop |
| Airplane mode | Repülőgép mód | Repülőgépes üzemmód | Shorter; Apple's word |
| Power mode | Energiamód | Energiagazdálkodási mód | Fits the quick settings tile |
| power | Tápellátás | Energia | Windows' settings page |
| suspend, sleep | alvó állapot | felfüggesztés | Windows' word |
| emoji | emodzsi | emoji | Windows and Hungarian spelling |
| passkey | jelkulcs | azonosítókulcs, passkey | Windows and Apple |
| Keyring | kulcstartó | Kulcskarika | GNOME's word; lowercase in running text, like the English |
| sandbox | homokozó | sandbox | Established Hungarian IT word |
| trash | Lomtár | Kuka | Windows' word, best known |
| USB stick | pendrive | USB flash meghajtó | What people say |
| touchpad | érintőpad | touchpad | Windows' word |
| display | kijelző | monitor | Windows' settings page |
| About | Névjegy | Információ | Windows and macOS |
| passphrase | jelmondat | jelszó | Not the account password; Windows' BitLocker word |
| input source | beviteli forrás | bemeneti forrás | GNOME's word |
| home folder | Saját mappa | Kezdőmappa | What Rover shows |
| Wallpapers folder | Wallpapers | Háttérképek | The real folder keeps its English name |
| driver | illesztőprogram | meghajtóprogram | Windows' word |
| graphics card | videokártya | grafikus kártya | What people say |
| metered connection | forgalomkorlátos kapcsolat | mért kapcsolat | Windows' word |
| connected (network, Bluetooth) | Csatlakozva | Csatlakoztatva | Csatlakoztatva is kept for things plugged in: töltő, lemez |
| Sticky keys, Slow keys | Beragadó billentyűk, Lassú billentyűk | Ragadós billentyűk | Windows' words |
| Click by resting the pointer | Kattintás a mutató megállításával | Várakozó kattintás | Same name in Settings and on the lock screen |
| Zoom (accessibility) | Nagyítás | Nagyító | Same name in Settings, shortcuts and the lock screen |
