# Russian

What is particular to Russian, on top of [the rules every language shares](common.md). The agreed terms are in [ru.tbx](ru.tbx).

## Address

Prefer sentences without a person, as GNOME and KDE do: «Обновления будут установлены при следующей перезагрузке», «Нет уведомлений». Short passive participles suit results: «Сохранено», «Отпечаток пальца добавлен». When the reader has to be addressed, use вы, lowercase, as Windows, GNOME and KDE do; a capital Вы reads like a formal letter. Never ты.

## Buttons and labels

- Buttons and menu items take the infinitive: «Сохранить», «Открыть», «Удалить», «Закрепить на панели задач». A few established buttons are nouns: «Отмена», «Готово», «Далее», «Пауза», and power items such as «Спящий режим» and «Гибернация».
- A switch for ongoing behaviour takes the imperfective («Показывать секунды», «Не засыпать»); a one-off action the perfective («Показать», «Удалить»).
- Instructions take the imperative with вы: «Нажмите Super+Tab, чтобы увидеть все окна.»
- A label named in a sentence goes in quotation marks, as in Windows: включите «Не беспокоить». Settings needs none: «откройте Настройки».

## Spelling with ё

Write ё wherever it belongs, as macOS and GNOME do: «ещё», «всё», «учётная запись», «подключён». It keeps «всё» apart from «все». Search words may add the е spelling, since people type it.

## Typography

- Quotation marks «…», with „…“ inside them.
- The dash is an em dash with spaces: « — ». Ranges take an en dash without spaces: «2–4».
- Percent signs and units take a no-break space: «57 %», «4,5 Вт».
- Commas before «что», «чтобы», «который», «если» and «когда», as grammar requires.
- Keys use the English names printed on Russian keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. Only the space bar is Пробел.
- Write «интернет» lowercase, «USB-накопитель», «Wi-Fi».

## Names

- Settings, Disks and Install Luft are Настройки, Диски and Установить Luft. Настройки declines normally: «в Настройках».
- Start is Пуск, as in Windows; write меню «Пуск» in sentences so it doesn't decline.
- Don't decline app names, Luft or Kestrel; put the kind of thing first: «в приложении Rover», «в системе Luft». That noun decides agreement: «приложение Magpie открыто».

## Durations

Durations such as `{ $duration }` or `{ $time }` arrive in the nominative («1 минута», «3 часа 20 минут»), so never put them after «через» or «на»: «До разрядки примерно { $time }», «{ $duration } бездействия».

## Plurals

Four forms. `one` is 1, 21, 31, 101 and so on, but not 11. `few` is 2–4, 22–24 and so on, but not 12–14. `many` is 0, 5–20, 25–30 and so on, including 11–14. `other` is fractions, with the genitive singular («1,5 файла»). Since `one` covers 21 too, always write `{ $count }`. Write all four:

```ftl
files-selected = { $count ->
    [one] Выбран { $count } файл
    [few] Выбрано { $count } файла
    [many] Выбрано { $count } файлов
   *[other] Выбрано { $count } файла
}
```

## Words

| English | Russian | Not | Why |
| --- | --- | --- | --- |
| Settings | Настройки | Параметры | macOS, GNOME and Android; Параметры reads as technical |
| board | доска | холст, полотно | A plain word for a surface you lay things on |
| All windows | Все окна | Представление задач | What Luft calls the task view |
| pin, unpin | закрепить, открепить | прикрепить | Windows' words |
| snap, snap layout | прикрепить, макет прикрепления | привязать, закрепить | Windows' words; закрепить is pin |
| tray | системный трей | область уведомлений | What people say; it holds apps, not notifications |
| workspace | рабочая область | рабочий стол | Рабочий стол is the desktop |
| wallpaper | обои | фон | Windows and macOS; фон is ambiguous next to colours |
| suspend, sleep | спящий режим | ждущий режим | Windows and macOS |
| shut down | Выключить | Закрыть, Завершить работу | Short; Закрыть closes a window |
| turn off | отключить | выключить | Windows' word for features; выключить is for the computer |
| Airplane mode | Режим полёта | Режим «в самолёте» | Shorter; Android and GNOME |
| Keep awake | Не засыпать | Не отключать экран | Short and plain |
| Dictation | Диктовка | Голосовой ввод | macOS; голосовой ввод is the broader idea |
| passkey | ключ доступа | passkey | Google and Apple |
| Keyring | связка ключей | хранилище ключей | macOS and GNOME |
| security chip | чип безопасности | процессор безопасности, модуль TPM | Plainer than Windows' word |
| firmware | прошивка | встроенное ПО, микропрограмма | The word people use; GNOME Firmware says it too |
| touchpad | сенсорная панель | тачпад | Windows' word |
| battery | батарея | аккумулятор | Windows' word, and shorter |
| account | учётная запись | аккаунт | Windows and macOS |
| keyboard shortcut | сочетание клавиш | горячие клавиши | Windows' word |
| emoji | эмодзи | смайлик | Windows' word; indeclinable |
| download | скачать | загрузить | Загрузить also means starting up; the noun stays загрузка |
| passphrase | парольная фраза | кодовая фраза | GNOME and macOS |
| input source | источник ввода | способ ввода | GNOME's word; covers layouts and input methods |
| screen sharing | показ экрана | демонстрация экрана | Shorter, and matches «Остановить показ экрана» |
| metered connection | лимитное подключение | платное подключение | Windows' word |
