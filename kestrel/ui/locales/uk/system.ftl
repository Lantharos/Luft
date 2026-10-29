## Shared

system-cancel = Скасувати

## Dictation notifications

dictation-setup-title = Введення тексту голосом
dictation-setup-body = Говоріть, і сказане буде введено в будь-якій програмі. Розпізнавання відбувається на цьому комп’ютері, тому спершу потрібна мовна модель.
dictation-setup-action = Налаштувати диктування
dictation-unsupported-title = Диктування для мови { $language } недоступне на цьому комп’ютері
dictation-unsupported-body = Процесор цього комп’ютера не може запустити розпізнавач мовлення, потрібний для мови { $language }. Можна диктувати іншою мовою.
dictation-settings-action = Параметри диктування

## System health notifications

health-gpu-reset-title = Графічний драйвер перестав відповідати
health-gpu-reset-body = { $day ->
    [today] Сьогодні о { $time } комп’ютер сам перезавантажився. У Параметрах можна дізнатися, як цьому запобігти.
   *[other] Комп’ютер сам перезавантажився { $date } о { $time }. У Параметрах можна дізнатися, як цьому запобігти.
}
health-gpu-reset-details = Докладніше

oom-app-closed-title = Програму { $app } закрито, щоб звільнити пам’ять
oom-container-closed-title = Контейнер закрито, щоб звільнити пам’ять
oom-closed-body = На комп’ютері закінчувалася пам’ять, тому довелося це зробити, щоб усе інше й далі працювало без затримок.
oom-closed-body-with-size = На комп’ютері закінчувалася пам’ять, тому довелося це зробити, щоб усе інше й далі працювало без затримок. Використано пам’яті: { $size }.
memory-low-title = У системі Luft закінчується пам’ять
memory-low-app-body = Програма { $app } використовує { $size }. Примусово закрийте її, щоб усе інше й далі працювало без затримок.
memory-low-container-body = Контейнер використовує { $size }. Примусово закрийте його, щоб усе інше й далі працювало без затримок.
memory-low-force-quit = Примусово закрити

## Input source indicator

input-source-indicator = Джерело введення: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Режим польоту ввімкнено апаратним перемикачем
media-keys-airplane-mode-on = Режим польоту ввімкнено
media-keys-airplane-mode-off = Режим польоту вимкнено
media-keys-bluetooth-on = Bluetooth увімкнено
media-keys-bluetooth-off = Bluetooth вимкнено
media-keys-caps-lock-on = Caps Lock увімкнено
media-keys-caps-lock-off = Caps Lock вимкнено
media-keys-num-lock-on = Num Lock увімкнено
media-keys-num-lock-off = Num Lock вимкнено

## VPN sign-in

vpn-sign-in-title = Вхід у { $connection }
vpn-connect = Під’єднатися
vpn-signing-in = Вхід…
vpn-finish-in-browser = Завершіть вхід у браузері.
vpn-certificate-untrusted = Сервер { $host } надав сертифікат, який не вдалося перевірити ({ $reason }). Його відбиток: { $fingerprint }.
vpn-certificate-warning = Хтось може видавати себе за цей сервер. Під’єднуйтеся, лише якщо ви цього очікували.
vpn-certificate-connect = Усе одно під’єднатися

vpn-field-password = Пароль
vpn-field-certificate-password = Пароль сертифіката
vpn-field-proxy-password = Пароль проксі
vpn-field-pre-shared-key = Попередньо наданий ключ
vpn-field-group-password = Пароль групи

## Battery notifications

battery-left = Залишилося { $percent }.
battery-left-with-time = Залишилося { $percent }, приблизно { $duration }.
battery-low-title = Низький заряд акумулятора
battery-very-low-title = Дуже низький заряд акумулятора
battery-almost-empty-title = Акумулятор майже розряджено
battery-ups-low-title = Низький заряд ДБЖ
battery-ups-very-low-title = Дуже низький заряд ДБЖ
battery-ups-almost-empty-title = ДБЖ майже розряджено
battery-very-low-body = { $left } Незабаром під’єднайте живлення.
battery-almost-empty-body = { $left } Під’єднайте живлення зараз, щоб не втратити незбережену роботу.

