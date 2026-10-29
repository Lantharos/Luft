## Displays

settings-display-mirror = Duplikuj ekrany
settings-display-mirror-description = Pokazuje ten sam obraz na każdym ekranie
settings-display-mirrored = Zduplikowane ekrany
settings-display-display = Ekran
settings-display-apply-failed = Te ustawienia nie zadziałały. Spróbuj innej konfiguracji.
settings-display-reset = Resetuj
settings-display-apply = Zastosuj
settings-display-arrangement-main = { $name }, ekran główny
settings-display-use = Używaj tego ekranu
settings-display-main = Ekran główny
settings-display-main-description = Tutaj pojawiają się pasek zadań i nowe okna
settings-display-resolution-title = Rozdzielczość
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Częstotliwość odświeżania
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Zmienna częstotliwość odświeżania
settings-display-variable-refresh-description = Ekran dopasowuje się do liczby klatek w grach pełnoekranowych, więc ruch jest płynniejszy
settings-display-variable-refresh-off = Wyłączona
settings-display-variable-refresh-games = W grach
settings-display-variable-refresh-fullscreen = We wszystkich aplikacjach pełnoekranowych
settings-display-scale = Skala
settings-display-scale-description = Powiększa lub pomniejsza tekst, aplikacje i całą resztę
settings-display-orientation = Orientacja
settings-display-orientation-landscape = Pozioma
settings-display-orientation-portrait-right = Pionowa, w prawo
settings-display-orientation-portrait-left = Pionowa, w lewo
settings-display-orientation-landscape-flipped = Pozioma, odwrócona

## Display brightness

settings-display-brightness = Jasność
settings-display-brightness-label = Jasność ekranu { $name }
settings-display-brightness-unsupported = Włącz DDC/CI w menu ekranu, aby zmieniać jasność tutaj
settings-display-brightness-unresponsive = Ekran nie odpowiada, ponowna próba za chwilę
settings-display-brightness-external = Ekrany zewnętrzne
settings-display-brightness-missing-tool = Zainstaluj ddcutil, aby zmieniać ich jasność tutaj
settings-display-brightness-needs-restart = Uruchom ponownie komputer, aby dokończyć konfigurację ich jasności
settings-display-brightness-no-access = Wyloguj się i zaloguj ponownie, aby zmieniać ich jasność tutaj

## Night light

settings-display-night-light = Oświetlenie nocne
settings-display-night-light-description = Cieplejsze kolory wieczorem, łagodniejsze dla oczu
settings-display-night-light-schedule = Harmonogram
settings-display-night-light-automatic = Od zachodu do wschodu słońca
settings-display-night-light-custom = Własny
settings-display-night-light-from = Włącza się
settings-display-night-light-to = Wyłącza się
settings-display-night-light-warmth = Ciepło barw

## Sound

settings-sound-output = Wyjście
settings-sound-input = Wejście
settings-sound-device = Urządzenie
settings-sound-output-device = Urządzenie wyjściowe
settings-sound-input-device = Urządzenie wejściowe
settings-sound-connection = Złącze
settings-sound-output-connection = Złącze wyjściowe
settings-sound-input-connection = Złącze wejściowe
settings-sound-volume = Głośność
settings-sound-mute = Wycisz: { $name }
settings-sound-unmute = Wyłącz wyciszenie: { $name }
settings-sound-balance = Balans
settings-sound-balance-center = Środek
settings-sound-balance-left = { $share } w lewo
settings-sound-balance-right = { $share } w prawo
settings-sound-louder = Zezwalaj na głośność powyżej 100%
settings-sound-louder-description = Przy wyższej głośności dźwięk może być zniekształcony
settings-sound-input-level = Poziom wejścia
settings-sound-apps = Głośność aplikacji
settings-sound-apps-playing = { $count ->
    [one] { $count } aplikacja odtwarza dźwięk
    [few] { $count } aplikacje odtwarzają dźwięk
    [many] { $count } aplikacji odtwarza dźwięk
   *[other] { $count } aplikacji odtwarza dźwięk
}
settings-sound-app-output = Wyjście dźwięku aplikacji { $app }
settings-sound-profiles = Profile urządzeń
settings-sound-profiles-row-description = Wybierz sposób używania każdego urządzenia dźwiękowego
settings-sound-profiles-description = Sposób używania każdego urządzenia dźwiękowego, na przykład stereo lub dźwięk przestrzenny
settings-sound-profile-label = Profil urządzenia { $device }
settings-sound-profile-off = Wyłączone

