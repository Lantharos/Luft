## Shared

system-cancel = Отмена

## Dictation notifications

dictation-setup-title = Набирайте текст голосом
dictation-setup-body = Говорите, и сказанное будет напечатано в любом приложении. Речь распознаётся на этом компьютере, поэтому сначала нужна речевая модель.
dictation-setup-action = Настроить диктовку
dictation-unsupported-title = Диктовка на языке { $language } недоступна на этом компьютере
dictation-unsupported-body = Процессор этого компьютера не может запустить распознаватель речи, нужный для языка { $language }. Можно диктовать на другом языке.
dictation-settings-action = Настройки диктовки

## System health notifications

health-gpu-reset-title = Графический драйвер перестал отвечать
health-gpu-reset-body = { $day ->
    [today] Сегодня в { $time } компьютер перезагрузился сам. В Настройках можно узнать, как этого избежать.
   *[other] Компьютер перезагрузился сам: { $date }, { $time }. В Настройках можно узнать, как этого избежать.
}
health-gpu-reset-details = Подробнее

oom-app-closed-title = Приложение { $app } закрыто, чтобы освободить память
oom-container-closed-title = Контейнер закрыт, чтобы освободить память
oom-closed-body = На компьютере заканчивалась память, поэтому его пришлось закрыть, чтобы всё остальное продолжало работать без задержек.
oom-closed-body-with-size = На компьютере заканчивалась память, поэтому его пришлось закрыть, чтобы всё остальное продолжало работать без задержек. Использовалось памяти: { $size }.
memory-low-title = В системе Luft заканчивается память
memory-low-app-body = Приложение { $app } использует { $size }. Завершите его принудительно, чтобы всё остальное работало без задержек.
memory-low-container-body = Контейнер использует { $size }. Завершите его принудительно, чтобы всё остальное работало без задержек.
memory-low-force-quit = Завершить принудительно

## Input source indicator

input-source-indicator = Источник ввода: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Режим полёта включён переключателем на устройстве
media-keys-airplane-mode-on = Режим полёта включён
media-keys-airplane-mode-off = Режим полёта отключён
media-keys-bluetooth-on = Bluetooth включён
media-keys-bluetooth-off = Bluetooth отключён
media-keys-caps-lock-on = Caps Lock включён
media-keys-caps-lock-off = Caps Lock отключён
media-keys-num-lock-on = Num Lock включён
media-keys-num-lock-off = Num Lock отключён

## VPN sign-in

vpn-sign-in-title = Вход: { $connection }
vpn-connect = Подключиться
vpn-signing-in = Выполняется вход…
vpn-finish-in-browser = Завершите вход в браузере.
vpn-certificate-untrusted = Сервер { $host } предъявил сертификат, который не удаётся проверить ({ $reason }). Отпечаток сертификата: { $fingerprint }.
vpn-certificate-warning = Возможно, кто-то выдаёт себя за этот сервер. Подключайтесь, только если вы этого ожидали.
vpn-certificate-connect = Всё равно подключиться

vpn-field-password = Пароль
vpn-field-certificate-password = Пароль сертификата
vpn-field-proxy-password = Пароль прокси-сервера
vpn-field-pre-shared-key = Общий ключ
vpn-field-group-password = Пароль группы

## Battery notifications

battery-left = Осталось { $percent }.

battery-device-low-title = { $device }: низкий заряд батареи
battery-device-very-low-title = { $device }: очень низкий заряд батареи
battery-device-low-body = { $left } Зарядите устройство в ближайшее время.
battery-device-very-low-body = { $left } Зарядите устройство сейчас, чтобы оно не выключилось.

battery-device-mouse = Мышь
battery-device-keyboard = Клавиатура
battery-device-phone = Телефон
battery-device-tablet = Планшет
battery-device-controller = Геймпад
battery-device-pen = Перо
battery-device-touchpad = Сенсорная панель
battery-device-headset = Гарнитура
battery-device-speaker = Колонка
battery-device-headphones = Наушники
battery-device-remote = Пульт
battery-device-other = Подключённое устройство

## Privacy indicator

privacy-indicator = Используются: { $things }
privacy-thing-camera = камера
privacy-thing-microphone = микрофон
privacy-thing-screen = экран
privacy-thing-location = местоположение
privacy-thing-windows = окна

