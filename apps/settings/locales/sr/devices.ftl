## Displays

settings-display-mirror = Пресликај екране
settings-display-mirror-description = Приказује исту слику на свим екранима
settings-display-mirrored = Пресликани екрани
settings-display-display = Екран
settings-display-apply-failed = Ова подешавања не раде. Пробајте другачији распоред.
settings-display-reset = Врати
settings-display-apply = Примени
settings-display-arrangement-main = { $name }, главни екран
settings-display-use = Користи овај екран
settings-display-main = Главни екран
settings-display-main-description = Ту се приказују трака задатака и нови прозори
settings-display-resolution-title = Резолуција
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Учесталост освежавања
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Променљива учесталост освежавања
settings-display-variable-refresh-description = Екран прати број сличица у играма преко целог екрана, за глаткији покрет
settings-display-variable-refresh-off = Искључено
settings-display-variable-refresh-games = У играма
settings-display-variable-refresh-fullscreen = У свим апликацијама преко целог екрана
settings-display-scale = Размера
settings-display-scale-description = Повећава или смањује текст, апликације и све остало
settings-display-orientation = Оријентација
settings-display-orientation-landscape = Положено
settings-display-orientation-portrait-right = Усправно, удесно
settings-display-orientation-portrait-left = Усправно, улево
settings-display-orientation-landscape-flipped = Положено, обрнуто

## Display brightness

settings-display-brightness = Осветљеност
settings-display-brightness-label = Осветљеност: { $name }
settings-display-brightness-unsupported = Укључите DDC/CI у менију екрана да бисте је мењали овде
settings-display-brightness-unresponsive = Тренутно не одговара, ускоро следи нови покушај
settings-display-brightness-external = Спољни екрани
settings-display-brightness-missing-tool = Инсталирајте ddcutil да бисте овде мењали њихову осветљеност
settings-display-brightness-needs-restart = Поново покрените рачунар да бисте довршили подешавање њихове осветљености
settings-display-brightness-no-access = Одјавите се и поново пријавите да бисте овде мењали њихову осветљеност

## Night light

settings-display-night-light = Ноћно светло
settings-display-night-light-description = Топлије боје увече, пријатније за очи
settings-display-night-light-schedule = Распоред
settings-display-night-light-automatic = Од заласка до изласка сунца
settings-display-night-light-custom = Прилагођено
settings-display-night-light-from = Укључује се
settings-display-night-light-to = Искључује се
settings-display-night-light-warmth = Топлина

## Sound

settings-sound-output = Излаз
settings-sound-input = Улаз
settings-sound-device = Уређај
settings-sound-output-device = Излазни уређај
settings-sound-input-device = Улазни уређај
settings-sound-connection = Прикључак
settings-sound-output-connection = Излазни прикључак
settings-sound-input-connection = Улазни прикључак
settings-sound-volume = Јачина звука
settings-sound-mute = Искључи звук: { $name }
settings-sound-unmute = Укључи звук: { $name }
settings-sound-balance = Баланс
settings-sound-balance-center = Средина
settings-sound-balance-left = { $share } лево
settings-sound-balance-right = { $share } десно
settings-sound-louder = Дозволи јачину преко 100%
settings-sound-louder-description = Звук може да се изобличи при већој јачини
settings-sound-input-level = Ниво улаза
settings-sound-apps = Јачина звука апликација
settings-sound-apps-playing = { $count ->
    [one] { $count } апликација пушта звук
    [few] { $count } апликације пуштају звук
   *[other] { $count } апликација пушта звук
}
settings-sound-app-output = Излаз звука за { $app }
settings-sound-profiles = Профили уређаја
settings-sound-profiles-row-description = Изаберите како се користи сваки звучни уређај
settings-sound-profiles-description = Како се користи сваки звучни уређај, на пример стерео или сураунд
settings-sound-profile-label = Како се користи { $device }
settings-sound-profile-off = Искључено

## System sounds

settings-sound-system = Системски звукови
settings-sound-system-description = Звукови за обавештења, уређаје и друге догађаје
settings-sound-system-volume = Јачина системских звукова
settings-sound-kind-notifications = Обавештења
    .description = Утишани током режима Не узнемиравај, игара и дељења екрана
    .preview = Пусти звук обавештења
settings-sound-kind-devices = Уређаји и пуњење
    .description = Повезивање уређаја или пуњача и слаба батерија
    .preview = Пусти звук уређаја