battery-device-low-title = { $device }: низький заряд акумулятора
battery-device-very-low-title = { $device }: дуже низький заряд акумулятора
battery-device-low-body = { $left } Незабаром зарядіть пристрій.
battery-device-very-low-body = { $left } Зарядіть пристрій зараз, щоб він не вимкнувся.

battery-device-mouse = Миша
battery-device-keyboard = Клавіатура
battery-device-phone = Телефон
battery-device-tablet = Планшет
battery-device-controller = Контролер
battery-device-pen = Перо
battery-device-touchpad = Сенсорна панель
battery-device-headset = Гарнітура
battery-device-speaker = Динамік
battery-device-headphones = Навушники
battery-device-remote = Пульт
battery-device-other = Під’єднаний пристрій

## Privacy indicator

privacy-indicator = Задіяно: { $things }
privacy-thing-camera = камера
privacy-thing-microphone = мікрофон
privacy-thing-screen = екран
privacy-thing-location = розташування
privacy-thing-windows = вікна

privacy-camera-unknown-app = Програма використовує камеру
privacy-stop-sharing = Припинити показ екрана
privacy-stop-recording = Зупинити запис
privacy-turn-off-location = Вимкнути визначення розташування
privacy-settings = Параметри конфіденційності
privacy-camera = Камера
privacy-microphone = Мікрофон
privacy-microphone-muted = Мікрофон вимкнено
privacy-mute-microphone = Вимкнути мікрофон
privacy-unmute-microphone = Увімкнути мікрофон
privacy-close-app = Закрити { $app }
privacy-unknown-app = Невідома програма
privacy-reported-app = «{ $name }» (назву не перевірено)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } програма може бачити ваші вікна
    [few] { $count } програми можуть бачити ваші вікна
    [many] { $count } програм можуть бачити ваші вікна
   *[other] { $count } програми можуть бачити ваші вікна
}
privacy-windows-using-programs = { $count ->
    [one] { $count } програма може бачити ваші вікна й керувати ними
    [few] { $count } програми можуть бачити ваші вікна й керувати ними
    [many] { $count } програм можуть бачити ваші вікна й керувати ними
   *[other] { $count } програми можуть бачити ваші вікна й керувати ними
}
privacy-windows-stop = Припинити доступ

## Window access prompt
# A program (often a coding assistant) asks to see or control the windows on the screen. $app is its name.

peek-see-request = Дозволити запущеній вами програмі бачити ваші вікна?
peek-see-description = Ця програма зможе робити знімки будь-якого відкритого вікна.
peek-use-request = Дозволити запущеній вами програмі бачити ваші вікна й керувати ними?
peek-use-description = Ця програма зможе бачити будь-яке відкрите вікно, клацати й вводити текст у ньому так, ніби це робите ви.
peek-deny = Не дозволяти
peek-allow-once = Дозволити один раз
peek-allow-until-quit = Дозволити, доки працює

## Window access errors
# Shown in a terminal to the person or program that ran the peek command. "peek run" and "peek list" are commands and stay as they are.

