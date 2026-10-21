## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = 64-bitars Intel- eller AMD-processor
check-processor-x64-detail = Luft fungerar på den.
check-processor-arm = Arm-processor
check-processor-arm-detail = Luft fungerar bara på Intel- och AMD-processorer än så länge.
check-processor-32-bit-windows = 32-bitars Windows
check-processor-32-bit-system = 32-bitarssystem
check-processor-32-bit-detail = Luft behöver en 64-bitars Intel- eller AMD-processor.
check-startup-uefi = Startar med UEFI
check-startup-uefi-windows = Luft startar på samma moderna sätt.
check-startup-uefi-linux = Luft lägger till en egen startpost, och { $system } fortsätter att starta som nu.
check-startup-bios = Startar i äldre BIOS-läge
check-startup-bios-windows = Luft behöver UEFI. Windows kan byta med MBR2GPT, och sedan kan UEFI slås på i firmware-inställningarna.
check-startup-bios-linux = Luft behöver UEFI. Slå på det i firmware-inställningarna och ställ om systemet som redan finns här, och kontrollera sedan igen.
check-startup-mbr = Disken använder en gammal partitionstabell
check-startup-mbr-windows = Luft behöver en GPT-disk. Windows kan konvertera den med MBR2GPT utan att förlora några filer.
check-startup-mbr-linux = Luft behöver en GPT-disk att starta från.
check-startup-no-esp = Ingen EFI-systempartition
check-startup-no-esp-detail = Luft lägger sina startfiler bredvid dem som redan finns på EFI-systempartitionen, och den här datorn har ingen.
check-startup-esp-full = EFI-systempartitionen är full
check-startup-esp-full-detail = Luft behöver { $size } MB där för sina startfiler. Det är oftast gamla kärnor eller startposter som tar upp utrymmet.
check-folder-fine = Inget partitioneras om
check-folder-fine-detail = Luft sparas som en fil på din { $filesystem }-disk och startar därifrån.
check-folder-encrypted = Dina filer ligger på en krypterad disk
check-folder-encrypted-detail = Luft kan inte starta från en krypterad disk än. Använd ett USB-minne för att prova det i stället.
check-folder-combined = Dina filer ligger på mer än en partition
check-folder-combined-detail = Luft kan inte starta från LVM eller RAID än. Använd ett USB-minne för att prova det i stället.
check-folder-filesystem = Luft kan inte starta från { $filesystem }
check-folder-filesystem-detail = Det startar från ext4-, btrfs- och XFS-diskar. Använd ett USB-minne för att prova det i stället.
check-space-free = { $size } GB ledigt
check-space-free-linux = Luft tar ungefär { $size } GB medan du provar det.
check-space-up-to = Upp till { $size } GB för Luft
check-space-up-to-detail = Windows behåller sina filer och utrymme att växa.
check-space-short = Inte tillräckligt med ledigt utrymme
check-space-short-windows = Luft behöver ungefär { $needed } GB som Windows kan avvara. Frigör { $missing } GB i Windows, till exempel med Diskrensning, och kontrollera sedan igen.
check-space-short-linux = Luft behöver ungefär { $needed } GB att starta från. Frigör { $missing } GB och kontrollera sedan igen.
check-system-replaceable = Luft kan ta dess plats och behålla dina filer, ditt konto och dina inställningar.
check-system-single = Dina filer delar partition med systemet, så det går ännu inte att ersätta det och behålla dem. Det går bra att prova och installera Luft.
check-system-encrypted = Det är krypterat, så det går ännu inte att ersätta det och behålla dina filer.
check-system-unknown = Disken är indelad på ett sätt som gör att Luft ännu inte kan ersätta systemet och behålla dina filer.
check-encryption-off = Windows är inte krypterat
check-encryption-off-detail = Installera Luft kan läsa dess inställningar och dina Bluetooth-enheter.
check-encryption-on = Windows är krypterat med BitLocker
check-encryption-on-detail = Det gör inget. Windows gör plats själv, och Meet Luft för över det som Luft inte kan läsa från en låst disk. Ha återställningsnyckeln nära till hands, för säkerhets skull.
check-encryption-changing = BitLocker krypterar eller dekrypterar fortfarande
check-encryption-changing-detail = Vänta tills Windows är klart och kom sedan tillbaka. Du ser hur långt det har kommit i Inställningar, under Enhetskryptering.
check-fast-startup-on = Snabbstart är på
check-fast-startup-on-detail = Windows går i viloläge i stället för att stängas av, och då förblir disken låst. Meet Luft erbjuder sig att stänga av Snabbstart före installationen.
check-fast-startup-off = Snabbstart är av
check-fast-startup-off-detail = Windows stängs av helt.
check-secure-boot-on = Secure Boot är på
check-secure-boot-on-detail = Det kan vara kvar på. Luft ber en gång, på en blå skärm, om att få lägga till sin nyckel.
check-secure-boot-off = Secure Boot är av
check-secure-boot-off-detail = Luft fungerar utan det, men spel med fuskskydd kräver det. { $turningOn }
check-secure-boot-restart-into = Meet Luft kan starta om till firmware-inställningarna, där det finns under { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft kan starta om till firmware-inställningarna, där det oftast finns under Security eller Boot.
check-secure-boot-turn-on = Slå på det genom att starta om och trycka på { $key } när { $maker }-logotypen visas, och gå sedan till { $place }.
check-secure-boot-turn-on-anywhere = Slå på det genom att öppna firmware-inställningarna medan datorn startar och leta under Security eller Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security och sedan Secure Boot
check-firmware-place-boot-configuration = Boot Configuration och sedan Secure Boot
check-firmware-place-security-or-advanced = Security eller Advanced och sedan Secure Boot Configuration
check-firmware-place-security-or-boot = Security eller Boot och sedan Secure Boot
check-firmware-place-boot = Boot och sedan Secure Boot
check-firmware-place-settings = Settings, Security och sedan Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 på en ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 eller Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = volymknappen upp

## More of the computer's hardware

check-tpm-detail = Om Luft krypteras kan det låsa upp sig själv när datorn startar.
check-tpm-missing = Inget TPM 2.0
check-tpm-missing-detail = Om du krypterar Luft frågar det efter en lösenfras varje gång det startar.
check-graphics = Grafik
check-graphics-detail = Fungerar direkt.
check-graphics-nvidia = Luft installeras med NVIDIAs egen drivrutin.
check-wifi-missing = Inget Wi-Fi
check-wifi-missing-detail = Använd en nätverkskabel i Luft, eller inget nätverk alls.
check-wifi-detail = Fungerar i Luft.
check-wifi-broadcom = Vissa Wi-Fi-kretsar från Broadcom behöver en drivrutin som inte ingår i Luft. Ha en nätverkskabel eller en telefon som kan dela sin anslutning via USB nära till hands.
check-start-entries = { $count ->
    [one] En gammal startpost
   *[other] { $count } gamla startposter
}
check-start-entries-detail = { $count ->
    [one] { $names } pekar på ett system som inte finns på den här datorn längre. Den kan städas bort.
   *[other] { $names } pekar på system som inte finns på den här datorn längre. De kan städas bort.
}
check-download-unavailable = Luft kan inte hämtas just nu
check-download-unavailable-detail = Meet Luft hämtar ungefär 3 GB. Se till att du är ansluten till internet och kontrollera igen, eller använd en ISO-fil för Luft som du redan har.

## Choosing a Luft ISO file

iso-dialog-title = Välj en ISO-fil för Luft
iso-dialog-filter = ISO-fil för Luft

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Luft-loggar { $name }
logs-no-desktop = Meet Luft hittade inte ditt skrivbord
logs-not-saved = Det gick inte att spara loggarna från Prova Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = Meet Lufts hjälpprogram startade inte: { $error }
helper-not-allowed = Meet Luft fick inte arbeta med disken
helper-stopped = Meet Lufts hjälpprogram stoppades
helper-stopped-because = Meet Lufts hjälpprogram stoppades: { $error }
helper-pipe-failed = Meet Luft kunde inte kommunicera med sitt hjälpprogram: { $error }
helper-pipe-hijacked = Något annat än Meet Lufts hjälpprogram öppnade { $pipe }
helper-record-not-saved = Meet Luft kunde inte anteckna vad den har skapat: { $error }
helper-no-room-yet = Gör plats för Luft först.
helper-not-ready-linux = Gör Luft redo först.
helper-not-ready-to-start-windows = Luft är inte redo att starta än. Gör plats för det först.
helper-not-ready-to-start-linux = Luft är inte redo att starta än. Gör det redo först.
helper-update-unfinished = Uppdateringen av Luft blev inte klar. Uppdatera igen först.
helper-room-too-small = Luft behöver mer utrymme än så.
helper-room-shortfall = Windows kan avvara { $available } GB, och Luft behöver { $needed } GB.
helper-box-shortfall = Windows kan avvara { $available } GB till, och det du har valt behöver { $needed } GB.
helper-bluetooth-unreadable = Det gick inte att öppna Bluetooth-inställningarna i Windows
helper-registry-not-opened = Det gick inte att öppna { $key }: { $error }
helper-registry-not-changed = Det gick inte att ändra { $value }: { $error }
helper-registry-not-saved = Det gick inte att spara { $file }: { $error }
helper-restart-failed = Datorn startade inte om
helper-windows-restart-failed = Windows startade inte om: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Den här datorn startar inte med UEFI
firmware-variable-unreadable = Det gick inte att läsa { $name } från firmware: { $error }
firmware-variable-not-saved = Det gick inte att spara { $name } i firmware: { $error }
firmware-entries-full = Firmware har inte plats för fler startposter
firmware-entry-kept = Windows behöll startposten { $entry }

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = Det gick inte att lista diskarna: { $error }
drive-of-path-unknown = Det gick inte att avgöra vilken disk { $path } ligger på
drive-windows-folder-missing = Windows-mappen hittades inte
drive-windows-drive-missing = Windows-disken hittades inte
drive-windows-drive-missing-because = Windows-disken hittades inte: { $error }
drive-windows-partition-missing = Windows-partitionen hittades inte
drive-volume-missing = Volymen { $path } hittades inte
drive-storage-error = { $what } (lagringsfel { $code } i Windows)
drive-shrink-size-unknown = Windows kunde inte avgöra hur liten partitionen kan bli
drive-grow-size-unknown = Windows kunde inte avgöra hur stor partitionen kan bli
drive-resize-failed = Windows kunde inte ändra storlek på sin partition
drive-create-failed = Windows kunde inte skapa en partition för Luft
drive-hide-failed = Windows kunde inte dölja den nya partitionen i Utforskaren
drive-format-failed = Windows kunde inte formatera den nya partitionen
drive-remove-failed = Windows kunde inte ta bort en av Lufts partitioner
drive-new-partition-missing = Den nya partitionen hittades inte
drive-new-partition-no-volume = Den nya partitionen har ingen volym
drive-start-no-guid = Startpartitionen saknar GUID
drive-live-no-guid = Live-partitionen saknar GUID
drive-box-no-guid = Flyttlådan saknar GUID
drive-guid-unreadable = Partitionens GUID går inte att läsa
drive-not-gpt = Diskens partitionstabell är inte GPT
drive-start-no-volume = Startpartitionen har ingen volym
drive-live-no-volume = Lufts partition har ingen volym
drive-new-live-no-volume = Lufts nya partition har ingen volym
drive-partitions-not-noted = Lufts partitioner saknas i Meet Lufts anteckningar
drive-partitions-gone = Lufts partitioner försvann
drive-partition-gone = En partition försvann
drive-start-partition-foreign = Lufts startpartition skapades inte av Meet Luft
drive-start-partition-gone = Lufts startpartition är borta
drive-start-partition-not-listed = Lufts startpartition finns inte i partitionstabellen
drive-no-esp = Den här datorn har ingen EFI-systempartition
drive-esp-full = EFI-systempartitionen är för full för Lufts startfiler.
drive-esp-not-opened = Det gick inte att öppna EFI-systempartitionen
drive-esp-file-unreadable = { $file } på EFI-systempartitionen går inte att läsa
drive-esp-no-drive = EFI-systempartitionen har ingen disk
drive-esp-no-guid = EFI-systempartitionen saknar GUID
drive-no-uuid = Disken som Luft sparas på saknar UUID
drive-folder-unreadable = Luft kan inte starta från disken som dina filer ligger på.
drive-folder-not-startable = Det går inte att starta från { $folder }

## Errors while getting Luft

live-no-home-folder = Det finns ingen hemmapp att spara Luft i
live-no-app-data-folder = Det finns ingen lokal mapp för appdata att spara Luft i
live-pointer-unreadable = Det går inte att läsa vilken version av Luft som är den senaste
live-not-published = Luft är inte publicerat där
live-checksum-unreadable = Kontrollsummefilen går inte att läsa
live-checksum-not-read = Det gick inte att läsa kontrollsumman för Luft: { $error }
live-download-damaged = Hämtningen skadades på vägen. Försök igen.
live-download-incomplete = { $file } saknas i det hämtade Luft
live-download-not-resumable = Servern kan inte fortsätta hämtningen
live-not-signed = { $iso } är inte signerad
live-signature-unreadable = Signaturen för { $iso } går inte att läsa
live-signature-wrong-key = { $iso } är inte signerad av Lantharos
live-signature-other-iso = Signaturen gäller { $signed }, inte { $iso }
live-iso-out-of-order = Filerna i ISO-filen ligger inte i en ordning som Meet Luft kan läsa
live-iso-not-iso = Det här är ingen ISO-avbildning
live-iso-no-root = ISO-filen har ingen rotmapp
live-iso-no-joliet = ISO-filen har inga Joliet-namn
live-not-removed = Det gick inte att ta bort { $path }: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = USB-minnet finns inte längre. Anslut det igen och välj det på nytt.
stick-too-small = Luft får inte plats på det här USB-minnet. Använd ett på 4 GB eller mer.
stick-damaged = ISO-filen stämmer inte med sin kontrollsumma. Den kan ha skadats på vägen.
stick-read-back-differs = USB-minnet gav inte tillbaka det som skrevs till det. Det kan vara utslitet, så prova ett annat.
stick-download-unavailable = Luft kan inte hämtas just nu: { $error }
stick-download-failed = Det gick inte att hämta Luft: { $error }
stick-checksum-unreadable = Det går inte att läsa ISO-filens kontrollsumma: { $error }
stick-file-unreadable = Det går inte att läsa { $path }: { $error }
stick-iso-unreadable = Det går inte att läsa ISO-filen: { $error }
stick-iso-no-name = ISO-filen har inget namn
stick-iso-ended-early = ISO-filen tog slut i förtid
stick-iso-already-there = { $name } finns redan på USB-minnet.
stick-no-room = Det finns inte plats för Luft på USB-minnet. Frigör { $size } MB på det först.
stick-older-not-removed = Det gick inte att ta bort den äldre versionen av Luft: { $error }
stick-copy-stopped = Kopieringen av Luft till USB-minnet avbröts: { $error }
stick-not-opened = Det gick inte att öppna USB-minnet: { $error }
stick-write-stopped = Skrivningen till USB-minnet avbröts: { $error }
stick-not-synced = USB-minnet tog inte emot allt: { $error }
stick-read-back-failed = Det gick inte att läsa tillbaka USB-minnet: { $error }
stick-in-use = USB-minnet används fortfarande: { $error }
stick-device-in-use = { $device } används fortfarande: { $error }
stick-volume-not-opened = Det gick inte att öppna USB-minnets volym: { $error }
stick-volume-in-use = USB-minnet används fortfarande. Stäng det som har filer öppna på det och försök igen ({ $error })
stick-not-dismounted = Windows kunde inte släppa USB-minnet: { $error }
stick-not-cleared = Windows kunde inte tömma USB-minnet: { $error }
stick-not-refreshed = Windows kunde inte läsa in USB-minnet igen: { $error }
stick-not-ventoy = Det här USB-minnet använder inte Ventoy längre.
stick-ventoy-not-opened = Det gick inte att öppna Ventoys partition: { $error }
stick-ventoy-not-opened-windows = Windows kan inte öppna Ventoys partition
stick-udisks-missing = Meet Luft behöver UDisks för att använda USB-minnet: { $error }
