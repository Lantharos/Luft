## Displays

settings-display-mirror = Огледално прикажување
settings-display-mirror-description = Иста слика на секој екран
settings-display-mirrored = Огледални екрани
settings-display-display = Екран
settings-display-apply-failed = Овие поставки не функционираа. Обидете се со поинаков распоред.
settings-display-reset = Врати
settings-display-apply = Примени
settings-display-arrangement-main = { $name }, главен екран
settings-display-use = Користи го овој екран
settings-display-main = Главен екран
settings-display-main-description = Лентата со задачи и новите прозорци се појавуваат тука
settings-display-resolution-title = Резолуција
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Стапка на освежување
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Променлива стапка на освежување
settings-display-variable-refresh-description = Екранот ја следи брзината на сликите во игрите на цел екран, за помазно движење
settings-display-variable-refresh-off = Исклучено
settings-display-variable-refresh-games = Во игри
settings-display-variable-refresh-fullscreen = Во сите апликации на цел екран
settings-display-scale = Размер
settings-display-scale-description = Текстот, апликациите и сè друго станува поголемо или помало
settings-display-orientation = Ориентација
settings-display-orientation-landscape = Хоризонтално
settings-display-orientation-portrait-right = Вертикално надесно
settings-display-orientation-portrait-left = Вертикално налево
settings-display-orientation-landscape-flipped = Хоризонтално, превртено

## Display brightness

settings-display-brightness = Осветленост
settings-display-brightness-label = Осветленост на { $name }
settings-display-brightness-unsupported = Вклучете DDC/CI во менито на екранот за да ја менувате тука
settings-display-brightness-unresponsive = Моментално не одговара, наскоро нов обид
settings-display-brightness-external = Надворешни екрани
settings-display-brightness-missing-tool = Инсталирајте ddcutil за да ја менувате нивната осветленост тука
settings-display-brightness-needs-restart = Рестартирајте за да заврши поставувањето на нивната осветленост
settings-display-brightness-no-access = Одјавете се и најавете се повторно за да ја менувате нивната осветленост тука

## Night light

settings-display-night-light = Ноќно светло
settings-display-night-light-description = Потопли бои навечер, попријатни за очите
settings-display-night-light-schedule = Распоред
settings-display-night-light-automatic = Од зајдисонце до изгрејсонце
settings-display-night-light-custom = Сопствен
settings-display-night-light-from = Се вклучува
settings-display-night-light-to = Се исклучува
settings-display-night-light-warmth = Топлина

## Sound

settings-sound-output = Излез
settings-sound-input = Влез
settings-sound-device = Уред
settings-sound-output-device = Излезен уред
settings-sound-input-device = Влезен уред
settings-sound-connection = Приклучок
settings-sound-output-connection = Излезен приклучок
settings-sound-input-connection = Влезен приклучок
settings-sound-volume = Јачина на звук
settings-sound-mute = Исклучи звук – { $name }
settings-sound-unmute = Вклучи звук – { $name }
settings-sound-balance = Баланс
settings-sound-balance-center = Средина
settings-sound-balance-left = { $share } лево
settings-sound-balance-right = { $share } десно
settings-sound-louder = Дозволи над 100%
settings-sound-louder-description = Звукот може да се изобличи при поголема јачина
settings-sound-input-level = Ниво на влезот
settings-sound-apps = Јачина по апликации
settings-sound-apps-playing = { $count ->
    [one] { $count } апликација пушта звук
   *[other] { $count } апликации пуштаат звук
}
settings-sound-app-output = Излез за { $app }
settings-sound-profiles = Профили на уредите
settings-sound-profiles-row-description = Изберете како се користи секој звучен уред
settings-sound-profiles-description = Како се користи секој звучен уред, на пр. стерео или опкружувачки звук
settings-sound-profile-label = Како се користи { $device }
settings-sound-profile-off = Исклучено

## System sounds

settings-sound-system = Системски звуци
settings-sound-system-description = Звуци за известувања, уреди и други настани
settings-sound-system-volume = Јачина на системските звуци
settings-sound-kind-notifications = Известувања
    .description = Тивко за време на Не вознемирувај, игри и споделување на екранот
    .preview = Пушти го звукот за известување
settings-sound-kind-devices = Уреди и полнење
    .description = Поврзување уред или полнач и слаба батерија
    .preview = Пушти го звукот за уреди
