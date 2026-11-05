## Errors shown in Install Luft and first-run setup

installer-not-allowed = У вас немає дозволу на цю дію.
installer-stopped = Програма встановлення несподівано зупинилася.
installer-request-invalid = Недійсний запит: { $error }
installer-settings-invalid = Недійсні параметри: { $error }
installer-busy = Luft уже встановлюється.
installer-account-exists = Обліковий запис уже створено.

## Choosing what to install

installer-no-image = Немає образу { $variant } для встановлення.
installer-write-failed = Не вдалося записати { $path }

## Checking the destination

installer-drive-gone = Цей диск більше не під’єднано.
installer-drive-unusable = На цей диск не можна встановити Luft.
installer-system-gone = Цієї системи більше немає.
installer-system-unreplaceable = Luft поки що не може замінити { $system }.
installer-drive-running = Luft зараз запущено з цього диска, тому його не можна стерти.
installer-windows-unshrinkable = Windows на цьому диску не можна зменшити.
installer-size-wont-fit = Такий розмір не вміщується поруч із Windows.
installer-space-gone = Цього вільного місця більше немає.
installer-space-too-small = Цього вільного місця замало для Luft.

## Account and regional settings

installer-user-name-invalid = Це ім’я користувача не можна використати.
installer-full-name-invalid = Ім’я не може містити двокрапки, коми чи розриви рядків.
installer-password-missing = Задайте пароль.
installer-account-not-saved = Не вдалося зберегти новий обліковий запис
installer-account-missing = Новий обліковий запис відсутній
installer-regional-invalid = Недійсні регіональні параметри.
installer-unknown-zone = Нова система не знає часового поясу { $zone }.

## Installing

installer-esp-partition-failed = Не вдалося створити системний розділ EFI
installer-startup-partition-failed = Не вдалося створити розділ для файлів запуску Luft
installer-root-partition-failed = Не вдалося створити розділ для Luft
installer-encryption-failed = Не вдалося зашифрувати розділ для Luft
installer-shrink-failed = Не вдалося зменшити Windows
installer-no-esp = На диску немає системного розділу EFI
installer-no-root = Розділ для Luft не створено
installer-copy-failed = Не вдалося скопіювати Luft
installer-no-deployment = Нова система не має розгортання
installer-deployment-unnamed = Розгортання нової системи не має назви
installer-deployment-unopened = Не вдалося відкрити нову систему
installer-boot-menu-failed = Не вдалося записати меню завантаження Luft на системний розділ EFI
installer-key-queue-failed = Не вдалося підготувати ключ Secure Boot для Luft до наступного перезавантаження

## Replacing a Linux system

installer-encryption-keeps-old = Luft не можна зашифрувати, якщо поруч із ним залишаються файли старої системи.
installer-leftovers-failed = Не вдалося очистити залишки попередньої спроби
installer-default-failed = Не вдалося зробити Luft системою, яка запускається
installer-relabel-failed = Не вдалося позначити ваші файли для Luft
installer-set-aside-failed = Не вдалося відкласти стару систему

## Things packed with Meet Luft

installer-box-unopened = Не вдалося відкрити коробку з речами для переїзду
installer-box-no-list = У коробці для переїзду немає списку вмісту
installer-unpack-failed = Не вдалося розпакувати { $path }
installer-wallpaper-unnamed = Шпалери не мають назви
