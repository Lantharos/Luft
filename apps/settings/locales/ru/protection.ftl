## Shared buttons

settings-protection-cancel = Отмена
settings-protection-continue = Продолжить
settings-protection-close = Закрыть
settings-protection-restart = Перезагрузить
settings-protection-remove = Удалить
settings-protection-turn-on = Включить
settings-protection-set-up = Настроить

## Privacy: screen lock

settings-privacy-screen-lock = Блокировка экрана
settings-privacy-screen-off = Отключение экрана
settings-privacy-screen-off-hint = Настраивается в разделе «Питание и батарея»
settings-privacy-screen-off-after = { $duration } бездействия
settings-privacy-screen-off-never = Никогда
settings-privacy-lock-when-off = Блокировать экран при его отключении
settings-privacy-lock-after = Блокировать через
settings-privacy-lock-after-hint = Сколько ждать после отключения экрана
settings-privacy-lock-immediately = Сразу

## Privacy: location, camera and microphone

settings-privacy-location-services = Службы геолокации
settings-privacy-location-services-hint = Приложения могут определять, где вы находитесь, для карт, погоды и часового пояса
settings-privacy-camera-allow = Разрешить приложениям использовать камеру
settings-privacy-microphone-allow = Разрешить приложениям использовать микрофон

## Privacy: file history

settings-privacy-file-history = История файлов
settings-privacy-remember-files = Запоминать недавние файлы
settings-privacy-remember-files-hint = Приложения могут показывать последние открытые файлы
settings-privacy-keep-history = Хранить историю
settings-privacy-keep-forever = Всегда
settings-privacy-clear-history = Очистить историю
settings-privacy-clear-history-hint = Сразу забыть все файлы из списка
settings-privacy-clear = Очистить
settings-privacy-clear-title = Очистить историю файлов?
settings-privacy-clear-description = Приложения больше не будут показывать недавно открытые файлы. Сами файлы останутся на месте.

## Privacy: trash and temporary files

settings-privacy-cleanup = Корзина и временные файлы
settings-privacy-empty-trash = Автоматически очищать корзину
settings-privacy-delete-temp = Автоматически удалять временные файлы
settings-privacy-delete-temp-hint = Ваши файлы во временных папках, которые давно не использовались
settings-privacy-delete-after = Удалять через
settings-privacy-delete-after-hint = Сколько файлы хранятся до удаления

## Security: summary at the top of the page

settings-security-protections = Средства защиты
settings-security-protected = Устройство защищено
settings-security-could-be-safer = Устройство можно защитить лучше
settings-security-not-encrypted-description = Его диск не зашифрован, поэтому любой, кто его извлечёт, сможет прочитать ваши файлы.
settings-security-starts-differently-description = Если вы меняли настройки Secure Boot, подтвердите это, чтобы диск снова разблокировался сам.
settings-security-needed-recovery-key = Для диска потребовался ключ восстановления
settings-security-needed-recovery-key-description = Снова привяжите чип безопасности, чтобы диск разблокировался сам.
settings-security-firmware-ready-description = Обновления прошивки для вашего оборудования готовы в разделе «Обновления».
settings-security-encrypted-secure-boot = Диск зашифрован, а Secure Boot проверяет, как он запускается.
settings-security-encrypted = Диск зашифрован.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Запускать этот компьютер может только доверенное ПО
settings-security-chip = Чип безопасности
settings-security-chip-description = Хранит ключи и проверяет, как запускался этот компьютер
settings-firmware-updates-ready = Обновления прошивки готовы
settings-firmware-updates-count = { $count ->
    [one] { $count } обновление для вашего оборудования в разделе «Обновления»
    [few] { $count } обновления для вашего оборудования в разделе «Обновления»
    [many] { $count } обновлений для вашего оборудования в разделе «Обновления»
   *[other] { $count } обновления для вашего оборудования в разделе «Обновления»
}

## Security: signed startup

