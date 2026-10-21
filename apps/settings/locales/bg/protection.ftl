## Shared buttons

settings-protection-cancel = Отказ
settings-protection-continue = Продължи
settings-protection-close = Затвори
settings-protection-restart = Рестартирай
settings-protection-remove = Премахни
settings-protection-turn-on = Включи
settings-protection-set-up = Настрой

## Privacy: screen lock

settings-privacy-screen-lock = Заключване на екрана
settings-privacy-screen-off = Изключване на екрана
settings-privacy-screen-off-hint = Задава се в Захранване и батерия
settings-privacy-screen-off-after = След { $duration }
settings-privacy-screen-off-never = Никога
settings-privacy-lock-when-off = Заключване на екрана, когато се изключи
settings-privacy-lock-after = Заключване след
settings-privacy-lock-after-hint = Колко време да се изчака, след като екранът се изключи
settings-privacy-lock-immediately = Веднага

## Privacy: location, camera and microphone

settings-privacy-location = Местоположение
settings-privacy-location-services = Услуги за местоположение
settings-privacy-location-services-hint = Позволява на приложенията да определят къде се намирате – за карти, времето и часови зони
settings-privacy-camera = Камера
settings-privacy-camera-allow = Достъп на приложенията до камерата
settings-privacy-microphone-allow = Достъп на приложенията до микрофона
settings-privacy-apps-asked = Приложения, поискали достъп
settings-privacy-apps-allowed = Разрешени: { $allowed } от { $total }

## Privacy: file history

settings-privacy-file-history = История на файловете
settings-privacy-remember-files = Запомняне на последно използваните файлове
settings-privacy-remember-files-hint = Приложенията могат да показват файловете, които сте отваряли последно
settings-privacy-keep-history = Пазене на историята за
settings-privacy-keep-forever = Завинаги
settings-privacy-clear-history = Изчистване на историята
settings-privacy-clear-history-hint = Забравя веднага всички файлове от списъка
settings-privacy-clear = Изчисти
settings-privacy-clear-title = Да се изчисти ли историята на файловете?
settings-privacy-clear-description = Приложенията вече няма да показват последно отваряните от вас файлове. Самите файлове остават там, където са.

## Privacy: trash and temporary files

settings-privacy-cleanup = Кошче и временни файлове
settings-privacy-empty-trash = Автоматично изпразване на кошчето
settings-privacy-delete-temp = Автоматично изтриване на временните файлове
settings-privacy-delete-temp-hint = Вашите файлове във временни папки, които не са използвани скоро
settings-privacy-delete-after = Изтриване след
settings-privacy-delete-after-hint = Колко време остават файловете, преди да бъдат премахнати

## Security: summary at the top of the page

settings-security-protected = Устройството ви е защитено
settings-security-encrypting = Устройството ви се шифрова
settings-security-encrypting-progress = { $progress }. Можете да продължите работа, докато приключи.
settings-security-decrypting = Шифроването на устройството се изключва
settings-security-restart-to-encrypt = Рестартирайте, за да започне шифроването
settings-security-restart-to-encrypt-description = Шифроването започва при следващото рестартиране на компютъра.
settings-security-encryption-failed = Шифроването не започна
settings-security-encryption-failed-description = Luft стартира без него и файловете ви не са променени. Включете го отново, за да опитате пак.
settings-security-could-be-safer = Устройството ви може да е по-защитено
settings-security-could-be-safer-description = Включете шифроването на устройството, за да пазите файловете си поверителни.
settings-security-starts-differently-description = Ако сте променили настройките на Secure Boot, потвърдете промяната, за да може дискът отново да се отключва сам.
settings-security-needed-recovery-key = Дискът ви поиска ключа за възстановяване
settings-security-needed-recovery-key-description = Свържете отново чипа за сигурност, за да се отключва сам.
settings-security-firmware-ready-description = Актуализациите на фърмуера за хардуера ви са готови в Актуализации.
settings-security-encrypted-secure-boot = Дискът ви е шифрован и Secure Boot проверява как стартира компютърът.
settings-security-encrypted = Дискът ви е шифрован.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Компютърът може да се стартира само от доверен софтуер
settings-security-chip = Чип за сигурност
settings-security-chip-description = Пази ключовете и проверява как е стартирал компютърът
settings-firmware-updates-ready = Има готови актуализации на фърмуера
settings-firmware-updates-count = { $count ->
    [one] { $count } актуализация за хардуера ви в Актуализации
   *[other] { $count } актуализации за хардуера ви в Актуализации
}