settings-sound-kind-volume = Звук при промени јачине
    .description = Кратак звук када мењате јачину звука
    .preview = Пусти звук јачине
settings-sound-kind-screenshots = Снимци екрана
    .description = Звук затварача када се сачува снимак екрана
    .preview = Пусти звук затварача
settings-sound-kind-recording = Снимање
    .description = Када снимање екрана, камера или диктирање почне или се заустави
    .preview = Пусти звук снимања
settings-sound-kind-sign-in = Звук пријаве
    .description = Када се појави радна површина
    .preview = Пусти звук пријаве
settings-sound-kind-keyboard = Звук тастатуре
    .description = Сваки тастер на тастатури на екрану
    .preview = Пусти звук тастера

## Power and battery

settings-power-battery = Батерија
settings-power-charging = Пуњење
settings-power-charging-at = Пуни се снагом од { $power }
settings-power-charging-until-full = Пуни се, биће пуна за { $time }
settings-power-charging-at-until-full = Пуни се снагом од { $power }, биће пуна за { $time }
settings-power-on-battery = Ради на батерију
settings-power-on-battery-using = Ради на батерију, троши { $power }
settings-power-time-left = Преостало још око { $time }
settings-power-time-left-using = Преостало још око { $time }, троши { $power }
settings-power-full = Потпуно напуњена
settings-power-empty = Празна
settings-power-not-charging = Прикључена, не пуни се
settings-power-health = Стање батерије
settings-power-capacity = { $full } од { $design } када је била нова
settings-power-cycles = { $count ->
    [one] { $cycles } циклус пуњења
    [few] { $cycles } циклуса пуњења
   *[other] { $cycles } циклуса пуњења
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Прикажи проценат
settings-power-show-percentage-description = Приказује ниво батерије унутар иконе батерије

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = мање од минута
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } минут
    [few] { $minutes } минута
   *[other] { $minutes } минута
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } сат
    [few] { $hours } сата
   *[other] { $hours } сати
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } сат
    [few] { $hours } сата
   *[other] { $hours } сати
} { $minutes ->
    [one] { $minutes } минут
    [few] { $minutes } минута
   *[other] { $minutes } минута
}
settings-power-never = Никад

## Charge limit

settings-power-limit = Ограничи пуњење
settings-power-limit-failed = Ограничење није могло да се промени. Покушајте поново.
settings-power-limit-elsewhere-off = Друга апликација га је искључила, па се батерија пуни до краја
settings-power-limit-elsewhere-changed = Друга апликација је променила ограничење на { $level }
settings-power-limit-elsewhere-on = Друга апликација зауставља пуњење на { $level }
settings-power-limit-automatic = Рачунар сам одлучује када да заустави пуњење
settings-power-limit-stops-at = Пуњење се зауставља на { $level }
settings-power-limit-description = Раније зауставља пуњење да би батерија дуже трајала
settings-power-limit-description-at = Зауставља пуњење на { $level } да би батерија дуже трајала
settings-power-limit-applied = Пуњење се зауставља на { $level }
settings-power-limit-applied-description = Подесила га је друга апликација на овом рачунару

## Battery-powered devices

settings-power-devices = Уређаји
settings-power-device-mouse = Миш
settings-power-device-keyboard = Тастатура
settings-power-device-headphones = Слушалице
settings-power-device-speaker = Звучник
settings-power-device-controller = Контролер
settings-power-device-phone = Телефон
settings-power-device-tablet = Таблет
settings-power-device-pen = Оловка
settings-power-device-touchpad = Тачпед
settings-power-device-other = Уређај

## Power mode

settings-power-mode = Режим напајања
settings-power-mode-row = Режим
settings-power-profile-saver = Уштеда енергије
    .description = Спорије, уз мању потрошњу
settings-power-profile-balanced = Уравнотежено
    .description = Стандардне перформансе и потрошња
settings-power-profile-performance = Перформансе
    .description = Брже, уз већу потрошњу
settings-power-limited = Перформансе су тренутно ограничене
settings-power-limited-lap = Перформансе су ограничене јер је рачунар у крилу
settings-power-limited-hot = Перформансе су ограничене јер је рачунар превише врућ
settings-power-limited-lap-hot = Перформансе су ограничене јер је рачунар у крилу и превише врућ
settings-power-saver-low-battery = Уштеда енергије при слабој батерији
settings-power-saver-low-battery-description = Укључује уштеду енергије када батерија почне да се празни
settings-power-saver-level = Ниво батерије за уштеду енергије

