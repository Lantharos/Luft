# Icelandic

What is particular to Icelandic, on top of [the rules every language shares](common.md). The agreed terms are in [is.tbx](is.tbx).

## Address

Address the reader as þú, lowercase, as macOS, Windows, GNOME and KDE do: „Þú getur breytt þessu seinna í Stillingum.“ Never þér or þið. Luft doesn't know the reader's gender, so avoid adjectives and participles that agree with them: „Innskráning tókst“, not „Þú ert skráður inn“. Failures start with „Ekki tókst að …“, which blames no one.

Prefer native words to loanwords, as Microsoft and Apple do: tölva, skjár, forrit, skrá, mappa, lykilorð, fastbúnaður.

## Buttons and labels

- Buttons and menu items take the infinitive without að: „Vista“, „Opna“, „Hætta við“, „Festa á verkstiku“. A few power items are nouns, as in Windows: „Svefn“, „Dvali“.
- Instructions take the imperative with the pronoun joined on: „Ýttu á Super+Tab til að sjá alla glugga.“, „Veldu“, „Smelltu“.
- Results take a short participle or the passive: „Vistað“, „Fingrafari bætt við.“ Progress takes the third person: „Leitar að uppfærslum“, never „Leita“.
- Things on the computer are „á þessari tölvu“, removed „af þessari tölvu“.
- Mind the case a verb takes: loka, eyða, gleyma and bæta við take the dative: „Loka glugganum“.
- Days, months, languages and nationalities are lowercase. A label named in a sentence keeps its capital and needs no quotation marks: „kveiktu á Ekki trufla“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces, and without spaces in ranges. No em dashes.
- The percent sign takes no space („57%“); other units do („4,5 W“).
- & in English names becomes og: „Orka og rafhlaða“.
- Compounds with names, abbreviations or digits take a hyphen: „USB-lykill“, „Wi-Fi-net“. Ordinary compounds are one word: „skjástillingar“.
- Keys use the English names printed on Icelandic keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. The unlabelled space bar is „Bilslá“, as in Windows.

## Names

- Settings, Disks and Install Luft are Stillingar, Diskar and Setja upp Luft.
- Start is Upphaf, as in Windows, and upphafsvalmynd in running text: „Opnaðu upphafsvalmyndina“.
- Don't inflect app names or Luft; put the kind of thing first and inflect that: „í forritinu Rover“, „uppfærslur fyrir Luft“.

## Plurals

Two forms: `one` for numbers ending in 1 except 11 (1, 21, 31, 101), and `other`. Since `one` covers 21 too, always write `{ $count }`, never the digit 1. Adjectives and verbs agree:

```ftl
windows-open = { $count ->
    [one] { $count } opinn gluggi
   *[other] { $count } opnir gluggar
}
```

## Words

| English | Icelandic | Not | Why |
| --- | --- | --- | --- |
| app | forrit | app, smáforrit | Windows, macOS and GNOME |
| board | tafla | borð, striga | Short; a board you lay things out on |
| All windows | Allir gluggar | Verkefnayfirlit | What Luft calls the task view |
| snap, snap layout | raða, gluggauppröðun | festa, smella | Festa is pin; smella is click |
| taskbar | verkstika | verkefnastika | Windows' word |
| tray | kerfisbakki | tilkynningasvæði | It holds apps |
| workspace | vinnusvæði | skjáborð | GNOME's word; skjáborð is the desktop |
| wallpaper | bakgrunnsmynd | bakgrunnur | Bakgrunnur is ambiguous next to colours |
| lock screen | læsiskjár | lásskjár | Apple's word |
| Do Not Disturb | Ekki trufla | Ónáðið ekki | Shorter, and keeps to þú |
| Dictation | Raddinnsláttur | Upplestur | Upplestur is reading aloud |
| clipboard | klippiborð | klippispjald | Windows' word |
| emoji | tjákn | emoji | The established Icelandic word |
| passkey | aðgangslykill | passkey | Apple's word |
| Keyring | lyklakippa | lyklahringur | GNOME's word |
| encryption | dulritun | dulkóðun | Microsoft's word; dulkóðun is a search word |
| account | aðgangur | reikningur | Reikningur is a bill |
| passphrase | lykilsetning | lykilorð | GNOME's word; apart from the password |
| PIN | PIN-númer | PIN | Windows' word |
| input source | inntaksgjafi | innsláttur | GNOME's word |
| public key | dreifilykill | opinber lykill | The established term |
| administrator | stjórnandi | kerfisstjóri | Windows' account type |
| hotspot, tethering | heitur reitur, netdeiling | tjóðrun | No settled term for tethering |
| game controller | leikjastýring | leikjafjarstýring | Shorter |
