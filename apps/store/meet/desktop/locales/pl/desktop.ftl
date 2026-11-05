## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-bitowy procesor Intel lub AMD
check-processor-x64-detail = Luft na nim działa.
check-processor-arm = Procesor Arm
check-processor-arm-detail = Na razie Luft działa tylko na procesorach Intel i AMD.
check-processor-32-bit-windows = 32-bitowy system Windows
check-processor-32-bit-system = 32-bitowy system
check-processor-32-bit-detail = Luft wymaga 64-bitowego procesora Intel lub AMD.
check-startup-uefi = Uruchamianie w trybie UEFI
check-startup-uefi-windows = Luft uruchamia się w ten sam nowoczesny sposób.
check-startup-uefi-linux = Luft doda własny wpis rozruchowy, a { $system } będzie się uruchamiać tak jak teraz.
check-startup-bios = Uruchamianie w starszym trybie BIOS
check-startup-bios-windows = Luft wymaga UEFI. Windows może przejść na nie za pomocą MBR2GPT, a potem można włączyć UEFI w ustawieniach oprogramowania układowego.
check-startup-bios-linux = Luft wymaga UEFI. Włącz je w ustawieniach oprogramowania układowego, razem z obecnym systemem, a potem sprawdź ponownie.
check-startup-mbr = Dysk używa starej tablicy partycji
check-startup-mbr-windows = Luft wymaga dysku GPT. Windows może go przekonwertować za pomocą MBR2GPT bez utraty plików.
check-startup-mbr-linux = Luft wymaga dysku GPT, aby się z niego uruchomić.
check-startup-no-esp = Brak partycji systemowej EFI
check-startup-no-esp-detail = Luft dodaje swoje pliki rozruchowe obok tych, które są już na partycji systemowej EFI, a tej partycji nie ma.
check-startup-esp-full = Partycja systemowa EFI jest pełna
check-startup-esp-full-detail = Luft potrzebuje tam { $size } MB na swoje pliki rozruchowe. Miejsce zajmują zwykle stare jądra lub wpisy rozruchowe.
check-folder-fine = Partycje pozostaną bez zmian
check-folder-fine-detail = Luft jest przechowywany jako plik na twoim dysku { $filesystem } i stamtąd się uruchamia.
check-folder-encrypted = Twoje pliki są na zaszyfrowanym dysku
check-folder-encrypted-detail = Luft nie potrafi jeszcze uruchomić się z zaszyfrowanego dysku. Aby go wypróbować, użyj pamięci USB.
check-folder-combined = Twoje pliki są na więcej niż jednej partycji
check-folder-combined-detail = Luft nie potrafi jeszcze uruchomić się z LVM ani RAID. Aby go wypróbować, użyj pamięci USB.
check-folder-filesystem = Luft nie uruchomi się z systemu plików { $filesystem }
check-folder-filesystem-detail = Uruchamia się z dysków ext4, btrfs i XFS. Aby go wypróbować, użyj pamięci USB.
check-space-free = Wolne: { $size } GB
check-space-free-linux = Podczas wypróbowywania Luft zajmuje około { $size } GB.
check-space-up-to = Do { $size } GB dla systemu Luft
check-space-up-to-detail = Windows zachowuje swoje pliki i miejsce na rozwój.
check-space-free-already = Wolne jest już { $size } GB, więc Windows oddaje mniej.
check-space-other-drive = Na dysku { $drive } jest miejsce dla systemu Luft.
check-space-erase-drive = Po wymazaniu dysku { $drive } będzie na nim miejsce dla systemu Luft.
check-space-short = Za mało wolnego miejsca
check-space-short-windows = Luft potrzebuje około { $needed } GB, które Windows może oddać. Zwolnij { $missing } GB w systemie Windows, na przykład za pomocą Oczyszczania dysku, a potem sprawdź ponownie.
check-space-short-linux = Luft potrzebuje około { $needed } GB, aby się uruchomić. Zwolnij { $missing } GB, a potem sprawdź ponownie.
check-system-replaceable = Luft może zająć jego miejsce i zachować twoje pliki, konto i ustawienia.
check-system-single = Twoje pliki znajdują się na jednej partycji z systemem, więc zastąpienie go z zachowaniem plików nie jest jeszcze obsługiwane. Wypróbowanie i instalacja systemu Luft działają.
check-system-encrypted = System jest zaszyfrowany, więc zastąpienie go z zachowaniem plików nie jest jeszcze obsługiwane.
check-system-unknown = Jego dysk ma układ, którego Luft nie potrafi jeszcze zastąpić z zachowaniem plików.
check-encryption-off = Windows nie jest zaszyfrowany
check-encryption-off-detail = Aplikacja Zainstaluj Luft może odczytać jego ustawienia i twoje urządzenia Bluetooth.
check-encryption-on = Windows jest zaszyfrowany funkcją BitLocker
check-encryption-on-detail = To nie problem. Windows sam robi miejsce, a Meet Luft przenosi to, czego Luft nie odczyta z zablokowanego dysku. Na wszelki wypadek miej pod ręką klucz odzyskiwania.
check-encryption-changing = BitLocker wciąż szyfruje lub odszyfrowuje dysk
check-encryption-changing-detail = Poczekaj, aż Windows skończy, i wróć. Postęp widać w Ustawieniach, w sekcji Szyfrowanie urządzenia.
check-fast-startup-on = Szybkie uruchamianie jest włączone
check-fast-startup-on-detail = Windows hibernuje się zamiast się wyłączać, przez co jego dysk pozostaje zablokowany. Meet Luft zaproponuje wyłączenie tej funkcji przed instalacją.
check-fast-startup-off = Szybkie uruchamianie jest wyłączone
check-fast-startup-off-detail = Windows wyłącza się całkowicie.
check-secure-boot-on = Secure Boot jest włączony
check-secure-boot-on-detail = Może taki zostać. Luft raz poprosi na niebieskim ekranie o dodanie swojego klucza.
check-secure-boot-off = Secure Boot jest wyłączony
check-secure-boot-off-detail = Luft działa bez niego, ale gry z ochroną przed oszustwami go wymagają. { $turningOn }
check-secure-boot-restart-into = Meet Luft może uruchomić ponownie komputer w ustawieniach oprogramowania układowego, gdzie ta opcja jest w { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft może uruchomić ponownie komputer w ustawieniach oprogramowania układowego, gdzie ta opcja jest zwykle w Security lub Boot.
check-secure-boot-turn-on = Aby go włączyć, uruchom ponownie komputer i naciśnij { $key }, gdy pojawi się logo { $maker }, a potem przejdź do { $place }.
check-secure-boot-turn-on-anywhere = Aby go włączyć, otwórz ustawienia oprogramowania układowego podczas uruchamiania komputera i poszukaj w Security lub Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, a potem Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, a potem Secure Boot
check-firmware-place-security-or-advanced = Security lub Advanced, a potem Secure Boot Configuration
check-firmware-place-security-or-boot = Security lub Boot, a potem Secure Boot
check-firmware-place-boot = Boot, a potem Secure Boot
check-firmware-place-settings = Settings, potem Security, a potem Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 w laptopach ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 lub Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = przycisk zwiększania głośności

## More of the computer's hardware

check-tpm-detail = Zaszyfrowany Luft może odblokować się sam przy uruchamianiu komputera.
check-tpm-missing = Brak TPM 2.0
check-tpm-missing-detail = Jeśli zaszyfrujesz Luft, przy każdym uruchomieniu poprosi o frazę hasła.
check-graphics = Grafika
check-graphics-detail = Działa od razu.
check-graphics-nvidia = Luft zainstaluje się ze sterownikiem firmy NVIDIA.
check-wifi-missing = Brak Wi-Fi
check-wifi-missing-detail = W systemie Luft użyj kabla sieciowego albo obejdź się bez sieci.
check-wifi-detail = Działa w systemie Luft.
check-wifi-broadcom = Niektóre układy Wi-Fi firmy Broadcom wymagają sterownika, którego Luft nie zawiera. Miej pod ręką kabel sieciowy lub telefon do tetheringu przez USB.
check-start-entries = { $count ->
    [one] Stary wpis rozruchowy
    [few] { $count } stare wpisy rozruchowe
    [many] { $count } starych wpisów rozruchowych
   *[other] { $count } starego wpisu rozruchowego
}
check-start-entries-detail = { $count ->
    [one] { $names } wskazuje system, którego nie ma już na tym komputerze. Można go usunąć.
    [few] { $names } wskazują systemy, których nie ma już na tym komputerze. Można je usunąć.
    [many] { $names } wskazują systemy, których nie ma już na tym komputerze. Można je usunąć.
   *[other] { $names } wskazują systemy, których nie ma już na tym komputerze. Można je usunąć.
}
check-download-unavailable = Nie można teraz pobrać systemu Luft
check-download-unavailable-detail = Meet Luft pobiera około 3 GB. Sprawdź połączenie z internetem i sprawdź ponownie albo użyj pobranego wcześniej obrazu ISO systemu Luft.

## Choosing a Luft ISO file

iso-dialog-title = Wybierz obraz ISO systemu Luft
iso-dialog-filter = Obraz ISO systemu Luft

## Saving the logs from trying Luft

logs-file-name = Dzienniki Luft { $name }
logs-no-desktop = Meet Luft nie może znaleźć twojego pulpitu
logs-not-saved = Meet Luft nie może zapisać dzienników z wypróbowywania systemu Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Nie udało się uruchomić pomocnika Meet Luft: { $error }
helper-not-allowed = Nie udzielono aplikacji Meet Luft zgody na zmiany na dysku
helper-stopped = Pomocnik Meet Luft przestał działać
helper-stopped-because = Pomocnik Meet Luft przestał działać: { $error }
helper-pipe-failed = Meet Luft nie może połączyć się ze swoim pomocnikiem: { $error }
helper-pipe-hijacked = { $pipe } otworzyło coś innego niż pomocnik Meet Luft
helper-record-not-saved = Meet Luft nie może zanotować, co zostało utworzone: { $error }
helper-no-room-yet = Najpierw zrób miejsce na Luft.
helper-not-ready-linux = Najpierw przygotuj Luft.
helper-not-ready-to-start-windows = Luft nie jest jeszcze gotowy do uruchomienia. Najpierw zrób dla niego miejsce.
helper-not-ready-to-start-linux = Luft nie jest jeszcze gotowy do uruchomienia. Najpierw go przygotuj.
helper-update-unfinished = Nie udało się dokończyć aktualizacji systemu Luft. Najpierw zaktualizuj go ponownie.
helper-room-too-small = Luft potrzebuje więcej miejsca.
helper-room-shortfall = Windows może oddać { $available } GB, a Luft potrzebuje { $needed } GB.
helper-gap-shortfall = To miejsce ma { $available } GB, a Luft potrzebuje { $needed } GB.
helper-place-gone = To miejsce nie jest już wolne. Sprawdź ponownie, gdzie zmieści się Luft.
helper-box-shortfall = Windows może oddać jeszcze { $available } GB, a wybrane rzeczy potrzebują { $needed } GB.
helper-box-room-shortfall = Miejsce systemu Luft pomieści jeszcze { $available } GB, a wybrane rzeczy potrzebują { $needed } GB.
helper-bluetooth-unreadable = Nie udało się otworzyć ustawień Bluetooth systemu Windows
helper-registry-not-opened = Nie udało się otworzyć { $key }: { $error }
helper-registry-not-changed = Nie udało się zmienić { $value }: { $error }
helper-registry-not-saved = Nie udało się zapisać { $file }: { $error }
helper-restart-failed = Nie udało się ponownie uruchomić komputera
helper-windows-restart-failed = Nie udało się ponownie uruchomić systemu Windows: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Ten komputer nie uruchamia się w trybie UEFI
firmware-variable-unreadable = Nie udało się odczytać { $name } z oprogramowania układowego: { $error }
firmware-variable-not-saved = Nie udało się zapisać { $name } w oprogramowaniu układowym: { $error }
firmware-entries-full = W oprogramowaniu układowym nie ma miejsca na kolejny wpis rozruchowy
firmware-entry-kept = Wpis rozruchowy { $entry } został zachowany przez system Windows

## Errors about drives and partitions

drive-list-failed = Nie udało się wyświetlić listy dysków: { $error }
drive-of-path-unknown = Nie udało się ustalić, na którym dysku jest { $path }
drive-windows-folder-missing = Nie znaleziono folderu systemu Windows
drive-windows-drive-missing = Nie znaleziono dysku systemu Windows
drive-windows-drive-missing-because = Nie znaleziono dysku systemu Windows: { $error }
drive-windows-partition-missing = Nie znaleziono partycji systemu Windows
drive-volume-missing = Nie znaleziono woluminu { $path }
drive-storage-error = { $what } (błąd magazynu systemu Windows { $code })
drive-shrink-size-unknown = Windows nie może ustalić, do jakiego rozmiaru można zmniejszyć jego partycję
drive-resize-failed = Windows nie może zmienić rozmiaru swojej partycji
drive-create-failed = Windows nie może utworzyć partycji dla systemu Luft
drive-hide-failed = Windows nie może ukryć nowej partycji w Eksploratorze plików
drive-format-failed = Windows nie może sformatować nowej partycji
drive-remove-failed = Windows nie może usunąć jednej z partycji systemu Luft
drive-new-partition-missing = Nie znaleziono nowej partycji
drive-new-partition-no-volume = Nowa partycja nie ma woluminu
drive-start-no-guid = Partycja rozruchowa nie ma identyfikatora GUID
drive-live-no-guid = Partycja systemu Luft nie ma identyfikatora GUID
drive-box-no-guid = Karton przeprowadzkowy nie ma identyfikatora GUID
drive-guid-unreadable = Nie można odczytać identyfikatora GUID partycji
drive-not-gpt = Tablica partycji dysku nie jest typu GPT
drive-start-no-volume = Partycja rozruchowa nie ma woluminu
drive-live-no-volume = Partycja systemu Luft nie ma woluminu
drive-new-live-no-volume = Nowa partycja systemu Luft nie ma woluminu
drive-partitions-not-noted = W zapiskach Meet Luft brakuje partycji systemu Luft
drive-partitions-gone = Partycje systemu Luft zniknęły
drive-partition-gone = Partycja zniknęła
drive-gone = Dysk zniknął
drive-erase-failed = Windows nie może wymazać dysku
drive-erased-no-room = Na wymazanym dysku nie ma miejsca na Luft
drive-start-partition-foreign = Partycja rozruchowa systemu Luft nie została utworzona przez Meet Luft
drive-start-partition-gone = Partycja rozruchowa systemu Luft zniknęła
drive-start-partition-not-listed = Partycji rozruchowej systemu Luft nie ma w tablicy partycji
drive-no-esp = Ten komputer nie ma partycji systemowej EFI
drive-esp-full = Na partycji systemowej EFI jest za mało miejsca na pliki rozruchowe systemu Luft.
drive-esp-not-opened = Nie udało się otworzyć partycji systemowej EFI
drive-esp-file-unreadable = Nie można odczytać pliku { $file } z partycji systemowej EFI
drive-esp-no-drive = Partycja systemowa EFI nie ma dysku
drive-esp-no-guid = Partycja systemowa EFI nie ma identyfikatora GUID
drive-no-uuid = Dysk, na którym jest przechowywany Luft, nie ma identyfikatora UUID
drive-folder-unreadable = Luft nie może uruchomić się z dysku, na którym są twoje pliki.
drive-folder-not-startable = Nie można uruchomić systemu z { $folder }

## Errors while changing Luft once it's installed

luft-gone = Systemu Luft nie ma już na tym komputerze
luft-not-resizable = Nie można teraz zmienić rozmiaru systemu Luft z poziomu systemu Windows
luft-size-not-allowed = Luft nie może mieć takiego rozmiaru
luft-space-promised = To miejsce jest zarezerwowane dla systemu Luft. Najpierw anuluj zmianę.
luft-no-start-entry = Nie znaleziono wpisu rozruchowego systemu Luft

## Errors while getting Luft

live-no-home-folder = Brak folderu domowego, w którym można przechowywać Luft
live-no-app-data-folder = Brak lokalnego folderu danych aplikacji, w którym można przechowywać Luft
live-pointer-unreadable = Nie można odczytać najnowszej wersji systemu Luft
live-not-published = Luft nie jest tam opublikowany
live-checksum-unreadable = Nie można odczytać pliku sumy kontrolnej
live-checksum-not-read = Nie udało się odczytać sumy kontrolnej systemu Luft: { $error }
live-download-damaged = Pobrany plik uszkodził się po drodze. Spróbuj ponownie.
live-download-incomplete = W pobranym systemie Luft brakuje pliku { $file }
live-download-not-resumable = Serwer nie może wznowić pobierania
live-not-signed = Plik { $iso } nie jest podpisany
live-signature-unreadable = Nie można odczytać podpisu pliku { $iso }
live-signature-wrong-key = Plik { $iso } nie jest podpisany przez Lantharos
live-signature-other-iso = Podpis dotyczy pliku { $signed }, a nie { $iso }
live-iso-out-of-order = Pliki w obrazie ISO są w kolejności, której Meet Luft nie może odczytać
live-iso-not-iso = To nie jest obraz ISO
live-iso-no-root = Obraz ISO nie ma folderu głównego
live-iso-no-joliet = Obraz ISO nie ma nazw Joliet
live-not-removed = Nie udało się usunąć { $path }: { $error }

## Errors while making a USB stick

stick-gone = Pamięci USB już nie ma. Podłącz ją ponownie i wybierz jeszcze raz.
stick-too-small = Luft nie mieści się na tej pamięci USB. Użyj pamięci o pojemności co najmniej 4 GB.
stick-damaged = Obraz ISO nie zgadza się ze swoją sumą kontrolną. Mógł zostać uszkodzony po drodze.
stick-read-back-differs = Z pamięci USB odczytano coś innego, niż zapisano. Może być zużyta, więc spróbuj innej.
stick-download-unavailable = Nie można teraz pobrać systemu Luft: { $error }
stick-download-failed = Nie udało się pobrać systemu Luft: { $error }
stick-checksum-unreadable = Nie można odczytać sumy kontrolnej obrazu ISO: { $error }
stick-file-unreadable = Nie można odczytać { $path }: { $error }
stick-iso-unreadable = Nie można odczytać obrazu ISO: { $error }
stick-iso-no-name = Obraz ISO nie ma nazwy
stick-iso-ended-early = Obraz ISO kończy się przedwcześnie
stick-iso-already-there = Plik { $name } jest już na pamięci USB.
stick-no-room = Na pamięci USB nie ma miejsca na Luft. Najpierw zwolnij na niej { $size } MB.
stick-older-not-removed = Nie udało się usunąć starszej wersji systemu Luft: { $error }
stick-copy-stopped = Kopiowanie systemu Luft na pamięć USB zostało przerwane: { $error }
stick-not-opened = Nie udało się otworzyć pamięci USB: { $error }
stick-write-stopped = Zapisywanie na pamięć USB zostało przerwane: { $error }
stick-not-synced = Pamięć USB nie przyjęła wszystkich danych: { $error }
stick-read-back-failed = Nie udało się odczytać zawartości pamięci USB: { $error }
stick-in-use = Pamięć USB jest nadal używana: { $error }
stick-device-in-use = Urządzenie { $device } jest nadal używane: { $error }
stick-volume-not-opened = Nie udało się otworzyć woluminu pamięci USB: { $error }
stick-volume-in-use = Pamięć USB jest nadal używana. Zamknij to, co ma na niej otwarte pliki, i spróbuj ponownie ({ $error })
stick-not-dismounted = Windows nie może odłączyć pamięci USB: { $error }
stick-not-cleared = Windows nie może wyczyścić pamięci USB: { $error }
stick-not-refreshed = Windows nie może ponownie odczytać pamięci USB: { $error }
stick-not-ventoy = Ta pamięć USB nie używa już Ventoy.
stick-ventoy-not-opened = Nie udało się otworzyć partycji Ventoy: { $error }
stick-ventoy-not-opened-windows = Windows nie może otworzyć partycji Ventoy
stick-udisks-missing = Meet Luft potrzebuje usługi UDisks, aby korzystać z pamięci USB: { $error }
