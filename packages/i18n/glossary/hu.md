# Hungarian

What is particular to Hungarian, on top of [the rules every language shares](common.md). The agreed terms are in [hu.tbx](hu.tbx).

## Address

Prefer sentences without a person: „A frissítések a következő újraindításkor települnek”, „Nincsenek értesítések”. When the reader has to be addressed, use the formal verb forms (magázás) without Ön, as Windows, macOS, GNOME and KDE do: „Ezt később a Beállításokban módosíthatja.” Never tegezés. Instructions take the formal imperative: „Próbálja újra.”

## Buttons and labels

- Buttons and menu items take the action noun in -ás/-és, as Windows, macOS and GNOME do: „Mentés”, „Megnyitás”, „Újraindítás”, „Rögzítés a tálcán”. Never the imperative („Mentse”) or the infinitive. A few fixed words aren't nouns: „Mégse”, „Tovább”, „Kész”, „Újra”.
- Results take the past participle: „Mentve”, „Ujjlenyomat hozzáadva.”
- Lomtár and Start are names and keep their capital. A label named in a sentence keeps its capital and needs no quotation marks: „kapcsolja be a Ne zavarjanak funkciót”.

## Typography

- Quotation marks „…”, with »…« inside them.
- The dash is an en dash with spaces. No em dashes.
- The percent sign takes no space („57%”); units do („4,5 W”).
- Suffixes on numbers, abbreviations and foreign words ending in a silent or unusual letter take a hyphen: „57%-on”, „USB-n”, „pendrive-ot”. So do compounds with names or abbreviations: „Bluetooth-eszköz”, „Wi-Fi-hálózat”.
- Keys use the mostly English names printed on Hungarian keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. Only the space bar is translated: Szóköz.
- Write „e-mail” and „online”.

## Names

- Settings, Disks and Install Luft are Beállítások, Lemezek and Luft telepítése.
- The article follows pronunciation: „a Luft”, „a Rover”. Never write „a(z)”; before a variable whose first sound is unknown, rewrite the sentence so it needs no article.
- Luft and Kestrel take suffixes normally: „a Luftban”, „a Kestrelben”. For the apps, inflect a noun next to the name: „a Rover alkalmazásban”. Start becomes „a Start menüben”.
- Never attach a suffix to a variable such as `{ $name }`, since harmony depends on the value. Use a colon („Megnyitva: { $name }”) or a following noun: „{ $name } nevű fájlt”.

## Plurals

Two forms, `one` and `other`. Nouns stay singular after a number, so both often read the same; keep both anyway.

```ftl
notifications-count = { $count ->
    [one] { $count } értesítés
   *[other] { $count } értesítés
}
```

## Words

| English | Hungarian | Not | Why |
| --- | --- | --- | --- |
| app | alkalmazás | app, program | Windows' word |
| board | tábla | vászon | Short; vászon is the canvas inside it |
| All windows | Összes ablak | Feladatnézet | What Luft calls the task view |
| snap, snap layout | illeszt, illesztési elrendezés | dokkol, rögzít | Windows' words; rögzít is pin |
| tray | rendszertálca | értesítési terület | Best known; it holds apps |
| lock screen | zárolási képernyő | lezárási képernyő | Windows' word |
| workspace | munkaterület | asztal | GNOME's word; asztal is the desktop |
| Airplane mode | Repülőgép mód | Repülőgépes üzemmód | Shorter; Apple's word |
| Power mode, power | Energiamód, Tápellátás | Energiagazdálkodási mód, Energia | Fits the tile; Windows' settings page |
| suspend, sleep | alvó állapot | felfüggesztés | Windows' word |
| emoji | emodzsi | emoji | Windows and Hungarian spelling |
| Keyring | kulcstartó | Kulcskarika | GNOME's word; lowercase in running text |
| sandbox | homokozó | sandbox | Established Hungarian IT word |
| trash | Lomtár | Kuka | Windows' word |
| USB stick | pendrive | USB flash meghajtó | What people say |
| touchpad | érintőpad | touchpad | Windows' word |
| display | kijelző | monitor | Windows' settings page |
| About | Névjegy | Információ | Windows and macOS |
| passphrase | jelmondat | jelszó | Not the account password; BitLocker's word |
| input source | beviteli forrás | bemeneti forrás | GNOME's word |
| home folder | Saját mappa | Kezdőmappa | What Rover shows |
| Wallpapers folder | Wallpapers | Háttérképek | The folder keeps its English name |
| driver | illesztőprogram | meghajtóprogram | Windows' word |
| graphics card | videokártya | grafikus kártya | What people say |
| metered connection | forgalomkorlátos kapcsolat | mért kapcsolat | Windows' word |
| connected (network, Bluetooth) | Csatlakozva | Csatlakoztatva | Csatlakoztatva is for things plugged in |
| Sticky keys, Slow keys | Beragadó billentyűk, Lassú billentyűk | Ragadós billentyűk | Windows' words |
| Click by resting the pointer | Kattintás a mutató megállításával | Várakozó kattintás | One name in Settings and on the lock screen |
| Zoom (accessibility) | Nagyítás | Nagyító | One name in Settings, shortcuts and the lock screen |
