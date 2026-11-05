## Messages that some steps share

meet-back = Назад
meet-cancel = Отмена
meet-continue = Продолжить
meet-try-again = Повторить
meet-restart = Перезагрузить
meet-remove = Удалить
meet-keep-it = Оставить
meet-close = Закрыть
meet-restart-title = Перезагрузить сейчас?
meet-not-yet = Не сейчас
meet-iso-use = Использовать имеющийся ISO-образ
meet-iso-using = Используется ваш ISO-образ Luft
meet-nightly = Ночные сборки
meet-channel-nightly = Meet Luft будет использовать ночные сборки
meet-channel-latest = Meet Luft снова будет использовать выпуски
meet-undo = Отменить
meet-logs-saved = Журналы пробного запуска Luft сохранены на рабочем столе
meet-logs-show = Показать
meet-logs-none = Журналов пробного запуска Luft пока нет
meet-logs-failed = Не удалось сохранить журналы пробного запуска Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Не удалось завершить проверку этого компьютера.
   *[windows] Не удалось завершить проверку этого компьютера.
}
problem-room = Не удалось завершить освобождение места для Luft.
problem-room-linux = Не удалось завершить подготовку Luft.
problem-update = Не удалось завершить обновление Luft.
problem-download = Скачивание Luft прервалось. Проверьте подключение к интернету.
problem-pack = Не удалось завершить упаковку ваших вещей.
problem-remove = Не удалось завершить удаление Luft.
problem-restart = Не удалось подготовить перезагрузку.
problem-tidy = Не удалось удалить старые загрузочные записи.
problem-firmware = Не удалось открыть настройки прошивки.
problem-folders = Не удалось просмотреть ваши папки.
problem-sticks = Не удалось найти USB-накопители.
problem-stick = Не удалось завершить создание USB-накопителя.
problem-offer = Сейчас не удаётся скачать Luft. Проверьте подключение к интернету или используйте имеющийся ISO-образ.
problem-luft = Не удалось проверить диск Luft.
problem-resize = Не удалось завершить изменение размера Luft.
problem-cancel = Не удалось отменить изменение.
problem-give = Windows не удалось вернуть себе место.
problem-declined = { $platform ->
    [linux] Meet Luft нужно ваше разрешение на работу с диском. Введите пароль, когда появится запрос.
   *[windows] Meet Luft нужно ваше разрешение на работу с диском. Выберите «Да», когда Windows спросит.
}

## First screen

hello-intro = { $platform ->
    [linux] Попробуйте Luft прямо отсюда, без USB-накопителя. Если понравится, Luft может заменить эту систему и сохранить ваши файлы.
   *[windows] Luft может жить прямо рядом с Windows. Сначала попробуйте его, ничего не устанавливая, а когда будете готовы, возьмите с собой свои вещи.
}
hello-check = { $platform ->
    [linux] Проверить этот компьютер
   *[windows] Проверить этот компьютер
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Проверка этого компьютера
   *[windows] Проверка этого компьютера
}
check-ready-title = { $platform ->
    [linux] Этот компьютер готов к Luft
   *[windows] Этот компьютер готов к Luft
}
check-blocked-title = Почти готово
check-moment = Это займёт немного времени.
check-slow = Windows выясняет, сколько места может освободить. На большом диске это может занять несколько минут.
check-blocked-description = Прежде чем Luft сможет переехать, нужно кое-что изменить. Вот что сделать.
check-found-description = Вот результаты проверки.
check-checking = Проверка диска, прошивки и оборудования…
check-again = Проверить снова
check-action-firmware = Открыть настройки прошивки
check-action-tidy = Убрать
check-firmware-title = Перезагрузиться в настройки прошивки?
check-firmware-description = Сначала сохраните свою работу. Включите там Secure Boot и сохраните изменения, и компьютер запустится как обычно.
check-tidy-title = Удалить старые загрузочные записи?
check-tidy-description = Они указывают только на системы, которых уже нет. Windows и всё остальное будет запускаться так же, как раньше.
check-get-ready-title = Подготовить Luft?
check-get-ready-file = Meet Luft скопирует Luft из вашего ISO-образа в папку на этом компьютере и добавит для него загрузочную запись. Разделы не меняются.
check-get-ready-download = Meet Luft скачает Luft (около { $size }) в папку на этом компьютере и добавит для него загрузочную запись. Разделы не меняются.
check-get-ready-confirm = Подготовить

