## Messages that some steps share

meet-back = Назад
meet-cancel = Скасувати
meet-continue = Продовжити
meet-try-again = Спробувати ще раз
meet-restart = Перезавантажити
meet-remove = Вилучити
meet-keep-it = Залишити
meet-close = Закрити
meet-restart-title = Перезавантажити зараз?
meet-not-yet = Не зараз
meet-iso-use = Використати наявний ISO-образ
meet-iso-using = Використовується ваш ISO-образ Luft
meet-nightly = Нічні збірки
meet-channel-nightly = Meet Luft використовуватиме нічні збірки
meet-channel-latest = Meet Luft знову використовуватиме випуски
meet-undo = Скасувати
meet-logs-saved = Журнали пробного запуску Luft збережено на робочому столі
meet-logs-show = Показати
meet-logs-none = Журналів пробного запуску Luft ще немає
meet-logs-failed = Не вдалося зберегти журнали пробного запуску Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Не вдалося завершити перевірку цього комп’ютера.
   *[windows] Не вдалося завершити перевірку цього ПК.
}
problem-room = Не вдалося завершити звільнення місця для Luft.
problem-room-linux = Не вдалося завершити підготовку Luft.
problem-update = Не вдалося завершити оновлення Luft.
problem-download = Завантаження Luft зупинилося. Перевірте підключення до інтернету.
problem-pack = Не вдалося завершити пакування ваших речей.
problem-remove = Не вдалося завершити вилучення Luft.
problem-restart = Не вдалося підготувати перезавантаження.
problem-tidy = Не вдалося вилучити старі записи запуску.
problem-firmware = Не вдалося відкрити параметри мікропрограми.
problem-folders = Не вдалося переглянути ваші папки.
problem-sticks = Не вдалося знайти USB-накопичувачі.
problem-stick = Не вдалося завершити створення USB-накопичувача.
problem-offer = Зараз не вдається завантажити Luft. Перевірте підключення до інтернету або використайте наявний ISO-образ.
problem-luft = Не вдалося перевірити диск Luft.
problem-resize = Не вдалося завершити зміну розміру Luft.
problem-cancel = Не вдалося скасувати зміну.
problem-give = Windows не вдалося повернути собі місце.
problem-declined = { $platform ->
    [linux] Meet Luft потрібен ваш дозвіл на роботу з диском. Введіть пароль, коли з’явиться запит.
   *[windows] Meet Luft потрібен ваш дозвіл на роботу з диском. Виберіть «Так», коли Windows запитає.
}

## First screen

hello-intro = { $platform ->
    [linux] Спробуйте Luft просто звідси, без USB-накопичувача. Якщо сподобається, Luft може замінити цю систему й зберегти ваші файли.
   *[windows] Luft може жити просто поруч із Windows. Спершу спробуйте його, нічого не встановлюючи, а коли будете готові, візьміть із собою свої речі.
}
hello-check = { $platform ->
    [linux] Перевірити цей комп’ютер
   *[windows] Перевірити цей ПК
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Перевірка цього комп’ютера
   *[windows] Перевірка цього ПК
}
check-ready-title = { $platform ->
    [linux] Цей комп’ютер готовий до Luft
   *[windows] Цей ПК готовий до Luft
}
check-blocked-title = Майже готово
check-moment = Це займе трохи часу.
check-slow = Windows з’ясовує, скільки місця може звільнити. На великому диску це може тривати кілька хвилин.
check-blocked-description = Перш ніж Luft зможе оселитися, дещо треба змінити. Ось що зробити.
check-found-description = Ось результати перевірки.
check-checking = Перевірка диска, мікропрограми й обладнання…
check-again = Перевірити знову
check-action-firmware = Відкрити параметри мікропрограми
check-action-tidy = Прибрати
check-firmware-title = Перезавантажити в параметри мікропрограми?
check-firmware-description = Спершу збережіть свою роботу. Увімкніть там Secure Boot і збережіть зміни, і комп’ютер запуститься як зазвичай.
check-tidy-title = Вилучити старі записи запуску?
check-tidy-description = Вони вказують лише на системи, яких уже немає. Windows і все інше запускатиметься так само, як раніше.
check-get-ready-title = Підготувати Luft?
check-get-ready-file = Meet Luft скопіює Luft із вашого ISO-образу в папку на цьому комп’ютері й додасть для нього запис запуску. Розділи не змінюються.
check-get-ready-download = Meet Luft завантажить Luft (приблизно { $size }) у папку на цьому комп’ютері й додасть для нього запис запуску. Розділи не змінюються.
check-get-ready-confirm = Підготувати

