## Displays

settings-display-mirror = Дублировать экраны
settings-display-mirror-description = Показывает одно и то же изображение на всех экранах
settings-display-mirrored = Дублированные экраны
settings-display-display = Экран
settings-display-apply-failed = Эти настройки не сработали. Попробуйте другую конфигурацию.
settings-display-reset = Сбросить
settings-display-apply = Применить
settings-display-arrangement-main = { $name }, основной экран
settings-display-use = Использовать этот экран
settings-display-main = Основной экран
settings-display-main-description = Здесь появляются панель задач и новые окна
settings-display-resolution-title = Разрешение
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Частота обновления
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Гц
settings-display-variable-refresh = Переменная частота обновления
settings-display-variable-refresh-description = Экран подстраивается под частоту кадров полноэкранных игр, чтобы движение было плавнее
settings-display-variable-refresh-off = Отключено
settings-display-variable-refresh-games = В играх
settings-display-variable-refresh-fullscreen = Во всех полноэкранных приложениях
settings-display-scale = Масштаб
settings-display-scale-description = Делает текст, приложения и всё остальное крупнее или мельче
settings-display-orientation = Ориентация
settings-display-orientation-landscape = Альбомная
settings-display-orientation-portrait-right = Книжная, поворот вправо
settings-display-orientation-portrait-left = Книжная, поворот влево
settings-display-orientation-landscape-flipped = Альбомная, перевёрнутая

## Display brightness

settings-display-brightness = Яркость
settings-display-brightness-label = Яркость: { $name }
settings-display-brightness-unsupported = Включите DDC/CI в меню экрана, чтобы менять яркость здесь
settings-display-brightness-unresponsive = Сейчас не отвечает, скоро будет новая попытка
settings-display-brightness-external = Внешние экраны
settings-display-brightness-missing-tool = Установите ddcutil, чтобы менять их яркость здесь
settings-display-brightness-needs-restart = Перезагрузите компьютер, чтобы завершить настройку их яркости
settings-display-brightness-no-access = Выйдите и снова войдите, чтобы менять их яркость здесь

## Night light

settings-display-night-light = Ночной свет
settings-display-night-light-description = Тёплые цвета по вечерам, меньше нагрузки на глаза
settings-display-night-light-schedule = Расписание
settings-display-night-light-automatic = От заката до рассвета
settings-display-night-light-custom = Своё
settings-display-night-light-from = Включается
settings-display-night-light-to = Отключается
settings-display-night-light-warmth = Теплота

## Sound

settings-sound-output = Вывод
settings-sound-input = Ввод
settings-sound-device = Устройство
settings-sound-output-device = Устройство вывода
settings-sound-input-device = Устройство ввода
settings-sound-connection = Разъём
settings-sound-output-connection = Разъём вывода
settings-sound-input-connection = Разъём ввода
settings-sound-volume = Громкость
settings-sound-mute = Выключить звук: { $name }
settings-sound-unmute = Включить звук: { $name }
settings-sound-balance = Баланс
settings-sound-balance-center = По центру
settings-sound-balance-left = { $share } влево
settings-sound-balance-right = { $share } вправо
settings-sound-louder = Громкость выше 100 %
settings-sound-louder-description = На высокой громкости звук может искажаться
settings-sound-input-level = Уровень входного сигнала
settings-sound-apps = Громкость приложений
settings-sound-apps-playing = { $count ->
    [one] Звук воспроизводит { $count } приложение
    [few] Звук воспроизводят { $count } приложения
    [many] Звук воспроизводят { $count } приложений
   *[other] Звук воспроизводят { $count } приложения
}
settings-sound-app-output = Вывод звука приложения { $app }
settings-sound-profiles = Профили устройств
settings-sound-profiles-row-description = Выберите, как используется каждое звуковое устройство
settings-sound-profiles-description = Как используется каждое звуковое устройство, например стерео или объёмный звук
settings-sound-profile-label = Режим устройства { $device }
settings-sound-profile-off = Отключено

## System sounds

settings-sound-system = Системные звуки
settings-sound-system-description = Звуки уведомлений, устройств и других событий
settings-sound-system-volume = Громкость системных звуков
settings-sound-kind-notifications = Уведомления
    .description = Не звучат в режиме «Не беспокоить», в играх и при показе экрана
    .preview = Воспроизвести звук уведомления
settings-sound-kind-devices = Устройства и зарядка
    .description = Подключение устройства или зарядки и низкий заряд батареи
    .preview = Воспроизвести звук устройства
