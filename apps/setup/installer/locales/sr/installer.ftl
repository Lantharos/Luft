## Errors shown in Install Luft and first-run setup

installer-not-allowed = Немате дозволу за ово.
installer-stopped = Инсталер је неочекивано стао.
installer-request-invalid = Захтев није исправан: { $error }
installer-settings-invalid = Подешавања нису исправна: { $error }
installer-busy = Luft се већ инсталира.
installer-account-exists = Налог је већ направљен.

## Choosing what to install

installer-no-image = Нема слике { $variant } за инсталирање.
installer-write-failed = Уписивање „{ $path }“ није успело

## Checking the destination

installer-drive-gone = Тај диск више није повезан.
installer-drive-unusable = Luft не може да се инсталира на тај диск.
installer-system-gone = Тај систем више не постоји.
installer-system-unreplaceable = Luft још не може да замени систем { $system }.
installer-drive-running = Luft се тренутно покреће са тог диска, па он не може да се избрише.
installer-windows-unshrinkable = Windows на том диску не може да се смањи.
installer-size-wont-fit = Та величина не стаје поред система Windows.
installer-space-gone = Тај слободан простор више не постоји.
installer-space-too-small = Тај слободан простор је премали за Luft.

## Account and regional settings

installer-user-name-invalid = То корисничко име не може да се користи.
installer-full-name-invalid = Име не сме да садржи двотачке, зарезе ни преломе реда.
installer-password-missing = Изаберите лозинку.
installer-account-not-saved = Нови налог није сачуван
installer-account-missing = Нови налог недостаје
installer-regional-invalid = Та регионална подешавања нису исправна.
installer-unknown-zone = Нови систем не познаје временску зону { $zone }.

## Installing

installer-esp-partition-failed = EFI системска партиција није могла да се направи
installer-startup-partition-failed = Партиција за датотеке којима се Luft покреће није могла да се направи
installer-root-partition-failed = Партиција за Luft није могла да се направи
installer-shrink-failed = Windows није могао да се смањи
installer-no-esp = Диск нема EFI системску партицију
installer-no-root = Партиција за Luft није направљена
installer-copy-failed = Luft није могао да се копира
installer-no-deployment = Нови систем нема инсталацију
installer-deployment-unnamed = Инсталација новог система нема назив
installer-deployment-unopened = Нови систем није могао да се отвори
installer-boot-menu-failed = Мени за покретање система Luft није могао да се смести на EFI системску партицију
installer-key-queue-failed = Secure Boot кључ система Luft није могао да се припреми за следеће поновно покретање

## Replacing a Linux system

installer-leftovers-failed = Остаци ранијег покушаја нису могли да се уклоне
installer-default-failed = Luft није могао да постане систем који се покреће
installer-relabel-failed = Ваше датотеке нису могле да се обележе за Luft
installer-set-aside-failed = Стари систем није могао да се склони

## Things packed with Meet Luft

installer-box-unopened = Кутија за селидбу није могла да се отвори
installer-box-no-list = Кутија за селидбу нема списак садржаја
installer-unpack-failed = Распакивање „{ $path }“ није успело
installer-wallpaper-unnamed = Позадина нема назив
