## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-битов процесор Intel или AMD
check-processor-x64-detail = Luft работи на него.
check-processor-arm = Процесор Arm
check-processor-arm-detail = Засега Luft работи само на процесори Intel и AMD.
check-processor-32-bit-windows = 32-битов Windows
check-processor-32-bit-system = 32-битова система
check-processor-32-bit-detail = Luft се нуждае от 64-битов процесор Intel или AMD.
check-startup-uefi = Стартира с UEFI
check-startup-uefi-windows = Luft стартира по същия съвременен начин.
check-startup-uefi-linux = Luft добавя свой запис за стартиране, а { $system } продължава да стартира както досега.
check-startup-bios = Стартира в стар режим BIOS
check-startup-bios-windows = Luft се нуждае от UEFI. Windows може да премине с MBR2GPT, след което UEFI може да се включи в настройките на фърмуера.
check-startup-bios-linux = Luft се нуждае от UEFI. Включете го в настройките на фърмуера, заедно със системата, която вече е тук, и проверете отново.
check-startup-mbr = Дискът използва стара таблица на дяловете
check-startup-mbr-windows = Luft се нуждае от GPT диск. Windows може да го преобразува с MBR2GPT, без да се губят файлове.
check-startup-mbr-linux = Luft се нуждае от GPT диск, от който да стартира.
check-startup-no-esp = Няма системен дял EFI
check-startup-no-esp-detail = Luft добавя стартовите си файлове до тези, които вече са на системния дял EFI, а такъв няма.
check-startup-esp-full = Системният дял EFI е пълен
check-startup-esp-full-detail = Luft се нуждае от { $size } МБ там за стартовите си файлове. Обикновено мястото е заето от стари ядра или записи за стартиране.
check-folder-fine = Дяловете не се променят
check-folder-fine-detail = Luft се пази като файл на диска ви с { $filesystem } и стартира оттам.
check-folder-encrypted = Файловете ви са на шифрован диск
check-folder-encrypted-detail = Luft все още не може да стартира от шифрован диск. Вместо това го пробвайте от USB флашка.
check-folder-combined = Файловете ви са разпределени в повече от един дял
check-folder-combined-detail = Luft все още не може да стартира от LVM или RAID. Вместо това го пробвайте от USB флашка.
check-folder-filesystem = Luft не може да стартира от { $filesystem }
check-folder-filesystem-detail = Стартира от дискове с ext4, btrfs и XFS. Вместо това го пробвайте от USB флашка.
check-space-free = { $size } ГБ свободни
check-space-free-linux = Luft заема около { $size } ГБ, докато го пробвате.
check-space-up-to = До { $size } ГБ за Luft
check-space-up-to-detail = Windows запазва файловете си и място, за да расте.
check-space-short = Няма достатъчно свободно място
check-space-short-windows = Luft се нуждае от около { $needed } ГБ, които Windows може да отдели. Освободете { $missing } ГБ в Windows, например с Почистване на диска, и проверете отново.
check-space-short-linux = Luft се нуждае от около { $needed } ГБ, от които да стартира. Освободете { $missing } ГБ и проверете отново.
check-system-replaceable = Luft може да заеме мястото ѝ и да запази файловете, акаунта и настройките ви.
check-system-single = Файловете ви са на един дял със системата, затова замяната ѝ със запазване на файловете все още не се поддържа. Пробването и инсталирането на Luft работят.
check-system-encrypted = Шифрована е, затова замяната ѝ със запазване на файловете ви все още не се поддържа.
check-system-unknown = Дискът ѝ е разделен по начин, който Luft все още не може да замени, като запази файловете ви.
check-encryption-off = Windows не е шифрован
check-encryption-off-detail = Инсталиране на Luft може да прочете настройките му и устройствата ви Bluetooth.
check-encryption-on = Windows е шифрован с BitLocker
check-encryption-on-detail = Това не е проблем. Windows освобождава мястото сам, а Meet Luft пренася това, което Luft не може да прочете от заключен диск. Дръжте ключа за възстановяване под ръка, за всеки случай.
check-encryption-changing = BitLocker все още шифрова или дешифрова
check-encryption-changing-detail = Изчакайте Windows да приключи и се върнете. Докъде е стигнал, можете да видите в Настройки, в Шифроване на устройството.
check-fast-startup-on = Бързо стартиране е включено
check-fast-startup-on-detail = Windows преминава в хибернация, вместо да се изключи, а това държи диска му заключен. Meet Luft предлага да го изключи преди инсталирането.
check-fast-startup-off = Бързо стартиране е изключено
check-fast-startup-off-detail = Windows се изключва напълно.
check-secure-boot-on = Secure Boot е включен
check-secure-boot-on-detail = Може да остане включен. Luft пита веднъж, на син екран, дали да добави ключа си.
check-secure-boot-off = Secure Boot е изключен
check-secure-boot-off-detail = Luft работи и без него, но игрите със защита срещу измами се нуждаят от него. { $turningOn }
check-secure-boot-restart-into = Meet Luft може да рестартира в настройките на фърмуера, където той е в { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft може да рестартира в настройките на фърмуера, където той обикновено е в Security или Boot.
check-secure-boot-turn-on = За да го включите, рестартирайте и натиснете { $key }, когато се появи логото на { $maker }, след което отидете в { $place }.
check-secure-boot-turn-on-anywhere = За да го включите, отворете настройките на фърмуера, докато компютърът стартира, и потърсете в Security или Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, след това Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, след това Secure Boot
check-firmware-place-security-or-advanced = Security или Advanced, след това Secure Boot Configuration
check-firmware-place-security-or-boot = Security или Boot, след това Secure Boot
check-firmware-place-boot = Boot, след това Secure Boot
check-firmware-place-settings = Settings, след това Security, след това Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 на ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 или Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = бутона за увеличаване на звука

## More of the computer's hardware

check-tpm-detail = Шифрован Luft може да се отключва сам при стартиране на компютъра.
check-tpm-missing = Няма TPM 2.0
check-tpm-missing-detail = Ако шифровате Luft, той ще иска парола за диска при всяко стартиране.
check-graphics = Графика
check-graphics-detail = Работи веднага.
check-graphics-nvidia = Luft се инсталира със собствения драйвер на NVIDIA.
check-wifi-missing = Няма Wi-Fi
check-wifi-missing-detail = Използвайте мрежов кабел в Luft или минете без мрежа.
check-wifi-detail = Работи в Luft.
check-wifi-broadcom = Някои Wi-Fi чипове на Broadcom се нуждаят от драйвер, който Luft не включва. Дръжте под ръка мрежов кабел или телефон за споделяне на интернет през USB.
check-start-entries = { $count ->
    [one] Стар запис за стартиране
   *[other] { $count } стари записа за стартиране
}
check-start-entries-detail = { $count ->
    [one] { $names } сочи към система, която вече не е на този компютър. Може да бъде разчистен.
   *[other] { $names } сочат към системи, които вече не са на този компютър. Могат да бъдат разчистени.
}
check-download-unavailable = В момента Luft не може да бъде изтеглен
check-download-unavailable-detail = Meet Luft изтегля около 3 ГБ. Проверете дали сте свързани с интернет и проверете отново или използвайте наличен ISO образ на Luft.

## Choosing a Luft ISO file

iso-dialog-title = Избор на ISO образ на Luft
iso-dialog-filter = ISO образ на Luft

## Saving the logs from trying Luft

logs-file-name = Журнали на Luft { $name }
logs-no-desktop = Meet Luft не намери работния ви плот
logs-not-saved = Meet Luft не можа да запази журналите от пробването на Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Помощната програма на Meet Luft не стартира: { $error }
helper-not-allowed = Meet Luft не получи разрешение да работи с диска
helper-stopped = Помощната програма на Meet Luft спря
helper-stopped-because = Помощната програма на Meet Luft спря: { $error }
helper-pipe-failed = Meet Luft не можа да се свърже с помощната си програма: { $error }
helper-pipe-hijacked = Нещо различно от помощната програма на Meet Luft отвори { $pipe }
helper-record-not-saved = Meet Luft не можа да отбележи какво е създал: { $error }
helper-no-room-yet = Първо освободете място за Luft.
helper-not-ready-linux = Първо подгответе Luft.
helper-not-ready-to-start-windows = Luft все още не е готов за стартиране. Първо освободете място за него.
helper-not-ready-to-start-linux = Luft все още не е готов за стартиране. Първо го подгответе.
helper-update-unfinished = Актуализирането на Luft не завърши. Първо го актуализирайте отново.
helper-room-too-small = Luft се нуждае от повече място.
helper-room-shortfall = Windows може да отдели { $available } ГБ, а Luft се нуждае от { $needed } ГБ.
helper-box-shortfall = Windows може да отдели още { $available } ГБ, а за избраното са нужни { $needed } ГБ.
helper-bluetooth-unreadable = Настройките на Bluetooth в Windows не можаха да бъдат отворени
helper-registry-not-opened = Ключът { $key } не можа да бъде отворен: { $error }
helper-registry-not-changed = Стойността { $value } не можа да бъде променена: { $error }
helper-registry-not-saved = Файлът { $file } не можа да бъде запазен: { $error }
helper-restart-failed = Компютърът не се рестартира
helper-windows-restart-failed = Windows не се рестартира: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Този компютър не стартира с UEFI
firmware-variable-unreadable = Променливата { $name } не можа да бъде прочетена от фърмуера: { $error }
firmware-variable-not-saved = Променливата { $name } не можа да бъде запазена във фърмуера: { $error }
firmware-entries-full = Във фърмуера няма място за още един запис за стартиране
firmware-entry-kept = Windows запази записа за стартиране { $entry }

## Errors about drives and partitions

drive-list-failed = Дисковете не можаха да бъдат изброени: { $error }
drive-of-path-unknown = Не може да се определи на кой диск е { $path }
drive-windows-folder-missing = Папката на Windows не е намерена
drive-windows-drive-missing = Дискът на Windows не е намерен
drive-windows-drive-missing-because = Дискът на Windows не е намерен: { $error }
drive-windows-partition-missing = Дялът на Windows не е намерен
drive-volume-missing = Томът { $path } не е намерен
drive-storage-error = { $what } (грешка на хранилището на Windows { $code })
drive-shrink-size-unknown = Windows не можа да определи доколко може да се смали дялът му
drive-grow-size-unknown = Windows не можа да определи доколко може да се увеличи дялът му
drive-resize-failed = Windows не можа да промени размера на дяла си
drive-create-failed = Windows не можа да създаде дял за Luft
drive-hide-failed = Windows не можа да скрие новия дял от Explorer
drive-format-failed = Windows не можа да форматира новия дял
drive-remove-failed = Windows не можа да премахне един от дяловете на Luft
drive-new-partition-missing = Новият дял не е намерен
drive-new-partition-no-volume = Новият дял няма том
drive-start-no-guid = Стартовият дял няма GUID
drive-live-no-guid = Дялът, от който стартира Luft, няма GUID
drive-box-no-guid = Кашонът за преместване няма GUID
drive-guid-unreadable = GUID на дяла не може да бъде прочетен
drive-not-gpt = Таблицата на дяловете на диска не е GPT
drive-start-no-volume = Стартовият дял няма том
drive-live-no-volume = Дялът на Luft няма том
drive-new-live-no-volume = Новият дял на Luft няма том
drive-partitions-not-noted = Дяловете на Luft липсват в записките на Meet Luft
drive-partitions-gone = Дяловете на Luft изчезнаха
drive-partition-gone = Един дял изчезна
drive-start-partition-foreign = Стартовият дял на Luft не е създаден от Meet Luft
drive-start-partition-gone = Стартовият дял на Luft го няма
drive-start-partition-not-listed = Стартовият дял на Luft не е в таблицата на дяловете
drive-no-esp = Този компютър няма системен дял EFI
drive-esp-full = Системният дял EFI е твърде пълен за стартовите файлове на Luft.
drive-esp-not-opened = Системният дял EFI не можа да бъде отворен
drive-esp-file-unreadable = Файлът { $file } на системния дял EFI не може да бъде прочетен
drive-esp-no-drive = Системният дял EFI няма диск
drive-esp-no-guid = Системният дял EFI няма GUID
drive-no-uuid = Дискът, на който се пази Luft, няма UUID
drive-folder-unreadable = Luft не може да стартира от диска, на който са файловете ви.
drive-folder-not-startable = Не може да се стартира от { $folder }

## Errors while getting Luft

live-no-home-folder = Няма лична папка, в която да се пази Luft
live-no-app-data-folder = Няма локална папка за данни на приложенията, в която да се пази Luft
live-pointer-unreadable = Най-новият Luft не може да бъде прочетен
live-not-published = Luft не е публикуван там
live-checksum-unreadable = Файлът с контролната сума не може да бъде прочетен
live-checksum-not-read = Контролната сума на Luft не можа да бъде прочетена: { $error }
live-download-damaged = Изтегленото се повреди по пътя. Опитайте отново.
live-download-incomplete = В изтегления Luft липсва { $file }
live-download-not-resumable = Сървърът не може да продължи изтеглянето
live-not-signed = { $iso } не е подписан
live-signature-unreadable = Подписът на { $iso } не може да бъде прочетен
live-signature-wrong-key = { $iso } не е подписан от Lantharos
live-signature-other-iso = Подписът е за { $signed }, а не за { $iso }
live-iso-out-of-order = Файловете в ISO образа не са в ред, който Meet Luft може да прочете
live-iso-not-iso = Това не е ISO образ
live-iso-no-root = ISO образът няма коренна папка
live-iso-no-joliet = ISO образът няма имена Joliet
live-not-removed = Папката { $path } не можа да бъде премахната: { $error }

## Errors while making a USB stick

stick-gone = Флашката вече я няма. Включете я отново и я изберете пак.
stick-too-small = Luft не се побира на тази флашка. Използвайте флашка от 4 ГБ или повече.
stick-damaged = ISO образът не съвпада с контролната си сума. Може да се е повредил по пътя.
stick-read-back-differs = При обратното прочитане флашката не върна записаното. Може да е износена, затова опитайте с друга.
stick-download-unavailable = В момента Luft не може да бъде изтеглен: { $error }
stick-download-failed = Luft не можа да бъде изтеглен: { $error }
stick-checksum-unreadable = Контролната сума на ISO образа не може да бъде прочетена: { $error }
stick-file-unreadable = Файлът { $path } не може да бъде прочетен: { $error }
stick-iso-unreadable = ISO образът не може да бъде прочетен: { $error }
stick-iso-no-name = ISO образът няма име
stick-iso-ended-early = ISO образът свърши преждевременно
stick-iso-already-there = { $name } вече е на флашката.
stick-no-room = На флашката няма място за Luft. Първо освободете { $size } МБ на нея.
stick-older-not-removed = По-старият Luft не можа да бъде премахнат: { $error }
stick-copy-stopped = Копирането на Luft на флашката спря: { $error }
stick-not-opened = Флашката не можа да бъде отворена: { $error }
stick-write-stopped = Записването на флашката спря: { $error }
stick-not-synced = Флашката не прие всичко: { $error }
stick-read-back-failed = Флашката не можа да бъде прочетена обратно: { $error }
stick-in-use = Флашката все още се използва: { $error }
stick-device-in-use = { $device } все още се използва: { $error }
stick-volume-not-opened = Томът на флашката не можа да бъде отворен: { $error }
stick-volume-in-use = Флашката все още се използва. Затворете това, което има отворени файлове на нея, и опитайте отново ({ $error })
stick-not-dismounted = Windows не можа да освободи флашката: { $error }
stick-not-cleared = Windows не можа да изчисти флашката: { $error }
stick-not-refreshed = Windows не можа да прегледа флашката отново: { $error }
stick-not-ventoy = Тази флашка вече не използва Ventoy.
stick-ventoy-not-opened = Дялът на Ventoy не можа да бъде отворен: { $error }
stick-ventoy-not-opened-windows = Windows не може да отвори дяла на Ventoy
stick-udisks-missing = Meet Luft се нуждае от UDisks, за да използва флашката: { $error }