settings-sound-kind-volume = Отклик громкости
    .description = Щелчок при изменении громкости
    .preview = Воспроизвести щелчок громкости
settings-sound-kind-screenshots = Снимки экрана
    .description = Звук затвора при сохранении снимка экрана
    .preview = Воспроизвести звук затвора
settings-sound-kind-recording = Запись
    .description = Когда начинается и заканчивается запись экрана, работа камеры или диктовка
    .preview = Воспроизвести звук записи
settings-sound-kind-sign-in = Звук входа
    .description = Когда появляется рабочий стол
    .preview = Воспроизвести звук входа
settings-sound-kind-keyboard = Нажатия клавиш
    .description = Каждая клавиша экранной клавиатуры
    .preview = Воспроизвести нажатие клавиши

## Power and battery

settings-power-battery = Батарея
settings-power-charging = Заряжается
settings-power-charging-at = Заряжается, { $power }
settings-power-charging-until-full = Заряжается, до полной зарядки { $time }
settings-power-charging-at-until-full = Заряжается, { $power }, до полной зарядки { $time }
settings-power-on-battery = От батареи
settings-power-on-battery-using = От батареи, потребление { $power }
settings-power-time-left = До разрядки примерно { $time }
settings-power-time-left-using = До разрядки примерно { $time }, потребление { $power }
settings-power-full = Полностью заряжена
settings-power-empty = Разряжена
settings-power-not-charging = Подключено к сети, не заряжается
settings-power-health = Состояние батареи
settings-power-capacity = { $full } из исходных { $design }
settings-power-cycles = { $count ->
    [one] { $cycles } цикл зарядки
    [few] { $cycles } цикла зарядки
    [many] { $cycles } циклов зарядки
   *[other] { $cycles } цикла зарядки
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Вт·ч
settings-power-show-percentage = Показывать проценты
settings-power-show-percentage-description = Показывает уровень заряда внутри значка батареи

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = менее минуты
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } минута
    [few] { $minutes } минуты
    [many] { $minutes } минут
   *[other] { $minutes } минуты
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } час
    [few] { $hours } часа
    [many] { $hours } часов
   *[other] { $hours } часа
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } час
    [few] { $hours } часа
    [many] { $hours } часов
   *[other] { $hours } часа
} { $minutes ->
    [one] { $minutes } минута
    [few] { $minutes } минуты
    [many] { $minutes } минут
   *[other] { $minutes } минуты
}
settings-power-never = Никогда

## Charge limit

settings-power-limit = Ограничить заряд
settings-power-limit-failed = Не удалось изменить ограничение. Попробуйте ещё раз.
settings-power-limit-elsewhere-off = Другое приложение отключило ограничение, поэтому батарея заряжается полностью
settings-power-limit-elsewhere-changed = Другое приложение изменило ограничение: { $level }
settings-power-limit-elsewhere-on = Другое приложение останавливает зарядку на { $level }
settings-power-limit-automatic = Компьютер сам решает, когда остановить зарядку
settings-power-limit-stops-at = Зарядка останавливается на { $level }
settings-power-limit-description = Останавливает зарядку раньше, чтобы батарея прослужила дольше
settings-power-limit-description-at = Останавливает зарядку на { $level }, чтобы батарея прослужила дольше
settings-power-limit-applied = Зарядка останавливается на { $level }
settings-power-limit-applied-description = Задано другим приложением на этом компьютере

## Battery-powered devices

settings-power-devices = Устройства
settings-power-device-mouse = Мышь
settings-power-device-keyboard = Клавиатура
settings-power-device-headphones = Наушники
settings-power-device-speaker = Колонка
settings-power-device-controller = Геймпад
settings-power-device-phone = Телефон
settings-power-device-tablet = Планшет
settings-power-device-pen = Перо
settings-power-device-touchpad = Сенсорная панель
settings-power-device-other = Устройство

## Power mode

settings-power-mode = Режим питания
settings-power-mode-row = Режим
settings-power-profile-saver = Энергосбережение
    .description = Медленнее, но расходует меньше энергии
settings-power-profile-balanced = Сбалансированный
    .description = Обычная производительность и расход энергии
settings-power-profile-performance = Производительность
    .description = Быстрее, но расходует больше энергии
settings-power-limited = Производительность сейчас ограничена
settings-power-limited-lap = Производительность ограничена, потому что компьютер у вас на коленях
settings-power-limited-hot = Производительность ограничена, потому что компьютер перегрелся
settings-power-limited-lap-hot = Производительность ограничена, потому что компьютер у вас на коленях и перегрелся
settings-power-saver-low-battery = Энергосбережение при низком заряде
settings-power-saver-low-battery-description = Включает энергосбережение, когда батарея садится

