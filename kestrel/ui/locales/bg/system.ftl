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
battery-left-with-time = Остават { $percent }, около { $duration }.
battery-low-title = Слаба батерия
battery-very-low-title = Много слаба батерия
battery-almost-empty-title = Батерията е почти изтощена
battery-ups-low-title = Слаба батерия на UPS
battery-ups-very-low-title = Много слаба батерия на UPS
battery-ups-almost-empty-title = Батерията на UPS е почти изтощена
battery-very-low-body = { $left } Включете скоро захранването.
battery-almost-empty-body = { $left } Включете захранването сега, за да не загубите незапазената работа.

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
privacy-windows-using = Използва вашите прозорци
privacy-windows-seeing = Вижда вашите прозорци
privacy-windows-stop = Спри достъпа

## Window access prompt

peek-see-title = { $app } иска да вижда вашите прозорци
peek-see-description = Ще може да прави снимки на всеки отворен прозорец.
peek-use-title = { $app } иска да вижда и използва вашите прозорци
peek-use-description = Ще може да вижда всеки отворен прозорец, да щраква и да пише в него, все едно сте вие.
peek-deny = Не разрешавай
peek-allow-once = Разреши веднъж
peek-allow-until-quit = Разреши до затварянето му

## Window access errors

peek-error-declined = Човекът, който използва този компютър, отказа. Програмата { $app } може да поиска отново, след като бъде затворена.
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
