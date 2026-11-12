# Lithuanian

What is particular to Lithuanian, on top of [the rules every language shares](common.md). The agreed terms are in [lt.tbx](lt.tbx).

## Address

Prefer sentences without a person: „Naujinimai bus įdiegti paleidus iš naujo“, „Pranešimų nėra“. When the reader has to be addressed, use jūs, lowercase, as every system does in Lithuanian: „Tai galite pakeisti vėliau Nustatymuose.“ Never Jūs or Jūsų with a capital, and never tu. Instructions take the imperative with jūs: „Paspauskite Super+Tab, kad pamatytumėte visus langus.“

## Buttons and labels

- Buttons and menu items take the infinitive: „Įrašyti“, „Atidaryti“, „Atšaukti“, „Prisegti prie užduočių juostos“.
- Status lines use a past participle: neuter when nothing is named („Įrašyta“), agreeing when the noun is there („Piršto atspaudas pridėtas“).
- Settings keeps its capital in every case: „Nustatymuose“. Its pages are named exactly, after „skiltyje“: „skiltyje Privatumas“. A label named in a sentence keeps its capital and needs no quotation marks: „įjunkite Netrukdyti“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces. Percent signs and units take a space: „57 %“, „4,5 W“.
- Always write the Lithuanian letters ą, č, ę, ė, į, š, ų, ū, ž. Search words may add the spelling without them, or the English word.
- Keys use the English names printed on Lithuanian keyboards: Ctrl, Alt, Shift, Enter, Delete. Only the unlabelled space bar is Tarpas.

## Names

- Settings, Disks and Install Luft are Nustatymai, Diskai and Įdiegti Luft.
- Start is Pradžia, as in Windows; write „meniu Pradžia“ so it stays in the nominative.
- Names are never declined, Windows included; put the kind of thing first and decline that: „programoje Rover“, „vieta sistemai Luft“, „sistemoje Windows“.

## Plurals

Four forms. `one` is numbers ending in 1 except 11 (nominative singular). `few` is numbers ending in 2–9 except 12–19 (nominative plural). `many` is fractions (genitive singular). `other` is 0, 10–20, 30 and everything ending in 11–19 (genitive plural). Always write `{ $count }`, never the digit 1:

```ftl
windows-open = { $count ->
    [one] { $count } atidarytas langas
    [few] { $count } atidaryti langai
    [many] { $count } atidaryto lango
   *[other] { $count } atidarytų langų
}
```

## Words

| English | Lithuanian | Not | Why |
| --- | --- | --- | --- |
| Settings | Nustatymai | Parametrai | macOS, GNOME, Android and iOS; Windows is the exception |
| app | programa | programėlė, aplikacija | Windows and GNOME; standard Lithuanian |
| board | lenta | drobė | An open surface windows are laid out on |
| All windows | Visi langai | Užduočių rodinys | What Luft calls the task view |
| tray | sistemos dėklas | pranešimų sritis | KDE; it holds apps |
| pin, unpin | prisegti, atsegti | prikabinti | Windows' words |
| snap, snap layout | pritraukti, pritraukimo išdėstymas | prilipdyti | Windows' verb |
| workspace | darbo sritis | darbalaukis | Darbalaukis is the desktop |
| wallpaper | fono paveikslėlis | fonas | Fonas alone is ambiguous next to colours |
| save | įrašyti | išsaugoti | Windows, GNOME and the language commission |
| delete | naikinti | trinti | Windows' word |
| install | įdiegti | instaliuoti | Windows; standard Lithuanian |
| updates | naujinimai | atnaujinimai | Windows' word |
| suspend, sleep | miego režimas | pristabdyti | Windows |
| hibernate | užmigdyti | hibernuoti | Windows |
| Night light | Naktinė šviesa | Naktinis apšvietimas | GNOME; shorter for a tile |
| Quick settings | Spartieji nustatymai | Greitieji nustatymai | Android; matches spartieji klavišai |
| emoji | jaustukas | emodži | Windows and the language commission |
| clipboard | iškarpinė | mainų sritis | Windows |
| passkey | prieigos raktas | passkey | Google and Apple |
| Keyring | raktinė | raktų žiedas | GNOME |
| firmware | programinė aparatinė įranga | mikroprograma | Windows; known from update screens |
| touchpad | jutiklinis kilimėlis | jutiklinė planšetė | GNOME; planšetė reads as a tablet |
| power | maitinimas | energija | Windows' settings page |
| security | sauga | saugumas | Windows' word |
| accessibility | prieinamumas | pritaikymas neįgaliesiems | Much shorter; the longer term is a search word |
| users | naudotojai | vartotojai | GNOME and the language commission |
| passphrase | slaptafrazė | slaptažodis | GNOME; apart from the account password |
| router | maršruto parinktuvas | maršrutizatorius | Windows |
| driver | tvarkyklė | valdiklis | Windows and GNOME |
| input source | įvesties šaltinis | įvesties kalba | GNOME |
| authentication | tapatybės patvirtinimas | autentifikavimas | Windows; plain words |
| connect a device | prijungti, atjungti | prisijungti | Prisijungti is for networks and accounts |
| take a screenshot | padaryti ekrano kopiją | daryti ekrano kopiją | One action, so the perfective |
| track, link | takelis, nuoroda | įrašas, saitas | Media players; Windows and the web |
