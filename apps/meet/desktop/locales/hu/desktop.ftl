## What Meet Luft finds when it checks a computer

check-processor-x64 = 64 bites Intel vagy AMD processzor
check-processor-x64-detail = A Luft fut rajta.
check-processor-arm = Arm processzor
check-processor-arm-detail = A Luft egyelőre csak Intel és AMD processzorokon fut.
check-processor-32-bit-windows = 32 bites Windows
check-processor-32-bit-system = 32 bites rendszer
check-processor-32-bit-detail = A Luftnak 64 bites Intel vagy AMD processzor kell.
check-startup-uefi = UEFI-vel indul
check-startup-uefi-windows = A Luft ugyanígy, modern módon indul.
check-startup-uefi-linux = A Luft saját indítási bejegyzést ad hozzá, a meglévő rendszer ({ $system }) pedig ugyanúgy indul tovább, mint most.
check-startup-bios = Régi BIOS-módban indul
check-startup-bios-windows = A Luftnak UEFI kell. A Windows átállhat az MBR2GPT eszközzel, utána az UEFI bekapcsolható a firmware-beállításokban.
check-startup-bios-linux = A Luftnak UEFI kell. Kapcsolja be a firmware-beállításokban, a meglévő rendszerrel együtt, majd ellenőrizze újra.
check-startup-mbr = A meghajtó régi partíciós táblát használ
check-startup-mbr-windows = A Luftnak GPT-meghajtó kell. A Windows az MBR2GPT eszközzel fájlvesztés nélkül át tudja alakítani.
check-startup-mbr-linux = A Luftnak GPT-meghajtó kell az induláshoz.
check-startup-no-esp = Nincs EFI-rendszerpartíció
check-startup-no-esp-detail = A Luft az EFI-rendszerpartíción már meglévő indítófájlok mellé teszi a sajátjait, de ilyen partíció nincs.
check-startup-esp-full = Az EFI-rendszerpartíció megtelt
check-startup-esp-full-detail = A Luftnak { $size } MB kell ott az indítófájljaihoz. A helyet általában régi kernelek vagy indítási bejegyzések foglalják.
check-folder-fine = A partíciók nem változnak
check-folder-fine-detail = A Luft fájlként kerül a { $filesystem } fájlrendszerű meghajtójára, és onnan indul.
check-folder-encrypted = A fájljai titkosított meghajtón vannak
check-folder-encrypted-detail = A Luft egyelőre nem tud titkosított meghajtóról indulni. Próbálja ki inkább pendrive-ról.
check-folder-combined = A fájljai több partícióra terjednek ki
check-folder-combined-detail = A Luft egyelőre nem tud LVM-ről vagy RAID-ről indulni. Próbálja ki inkább pendrive-ról.
check-folder-filesystem = A Luft nem tud indulni erről a fájlrendszerről: { $filesystem }
check-folder-filesystem-detail = Ext4, btrfs és XFS meghajtókról indul. Próbálja ki inkább pendrive-ról.
check-space-free = { $size } GB szabad
check-space-free-linux = A Luft a kipróbálás alatt nagyjából { $size } GB-ot foglal.
check-space-up-to = Legfeljebb { $size } GB a Luftnak
check-space-up-to-detail = A Windows megtartja a fájljait és a bővüléshez szükséges helyet.
check-space-free-already = Ebből { $size } GB már szabad, így a Windows kevesebbet ad át.
check-space-other-drive = Van hely a számára ezen a meghajtón: { $drive }.
check-space-erase-drive = Van hely a számára ezen a meghajtón, ha törlik: { $drive }.
check-space-short = Nincs elég szabad hely
check-space-short-windows = A Luftnak nagyjából { $needed } GB kell, amelyet a Windows át tud adni. Szabadítson fel { $missing } GB-ot a Windowsban, például a Lemezkarbantartóval, majd ellenőrizze újra.
check-space-short-linux = A Luftnak nagyjából { $needed } GB kell az induláshoz. Szabadítson fel { $missing } GB-ot, majd ellenőrizze újra.
check-system-replaceable = A Luft átveheti a helyét, és megtartja a fájljait, a fiókját és a beállításait.
check-system-single = A fájljai a rendszerrel közös partíción vannak, így a lecserélése a fájlok megtartásával még nem támogatott. A Luft kipróbálása és telepítése működik.
check-system-encrypted = Titkosítva van, így a lecserélése a fájlok megtartásával még nem támogatott.
check-system-unknown = A meghajtója olyan felosztású, amelyet a Luft a fájlok megtartásával még nem tud lecserélni.
check-encryption-off = A Windows nincs titkosítva
check-encryption-off-detail = A Luft telepítése be tudja olvasni a beállításait és a Bluetooth-eszközeit.
check-encryption-on = A Windows BitLockerrel van titkosítva
check-encryption-on-detail = Ez nem gond. A Windows maga csinál helyet, a Meet Luft pedig áthozza azt, amit a Luft zárolt meghajtóról nem tud beolvasni. Biztos, ami biztos, tartsa kéznél a helyreállítási kulcsot.
check-encryption-changing = A BitLocker még titkosít vagy visszafejt
check-encryption-changing-detail = Várja meg, amíg a Windows végez, aztán térjen vissza. Az állapotot a Gépházban, az Eszköztitkosítás résznél láthatja.
check-fast-startup-on = A gyors rendszerindítás be van kapcsolva
check-fast-startup-on-detail = A Windows leállítás helyett hibernál, ami zárolva tartja a meghajtóját. A Meet Luft telepítés előtt felajánlja a kikapcsolását.
check-fast-startup-off = A gyors rendszerindítás ki van kapcsolva
check-fast-startup-off-detail = A Windows teljesen leáll.
check-secure-boot-on = A Secure Boot be van kapcsolva
check-secure-boot-on-detail = Bekapcsolva maradhat. A Luft egyszer, egy kék képernyőn kéri a kulcsa hozzáadását.
check-secure-boot-off = A Secure Boot ki van kapcsolva
check-secure-boot-off-detail = A Luft nélküle is működik, de a csalásvédelmet használó játékoknak szükségük van rá. { $turningOn }
check-secure-boot-restart-into = A Meet Luft újraindíthat a firmware-beállításokba, ahol itt található: { $place }.
check-secure-boot-restart-into-anywhere = A Meet Luft újraindíthat a firmware-beállításokba, ahol általában a Security vagy a Boot menüben található.
check-secure-boot-turn-on = A bekapcsoláshoz indítsa újra a gépet, és nyomja meg a következőt, amikor megjelenik a gyártó ({ $maker }) logója: { $key }. Ezután lépjen ide: { $place }.
check-secure-boot-turn-on-anywhere = A bekapcsoláshoz nyissa meg a firmware-beállításokat a számítógép indulása közben, és keresse a Security vagy a Boot menüben.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, majd Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, majd Secure Boot
check-firmware-place-security-or-advanced = Security vagy Advanced, majd Secure Boot Configuration
check-firmware-place-security-or-boot = Security vagy Boot, majd Secure Boot
check-firmware-place-boot = Boot, majd Secure Boot
check-firmware-place-settings = Settings, majd Security, majd Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (ThinkPaden F1)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 vagy Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = hangerő fel gomb

