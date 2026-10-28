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
memory-low-title = Luft остаје без меморије
memory-low-app-body = Апликација { $app } користи { $size }. Принудно је затворите да би све остало и даље брзо реаговало.
memory-low-container-body = Контејнер користи { $size }. Принудно га затворите да би све остало и даље брзо реаговало.
memory-low-force-quit = Принудно затвори

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
privacy-windows-seeing-programs = { $count ->
    [one] { $count } програм може да види ваше прозоре
    [few] { $count } програма могу да виде ваше прозоре
   *[other] { $count } програма може да види ваше прозоре
}
privacy-windows-using-programs = { $count ->
    [one] { $count } програм може да види и користи ваше прозоре
    [few] { $count } програма могу да виде и користе ваше прозоре
   *[other] { $count } програма може да види и користи ваше прозоре
}
privacy-windows-stop = Укини приступ

## Window access prompt

peek-see-request = Дозволити програму који сте покренули да види ваше прозоре?
peek-see-description = Моћи ће да снима слике сваког прозора који имате отворен.
peek-use-request = Дозволити програму који сте покренули да види и користи ваше прозоре?
peek-use-description = Моћи ће да види сваки прозор који имате отворен и да у њему кликће и куца као да сте то ви.
peek-deny = Не дозволи
peek-allow-once = Дозволи једном
peek-allow-until-quit = Дозволи док се не затвори

## Window access errors

peek-error-declined-until-quit = Особа која користи овај рачунар је ово одбила. Програм може поново да пита када се затвори.
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

## Quick settings tiles

auto-rotate-title = Аутоматска ротација
dark-style-title = Тамни режим
do-not-disturb-title = Не узнемиравај
night-light-title = Ноћно светло
airplane-mode-title = Режим рада у авиону

## Power mode

power-profile-title = Режим напајања
power-profile-header = Режим напајања
power-profile-open-menu = Отвори мени режима напајања
power-profile-settings = Подешавања напајања
power-profile-performance = Перформансе
power-profile-balanced = Уравнотежено
power-profile-power-saver = Уштеда енергије
power-profile-custom = Прилагођено

## Keep awake

caffeine-title = Држи будним
caffeine-open-menu = Отвори мени за држање будним
caffeine-until = До { $time }
caffeine-until-turned-off = Док се не искључи
caffeine-30-minutes = 30 минута
caffeine-1-hour = 1 сат
caffeine-2-hours = 2 сата
caffeine-inhibit-reason = Држи будним из брзих подешавања

## Brightness

brightness-title = Осветљеност
brightness-open-menu = Отвори мени осветљености

## Keyboard backlight

backlight-title = Осветљење тастатуре
backlight-open-menu = Отвори мени осветљења тастатуре
backlight-slider = Осветљење тастатуре
backlight-off = Искључено
backlight-low = Слабо
backlight-high = Јако

## Sound

volume-sound-settings = Подешавања звука
volume-mute = Искључи звук
volume-unmute = Укључи звук
volume-output-slider = Јачина звука
volume-output-title = Излаз звука
volume-output-open-menu = Отвори мени излаза звука
volume-input-slider = Микрофон
volume-input-title = Улаз звука
volume-input-open-menu = Отвори мени улаза звука

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Отвори мени за Bluetooth
bluetooth-settings = Подешавања за Bluetooth
bluetooth-connect = Повежи
bluetooth-disconnect = Прекини везу
bluetooth-connect-device = Повежи се са уређајем { $deviceName }
bluetooth-disconnect-device = Прекини везу са уређајем { $deviceName }
bluetooth-no-devices = Нема доступних ни повезаних уређаја
bluetooth-turn-on-hint = Укључите Bluetooth да бисте повезали уређаје
bluetooth-connected-count = { $count ->
    [one] { $count } повезан
    [few] { $count } повезана
   *[other] { $count } повезано
}

## Network menus in quick settings

