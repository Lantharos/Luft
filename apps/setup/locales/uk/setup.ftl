## Buttons used across steps

setup-continue = Продовжити
setup-back = Назад
setup-cancel = Скасувати
setup-not-now = Не зараз
setup-try-again = Спробувати ще раз
setup-restart = Перезавантажити
setup-restart-now = Перезавантажити зараз
setup-restart-later = Перезавантажити пізніше
setup-saving = Збереження…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Встановлення Luft
setup-installing-progress = Встановлення, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Пошук
setup-picker-no-match = Нічого не знайдено

## Welcome step: language, keyboard and time zone

setup-region-title = Вітаємо в Luft
setup-region-language = Мова
setup-region-keyboard = Клавіатура
setup-region-time-zone = Часовий пояс
setup-region-intro = Почнімо налаштування. Виберіть мову, клавіатуру й часовий пояс.
setup-region-intro-guessed-computer = Почнімо налаштування. Ці значення визначено за даними комп’ютера, тож змініть те, що не підходить.
setup-region-intro-guessed = Почнімо налаштування. Автоматично визначено { $guesses }, тож змініть те, що не підходить.
setup-region-guess-from-computer = { $fields } за даними комп’ютера
setup-region-guess-from-network = { $fields } за даними мережі
setup-region-field-language = мову
setup-region-field-keyboard = клавіатуру
setup-region-field-time-zone = часовий пояс

## Where Luft goes

setup-destination-choose-title = Куди встановити Luft?
setup-destination-choose-description = Виберіть, як розмістити Luft на цьому комп’ютері. Нічого не зміниться, доки ви не підтвердите.
setup-destination-alongside-title = Звільнити місце поруч із Windows
setup-destination-alongside-description = Windows займатиме менше місця, щоб звільнити простір для Luft. Ваші файли у Windows залишаться без змін.
setup-destination-whole-title = Вибір диска
setup-destination-whole-description = Luft займе весь диск. Усе, що на ньому є, буде стерто.
setup-destination-custom-title = Вибір місця для Luft
setup-destination-custom-description = Розподіліть диски на свій розсуд у програмі «Диски».
setup-destination-replace-title = Замінити { $system }
setup-destination-replace-description = Luft займе її місце й збереже все ваше.
setup-destination-meet-title = Поруч із Windows
setup-destination-meet-description = Це місце вже звільнено за допомогою Meet Luft, тож Windows залишиться без змін.
setup-destination-meet-drive-title = На диску { $drive }
setup-destination-meet-drive-description = Це місце вже звільнено на іншому диску за допомогою Meet Luft, і Luft запускається звідти з власними файлами запуску.
setup-destination-looking = Перевірка дисків…

setup-destination-meet-choice = Поруч із Windows
setup-destination-meet-choice-description = Використати { $size }, звільнені за допомогою Meet Luft поруч із Windows.
setup-destination-meet-drive-choice = На диску { $drive }
setup-destination-meet-drive-choice-description = Використати { $size }, звільнені за допомогою Meet Luft на диску { $drive }.
setup-destination-alongside-choice = Поруч із { $windows }
setup-destination-alongside-choice-description = Залишити Windows і її файли, а частину диска віддати Luft.
setup-destination-replace-choice = Замінити { $system }
setup-destination-replace-choice-description = Зберегти ваші файли, обліковий запис і параметри, а на місце старої системи встановити Luft.
setup-destination-whole-choice = Використати весь диск
setup-destination-whole-choice-description = Стерти диск і повністю віддати його Luft.
setup-destination-try-choice = Просто спробувати Luft
setup-destination-try-choice-description = Спершу роздивіться. Нічого не буде встановлено, а диски залишаться недоторканими.
setup-destination-custom-choice = Власний варіант
setup-destination-custom-choice-description = Розподіліть розділи самостійно в програмі «Диски».

setup-destination-more-options = Інші варіанти
setup-destination-starting = Запуск…
setup-destination-replace = Замінити
setup-destination-install = Встановити Luft

## Confirming where Luft goes

