## Messages that some steps share

meet-back = Wstecz
meet-cancel = Anuluj
meet-continue = Kontynuuj
meet-try-again = Spróbuj ponownie
meet-restart = Uruchom ponownie
meet-remove = Usuń
meet-keep-it = Zachowaj
meet-close = Zamknij
meet-restart-title = Uruchomić ponownie teraz?
meet-not-yet = Jeszcze nie
meet-iso-use = Użyj pobranego obrazu ISO
meet-iso-using = Używany jest twój obraz ISO systemu Luft
meet-nightly = Kompilacje nocne
meet-channel-nightly = Meet Luft będzie używać kompilacji nocnych
meet-channel-latest = Meet Luft znów będzie używać wydań
meet-undo = Cofnij
meet-logs-saved = Dzienniki z wypróbowywania systemu Luft zapisano na pulpicie
meet-logs-show = Pokaż
meet-logs-none = Nie ma jeszcze dzienników z wypróbowywania systemu Luft
meet-logs-failed = Meet Luft nie może zapisać dzienników z wypróbowywania systemu Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Nie udało się dokończyć sprawdzania tego komputera.
   *[windows] Nie udało się dokończyć sprawdzania tego komputera.
}
problem-room = Nie udało się dokończyć robienia miejsca na Luft.
problem-room-linux = Nie udało się dokończyć przygotowywania systemu Luft.
problem-update = Nie udało się dokończyć aktualizacji systemu Luft.
problem-download = Pobieranie systemu Luft zostało przerwane. Sprawdź połączenie z internetem.
problem-pack = Nie udało się dokończyć pakowania twoich rzeczy.
problem-remove = Nie udało się dokończyć usuwania systemu Luft.
problem-restart = Meet Luft nie może przygotować ponownego uruchomienia.
problem-tidy = Nie udało się usunąć starych wpisów rozruchowych.
problem-firmware = Meet Luft nie może otworzyć ustawień oprogramowania układowego.
problem-folders = Meet Luft nie może przejrzeć twoich folderów.
problem-sticks = Meet Luft nie może wyszukać pamięci USB.
problem-stick = Nie udało się dokończyć tworzenia pamięci USB.
problem-offer = Nie można teraz pobrać systemu Luft. Sprawdź połączenie z internetem albo użyj pobranego wcześniej obrazu ISO.
problem-luft = Meet Luft nie może sprawdzić dysku systemu Luft.
problem-resize = Nie udało się dokończyć zmiany rozmiaru systemu Luft.
problem-cancel = Meet Luft nie może anulować zmiany.
problem-give = Windows nie może odzyskać tego miejsca.
problem-declined = { $platform ->
    [linux] Meet Luft potrzebuje twojej zgody na zmiany na dysku. Wpisz hasło, gdy pojawi się prośba.
   *[windows] Meet Luft potrzebuje twojej zgody na zmiany na dysku. Wybierz Tak, gdy Windows o to zapyta.
}

## First screen

