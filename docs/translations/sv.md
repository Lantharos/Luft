# Swedish style guide

How Luft speaks Swedish. The [glossary](../../packages/i18n/glossary/sv.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Address the reader as **du**, lowercase, as macOS, Windows, GNOME and KDE all do in Swedish: ”Du kan ändra det senare i Inställningar.” Never ”ni”.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as ”Vänligen” or ”Observera”, no marketing words.
- Say what happens, not how it works inside. ”Uppdateringarna installeras nästa gång du startar om”, not ”Systemavbildningen byts ut vid uppstart”.
- When English uses ”you” only out of habit, leave it out: ”Inga notiser” for ”You have no notifications”.
- Prefer ”Det gick inte att …” for failures: ”Det gick inte att spara filen.” It is what Windows and macOS say and it avoids blaming anyone.

## Buttons, menus and labels

- Buttons and menu items use the **imperative**: ”Spara”, ”Öppna”, ”Avbryt”, ”Starta om”, ”Fäst i aktivitetsfältet”.
- Confirmation titles ask with ”Vill du …?”: ”Vill du ta bort den här lösennyckeln?”, ”Vill du radera { $drive }?”.
- A few power and state items are nouns, as in Windows and KDE: ”Viloläge”, ”Dvala”.
- Switches and settings are nouns or short phrases: ”Nattljus”, ”Visa sekunder”.
- Headings and page names are nouns: ”Notiser”, ”Integritet”.
- Instructions in running text use the imperative too: ”Tryck på Super+Tabb för att se alla fönster.”
- Status messages use the passive or a short participle: ”Laddas”, ”Sparad”, ”Fingeravtrycket har lagts till.”
- Swedish runs about as long as English. Long compounds are the risk; if a label clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. ”Snabbinställningar”, ”Datum och tid”. Luft's parts are ordinary nouns in running text: ”aktivitetsfältet”, ”låsskärmen”. A label named in a sentence keeps its capital letter and needs no quotation marks: ”slå på Stör ej”. Days, months and languages are lowercase.

## Typography

- Quotation marks: ”…”, the same character on both sides, and ’…’ inside them.
- Apostrophe: ’, the typographic one.
- Ellipsis: one character, ”…”. A space before it when it stands for missing words (”Läser in …”), none when part of a word is left out.
- Dash: the en dash with spaces, ” – ”. No em dashes. Ranges use the en dash without spaces: 2–4.
- A space before the percent sign and before units: ”57 %”, ”4,5 W”.
- ”&” in English names becomes ”och”: ”Datum och tid”.
- Compounds with names, abbreviations or digits take a hyphen: ”Bluetooth-adapter”, ”USB-minne”, ”Wi-Fi-nätverk”, ”Start-menyn”. Ordinary compounds are written as one word, never split: ”skärminställningar”, not ”skärm inställningar”.
- Write ”e-post” and ”Wi-Fi”.
- Key names follow Swedish keyboards and Windows: Ctrl, Alt, Skift, Enter, Esc, Tabb, Backsteg, Blanksteg. Keys whose English name is printed on Swedish keyboards keep it: Delete, Insert, Home, End, Page Up, Page Down, Print Screen.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Inställningar, Diskar, Installera Luft.
- Start stays Start; in a sentence it becomes ”Start-menyn”, as in Windows.
- App names don't take the definite ending. Use them bare or with ”appen” in front: ”Rover är öppen”, ”i appen Tern”. Genitive with a plain -s: ”Rovers fönster”; ”Keys” and other names ending in s take no extra s, so rephrase: ”fönstret i Keys”.
- Adjectives about an app agree with ”app” (en-word): ”Tern är stängd”.

## Plurals

Swedish has two forms: `one` (only 1) and `other` (everything else, including 0). Always keep `{ $count }` in both, and keep `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } notis
   *[other] { $count } notiser
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Inga notiser`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it: ”Senast kontrollerad: { $date }”.

## Decisions

| English | Swedish | Instead of | Why |
| --- | --- | --- | --- |
| notification | notis, notiser | avisering, meddelande | What iPhone and macOS say and how people talk; ”meddelande” also means a message |
| notification center | Notiscenter | Meddelandecenter | Follows ”notis”; macOS' word |
| board | tavla | bräda, duk | Short and clear; ”duk” is the canvas inside it |
| All windows | Alla fönster | Aktivitetsvy | That's what Luft calls the task view |
| snap, snap layout | docka, dockningslayout | fästa | Windows uses ”fästa” for both snap and pin; Luft keeps them apart |
| pin, unpin | fästa, lossa | nåla fast | Windows' words |
| taskbar | aktivitetsfält | verktygsfält | Windows' word |
| tray | systemfält | meddelandefält | Windows' word; it holds apps, not notifications |
| workspace | arbetsyta | skrivbord | GNOME's word; ”skrivbord” is the area behind the windows |
| wallpaper | bakgrundsbild | bakgrund | ”Bakgrund” is ambiguous next to colors |
| suspend, sleep | Viloläge | Strömsparläge, Vänteläge | Windows' ”Strömsparläge” collides with the power saver mode; KDE and Ubuntu say Viloläge |
| hibernate | Dvala | Viloläge | Windows calls hibernate Viloläge, which would clash with sleep; KDE and Ubuntu say Dvala |
| Power saver | Energisparläge | Batterisparläge | Matches Energiläge, the setting it belongs to |
| Dictation | Diktering | Röstskrivning | macOS' word, and it fits Settings' page names |
| passkey | lösennyckel | passkey, nyckel | Apple's word; plain ”nyckel” is too vague next to the recovery key |
| Keyring | Nyckelring | Nyckelhanterare | GNOME's word |
| privacy | Integritet | Sekretess | macOS and GNOME; ”sekretess” sounds like confidentiality |
| accessibility | Hjälpmedel | Tillgänglighet | Windows and GNOME |
| touchpad | styrplatta | pekplatta, touchpad | Windows' and macOS' word |
| keyboard shortcut | kortkommando | snabbtangent | Windows, macOS and GNOME |
| delete | radera | ta bort | Keeps it apart from remove, which is ”ta bort” |
| firmware | firmware | inbyggd programvara | What people say; Windows' term is long |
| sound | Ljud | Audio | Windows and macOS |
| download | hämta, hämtning | ladda ned, nedladdning | Windows' and macOS' word |
| drive | disk | enhet | Matches Diskar; ”enhet” is kept for devices and USB-enheter |
| passphrase, PIN | lösenfras, PIN-kod | lösenordsfras, PIN | Windows' words |
| input source | inmatningskälla | indatakälla | GNOME's word |
| metered connection | anslutning med datapriser | uppmätt anslutning | Windows' wording |
| hotspot, tethering | surfzon, delad anslutning | hotspot | Windows calls the hotspot Mobil surfzon |
| Sticky keys, Slow keys | Tröga tangenter, Långsamma tangenter | Klistriga tangenter | ”Tröga tangenter” is Windows' name |