## Security: signed startup

settings-security-signed-startup = Подписано стартиране
settings-security-signed-startup-on = Менюто за стартиране и системата са подписани за този компютър
settings-security-signed-startup-purpose = Компютърът стартира само софтуер, подписан за него
settings-security-signed-startup-restart = Започва да се използва след рестартиране
settings-security-signed-startup-missed = Ключът не беше добавен при последното рестартиране
settings-security-signed-startup-pending = Добавете ключа на синия екран при рестартиране
settings-security-signed-startup-missed-often = Ключът не беше добавен след няколко рестартирания
settings-security-show-steps = Покажи стъпките
settings-security-try-again = Опитай отново

## Security: games with anti-cheat

settings-security-anti-cheat = Игри със защита срещу измами
settings-security-anti-cheat-ready = Готово за игри със защита срещу измами
settings-security-anti-cheat-removing = Премахнете другите ключове на синия екран при рестартиране
settings-security-anti-cheat-luft-key = Epic все още трябва да добави ключа на Luft в списъка си
settings-security-anti-cheat-ready-description = Игрите могат да проверят как е стартирал компютърът

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Премахнете ключовете при рестартиране
settings-security-key-steps-add = Добавете ключа при рестартиране
settings-security-key-steps-remove-description = След рестартиране син екран ще ви попита за премахване на ключове. Той чака само 10 секунди, затова натиснете произволен клавиш веднага щом се появи.
settings-security-key-steps-add-description = След рестартиране син екран ще ви попита за нов ключ. Той чака само 10 секунди, затова натиснете произволен клавиш веднага щом се появи.
settings-security-key-step-choose = Изберете { $option }, след това { $next }.
settings-security-key-step-confirm = Изберете { $option }.
settings-security-key-step-code = Въведете кода по-долу и натиснете { $key }.
settings-security-key-step-reboot = Изберете { $option }.
settings-security-key-enter = Enter
settings-security-key-code = Код { $code }
settings-security-key-steps-remove-missed = Ако го пропуснете, компютърът стартира както обикновено и можете да опитате отново оттук.
settings-security-key-steps-add-missed = Ако го пропуснете, компютърът стартира както обикновено, а стъпките се показват отново при следващото рестартиране, с нов код.
settings-security-later = По-късно
settings-security-restart-now = Рестартирай сега

## Security: hardware security level

settings-security-hardware = Хардуерна сигурност
settings-security-hardware-level-0 = Хардуерът ви има малко от възможните защити
settings-security-hardware-level-1 = Хардуерът ви има основните защити
settings-security-hardware-level-2 = Хардуерът ви има важните защити
settings-security-hardware-level-3 = Хардуерът ви е добре защитен
settings-security-hardware-level-4 = Хардуерът ви се пази сам, докато работи
settings-security-hardware-level-5 = Хардуерът ви се пази сам и може да го докаже
settings-security-hardware-description = { $summary }, ниво { $level } от { $highest }.
settings-security-hardware-next = За следващото ниво
settings-security-hardware-highest = Това е най-високото възможно ниво.
settings-security-hardware-inactive = В момента не са активни
settings-security-hardware-fix-maker = { $count ->
    [one] Само производителят на компютъра може да добави това, обикновено с актуализация на фърмуера:
   *[other] Само производителят на компютъра може да добави тези, обикновено с актуализация на фърмуера:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Това може да се включи в настройките на фърмуера на компютъра:
   *[other] Тези могат да се включат в настройките на фърмуера на компютъра:
}
settings-security-hardware-fix-system = { $count ->
    [one] Това зависи от това как е настроена системата:
   *[other] Тези зависят от това как е настроена системата:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Това не е налично на този компютър:
   *[other] Тези не са налични на този компютър:
}

## Security: USB protection

settings-usb-hold-back = Задържане на нови USB устройства
settings-usb-hold-back-description = Включените, докато е заключено, изчакват да отключите

## Device encryption

