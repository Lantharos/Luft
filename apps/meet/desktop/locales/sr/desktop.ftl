## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-битни процесор Intel или AMD
check-processor-x64-detail = Luft ради на њему.
check-processor-arm = Процесор Arm
check-processor-arm-detail = Luft за сада ради само на процесорима Intel и AMD.
check-processor-32-bit-windows = 32-битни Windows
check-processor-32-bit-system = 32-битни систем
check-processor-32-bit-detail = Систему Luft је потребан 64-битни процесор Intel или AMD.
check-startup-uefi = Покреће се помоћу UEFI-ја
check-startup-uefi-windows = Luft се покреће на исти савремени начин.
check-startup-uefi-linux = Luft додаје сопствену ставку за покретање, а систем { $system } се и даље покреће као и сада.
check-startup-bios = Покреће се у старом BIOS режиму
check-startup-bios-windows = Систему Luft је потребан UEFI. Windows може да пређе помоћу алатке MBR2GPT, а затим може да се укључи UEFI у подешавањима фирмвера.
check-startup-bios-linux = Систему Luft је потребан UEFI. Укључите га у подешавањима фирмвера, заједно са системом који је већ овде, па поново проверите.
check-startup-mbr = Диск користи стару табелу партиција
check-startup-mbr-windows = Систему Luft је потребан GPT диск. Windows може да га претвори помоћу алатке MBR2GPT без губитка датотека.
check-startup-mbr-linux = Систему Luft је за покретање потребан GPT диск.
check-startup-no-esp = Нема EFI системске партиције
check-startup-no-esp-detail = Luft додаје своје датотеке за покретање поред оних које су већ на EFI системској партицији, а ње нема.
check-startup-esp-full = EFI системска партиција је пуна
check-startup-esp-full-detail = Систему Luft је тамо потребно { $size } MB за датотеке за покретање. Простор обично заузимају стара језгра или ставке за покретање.
check-folder-fine = Партиције се не мењају
check-folder-fine-detail = Luft се чува као датотека на вашем { $filesystem } диску и одатле се покреће.
check-folder-encrypted = Ваше датотеке су на шифрованом диску
check-folder-encrypted-detail = Luft за сада не може да се покрене са шифрованог диска. За испробавање употребите USB флеш.
check-folder-combined = Ваше датотеке су на више од једне партиције
check-folder-combined-detail = Luft за сада не може да се покрене са LVM-а ни RAID-а. За испробавање употребите USB флеш.
check-folder-filesystem = Luft не може да се покрене са система датотека { $filesystem }
check-folder-filesystem-detail = Покреће се са дискова ext4, btrfs и XFS. За испробавање употребите USB флеш.
check-space-free = Слободно: { $size } GB
check-space-free-linux = Док га испробавате, Luft заузима око { $size } GB.
check-space-up-to = До { $size } GB за Luft
check-space-up-to-detail = Windows задржава своје датотеке и простор за раст.
check-space-free-already = Од тога је већ слободно { $size } GB, па Windows уступа мање.
check-space-other-drive = За њега има места на диску { $drive }.
check-space-erase-drive = За њега има места на диску { $drive }, кад се тај диск избрише.
check-space-short = Нема довољно слободног простора
check-space-short-windows = Систему Luft треба око { $needed } GB које Windows може да уступи. Ослободите { $missing } GB у систему Windows, на пример помоћу Чишћења диска, па поново проверите.
check-space-short-linux = Систему Luft за покретање треба око { $needed } GB. Ослободите { $missing } GB, па поново проверите.
check-system-replaceable = Luft може да заузме његово место и задржи ваше датотеке, налог и подешавања.
check-system-single = Ваше датотеке деле партицију са системом, па замена уз задржавање датотека за сада није подржана. Испробавање и инсталирање система Luft раде.
check-system-encrypted = Систем је шифрован, па замена уз задржавање датотека за сада није подржана.
check-system-unknown = Диск система је распоређен на начин који Luft за сада не може да замени уз задржавање ваших датотека.
check-encryption-off = Windows није шифрован
check-encryption-off-detail = Инсталирај Luft може да прочита његова подешавања и ваше Bluetooth уређаје.
check-encryption-on = Windows је шифрован помоћу BitLocker-а
check-encryption-on-detail = То није проблем. Windows сам прави простор, а Meet Luft преноси оно што Luft не може да прочита са закључаног диска. За сваки случај држите кључ за опоравак при руци.
check-encryption-changing = BitLocker још шифрује или дешифрује
check-encryption-changing-detail = Сачекајте да Windows заврши, па се вратите. Напредак можете да видите у Подешавањима, под Шифровање уређаја.
check-fast-startup-on = Брзо покретање је укључено
check-fast-startup-on-detail = Windows уместо искључивања прелази у хибернацију, због чега му диск остаје закључан. Meet Luft нуди да га искључи пре инсталирања.
check-fast-startup-off = Брзо покретање је искључено
check-fast-startup-off-detail = Windows се потпуно искључује.
check-secure-boot-on = Secure Boot је укључен
check-secure-boot-on-detail = Може да остане укључен. Luft једном, на плавом екрану, тражи да дода свој кључ.
check-secure-boot-off = Secure Boot је искључен
check-secure-boot-off-detail = Luft ради и без њега, али игре са заштитом од варања га захтевају. { $turningOn }
check-secure-boot-restart-into = Meet Luft може поново да покрене рачунар у подешавања фирмвера, где се налази под { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft може поново да покрене рачунар у подешавања фирмвера, где се обично налази под Security или Boot.
check-secure-boot-turn-on = Да бисте га укључили, поново покрените рачунар и притисните { $key } кад се појави логотип { $maker }, па идите на { $place }.
check-secure-boot-turn-on-anywhere = Да бисте га укључили, отворите подешавања фирмвера док се рачунар покреће и потражите под Security или Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, затим Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, затим Secure Boot
check-firmware-place-security-or-advanced = Security или Advanced, затим Secure Boot Configuration
check-firmware-place-security-or-boot = Security или Boot, затим Secure Boot
check-firmware-place-boot = Boot, затим Secure Boot
check-firmware-place-settings = Settings, затим Security, затим Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 на ThinkPad-у)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 или Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = дугме за појачавање звука