settings-sound-kind-volume = Звук при промена на јачината
    .description = Кратко кликнување кога ја менувате јачината на звукот
    .preview = Пушти го кликнувањето
settings-sound-kind-screenshots = Слики од екранот
    .description = Звук на затворач кога ќе се зачува слика од екранот
    .preview = Пушти го затворачот
settings-sound-kind-recording = Снимање
    .description = Кога снимањето на екранот, камерата или диктирањето почнува и завршува
    .preview = Пушти го звукот за снимање
settings-sound-kind-sign-in = Звук при најава
    .description = Кога ќе се појави работната површина
    .preview = Пушти го звукот при најава
settings-sound-kind-keyboard = Звуци на тастатурата
    .description = Секое копче на тастатурата на екранот
    .preview = Пушти звук на копче

## Power and battery

settings-power-battery = Батерија
settings-power-charging = Се полни
settings-power-charging-at = Се полни со { $power }
settings-power-charging-until-full = Се полни, полна за { $time }
settings-power-charging-at-until-full = Се полни со { $power }, полна за { $time }
settings-power-on-battery = На батерија
settings-power-on-battery-using = На батерија, троши { $power }
settings-power-time-left = Преостанато: околу { $time }
settings-power-time-left-using = Преостанато: околу { $time }, троши { $power }
settings-power-full = Целосно полна
settings-power-empty = Празна
settings-power-not-charging = Приклучена, не се полни
settings-power-health = Состојба на батеријата
settings-power-capacity = { $full } од првобитните { $design }
settings-power-cycles = { $count ->
    [one] { $cycles } циклус на полнење
   *[other] { $cycles } циклуса на полнење
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Прикажи процент
settings-power-show-percentage-description = Нивото на батеријата се прикажува во иконата на батеријата

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = помалку од минута
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
settings-power-never = Никогаш

## Charge limit

settings-power-limit = Ограничување на полнењето
settings-power-limit-failed = Ограничувањето не можеше да се промени. Обидете се повторно.
settings-power-limit-elsewhere-off = Друга апликација го исклучи, па батеријата се полни целосно
settings-power-limit-elsewhere-changed = Друга апликација го промени ограничувањето на { $level }
settings-power-limit-elsewhere-on = Друга апликација го запира полнењето на { $level }
settings-power-limit-automatic = Компјутерот сам одлучува кога да го запре полнењето
settings-power-limit-stops-at = Полнењето запира на { $level }
settings-power-limit-description = Полнењето запира порано за батеријата да трае подолго
settings-power-limit-description-at = Запира на { $level } за батеријата да трае подолго
settings-power-limit-applied = Полнењето запира на { $level }
settings-power-limit-applied-description = Поставено од друга апликација на овој компјутер

## Battery-powered devices

settings-power-devices = Уреди
settings-power-device-mouse = Глувче
settings-power-device-keyboard = Тастатура
settings-power-device-headphones = Слушалки
settings-power-device-speaker = Звучник
settings-power-device-controller = Контролер
settings-power-device-phone = Телефон
settings-power-device-tablet = Таблет
settings-power-device-pen = Пенкало
settings-power-device-touchpad = Тачпед
settings-power-device-other = Уред

## Power mode

settings-power-mode = Режим на напојување
settings-power-mode-row = Режим
settings-power-profile-saver = Штедење енергија
    .description = Побавно, со помала потрошувачка
settings-power-profile-balanced = Балансирано
    .description = Стандардни перформанси и потрошувачка
settings-power-profile-performance = Перформанси
    .description = Побрзо, со поголема потрошувачка
settings-power-limited = Перформансите моментално се ограничени
settings-power-limited-lap = Перформансите се ограничени затоа што компјутерот е во вашиот скут
settings-power-limited-hot = Перформансите се ограничени затоа што компјутерот е премногу топол
settings-power-limited-lap-hot = Перформансите се ограничени затоа што компјутерот е во вашиот скут и е премногу топол
settings-power-saver-low-battery = Штедење енергија при слаба батерија
settings-power-saver-low-battery-description = Се вклучува штедење енергија кога батеријата ќе ослабне

## Keyboard backlight

settings-power-keyboard = Тастатура
settings-power-backlight = Осветлување на тастатурата
settings-power-backlight-off = Исклучено
settings-power-backlight-low = Слабо
settings-power-backlight-medium = Средно
settings-power-backlight-high = Силно

## Screen and sleep

settings-power-screen = Екран
settings-power-screen-off = Гаснење на екранот по
settings-power-screen-off-description = Кога компјутерот не се користи некое време
settings-power-dim = Затемнување при неактивност
settings-power-dim-description = Осветленоста се намалува непосредно пред екранот да се исклучи
settings-power-sleep = Спиење
settings-power-suspend-plugged-in = Спиење кога е приклучен
settings-power-suspend-inactive = Спиење при неактивност
settings-power-suspend-description = Компјутерот преминува во режим на спиење по некое време без користење
settings-power-suspend-battery = Спиење на батерија
settings-power-button = Копче за вклучување
settings-power-button-suspend = Спиење
settings-power-button-hibernate = Хибернација
settings-power-button-ask = Прашај што да се направи
settings-power-button-nothing = Ништо
settings-power-long-sleep = Исклучување по долго спиење
settings-power-long-sleep-description = Наместо батеријата да се испразни додека компјутерот спие, тој се исклучува кога батеријата ќе ослабне или по долго спиење на батерија. Отворените прозорци не се зачувуваат.
settings-power-long-sleep-failed = Ова не можеше да се промени. Обидете се повторно.
settings-power-long-sleep-after = Исклучување по
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } час
   *[other] { $hours } часа
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } ден
   *[other] { $days } дена
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } недела
   *[other] { $weeks } недели
}

