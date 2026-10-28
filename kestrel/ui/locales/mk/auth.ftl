## Sign-in screen, shown before anyone signs in

greeter-session = Сесија
greeter-accessibility = Пристапност
greeter-power = Напојување
greeter-larger-text = Поголем текст
greeter-screen-reader = Читач на екран
greeter-suspend = Спиење
greeter-restart = Рестартирај
greeter-power-off = Исклучи
greeter-another-account = Друга сметка

## Lock screen

lock-screen-accessibility = Пристапност
lock-screen-power = Напојување
lock-screen-battery = Батерија { $level }
lock-screen-screen-reader = Читач на екран
lock-screen-zoom = Зумирање
lock-screen-on-screen-keyboard = Тастатура на екранот
lock-screen-high-contrast = Висок контраст
lock-screen-dwell-click = Клик со задржување
lock-screen-larger-text = Поголем текст
lock-screen-suspend = Спиење
lock-screen-restart = Рестартирај…
lock-screen-power-off = Исклучи…
lock-inhibit-reason = Kestrel треба да го заклучи екранот

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Зачувај во привезокот за клучеви
keyring-remember-for-app = Запомни за оваа апликација
keyring-fingerprint-allow = Допрете го читачот на отпечатоци од прсти за да дозволите
keyring-fingerprint-alternative = Или допрете го читачот на отпечатоци од прсти
keyring-confirm = Потврди
keyring-allow = Дозволи
keyring-deny = Не дозволувај
keyring-password = Лозинка
keyring-mismatch = Внесовите не се совпаѓаат
keyring-unlock = Отклучи
keyring-cancel = Откажи

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Да се создаде клуч за пристап за { $site }?
passkeys-register-account-by-app = Апликацијата { $app } сака да зачува клуч за пристап за { $account }. Тој останува на овој компјутер.
passkeys-register-account = Една апликација сака да зачува клуч за пристап за { $account }. Тој останува на овој компјутер.
passkeys-register-by-app = Апликацијата { $app } сака да зачува клуч за пристап. Тој останува на овој компјутер.
passkeys-register = Една апликација сака да зачува клуч за пристап. Тој останува на овој компјутер.
passkeys-sign-in-title = Да се најавите на { $site } со клучот за пристап?
passkeys-sign-in-choose-by-app = Апликацијата { $app } бара клуч за пристап. Изберете со која сметка да се најавите.
passkeys-sign-in-choose = Една апликација бара клуч за пристап. Изберете со која сметка да се најавите.
passkeys-sign-in-by-app = Апликацијата { $app } го бара вашиот клуч за пристап.
passkeys-sign-in = Една апликација го бара вашиот клуч за пристап.
passkeys-manage-title-by-app = Да може апликацијата { $app } да управува со вашите клучеви за пристап?
passkeys-manage-title = Да може оваа апликација да управува со вашите клучеви за пристап?
passkeys-manage-description = Ќе види за кои страници имате клучеви за пристап и ќе може да ги отстранува.
passkeys-registered-title = Веќе имате клуч за пристап за { $site }
passkeys-registered-description = Наместо тоа, најавете се со постојниот.
passkeys-choose-title = Да се користат клучевите за пристап на овој компјутер?
passkeys-choose-by-app = Апликацијата { $app } прашува каде е вашиот клуч за пристап.
passkeys-choose = Една апликација прашува каде е вашиот клуч за пристап.
passkeys-use-password = Користи лозинка
passkeys-password = Лозинка
passkeys-cancel = Откажи
passkeys-continue = Продолжи
passkeys-ok = Во ред
passkeys-use-this-computer = Користи го овој компјутер
passkeys-fingerprint-unavailable = Користете ја лозинката за да продолжите.
passkeys-wrong-password = Лозинката не е точна. Обидете се повторно.

## Sign-in prompt

auth-prompt-password = Лозинка
auth-prompt-username = Корисничко име
auth-prompt-back = Назад
auth-prompt-submit = Потврди
auth-prompt-wrong-password = Лозинката не е точна
auth-prompt-failed = Не успеа. Обидете се повторно.
fingerprint-not-recognized = Отпечатокот од прст не е препознаен
fingerprint-scanning = Допрете го читачот на отпечатоци од прсти
fingerprint-retry-scan = Скенирајте го прстот повторно
fingerprint-swipe-too-short = Повлекувањето беше прекратко, обидете се повторно
fingerprint-finger-not-centered = Ставете го прстот во средина и обидете се повторно
fingerprint-remove-and-retry = Подигнете го прстот и обидете се повторно
fingerprint-unavailable = Отпечатокот од прст не е достапен, внесете ја лозинката
auth-prompt-use-password = Користи лозинка
auth-prompt-try-fingerprint = Обиди се повторно со отпечаток
auth-prompt-use-fingerprint = Користи отпечаток
auth-prompt-show-password = Прикажи ја лозинката

## Administrator authentication

polkit-title = Потребна е потврда
polkit-administrator = Администратор
polkit-password = Лозинка
polkit-cancel = Откажи
polkit-authenticate = Потврди
polkit-failed = Не успеа. Обидете се повторно.

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
end-session-version-nightly = { $release } ноќна верзија { $number }
end-session-low-battery = Батеријата е слаба. Приклучете го компјутерот на струја пред да инсталирате ажурирања.
end-session-busy-apps = Некои апликации се зафатени или имаат незачувана работа
end-session-other-users = Најавени се и други корисници
end-session-cancel = Откажи
end-session-boot-options = Опции за подигање
end-session-remote-user = { $userName } (од далечина)
end-session-console-user = { $userName } (конзола)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Прозорец за отклучување