## Choosing how much of the Windows drive Luft gets

room-title = Сколько места выделить Luft?
room-description = Windows уменьшится, чтобы освободить место для Luft. Ваши файлы в Windows останутся точно там же, где и были.
room-live = Windows оставляет себе место для роста. Luft также откладывает { $size } для запуска и возвращает это место после установки.
room-make = Освободить место
room-confirm-title = Выделить Luft { $size }?
room-confirm-file = Windows уменьшит свой диск, а затем Meet Luft скопирует Luft из вашего ISO-образа. Не отключайте компьютер от питания.
room-confirm-download = Windows уменьшит свой диск, а затем Meet Luft скачает Luft (около { $size }). Не отключайте компьютер от питания и интернета.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Где разместить Luft?
room-places-description = Luft может разделить диск с Windows или занять место, которое Windows не использует.
room-places-label = Места для Luft
room-place-windows = Рядом с Windows
room-place-windows-detail = Windows уменьшится, чтобы освободить место для Luft
room-place-windows-free = Там уже свободно { $size }
room-place-free = Свободное место на диске { $drive }
room-place-free-here = Свободное место на диске Windows
room-place-free-detail = { $size }, которые больше ничем не заняты
room-place-whole = Весь диск { $drive }
room-place-whole-detail = Этот диск ({ $size }) будет стёрт для Luft
room-live-free = Часть места ({ $free }) уже свободна, поэтому Windows отдаёт меньше и оставляет себе место для роста. Luft также откладывает { $size } для запуска и возвращает это место после установки.
room-live-elsewhere = Luft получает там { $room } и дополнительно откладывает { $size } для запуска, а после установки возвращает это место.
room-confirm-free-title = Выделить Luft { $size } свободного места?
room-confirm-free-file = Meet Luft скопирует туда Luft из вашего ISO-образа. Больше ничего на диске не изменится.
room-confirm-free-download = Meet Luft скачает туда Luft (около { $size }). Больше ничего на диске не изменится. Не отключайте компьютер от интернета.
room-erase-title = Стереть диск { $drive }?
room-erase-description = Всё на этом диске ({ $size }) будет удалено сразу, ещё до запуска Luft. Это действие нельзя отменить. Сейчас на нём:
room-erase-empty = Windows не может ничего прочитать на этом диске ({ $size }), но всё, что на нём есть, будет сразу удалено. Это действие нельзя отменить.
room-erase-unnamed = Раздел без имени
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Зашифрован с помощью BitLocker
room-erase-understood = Я понимаю, что часть данных зашифрована с помощью BitLocker и её нельзя будет восстановить
room-erase-confirm = Стереть и освободить место

## Luft is ready on Windows

ready-title = Luft готов
ready-description = Выберите, как с ним познакомиться. Потом Windows будет запускаться как обычно, если вы не установите Luft и не выберете его.
ready-update-title = Получить новейший Luft
ready-update-description = Вышла новая сборка. Она заменит текущую и сохранит выделенное место и всё, что вы упаковали.
ready-try-title = Попробовать Luft
ready-try-description = Перезагрузиться в Luft, ничего не устанавливая. В следующий раз Windows запустится как обычно.
ready-box-description = Упакуйте документы, фото, сети Wi-Fi и не только, чтобы Luft распаковал их после установки.
ready-box-packed = Упаковано, { $size }
ready-install-title = Установить Luft
ready-install-description = Перезагрузиться в программу установки. Место рядом с Windows ({ $size }) уже ждёт.
ready-install-drive-description = Перезагрузиться в программу установки. Место на диске { $drive } ({ $size }) уже ждёт.
ready-stick-description = Запишите Luft на USB-накопитель, чтобы запускать его на любом компьютере.
ready-remove = Удалить Luft с этого компьютера
ready-restart-try = Сначала сохраните свою работу. Luft откроется примерно через минуту, а следующая перезагрузка вернёт вас в Windows.
ready-restart-install = Сначала сохраните свою работу. Программа установки откроется примерно через минуту, и ничего не изменится, пока вы не подтвердите это в ней.
ready-fast-startup-title = Отключить быстрый запуск в Windows
ready-fast-startup-description = Тогда Windows будет выключаться полностью, и звук, Wi-Fi и Bluetooth в Luft будут запускаться с чистого листа.
ready-clock-title = Правильное время в обеих системах
ready-clock-description = Windows будет читать часы компьютера так же, как Luft, и время перестанет скакать при переключении.
ready-remove-title = Удалить Luft с этого компьютера?
ready-remove-description = Meet Luft удалит всё, что было добавлено, включая коробку для переезда, и вернёт Windows всё её место.

