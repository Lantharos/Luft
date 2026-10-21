## Buttons used across steps

setup-continue = Продолжить
setup-back = Назад
setup-cancel = Отмена
setup-not-now = Не сейчас
setup-try-again = Повторить
setup-restart = Перезагрузить
setup-restart-now = Перезагрузить сейчас
setup-restart-later = Перезагрузить позже
setup-saving = Сохранение…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Установка Luft
setup-installing-progress = Установка: { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Поиск
setup-picker-no-match = Ничего не найдено

## Welcome step: language, keyboard and time zone

setup-region-title = Добро пожаловать в Luft
setup-region-language = Язык
setup-region-keyboard = Клавиатура
setup-region-time-zone = Часовой пояс
setup-region-intro = Начнём настройку. Выберите язык, раскладку клавиатуры и часовой пояс.
setup-region-intro-guessed-computer = Начнём настройку. Параметры определены по данным компьютера — измените то, что не подходит.
setup-region-intro-guessed = Начнём настройку. Определено автоматически: { $guesses }. Измените то, что не подходит.
setup-region-guess-from-computer = { $fields } по данным компьютера
setup-region-guess-from-network = { $fields } по данным сети
setup-region-field-language = язык
setup-region-field-keyboard = раскладка клавиатуры
setup-region-field-time-zone = часовой пояс

## Where Luft goes

setup-destination-choose-title = Куда установить Luft?
setup-destination-choose-description = Выберите, как разместить Luft на этом компьютере. Ничего не изменится, пока вы не подтвердите выбор.
setup-destination-alongside-title = Освободить место рядом с Windows
setup-destination-alongside-description = Windows станет меньше, чтобы освободить место для Luft. Ваши файлы в Windows останутся как есть.
setup-destination-whole-title = Выберите диск
setup-destination-whole-description = Luft займёт весь диск. Всё, что на нём есть, будет стёрто.
setup-destination-custom-title = Выберите место для Luft
setup-destination-custom-description = Разметьте диски по-своему в приложении Диски.
setup-destination-replace-title = Заменить { $system }
setup-destination-replace-description = Система Luft займёт её место и сохранит всё ваше.
setup-destination-meet-title = Рядом с Windows
setup-destination-meet-description = Приложение Meet Luft уже освободило это место, поэтому Windows останется как есть.
setup-destination-meet-drive-title = Диск: { $drive }
setup-destination-meet-drive-description = Приложение Meet Luft уже освободило это место на другом диске, и Luft запускается оттуда с собственными загрузочными файлами.
setup-destination-looking = Проверка дисков…

setup-destination-meet-choice = Рядом с Windows
setup-destination-meet-choice-description = Использовать место ({ $size }), подготовленное приложением Meet Luft рядом с Windows.
setup-destination-meet-drive-choice = Диск: { $drive }
setup-destination-meet-drive-choice-description = Использовать место ({ $size }), подготовленное приложением Meet Luft на диске { $drive }.
setup-destination-alongside-choice = Рядом с { $windows }
setup-destination-alongside-choice-description = Сохранить Windows и её файлы, а часть диска отдать Luft.
setup-destination-replace-choice = Заменить { $system }
setup-destination-replace-choice-description = Сохранить ваши файлы, учётную запись и настройки, а систему заменить на Luft.
setup-destination-whole-choice = Использовать весь диск
setup-destination-whole-choice-description = Стереть диск и полностью отдать его Luft.
setup-destination-try-choice = Просто попробовать Luft
setup-destination-try-choice-description = Сначала осмотритесь. Ничего не устанавливается, а диски остаются нетронутыми.
setup-destination-custom-choice = Вручную
setup-destination-custom-choice-description = Разметить разделы самостоятельно в приложении Диски.

setup-destination-more-options = Другие варианты
setup-destination-starting = Запуск…
setup-destination-replace = Заменить
setup-destination-install = Установить Luft

## Confirming where Luft goes

setup-confirm-replace-title = Заменить { $system }?
setup-confirm-erase-title = Стереть { $drive }?
setup-confirm-shrink-title = Уменьшить Windows до { $size }?
setup-confirm-meet-title = Установить Luft рядом с Windows?
setup-confirm-meet-drive-title = Установить Luft на диск { $drive }?
setup-confirm-free-title = Установить Luft на свободное место?
setup-confirm-replace-keep-old = Копирование Luft начнётся сразу. Старая система больше не будет запускаться, а её файлы останутся, пока вы их не удалите.
setup-confirm-replace-erase-old = Копирование Luft начнётся сразу. Старая система будет стёрта навсегда, а ваши файлы останутся на месте.
setup-confirm-erase-description = Всё на этом диске будет стёрто навсегда, включая другие системы и файлы.
setup-confirm-install-description = Копирование Luft начнётся сразу. Пока оно идёт, можно настроить учётную запись.
setup-confirm-erase = Стереть и установить
setup-confirm-install = Установить

## Making room next to Windows

setup-alongside-hint = Перетащите ползунок, чтобы разделить { $drive } между Windows и Luft. Windows сохранит все свои файлы и немного места про запас.
setup-windows-bitlocker = Windows держит этот диск заблокированным с помощью BitLocker, поэтому Luft не может освободить на нём место. В Windows отключите шифрование устройства или уменьшите том в «Управлении дисками», а затем выберите свободное место в варианте «Вручную».
setup-windows-hibernated = Windows находится в спящем режиме или была выключена с быстрым запуском, поэтому её диск нельзя безопасно изменить. Запустите Windows, выберите «Завершение работы», удерживая Shift, и снова запустите Luft.
setup-windows-dirty = Диск Windows сначала нужно быстро проверить. Запустите Windows, перезагрузите её один раз и снова запустите Luft.
setup-windows-full = Windows занимает почти весь свой диск. Освободите в Windows около { $size } и снова запустите Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Всё, что вы упаковали в Windows ({ $size }), будет распаковано в новую учётную запись.

## Windows options

setup-windows-fast-startup = Отключить быстрый запуск в Windows
setup-windows-fast-startup-description = Тогда Windows будет выключаться полностью: звук, Wi-Fi и Bluetooth в Luft будут запускаться с чистого листа, а диск Windows останется доступным.
setup-windows-clock = Одинаковое время в обеих системах
setup-windows-clock-description = Windows будет читать часы компьютера так же, как Luft, и время больше не будет сбиваться при переключении.
setup-windows-bluetooth = Перенести устройства Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } устройство, сопряжённое в Windows, будет работать в Luft без повторного сопряжения.
    [few] { $count } устройства, сопряжённых в Windows, будут работать в Luft без повторного сопряжения.
    [many] { $count } устройств, сопряжённых в Windows, будут работать в Luft без повторного сопряжения.
   *[other] { $count } устройства, сопряжённого в Windows, будут работать в Luft без повторного сопряжения.
}

