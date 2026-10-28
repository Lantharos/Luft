## Sign-in screen, shown before anyone signs in

greeter-session = Сесија
greeter-accessibility = Приступачност
greeter-power = Напајање
greeter-larger-text = Већи текст
greeter-screen-reader = Читач екрана
greeter-suspend = Спавање
greeter-restart = Поново покрени
greeter-power-off = Искључи
greeter-another-account = Други налог

## Lock screen

lock-screen-accessibility = Приступачност
lock-screen-power = Напајање
lock-screen-battery = Батерија { $level }
lock-screen-screen-reader = Читач екрана
lock-screen-zoom = Лупа
lock-screen-on-screen-keyboard = Тастатура на екрану
lock-screen-high-contrast = Висок контраст
lock-screen-dwell-click = Клик задржавањем
lock-screen-larger-text = Већи текст
lock-screen-suspend = Спавање
lock-screen-restart = Поново покрени…
lock-screen-power-off = Искључи…
lock-inhibit-reason = Kestrel мора да закључа екран

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Сачувај у привеску кључева
keyring-remember-for-app = Запамти за ову апликацију
keyring-fingerprint-allow = Додирните читач отиска прста да бисте дозволили
keyring-fingerprint-alternative = Или додирните читач отиска прста
keyring-confirm = Потврдите
keyring-allow = Дозволи
keyring-deny = Не дозволи
keyring-password = Лозинка
keyring-mismatch = Уноси се не подударају
keyring-unlock = Откључај
keyring-cancel = Откажи

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Направити приступни кључ за { $site }?
passkeys-register-account-by-app = { $app } жели да сачува приступни кључ за { $account }. Он остаје на овом рачунару.
passkeys-register-account = Апликација жели да сачува приступни кључ за { $account }. Он остаје на овом рачунару.
passkeys-register-by-app = { $app } жели да сачува приступни кључ. Он остаје на овом рачунару.
passkeys-register = Апликација жели да сачува приступни кључ. Он остаје на овом рачунару.
passkeys-sign-in-title = Пријавити се на { $site } приступним кључем?
passkeys-sign-in-choose-by-app = { $app } тражи приступни кључ. Изаберите налог којим ћете се пријавити.
passkeys-sign-in-choose = Апликација тражи приступни кључ. Изаберите налог којим ћете се пријавити.
passkeys-sign-in-by-app = { $app } тражи ваш приступни кључ.
passkeys-sign-in = Апликација тражи ваш приступни кључ.
passkeys-manage-title-by-app = Дозволити да { $app } управља вашим приступним кључевима?
passkeys-manage-title = Дозволити овој апликацији да управља вашим приступним кључевима?
passkeys-manage-description = Видеће за које сајтове имате приступне кључеве и моћи ће да их уклони.
passkeys-registered-title = Већ имате приступни кључ за { $site }
passkeys-registered-description = Уместо тога се пријавите оним који већ имате.
passkeys-choose-title = Користити приступне кључеве са овог рачунара?
passkeys-choose-by-app = { $app } пита где се налази ваш приступни кључ.
passkeys-choose = Апликација пита где се налази ваш приступни кључ.
passkeys-use-password = Користи лозинку
passkeys-password = Лозинка
passkeys-cancel = Откажи
passkeys-continue = Настави
passkeys-ok = У реду
passkeys-use-this-computer = Користи овај рачунар
passkeys-fingerprint-unavailable = Унесите лозинку да бисте наставили.
passkeys-wrong-password = Лозинка није тачна. Покушајте поново.

## Sign-in prompt

auth-prompt-password = Лозинка
auth-prompt-username = Корисничко име
auth-prompt-back = Назад
auth-prompt-submit = Пошаљи
auth-prompt-wrong-password = Лозинка није тачна
auth-prompt-failed = Није успело. Покушајте поново.
fingerprint-not-recognized = Отисак прста није препознат
fingerprint-scanning = Додирните читач отиска прста
fingerprint-retry-scan = Поново скенирајте прст
fingerprint-swipe-too-short = Превлачење је било прекратко, покушајте поново
fingerprint-finger-not-centered = Ставите прст у средину и покушајте поново
fingerprint-remove-and-retry = Подигните прст и покушајте поново
fingerprint-unavailable = Отисак прста није доступан, унесите лозинку
auth-prompt-use-password = Користи лозинку
auth-prompt-try-fingerprint = Покушај поново отиском прста
auth-prompt-use-fingerprint = Користи отисак прста
auth-prompt-show-password = Прикажи лозинку

## Administrator authentication

polkit-title = Потребна је потврда идентитета
polkit-administrator = Администратор
polkit-password = Лозинка
polkit-cancel = Откажи
polkit-authenticate = Потврди
polkit-failed = Није успело. Покушајте поново.

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
end-session-version-nightly = { $release } ноћна верзија { $number }
end-session-low-battery = Батерија је скоро празна: прикључите пуњач пре инсталирања ажурирања
end-session-busy-apps = Неке апликације су заузете или имају несачуван рад
end-session-other-users = Пријављени су и други корисници
end-session-cancel = Откажи
end-session-boot-options = Опције покретања
end-session-remote-user = { $userName } (удаљено)
end-session-console-user = { $userName } (конзола)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Прозор за откључавање
