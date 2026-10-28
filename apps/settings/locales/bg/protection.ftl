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

settings-privacy-location-services = Услуги за местоположение
settings-privacy-location-services-hint = Позволява на приложенията да определят къде се намирате – за карти, времето и часови зони
settings-privacy-camera-allow = Достъп на приложенията до камерата
settings-privacy-microphone-allow = Достъп на приложенията до микрофона

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
settings-security-could-be-safer = Устройството ви може да е по-защитено
settings-security-not-encrypted-description = Дискът му не е шифрован, така че всеки, който го извади, може да чете файловете ви.
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
settings-encryption-not-encrypted = Изключено и може да се включи само при инсталиране на Luft
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

settings-encryption-ask-pin = Искане и на ПИН
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
settings-passwords-apps = Данни за вход и активност на приложенията
settings-passwords-apps-locked = Отключете ключодържателя, за да ги видите
settings-passwords-apps-description = Какво пазят приложенията тук и кога са го използвали
settings-passwords-apps-allowed = Кои приложения могат да използват паролите ви
settings-passwords-apps-allowed-hint = Задава се в Приложения

## Passwords and keys: apps with access

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
settings-apps-archives = Архиви
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

## Apps: permissions

settings-apps-permissions = Разрешения
settings-apps-location = Местоположение
settings-apps-camera = Камера
settings-apps-clipboard = Клипборд във фонов режим
settings-apps-full-access = Пълен достъп
settings-apps-full-access-hint = Работи извън пясъчника си и може всичко, което може програма, която стартирате сами. Премахването важи от следващото му отваряне.
settings-apps-full-access-remove = Премахни
settings-apps-full-access-remove-app = Премахни пълния достъп на { $app }
settings-apps-passwords = Запазени пароли
settings-apps-passwords-forget = Забрави
settings-apps-passwords-forget-app = Нека { $app } попита отново
settings-apps-permissions-allowed = Разрешени: { $allowed } от { $total }
settings-apps-permissions-description = Приложенията в пясъчник получават собствените си файлове и само това, което разрешите тук.
settings-apps-sandbox-only = Нищо извън пясъчника
settings-apps-folders = Папки
settings-apps-folders-hint = Може да чете и променя всичко в тези папки от следващото си отваряне.
settings-apps-folders-count = { $count ->
    [one] { $count } папка
   *[other] { $count } папки
}
settings-apps-folder-add = Добавяне на папка
settings-apps-folder-remove = Премахване
settings-apps-folder-remove-app = Спиране на споделянето на { $folder }
settings-apps-usb = USB устройства
settings-apps-usb-hint = Например ключове за сигурност, телефони и микроконтролери
settings-apps-serial = Серийни устройства
settings-apps-serial-hint = Например 3D принтери и платки, свързани през USB
settings-apps-folder-read-only = Само за четене
settings-apps-internet = Интернет
settings-apps-internet-hint = Може да се свързва с интернет от следващото си отваряне.
settings-apps-service-hint = Услуга на работния плот, с която може да общува
settings-apps-service-remove = Премахване
settings-apps-service-remove-app = Спиране на достъпа до { $service }
settings-apps-services-count = { $count ->
    [one] { $count } услуга
   *[other] { $count } услуги
}
settings-apps-full-access-off = Работи в пясъчник. Пълният достъп премахва пясъчника.
settings-apps-full-access-give = Даване на пълен достъп
