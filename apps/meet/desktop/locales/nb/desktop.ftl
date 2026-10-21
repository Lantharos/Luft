## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = 64-biters Intel- eller AMD-prosessor
check-processor-x64-detail = Luft kjører på den.
check-processor-arm = Arm-prosessor
check-processor-arm-detail = Luft kjører foreløpig bare på Intel- og AMD-prosessorer.
check-processor-32-bit-windows = 32-biters Windows
check-processor-32-bit-system = 32-biters system
check-processor-32-bit-detail = Luft trenger en 64-biters Intel- eller AMD-prosessor.
check-startup-uefi = Starter med UEFI
check-startup-uefi-windows = Luft starter på den samme moderne måten.
check-startup-uefi-linux = Luft legger til sin egen oppstartsoppføring, og { $system } fortsetter å starte som nå.
check-startup-bios = Starter i eldre BIOS-modus
check-startup-bios-windows = Luft trenger UEFI. Windows kan bytte med MBR2GPT, og deretter kan UEFI slås på i fastvareinnstillingene.
check-startup-bios-linux = Luft trenger UEFI. Slå det på i fastvareinnstillingene, sammen med systemet som allerede er her, og sjekk igjen.
check-startup-mbr = Disken bruker en gammel partisjonstabell
check-startup-mbr-windows = Luft trenger en GPT-disk. Windows kan konvertere den med MBR2GPT uten å miste filer.
check-startup-mbr-linux = Luft trenger en GPT-disk å starte fra.
check-startup-no-esp = Ingen EFI-systempartisjon
check-startup-no-esp-detail = Luft legger oppstartsfilene sine ved siden av dem som allerede ligger på EFI-systempartisjonen, og det finnes ingen.
check-startup-esp-full = EFI-systempartisjonen er full
check-startup-esp-full-detail = Luft trenger { $size } MB der til oppstartsfilene sine. Det er som regel gamle kjerner eller oppstartsoppføringer som tar opp plassen.
check-folder-fine = Ingen partisjoner endres
check-folder-fine-detail = Luft lagres som en fil på { $filesystem }-disken din og starter derfra.
check-folder-encrypted = Filene dine ligger på en kryptert disk
check-folder-encrypted-detail = Luft kan ikke starte fra en kryptert disk ennå. Bruk en minnepinne for å prøve det i stedet.
check-folder-combined = Filene dine er spredt over mer enn én partisjon
check-folder-combined-detail = Luft kan ikke starte fra LVM eller RAID ennå. Bruk en minnepinne for å prøve det i stedet.
check-folder-filesystem = Luft kan ikke starte fra { $filesystem }
check-folder-filesystem-detail = Det starter fra ext4-, btrfs- og XFS-disker. Bruk en minnepinne for å prøve det i stedet.
check-space-free = { $size } GB ledig
check-space-free-linux = Luft tar omtrent { $size } GB mens du prøver det.
check-space-up-to = Opptil { $size } GB til Luft
check-space-up-to-detail = Windows beholder filene sine og plass til å vokse.
check-space-free-already = Av dette er { $size } GB allerede ledig, så Windows gir fra seg mindre.
check-space-other-drive = Det er plass til det på { $drive }.
check-space-erase-drive = Det er plass til det på { $drive } når den disken er slettet.
check-space-short = Ikke nok ledig plass
check-space-short-windows = Luft trenger omtrent { $needed } GB som Windows kan avse. Frigjør { $missing } GB i Windows, for eksempel med Diskopprydding, og sjekk igjen.
check-space-short-linux = Luft trenger omtrent { $needed } GB å starte fra. Frigjør { $missing } GB, og sjekk igjen.
check-system-replaceable = Luft kan ta plassen og beholde filene, kontoen og innstillingene dine.
check-system-single = Filene dine ligger på samme partisjon som systemet, så å erstatte det og beholde dem støttes ikke ennå. Du kan fortsatt prøve og installere Luft.
check-system-encrypted = Det er kryptert, så å erstatte det og beholde filene støttes ikke ennå.
check-system-unknown = Disken er satt opp på en måte Luft ikke kan erstatte ennå uten å miste filene dine.
check-encryption-off = Windows er ikke kryptert
check-encryption-off-detail = Installer Luft kan lese innstillingene og Bluetooth-enhetene dine.
check-encryption-on = Windows er kryptert med BitLocker
check-encryption-on-detail = Det går fint. Windows lager plassen selv, og Meet Luft tar med det Luft ikke kan lese fra en låst disk. Ha gjenopprettingsnøkkelen for hånden, for sikkerhets skyld.
check-encryption-changing = BitLocker krypterer eller dekrypterer fortsatt
check-encryption-changing-detail = Vent til Windows er ferdig, og kom tilbake. Du ser hvor langt det har kommet i Innstillinger, under Enhetskryptering.
check-fast-startup-on = Rask oppstart er på
check-fast-startup-on-detail = Windows går i dvalemodus i stedet for å slå seg av, og det holder disken låst. Meet Luft tilbyr å slå det av før installeringen.
check-fast-startup-off = Rask oppstart er av
check-fast-startup-off-detail = Windows slår seg helt av.
check-secure-boot-on = Secure Boot er på
check-secure-boot-on-detail = Det kan være på. Luft ber én gang, på en blå skjerm, om å legge til nøkkelen sin.
check-secure-boot-off = Secure Boot er av
check-secure-boot-off-detail = Luft virker uten, men spill med juksebeskyttelse trenger det. { $turningOn }
check-secure-boot-restart-into = Meet Luft kan starte på nytt i fastvareinnstillingene, der det ligger under { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft kan starte på nytt i fastvareinnstillingene, der det som regel ligger under Security eller Boot.
check-secure-boot-turn-on = For å slå det på starter du på nytt og trykker på { $key } når { $maker }-logoen vises, og går til { $place }.
check-secure-boot-turn-on-anywhere = For å slå det på åpner du fastvareinnstillingene mens datamaskinen starter, og ser under Security eller Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security og deretter Secure Boot
check-firmware-place-boot-configuration = Boot Configuration og deretter Secure Boot
check-firmware-place-security-or-advanced = Security eller Advanced og deretter Secure Boot Configuration
check-firmware-place-security-or-boot = Security eller Boot og deretter Secure Boot
check-firmware-place-boot = Boot og deretter Secure Boot
check-firmware-place-settings = Settings, deretter Security og så Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 på en ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 eller Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = volum opp

## More of the computer's hardware

check-tpm-detail = Hvis Luft er kryptert, kan det låse seg opp selv når datamaskinen starter.
check-tpm-missing = Ingen TPM 2.0
check-tpm-missing-detail = Hvis du krypterer Luft, ber det om en passfrase hver gang det starter.
check-graphics = Grafikk
check-graphics-detail = Virker rett ut av esken.
check-graphics-nvidia = Luft installeres med NVIDIAs egen driver.
check-wifi-missing = Ingen Wi-Fi
check-wifi-missing-detail = Bruk en nettverkskabel i Luft, eller ingenting.
check-wifi-detail = Virker i Luft.
check-wifi-broadcom = Noen Broadcom-wifibrikker trenger en driver Luft ikke har med. Ha en nettverkskabel eller en telefon for USB-deling for hånden.
check-start-entries = { $count ->
    [one] En gammel oppstartsoppføring
   *[other] { $count } gamle oppstartsoppføringer
}
check-start-entries-detail = { $count ->
    [one] { $names } peker på et system som ikke lenger finnes på denne datamaskinen. Den kan ryddes bort.
   *[other] { $names } peker på systemer som ikke lenger finnes på denne datamaskinen. De kan ryddes bort.
}
check-download-unavailable = Luft kan ikke lastes ned akkurat nå
check-download-unavailable-detail = Meet Luft laster ned omtrent 3 GB. Sjekk at du er på nett, og sjekk igjen, eller bruk en Luft-ISO du allerede har.

## Choosing a Luft ISO file

iso-dialog-title = Velg en Luft-ISO
iso-dialog-filter = Luft-ISO

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Luft-logger { $name }
logs-no-desktop = Meet Luft fant ikke skrivebordet ditt
logs-not-saved = Meet Luft kunne ikke lagre loggene fra å prøve Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = Hjelperen til Meet Luft startet ikke: { $error }
helper-not-allowed = Meet Luft fikk ikke lov til å jobbe med disken
helper-stopped = Hjelperen til Meet Luft stoppet
helper-stopped-because = Hjelperen til Meet Luft stoppet: { $error }
helper-pipe-failed = Meet Luft fikk ikke kontakt med hjelperen sin: { $error }
helper-pipe-hijacked = Noe annet enn hjelperen til Meet Luft åpnet { $pipe }
helper-record-not-saved = Meet Luft kunne ikke notere hva det laget: { $error }
helper-no-room-yet = Lag plass til Luft først.
helper-not-ready-linux = Gjør Luft klart først.
helper-not-ready-to-start-windows = Luft er ikke klart til å starte ennå. Lag plass til det først.
helper-not-ready-to-start-linux = Luft er ikke klart til å starte ennå. Gjør det klart først.
helper-update-unfinished = Oppdateringen av Luft ble ikke fullført. Oppdater det på nytt først.
helper-room-too-small = Luft trenger mer plass enn det.
helper-room-shortfall = Windows kan avse { $available } GB, og Luft trenger { $needed } GB.
helper-gap-shortfall = Den plassen rommer { $available } GB, og Luft trenger { $needed } GB.
helper-place-gone = Den plassen er ikke ledig lenger. Sjekk igjen for å se hvor Luft får plass.
helper-box-shortfall = Windows kan avse { $available } GB til, og dette trenger { $needed } GB.
helper-box-room-shortfall = Plassen til Luft kan avse { $available } GB, og dette trenger { $needed } GB.
helper-bluetooth-unreadable = Bluetooth-innstillingene i Windows kunne ikke åpnes
helper-registry-not-opened = Kunne ikke åpne { $key }: { $error }
helper-registry-not-changed = Kunne ikke endre { $value }: { $error }
helper-registry-not-saved = Kunne ikke lagre { $file }: { $error }
helper-restart-failed = Datamaskinen startet ikke på nytt
helper-windows-restart-failed = Windows startet ikke på nytt: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Denne datamaskinen starter ikke med UEFI
firmware-variable-unreadable = Kunne ikke lese { $name } fra fastvaren: { $error }
firmware-variable-not-saved = Kunne ikke lagre { $name } i fastvaren: { $error }
firmware-entries-full = Fastvaren har ikke plass til flere oppstartsoppføringer
firmware-entry-kept = Windows beholdt oppstartsoppføringen { $entry }

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = Diskene kunne ikke listes opp: { $error }
drive-of-path-unknown = Kunne ikke finne ut hvilken disk { $path } ligger på
drive-windows-folder-missing = Fant ikke Windows-mappen
drive-windows-drive-missing = Fant ikke Windows-disken
drive-windows-drive-missing-because = Fant ikke Windows-disken: { $error }
drive-windows-partition-missing = Fant ikke Windows-partisjonen
drive-volume-missing = Fant ikke volumet { $path }
drive-storage-error = { $what } (Windows-lagringsfeil { $code })
drive-shrink-size-unknown = Windows kunne ikke finne ut hvor liten partisjonen kan bli
drive-resize-failed = Windows kunne ikke endre størrelsen på partisjonen sin
drive-create-failed = Windows kunne ikke lage en partisjon til Luft
drive-hide-failed = Windows kunne ikke holde den nye partisjonen utenfor Filutforsker
drive-format-failed = Windows kunne ikke formatere den nye partisjonen
drive-remove-failed = Windows kunne ikke fjerne en av partisjonene til Luft
drive-new-partition-missing = Fant ikke den nye partisjonen
drive-new-partition-no-volume = Den nye partisjonen har ikke noe volum
drive-start-no-guid = Oppstartspartisjonen har ingen GUID
drive-live-no-guid = Live-partisjonen har ingen GUID
drive-box-no-guid = Flytteesken har ingen GUID
drive-guid-unreadable = GUID-en til partisjonen kan ikke leses
drive-not-gpt = Partisjonstabellen på disken er ikke GPT
drive-start-no-volume = Oppstartspartisjonen har ikke noe volum
drive-live-no-volume = Partisjonen til Luft har ikke noe volum
drive-new-live-no-volume = Den nye partisjonen til Luft har ikke noe volum
drive-partitions-not-noted = Partisjonene til Luft mangler i notatene til Meet Luft
drive-partitions-gone = Partisjonene til Luft har forsvunnet
drive-partition-gone = En partisjon har forsvunnet
drive-gone = En disk har forsvunnet
drive-erase-failed = Windows kunne ikke slette disken
drive-erased-no-room = Den slettede disken har ikke plass til Luft
drive-start-partition-foreign = Oppstartspartisjonen til Luft er ikke laget av Meet Luft
drive-start-partition-gone = Oppstartspartisjonen til Luft er borte
drive-start-partition-not-listed = Oppstartspartisjonen til Luft står ikke i partisjonstabellen
drive-no-esp = Denne datamaskinen har ingen EFI-systempartisjon
drive-esp-full = EFI-systempartisjonen er for full til oppstartsfilene til Luft.
drive-esp-not-opened = EFI-systempartisjonen kunne ikke åpnes
drive-esp-file-unreadable = { $file } på EFI-systempartisjonen kan ikke leses
drive-esp-no-drive = EFI-systempartisjonen har ingen disk
drive-esp-no-guid = EFI-systempartisjonen har ingen GUID
drive-no-uuid = Disken Luft ligger på, har ingen UUID
drive-folder-unreadable = Luft kan ikke starte fra disken filene dine ligger på.
drive-folder-not-startable = { $folder } kan ikke startes fra

## Errors while changing Luft once it's installed

luft-gone = Luft er ikke lenger på denne datamaskinen
luft-not-resizable = Størrelsen på Luft kan ikke endres fra Windows akkurat nå
luft-size-not-allowed = Luft kan ikke ha den størrelsen
luft-space-promised = Den plassen er satt av til Luft. Avbryt endringen først.
luft-no-start-entry = Fant ikke oppstartsoppføringen til Luft

## Errors while getting Luft

live-no-home-folder = Det finnes ingen hjemmemappe å legge Luft i
live-no-app-data-folder = Det finnes ingen mappe for lokale appdata å legge Luft i
live-pointer-unreadable = Den nyeste versjonen av Luft kan ikke leses
live-not-published = Luft er ikke publisert der
live-checksum-unreadable = Kontrollsumfilen kan ikke leses
live-checksum-not-read = Kontrollsummen til Luft kunne ikke leses: { $error }
live-download-damaged = Nedlastingen ble skadet underveis. Prøv igjen.
live-download-incomplete = Luft mangler { $file } etter nedlastingen
live-download-not-resumable = Serveren kan ikke fortsette nedlastingen
live-not-signed = { $iso } er ikke signert
live-signature-unreadable = Signaturen til { $iso } kan ikke leses
live-signature-wrong-key = { $iso } er ikke signert av Lantharos
live-signature-other-iso = Signaturen gjelder { $signed }, ikke { $iso }
live-iso-out-of-order = Filene i ISO-filen ligger ikke i en rekkefølge Meet Luft kan lese
live-iso-not-iso = Dette er ikke et ISO-bilde
live-iso-no-root = ISO-filen har ingen rotmappe
live-iso-no-joliet = ISO-filen har ingen Joliet-navn
live-not-removed = { $path } kunne ikke fjernes: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = Minnepinnen er ikke der lenger. Sett den inn igjen, og velg den på nytt.
stick-too-small = Luft får ikke plass på denne minnepinnen. Bruk en på 4 GB eller mer.
stick-damaged = ISO-filen stemmer ikke med kontrollsummen. Den kan ha blitt skadet underveis.
stick-read-back-differs = Minnepinnen leste ikke tilbake det som ble skrevet til den. Den kan være utslitt, så prøv en annen.
stick-download-unavailable = Luft kan ikke lastes ned akkurat nå: { $error }
stick-download-failed = Luft kunne ikke lastes ned: { $error }
stick-checksum-unreadable = Kontrollsummen til ISO-filen kan ikke leses: { $error }
stick-file-unreadable = { $path } kan ikke leses: { $error }
stick-iso-unreadable = ISO-filen kan ikke leses: { $error }
stick-iso-no-name = ISO-filen har ikke noe navn
stick-iso-ended-early = ISO-filen sluttet for tidlig
stick-iso-already-there = { $name } ligger allerede på minnepinnen.
stick-no-room = Det er ikke plass til Luft på minnepinnen. Frigjør { $size } MB på den først.
stick-older-not-removed = Den eldre versjonen av Luft kunne ikke fjernes: { $error }
stick-copy-stopped = Kopieringen av Luft til minnepinnen stoppet: { $error }
stick-not-opened = Minnepinnen kunne ikke åpnes: { $error }
stick-write-stopped = Skrivingen til minnepinnen stoppet: { $error }
stick-not-synced = Minnepinnen tok ikke imot alt: { $error }
stick-read-back-failed = Minnepinnen kunne ikke leses tilbake: { $error }
stick-in-use = Minnepinnen er fortsatt i bruk: { $error }
stick-device-in-use = { $device } er fortsatt i bruk: { $error }
stick-volume-not-opened = Volumet på minnepinnen kunne ikke åpnes: { $error }
stick-volume-in-use = Minnepinnen er fortsatt i bruk. Lukk det som har filer åpne på den, og prøv igjen ({ $error })
stick-not-dismounted = Windows kunne ikke slippe minnepinnen: { $error }
stick-not-cleared = Windows kunne ikke tømme minnepinnen: { $error }
stick-not-refreshed = Windows kunne ikke se på minnepinnen igjen: { $error }
stick-not-ventoy = Denne minnepinnen bruker ikke Ventoy lenger.
stick-ventoy-not-opened = Ventoy-partisjonen kunne ikke åpnes: { $error }
stick-ventoy-not-opened-windows = Windows kan ikke åpne Ventoy-partisjonen
stick-udisks-missing = Meet Luft trenger UDisks for å bruke minnepinnen: { $error }