## Luft is ready on Linux

linux-ready-description = Выберите, как с ним познакомиться. Пока вы не решите иначе, как обычно будет запускаться { $system }.
linux-ready-this-system = эта система
linux-ready-update-description = Вышла новая сборка. Она заменит ту, что хранит Meet Luft, и сохранит журналы пробного запуска.
linux-ready-try-description = Перезагрузиться в Luft, ничего не меняя. В следующий раз как обычно запустится { $system }.
linux-ready-replace-title = Заменить { $system }
linux-ready-replace-description = Luft займёт её место и сохранит ваши файлы, учётную запись, сети Wi-Fi и другие диски. Старая система останется, пока вы её не удалите.
linux-ready-install-description = Перезагрузиться в программу установки, чтобы установить Luft на другой диск или в свободное место.
linux-ready-remove = Удалить Luft с этого компьютера
linux-ready-restart-try = Сначала сохраните свою работу. Luft откроется примерно через минуту, а следующая перезагрузка вернёт вас в { $system }.
linux-ready-restart-replace = Сначала сохраните свою работу. Программа установки откроется с выбранной для замены системой { $system } и покажет, что останется, прежде чем что-либо изменится.
linux-ready-remove-title = Удалить Luft с этого компьютера?
linux-ready-remove-description = Meet Luft удалит файлы Luft, его загрузочные файлы и загрузочную запись. Всё остальное останется как есть.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Ваш Luft
luft-looking = На этом компьютере найдена система Luft.
luft-checking = Проверка диска Luft…
luft-description-beside = Luft установлен на этом компьютере рядом с Windows.
luft-description-drive = Luft установлен на диске { $drive }.
luft-bar-used = { $size }, занято { $used }
luft-resize-title = Изменить размер Luft
luft-resize-description = Выделите Luft больше места за счёт Windows или верните часть места Windows.
luft-resize-drive-description = Выделите Luft больше свободного места на диске { $drive } или оставьте часть его свободной.
luft-resize-passphrase = Диск Luft открывается только парольной фразой, а во время перемещения Luft не может ввести её сам.
luft-resize-start-first = Запустите Luft один раз, чтобы он сообщил Meet Luft, насколько заполнен, а затем вернитесь сюда.
luft-resize-apart = Между Windows и Luft находится другой раздел, поэтому они не могут делить место.
luft-pending-grow = Luft увеличится при следующем запуске
luft-pending-grow-description = Перезагрузитесь в Luft и не выключайте его несколько минут, пока он занимает новое место. Тем временем им можно пользоваться.
luft-pending-shrink = Luft освободит место при следующем запуске
luft-pending-shrink-description = Перезагрузитесь в Luft и не выключайте его несколько минут, пока он перемещает свои файлы. Затем снова откройте Meet Luft в Windows, чтобы отдать место Windows.
luft-pending-trim = Luft уменьшится при следующем запуске
luft-pending-trim-description = Перезагрузитесь в Luft, и он уменьшится примерно за минуту.
luft-windows-free-title = Отдать свободное место Windows
luft-windows-free-description = Сразу после раздела Windows есть { $size } неиспользуемого места. Windows может забрать его себе.
luft-leftovers-title = Убрать остатки пробного запуска Luft
luft-leftovers-description = Разделы, созданные Meet Luft для запуска Luft, всё ещё на месте. Luft они больше не нужны.
luft-start = Перезагрузиться в Luft
luft-cancel = Отменить изменение
luft-restart = Сначала сохраните свою работу. Luft запустится примерно через минуту, а следующая перезагрузка вернёт вас в Windows.
luft-restart-pending = Сначала сохраните свою работу. Luft запустится примерно через минуту и сам переместит свои файлы, на это уйдёт несколько минут. Тем временем им можно пользоваться.
luft-remove = Удалить Luft с этого компьютера
luft-remove-title = Удалить Luft с этого компьютера?
luft-remove-description = Luft и всё, что в нём есть, будут удалены (всего { $size }), а Windows вернёт себе это место. Компьютер будет запускать Windows, как раньше. Это действие нельзя отменить.
luft-remove-drive-description = Luft и всё, что в нём есть, будут удалены с диска { $drive } (всего { $size }). Компьютер будет запускать Windows, как раньше. Это действие нельзя отменить.
luft-remove-confirm = Удалить Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Сколько места выделить Luft?
resize-description = Перетащите ползунок, чтобы распределить диск между Windows и Luft. Luft сам внесёт изменение при следующем запуске.
resize-measuring = Windows выясняет, сколько места может освободить. На большом диске это может занять несколько минут.
resize-full = Luft слишком заполнен, чтобы его перемещать, а Windows не может освободить для него достаточно места. Сначала освободите место в Luft или в Windows.
resize-drive-description = Перетащите ползунок, чтобы выбрать, сколько места на диске { $drive } займёт Luft. Luft сам внесёт изменение при следующем запуске.
resize-drive-free = Свободно на диске { $drive }: { $size }
resize-used = Файлы Luft занимают { $size }.
resize-least = Измените размер хотя бы на { $size }.
resize-apply = Изменить
resize-grow-title = Выделить Luft ещё { $size }?
resize-grow-description = Windows сразу уменьшится. Luft займёт новое место при следующем запуске, на это уйдёт несколько минут. Не отключайте компьютер от питания.
resize-grow-drive-description = Luft займёт свободное место на диске { $drive } при следующем запуске, на это уйдёт совсем немного времени.
resize-trim-title = Уменьшить Luft на { $size }?
resize-trim-description = Luft уменьшится при следующем запуске, а место на диске { $drive } останется свободным.
resize-shrink-title = Вернуть Windows { $size }?
resize-shrink-description = Luft переместит свои файлы при следующем запуске, на это уйдёт несколько минут. Затем снова откройте Meet Luft, и Windows заберёт место обратно. Не отключайте компьютер от питания.