## Choosing how much of the Windows drive Luft gets

room-title = Скільки місця для Luft?
room-description = Windows зменшиться, щоб звільнити місце для Luft. Ваші файли у Windows залишаться точно там, де вони є.
room-live = Windows залишає собі місце для зростання. Luft також відкладає { $size } для запуску й повертає це місце після встановлення.
room-make = Звільнити місце
room-confirm-title = Виділити Luft { $size }?
room-confirm-file = Windows зменшить свій диск, а потім Meet Luft скопіює Luft із вашого ISO-образу. Не відключайте ПК від живлення.
room-confirm-download = Windows зменшить свій диск, а потім Meet Luft завантажить Luft (приблизно { $size }). Не відключайте ПК від живлення й інтернету.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Де розмістити Luft?
room-places-description = Luft може ділити диск із Windows або зайняти місце, яке Windows не використовує.
room-places-label = Місця для Luft
room-place-windows = Поруч із Windows
room-place-windows-detail = Windows зменшиться, щоб звільнити місце для Luft
room-place-windows-free = Там уже вільно { $size }
room-place-free = Вільне місце на диску { $drive }
room-place-free-here = Вільне місце на диску Windows
room-place-free-detail = { $size }, які більше нічим не зайняті
room-place-whole = Увесь диск { $drive }
room-place-whole-detail = Цей диск ({ $size }) буде стерто для Luft
room-live-free = Частина місця ({ $free }) уже вільна, тож Windows віддає менше й залишає собі місце для зростання. Luft також відкладає { $size } для запуску й повертає це місце після встановлення.
room-live-elsewhere = Luft отримує там { $room } і додатково відкладає { $size } для запуску, а після встановлення повертає це місце.
room-confirm-free-title = Виділити Luft { $size } вільного місця?
room-confirm-free-file = Meet Luft скопіює туди Luft із вашого ISO-образу. Більше нічого на диску не зміниться.
room-confirm-free-download = Meet Luft завантажить туди Luft (приблизно { $size }). Більше нічого на диску не зміниться. Не відключайте ПК від інтернету.
room-erase-title = Стерти диск { $drive }?
room-erase-description = Усе на цьому диску ({ $size }) буде видалено одразу, ще до запуску Luft. Цю дію не можна скасувати. Зараз на ньому:
room-erase-empty = Windows не може нічого прочитати на цьому диску ({ $size }), але все, що на ньому є, буде одразу видалено. Цю дію не можна скасувати.
room-erase-unnamed = Розділ без назви
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Зашифровано за допомогою BitLocker
room-erase-understood = Я розумію, що частину даних зашифровано за допомогою BitLocker і її не можна буде відновити
room-erase-confirm = Стерти й звільнити місце

## Luft is ready on Windows