settings-encryption = Шифроване на устройството
settings-encryption-encrypting = Устройството се шифрова
settings-encryption-decrypting = Шифроването на устройството се изключва
settings-encryption-starting = Започва при следващото рестартиране
settings-encryption-failed = Не започна при последното рестартиране, файловете ви не са променени
settings-encryption-off = Пази файловете ви поверителни, ако компютърът бъде изгубен
settings-encryption-progress = Готово: { $percent }
settings-encryption-progress-seconds = Готово: { $percent }, остава по-малко от минута
settings-encryption-progress-minutes = { $minutes ->
    [one] Готово: { $percent }, остава около { $minutes } минута
   *[other] Готово: { $percent }, остават около { $minutes } минути
}
settings-encryption-progress-hours = { $hours ->
    [one] Готово: { $percent }, остава около { $hours } час
   *[other] Готово: { $percent }, остават около { $hours } часа
}
settings-encryption-unlocks-chip-pin = Отключва се с чипа за сигурност и вашия ПИН
settings-encryption-unlocks-chip = Отключва се сам с чипа за сигурност
settings-encryption-unlocks-passphrase = Иска паролата за диска при стартиране
settings-encryption-unlocks-security-key = Отключва се с вашия ключ за сигурност при стартиране
settings-encryption-unlocks-recovery-key = Иска ключа за възстановяване при стартиране

## Device encryption: other drives

settings-encryption-drives = Други дискове
settings-encryption-drives-hint = Шифровайте други дискове и USB флашки в Дискове
settings-encryption-drives-open = Отвори Дискове
settings-encryption-drive-encrypting = Шифроване на диск, готово: { $percent }
settings-encryption-drive-encrypting-paused = Шифроване на диск, на пауза при { $percent }
settings-encryption-drive-decrypting = Дешифроване на диск, готово: { $percent }
settings-encryption-drive-decrypting-paused = Дешифроване на диск, на пауза при { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } шифрован диск се отключва с този компютър
   *[other] { $count } шифровани диска се отключват с този компютър
}

## Device encryption: turning it on

settings-encryption-turn-on-title = Включване на шифроването на устройството
settings-encryption-turn-on-description = Файловете ви остават поверителни, ако компютърът бъде изгубен или откраднат. Без правилния ключ никой не може да прочете диска.
settings-encryption-blocked-title = Шифроването на устройството все още не може да се включи
settings-encryption-blocked-description = Погрижете се за отбелязаното по-долу и опитайте отново.
settings-encryption-backup = Преди да започнете, се уверете, че важните ви файлове имат резервно копие.
settings-encryption-key-title = Запазете ключа за възстановяване
settings-encryption-key-description = Ако дискът някога не може да се отключи сам, например след ремонт, този ключ ще ви върне достъпа. Пазете го на място извън този компютър.
settings-encryption-unlock-title = Отключване при стартиране
settings-encryption-unlock-description = Чипът за сигурност отключва диска сам при стартиране, така че входът остава същият.
settings-encryption-passphrase-title = Изберете парола за диска
settings-encryption-passphrase-description = Този компютър не може да отключи диска сам, затова ще иска тази парола при всяко стартиране.
settings-encryption-summary-title = Готово за шифроване
settings-encryption-summary-description = Ето какво следва.
settings-encryption-step-restart = Компютърът се рестартира веднъж.
settings-encryption-step-screen = При стартиране за кратко се появява екран с надпис „Encrypting your device“.
settings-encryption-step-background = Останалото става във фонов режим, докато продължавате работа.
settings-encryption-step-plugged-in = Дръжте компютъра включен в захранването, докато приключи.
settings-encryption-ask-pin = Искане и на ПИН
settings-encryption-ask-pin-description = Дискът остава заключен, дори ако някой вземе компютъра. ПИН се иска, след като шифроването приключи.
settings-encryption-starting-button = Започване…
settings-encryption-restart-and-encrypt = Рестартирай и шифровай

## Device encryption: turning it off

settings-encryption-turn-off-title = Да се изключи ли шифроването на устройството?
settings-encryption-turn-off-description = Файловете ви се дешифроват във фонов режим, докато работите. След това всеки, който извади диска, може да го прочете.
settings-encryption-keep = Запази шифроването
settings-encryption-turning-off = Изключване…
settings-encryption-turn-off = Изключи

## Device encryption: unlocking the disk

