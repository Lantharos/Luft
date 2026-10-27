## Shared

system-cancel = Откажи

## Dictation notifications

dictation-setup-title = Пишувајте со зборување
dictation-setup-body = Зборувајте и она што го кажувате се пишува, во секоја апликација. Слуша на овој компјутер, па најпрвин му треба говорниот модел.
dictation-setup-action = Постави диктирање
dictation-unsupported-title = Диктирањето на јазикот { $language } не е достапно на овој компјутер
dictation-unsupported-body = Неговиот процесор не може да го изврши препознавачот на говор што е потребен за јазикот { $language }. Можете да диктирате на друг јазик.
dictation-settings-action = Поставки за диктирање

## System health notifications

health-gpu-reset-title = Графичкиот двигател престана да одговара
health-gpu-reset-body = { $day ->
    [today] Компјутерот се рестартираше сам денес во { $time }. Во Поставки ќе видите што може да спречи тоа да се повтори.
   *[other] Компјутерот се рестартираше сам на { $date } во { $time }. Во Поставки ќе видите што може да спречи тоа да се повтори.
}
health-gpu-reset-details = Детали

oom-app-closed-title = Апликацијата { $app } е затворена за да се ослободи меморија
oom-container-closed-title = Еден контејнер е затворен за да се ослободи меморија
oom-closed-body = На компјутерот му снемуваше меморија, па со затворањето сè друго продолжи да реагира.
oom-closed-body-with-size = На компјутерот му снемуваше меморија, па со затворањето сè друго продолжи да реагира. Користеше { $size }.
memory-low-title = Luft останува без меморија
memory-low-app-body = Апликацијата { $app } користи { $size }. Присилно затворете ја за сè друго да продолжи да реагира.
memory-low-container-body = Контејнер користи { $size }. Присилно затворете го за сè друго да продолжи да реагира.
memory-low-force-quit = Присилно затвори

## Input source indicator

input-source-indicator = Извор за внесување: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Режимот за авион е вклучен со копче на уредот
media-keys-airplane-mode-on = Режимот за авион е вклучен
media-keys-airplane-mode-off = Режимот за авион е исклучен
media-keys-bluetooth-on = Bluetooth е вклучен
media-keys-bluetooth-off = Bluetooth е исклучен
media-keys-caps-lock-on = Caps Lock е вклучен
media-keys-caps-lock-off = Caps Lock е исклучен
media-keys-num-lock-on = Num Lock е вклучен
media-keys-num-lock-off = Num Lock е исклучен

## VPN sign-in

vpn-sign-in-title = Најава на { $connection }
vpn-connect = Поврзи
vpn-signing-in = Се најавува…
vpn-finish-in-browser = Завршете ја најавата во прелистувачот.
vpn-certificate-untrusted = { $host } прикажа сертификат што не може да се потврди ({ $reason }). Неговиот отпечаток е { $fingerprint }.
vpn-certificate-warning = Некој може да се претставува како овој сервер. Поврзете се само ако го очекувавте ова.
vpn-certificate-connect = Сепак поврзи

vpn-field-password = Лозинка
vpn-field-certificate-password = Лозинка за сертификатот
vpn-field-proxy-password = Лозинка за проксито
vpn-field-pre-shared-key = Претходно споделен клуч
vpn-field-group-password = Групна лозинка

## Battery notifications

battery-left = Преостанато е { $percent }.
battery-left-with-time = Преостанато е { $percent }, околу { $duration }.
battery-low-title = Батеријата е слаба
battery-very-low-title = Батеријата е многу слаба
battery-almost-empty-title = Батеријата е речиси празна
battery-ups-low-title = Батеријата на UPS-уредот е слаба
battery-ups-very-low-title = Батеријата на UPS-уредот е многу слаба
battery-ups-almost-empty-title = Батеријата на UPS-уредот е речиси празна
battery-very-low-body = { $left } Наскоро приклучете го на струја.
battery-almost-empty-body = { $left } Приклучете го на струја сега за да не изгубите незачувана работа.

battery-device-low-title = { $device }: батеријата е слаба
battery-device-very-low-title = { $device }: батеријата е многу слаба
battery-device-low-body = { $left } Наскоро наполнете ја батеријата.
battery-device-very-low-body = { $left } Наполнете ја батеријата сега за уредот да не се исклучи.

battery-device-mouse = Глувче
battery-device-keyboard = Тастатура
battery-device-phone = Телефон
battery-device-tablet = Таблет
battery-device-controller = Контролер
battery-device-pen = Пенкало
battery-device-touchpad = Тачпед
battery-device-headset = Слушалки со микрофон
battery-device-speaker = Звучник
battery-device-headphones = Слушалки
battery-device-remote = Далечински управувач
battery-device-other = Поврзан уред

