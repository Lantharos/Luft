## Sign-in screen, shown before anyone signs in

greeter-session = Сеанс
greeter-accessibility = Специальные возможности
greeter-power = Питание
greeter-larger-text = Крупный текст
greeter-screen-reader = Экранный диктор
greeter-suspend = Спящий режим
greeter-restart = Перезагрузить
greeter-power-off = Выключить
greeter-another-account = Другая учётная запись

## Lock screen

lock-screen-accessibility = Специальные возможности
lock-screen-power = Питание
lock-screen-battery = Батарея: { $level }
lock-screen-screen-reader = Экранный диктор
lock-screen-zoom = Экранная лупа
lock-screen-on-screen-keyboard = Экранная клавиатура
lock-screen-high-contrast = Высокая контрастность
lock-screen-dwell-click = Щелчок при наведении
lock-screen-larger-text = Крупный текст
lock-screen-suspend = Спящий режим
lock-screen-restart = Перезагрузить…
lock-screen-power-off = Выключить…
lock-inhibit-reason = Kestrel нужно заблокировать экран

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Сохранить в связке ключей
keyring-remember-for-app = Запомнить для этого приложения
keyring-fingerprint-allow = Прикоснитесь к сканеру отпечатков, чтобы разрешить
keyring-fingerprint-alternative = Или прикоснитесь к сканеру отпечатков
keyring-confirm = Подтверждение
keyring-allow = Разрешить
keyring-deny = Не разрешать
keyring-password = Пароль
keyring-mismatch = Пароли не совпадают
keyring-unlock = Разблокировать
keyring-cancel = Отмена

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Создать ключ доступа для { $site }?
passkeys-register-account-by-app = Приложение { $app } хочет сохранить ключ доступа для { $account }. Ключ останется на этом компьютере.
passkeys-register-account = Приложение хочет сохранить ключ доступа для { $account }. Ключ останется на этом компьютере.
passkeys-register-by-app = Приложение { $app } хочет сохранить ключ доступа. Ключ останется на этом компьютере.
passkeys-register = Приложение хочет сохранить ключ доступа. Ключ останется на этом компьютере.
passkeys-sign-in-title = Войти на { $site } с ключом доступа?
passkeys-sign-in-choose-by-app = Приложение { $app } запрашивает ключ доступа. Выберите учётную запись для входа.
passkeys-sign-in-choose = Приложение запрашивает ключ доступа. Выберите учётную запись для входа.
passkeys-sign-in-by-app = Приложение { $app } запрашивает ваш ключ доступа.
passkeys-sign-in = Приложение запрашивает ваш ключ доступа.
passkeys-manage-title-by-app = Разрешить приложению { $app } управлять вашими ключами доступа?
passkeys-manage-title = Разрешить этому приложению управлять вашими ключами доступа?
passkeys-manage-description = Оно увидит, для каких сайтов у вас есть ключи доступа, и сможет удалять их.
passkeys-registered-title = У вас уже есть ключ доступа для { $site }
passkeys-registered-description = Войдите с помощью существующего ключа.
passkeys-choose-title = Использовать ключи доступа на этом компьютере?
passkeys-choose-by-app = Приложение { $app } спрашивает, где находится ваш ключ доступа.
passkeys-choose = Приложение спрашивает, где находится ваш ключ доступа.
passkeys-use-password = Ввести пароль
passkeys-password = Пароль
passkeys-cancel = Отмена
passkeys-continue = Продолжить
passkeys-ok = ОК
passkeys-use-this-computer = Использовать этот компьютер
passkeys-fingerprint-unavailable = Введите пароль, чтобы продолжить.
passkeys-wrong-password = Неверный пароль. Попробуйте ещё раз.

## Sign-in prompt

