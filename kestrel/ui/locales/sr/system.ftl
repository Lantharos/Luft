## Shared

system-cancel = Откажи

## Dictation notifications

dictation-setup-title = Куцајте говором
dictation-setup-body = Говорите и оно што кажете биће откуцано, у било којој апликацији. Све се обрађује на овом рачунару, па је прво потребан говорни модел.
dictation-setup-action = Подеси диктирање
dictation-unsupported-title = Диктирање на језику { $language } није доступно на овом рачунару
dictation-unsupported-body = Процесор овог рачунара не може да покрене препознавање говора које је потребно за језик { $language }. Можете да диктирате на другом језику.
dictation-settings-action = Подешавања диктирања

## System health notifications

health-gpu-reset-title = Графички драјвер је престао да реагује
health-gpu-reset-body = { $day ->
    [today] Рачунар се данас у { $time } сам поново покренуо. У Подешавањима можете видети шта може да спречи да се то понови.
   *[other] Рачунар се { $date } у { $time } сам поново покренуо. У Подешавањима можете видети шта може да спречи да се то понови.
}
health-gpu-reset-details = Детаљи

oom-app-closed-title = Апликација { $app } је затворена да би се ослободила меморија
oom-container-closed-title = Контејнер је затворен да би се ослободила меморија
oom-closed-body = Рачунару је понестајало меморије, па је затварање било потребно да би све остало и даље брзо реаговало.
oom-closed-body-with-size = Рачунару је понестајало меморије, па је затварање било потребно да би све остало и даље брзо реаговало. Тиме је ослобођено { $size }.

## Input source indicator

input-source-indicator = Извор уноса: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Режим рада у авиону је укључен хардверским прекидачем
media-keys-airplane-mode-on = Режим рада у авиону укључен
media-keys-airplane-mode-off = Режим рада у авиону искључен
media-keys-bluetooth-on = Bluetooth укључен
media-keys-bluetooth-off = Bluetooth искључен
media-keys-caps-lock-on = Caps Lock укључен
media-keys-caps-lock-off = Caps Lock искључен
media-keys-num-lock-on = Num Lock укључен
media-keys-num-lock-off = Num Lock искључен

## VPN sign-in

vpn-sign-in-title = Пријава на { $connection }
vpn-connect = Повежи
vpn-signing-in = Пријављивање…
vpn-finish-in-browser = Довршите пријаву у прегледачу.
vpn-certificate-untrusted = Сервер { $host } је понудио сертификат који не може да се провери ({ $reason }). Његов отисак је { $fingerprint }.
vpn-certificate-warning = Неко би могао да се представља као овај сервер. Повежите се само ако сте ово очекивали.
vpn-certificate-connect = Ипак повежи

vpn-field-password = Лозинка
vpn-field-certificate-password = Лозинка сертификата
vpn-field-proxy-password = Лозинка проксија
vpn-field-pre-shared-key = Унапред дељени кључ
vpn-field-group-password = Лозинка групе

## Battery notifications

battery-left = Преостало је { $percent }.
battery-left-with-time = Преостало је { $percent }, отприлике { $duration }.
battery-low-title = Батерија је слаба
battery-very-low-title = Батерија је веома слаба
battery-almost-empty-title = Батерија је скоро празна
battery-ups-low-title = Батерија UPS-а је слаба
battery-ups-very-low-title = Батерија UPS-а је веома слаба
battery-ups-almost-empty-title = Батерија UPS-а је скоро празна
battery-very-low-body = { $left } Ускоро прикључите пуњач.
battery-almost-empty-body = { $left } Прикључите пуњач одмах да не бисте изгубили несачувани рад.

battery-device-low-title = Слаба батерија: { $device }
battery-device-very-low-title = Веома слаба батерија: { $device }
battery-device-low-body = { $left } Ускоро га напуните.
battery-device-very-low-body = { $left } Напуните га одмах да се не би искључио.

