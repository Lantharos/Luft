## Sign-in screen, shown before anyone signs in

greeter-session = Сесия
greeter-accessibility = Достъпност
greeter-power = Захранване
greeter-larger-text = По-едър текст
greeter-screen-reader = Екранен четец
greeter-suspend = Заспиване
greeter-restart = Рестартиране
greeter-power-off = Изключване
greeter-another-account = Друг акаунт

## Lock screen

lock-screen-accessibility = Достъпност
lock-screen-power = Захранване
lock-screen-battery = Батерия { $level }
lock-screen-screen-reader = Екранен четец
lock-screen-zoom = Увеличение
lock-screen-on-screen-keyboard = Екранна клавиатура
lock-screen-high-contrast = Висок контраст
lock-screen-dwell-click = Щракване при задържане
lock-screen-larger-text = По-едър текст
lock-screen-suspend = Заспиване
lock-screen-restart = Рестартиране…
lock-screen-power-off = Изключване…
lock-inhibit-reason = Kestrel трябва да заключи екрана

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Запази в ключодържателя
keyring-remember-for-app = Запомни за това приложение
keyring-fingerprint-allow = Докоснете четеца на отпечатъци, за да разрешите
keyring-fingerprint-alternative = Или докоснете четеца на отпечатъци
keyring-confirm = Потвърждение
keyring-allow = Разреши
keyring-deny = Не разрешавай
keyring-password = Парола
keyring-mismatch = Въведените пароли не съвпадат
keyring-unlock = Отключи
keyring-cancel = Отказ

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Да се създаде ли ключ за достъп за { $site }?
passkeys-register-account-by-app = Приложението { $app } иска да запази ключ за достъп за { $account }. Той остава на този компютър.
passkeys-register-account = Приложение иска да запази ключ за достъп за { $account }. Той остава на този компютър.
passkeys-register-by-app = Приложението { $app } иска да запази ключ за достъп. Той остава на този компютър.
passkeys-register = Приложение иска да запази ключ за достъп. Той остава на този компютър.
passkeys-sign-in-title = Да се влезе ли в { $site } с ключа ви за достъп?
passkeys-sign-in-choose-by-app = Приложението { $app } иска ключ за достъп. Изберете акаунта, с който да влезете.
passkeys-sign-in-choose = Приложение иска ключ за достъп. Изберете акаунта, с който да влезете.
passkeys-sign-in-by-app = Приложението { $app } иска ключа ви за достъп.
passkeys-sign-in = Приложение иска ключа ви за достъп.
passkeys-manage-title-by-app = Да се разреши ли на приложението { $app } да управлява ключовете ви за достъп?
passkeys-manage-title = Да се разреши ли на това приложение да управлява ключовете ви за достъп?
passkeys-manage-description = То ще вижда за кои сайтове имате ключове за достъп и ще може да ги премахва.
passkeys-registered-title = Вече имате ключ за достъп за { $site }
passkeys-registered-description = Влезте с него.
passkeys-choose-title = Да се използват ли ключовете за достъп на този компютър?
passkeys-choose-by-app = Приложението { $app } пита къде е ключът ви за достъп.
passkeys-choose = Приложение пита къде е ключът ви за достъп.
passkeys-use-password = Използвай парола
passkeys-password = Парола
passkeys-cancel = Отказ
passkeys-continue = Продължи
passkeys-ok = OK
passkeys-use-this-computer = Използвай този компютър
passkeys-fingerprint-unavailable = Използвайте паролата си, за да продължите.
passkeys-wrong-password = Паролата не е вярна. Опитайте отново.

## Sign-in prompt

auth-prompt-password = Парола
auth-prompt-username = Потребителско име
auth-prompt-back = Назад
auth-prompt-submit = Изпрати
auth-prompt-wrong-password = Паролата не е вярна
auth-prompt-failed = Не се получи. Опитайте отново.
fingerprint-not-recognized = Отпечатъкът не е разпознат

## Administrator authentication

polkit-title = Изисква се удостоверяване
polkit-administrator = Администратор
polkit-password = Парола
polkit-cancel = Отказ
polkit-authenticate = Удостовери
polkit-failed = Не се получи. Опитайте отново.

## Log out, power off and restart dialog

end-session-log-out-user = Изход на { $userName }
end-session-log-out-title = Изход
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } ще излезе автоматично след { $seconds } секунда
   *[other] { $userName } ще излезе автоматично след { $seconds } секунди
}
end-session-log-out-countdown = { $seconds ->
    [one] Ще излезете автоматично след { $seconds } секунда
   *[other] Ще излезете автоматично след { $seconds } секунди
}
end-session-log-out-button = Изход
end-session-power-off-title = Изключване
end-session-power-off-updates-title = Инсталиране на актуализациите и изключване
end-session-power-off-countdown = { $seconds ->
    [one] Системата ще се изключи автоматично след { $seconds } секунда
   *[other] Системата ще се изключи автоматично след { $seconds } секунди
}
end-session-power-off-button = Изключи
end-session-restart-title = Рестартиране
end-session-restart-updates-title = Инсталиране на актуализациите и рестартиране
end-session-restart-countdown = { $seconds ->
    [one] Системата ще се рестартира автоматично след { $seconds } секунда
   *[other] Системата ще се рестартира автоматично след { $seconds } секунди
}
end-session-restart-button = Рестартирай
end-session-update-restart-title = Рестартиране и инсталиране на актуализациите
end-session-update-restart-countdown = { $seconds ->
    [one] Системата ще се рестартира автоматично и ще инсталира актуализациите след { $seconds } секунда
   *[other] Системата ще се рестартира автоматично и ще инсталира актуализациите след { $seconds } секунди
}
end-session-update-restart-button = Рестартирай и инсталирай
end-session-install-updates = Инсталиране на чакащите софтуерни актуализации
end-session-install-version = Инсталиране на версия { $version }
end-session-version-nightly = { $release } нощна версия { $number }
end-session-low-battery = Батерията е слаба. Включете захранването, преди да инсталирате актуализации.
end-session-busy-apps = Някои приложения са заети или имат незапазена работа
end-session-other-users = Влезли са и други потребители
end-session-cancel = Отказ
end-session-boot-options = Опции за зареждане
end-session-remote-user = { $userName } (отдалечено)
end-session-console-user = { $userName } (конзола)

## Lock screen clock

lock-clock-swipe-up = Плъзнете нагоре
lock-clock-click-or-press = Щракнете или натиснете клавиш

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Прозорец за отключване
