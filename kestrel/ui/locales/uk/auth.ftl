## Sign-in screen, shown before anyone signs in

greeter-session = Сеанс
greeter-accessibility = Спеціальні можливості
greeter-power = Живлення
greeter-larger-text = Більший текст
greeter-screen-reader = Читач екрана
greeter-suspend = Сплячий режим
greeter-restart = Перезавантажити
greeter-power-off = Вимкнути
greeter-another-account = Інший обліковий запис

## Lock screen

lock-screen-accessibility = Спеціальні можливості
lock-screen-power = Живлення
lock-screen-battery = Акумулятор { $level }
lock-screen-screen-reader = Читач екрана
lock-screen-zoom = Лупа
lock-screen-on-screen-keyboard = Екранна клавіатура
lock-screen-high-contrast = Висока контрастність
lock-screen-dwell-click = Клацання наведенням
lock-screen-larger-text = Більший текст
lock-screen-suspend = Сплячий режим
lock-screen-restart = Перезавантажити…
lock-screen-power-off = Вимкнути…
lock-inhibit-reason = Kestrel має заблокувати екран

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Зберегти у в’язці ключів
keyring-remember-for-app = Запам’ятати для цієї програми
keyring-fingerprint-allow = Торкніться сканера відбитків, щоб дозволити
keyring-fingerprint-alternative = Або торкніться сканера відбитків
keyring-confirm = Підтвердження
keyring-allow = Дозволити
keyring-deny = Не дозволяти
keyring-password = Пароль
keyring-mismatch = Введені значення не збігаються
keyring-unlock = Розблокувати
keyring-cancel = Скасувати

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Створити ключ доступу для { $site }?
passkeys-register-account-by-app = { $app } хоче зберегти ключ доступу для { $account }. Він залишиться на цьому комп’ютері.
passkeys-register-account = Програма хоче зберегти ключ доступу для { $account }. Він залишиться на цьому комп’ютері.
passkeys-register-by-app = { $app } хоче зберегти ключ доступу. Він залишиться на цьому комп’ютері.
passkeys-register = Програма хоче зберегти ключ доступу. Він залишиться на цьому комп’ютері.
passkeys-sign-in-title = Увійти на { $site } за допомогою ключа доступу?
passkeys-sign-in-choose-by-app = { $app } запитує ключ доступу. Виберіть обліковий запис для входу.
passkeys-sign-in-choose = Програма запитує ключ доступу. Виберіть обліковий запис для входу.
passkeys-sign-in-by-app = { $app } запитує ваш ключ доступу.
passkeys-sign-in = Програма запитує ваш ключ доступу.
passkeys-manage-title-by-app = Дозволити { $app } керувати вашими ключами доступу?
passkeys-manage-title = Дозволити цій програмі керувати вашими ключами доступу?
passkeys-manage-description = Вона бачитиме, для яких сайтів у вас є ключі доступу, і зможе їх вилучати.
passkeys-registered-title = У вас уже є ключ доступу для { $site }
passkeys-registered-description = Увійдіть за допомогою наявного ключа.
passkeys-choose-title = Використати ключі доступу на цьому комп’ютері?
passkeys-choose-by-app = { $app } запитує, де зберігається ваш ключ доступу.
passkeys-choose = Програма запитує, де зберігається ваш ключ доступу.
passkeys-use-password = Використати пароль
passkeys-password = Пароль
passkeys-cancel = Скасувати
passkeys-continue = Продовжити
passkeys-ok = OK
passkeys-use-this-computer = Використати цей комп’ютер
passkeys-fingerprint-unavailable = Щоб продовжити, введіть пароль.
passkeys-wrong-password = Неправильний пароль. Спробуйте ще раз.

## Sign-in prompt

auth-prompt-password = Пароль
auth-prompt-username = Ім’я користувача
auth-prompt-back = Назад
auth-prompt-submit = Надіслати
auth-prompt-wrong-password = Неправильний пароль
auth-prompt-failed = Не вдалося. Спробуйте ще раз.
fingerprint-not-recognized = Відбиток пальця не розпізнано

## Administrator authentication

polkit-title = Потрібна автентифікація
polkit-administrator = Адміністратор
polkit-password = Пароль
polkit-cancel = Скасувати
polkit-authenticate = Підтвердити
polkit-failed = Не вдалося. Спробуйте ще раз.

## Log out, power off and restart dialog

end-session-log-out-user = Вихід: { $userName }
end-session-log-out-title = Вийти
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName }: автоматичний вихід через { $seconds } секунду
    [few] { $userName }: автоматичний вихід через { $seconds } секунди
    [many] { $userName }: автоматичний вихід через { $seconds } секунд
   *[other] { $userName }: автоматичний вихід через { $seconds } секунди
}
end-session-log-out-countdown = { $seconds ->
    [one] Автоматичний вихід через { $seconds } секунду
    [few] Автоматичний вихід через { $seconds } секунди
    [many] Автоматичний вихід через { $seconds } секунд
   *[other] Автоматичний вихід через { $seconds } секунди
}
end-session-log-out-button = Вийти
end-session-power-off-title = Вимкнути
end-session-power-off-updates-title = Встановити оновлення й вимкнути
end-session-power-off-countdown = { $seconds ->
    [one] Комп’ютер автоматично вимкнеться через { $seconds } секунду
    [few] Комп’ютер автоматично вимкнеться через { $seconds } секунди
    [many] Комп’ютер автоматично вимкнеться через { $seconds } секунд
   *[other] Комп’ютер автоматично вимкнеться через { $seconds } секунди
}
end-session-power-off-button = Вимкнути
end-session-restart-title = Перезавантажити
end-session-restart-updates-title = Встановити оновлення й перезавантажити
end-session-restart-countdown = { $seconds ->
    [one] Комп’ютер автоматично перезавантажиться через { $seconds } секунду
    [few] Комп’ютер автоматично перезавантажиться через { $seconds } секунди
    [many] Комп’ютер автоматично перезавантажиться через { $seconds } секунд
   *[other] Комп’ютер автоматично перезавантажиться через { $seconds } секунди
}
end-session-restart-button = Перезавантажити
end-session-update-restart-title = Перезавантажити і встановити оновлення
end-session-update-restart-countdown = { $seconds ->
    [one] Комп’ютер автоматично перезавантажиться і встановить оновлення через { $seconds } секунду
    [few] Комп’ютер автоматично перезавантажиться і встановить оновлення через { $seconds } секунди
    [many] Комп’ютер автоматично перезавантажиться і встановить оновлення через { $seconds } секунд
   *[other] Комп’ютер автоматично перезавантажиться і встановить оновлення через { $seconds } секунди
}
end-session-update-restart-button = Перезавантажити і встановити
end-session-install-updates = Встановити наявні оновлення
end-session-install-version = Встановити версію { $version }
end-session-low-battery = Низький заряд акумулятора: перед встановленням оновлень під’єднайте живлення
end-session-busy-apps = Деякі програми зайняті або мають незбережені зміни
end-session-other-users = У системі є інші користувачі
end-session-cancel = Скасувати
end-session-boot-options = Параметри завантаження
end-session-remote-user = { $userName } (віддалено)
end-session-console-user = { $userName } (консоль)

## Lock screen clock

lock-clock-swipe-up = Проведіть угору
lock-clock-click-or-press = Клацніть або натисніть будь-яку клавішу

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Вікно розблокування
