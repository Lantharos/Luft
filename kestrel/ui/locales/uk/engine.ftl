## Quick settings tiles

auto-rotate-title = Автоповорот
dark-style-title = Темний стиль
do-not-disturb-title = Не турбувати
night-light-title = Нічне світло
airplane-mode-title = Режим польоту

## Power mode

power-profile-title = Режим живлення
power-profile-header = Режим живлення
power-profile-open-menu = Відкрити меню режимів живлення
power-profile-settings = Параметри живлення
power-profile-performance = Продуктивність
power-profile-balanced = Збалансований
power-profile-power-saver = Енергозбереження
power-profile-custom = Користувацький

## Keep awake

caffeine-title = Не засинати
caffeine-open-menu = Відкрити меню «Не засинати»
caffeine-until = До { $time }
caffeine-until-turned-off = До вимкнення
caffeine-30-minutes = 30 хвилин
caffeine-1-hour = 1 година
caffeine-2-hours = 2 години
caffeine-inhibit-reason = Увімкнено «Не засинати» у швидких параметрах

## Brightness

brightness-title = Яскравість
brightness-open-menu = Відкрити меню яскравості

## Keyboard backlight

backlight-title = Підсвічування клавіатури
backlight-open-menu = Відкрити меню яскравості клавіатури
backlight-slider = Яскравість клавіатури
backlight-off = Вимкнено
backlight-low = Низьке
backlight-high = Високе

## Sound

volume-sound-settings = Параметри звуку
volume-mute = Вимкнути звук
volume-unmute = Увімкнути звук
volume-output-slider = Гучність
volume-output-title = Виведення звуку
volume-output-open-menu = Відкрити меню виведення звуку
volume-input-slider = Мікрофон
volume-input-title = Введення звуку
volume-input-open-menu = Відкрити меню введення звуку

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Відкрити меню Bluetooth
bluetooth-settings = Параметри Bluetooth
bluetooth-connect = Під’єднати
bluetooth-disconnect = Від’єднати
bluetooth-connect-device = Під’єднати { $deviceName }
bluetooth-disconnect-device = Від’єднати { $deviceName }
bluetooth-no-devices = Немає доступних або під’єднаних пристроїв
bluetooth-turn-on-hint = Увімкніть Bluetooth, щоб під’єднувати пристрої
bluetooth-connected-count = { $count ->
    [one] Під’єднано { $count }
    [few] Під’єднано { $count }
    [many] Під’єднано { $count }
   *[other] Під’єднано { $count }
}

## Network menus in quick settings

