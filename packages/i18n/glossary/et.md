# Estonian

What is particular to Estonian, on top of [the rules every language shares](common.md). The agreed terms are in [et.tbx](et.tbx).

## Address

Prefer sentences without a person, which the impersonal makes natural: „Värskendused installitakse järgmisel taaskäivitusel“, „Teavitusi pole“. When the reader has to be addressed, use sina, lowercase, with singular verbs, as Estonian GNOME and KDE do: „Saad seda hiljem Sätetes muuta.“ It matches the singular buttons. Never Sina or Sinu with a capital, and never teie.

## Buttons and labels

- Buttons and menu items take the imperative singular: „Salvesta“, „Ava“, „Loobu“, „Taaskäivita“, „Kinnita tegumiribale“.
- Some power actions are nouns, as in Windows: „Unerežiim“, „Talveunerežiim“.
- Page names use „ja“, never &: „Toide ja aku“.
- A failure is always „… ebaõnnestus“ or „… ei õnnestunud“, never nurjus.
- A label named in a sentence keeps its capital and needs no quotation marks: „lülita sisse Ära sega“. A page of Settings is named exactly after „lehel“: „lehel Toide ja aku“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The apostrophe goes only before an ending on a foreign name that isn't said as written: „Magpie’i“. Others take the ending directly: „Lufti“, „Windowsi“.
- The dash is an en dash with spaces. No em dashes. The ellipsis follows the word directly.
- The percent sign takes no space („57%“); units do („4,5 W“).
- Compounds with abbreviations take a hyphen: „USB-mälupulk“, „PDF-fail“, „Wi-Fi-võrk“.
- Keys use the English names printed on Estonian keyboards: Ctrl, Alt, Shift, Enter, Delete. Only the unlabelled space bar is „Tühik“.

## Names

- Settings, Disks and Install Luft are Sätted, Kettad and Lufti installimine. Sätted keeps its capital in every case when it means the app: „lisa hiljem Sätetes“.
- Start stays Start; write „menüü Start“ when it takes a case ending.
- Don't inflect app names; put the kind of thing first: „rakenduses Rover“. Luft inflects when it must (Lufti, Luftis).
- With fourteen cases, keep variables in the nominative: „Tagasi: { $page }“. The object of a command is nominative too, so „Aseta { $finger } andurile“ works.

## Plurals

Two forms, `one` and `other`. After a number other than one, the noun and the words agreeing with it take the singular partitive:

```ftl
windows-open = { $count ->
    [one] { $count } avatud aken
   *[other] { $count } avatud akent
}
```

## Words

| English | Estonian | Not | Why |
| --- | --- | --- | --- |
| Settings | Sätted | Seaded, Seadistused | Windows' app name, the one most people know |
| board | tahvel | laud, lõuend | Laud is the desktop; lõuend is the canvas inside it |
| All windows | Kõik aknad | Tegumivaade | What Luft calls the task view |
| taskbar | tegumiriba | tööriba | Windows' word |
| tray | süsteemisalv | teavitusala | It holds apps |
| notification | teavitus | teatis, märguanne | Phones and GNOME; märguanne is for alert sounds |
| pin, unpin | kinnitama, vabastama | kinnistama | Windows' words |
| snap, snap layout | paigutama, paigutusmall | dokkima, haakima | Says what happens to the window |
| workspace | tööala | virtuaalne töölaud | GNOME's word; töölaud is the desktop |
| wallpaper | taustapilt | taust | Taust is ambiguous next to colours |
| suspend, sleep | unerežiim | ootel, peatama | Windows' word |
| Power saver | Energiasääst | Akusäästja | Matches the other power modes |
| Night light | Öövalgus | Öörežiim | Windows' word |
| update | värskendus | uuendus | Windows' word |
| security | turve | turvalisus | Windows' page name, shorter |
| Keyring | Võtmerõngas | Võtmehoidja | GNOME's word |
| clipboard | lõikelaud | puhver | Windows and GNOME |
| firmware | püsivara | firmware | The established term |
| display | kuvar | ekraan, monitor | Windows' word for a connected screen |
| accessibility | hõlbustus | juurdepääsetavus | Windows' page name, shorter |
| password | salasõna | parool | Native speakers' choice, though Windows and GNOME say parool |
| passphrase | paroolifraas | salafraas | KDE and the Estonian cybersecurity term base |
| PIN | PIN-kood | PIN | Reads naturally in sentences and as a label |
| security key | turvavõti | riistvaravõti | The common name for FIDO keys |
| light/dark style | hele/tume režiim | stiil | Matches the Quick settings tile and Windows |
| Zoom, magnifier | luup | suum | Windows' name for the magnifier |
| metered connection | mahupõhine ühendus | mõõdetud ühendus | Windows' word |
| input source | sisendallikas | sisestusallikas | Sisestusmeetod is the input method |
