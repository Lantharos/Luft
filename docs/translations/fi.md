# Finnish style guide

How Luft speaks Finnish. The [glossary](../../packages/i18n/glossary/fi.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Address the reader as **sinä**, the way macOS, GNOME and KDE do in Finnish and the way Windows does when it addresses anyone at all. Never te, never the formal Te.
- Leave the pronoun out: the verb already says who it is. ”Voit muuttaa tämän myöhemmin asetuksissa”, not ”Sinä voit …”.
- Prefer sentences without a person at all when they read naturally: ”Päivitykset asennetaan seuraavan käynnistyksen yhteydessä”, ”Ei ilmoituksia”.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as ”Ole hyvä ja”, no marketing words.
- Say what happens, not how it works inside.

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, as in every Finnish OS: ”Tallenna”, ”Avaa”, ”Peruuta”, ”Käynnistä uudelleen”, ”Kiinnitä tehtäväpalkkiin”.
- Power menu items that name a state are nouns, as in Windows: ”Lepotila”, ”Horrostila”.
- Switches and settings are nouns or short phrases: ”Yövalo”, ”Näytä sekunnit”.
- Headings and page names are nouns: ”Ilmoitukset”, ”Tietosuoja”.
- Instructions in running text use the imperative: ”Paina Super+Sarkain, niin näet kaikki ikkunat.”
- Progress and status use the passive: ”Ladataan…”, ”Tallennettu”, ”Lähetetty tulostimeen”.
- Finnish runs long and builds long compounds. Keep labels short: pick the shorter of two common words, drop a redundant possessive or object, and split a compound only when it reads better.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. ”Pika-asetukset”, ”Älä häiritse”. Luft's parts are ordinary nouns in running text: ”tehtäväpalkki”, ”lukitusnäyttö”, ”ilmoituskeskus”. A label quoted in a sentence keeps its capital letter: ”ota Älä häiritse käyttöön”. Language and month names stay lowercase.

## Typography

- Quotation marks: ”…”, the same closing mark on both sides, and ’…’ inside them.
- Apostrophe: ’.
- Ellipsis: one character, ”…”, with no space before it: ”Ladataan…”.
- Dash: the en dash with spaces, ” – ”, and without spaces in ranges. No em dashes.
- Percent and units take a space: ”57 %”, ”4,5 W”.
- Compounds with a name, an abbreviation or a digit take a hyphen: ”Rover-sovellus”, ”USB-tikku”, ”Wi-Fi-verkko”, ”PDF-tiedosto”.
- An abbreviation or a name that ends in a pronounced letter takes its case ending after a colon: ”USB:n”, ”TPM:ään”, ”PDF:ksi”. Names that end in a written consonant take -i-: ”Luftin”, ”Roverissa”.
- Key names follow Finnish Windows: Ctrl, Alt, Vaihto, Sarkain, Enter, Esc, Välilyönti, Askelpalautin, Delete, Home, End, Page Up, Page Down, Print Screen. These come from translatable key names, so translate them where they appear.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Asetukset, Levyt, Asenna Luft.
- Finnish inflects every noun, and a name inside a placeable can't change its ending. Build the sentence so the name stays in the nominative: put it in a compound with the kind of thing, ”{ $app } -sovellus”, ”{ $app } -sovelluksessa”, or after a colon, ”Ei voitu avata: { $name }”. Write the space before the hyphen when the name comes from a placeable, since it may be several words.
- Names written into a string inflect normally: ”Luftin päivitykset”, ”Start-valikossa”, ”Roverissa”. Prefer ”Rover-sovelluksessa” where the bare ending would look odd.
- Start stays Start; say ”Start-valikko” when it has to decline.

## Plurals

Finnish has two forms: `one` (only 1) and `other` (everything else, including 0). After a number other than one, Finnish uses the singular partitive, not a plural: ”5 ilmoitusta”. Always keep `{ $count }` in both and `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } ilmoitus
   *[other] { $count } ilmoitusta
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Ei ilmoituksia`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it so its case doesn't matter: ”Viimeksi tarkistettu: { $date }”.

## Decisions

| English | Finnish | Instead of | Why |
| --- | --- | --- | --- |
| you | sinä, unwritten | te | macOS, GNOME and KDE |
| app | sovellus | appi, ohjelma | Windows, macOS and phones |
| Appearance | Ulkoasu | Mukauttaminen | GNOME's word, and it names what the page changes |
| pointer, cursor | osoitin | kohdistin | Windows calls the mouse pointer osoitin; kohdistin is the text cursor |
| board | taulu | pöytä, kangas | Short, and ”työpöytä” is already the desktop |
| All windows | Kaikki ikkunat | Tehtävänäkymä | That's what Luft calls the task view |
| snap, snap layout, snap group | telakoida, ikkuna-asettelu, ikkunaryhmä | kiinnittää, kiinnitysasettelu | Windows uses kiinnittää for both pin and snap; Luft keeps it for pin |
| tray | ilmaisinalue | ilmoitusalue | Windows' word; it holds apps, not notifications |
| workspace | työtila | virtuaalityöpöytä | GNOME's word, and short |
| Night light | Yövalo | Yötila | Windows and GNOME |
| suspend, sleep | lepotila | keskeytä, valmiustila | Windows' word |
| hibernate | horrostila | talvihorros | Windows' word |
| passkey | pääsyavain | passkey, salausavain | Apple and Google in Finnish |
| Keyring | Avainnippu | avainrengas | macOS and GNOME |
| touchpad | kosketuslevy | kosketusalusta | Windows' word |
| security | suojaus | tietoturva | Windows' word, and matches suojaussiru |
| keyboard shortcut | pikanäppäin | näppäinyhdistelmä | Shorter, Windows and GNOME |
| forget | unohtaa | poistaa | Windows says Unohda for saved networks |
| turn on, turn off | ottaa käyttöön, poistaa käytöstä | aktivoida, kytkeä | Plain Finnish, used across Windows |
| Wi-Fi | Wi-Fi | WLAN, langaton lähiverkko | What Windows and phones show |
| input source | syöttölähde | syöttötapa | Syöttötapa is the input method; a source can be either a layout or a method |
| driver | ohjain | ajuri | Windows' word; graphics driver is grafiikkaohjain |
| passphrase | tunnuslause | salalause, salasana | Keeps it apart from the account password |
| PIN | PIN-koodi | PIN | Windows Hello |
| On, Off (state) | Päällä, Pois | Käytössä, Ei käytössä | Short, and the same in quick settings and Settings |
| light style, dark style | vaalea tila, tumma tila | vaalea tyyli, tumma tyyli | Matches the Tumma tila tile |
| metered connection | käytön mukaan laskutettava yhteys | maksullinen yhteys | Windows' term |
| hotspot, tethering | yhteyspiste, jakoyhteys | hotspot, tethering | Plain Finnish |
| the blue startup screen | sininen näyttö | sininen näkymä | Same word as lukitusnäyttö |