network-menu-unknown-network = <непозната>
network-menu-connect = Повежи
network-menu-disconnect = Прекини везу
network-menu-connect-to = Повежи се са { $name }
network-menu-disconnect-from = Прекини везу са { $name }
network-menu-turn-off = Искључи
network-menu-wifi-network = { $secure ->
    [yes] { $name }, заштићена, јачина сигнала { $strength }%
   *[no] { $name }, није заштићена, јачина сигнала { $strength }%
}
network-menu-hotspot = Приступна тачка: { $name }
network-menu-connected-count = { $count ->
    [one] { $count } повезана
    [few] { $count } повезане
   *[other] { $count } повезаних
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Отвори мени за VPN
network-menu-vpn-settings = Подешавања за VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Отвори мени за Wi-Fi
network-menu-wifi-settings = Све мреже
network-menu-wired = Жичне везе
network-menu-wired-open-menu = Отвори мени жичних веза
network-menu-wired-settings = Подешавања жичне мреже
network-menu-tethers = Дељење везе преко телефона
network-menu-tethers-open-menu = Отвори мени дељења везе
network-menu-tether = Дељење везе
network-menu-tether-settings = Подешавања за Bluetooth
network-menu-mobile-connections = Мобилне везе
network-menu-mobile-open-menu = Отвори мени мобилних веза
network-menu-mobile-settings = Подешавања мобилног интернета
network-menu-mobile = Мобилни интернет
network-device-wired = Жична веза
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Пријава на мрежу
network-menu-failed-title = Повезивање није успело
network-menu-failed-body = Мрежна веза није могла да се активира

## Location access dialog

location-dialog-title = Дозволити приступ локацији?
location-dialog-description = Апликација { $appName } жели да приступи вашој локацији
location-dialog-info = Приступ локацији можете било када да промените у подешавањима приватности
location-dialog-deny = Забрани приступ
location-dialog-grant = Дозволи приступ

## Thunderbolt notifications

thunderbolt-unknown-title = Непознат Thunderbolt уређај
thunderbolt-unknown-body = Док сте били одсутни, откривен је нови уређај. Искључите га и поново прикључите да бисте почели да га користите.
thunderbolt-unauthorized-title = Неодобрен Thunderbolt уређај
thunderbolt-unauthorized-body = Откривен је нови уређај који администратор мора да одобри
thunderbolt-error-title = Грешка при одобравању Thunderbolt уређаја
thunderbolt-error-body = Thunderbolt уређај није могао да се одобри: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Забрани
access-dialog-allow = Дозволи

## Display change confirmation

display-change-title = Задржати ова подешавања екрана?
display-change-countdown = { $seconds ->
    [one] Промене ће бити враћене за { $seconds } секунду
    [few] Промене ће бити враћене за { $seconds } секунде
   *[other] Промене ће бити враћене за { $seconds } секунди
}
display-change-revert = Врати
display-change-keep = Задржи промене

## Drive connected notification

autorun-connected = Повезан је диск „{ $driveName }“
autorun-ready = Диск је спреман за коришћење
autorun-open-with = Отвори у апликацији { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Спори тастери су укључени
kbd-a11y-slow-keys-off = Спори тастери су искључени
kbd-a11y-slow-keys-description = Управо сте држали тастер Shift 8 секунди. То је пречица за Споре тастере, који мењају начин на који тастатура ради.
kbd-a11y-sticky-keys-on = Лепљиви тастери су укључени
kbd-a11y-sticky-keys-off = Лепљиви тастери су искључени
kbd-a11y-sticky-keys-on-description = Управо сте притиснули тастер Shift 5 пута заредом. То је пречица за Лепљиве тастере, који мењају начин на који тастатура ради.
kbd-a11y-sticky-keys-off-description = Управо сте притиснули два тастера одједном или тастер Shift 5 пута заредом. Тиме се искључују Лепљиви тастери, који мењају начин на који тастатура ради.
kbd-a11y-leave-on = Остави укључено
kbd-a11y-turn-on = Укључи
kbd-a11y-turn-off = Искључи
kbd-a11y-leave-off = Остави искључено

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Изаберите аудио-уређај
audio-device-cancel = Откажи
audio-device-sound-settings = Подешавања звука
audio-device-headphones = Слушалице
audio-device-headset = Слушалице са микрофоном
audio-device-microphone = Микрофон

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Дозволити заобилажење пречица?
inhibit-shortcuts-app = Апликација { $appName } жели да заобиђе системске пречице
inhibit-shortcuts-unknown-app = Једна апликација жели да заобиђе системске пречице
inhibit-shortcuts-restore = Пречице можете да вратите притиском на { $shortcut }
inhibit-shortcuts-deny = Забрани
inhibit-shortcuts-allow = Дозволи

## Unlocking encrypted drives

mount-hidden-volume = Скривени волумен
mount-windows-system-volume = Системски волумен за Windows
mount-uses-keyfiles = Користи датотеке кључева
mount-keyfiles-use-app = Да бисте откључали волумен који користи датотеке кључева, користите апликацију <i>{ $appName }</i>
mount-keyfiles-need-app = За откључавање волумена који користи датотеке кључева потребна је посебна апликација, на пример <i>Дискови</i>
mount-pim-number = PIM број
mount-pim-invalid = PIM мора да буде број или да остане празан
mount-password = Лозинка
mount-remember-password = Запамти лозинку
mount-cancel = Откажи
mount-unlock = Откључај
mount-open-app = Отвори апликацију { $appName }
mount-wrong-password = Није успело. Покушајте поново.
mount-unlock-failed = Волумен није могао да се откључа
mount-pim-unsupported = Инсталирана верзија udisks не подржава PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Потребна је потврда идентитета
network-agent-wifi-rejected = Сачувана лозинка за „{ $networkName }“ није успела. Унесите је поново.
network-agent-wifi-secrets = За приступ бежичној мрежи „{ $networkName }“ потребне су лозинке или кључеви за шифровање
network-agent-wps-hint = Можете се повезати и притиском на дугме „WPS“ на рутеру
network-agent-wired-title = Потврда идентитета за жичну мрежу 802.1X
network-agent-dsl-title = Потврда идентитета за DSL
network-agent-pin-title = Потребан је PIN
network-agent-pin-body = Уређају за мобилни интернет је потребан PIN
network-agent-vpn-title = Лозинка за VPN
network-agent-password-required = За повезивање са „{ $networkName }“ потребна је лозинка
network-agent-connect = Повежи
network-agent-cancel = Откажи
network-agent-password = Лозинка
network-agent-username = Корисничко име
network-agent-key = Кључ
network-agent-private-key-password = Лозинка приватног кључа
network-agent-identity = Идентитет
network-agent-service = Услуга
network-agent-network-name = Назив мреже
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Снимање екрана
screenshot-area = Избор области
screenshot-screen = Избор екрана
screenshot-window = Избор прозора
screenshot-take = Направи снимак екрана
screenshot-record = Сними екран
screenshot-show-pointer = Прикажи показивач
screenshot-capture = Сними
screenshot-close = Затвори
screenshot-screencasts-folder = Видео-снимци екрана
screenshot-screencast-file = Видео-снимак екрана { $date } { $time }
screenshot-screenshots-folder = Снимци екрана
screenshot-file = Снимак екрана { $timestamp }
screenshot-screencast-recorded = Екран је снимљен
screenshot-screencast-start-failed = Снимање екрана није могло да почне
screenshot-screencast-out-of-space = Снимање екрана није успело: нема места на диску
screenshot-screencast-try-again = Снимање екрана није успело, покушајте поново
screenshot-screencast-failed = Снимање екрана није успело
screenshot-screencast-view = Кликните овде да бисте погледали видео
screenshot-show-in-rover = Прикажи у апликацији Rover
screenshot-captured = Снимак екрана је направљен
screenshot-captured-body = Слику можете да налепите из оставе

## System updates
updates-available-title = Доступна су ажурирања система
updates-available-body = Отворите Подешавања да бисте их преузели и инсталирали.
updates-ready-title = Ажурирања су спремна за инсталацију
updates-ready-body = Поново покрените рачунар када вам одговара да бисте их инсталирали.