hello-intro = { $platform ->
    [linux] Wypróbuj Luft prosto stąd, bez pamięci USB. Jeśli ci się spodoba, Luft może zastąpić ten system i zachować twoje pliki.
   *[windows] Luft może działać tuż obok systemu Windows. Najpierw wypróbuj go bez instalowania czegokolwiek, a gdy przyjdzie pora, zabierz ze sobą swoje rzeczy.
}
hello-check = { $platform ->
    [linux] Sprawdź ten komputer
   *[windows] Sprawdź ten komputer
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Sprawdzanie tego komputera
   *[windows] Sprawdzanie tego komputera
}
check-ready-title = { $platform ->
    [linux] Ten komputer jest gotowy na Luft
   *[windows] Ten komputer jest gotowy na Luft
}
check-blocked-title = Prawie gotowe
check-moment = To chwilę potrwa.
check-slow = Windows sprawdza, ile miejsca może oddać. Na dużym dysku może to potrwać kilka minut.
check-blocked-description = Zanim Luft się wprowadzi, trzeba coś zmienić. Oto, co zrobić.
check-found-description = Oto wyniki sprawdzania.
check-checking = Sprawdzanie dysku, oprogramowania układowego i sprzętu…
check-again = Sprawdź ponownie
check-action-firmware = Otwórz ustawienia oprogramowania układowego
check-action-tidy = Uporządkuj
check-firmware-title = Uruchomić ponownie w ustawieniach oprogramowania układowego?
check-firmware-description = Najpierw zapisz to, nad czym pracujesz. Włącz tam Secure Boot i zapisz zmiany, a komputer uruchomi się jak zwykle.
check-tidy-title = Usunąć stare wpisy rozruchowe?
check-tidy-description = Wskazują tylko systemy, których już nie ma. Windows i wszystko inne uruchamia się tak jak wcześniej.
check-get-ready-title = Przygotować system Luft?
check-get-ready-file = Meet Luft skopiuje Luft z twojego obrazu ISO do folderu na tym komputerze i doda dla niego wpis rozruchowy. Partycje pozostaną bez zmian.
check-get-ready-download = Meet Luft pobierze Luft (około { $size }) do folderu na tym komputerze i doda dla niego wpis rozruchowy. Partycje pozostaną bez zmian.
check-get-ready-confirm = Przygotuj

## Choosing how much of the Windows drive Luft gets

room-title = Ile miejsca dla systemu Luft?
room-description = Windows zmniejsza się, aby zrobić miejsce na Luft. Twoje pliki w systemie Windows zostają dokładnie tam, gdzie są.
room-live = Windows zachowuje miejsce na rozwój. Luft odkłada też { $size } na start i oddaje je po instalacji.
room-make = Zrób miejsce
room-confirm-title = Przydzielić systemowi Luft { $size }?
room-confirm-file = Windows zmniejszy swój dysk, a potem Meet Luft skopiuje Luft z twojego obrazu ISO. Nie odłączaj komputera od zasilania.
room-confirm-download = Windows zmniejszy swój dysk, a potem Meet Luft pobierze Luft (około { $size }). Nie odłączaj komputera od zasilania ani od internetu.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Gdzie umieścić Luft?
room-places-description = Luft może dzielić dysk z systemem Windows albo zająć miejsce, którego Windows nie używa.
room-places-label = Miejsca na Luft
room-place-windows = Obok systemu Windows
room-place-windows-detail = Windows zmniejsza się, aby zrobić miejsce na Luft
room-place-windows-free = Wolne jest tam już { $size }
room-place-free = Wolne miejsce na dysku { $drive }
room-place-free-here = Wolne miejsce na dysku systemu Windows
room-place-free-detail = { $size } miejsca, którego nic innego nie używa
room-place-whole = Cały dysk { $drive }
room-place-whole-detail = Ten dysk ({ $size }) zostanie wymazany dla systemu Luft
room-live-free = Wolne jest już { $free }, więc Windows oddaje mniej i zachowuje miejsce na rozwój. Luft odkłada też { $size } na start i oddaje je po instalacji.
room-live-elsewhere = Luft dostaje tam { $room }, a dodatkowo odkłada { $size } na start i oddaje je po instalacji.
room-confirm-free-title = Przydzielić systemowi Luft { $size } wolnego miejsca?
room-confirm-free-file = Meet Luft skopiuje tam Luft z twojego obrazu ISO. Nic innego na dysku się nie zmieni.
room-confirm-free-download = Meet Luft pobierze tam Luft (około { $size }). Nic innego na dysku się nie zmieni. Nie odłączaj komputera od internetu.
room-erase-title = Wymazać dysk { $drive }?
room-erase-description = Wszystko na tym dysku ({ $size }) zostanie usunięte od razu, jeszcze przed uruchomieniem systemu Luft. Tego nie można cofnąć. Obecnie znajduje się na nim:
room-erase-empty = Windows nie może odczytać niczego na tym dysku ({ $size }), ale cała jego zawartość zostanie od razu usunięta. Tego nie można cofnąć.
room-erase-unnamed = Partycja bez nazwy
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Szyfrowanie BitLocker
room-erase-understood = Wiem, że część danych jest zaszyfrowana funkcją BitLocker i nie da się ich odzyskać
room-erase-confirm = Wymaż i zrób miejsce

