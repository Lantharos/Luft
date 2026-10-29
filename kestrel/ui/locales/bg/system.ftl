## Shared

system-cancel = Отказ

## Dictation notifications

dictation-setup-title = Пишете с глас
dictation-setup-body = Говорете и казаното се изписва във всяко приложение. Разпознаването става на този компютър, затова първо е нужен речевият модел.
dictation-setup-action = Настрой диктовката
dictation-unsupported-title = Диктовка на { $language } не е налична на този компютър
dictation-unsupported-body = Процесорът му не може да изпълнява разпознаването на реч, нужно за { $language }. Можете да диктувате на друг език.
dictation-settings-action = Настройки на диктовката

## System health notifications

health-gpu-reset-title = Графичният драйвер спря да отговаря
health-gpu-reset-body = { $day ->
    [today] Компютърът се рестартира сам днес в { $time }. В Настройки ще видите как да предотвратите това.
   *[other] Компютърът се рестартира сам на { $date } в { $time }. В Настройки ще видите как да предотвратите това.
}
health-gpu-reset-details = Подробности

oom-app-closed-title = Приложението { $app } беше затворено, за да се освободи памет
oom-container-closed-title = Контейнер беше затворен, за да се освободи памет
oom-closed-body = Паметта на компютъра почти се изчерпа и затварянето му помогна всичко останало да продължи да работи гладко.
oom-closed-body-with-size = Паметта на компютъра почти се изчерпа и затварянето му помогна всичко останало да продължи да работи гладко. Използваше { $size }.
memory-low-title = Luft остава без памет
memory-low-app-body = { $app } използва { $size }. Затворете го принудително, за да продължи всичко останало да работи гладко.
memory-low-container-body = Контейнер използва { $size }. Затворете го принудително, за да продължи всичко останало да работи гладко.
memory-low-force-quit = Затвори принудително

## Input source indicator

input-source-indicator = Източник за въвеждане: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Самолетният режим е включен от хардуерен превключвател
media-keys-airplane-mode-on = Самолетният режим е включен
media-keys-airplane-mode-off = Самолетният режим е изключен
media-keys-bluetooth-on = Bluetooth е включен
media-keys-bluetooth-off = Bluetooth е изключен
media-keys-caps-lock-on = Caps Lock е включен
media-keys-caps-lock-off = Caps Lock е изключен
media-keys-num-lock-on = Num Lock е включен
media-keys-num-lock-off = Num Lock е изключен

## VPN sign-in

vpn-sign-in-title = Вход в { $connection }
vpn-connect = Свържи
vpn-signing-in = Влизане…
vpn-finish-in-browser = Завършете влизането в браузъра.
vpn-certificate-untrusted = { $host } представи сертификат, който не може да бъде проверен ({ $reason }). Отпечатъкът му е { $fingerprint }.
vpn-certificate-warning = Възможно е някой да се представя за този сървър. Свържете се само ако сте очаквали това.
vpn-certificate-connect = Свържи въпреки това

vpn-field-password = Парола
vpn-field-certificate-password = Парола на сертификата
vpn-field-proxy-password = Парола за проксито
vpn-field-pre-shared-key = Предварително споделен ключ
vpn-field-group-password = Парола на групата

## Battery notifications

battery-left = Остават { $percent }.

battery-device-low-title = { $device }: слаба батерия
battery-device-very-low-title = { $device }: много слаба батерия
battery-device-low-body = { $left } Заредете скоро.
battery-device-very-low-body = { $left } Заредете сега, за да не се изключи.

battery-device-mouse = Мишка
battery-device-keyboard = Клавиатура
battery-device-phone = Телефон
battery-device-tablet = Таблет
battery-device-controller = Контролер
battery-device-pen = Писалка
battery-device-touchpad = Тъчпад
battery-device-headset = Слушалки с микрофон
battery-device-speaker = Високоговорител
battery-device-headphones = Слушалки
battery-device-remote = Дистанционно
battery-device-other = Свързано устройство

## Privacy indicator

privacy-indicator = В употреба: { $things }
privacy-thing-camera = камера
privacy-thing-microphone = микрофон
privacy-thing-screen = екран
privacy-thing-location = местоположение
privacy-thing-windows = прозорци

