## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = 64-bit Intel- of AMD-processor
check-processor-x64-detail = Luft draait erop.
check-processor-arm = Arm-processor
check-processor-arm-detail = Luft draait voorlopig alleen op processors van Intel en AMD.
check-processor-32-bit-windows = 32-bit Windows
check-processor-32-bit-system = 32-bit-systeem
check-processor-32-bit-detail = Luft heeft een 64-bit Intel- of AMD-processor nodig.
check-startup-uefi = Start met UEFI
check-startup-uefi-windows = Luft start op dezelfde moderne manier.
check-startup-uefi-linux = Luft voegt een eigen opstartvermelding toe, en { $system } blijft starten zoals nu.
check-startup-bios = Start in de verouderde BIOS-modus
check-startup-bios-windows = Luft heeft UEFI nodig. Windows kan overstappen met MBR2GPT, daarna kun je UEFI inschakelen in de firmware-instellingen.
check-startup-bios-linux = Luft heeft UEFI nodig. Schakel het in de firmware-instellingen in, samen met het systeem dat hier al staat, en controleer daarna opnieuw.
check-startup-mbr = De schijf gebruikt een oude partitietabel
check-startup-mbr-windows = Luft heeft een GPT-schijf nodig. Windows kan de schijf met MBR2GPT omzetten zonder bestanden te verliezen.
check-startup-mbr-linux = Luft heeft een GPT-schijf nodig om vanaf te starten.
check-startup-no-esp = Geen EFI-systeempartitie
check-startup-no-esp-detail = Luft zet zijn opstartbestanden naast die op de EFI-systeempartitie, en die is er niet.
check-startup-esp-full = De EFI-systeempartitie is vol
check-startup-esp-full-detail = Luft heeft daar { $size } MB nodig voor zijn opstartbestanden. Meestal nemen oude kernels of opstartvermeldingen de ruimte in.
check-folder-fine = Er wordt niets opnieuw gepartitioneerd
check-folder-fine-detail = Luft wordt als bestand op je { $filesystem }-schijf bewaard en start van daaruit.
check-folder-encrypted = Je bestanden staan op een versleutelde schijf
check-folder-encrypted-detail = Luft kan nog niet starten vanaf een versleutelde schijf. Gebruik in plaats daarvan een usb-stick om het uit te proberen.
check-folder-combined = Je bestanden zijn verdeeld over meer dan één partitie
check-folder-combined-detail = Luft kan nog niet starten vanaf LVM of RAID. Gebruik in plaats daarvan een usb-stick om het uit te proberen.
check-folder-filesystem = Luft kan niet starten vanaf { $filesystem }
check-folder-filesystem-detail = Het start vanaf ext4-, btrfs- en XFS-schijven. Gebruik in plaats daarvan een usb-stick om het uit te proberen.
check-space-free = { $size } GB vrij
check-space-free-linux = Luft neemt ongeveer { $size } GB in beslag terwijl je het uitprobeert.
check-space-up-to = Tot { $size } GB voor Luft
check-space-up-to-detail = Windows houdt zijn bestanden en ruimte om te groeien.
check-space-free-already = Daarvan is al { $size } GB vrij, dus Windows levert minder in.
check-space-other-drive = Er is ruimte voor op { $drive }.
check-space-erase-drive = Er is ruimte voor op { $drive }, zodra die schijf is gewist.
check-space-short = Niet genoeg vrije ruimte
check-space-short-windows = Luft heeft ongeveer { $needed } GB nodig die Windows kan missen. Maak { $missing } GB vrij in Windows, bijvoorbeeld met Schijfopruiming, en controleer daarna opnieuw.
check-space-short-linux = Luft heeft ongeveer { $needed } GB nodig om vanaf te starten. Maak { $missing } GB vrij en controleer daarna opnieuw.
check-system-replaceable = Luft kan de plaats ervan innemen en je bestanden, je account en je instellingen houden.
check-system-single = Je bestanden delen één partitie met het systeem, dus vervangen met behoud van je bestanden wordt nog niet ondersteund. Luft uitproberen en installeren werkt wel.
check-system-encrypted = Het is versleuteld, dus vervangen met behoud van je bestanden wordt nog niet ondersteund.
check-system-unknown = De schijf is zo ingedeeld dat Luft het systeem nog niet kan vervangen met behoud van je bestanden.
check-encryption-off = Windows is niet versleuteld
check-encryption-off-detail = Luft installeren kan de instellingen en je Bluetooth-apparaten lezen.
check-encryption-on = Windows is versleuteld met BitLocker
check-encryption-on-detail = Dat is geen probleem. Windows maakt zelf de ruimte, en Meet Luft neemt mee wat Luft niet van een vergrendelde schijf kan lezen. Houd voor de zekerheid je herstelsleutel bij de hand.
check-encryption-changing = BitLocker is nog bezig met versleutelen of ontsleutelen
check-encryption-changing-detail = Wacht tot Windows klaar is en kom dan terug. In Instellingen, onder Apparaatversleuteling, zie je hoe ver het is.
check-fast-startup-on = Snel opstarten staat aan
check-fast-startup-on-detail = Windows gaat in de sluimerstand in plaats van af te sluiten, waardoor de schijf vergrendeld blijft. Meet Luft biedt aan het uit te schakelen voordat je installeert.
check-fast-startup-off = Snel opstarten staat uit
check-fast-startup-off-detail = Windows sluit helemaal af.
check-secure-boot-on = Secure Boot staat aan
check-secure-boot-on-detail = Het kan aan blijven. Luft vraagt één keer, op een blauw scherm, om zijn sleutel toe te voegen.
check-secure-boot-off = Secure Boot staat uit
check-secure-boot-off-detail = Luft werkt zonder, maar games met anti-cheat hebben het nodig. { $turningOn }
check-secure-boot-restart-into = Meet Luft kan opnieuw opstarten in de firmware-instellingen, waar het onder { $place } staat.
check-secure-boot-restart-into-anywhere = Meet Luft kan opnieuw opstarten in de firmware-instellingen, waar het meestal onder Security of Boot staat.
check-secure-boot-turn-on = Om het in te schakelen, start je opnieuw op en druk je op { $key } zodra het logo van { $maker } verschijnt. Ga daarna naar { $place }.
check-secure-boot-turn-on-anywhere = Om het in te schakelen, open je de firmware-instellingen terwijl de computer opstart en kijk je onder Security of Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security, daarna Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, daarna Secure Boot
check-firmware-place-security-or-advanced = Security of Advanced, daarna Secure Boot Configuration
check-firmware-place-security-or-boot = Security of Boot, daarna Secure Boot
check-firmware-place-boot = Boot, daarna Secure Boot
check-firmware-place-settings = Settings, daarna Security, daarna Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 op een ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 of Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = de knop volume omhoog