settings-security-signed-startup = Подписанная загрузка
settings-security-signed-startup-on = Меню загрузки и система подписаны для этого компьютера
settings-security-signed-startup-purpose = Запускаться может только ПО, подписанное для этого компьютера
settings-security-signed-startup-restart = Начнёт действовать после перезагрузки
settings-security-signed-startup-missed = При последней перезагрузке ключ не был добавлен
settings-security-signed-startup-pending = Добавьте ключ на синем экране при перезагрузке
settings-security-signed-startup-missed-often = Ключ не был добавлен после нескольких перезагрузок
settings-security-show-steps = Показать шаги
settings-security-try-again = Повторить

## Security: games with anti-cheat

settings-security-anti-cheat = Игры с античитом
settings-security-anti-cheat-ready = Готово для игр с античитом
settings-security-anti-cheat-removing = Удалите другие ключи на синем экране при перезагрузке
settings-security-anti-cheat-luft-key = Компания Epic ещё должна добавить ключ Luft в свой список
settings-security-anti-cheat-ready-description = Игры могут проверить, как запускался этот компьютер

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Удалите ключи при перезагрузке
settings-security-key-steps-add = Добавьте ключ при перезагрузке
settings-security-key-steps-remove-description = После перезагрузки появится синий экран с вопросом об удалении ключей. Он ждёт всего 10 секунд, поэтому сразу нажмите любую клавишу.
settings-security-key-steps-add-description = После перезагрузки появится синий экран с вопросом о новом ключе. Он ждёт всего 10 секунд, поэтому сразу нажмите любую клавишу.
settings-security-key-step-choose = Выберите { $option }, затем { $next }.
settings-security-key-step-confirm = Выберите { $option }.
settings-security-key-step-code = Введите код ниже и нажмите { $key }.
settings-security-key-step-reboot = Выберите { $option }.
settings-security-key-enter = Enter
settings-security-key-code = Код { $code }
settings-security-key-steps-remove-missed = Если вы не успеете, компьютер загрузится как обычно, и здесь можно будет попробовать ещё раз.
settings-security-key-steps-add-missed = Если вы не успеете, компьютер загрузится как обычно, а шаги появятся снова при следующей перезагрузке, уже с новым кодом.
settings-security-later = Позже
settings-security-restart-now = Перезагрузить сейчас

## Security: hardware security level

settings-security-hardware = Аппаратная защита
settings-security-hardware-level-0 = У оборудования мало доступных ему средств защиты
settings-security-hardware-level-1 = У оборудования есть базовая защита
settings-security-hardware-level-2 = У оборудования есть важные средства защиты
settings-security-hardware-level-3 = Оборудование хорошо защищено
settings-security-hardware-level-4 = Оборудование защищает себя во время работы
settings-security-hardware-level-5 = Оборудование защищает себя и может это подтвердить
settings-security-hardware-description = { $summary }: уровень { $level } из { $highest }.
settings-security-hardware-next = Для следующего уровня
settings-security-hardware-highest = Это самый высокий уровень.
settings-security-hardware-inactive = Сейчас не действует
settings-security-hardware-fix-maker = { $count ->
    [one] Добавить это может только производитель компьютера, обычно с обновлением прошивки:
    [few] Добавить это может только производитель компьютера, обычно с обновлением прошивки:
    [many] Добавить это может только производитель компьютера, обычно с обновлением прошивки:
   *[other] Добавить это может только производитель компьютера, обычно с обновлением прошивки:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Это можно включить в настройках прошивки компьютера:
    [few] Это можно включить в настройках прошивки компьютера:
    [many] Это можно включить в настройках прошивки компьютера:
   *[other] Это можно включить в настройках прошивки компьютера:
}
settings-security-hardware-fix-system = { $count ->
    [one] Это зависит от настройки системы:
    [few] Это зависит от настройки системы:
    [many] Это зависит от настройки системы:
   *[other] Это зависит от настройки системы:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Это недоступно на этом компьютере:
    [few] Это недоступно на этом компьютере:
    [many] Это недоступно на этом компьютере:
   *[other] Это недоступно на этом компьютере:
}

## Security: USB protection

settings-usb-hold-back = Задерживать новые USB-устройства
settings-usb-hold-back-description = Устройства, подключённые при заблокированном экране, ждут разблокировки

