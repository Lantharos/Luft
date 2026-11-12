# Dutch

What is particular to Dutch, on top of [the rules every language shares](common.md). The agreed terms are in [nl.tbx](nl.tbx).

## Address

Address the reader as je, as Windows and macOS do: “Je kunt dit later wijzigen in Instellingen.” Use jouw only for emphasis. Never u, which GNOME and KDE still use but which reads distant next to the rest of a modern desktop. Instructions take the imperative with je: “Druk op Super+Tab om alle vensters te zien.”

## Buttons and labels

- Buttons and menu items take the infinitive: “Opslaan”, “Openen”, “Annuleren”, “Vastmaken aan taakbalk”. Done is “Klaar”.
- Status messages are short statements: “Opgeslagen”.
- A label named in a sentence keeps its capital and needs no quotation marks: “zet Niet storen aan”. After a colon, continue in lowercase.
- Lowercase words such as wifi and usb-stick take a capital only at the start of a label: “Wifi”, “Usb-stick”.

## Typography

- Quotation marks “…”, with ‘…’ inside them. The apostrophe is ’: “emoji’s”, “pc’s”.
- The dash is an en dash with spaces. The percent sign takes no space: “57%”.
- Compounds are one word: “klembordgeschiedenis”, “apparaatversleuteling”. A hyphen only where vowels clash (“media-afspeler”) and after abbreviations and names (“usb-stick”, “Rover-venster”).
- Abbreviations said letter by letter are lowercase in ordinary words, as the Groene Boekje has it: “usb”, “pdf”, “pc”, “wifi”. Names and technical acronyms keep their capitals: TPM, VPN, DNS.
- Write “e-mail”, “online”.
- Keys use the English names printed on Dutch and Belgian keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. Only the unlabelled space bar is “Spatie”.

## Names

- Settings, Disks and Install Luft are Instellingen, Schijven and Luft installeren. Instellingen keeps its capital and takes no article: “in Instellingen”.
- Start stays Start; “het menu Start” when an article is needed.
- App names take no article and count as neuter: “Rover is geopend”. When that's awkward: “de app Rover”.

## Plurals

Two forms, `one` and `other`.

```ftl
notifications-count = { $count ->
    [one] { $count } melding
   *[other] { $count } meldingen
}
```

## Words

| English | Dutch | Not | Why |
| --- | --- | --- | --- |
| board | board, het | bord, canvas | Bord reads as a plate or a sign |
| All windows | Alle vensters | Taakweergave | What Luft calls the task view |
| notification, notification center | melding, meldingencentrum | bericht | Windows and GNOME |
| snap, snap layout | uitlijnen, uitlijnindeling | vastklikken | Windows' words |
| tray | systeemvak | meldingsgebied | Windows' word; it holds apps |
| pin, unpin | vastmaken, losmaken | vastpinnen | Windows' words |
| workspace | werkblad | virtueel bureaublad | GNOME's word; bureaublad is the desktop |
| wallpaper | achtergrond | bureaubladachtergrond | Windows and GNOME; shorter |
| lock screen, login screen | vergrendelscherm, aanmeldscherm | vergrendelingsscherm | GNOME's shorter forms |
| suspend, sleep | Slaapstand | Pauzeren | Windows and macOS |
| hibernate | Sluimerstand | Hibernate | Windows' word |
| shut down | Afsluiten | Uitschakelen | Windows; uitschakelen is for features |
| Power saver | Energiebesparing | Energiebesparingsmodus | Windows' word, short |
| Night light | Nachtlampje | Nachtlicht | Windows' word |
| Keyring | sleutelbos | sleutelhanger | GNOME's word; sleutelhanger is Apple's Keychain |
| security chip | beveiligingschip | TPM-chip | Luft avoids the abbreviation |
| keyboard shortcut | sneltoets | toetscombinatie | Windows, GNOME and KDE |
| forget (network) | vergeten | verwijderen | Windows and macOS |
| update (verb) | bijwerken | updaten | Windows and GNOME; the noun stays update |
| battery | batterij | accu | Windows and macOS |
| Appearance | Uiterlijk | Weergave | GNOME and KDE; weergave is easily taken for the display |
| passphrase | wachtwoordzin | wachtzin | macOS and GNOME; apart from wachtwoord |
| PIN | pincode | pin | Windows Hello and bank cards |
| driver | driver | stuurprogramma | What most people say |
| home folder | persoonlijke map | thuismap | GNOME |
| input source | invoerbron | invoermethode | Covers layouts and input methods |
| dwell click | klikken door stil te houden | zweefklik | Says what you do |
| Wallpapers folder | de map Wallpapers in Afbeeldingen | Achtergronden | A real folder that keeps its English name |