## More of the computer's hardware

check-tpm-detail = Als Luft versleuteld is, kan het zichzelf ontgrendelen als de computer start.
check-tpm-missing = Geen TPM 2.0
check-tpm-missing-detail = Als je Luft versleutelt, vraagt het bij elke start om een wachtwoordzin.
check-graphics = Videokaart
check-graphics-detail = Werkt meteen.
check-graphics-nvidia = Luft wordt geïnstalleerd met de eigen driver van NVIDIA.
check-wifi-missing = Geen wifi
check-wifi-missing-detail = Gebruik in Luft een netwerkkabel, of helemaal niets.
check-wifi-detail = Werkt in Luft.
check-wifi-broadcom = Sommige wifichips van Broadcom hebben een driver nodig die Luft niet meelevert. Houd een netwerkkabel of een telefoon voor usb-tethering bij de hand.
check-start-entries = { $count ->
    [one] Een oude opstartvermelding
   *[other] { $count } oude opstartvermeldingen
}
check-start-entries-detail = { $count ->
    [one] { $names } verwijst naar een systeem dat niet meer op deze pc staat. Het kan worden opgeruimd.
   *[other] { $names } verwijzen naar systemen die niet meer op deze pc staan. Ze kunnen worden opgeruimd.
}
check-download-unavailable = Luft kan nu niet worden gedownload
check-download-unavailable-detail = Meet Luft downloadt ongeveer 3 GB. Kijk of je online bent en controleer opnieuw, of gebruik een Luft-iso die je al hebt.

## Choosing a Luft ISO file

