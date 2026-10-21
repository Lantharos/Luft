## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-битен процесор Intel или AMD
check-processor-x64-detail = Luft работи на него.
check-processor-arm = Процесор Arm
check-processor-arm-detail = Luft засега работи само на процесори Intel и AMD.
check-processor-32-bit-windows = 32-битен Windows
check-processor-32-bit-system = 32-битен систем
check-processor-32-bit-detail = На Luft му треба 64-битен процесор Intel или AMD.
check-startup-uefi = Се стартува со UEFI
check-startup-uefi-windows = Luft се стартува на истиот модерен начин.
check-startup-uefi-linux = Luft додава свој запис за стартување, а { $system } продолжува да се стартува како досега.
check-startup-bios = Се стартува во стариот режим BIOS
check-startup-bios-windows = На Luft му треба UEFI. Windows може да се префрли со MBR2GPT, а потоа UEFI може да се вклучи во поставките на фирмверот.
check-startup-bios-linux = На Luft му треба UEFI. Вклучете го во поставките на фирмверот, заедно со системот што веќе е тука, па проверете повторно.
check-startup-mbr = Дискот користи стара партициска табела
check-startup-mbr-windows = На Luft му треба GPT-диск. Windows може да го претвори со MBR2GPT без губење датотеки.
check-startup-mbr-linux = На Luft му треба GPT-диск од кој ќе се стартува.
check-startup-no-esp = Нема EFI-системска партиција
check-startup-no-esp-detail = Luft ги додава своите датотеки за стартување до оние што веќе се на EFI-системската партиција, а таква нема.
check-startup-esp-full = EFI-системската партиција е полна
check-startup-esp-full-detail = На Luft му требаат { $size } MB таму за неговите датотеки за стартување. Просторот обично го заземаат стари јадра или записи за стартување.
check-folder-fine = Партициите остануваат какви што се
check-folder-fine-detail = Luft се чува како датотека на вашиот диск со { $filesystem } и се стартува оттаму.
check-folder-encrypted = Вашите датотеки се на шифриран диск
check-folder-encrypted-detail = Luft сè уште не може да се стартува од шифриран диск. Наместо тоа, пробајте го со USB-меморија.
check-folder-combined = Вашите датотеки се на повеќе од една партиција
check-folder-combined-detail = Luft сè уште не може да се стартува од LVM или RAID. Наместо тоа, пробајте го со USB-меморија.
check-folder-filesystem = Luft не може да се стартува од { $filesystem }
check-folder-filesystem-detail = Се стартува од дискови со ext4, btrfs и XFS. Наместо тоа, пробајте го со USB-меморија.
check-space-free = { $size } GB слободни
check-space-free-linux = Luft зазема околу { $size } GB додека го пробувате.
check-space-up-to = До { $size } GB за Luft
check-space-up-to-detail = Windows ги задржува своите датотеки и простор за раст.
check-space-free-already = Од нив { $size } GB веќе се слободни, па Windows отстапува помалку.
check-space-other-drive = Има простор за него на { $drive }.
check-space-erase-drive = Има простор за него на { $drive }, откако тој диск ќе се избрише.
check-space-short = Нема доволно слободен простор
check-space-short-windows = На Luft му требаат околу { $needed } GB што Windows може да ги отстапи. Ослободете { $missing } GB во Windows, на пример со Чистење на дискот, па проверете повторно.
check-space-short-linux = На Luft му требаат околу { $needed } GB за да се стартува. Ослободете { $missing } GB, па проверете повторно.
check-system-replaceable = Luft може да го заземе неговото место и да ги задржи вашите датотеки, сметката и поставките.
check-system-single = Вашите датотеки делат една партиција со системот, па замената со нивно задржување сè уште не е поддржана. Пробувањето и инсталирањето на Luft работат.
check-system-encrypted = Шифриран е, па замената со задржување на датотеките сè уште не е поддржана.
check-system-unknown = Неговиот диск е распореден на начин што Luft сè уште не може да го замени со задржување на датотеките.
check-encryption-off = Windows не е шифриран
check-encryption-off-detail = Инсталирај Luft може да ги прочита неговите поставки и вашите Bluetooth-уреди.
check-encryption-on = Windows е шифриран со BitLocker
check-encryption-on-detail = Тоа е во ред. Windows сам прави место, а Meet Luft го пренесува она што Luft не може да го прочита од заклучен диск. За секој случај, чувајте го клучот за обновување при рака.
check-encryption-changing = BitLocker сè уште шифрира или дешифрира
check-encryption-changing-detail = Почекајте Windows да заврши, па вратете се. Колку напреднало можете да видите во Поставки, под Шифрирање на уредот.
check-fast-startup-on = Брзо стартување е вклучено
check-fast-startup-on-detail = Windows оди во хибернација наместо да се исклучи, што го држи неговиот диск заклучен. Meet Luft нуди да го исклучи пред инсталирањето.
check-fast-startup-off = Брзо стартување е исклучено
check-fast-startup-off-detail = Windows целосно се исклучува.
check-secure-boot-on = Secure Boot е вклучен
check-secure-boot-on-detail = Може да остане вклучен. Luft еднаш, на син екран, бара да го додаде својот клуч.
check-secure-boot-off = Secure Boot е исклучен
check-secure-boot-off-detail = Luft работи и без него, но игрите со заштита од мамење го бараат. { $turningOn }
check-secure-boot-restart-into = Meet Luft може да рестартира во поставките на фирмверот, каде што е под { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft може да рестартира во поставките на фирмверот, каде што обично е под Security или Boot.
check-secure-boot-turn-on = За да го вклучите, рестартирајте и притиснете { $key } кога ќе се појави логото на { $maker }, па одете во { $place }.
check-secure-boot-turn-on-anywhere = За да го вклучите, отворете ги поставките на фирмверот додека компјутерот се стартува и побарајте под Security или Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, па Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, па Secure Boot
check-firmware-place-security-or-advanced = Security или Advanced, па Secure Boot Configuration
check-firmware-place-security-or-boot = Security или Boot, па Secure Boot
check-firmware-place-boot = Boot, па Secure Boot
check-firmware-place-settings = Settings, па Security, па Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 на ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 или Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = копчето за зголемување на звукот

## More of the computer's hardware

check-tpm-detail = Шифриран Luft може сам да се отклучи кога компјутерот се стартува.
check-tpm-missing = Нема TPM 2.0
check-tpm-missing-detail = Ако го шифрирате Luft, тој ќе бара тајна фраза при секое стартување.
check-graphics = Графика
check-graphics-detail = Работи веднаш.
check-graphics-nvidia = Luft се инсталира со сопствениот двигател на NVIDIA.
check-wifi-missing = Нема Wi-Fi
check-wifi-missing-detail = Во Luft користете мрежен кабел или работете без мрежа.
check-wifi-detail = Работи во Luft.
check-wifi-broadcom = На некои Wi-Fi-чипови Broadcom им треба двигател што Luft го нема. Чувајте при рака мрежен кабел или телефон за USB-тетеринг.
check-start-entries = { $count ->
    [one] Стар запис за стартување
   *[other] { $count } стари записи за стартување
}
check-start-entries-detail = { $count ->
    [one] { $names } покажува кон систем што веќе не е на овој компјутер. Може да се отстрани.
   *[other] { $names } покажуваат кон системи што веќе не се на овој компјутер. Може да се отстранат.
}
check-download-unavailable = Luft моментално не може да се преземе
check-download-unavailable-detail = Meet Luft презема околу 3 GB. Проверете дали сте поврзани на интернет и проверете повторно, или користете ISO на Luft што веќе го имате.

## Choosing a Luft ISO file

iso-dialog-title = Избери ISO на Luft
iso-dialog-filter = ISO на Luft

## Saving the logs from trying Luft

logs-file-name = Дневници на Luft { $name }
logs-no-desktop = Meet Luft не ја пронајде вашата работна површина
logs-not-saved = Meet Luft не можеше да ги зачува дневниците од пробувањето на Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Помошникот на Meet Luft не се стартуваше: { $error }
helper-not-allowed = На Meet Luft не му беше дозволено да работи на дискот
helper-stopped = Помошникот на Meet Luft запре
helper-stopped-because = Помошникот на Meet Luft запре: { $error }
helper-pipe-failed = Meet Luft не можеше да комуницира со својот помошник: { $error }
helper-pipe-hijacked = Нешто друго наместо помошникот на Meet Luft го отвори { $pipe }
helper-record-not-saved = Meet Luft не можеше да запише што направи: { $error }
helper-no-room-yet = Најпрвин направете место за Luft.
helper-not-ready-linux = Најпрвин подгответе го Luft.
helper-not-ready-to-start-windows = Luft сè уште не е подготвен за стартување. Најпрвин направете место за него.
helper-not-ready-to-start-linux = Luft сè уште не е подготвен за стартување. Најпрвин подгответе го.
helper-update-unfinished = Ажурирањето на Luft не заврши. Најпрвин ажурирајте го повторно.
helper-room-too-small = На Luft му треба повеќе простор од тоа.
helper-room-shortfall = Windows може да отстапи { $available } GB, а на Luft му требаат { $needed } GB.
helper-gap-shortfall = Тој простор собира { $available } GB, а на Luft му требаат { $needed } GB.
helper-place-gone = Тој простор веќе не е слободен. Проверете повторно за да видите каде може да се смести Luft.
helper-box-shortfall = Windows може да отстапи уште { $available } GB, а на избраното му требаат { $needed } GB.
helper-box-room-shortfall = Просторот на Luft може да одвои { $available } GB, а на избраното му требаат { $needed } GB.
helper-bluetooth-unreadable = Поставките за Bluetooth на Windows не можеа да се отворат
helper-registry-not-opened = Не може да се отвори { $key }: { $error }
helper-registry-not-changed = Не може да се смени { $value }: { $error }
helper-registry-not-saved = Не може да се зачува { $file }: { $error }
helper-restart-failed = Компјутерот не се рестартираше
helper-windows-restart-failed = Windows не се рестартираше: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Овој компјутер не се стартува со UEFI
firmware-variable-unreadable = Не може да се прочита { $name } од фирмверот: { $error }
firmware-variable-not-saved = Не може да се зачува { $name } во фирмверот: { $error }
firmware-entries-full = Во фирмверот нема место за уште еден запис за стартување
firmware-entry-kept = Windows го задржа записот за стартување { $entry }

## Errors about drives and partitions

drive-list-failed = Дисковите не можеа да се наведат: { $error }
drive-of-path-unknown = Не може да се утврди на кој диск е { $path }
drive-windows-folder-missing = Папката на Windows не е пронајдена
drive-windows-drive-missing = Дискот на Windows не е пронајден
drive-windows-drive-missing-because = Дискот на Windows не е пронајден: { $error }
drive-windows-partition-missing = Партицијата на Windows не е пронајдена
drive-volume-missing = Волуменот { $path } не е пронајден
drive-storage-error = { $what } (грешка на складирањето во Windows { $code })
drive-shrink-size-unknown = Windows не можеше да утврди колку може да се намали неговата партиција
drive-resize-failed = Windows не можеше да ја смени големината на својата партиција
drive-create-failed = Windows не можеше да направи партиција за Luft
drive-hide-failed = Windows не можеше да ја скрие новата партиција од Explorer
drive-format-failed = Windows не можеше да ја форматира новата партиција
drive-remove-failed = Windows не можеше да отстрани една од партициите на Luft
drive-new-partition-missing = Новата партиција не е пронајдена
drive-new-partition-no-volume = Новата партиција нема волумен
drive-start-no-guid = Партицијата за стартување нема GUID
drive-live-no-guid = Партицијата од која се стартува Luft нема GUID
drive-box-no-guid = Кутијата за селење нема GUID
drive-guid-unreadable = GUID на партицијата не може да се прочита
drive-not-gpt = Партициската табела на дискот не е GPT
drive-start-no-volume = Партицијата за стартување нема волумен
drive-live-no-volume = Партицијата на Luft нема волумен
drive-new-live-no-volume = Новата партиција на Luft нема волумен
drive-partitions-not-noted = Партициите на Luft ги нема во белешките на Meet Luft
drive-partitions-gone = Партициите на Luft исчезнаа
drive-partition-gone = Една партиција исчезна
drive-gone = Еден диск исчезна
drive-erase-failed = Windows не можеше да го избрише дискот
drive-erased-no-room = На избришаниот диск нема простор за Luft
drive-start-partition-foreign = Партицијата за стартување на Luft не ја направи Meet Luft
drive-start-partition-gone = Партицијата за стартување на Luft ја нема
drive-start-partition-not-listed = Партицијата за стартување на Luft ја нема во партициската табела
drive-no-esp = Овој компјутер нема EFI-системска партиција
drive-esp-full = EFI-системската партиција е премногу полна за датотеките за стартување на Luft.
drive-esp-not-opened = EFI-системската партиција не можеше да се отвори
drive-esp-file-unreadable = { $file } на EFI-системската партиција не може да се прочита
drive-esp-no-drive = EFI-системската партиција нема диск
drive-esp-no-guid = EFI-системската партиција нема GUID
drive-no-uuid = Дискот на кој се чува Luft нема UUID
drive-folder-unreadable = Luft не може да се стартува од дискот на кој се вашите датотеки.
drive-folder-not-startable = Од { $folder } не може да се стартува

## Errors while changing Luft once it's installed

luft-gone = Luft веќе не е на овој компјутер
luft-not-resizable = Големината на Luft моментално не може да се смени од Windows
luft-size-not-allowed = Luft не може да биде со таа големина
luft-space-promised = Тој простор е одвоен за Luft. Најпрвин откажете ја промената.
luft-no-start-entry = Записот за стартување на Luft не е пронајден

## Errors while getting Luft

live-no-home-folder = Нема домашна папка во која би се чувал Luft
live-no-app-data-folder = Нема локална папка за податоци на апликациите во која би се чувал Luft
live-pointer-unreadable = Најновиот Luft не може да се прочита
live-not-published = Luft не е објавен таму
live-checksum-unreadable = Датотеката со контролниот збир не може да се прочита
live-checksum-not-read = Контролниот збир на Luft не можеше да се прочита: { $error }
live-download-damaged = Преземањето се оштети успатно. Обидете се повторно.
live-download-incomplete = Во преземениот Luft недостасува { $file }
live-download-not-resumable = Серверот не може да го продолжи преземањето
live-not-signed = { $iso } не е потпишан
live-signature-unreadable = Потписот на { $iso } не може да се прочита
live-signature-wrong-key = { $iso } не е потпишан од Lantharos
live-signature-other-iso = Потписот е за { $signed }, а не за { $iso }
live-iso-out-of-order = Датотеките на ISO не се во редослед што Meet Luft може да го прочита
live-iso-not-iso = Ова не е ISO-слика
live-iso-no-root = ISO нема коренска папка
live-iso-no-joliet = ISO нема имиња Joliet
live-not-removed = { $path } не можеше да се отстрани: { $error }

## Errors while making a USB stick

stick-gone = USB-меморијата повеќе ја нема. Приклучете ја повторно и изберете ја пак.
stick-too-small = Luft не собира на оваа USB-меморија. Користете меморија од 4 GB или поголема.
stick-damaged = ISO не се совпаѓа со својот контролен збир. Можеби се оштетило успатно.
stick-read-back-differs = Од USB-меморијата не се прочита она што беше запишано на неа. Можеби е истрошена, па пробајте со друга.
stick-download-unavailable = Luft моментално не може да се преземе: { $error }
stick-download-failed = Luft не можеше да се преземе: { $error }
stick-checksum-unreadable = Контролниот збир на ISO не може да се прочита: { $error }
stick-file-unreadable = { $path } не може да се прочита: { $error }
stick-iso-unreadable = ISO не може да се прочита: { $error }
stick-iso-no-name = ISO нема име
stick-iso-ended-early = ISO заврши предвреме
stick-iso-already-there = { $name } веќе е на USB-меморијата.
stick-no-room = На USB-меморијата нема место за Luft. Најпрвин ослободете { $size } MB на неа.
stick-older-not-removed = Постариот Luft не можеше да се отстрани: { $error }
stick-copy-stopped = Копирањето на Luft на USB-меморијата запре: { $error }
stick-not-opened = USB-меморијата не можеше да се отвори: { $error }
stick-write-stopped = Запишувањето на USB-меморијата запре: { $error }
stick-not-synced = USB-меморијата не прими сè: { $error }
stick-read-back-failed = USB-меморијата не можеше повторно да се прочита: { $error }
stick-in-use = USB-меморијата сè уште се користи: { $error }
stick-device-in-use = { $device } сè уште се користи: { $error }
stick-volume-not-opened = Волуменот на USB-меморијата не можеше да се отвори: { $error }
stick-volume-in-use = USB-меморијата сè уште се користи. Затворете го она што има отворени датотеки на неа и обидете се повторно ({ $error })
stick-not-dismounted = Windows не можеше да ја ослободи USB-меморијата: { $error }
stick-not-cleared = Windows не можеше да ја исчисти USB-меморијата: { $error }
stick-not-refreshed = Windows не можеше повторно да ја прегледа USB-меморијата: { $error }
stick-not-ventoy = Оваа USB-меморија повеќе не користи Ventoy.
stick-ventoy-not-opened = Партицијата на Ventoy не можеше да се отвори: { $error }
stick-ventoy-not-opened-windows = Windows не може да ја отвори партицијата на Ventoy
stick-udisks-missing = На Meet Luft му треба UDisks за да ја користи USB-меморијата: { $error }
