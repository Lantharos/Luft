## Errors shown in Install Luft and first-run setup

installer-not-allowed = У вас нет прав на это действие.
installer-stopped = Установщик неожиданно остановился.
installer-request-invalid = Недопустимый запрос: { $error }
installer-settings-invalid = Недопустимые параметры: { $error }
installer-busy = Система Luft уже устанавливается.
installer-account-exists = Учётная запись уже создана.

## Choosing what to install

installer-no-image = Нет образа { $variant } для установки.
installer-write-failed = Не удалось записать { $path }

## Checking the destination

installer-drive-gone = Этот диск больше не подключён.
installer-drive-unusable = На этот диск нельзя установить Luft.
installer-system-gone = Этой системы больше нет.
installer-system-unreplaceable = Luft пока не может заменить { $system }.
installer-drive-running = Система Luft сейчас запущена с этого диска, поэтому его нельзя стереть.
installer-windows-unshrinkable = Windows на этом диске нельзя уменьшить.
installer-size-wont-fit = Такой размер не помещается рядом с Windows.
installer-space-gone = Этого свободного места больше нет.
installer-space-too-small = Этого свободного места мало для Luft.

## Account and regional settings

installer-user-name-invalid = Это имя пользователя нельзя использовать.
installer-full-name-invalid = Имя не может содержать двоеточия, запятые или переносы строк.
installer-password-missing = Задайте пароль.
installer-account-not-saved = Новая учётная запись не сохранена
installer-account-missing = Новая учётная запись не найдена
installer-regional-invalid = Недопустимые региональные параметры.
installer-unknown-zone = Новой системе неизвестен часовой пояс { $zone }.

## Installing

installer-esp-partition-failed = Не удалось создать системный раздел EFI
installer-startup-partition-failed = Не удалось создать раздел для загрузочных файлов Luft
installer-root-partition-failed = Не удалось создать раздел для Luft
installer-shrink-failed = Не удалось уменьшить Windows
installer-no-esp = На диске нет системного раздела EFI
installer-no-root = Раздел для Luft не создан
installer-copy-failed = Не удалось скопировать Luft
installer-no-deployment = В новой системе нет развёртывания
installer-deployment-unnamed = У развёртывания новой системы нет имени
installer-deployment-unopened = Не удалось открыть новую систему
installer-boot-menu-failed = Не удалось записать меню загрузки Luft в системный раздел EFI
installer-key-queue-failed = Не удалось подготовить ключ Secure Boot для Luft к следующей перезагрузке

## Replacing a Linux system

installer-leftovers-failed = Не удалось удалить то, что осталось от предыдущей попытки
installer-default-failed = Не удалось сделать Luft системой, запускаемой по умолчанию
installer-relabel-failed = Не удалось подготовить метки ваших файлов для Luft
installer-set-aside-failed = Не удалось отложить старую систему

## Things packed with Meet Luft

installer-box-unopened = Не удалось открыть коробку для переезда
installer-box-no-list = В коробке для переезда нет списка содержимого
installer-unpack-failed = Не удалось распаковать { $path }
installer-wallpaper-unnamed = У обоев нет имени
