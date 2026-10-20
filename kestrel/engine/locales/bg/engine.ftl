## Quick settings tiles

auto-rotate-title = Автозавъртане
dark-style-title = Тъмен режим
do-not-disturb-title = Не безпокойте
night-light-title = Нощна светлина
airplane-mode-title = Самолетен режим

## Power mode

power-profile-title = Режим на захранване
power-profile-header = Режим на захранване
power-profile-open-menu = Отвори менюто с режими на захранване
power-profile-settings = Настройки на захранването
power-profile-performance = Производителност
power-profile-balanced = Балансиран
power-profile-power-saver = Пестене на енергия
power-profile-custom = Персонализиран

## Keep awake

caffeine-title = Без заспиване
caffeine-open-menu = Отвори менюто Без заспиване
caffeine-until = До { $time }
caffeine-until-turned-off = До изключване
caffeine-30-minutes = 30 минути
caffeine-1-hour = 1 час
caffeine-2-hours = 2 часа
caffeine-inhibit-reason = Без заспиване е включено от бързите настройки

## Brightness

brightness-title = Яркост
brightness-open-menu = Отвори менюто за яркост

## Keyboard backlight

backlight-title = Подсветка на клавиатурата
backlight-open-menu = Отвори менюто за яркост на клавиатурата
backlight-slider = Яркост на клавиатурата
backlight-off = Изкл.
backlight-low = Ниска
backlight-high = Висока

## Sound

volume-sound-settings = Настройки на звука
volume-mute = Изключи звука
volume-unmute = Включи звука
volume-output-slider = Сила на звука
volume-output-title = Изход на звука
volume-output-open-menu = Отвори менюто за изход на звука
volume-input-slider = Микрофон
volume-input-title = Вход на звука
volume-input-open-menu = Отвори менюто за вход на звука

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Отвори менюто Bluetooth
bluetooth-settings = Настройки на Bluetooth
bluetooth-connect = Свържи
bluetooth-disconnect = Прекъсни
bluetooth-connect-device = Свържи с { $deviceName }
bluetooth-disconnect-device = Прекъсни връзката с { $deviceName }
bluetooth-no-devices = Няма налични или свързани устройства
bluetooth-turn-on-hint = Включете Bluetooth, за да се свържете с устройства
bluetooth-connected-count = { $count ->
    [one] { $count } свързано
   *[other] { $count } свързани
}

## Network menus in quick settings