## System sounds

settings-sound-system = Dźwięki systemowe
settings-sound-system-description = Dźwięki powiadomień, urządzeń i innych zdarzeń
settings-sound-system-volume = Głośność dźwięków systemowych
settings-sound-kind-notifications = Powiadomienia
    .description = Wyciszone w trybie Nie przeszkadzać, podczas gier i udostępniania ekranu
    .preview = Odtwórz dźwięk powiadomienia
settings-sound-kind-devices = Urządzenia i ładowanie
    .description = Podłączenie urządzenia lub ładowarki i niski poziom baterii
    .preview = Odtwórz dźwięk urządzenia
settings-sound-kind-volume = Sygnał zmiany głośności
    .description = Tyknięcie przy zmianie głośności
    .preview = Odtwórz tyknięcie
settings-sound-kind-screenshots = Zrzuty ekranu
    .description = Dźwięk migawki po zapisaniu zrzutu ekranu
    .preview = Odtwórz dźwięk migawki
settings-sound-kind-recording = Nagrywanie
    .description = Włączenie i wyłączenie nagrywania ekranu, kamery lub dyktowania
    .preview = Odtwórz dźwięk nagrywania
settings-sound-kind-sign-in = Dźwięk logowania
    .description = Pojawienie się pulpitu
    .preview = Odtwórz dźwięk logowania
settings-sound-kind-keyboard = Dźwięki klawiatury
    .description = Każdy klawisz klawiatury ekranowej
    .preview = Odtwórz dźwięk klawisza

## Power and battery

settings-power-battery = Bateria
settings-power-charging = Ładowanie
settings-power-charging-at = Ładowanie z mocą { $power }
settings-power-charging-until-full = Ładowanie, do pełnego naładowania: { $time }
settings-power-charging-at-until-full = Ładowanie z mocą { $power }, do pełnego naładowania: { $time }
settings-power-on-battery = Zasilanie z baterii
settings-power-on-battery-using = Zasilanie z baterii, pobór { $power }
settings-power-time-left = Szacowany czas pracy: { $time }
settings-power-time-left-using = Szacowany czas pracy: { $time }, pobór { $power }
settings-power-full = W pełni naładowana
settings-power-empty = Rozładowana
settings-power-not-charging = Podłączona, nie ładuje się
settings-power-health = Kondycja baterii
settings-power-capacity = { $full } z pierwotnych { $design }
settings-power-cycles = { $count ->
    [one] { $cycles } cykl ładowania
    [few] { $cycles } cykle ładowania
    [many] { $cycles } cykli ładowania
   *[other] { $cycles } cyklu ładowania
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Pokazuj procent
settings-power-show-percentage-description = Pokazuje poziom naładowania wewnątrz ikony baterii

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = mniej niż minuta
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minuta
    [few] { $minutes } minuty
    [many] { $minutes } minut
   *[other] { $minutes } minuty
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } godzina
    [few] { $hours } godziny
    [many] { $hours } godzin
   *[other] { $hours } godziny
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } godzina
    [few] { $hours } godziny
    [many] { $hours } godzin
   *[other] { $hours } godziny
} { $minutes ->
    [one] { $minutes } minuta
    [few] { $minutes } minuty
    [many] { $minutes } minut
   *[other] { $minutes } minuty
}
settings-power-never = Nigdy

## Charge limit