## Device encryption

settings-encryption = Шифрование устройства
settings-encryption-not-encrypted = Выключено
settings-encryption-not-encrypted-reinstall = Выключено, зашифровать этот компьютер можно только при повторной установке Luft
# Button that opens the steps to encrypt this computer
settings-encryption-turn-on = Включить
settings-encryption-after-restart = Шифрование начнётся после перезагрузки
settings-encryption-encrypting = Шифрование, готово { $percent }
settings-encryption-encrypting-paused = Шифрование приостановлено на { $percent }, пока компьютер не подключён к питанию
# Button that takes back the request to encrypt before the computer restarts
settings-encryption-dont-encrypt = Не шифровать
settings-encryption-turn-on-title = Зашифровать этот компьютер
settings-encryption-turn-on-blocked = Сейчас этот компьютер нельзя зашифровать
settings-encryption-turn-on-description = Ваши файлы останутся на месте.
settings-encryption-check-in-place = Luft может зашифровать свой раздел на месте.
settings-encryption-check-not-in-place = Раздел Luft нельзя зашифровать на месте. Установите Luft заново, чтобы зашифровать его.
settings-encryption-check-plugged-in = Компьютер подключён к питанию.
settings-encryption-check-on-battery = Подключите компьютер к питанию. Шифрование занимает время, и питание не должно пропасть посреди процесса.
settings-encryption-save-key-title = Сохраните ключ восстановления
settings-encryption-save-key-description = Храните его не на этом компьютере.
settings-encryption-unlock-title = Разблокировка
settings-encryption-unlock-chip = Чип безопасности разблокирует диск сам при запуске компьютера, пока ничто не меняет способ его запуска.
settings-encryption-unlock-passphrase = Выберите парольную фразу, которую вы будете вводить при каждом запуске компьютера.
settings-encryption-ready-title = Всё готово к шифрованию
settings-encryption-summary-room = Luft сейчас освобождает место на своём разделе, а шифрование начнётся после перезагрузки.
settings-encryption-summary-background = Затем шифрование идёт в фоне, пока вы пользуетесь компьютером. Не отключайте его от питания. Прерывание лишь приостанавливает процесс.
settings-encryption-summary-chip = Пока шифрование не завершено, чип безопасности хранит ключ восстановления, поэтому при перезагрузке ничего не запрашивается.
settings-encryption-summary-recovery-key = Пока шифрование не завершено, при запуске запрашивается ключ восстановления вместо парольной фразы.
# Button, verb: starts encrypting this computer
settings-encryption-encrypt = Зашифровать
settings-encryption-making-room = Освобождение места…
settings-encryption-unlocks-chip-pin = Разблокируется чипом безопасности и PIN-кодом
settings-encryption-unlocks-chip = Разблокируется чипом безопасности автоматически
settings-encryption-unlocks-passphrase = При запуске запрашивается парольная фраза
settings-encryption-unlocks-security-key = При запуске разблокируется ключом безопасности
settings-encryption-unlocks-recovery-key = При запуске запрашивается ключ восстановления

## Device encryption: other drives

settings-encryption-drives = Другие диски
settings-encryption-drives-hint = Шифруйте другие диски и USB-накопители в приложении Диски
settings-encryption-drives-open = Открыть Диски
settings-encryption-drive-encrypting = Шифрование диска, готово { $percent }
settings-encryption-drive-encrypting-paused = Шифрование диска приостановлено на { $percent }
settings-encryption-drive-decrypting = Расшифровка диска, готово { $percent }
settings-encryption-drive-decrypting-paused = Расшифровка диска приостановлена на { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } зашифрованный диск разблокируется вместе с этим компьютером
    [few] { $count } зашифрованных диска разблокируются вместе с этим компьютером
    [many] { $count } зашифрованных дисков разблокируются вместе с этим компьютером
   *[other] { $count } зашифрованного диска разблокируются вместе с этим компьютером
}

## Device encryption: unlocking the disk

