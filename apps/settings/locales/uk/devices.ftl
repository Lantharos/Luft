## Displays

settings-display-mirror = Дублювати дисплеї
settings-display-mirror-description = Показує однакове зображення на всіх дисплеях
settings-display-mirrored = Дубльовані дисплеї
settings-display-display = Дисплей
settings-display-apply-failed = Ці параметри не спрацювали. Спробуйте інше налаштування.
settings-display-reset = Скинути
settings-display-apply = Застосувати
settings-display-arrangement-main = { $name }, основний дисплей
settings-display-use = Використовувати цей дисплей
settings-display-main = Основний дисплей
settings-display-main-description = Тут з’являються панель завдань і нові вікна
settings-display-resolution-title = Роздільна здатність
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Частота оновлення
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Гц
settings-display-variable-refresh = Змінна частота оновлення
settings-display-variable-refresh-description = Дисплей підлаштовується під частоту кадрів повноекранних ігор, тож рух плавніший
settings-display-variable-refresh-off = Вимкнено
settings-display-variable-refresh-games = В іграх
settings-display-variable-refresh-fullscreen = У всіх повноекранних програмах
settings-display-scale = Масштаб
settings-display-scale-description = Збільшує або зменшує текст, програми й усе інше
settings-display-orientation = Орієнтація
settings-display-orientation-landscape = Альбомна
settings-display-orientation-portrait-right = Книжкова, праворуч
settings-display-orientation-portrait-left = Книжкова, ліворуч
settings-display-orientation-landscape-flipped = Альбомна, перевернута

## Display brightness

settings-display-brightness = Яскравість
settings-display-brightness-label = Яскравість: { $name }
settings-display-brightness-unsupported = Увімкніть DDC/CI в меню дисплея, щоб змінювати її тут
settings-display-brightness-unresponsive = Зараз не відповідає, незабаром буде нова спроба
settings-display-brightness-external = Зовнішні дисплеї
settings-display-brightness-missing-tool = Встановіть ddcutil, щоб змінювати їхню яскравість тут
settings-display-brightness-needs-restart = Перезавантажте комп’ютер, щоб завершити налаштування їхньої яскравості
settings-display-brightness-no-access = Вийдіть і увійдіть знову, щоб змінювати їхню яскравість тут

## Night light

settings-display-night-light = Нічне світло
settings-display-night-light-description = Тепліші кольори ввечері, менше навантаження на очі
settings-display-night-light-schedule = Розклад
settings-display-night-light-automatic = Від заходу до світанку
settings-display-night-light-custom = Власний
settings-display-night-light-from = Вмикається
settings-display-night-light-to = Вимикається
settings-display-night-light-warmth = Теплота

## Sound

settings-sound-output = Вихід
settings-sound-input = Вхід
settings-sound-device = Пристрій
settings-sound-output-device = Пристрій виведення
settings-sound-input-device = Пристрій введення
settings-sound-connection = Під’єднання
settings-sound-output-connection = Під’єднання виведення
settings-sound-input-connection = Під’єднання введення
settings-sound-volume = Гучність
settings-sound-mute = Вимкнути звук: { $name }
settings-sound-unmute = Увімкнути звук: { $name }
settings-sound-balance = Баланс
settings-sound-balance-center = По центру
settings-sound-balance-left = Ліворуч { $share }
settings-sound-balance-right = Праворуч { $share }
settings-sound-louder = Дозволити гучність понад 100%
settings-sound-louder-description = На високій гучності звук може спотворюватися
settings-sound-input-level = Рівень входу
settings-sound-apps = Гучність програм
settings-sound-apps-playing = { $count ->
    [one] { $count } програма відтворює звук
    [few] { $count } програми відтворюють звук
    [many] { $count } програм відтворюють звук
   *[other] { $count } програми відтворюють звук
}
settings-sound-app-output = Пристрій для програми { $app }
settings-sound-profiles = Профілі пристроїв
settings-sound-profiles-row-description = Виберіть, як використовувати кожен звуковий пристрій
settings-sound-profiles-description = Як використовується кожен звуковий пристрій, наприклад стерео чи об’ємний звук
settings-sound-profile-label = Профіль пристрою { $device }
settings-sound-profile-off = Вимкнено