## Packing things to take along to Luft (the moving box)

box-title = Возьмите свои вещи
box-description = Выберите, что взять с собой. После установки Luft распакует это в вашу новую учётную запись, а из Windows ничего не удалится.
box-looking = Просмотр ваших папок…
box-folder-desktop = Рабочий стол
box-folder-documents = Документы
box-folder-downloads = Загрузки
box-folder-music = Музыка
box-folder-pictures = Изображения
box-folder-videos = Видео
box-folder-size = { $size }, { $files ->
    [one] { $files } файл
    [few] { $files } файла
    [many] { $files } файлов
   *[other] { $files } файла
}
box-wifi-title = Сети Wi-Fi
box-wifi-description = Вместе с паролями, чтобы Luft сразу был в сети
box-bluetooth-title = Устройства Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } устройство, готовое к работе без повторного сопряжения
    [few] { $devices } устройства, готовых к работе без повторного сопряжения
    [many] { $devices } устройств, готовых к работе без повторного сопряжения
   *[other] { $devices } устройства, готового к работе без повторного сопряжения
}
box-wallpaper-title = Обои
box-wallpaper-description = Изображение с вашего рабочего стола Windows
box-account-title = Ваше имя и изображение
box-total-slow = { $size }, упаковка займёт около { $minutes ->
    [one] { $minutes } минуты
    [few] { $minutes } минут
    [many] { $minutes } минут
   *[other] { $minutes } минуты
}
box-pack = Упаковать

## Progress while Meet Luft works