auth-prompt-password = Пароль
auth-prompt-username = Имя пользователя
auth-prompt-back = Назад
auth-prompt-submit = Подтвердить
auth-prompt-wrong-password = Неверный пароль
auth-prompt-failed = Не получилось. Попробуйте ещё раз.
fingerprint-not-recognized = Отпечаток не распознан
fingerprint-scanning = Прикоснитесь к сканеру отпечатков
fingerprint-retry-scan = Отсканируйте палец ещё раз
fingerprint-swipe-too-short = Слишком короткое движение, попробуйте ещё раз
fingerprint-finger-not-centered = Положите палец по центру и попробуйте ещё раз
fingerprint-remove-and-retry = Поднимите палец и попробуйте ещё раз
fingerprint-unavailable = Отпечаток недоступен, введите пароль
auth-prompt-use-password = Ввести пароль
auth-prompt-try-fingerprint = Попробовать отпечаток ещё раз
auth-prompt-use-fingerprint = Использовать отпечаток
auth-prompt-show-password = Показать пароль

## Administrator authentication

polkit-title = Требуется подтверждение
polkit-administrator = Администратор
polkit-password = Пароль
polkit-cancel = Отмена
polkit-authenticate = Подтвердить
polkit-failed = Не получилось. Попробуйте ещё раз.

## Log out, power off and restart dialog

end-session-log-out-user = Выход: { $userName }
end-session-log-out-title = Выход
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName }: автоматический выход через { $seconds } секунду
    [few] { $userName }: автоматический выход через { $seconds } секунды
    [many] { $userName }: автоматический выход через { $seconds } секунд
   *[other] { $userName }: автоматический выход через { $seconds } секунды
}
end-session-log-out-countdown = { $seconds ->
    [one] Автоматический выход через { $seconds } секунду
    [few] Автоматический выход через { $seconds } секунды
    [many] Автоматический выход через { $seconds } секунд
   *[other] Автоматический выход через { $seconds } секунды
}
end-session-log-out-button = Выйти
end-session-power-off-title = Выключение
end-session-power-off-updates-title = Установить обновления и выключить
end-session-power-off-countdown = { $seconds ->
    [one] Компьютер автоматически выключится через { $seconds } секунду
    [few] Компьютер автоматически выключится через { $seconds } секунды
    [many] Компьютер автоматически выключится через { $seconds } секунд
   *[other] Компьютер автоматически выключится через { $seconds } секунды
}
end-session-power-off-button = Выключить
end-session-restart-title = Перезагрузка
end-session-restart-updates-title = Установить обновления и перезагрузить
end-session-restart-countdown = { $seconds ->
    [one] Компьютер автоматически перезагрузится через { $seconds } секунду
    [few] Компьютер автоматически перезагрузится через { $seconds } секунды
    [many] Компьютер автоматически перезагрузится через { $seconds } секунд
   *[other] Компьютер автоматически перезагрузится через { $seconds } секунды
}
end-session-restart-button = Перезагрузить
end-session-update-restart-title = Перезагрузить и установить обновления
end-session-update-restart-countdown = { $seconds ->
    [one] Через { $seconds } секунду компьютер автоматически перезагрузится и установит обновления
    [few] Через { $seconds } секунды компьютер автоматически перезагрузится и установит обновления
    [many] Через { $seconds } секунд компьютер автоматически перезагрузится и установит обновления
   *[other] Через { $seconds } секунды компьютер автоматически перезагрузится и установит обновления
}
end-session-update-restart-button = Перезагрузить и установить
end-session-install-updates = Установить ожидающие обновления
end-session-install-version = Установить версию { $version }
end-session-version-nightly = { $release } ночная сборка { $number }
end-session-low-battery = Низкий заряд батареи. Подключите питание перед установкой обновлений
end-session-busy-apps = Некоторые приложения заняты или содержат несохранённые данные
end-session-other-users = В системе работают другие пользователи
end-session-cancel = Отмена
end-session-boot-options = Параметры загрузки
end-session-remote-user = { $userName } (удалённо)
end-session-console-user = { $userName } (консоль)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Окно разблокировки