settings-encryption-unlocking = Отключване на диска
settings-encryption-starts-differently = Компютърът вече стартира по различен начин
settings-encryption-starts-differently-description = Настройките на Secure Boot са променени, затова дискът поиска ключа за възстановяване. Ако вие сте направили промяната, потвърдете я, за да се отключва отново сам
settings-encryption-confirm = Потвърди
settings-encryption-asked-recovery-key = Дискът ви поиска ключа за възстановяване
settings-encryption-relink-description = Свържете отново чипа за сигурност, за да се отключва сам
settings-encryption-relink = Свържи отново
settings-encryption-chip-unlock = Отключване с чипа за сигурност
settings-encryption-chip-unlock-on = Докато нищо не промени начина, по който стартира компютърът
settings-encryption-chip-unlock-off = За да не въвеждате парола за диска при стартиране
settings-encryption-pin = ПИН при стартиране
settings-encryption-pin-description = Въвеждате го, преди дискът да се отключи
settings-encryption-change = Промени
settings-encryption-add-pin-row = Добавяне на ПИН при стартиране
settings-encryption-add-pin-row-description = Дискът остава заключен, дори ако компютърът бъде взет
settings-encryption-add-pin = Добави ПИН
settings-encryption-new-key-description = Дискът ви още нямаше ключ за възстановяване. Пазете този на място извън този компютър.
settings-encryption-stop-chip-title = Да се спре ли отключването с чипа за сигурност?
settings-encryption-stop-chip-passphrase = Компютърът ще иска паролата за диска при всяко стартиране.
settings-encryption-stop-chip-recovery-key = Компютърът ще иска ключа за възстановяване при всяко стартиране, затова го дръжте под ръка.
settings-encryption-stop-chip = Спри отключването
settings-encryption-remove-pin-title = Да се премахне ли ПИН?
settings-encryption-remove-pin-description = Дискът отново ще се отключва сам при стартиране на компютъра.
settings-encryption-remove-pin = Премахни ПИН
settings-encryption-unlock-disk-title = Отключете диска
settings-encryption-unlock-disk-description = Тази промяна изисква ключа за възстановяване или паролата за диска, която въвеждате при стартиране на компютъра.
settings-encryption-unlock-disk-field = Ключ за възстановяване или парола за диска

## Device encryption: security chip and PIN

settings-encryption-chip-setup-description = Чипът за сигурност в компютъра отключва диска сам при стартиране, така че вече не въвеждате парола за диска.
settings-encryption-add-pin-title = Добавяне на ПИН
settings-encryption-add-pin-description = Ще го въвеждате при всяко стартиране на компютъра. Без него дискът остава заключен, дори ако някой вземе целия компютър.
settings-encryption-change-pin-title = Промяна на ПИН
settings-encryption-change-pin-description = Ще въвеждате новия ПИН при всяко стартиране на компютъра.
settings-encryption-change-pin = Промени ПИН
settings-encryption-relink-title = Повторно свързване на чипа за сигурност
settings-encryption-relink-pin-description = Въведете ПИН, който искате да използвате при стартиране.
settings-encryption-ask-pin-step = Добавя стъпка при стартиране.
settings-encryption-pin-field = ПИН
settings-encryption-new-pin-field = Нов ПИН
settings-encryption-pin-length = От { $min } до { $max } цифри
settings-encryption-pin-digits-only = Използвайте само цифри
settings-encryption-pin-too-short = { $min ->
    [one] Използвайте поне { $min } цифра
   *[other] Използвайте поне { $min } цифри
}
settings-encryption-pin-too-long = { $max ->
    [one] Използвайте най-много { $max } цифра
   *[other] Използвайте най-много { $max } цифри
}
settings-encryption-pins-differ = ПИН кодовете не съвпадат
settings-encryption-confirm-field = Потвърждение
settings-encryption-type-again = Въведете отново

## Recovery key

settings-recovery-title = Ключ за възстановяване
settings-recovery-description = Връща ви достъпа, ако дискът не може да се отключи сам
settings-recovery-show = Покажи
settings-recovery-replace = Замени
settings-recovery-replace-title = Да се замени ли ключът за възстановяване?
settings-recovery-replace-description = Текущият ви ключ спира да работи и ще получите нов, който да запазите.
settings-recovery-replace-key = Замени ключа
settings-recovery-shown-title = Вашият ключ за възстановяване
settings-recovery-shown-description = Въведете го, ако компютърът някога поиска ключ за възстановяване при стартиране. Пазете копие на място извън този компютър.
settings-recovery-fresh-title = Запазете новия ключ за възстановяване
settings-recovery-fresh-description = Предишният ви ключ вече не работи. Пазете този на хартия или в мениджър на пароли.

## Passwords and keys (the keyring)