## Keyboard backlight

settings-power-keyboard = Тастатура
settings-power-backlight = Позадинско осветљење тастатуре
settings-power-backlight-off = Искључено
settings-power-backlight-low = Слабо
settings-power-backlight-medium = Средње
settings-power-backlight-high = Јако

## Screen and sleep

settings-power-screen = Екран
settings-power-screen-off = Искључи екран после
settings-power-screen-off-description = Када неко време не користите рачунар
settings-power-dim = Затамни при неактивности
settings-power-dim-description = Смањује осветљеност мало пре него што се екран искључи
settings-power-sleep = Спавање
settings-power-suspend-plugged-in = Стање спавања када је прикључен
settings-power-suspend-inactive = Стање спавања при неактивности
settings-power-suspend-description = Пребацује рачунар у стање спавања кад се неко време не користи
settings-power-suspend-battery = Стање спавања на батерији
settings-power-button = Дугме за напајање
settings-power-button-suspend = Спавање
settings-power-button-hibernate = Хибернација
settings-power-button-ask = Питај шта да ради
settings-power-button-nothing = Не ради ништа
settings-power-long-sleep = Искључи после дугог спавања
settings-power-long-sleep-description = Уместо да се батерија потпуно испразни током спавања, рачунар се искључује када батерија ослаби или после дугог спавања на батерији. Отворени прозори се не чувају.
settings-power-long-sleep-failed = Ово није могло да се промени. Покушајте поново.
settings-power-long-sleep-after = Искључи после
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } сат
    [few] { $hours } сата
   *[other] { $hours } сати
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } дан
    [few] { $days } дана
   *[other] { $days } дана
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } недеља
    [few] { $weeks } недеље
   *[other] { $weeks } недеља
}

## Keyboard

settings-keyboard-sources = Извори уноса
settings-keyboard-sources-description = Први се користи подразумевано. Мењајте их док куцате.
settings-keyboard-source-edit = Уреди у апликацији Keys
settings-keyboard-source-up = Помери нагоре
settings-keyboard-source-down = Помери надоле
settings-keyboard-source-remove = Уклони
settings-keyboard-add-source-button = Додај извор уноса
settings-keyboard-own = Ваши распореди и методи уноса
settings-keyboard-own-layout = Направи распоред
settings-keyboard-own-layout-description = Почните од постојећег распореда и промените шта његови тастери куцају
settings-keyboard-own-method = Направи метод уноса
settings-keyboard-own-method-description = Претвара оно што куцате у акценте, друга писма или речи за избор
settings-keyboard-own-open = Отвори Keys
settings-keyboard-own-open-description = Уредите распореде и методе уноса које сте направили
settings-keyboard-switch-source = Промени извор уноса
settings-keyboard-add-source = Додавање извора уноса
settings-keyboard-add-source-description = Изаберите распоред тастатуре или метод уноса којим желите да куцате.
settings-keyboard-add-source-search = Претражи језике, распореде и методе уноса
settings-keyboard-input-method = Метод уноса
settings-keyboard-add-source-no-match = Ништа се не поклапа са „{ $query }“
settings-keyboard-cancel = Откажи
settings-keyboard-add = Додај
settings-keyboard-typing = Куцање
settings-keyboard-repeat = Понављање тастера
settings-keyboard-repeat-description = Држање тастера га куца изнова и изнова
settings-keyboard-repeat-delay = Пауза пре понављања
settings-keyboard-repeat-delay-shorter = Краћа
settings-keyboard-repeat-delay-longer = Дужа
settings-keyboard-repeat-speed = Брзина понављања
settings-keyboard-repeat-speed-slower = Спорије
settings-keyboard-repeat-speed-faster = Брже
settings-keyboard-caps-lock = Тастер Caps Lock
settings-keyboard-caps-lock-description = Шта се дешава када га притиснете
settings-keyboard-caps-lock-escape = Escape
settings-keyboard-caps-lock-swap-escape = Замени са Escape
settings-keyboard-caps-lock-nothing = Ништа
settings-keyboard-caps-lock-custom = Прилагођено
settings-keyboard-lock-notices = Прикажи Caps Lock и Num Lock
settings-keyboard-lock-notices-description = Накратко приказује на екрану када се неки од њих укључи или искључи
settings-keyboard-dictation-on = Укључено
settings-keyboard-dictation-off = Искључено
settings-keyboard-shortcuts-description = Прегледајте и мењајте пречице или додајте своје

