## Shared

system-cancel = Anuluj

## Dictation notifications

dictation-setup-title = Pisz głosem
dictation-setup-body = Mów, a to, co powiesz, zostanie wpisane w dowolnej aplikacji. Rozpoznawanie mowy działa na tym komputerze, dlatego najpierw potrzebny jest model mowy.
dictation-setup-action = Skonfiguruj dyktowanie
dictation-unsupported-title = Język { $language } nie jest dostępny do dyktowania na tym komputerze
dictation-unsupported-body = Procesor tego komputera nie obsługuje modelu rozpoznawania mowy, którego wymaga ten język ({ $language }). Możesz dyktować w innym języku.
dictation-settings-action = Ustawienia dyktowania

## System health notifications

health-gpu-reset-title = Sterownik grafiki przestał odpowiadać
health-gpu-reset-body = { $day ->
    [today] Komputer uruchomił się ponownie dzisiaj o { $time }. W Ustawieniach sprawdzisz, jak temu zapobiec.
   *[other] Komputer uruchomił się ponownie { $date } o { $time }. W Ustawieniach sprawdzisz, jak temu zapobiec.
}
health-gpu-reset-details = Szczegóły

oom-app-closed-title = Aplikacja { $app } została zamknięta, aby zwolnić pamięć
oom-container-closed-title = Kontener został zamknięty, aby zwolnić pamięć
oom-closed-body = Na komputerze kończyła się pamięć. Zamknięcie pozwoliło zachować płynne działanie reszty systemu.
oom-closed-body-with-size = Na komputerze kończyła się pamięć. Zamknięcie pozwoliło zachować płynne działanie reszty systemu. Używana pamięć: { $size }.
memory-low-title = W systemie Luft kończy się pamięć
memory-low-app-body = Aplikacja { $app } używa { $size }. Wymuś jej zamknięcie, aby reszta systemu działała płynnie.
memory-low-container-body = Kontener używa { $size }. Wymuś jego zamknięcie, aby reszta systemu działała płynnie.
memory-low-force-quit = Wymuś zamknięcie

## Input source indicator

input-source-indicator = Źródło wprowadzania: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Tryb samolotowy jest włączony sprzętowo
media-keys-airplane-mode-on = Tryb samolotowy włączony
media-keys-airplane-mode-off = Tryb samolotowy wyłączony
media-keys-bluetooth-on = Bluetooth włączony
media-keys-bluetooth-off = Bluetooth wyłączony
media-keys-caps-lock-on = Caps Lock włączony
media-keys-caps-lock-off = Caps Lock wyłączony
media-keys-num-lock-on = Num Lock włączony
media-keys-num-lock-off = Num Lock wyłączony

## VPN sign-in

vpn-sign-in-title = Zaloguj się do sieci VPN { $connection }
vpn-connect = Połącz
vpn-signing-in = Logowanie…
vpn-finish-in-browser = Dokończ logowanie w przeglądarce.
vpn-certificate-untrusted = Serwer { $host } przedstawił certyfikat, którego nie można zweryfikować ({ $reason }). Jego odcisk to { $fingerprint }.
vpn-certificate-warning = Ktoś może podszywać się pod ten serwer. Połącz tylko wtedy, gdy się tego spodziewasz.
vpn-certificate-connect = Połącz mimo to

vpn-field-password = Hasło
vpn-field-certificate-password = Hasło certyfikatu
vpn-field-proxy-password = Hasło serwera proxy
vpn-field-pre-shared-key = Klucz wstępny
vpn-field-group-password = Hasło grupy

## Battery notifications

battery-left = Pozostało { $percent }.
battery-left-with-time = Pozostało { $percent }, około { $duration }.
battery-low-title = Niski poziom baterii
battery-very-low-title = Bardzo niski poziom baterii
battery-almost-empty-title = Bateria prawie rozładowana
battery-ups-low-title = Niski poziom baterii UPS
battery-ups-very-low-title = Bardzo niski poziom baterii UPS
battery-ups-almost-empty-title = Bateria UPS prawie rozładowana
battery-very-low-body = { $left } Wkrótce podłącz zasilanie.
battery-almost-empty-body = { $left } Podłącz zasilanie teraz, aby nie stracić niezapisanej pracy.

battery-device-low-title = { $device }: niski poziom baterii
battery-device-very-low-title = { $device }: bardzo niski poziom baterii
battery-device-low-body = { $left } Wkrótce naładuj urządzenie.
battery-device-very-low-body = { $left } Naładuj urządzenie teraz, aby się nie wyłączyło.

battery-device-mouse = Mysz
battery-device-keyboard = Klawiatura
battery-device-phone = Telefon
battery-device-tablet = Tablet
battery-device-controller = Kontroler
battery-device-pen = Pióro
battery-device-touchpad = Panel dotykowy
battery-device-headset = Zestaw słuchawkowy
battery-device-speaker = Głośnik
battery-device-headphones = Słuchawki
battery-device-remote = Pilot
battery-device-other = Podłączone urządzenie