## Luft is ready on Windows

ready-title = Luft jest gotowy
ready-description = Wybierz, jak chcesz go poznać. Potem Windows uruchamia się jak zwykle, chyba że zainstalujesz Luft i go wybierzesz.
ready-update-title = Pobierz najnowszy Luft
ready-update-description = Jest nowsza kompilacja. Zastąpi obecną i zachowa przygotowane miejsce oraz wszystko, co spakowano.
ready-try-title = Wypróbuj Luft
ready-try-description = Uruchom ponownie w systemie Luft bez instalowania czegokolwiek. Następnym razem Windows uruchomi się jak zwykle.
ready-box-description = Spakuj dokumenty, zdjęcia, sieci Wi-Fi i nie tylko, aby Luft rozpakował je po instalacji.
ready-box-packed = Spakowano, { $size }
ready-install-title = Zainstaluj Luft
ready-install-description = Uruchom ponownie w instalatorze. Miejsce obok systemu Windows ({ $size }) już na niego czeka.
ready-install-drive-description = Uruchom ponownie w instalatorze. Miejsce na dysku { $drive } ({ $size }) już na niego czeka.
ready-stick-description = Umieść Luft na pamięci USB, aby uruchomić go na dowolnym komputerze.
ready-remove = Usuń Luft z tego komputera
ready-restart-try = Najpierw zapisz to, nad czym pracujesz. Luft otworzy się mniej więcej po minucie, a następne uruchomienie przywróci system Windows.
ready-restart-install = Najpierw zapisz to, nad czym pracujesz. Instalator otworzy się mniej więcej po minucie i nic się nie zmieni, dopóki tam tego nie potwierdzisz.
ready-fast-startup-title = Wyłącz szybkie uruchamianie w systemie Windows
ready-fast-startup-description = Windows będzie się wtedy wyłączać całkowicie, więc dźwięk, Wi-Fi i Bluetooth uruchomią się w systemie Luft od nowa.
ready-clock-title = Zgodny zegar w obu systemach
ready-clock-description = Windows będzie odczytywać zegar komputera tak jak Luft, więc czas nie będzie przeskakiwać przy przełączaniu.
ready-remove-title = Usunąć Luft z tego komputera?
ready-remove-description = Meet Luft usunie wszystko, co zostało dodane, w tym karton przeprowadzkowy, i odda systemowi Windows całe miejsce.

## Luft is ready on Linux

