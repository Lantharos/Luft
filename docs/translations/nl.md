# Dutch style guide

How Luft speaks Dutch. The [glossary](../../packages/i18n/glossary/nl.tbx) has the agreed terms; Weblate shows them next to every string. The translation is written in the standard Dutch of the Netherlands and avoids words that only one side of the border uses, so it reads naturally in Flanders too.

## Address and tone

- Address the reader as **je**, as Windows and macOS do in Dutch: “Je kunt dit later wijzigen in Instellingen.” Use **jouw** only for emphasis, otherwise **je**. Never “u”, which GNOME and KDE still use but which feels distant next to the rest of a modern desktop.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no marketing words, no “Let op” or “Graag” in front of hints.
- Say what happens, not how it works inside: “Updates worden geïnstalleerd bij de volgende herstart.”
- When English uses “you” only out of habit, leave it out: “Geen meldingen” for “You have no notifications”.

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as Windows, macOS and GNOME do: “Opslaan”, “Openen”, “Annuleren”, “Opnieuw opstarten”, “Vastmaken aan taakbalk”.
- Switches and settings are nouns or short phrases: “Nachtlampje”, “Seconden tonen”.
- Headings and page names are nouns: “Meldingen”, “Privacy”.
- Instructions in running text use the imperative with je: “Druk op Super+Tab om alle vensters te zien.” Status messages are short statements: “Opgeslagen”, “Laden…”.
- Keep labels short. Dutch runs about a fifth longer than English; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. “Snelle instellingen”, not “Snelle Instellingen”. Luft's parts are ordinary nouns in running text: “de taakbalk”, “het vergrendelscherm”, “het board”. A label referred to in a sentence keeps its capital letter and needs no quotation marks: “zet Niet storen aan”. After a colon, continue in lowercase.

Lowercase words such as wifi and usb-stick take a capital only at the start of a label: “Wifi”, “Usb-stick”.

## Typography

- Quotation marks: “…”, and ‘…’ inside them.
- Apostrophe: ’, as in “emoji’s” and “pc’s”.
- Ellipsis: one character, “…”, with no space before it: “Laden…”.
- Dash: the en dash with spaces, “ – ”.
- Percent sign directly after the number, with no space: “57%”.
- Compounds are written as one word, as Dutch requires: “klembordgeschiedenis”, “apparaatversleuteling”. Use a hyphen only where vowels would clash (“auto-update”, “media-afspeler”) and after abbreviations and names: “usb-stick”, “pdf-bestand”, “Rover-venster”.
- Abbreviations pronounced letter by letter are lowercase in ordinary words, following the Groene Boekje: “usb”, “pdf”, “pc”, “wifi”. Names and technical acronyms keep their capitals: TPM, VPN, DNS.
- Write “e-mail”, “online”, “wifi”.
- Key names stay as printed on keyboards sold in the Netherlands and Belgium, which use English labels: Ctrl, Alt, Shift, Enter, Esc, Delete, Home, End. Only the unlabeled space bar is translated: “Spatie”.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Instellingen, Schijven, Luft installeren. In a sentence, Instellingen keeps its capital and takes no article: “Open Instellingen”, “in Instellingen”.
- Start stays Start. When it needs an article, write “het menu Start”, as Windows does.
- App names take no article and are treated as neuter: “Rover is geopend”. When a sentence would be awkward, add the kind of thing: “de app Rover”.
- The folder for wallpapers is a real folder named Wallpapers inside Pictures, so it keeps its English name: “de map Wallpapers in je map Afbeeldingen”.

## Plurals

Dutch has two forms: `one` for exactly 1, and `other` for everything else, including 0 and decimals. Always keep `{ $count }` in both, and keep `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } melding
   *[other] { $count } meldingen
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Geen meldingen`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it: “Laatst gecontroleerd: { $date }”.

## Decisions

| English | Dutch | Instead of | Why |
| --- | --- | --- | --- |
| you | je | u | Windows and macOS; GNOME and KDE use u, but it reads stiff today |
| board | board, het | bord, canvas | “Bord” reads as a plate or a sign; board is the loanword people use |
| All windows | Alle vensters | Taakweergave | That's what Luft calls the task view |
| notification, notification center | melding, meldingencentrum | bericht, berichtencentrum | Windows and GNOME |
| snap, snap layout | uitlijnen, uitlijnindeling | vastklikken, snappen | Windows' words |
| tray | systeemvak | systeemtray, meldingsgebied | Windows' word; it holds apps, not notifications |
| pin, unpin | vastmaken, losmaken | vastpinnen | Windows' words |
| workspace | werkblad | virtueel bureaublad, werkruimte | GNOME's word; bureaublad is the area behind the windows |
| wallpaper | achtergrond | bureaubladachtergrond | Windows and GNOME; shorter |
| lock screen, login screen | vergrendelscherm, aanmeldscherm | vergrendelingsscherm, toegangsscherm | GNOME's shorter forms of Windows' words |
| suspend, sleep | Slaapstand | Pauzeren, Onderbreken | Windows and macOS |
| hibernate | Sluimerstand | Hibernate | Windows' word |
| shut down | Afsluiten | Uitschakelen | Windows; uitschakelen is for features |
| Power saver | Energiebesparing | Energiebesparingsmodus | Windows' word, short |
| Night light | Nachtlampje | Nachtlicht, Nachtmodus | Windows' word; the most familiar |
| passkey | toegangssleutel | passkey, wachtwoordsleutel | Apple, Google and Windows in Dutch |
| Keyring | sleutelbos | sleutelhanger | GNOME's word; sleutelhanger is Apple's Keychain |
| security chip | beveiligingschip | TPM-chip | Luft avoids the abbreviation in the interface |
| keyboard shortcut | sneltoets | toetscombinatie | Windows, GNOME and KDE |
| forget (network) | vergeten | verwijderen | Windows and macOS |
| update (verb) | bijwerken | updaten | Windows and GNOME; the noun stays update |
| Wi-Fi | wifi | Wi-Fi, WLAN | Groene Boekje spelling, used by macOS |
| battery | batterij | accu | Windows and macOS |
| Appearance | Uiterlijk | Weergave, Persoonlijke instellingen | GNOME and KDE; weergave is easily confused with the display |
| done | Klaar | Gereed | Shorter and warmer; macOS |
| passphrase | wachtwoordzin | wachtzin | macOS and GNOME; keeps it apart from wachtwoord |
| PIN | pincode | pin | Windows Hello and bank cards |
| driver | driver | stuurprogramma | The word most people use; macOS writes driver too |
| home folder | persoonlijke map | thuismap, homemap | GNOME and the Dutch Linux file managers |
| input source | invoerbron | invoermethode | Covers both layouts and input methods, as in GNOME and macOS |
| dwell click | klikken door stil te houden | zweefklik | Says what you do; same on the lock screen and in Settings |