## Copilot key

settings-keyboard-copilot = Тастер Copilot
settings-keyboard-copilot-press = Притисак
settings-keyboard-copilot-press-description = Шта ради кратак притисак тастера
settings-keyboard-copilot-open-start = Отвори Старт
settings-keyboard-copilot-open-app = Отвори апликацију
settings-keyboard-copilot-nothing = Ништа
settings-keyboard-copilot-app = Апликација
settings-keyboard-copilot-no-app = Апликација још није изабрана
settings-keyboard-copilot-change = Промени
settings-keyboard-copilot-choose = Изабери
settings-keyboard-copilot-hold = Држи за диктирање
settings-keyboard-copilot-hold-description = Држите тастер и говорите да бисте откуцали оно што кажете
settings-keyboard-copilot-hold-off = Ради када је диктирање укључено
settings-keyboard-copilot-choose-app = Изаберите апликацију
settings-keyboard-copilot-choose-app-description = Отвара се притиском на тастер Copilot.

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
settings-keys-space = Размак
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Мени
settings-keys-keypad = Нумерички { $key }
settings-keys-volume-up = Појачај звук
settings-keys-volume-down = Утишај звук
settings-keys-mute = Искључи звук
settings-keys-microphone-mute = Искључи микрофон
settings-keys-play = Пусти
settings-keys-media-pause = Пауза
settings-keys-stop = Заустави
settings-keys-next-track = Следећа нумера
settings-keys-previous-track = Претходна нумера
settings-keys-brightness-up = Појачај осветљеност
settings-keys-brightness-down = Смањи осветљеност
settings-keys-browser = Прегледач
settings-keys-home-page = Почетна страница
settings-keys-search = Претрага
settings-keys-mail = Пошта
settings-keys-calculator = Калкулатор
settings-keys-files = Датотеке
settings-keys-eject = Избаци
settings-keys-power = Напајање
settings-keys-lock = Закључај

## Keyboard shortcuts

settings-shortcuts-title = Тастерске пречице
settings-shortcuts-search = Претражи пречице
settings-shortcuts-category-system = Систем
settings-shortcuts-category-windows = Прозори
settings-shortcuts-category-tiling = Поплочавање
settings-shortcuts-category-workspaces = Радни простори
settings-shortcuts-category-screenshots = Снимци екрана
settings-shortcuts-category-media = Медији
settings-shortcuts-reset = Врати подразумевано
settings-shortcuts-apps = Пречице апликација
settings-shortcuts-apps-description = Пречице које су апликације затражиле, а раде и када апликација није у првом плану
settings-shortcuts-no-match = Ниједна пречица се не поклапа са „{ $query }“
settings-shortcuts-change = Промени пречицу за { $name }
settings-shortcuts-or = или
settings-shortcuts-not-set = Није подешено
settings-shortcuts-press-keys = Притисните жељене тастере
settings-shortcuts-needs-modifier = Додајте Ctrl, Alt или Super да пречица не би сметала при куцању.
settings-shortcuts-record-description = Притисните нову пречицу. Backspace је искључује, Escape отказује.
settings-shortcuts-record-taken = Ова пречица се већ користи за „{ $name }“. Ако је замените, тамо ће бити искључена.
settings-shortcuts-try-another = Пробај другу
settings-shortcuts-replace = Замени
settings-shortcuts-cancel = Откажи
settings-shortcuts-custom = Прилагођене пречице
settings-shortcuts-custom-description = Покрените команду или отворите апликацију комбинацијом тастера
settings-shortcuts-untitled = Без назива
settings-shortcuts-add = Додај пречицу
settings-shortcuts-edit = Уреди пречицу
settings-shortcuts-custom-name = Назив
settings-shortcuts-custom-command = Команда
settings-shortcuts-custom-shortcut = Пречица
settings-shortcuts-custom-taken = Већ се користи за „{ $name }“. Чувањем ће тамо бити искључена.
settings-shortcuts-remove = Уклони
settings-shortcuts-save = Сачувај
settings-shortcuts-add-button = Додај