## Keyboard

settings-keyboard-sources = Извори за внесување
settings-keyboard-sources-description = Првиот се користи стандардно. Префрлајте се меѓу нив додека пишувате.
settings-keyboard-source-edit = Уреди во Keys
settings-keyboard-source-up = Помести нагоре
settings-keyboard-source-down = Помести надолу
settings-keyboard-source-remove = Отстрани
settings-keyboard-add-source-button = Додај извор за внесување
settings-keyboard-own = Ваши распореди и методи за внесување
settings-keyboard-own-layout = Направи распоред
settings-keyboard-own-layout-description = Почнете од постоечки распоред и сменете што пишуваат неговите копчиња
settings-keyboard-own-method = Направи метод за внесување
settings-keyboard-own-method-description = Претворете го она што го пишувате во акценти, други писма или зборови за избор
settings-keyboard-own-open = Отвори Keys
settings-keyboard-own-open-description = Уредете ги распоредите и методите за внесување што сте ги направиле
settings-keyboard-switch-source = Промени извор за внесување
settings-keyboard-add-source = Додавање извор за внесување
settings-keyboard-add-source-description = Изберете го распоредот на тастатура или методот за внесување со кој сакате да пишувате.
settings-keyboard-add-source-search = Пребарај јазици, распореди и методи за внесување
settings-keyboard-input-method = Метод за внесување
settings-keyboard-add-source-no-match = Ништо не одговара на „{ $query }“
settings-keyboard-cancel = Откажи
settings-keyboard-add = Додај
settings-keyboard-typing = Пишување
settings-keyboard-repeat = Повторување на копчињата
settings-keyboard-repeat-description = Кога држите копче, тоа се пишува постојано
settings-keyboard-repeat-delay = Задоцнување пред повторување
settings-keyboard-repeat-delay-shorter = Пократко
settings-keyboard-repeat-delay-longer = Подолго
settings-keyboard-repeat-speed = Брзина на повторување
settings-keyboard-repeat-speed-slower = Побавно
settings-keyboard-repeat-speed-faster = Побрзо
settings-keyboard-caps-lock = Копче Caps Lock
settings-keyboard-caps-lock-description = Што се случува кога ќе го притиснете
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Замени со Esc
settings-keyboard-caps-lock-nothing = Ништо
settings-keyboard-caps-lock-custom = Сопствено
settings-keyboard-lock-notices = Прикажи Caps Lock и Num Lock
settings-keyboard-lock-notices-description = Накратко се прикажува на екранот кога некое од нив ќе се вклучи или исклучи
settings-keyboard-dictation-on = Вклучено
settings-keyboard-dictation-off = Исклучено
settings-keyboard-shortcuts-description = Прегледајте и сменете ги кратенките или додајте свои

## Copilot key