network-menu-unknown-network = <неизвестна>
network-menu-connect = Свържи
network-menu-disconnect = Прекъсни
network-menu-connect-to = Свържи с { $name }
network-menu-disconnect-from = Прекъсни връзката с { $name }
network-menu-turn-off = Изключи
network-menu-wifi-network = { $secure ->
    [yes] { $name }, защитена, сила на сигнала { $strength } %
   *[no] { $name }, незащитена, сила на сигнала { $strength } %
}
network-menu-hotspot = Точка за достъп на { $name }
network-menu-connected-count = { $count ->
    [one] { $count } свързана
   *[other] { $count } свързани
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Отвори менюто VPN
network-menu-vpn-settings = Настройки на VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Отвори менюто Wi-Fi
network-menu-wifi-settings = Всички мрежи
network-menu-wired = Кабелни връзки
network-menu-wired-open-menu = Отвори менюто за кабелни връзки
network-menu-wired-settings = Настройки на кабелната мрежа
network-menu-tethers = Тетъринг през Bluetooth
network-menu-tethers-open-menu = Отвори менюто за тетъринг през Bluetooth
network-menu-tether = Тетъринг
network-menu-tether-settings = Настройки на Bluetooth
network-menu-mobile-connections = Мобилни връзки
network-menu-mobile-open-menu = Отвори менюто за мобилни връзки
network-menu-mobile-settings = Настройки на мобилния интернет
network-menu-mobile = Мобилни данни
network-device-wired = Кабелна връзка
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Вход в мрежата
network-menu-failed-title = Неуспешно свързване
network-menu-failed-body = Връзката с мрежата не можа да бъде активирана

## Location access dialog

location-dialog-title = Разрешаване на достъп до местоположението
location-dialog-description = Приложението { $appName } иска достъп до местоположението ви
location-dialog-info = Достъпът до местоположението може да се промени по всяко време от настройките за поверителност
location-dialog-deny = Откажи достъпа
location-dialog-grant = Разреши достъпа

## Thunderbolt notifications

thunderbolt-unknown-title = Неизвестно устройство Thunderbolt
thunderbolt-unknown-body = Докато ви нямаше, беше свързано ново устройство. Изключете го и го включете отново, за да започнете да го използвате.
thunderbolt-unauthorized-title = Неразрешено устройство Thunderbolt
thunderbolt-unauthorized-body = Свързано е ново устройство, което трябва да бъде одобрено от администратор
thunderbolt-error-title = Грешка при разрешаването на Thunderbolt
thunderbolt-error-body = Устройството Thunderbolt не можа да бъде разрешено: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Откажи
access-dialog-allow = Разреши

## Display change confirmation

display-change-title = Да се запазят ли настройките?
display-change-countdown = { $seconds ->
    [one] Промените ще бъдат отменени след { $seconds } секунда
   *[other] Промените ще бъдат отменени след { $seconds } секунди
}
display-change-revert = Върни настройките
display-change-keep = Запази промените

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ не отговаря
close-dialog-description = Можете да изчакате малко, докато продължи работа, или да затворите приложението принудително
close-dialog-force-quit = Затвори принудително
close-dialog-wait = Изчакай

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Дублиране
switch-monitor-join = Разширяване
switch-monitor-external-only = Само външни
switch-monitor-built-in-only = Само вграден

## Sign-in prompt

auth-prompt-password = Парола
auth-prompt-username = Потребителско име
auth-prompt-back = Назад
auth-prompt-submit = Изпрати
auth-prompt-wrong-password = Паролата не е вярна
auth-prompt-failed = Не се получи. Опитайте отново.
fingerprint-not-recognized = Отпечатъкът не е разпознат

## Drive connected notification

autorun-connected = Свързано: „{ $driveName }“
autorun-ready = Дискът вече може да се използва
autorun-open-with = Отвори с { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Бавните клавиши са включени
kbd-a11y-slow-keys-off = Бавните клавиши са изключени
kbd-a11y-slow-keys-description = Току-що задържахте клавиша Shift 8 секунди. Това е комбинацията за Бавни клавиши – функция, която променя начина, по който работи клавиатурата.
kbd-a11y-sticky-keys-on = Залепващите клавиши са включени
kbd-a11y-sticky-keys-off = Залепващите клавиши са изключени
kbd-a11y-sticky-keys-on-description = Току-що натиснахте клавиша Shift 5 пъти подред. Това е комбинацията за Залепващи клавиши – функция, която променя начина, по който работи клавиатурата.
kbd-a11y-sticky-keys-off-description = Току-що натиснахте два клавиша едновременно или натиснахте Shift 5 пъти подред. Това изключва Залепващи клавиши – функция, която променя начина, по който работи клавиатурата.
kbd-a11y-leave-on = Остави включено
kbd-a11y-turn-on = Включи
kbd-a11y-turn-off = Изключи
kbd-a11y-leave-off = Остави изключено

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Избор на аудиоустройство
audio-device-cancel = Отказ
audio-device-sound-settings = Настройки на звука
audio-device-headphones = Слушалки
audio-device-headset = Слушалки с микрофон
audio-device-microphone = Микрофон

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Разрешаване на блокирането на клавишни комбинации
inhibit-shortcuts-app = Приложението { $appName } иска да блокира клавишните комбинации
inhibit-shortcuts-unknown-app = Приложение иска да блокира клавишните комбинации
inhibit-shortcuts-restore = Можете да възстановите клавишните комбинации, като натиснете { $shortcut }
inhibit-shortcuts-deny = Откажи
inhibit-shortcuts-allow = Разреши

## Administrator authentication

polkit-title = Изисква се удостоверяване
polkit-administrator = Администратор
polkit-password = Парола
polkit-cancel = Отказ
polkit-authenticate = Удостовери
polkit-failed = Не се получи. Опитайте отново.

## Unlocking encrypted drives

mount-hidden-volume = Скрит том
mount-windows-system-volume = Системен том на Windows
mount-uses-keyfiles = Използва ключови файлове
mount-keyfiles-use-app = За да отключите том, който използва ключови файлове, използвайте програмата <i>{ $appName }</i>
mount-keyfiles-need-app = За да отключите том, който използва ключови файлове, ви трябва външна програма като <i>Дискове</i>
mount-pim-number = PIM номер
mount-pim-invalid = PIM трябва да е число или да остане празно
mount-password = Парола
mount-remember-password = Запомняне на паролата
mount-cancel = Отказ
mount-unlock = Отключи
mount-open-app = Отвори { $appName }
mount-wrong-password = Не се получи. Опитайте отново.
mount-unlock-failed = Томът не можа да бъде отключен
mount-pim-unsupported = Инсталираната версия на udisks не поддържа настройката PIM

## Log out, power off and restart dialog

end-session-log-out-user = Изход на { $userName }
end-session-log-out-title = Изход
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } ще излезе автоматично след { $seconds } секунда
   *[other] { $userName } ще излезе автоматично след { $seconds } секунди
}
end-session-log-out-countdown = { $seconds ->
    [one] Ще излезете автоматично след { $seconds } секунда
   *[other] Ще излезете автоматично след { $seconds } секунди
}
end-session-log-out-button = Изход
end-session-power-off-title = Изключване
end-session-power-off-updates-title = Инсталиране на актуализациите и изключване
end-session-power-off-countdown = { $seconds ->
    [one] Системата ще се изключи автоматично след { $seconds } секунда
   *[other] Системата ще се изключи автоматично след { $seconds } секунди
}
end-session-power-off-button = Изключи
end-session-restart-title = Рестартиране
end-session-restart-updates-title = Инсталиране на актуализациите и рестартиране
end-session-restart-countdown = { $seconds ->
    [one] Системата ще се рестартира автоматично след { $seconds } секунда
   *[other] Системата ще се рестартира автоматично след { $seconds } секунди
}
end-session-restart-button = Рестартирай
end-session-update-restart-title = Рестартиране и инсталиране на актуализациите
end-session-update-restart-countdown = { $seconds ->
    [one] Системата ще се рестартира автоматично и ще инсталира актуализациите след { $seconds } секунда
   *[other] Системата ще се рестартира автоматично и ще инсталира актуализациите след { $seconds } секунди
}
end-session-update-restart-button = Рестартирай и инсталирай
end-session-install-updates = Инсталиране на чакащите софтуерни актуализации
end-session-install-version = Инсталиране на версия { $version }
end-session-low-battery = Батерията е слаба. Включете захранването, преди да инсталирате актуализации.
end-session-busy-apps = Някои приложения са заети или имат незапазена работа
end-session-other-users = Влезли са и други потребители
end-session-cancel = Отказ
end-session-boot-options = Опции за зареждане
end-session-remote-user = { $userName } (отдалечено)
end-session-console-user = { $userName } (конзола)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Изисква се удостоверяване
network-agent-wifi-rejected = Запазената парола за „{ $networkName }“ не проработи. Въведете я отново.
network-agent-wifi-secrets = За достъп до безжичната мрежа „{ $networkName }“ са нужни пароли или ключове за шифроване
network-agent-wps-hint = Можете също да се свържете, като натиснете бутона „WPS“ на рутера
network-agent-wired-title = Удостоверяване 802.1X за кабелна мрежа
network-agent-dsl-title = Удостоверяване за DSL
network-agent-pin-title = Изисква се ПИН код
network-agent-pin-body = Устройството за мобилен интернет изисква ПИН код
network-agent-vpn-title = Парола за VPN
network-agent-password-required = За свързване с „{ $networkName }“ е нужна парола
network-agent-connect = Свържи
network-agent-cancel = Отказ
network-agent-password = Парола
network-agent-username = Потребителско име
network-agent-key = Ключ
network-agent-private-key-password = Парола за частния ключ
network-agent-identity = Самоличност
network-agent-service = Услуга
network-agent-network-name = Име на мрежата
network-agent-pin = ПИН

