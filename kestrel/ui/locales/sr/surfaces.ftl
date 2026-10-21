## Start

start-search-placeholder = Претражите апликације, датотеке и друго
start-search-cut = Исеци
start-search-copy = Копирај
start-search-paste = Налепи
start-search-select-all = Изабери све
start-power = Напајање и сесија
start-power-close = Затвори опције напајања
start-account-settings = Подешавања налога
start-apps = Апликације
start-folder-default-name = Фасцикла
start-folder-open = Отвори фасциклу
start-folder-rename = Преименуј
start-folder-ungroup = Разгрупиши апликације
start-open = Отвори
start-move-to-apps = Премести у Апликације

## Start search results

start-search-best-match = Најбоље подударање
start-search-group-apps = Апликације
start-search-group-commands = Радње апликација
start-search-group-windows = Отворени прозори
start-search-group-actions = Радње
start-search-group-settings = Подешавања
start-search-group-clipboard = Остава
start-search-group-emoji = Емоџи
start-search-group-files = Датотеке
start-search-group-contents = У датотекама
start-search-group-web = Веб
start-search-web = Претражи „{ $query }“ на вебу
start-search-clipboard-text = Из историје оставе
start-search-clipboard-keywords = остава, копирано, историја оставе, налепи, клипборд, clipboard
start-search-emoji-insert = Уметни
start-search-settings-page = Подешавања
start-search-settings-section = Подешавања: { $page }
start-search-file-reveal = Прикажи у апликацији { $fileManager }
start-search-file-copy-path = Копирај путању
start-search-conversion = { $amount } { $from } у { $to }
start-search-calculation = { $expression }, притисните Enter да бисте копирали

## Answers in Start's search to questions about dates and times.
## The answer itself, such as "157 days" or "17:00", is formatted for the language; these describe it.

start-search-answer-until = До { $date }
start-search-answer-since = Од { $date }
start-search-answer-between = Од { $from } до { $to }
start-search-answer-time-ahead = { $place }, { $hours ->
    [one] { $hours } сат
    [few] { $hours } сата
   *[other] { $hours } сати
} испред
start-search-answer-time-behind = { $place }, { $hours ->
    [one] { $hours } сат
    [few] { $hours } сата
   *[other] { $hours } сати
} иза
start-search-answer-time-same = { $place }, исто време као овде
start-search-answer-converted = { $place }, кад је { $time } у граду { $from }
start-search-answer-converted-here = Овде, кад је { $time } у граду { $from }
start-search-answer-converted-from-here = { $place }, кад је овде { $time }

## Start search actions
## The keyword messages are comma-separated words people might type to find the action.
## They aren't shown. Keep common English terms in the translation when people would type them too.

start-search-dark-style-on = Пређи на тамни режим
start-search-dark-style-off = Пређи на светли режим
start-search-dark-style-keywords = тамни режим, тамна тема, тамно, светли режим, светла тема, светло, dark mode, light mode
start-search-night-light-on = Укључи ноћно светло
start-search-night-light-off = Искључи ноћно светло
start-search-night-light-keywords = ноћно светло, ноћни режим, плаво светло, топле боје, night light
start-search-do-not-disturb-on = Укључи Не узнемиравај
start-search-do-not-disturb-off = Искључи Не узнемиравај
start-search-do-not-disturb-keywords = не узнемиравај, фокус, тишина, утишај обавештења, искључи обавештења, dnd, do not disturb
start-search-wifi-on = Укључи Wi-Fi
start-search-wifi-off = Искључи Wi-Fi
start-search-wifi-keywords = wifi, wi-fi, бежична мрежа, бежично, wlan
start-search-bluetooth-on = Укључи Bluetooth
start-search-bluetooth-off = Искључи Bluetooth
start-search-bluetooth-keywords = bluetooth, блутут
start-search-airplane-mode-on = Укључи режим рада у авиону
start-search-airplane-mode-off = Искључи режим рада у авиону
start-search-airplane-mode-keywords = режим рада у авиону, авион, режим лета, радио, airplane mode
start-search-keep-awake-on = Држи будним
start-search-keep-awake-off = Не држи будним
start-search-keep-awake-keywords = држи будним, остани будан, без спавања, спречи спавање, кофеин, caffeine
start-search-lock-keywords = закључај екран, закључавање, закључај рачунар
start-search-suspend-keywords = спавање, стање спавања, приправност, sleep
start-search-log-out-keywords = одјава, одјави се, заврши сесију, log out
start-search-restart-keywords = поново покрени, рестарт, поново покрени рачунар, reboot
start-search-power-off-keywords = искључи, угаси, гашење, искључи рачунар, shutdown

## Quick settings

quick-settings-lock = Закључај
quick-settings-suspend = Спавање
quick-settings-log-out = Одјава
quick-settings-restart = Поново покрени
quick-settings-power-off = Искључи
quick-settings-screenshot = Снимак екрана
quick-settings-settings = Подешавања
quick-settings-battery = Батерија
quick-settings-battery-level = { $percent }
quick-settings-battery-charging = Пуни се
quick-settings-battery-until-full = { $duration } до краја пуњења
quick-settings-battery-left = Преостало { $duration }
quick-settings-battery-discharging = На батерији
quick-settings-battery-full = Потпуно напуњена
quick-settings-battery-plugged-in = Прикључена на напајање
quick-settings-on = Укључено
quick-settings-off = Искључено
quick-settings-show-options = Прикажи опције
quick-settings-slider-value = { $percent }
quick-settings-tile-settings = Подешавања
quick-settings-tile-remove = Уклони
quick-settings-add = Додај
quick-settings-reset = Врати на почетно

## Notifications

notifications-title = Обавештења
notifications-clear-all = Обриши све
notifications-clear-everything = Обриши сва обавештења
notifications-lock-screen-content = Прикажи садржај порука на закључаном екрану
notifications-settings = Подешавања обавештења
notifications-clear-app = Обриши обавештења апликације { $app }
notifications-more = { $count ->
    [one] Још { $count }
    [few] Још { $count }
   *[other] Још { $count }
}
notifications-show-less = Прикажи мање
notifications-dismiss-notification = Одбаци обавештење
notifications-open = Отвори
notifications-dismiss = Одбаци
notifications-send-reply = Пошаљи одговор
notifications-media-previous = Претходна нумера
notifications-media-next = Следећа нумера
notifications-media-play = Пусти
notifications-media-pause = Паузирај

## Calendar

calendar-previous-month = Претходни месец
calendar-next-month = Следећи месец
calendar-month-week = { $month }, { $week }. недеља

## Clipboard history

clipboard-clear-all = Обриши све
clipboard-image = Слика, { $width } × { $height }
clipboard-paste = Налепи
clipboard-copy = Копирај
clipboard-remove = Уклони

## Emoji picker

emoji-search = Претрага
emoji-no-results = Нема резултата
emoji-recently-used = Недавно коришћено
emoji-smileys = Смајлији и емоције
emoji-people = Људи и тело
emoji-nature = Животиње и природа
emoji-food = Храна и пиће
emoji-activities = Активности
emoji-travel = Путовања и места
emoji-objects = Предмети
emoji-symbols = Симболи
emoji-flags = Заставе
emoji-kaomoji = Каомоџи
emoji-skin-tone = Боја коже
emoji-skin-tone-default = Подразумевана боја коже
emoji-skin-tone-light = Светла боја коже
emoji-skin-tone-medium-light = Средње светла боја коже
emoji-skin-tone-medium = Средња боја коже
emoji-skin-tone-medium-dark = Средње тамна боја коже
emoji-skin-tone-dark = Тамна боја коже