## System sounds

settings-sound-system = Звуки системи
settings-sound-system-description = Звуки сповіщень, пристроїв та інших подій
settings-sound-system-volume = Гучність звуків системи
settings-sound-kind-notifications = Сповіщення
    .description = Вимкнені в режимі «Не турбувати», в іграх і під час показу екрана
    .preview = Відтворити звук сповіщення
settings-sound-kind-devices = Пристрої й заряджання
    .description = Під’єднання пристрою чи зарядного пристрою, низький заряд акумулятора
    .preview = Відтворити звук пристрою
settings-sound-kind-volume = Відгук гучності
    .description = Клацання під час зміни гучності
    .preview = Відтворити клацання гучності
settings-sound-kind-screenshots = Знімки екрана
    .description = Звук затвора, коли знімок екрана збережено
    .preview = Відтворити звук затвора
settings-sound-kind-recording = Запис
    .description = Коли запис екрана, камера чи диктування вмикаються й вимикаються
    .preview = Відтворити звук запису
settings-sound-kind-sign-in = Звук входу
    .description = Коли з’являється робочий стіл
    .preview = Відтворити звук входу
settings-sound-kind-keyboard = Натискання клавіш
    .description = Кожна клавіша екранної клавіатури
    .preview = Відтворити натискання клавіші

## Power and battery

settings-power-battery = Акумулятор
settings-power-charging = Заряджання
settings-power-charging-at = Заряджання, { $power }
settings-power-charging-until-full = Заряджання, до повного заряду: { $time }
settings-power-charging-at-until-full = Заряджання, { $power }, до повного заряду: { $time }
settings-power-on-battery = Від акумулятора
settings-power-on-battery-using = Від акумулятора, споживання { $power }
settings-power-time-left = Залишилося приблизно { $time }
settings-power-time-left-using = Залишилося приблизно { $time }, споживання { $power }
settings-power-full = Повністю заряджено
settings-power-empty = Розряджено
settings-power-not-charging = Під’єднано до живлення, не заряджається
settings-power-health = Стан акумулятора
settings-power-capacity = { $full } з { $design } нового акумулятора
settings-power-cycles = { $count ->
    [one] { $cycles } цикл заряджання
    [few] { $cycles } цикли заряджання
    [many] { $cycles } циклів заряджання
   *[other] { $cycles } циклу заряджання
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Вт·год
settings-power-show-percentage = Показувати відсотки
settings-power-show-percentage-description = Показує рівень заряду всередині значка акумулятора

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = менше хвилини
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } хвилина
    [few] { $minutes } хвилини
    [many] { $minutes } хвилин
   *[other] { $minutes } хвилини
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } година
    [few] { $hours } години
    [many] { $hours } годин
   *[other] { $hours } години
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } година
    [few] { $hours } години
    [many] { $hours } годин
   *[other] { $hours } години
} { $minutes ->
    [one] { $minutes } хвилина
    [few] { $minutes } хвилини
    [many] { $minutes } хвилин
   *[other] { $minutes } хвилини
}
settings-power-never = Ніколи

## Charge limit

settings-power-limit = Обмежувати заряджання
settings-power-limit-failed = Не вдалося змінити обмеження. Спробуйте ще раз.
settings-power-limit-elsewhere-off = Інша програма вимкнула обмеження, тому акумулятор заряджається повністю
settings-power-limit-elsewhere-changed = Інша програма змінила обмеження на { $level }
settings-power-limit-elsewhere-on = Інша програма зупиняє заряджання на { $level }
settings-power-limit-automatic = Комп’ютер сам вирішує, коли зупиняти заряджання
settings-power-limit-stops-at = Заряджання зупиняється на { $level }
settings-power-limit-description = Зупиняє заряджання раніше, щоб акумулятор довше служив
settings-power-limit-description-at = Зупиняє на { $level }, щоб акумулятор довше служив
settings-power-limit-applied = Заряджання зупиняється на { $level }
settings-power-limit-applied-description = Налаштовано іншою програмою на цьому комп’ютері

