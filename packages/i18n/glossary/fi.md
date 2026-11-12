# Finnish

What is particular to Finnish, on top of [the rules every language shares](common.md). The agreed terms are in [fi.tbx](fi.tbx).

## Address

Address the reader as sinä, as macOS, GNOME and KDE do, and leave the pronoun out since the verb says who is meant: ”Voit muuttaa tämän myöhemmin asetuksissa”. Never te. Prefer sentences without a person when they read naturally: ”Ei ilmoituksia”.

## Buttons and labels

- Buttons and menu items take the imperative singular: ”Tallenna”, ”Avaa”, ”Peruuta”, ”Käynnistä uudelleen”, ”Kiinnitä tehtäväpalkkiin”.
- Power menu items that name a state are nouns, as in Windows: ”Lepotila”, ”Horrostila”.
- Progress and results take the passive: ”Tallennettu”, ”Lähetetty tulostimeen”.
- Finnish builds long compounds. Pick the shorter of two common words, drop a redundant possessive or object, and split a compound only when it reads better.
- Switch states are ”Päällä” and ”Pois”, the same in quick settings and Settings.
- Language and month names stay lowercase. A label named in a sentence keeps its capital: ”ota Älä häiritse käyttöön”.

## Typography

- Quotation marks ”…”, the same mark on both sides, with ’…’ inside them.
- The dash is an en dash with spaces, and without spaces in ranges. No em dashes.
- Percent signs and units take a space: ”57 %”, ”4,5 W”.
- Compounds with a name, an abbreviation or a digit take a hyphen: ”Rover-sovellus”, ”USB-tikku”, ”Wi-Fi-verkko”.
- An abbreviation ending in a pronounced letter takes its case ending after a colon: ”USB:n”, ”TPM:ään”. Names ending in a written consonant take -i-: ”Luftin”, ”Roverissa”.
- Keys follow Finnish Windows: Ctrl, Alt, Vaihto, Sarkain, Enter, Esc, Välilyönti, Askelpalautin, Delete.

## Names

- Settings, Disks and Install Luft are Asetukset, Levyt and Asenna Luft.
- Names written into a string inflect normally: ”Luftin päivitykset”, ”Roverissa”, though ”Rover-sovelluksessa” reads better where the bare ending looks odd. Start becomes ”Start-valikko” when it declines.
- A name in a variable can't change its ending, so keep it in the nominative: in a compound with a space before the hyphen, since the name may be several words (”{ $app } -sovelluksessa”), or after a colon (”Ei voitu avata: { $name }”).

## Plurals

Two forms, `one` and `other`. After a number other than one, the noun takes the singular partitive:

```ftl
notifications-count = { $count ->
    [one] { $count } ilmoitus
   *[other] { $count } ilmoitusta
}
```

## Words

| English | Finnish | Not | Why |
| --- | --- | --- | --- |
| app | sovellus | appi, ohjelma | Windows, macOS and phones |
| Appearance | Ulkoasu | Mukauttaminen | GNOME's word; it names what the page changes |
| pointer, cursor | osoitin | kohdistin | Kohdistin is the text cursor |
| board | taulu | pöytä, kangas | Short; työpöytä is the desktop |
| All windows | Kaikki ikkunat | Tehtävänäkymä | What Luft calls the task view |
| snap, snap layout, snap group | telakoida, ikkuna-asettelu, ikkunaryhmä | kiinnittää | Windows uses kiinnittää for pin and snap; Luft keeps it for pin |
| tray | ilmaisinalue | ilmoitusalue | Windows' word; it holds apps |
| workspace | työtila | virtuaalityöpöytä | GNOME's word, and short |
| Night light | Yövalo | Yötila | Windows and GNOME |
| suspend, sleep | lepotila | keskeytä, valmiustila | Windows' word |
| hibernate | horrostila | talvihorros | Windows' word |
| Keyring | Avainnippu | avainrengas | macOS and GNOME |
| touchpad | kosketuslevy | kosketusalusta | Windows' word |
| security | suojaus | tietoturva | Windows' word; matches suojaussiru |
| keyboard shortcut | pikanäppäin | näppäinyhdistelmä | Shorter; Windows and GNOME |
| forget | unohtaa | poistaa | Windows' Unohda for saved networks |
| turn on, turn off | ottaa käyttöön, poistaa käytöstä | aktivoida, kytkeä | Plain Finnish, used across Windows |
| input source | syöttölähde | syöttötapa | Syöttötapa is the input method; a source can be either |
| driver | ohjain | ajuri | Windows' word |
| passphrase | tunnuslause | salasana | Apart from the account password |
| PIN | PIN-koodi | PIN | Windows Hello |
| light style, dark style | vaalea tila, tumma tila | vaalea tyyli | Matches the Tumma tila tile |
| metered connection | käytön mukaan laskutettava yhteys | maksullinen yhteys | Windows' term |
| hotspot, tethering | yhteyspiste, jakoyhteys | hotspot, tethering | Plain Finnish |
| the blue startup screen | sininen näyttö | sininen näkymä | Same word as lukitusnäyttö |