ready-title = Luft готовий
ready-description = Виберіть, як із ним познайомитися. Потім Windows запускатиметься як зазвичай, якщо ви не встановите Luft і не виберете його.
ready-update-title = Отримати найновіший Luft
ready-update-description = Вийшла новіша збірка. Вона замінить цю й збереже звільнене місце та все, що ви спакували.
ready-try-title = Спробувати Luft
ready-try-description = Перезавантажитися в Luft, нічого не встановлюючи. Наступного разу Windows запуститься як зазвичай.
ready-box-description = Спакуйте документи, фото, мережі Wi-Fi та інше, щоб Luft розпакував їх після встановлення.
ready-box-packed = Спаковано, { $size }
ready-install-title = Встановити Luft
ready-install-description = Перезавантажитися в програму встановлення. Місце поруч із Windows ({ $size }) уже чекає на неї.
ready-install-drive-description = Перезавантажитися в програму встановлення. Місце на диску { $drive } ({ $size }) уже чекає на неї.
ready-stick-description = Запишіть Luft на USB-накопичувач, щоб запускати його на будь-якому комп’ютері.
ready-remove = Вилучити Luft із цього ПК
ready-restart-try = Спершу збережіть свою роботу. Luft відкриється приблизно за хвилину, а наступне перезавантаження поверне вас у Windows.
ready-restart-install = Спершу збережіть свою роботу. Програма встановлення відкриється приблизно за хвилину, і нічого не зміниться, доки ви не підтвердите це в ній.
ready-fast-startup-title = Вимкнути швидкий запуск у Windows
ready-fast-startup-description = Тоді Windows вимикатиметься повністю, тож звук, Wi-Fi і Bluetooth у Luft запускатимуться з чистого аркуша.
ready-clock-title = Правильний годинник в обох системах
ready-clock-description = Windows читатиме годинник комп’ютера так само, як Luft, тож час більше не стрибатиме під час перемикання.
ready-remove-title = Вилучити Luft із цього ПК?
ready-remove-description = Meet Luft видалить усе, що було додано, зокрема коробку для переїзду, і поверне Windows усе її місце.

## Luft is ready on Linux

linux-ready-description = Виберіть, як із ним познайомитися. Доки ви не вирішите інакше, як зазвичай запускатиметься { $system }.
linux-ready-this-system = ця система
linux-ready-update-description = Вийшла новіша збірка. Вона замінить ту, що зберігає Meet Luft, і збереже журнали пробного запуску.
linux-ready-try-description = Перезавантажитися в Luft, нічого не змінюючи. Наступного разу як зазвичай запуститься { $system }.
linux-ready-replace-title = Замінити { $system }
linux-ready-replace-description = Luft займе її місце й збереже ваші файли, обліковий запис, мережі Wi-Fi та інші диски. Стара система залишиться, доки ви її не видалите.
linux-ready-install-description = Перезавантажитися в програму встановлення, щоб установити Luft на інший диск або у вільне місце.
linux-ready-remove = Вилучити Luft із цього комп’ютера
linux-ready-restart-try = Спершу збережіть свою роботу. Luft відкриється приблизно за хвилину, а наступне перезавантаження поверне вас у { $system }.
linux-ready-restart-replace = Спершу збережіть свою роботу. Програма встановлення відкриється з вибраною для заміни системою { $system } і покаже, що залишиться, перш ніж щось зміниться.
linux-ready-remove-title = Вилучити Luft із цього комп’ютера?
linux-ready-remove-description = Meet Luft видалить файли Luft, його файли запуску й запис запуску. Усе інше залишиться як є.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Ваш Luft
luft-looking = На цьому ПК знайдено систему Luft.
luft-checking = Перевірка диска Luft…
luft-description-beside = Luft встановлено на цьому ПК поруч із Windows.
luft-description-drive = Luft встановлено на диску { $drive }.
luft-bar-used = { $size }, зайнято { $used }
luft-resize-title = Змінити розмір Luft
luft-resize-description = Виділіть Luft більше місця за рахунок Windows або поверніть частину місця Windows.
luft-resize-encrypted = Диск Luft зашифровано, тож для його переміщення потрібен ключ відновлення. Спершу вимкніть шифрування пристрою в Параметрах Luft, а потім поверніться.
luft-resize-apart = Між Windows і Luft є інший розділ, тож вони не можуть ділити місце.
luft-resize-unreadable = Не вдалося визначити, наскільки заповнений Luft.
luft-pending-grow = Luft збільшиться під час наступного запуску
luft-pending-grow-description = Перезавантажтеся в Luft і не вимикайте його кілька хвилин, поки він займає нове місце. Тим часом ним можна користуватися.
luft-pending-shrink = Luft звільнить місце під час наступного запуску
luft-pending-shrink-description = Перезавантажтеся в Luft і не вимикайте його кілька хвилин, поки він переміщує свої файли. Потім знову відкрийте Meet Luft у Windows, щоб віддати місце Windows.
luft-windows-free-title = Віддати вільне місце Windows
luft-windows-free-description = Одразу після розділу Windows є { $size } невикористаного місця. Windows може забрати його собі.
luft-leftovers-title = Прибрати залишки пробного запуску Luft
luft-leftovers-description = Розділи, які Meet Luft створив для запуску Luft, досі на місці. Luft вони більше не потрібні.
luft-start = Перезавантажитися в Luft
luft-cancel = Скасувати зміну
luft-restart = Спершу збережіть свою роботу. Luft запуститься приблизно за хвилину, а наступне перезавантаження поверне вас у Windows.
luft-restart-pending = Спершу збережіть свою роботу. Luft запуститься приблизно за хвилину й сам перемістить свої файли, на це піде кілька хвилин. Тим часом ним можна користуватися.
luft-remove = Вилучити Luft із цього ПК
luft-remove-title = Вилучити Luft із цього ПК?
luft-remove-description = Luft і все, що в ньому є, буде видалено (загалом { $size }), а Windows поверне собі це місце. ПК запускатиме Windows, як раніше. Цю дію не можна скасувати.
luft-remove-drive-description = Luft і все, що в ньому є, буде видалено з диска { $drive } (загалом { $size }). ПК запускатиме Windows, як раніше. Цю дію не можна скасувати.
luft-remove-confirm = Вилучити Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Скільки місця для Luft?
resize-description = Перетягніть повзунок, щоб розподілити диск між Windows і Luft. Luft сам внесе зміну під час наступного запуску.
resize-measuring = Windows з’ясовує, скільки місця може звільнити. На великому диску це може тривати кілька хвилин.
resize-full = Luft надто заповнений, щоб його переміщувати, а Windows не може звільнити для нього достатньо місця. Спершу звільніть місце в Luft або у Windows.
resize-used = Файли Luft займають { $size }.
resize-least = Змініть розмір щонайменше на { $size }.
resize-apply = Змінити
resize-grow-title = Виділити Luft ще { $size }?
resize-grow-description = Windows одразу зменшиться. Luft займе нове місце під час наступного запуску, на це піде кілька хвилин. Не відключайте ПК від живлення.
resize-shrink-title = Повернути Windows { $size }?
resize-shrink-description = Luft перемістить свої файли під час наступного запуску, на це піде кілька хвилин. Потім знову відкрийте Meet Luft, і Windows забере місце назад. Не відключайте ПК від живлення.