working-shrinking = Освобождение места
    .description = Windows перемещает свои файлы, чтобы освободить место. Это может занять несколько минут.
working-erasing = Стирание диска
    .description = Windows очищает его, чтобы Luft мог занять его целиком.
working-partitioning = Подготовка места для Luft
    .description = Подготовка разделов, с которых запускается Luft.
working-downloading = Перенос Luft
    .description = Luft копируется прямо в свой раздел и проверяется по пути.
working-packing = Упаковка ваших вещей
    .description = Копирование всего, что вы выбрали, в коробку для переезда. Большие папки занимают время.
working-removing = Удаление Luft
    .description = Возврат места системе Windows.
working-removing-linux = Удаление Luft
    .description = Удаление его файлов и загрузочной записи.
working-writing = Создание USB-накопителя
    .description = Luft записывается на весь накопитель. Не отключайте его.
working-copying = Добавление Luft в Ventoy
    .description = Luft копируется рядом с другими ISO-образами на накопителе. Не отключайте его.
working-verifying = Проверка накопителя
    .description = Повторное чтение всех данных, чтобы убедиться, что с него можно загрузиться.
working-stick-downloading = Скачивание Luft
    .description = Он проверяется по пути и сохраняется, так что следующий накопитель будет создан быстрее.
working-progress = { $done } из { $total }
working-keep-open = Не закрывайте это окно.

## After Luft was removed

removed-title = Всё как было
removed-description = { $platform ->
    [linux] Файлы Luft и его загрузочная запись удалены, и компьютер запускается так же, как раньше. Возвращайтесь в любое время.
   *[windows] Разделы Luft и его загрузочная запись удалены, и Windows снова занимает всё своё место. Возвращайтесь в любое время.
}

## Making a USB stick

stick-title = Создать USB-накопитель
stick-description = С него Luft запускается на любом компьютере, чтобы его попробовать или установить.
stick-looking = Поиск USB-накопителей…
stick-none = Подключите USB-накопитель объёмом от { $size }. Он появится здесь.
stick-drives-label = USB-накопители
stick-offer = { $name }, { $size }
stick-make = Создать накопитель
stick-drive-empty = Пустой
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Слишком мал для Luft
stick-ventoy-title = На этом накопителе используется Ventoy
stick-ventoy-description = Добавить на него Luft или стереть весь накопитель и сделать его накопителем Luft?
stick-erase-it = Стереть
stick-add = Добавить Luft
stick-replace-title = Заменить Luft на нём?
stick-replace-description = { $count ->
    [1] { $names } уже есть на этом накопителе. Новый Luft может занять его место.
    [one] { $names } уже есть на этом накопителе. Новый Luft может занять их место.
    [few] { $names } уже есть на этом накопителе. Новый Luft может занять их место.
    [many] { $names } уже есть на этом накопителе. Новый Luft может занять их место.
   *[other] { $names } уже есть на этом накопителе. Новый Luft может занять их место.
}
stick-keep = { $count ->
    [1] Оставить оба
   *[other] Оставить все
}
stick-replace = Заменить
stick-full-title = Для Luft нет места
stick-full-description = Luft нужно { $needed }, а на этом накопителе свободно { $free }. Освободите на нём место или сотрите его и сделайте накопителем Luft.
stick-erase-title = Стереть { $name }?
stick-erase-description = Всё на этом накопителе ({ $size }) будет стёрто и заменено на Luft. Это действие нельзя отменить.
stick-erase-confirm = Стереть и создать накопитель
stick-done-title = Ваш накопитель Luft готов
stick-done-ventoy-title = Luft на вашем накопителе Ventoy
stick-done-take-out = Теперь его можно извлечь.
stick-done-eject = Перед извлечением безопасно отключите его.
stick-done-start = Чтобы загрузиться с него, подключите его и выберите в загрузочном меню компьютера, которое открывается клавишей вроде F12, F8 или Esc сразу после включения.
stick-done-ventoy-key = Если Secure Boot включён, при первом запуске Ventoy один раз попросит зарегистрировать собственный ключ.
stick-done = Готово
stick-done-another = Создать ещё один
