# Macedonian

What is particular to Macedonian, on top of [the rules every language shares](common.md). The agreed terms are in [mk.tbx](mk.tbx).

## Address

Prefer sentences without a person: „Ажурирањата се инсталираат при следното рестартирање“, „Нема известувања“. When the reader has to be addressed, use вие, lowercase, as Windows, macOS, GNOME and KDE do: „Ова можете да го промените подоцна во Поставки.“ Never Вие or Ваш with a capital, and never ти. Instructions take the polite imperative: „Обидете се повторно.“

Write standard Macedonian, not Serbian or Bulgarian forms: поставки, датотека, известување, уред, лозинка, пребарување, безбедност.

## Buttons and labels

- Buttons and menu items take the imperative singular: „Зачувај“, „Отвори“, „Избриши“, „Откажи“, „Рестартирај“. The button is a command the reader gives, so this sits fine next to вие.
- Fixed words: „Готово“ for Done, „Следно“ for Next, „Врати“ for Undo. The power menu: „Заклучи“, „Одјава“, „Спиење“, „Хибернација“, „Рестартирај“, „Исклучи“.
- Headings are nouns, including actions: „Додавање сметка“.
- A label named in a sentence keeps its capital and needs no quotation marks: „вклучете Не вознемирувај“.

## Grammar

- One definite article where Macedonian needs it, in the neutral -от/-та/-то, never -ов or -он: „Отвори ја папката“.
- Keep the clitic doubling a definite object needs: „Ова можете да го промените“, „Отстрани ја мрежата“.
- Masculine nouns with a count form take it after a number: „{ $count } диска“, „{ $count } часа“. Others use the ordinary plural: „{ $count } прозорци“, „{ $count } датотеки“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces: „ – “. A hyphen without spaces joins words: „USB-меморија“, „е-пошта“.
- The percent sign follows the number without a space: „57%“.
- Keys use the English names printed on Macedonian keyboards: Ctrl, Alt, Shift, Enter, Delete. The unlabelled space bar is „Празно место“.

## Names

- App names stay in Latin and never take an article or ending; put the kind of thing first: „во апликацијата Rover“, „системот Luft“.
- Settings, Disks and Install Luft are Поставки, Дискови and Инсталирај Luft. Start is Старт, and „менито Старт“ in a sentence.

## Plurals

Two forms: `one` (1, 21, 31, 101, but not 11) and `other`. Since `one` covers 21 too, always write `{ $count }`, never the digit 1.

```ftl
disks-found = { $count ->
    [one] Пронајден е { $count } диск
   *[other] Пронајдени се { $count } диска
}
```

## Words

| English | Macedonian | Not | Why |
| --- | --- | --- | --- |
| Settings | Поставки | Подесувања | Windows' word, the one most people know |
| Start | Старт | Почеток | Windows' name for the menu |
| board | табла | плоча | Reads as a surface to lay things on |
| All windows | Сите прозорци | Приказ на задачи | What Luft calls the task view |
| taskbar | лента со задачи | панел | Windows' word |
| tray | системска област | област за известувања | It holds apps, not notifications |
| pin, unpin | закачи, откачи | прикачи | Windows' words |
| snap | прилепи | закачи | Закачи is pin |
| workspace | работен простор | работна површина | Работна површина is the desktop |
| file, folder | датотека, папка | фајл, директориум | Windows and GNOME |
| trash | корпа | ѓубре, канта | Windows' word |
| clipboard | клипборд | привремена меморија | Short, and what people say |
| account | сметка | профил, налог | Windows' word; налог is Serbian |
| notification | известување | нотификација, обавестување | Standard Macedonian; обавестување is Serbian |
| Keyring | привезок за клучеви | клучарник | Plain and understandable |
| keyboard shortcut | кратенка на тастатура | брза комбинација | Windows' word |
| computer | компјутер | сметач, рачунар | What Macedonians say; рачунар is Serbian |
| passphrase | тајна фраза | лозинка | Distinct from the account password |
| input source | извор за внесување | јазик за внесување | Covers layouts and input methods alike |
| driver | двигател | драјвер | GNOME and KDE |
| metered connection | мерена врска | ограничена врска | Says what it is: data use is measured |
| hotspot, tether | хотспот, тетеринг | точка на пристап | What people say for sharing a phone's internet |
| Wallpapers folder | Wallpapers, inside Слики | Позадини | The folder's real name on disk |