## Privacy indicator

privacy-indicator = W użyciu: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofon
privacy-thing-screen = ekran
privacy-thing-location = lokalizacja
privacy-thing-windows = okna

privacy-camera-unknown-app = Aplikacja używa kamery
privacy-stop-sharing = Zatrzymaj udostępnianie ekranu
privacy-stop-recording = Zatrzymaj nagrywanie
privacy-turn-off-location = Wyłącz usługi lokalizacji
privacy-settings = Ustawienia prywatności
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofon wyciszony
privacy-mute-microphone = Wycisz mikrofon
privacy-unmute-microphone = Wyłącz wyciszenie mikrofonu
privacy-close-app = Zamknij aplikację { $app }
privacy-unknown-app = Aplikacja
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program może widzieć twoje okna
    [few] { $count } programy mogą widzieć twoje okna
    [many] { $count } programów może widzieć twoje okna
   *[other] { $count } programu może widzieć twoje okna
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program może widzieć twoje okna i z nich korzystać
    [few] { $count } programy mogą widzieć twoje okna i z nich korzystać
    [many] { $count } programów może widzieć twoje okna i z nich korzystać
   *[other] { $count } programu może widzieć twoje okna i z nich korzystać
}
privacy-windows-stop = Odbierz dostęp

## Window access prompt

peek-see-request = Pozwolić uruchomionemu przez ciebie programowi widzieć twoje okna?
peek-see-description = Zyska możliwość robienia zdjęć każdego otwartego okna.
peek-use-request = Pozwolić uruchomionemu przez ciebie programowi widzieć twoje okna i z nich korzystać?
peek-use-description = Zyska możliwość oglądania każdego otwartego okna oraz klikania i pisania w nim tak jak ty.
peek-deny = Nie zezwalaj
peek-allow-once = Zezwól raz
peek-allow-until-quit = Zezwól do zamknięcia programu

## Window access errors

peek-error-declined-until-quit = Osoba korzystająca z tego komputera odmówiła. Program może zapytać ponownie po zakończeniu działania.
peek-error-not-allowed = Osoba korzystająca z tego komputera nie zezwoliła na to
peek-error-sandboxed = Aplikacje w piaskownicy nie mogą widzieć innych okien ani z nich korzystać
peek-error-unknown-caller = Program, który pyta, zakończył działanie lub nie można go rozpoznać
peek-error-no-caller = Magistrala sesji nie podała, który program pyta
peek-error-screen-busy = Ekran jest zablokowany albo jest na nim otwarte okno systemowe. Spróbuj ponownie, gdy zniknie.
peek-error-input-held = Ktoś przytrzymuje klawisze lub przyciski myszy. Spróbuj ponownie za chwilę.
peek-error-input-dropped = Wprowadzanie zostało przerwane, ponieważ w chwili jego nadejścia pod wskazanym punktem było coś innego lub coś innego przejęło klawiaturę
peek-error-not-in-front = Nie udało się przenieść okna na wierzch
peek-error-covered = Ta część okna jest zasłonięta przez coś innego
peek-error-outside = Punkt { $x }, { $y } leży poza obrazem okna, który ma wymiary { $width } × { $height }
peek-error-nothing-to-capture = Okno nie wyświetla niczego, co można przechwycić
peek-error-window-picture-late = Obraz okna nie był gotowy na czas
peek-error-screen-picture-late = Obraz ekranu nie był gotowy na czas
peek-error-no-window-id = Żadne okno nie ma identyfikatora { $id }. Polecenie peek list pokazuje otwarte okna.
peek-error-no-window-for-handle = Program uruchomiony jako { $handle } nie ma otwartego okna
peek-error-ended-before-window = Program zakończył działanie, zanim otworzył okno
peek-error-no-window-in-time = Żadne okno nie otworzyło się w ciągu { $duration }
peek-error-launch-not-started-by-peek = Można uruchomić tylko program, który uruchomiło samo polecenie peek run
peek-error-ended-while-starting = Program zakończył działanie podczas uruchamiania
peek-error-launch-failed = systemd nie mógł uruchomić programu { $program }
peek-error-unknown-handle = Nic, co zostało uruchomione przez peek run, nie ma identyfikatora { $handle } albo zostało już zamknięte
peek-error-unknown-key = { $key } nie jest klawiszem znanym poleceniu peek
peek-error-unknown-modifier = { $modifier } nie jest modyfikatorem. Użyj ctrl, shift, alt lub super.
peek-error-display-owner = Ten ekran należy do innego programu
peek-error-display-run = Programy na ukrytym ekranie uruchamia polecenie peek run
peek-error-display-handle = Ten ekran został uruchomiony jako { $handle }, a nie { $requested }

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

## System updates
updates-available-title = Dostępne są aktualizacje systemu
updates-available-body = Otwórz Ustawienia, aby je pobrać i zainstalować.
updates-ready-title = Aktualizacje są gotowe do instalacji
updates-ready-body = Uruchom ponownie komputer w dogodnej chwili, aby je zainstalować.
