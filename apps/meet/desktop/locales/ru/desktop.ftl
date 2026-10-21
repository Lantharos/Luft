## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-битный процессор Intel или AMD
check-processor-x64-detail = Luft на нём работает.
check-processor-arm = Процессор Arm
check-processor-arm-detail = Пока Luft работает только на процессорах Intel и AMD.
check-processor-32-bit-windows = 32-битная Windows
check-processor-32-bit-system = 32-битная система
check-processor-32-bit-detail = Для Luft нужен 64-битный процессор Intel или AMD.
check-startup-uefi = Загрузка через UEFI
check-startup-uefi-windows = Luft загружается так же современно.
check-startup-uefi-linux = Luft добавит собственную загрузочную запись, а { $system } будет запускаться как сейчас.
check-startup-bios = Загрузка в устаревшем режиме BIOS
check-startup-bios-windows = Для Luft нужен UEFI. Windows может перейти на него с помощью MBR2GPT, после чего UEFI можно включить в настройках прошивки.
check-startup-bios-linux = Для Luft нужен UEFI. Включите его в настройках прошивки вместе с уже установленной системой, а затем проверьте снова.
check-startup-mbr = Диск использует старую таблицу разделов
check-startup-mbr-windows = Для Luft нужен диск GPT. Windows может преобразовать его с помощью MBR2GPT без потери файлов.
check-startup-mbr-linux = Для загрузки Luft нужен диск GPT.
check-startup-no-esp = Нет системного раздела EFI
check-startup-no-esp-detail = Luft добавляет свои загрузочные файлы к тем, что уже лежат на системном разделе EFI, а такого раздела нет.
check-startup-esp-full = Системный раздел EFI заполнен
check-startup-esp-full-detail = Luft нужно там { $size } МБ для загрузочных файлов. Обычно место занимают старые ядра или загрузочные записи.
check-folder-fine = Разделы не меняются
check-folder-fine-detail = Luft хранится в виде файла на вашем диске { $filesystem } и загружается оттуда.
check-folder-encrypted = Ваши файлы на зашифрованном диске
check-folder-encrypted-detail = Luft пока не умеет загружаться с зашифрованного диска. Чтобы попробовать его, используйте USB-накопитель.
check-folder-combined = Ваши файлы занимают больше одного раздела
check-folder-combined-detail = Luft пока не умеет загружаться с LVM или RAID. Чтобы попробовать его, используйте USB-накопитель.
check-folder-filesystem = Luft не умеет загружаться с { $filesystem }
check-folder-filesystem-detail = Он загружается с дисков ext4, btrfs и XFS. Чтобы попробовать его, используйте USB-накопитель.
check-space-free = Свободно { $size } ГБ
check-space-free-linux = Пока вы пробуете Luft, он занимает около { $size } ГБ.
check-space-up-to = До { $size } ГБ для Luft
check-space-up-to-detail = Windows сохраняет свои файлы и место для роста.
check-space-short = Недостаточно свободного места
check-space-short-windows = Luft нужно около { $needed } ГБ, которые может отдать Windows. Освободите в Windows { $missing } ГБ, например с помощью «Очистки диска», а затем проверьте снова.
check-space-short-linux = Для загрузки Luft нужно около { $needed } ГБ. Освободите { $missing } ГБ, а затем проверьте снова.
check-system-replaceable = Luft может занять её место и сохранить ваши файлы, учётную запись и настройки.
check-system-single = Ваши файлы находятся в одном разделе с системой, поэтому заменить её с сохранением файлов пока нельзя. Попробовать и установить Luft можно.
check-system-encrypted = Система зашифрована, поэтому заменить её с сохранением файлов пока нельзя.
check-system-unknown = Её диск размечен так, что Luft пока не может заменить её с сохранением файлов.
check-encryption-off = Windows не зашифрована
check-encryption-off-detail = Приложение «Установить Luft» сможет прочитать её настройки и ваши устройства Bluetooth.
check-encryption-on = Windows зашифрована с помощью BitLocker
check-encryption-on-detail = Это не проблема. Windows сама освободит место, а Meet Luft перенесёт то, что Luft не сможет прочитать с заблокированного диска. На всякий случай держите ключ восстановления под рукой.
check-encryption-changing = BitLocker ещё шифрует или расшифровывает диск
check-encryption-changing-detail = Дождитесь, пока Windows закончит, и возвращайтесь. Ход процесса виден в Параметрах Windows, в разделе «Шифрование устройства».
check-fast-startup-on = Быстрый запуск включён
check-fast-startup-on-detail = Вместо выключения Windows переходит в режим гибернации, и её диск остаётся заблокированным. Meet Luft предложит отключить эту функцию перед установкой.
check-fast-startup-off = Быстрый запуск отключён
check-fast-startup-off-detail = Windows выключается полностью.
check-secure-boot-on = Secure Boot включён
check-secure-boot-on-detail = Его можно не отключать. Luft один раз попросит на синем экране добавить свой ключ.
check-secure-boot-off = Secure Boot отключён
check-secure-boot-off-detail = Luft работает и без него, но он нужен играм с античитом. { $turningOn }
check-secure-boot-restart-into = Meet Luft может перезагрузить компьютер в настройки прошивки, где этот параметр находится в разделе { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft может перезагрузить компьютер в настройки прошивки, где этот параметр обычно находится в разделе Security или Boot.
check-secure-boot-turn-on = Чтобы включить его, перезагрузите компьютер и нажмите { $key }, когда появится логотип { $maker }, а затем перейдите в { $place }.
check-secure-boot-turn-on-anywhere = Чтобы включить его, откройте настройки прошивки при запуске компьютера и поищите в разделе Security или Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, затем Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, затем Secure Boot
check-firmware-place-security-or-advanced = Security или Advanced, затем Secure Boot Configuration
check-firmware-place-security-or-boot = Security или Boot, затем Secure Boot
check-firmware-place-boot = Boot, затем Secure Boot
check-firmware-place-settings = Settings, затем Security, затем Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 на ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 или Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = кнопку увеличения громкости

## More of the computer's hardware

check-tpm-detail = Зашифрованный Luft сможет разблокироваться сам при запуске компьютера.
check-tpm-missing = Нет TPM 2.0
check-tpm-missing-detail = Если зашифровать Luft, он будет запрашивать парольную фразу при каждом запуске.
check-graphics = Графика
check-graphics-detail = Работает сразу.
check-graphics-nvidia = Luft установится с фирменным драйвером NVIDIA.
check-wifi-missing = Нет Wi-Fi
check-wifi-missing-detail = В Luft используйте сетевой кабель или обходитесь без сети.
check-wifi-detail = Работает в Luft.
check-wifi-broadcom = Некоторым чипам Wi-Fi от Broadcom нужен драйвер, которого нет в Luft. Держите под рукой сетевой кабель или телефон для USB-модема.
check-start-entries = { $count ->
    [1] Старая загрузочная запись
    [one] { $count } старая загрузочная запись
    [few] { $count } старые загрузочные записи
    [many] { $count } старых загрузочных записей
   *[other] { $count } старой загрузочной записи
}
check-start-entries-detail = { $count ->
    [1] Запись { $names } указывает на систему, которой уже нет на этом компьютере. Её можно убрать.
    [one] Записи { $names } указывают на системы, которых уже нет на этом компьютере. Их можно убрать.
    [few] Записи { $names } указывают на системы, которых уже нет на этом компьютере. Их можно убрать.
    [many] Записи { $names } указывают на системы, которых уже нет на этом компьютере. Их можно убрать.
   *[other] Записи { $names } указывают на системы, которых уже нет на этом компьютере. Их можно убрать.
}
check-download-unavailable = Сейчас не удаётся скачать Luft
check-download-unavailable-detail = Meet Luft скачивает около 3 ГБ. Проверьте подключение к интернету и повторите проверку или используйте имеющийся ISO-образ Luft.

## Choosing a Luft ISO file

iso-dialog-title = Выберите ISO-образ Luft
iso-dialog-filter = ISO-образ Luft

## Saving the logs from trying Luft

logs-file-name = Журналы Luft { $name }
logs-no-desktop = Не удалось найти ваш рабочий стол
logs-not-saved = Не удалось сохранить журналы пробного запуска Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Помощник Meet Luft не запустился: { $error }
helper-not-allowed = У Meet Luft нет разрешения на работу с диском
helper-stopped = Помощник Meet Luft остановился
helper-stopped-because = Помощник Meet Luft остановился: { $error }
helper-pipe-failed = Не удалось связаться с помощником Meet Luft: { $error }
helper-pipe-hijacked = { $pipe } открыт не помощником Meet Luft, а чем-то другим
helper-record-not-saved = Не удалось записать, что именно создано: { $error }
helper-no-room-yet = Сначала освободите место для Luft.
helper-not-ready-linux = Сначала подготовьте Luft.
helper-not-ready-to-start-windows = Luft ещё не готов к запуску. Сначала освободите для него место.
helper-not-ready-to-start-linux = Luft ещё не готов к запуску. Сначала подготовьте его.
helper-update-unfinished = Не удалось завершить обновление Luft. Сначала обновите его ещё раз.
helper-room-too-small = Luft нужно больше места.
helper-room-shortfall = Windows может отдать { $available } ГБ, а Luft нужно { $needed } ГБ.
helper-box-shortfall = Windows может отдать ещё { $available } ГБ, а выбранным вещам нужно { $needed } ГБ.
helper-bluetooth-unreadable = Не удалось открыть настройки Bluetooth в Windows
helper-registry-not-opened = Не удалось открыть { $key }: { $error }
helper-registry-not-changed = Не удалось изменить { $value }: { $error }
helper-registry-not-saved = Не удалось сохранить { $file }: { $error }
helper-restart-failed = Компьютер не перезагрузился
helper-windows-restart-failed = Windows не перезагрузилась: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Этот компьютер не загружается через UEFI
firmware-variable-unreadable = Не удалось прочитать { $name } из прошивки: { $error }
firmware-variable-not-saved = Не удалось сохранить { $name } в прошивке: { $error }
firmware-entries-full = В прошивке нет места для ещё одной загрузочной записи
firmware-entry-kept = Windows оставила загрузочную запись { $entry }

## Errors about drives and partitions

drive-list-failed = Не удалось получить список дисков: { $error }
drive-of-path-unknown = Не удалось определить, на каком диске находится { $path }
drive-windows-folder-missing = Папка Windows не найдена
drive-windows-drive-missing = Диск Windows не найден
drive-windows-drive-missing-because = Диск Windows не найден: { $error }
drive-windows-partition-missing = Раздел Windows не найден
drive-volume-missing = Том { $path } не найден
drive-storage-error = { $what } (ошибка хранилища Windows { $code })
drive-shrink-size-unknown = Windows не может определить, насколько можно уменьшить её раздел
drive-grow-size-unknown = Windows не может определить, насколько можно увеличить её раздел
drive-resize-failed = Windows не может изменить размер своего раздела
drive-create-failed = Windows не может создать раздел для Luft
drive-hide-failed = Windows не может скрыть новый раздел в Проводнике
drive-format-failed = Windows не может отформатировать новый раздел
drive-remove-failed = Windows не может удалить один из разделов Luft
drive-new-partition-missing = Новый раздел не найден
drive-new-partition-no-volume = У нового раздела нет тома
drive-start-no-guid = У загрузочного раздела нет GUID
drive-live-no-guid = У раздела Luft нет GUID
drive-box-no-guid = У коробки для переезда нет GUID
drive-guid-unreadable = Не удаётся прочитать GUID раздела
drive-not-gpt = Таблица разделов диска не GPT
drive-start-no-volume = У загрузочного раздела нет тома
drive-live-no-volume = У раздела Luft нет тома
drive-new-live-no-volume = У нового раздела Luft нет тома
drive-partitions-not-noted = В записях Meet Luft нет разделов Luft
drive-partitions-gone = Разделы Luft пропали
drive-partition-gone = Раздел пропал
drive-start-partition-foreign = Загрузочный раздел Luft создан не Meet Luft
drive-start-partition-gone = Загрузочный раздел Luft пропал
drive-start-partition-not-listed = Загрузочного раздела Luft нет в таблице разделов
drive-no-esp = На этом компьютере нет системного раздела EFI
drive-esp-full = На системном разделе EFI недостаточно места для загрузочных файлов Luft.
drive-esp-not-opened = Не удалось открыть системный раздел EFI
drive-esp-file-unreadable = Не удаётся прочитать файл { $file } на системном разделе EFI
drive-esp-no-drive = У системного раздела EFI нет диска
drive-esp-no-guid = У системного раздела EFI нет GUID
drive-no-uuid = У диска, на котором хранится Luft, нет UUID
drive-folder-unreadable = Luft не может загрузиться с диска, на котором находятся ваши файлы.
drive-folder-not-startable = С { $folder } нельзя загрузиться

## Errors while getting Luft

live-no-home-folder = Нет домашней папки для хранения Luft
live-no-app-data-folder = Нет локальной папки данных приложений для хранения Luft
live-pointer-unreadable = Не удаётся прочитать новейший Luft
live-not-published = Luft там не опубликован
live-checksum-unreadable = Не удаётся прочитать файл контрольной суммы
live-checksum-not-read = Не удалось прочитать контрольную сумму Luft: { $error }
live-download-damaged = Скачанный файл повредился по пути. Повторите попытку.
live-download-incomplete = В скачанном Luft не хватает { $file }
live-download-not-resumable = Сервер не может продолжить скачивание
live-not-signed = { $iso } не подписан
live-signature-unreadable = Не удаётся прочитать подпись { $iso }
live-signature-wrong-key = { $iso } не подписан компанией Lantharos
live-signature-other-iso = Подпись относится к { $signed }, а не к { $iso }
live-iso-out-of-order = Файлы в ISO-образе расположены в порядке, который Meet Luft не может прочитать
live-iso-not-iso = Это не ISO-образ
live-iso-no-root = В ISO-образе нет корневой папки
live-iso-no-joliet = В ISO-образе нет имён Joliet
live-not-removed = Не удалось удалить { $path }: { $error }

## Errors while making a USB stick

stick-gone = Накопитель больше не подключён. Подключите его снова и выберите ещё раз.
stick-too-small = Luft не помещается на этот накопитель. Используйте накопитель объёмом от 4 ГБ.
stick-damaged = ISO-образ не соответствует своей контрольной сумме. Возможно, он повредился по пути.
stick-read-back-differs = При повторном чтении накопитель вернул не то, что на него записали. Возможно, он изношен, попробуйте другой.
stick-download-unavailable = Сейчас не удаётся скачать Luft: { $error }
stick-download-failed = Не удалось скачать Luft: { $error }
stick-checksum-unreadable = Не удаётся прочитать контрольную сумму ISO-образа: { $error }
stick-file-unreadable = Не удаётся прочитать { $path }: { $error }
stick-iso-unreadable = Не удаётся прочитать ISO-образ: { $error }
stick-iso-no-name = У ISO-образа нет имени
stick-iso-ended-early = ISO-образ преждевременно закончился
stick-iso-already-there = { $name } уже есть на накопителе.
stick-no-room = На накопителе нет места для Luft. Сначала освободите на нём { $size } МБ.
stick-older-not-removed = Не удалось удалить старую версию Luft: { $error }
stick-copy-stopped = Копирование Luft на накопитель прервалось: { $error }
stick-not-opened = Не удалось открыть накопитель: { $error }
stick-write-stopped = Запись на накопитель прервалась: { $error }
stick-not-synced = Накопитель принял не всё: { $error }
stick-read-back-failed = Не удалось повторно прочитать накопитель: { $error }
stick-in-use = Накопитель всё ещё используется: { $error }
stick-device-in-use = { $device } всё ещё используется: { $error }
stick-volume-not-opened = Не удалось открыть том накопителя: { $error }
stick-volume-in-use = Накопитель всё ещё используется. Закройте то, что держит на нём открытые файлы, и повторите попытку ({ $error })
stick-not-dismounted = Windows не может отпустить накопитель: { $error }
stick-not-cleared = Windows не может очистить накопитель: { $error }
stick-not-refreshed = Windows не может заново проверить накопитель: { $error }
stick-not-ventoy = На этом накопителе больше не используется Ventoy.
stick-ventoy-not-opened = Не удалось открыть раздел Ventoy: { $error }
stick-ventoy-not-opened-windows = Windows не может открыть раздел Ventoy
stick-udisks-missing = Чтобы работать с накопителем, Meet Luft нужна служба UDisks: { $error }