## Choosing a drive

setup-drives-label = Диски
setup-drives-none = Нет диска, который может использовать Luft. Подключите диск и проверьте снова.
setup-drive-has-windows = На диске { $windows }
setup-drive-empty = Пустой
setup-drive-partitions = { $count ->
    [one] { $count } раздел
    [few] { $count } раздела
    [many] { $count } разделов
   *[other] { $count } раздела
}

## Custom space

setup-custom-open-disks = Открыть Диски
setup-custom-looking = Проверка…
setup-custom-look-again = Проверить снова
setup-custom-free-label = Свободное место
setup-custom-free-space = Свободно: { $size }
setup-custom-on-drive = Диск: { $drive }
setup-custom-none = Освободите в приложении Диски не меньше { $size } и проверьте снова. Система Luft будет установлена в оставленное свободное место.

## Replacing a Linux system

setup-replace-stays = Что останется
setup-replace-changes = Что изменится
setup-replace-keeps-account = Ваши файлы и учётная запись { $account }
setup-replace-keeps-account-password = Ваши файлы и учётная запись { $account } вместе с паролем
setup-replace-keeps-accounts = { $count ->
    [one] Ещё { $count } учётная запись с её файлами
    [few] Ещё { $count } учётные записи с их файлами
    [many] Ещё { $count } учётных записей с их файлами
   *[other] Ещё { $count } учётной записи с их файлами
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } сетевое подключение с паролем Wi-Fi
    [few] { $count } сетевых подключения с паролями Wi-Fi
    [many] { $count } сетевых подключений с паролями Wi-Fi
   *[other] { $count } сетевого подключения с паролями Wi-Fi
}
setup-replace-keeps-drives = { $drives } — подключаются при запуске, как и раньше
setup-replace-keeps-hostname = Имя компьютера ({ $hostname }) и его ключи SSH
setup-replace-keeps-tools = { $count ->
    [one] { $count } установленный вами инструмент командной строки — в Toolbox после входа
    [few] { $count } установленных вами инструмента командной строки — в Toolbox после входа
    [many] { $count } установленных вами инструментов командной строки — в Toolbox после входа
   *[other] { $count } установленного вами инструмента командной строки — в Toolbox после входа
}
setup-replace-keeps-old = Система { $system } больше не будет запускаться. Её системные файлы сохранятся в папке old-system, пока вы не удалите их в приложении Диски или в Настройках.
setup-replace-erases-system = Системный раздел { $system } будет стёрт. Ваши файлы находятся на отдельном разделе и останутся как есть.
setup-replace-clears-boot = Раздел /boot будет очищен для загрузочных файлов Luft.
setup-replace-apps = Установленные в ней приложения не перенесутся. Установите их снова из Schelf.