settings-power-limit = Ograniczaj ładowanie
settings-power-limit-failed = Nie udało się zmienić limitu. Spróbuj ponownie.
settings-power-limit-elsewhere-off = Inna aplikacja wyłączyła limit, więc bateria ładuje się do pełna
settings-power-limit-elsewhere-changed = Inna aplikacja zmieniła limit na { $level }
settings-power-limit-elsewhere-on = Inna aplikacja zatrzymuje ładowanie na poziomie { $level }
settings-power-limit-automatic = Komputer sam decyduje, kiedy przerwać ładowanie
settings-power-limit-stops-at = Ładowanie kończy się na poziomie { $level }
settings-power-limit-description = Kończy ładowanie wcześniej, aby bateria dłużej służyła
settings-power-limit-description-at = Kończy na poziomie { $level }, aby bateria dłużej służyła
settings-power-limit-applied = Ładowanie kończy się na poziomie { $level }
settings-power-limit-applied-description = Ustawione przez inną aplikację na tym komputerze

## Battery-powered devices

settings-power-devices = Urządzenia
settings-power-device-mouse = Mysz
settings-power-device-keyboard = Klawiatura
settings-power-device-headphones = Słuchawki
settings-power-device-speaker = Głośnik
settings-power-device-controller = Kontroler
settings-power-device-phone = Telefon
settings-power-device-tablet = Tablet
settings-power-device-pen = Pióro
settings-power-device-touchpad = Panel dotykowy
settings-power-device-other = Urządzenie

## Power mode

settings-power-mode = Tryb zasilania
settings-power-mode-row = Tryb
settings-power-profile-saver = Oszczędzanie energii
    .description = Wolniej, ale z mniejszym zużyciem energii
settings-power-profile-balanced = Zrównoważony
    .description = Standardowa wydajność i zużycie energii
settings-power-profile-performance = Wydajność
    .description = Szybciej, ale z większym zużyciem energii
settings-power-limited = Wydajność jest teraz ograniczona
settings-power-limited-lap = Wydajność jest ograniczona, bo komputer leży na kolanach
settings-power-limited-hot = Wydajność jest ograniczona, bo komputer jest zbyt gorący
settings-power-limited-lap-hot = Wydajność jest ograniczona, bo komputer leży na kolanach i jest zbyt gorący
settings-power-saver-low-battery = Oszczędzanie energii przy niskim poziomie baterii
settings-power-saver-low-battery-description = Włącza oszczędzanie energii, gdy bateria się wyczerpuje
settings-power-saver-level = Poziom baterii dla oszczędzania energii

## Keyboard backlight

settings-power-keyboard = Klawiatura
settings-power-backlight = Podświetlenie klawiatury
settings-power-backlight-off = Wyłączone
settings-power-backlight-low = Niskie
settings-power-backlight-medium = Średnie
settings-power-backlight-high = Wysokie

## Screen and sleep

settings-power-screen = Ekran
settings-power-screen-off = Wyłączanie ekranu po czasie
settings-power-screen-off-description = Gdy komputer nie jest przez chwilę używany
settings-power-dim = Przyciemniaj przy bezczynności
settings-power-dim-description = Zmniejsza jasność na krótko przed wyłączeniem ekranu
settings-power-sleep = Uśpienie
settings-power-suspend-plugged-in = Usypiaj przy zasilaniu z sieci
settings-power-suspend-inactive = Usypiaj przy bezczynności
settings-power-suspend-description = Usypia komputer, gdy przez jakiś czas nie jest używany
settings-power-suspend-battery = Usypiaj przy zasilaniu z baterii
settings-power-button = Przycisk zasilania
settings-power-button-suspend = Uśpij
settings-power-button-hibernate = Hibernuj
settings-power-button-ask = Pytaj, co zrobić
settings-power-button-nothing = Nic nie rób
settings-power-long-sleep = Wyłączaj po długim uśpieniu
settings-power-long-sleep-description = Zamiast pozwolić, by bateria rozładowała się w czasie uśpienia, komputer wyłącza się, gdy poziom baterii jest niski lub po długim uśpieniu na baterii. Otwarte okna nie są zachowywane.
settings-power-long-sleep-failed = Nie udało się tego zmienić. Spróbuj ponownie.
settings-power-long-sleep-after = Czas do wyłączenia
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } godzina
    [few] { $hours } godziny
    [many] { $hours } godzin
   *[other] { $hours } godziny
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dzień
    [few] { $days } dni
    [many] { $days } dni
   *[other] { $days } dnia
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } tydzień
    [few] { $weeks } tygodnie
    [many] { $weeks } tygodni
   *[other] { $weeks } tygodnia
}

