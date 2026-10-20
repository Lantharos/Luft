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
battery-left-with-time = Осталось { $percent }, примерно { $duration }.
battery-low-title = Низкий заряд батареи
battery-very-low-title = Очень низкий заряд батареи
battery-almost-empty-title = Батарея почти разряжена
battery-ups-low-title = Низкий заряд батареи ИБП
battery-ups-very-low-title = Очень низкий заряд батареи ИБП
battery-ups-almost-empty-title = Батарея ИБП почти разряжена
battery-very-low-body = { $left } Подключите питание в ближайшее время.
battery-almost-empty-body = { $left } Подключите питание сейчас, чтобы не потерять несохранённые данные.

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
privacy-windows-using = Использует ваши окна
privacy-windows-seeing = Видит ваши окна
privacy-windows-stop = Закрыть доступ

## Window access prompt

peek-see-title = Программа { $app } хочет видеть ваши окна
peek-see-description = Программа сможет делать снимки любого открытого окна.
peek-use-title = Программа { $app } хочет видеть ваши окна и управлять ими
peek-use-description = Программа сможет видеть любое открытое окно, а также нажимать и печатать в нём, как будто это делаете вы.
peek-deny = Не разрешать
peek-allow-once = Разрешить один раз
peek-allow-until-quit = Разрешить до закрытия программы

## Window access errors

peek-error-declined = Пользователь этого компьютера отклонил запрос. Программа { $app } сможет запросить доступ снова после закрытия.
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
