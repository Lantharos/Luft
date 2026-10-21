## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-розрядний процесор Intel або AMD
check-processor-x64-detail = Luft на ньому працює.
check-processor-arm = Процесор Arm
check-processor-arm-detail = Поки що Luft працює лише на процесорах Intel і AMD.
check-processor-32-bit-windows = 32-розрядна Windows
check-processor-32-bit-system = 32-розрядна система
check-processor-32-bit-detail = Для Luft потрібен 64-розрядний процесор Intel або AMD.
check-startup-uefi = Запуск через UEFI
check-startup-uefi-windows = Luft запускається так само сучасно.
check-startup-uefi-linux = Luft додасть власний запис запуску, а { $system } і далі запускатиметься як зараз.
check-startup-bios = Запуск у застарілому режимі BIOS
check-startup-bios-windows = Для Luft потрібен UEFI. Windows може перейти на нього за допомогою MBR2GPT, після чого UEFI можна ввімкнути в параметрах мікропрограми.
check-startup-bios-linux = Для Luft потрібен UEFI. Увімкніть його в параметрах мікропрограми разом із наявною системою, а потім перевірте знову.
check-startup-mbr = Диск використовує стару таблицю розділів
check-startup-mbr-windows = Для Luft потрібен диск GPT. Windows може перетворити його за допомогою MBR2GPT без втрати файлів.
check-startup-mbr-linux = Для запуску Luft потрібен диск GPT.
check-startup-no-esp = Немає системного розділу EFI
check-startup-no-esp-detail = Luft додає свої файли запуску до тих, що вже є на системному розділі EFI, а такого розділу немає.
check-startup-esp-full = Системний розділ EFI заповнено
check-startup-esp-full-detail = Luft потрібно там { $size } МБ для файлів запуску. Зазвичай місце займають старі ядра або записи запуску.
check-folder-fine = Розділи не змінюються
check-folder-fine-detail = Luft зберігається як файл на вашому диску { $filesystem } і запускається звідти.
check-folder-encrypted = Ваші файли на зашифрованому диску
check-folder-encrypted-detail = Luft поки що не може запускатися із зашифрованого диска. Щоб спробувати його, скористайтеся USB-накопичувачем.
check-folder-combined = Ваші файли займають більше ніж один розділ
check-folder-combined-detail = Luft поки що не може запускатися з LVM або RAID. Щоб спробувати його, скористайтеся USB-накопичувачем.
check-folder-filesystem = Luft не може запускатися з { $filesystem }
check-folder-filesystem-detail = Він запускається з дисків ext4, btrfs і XFS. Щоб спробувати його, скористайтеся USB-накопичувачем.
check-space-free = Вільно { $size } ГБ
check-space-free-linux = Поки ви пробуєте Luft, він займає приблизно { $size } ГБ.
check-space-up-to = До { $size } ГБ для Luft
check-space-up-to-detail = Windows зберігає свої файли й місце для зростання.
check-space-short = Недостатньо вільного місця
check-space-short-windows = Luft потрібно приблизно { $needed } ГБ, які може віддати Windows. Звільніть у Windows { $missing } ГБ, наприклад за допомогою «Очищення диска», а потім перевірте знову.
check-space-short-linux = Для запуску Luft потрібно приблизно { $needed } ГБ. Звільніть { $missing } ГБ, а потім перевірте знову.
check-system-replaceable = Luft може зайняти її місце й зберегти ваші файли, обліковий запис і параметри.
check-system-single = Ваші файли зберігаються на одному розділі із системою, тому заміна зі збереженням файлів поки що не підтримується. Спробувати й установити Luft можна.
check-system-encrypted = Систему зашифровано, тому заміна зі збереженням файлів поки що не підтримується.
check-system-unknown = Її диск розмічено так, що Luft поки не може замінити її зі збереженням файлів.
check-encryption-off = Windows не зашифровано
check-encryption-off-detail = Програма «Встановлення Luft» зможе прочитати її параметри та ваші пристрої Bluetooth.
check-encryption-on = Windows зашифровано за допомогою BitLocker
check-encryption-on-detail = Це не проблема. Windows сама звільнить місце, а Meet Luft перенесе те, чого Luft не зможе прочитати із заблокованого диска. Про всяк випадок тримайте ключ відновлення під рукою.
check-encryption-changing = BitLocker ще шифрує або розшифровує диск
check-encryption-changing-detail = Зачекайте, доки Windows завершить, а потім поверніться. Перебіг можна побачити в Параметрах, у розділі «Шифрування пристрою».
check-fast-startup-on = Швидкий запуск увімкнено
check-fast-startup-on-detail = Windows переходить у режим глибокого сну замість вимкнення, тому її диск залишається заблокованим. Meet Luft запропонує вимкнути цю функцію перед встановленням.
check-fast-startup-off = Швидкий запуск вимкнено
check-fast-startup-off-detail = Windows вимикається повністю.
check-secure-boot-on = Secure Boot увімкнено
check-secure-boot-on-detail = Його можна не вимикати. Luft один раз попросить на синьому екрані додати свій ключ.
check-secure-boot-off = Secure Boot вимкнено
check-secure-boot-off-detail = Luft працює й без нього, але він потрібен іграм з античитом. { $turningOn }
check-secure-boot-restart-into = Meet Luft може перезавантажити комп’ютер у параметри мікропрограми, де цей параметр розташовано в { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft може перезавантажити комп’ютер у параметри мікропрограми, де цей параметр зазвичай розташовано в Security або Boot.
check-secure-boot-turn-on = Щоб увімкнути його, перезавантажте комп’ютер і натисніть { $key }, коли з’явиться логотип { $maker }, а потім перейдіть до { $place }.
check-secure-boot-turn-on-anywhere = Щоб увімкнути його, відкрийте параметри мікропрограми під час запуску комп’ютера й пошукайте в Security або Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, потім Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, потім Secure Boot
check-firmware-place-security-or-advanced = Security або Advanced, потім Secure Boot Configuration
check-firmware-place-security-or-boot = Security або Boot, потім Secure Boot
check-firmware-place-boot = Boot, потім Secure Boot
check-firmware-place-settings = Settings, потім Security, потім Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 на ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 або Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = кнопку збільшення гучності

## More of the computer's hardware

check-tpm-detail = Зашифрований Luft може розблоковуватися сам під час запуску комп’ютера.
check-tpm-missing = Немає TPM 2.0
check-tpm-missing-detail = Якщо зашифрувати Luft, він запитуватиме парольну фразу під час кожного запуску.
check-graphics = Графіка
check-graphics-detail = Працює одразу.
check-graphics-nvidia = Luft установиться з фірмовим драйвером NVIDIA.
check-wifi-missing = Немає Wi-Fi
check-wifi-missing-detail = У Luft використовуйте мережевий кабель або обходьтеся без мережі.
check-wifi-detail = Працює в Luft.
check-wifi-broadcom = Деяким мікросхемам Wi-Fi від Broadcom потрібен драйвер, якого немає в Luft. Тримайте під рукою мережевий кабель або телефон для USB-модему.
check-start-entries = { $count ->
    [1] Старий запис запуску
    [one] { $count } старий запис запуску
    [few] { $count } старі записи запуску
    [many] { $count } старих записів запуску
   *[other] { $count } старого запису запуску
}
check-start-entries-detail = { $count ->
    [1] Запис { $names } вказує на систему, якої вже немає на цьому ПК. Його можна прибрати.
    [one] Записи { $names } вказують на системи, яких уже немає на цьому ПК. Їх можна прибрати.
    [few] Записи { $names } вказують на системи, яких уже немає на цьому ПК. Їх можна прибрати.
    [many] Записи { $names } вказують на системи, яких уже немає на цьому ПК. Їх можна прибрати.
   *[other] Записи { $names } вказують на системи, яких уже немає на цьому ПК. Їх можна прибрати.
}
check-download-unavailable = Зараз не вдається завантажити Luft
check-download-unavailable-detail = Meet Luft завантажує приблизно 3 ГБ. Перевірте підключення до інтернету й повторіть перевірку або використайте наявний ISO-образ Luft.

## Choosing a Luft ISO file

iso-dialog-title = Виберіть ISO-образ Luft
iso-dialog-filter = ISO-образ Luft

## Saving the logs from trying Luft

logs-file-name = Журнали Luft { $name }
logs-no-desktop = Не вдалося знайти ваш робочий стіл
logs-not-saved = Не вдалося зберегти журнали пробного запуску Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Помічник Meet Luft не запустився: { $error }
helper-not-allowed = Meet Luft не має дозволу на роботу з диском
helper-stopped = Помічник Meet Luft зупинився
helper-stopped-because = Помічник Meet Luft зупинився: { $error }
helper-pipe-failed = Не вдалося зв’язатися з помічником Meet Luft: { $error }
helper-pipe-hijacked = { $pipe } відкрито не помічником Meet Luft, а чимось іншим
helper-record-not-saved = Не вдалося записати, що саме створено: { $error }
helper-no-room-yet = Спершу звільніть місце для Luft.
helper-not-ready-linux = Спершу підготуйте Luft.
helper-not-ready-to-start-windows = Luft ще не готовий до запуску. Спершу звільніть для нього місце.
helper-not-ready-to-start-linux = Luft ще не готовий до запуску. Спершу підготуйте його.
helper-update-unfinished = Не вдалося завершити оновлення Luft. Спершу оновіть його ще раз.
helper-room-too-small = Luft потрібно більше місця.
helper-room-shortfall = Windows може віддати { $available } ГБ, а Luft потрібно { $needed } ГБ.
helper-box-shortfall = Windows може віддати ще { $available } ГБ, а вибраним речам потрібно { $needed } ГБ.
helper-bluetooth-unreadable = Не вдалося відкрити параметри Bluetooth у Windows
helper-registry-not-opened = Не вдалося відкрити { $key }: { $error }
helper-registry-not-changed = Не вдалося змінити { $value }: { $error }
helper-registry-not-saved = Не вдалося зберегти { $file }: { $error }
helper-restart-failed = Комп’ютер не перезавантажився
helper-windows-restart-failed = Windows не перезавантажилася: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Цей ПК не запускається через UEFI
firmware-variable-unreadable = Не вдалося прочитати { $name } з мікропрограми: { $error }
firmware-variable-not-saved = Не вдалося зберегти { $name } у мікропрограмі: { $error }
firmware-entries-full = У мікропрограмі немає місця для ще одного запису запуску
firmware-entry-kept = Windows залишила запис запуску { $entry }

## Errors about drives and partitions

drive-list-failed = Не вдалося отримати список дисків: { $error }
drive-of-path-unknown = Не вдалося визначити, на якому диску розташовано { $path }
drive-windows-folder-missing = Папку Windows не знайдено
drive-windows-drive-missing = Диск Windows не знайдено
drive-windows-drive-missing-because = Диск Windows не знайдено: { $error }
drive-windows-partition-missing = Розділ Windows не знайдено
drive-volume-missing = Том { $path } не знайдено
drive-storage-error = { $what } (помилка сховища Windows { $code })
drive-shrink-size-unknown = Windows не може визначити, наскільки можна зменшити її розділ
drive-grow-size-unknown = Windows не може визначити, наскільки можна збільшити її розділ
drive-resize-failed = Windows не може змінити розмір свого розділу
drive-create-failed = Windows не може створити розділ для Luft
drive-hide-failed = Windows не може приховати новий розділ у Провіднику файлів
drive-format-failed = Windows не може відформатувати новий розділ
drive-remove-failed = Windows не може видалити один із розділів Luft
drive-new-partition-missing = Новий розділ не знайдено
drive-new-partition-no-volume = У нового розділу немає тому
drive-start-no-guid = У розділу запуску немає GUID
drive-live-no-guid = У розділу Luft немає GUID
drive-box-no-guid = У коробки для переїзду немає GUID
drive-guid-unreadable = Не вдається прочитати GUID розділу
drive-not-gpt = Таблиця розділів диска не GPT
drive-start-no-volume = У розділу запуску немає тому
drive-live-no-volume = У розділу Luft немає тому
drive-new-live-no-volume = У нового розділу Luft немає тому
drive-partitions-not-noted = У записах Meet Luft немає розділів Luft
drive-partitions-gone = Розділи Luft зникли
drive-partition-gone = Розділ зник
drive-start-partition-foreign = Розділ запуску Luft створено не за допомогою Meet Luft
drive-start-partition-gone = Розділ запуску Luft зник
drive-start-partition-not-listed = Розділу запуску Luft немає в таблиці розділів
drive-no-esp = На цьому комп’ютері немає системного розділу EFI
drive-esp-full = На системному розділі EFI замало місця для файлів запуску Luft.
drive-esp-not-opened = Не вдалося відкрити системний розділ EFI
drive-esp-file-unreadable = Не вдається прочитати файл { $file } на системному розділі EFI
drive-esp-no-drive = У системного розділу EFI немає диска
drive-esp-no-guid = У системного розділу EFI немає GUID
drive-no-uuid = У диска, на якому зберігається Luft, немає UUID
drive-folder-unreadable = Luft не може запуститися з диска, на якому зберігаються ваші файли.
drive-folder-not-startable = З { $folder } не можна запуститися

## Errors while getting Luft

live-no-home-folder = Немає домашньої папки, щоб зберігати Luft
live-no-app-data-folder = Немає локальної папки даних програм, щоб зберігати Luft
live-pointer-unreadable = Не вдається прочитати найновіший Luft
live-not-published = Luft там не опубліковано
live-checksum-unreadable = Не вдається прочитати файл контрольної суми
live-checksum-not-read = Не вдалося прочитати контрольну суму Luft: { $error }
live-download-damaged = Завантажений файл пошкодився дорогою. Спробуйте ще раз.
live-download-incomplete = У завантаженому Luft бракує { $file }
live-download-not-resumable = Сервер не може продовжити завантаження
live-not-signed = { $iso } не підписано
live-signature-unreadable = Не вдається прочитати підпис { $iso }
live-signature-wrong-key = { $iso } не підписано компанією Lantharos
live-signature-other-iso = Підпис належить до { $signed }, а не до { $iso }
live-iso-out-of-order = Файли в ISO-образі розташовано в порядку, який Meet Luft не може прочитати
live-iso-not-iso = Це не ISO-образ
live-iso-no-root = В ISO-образі немає кореневої папки
live-iso-no-joliet = В ISO-образі немає імен Joliet
live-not-removed = Не вдалося видалити { $path }: { $error }

## Errors while making a USB stick

stick-gone = Накопичувача більше немає. Під’єднайте його знову й виберіть ще раз.
stick-too-small = Luft не вміщується на цей накопичувач. Використайте накопичувач обсягом від 4 ГБ.
stick-damaged = ISO-образ не відповідає своїй контрольній сумі. Можливо, він пошкодився дорогою.
stick-read-back-differs = Під час повторного зчитування накопичувач повернув не те, що на нього записали. Можливо, він зношений, тож спробуйте інший.
stick-download-unavailable = Зараз не вдається завантажити Luft: { $error }
stick-download-failed = Не вдалося завантажити Luft: { $error }
stick-checksum-unreadable = Не вдається прочитати контрольну суму ISO-образу: { $error }
stick-file-unreadable = Не вдається прочитати { $path }: { $error }
stick-iso-unreadable = Не вдається прочитати ISO-образ: { $error }
stick-iso-no-name = У ISO-образу немає назви
stick-iso-ended-early = ISO-образ передчасно закінчився
stick-iso-already-there = { $name } вже є на накопичувачі.
stick-no-room = На накопичувачі немає місця для Luft. Спершу звільніть на ньому { $size } МБ.
stick-older-not-removed = Не вдалося видалити старішу версію Luft: { $error }
stick-copy-stopped = Копіювання Luft на накопичувач зупинилося: { $error }
stick-not-opened = Не вдалося відкрити накопичувач: { $error }
stick-write-stopped = Запис на накопичувач зупинився: { $error }
stick-not-synced = Накопичувач прийняв не все: { $error }
stick-read-back-failed = Не вдалося повторно прочитати накопичувач: { $error }
stick-in-use = Накопичувач досі використовується: { $error }
stick-device-in-use = { $device } досі використовується: { $error }
stick-volume-not-opened = Не вдалося відкрити том накопичувача: { $error }
stick-volume-in-use = Накопичувач досі використовується. Закрийте те, що відкрило на ньому файли, і спробуйте ще раз ({ $error })
stick-not-dismounted = Windows не може відпустити накопичувач: { $error }
stick-not-cleared = Windows не може очистити накопичувач: { $error }
stick-not-refreshed = Windows не може повторно перевірити накопичувач: { $error }
stick-not-ventoy = Цей накопичувач більше не використовує Ventoy.
stick-ventoy-not-opened = Не вдалося відкрити розділ Ventoy: { $error }
stick-ventoy-not-opened-windows = Windows не може відкрити розділ Ventoy
stick-udisks-missing = Щоб працювати з накопичувачем, Meet Luft потрібна служба UDisks: { $error }