## Keyboard

settings-keyboard-sources = Źródła wprowadzania
settings-keyboard-sources-description = Pierwsze jest używane domyślnie. Możesz przełączać się między nimi podczas pisania.
settings-keyboard-source-edit = Edytuj w aplikacji Keys
settings-keyboard-source-up = Przenieś wyżej
settings-keyboard-source-down = Przenieś niżej
settings-keyboard-source-remove = Usuń
settings-keyboard-add-source-button = Dodaj źródło wprowadzania
settings-keyboard-own = Własne układy i metody wprowadzania
settings-keyboard-own-layout = Utwórz układ
settings-keyboard-own-layout-description = Zacznij od istniejącego układu i zmień, co wpisują jego klawisze
settings-keyboard-own-method = Utwórz metodę wprowadzania
settings-keyboard-own-method-description = Zamieniaj wpisywany tekst na znaki diakrytyczne, inne pisma lub słowa do wyboru
settings-keyboard-own-open = Otwórz aplikację Keys
settings-keyboard-own-open-description = Edytuj utworzone przez siebie układy i metody wprowadzania
settings-keyboard-switch-source = Przełącz źródło wprowadzania
settings-keyboard-add-source = Dodaj źródło wprowadzania
settings-keyboard-add-source-description = Wybierz układ klawiatury lub metodę wprowadzania, której chcesz używać.
settings-keyboard-add-source-search = Szukaj języków, układów i metod wprowadzania
settings-keyboard-input-method = Metoda wprowadzania
settings-keyboard-add-source-no-match = Brak wyników dla „{ $query }”
settings-keyboard-cancel = Anuluj
settings-keyboard-add = Dodaj
settings-keyboard-typing = Pisanie
settings-keyboard-repeat = Powtarzanie klawiszy
settings-keyboard-repeat-description = Przytrzymanie klawisza wpisuje go wielokrotnie
settings-keyboard-repeat-delay = Opóźnienie przed powtarzaniem
settings-keyboard-repeat-delay-shorter = Krótsze
settings-keyboard-repeat-delay-longer = Dłuższe
settings-keyboard-repeat-speed = Szybkość powtarzania
settings-keyboard-repeat-speed-slower = Wolniej
settings-keyboard-repeat-speed-faster = Szybciej
settings-keyboard-caps-lock = Klawisz Caps Lock
settings-keyboard-caps-lock-description = Co się dzieje po jego naciśnięciu
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Zamień z Esc
settings-keyboard-caps-lock-nothing = Nic
settings-keyboard-caps-lock-custom = Własne
settings-keyboard-lock-notices = Pokazuj Caps Lock i Num Lock
settings-keyboard-lock-notices-description = Krótko pokazuje na ekranie włączenie lub wyłączenie każdego z nich
settings-keyboard-dictation-on = Włączone
settings-keyboard-dictation-off = Wyłączone
settings-keyboard-shortcuts-description = Przeglądaj i zmieniaj skróty lub dodawaj własne

## Copilot key

settings-keyboard-copilot = Klawisz Copilot
settings-keyboard-copilot-press = Naciśnięcie
settings-keyboard-copilot-press-description = Co robi krótkie naciśnięcie klawisza
settings-keyboard-copilot-open-start = Otwórz menu Start
settings-keyboard-copilot-open-app = Otwórz aplikację
settings-keyboard-copilot-nothing = Nic
settings-keyboard-copilot-app = Aplikacja
settings-keyboard-copilot-no-app = Nie wybrano jeszcze aplikacji
settings-keyboard-copilot-change = Zmień
settings-keyboard-copilot-choose = Wybierz
settings-keyboard-copilot-hold = Przytrzymaj, aby dyktować
settings-keyboard-copilot-hold-description = Przytrzymaj klawisz i mów, aby wpisać to, co mówisz
settings-keyboard-copilot-hold-off = Działa po włączeniu dyktowania
settings-keyboard-copilot-choose-app = Wybierz aplikację
settings-keyboard-copilot-choose-app-description = Naciśnięcie klawisza Copilot ją otworzy.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Shift
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Print Screen
settings-keys-page-up = Page Up
settings-keys-page-down = Page Down
settings-keys-home = Home
settings-keys-end = End
settings-keys-insert = Insert
settings-keys-delete = Delete
settings-keys-tab = Tab
settings-keys-space = Spacja
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menu
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Głośniej
settings-keys-volume-down = Ciszej
settings-keys-mute = Wycisz
settings-keys-microphone-mute = Wycisz mikrofon
settings-keys-play = Odtwórz
settings-keys-media-pause = Wstrzymaj
settings-keys-stop = Zatrzymaj
settings-keys-next-track = Następny utwór
settings-keys-previous-track = Poprzedni utwór
settings-keys-brightness-up = Jaśniej
settings-keys-brightness-down = Ciemniej
settings-keys-browser = Przeglądarka
settings-keys-home-page = Strona główna
settings-keys-search = Szukaj
settings-keys-mail = Poczta
settings-keys-calculator = Kalkulator
settings-keys-files = Pliki
settings-keys-eject = Wysuń
settings-keys-power = Zasilanie
settings-keys-lock = Zablokuj