## Privacy indicator

privacy-indicator = Во употреба: { $things }
privacy-thing-camera = камера
privacy-thing-microphone = микрофон
privacy-thing-screen = екран
privacy-thing-location = локација
privacy-thing-windows = прозорци

privacy-camera-unknown-app = Една апликација ја користи камерата
privacy-stop-sharing = Престани со споделување на екранот
privacy-stop-recording = Престани со снимање
privacy-turn-off-location = Исклучи ги услугите за локација
privacy-settings = Поставки за приватност
privacy-camera = Камера
privacy-microphone = Микрофон
privacy-microphone-muted = Микрофонот е исклучен
privacy-mute-microphone = Исклучи го микрофонот
privacy-unmute-microphone = Вклучи го микрофонот
privacy-close-app = Затвори { $app }
privacy-unknown-app = Една апликација
privacy-windows-seeing-programs = { $count ->
    [one] { $count } програма може да ги гледа вашите прозорци
   *[other] { $count } програми можат да ги гледаат вашите прозорци
}
privacy-windows-using-programs = { $count ->
    [one] { $count } програма може да ги гледа и користи вашите прозорци
   *[other] { $count } програми можат да ги гледаат и користат вашите прозорци
}
privacy-windows-stop = Одземи пристап

## Window access prompt

peek-see-request = Да ѝ се дозволи ли на програма што ја стартувавте да ги гледа вашите прозорци?
peek-see-description = Ќе може да прави слики од секој отворен прозорец.
peek-use-request = Да ѝ се дозволи ли на програма што ја стартувавте да ги гледа и користи вашите прозорци?
peek-use-description = Ќе може да го гледа секој отворен прозорец и да кликнува и пишува во него како да сте вие.
peek-deny = Не дозволувај
peek-allow-once = Дозволи еднаш
peek-allow-until-quit = Дозволи додека не се затвори

## Window access errors

peek-error-declined-until-quit = Лицето што го користи овој компјутер го одби ова. Програмата може повторно да побара откако ќе се затвори.
peek-error-not-allowed = Лицето што го користи овој компјутер не го дозволи ова
peek-error-sandboxed = Апликациите во изолирана средина не можат да ги гледаат или користат другите прозорци
peek-error-unknown-caller = Програмата што бара заврши или не можеше да се препознае
peek-error-no-caller = Сесиската магистрала не кажа која програма бара
peek-error-screen-busy = Екранот е заклучен или на него е отворено системско барање. Обидете се повторно откако ќе исчезне.
peek-error-input-held = Некој држи притиснати копчиња или копчиња на глувчето. Обидете се повторно за момент.
peek-error-input-dropped = Внесувањето е запрено затоа што под точката имаше нешто друго или нешто друго ја имаше тастатурата кога пристигна
peek-error-not-in-front = Прозорецот не можеше да се донесе напред
peek-error-covered = Нешто друго го покрива тој дел од прозорецот
peek-error-outside = { $x }, { $y } е надвор од сликата на прозорецот, која е { $width } × { $height }
peek-error-nothing-to-capture = Прозорецот не прикажува ништо што може да се сними
peek-error-window-picture-late = Сликата на прозорецот не беше подготвена навреме
peek-error-screen-picture-late = Сликата на екранот не беше подготвена навреме
peek-error-no-window-id = Ниеден прозорец нема ID { $id }. peek list ги прикажува отворените.
peek-error-no-window-for-handle = Програмата стартувана како { $handle } нема отворен прозорец
peek-error-ended-before-window = Програмата заврши пред да отвори прозорец
peek-error-no-window-in-time = Не се отвори прозорец за { $duration }
peek-error-launch-not-started-by-peek = Може да се стартува само програма стартувана преку peek run
peek-error-ended-while-starting = Програмата заврши додека се стартуваше
peek-error-launch-failed = systemd не можеше да ја стартува програмата { $program }
peek-error-unknown-handle = Ништо што сте го стартувале со peek run нема ознака { $handle }, или веќе е затворено
peek-error-unknown-key = { $key } не е копче што peek го познава
peek-error-unknown-modifier = { $modifier } не е модификатор. Користете ctrl, shift, alt или super.
peek-error-display-owner = Овој екран припаѓа на друга програма
peek-error-display-run = Програмите во скриен екран ги стартува peek run
peek-error-display-handle = Овој екран е стартуван како { $handle }, а не { $requested }

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