settings-encryption-unlocking = Разблокировка диска
settings-encryption-starts-differently = Компьютер теперь запускается иначе
settings-encryption-starts-differently-description = Настройки Secure Boot изменились, поэтому диск запросил ключ восстановления. Если это сделали вы, подтвердите изменение, чтобы диск снова разблокировался сам
settings-encryption-confirm = Подтвердить
settings-encryption-asked-recovery-key = Диск запросил ключ восстановления
settings-encryption-relink-description = Снова привяжите чип безопасности, чтобы диск разблокировался сам
settings-encryption-relink = Привязать снова
settings-encryption-chip-unlock = Разблокировка чипом безопасности
settings-encryption-chip-unlock-on = Пока ничто не меняет способ запуска компьютера
settings-encryption-chip-unlock-off = Чтобы не вводить парольную фразу при запуске
settings-encryption-pin = PIN-код при запуске
settings-encryption-pin-description = Вводится до разблокировки диска
settings-encryption-change = Изменить
settings-encryption-add-pin-row = Добавить PIN-код при запуске
settings-encryption-add-pin-row-description = Диск останется заблокированным, даже если компьютер украдут
settings-encryption-add-pin = Добавить PIN-код
settings-encryption-new-key-description = У диска ещё не было ключа восстановления. Храните этот ключ не на этом компьютере.
settings-encryption-stop-chip-title = Больше не разблокировать чипом безопасности?
settings-encryption-stop-chip-passphrase = Компьютер будет запрашивать парольную фразу при каждом запуске.
settings-encryption-stop-chip-recovery-key = Компьютер будет запрашивать ключ восстановления при каждом запуске, поэтому держите его под рукой.
settings-encryption-stop-chip = Отключить разблокировку
settings-encryption-remove-pin-title = Удалить PIN-код?
settings-encryption-remove-pin-description = Диск снова будет разблокироваться сам при запуске компьютера.
settings-encryption-remove-pin = Удалить PIN-код
settings-encryption-unlock-disk-title = Разблокируйте диск
settings-encryption-unlock-disk-description = Для этого изменения нужен ключ восстановления или парольная фраза, которую вы вводите при запуске компьютера.
settings-encryption-unlock-disk-field = Ключ восстановления или парольная фраза

## Device encryption: security chip and PIN

settings-encryption-ask-pin = Также запрашивать PIN-код
settings-encryption-chip-setup-description = Чип безопасности компьютера сам разблокирует диск при запуске, и вводить парольную фразу больше не нужно.
settings-encryption-add-pin-title = Добавить PIN-код
settings-encryption-add-pin-description = Его нужно будет вводить при каждом запуске компьютера. Без него диск останется заблокированным, даже если украдут весь компьютер.
settings-encryption-change-pin-title = Изменить PIN-код
settings-encryption-change-pin-description = Новый PIN-код нужно будет вводить при каждом запуске компьютера.
settings-encryption-change-pin = Изменить PIN-код
settings-encryption-relink-title = Снова привязать чип безопасности
settings-encryption-relink-pin-description = Введите PIN-код, который хотите использовать при запуске.
settings-encryption-ask-pin-step = При запуске добавится ещё один шаг.
settings-encryption-pin-field = PIN-код
settings-encryption-new-pin-field = Новый PIN-код
settings-encryption-pin-length = От { $min } до { $max } цифр
settings-encryption-pin-digits-only = Используйте только цифры
settings-encryption-pin-too-short = { $min ->
    [one] Не менее { $min } цифры
    [few] Не менее { $min } цифр
    [many] Не менее { $min } цифр
   *[other] Не менее { $min } цифры
}
settings-encryption-pin-too-long = { $max ->
    [one] Не более { $max } цифры
    [few] Не более { $max } цифр
    [many] Не более { $max } цифр
   *[other] Не более { $max } цифры
}
settings-encryption-pins-differ = PIN-коды не совпадают
settings-encryption-confirm-field = Подтверждение
settings-encryption-type-again = Введите ещё раз

## Recovery key

