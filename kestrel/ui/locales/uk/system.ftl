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
privacy-windows-using = Використовує ваші вікна
privacy-windows-seeing = Бачить ваші вікна
privacy-windows-stop = Припинити доступ

## Window access prompt
# A program (often a coding assistant) asks to see or control the windows on the screen. $app is its name.

peek-see-title = { $app } хоче бачити ваші вікна
peek-see-description = Ця програма зможе робити знімки будь-якого відкритого вікна.
peek-use-title = { $app } хоче бачити ваші вікна й керувати ними
peek-use-description = Ця програма зможе бачити будь-яке відкрите вікно, клацати й вводити текст у ньому так, ніби це робите ви.
peek-deny = Не дозволяти
peek-allow-once = Дозволити один раз
peek-allow-until-quit = Дозволити, доки працює

## Window access errors
# Shown in a terminal to the person or program that ran the peek command. "peek run" and "peek list" are commands and stay as they are.

peek-error-declined = Користувач цього комп’ютера відхилив запит. Програма { $app } зможе запитати знову, коли завершить роботу.
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