setup-confirm-replace-title = Замінити { $system }?
setup-confirm-erase-title = Стерти { $drive }?
setup-confirm-shrink-title = Зменшити Windows до { $size }?
setup-confirm-meet-title = Встановити Luft поруч із Windows?
setup-confirm-meet-drive-title = Встановити Luft на диск { $drive }?
setup-confirm-free-title = Встановити Luft у вільне місце?
setup-confirm-replace-keep-old = Luft одразу почне копіювання. Стара система більше не запускатиметься, а її файли залишаться, доки ви їх не вилучите.
setup-confirm-replace-erase-old = Luft одразу почне копіювання. Стару систему буде стерто остаточно, а ваші файли залишаться на місці.
setup-confirm-erase-description = Усе, що є на цьому диску, буде стерто остаточно, зокрема інші системи й файли.
setup-confirm-install-description = Luft одразу почне копіювання. Тим часом можна налаштувати обліковий запис.
setup-confirm-erase = Стерти й встановити
setup-confirm-install = Встановити

## Making room next to Windows

setup-alongside-hint = Перетягніть, щоб розподілити { $drive } між Windows і Luft. Windows збереже всі свої файли й трохи місця на майбутнє.
setup-windows-bitlocker = Windows тримає цей диск заблокованим за допомогою BitLocker, тому Luft не може звільнити на ньому місце. Вимкніть у Windows шифрування пристрою або зменште диск у програмі «Керування дисками» й виберіть вільне місце в пункті «Власний варіант».
setup-windows-hibernated = Windows перебуває в сплячому режимі або була вимкнена зі швидким запуском, тому її диск не можна безпечно змінити. Запустіть Windows, утримуйте Shift, вибираючи «Завершити роботу», а потім знову запустіть Luft.
setup-windows-dirty = Спершу диск Windows потрібно швидко перевірити. Запустіть Windows, один раз перезавантажте її, а потім знову запустіть Luft.
setup-windows-full = Windows потрібен майже весь її диск. Звільніть у Windows приблизно { $size }, а потім знову запустіть Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Речі, які ви спакували у Windows ({ $size }), буде розпаковано у ваш новий обліковий запис.

## Windows options

setup-windows-fast-startup = Вимкнути швидкий запуск у Windows
setup-windows-fast-startup-description = Тоді Windows вимикатиметься повністю, тож звук, Wi-Fi і Bluetooth у Luft запускатимуться з нуля, а її диск залишатиметься доступним.
setup-windows-clock = Правильний час в обох системах
setup-windows-clock-description = Windows читатиме годинник комп’ютера так само, як Luft, тож час більше не стрибатиме під час перемикання.
setup-windows-bluetooth = Перенести пристрої Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } пристрій, що має пару у Windows, працюватиме в Luft без повторного створення пари.
    [few] { $count } пристрої, що мають пару у Windows, працюватимуть у Luft без повторного створення пари.
    [many] { $count } пристроїв, що мають пару у Windows, працюватимуть у Luft без повторного створення пари.
   *[other] { $count } пристрою, що мають пару у Windows, працюватимуть у Luft без повторного створення пари.
}

## Choosing a drive

setup-drives-label = Диски
setup-drives-none = Немає диска, який може використати Luft. Під’єднайте диск і перевірте знову.
setup-drive-has-windows = Містить { $windows }
setup-drive-empty = Порожній
setup-drive-partitions = { $count ->
    [one] { $count } розділ
    [few] { $count } розділи
    [many] { $count } розділів
   *[other] { $count } розділу
}

## Custom space

setup-custom-open-disks = Відкрити «Диски»
setup-custom-looking = Перевірка…
setup-custom-look-again = Перевірити знову
setup-custom-free-label = Вільне місце
setup-custom-free-space = Вільне місце: { $size }
setup-custom-on-drive = На диску { $drive }
setup-custom-none = Звільніть щонайменше { $size } у програмі «Диски», а потім перевірте знову. Luft буде встановлено у вільне місце, яке ви залишите.

## Replacing a Linux system

