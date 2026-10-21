## Displays

settings-display-mirror = Дублиране на екраните
settings-display-mirror-description = Показва една и съща картина на всички екрани
settings-display-mirrored = Дублирани екрани
settings-display-display = Екран
settings-display-apply-failed = Тези настройки не проработиха. Опитайте с друга подредба.
settings-display-reset = Върни
settings-display-apply = Приложи
settings-display-arrangement-main = { $name }, основен екран
settings-display-use = Използване на този екран
settings-display-main = Основен екран
settings-display-main-description = Лентата на задачите и новите прозорци се показват тук
settings-display-resolution-title = Разделителна способност
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Честота на опресняване
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Променлива честота на опресняване
settings-display-variable-refresh-description = Екранът следва кадровата честота на игрите на цял екран за по-плавно движение
settings-display-variable-refresh-off = Изключено
settings-display-variable-refresh-games = В игрите
settings-display-variable-refresh-fullscreen = Във всички приложения на цял екран
settings-display-scale = Мащаб
settings-display-scale-description = Уголемява или смалява текста, приложенията и всичко останало
settings-display-orientation = Ориентация
settings-display-orientation-landscape = Хоризонтална
settings-display-orientation-portrait-right = Вертикална, надясно
settings-display-orientation-portrait-left = Вертикална, наляво
settings-display-orientation-landscape-flipped = Хоризонтална, обърната

## Display brightness

settings-display-brightness = Яркост
settings-display-brightness-label = Яркост на { $name }
settings-display-brightness-unsupported = Включете DDC/CI в менюто на екрана, за да я променяте оттук
settings-display-brightness-unresponsive = Не отговаря в момента, нов опит след малко
settings-display-brightness-external = Външни екрани
settings-display-brightness-missing-tool = Инсталирайте ddcutil, за да променяте яркостта им оттук
settings-display-brightness-needs-restart = Рестартирайте, за да завърши настройването на яркостта им
settings-display-brightness-no-access = Излезте и влезте отново, за да променяте яркостта им оттук

## Night light

settings-display-night-light = Нощна светлина
settings-display-night-light-description = По-топли цветове вечер, по-щадящи за очите
settings-display-night-light-schedule = График
settings-display-night-light-automatic = От залез до изгрев
settings-display-night-light-custom = По избор
settings-display-night-light-from = Включва се
settings-display-night-light-to = Изключва се
settings-display-night-light-warmth = Топлина

## Sound

settings-sound-output = Изход
settings-sound-input = Вход
settings-sound-device = Устройство
settings-sound-output-device = Изходно устройство
settings-sound-input-device = Входно устройство
settings-sound-connection = Връзка
settings-sound-output-connection = Изходна връзка
settings-sound-input-connection = Входна връзка
settings-sound-volume = Сила на звука
settings-sound-mute = { $name }: изключи звука
settings-sound-unmute = { $name }: включи звука
settings-sound-balance = Баланс
settings-sound-balance-center = Център
settings-sound-balance-left = { $share } вляво
settings-sound-balance-right = { $share } вдясно
settings-sound-louder = Сила на звука над 100 %
settings-sound-louder-description = При по-висока сила звукът може да се изкриви
settings-sound-input-level = Входно ниво
settings-sound-apps = Сила на звука на приложенията
settings-sound-apps-playing = { $count ->
    [one] { $count } приложение възпроизвежда звук
   *[other] { $count } приложения възпроизвеждат звук
}
settings-sound-app-output = Изход за { $app }
settings-sound-profiles = Профили на устройствата
settings-sound-profiles-row-description = Изберете как се използва всяко звуково устройство
settings-sound-profiles-description = Как се използва всяко звуково устройство, например стерео или съраунд
settings-sound-profile-label = Как се използва { $device }
settings-sound-profile-off = Изключено

## System sounds

settings-sound-system = Системни звуци
settings-sound-system-description = Звуци за известия, устройства и други събития
settings-sound-system-volume = Сила на системните звуци
settings-sound-kind-notifications = Известия
    .description = Заглушени при Не безпокойте, в игри и при споделяне на екрана
    .preview = Пусни звука за известие
settings-sound-kind-devices = Устройства и зареждане
    .description = Свързване на устройство или зарядно и слаба батерия
    .preview = Пусни звука за устройство
