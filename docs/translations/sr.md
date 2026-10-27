# Serbian style guide

How Luft speaks Serbian. The [glossary](../../packages/i18n/glossary/sr.tbx) has the agreed terms; Weblate shows them next to every string. This guide covers both scripts: `sr` is Cyrillic, `sr-Latn` is Latin.

## Script

- `sr` is written in **Cyrillic** only. Latin letters appear only in names (Luft, Rover, Windows), abbreviations (USB, PIN, TPM, VPN, Wi-Fi), key names, file names and code.
- `sr-Latn` is a **faithful transliteration** of `sr`: the same words, the same sentences, letter for letter (љ → lj, њ → nj, џ → dž, ђ → đ). It never uses different vocabulary. Translate `sr` first and transliterate it; when you fix one, fix the other the same way.
- Names that are Latin in Cyrillic text stay unchanged in `sr-Latn`.

## Address and tone

- Prefer sentences without a person at all: „Ажурирања се инсталирају при следећем покретању“, „Нема обавештења“.
- When the reader has to be addressed, use the formal plural **ви**, lowercase, as most operating systems do in Serbian, Windows among them: „Можете то да промените касније у Подешавањима.“ Never capitalize Ви or Ваш, and never switch to ти.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no marketing words.
- Say what happens, not how it works inside.
- Ekavian forms and Serbian vocabulary: датотека, фасцикла, рачунар, подешавања, екран, тастатура, систем, обавештење, време, светло.

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, the usual form for commands in Serbian software: „Сачувај“, „Отвори“, „Откажи“, „Поново покрени“, „Закачи на траку задатака“. This doesn't contradict addressing the reader with ви: the button is a command the reader gives.
- Some actions read better as nouns, as in Windows and GNOME: „Пријава“, „Одјава“, „Спавање“.
- Switches and settings are nouns or follow the English form: „Ноћно светло“, „Прикажи секунде“.
- Headings and page names are nouns: „Обавештења“, „Приватност“.
- Instructions in running text use ви: „Притисните Super+Tab да бисте видели све прозоре.“
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Брза подешавања“, not „Брза Подешавања“. In running text, Luft's parts are ordinary nouns: „трака задатака“, „закључани екран“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „укључите Не узнемиравај“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Ellipsis: one character, „…“, with no space before it.
- Dash: the en dash with spaces, „ – “.
- Key names stay as printed on keyboards, in Latin: Ctrl, Alt, Shift, Super.

## Names

- Luft, Kestrel and the names of the apps stay as they are, in Latin: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Подешавања, Дискови, Инсталирај Luft.
- Start is written Старт (Start in `sr-Latn`); say „мени Старт“ when it has to decline.
- Don't decline Latin names. Put the kind of thing first: „у апликацији Rover“, „апликација Tern је затворена“, „систем Luft“.

## Plurals

Serbian has three forms: `one` (1, 21, 31, 101 but not 11), `few` (2–4, 22–24, but not 12–14) and `other` (everything else, including 0 and 5–20). Because `one` also covers 21 and 31, always write `{ $count }` instead of the digit 1. Adjectives and verbs agree too:

```ftl
windows-open = { $count ->
    [one] { $count } отворен прозор
    [few] { $count } отворена прозора
   *[other] { $count } отворених прозора
}
minutes-left = { $count ->
    [one] Преостала је { $count } минута
    [few] Преостале су { $count } минуте
   *[other] Преостало је { $count } минута
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Нема обавештења`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Последња провера: { $date }“.

## Decisions

| English | Serbian | Instead of | Why |
| --- | --- | --- | --- |
| you | ви, lowercase, or no person | ти, Ви | Windows; GNOME's capital Ви is too formal |
| settings | подешавања | поставке | Serbian usage, GNOME, Android |
| board | табла | плоча | Serbian word for a board |
| All windows | Сви прозори | Приказ задатака | That's what Luft calls the task view |
| taskbar | трака задатака | програмска трака | Windows' Serbian word |
| tray | системска палета | област за обавештења | Windows' word; it holds apps, not notifications |
| pin, unpin | закачити, откачити | прикачити | Windows and GNOME |
| snap, snap layout | поравнати, распоред прозора | закачити | Закачити is pin |
| workspace | радни простор | радна површина | Радна површина is the desktop |
| suspend, sleep | стање спавања, button Спавање | обустави | Windows' word |
| Night light | Ноћно светло | | Windows and GNOME agree |
| passkey | приступни кључ | кључ за пролаз | Windows' word, clearer |
| Keyring | привезак кључева | | GNOME's word |
| clipboard | остава | међуспремник | GNOME's word, and Serbian rather than Croatian |
| file, folder | датотека, фасцикла | фајл, фолдер | GNOME and Windows |
| touchpad | тачпед | додирна табла | What people say |
| Bluetooth | Bluetooth | Блутут | A trademark, kept like Wi-Fi |