## Dictation

settings-dictation-title = Диктирање
settings-dictation-description = Држите { $keys } и говорите да бисте откуцали оно што кажете, у било којој апликацији. Пустите да бисте завршили или притисните Escape да бисте отказали. Све се дешава на овом рачунару: ваш глас га никада не напушта и не чува се.
settings-dictation-description-no-shortcut = Изаберите пречицу испод да бисте диктирали. Све се дешава на овом рачунару: ваш глас га никада не напушта и не чува се.
settings-dictation-not-installed = Диктирање није инсталирано на овом рачунару
settings-dictation-hold = Држите { $keys } за диктирање
settings-dictation-needs-shortcut = Искључено док нема пречицу
settings-dictation-copilot-key = тастер Copilot
settings-dictation-shortcut = Пречица
settings-dictation-shortcut-description = Држите је док говорите или је притисните да слуша док је поново не притиснете или не престанете да говорите
settings-dictation-shortcut-own = Моја пречица
settings-dictation-shortcut-another = Друга пречица…
settings-dictation-shortcut-off = Искључено
settings-dictation-keys = Тастери
settings-dictation-change = Промени
settings-dictation-language = Језик
settings-dictation-language-automatic = Аутоматски
settings-dictation-language-automatic-current = Аутоматски ({ $language })
settings-dictation-language-description = Аутоматски избор прати распоред тастатуре којим куцате
settings-dictation-language-unavailable = Језик { $language } није доступан на овом рачунару
settings-dictation-engine = Препознавање говора
settings-dictation-engine-automatic = Аутоматски
settings-dictation-engine-description = { $engine } препознаје језик { $language }
settings-dictation-engine-graphics-card = { $engine } препознаје језик { $language } на графичкој картици
settings-dictation-models = Говорни модели
settings-dictation-models-description = Модели се преузимају једном и чувају на овом рачунару.
settings-dictation-credits = Заслуге
settings-dictation-credit = { $credit }. Лиценца: { $licence }.
settings-dictation-learn-more = Сазнајте више

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Преузимање није успело: { $reason }
settings-dictation-model-downloading = { $received } од { $total }
settings-dictation-model-installed = { $size } на овом рачунару
settings-dictation-model-partial = Преузето { $received } од { $total }
settings-dictation-model-size = { $size } за преузимање
settings-dictation-model-retry = Покушај поново
settings-dictation-model-cancel = Откажи
settings-dictation-model-resume = Настави
settings-dictation-model-download = Преузми
settings-dictation-model-remove = Уклони

## Mouse and touchpad

settings-mouse-mouse = Миш
settings-mouse-primary-button = Примарно дугме
settings-mouse-primary-button-description = Дугме којим кликћете да бисте нешто изабрали
settings-mouse-primary-button-left = Лево
settings-mouse-primary-button-right = Десно
settings-mouse-speed = Брзина показивача
settings-mouse-slower = Спорије
settings-mouse-faster = Брже
settings-mouse-acceleration = Убрзање миша
settings-mouse-acceleration-description = Показивач прелази већи пут када брзо померите миш
settings-mouse-natural-scrolling = Природно померање
settings-mouse-natural-scrolling-description = Померање помера садржај уместо приказа
settings-mouse-touchpad = Тачпед
settings-mouse-touchpad-speed = Брзина показивача на тачпеду
settings-mouse-touchpad-scroll-speed = Брзина померања
settings-mouse-touchpad-scroll-speed-label = Брзина померања на тачпеду
settings-mouse-touchpad-tap = Додир за клик
settings-mouse-touchpad-tap-description = Додирните тачпед уместо да га притискате
settings-mouse-touchpad-natural-scrolling = Природно померање на тачпеду
settings-mouse-touchpad-natural-scrolling-description = Садржај се помера у истом смеру као прсти
settings-mouse-touchpad-scroll-with = Померање помоћу
settings-mouse-touchpad-two-fingers = Два прста
settings-mouse-touchpad-scroll-edge = Ивица
settings-mouse-touchpad-secondary-click = Секундарни клик
settings-mouse-touchpad-secondary-click-description = Како да кликнете десним тастером без посебног дугмета
settings-mouse-touchpad-click-corner = Угао
settings-mouse-touchpad-disable-typing = Искључи током куцања
settings-mouse-touchpad-disable-typing-description = Да показивач не би скакао док куцате
