## Quick settings tiles

auto-rotate-title = Autoobracanie
dark-style-title = Tryb ciemny
do-not-disturb-title = Nie przeszkadzać
night-light-title = Oświetlenie nocne
airplane-mode-title = Tryb samolotowy

## Power mode

power-profile-title = Tryb zasilania
power-profile-header = Tryb zasilania
power-profile-open-menu = Otwórz menu trybów zasilania
power-profile-settings = Ustawienia zasilania
power-profile-performance = Wydajność
power-profile-balanced = Zrównoważony
power-profile-power-saver = Oszczędzanie energii
power-profile-custom = Niestandardowy

## Keep awake

caffeine-title = Nie usypiaj
caffeine-open-menu = Otwórz menu Nie usypiaj
caffeine-until = Do { $time }
caffeine-until-turned-off = Do wyłączenia
caffeine-30-minutes = 30 minut
caffeine-1-hour = 1 godzina
caffeine-2-hours = 2 godziny
caffeine-inhibit-reason = Włączono Nie usypiaj w szybkich ustawieniach

## Brightness

brightness-title = Jasność
brightness-open-menu = Otwórz menu jasności

## Keyboard backlight

backlight-title = Podświetlenie klawiatury
backlight-open-menu = Otwórz menu podświetlenia klawiatury
backlight-slider = Jasność klawiatury
backlight-off = Wyłączone
backlight-low = Niskie
backlight-high = Wysokie

## Sound

volume-sound-settings = Ustawienia dźwięku
volume-mute = Wycisz
volume-unmute = Wyłącz wyciszenie
volume-output-slider = Głośność
volume-output-title = Wyjście dźwięku
volume-output-open-menu = Otwórz menu wyjścia dźwięku
volume-input-slider = Mikrofon
volume-input-title = Wejście dźwięku
volume-input-open-menu = Otwórz menu wejścia dźwięku

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Otwórz menu Bluetooth
bluetooth-settings = Ustawienia Bluetooth
bluetooth-connect = Połącz
bluetooth-disconnect = Rozłącz
bluetooth-connect-device = Połącz z { $deviceName }
bluetooth-disconnect-device = Rozłącz { $deviceName }
bluetooth-no-devices = Brak dostępnych lub połączonych urządzeń
bluetooth-turn-on-hint = Włącz Bluetooth, aby łączyć się z urządzeniami
bluetooth-connected-count = { $count ->
    [one] Połączono: { $count }
    [few] Połączono: { $count }
    [many] Połączono: { $count }
   *[other] Połączono: { $count }
}

## Network menus in quick settings

