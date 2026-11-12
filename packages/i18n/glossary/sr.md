# Serbian

What is particular to Serbian, on top of [the rules every language shares](common.md). The agreed terms are in [sr.tbx](sr.tbx).

## Two scripts

Serbian is translated once, in Cyrillic (`sr`). The Latin version (`sr-Latn`) is written from it automatically, letter for letter, so never edit the Latin files or choose other words for them; fix the Cyrillic text and the Latin one follows. Latin letters appear in Cyrillic text only in names (Luft, Rover, Windows), abbreviations (USB, PIN, TPM, VPN, Wi-Fi), key names, file names and code, and those stay the same in both scripts.

Use ekavian forms and Serbian words: датотека, фасцикла, рачунар, подешавања, екран, тастатура, систем, обавештење, време, светло.

## Address

Prefer sentences without a person: „Ажурирања се инсталирају при следећем покретању“, „Нема обавештења“. When the reader has to be addressed, use the plural ви, lowercase, as Windows does: „Можете то да промените касније у Подешавањима.“ Never Ви or Ваш with a capital, which GNOME uses and reads too formal, and never ти.

## Buttons and labels

- Buttons and menu items take the imperative, second person singular: „Сачувај“, „Отвори“, „Откажи“, „Поново покрени“, „Закачи на траку задатака“. The button is a command the reader gives, so this sits fine next to ви.
- Some actions read better as nouns, as in Windows and GNOME: „Пријава“, „Одјава“, „Спавање“.
- Instructions in running text use ви: „Притисните Super+Tab да бисте видели све прозоре.“
- A label named in a sentence keeps its capital and needs no quotation marks: „укључите Не узнемиравај“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces: „ – “. The ellipsis takes no space before it.
- Key names stay as printed, in Latin: Ctrl, Alt, Shift, Super.

## Names

- App names stay in Latin. Settings, Disks and Install Luft are Подешавања, Дискови and Инсталирај Luft.
- Start is Старт; write „мени Старт“ when it has to decline.
- Don't decline Latin names; put the kind of thing first: „у апликацији Rover“, „систем Luft“.

## Plurals

Three forms: `one` (1, 21, 31, 101, but not 11), `few` (2–4, 22–24, but not 12–14) and `other` (0, 5–20 and the rest). Since `one` covers 21 too, always write `{ $count }`, never the digit 1. Adjectives and verbs agree:

```ftl
minutes-left = { $count ->
    [one] Преостала је { $count } минута
    [few] Преостале су { $count } минуте
   *[other] Преостало је { $count } минута
}
```

## Words

| English | Serbian | Not | Why |
| --- | --- | --- | --- |
| settings | подешавања | поставке | Serbian usage, GNOME and Android |
| board | табла | плоча | The Serbian word for a board |
| All windows | Сви прозори | Приказ задатака | What Luft calls the task view |
| taskbar | трака задатака | програмска трака | Windows' Serbian word |
| tray | системска палета | област за обавештења | Windows' word; it holds apps, not notifications |
| pin, unpin | закачити, откачити | прикачити | Windows and GNOME |
| snap, snap layout | поравнати, распоред прозора | закачити | Закачити is pin |
| workspace | радни простор | радна површина | Радна површина is the desktop |
| suspend, sleep | стање спавања; the button is Спавање | обустави | Windows' word |
| Keyring | привезак кључева | | GNOME's word |
| clipboard | остава | међуспремник | GNOME's word, and Serbian rather than Croatian |
| file, folder | датотека, фасцикла | фајл, фолдер | GNOME and Windows |
| touchpad | тачпед | додирна табла | What people say |
