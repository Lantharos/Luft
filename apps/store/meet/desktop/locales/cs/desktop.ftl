## What Meet Luft finds when it checks a computer

check-processor-x64 = 64bitový procesor Intel nebo AMD
check-processor-x64-detail = Luft na něm běží.
check-processor-arm = Procesor Arm
check-processor-arm-detail = Luft zatím běží jen na procesorech Intel a AMD.
check-processor-32-bit-windows = 32bitové Windows
check-processor-32-bit-system = 32bitový systém
check-processor-32-bit-detail = Luft potřebuje 64bitový procesor Intel nebo AMD.
check-startup-uefi = Spouští se přes UEFI
check-startup-uefi-windows = Luft se spouští stejným moderním způsobem.
check-startup-uefi-linux = Luft přidá vlastní spouštěcí položku a { $system } se bude dál spouštět jako teď.
check-startup-bios = Spouští se ve starším režimu BIOS
check-startup-bios-windows = Luft potřebuje UEFI. Windows mohou přejít pomocí MBR2GPT a pak lze UEFI zapnout v nastavení firmwaru.
check-startup-bios-linux = Luft potřebuje UEFI. Zapněte ho v nastavení firmwaru, i pro systém, který tu už je, a pak zkontrolujte znovu.
check-startup-mbr = Disk používá starou tabulku oddílů
check-startup-mbr-windows = Luft potřebuje disk GPT. Windows ho mohou převést pomocí MBR2GPT bez ztráty souborů.
check-startup-mbr-linux = Luft potřebuje ke spuštění disk GPT.
check-startup-no-esp = Chybí systémový oddíl EFI
check-startup-no-esp-detail = Luft přidává své spouštěcí soubory k těm, které už jsou na systémovém oddílu EFI, a ten tu není.
check-startup-esp-full = Systémový oddíl EFI je plný
check-startup-esp-full-detail = Luft tam potřebuje { $size } MB pro své spouštěcí soubory. Místo obvykle zabírají stará jádra nebo spouštěcí položky.
check-folder-fine = Oddíly se nemění
check-folder-fine-detail = Luft se uloží jako soubor na váš disk { $filesystem } a spouští se odtud.
check-folder-encrypted = Vaše soubory jsou na šifrovaném disku
check-folder-encrypted-detail = Luft se zatím neumí spustit ze šifrovaného disku. K vyzkoušení použijte flash disk.
check-folder-combined = Vaše soubory jsou na více oddílech
check-folder-combined-detail = Luft se zatím neumí spustit z LVM ani RAID. K vyzkoušení použijte flash disk.
check-folder-filesystem = Luft se neumí spustit ze systému souborů { $filesystem }
check-folder-filesystem-detail = Spouští se z disků ext4, btrfs a XFS. K vyzkoušení použijte flash disk.
check-space-free = Volné místo: { $size } GB
check-space-free-linux = Během zkoušení zabere Luft asi { $size } GB.
check-space-up-to = Až { $size } GB pro Luft
check-space-up-to-detail = Windows si nechají své soubory i místo na růst.
check-space-free-already = Z toho je už volných { $size } GB, takže Windows uvolní méně.
check-space-other-drive = Místo pro něj je na disku { $drive }.
check-space-erase-drive = Místo pro něj je na disku { $drive }, až se tento disk vymaže.
check-space-short = Nedostatek volného místa
check-space-short-windows = Luft potřebuje asi { $needed } GB, které mohou Windows uvolnit. Uvolněte ve Windows { $missing } GB, třeba pomocí Vyčištění disku, a pak zkontrolujte znovu.
check-space-short-linux = Luft potřebuje ke spuštění asi { $needed } GB. Uvolněte { $missing } GB a pak zkontrolujte znovu.
check-system-replaceable = Luft může zaujmout jeho místo a zachovat vaše soubory, účet i nastavení.
check-system-single = Vaše soubory sdílejí jeden oddíl se systémem, takže nahrazení se zachováním souborů zatím není podporované. Vyzkoušení i instalace systému Luft fungují.
check-system-encrypted = Systém je šifrovaný, takže nahrazení se zachováním souborů zatím není podporované.
check-system-unknown = Jeho disk je uspořádaný tak, že ho Luft zatím neumí nahradit se zachováním souborů.
check-encryption-off = Windows nejsou šifrované
check-encryption-off-detail = Aplikace Instalovat Luft může načíst jejich nastavení a vaše zařízení Bluetooth.
check-encryption-on = Windows jsou šifrované nástrojem BitLocker
check-encryption-on-detail = To nevadí. Windows uvolní místo samy a Meet Luft přenese to, co Luft ze zamčeného disku nepřečte. Pro jistotu mějte po ruce obnovovací klíč.
check-encryption-changing = BitLocker ještě šifruje nebo dešifruje
check-encryption-changing-detail = Počkejte, až Windows skončí, a pak se vraťte. Průběh uvidíte v Nastavení v části Šifrování zařízení.
check-fast-startup-on = Rychlé spuštění je zapnuté
check-fast-startup-on-detail = Windows místo vypnutí přejdou do režimu hibernace, takže jejich disk zůstane zamčený. Meet Luft ho před instalací nabídne vypnout.
check-fast-startup-off = Rychlé spuštění je vypnuté
check-fast-startup-off-detail = Windows se vypínají úplně.
check-secure-boot-on = Secure Boot je zapnutý
check-secure-boot-on-detail = Může zůstat zapnutý. Luft jednou na modré obrazovce požádá o přidání svého klíče.
check-secure-boot-off = Secure Boot je vypnutý
check-secure-boot-off-detail = Luft funguje i bez něj, ale hry s ochranou proti podvádění ho vyžadují. { $turningOn }
check-secure-boot-restart-into = Meet Luft může restartovat do nastavení firmwaru, kde ho najdete v části { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft může restartovat do nastavení firmwaru, kde ho obvykle najdete v části Security nebo Boot.
check-secure-boot-turn-on = Zapnete ho tak, že restartujete, při zobrazení loga { $maker } stisknete { $key } a přejdete do { $place }.
check-secure-boot-turn-on-anywhere = Zapnete ho tak, že při spouštění počítače otevřete nastavení firmwaru a podíváte se do části Security nebo Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, potom Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, potom Secure Boot
check-firmware-place-security-or-advanced = Security nebo Advanced, potom Secure Boot Configuration
check-firmware-place-security-or-boot = Security nebo Boot, potom Secure Boot
check-firmware-place-boot = Boot, potom Secure Boot
check-firmware-place-settings = Settings, potom Security, potom Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (na ThinkPadu F1)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 nebo Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = tlačítko zesílení hlasitosti

## More of the computer's hardware

check-tpm-detail = Šifrovaný Luft se při spuštění počítače může odemknout sám.
check-tpm-missing = Chybí TPM 2.0
check-tpm-missing-detail = Pokud Luft zašifrujete, při každém spuštění si řekne o heslo k disku.
check-graphics = Grafika
check-graphics-detail = Funguje hned.
check-graphics-nvidia = Luft se nainstaluje s vlastním ovladačem NVIDIA.
check-wifi-missing = Chybí Wi-Fi
check-wifi-missing-detail = V systému Luft použijte síťový kabel, nebo se obejděte bez sítě.
check-wifi-detail = V systému Luft funguje.
check-wifi-broadcom = Některé čipy Wi-Fi od Broadcomu potřebují ovladač, který Luft neobsahuje. Mějte po ruce síťový kabel nebo telefon pro sdílení připojení přes USB.
check-start-entries = { $count ->
    [one] Stará spouštěcí položka
    [few] { $count } staré spouštěcí položky
    [many] { $count } staré spouštěcí položky
   *[other] { $count } starých spouštěcích položek
}
check-start-entries-detail = { $count ->
    [one] { $names } odkazuje na systém, který už v tomto počítači není. Lze ji uklidit.
    [few] { $names } odkazují na systémy, které už v tomto počítači nejsou. Lze je uklidit.
    [many] { $names } odkazují na systémy, které už v tomto počítači nejsou. Lze je uklidit.
   *[other] { $names } odkazují na systémy, které už v tomto počítači nejsou. Lze je uklidit.
}
check-download-unavailable = Luft teď nejde stáhnout
check-download-unavailable-detail = Meet Luft stahuje asi 3 GB. Zkontrolujte, že jste online, a zkontrolujte znovu, nebo použijte ISO systému Luft, které už máte.

## Choosing a Luft ISO file

iso-dialog-title = Vyberte ISO systému Luft
iso-dialog-filter = ISO systému Luft

## Saving the logs from trying Luft

logs-file-name = Protokoly Luft { $name }
logs-no-desktop = Aplikace Meet Luft nenašla vaši plochu
logs-not-saved = Aplikaci Meet Luft se nepodařilo uložit protokoly ze zkoušení systému Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Pomocník aplikace Meet Luft se nespustil: { $error }
helper-not-allowed = Aplikace Meet Luft nedostala svolení k práci s diskem
helper-stopped = Pomocník aplikace Meet Luft se zastavil
helper-stopped-because = Pomocník aplikace Meet Luft se zastavil: { $error }
helper-pipe-failed = Aplikace Meet Luft se nemůže spojit se svým pomocníkem: { $error }
helper-pipe-hijacked = { $pipe } otevřelo něco jiného než pomocník aplikace Meet Luft
helper-record-not-saved = Aplikaci Meet Luft se nepodařilo zaznamenat, co vytvořila: { $error }
helper-no-room-yet = Nejdřív uvolněte místo pro Luft.
helper-not-ready-linux = Nejdřív Luft připravte.
helper-not-ready-to-start-windows = Luft ještě není připravený ke spuštění. Nejdřív pro něj uvolněte místo.
helper-not-ready-to-start-linux = Luft ještě není připravený ke spuštění. Nejdřív ho připravte.
helper-update-unfinished = Aktualizaci systému Luft se nepodařilo dokončit. Nejdřív ho aktualizujte znovu.
helper-room-too-small = Luft potřebuje víc místa.
helper-room-shortfall = Windows mohou uvolnit { $available } GB a Luft potřebuje { $needed } GB.
helper-gap-shortfall = Toto místo má { $available } GB a Luft potřebuje { $needed } GB.
helper-place-gone = Toto místo už není volné. Zkontrolujte znovu, kam se Luft vejde.
helper-box-shortfall = Windows mohou uvolnit ještě { $available } GB a vybrané věci potřebují { $needed } GB.
helper-box-room-shortfall = Místo pro Luft může uvolnit { $available } GB a vybrané věci potřebují { $needed } GB.
helper-bluetooth-unreadable = Nastavení Bluetooth ve Windows se nepodařilo otevřít
helper-registry-not-opened = Nepodařilo se otevřít { $key }: { $error }
helper-registry-not-changed = Nepodařilo se změnit { $value }: { $error }
helper-registry-not-saved = Nepodařilo se uložit { $file }: { $error }
helper-restart-failed = Počítač se nerestartoval
helper-windows-restart-failed = Windows se nerestartovaly: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Tento počítač se nespouští přes UEFI
firmware-variable-unreadable = Z firmwaru se nepodařilo přečíst { $name }: { $error }
firmware-variable-not-saved = Do firmwaru se nepodařilo uložit { $name }: { $error }
firmware-entries-full = Ve firmwaru není místo pro další spouštěcí položku
firmware-entry-kept = Windows ponechaly spouštěcí položku { $entry }

## Errors about drives and partitions

drive-list-failed = Disky se nepodařilo vypsat: { $error }
drive-of-path-unknown = Nepodařilo se zjistit, na kterém disku je { $path }
drive-windows-folder-missing = Složka systému Windows nebyla nalezena
drive-windows-drive-missing = Disk systému Windows nebyl nalezen
drive-windows-drive-missing-because = Disk systému Windows nebyl nalezen: { $error }
drive-windows-partition-missing = Oddíl systému Windows nebyl nalezen
drive-volume-missing = Svazek { $path } nebyl nalezen
drive-storage-error = { $what } (chyba úložiště Windows { $code })
drive-shrink-size-unknown = Windows nedokážou zjistit, jak moc lze jejich oddíl zmenšit
drive-resize-failed = Windows nedokážou změnit velikost svého oddílu
drive-create-failed = Windows nedokážou vytvořit oddíl pro Luft
drive-hide-failed = Windows nedokážou skrýt nový oddíl v Průzkumníku souborů
drive-format-failed = Windows nedokážou naformátovat nový oddíl
drive-remove-failed = Windows nedokážou odebrat jeden z oddílů systému Luft
drive-new-partition-missing = Nový oddíl nebyl nalezen
drive-new-partition-no-volume = Nový oddíl nemá svazek
drive-start-no-guid = Spouštěcí oddíl nemá GUID
drive-live-no-guid = Oddíl systému Luft nemá GUID
drive-box-no-guid = Stěhovací krabice nemá GUID
drive-guid-unreadable = GUID oddílu nejde přečíst
drive-not-gpt = Tabulka oddílů disku není GPT
drive-start-no-volume = Spouštěcí oddíl nemá svazek
drive-live-no-volume = Oddíl systému Luft nemá svazek
drive-new-live-no-volume = Nový oddíl systému Luft nemá svazek
drive-partitions-not-noted = Oddíly systému Luft chybí v záznamech aplikace Meet Luft
drive-partitions-gone = Oddíly systému Luft zmizely
drive-partition-gone = Oddíl zmizel
drive-gone = Disk zmizel
drive-erase-failed = Windows nedokážou disk vymazat
drive-erased-no-room = Na vymazaném disku není pro Luft místo
drive-start-partition-foreign = Spouštěcí oddíl systému Luft nevytvořila aplikace Meet Luft
drive-start-partition-gone = Spouštěcí oddíl systému Luft zmizel
drive-start-partition-not-listed = Spouštěcí oddíl systému Luft není v tabulce oddílů
drive-no-esp = Tento počítač nemá systémový oddíl EFI
drive-esp-full = Systémový oddíl EFI je na spouštěcí soubory systému Luft příliš plný.
drive-esp-not-opened = Systémový oddíl EFI se nepodařilo otevřít
drive-esp-file-unreadable = Soubor { $file } na systémovém oddílu EFI nejde přečíst
drive-esp-no-drive = Systémový oddíl EFI nemá disk
drive-esp-no-guid = Systémový oddíl EFI nemá GUID
drive-no-uuid = Disk, na kterém je Luft uložený, nemá UUID
drive-folder-unreadable = Luft se nemůže spustit z disku, na kterém jsou vaše soubory.
drive-folder-not-startable = Z { $folder } nelze spustit systém

## Errors while changing Luft once it's installed

luft-gone = Luft už v tomto počítači není
luft-not-resizable = Velikost systému Luft teď nelze z Windows změnit
luft-size-not-allowed = Luft nemůže mít takovou velikost
luft-space-promised = Toto místo je vyhrazené pro Luft. Nejdřív zrušte změnu.
luft-no-start-entry = Spouštěcí položka systému Luft nebyla nalezena

## Errors while getting Luft

live-no-home-folder = Chybí domovská složka, kam uložit Luft
live-no-app-data-folder = Chybí místní složka dat aplikací, kam uložit Luft
live-pointer-unreadable = Nejnovější Luft nejde přečíst
live-not-published = Luft tam není zveřejněný
live-checksum-unreadable = Soubor s kontrolním součtem nejde přečíst
live-checksum-not-read = Kontrolní součet systému Luft se nepodařilo přečíst: { $error }
live-download-damaged = Stažený soubor se cestou poškodil. Zkuste to znovu.
live-download-incomplete = Ve staženém systému Luft chybí { $file }
live-download-not-resumable = Server nemůže ve stahování pokračovat
live-not-signed = { $iso } není podepsaný
live-signature-unreadable = Podpis souboru { $iso } nejde přečíst
live-signature-wrong-key = { $iso } není podepsaný společností Lantharos
live-signature-other-iso = Podpis patří k souboru { $signed }, ne k { $iso }
live-iso-out-of-order = Soubory v ISO nejsou v pořadí, které aplikace Meet Luft umí přečíst
live-iso-not-iso = Toto není obraz ISO
live-iso-no-root = ISO nemá kořenovou složku
live-iso-no-joliet = ISO nemá názvy Joliet
live-not-removed = { $path } se nepodařilo odstranit: { $error }

## Errors while making a USB stick

stick-gone = Flash disk už není připojený. Připojte ho znovu a znovu ho vyberte.
stick-too-small = Luft se na tento flash disk nevejde. Použijte flash disk s kapacitou alespoň 4 GB.
stick-damaged = ISO neodpovídá svému kontrolnímu součtu. Mohlo se cestou poškodit.
stick-read-back-differs = Z flash disku se při zpětném čtení nenačetlo to, co se na něj zapsalo. Může být opotřebovaný, zkuste jiný.
stick-download-unavailable = Luft teď nejde stáhnout: { $error }
stick-download-failed = Luft se nepodařilo stáhnout: { $error }
stick-checksum-unreadable = Kontrolní součet ISO nejde přečíst: { $error }
stick-file-unreadable = { $path } nejde přečíst: { $error }
stick-iso-unreadable = ISO nejde přečíst: { $error }
stick-iso-no-name = ISO nemá název
stick-iso-ended-early = ISO předčasně skončilo
stick-iso-already-there = { $name } už na flash disku je.
stick-no-room = Na flash disku není pro Luft místo. Nejdřív na něm uvolněte { $size } MB.
stick-older-not-removed = Starší Luft se nepodařilo odstranit: { $error }
stick-copy-stopped = Kopírování systému Luft na flash disk se zastavilo: { $error }
stick-not-opened = Flash disk se nepodařilo otevřít: { $error }
stick-write-stopped = Zápis na flash disk se zastavil: { $error }
stick-not-synced = Flash disk nepřijal všechna data: { $error }
stick-read-back-failed = Flash disk se nepodařilo zpětně přečíst: { $error }
stick-in-use = Flash disk se stále používá: { $error }
stick-device-in-use = { $device } se stále používá: { $error }
stick-volume-not-opened = Svazek flash disku se nepodařilo otevřít: { $error }
stick-volume-in-use = Flash disk se stále používá. Zavřete, co na něm má otevřené soubory, a zkuste to znovu ({ $error })
stick-not-dismounted = Windows nedokážou flash disk uvolnit: { $error }
stick-not-cleared = Windows nedokážou flash disk vymazat: { $error }
stick-not-refreshed = Windows nedokážou flash disk znovu načíst: { $error }
stick-not-ventoy = Tento flash disk už nepoužívá Ventoy.
stick-ventoy-not-opened = Oddíl Ventoy se nepodařilo otevřít: { $error }
stick-ventoy-not-opened-windows = Windows nedokážou otevřít oddíl Ventoy
stick-udisks-missing = Aplikace Meet Luft potřebuje k použití flash disku UDisks: { $error }