privacy-camera-unknown-app = Приложение использует камеру
privacy-stop-sharing = Остановить показ экрана
privacy-stop-recording = Остановить запись
privacy-turn-off-location = Отключить определение местоположения
privacy-settings = Настройки конфиденциальности
privacy-camera = Камера
privacy-microphone = Микрофон
privacy-microphone-muted = Микрофон отключён
privacy-mute-microphone = Отключить микрофон
privacy-unmute-microphone = Включить микрофон
privacy-close-app = Закрыть { $app }
privacy-unknown-app = Неизвестное приложение
privacy-reported-app = «{ $name }» (название не проверено)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } программа может видеть ваши окна
    [few] { $count } программы могут видеть ваши окна
    [many] { $count } программ могут видеть ваши окна
   *[other] { $count } программы могут видеть ваши окна
}
privacy-windows-using-programs = { $count ->
    [one] { $count } программа может видеть ваши окна и управлять ими
    [few] { $count } программы могут видеть ваши окна и управлять ими
    [many] { $count } программ могут видеть ваши окна и управлять ими
   *[other] { $count } программы могут видеть ваши окна и управлять ими
}
privacy-windows-stop = Закрыть доступ

## Window access prompt

peek-see-request = Разрешить запущенной вами программе видеть ваши окна?
peek-see-description = Программа сможет делать снимки любого открытого окна.
peek-use-request = Разрешить запущенной вами программе видеть ваши окна и управлять ими?
peek-use-description = Программа сможет видеть любое открытое окно, а также нажимать и печатать в нём, как будто это делаете вы.
peek-deny = Не разрешать
peek-allow-once = Разрешить один раз
peek-allow-until-quit = Разрешить до закрытия программы

## Window access errors

peek-error-declined-until-quit = Пользователь этого компьютера отклонил запрос. Программа сможет запросить доступ снова после закрытия.
peek-error-not-allowed = Пользователь этого компьютера не дал разрешения
peek-error-sandboxed = Приложения в песочнице не могут видеть другие окна и управлять ими
peek-error-unknown-caller = Запрашивающая программа завершилась или не была распознана
peek-error-no-caller = Сеансовая шина не сообщила, какая программа отправила запрос
peek-error-screen-busy = Экран заблокирован, или на нём открыт системный запрос. Попробуйте ещё раз, когда он исчезнет.
peek-error-input-held = Кто-то удерживает клавиши или кнопки мыши. Попробуйте ещё раз чуть позже.
peek-error-input-dropped = Ввод остановлен: когда он поступил, под указателем было что-то другое или клавиатура была занята
peek-error-not-in-front = Не удалось вывести окно на передний план
peek-error-covered = Эта часть окна закрыта чем-то другим
peek-error-outside = Точка { $x }, { $y } находится за пределами снимка окна размером { $width } × { $height }
peek-error-nothing-to-capture = Окно ничего не показывает, снимать нечего
peek-error-window-picture-late = Снимок окна не был готов вовремя
peek-error-screen-picture-late = Снимок экрана не был готов вовремя
peek-error-no-window-id = Нет окна с идентификатором { $id }. Открытые окна показывает peek list.
peek-error-no-window-for-handle = У программы, запущенной как { $handle }, нет открытых окон
peek-error-ended-before-window = Программа завершилась, не открыв окно
peek-error-no-window-in-time = За { $duration } не открылось ни одного окна
peek-error-launch-not-started-by-peek = Запускать можно только программу, которую запустила сама команда peek run
peek-error-ended-while-starting = Программа завершилась во время запуска
peek-error-launch-failed = systemd не удалось запустить { $program }
peek-error-unknown-handle = Ни у одной программы, запущенной через peek run, нет метки { $handle }, или она уже завершилась
peek-error-unknown-key = Клавиша { $key } неизвестна peek
peek-error-unknown-modifier = { $modifier } не является клавишей-модификатором. Используйте ctrl, shift, alt или super.
peek-error-display-owner = Этот дисплей принадлежит другой программе
peek-error-display-run = Программы на скрытом дисплее запускаются через peek run
peek-error-display-handle = Этот дисплей был запущен как { $handle }, а не { $requested }

## Quick settings tiles

auto-rotate-title = Автоповорот
dark-style-title = Тёмный режим
do-not-disturb-title = Не беспокоить
night-light-title = Ночной свет
airplane-mode-title = Режим полёта

## Power mode

power-profile-title = Режим питания
power-profile-header = Режим питания
power-profile-open-menu = Открыть меню режимов питания
power-profile-settings = Настройки питания
power-profile-performance = Производительность
power-profile-balanced = Сбалансированный
power-profile-power-saver = Энергосбережение
power-profile-custom = Особый

## Keep awake

caffeine-title = Не засыпать
caffeine-open-menu = Открыть меню «Не засыпать»
caffeine-until = До { $time }
caffeine-until-turned-off = До отключения
caffeine-30-minutes = 30 минут
caffeine-1-hour = 1 час
caffeine-2-hours = 2 часа
caffeine-inhibit-reason = «Не засыпать» включено в быстрых настройках

## Brightness

brightness-title = Яркость
brightness-open-menu = Открыть меню яркости

## Keyboard backlight

