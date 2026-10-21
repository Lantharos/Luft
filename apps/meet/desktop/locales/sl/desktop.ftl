## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-bitni procesor Intel ali AMD
check-processor-x64-detail = Luft deluje na njem.
check-processor-arm = Procesor Arm
check-processor-arm-detail = Luft za zdaj deluje samo na procesorjih Intel in AMD.
check-processor-32-bit-windows = 32-bitni Windows
check-processor-32-bit-system = 32-bitni sistem
check-processor-32-bit-detail = Luft potrebuje 64-bitni procesor Intel ali AMD.
check-startup-uefi = Zaganja se z UEFI
check-startup-uefi-windows = Luft se zaganja na enak sodoben način.
check-startup-uefi-linux = Luft doda svoj zagonski vnos, { $system } pa se še naprej zaganja tako kot zdaj.
check-startup-bios = Zaganja se v starem načinu BIOS
check-startup-bios-windows = Luft potrebuje UEFI. Windows lahko preklopi z orodjem MBR2GPT, nato pa lahko UEFI vklopite v nastavitvah vdelane programske opreme.
check-startup-bios-linux = Luft potrebuje UEFI. Vklopite ga v nastavitvah vdelane programske opreme, skupaj s sistemom, ki je že tukaj, nato preverite znova.
check-startup-mbr = Disk uporablja staro particijsko tabelo
check-startup-mbr-windows = Luft potrebuje disk GPT. Windows ga lahko z orodjem MBR2GPT pretvori, ne da bi izgubili datoteke.
check-startup-mbr-linux = Luft za zagon potrebuje disk GPT.
check-startup-no-esp = Ni sistemske particije EFI
check-startup-no-esp-detail = Luft svoje zagonske datoteke doda k tistim, ki so že na sistemski particiji EFI, te pa ni.
check-startup-esp-full = Sistemska particija EFI je polna
check-startup-esp-full-detail = Luft tam za svoje zagonske datoteke potrebuje { $size } MB. Prostor običajno zasedajo stara jedra ali zagonski vnosi.
check-folder-fine = Particije ostanejo nespremenjene
check-folder-fine-detail = Luft se hrani kot datoteka na vašem disku { $filesystem } in se zaganja od tam.
check-folder-encrypted = Vaše datoteke so na šifriranem disku
check-folder-encrypted-detail = Luft se s šifriranega diska še ne more zagnati. Za preizkus raje uporabite ključek USB.
check-folder-combined = Vaše datoteke so na več particijah
check-folder-combined-detail = Luft se z LVM ali RAID še ne more zagnati. Za preizkus raje uporabite ključek USB.
check-folder-filesystem = Luft se ne more zagnati z { $filesystem }
check-folder-filesystem-detail = Zaganja se z diskov ext4, btrfs in XFS. Za preizkus raje uporabite ključek USB.
check-space-free = Prosto: { $size } GB
check-space-free-linux = Luft med preizkušanjem zasede približno { $size } GB.
check-space-up-to = Do { $size } GB za Luft
check-space-up-to-detail = Windows obdrži svoje datoteke in prostor za rast.
check-space-short = Premalo prostega prostora
check-space-short-windows = Luft potrebuje približno { $needed } GB prostora, ki ga Windows lahko odstopi. V sistemu Windows sprostite { $missing } GB, na primer s Čiščenjem diska, nato preverite znova.
check-space-short-linux = Luft za zagon potrebuje približno { $needed } GB. Sprostite { $missing } GB, nato preverite znova.
check-system-replaceable = Luft ga lahko nadomesti in ohrani vaše datoteke, račun in nastavitve.
check-system-single = Vaše datoteke so na isti particiji kot sistem, zato zamenjava z ohranitvijo datotek še ni podprta. Preizkus in namestitev Lufta delujeta.
check-system-encrypted = Sistem je šifriran, zato zamenjava z ohranitvijo datotek še ni podprta.
check-system-unknown = Disk tega sistema je razporejen tako, da ga Luft ob ohranitvi vaših datotek še ne more zamenjati.
check-encryption-off = Windows ni šifriran
check-encryption-off-detail = Namesti Luft lahko prebere njegove nastavitve in vaše naprave Bluetooth.
check-encryption-on = Windows je šifriran z BitLockerjem
check-encryption-on-detail = To ni težava. Windows prostor naredi sam, Meet Luft pa prenese tisto, česar Luft z zaklenjenega diska ne more prebrati. Za vsak primer imejte obnovitveni ključ pri roki.
check-encryption-changing = BitLocker še šifrira ali dešifrira
check-encryption-changing-detail = Počakajte, da Windows konča, nato se vrnite. Napredek vidite v Nastavitvah, pod Šifriranje naprave.
check-fast-startup-on = Hitri zagon je vklopljen
check-fast-startup-on-detail = Windows namesto zaustavitve preide v mirovanje, zato njegov disk ostane zaklenjen. Meet Luft ga pred namestitvijo ponudi izklopiti.
check-fast-startup-off = Hitri zagon je izklopljen
check-fast-startup-off-detail = Windows se povsem zaustavi.
check-secure-boot-on = Secure Boot je vklopljen
check-secure-boot-on-detail = Lahko ostane vklopljen. Luft enkrat, na modrem zaslonu, vpraša, ali lahko doda svoj ključ.
check-secure-boot-off = Secure Boot je izklopljen
check-secure-boot-off-detail = Luft deluje tudi brez njega, vendar ga potrebujejo igre z zaščito pred goljufanjem. { $turningOn }
check-secure-boot-restart-into = Meet Luft lahko računalnik znova zažene v nastavitve vdelane programske opreme, kjer je pod { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft lahko računalnik znova zažene v nastavitve vdelane programske opreme, kjer je običajno pod Security ali Boot.
check-secure-boot-turn-on = Za vklop znova zaženite računalnik in pritisnite { $key }, ko se prikaže logotip { $maker }, nato pojdite na { $place }.
check-secure-boot-turn-on-anywhere = Za vklop odprite nastavitve vdelane programske opreme med zagonom računalnika in poglejte pod Security ali Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, nato Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, nato Secure Boot
check-firmware-place-security-or-advanced = Security ali Advanced, nato Secure Boot Configuration
check-firmware-place-security-or-boot = Security ali Boot, nato Secure Boot
check-firmware-place-boot = Boot, nato Secure Boot
check-firmware-place-settings = Settings, nato Security, nato Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 na ThinkPadu)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 ali Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = tipko za povečanje glasnosti

