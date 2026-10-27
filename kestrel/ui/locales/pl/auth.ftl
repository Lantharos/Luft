## Sign-in screen, shown before anyone signs in

greeter-session = Sesja
greeter-accessibility = Ułatwienia dostępu
greeter-power = Zasilanie
greeter-larger-text = Większy tekst
greeter-screen-reader = Czytnik ekranu
greeter-suspend = Uśpij
greeter-restart = Uruchom ponownie
greeter-power-off = Wyłącz
greeter-another-account = Inne konto

## Lock screen

lock-screen-accessibility = Ułatwienia dostępu
lock-screen-power = Zasilanie
lock-screen-battery = Bateria { $level }
lock-screen-screen-reader = Czytnik ekranu
lock-screen-zoom = Lupa
lock-screen-on-screen-keyboard = Klawiatura ekranowa
lock-screen-high-contrast = Wysoki kontrast
lock-screen-dwell-click = Kliknięcie przez zatrzymanie
lock-screen-larger-text = Większy tekst
lock-screen-suspend = Uśpij
lock-screen-restart = Uruchom ponownie…
lock-screen-power-off = Wyłącz…
lock-inhibit-reason = Kestrel musi zablokować ekran

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Zapisz w pęku kluczy
keyring-remember-for-app = Zapamiętaj dla tej aplikacji
keyring-fingerprint-allow = Dotknij czytnika linii papilarnych, aby zezwolić
keyring-fingerprint-alternative = Lub dotknij czytnika linii papilarnych
keyring-confirm = Potwierdź
keyring-allow = Zezwól
keyring-deny = Nie zezwalaj
keyring-password = Hasło
keyring-mismatch = Wpisy nie są zgodne
keyring-unlock = Odblokuj
keyring-cancel = Anuluj

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Utworzyć klucz dostępu dla witryny { $site }?
passkeys-register-account-by-app = { $app } chce zapisać klucz dostępu dla konta { $account }. Pozostanie on na tym komputerze.
passkeys-register-account = Aplikacja chce zapisać klucz dostępu dla konta { $account }. Pozostanie on na tym komputerze.
passkeys-register-by-app = { $app } chce zapisać klucz dostępu. Pozostanie on na tym komputerze.
passkeys-register = Aplikacja chce zapisać klucz dostępu. Pozostanie on na tym komputerze.
passkeys-sign-in-title = Zalogować się do witryny { $site } kluczem dostępu?
passkeys-sign-in-choose-by-app = { $app } prosi o klucz dostępu. Wybierz konto, na które chcesz się zalogować.
passkeys-sign-in-choose = Aplikacja prosi o klucz dostępu. Wybierz konto, na które chcesz się zalogować.
passkeys-sign-in-by-app = { $app } prosi o twój klucz dostępu.
passkeys-sign-in = Aplikacja prosi o twój klucz dostępu.
passkeys-manage-title-by-app = Zezwolić aplikacji { $app } na zarządzanie kluczami dostępu?
passkeys-manage-title = Zezwolić tej aplikacji na zarządzanie kluczami dostępu?
passkeys-manage-description = Aplikacja zobaczy, dla których witryn masz klucze dostępu, i będzie mogła je usuwać.
passkeys-registered-title = Masz już klucz dostępu dla witryny { $site }
passkeys-registered-description = Zaloguj się za pomocą istniejącego klucza.
passkeys-choose-title = Użyć kluczy dostępu z tego komputera?
passkeys-choose-by-app = { $app } pyta, gdzie jest twój klucz dostępu.
passkeys-choose = Aplikacja pyta, gdzie jest twój klucz dostępu.
passkeys-use-password = Użyj hasła
passkeys-password = Hasło
passkeys-cancel = Anuluj
passkeys-continue = Kontynuuj
passkeys-ok = OK
passkeys-use-this-computer = Użyj tego komputera
passkeys-fingerprint-unavailable = Aby kontynuować, użyj hasła.
passkeys-wrong-password = Nieprawidłowe hasło. Spróbuj ponownie.

## Sign-in prompt