settings-recovery-title = Ключ восстановления
settings-recovery-description = Даёт доступ, если диск не может разблокироваться сам
settings-recovery-show = Показать
settings-recovery-replace = Заменить
settings-recovery-replace-title = Заменить ключ восстановления?
settings-recovery-replace-description = Текущий ключ перестанет работать, и вы получите новый, который нужно сохранить.
settings-recovery-replace-key = Заменить ключ
settings-recovery-shown-title = Ваш ключ восстановления
settings-recovery-shown-description = Введите его, если компьютер при запуске запросит ключ восстановления. Храните копию не на этом компьютере.
settings-recovery-fresh-title = Сохраните новый ключ восстановления
settings-recovery-fresh-description = Прежний ключ больше не работает. Храните этот на бумаге или в менеджере паролей.

## Passwords and keys (the keyring)

settings-passwords-title = Пароли и ключи
settings-passwords-not-running = Связка ключей не запущена
settings-passwords-not-running-description = Пароли и ключи появятся здесь после её запуска
settings-passwords-locked = Заблокировано
settings-passwords-contents = { $count ->
    [0] Пока ничего не сохранено
    [one] { $count } пароль или ключ
    [few] { $count } пароля или ключа
    [many] { $count } паролей и ключей
   *[other] { $count } пароля или ключа
}
settings-passwords-protected-chip = Защищено паролем и чипом безопасности
settings-passwords-protected = Защищено паролем
settings-passwords-unlock = Разблокировать
settings-passwords-lock = Заблокировать
settings-passwords-seal-title = Запечатать чипом безопасности
settings-passwords-seal-description = Их копии нельзя будет открыть на другом компьютере
settings-passwords-seal = Запечатать
settings-passwords-fingerprint-on = Разблокируется отпечатком пальца
settings-passwords-fingerprint-on-description = Вход по отпечатку разблокирует и пароли
settings-passwords-fingerprint = Разблокировка отпечатком пальца
settings-passwords-fingerprint-description = Сначала добавьте отпечаток в разделе «Пользователи»
settings-passwords-pin = Запрашивать PIN-код после отпечатка
settings-passwords-pin-locked = Разблокируйте связку ключей, чтобы изменить это
settings-passwords-pin-description = Чтобы одного отпечатка было недостаточно для разблокировки
settings-passwords-lock-with-screen = Блокировать вместе с экраном
settings-passwords-lock-with-screen-description = Блокируются и разблокируются вместе с экраном
settings-passwords-apps = Данные входа и активность приложений
settings-passwords-apps-locked = Разблокируйте связку ключей, чтобы их увидеть
settings-passwords-apps-description = Что приложения хранят здесь и когда это использовали
settings-passwords-apps-allowed = Какие приложения могут использовать ваши пароли
settings-passwords-apps-allowed-hint = Настраивается в разделе «Приложения»

## Passwords and keys: apps with access

settings-passwords-stores = Данные входа приложений
settings-passwords-stores-description = Данные для входа, которые некоторые приложения хранят здесь. Прочитать их может только само приложение.
settings-passwords-stores-count = { $count ->
    [one] Сохранено данных для входа: { $count }
    [few] Сохранено данных для входа: { $count }
    [many] Сохранено данных для входа: { $count }
   *[other] Сохранено данных для входа: { $count }
}
settings-passwords-forget = Забыть
settings-passwords-forget-title = Забыть данные приложения { $app }?
settings-passwords-forget-description = Приложение { $app } потеряет сохранённые здесь данные для входа, и, возможно, в нём придётся войти снова.

## Passwords and keys: recent access