settings-keyboard-copilot = Копче Copilot
settings-keyboard-copilot-press = Притискање
settings-keyboard-copilot-press-description = Што прави краткото притискање на копчето
settings-keyboard-copilot-open-start = Отвори го менито Старт
settings-keyboard-copilot-open-app = Отвори апликација
settings-keyboard-copilot-nothing = Ништо
settings-keyboard-copilot-app = Апликација
settings-keyboard-copilot-no-app = Сè уште не е избрана апликација
settings-keyboard-copilot-change = Промени
settings-keyboard-copilot-choose = Избери
settings-keyboard-copilot-hold = Држење за диктирање
settings-keyboard-copilot-hold-description = Држете го копчето и зборувајте, а она што го кажувате ќе се внесе како текст
settings-keyboard-copilot-hold-off = Работи кога диктирањето е вклучено
settings-keyboard-copilot-choose-app = Избор на апликација
settings-keyboard-copilot-choose-app-description = Ќе се отвора со притискање на копчето Copilot.

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
settings-keys-space = Празно место
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Мени
settings-keys-keypad = Нумерички { $key }
settings-keys-volume-up = Зголеми звук
settings-keys-volume-down = Намали звук
settings-keys-mute = Без звук
settings-keys-microphone-mute = Исклучи микрофон
settings-keys-play = Пушти
settings-keys-media-pause = Пауза
settings-keys-stop = Стоп
settings-keys-next-track = Следна песна
settings-keys-previous-track = Претходна песна
settings-keys-brightness-up = Зголеми осветленост
settings-keys-brightness-down = Намали осветленост
settings-keys-browser = Прелистувач
settings-keys-home-page = Почетна страница
settings-keys-search = Пребарување
settings-keys-mail = Пошта
settings-keys-calculator = Калкулатор
settings-keys-files = Датотеки
settings-keys-eject = Исфрли
settings-keys-power = Напојување
settings-keys-lock = Заклучи

## Keyboard shortcuts

settings-shortcuts-title = Кратенки на тастатура
settings-shortcuts-search = Пребарај кратенки
settings-shortcuts-category-system = Систем
settings-shortcuts-category-windows = Прозорци
settings-shortcuts-category-workspaces = Работни простори
settings-shortcuts-category-screenshots = Слики од екранот
settings-shortcuts-category-media = Медиуми
settings-shortcuts-reset = Врати на стандардно
settings-shortcuts-apps = Кратенки на апликациите
settings-shortcuts-apps-description = Кратенки што ги побарале апликациите и што работат и кога апликацијата не е во преден план
settings-shortcuts-no-match = Ниедна кратенка не одговара на „{ $query }“
settings-shortcuts-change = Промени ја кратенката за { $name }
settings-shortcuts-or = или
settings-shortcuts-not-set = Не е поставена
settings-shortcuts-press-keys = Притиснете ги копчињата што ги сакате
settings-shortcuts-needs-modifier = Додајте Ctrl, Alt или Super за кратенката да не пречи при пишување.
settings-shortcuts-record-description = Притиснете ја новата кратенка. Backspace ја исклучува, Esc откажува.
settings-shortcuts-record-taken = Оваа кратенка веќе се користи за „{ $name }“. Ако ја замените, таму ќе се исклучи.
settings-shortcuts-try-another = Обиди се со друга
settings-shortcuts-replace = Замени
settings-shortcuts-cancel = Откажи
settings-shortcuts-custom = Сопствени кратенки
settings-shortcuts-custom-description = Извршете команда или отворете апликација со комбинација на копчиња
settings-shortcuts-untitled = Без име
settings-shortcuts-add = Додај кратенка
settings-shortcuts-edit = Уреди кратенка
settings-shortcuts-custom-name = Име
settings-shortcuts-custom-command = Команда
settings-shortcuts-custom-shortcut = Кратенка
settings-shortcuts-custom-taken = Веќе се користи за „{ $name }“. Со зачувување, таму ќе се исклучи.
settings-shortcuts-remove = Отстрани
settings-shortcuts-save = Зачувај
settings-shortcuts-add-button = Додај

## Dictation