## More of the computer's hardware

check-tpm-detail = Šifriran Luft se lahko ob zagonu računalnika odklene sam.
check-tpm-missing = Ni TPM 2.0
check-tpm-missing-detail = Če Luft šifrirate, ob vsakem zagonu vpraša za šifrirno geslo.
check-graphics = Grafika
check-graphics-detail = Deluje brez dodatnih nastavitev.
check-graphics-nvidia = Luft se namesti z gonilnikom podjetja NVIDIA.
check-wifi-missing = Ni vmesnika Wi-Fi
check-wifi-missing-detail = V Luftu uporabite omrežni kabel ali pa delajte brez povezave.
check-wifi-detail = Deluje v Luftu.
check-wifi-broadcom = Nekateri čipi Wi-Fi Broadcom potrebujejo gonilnik, ki ga Luft nima. Imejte pri roki omrežni kabel ali telefon za internetno povezavo prek USB.
check-start-entries = { $count ->
    [one] { $count } star zagonski vnos
    [two] { $count } stara zagonska vnosa
    [few] { $count } stari zagonski vnosi
   *[other] { $count } starih zagonskih vnosov
}
check-start-entries-detail = { $count ->
    [one] { $names } kaže na sistem, ki ga v tem računalniku ni več. Lahko ga pospravite.
    [two] { $names } kažeta na sistema, ki ju v tem računalniku ni več. Lahko ju pospravite.
    [few] { $names } kažejo na sisteme, ki jih v tem računalniku ni več. Lahko jih pospravite.
   *[other] { $names } kažejo na sisteme, ki jih v tem računalniku ni več. Lahko jih pospravite.
}
check-download-unavailable = Lufta trenutno ni mogoče prenesti
check-download-unavailable-detail = Meet Luft prenese približno 3 GB. Preverite, ali ste povezani z internetom, in preverite znova ali pa uporabite ISO za Luft, ki ga že imate.

## Choosing a Luft ISO file

iso-dialog-title = Izberite ISO za Luft
iso-dialog-filter = ISO za Luft

## Saving the logs from trying Luft

