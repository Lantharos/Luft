# Swedish

What is particular to Swedish, on top of [the rules every language shares](common.md). The agreed terms are in [sv.tbx](sv.tbx).

## Address

Address the reader as du, lowercase, as macOS, Windows, GNOME and KDE do: ”Du kan ändra det senare i Inställningar.” Never ni. Failures say ”Det gick inte att …”: ”Det gick inte att spara filen.” It's what Windows and macOS say, and it blames no one.

## Buttons and labels

- Buttons and menu items take the imperative: ”Spara”, ”Öppna”, ”Avbryt”, ”Starta om”, ”Fäst i aktivitetsfältet”.
- Confirmation titles ask with ”Vill du …?”: ”Vill du ta bort den här lösennyckeln?”.
- A few power items are nouns, as in Windows and KDE: ”Viloläge”, ”Dvala”.
- Status takes the passive or a short participle: ”Laddas”, ”Sparad”, ”Fingeravtrycket har lagts till.”
- Ordinary compounds are one word, never split: ”skärminställningar”.
- Days, months and languages are lowercase. A label named in a sentence keeps its capital and needs no quotation marks: ”slå på Stör ej”.

## Typography

- Quotation marks ”…”, the same mark on both sides, with ’…’ inside them.
- The ellipsis takes a space before it when it stands for missing words, and none when it cuts a word short.
- The dash is an en dash with spaces, and without spaces in ranges: 2–4. No em dashes.
- Percent signs and units take a space: ”57 %”, ”4,5 W”.
- & in English names becomes och: ”Datum och tid”.
- Compounds with names, abbreviations or digits take a hyphen: ”Bluetooth-adapter”, ”USB-minne”, ”Start-menyn”.
- Write ”e-post” and ”Wi-Fi”.
- Keys follow Swedish keyboards and Windows: Ctrl, Alt, Skift, Enter, Esc, Tabb, Backsteg, Blanksteg. Keys whose English name is printed on them keep it: Delete, Home, End.

## Names

- Settings, Disks and Install Luft are Inställningar, Diskar and Installera Luft.
- Start stays Start, and ”Start-menyn” in a sentence, as in Windows.
- App names don't take the definite ending; use them bare or after appen: ”Rover är öppen”, ”i appen Tern”. The genitive is a plain -s (”Rovers fönster”); names ending in s, such as Keys, need rephrasing: ”fönstret i Keys”. Adjectives agree with app, an en-word: ”Tern är stängd”.

## Plurals

Two forms, `one` and `other`.

```ftl
notifications-count = { $count ->
    [one] { $count } notis
   *[other] { $count } notiser
}
```

## Words

| English | Swedish | Not | Why |
| --- | --- | --- | --- |
| notification, notification center | notis, Notiscenter | avisering, meddelande | iPhone and macOS, and how people talk; meddelande is also a message |
| board | tavla | bräda, duk | Short and clear; duk is the canvas inside it |
| All windows | Alla fönster | Aktivitetsvy | What Luft calls the task view |
| snap, snap layout | docka, dockningslayout | fästa | Windows uses fästa for snap and pin; Luft keeps them apart |
| pin, unpin | fästa, lossa | nåla fast | Windows' words |
| taskbar | aktivitetsfält | verktygsfält | Windows' word |
| tray | systemfält | meddelandefält | Windows' word; it holds apps |
| workspace | arbetsyta | skrivbord | GNOME's word; skrivbord is the desktop |
| wallpaper | bakgrundsbild | bakgrund | Bakgrund is ambiguous next to colours |
| suspend, sleep | Viloläge | Strömsparläge | Strömsparläge collides with power saver; KDE and Ubuntu say Viloläge |
| hibernate | Dvala | Viloläge | Keeps it apart from sleep; KDE and Ubuntu |
| Power saver | Energisparläge | Batterisparläge | Matches Energiläge |
| Dictation | Diktering | Röstskrivning | macOS' word |
| Keyring | Nyckelring | Nyckelhanterare | GNOME's word |
| privacy | Integritet | Sekretess | macOS and GNOME; sekretess sounds like confidentiality |
| accessibility | Hjälpmedel | Tillgänglighet | Windows and GNOME |
| touchpad | styrplatta | pekplatta | Windows and macOS |
| keyboard shortcut | kortkommando | snabbtangent | Windows, macOS and GNOME |
| delete | radera | ta bort | Keeps it apart from remove, which is ta bort |
| firmware | firmware | inbyggd programvara | What people say; Windows' term is long |
| download | hämta, hämtning | ladda ned | Windows and macOS |
| drive | disk | enhet | Matches Diskar; enhet is for devices |
| passphrase, PIN | lösenfras, PIN-kod | lösenordsfras, PIN | Windows' words |
| input source | inmatningskälla | indatakälla | GNOME's word |
| metered connection | anslutning med datapriser | uppmätt anslutning | Windows' wording |
| hotspot, tethering | surfzon, delad anslutning | hotspot | Windows' Mobil surfzon |
| Sticky keys, Slow keys | Tröga tangenter, Långsamma tangenter | Klistriga tangenter | Windows' names |
