# Lithuanian style guide

How Luft speaks Lithuanian. The [glossary](../../packages/i18n/glossary/lt.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: „Naujinimai bus įdiegti paleidus iš naujo“, „Pranešimų nėra“.
- When the reader has to be addressed, use **jūs**, lowercase, as Windows, macOS, GNOME and KDE all do in Lithuanian: „Tai galite pakeisti vėliau Nustatymuose.“ Never capitalize Jūs or Jūsų, and never switch to tu.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no „prašome“ in front of every hint, no marketing words.
- Say what happens, not how it works inside.
- When English uses „you“ only out of habit, leave it out: „Pranešimų nėra“ for „You have no notifications“.

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as in Windows, macOS and GNOME: „Įrašyti“, „Atidaryti“, „Atšaukti“, „Paleisti iš naujo“, „Prisegti prie užduočių juostos“.
- Switches and settings are nouns or short phrases: „Naktinė šviesa“, „Rodyti sekundes“.
- Headings and page names are nouns: „Pranešimai“, „Privatumas“.
- Status lines use a past participle: neuter when nothing is named („Įrašyta“, „Nukopijuota“), agreeing when the noun is there („Piršto atspaudas pridėtas“).
- Instructions in running text use the imperative with jūs: „Paspauskite Super+Tab, kad pamatytumėte visus langus.“
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Spartieji nustatymai“, not „Spartieji Nustatymai“. In running text, Luft's parts are ordinary nouns: „užduočių juosta“, „užrakinimo ekranas“. The Settings app keeps its capital in every case: „Nustatymuose“, „Atidarykite Nustatymus“; its pages are named exactly as in the sidebar, after „skiltyje“: „skiltyje Privatumas“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „įjunkite Netrukdyti“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Apostrophe: ’, rarely needed.
- Ellipsis: one character, „…“, with no space before it.
- Dash: the en dash with spaces, „ – “.
- Percent sign with a space before it: „57 %“. Units likewise: „4,5 W“.
- Always write the Lithuanian letters (ą, č, ę, ė, į, š, ų, ū, ž). Search keywords may add a spelling without them, or the English word, when people often type it that way.
- Key names stay as printed on keyboards sold in Lithuania, which carry the English labels: Ctrl, Alt, Shift, Enter, Delete, Home. Only the space bar, which has no label, gets a Lithuanian name: Tarpas.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium. They are written without quotation marks.
- Settings, Disks and Install Luft are descriptions, so they are translated: Nustatymai, Diskai, Įdiegti Luft.
- Start is translated as in Windows: Pradžia. Say „meniu Pradžia“ when it has to fit a sentence, so the name stays in the nominative.
- Names are never declined. Put the kind of thing first and decline that word instead: „programoje Rover“, „programa Tern uždaryta“, „vieta sistemai Luft“. Windows stays as it is too: „per Windows“, „sistemoje Windows“.

## Plurals

Lithuanian has four forms:

- `one`: numbers ending in 1, except those ending in 11 (1, 21, 31, 101 …) – nominative singular
- `few`: numbers ending in 2–9, except those ending in 12–19 (2–9, 22–29, 102 …) – nominative plural
- `many`: fractions (0,5, 1,5 …) – genitive singular
- `other`: 0, 10–20, 30, 40 … and everything ending in 11–19 – genitive plural

Write all four, keep `{ $count }` in every one instead of the digit 1, and keep `*[other]` as the default. Adjectives and verbs agree too:

```ftl
windows-open = { $count ->
    [one] { $count } atidarytas langas
    [few] { $count } atidaryti langai
    [many] { $count } atidaryto lango
   *[other] { $count } atidarytų langų
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Pranešimų nėra`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Paskutinį kartą tikrinta: { $date }“.

## Decisions

| English | Lithuanian | Instead of | Why |
| --- | --- | --- | --- |
| you | jūs, lowercase, or no person | tu | Every OS in Lithuanian |
| Settings | Nustatymai | Parametrai | macOS, GNOME, Android and iOS; Windows' Parametrai is the exception |
| app | programa | programėlė, aplikacija | Windows and GNOME; standard Lithuanian |
| Start | Pradžia | Start | Windows translates it |
| board | lenta | drobė | An open surface windows are laid out on |
| All windows | Visi langai | Užduočių rodinys | That's what Luft calls the task view |
| tray | sistemos dėklas | pranešimų sritis | KDE; it holds apps, not notifications |
| pin, unpin | prisegti, atsegti | prikabinti | Windows' words |
| snap, snap layout | pritraukti, pritraukimo išdėstymas | prilipdyti | Windows' verb |
| workspace | darbo sritis | darbalaukis | Darbalaukis is the desktop |
| wallpaper | fono paveikslėlis | fonas | Fonas alone is ambiguous next to colors |
| save | įrašyti | išsaugoti | Windows, GNOME and the language commission |
| delete | naikinti | trinti | Windows' word |
| install | įdiegti | instaliuoti | Windows' word; standard Lithuanian |
| updates | naujinimai | atnaujinimai | Windows' word |
| suspend, sleep | miego režimas | pristabdyti | Windows |
| hibernate | užmigdyti | hibernuoti | Windows |
| Night light | Naktinė šviesa | Naktinis apšvietimas | GNOME; shorter for a tile |
| Quick settings | Spartieji nustatymai | Greitieji nustatymai | Android; matches spartieji klavišai |
| emoji | jaustukas | emodži | Windows and the language commission; declines naturally |
| clipboard | iškarpinė | mainų sritis | Windows |
| passkey | prieigos raktas | passkey | Google and Apple in Lithuanian |
| Keyring | raktinė | raktų žiedas | GNOME |
| firmware | programinė aparatinė įranga | mikroprograma | Windows; known from update screens |
| touchpad | jutiklinis kilimėlis | jutiklinė planšetė | GNOME; planšetė reads as a tablet |
| power | maitinimas | energija | Windows' settings page |
| security | sauga | saugumas | Windows' word |
| accessibility | prieinamumas | pritaikymas neįgaliesiems | Much shorter, GNOME; the longer Windows term is in the search words |
| users | naudotojai | vartotojai | GNOME and the language commission |
| Wi-Fi | Wi-Fi | belaidis tinklas | Windows and macOS |
| passphrase | slaptafrazė | slaptažodis | GNOME; keeps it apart from the account password |
| router | maršruto parinktuvas | maršrutizatorius | Windows |
| driver | tvarkyklė | valdiklis | Windows and GNOME |
| input source | įvesties šaltinis | įvesties kalba | GNOME |
| authentication | tapatybės patvirtinimas | autentifikavimas | Windows; plain words |
| connect a device | prijungti, atjungti | prisijungti | Prisijungti is for networks and accounts, which the computer joins |
| take a screenshot | padaryti ekrano kopiją | daryti ekrano kopiją | One action, so the perfective |
| track | takelis | įrašas | Media players |
| link | nuoroda | saitas | Windows and the web |
