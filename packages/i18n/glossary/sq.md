# Albanian

What is particular to Albanian, on top of [the rules every language shares](common.md). The agreed terms are in [sq.tbx](sq.tbx).

## Address

Address the reader with ti, as Windows does in Albanian, since it is friendlier and shorter: “Dëshiron të vazhdosh?”, “Mund ta ndryshosh më vonë te Cilësimet.” Never switch to ju.

## Buttons and labels

- Buttons and menu items take the imperative, second person singular: “Ruaj”, “Hap”, “Anulo”, “Rinis”, “Fikso te shiriti i detyrave”.
- Headings and page names are nouns in the definite form: “Njoftimet”, “Privatësia”.
- Luft's parts take the definite form when they stand alone as a label (“Shiriti i detyrave”, “Qendra e njoftimeve”) and are lowercase and declined normally in sentences: “hap Fillimin”, “te shiriti i detyrave”.

## Typography

- Quotation marks “…”, with ‘…’ inside them, as in Microsoft's Albanian.
- The dash is an en dash with spaces: “ – ”. The ellipsis takes no space before it.
- Always write ë and ç, never e and c in their place.
- Key names stay as printed: Ctrl, Alt, Shift, Super.

## Names

- Start is Fillimi, because it is used in sentences: “Hap Fillimin”, “Kërko në Fillim”.
- Settings, Disks and Install Luft are Cilësimet, Disqet and Instalo Luft.
- App names may take Albanian endings (“Roveri”, “në Rover”).

## Plurals

Two forms, `one` and `other`. Words whose plural looks like the singular still need both, because the words around them change: “1 dritare e hapur”, “3 dritare të hapura”.

```ftl
files-count = { $count ->
    [one] { $count } skedar
   *[other] { $count } skedarë
}
```

## Words

| English | Albanian | Not | Why |
| --- | --- | --- | --- |
| board | tabela | dërrasa | Familiar from apps that arrange things on a board |
| All windows | Të gjitha dritaret | Pamja e detyrave | What Luft calls the task view |
| taskbar | shiriti i detyrave | shiriti i punëve | Windows' word |
| tray | zona e sistemit | zona e njoftimeve | It holds apps, not notifications |
| pin, unpin | fikso, shfikso | mbërthe | Mbërthe is snap |
| snap | mbërthe | ngjit | Windows' word; ngjit is paste |
| lock, unlock | blloko, zhblloko | kyç, shkyç | Matches ekrani i bllokimit |
| clipboard | kujtesa e fragmenteve | e papastra | Windows' word |
| Keyring | varg çelësash | mbajtëse çelësash | Closest to the English image |
| encryption | enkriptim | fshehtëzim | Windows' word, more widely understood |
| sound | zëri; a sound that plays: tingull | | Two different things in Albanian |
| file, folder | skedar, dosje | fajll, folder | Standard Albanian, used by Windows |
| accessibility | qasshmëri | përdorshmëri | Windows' word; përdorshmëri is usability |
| firmware | firmware | | No established Albanian word |
