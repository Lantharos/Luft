# Bulgarian style guide

How Luft speaks Bulgarian. The [glossary](../../packages/i18n/glossary/bg.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: „Актуализациите се инсталират при следващото рестартиране“, „Няма известия“.
- When the reader has to be addressed, use **вие**, lowercase, the polite form Windows, macOS, GNOME and KDE use in Bulgarian: „Можете да промените това по-късно в Настройки.“ Never capitalize Вие or Ваш, and never switch to ти.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no „Моля“ at the start of every hint, no marketing words.
- Say what happens, not how it works inside.
- Instructions in running text use the polite imperative: „Натиснете Super+Tab, за да видите всички прозорци.“, „Опитайте отново.“

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, as macOS and Android do in Bulgarian: „Запази“, „Отвори“, „Изтрий“, „Рестартирай“, „Закачи към лентата на задачите“. The button is a command the reader gives, so this doesn't contradict addressing them with вие.
- Fixed exceptions: „Отказ“ for Cancel, „Готово“ for Done, „Напред“ for Next, „Вход“ and „Изход“ for signing in and out.
- The power menu uses nouns, as Windows does: „Заключване“, „Изход“, „Заспиване“, „Хибернация“, „Рестартиране“, „Изключване“.
- Switches and settings are nouns or short phrases: „Нощна светлина“, „Показване на секундите“.
- Headings and page names are nouns, including actions: „Известия“, „Поверителност“, „Добавяне на акаунт“.
- Keep labels short. Bulgarian runs about a fifth longer than English; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Бързи настройки“, not „Бързи Настройки“. In running text, Luft's parts are ordinary nouns: „лентата на задачите“, „заключеният екран“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „включете Не безпокойте“.

## Grammar

- Definite article on masculine nouns: the full form (-ът, -ят) for the subject, the short form (-а, -я) everywhere else. „Файлът е изтрит“, but „Изтриване на файла“.
- Masculine nouns that aren't people take the count form after a number other than one: „{ $count } файла“, „{ $count } прозореца“, „{ $count } диска“. The count form also follows „няколко“ and „колко“: „няколко файла“. Without a number, use the ordinary plural: „файловете“.
- Feminine and neuter nouns use the ordinary plural after numbers: „{ $count } папки“, „{ $count } известия“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Apostrophe: ’, rarely needed in Bulgarian.
- Ellipsis: one character, „…“, with no space before it: „Зареждане…“.
- Dash: the en dash with spaces, „ – “. A hyphen without spaces joins words: „току-що“, „по-късно“.
- Percent sign with a space before it: „57 %“.
- Units come from the formatter; write W for watts.
- Key names stay as printed on Bulgarian keyboards, which use the English names: Ctrl, Alt, Shift, Enter, Delete. The space bar has no label, so it is „Интервал“.

## Names

- Luft, Kestrel and the names of the apps stay as they are, in Latin: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Настройки, Дискове, Инсталиране на Luft.
- Start is written Старт, as in Windows; in a sentence say „менюто Старт“.
- Latin names never take an article or ending. Put the kind of thing first and let it carry the article: „в приложението Rover“, „приложението Tern е затворено“, „системата Luft“.

## Plurals

Bulgarian has two forms: `one` (only 1) and `other` (everything else, including 0). Write `{ $count }` in both, and keep `*[other]` as the default. Masculine nouns take the count form in `other`:

```ftl
windows-open = { $count ->
    [one] { $count } отворен прозорец
   *[other] { $count } отворени прозореца
}
notifications-count = { $count ->
    [one] { $count } известие
   *[other] { $count } известия
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Няма известия`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it: „Последна проверка: { $date }“.

## Decisions

| English | Bulgarian | Instead of | Why |
| --- | --- | --- | --- |
| you | вие, lowercase, or no person | ти, Вие | What every desktop does in Bulgarian; capital Вие is for letters |
| buttons | imperative singular: Запази | Запазване | Shorter, and what macOS and Android do |
| settings | настройки | | Every system agrees |
| board | табло | дъска | Neutral, and дъска reads as a whiteboard |
| All windows | Всички прозорци | Изглед на задачите | That's what Luft calls the task view |
| taskbar | лента на задачите | | Windows' word |
| tray | системна област | област за уведомяване | It holds apps, not notifications |
| pin, unpin | закачам, откачам | фиксирам | Short and familiar from Windows |
| snap, snap layout | прилепвам, оформление за прилепване | закачам | Windows' words; закачам is pin |
| workspace | работно пространство | работен плот | Работен плот is the desktop |
| wallpaper | тапет | фон | Фон is ambiguous next to colors; phones say тапет |
| suspend, sleep | заспиване, режим на заспиване | спящ режим, суспендиране | Matches the other power menu nouns |
| Night light | Нощна светлина | | Windows' word |
| Do Not Disturb | Не безпокойте | Не ме безпокойте | Windows and Android |
| notification | известие | уведомление | Android, GNOME and today's Windows |
| passkey | ключ за достъп | passkey | What Google and Windows say in Bulgarian |
| Keyring | ключодържател | | GNOME's word |
| clipboard | клипборд | буфер, системен буфер | Windows' word, known to everyone |
| account | акаунт | профил, сметка | Windows, Google and Apple |
| sign in, sign out | вход, изход | влизане, излизане, вписване | Short on buttons, what Windows says |
| update (noun) | актуализация | обновление, ъпдейт | Windows' word |
| encryption | шифроване | криптиране | Windows' word |
| Appearance | Облик | Външен вид, Персонализиране | GNOME's word, and short |
| keyboard layout | клавиатурна подредба | клавиатурна схема | GNOME and KDE |
| passphrase | парола за диска | парола за шифроване | Says what it unlocks and stays apart from the account password |
| PIN | ПИН | PIN | Windows and banks write it in Cyrillic |
| home folder | лична папка | начална папка, домашна папка | GNOME's word |
| Pictures | Снимки | Изображения, Картини | Short and familiar from phones; the Wallpapers folder inside it keeps its English name |
| Zoom (accessibility) | Увеличение | Лупа | One name on the lock screen and in Settings |
| desktop environment | работна среда | работен плот | Работен плот is the area behind the windows |
| metered connection | връзка с отчитане | | Short and neutral |
