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

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ не одговара
close-dialog-description = Можете мало да сачекате да апликација настави са радом или да је принудно затворите
close-dialog-force-quit = Принудно затвори
close-dialog-wait = Сачекај

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Пресликај
switch-monitor-join = Прошири
switch-monitor-external-only = Само спољни
switch-monitor-built-in-only = Само уграђени

## Sign-in prompt

auth-prompt-password = Лозинка
auth-prompt-username = Корисничко име
auth-prompt-back = Назад
auth-prompt-submit = Пошаљи
auth-prompt-wrong-password = Лозинка није тачна
auth-prompt-failed = Није успело. Покушајте поново.
fingerprint-not-recognized = Отисак прста није препознат

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

## Administrator authentication

polkit-title = Потребна је потврда идентитета
polkit-administrator = Администратор
polkit-password = Лозинка
polkit-cancel = Откажи
polkit-authenticate = Потврди
polkit-failed = Није успело. Покушајте поново.

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

## Log out, power off and restart dialog

end-session-log-out-user = Одјава: { $userName }
end-session-log-out-title = Одјава
end-session-log-out-user-countdown = { $seconds ->
    [one] Корисник { $userName } ће аутоматски бити одјављен за { $seconds } секунду
    [few] Корисник { $userName } ће аутоматски бити одјављен за { $seconds } секунде
   *[other] Корисник { $userName } ће аутоматски бити одјављен за { $seconds } секунди
}
end-session-log-out-countdown = { $seconds ->
    [one] Аутоматска одјава за { $seconds } секунду
    [few] Аутоматска одјава за { $seconds } секунде
   *[other] Аутоматска одјава за { $seconds } секунди
}
end-session-log-out-button = Одјави се
end-session-power-off-title = Искључивање
end-session-power-off-updates-title = Инсталирање ажурирања и искључивање
end-session-power-off-countdown = { $seconds ->
    [one] Систем ће се аутоматски искључити за { $seconds } секунду
    [few] Систем ће се аутоматски искључити за { $seconds } секунде
   *[other] Систем ће се аутоматски искључити за { $seconds } секунди
}
end-session-power-off-button = Искључи
end-session-restart-title = Поновно покретање
end-session-restart-updates-title = Инсталирање ажурирања и поновно покретање
end-session-restart-countdown = { $seconds ->
    [one] Систем ће се аутоматски поново покренути за { $seconds } секунду
    [few] Систем ће се аутоматски поново покренути за { $seconds } секунде
   *[other] Систем ће се аутоматски поново покренути за { $seconds } секунди
}
end-session-restart-button = Поново покрени
end-session-update-restart-title = Поновно покретање и инсталирање ажурирања
end-session-update-restart-countdown = { $seconds ->
    [one] Систем ће се аутоматски поново покренути и инсталирати ажурирања за { $seconds } секунду
    [few] Систем ће се аутоматски поново покренути и инсталирати ажурирања за { $seconds } секунде
   *[other] Систем ће се аутоматски поново покренути и инсталирати ажурирања за { $seconds } секунди
}
end-session-update-restart-button = Поново покрени и инсталирај
end-session-install-updates = Инсталирај ажурирања на чекању
end-session-install-version = Инсталирај верзију { $version }
end-session-low-battery = Батерија је скоро празна: прикључите пуњач пре инсталирања ажурирања
end-session-busy-apps = Неке апликације су заузете или имају несачуван рад
end-session-other-users = Пријављени су и други корисници
end-session-cancel = Откажи
end-session-boot-options = Опције покретања
end-session-remote-user = { $userName } (удаљено)
end-session-console-user = { $userName } (конзола)

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

## Lock screen clock

lock-clock-swipe-up = Превуците нагоре
lock-clock-click-or-press = Кликните или притисните тастер

## Notification times

date-just-now = Управо

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Прозори
ctrl-alt-tab-panel = Трака задатака
ctrl-alt-tab-unlock = Прозор за откључавање

## System notifications

messages-system-source = Систем
unsafe-mode-title = Систем је пребачен у небезбедни режим
unsafe-mode-body = Апликације сада имају неограничен приступ
unsafe-mode-undo = Опозови
privileged-user-title = Пријављени сте као привилеговани корисник
privileged-user-body = Из безбедносних разлога избегавајте рад у сесији привилегованог корисника. Ако је могуће, пријавите се као обичан корисник.

## On-screen keyboard

osk-keyboard-settings = Подешавања тастатуре
osk-letters-key = АБВ

## Lock screen

lock-inhibit-reason = Kestrel мора да закључа екран

## Notifications

messages-unknown-app = Непозната апликација
messages-reply = Одговори
messages-reply-placeholder = Напишите одговор
messages-reply-send = Пошаљи

## Media player controls

mpris-unknown-artist = Непознат извођач
mpris-unknown-title = Непознат наслов

## Starting programs

spawn-failed = Покретање „{ $command }“ није успело:

## Text field context menu

entry-menu-copy = Копирај
entry-menu-paste = Налепи
entry-menu-show-text = Прикажи текст
entry-menu-hide-text = Сакриј текст
entry-caps-lock-on = Caps Lock је укључен

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Направи снимак екрана
title-bar-menu-hide = Сакриј
title-bar-menu-restore = Врати
title-bar-menu-maximize = Максимизуј
title-bar-menu-move = Помери
title-bar-menu-resize = Промени величину
title-bar-menu-always-on-top = Увек на врху
title-bar-menu-always-on-visible-workspace = Увек на видљивом радном простору
title-bar-menu-workspace-left = Премести на радни простор лево
title-bar-menu-workspace-right = Премести на радни простор десно
title-bar-menu-workspace-up = Премести на радни простор горе
title-bar-menu-workspace-down = Премести на радни простор доле
title-bar-menu-monitor-up = Премести на екран горе
title-bar-menu-monitor-down = Премести на екран доле
title-bar-menu-monitor-left = Премести на екран лево
title-bar-menu-monitor-right = Премести на екран десно
title-bar-menu-close = Затвори

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
