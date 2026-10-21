## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = 64-bit Intel- eller AMD-processor
check-processor-x64-detail = Luft kører på den.
check-processor-arm = Arm-processor
check-processor-arm-detail = Luft kører indtil videre kun på Intel- og AMD-processorer.
check-processor-32-bit-windows = 32-bit Windows
check-processor-32-bit-system = 32-bit system
check-processor-32-bit-detail = Luft skal bruge en 64-bit Intel- eller AMD-processor.
check-startup-uefi = Starter med UEFI
check-startup-uefi-windows = Luft starter på samme moderne måde.
check-startup-uefi-linux = Luft tilføjer sin egen startpost, og { $system } bliver ved med at starte, som det gør nu.
check-startup-bios = Starter i ældre BIOS-tilstand
check-startup-bios-windows = Luft skal bruge UEFI. Windows kan skifte med MBR2GPT, og derefter kan UEFI slås til i firmwareindstillingerne.
check-startup-bios-linux = Luft skal bruge UEFI. Slå det til i firmwareindstillingerne sammen med det system, der allerede er her, og tjek så igen.
check-startup-mbr = Drevet bruger en gammel partitionstabel
check-startup-mbr-windows = Luft skal bruge et GPT-drev. Windows kan konvertere det med MBR2GPT uden at miste filer.
check-startup-mbr-linux = Luft skal bruge et GPT-drev at starte fra.
check-startup-no-esp = Ingen EFI-systempartition
check-startup-no-esp-detail = Luft lægger sine startfiler ved siden af dem, der allerede ligger på EFI-systempartitionen, og der er ingen.
check-startup-esp-full = EFI-systempartitionen er fuld
check-startup-esp-full-detail = Luft skal bruge { $size } MB der til sine startfiler. Det er som regel gamle kerner eller startposter, der optager pladsen.
check-folder-fine = Intet bliver ompartitioneret
check-folder-fine-detail = Luft gemmes som en fil på dit { $filesystem }-drev og starter derfra.
check-folder-encrypted = Dine filer ligger på et krypteret drev
check-folder-encrypted-detail = Luft kan endnu ikke starte fra et krypteret drev. Brug et USB-stik til at prøve det i stedet.
check-folder-combined = Dine filer fylder mere end én partition
check-folder-combined-detail = Luft kan endnu ikke starte fra LVM eller RAID. Brug et USB-stik til at prøve det i stedet.
check-folder-filesystem = Luft kan ikke starte fra { $filesystem }
check-folder-filesystem-detail = Det starter fra ext4-, btrfs- og XFS-drev. Brug et USB-stik til at prøve det i stedet.
check-space-free = { $size } GB ledig
check-space-free-linux = Luft fylder cirka { $size } GB, mens du prøver det.
check-space-up-to = Op til { $size } GB til Luft
check-space-up-to-detail = Windows beholder sine filer og plads til at vokse.
check-space-short = Ikke nok ledig plads
check-space-short-windows = Luft skal bruge cirka { $needed } GB, som Windows kan undvære. Frigør { $missing } GB i Windows, for eksempel med Diskoprydning, og tjek så igen.
check-space-short-linux = Luft skal bruge cirka { $needed } GB at starte fra. Frigør { $missing } GB, og tjek så igen.
check-system-replaceable = Luft kan tage dets plads og beholde dine filer, din konto og dine indstillinger.
check-system-single = Dine filer deler partition med systemet, så det kan endnu ikke erstattes, mens filerne beholdes. Du kan stadig prøve og installere Luft.
check-system-encrypted = Det er krypteret, så det kan endnu ikke erstattes, mens dine filer beholdes.
check-system-unknown = Dets drev er inddelt på en måde, så Luft endnu ikke kan erstatte det og beholde dine filer.
check-encryption-off = Windows er ikke krypteret
check-encryption-off-detail = Installer Luft kan læse dets indstillinger og dine Bluetooth-enheder.
check-encryption-on = Windows er krypteret med BitLocker
check-encryption-on-detail = Det er helt i orden. Windows gør selv pladsen, og Meet Luft tager det med, som Luft ikke kan læse fra et låst drev. Hav din genoprettelsesnøgle ved hånden for en sikkerheds skyld.
check-encryption-changing = BitLocker er stadig i gang med at kryptere eller dekryptere
check-encryption-changing-detail = Vent, til Windows er færdig, og kom så tilbage. Du kan se, hvor langt det er nået, i Indstillinger under Enhedskryptering.
check-fast-startup-on = Hurtig start er slået til
check-fast-startup-on-detail = Windows går i dvale i stedet for at lukke ned, og det holder drevet låst. Meet Luft tilbyder at slå det fra før installationen.
check-fast-startup-off = Hurtig start er slået fra
check-fast-startup-off-detail = Windows lukker helt ned.
check-secure-boot-on = Secure Boot er slået til
check-secure-boot-on-detail = Det kan forblive slået til. Luft beder én gang, på en blå skærm, om at tilføje sin nøgle.
check-secure-boot-off = Secure Boot er slået fra
check-secure-boot-off-detail = Luft virker uden, men spil med anti-snyd kræver det. { $turningOn }
check-secure-boot-restart-into = Meet Luft kan genstarte i firmwareindstillingerne, hvor det ligger under { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft kan genstarte i firmwareindstillingerne, hvor det som regel ligger under Security eller Boot.
check-secure-boot-turn-on = Slå det til ved at genstarte og trykke på { $key }, når { $maker }-logoet vises, og gå så til { $place }.
check-secure-boot-turn-on-anywhere = Slå det til ved at åbne firmwareindstillingerne, mens computeren starter, og se under Security eller Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security og derefter Secure Boot
check-firmware-place-boot-configuration = Boot Configuration og derefter Secure Boot
check-firmware-place-security-or-advanced = Security eller Advanced og derefter Secure Boot Configuration
check-firmware-place-security-or-boot = Security eller Boot og derefter Secure Boot
check-firmware-place-boot = Boot og derefter Secure Boot
check-firmware-place-settings = Settings, derefter Security og så Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 på en ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 eller Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = lydstyrke op

## More of the computer's hardware

check-tpm-detail = Et krypteret Luft kan låse sig selv op, når computeren starter.
check-tpm-missing = Ingen TPM 2.0
check-tpm-missing-detail = Hvis du krypterer Luft, beder det om en adgangsfrase, hver gang det starter.
check-graphics = Grafik
check-graphics-detail = Virker med det samme.
check-graphics-nvidia = Luft installeres med NVIDIAs egen driver.
check-wifi-missing = Ingen Wi-Fi
check-wifi-missing-detail = Brug et netværkskabel i Luft, eller klar dig uden.
check-wifi-detail = Virker i Luft.
check-wifi-broadcom = Nogle wi-fi-chips fra Broadcom skal bruge en driver, som Luft ikke har med. Hav et netværkskabel eller en telefon til USB-internetdeling ved hånden.
check-start-entries = { $count ->
    [one] En gammel startpost
   *[other] { $count } gamle startposter
}
check-start-entries-detail = { $count ->
    [one] { $names } peger på et system, der ikke længere er på denne pc. Den kan ryddes væk.
   *[other] { $names } peger på systemer, der ikke længere er på denne pc. De kan ryddes væk.
}
check-download-unavailable = Luft kan ikke hentes lige nu
check-download-unavailable-detail = Meet Luft henter cirka 3 GB. Tjek, at du er online, og tjek igen, eller brug en Luft-ISO, du allerede har.

## Choosing a Luft ISO file

iso-dialog-title = Vælg en Luft-ISO
iso-dialog-filter = Luft-ISO

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Luft-logfiler { $name }
logs-no-desktop = Meet Luft kunne ikke finde dit skrivebord
logs-not-saved = Meet Luft kunne ikke gemme logfilerne fra Prøv Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = Meet Lufts hjælper startede ikke: { $error }
helper-not-allowed = Meet Luft fik ikke lov til at arbejde med drevet
helper-stopped = Meet Lufts hjælper stoppede
helper-stopped-because = Meet Lufts hjælper stoppede: { $error }
helper-pipe-failed = Meet Luft kunne ikke tale med sin hjælper: { $error }
helper-pipe-hijacked = Noget andet end Meet Lufts hjælper åbnede { $pipe }
helper-record-not-saved = Meet Luft kunne ikke notere, hvad det har lavet: { $error }
helper-no-room-yet = Gør plads til Luft først.
helper-not-ready-linux = Gør Luft klar først.
helper-not-ready-to-start-windows = Luft er ikke klar til at starte endnu. Gør plads til det først.
helper-not-ready-to-start-linux = Luft er ikke klar til at starte endnu. Gør det klar først.
helper-update-unfinished = Opdateringen af Luft blev ikke færdig. Opdater det igen først.
helper-room-too-small = Luft skal bruge mere plads end det.
helper-room-shortfall = Windows kan undvære { $available } GB, og Luft skal bruge { $needed } GB.
helper-box-shortfall = Windows kan undvære { $available } GB mere, og det valgte skal bruge { $needed } GB.
helper-bluetooth-unreadable = Windows’ Bluetooth-indstillinger kunne ikke åbnes
helper-registry-not-opened = Kunne ikke åbne { $key }: { $error }
helper-registry-not-changed = Kunne ikke ændre { $value }: { $error }
helper-registry-not-saved = Kunne ikke gemme { $file }: { $error }
helper-restart-failed = Computeren genstartede ikke
helper-windows-restart-failed = Windows genstartede ikke: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Denne pc starter ikke med UEFI
firmware-variable-unreadable = Kunne ikke læse { $name } fra firmwaren: { $error }
firmware-variable-not-saved = Kunne ikke gemme { $name } i firmwaren: { $error }
firmware-entries-full = Firmwaren har ikke plads til flere startposter
firmware-entry-kept = Windows beholdt startposten { $entry }

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = Drevene kunne ikke vises: { $error }
drive-of-path-unknown = Kunne ikke afgøre, hvilket drev { $path } ligger på
drive-windows-folder-missing = Windows’ mappe blev ikke fundet
drive-windows-drive-missing = Windows’ drev blev ikke fundet
drive-windows-drive-missing-because = Windows’ drev blev ikke fundet: { $error }
drive-windows-partition-missing = Windows’ partition blev ikke fundet
drive-volume-missing = Diskenheden { $path } blev ikke fundet
drive-storage-error = { $what } (Windows-lagerfejl { $code })
drive-shrink-size-unknown = Windows kunne ikke afgøre, hvor lille dets partition kan blive
drive-grow-size-unknown = Windows kunne ikke afgøre, hvor stor dets partition kan blive
drive-resize-failed = Windows kunne ikke ændre størrelsen på sin partition
drive-create-failed = Windows kunne ikke lave en partition til Luft
drive-hide-failed = Windows kunne ikke holde den nye partition skjult i Stifinder
drive-format-failed = Windows kunne ikke formatere den nye partition
drive-remove-failed = Windows kunne ikke fjerne en af Lufts partitioner
drive-new-partition-missing = Den nye partition blev ikke fundet
drive-new-partition-no-volume = Den nye partition har ingen diskenhed
drive-start-no-guid = Startpartitionen har intet GUID
drive-live-no-guid = Livepartitionen har intet GUID
drive-box-no-guid = Flyttekassen har intet GUID
drive-guid-unreadable = Partitionens GUID kan ikke læses
drive-not-gpt = Drevets partitionstabel er ikke GPT
drive-start-no-volume = Startpartitionen har ingen diskenhed
drive-live-no-volume = Lufts partition har ingen diskenhed
drive-new-live-no-volume = Lufts nye partition har ingen diskenhed
drive-partitions-not-noted = Lufts partitioner mangler i Meet Lufts noter
drive-partitions-gone = Lufts partitioner er forsvundet
drive-partition-gone = En partition er forsvundet
drive-start-partition-foreign = Lufts startpartition er ikke lavet af Meet Luft
drive-start-partition-gone = Lufts startpartition er væk
drive-start-partition-not-listed = Lufts startpartition står ikke i partitionstabellen
drive-no-esp = Denne computer har ingen EFI-systempartition
drive-esp-full = EFI-systempartitionen er for fuld til Lufts startfiler.
drive-esp-not-opened = EFI-systempartitionen kunne ikke åbnes
drive-esp-file-unreadable = EFI-systempartitionens { $file } kan ikke læses
drive-esp-no-drive = EFI-systempartitionen har intet drev
drive-esp-no-guid = EFI-systempartitionen har intet GUID
drive-no-uuid = Drevet, som Luft ligger på, har intet UUID
drive-folder-unreadable = Luft kan ikke starte fra det drev, dine filer ligger på.
drive-folder-not-startable = Der kan ikke startes fra { $folder }

## Errors while getting Luft

live-no-home-folder = Der er ingen hjemmemappe at gemme Luft i
live-no-app-data-folder = Der er ingen lokal mappe til appdata at gemme Luft i
live-pointer-unreadable = Den nyeste Luft kan ikke læses
live-not-published = Luft er ikke udgivet der
live-checksum-unreadable = Kontrolsumfilen kan ikke læses
live-checksum-not-read = Lufts kontrolsum kunne ikke læses: { $error }
live-download-damaged = Downloaden blev beskadiget undervejs. Prøv igen.
live-download-incomplete = Den hentede Luft mangler { $file }
live-download-not-resumable = Serveren kan ikke fortsætte downloaden
live-not-signed = { $iso } er ikke signeret
live-signature-unreadable = Signaturen for { $iso } kan ikke læses
live-signature-wrong-key = { $iso } er ikke signeret af Lantharos
live-signature-other-iso = Signaturen er til { $signed }, ikke { $iso }
live-iso-out-of-order = Filerne i ISO-filen ligger ikke i en rækkefølge, Meet Luft kan læse
live-iso-not-iso = Dette er ikke et ISO-aftryk
live-iso-no-root = ISO-filen har ingen rodmappe
live-iso-no-joliet = ISO-filen har ingen Joliet-navne
live-not-removed = { $path } kunne ikke fjernes: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = Stikket er der ikke længere. Sæt det i igen, og vælg det igen.
stick-too-small = Luft kan ikke være på dette stik. Brug et på 4 GB eller mere.
stick-damaged = ISO-filen passer ikke med sin kontrolsum. Den kan være blevet beskadiget undervejs.
stick-read-back-differs = Det, der blev læst tilbage fra stikket, passede ikke med det, der blev skrevet. Det kan være slidt op, så prøv et andet.
stick-download-unavailable = Luft kan ikke hentes lige nu: { $error }
stick-download-failed = Luft kunne ikke hentes: { $error }
stick-checksum-unreadable = ISO-filens kontrolsum kan ikke læses: { $error }
stick-file-unreadable = { $path } kan ikke læses: { $error }
stick-iso-unreadable = ISO-filen kan ikke læses: { $error }
stick-iso-no-name = ISO-filen har intet navn
stick-iso-ended-early = ISO-filen sluttede for tidligt
stick-iso-already-there = { $name } er allerede på stikket.
stick-no-room = Der er ikke plads til Luft på stikket. Frigør først { $size } MB på det.
stick-older-not-removed = Den ældre Luft kunne ikke fjernes: { $error }
stick-copy-stopped = Kopieringen af Luft til stikket stoppede: { $error }
stick-not-opened = Stikket kunne ikke åbnes: { $error }
stick-write-stopped = Skrivningen til stikket stoppede: { $error }
stick-not-synced = Stikket tog ikke imod alt: { $error }
stick-read-back-failed = Stikket kunne ikke læses tilbage: { $error }
stick-in-use = Stikket er stadig i brug: { $error }
stick-device-in-use = { $device } er stadig i brug: { $error }
stick-volume-not-opened = Stikkets diskenhed kunne ikke åbnes: { $error }
stick-volume-in-use = Stikket er stadig i brug. Luk det, der har filer åbne på det, og prøv igen ({ $error })
stick-not-dismounted = Windows kunne ikke slippe stikket: { $error }
stick-not-cleared = Windows kunne ikke rydde stikket: { $error }
stick-not-refreshed = Windows kunne ikke se på stikket igen: { $error }
stick-not-ventoy = Dette stik bruger ikke længere Ventoy.
stick-ventoy-not-opened = Ventoys partition kunne ikke åbnes: { $error }
stick-ventoy-not-opened-windows = Windows kan ikke åbne Ventoys partition
stick-udisks-missing = Meet Luft skal bruge UDisks for at bruge stikket: { $error }
