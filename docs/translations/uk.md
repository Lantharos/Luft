# Ukrainian style guide

How Luft speaks Ukrainian. The [glossary](../../packages/i18n/glossary/uk.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all, as GNOME and KDE do in Ukrainian: «Оновлення буде встановлено під час наступного запуску», «Немає сповіщень». Impersonal forms in -но, -то work well for results: «Збережено», «Скопійовано», «Не вдалося додати відбиток».
- When the reader has to be addressed, use **ви**, lowercase, as Windows, macOS and GNOME do in Ukrainian: «Це можна змінити пізніше в Параметрах», «Ви можете…». Never capitalized «Ви» or «Ваш», never «ти».
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no «будь ласка» in front of every hint, no marketing words.
- Say what happens, not how it works inside.
- Genuine Ukrainian vocabulary and the 2019 orthography, never Russian calques: увімкнути, not включити; параметри or налаштування, not настройки; вилучити, not удалити; сповіщення, not уведомлення; екрана, курсора, файлу as the 2019 rules give them.

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as Windows, macOS and GNOME do in Ukrainian: «Зберегти», «Відкрити», «Скасувати», «Перезавантажити», «Закріпити на панелі завдань».
- Results and states use the impersonal form: «Збережено», «Надіслано на принтер».
- Switches and settings are nouns or short phrases: «Нічне світло», «Показувати секунди». A switch that describes ongoing behavior takes the imperfective («Показувати», «Не засинати»); a one-off action takes the perfective («Показати», «Вилучити»).
- Headings and page names are nouns: «Сповіщення», «Конфіденційність».
- Instructions in running text use the imperative with ви: «Натисніть Super+Tab, щоб побачити всі вікна.»
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. «Швидкі параметри», not «Швидкі Параметри». In running text, Luft's parts are ordinary nouns: «панель завдань», «екран блокування». The Settings app is a name and keeps its capital: «у Параметрах». A label referred to in a sentence goes in quotation marks, as Ukrainian Windows does: увімкніть «Не турбувати».

## Typography

- Quotation marks: «…», and „…“ inside them.
- Apostrophe: the typographic ’, never ' or ʼ: комп’ютер, під’єднати, в’язка.
- Ellipsis: one character, «…», with no space before it: «Завантаження…».
- Dash: the em dash with spaces, « — », as Ukrainian typography uses it. Ranges take the en dash without spaces: 2–4.
- Percent sign with no space, as Windows writes it: «57%». Units take a space and Ukrainian symbols: «4,5 Вт».
- Mind euphony: «і/й» and «у/в» alternate by the sounds around them: «Дата й час», «Мова й регіон», but «перезавантажити і встановити»; «у файл», «в іншому».
- Key names stay as printed on keyboards sold in Ukraine, which use the English names: Ctrl, Alt, Shift, Enter, Esc, Delete, Home. Only the space bar is called Пробіл.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Параметри, Диски, Встановлення Luft. Параметри declines like a normal plural noun: «у Параметрах».
- Start is translated as **Пуск**, as Ukrainian Windows does. In sentences say «меню „Пуск“» inside quotation marks, or «меню Пуск» in labels and keywords, so it doesn't have to decline.
- Don't decline app names. Put the kind of thing first: «у програмі Rover», «програму Tern закрито». The same goes for Luft and Kestrel when they would need an ending: «система Luft», «у системі Luft».
- The noun in front decides agreement: «програма Magpie відкрита» (feminine, from програма).

## Plurals

Ukrainian has four forms:

- `one`: 1, 21, 31, 101 and so on, but not 11.
- `few`: 2–4, 22–24, 32–34 and so on, but not 12–14.
- `many`: 0, 5–20, 25–30 and so on, including 11–14.
- `other`: fractions. Use the genitive singular, as in «1,5 файла», and make it the default.

Because `one` also covers 21 and 31, always write `{ $count }` instead of the digit 1. Write all four, with `*[other]` as the default. Adjectives and verbs agree too:

```ftl
files-selected = { $count ->
    [one] Вибрано { $count } файл
    [few] Вибрано { $count } файли
    [many] Вибрано { $count } файлів
   *[other] Вибрано { $count } файла
}
windows-open = { $count ->
    [one] { $count } відкрите вікно
    [few] { $count } відкриті вікна
    [many] { $count } відкритих вікон
   *[other] { $count } відкритого вікна
}
```

Impersonal forms such as «Вибрано» avoid verb agreement altogether, which is why Luft prefers them. When English has an exact `[0]` variant, keep it and translate it: `[0] Немає сповіщень`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: «Остання перевірка: { $date }».

## Decisions

| English | Ukrainian | Instead of | Why |
| --- | --- | --- | --- |
| you | ви, lowercase, or no person | ти, Ви | Windows, macOS and GNOME |
| Settings | Параметри | Настройки, Налаштування | GNOME, macOS and Windows 10; «настройки» is a Russianism |
| app | програма | застосунок, додаток | Windows, macOS and GNOME; «додаток» is a calque |
| Start | Пуск | Start | Windows' name, known to everyone |
| board | дошка | полотно | A plain word for a surface you lay things on; «полотно» is the canvas inside it |
| All windows | Усі вікна | Подання завдань | That's what Luft calls the task view |
| snap, snap layout | прикріпити, макет прикріплення | закріпити | Windows' words; закріпити is pin |
| tray | системний лоток | область сповіщень | KDE's word; it holds apps, not notifications |
| workspace | робочий простір | віртуальний робочий стіл | GNOME's word; робочий стіл is the desktop |
| wallpaper | шпалери | фон, тло | macOS and what people say; фон is ambiguous next to colors |
| suspend, sleep | Сплячий режим | Призупинити, Сон | Windows' word, the one most people know |
| shut down | Вимкнути | Завершити роботу | GNOME's word; shorter on a button |
| restart | Перезавантажити | Перезапустити | Windows; перезапустити is for apps |
| remove, delete | вилучити, видалити | видалити for both | GNOME and KDE keep the pair apart |
| Keep awake | Не засинати | Не вимикати екран | Short enough for a tile |
| passkey | ключ доступу | passkey | Google and Apple in Ukrainian |
| Keyring | в’язка ключів | брелок | GNOME and macOS |
| security chip | процесор безпеки | мікросхема TPM | Windows' name for the TPM |
| firmware | мікропрограма | прошивка, фірмвер | Windows and GNOME; прошивка is slang |
| touchpad | сенсорна панель | тачпад | Windows' word |
| keyboard shortcut | сполучення клавіш | комбінація клавіш | Windows' word |
| icon | значок | піктограма, іконка | Short; іконка is colloquial |
| accessibility | Спеціальні можливості | Доступність | Windows' page name |
| emoji | емодзі | емоджі, смайлик | Windows' spelling; indeclinable |
| Wi-Fi | Wi-Fi | вайфай | What Windows and people write |
| passphrase, PIN | парольна фраза, PIN-код | пароль, PIN | Windows' words; PIN alone reads unfinished |
| input source | джерело введення | мова введення | GNOME's word; a source can be a layout or an input method |
| metered connection | лімітне з’єднання | тарифіковане | Windows' word |
| pair (Bluetooth) | створити пару | з’єднати, підключити | Windows' word; під’єднати is connect |
| screen reader, zoom | Читач екрана, Лупа | Екранний диктор, Масштабування | GNOME's reader; Windows' magnifier |
| dwell click | клацання наведенням | клацання із затримкою | Short enough for the lock screen |
| track | доріжка | трек | Windows' and GNOME's media keys |
| home folder | домашня папка; Домівка in paths | Home | GNOME's folder name |
| Wallpapers folder | Wallpapers | Шпалери | A real folder that keeps its English name: «Зображення › Wallpapers» |
| installer | програма встановлення | інсталятор | Windows' word |
