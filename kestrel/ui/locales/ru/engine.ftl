## Quick settings tiles

auto-rotate-title = Автоповорот
dark-style-title = Тёмный режим
do-not-disturb-title = Не беспокоить
night-light-title = Ночной свет
airplane-mode-title = Режим полёта

## Power mode

power-profile-title = Режим питания
power-profile-header = Режим питания
power-profile-open-menu = Открыть меню режимов питания
power-profile-settings = Настройки питания
power-profile-performance = Производительность
power-profile-balanced = Сбалансированный
power-profile-power-saver = Энергосбережение
power-profile-custom = Особый

## Keep awake

caffeine-title = Не засыпать
caffeine-open-menu = Открыть меню «Не засыпать»
caffeine-until = До { $time }
caffeine-until-turned-off = До отключения
caffeine-30-minutes = 30 минут
caffeine-1-hour = 1 час
caffeine-2-hours = 2 часа
caffeine-inhibit-reason = «Не засыпать» включено в быстрых настройках

## Brightness

brightness-title = Яркость
brightness-open-menu = Открыть меню яркости

## Keyboard backlight

backlight-title = Подсветка клавиатуры
backlight-open-menu = Открыть меню подсветки клавиатуры
backlight-slider = Яркость подсветки клавиатуры
backlight-off = Отключена
backlight-low = Низкая
backlight-high = Высокая

## Sound

volume-sound-settings = Настройки звука
volume-mute = Выключить звук
volume-unmute = Включить звук
volume-output-slider = Громкость
volume-output-title = Вывод звука
volume-output-open-menu = Открыть меню вывода звука
volume-input-slider = Микрофон
volume-input-title = Ввод звука
volume-input-open-menu = Открыть меню ввода звука

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Открыть меню Bluetooth
bluetooth-settings = Настройки Bluetooth
bluetooth-connect = Подключить
bluetooth-disconnect = Отключить
bluetooth-connect-device = Подключить { $deviceName }
bluetooth-disconnect-device = Отключить { $deviceName }
bluetooth-no-devices = Нет доступных или подключённых устройств
bluetooth-turn-on-hint = Включите Bluetooth, чтобы подключать устройства
bluetooth-connected-count = { $count ->
    [one] Подключено: { $count }
    [few] Подключено: { $count }
    [many] Подключено: { $count }
   *[other] Подключено: { $count }
}

## Network menus in quick settings