## Lock screen clock

lock-clock-swipe-up = Плъзнете нагоре
lock-clock-click-or-press = Щракнете или натиснете клавиш

## Notification times

date-just-now = Току-що

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Прозорци
ctrl-alt-tab-panel = Панел
ctrl-alt-tab-unlock = Прозорец за отключване

## System notifications

messages-system-source = Система
unsafe-mode-title = Системата е в небезопасен режим
unsafe-mode-body = Приложенията вече имат неограничен достъп
unsafe-mode-undo = Отмени
privileged-user-title = Влезли сте като привилегирован потребител
privileged-user-body = От съображения за сигурност е добре сесията да не работи като привилегирован потребител. Ако е възможно, влезте като обикновен потребител.

## On-screen keyboard

osk-keyboard-settings = Настройки на клавиатурата
osk-letters-key = АБВ

## Lock screen

lock-inhibit-reason = Kestrel трябва да заключи екрана

## Notifications

messages-unknown-app = Неизвестно приложение
messages-reply = Отговори
messages-reply-placeholder = Напишете отговор
messages-reply-send = Изпрати

## Media player controls

mpris-unknown-artist = Неизвестен изпълнител
mpris-unknown-title = Неизвестно заглавие

## Starting programs

spawn-failed = Изпълнението на „{ $command }“ не успя:

