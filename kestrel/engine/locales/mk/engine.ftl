## Quick settings tiles

auto-rotate-title = Автоматско вртење
dark-style-title = Темен режим
do-not-disturb-title = Не вознемирувај
night-light-title = Ноќно светло
airplane-mode-title = Режим за авион

## Power mode

power-profile-title = Режим на напојување
power-profile-header = Режим на напојување
power-profile-open-menu = Отвори го менито за режим на напојување
power-profile-settings = Поставки за напојување
power-profile-performance = Перформанси
power-profile-balanced = Балансирано
power-profile-power-saver = Штедење енергија
power-profile-custom = Прилагодено

## Keep awake

caffeine-title = Без спиење
caffeine-open-menu = Отвори го менито Без спиење
caffeine-until = До { $time }
caffeine-until-turned-off = Додека не се исклучи
caffeine-30-minutes = 30 минути
caffeine-1-hour = 1 час
caffeine-2-hours = 2 часа
caffeine-inhibit-reason = Будно од брзите поставки

## Brightness

brightness-title = Осветленост
brightness-open-menu = Отвори го менито за осветленост

## Keyboard backlight

backlight-title = Осветлување на тастатурата
backlight-open-menu = Отвори го менито за осветленост на тастатурата
backlight-slider = Осветленост на тастатурата
backlight-off = Исклучено
backlight-low = Слабо
backlight-high = Силно

## Sound

volume-sound-settings = Поставки за звукот
volume-mute = Исклучи звук
volume-unmute = Вклучи звук
volume-output-slider = Јачина на звук
volume-output-title = Излез на звук
volume-output-open-menu = Отвори го менито за излез на звук
volume-input-slider = Микрофон
volume-input-title = Влез на звук
volume-input-open-menu = Отвори го менито за влез на звук

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Отвори го менито за Bluetooth
bluetooth-settings = Поставки за Bluetooth
bluetooth-connect = Поврзи
bluetooth-disconnect = Прекини
bluetooth-connect-device = Поврзи се со { $deviceName }
bluetooth-disconnect-device = Прекини ја врската со { $deviceName }
bluetooth-no-devices = Нема достапни или поврзани уреди
bluetooth-turn-on-hint = Вклучете Bluetooth за да се поврзете со уреди
bluetooth-connected-count = { $count ->
    [one] { $count } поврзан
   *[other] { $count } поврзани
}

## Network menus in quick settings