network-menu-unknown-network = <nieznana>
network-menu-connect = Połącz
network-menu-disconnect = Rozłącz
network-menu-connect-to = Połącz z { $name }
network-menu-disconnect-from = Rozłącz { $name }
network-menu-turn-off = Wyłącz
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zabezpieczona, siła sygnału { $strength }%
   *[no] { $name }, niezabezpieczona, siła sygnału { $strength }%
}
network-menu-hotspot = Hotspot { $name }
network-menu-connected-count = { $count ->
    [one] Połączono: { $count }
    [few] Połączono: { $count }
    [many] Połączono: { $count }
   *[other] Połączono: { $count }
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otwórz menu VPN
network-menu-vpn-settings = Ustawienia VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otwórz menu Wi-Fi
network-menu-wifi-settings = Wszystkie sieci
network-menu-wired = Połączenia przewodowe
network-menu-wired-open-menu = Otwórz menu połączeń przewodowych
network-menu-wired-settings = Ustawienia sieci przewodowej
network-menu-tethers = Tethering przez Bluetooth
network-menu-tethers-open-menu = Otwórz menu tetheringu przez Bluetooth
network-menu-tether = Tethering
network-menu-tether-settings = Ustawienia Bluetooth
network-menu-mobile-connections = Połączenia komórkowe
network-menu-mobile-open-menu = Otwórz menu połączeń komórkowych
network-menu-mobile-settings = Ustawienia sieci komórkowej
network-menu-mobile = Sieć komórkowa
network-device-wired = Przewodowe
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Zaloguj się do sieci
network-menu-failed-title = Nie udało się połączyć
network-menu-failed-body = Nie udało się aktywować połączenia sieciowego

## Location access dialog

location-dialog-title = Zezwolić na dostęp do lokalizacji?
location-dialog-description = Aplikacja { $appName } chce uzyskać dostęp do twojej lokalizacji
location-dialog-info = Dostęp do lokalizacji możesz w każdej chwili zmienić w ustawieniach prywatności
location-dialog-deny = Odmów dostępu
location-dialog-grant = Zezwól na dostęp

## Thunderbolt notifications

thunderbolt-unknown-title = Nieznane urządzenie Thunderbolt
thunderbolt-unknown-body = Podczas twojej nieobecności podłączono nowe urządzenie. Odłącz je i podłącz ponownie, aby zacząć go używać.
thunderbolt-unauthorized-title = Nieautoryzowane urządzenie Thunderbolt
thunderbolt-unauthorized-body = Podłączono nowe urządzenie, które wymaga zatwierdzenia przez administratora
thunderbolt-error-title = Błąd autoryzacji Thunderbolt
thunderbolt-error-body = Nie udało się autoryzować urządzenia Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Odmów
access-dialog-allow = Zezwól

## Display change confirmation

display-change-title = Zachować te ustawienia ekranu?
display-change-countdown = { $seconds ->
    [one] Zmiany zostaną cofnięte za { $seconds } sekundę
    [few] Zmiany zostaną cofnięte za { $seconds } sekundy
    [many] Zmiany zostaną cofnięte za { $seconds } sekund
   *[other] Zmiany zostaną cofnięte za { $seconds } sekundy
}
display-change-revert = Cofnij zmiany
display-change-keep = Zachowaj zmiany

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = Aplikacja { $appName } nie odpowiada
close-dialog-description = Możesz chwilę poczekać, aż zacznie znowu działać, albo wymusić jej zamknięcie
close-dialog-force-quit = Wymuś zamknięcie
close-dialog-wait = Czekaj

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Duplikuj
switch-monitor-join = Rozszerz
switch-monitor-external-only = Tylko zewnętrzny
switch-monitor-built-in-only = Tylko wbudowany

## Sign-in prompt

auth-prompt-password = Hasło
auth-prompt-username = Nazwa użytkownika
auth-prompt-back = Wstecz
auth-prompt-submit = Wyślij
auth-prompt-wrong-password = Nieprawidłowe hasło
auth-prompt-failed = Nie udało się. Spróbuj ponownie.
fingerprint-not-recognized = Nie rozpoznano odcisku palca

## Drive connected notification

autorun-connected = Podłączono „{ $driveName }”
autorun-ready = Dysku można już używać
autorun-open-with = Otwórz w aplikacji { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Włączono klawisze powolne
kbd-a11y-slow-keys-off = Wyłączono klawisze powolne
kbd-a11y-slow-keys-description = Klawisz Shift był przytrzymany przez 8 sekund. To skrót funkcji Klawisze powolne, która zmienia działanie klawiatury.
kbd-a11y-sticky-keys-on = Włączono klawisze trwałe
kbd-a11y-sticky-keys-off = Wyłączono klawisze trwałe
kbd-a11y-sticky-keys-on-description = Klawisz Shift został naciśnięty 5 razy z rzędu. To skrót funkcji Klawisze trwałe, która zmienia działanie klawiatury.
kbd-a11y-sticky-keys-off-description = Naciśnięto dwa klawisze naraz lub 5 razy z rzędu klawisz Shift. To wyłącza funkcję Klawisze trwałe, która zmienia działanie klawiatury.
kbd-a11y-leave-on = Pozostaw włączone
kbd-a11y-turn-on = Włącz
kbd-a11y-turn-off = Wyłącz
kbd-a11y-leave-off = Pozostaw wyłączone

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Wybierz urządzenie audio
audio-device-cancel = Anuluj
audio-device-sound-settings = Ustawienia dźwięku
audio-device-headphones = Słuchawki
audio-device-headset = Zestaw słuchawkowy
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Zezwolić na przejęcie skrótów?
inhibit-shortcuts-app = Aplikacja { $appName } chce przejąć skróty klawiaturowe
inhibit-shortcuts-unknown-app = Aplikacja chce przejąć skróty klawiaturowe
inhibit-shortcuts-restore = Aby przywrócić skróty, naciśnij { $shortcut }
inhibit-shortcuts-deny = Odmów
inhibit-shortcuts-allow = Zezwól

## Administrator authentication

polkit-title = Wymagane uwierzytelnienie
polkit-administrator = Administrator
polkit-password = Hasło
polkit-cancel = Anuluj
polkit-authenticate = Uwierzytelnij
polkit-failed = Nie udało się. Spróbuj ponownie.

## Unlocking encrypted drives

mount-hidden-volume = Wolumin ukryty
mount-windows-system-volume = Wolumin systemowy Windows
mount-uses-keyfiles = Używa plików kluczy
mount-keyfiles-use-app = Aby odblokować wolumin, który używa plików kluczy, użyj narzędzia <i>{ $appName }</i>
mount-keyfiles-need-app = Do odblokowania woluminu, który używa plików kluczy, potrzebne jest zewnętrzne narzędzie, takie jak <i>Dyski</i>
mount-pim-number = Numer PIM
mount-pim-invalid = PIM musi być liczbą lub pozostać pusty
mount-password = Hasło
mount-remember-password = Zapamiętaj hasło
mount-cancel = Anuluj
mount-unlock = Odblokuj
mount-open-app = Otwórz { $appName }
mount-wrong-password = Nie udało się. Spróbuj ponownie.
mount-unlock-failed = Nie udało się odblokować woluminu
mount-pim-unsupported = Zainstalowana wersja udisks nie obsługuje ustawienia PIM

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

## Network passwords, asked when connecting needs one

network-agent-auth-required = Wymagane uwierzytelnienie
network-agent-wifi-rejected = Zapisane hasło do sieci „{ $networkName }” nie zadziałało. Wpisz je ponownie.
network-agent-wifi-secrets = Dostęp do sieci bezprzewodowej „{ $networkName }” wymaga hasła lub klucza szyfrowania
network-agent-wps-hint = Możesz też połączyć się, naciskając przycisk „WPS” na routerze
network-agent-wired-title = Uwierzytelnianie 802.1X w sieci przewodowej
network-agent-dsl-title = Uwierzytelnianie DSL
network-agent-pin-title = Wymagany kod PIN
network-agent-pin-body = Urządzenie do mobilnego internetu wymaga kodu PIN
network-agent-vpn-title = Hasło VPN
network-agent-password-required = Połączenie z „{ $networkName }” wymaga hasła
network-agent-connect = Połącz
network-agent-cancel = Anuluj
network-agent-password = Hasło
network-agent-username = Nazwa użytkownika
network-agent-key = Klucz
network-agent-private-key-password = Hasło klucza prywatnego
network-agent-identity = Tożsamość
network-agent-service = Usługa
network-agent-network-name = Nazwa sieci
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Przesuń w górę
lock-clock-click-or-press = Kliknij lub naciśnij dowolny klawisz

## Notification times

date-just-now = Przed chwilą

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Okna
ctrl-alt-tab-panel = Pasek zadań
ctrl-alt-tab-unlock = Okno odblokowania

## System notifications

messages-system-source = System
unsafe-mode-title = System przełączono w tryb niebezpieczny
unsafe-mode-body = Aplikacje mają teraz nieograniczony dostęp
unsafe-mode-undo = Cofnij
privileged-user-title = Zalogowano jako użytkownik uprzywilejowany
privileged-user-body = Ze względów bezpieczeństwa należy unikać pracy w sesji użytkownika uprzywilejowanego. Jeśli to możliwe, zaloguj się jako zwykły użytkownik.

## On-screen keyboard

osk-keyboard-settings = Ustawienia klawiatury
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel musi zablokować ekran

## Notifications

messages-unknown-app = Nieznana aplikacja
messages-reply = Odpowiedz
messages-reply-placeholder = Napisz odpowiedź
messages-reply-send = Wyślij

## Media player controls

mpris-unknown-artist = Nieznany wykonawca
mpris-unknown-title = Nieznany tytuł

## Starting programs

spawn-failed = Nie udało się uruchomić „{ $command }”:

## Text field context menu

entry-menu-copy = Kopiuj
entry-menu-paste = Wklej
entry-menu-show-text = Pokaż tekst
entry-menu-hide-text = Ukryj tekst
entry-caps-lock-on = Caps Lock jest włączony

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Zrób zrzut ekranu
title-bar-menu-hide = Ukryj
title-bar-menu-restore = Przywróć
title-bar-menu-maximize = Maksymalizuj
title-bar-menu-move = Przenieś
title-bar-menu-resize = Zmień rozmiar
title-bar-menu-always-on-top = Zawsze na wierzchu
title-bar-menu-always-on-visible-workspace = Zawsze na widocznym obszarze roboczym
title-bar-menu-workspace-left = Przenieś do obszaru roboczego po lewej
title-bar-menu-workspace-right = Przenieś do obszaru roboczego po prawej
title-bar-menu-workspace-up = Przenieś do obszaru roboczego powyżej
title-bar-menu-workspace-down = Przenieś do obszaru roboczego poniżej
title-bar-menu-monitor-up = Przenieś na ekran powyżej
title-bar-menu-monitor-down = Przenieś na ekran poniżej
title-bar-menu-monitor-left = Przenieś na ekran po lewej
title-bar-menu-monitor-right = Przenieś na ekran po prawej
title-bar-menu-close = Zamknij

## Screenshots and screen recording

screenshot-source = Przechwytywanie ekranu
screenshot-area = Zaznaczenie obszaru
screenshot-screen = Zaznaczenie ekranu
screenshot-window = Zaznaczenie okna
screenshot-take = Zrób zrzut ekranu
screenshot-record = Nagraj ekran
screenshot-show-pointer = Pokaż wskaźnik
screenshot-capture = Przechwyć
screenshot-close = Zamknij
screenshot-screencasts-folder = Nagrania ekranu
screenshot-screencast-file = Nagranie ekranu z { $date } { $time }
screenshot-screenshots-folder = Zrzuty ekranu
screenshot-file = Zrzut ekranu z { $timestamp }
screenshot-screencast-recorded = Nagrano ekran
screenshot-screencast-start-failed = Nie udało się rozpocząć nagrywania ekranu
screenshot-screencast-out-of-space = Nie udało się nagrać ekranu: brak miejsca na dysku
screenshot-screencast-try-again = Nie udało się nagrać ekranu. Spróbuj ponownie.
screenshot-screencast-failed = Nie udało się nagrać ekranu
screenshot-screencast-view = Kliknij, aby obejrzeć nagranie
screenshot-show-in-rover = Pokaż w aplikacji Rover
screenshot-captured = Zrobiono zrzut ekranu
screenshot-captured-body = Obraz możesz wkleić ze schowka