logs-file-name = Dnevniki Lufta { $name }
logs-no-desktop = Namizja ni bilo mogoče najti
logs-not-saved = Dnevnikov preizkusa Lufta ni bilo mogoče shraniti: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Pomočnik aplikacije Meet Luft se ni zagnal: { $error }
helper-not-allowed = Aplikacija Meet Luft ni dobila dovoljenja za delo z diskom
helper-stopped = Pomočnik aplikacije Meet Luft se je ustavil
helper-stopped-because = Pomočnik aplikacije Meet Luft se je ustavil: { $error }
helper-pipe-failed = Povezava s pomočnikom aplikacije Meet Luft ni uspela: { $error }
helper-pipe-hijacked = { $pipe } ni odprl pomočnik aplikacije Meet Luft, temveč nekaj drugega
helper-record-not-saved = Zapisa o tem, kar je bilo ustvarjeno, ni bilo mogoče shraniti: { $error }
helper-no-room-yet = Najprej naredite prostor za Luft.
helper-not-ready-linux = Najprej pripravite Luft.
helper-not-ready-to-start-windows = Luft še ni pripravljen na zagon. Najprej zanj naredite prostor.
helper-not-ready-to-start-linux = Luft še ni pripravljen na zagon. Najprej ga pripravite.
helper-update-unfinished = Posodabljanje Lufta se ni končalo. Najprej ga znova posodobite.
helper-room-too-small = Luft potrebuje več prostora.
helper-room-shortfall = Windows lahko odstopi { $available } GB, Luft pa potrebuje { $needed } GB.
helper-box-shortfall = Windows lahko odstopi še { $available } GB, izbrane stvari pa potrebujejo { $needed } GB.
helper-bluetooth-unreadable = Nastavitev Bluetooth v sistemu Windows ni bilo mogoče odpreti
helper-registry-not-opened = Ključa { $key } ni bilo mogoče odpreti: { $error }
helper-registry-not-changed = Vrednosti { $value } ni bilo mogoče spremeniti: { $error }
helper-registry-not-saved = Datoteke { $file } ni bilo mogoče shraniti: { $error }
helper-restart-failed = Računalnik se ni znova zagnal
helper-windows-restart-failed = Windows se ni znova zagnal: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Ta računalnik se ne zaganja z UEFI
firmware-variable-unreadable = Spremenljivke { $name } ni bilo mogoče prebrati iz vdelane programske opreme: { $error }
firmware-variable-not-saved = Spremenljivke { $name } ni bilo mogoče shraniti v vdelano programsko opremo: { $error }
firmware-entries-full = V vdelani programski opremi ni prostora za še en zagonski vnos
firmware-entry-kept = Windows je ohranil zagonski vnos { $entry }

## Errors about drives and partitions

drive-list-failed = Diskov ni bilo mogoče našteti: { $error }
drive-of-path-unknown = Ni bilo mogoče ugotoviti, na katerem disku je { $path }
drive-windows-folder-missing = Mape sistema Windows ni bilo mogoče najti
drive-windows-drive-missing = Diska sistema Windows ni bilo mogoče najti
drive-windows-drive-missing-because = Diska sistema Windows ni bilo mogoče najti: { $error }
drive-windows-partition-missing = Particije sistema Windows ni bilo mogoče najti
drive-volume-missing = Nosilca { $path } ni bilo mogoče najti
drive-storage-error = { $what } (napaka shrambe sistema Windows { $code })
drive-shrink-size-unknown = Windows ni mogel ugotoviti, koliko lahko zmanjša svojo particijo
drive-grow-size-unknown = Windows ni mogel ugotoviti, koliko lahko poveča svojo particijo
drive-resize-failed = Windows ni mogel spremeniti velikosti svoje particije
drive-create-failed = Windows ni mogel ustvariti particije za Luft
drive-hide-failed = Windows ni mogel skriti nove particije v Raziskovalcu
drive-format-failed = Windows ni mogel formatirati nove particije
drive-remove-failed = Windows ni mogel odstraniti ene od Luftovih particij
drive-new-partition-missing = Nove particije ni bilo mogoče najti
drive-new-partition-no-volume = Nova particija nima nosilca
drive-start-no-guid = Zagonska particija nima GUID-a
drive-live-no-guid = Particija, s katere se zažene Luft, nima GUID-a
drive-box-no-guid = Selitvena škatla nima GUID-a
drive-guid-unreadable = GUID-a particije ni mogoče prebrati
drive-not-gpt = Particijska tabela diska ni GPT
drive-start-no-volume = Zagonska particija nima nosilca
drive-live-no-volume = Luftova particija nima nosilca
drive-new-live-no-volume = Nova Luftova particija nima nosilca
drive-partitions-not-noted = Luftovih particij ni v zapisih aplikacije Meet Luft
drive-partitions-gone = Luftove particije so izginile
drive-partition-gone = Particija je izginila
drive-start-partition-foreign = Luftove zagonske particije ni ustvarila aplikacija Meet Luft
drive-start-partition-gone = Luftove zagonske particije ni več
drive-start-partition-not-listed = Luftove zagonske particije ni v particijski tabeli
drive-no-esp = Ta računalnik nima sistemske particije EFI
drive-esp-full = Sistemska particija EFI je preveč zasedena za Luftove zagonske datoteke.
drive-esp-not-opened = Sistemske particije EFI ni bilo mogoče odpreti
drive-esp-file-unreadable = Datoteke { $file } na sistemski particiji EFI ni mogoče prebrati
drive-esp-no-drive = Sistemska particija EFI ni na nobenem disku
drive-esp-no-guid = Sistemska particija EFI nima GUID-a
drive-no-uuid = Disk, na katerem se hrani Luft, nima UUID-ja
drive-folder-unreadable = Luft se ne more zagnati z diska, na katerem so vaše datoteke.
drive-folder-not-startable = Z mape { $folder } ni mogoče zagnati