network-menu-unknown-network = <невідома>
network-menu-connect = Під’єднатися
network-menu-disconnect = Від’єднатися
network-menu-connect-to = Під’єднатися до { $name }
network-menu-disconnect-from = Від’єднатися від { $name }
network-menu-turn-off = Вимкнути
network-menu-wifi-network = { $secure ->
    [yes] { $name }, захищена, рівень сигналу { $strength }%
   *[no] { $name }, незахищена, рівень сигналу { $strength }%
}
network-menu-hotspot = Точка доступу { $name }
network-menu-connected-count = { $count ->
    [one] Під’єднано { $count }
    [few] Під’єднано { $count }
    [many] Під’єднано { $count }
   *[other] Під’єднано { $count }
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Відкрити меню VPN
network-menu-vpn-settings = Параметри VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Відкрити меню Wi-Fi
network-menu-wifi-settings = Усі мережі
network-menu-wired = Дротові з’єднання
network-menu-wired-open-menu = Відкрити меню дротових з’єднань
network-menu-wired-settings = Параметри дротової мережі
network-menu-tethers = Модеми Bluetooth
network-menu-tethers-open-menu = Відкрити меню модемів Bluetooth
network-menu-tether = Модем
network-menu-tether-settings = Параметри Bluetooth
network-menu-mobile-connections = Мобільні з’єднання
network-menu-mobile-open-menu = Відкрити меню мобільних з’єднань
network-menu-mobile-settings = Параметри мобільного інтернету
network-menu-mobile = Мобільний
network-device-wired = Дротова мережа
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Вхід у мережу
network-menu-failed-title = Не вдалося під’єднатися
network-menu-failed-body = Не вдалося активувати мережеве з’єднання

## Location access dialog

location-dialog-title = Дозволити доступ до розташування
location-dialog-description = Програма { $appName } хоче отримати доступ до вашого розташування
location-dialog-info = Доступ до розташування можна будь-коли змінити в параметрах конфіденційності
location-dialog-deny = Заборонити
location-dialog-grant = Дозволити

## Thunderbolt notifications

thunderbolt-unknown-title = Невідомий пристрій Thunderbolt
thunderbolt-unknown-body = Поки вас не було, під’єднано новий пристрій. Від’єднайте його й під’єднайте знову, щоб почати ним користуватися.
thunderbolt-unauthorized-title = Неавторизований пристрій Thunderbolt
thunderbolt-unauthorized-body = Під’єднано новий пристрій, для якого потрібен дозвіл адміністратора
thunderbolt-error-title = Помилка авторизації Thunderbolt
thunderbolt-error-body = Не вдалося авторизувати пристрій Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Заборонити
access-dialog-allow = Дозволити

## Display change confirmation

display-change-title = Зберегти ці параметри дисплея?
display-change-countdown = { $seconds ->
    [one] Зміни буде скасовано через { $seconds } секунду
    [few] Зміни буде скасовано через { $seconds } секунди
    [many] Зміни буде скасовано через { $seconds } секунд
   *[other] Зміни буде скасовано через { $seconds } секунди
}
display-change-revert = Повернути
display-change-keep = Зберегти зміни

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = Програма «{ $appName }» не відповідає
close-dialog-description = Можна трохи зачекати, поки вона продовжить роботу, або примусово закрити програму
close-dialog-force-quit = Закрити примусово
close-dialog-wait = Зачекати

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Дублювати
switch-monitor-join = Розширити
switch-monitor-external-only = Лише зовнішній
switch-monitor-built-in-only = Лише вбудований

## Sign-in prompt

auth-prompt-password = Пароль
auth-prompt-username = Ім’я користувача
auth-prompt-back = Назад
auth-prompt-submit = Надіслати
auth-prompt-wrong-password = Неправильний пароль
auth-prompt-failed = Не вдалося. Спробуйте ще раз.
fingerprint-not-recognized = Відбиток пальця не розпізнано

## Drive connected notification

autorun-connected = Під’єднано «{ $driveName }»
autorun-ready = Диском уже можна користуватися
autorun-open-with = Відкрити в { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Повільні клавіші ввімкнено
kbd-a11y-slow-keys-off = Повільні клавіші вимкнено
kbd-a11y-slow-keys-description = Ви утримували клавішу Shift 8 секунд. Це сполучення вмикає повільні клавіші, які змінюють роботу клавіатури.
kbd-a11y-sticky-keys-on = Залипання клавіш увімкнено
kbd-a11y-sticky-keys-off = Залипання клавіш вимкнено
kbd-a11y-sticky-keys-on-description = Ви натиснули клавішу Shift 5 разів поспіль. Це сполучення вмикає залипання клавіш, яке змінює роботу клавіатури.
kbd-a11y-sticky-keys-off-description = Ви натиснули дві клавіші одночасно або натиснули Shift 5 разів поспіль. Це вимикає залипання клавіш, яке змінює роботу клавіатури.
kbd-a11y-leave-on = Залишити ввімкненим
kbd-a11y-turn-on = Увімкнути
kbd-a11y-turn-off = Вимкнути
kbd-a11y-leave-off = Залишити вимкненим

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Виберіть аудіопристрій
audio-device-cancel = Скасувати
audio-device-sound-settings = Параметри звуку
audio-device-headphones = Навушники
audio-device-headset = Гарнітура
audio-device-microphone = Мікрофон

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Дозволити перехоплення сполучень клавіш
inhibit-shortcuts-app = Програма { $appName } хоче перехоплювати системні сполучення клавіш
inhibit-shortcuts-unknown-app = Програма хоче перехоплювати системні сполучення клавіш
inhibit-shortcuts-restore = Щоб повернути сполучення клавіш, натисніть { $shortcut }
inhibit-shortcuts-deny = Заборонити
inhibit-shortcuts-allow = Дозволити

## Administrator authentication

polkit-title = Потрібна автентифікація
polkit-administrator = Адміністратор
polkit-password = Пароль
polkit-cancel = Скасувати
polkit-authenticate = Підтвердити
polkit-failed = Не вдалося. Спробуйте ще раз.

## Unlocking encrypted drives

mount-hidden-volume = Прихований том
mount-windows-system-volume = Системний том Windows
mount-uses-keyfiles = Використовує ключові файли
mount-keyfiles-use-app = Щоб розблокувати том із ключовими файлами, скористайтеся програмою <i>{ $appName }</i>
mount-keyfiles-need-app = Щоб розблокувати том із ключовими файлами, потрібна окрема програма, як-от <i>Диски</i>
mount-pim-number = Число PIM
mount-pim-invalid = PIM має бути числом або залишатися порожнім
mount-password = Пароль
mount-remember-password = Запам’ятати пароль
mount-cancel = Скасувати
mount-unlock = Розблокувати
mount-open-app = Відкрити { $appName }
mount-wrong-password = Не вдалося. Спробуйте ще раз.
mount-unlock-failed = Не вдалося розблокувати том
mount-pim-unsupported = Встановлена версія udisks не підтримує параметр PIM

## Log out, power off and restart dialog

end-session-log-out-user = Вихід: { $userName }
end-session-log-out-title = Вийти
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName }: автоматичний вихід через { $seconds } секунду
    [few] { $userName }: автоматичний вихід через { $seconds } секунди
    [many] { $userName }: автоматичний вихід через { $seconds } секунд
   *[other] { $userName }: автоматичний вихід через { $seconds } секунди
}
end-session-log-out-countdown = { $seconds ->
    [one] Автоматичний вихід через { $seconds } секунду
    [few] Автоматичний вихід через { $seconds } секунди
    [many] Автоматичний вихід через { $seconds } секунд
   *[other] Автоматичний вихід через { $seconds } секунди
}
end-session-log-out-button = Вийти
end-session-power-off-title = Вимкнути
end-session-power-off-updates-title = Встановити оновлення й вимкнути
end-session-power-off-countdown = { $seconds ->
    [one] Комп’ютер автоматично вимкнеться через { $seconds } секунду
    [few] Комп’ютер автоматично вимкнеться через { $seconds } секунди
    [many] Комп’ютер автоматично вимкнеться через { $seconds } секунд
   *[other] Комп’ютер автоматично вимкнеться через { $seconds } секунди
}
end-session-power-off-button = Вимкнути
end-session-restart-title = Перезавантажити
end-session-restart-updates-title = Встановити оновлення й перезавантажити
end-session-restart-countdown = { $seconds ->
    [one] Комп’ютер автоматично перезавантажиться через { $seconds } секунду
    [few] Комп’ютер автоматично перезавантажиться через { $seconds } секунди
    [many] Комп’ютер автоматично перезавантажиться через { $seconds } секунд
   *[other] Комп’ютер автоматично перезавантажиться через { $seconds } секунди
}
end-session-restart-button = Перезавантажити
end-session-update-restart-title = Перезавантажити і встановити оновлення
end-session-update-restart-countdown = { $seconds ->
    [one] Комп’ютер автоматично перезавантажиться і встановить оновлення через { $seconds } секунду
    [few] Комп’ютер автоматично перезавантажиться і встановить оновлення через { $seconds } секунди
    [many] Комп’ютер автоматично перезавантажиться і встановить оновлення через { $seconds } секунд
   *[other] Комп’ютер автоматично перезавантажиться і встановить оновлення через { $seconds } секунди
}
end-session-update-restart-button = Перезавантажити і встановити
end-session-install-updates = Встановити наявні оновлення
end-session-install-version = Встановити версію { $version }
end-session-low-battery = Низький заряд акумулятора: перед встановленням оновлень під’єднайте живлення
end-session-busy-apps = Деякі програми зайняті або мають незбережені зміни
end-session-other-users = У системі є інші користувачі
end-session-cancel = Скасувати
end-session-boot-options = Параметри завантаження
end-session-remote-user = { $userName } (віддалено)
end-session-console-user = { $userName } (консоль)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Потрібна автентифікація
network-agent-wifi-rejected = Збережений пароль для мережі «{ $networkName }» не підійшов. Введіть його ще раз.
network-agent-wifi-secrets = Щоб отримати доступ до бездротової мережі «{ $networkName }», потрібен пароль або ключ шифрування
network-agent-wps-hint = Також можна під’єднатися, натиснувши кнопку «WPS» на маршрутизаторі
network-agent-wired-title = Автентифікація 802.1X для дротової мережі
network-agent-dsl-title = Автентифікація DSL
network-agent-pin-title = Потрібен PIN-код
network-agent-pin-body = Для пристрою мобільного інтернету потрібен PIN-код
network-agent-vpn-title = Пароль VPN
network-agent-password-required = Щоб під’єднатися до «{ $networkName }», потрібен пароль
network-agent-connect = Під’єднатися
network-agent-cancel = Скасувати
network-agent-password = Пароль
network-agent-username = Ім’я користувача
network-agent-key = Ключ
network-agent-private-key-password = Пароль приватного ключа
network-agent-identity = Ідентифікатор
network-agent-service = Служба
network-agent-network-name = Назва мережі
network-agent-pin = PIN-код

