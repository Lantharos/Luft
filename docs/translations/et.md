# Estonian style guide

How Luft speaks Estonian. The [glossary](../../packages/i18n/glossary/et.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person. Estonian does this naturally with the impersonal: „Värskendused installitakse järgmisel taaskäivitusel“, „Teavitusi pole“.
- When the reader has to be addressed, use **teie**, lowercase, with plural verb forms: „Saate seda hiljem Sätetes muuta.“ This is what Windows and Microsoft's Estonian style guide do, and what most Estonian GNOME and KDE translations do where they address the reader at all. Never capitalize Teie or Teile, and never switch to sina.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no „palun“ at the start of every hint, no marketing words.
- Say what happens, not how it works inside.
- When English uses „you“ only out of habit, leave it out: „Teavitusi pole“ for „You have no notifications“.

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, the usual form for commands in Estonian software: „Salvesta“, „Ava“, „Loobu“, „Taaskäivita“, „Kinnita tegumiribale“. This doesn't contradict addressing the reader with teie: the button is a command the reader gives.
- Some power and session actions read better as nouns, as in Windows: „Unerežiim“, „Talveunerežiim“.
- Switches and settings are nouns or follow the English form: „Öövalgus“, „Kuva sekundid“.
- Headings and page names are nouns: „Teavitused“, „Privaatsus“.
- Instructions in running text use teie: „Vajutage Super+Tab, et näha kõiki aknaid.“
- Use „ja“ instead of „&“ in page names: „Toide ja aku“, „Kuupäev ja kellaaeg“.
- Keep labels short. Estonian compounds get long; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Kiirsätted“, „Kõik aknad“. Languages, days and months are lowercase, as always in Estonian. In running text, Luft's parts are ordinary nouns: „tegumiriba“, „lukustuskuva“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „lülitage sisse Ära sega“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Apostrophe: ’, only where Estonian spelling needs one, when a foreign name's ending isn't pronounced as written: „Magpie’i“. Names that end as they sound take the ending directly: „Lufti“, „Kestreli“, „Windowsi“.
- Ellipsis: one character, „…“, written right after the word: „Laadimine…“.
- Dash: the en dash with spaces, „ – “. No em dashes.
- Percent sign right after the number, with no space: „57%“. Units take a space: „4,5 W“. Both arrive formatted in placeables, so this only matters when writing the sign yourself.
- Compounds with abbreviations take a hyphen: „USB-mälupulk“, „PDF-fail“, „Wi-Fi-võrk“.
- Key names stay as printed on keyboards sold in Estonia, which use the English names: Ctrl, Alt, Shift, Enter, Delete, Home, Page Up. Only the space bar, which has no print, is named „Tühik“.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Sätted, Kettad, Lufti installimine. When a sentence means the app, Sätted keeps its capital in every case: „lisage hiljem Sätetes“.
- A Settings page named in a sentence uses its exact page name after „lehel“: „lehel Toide ja aku“.
- Start stays Start, as in Windows; say „menüü Start“ when it has to take a case ending.
- Avoid inflecting app names. Put the kind of thing first: „rakenduses Rover“, „rakendus Tern on suletud“. Luft itself inflects normally when needed (Lufti, Luftis), but prefer sentences where it doesn't have to.
- Prefer sentences where a placeable stays in the nominative, since Estonian has fourteen cases and a placeable can't change its ending: „Tagasi: { $page }“, „Viimane kontroll: { $date }“. The object of a command is in the nominative too, so „Asetage { $finger } andurile“ works.

## Plurals

Estonian has two forms, `one` (1) and `other` (everything else, including 0). Always keep `{ $count }` in both, and keep `*[other]` as the default. After a number other than one, the noun is singular partitive, and so is the verb agreeing with it:

```ftl
windows-open = { $count ->
    [one] { $count } avatud aken
   *[other] { $count } avatud akent
}
minutes-left = { $count ->
    [one] Jäänud on { $count } minut
   *[other] Jäänud on { $count } minutit
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Teavitusi pole`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Viimati kontrollitud: { $date }“.

## Decisions

| English | Estonian | Instead of | Why |
| --- | --- | --- | --- |
| you | teie, lowercase, or no person | sina | Windows and Microsoft's style guide |
| Settings | Sätted | Seaded, Seadistused | Windows' app name, the one most people know |
| board | tahvel | laud, lõuend | Laud is the desktop; lõuend is the canvas inside it |
| All windows | Kõik aknad | Tegumivaade | That's what Luft calls the task view |
| taskbar | tegumiriba | tööriba | Windows' word |
| tray | süsteemisalv | teavitusala | It holds apps, not notifications |
| notification | teavitus | teatis, märguanne | Common in phones and GNOME; märguanne is kept for alert sounds |
| pin, unpin | kinnitama, vabastama | kinnistama | Windows' words |
| snap, snap layout | paigutama, paigutusmall | dokkima, haakima | Says what happens to the window |
| workspace | tööala | tööruum, virtuaalne töölaud | GNOME's word; töölaud is the desktop |
| wallpaper | taustapilt | taust | Taust is ambiguous next to colors |
| suspend, sleep | unerežiim | ootel, peatama | Windows' word |
| Power saver | Energiasääst | Akusäästja | Matches the other power modes; akusäästja is a Windows feature |
| Night light | Öövalgus | Öörežiim | Windows' word |
| update | värskendus | uuendus | Windows' word |
| security | turve | turvalisus | Windows' page name, shorter |
| passkey | pääsuvõti | passkey | Apple and Google in Estonian |
| Keyring | Võtmerõngas | Võtmehoidja | GNOME's word |
| clipboard | lõikelaud | puhver | Windows and GNOME |
| firmware | püsivara | firmware | Established Estonian term |
| display | kuvar | ekraan, monitor | Windows' word for a connected screen |
| accessibility | hõlbustus | juurdepääsetavus | Windows' page name, shorter |
| passphrase | paroolifraas | salafraas | Keeps it apart from parool |
| PIN | PIN-kood | PIN | Reads naturally in sentences; also as a field label |
| security key | turvavõti | riistvaravõti | Common name for FIDO keys |
| light/dark style | hele/tume režiim | stiil | Matches the Quick settings tile and Windows |
| Zoom, magnifier | luup | suum | Windows' name for the screen magnifier |
| metered connection | mahupõhine ühendus | mõõdetud ühendus | Windows' word |
| input source | sisendallikas | sisestusallikas | Sisestusmeetod is the input method |
| Couldn't …, … failed | … ebaõnnestus, … ei õnnestunud | nurjus | One word for failures everywhere |