## More of the computer's hardware

check-tpm-detail = A titkosított Luft a számítógép indulásakor magától fel tud oldódni.
check-tpm-missing = Nincs TPM 2.0
check-tpm-missing-detail = Ha titkosítja a Luftot, minden indításkor jelmondatot kér.
check-graphics = Grafika
check-graphics-detail = Azonnal működik.
check-graphics-nvidia = A Luft az NVIDIA saját illesztőprogramjával települ.
check-wifi-missing = Nincs Wi-Fi
check-wifi-missing-detail = A Luftban használjon hálózati kábelt, vagy legyen kapcsolat nélkül.
check-wifi-detail = Működik a Luftban.
check-wifi-broadcom = Egyes Broadcom Wi-Fi-chipekhez olyan illesztőprogram kell, amely nincs a Luftban. Tartson kéznél hálózati kábelt vagy egy telefont USB-s internetmegosztáshoz.
check-start-entries = { $count ->
    [one] Egy régi indítási bejegyzés
   *[other] { $count } régi indítási bejegyzés
}
check-start-entries-detail = { $count ->
    [one] { $names }: olyan rendszerre mutat, amely már nincs ezen a PC-n. Eltávolítható.
   *[other] { $names }: olyan rendszerekre mutatnak, amelyek már nincsenek ezen a PC-n. Eltávolíthatók.
}
check-download-unavailable = A Luft most nem tölthető le
check-download-unavailable-detail = A Meet Luft nagyjából 3 GB-ot tölt le. Ellenőrizze az internetkapcsolatot, és ellenőrizze újra, vagy használjon egy meglévő Luft ISO-t.