## Battery-powered devices

settings-power-devices = Пристрої
settings-power-device-mouse = Миша
settings-power-device-keyboard = Клавіатура
settings-power-device-headphones = Навушники
settings-power-device-speaker = Динамік
settings-power-device-controller = Контролер
settings-power-device-phone = Телефон
settings-power-device-tablet = Планшет
settings-power-device-pen = Перо
settings-power-device-touchpad = Сенсорна панель
settings-power-device-other = Пристрій

## Power mode

settings-power-mode = Режим живлення
settings-power-mode-row = Режим
settings-power-profile-saver = Енергозбереження
    .description = Повільніше, але з меншим споживанням енергії
settings-power-profile-balanced = Збалансований
    .description = Звичайна продуктивність і споживання енергії
settings-power-profile-performance = Продуктивність
    .description = Швидше, але з більшим споживанням енергії
settings-power-limited = Продуктивність зараз обмежено
settings-power-limited-lap = Продуктивність обмежено, бо комп’ютер лежить на колінах
settings-power-limited-hot = Продуктивність обмежено, бо комп’ютер надто гарячий
settings-power-limited-lap-hot = Продуктивність обмежено, бо комп’ютер лежить на колінах і надто гарячий
settings-power-saver-low-battery = Енергозбереження за низького заряду
settings-power-saver-low-battery-description = Вмикає енергозбереження, коли акумулятор розряджається

## Keyboard backlight

settings-power-keyboard = Клавіатура
settings-power-backlight = Підсвічування клавіатури
settings-power-backlight-off = Вимкнено
settings-power-backlight-low = Слабке
settings-power-backlight-medium = Середнє
settings-power-backlight-high = Яскраве

## Screen and sleep

settings-power-screen = Екран
settings-power-screen-off = Вимикати екран через
settings-power-screen-off-description = Якщо комп’ютером якийсь час не користуються
settings-power-dim = Затемнювати під час бездіяльності
settings-power-dim-description = Зменшує яскравість незадовго до вимкнення екрана
settings-power-sleep = Сплячий режим
settings-power-suspend-plugged-in = Сплячий режим від мережі
settings-power-suspend-inactive = Сплячий режим під час бездіяльності
settings-power-suspend-description = Переводить комп’ютер у сплячий режим, якщо ним якийсь час не користуються
settings-power-suspend-battery = Сплячий режим від акумулятора
settings-power-button = Кнопка живлення
settings-power-button-suspend = Сплячий режим
settings-power-button-hibernate = Гібернація
settings-power-button-ask = Запитувати
settings-power-button-nothing = Нічого не робити
settings-power-long-sleep = Вимикати після тривалого сну
settings-power-long-sleep-description = Щоб акумулятор не розрядився повністю у сплячому режимі, комп’ютер вимикається, коли заряд стає низьким або після тривалого сну від акумулятора. Відкриті вікна не зберігаються.
settings-power-long-sleep-failed = Не вдалося змінити цей параметр. Спробуйте ще раз.
settings-power-long-sleep-after = Вимикати через
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } годину
    [few] { $hours } години
    [many] { $hours } годин
   *[other] { $hours } години
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } день
    [few] { $days } дні
    [many] { $days } днів
   *[other] { $days } дня
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } тиждень
    [few] { $weeks } тижні
    [many] { $weeks } тижнів
   *[other] { $weeks } тижня
}

## Keyboard

