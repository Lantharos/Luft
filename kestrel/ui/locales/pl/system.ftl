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