auth-prompt-password = Hasło
auth-prompt-username = Nazwa użytkownika
auth-prompt-back = Wstecz
auth-prompt-submit = Wyślij
auth-prompt-wrong-password = Nieprawidłowe hasło
auth-prompt-failed = Nie udało się. Spróbuj ponownie.
fingerprint-not-recognized = Nie rozpoznano odcisku palca

## Administrator authentication

polkit-title = Wymagane uwierzytelnienie
polkit-administrator = Administrator
polkit-password = Hasło
polkit-cancel = Anuluj
polkit-authenticate = Uwierzytelnij
polkit-failed = Nie udało się. Spróbuj ponownie.

## Log out, power off and restart dialog

end-session-log-out-user = Wyloguj użytkownika { $userName }
end-session-log-out-title = Wyloguj się
end-session-log-out-user-countdown = { $seconds ->
    [one] Automatyczne wylogowanie użytkownika { $userName } za { $seconds } sekundę
    [few] Automatyczne wylogowanie użytkownika { $userName } za { $seconds } sekundy
    [many] Automatyczne wylogowanie użytkownika { $userName } za { $seconds } sekund
   *[other] Automatyczne wylogowanie użytkownika { $userName } za { $seconds } sekundy
}
end-session-log-out-countdown = { $seconds ->
    [one] Automatyczne wylogowanie za { $seconds } sekundę
    [few] Automatyczne wylogowanie za { $seconds } sekundy
    [many] Automatyczne wylogowanie za { $seconds } sekund
   *[other] Automatyczne wylogowanie za { $seconds } sekundy
}
end-session-log-out-button = Wyloguj się
end-session-power-off-title = Wyłącz
end-session-power-off-updates-title = Zainstaluj aktualizacje i wyłącz
end-session-power-off-countdown = { $seconds ->
    [one] System zostanie automatycznie wyłączony za { $seconds } sekundę
    [few] System zostanie automatycznie wyłączony za { $seconds } sekundy
    [many] System zostanie automatycznie wyłączony za { $seconds } sekund
   *[other] System zostanie automatycznie wyłączony za { $seconds } sekundy
}
end-session-power-off-button = Wyłącz
end-session-restart-title = Uruchom ponownie
end-session-restart-updates-title = Zainstaluj aktualizacje i uruchom ponownie
end-session-restart-countdown = { $seconds ->
    [one] System zostanie automatycznie uruchomiony ponownie za { $seconds } sekundę
    [few] System zostanie automatycznie uruchomiony ponownie za { $seconds } sekundy
    [many] System zostanie automatycznie uruchomiony ponownie za { $seconds } sekund
   *[other] System zostanie automatycznie uruchomiony ponownie za { $seconds } sekundy
}
end-session-restart-button = Uruchom ponownie
end-session-update-restart-title = Uruchom ponownie i zainstaluj aktualizacje
end-session-update-restart-countdown = { $seconds ->
    [one] System automatycznie uruchomi się ponownie i zainstaluje aktualizacje za { $seconds } sekundę
    [few] System automatycznie uruchomi się ponownie i zainstaluje aktualizacje za { $seconds } sekundy
    [many] System automatycznie uruchomi się ponownie i zainstaluje aktualizacje za { $seconds } sekund
   *[other] System automatycznie uruchomi się ponownie i zainstaluje aktualizacje za { $seconds } sekundy
}
end-session-update-restart-button = Uruchom ponownie i zainstaluj
end-session-install-updates = Zainstaluj oczekujące aktualizacje oprogramowania
end-session-install-version = Zainstaluj wersję { $version }
end-session-low-battery = Niski poziom baterii: podłącz zasilanie przed instalacją aktualizacji
end-session-busy-apps = Niektóre aplikacje są zajęte lub mają niezapisaną pracę
end-session-other-users = Zalogowani są inni użytkownicy
end-session-cancel = Anuluj
end-session-boot-options = Opcje rozruchu
end-session-remote-user = { $userName } (zdalnie)
end-session-console-user = { $userName } (konsola)

## Lock screen clock

lock-clock-swipe-up = Przesuń w górę
lock-clock-click-or-press = Kliknij lub naciśnij dowolny klawisz

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Okno odblokowania
