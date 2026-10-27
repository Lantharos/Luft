# Serbian (Latin) style guide

Serbian in Latin script follows the [Serbian style guide](sr.md) in everything: address, tone, button forms, plurals and the decisions on terms. The [glossary](../../packages/i18n/glossary/sr-Latn.tbx) is the Serbian one in Latin script.

## One text, two scripts

- `sr-Latn` is a **faithful transliteration** of `sr`. Same words, same sentences, same punctuation; only the letters change. Never pick a different word for the Latin version.
- Translate in `sr` (Cyrillic) first and transliterate it. When you change one, change the other the same way.
- Letter for letter: а a, б b, в v, г g, д d, ђ đ, е e, ж ž, з z, и i, ј j, к k, л l, љ lj, м m, н n, њ nj, о o, п p, р r, с s, т t, ћ ć, у u, ф f, х h, ц c, ч č, џ dž, ш š. At the start of a capitalized word, Љ, Њ and Џ become Lj, Nj and Dž; in all-capitals text, LJ, NJ and DŽ.
- Always use the diacritics: č, ć, ž, š, đ. Never write dj for đ or plain c for č and ć.
- Names, abbreviations and key names that are Latin in the Cyrillic text stay exactly as they are: Luft, Rover, USB, Wi-Fi, Ctrl.

## Examples

| Cyrillic | Latin |
| --- | --- |
| Подешавања | Podešavanja |
| Брза подешавања | Brza podešavanja |
| Закачи на траку задатака | Zakači na traku zadataka |
| Ноћно светло | Noćno svetlo |
| Не узнемиравај | Ne uznemiravaj |
| приступни кључ | pristupni ključ |
| Инсталирај Luft | Instaliraj Luft |

```ftl
windows-open = { $count ->
    [one] { $count } otvoren prozor
    [few] { $count } otvorena prozora
   *[other] { $count } otvorenih prozora
}
```

Quotation marks, the ellipsis and the dash are the same as in Cyrillic: „…“, …, and „ – “.
