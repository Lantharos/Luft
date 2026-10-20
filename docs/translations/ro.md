# Romanian style guide

How Luft speaks Romanian. The [glossary](../../packages/i18n/glossary/ro.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: „Actualizările se instalează la următoarea repornire”, „Nicio notificare”.
- When the reader has to be addressed, use the polite plural verb forms, as Windows, macOS and GNOME do in Romanian: „Puteți schimba asta mai târziu în Setări.” Leave out the pronoun: no „dumneavoastră”, no „dvs.”, and never switch to tu in running text.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no „vă rugăm” at the start of every hint, no marketing words.
- Say what happens, not how it works inside.
- Always write ș and ț with the comma below, never the cedilla forms ş and ţ. Use â and î by the current rules: „România”, „sunt”, „înapoi”, „reîncarcă”.

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, as macOS, GNOME and Android do: „Salvează”, „Deschide”, „Anulează”, „Repornește”, „Fixează în bara de activități”. Windows' nouns („Salvare”, „Anulare”) read like headings, so Luft doesn't use them on buttons. The button is a command the reader gives, so it doesn't contradict the polite form used in running text.
- A few power actions read better as nouns, as in Windows: „Repaus”, „Hibernare”, „Deconectare”.
- Switches and settings are nouns or follow the English form: „Lumină de noapte”, „Afișează secundele”.
- Headings and page names are nouns: „Notificări”, „Confidențialitate”.
- Instructions in running text use the polite imperative: „Apăsați Super+Tab pentru a vedea toate ferestrele.”
- Keep labels short. Romanian runs longer than English; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Setări rapide”, not „Setări Rapide”. In running text, Luft's parts are ordinary nouns: „bara de activități”, „ecranul de blocare”. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „activați Nu deranjați”.

## Typography

- Quotation marks: „…”, and «…» inside them.
- Apostrophe: ’, never '.
- Ellipsis: one character, „…”, with no space before it: „Se încarcă…”.
- Dash: the en dash with spaces, „ – ”. No em dashes.
- No space before punctuation. The percent sign follows the number with no space: „57%”.
- Hyphen for the article and clitics on loanwords and abbreviations whose spelling differs from the pronunciation: „mouse-ul”, „firmware-ul”, „USB-ul”, but „desktopul”, „touchpadul”, „clipboardul”.
- Key names stay as printed on keyboards sold in Romania, which print the English names: Ctrl, Alt, Shift, Enter, Delete. The space bar is „Spațiu”.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Setări, Discuri, Instalează Luft.
- Start stays Start, as in Windows; say „meniul Start” when it has to take an article or a case.
- Never attach articles or case endings to app names. Put the kind of thing first: „în aplicația Rover”, „aplicația Tern s-a închis”. Luft itself doesn't decline either; write „sistemul Luft” or rephrase.

## Plurals

Romanian has three forms: `one` (1), `few` (0, 2–19, and numbers ending in 01–19 above 100, such as 101 or 115) and `other` (20–100, 120 and so on). With `other`, the noun takes „de”: „20 de fișiere”. Always write `{ $count }` instead of the digit, and keep `*[other]` as the default:

```ftl
files-copied = { $count ->
    [one] { $count } fișier copiat
    [few] { $count } fișiere copiate
   *[other] { $count } de fișiere copiate
}
minutes-left = { $count ->
    [one] A mai rămas { $count } minut
    [few] Au mai rămas { $count } minute
   *[other] Au mai rămas { $count } de minute
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Nicio notificare`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that „de” and agreement don't depend on the value: „Ultima verificare: { $date }”, „ocupat: { $used }”.

## Decisions

| English | Romanian | Instead of | Why |
| --- | --- | --- | --- |
| you | polite plural verb, no pronoun | tu, dumneavoastră | Windows, macOS and GNOME |
| buttons | imperative singular: Salvează | nouns: Salvare | macOS, GNOME and Android |
| board | tablă | panou, planșă | Panou is a panel |
| All windows | Toate ferestrele | Vizualizare activități | That's what Luft calls the task view |
| taskbar | bara de activități | bara de sarcini | Windows' word |
| tray | tava de sistem | zona de notificare | It holds apps, not notifications |
| pin, unpin | fixa, anula fixarea | ancora | Windows' words |
| snap, snap layout | andoca, aranjament de andocare | fixa | Fixa is pin |
| sign in, sign out | conecta, deconecta | autentifica | Windows' words |
| workspace | spațiu de lucru | desktop virtual | GNOME's word; desktop is the area behind the windows |
| wallpaper | imagine de fundal | fundal, tapet | Fundal is ambiguous next to colors |
| keyboard layout | aranjament de tastatură | aspect de tastatură | GNOME and KDE; Aspect is Appearance |
| suspend, sleep | Repaus | Suspendare | Windows' word |
| Night light | Lumină de noapte | Lumină nocturnă | Windows' word |
| Keyring | Portchei | Inel de chei | macOS's word |
| passkey | cheie de acces | passkey | Google and Apple in Romanian |
| keyboard shortcut | comandă rapidă | scurtătură | Windows' word |
| folder | folder | dosar | Windows' word, what people say |
| computer | computer | calculator | Windows' word |
| clipboard | clipboard | memorie temporară | Windows' word |
| sandbox | mediu izolat | sandbox | Plain Romanian |
| passphrase | frază de acces | parolă | Kept apart from the account password |
| PIN | PIN, PIN-ul | codul PIN | Windows' word; codul PIN only for a SIM |
| input source | sursă de introducere | sursă de intrare | Covers layouts and input methods |
| metered connection | conexiune contorizată | conexiune limitată | Windows' word |
| home folder | folder personal | dosar personal | Folder is Luft's word |
| tether | Partajare internet | Tethering | Plain Romanian |
| Wallpapers folder | Wallpapers | Imagini de fundal | A real folder that keeps its name |