## More of the computer's hardware

check-tpm-detail = Шифровани Luft може сам да се откључа при покретању рачунара.
check-tpm-missing = Нема TPM 2.0
check-tpm-missing-detail = Ако шифрујете Luft, при сваком покретању ће тражити лозинку за шифровање.
check-graphics = Графика
check-graphics-detail = Ради одмах.
check-graphics-nvidia = Luft се инсталира са NVIDIA-иним драјвером.
check-wifi-missing = Нема Wi-Fi мреже
check-wifi-missing-detail = У систему Luft користите мрежни кабл или ништа.
check-wifi-detail = Ради у систему Luft.
check-wifi-broadcom = Неки Broadcom Wi-Fi чипови траже драјвер који Luft не садржи. Држите при руци мрежни кабл или телефон за USB дељење везе.
check-start-entries = { $count ->
    [one] { $count } стара ставка за покретање
    [few] { $count } старе ставке за покретање
   *[other] { $count } старих ставки за покретање
}
check-start-entries-detail = { $count ->
    [one] { $names } упућује на систем којег више нема на овом рачунару. Може да се почисти.
    [few] { $names } упућују на системе којих више нема на овом рачунару. Могу да се почисте.
   *[other] { $names } упућују на системе којих више нема на овом рачунару. Могу да се почисте.
}
check-download-unavailable = Luft тренутно не може да се преузме
check-download-unavailable-detail = Meet Luft преузима око 3 GB. Проверите да ли сте повезани на интернет и поново проверите или употребите ISO за Luft који већ имате.

## Choosing a Luft ISO file

iso-dialog-title = Изаберите ISO за Luft
iso-dialog-filter = ISO за Luft

## Saving the logs from trying Luft

