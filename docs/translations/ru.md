# Russian style guide

How Luft speaks Russian. The [glossary](../../packages/i18n/glossary/ru.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all, as GNOME and KDE do in Russian: «Обновления будут установлены при следующей перезагрузке», «Нет уведомлений». Short passive participles work well for results: «Сохранено», «Скопировано», «Отпечаток пальца добавлен».
- When the reader has to be addressed, use **вы**, lowercase, as Windows, GNOME and KDE do. macOS capitalizes «Вы» and «Ваш»; Luft doesn't, since a capital reads like a formal letter. Never switch to «ты».
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no «пожалуйста» in front of every hint, no marketing words.
- Say what happens, not how it works inside.
- When English uses “you” only out of habit, leave it out: «Нет уведомлений» for “You have no notifications”.

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as Windows, GNOME and KDE do: «Сохранить», «Открыть», «Удалить», «Перезагрузить», «Закрепить на панели задач». A few established buttons are nouns: «Отмена», «Готово», «Далее», «Пауза», and power menu items such as «Спящий режим» and «Гибернация».
- Results and states use short participles or impersonal phrasing: «Сохранено», «Отправлено на печать», «Не удалось добавить отпечаток».
- Switches and settings are nouns or short phrases: «Ночной свет», «Показывать секунды». A switch that describes ongoing behavior takes the imperfective («Показывать», «Не засыпать»); a one-off action takes the perfective («Показать», «Удалить»).
- Headings and page names are nouns: «Уведомления», «Конфиденциальность».
- Instructions in running text use the imperative with вы: «Нажмите Super+Tab, чтобы увидеть все окна.»
- Keep labels short. Russian runs about a fifth longer than English; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. «Быстрые настройки», not «Быстрые Настройки». In running text, Luft's parts are ordinary nouns: «панель задач», «экран блокировки». A label referred to in a sentence keeps its capital letter and goes in quotation marks, as in Windows: включите «Не беспокоить». Settings needs none: «откройте Настройки».

## Spelling with ё

Write **ё** everywhere it belongs, as macOS and GNOME do: «ещё», «всё», «учётная запись», «сохранён», «подключён», «тёмный», «полёт». Never replace it with е. Windows drops ё, but writing it always removes ambiguity («всё» and «все») and keeps one rule for everyone. Search keywords may add the е spelling as well, since people type it that way.

## Typography

- Quotation marks: «…», and „…“ inside them.
- Apostrophe: ’, only in foreign names, which Luft avoids.
- Ellipsis: one character, «…», with no space before it: «Загрузка…».
- Dash: the em dash with spaces, « — ». Number ranges take the en dash without spaces: «2–4».
- No space before punctuation. Percent sign and units take a no-break space: «57 %», «4,5 Вт».
- Commas before «что», «чтобы», «который», «если», «когда» as Russian grammar requires, even where English has none.
- Key names stay as printed on keyboards sold in Russia, which use the English names: Ctrl, Alt, Shift, Enter, Esc, Delete, Home, Page Up. Only the space bar is called Пробел.
- Write «интернет» lowercase, «USB-накопитель», «Wi-Fi».

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Настройки, Диски, Установить Luft. Настройки declines like a normal noun: «в Настройках».
- Start is translated as in Windows: Пуск. In sentences say меню «Пуск», so it doesn't have to decline.
- Don't decline app names. Put the kind of thing first: «в приложении Rover», «приложение Tern закрыто». The same goes for Luft and Kestrel when they would need an ending: «система Luft», «в системе Luft».
- The noun in front decides agreement: «приложение Magpie открыто» (neuter, from приложение).

## Plurals

Russian has four forms:

- `one`: 1, 21, 31, 101 and so on, but not 11.
- `few`: 2–4, 22–24, 32–34 and so on, but not 12–14.
- `many`: 0, 5–20, 25–30 and so on, including 11–14.
- `other`: fractions. Use the genitive singular, as in «1,5 файла», and make it the default.

Because `one` also covers 21 and 31, always write `{ $count }` instead of the digit 1. Write all four, with `*[other]` as the default. Adjectives and verbs agree too:

```ftl
files-selected = { $count ->
    [one] Выбран { $count } файл
    [few] Выбрано { $count } файла
    [many] Выбрано { $count } файлов
   *[other] Выбрано { $count } файла
}
windows-open = { $count ->
    [one] { $count } открытое окно
    [few] { $count } открытых окна
    [many] { $count } открытых окон
   *[other] { $count } открытого окна
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Нет уведомлений`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: «Последняя проверка: { $date }».

Durations such as `{ $duration }` or `{ $time }` arrive in the nominative («1 минута», «3 часа 20 минут»), so never put them after «через» or «на»: «До разрядки примерно { $time }», «{ $duration } бездействия».

## Decisions

| English | Russian | Instead of | Why |
| --- | --- | --- | --- |
| you | вы, lowercase, or no person | Вы, ты | Windows, GNOME and KDE |
| Settings | Настройки | Параметры | macOS, GNOME, Android; Windows' «Параметры» reads as technical |
| Start | Пуск | Start | What Windows has always called it in Russian |
| board | доска | холст, полотно | A plain word for a surface you lay things on |
| All windows | Все окна | Представление задач | That's what Luft calls the task view |
| pin, unpin | закрепить, открепить | прикрепить | Windows' words |
| snap, snap layout | прикрепить, макет прикрепления | привязать, закрепить | Windows' words; закрепить is pin |
| tray | системный трей | область уведомлений | What people say; it holds apps, not notifications |
| workspace | рабочая область | рабочий стол | Рабочий стол is the desktop |
| wallpaper | обои | фон | Windows and macOS; фон is ambiguous next to colors |
| suspend, sleep | спящий режим | ждущий режим | Windows and macOS |
| shut down | Выключить | Закрыть, Завершить работу | Short; Закрыть means close a window |
| turn off | отключить | выключить | Windows' word for features; выключить is for the computer |
| Airplane mode | Режим полёта | Режим «в самолёте» | Shorter; Android and GNOME |
| Keep awake | Не засыпать | Не отключать экран | Short and plain |
| Dictation | Диктовка | Голосовой ввод | macOS; голосовой ввод is the broader idea |
| passkey | ключ доступа | passkey | Google and Apple in Russian |
| Keyring | связка ключей | хранилище ключей | macOS and GNOME |
| security chip | чип безопасности | процессор безопасности, модуль TPM | Plainer than Windows' «процессор безопасности» |
| firmware | прошивка | встроенное ПО, микропрограмма | The word people use; GNOME Firmware says it too |
| touchpad | сенсорная панель | тачпад | Windows' word |
| battery | батарея | аккумулятор | Windows' word, and shorter |
| account | учётная запись | аккаунт | Windows and macOS |
| keyboard shortcut | сочетание клавиш | комбинация клавиш, горячие клавиши | Windows' word |
| emoji | эмодзи | смайлик, эмотикон | Windows' word; indeclinable |
| Wi-Fi | Wi-Fi | беспроводная сеть | What Windows and people say |
| download | скачать | загрузить | Загрузить also reads as starting up («меню загрузки»); the noun stays загрузка |
| passphrase | парольная фраза | кодовая фраза | GNOME and macOS |
| input source | источник ввода | способ ввода | GNOME's word, covers layouts and input methods |
| screen sharing | показ экрана | демонстрация экрана | Shorter, and matches «Остановить показ экрана» |
| metered connection | лимитное подключение | платное подключение | Windows' word |
