## Shared buttons

settings-protection-cancel = Отмена
settings-protection-continue = Продолжить
settings-protection-close = Закрыть
settings-protection-done = Готово
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

settings-privacy-location = Местоположение
settings-privacy-location-services = Службы геолокации
settings-privacy-location-services-hint = Приложения могут определять, где вы находитесь, для карт, погоды и часового пояса
settings-privacy-camera = Камера
settings-privacy-camera-allow = Разрешить приложениям использовать камеру
settings-privacy-microphone = Микрофон
settings-privacy-microphone-allow = Разрешить приложениям использовать микрофон
settings-privacy-apps-asked = Запрашивавшие приложения
settings-privacy-apps-allowed = Разрешено: { $allowed } из { $total }

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

settings-security-protected = Устройство защищено
settings-security-encrypting = Шифрование устройства
settings-security-encrypting-progress = { $progress }. Можно продолжать работу.
settings-security-decrypting = Отключение шифрования устройства
settings-security-restart-to-encrypt = Перезагрузите компьютер, чтобы начать шифрование
settings-security-restart-to-encrypt-description = Шифрование начнётся при следующей перезагрузке компьютера.
settings-security-encryption-failed = Шифрование не началось
settings-security-encryption-failed-description = Система Luft запустилась без него, ваши файлы не изменены. Включите шифрование снова, чтобы попробовать ещё раз.
settings-security-could-be-safer = Устройство можно защитить лучше
settings-security-could-be-safer-description = Включите шифрование устройства, чтобы ваши файлы оставались недоступны посторонним.
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
settings-encryption-encrypting = Шифрование этого устройства
settings-encryption-decrypting = Отключение шифрования устройства
settings-encryption-starting = Начнётся при следующей перезагрузке
settings-encryption-failed = Не началось при последней перезагрузке, ваши файлы не изменены
settings-encryption-off = Защищает ваши файлы, если компьютер потеряется
settings-encryption-progress = Готово { $percent }
settings-encryption-progress-seconds = Готово { $percent }, осталось меньше минуты
settings-encryption-progress-minutes = { $minutes ->
    [one] Готово { $percent }, осталось около { $minutes } минуты
    [few] Готово { $percent }, осталось около { $minutes } минут
    [many] Готово { $percent }, осталось около { $minutes } минут
   *[other] Готово { $percent }, осталось около { $minutes } минуты
}
settings-encryption-progress-hours = { $hours ->
    [one] Готово { $percent }, осталось около { $hours } часа
    [few] Готово { $percent }, осталось около { $hours } часов
    [many] Готово { $percent }, осталось около { $hours } часов
   *[other] Готово { $percent }, осталось около { $hours } часа
}
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

## Device encryption: turning it on

settings-encryption-turn-on-title = Включить шифрование устройства
settings-encryption-turn-on-description = Ваши файлы останутся недоступны посторонним, если компьютер потеряется или его украдут. Без нужного ключа никто не сможет прочитать диск.
settings-encryption-blocked-title = Шифрование устройства пока нельзя включить
settings-encryption-blocked-description = Устраните то, что отмечено ниже, и попробуйте ещё раз.
settings-encryption-checking = Проверка компьютера…
settings-encryption-backup = Перед началом убедитесь, что у важных файлов есть резервные копии.
settings-encryption-key-title = Сохраните ключ восстановления
settings-encryption-key-description = Если диск не сможет разблокироваться сам, например после ремонта, этот ключ вернёт вам доступ. Храните его не на этом компьютере.
settings-encryption-unlock-title = Разблокировка при запуске
settings-encryption-unlock-description = Чип безопасности сам разблокирует диск при запуске, поэтому вход в систему не изменится.
settings-encryption-passphrase-title = Придумайте парольную фразу
settings-encryption-passphrase-description = Этот компьютер не может разблокировать диск сам, поэтому будет запрашивать парольную фразу при каждом запуске.
settings-encryption-summary-title = Всё готово к шифрованию
settings-encryption-summary-description = Вот что будет дальше.
settings-encryption-step-restart = Компьютер один раз перезагрузится.
settings-encryption-step-screen = Во время запуска ненадолго появится экран «Encrypting your device».
settings-encryption-step-background = Остальное происходит в фоне, пока вы работаете.
settings-encryption-step-plugged-in = Не отключайте компьютер от сети до завершения.
settings-encryption-ask-pin = Также запрашивать PIN-код
settings-encryption-ask-pin-description = Диск останется заблокированным, даже если компьютер украдут. PIN-код будет запрошен после завершения шифрования.
settings-encryption-back = Назад
settings-encryption-starting-button = Запуск…
settings-encryption-restart-and-encrypt = Перезагрузить и зашифровать

## Device encryption: turning it off

settings-encryption-turn-off-title = Отключить шифрование устройства?
settings-encryption-turn-off-description = Файлы будут расшифрованы в фоне, пока вы работаете. После этого любой, кто извлечёт диск, сможет его прочитать.
settings-encryption-keep = Оставить шифрование
settings-encryption-turning-off = Отключение…
settings-encryption-turn-off = Отключить

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
settings-encryption-passphrase-field = Парольная фраза
settings-encryption-passphrase-length = { $min ->
    [one] Не менее { $min } символа
    [few] Не менее { $min } символов
    [many] Не менее { $min } символов
   *[other] Не менее { $min } символа
}
settings-encryption-passphrases-differ = Парольные фразы не совпадают

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
settings-recovery-saved = Ключ восстановления сохранён

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
settings-passwords-apps = Приложения с доступом
settings-passwords-apps-locked = Разблокируйте связку ключей, чтобы их увидеть
settings-passwords-apps-asked = { $count ->
    [0] Пока ни одно приложение не запрашивало доступ
    [one] Доступ запросило { $count } приложение
    [few] Доступ запросили { $count } приложения
    [many] Доступ запросили { $count } приложений
   *[other] Доступ запросили { $count } приложения
}

## Passwords and keys: apps with access

settings-passwords-access-back = Безопасность
settings-passwords-access-description = Если убрать приложение из списка, в следующий раз оно снова спросит.
settings-passwords-access-not-allowed = Не разрешено
settings-passwords-access-none = Пока ни одно приложение не запрашивало ваши пароли
settings-passwords-access-revoke = Запретить приложению { $app } использовать { $item }
settings-passwords-access-reset = Разрешить приложению { $app } снова запросить { $item }
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