settings-passwords-history = Недавний доступ
settings-passwords-history-read = Приложение { $app } использовало «{ $item }»
settings-passwords-history-read-unnamed = Приложение { $app } использовало сохранённый пароль
settings-passwords-history-saved = Приложение { $app } сохранило «{ $item }»
settings-passwords-history-saved-unnamed = Приложение { $app } сохранило пароль
settings-passwords-history-deleted = Приложение { $app } удалило «{ $item }»
settings-passwords-history-deleted-unnamed = Приложение { $app } удалило сохранённый пароль
settings-passwords-history-denied = Приложению { $app } не разрешено использовать «{ $item }»
settings-passwords-history-denied-unnamed = Приложению { $app } не разрешено использовать сохранённый пароль
settings-passwords-history-signed = Приложение { $app } подписало данные ключом «{ $item }»
settings-passwords-history-signed-unnamed = Приложение { $app } подписало данные сохранённым паролем
settings-passwords-history-fewer = Показать меньше
settings-passwords-history-all = { $count ->
    [one] Показать все ({ $count })
    [few] Показать все ({ $count })
    [many] Показать все ({ $count })
   *[other] Показать все ({ $count })
}
settings-passwords-history-clear = Очистить историю
settings-passwords-history-clear-description = Забыть, какие приложения и когда использовали связку ключей
settings-passwords-history-clear-button = Очистить
settings-passwords-history-clear-title = Очистить недавний доступ?
settings-passwords-history-clear-confirm = Список того, какие приложения и когда использовали связку ключей, будет удалён. Сохранённые пароли и ключи останутся без изменений.

## Passwords and keys: SSH keys

settings-passwords-ssh = Ключи SSH
settings-passwords-ssh-description = Ключи для входа на серверы, надёжно хранящиеся в связке ключей.
settings-passwords-ssh-unnamed = Ключ без названия
settings-passwords-ssh-in-chip = Хранится в чипе безопасности
settings-passwords-ssh-added = Добавлен { $when }
settings-passwords-ssh-copy = Копировать открытый ключ { $name }
settings-passwords-ssh-remove = Удалить { $name }
settings-passwords-ssh-confirm = Спрашивать перед каждым использованием
settings-passwords-ssh-confirm-label = Спрашивать перед каждым использованием ключа { $name }
settings-passwords-ssh-add-row = Добавить ключ
settings-passwords-ssh-use = Использовать эти ключи в SSH
settings-passwords-ssh-use-description = Скопируйте строку, которая указывает SSH на них
settings-passwords-ssh-copy-line = Копировать { $line }
settings-passwords-ssh-remove-title = Удалить «{ $name }»?
settings-passwords-ssh-remove-chip = Ключ хранится только в чипе безопасности этого компьютера, поэтому будет удалён навсегда. Серверы, которые принимают только этот ключ, больше не пустят вас с ним.
settings-passwords-ssh-remove-description = Серверы, которые принимают только этот ключ, больше не пустят вас с ним. Это действие нельзя отменить.
settings-passwords-ssh-add-title = Добавить ключ SSH
settings-passwords-ssh-add-description = Новый ключ будет создан на этом компьютере. Скопируйте его открытый ключ на серверы, на которые хотите входить.
settings-passwords-ssh-name = Название
settings-passwords-ssh-name-placeholder = Например, рабочий ноутбук
settings-passwords-ssh-chip = Хранить в чипе безопасности
settings-passwords-ssh-chip-description = Его нельзя будет скопировать с этого компьютера, даже вам
settings-passwords-ssh-chip-unsupported = Чип безопасности этого компьютера не может хранить ключи SSH
settings-passwords-ssh-add = Добавить ключ

## Passkeys

settings-passkeys-title = Ключи доступа
settings-passkeys-unavailable = Разблокируйте связку ключей, чтобы увидеть ключи доступа.
settings-passkeys-chip-fingerprint = Запечатаны чипом безопасности этого компьютера. При каждом входе запрашивается отпечаток пальца или пароль.
settings-passkeys-chip-password = Запечатаны чипом безопасности этого компьютера. При каждом входе запрашивается пароль.
settings-passkeys-password-fingerprint = Зашифрованы вашим паролем. При каждом входе запрашивается отпечаток пальца или пароль.
settings-passkeys-password = Зашифрованы вашим паролем. При каждом входе запрашивается пароль.
settings-passkeys-last-used = Последнее использование: { $when }
settings-passkeys-never-used = Не использовался
settings-passkeys-password-only = Защищён паролем
settings-passkeys-unreachable = Браузеры не могут получить доступ к ключам доступа
settings-passkeys-unreachable-description = Доступ вернётся, когда служба ключей доступа запустится
settings-passkeys-rename-label = Переименовать ключ доступа для { $site }
settings-passkeys-remove-label = Удалить ключ доступа для { $site }
settings-passkeys-empty = Ключей доступа пока нет
settings-passkeys-empty-description = Ключи, которые создают сайты, сохраняются здесь для всех браузеров
settings-passkeys-remove-title = Удалить этот ключ доступа?
settings-passkeys-remove-description = С ним больше не получится войти на { $site }, поэтому убедитесь, что у вас есть другой способ входа.
settings-passkeys-rename-title = Переименовать ключ доступа
settings-passkeys-rename-description = Дайте ключу доступа для { $site } понятное вам название.
settings-passkeys-name = Название
settings-passkeys-save = Сохранить