## Packing things to take along to Luft (the moving box)

box-title = Візьміть свої речі
box-description = Виберіть, що взяти з собою. Після встановлення Luft розпакує це у ваш новий обліковий запис, а з Windows нічого не буде видалено.
box-looking = Перегляд ваших папок…
box-folder-desktop = Робочий стіл
box-folder-documents = Документи
box-folder-downloads = Завантаження
box-folder-music = Музика
box-folder-pictures = Зображення
box-folder-videos = Відео
box-folder-size = { $size }, { $files ->
    [one] { $files } файл
    [few] { $files } файли
    [many] { $files } файлів
   *[other] { $files } файлу
}
box-wifi-title = Мережі Wi-Fi
box-wifi-description = Разом із паролями, тож Luft одразу буде в мережі
box-bluetooth-title = Пристрої Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } пристрій, готовий без повторного створення пари
    [few] { $devices } пристрої, готові без повторного створення пари
    [many] { $devices } пристроїв, готових без повторного створення пари
   *[other] { $devices } пристрою, готового без повторного створення пари
}
box-wallpaper-title = Шпалери
box-wallpaper-description = Зображення з вашого робочого столу Windows
box-account-title = Ваше ім’я та зображення
box-total-slow = { $size }, пакування триватиме приблизно { $minutes ->
    [one] { $minutes } хвилину
    [few] { $minutes } хвилини
    [many] { $minutes } хвилин
   *[other] { $minutes } хвилини
}
box-pack = Спакувати

## Progress while Meet Luft works

working-shrinking = Звільнення місця
    .description = Windows переміщує свої файли, щоб звільнити місце. Це може тривати кілька хвилин.
working-erasing = Стирання диска
    .description = Windows очищує його, щоб Luft міг зайняти його повністю.