settings-keyboard-sources = Джерела введення
settings-keyboard-sources-description = Перше використовується за замовчуванням. Перемикайтеся між ними під час введення.
settings-keyboard-source-edit = Змінити в Keys
settings-keyboard-source-up = Перемістити вгору
settings-keyboard-source-down = Перемістити вниз
settings-keyboard-source-remove = Вилучити
settings-keyboard-add-source-button = Додати джерело введення
settings-keyboard-own = Власні розкладки й методи введення
settings-keyboard-own-layout = Створити розкладку
settings-keyboard-own-layout-description = Візьміть готову розкладку й змініть те, що вводять її клавіші
settings-keyboard-own-method = Створити метод введення
settings-keyboard-own-method-description = Перетворюйте введене на символи з діакритикою, інші писемності чи слова на вибір
settings-keyboard-own-open = Відкрити Keys
settings-keyboard-own-open-description = Змінюйте розкладки й методи введення, які ви створили
settings-keyboard-switch-source = Перемкнути джерело введення
settings-keyboard-add-source = Додати джерело введення
settings-keyboard-add-source-description = Виберіть розкладку клавіатури або метод введення, яким хочете користуватися.
settings-keyboard-add-source-search = Пошук мов, розкладок і методів введення
settings-keyboard-input-method = Метод введення
settings-keyboard-add-source-no-match = Немає збігів для «{ $query }»
settings-keyboard-cancel = Скасувати
settings-keyboard-add = Додати
settings-keyboard-typing = Введення
settings-keyboard-repeat = Повторення клавіш
settings-keyboard-repeat-description = Утримувана клавіша вводиться знову й знову
settings-keyboard-repeat-delay = Затримка перед повторенням
settings-keyboard-repeat-delay-shorter = Коротша
settings-keyboard-repeat-delay-longer = Довша
settings-keyboard-repeat-speed = Швидкість повторення
settings-keyboard-repeat-speed-slower = Повільніше
settings-keyboard-repeat-speed-faster = Швидше
settings-keyboard-caps-lock = Клавіша Caps Lock
settings-keyboard-caps-lock-description = Що відбувається, коли ви її натискаєте
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Поміняти місцями з Esc
settings-keyboard-caps-lock-nothing = Нічого
settings-keyboard-caps-lock-custom = Власне налаштування
settings-keyboard-lock-notices = Показувати Caps Lock і Num Lock
settings-keyboard-lock-notices-description = Ненадовго показує на екрані, коли будь-яку з них увімкнено чи вимкнено
settings-keyboard-dictation-on = Увімкнено
settings-keyboard-dictation-off = Вимкнено
settings-keyboard-shortcuts-description = Переглядайте й змінюйте сполучення клавіш або додавайте власні

## Copilot key

settings-keyboard-copilot = Клавіша Copilot
settings-keyboard-copilot-press = Натискання
settings-keyboard-copilot-press-description = Що відбувається після короткого натискання клавіші
settings-keyboard-copilot-open-start = Відкрити меню Пуск
settings-keyboard-copilot-open-app = Відкрити програму
settings-keyboard-copilot-nothing = Нічого
settings-keyboard-copilot-app = Програма
settings-keyboard-copilot-no-app = Програму ще не вибрано
settings-keyboard-copilot-change = Змінити
settings-keyboard-copilot-choose = Вибрати
settings-keyboard-copilot-hold = Утримувати для диктування
settings-keyboard-copilot-hold-description = Утримуйте клавішу й говоріть, щоб вводити сказане
settings-keyboard-copilot-hold-off = Працює, коли диктування увімкнено
settings-keyboard-copilot-choose-app = Вибір програми
settings-keyboard-copilot-choose-app-description = Натискання клавіші Copilot відкриває її.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Shift
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Print Screen
settings-keys-page-up = Page Up
settings-keys-page-down = Page Down
settings-keys-home = Home
settings-keys-end = End
settings-keys-insert = Insert
settings-keys-delete = Delete
settings-keys-tab = Tab
settings-keys-space = Пробіл
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menu
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Гучніше
settings-keys-volume-down = Тихіше
settings-keys-mute = Вимкнути звук
settings-keys-microphone-mute = Вимкнути мікрофон
settings-keys-play = Відтворити
settings-keys-media-pause = Пауза
settings-keys-stop = Стоп
settings-keys-next-track = Наступна доріжка
settings-keys-previous-track = Попередня доріжка
settings-keys-brightness-up = Яскравіше
settings-keys-brightness-down = Темніше
settings-keys-browser = Браузер
settings-keys-home-page = Домашня сторінка
settings-keys-search = Пошук
settings-keys-mail = Пошта
settings-keys-calculator = Калькулятор
settings-keys-files = Файли
settings-keys-eject = Вийняти
settings-keys-power = Живлення
settings-keys-lock = Блокування