## Apps

settings-apps-defaults = Приложения по умолчанию
settings-apps-defaults-description = Открывают ссылки, файлы и папки
settings-apps-browser = Браузер
settings-apps-email = Электронная почта
settings-apps-calendar = Календарь
settings-apps-music = Музыка
settings-apps-videos = Видео
settings-apps-photos = Фото
settings-apps-text-editor = Текстовый редактор
settings-apps-files = Файлы
settings-apps-archives = Архивы
settings-apps-choose = Выберите
settings-apps-startup = Автозапуск
settings-apps-startup-description = Эти приложения открываются при входе в систему
settings-apps-startup-app = Открывать приложение { $app } при входе
settings-apps-startup-add = Добавить приложение
settings-apps-startup-add-title = Добавить приложение в автозапуск
settings-apps-startup-add-description = Выберите приложение, которое будет открываться при каждом входе в систему.
settings-apps-search = Поиск приложений
settings-apps-no-match = Приложения не найдены
settings-apps-cancel = Отмена

## Apps: permissions

settings-apps-permissions = Разрешения
settings-apps-location = Местоположение
settings-apps-camera = Камера
settings-apps-clipboard = Буфер обмена в фоне
settings-apps-full-access = Полный доступ
settings-apps-full-access-hint = Работает вне песочницы и может всё, что может запущенная вами программа. Отмена вступит в силу при следующем запуске.
settings-apps-full-access-remove = Отозвать
settings-apps-full-access-remove-app = Отозвать полный доступ у { $app }
settings-apps-passwords = Сохранённые пароли
settings-apps-passwords-forget = Сбросить
settings-apps-passwords-forget-app = Пусть { $app } спросит снова
settings-apps-permissions-allowed = Разрешено: { $allowed } из { $total }
settings-apps-permissions-description = Приложения в песочнице получают свои файлы и только то, что вы разрешите здесь.
settings-apps-sandbox-only = Ничего за пределами песочницы
settings-apps-folders = Папки
settings-apps-folders-hint = Со следующего запуска оно сможет читать и изменять всё в этих папках.
settings-apps-folders-count = { $count ->
    [one] { $count } папка
    [few] { $count } папки
    [many] { $count } папок
   *[other] { $count } папки
}
settings-apps-folder-add = Добавить папку
settings-apps-folder-remove = Убрать
settings-apps-folder-remove-app = Перестать открывать доступ к { $folder }
settings-apps-usb = USB-устройства
settings-apps-usb-hint = Например, ключи безопасности, телефоны и микроконтроллеры
settings-apps-serial = Последовательные устройства
settings-apps-serial-hint = Например, 3D-принтеры и платы, подключённые по USB
settings-apps-folder-read-only = Только чтение
settings-apps-downloads = Папка «Загрузки»
settings-apps-downloads-hint = Может сохранять файлы в папку «Загрузки» и открывать находящиеся там, со следующего запуска.
settings-apps-internet = Интернет
settings-apps-internet-hint = Может выходить в интернет со следующего запуска.
settings-apps-service-hint = Служба рабочего стола, с которой оно может общаться
settings-apps-service-remove = Убрать
settings-apps-service-remove-app = Запретить общение с { $service }
settings-apps-services-count = { $count ->
    [one] { $count } служба
    [few] { $count } службы
    [many] { $count } служб
   *[other] { $count } службы
}
settings-apps-full-access-off = Работает в песочнице. Полный доступ убирает песочницу.
settings-apps-full-access-give = Дать полный доступ
