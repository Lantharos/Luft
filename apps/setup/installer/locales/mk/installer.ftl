## Errors shown in Install Luft and first-run setup

installer-not-allowed = Немате дозвола за ова.
installer-stopped = Инсталерот неочекувано запре.
installer-request-invalid = Барањето не е валидно: { $error }
installer-settings-invalid = Поставките не се валидни: { $error }
installer-busy = Luft веќе се инсталира.
installer-account-exists = Сметката е веќе создадена.

## Choosing what to install

installer-no-image = Нема системска слика { $variant } за инсталирање.
installer-write-failed = { $path } не можеше да се запише

## Checking the destination

installer-drive-gone = Тој диск повеќе не е поврзан.
installer-drive-unusable = Luft не може да се инсталира на тој диск.
installer-system-gone = Тој систем повеќе не постои.
installer-system-unreplaceable = Luft сè уште не може да го замени системот { $system }.
installer-drive-running = Luft моментално се стартува од тој диск, па не може да се избрише.
installer-windows-unshrinkable = Windows на тој диск не може да се намали.
installer-size-wont-fit = Таа големина не собира покрај Windows.
installer-space-gone = Тој слободен простор повеќе не постои.
installer-space-too-small = Тој слободен простор е премал за Luft.

## Account and regional settings

installer-user-name-invalid = Тоа корисничко име не може да се користи.
installer-full-name-invalid = Името не може да содржи две точки, запирки или нови редови.
installer-password-missing = Изберете лозинка.
installer-account-not-saved = Новата сметка не е зачувана
installer-account-missing = Новата сметка недостасува
installer-regional-invalid = Тие регионални поставки не се валидни.
installer-unknown-zone = Новиот систем не ја познава временската зона { $zone }.

## Installing

installer-esp-partition-failed = EFI-системската партиција не можеше да се создаде
installer-startup-partition-failed = Партицијата за датотеките за стартување на Luft не можеше да се создаде
installer-root-partition-failed = Партицијата за Luft не можеше да се создаде
installer-encryption-failed = Партицијата за Luft не можеше да се шифрира
installer-shrink-failed = Windows не можеше да се намали
installer-no-esp = Дискот нема EFI-системска партиција
installer-no-root = Не е создадена партиција за Luft
installer-copy-failed = Luft не можеше да се копира
installer-no-deployment = Новиот систем нема распоредување
installer-deployment-unnamed = Распоредувањето на новиот систем нема име
installer-deployment-unopened = Новиот систем не можеше да се отвори
installer-boot-menu-failed = Менито за подигање на Luft не можеше да се стави на EFI-системската партиција
installer-key-queue-failed = Клучот за Secure Boot на Luft не можеше да се закаже за следното рестартирање

## Replacing a Linux system

installer-encryption-keeps-old = Luft не може да се шифрира кога ги задржува датотеките од стариот систем покрај себе.
installer-leftovers-failed = Остатоците од претходниот обид не можеа да се исчистат
installer-default-failed = Luft не можеше да се постави како систем што се стартува
installer-relabel-failed = Вашите датотеки не можеа да се означат за Luft
installer-set-aside-failed = Стариот систем не можеше да се тргне настрана

## Things packed with Meet Luft

installer-box-unopened = Кутијата за преселба не можеше да се отвори
installer-box-no-list = Кутијата за преселба нема список на содржината
installer-unpack-failed = { $path } не можеше да се отпакува
installer-wallpaper-unnamed = Позадината нема име