## Text field context menu

entry-menu-copy = Копирай
entry-menu-paste = Постави
entry-menu-show-text = Покажи текста
entry-menu-hide-text = Скрий текста
entry-caps-lock-on = Caps Lock е включен

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Направи екранна снимка
title-bar-menu-hide = Скрий
title-bar-menu-restore = Възстанови
title-bar-menu-maximize = Максимизирай
title-bar-menu-move = Премести
title-bar-menu-resize = Преоразмери
title-bar-menu-always-on-top = Винаги отгоре
title-bar-menu-always-on-visible-workspace = Винаги във видимото работно пространство
title-bar-menu-workspace-left = Премести в работното пространство вляво
title-bar-menu-workspace-right = Премести в работното пространство вдясно
title-bar-menu-workspace-up = Премести в работното пространство горе
title-bar-menu-workspace-down = Премести в работното пространство долу
title-bar-menu-monitor-up = Премести на екрана горе
title-bar-menu-monitor-down = Премести на екрана долу
title-bar-menu-monitor-left = Премести на екрана вляво
title-bar-menu-monitor-right = Премести на екрана вдясно
title-bar-menu-close = Затвори

## Screenshots and screen recording

screenshot-source = Заснемане на екрана
screenshot-area = Избор на област
screenshot-screen = Избор на екран
screenshot-window = Избор на прозорец
screenshot-take = Направи екранна снимка
screenshot-record = Запиши екрана
screenshot-show-pointer = Покажи показалеца
screenshot-capture = Заснеми
screenshot-close = Затвори
screenshot-screencasts-folder = Записи на екрана
screenshot-screencast-file = Запис на екрана от { $date } { $time }
screenshot-screenshots-folder = Екранни снимки
screenshot-file = Екранна снимка от { $timestamp }
screenshot-screencast-recorded = Записът на екрана е готов
screenshot-screencast-start-failed = Записът на екрана не можа да започне
screenshot-screencast-out-of-space = Записът на екрана спря: няма място на диска
screenshot-screencast-try-again = Записът на екрана не успя. Опитайте отново.
screenshot-screencast-failed = Записът на екрана не успя
screenshot-screencast-view = Щракнете тук, за да видите видеото
screenshot-show-in-rover = Покажи в Rover
screenshot-captured = Екранната снимка е направена
screenshot-captured-body = Можете да поставите изображението от клипборда