setup-replace-stays = Що залишиться
setup-replace-changes = Що зміниться
setup-replace-keeps-account = Ваші файли й обліковий запис { $account }
setup-replace-keeps-account-password = Ваші файли й обліковий запис { $account } разом із паролем
setup-replace-keeps-accounts = { $count ->
    [one] Ще { $count } обліковий запис у ній, разом із файлами
    [few] Ще { $count } облікові записи в ній, разом із файлами
    [many] Ще { $count } облікових записів у ній, разом із файлами
   *[other] Ще { $count } облікового запису в ній, разом із файлами
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } мережеве з’єднання разом із паролем Wi-Fi
    [few] { $count } мережеві з’єднання разом із паролями Wi-Fi
    [many] { $count } мережевих з’єднань разом із паролями Wi-Fi
   *[other] { $count } мережевого з’єднання разом із паролями Wi-Fi
}
setup-replace-keeps-drives = { $drives } — підключатимуться під час запуску, як і раніше
setup-replace-keeps-hostname = Ім’я комп’ютера { $hostname } і його ключі SSH
setup-replace-keeps-tools = { $count ->
    [one] { $count } встановлений вами інструмент командного рядка — у Toolbox після входу
    [few] { $count } встановлені вами інструменти командного рядка — у Toolbox після входу
    [many] { $count } встановлених вами інструментів командного рядка — у Toolbox після входу
   *[other] { $count } встановленого вами інструмента командного рядка — у Toolbox після входу
}
setup-replace-keeps-old = Система { $system } більше не запускатиметься. Її системні файли збережено як old-system, доки ви не вилучите їх у програмі «Диски» або в Параметрах.
setup-replace-erases-system = Системний розділ { $system } буде стерто. Ваші файли зберігаються на окремому розділі й залишаться без змін.
setup-replace-clears-boot = Її розділ /boot буде очищено для файлів запуску Luft.
setup-replace-apps = Встановлені в ній програми не буде перенесено. Встановіть їх знову із Schelf.

setup-replace-blocked-encrypted = Її зашифровано, тому заміна зі збереженням файлів поки що не підтримується.
setup-replace-blocked-single = Ваші файли зберігаються на одному розділі із системою, тому заміна зі збереженням файлів поки що не підтримується.
setup-replace-blocked-layout = Її диск розмічено так, що Luft поки не може її замінити.
setup-replace-blocked-startup = Її системний розділ EFI замалий для Luft, а розділу /boot, який можна використати замість нього, немає.
setup-replace-blocked-no-account = У ній немає облікового запису, який можна перенести.
setup-replace-blocked-running = Luft зараз запущено з неї. Щоб замінити її, запустіть Luft з USB-накопичувача.
setup-replace-blocked-read-only = Її диск доступний лише для читання.

## Connecting to the internet

setup-network-title = Під’єднання до інтернету
setup-network-description = Це необов’язково. Через інтернет Luft зможе налаштувати годинник і часовий пояс, а ви зможете користуватися інтернетом під час встановлення.
setup-network-unavailable = Мережі зараз недоступні. Під’єднатися можна пізніше з панелі завдань.
setup-network-looking = Пошук мереж…
setup-network-cable = Під’єднано кабелем
setup-network-show-all = Показати всі мережі
setup-network-skip = Пропустити
setup-network-failed = Не вдалося під’єднатися
setup-network-wrong-password = Неправильний пароль
setup-network-connected = Під’єднано
setup-network-connecting = Під’єднання…
setup-network-saved = Збережено
setup-network-password = Пароль
setup-network-join = Під’єднатися

## Account

setup-account-title = Хто користуватиметься цим комп’ютером?
setup-account-description = З цим обліковим записом ви входитимете в систему. Інших людей можна додати пізніше в Параметрах.
setup-account-full-name = Ваше ім’я
setup-account-full-name-example = Леся Українка
setup-account-user-name = Ім’я користувача
setup-account-password = Пароль
setup-account-repeat = Введіть ще раз
setup-account-user-name-invalid = Використовуйте малі латинські літери, цифри, - і _
setup-account-full-name-invalid = Не використовуйте коми й двокрапки
setup-account-mismatch = Паролі не збігаються

## Installing