backlight-title = Подсветка клавиатуры
backlight-open-menu = Открыть меню подсветки клавиатуры
backlight-slider = Яркость подсветки клавиатуры
backlight-off = Отключена
backlight-low = Низкая
backlight-high = Высокая

## Sound

volume-sound-settings = Настройки звука
volume-mute = Выключить звук
volume-unmute = Включить звук
volume-output-slider = Громкость
volume-output-title = Вывод звука
volume-output-open-menu = Открыть меню вывода звука
volume-input-slider = Микрофон
volume-input-title = Ввод звука
volume-input-open-menu = Открыть меню ввода звука

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Открыть меню Bluetooth
bluetooth-settings = Настройки Bluetooth
bluetooth-connect = Подключить
bluetooth-disconnect = Отключить
bluetooth-connect-device = Подключить { $deviceName }
bluetooth-disconnect-device = Отключить { $deviceName }
bluetooth-no-devices = Нет доступных или подключённых устройств
bluetooth-turn-on-hint = Включите Bluetooth, чтобы подключать устройства
bluetooth-connected-count = { $count ->
    [one] Подключено: { $count }
    [few] Подключено: { $count }
    [many] Подключено: { $count }
   *[other] Подключено: { $count }
}

## Network menus in quick settings

network-menu-unknown-network = <неизвестная сеть>
network-menu-connect = Подключиться
network-menu-disconnect = Отключиться
network-menu-connect-to = Подключиться к { $name }
network-menu-disconnect-from = Отключиться от { $name }
network-menu-turn-off = Отключить
network-menu-wifi-network = { $secure ->
    [yes] { $name }, защищённая, уровень сигнала { $strength } %
   *[no] { $name }, незащищённая, уровень сигнала { $strength } %
}
network-menu-hotspot = Точка доступа { $name }
network-menu-connected-count = { $count ->
    [one] Подключено: { $count }
    [few] Подключено: { $count }
    [many] Подключено: { $count }
   *[other] Подключено: { $count }
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Открыть меню VPN
network-menu-vpn-settings = Настройки VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Открыть меню Wi-Fi
network-menu-wifi-settings = Все сети
network-menu-wired = Проводные подключения
network-menu-wired-open-menu = Открыть меню проводных подключений
network-menu-wired-settings = Настройки проводной сети
network-menu-tethers = Модем через Bluetooth
network-menu-tethers-open-menu = Открыть меню модема через Bluetooth
network-menu-tether = Модем
network-menu-tether-settings = Настройки Bluetooth
network-menu-mobile-connections = Мобильные подключения
network-menu-mobile-open-menu = Открыть меню мобильных подключений
network-menu-mobile-settings = Настройки мобильной сети
network-menu-mobile = Мобильная сеть
network-device-wired = Проводная сеть
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Вход в сеть
network-menu-failed-title = Не удалось подключиться
network-menu-failed-body = Не удалось активировать сетевое подключение

## Location access dialog

location-dialog-title = Разрешить доступ к местоположению
location-dialog-description = Приложение { $appName } запрашивает доступ к вашему местоположению
location-dialog-info = Доступ к местоположению можно изменить в любое время в настройках конфиденциальности
location-dialog-deny = Запретить
location-dialog-grant = Разрешить

## Thunderbolt notifications

thunderbolt-unknown-title = Неизвестное устройство Thunderbolt
thunderbolt-unknown-body = Пока вас не было, подключили новое устройство. Отключите его и подключите снова, чтобы начать им пользоваться.
thunderbolt-unauthorized-title = Неразрешённое устройство Thunderbolt
thunderbolt-unauthorized-body = Подключено новое устройство, которое должен разрешить администратор
thunderbolt-error-title = Ошибка авторизации Thunderbolt
thunderbolt-error-body = Не удалось разрешить устройство Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Запретить
access-dialog-allow = Разрешить

## Display change confirmation

display-change-title = Сохранить эти настройки экрана?
display-change-countdown = { $seconds ->
    [one] Изменения будут отменены через { $seconds } секунду
    [few] Изменения будут отменены через { $seconds } секунды
    [many] Изменения будут отменены через { $seconds } секунд
   *[other] Изменения будут отменены через { $seconds } секунды
}
display-change-revert = Отменить
display-change-keep = Сохранить

## Drive connected notification

autorun-connected = Подключён диск «{ $driveName }»
autorun-ready = Диск готов к использованию
autorun-open-with = Открыть в приложении { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Медленные клавиши включены
kbd-a11y-slow-keys-off = Медленные клавиши отключены
kbd-a11y-slow-keys-description = Вы удерживали клавишу Shift 8 секунд. Это сочетание включает медленные клавиши, которые меняют работу клавиатуры.
kbd-a11y-sticky-keys-on = Залипание клавиш включено
kbd-a11y-sticky-keys-off = Залипание клавиш отключено
kbd-a11y-sticky-keys-on-description = Вы нажали клавишу Shift 5 раз подряд. Это сочетание включает залипание клавиш, которое меняет работу клавиатуры.
kbd-a11y-sticky-keys-off-description = Вы нажали две клавиши одновременно или нажали Shift 5 раз подряд. Это отключает залипание клавиш, которое меняет работу клавиатуры.
kbd-a11y-leave-on = Не отключать
kbd-a11y-turn-on = Включить
kbd-a11y-turn-off = Отключить
kbd-a11y-leave-off = Не включать

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Выбор аудиоустройства
audio-device-cancel = Отмена
audio-device-sound-settings = Настройки звука
audio-device-headphones = Наушники
audio-device-headset = Гарнитура
audio-device-microphone = Микрофон

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Разрешить перехват сочетаний клавиш
inhibit-shortcuts-app = Приложение { $appName } хочет перехватывать сочетания клавиш
inhibit-shortcuts-unknown-app = Приложение хочет перехватывать сочетания клавиш
inhibit-shortcuts-titled-app = Приложение с окном «{ $title }» хочет перехватывать сочетания клавиш
inhibit-shortcuts-restore = Чтобы вернуть сочетания клавиш, нажмите { $shortcut }
inhibit-shortcuts-deny = Запретить
inhibit-shortcuts-allow = Разрешить

## Unlocking encrypted drives

mount-hidden-volume = Скрытый том
mount-windows-system-volume = Системный том Windows
mount-uses-keyfiles = Использует ключевые файлы
mount-keyfiles-use-app = Чтобы разблокировать том с ключевыми файлами, используйте приложение <i>{ $appName }</i>
mount-keyfiles-need-app = Чтобы разблокировать том с ключевыми файлами, нужна внешняя программа, например <i>Диски</i>
mount-pim-number = Число PIM
mount-pim-invalid = PIM должен быть числом или пустым
mount-password = Пароль
mount-remember-password = Запомнить пароль
mount-cancel = Отмена
mount-unlock = Разблокировать
mount-open-app = Открыть { $appName }
mount-wrong-password = Не получилось. Попробуйте ещё раз.
mount-unlock-failed = Не удалось разблокировать том
mount-pim-unsupported = Установленная версия udisks не поддерживает параметр PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Требуется аутентификация
network-agent-wifi-rejected = Сохранённый пароль для сети «{ $networkName }» не подошёл. Введите его ещё раз.
network-agent-wifi-secrets = Для доступа к беспроводной сети «{ $networkName }» нужен пароль или ключ шифрования
network-agent-wps-hint = Также можно подключиться, нажав кнопку WPS на роутере
network-agent-wired-title = Аутентификация 802.1X в проводной сети
network-agent-dsl-title = Аутентификация DSL
network-agent-pin-title = Требуется PIN-код
network-agent-pin-body = Для модема мобильной сети нужен PIN-код
network-agent-vpn-title = Пароль VPN
network-agent-password-required = Для подключения к «{ $networkName }» нужен пароль
network-agent-connect = Подключиться
network-agent-cancel = Отмена
network-agent-password = Пароль
network-agent-username = Имя пользователя
network-agent-key = Ключ
network-agent-private-key-password = Пароль закрытого ключа
network-agent-identity = Идентификатор
network-agent-service = Служба
network-agent-network-name = Имя сети
network-agent-pin = PIN-код

## Screenshots and screen recording

screenshot-source = Захват экрана
screenshot-area = Выбор области
screenshot-screen = Выбор экрана
screenshot-window = Выбор окна
screenshot-take = Сделать снимок экрана
screenshot-record = Записать экран
screenshot-show-pointer = Показывать указатель
screenshot-capture = Захватить
screenshot-close = Закрыть
screenshot-screencasts-folder = Записи экрана
screenshot-screencast-file = Запись экрана от { $date } { $time }
screenshot-screenshots-folder = Снимки экрана
screenshot-file = Снимок экрана от { $timestamp }
screenshot-screencast-recorded = Запись экрана сохранена
screenshot-screencast-start-failed = Не удалось начать запись экрана
screenshot-screencast-out-of-space = Запись экрана прервана: на диске нет места
screenshot-screencast-try-again = Не удалось записать экран. Попробуйте ещё раз
screenshot-screencast-failed = Не удалось записать экран
screenshot-screencast-view = Нажмите, чтобы посмотреть видео
screenshot-show-in-rover = Показать в приложении Rover
screenshot-captured = Снимок экрана сделан
screenshot-captured-body = Изображение можно вставить из буфера обмена

## System updates
updates-available-title = Доступны обновления системы
updates-available-body = Откройте Настройки, чтобы скачать и установить их.
updates-ready-title = Обновления готовы к установке
updates-ready-body = Перезагрузите компьютер в удобное время, чтобы установить их.