settings-passwords-title = Пароли и ключове
settings-passwords-not-running = Ключодържателят не работи
settings-passwords-not-running-description = Паролите и ключовете ви ще се появят тук, щом той стартира
settings-passwords-locked = Заключен
settings-passwords-contents = { $count ->
    [0] Още няма нищо запазено
    [one] { $count } парола или ключ
   *[other] { $count } пароли и ключове
}
settings-passwords-protected-chip = Защитен с паролата ви и чипа за сигурност
settings-passwords-protected = Защитен с паролата ви
settings-passwords-unlock = Отключи
settings-passwords-lock = Заключи
settings-passwords-seal-title = Запечатване с чипа за сигурност
settings-passwords-seal-description = Копията им не могат да се отворят на друг компютър
settings-passwords-seal = Запечатай
settings-passwords-fingerprint-on = Отключва се с пръстовия ви отпечатък
settings-passwords-fingerprint-on-description = Входът с него отключва и паролите ви
settings-passwords-fingerprint = Отключване с пръстов отпечатък
settings-passwords-fingerprint-description = Първо добавете пръстов отпечатък в Потребители
settings-passwords-pin = Искане на ПИН след отпечатъка
settings-passwords-pin-locked = Отключете ключодържателя, за да промените това
settings-passwords-pin-description = За да не може само отпечатък да ги отключи
settings-passwords-lock-with-screen = Заключване заедно с екрана
settings-passwords-lock-with-screen-description = Заключват се и се отключват заедно с екрана
settings-passwords-apps = Приложения с достъп
settings-passwords-apps-locked = Отключете ключодържателя, за да ги видите
settings-passwords-apps-asked = { $count ->
    [0] Още никое приложение не ги е поискало
    [one] { $count } приложение ги е поискало
   *[other] { $count } приложения са ги поискали
}

## Passwords and keys: apps with access

settings-passwords-access-description = Ако премахнете приложение, то ще поиска отново следващия път.
settings-passwords-access-not-allowed = Не е разрешено
settings-passwords-access-none = Още никое приложение не е поискало паролите ви
settings-passwords-access-revoke = Спри достъпа на { $app } до { $item }
settings-passwords-access-reset = Позволи на { $app } отново да поиска { $item }
settings-passwords-stores = Данни за вход в приложения
settings-passwords-stores-description = Данни за вход, които някои приложения пазят тук и само съответното приложение може да чете.
settings-passwords-stores-count = { $count ->
    [one] { $count } запазен вход
   *[other] { $count } запазени входа
}
settings-passwords-forget = Забрави
settings-passwords-forget-title = Да се забрави ли запазеното от { $app }?
settings-passwords-forget-description = { $app } губи данните за вход, които е пазило тук, така че може да се наложи да влезете отново.

## Passwords and keys: recent access

settings-passwords-history = Скорошен достъп
settings-passwords-history-read = { $app } използва „{ $item }“
settings-passwords-history-read-unnamed = { $app } използва запазена парола
settings-passwords-history-saved = { $app } запази „{ $item }“
settings-passwords-history-saved-unnamed = { $app } запази парола
settings-passwords-history-deleted = { $app } изтри „{ $item }“
settings-passwords-history-deleted-unnamed = { $app } изтри запазена парола
settings-passwords-history-denied = На { $app } не беше разрешено да използва „{ $item }“
settings-passwords-history-denied-unnamed = На { $app } не беше разрешено да използва запазена парола
settings-passwords-history-signed = { $app } подписа с „{ $item }“
settings-passwords-history-signed-unnamed = { $app } подписа със запазена парола
settings-passwords-history-fewer = Покажи по-малко
settings-passwords-history-all = { $count ->
    [one] Покажи всички { $count }
   *[other] Покажи всички { $count }
}
settings-passwords-history-clear = Изчистване на историята
settings-passwords-history-clear-description = Забравя кои приложения и кога са използвали ключодържателя
settings-passwords-history-clear-button = Изчисти
settings-passwords-history-clear-title = Да се изчисти ли скорошният достъп?
settings-passwords-history-clear-confirm = Списъкът с това кои приложения и кога са използвали ключодържателя се изтрива. Запазените пароли и ключове остават непроменени.

## Passwords and keys: SSH keys