settings-sound-kind-volume = Звук при промяна на силата
    .description = Кратко щракване, когато променяте силата на звука
    .preview = Пусни щракването
settings-sound-kind-screenshots = Екранни снимки
    .description = Звук на затвор при запазване на екранна снимка
    .preview = Пусни звука на затвора
settings-sound-kind-recording = Запис
    .description = При начало и край на запис на екрана, на камерата или на диктовката
    .preview = Пусни звука за запис
settings-sound-kind-sign-in = Звук при вход
    .description = Когато се появи работният плот
    .preview = Пусни звука при вход
settings-sound-kind-keyboard = Звук на клавишите
    .description = При всеки клавиш на екранната клавиатура
    .preview = Пусни звука на клавиш

## Power and battery

settings-power-battery = Батерия
settings-power-charging = Зарежда се
settings-power-charging-at = Зарежда се с { $power }
settings-power-charging-until-full = Зарежда се, пълна след { $time }
settings-power-charging-at-until-full = Зарежда се с { $power }, пълна след { $time }
settings-power-on-battery = На батерия
settings-power-on-battery-using = На батерия, консумация { $power }
settings-power-time-left = Остават около { $time }
settings-power-time-left-using = Остават около { $time }, консумация { $power }
settings-power-full = Напълно заредена
settings-power-empty = Изтощена
settings-power-not-charging = Включена в захранването, не се зарежда
settings-power-health = Състояние на батерията
settings-power-capacity = { $full } от { $design } като нова
settings-power-cycles = { $count ->
    [one] { $cycles } цикъл на зареждане
   *[other] { $cycles } цикъла на зареждане
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Показване на процента
settings-power-show-percentage-description = Показва нивото на батерията в иконата ѝ

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = по-малко от минута
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } минута
   *[other] { $minutes } минути
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } час
   *[other] { $hours } часа
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } час
   *[other] { $hours } часа
} { $minutes ->
    [one] { $minutes } минута
   *[other] { $minutes } минути
}
settings-power-never = Никога

## Charge limit

settings-power-limit = Ограничаване на зареждането
settings-power-limit-failed = Ограничението не можа да се промени. Опитайте отново.
settings-power-limit-elsewhere-off = Друго приложение го изключи, затова батерията се зарежда докрай
settings-power-limit-elsewhere-changed = Друго приложение промени ограничението на { $level }
settings-power-limit-elsewhere-on = Друго приложение спира зареждането при { $level }
settings-power-limit-automatic = Компютърът решава кога да спре зареждането
settings-power-limit-stops-at = Зареждането спира при { $level }
settings-power-limit-description = Спира зареждането по-рано, за да удължи живота на батерията
settings-power-limit-description-at = Спира при { $level }, за да удължи живота на батерията
settings-power-limit-applied = Зареждането спира при { $level }
settings-power-limit-applied-description = Зададено от друго приложение на този компютър

## Battery-powered devices

settings-power-devices = Устройства
settings-power-device-mouse = Мишка
settings-power-device-keyboard = Клавиатура
settings-power-device-headphones = Слушалки
settings-power-device-speaker = Високоговорител
settings-power-device-controller = Контролер
settings-power-device-phone = Телефон
settings-power-device-tablet = Таблет
settings-power-device-pen = Писалка
settings-power-device-touchpad = Тъчпад
settings-power-device-other = Устройство

## Power mode

settings-power-mode = Режим на захранване
settings-power-mode-row = Режим
settings-power-profile-saver = Пестене на енергия
    .description = По-бавно, с по-малка консумация
settings-power-profile-balanced = Балансиран
    .description = Стандартна производителност и консумация
settings-power-profile-performance = Производителност
    .description = По-бързо, с по-голяма консумация
settings-power-limited = В момента производителността е ограничена
settings-power-limited-lap = Производителността е ограничена, защото компютърът е в скута ви
settings-power-limited-hot = Производителността е ограничена, защото компютърът е прегрял
settings-power-limited-lap-hot = Производителността е ограничена, защото компютърът е в скута ви и е прегрял
settings-power-saver-low-battery = Пестене на енергия при слаба батерия
settings-power-saver-low-battery-description = Превключва към пестене на енергия, когато батерията е слаба

## Keyboard backlight