## Choosing a Luft ISO file

iso-dialog-title = Luft ISO kiválasztása
iso-dialog-filter = Luft ISO

## Saving the logs from trying Luft

logs-file-name = Luft-naplók { $name }
logs-no-desktop = A Meet Luft nem találta az asztalát
logs-not-saved = A Meet Luft nem tudta menteni a Luft kipróbálásának naplóit: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = A Meet Luft segédprogramja nem indult el: { $error }
helper-not-allowed = A Meet Luft nem kapott engedélyt a meghajtó módosítására
helper-stopped = A Meet Luft segédprogramja leállt
helper-stopped-because = A Meet Luft segédprogramja leállt: { $error }
helper-pipe-failed = A Meet Luft nem tudott kapcsolatba lépni a segédprogramjával: { $error }
helper-pipe-hijacked = Nem a Meet Luft segédprogramja nyitotta meg ezt: { $pipe }
helper-record-not-saved = A Meet Luft nem tudta feljegyezni, mit hozott létre: { $error }
helper-no-room-yet = Előbb csináljon helyet a Luftnak.
helper-not-ready-linux = Előbb készítse elő a Luftot.
helper-not-ready-to-start-windows = A Luft még nem áll készen az indulásra. Előbb csináljon neki helyet.
helper-not-ready-to-start-linux = A Luft még nem áll készen az indulásra. Előbb készítse elő.
helper-update-unfinished = A Luft frissítése nem fejeződött be. Előbb frissítse újra.
helper-room-too-small = A Luftnak ennél több hely kell.
helper-room-shortfall = A Windows { $available } GB-ot tud átadni, a Luftnak pedig { $needed } GB kell.
helper-gap-shortfall = Azon a helyen { $available } GB fér el, a Luftnak pedig { $needed } GB kell.
helper-place-gone = Az a hely már nem szabad. Ellenőrizze újra, hová fér a Luft.
helper-box-shortfall = A Windows még { $available } GB-ot tud átadni, a kiválasztott elemeknek pedig { $needed } GB kell.
helper-box-room-shortfall = A Luft helyéből { $available } GB adható át, a kiválasztott elemeknek pedig { $needed } GB kell.
helper-bluetooth-unreadable = A Windows Bluetooth-beállításai nem nyithatók meg
helper-registry-not-opened = Nem nyitható meg: { $key } ({ $error })
helper-registry-not-changed = Nem módosítható: { $value } ({ $error })
helper-registry-not-saved = Nem menthető: { $file } ({ $error })
helper-restart-failed = A számítógép nem indult újra
helper-windows-restart-failed = A Windows nem indult újra: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Ez a PC nem UEFI-vel indul
firmware-variable-unreadable = Nem olvasható ki a firmware-ből: { $name } ({ $error })
firmware-variable-not-saved = Nem menthető a firmware-be: { $name } ({ $error })
firmware-entries-full = A firmware-ben nincs hely újabb indítási bejegyzésnek
firmware-entry-kept = A Windows megtartotta ezt az indítási bejegyzést: { $entry }