## Keyboard backlight

settings-power-keyboard = Клавиатура
settings-power-backlight = Подсветка клавиатуры
settings-power-backlight-off = Отключена
settings-power-backlight-low = Слабая
settings-power-backlight-medium = Средняя
settings-power-backlight-high = Яркая

## Screen and sleep

settings-power-screen = Экран
settings-power-screen-off = Отключать экран через
settings-power-screen-off-description = Если компьютером какое-то время не пользуются
settings-power-dim = Затемнять при бездействии
settings-power-dim-description = Снижает яркость незадолго до отключения экрана
settings-power-sleep = Спящий режим
settings-power-suspend-plugged-in = Спящий режим при питании от сети
settings-power-suspend-inactive = Спящий режим при бездействии
settings-power-suspend-description = Переводит компьютер в спящий режим, если им какое-то время не пользуются
settings-power-suspend-battery = Спящий режим при питании от батареи
settings-power-button = Кнопка питания
settings-power-button-suspend = Спящий режим
settings-power-button-hibernate = Гибернация
settings-power-button-ask = Спрашивать, что делать
settings-power-button-nothing = Ничего не делать
settings-power-long-sleep = Выключать после долгого сна
settings-power-long-sleep-description = Чтобы батарея не разрядилась полностью во сне, компьютер выключается, когда заряд становится низким или после долгого сна от батареи. Открытые окна не сохраняются.
settings-power-long-sleep-failed = Не удалось изменить эту настройку. Попробуйте ещё раз.
settings-power-long-sleep-after = Выключать через
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } час
    [few] { $hours } часа
    [many] { $hours } часов
   *[other] { $hours } часа
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } день
    [few] { $days } дня
    [many] { $days } дней
   *[other] { $days } дня
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } неделя
    [few] { $weeks } недели
    [many] { $weeks } недель
   *[other] { $weeks } недели
}

## Keyboard

settings-keyboard-sources = Источники ввода
settings-keyboard-sources-description = Первый используется по умолчанию. Переключайтесь между ними прямо во время ввода.
settings-keyboard-source-edit = Изменить в Keys
settings-keyboard-source-up = Переместить вверх
settings-keyboard-source-down = Переместить вниз
settings-keyboard-source-remove = Убрать
settings-keyboard-add-source-button = Добавить источник ввода
settings-keyboard-own = Свои раскладки и методы ввода
settings-keyboard-own-layout = Создать раскладку
settings-keyboard-own-layout-description = Возьмите за основу раскладку и измените, что вводят её клавиши
settings-keyboard-own-method = Создать метод ввода
settings-keyboard-own-method-description = Превращайте вводимое в символы с диакритикой, другие системы письма или слова на выбор
settings-keyboard-own-open = Открыть Keys
settings-keyboard-own-open-description = Изменяйте созданные вами раскладки и методы ввода
settings-keyboard-switch-source = Сменить источник ввода
settings-keyboard-add-source = Добавить источник ввода
settings-keyboard-add-source-description = Выберите раскладку клавиатуры или метод ввода, которым хотите пользоваться.
settings-keyboard-add-source-search = Поиск языков, раскладок и методов ввода
settings-keyboard-input-method = Метод ввода
settings-keyboard-add-source-no-match = По запросу «{ $query }» ничего не найдено
settings-keyboard-cancel = Отмена
settings-keyboard-add = Добавить
settings-keyboard-typing = Ввод текста
settings-keyboard-repeat = Повтор клавиш
settings-keyboard-repeat-description = Если удерживать клавишу, символ вводится снова и снова
settings-keyboard-repeat-delay = Задержка перед повтором
settings-keyboard-repeat-delay-shorter = Короче
settings-keyboard-repeat-delay-longer = Длиннее
settings-keyboard-repeat-speed = Скорость повтора
settings-keyboard-repeat-speed-slower = Медленнее
settings-keyboard-repeat-speed-faster = Быстрее
settings-keyboard-caps-lock = Клавиша Caps Lock
settings-keyboard-caps-lock-description = Что происходит при её нажатии
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Поменять местами с Esc
settings-keyboard-caps-lock-nothing = Ничего
settings-keyboard-caps-lock-custom = Своё
settings-keyboard-lock-notices = Показывать Caps Lock и Num Lock
settings-keyboard-lock-notices-description = Ненадолго показывает на экране, когда одна из них включается или отключается
settings-keyboard-dictation-on = Включена
settings-keyboard-dictation-off = Отключена
settings-keyboard-shortcuts-description = Просматривайте и меняйте сочетания клавиш или добавляйте свои

