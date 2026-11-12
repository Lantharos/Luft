# Bulgarian

What is particular to Bulgarian, on top of [the rules every language shares](common.md). The agreed terms are in [bg.tbx](bg.tbx).

## Address

Prefer sentences without a person: „Актуализациите се инсталират при следващото рестартиране“, „Няма известия“. When the reader has to be addressed, use вие, lowercase, as Windows, macOS, GNOME and KDE do: „Можете да промените това по-късно в Настройки.“ Never Вие or Ваш with a capital, and never ти. Instructions take the polite imperative: „Натиснете Super+Tab, за да видите всички прозорци.“

## Buttons and labels

- Buttons and menu items take the imperative singular, as macOS and Android do: „Запази“, „Отвори“, „Изтрий“, „Рестартирай“. The button is a command the reader gives, so this sits fine next to вие.
- Fixed exceptions: „Отказ“ for Cancel, „Готово“ for Done, „Напред“ for Next, „Вход“ and „Изход“ for signing in and out.
- The power menu uses nouns, as Windows does: „Заключване“, „Изход“, „Заспиване“, „Хибернация“, „Рестартиране“, „Изключване“.
- Headings are nouns, including actions: „Добавяне на акаунт“.
- A label named in a sentence keeps its capital and needs no quotation marks: „включете Не безпокойте“.

## Grammar

- Masculine nouns take the full article (-ът, -ят) as the subject and the short one (-а, -я) everywhere else: „Файлът е изтрит“, but „Изтриване на файла“.
- Masculine nouns that aren't people take the count form after a number other than one, and after „няколко“ and „колко“: „{ $count } файла“, „{ $count } прозореца“. Without a number, use the ordinary plural: „файловете“. Feminine and neuter nouns use the ordinary plural: „{ $count } папки“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces: „ – “. A hyphen without spaces joins words: „току-що“, „по-късно“.
- The percent sign takes a space: „57 %“.
- Keys use the English names printed on Bulgarian keyboards: Ctrl, Alt, Shift, Enter, Delete. The unlabelled space bar is „Интервал“.

## Names

- App names stay in Latin and never take an article or ending; put the kind of thing first and let it carry the article: „в приложението Rover“, „системата Luft“.
- Settings, Disks and Install Luft are Настройки, Дискове and Инсталиране на Luft. Start is Старт, and „менюто Старт“ in a sentence.

## Plurals

Two forms, `one` (only 1) and `other`. Masculine nouns take the count form in `other`:

```ftl
windows-open = { $count ->
    [one] { $count } отворен прозорец
   *[other] { $count } отворени прозореца
}
```

## Words

| English | Bulgarian | Not | Why |
| --- | --- | --- | --- |
| board | табло | дъска | Neutral; дъска reads as a whiteboard |
| All windows | Всички прозорци | Изглед на задачите | What Luft calls the task view |
| tray | системна област | област за уведомяване | It holds apps, not notifications |
| pin, unpin | закачам, откачам | фиксирам | Short and familiar from Windows |
| snap, snap layout | прилепвам, оформление за прилепване | закачам | Windows' words; закачам is pin |
| workspace | работно пространство | работен плот | Работен плот is the desktop |
| wallpaper | тапет | фон | Фон is ambiguous next to colours; phones say тапет |
| suspend, sleep | заспиване | спящ режим, суспендиране | Matches the other power menu nouns |
| Do Not Disturb | Не безпокойте | Не ме безпокойте | Windows and Android |
| notification | известие | уведомление | Android, GNOME and today's Windows |
| passkey | ключ за достъп | passkey | What Google and Windows say |
| Keyring | ключодържател | | GNOME's word |
| clipboard | клипборд | буфер | Windows' word, known to everyone |
| account | акаунт | профил, сметка | Windows, Google and Apple |
| update | актуализация | обновление, ъпдейт | Windows' word |
| encryption | шифроване | криптиране | Windows' word |
| Appearance | Облик | Външен вид | GNOME's word, and short |
| keyboard layout | клавиатурна подредба | клавиатурна схема | GNOME and KDE |
| passphrase | парола за диска | парола за шифроване | Says what it unlocks, apart from the account password |
| PIN | ПИН | PIN | Windows and banks write it in Cyrillic |
| home folder | лична папка | домашна папка | GNOME's word |
| Pictures | Снимки | Изображения | Familiar from phones; the Wallpapers folder inside keeps its English name |
| Zoom (accessibility) | Увеличение | Лупа | One name on the lock screen and in Settings |
| desktop environment | работна среда | работен плот | Работен плот is the area behind the windows |
| metered connection | връзка с отчитане | | Short and neutral |
