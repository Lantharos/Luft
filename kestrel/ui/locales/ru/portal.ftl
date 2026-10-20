## Shared by the dialogs apps open through the desktop portal

portal-cancel = Отмена
portal-allow = Разрешить
portal-share = Поделиться

portal-unknown-app-subject = Приложение
portal-unknown-app-object = этому приложению

## Choosing an app to open a file or link

portal-app-chooser-open-title = Открыть «{ $name }»
portal-app-chooser-open-description = Выберите приложение, чтобы открыть файл.
portal-app-chooser-open-kind = Выберите приложение, чтобы открыть файл ({ $kind }).
portal-app-chooser-title = Выбор приложения
portal-app-chooser-description = Выберите приложение, чтобы продолжить.
portal-app-chooser-kind = Выберите приложение для файлов этого типа ({ $kind }).
portal-app-chooser-nothing-installed = Нет установленных приложений, которые могут это открыть
portal-app-chooser-find = Найти приложение
portal-app-chooser-open = Открыть

## Adding a website or app to Start

portal-launcher-website-title = Добавить этот сайт в приложения?
portal-launcher-website-description = Сайт { $site } будет открываться в отдельном окне из меню «Пуск».
portal-launcher-title = Добавить в приложения?
portal-launcher-description = { $appName } хочет добавить приложение в меню «Пуск».
portal-launcher-name = Название
portal-launcher-add = Добавить

## Screenshots taken for apps

portal-screenshot-file-name = Снимок экрана { $date }

## Account details

portal-account-title = Показать { $appName } ваше имя и фото?
portal-account-description = { $appName } увидит имя и фото вашей учётной записи.

## Wallpaper

portal-wallpaper-title = Установить как обои?
portal-wallpaper-description = { $appName } хочет сменить обои. Они используются в светлом и тёмном режимах и на экране блокировки.
portal-wallpaper-set = Установить обои

## USB devices

usb-title = { $count ->
    [1] Разрешить { $appName } использовать это устройство?
   *[other] Разрешить { $appName } использовать эти устройства?
}
usb-description = { $count ->
    [1] { $appName } сможет обращаться к устройству напрямую, пока оно подключено.
   *[other] { $appName } сможет обращаться к устройствам напрямую, пока они подключены.
}
usb-unknown-maker = Неизвестный производитель
usb-unknown-device = Неизвестное устройство

## Screen sharing, remote control and input capture

screen-share-title = Разрешить { $appName } видеть ваш экран?
screen-share-description = { $appName } увидит то, что вы выберете.
screen-share-screens = Экраны
screen-share-windows = Окна
screen-share-main-screen = Основной экран
screen-share-virtual-screen = Виртуальный экран
screen-share-new-virtual-screen = Новый виртуальный экран
screen-share-new-virtual-screen-description = Дополнительный экран только для показа
screen-share-nothing-to-share = Нет открытых окон, которые можно показать.
screen-share-remember = Запомнить выбор
screen-share-remember-description = { $appName } больше не будет спрашивать
screen-share-clipboard = Общий буфер обмена
screen-share-clipboard-description = Копирование и вставка в обе стороны

screen-share-remote-desktop-title = Разрешить { $appName } управлять компьютером?
screen-share-remote-desktop-with-screen = { $appName } увидит то, что вы выберете, и сможет использовать разрешённые устройства.
screen-share-remote-desktop-description = { $appName } сможет использовать разрешённые устройства.
screen-share-devices = Устройства
screen-share-device-keyboard = Клавиатура
screen-share-device-pointer = Мышь и сенсорная панель
screen-share-device-touchscreen = Сенсорный экран

screen-share-input-capture-title = Разрешить { $appName } перехватывать клавиатуру и мышь?
screen-share-input-capture-description = Когда указатель дойдёт до края экрана, управление клавиатурой и мышью может перейти к { $appName }, например, чтобы управлять другим компьютером.

## Keyboard shortcuts apps register for the whole session

shortcuts-consent-title = Разрешить { $appName } использовать сочетания клавиш?
shortcuts-consent-description = Эти сочетания будут передаваться { $appName }, даже когда вы работаете в других приложениях.
shortcuts-record-title = Сочетания клавиш приложения { $appName }
shortcuts-record-description = Выберите сочетание и нажмите нужные клавиши. Backspace удаляет сочетание.
shortcuts-not-set = Не задано
shortcuts-press-keys = Нажмите клавиши
shortcuts-unusable = Сочетание { $shortcut } нельзя использовать
shortcuts-taken = Сочетание { $shortcut } уже занято
shortcuts-save = Сохранить

## Printing

print-title = Печать
print-title-from-app = Печать из приложения { $appName }
print-accept = Печать
print-no-printers = Нет настроенных принтеров.
print-job-name = Документ
print-job-name-from-app = Документ из приложения { $appName }
print-failed-title = Не удалось напечатать
print-failed = Принтер { $printer } не принял документ.
print-failed-from-app = Принтер { $printer } не принял документ из приложения { $appName }.

print-printer = Принтер
print-printer-not-accepting = Сейчас не принимает документы
print-printer-paused = Приостановлен
print-back = Назад

print-copies = Копии
print-copies-fewer = Меньше копий
print-copies-more = Больше копий

print-pages = Страницы
print-pages-all = Все
print-pages-current = Текущая
print-pages-selection = Выделенные
print-pages-range = Диапазон
print-pages-range-hint = Например, 1-3, 5

print-paper = Бумага
print-paper-dimensions = { $width } × { $height }
print-paper-letter = Letter
print-paper-legal = Legal
print-paper-executive = Executive
print-paper-tabloid = Tabloid
print-paper-statement = Statement
print-paper-envelope = Конверт { $size }

print-orientation = Ориентация
print-orientation-portrait = Книжная
print-orientation-landscape = Альбомная

print-two-sided = Двусторонняя печать
print-two-sided-off = Нет
print-two-sided-long-edge = По длинному краю
print-two-sided-short-edge = По короткому краю

print-color = Цвет
print-color-mode-color = Цветная
print-color-mode-monochrome = Чёрно-белая
