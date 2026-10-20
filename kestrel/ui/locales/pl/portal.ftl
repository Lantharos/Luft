## Shared by the dialogs apps open through the desktop portal

portal-cancel = Anuluj
portal-allow = Zezwól
portal-share = Udostępnij

portal-unknown-app-subject = Aplikacja
portal-unknown-app-object = aplikacja

## Choosing an app to open a file or link

portal-app-chooser-open-title = Otwórz „{ $name }”
portal-app-chooser-open-description = Wybierz aplikację, aby otworzyć plik.
portal-app-chooser-open-kind = Wybierz aplikację, aby otworzyć plik ({ $kind }).
portal-app-chooser-title = Wybierz aplikację
portal-app-chooser-description = Wybierz aplikację, aby kontynuować.
portal-app-chooser-kind = Wybierz aplikację dla tego rodzaju plików ({ $kind }).
portal-app-chooser-nothing-installed = Żadna zainstalowana aplikacja nie może tego otworzyć
portal-app-chooser-find = Znajdź aplikację
portal-app-chooser-open = Otwórz

## Adding a website or app to Start

portal-launcher-website-title = Dodać tę witrynę do aplikacji?
portal-launcher-website-description = Witryna { $site } będzie się otwierać z menu Start we własnym oknie.
portal-launcher-title = Dodać to do aplikacji?
portal-launcher-description = { $appName } chce dodać aplikację do menu Start.
portal-launcher-name = Nazwa
portal-launcher-add = Dodaj

## Screenshots taken for apps

portal-screenshot-file-name = Zrzut ekranu { $date }

## Account details

portal-account-title = Czy { $appName } może zobaczyć nazwę i zdjęcie twojego konta?
portal-account-description = { $appName } zobaczy nazwę i zdjęcie twojego konta.

## Wallpaper

portal-wallpaper-title = Ustawić jako tapetę?
portal-wallpaper-description = { $appName } chce zmienić tapetę. Jest ona używana w trybie jasnym i ciemnym oraz na ekranie blokady.
portal-wallpaper-set = Ustaw tapetę

## USB devices

usb-title = { $count ->
    [one] Czy { $appName } może używać tego urządzenia?
    [few] Czy { $appName } może używać tych urządzeń?
    [many] Czy { $appName } może używać tych urządzeń?
   *[other] Czy { $appName } może używać tych urządzeń?
}
usb-description = { $count ->
    [one] { $appName } będzie mieć bezpośredni dostęp do urządzenia, dopóki jest ono podłączone.
    [few] { $appName } będzie mieć bezpośredni dostęp do urządzeń, dopóki są one podłączone.
    [many] { $appName } będzie mieć bezpośredni dostęp do urządzeń, dopóki są one podłączone.
   *[other] { $appName } będzie mieć bezpośredni dostęp do urządzeń, dopóki są one podłączone.
}
usb-unknown-maker = Nieznany producent
usb-unknown-device = Nieznane urządzenie

## Screen sharing, remote control and input capture

screen-share-title = Czy { $appName } może widzieć twój ekran?
screen-share-description = { $appName } będzie widzieć to, co wybierzesz.
screen-share-screens = Ekrany
screen-share-windows = Okna
screen-share-main-screen = Ekran główny
screen-share-virtual-screen = Ekran wirtualny
screen-share-new-virtual-screen = Nowy ekran wirtualny
screen-share-new-virtual-screen-description = Dodatkowy ekran tylko do udostępniania
screen-share-nothing-to-share = Brak otwartych okien do udostępnienia.
screen-share-remember = Zapamiętaj mój wybór
screen-share-remember-description = { $appName } nie zapyta ponownie
screen-share-clipboard = Udostępnij schowek
screen-share-clipboard-description = Kopiowanie i wklejanie w obie strony

screen-share-remote-desktop-title = Czy { $appName } może sterować twoim komputerem?
screen-share-remote-desktop-with-screen = { $appName } będzie widzieć to, co wybierzesz, i używać urządzeń, na które zezwolisz.
screen-share-remote-desktop-description = { $appName } będzie używać urządzeń, na które zezwolisz.
screen-share-devices = Urządzenia
screen-share-device-keyboard = Klawiatura
screen-share-device-pointer = Mysz i panel dotykowy
screen-share-device-touchscreen = Ekran dotykowy

screen-share-input-capture-title = Czy { $appName } może przejmować klawiaturę i mysz?
screen-share-input-capture-description = Gdy wskaźnik dotrze do krawędzi ekranu, { $appName } może przejąć klawiaturę i mysz, na przykład aby sterować innym komputerem.

## Keyboard shortcuts apps register for the whole session

shortcuts-consent-title = Czy { $appName } może używać skrótów klawiaturowych?
shortcuts-consent-description = Nawet gdy używasz innych aplikacji, { $appName } otrzyma te skróty.
shortcuts-record-title = Skróty aplikacji { $appName }
shortcuts-record-description = Wybierz skrót, a następnie naciśnij wybrane klawisze. Backspace usuwa skrót.
shortcuts-not-set = Nie ustawiono
shortcuts-press-keys = Naciśnij klawisze
shortcuts-unusable = Nie można użyć skrótu { $shortcut }
shortcuts-taken = Skrót { $shortcut } jest już zajęty
shortcuts-save = Zapisz

## Printing

print-title = Drukuj
print-title-from-app = Drukuj z aplikacji { $appName }
print-accept = Drukuj
print-no-printers = Nie skonfigurowano żadnej drukarki.
print-job-name = Dokument
print-job-name-from-app = Dokument z aplikacji { $appName }
print-failed-title = Nie udało się wydrukować
print-failed = Drukarka { $printer } nie przyjęła dokumentu.
print-failed-from-app = Drukarka { $printer } nie przyjęła dokumentu z aplikacji { $appName }.

print-printer = Drukarka
print-printer-not-accepting = Obecnie nie przyjmuje dokumentów
print-printer-paused = Wstrzymana
print-back = Wstecz

print-copies = Kopie
print-copies-fewer = Mniej kopii
print-copies-more = Więcej kopii

print-pages = Strony
print-pages-all = Wszystkie
print-pages-current = Bieżąca
print-pages-selection = Zaznaczenie
print-pages-range = Zakres
print-pages-range-hint = Na przykład 1-3, 5

print-paper = Papier
print-paper-dimensions = { $width } × { $height }
print-paper-letter = Letter
print-paper-legal = Legal
print-paper-executive = Executive
print-paper-tabloid = Tabloid
print-paper-statement = Statement
print-paper-envelope = Koperta { $size }

print-orientation = Orientacja
print-orientation-portrait = Pionowa
print-orientation-landscape = Pozioma

print-two-sided = Druk dwustronny
print-two-sided-off = Wyłączony
print-two-sided-long-edge = Wzdłuż dłuższej krawędzi
print-two-sided-short-edge = Wzdłuż krótszej krawędzi

print-color = Kolor
print-color-mode-color = Kolorowy
print-color-mode-monochrome = Czarno-biały