network-menu-unknown-network = <непозната>
network-menu-connect = Поврзи
network-menu-disconnect = Прекини
network-menu-connect-to = Поврзи се со { $name }
network-menu-disconnect-from = Прекини ја врската со { $name }
network-menu-turn-off = Исклучи
network-menu-wifi-network = { $secure ->
    [yes] { $name }, заштитена, јачина на сигналот { $strength }%
   *[no] { $name }, незаштитена, јачина на сигналот { $strength }%
}
network-menu-hotspot = Хотспот на { $name }
network-menu-connected-count = { $count ->
    [one] { $count } поврзана
   *[other] { $count } поврзани
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Отвори го менито за VPN
network-menu-vpn-settings = Поставки за VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Отвори го менито за Wi-Fi
network-menu-wifi-settings = Сите мрежи
network-menu-wired = Жични врски
network-menu-wired-open-menu = Отвори го менито за жични врски
network-menu-wired-settings = Поставки за жична мрежа
network-menu-tethers = Тетеринг преку Bluetooth
network-menu-tethers-open-menu = Отвори го менито за тетеринг преку Bluetooth
network-menu-tether = Тетеринг
network-menu-tether-settings = Поставки за Bluetooth
network-menu-mobile-connections = Мобилни врски
network-menu-mobile-open-menu = Отвори го менито за мобилни врски
network-menu-mobile-settings = Поставки за мобилен интернет
network-menu-mobile = Мобилна мрежа
network-device-wired = Жична мрежа
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Најавете се на мрежата
network-menu-failed-title = Поврзувањето не успеа
network-menu-failed-body = Мрежната врска не можеше да се воспостави

## Location access dialog

location-dialog-title = Дозволи пристап до локацијата
location-dialog-description = Апликацијата { $appName } сака пристап до вашата локација
location-dialog-info = Пристапот до локацијата може да се промени во секое време во поставките за приватност
location-dialog-deny = Одбиј пристап
location-dialog-grant = Дозволи пристап

## Thunderbolt notifications

thunderbolt-unknown-title = Непознат Thunderbolt-уред
thunderbolt-unknown-body = Додека бевте отсутни, беше поврзан нов уред. Исклучете го и приклучете го повторно за да почнете да го користите.
thunderbolt-unauthorized-title = Неодобрен Thunderbolt-уред
thunderbolt-unauthorized-body = Поврзан е нов уред и му треба одобрение од администратор
thunderbolt-error-title = Грешка при одобрување на Thunderbolt-уред
thunderbolt-error-body = Thunderbolt-уредот не можеше да се одобри: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Одбиј
access-dialog-allow = Дозволи

## Display change confirmation

display-change-title = Да се задржат поставките?
display-change-countdown = { $seconds ->
    [one] Промените ќе се вратат за { $seconds } секунда
   *[other] Промените ќе се вратат за { $seconds } секунди
}
display-change-revert = Врати
display-change-keep = Задржи

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ не одговара
close-dialog-description = Можете да почекате малку апликацијата да продолжи или да ја затворите присилно
close-dialog-force-quit = Присилно затвори
close-dialog-wait = Почекај

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Огледало
switch-monitor-join = Спои екрани
switch-monitor-external-only = Само надворешен
switch-monitor-built-in-only = Само вграден

## Sign-in prompt

auth-prompt-password = Лозинка
auth-prompt-username = Корисничко име
auth-prompt-back = Назад
auth-prompt-submit = Потврди
auth-prompt-wrong-password = Лозинката не е точна
auth-prompt-failed = Не успеа. Обидете се повторно.
fingerprint-not-recognized = Отпечатокот од прст не е препознаен

## Drive connected notification

autorun-connected = „{ $driveName }“ е поврзан
autorun-ready = Дискот е подготвен за користење
autorun-open-with = Отвори со { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Бавните копчиња се вклучени
kbd-a11y-slow-keys-off = Бавните копчиња се исклучени
kbd-a11y-slow-keys-description = Го држевте копчето Shift 8 секунди. Тоа е кратенката за функцијата Бавни копчиња, која го менува начинот на кој работи тастатурата.
kbd-a11y-sticky-keys-on = Лепливите копчиња се вклучени
kbd-a11y-sticky-keys-off = Лепливите копчиња се исклучени
kbd-a11y-sticky-keys-on-description = Го притиснавте копчето Shift 5 пати по ред. Тоа е кратенката за функцијата Лепливи копчиња, која го менува начинот на кој работи тастатурата.
kbd-a11y-sticky-keys-off-description = Притиснавте две копчиња одеднаш или го притиснавте копчето Shift 5 пати по ред. Со тоа се исклучува функцијата Лепливи копчиња, која го менува начинот на кој работи тастатурата.
kbd-a11y-leave-on = Остави вклучено
kbd-a11y-turn-on = Вклучи
kbd-a11y-turn-off = Исклучи
kbd-a11y-leave-off = Остави исклучено

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Изберете аудиоуред
audio-device-cancel = Откажи
audio-device-sound-settings = Поставки за звукот
audio-device-headphones = Слушалки
audio-device-headset = Слушалки со микрофон
audio-device-microphone = Микрофон

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Дозволи блокирање на кратенките
inhibit-shortcuts-app = Апликацијата { $appName } сака да ги блокира кратенките
inhibit-shortcuts-unknown-app = Една апликација сака да ги блокира кратенките
inhibit-shortcuts-restore = Кратенките можете да ги вратите со притискање на { $shortcut }
inhibit-shortcuts-deny = Одбиј
inhibit-shortcuts-allow = Дозволи

## Administrator authentication

polkit-title = Потребна е потврда
polkit-administrator = Администратор
polkit-password = Лозинка
polkit-cancel = Откажи
polkit-authenticate = Потврди
polkit-failed = Не успеа. Обидете се повторно.

## Unlocking encrypted drives

mount-hidden-volume = Скриен волумен
mount-windows-system-volume = Системски волумен на Windows
mount-uses-keyfiles = Користи датотеки со клучеви
mount-keyfiles-use-app = За да отклучите волумен што користи датотеки со клучеви, користете ја алатката <i>{ $appName }</i>
mount-keyfiles-need-app = За да отклучите волумен што користи датотеки со клучеви, потребна ви е надворешна алатка како <i>Дискови</i>
mount-pim-number = PIM-број
mount-pim-invalid = PIM мора да биде број или празно
mount-password = Лозинка
mount-remember-password = Запомни ја лозинката
mount-cancel = Откажи
mount-unlock = Отклучи
mount-open-app = Отвори { $appName }
mount-wrong-password = Не успеа. Обидете се повторно.
mount-unlock-failed = Волуменот не можеше да се отклучи
mount-pim-unsupported = Инсталираната верзија на udisks не ја поддржува поставката PIM

## Log out, power off and restart dialog

end-session-log-out-user = Одјава на { $userName }
end-session-log-out-title = Одјава
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } ќе се одјави автоматски за { $seconds } секунда
   *[other] { $userName } ќе се одјави автоматски за { $seconds } секунди
}
end-session-log-out-countdown = { $seconds ->
    [one] Ќе бидете автоматски одјавени за { $seconds } секунда
   *[other] Ќе бидете автоматски одјавени за { $seconds } секунди
}
end-session-log-out-button = Одјави се
end-session-power-off-title = Исклучување
end-session-power-off-updates-title = Инсталирање ажурирања и исклучување
end-session-power-off-countdown = { $seconds ->
    [one] Системот ќе се исклучи автоматски за { $seconds } секунда
   *[other] Системот ќе се исклучи автоматски за { $seconds } секунди
}
end-session-power-off-button = Исклучи
end-session-restart-title = Рестартирање
end-session-restart-updates-title = Инсталирање ажурирања и рестартирање
end-session-restart-countdown = { $seconds ->
    [one] Системот ќе се рестартира автоматски за { $seconds } секунда
   *[other] Системот ќе се рестартира автоматски за { $seconds } секунди
}
end-session-restart-button = Рестартирај
end-session-update-restart-title = Рестартирање и инсталирање ажурирања
end-session-update-restart-countdown = { $seconds ->
    [one] Системот ќе се рестартира и ќе ги инсталира ажурирањата автоматски за { $seconds } секунда
   *[other] Системот ќе се рестартира и ќе ги инсталира ажурирањата автоматски за { $seconds } секунди
}
end-session-update-restart-button = Рестартирај и инсталирај
end-session-install-updates = Инсталирај ги ажурирањата што чекаат
end-session-install-version = Инсталирај ја верзијата { $version }
end-session-low-battery = Батеријата е слаба. Приклучете го компјутерот на струја пред да инсталирате ажурирања.
end-session-busy-apps = Некои апликации се зафатени или имаат незачувана работа
end-session-other-users = Најавени се и други корисници
end-session-cancel = Откажи
end-session-boot-options = Опции за подигање
end-session-remote-user = { $userName } (од далечина)
end-session-console-user = { $userName } (конзола)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Потребна е потврда
network-agent-wifi-rejected = Зачуваната лозинка за „{ $networkName }“ не функционираше. Внесете ја повторно.
network-agent-wifi-secrets = За пристап до безжичната мрежа „{ $networkName }“ потребни се лозинки или клучеви за шифрирање
network-agent-wps-hint = Можете да се поврзете и со притискање на копчето „WPS“ на рутерот
network-agent-wired-title = Потврда за жична мрежа 802.1X
network-agent-dsl-title = Потврда за DSL
network-agent-pin-title = Потребен е PIN-код
network-agent-pin-body = За уредот за мобилен интернет е потребен PIN-код
network-agent-vpn-title = Лозинка за VPN
network-agent-password-required = За поврзување со „{ $networkName }“ е потребна лозинка
network-agent-connect = Поврзи
network-agent-cancel = Откажи
network-agent-password = Лозинка
network-agent-username = Корисничко име
network-agent-key = Клуч
network-agent-private-key-password = Лозинка за приватниот клуч
network-agent-identity = Идентитет
network-agent-service = Услуга
network-agent-network-name = Име на мрежата
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Повлечете нагоре
lock-clock-click-or-press = Кликнете или притиснете копче