logs-file-name = Luft евиденције { $name }
logs-no-desktop = Апликација Meet Luft није пронашла вашу радну површину
logs-not-saved = Апликација Meet Luft није могла да сачува евиденције из испробавања система Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Помоћни програм апликације Meet Luft се није покренуо: { $error }
helper-not-allowed = Апликација Meet Luft није добила дозволу за рад на диску
helper-stopped = Помоћни програм апликације Meet Luft се зауставио
helper-stopped-because = Помоћни програм апликације Meet Luft се зауставио: { $error }
helper-pipe-failed = Апликација Meet Luft не може да комуницира са својим помоћним програмом: { $error }
helper-pipe-hijacked = { $pipe } је отворио неко други, а не помоћни програм апликације Meet Luft
helper-record-not-saved = Апликација Meet Luft није могла да забележи шта је направила: { $error }
helper-no-room-yet = Прво направите простор за Luft.
helper-not-ready-linux = Прво припремите Luft.
helper-not-ready-to-start-windows = Luft још није спреман за покретање. Прво направите простор за њега.
helper-not-ready-to-start-linux = Luft још није спреман за покретање. Прво га припремите.
helper-update-unfinished = Ажурирање система Luft није завршено. Прво га поново ажурирајте.
helper-room-too-small = Систему Luft треба више простора од тога.
helper-room-shortfall = Windows може да уступи { $available } GB, а систему Luft треба { $needed } GB.
helper-gap-shortfall = Тај простор има { $available } GB, а систему Luft треба { $needed } GB.
helper-place-gone = Тај простор више није слободан. Поново проверите да бисте видели где Luft може да стане.
helper-box-shortfall = Windows може да уступи још { $available } GB, а за изабрано је потребно { $needed } GB.
helper-box-room-shortfall = Простор система Luft може да уступи { $available } GB, а за изабрано је потребно { $needed } GB.
helper-bluetooth-unreadable = Bluetooth подешавања система Windows нису могла да се отворе
helper-registry-not-opened = Није могуће отворити { $key }: { $error }
helper-registry-not-changed = Није могуће променити { $value }: { $error }
helper-registry-not-saved = Није могуће сачувати { $file }: { $error }
helper-restart-failed = Рачунар се није поново покренуо
helper-windows-restart-failed = Windows се није поново покренуо: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Овај рачунар се не покреће помоћу UEFI-ја
firmware-variable-unreadable = Није могуће прочитати { $name } из фирмвера: { $error }
firmware-variable-not-saved = Није могуће сачувати { $name } у фирмверу: { $error }
firmware-entries-full = У фирмверу нема места за још једну ставку за покретање
firmware-entry-kept = Windows је задржао ставку за покретање { $entry }

## Errors about drives and partitions

drive-list-failed = Није могуће приказати листу дискова: { $error }
drive-of-path-unknown = Није могуће утврдити на ком диску је { $path }
drive-windows-folder-missing = Фасцикла система Windows није пронађена
drive-windows-drive-missing = Диск система Windows није пронађен
drive-windows-drive-missing-because = Диск система Windows није пронађен: { $error }
drive-windows-partition-missing = Партиција система Windows није пронађена
drive-volume-missing = Волумен { $path } није пронађен
drive-storage-error = { $what } (грешка складишта у систему Windows { $code })
drive-shrink-size-unknown = Windows није могао да утврди колико његова партиција може да се смањи
drive-resize-failed = Windows није могао да промени величину своје партиције
drive-create-failed = Windows није могао да направи партицију за Luft
drive-hide-failed = Windows није могао да сакрије нову партицију из Истраживача датотека
drive-format-failed = Windows није могао да форматира нову партицију
drive-remove-failed = Windows није могао да уклони једну од партиција система Luft
drive-new-partition-missing = Нова партиција није пронађена
drive-new-partition-no-volume = Нова партиција нема волумен
drive-start-no-guid = Партиција за покретање нема GUID
drive-live-no-guid = Партиција са које се Luft покреће нема GUID
drive-box-no-guid = Кутија за селидбу нема GUID
drive-guid-unreadable = GUID партиције није читљив
drive-not-gpt = Табела партиција диска није GPT
drive-start-no-volume = Партиција за покретање нема волумен
drive-live-no-volume = Партиција система Luft нема волумен
drive-new-live-no-volume = Нова партиција система Luft нема волумен
drive-partitions-not-noted = Партиција система Luft нема у белешкама апликације Meet Luft
drive-partitions-gone = Партиције система Luft су нестале
drive-partition-gone = Једна партиција је нестала
drive-gone = Један диск је нестао
drive-erase-failed = Windows није могао да избрише диск
drive-erased-no-room = На избрисаном диску нема места за Luft
drive-start-partition-foreign = Партицију за покретање система Luft није направила апликација Meet Luft
drive-start-partition-gone = Партиције за покретање система Luft више нема
drive-start-partition-not-listed = Партиције за покретање система Luft нема у табели партиција
drive-no-esp = Овај рачунар нема EFI системску партицију
drive-esp-full = EFI системска партиција је превише пуна за датотеке за покретање система Luft.
drive-esp-not-opened = EFI системска партиција није могла да се отвори
drive-esp-file-unreadable = Датотека { $file } на EFI системској партицији није читљива
drive-esp-no-drive = EFI системска партиција нема диск
drive-esp-no-guid = EFI системска партиција нема GUID
drive-no-uuid = Диск на ком се чува Luft нема UUID
drive-folder-unreadable = Luft не може да се покрене са диска на ком су ваше датотеке.
drive-folder-not-startable = Са фасцикле { $folder } није могуће покретање