## Keyboard shortcuts

settings-shortcuts-title = Skróty klawiaturowe
settings-shortcuts-search = Szukaj skrótów
settings-shortcuts-category-system = System
settings-shortcuts-category-windows = Okna
settings-shortcuts-category-tiling = Kafelkowanie
settings-shortcuts-category-workspaces = Obszary robocze
settings-shortcuts-category-screenshots = Zrzuty ekranu
settings-shortcuts-category-media = Multimedia
settings-shortcuts-reset = Przywróć domyślny
settings-shortcuts-apps = Skróty aplikacji
settings-shortcuts-apps-description = Skróty, o które poprosiły aplikacje, działające nawet wtedy, gdy aplikacja nie jest na wierzchu
settings-shortcuts-no-match = Brak skrótów pasujących do „{ $query }”
settings-shortcuts-change = Zmień skrót: { $name }
settings-shortcuts-or = lub
settings-shortcuts-not-set = Nie ustawiono
settings-shortcuts-press-keys = Naciśnij wybrane klawisze
settings-shortcuts-needs-modifier = Dodaj Ctrl, Alt lub Super, aby skrót nie przeszkadzał w pisaniu.
settings-shortcuts-record-description = Naciśnij nowy skrót. Backspace go wyłącza, Esc anuluje.
settings-shortcuts-record-taken = Ten skrót jest już używany dla „{ $name }”. Zastąpienie go wyłączy go tam.
settings-shortcuts-try-another = Spróbuj innego
settings-shortcuts-replace = Zastąp
settings-shortcuts-cancel = Anuluj
settings-shortcuts-custom = Własne skróty
settings-shortcuts-custom-description = Uruchamiaj polecenie lub otwieraj aplikację kombinacją klawiszy
settings-shortcuts-untitled = Bez nazwy
settings-shortcuts-add = Dodaj skrót
settings-shortcuts-edit = Edytuj skrót
settings-shortcuts-custom-name = Nazwa
settings-shortcuts-custom-command = Polecenie
settings-shortcuts-custom-shortcut = Skrót
settings-shortcuts-custom-taken = Już używany dla „{ $name }”. Zapisanie wyłączy go tam.
settings-shortcuts-remove = Usuń
settings-shortcuts-save = Zapisz
settings-shortcuts-add-button = Dodaj

## Dictation

