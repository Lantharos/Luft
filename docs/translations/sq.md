# Albanian style guide

How Luft speaks Albanian. The [glossary](../../packages/i18n/glossary/sq.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Address the reader with **ti**, as Windows does in Albanian: “Dëshiron të vazhdosh?”, “Mund ta ndryshosh më vonë te Cilësimet.” Don't switch to “ju” within Luft.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no marketing words.
- Say what happens, not how it works inside: “Përditësimet instalohen në rinisjen e ardhshme.”
- When English uses “you” only out of habit, leave it out: “Nuk ka njoftime” for “You have no notifications”.

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**: “Ruaj”, “Hap”, “Anulo”, “Rinis”, “Fikso te shiriti i detyrave”.
- Switches and settings are nouns or short phrases: “Drita e natës”, “Shfaq sekondat”.
- Headings and page names are nouns in the definite form: “Njoftimet”, “Privatësia”, “Cilësimet”.
- Names of Luft's parts use the definite form when they stand alone as labels (“Shiriti i detyrave”, “Qendra e njoftimeve”) and are declined normally in sentences (“hap Fillimin”, “te shiriti i detyrave”).
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. “Cilësimet e shpejta”, not “Cilësimet e Shpejta”. In running text, feature names are lowercase unless they are names: “shiriti i detyrave”, but “Rover”, “Fillimi”.

## Typography

- Quotation marks: “…”, as in Microsoft's Albanian. Use ‘…’ inside them.
- Ellipsis: one character, “…”, with no space before it.
- Dash: the en dash with spaces, “ – ”.
- Use ë and ç everywhere; never replace them with e and c.
- Key names stay as printed on keyboards: Ctrl, Alt, Shift, Super.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Cilësimet, Disqet, Instalo Luft.
- Start is translated as Fillimi, because it's referred to in sentences: “Hap Fillimin”, “Kërko në Fillim”.
- Names of apps can take Albanian endings (“Roveri”, “në Rover”), but when that reads oddly, put the kind of thing first: “aplikacioni Rover”.

## Plurals

Albanian has two forms, `one` and `other`. Always keep `{ $count }` in both, and keep `*[other]` as the default:

```ftl
files-count = { $count ->
    [one] { $count } skedar
   *[other] { $count } skedarë
}
```

Words whose plural looks like the singular (“dritare”) still need both variants, since the verb or adjective may change: “1 dritare e hapur”, “3 dritare të hapura”.

When English has an exact `[0]` variant, keep it and translate it: `[0] Asnjë njoftim`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it.

## Decisions

| English | Albanian | Instead of | Why |
| --- | --- | --- | --- |
| you | ti | ju | Windows' Albanian; friendlier and shorter |
| Start | Fillimi | Start | Has to decline in sentences |
| board | tabela | dërrasa | Familiar from apps that arrange things on a board |
| All windows | Të gjitha dritaret | Pamja e detyrave | That's what Luft calls the task view |
| taskbar | shiriti i detyrave | shiriti i punëve | Windows' word |
| tray | zona e sistemit | zona e njoftimeve | It holds apps, not notifications |
| pin, unpin | fikso, shfikso | mbërthe | Mbërthe is snap |
| snap | mbërthe | ngjit | Windows' word; ngjit is paste |
| lock, unlock | blloko, zhblloko | kyç, shkyç | Matches ekrani i bllokimit |
| clipboard | kujtesa e fragmenteve | e papastra | Windows' word |
| passkey | çelës kalimi | kod kalimi | Windows' word, and it is a key, not a code |
| Keyring | varg çelësash | mbajtëse çelësash | Closest to the English image |
| encryption | enkriptim | fshehtëzim | Windows' word, more widely understood |
| sound | zëri, a sound that plays: tingull | | Two different things in Albanian |
| file, folder | skedar, dosje | fajll, folder | Standard Albanian, used by Windows |
| accessibility | qasshmëri | përdorshmëri | Windows' word; përdorshmëri is usability |
| firmware | firmware | | No established Albanian word |