## Errors while changing Luft once it's installed

luft-gone = Luft више није на овом рачунару
luft-not-resizable = Величина система Luft тренутно не може да се промени из система Windows
luft-size-not-allowed = Luft не може да има ту величину
luft-space-promised = Тај простор је одвојен за Luft. Прво откажите промену.
luft-no-start-entry = Ставка за покретање система Luft није пронађена

## Errors while getting Luft

live-no-home-folder = Нема личне фасцикле у којој би се чувао Luft
live-no-app-data-folder = Нема фасцикле локалних података апликација у којој би се чувао Luft
live-pointer-unreadable = Најновији Luft није читљив
live-not-published = Luft тамо није објављен
live-checksum-unreadable = Датотека контролног збира није читљива
live-checksum-not-read = Контролни збир система Luft није могао да се прочита: { $error }
live-download-damaged = Преузимање се успут оштетило. Покушајте поново.
live-download-incomplete = У преузетом систему Luft недостаје { $file }
live-download-not-resumable = Сервер не може да настави преузимање
live-not-signed = Датотека { $iso } није потписана
live-signature-unreadable = Потпис датотеке { $iso } није читљив
live-signature-wrong-key = Датотеку { $iso } није потписао Lantharos
live-signature-other-iso = Потпис је за { $signed }, а не за { $iso }
live-iso-out-of-order = Датотеке у ISO-у нису поређане онако како Meet Luft може да их прочита
live-iso-not-iso = Ово није ISO слика
live-iso-no-root = ISO нема коренску фасциклу
live-iso-no-joliet = ISO нема Joliet називе
live-not-removed = { $path } није могло да се уклони: { $error }

## Errors while making a USB stick

stick-gone = USB флеша више нема. Поново га прикључите и изаберите.
stick-too-small = Luft не стаје на овај флеш. Употребите флеш од 4 GB или више.
stick-damaged = ISO се не подудара са својим контролним збиром. Можда се оштетио при преузимању.
stick-read-back-differs = Флеш при поновном читању није вратио оно што је на њега уписано. Можда је истрошен, па покушајте са другим.
stick-download-unavailable = Luft тренутно не може да се преузме: { $error }
stick-download-failed = Luft није могао да се преузме: { $error }
stick-checksum-unreadable = Контролни збир ISO-а не може да се прочита: { $error }
stick-file-unreadable = { $path } не може да се прочита: { $error }
stick-iso-unreadable = ISO не може да се прочита: { $error }
stick-iso-no-name = ISO нема назив
stick-iso-ended-early = ISO се прерано завршио
stick-iso-already-there = Датотека { $name } је већ на флешу.
stick-no-room = На флешу нема места за Luft. Прво на њему ослободите { $size } MB.
stick-older-not-removed = Старији Luft није могао да се уклони: { $error }
stick-copy-stopped = Копирање система Luft на флеш је заустављено: { $error }
stick-not-opened = Флеш није могао да се отвори: { $error }
stick-write-stopped = Уписивање на флеш је заустављено: { $error }
stick-not-synced = Флеш није примио све: { $error }
stick-read-back-failed = Флеш није могао поново да се прочита: { $error }
stick-in-use = Флеш се још користи: { $error }
stick-device-in-use = { $device } се још користи: { $error }
stick-volume-not-opened = Волумен флеша није могао да се отвори: { $error }
stick-volume-in-use = Флеш се још користи. Затворите оно што на њему има отворене датотеке и покушајте поново ({ $error })
stick-not-dismounted = Windows није могао да отпусти флеш: { $error }
stick-not-cleared = Windows није могао да очисти флеш: { $error }
stick-not-refreshed = Windows није могао поново да прегледа флеш: { $error }
stick-not-ventoy = Овај флеш више не користи Ventoy.
stick-ventoy-not-opened = Партиција алатке Ventoy није могла да се отвори: { $error }
stick-ventoy-not-opened-windows = Windows не може да отвори партицију алатке Ventoy
stick-udisks-missing = Апликацији Meet Luft је за коришћење флеша потребан UDisks: { $error }