## Errors about drives and partitions

drive-list-failed = A meghajtók nem listázhatók: { $error }
drive-of-path-unknown = Nem állapítható meg, melyik meghajtón van: { $path }
drive-windows-folder-missing = A Windows mappája nem található
drive-windows-drive-missing = A Windows meghajtója nem található
drive-windows-drive-missing-because = A Windows meghajtója nem található: { $error }
drive-windows-partition-missing = A Windows partíciója nem található
drive-volume-missing = A kötet nem található: { $path }
drive-storage-error = { $what } (Windows-tárolási hiba: { $code })
drive-shrink-size-unknown = A Windows nem tudta megállapítani, mennyire kicsinyíthető a partíciója
drive-resize-failed = A Windows nem tudta átméretezni a partícióját
drive-create-failed = A Windows nem tudott partíciót létrehozni a Luftnak
drive-hide-failed = A Windows nem tudta elrejteni az új partíciót a Fájlkezelő elől
drive-format-failed = A Windows nem tudta formázni az új partíciót
drive-remove-failed = A Windows nem tudta eltávolítani a Luft egyik partícióját
drive-new-partition-missing = Az új partíció nem található
drive-new-partition-no-volume = Az új partíciónak nincs kötete
drive-start-no-guid = Az indítópartíciónak nincs GUID-ja
drive-live-no-guid = Az élő partíciónak nincs GUID-ja
drive-box-no-guid = A költözési doboznak nincs GUID-ja
drive-guid-unreadable = A partíció GUID-ja nem olvasható
drive-not-gpt = A meghajtó partíciós táblája nem GPT
drive-start-no-volume = Az indítópartíciónak nincs kötete
drive-live-no-volume = A Luft partíciójának nincs kötete
drive-new-live-no-volume = A Luft új partíciójának nincs kötete
drive-partitions-not-noted = A Luft partíciói hiányoznak a Meet Luft feljegyzéseiből
drive-partitions-gone = A Luft partíciói eltűntek
drive-partition-gone = Egy partíció eltűnt
drive-gone = Egy meghajtó eltűnt
drive-erase-failed = A Windows nem tudta törölni a meghajtót
drive-erased-no-room = A törölt meghajtón nincs hely a Luftnak
drive-start-partition-foreign = A Luft indítópartícióját nem a Meet Luft hozta létre
drive-start-partition-gone = A Luft indítópartíciója eltűnt
drive-start-partition-not-listed = A Luft indítópartíciója nincs a partíciós táblában
drive-no-esp = Ennek a számítógépnek nincs EFI-rendszerpartíciója
drive-esp-full = Az EFI-rendszerpartíció túl telített a Luft indítófájljaihoz.
drive-esp-not-opened = Az EFI-rendszerpartíció nem nyitható meg
drive-esp-file-unreadable = Az EFI-rendszerpartíción ez a fájl nem olvasható: { $file }
drive-esp-no-drive = Az EFI-rendszerpartíciónak nincs meghajtója
drive-esp-no-guid = Az EFI-rendszerpartíciónak nincs GUID-ja
drive-no-uuid = A meghajtónak, amelyen a Luft van, nincs UUID-ja
drive-folder-unreadable = A Luft nem tud arról a meghajtóról indulni, amelyen a fájljai vannak.
drive-folder-not-startable = Erről nem lehet indítani: { $folder }

## Errors while changing Luft once it's installed

luft-gone = A Luft már nincs ezen a PC-n
luft-not-resizable = A Luft mérete most nem módosítható a Windowsból
luft-size-not-allowed = A Luft nem lehet ekkora
luft-space-promised = Ez a hely a Luftnak van félretéve. Előbb vonja vissza a módosítást.
luft-no-start-entry = A Luft indítási bejegyzése nem található

## Errors while getting Luft