linux-ready-description = Wybierz, jak chcesz go poznać. Dopóki nie zdecydujesz inaczej, uruchamia się { $system }.
linux-ready-this-system = ten system
linux-ready-update-description = Jest nowsza kompilacja. Zastąpi tę, którą przechowuje Meet Luft, i zachowa dzienniki z wypróbowywania.
linux-ready-try-description = Uruchom ponownie w systemie Luft bez zmieniania czegokolwiek. Następnym razem uruchomi się { $system }, jak zwykle.
linux-ready-replace-title = Zastąp system { $system }
linux-ready-replace-description = Luft zajmie jego miejsce i zachowa twoje pliki, konto, sieci Wi-Fi i inne dyski. Stary system zostaje, dopóki go nie usuniesz.
linux-ready-install-description = Uruchom ponownie w instalatorze, aby umieścić Luft na innym dysku lub w wolnym miejscu.
linux-ready-remove = Usuń Luft z tego komputera
linux-ready-restart-try = Najpierw zapisz to, nad czym pracujesz. Luft otworzy się mniej więcej po minucie, a przy następnym uruchomieniu wróci { $system }.
linux-ready-restart-replace = Najpierw zapisz to, nad czym pracujesz. Instalator otworzy się z wybranym do zastąpienia systemem { $system } i pokaże, co zostanie, zanim cokolwiek się zmieni.
linux-ready-remove-title = Usunąć Luft z tego komputera?
linux-ready-remove-description = Meet Luft usunie pliki systemu Luft, jego pliki rozruchowe i wpis rozruchowy. Wszystko inne zostanie bez zmian.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Twój Luft
luft-looking = Na tym komputerze znaleziono system Luft.
luft-checking = Sprawdzanie dysku systemu Luft…
luft-description-beside = Luft jest zainstalowany obok systemu Windows na tym komputerze.
luft-description-drive = Luft jest zainstalowany na dysku { $drive }.
luft-bar-used = { $size }, zajęte: { $used }
luft-resize-title = Zmień ilość miejsca dla systemu Luft
luft-resize-description = Przydziel systemowi Luft więcej miejsca z systemu Windows albo oddaj jego część systemowi Windows.
luft-resize-encrypted = Dysk systemu Luft jest zaszyfrowany, więc przeniesienie go wymagałoby klucza odzyskiwania. Najpierw wyłącz szyfrowanie urządzenia w Ustawieniach systemu Luft, a potem wróć.
luft-resize-apart = Między systemami Windows i Luft jest inna partycja, więc nie mogą dzielić się miejscem.
luft-resize-unreadable = Meet Luft nie może ustalić, ile miejsca zajmuje Luft.
luft-pending-grow = Luft powiększy się przy następnym uruchomieniu
luft-pending-grow-description = Uruchom ponownie w systemie Luft i nie wyłączaj go przez kilka minut, aż przeniesie się na nowe miejsce. W tym czasie możesz z niego korzystać.
luft-pending-shrink = Luft zwolni miejsce przy następnym uruchomieniu
luft-pending-shrink-description = Uruchom ponownie w systemie Luft i nie wyłączaj go przez kilka minut, aż przeniesie swoje pliki. Potem ponownie otwórz Meet Luft w systemie Windows, aby Windows odzyskał to miejsce.
luft-windows-free-title = Oddaj wolne miejsce systemowi Windows
luft-windows-free-description = Tuż za partycją systemu Windows jest { $size } nieużywanego miejsca. Windows może je odzyskać.
luft-leftovers-title = Posprzątaj po wypróbowywaniu systemu Luft
luft-leftovers-description = Partycje utworzone przez Meet Luft do uruchamiania systemu Luft wciąż tu są. Luft już ich nie potrzebuje.
luft-start = Uruchom ponownie w systemie Luft
luft-cancel = Anuluj zmianę
luft-restart = Najpierw zapisz to, nad czym pracujesz. Luft uruchomi się mniej więcej po minucie, a następne uruchomienie przywróci system Windows.
luft-restart-pending = Najpierw zapisz to, nad czym pracujesz. Luft uruchomi się mniej więcej po minucie i sam przeniesie swoje pliki, co potrwa kilka minut. W tym czasie możesz z niego korzystać.
luft-remove = Usuń Luft z tego komputera
luft-remove-title = Usunąć Luft z tego komputera?
luft-remove-description = System Luft zostanie usunięty razem z całą zawartością (łącznie { $size }), a Windows odzyska to miejsce. Komputer będzie uruchamiać system Windows tak jak wcześniej. Tego nie można cofnąć.
luft-remove-drive-description = System Luft zostanie usunięty z dysku { $drive } razem z całą zawartością (łącznie { $size }). Komputer będzie uruchamiać system Windows tak jak wcześniej. Tego nie można cofnąć.
luft-remove-confirm = Usuń Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Ile miejsca dla systemu Luft?
resize-description = Przeciągnij, aby podzielić dysk między systemy Windows i Luft. Luft sam wprowadzi zmianę przy następnym uruchomieniu.
resize-measuring = Windows sprawdza, ile miejsca może oddać. Na dużym dysku może to potrwać kilka minut.
resize-full = Luft jest zbyt zapełniony, aby go przenieść, a Windows nie może oddać mu wystarczająco dużo miejsca. Najpierw zwolnij trochę miejsca w systemie Luft lub w systemie Windows.
resize-used = Pliki systemu Luft zajmują { $size }.
resize-least = Zmień rozmiar o co najmniej { $size }.
resize-apply = Zmień
resize-grow-title = Przydzielić systemowi Luft jeszcze { $size }?
resize-grow-description = Windows od razu się zmniejszy. Luft przeniesie się na nowe miejsce przy następnym uruchomieniu, co potrwa kilka minut. Nie odłączaj komputera od zasilania.
resize-shrink-title = Oddać systemowi Windows { $size }?
resize-shrink-description = Luft przeniesie swoje pliki przy następnym uruchomieniu, co potrwa kilka minut. Potem ponownie otwórz Meet Luft, a Windows odzyska to miejsce. Nie odłączaj komputera od zasilania.