setup-replace-blocked-encrypted = Система зашифрована, поэтому заменить её с сохранением файлов пока нельзя.
setup-replace-blocked-single = Ваши файлы находятся в одном разделе с системой, поэтому заменить её с сохранением файлов пока нельзя.
setup-replace-blocked-layout = Её диск размечен так, что Luft пока не может её заменить.
setup-replace-blocked-startup = Её системный раздел EFI слишком мал для Luft, а раздела /boot, который можно использовать вместо него, нет.
setup-replace-blocked-no-account = В ней нет учётной записи, которую можно перенести.
setup-replace-blocked-running = Система Luft сейчас запущена с этого диска. Чтобы заменить систему, запустите Luft с USB-накопителя.
setup-replace-blocked-read-only = Её диск доступен только для чтения.

## Connecting to the internet

setup-network-title = Подключение к интернету
setup-network-description = Это необязательно. Через интернет Luft сможет настроить часы и часовой пояс, а пока идёт установка, интернетом можно пользоваться.
setup-network-unavailable = Сети сейчас недоступны. Подключиться можно позже с панели задач.
setup-network-looking = Поиск сетей…
setup-network-cable = Подключено по кабелю
setup-network-show-all = Показать все сети
setup-network-skip = Пропустить
setup-network-failed = Не удалось подключиться
setup-network-wrong-password = Неверный пароль
setup-network-connected = Подключено
setup-network-connecting = Подключение…
setup-network-saved = Сохранена
setup-network-password = Пароль
setup-network-join = Подключиться

## Account

setup-account-title = Кто будет пользоваться этим компьютером?
setup-account-description = С этой учётной записью вы будете входить в систему. Других пользователей можно добавить позже в Настройках.
setup-account-full-name = Ваше имя
setup-account-full-name-example = Софья Ковалевская
setup-account-user-name = Имя пользователя
setup-account-password = Пароль
setup-account-repeat = Повторите пароль
setup-account-user-name-invalid = Используйте строчные латинские буквы, цифры, - и _
setup-account-full-name-invalid = Не используйте запятые и двоеточия
setup-account-mismatch = Пароли не совпадают

## Installing

