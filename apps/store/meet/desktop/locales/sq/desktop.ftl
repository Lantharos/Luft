## What Meet Luft finds when it checks a computer

check-processor-x64 = Procesor Intel ose AMD 64-bit
check-processor-x64-detail = Luft funksionon në të.
check-processor-arm = Procesor Arm
check-processor-arm-detail = Për momentin Luft funksionon vetëm në procesorë Intel dhe AMD.
check-processor-32-bit-windows = Windows 32-bit
check-processor-32-bit-system = Sistem 32-bit
check-processor-32-bit-detail = Luft ka nevojë për një procesor Intel ose AMD 64-bit.
check-startup-uefi = Niset me UEFI
check-startup-uefi-windows = Luft niset në të njëjtën mënyrë moderne.
check-startup-uefi-linux = Luft shton hyrjen e vet të nisjes, dhe { $system } vazhdon të niset si tani.
check-startup-bios = Niset në modalitetin e vjetër BIOS
check-startup-bios-windows = Luft ka nevojë për UEFI. Windows mund të kalojë me MBR2GPT, pastaj UEFI mund të aktivizohet te cilësimet e firmware.
check-startup-bios-linux = Luft ka nevojë për UEFI. Aktivizoje te cilësimet e firmware, bashkë me sistemin që është këtu, pastaj kontrollo sërish.
check-startup-mbr = Disku përdor një tabelë të vjetër ndarjesh
check-startup-mbr-windows = Luft ka nevojë për një disk GPT. Windows mund ta konvertojë me MBR2GPT pa humbur skedarë.
check-startup-mbr-linux = Luft ka nevojë për një disk GPT për t’u nisur.
check-startup-no-esp = Nuk ka ndarje sistemi EFI
check-startup-no-esp-detail = Luft i shton skedarët e vet të nisjes pranë atyre që ndodhen në ndarjen e sistemit EFI, dhe nuk ka asnjë të tillë.
check-startup-esp-full = Ndarja e sistemit EFI është plot
check-startup-esp-full-detail = Luft ka nevojë për { $size } MB aty për skedarët e vet të nisjes. Zakonisht hapësirën e zënë kernelë ose hyrje nisjeje të vjetra.
check-folder-fine = Asgjë nuk ndahet nga e para
check-folder-fine-detail = Luft mbahet si skedar në diskun tënd { $filesystem } dhe niset prej andej.
check-folder-encrypted = Skedarët e tu janë në një disk të enkriptuar
check-folder-encrypted-detail = Luft nuk mund të niset ende nga një disk i enkriptuar. Përdor një memorie USB për ta provuar.
check-folder-combined = Skedarët e tu shtrihen në më shumë se një ndarje
check-folder-combined-detail = Luft nuk mund të niset ende nga LVM ose RAID. Përdor një memorie USB për ta provuar.
check-folder-filesystem = Luft nuk mund të niset nga { $filesystem }
check-folder-filesystem-detail = Niset nga disqe ext4, btrfs dhe XFS. Përdor një memorie USB për ta provuar.
check-space-free = { $size } GB të lira
check-space-free-linux = Luft zë rreth { $size } GB ndërsa e provon.
check-space-up-to = Deri në { $size } GB për Luft
check-space-up-to-detail = Windows mban skedarët e vet dhe vend për t’u rritur.
check-space-free-already = { $size } GB prej tyre janë të lira tashmë, ndaj Windows jep më pak.
check-space-other-drive = Ka vend për të në { $drive }.
check-space-erase-drive = Ka vend për të në { $drive }, pasi të fshihet ai disk.
check-space-short = Nuk ka hapësirë të mjaftueshme
check-space-short-windows = Luft ka nevojë për rreth { $needed } GB që Windows mund t’i lirojë. Liro { $missing } GB në Windows, për shembull me Disk Cleanup, pastaj kontrollo sërish.
check-space-short-linux = Luft ka nevojë për rreth { $needed } GB për t’u nisur. Liro { $missing } GB, pastaj kontrollo sërish.
check-system-replaceable = Luft mund të zërë vendin e tij dhe të mbajë skedarët, llogarinë dhe cilësimet e tua.
check-system-single = Skedarët e tu ndajnë një ndarje me sistemin, ndaj zëvendësimi i tij duke i mbajtur ata nuk mbështetet ende. Provimi dhe instalimi i Luft funksionojnë.
check-system-encrypted = Është i enkriptuar, ndaj zëvendësimi i tij duke mbajtur skedarët nuk mbështetet ende.
check-system-unknown = Disku i tij është organizuar në një mënyrë që Luft nuk mund ta zëvendësojë ende duke mbajtur skedarët.
check-encryption-off = Windows nuk është i enkriptuar
check-encryption-off-detail = Instalo Luft mund të lexojë cilësimet e tij dhe pajisjet e tua Bluetooth.
check-encryption-on = Windows është i enkriptuar me BitLocker
check-encryption-on-detail = Nuk ka problem. Windows e bën vetë vendin, dhe Meet Luft sjell atë që Luft nuk mund ta lexojë nga një disk i bllokuar. Mbaje çelësin e rikuperimit pranë, për çdo rast.
check-encryption-changing = BitLocker po enkripton ose dekripton ende
check-encryption-changing-detail = Prit derisa Windows të mbarojë, pastaj kthehu. Ecurinë e sheh te Settings, te Device encryption.
check-fast-startup-on = Fast Startup është aktiv
check-fast-startup-on-detail = Windows hyn në përgjumje në vend që të fiket, gjë që e mban diskun e tij të bllokuar. Meet Luft ofron ta çaktivizojë para instalimit.
check-fast-startup-off = Fast Startup është joaktiv
check-fast-startup-off-detail = Windows fiket plotësisht.
check-secure-boot-on = Secure Boot është aktiv
check-secure-boot-on-detail = Mund të mbetet aktiv. Luft pyet një herë, në një ekran blu, për të shtuar çelësin e vet.
check-secure-boot-off = Secure Boot është joaktiv
check-secure-boot-off-detail = Luft funksionon edhe pa të, por lojërat me anti-cheat kanë nevojë për të. { $turningOn }
check-secure-boot-restart-into = Meet Luft mund të rinisë te cilësimet e firmware, ku ndodhet te { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft mund të rinisë te cilësimet e firmware, ku zakonisht ndodhet te Security ose Boot.
check-secure-boot-turn-on = Për ta aktivizuar, rinis dhe shtyp { $key } kur shfaqet logoja e { $maker }, pastaj shko te { $place }.
check-secure-boot-turn-on-anywhere = Për ta aktivizuar, hap cilësimet e firmware ndërsa niset kompjuteri dhe shiko te Security ose Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, pastaj Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, pastaj Secure Boot
check-firmware-place-security-or-advanced = Security ose Advanced, pastaj Secure Boot Configuration
check-firmware-place-security-or-boot = Security ose Boot, pastaj Secure Boot
check-firmware-place-boot = Boot, pastaj Secure Boot
check-firmware-place-settings = Settings, pastaj Security, pastaj Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 në një ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 ose Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = butonin e rritjes së volumit

## More of the computer's hardware

check-tpm-detail = Një Luft i enkriptuar mund të zhbllokohet vetë kur niset kompjuteri.
check-tpm-missing = Nuk ka TPM 2.0
check-tpm-missing-detail = Nëse e enkripton Luft, ai kërkon një frazë kalimi sa herë niset.
check-graphics = Grafika
check-graphics-detail = Funksionon menjëherë.
check-graphics-nvidia = Luft instalohet me drejtuesin e vetë NVIDIA.
check-wifi-missing = Nuk ka Wi-Fi
check-wifi-missing-detail = Përdor një kabllo rrjeti në Luft, ose asgjë fare.
check-wifi-detail = Funksionon në Luft.
check-wifi-broadcom = Disa çipe Wi-Fi Broadcom kanë nevojë për një drejtues që Luft nuk e përfshin. Mbaj pranë një kabllo rrjeti ose një telefon për ndarje interneti me USB.
check-start-entries = { $count ->
    [one] Një hyrje e vjetër nisjeje
   *[other] { $count } hyrje të vjetra nisjeje
}
check-start-entries-detail = { $count ->
    [one] { $names } tregon një sistem që nuk është më në këtë PC. Mund të pastrohet.
   *[other] { $names } tregojnë sisteme që nuk janë më në këtë PC. Mund të pastrohen.
}
check-download-unavailable = Luft nuk mund të shkarkohet tani
check-download-unavailable-detail = Meet Luft shkarkon rreth 3 GB. Kontrollo që je në internet dhe kontrollo sërish, ose përdor një ISO të Luft që e ke tashmë.

## Choosing a Luft ISO file

iso-dialog-title = Zgjidh një ISO të Luft
iso-dialog-filter = ISO e Luft

## Saving the logs from trying Luft

logs-file-name = Regjistrat e Luft { $name }
logs-no-desktop = Meet Luft nuk e gjeti desktopin tënd
logs-not-saved = Meet Luft nuk mundi t’i ruante regjistrat e Provo Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Ndihmësi i Meet Luft nuk u nis: { $error }
helper-not-allowed = Meet Luft nuk u lejua të punonte në disk
helper-stopped = Ndihmësi i Meet Luft u ndal
helper-stopped-because = Ndihmësi i Meet Luft u ndal: { $error }
helper-pipe-failed = Meet Luft nuk mundi të komunikonte me ndihmësin e vet: { $error }
helper-pipe-hijacked = Diçka tjetër përveç ndihmësit të Meet Luft hapi { $pipe }
helper-record-not-saved = Meet Luft nuk mundi të shënonte çfarë krijoi: { $error }
helper-no-room-yet = Bëj fillimisht vend për Luft.
helper-not-ready-linux = Përgatit fillimisht Luft.
helper-not-ready-to-start-windows = Luft nuk është ende gati për t’u nisur. Bëj fillimisht vend për të.
helper-not-ready-to-start-linux = Luft nuk është ende gati për t’u nisur. Përgatite fillimisht.
helper-update-unfinished = Përditësimi i Luft nuk përfundoi. Përditësoje sërish fillimisht.
helper-room-too-small = Luft ka nevojë për më shumë vend se kaq.
helper-room-shortfall = Windows mund të lirojë { $available } GB, ndërsa Luft ka nevojë për { $needed } GB.
helper-gap-shortfall = Ajo hapësirë ka { $available } GB, ndërsa Luft ka nevojë për { $needed } GB.
helper-place-gone = Ajo hapësirë nuk është më e lirë. Kontrollo sërish për të parë ku nxë Luft.
helper-box-shortfall = Windows mund të lirojë edhe { $available } GB, ndërsa këto kanë nevojë për { $needed } GB.
helper-box-room-shortfall = Vendi i Luft mund të lirojë { $available } GB, ndërsa këto kanë nevojë për { $needed } GB.
helper-bluetooth-unreadable = Cilësimet Bluetooth të Windows nuk mund të hapeshin
helper-registry-not-opened = Nuk mund të hapej { $key }: { $error }
helper-registry-not-changed = Nuk mund të ndryshohej { $value }: { $error }
helper-registry-not-saved = Nuk mund të ruhej { $file }: { $error }
helper-restart-failed = Kompjuteri nuk u rinis
helper-windows-restart-failed = Windows nuk u rinis: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Ky PC nuk niset me UEFI
firmware-variable-unreadable = Nuk mund të lexohej { $name } nga firmware: { $error }
firmware-variable-not-saved = Nuk mund të ruhej { $name } në firmware: { $error }
firmware-entries-full = Firmware nuk ka vend për një hyrje tjetër nisjeje
firmware-entry-kept = Windows e mbajti hyrjen e nisjes { $entry }

## Errors about drives and partitions

drive-list-failed = Disqet nuk mund të listoheshin: { $error }
drive-of-path-unknown = Nuk mund të përcaktohej cili disk përmban { $path }
drive-windows-folder-missing = Dosja e Windows nuk u gjet
drive-windows-drive-missing = Disku i Windows nuk u gjet
drive-windows-drive-missing-because = Disku i Windows nuk u gjet: { $error }
drive-windows-partition-missing = Ndarja e Windows nuk u gjet
drive-volume-missing = Vëllimi { $path } nuk u gjet
drive-storage-error = { $what } (gabim ruajtjeje i Windows { $code })
drive-shrink-size-unknown = Windows nuk mundi të përcaktonte sa e vogël mund të bëhet ndarja e tij
drive-resize-failed = Windows nuk mundi të ndryshonte madhësinë e ndarjes së tij
drive-create-failed = Windows nuk mundi të krijonte një ndarje për Luft
drive-hide-failed = Windows nuk mundi ta mbante ndarjen e re jashtë Explorer
drive-format-failed = Windows nuk mundi ta formatonte ndarjen e re
drive-remove-failed = Windows nuk mundi të hiqte një nga ndarjet e Luft
drive-new-partition-missing = Ndarja e re nuk u gjet
drive-new-partition-no-volume = Ndarja e re nuk ka vëllim
drive-start-no-guid = Ndarja e nisjes nuk ka GUID
drive-live-no-guid = Ndarja live nuk ka GUID
drive-box-no-guid = Kutia e shpërnguljes nuk ka GUID
drive-guid-unreadable = GUID-i i ndarjes nuk mund të lexohet
drive-not-gpt = Tabela e ndarjeve e diskut nuk është GPT
drive-start-no-volume = Ndarja e nisjes nuk ka vëllim
drive-live-no-volume = Ndarja e Luft nuk ka vëllim
drive-new-live-no-volume = Ndarja e re e Luft nuk ka vëllim
drive-partitions-not-noted = Ndarjet e Luft mungojnë në shënimet e Meet Luft
drive-partitions-gone = Ndarjet e Luft u zhdukën
drive-partition-gone = Një ndarje u zhduk
drive-gone = Një disk u zhduk
drive-erase-failed = Windows nuk mundi ta fshinte diskun
drive-erased-no-room = Disku i fshirë nuk ka vend për Luft
drive-start-partition-foreign = Ndarja e nisjes së Luft nuk është krijuar nga Meet Luft
drive-start-partition-gone = Ndarja e nisjes së Luft nuk është më
drive-start-partition-not-listed = Ndarja e nisjes së Luft nuk është në tabelën e ndarjeve
drive-no-esp = Ky kompjuter nuk ka ndarje sistemi EFI
drive-esp-full = Ndarja e sistemit EFI është shumë plot për skedarët e nisjes së Luft.
drive-esp-not-opened = Ndarja e sistemit EFI nuk mund të hapej
drive-esp-file-unreadable = { $file } i ndarjes së sistemit EFI nuk mund të lexohet
drive-esp-no-drive = Ndarja e sistemit EFI nuk ka disk
drive-esp-no-guid = Ndarja e sistemit EFI nuk ka GUID
drive-no-uuid = Disku ku mbahet Luft nuk ka UUID
drive-folder-unreadable = Luft nuk mund të niset nga disku ku janë skedarët e tu.
drive-folder-not-startable = Nuk mund të niset nga { $folder }

## Errors while changing Luft once it's installed

luft-gone = Luft nuk është më në këtë PC
luft-not-resizable = Madhësia e Luft nuk mund të ndryshohet nga Windows tani
luft-size-not-allowed = Luft nuk mund të ketë këtë madhësi
luft-space-promised = Ajo hapësirë është lënë mënjanë për Luft. Anulo fillimisht ndryshimin.
luft-no-start-entry = Hyrja e nisjes së Luft nuk u gjet

## Errors while getting Luft

live-no-home-folder = Nuk ka dosje personale ku të mbahet Luft
live-no-app-data-folder = Nuk ka dosje lokale të të dhënave të aplikacioneve ku të mbahet Luft
live-pointer-unreadable = Luft më i ri nuk mund të lexohet
live-not-published = Luft nuk është publikuar aty
live-checksum-unreadable = Skedari i shumës së kontrollit nuk mund të lexohet
live-checksum-not-read = Shuma e kontrollit e Luft nuk mund të lexohej: { $error }
live-download-damaged = Shkarkimi u dëmtua gjatë rrugës. Provo sërish.
live-download-incomplete = Luft-it të shkarkuar i mungon { $file }
live-download-not-resumable = Serveri nuk mund ta vazhdojë shkarkimin
live-not-signed = { $iso } nuk është i nënshkruar
live-signature-unreadable = Nënshkrimi i { $iso } nuk mund të lexohet
live-signature-wrong-key = { $iso } nuk është nënshkruar nga Lantharos
live-signature-other-iso = Nënshkrimi është për { $signed }, jo për { $iso }
live-iso-out-of-order = Skedarët e ISO-s nuk janë në një renditje që Meet Luft mund ta lexojë
live-iso-not-iso = Ky nuk është një imazh ISO
live-iso-no-root = ISO-ja nuk ka dosje rrënjë
live-iso-no-joliet = ISO-ja nuk ka emra Joliet
live-not-removed = { $path } nuk mund të hiqej: { $error }

## Errors while making a USB stick

stick-gone = Memoria nuk është më aty. Lidhe sërish dhe zgjidhe përsëri.
stick-too-small = Luft nuk nxë në këtë memorie. Përdor një prej 4 GB ose më shumë.
stick-damaged = ISO-ja nuk përputhet me shumën e saj të kontrollit. Mund të jetë dëmtuar gjatë rrugës.
stick-read-back-differs = Memoria nuk ktheu atë që u shkrua në të. Mund të jetë konsumuar, ndaj provo një tjetër.
stick-download-unavailable = Luft nuk mund të shkarkohet tani: { $error }
stick-download-failed = Luft nuk mund të shkarkohej: { $error }
stick-checksum-unreadable = Shuma e kontrollit e ISO-s nuk mund të lexohet: { $error }
stick-file-unreadable = { $path } nuk mund të lexohet: { $error }
stick-iso-unreadable = ISO-ja nuk mund të lexohet: { $error }
stick-iso-no-name = ISO-ja nuk ka emër
stick-iso-ended-early = ISO-ja mbaroi para kohe
stick-iso-already-there = { $name } është tashmë në memorie.
stick-no-room = Nuk ka vend për Luft në memorie. Liro fillimisht { $size } MB në të.
stick-older-not-removed = Luft më i vjetër nuk mund të hiqej: { $error }
stick-copy-stopped = Kopjimi i Luft në memorie u ndal: { $error }
stick-not-opened = Memoria nuk mund të hapej: { $error }
stick-write-stopped = Shkrimi në memorie u ndal: { $error }
stick-not-synced = Memoria nuk i ruajti të gjitha: { $error }
stick-read-back-failed = Memoria nuk mund të rilexohej: { $error }
stick-in-use = Memoria është ende në përdorim: { $error }
stick-device-in-use = { $device } është ende në përdorim: { $error }
stick-volume-not-opened = Vëllimi i memories nuk mund të hapej: { $error }
stick-volume-in-use = Memoria është ende në përdorim. Mbyll atë që ka skedarë të hapur në të dhe provo sërish ({ $error })
stick-not-dismounted = Windows nuk mundi ta lëshonte memorien: { $error }
stick-not-cleared = Windows nuk mundi ta pastronte memorien: { $error }
stick-not-refreshed = Windows nuk mundi ta rishikonte memorien: { $error }
stick-not-ventoy = Kjo memorie nuk përdor më Ventoy.
stick-ventoy-not-opened = Ndarja e Ventoy nuk mund të hapej: { $error }
stick-ventoy-not-opened-windows = Windows nuk mund ta hapë ndarjen e Ventoy
stick-udisks-missing = Meet Luft ka nevojë për UDisks për të përdorur memorien: { $error }
