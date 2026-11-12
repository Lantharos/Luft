# Ukrainian

What is particular to Ukrainian, on top of [the rules every language shares](common.md). The agreed terms are in [uk.tbx](uk.tbx).

## Address

Prefer sentences without a person, as GNOME and KDE do: «Оновлення буде встановлено під час наступного запуску», «Немає сповіщень». Impersonal forms in -но and -то suit results: «Збережено», «Не вдалося додати відбиток». When the reader has to be addressed, use ви, lowercase, as Windows, macOS and GNOME do. Never Ви or Ваш with a capital, and never ти.

Use Ukrainian words and the 2019 orthography, never Russian calques: увімкнути, not включити; параметри or налаштування, not настройки; вилучити, not удалити; сповіщення, not уведомлення; екрана, курсора, файлу.

## Buttons and labels

- Buttons and menu items take the infinitive: «Зберегти», «Відкрити», «Скасувати», «Закріпити на панелі завдань».
- A switch for ongoing behaviour takes the imperfective («Показувати секунди», «Не засинати»); a one-off action the perfective («Показати», «Вилучити»).
- Instructions take the imperative with ви: «Натисніть Super+Tab, щоб побачити всі вікна.»
- A label named in a sentence goes in quotation marks, as Ukrainian Windows does: увімкніть «Не турбувати». Settings is a name and keeps its capital: «у Параметрах».

## Typography

- Quotation marks «…», with „…“ inside them.
- The apostrophe is always ’, never ' or ʼ: комп’ютер, під’єднати.
- The dash is an em dash with spaces: « — ». Ranges take an en dash without spaces: 2–4.
- The percent sign takes no space, as Windows writes it („57%“); units take a space and Ukrainian symbols („4,5 Вт“).
- Mind euphony: і/й and у/в alternate with the sounds around them: «Дата й час», but «перезавантажити і встановити»; «у файл», «в іншому».
- Keys use the English names printed on Ukrainian keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. Only the space bar is Пробіл.

## Names

- Settings, Disks and Install Luft are Параметри, Диски and Встановлення Luft. Параметри declines as a plural noun: «у Параметрах».
- Start is Пуск, as in Ukrainian Windows. In sentences write меню «Пуск», and меню Пуск in labels and search words, so it doesn't decline.
- Don't decline app names, Luft or Kestrel; put the kind of thing first: «у програмі Rover», «у системі Luft». That noun decides agreement: «програма Magpie відкрита».

## Plurals

Four forms. `one` is 1, 21, 31, 101 and so on, but not 11. `few` is 2–4, 22–24 and so on, but not 12–14. `many` is 0, 5–20, 25–30 and so on, including 11–14. `other` is fractions, with the genitive singular («1,5 файла»). Since `one` covers 21 too, always write `{ $count }`. Impersonal forms such as «Вибрано» avoid agreeing the verb:

```ftl
files-selected = { $count ->
    [one] Вибрано { $count } файл
    [few] Вибрано { $count } файли
    [many] Вибрано { $count } файлів
   *[other] Вибрано { $count } файла
}
```

## Words

| English | Ukrainian | Not | Why |
| --- | --- | --- | --- |
| Settings | Параметри | Настройки, Налаштування | GNOME, macOS and Windows 10; настройки is a Russianism |
| app | програма | застосунок, додаток | Windows, macOS and GNOME; додаток is a calque |
| board | дошка | полотно | A plain word for a surface; полотно is the canvas inside it |
| All windows | Усі вікна | Подання завдань | What Luft calls the task view |
| snap, snap layout | прикріпити, макет прикріплення | закріпити | Windows' words; закріпити is pin |
| tray | системний лоток | область сповіщень | KDE's word; it holds apps, not notifications |
| workspace | робочий простір | віртуальний робочий стіл | GNOME's word; робочий стіл is the desktop |
| wallpaper | шпалери | фон, тло | macOS and what people say |
| suspend, sleep | Сплячий режим | Призупинити, Сон | Windows' word |
| shut down | Вимкнути | Завершити роботу | GNOME's word; shorter on a button |
| restart | Перезавантажити | Перезапустити | Windows; перезапустити is for apps |
| remove, delete | вилучити, видалити | видалити for both | GNOME and KDE keep the pair apart |
| Keep awake | Не засинати | Не вимикати екран | Short enough for a tile |
| passkey | ключ доступу | passkey | Google and Apple |
| Keyring | в’язка ключів | брелок | GNOME and macOS |
| security chip | процесор безпеки | мікросхема TPM | Windows' name for the TPM |
| firmware | мікропрограма | прошивка | Windows and GNOME; прошивка is slang |
| touchpad | сенсорна панель | тачпад | Windows' word |
| keyboard shortcut | сполучення клавіш | комбінація клавіш | Windows' word |
| icon | значок | піктограма, іконка | Short; іконка is colloquial |
| accessibility | Спеціальні можливості | Доступність | Windows' page name |
| emoji | емодзі | емоджі, смайлик | Windows' spelling; indeclinable |
| passphrase, PIN | парольна фраза, PIN-код | пароль, PIN | Windows' words; PIN alone reads unfinished |
| input source | джерело введення | мова введення | GNOME's word; a source can be a layout or an input method |
| metered connection | лімітне з’єднання | тарифіковане | Windows' word |
| pair (Bluetooth) | створити пару | з’єднати | Windows' word; під’єднати is connect |
| screen reader, zoom | Читач екрана, Лупа | Екранний диктор, Масштабування | GNOME's reader; Windows' magnifier |
| dwell click | клацання наведенням | клацання із затримкою | Short enough for the lock screen |
| home folder | домашня папка; Домівка in paths | Home | GNOME's folder name |
| Wallpapers folder | Wallpapers | Шпалери | Keeps its English name: «Зображення › Wallpapers» |
| installer | програма встановлення | інсталятор | Windows' word |