## Keyboard shortcuts

settings-shortcuts-title = Сполучення клавіш
settings-shortcuts-search = Пошук сполучень клавіш
settings-shortcuts-category-system = Система
settings-shortcuts-category-windows = Вікна
settings-shortcuts-category-workspaces = Робочі простори
settings-shortcuts-category-screenshots = Знімки екрана
settings-shortcuts-category-media = Медіа
settings-shortcuts-reset = Скинути до стандартного
settings-shortcuts-apps = Сполучення клавіш програм
settings-shortcuts-apps-description = Ті, про які попросили програми; працюють, навіть коли програма не на передньому плані
settings-shortcuts-no-match = Немає сполучень клавіш для «{ $query }»
settings-shortcuts-change = Змінити сполучення клавіш для «{ $name }»
settings-shortcuts-or = або
settings-shortcuts-not-set = Не задано
settings-shortcuts-press-keys = Натисніть потрібні клавіші
settings-shortcuts-needs-modifier = Додайте Ctrl, Alt або Super, щоб сполучення не заважало введенню тексту.
settings-shortcuts-record-description = Натисніть нове сполучення. Backspace вимикає його, Esc скасовує.
settings-shortcuts-record-taken = Це сполучення вже використовується для дії «{ $name }». Якщо замінити його, там воно вимкнеться.
settings-shortcuts-try-another = Спробувати інше
settings-shortcuts-replace = Замінити
settings-shortcuts-cancel = Скасувати
settings-shortcuts-custom = Власні сполучення клавіш
settings-shortcuts-custom-description = Запускайте команду або відкривайте програму сполученням клавіш
settings-shortcuts-untitled = Без назви
settings-shortcuts-add = Додати сполучення клавіш
settings-shortcuts-edit = Змінити сполучення клавіш
settings-shortcuts-custom-name = Назва
settings-shortcuts-custom-command = Команда
settings-shortcuts-custom-shortcut = Сполучення клавіш
settings-shortcuts-custom-taken = Уже використовується для дії «{ $name }». Після збереження там воно вимкнеться.
settings-shortcuts-remove = Вилучити
settings-shortcuts-save = Зберегти
settings-shortcuts-add-button = Додати

## Dictation