## Copilot key

settings-keyboard-copilot = Клавиша Copilot
settings-keyboard-copilot-press = Нажатие
settings-keyboard-copilot-press-description = Что делает короткое нажатие клавиши
settings-keyboard-copilot-open-start = Открыть меню «Пуск»
settings-keyboard-copilot-open-app = Открыть приложение
settings-keyboard-copilot-nothing = Ничего
settings-keyboard-copilot-app = Приложение
settings-keyboard-copilot-no-app = Приложение ещё не выбрано
settings-keyboard-copilot-change = Изменить
settings-keyboard-copilot-choose = Выбрать
settings-keyboard-copilot-hold = Удерживать для диктовки
settings-keyboard-copilot-hold-description = Удерживайте клавишу и говорите, чтобы вводить сказанное
settings-keyboard-copilot-hold-off = Работает, когда включена диктовка
settings-keyboard-copilot-choose-app = Выберите приложение
settings-keyboard-copilot-choose-app-description = Оно будет открываться по нажатию клавиши Copilot.

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
settings-keys-space = Пробел
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Меню
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Громкость +
settings-keys-volume-down = Громкость −
settings-keys-mute = Без звука
settings-keys-microphone-mute = Откл. микрофон
settings-keys-play = Воспроизведение
settings-keys-media-pause = Пауза
settings-keys-stop = Стоп
settings-keys-next-track = Следующий трек
settings-keys-previous-track = Предыдущий трек
settings-keys-brightness-up = Яркость +
settings-keys-brightness-down = Яркость −
settings-keys-browser = Браузер
settings-keys-home-page = Домашняя страница
settings-keys-search = Поиск
settings-keys-mail = Почта
settings-keys-calculator = Калькулятор
settings-keys-files = Файлы
settings-keys-eject = Извлечь
settings-keys-power = Питание
settings-keys-lock = Блокировка

## Keyboard shortcuts

settings-shortcuts-title = Сочетания клавиш
settings-shortcuts-search = Поиск сочетаний клавиш
settings-shortcuts-category-system = Система
settings-shortcuts-category-windows = Окна
settings-shortcuts-category-workspaces = Рабочие области
settings-shortcuts-category-screenshots = Снимки экрана
settings-shortcuts-category-media = Мультимедиа
settings-shortcuts-reset = Восстановить по умолчанию
settings-shortcuts-apps = Сочетания приложений
settings-shortcuts-apps-description = Запрошены приложениями и работают, даже когда приложение не на переднем плане
settings-shortcuts-no-match = Нет сочетаний клавиш по запросу «{ $query }»
settings-shortcuts-change = Изменить сочетание клавиш: { $name }
settings-shortcuts-or = или
settings-shortcuts-not-set = Не задано
settings-shortcuts-press-keys = Нажмите нужные клавиши
settings-shortcuts-needs-modifier = Добавьте Ctrl, Alt или Super, чтобы сочетание не мешало вводу текста.
settings-shortcuts-record-description = Нажмите новое сочетание клавиш. Backspace отключает его, Esc отменяет.
settings-shortcuts-record-taken = Это сочетание уже используется для действия «{ $name }». Если заменить его, там оно отключится.
settings-shortcuts-try-another = Выбрать другое
settings-shortcuts-replace = Заменить
settings-shortcuts-cancel = Отмена
settings-shortcuts-custom = Свои сочетания клавиш
settings-shortcuts-custom-description = Запуск команды или приложения сочетанием клавиш
settings-shortcuts-untitled = Без названия
settings-shortcuts-add = Добавить сочетание клавиш
settings-shortcuts-edit = Изменить сочетание клавиш
settings-shortcuts-custom-name = Название
settings-shortcuts-custom-command = Команда
settings-shortcuts-custom-shortcut = Сочетание клавиш
settings-shortcuts-custom-taken = Уже используется для действия «{ $name }». При сохранении там оно отключится.
settings-shortcuts-remove = Удалить
settings-shortcuts-save = Сохранить
settings-shortcuts-add-button = Добавить

## Dictation