iso-dialog-title = Luft-iso kiezen
iso-dialog-filter = Luft-iso

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Luft-logboeken { $name }
logs-no-desktop = Meet Luft kon je bureaublad niet vinden
logs-not-saved = Meet Luft kon de logboeken van het uitproberen van Luft niet opslaan: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = Het hulpprogramma van Meet Luft is niet gestart: { $error }
helper-not-allowed = Meet Luft mocht niet met de schijf werken
helper-stopped = Het hulpprogramma van Meet Luft is gestopt
helper-stopped-because = Het hulpprogramma van Meet Luft is gestopt: { $error }
helper-pipe-failed = Meet Luft kon geen contact maken met zijn hulpprogramma: { $error }
helper-pipe-hijacked = Iets anders dan het hulpprogramma van Meet Luft heeft { $pipe } geopend
helper-record-not-saved = Meet Luft kon niet vastleggen wat het heeft gemaakt: { $error }
helper-no-room-yet = Maak eerst ruimte voor Luft.
helper-not-ready-linux = Zet Luft eerst klaar.
helper-not-ready-to-start-windows = Luft is nog niet klaar om te starten. Maak er eerst ruimte voor.
helper-not-ready-to-start-linux = Luft is nog niet klaar om te starten. Zet het eerst klaar.
helper-update-unfinished = Luft bijwerken is niet afgerond. Werk het eerst opnieuw bij.
helper-room-too-small = Luft heeft meer ruimte nodig.
helper-room-shortfall = Windows kan { $available } GB missen, en Luft heeft { $needed } GB nodig.
helper-gap-shortfall = Die ruimte is { $available } GB groot, en Luft heeft { $needed } GB nodig.
helper-place-gone = Die ruimte is niet meer vrij. Controleer opnieuw om te zien waar Luft past.
helper-box-shortfall = Windows kan nog { $available } GB missen, en deze onderdelen hebben { $needed } GB nodig.
helper-box-room-shortfall = De ruimte van Luft kan { $available } GB missen, en deze onderdelen hebben { $needed } GB nodig.
helper-bluetooth-unreadable = De Bluetooth-instellingen van Windows konden niet worden geopend
helper-registry-not-opened = Kon { $key } niet openen: { $error }
helper-registry-not-changed = Kon { $value } niet wijzigen: { $error }
helper-registry-not-saved = Kon { $file } niet opslaan: { $error }
helper-restart-failed = De computer is niet opnieuw opgestart
helper-windows-restart-failed = Windows is niet opnieuw opgestart: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Deze pc start niet met UEFI
firmware-variable-unreadable = Kon { $name } niet uit de firmware lezen: { $error }
firmware-variable-not-saved = Kon { $name } niet in de firmware opslaan: { $error }
firmware-entries-full = De firmware heeft geen ruimte voor nog een opstartvermelding
firmware-entry-kept = Windows heeft de opstartvermelding { $entry } behouden

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = De schijven konden niet worden weergegeven: { $error }
drive-of-path-unknown = Kon niet bepalen op welke schijf { $path } staat
drive-windows-folder-missing = De map van Windows is niet gevonden
drive-windows-drive-missing = De schijf van Windows is niet gevonden
drive-windows-drive-missing-because = De schijf van Windows is niet gevonden: { $error }
drive-windows-partition-missing = De partitie van Windows is niet gevonden
drive-volume-missing = Het volume { $path } is niet gevonden
drive-storage-error = { $what } (Windows-opslagfout { $code })
drive-shrink-size-unknown = Windows kon niet bepalen hoe klein zijn partitie kan worden
drive-resize-failed = Windows kon de grootte van zijn partitie niet wijzigen
drive-create-failed = Windows kon geen partitie voor Luft maken
drive-hide-failed = Windows kon de nieuwe partitie niet uit Verkenner houden
drive-format-failed = Windows kon de nieuwe partitie niet formatteren
drive-remove-failed = Windows kon een van de partities van Luft niet verwijderen
drive-new-partition-missing = De nieuwe partitie is niet gevonden
drive-new-partition-no-volume = De nieuwe partitie heeft geen volume
drive-start-no-guid = De opstartpartitie heeft geen GUID
drive-live-no-guid = De livepartitie heeft geen GUID
drive-box-no-guid = De verhuisdoos heeft geen GUID
drive-guid-unreadable = De GUID van de partitie is niet leesbaar
drive-not-gpt = De partitietabel van de schijf is geen GPT
drive-start-no-volume = De opstartpartitie heeft geen volume
drive-live-no-volume = De partitie van Luft heeft geen volume
drive-new-live-no-volume = De nieuwe partitie van Luft heeft geen volume
drive-partitions-not-noted = De partities van Luft ontbreken in de notities van Meet Luft
drive-partitions-gone = De partities van Luft zijn verdwenen
drive-partition-gone = Er is een partitie verdwenen
drive-gone = Er is een schijf verdwenen
drive-erase-failed = Windows kon de schijf niet wissen
drive-erased-no-room = Op de gewiste schijf is geen ruimte voor Luft
drive-start-partition-foreign = De opstartpartitie van Luft is niet door Meet Luft gemaakt
drive-start-partition-gone = De opstartpartitie van Luft is weg
drive-start-partition-not-listed = De opstartpartitie van Luft staat niet in de partitietabel
drive-no-esp = Deze computer heeft geen EFI-systeempartitie
drive-esp-full = De EFI-systeempartitie is te vol voor de opstartbestanden van Luft.
drive-esp-not-opened = De EFI-systeempartitie kon niet worden geopend
drive-esp-file-unreadable = { $file } op de EFI-systeempartitie is niet leesbaar
drive-esp-no-drive = De EFI-systeempartitie heeft geen schijf
drive-esp-no-guid = De EFI-systeempartitie heeft geen GUID
drive-no-uuid = De schijf waarop Luft staat, heeft geen UUID
drive-folder-unreadable = Luft kan niet starten vanaf de schijf waarop je bestanden staan.
drive-folder-not-startable = Er kan niet worden gestart vanaf { $folder }

