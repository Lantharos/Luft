# Icelandic style guide

How Luft speaks Icelandic. The [glossary](../../packages/i18n/glossary/is.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Address the reader as **þú**, lowercase, as macOS, iOS, Windows, GNOME and KDE all do in Icelandic: „Þú getur breytt þessu seinna í Stillingum.“ Never „þér“ or „þið“.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as „Vinsamlegast“ at the start of every hint, no marketing words.
- Say what happens, not how it works inside. „Uppfærslurnar eru settar upp við næstu endurræsingu“, not „Kerfismyndinni er skipt út við ræsingu“.
- When English uses „you“ only out of habit, leave it out: „Engar tilkynningar“ for „You have no notifications“.
- Luft doesn't know the reader's gender, so avoid adjectives and participles that agree with them: „Innskráning tókst“, not „Þú ert skráður inn“. Write „Velkomin(n)“ only when no rewording works.
- Failures start with „Ekki tókst að …“: „Ekki tókst að vista skrána.“ It doesn't blame anyone.
- Prefer native Icelandic words to loanwords, as Microsoft and Apple do: tölva, skjár, forrit, skrá, mappa, lykilorð, fastbúnaður. Keep an English word only when it is a name or the glossary says so.

## Buttons, menus and labels

- Buttons and menu items use the **infinitive** without „að“: „Vista“, „Opna“, „Hætta við“, „Endurræsa“, „Festa á verkstiku“.
- A few power and state items are nouns, as in Windows: „Svefn“, „Dvali“.
- Switches and settings are nouns or short phrases: „Næturljós“, „Sýna sekúndur“.
- Headings and page names are nouns: „Tilkynningar“, „Persónuvernd“.
- Instructions in running text use the imperative with the pronoun joined on: „Ýttu á Super+Tab til að sjá alla glugga.“, „Veldu“, „Smelltu“, „Leggðu“.
- Status messages use a short participle or a passive: „Vistað“, „Afritað“, „Fingrafari bætt við.“ Progress labels use the third person: „Vistar…“, „Leitar að uppfærslum…“, never „Sæki…“ or „Leita…“.
- Things stored or installed on the computer are „á þessari tölvu“, removed „af þessari tölvu“.
- Watch the case a verb takes: loka, eyða, gleyma and bæta við take the dative („Loka glugganum“, „Eyða skránni“).
- Icelandic runs a little longer than English and builds long compounds. If a label clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Flýtistillingar“, „Dagsetning og tími“. Luft's parts are ordinary nouns in running text: „verkstikan“, „læsiskjárinn“. A label named in a sentence keeps its capital letter and needs no quotation marks: „kveiktu á Ekki trufla“. Days, months, languages and nationalities are lowercase: „mánudagur“, „íslenska“.

## Typography

- Quotation marks: „…“, low then high, and ‚…‘ inside them.
- Apostrophe: ’, the typographic one. Icelandic rarely needs it.
- Ellipsis: one character, „…“, with no space before it: „Vistar…“.
- Dash: the en dash with spaces, „ – “. No em dashes. Ranges use the en dash without spaces: 2–4.
- No space before the percent sign: „57%“. A space before other units: „4,5 W“.
- „&“ in English names becomes „og“: „Orka og rafhlaða“.
- Compounds with names, abbreviations or digits take a hyphen: „Bluetooth-millistykki“, „USB-lykill“, „Wi-Fi-net“. Ordinary compounds are one word: „skjástillingar“, never „skjá stillingar“.
- Key names follow Icelandic keyboards, which print the English names: Ctrl, Alt, Shift, Enter, Esc, Tab, Backspace, Delete, Insert, Home, End, Page Up, Page Down, Print Screen. The space bar, which has no label, is „Bilslá“, as in Windows.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Stillingar, Diskar, Setja upp Luft.
- Start is „Upphaf“, the name Windows gives it in Icelandic. In running text and after prepositions say „upphafsvalmynd“: „Festa á upphafsvalmynd“, „Opnaðu upphafsvalmyndina“.
- Don't inflect app names. Put the kind of thing first and inflect that: „í forritinu Rover“, „forritið Tern lokaðist“. Luft isn't inflected either: „uppfærslur fyrir Luft“, „Setja upp Luft“.

## Plurals

Icelandic has two forms: `one` for numbers ending in 1 except 11 (1, 21, 31, 101, but not 11, 111), and `other` for everything else, including 0. Because `one` also covers 21 and 31, always write `{ $count }` instead of the digit 1. Adjectives and verbs agree with the form:

```ftl
windows-open = { $count ->
    [one] { $count } opinn gluggi
   *[other] { $count } opnir gluggar
}
minutes-left = { $count ->
    [one] { $count } mínúta eftir
   *[other] { $count } mínútur eftir
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Engar tilkynningar`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Síðast athugað: { $date }“.

## Decisions

| English | Icelandic | Instead of | Why |
| --- | --- | --- | --- |
| Start | Upphaf, upphafsvalmynd | Start | Windows' Icelandic name |
| app | forrit | app, smáforrit | Windows, macOS and GNOME |
| board | tafla | borð, striga | Short, and a board you lay things out on |
| All windows | Allir gluggar | Verkefnayfirlit | That's what Luft calls the task view |
| snap, snap layout | raða, gluggauppröðun | festa, smella | Festa is pin; smella is click |
| taskbar | verkstika | verkefnastika | Windows' word |
| tray | kerfisbakki | tilkynningasvæði | It holds apps, not notifications |
| workspace | vinnusvæði | skjáborð | GNOME's word; skjáborð is the desktop |
| wallpaper | bakgrunnsmynd | bakgrunnur | Bakgrunnur is ambiguous next to colors |
| lock screen | læsiskjár | lásskjár | Apple's word |
| suspend, sleep | Svefn | Bið | Windows' word |
| Do Not Disturb | Ekki trufla | Ónáðið ekki | Shorter, and keeps to þú |
| Dictation | Raddinnsláttur | Upplestur | Upplestur is reading aloud |
| clipboard | klippiborð | klippispjald | Windows' word |
| emoji | tjákn | emoji | The established Icelandic word |
| passkey | aðgangslykill | passkey | Apple's word |
| Keyring | lyklakippa | lyklahringur | GNOME's word |
| encryption | dulritun | dulkóðun | Microsoft's word; dulkóðun is in the search words |
| firmware | fastbúnaður | vélbúnaðarhugbúnaður | Established term |
| account | aðgangur | reikningur | Reikningur is a bill |
| Wi-Fi | Wi-Fi | WiFi, þráðlaust net | Windows and macOS; þráðlaust net in running text |
| passphrase | lykilsetning | lykilorð | GNOME's word; keeps it apart from the password |
| PIN | PIN-númer | PIN | Windows' word |
| input source | inntaksgjafi | innsláttur | GNOME's word |
| public key | dreifilykill | opinber lykill | The established term |
| administrator | stjórnandi | kerfisstjóri | Windows' account type |
| hotspot, tethering | heitur reitur, netdeiling | tjóðrun | No settled term for tethering |
| game controller | leikjastýring | leikjafjarstýring | Shorter |
