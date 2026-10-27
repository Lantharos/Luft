# Latvian style guide

How Luft speaks Latvian. The [glossary](../../packages/i18n/glossary/lv.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: „Atjauninājumi tiks instalēti pēc restartēšanas“, „Nav paziņojumu“.
- When the reader has to be addressed, use **jūs**, lowercase, as Windows, macOS and GNOME do in Latvian: „To var mainīt vēlāk Iestatījumos.“, „Mēģiniet vēlreiz.“ Never capitalize Jūs or Jūsu, and never switch to tu.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no „lūdzu“ in front of every hint, no marketing words.
- Say what happens, not how it works inside.
- When English uses „you“ only out of habit, leave it out: „Nav paziņojumu“ for „You have no notifications“.

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as in Windows, macOS and GNOME: „Saglabāt“, „Atvērt“, „Atcelt“, „Restartēt“, „Piespraust uzdevumjoslai“.
- Switches and settings are nouns or short phrases: „Nakts gaisma“, „Rādīt sekundes“.
- Headings and page names are nouns: „Paziņojumi“, „Privātums“.
- Status lines use a past participle that agrees with what it describes: „Saglabāta“ for a key (atslēga), „Pievienots“ for a fingerprint (nospiedums).
- Instructions in running text use the imperative with jūs: „Nospiediet Super+Tab, lai redzētu visus logus.“
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Ātrie iestatījumi“, not „Ātrie Iestatījumi“. In running text, Luft's parts are ordinary nouns: „uzdevumjosla“, „bloķēšanas ekrāns“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „ieslēdziet Netraucēt“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Apostrophe: ’, rarely needed.
- Ellipsis: one character, „…“, with no space before it.
- Dash: the en dash with spaces, „ – “.
- Percent sign with a space before it: „57 %“.
- Use the long vowels and soft consonants (ā, ē, ī, ū, č, ģ, ķ, ļ, ņ, š, ž) everywhere. Search keywords may add a spelling without them when people often type it that way.
- Key names stay as printed on keyboards sold in Latvia, which carry the English labels: Ctrl, Alt, Shift, Enter, Delete, Home. Only the space bar, which has no label, gets a Latvian name: Atstarpe.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Iestatījumi, Diski, Instalēt Luft.
- Start stays Start; say „izvēlne Start“ when it has to fit a sentence.
- Iestatījumi keeps its capital in sentences, as an app name: „Atveriet Iestatījumus“. A page is named with „sadaļā“ and its exact title: „sadaļā Privātums“.
- Names are never declined. Put the kind of thing first and decline that word instead: „lietotnē Rover“, „lietotne Tern ir aizvērta“, „vieta sistēmai Luft“.

## Plurals

Latvian has three forms:

- `zero`: 0 and every number ending in 0 or in 11–19 (10, 11, 15, 20, 30, 111 …)
- `one`: numbers ending in 1, except those ending in 11 (1, 21, 31, 101 …)
- `other`: everything else (2–9, 22–29, 102 …)

`one` takes the singular, `zero` and `other` the plural, so these two are usually the same. Write all three anyway, keep `{ $count }` in every one instead of the digit 1, and keep `*[other]` as the default. Adjectives and verbs agree too:

```ftl
windows-open = { $count ->
    [zero] { $count } atvērti logi
    [one] { $count } atvērts logs
   *[other] { $count } atvērti logi
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Nav paziņojumu`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Pēdējā pārbaude: { $date }“.

## Decisions

| English | Latvian | Instead of | Why |
| --- | --- | --- | --- |
| you | jūs, lowercase, or no person | tu | Windows, macOS and GNOME |
| app | lietotne | programma, aplikācija | Windows, macOS and app stores |
| board | tāfele | dēlis, audekls | An open surface windows are laid out on |
| All windows | Visi logi | Uzdevumu skats | That's what Luft calls the task view |
| taskbar | uzdevumjosla | rīkjosla, panelis | Windows' word |
| tray | sistēmas tekne | paziņojumu apgabals | It holds apps, not notifications |
| pin, unpin | piespraust, atspraust | piestiprināt | Windows' words |
| snap, snap layout | piesaistīt, piesaistes izkārtojums | pievilkt | Windows' words |
| workspace | darbvieta | darbvirsma | GNOME's word; darbvirsma is the desktop |
| wallpaper | fona attēls | tapete | Windows and GNOME |
| suspend, sleep | miega režīms | gaidstāve | Windows and macOS |
| shut down | izslēgt | beidzēt | Windows; the same word as turn off is clear in context |
| Night light | Nakts gaisma | Nakts režīms | Windows and GNOME |
| emoji | emocijzīme | emodži | Windows and the term commission's word; declines naturally |
| passkey | piekļuves atslēga | passkey | Apple and Google in Latvian |
| Keyring | atslēgu saišķis | atslēgu gredzens | GNOME |
| firmware | aparātprogrammatūra | programmaparatūra, firmware | Windows' word |
| touchpad | skārienpaliktnis | skārienpanelis | Windows' word; skārienpanelis is a touchscreen |
| power | barošana | enerģija, jauda | Windows' settings page |
| display | displejs | monitors | Windows' settings page |
| Wi-Fi | Wi-Fi | bezvadu tīkls | Windows and macOS |
| passphrase | paroles frāze | ieejas frāze | GNOME; keeps it distinct from parole |
| dark style, light style | tumšais režīms, gaišais režīms | tumšais stils | Matches the Tumšais režīms tile |
| hotspot, tether | tīklājs | piesaiste | Windows' word; piesaiste is snapping |
| On-screen keyboard | Ekrāntastatūra | ekrāna tastatūra | Windows' word |
| startup (of the computer) | startēšana | palaišana | Palaišana is for apps starting at sign-in |