## Errors while getting Luft

live-no-home-folder = Ni domače mape, v kateri bi se hranil Luft
live-no-app-data-folder = Ni mape z lokalnimi podatki aplikacij, v kateri bi se hranil Luft
live-pointer-unreadable = Najnovejšega Lufta ni mogoče prebrati
live-not-published = Luft tam ni objavljen
live-checksum-unreadable = Datoteke s kontrolno vsoto ni mogoče prebrati
live-checksum-not-read = Kontrolne vsote Lufta ni bilo mogoče prebrati: { $error }
live-download-damaged = Prenos se je med potjo poškodoval. Poskusite znova.
live-download-incomplete = V prenesenem Luftu manjka { $file }
live-download-not-resumable = Strežnik ne more nadaljevati prenosa
live-not-signed = { $iso } ni podpisan
live-signature-unreadable = Podpisa datoteke { $iso } ni mogoče prebrati
live-signature-wrong-key = { $iso } ni podpisal Lantharos
live-signature-other-iso = Podpis je za { $signed }, ne za { $iso }
live-iso-out-of-order = Datoteke v ISO niso v vrstnem redu, ki ga Meet Luft zna prebrati
live-iso-not-iso = To ni slika ISO
live-iso-no-root = ISO nima korenske mape
live-iso-no-joliet = ISO nima imen Joliet
live-not-removed = { $path } ni bilo mogoče odstraniti: { $error }

## Errors while making a USB stick

stick-gone = Ključka ni več. Znova ga priključite in ga znova izberite.
stick-too-small = Luft ne gre na ta ključek. Uporabite ključek z vsaj 4 GB.
stick-damaged = ISO se ne ujema s svojo kontrolno vsoto. Morda se je med potjo poškodoval.
stick-read-back-differs = S ključka se ni prebralo to, kar je bilo nanj zapisano. Morda je izrabljen, zato poskusite z drugim.
stick-download-unavailable = Lufta trenutno ni mogoče prenesti: { $error }
stick-download-failed = Lufta ni bilo mogoče prenesti: { $error }
stick-checksum-unreadable = Kontrolne vsote za ISO ni mogoče prebrati: { $error }
stick-file-unreadable = { $path } ni mogoče prebrati: { $error }
stick-iso-unreadable = ISO ni mogoče prebrati: { $error }
stick-iso-no-name = ISO nima imena
stick-iso-ended-early = ISO se je končal prezgodaj
stick-iso-already-there = { $name } je že na ključku.
stick-no-room = Na ključku ni dovolj prostora za Luft. Najprej na njem sprostite { $size } MB.
stick-older-not-removed = Starejšega Lufta ni bilo mogoče odstraniti: { $error }
stick-copy-stopped = Kopiranje Lufta na ključek se je ustavilo: { $error }
stick-not-opened = Ključka ni bilo mogoče odpreti: { $error }
stick-write-stopped = Zapisovanje na ključek se je ustavilo: { $error }
stick-not-synced = Ključek ni shranil vsega: { $error }
stick-read-back-failed = Ključka ni bilo mogoče prebrati za preverjanje: { $error }
stick-in-use = Ključek je še v uporabi: { $error }
stick-device-in-use = { $device } je še v uporabi: { $error }
stick-volume-not-opened = Nosilca na ključku ni bilo mogoče odpreti: { $error }
stick-volume-in-use = Ključek je še v uporabi. Zaprite, kar ima na njem odprte datoteke, in poskusite znova ({ $error })
stick-not-dismounted = Windows ni mogel sprostiti ključka: { $error }
stick-not-cleared = Windows ni mogel počistiti ključka: { $error }
stick-not-refreshed = Windows ni mogel znova pregledati ključka: { $error }
stick-not-ventoy = Ta ključek ne uporablja več Ventoyja.
stick-ventoy-not-opened = Particije Ventoy ni bilo mogoče odpreti: { $error }
stick-ventoy-not-opened-windows = Windows ne more odpreti particije Ventoy
stick-udisks-missing = Meet Luft za uporabo ključka potrebuje UDisks: { $error }