network-menu-unknown-network = <неизвестная сеть>
network-menu-connect = Подключиться
network-menu-disconnect = Отключиться
network-menu-connect-to = Подключиться к { $name }
network-menu-disconnect-from = Отключиться от { $name }
network-menu-turn-off = Отключить
network-menu-wifi-network = { $secure ->
    [yes] { $name }, защищённая, уровень сигнала { $strength } %
   *[no] { $name }, незащищённая, уровень сигнала { $strength } %
}
network-menu-hotspot = Точка доступа { $name }
network-menu-connected-count = { $count ->
    [one] Подключено: { $count }
    [few] Подключено: { $count }
    [many] Подключено: { $count }
   *[other] Подключено: { $count }
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Открыть меню VPN
network-menu-vpn-settings = Настройки VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Открыть меню Wi-Fi
network-menu-wifi-settings = Все сети
network-menu-wired = Проводные подключения
network-menu-wired-open-menu = Открыть меню проводных подключений
network-menu-wired-settings = Настройки проводной сети
network-menu-tethers = Модем через Bluetooth
network-menu-tethers-open-menu = Открыть меню модема через Bluetooth
network-menu-tether = Модем
network-menu-tether-settings = Настройки Bluetooth
network-menu-mobile-connections = Мобильные подключения
network-menu-mobile-open-menu = Открыть меню мобильных подключений
network-menu-mobile-settings = Настройки мобильной сети
network-menu-mobile = Мобильная сеть
network-device-wired = Проводная сеть
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Вход в сеть
network-menu-failed-title = Не удалось подключиться
network-menu-failed-body = Не удалось активировать сетевое подключение

## Location access dialog

location-dialog-title = Разрешить доступ к местоположению
location-dialog-description = Приложение { $appName } запрашивает доступ к вашему местоположению
location-dialog-info = Доступ к местоположению можно изменить в любое время в настройках конфиденциальности
location-dialog-deny = Запретить
location-dialog-grant = Разрешить

## Thunderbolt notifications

thunderbolt-unknown-title = Неизвестное устройство Thunderbolt
thunderbolt-unknown-body = Пока вас не было, подключили новое устройство. Отключите его и подключите снова, чтобы начать им пользоваться.
thunderbolt-unauthorized-title = Неразрешённое устройство Thunderbolt
thunderbolt-unauthorized-body = Подключено новое устройство, которое должен разрешить администратор
thunderbolt-error-title = Ошибка авторизации Thunderbolt
thunderbolt-error-body = Не удалось разрешить устройство Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Запретить
access-dialog-allow = Разрешить

## Display change confirmation

display-change-title = Сохранить эти настройки экрана?
display-change-countdown = { $seconds ->
    [one] Изменения будут отменены через { $seconds } секунду
    [few] Изменения будут отменены через { $seconds } секунды
    [many] Изменения будут отменены через { $seconds } секунд
   *[other] Изменения будут отменены через { $seconds } секунды
}
display-change-revert = Отменить
display-change-keep = Сохранить

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = Приложение «{ $appName }» не отвечает
close-dialog-description = Можно немного подождать, пока оно продолжит работу, или принудительно закрыть приложение
close-dialog-force-quit = Закрыть принудительно
close-dialog-wait = Подождать

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Дублировать
switch-monitor-join = Расширить
switch-monitor-external-only = Только внешний
switch-monitor-built-in-only = Только встроенный

## Sign-in prompt

auth-prompt-password = Пароль
auth-prompt-username = Имя пользователя
auth-prompt-back = Назад
auth-prompt-submit = Подтвердить
auth-prompt-wrong-password = Неверный пароль
auth-prompt-failed = Не получилось. Попробуйте ещё раз.
fingerprint-not-recognized = Отпечаток не распознан

## Drive connected notification

autorun-connected = Подключён диск «{ $driveName }»
autorun-ready = Диск готов к использованию
autorun-open-with = Открыть в приложении { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Медленные клавиши включены
kbd-a11y-slow-keys-off = Медленные клавиши отключены
kbd-a11y-slow-keys-description = Вы удерживали клавишу Shift 8 секунд. Это сочетание включает медленные клавиши, которые меняют работу клавиатуры.
kbd-a11y-sticky-keys-on = Залипание клавиш включено
kbd-a11y-sticky-keys-off = Залипание клавиш отключено
kbd-a11y-sticky-keys-on-description = Вы нажали клавишу Shift 5 раз подряд. Это сочетание включает залипание клавиш, которое меняет работу клавиатуры.
kbd-a11y-sticky-keys-off-description = Вы нажали две клавиши одновременно или нажали Shift 5 раз подряд. Это отключает залипание клавиш, которое меняет работу клавиатуры.
kbd-a11y-leave-on = Не отключать
kbd-a11y-turn-on = Включить
kbd-a11y-turn-off = Отключить
kbd-a11y-leave-off = Не включать

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Выбор аудиоустройства
audio-device-cancel = Отмена
audio-device-sound-settings = Настройки звука
audio-device-headphones = Наушники
audio-device-headset = Гарнитура
audio-device-microphone = Микрофон

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Разрешить перехват сочетаний клавиш
inhibit-shortcuts-app = Приложение { $appName } хочет перехватывать сочетания клавиш
inhibit-shortcuts-unknown-app = Приложение хочет перехватывать сочетания клавиш
inhibit-shortcuts-restore = Чтобы вернуть сочетания клавиш, нажмите { $shortcut }
inhibit-shortcuts-deny = Запретить
inhibit-shortcuts-allow = Разрешить

## Administrator authentication

polkit-title = Требуется подтверждение
polkit-administrator = Администратор
polkit-password = Пароль
polkit-cancel = Отмена
polkit-authenticate = Подтвердить
polkit-failed = Не получилось. Попробуйте ещё раз.

## Unlocking encrypted drives

mount-hidden-volume = Скрытый том
mount-windows-system-volume = Системный том Windows
mount-uses-keyfiles = Использует ключевые файлы
mount-keyfiles-use-app = Чтобы разблокировать том с ключевыми файлами, используйте приложение <i>{ $appName }</i>
mount-keyfiles-need-app = Чтобы разблокировать том с ключевыми файлами, нужна внешняя программа, например <i>Диски</i>
mount-pim-number = Число PIM
mount-pim-invalid = PIM должен быть числом или пустым
mount-password = Пароль
mount-remember-password = Запомнить пароль
mount-cancel = Отмена
mount-unlock = Разблокировать
mount-open-app = Открыть { $appName }
mount-wrong-password = Не получилось. Попробуйте ещё раз.
mount-unlock-failed = Не удалось разблокировать том
mount-pim-unsupported = Установленная версия udisks не поддерживает параметр PIM

## Log out, power off and restart dialog

end-session-log-out-user = Выход: { $userName }
end-session-log-out-title = Выход
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName }: автоматический выход через { $seconds } секунду
    [few] { $userName }: автоматический выход через { $seconds } секунды
    [many] { $userName }: автоматический выход через { $seconds } секунд
   *[other] { $userName }: автоматический выход через { $seconds } секунды
}
end-session-log-out-countdown = { $seconds ->
    [one] Автоматический выход через { $seconds } секунду
    [few] Автоматический выход через { $seconds } секунды
    [many] Автоматический выход через { $seconds } секунд
   *[other] Автоматический выход через { $seconds } секунды
}
end-session-log-out-button = Выйти
end-session-power-off-title = Выключение
end-session-power-off-updates-title = Установить обновления и выключить
end-session-power-off-countdown = { $seconds ->
    [one] Компьютер автоматически выключится через { $seconds } секунду
    [few] Компьютер автоматически выключится через { $seconds } секунды
    [many] Компьютер автоматически выключится через { $seconds } секунд
   *[other] Компьютер автоматически выключится через { $seconds } секунды
}
end-session-power-off-button = Выключить
end-session-restart-title = Перезагрузка
end-session-restart-updates-title = Установить обновления и перезагрузить
end-session-restart-countdown = { $seconds ->
    [one] Компьютер автоматически перезагрузится через { $seconds } секунду
    [few] Компьютер автоматически перезагрузится через { $seconds } секунды
    [many] Компьютер автоматически перезагрузится через { $seconds } секунд
   *[other] Компьютер автоматически перезагрузится через { $seconds } секунды
}
end-session-restart-button = Перезагрузить
end-session-update-restart-title = Перезагрузить и установить обновления
end-session-update-restart-countdown = { $seconds ->
    [one] Через { $seconds } секунду компьютер автоматически перезагрузится и установит обновления
    [few] Через { $seconds } секунды компьютер автоматически перезагрузится и установит обновления
    [many] Через { $seconds } секунд компьютер автоматически перезагрузится и установит обновления
   *[other] Через { $seconds } секунды компьютер автоматически перезагрузится и установит обновления
}
end-session-update-restart-button = Перезагрузить и установить
end-session-install-updates = Установить ожидающие обновления
end-session-install-version = Установить версию { $version }
end-session-low-battery = Низкий заряд батареи. Подключите питание перед установкой обновлений
end-session-busy-apps = Некоторые приложения заняты или содержат несохранённые данные
end-session-other-users = В системе работают другие пользователи
end-session-cancel = Отмена
end-session-boot-options = Параметры загрузки
end-session-remote-user = { $userName } (удалённо)
end-session-console-user = { $userName } (консоль)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Требуется аутентификация
network-agent-wifi-rejected = Сохранённый пароль для сети «{ $networkName }» не подошёл. Введите его ещё раз.
network-agent-wifi-secrets = Для доступа к беспроводной сети «{ $networkName }» нужен пароль или ключ шифрования
network-agent-wps-hint = Также можно подключиться, нажав кнопку WPS на роутере
network-agent-wired-title = Аутентификация 802.1X в проводной сети
network-agent-dsl-title = Аутентификация DSL
network-agent-pin-title = Требуется PIN-код
network-agent-pin-body = Для модема мобильной сети нужен PIN-код
network-agent-vpn-title = Пароль VPN
network-agent-password-required = Для подключения к «{ $networkName }» нужен пароль
network-agent-connect = Подключиться
network-agent-cancel = Отмена
network-agent-password = Пароль
network-agent-username = Имя пользователя
network-agent-key = Ключ
network-agent-private-key-password = Пароль закрытого ключа
network-agent-identity = Идентификатор
network-agent-service = Служба
network-agent-network-name = Имя сети
network-agent-pin = PIN-код

