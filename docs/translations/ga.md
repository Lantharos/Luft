# Irish style guide

How Luft speaks Irish. The [glossary](../../packages/i18n/glossary/ga.csv) has the agreed terms; Weblate shows them next to every string. Luft follows An Caighdeán Oifigiúil, with the terminology of téarma.ie and of Microsoft's Irish localisation.

## Address and tone

- Address the reader as **tú**, singular, as Windows, Microsoft 365, GNOME and KDE do in Irish: “Is féidir leat é seo a athrú níos déanaí sna Socruithe.” Irish has no polite form, so never use sibh for one reader. macOS has no Irish translation.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as “Le do thoil” at the start of every hint, no marketing words.
- Say what happens, not how it works inside. “Suiteálfar na nuashonruithe nuair a atosófar an ríomhaire”, not a description of the system image.
- When English uses “you” only out of habit, Irish may leave it out: “Níl aon fhógra ann” for “You have no notifications”.
- Instructions in running text use the imperative singular: “Brúigh Super+Tab chun gach fuinneog a fheiceáil.”

## Buttons, menus and labels

- Buttons and menu items use the **imperative singular**, like Windows: “Sábháil”, “Oscail”, “Cealaigh”, “Atosaigh”, “Pionnáil don tascbharra”.
- Power menu items that name a state are nouns, as in Windows: “Codladh”.
- Switches and settings are nouns or short phrases: “Solas oíche”, “Taispeáin soicindí”.
- Headings and page names are nouns: “Fógraí”, “Príobháideachas”, “Teanga agus réigiún”. Write “agus” rather than “&”.
- A noun after a verb on a button takes the article when English has a “the” in mind: “Taispeáin an pasfhocal”.
- Keep labels short. Irish runs about a quarter longer than English; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case: only the first word and names take a capital letter. “Socruithe tapa”, not “Socruithe Tapa”. In running text Luft's parts are ordinary nouns: “an tascbharra”, “an scáileán glasála”. A prefix before a capital stays lowercase and takes no hyphen: “i bhFuinneog”, “na hAipeanna”. Before a lowercase vowel, t- and n- take a hyphen: “an t-ainm”, “seacht n-aip”.

## Typography

- Quotation marks: “…”, and ‘…’ inside them. Never ASCII quotes.
- Apostrophe: the typographic ’, which Irish uses often: “d’ordóg”, “m’ainm”, “b’fhéidir”.
- Ellipsis: one character, “…”, with no space before it.
- Dash: the en dash with spaces, “ – ”. No em dashes.
- Percent sign with no space: “57%”.
- Key names stay as printed on Irish and British keyboards: Ctrl, Alt, Shift, Enter, Esc, Tab, Backspace, Delete, Home, End, Page Up, Page Down, Print Screen. Only the space bar, which has no printed name, is “Spás”.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Socruithe, Dioscaí, Suiteáil Luft. In sentences Socruithe takes the article (“sna Socruithe”, “Oscail na Socruithe”), and Disks is named with its kind so it doesn't mutate (“san aip Dioscaí”).
- Start is translated as **Tosaigh**, as in Windows. In sentences say “an roghchlár Tosaigh”.
- Names never take initial mutations or the genitive: “ar Luft”, “i Rover”, “fuinneog Tern”. When a sentence would otherwise mutate the name, put the kind of thing first: “san aip Rover”.

## Initial mutations

Placeables never mutate, so build sentences where the word before a placeable doesn't trigger one, or where the mutation belongs inside the placeable's own text. Use “chuig” instead of “go” before a page name (“Ar ais chuig { $page }”), since “go” prefixes h to vowels. Where the mutation depends on a word that comes with the placeable, put that word into the placeable, as the fingers' `.inline` forms do: “do chorrmhéar dheas”, “d’ordóg chlé”.

## Plurals

Irish has five forms in CLDR: `one` (1), `two` (2), `few` (3–6), `many` (7–10) and `other` (0, 11 and above). Write all five, with `*[other]` as the default and `{ $count }` in every variant. After digits Irish uses the singular noun with the mutation the spoken number brings: lenition after 1–6, eclipsis after 7–10, none after 20, 30, 100 and 0. For `other`, write the unmutated singular, which is right for round tens and hundreds and reads acceptably for 11–19:

```ftl
notifications-count = { $count ->
    [one] { $count } fhógra
    [two] { $count } fhógra
    [few] { $count } fhógra
    [many] { $count } bhfógra
   *[other] { $count } fógra
}
```

Nouns starting with a vowel don’t change after 1–6 and take n- after 7–10: “{ $count } n-aip”. Nouns with a special counting form keep it: “{ $count } bliana”, “{ $count } uaire”. When English has an exact `[0]` variant, keep it and translate it: `[0] Níl aon fhógra ann`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence so it needs no mutation and no case: “Seiceáilte go deireanach: { $date }”.

## Decisions

| English | Irish | Instead of | Why |
| --- | --- | --- | --- |
| you | tú | sibh | Windows, GNOME and KDE; sibh is plural |
| Start | Tosaigh | Start | Irish Windows translates it |
| app | aip | feidhmchlár | Windows and app stores; feidhmchlár is the older, longer word |
| board | clár | bord, canbhás | A board you lay things on; canbhás is the surface inside it |
| All windows | Gach fuinneog | Amharc tascanna | That's what Luft calls the task view |
| Quick settings | Socruithe tapa | Mearshocruithe | Clearer at a glance |
| notification center | ionad fógraí | lárionad fógraí | Shorter; follows Windows' ionad for center |
| snap | snapáil | greamaigh, ailínigh | Greamaigh is paste |
| tray | tráidire | limistéar fógraí | It holds apps, not notifications |
| workspace | spás oibre | deasc | Deasc is the desktop behind the windows |
| wallpaper | cúlbhrat | cúlra, páipéar balla | Cúlra is ambiguous next to colors |
| sign in | sínigh isteach | logáil isteach | Windows and Microsoft accounts |
| suspend, sleep | Codladh | Cuir ar fionraí | Windows' word |
| shut down | múch | dún | Windows' word; dún is close |
| passkey | eochair rochtana | passkey | Reads as Irish and declines |
| Keyring | fáinne eochrach | eochairfháinne | GNOME's word |
| clipboard | gearrthaisce | gearrthaisceadán | Windows' word |
| firmware | dochtearraí | firmware | Microsoft's term |
| battery | ceallra | cadhnra | Windows' word |
| dark style | stíl dhorcha | mód dorcha | Matches the Stíl row in Settings |
| PIN | UAP | PIN | Irish Windows Hello; plural UAPanna |
| passphrase | frása faire | pasfhrása | Reads as Irish and declines |
| zoom | súmáil | zúmáil | Microsoft's spelling |
| take a screenshot | glac gabháil scáileáin | tóg | Microsoft's verb |
| speech (recognizer, model) | urlabhra | caint | téarma.ie: aithint urlabhra |