setup-finishing-failed-title = Не вдалося встановити Luft
setup-finishing-failed-description = Під час встановлення сталася помилка.
setup-finishing-failed-stick = Комп’ютер і далі запускається так само, як раніше. Можна й далі користуватися Luft з USB-накопичувача або перезавантажитися й спробувати ще раз.
setup-finishing-failed-trying = Комп’ютер і далі запускається так само, як раніше. Можна й далі користуватися Luft у поточному вигляді або перезавантажитися й спробувати ще раз.
setup-finishing-use-stick = Користуватися Luft з накопичувача
setup-finishing-keep-trying = Далі пробувати Luft
setup-finishing-installed-title = Luft встановлено
setup-finishing-trust-stick = Вийміть USB-накопичувач, щойно екран згасне. Потім синій екран запитає, чи довіряти Luft. Скористайтеся там клавіатурою.
setup-finishing-trust = Одразу після перезавантаження синій екран запитає, чи довіряти Luft. Скористайтеся там клавіатурою.
setup-finishing-restart-stick = Перезавантажте комп’ютер, щоб почати роботу. Вийміть USB-накопичувач, щойно екран згасне.
setup-finishing-restart = Перезавантажте комп’ютер, щоб почати роботу.
setup-finishing-title = Майже готово
setup-finishing-description = Luft копіюється на комп’ютер. Це займе кілька хвилин.
setup-finishing-plug-in = Не від’єднуйте комп’ютер від живлення до завершення.
setup-stage-idle = Підготовка
setup-stage-preparing = Звільнення місця для Luft
setup-stage-copying = Копіювання Luft
setup-stage-waiting = Завершення
setup-stage-configuring = Налаштування облікового запису
setup-stage-finished = Готово

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Натисніть будь-яку клавішу протягом 10 секунд
setup-enroll-choose-enroll = Виберіть Enroll MOK, а потім Continue
setup-enroll-choose-yes = Виберіть Yes
setup-enroll-type-code = Введіть код, а потім виберіть Reboot
setup-enroll-digits = { $count ->
    [one] { $count } цифра
    [few] { $count } цифри
    [many] { $count } цифр
   *[other] { $count } цифри
}
setup-secure-boot-title = Комп’ютер поки що не довіряє Luft
setup-secure-boot-code = Одразу після наступного перезавантаження синій екран запитає, чи довіряти Luft. Скористайтеся там клавіатурою, щоб ввести цей код.
setup-secure-boot-skipped = Синій екран було пропущено. Отримайте новий код і перезавантажте комп’ютер, а потім скористайтеся там клавіатурою.
setup-secure-boot-getting = Отримання коду…
setup-secure-boot-new-code = Отримати новий код

## Encryption

setup-protect-title = Захист файлів
setup-protect-tpm = Зашифруйте цей комп’ютер, щоб ніхто не зміг прочитати ваші файли без входу в систему, навіть якщо комп’ютер буде втрачено. Під час запуску він розблоковується сам.
setup-protect-passphrase = Зашифруйте цей комп’ютер, щоб ніхто не зміг прочитати ваші файли без вашої парольної фрази, навіть якщо комп’ютер буде втрачено.
setup-protect-staged-title = Ваші файли буде зашифровано
setup-protect-staged-description = Шифрування почнеться автоматично після перезавантаження в кінці налаштування, і тим часом можна й далі користуватися комп’ютером.
setup-protect-keep-safe = Зберігайте цей ключ відновлення в надійному місці, окремо від комп’ютера. Він знадобиться, якщо комп’ютер колись не зможе розблокуватися сам.
setup-protect-passphrase-label = Парольна фраза
setup-protect-repeat = Введіть ще раз
setup-protect-mismatch = Значення не збігаються
setup-protect-kept = Ключ відновлення збережено
setup-protect-background = Шифрування відбуватиметься у фоновому режимі після наступного перезавантаження, і тим часом можна й далі користуватися комп’ютером.
setup-protect-encrypt = Зашифрувати
setup-protect-checking = Перевірка…
setup-protect-start = Зашифрувати мої файли

## Fingerprint

setup-fingerprint-title = Вхід за відбитком пальця
setup-fingerprint-description = Розблоковуйте Luft дотиком замість введення пароля. Інші пальці можна додати пізніше в Параметрах.
setup-fingerprint-which = Який палець?
setup-fingerprint-another = Додати ще один палець?
setup-fingerprint-finger = Палець
setup-fingerprint-no-reader = Сканер відбитків не відповідає. Відбиток можна додати пізніше в Параметрах.
setup-fingerprint-add = Додати відбиток
setup-fingerprint-choose-another = Вибрати інший палець

## Done

setup-ready-title = Усе готово
setup-ready-trust = Щоб завершити, перезавантажте комп’ютер ще раз. Одразу після перезавантаження синій екран запитає, чи довіряти Luft. Скористайтеся там клавіатурою, щоб ввести цей код.
setup-ready-restart = Щоб завершити, перезавантажте комп’ютер ще раз, а потім увійдіть за допомогою пароля.
setup-ready-done = Робочий стіл готовий. Приємної роботи з Luft.
setup-ready-start = Почати роботу з Luft