battery-device-mouse = Миш
battery-device-keyboard = Тастатура
battery-device-phone = Телефон
battery-device-tablet = Таблет
battery-device-controller = Контролер
battery-device-pen = Оловка
battery-device-touchpad = Тачпед
battery-device-headset = Слушалице са микрофоном
battery-device-speaker = Звучник
battery-device-headphones = Слушалице
battery-device-remote = Даљински управљач
battery-device-other = Повезани уређај

## Privacy indicator

privacy-indicator = У употреби: { $things }
privacy-thing-camera = камера
privacy-thing-microphone = микрофон
privacy-thing-screen = екран
privacy-thing-location = локација
privacy-thing-windows = прозори

privacy-camera-unknown-app = Нека апликација користи камеру
privacy-stop-sharing = Заустави дељење екрана
privacy-stop-recording = Заустави снимање
privacy-turn-off-location = Искључи услуге локације
privacy-settings = Подешавања приватности
privacy-camera = Камера
privacy-microphone = Микрофон
privacy-microphone-muted = Микрофон је искључен
privacy-mute-microphone = Искључи микрофон
privacy-unmute-microphone = Укључи микрофон
privacy-close-app = Затвори { $app }
privacy-unknown-app = Апликација
privacy-windows-using = Користи ваше прозоре
privacy-windows-seeing = Види ваше прозоре
privacy-windows-stop = Укини приступ

## Window access prompt

peek-see-title = { $app } жели да види ваше прозоре
peek-see-description = Моћи ће да снима слике сваког прозора који имате отворен.
peek-use-title = { $app } жели да види и користи ваше прозоре
peek-use-description = Моћи ће да види сваки прозор који имате отворен и да у њему кликће и куца као да сте то ви.
peek-deny = Не дозволи
peek-allow-once = Дозволи једном
peek-allow-until-quit = Дозволи док се не затвори

## Window access errors

peek-error-declined = Особа која користи овај рачунар је ово одбила. { $app } може поново да пита када се затвори.
peek-error-not-allowed = Особа која користи овај рачунар то није дозволила
peek-error-sandboxed = Апликације у изолованом окружењу не могу да виде нити да користе друге прозоре
peek-error-unknown-caller = Програм који пита се завршио или није могао да се препозна
peek-error-no-caller = Магистрала сесије није навела који програм пита
peek-error-screen-busy = Екран је закључан или је на њему отворен системски упит. Покушајте поново када нестане.
peek-error-input-held = Неко држи притиснуте тастере или дугмад миша. Покушајте поново за тренутак.
peek-error-input-dropped = Унос је заустављен јер се, када је стигао, нешто друго налазило на тој тачки или је имало фокус тастатуре
peek-error-not-in-front = Прозор није могао да се доведе у први план
peek-error-covered = Нешто друго прекрива тај део прозора
peek-error-outside = { $x }, { $y } је изван слике прозора, која има { $width } × { $height }
peek-error-nothing-to-capture = Прозор не приказује ништа што би могло да се сними
peek-error-window-picture-late = Слика прозора није била спремна на време
peek-error-screen-picture-late = Слика екрана није била спремна на време
peek-error-no-window-id = Ниједан прозор нема ID { $id }. peek list приказује отворене прозоре.
peek-error-no-window-for-handle = Програм покренут као { $handle } нема отворен прозор
peek-error-ended-before-window = Програм се завршио пре него што је отворио прозор
peek-error-no-window-in-time = Ниједан прозор се није отворио у року од { $duration }
peek-error-launch-not-started-by-peek = Може да се покрене само програм који је peek run сам покренуо
peek-error-ended-while-starting = Програм се завршио док се покретао
peek-error-launch-failed = systemd није могао да покрене { $program }
peek-error-unknown-handle = Ништа што сте покренули помоћу peek run нема ознаку { $handle }, или се већ затворило
peek-error-unknown-key = { $key } није тастер који peek познаје
peek-error-unknown-modifier = { $modifier } није модификатор. Користите ctrl, shift, alt или super.
peek-error-display-owner = Овај екран припада другом програму
peek-error-display-run = Програме на скривеном екрану покреће peek run
peek-error-display-handle = Овај екран је покренут као { $handle }, а не као { $requested }