settings-power-keyboard = Клавиатура
settings-power-backlight = Подсветка на клавиатурата
settings-power-backlight-off = Изключена
settings-power-backlight-low = Слаба
settings-power-backlight-medium = Средна
settings-power-backlight-high = Силна

## Screen and sleep

settings-power-screen = Екран
settings-power-screen-off = Изключване на екрана след
settings-power-screen-off-description = Когато не сте използвали компютъра известно време
settings-power-dim = Затъмняване при неактивност
settings-power-dim-description = Намалява яркостта малко преди екранът да се изключи
settings-power-sleep = Заспиване
settings-power-suspend-plugged-in = Заспиване при включено захранване
settings-power-suspend-inactive = Заспиване при неактивност
settings-power-suspend-description = Приспива компютъра, след като известно време не се използва
settings-power-suspend-battery = Заспиване при работа на батерия
settings-power-button = Бутон за захранване
settings-power-button-suspend = Заспиване
settings-power-button-hibernate = Хибернация
settings-power-button-ask = Питане какво да се направи
settings-power-button-nothing = Нищо
settings-power-long-sleep = Изключване след дълго заспиване
settings-power-long-sleep-description = Вместо да остави батерията да се изтощи по време на заспиване, компютърът се изключва, когато батерията стане слаба или след дълго заспиване на батерия. Отворените прозорци не се запазват.
settings-power-long-sleep-failed = Това не можа да се промени. Опитайте отново.
settings-power-long-sleep-after = Изключване след
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } час
   *[other] { $hours } часа
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } ден
   *[other] { $days } дни
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } седмица
   *[other] { $weeks } седмици
}

## Keyboard

settings-keyboard-sources = Източници за въвеждане
settings-keyboard-sources-description = Първият се използва по подразбиране. Превключвайте между тях, докато пишете.
settings-keyboard-source-edit = Редактирай в Keys
settings-keyboard-source-up = Премести нагоре
settings-keyboard-source-down = Премести надолу
settings-keyboard-source-remove = Премахни
settings-keyboard-add-source-button = Добави източник за въвеждане
settings-keyboard-own = Ваши подредби и методи за въвеждане
settings-keyboard-own-layout = Създаване на подредба
settings-keyboard-own-layout-description = Започнете от съществуваща подредба и променете какво въвеждат клавишите ѝ
settings-keyboard-own-method = Създаване на метод за въвеждане
settings-keyboard-own-method-description = Превръща въведеното в букви с ударения, други писмености или думи за избор
settings-keyboard-own-open = Отвори Keys
settings-keyboard-own-open-description = Редактирайте подредбите и методите за въвеждане, които сте създали
settings-keyboard-switch-source = Смяна на източника за въвеждане
settings-keyboard-add-source = Добавяне на източник за въвеждане
settings-keyboard-add-source-description = Изберете клавиатурната подредба или метода за въвеждане, с който искате да пишете.
settings-keyboard-add-source-search = Търсене на езици, подредби и методи за въвеждане
settings-keyboard-input-method = Метод за въвеждане
settings-keyboard-add-source-no-match = Няма съвпадения за „{ $query }“
settings-keyboard-cancel = Отказ
settings-keyboard-add = Добави
settings-keyboard-typing = Писане
settings-keyboard-repeat = Повторение на клавишите
settings-keyboard-repeat-description = Задържаният клавиш се въвежда отново и отново
settings-keyboard-repeat-delay = Забавяне преди повторение
settings-keyboard-repeat-delay-shorter = По-кратко
settings-keyboard-repeat-delay-longer = По-дълго
settings-keyboard-repeat-speed = Скорост на повторение
settings-keyboard-repeat-speed-slower = По-бавно
settings-keyboard-repeat-speed-faster = По-бързо
settings-keyboard-caps-lock = Клавиш Caps Lock
settings-keyboard-caps-lock-description = Какво става, когато го натиснете
settings-keyboard-caps-lock-escape = Escape
settings-keyboard-caps-lock-swap-escape = Размяна с Escape
settings-keyboard-caps-lock-nothing = Нищо
settings-keyboard-caps-lock-custom = Друга настройка
settings-keyboard-lock-notices = Показване на Caps Lock и Num Lock
settings-keyboard-lock-notices-description = За кратко се показва на екрана, когато някой от двата се включи или изключи
settings-keyboard-dictation-on = Включена
settings-keyboard-dictation-off = Изключена
settings-keyboard-shortcuts-description = Преглед и промяна на клавишните комбинации или добавяне на собствени