peek-error-declined-until-quit = Користувач цього комп’ютера відхилив запит. Програма зможе запитати знову, коли завершить роботу.
peek-error-not-allowed = Користувач цього комп’ютера цього не дозволив
peek-error-sandboxed = Програми в пісочниці не можуть бачити інші вікна чи керувати ними
peek-error-unknown-caller = Програма, що надіслала запит, завершила роботу або її не вдалося розпізнати
peek-error-no-caller = Сеансова шина не повідомила, яка програма надсилає запит
peek-error-screen-busy = Екран заблоковано або на ньому відкрито системний запит. Спробуйте ще раз, коли його закриють.
peek-error-input-held = Хтось утримує клавіші або кнопки миші. Спробуйте ще раз за мить.
peek-error-input-dropped = Введення зупинено, бо в момент надходження під вказівником було щось інше або клавіатура була зайнята іншим вікном
peek-error-not-in-front = Не вдалося вивести вікно на передній план
peek-error-covered = Цю частину вікна перекриває щось інше
peek-error-outside = Точка { $x }, { $y } лежить поза знімком вікна розміром { $width } × { $height }
peek-error-nothing-to-capture = Вікно не показує нічого, що можна захопити
peek-error-window-picture-late = Знімок вікна не було підготовлено вчасно
peek-error-screen-picture-late = Знімок екрана не було підготовлено вчасно
peek-error-no-window-id = Немає вікна з ідентифікатором { $id }. Відкриті вікна показує peek list.
peek-error-no-window-for-handle = Програма, запущена як { $handle }, не має відкритих вікон
peek-error-ended-before-window = Програма завершила роботу, перш ніж відкрила вікно
peek-error-no-window-in-time = Протягом { $duration } не відкрилося жодне вікно
peek-error-launch-not-started-by-peek = Запустити можна лише програму, яку запустила сама команда peek run
peek-error-ended-while-starting = Програма завершила роботу під час запуску
peek-error-launch-failed = systemd не вдалося запустити { $program }
peek-error-unknown-handle = Жодна програма, запущена через peek run, не має дескриптора { $handle }, або вона вже завершила роботу
peek-error-unknown-key = Клавіша { $key } невідома для peek
peek-error-unknown-modifier = { $modifier } не є клавішею-модифікатором. Використовуйте ctrl, shift, alt або super.
peek-error-display-owner = Цей дисплей належить іншій програмі
peek-error-display-run = Програми на прихованому дисплеї запускає peek run
peek-error-display-handle = Цей дисплей запущено як { $handle }, а не { $requested }

## Quick settings tiles

auto-rotate-title = Автоповорот
dark-style-title = Темний стиль
do-not-disturb-title = Не турбувати
night-light-title = Нічне світло
airplane-mode-title = Режим польоту

## Power mode

power-profile-title = Режим живлення
power-profile-header = Режим живлення
power-profile-open-menu = Відкрити меню режимів живлення
power-profile-settings = Параметри живлення
power-profile-performance = Продуктивність
power-profile-balanced = Збалансований
power-profile-power-saver = Енергозбереження
power-profile-custom = Користувацький

## Keep awake

caffeine-title = Не засинати
caffeine-open-menu = Відкрити меню «Не засинати»
caffeine-until = До { $time }
caffeine-until-turned-off = До вимкнення
caffeine-30-minutes = 30 хвилин
caffeine-1-hour = 1 година
caffeine-2-hours = 2 години
caffeine-inhibit-reason = Увімкнено «Не засинати» у швидких параметрах

## Brightness

brightness-title = Яскравість
brightness-open-menu = Відкрити меню яскравості

## Keyboard backlight

backlight-title = Підсвічування клавіатури
backlight-open-menu = Відкрити меню яскравості клавіатури
backlight-slider = Яскравість клавіатури
backlight-off = Вимкнено
backlight-low = Низьке
backlight-high = Високе

## Sound

volume-sound-settings = Параметри звуку
volume-mute = Вимкнути звук
volume-unmute = Увімкнути звук
volume-output-slider = Гучність
volume-output-title = Виведення звуку
volume-output-open-menu = Відкрити меню виведення звуку
volume-input-slider = Мікрофон
volume-input-title = Введення звуку
volume-input-open-menu = Відкрити меню введення звуку

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Відкрити меню Bluetooth
bluetooth-settings = Параметри Bluetooth
bluetooth-connect = Під’єднати
bluetooth-disconnect = Від’єднати
bluetooth-connect-device = Під’єднати { $deviceName }
bluetooth-disconnect-device = Від’єднати { $deviceName }
bluetooth-no-devices = Немає доступних або під’єднаних пристроїв
bluetooth-turn-on-hint = Увімкніть Bluetooth, щоб під’єднувати пристрої
bluetooth-connected-count = { $count ->
    [one] Під’єднано { $count }
    [few] Під’єднано { $count }
    [many] Під’єднано { $count }
   *[other] Під’єднано { $count }
}

## Network menus in quick settings