## Lock screen clock

lock-clock-swipe-up = Проведіть угору
lock-clock-click-or-press = Клацніть або натисніть будь-яку клавішу

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Вікна
ctrl-alt-tab-panel = Панель завдань
ctrl-alt-tab-unlock = Вікно розблокування

## System notifications

messages-system-source = Система
unsafe-mode-title = Систему переведено в небезпечний режим
unsafe-mode-body = Тепер програми мають необмежений доступ
unsafe-mode-undo = Скасувати
privileged-user-title = Ви увійшли як привілейований користувач
privileged-user-body = З міркувань безпеки краще не працювати в сеансі привілейованого користувача. Якщо можливо, увійдіть як звичайний користувач.

## On-screen keyboard

osk-keyboard-settings = Параметри клавіатури
osk-letters-key = АБВ

## Lock screen

lock-inhibit-reason = Kestrel має заблокувати екран

## Notifications

messages-unknown-app = Невідома програма
messages-reply = Відповісти
messages-reply-placeholder = Напишіть відповідь
messages-reply-send = Надіслати

## Media player controls

mpris-unknown-artist = Невідомий виконавець
mpris-unknown-title = Невідома назва

## Starting programs

spawn-failed = Не вдалося виконати «{ $command }»:

## Text field context menu

entry-menu-copy = Копіювати
entry-menu-paste = Вставити
entry-menu-show-text = Показати текст
entry-menu-hide-text = Сховати текст
entry-caps-lock-on = Увімкнено Caps Lock

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Зробити знімок екрана
title-bar-menu-hide = Згорнути
title-bar-menu-restore = Відновити
title-bar-menu-maximize = Розгорнути
title-bar-menu-move = Перемістити
title-bar-menu-resize = Змінити розмір
title-bar-menu-always-on-top = Поверх інших вікон
title-bar-menu-always-on-visible-workspace = На всіх робочих просторах
title-bar-menu-workspace-left = Перемістити на робочий простір ліворуч
title-bar-menu-workspace-right = Перемістити на робочий простір праворуч
title-bar-menu-workspace-up = Перемістити на робочий простір вище
title-bar-menu-workspace-down = Перемістити на робочий простір нижче
title-bar-menu-monitor-up = Перемістити на монітор вище
title-bar-menu-monitor-down = Перемістити на монітор нижче
title-bar-menu-monitor-left = Перемістити на монітор ліворуч
title-bar-menu-monitor-right = Перемістити на монітор праворуч
title-bar-menu-close = Закрити

## Screenshots and screen recording

screenshot-source = Знімки й записи екрана
screenshot-area = Вибрати область
screenshot-screen = Вибрати екран
screenshot-window = Вибрати вікно
screenshot-take = Зробити знімок екрана
screenshot-record = Записати екран
screenshot-show-pointer = Показувати вказівник
screenshot-capture = Зняти
screenshot-close = Закрити
screenshot-screencasts-folder = Записи екрана
screenshot-screencast-file = Запис екрана { $date } { $time }
screenshot-screenshots-folder = Знімки екрана
screenshot-file = Знімок екрана { $timestamp }
screenshot-screencast-recorded = Запис екрана збережено
screenshot-screencast-start-failed = Не вдалося почати запис екрана
screenshot-screencast-out-of-space = Не вдалося записати екран: на диску закінчилося місце
screenshot-screencast-try-again = Не вдалося записати екран. Спробуйте ще раз
screenshot-screencast-failed = Не вдалося записати екран
screenshot-screencast-view = Клацніть, щоб переглянути відео
screenshot-show-in-rover = Показати в Rover
screenshot-captured = Знімок екрана зроблено
screenshot-captured-body = Зображення можна вставити з буфера обміну