## Copilot key

settings-keyboard-copilot = Клавиш Copilot
settings-keyboard-copilot-press = Натискане
settings-keyboard-copilot-press-description = Какво прави краткото натискане на клавиша
settings-keyboard-copilot-open-start = Отваряне на менюто Старт
settings-keyboard-copilot-open-app = Отваряне на приложение
settings-keyboard-copilot-nothing = Нищо
settings-keyboard-copilot-app = Приложение
settings-keyboard-copilot-no-app = Все още няма избрано приложение
settings-keyboard-copilot-change = Промени
settings-keyboard-copilot-choose = Избери
settings-keyboard-copilot-hold = Задържане за диктовка
settings-keyboard-copilot-hold-description = Задръжте клавиша и говорете, за да се въведе казаното
settings-keyboard-copilot-hold-off = Работи, когато диктовката е включена
settings-keyboard-copilot-choose-app = Избор на приложение
settings-keyboard-copilot-choose-app-description = Натискането на клавиша Copilot го отваря.

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
settings-keys-space = Интервал
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Меню
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Усилване на звука
settings-keys-volume-down = Намаляване на звука
settings-keys-mute = Без звук
settings-keys-microphone-mute = Изключване на микрофона
settings-keys-play = Пускане
settings-keys-media-pause = Пауза
settings-keys-stop = Стоп
settings-keys-next-track = Следваща песен
settings-keys-previous-track = Предишна песен
settings-keys-brightness-up = Повече яркост
settings-keys-brightness-down = По-малко яркост
settings-keys-browser = Браузър
settings-keys-home-page = Начална страница
settings-keys-search = Търсене
settings-keys-mail = Поща
settings-keys-calculator = Калкулатор
settings-keys-files = Файлове
settings-keys-eject = Изваждане
settings-keys-power = Захранване
settings-keys-lock = Заключване

## Keyboard shortcuts

settings-shortcuts-title = Клавишни комбинации
settings-shortcuts-search = Търсене на клавишни комбинации
settings-shortcuts-category-system = Система
settings-shortcuts-category-windows = Прозорци
settings-shortcuts-category-tiling = Плочки
settings-shortcuts-category-workspaces = Работни пространства
settings-shortcuts-category-screenshots = Екранни снимки
settings-shortcuts-category-media = Мултимедия
settings-shortcuts-reset = Върни по подразбиране
settings-shortcuts-apps = Комбинации на приложения
settings-shortcuts-apps-description = Заявени от приложения. Работят и когато приложението не е на преден план.
settings-shortcuts-no-match = Няма комбинации, отговарящи на „{ $query }“
settings-shortcuts-change = Промени комбинацията за { $name }
settings-shortcuts-or = или
settings-shortcuts-not-set = Не е зададена
settings-shortcuts-press-keys = Натиснете желаните клавиши
settings-shortcuts-needs-modifier = Добавете Ctrl, Alt или Super, за да не пречи комбинацията при писане.
settings-shortcuts-record-description = Натиснете новата комбинация. Backspace я изключва, Escape отказва.
settings-shortcuts-record-taken = Тази комбинация вече се използва за „{ $name }“. Ако я замените, там тя ще се изключи.
settings-shortcuts-try-another = Опитай друга
settings-shortcuts-replace = Замени
settings-shortcuts-cancel = Отказ
settings-shortcuts-custom = Собствени комбинации
settings-shortcuts-custom-description = Изпълнение на команда или отваряне на приложение с клавишна комбинация
settings-shortcuts-untitled = Без име
settings-shortcuts-add = Добави комбинация
settings-shortcuts-edit = Редактиране на комбинация
settings-shortcuts-custom-name = Име
settings-shortcuts-custom-command = Команда
settings-shortcuts-custom-shortcut = Комбинация
settings-shortcuts-custom-taken = Вече се използва за „{ $name }“. При запазване там ще се изключи.
settings-shortcuts-remove = Премахни
settings-shortcuts-save = Запази
settings-shortcuts-add-button = Добави

## Dictation