## Lock screen clock

lock-clock-swipe-up = Проведите вверх
lock-clock-click-or-press = Щёлкните или нажмите любую клавишу

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Окна
ctrl-alt-tab-panel = Панель
ctrl-alt-tab-unlock = Окно разблокировки

## System notifications

messages-system-source = Система
unsafe-mode-title = Система переведена в небезопасный режим
unsafe-mode-body = Теперь у приложений неограниченный доступ
unsafe-mode-undo = Отменить
privileged-user-title = Выполнен вход от имени привилегированного пользователя
privileged-user-body = Из соображений безопасности не рекомендуется работать от имени привилегированного пользователя. По возможности войдите как обычный пользователь.

## On-screen keyboard

osk-keyboard-settings = Настройки клавиатуры
osk-letters-key = АБВ

## Lock screen

lock-inhibit-reason = Kestrel нужно заблокировать экран

## Notifications

messages-unknown-app = Неизвестное приложение
messages-reply = Ответить
messages-reply-placeholder = Напишите ответ
messages-reply-send = Отправить

## Media player controls

mpris-unknown-artist = Неизвестный исполнитель
mpris-unknown-title = Без названия

## Starting programs

spawn-failed = Не удалось выполнить «{ $command }»:

## Text field context menu

entry-menu-copy = Копировать
entry-menu-paste = Вставить
entry-menu-show-text = Показать текст
entry-menu-hide-text = Скрыть текст
entry-caps-lock-on = Включён Caps Lock

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Сделать снимок экрана
title-bar-menu-hide = Свернуть
title-bar-menu-restore = Восстановить
title-bar-menu-maximize = Развернуть
title-bar-menu-move = Переместить
title-bar-menu-resize = Изменить размер
title-bar-menu-always-on-top = Поверх других окон
title-bar-menu-always-on-visible-workspace = На всех рабочих областях
title-bar-menu-workspace-left = Переместить на рабочую область слева
title-bar-menu-workspace-right = Переместить на рабочую область справа
title-bar-menu-workspace-up = Переместить на рабочую область сверху
title-bar-menu-workspace-down = Переместить на рабочую область снизу
title-bar-menu-monitor-up = Переместить на экран сверху
title-bar-menu-monitor-down = Переместить на экран снизу
title-bar-menu-monitor-left = Переместить на экран слева
title-bar-menu-monitor-right = Переместить на экран справа
title-bar-menu-close = Закрыть

## Screenshots and screen recording

screenshot-source = Захват экрана
screenshot-area = Выбор области
screenshot-screen = Выбор экрана
screenshot-window = Выбор окна
screenshot-take = Сделать снимок экрана
screenshot-record = Записать экран
screenshot-show-pointer = Показывать указатель
screenshot-capture = Захватить
screenshot-close = Закрыть
screenshot-screencasts-folder = Записи экрана
screenshot-screencast-file = Запись экрана от { $date } { $time }
screenshot-screenshots-folder = Снимки экрана
screenshot-file = Снимок экрана от { $timestamp }
screenshot-screencast-recorded = Запись экрана сохранена
screenshot-screencast-start-failed = Не удалось начать запись экрана
screenshot-screencast-out-of-space = Запись экрана прервана: на диске нет места
screenshot-screencast-try-again = Не удалось записать экран. Попробуйте ещё раз
screenshot-screencast-failed = Не удалось записать экран
screenshot-screencast-view = Нажмите, чтобы посмотреть видео
screenshot-show-in-rover = Показать в приложении Rover
screenshot-captured = Снимок экрана сделан
screenshot-captured-body = Изображение можно вставить из буфера обмена