working-partitioning = Підготовка місця для Luft
    .description = Підготовка розділів, з яких запускається Luft.
working-downloading = Перенесення Luft
    .description = Luft копіюється просто у свій розділ і перевіряється дорогою.
working-packing = Пакування ваших речей
    .description = Копіювання всього, що ви вибрали, у коробку для переїзду. Великі папки займають час.
working-removing = Вилучення Luft
    .description = Повернення місця системі Windows.
working-removing-linux = Вилучення Luft
    .description = Видалення його файлів і запису запуску.
working-writing = Створення USB-накопичувача
    .description = Luft записується на весь накопичувач. Не від’єднуйте його.
working-copying = Додавання Luft до Ventoy
    .description = Luft копіюється поруч з іншими ISO-образами на накопичувачі. Не від’єднуйте його.
working-verifying = Перевірка накопичувача
    .description = Повторне зчитування всього, щоб переконатися, що з нього можна запуститися.
working-stick-downloading = Завантаження Luft
    .description = Його перевіряють дорогою й зберігають, тож наступний накопичувач буде створено швидше.
working-progress = { $done } з { $total }
working-keep-open = Не закривайте це вікно.

## After Luft was removed

removed-title = Усе як було
removed-description = { $platform ->
    [linux] Файли Luft і його запис запуску видалено, і комп’ютер запускається так само, як раніше. Повертайтеся будь-коли.
   *[windows] Розділи Luft і його запис запуску видалено, і Windows знову має все своє місце. Повертайтеся будь-коли.
}

## Making a USB stick

stick-title = Створити USB-накопичувач
stick-description = З нього Luft запускається на будь-якому комп’ютері, щоб спробувати або встановити систему.
stick-looking = Пошук USB-накопичувачів…
stick-none = Під’єднайте USB-накопичувач обсягом від { $size }. Він з’явиться тут.
stick-drives-label = USB-накопичувачі
stick-offer = { $name }, { $size }
stick-make = Створити накопичувач
stick-drive-empty = Порожній
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Замалий для Luft
stick-ventoy-title = Цей накопичувач використовує Ventoy
stick-ventoy-description = Додати на нього Luft чи стерти весь накопичувач і зробити його накопичувачем Luft?
stick-erase-it = Стерти
stick-add = Додати Luft
stick-replace-title = Замінити Luft на ньому?
stick-replace-description = { $count ->
    [1] { $names } вже є на цьому накопичувачі. Новий Luft може зайняти його місце.
    [one] { $names } вже є на цьому накопичувачі. Новий Luft може зайняти їхнє місце.
    [few] { $names } вже є на цьому накопичувачі. Новий Luft може зайняти їхнє місце.
    [many] { $names } вже є на цьому накопичувачі. Новий Luft може зайняти їхнє місце.
   *[other] { $names } вже є на цьому накопичувачі. Новий Luft може зайняти їхнє місце.
}
stick-keep = { $count ->
    [1] Залишити обидва
   *[other] Залишити всі
}
stick-replace = Замінити
stick-full-title = Для Luft немає місця
stick-full-description = Luft потрібно { $needed }, а на цьому накопичувачі вільно { $free }. Звільніть на ньому місце або зітріть його й зробіть накопичувачем Luft.
stick-erase-title = Стерти { $name }?
stick-erase-description = Усе на цьому накопичувачі ({ $size }) буде стерто й замінено на Luft. Цю дію не можна скасувати.
stick-erase-confirm = Стерти й створити накопичувач
stick-done-title = Ваш накопичувач Luft готовий
stick-done-ventoy-title = Luft на вашому накопичувачі Ventoy
stick-done-take-out = Тепер його можна вийняти.
stick-done-eject = Перш ніж вийняти, безпечно від’єднайте його.
stick-done-start = Щоб запуститися з нього, під’єднайте його й виберіть у меню завантаження комп’ютера, яке відкривається клавішею F12, F8, Esc або подібною одразу після ввімкнення.
stick-done-ventoy-key = Якщо Secure Boot увімкнено, під час першого запуску Ventoy один раз попросить зареєструвати власний ключ.
stick-done = Готово
stick-done-another = Створити ще один