settings-dictation-title = Диктовка
settings-dictation-description = Удерживайте { $keys } и говорите, чтобы вводить сказанное в любом приложении. Отпустите, чтобы закончить, или нажмите Esc, чтобы отменить. Всё происходит на этом компьютере: ваш голос не покидает его и не сохраняется.
settings-dictation-description-no-shortcut = Чтобы диктовать, выберите сочетание клавиш ниже. Всё происходит на этом компьютере: ваш голос не покидает его и не сохраняется.
settings-dictation-not-installed = Диктовка не установлена на этом компьютере
settings-dictation-hold = Удерживайте { $keys } для диктовки
settings-dictation-needs-shortcut = Отключена, пока не задано сочетание клавиш
settings-dictation-copilot-key = клавишу Copilot
settings-dictation-shortcut = Сочетание клавиш
settings-dictation-shortcut-description = Удерживайте его и говорите или нажмите, чтобы слушать, пока не нажмёте снова или не замолчите
settings-dictation-shortcut-own = Своё сочетание
settings-dictation-shortcut-another = Другое сочетание…
settings-dictation-shortcut-off = Отключено
settings-dictation-keys = Клавиши
settings-dictation-change = Изменить
settings-dictation-language = Язык
settings-dictation-language-automatic = Автоматически
settings-dictation-language-automatic-current = Автоматически ({ $language })
settings-dictation-language-description = В автоматическом режиме язык следует за раскладкой клавиатуры, которой вы пользуетесь
settings-dictation-language-unavailable = Язык «{ $language }» недоступен на этом компьютере
settings-dictation-engine = Распознавание речи
settings-dictation-engine-automatic = Автоматически
settings-dictation-engine-description = { $engine } распознаёт язык «{ $language }»
settings-dictation-engine-graphics-card = { $engine } распознаёт язык «{ $language }» на видеокарте
settings-dictation-models = Речевые модели
settings-dictation-models-description = Модели скачиваются один раз и хранятся на этом компьютере.
settings-dictation-credits = Авторы
settings-dictation-credit = { $credit }. Лицензия: { $licence }.
settings-dictation-learn-more = Подробнее

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Не удалось скачать: { $reason }
settings-dictation-model-downloading = { $received } из { $total }
settings-dictation-model-installed = На этом компьютере: { $size }
settings-dictation-model-partial = Скачано { $received } из { $total }
settings-dictation-model-size = Размер загрузки: { $size }
settings-dictation-model-retry = Повторить
settings-dictation-model-cancel = Отмена
settings-dictation-model-resume = Продолжить
settings-dictation-model-download = Скачать
settings-dictation-model-remove = Удалить

## Mouse and touchpad

settings-mouse-mouse = Мышь
settings-mouse-primary-button = Основная кнопка
settings-mouse-primary-button-description = Кнопка, которой вы выбираете объекты
settings-mouse-primary-button-left = Левая
settings-mouse-primary-button-right = Правая
settings-mouse-speed = Скорость указателя
settings-mouse-slower = Медленнее
settings-mouse-faster = Быстрее
settings-mouse-acceleration = Ускорение мыши
settings-mouse-acceleration-description = Указатель перемещается дальше, когда вы быстро двигаете мышь
settings-mouse-natural-scrolling = Естественная прокрутка
settings-mouse-natural-scrolling-description = Прокрутка перемещает содержимое, а не область просмотра
settings-mouse-touchpad = Сенсорная панель
settings-mouse-touchpad-speed = Скорость указателя сенсорной панели
settings-mouse-touchpad-scroll-speed = Скорость прокрутки
settings-mouse-touchpad-scroll-speed-label = Скорость прокрутки сенсорной панели
settings-mouse-touchpad-tap = Касание для щелчка
settings-mouse-touchpad-tap-description = Касайтесь сенсорной панели вместо того, чтобы нажимать её
settings-mouse-touchpad-natural-scrolling = Естественная прокрутка сенсорной панели
settings-mouse-touchpad-natural-scrolling-description = Содержимое движется в ту же сторону, что и пальцы
settings-mouse-touchpad-scroll-with = Прокрутка
settings-mouse-touchpad-two-fingers = Двумя пальцами
settings-mouse-touchpad-scroll-edge = По краю
settings-mouse-touchpad-secondary-click = Правый щелчок
settings-mouse-touchpad-secondary-click-description = Как выполнить правый щелчок без отдельной кнопки
settings-mouse-touchpad-click-corner = Угол
settings-mouse-touchpad-disable-typing = Отключать при вводе текста
settings-mouse-touchpad-disable-typing-description = Чтобы указатель не прыгал, пока вы печатаете