## Errors while changing Luft once it's installed

luft-gone = Luft staat niet meer op deze pc
luft-not-resizable = De grootte van Luft kan nu niet vanuit Windows worden gewijzigd
luft-size-not-allowed = Luft kan niet zo groot of zo klein zijn
luft-space-promised = Die ruimte is gereserveerd voor Luft. Annuleer eerst de wijziging.
luft-no-start-entry = De opstartvermelding van Luft is niet gevonden

## Errors while getting Luft

live-no-home-folder = Er is geen persoonlijke map om Luft in te bewaren
live-no-app-data-folder = Er is geen lokale map voor appgegevens om Luft in te bewaren
live-pointer-unreadable = De nieuwste versie van Luft is niet leesbaar
live-not-published = Luft is daar niet gepubliceerd
live-checksum-unreadable = Het checksumbestand is niet leesbaar
live-checksum-not-read = De checksum van Luft kon niet worden gelezen: { $error }
live-download-damaged = De download is onderweg beschadigd. Probeer het opnieuw.
live-download-incomplete = In de download van Luft ontbreekt { $file }
live-download-not-resumable = De server kan de download niet hervatten
live-not-signed = { $iso } is niet ondertekend
live-signature-unreadable = De handtekening van { $iso } is niet leesbaar
live-signature-wrong-key = { $iso } is niet ondertekend door Lantharos
live-signature-other-iso = De handtekening is voor { $signed }, niet voor { $iso }
live-iso-out-of-order = De bestanden in de iso staan niet in een volgorde die Meet Luft kan lezen
live-iso-not-iso = Dit is geen iso-image
live-iso-no-root = De iso heeft geen hoofdmap
live-iso-no-joliet = De iso heeft geen Joliet-namen
live-not-removed = { $path } kon niet worden verwijderd: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = De stick is er niet meer. Sluit hem opnieuw aan en kies hem nog een keer.
stick-too-small = Luft past niet op deze stick. Gebruik er een van 4 GB of meer.
stick-damaged = De iso komt niet overeen met de checksum. Misschien is hij onderweg beschadigd.
stick-read-back-differs = De stick las niet terug wat erop was geschreven. Hij is misschien versleten, dus probeer een andere.
stick-download-unavailable = Luft kan nu niet worden gedownload: { $error }
stick-download-failed = Luft kon niet worden gedownload: { $error }
stick-checksum-unreadable = De checksum van de iso kan niet worden gelezen: { $error }
stick-file-unreadable = { $path } kan niet worden gelezen: { $error }
stick-iso-unreadable = De iso kan niet worden gelezen: { $error }
stick-iso-no-name = De iso heeft geen naam
stick-iso-ended-early = De iso hield te vroeg op
stick-iso-already-there = { $name } staat al op de stick.
stick-no-room = Er is geen ruimte voor Luft op de stick. Maak er eerst { $size } MB op vrij.
stick-older-not-removed = De oudere versie van Luft kon niet worden verwijderd: { $error }
stick-copy-stopped = Het kopiëren van Luft naar de stick is gestopt: { $error }
stick-not-opened = De stick kon niet worden geopend: { $error }
stick-write-stopped = Het schrijven naar de stick is gestopt: { $error }
stick-not-synced = De stick heeft niet alles opgeslagen: { $error }
stick-read-back-failed = De stick kon niet worden teruggelezen: { $error }
stick-in-use = De stick is nog in gebruik: { $error }
stick-device-in-use = { $device } is nog in gebruik: { $error }
stick-volume-not-opened = Het volume van de stick kon niet worden geopend: { $error }
stick-volume-in-use = De stick is nog in gebruik. Sluit wat er bestanden op open heeft en probeer het opnieuw ({ $error })
stick-not-dismounted = Windows kon de stick niet loslaten: { $error }
stick-not-cleared = Windows kon de stick niet leegmaken: { $error }
stick-not-refreshed = Windows kon de stick niet opnieuw bekijken: { $error }
stick-not-ventoy = Deze stick gebruikt Ventoy niet meer.
stick-ventoy-not-opened = De partitie van Ventoy kon niet worden geopend: { $error }
stick-ventoy-not-opened-windows = Windows kan de partitie van Ventoy niet openen
stick-udisks-missing = Meet Luft heeft UDisks nodig om de stick te gebruiken: { $error }