setup-finishing-failed-title = Не удалось установить Luft
setup-finishing-failed-description = Во время установки что-то пошло не так.
setup-finishing-failed-stick = Компьютер по-прежнему запускается так же, как раньше. Можно продолжить пользоваться Luft с USB-накопителя или перезагрузиться и попробовать ещё раз.
setup-finishing-failed-trying = Компьютер по-прежнему запускается так же, как раньше. Можно продолжить пользоваться Luft в нынешнем виде или перезагрузиться и попробовать ещё раз.
setup-finishing-use-stick = Работать с USB-накопителя
setup-finishing-keep-trying = Продолжить пробовать Luft
setup-finishing-installed-title = Система Luft установлена
setup-finishing-trust-stick = Когда экран погаснет, извлеките USB-накопитель. Затем на синем экране появится запрос о доверии Luft. Там используйте клавиатуру.
setup-finishing-trust = Сразу после перезагрузки на синем экране появится запрос о доверии Luft. Там используйте клавиатуру.
setup-finishing-restart-stick = Перезагрузите компьютер, чтобы начать работу. Когда экран погаснет, извлеките USB-накопитель.
setup-finishing-restart = Перезагрузите компьютер, чтобы начать работу.
setup-finishing-title = Почти готово
setup-finishing-description = Luft копируется на компьютер. Это займёт несколько минут.
setup-finishing-plug-in = Не отключайте компьютер от сети, пока копирование не завершится.
setup-stage-idle = Подготовка
setup-stage-preparing = Освобождение места для Luft
setup-stage-copying = Копирование Luft
setup-stage-waiting = Завершение
setup-stage-configuring = Настройка учётной записи
setup-stage-finished = Готово

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Нажмите любую клавишу в течение 10 секунд
setup-enroll-choose-enroll = Выберите Enroll MOK, затем Continue
setup-enroll-choose-yes = Выберите Yes
setup-enroll-type-code = Введите код, затем выберите Reboot
setup-enroll-digits = { $count ->
    [one] { $count } цифра
    [few] { $count } цифры
    [many] { $count } цифр
   *[other] { $count } цифры
}
setup-secure-boot-title = Компьютер пока не доверяет Luft
setup-secure-boot-code = Сразу после следующей перезагрузки на синем экране появится запрос о доверии Luft. Там с помощью клавиатуры введите этот код.
setup-secure-boot-skipped = Синий экран был пропущен. Получите новый код и перезагрузите компьютер, а затем используйте клавиатуру на синем экране.
setup-secure-boot-getting = Получение кода…
setup-secure-boot-new-code = Получить новый код

## Encryption

setup-protect-title = Защитите свои файлы
setup-protect-tpm = Зашифруйте компьютер, чтобы никто не смог прочитать ваши файлы без входа в систему, даже если компьютер потеряется. При запуске он разблокируется сам.
setup-protect-passphrase = Зашифруйте компьютер, чтобы никто не смог прочитать ваши файлы без вашей парольной фразы, даже если компьютер потеряется.
setup-protect-staged-title = Ваши файлы будут зашифрованы
setup-protect-staged-description = Шифрование начнётся само после перезагрузки в конце настройки, а пока оно идёт, компьютером можно пользоваться.
setup-protect-keep-safe = Храните этот ключ восстановления в надёжном месте отдельно от компьютера. Он понадобится, если компьютер не сможет разблокироваться сам.
setup-protect-passphrase-label = Парольная фраза
setup-protect-repeat = Повторите фразу
setup-protect-mismatch = Фразы не совпадают
setup-protect-kept = Ключ восстановления сохранён
setup-protect-background = Шифрование будет идти в фоне после следующей перезагрузки, а компьютером можно будет пользоваться.
setup-protect-encrypt = Зашифровать
setup-protect-checking = Проверка…
setup-protect-start = Зашифровать мои файлы

## Fingerprint

setup-fingerprint-title = Вход по отпечатку пальца
setup-fingerprint-description = Разблокируйте Luft касанием, а не вводом пароля. Другие пальцы можно добавить позже в Настройках.
setup-fingerprint-which = Какой палец?
setup-fingerprint-another = Добавить ещё один палец?
setup-fingerprint-finger = Палец
setup-fingerprint-no-reader = Сканер отпечатков не отвечает. Отпечаток можно добавить позже в Настройках.
setup-fingerprint-add = Добавить отпечаток
setup-fingerprint-choose-another = Выбрать другой палец

## Done

setup-ready-title = Всё готово
setup-ready-trust = Чтобы закончить, перезагрузите компьютер ещё раз. Сразу после перезагрузки на синем экране появится запрос о доверии Luft. Там с помощью клавиатуры введите этот код.
setup-ready-restart = Чтобы закончить, перезагрузите компьютер ещё раз, а затем войдите с паролем.
setup-ready-done = Рабочий стол готов. Приятной работы с Luft.
setup-ready-start = Начать работу с Luft
