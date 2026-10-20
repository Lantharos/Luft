# Macedonian style guide

How Luft speaks Macedonian. The [glossary](../../packages/i18n/glossary/mk.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: „Ажурирањата се инсталираат при следното рестартирање“, „Нема известувања“.
- When the reader has to be addressed, use **вие**, lowercase, as Windows, macOS, GNOME and KDE do in Macedonian: „Ова можете да го промените подоцна во Поставки.“ Never capitalize Вие or Ваш, and never switch to ти.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no „Ве молиме“ at the start of every hint, no marketing words.
- Say what happens, not how it works inside.
- Instructions in running text use the polite imperative: „Притиснете Super+Tab за да ги видите сите прозорци.“, „Обидете се повторно.“
- Write standard Macedonian, not Serbian or Bulgarian forms: поставки, датотека, известување, уред, лозинка, пребарување, безбедност.

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, the usual form for commands in Macedonian software: „Зачувај“, „Отвори“, „Избриши“, „Откажи“, „Рестартирај“, „Закачи на лентата со задачи“. The button is a command the reader gives, so this doesn't contradict addressing them with вие.
- Fixed words: „Готово“ for Done, „Следно“ for Next, „Врати“ for Undo.
- The power menu: „Заклучи“, „Одјава“, „Спиење“, „Хибернација“, „Рестартирај“, „Исклучи“.
- Switches and settings are nouns or short phrases: „Ноќно светло“, „Прикажи секунди“.
- Headings and page names are nouns, including actions: „Известувања“, „Приватност“, „Додавање сметка“.
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Брзи поставки“, not „Брзи Поставки“. In running text, Luft's parts are ordinary nouns: „лентата со задачи“, „заклучениот екран“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „вклучете Не вознемирувај“.

## Grammar

- Use the definite article where Macedonian needs it, and only one: „Датотеката е избришана“, „Отвори ја папката“. With proximal and distal forms (-ов, -он), stay with the neutral -от/-та/-то.
- Keep the clitic doubling Macedonian requires with a definite object: „Ова можете да го промените“, „Отстрани ја мрежата“.
- Masculine nouns that aren't people take the count form ending in -а after a number when they have one: „{ $count } диска“, „{ $count } часа“, „{ $count } дена“. Nouns without a common count form use the ordinary plural: „{ $count } прозорци“, „{ $count } уреди“.
- Feminine and neuter nouns use the ordinary plural after numbers: „{ $count } датотеки“, „{ $count } известувања“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Apostrophe: ’, which marks a dropped vowel: „’рѓа“. Rarely needed.
- Ellipsis: one character, „…“, with no space before it: „Се вчитува…“.
- Dash: the en dash with spaces, „ – “. A hyphen without spaces joins words: „USB-меморија“, „е-пошта“.
- Percent sign right after the number, with no space: „57%“.
- Units come from the formatter; write W for watts.
- Key names stay as printed on Macedonian keyboards, which use the English names: Ctrl, Alt, Shift, Enter, Delete. The space bar has no label, so it is „Празно место“.

## Names

- Luft, Kestrel and the names of the apps stay as they are, in Latin: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Поставки, Дискови, Инсталирај Luft.
- Start is written Старт, as in Windows; in a sentence say „менито Старт“.
- Latin names never take an article or ending. Put the kind of thing first and let it carry the article: „во апликацијата Rover“, „апликацијата Tern е затворена“, „системот Luft“.

## Plurals

Macedonian has two forms: `one` (1, 21, 31, 101 but not 11) and `other` (everything else, including 0 and 11). Because `one` also covers 21 and 31, always write `{ $count }` instead of the digit 1, and keep `*[other]` as the default. Masculine nouns take their count form in `other`:

```ftl
disks-found = { $count ->
    [one] Пронајден е { $count } диск
   *[other] Пронајдени се { $count } диска
}
notifications-count = { $count ->
    [one] { $count } известување
   *[other] { $count } известувања
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Нема известувања`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it: „Последна проверка: { $date }“.

## Decisions

| English | Macedonian | Instead of | Why |
| --- | --- | --- | --- |
| you | вие, lowercase, or no person | ти, Вие | What every desktop does in Macedonian |
| buttons | imperative singular: Зачувај | Зачувување | Shorter, and what Windows and GNOME do |
| Settings | Поставки | Подесувања | Windows' word, the one most people know |
| Start | Старт | Почеток | Windows' name for the menu |
| board | табла | плоча | Plain and reads as a surface to lay things on |
| All windows | Сите прозорци | Приказ на задачи | That's what Luft calls the task view |
| taskbar | лента со задачи | панел | Windows' word |
| tray | системска област | област за известувања | It holds apps, not notifications |
| pin, unpin | закачи, откачи | прикачи | Windows' words |
| snap | прилепи | закачи | Закачи is pin |
| workspace | работен простор | работна површина | Работна површина is the desktop |
| file | датотека | фајл | Standard and what Windows and GNOME use |
| folder | папка | директориум | Windows' word |
| trash | корпа | ѓубре, канта | Windows' word |
| clipboard | клипборд | привремена меморија | Short, and what people say |
| suspend, sleep | Спиење | суспендирај | Windows' word |
| account | сметка | профил, налог | Windows' word; налог is Serbian |
| notification | известување | нотификација, обавестување | Standard Macedonian; обавестување is Serbian |
| passkey | клуч за пристап | passkey | Translated like the other keys |
| Keyring | привезок за клучеви | клучарник | Plain and understandable |
| keyboard shortcut | кратенка на тастатура | брза комбинација | Windows' word |
| computer | компјутер | сметач, рачунар | What Macedonians say; рачунар is Serbian |
| passphrase | тајна фраза | лозинка | Stays distinct from the account password |
| input source | извор за внесување | јазик за внесување | Covers layouts and input methods alike |
| driver | двигател | драјвер | What GNOME and KDE use |
| metered connection | мерена врска | ограничена врска | Says what it is: data use is measured |
| hotspot, tether | хотспот, тетеринг | точка на пристап | What people say for sharing a phone's internet |
| Wallpapers folder | Wallpapers, inside Слики | Позадини | It is the folder's real name on disk |