network-menu-unknown-network = <невідома>
network-menu-connect = Під’єднатися
network-menu-disconnect = Від’єднатися
network-menu-connect-to = Під’єднатися до { $name }
network-menu-disconnect-from = Від’єднатися від { $name }
network-menu-turn-off = Вимкнути
network-menu-wifi-network = { $secure ->
    [yes] { $name }, захищена, рівень сигналу { $strength }%
   *[no] { $name }, незахищена, рівень сигналу { $strength }%
}
network-menu-hotspot = Точка доступу { $name }
network-menu-connected-count = { $count ->
    [one] Під’єднано { $count }
    [few] Під’єднано { $count }
    [many] Під’єднано { $count }
   *[other] Під’єднано { $count }
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Відкрити меню VPN
network-menu-vpn-settings = Параметри VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Відкрити меню Wi-Fi
network-menu-wifi-settings = Усі мережі
network-menu-wired = Дротові з’єднання
network-menu-wired-open-menu = Відкрити меню дротових з’єднань
network-menu-wired-settings = Параметри дротової мережі
network-menu-tethers = Модеми Bluetooth
network-menu-tethers-open-menu = Відкрити меню модемів Bluetooth
network-menu-tether = Модем
network-menu-tether-settings = Параметри Bluetooth
network-menu-mobile-connections = Мобільні з’єднання
network-menu-mobile-open-menu = Відкрити меню мобільних з’єднань
network-menu-mobile-settings = Параметри мобільного інтернету
network-menu-mobile = Мобільний
network-device-wired = Дротова мережа
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Вхід у мережу
network-menu-failed-title = Не вдалося під’єднатися
network-menu-failed-body = Не вдалося активувати мережеве з’єднання

## Location access dialog

location-dialog-title = Дозволити доступ до розташування
location-dialog-description = Програма { $appName } хоче отримати доступ до вашого розташування
location-dialog-info = Доступ до розташування можна будь-коли змінити в параметрах конфіденційності
location-dialog-deny = Заборонити
location-dialog-grant = Дозволити

## Thunderbolt notifications

thunderbolt-unknown-title = Невідомий пристрій Thunderbolt
thunderbolt-unknown-body = Поки вас не було, під’єднано новий пристрій. Від’єднайте його й під’єднайте знову, щоб почати ним користуватися.
thunderbolt-unauthorized-title = Неавторизований пристрій Thunderbolt
thunderbolt-unauthorized-body = Під’єднано новий пристрій, для якого потрібен дозвіл адміністратора
thunderbolt-error-title = Помилка авторизації Thunderbolt
thunderbolt-error-body = Не вдалося авторизувати пристрій Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Заборонити
access-dialog-allow = Дозволити

## Display change confirmation

display-change-title = Зберегти ці параметри дисплея?
display-change-countdown = { $seconds ->
    [one] Зміни буде скасовано через { $seconds } секунду
    [few] Зміни буде скасовано через { $seconds } секунди
    [many] Зміни буде скасовано через { $seconds } секунд
   *[other] Зміни буде скасовано через { $seconds } секунди
}
display-change-revert = Повернути
display-change-keep = Зберегти зміни

## Drive connected notification

autorun-connected = Під’єднано «{ $driveName }»
autorun-ready = Диском уже можна користуватися
autorun-open-with = Відкрити в { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Повільні клавіші ввімкнено
kbd-a11y-slow-keys-off = Повільні клавіші вимкнено
kbd-a11y-slow-keys-description = Ви утримували клавішу Shift 8 секунд. Це сполучення вмикає повільні клавіші, які змінюють роботу клавіатури.
kbd-a11y-sticky-keys-on = Залипання клавіш увімкнено
kbd-a11y-sticky-keys-off = Залипання клавіш вимкнено
kbd-a11y-sticky-keys-on-description = Ви натиснули клавішу Shift 5 разів поспіль. Це сполучення вмикає залипання клавіш, яке змінює роботу клавіатури.
kbd-a11y-sticky-keys-off-description = Ви натиснули дві клавіші одночасно або натиснули Shift 5 разів поспіль. Це вимикає залипання клавіш, яке змінює роботу клавіатури.
kbd-a11y-leave-on = Залишити ввімкненим
kbd-a11y-turn-on = Увімкнути
kbd-a11y-turn-off = Вимкнути
kbd-a11y-leave-off = Залишити вимкненим

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Виберіть аудіопристрій
audio-device-cancel = Скасувати
audio-device-sound-settings = Параметри звуку
audio-device-headphones = Навушники
audio-device-headset = Гарнітура
audio-device-microphone = Мікрофон

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Дозволити перехоплення сполучень клавіш
inhibit-shortcuts-app = Програма { $appName } хоче перехоплювати системні сполучення клавіш
inhibit-shortcuts-unknown-app = Програма хоче перехоплювати системні сполучення клавіш
inhibit-shortcuts-titled-app = Програма з вікном «{ $title }» хоче перехоплювати системні сполучення клавіш
inhibit-shortcuts-restore = Щоб повернути сполучення клавіш, натисніть { $shortcut }
inhibit-shortcuts-deny = Заборонити
inhibit-shortcuts-allow = Дозволити

## Unlocking encrypted drives

mount-hidden-volume = Прихований том
mount-windows-system-volume = Системний том Windows
mount-uses-keyfiles = Використовує ключові файли
mount-keyfiles-use-app = Щоб розблокувати том із ключовими файлами, скористайтеся програмою <i>{ $appName }</i>
mount-keyfiles-need-app = Щоб розблокувати том із ключовими файлами, потрібна окрема програма, як-от <i>Диски</i>
mount-pim-number = Число PIM
mount-pim-invalid = PIM має бути числом або залишатися порожнім
mount-password = Пароль
mount-remember-password = Запам’ятати пароль
mount-cancel = Скасувати
mount-unlock = Розблокувати
mount-open-app = Відкрити { $appName }
mount-wrong-password = Не вдалося. Спробуйте ще раз.
mount-unlock-failed = Не вдалося розблокувати том
mount-pim-unsupported = Встановлена версія udisks не підтримує параметр PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Потрібна автентифікація
network-agent-wifi-rejected = Збережений пароль для мережі «{ $networkName }» не підійшов. Введіть його ще раз.
network-agent-wifi-secrets = Щоб отримати доступ до бездротової мережі «{ $networkName }», потрібен пароль або ключ шифрування
network-agent-wps-hint = Також можна під’єднатися, натиснувши кнопку «WPS» на маршрутизаторі
network-agent-wired-title = Автентифікація 802.1X для дротової мережі
network-agent-dsl-title = Автентифікація DSL
network-agent-pin-title = Потрібен PIN-код
network-agent-pin-body = Для пристрою мобільного інтернету потрібен PIN-код
network-agent-vpn-title = Пароль VPN
network-agent-password-required = Щоб під’єднатися до «{ $networkName }», потрібен пароль
network-agent-connect = Під’єднатися
network-agent-cancel = Скасувати
network-agent-password = Пароль
network-agent-username = Ім’я користувача
network-agent-key = Ключ
network-agent-private-key-password = Пароль приватного ключа
network-agent-identity = Ідентифікатор
network-agent-service = Служба
network-agent-network-name = Назва мережі
network-agent-pin = PIN-код

## Screenshots and screen recording

screenshot-source = Знімки й записи екрана
screenshot-area = Вибрати область
screenshot-screen = Вибрати екран
screenshot-window = Вибрати вікно
screenshot-take = Зробити знімок екрана
screenshot-record = Записати екран
screenshot-show-pointer = Показувати вказівник
screenshot-capture = Зняти
screenshot-close = Закрити
screenshot-screencasts-folder = Записи екрана
screenshot-screencast-file = Запис екрана { $date } { $time }
screenshot-screenshots-folder = Знімки екрана
screenshot-file = Знімок екрана { $timestamp }
screenshot-screencast-recorded = Запис екрана збережено
screenshot-screencast-start-failed = Не вдалося почати запис екрана
screenshot-screencast-out-of-space = Не вдалося записати екран: на диску закінчилося місце
screenshot-screencast-try-again = Не вдалося записати екран. Спробуйте ще раз
screenshot-screencast-failed = Не вдалося записати екран
screenshot-screencast-view = Клацніть, щоб переглянути відео
screenshot-show-in-rover = Показати в Rover
screenshot-captured = Знімок екрана зроблено
screenshot-captured-body = Зображення можна вставити з буфера обміну

## System updates
updates-available-title = Доступні оновлення системи
updates-available-body = Відкрийте Параметри, щоб завантажити і встановити їх.
updates-ready-title = Оновлення готові до встановлення
updates-ready-body = Перезавантажте комп’ютер, коли буде зручно, щоб встановити їх.