live-no-home-folder = Nincs saját mappa, ahol a Luft tárolható lenne
live-no-app-data-folder = Nincs helyi alkalmazásadat-mappa, ahol a Luft tárolható lenne
live-pointer-unreadable = A legújabb Luft nem olvasható
live-not-published = A Luft nincs ott közzétéve
live-checksum-unreadable = Az ellenőrzőösszeg-fájl nem olvasható
live-checksum-not-read = A Luft ellenőrzőösszege nem olvasható: { $error }
live-download-damaged = A letöltés útközben megsérült. Próbálja újra.
live-download-incomplete = A letöltött Luftból hiányzik: { $file }
live-download-not-resumable = A kiszolgáló nem tudja folytatni a letöltést
live-not-signed = Nincs aláírva: { $iso }
live-signature-unreadable = Az aláírás nem olvasható: { $iso }
live-signature-wrong-key = Nem a Lantharos írta alá: { $iso }
live-signature-other-iso = Az aláírás ehhez tartozik: { $signed }, nem ehhez: { $iso }
live-iso-out-of-order = Az ISO fájljai nem olyan sorrendben vannak, amelyet a Meet Luft be tud olvasni
live-iso-not-iso = Ez nem ISO-lemezkép
live-iso-no-root = Az ISO-nak nincs gyökérmappája
live-iso-no-joliet = Az ISO-ban nincsenek Joliet-nevek
live-not-removed = Nem távolítható el: { $path } ({ $error })

## Errors while making a USB stick

stick-gone = A pendrive már nincs csatlakoztatva. Dugja vissza, és válassza ki újra.
stick-too-small = A Luft nem fér el ezen a pendrive-on. Használjon legalább 4 GB-osat.
stick-damaged = Az ISO nem egyezik az ellenőrzőösszegével. Lehet, hogy útközben megsérült.
stick-read-back-differs = A pendrive-ról nem az olvasható vissza, ami rákerült. Lehet, hogy elhasználódott, próbáljon egy másikat.
stick-download-unavailable = A Luft most nem tölthető le: { $error }
stick-download-failed = A Luft nem tölthető le: { $error }
stick-checksum-unreadable = Az ISO ellenőrzőösszege nem olvasható: { $error }
stick-file-unreadable = Nem olvasható: { $path } ({ $error })
stick-iso-unreadable = Az ISO nem olvasható: { $error }
stick-iso-no-name = Az ISO-nak nincs neve
stick-iso-ended-early = Az ISO idő előtt véget ért
stick-iso-already-there = Már rajta van a pendrive-on: { $name }
stick-no-room = Nincs hely a Luftnak a pendrive-on. Előbb szabadítson fel rajta { $size } MB-ot.
stick-older-not-removed = A régebbi Luft nem távolítható el: { $error }
stick-copy-stopped = A Luft pendrive-ra másolása megszakadt: { $error }
stick-not-opened = A pendrive nem nyitható meg: { $error }
stick-write-stopped = A pendrive írása megszakadt: { $error }
stick-not-synced = A pendrive nem mentett el mindent: { $error }
stick-read-back-failed = A pendrive nem olvasható vissza: { $error }
stick-in-use = A pendrive még használatban van: { $error }
stick-device-in-use = Még használatban van: { $device } ({ $error })
stick-volume-not-opened = A pendrive kötete nem nyitható meg: { $error }
stick-volume-in-use = A pendrive még használatban van. Zárja be, ami fájlokat tart nyitva rajta, és próbálja újra ({ $error })
stick-not-dismounted = A Windows nem tudta elengedni a pendrive-ot: { $error }
stick-not-cleared = A Windows nem tudta törölni a pendrive-ot: { $error }
stick-not-refreshed = A Windows nem tudta újra beolvasni a pendrive-ot: { $error }
stick-not-ventoy = Ez a pendrive már nem Ventoyt használ.
stick-ventoy-not-opened = A Ventoy partíciója nem nyitható meg: { $error }
stick-ventoy-not-opened-windows = A Windows nem tudja megnyitni a Ventoy partícióját
stick-udisks-missing = A Meet Luftnak a pendrive használatához UDisks kell: { $error }