settings-dictation-title = Диктування
settings-dictation-description = Утримуйте { $keys } і говоріть, щоб вводити сказане в будь-якій програмі. Відпустіть, щоб завершити, або натисніть Esc, щоб скасувати. Усе відбувається на цьому комп’ютері: ваш голос не залишає його і не зберігається.
settings-dictation-description-no-shortcut = Виберіть нижче сполучення клавіш для диктування. Усе відбувається на цьому комп’ютері: ваш голос не залишає його і не зберігається.
settings-dictation-not-installed = Диктування не встановлено на цьому комп’ютері
settings-dictation-hold = Утримуйте { $keys }, щоб диктувати
settings-dictation-needs-shortcut = Вимкнено, доки не задано сполучення клавіш
settings-dictation-copilot-key = клавішу Copilot
settings-dictation-shortcut = Сполучення клавіш
settings-dictation-shortcut-description = Утримуйте його, щоб говорити, або натисніть, щоб система слухала, доки ви не натиснете його знову чи не замовкнете
settings-dictation-shortcut-own = Власне сполучення
settings-dictation-shortcut-another = Інше сполучення…
settings-dictation-shortcut-off = Вимкнено
settings-dictation-keys = Клавіші
settings-dictation-change = Змінити
settings-dictation-language = Мова
settings-dictation-language-automatic = Автоматично
settings-dictation-language-automatic-current = Автоматично ({ $language })
settings-dictation-language-description = В автоматичному режимі мова відповідає розкладці клавіатури, якою ви користуєтеся
settings-dictation-language-unavailable = Мова «{ $language }» недоступна на цьому комп’ютері
settings-dictation-engine = Розпізнавач мовлення
settings-dictation-engine-automatic = Автоматично
settings-dictation-engine-description = { $engine } розпізнає мову «{ $language }»
settings-dictation-engine-graphics-card = { $engine } розпізнає мову «{ $language }» на відеокарті
settings-dictation-models = Мовні моделі
settings-dictation-models-description = Моделі завантажуються один раз і зберігаються на цьому комп’ютері.
settings-dictation-credits = Подяки
settings-dictation-credit = { $credit }. Ліцензія: { $licence }.
settings-dictation-learn-more = Докладніше

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Не вдалося завантажити: { $reason }
settings-dictation-model-downloading = { $received } з { $total }
settings-dictation-model-installed = { $size } на цьому комп’ютері
settings-dictation-model-partial = Завантажено { $received } з { $total }
settings-dictation-model-size = Розмір завантаження: { $size }
settings-dictation-model-retry = Спробувати ще раз
settings-dictation-model-cancel = Скасувати
settings-dictation-model-resume = Продовжити
settings-dictation-model-download = Завантажити
settings-dictation-model-remove = Вилучити

## Mouse and touchpad

settings-mouse-mouse = Миша
settings-mouse-primary-button = Основна кнопка
settings-mouse-primary-button-description = Кнопка, якою ви клацаєте, щоб вибирати
settings-mouse-primary-button-left = Ліва
settings-mouse-primary-button-right = Права
settings-mouse-speed = Швидкість вказівника
settings-mouse-slower = Повільніше
settings-mouse-faster = Швидше
settings-mouse-acceleration = Прискорення миші
settings-mouse-acceleration-description = Вказівник переміщується далі, коли ви швидко рухаєте мишею
settings-mouse-natural-scrolling = Природне прокручування
settings-mouse-natural-scrolling-description = Прокручування рухає вміст, а не область перегляду
settings-mouse-touchpad = Сенсорна панель
settings-mouse-touchpad-speed = Швидкість вказівника сенсорної панелі
settings-mouse-touchpad-scroll-speed = Швидкість прокручування
settings-mouse-touchpad-scroll-speed-label = Швидкість прокручування сенсорної панелі
settings-mouse-touchpad-tap = Торкання для клацання
settings-mouse-touchpad-tap-description = Торкайтеся сенсорної панелі замість натискання на неї
settings-mouse-touchpad-natural-scrolling = Природне прокручування сенсорної панелі
settings-mouse-touchpad-natural-scrolling-description = Вміст рухається в тому самому напрямку, що й пальці
settings-mouse-touchpad-scroll-with = Прокручування
settings-mouse-touchpad-two-fingers = Двома пальцями
settings-mouse-touchpad-scroll-edge = Біля краю
settings-mouse-touchpad-secondary-click = Додаткове клацання
settings-mouse-touchpad-secondary-click-description = Як клацнути правою кнопкою без окремої кнопки
settings-mouse-touchpad-click-corner = У куті
settings-mouse-touchpad-disable-typing = Вимикати під час введення
settings-mouse-touchpad-disable-typing-description = Щоб вказівник не стрибав, поки ви вводите текст
