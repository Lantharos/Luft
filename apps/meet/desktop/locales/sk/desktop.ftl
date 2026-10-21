## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-bitový procesor Intel alebo AMD
check-processor-x64-detail = Luft na ňom beží.
check-processor-arm = Procesor Arm
check-processor-arm-detail = Luft zatiaľ beží len na procesoroch Intel a AMD.
check-processor-32-bit-windows = 32-bitový Windows
check-processor-32-bit-system = 32-bitový systém
check-processor-32-bit-detail = Luft potrebuje 64-bitový procesor Intel alebo AMD.
check-startup-uefi = Spúšťa sa cez UEFI
check-startup-uefi-windows = Luft sa spúšťa rovnakým moderným spôsobom.
check-startup-uefi-linux = Luft pridá vlastnú položku spúšťania a { $system } sa bude ďalej spúšťať ako teraz.
check-startup-bios = Spúšťa sa v staršom režime BIOS
check-startup-bios-windows = Luft potrebuje UEFI. Windows môže prejsť pomocou MBR2GPT a potom sa dá UEFI zapnúť v nastaveniach firmvéru.
check-startup-bios-linux = Luft potrebuje UEFI. Zapnite ho v nastaveniach firmvéru, aj pre systém, ktorý tu už je, a potom skontrolujte znova.
check-startup-mbr = Disk používa starú tabuľku oddielov
check-startup-mbr-windows = Luft potrebuje disk GPT. Windows ho môže previesť pomocou MBR2GPT bez straty súborov.
check-startup-mbr-linux = Luft potrebuje na spustenie disk GPT.
check-startup-no-esp = Chýba systémový oddiel EFI
check-startup-no-esp-detail = Luft pridáva svoje spúšťacie súbory k tým, ktoré už sú na systémovom oddiele EFI, a ten tu nie je.
check-startup-esp-full = Systémový oddiel EFI je plný
check-startup-esp-full-detail = Luft tam potrebuje { $size } MB na svoje spúšťacie súbory. Miesto zvyčajne zaberajú staré jadrá alebo položky spúšťania.
check-folder-fine = Oddiely sa nemenia
check-folder-fine-detail = Luft sa uloží ako súbor na váš disk { $filesystem } a spúšťa sa odtiaľ.
check-folder-encrypted = Vaše súbory sú na šifrovanom disku
check-folder-encrypted-detail = Luft sa zatiaľ nevie spustiť zo šifrovaného disku. Na vyskúšanie použite USB kľúč.
check-folder-combined = Vaše súbory sú na viacerých oddieloch
check-folder-combined-detail = Luft sa zatiaľ nevie spustiť z LVM ani RAID. Na vyskúšanie použite USB kľúč.
check-folder-filesystem = Luft sa nevie spustiť zo systému súborov { $filesystem }
check-folder-filesystem-detail = Spúšťa sa z diskov ext4, btrfs a XFS. Na vyskúšanie použite USB kľúč.
check-space-free = Voľné miesto: { $size } GB
check-space-free-linux = Počas skúšania zaberie Luft asi { $size } GB.
check-space-up-to = Až { $size } GB pre Luft
check-space-up-to-detail = Windows si ponechá svoje súbory aj miesto na rast.
check-space-short = Nedostatok voľného miesta
check-space-short-windows = Luft potrebuje asi { $needed } GB, ktoré môže Windows uvoľniť. Uvoľnite vo Windows { $missing } GB, napríklad pomocou Čistenia disku, a potom skontrolujte znova.
check-space-short-linux = Luft potrebuje na spustenie asi { $needed } GB. Uvoľnite { $missing } GB a potom skontrolujte znova.
check-system-replaceable = Luft môže zaujať jeho miesto a zachovať vaše súbory, účet aj nastavenia.
check-system-single = Vaše súbory sú na jednom oddiele so systémom, preto jeho nahradenie so zachovaním súborov zatiaľ nie je podporované. Vyskúšanie aj inštalácia systému Luft fungujú.
check-system-encrypted = Systém je šifrovaný, preto jeho nahradenie so zachovaním súborov zatiaľ nie je podporované.
check-system-unknown = Jeho disk je usporiadaný tak, že ho Luft zatiaľ nevie nahradiť so zachovaním súborov.
check-encryption-off = Windows nie je šifrovaný
check-encryption-off-detail = Aplikácia Inštalovať Luft môže načítať jeho nastavenia a vaše zariadenia Bluetooth.
check-encryption-on = Windows je šifrovaný nástrojom BitLocker
check-encryption-on-detail = To nevadí. Windows uvoľní miesto sám a Meet Luft prenesie to, čo Luft zo zamknutého disku neprečíta. Pre istotu majte poruke kľúč na obnovenie.
check-encryption-changing = BitLocker ešte šifruje alebo dešifruje
check-encryption-changing-detail = Počkajte, kým Windows skončí, a potom sa vráťte. Priebeh uvidíte v Nastaveniach v časti Šifrovanie zariadenia.
check-fast-startup-on = Rýchle spustenie je zapnuté
check-fast-startup-on-detail = Windows namiesto vypnutia prejde do režimu dlhodobého spánku, takže jeho disk zostane zamknutý. Meet Luft ho pred inštaláciou ponúkne vypnúť.
check-fast-startup-off = Rýchle spustenie je vypnuté
check-fast-startup-off-detail = Windows sa vypína úplne.
check-secure-boot-on = Secure Boot je zapnutý
check-secure-boot-on-detail = Môže zostať zapnutý. Luft raz na modrej obrazovke požiada o pridanie svojho kľúča.
check-secure-boot-off = Secure Boot je vypnutý
check-secure-boot-off-detail = Luft funguje aj bez neho, ale hry s ochranou proti podvádzaniu ho vyžadujú. { $turningOn }
check-secure-boot-restart-into = Meet Luft môže reštartovať do nastavení firmvéru, kde ho nájdete v časti { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft môže reštartovať do nastavení firmvéru, kde ho zvyčajne nájdete v časti Security alebo Boot.
check-secure-boot-turn-on = Ak ho chcete zapnúť, reštartujte počítač, pri zobrazení loga { $maker } stlačte { $key } a prejdite do { $place }.
check-secure-boot-turn-on-anywhere = Ak ho chcete zapnúť, pri spúšťaní počítača otvorte nastavenia firmvéru a pozrite sa do časti Security alebo Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, potom Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, potom Secure Boot
check-firmware-place-security-or-advanced = Security alebo Advanced, potom Secure Boot Configuration
check-firmware-place-security-or-boot = Security alebo Boot, potom Secure Boot
check-firmware-place-boot = Boot, potom Secure Boot
check-firmware-place-settings = Settings, potom Security, potom Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (na ThinkPade F1)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 alebo Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = tlačidlo zvýšenia hlasitosti

## More of the computer's hardware

check-tpm-detail = Šifrovaný Luft sa pri spustení počítača môže odomknúť sám.
check-tpm-missing = Chýba TPM 2.0
check-tpm-missing-detail = Ak Luft zašifrujete, pri každom spustení si vypýta prístupovú frázu.
check-graphics = Grafika
check-graphics-detail = Funguje hneď.
check-graphics-nvidia = Luft sa nainštaluje s vlastným ovládačom NVIDIA.
check-wifi-missing = Chýba Wi-Fi
check-wifi-missing-detail = V systéme Luft použite sieťový kábel, alebo sa zaobíďte bez siete.
check-wifi-detail = V systéme Luft funguje.
check-wifi-broadcom = Niektoré čipy Wi-Fi od Broadcomu potrebujú ovládač, ktorý Luft neobsahuje. Majte poruke sieťový kábel alebo telefón na zdieľanie pripojenia cez USB.
check-start-entries = { $count ->
    [one] Stará položka spúšťania
    [few] { $count } staré položky spúšťania
    [many] { $count } starej položky spúšťania
   *[other] { $count } starých položiek spúšťania
}
check-start-entries-detail = { $count ->
    [one] { $names } odkazuje na systém, ktorý už v tomto počítači nie je. Dá sa upratať.
    [few] { $names } odkazujú na systémy, ktoré už v tomto počítači nie sú. Dajú sa upratať.
    [many] { $names } odkazujú na systémy, ktoré už v tomto počítači nie sú. Dajú sa upratať.
   *[other] { $names } odkazujú na systémy, ktoré už v tomto počítači nie sú. Dajú sa upratať.
}
check-download-unavailable = Luft sa teraz nedá stiahnuť
check-download-unavailable-detail = Meet Luft sťahuje asi 3 GB. Skontrolujte, či ste online, a skontrolujte znova, alebo použite ISO systému Luft, ktoré už máte.

## Choosing a Luft ISO file

iso-dialog-title = Vyberte ISO systému Luft
iso-dialog-filter = ISO systému Luft

## Saving the logs from trying Luft

logs-file-name = Denníky Luft { $name }
logs-no-desktop = Aplikácia Meet Luft nenašla vašu pracovnú plochu
logs-not-saved = Aplikácii Meet Luft sa nepodarilo uložiť denníky zo skúšania systému Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Pomocník aplikácie Meet Luft sa nespustil: { $error }
helper-not-allowed = Aplikácia Meet Luft nedostala povolenie na prácu s diskom
helper-stopped = Pomocník aplikácie Meet Luft sa zastavil
helper-stopped-because = Pomocník aplikácie Meet Luft sa zastavil: { $error }
helper-pipe-failed = Aplikácia Meet Luft sa nemôže spojiť so svojím pomocníkom: { $error }
helper-pipe-hijacked = { $pipe } otvorilo niečo iné ako pomocník aplikácie Meet Luft
helper-record-not-saved = Aplikácii Meet Luft sa nepodarilo zaznamenať, čo vytvorila: { $error }
helper-no-room-yet = Najprv uvoľnite miesto pre Luft.
helper-not-ready-linux = Najprv Luft pripravte.
helper-not-ready-to-start-windows = Luft ešte nie je pripravený na spustenie. Najprv preň uvoľnite miesto.
helper-not-ready-to-start-linux = Luft ešte nie je pripravený na spustenie. Najprv ho pripravte.
helper-update-unfinished = Aktualizáciu systému Luft sa nepodarilo dokončiť. Najprv ho aktualizujte znova.
helper-room-too-small = Luft potrebuje viac miesta.
helper-room-shortfall = Windows môže uvoľniť { $available } GB a Luft potrebuje { $needed } GB.
helper-box-shortfall = Windows môže uvoľniť ešte { $available } GB a vybrané veci potrebujú { $needed } GB.
helper-bluetooth-unreadable = Nastavenia Bluetooth vo Windows sa nepodarilo otvoriť
helper-registry-not-opened = Nepodarilo sa otvoriť { $key }: { $error }
helper-registry-not-changed = Nepodarilo sa zmeniť { $value }: { $error }
helper-registry-not-saved = Nepodarilo sa uložiť { $file }: { $error }
helper-restart-failed = Počítač sa nereštartoval
helper-windows-restart-failed = Windows sa nereštartoval: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Tento počítač sa nespúšťa cez UEFI
firmware-variable-unreadable = Z firmvéru sa nepodarilo prečítať { $name }: { $error }
firmware-variable-not-saved = Do firmvéru sa nepodarilo uložiť { $name }: { $error }
firmware-entries-full = Vo firmvéri nie je miesto na ďalšiu položku spúšťania
firmware-entry-kept = Windows ponechal položku spúšťania { $entry }

## Errors about drives and partitions

drive-list-failed = Disky sa nepodarilo vypísať: { $error }
drive-of-path-unknown = Nepodarilo sa zistiť, na ktorom disku je { $path }
drive-windows-folder-missing = Priečinok systému Windows sa nenašiel
drive-windows-drive-missing = Disk systému Windows sa nenašiel
drive-windows-drive-missing-because = Disk systému Windows sa nenašiel: { $error }
drive-windows-partition-missing = Oddiel systému Windows sa nenašiel
drive-volume-missing = Zväzok { $path } sa nenašiel
drive-storage-error = { $what } (chyba úložiska Windows { $code })
drive-shrink-size-unknown = Windows nevie zistiť, ako veľmi sa dá jeho oddiel zmenšiť
drive-grow-size-unknown = Windows nevie zistiť, ako veľmi sa dá jeho oddiel zväčšiť
drive-resize-failed = Windows nevie zmeniť veľkosť svojho oddielu
drive-create-failed = Windows nevie vytvoriť oddiel pre Luft
drive-hide-failed = Windows nevie skryť nový oddiel v Prieskumníkovi
drive-format-failed = Windows nevie naformátovať nový oddiel
drive-remove-failed = Windows nevie odstrániť jeden z oddielov systému Luft
drive-new-partition-missing = Nový oddiel sa nenašiel
drive-new-partition-no-volume = Nový oddiel nemá zväzok
drive-start-no-guid = Spúšťací oddiel nemá GUID
drive-live-no-guid = Oddiel systému Luft nemá GUID
drive-box-no-guid = Sťahovacia krabica nemá GUID
drive-guid-unreadable = GUID oddielu sa nedá prečítať
drive-not-gpt = Tabuľka oddielov disku nie je GPT
drive-start-no-volume = Spúšťací oddiel nemá zväzok
drive-live-no-volume = Oddiel systému Luft nemá zväzok
drive-new-live-no-volume = Nový oddiel systému Luft nemá zväzok
drive-partitions-not-noted = Oddiely systému Luft chýbajú v záznamoch aplikácie Meet Luft
drive-partitions-gone = Oddiely systému Luft zmizli
drive-partition-gone = Oddiel zmizol
drive-start-partition-foreign = Spúšťací oddiel systému Luft nevytvorila aplikácia Meet Luft
drive-start-partition-gone = Spúšťací oddiel systému Luft zmizol
drive-start-partition-not-listed = Spúšťací oddiel systému Luft nie je v tabuľke oddielov
drive-no-esp = Tento počítač nemá systémový oddiel EFI
drive-esp-full = Systémový oddiel EFI je na spúšťacie súbory systému Luft príliš plný.
drive-esp-not-opened = Systémový oddiel EFI sa nepodarilo otvoriť
drive-esp-file-unreadable = Súbor { $file } na systémovom oddiele EFI sa nedá prečítať
drive-esp-no-drive = Systémový oddiel EFI nemá disk
drive-esp-no-guid = Systémový oddiel EFI nemá GUID
drive-no-uuid = Disk, na ktorom je Luft uložený, nemá UUID
drive-folder-unreadable = Luft sa nemôže spustiť z disku, na ktorom sú vaše súbory.
drive-folder-not-startable = Z { $folder } sa nedá spustiť systém

## Errors while getting Luft

live-no-home-folder = Chýba domovský priečinok, kam uložiť Luft
live-no-app-data-folder = Chýba miestny priečinok údajov aplikácií, kam uložiť Luft
live-pointer-unreadable = Najnovší Luft sa nedá prečítať
live-not-published = Luft tam nie je zverejnený
live-checksum-unreadable = Súbor s kontrolným súčtom sa nedá prečítať
live-checksum-not-read = Kontrolný súčet systému Luft sa nepodarilo prečítať: { $error }
live-download-damaged = Stiahnutý súbor sa cestou poškodil. Skúste to znova.
live-download-incomplete = V stiahnutom systéme Luft chýba { $file }
live-download-not-resumable = Server nemôže pokračovať v sťahovaní
live-not-signed = { $iso } nie je podpísaný
live-signature-unreadable = Podpis súboru { $iso } sa nedá prečítať
live-signature-wrong-key = { $iso } nie je podpísaný spoločnosťou Lantharos
live-signature-other-iso = Podpis patrí k súboru { $signed }, nie k { $iso }
live-iso-out-of-order = Súbory v ISO nie sú v poradí, ktoré aplikácia Meet Luft vie prečítať
live-iso-not-iso = Toto nie je obraz ISO
live-iso-no-root = ISO nemá koreňový priečinok
live-iso-no-joliet = ISO nemá názvy Joliet
live-not-removed = { $path } sa nepodarilo odstrániť: { $error }

## Errors while making a USB stick

stick-gone = USB kľúč už nie je pripojený. Pripojte ho znova a znova ho vyberte.
stick-too-small = Luft sa na tento USB kľúč nezmestí. Použite kľúč s kapacitou aspoň 4 GB.
stick-damaged = ISO nezodpovedá svojmu kontrolnému súčtu. Mohlo sa cestou poškodiť.
stick-read-back-differs = Z USB kľúča sa pri spätnom čítaní nenačítalo to, čo sa naň zapísalo. Môže byť opotrebovaný, skúste iný.
stick-download-unavailable = Luft sa teraz nedá stiahnuť: { $error }
stick-download-failed = Luft sa nepodarilo stiahnuť: { $error }
stick-checksum-unreadable = Kontrolný súčet ISO sa nedá prečítať: { $error }
stick-file-unreadable = { $path } sa nedá prečítať: { $error }
stick-iso-unreadable = ISO sa nedá prečítať: { $error }
stick-iso-no-name = ISO nemá názov
stick-iso-ended-early = ISO sa predčasne skončilo
stick-iso-already-there = { $name } už na USB kľúči je.
stick-no-room = Na USB kľúči nie je miesto pre Luft. Najprv na ňom uvoľnite { $size } MB.
stick-older-not-removed = Starší Luft sa nepodarilo odstrániť: { $error }
stick-copy-stopped = Kopírovanie systému Luft na USB kľúč sa zastavilo: { $error }
stick-not-opened = USB kľúč sa nepodarilo otvoriť: { $error }
stick-write-stopped = Zápis na USB kľúč sa zastavil: { $error }
stick-not-synced = USB kľúč neprijal všetky údaje: { $error }
stick-read-back-failed = USB kľúč sa nepodarilo spätne prečítať: { $error }
stick-in-use = USB kľúč sa stále používa: { $error }
stick-device-in-use = { $device } sa stále používa: { $error }
stick-volume-not-opened = Zväzok USB kľúča sa nepodarilo otvoriť: { $error }
stick-volume-in-use = USB kľúč sa stále používa. Zatvorte, čo na ňom má otvorené súbory, a skúste to znova ({ $error })
stick-not-dismounted = Windows nevie uvoľniť USB kľúč: { $error }
stick-not-cleared = Windows nevie vymazať USB kľúč: { $error }
stick-not-refreshed = Windows nevie znova načítať USB kľúč: { $error }
stick-not-ventoy = Tento USB kľúč už nepoužíva Ventoy.
stick-ventoy-not-opened = Oddiel Ventoy sa nepodarilo otvoriť: { $error }
stick-ventoy-not-opened-windows = Windows nevie otvoriť oddiel Ventoy
stick-udisks-missing = Aplikácia Meet Luft potrebuje na použitie USB kľúča UDisks: { $error }