settings-dictation-title = Dyktowanie
settings-dictation-description = Przytrzymaj { $keys } i mów, aby wpisać to, co mówisz, w dowolnej aplikacji. Puść, aby zakończyć, lub naciśnij Esc, aby anulować. Wszystko dzieje się na tym komputerze: twój głos nigdy go nie opuszcza i nie jest zapisywany.
settings-dictation-description-no-shortcut = Wybierz skrót poniżej, aby dyktować. Wszystko dzieje się na tym komputerze: twój głos nigdy go nie opuszcza i nie jest zapisywany.
settings-dictation-not-installed = Dyktowanie nie jest zainstalowane na tym komputerze
settings-dictation-hold = Przytrzymaj { $keys }, aby dyktować
settings-dictation-needs-shortcut = Wyłączone, dopóki nie ma skrótu
settings-dictation-copilot-key = klawisz Copilot
settings-dictation-shortcut = Skrót
settings-dictation-shortcut-description = Przytrzymaj go i mów albo naciśnij, aby słuchać, dopóki nie naciśniesz go ponownie lub nie przestaniesz mówić
settings-dictation-shortcut-own = Własny skrót
settings-dictation-shortcut-another = Inny skrót…
settings-dictation-shortcut-off = Wyłączony
settings-dictation-keys = Klawisze
settings-dictation-change = Zmień
settings-dictation-language = Język
settings-dictation-language-automatic = Automatycznie
settings-dictation-language-automatic-current = Automatycznie ({ $language })
settings-dictation-language-description = Tryb automatyczny podąża za układem klawiatury, którego używasz
settings-dictation-language-unavailable = Język niedostępny na tym komputerze: { $language }
settings-dictation-engine = Rozpoznawanie mowy
settings-dictation-engine-automatic = Automatycznie
settings-dictation-engine-description = { $engine } rozpoznaje język: { $language }
settings-dictation-engine-graphics-card = { $engine } rozpoznaje język: { $language }, na karcie graficznej
settings-dictation-models = Modele mowy
settings-dictation-models-description = Modele są pobierane raz i przechowywane na tym komputerze.
settings-dictation-credits = Autorzy
settings-dictation-credit = { $credit }. Licencja: { $licence }.
settings-dictation-learn-more = Więcej informacji

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Nie udało się pobrać: { $reason }
settings-dictation-model-downloading = { $received } z { $total }
settings-dictation-model-installed = { $size } na tym komputerze
settings-dictation-model-partial = Pobrano { $received } z { $total }
settings-dictation-model-size = Do pobrania: { $size }
settings-dictation-model-retry = Spróbuj ponownie
settings-dictation-model-cancel = Anuluj
settings-dictation-model-resume = Wznów
settings-dictation-model-download = Pobierz
settings-dictation-model-remove = Usuń

## Mouse and touchpad

settings-mouse-mouse = Mysz
settings-mouse-primary-button = Przycisk główny
settings-mouse-primary-button-description = Przycisk, którym klikasz, aby zaznaczać
settings-mouse-primary-button-left = Lewy
settings-mouse-primary-button-right = Prawy
settings-mouse-speed = Szybkość wskaźnika
settings-mouse-slower = Wolniej
settings-mouse-faster = Szybciej
settings-mouse-acceleration = Przyspieszenie myszy
settings-mouse-acceleration-description = Wskaźnik przesuwa się dalej, gdy szybko ruszasz myszą
settings-mouse-natural-scrolling = Naturalne przewijanie
settings-mouse-natural-scrolling-description = Przewijanie przesuwa zawartość zamiast widoku
settings-mouse-touchpad = Panel dotykowy
settings-mouse-touchpad-speed = Szybkość wskaźnika panelu dotykowego
settings-mouse-touchpad-scroll-speed = Szybkość przewijania
settings-mouse-touchpad-scroll-speed-label = Szybkość przewijania panelu dotykowego
settings-mouse-touchpad-tap = Stuknij, aby kliknąć
settings-mouse-touchpad-tap-description = Stuknij panel dotykowy zamiast go wciskać
settings-mouse-touchpad-natural-scrolling = Naturalne przewijanie panelu dotykowego
settings-mouse-touchpad-natural-scrolling-description = Zawartość przesuwa się w tym samym kierunku co palce
settings-mouse-touchpad-scroll-with = Przewijanie
settings-mouse-touchpad-two-fingers = Dwoma palcami
settings-mouse-touchpad-scroll-edge = Przy krawędzi
settings-mouse-touchpad-secondary-click = Kliknięcie prawym przyciskiem
settings-mouse-touchpad-secondary-click-description = Jak kliknąć prawym przyciskiem bez osobnego przycisku
settings-mouse-touchpad-click-corner = W rogu
settings-mouse-touchpad-disable-typing = Wyłączaj podczas pisania
settings-mouse-touchpad-disable-typing-description = Wskaźnik nie przeskakuje, gdy piszesz
