## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-bitine Inteli või AMD protsessor
check-processor-x64-detail = Luft töötab sellel.
check-processor-arm = Armi protsessor
check-processor-arm-detail = Luft töötab praegu ainult Inteli ja AMD protsessoritel.
check-processor-32-bit-windows = 32-bitine Windows
check-processor-32-bit-system = 32-bitine süsteem
check-processor-32-bit-detail = Luft vajab 64-bitist Inteli või AMD protsessorit.
check-startup-uefi = Käivitub UEFI-ga
check-startup-uefi-windows = Luft käivitub samal moodsal viisil.
check-startup-uefi-linux = Luft lisab oma käivituskirje ja { $system } käivitub edasi nagu praegu.
check-startup-bios = Käivitub vanas BIOS-režiimis
check-startup-bios-windows = Luft vajab UEFI-t. Windows saab üle minna tööriistaga MBR2GPT, seejärel saab püsivara sätetes UEFI sisse lülitada.
check-startup-bios-linux = Luft vajab UEFI-t. Lülitage see püsivara sätetes sisse koos siin oleva süsteemiga ja kontrollige siis uuesti.
check-startup-mbr = Ketas kasutab vana partitsioonitabelit
check-startup-mbr-windows = Luft vajab GPT-ketast. Windows saab selle tööriistaga MBR2GPT teisendada faile kaotamata.
check-startup-mbr-linux = Luft vajab käivitumiseks GPT-ketast.
check-startup-no-esp = EFI-süsteemipartitsioon puudub
check-startup-no-esp-detail = Luft lisab oma käivitusfailid EFI-süsteemipartitsioonil juba olevate kõrvale, kuid seda partitsiooni pole.
check-startup-esp-full = EFI-süsteemipartitsioon on täis
check-startup-esp-full-detail = Luft vajab seal oma käivitusfailide jaoks { $size } MB. Tavaliselt võtavad ruumi vanad tuumad või käivituskirjed.
check-folder-fine = Partitsioone ei muudeta
check-folder-fine-detail = Lufti hoitakse failina teie { $filesystem }-kettal ja see käivitub sealt.
check-folder-encrypted = Teie failid on krüptitud kettal
check-folder-encrypted-detail = Luft ei saa veel krüptitud kettalt käivituda. Proovige seda selle asemel USB-mälupulgalt.
check-folder-combined = Teie failid asuvad mitmel partitsioonil
check-folder-combined-detail = Luft ei saa veel LVM-ilt ega RAID-ilt käivituda. Proovige seda selle asemel USB-mälupulgalt.
check-folder-filesystem = Luft ei saa käivituda failisüsteemilt { $filesystem }
check-folder-filesystem-detail = See käivitub ext4-, btrfs- ja XFS-ketastelt. Proovige seda selle asemel USB-mälupulgalt.
check-space-free = Vaba { $size } GB
check-space-free-linux = Proovimise ajal võtab Luft umbes { $size } GB.
check-space-up-to = Luftile kuni { $size } GB
check-space-up-to-detail = Windows jätab alles oma failid ja kasvuruumi.
check-space-free-already = Sellest { $size } GB on juba vaba, nii et Windows loovutab vähem.
check-space-other-drive = Kettal { $drive } on selle jaoks ruumi.
check-space-erase-drive = Kettal { $drive } on selle jaoks ruumi, kui see ketas kustutada.
check-space-short = Pole piisavalt vaba ruumi
check-space-short-windows = Luft vajab umbes { $needed } GB, mille Windows saab loovutada. Vabastage Windowsis { $missing } GB, näiteks kettapuhastusega, ja kontrollige siis uuesti.
check-space-short-linux = Luft vajab käivitumiseks umbes { $needed } GB. Vabastage { $missing } GB ja kontrollige siis uuesti.
check-system-replaceable = Luft võib tulla selle asemele ja jätta alles teie failid, konto ja sätted.
check-system-single = Teie failid on süsteemiga samal partitsioonil, seega selle asendamist failide säilitamisega veel ei toetata. Lufti proovimine ja installimine töötavad.
check-system-encrypted = See on krüptitud, seega selle asendamist failide säilitamisega veel ei toetata.
check-system-unknown = Selle ketas on jaotatud viisil, mida Luft ei saa veel failide säilitamisega asendada.
check-encryption-off = Windows pole krüptitud
check-encryption-off-detail = Lufti installimine saab lugeda selle sätteid ja teie Bluetooth-seadmeid.
check-encryption-on = Windows on krüptitud BitLockeriga
check-encryption-on-detail = Pole probleemi. Windows teeb ruumi ise ja Meet Luft toob üle selle, mida Luft lukustatud kettalt lugeda ei saa. Hoidke taastevõti igaks juhuks käepärast.
check-encryption-changing = BitLocker alles krüptib või dekrüptib
check-encryption-changing-detail = Oodake, kuni Windows lõpetab, ja tulge siis tagasi. Edenemist näete Sätetes jaotises Seadme krüptimine.
check-fast-startup-on = Kiirkäivitus on sees
check-fast-startup-on-detail = Windows läheb väljalülitamise asemel talveunerežiimi, mis hoiab selle ketast lukus ja helisüsteem ja WiFi võivad jääda olekusse, mida Luft kasutada ei oska. Meet Luft pakub selle enne paigaldamist välja lülitada.
check-fast-startup-off = Kiirkäivitus on väljas
check-fast-startup-off-detail = Windows lülitub täielikult välja.
check-secure-boot-on = Secure Boot on sees
check-secure-boot-on-detail = See võib jääda sisse. Luft palub üks kord sinisel kuval oma võtme lisada.
check-secure-boot-off = Secure Boot on väljas
check-secure-boot-off-detail = Luft töötab ka ilma selleta, kuid petmisvastase kaitsega mängud vajavad seda. { $turningOn }
check-secure-boot-restart-into = Meet Luft saab taaskäivitada püsivara sätetesse, kus see asub jaotises { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft saab taaskäivitada püsivara sätetesse, kus see on tavaliselt jaotises Security või Boot.
check-secure-boot-turn-on = Sisselülitamiseks taaskäivitage arvuti ja vajutage { $key }, kui ilmub tootja { $maker } logo, seejärel avage { $place }.
check-secure-boot-turn-on-anywhere = Sisselülitamiseks avage arvuti käivitumise ajal püsivara sätted ja vaadake jaotist Security või Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, seejärel Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, seejärel Secure Boot
check-firmware-place-security-or-advanced = Security või Advanced, seejärel Secure Boot Configuration
check-firmware-place-security-or-boot = Security või Boot, seejärel Secure Boot
check-firmware-place-boot = Boot, seejärel Secure Boot
check-firmware-place-settings = Settings, seejärel Security ja Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (ThinkPadil F1)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 või Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = helitugevuse suurendamise nuppu

## More of the computer's hardware

check-tpm-detail = Krüptitud Luft saab arvuti käivitumisel end ise avada.
check-tpm-missing = TPM 2.0 puudub
check-tpm-missing-detail = Kui krüptite Lufti, küsib see igal käivitumisel paroolifraasi.
check-graphics = Graafika
check-graphics-detail = Töötab kohe.
check-graphics-nvidia = Luft installitakse NVIDIA enda draiveriga.
check-wifi-missing = Wi-Fi puudub
check-wifi-missing-detail = Kasutage Luftis võrgukaablit või jääge võrguühenduseta.
check-wifi-detail = Töötab Luftis.
check-wifi-broadcom = Mõni Broadcomi Wi-Fi-kiip vajab draiverit, mida Luftis pole. Hoidke käepärast võrgukaabel või telefon USB kaudu internetijagamiseks.
check-start-entries =
    { $count ->
        [one] Vana käivituskirje
       *[other] { $count } vana käivituskirjet
    }
check-start-entries-detail =
    { $count ->
        [one] { $names } viitab süsteemile, mida selles arvutis enam pole. Selle saab ära koristada.
       *[other] { $names } viitavad süsteemidele, mida selles arvutis enam pole. Need saab ära koristada.
    }
check-download-unavailable = Lufti ei saa praegu alla laadida
check-download-unavailable-detail = Meet Luft laadib alla umbes 3 GB. Kontrollige, kas olete võrgus, ja kontrollige uuesti või kasutage olemasolevat Lufti ISO-faili.

## Choosing a Luft ISO file

iso-dialog-title = Valige Lufti ISO-fail
iso-dialog-filter = Lufti ISO

## Saving the logs from trying Luft

logs-file-name = Lufti logid { $name }
logs-no-desktop = Meet Luft ei leidnud teie töölauda
logs-not-saved = Meet Luft ei saanud Lufti proovimise logisid salvestada: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Meet Lufti abiprogramm ei käivitunud: { $error }
helper-not-allowed = Meet Luftil ei lubatud kettal toimetada
helper-stopped = Meet Lufti abiprogramm peatus
helper-stopped-because = Meet Lufti abiprogramm peatus: { $error }
helper-pipe-failed = Meet Luft ei saanud oma abiprogrammiga suhelda: { $error }
helper-pipe-hijacked = Ühenduse { $pipe } avas midagi muud kui Meet Lufti abiprogramm
helper-record-not-saved = Meet Luft ei saanud tehtut üles märkida: { $error }
helper-no-room-yet = Tehke esmalt Luftile ruumi.
helper-not-ready-linux = Valmistage esmalt Luft ette.
helper-not-ready-to-start-windows = Luft pole veel käivitamiseks valmis. Tehke sellele esmalt ruumi.
helper-not-ready-to-start-linux = Luft pole veel käivitamiseks valmis. Valmistage see esmalt ette.
helper-update-unfinished = Lufti värskendamine jäi pooleli. Värskendage see esmalt uuesti.
helper-room-too-small = Luft vajab rohkem ruumi.
helper-room-shortfall = Windows saab loovutada { $available } GB, kuid Luft vajab { $needed } GB.
helper-gap-shortfall = Selles ruumis on { $available } GB, kuid Luft vajab { $needed } GB.
helper-place-gone = See ruum pole enam vaba. Kontrollige uuesti, kuhu Luft mahub.
helper-box-shortfall = Windows saab loovutada veel { $available } GB, kuid valitud asjad vajavad { $needed } GB.
helper-box-room-shortfall = Lufti ruumist saab loovutada { $available } GB, kuid valitud asjad vajavad { $needed } GB.
helper-bluetooth-unreadable = Windowsi Bluetoothi sätteid ei saanud avada
helper-registry-not-opened = Registrivõtit { $key } ei saanud avada: { $error }
helper-registry-not-changed = Registriväärtust { $value } ei saanud muuta: { $error }
helper-registry-not-saved = Faili { $file } ei saanud salvestada: { $error }
helper-restart-failed = Arvuti ei taaskäivitunud
helper-windows-restart-failed = Windows ei taaskäivitunud: { $error }

## Errors about the computer's firmware

firmware-not-uefi = See arvuti ei käivitu UEFI-ga
firmware-variable-unreadable = Püsivarast ei saanud lugeda muutujat { $name }: { $error }
firmware-variable-not-saved = Püsivarasse ei saanud salvestada muutujat { $name }: { $error }
firmware-entries-full = Püsivaras pole ruumi uue käivituskirje jaoks
firmware-entry-kept = Windows jättis alles käivituskirje { $entry }

## Errors about drives and partitions

drive-list-failed = Kettaid ei saanud loetleda: { $error }
drive-of-path-unknown = Ei õnnestunud tuvastada, millisel kettal asub { $path }
drive-windows-folder-missing = Windowsi kausta ei leitud
drive-windows-drive-missing = Windowsi ketast ei leitud
drive-windows-drive-missing-because = Windowsi ketast ei leitud: { $error }
drive-windows-partition-missing = Windowsi partitsiooni ei leitud
drive-volume-missing = Köidet { $path } ei leitud
drive-storage-error = { $what } (Windowsi salvestusviga { $code })
drive-shrink-size-unknown = Windows ei suutnud öelda, kui väikeseks selle partitsiooni teha saab
drive-resize-failed = Windows ei saanud oma partitsiooni suurust muuta
drive-create-failed = Windows ei saanud Luftile partitsiooni luua
drive-hide-failed = Windows ei saanud uut partitsiooni Failihaldurist peita
drive-format-failed = Windows ei saanud uut partitsiooni vormindada
drive-remove-failed = Windows ei saanud üht Lufti partitsiooni eemaldada
drive-new-partition-missing = Uut partitsiooni ei leitud
drive-new-partition-no-volume = Uuel partitsioonil pole köidet
drive-start-no-guid = Käivituspartitsioonil pole GUID-i
drive-live-no-guid = Live-partitsioonil pole GUID-i
drive-box-no-guid = Kolimiskastil pole GUID-i
drive-guid-unreadable = Partitsiooni GUID-i ei saa lugeda
drive-not-gpt = Ketta partitsioonitabel pole GPT
drive-start-no-volume = Käivituspartitsioonil pole köidet
drive-live-no-volume = Lufti partitsioonil pole köidet
drive-new-live-no-volume = Lufti uuel partitsioonil pole köidet
drive-partitions-not-noted = Lufti partitsioonid puuduvad Meet Lufti märkmetest
drive-partitions-gone = Lufti partitsioonid kadusid
drive-partition-gone = Üks partitsioon kadus
drive-gone = Üks ketas kadus
drive-erase-failed = Windows ei saanud ketast kustutada
drive-erased-no-room = Kustutatud kettal pole Luftile ruumi
drive-start-partition-foreign = Lufti käivituspartitsioon pole Meet Lufti tehtud
drive-start-partition-gone = Lufti käivituspartitsioon on kadunud
drive-start-partition-not-listed = Lufti käivituspartitsiooni pole partitsioonitabelis
drive-no-esp = Selles arvutis pole EFI-süsteemipartitsiooni
drive-esp-full = EFI-süsteemipartitsioon on Lufti käivitusfailide jaoks liiga täis.
drive-esp-not-opened = EFI-süsteemipartitsiooni ei saanud avada
drive-esp-file-unreadable = EFI-süsteemipartitsiooni faili { $file } ei saa lugeda
drive-esp-no-drive = EFI-süsteemipartitsioonil pole ketast
drive-esp-no-guid = EFI-süsteemipartitsioonil pole GUID-i
drive-no-uuid = Kettal, millel Lufti hoitakse, pole UUID-d
drive-folder-unreadable = Luft ei saa käivituda kettalt, millel on teie failid.
drive-folder-not-startable = Kaustast { $folder } ei saa käivitada

## Errors while changing Luft once it's installed

luft-gone = Lufti pole enam selles arvutis
luft-not-resizable = Lufti suurust ei saa praegu Windowsist muuta
luft-size-not-allowed = Luft ei saa sellise suurusega olla
luft-space-promised = See ruum on Luftile reserveeritud. Tühistage esmalt muudatus.
luft-no-start-entry = Lufti käivituskirjet ei leitud

## Errors while getting Luft

live-no-home-folder = Lufti hoidmiseks pole kodukausta
live-no-app-data-folder = Lufti hoidmiseks pole kohalikku rakenduseandmete kausta
live-pointer-unreadable = Uusimat Lufti ei saa lugeda
live-not-published = Lufti pole seal avaldatud
live-checksum-unreadable = Kontrollsummafaili ei saa lugeda
live-checksum-not-read = Lufti kontrollsummat ei saanud lugeda: { $error }
live-download-damaged = Allalaaditu sai teel kahjustada. Proovige uuesti.
live-download-incomplete = Allalaaditud Luftist puudub { $file }
live-download-not-resumable = Server ei saa allalaadimist jätkata
live-not-signed = { $iso } pole allkirjastatud
live-signature-unreadable = Faili { $iso } allkirja ei saa lugeda
live-signature-wrong-key = Faili { $iso } pole allkirjastanud Lantharos
live-signature-other-iso = Allkiri on failile { $signed }, mitte failile { $iso }
live-iso-out-of-order = ISO failid pole järjekorras, mida Meet Luft lugeda oskab
live-iso-not-iso = See pole ISO-tõmmis
live-iso-no-root = ISO-l pole juurkausta
live-iso-no-joliet = ISO-l pole Jolieti nimesid
live-not-removed = Kausta { $path } ei saanud eemaldada: { $error }

## Errors while making a USB stick

stick-gone = Mälupulka pole enam. Ühendage see uuesti ja valige see taas.
stick-too-small = Luft ei mahu sellele mälupulgale. Kasutage vähemalt 4 GB mälupulka.
stick-damaged = ISO ei vasta oma kontrollsummale. See võis teel kahjustada saada.
stick-read-back-differs = Mälupulgalt ei loetud tagasi seda, mis sinna kirjutati. See võib olla kulunud, proovige teist.
stick-download-unavailable = Lufti ei saa praegu alla laadida: { $error }
stick-download-failed = Lufti ei saanud alla laadida: { $error }
stick-checksum-unreadable = ISO kontrollsummat ei saa lugeda: { $error }
stick-file-unreadable = Faili { $path } ei saa lugeda: { $error }
stick-iso-unreadable = ISO-d ei saa lugeda: { $error }
stick-iso-no-name = ISO-l pole nime
stick-iso-ended-early = ISO lõppes ootamatult
stick-iso-already-there = { $name } on juba mälupulgal.
stick-no-room = Mälupulgal pole Luftile ruumi. Vabastage sellel esmalt { $size } MB.
stick-older-not-removed = Vanemat Lufti ei saanud eemaldada: { $error }
stick-copy-stopped = Lufti kopeerimine mälupulgale katkes: { $error }
stick-not-opened = Mälupulka ei saanud avada: { $error }
stick-write-stopped = Mälupulgale kirjutamine katkes: { $error }
stick-not-synced = Mälupulk ei võtnud kõike vastu: { $error }
stick-read-back-failed = Mälupulka ei saanud tagasi lugeda: { $error }
stick-in-use = Mälupulk on veel kasutusel: { $error }
stick-device-in-use = { $device } on veel kasutusel: { $error }
stick-volume-not-opened = Mälupulga köidet ei saanud avada: { $error }
stick-volume-in-use = Mälupulk on veel kasutusel. Sulgege see, millel on sellel faile avatud, ja proovige uuesti ({ $error })
stick-not-dismounted = Windows ei saanud mälupulka vabastada: { $error }
stick-not-cleared = Windows ei saanud mälupulka tühjendada: { $error }
stick-not-refreshed = Windows ei saanud mälupulka uuesti vaadata: { $error }
stick-not-ventoy = See mälupulk ei kasuta enam Ventoyd.
stick-ventoy-not-opened = Ventoy partitsiooni ei saanud avada: { $error }
stick-ventoy-not-opened-windows = Windows ei saa Ventoy partitsiooni avada
stick-udisks-missing = Meet Luft vajab mälupulga kasutamiseks UDisksi: { $error }