privacy-camera-unknown-app = Приложение използва камерата
privacy-stop-sharing = Спри споделянето на екрана
privacy-stop-recording = Спри записа
privacy-turn-off-location = Изключи услугите за местоположение
privacy-settings = Настройки за поверителност
privacy-camera = Камера
privacy-microphone = Микрофон
privacy-microphone-muted = Микрофонът е заглушен
privacy-mute-microphone = Заглуши микрофона
privacy-unmute-microphone = Включи микрофона
privacy-close-app = Затвори { $app }
privacy-unknown-app = Приложение
privacy-reported-app = „{ $name }“ (името не е проверено)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } програма може да вижда вашите прозорци
   *[other] { $count } програми могат да виждат вашите прозорци
}
privacy-windows-using-programs = { $count ->
    [one] { $count } програма може да вижда и използва вашите прозорци
   *[other] { $count } програми могат да виждат и използват вашите прозорци
}
privacy-windows-stop = Спри достъпа

## Window access prompt

peek-see-request = Да се разреши ли на програма, която сте стартирали, да вижда вашите прозорци?
peek-see-description = Ще може да прави снимки на всеки отворен прозорец.
peek-use-request = Да се разреши ли на програма, която сте стартирали, да вижда и използва вашите прозорци?
peek-use-description = Ще може да вижда всеки отворен прозорец, да щраква и да пише в него, все едно сте вие.
peek-deny = Не разрешавай
peek-allow-once = Разреши веднъж
peek-allow-until-quit = Разреши до затварянето му

## Window access errors

peek-error-declined-until-quit = Човекът, който използва този компютър, отказа. Програмата може да поиска отново, след като бъде затворена.
peek-error-not-allowed = Човекът, който използва този компютър, не го разреши
peek-error-sandboxed = Приложенията в изолирана среда не могат да виждат и използват други прозорци
peek-error-unknown-caller = Програмата, която пита, е спряла или не може да бъде разпозната
peek-error-no-caller = Шината на сесията не съобщи коя програма пита
peek-error-screen-busy = Екранът е заключен или на него е отворен системен прозорец. Опитайте отново, когато изчезне.
peek-error-input-held = Някой държи натиснати клавиши или бутони на мишката. Опитайте отново след малко.
peek-error-input-dropped = Въвеждането беше спряно, защото когато пристигна, под показалеца имаше нещо друго или клавиатурата беше заета другаде
peek-error-not-in-front = Прозорецът не можа да бъде изведен отпред
peek-error-covered = Нещо друго закрива тази част на прозореца
peek-error-outside = { $x }, { $y } е извън изображението на прозореца, което е { $width } × { $height }
peek-error-nothing-to-capture = Прозорецът не показва нищо, което да бъде заснето
peek-error-window-picture-late = Изображението на прозореца не беше готово навреме
peek-error-screen-picture-late = Изображението на екрана не беше готово навреме
peek-error-no-window-id = Няма прозорец с номер { $id }. peek list показва отворените.
peek-error-no-window-for-handle = Програмата, стартирана като { $handle }, няма отворен прозорец
peek-error-ended-before-window = Програмата спря, преди да отвори прозорец
peek-error-no-window-in-time = Не се отвори прозорец в рамките на { $duration }
peek-error-launch-not-started-by-peek = Може да се стартира само програма, която peek run е стартирала сама
peek-error-ended-while-starting = Програмата спря, докато се стартираше
peek-error-launch-failed = systemd не можа да стартира { $program }
peek-error-unknown-handle = Нищо, стартирано с peek run, няма идентификатор { $handle }, или вече е затворено
peek-error-unknown-key = { $key } не е клавиш, който peek познава
peek-error-unknown-modifier = { $modifier } не е модифициращ клавиш. Използвайте ctrl, shift, alt или super.
peek-error-display-owner = Този дисплей принадлежи на друга програма
peek-error-display-run = Програмите в скрит дисплей се стартират с peek run
peek-error-display-handle = Този дисплей е стартиран като { $handle }, а не като { $requested }

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
inhibit-shortcuts-titled-app = Приложение с прозореца „{ $title }“ иска да блокира клавишните комбинации
inhibit-shortcuts-restore = Можете да възстановите клавишните комбинации, като натиснете { $shortcut }
inhibit-shortcuts-deny = Откажи
inhibit-shortcuts-allow = Разреши

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

## System updates
updates-available-title = Има системни актуализации
updates-available-body = Отворете Настройки, за да ги изтеглите и инсталирате.
updates-ready-title = Актуализациите са готови за инсталиране
updates-ready-body = Рестартирайте, когато ви е удобно, за да ги инсталирате.