## Packing things to take along to Luft (the moving box)

box-title = Zabierz swoje rzeczy
box-description = Wybierz, co zabrać. Po instalacji Luft rozpakuje to na twoim nowym koncie, a z systemu Windows nic nie zostanie usunięte.
box-looking = Przeglądanie folderów…
box-folder-desktop = Pulpit
box-folder-documents = Dokumenty
box-folder-downloads = Pobrane
box-folder-music = Muzyka
box-folder-pictures = Obrazy
box-folder-videos = Wideo
box-folder-size = { $size }, { $files ->
    [one] { $files } plik
    [few] { $files } pliki
    [many] { $files } plików
   *[other] { $files } pliku
}
box-wifi-title = Sieci Wi-Fi
box-wifi-description = Z hasłami, więc Luft od razu będzie online
box-bluetooth-title = Urządzenia Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } urządzenie, gotowe bez ponownego parowania
    [few] { $devices } urządzenia, gotowe bez ponownego parowania
    [many] { $devices } urządzeń, gotowych bez ponownego parowania
   *[other] { $devices } urządzenia, gotowego bez ponownego parowania
}
box-wallpaper-title = Tapeta
box-wallpaper-description = Obraz z pulpitu systemu Windows
box-account-title = Twoja nazwa i zdjęcie
box-total-slow = { $size }, pakowanie potrwa około { $minutes ->
    [one] { $minutes } minuty
    [few] { $minutes } minut
    [many] { $minutes } minut
   *[other] { $minutes } minuty
}
box-pack = Spakuj

## Progress while Meet Luft works

working-shrinking = Robienie miejsca
    .description = Windows przenosi swoje pliki, aby zwolnić miejsce. Może to potrwać kilka minut.
working-erasing = Wymazywanie dysku
    .description = Windows czyści go, aby Luft mógł zająć go w całości.
working-partitioning = Przygotowywanie miejsca na Luft
    .description = Przygotowywanie partycji, z których uruchamia się Luft.
working-downloading = Przenoszenie systemu Luft
    .description = Luft jest kopiowany prosto do swojego miejsca i sprawdzany po drodze.
working-packing = Pakowanie twoich rzeczy
    .description = Kopiowanie wszystkiego, co wybrano, do kartonu przeprowadzkowego. Duże foldery zajmują trochę czasu.
working-removing = Usuwanie systemu Luft
    .description = Oddawanie miejsca systemowi Windows.
working-removing-linux = Usuwanie systemu Luft
    .description = Usuwanie jego plików i wpisu rozruchowego.
working-writing = Tworzenie pamięci USB
    .description = Luft jest zapisywany na całej pamięci USB. Nie odłączaj jej.