settings-passwords-ssh = SSH ключове
settings-passwords-ssh-description = Ключове за вход в сървъри, пазени на сигурно място в ключодържателя.
settings-passwords-ssh-unnamed = Ключ без име
settings-passwords-ssh-in-chip = Пази се в чипа за сигурност
settings-passwords-ssh-added = Добавен { $when }
settings-passwords-ssh-copy = Копирай публичния ключ на { $name }
settings-passwords-ssh-remove = Премахни { $name }
settings-passwords-ssh-confirm = Питане преди всяко използване
settings-passwords-ssh-confirm-label = Питане преди всяко използване на { $name }
settings-passwords-ssh-add-row = Добавяне на ключ
settings-passwords-ssh-use = Използване на тези ключове с SSH
settings-passwords-ssh-use-description = Копирайте реда, който насочва SSH към тях
settings-passwords-ssh-copy-line = Копирай { $line }
settings-passwords-ssh-remove-title = Да се премахне ли „{ $name }“?
settings-passwords-ssh-remove-chip = Той съществува само в чипа за сигурност на този компютър, така че ще изчезне завинаги. Сървърите, които приемат само този ключ, вече няма да ви пускат с него.
settings-passwords-ssh-remove-description = Сървърите, които приемат само този ключ, вече няма да ви пускат с него. Това не може да бъде отменено.
settings-passwords-ssh-add-title = Добавяне на SSH ключ
settings-passwords-ssh-add-description = На този компютър се създава нов ключ. Копирайте публичния му ключ на сървърите, в които искате да влизате.
settings-passwords-ssh-name = Име
settings-passwords-ssh-name-placeholder = Например служебен лаптоп
settings-passwords-ssh-chip = Пазене в чипа за сигурност
settings-passwords-ssh-chip-description = Никога не може да бъде копиран от този компютър, дори от вас
settings-passwords-ssh-chip-unsupported = Чипът за сигурност на този компютър не може да съхранява SSH ключове
settings-passwords-ssh-add = Добави ключ

## Passkeys

settings-passkeys-title = Ключове за достъп
settings-passkeys-unavailable = Отключете ключодържателя, за да видите ключовете си за достъп.
settings-passkeys-chip-fingerprint = Запечатани с чипа за сигурност на този компютър. При всеки вход се иска пръстов отпечатък или парола.
settings-passkeys-chip-password = Запечатани с чипа за сигурност на този компютър. При всеки вход се иска паролата ви.
settings-passkeys-password-fingerprint = Шифровани с паролата ви. При всеки вход се иска пръстов отпечатък или парола.
settings-passkeys-password = Шифровани с паролата ви. При всеки вход се иска паролата ви.
settings-passkeys-last-used = Последно използван { $when }
settings-passkeys-never-used = Никога не е използван
settings-passkeys-password-only = Защитен с паролата ви
settings-passkeys-unreachable = Браузърите нямат достъп до ключовете ви за достъп
settings-passkeys-unreachable-description = Ще се върнат, щом услугата за ключове за достъп стартира
settings-passkeys-rename-label = Преименувай ключа за достъп за { $site }
settings-passkeys-remove-label = Премахни ключа за достъп за { $site }
settings-passkeys-empty = Още няма ключове за достъп
settings-passkeys-empty-description = Ключовете, създадени от сайтовете, се запазват тук за всички браузъри
settings-passkeys-remove-title = Да се премахне ли този ключ за достъп?
settings-passkeys-remove-description = Вече няма да можете да влизате в { $site } с него, затова се уверете, че имате друг начин за вход.
settings-passkeys-rename-title = Преименуване на ключ за достъп
settings-passkeys-rename-description = Дайте на ключа си за достъп за { $site } име, което ще разпознаете.
settings-passkeys-name = Име
settings-passkeys-save = Запази

## Apps

settings-apps-defaults = Приложения по подразбиране
settings-apps-defaults-description = Използват се, когато отваряте връзки, файлове и папки
settings-apps-browser = Уеб браузър
settings-apps-email = Имейл
settings-apps-calendar = Календар
settings-apps-music = Музика
settings-apps-videos = Видео
settings-apps-photos = Снимки
settings-apps-text-editor = Текстов редактор
settings-apps-files = Файлове
settings-apps-choose = Изберете
settings-apps-startup = Стартиране
settings-apps-startup-description = Тези приложения се отварят, когато влезете
settings-apps-startup-app = Отваряне на { $app } при вход
settings-apps-startup-add = Добави приложение
settings-apps-startup-add-title = Добавяне на приложение при стартиране
settings-apps-startup-add-description = Изберете приложение, което да се отваря при всеки вход.
settings-apps-search = Търсене на приложения
settings-apps-no-match = Няма приложения, които отговарят на търсенето
settings-apps-cancel = Отказ