settings-dictation-title = Диктирање
settings-dictation-description = Држете { $keys } и зборувајте, а она што го кажувате ќе се внесе како текст во која било апликација. Пуштете за да завршите или притиснете Esc за да откажете. Сè се случува на овој компјутер: вашиот глас никогаш не го напушта и не се зачувува.
settings-dictation-description-no-shortcut = Изберете кратенка подолу за да диктирате. Сè се случува на овој компјутер: вашиот глас никогаш не го напушта и не се зачувува.
settings-dictation-not-installed = Диктирањето не е инсталирано на овој компјутер
settings-dictation-hold = Држете { $keys } за да диктирате
settings-dictation-needs-shortcut = Исклучено додека нема кратенка
settings-dictation-copilot-key = копчето Copilot
settings-dictation-shortcut = Кратенка
settings-dictation-shortcut-description = Држете ја додека зборувате, или притиснете ја еднаш и слуша сè додека не ја притиснете повторно или не престанете да зборувате
settings-dictation-shortcut-own = Моја кратенка
settings-dictation-shortcut-another = Друга кратенка…
settings-dictation-shortcut-off = Исклучено
settings-dictation-keys = Копчиња
settings-dictation-change = Промени
settings-dictation-language = Јазик
settings-dictation-language-automatic = Автоматски
settings-dictation-language-automatic-current = Автоматски ({ $language })
settings-dictation-language-description = Автоматскиот избор го следи распоредот на тастатура со кој пишувате
settings-dictation-language-unavailable = { $language } не е достапен на овој компјутер
settings-dictation-engine = Препознавач на говор
settings-dictation-engine-automatic = Автоматски
settings-dictation-engine-description = { $engine } препознава { $language }
settings-dictation-engine-graphics-card = { $engine } препознава { $language } на графичката картичка
settings-dictation-models = Говорни модели
settings-dictation-models-description = Моделите се преземаат еднаш и се чуваат на овој компјутер.
settings-dictation-credits = Заслуги
settings-dictation-credit = { $credit }. Лиценца: { $licence }.
settings-dictation-learn-more = Дознајте повеќе

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Преземањето не успеа: { $reason }
settings-dictation-model-downloading = { $received } од { $total }
settings-dictation-model-installed = { $size } на овој компјутер
settings-dictation-model-partial = Преземено { $received } од { $total }
settings-dictation-model-size = { $size } за преземање
settings-dictation-model-retry = Обиди се повторно
settings-dictation-model-cancel = Откажи
settings-dictation-model-resume = Продолжи
settings-dictation-model-download = Преземи
settings-dictation-model-remove = Отстрани

## Mouse and touchpad

settings-mouse-mouse = Глувче
settings-mouse-primary-button = Примарно копче
settings-mouse-primary-button-description = Копчето со кое кликате за да изберете нешто
settings-mouse-primary-button-left = Лево
settings-mouse-primary-button-right = Десно
settings-mouse-speed = Брзина на покажувачот
settings-mouse-slower = Побавно
settings-mouse-faster = Побрзо
settings-mouse-acceleration = Забрзување на глувчето
settings-mouse-acceleration-description = Покажувачот оди подалеку кога брзо го движите глувчето
settings-mouse-natural-scrolling = Природно лизгање
settings-mouse-natural-scrolling-description = Лизгањето ја поместува содржината наместо погледот
settings-mouse-touchpad = Тачпед
settings-mouse-touchpad-speed = Брзина на покажувачот на тачпедот
settings-mouse-touchpad-scroll-speed = Брзина на лизгање
settings-mouse-touchpad-scroll-speed-label = Брзина на лизгање на тачпедот
settings-mouse-touchpad-tap = Допир за клик
settings-mouse-touchpad-tap-description = Допрете го тачпедот наместо да го притискате
settings-mouse-touchpad-natural-scrolling = Природно лизгање на тачпедот
settings-mouse-touchpad-natural-scrolling-description = Содржината се движи во истата насока како прстите
settings-mouse-touchpad-scroll-with = Лизгање со
settings-mouse-touchpad-two-fingers = Два прста
settings-mouse-touchpad-scroll-edge = Раб
settings-mouse-touchpad-secondary-click = Секундарен клик
settings-mouse-touchpad-secondary-click-description = Десен клик без посебно копче
settings-mouse-touchpad-click-corner = Агол
settings-mouse-touchpad-disable-typing = Исклучување при пишување
settings-mouse-touchpad-disable-typing-description = За покажувачот да не скока додека пишувате