## Notification times

date-just-now = Токму сега

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Прозорци
ctrl-alt-tab-panel = Лента со задачи
ctrl-alt-tab-unlock = Прозорец за отклучување

## System notifications

messages-system-source = Систем
unsafe-mode-title = Системот е во небезбеден режим
unsafe-mode-body = Апликациите сега имаат неограничен пристап
unsafe-mode-undo = Врати
privileged-user-title = Најавени сте како привилегиран корисник
privileged-user-body = Од безбедносни причини, избегнувајте сесија како привилегиран корисник. Ако можете, најавете се како обичен корисник.

## On-screen keyboard

osk-keyboard-settings = Поставки за тастатурата
osk-letters-key = АБВ

## Lock screen

lock-inhibit-reason = Kestrel треба да го заклучи екранот

## Notifications

messages-unknown-app = Непозната апликација
messages-reply = Одговори
messages-reply-placeholder = Напишете одговор
messages-reply-send = Испрати

## Media player controls

mpris-unknown-artist = Непознат изведувач
mpris-unknown-title = Непознат наслов

## Starting programs

spawn-failed = „{ $command }“ не можеше да се изврши:

## Text field context menu

entry-menu-copy = Копирај
entry-menu-paste = Залепи
entry-menu-show-text = Прикажи го текстот
entry-menu-hide-text = Скриј го текстот
entry-caps-lock-on = Caps Lock е вклучен

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Направи слика од екранот
title-bar-menu-hide = Скриј
title-bar-menu-restore = Врати
title-bar-menu-maximize = Максимизирај
title-bar-menu-move = Премести
title-bar-menu-resize = Промени големина
title-bar-menu-always-on-top = Секогаш најгоре
title-bar-menu-always-on-visible-workspace = Секогаш на видливиот работен простор
title-bar-menu-workspace-left = Премести во работниот простор лево
title-bar-menu-workspace-right = Премести во работниот простор десно
title-bar-menu-workspace-up = Премести во работниот простор горе
title-bar-menu-workspace-down = Премести во работниот простор долу
title-bar-menu-monitor-up = Премести на екранот горе
title-bar-menu-monitor-down = Премести на екранот долу
title-bar-menu-monitor-left = Премести на екранот лево
title-bar-menu-monitor-right = Премести на екранот десно
title-bar-menu-close = Затвори

## Screenshots and screen recording

screenshot-source = Снимање на екранот
screenshot-area = Избор на област
screenshot-screen = Избор на екран
screenshot-window = Избор на прозорец
screenshot-take = Направи слика од екранот
screenshot-record = Сними го екранот
screenshot-show-pointer = Прикажи го покажувачот
screenshot-capture = Сними
screenshot-close = Затвори
screenshot-screencasts-folder = Снимки од екранот
screenshot-screencast-file = Снимка од екранот { $date } { $time }
screenshot-screenshots-folder = Слики од екранот
screenshot-file = Слика од екранот { $timestamp }
screenshot-screencast-recorded = Снимката од екранот е зачувана
screenshot-screencast-start-failed = Снимањето на екранот не можеше да започне
screenshot-screencast-out-of-space = Снимањето на екранот не успеа: нема простор на дискот
screenshot-screencast-try-again = Снимањето на екранот не успеа. Обидете се повторно.
screenshot-screencast-failed = Снимањето на екранот не успеа
screenshot-screencast-view = Кликнете за да го видите видеото
screenshot-show-in-rover = Прикажи во Rover
screenshot-captured = Сликата од екранот е направена
screenshot-captured-body = Сликата можете да ја залепите од клипбордот