settings-dictation-title = Диктовка
settings-dictation-description = Задръжте { $keys } и говорете, за да се въведе казаното във всяко приложение. Пуснете, за да завършите, или натиснете Escape за отказ. Всичко става на този компютър: гласът ви не го напуска и не се запазва.
settings-dictation-description-no-shortcut = Изберете клавишна комбинация по-долу, за да диктувате. Всичко става на този компютър: гласът ви не го напуска и не се запазва.
settings-dictation-not-installed = Диктовката не е инсталирана на този компютър
settings-dictation-hold = Задръжте { $keys } за диктовка
settings-dictation-needs-shortcut = Изключена, докато няма клавишна комбинация
settings-dictation-copilot-key = клавиша Copilot
settings-dictation-shortcut = Клавишна комбинация
settings-dictation-shortcut-description = Задръжте я, докато говорите, или я натиснете, за да слуша, докато не я натиснете отново или не спрете да говорите
settings-dictation-shortcut-own = Моя комбинация
settings-dictation-shortcut-another = Друга комбинация…
settings-dictation-shortcut-off = Изключено
settings-dictation-keys = Клавиши
settings-dictation-change = Промени
settings-dictation-language = Език
settings-dictation-language-automatic = Автоматично
settings-dictation-language-automatic-current = Автоматично ({ $language })
settings-dictation-language-description = При Автоматично се следва клавиатурната подредба, с която пишете
settings-dictation-language-unavailable = Езикът { $language } не е наличен на този компютър
settings-dictation-engine = Разпознаване на реч
settings-dictation-engine-automatic = Автоматично
settings-dictation-engine-description = { $engine } разпознава { $language }
settings-dictation-engine-graphics-card = { $engine } разпознава { $language } с видеокартата
settings-dictation-models = Речеви модели
settings-dictation-models-description = Моделите се изтеглят веднъж и се пазят на този компютър.
settings-dictation-credits = Автори
settings-dictation-credit = { $credit }. Лиценз: { $licence }.
settings-dictation-learn-more = Научете повече

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Неуспешно изтегляне: { $reason }
settings-dictation-model-downloading = { $received } от { $total }
settings-dictation-model-installed = { $size } на този компютър
settings-dictation-model-partial = Изтеглени { $received } от { $total }
settings-dictation-model-size = { $size } за изтегляне
settings-dictation-model-retry = Опитай отново
settings-dictation-model-cancel = Отказ
settings-dictation-model-resume = Продължи
settings-dictation-model-download = Изтегли
settings-dictation-model-remove = Премахни

## Mouse and touchpad

settings-mouse-mouse = Мишка
settings-mouse-primary-button = Основен бутон
settings-mouse-primary-button-description = Бутонът, с който избирате
settings-mouse-primary-button-left = Ляв
settings-mouse-primary-button-right = Десен
settings-mouse-speed = Скорост на показалеца
settings-mouse-slower = По-бавно
settings-mouse-faster = По-бързо
settings-mouse-acceleration = Ускоряване на мишката
settings-mouse-acceleration-description = Показалецът изминава по-голямо разстояние, когато движите мишката бързо
settings-mouse-natural-scrolling = Естествено превъртане
settings-mouse-natural-scrolling-description = Превъртането мести съдържанието, а не изгледа
settings-mouse-touchpad = Тъчпад
settings-mouse-touchpad-speed = Скорост на показалеца на тъчпада
settings-mouse-touchpad-scroll-speed = Скорост на превъртане
settings-mouse-touchpad-scroll-speed-label = Скорост на превъртане на тъчпада
settings-mouse-touchpad-tap = Докосване за щракване
settings-mouse-touchpad-tap-description = Докоснете тъчпада, вместо да го натискате
settings-mouse-touchpad-natural-scrolling = Естествено превъртане на тъчпада
settings-mouse-touchpad-natural-scrolling-description = Съдържанието се движи в посоката на пръстите ви
settings-mouse-touchpad-scroll-with = Превъртане с
settings-mouse-touchpad-two-fingers = Два пръста
settings-mouse-touchpad-scroll-edge = Ръб
settings-mouse-touchpad-secondary-click = Вторично щракване
settings-mouse-touchpad-secondary-click-description = Как да щракате с десния бутон без отделен бутон
settings-mouse-touchpad-click-corner = Ъгъл
settings-mouse-touchpad-disable-typing = Изключване при писане
settings-mouse-touchpad-disable-typing-description = За да не подскача показалецът, докато пишете
