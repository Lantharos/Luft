## Shared by the dialogs apps open through the desktop portal

portal-cancel = Отказ
portal-allow = Разреши
portal-share = Сподели

portal-unknown-app-subject = Приложението
portal-unknown-app-object = приложението

## Choosing an app to open a file or link

portal-app-chooser-open-title = Отваряне на „{ $name }“
portal-app-chooser-open-description = Изберете приложение, с което да го отворите.
portal-app-chooser-open-kind = Изберете приложение, с което да го отворите ({ $kind }).
portal-app-chooser-title = Избор на приложение
portal-app-chooser-description = Изберете приложение, за да продължите.
portal-app-chooser-kind = Изберете приложение за този вид файл ({ $kind }).
portal-app-chooser-nothing-installed = Няма инсталирано приложение, което да отваря това
portal-app-chooser-find = Намери приложение
portal-app-chooser-open = Отвори

## Adding a website or app to Start

portal-launcher-website-title = Да се добави ли този уебсайт към приложенията ви?
portal-launcher-website-description = { $site } ще се отваря в собствен прозорец от менюто Старт.
portal-launcher-title = Да се добави ли това към приложенията ви?
portal-launcher-description = { $appName } иска да добави приложение в менюто Старт.
portal-launcher-name = Име
portal-launcher-add = Добави

## Screenshots taken for apps

portal-screenshot-file-name = Екранна снимка { $date }

## Account details

portal-account-title = Да се споделят ли името и снимката ви с { $appName }?
portal-account-description = { $appName } ще вижда името и снимката на акаунта ви.

## Wallpaper

portal-wallpaper-title = Да се зададе ли като тапет?
portal-wallpaper-description = { $appName } иска да смени тапета ви. Той се използва в светлия и тъмния режим и на заключения екран.
portal-wallpaper-set = Задай тапет

## USB devices

usb-title = { $count ->
    [one] Да се разреши ли на { $appName } да използва това устройство?
   *[other] Да се разреши ли на { $appName } да използва тези устройства?
}
usb-description = { $count ->
    [one] { $appName } ще може да комуникира пряко с устройството, докато е включено.
   *[other] { $appName } ще може да комуникира пряко с устройствата, докато са включени.
}
usb-unknown-maker = Неизвестен производител
usb-unknown-device = Неизвестно устройство

## Screen sharing, remote control and input capture

screen-share-title = Да се сподели ли екранът ви с { $appName }?
screen-share-description = { $appName } ще вижда това, което изберете.
screen-share-screens = Екрани
screen-share-windows = Прозорци
screen-share-main-screen = Основен екран
screen-share-virtual-screen = Виртуален екран
screen-share-new-virtual-screen = Нов виртуален екран
screen-share-new-virtual-screen-description = Допълнителен екран само за споделяне
screen-share-nothing-to-share = Няма отворени прозорци за споделяне.
screen-share-remember = Запомняне на избора
screen-share-remember-description = { $appName } няма да пита отново
screen-share-clipboard = Споделяне на клипборда
screen-share-clipboard-description = Копиране и поставяне в двете посоки

screen-share-remote-desktop-title = Да се разреши ли на { $appName } да управлява компютъра ви?
screen-share-remote-desktop-with-screen = { $appName } ще вижда това, което изберете, и ще може да използва устройствата, които разрешите.
screen-share-remote-desktop-description = { $appName } ще може да използва устройствата, които разрешите.
screen-share-devices = Устройства
screen-share-device-keyboard = Клавиатура
screen-share-device-pointer = Мишка и тъчпад
screen-share-device-touchscreen = Сензорен екран

screen-share-input-capture-title = Да се разреши ли на { $appName } да поема клавиатурата и мишката ви?
screen-share-input-capture-description = Когато показалецът стигне ръба на екрана, { $appName } може да поеме клавиатурата и мишката ви, например за да управлява друг компютър.

## Keyboard shortcuts apps register for the whole session

shortcuts-consent-title = Да се разреши ли на { $appName } да използва клавишни комбинации?
shortcuts-consent-description = Тези комбинации достигат до { $appName }, дори докато използвате други приложения.
shortcuts-record-title = Клавишни комбинации за { $appName }
shortcuts-record-description = Изберете комбинация и натиснете желаните клавиши. Backspace я изчиства.
shortcuts-not-set = Не е зададена
shortcuts-press-keys = Натиснете клавиши
shortcuts-unusable = { $shortcut } не може да се използва
shortcuts-taken = { $shortcut } вече е заета
shortcuts-save = Запази

## Printing

print-title = Печат
print-title-from-app = Печат от { $appName }
print-accept = Отпечатай
print-no-printers = Няма настроени принтери.
print-job-name = Документ
print-job-name-from-app = Документ от { $appName }
print-failed-title = Отпечатването не успя
print-failed = { $printer } не прие документа.
print-failed-from-app = { $printer } не прие документа от { $appName }.

print-printer = Принтер
print-printer-not-accepting = В момента не приема документи
print-printer-paused = На пауза
print-back = Назад

print-copies = Копия
print-copies-fewer = По-малко копия
print-copies-more = Повече копия

print-pages = Страници
print-pages-all = Всички
print-pages-current = Текущата
print-pages-selection = Избраното
print-pages-range = Диапазон
print-pages-range-hint = Например 1-3, 5

print-paper = Хартия
print-paper-dimensions = { $width } × { $height }
print-paper-letter = Letter
print-paper-legal = Legal
print-paper-executive = Executive
print-paper-tabloid = Tabloid
print-paper-statement = Statement
print-paper-envelope = Плик { $size }

print-orientation = Ориентация
print-orientation-portrait = Портретна
print-orientation-landscape = Пейзажна

print-two-sided = Двустранен печат
print-two-sided-off = Изкл.
print-two-sided-long-edge = По дългия ръб
print-two-sided-short-edge = По късия ръб

print-color = Цвят
print-color-mode-color = Цветно
print-color-mode-monochrome = Черно-бяло