working-copying = Dodawanie systemu Luft do Ventoy
    .description = Luft jest kopiowany obok innych obrazów ISO na pamięci USB. Nie odłączaj jej.
working-verifying = Sprawdzanie pamięci USB
    .description = Odczytywanie wszystkiego z powrotem, aby upewnić się, że da się z niej uruchomić komputer.
working-stick-downloading = Pobieranie systemu Luft
    .description = Jest sprawdzany po drodze i zachowywany, więc następna pamięć USB powstanie szybciej.
working-progress = { $done } z { $total }
working-keep-open = Nie zamykaj tego okna.

## After Luft was removed

removed-title = Wszystko wróciło do poprzedniego stanu
removed-description = { $platform ->
    [linux] Pliki systemu Luft i jego wpis rozruchowy zostały usunięte, a komputer uruchamia się tak jak wcześniej. Wracaj, kiedy chcesz.
   *[windows] Partycje systemu Luft i jego wpis rozruchowy zostały usunięte, a Windows znów ma całe swoje miejsce. Wracaj, kiedy chcesz.
}

## Making a USB stick

stick-title = Utwórz pamięć USB
stick-description = Luft uruchomi się z niej na dowolnym komputerze, aby go wypróbować lub zainstalować.
stick-looking = Wyszukiwanie pamięci USB…
stick-none = Podłącz pamięć USB o pojemności co najmniej { $size }. Pojawi się tutaj.
stick-drives-label = Pamięci USB
stick-offer = { $name }, { $size }
stick-make = Utwórz pamięć USB
stick-drive-empty = Pusta
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Za mała dla systemu Luft
stick-ventoy-title = Ta pamięć USB używa Ventoy
stick-ventoy-description = Dodać do niej Luft czy wymazać całą pamięć i zrobić z niej pamięć z systemem Luft?
stick-erase-it = Wymaż
stick-add = Dodaj Luft
stick-replace-title = Zastąpić Luft, który na niej jest?
stick-replace-description = { $count ->
    [one] Na tej pamięci USB jest już { $names }. Nowy Luft może zająć jego miejsce.
    [few] Na tej pamięci USB są już { $names }. Nowy Luft może zająć ich miejsce.
    [many] Na tej pamięci USB są już { $names }. Nowy Luft może zająć ich miejsce.
   *[other] Na tej pamięci USB są już { $names }. Nowy Luft może zająć ich miejsce.
}
stick-keep = { $count ->
    [one] Zachowaj oba
    [few] Zachowaj wszystkie
    [many] Zachowaj wszystkie
   *[other] Zachowaj wszystkie
}
stick-replace = Zastąp
stick-full-title = Brak miejsca na Luft
stick-full-description = Luft potrzebuje { $needed }, a na tej pamięci USB wolne jest { $free }. Zwolnij na niej miejsce albo ją wymaż i zrób z niej pamięć z systemem Luft.
stick-erase-title = Wymazać { $name }?
stick-erase-description = Wszystko na tej pamięci USB ({ $size }) zostanie wymazane i zastąpione systemem Luft. Tego nie można cofnąć.
stick-erase-confirm = Wymaż i utwórz pamięć USB
stick-done-title = Pamięć USB z systemem Luft jest gotowa
stick-done-ventoy-title = Luft jest na twojej pamięci USB z Ventoy
stick-done-take-out = Możesz ją teraz wyjąć.
stick-done-eject = Przed wyjęciem wysuń ją.
stick-done-start = Aby uruchomić z niej komputer, podłącz ją i wybierz ją w menu rozruchu, które otwiera się klawiszem takim jak F12, F8 lub Esc tuż po włączeniu.
stick-done-ventoy-key = Przy włączonym Secure Boot Ventoy przy pierwszym uruchomieniu raz poprosi o dodanie własnego klucza.
stick-done = Gotowe
stick-done-another = Utwórz kolejną
