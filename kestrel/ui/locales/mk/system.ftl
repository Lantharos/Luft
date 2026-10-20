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
privacy-windows-using = Ги користи вашите прозорци
privacy-windows-seeing = Ги гледа вашите прозорци
privacy-windows-stop = Одземи пристап

## Window access prompt

peek-see-title = Програмата { $app } сака да ги гледа вашите прозорци
peek-see-description = Ќе може да прави слики од секој отворен прозорец.
peek-use-title = Програмата { $app } сака да ги гледа и користи вашите прозорци
peek-use-description = Ќе може да го гледа секој отворен прозорец и да кликнува и пишува во него како да сте вие.
peek-deny = Не дозволувај
peek-allow-once = Дозволи еднаш
peek-allow-until-quit = Дозволи додека не се затвори

## Window access errors

peek-error-declined = Лицето што го користи овој компјутер го одби ова. Програмата { $app } може повторно да побара откако ќе се затвори.
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
