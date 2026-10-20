## Errors shown in Install Luft and first-run setup

installer-not-allowed = Нямате разрешение да направите това.
installer-stopped = Инсталаторът спря неочаквано.
installer-request-invalid = Заявката не е валидна: { $error }
installer-settings-invalid = Настройките не са валидни: { $error }
installer-busy = Luft вече се инсталира.
installer-account-exists = Акаунтът вече е създаден.

## Choosing what to install

installer-no-image = Няма образ { $variant } за инсталиране.
installer-read-failed = Неуспешно четене на { $path }
installer-parse-failed = Неуспешен анализ на { $path }
installer-write-failed = Неуспешен запис в { $path }

## Checking the destination

installer-drive-gone = Този диск вече не е свързан.
installer-drive-unusable = Luft не може да бъде инсталиран на този диск.
installer-system-gone = Тази система вече я няма.
installer-system-unreplaceable = Luft все още не може да замени { $system }.
installer-drive-running = Luft в момента се стартира от този диск, затова той не може да бъде изтрит.
installer-windows-unshrinkable = Windows на този диск не може да бъде смален.
installer-size-wont-fit = Този размер не се побира до Windows.
installer-space-gone = Това свободно място вече го няма.
installer-space-too-small = Това свободно място е твърде малко за Luft.

## Account and regional settings

installer-user-name-invalid = Това потребителско име не може да се използва.
installer-full-name-invalid = Името не може да съдържа двоеточия, запетаи или нови редове.
installer-password-missing = Изберете парола.
installer-account-not-saved = Новият акаунт не беше запазен
installer-account-missing = Новият акаунт липсва
installer-regional-invalid = Тези регионални настройки не са валидни.
installer-unknown-zone = Новата система не познава часовата зона { $zone }.

## Installing

installer-esp-partition-failed = Системният дял EFI не можа да бъде създаден
installer-startup-partition-failed = Дялът за стартовите файлове на Luft не можа да бъде създаден
installer-root-partition-failed = Дялът за Luft не можа да бъде създаден
installer-shrink-failed = Windows не можа да бъде смален
installer-no-esp = Дискът няма системен дял EFI
installer-no-root = Не беше създаден дял за Luft
installer-copy-failed = Luft не можа да бъде копиран
installer-no-deployment = Новата система няма внедряване
installer-deployment-unnamed = Внедряването на новата система няма име
installer-deployment-unopened = Новата система не можа да бъде отворена
installer-boot-menu-failed = Менюто за зареждане на Luft не можа да бъде поставено в системния дял EFI
installer-key-queue-failed = Ключът за Secure Boot на Luft не можа да бъде подготвен за следващото рестартиране

## Replacing a Linux system

installer-leftovers-failed = Остатъците от предишен опит не можаха да бъдат изчистени
installer-default-failed = Luft не можа да бъде зададен като системата, която се стартира
installer-relabel-failed = Файловете ви не можаха да бъдат обозначени за Luft
installer-set-aside-failed = Старата система не можа да бъде отделена настрана

## Things packed with Meet Luft

installer-box-unopened = Кутията за преместване не можа да бъде отворена
installer-box-no-list = Кутията за преместване няма списък на съдържанието си
installer-unpack-failed = Неуспешно разопаковане на { $path }
installer-wallpaper-unnamed = Тапетът няма име
